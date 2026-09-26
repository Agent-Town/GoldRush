/** canyon-works-traversal-2, item 4: gt-03's goal-side rows measured, as written and re-aimed.
 *
 * e2e/gt-03-enemy-elevation.spec.ts scripts an enemy on the Canyon Works at (startX, 32) toward (targetX, 8) and reads
 * the first non-zero terrainSlideSide (the goal-side steer of gt-03b). This probe runs the SAME harness calls for two case
 * sets and records where each enemy stood when it first slid, so the re-baseline carries measured numbers:
 *   as-written  startX -38/38, the rows as they stand (they slid on the t2 ramp's wall, z 19.8..26.2 at every x);
 *   re-aimed    startX -6/6 with the same goal deltas (-8, +10, +8, -10), inside the cliff's x span (-12..12);
 *   river-wall  the rows as written with the target south of the river (z -20), so the deep channel is the wall.
 * No assertion on the rows: it measures. Console and page errors are recorded.
 * Run inside the drain lock, dev server on 5325:
 *   GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5325 \
 *     npx playwright test --config artifacts/canyon-works-traversal-2/playwright.probe.config.ts --workers=1
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';

const OUT = path.join(import.meta.dirname, '..', 'gt-03');
const SETS = {
  'as-written': [
    { startX: -38, targetX: -46, targetZ: 8, expectedPassSide: 'west', polarity: 'same' },
    { startX: -38, targetX: -28, targetZ: 8, expectedPassSide: 'east', polarity: 'opposite' },
    { startX: 38, targetX: 46, targetZ: 8, expectedPassSide: 'east', polarity: 'same' },
    { startX: 38, targetX: 28, targetZ: 8, expectedPassSide: 'west', polarity: 'opposite' },
  ],
  're-aimed': [
    { startX: -6, targetX: -14, targetZ: 8, expectedPassSide: 'west', polarity: 'same' },
    { startX: -6, targetX: 4, targetZ: 8, expectedPassSide: 'east', polarity: 'opposite' },
    { startX: 6, targetX: 14, targetZ: 8, expectedPassSide: 'east', polarity: 'same' },
    { startX: 6, targetX: -4, targetZ: 8, expectedPassSide: 'west', polarity: 'opposite' },
  ],
  'river-wall': [
    { startX: -38, targetX: -46, targetZ: -20, expectedPassSide: 'west', polarity: 'same' },
    { startX: -38, targetX: -28, targetZ: -20, expectedPassSide: 'east', polarity: 'opposite' },
    { startX: 38, targetX: 46, targetZ: -20, expectedPassSide: 'east', polarity: 'same' },
    { startX: 38, targetX: 28, targetZ: -20, expectedPassSide: 'west', polarity: 'opposite' },
  ],
} as const;

test('gt-03 goal-side rows, as written, re-aimed at the cliff, and against the river', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nokill&nopause&nosteal&nowreck&seed=gt-03-goal-side');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const report = await page.evaluate((sets) => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    const out: Record<string, unknown[]> = {};
    for (const [name, cases] of Object.entries(sets)) {
      out[name] = cases.map((scenario) => {
        harness.clearEnemies();
        harness.scriptEnemyAt(scenario.startX, 32, scenario.targetX, scenario.targetZ, 8);
        let passSide: 'east' | 'west' | null = null;
        let samples = 0;
        let at: { x: number; z: number } | null = null;
        for (; samples < 80 && passSide === null; samples += 1) {
          harness.advanceSim(0.05);
          const slideSide = harness.captureSuspend().enemies.active[0]?.terrainSlideSide ?? 0;
          if (slideSide !== 0) {
            passSide = slideSide > 0 ? 'east' : 'west';
            const enemy = harness.enemyPositions()[0];
            at = enemy ? { x: Number(enemy.x.toFixed(3)), z: Number(enemy.z.toFixed(3)) } : null;
          }
        }
        const last = harness.enemyPositions()[0];
        const sim = last ? harness.terrainSim(last.x, last.z) : null;
        return {
          ...scenario,
          samples,
          passSide,
          firstSlideAt: at,
          endAt: last ? { x: Number(last.x.toFixed(3)), z: Number(last.z.toFixed(3)) } : null,
          endHeight: sim ? Number(sim.height.toFixed(3)) : null,
        };
      });
    }
    return out;
  }, SETS);
  await mkdir(OUT, { recursive: true });
  const body = { project: testInfo.project.name, at: new Date().toISOString(), report, consoleErrors, pageErrors };
  await writeFile(path.join(OUT, `goal-side-probe-${testInfo.project.name}.json`), `${JSON.stringify(body, null, 2)}\n`);
  console.log(`[goal-side-probe] ${testInfo.project.name} ${JSON.stringify(body)}`);
});
