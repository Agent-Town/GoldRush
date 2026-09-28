import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const DIR = 'artifacts/audio-music-toggle-1';
const MUSIC = 'era-e1-frontier-loop';
const OFF = 'gr.audio.music-off.v1';
const VOLUME = 'gr.audio.music-volume.v1';
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const bucket: string[] = [];
  errors.set(page, bucket);
  page.on('pageerror', error => bucket.push(error.message));
  page.on('console', message => { if (message.type() === 'error') bucket.push(message.text()); });
  await mkdir(DIR, { recursive: true });
});
test.afterEach(async ({ page }, info) => {
  const bucket = errors.get(page) ?? [];
  await writeFile(`${DIR}/errors-${info.project.name}-${info.title.replace(/\W+/g, '-')}.json`, JSON.stringify(bucket));
  expect(bucket).toEqual([]);
});

async function shot(page: Page, info: TestInfo, surface: string) {
  await page.screenshot({ path: `${DIR}/${surface}-${info.project.name}.jpg`, type: 'jpeg', quality: 80 });
}
async function seedProfile(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem('gr.profile.v2')) localStorage.setItem('gr.profile.v2', JSON.stringify({
      version: 2, activeId: 'music-toggle', profiles: [
        { id: 'music-toggle', name: 'Music Toggle', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
      ],
    }));
  });
}
async function runReady(page: Page) {
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0), { timeout: 30_000 }).toBeGreaterThan(5);
}
async function playing(page: Page, track = MUSIC) {
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops ?? []), { timeout: 20_000 }).toContain(track);
}
async function stopped(page: Page, track = MUSIC) {
  await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops ?? [])).not.toContain(track);
}

test('run one tap stops music, preserves volume, resumes live and survives reload', async ({ page }, info) => {
  test.setTimeout(90_000);
  await seedProfile(page);
  await page.goto('/?debug&nowaves&nolevel&seed=music-toggle');
  await runReady(page);
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  await playing(page);
  const toggle = page.getByTestId('music-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const box = await toggle.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await shot(page, info, 'hud');
  await toggle.click();
  await expect(toggle).toHaveText('Music off');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await stopped(page);
  expect(await page.evaluate(key => localStorage.getItem(key), OFF)).toBe('1');
  const sfxBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['menu-tap'] ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.testAudio('menu-tap'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['menu-tap'] ?? 0)).toBeGreaterThan(sfxBefore);
  await page.getByTestId('hud-pause').click();
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  // Measure BEFORE Playwright scrolls the slider into view for input.
  const measurement = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('[data-testid="pause-meta-panel"]')!;
    const slider = document.querySelector<HTMLElement>('[data-testid="pause-music-volume"]')!;
    const p = panel.getBoundingClientRect(), s = slider.getBoundingClientRect();
    const visibleTop = Math.max(0, p.top + panel.clientTop);
    const visibleBottom = Math.min(innerHeight, p.top + panel.clientTop + panel.clientHeight);
    return { viewport: { width: innerWidth, height: innerHeight }, panel: p.toJSON(), slider: s.toJSON(),
      visibleTop, visibleBottom, scrollTop: panel.scrollTop, scrollHeight: panel.scrollHeight,
      needsScroll: s.top < visibleTop || s.bottom > visibleBottom };
  });
  await writeFile(`${DIR}/pause-panel-${info.project.name}.json`, JSON.stringify(measurement, null, 2));
  await expect(page.getByTestId('pause-music-volume-enabled')).not.toBeChecked();
  await page.getByTestId('pause-music-volume').fill('20');
  await page.getByTestId('pause-music-volume-enabled').check();
  await playing(page);
  await expect(toggle).toHaveText('Music on');
  await page.getByTestId('hud-pause').click();
  await toggle.click();
  await stopped(page);
  expect(await page.evaluate(key => localStorage.getItem(key), VOLUME)).toBe('0.2');
  const musicRequests: string[] = [];
  page.on('request', request => { if (/era-e1-frontier-loop.*\.mp3/.test(request.url())) musicRequests.push(request.url()); });
  await page.reload();
  await runReady(page);
  await expect(toggle).toHaveText('Music off');
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked)).toBe(true);
  await page.waitForTimeout(1500); // Exceeds the deferred-music hold: off must not fetch later either.
  await stopped(page);
  expect(musicRequests).toEqual([]);
  expect(await page.evaluate(key => localStorage.getItem(key), VOLUME)).toBe('0.2');
  await toggle.click();
  await playing(page);
});

