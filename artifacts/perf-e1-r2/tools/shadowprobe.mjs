// Does parking `sun.shadow.autoUpdate` at true dark actually buy anything? The claim is that
// three.js keeps running a full depth pass over every caster for a sun the night palette has
// already lerped to intensity 0. This drives Night Shift to darkness 1 and reads the renderer's
// own call counter, which INCLUDES the shadow pass -- so branch vs base at the same wave answers
// the question in draw calls rather than in argument.
import { chromium } from '@playwright/test';

const url = process.argv[2];
const label = process.argv[3] ?? url;
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push(e.message));

await page.goto(`${url}/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&tier=full&seed=shadowprobe`);
await page.waitForFunction(() => Boolean(window.__GR_TEST__), { timeout: 60000 });
const begin = page.getByRole('button', { name: 'Begin' });
if (await begin.isVisible().catch(() => false)) await begin.click();
const briefing = page.getByTestId('contract-briefing-dismiss');
if (await briefing.isVisible().catch(() => false)) await briefing.click();
await page.waitForFunction(() => {
  const c = document.querySelector('#game-canvas');
  return c?.dataset.terrain3dPilotState === 'ready' && c?.dataset.run3dPilotState === 'ready';
}, { timeout: 90000 });

await page.evaluate(() => window.__GR_TEST__.setWave(10));
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift?.darkness ?? 0) >= 0.999, { timeout: 30000 });
await page.waitForTimeout(500);

const dark = await page.evaluate(() => ({
  darkness: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift?.darkness,
  census: window.__GR_TEST__.renderCensus?.().renderer,
}));
// And at full day, where the sun DOES contribute and the pass must still run.
await page.evaluate(() => window.__GR_TEST__.setWave(1));
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift?.darkness ?? 1) <= 0.01, { timeout: 30000 });
await page.waitForTimeout(500);
const day = await page.evaluate(() => ({
  darkness: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift?.darkness,
  census: window.__GR_TEST__.renderCensus?.().renderer,
}));

console.log(JSON.stringify({ label, dark, day, errors: errs.slice(0, 5) }, null, 2));
await browser.close();
