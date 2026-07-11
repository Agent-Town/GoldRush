import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

test('Dry Gulch reaches wave 18 without leaving living enemies frozen', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=e1-dry-gulch&timescale=24&nolevel&nopause&nosteal&nowreck&seed=dry-gulch-wave-18');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const testApi = window.__GR_TEST__!;
    for (const [key, value] of [
      ['enemy.contactDamage', 0],
      ['waves.graceSeconds', 0.1],
      ['waves.waveInterval', 4],
      ['waves.trickleInterval', 9999],
      ['waves.pulseBase', 5],
      ['waves.pulsePerWave', 0],
      ['waves.pulsesPerWave', 1],
      ['waves.edgesPerPulse', 1],
      ['waves.aliveCap', 40],
    ] as const) testApi.setBalance(key, value);
    testApi.resetRun();
    testApi.maxUpgrades();
    testApi.grantGold(9999);
    for (const [x, z] of [[-8, 4], [0, 4], [8, 4], [-8, 10]] as const) {
      if (!testApi.placeFree('turret', x, z)) throw new Error(`Could not place turret at ${x},${z}`);
    }
  });

  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0) >= 18, undefined, { timeout: 20_000 });
  await page.evaluate(() => window.__GR_TEST__?.teleport(-12, 12));
  const before = await page.evaluate(() => ({
    at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    enemies: window.__GR_TEST__?.enemyPositions() ?? [],
  }));
  await page.evaluate(() => window.__GR_TEST__?.teleport(12, -12));
  await page.waitForFunction((at) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= at + 5, before.at);
  const after = await page.evaluate(() => ({
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
    enemies: window.__GR_TEST__?.enemyPositions() ?? [],
  }));
  const priorById = new Map(before.enemies.map((enemy) => [enemy.id, enemy]));
  const frozen = after.enemies.filter((enemy) => {
    const prior = priorById.get(enemy.id);
    return prior && Math.hypot(enemy.x - prior.x, enemy.z - prior.z) <= 0.05;
  });
  const finalSample = { before, after, frozen };

  const artifactDir = path.resolve('artifacts/fix-dry-gulch-frozen-waves');
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, `${testInfo.project.name}-wave-18-dump.json`), JSON.stringify(finalSample, null, 2));
  await page.screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-wave-18-flowing.png`) });
  expect(frozen, JSON.stringify(frozen, null, 2)).toEqual([]);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
