import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; sink?: string; source?: string; amount?: number };
type Rect = { x: number; y: number; width: number; height: number };
type HpEntry = {
  id: BuildableId;
  index: number;
  tier: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
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

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
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

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), { x, z });
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
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

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<HpEntry & { cost: number }> {
  await teleport(page, x, z + 2);
  const beforeCount = await buildableCount(page, id);
  const beforeLogLength = (await economyLog(page)).length;
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, id)).toBe(beforeCount + 1);
  const entries = await page.evaluate((buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === buildableId) ?? [], id);
  const entry = entries.find((candidate) => candidate.position.x === x && candidate.position.z === z);
  expect(entry).toBeTruthy();
  const spent = (await economyLog(page))
    .slice(beforeLogLength)
    .find((event) => event.type === 'gold_spent' && event.sink === `build_${id}`);
  expect(spent?.amount).toBeGreaterThan(0);
  return { ...(entry as HpEntry), cost: spent!.amount! };
}

function demolishRefund(cost: number, hp: number, maxHp: number): number {
  return Math.floor(Balance.demolish.refundPctOfCost * cost * (hp / maxHp));
}

function intersects(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return false;
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function upgradeBuildable(page: Page, entry: HpEntry): Promise<void> {
  await teleport(page, entry.position.x, entry.position.z);
  await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.upgradeBuilding(id, index) ?? false, [entry.id, entry.index] as const)).resolves.toBe(
    true,
  );
  await expect.poll(() => hpEntry(page, entry.id, entry.index).then((next) => next?.tier ?? 0)).toBe(entry.tier + 1);
}

async function spawnStationaryWreckerAt(page: Page, entry: HpEntry): Promise<void> {
  await teleport(page, entry.position.x, entry.position.z);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0, wrecker: true }));
}

