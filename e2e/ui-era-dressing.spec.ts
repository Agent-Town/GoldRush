import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PERFORMANCE_TIER_STORAGE_KEY } from '../src/game/PerformanceTier';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs } from '../src/meta/ContractFamilies';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { researchStateKey } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const EPOCHS = listEpochs();
const PROCESSED_ASSET_DIR = new URL('../assets/processed', import.meta.url);
const PROMOTED_ERA_ORDERS = readdirSync(PROCESSED_ASSET_DIR)
  .flatMap((name) => name.match(/^kit-era-(\d+)\.png$/)?.[1] ?? [])
  .map(Number)
  .sort((a, b) => a - b);

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

test('every promoted era matches the glob contract and returns a PNG', async ({ page }) => {
  expect(PROMOTED_ERA_ORDERS).toEqual(Array.from({ length: PROMOTED_ERA_ORDERS.length }, (_, index) => index + 1));
  expect(PROMOTED_ERA_ORDERS.at(-1)).toBe(10);
  expect(readFileSync(new URL('../src/ui/EraBackdrop.ts', import.meta.url), 'utf8')).toContain(
    "import.meta.glob<string>('../../assets/processed/kit-era-*.png'",
  );

  const errors = collectErrors(page);
  await page.goto('/?performance=full');
  const distAssetDir = new URL('../dist/assets', import.meta.url);
  const builtFiles = existsSync(distAssetDir)
    ? readdirSync(distAssetDir).filter((name) => /^kit-era-\d+-.*\.png$/.test(name))
    : [];
  const results = await page.evaluate(async ({ orders, sourceDir, builds }) => {
    return Promise.all(orders.map(async (order) => {
      const built = builds.find((name) => name.startsWith(`kit-era-${order}-`));
      const candidates = [built ? `/assets/${built}` : '', `/@fs${sourceDir}/kit-era-${order}.png`].filter(Boolean);
      for (const url of candidates) {
        const response = await fetch(url);
        if (response.ok && response.headers.get('content-type')?.startsWith('image/png')) return { order, status: response.status };
      }
      return { order, status: 0 };
    }));
  }, { orders: PROMOTED_ERA_ORDERS, sourceDir: fileURLToPath(PROCESSED_ASSET_DIR), builds: builtFiles });

  expect(results).toEqual(PROMOTED_ERA_ORDERS.map((order) => ({ order, status: 200 })));
  expect(errors).toEqual([]);
});

test('registered eras render on the menu and a town surface', async ({ context }) => {
  test.setTimeout(90_000);
  for (const epoch of EPOCHS) {
    const page = await context.newPage();
    const errors = collectErrors(page);
    const assetErrors: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().includes('kit-era-')) assetErrors.push(`${response.status()} ${response.url()}`);
    });
    await seedEpoch(page, epoch.id);
    await page.goto('/');
    await expectBackdrop(page.locator('.gr-start-menu__backdrop'), epoch.order, true);

    await page.getByTestId('start-menu-enter-town').click();
    await openSchoolhouse(page);
    await page.getByTestId(`research-era-${epoch.id}`).click();
    await expectBackdrop(page.locator('.town-ui__era-backdrop'), epoch.order);
    expect(assetErrors).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }
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

async function seedEpoch(page: Page, activeEpoch: string): Promise<void> {
  const activeOrder = EPOCHS.find((epoch) => epoch.id === activeEpoch)?.order ?? 1;
  const research = EPOCHS.filter((epoch) => epoch.order <= activeOrder).map((epoch) => [
    profileDataKey('robin', researchStateKey(epoch.id)),
    JSON.stringify({ version: 1, steps: 0, metaScienceCursor: 0, taken: [], proposalSalt: 0, pinnedTarget: null }),
  ]);
  await page.addInitScript(({ profileKey, activeKey, townKey, metaKey, tierKey, epoch, science, researchRows }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(activeKey, epoch);
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science, hero: 0, agent: 0 } }));
    localStorage.setItem(tierKey, 'full');
    for (const [key, value] of researchRows) localStorage.setItem(key, value);
  }, {
    profileKey: PROFILE_KEY,
    activeKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    tierKey: PERFORMANCE_TIER_STORAGE_KEY,
    epoch: activeEpoch,
    science: activeOrder === 1 ? 0 : activeOrder === 2 ? 6 : 100,
    researchRows: research,
  });
}

async function expectBackdrop(backdrop: ReturnType<Page['locator']>, order: number, ready = false): Promise<void> {
  await expect(backdrop).toHaveAttribute('data-era-backdrop', `kit-era-${order}`);
  if (ready) await expect(backdrop).toHaveAttribute('data-asset-state', 'ready');
  await expect.poll(() => backdrop.evaluate((element) => getComputedStyle(element).backgroundImage)).toMatch(
    new RegExp(`kit-era-${order}(?:-[^/"')]+)?\\.png`),
  );
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
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
