import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HpEntry = {
  id: BuildableId;
  index: number;
  tier: number;
  hp: number;
  maxHp: number;
  worn: boolean;
  effectiveDamage?: number;
  effectiveFireRate?: number;
  panRateMult?: number;
  position: { x: number; z: number };
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&timescale=8&nowaves&nolevel&nopause&nokill&nosteal&seed=${seed}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await gold(page);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => gold(page)).toBe(before + amount);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function baseValue(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.summary.baseValue ?? 0);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), { x, z });
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function hpEntry(page: Page, id: BuildableId, index: number): Promise<HpEntry | null> {
  return page.evaluate(
    ([buildableId, i]) =>
      (window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === buildableId && entry.index === i) as HpEntry | undefined) ?? null,
    [id, index] as const,
  );
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<HpEntry> {
  await teleport(page, x, z + 2);
  const before = await buildableCount(page, id);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const entries = await page.evaluate((buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === buildableId) ?? [], id);
  const entry = entries.find((candidate) => candidate.position.x === x && candidate.position.z === z) as HpEntry | undefined;
  expect(entry).toBeTruthy();
  return entry!;
}

async function upgrade(page: Page, entry: HpEntry): Promise<boolean> {
  await teleport(page, entry.position.x, entry.position.z);
  return page.evaluate(([id, index]) => window.__GR_TEST__?.upgradeBuilding(id, index) ?? false, [entry.id, entry.index] as const);
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(true);
}

async function ghostValidAt(page: Page, id: BuildableId, x: number, z: number): Promise<boolean> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect
    .poll(() =>
      page.evaluate(
        (target) => {
          const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
          return Boolean(build && Math.abs(build.ghostPos.x - target.x) < 0.01 && Math.abs(build.ghostPos.z - target.z) < 0.01);
        },
        { x, z },
      ),
    )
    .toBe(true);
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false);
}

test('turret tier raises live damage and spends the exact tier-2 cost', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-turret');
  await grantGold(page, 300);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  const before = (await hpEntry(page, 'turret', turret.index))!;
  expect(before.tier).toBe(1);
  expect(before.effectiveDamage).toBe(Balance.turret.damage);

  await teleport(page, turret.position.x, turret.position.z);
  await expect(page.getByTestId('upgrade-prompt')).toBeVisible();
  await expect(page.getByTestId('upgrade-prompt')).toContainText(`Tier 2`);
  await expect(page.getByTestId('upgrade-prompt')).toContainText(`${Balance.tiers.turret[1].cost} gold`);
  const beforeGold = await gold(page);
  await page.keyboard.press('Enter');

  await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  const after = (await hpEntry(page, 'turret', turret.index))!;
  expect(await gold(page)).toBe(beforeGold - Balance.tiers.turret[1].cost);
  expect(await baseValue(page)).toBe(Balance.turret.costBase + Balance.tiers.turret[1].cost);
  expect(after.effectiveDamage).toBeGreaterThan(before.effectiveDamage ?? 0);
  expect(after.effectiveDamage).toBeCloseTo(Balance.turret.damage * Balance.tiers.turret[1].damageMult, 5);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('palisade tier raises max HP, heals, and wears only below half the new max', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-palisade');
  await grantGold(page, 200);
  const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(palisade.maxHp).toBe(60);

  await expect(upgrade(page, palisade)).resolves.toBe(true);
  const upgraded = (await hpEntry(page, 'palisade', palisade.index))!;
  expect(upgraded.tier).toBe(2);
  expect(upgraded.maxHp).toBe(96);
  expect(upgraded.hp).toBe(upgraded.maxHp);
  expect(upgraded.worn).toBe(false);

  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'wreck.damage', 46);
  await setBalance(page, 'wreck.hitCooldown', 999);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(50);
  expect((await hpEntry(page, 'palisade', palisade.index))?.worn).toBe(false);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await setBalance(page, 'wreck.damage', 5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(45);
  expect((await hpEntry(page, 'palisade', palisade.index))?.worn).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('sluice tier raises the pan-rate multiplier the sluice reads', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-sluice');
  await grantGold(page, 300);
  const sluice = await placeBuildableAt(page, 'sluice', 0, 7);
  const before = (await hpEntry(page, 'sluice', sluice.index))!;
  expect(before.panRateMult).toBe(1);

  await expect(upgrade(page, sluice)).resolves.toBe(true);
  const after = (await hpEntry(page, 'sluice', sluice.index))!;
  expect(after.tier).toBe(2);
  expect(after.panRateMult).toBe(Balance.tiers.sluice[1].panRateMult);
  const sluiceState = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__?.build.sluicesState[index]?.panRateMult ?? 0, sluice.index);
  expect(sluiceState).toBe(Balance.tiers.sluice[1].panRateMult);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('upgraded palisade keeps identical footprint blocking and edge-touch behavior', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-footprint');
  await grantGold(page, 200);
  const palisade = await placeBuildableAt(page, 'palisade', 0, 9);

  const blockedBefore = await ghostValidAt(page, 'palisade', 0, 10);
  const edgeBefore = await ghostValidAt(page, 'palisade', 0, 12);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await expect(upgrade(page, palisade)).resolves.toBe(true);
  const blockedAfter = await ghostValidAt(page, 'palisade', 0, 10);
  const edgeAfter = await ghostValidAt(page, 'palisade', 0, 12);

  expect({ blockedBefore, blockedAfter, edgeBefore, edgeAfter }).toEqual({
    blockedBefore: false,
    blockedAfter: false,
    edgeBefore: true,
    edgeAfter: true,
  });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('tier cap stops at tier 3 without extra spend', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-cap');
  await grantGold(page, 1000);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  await expect(upgrade(page, turret)).resolves.toBe(true);
  await expect(upgrade(page, turret)).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(3);

  const beforeGold = await gold(page);
  await expect(upgrade(page, turret)).resolves.toBe(false);
  expect(await gold(page)).toBe(beforeGold);
  expect((await hpEntry(page, 'turret', turret.index))?.tier).toBe(3);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('insufficient gold leaves tier and gold unchanged', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-insufficient');
  await grantGold(page, Balance.palisade.cost);
  const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(await gold(page)).toBe(0);
  await teleport(page, palisade.position.x, palisade.position.z);
  await expect(page.getByTestId('upgrade-prompt')).toBeVisible();
  await expect(page.getByTestId('upgrade-prompt')).toContainText(`Need ${Balance.tiers.palisade[1].cost} gold`);
  await expect(upgrade(page, palisade)).resolves.toBe(false);
  expect(await gold(page)).toBe(0);
  expect((await hpEntry(page, 'palisade', palisade.index))?.tier).toBe(1);
  await expect(page.getByTestId('demolish-prompt')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index)).toBeNull();
  expect(await gold(page)).toBe(Math.floor(Balance.demolish.refundPctOfCost * Balance.palisade.cost));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
