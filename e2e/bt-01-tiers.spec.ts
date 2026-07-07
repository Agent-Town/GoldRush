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
  yieldPerCycle?: number;
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

async function spawnStationaryWreckerAt(page: Page, entry: HpEntry): Promise<void> {
  await teleport(page, entry.position.x, entry.position.z);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0, wrecker: true }));
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(true);
}

function sluiceRate(entry: HpEntry): number {
  return (entry.yieldPerCycle ?? 0) * (entry.panRateMult ?? 1);
}

async function firstSluiceAmounts(page: Page, ids: string[]): Promise<Record<string, number | null>> {
  return page.evaluate((sluiceIds) => {
    const amounts = Object.fromEntries(sluiceIds.map((id) => [id, null])) as Record<string, number | null>;
    for (const event of (window.__GR_TEST__?.economyLog() ?? []) as Array<{ type?: string; sluiceId?: string; amount?: number }>) {
      if (event.type !== 'gold_sluiced' || !event.sluiceId || !sluiceIds.includes(event.sluiceId)) continue;
      amounts[event.sluiceId] ??= event.amount ?? 0;
    }
    return amounts;
  }, ids);
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

test('every buyable tier rung changes a live stat', () => {
  const stats = {
    palisade: ['maxHpMult'],
    sluice: ['panRateMult', 'yieldMult'],
    turret: ['damageMult', 'fireRateMult'],
  } as const;

  for (const id of Object.keys(stats) as Array<keyof typeof stats>) {
    const rows = Balance.tiers[id] as readonly Record<string, number>[];
    for (let tier = 1; tier < rows.length; tier += 1) {
      if ((rows[tier]?.cost ?? 0) <= 0) continue;
      const changed = stats[id].some((stat) => rows[tier]?.[stat] !== rows[tier - 1]?.[stat]);
      expect(changed, `${id} tier ${tier + 1} changes a stat`).toBe(true);
    }
  }
});

test('turret tier raises live damage and spends the exact tier-2 cost', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-turret');
  await grantGold(page, 300);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  const before = (await hpEntry(page, 'turret', turret.index))!;
  expect(before.tier).toBe(1);
  expect(before.effectiveDamage).toBe(Balance.turret.damage);
  expect(before.effectiveFireRate).toBe(Balance.turret.fireRate);

  await teleport(page, turret.position.x, turret.position.z);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toContainText(`Upgrade to T2 (${Balance.tiers.turret[1].cost}g)`);
  const beforeGold = await gold(page);
  await page.keyboard.press('KeyU');

  await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  const after = (await hpEntry(page, 'turret', turret.index))!;
  expect(await gold(page)).toBe(beforeGold - Balance.tiers.turret[1].cost);
  expect(await baseValue(page)).toBe(Balance.turret.costBase + Balance.tiers.turret[1].cost);
  expect(after.effectiveDamage).toBeGreaterThan(before.effectiveDamage ?? 0);
  expect(after.effectiveDamage).toBeCloseTo(Balance.turret.damage * Balance.tiers.turret[1].damageMult, 5);
  expect(after.effectiveFireRate).toBeCloseTo(Balance.turret.fireRate * Balance.tiers.turret[1].fireRateMult, 5);
  expect((after.effectiveDamage ?? 0) * (after.effectiveFireRate ?? 0)).toBeGreaterThanOrEqual(
    (before.effectiveDamage ?? 0) * (before.effectiveFireRate ?? 0) * 1.5,
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('same-frame upgrade and confirm does not demolish the upgraded building', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-upgrade-confirm-chord');
  await grantGold(page, 300);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  await teleport(page, turret.position.x, turret.position.z);
  await expect(page.getByTestId('building-context-prompt')).toContainText(`Upgrade to T2 (${Balance.tiers.turret[1].cost}g)`);
  const beforeGold = await gold(page);

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'KeyU', key: 'u' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter', key: 'Enter' }));
  });

  await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  await expect.poll(() => buildableCount(page, 'turret')).toBe(1);
  expect(await gold(page)).toBe(beforeGold - Balance.tiers.turret[1].cost);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'KeyU', key: 'u' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Enter', key: 'Enter' }));
  });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-click-upgrade-enter-demolish');
  await grantGold(page, 1_000);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  await teleport(page, turret.position.x, turret.position.z);
  await page.getByTestId('upgrade-confirm').click();
  await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  await expect(page.getByTestId('building-context-prompt')).toContainText('Signal Turret · Tier 2');

  await page.keyboard.press('Enter');

  await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull();
  await expect.poll(() => buildableCount(page, 'turret')).toBe(0);
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
  expect(upgraded.maxHp).toBe(Math.round(Balance.wreck.hp.palisade * Balance.tiers.palisade[1].maxHpMult));
  expect(upgraded.maxHp / palisade.maxHp).toBeGreaterThanOrEqual(1.75);
  expect(upgraded.hp).toBe(upgraded.maxHp);
  expect(upgraded.worn).toBe(false);

  await setBalance(page, 'enemy.contactDamage', 0);
  const firstDamage = Math.floor(upgraded.maxHp / 2) - 1;
  await setBalance(page, 'wreck.damage', firstDamage);
  await setBalance(page, 'wreck.hitCooldown', 999);
  await spawnStationaryWreckerAt(page, upgraded);
  const aboveHalfHp = upgraded.maxHp - firstDamage;
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(aboveHalfHp);
  expect((await hpEntry(page, 'palisade', palisade.index))?.worn).toBe(false);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await setBalance(page, 'wreck.damage', 2);
  await spawnStationaryWreckerAt(page, upgraded);
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(aboveHalfHp - 2);
  expect((await hpEntry(page, 'palisade', palisade.index))?.worn).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('sluice tier raises pan-out yield and out-earns two tier-1 rates', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-sluice');
  await grantGold(page, 200);
  const tier1 = await placeBuildableAt(page, 'sluice', -2, 7);
  const tier2 = await placeBuildableAt(page, 'sluice', 2, 7);
  const before = (await hpEntry(page, 'sluice', tier1.index))!;
  expect(before.panRateMult).toBe(1);
  expect(before.yieldPerCycle).toBe(Balance.sluice.goldPerCycle);

  await expect(upgrade(page, tier2)).resolves.toBe(true);
  const after = (await hpEntry(page, 'sluice', tier2.index))!;
  expect(after.tier).toBe(2);
  expect(after.panRateMult).toBe(Balance.tiers.sluice[1].panRateMult);
  expect(after.yieldPerCycle).toBe(Math.round(Balance.sluice.goldPerCycle * Balance.tiers.sluice[1].yieldMult));
  expect(sluiceRate(after)).toBeGreaterThan(sluiceRate(before) * 2);

  const sluiceState = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__?.build.sluicesState[index], tier2.index);
  expect(sluiceState?.panRateMult).toBe(Balance.tiers.sluice[1].panRateMult);
  expect(sluiceState?.yieldPerCycle).toBe(after.yieldPerCycle);

  const tier1Id = `sluice-${tier1.index + 1}`;
  const tier2Id = `sluice-${tier2.index + 1}`;
  await expect
    .poll(() => firstSluiceAmounts(page, [tier1Id, tier2Id]), { timeout: 8_000 })
    .toEqual({ [tier1Id]: before.yieldPerCycle, [tier2Id]: after.yieldPerCycle });
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

