import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, 'auth.json');

async function setup() {
  console.log('=== Claude.ai Auth Setup (auto-save) ===');
  console.log('A browser window will open. Log into claude.ai.');
  console.log('When you reach the chat (URL contains /new or /chat), it saves automatically.\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto('https://claude.ai/login');
  console.log('Browser opened. Waiting for you to finish login...');

  // Poll until we land on a logged-in page (not login/logout), then confirm the
  // composer is present, then save. Up to 5 minutes.
  const deadline = Date.now() + 5 * 60 * 1000;
  let saved = false;
  while (Date.now() < deadline) {
    const url = page.url();
    const loggedIn = /claude\.ai\/(new|chat|recents|project)/.test(url) &&
                     !/login|logout/.test(url);
    if (loggedIn) {
      // give the SPA a moment to hydrate the session cookies
      await page.waitForTimeout(2500);
      await context.storageState({ path: AUTH_FILE });
      console.log(`\nAuth saved to ${AUTH_FILE}`);
      saved = true;
      break;
    }
    await page.waitForTimeout(1500);
  }

  if (!saved) console.error('Timed out waiting for login — nothing saved.');
  await browser.close();
  process.exit(saved ? 0 : 1);
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
