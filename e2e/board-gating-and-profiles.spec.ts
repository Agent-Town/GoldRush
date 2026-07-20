import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/board-gating');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedProfile(page: Page, epochId = 'epoch-1-frontier'): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ activeEpochKey, epoch, profileKey, townNameKey }) => {
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
      localStorage.setItem(townNameKey, 'Quartz Hill');
      localStorage.setItem(activeEpochKey, epoch);
    },
    {
      activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      epoch: epochId,
      profileKey: PROFILE_KEY,
      townNameKey: profileDataKey('robin', TOWN_NAME_KEY),
    },
  );
  await page.reload();
}

async function openBoard(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (const [key, ms] of [['KeyA', 850], ['KeyW', 850]] as const) {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

test('the board hides future epochs and keeps reached-era contract gates', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);

  await seedProfile(page);
  await openBoard(page);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeEpochId)).toBe('epoch-1-frontier');
  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(1);
  await expect(page.getByTestId('contract-chapter-count')).toHaveText('1 / 1');
  await expect(page.getByTestId('contract-chapter-epoch-1-frontier').locator('[data-contract-id]')).toHaveCount(5);
  for (const epochId of [
    'epoch-2-steamworks',
    'epoch-3-voltage',
    'epoch-4-motor',
    'epoch-5-deepwater',
    'epoch-6-atomic',
    'epoch-7-signal',
    'epoch-8-orbital',
    'epoch-9-redfields',
    'epoch-10-deepsky',
  ]) {
    await expect(page.getByTestId(`contract-chapter-tab-${epochId}`)).toHaveCount(0);
  }
  for (const id of [
    'e2-hill-mine',
    'e4-long-road',
    'e5-regatta',
    'e6-showroom',
    'e7-relay-valley',
    'e8-mare-claim',
    'e9-seed-run',
    'e10-archive-world',
  ]) {
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveCount(0);
  }
  await shot(page, testInfo, 'fresh-secrets-kept');

  await seedProfile(page, 'epoch-2-steamworks');
  await openBoard(page);
  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(2);
  await page.getByTestId('contract-chapter-tab-epoch-2-steamworks').click();
  await expect(page.getByTestId('contract-card-e2-hill-mine')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toBeEnabled();
  for (const id of ['e2-trestle', 'e2-pressure-garden', 'e2-incline']) {
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveAttribute('data-contract-locked', 'true');
    await expect(page.getByTestId(`contract-launch-${id}`)).toBeDisabled();
  }
  for (const id of ['e3-blackout-ridge', 'e3-moth-season', 'e3-fairground']) {
    await expect(page.getByTestId(`contract-card-${id}`)).toHaveCount(0);
  }
  await expect(page.getByTestId('contract-chapter-count')).toHaveText('2 / 2');
  await shot(page, testInfo, 'steamworks-profiles');

  expect(errors).toEqual([]);
});
