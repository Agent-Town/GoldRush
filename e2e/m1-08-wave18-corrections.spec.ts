import { expect, test, type Page } from '@playwright/test';

type Diagnostics = NonNullable<Window['__THREE_GAME_DIAGNOSTICS__']>;

const coreMax: Record<string, number> = {
  double_tap_coil: 3,
  heavy_spark: 3,
  long_resonator: 2,
  split_spark: 2,
  tinkers_plating: 3,
  spring_heels: 3,
  pan_legend: 2,
  prospectors_luck: 2,
  beacon_dynamo: 2,
};
const fillerIds = ['assay_bonus', 'field_dressing', 'sharpen'];

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

async function openGame(page: Page, query = '?debug&nowaves&seed=m1-08'): Promise<{ consoleErrors: string[]; pageErrors: string[] }> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function diagnostics(page: Page): Promise<Diagnostics> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function offerIds(page: Page): Promise<string[]> {
  return page.$$eval('[data-testid^="upgrade-card-"]', (cards) =>
    cards
      .filter((card) => card.getAttribute('data-upgrade-id'))
      .map((card) => (card as HTMLElement).dataset.upgradeId ?? ''),
  );
}

async function pickIndex(page: Page, index: number): Promise<void> {
  await page.keyboard.press(`Digit${index + 1}`);
}

async function grantOneLevel(page: Page): Promise<void> {
  const state = await diagnostics(page);
  await page.evaluate((amount) => window.__GR_TEST__?.grantXp(amount), Math.max(1, state.progression.xpNeed - state.progression.xpInto));
}

async function ensureBeacon(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.grantGold(70));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect.poll(async () => (await diagnostics(page)).build.ghostValid).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await expect.poll(async () => (await diagnostics(page)).build.beacons).toBeGreaterThanOrEqual(1);
}

async function panTicks(page: Page, gold: number): Promise<void> {
  const node = await page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    const nodes = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((entry) => entry.active) ?? [];
    nodes.sort((a, b) => {
      const adx = a.position.x - hero.x;
      const adz = a.position.z - hero.z;
      const bdx = b.position.x - hero.x;
      const bdz = b.position.z - hero.z;
      return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
    });
    return nodes[0]?.position;
  });
  expect(node).toBeTruthy();
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), node!);
  await expect.poll(async () => (await diagnostics(page)).harvest.channeling, { timeout: 5_000 }).toBe(true);
  await expect.poll(async () => (await diagnostics(page)).economy.summary.panned, { timeout: 6_000 }).toBeGreaterThanOrEqual(gold);
}

async function forceDeath(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 999));
  await page.evaluate(() => {
    for (let i = 0; i < 3; i += 1) window.__GR_TEST__?.spawnPack(5, 0.35);
  });
  await expect.poll(async () => (await diagnostics(page)).runState, { timeout: 12_000 }).toBe('dead');
}

async function maxCoreUpgrades(page: Page): Promise<void> {
  // Fast path: instantly max all non-filler upgrades via the test hook, skipping
  // the ~22 sequential UI picks that blow the sandbox's 45s per-call wall.
  await page.evaluate(() => window.__GR_TEST__?.maxUpgrades());
  await expect
    .poll(async () => {
      const stacks = (await diagnostics(page)).progression.stacks;
      return Object.entries(coreMax).every(([id, max]) => (stacks[id] ?? 0) >= max);
    })
    .toBe(true);
}

async function offerFillers(page: Page): Promise<string[]> {
  if ((await diagnostics(page)).runState !== 'levelup') {
    await grantOneLevel(page);
    await expect.poll(async () => (await diagnostics(page)).runState).toBe('levelup');
  }
  return offerIds(page);
}

async function pickOfferId(page: Page, id: string): Promise<void> {
  const ids = await offerIds(page);
  const index = ids.indexOf(id);
  expect(index).toBeGreaterThanOrEqual(0);
  await pickIndex(page, index);
}

