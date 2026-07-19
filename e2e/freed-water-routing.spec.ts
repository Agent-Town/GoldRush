import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?debug&contract=the-claim&nowaves&nolevel&nopause&seed=freed-water-routing';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('a freed walker on the far bank never routes into water', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const result = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    game.resetRun();
    game.setManualSim(true);
    game.setBalance('blast.damage', 1000);
    game.teleport(-28.5, 8);
    const spawned = game.spawnEnemyAt(-25, 7);
    const enemy = game.enemyPositions()[0]!;
    const trace: Array<{ x: number; z: number; zone: string }> = [];
    let target: { x: number; z: number; kind: 'edge' | 'none' } | undefined;
    game.launchBlastAt(enemy.x, enemy.z, 0.01);
    game.advanceSim(4, () => {
      const freed = window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.entities.find((candidate) => candidate.active);
      if (freed) {
        target ??= { ...freed.target };
        trace.push({ x: freed.x, z: freed.z, zone: game.terrainSample(freed.x, freed.z).zone });
      }
    });
    return {
      spawned,
      startZone: game.terrainSample(-25, 7).zone,
      target,
      targetZone: target ? game.terrainSample(target.x, target.z).zone : null,
      trace,
    };
  });

  expect(result.spawned).toBe(true);
  expect(result.startZone).toBe('bank');
  expect(result.target).toBeDefined();
  expect(result.targetZone).toBe('bank');
  expect(result.trace.length).toBeGreaterThan(10);
  expect(result.trace.every((sample) => sample.zone === 'bank')).toBe(true);
  expect(errors).toEqual([]);
});
