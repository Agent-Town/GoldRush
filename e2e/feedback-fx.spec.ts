import { expect, test, type Page } from '@playwright/test';

type HarvestNode = {
  active: boolean;
  position: { x: number; z: number };
};

async function waitForGame(page: Page, frames = 10): Promise<void> {
  await page.waitForFunction((targetFrames) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > targetFrames, frames);
}

async function nearestActiveNode(page: Page): Promise<HarvestNode> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const hero = diagnostics?.heroPos ?? { x: 0, z: 0 };
    const nodes = diagnostics?.harvest.activeNodes.filter((node) => node.active) ?? [];
    nodes.sort((a, b) => {
      const adx = a.position.x - hero.x;
      const adz = a.position.z - hero.z;
      const bdx = b.position.x - hero.x;
      const bdz = b.position.z - hero.z;
      return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
    });
    return nodes[0];
  });
}

test('announcement banner fades after the opening claim notice', async ({ page }) => {
  await page.goto('/?timescale=2');
  await waitForGame(page, 1);

  const banner = page.getByTestId('hud-wave');
  await expect(banner).toContainText('Stake your claim.');
  await expect
    .poll(async () => Number(await banner.evaluate((element) => getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.5);

  await expect
    .poll(async () => Number(await banner.evaluate((element) => getComputedStyle(element).opacity)), {
      timeout: 5_000,
    })
    .toBeLessThan(0.05);
});

test('gold panning spawns pooled world-space float text', async ({ page }) => {
  await page.goto('/?debug&timescale=8&seed=feedback-fx&nowaves');
  await waitForGame(page);

  const target = await nearestActiveNode(page);
  expect(target).toBeTruthy();
  const startingGold = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);

  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), target.position);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0), {
      timeout: 8_000,
    })
    .toBeGreaterThan(startingGold);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), {
      timeout: 2_000,
    })
    .toBeGreaterThan(0);

  const frameMs = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs);
  console.log(`frameMs avg=${frameMs?.avg.toFixed(2)} p95=${frameMs?.p95.toFixed(2)}`);
});
