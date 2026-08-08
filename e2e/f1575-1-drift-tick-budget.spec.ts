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

for (const phase of [35, 39, 43, 47]) {
  test(`maps denied-receipt drift at fixed start phase P=${phase}`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied');
    await page.waitForFunction(() => Boolean(window.__GR_AGENT__) && Boolean(window.__GR_TEST__));

    const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
    expect(node).toBeTruthy();
    const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
    expect((receipt as { outcome?: { ok?: boolean; reason?: string } } | undefined)?.outcome).toMatchObject({
      ok: false,
      reason: 'PERMISSION_DENIED',
    });

    const sweep = await page.evaluate((targetPhase) => {
      const testApi = window.__GR_TEST__!;
      testApi.setManualSim(true);
      const currentTick = window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick;
      if (currentTick <= targetPhase) testApi.advanceSim((targetPhase - currentTick) / 30);
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
      const before = {
        currentTick,
        position: diagnostics.agent.embodiment.position,
        simTick: diagnostics.simulation.tick,
        timeAlive: diagnostics.timeAlive,
      };
      const samples = [];
      if (before.simTick === targetPhase) {
        for (let tickDelta = 1; tickDelta <= 70; tickDelta += 1) {
          testApi.advanceSim(1 / 30);
          const sample = window.__THREE_GAME_DIAGNOSTICS__!;
          samples.push({
            position: sample.agent.embodiment.position,
            simTick: sample.simulation.tick,
          });
        }
      }
      return { before, samples };
    }, phase);
    const { before } = sweep;
    expect(before.simTick, `phase ${phase} was unreachable from tick ${before.currentTick}`).toBe(phase);

    for (const [index, sample] of sweep.samples.entries()) {
      const tickDelta = index + 1;
      const driftAbs = distance(sample.position, before.position);
      const gapClosed = distance(before.position, node!.position) - distance(sample.position, node!.position);
      expect(sample.simTick - before.simTick).toBe(tickDelta);
      console.log(`[f1577-3-sweep] tickBefore=${before.simTick} tickDelta=${tickDelta} driftAbs=${driftAbs} gapClosed=${gapClosed} timeBefore=${before.timeAlive}`);
    }
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });
}
