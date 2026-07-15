import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const EPOCHS = [
  'epoch-1-frontier',
  'epoch-2-steamworks',
  'epoch-3-voltage',
  'epoch-4-motor',
  'epoch-5-deepwater',
  'epoch-6-atomic',
  'epoch-7-signal',
  'epoch-8-orbital',
] as const;
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };
const SHOT_DIR = 'artifacts/e8-research-tree';

test('the active Orbital Frontier chart renders its frontier and keeps picks pinnable', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(`PAGE: ${error.message}`));
  await seedOrbitalFrontier(page);
  await openSchoolhouse(page);

  await expect(page.locator('[data-research-branch]')).toHaveCount(3);
  expect(await page.locator('[data-research-branch]').evaluateAll((items) => items.map((item) => item.getAttribute('data-research-branch')))).toEqual([
    'Astrogation',
    'Arsenal',
    'Fabrication',
  ]);
  await expect(page.locator('[data-research-node]')).toHaveCount(15);
  await expect(page.getByTestId('research-chart-node-magnet_grapple')).toBeVisible();
  const icons = page.locator('[data-research-node] [role="img"][data-asset-state="ready"]');
  await expect(icons).toHaveCount(15);
  expect(await icons.evaluateAll((items) => items.every((item) => item.style.backgroundImage.startsWith('url(')))).toBe(true);
  await expect(page.getByTestId('research-era-row').locator('[data-research-era]')).toHaveCount(8);
  await expect(page.getByTestId('research-era-epoch-8-orbital')).toHaveText('The Orbital Frontier — active');

  const frontier = page.locator('[data-research-node][data-research-state="available"]').first();
  await frontier.click();
  const id = await frontier.getAttribute('data-research-node');
  await expect(page.getByTestId('research-chart-selection')).toBeVisible();
  await page.getByTestId('research-chart-pin').click();
  await expect(page.locator(`[data-research-node="${id}"]`)).toHaveAttribute('data-pinned-target', 'true');
  await shot(page, testInfo, 'chart');
  expect(errors).toEqual([]);
});

async function seedOrbitalFrontier(page: Page): Promise<void> {
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
      localStorage.setItem(activeKey, epochs[7]);
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 90, hero: 0, agent: 0 } }));
      [6, 8, 10, 12, 14, 16, 18, 4].forEach((steps, index) => {
        localStorage.setItem(
          researchKeys[index]!,
          JSON.stringify({ version: 1, steps, metaScienceCursor: 90, taken: [], proposalSalt: 0, pinnedTarget: null }),
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
