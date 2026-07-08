import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = 'artifacts/e3-power';
const DEV_QUERY = '?debug&power=dev&nowaves&nolevel&nopause&seed=e3-power-dev';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(60_000);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
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

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: false });
}

async function clean(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('flag-off boot has zero power graph work', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&nopause&seed=e3-power-off');
  const snapshot = await page.evaluate(() => ({
    power: window.__THREE_GAME_DIAGNOSTICS__?.power,
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
  }));

  expect(snapshot.tile).toEqual({ id: 'frontier-river-claim', biome: 'river-claim' });
  expect(snapshot.power).toMatchObject({
    active: false,
    nodeCount: 0,
    wireCount: 0,
    solveCount: 0,
    totalSupply: 0,
    totalDemand: 0,
    render: { active: false, spans: 0, drawCalls: 0 },
  });
  await clean(errors);
});

test('dev graph solves producer, pylons, consumers, invalid span, and brown-out branch', async ({ page }, testInfo) => {
  const errors = await openGame(page, DEV_QUERY);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.power.solveCount ?? 0)).toBeGreaterThan(1);

  const snapshot = await page.evaluate(() => ({
    power: window.__THREE_GAME_DIAGNOSTICS__!.power,
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    layer: window.__THREE_GAME_DIAGNOSTICS__?.renderLayerOf('gameplay'),
  }));

  expect(snapshot.tile).toMatchObject({ id: 'gt-test-basin', biome: 'dev-basin' });
  expect(snapshot.power).toMatchObject({
    active: true,
    id: 'e3-dev-power-graph',
    budgetMs: 0.5,
    nodeCount: 6,
    wireCount: 5,
    validWireCount: 4,
    invalidWireCount: 1,
    totalSupply: 5,
    totalDemand: 13,
    render: { active: true, renderSlot: 'gameplay', spans: 5, drawCalls: 2 },
  });
  expect(snapshot.power.render.renderLayer).toBe(snapshot.layer);
  expect(snapshot.power.lastSolveMs).toBeLessThan(0.5);
  expect(snapshot.power.overBudget).toBe(false);

  const states = Object.fromEntries(snapshot.power.nodes.map((node) => [node.id, node.state]));
  expect(states).toEqual({
    'consumer-alpha': 'powered',
    'consumer-beta': 'browned-out',
    'consumer-gamma': 'dark',
    'producer-alpha': 'powered',
    'relay-east': 'powered',
    'relay-west': 'powered',
  });
  expect(snapshot.power.wires.find((wire) => wire.id === 'consumer-gamma--relay-east')).toMatchObject({
    length: 14,
    maxLength: 9,
    valid: false,
  });
  expect(snapshot.power.events.map((event) => `${event.nodeId}:${event.from ?? 'new'}>${event.to}`)).toEqual([
    'consumer-alpha:new>powered',
    'consumer-beta:new>browned-out',
    'consumer-gamma:new>dark',
    'producer-alpha:new>powered',
    'relay-east:new>powered',
    'relay-west:new>powered',
  ]);
  await shot(page, testInfo, 'dev-catenary');
  await clean(errors);
});

test('dev graph is deterministic across seeded runs', async ({ page }) => {
  const errors = collectErrors(page);

  await gotoGame(page, DEV_QUERY);
  const a = await graphHash(page);
  await gotoGame(page, DEV_QUERY);
  const b = await graphHash(page);
  expect(a).toBe(b);
  await clean(errors);
});

async function graphHash(page: Page): Promise<string> {
  return page.evaluate(() => {
    const power = window.__THREE_GAME_DIAGNOSTICS__!.power;
    return JSON.stringify({
      signature: power.signature,
      nodes: power.nodes,
      wires: power.wires,
      components: power.components,
      events: power.events,
      render: power.render,
    });
  });
}
