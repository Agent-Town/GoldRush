import { chromium, devices, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = new URL('./', import.meta.url);
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const [project, options] of [
    ['desktop-chrome', { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }],
    ['mobile-chrome', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const consoleErrors = [], pageErrors = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('http://127.0.0.1:5188/');
    await expect(page.getByTestId('profile-title').getByTestId('music-toggle')).toBeVisible();
    await expect(page.getByTestId('start-menu-settings')).toHaveCount(0);
    await page.screenshot({ path: fileURLToPath(new URL(`first-boot-${project}.png`, dir)) });
    await page.getByTestId('profile-name-input').fill('Audio Check');
    await page.getByTestId('profile-create').click();
    await expect(page.getByTestId('town-ui')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('town-exit').click();
    await expect(page.getByTestId('start-menu-settings')).toBeVisible();
    await page.goto('http://127.0.0.1:5188/?seed=audio-plain');
    await expect(page.getByTestId('hud-vitals')).toBeVisible({ timeout: 30_000 });
    results.push({ project, surfaces: ['first-boot', 'town', 'returning-menu', 'run'], consoleErrors, pageErrors });
    await context.close();
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  }
} finally {
  await writeFile(new URL('plain-boots.json', dir), JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}
