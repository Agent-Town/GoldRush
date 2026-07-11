import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  CONTRACT_EDITOR_REJECTION_LINE,
  contractDescriptorJson,
  listBoardContracts,
  loadContract,
  parseContractDescriptor,
  type ContractManifest,
} from '../src/meta/ContractFamilies';

const QUERY = '/?editor&contract=e1-twin-banks&seed=ed-03-placement-validator&nowaves&nospawn&nolevel';

test('069 accepts every shipped contract byte-identically and keeps its legacy result shapes', () => {
  for (const template of listBoardContracts()) {
    const bytes = contractDescriptorJson(template);
    const parsed = parseContractDescriptor(bytes, template);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) continue;
    expect(Object.keys(parsed)).toEqual(['ok', 'contract']);
    expect(contractDescriptorJson(parsed.contract)).toBe(bytes);
    expect(parsed).not.toHaveProperty('reasons');
  }

  const template = loadContract('the-claim');
  expect(parseFailure('{', template)).toEqual({
    ok: false,
    message: CONTRACT_EDITOR_REJECTION_LINE,
    reasons: [{ code: 'document_unreadable', message: 'The marks on this contract page could not be read.' }],
  });
  expect(parseFailure('x'.repeat(512 * 1_024 + 1), template)).toMatchObject({
    message: CONTRACT_EDITOR_REJECTION_LINE,
    reasons: [{ code: 'document_too_large' }],
  });
  const wrongId = structuredClone(template);
  wrongId.id = 'another-claim';
  expect(parseFailure(contractDescriptorJson(wrongId), template).reasons).toEqual([
    { code: 'contract_id', message: 'This page belongs to a different contract.', path: 'id' },
  ]);
});

test('map reasons cover claim bounds, positive area, declared bank, and dry ground without a second terrain sampler', () => {
  const template = loadContract('the-claim');
  const invalid = structuredClone(template);
  invalid.tileParams.buildZones = [
    { id: 'outside', bank: 'north', minX: 30, maxX: 40, minZ: 8, maxZ: 12 },
    { id: 'flat', bank: 'north', minX: -2, maxX: -2, minZ: 8, maxZ: 12 },
    { id: 'wrong', bank: 'north', minX: -4, maxX: 4, minZ: -20, maxZ: -10 },
    { id: 'wet', bank: 'north', minX: -4, maxX: 4, minZ: -5, maxZ: 5 },
  ];
  expect(reasonKeys(parseFailure(contractDescriptorJson(invalid), template))).toEqual([
    ['build_zone_outside_claim', 'tileParams.buildZones[0]'],
    ['build_zone_zero_area', 'tileParams.buildZones[1]'],
    ['build_zone_wrong_bank', 'tileParams.buildZones[2]'],
    ['build_zone_no_dry_ground', 'tileParams.buildZones[3]'],
  ]);

  const valid = structuredClone(template);
  valid.tileParams.buildZones = [
    { id: 'claim-edge', bank: 'north', minX: -32, maxX: 32, minZ: 6.25, maxZ: 6.251 },
    { id: 'cross-river', bank: 'north', minX: -8, maxX: 8, minZ: -10, maxZ: 10 },
    { id: 'overlap', bank: 'north', minX: -4, maxX: 4, minZ: 7, maxZ: 12 },
  ];
  expect(parseContractDescriptor(contractDescriptorJson(valid), template).ok).toBe(true);

  const unrestricted = structuredClone(template);
  unrestricted.tileParams.buildZones = [];
  expect(parseContractDescriptor(contractDescriptorJson(unrestricted), template).ok).toBe(true);

  valid.tileParams.buildZones![0]!.maxZ = 6.25;
  expect(reasonKeys(parseFailure(contractDescriptorJson(valid), template))).toContainEqual([
    'build_zone_zero_area',
    'tileParams.buildZones[0]',
  ]);

  const shallowOnly = structuredClone(template);
  shallowOnly.tileParams.buildZones = [{ id: 'shallow', bank: 'north', minX: -3, maxX: 3, minZ: 6, maxZ: 6.25 }];
  expect(reasonKeys(parseFailure(contractDescriptorJson(shallowOnly), template))).toEqual([
    ['build_zone_no_dry_ground', 'tileParams.buildZones[0]'],
  ]);

  const riverless = structuredClone(loadContract('e1-dry-gulch'));
  riverless.tileParams.buildZones = [{ id: 'dry-center', bank: 'south', minX: -3, maxX: 3, minZ: -2, maxZ: 2 }];
  expect(parseContractDescriptor(contractDescriptorJson(riverless), loadContract('e1-dry-gulch')).ok).toBe(true);
});

