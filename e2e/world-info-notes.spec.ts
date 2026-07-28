import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';
import type { WorldInfoObjectClass } from '../src/ui/WorldInfoNotes';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildEntry = { id: BuildableId; index: number; tier: number; position: { x: number; z: number } };
type StorageEntry = [string, string];

const ARTIFACT_DIR = path.resolve('artifacts/world-info-notes');
const PROFILE_ID = 'robin';
const TAKEN_FRONTIER_NODES = RESEARCH_NODES.map((node) => node.id);

// 2026-07-28 F-1169: keep these at the nearest measured terrain-valid, mutually clear cells.
const BUILD_NOTE_CASES: Array<{ id: BuildableId; x: number; z: number; objectClass: WorldInfoObjectClass; text: string }> = [
  { id: 'sentry_beacon', x: -16, z: 14, objectClass: 'sentry_beacon', text: 'brass lamp' },
  { id: 'palisade', x: -10, z: 14, objectClass: 'palisade', text: 'Higher tier means more hit points' },
  { id: 'stockpile', x: 9, z: 13, objectClass: 'stockpile', text: 'bank cap' },
  { id: 'turret', x: 16, z: 14, objectClass: 'turret', text: 'spark tower' },
  { id: 'sluice', x: -4, z: 7, objectClass: 'sluice', text: 'Washes gold over time' },
  { id: 'assay_office', x: 3, z: 7, objectClass: 'assay_office', text: 'Write an order' },
];

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, entries: StorageEntry[] = [], hintsSeen: string[] = []): Promise<void> {
  const profileState: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [
      {
        id: PROFILE_ID,
        name: 'Robin',
        createdAt: 1,
        updatedAt: 1,
        difficultyPreset: 'trail',
        hintsSeen,
      },
    ],
  };
  await page.addInitScript(
    ({ profileKey, state, seededEntries }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify(state));
      for (const [key, value] of seededEntries) localStorage.setItem(key, value);
    },
    { profileKey: PROFILE_KEY, state: profileState, seededEntries: entries },
  );
}

async function openGame(page: Page, query: string, entries: StorageEntry[] = []): Promise<ErrorBucket> {
  await seedProfile(page, entries);
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissBriefing(page);
  return errors;
}

async function dismissBriefing(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((point) => window.__GR_TEST__?.teleport(point.x, point.z), { x, z });
  await page.waitForTimeout(80);
}

async function clearNote(page: Page): Promise<void> {
  await teleport(page, 30, 30);
  await expect(page.getByTestId('world-info-note')).toBeHidden();
}

async function expectNote(page: Page, objectClass: WorldInfoObjectClass, text?: string): Promise<void> {
  const note = page.getByTestId('world-info-note');
  await expect(note).toBeVisible();
  await expect(note).toHaveAttribute('data-object-class', objectClass);
  if (text) await expect(note).toContainText(text);
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before + amount);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<BuildEntry> {
  await teleport(page, x, z + 2);
  const before = await buildableCount(page, id);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const entry = await page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((candidate) => candidate.id === buildableId) ?? null,
    id,
  );
  expect(entry).toBeTruthy();
  return entry as BuildEntry;
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function scopedEntry(key: string, value: string): StorageEntry[] {
  return [
    [key, value],
    [profileDataKey(PROFILE_ID, key), value],
  ];
}

function metaEntry(tracks: { territory: number; science: number; hero: number; agent: number }): StorageEntry[] {
  return scopedEntry(META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks }));
}

function researchEntry(steps = 0): StorageEntry[] {
  return scopedEntry(RESEARCH_STATE_KEY, JSON.stringify({ version: 1, taken: TAKEN_FRONTIER_NODES, overflow: steps, proposalSalt: 0 }));
}

function megaprojectResetEntry(): StorageEntry[] {
  return scopedEntry(MEGAPROJECT_STATE_KEY, JSON.stringify({ version: 1, projects: {} }));
}

test('run-world notes explain seams, stake, ford, prospector, and soften after two approaches', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-core');

  const seam = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.active)?.position ?? null);
  expect(seam).toBeTruthy();
  await teleport(page, seam!.x, seam!.z);
  await expectNote(page, 'gold_seam', 'pan works itself');
  await shot(page, testInfo, 'gold-seam-note');
  await clearNote(page);
  await teleport(page, seam!.x, seam!.z);
  await expectNote(page, 'gold_seam', 'pan works itself');
  await expect(page.getByTestId('world-info-note-body')).toBeVisible();
  await clearNote(page);
  await teleport(page, seam!.x, seam!.z);
  await expectNote(page, 'gold_seam');
  await expect(page.getByTestId('world-info-note')).toHaveAttribute('data-compact', 'true');
  await expect(page.getByTestId('world-info-note-body')).toBeHidden();

  await teleport(page, 0, 12);
  await expectNote(page, 'claim_stake', 'Lose it and the run is done');
  await shot(page, testInfo, 'claim-stake-note');

  await teleport(page, 0, 0);
  await expectNote(page, 'ford', 'only crossing');

  const prospector = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.position ?? null);
  expect(prospector).toBeTruthy();
  await teleport(page, prospector!.x, prospector!.z);
  await expectNote(page, 'prospector', 'Your deputy');

  assertNoErrors(errors);
});

