import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type XpAudit = NonNullable<Window['__THREE_GAME_DIAGNOSTICS__']>['xpAudit'];

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
  await page.goto('/?debug&timescale=24&nowaves&nolevel&nopause&seed=xp-audit');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function audit(page: Page): Promise<XpAudit> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.xpAudit);
}

function delta(after: XpAudit, before: XpAudit): XpAudit {
  return {
    deaths: after.deaths - before.deaths,
    motesSpawned: after.motesSpawned - before.motesSpawned,
    motesCollected: after.motesCollected - before.motesCollected,
    motesCollectedXp: after.motesCollectedXp - before.motesCollectedXp,
    overflowBanked: after.overflowBanked - before.overflowBanked,
    expiredBanked: after.expiredBanked - before.expiredBanked,
    autoBanked: after.autoBanked - before.autoBanked,
    dropped: after.dropped - before.dropped,
    xpAwarded: after.xpAwarded - before.xpAwarded,
    xpPerKill: after.xpPerKill,
    motePool: after.motePool,
    expiryBanks: after.expiryBanks,
  };
}

async function runDenseWindow(page: Page, wave: number): Promise<void> {
  await setBalance(page, 'xp.moteMagnetRadius', 0.5);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? -1)).toBe(0);
  await page.evaluate(() => {
    const w = window as unknown as { __xpFloatMax: number; __xpFloatTracking?: boolean };
    w.__xpFloatMax = 0;
    if (w.__xpFloatTracking) return;
    w.__xpFloatTracking = true;
    const tick = () => {
      w.__xpFloatMax = Math.max(w.__xpFloatMax, window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const before = await audit(page);

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(96, 6));
  await expect
    .poll(() => audit(page).then((state) => state.deaths - before.deaths), { timeout: 25_000 })
    .toBe(96);

  const killed = delta(await audit(page), before);
  expect(killed.motesSpawned).toBe(killed.motePool);
  expect(killed.motesCollected).toBe(0);
  expect(killed.overflowBanked).toBe(killed.deaths - killed.motePool);
  expect(killed.xpAwarded).toBe(killed.overflowBanked * killed.xpPerKill);
  expect(killed.dropped).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __xpFloatMax: number }).__xpFloatMax)).toBeGreaterThan(0);

  await setBalance(page, 'xp.moteMagnetRadius', 50);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpMotesAlive ?? -1), { timeout: 8_000 }).toBe(0);

  const collected = delta(await audit(page), before);
  expect(collected.motesCollected).toBe(collected.motePool);
  expect(collected.motesCollectedXp).toBe(collected.motePool * collected.xpPerKill);
  expect(collected.xpAwarded).toBe(collected.deaths * collected.xpPerKill);
  console.log(
    `[xp-audit] wave ${wave}: deaths=${collected.deaths} motes-spawned=${collected.motesSpawned} motes-collected=${collected.motesCollected} overflow-auto-banked=${collected.overflowBanked} xp=${collected.xpAwarded}`,
  );
}

test('seeded dense kill windows bank every death XP exactly once', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = await openGame(page);

  await setBalance(page, 'enemy.hp', 1);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'waves.aliveCap', 96);

  for (const wave of [5, 10, 14]) await runDenseWindow(page, wave);

  const final = await audit(page);
  expect(final.xpAwarded).toBe(final.deaths * final.xpPerKill);
  expect(final.dropped).toBe(0);
  expect(final.expiryBanks).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
