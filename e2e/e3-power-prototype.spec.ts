import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  POWER_GRAPH_LIMITS,
  PowerGraphSystem,
  devPowerGraphDefinition,
  normalizePowerGraphDefinition,
  type PowerGraphDefinition,
  type PowerNodeInput,
  type PowerWireInput,
} from '../src/systems/PowerGraph';

const ARTIFACT_DIR = 'artifacts/e3-power-prototype';
const DEV_QUERY = '?debug&powergraph&nowaves&nolevel&nopause&seed=e3-power-prototype';
const FIXED_STEP_SECONDS = 1 / 30;
const TRUNK_WIRE_ID = 'relay-east--relay-west';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(90_000);
test.describe.configure({ mode: 'serial' });

test('normalizer is permutation-stable, bounded, and fail-closed', () => {
  const source = devPowerGraphDefinition();
  const expected = normalizePowerGraphDefinition(source);
  expect(expected.ok).toBe(true);

  const permuted: PowerGraphDefinition = {
    id: source.id,
    nodes: [...source.nodes].reverse(),
    wires: [...source.wires].reverse().map((wire) => ({ a: wire.b, b: wire.a, state: wire.state })),
  };
  expect(normalizePowerGraphDefinition(permuted)).toEqual(expected);

  const duplicateNode = clone(source);
  duplicateNode.nodes = [...duplicateNode.nodes, { ...duplicateNode.nodes[0]! }];
  expect(normalizePowerGraphDefinition(duplicateNode)).toEqual({ ok: false, code: 'node-duplicate' });

  const selfWire = clone(source);
  selfWire.wires = [{ a: source.nodes[0]!.id, b: source.nodes[0]!.id, state: 'intact' }];
  expect(normalizePowerGraphDefinition(selfWire)).toEqual({ ok: false, code: 'wire-self' });

  const missingNode = clone(source);
  missingNode.wires = [{ a: source.nodes[0]!.id, b: 'missing', state: 'intact' }];
  expect(normalizePowerGraphDefinition(missingNode)).toEqual({ ok: false, code: 'wire-missing-node' });

  const duplicateWire = clone(source);
  const firstWire = duplicateWire.wires[0]!;
  duplicateWire.wires = [firstWire, { a: firstWire.b, b: firstWire.a, state: firstWire.state }];
  expect(normalizePowerGraphDefinition(duplicateWire)).toEqual({ ok: false, code: 'wire-duplicate' });
  duplicateWire.wires = [...duplicateWire.wires].reverse();
  expect(normalizePowerGraphDefinition(duplicateWire)).toEqual({ ok: false, code: 'wire-duplicate' });

  const longWire = clone(source);
  const far = longWire.nodes.find((node) => node.id === 'consumer-gamma')!;
  const near = longWire.nodes.find((node) => node.id === 'producer-alpha')!;
  longWire.wires = [{ a: far.id, b: near.id, state: 'intact' }];
  expect(normalizePowerGraphDefinition(longWire)).toEqual({ ok: false, code: 'wire-too-long' });

  const tooManyNodes = clone(source);
  tooManyNodes.nodes = Array.from({ length: POWER_GRAPH_LIMITS.maxNodes + 1 }, (_, index) => relay(`limit-${index}`, index * 0.01, 0));
  expect(normalizePowerGraphDefinition(tooManyNodes)).toEqual({ ok: false, code: 'node-limit' });

  const tooManyWires = clone(source);
  tooManyWires.wires = Array.from({ length: POWER_GRAPH_LIMITS.maxWires + 1 }, () => ({ ...source.wires[0]! }));
  expect(normalizePowerGraphDefinition(tooManyWires)).toEqual({ ok: false, code: 'wire-limit' });

  const excessiveWatts = clone(source);
  const producerNode = excessiveWatts.nodes.find((node) => node.kind === 'producer')! as Extract<PowerNodeInput, { kind: 'producer' }>;
  producerNode.outputWatts = POWER_GRAPH_LIMITS.maxNodeWatts + 1;
  expect(normalizePowerGraphDefinition(excessiveWatts)).toEqual({ ok: false, code: 'node-value' });

  const hostile = clone(source) as unknown as Record<string, any>;
  hostile.nodes[0].x = Number.NaN;
  expect(normalizePowerGraphDefinition(hostile)).toEqual({ ok: false, code: 'node-value' });

  const cyclic: Record<string, any> = { id: 'cycle', labelKey: 'cycle', kind: 'relay', x: 0, z: 0, online: true };
  cyclic.extra = cyclic;
  expect(normalizePowerGraphDefinition({ id: 'cycle', nodes: [cyclic], wires: [] })).toEqual({ ok: false, code: 'node-value' });
  expect(normalizePowerGraphDefinition({ id: 'bigint', nodes: [{ ...relay('bigint', 0, 0), x: 1n }], wires: [] })).toEqual({ ok: false, code: 'node-value' });

  const system = new PowerGraphSystem(source);
  expect(Object.isFrozen(system.snapshot())).toBe(true);
  expect(Object.isFrozen(system.snapshot().nodes)).toBe(true);
  expect(Object.isFrozen(system.snapshot().nodes[0])).toBe(true);
});

