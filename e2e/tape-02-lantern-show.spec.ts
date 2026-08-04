import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { RUN_TAPES_KEY, RUN_TAPE_SIM_VERSION, type RunTape } from '../src/game/RunTape';
import { LANTERN_VERSION_REFUSAL } from '../src/ui/LanternShow';

const SHOT_DIR = path.resolve('reviews/shots-tape-02');

test('plain town WATCH replays a fresh tape read-only and refuses a mismatched reel', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await seedProfile(page);
  const errors = collectErrors(page);
  const tape = await recordTape(page);

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await openTapeShelf(page);
  await expect(page.getByTestId('watch-run-tape')).toHaveCount(1);
  await expect(page.getByTestId('tape-shelf')).toContainText('KEPT');
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  const storageBefore = await storageBytes(page);

  await page.getByTestId('watch-run-tape').click();
  const show = page.getByTestId('lantern-show');
  await expect(show).toBeVisible();
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  await expect(page.getByTestId('lantern-intertitle')).toHaveText('Hold the east bank.');
  await expect(page.locator('[data-lantern-scrub]')).toHaveCount(0);
  await shot(page, testInfo, 'lantern-show');

  await page.getByTestId('lantern-speed-4').click();
  await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 15_000 });
  const status = page.getByTestId('lantern-playback-status');
  await expect(status).toHaveAttribute('data-hash', tape.eventLogHash);
  await expect(status).toHaveAttribute('data-expected-hash', tape.eventLogHash);
  await page.getByTestId('lantern-restart').click();

  await page.getByTestId('lantern-pause').click();
  await expect(show).toHaveAttribute('data-playback', 'paused');
  const pausedTick = Number(await show.getAttribute('data-tick'));
  await page.waitForTimeout(250);
  expect(Number(await show.getAttribute('data-tick'))).toBe(pausedTick);
  await page.getByTestId('lantern-pause').click();
  await page.getByTestId('lantern-speed-2').click();
  await expect(show).toHaveAttribute('data-speed', '2');
  await page.waitForTimeout(250);
  const beforeRestart = Number(await show.getAttribute('data-tick'));
  expect(beforeRestart).toBeGreaterThan(0);
  await page.getByTestId('lantern-restart').click();
  await expect.poll(async () => Number(await show.getAttribute('data-tick'))).toBeLessThan(beforeRestart);
  await page.getByTestId('lantern-speed-4').click();
  await expect(show).toHaveAttribute('data-speed', '4');
  await page.keyboard.press('ArrowRight');
  await page.getByTestId('lantern-wave-skip').click();
  await expect(show).toHaveAttribute('data-playback', 'skipping');
  await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 15_000 });
  expect(await storageBytes(page)).toBe(storageBefore);
  await page.getByTestId('lantern-close').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

  await page.evaluate(({ key, simVersion }) => {
    const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
    if (!shelf.tapes?.[0]) throw new Error('Recorded tape missing');
    shelf.tapes[0].simVersion = simVersion + 1;
    localStorage.setItem(key, JSON.stringify(shelf));
  }, { key: RUN_TAPES_KEY, simVersion: RUN_TAPE_SIM_VERSION });
  await openTapeShelf(page);
  await page.getByTestId('watch-run-tape').click();
  await expect(page.getByTestId('tape-version-refusal')).toHaveText(LANTERN_VERSION_REFUSAL);
  await expect(page.getByTestId('lantern-show')).toHaveCount(0);
  await expect(page.getByTestId('tape-shelf')).toContainText(/wave 0.*KEPT/s);
  await shot(page, testInfo, 'version-refusal');
  expect(errors).toEqual({ console: [], page: [] });
});

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, firstClaimKey, welcomeKey }) => {
    if (localStorage.getItem(profileKey)) return;
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [], trailGuide: true }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(firstClaimKey, '1');
    localStorage.setItem(welcomeKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    firstClaimKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    welcomeKey: profileDataKey('robin', TOWN_WELCOME_SEEN_KEY),
  });
}

async function recordTape(page: Page): Promise<RunTape> {
  await page.goto('/?debug&seed=tape-02-proof');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  const script = [
    { t: 0, mx: 0.2, my: 0, a: [] },
    { t: 30, mx: 0, my: 0, a: [] },
    { t: 180, mx: 0, my: 0.2, a: [] },
    { t: 210, mx: 0, my: 0, a: [] },
    { t: 360, mx: -0.2, my: 0, a: [] },
    { t: 390, mx: 0, my: 0, a: [] },
  ];
  expect(await page.evaluate((entries) => window.__GR_TEST__!.playbook.startRecording({ script: entries }), script)).toMatchObject({ ok: true });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await page.getByTestId('keep-run-tape').click();
  return page.evaluate((key) => {
    const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
    const tape = shelf.tapes?.[0];
    if (!tape) throw new Error('Recorded tape missing');
    tape.annotations = [{ atMs: 0, text: 'Hold the east bank.' }];
    localStorage.setItem(key, JSON.stringify(shelf));
    return tape;
  }, RUN_TAPES_KEY);
}

async function openTapeShelf(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const approach = town.buildings.find((building) => building.id === 'schoolhouse')!.approach;
    town.teleport(approach.x, approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await page.getByTestId('schoolhouse-open-tapes').click();
  await expect(page.getByTestId('tape-shelf')).toBeVisible();
}

async function storageBytes(page: Page): Promise<string> {
  return page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort(([left], [right]) => left.localeCompare(right))));
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}
