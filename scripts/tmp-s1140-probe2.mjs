// s1140 decisive control for F-902-2 (task-037 :171/:192 reds).
// Arm A = the e2e helper VERBATIM: all six hooks in ONE synchronous page.evaluate.
// Arm B = identical calls, but one animation frame between teleport/select and confirmBuild.
// Everything else held constant. 3 repeats per arm to test determinism.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5251';
const URL = '/?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-hidden';

const armA = (page) =>
  page.evaluate(() => {
    // VERBATIM from debugPlaceAssayOffice (e2e/task-037-assay-bench-ungate.spec.ts:121-128)
    const t = window.__GR_TEST__;
    t?.grantGold(120);
    t?.teleport(0, 9);
    t?.selectBuildable('assay_office');
    const placed = t?.confirmBuild();
    t?.setBuildMode(false);
    t?.teleport(0, 7);
    return placed ?? null;
  });

const armB = async (page) => {
  await page.evaluate(() => {
    const t = window.__GR_TEST__;
    t?.grantGold(120);
    t?.teleport(0, 9);
    t?.selectBuildable('assay_office');
  });
  // the ONLY difference: let the ghost revalidate at the new hero position
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const placed = await page.evaluate(() => window.__GR_TEST__?.confirmBuild() ?? null);
  await page.evaluate(() => {
    const t = window.__GR_TEST__;
    t?.setBuildMode(false);
    t?.teleport(0, 7);
  });
  return placed;
};

const trial = async (arm, fn) => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE + URL);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const ghostBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build?.ghostValid ?? null);
  const placed = await fn(page);

  // the assertion the spec makes, with the spec's own 5s budget
  const start = Date.now();
  let offices = 0;
  while (Date.now() - start < 5000) {
    offices = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build?.assayOffices ?? 0);
    if (offices === 1) break;
    await page.waitForTimeout(100);
  }
  const gold = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy?.gold ?? null);
  await browser.close();
  return { arm, ghostBefore, confirmReturn: placed, assayOffices: offices, gold, verdict: offices === 1 ? 'PASS' : 'FAIL' };
};

const rows = [];
for (let i = 0; i < 3; i += 1) rows.push(await trial('A same-tick (helper verbatim)', armA));
for (let i = 0; i < 3; i += 1) rows.push(await trial('B one-frame settle', armB));

console.log('\narm                              | confirmBuild() | assayOffices | gold | verdict');
console.log('---------------------------------|----------------|--------------|------|--------');
for (const r of rows) {
  console.log(
    `${r.arm.padEnd(32)} | ${String(r.confirmReturn).padEnd(14)} | ${String(r.assayOffices).padEnd(12)} | ${String(r.gold).padEnd(4)} | ${r.verdict}`,
  );
}
const a = rows.filter((r) => r.arm.startsWith('A'));
const b = rows.filter((r) => r.arm.startsWith('B'));
console.log(`\nA (same-tick): ${a.filter((r) => r.verdict === 'PASS').length}/3 pass`);
console.log(`B (settled)  : ${b.filter((r) => r.verdict === 'PASS').length}/3 pass`);