test('priority, online state, loop cuts, repair, and reset are deterministic', () => {
  const priority = new PowerGraphSystem(priorityFixture());
  expect(allocation(priority, 'consumer-alpha')).toEqual({ state: 'powered', allocatedWatts: 4, allocationRatio: 1 });
  expect(allocation(priority, 'consumer-beta')).toEqual({ state: 'browned-out', allocatedWatts: 1, allocationRatio: 0.25 });

  expect(priority.queueCommand({ type: 'set-priority', nodeId: 'consumer-beta', priority: 0 })).toBe(true);
  expect(priority.step(11)).toBe(true);
  expect(allocation(priority, 'consumer-alpha')).toEqual({ state: 'browned-out', allocatedWatts: 1, allocationRatio: 0.25 });
  expect(allocation(priority, 'consumer-beta')).toEqual({ state: 'powered', allocatedWatts: 4, allocationRatio: 1 });
  expect(priority.diagnostics().events.slice(-2).every((event) => event.tick === 11)).toBe(true);
  expect(priority.snapshot()).toMatchObject({ topologyRevision: 0, allocationRevision: 1 });

  expect(priority.queueCommand({ type: 'set-node-online', nodeId: 'consumer-beta', online: false })).toBe(true);
  priority.step(12);
  expect(priority.snapshot().totalDemandWatts).toBe(4);
  expect(allocation(priority, 'consumer-beta')).toEqual({ state: 'dark', allocatedWatts: 0, allocationRatio: 0 });
  expect(priority.snapshot()).toMatchObject({ topologyRevision: 0, allocationRevision: 2 });

  const loop = new PowerGraphSystem(loopFixture());
  const initialSignature = loop.snapshot().signature;
  expect(allocation(loop, 'consumer')).toMatchObject({ state: 'powered' });
  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'cut' })).toBe(true);
  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'intact' })).toBe(true);
  expect(loop.step(0)).toBe(false);
  expect(loop.snapshot()).toMatchObject({ signature: initialSignature, topologyRevision: 0, allocationRevision: 0 });
  expect(loop.diagnostics().solveCount).toBe(1);

  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'cut' })).toBe(true);
  loop.step(1);
  expect(allocation(loop, 'consumer')).toMatchObject({ state: 'powered' });
  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-b', state: 'cut' })).toBe(true);
  loop.step(2);
  expect(allocation(loop, 'consumer')).toEqual({ state: 'dark', allocatedWatts: 0, allocationRatio: 0 });
  expect(loop.diagnostics().events.at(-1)).toMatchObject({ tick: 2, nodeId: 'consumer', from: 'powered', to: 'dark' });
  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'intact' })).toBe(true);
  loop.step(3);
  expect(allocation(loop, 'consumer')).toMatchObject({ state: 'powered' });
  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'intact' })).toBe(false);

  expect(loop.queueCommand({ type: 'set-wire-state', wireId: 'consumer--relay-a', state: 'cut' })).toBe(true);
  loop.reset(0);
  expect(loop.snapshot()).toMatchObject({ signature: initialSignature, topologyRevision: 0, allocationRevision: 0, tick: 0 });
  expect(loop.step(4)).toBe(false);
  expect(loop.diagnostics()).toMatchObject({ solveCount: 1, cutWireCount: 0 });
});

