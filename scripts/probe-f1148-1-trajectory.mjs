#!/usr/bin/env node
import { chromium } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:5231';
const runCount = Number(process.argv[3] ?? 3);
const label = process.argv[4] ?? 'trajectory';

if (!Number.isInteger(runCount) || runCount < 1) throw new Error('run count must be a positive integer');

const browser = await chromium.launch({ channel: 'chromium' });
const runs = [];

try {
  for (let run = 1; run <= runCount; run += 1) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${baseURL}/?debug&timescale=1&nowaves&nokill&nolevel&seed=m2-04-walls`);
    await page.waitForSelector('#game-canvas');
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

    const setBalance = async (path, value) => {
      if (!(await page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value]))) {
        throw new Error(`setBalance failed: ${path}`);
      }
    };
    const place = async (id, x, z) => {
      await page.evaluate(([nextX, nextZ]) => window.__GR_TEST__?.teleport(nextX, nextZ + 2), [x, z]);
      await page.evaluate((nextId) => window.__GR_TEST__?.selectBuildable(nextId), id);
      if (!(await page.evaluate(() => window.__GR_TEST__?.confirmBuild()))) {
        throw new Error(`confirmBuild failed: ${id}@${x},${z}`);
      }
    };
    await setBalance('palisade.cost', 0);
    for (const x of [-2, -1, 0, 1, 2]) await place('palisade', x, 9);
    await setBalance('stockpile.cost', 0);
    await place('stockpile', 0, 13);
    await page.evaluate(() => window.__GR_TEST__?.grantGold(100));
    await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));

    const result = await page.evaluate(async () => {
      const api = window.__GR_TEST__;
      if (!api) throw new Error('__GR_TEST__ unavailable');
      if (!api.spawnThief('south')) throw new Error('spawnThief failed');
      const spawnedAt = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;

      return new Promise((resolve, reject) => {
        const samples = [];
        const timeout = window.setTimeout(() => reject(new Error('theft timed out')), 30_000);
        const tick = () => {
          const thief = api.enemyPositions().find((enemy) => enemy.thief);
          if (thief) samples.push({ x: thief.x, z: thief.z });
          if (api.economyLog().some((event) => event.type === 'gold_stolen')) {
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

    if (result.sampleCount <= 0 || result.pathDistance <= 0) {
      throw new Error(`VOID run ${run}: samples=${result.sampleCount}, distance=${result.pathDistance}`);
    }
    if (consoleErrors.length || pageErrors.length) {
      throw new Error(`run ${run} browser errors: ${JSON.stringify({ consoleErrors, pageErrors })}`);
    }
    runs.push({ run, ...result });
    await context.close();
  }
} finally {
  await browser.close();
}

const values = (key) => runs.map((run) => run[key]).sort((a, b) => a - b);
const summary = Object.fromEntries(
  ['simTime', 'pathDistance', 'xMin', 'xMax', 'sampleCount'].map((key) => {
    const sorted = values(key);
    return [key, { median: sorted[Math.floor(sorted.length / 2)], min: sorted[0], max: sorted.at(-1) }];
  }),
);

console.log(JSON.stringify({ label, baseURL, runs, summary }, null, 2));
