import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import type { RuntimeStorySignal } from '../src/story/signals';

// F-SS05-1: `wave-complete`, `science-threshold`, `rung-promotion` and `first-boot` were declared
// signals with no emitter in `src/` outside the story module, so six shipped E1 beats had never
// fired for a player. EVERY BOOT HERE IS A PLAIN BOOT — no `?debug`, so nothing in this file can
// pass through the debug-gated `__GR_TEST__` harness (Mistake #10: a feature only reachable behind
// `?debug` is a feature the player does not have). The run is shortened the way `story-loop`'s own
// plain-boot test shortens it — by editing the live `Balance` module through Vite, which is the
// same table the game reads at run time, AFTER boot so `applyStoredDifficultyPreset()` cannot
// clobber it.
const SHOT_DIR = path.resolve('reviews/shots-story-signal-emitters');
const FIRST_BOOT_HINT = 'story:signal:first-boot';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

/**
 * Seeds a named profile WITHOUT clearing storage, so the seed survives a reload and the
 * once-per-profile first-boot marker can be observed across two boots of the same profile.
 * Playwright hands every test a fresh context, so there is nothing to clear.
 */
async function seedProfile(page: Page, options: { agentTrack?: number } = {}): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, talesKey, metaKey, agentTrack }) => {
      if (localStorage.getItem(profileKey)) return;
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [
          {
            id: 'robin',
            name: 'Robin',
            createdAt: 1,
            updatedAt: 1,
            difficultyPreset: 'trail',
            hintsSeen: [],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Aurora Bend');
      localStorage.setItem(talesKey, '1');
      localStorage.setItem(
        metaKey,
        JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: agentTrack ?? 0 } }),
      );
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      talesKey: profileDataKey('robin', STORY_TALES_STORAGE_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      agentTrack: options.agentTrack ?? 0,
    },
  );
}

/**
 * Records every story signal the app publishes. Installed as an init script so the listener is
 * subscribed before `main.ts` reaches its `afterFirstFrame` story install — the only way to observe
 * `first-boot`, which fires once and has no beat to leave a card behind.
 */
async function recordSignals(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const scope = window as unknown as { __SS_SIGNALS__: unknown[]; __SS_BEATS__: string[] };
    scope.__SS_SIGNALS__ = [];
    // Every beat id the player was actually shown, in order. A card lives 6 s and the queue paces
    // itself, so polling `active()` can miss one; this cannot.
    scope.__SS_BEATS__ = [];
    new MutationObserver(() => {
      const id = document.querySelector('[data-testid="story-beat-card"]')?.getAttribute('data-beat-id');
      if (id && scope.__SS_BEATS__.at(-1) !== id) scope.__SS_BEATS__.push(id);
    }).observe(document.documentElement, { childList: true, subtree: true });
    const importViteModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    void importViteModule('/src/story/signals.ts')
      .then((module) => {
        (module as { onStorySignal: (listener: (signal: unknown) => void) => void }).onStorySignal((signal) => {
          scope.__SS_SIGNALS__.push(signal);
        });
      })
      .catch(() => undefined);
  });
}

async function signalsOfType(page: Page, type: RuntimeStorySignal['type']): Promise<RuntimeStorySignal[]> {
  return page.evaluate(
    (wanted) =>
      ((window as unknown as { __SS_SIGNALS__?: { type: string }[] }).__SS_SIGNALS__ ?? []).filter(
        (signal) => signal.type === wanted,
      ),
    type,
  ) as Promise<RuntimeStorySignal[]>;
}

async function profileHints(page: Page): Promise<string[]> {
  return page.evaluate((profileKey) => {
    const raw = localStorage.getItem(profileKey);
    if (!raw) return [];
    return (JSON.parse(raw) as ProfileState).profiles[0]?.hintsSeen ?? [];
  }, PROFILE_KEY);
}

/** Edits the live Balance table the run already reads. No `?debug`, no `__GR_TEST__`. */
async function shortenTheRide(page: Page, waveInterval: number): Promise<void> {
  await page.evaluate(async (interval) => {
    const importViteModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    const module = (await importViteModule('/src/game/Balance.ts')) as {
      Balance: {
        waves: { waveInterval: number; trickleInterval: number };
        enemy: { contactDamage: number };
      };
    };
    module.Balance.waves.waveInterval = interval;
    module.Balance.waves.trickleInterval = 9_999;
    module.Balance.enemy.contactDamage = 0;
  }, waveInterval);
}