test('spawn and briefing reasons are precise, deterministic, bounded, and byte-preserving on success', () => {
  const template = loadContract('the-claim');
  const oneEdge = structuredClone(template);
  oneEdge.tileParams.lanes.spawnEdges = ['west'];
  expect(parseContractDescriptor(contractDescriptorJson(oneEdge), template)).toMatchObject({
    ok: true,
    contract: { tileParams: { lanes: { spawnEdges: ['west'] } } },
  });

  const ordered = structuredClone(loadContract('e2-hill-mine'));
  const orderedBytes = contractDescriptorJson(ordered);
  const orderedResult = parseContractDescriptor(orderedBytes, loadContract('e2-hill-mine'));
  expect(orderedResult.ok && orderedResult.contract.tileParams.lanes.spawnEdges).toEqual(['west', 'east', 'north']);

  const empty = structuredClone(template);
  empty.tileParams.lanes.spawnEdges = [];
  expect(reasonKeys(parseFailure(contractDescriptorJson(empty), template))).toEqual([
    ['spawn_edge_required', 'tileParams.lanes.spawnEdges'],
  ]);

  const multi = structuredClone(template);
  multi.tileParams.buildZones = [
    { id: 'same', bank: 'north', minX: -8, maxX: -2, minZ: 8, maxZ: 12 },
    { id: 'same', bank: 'north', minX: 2, maxX: 8, minZ: 8, maxZ: 12 },
  ];
  multi.tileParams.lanes.spawnEdges = ['north', 'north', 'up' as 'east'];
  multi.briefing.geographyLine = '   ';
  multi.briefing.goals[0] = '\t';
  multi.briefing.rules[1] = '';
  const expected = [
    ['build_zone_duplicate', 'tileParams.buildZones[1].id'],
    ['spawn_edge_duplicate', 'tileParams.lanes.spawnEdges[1]'],
    ['spawn_edge_unknown', 'tileParams.lanes.spawnEdges[2]'],
    ['briefing_blank', 'briefing.geographyLine'],
    ['briefing_blank', 'briefing.goals[0]'],
    ['briefing_blank', 'briefing.rules[1]'],
  ];
  const originalReasons = parseFailure(contractDescriptorJson(multi), template).reasons;
  expect(reasonKeys({ reasons: originalReasons })).toEqual(expected);
  const reorderedBytes = `${JSON.stringify(reverseRecords(multi), null, 2)}\n`;
  expect(parseFailure(reorderedBytes, template).reasons).toEqual(originalReasons);

  const changedCount = structuredClone(template);
  changedCount.briefing.goals.push('Another goal');
  expect(reasonKeys(parseFailure(contractDescriptorJson(changedCount), template))).toEqual([
    ['briefing_goal_count', 'briefing.goals'],
  ]);

  const spaced = structuredClone(template);
  spaced.briefing.geographyLine = '  Keep these spaces.  ';
  const spacedBytes = contractDescriptorJson(spaced);
  const spacedResult = parseContractDescriptor(spacedBytes, template);
  expect(spacedResult.ok && contractDescriptorJson(spacedResult.contract)).toBe(spacedBytes);

  const overlong = structuredClone(template);
  overlong.briefing.geographyLine = 'x'.repeat(1_025);
  expect(reasonKeys(parseFailure(contractDescriptorJson(overlong), template))).toEqual([
    ['briefing_too_long', 'briefing.geographyLine'],
  ]);

  const inverted = structuredClone(template);
  inverted.tileParams.buildZones = [{ id: 'inverted', bank: 'north', minX: 4, maxX: -4, minZ: 12, maxZ: 8 }];
  expect(reasonKeys(parseFailure(contractDescriptorJson(inverted), template))).toEqual([
    ['build_zone_order', 'tileParams.buildZones[0].minX'],
    ['build_zone_order', 'tileParams.buildZones[0].minZ'],
  ]);

  const capped = structuredClone(template) as unknown as Record<string, unknown>;
  for (let index = 0; index < 20; index += 1) capped[`future${String(index).padStart(2, '0')}`] = index;
  const cappedReasons = parseFailure(`${JSON.stringify(capped)}\n`, template).reasons;
  expect(cappedReasons).toHaveLength(12);
  expect(cappedReasons.every((reason) => reason.code === 'field_unknown')).toBe(true);
  expect(cappedReasons.map((reason) => reason.path)).toEqual(Array.from({ length: 12 }, (_, index) => `future${String(index).padStart(2, '0')}`));

  const prioritized = structuredClone(template) as unknown as Record<string, unknown>;
  for (let index = 0; index < 20; index += 1) prioritized[`future${String(index).padStart(2, '0')}`] = index;
  ((prioritized.tileParams as Record<string, unknown>).lanes as Record<string, unknown>).spawnEdges = [];
  const prioritizedReasons = parseFailure(`${JSON.stringify(prioritized)}\n`, template).reasons;
  expect(reasonKeys({ reasons: prioritizedReasons })[0]).toEqual(['spawn_edge_required', 'tileParams.lanes.spawnEdges']);
  expect(prioritizedReasons).toHaveLength(12);
});

