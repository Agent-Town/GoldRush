import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const EPOCHS = ['epoch-1-frontier', 'epoch-2-steamworks', 'epoch-3-voltage', 'epoch-4-motor', 'epoch-5-deepwater'] as const;
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };
const SHOT_DIR = 'artifacts/e5-research-tree';

test('the active Deepwater chart renders its uncertified bank without purchasable picks', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(`PAGE: ${error.message}`));
  await seedDeepwater(page);
  await openSchoolhouse(page);

  await expect(page.locator('[data-research-branch]')).toHaveCount(3);
  await expect(page.locator('[data-research-node]')).toHaveCount(15);
  const icons = page.locator('[data-research-node] [role="img"][data-asset-state="ready"]');
  await expect(icons).toHaveCount(15);
  expect(await icons.evaluateAll((items) => items.every((item) => item.style.backgroundImage.startsWith('url(')))).toBe(true);
  await expect(page.getByTestId('research-era-row').locator('[data-research-era]')).toHaveCount(5);
  await expect(page.getByTestId('research-era-epoch-5-deepwater')).toHaveText('The Deepwater Claim — active');

  await expect(page.locator('[data-research-state="available"]')).toHaveCount(0);
  await expect(page.locator('[data-research-state="locked"]')).toHaveCount(15);
  await page.locator('[data-research-node]').first().click();
  await expect(page.getByTestId('research-chart-impact-line')).toContainText('The Assay Office has not certified this technique yet.');
  await expect(page.getByTestId('research-chart-pin')).toHaveCount(0);
  await shot(page, testInfo, 'chart');
  expect(errors).toEqual([]);
});

async function seedDeepwater(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, activeKey, metaKey, researchKeys, townKey, epochs }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(activeKey, epochs[4]);
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 40, hero: 0, agent: 0 } }));
      [6, 8, 10, 12, 4].forEach((steps, index) => {
        localStorage.setItem(
          researchKeys[index]!,
          JSON.stringify({ version: 1, steps, metaScienceCursor: 40, taken: [], proposalSalt: 0, pinnedTarget: null }),
        );
      });
      localStorage.setItem(townKey, 'Quartz Hill');
    },
    {
      profileKey: PROFILE_KEY,
      activeKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      researchKeys: EPOCHS.map((epoch) => profileDataKey('robin', researchStateKey(epoch))),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      epochs: EPOCHS,
    },
  );
}

async function openSchoolhouse(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') break;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys: string[] = [];
    if (Math.abs(SCHOOLHOUSE.x - position.x) > 0.6) keys.push(SCHOOLHOUSE.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(SCHOOLHOUSE.z - position.z) > 0.6) keys.push(SCHOOLHOUSE.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}
