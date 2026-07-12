import { expect, test, type Page } from '@playwright/test';

const MUSIC_VOLUME_KEY = 'gr.audio.music-volume.v1';
type MusicAudio = ThreeGameDiagnostics['audio'] & { loopElapsedSeconds: Record<string, number> };

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      'gr.profile.v2',
      JSON.stringify({
        version: 2,
        activeId: 'music-test',
        profiles: [{ id: 'music-test', name: 'Music Test', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
  });
}

test('title music waits for a gesture and music volume persists', async ({ page }) => {
  await seedProfile(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('title-theme'))))
    .toBe(false);

  await page.getByTestId('start-menu-settings').click();
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.unlocked)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops)).toContain('title-theme');

  const slider = page.getByTestId('start-menu-music-volume');
  await slider.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.getByTestId('start-menu-music-volume-value')).toHaveText('20%');
  await expect(page.evaluate((key) => localStorage.getItem(key), MUSIC_VOLUME_KEY)).resolves.toBe('0.2');

  await page.reload();
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-music-volume')).toHaveValue('20');
});

test('E1 music is lazy and active in-run on desktop and mobile', async ({ page }, testInfo) => {
  await seedProfile(page);
  await page.goto('/?debug&profile&nowaves&nolevel&nopause&tier=lite&seed=mu-02');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0)).toBeGreaterThan(0);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('era-e1-frontier-loop')))).toBe(false);

  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.loops)).toContain('era-e1-frontier-loop');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.musicVolume)).resolves.toBe(0.35);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier)).resolves.toBe('lite');
  expect(testInfo.project.name).toMatch(/desktop|mobile/);
});

test('shot bursts do not restart the E1 music loop', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await seedProfile(page);
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=mu-02-shots');
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.loops)).toContain('era-e1-frontier-loop');
  await expect
    .poll(() => page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.audio as { loopElapsedSeconds?: Record<string, number> })?.loopElapsedSeconds?.['era-e1-frontier-loop'] ?? 0))
    .toBeGreaterThan(0.25);

  const before = await page.evaluate(() => {
    const audio = window.__THREE_GAME_DIAGNOSTICS__?.audio as MusicAudio;
    return {
      elapsed: audio.loopElapsedSeconds['era-e1-frontier-loop'] ?? 0,
      starts: audio.startedBySound['era-e1-frontier-loop'] ?? 0,
    };
  });

  await page.evaluate(async () => {
    for (const name of ['wind-gust', 'river-ambience-loop', 'prospector-hover-loop']) {
      for (let i = 0; i < 4; i += 1) window.__GR_TEST__?.testAudio(name);
    }
    for (let i = 0; i < 5; i += 1) {
      window.__GR_TEST__?.testAudio('spark-bolt-fire');
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
  });

  const after = await page.evaluate(() => {
    const audio = window.__THREE_GAME_DIAGNOSTICS__?.audio as MusicAudio;
    return {
      elapsed: audio.loopElapsedSeconds['era-e1-frontier-loop'] ?? 0,
      starts: audio.startedBySound['era-e1-frontier-loop'] ?? 0,
    };
  });
  expect(after.elapsed).toBeGreaterThan(before.elapsed);
  expect(after.starts).toBe(before.starts);
  expect(errors).toEqual([]);
});
