#!/usr/bin/env node
/**
 * beauty-baron-probe — a raw playwright driver for the e1-baron beauty shift.
 *
 * The spec harness (e2e/beauty-baron.spec.ts) renders the board; this drives one
 * pose against an already-running `npm run dev` so a question can be answered in
 * ~10 s instead of a 60 s spec cycle. Used to establish WHY the fort half of the
 * map reads near-black (measured, not assumed).
 *
 * Usage: node logs/session-scratch/beauty-baron-probe.mjs <contract> <out.png>
 */
import { chromium } from '@playwright/test';

const contract = process.argv[2] ?? 'e1-baron';
const out = process.argv[3] ?? `/tmp/probe-${contract}.png`;
const base = process.env.GR_BASE ?? 'http://127.0.0.1:5188';

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(`${base}/?debug&contract=${contract}&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&tier=full&seed=beauty-probe`);
await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready', { timeout: 20_000 }).catch(() => {});

for (const [key, value] of Object.entries({
  'camera.lag': 0.001,
  'camera.lookAhead': 0,
  'camera.downScreenLookOffset': 0,
  'camera.offset.y': Number(process.env.GR_CAM_Y ?? 25.75),
  'camera.offset.z': Number(process.env.GR_CAM_Z ?? 21.65),
})) await page.evaluate(([k, v]) => window.__GR_TEST__?.setBalance(k, v), [key, value]);
await page.evaluate((z) => window.__GR_TEST__?.teleport(0, z), Number(process.env.GR_HERO_Z ?? 8.65));
await page.waitForTimeout(700);

// Clear the briefing card and the HUD chrome so the frame is the WORLD.
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await page.addStyleTag({ content: '.hud, .hud-root, .announcement, .contract-briefing, [class^="hud"], [class*=" hud"] { opacity: 0 !important; }' });
await page.waitForTimeout(300);

const state = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  const d = window.__THREE_GAME_DIAGNOSTICS__;
  return {
    pilot: canvas?.dataset.terrain3dPilotState,
    source: canvas?.dataset.terrain3dPilotRenderSource,
    landmarks: canvas?.dataset.terrain3dPilotLandmarks,
    light: d?.light ?? null,
    renderer: d?.renderer ?? null,
    tier: d?.performanceTier ?? null,
  };
});
console.log(JSON.stringify({ contract, errors, state }, null, 1));
await page.screenshot({ path: out, fullPage: false });
await browser.close();
