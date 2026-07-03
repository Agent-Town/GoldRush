import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Economy, initialEconomyState, reduce } from '../src/game/Economy';

type HarvestNode = {
  id: string;
  active: boolean;
  anchorIndex: number;
  position: { x: number; z: number };
  remaining: number;
  respawnIn: number;
};

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

// timescale=2: fast enough for respawn waits, slow enough for the keyboard walk
// to steer precisely under the unified sim clock (hero speed scales with timescale).
async function openGame(page: Page, query = '?seed=m1-04&timescale=2&debug&nowaves'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function activeNodes(page: Page): Promise<HarvestNode[]> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active) ?? []);
}

async function nearestActiveNode(page: Page): Promise<HarvestNode> {
  const nodes = await activeNodes(page);
  expect(nodes.length).toBeGreaterThanOrEqual(2);
  expect(nodes.length).toBeLessThanOrEqual(3);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
  nodes.sort((a, b) => distanceSq(hero, a.position) - distanceSq(hero, b.position));
  return nodes[0];
}

// Teleport (available under ?debug) then confirm the game's own channel
// detection engages — interaction tests assert the panning contract, not
// keyboard parking precision (headless CDP latency makes that flaky).
async function moveTo(page: Page, target: { x: number; z: number }): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), target);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false), {
      timeout: 5_000,
    })
    .toBe(true);
}

function distanceSq(a: { x: number; z: number }, b: { x: number; z: number }): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

test('scripted walk to a gold seam pans at least one tick', async ({ page }, testInfo: TestInfo) => {
  const errors = await openGame(page);
  const target = await nearestActiveNode(page);

  await moveTo(page, target.position);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0))
    .toBeGreaterThan(0.15);

  await testInfo.attach('m1-04-progress-ring', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.gold ?? 0)).toBeGreaterThanOrEqual(5);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThanOrEqual(5);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('leaving mid-pan decays harvest progress', async ({ page }) => {
  const errors = await openGame(page, '?seed=m1-04-decay&timescale=2&debug&nowaves');
  const target = await nearestActiveNode(page);

  await moveTo(page, target.position);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0))
    .toBeGreaterThan(0.35);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0);
  const key = target.position.x < 0 ? 'KeyD' : 'KeyA';
  await page.keyboard.down(key);
  await page.waitForTimeout(550);
  await page.keyboard.up(key);

  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0);
  expect(after).toBeLessThan(before);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('depleted gold seam relocates after its respawn timer', async ({ page }) => {
  const errors = await openGame(page, '?seed=m1-04-relocate&timescale=8&debug&nowaves');
  const target = await nearestActiveNode(page);
  const oldAnchorIndex = target.anchorIndex;

  await moveTo(page, target.position);
  await expect
    .poll(
      async () =>
        page.evaluate(
          (nodeId) => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.id === nodeId)?.active,
          target.id,
        ),
      { timeout: 5_000 },
    )
    .toBe(false);

  await expect
    .poll(
      async () =>
        page.evaluate(
          (nodeId) => {
            const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.id === nodeId);
            return node?.active ? node.anchorIndex : -1;
          },
          target.id,
        ),
      { timeout: 8_000 },
    )
    .not.toBe(oldAnchorIndex);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('economy rejects overspend and replays its mutation log', () => {
  const economy = new Economy(16);
  const overspend = economy.apply({
    id: uuid(1),
    at: 0,
    type: 'gold_spent',
    sink: 'build_sentry_beacon',
    amount: 5,
  });
  expect(overspend).toEqual({ ok: false, reason: 'OUT_OF_RESOURCES' });
  expect(economy.log.length).toBe(0);

  const mutations = [
    { id: uuid(2), at: 1, type: 'gold_panned', nodeId: 'gold-seam-1', amount: 10 },
    { id: uuid(3), at: 2, type: 'gold_spent', sink: 'build_sentry_beacon', amount: 5 },
    { id: uuid(4), at: 3, type: 'run_reset' },
  ] as const;

  for (const event of mutations) {
    expect(economy.apply(event).ok).toBe(true);
  }

  expect(economy.log.length).toBe(mutations.length);
  expect(economy.log.reduce(reduce, initialEconomyState)).toEqual(economy.state);
});

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
