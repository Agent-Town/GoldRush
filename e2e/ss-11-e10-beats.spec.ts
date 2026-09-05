import { mkdir, readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import type { ScoreRecord } from '../src/game/Scoreboard';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { E10_STORY_BEATS, STORY_RUNTIME_BEATS } from '../src/story/beats';
import type { RuntimeStorySignal } from '../src/story/signals';
import { STORY_SPEAKERS } from '../src/story/speakers';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const E1 = 'epoch-1-frontier';
const E3 = 'epoch-3-voltage';
const E10 = 'epoch-10-deepsky';
const SHOTS = 'reviews/shots-ss-11-e10-beats';
// The Ember Shore is the only default-unlocked Deep Sky contract
// (assets/contracts/epoch-10-deepsky/contracts.json, boardRow.unlock), so opening the board in a
// fresh Deep Sky town queues exactly the seven boarding beats and nothing from the other three maps.
const ARRIVAL_IDS = [
  'e10-ark-boarding',
  'e10-long-table-seed',
  'e10-welcome-from',
  'e10-baron-stays',
  'e10-quack-freed',
  'e10-ember-shore-arrival',
  'e10-gazette-new-verb',
] as const;
const IDS = [
  ...ARRIVAL_IDS,
  'e10-archive-world-shelf',
  'e10-last-claim-decks',
  'e10-river-charter',
  'e10-chalk-manifest',
  'e10-what-you-hand-on',
  'e10-portrait-fades',
  'e10-unraveled-board',
  'e10-three-preserves',
  'e10-tavern-starlight-pan',
  'e10-gazette-mote-in-the-jar',
  'e10-watch-wound',
  'e10-charter-press',
] as const;
const EMBER_SHORE: RuntimeStorySignal = {
  type: 'contract-unlocked',
  contractId: 'e10-ember-shore',
  contractName: 'The Ember Shore',
  ledgerBlurb: 'Cooling lava-vein bands divide the last warm vent from a cooled titan.',
};
const OLD_STORY_HINTS = STORY_RUNTIME_BEATS
  .filter((beat) => beat.oncePerProfile)
  .map((beat) => `story:${beat.id}`);

function securedScore(contractId: string, at: number): ScoreRecord {
  return { waves: 12, kills: 40, gold: 900, timeAlive: 600, at, secured: true, secureWave: 12, deepestWave: 12, contractId, profileName: 'Robin' };
}

// The Last Claim sits behind secured:e10-archive-world behind secured:e10-ember-shore
// (assets/contracts/epoch-10-deepsky/contracts.json, boardRow.unlock; src/meta/ContractUnlock.ts:56-65),
// so a player reaching it carries exactly these two secured ledger rows.
const PRIOR_WORLDS_SECURED: ScoreRecord[] = [securedScore('e10-ember-shore', 1_700_000_000_000), securedScore('e10-archive-world', 1_700_000_000_001)];

async function seedTown(page: Page, epochId: string, scores: ScoreRecord[] = []): Promise<void> {
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
    marker: `ss-11-seeded:${epochId}`,
    profileKey: PROFILE_KEY,
    scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
    scores,
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

async function seekBeat(page: Page, id: string): Promise<void> {
  for (let attempt = 0; attempt < 24; attempt += 1) {
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

// return-secured (src/story/beats.ts:176-182) is oncePerProfile:false, so it rides EVERY secured
// return and is never pre-marked by OLD_STORY_HINTS. It is core copy, not Deep Sky copy: the
// chapter's own ordering is read through this filter, and cross-era leakage is proved by the two
// negative tests below instead.
// One evaluate, one snapshot: id, speaker and copy are read together so an auto-dismiss between
// two separate reads cannot make the assertion describe a different card than the one named.
async function cardSnapshot(page: Page): Promise<{ id: string; speaker: string; text: string }> {
  return page.evaluate(() => {
    const card = document.querySelector('[data-testid=\"story-beat-card\"]');
    return { id: card?.getAttribute('data-beat-id') ?? '', speaker: card?.getAttribute('data-speaker') ?? '', text: card?.textContent ?? '' };
  });
}

function e10Only(ids: readonly string[]): string[] {
  return ids.filter((id) => id.startsWith('e10-'));
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-${name}.png`, scale: 'css' });
}

test('SS-11 table is attributed, presentational, and uses the E2/E3 trigger vocabulary', () => {
  expect(E10_STORY_BEATS.map((beat) => beat.id)).toEqual([...IDS]);
  for (const beat of E10_STORY_BEATS) {
    expect(beat.oncePerProfile).toBe(true);
    expect(beat.presentation).toBe('card');
    expect(STORY_SPEAKERS[beat.speaker]).toBeTruthy();
    expect(['contract-unlocked', 'wave-complete', 'boss-arrival', 'boss-defeat', 'run-return-town', 'science-complete']).toContain(beat.trigger);
    const lines = typeof beat.lines === 'function' ? [] : beat.lines;
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line).not.toContain('—');
  }
});

test('every Deep Sky beat cites a storybook line in source', async () => {
  const source = await readFile(new URL('../src/story/beats.ts', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('export const E10_STORY_BEATS'));
  const lines = block.split('\n');
  for (const id of IDS) {
    const index = lines.findIndex((line) => line.includes(`id: '${id}',`));
    expect(index, `${id} is missing from the E10 block`).toBeGreaterThan(0);
    // The citation comment opens the beat literal, at most four lines above the id.
    expect(lines.slice(Math.max(0, index - 5), index).join('\n'), `${id} has no lore/STORYBOOK.md citation`).toContain('lore/STORYBOOK.md:');
  }
});

test('a player-selected Deep Sky town presents the boarding and the Long Table before the ride', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  await seedTown(page, E10, PRIOR_WORLDS_SECURED);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  // Open the Deep Sky chapter BEFORE reading any card: StoryRuntime auto-dismisses a card after
  // CARD_MS (src/story/StoryRuntime.ts:10), so board work between a seek and its assertion races
  // the card it is meant to prove.
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-chapter-tab-epoch-10-deepsky"]')?.click());
  await expect(page.getByTestId('contract-chapter-epoch-10-deepsky')).toBeVisible();

  // The arrival: read the id and the copy in ONE snapshot, so the assertion cannot be overtaken.
  await seekBeat(page, 'e10-ark-boarding');
  expect(await cardSnapshot(page)).toMatchObject({ id: 'e10-ark-boarding', speaker: 'prospector' });
  expect((await cardSnapshot(page)).text).toContain('the laugh was a yes');
  await shot(page, testInfo, 'boarding');

  // A cast beat at its own trigger: the Baron who does not board, spoken by the preacher.
  await seekBeat(page, 'e10-baron-stays');
  const baron = await cardSnapshot(page);
  expect(baron.speaker).toBe('preacher');
  expect(baron.text).toContain('Maybe it runs out there');
  await shot(page, testInfo, 'baron-stays');

  await seekBeat(page, 'e10-last-claim-decks');
  expect((await cardSnapshot(page)).text).toContain('the deck is the map');
  await shot(page, testInfo, 'last-claim-decks');
  await dismissBeat(page);
  await page.getByTestId('contract-launch-e10-last-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');
  await shot(page, testInfo, 'last-claim-ride');
  expectNoConsoleErrors(errors);
});

test('The Claim cannot load Deep Sky beats in Frontier', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seedTown(page, E1);
  await enterTown(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e10-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e10-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test(`${E3} cannot load Deep Sky beats`, async ({ page }) => {
  const errors = watchErrors(page);
  await seedTown(page, E3);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), EMBER_SHORE);
  expect(await page.evaluate(() => window.__GR_STORY__?.pending().filter((id) => id.startsWith('e10-')))).toEqual([]);
  await expect(page.locator('[data-beat-id^="e10-"]')).toHaveCount(0);
  expectNoConsoleErrors(errors);
});

test('the Quiet, the return and the Press beats fire only on their own triggers', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = watchErrors(page);
  await seedTown(page, E10);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  const emit = async (signal: RuntimeStorySignal): Promise<void> => {
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
  };
  // StoryRuntime.dismiss() opens a GAP_MS window before the next card (StoryRuntime.ts:124),
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

  await emit(EMBER_SHORE);
  expect(await drain()).toEqual([...ARRIVAL_IDS]);

  // No E10 contract carries a twist.baron, so boss-arrival never fires in this era
  // (src/game/Game.ts:5987-5991). The Quiet's acts ride the return chain instead.
  await emit({ type: 'boss-arrival', contractId: 'e10-last-claim', contractName: 'The Last Claim' });
  expect(e10Only(await drain())).toEqual([]);

  await emit({ type: 'run-return-town', result: 'secured' });
  const firstReturn = e10Only(await drain());
  expect(firstReturn).toContain('e10-chalk-manifest');
  expect(firstReturn).toContain('e10-what-you-hand-on');
  expect(firstReturn).toContain('e10-portrait-fades');
  expect(firstReturn).not.toContain('e10-unraveled-board');

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(e10Only(await drain())).toEqual(['e10-unraveled-board']);

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(e10Only(await drain())).toEqual(['e10-tavern-starlight-pan']);

  // The three preserves wait for the finale card, not for another return.
  await emit({ ...EMBER_SHORE, contractId: 'e10-last-claim', contractName: 'The Last Claim', ledgerBlurb: 'Ten lineage decks run stern to bow and end at three small preserves.' });
  expect(await drain()).toEqual(['e10-last-claim-decks']);
  await emit({ type: 'run-return-town', result: 'secured' });
  expect(e10Only(await drain())).toEqual(['e10-three-preserves']);

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(e10Only(await drain())).toEqual(['e10-gazette-mote-in-the-jar']);

  await emit({ type: 'run-return-town', result: 'secured' });
  expect(e10Only(await drain())).toEqual(['e10-watch-wound']);

  await emit({ type: 'science-complete' });
  expect(e10Only(await drain())).toEqual(['e10-charter-press']);

  expectNoConsoleErrors(errors);
});

test('the other two Deep Sky worlds speak only when their own card unlocks', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await seedTown(page, E10);
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__GR_STORY__));

  // __GR_STORY__.pending() reports the QUEUE only and excludes the card already on screen,
  // so a map beat is proved by draining it, not by reading pending().
  const drainAfter = async (signal: RuntimeStorySignal): Promise<string[]> => {
    await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
    const seen: string[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
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

  expect(await drainAfter({ ...EMBER_SHORE, contractId: 'e10-archive-world', contractName: 'The Archive World', ledgerBlurb: 'Two ruined stack wings lead from the archive entry to a deep warning shelf.' }))
    .toEqual(['e10-archive-world-shelf']);
  expect(await drainAfter({ ...EMBER_SHORE, contractId: 'e10-river', contractName: 'The River', ledgerBlurb: 'At dawn, with no enemies and no waves, the first river waits for one pan.' }))
    .toEqual(['e10-river-charter']);
  expectNoConsoleErrors(errors);
});