test('death ledger derives lifetime panned, spent, and beacons from economy log', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=m1-08-ledger');
  await page.evaluate(() => window.__GR_TEST__?.clearScores());

  await panTicks(page, 10);
  // Leave the seam BEFORE building: the ghost is overlap-invalid on a node, and
  // channeling would keep adding pan ticks (race). Captured panned stays exact.
  await page.evaluate(() => window.__GR_TEST__?.teleport(3, 12));
  await expect.poll(async () => (await diagnostics(page)).harvest.channeling).toBe(false);
  const panned = (await diagnostics(page)).economy.summary.panned;
  expect(panned).toBeGreaterThanOrEqual(10);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(15));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect.poll(async () => (await diagnostics(page)).build.ghostValid).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await expect.poll(async () => (await diagnostics(page)).economy.summary.spent).toBe(25);

  await forceDeath(page);
  const state = await diagnostics(page);
  expect(state.deathLedger.goldPanned).toBe(panned); // lifetime panned, NOT held at death
  expect(state.deathLedger.goldPanned).not.toBe(state.economy.gold); // held = panned + 15 - 25
  expect(state.deathLedger.spent).toBe(25);
  expect(state.deathLedger.beaconsBuilt).toBe(1);
  await expect(page.locator('[data-death-gold]')).toContainText(String(panned));
  await expect(page.locator('[data-death-spent]')).toContainText('25');
  await expect(page.locator('[data-death-beacons-built]')).toContainText('1');
  await expect(page.getByTestId('best-claim-row').first()).toContainText(`${panned} gold`);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('summarizeLog reports exact panned granted spent and beacon counts', async ({ page }) => {
  await openGame(page, '?debug&nowaves&nolevel&seed=m1-08-summary');
  const summary = await page.evaluate(() =>
    window.__GR_TEST__?.summarizeLog([
      { id: '00000000-0000-4000-8000-000000000001', at: 1, type: 'gold_panned', nodeId: 'a', amount: 10 },
      { id: '00000000-0000-4000-8000-000000000002', at: 2, type: 'gold_granted', source: 'upgrade_assay', amount: 15 },
      { id: '00000000-0000-4000-8000-000000000003', at: 3, type: 'gold_spent', sink: 'build_sentry_beacon', amount: 25 },
      { id: '00000000-0000-4000-8000-000000000004', at: 4, type: 'gold_granted', source: 'debug', amount: 5 },
    ]),
  );
  // M2-05 widened EconomySummary additively (repairSpent/repairs — sanctioned by the 009 firewall).
  // Strict deep-equality kept: new fields asserted at their no-repair values (s25 gate, s23 amend-don't-weaken law).
  expect(summary).toEqual({
    panned: 10,
    sluiced: 0,
    granted: 20,
    stolen: 0,
    reclaimed: 0,
    spent: 25,
    baseValue: 25,
    buildingsBuilt: 1,
    beaconsBuilt: 1,
    repairSpent: 0,
    repairs: 0,
  });
});

test('exhausted core pool offers three distinct pickable filler cards', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-08-exhaust');
  await ensureBeacon(page);
  await maxCoreUpgrades(page);

  const ids = await offerFillers(page);
  expect(ids).toHaveLength(3);
  expect(new Set(ids).size).toBe(3);
  expect(ids.every((id) => fillerIds.includes(id))).toBe(true);

  await pickIndex(page, 0);
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('playing');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('zero offerable upgrades consume the level without freezing', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-08-zero');
  await page.evaluate(() => window.__GR_TEST__?.setFillersDisabled(true));
  await ensureBeacon(page);
  await maxCoreUpgrades(page);

  const before = await diagnostics(page);
  await grantOneLevel(page);
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('playing');
  await expect(page.getByTestId('upgrade-overlay')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(async () => (await diagnostics(page)).timeAlive, { timeout: 2_000 }).toBeGreaterThan(before.timeAlive);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('filler cards grant assay gold and capped field dressing healing', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-08-fillers');
  await ensureBeacon(page);
  await maxCoreUpgrades(page);

  await offerFillers(page);
  const beforeAssay = await diagnostics(page);
  const w = beforeAssay.wave;
  const assayGold = 5 * Math.max(1, w);
  const goldBefore = beforeAssay.economy.gold;
  await pickOfferId(page, 'assay_bonus');
  await expect.poll(async () => (await diagnostics(page)).economy.gold).toBe(goldBefore + assayGold);
  const log = await page.evaluate(
    () =>
      (window.__GR_TEST__?.economyLog() ?? []) as Array<{
        type?: string;
        source?: string;
        amount?: number;
      }>,
  );
  expect(log.some((event) => event.type === 'gold_granted' && event.source === 'upgrade_assay' && event.amount === assayGold)).toBe(true);
  while ((await diagnostics(page)).runState === 'levelup') await pickIndex(page, 0);

  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 40));
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.35));
  await expect.poll(async () => (await diagnostics(page)).hp, { timeout: 5_000 }).toBeLessThan((await diagnostics(page)).maxHp);
  const hurt = await diagnostics(page);
  await grantOneLevel(page);
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('levelup');
  await pickOfferId(page, 'field_dressing');
  await expect.poll(async () => (await diagnostics(page)).hp).toBe(Math.min(hurt.maxHp, hurt.hp + Math.round(0.3 * hurt.maxHp)));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wave-10 tuned beacons and hero clear a small clump without chewing hero down', async ({ page }) => {
  test.setTimeout(35_000);
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=m1-08-beacon-tune');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.hp', 87));
  await page.evaluate(() => window.__GR_TEST__?.setBalance('beacon.damage', 10));
  await page.evaluate(() => window.__GR_TEST__?.setBalance('beacon.damagePerWave', 0.75));
  await page.evaluate(() => window.__GR_TEST__?.setBeaconWave(10));
  await page.evaluate(() => window.__GR_TEST__?.grantGold(70));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect.poll(async () => (await diagnostics(page)).build.ghostValid).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await page.evaluate(() => window.__GR_TEST__?.teleport(3, 12));
  await expect.poll(async () => (await diagnostics(page)).build.ghostValid).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await expect.poll(async () => (await diagnostics(page)).build.beacons).toBe(2);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(3, 6));
  await expect.poll(async () => (await diagnostics(page)).enemiesAlive, { timeout: 12_000 }).toBe(0);
  expect((await diagnostics(page)).hp).toBeGreaterThanOrEqual(50);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
