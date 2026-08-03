import { expect, test, type Page } from '@playwright/test';

// THE ATMOSPHERICS SHIFT — the finale's horizon, second attempt (reviews/beauty-atmos.md).
// Attempt one painted the panorama and reverted it: F-BEAUTY-BARON-3 measured the ring foot
// 12-17 degrees above the top edge of the frame. This shift paints the sculpt CONTINUATION —
// the apron that a probe measured at 0% / 7.9% / 31.6% / 51.7% of the desktop frame as the hero
// walks from the home bank to the far edge. This spec defends three things:
//   1. the paint is on, on e1-baron, in a plain contract boot;
//   2. it does NOT leak to another map that shares the same continuation code;
//   3. ?baronHorizon=off is a real control arm, not a no-op.

// No `tier=` here on purpose: readPerformanceTierOverride reads `tier` BEFORE `performance`, so
// a template that pinned tier=full silently overrode every per-test tier this file tries to set.
const BOOT = 'debug&contract=%s&timescale=1&nolevel&nowaves&nosteal&nowreck&nokill&seed=atmos-horizon';

test('e1-baron paints its horizon apron in a plain contract boot', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page, 'e1-baron', '&tier=full');
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
  await boot(page, 'e1-baron', '&tier=full&baronHorizon=off');
  const data = await pilot(page);
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('plain');
});

test('e1-dry-gulch gets its own noon horizon — the same mechanism, a different climate', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page, 'e1-dry-gulch', '&tier=full');
  const data = await pilot(page);
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('painted');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the apron paint does not leak to a map with no profile', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page, 'the-claim', '&tier=full');
  const data = await pilot(page);
  expect(data.continuation).toBe('sculpt-edge-continuation');
  expect(data.horizonApron).toBe('plain');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

// DRY GULCH U5, RE-SCOPED. The shift that shipped the heat shimmer and the dust devils gave them
// no spec, no dataset key and no assertion anywhere (grep: the only four mentions of
// `heatShimmer` in the repo are its own four lines in LightRig.ts). Measured on this branch:
// headless chromium reports SwiftShader, PerformanceTier resolves 'balanced', and LightRig
// decides `heatAllowed` ONCE in its constructor — so U5 is dark in every capture ever taken of
// this map, which is why its own boards show +0 draw calls for it. It is not broken; it is
// gated, and nothing said so. This test says so.
test('U5 heat is FULL-tier only, and that gate is the reason every captured board shows it dark', async ({ page }) => {
  test.setTimeout(240_000);
  // Both arms FORCE the tier. Left to itself this box resolves 'balanced' (SwiftShader) most of
  // the time and 'full' sometimes, which is exactly the flakiness that let U5 be dark in every
  // captured board without a single red — so the gate asserts the CAUSE, not the weather.
  await boot(page, 'e1-dry-gulch', '&tier=balanced');
  const balanced = await lighting(page);
  expect(balanced.tier).toBe('balanced');
  expect(balanced.heatShimmer).toBe(false);
  expect(balanced.dustDevilQuads).toBe(0);

  await boot(page, 'e1-dry-gulch', '&tier=full');
  const full = await lighting(page);
  expect(full.tier).toBe('full');
  expect(full.heatShimmer).toBe(true);
  expect(full.dustDevilQuads).toBeGreaterThan(0);
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

async function lighting(page: Page) {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 90, undefined, { timeout: 60_000 });
  return page.evaluate(() => {
    const game = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      tier: game.performance?.tier,
      heatShimmer: game.lighting?.heatShimmer,
      dustDevilQuads: game.lighting?.dustDevilQuads,
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
