import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY } from '../src/game/ProfileStorage';
import { AUDIO_MUTED_STORAGE_KEY, AUDIO_VOLUME_STORAGE_KEY } from '../src/audio/settings';

const SHOT_DIR = 'artifacts/audio-integration';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HarvestNode = {
  active: boolean;
  position: { x: number; z: number };
};

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

async function openGame(page: Page, query = '?debug&timescale=6&nowaves&nolevel&seed=audio'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('hud-vitals')).toBeVisible();
  return errors;
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
}

async function nearestActiveNode(page: Page): Promise<HarvestNode> {
  const nodes = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active) ?? []);
  expect(nodes.length).toBeGreaterThan(0);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
  nodes.sort((a, b) => distanceSq(hero, a.position) - distanceSq(hero, b.position));
  return nodes[0]!;
}

function distanceSq(a: { x: number; z: number }, b: { x: number; z: number }): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('boot stays audio-locked until gesture, then seeded panning requests sound', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=audio-pan');

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started)).toBe(0);
  assertNoErrors(errors);

  await unlockAudio(page);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.requests ?? 0);
  const target = await nearestActiveNode(page);
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), target.position);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.requests ?? 0)).toBeGreaterThan(before);
  const lastRequested = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.lastRequested);
  expect(['pan-swish', 'gold-chime']).toContain(lastRequested);
  assertNoErrors(errors);
});

test('settings volume and mute persist across reload', async ({ page }, testInfo: TestInfo) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  await page.getByTestId('start-menu-settings').click();
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-settings.png`, fullPage: true });

  await page.getByTestId('start-menu-volume').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '25';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.getByTestId('start-menu-mute').check();
  await expect(page.getByTestId('start-menu-volume-value')).toHaveText('25%');

  await expect(
    page.evaluate(
      ({ mutedKey, volumeKey }) => ({
        muted: localStorage.getItem(mutedKey),
        volume: localStorage.getItem(volumeKey),
      }),
      { mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
    ),
  ).resolves.toEqual({ muted: '1', volume: '0.25' });

  await page.reload();
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-volume')).toHaveValue('25');
  await expect(page.getByTestId('start-menu-mute')).toBeChecked();
  assertNoErrors(errors);
});

test('legacy audio preferences migrate into profile storage', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ profileKey, mutedKey, volumeKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(volumeKey, '0.35');
      localStorage.setItem(mutedKey, '1');
    },
    { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  );

  await page.goto('/');
  await page.getByTestId('start-menu-settings').click();

  await expect(page.getByTestId('start-menu-volume')).toHaveValue('35');
  await expect(page.getByTestId('start-menu-mute')).toBeChecked();
  await expect(
    page.evaluate(
      ({ profileKey, mutedKey, volumeKey }) => ({
        muted: localStorage.getItem(`${profileKey}.robin.${mutedKey}`),
        volume: localStorage.getItem(`${profileKey}.robin.${volumeKey}`),
      }),
      { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
    ),
  ).resolves.toEqual({ muted: '1', volume: '0.35' });
  assertNoErrors(errors);
});

test('first-use bursts respect the per-sound pool cap', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-pool');
  await page.keyboard.press('p');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  await page.evaluate(() => {
    for (let i = 0; i < 8; i += 1) window.__GR_TEST__?.testAudio('invalid');
  });

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0)).toBeGreaterThan(before);
  const started = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  expect(started - before).toBeLessThanOrEqual(4);
  assertNoErrors(errors);
});

test('missing audio names are silent no-ops', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-missing');
  await unlockAudio(page);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.testAudio('__missing_audio__'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0)).toBe(before + 1);
  assertNoErrors(errors);
});
