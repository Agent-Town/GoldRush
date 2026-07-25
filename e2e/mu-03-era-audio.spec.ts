import { expect, test, type Page } from '@playwright/test';

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(10_000);
    localStorage.setItem('gr.profile.v2', JSON.stringify({
      version: 2,
      activeId: 'mu-03',
      profiles: [{ id: 'mu-03', name: 'Era Audio', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
  });
}

async function expectLoop(page: Page, query: string, loop: string): Promise<void> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await seedProfile(page);
  await page.goto(query);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0)).toBeGreaterThan(0);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => /era-e[123]-.*-loop/.test(entry.name)))).toBe(false);
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.loops)).toContain(loop);
  expect(errors).toEqual([]);
}

test('E2 contract uses the Steamworks loop without boot-critical audio', async ({ page }) => {
  await expectLoop(page, '/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&seed=mu-03-e2', 'era-e2-steamworks-loop');
});

test('E1 contract keeps the frontier loop', async ({ page }) => {
  await expectLoop(page, '/?debug&epoch=epoch-2-steamworks&contract=the-claim&nowaves&nolevel&nopause&seed=mu-03-e1', 'era-e1-frontier-loop');
});

test('title autoplay gate, music volume, and mute still hold', async ({ page }) => {
  await seedProfile(page);
  await page.goto('/');
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('title-theme')))).toBe(false);
  await page.getByTestId('start-menu-settings').click();
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops)).toContain('title-theme');
  await page.getByTestId('start-menu-music-volume').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.getByTestId('start-menu-music-volume-value')).toHaveText('20%');
  await page.getByTestId('start-menu-mute').check();
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops)).not.toContain('title-theme');
});
