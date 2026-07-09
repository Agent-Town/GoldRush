import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { LEGACY_SCOREBOARD_KEY, PROFILE_KEY, SCOREBOARD_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type BuildableEntry = { id: BuildableId; index: number; position: { x: number; z: number } };

const META_STORAGE_KEY = profileDataKey('robin', META_PROGRESS_KEY);

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
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function resetStorage(page: Page): Promise<void> {
  await page.goto('/?debug&seed=polish-02-reset');
  await page.evaluate(() => localStorage.clear());
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<BuildableEntry> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  const entry = await page.evaluate(
    (target) =>
      window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find(
        (candidate) =>
          candidate.id === target.id && candidate.position.x === target.x && candidate.position.z === target.z,
      ) ?? null,
    { id, x, z },
  );
  expect(entry).toBeTruthy();
  return entry as BuildableEntry;
}

async function forceDeath(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    for (let pack = 0; pack < 4; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.35);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
  await expect(page.getByTestId('death-overlay')).toBeVisible();
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function stageSecureRun(page: Page): Promise<void> {
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'waves.waveInterval', 999);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'waves.pulseBase', 1);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await setBalance(page, 'waves.edgesPerPulse', 1);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
}

async function triggerSecureWave(page: Page): Promise<void> {
  await setBalance(page, 'waves.waveInterval', 0.1);
  await page.evaluate((wave) => window.__GR_TEST__?.setWave(wave), Balance.run.secureWave - 1);
}

async function readJson<T>(page: Page, key: string, fallback: string): Promise<T> {
  return page.evaluate(([storageKey, missing]) => JSON.parse(localStorage.getItem(storageKey) ?? missing), [key, fallback] as const);
}

