import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ACTIVE_EPOCH_KEY, loadEpoch, pendingEpochContracts } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/board-upcoming');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openSteamworksBoard(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ activeEpochKey, profileKey, townNameKey }) => {
    localStorage.clear();
    localStorage.setItem(
      profileKey,
      JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
    localStorage.setItem(townNameKey, 'Quartz Hill');
    localStorage.setItem(activeEpochKey, 'epoch-2-steamworks');
  }, { activeEpochKey: ACTIVE_EPOCH_KEY, profileKey: PROFILE_KEY, townNameKey: profileDataKey('robin', TOWN_NAME_KEY) });
  await page.reload();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(850);
  await page.keyboard.up('KeyA');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(850);
  await page.keyboard.up('KeyW');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
}

test('Steamworks board keeps pending surveys and Voltage visible without launch paths', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await openSteamworksBoard(page);

  await page.getByTestId('contract-page-dot-e2-hill-mine').click();
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toBeEnabled();
  for (const id of ['e2-trestle', 'e2-pressure-garden', 'e2-incline']) {
    await page.getByTestId(`contract-page-dot-${id}`).click();
    await expect(page.getByTestId(`contract-upcoming-${id}`)).toContainText('SURVEY PENDING');
    await expect(page.getByTestId(`contract-upcoming-${id}`).locator('[data-contract-launch]')).toHaveCount(0);
  }
  await page.getByTestId('contract-page-dot-epoch-3-voltage').click();
  await expect(page.getByTestId('contract-next-epoch')).toContainText('Voltage Age');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-board.png`), fullPage: true });
  expect(errors).toEqual([]);
});

test('a shipped contract supersedes its matching pending survey', () => {
  const epoch = loadEpoch('epoch-2-steamworks');
  expect(pendingEpochContracts(epoch, [...epoch.contracts, { id: 'e2-trestle' }])).not.toContainEqual(
    expect.objectContaining({ id: 'e2-trestle' }),
  );
});
