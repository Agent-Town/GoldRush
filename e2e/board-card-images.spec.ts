import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

const CLAIM_ID = 'the-claim';
const EPOCHS = listEpochs().map(({ id }) => loadEpoch(id));

test('all contract chapters use their own board-card URL', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await seedProfile(page);
  await page.goto('/');
  await page.evaluate(() => history.replaceState(null, '', '/?debug&epoch=epoch-10-deepsky'));
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();

  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(EPOCHS.length);
  expect(EPOCHS.flatMap((epoch) => epoch.contracts)).toHaveLength(41);
  const claimUrl = await cardImageUrl(page, CLAIM_ID);

  for (const epoch of EPOCHS) {
    await page.getByTestId(`contract-chapter-tab-${epoch.id}`).click();
    for (const contract of epoch.contracts) {
      const imageUrl = await cardImageUrl(page, contract.id);
      if (contract.id === CLAIM_ID) expect(imageUrl).toBe(claimUrl);
      else expect(imageUrl, contract.id).not.toBe(claimUrl);
    }
  }

  await page.getByTestId('contract-chapter-tab-epoch-2-steamworks').click();
  await expect(page.getByTestId('contract-art-e2-trestle').locator('img')).toHaveAttribute('src', /e2-trestle/);
  expect(errors).toEqual([]);
});

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
  }, { profileKey: PROFILE_KEY, townKey: profileDataKey('robin', TOWN_NAME_KEY) });
}

async function cardImageUrl(page: Page, contractId: string): Promise<string> {
  await expect(page.getByTestId(`contract-card-${contractId}`)).toBeVisible();
  return (await page.getByTestId(`contract-art-${contractId}`).locator('img').getAttribute('src')) ?? '';
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}
