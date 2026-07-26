#!/usr/bin/env node
/**
 * probe-tailor-sign.mjs — s1082 (art-batch-tailor-extras drain evidence)
 *
 * The tailor's sign is a THREE.Sprite that STARTS as a drawn text plaque
 * ("THE TAILOR'S / WARDROBE") and is overwritten by the illustrated art only if
 * `tailorSignUrl` resolves (TownScene.ts:3201). Before this drain the glob
 * matched no file, so the plaque was all a player ever saw. No e2e spec asserts
 * which of the two is on screen, so this probe walks to the wagon and shoots it
 * on both viewports; run it with the art present and absent to get a real
 * before/after rather than a green that would pass either way (F-1080-B).
 *
 * Usage: node scripts/probe-tailor-sign.mjs <label> [baseURL]
 */
import { mkdir } from 'node:fs/promises';
import { chromium, devices } from '@playwright/test';

const label = process.argv[2] ?? 'live';
const baseURL = process.argv[3] ?? 'http://127.0.0.1:5241';
const outDir = 'reviews/shots-tailor-extras';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const [name, viewport] of [
  ['desktop', { width: 1280, height: 800 }],
  ['mobile390', devices['Pixel 5'].viewport],
]) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('gr.profile.v2', JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem('gr.profile.v2.robin.gr.town.name.v1', 'Prosper');
    localStorage.setItem('gr.profile.v2.robin.gr.firstClaim.done.v1', '1');
  });

  // PLAIN boot — no ?debug — because the question is what a normal player sees.
  // Enter the town THROUGH THE MENU, exactly as a player does. A `#town` hash
  // does not enter it: the first attempt silently shot the start menu, and the
  // .catch() below must therefore NOT be allowed to hide a failed wait.
  await page.goto(`${baseURL}/`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20, null, { timeout: 30_000 });

  // Stand in front of the wagon so the sign fills a usable part of the frame.
  await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.teleport?.(0, -6));
  await page.waitForTimeout(1200);

  const file = `${outDir}/tailor-sign-${label}-${name}.png`;
  await page.screenshot({ path: file });
  results.push({ viewport: name, file, consoleErrors, pageErrors });
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
