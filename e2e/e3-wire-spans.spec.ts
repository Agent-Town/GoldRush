import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = 'artifacts/e3-wire-spans';
const DEV_QUERY = '?debug&powergraph&nowaves&nolevel&nopause&seed=e3-wire-spans';
const TRUNK_WIRE_ID = 'relay-east--relay-west';
const EAST_WIRE_ID = 'consumer-beta--relay-east';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(60_000);

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(`/${DEV_QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('catenary batches match graph edges and stay dormant between graph changes', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power);

  expect(before.render).toMatchObject({
    spans: before.wireCount,
    poweredSpans: 4,
    darkSpans: 0,
    segments: 48,
    poweredSegments: 48,
    darkSegments: 0,
    drawCalls: 1,
    rebuildCount: 1,
  });
  expect(before.render.spans).toBe(before.render.poweredSpans + before.render.darkSpans);
  await shot(page, testInfo, 'powered');

  await page.waitForFunction((rebuildCount) => (
    (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30
      && window.__THREE_GAME_DIAGNOSTICS__?.power.render.rebuildCount === rebuildCount
  ), before.render.rebuildCount);
  expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.render)).rebuildCount).toBe(1);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('cut and repair events recolor powered and dark span batches', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const cut = await page.evaluate((wireId) => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.queuePowerGraphCommand({ type: 'set-wire-state', wireId, state: 'cut' });
    harness.advanceSim(1 / 30);
    return { ...window.__THREE_GAME_DIAGNOSTICS__!.power.render };
  }, TRUNK_WIRE_ID);

  expect(cut).toMatchObject({
    spans: 4,
    poweredSpans: 2,
    darkSpans: 2,
    poweredSegments: 24,
    darkSegments: 24,
    drawCalls: 2,
    rebuildCount: 2,
  });
  await shot(page, testInfo, 'cut');

  const darkCut = await page.evaluate((wireId) => {
    const harness = window.__GR_TEST__!;
    harness.queuePowerGraphCommand({ type: 'set-wire-state', wireId, state: 'cut' });
    harness.advanceSim(1 / 30);
    return { ...window.__THREE_GAME_DIAGNOSTICS__!.power.render };
  }, EAST_WIRE_ID);
  expect(darkCut).toMatchObject({ topologyRevision: 2, rebuildCount: 3, intactSpans: 2, cutSpans: 2, poweredSpans: 2, darkSpans: 2 });

  await page.evaluate((wireId) => {
    const harness = window.__GR_TEST__!;
    harness.queuePowerGraphCommand({ type: 'set-wire-state', wireId, state: 'intact' });
    harness.advanceSim(1 / 30);
  }, EAST_WIRE_ID);
  const repaired = await page.evaluate((wireId) => {
    const harness = window.__GR_TEST__!;
    harness.queuePowerGraphCommand({ type: 'set-wire-state', wireId, state: 'intact' });
    harness.advanceSim(1 / 30);
    return { ...window.__THREE_GAME_DIAGNOSTICS__!.power.render };
  }, TRUNK_WIRE_ID);

  expect(repaired).toMatchObject({ poweredSpans: 4, darkSpans: 0, drawCalls: 1, rebuildCount: 5 });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('256 spans remain two instanced draw batches', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=e3-wire-budget');
  const result = await page.evaluate(async () => {
    const { PowerWireView } = await import('../src/world/PowerWireView');
    const nodes = Array.from({ length: 128 }, (_, index) => {
      const component = index < 64 ? 1 : 2;
      const local = index % 64;
      return {
        id: `node-${index}`,
        labelKey: `node-${index}`,
        kind: 'relay' as const,
        x: (local % 8) * 2 + (component - 1) * 20,
        z: Math.floor(local / 8) * 2,
        online: true,
        outputWatts: 0,
        demandWatts: 0,
        priority: 0,
        state: component === 1 ? 'powered' as const : 'dark' as const,
        allocatedWatts: 0,
        allocationRatio: component === 1 ? 1 : 0,
        componentId: `component-${component}`,
      };
    });
    const wires = [0, 64].flatMap((start) => Array.from({ length: 64 }, (_, local) => [1, 2].map((offset) => ({
      id: `wire-${start}-${local}-${offset}`,
      a: `node-${start + local}`,
      b: `node-${start + ((local + offset) % 64)}`,
      state: 'intact' as const,
      length: 2,
      maxLength: 9,
    }))).flat());
    const snapshot = {
      id: 'wire-budget',
      tick: 0,
      topologyRevision: 0,
      allocationRevision: 0,
      totalSupplyWatts: 1,
      totalDemandWatts: 0,
      nodes,
      wires,
      components: [
        { id: 'component-1', nodeIds: nodes.slice(0, 64).map((node) => node.id), supplyWatts: 1, demandWatts: 0, unusedWatts: 1, state: 'lit' as const, shedOrder: [] },
        { id: 'component-2', nodeIds: nodes.slice(64).map((node) => node.id), supplyWatts: 0, demandWatts: 0, unusedWatts: 0, state: 'dark' as const, shedOrder: [] },
      ],
      signature: 'wire-budget',
    };
    const view = new PowerWireView();
    const firstUpdate = view.update(snapshot);
    const secondUpdate = view.update(snapshot);
    const diagnostics = view.diagnostics();
    const instanceCounts = view.group.children.map((child) => (child as import('three').InstancedMesh).count);
    view.dispose();
    return { firstUpdate, secondUpdate, diagnostics, instanceCounts };
  });

  expect(result).toMatchObject({
    firstUpdate: true,
    secondUpdate: false,
    diagnostics: {
      spans: 256,
      poweredSpans: 128,
      darkSpans: 128,
      segments: 3072,
      poweredSegments: 1536,
      darkSegments: 1536,
      drawCalls: 2,
      rebuildCount: 1,
    },
    instanceCounts: [1536, 1536],
  });
});
