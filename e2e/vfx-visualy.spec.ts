import { expect, test, type Page } from '@playwright/test';

test('a seam-collect float stays above raised terrain', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=e1-twin-banks&nowaves&nolevel&nopause&seed=vfx-visualy');
  await page.waitForFunction(() =>
    (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10
    && document.querySelector('#game-canvas')?.getAttribute('data-terrain3d-pilot-state') === 'ready',
  );
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();

  const result = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
    const raised = nodes
      .map((node) => ({ node, terrainY: test.terrainVisualY(node.position.x, node.position.z) }))
      .sort((a, b) => b.terrainY - a.terrainY)[0];
    if (!raised) throw new Error('missing active seam');
    test.setManualSim(true);
    test.teleport(raised.node.position.x, raised.node.position.z);
    test.advanceSim(3);
    return { terrainY: raised.terrainY, float: window.__THREE_GAME_DIAGNOSTICS__!.vfx.lastFloatText };
  });

  expect(result.terrainY).toBeGreaterThan(0.05);
  expect(result.float?.text).toMatch(/^\+\d+$/);
  expect(result.float?.terrainY).toBeCloseTo(result.terrainY, 4);
  expect(result.float?.y).toBeCloseTo(result.terrainY + 1.7, 4);
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
