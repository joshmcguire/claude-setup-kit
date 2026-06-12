import { chromium } from 'playwright';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, 'auth.json');
const OUTPUT_FILE = path.join(__dirname, 'output.md');

const TIMEOUT = 300_000; // 5 min max wait for response (long research answers)
const POLL_INTERVAL = 2_000; // check every 2s if response is done

async function research(query) {
  if (!query) {
    console.error('Usage: node research.js "your research question"');
    process.exit(1);
  }

  if (!existsSync(AUTH_FILE)) {
    console.error('No auth.json found. Run setup first: node setup-auth.js');
    process.exit(1);
  }

  console.error(`Researching: ${query.substring(0, 100)}...`);

  // Launch headed (not headless) to bypass Cloudflare detection.
  // xvfb-run wraps this so no visible window appears on your desktop.
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-popup-blocking',
    ],
  });

  const context = await browser.newContext({
    storageState: AUTH_FILE,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  // Mask the webdriver flag that Cloudflare checks
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const page = await context.newPage();

  try {
    // Navigate to Claude.ai - new chat
    console.error('Opening claude.ai...');
    await page.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Handle Cloudflare challenge if present
    await handleCloudflare(page);

    // Wait for the chat interface to load
    console.error('Waiting for chat interface...');
    await page.waitForTimeout(3000);

    // Take a snapshot to see what we got
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.error(`Page: ${pageTitle} | URL: ${pageUrl}`);

    // If redirected to login, auth has expired
    if (pageUrl.includes('/login') || pageUrl.includes('/auth')) {
      throw new Error('Auth expired — re-run: node ~/.claude/research/setup-auth.js');
    }

    // Select Opus model
    console.error('Selecting Opus model...');
    await selectOpusModel(page);

    // Find and fill the message input
    console.error('Sending query...');
    await sendMessage(page, query);

    // Wait for the full response
    console.error('Waiting for response (this may take a few minutes)...');
    const responseText = await waitForResponse(page);

    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Got empty response from Claude');
    }

    // Save to output file
    const output = `# Research Results\n\n**Query:** ${query}\n\n**Date:** ${new Date().toISOString().split('T')[0]}\n\n---\n\n${responseText}`;
    writeFileSync(OUTPUT_FILE, output, 'utf-8');

    // Print the response to stdout so Claude Code can capture it
    console.log(responseText);

    console.error(`\nResponse saved to ${OUTPUT_FILE}`);
    console.error(`Response length: ${responseText.length} chars`);

    // Refresh auth state (cookies may have been updated)
    await context.storageState({ path: AUTH_FILE });
  } catch (err) {
    const screenshotPath = path.join(__dirname, 'debug-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.error(`Error: ${err.message}`);
    console.error(`Debug screenshot saved to ${screenshotPath}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function handleCloudflare(page) {
  const title = await page.title();
  if (title.includes('Just a moment') || title.includes('Cloudflare')) {
    console.error('Cloudflare challenge detected, waiting for it to resolve...');
    // Cloudflare's turnstile usually resolves in ~5-10s for non-bot traffic
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: 30_000 }
    );
    console.error('Cloudflare challenge passed');
    await page.waitForTimeout(2000);
  }
}

async function selectOpusModel(page) {
  try {
    // Claude.ai has a model selector — typically a button showing current model name
    // Try clicking it by various selectors
    const modelSelectors = [
      'button[data-testid="model-selector"]',
      'button:has-text("Sonnet")',
      'button:has-text("Haiku")',
      'button:has-text("Opus")',
      'button:has-text("Claude")',
      '[class*="model-selector"]',
      '[class*="ModelSelector"]',
    ];

    let clicked = false;
    for (const sel of modelSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        // Check if it's already on Opus
        const text = await btn.textContent().catch(() => '');
        if (text.includes('Opus')) {
          console.error('Already on Opus model');
          return;
        }
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.error('Model selector not found — proceeding with default model');
      return;
    }

    await page.waitForTimeout(1000);

    // Now find and click Opus in the dropdown
    const opusSelectors = [
      'text=Opus',
      '[data-testid*="opus"]',
      '[role="option"]:has-text("Opus")',
      'li:has-text("Opus")',
      'div:has-text("Opus"):not(:has(div))',
    ];

    for (const sel of opusSelectors) {
      const option = page.locator(sel).first();
      if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await option.click();
        console.error('Opus model selected');
        await page.waitForTimeout(500);
        return;
      }
    }

    // Close the dropdown if Opus wasn't found
    await page.keyboard.press('Escape');
    console.error('Opus option not found in dropdown — using current model');
  } catch (err) {
    console.error(`Model selection skipped: ${err.message}`);
  }
}

async function sendMessage(page, query) {
  // Find the input field — Claude.ai uses a contenteditable div (ProseMirror)
  const inputSelectors = [
    'div.ProseMirror[contenteditable="true"]',
    'div[contenteditable="true"]',
    'fieldset div[contenteditable="true"]',
    'textarea',
    '[data-testid="chat-input"]',
  ];

  let input = null;
  for (const sel of inputSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 3_000 }).catch(() => false)) {
      input = el;
      break;
    }
  }

  if (!input) {
    throw new Error('Could not find message input field');
  }

  await input.click();
  await page.waitForTimeout(300);

  // Type the query using keyboard to handle ProseMirror properly
  await page.keyboard.type(query, { delay: 10 });
  await page.waitForTimeout(500);

  // Submit — try send button first, then Enter
  const sendBtn = page.locator('button[aria-label="Send Message"], button[data-testid="send-button"], button:has(svg):near(div[contenteditable])').last();
  if (await sendBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await sendBtn.click();
    console.error('Query sent via button');
  } else {
    await page.keyboard.press('Enter');
    console.error('Query sent via Enter');
  }

  await page.waitForTimeout(2000);
}

async function waitForResponse(page) {
  const startTime = Date.now();

  // Initial wait for response to begin
  await page.waitForTimeout(5000);

  let lastText = '';
  let stableCount = 0;
  const STABLE_THRESHOLD = 4; // text must be stable for 4 consecutive checks (8 seconds)

  while (Date.now() - startTime < TIMEOUT) {
    const responseText = await page.evaluate(() => {
      // Strategy 1: Look for assistant message containers
      const assistantSelectors = [
        '[data-testid="assistant-message"]',
        '[data-testid="chat-message-assistant"]',
        '[class*="assistant-message"]',
        '[class*="AssistantMessage"]',
      ];

      for (const sel of assistantSelectors) {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          const last = elements[elements.length - 1];
          const text = last.innerText?.trim();
          if (text && text.length > 20) return text;
        }
      }

      // Strategy 2: Look for message content in markdown/prose containers
      // Claude.ai wraps responses in a specific structure
      const contentSelectors = [
        '[class*="markdown"]',
        '[class*="prose"]',
        '.break-words',
        '[class*="MessageContent"]',
        '[class*="message-content"]',
      ];

      let longestText = '';
      for (const sel of contentSelectors) {
        const elements = document.querySelectorAll(sel);
        for (let i = elements.length - 1; i >= 0; i--) {
          const text = elements[i].innerText?.trim();
          if (text && text.length > longestText.length && text.length > 50) {
            longestText = text;
          }
        }
      }
      if (longestText) return longestText;

      // Strategy 3: Look at the conversation flow — the last big text block
      // that appeared after the user's message
      const allBlocks = document.querySelectorAll('div[class], article, section');
      let best = '';
      for (const el of allBlocks) {
        // Skip tiny elements and the input area
        if (el.querySelector('[contenteditable="true"]')) continue;
        const text = el.innerText?.trim();
        if (text && text.length > best.length && text.length > 100) {
          // Avoid grabbing the entire page
          if (text.length < 50000) best = text;
        }
      }
      return best;
    });

    if (responseText && responseText.length > 0) {
      if (responseText === lastText) {
        stableCount++;

        if (stableCount >= STABLE_THRESHOLD) {
          // Check if still streaming by looking for stop button or streaming indicators
          const isStreaming = await page.locator(
            'button:has-text("Stop"), [aria-label="Stop generating"], [data-is-streaming="true"], button[class*="stop"]'
          ).isVisible({ timeout: 500 }).catch(() => false);

          if (!isStreaming) {
            console.error(`Response complete (${responseText.length} chars, stabilized after ${Math.round((Date.now() - startTime) / 1000)}s)`);
            return responseText;
          }
          // Still streaming, keep waiting
          stableCount = Math.floor(STABLE_THRESHOLD / 2); // partial reset
        }
      } else {
        stableCount = 0;
        lastText = responseText;
        // Log progress
        if (responseText.length > 100) {
          console.error(`  ...receiving (${responseText.length} chars so far)`);
        }
      }
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }

  // Timeout — return whatever we have
  if (lastText) {
    console.error('Warning: response may be incomplete (timed out after 5 min)');
    return lastText;
  }

  throw new Error('Timed out waiting for response — no text received');
}

// Parse args
const query = process.argv.slice(2).join(' ');
research(query);
