import { expect, test, type Page } from '@playwright/test';

const MUSIC_VOLUME_KEY = 'gr.audio.music-volume.v1';

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