test('placement controls commit valid descriptors and explain atomic rejections in-world', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    const initialized = 'gr.ed03.test.initialized';
    const bootCount = 'gr.ed03.test.boot-count';
    if (sessionStorage.getItem(initialized) !== '1') {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem(initialized, '1');
      sessionStorage.setItem(bootCount, '1');
      return;
    }
    sessionStorage.setItem(bootCount, String(Number(sessionStorage.getItem(bootCount) ?? '0') + 1));
  });
  await page.goto(QUERY);
  await ready(page);
  await expect(page.getByTestId('contract-validator')).toHaveAttribute('data-verdict', 'accepted');
  await expect(page.getByTestId('placement-editor')).toBeVisible();
  expect(await page.locator('details[data-editor-path="tileParams.buildZones"]').count()).toBe(0);
  expect(await page.locator('details[data-editor-path="tileParams.lanes.spawnEdges"]').count()).toBe(0);

  const baselineBytes = await descriptorBytes(page);
  const baselineUrl = page.url();
  const baselineBoots = await page.evaluate(() => sessionStorage.getItem('gr.ed03.test.boot-count'));
  const west = page.getByTestId('placement-zone-0-minX');
  await west.fill('-40');
  await west.press('Tab');
  await expect(page.getByTestId('contract-validator')).toHaveAttribute('data-verdict', 'rejected');
  await expect(page.locator('[data-reason-code="build_zone_outside_claim"]')).toHaveAttribute('data-reason-path', 'tileParams.buildZones[0]');
  await expect(page.getByTestId('editor-rejection')).toContainText('water-damaged');
  await expect(west).toHaveValue('-28');
  expect(page.url()).toBe(baselineUrl);
  expect(await page.evaluate(() => sessionStorage.getItem('gr.ed03.test.boot-count'))).toBe(baselineBoots);
  expect(await descriptorBytes(page)).toBe(baselineBytes);

  const id = page.getByTestId('placement-zone-0-id');
  await id.fill('north-yard');
  await commitAndReload(page, () => id.press('Tab'));
  await commitAndReload(page, () => page.getByTestId('placement-zone-0-bank').selectOption('north'));
  expect((await descriptor(page)).tileParams.buildZones?.[0]).toMatchObject({ id: 'north-yard', bank: 'north', minZ: 7, maxZ: 30 });
  await expect(page.getByTestId('contract-validator')).toHaveAttribute('data-verdict', 'accepted');

  await commitAndReload(page, () => page.getByTestId('placement-zone-1-remove').click());
  expect((await descriptor(page)).tileParams.buildZones).toHaveLength(1);

  await commitAndReload(page, () => page.getByTestId('placement-spawn-west').click());
  expect((await descriptor(page)).tileParams.lanes.spawnEdges).toEqual(['north', 'south', 'east']);

  const oneEdge = await descriptor(page);
  oneEdge.tileParams.lanes.spawnEdges = ['east'];
  await page.getByTestId('editor-import-text').fill(contractDescriptorJson(oneEdge));
  await commitAndReload(page, () => page.getByTestId('editor-import-apply').click());
  const beforeInvalidSpawn = await page.evaluate(() => ({
    bytes: window.__GR_EDITOR__!.descriptorJson(),
    history: sessionStorage.getItem(`gr.editor.history.v1:${window.__GR_TEST__!.activeContract().id}`),
  }));
  await page.getByTestId('placement-spawn-east').click();
  await expect(page.locator('[data-reason-code="spawn_edge_required"]')).toBeVisible();
  await expect(page.getByTestId('placement-spawn-east')).toBeChecked();
  expect(await page.evaluate(() => ({
    bytes: window.__GR_EDITOR__!.descriptorJson(),
    history: sessionStorage.getItem(`gr.editor.history.v1:${window.__GR_TEST__!.activeContract().id}`),
  }))).toEqual(beforeInvalidSpawn);

  const geography = page.getByTestId('placement-briefing-geography');
  const previousGeography = await geography.inputValue();
  await geography.fill('   ');
  await geography.press('Tab');
  await expect(page.locator('[data-reason-code="briefing_blank"][data-reason-path="briefing.geographyLine"]')).toBeVisible();
  await expect(geography).toHaveValue(previousGeography);

  await geography.fill('Twin banks under a clear survey lantern.');
  await commitAndReload(page, () => geography.press('Tab'));
  const finalContract = await descriptor(page);
  expect(finalContract.briefing.geographyLine).toBe('Twin banks under a clear survey lantern.');
  expect(withoutEd03Fields(finalContract)).toBe(withoutEd03Fields(JSON.parse(baselineBytes) as ContractManifest));

  await commitAndReload(page, () => page.getByTestId('terrain-brush-undo').click());
  expect((await descriptor(page)).briefing.geographyLine).toBe(previousGeography);
  await commitAndReload(page, () => page.getByTestId('terrain-brush-redo').click());
  expect((await descriptor(page)).briefing.geographyLine).toBe('Twin banks under a clear survey lantern.');

  const download = page.waitForEvent('download');
  await page.getByTestId('editor-download').click();
  const downloadPath = await (await download).path();
  expect(downloadPath).not.toBeNull();
  expect(await readFile(downloadPath!, 'utf8')).toBe(await descriptorBytes(page));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('plain boot loads no editor placement or validator resources', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForTimeout(500);
  expect(await page.getByTestId('placement-editor').count()).toBe(0);
  expect(await page.getByTestId('contract-validator').count()).toBe(0);
  expect(await page.evaluate(() => performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((name) => /DescriptorInspector|TerrainBrush|PlacementEditor|descriptor-inspector/i.test(name)))).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function parseFailure(text: string, template: ContractManifest): Extract<ReturnType<typeof parseContractDescriptor>, { ok: false }> {
  const parsed = parseContractDescriptor(text, template);
  expect(parsed.ok).toBe(false);
  if (parsed.ok) throw new Error('Expected descriptor rejection.');
  expect(parsed.message).toBe(CONTRACT_EDITOR_REJECTION_LINE);
  return parsed;
}

function reasonKeys(result: { reasons: Array<{ code: string; path?: string }> }): string[][] {
  return result.reasons.map((reason) => [reason.code, reason.path ?? '']);
}

function reverseRecords(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseRecords);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(Object.entries(value).reverse().map(([key, child]) => [key, reverseRecords(child)]));
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_EDITOR__ !== undefined);
  await expect(page.getByTestId('placement-editor')).toBeVisible();
}

async function commitAndReload(page: Page, action: () => Promise<unknown>): Promise<void> {
  await Promise.all([page.waitForEvent('load'), action()]);
  await ready(page);
}

async function descriptorBytes(page: Page): Promise<string> {
  return page.evaluate(() => window.__GR_EDITOR__!.descriptorJson());
}

async function descriptor(page: Page): Promise<ContractManifest> {
  return JSON.parse(await descriptorBytes(page)) as ContractManifest;
}

function withoutEd03Fields(contract: ContractManifest): string {
  const copy = structuredClone(contract);
  delete copy.tileParams.buildZones;
  delete (copy.tileParams.lanes as Partial<typeof copy.tileParams.lanes>).spawnEdges;
  delete (copy as Partial<ContractManifest>).briefing;
  return JSON.stringify(copy);
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const bucket = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
