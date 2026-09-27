import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const [name, options] of [
    ['desktop', { viewport: { width: 1280, height: 800 } }],
    ['mobile', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
  ]) {
    const context = await browser.newContext(options);
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      await page.goto('http://127.0.0.1:5317/');
      await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 15000 });
      await page.screenshot({ path: fileURLToPath(new URL(`plain-${name}.png`, import.meta.url)) });
      results.push({ name, viewport: options.viewport, url: page.url(), errors });
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  await writeFile(new URL('plain-boots.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
}
console.log(JSON.stringify(results));
