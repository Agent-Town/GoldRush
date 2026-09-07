import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import type { ScoreRecord } from '../src/game/Scoreboard';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E9_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * SS-10 - THE RED FIELDS AS DATA. Chapter E9 (`lore/STORYBOOK.md:529-577`) reaches the player the
 * way E3, E4, E5 and E6 do: one attributed table, loaded only while the active epoch is
 * `epoch-9-redfields`, presented by the runtime that already exists.
 *
 * THE DOOR IS THE PLAYER'S. `e9-devils-alley`'s board row is `unlock: "secured:e9-seed-run"`
 * (`assets/contracts/epoch-9-redfields/contracts.json:336`+), so the honest way into the alley is
 * to BE a player who has secured the two rows before it: two scoreboard rows and one active-epoch
 * key, written through the app's own profile-scoped storage. No `?debug`, no private handle, no
 * flag (Mistake #10) - the board that opens is the board a Red Fields player opens.
 */
const E1 = 'epoch-1-frontier';
const E2 = 'epoch-2-steamworks';
const E9 = 'epoch-9-redfields';
const SHOTS = 'reviews/shots-ss-10-e9-beats';
const IDS = [
  'e9-dome-basin-arrival',
  'e9-water-ledger-opened',
  'e9-grass-square-planted',
  'e9-greenkeeper-outside',
  'e9-gazette-yearly-number',
  'e9-seed-run-planting',
  'e9-devils-alley-wind',
  'e9-old-canal-verdicts',
  'e9-first-water-panned',
  'e9-digger-correction',
  'e9-tavern-obedient-joke',
  'e9-digger-kept',
  'e9-gazette-crossed-pickaxes',
  'e9-first-swim',
  'e9-generation-ark-horizon',
  // story-correctives-batch, 2026-09-07: F-SSG-5 recorded that OldDiggerBossSystem reports three acts
  // and only `renovation` had a consuming beat. These two close it, appended at the table's end.
  'e9-digger-boarding',
  'e9-digger-swap',
] as const;
// The Digger's acts and the beat each one reaches (src/systems/OldDiggerBossSystem.ts:427, :267,
// :219). `renovation` is emitted in the same call as `boss-arrival`, by that system's own note.
const DIGGER_ACTS = [
  ['renovation', 'e9-digger-correction'],
  ['boarding', 'e9-digger-boarding'],
  ['swap', 'e9-digger-swap'],
] as const;
const OLD_STORY_HINTS = STORY_RUNTIME_BEATS
  .filter((beat) => beat.oncePerProfile)
  .map((beat) => `story:${beat.id}`);
const SECURED: readonly ScoreRecord[] = [
  { waves: 20, kills: 900, gold: 200, timeAlive: 600, at: 1, secured: true, contractId: 'e9-dome-basin' },
  { waves: 20, kills: 900, gold: 200, timeAlive: 600, at: 2, secured: true, contractId: 'e9-seed-run' },
];

async function seedTown(page: Page, epochId: string, scores: readonly ScoreRecord[] = []): Promise<void> {
  await page.addInitScript(({ activeEpochKey, epochId, firstClaimKey, flatEpochKey, flatFirstClaimKey, flatScoreKey, flatTownKey, hints, marker, profileKey, scoreKey, scores, townKey }) => {
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
    if (scores.length > 0) {
      localStorage.setItem(scoreKey, JSON.stringify(scores));
      localStorage.setItem(flatScoreKey, JSON.stringify(scores));
    }
    localStorage.setItem(marker, '1');
  }, {
    activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    epochId,
    firstClaimKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    flatEpochKey: ACTIVE_EPOCH_KEY,
    flatFirstClaimKey: FIRST_CLAIM_DONE_KEY,
    flatScoreKey: SCOREBOARD_KEY,
    flatTownKey: TOWN_NAME_KEY,
    hints: OLD_STORY_HINTS,
    marker: `ss-10-seeded:${epochId}`,
    profileKey: PROFILE_KEY,
    scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
    scores: [...scores],
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

test('SS-10 table is attributed, presentational, and uses the shipped trigger vocabulary', () => {
  expect(E9_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E9_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['contract-unlocked', 'boss-arrival', 'boss-act', 'boss-defeat', 'run-return-town', 'science-complete']).toContain(beat.trigger);
  }
});

test('every SS-10 artKey names a plate that is actually on disk', () => {
  for (const beat of E9_STORY_BEATS) {
    if (!beat.artKey) continue;
    expect(existsSync(`assets/raw/${beat.artKey}.png`), `${beat.id} -> ${beat.artKey}`).toBe(true);
  }
});

test('a player-selected Red Fields town presents the arrival, the water ledger and the cast before the ride', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  await seedTown(page, E9, SECURED);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();

  await seekBeat(page, 'e9-dome-basin-arrival');
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-9-redfields"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-9-redfields')).toBeVisible();
  await expect(page.getByTestId('story-beat-card')).toContainText('Pan Monument');
  await shot(page, testInfo, 'arrival');
  await dismissBeat(page);

  await expectBeat(page, 'e9-water-ledger-opened');
  await expect(page.getByTestId('story-beat-card')).toContainText('water ledger');
  await shot(page, testInfo, 'water-ledger');
  await dismissBeat(page);

  await expectBeat(page, 'e9-grass-square-planted');
  await expect(page.getByTestId('story-beat-card')).toContainText('commons soil');
  await shot(page, testInfo, 'grass-square');
  await dismissBeat(page);

  await seekBeat(page, 'e9-devils-alley-wind');
  await expect(page.getByTestId('story-beat-card')).toContainText('set it down somewhere else');
  await shot(page, testInfo, 'devils-alley-beat');
  await dismissBeat(page);

  await page.getByTestId('contract-launch-e9-devils-alley').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-devils-alley');
  await shot(page, testInfo, 'devils-alley-ride');
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Red Fields beats in Frontier', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e9-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e9-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test('every Old Digger act reaches one beat, and only its own', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  await seedTown(page, E9);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  // StoryRuntime.dismiss() opens a GAP_MS window before the next card, so an empty active() only
  // proves an empty queue once that window has elapsed (the drain shape ss-09 and ss-11 both use).
  const drain = async (): Promise<string[]> => {
    const seen: string[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      try {
        await expect.poll(() => page.evaluate(() => window.__GR_STORY__?.active() ?? null), { timeout: 5_000 }).not.toBeNull();
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

  for (const [act, id] of DIGGER_ACTS) {
    const signal: RuntimeStorySignal = { type: 'boss-act', contractId: 'e9-dome-basin', boss: 'old-digger', act };
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
    expect(await drain(), `boss-act ${act}`).toEqual([id]);
  }
  expectNoConsoleErrors(errors);
});

test(`${E2} cannot load Red Fields beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E2);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  const signal: RuntimeStorySignal = {
    type: 'contract-unlocked',
    contractId: 'e9-dome-basin',
    contractName: 'The Dome Basin',
    ledgerBlurb: 'Cut the feeder canal, hold its three gates, and raise a town around the dry basin.',
  };
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e9-')))).toEqual([]);
  expectNoConsoleErrors(errors);
});
