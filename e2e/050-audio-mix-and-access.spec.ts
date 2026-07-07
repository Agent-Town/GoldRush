import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { AUDIO_MUTED_STORAGE_KEY, AUDIO_VOLUME_STORAGE_KEY } from '../src/audio/settings';

const SHOT_DIR = 'artifacts/050';
const SPARK_FIRE_RATE_FLOOR = Math.ceil(1000 / 80);

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function openGame(page: Page, query = '?debug&timescale=3&nowaves&nolevel&seed=050-audio'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('hud-vitals')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
  return errors;
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('pause overlay volume and mute persist and sync with Settings', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=050-pause-settings');

  await page.keyboard.press('p');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  await expect(page.getByTestId('pause-audio-settings')).toBeVisible();
  await shot(page, testInfo, 'pause-audio-settings');

  await page.getByTestId('pause-volume').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '40';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.getByTestId('pause-mute').check();

  await expect(page.getByTestId('pause-volume-value')).toHaveText('40%');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.volume)).resolves.toBe(0.4);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.muted)).resolves.toBe(true);
  await expect(
    page.evaluate(
      ({ mutedKey, volumeKey }) => ({
        muted: localStorage.getItem(mutedKey),
        volume: localStorage.getItem(volumeKey),
      }),
      { mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
    ),
  ).resolves.toEqual({ muted: '1', volume: '0.4' });

  const menuPage = await page.context().newPage();
  const menuErrors = collectErrors(menuPage);
  await menuPage.goto('/');
  await expect(menuPage.getByTestId('start-menu')).toBeVisible();
  await menuPage.getByTestId('start-menu-settings').click();
  await expect(menuPage.getByTestId('start-menu-volume')).toHaveValue('40');
  await expect(menuPage.getByTestId('start-menu-mute')).toBeChecked();
  assertNoErrors(menuErrors);
  await menuPage.close();
  assertNoErrors(errors);
});

test('M toggles mute mid-run with ledger toast', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=050-mute-hotkey');

  await page.keyboard.press('m');
  await expect(page.getByTestId('run-meta-recap')).toHaveText('The claim goes quiet.');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.muted)).resolves.toBe(true);
  await shot(page, testInfo, 'mute-toast');

  await page.keyboard.press('m');
  await expect(page.getByTestId('run-meta-recap')).toHaveText('Sound returns.');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.muted)).resolves.toBe(false);
  assertNoErrors(errors);
});

test('spark rapid fire is throttled in render audio diagnostics', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=050-spark-throttle');
  await unlockAudio(page);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['spark-bolt-fire'] ?? 0);
  await page.evaluate(() => {
    for (let i = 0; i < 30; i += 1) window.__GR_TEST__?.testAudio('spark-bolt-fire');
  });

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.droppedBySound['spark-bolt-fire'] ?? 0))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate((startedBefore) => (window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['spark-bolt-fire'] ?? 0) > startedBefore, before))
    .toBe(true);
  const playsPerSecond = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.playsPerSecond['spark-bolt-fire'] ?? 0);
  expect(playsPerSecond).toBeLessThanOrEqual(SPARK_FIRE_RATE_FLOOR);
  assertNoErrors(errors);
});

test('audio fetch failures stay silent no-ops', async ({ page }) => {
  await page.route(/\/assets\/audio\/raw\/[^?]+\.mp3$/, (route) =>
    route.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' }),
  );
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=050-audio-absent');
  await unlockAudio(page);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.testAudio('spark-bolt-fire'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0)).toBeGreaterThan(before);
  assertNoErrors(errors);
});
