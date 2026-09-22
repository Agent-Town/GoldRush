// F-FC2-5 scope 3 — the plain boot and the boards.
// A PLAIN boot of `e8-far-side` (no `?debug`, only the contract/era the menu would hand it) at
// 1280 and 390: zero console/page errors, the landmark load state and mount count from the
// canvas dataset, plus a board shot framed on the crater rim beside the plate.
// Usage: node .../plain-board.mjs <label>   (writes shots/<label>-plain-{1280,390}.png and
//        shots/<label>-board-{1280,390}.png, and prints the dataset + error rows)
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const label = process.argv[2] ?? 'after';
const out = 'artifacts/f-fc2-5-cradle-to-rim';
mkdirSync(`${out}/shots`, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const width of [1280, 390]) {
    // 1. THE PLAIN BOOT — the way a player arrives, no debug seam at all.
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    // The keys the game itself writes when a player picks the map, copied from
    // `e2e/e8-far-side-probe.spec.ts:96` — without them `?contract=` alone falls back to the
    // Claim, which is how the first capture of this board read 5 mounts instead of 10.
    await page.addInitScript(() => {
      sessionStorage.setItem('gr.contract.launch.v1', 'e8-far-side');
      localStorage.setItem('gr.activeEpoch.v1', 'epoch-8-orbital');
      localStorage.setItem('gr.scores.v2', JSON.stringify([{ waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e8-mare-claim' }]));
    });
    await page.goto(`http://127.0.0.1:5307/?contract=e8-far-side`);
    await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 60_000 });
    const activeId = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId);
    if (activeId !== 'e8-far-side') throw new Error(`plain boot landed on ${activeId}`);
    if (await page.evaluate(() => window.__GR_TEST__ !== undefined)) throw new Error('the debug seam is live in a plain boot');
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible()) await begin.click();
    await page.waitForTimeout(1500);
    const dataset = await page.evaluate(() => ({ ...document.querySelector('#game-canvas').dataset }));
    await page.screenshot({ path: `${out}/shots/${label}-plain-${width}.png` });

    // 2. THE BOARD — the same run, camera put on the crater rim so the cradle, the plate and the
    // listening post are all in frame. `?debug` is needed for the teleport seam, so this is a
    // second page: the plain boot above is the one that proves the error count.
    const board = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, isMobile: width === 390, hasTouch: width === 390 });
    const boardErrors = [];
    board.on('console', (m) => { if (m.type() === 'error') boardErrors.push(m.text()); });
    board.on('pageerror', (e) => boardErrors.push(e.message));
    await board.goto(`http://127.0.0.1:5307/?debug&epoch=epoch-8-orbital&contract=e8-far-side&nowaves&nolevel&nokill&nopause&nosteal&nowreck&tier=full&seed=f-fc2-5-rim`);
    await board.waitForFunction(() => window.__GR_TEST__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 60_000 });
    const boardBegin = board.getByTestId('contract-briefing-dismiss');
    if (await boardBegin.isVisible()) await boardBegin.click();
    // The zone centre the ride walks to; the cradle's rim mount is 5.5 m north of it.
    await board.evaluate(() => window.__GR_TEST__.teleport(0, 45));
    await board.waitForTimeout(1600);
    const heroPos = await board.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
    await board.screenshot({ path: `${out}/shots/${label}-board-${width}.png` });
    await board.close();

    rows.push({ label, width, dataset, activeId, errors, boardErrors, heroPos });
    console.log(JSON.stringify({ label, width, activeId, landmarks: dataset.terrain3dPilotLandmarks, skipped: dataset.terrain3dPilotLandmarkSkipped, state: dataset.terrain3dPilotState, errors: errors.length, boardErrors: boardErrors.length }));
    await page.close();
  }
  writeFileSync(`${out}/plain-board-${label}.json`, JSON.stringify(rows, null, 2) + '\n');
} finally { await browser.close(); }
