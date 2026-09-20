import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * s1449 — the drill-yard station art must reach the PLAYER, in a plain boot (Mistake #10).
 *
 * The wiring merged at `646e2d31` and then sat DORMANT for two fires because the processed
 * PNGs did not exist: `DrillYard.applyStationArt` looks the filename up in an eager
 * `import.meta.glob` and returns silently on a miss, so a missing or renamed file costs
 * nothing at build time, nothing at runtime, and shows the player procedural placeholder
 * geometry forever (F-1437-3).
 *
 * This spec is the guard against that whole class. It is deliberately written so it FAILS
 * when the processed files are absent — verified by moving them out and re-running, not
 * assumed (a passing assertion never executes its own violation path).
 *
 * No `?debug`: the player's route is the one under test.
 */

const ARTIFACT_DIR = path.resolve('artifacts/drill-yard-props');

const STATION_ART = [
  'prop-drill-bell-post.png',
  'prop-drill-faucet-station.png',
  'prop-straw-man-stand.png',
] as const;

/**
 * Seed an existing player, exactly as `drill-yard.spec.ts` does. This is a RETURNING player
 * reaching the yard by the ordinary route — not a debug shortcut, and not a first-run wizard.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ keys }) => {
      if (sessionStorage.getItem('__drill_yard_art_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__drill_yard_art_seeded', '1');
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.welcome, '1');
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 2, science: 0, hero: 1, agent: 0 } }));
      localStorage.setItem(keys.scores, '[]');
      localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken: [], proposalSalt: 0 }));
    },
    {
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        welcome: profileDataKey('robin', TOWN_WELCOME_SEEN_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
        research: profileDataKey('robin', RESEARCH_STATE_KEY),
      },
    },
  );
});

/** Walk to the tavern and open the board — the player's own route, no debug shortcut. */
async function openBoard(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

/**
 * Clear the briefing FIRST. In a plain boot (no `&nopause`) the briefing holds the sim, so
 * waiting on yard diagnostics before dismissing it waits forever — and it would also cover
 * the stations in the screenshot.
 */
async function waitForYard(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.drillYard?.targets.length === 5, undefined, { timeout: 20_000 });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const file = path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path: file });
  await testInfo.attach(name, { path: file, contentType: 'image/png' });
}

test('a plain boot shows the engraved drill-yard stations, not the procedural placeholders', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);

  await page.goto('/');
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);

  await page.getByTestId('start-menu-enter-town').click();
  await openBoard(page);
  await page.getByTestId('contract-launch-e1-drill-yard').click();
  await expect.poll(() => new URL(page.url()).searchParams.get('contract')).toBe('e1-drill-yard');
  await expect(page.getByTestId('drill-yard-exit')).toBeVisible({ timeout: 15_000 });
  await waitForYard(page);

  // The textures load asynchronously (TextureLoader callback), so poll rather than sample once.
  await expect
    .poll(
      () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.drillYard?.stationArt ?? []),
      { timeout: 15_000, message: 'all three station sprites should replace their procedural stand-ins' },
    )
    .toEqual([...STATION_ART]);

  // `stationArt` is filled inside the TextureLoader callback, immediately AFTER the sprite is
  // built and the procedural children are hidden — so the list above is already proof the
  // sprites exist in the scene. `__GR_TEST__.renderCensus()` would say it more directly, but
  // it is gated behind `?debug` (src/game/Game.ts:1727) and this is deliberately a plain boot.
  await shot(page, testInfo, 'drill-yard-stations');
  expectNoConsoleErrors(watch);
});
