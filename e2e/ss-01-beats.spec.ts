import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';

const ARTIFACT_DIR = path.resolve('artifacts/ss-01');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SeedOptions = {
  townName?: string;
  talesEnabled?: boolean;
  agentLevel?: number;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, options: SeedOptions = {}): Promise<void> {
  await page.goto('/?debug&seed=ss-01-seed');
  await page.evaluate(
    ({ profileKey, townKey, talesKey, metaKey, seed }) => {
      localStorage.clear();
      sessionStorage.clear();
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
      if (seed.townName) localStorage.setItem(townKey, seed.townName);
      localStorage.setItem(talesKey, seed.talesEnabled === false ? '0' : '1');
      localStorage.setItem(
        metaKey,
        JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: seed.agentLevel ?? 0 } }),
      );
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      talesKey: profileDataKey('robin', STORY_TALES_STORAGE_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      seed: options,
    },
  );
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.waitForTimeout(240);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function openTownBoard(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function expectBeat(page: Page, id: string, speaker: string, portraitNeedle: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).toHaveClass(/story-beat-card--visible/);
  await expect(card).toHaveAttribute('data-beat-id', id);
  await expect(card).toHaveAttribute('data-speaker', speaker);
  await expect(page.getByTestId('story-beat-portrait')).toHaveAttribute('src', new RegExp(portraitNeedle));
}

async function dismissBeat(page: Page): Promise<void> {
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('founding, first contract, and Prospector XP beats fire once with portraits', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page, { agentLevel: 1 });
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('town-name-input').fill('Aurora Bend');
  await page.getByTestId('town-name-submit').click();
  await expectBeat(page, 'founding-welcome', 'elder', 'townsfolk-elder');
  await shot(page, testInfo, 'founding-beat');
  await dismissBeat(page);

  await openTownBoard(page);
  await expectBeat(page, 'first-contract', 'tavernkeeper', 'townsfolk-tavernkeeper');
  await expect(page.getByTestId('contract-launch-the-claim')).toHaveAttribute('data-story-pointer', 'true');
  await shot(page, testInfo, 'first-contract-beat');
  await dismissBeat(page);
  await expect(page.getByTestId('contract-launch-the-claim')).not.toHaveAttribute('data-story-pointer', 'true');
  await page.evaluate(() => history.replaceState(null, '', '/?debug&timescale=8&nowaves&nolevel&seed=ss-01-deputy'));
  await page.getByTestId('contract-launch-the-claim').click();

  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const collectedXp = await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('agent.xpMoteAgeS', -1);
    const pos = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
    window.__GR_TEST__?.spawnXpMote(pos.x, pos.z, 4);
    const receipt = window.__GR_AGENT__?.collectXp();
    return receipt?.outcome.ok === true ? (receipt.outcome.result as { xp?: number } | undefined)?.xp ?? 0 : 0;
  });
  expect(collectedXp).toBeGreaterThan(0);
  await expectBeat(page, 'deputy-hello', 'prospector', 'char-prospector-portrait');
  await shot(page, testInfo, 'deputy-beat');
  await dismissBeat(page);

  await page.reload();
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_STORY__?.emit({ type: 'town-named', townName: 'Aurora Bend' });
    window.__GR_STORY__?.emit({ type: 'board-first-open' });
    window.__GR_STORY__?.emit({ type: 'xp-collected' });
  });
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  assertNoErrors(errors);
});

test('Tales setting silences story beats at queue level', async ({ page }) => {
  await seedProfile(page, { talesEnabled: false });
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-tales')).not.toBeChecked();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('town-name-input').fill('Silent Bend');
  await page.getByTestId('town-name-submit').click();
  await page.waitForTimeout(700);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'xp-collected' }));
  await page.waitForTimeout(700);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  assertNoErrors(errors);
});

test('pointer glow clears on first interaction', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page, { townName: 'Pointer Bend', agentLevel: 1 });
  const errors = collectErrors(page);

  await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=ss-01-pointer');
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'xp-collected' }));
  await expectBeat(page, 'deputy-hello', 'prospector', 'char-prospector-portrait');
  const chip = page.getByTestId('hud-agent');
  await expect(chip).toHaveAttribute('data-story-pointer', 'true');
  await shot(page, testInfo, 'pointer-glow');
  await chip.click();
  await expect(chip).not.toHaveAttribute('data-story-pointer', 'true');
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
  assertNoErrors(errors);
});

test('story card waits until wave banner clears when both fire same tick', async ({ page }, testInfo) => {
  await seedProfile(page, { townName: 'Banner Bend' });
  const errors = collectErrors(page);

  await page.goto('/?debug&timescale=4&nolevel&seed=ss-01-banner');
  await page.waitForFunction(() => window.__GR_STORY__ && window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.startWaveForTest(1);
    window.__GR_STORY__?.emit({ type: 'building-lost' });
  });
  await expect.poll(() => page.evaluate(() => document.querySelector('#hud')?.classList.contains('hud--announcement-visible'))).toBe(true);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.querySelector('#hud')?.classList.contains('hud--announcement-visible')), { timeout: 8_000 })
    .toBe(false);
  await expectBeat(page, 'first-loss', 'clerk', 'townsfolk-assay-clerk');
  await shot(page, testInfo, 'banner-sequenced');
  assertNoErrors(errors);
});
