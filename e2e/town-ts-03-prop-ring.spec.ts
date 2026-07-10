import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/ts-03-prop-ring');

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

async function openTown(page: Page, search = ''): Promise<NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>> {
  await page.goto('/');
  if (search) await page.evaluate((value) => history.replaceState(null, '', `/${value}`), search);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 24);
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
}

async function stableCalls(page: Page): Promise<number> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.renderer.calls ?? 0);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 56; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null)) === 'tavern') return;
    const target = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.buildings.find((entry) => entry.id === 'tavern')?.approach ?? { x: 0, z: 0 });
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.55) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.55) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(150);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null), { timeout: 2_000 }).toBe('tavern');
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('TS-03 prop ring renders the arrival props, dry Pan Monument, Pony Express plot, and stays inside draw-call budget', async ({ page }, testInfo) => {
  await seedGrownTown(page);
  const errors = collectErrors(page);

  await openTown(page, '?noTownProps=1');
  const baselineCalls = await stableCalls(page);

  const day = await openTown(page);
  const dayCalls = await stableCalls(page);
  expect(day.propRing.enabled).toBe(true);
  expect(day.propRing.counts).toMatchObject({
    covered_wagon: 3,
    fence: 4,
    cactus: 3,
    water_trough: 1,
    lantern_post: 5,
    pony_express_plot: 1,
  });
  expect(day.propRing.panMonument).toMatchObject({ visible: true, x: 0, z: 0, waterState: 'dry' });
  expect(day.propRing.ponyExpressPlot).toMatchObject({ visible: true, pictogram: 'rider-horn' });
  expect(dayCalls - baselineCalls).toBeLessThanOrEqual(day.propRing.drawCallBudget);
  await walkToTavern(page);
  await shot(page, testInfo, `day-draws-${baselineCalls}-to-${dayCalls}`);

  const night = await openTown(page, '?townNight=1');
  expect(night.propRing.night).toBe(true);
  expect(night.propRing.lanterns).toBe(5);
  await expect.poll(() => stableCalls(page)).toBeLessThanOrEqual(baselineCalls + night.propRing.drawCallBudget);
  await shot(page, testInfo, 'night-lantern-ring');
  assertNoErrors(errors);
});