test('powergraph alias is dormant between mutations and renders its read model', async ({ page }, testInfo) => {
  const errors = await openGame(page, DEV_QUERY);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power);
  expect(before).toMatchObject({
    active: true,
    id: 'e3-dev-power-graph',
    solveCount: 1,
    nodeCount: 6,
    wireCount: 4,
    intactWireCount: 4,
    cutWireCount: 0,
    totalSupplyWatts: 5,
    totalDemandWatts: 13,
    render: { active: true, spans: 4, intactSpans: 4, cutSpans: 0, drawCalls: 1, rebuildCount: 1 },
  });
  expect(allocationFromNodes(before.nodes, 'consumer-alpha')).toEqual({ state: 'powered', allocatedWatts: 3, allocationRatio: 1 });
  expect(allocationFromNodes(before.nodes, 'consumer-beta')).toEqual({ state: 'browned-out', allocatedWatts: 2, allocationRatio: 0.5 });
  expect(await page.evaluate(() => window.__GR_CONTRACT_REGISTRY__!.activeTileDescriptor())).toMatchObject({ id: 'gt-test-basin' });

  const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.frame);
  await page.waitForFunction((start) => window.__THREE_GAME_DIAGNOSTICS__!.frame >= start + 20, frame);
  const idle = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power);
  expect(idle).toMatchObject({ solveCount: 1, signature: before.signature, render: { rebuildCount: 1 } });

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-read-model.png`, fullPage: false });
  await clean(errors);
});

test('powergraph without debug performs no graph work', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?powergraph&nowaves&nolevel&nopause&seed=e3-power-no-debug');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({
    active: false,
    nodeCount: 0,
    wireCount: 0,
    solveCount: 0,
    render: { active: false, spans: 0, rebuildCount: 0 },
  });
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  await clean(errors);
});

test('debug commands commit on the next fixed tick and the view follows topology only', async ({ page }, testInfo) => {
  const errors = await openGame(page, DEV_QUERY);
  const before = await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    return window.__THREE_GAME_DIAGNOSTICS__!.power;
  });

  expect(await queue(page, { type: 'set-wire-state', wireId: TRUNK_WIRE_ID, state: 'cut' })).toBe(true);
  expect(await queue(page, { type: 'set-wire-state', wireId: TRUNK_WIRE_ID, state: 'cut' })).toBe(false);
  const queued = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power);
  expect(queued).toMatchObject({ signature: before.signature, solveCount: before.solveCount, topologyRevision: 0 });

  const cut = await advanceAndRead(page);
  expect(cut).toMatchObject({ solveCount: 2, topologyRevision: 1, allocationRevision: 1, intactWireCount: 3, cutWireCount: 1 });
  expect(cut.render).toMatchObject({ topologyRevision: 1, rebuildCount: 2, intactSpans: 3, cutSpans: 1, drawCalls: 2 });
  expect(allocationFromNodes(cut.nodes, 'consumer-beta')).toEqual({ state: 'dark', allocatedWatts: 0, allocationRatio: 0 });
  expect(cut.events.slice(-2).map((event) => ({ nodeId: event.nodeId, tick: event.tick }))).toEqual([
    { nodeId: 'consumer-beta', tick: cut.tick },
    { nodeId: 'relay-east', tick: cut.tick },
  ]);
  const cutPresentationFrame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.frame);
  await page.waitForFunction((frame) => window.__THREE_GAME_DIAGNOSTICS__!.frame > frame, cutPresentationFrame);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-cut-read-model.png`, fullPage: false });

  expect(await queue(page, { type: 'set-wire-state', wireId: TRUNK_WIRE_ID, state: 'intact' })).toBe(true);
  const repaired = await advanceAndRead(page);
  expect(repaired).toMatchObject({ signature: before.signature, solveCount: 3, topologyRevision: 2, allocationRevision: 2 });
  expect(repaired.render).toMatchObject({ topologyRevision: 2, rebuildCount: 3, drawCalls: 1 });

  expect(await queue(page, { type: 'set-priority', nodeId: 'consumer-beta', priority: 0 })).toBe(true);
  const prioritized = await advanceAndRead(page);
  expect(prioritized).toMatchObject({ topologyRevision: 2, allocationRevision: 3, solveCount: 4 });
  expect(prioritized.render).toMatchObject({ topologyRevision: 2, rebuildCount: 3 });
  expect(allocationFromNodes(prioritized.nodes, 'consumer-alpha')).toEqual({ state: 'browned-out', allocatedWatts: 1, allocationRatio: 1 / 3 });
  expect(allocationFromNodes(prioritized.nodes, 'consumer-beta')).toEqual({ state: 'powered', allocatedWatts: 4, allocationRatio: 1 });
  expect(await queue(page, { type: 'set-priority', nodeId: 'missing', priority: 1 })).toBe(false);
  await clean(errors);
});