test('building notes sit with existing assay and upgrade prompts', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&nosteal&seed=world-info-buildings');
  await grantGold(page, 2_000);

  const entries: Record<string, BuildEntry> = {};
  for (const item of BUILD_NOTE_CASES) entries[item.id] = await placeBuildableAt(page, item.id, item.x, item.z);

  for (const item of BUILD_NOTE_CASES) {
    const entry = entries[item.id]!;
    await teleport(page, entry.position.x, entry.position.z);
    await expectNote(page, item.objectClass, item.text);
  }

  const assay = entries.assay_office!;
  await teleport(page, assay.position.x, assay.position.z);
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  await expectNote(page, 'assay_office', 'Write an order');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('assay-bench')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  const palisade = entries.palisade!;
  await teleport(page, palisade.position.x, palisade.position.z);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expectNote(page, 'palisade', 'Higher tier means more hit points');
  await page.getByTestId('upgrade-confirm').click();
  await expect
    .poll(() =>
      page.evaluate(([id, index]) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === id && entry.index === index)?.tier, [
        palisade.id,
        palisade.index,
      ] as const),
    )
    .toBe(2);

  assertNoErrors(errors);
});

test('contract-specific world notes cover Dry Gulch water, territory gaps, and Night Shift lanterns', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-dry-gulch&timescale=4&nowaves&nolevel&nokill&seed=world-info-dry-gulch',
    metaEntry({ territory: Balance.meta.territoryTier1, science: 0, hero: 0, agent: 0 }),
  );

  const spring = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.waterSources[0] ?? null);
  expect(spring).toBeTruthy();
  await teleport(page, spring!.x, spring!.z);
  await expectNote(page, 'spring_pond', 'Dry Gulch water');

  const gap = await page.evaluate(
    ({ gapHalf, depth, width }) => {
      const contract = window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams;
      const stake = contract?.stakeMarkers?.find((marker) => marker.lossCondition) ?? { x: 0, z: 12 };
      const edge = contract?.lanes.spawnEdges[0] ?? 'north';
      const capOffset = gapHalf + depth - width / 2;
      const sideOffset = gapHalf + depth + width / 2;
      if (edge === 'north' || edge === 'south') return { x: stake.x, z: stake.z + (edge === 'north' ? capOffset : -capOffset) };
      return { x: stake.x + (edge === 'east' ? sideOffset : -sideOffset), z: stake.z };
    },
    { gapHalf: Balance.meta.territoryRingGapHalfWidth, depth: Balance.palisade.depth, width: Balance.palisade.width },
  );
  await teleport(page, gap.x, gap.z);
  await expectNote(page, 'territory_ring_gap', 'Enemies funnel here');

  assertNoErrors(errors);
});

test('Night Shift lantern post note uses the same registry', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=4&nowaves&nolevel&nokill&seed=world-info-lantern');
  const lantern = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPostPositions[0] ?? null);
  expect(lantern).toBeTruthy();
  await teleport(page, lantern!.x, lantern!.z);
  await expectNote(page, 'lantern_post', 'Night Shift');
  assertNoErrors(errors);
});

test('megaproject site registers a note without replacing the signboard readout', async ({ page }) => {
  const entries = [
    ...metaEntry({ territory: 0, science: STEAMWORKS_THRESHOLD, hero: 0, agent: 0 }),
    ...researchEntry(STEAMWORKS_THRESHOLD),
    ...megaprojectResetEntry(),
  ];
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-megaproject', entries);
  const footprint = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject.siteFootprint ?? null);
  expect(footprint).toBeTruthy();
  await teleport(page, footprint!.x, footprint!.z);
  await expectNote(page, 'megaproject_site', 'Steamworks door');
  await expect(page.getByTestId('world-info-note-hint')).toContainText('site signboard');
  assertNoErrors(errors);
});

test('town shells use info notes beside opens-soon prompts', async ({ page }) => {
  await seedProfile(page, scopedEntry(TOWN_NAME_KEY, 'Quartz Hill'));
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon');
  await expect(page.getByTestId('town-open-board')).toBeVisible();
  await expectNote(page, 'town_tavern', 'contract board');

  await hold(page, 'KeyD', 2_000);
  await hold(page, 'KeyS', 350);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('Claim Office');
  await expect(page.getByTestId('town-rename')).toBeVisible();
  await expectNote(page, 'town_claim_office', 'civic ledger');

  await hold(page, 'KeyA', 2_300);
  await hold(page, 'KeyS', 1_200);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('Schoolhouse');
  await expectNote(page, 'town_schoolhouse', 'Future lessons');

  await hold(page, 'KeyD', 2_250);
  await hold(page, 'KeyS', 350);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('Assay Office');
  await expectNote(page, 'town_assay_office', 'town side of orders');

  assertNoErrors(errors);
});

test('390px world note clears the touch stick zone', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-mobile');
  await teleport(page, 0, 12);
  await expectNote(page, 'claim_stake', 'Lose it and the run is done');
  await expect(page.locator('#touch-controls')).toBeVisible();
  const boxes = await page.evaluate(() => {
    const note = document.querySelector<HTMLElement>('[data-testid="world-info-note"]')?.getBoundingClientRect();
    const controls = document.querySelector<HTMLElement>('#touch-controls')?.getBoundingClientRect();
    return note && controls
      ? {
          note: { top: note.top, bottom: note.bottom, left: note.left, right: note.right },
          controls: { top: controls.top, bottom: controls.bottom, left: controls.left, right: controls.right },
        }
      : null;
  });
  expect(boxes).toBeTruthy();
  expect(boxes!.note.bottom).toBeLessThanOrEqual(boxes!.controls.top - 8);
  await shot(page, testInfo, 'mobile-390-stake-note');
  assertNoErrors(errors);
});
