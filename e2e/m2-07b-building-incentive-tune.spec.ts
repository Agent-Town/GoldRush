import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; sink?: string; amount?: number };
type HpEntry = {
  id: BuildableId;
  index: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
};

const blastIds = ['powder_charge', 'wide_ring', 'quick_fuse'] as const;

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
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function setBalances(page: Page, values: Record<string, number | boolean>, reset = true): Promise<void> {
  await page.evaluate(
    ({ entries, shouldReset }) => {
      for (const [key, value] of Object.entries(entries)) {
        if (!window.__GR_TEST__?.setBalance(key, value)) throw new Error(`Failed to set ${key}`);
      }
      if (shouldReset) window.__GR_TEST__?.resetRun();
    },
    { entries: values, shouldReset: reset },
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function hpEntries(page: Page, id: BuildableId): Promise<HpEntry[]> {
  return page.evaluate((family) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === family) ?? [], id);
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForFunction(
    (target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target,
    start + seconds,
    { timeout: 15_000 },
  );
}

async function offerIds(page: Page): Promise<string[]> {
  return page.$$eval('[data-testid^="upgrade-card-"]', (cards) =>
    cards.map((card) => (card as HTMLElement).dataset.upgradeId ?? ''),
  );
}

async function pressChoice(page: Page, index: number): Promise<void> {
  await page.keyboard.press(`Digit${index + 1}`);
}

function repairCost(buildCost: number, hp: number, maxHp: number): number {
  const missingFraction = (maxHp - hp) / maxHp;
  return Math.ceil(buildCost * Math.min(Balance.repair.capPctOfCost, Balance.repair.pctOfCost * missingFraction));
}

test('half-damaged sluice repairs for proportional global cost', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=m2-07b-repair');
  await setBalances(
    page,
    {
      'enemy.contactDamage': 0,
      'wreck.damage': Balance.wreck.hp.sluice / 2,
      'wreck.hitCooldown': 999,
    },
    false,
  );
  await grantGold(page, Balance.sluice.cost);
  await placeBuildableAt(page, 'sluice', 0, 7);

  await teleport(page, 0, 21);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await expect
    .poll(() => hpEntries(page, 'sluice').then((entries) => entries[0]?.hp), { timeout: 10_000 })
    .toBe(Balance.wreck.hp.sluice / 2);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());

  const [damaged] = await hpEntries(page, 'sluice');
  expect(damaged?.wrecked).toBe(false);
  const cost = repairCost(Balance.sluice.cost, damaged!.hp, damaged!.maxHp);
  expect(cost).toBe(5);
  // s30 gate harness fix (s23 assert-what-you-sampled law): the live sluice batches
  // gold_sluiced income to the bank DURING the repair dwell (013 §2 raises the rate),
  // so exact gold equality vs a pre-dwell sample is a race, not a defect probe.
  // Conservation stays EXACT: mark the log, sample {gold, log} atomically, assert
  // final == before + sluicedSinceMark (grant and debit cancel; the gold_spent event
  // assert below still pins the debit to exactly `cost`). Log mark-by-index is safe:
  // capacity 2048 >> events this scenario emits.
  const beforeState = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    logLength: (window.__GR_TEST__?.economyLog() ?? []).length,
  }));
  await grantGold(page, cost);
  await teleport(page, 0, 7);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 0)).toBeGreaterThan(0);
  await waitForSim(page, Balance.wreck.repairSeconds + 0.3);

  const [repaired] = await hpEntries(page, 'sluice');
  expect(repaired?.hp).toBe(repaired?.maxHp);
  const finalState = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    log: [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[],
  }));
  const sluicedSinceMark = finalState.log
    .slice(beforeState.logLength)
    .filter((event) => event.type === 'gold_sluiced')
    .reduce((sum, event) => sum + (event.amount ?? 0), 0);
  expect(finalState.gold).toBe(beforeState.gold + sluicedSinceMark);
  expect(finalState.log.some((event) => event.type === 'gold_spent' && event.sink === 'repair_sluice' && event.amount === cost)).toBe(
    true,
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('building-targeting bandits share the wave pressure budget', async ({ browser }) => {
  const noBase = await measureWave12HeroSeekers(browser, false);
  const withBase = await measureWave12HeroSeekers(browser, true);

  expect(withBase.wreckers).toBeGreaterThan(0);
  expect(withBase.heroSeekers).toBeLessThanOrEqual(noBase.heroSeekers);
  expect(noBase.errors.consoleErrors).toEqual([]);
  expect(noBase.errors.pageErrors).toEqual([]);
  expect(withBase.errors.consoleErrors).toEqual([]);
  expect(withBase.errors.pageErrors).toEqual([]);
});

test('blast cards enter offers and apply stacks', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&seed=m2-07b-blast-cards');
  await page.evaluate(() => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.grantXp(600);
  });
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();

  let picked: string | null = null;
  for (let guard = 0; guard < 12 && !picked; guard += 1) {
    const ids = await offerIds(page);
    const blast = ids.find((id) => blastIds.includes(id as (typeof blastIds)[number]));
    if (blast) {
      picked = blast;
      await pressChoice(page, ids.indexOf(blast));
      break;
    }
    await pressChoice(page, 0);
    await page.waitForTimeout(80);
  }

  expect(picked).not.toBeNull();
  await expect.poll(() => page.evaluate((id) => window.__THREE_GAME_DIAGNOSTICS__?.progression.stacks[id] ?? 0, picked!)).toBe(1);
  const stats = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.stats);
  expect(
    (stats?.blastDamageMult ?? 1) > 1 || (stats?.blastRadiusMult ?? 1) > 1 || (stats?.blastCooldownMult ?? 1) < 1,
  ).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('six blast stacks kill a wave-15 clump and log blast usage', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=16&nolevel&nopause&seed=m2-07b-blast-wave15');
  await setBalances(page, {
    'enemy.hp': 999,
    'enemy.speed': 0,
    'enemy.contactDamage': 0,
    'waves.waveInterval': 1,
    'waves.trickleInterval': 9999,
    'waves.pulseBase': 1,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'steal.minWave': 99,
    'wreck.minWave': 99,
  });
  await page.evaluate(() => window.__GR_TEST__?.maxUpgrades());
  const stacks = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.stacks ?? {});
  expect((stacks.powder_charge ?? 0) + (stacks.wide_ring ?? 0) + (stacks.quick_fuse ?? 0)).toBe(6);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(15);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await setBalance(page, 'enemy.hp', 35);
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    window.__GR_TEST__?.setBlastAim(hero.x, hero.z);
  });
  await waitForSim(page, 0.4);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(6, 0.35, { speedScale: 0 }));

  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.blastKills ?? 0)).toBeGreaterThanOrEqual(6);
  const arsenal = await page.evaluate(() => window.__GR_TEST__?.state().arsenal);
  expect(arsenal?.weaponToggles).toBe(1);
  expect(arsenal?.blastTime ?? 0).toBeGreaterThan(0);
  expect(arsenal?.blastDamage ?? 0).toBeGreaterThanOrEqual(35);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await setBalance(page, 'enemy.hp', 999);
  await setBalance(page, 'enemy.contactDamage', 200);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
  await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), hero);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 10_000 }).toBe('dead');
  const ledger = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.deathLedger);
  expect(ledger?.weaponToggles).toBe(1);
  expect(ledger?.blastTime ?? 0).toBeGreaterThan(0);
  await expect(page.locator('[data-death-weapon-toggles]')).toContainText('1');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function measureWave12HeroSeekers(browser: Browser, withBase: boolean): Promise<{
  heroSeekers: number;
  wreckers: number;
  errors: ErrorBucket;
}> {
  const page = await browser.newPage();
  const errors = await openGame(page, `?debug&timescale=12&nokill&nolevel&nopause&nosteal&seed=m2-07b-aggro-${withBase ? 'base' : 'kite'}`);
  await setBalances(page, {
    'enemy.speed': 0,
    'enemy.contactDamage': 0,
    'waves.waveInterval': 4,
    'waves.trickleInterval': 9999,
    'waves.pulseBase': 8,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.pressureBudgetShared': true,
    'wreck.minWave': 12,
    'wreck.pulseEvery': 1,
    'wreck.share': 0.5,
  });
  if (withBase) {
    await setBalance(page, 'palisade.cost', 0);
    await grantGold(page, 1);
    for (const x of [-3, -2, -1, 0, 1, 2]) await placeBuildableAt(page, 'palisade', x, 9);
  }

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 18_000 }).toBeGreaterThanOrEqual(11);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0);
  await expect
    .poll(
      () =>
        page.evaluate(
          (spawnedBefore) =>
            (window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0) >= 12 &&
            (window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0) > spawnedBefore,
          before,
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
  await page.waitForTimeout(150);
  const counts = await page.evaluate(() => {
    const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
    return {
      heroSeekers: enemies.filter((enemy) => !enemy.thief && !enemy.wrecker).length,
      wreckers: enemies.filter((enemy) => enemy.wrecker).length,
    };
  });
  await page.close();
  return { ...counts, errors };
}
