import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E5_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const E1 = 'epoch-1-frontier';
const E2 = 'epoch-2-steamworks';
const E5 = 'epoch-5-deepwater';
const SHOTS = 'reviews/shots-ss-06-e5-beats';
const IDS = [
  'e5-deepwater-claim-arrival',
  'e5-harbormaster-manifest',
  'e5-rebuild-long-table',
  'e5-tide-teller-reading',
  'e5-gazette-monument-carry',
  'e5-first-dive-w1',
  'e5-regatta-storm-course',
  'e5-stillwater-quiet',
  'e5-flotilla-formation',
  'e5-dredge-queen-flag',
  'e5-tavern-locomotive-argument',
  'e5-mystery-hull-w5',
  'e5-gazette-crossed-pickaxes',
  'e5-deep-reactor-horizon',
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
    marker: `ss-06-seeded:${epochId}`,
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

test('SS-06 table is attributed, presentational, and uses the E2/E3 trigger vocabulary', () => {
  expect(E5_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E5_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['contract-unlocked', 'wave-complete', 'boss-arrival', 'run-return-town', 'science-complete']).toContain(beat.trigger);
  }
});

test('a player-selected Deepwater town presents the Claim-Boat arrival and the manifest before the ride', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E5);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();

  await seekBeat(page, 'e5-deepwater-claim-arrival');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-5-deepwater"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-5-deepwater')).toBeVisible();
  await expect(page.getByTestId('story-beat-card')).toContainText('anchor points');
  await shot(page, testInfo, 'arrival');
  await dismissBeat(page);
  await expectBeat(page, 'e5-harbormaster-manifest');
  await expect(page.getByTestId('story-beat-card')).toContainText('wheelhouse door');
  await shot(page, testInfo, 'manifest');
  await dismissBeat(page);
  await expectBeat(page, 'e5-rebuild-long-table');
  await expect(page.getByTestId('story-beat-card')).toContainText('long table');
  await shot(page, testInfo, 'rebuild');
  await dismissBeat(page);
  await expectBeat(page, 'e5-tide-teller-reading');
  await shot(page, testInfo, 'tide-teller');
  await dismissBeat(page);

  await page.getByTestId('contract-launch-e5-deepwater-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await shot(page, testInfo, 'deepwater-ride');
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Deepwater beats in Frontier', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e5-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e5-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test(`${E2} cannot load Deepwater beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E2);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  const signal: RuntimeStorySignal = {
    type: 'contract-unlocked',
    contractId: 'e5-deepwater-claim',
    contractName: 'The Deepwater Claim',
    ledgerBlurb: 'Anchor the floating claim, read the storm glass, and keep the drowned eras below on the chart.',
  };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e5-')))).toEqual([]);
  expectNoConsoleErrors(errors);
});
