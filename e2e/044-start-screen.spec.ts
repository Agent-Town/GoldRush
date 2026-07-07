import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';
import { AUDIO_VOLUME_STORAGE_KEY } from '../src/systems/AudioSystem';
import { Balance } from '../src/game/Balance';

const SHOT_DIR = 'artifacts/044';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      profileKey,
      JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
  }, PROFILE_KEY);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('plain boot shows the Storybook start menu without Continue', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('start-menu-emblem')).toHaveAttribute('data-asset-slot', 'ui-title-emblem');
  await expect(page.getByTestId('start-menu-emblem')).toHaveAttribute('data-asset-state', 'ready');
  await expect(page.getByTestId('start-menu-wordmark')).toHaveText('GOLD RUSH');
  await expect(page.getByText('an Agent Town tale')).toBeVisible();
  await expect(page.getByTestId('start-menu-continue')).toHaveCount(0);
  await expect(page.getByTestId('start-menu-new-claim')).toBeFocused();
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();

  await shot(page, testInfo, 'menu');
  await page.getByTestId('start-menu-emblem').screenshot({
    path: `${SHOT_DIR}/${testInfo.project.name}-emblem.png`,
  });
  assertNoErrors(errors);
});

test('debug boot skips the start menu and enters the game', async ({ page }) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=044-debug');

  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  assertNoErrors(errors);
});

test('New Claim starts the existing run flow and disposes the menu', async ({ page }) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await page.getByTestId('start-menu-new-claim').click();
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  assertNoErrors(errors);
});

test('Profile opens the existing selector with arrow and Enter', async ({ page }) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('start-menu-enter-town')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('start-menu-profile')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('profile-title')).toBeVisible();
  assertNoErrors(errors);
});

test('Research is readable between runs and Settings volume writes through', async ({ page }) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await page.getByTestId('start-menu-research').click();
  await expect(page.getByTestId('research-overlay')).toBeVisible();
  await expect(page.getByTestId('science-meter')).toContainText('Science: 0 steps');
  await expect(page.locator('[data-research-id]')).toHaveCount(0);

  await page.getByTestId('start-menu-settings').click();
  await page.getByTestId('start-menu-volume').evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = '35';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.getByTestId('start-menu-volume-value')).toHaveText('35%');
  await expect(page.evaluate((key) => localStorage.getItem(key), AUDIO_VOLUME_STORAGE_KEY)).resolves.toBe('0.35');
  assertNoErrors(errors);
});

test('Continue appears only for an existing suspend slot and enters the run path', async ({ page }) => {
  await page.addInitScript(({ key, value }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: RUN_SUSPEND_KEY, value: suspendFixture(4) });
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('start-menu-continue')).toBeVisible();
  await expect(page.getByTestId('start-menu-saved-claim')).toContainText('wave 4');
  await page.getByTestId('start-menu-continue').click();
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  assertNoErrors(errors);
});

function suspendFixture(wave: number): unknown {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    v: 1,
    wave,
    timeAlive: wave * Balance.waves.waveInterval,
    writtenAt: Date.now(),
    lastWriteMs: 0,
    sizeBytes: 1,
    trigger: 'wave-boundary',
    copy: `The claim resumes at wave ${wave}. The ledger kept your place; trail work after that boundary is replayed.`,
    contractId: 'the-claim',
    seed: '044',
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave,
      pulse: 0,
      edge: null,
      budget: 0,
      waveSpawnedTotal: 0,
      nextTrickleAt: Balance.waves.graceSeconds + Balance.waves.trickleInterval,
      nextWaveAt: (wave + 1) * Balance.waves.waveInterval,
      nextPlanWaveAt: (wave + 1) * Balance.waves.waveInterval,
      nextPlanWave: wave + 1,
      plannedPulses: [],
      copyCursor: 0,
      lastCopy: '',
      currentAtSim: wave * Balance.waves.waveInterval,
      waveState: 'quiet',
      lastPulseAt: Number.NEGATIVE_INFINITY,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: {
      gold: 0,
      bankCap: Balance.economy.bankCap,
      log: [],
      summary: {
        panned: 0,
        sluiced: 0,
        granted: 0,
        stolen: 0,
        reclaimed: 0,
        pannedByProspector: 0,
        sluicedByProspector: 0,
        reclaimedByProspector: 0,
        spent: 0,
        baseValue: 0,
        buildingsBuilt: 0,
        beaconsBuilt: 0,
        repairSpent: 0,
        repairs: 0,
      },
    },
    hero: {
      level: 1,
      xpTotal: 0,
      spentXp: 0,
      xpInto: 0,
      pendingLevels: 0,
      offer: null,
      stacks: {},
      hp: Balance.hero.maxHp,
      maxHp: Balance.hero.maxHp,
      position: { x: 0, y: 0.06, z: 12 },
      velocity: { x: 0, y: 0, z: 0 },
    },
    buildings: [],
    counters: {
      kills: 0,
      stolenTotal: 0,
      reclaimedTotal: 0,
      buildingHitsResolved: 0,
      buildingsWrecked: 0,
      weapon: 'rig',
      weaponToggleCount: 0,
      blastTime: 0,
    },
    meta,
    research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null },
  };
}
