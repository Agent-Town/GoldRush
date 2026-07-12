import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { researchStateKey } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';

test('menu and schoolhouse dress for their active or selected era', async ({ page }, testInfo) => {
  await seedSteamworks(page);
  await page.goto('/');
  await expect(page.locator('.gr-start-menu__backdrop')).toHaveAttribute('data-era-backdrop', 'kit-era-2');
  await expect(page.locator('.gr-start-menu__backdrop')).toHaveAttribute('data-asset-state', 'ready');
  await shot(page, testInfo.project.name, 'menu-steamworks');

  await page.getByTestId('start-menu-enter-town').click();
  await openSchoolhouse(page);
  await expect(page.locator('.town-ui__era-backdrop')).toHaveAttribute('data-era-backdrop', 'kit-era-2');
  await shot(page, testInfo.project.name, 'chart-steamworks');
  await page.getByTestId(`research-era-${FRONTIER}`).click();
  await expect(page.locator('.town-ui__era-backdrop')).toHaveAttribute('data-era-backdrop', 'kit-era-1');
  await shot(page, testInfo.project.name, 'chart-frontier');
});

async function seedSteamworks(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, activeKey, townKey, metaKey, frontierKey, steamworksKey, epoch }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(activeKey, epoch);
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
    localStorage.setItem(frontierKey, JSON.stringify({ version: 1, steps: 6, taken: [], proposalSalt: 0, pinnedTarget: null }));
    localStorage.setItem(steamworksKey, JSON.stringify({ version: 1, steps: 0, metaScienceCursor: 6, taken: [], proposalSalt: 0, pinnedTarget: null }));
  }, {
    profileKey: PROFILE_KEY,
    activeKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    frontierKey: profileDataKey('robin', researchStateKey(FRONTIER)),
    steamworksKey: profileDataKey('robin', researchStateKey(STEAMWORKS)),
    epoch: STEAMWORKS,
  });
}

async function shot(page: Page, project: string, name: string): Promise<void> {
  await mkdir('artifacts/ui-era-dressing', { recursive: true });
  await page.screenshot({ path: `artifacts/ui-era-dressing/${project}-${name}.png`, fullPage: true });
}

async function openSchoolhouse(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') break;
    await page.keyboard.down('KeyA');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(160);
    await page.keyboard.up('KeyS');
    await page.keyboard.up('KeyA');
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
}
