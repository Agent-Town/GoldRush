import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { applyTerrainBrush, type TerrainBrushAction } from '../src/editor/TerrainBrush';
import {
  contractDescriptorJson,
  loadContract,
  parseContractDescriptor,
  type ContractAuthoredTerrainLayer,
  type ContractManifest,
} from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/ed-02-terrain-brush');
const QUERY = '/?editor&contract=e2-hill-mine&seed=ed-02-terrain-brush&nospawn&nolevel';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'gr.ed02.brush.test.initialized';
    if (sessionStorage.getItem(key) === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(key, '1');
  });
});

test('brush model writes deterministic grid strokes and existing paint shapes', () => {
  const template = loadContract('e2-hill-mine');
  const baseline = structuredClone(template);
  const edited = structuredClone(template);

  expect(applyTerrainBrush(edited, action('raise', [{ x: 0, z: 0 }], 2, 0.5)).changed).toBe(true);
  const layer = edited.tileParams.authoredTerrain!;
  expect(layer).toMatchObject({ version: 1, mode: 'visual-delta', columns: 41, rows: 41, originX: -48, originZ: -48, cellSize: 2.4 });
  expect(layer.heightDeltas[gridIndex(layer, 0, 0)]).toBe(0.5);

  expect(applyTerrainBrush(edited, action('lower', [{ x: 12, z: 0 }], 2, 0.5)).changed).toBe(true);
  expect(layerValue(edited, 12, 0)).toBe(-0.5);
  expect(applyTerrainBrush(edited, action('smooth', [{ x: 0, z: 0 }], 1, 1)).changed).toBe(true);
  expect(layerValue(edited, 0, 0)).toBeGreaterThan(0);
  expect(layerValue(edited, 0, 0)).toBeLessThan(0.5);

  expect(applyTerrainBrush(edited, action('zone', [{ x: -12, z: -12 }, { x: 12, z: -24 }], 2, 0.5, 'south')).changed).toBe(true);
  expect(edited.tileParams.buildZones?.at(-1)).toEqual({
    id: 'editor-zone-1',
    bank: 'south',
    minX: -12,
    maxX: 12,
    minZ: -24,
    maxZ: -12,
  });
  expect(applyTerrainBrush(edited, action('water', [{ x: -20, z: -20 }], 2)).changed).toBe(true);
  expect(edited.tileParams.waterSources.at(-1)).toEqual({ kind: 'spring_pond', x: -20, z: -20, radius: 4.8 });
  expect(edited.tileParams.lanes.spawnEdges).not.toContain('south');
  expect(applyTerrainBrush(edited, action('lane', [{ x: 0, z: -48 }], 2)).changed).toBe(true);
  expect(edited.tileParams.lanes.spawnEdges).toEqual(['west', 'east', 'north', 'south']);

  const bytes = contractDescriptorJson(edited);
  const parsed = parseContractDescriptor(bytes, template);
  expect(parsed.ok && contractDescriptorJson(parsed.contract)).toBe(bytes);
  expect(withoutBrushFields(edited)).toBe(withoutBrushFields(baseline));
  expect(layer.heightDeltas.slice(0, layer.columns).every((value) => value === 0)).toBe(true);
  expect(layer.heightDeltas.slice(-layer.columns).every((value) => value === 0)).toBe(true);

  const sparse = structuredClone(template);
  const dense = structuredClone(template);
  applyTerrainBrush(sparse, action('raise', [{ x: -12, z: 0 }, { x: 0, z: 4.8 }], 2, 0.5));
  applyTerrainBrush(dense, action('raise', [{ x: -12, z: 0 }, { x: -7.2, z: 1.92 }, { x: -2.4, z: 3.84 }, { x: 0, z: 4.8 }], 2, 0.5));
  expect(dense.tileParams.authoredTerrain).toEqual(sparse.tileParams.authoredTerrain);

  const zeroSize = structuredClone(template);
  zeroSize.tileParams.size = 0;
  expect(applyTerrainBrush(zeroSize, action('raise', [{ x: 0, z: 0 }])).changed).toBe(false);
  expect(zeroSize.tileParams.authoredTerrain).toBeUndefined();

  const large = structuredClone(template);
  large.tileParams.size = 288;
  large.tileParams.authoredTerrain = {
    version: 1,
    mode: 'visual-delta',
    columns: 3,
    rows: 3,
    cellSize: 144,
    originX: -144,
    originZ: -144,
    heightDeltas: Array(9).fill(0),
  };
  expect(applyTerrainBrush(large, action('water', [{ x: 0, z: 0 }], 8)).changed).toBe(true);
  expect(large.tileParams.waterSources.at(-1)?.radius).toBe(128);
  expect(parseContractDescriptor(contractDescriptorJson(large), template).ok).toBe(true);
});