async function bootTheClaim(page: Page, seed: string, waveInterval: number): Promise<void> {
  await page.goto(`/?contract=the-claim&seed=${seed}&nolevel&timescale=8`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 30_000 });
  await shortenTheRide(page, waveInterval);
}

/**
 * Waits until the named beat has been SHOWN to the player, letting any other queued card run its
 * own course first. The poll returns the whole runtime picture so a failure says which cards did
 * appear and which are still queued, instead of only naming the one on screen.
 */
async function waitForBeat(page: Page, id: string, timeoutMs = 60_000): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          active: window.__GR_STORY__?.active() ?? null,
          pending: window.__GR_STORY__?.pending() ?? [],
          shown: (window as unknown as { __SS_BEATS__?: string[] }).__SS_BEATS__ ?? [],
        })),
      { timeout: timeoutMs, intervals: [200] },
    )
    .toMatchObject({ shown: expect.arrayContaining([id]) });
}

/** True while the named beat is the card on screen. */
async function beatOnScreen(page: Page, id: string): Promise<boolean> {
  return page.evaluate((wanted) => window.__GR_STORY__?.active() === wanted, id);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.jpg`),
    type: 'jpeg',
    quality: 60,
  });
}

test('first-boot fires once per profile on a plain boot and never again', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await seedProfile(page);
  await recordSignals(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 5 || Boolean(document.querySelector('[data-testid="start-menu"]')));
  await expect.poll(() => signalsOfType(page, 'first-boot').then((list) => list.length), { timeout: 15_000 }).toBe(1);
  expect(await profileHints(page)).toContain(FIRST_BOOT_HINT);
  await shot(page, testInfo, 'first-boot');

  await page.reload();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 5 || Boolean(document.querySelector('[data-testid="start-menu"]')));
  await page.waitForTimeout(1_500);
  expect(await signalsOfType(page, 'first-boot')).toEqual([]);
  expect((await profileHints(page)).filter((hint) => hint === FIRST_BOOT_HINT)).toHaveLength(1);
  assertNoErrors(errors);
});

test('a plain-boot Claim ride emits wave-complete and shows the fifth-wave beat', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  await seedProfile(page);
  await recordSignals(page);
  const errors = collectErrors(page);

  await bootTheClaim(page, 'ss-emit-wave', 1.5);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 90_000, intervals: [250] })
    .toBeGreaterThanOrEqual(6);

  const waves = ((await signalsOfType(page, 'wave-complete')) as { type: 'wave-complete'; wave: number }[]).map(
    (signal) => signal.wave,
  );
  // Once per wave, in order, starting at 1 — a wave is complete when the counter leaves it, so
  // wave N-1 is announced as wave N begins and the live wave is never announced as finished.
  expect(waves.slice(0, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(new Set(waves).size).toBe(waves.length);
  expect(waves).toEqual([...waves].sort((left, right) => left - right));

  await waitForBeat(page, 'first-wave-five');
  expect(await beatOnScreen(page, 'first-wave-five')).toBe(true);
  await expect(page.getByTestId('story-beat-card')).toContainText('Fifth horn recorded.');
  await shot(page, testInfo, 'first-wave-five');
  assertNoErrors(errors);
});

test('securing a plain-boot Claim promotes the rung and a research pick crosses the science threshold', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await seedProfile(page);
  await recordSignals(page);
  const errors = collectErrors(page);

  await bootTheClaim(page, 'ss-emit-secure', 1.5);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 90_000 });

  const promotions = (await signalsOfType(page, 'rung-promotion')) as { type: 'rung-promotion'; level: number }[];
  expect(promotions.map((signal) => signal.level)).toEqual([1]);
  await waitForBeat(page, 'deputy-first-promotion');
  if (await beatOnScreen(page, 'deputy-first-promotion')) {
    await expect(page.getByTestId('story-beat-card')).toContainText('First rung logged.');
    await shot(page, testInfo, 'deputy-first-promotion');
  }

  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('death-overlay')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('research-card-0')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('research-card-0').click();

  const thresholds = (await signalsOfType(page, 'science-threshold')) as { type: 'science-threshold'; threshold: number }[];
  expect(thresholds.length).toBeGreaterThanOrEqual(1);
  expect(thresholds[0]!.threshold).toBeGreaterThanOrEqual(1);
  await waitForBeat(page, 'science-first-pick');
  if (await beatOnScreen(page, 'science-first-pick')) {
    await expect(page.getByTestId('story-beat-card')).toContainText('The first mark matters.');
  }
  await shot(page, testInfo, 'science-first-pick');
  assertNoErrors(errors);
});
