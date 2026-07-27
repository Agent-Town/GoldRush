import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import type { HeraldItem } from '../src/news/herald';
import type * as WorldDispatches from '../src/town/worldDispatches';

const PROFILE_ID = 'robin';
const STEAMWORKS = 'epoch-2-steamworks';
const HEADLINE = 'The river keeps its old course.';
const M2_1 = "GAZETTE, first pressing! Rail came in, press came with it — the Baron's rail brought the town its voice, and don't think Ma won't print exactly that!";

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function seedTown(page: Page, hintsSeen: string[] = [], e2Score = false): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, firstClaimKey, scoreKey, hints, score, headline }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: hints }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(firstClaimKey, '1');
      if (score) {
        localStorage.setItem(scoreKey, JSON.stringify([{ waves: 12, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e2-hill-mine' }]));
      }
      window.__GR_HERALD_FEED__ = [{ headline, lines: [headline], date: '2026-07-18', hash: 'wd02' }] satisfies HeraldItem[];
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
      firstClaimKey: profileDataKey(PROFILE_ID, FIRST_CLAIM_DONE_KEY),
      scoreKey: profileDataKey(PROFILE_ID, SCOREBOARD_KEY),
      hints: hintsSeen,
      score: e2Score,
      headline: HEADLINE,
    },
  );
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function approachNewsie(page: Page): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId)) === 'newsie') break;
    const positions = await page.evaluate(() => {
      const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
      return { player: diagnostics.player, target: diagnostics.actors.find(({ id }) => id === 'newsie')?.position };
    });
    if (!positions.target) throw new Error('newsie is absent from town actor diagnostics');
    const keys: string[] = [];
    if (Math.abs(positions.target.x - positions.player.x) > 0.6) keys.push(positions.target.x > positions.player.x ? 'KeyD' : 'KeyA');
    if (Math.abs(positions.target.z - positions.player.z) > 0.6) keys.push(positions.target.z > positions.player.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null), { timeout: 8_000 }).toBe('newsie');
}

test('canonical table parses all 60 lines and keeps the Fevered lexicon', async ({ page }) => {
  await page.goto('/');
  const dispatches = await page.evaluate(async () => {
    const module = (await Function('return import("/src/town/worldDispatches.ts")')()) as typeof WorldDispatches;
    return module.MEI_WORLD_DISPATCHES;
  });
  expect(dispatches).toHaveLength(60);
  expect(new Set(dispatches.map((dispatch) => dispatch.id)).size).toBe(60);
  expect(dispatches.map((dispatch) => dispatch.id)).toEqual(
    Array.from({ length: 10 }, (_, era) => Array.from({ length: 6 }, (_, index) => `M${era + 1}-${index + 1}`)).flat(),
  );
  expect(dispatches.find(({ id }) => id === 'M3-5')?.trigger).toEqual({ kind: 'boss', id: 'e3-canyon-works' });
  expect(dispatches.find(({ id }) => id === 'M4-5')?.trigger).toEqual({ kind: 'boss', id: 'e4-dust-flats' });
  expect(dispatches.find(({ id }) => id === 'M5-5')?.trigger).toEqual({ kind: 'boss', id: 'e5-deepwater-claim' });
  expect(dispatches.find(({ id }) => id === 'M6-4')?.trigger).toEqual({ kind: 'boss', id: 'e6-glow-mesa' });
  for (const dispatch of dispatches) expect(dispatch.line).not.toMatch(/\b(?:killed|slain|cured)\b/i);
});

test('a debug-driven era milestone reaches Mei once and retires older missed lines', async ({ page }) => {
  const errors = collectErrors(page);
  await seedTown(page);
  await openTown(page);
  await page.evaluate((epoch) => history.replaceState(null, '', `/?debug&epoch=${epoch}`), STEAMWORKS);
  await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'first-victory' }));
  await expect(page.getByTestId('story-beat-card')).toBeVisible();
  await approachNewsie(page);
  await expect.poll(() => page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem('gr.profile.v2') ?? 'null') as ProfileState;
    return profile.profiles[0]!.hintsSeen.some((hint) => hint.startsWith('wd02:'));
  })).toBe(false);
  await page.mouse.click(10, 10);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(600);
  await page.keyboard.up('KeyD');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null)).not.toBe('newsie');
  await approachNewsie(page);
  await expect(page.getByTestId('town-bark-text')).toHaveText(M2_1);

  const proof = await page.evaluate(async () => {
    const module = (await Function('return import("/src/town/worldDispatches.ts")')()) as typeof WorldDispatches;
    const profile = JSON.parse(localStorage.getItem('gr.profile.v2') ?? 'null') as ProfileState;
    return {
      next: module.takeMeiWorldDispatch(),
      seen: profile.profiles[0]!.hintsSeen.filter((hint) => hint.startsWith('wd02:')),
    };
  });
  expect(proof.next).toBeUndefined();
  expect(proof.seen.filter((hint) => hint === 'wd02:M2-1')).toHaveLength(1);
  expect(proof.seen).toHaveLength(7);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('future-era progress stays silent and a plain boot keeps Mei on the Herald', async ({ page }) => {
  const errors = collectErrors(page);
  const e1Seen = Array.from({ length: 6 }, (_, index) => `wd02:M1-${index + 1}`);
  await seedTown(page, e1Seen, true);
  await openTown(page);
  await approachNewsie(page);
  await expect(page.getByTestId('town-bark-text')).toHaveText(`EXTRA! ${HEADLINE}`);
  const wdSeen = await page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem('gr.profile.v2') ?? 'null') as ProfileState;
    return profile.profiles[0]!.hintsSeen.filter((hint) => hint.startsWith('wd02:'));
  });
  expect(wdSeen).toEqual(e1Seen);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