test('menu and town share one music preference with Settings', async ({ page }, info) => {
  test.setTimeout(90_000);
  await seedProfile(page);
  await page.goto('/');
  const menu = page.getByTestId('start-menu');
  await menu.getByTestId('music-toggle').click();
  await expect(menu.getByTestId('music-toggle')).toHaveText('Music off');
  await menu.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-music-volume-enabled')).not.toBeChecked();
  await page.getByTestId('start-menu-music-volume-enabled').check();
  await playing(page, 'title-theme');
  await expect(menu.getByTestId('music-toggle')).toHaveText('Music on');
  await page.getByTestId('start-menu-settings-close').click();
  await menu.getByTestId('music-toggle').click();
  await stopped(page, 'title-theme');
  await shot(page, info, 'menu');
  await page.getByTestId('start-menu-enter-town').click();
  const town = page.getByTestId('town-ui');
  await expect(town).toBeVisible({ timeout: 30_000 });
  await expect(town.getByTestId('music-toggle')).toHaveText('Music off');
  await town.getByTestId('music-toggle').click();
  await playing(page);
  await shot(page, info, 'town');
  await page.getByTestId('town-settings-toggle').click();
  await expect(page.getByTestId('town-music-volume-enabled')).toBeChecked();
  await page.getByTestId('town-music-volume-enabled').uncheck();
  await expect(town.getByTestId('music-toggle')).toHaveText('Music off');
  await stopped(page);
  await page.getByTestId('town-settings-toggle').click();
  await page.getByTestId('town-exit').click();
  await expect(menu.getByTestId('music-toggle')).toHaveText('Music off');
});

test('first boot can silence music before a profile exists', async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.goto('/');
  expect(await page.evaluate(() => localStorage.getItem('gr.profile.v2'))).toBeNull();
  const card = page.getByTestId('profile-title');
  const toggle = card.getByTestId('music-toggle');
  await expect(toggle).toBeVisible();
  await shot(page, info, 'first-boot');
  await toggle.click();
  await expect(toggle).toHaveText('Music off');
  await stopped(page, 'title-theme');
  await page.getByTestId('profile-name-input').fill('Quiet claim');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('town-ui').getByTestId('music-toggle')).toHaveText('Music off', { timeout: 30_000 });
});

test('music off is stored per profile', async ({ page }) => {
  await seedProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu').getByTestId('music-toggle').click();
  expect(await page.evaluate(key => localStorage.getItem(`gr.profile.v2.music-toggle.${key}`), OFF)).toBe('1');
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('gr.profile.v2')!);
    state.profiles.push({ id: 'second', name: 'Second', createdAt: 2, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] });
    state.activeId = 'second';
    localStorage.setItem('gr.profile.v2', JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByTestId('start-menu').getByTestId('music-toggle')).toHaveText('Music on');
});

test('turning off during a music fetch prevents its late start', async ({ page }) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await page.route(/era-e1-frontier-loop.*\.mp3/, async route => {
    requested = true;
    await held;
    await route.continue();
  });
  await page.goto('/?debug&nowaves&nolevel&seed=music-toggle-pending');
  await runReady(page);
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });
  try {
    await expect.poll(() => requested, { timeout: 20_000 }).toBe(true);
    await page.getByTestId('music-toggle').click();
    const response = page.waitForResponse(/era-e1-frontier-loop.*\.mp3/);
    release();
    await (await response).finished();
    await page.waitForTimeout(1000);
    await stopped(page);
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.startedBySound['era-e1-frontier-loop'] ?? 0)).toBe(0);
    await page.getByTestId('music-toggle').click();
    await playing(page);
  } finally {
    release();
  }
});
