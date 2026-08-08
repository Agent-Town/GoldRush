import { expect, test, type Page } from '@playwright/test';

type Point = { x: number; z: number };
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

test('maps denied-receipt drift against the actual simulation tick', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__) && Boolean(window.__GR_TEST__));

  const before = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return { position: diagnostics.agent.embodiment.position, simTick: diagnostics.simulation.tick };
  });
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();
  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment);
  expect((receipt as { outcome?: { ok?: boolean; reason?: string } } | undefined)?.outcome).toMatchObject({
    ok: false,
    reason: 'PERMISSION_DENIED',
  });

  const samples: Array<{ tickDelta: number; driftAbs: number; gapClosed: number }> = [];
  for (const seconds of [0.35, ...Array(29).fill(1 / 30)]) {
    const sample = await page.evaluate((advanceSeconds) => {
      window.__GR_TEST__!.advanceSim(advanceSeconds);
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
      return {
        position: diagnostics.agent.embodiment.position,
        simTick: diagnostics.simulation.tick,
      };
    }, seconds);
    const tickDelta = sample.simTick - before.simTick;
    const driftAbs = distance(sample.position, before.position);
    const gapClosed = distance(before.position, node!.position) - distance(sample.position, node!.position);
    samples.push({ tickDelta, driftAbs, gapClosed });
    console.log(`[f1575-1-sweep] tickDelta=${tickDelta} driftAbs=${driftAbs} gapClosed=${gapClosed}`);
  }

  expect(samples[0]!.tickDelta).toBeGreaterThanOrEqual(11);
  expect(samples.at(-1)!.tickDelta).toBeGreaterThanOrEqual(40);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
