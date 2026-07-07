import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';

const QUERY = '?debug&timescale=40&nokill&nolevel&nosteal&nowreck&seed=run-suspend';
const SHOT_DIR = 'artifacts/run-suspend';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'palisade' | 'sentry_beacon' | 'stockpile';
type SavedSuspend = {
  wave: number;
  waveSystem: { waveSpawnedTotal: number };
  enemies: { active: unknown[] };
  economy: { gold: number; log: unknown[] };
  hero: { hp: number; level: number; xpInto: number; stacks: Record<string, number>; position: { x: number; z: number } };
  buildings: {
    id: string;
    tier: number;
    hp: number;
    maxHp: number;
    wrecked: boolean;
    position: { x: number; z: number };
  }[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function openGame(page: Page, query = QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThanOrEqual(amount);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function upgradeBuildableAt(page: Page, id: BuildableId, index: number, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  await expect(page.evaluate(([buildableId, buildingIndex]) => window.__GR_TEST__?.upgradeBuilding(buildableId, buildingIndex), [id, index] as const)).resolves.toBe(
    true,
  );
}

async function savedSuspend(page: Page): Promise<SavedSuspend> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY);
  expect(raw).toBeTruthy();
  return JSON.parse(raw!) as SavedSuspend;
}

async function savedSuspendRaw(page: Page): Promise<string> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY);
  expect(raw).toBeTruthy();
  return raw!;
}

async function writeSuspend(page: Page, raw: string): Promise<void> {
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [RUN_SUSPEND_KEY, raw] as const);
}

async function waitForSavedWave(page: Page, wave: number): Promise<SavedSuspend> {
  await page.waitForFunction(
    ([key, wanted]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        return (JSON.parse(raw) as { wave?: number }).wave === wanted;
      } catch {
        return false;
      }
    },
    [RUN_SUSPEND_KEY, wave] as const,
    { timeout: 12_000 },
  );
  const saved = await savedSuspend(page);
  expect(saved.wave).toBe(wave);
  return saved;
}

function comparableSuspend(snapshot: SavedSuspend): unknown {
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    wave: snapshot.wave,
    waveSpawnedTotal: snapshot.waveSystem.waveSpawnedTotal,
    enemiesAlive: snapshot.enemies.active.length,
    economy: {
      gold: snapshot.economy.gold,
      logLength: snapshot.economy.log.length,
    },
    hero: {
      hp: snapshot.hero.hp,
      x: round(snapshot.hero.position.x),
      z: round(snapshot.hero.position.z),
    },
    progression: {
      level: snapshot.hero.level,
      xpInto: snapshot.hero.xpInto,
      stacks: snapshot.hero.stacks,
    },
    buildHp: snapshot.buildings.map((entry) => ({
      id: entry.id,
      tier: entry.tier,
      hp: entry.hp,
      maxHp: entry.maxHp,
      wrecked: entry.wrecked,
      x: round(entry.position.x),
      z: round(entry.position.z),
    })),
  };
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

test('wave-boundary suspend restores state and matches the uninterrupted seeded run', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = await openGame(page);
  await grantGold(page, 600);
  await placeBuildableAt(page, 'stockpile', -3, 10);
  await placeBuildableAt(page, 'palisade', 0, 10);
  await upgradeBuildableAt(page, 'palisade', 0, 0, 10);
  await placeBuildableAt(page, 'sentry_beacon', 3, 10);
  await page.evaluate(() => window.__GR_TEST__?.grantXp(60));

  const saved = await waitForSavedWave(page, 3);
  const savedRaw = await savedSuspendRaw(page);
  const savedPalisade = saved.buildings.find((entry) => entry.id === 'palisade');
  expect(saved.economy.gold).toBeGreaterThan(0);
  expect(saved.buildings).toHaveLength(3);
  expect(savedPalisade?.tier).toBe(2);
  expect(savedPalisade?.maxHp).toBeGreaterThan(Balance.wreck.hp.palisade);
  expect(saved.hero.hp).toBe(Balance.hero.maxHp);

  const targetWave = saved.wave + 2;
  const resavedTargetWave = targetWave + 1;
  const uninterrupted = comparableSuspend(await waitForSavedWave(page, targetWave));
  const uninterruptedAfterResave = comparableSuspend(await waitForSavedWave(page, resavedTargetWave));

  await page.goto('/');
  await writeSuspend(page, savedRaw);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(
    (wave) =>
      window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true &&
      window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave,
    saved.wave,
  );
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(saved.economy.gold);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.length)).resolves.toBe(3);
  const restoredPalisade = await page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.index === 0),
  );
  expect(restoredPalisade?.maxHp).toBe(savedPalisade?.maxHp);
  await shot(page, testInfo, 'restore-moment');

  const restoredBoundary = await waitForSavedWave(page, targetWave);
  expect(comparableSuspend(restoredBoundary)).toEqual(uninterrupted);
  const restoredBoundaryRaw = await savedSuspendRaw(page);

  await page.goto('/');
  await writeSuspend(page, restoredBoundaryRaw);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction((wave) => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave, targetWave);
  const restoredAfterResave = await waitForSavedWave(page, resavedTargetWave);
  expect(comparableSuspend(restoredAfterResave)).toEqual(uninterruptedAfterResave);

  await page.goto('/');
  await writeSuspend(page, savedRaw);
  await page.reload();
  await expect(page.getByTestId('start-menu-continue')).toHaveText(`Continue Wave ${saved.wave}`);
  await expect(page.getByTestId('start-menu-saved-claim')).toContainText(`wave ${saved.wave}`);
  await shot(page, testInfo, 'menu-continue');
  await page.getByTestId('start-menu-continue').click();
  await page.waitForFunction((wave) => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave, saved.wave);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(saved.economy.gold);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('ended runs clear suspend and New Claim confirms abandoning a saved claim', async ({ page }) => {
  await clearStorage(page);
  const errors = await openGame(page);
  await grantGold(page, 80);
  await waitForSavedWave(page, 1);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.setBalance('run.secureWave', 2);
    window.__GR_TEST__?.resetRun();
  });
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 8_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).toBe(null);

  await openGame(page);
  await grantGold(page, 80);
  await waitForSavedWave(page, 1);
  const savedRaw = await savedSuspendRaw(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-continue')).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Abandon the saved claim at wave');
    await dialog.accept();
  });
  await page.getByTestId('start-menu-new-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).toBe(null);
  expect(savedRaw.length).toBeGreaterThan(200);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
