// s1140 probe 3 — localise WHICH input to BuildSystem.computeValid() is frame-deferred.
// Reads ghost state SYNCHRONOUSLY inside the same tick as teleport+selectBuildable,
// then again after one frame, with no other difference.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5251';
const URL = '/?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-hidden';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(BASE + URL);
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

const sameTick = await page.evaluate(() => {
  const t = window.__GR_TEST__;
  const read = (tag) => {
    const b = window.__THREE_GAME_DIAGNOSTICS__?.build;
    const h = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
    return {
      tag,
      frame: window.__THREE_GAME_DIAGNOSTICS__?.frame,
      hero: h ? { x: +h.x.toFixed(3), z: +h.z.toFixed(3) } : null,
      mode: b?.mode,
      selected: b?.selectedBuildable,
      ghostValid: b?.ghostValid,
      ghostPos: b?.ghostPos ? { x: +b.ghostPos.x.toFixed(3), z: +b.ghostPos.z.toFixed(3) } : null,
      ghostVisible: b?.ghostVisible,
    };
  };
  const log = [];
  log.push(read('a. before anything'));
  t?.grantGold(120);
  t?.teleport(0, 9);
  log.push(read('b. after teleport(0,9)'));
  t?.selectBuildable('assay_office');
  log.push(read('c. after selectBuildable'));
  const placed = t?.confirmBuild();
  log.push(read('d. after confirmBuild -> ' + placed));
  return { log, placed };
});

// now one frame, then retry confirm with nothing else changed
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const afterFrame = await page.evaluate(() => {
  const b = window.__THREE_GAME_DIAGNOSTICS__?.build;
  const h = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
  return {
    tag: 'e. after 2 rAF (no other change)',
    frame: window.__THREE_GAME_DIAGNOSTICS__?.frame,
    hero: h ? { x: +h.x.toFixed(3), z: +h.z.toFixed(3) } : null,
    mode: b?.mode,
    selected: b?.selectedBuildable,
    ghostValid: b?.ghostValid,
    ghostPos: b?.ghostPos ? { x: +b.ghostPos.x.toFixed(3), z: +b.ghostPos.z.toFixed(3) } : null,
    ghostVisible: b?.ghostVisible,
  };
});

const retry = await page.evaluate(() => {
  const placed = window.__GR_TEST__?.confirmBuild();
  const b = window.__THREE_GAME_DIAGNOSTICS__?.build;
  return { placed, assayOffices: b?.assayOffices, ghostValid: b?.ghostValid };
});

await browser.close();

console.log('--- same synchronous tick (what the e2e helper does) ---');
for (const r of sameTick.log) console.log(JSON.stringify(r));
console.log('confirmBuild() returned:', sameTick.placed);
console.log('\n--- after one frame, nothing else changed ---');
console.log(JSON.stringify(afterFrame));
console.log('retry confirmBuild():', JSON.stringify(retry));
