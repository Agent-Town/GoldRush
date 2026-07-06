import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'palisade' | 'turret';
type PerfTracker = {
  done: boolean;
  samples: number;
  p95: number;
  maxDrawCalls: number;
};

const artifactDir = path.resolve('artifacts/combat-readability');

declare global {
  interface Window {
    __CR_PERF__?: PerfTracker;
  }
}

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

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(
    true,
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
  await expect
    .poll(() =>
      page.evaluate(
        (target) => {
          const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
          return build?.ghostValid === true && Math.abs(build.ghostPos.x - target.x) < 0.05 && Math.abs(build.ghostPos.z - target.z) < 0.05;
        },
        { x, z },
      ),
    )
    .toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  if (testInfo.project.name !== 'desktop-chrome') return;
  fs.mkdirSync(artifactDir, { recursive: true });
  await page.screenshot({ path: path.join(artifactDir, `${name}.png`), fullPage: false });
}

async function waitForFrames(page: Page, frames = 8): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= target, start + frames);
}

async function samplePerf(page: Page, durationMs: number): Promise<PerfTracker> {
  await page.evaluate((duration) => {
    const frameMs: number[] = [];
    const started = performance.now();
    let last = 0;
    window.__CR_PERF__ = { done: false, samples: 0, p95: 0, maxDrawCalls: 0 };

    const tick = (ts: number) => {
      const tracker = window.__CR_PERF__!;
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (last > 0) frameMs.push(ts - last);
      last = ts;
      if (diagnostics) {
        tracker.samples += 1;
        tracker.maxDrawCalls = Math.max(tracker.maxDrawCalls, diagnostics.renderer.calls);
      }
      if (performance.now() - started < duration) {
        requestAnimationFrame(tick);
        return;
      }
      const sorted = [...frameMs].sort((a, b) => a - b);
      tracker.p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
      tracker.done = true;
    };
    requestAnimationFrame(tick);
  }, durationMs);
  await expect.poll(() => page.evaluate(() => window.__CR_PERF__?.done ?? false), { timeout: 10_000 }).toBe(true);
  return page.evaluate(() => window.__CR_PERF__!);
}

test('damaged building bars are visible at desktop and 390px', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=combat-bars');
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'wreck.damage', 35);
  await setBalance(page, 'wreck.hitCooldown', 999);
  await grantGold(page, 20);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBe(1);
  await teleport(page, 0, 6);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hpBarDetails.find((entry) => entry.id === 'palisade')))
    .toMatchObject({ visible: true, color: 'amber' });
  const detail = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hpBarDetails.find((entry) => entry.id === 'palisade'));
  expect(detail?.ratio).toBeLessThan(0.5);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hpBarsVisible)).toBe(true);

  await waitForFrames(page);
  await shot(page, testInfo, 'building-bar-desktop-worn-palisade');
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForFrames(page);
  await shot(page, testInfo, 'building-bar-390px');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('enemy hit flash and turret pulse diagnostics advance', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nopause&seed=combat-flash');
  await setBalance(page, 'combatReadability.enemyFlashSeconds', 0.8);
  await setBalance(page, 'enemy.hp', 100);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await teleport(page, 0, 12);
  const flashesBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.enemyHitFlashes ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 7));
  await expect
    .poll(() => page.evaluate((before) => (window.__THREE_GAME_DIAGNOSTICS__?.readability.enemyHitFlashes ?? 0) - before, flashesBefore), {
      timeout: 8_000,
    })
    .toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.activeEnemyFlashes ?? 0)).toBeGreaterThan(0);

  await grantGold(page, 50);
  await placeBuildableAt(page, 'turret', 0, 13);
  await teleport(page, 22, 22);
  const pulsesBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.turretPulses ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 9));
  await expect
    .poll(() => page.evaluate((before) => (window.__THREE_GAME_DIAGNOSTICS__?.readability.turretPulses ?? 0) - before, pulsesBefore), {
      timeout: 12_000,
    })
    .toBeGreaterThan(0);
  await shot(page, testInfo, 'turret-pulse');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('120-enemy flash stress stays inside draw-call and frame budget', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&stress=120&timescale=3&nowaves&nolevel&nopause&profile&seed=combat-stress');
  await setBalance(page, 'combatReadability.enemyFlashSeconds', 1);
  await setBalance(page, 'enemy.contactDamage', 0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBeGreaterThan(30);

  const baseline = await samplePerf(page, 1_250);
  const flashesBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.enemyHitFlashes ?? 0);
  await expect
    .poll(() => page.evaluate((before) => (window.__THREE_GAME_DIAGNOSTICS__?.readability.enemyHitFlashes ?? 0) - before, flashesBefore), {
      timeout: 8_000,
    })
    .toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.activeEnemyFlashes ?? 0)).toBeGreaterThan(0);
  await shot(page, testInfo, 'enemy-flash-mid-swarm');

  const flashing = await samplePerf(page, 1_250);
  expect(flashing.samples).toBeGreaterThan(10);
  expect(flashing.maxDrawCalls).toBeLessThanOrEqual(200);
  expect(flashing.p95).toBeLessThanOrEqual(Math.max(1, baseline.p95) * 1.15);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
