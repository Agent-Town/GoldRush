import { expect, test, type Page } from '@playwright/test';

// THE ATMOSPHERICS SHIFT — the finale's horizon, second attempt (reviews/beauty-atmos.md).
// Attempt one painted the panorama and reverted it: F-BEAUTY-BARON-3 measured the ring foot
// 12-17 degrees above the top edge of the frame. This shift paints the sculpt CONTINUATION —
// the apron that a probe measured at 0% / 7.9% / 31.6% / 51.7% of the desktop frame as the hero
// walks from the home bank to the far edge. This spec defends three things:
//   1. the paint is on, on e1-baron, in a plain contract boot;
//   2. it does NOT leak to another map that shares the same continuation code;
//   3. ?baronHorizon=off is a real control arm, not a no-op.

const BOOT = 'debug&contract=%s&timescale=1&nolevel&nowaves&nosteal&nowreck&nokill&tier=full&seed=atmos-horizon';

test('e1-baron paints its horizon apron in a plain contract boot', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page, 'e1-baron');
  const data = await pilot(page);
  // The apron must still be the runtime-built one. If the panorama ever grows the builder's
  // county ground skirt, this flips to 'panorama-owned-continuation' and the paint stops
  // existing — F-BEAUTY-BARON-4, turned into an assertion.
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('painted');
  expect(data.renderSource).toBe('glb');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('?baronHorizon=off is a real control arm', async ({ page }) => {
  test.setTimeout(180_000);
  await boot(page, 'e1-baron', '&baronHorizon=off');
  const data = await pilot(page);
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('plain');
});

test('the apron paint does not leak to another map on the same continuation code', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page, 'e1-dry-gulch');
  const data = await pilot(page);
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('plain');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function boot(page: Page, contract: string, extra = ''): Promise<void> {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`/?${BOOT.replace('%s', contract)}${extra}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 120_000 });
  await page.waitForFunction(
    () => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready',
    undefined,
    { timeout: 120_000 },
  );
}

async function pilot(page: Page) {
  return page.evaluate(() => {
    const data = document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset ?? {};
    return {
      continuation: data.terrain3dPilotContinuation,
      horizonApron: data.terrain3dPilotHorizonApron,
      renderSource: data.terrain3dPilotRenderSource,
    };
  });
}

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}
