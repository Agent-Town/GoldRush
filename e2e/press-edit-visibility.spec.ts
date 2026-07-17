import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?editor&debug&contract=e1-dry-gulch&nowaves&nolevel&nokill&nopause&seed=press-edit-visibility';
const SHOT_DIR = path.resolve('reviews/shots-press-visibility');

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean(window.__GR_EDITOR__) && Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate((button) => (button as HTMLButtonElement).click());
}

async function applyAtCursor(page: Page): Promise<void> {
  const map = page.getByTestId('terrain-brush-map');
  await map.evaluate((element) => element.focus());
  await page.keyboard.press('Enter');
}

async function visualY(page: Page, x: number, z: number): Promise<number> {
  return page.evaluate(([atX, atZ]) => window.__GR_TEST__!.terrainVisualY(atX!, atZ!), [x, z]);
}

test('raise and pond edits render live, then survive the stamped launch', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await mkdir(SHOT_DIR, { recursive: true });
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await ready(page);

  await expect(page.getByTestId('terrain-brush-mode-zone')).toContainText('renders at launch');
  await expect(page.getByTestId('terrain-brush-mode-lane')).toContainText('renders at launch');
  await expect(page.getByTestId('terrain-brush-mode-select')).toContainText('render at launch');

  const beforeHeight = await visualY(page, 0, 0);
  const beforePixels = testInfo.project.name === 'desktop-chrome'
    ? await page.screenshot({ clip: { x: 0, y: 0, width: 820, height: 760 } })
    : null;
  await applyAtCursor(page);
  await applyAtCursor(page);
  await expect.poll(() => visualY(page, 0, 0)).toBeGreaterThan(beforeHeight + 0.3);
  await expect(page.getByTestId('editor-dirty')).toBeVisible();
  if (beforePixels) {
    const afterPixels = await page.screenshot({ path: path.join(SHOT_DIR, 'raise-before-after.png'), clip: { x: 0, y: 0, width: 820, height: 760 } });
    expect(afterPixels.equals(beforePixels)).toBe(false);
  }

  await page.getByTestId('terrain-brush-mode-water').click();
  await applyAtCursor(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water?.springPonds)).toBe(2);
  const draft = JSON.parse(await page.evaluate(() => window.__GR_EDITOR__!.descriptorJson())) as {
    tileParams: { authoredTerrain?: unknown; waterSources: Array<{ x: number; z: number }> };
  };
  expect(draft.tileParams.authoredTerrain).toBeTruthy();
  expect(draft.tileParams.waterSources.at(-1)).toMatchObject({ x: 0, z: 0 });
  if (testInfo.project.name === 'desktop-chrome') await page.screenshot({ path: path.join(SHOT_DIR, 'pond-preview.png') });

  await page.getByTestId('press-charter-name').fill('Dry Gulch Visibility Proof');
  await page.getByTestId('press-stamp').click();
  await expect(page.getByTestId('press-status')).toContainText('Stamped to the shelf');
  await expect(page.getByTestId('editor-dirty')).toBeHidden();
  await page.getByTestId('press-launch-0').click();
  await page.waitForURL((url) => !url.searchParams.has('editor') && url.searchParams.get('contract') === 'e1-dry-gulch');
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('Dry Gulch Visibility Proof');
  await page.getByTestId('contract-briefing-dismiss').click();
  if (testInfo.project.name === 'desktop-chrome') await page.screenshot({ path: path.join(SHOT_DIR, 'pond-in-run.png') });
  await page.goto('/?debug&contract=e1-dry-gulch&nowaves&nolevel&nokill&nopause&seed=press-edit-launched');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const launched = await page.evaluate(() => window.__GR_TEST__!.activeContract().tileParams);
  expect(launched.authoredTerrain).toEqual(draft.tileParams.authoredTerrain);
  expect(launched.waterSources).toEqual(draft.tileParams.waterSources);
  expect(await visualY(page, 0, 0)).toBeGreaterThan(beforeHeight + 0.3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water?.springPonds)).toBe(2);
  expect(errors).toEqual({ console: [], page: [] });
});

test('an un-stamped dirty draft warns first and disappears on reload', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await mkdir(SHOT_DIR, { recursive: true });
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await ready(page);
  const baselineBytes = await page.evaluate(() => window.__GR_EDITOR__!.descriptorJson());
  const baselineHeight = await visualY(page, 0, 0);

  await applyAtCursor(page);
  const dirty = page.getByTestId('editor-dirty');
  await expect(dirty).toBeVisible();
  await expect(dirty).toContainText('Stamp to keep — un-stamped edits are lost on reload');
  expect(await page.evaluate(() => window.__GR_EDITOR__!.descriptorJson())).not.toBe(baselineBytes);
  if (testInfo.project.name === 'desktop-chrome') await page.screenshot({ path: path.join(SHOT_DIR, 'dirty-hint.png') });

  await page.reload();
  await ready(page);
  expect(await page.evaluate(() => window.__GR_EDITOR__!.descriptorJson())).toBe(baselineBytes);
  expect(await visualY(page, 0, 0)).toBeCloseTo(baselineHeight, 8);
  await expect(page.getByTestId('editor-dirty')).toBeHidden();
  await expect(page.getByTestId('press-shelf-row')).toHaveCount(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain boot remains inert', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-wordmark')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('descriptor-inspector')).toHaveCount(0);
  await expect(page.getByTestId('editor-dirty')).toHaveCount(0);
  expect(await page.evaluate(() => ({
    editor: window.__GR_EDITOR__,
    shelf: Object.keys(localStorage).filter((key) => key.includes('charterShelf')),
    draft: Object.keys(sessionStorage).filter((key) => key.includes('editor.contract')),
  }))).toEqual({ editor: undefined, shelf: [], draft: [] });
  expect(errors).toEqual({ console: [], page: [] });
});
