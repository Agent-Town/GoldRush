import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type DetailClass = 'rocks' | 'stumps' | 'dry_grass' | 'wagon_ruts' | 'claim_posts' | 'cactus' | 'reeds';
type ContractId = 'e1-dry-gulch' | 'e1-twin-banks' | 'e1-night-shift';

const ARTIFACT_DIR = path.resolve('artifacts/tile-identity');
const CONTRACTS: readonly ContractId[] = ['e1-dry-gulch', 'e1-twin-banks', 'e1-night-shift'];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openContract(page: Page, contractId: string, seed: string): Promise<void> {
  await page.goto(`/?debug&contract=${contractId}&timescale=3&nolevel&nowaves&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 18);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

test('The Claim keeps the default tile params and seeded flat-claim fingerprint', async ({ page }) => {
  const errors = collectErrors(page);
  await openContract(page, 'the-claim', 'tile-identity-default');
  const first = await defaultClaimFingerprint(page);
  await openContract(page, 'the-claim', 'tile-identity-default');
  const second = await defaultClaimFingerprint(page);

  expect(first.payload.tileParams).toEqual({
    tileId: 'frontier-river-claim',
    biome: 'river-claim',
    river: true,
    ford: true,
    waterSources: [],
    lanes: {
      spawnEdges: ['north', 'south', 'east', 'west'],
      territoryRingBiasWaves: 3,
      territoryRingLaneBias: 0.75,
    },
  });
  expect(first.payload.sim.flat).toBe(true);
  expect(second.hash).toBe(first.hash);
  expectClean(errors);
});

test('E1 contracts load place descriptors, render identity shots, and stay deterministic', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  for (const contractId of CONTRACTS) {
    await openContract(page, contractId, `tile-identity-${contractId}`);
    await shot(page, testInfo, contractId);
    await assertContractIdentity(page, contractId);

    const first = await identityFingerprint(page);
    await openContract(page, contractId, `tile-identity-${contractId}`);
    const second = await identityFingerprint(page);
    expect(second.hash).toBe(first.hash);
  }
  expectClean(errors);
});

async function assertContractIdentity(page: Page, contractId: ContractId): Promise<void> {
  const snapshot = await page.evaluate((id) => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const classCount = (classId: DetailClass) =>
      diagnostics.terrain.detailScatter?.classes.find((entry) => entry.id === classId)?.visibleInstances ?? 0;
    return {
      id,
      contract: diagnostics.contract,
      sim: diagnostics.terrain.sim,
      water: diagnostics.terrain.water,
      classes: {
        cactus: classCount('cactus'),
        reeds: classCount('reeds'),
        dryGrass: classCount('dry_grass'),
      },
      heights: {
        spring: window.__GR_TEST__?.terrainVisualY(-18, -18),
        springRim: window.__GR_TEST__?.terrainVisualY(-18, -26),
        dryWash: window.__GR_TEST__?.terrainVisualY(-12, -14),
        dryMesa: window.__GR_TEST__?.terrainVisualY(24, 24),
        twinBank: window.__GR_TEST__?.terrainVisualY(0, 7),
        twinBackBank: window.__GR_TEST__?.terrainVisualY(0, 16),
      },
      samples: {
        center: window.__GR_TEST__?.terrainSample(0, 0),
        westFord: window.__GR_TEST__?.terrainSample(-16, 0),
        eastFord: window.__GR_TEST__?.terrainSample(16, 0),
      },
      build: diagnostics.build,
      menuIds: diagnostics.ui?.buildables.map((entry) => entry.id) ?? [],
    };
  }, contractId);

  expect(snapshot.contract.activeId).toBe(contractId);
  expect(snapshot.sim.flat).toBe(true);

  if (contractId === 'e1-dry-gulch') {
    expect(snapshot.contract.boardRow.ledgerBlurb).toContain('Mesa country');
    expect(snapshot.contract.tileParams.heightfield?.id).toBe('dry-gulch-mesa-washes');
    expect(snapshot.contract.tileParams.palette?.id).toBe('dry-gulch-ochre-red');
    expect(snapshot.contract.tileParams.scatter?.id).toBe('dry-gulch-cactus-sparse');
    expect(snapshot.water?.riverPresent).toBe(false);
    expect(snapshot.classes.cactus).toBeGreaterThan(0);
    expect((snapshot.heights.springRim ?? 0) - (snapshot.heights.spring ?? 0)).toBeGreaterThan(0.18);
    expect((snapshot.heights.dryMesa ?? 0) - (snapshot.heights.dryWash ?? 0)).toBeGreaterThan(0.08);
  }

  if (contractId === 'e1-twin-banks') {
    expect(snapshot.contract.boardRow.ledgerBlurb).toContain('gravel bars');
    expect(snapshot.contract.tileParams.heightfield?.id).toBe('twin-banks-subtle-relief');
    expect(snapshot.contract.tileParams.water?.id).toBe('twin-banks-braided-river');
    expect(snapshot.water?.riverPresent).toBe(true);
    expect(snapshot.water?.visualHalfWidth).toBeGreaterThan(6.25);
    expect(snapshot.water?.gravelBars).toBe(2);
    expect(snapshot.classes.reeds).toBeGreaterThan(0);
    expect(snapshot.samples.center?.zone).toBe('river');
    expect(snapshot.samples.westFord?.zone).toBe('ford');
    expect(snapshot.samples.eastFord?.zone).toBe('ford');
    expect(Math.abs((snapshot.heights.twinBank ?? 0) - (snapshot.heights.twinBackBank ?? 0))).toBeGreaterThan(0.1);
  }

  if (contractId === 'e1-night-shift') {
    expect(snapshot.contract.boardRow.ledgerBlurb).toContain('lantern');
    expect(snapshot.contract.tileParams.palette?.id).toBe('night-shift-dusk');
    expect(snapshot.contract.tileParams.prePlacedBuildables).toEqual([{ id: 'lantern_post', x: 0, z: 12, rotationSteps: 0 }]);
    expect(snapshot.menuIds).toContain('lantern_post');
    expect(snapshot.build.lanternPosts).toBe(1);
    expect(snapshot.build.lanternPostPositions).toEqual([{ x: 0, z: 12 }]);
    expect(snapshot.contract.tileParams.tileId).toBe('frontier-river-claim');
    expect(snapshot.contract.tileParams.river).toBe(true);
    expect(snapshot.contract.tileParams.ford).toBe(true);
  }
}

async function defaultClaimFingerprint(page: Page): Promise<{ hash: string; payload: any }> {
  const payload = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      activeId: diagnostics.contract.activeId,
      tileParams: diagnostics.contract.tileParams,
      sim: {
        flat: diagnostics.terrain.sim.flat,
        tile: diagnostics.terrain.sim.tile,
        probes: diagnostics.terrain.sim.probes,
      },
      samples: {
        bank: window.__GR_TEST__?.terrainSample(-12, -12),
        river: window.__GR_TEST__?.terrainSample(-12, 0),
        ford: window.__GR_TEST__?.terrainSample(0, 0),
        northBank: window.__GR_TEST__?.terrainSample(12, 12),
      },
      visual: {
        heroStart: window.__GR_TEST__?.terrainVisualY(0, 12),
        nearBank: window.__GR_TEST__?.terrainVisualY(12, 6.25),
        farBank: window.__GR_TEST__?.terrainVisualY(12, -18),
      },
    };
  });
  return { payload, hash: hashPayload(payload) };
}

async function identityFingerprint(page: Page): Promise<{ hash: string; payload: any }> {
  const payload = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      activeId: diagnostics.contract.activeId,
      tileParams: diagnostics.contract.tileParams,
      boardRow: diagnostics.contract.boardRow,
      sim: {
        flat: diagnostics.terrain.sim.flat,
        tile: diagnostics.terrain.sim.tile,
      },
      water: diagnostics.terrain.water
        ? {
            riverPresent: diagnostics.terrain.water.riverPresent,
            fordPresent: diagnostics.terrain.water.fordPresent,
            fordStones: diagnostics.terrain.water.fordStones,
            gravelBars: diagnostics.terrain.water.gravelBars,
            visualHalfWidth: diagnostics.terrain.water.visualHalfWidth,
            springPonds: diagnostics.terrain.water.springPonds,
          }
        : null,
      scatter: {
        classes: diagnostics.terrain.detailScatter?.classes.map((entry) => ({
          id: entry.id,
          instances: entry.instances,
          visibleInstances: entry.visibleInstances,
        })),
        signature: diagnostics.terrain.detailScatter?.signature,
      },
      build: {
        lanternPosts: diagnostics.build.lanternPosts,
        lanternPostPositions: diagnostics.build.lanternPostPositions,
      },
      heights: {
        probes: diagnostics.terrain.height.probes,
        spring: window.__GR_TEST__?.terrainVisualY(-18, -18),
        springRim: window.__GR_TEST__?.terrainVisualY(-18, -26),
        twinBank: window.__GR_TEST__?.terrainVisualY(0, 7),
      },
      samples: {
        center: window.__GR_TEST__?.terrainSample(0, 0),
        westFord: window.__GR_TEST__?.terrainSample(-16, 0),
        eastFord: window.__GR_TEST__?.terrainSample(16, 0),
        spring: window.__GR_TEST__?.terrainSample(-18, -18),
      },
    };
  });
  return { payload, hash: hashPayload(payload) };
}