test('30, 60, and 144 Hz render schedules end on one authoritative graph', async ({ page }) => {
  const errors = collectErrors(page);
  const snapshots: string[] = [];
  for (const fps of [30, 60, 144]) {
    await gotoGame(page, DEV_QUERY);
    snapshots.push(await page.evaluate(({ fps, wireId }) => {
      const harness = window.__GR_TEST__!;
      harness.setManualSim(true);
      const startTick = window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick;
      const initialEventSeq = window.__THREE_GAME_DIAGNOSTICS__!.power.events.at(-1)?.seq ?? 0;
      harness.queuePowerGraphCommand({ type: 'set-wire-state', wireId, state: 'cut' });
      const schedule = harness.driveRenderSchedule(1, fps);
      const power = window.__THREE_GAME_DIAGNOSTICS__!.power;
      return JSON.stringify({
        simTicks: schedule.simTicks,
        signature: power.signature,
        nodes: power.nodes,
        wires: power.wires,
        components: power.components,
        events: power.events
          .filter((event) => event.seq > initialEventSeq)
          .map((event) => ({ nodeId: event.nodeId, from: event.from, to: event.to, relativeTick: event.tick - startTick })),
        topologyRevision: power.topologyRevision,
        allocationRevision: power.allocationRevision,
        render: {
          topologyRevision: power.render.topologyRevision,
          rebuildCount: power.render.rebuildCount,
          spans: power.render.spans,
          intactSpans: power.render.intactSpans,
          cutSpans: power.render.cutSpans,
          drawCalls: power.render.drawCalls,
        },
      });
    }, { fps, wireId: TRUNK_WIRE_ID }));
  }
  expect(new Set(snapshots).size).toBe(1);
  expect(JSON.parse(snapshots[0]!)).toMatchObject({
    simTicks: 30,
    topologyRevision: 1,
    allocationRevision: 1,
    events: [
      { nodeId: 'consumer-beta', relativeTick: 1 },
      { nodeId: 'relay-east', relativeTick: 1 },
    ],
    render: { topologyRevision: 1, rebuildCount: 2, spans: 4, intactSpans: 3, cutSpans: 1, drawCalls: 2 },
  });
  await clean(errors);
});

function priorityFixture(): PowerGraphDefinition {
  return {
    id: 'priority-fixture',
    nodes: [
      producer('producer', 0, 0, 5),
      consumer('consumer-alpha', 2, 0, 4, 10),
      consumer('consumer-beta', 0, 2, 4, 10),
    ],
    wires: [wire('producer', 'consumer-alpha'), wire('producer', 'consumer-beta')],
  };
}

function loopFixture(): PowerGraphDefinition {
  return {
    id: 'loop-fixture',
    nodes: [producer('producer', 0, 0, 4), relay('relay-a', 2, 0), relay('relay-b', 0, 2), consumer('consumer', 2, 2, 4, 10)],
    wires: [wire('producer', 'relay-a'), wire('relay-a', 'consumer'), wire('producer', 'relay-b'), wire('relay-b', 'consumer')],
  };
}

function producer(id: string, x: number, z: number, outputWatts: number): PowerNodeInput {
  return { id, labelKey: id, kind: 'producer', x, z, online: true, outputWatts };
}

function relay(id: string, x: number, z: number): PowerNodeInput {
  return { id, labelKey: id, kind: 'relay', x, z, online: true };
}

function consumer(id: string, x: number, z: number, drawWatts: number, priority: number): PowerNodeInput {
  return { id, labelKey: id, kind: 'consumer', x, z, online: true, drawWatts, priority };
}

function wire(a: string, b: string): PowerWireInput {
  return { a, b, state: 'intact' };
}

function allocation(system: PowerGraphSystem, id: string): { state: string; allocatedWatts: number; allocationRatio: number } {
  return allocationFromNodes(system.snapshot().nodes, id);
}

function allocationFromNodes(
  nodes: ReadonlyArray<{ id: string; state: string; allocatedWatts: number; allocationRatio: number }>,
  id: string,
): { state: string; allocatedWatts: number; allocationRatio: number } {
  const node = nodes.find((entry) => entry.id === id)!;
  return { state: node.state, allocatedWatts: node.allocatedWatts, allocationRatio: node.allocationRatio };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await gotoGame(page, query);
  return errors;
}

async function gotoGame(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function queue(page: Page, command: Parameters<NonNullable<Window['__GR_TEST__']>['queuePowerGraphCommand']>[0]): Promise<boolean> {
  return page.evaluate((value) => window.__GR_TEST__!.queuePowerGraphCommand(value), command);
}

async function advanceAndRead(page: Page) {
  return page.evaluate((seconds) => {
    window.__GR_TEST__!.advanceSim(seconds);
    return window.__THREE_GAME_DIAGNOSTICS__!.power;
  }, FIXED_STEP_SECONDS);
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clean(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}
