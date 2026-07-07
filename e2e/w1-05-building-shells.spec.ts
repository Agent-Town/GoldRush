import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type BuildableId = 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HpEntry = { id: BuildableId; index: number; tier: number; position: { x: number; z: number } };

const shotDir = path.resolve('artifacts/w1-05');
const signSlots = [
  'bld.portrait.palisade',
  'bld.portrait.sluice',
  'bld.portrait.stockpile',
  'bld.portrait.turret',
] as const;
const placements = [
  { id: 'palisade', x: -6, z: 20, shot: 'palisade' },
  { id: 'sluice', x: 0, z: 7, shot: 'sluice-tier2', upgradeTo: 2 },
  { id: 'stockpile', x: 10, z: 11, shot: 'stockpile' },
  { id: 'turret', x: 4, z: 16, shot: 'turret' },
  { id: 'assay_office', x: 20, z: 7, shot: 'assay-office' },
] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nokill&nolevel&nopause&nosteal&seed=w1-05-shells');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24);
  await page.addStyleTag({ content: '.lil-gui, .dg.ac { display: none !important; }' });
  return errors;
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number, upgradeTo = 1): Promise<HpEntry> {
  const before = await buildableCount(page, id);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect
    .poll(
      () =>
        page.evaluate(
          (target) => {
            const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
            return Boolean(build?.ghostValid && Math.abs(build.ghostPos.x - target.x) < 0.05 && Math.abs(build.ghostPos.z - target.z) < 0.05);
          },
          { x, z },
        ),
      { timeout: 8_000 },
    )
    .toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const entry = await hpEntryAt(page, id, x, z);
  for (let tier = 1; tier < upgradeTo; tier += 1) {
    await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
    await expect(page.evaluate(([buildableId, index]) => window.__GR_TEST__?.upgradeBuilding(buildableId, index), [id, entry.index] as const)).resolves.toBe(
      true,
    );
  }
  return hpEntryAt(page, id, x, z);
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate((buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0, id);
}

async function hpEntryAt(page: Page, id: BuildableId, x: number, z: number): Promise<HpEntry> {
  const entry = await page.evaluate(
    (target) =>
      window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find(
        (candidate) =>
          candidate.id === target.id && Math.abs(candidate.position.x - target.x) < 0.05 && Math.abs(candidate.position.z - target.z) < 0.05,
      ) ?? null,
    { id, x, z },
  );
  if (!entry) throw new Error(`Missing ${id} at ${x},${z}`);
  return entry as HpEntry;
}

async function capture(page: Page, testInfo: TestInfo, label: string, x: number, z: number): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 45);
  const form = testInfo.project.name.includes('mobile') ? '390' : 'desktop';
  const file = path.join(shotDir, `${form}-${label}.png`);
  const body = await page.screenshot({ path: file, fullPage: false });
  await testInfo.attach(`${form}-${label}`, { body, contentType: 'image/png' });
}

test('buildables render timber shells with fixed local signs and a turning sluice wheel', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(1_000));

  for (const placement of placements) {
    const entry = await placeBuildableAt(page, placement.id, placement.x, placement.z, 'upgradeTo' in placement ? placement.upgradeTo : 1);
    if (placement.id === 'sluice') expect(entry.tier).toBe(2);
  }

  await expect
    .poll(
      () =>
        page.evaluate((slots) => slots.map((slot) => window.__THREE_GAME_DIAGNOSTICS__?.assets[slot] ?? 'missing'), [...signSlots]),
      { timeout: 10_000 },
    )
    .toEqual(signSlots.map(() => 'loaded'));

  const shells = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells);
  expect(shells?.palisade).toMatchObject({ active: 1, signs: 1, lit: true });
  expect(shells?.palisade.meshes).toEqual(expect.arrayContaining(['PalisadePosts', 'PalisadeRails', 'PalisadeBraces', 'PalisadePortraitSigns']));
  expect(shells?.sluice).toMatchObject({ active: 1, signs: 1, lit: true });
  expect(shells?.sluice.meshes).toEqual(
    expect.arrayContaining(['SluiceTroughs', 'SluiceTimberRails', 'SluiceWheelRims', 'SluiceWheelSpokesA', 'SluicePortraitSigns']),
  );
  expect(shells?.stockpile.meshes).toEqual(expect.arrayContaining(['StockpileTimberCribs', 'StockpileStrongboxes', 'StockpilePortraitSigns']));
  expect(shells?.turret.meshes).toEqual(expect.arrayContaining(['TurretTimberBases', 'TurretTripodLegs', 'TurretSignalMasts', 'TurretPortraitSigns']));
  expect(shells?.assay_office.meshes).toEqual(expect.arrayContaining(['AssayOfficeTimberShell', 'AssayOfficePortraitSign']));

  const wheelBefore = shells?.sluice.wheelPhase ?? 0;
  await expect
    .poll(() => page.evaluate((before) => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.sluice.wheelPhase !== before, wheelBefore), {
      timeout: 8_000,
    })
    .toBe(true);

  for (const placement of placements) await capture(page, testInfo, placement.shot, placement.x, placement.z);
  await capture(page, testInfo, 'base-wide', 4, 14);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
