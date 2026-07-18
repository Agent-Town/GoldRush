import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  CONTRACT_EDITOR_PARAM,
  contractDescriptorJson,
  loadContract,
  parseContractDescriptor,
  type ContractAuthoredTerrainLayer,
  type ContractManifest,
} from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/ed-02-authored-grid');
const QUERY = '/?debug&editor&contract=e1-dry-gulch&nowaves&nospawn&nolevel&seed=ed-02-authored-grid';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test('authored terrain and existing paint outputs cross one bounded descriptor decoder', () => {
  const template = loadContract('e1-dry-gulch');
  const candidate = withAuthoredTerrain(template);
  const bytes = contractDescriptorJson(candidate);
  const parsed = parseContractDescriptor(bytes, template);

  expect(parsed.ok).toBe(true);
  if (!parsed.ok) return;
  expect(contractDescriptorJson(parsed.contract)).toBe(bytes);
  expect(JSON.stringify(parsed.contract.briefing)).toBe(JSON.stringify(candidate.briefing));
  expect(JSON.stringify(parsed.contract.tileParams.palette)).toBe(JSON.stringify(candidate.tileParams.palette));
  expect(parseContractDescriptor(contractDescriptorJson(parsed.contract), template)).toEqual(parsed);

  const reordered = structuredClone(candidate);
  const layer = reordered.tileParams.authoredTerrain!;
  reordered.tileParams.authoredTerrain = {
    heightDeltas: layer.heightDeltas,
    originZ: layer.originZ,
    originX: layer.originX,
    cellSize: layer.cellSize,
    rows: layer.rows,
    columns: layer.columns,
    mode: layer.mode,
    version: layer.version,
  };
  const reorderedBytes = contractDescriptorJson(reordered);
  const reorderedParsed = parseContractDescriptor(reorderedBytes, template);
  expect(reorderedParsed.ok && contractDescriptorJson(reorderedParsed.contract)).toBe(reorderedBytes);

  const invalidLayers = [
    mutate(candidate, (layer) => { layer.version = 2 as 1; }),
    mutate(candidate, (layer) => { layer.mode = 'simulation' as 'visual-delta'; }),
    mutate(candidate, (layer) => { layer.heightDeltas = layer.heightDeltas.slice(1); }),
    mutate(candidate, (layer) => { layer.heightDeltas[4] = Number.NaN; }),
    mutate(candidate, (layer) => { layer.heightDeltas[5] = 17; }),
    mutate(candidate, (layer) => { layer.heightDeltas[0] = 0.1; }),
    mutate(candidate, (layer) => { layer.cellSize = 0.25; }),
    mutate(candidate, (layer) => { layer.originX = -31.5; }),
    mutate(candidate, (layer) => { (layer as unknown as Record<string, unknown>).futureMask = []; }),
    withOverCapGrid(template),
  ];
  for (const invalid of invalidLayers) expect(parseContractDescriptor(contractDescriptorJson(invalid), template).ok).toBe(false);
  expect(parseContractDescriptor(`${' '.repeat(600_000)}${bytes}`, template).ok).toBe(false);
  const inheritedUnknown = JSON.parse(bytes);
  Object.defineProperty(inheritedUnknown, '__proto__', { value: {}, enumerable: true });
  expect(parseContractDescriptor(`${JSON.stringify(inheritedUnknown, null, 2)}\n`, template).ok).toBe(false);

  const sizedTemplate = structuredClone(template);
  sizedTemplate.tileParams.size = 80;
  const sized = structuredClone(sizedTemplate);
  sized.tileParams.authoredTerrain = authoredLayer(80);
  expect(parseContractDescriptor(contractDescriptorJson(sized), sizedTemplate).ok).toBe(true);
  sized.tileParams.size = 72;
  expect(parseContractDescriptor(contractDescriptorJson(sized), sizedTemplate).ok).toBe(false);

  const paint = structuredClone(loadContract('the-claim'));
  paint.tileParams.buildZones = [{ id: 'north-pad', bank: 'north', minX: -8, maxX: 8, minZ: 8, maxZ: 20 }];
  paint.tileParams.waterSources = [{ kind: 'spring_pond', x: -12, z: -10, radius: 4 }];
  paint.tileParams.lanes.spawnEdges = ['north', 'east'];
  expect(parseContractDescriptor(contractDescriptorJson(paint), loadContract('the-claim')).ok).toBe(true);

  const badZone = structuredClone(paint);
  badZone.tileParams.buildZones![0]!.bank = 'middle' as 'north';
  expect(parseContractDescriptor(contractDescriptorJson(badZone), loadContract('the-claim')).ok).toBe(false);
  const badWater = structuredClone(paint);
  badWater.tileParams.waterSources[0]!.kind = 'ocean' as 'spring_pond';
  expect(parseContractDescriptor(contractDescriptorJson(badWater), loadContract('the-claim')).ok).toBe(false);
  const badLane = structuredClone(paint);
  badLane.tileParams.lanes.spawnEdges = ['north', 'north'];
  expect(parseContractDescriptor(contractDescriptorJson(badLane), loadContract('the-claim')).ok).toBe(false);
  badLane.tileParams.lanes.spawnEdges = [];
  expect(parseContractDescriptor(contractDescriptorJson(badLane), loadContract('the-claim')).ok).toBe(false);
});

