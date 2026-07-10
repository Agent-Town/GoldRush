import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CONTRACT_EDITOR_PARAM,
  contractDescriptorJson,
  contractNumberRange,
  loadContract,
  parseContractDescriptor,
} from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/ed-01');
const EDITOR_QUERY = '?editor&contract=e1-dry-gulch&seed=ed-01';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('editor live-applies a descriptor edit and export/import round-trips byte-equal', async ({ page, context }, testInfo) => {
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors = collectErrors(page);

  await openEditor(page);
  await expect(page.getByTestId('descriptor-inspector')).toBeVisible();
  await expect(page.getByTestId('editor-contract-name')).toContainText('e1-dry-gulch');
  expect(await page.evaluate(() => window.__GR_EDITOR__?.wavesPaused)).toBe(true);
  const before = await page.evaluate(() => ({
    depth: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.heightfield?.springBasin?.depth,
    minHeight: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.min,
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
  }));
  await page.locator('details[data-editor-path="tileParams.heightfield.springBasin"] > summary').click();
  await shot(page, testInfo, 'inspector-before');

  const depth = page.locator('[data-editor-path="tileParams.heightfield.springBasin.depth"][type="number"]');
  await depth.fill('0');
  await depth.press('Tab');
  await page.waitForURL(/editorDescriptor=/);
  await openEditorAfterReload(page);
  const after = await page.evaluate(() => ({
    depth: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.heightfield?.springBasin?.depth,
    minHeight: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.min,
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
  }));
  expect(after.depth).toBe(0);
  expect(after.minHeight).not.toBe(before.minHeight);
  expect(after.wave).toBe(0);

  const firstDownload = page.waitForEvent('download');
  await page.getByTestId('editor-download').click();
  const firstPath = await (await firstDownload).path();
  expect(firstPath).not.toBeNull();
  const firstBytes = await readFile(firstPath!);

  await page.getByTestId('editor-copy').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(firstBytes.toString('utf8'));

  const imported = JSON.parse(firstBytes.toString('utf8'));
  imported.tileParams.heightfield.springBasin.depth = 0.25;
  const importedBytes = Buffer.from(`${JSON.stringify(imported, null, 2)}\n`);
  await page.getByTestId('editor-import-text').fill(importedBytes.toString('utf8'));
  await page.getByTestId('editor-import-apply').click();
  await openEditorAfterReload(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.heightfield?.springBasin?.depth)).toBe(0.25);
  const secondDownload = page.waitForEvent('download');
  await page.getByTestId('editor-download').click();
  const secondPath = await (await secondDownload).path();
  expect(secondPath).not.toBeNull();
  const secondBytes = await readFile(secondPath!);
  expect(secondBytes.equals(importedBytes)).toBe(true);

  imported.twist = [];
  await page.getByTestId('editor-import-text').fill(JSON.stringify(imported));
  await page.getByTestId('editor-import-apply').click();
  await expect(page.getByTestId('editor-rejection')).toContainText('water-damaged');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e1-dry-gulch');

  const proof = {
    project: testInfo.project.name,
    editedPath: 'tileParams.heightfield.springBasin.depth',
    before,
    after,
    exportedBytes: importedBytes.byteLength,
    byteEqualAfterImport: secondBytes.equals(importedBytes),
  };
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-round-trip.json`), `${JSON.stringify(proof, null, 2)}\n`);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('descriptor validation accepts heterogeneous E2 rows and rejects unsafe shapes and values', () => {
  const hillMine = loadContract('e2-hill-mine');
  expect(parseContractDescriptor(contractDescriptorJson(hillMine), hillMine).ok).toBe(true);

  const dryGulch = loadContract('e1-dry-gulch');
  const unsafe = structuredClone(dryGulch);
  unsafe.tileParams.scatter!.classCounts!.rocks = 1_000_000;
  expect(parseContractDescriptor(contractDescriptorJson(unsafe), dryGulch).ok).toBe(false);

  const wrongObject = structuredClone(dryGulch) as unknown as Record<string, unknown>;
  wrongObject.twist = [];
  expect(parseContractDescriptor(JSON.stringify(wrongObject), dryGulch).ok).toBe(false);
  expect(contractNumberRange('tileParams.buildZones[].minX', -28)).toMatchObject({ min: -84, max: 84 });
});

test('edited descriptor opens visibly with the applied value', async ({ page }, testInfo) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);
  const contract = structuredClone(loadContract('e1-dry-gulch'));
  contract.tileParams.heightfield!.springBasin!.depth = 0;
  const params = new URLSearchParams({
    editor: '',
    contract: contract.id,
    seed: 'ed-01',
    [CONTRACT_EDITOR_PARAM]: contractDescriptorJson(contract),
  });
  await page.goto(`/?${params}`);
  await openEditorAfterReload(page);
  await page.locator('details[data-editor-path="tileParams.heightfield.springBasin"] > summary').click();
  await expect(page.locator('[data-editor-path="tileParams.heightfield.springBasin.depth"][type="number"]')).toHaveValue('0');
  await shot(page, testInfo, 'inspector-after');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('plain boot does not load or install the editor chunk', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await page.getByTestId('descriptor-inspector').count()).toBe(0);
  const editorState = await page.evaluate(() => ({
    installed: window.__GR_EDITOR__ !== undefined,
    resources: performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /DescriptorInspector|descriptor-inspector/i.test(name)),
  }));
  expect(editorState).toEqual({ installed: false, resources: [] });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function openEditor(page: Page): Promise<void> {
  await page.goto(`/${EDITOR_QUERY}`);
  await openEditorAfterReload(page);
}

async function openEditorAfterReload(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_EDITOR__ !== undefined);
  await expect(page.getByTestId('descriptor-inspector')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
