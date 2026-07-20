import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
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
  }, { activeEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY), profileKey: PROFILE_KEY, townNameKey: profileDataKey('robin', TOWN_NAME_KEY) });
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

test('Steamworks board keeps pending surveys and Voltage secrets out of the DOM', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await openSteamworksBoard(page);

  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(2);
  await page.getByTestId('contract-chapter-tab-epoch-2-steamworks').click();
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toBeEnabled();
  const markup = await page.getByTestId('contract-board').innerHTML();
  for (const id of ['e2-trestle', 'e2-pressure-garden', 'e2-incline']) {
    await expect(page.getByTestId(`contract-card-${id}`)).toBeVisible();
  }
  expect(markup).not.toContain('epoch-3-voltage');
  expect(markup).not.toContain('Voltage Age');
  await expect(page.locator('[data-testid^="contract-upcoming-"]')).toHaveCount(0);
  await expect(page.getByTestId('contract-next-epoch')).toHaveCount(0);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-board.png`), fullPage: true });
  expect(errors).toEqual([]);
});