test('brush paints, reloads, restores snapshots, and reimports byte-identically', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await ready(page);
  const baseline = await descriptorProbe(page);

  const map = page.getByTestId('terrain-brush-map');
  await map.focus();
  await map.press('ArrowRight');
  await expect(page.getByTestId('terrain-brush-coordinates')).toHaveText('x 2.4 · z 0.0');
  await page.reload();
  await ready(page);
  await expect(page.getByTestId('terrain-brush-coordinates')).toHaveText('x 2.4 · z 0.0');

  await paintAt(page, 0.5, 0.5);
  const raised = await descriptorProbe(page);
  expect(raised.contract.tileParams.authoredTerrain).toMatchObject({ columns: 41, rows: 41 });
  expect(layerValue(raised.contract, 0, 0)).toBe(0.5);
  expect(raised.visual - baseline.visual).toBeCloseTo(0.5, 8);
  expect(raised.sim).toEqual(baseline.sim);

  await page.getByTestId('terrain-brush-mode-lower').click();
  await setRange(page.getByTestId('terrain-brush-size'), '4');
  await setRange(page.getByTestId('terrain-brush-strength'), '0.75');
  await paintAt(page, 0.625, 0.5);
  expect(layerValue((await descriptorProbe(page)).contract, 12, 0)).toBe(-0.75);
  await expect(page.getByTestId('terrain-brush-mode-lower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('terrain-brush-size')).toHaveValue('4');
  await expect(page.getByTestId('terrain-brush-strength')).toHaveValue('0.75');
  await expect(page.getByTestId('terrain-brush-coordinates')).toHaveText('x 12.0 · z 0.0');
  const beforeSmooth = await descriptorProbe(page);

  await page.getByTestId('terrain-brush-mode-smooth').click();
  await setRange(page.getByTestId('terrain-brush-size'), '1');
  await setRange(page.getByTestId('terrain-brush-strength'), '1');
  await paintAt(page, 0.5, 0.5);
  const smoothed = await descriptorProbe(page);
  await expect(page.getByTestId('terrain-brush-mode-smooth')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('terrain-brush-size')).toHaveValue('1');
  await expect(page.getByTestId('terrain-brush-strength')).toHaveValue('1');
  expect(layerValue(smoothed.contract, 0, 0)).toBeLessThan(0.5);
  expect(smoothed.bytes).not.toBe(beforeSmooth.bytes);

  await clickAndReload(page, () => page.getByTestId('terrain-brush-undo').click());
  expect((await descriptorProbe(page)).bytes).toBe(beforeSmooth.bytes);
  await clickAndReload(page, () => page.getByTestId('terrain-brush-redo').click());
  expect((await descriptorProbe(page)).bytes).toBe(smoothed.bytes);

  await page.getByTestId('terrain-brush-mode-zone').click();
  await page.getByTestId('terrain-brush-bank').selectOption('south');
  await dragMap(page, 0.35, 0.65, 0.65, 0.82);
  const zoned = await descriptorProbe(page);
  await expect(page.getByTestId('terrain-brush-mode-zone')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('terrain-brush-bank')).toHaveValue('south');
  expect(Object.keys(zoned.contract.tileParams.buildZones!.at(-1)!).sort()).toEqual(['bank', 'id', 'maxX', 'maxZ', 'minX', 'minZ']);
  expect(zoned.contract.tileParams.buildZones!.at(-1)!.bank).toBe('south');

  await page.getByTestId('terrain-brush-mode-water').click();
  await paintAt(page, 0.25, 0.75);
  expect((await descriptorProbe(page)).contract.tileParams.waterSources.at(-1)).toMatchObject({ kind: 'spring_pond' });

  await page.getByTestId('terrain-brush-mode-lane').click();
  await paintAt(page, 0.5, 0.98);
  const painted = await descriptorProbe(page);
  expect(painted.contract.tileParams.lanes.spawnEdges).toEqual(['west', 'east', 'north', 'south']);
  expect(withoutBrushFields(painted.contract)).toBe(withoutBrushFields(baseline.contract));

  const download = page.waitForEvent('download');
  await page.getByTestId('editor-download').click();
  const downloadPath = await (await download).path();
  expect(downloadPath).not.toBeNull();
  const exportedBytes = await readFile(downloadPath!, 'utf8');
  expect(exportedBytes).toBe(painted.bytes);

  await page.getByTestId('terrain-brush-mode-raise').click();
  await paintAt(page, 0.75, 0.5);
  expect((await descriptorProbe(page)).bytes).not.toBe(exportedBytes);
  await page.getByTestId('editor-import-text').fill(exportedBytes);
  await clickAndReload(page, () => page.getByTestId('editor-import-apply').click());
  const reimported = await descriptorProbe(page);
  expect(reimported.bytes).toBe(exportedBytes);
  expect(reimported.visual - baseline.visual).toBeCloseTo(layerValue(reimported.contract, 0, 0), 8);
  expect(reimported.sim).toEqual(baseline.sim);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-brush-final.png`), fullPage: false });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('plain boot loads neither editor surface', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForTimeout(500);
  expect(await page.getByTestId('descriptor-inspector').count()).toBe(0);
  expect(await page.getByTestId('terrain-brush-map').count()).toBe(0);
  const editorState = await page.evaluate(() => ({
    installed: window.__GR_EDITOR__ !== undefined,
    resources: performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /DescriptorInspector|TerrainBrush|descriptor-inspector/i.test(name)),
  }));
  expect(editorState).toEqual({ installed: false, resources: [] });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function action(
  tool: TerrainBrushAction['tool'],
  points: TerrainBrushAction['points'],
  radiusCells = 2,
  strength = 0.5,
  bank: TerrainBrushAction['bank'] = 'north',
): TerrainBrushAction {
  return { tool, points, radiusCells, strength, bank };
}

function gridIndex(layer: ContractAuthoredTerrainLayer, x: number, z: number): number {
  const column = Math.round((x - layer.originX) / layer.cellSize);
  const row = Math.round((z - layer.originZ) / layer.cellSize);
  return row * layer.columns + column;
}

function layerValue(contract: ContractManifest, x: number, z: number): number {
  const layer = contract.tileParams.authoredTerrain!;
  return layer.heightDeltas[gridIndex(layer, x, z)]!;
}

function withoutBrushFields(contract: ContractManifest): string {
  const copy = structuredClone(contract) as unknown as Record<string, any>;
  delete copy.tileParams.authoredTerrain;
  delete copy.tileParams.buildZones;
  delete copy.tileParams.waterSources;
  delete copy.tileParams.lanes.spawnEdges;
  return JSON.stringify(copy);
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_TEST__ !== undefined && window.__GR_EDITOR__ !== undefined,
  );
  await expect(page.getByTestId('terrain-brush-map')).toBeVisible();
}

async function paintAt(page: Page, xRatio: number, yRatio: number): Promise<void> {
  const map = page.getByTestId('terrain-brush-map');
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  expect(box).not.toBeNull();
  const loaded = page.waitForEvent('load');
  await page.mouse.click(box!.x + box!.width * xRatio, box!.y + box!.height * yRatio);
  await loaded;
  await ready(page);
}

async function dragMap(page: Page, startX: number, startY: number, endX: number, endY: number): Promise<void> {
  const map = page.getByTestId('terrain-brush-map');
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  expect(box).not.toBeNull();
  const loaded = page.waitForEvent('load');
  await page.mouse.move(box!.x + box!.width * startX, box!.y + box!.height * startY);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * endX, box!.y + box!.height * endY, { steps: 5 });
  await page.mouse.up();
  await loaded;
  await ready(page);
}

async function clickAndReload(page: Page, click: () => Promise<void>): Promise<void> {
  const loaded = page.waitForEvent('load');
  await click();
  await loaded;
  await ready(page);
}

async function setRange(input: Locator, value: string): Promise<void> {
  await input.evaluate((element, next) => {
    const range = element as HTMLInputElement;
    range.value = next;
    range.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function descriptorProbe(page: Page): Promise<{ bytes: string; visual: number; sim: unknown; contract: ContractManifest }> {
  return page.evaluate(() => ({
    bytes: window.__GR_EDITOR__!.descriptorJson(),
    visual: window.__GR_TEST__!.terrainVisualY(0, 0),
    sim: window.__GR_TEST__!.terrainSim(0, 0),
    contract: window.__GR_TEST__!.activeContract(),
  }));
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
