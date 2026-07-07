import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; consoleWarnings: string[]; pageErrors: string[] };
type BuildableId = 'sluice';

const ARTIFACT_DIR = path.resolve('artifacts/e1-dry-gulch');
const DRY_QUERY = '?debug&contract=e1-dry-gulch&timescale=8&nolevel&nowaves&seed=e1-dry-gulch';
const POND = { x: -18, z: -18 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], consoleWarnings: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
    if (message.type() === 'warning') bucket.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = DRY_QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function selectBuildable(page: Page, id: BuildableId): Promise<void> {
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe(id);
}

async function armBuildAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await teleport(page, x, z + 2);
  await selectBuildable(page, id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos)).toEqual({ x, z });
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleWarnings.filter((message) => /contract|dry gulch/i.test(message))).toEqual([]);
}

test('loads Dry Gulch via debug param and suppresses bad contract fallback to diagnostics', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=missing-contract&timescale=3&nowaves&seed=e1-dry-missing');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason)).toBe('unknown-contract');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.warningSuppressed)).toBe(true);

  await openGame(page, '?contract=e1-dry-gulch&timescale=3&nowaves&seed=e1-dry-nodebug');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason)).toBe('debug-disabled');

  await openGame(page);
  const contract = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    registry: window.__GR_CONTRACT_REGISTRY__?.loadContract('e1-dry-gulch'),
    active: window.__GR_TEST__?.activeContract(),
    simTile: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.tile,
  }));
  expect(contract.diagnostics?.activeId).toBe('e1-dry-gulch');
  expect(contract.active?.id).toBe('e1-dry-gulch');
  expect(contract.registry?.boardRow).toMatchObject({
    name: 'The Dry Gulch',
    ledgerBlurb: expect.stringContaining('Water is scarce'),
    tags: ['trail'],
    unlock: 'wave10OnClaim',
  });
  expect(contract.simTile).toBe('e1-dry-gulch');
  await shot(page, testInfo, 'gulch-overview');
  expectClean(errors);
});

test('removes river and ford collision while keeping the spring as the only water source', async ({ page }) => {
  const errors = await openGame(page);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(diagnostics.terrain.water?.riverPresent).toBe(false);
  expect(diagnostics.terrain.water?.fordPresent).toBe(false);
  expect(diagnostics.terrain.water?.springPonds).toBe(1);

  const samples = await page.evaluate(() =>
    [-28, -12, 0, 12, 28].flatMap((x) =>
      [-4, 0, 4].map((z) => ({ x, z, sample: window.__GR_TEST__?.terrainSample(x, z) })),
    ),
  );
  expect(samples.every((entry) => entry.sample?.walkable === true)).toBe(true);
  expect(samples.map((entry) => entry.sample?.zone)).not.toContain('river');
  expect(samples.map((entry) => entry.sample?.zone)).not.toContain('ford');
  expect(await page.evaluate(() => window.__GR_TEST__?.terrainSample(-18, -18)?.waterSource)).toBe('spring_pond');
  expectClean(errors);
});

test('sluice placement rejects away from the pond and accepts beside it', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  await grantGold(page, 120);

  await armBuildAt(page, 'sluice', 0, 7);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await shot(page, testInfo, 'rejection-feedback');
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(false);
  expect(await buildableCount(page, 'sluice')).toBe(0);

  await armBuildAt(page, 'sluice', POND.x, POND.z + 3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, 'sluice')).toBe(1);
  await shot(page, testInfo, 'pond-sluice');
  expectClean(errors);
});

test('Dry Gulch seam panning uses the +40% contract yield multiplier', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-dry-gulch&timescale=10&nolevel&nowaves&seed=e1-dry-yield');
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();
  await teleport(page, node!.position.x, node!.position.z);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const event = (window.__GR_TEST__?.economyLog() ?? []).findLast((entry) => {
            return typeof entry === 'object' && entry !== null && (entry as { type?: string }).type === 'gold_panned';
          }) as { amount?: number } | undefined;
          return event?.amount ?? 0;
        }),
      { timeout: 10_000 },
    )
    .toBe(Balance.goldSeam.tickGold * Balance.contracts.dryGulch.seamYieldMult);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.seamYieldMult)).toBe(1.4);
  expectClean(errors);
});

test('contract lane constants allow all four spawn edges', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-dry-gulch&timescale=20&nolevel&nokill&nopause&nosteal&nowreck&seed=e1-dry-spawns',
  );
  for (const [key, value] of [
    ['enemy.speed', 0],
    ['waves.graceSeconds', 0.1],
    ['waves.waveInterval', 2],
    ['waves.trickleInterval', 999],
    ['waves.pulseBase', 4],
    ['waves.pulsePerWave', 0],
    ['waves.pulsesPerWave', 1],
    ['waves.edgesPerPulse', 4],
    ['waves.aliveCap', 8],
  ] as const) {
    await expect(page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value])).resolves.toBe(true);
  }
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(4);
  const edges = await page.evaluate(() => [...new Set(window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.edge).filter(Boolean))].sort());
  expect(edges).toEqual(['east', 'north', 'south', 'west']);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.lanes.spawnEdges)).toEqual([
    'north',
    'south',
    'east',
    'west',
  ]);
  expectClean(errors);
});

test('seeded Dry Gulch diagnostics are stable', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-dry-gulch&timescale=3&nolevel&nowaves&seed=e1-dry-stable');
  const first = await determinismSnapshot(page);
  await openGame(page, '?debug&contract=e1-dry-gulch&timescale=3&nolevel&nowaves&seed=e1-dry-stable');
  const second = await determinismSnapshot(page);
  expect(second).toEqual(first);
  expectClean(errors);
});

async function determinismSnapshot(page: Page): Promise<unknown> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: diagnostics.contract.activeId,
      water: diagnostics.terrain.water,
      height: diagnostics.terrain.height.probes,
      scatter: diagnostics.terrain.detailScatter?.signature ?? null,
      harvest: diagnostics.harvest.activeNodes.map((node) => ({
        active: node.active,
        anchorIndex: node.anchorIndex,
        position: node.position,
        remaining: node.remaining,
      })),
      samples: [
        window.__GR_TEST__?.terrainSample(0, 0),
        window.__GR_TEST__?.terrainSample(-18, -18),
        window.__GR_TEST__?.terrainSample(-18, -15),
      ],
    };
  });
}