test('expanded run ledger mirrors economy replay and run diagnostics', async ({ page }) => {
  await resetStorage(page);
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=polish-02-ledger');
  await page.evaluate(() => window.__GR_TEST__?.clearScores());

  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ heavy_spark: 2, quick_fuse: 1 }));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.stacks.heavy_spark ?? 0)).toBe(2);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(20));
  await placeBuildableAt(page, 'palisade', 0, 9);
  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('palisade', 0))).resolves.toBe(true);

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.hp', 24);
    window.__GR_TEST__?.setBalance('enemy.speed', 0);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.spawnPack(1, 8, { speedScale: 0 });
  });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner.hero ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(0);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const expectedDamage = await page.evaluate(() => ({ ...(window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner ?? {}) }));
  await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__ as
      | (typeof window.__THREE_GAME_DIAGNOSTICS__ & { build: { damageByOwner: Record<string, number> } })
      | undefined;
    if (!diagnostics) return;
    diagnostics.economy.summary.baseValue = 0;
    diagnostics.economy.summary.buildingsBuilt = 0;
    diagnostics.build.damageByOwner = {};
  });

  await forceDeath(page);
  const replay = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      economy: diagnostics.economy.summary,
      wreck: diagnostics.wreck,
    };
  });

  await expect(page.locator('[data-death-gold]')).toContainText(String(replay.economy.panned));
  await expect(page.locator('[data-death-sluiced]')).toContainText(String(replay.economy.sluiced));
  await expect(page.locator('[data-death-stolen]')).toContainText(`${replay.economy.stolen} / ${replay.economy.reclaimed}`);
  await expect(page.locator('[data-death-spent]')).toContainText(String(replay.economy.spent));
  await expect(page.locator('[data-death-buildings]')).toContainText(
    `${replay.economy.buildingsBuilt} / ${replay.wreck.wrecked} / ${replay.economy.repairs}`,
  );
  await expect(page.locator('[data-death-damage]')).toContainText(
    `${Math.round(expectedDamage.hero ?? 0)} / ${Math.round(expectedDamage.hero_blast ?? 0)}`,
  );
  await expect(page.locator('[data-death-upgrades]')).toContainText('damage 2');
  await expect(page.locator('[data-death-upgrades]')).toContainText('blast 1');
  await expect(page.getByTestId('best-claim-row').first()).toContainText('10g base');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('profile-scoped v1 scores migrate to v2 as legacy records for the selected profile', async ({ page }) => {
  await resetStorage(page);
  const profileState: ProfileState = {
    version: 2,
    activeId: 'bob',
    profiles: [
      { id: 'alice', name: 'Alice', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
      { id: 'bob', name: 'Bob', createdAt: 2, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
    ],
  };
  await page.evaluate(
    ({ state, profileKey, aliceLegacyKey, bobLegacyKey }) => {
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(aliceLegacyKey, JSON.stringify([{ waves: 18, kills: 7, gold: 90, timeAlive: 180, at: 10 }]));
      localStorage.setItem(bobLegacyKey, JSON.stringify([{ waves: 30, kills: 70, gold: 900, timeAlive: 300, at: 20 }]));
    },
    {
      state: profileState,
      profileKey: PROFILE_KEY,
      aliceLegacyKey: profileDataKey('alice', LEGACY_SCOREBOARD_KEY),
      bobLegacyKey: profileDataKey('bob', LEGACY_SCOREBOARD_KEY),
    },
  );

  const errors = collectErrors(page);
  await page.goto('/?debug&profiles&nowaves&nolevel&seed=polish-02-profile-migrate');
  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await forceDeath(page);

  const board = (await page.getByTestId('best-claim-row').allTextContents()).join('\n');
  expect(board).toContain('wave 18');
  expect(board).toContain('legacy');
  expect(board).toContain('Alice');
  expect(board).not.toContain('Bob');
  expect(board).not.toContain('wave 30');

  const storage = await page.evaluate(
    ({ aliceV2, aliceV1, bobV2 }) => ({
      aliceV2: localStorage.getItem(aliceV2),
      aliceV1: localStorage.getItem(aliceV1),
      bobV2: localStorage.getItem(bobV2),
      rawKeys: Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)),
    }),
    {
      aliceV2: profileDataKey('alice', SCOREBOARD_KEY),
      aliceV1: profileDataKey('alice', LEGACY_SCOREBOARD_KEY),
      bobV2: profileDataKey('bob', SCOREBOARD_KEY),
    },
  );
  expect(JSON.parse(storage.aliceV2 ?? '[]').some((record: { legacy?: boolean }) => record.legacy === true)).toBe(true);
  expect(storage.aliceV1).toBeNull();
  expect(storage.bobV2).toBeNull();
  expect(storage.rawKeys).not.toContain(SCOREBOARD_KEY);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('base value replay subtracts demolished build cost before replacement', async ({ page }) => {
  await resetStorage(page);
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=polish-02-base-replay');
  await page.evaluate(() => {
    window.__GR_TEST__?.clearScores();
    window.__GR_TEST__?.grantGold(40);
  });

  const first = await placeBuildableAt(page, 'palisade', 0, 9);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), first.position);
  await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.demolish(id, index), [first.id, first.index] as const)).resolves.toBe(
    true,
  );
  const replacement = await placeBuildableAt(page, 'palisade', 0, 9);
  expect(replacement.position).toEqual({ x: 0, z: 9 });

  const replay = await page.evaluate(() => window.__GR_TEST__?.summarizeLog(window.__GR_TEST__?.economyLog() ?? []));
  expect(replay?.spent).toBe(20);
  expect(replay?.baseValue).toBe(10);
  const demolishEvent = await page.evaluate(() =>
    window.__GR_TEST__?.economyLog().find((event) => {
      const candidate = event as { type?: string; source?: string };
      return candidate.type === 'gold_granted' && candidate.source === 'demolish';
    }),
  );
  expect(demolishEvent).toMatchObject({ amount: 5, buildCost: 10 });

  await forceDeath(page);
  await expect(page.getByTestId('best-claim-row').first()).toContainText('10g base');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Best Claims sorts by wave before base value', async ({ page }) => {
  await resetStorage(page);
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=polish-02-sort');
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify([
        { waves: 12, kills: 10, gold: 40, timeAlive: 120, at: 1, baseValue: 20, weaponSplit: { spark: 5, blast: 0 } },
        { waves: 10, kills: 20, gold: 80, timeAlive: 160, at: 2, baseValue: 500, weaponSplit: { spark: 5, blast: 5 } },
        { waves: 12, kills: 8, gold: 30, timeAlive: 90, at: 3, baseValue: 200, weaponSplit: { spark: 0, blast: 10 } },
      ]),
    );
  }, SCOREBOARD_KEY);

  await forceDeath(page);
  const rows = await page.getByTestId('best-claim-row').allTextContents();
  expect(rows[0]).toContain('wave 12');
  expect(rows[0]).toContain('200g base');
  expect(rows[1]).toContain('wave 12');
  expect(rows[1]).toContain('20g base');
  expect(rows[2]).toContain('wave 10');
  expect(rows[2]).toContain('500g base');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('a single secured victory increments every meta track exactly once', async ({ page }) => {
  await resetStorage(page);
  const errors = await openGame(page, '?debug&timescale=100&nolevel&seed=polish-02-victory');
  await stageSecureRun(page);
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ heavy_spark: 1, quick_fuse: 1 }));
  await page.evaluate(() => window.__GR_TEST__?.grantGold(20));
  await placeBuildableAt(page, 'palisade', 0, 9);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.hp', 24);
    window.__GR_TEST__?.setBalance('enemy.speed', 0);
    window.__GR_TEST__?.spawnPack(1, 8, { speedScale: 0 });
  });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner.hero ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(0);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const frozenStats = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      economy: diagnostics.economy.summary,
      wreck: diagnostics.wreck,
      damage: { ...(diagnostics.build.damageByOwner ?? {}) },
    };
  });
  expect(frozenStats.economy.buildingsBuilt).toBe(1);
  expect(frozenStats.damage.hero ?? 0).toBeGreaterThan(0);
  await triggerSecureWave(page);

  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  const paidAtClaimOffice = await readJson<{ tracks: Record<string, number> }>(page, META_STORAGE_KEY, 'null');
  expect(paidAtClaimOffice.tracks).toMatchObject({ territory: 1, science: 1, hero: 1, agent: 1 });

  await setBalance(page, 'waves.waveInterval', 999);
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1)).toBe(0);
  await expect(page.getByTestId('stake-again')).toBeVisible();
  await expect(page.locator('[data-death-buildings]')).toContainText(
    `${frozenStats.economy.buildingsBuilt} / ${frozenStats.wreck.wrecked} / ${frozenStats.economy.repairs}`,
  );
  await expect(page.locator('[data-death-damage]')).toContainText(`${Math.round(frozenStats.damage.hero ?? 0)} / 0`);
  await expect(page.locator('[data-death-upgrades]')).toContainText('damage 1');
  await expect(page.locator('[data-death-upgrades]')).toContainText('blast 1');
  await page.getByTestId('run-secondary-action').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);

  const paidAfterLedger = await readJson<{ tracks: Record<string, number> }>(page, META_STORAGE_KEY, 'null');
  expect(paidAfterLedger.tracks).toMatchObject({ territory: 1, science: 1, hero: 1, agent: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks)).toMatchObject({
    territory: 1,
    science: 1,
    hero: 1,
    agent: 1,
  });

  const scores = await readJson<Array<{ secured?: boolean; waves?: number }>>(
    page,
    profileDataKey('robin', SCOREBOARD_KEY),
    '[]',
  );
  expect(scores.some((row) => row.secured === true && row.waves === Balance.run.secureWave)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