test('demolish refunds full-HP palisade and frees its footprint for replacement', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-full');
  await grantGold(page, 100);
  const built = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(built.cost).toBe(10);
  expect(built.hp).toBe(60);
  expect(built.maxHp).toBe(60);

  await teleport(page, 0, 11);
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(false);
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));

  const beforeDemolish = await gold(page);
  const expectedRefund = demolishRefund(built.cost, built.hp, built.maxHp);
  expect(expectedRefund).toBe(5);
  await teleport(page, built.position.x, built.position.z);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toContainText('Palisade');
  await expect(page.getByTestId('building-context-prompt')).toContainText('invested 10g');
  await expect(page.getByTestId('building-context-prompt')).toContainText('returns 5g');
  await page.getByTestId('demolish-confirm').click();
  await expect.poll(() => gold(page)).toBe(beforeDemolish + expectedRefund);
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(0);
  const granted = (await economyLog(page)).filter((event) => event.type === 'gold_granted').at(-1);
  expect(granted).toMatchObject({ type: 'gold_granted', source: 'demolish', amount: expectedRefund });

  const replacement = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(replacement.position).toEqual({ x: 0, z: 9 });
  expect(await buildableCount(page, 'palisade')).toBe(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('demolish button removes an assay office without stealing the bench Enter path', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-assay');
  await grantGold(page, 200);
  const built = await placeBuildableAt(page, 'assay_office', 0, 7);
  expect({ costPaid: built.cost, hp: built.hp, maxHp: built.maxHp }).toEqual({ costPaid: 80, hp: 60, maxHp: 60 });
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const neighbor = await placeBuildableAt(page, 'palisade', 2, 7);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));

  const beforeEnter = await gold(page);
  await teleport(page, 1.2, 7);
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toContainText('Palisade');
  expect(intersects(await page.getByTestId('assay-office-prompt').boundingBox(), await page.getByTestId('building-context-prompt').boundingBox())).toBe(false);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect.poll(() => hpEntry(page, neighbor.id, neighbor.index)).not.toBeNull();
  expect(await gold(page)).toBe(beforeEnter);
  await page.getByTestId('assay-close').click();
  await expect(page.getByTestId('assay-bench')).toBeHidden();

  const beforeDemolish = await gold(page);
  const expectedRefund = demolishRefund(built.cost, built.hp, built.maxHp);
  expect(expectedRefund).toBe(40);
  await teleport(page, built.position.x, built.position.z);
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  await expect(page.getByTestId('building-context-prompt')).toContainText('Assay Office');
  await page.getByTestId('demolish-confirm').click();
  await expect.poll(() => gold(page)).toBe(beforeDemolish + expectedRefund);
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  await expect.poll(() => buildableCount(page, 'assay_office')).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('building context bar keeps both actions inside a mid-size phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 844 });
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-mid-phone');
  await grantGold(page, 100);
  const built = await placeBuildableAt(page, 'palisade', 0, 9);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await teleport(page, built.position.x, built.position.z);
  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeVisible();

  const promptBox = await prompt.boundingBox();
  expect(promptBox).not.toBeNull();
  const buttonBoxes = await prompt.locator('button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { x: rect.x, right: rect.right };
    }),
  );
  for (const box of buttonBoxes) {
    expect(box.x).toBeGreaterThanOrEqual(promptBox!.x);
    expect(box.right).toBeLessThanOrEqual(promptBox!.x + promptBox!.width);
    expect(box.right).toBeLessThanOrEqual(480);
  }
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('tiered full-HP sluice refunds base cost only and shows the loss', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-tiered-full');
  const baseCost = Balance.sluice.cost;
  const tierCost = Balance.tiers.sluice[1].cost;
  await grantGold(page, baseCost + tierCost);
  const built = await placeBuildableAt(page, 'sluice', 0, 7);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await upgradeBuildable(page, built);

  const upgraded = (await hpEntry(page, built.id, built.index))!;
  expect(upgraded.tier).toBe(2);
  const expectedRefund = demolishRefund(baseCost, upgraded.hp, upgraded.maxHp);
  expect(expectedRefund).toBe(20);
  await teleport(page, upgraded.position.x, upgraded.position.z);
  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('Sluice Works · Tier 2');
  await expect(prompt).toContainText('need 320g');
  await expect(prompt).toContainText('invested 160g');
  await expect(prompt).toContainText('returns 20g');
  await page.getByTestId('demolish-confirm').click();
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  const granted = (await economyLog(page)).filter((event) => event.type === 'gold_granted').at(-1);
  expect(granted).toMatchObject({ type: 'gold_granted', source: 'demolish', amount: expectedRefund });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('tiered half-HP sluice refund scales from base cost only', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-tiered-half');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('wreck.damage', 20);
    window.__GR_TEST__?.setBalance('wreck.hitCooldown', 999);
  });
  await grantGold(page, Balance.sluice.cost + Balance.tiers.sluice[1].cost);
  const built = await placeBuildableAt(page, 'sluice', 0, 7);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await upgradeBuildable(page, built);

  await spawnStationaryWreckerAt(page, built);
  await expect.poll(() => hpEntry(page, built.id, built.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(20);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());

  const damaged = (await hpEntry(page, built.id, built.index))!;
  const expectedRefund = demolishRefund(Balance.sluice.cost, damaged.hp, damaged.maxHp);
  expect(expectedRefund).toBe(10);
  await teleport(page, damaged.position.x, damaged.position.z);
  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('invested 160g');
  await expect(prompt).toContainText('returns 10g');
  await page.getByTestId('demolish-confirm').click();
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  const granted = (await economyLog(page)).filter((event) => event.type === 'gold_granted').at(-1);
  expect(granted).toMatchObject({ type: 'gold_granted', source: 'demolish', amount: expectedRefund });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('demolish scales refund by remaining HP after building damage', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-00-partial');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('wreck.damage', 15);
    window.__GR_TEST__?.setBalance('wreck.hitCooldown', 999);
  });
  await grantGold(page, 50);
  const built = await placeBuildableAt(page, 'palisade', 0, 9);

  await spawnStationaryWreckerAt(page, built);
  await expect.poll(() => hpEntry(page, built.id, built.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(45);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());

  const damaged = (await hpEntry(page, built.id, built.index))!;
  const expectedRefund = demolishRefund(built.cost, damaged.hp, damaged.maxHp);
  expect({ costPaid: built.cost, hp: damaged.hp, maxHp: damaged.maxHp, refund: expectedRefund }).toEqual({
    costPaid: 10,
    hp: 45,
    maxHp: 60,
    refund: 3,
  });
  const beforeDemolish = await gold(page);
  await teleport(page, damaged.position.x, damaged.position.z);
  await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.demolish(id, index), [built.id, built.index] as const)).resolves.toBe(true);
  await expect.poll(() => gold(page)).toBe(beforeDemolish + expectedRefund);
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
