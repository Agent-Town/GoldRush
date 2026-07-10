import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { townPlazaLayout } from '../src/town/townLayout';

const ARTIFACT_DIR = path.resolve('artifacts/ts-01');
const PROFILE_ID = 'robin';
const GROWTH_BEATS_SEEN = ['story:town-growth-general-store', 'story:town-growth-chapel'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedTown(page: Page, territory: number): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, townKey, metaKey, firstClaimKey, profileId, hintsSeen, territoryValue }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: profileId,
        profiles: [{ id: profileId, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(firstClaimKey, '1');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: territoryValue, science: 0, hero: 0, agent: 0 } }));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
      firstClaimKey: FIRST_CLAIM_DONE_KEY,
      profileId: PROFILE_ID,
      hintsSeen: GROWTH_BEATS_SEEN,
      territoryValue: territory,
    },
  );
  await page.reload();
}

async function openTown(page: Page): Promise<NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
}

async function walkTo(page: Page, target: { x: number; z: number }, prompt: string | null): Promise<void> {
  for (let step = 0; step < 80; step += 1) {
    const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
    if (prompt !== null && diagnostics.activePrompt === prompt) return;
    if (prompt === null && Math.hypot(diagnostics.player.x - target.x, diagnostics.player.z - target.z) < 0.8) return;
    const keys: string[] = [];
    if (Math.abs(target.x - diagnostics.player.x) > 0.45) keys.push(target.x > diagnostics.player.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - diagnostics.player.z) > 0.45) keys.push(target.z > diagnostics.player.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(120);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  if (prompt === null) return;
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe(prompt);
}

async function shot(page: Page, testInfo: TestInfo): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const name = testInfo.project.name === 'mobile-chrome' ? 'after-mobile-390.png' : 'after-desktop-wide.png';
  await page.screenshot({ path: path.join(ARTIFACT_DIR, name), fullPage: true });
}

test('plaza descriptor forms a clear ring with baked routes to every slot and the gate', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedTown(page, 0);
  let diagnostics = await openTown(page);

  expect(townPlazaLayout.center).toEqual({ x: 0, z: 0 });
  expect(townPlazaLayout.clearRadius).toBeGreaterThanOrEqual(3);
  expect(townPlazaLayout.slots).toHaveLength(7);
  for (const slot of townPlazaLayout.slots) {
    expect(Math.hypot(slot.position.x, slot.position.z)).toBeGreaterThanOrEqual(9.9);
  }
  expect(diagnostics.plaza).toMatchObject({ clearRadius: townPlazaLayout.clearRadius, emptyPlots: 2, trailCount: 8 });
  expect(diagnostics.buildings.filter((building) => building.plotVisible).map((building) => building.id).sort()).toEqual(['chapel', 'general_store']);

  await seedTown(page, 3);
  diagnostics = await openTown(page);
  expect(diagnostics.plaza.emptyPlots).toBe(0);
  expect(diagnostics.buildings.every((building) => building.visible && !building.plotVisible)).toBe(true);
  await shot(page, testInfo);

  for (const building of diagnostics.buildings) {
    await walkTo(page, townPlazaLayout.center, null);
    await walkTo(page, building.approach, building.id);
    await expect(page.getByTestId('town-approach-prompt')).toContainText(building.name);
  }
  await walkTo(page, townPlazaLayout.center, null);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
