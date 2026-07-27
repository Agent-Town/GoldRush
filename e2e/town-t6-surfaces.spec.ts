import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, RUN_SUSPEND_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/town-t6');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TownPrompt = 'tavern' | 'schoolhouse' | 'assay_office';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
  }, { profileKey: PROFILE_KEY, townKey: profileDataKey('robin', TOWN_NAME_KEY) });
}

async function seedStaleSuspend(page: Page): Promise<void> {
  await page.addInitScript(
    ({ suspendKey, suspend }) => {
      localStorage.setItem(suspendKey, JSON.stringify(suspend));
    },
    { suspendKey: profileDataKey('robin', RUN_SUSPEND_KEY), suspend: suspendFixture() },
  );
}

async function openTown(page: Page, query = ''): Promise<void> {
  await page.goto('/');
  if (query) await page.evaluate((search) => history.replaceState(null, '', `/${search}`), query);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function walkTo(page: Page, target: { x: number; z: number }, prompt: TownPrompt): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === prompt) return;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.6) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.6) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe(prompt);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function suspendFixture(): unknown {
  return {
    v: 1,
    wave: 3,
    timeAlive: 90,
    contractId: 'the-claim',
    economy: {},
    hero: {},
    buildings: [],
    waveSystem: {},
    enemies: { active: [] },
    meta: {},
    research: {},
  };
}

test('plain menu thins to town, profile, settings', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('start-menu-new-claim')).toHaveCount(0);
  await expect(page.getByTestId('start-menu-research')).toHaveCount(0);
  await expect(page.locator('.gr-start-menu__nav [data-menu-action]')).toHaveText(['Enter Town', 'Claim Ledger', 'Profile', 'Settings']);
  await shot(page, testInfo, 'menu-thinned');
  assertNoErrors(errors);
});

test('Schoolhouse opens the existing Research chart and returns to the square', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await openTown(page);

  await walkTo(page, { x: -8.2, z: 5.4 }, 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
  await expect(page.getByTestId('research-chart')).toBeVisible();
  await expect(page.getByTestId('research-chart-node-assay_grading')).toBeVisible();
  await shot(page, testInfo, 'schoolhouse-research');
  await page.getByTestId('schoolhouse-close').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.schoolhouseOpen)).toBe(false);
  assertNoErrors(errors);
});

test('Assay porch opens the existing crafting order status panel', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await openTown(page, '?debug');

  await walkTo(page, { x: 6.6, z: 7.2 }, 'assay_office');
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect(page.getByTestId('assay-pending-card')).toBeVisible();
  await expect(page.getByTestId('assay-queue-pending')).toBeVisible();
  await shot(page, testInfo, 'assay-status');
  await page.getByTestId('assay-close').click();
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  assertNoErrors(errors);
});

test('run launch remains reachable through the tavern board', async ({ page }) => {
  await seedProfile(page);
  await seedStaleSuspend(page);
  const errors = collectErrors(page);
  await openTown(page);

  await walkTo(page, { x: -6, z: -9 }, 'tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Abandon wave 3 · The Claim');
    await dialog.accept();
  });
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', RUN_SUSPEND_KEY))).resolves.toBeNull();
  assertNoErrors(errors);
});

test('town surfaces stay readable at 390px', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await shot(page, testInfo, '390-menu');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await walkTo(page, { x: -8.2, z: 5.4 }, 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('research-chart')).toBeVisible();
  await shot(page, testInfo, '390-schoolhouse-research');
  await page.getByTestId('schoolhouse-close').click();
  await walkTo(page, { x: 6.6, z: 7.2 }, 'assay_office');
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('complaint-desk')).toBeVisible();
  await shot(page, testInfo, '390-assay-status');
  assertNoErrors(errors);
});
