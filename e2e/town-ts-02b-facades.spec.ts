import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/ts-02b-facades');
const BUILDINGS = [
  ['tavern', 'bld-tavern'],
  ['claim_office', 'bld-claim-office'],
  ['schoolhouse', 'bld-schoolhouse'],
  ['assay_office', 'bld-claim-office'],
  ['general_store', 'bld-general-store'],
  ['chapel', 'bld-chapel'],
] as const;

type BuildingId = (typeof BUILDINGS)[number][0];
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedGrownTown(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  }, { profileKey: PROFILE_KEY, townKey: profileDataKey('robin', TOWN_NAME_KEY), metaKey: profileDataKey('robin', META_PROGRESS_KEY) });
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 12);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function walkToBuilding(page: Page, id: BuildingId): Promise<void> {
  for (let step = 0; step < 56; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null)) === id) return;
    const target = await page.evaluate((buildingId) => {
      const building = window.__GR_TOWN_DIAGNOSTICS__?.buildings.find((entry) => entry.id === buildingId);
      return building?.approach ?? { x: 0, z: 0 };
    }, id);
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.55) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.55) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(150);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null), { timeout: 2_000 }).toBe(id);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('built town mounts 2.5D facade keys and all six surfaces remain walkable', async ({ page }, testInfo) => {
  await seedGrownTown(page);
  const errors = collectErrors(page);
  await openTown(page);

  const buildings = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.buildings ?? []);
  for (const [id, facadeKey] of BUILDINGS) {
    const building = buildings.find((entry) => entry.id === id);
    expect(building).toMatchObject({ visible: true, plotVisible: false, facadeKey });
  }
  await shot(page, testInfo, 'desktop-wide-facades');

  for (const [id] of BUILDINGS) {
    await walkToBuilding(page, id);
    await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null)).toBe(id);
  }
  assertNoErrors(errors);
});

test('built town facades frame correctly at 390px', async ({ page }, testInfo) => {
  await seedGrownTown(page);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await openTown(page);

  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.buildings.filter((entry) => entry.visible).length)).toBe(6);
  await shot(page, testInfo, 'mobile-390-wide-facades');
  assertNoErrors(errors);
});
