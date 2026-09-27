import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const [name, width, height] of [['desktop',1280,800], ['mobile',390,844]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://127.0.0.1:5303/');
    await page.getByTestId('profile-name-input').waitFor({ timeout: 60000 });
    await page.getByTestId('profile-name-input').fill('Retention Check');
    await page.getByTestId('profile-create').click();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 60, null, { timeout:60000 });
    await page.screenshot({ path: `artifacts/play-proofs-evidence-retention-1/boot-${name}.png` });
    results.push({ name, width, height, url:page.url(), errors });
    assert.deepEqual(errors, []); await context.close();
  }
} finally {
  await browser.close();
  await writeFile('artifacts/play-proofs-evidence-retention-1/boots.json', JSON.stringify(results,null,2)+'\n');
}
