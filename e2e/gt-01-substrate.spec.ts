import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

test('flat claim exposes simulation height substrate without changing behavior', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&seed=gt-01-substrate');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const substrate = await page.evaluate(() => ({
    sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
    activeTile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
  }));

  expect(substrate.activeTile).toEqual({ id: 'frontier-river-claim', biome: 'river-claim' });
  expect(substrate.sim).toMatchObject({ flat: true, tile: 'frontier-river-claim' });
  expect(Object.keys(substrate.sim?.probes ?? {}).sort()).toEqual(['farBank', 'ford', 'heroStart']);

  for (const probe of Object.values(substrate.sim?.probes ?? {})) {
    expect(probe.height).toBe(0);
    expect(probe.slope).toEqual({ dx: 0, dz: 0 });
    expect(probe.traversable).toBe(true);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
