import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E4_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const E1 = 'epoch-1-frontier';
const E3 = 'epoch-3-voltage';
const E4 = 'epoch-4-motor';
const SHOTS = 'reviews/shots-ss-05-e4-beats';
const IDS = [
  'e4-dust-flats-arrival',
  'e4-first-flivver',
  'e4-gazette-crude-bath',
  'e4-road-boss-theodolite',
  'e4-sidecar-rides-along',
  'e4-long-road-goodbyes',
  'e4-gusher-county-order',
  'e4-boneyard-quiet-rows',
  'e4-land-yacht-dread',
  'e4-diner-radio',
  'e4-tavern-freed-hands',
  'e4-gazette-re-survey',
  'e4-gazette-dust-chart',
  'e4-boat-horizon',
] as const;
const OLD_STORY_HINTS = STORY_RUNTIME_BEATS
  .filter((beat) => beat.oncePerProfile)
  .map((beat) => `story:${beat.id}`);

async function seedTown(page: Page, epochId: string): Promise<void> {
  await page.addInitScript(({ activeEpochKey, epochId, firstClaimKey, flatEpochKey, flatFirstClaimKey, flatTownKey, hints, marker, profileKey, townKey }) => {
    if (localStorage.getItem(marker)) return;
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: hints }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(flatTownKey, 'Quartz Hill');
    localStorage.setItem(firstClaimKey, '1');
    localStorage.setItem(flatFirstClaimKey, '1');
    localStorage.setItem(activeEpochKey, epochId);
    localStorage.setItem(flatEpochKey, epochId);
    localStorage.setItem(marker, '1');
  }, {
    activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    epochId,
    firstClaimKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    flatEpochKey: ACTIVE_EPOCH_KEY,
    flatFirstClaimKey: FIRST_CLAIM_DONE_KEY,
    flatTownKey: TOWN_NAME_KEY,
    hints: OLD_STORY_HINTS,
    marker: `ss-05-seeded:${epochId}`,
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
  });
}

async function enterTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 56; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'tavern') return;
    const { player, target } = await page.evaluate(() => ({
      player: window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 },
      target: window.__GR_TOWN_DIAGNOSTICS__?.buildings.find((building) => building.id === 'tavern')?.approach ?? { x: 0, z: 0 },
    }));
    const keys = [
      ...(Math.abs(target.x - player.x) > 0.55 ? [target.x > player.x ? 'KeyD' : 'KeyA'] : []),
      ...(Math.abs(target.z - player.z) > 0.55 ? [target.z > player.z ? 'KeyS' : 'KeyW'] : []),
    ];
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(150);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe('tavern');
}

async function expectBeat(page: Page, id: string): Promise<void> {
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', id, { timeout: 8_000 });
}

async function seekBeat(page: Page, id: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await expect.poll(() => page.evaluate(() => window.__GR_STORY__?.active()), { timeout: 8_000 }).not.toBeNull();
    if ((await page.evaluate(() => window.__GR_STORY__?.active())) === id) return;
    await dismissBeat(page);
  }
  throw new Error(`Story beat ${id} did not reach the front of the queue.`);
}

async function dismissBeat(page: Page): Promise<void> {
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

test('SS-05 table is attributed, presentational, and uses live trigger vocabulary only', () => {
  expect(E4_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E4_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    // Every trigger here has a real emitter in src/ (contract board, boss arrival, town
    // return, science ceiling). 'science-threshold' is excluded on purpose, see F-SS05-1.
    expect(['contract-unlocked', 'boss-arrival', 'run-return-town', 'science-complete']).toContain(beat.trigger);
    const lines = typeof beat.lines === 'function' ? beat.lines({ type: 'run-return-town', result: 'secured' }) : beat.lines;
    for (const line of lines) expect(line).not.toContain('—');
  }
});

test('a player-selected Motor town presents the Dust Flats arrival and the first Flivver before the ride', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E4);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();

  await seekBeat(page, 'e4-dust-flats-arrival');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-4-motor"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-4-motor')).toBeVisible();
  await expect(page.getByTestId('story-beat-card')).toContainText('too big to walk');
  await shot(page, testInfo, 'arrival');
  await dismissBeat(page);
  await expectBeat(page, 'e4-first-flivver');
  await expect(page.getByTestId('story-beat-card')).toContainText('first Flivver');
  await shot(page, testInfo, 'first-flivver');
  await dismissBeat(page);
  await expectBeat(page, 'e4-gazette-crude-bath');
  await dismissBeat(page);

  await page.getByTestId('contract-launch-e4-dust-flats').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats');
  await shot(page, testInfo, 'dust-flats-ride');
  expectNoConsoleErrors(errors);
});

test('the Land-Yacht dread beat rides its own boss arrival in a Motor town', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E4);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  const arrival: RuntimeStorySignal = { type: 'boss-arrival', contractId: 'e4-dust-flats', contractName: 'The Dust Flats' };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), arrival);
  await expectBeat(page, 'e4-land-yacht-dread');
  await expect(page.getByTestId('story-beat-card')).toContainText('dust column');
  await shot(page, testInfo, 'land-yacht-dread');
  await dismissBeat(page);

  // The tavern tale and the re-survey headline wait for the Yacht to have been met.
  const returned: RuntimeStorySignal = { type: 'run-return-town', result: 'secured' };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), returned);
  await seekBeat(page, 'e4-tavern-freed-hands');
  await expect(page.getByTestId('story-beat-card')).toContainText('stare at their own hands');
  await shot(page, testInfo, 'freed-hands');
  await dismissBeat(page);
  await seekBeat(page, 'e4-gazette-re-survey');
  await expect(page.getByTestId('story-beat-card')).toContainText("surveyor's box");
  await dismissBeat(page);
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Motor beats in Frontier', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e4-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e4-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test(`${E3} cannot load Motor beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E3);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  const signal: RuntimeStorySignal = {
    type: 'contract-unlocked',
    contractId: 'e4-dust-flats',
    contractName: 'The Dust Flats',
    ledgerBlurb: 'A wide motor field ringed by road, derricks, tar seams, and one dry wash.',
  };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e4-')))).toEqual([]);
  expectNoConsoleErrors(errors);
});