test('session document changes visual height across reload while the sim fingerprint stays identical', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await ready(page);
  const baseline = await probe(page);
  const template = loadContract('e1-dry-gulch');
  const bytes = contractDescriptorJson(withAuthoredTerrain(template));

  const staging = await page.evaluate(
    async ({ bytes, contractId }) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as any;
      const base = registry.loadContract(contractId);
      const accepted = registry.stageContractEditorDocument(bytes, base);
      const key = `${registry.CONTRACT_EDITOR_DOCUMENT_KEY}:${contractId}`;
      const stored = sessionStorage.getItem(key);
      const hostile = JSON.parse(bytes);
      hostile.tileParams.authoredTerrain.futureMask = [];
      const rejected = registry.stageContractEditorDocument(JSON.stringify(hostile), base);
      return {
        accepted: accepted.ok,
        rejected: rejected.ok,
        stored,
        unchangedAfterReject: sessionStorage.getItem(key) === stored,
      };
    },
    { bytes, contractId: template.id },
  );

  expect(staging).toEqual({ accepted: true, rejected: false, stored: bytes, unchangedAfterReject: true });
  await page.reload();
  await ready(page);
  expect(new URL(page.url()).searchParams.get(CONTRACT_EDITOR_PARAM)).toBeNull();
  const authored = await probe(page);

  expect(authored.contract.tileParams.authoredTerrain).toEqual(authoredLayer());
  expect(authored.visual.fractional - baseline.visual.fractional).toBeCloseTo(0.4375, 8);
  expect(authored.visual.boundary - baseline.visual.boundary).toBeCloseTo(0, 12);
  expect(authored.visual.outside - baseline.visual.outside).toBeCloseTo(0, 12);
  expect(authored.sim).toEqual(baseline.sim);
  expect(simHash(authored.sim)).toBe(simHash(baseline.sim));

  await page.reload();
  await ready(page);
  expect(await page.evaluate(() => window.__GR_TEST__?.activeContract().tileParams.authoredTerrain)).toEqual(authoredLayer());

  await page.goto('/?debug&nowaves&nospawn&nolevel&seed=ed-02-plain-boot');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_TEST__ !== undefined);
  expect(await page.evaluate(() => window.__GR_TEST__?.activeContract().tileParams.authoredTerrain)).toBeUndefined();
  expect(await page.getByTestId('descriptor-inspector').count()).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.probes)).toEqual({
    heroStart: 0.3108261525630951,
    river: -0.3954502046108246,
    ford: -0.09651920944452286,
    nearBank: 0.4356691837310791,
    farBank: 0.9647302031517029,
  });

  const report = {
    project: testInfo.project.name,
    visualBaseline: baseline.visual,
    visualAuthored: authored.visual,
    fractionalVisualDelta: authored.visual.fractional - baseline.visual.fractional,
    simHashBaseline: simHash(baseline.sim),
    simHashAuthored: simHash(authored.sim),
    sessionBytes: bytes.length,
  };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-substrate.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function authoredLayer(size = 64): ContractAuthoredTerrainLayer {
  return {
    version: 1,
    mode: 'visual-delta',
    columns: 4,
    rows: 4,
    cellSize: size / 3,
    originX: -size / 2,
    originZ: -size / 2,
    heightDeltas: [0, 0, 0, 0, 0, 1, 0.5, 0, 0, -0.25, 0.75, 0, 0, 0, 0, 0],
  };
}

function withAuthoredTerrain(template: ContractManifest): ContractManifest {
  const contract = structuredClone(template);
  contract.tileParams.authoredTerrain = authoredLayer();
  return contract;
}

function mutate(contract: ContractManifest, change: (layer: ContractAuthoredTerrainLayer) => void): ContractManifest {
  const candidate = structuredClone(contract);
  change(candidate.tileParams.authoredTerrain!);
  return candidate;
}

function withOverCapGrid(template: ContractManifest): ContractManifest {
  const candidate = structuredClone(template);
  const dimension = 42;
  candidate.tileParams.authoredTerrain = {
    version: 1,
    mode: 'visual-delta',
    columns: dimension,
    rows: dimension,
    cellSize: 64 / (dimension - 1),
    originX: -32,
    originZ: -32,
    heightDeltas: Array(dimension * dimension).fill(0),
  };
  return candidate;
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_TEST__ !== undefined && window.__GR_EDITOR__ !== undefined,
  );
}

async function probe(page: Page): Promise<{
  visual: { fractional: number; boundary: number; outside: number };
  sim: unknown[];
  contract: ContractManifest;
}> {
  return page.evaluate(() => ({
    visual: {
      fractional: window.__GR_TEST__!.terrainVisualY(-16 / 3, 0),
      boundary: window.__GR_TEST__!.terrainVisualY(-32, 0),
      outside: window.__GR_TEST__!.terrainVisualY(32.01, 0),
    },
    sim: [
      window.__GR_TEST__!.terrainSim(-16 / 3, 0),
      window.__GR_TEST__!.terrainSim(-12, -8),
      window.__GR_TEST__!.terrainSim(12, 8),
    ],
    contract: window.__GR_TEST__!.activeContract(),
  }));
}

function simHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
