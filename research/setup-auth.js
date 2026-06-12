import { chromium } from 'playwright';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, 'auth.json');

async function setup() {
  console.log('=== Claude.ai Auth Setup ===');
  console.log('A browser window will open. Log into claude.ai manually.');
  console.log('Once you see the chat interface, press Enter in this terminal.\n');

  if (existsSync(AUTH_FILE)) {
    console.log('Note: auth.json already exists and will be overwritten.\n');
  }

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

  console.log('Browser opened to claude.ai/login');
  console.log('Log in with your account, then press Enter here when you see the chat...');

  // Wait for user to press Enter
  await new Promise(resolve => {
    process.stdin.setRawMode?.(false);
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  // Save the auth state
  await context.storageState({ path: AUTH_FILE });
  console.log(`\nAuth saved to ${AUTH_FILE}`);

  await browser.close();
  console.log('Done! You can now use /research in Claude Code.');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
