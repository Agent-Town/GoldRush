import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import type { ScoreRecord } from '../src/game/Scoreboard';
import { isCleanHeraldLine } from '../src/news/herald';
import { editionLadder, HERALD_LAST_READ_KEY } from '../src/news/editionLadder';

// THE LIVING PAPER — GZ-L1 (specs/gazette-house/living-paper.md; owner directive 2026-08-04:
// "right now the newspaper never changes. Even after I beat the Baron, same newspaper.").
// PLAIN BOOT ONLY — no `?debug` anywhere in this file (the Debug-Gate Leftover grave). Every
// assertion here is a thing a player sees by walking into town and clicking the badge.
const SHOT_DIR = path.resolve('reviews/shots-gazette-living');
const HERO = 'Wren';
const TOWN = 'Quartz Hill';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

function securedRun(contractId: string, at: number): ScoreRecord {
  return { waves: 20, kills: 40, gold: 900, timeAlive: 600, at, secured: true, secureWave: 20, contractId, profileName: HERO };
}

/**
 * Seeds a profile at a ladder stage. Both the profile-scoped AND the flat key are written for
 * every datum: the storage shim scopes one and the start-menu activation path leaves the other
 * behind (the F-BT-4 duality, documented at e2e/beauty-atmos.rig.ts:79).
 */
async function seedProfile(page: Page, scores: readonly ScoreRecord[]): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, guideKey, scoresKey, flatTownKey, flatMetaKey, flatGuideKey, flatScoresKey, hero, town, records }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{
          id: 'robin',
          name: hero,
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: [],
          // The badge only shows for a profile that came through the name card; every seeded
          // stage here is a player who has already been welcomed.
          trailGuide: true,
        }],
      };
      const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
      const scoreboard = JSON.stringify(records);
      localStorage.setItem(profileKey, JSON.stringify(state));
      for (const [key, value] of [
        [townKey, town],
        [flatTownKey, town],
        [metaKey, meta],
        [flatMetaKey, meta],
        [guideKey, '1'],
        [flatGuideKey, '1'],
        [scoresKey, scoreboard],
        [flatScoresKey, scoreboard],
      ] as const) {
        localStorage.setItem(key, value);
      }
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      scoresKey: profileDataKey('robin', SCOREBOARD_KEY),
      flatTownKey: TOWN_NAME_KEY,
      flatMetaKey: META_PROGRESS_KEY,
      flatGuideKey: FIRST_CLAIM_DONE_KEY,
      flatScoresKey: SCOREBOARD_KEY,
      hero: HERO,
      town: TOWN,
      records: [...scores],
    },
  );
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function openHerald(page: Page): Promise<void> {
  await openTown(page);
  await page.getByTestId('town-herald-badge').click();
  await expect(page.getByTestId('claim-herald')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('the welcomed profile opens THE ARRIVAL with the greenhorn panels intact', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedProfile(page, []);
  await openHerald(page);

  const edition = page.getByTestId('claim-herald-edition');
  await expect(edition).toHaveAttribute('data-edition-kind', 'arrival');
  await expect(edition).toHaveAttribute('data-edition-number', '1');
  await expect(page.getByTestId('claim-herald-edition-headline')).toHaveText('NEW HANDS, WELCOME');
  // Law 2: a paper that doesn't name its hero is the old static paper with extra steps.
  await expect(page.getByTestId('claim-herald-lead')).toContainText(HERO);
  await expect(page.getByTestId('claim-herald-lead')).toContainText(TOWN);
  // Law 3: Issue No. 1 keeps its tutorial duty, unchanged.
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await expect(page.getByTestId('gazette-panel')).toHaveCount(7);
  // Law 7: the static feed is filler beneath the lead, never the headline again.
  await expect(page.getByTestId('claim-herald-items')).toBeVisible();
  // One edition means no archive strip to show yet.
  await expect(page.getByTestId('claim-herald-archive')).toHaveCount(0);

  await shot(page, testInfo, 'edition-1-arrival');
  expectNoErrors(errors);
});

test('securing contracts changes the paper: the lead is the newest claim, the archive keeps the rest', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedProfile(page, [
    securedRun('the-claim', 1_000),
    // Training never prints, no matter how well it went.
    securedRun('e1-drill-yard', 1_500),
    securedRun('e1-night-shift', 2_000),
  ]);
  await openHerald(page);

  // Two secured claims that print => the ladder is arrival + 2, and the CURRENT edition opens.
  const edition = page.getByTestId('claim-herald-edition');
  await expect(edition).toHaveAttribute('data-edition-number', '3');
  await expect(edition).toHaveAttribute('data-edition-kind', 'claim');
  await expect(edition).toHaveAttribute('data-contract-id', 'e1-night-shift');
  await expect(page.getByTestId('claim-herald-edition-headline')).toHaveText('THE CLAIM KEEPS ITS LIGHT');
  await expect(page.getByTestId('claim-herald-deed')).toContainText(HERO);
  await expect(page.getByTestId('claim-herald-deed')).toContainText('Night Shift');
  // The guide panels belong to Issue No. 1 and stay there.
  await expect(page.getByTestId('gazette-first-issue')).toHaveCount(0);
  await shot(page, testInfo, 'edition-3-mid-ladder');

  const backIssues = page.getByTestId('claim-herald-back-issue');
  await expect(backIssues).toHaveCount(3);
  await expect(backIssues.nth(2)).toHaveAttribute('data-showing', 'true');
  // The drill yard is nowhere in the ladder.
  await expect(page.getByTestId('claim-herald-archive')).not.toContainText('Drill');

  // Edition 2 is the player's FIRST secured claim and says so.
  await backIssues.nth(1).click();
  await expect(page.getByTestId('claim-herald-edition')).toHaveAttribute('data-contract-id', 'the-claim');
  await expect(page.getByTestId('claim-herald-edition-headline')).toHaveText('THE FIRST CLAIM HOLDS');
  await expect(page.getByTestId('claim-herald-lead')).toContainText('a new hand no longer');

  // Editions never retire: Issue No. 1 is still one click away, panels and all.
  await backIssues.nth(0).click();
  await expect(page.getByTestId('claim-herald-edition-headline')).toHaveText('NEW HANDS, WELCOME');
  await expect(page.getByTestId('gazette-panel')).toHaveCount(7);
  expectNoErrors(errors);
});

