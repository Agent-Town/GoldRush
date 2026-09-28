// warm.mjs <baseURL>: boot the game once in a real browser so the dev server's runtime dependency
// optimisation ("optimized dependencies changed. reloading") happens here and not inside a measured
// test. Both servers log "Failed to run dependency scan. Skipping dependency pre-bundling" (a store
// page under assets/pilots/hero-3d names a tsconfig that is not there), so every fresh server
// discovers three.js and friends on its first page load; batches B and D saw that race leave the
// branch server failing "Failed to fetch dynamically imported module: /src/game/Game.ts" for minutes.
import { chromium } from '@playwright/test';

const base = process.argv[2];
const browser = await chromium.launch({ channel: 'chromium' });
let booted = false;
for (let attempt = 1; attempt <= 5 && !booted; attempt += 1) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const started = Date.now();
  try {
    await page.goto(`${base}/?debug&contract=e1-night-shift&nowaves&nolevel&seed=tt2-warm`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 30_000 });
    booted = true;
    console.log(`warm: booted on attempt ${attempt} in ${Date.now() - started} ms`);
  } catch (error) {
    console.log(`warm: attempt ${attempt} did not boot in ${Date.now() - started} ms (${String(error.message).split('\n')[0]})`);
  }
  await page.close();
}
await browser.close();
process.exit(booted ? 0 : 1);
