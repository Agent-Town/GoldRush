import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.GR_F1148_PROBE, 'measurement rig — set GR_F1148_PROBE=1 to run');
test.setTimeout(45_000);

// Default reproduces arm A rather than minting a new file set: the committed records are
// arm-a-main-run*.json, so a bare `GR_F1148_PROBE=1` run must overwrite those, not write
// arm-a-run*.json alongside them and look like a fourth arm (F-1152-3).
const arm = process.env.GR_F1148_ARM ?? 'arm-a-main';
const artifactDir = path.resolve('artifacts/f1148-1-trajectory');

type Trajectory = {
  simTime: number;
  pathDistance: number;
  xMin: number;
  xMax: number;
  sampleCount: number;
};

async function openGame(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function setBalance(page: Page, balancePath: string, value: number): Promise<void> {
  await expect(
    page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [balancePath, value] as const),
  ).resolves.toBe(true);
}

async function placeBuildableAt(page: Page, id: 'stockpile' | 'palisade', x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

for (let run = 1; run <= 3; run += 1) {
  test(`${arm} trajectory run ${run}`, async ({ page }) => {
    await openGame(page, '?debug&timescale=10&nowaves&nokill&nolevel&seed=m2-04-walls');
    await setBalance(page, 'palisade.cost', 0);
    // Counted, not asserted: placeBuildableAt throws unless confirmBuild() returned true, so
    // this tallies placements that actually succeeded and tracks the row if it is ever edited.
    // It replaces a hardcoded `palisadesPlaced: 5` that read like a measurement (F-1152-2).
    let palisadesPlaced = 0;
    for (const x of [-2, -1, 0, 1, 2]) {
      await placeBuildableAt(page, 'palisade', x, 9);
      palisadesPlaced += 1;
    }
    await setBalance(page, 'stockpile.cost', 0);
    await placeBuildableAt(page, 'stockpile', 0, 13);
    await page.evaluate(() => window.__GR_TEST__?.grantGold(100));
    await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));

    const result = await page.evaluate(async () => {
      const api = window.__GR_TEST__;
      if (!api) throw new Error('__GR_TEST__ unavailable');
      if (!api.spawnThief('south')) throw new Error('spawnThief failed');
      const spawnedAt = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;

      return new Promise<Trajectory>((resolve, reject) => {
        const samples: Array<{ x: number; z: number }> = [];
        const timeout = window.setTimeout(() => reject(new Error('theft timed out')), 30_000);
        const tick = () => {
          const thief = api.enemyPositions().find((enemy) => enemy.thief);
          if (thief) samples.push({ x: thief.x, z: thief.z });
          if (api.economyLog().some((event) => (event as { type?: string }).type === 'gold_stolen')) {
            window.clearTimeout(timeout);
            let pathDistance = 0;
            for (let i = 1; i < samples.length; i += 1) {
              pathDistance += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].z - samples[i - 1].z);
            }
            resolve({
              simTime: (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? spawnedAt) - spawnedAt,
              pathDistance,
              xMin: Math.min(...samples.map(({ x }) => x)),
              xMax: Math.max(...samples.map(({ x }) => x)),
              sampleCount: samples.length,
            });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    });

    expect(result.sampleCount).toBeGreaterThan(0);
    expect(result.pathDistance).toBeGreaterThan(0);

    const output = { arm, run, palisadesPlaced, ...result };
    await mkdir(artifactDir, { recursive: true });
    await writeFile(path.join(artifactDir, `${arm}-run${run}.json`), `${JSON.stringify(output, null, 2)}\n`);
    console.log(`F1148 ${JSON.stringify(output)}`);
  });
}
