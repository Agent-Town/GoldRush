import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E6_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const E1 = 'epoch-1-frontier';
const E3 = 'epoch-3-voltage';
const E6 = 'epoch-6-atomic';
const SHOTS = 'reviews/shots-ss-07-e6-beats';
const IDS = [
  'e6-glow-mesa-arrival',
  'e6-steward-doorless-dome',
  'e6-pen-first-tenant',
  'e6-defector-catalog',
  'e6-gazette-free-trial',
  'e6-homemaker-arrives',
  'e6-homemaker-kept',
  'e6-second-opinion',
  'e6-vaccine-written-down',
  'e6-tavern-wrangler-drinks-free',
  'e6-gazette-the-printing',
  'e6-calculating-house',
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
    marker: `ss-07-seeded:${epochId}`,
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

test('SS-07 table is attributed, presentational, and uses the E2/E3 trigger vocabulary', () => {
  expect(E6_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E6_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['contract-unlocked', 'wave-complete', 'boss-arrival', 'boss-defeat', 'run-return-town', 'science-complete']).toContain(beat.trigger);
    const lines = typeof beat.lines === 'function' ? [] : beat.lines;
    for (const line of lines) expect(line).not.toContain('—');
  }
});

test('a player-selected Atomic town presents the mesa arrival and the steward before the ride', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E6);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();

  await seekBeat(page, 'e6-glow-mesa-arrival');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-6-atomic"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-6-atomic')).toBeVisible();
  await expect(page.getByTestId('story-beat-card')).toContainText('catalog warehouse');
  await shot(page, testInfo, 'arrival');
  await dismissBeat(page);
  await expectBeat(page, 'e6-steward-doorless-dome');
  await expect(page.getByTestId('story-beat-card')).toContainText('It has no door');
  await shot(page, testInfo, 'steward');
  await dismissBeat(page);
  await expectBeat(page, 'e6-pen-first-tenant');
  await dismissBeat(page);

  await page.getByTestId('contract-launch-e6-glow-mesa').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  await shot(page, testInfo, 'mesa-ride');
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Atomic beats in Frontier', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e6-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e6-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test(`${E3} cannot load Atomic beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E3);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  const signal: RuntimeStorySignal = {
    type: 'contract-unlocked',
    contractId: 'e6-glow-mesa',
    contractName: 'The Glow Mesa',
    ledgerBlurb: 'Power without digging, on high ground.',
  };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e6-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e6-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test('the Atomic boss and return beats fire only on their own triggers', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  await seedTown(page, E6);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  const emit = async (signal: RuntimeStorySignal): Promise<void> => {
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  };
  // StoryRuntime.dismiss() opens a GAP_MS window before the next card (StoryRuntime.ts:123),
  // so an empty active() is only proof of an empty queue once that window has elapsed.
  const drain = async (): Promise<string[]> => {
    const seen: string[] = [];
    for (let attempt = 0; attempt < 24; attempt += 1) {
      try {
        await expect
          .poll(() => page.evaluate(() => window.__GR_STORY__?.active() ?? null), { timeout: 5_000 })
          .not.toBeNull();
      } catch {
        break;
      }
      const active = await page.evaluate(() => window.__GR_STORY__?.active() ?? null);
      if (!active) break;
      seen.push(active);
      await dismissBeat(page);
    }
    return seen;
  };

  await emit({ type: 'boss-arrival', contractId: 'e6-glow-mesa', contractName: 'The Glow Mesa' });
  expect(await drain()).toContain('e6-homemaker-arrives');

  await emit({ type: 'boss-defeat', contractId: 'e6-glow-mesa', contractName: 'The Glow Mesa' });
  expect(await drain()).toContain('e6-homemaker-kept');

  await emit({ type: 'run-return-town', result: 'secured' });
  const afterReturn = await drain();
  expect(afterReturn).toContain('e6-second-opinion');
  expect(afterReturn).toContain('e6-tavern-wrangler-drinks-free');
  expect(afterReturn).not.toContain('e6-gazette-the-printing');

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(await drain()).toContain('e6-gazette-the-printing');

  expectNoConsoleErrors(errors);
});