test('demolish refund ignores tier investment', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-refund');
  await grantGold(page, Balance.turret.costBase + Balance.tiers.turret[1].cost);
  const turret = await placeBuildableAt(page, 'turret', 0, 12);
  await expect(upgrade(page, turret)).resolves.toBe(true);

  await teleport(page, turret.position.x, turret.position.z);
  await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.demolish(id, index) ?? false, [turret.id, turret.index] as const)).resolves.toBe(true);

  expect(await gold(page)).toBe(Math.floor(Balance.demolish.refundPctOfCost * Balance.turret.costBase));
  await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('insufficient gold leaves tier and gold unchanged', async ({ page }) => {
  const errors = await openGame(page, 'bt-01-insufficient');
  await grantGold(page, Balance.palisade.cost);
  const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(await gold(page)).toBe(0);
  await teleport(page, palisade.position.x, palisade.position.z);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toContainText(`need ${Balance.tiers.palisade[1].cost}g`);
  await expect(upgrade(page, palisade)).resolves.toBe(false);
  expect(await gold(page)).toBe(0);
  expect((await hpEntry(page, 'palisade', palisade.index))?.tier).toBe(1);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect.poll(() => hpEntry(page, 'palisade', palisade.index)).toBeNull();
  expect(await gold(page)).toBe(Math.floor(Balance.demolish.refundPctOfCost * Balance.palisade.cost));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
