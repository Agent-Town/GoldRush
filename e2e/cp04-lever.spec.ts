import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { charterJson, parseCharter } from '../src/charter/CharterSchema';
import { stampCharter } from '../src/charter/CharterStamp';
import {
  createLeverCharter,
  LEVER_LANDS,
  LEVER_STORIES,
  LEVER_VISITORS,
} from '../src/charter/templates/LeverTemplates';

const SHOT_DIR = path.resolve('reviews/shots-cp04');
const CLOCK = () => '2026-07-17T12:00:00.000Z';
const combinations = LEVER_LANDS.flatMap((land) =>
  LEVER_STORIES.flatMap((story) =>
    LEVER_VISITORS.map((visitors) => {
      const charter = createLeverCharter(land.id, story.id, visitors.id, { author: 'Lever Keeper', clock: CLOCK });
      return { land, story, visitors, charter, result: stampCharter(charter) };
    }),
  ),
);

// Seed cp04-nine: covers all five lands and every story/visitor pairing once.
const bootSample = [0, 4, 17, 10, 23, 24, 29, 30, 43].map((index) => combinations[index]!);

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('all 45 Lever choices stamp, round-trip, and produce zero validator rejections', () => {
  expect(combinations).toHaveLength(45);
  let rejections = 0;
  for (const combination of combinations) {
    const label = `${combination.land.id}/${combination.story.id}/${combination.visitors.id}`;
    if (!combination.result.ok) rejections += 1;
    expect(combination.result.ok, label).toBe(true);
    if (!combination.result.ok) continue;

    const parsed = parseCharter(charterJson(combination.charter));
    expect(parsed.ok, `${label} round-trip`).toBe(true);
    if (!parsed.ok) continue;
    const restamped = stampCharter(parsed.charter);
    expect(restamped.ok, `${label} re-stamp`).toBe(true);
    if (restamped.ok) expect(restamped.document, `${label} canonical document`).toBe(combination.result.document);
  }
  expect(rejections).toBe(0);
  test.info().annotations.push({
    type: 'lever-matrix',
    description: `${LEVER_LANDS.length} lands × ${LEVER_STORIES.length} stories × ${LEVER_VISITORS.length} visitor sets = 45 stamped, 0 rejected`,
  });
});

test('the Lever is three choices and one press, then launches through the charter seam', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await page.goto('/?editor&debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cp04-lever');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('press-full-mode')).toBeVisible();
  await expect(page.getByTestId('press-lever-mode')).toBeHidden();
  await page.getByTestId('press-mode-lever').click();
  await expect(page.getByTestId('press-title')).toHaveText('The Lever');
  await expect(page.getByTestId('press-full-mode')).toBeHidden();
  await expect(page.getByTestId('press-lever-mode')).toBeVisible();
  await expect(page.locator('[data-lever-land]')).toHaveCount(5);
  await expect(page.locator('[data-lever-story]')).toHaveCount(3);
  await expect(page.locator('[data-lever-visitors]')).toHaveCount(3);
  expect(await page.locator('[data-lever-land] img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);

  if (testInfo.project.name === 'desktop-chrome') {
    await mkdir(SHOT_DIR, { recursive: true });
    await page.setViewportSize({ width: 1280, height: 1400 });
    await page.addStyleTag({ content: `
      .descriptor-inspector { position: absolute !important; inset: 16px 16px auto auto !important; overflow: visible !important; }
      .descriptor-inspector__fields { overflow: visible !important; }
      .descriptor-inspector__header,
      .contract-validator,
      .terrain-brush,
      .placement-editor,
      .descriptor-inspector__section,
      .descriptor-inspector__transfer,
      .lil-gui { display: none !important; }
    ` });
    await page.getByTestId('charter-press-panel').screenshot({ path: path.join(SHOT_DIR, 'lever-mode.png') });
    await page.getByTestId('lever-land-cards').screenshot({ path: path.join(SHOT_DIR, 'land-cards.png') });
    await page.setViewportSize({ width: 1280, height: 800 });
  }

  await page.getByTestId('lever-land-e1-twin-banks').click();
  await page.getByTestId('lever-story-big-build').click();
  await page.getByTestId('lever-visitors-busy').click();
  await expect(page.getByTestId('lever-land-e1-twin-banks')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('lever-story-big-build')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('lever-visitors-busy')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('lever-press').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === 'e1-twin-banks' && !url.searchParams.has('editor'));
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('Twin Banks — Build Something Big', { timeout: 30_000 });
  await expect(page.getByTestId('contract-briefing-dismiss')).toBeVisible();
  if (testInfo.project.name === 'desktop-chrome') await page.screenshot({ path: path.join(SHOT_DIR, 'stamped-launch.png') });

  const shelfEntries = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((entry) => entry.includes('gr.charterShelf.v1'));
    return key ? JSON.parse(localStorage.getItem(key) ?? '[]').length : 0;
  });
  expect(shelfEntries).toBe(1);
  expect(errors).toEqual({ console: [], page: [] });
});

test('a plain boot remains inert', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-wordmark')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('charter-press-panel')).toHaveCount(0);
  expect(await page.evaluate(() => ({
    shelf: Object.keys(localStorage).filter((key) => key.includes('charterShelf')),
    launch: sessionStorage.getItem('gr.charter.launch.v1'),
  }))).toEqual({ shelf: [], launch: null });
  expect(errors).toEqual({ console: [], page: [] });
});

for (const combination of bootSample) {
  const label = `${combination.land.id}/${combination.story.id}/${combination.visitors.id}`;
  test(`seeded boot ${label} starts clean`, async ({ page }) => {
    test.setTimeout(60_000);
    expect(combination.result.ok, label).toBe(true);
    if (!combination.result.ok) return;
    const errors = collectErrors(page);
    await page.addInitScript(
      ([templateId, document]) => {
        sessionStorage.setItem('gr.contract.launch.v1', templateId!);
        sessionStorage.setItem('gr.charter.launch.v1', JSON.stringify({ templateId, document }));
      },
      [combination.land.id, combination.result.document],
    );
    await page.goto(`/?debug&contract=${combination.land.id}&nowaves&nolevel&nokill&nopause&seed=cp04-nine`);
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    await expect(page.getByTestId('contract-briefing-name')).toHaveText(combination.charter.contract.name);
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe(combination.land.id);
    expect(errors).toEqual({ console: [], page: [] });
  });
}