test('beating the Baron prints the finale and the badge counts the new edition', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedProfile(page, [
    securedRun('the-claim', 1_000),
    securedRun('e1-dry-gulch', 2_000),
    securedRun('e1-twin-banks', 3_000),
    securedRun('e1-baron', 4_000),
  ]);
  await openTown(page);

  // The town surface carries the unread badge for an edition the player has never opened.
  const badge = page.getByTestId('town-herald-badge');
  await expect(badge).toHaveAttribute('data-unread', 'true');
  await expect(badge).toHaveAttribute('data-edition-number', '5');
  await expect(badge).toContainText('Issue No. 5');
  await shot(page, testInfo, 'town-badge-edition-5');

  await badge.click();
  await expect(page.getByTestId('claim-herald')).toBeVisible();
  const edition = page.getByTestId('claim-herald-edition');
  await expect(edition).toHaveAttribute('data-edition-kind', 'baron');
  await expect(edition).toHaveAttribute('data-edition-number', '5');
  await expect(page.getByTestId('claim-herald-edition-headline')).toHaveText('THE BARON IS TURNED BACK');
  const lead = page.getByTestId('claim-herald-lead');
  // Canon, verbatim (lore/characters.md:23) — and the cure-arms lexicon holds.
  await expect(lead).toContainText('Dragged off by his own men, swearing revenge.');
  await expect(lead).toContainText('freed');
  await expect(page.getByTestId('claim-herald-edition')).not.toContainText(/killed|slain/i);
  // Ratification question 2, default YES: the E2 tease, verbatim from lore/world-dispatches.md:35.
  await expect(page.getByTestId('claim-herald-deed')).toContainText('acquires a taste for steam');
  await expect(page.getByTestId('claim-herald-back-issue')).toHaveCount(5);
  await shot(page, testInfo, 'edition-5-baron');

  // Reading is a player action, and the only thing this slice ever writes.
  await page.getByTestId('claim-herald-close').click();
  await expect(badge).toHaveAttribute('data-unread', 'false');
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', HERALD_LAST_READ_KEY))).toBe('5');
  expectNoErrors(errors);
});

