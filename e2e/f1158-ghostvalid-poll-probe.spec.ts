import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// F-1158 measurement rig for F-1156-3's claim that the ghostValid polls are now
// redundant (post-F-1153-1) and that removing them buys suite wall-time.
// Set GR_F1158_PROBE=1 to run. Arms are INTERLEAVED (A,B,A,B,...) because arm
// order is a confound: a sequential block would confuse "time on box" with "arm".
test.skip(!process.env.GR_F1158_PROBE, 'measurement rig — set GR_F1158_PROBE=1 to run');
test.setTimeout(120_000);

const artifactDir = path.resolve('artifacts/f1158-ghostvalid-poll');
const ITERATIONS = Number(process.env.GR_F1158_N ?? 16);

type Record_ = {
  i: number;
  arm: 'A-poll' | 'B-nopoll';
  x: number;
  /** build.ghostValid read synchronously after teleport+selectBuildable, before any wait. */
  ghostValidImmediate: boolean;
  /** ms the expect.poll actually cost (arm A only). */
  pollMs: number | null;
  /** what confirmBuild() returned. */
  placed: boolean;
  /** palisade count delta across the placement. */
  countDelta: number;
};

async function openGame(page: Page): Promise<void> {
  await page.goto('/?debug&timescale=4&nowaves&nolevel&nokill&seed=f1158-ghostvalid', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByTestId('hud-vitals')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
}

const count = (page: Page): Promise<number> =>
  page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0);

test('ghostValid poll: cost and necessity, interleaved arms', async ({ page }) => {
  await openGame(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('palisade.cost', 0);
    window.__GR_TEST__?.grantGold(5000);
  });

  const records: Record_[] = [];
  for (let i = 0; i < ITERATIONS; i += 1) {
    const arm: Record_['arm'] = i % 2 === 0 ? 'A-poll' : 'B-nopoll';
    const x = -8 + i;
    const before = await count(page);

    // The exact shape the 31 `.toBe(true)` call sites use: teleport, select, then
    // (arm A) poll, then confirmBuild.
    await page.evaluate((px) => {
      window.__GR_TEST__?.teleport(px, 9);
      window.__GR_TEST__?.selectBuildable('palisade');
    }, x);

    const ghostValidImmediate = await page.evaluate(
      () => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false,
    );

    let pollMs: number | null = null;
    if (arm === 'A-poll') {
      const t0 = Date.now();
      await expect
        .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false))
        .toBe(true);
      pollMs = Date.now() - t0;
    }

    const placed = Boolean(await page.evaluate(() => window.__GR_TEST__?.confirmBuild()));
    const after = await count(page);
    await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));

    records.push({ i, arm, x, ghostValidImmediate, pollMs, placed, countDelta: after - before });
  }

  const armA = records.filter((r) => r.arm === 'A-poll');
  const armB = records.filter((r) => r.arm === 'B-nopoll');
  const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);
  const summary = {
    iterations: ITERATIONS,
    armA: {
      n: armA.length,
      placedOk: armA.filter((r) => r.placed).length,
      ghostValidImmediateTrue: armA.filter((r) => r.ghostValidImmediate).length,
      pollMsMean: armA.length ? sum(armA.map((r) => r.pollMs ?? 0)) / armA.length : 0,
      pollMsMax: Math.max(0, ...armA.map((r) => r.pollMs ?? 0)),
      pollMsTotal: sum(armA.map((r) => r.pollMs ?? 0)),
    },
    armB: {
      n: armB.length,
      placedOk: armB.filter((r) => r.placed).length,
      ghostValidImmediateTrue: armB.filter((r) => r.ghostValidImmediate).length,
    },
  };

  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, 'records.json'), `${JSON.stringify({ summary, records }, null, 2)}\n`);
  console.log(`F1158 SUMMARY ${JSON.stringify(summary)}`);
  for (const r of records) console.log(`F1158 ROW ${JSON.stringify(r)}`);

  // The rig measures; it asserts only that it actually exercised the path.
  expect(records.length).toBe(ITERATIONS);
});
