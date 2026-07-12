import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, EPOCH_CEREMONY_KEY } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { researchStateKey } from '../src/meta/ResearchTree';

const ARTIFACT_DIR = path.resolve('artifacts/e2-t2-dynamo-ceremony');
const STEAMWORKS = 'epoch-2-steamworks';
const VOLTAGE = 'epoch-3-voltage';

async function seed(page: Page, science: number): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, scienceSteps, steamworks, voltage }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.firstClaim, '1');
      localStorage.setItem(keys.activeEpoch, steamworks);
      localStorage.setItem(
        keys.meta,
        JSON.stringify({ version: 1, tracks: { territory: 3, science: 6 + scienceSteps, hero: 0, agent: 0 } }),
      );
      localStorage.setItem(
        keys.research,
        JSON.stringify({ version: 1, steps: scienceSteps, metaScienceCursor: 6 + scienceSteps, taken: [], proposalSalt: 0, pinnedTarget: null }),
      );
      localStorage.setItem(
        keys.megaproject,
        JSON.stringify({
          version: 1,
          projects: {
            'dynamo-hall': { stage: 3, funded: false, ticksRemaining: 0, hp: 210, delayTicks: 0, defenseWave: 0 },
          },
        }),
      );
      localStorage.removeItem(keys.ceremony);
      localStorage.removeItem(voltage);
    },
    {
      scienceSteps: science,
      steamworks: STEAMWORKS,
      voltage: VOLTAGE,
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
        activeEpoch: ACTIVE_EPOCH_KEY,
        ceremony: EPOCH_CEREMONY_KEY,
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        research: profileDataKey('robin', researchStateKey(STEAMWORKS)),
        megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
      },
    },
  );
  await page.reload();
}

async function openSchoolhouse(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyA');
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyS');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
}

async function openDynamoSite(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (const [key, milliseconds] of [['KeyS', 1_100], ['KeyD', 1_600]] as const) {
    await page.keyboard.down(key);
    await page.waitForTimeout(milliseconds);
    await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('dynamo-hall');
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('Dynamo Hall builds from gold and pressure, then hold-to-crank activates Voltage exactly once', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await seed(page, 8);
  await openDynamoSite(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.dynamoHall)).toMatchObject({
    visible: true,
    stage: 3,
    totalStages: 3,
    complete: true,
    surveyVisible: false,
  });

  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.loadEpoch(epoch).megaprojects.find((project) => project.id === 'dynamo-hall');
    }, STEAMWORKS),
  ).toMatchObject({
    unlockCondition: { science: 8 },
    stages: [
      { materials: { gold: 160, pressure: 20 }, defenseWaves: [1, 3, 5] },
      { materials: { gold: 240, pressure: 35 }, defenseWaves: [1, 3, 5, 7] },
      { materials: { gold: 320, pressure: 50 }, defenseWaves: [1, 2, 4, 6, 8] },
    ],
  });
  const crank = page.getByTestId('crank-dynamo');
  await expect(crank).toBeVisible();
  await expect(page.getByTestId('town-approach-prompt')).not.toContainText('Baron');
  await shot(page, testInfo, 'crank-ready');
  await crank.dispatchEvent('pointerdown');
  await expect(crank).toHaveAttribute('data-crank-state', 'cranking');
  await shot(page, testInfo, 'crank-held');
  await page.waitForTimeout(1_350);

  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'e3-ceremony-dynamo');
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-art-key', 'plate-e3-bld-dynamo-hall');
  await page.waitForTimeout(300);
  await shot(page, testInfo, 'ceremony-dynamo');
  await page.locator('[data-story-ceremony-continue]').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'e3-ceremony-tree');
  await expect(page.getByTestId('story-beat-card')).toContainText("The first lamp burns in the Elder's Tree.");
  await page.waitForTimeout(300);
  await shot(page, testInfo, 'ceremony-tree-lamp');
  await page.locator('[data-story-ceremony-continue]').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'e3-ceremony-title');
  await expect(page.getByTestId('story-beat-card')).toContainText('The Voltage Age');

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(VOLTAGE);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(VOLTAGE);
  expect(
    await page.evaluate(async (epoch) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(epoch);
    }, VOLTAGE),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test('the T2 door reports missing science and the Voltage ceremony remains skippable', async ({ page }) => {
  await seed(page, 7);
  await openSchoolhouse(page);
  await expect(page.getByTestId('dynamo-hall-epoch-door')).toHaveAttribute('data-door-state', 'needs-science');
  await expect(page.getByTestId('dynamo-hall-epoch-door')).not.toContainText('Baron');

  await seed(page, 8);
  await openSchoolhouse(page);
  await page.getByTestId('crank-dynamo').dispatchEvent('pointerdown');
  await page.waitForTimeout(1_350);
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'e3-ceremony-dynamo');
  await page.locator('[data-story-ceremony-skip]').click();
  await expect(page.locator('.story-beat-card--ceremony')).toHaveCount(0);
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(VOLTAGE);
});
