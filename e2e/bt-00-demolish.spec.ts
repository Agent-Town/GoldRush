import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; sink?: string; source?: string; amount?: number };
type HpEntry = {
  id: BuildableId;
  index: number;
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
  await expect(page.getByTestId('demolish-prompt')).toBeVisible();
  await expect(page.getByTestId('demolish-prompt')).toContainText('Tear down the palisade');
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
  await expect(page.getByTestId('demolish-prompt')).toBeVisible();
  await expect(page.getByTestId('demolish-prompt')).toContainText('Tear down the palisade');
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
  await expect(page.getByTestId('demolish-prompt')).toBeVisible();
  await expect(page.getByTestId('demolish-prompt')).toContainText('Tear down the assay office');
  await page.getByTestId('demolish-confirm').click();
  await expect.poll(() => gold(page)).toBe(beforeDemolish + expectedRefund);
  await expect.poll(() => hpEntry(page, built.id, built.index)).toBeNull();
  await expect.poll(() => buildableCount(page, 'assay_office')).toBe(0);
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

  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
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
