import { expect, test, type Page } from '@playwright/test';
import { contractDescriptorJson, type ContractManifest } from '../src/meta/ContractFamilies';

test('terrain tint bands use touch-sized pickers and preserve every untouched descriptor byte', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await openEditor(page);

  const tint = page.locator('input[type="color"][data-editor-path="tileParams.palette.tint"]');
  const dampTint = page.locator('input[type="color"][data-editor-path="tileParams.palette.dampTint"]');
  await expect(tint).toHaveCount(1);
  await expect(dampTint).toHaveCount(1);
  expect(await page.locator('input[type="color"]').count()).toBe(2);
  for (const picker of [tint, dampTint]) {
    const box = await picker.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  const before = await editorState(page);
  const expected = structuredClone(before.contract);
  expected.tileParams.palette!.dampTint = [0.2, 0.4, 0.6];
  await commitAndReload(page, () => dampTint.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '#336699';
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }));

  const changed = await editorState(page);
  expect(changed.bytes).toBe(contractDescriptorJson(expected));
  expect(changed.contract.tileParams.palette!.tint).toEqual([1.1, 0.9, 0.72]);
  expect(changed.history.past).toHaveLength(before.history.past.length + 1);
  expect(changed.history.past.at(-1)).toBe(before.bytes);

  await commitAndReload(page, () => page.getByTestId('terrain-brush-undo').click());
  expect((await editorState(page)).bytes).toBe(before.bytes);
  await commitAndReload(page, () => page.getByTestId('terrain-brush-redo').click());
  expect((await editorState(page)).bytes).toBe(changed.bytes);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

async function openEditor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const key = 'gr.ed05.palette.test.initialized';
    if (sessionStorage.getItem(key) === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(key, '1');
  });
  await page.goto('/?editor&contract=e1-dry-gulch&seed=ed-05-palette&nowaves&nospawn&nolevel');
  await ready(page);
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_EDITOR__ !== undefined);
  await expect(page.getByTestId('descriptor-inspector')).toBeVisible();
}

async function editorState(page: Page): Promise<{
  bytes: string;
  contract: ContractManifest;
  history: { past: string[]; future: string[] };
}> {
  return page.evaluate(() => {
    const bytes = window.__GR_EDITOR__!.descriptorJson();
    const contract = JSON.parse(bytes) as ContractManifest;
    const history = JSON.parse(sessionStorage.getItem(`gr.editor.history.v1:${contract.id}`) ?? '{"past":[],"future":[]}') as {
      past: string[];
      future: string[];
    };
    return { bytes, contract, history };
  });
}

async function commitAndReload(page: Page, action: () => Promise<unknown>): Promise<void> {
  await Promise.all([page.waitForEvent('load'), action()]);
  await ready(page);
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}
