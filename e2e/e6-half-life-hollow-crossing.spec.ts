import { expect, test } from '@playwright/test';

const URL = '/?debug&epoch=epoch-6-atomic&contract=e6-half-life-hollow&nowaves&nolevel&nopause&seed=e6-half-life-hollow-crossing';

test('Half-Life Hollow requires launch-route-extraction order and chips only on glow bridges', async ({ page }) => {
  await page.goto(URL);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 }).toBe('e6-half-life-hollow');

  const teleport = async (x: number, z: number) => {
    await page.evaluate(([px, pz]) => window.__GR_TEST__!.teleport(px, pz), [x, z]);
  };
  const crossing = () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hollowCrossing);

  await teleport(0, 48);
  await expect.poll(crossing).toMatchObject({ stage: 'launch', routeId: null });
  await teleport(0, -47);
  await expect.poll(crossing).toMatchObject({ stage: 'crossing', routeId: null });
  await teleport(-28, 0);
  await expect.poll(crossing).toMatchObject({ stage: 'extraction', routeId: 'west-glow-bridge', onGlowBridge: true });

  const hp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp), { timeout: 3_000 }).toBeLessThan(hp);
  await teleport(0, 48);
  await expect.poll(crossing).toMatchObject({ stage: 'complete', routeId: 'west-glow-bridge', onGlowBridge: false });
});

test('causeway route is safe', async ({ page }) => {
  await page.goto(URL);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 }).toBe('e6-half-life-hollow');
  for (const [x, z] of [[0, -47], [0, 0], [0, 48]] as const) {
    await page.evaluate(([px, pz]) => window.__GR_TEST__!.teleport(px, pz), [x, z]);
    await page.waitForTimeout(50);
  }
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hollowCrossing)).toEqual({
    declared: true,
    stage: 'complete',
    routeId: 'central-causeway',
    onGlowBridge: false,
    radiationDamageDealt: 0,
  });
});

test('plain boot resolves Half-Life Hollow with its required terrain mesh mounted', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

  await page.addInitScript(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-6-atomic');
    sessionStorage.setItem('gr.contract.launch.v1', 'e6-half-life-hollow');
  });
  await page.goto('/?contract=e6-half-life-hollow');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 }).toBe('e6-half-life-hollow');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.render?.terrainMesh)).toBe('required');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-contract', 'e6-half-life-hollow');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-terrain-load-state', 'mounted', { timeout: 30_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-hollow-crossing-visuals', '3');
  expect(problems).toEqual([]);
});