test('the paper is a function of the profile: same facts, identical reader DOM', async ({ page }) => {
  const errors = collectErrors(page);
  const scores = [securedRun('the-claim', 1_000), securedRun('e1-dry-gulch', 2_000)];
  await seedProfile(page, scores);
  await openHerald(page);
  const first = await page.getByTestId('claim-herald').innerHTML();

  // A second boot of the same profile — no timers, no clocks, no boot-time writes in between.
  await seedProfile(page, scores);
  await openHerald(page);
  const second = await page.getByTestId('claim-herald').innerHTML();

  expect(second).toBe(first);
  expectNoErrors(errors);
});

test('the Herald never opens itself and never writes on boot', async ({ page }) => {
  const errors = collectErrors(page);
  await seedProfile(page, [securedRun('the-claim', 1_000)]);
  await openTown(page);

  // The Runaway Generator grave: nothing writes without a player action.
  await expect(page.getByTestId('claim-herald')).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', HERALD_LAST_READ_KEY))).toBeNull();
  expectNoErrors(errors);
});

// ---------------------------------------------------------------------------
// Pure guards — no page, no server. The ladder is a pure function of profile facts.
// ---------------------------------------------------------------------------

test('every printed line passes the in-world filter', () => {
  const ladder = editionLadder({
    heroName: HERO,
    townName: TOWN,
    securedContractIds: ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'unlisted-claim'],
    baronBeaten: true,
  });
  for (const edition of ladder) {
    for (const line of [edition.eyebrow, edition.headline, edition.standfirst, ...edition.lead, ...(edition.deed ? [edition.deed] : [])]) {
      expect(isCleanHeraldLine(line), `factory jargon reached print: ${line}`).toBe(true);
      // The Clock Law: no year printed, no arithmetic performable on a face.
      expect(line, `a printed line carries a year: ${line}`).not.toMatch(/\b(1[6-9]|20)\d{2}\b/);
      // lore/characters.md:4 — the player is the hero; "prospector" is the brass agent's word.
      expect(line.toLowerCase(), `the paper called the hero a prospector: ${line}`).not.toContain('prospector');
    }
  }
});

test('the ladder covers every E1 contract that can print', async () => {
  const raw = await readFile(path.resolve('assets/contracts/epoch-1-frontier/contracts.json'), 'utf8');
  const shipped: string[] = (JSON.parse(raw).contracts as { id: string }[]).map((contract) => contract.id);
  const printable = shipped.filter((id) => id !== 'e1-drill-yard' && id !== 'e1-baron');
  const ladder = editionLadder({ heroName: HERO, townName: TOWN, securedContractIds: printable, baronBeaten: true });

  // Every printable contract gets an edition, and none of them fell through to the generic
  // fallback headline — a renamed or added E1 contract fails HERE, not in front of a player.
  expect(ladder.map((edition) => edition.contractId ?? edition.kind)).toEqual(['arrival', ...printable, 'baron']);
  for (const edition of ladder.slice(2, -1)) {
    expect(edition.headline, `${edition.contractId} has no authored headline`).not.toMatch(/ IS HELD$/);
  }
});

test('the drill yard and the Baron never print as ordinary claims', () => {
  const ladder = editionLadder({
    heroName: HERO,
    townName: TOWN,
    securedContractIds: ['the-claim'],
    baronBeaten: false,
  });
  expect(ladder).toHaveLength(2);
  expect(ladder.some((edition) => edition.contractId === 'e1-drill-yard')).toBe(false);
  expect(ladder.some((edition) => edition.kind === 'baron')).toBe(false);
});

test('an unnamed town still prints a whole paper', () => {
  const [arrival] = editionLadder({ heroName: '', townName: null, securedContractIds: [], baronBeaten: false });
  expect(arrival.headline).toBe('NEW HANDS, WELCOME');
  expect(arrival.lead.join(' ')).toContain('this valley');
  expect(arrival.lead.join(' ')).toContain('the new hand');
});
