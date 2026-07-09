import { expect, test, type Page } from '@playwright/test';

async function waitForGame(page: Page): Promise<void> {
  await page.goto('/?nowaves&nolevel');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

function collectPageErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

async function spawnDebugPack(page: Page): Promise<void> {
  await page.keyboard.press('KeyT');
}

async function waitForDeath(page: Page): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state), { timeout: 25_000 })
    .toBe('dead');
}

test('T spawns Claim Jumpers, contact kills hero, R restarts in place', async ({ page }) => {
  const errors = collectPageErrors(page);
  await waitForGame(page);

  // Since m1/02 the Spark Rig fights back: overwhelm immediately so contact
  // damage outpaces the rig (iframes cap intake at ~16 dmg/s -> death ~6.5s).
  await spawnDebugPack(page);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBeGreaterThan(0);
  for (let i = 0; i < 5; i += 1) {
    await spawnDebugPack(page);
  }

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 100), { timeout: 10_000 })
    .toBeLessThan(100);

  await waitForDeath(page);
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('stake-again')).toContainText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toContainText('Try Again');

  await page.keyboard.press('KeyR');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp)).toBe(100);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('nospawn blocks debug packs', async ({ page }) => {
  await page.goto('/?nospawn&nowaves');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await spawnDebugPack(page);
  await page.waitForTimeout(250);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spawnDisabled)).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
});

test('double restart recycles enemies without geometry growth', async ({ page }) => {
  await page.goto('/?debug&timescale=4&nowaves&nolevel');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  // Warm the float-text pool first: kills during the swarm drop xp motes whose
  // pickup floats would otherwise lazily upload sprite geometry mid-test.
  await page.evaluate(() => window.__GR_TEST__?.warmVfx());
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);

  for (let cycle = 0; cycle < 3; cycle += 1) {
    // Keyboard KeyT spam collapses at headless fps (edge-triggered intents) and
    // since m1/02 the rig can out-kill a thin spawn; use the harness instead.
    await page.evaluate(() => {
      for (let pack = 0; pack < 5; pack += 1) window.__GR_TEST__?.spawnPack(5);
    });
    await waitForDeath(page);
    await page.keyboard.press('KeyR');
    await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
    await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  }

  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  expect(after).toBe(baseline);
});

test('stress=120 stays within pool and draw-call budget', async ({ page }) => {
  // F-028-1 (s49): &nokill added — 024-era damage tuning made the rig kill stress
  // enemies inside the settle window (96 -> 95 -> 94 decay, probed on pure HEAD),
  // so the exact pool-cap identity below was racing live combat. This test's intent
  // is pool cap + spawn integrity + draw calls + fps, NOT kill rate; nokill freezes
  // combat damage (proven harness flag, task-025/m2-05b precedent) and restores the
  // deterministic ===96. This red also fired lane-d's r2 "equivalence broken" verdict
  // on Mac — that evidence is retracted (see reviews/m6-actors-foundation-r2.md addendum).
  await page.goto('/?stress=120&nowaves&nokill');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForTimeout(1_000);
  const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  const frames = (snapshot?.frame ?? 0) - before;

  expect(snapshot?.stressCount).toBe(120);
  expect(snapshot?.enemiesAlive).toBe(96);
  expect(snapshot?.renderer.calls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200);
  // Headless SwiftShader renders this scene at ~17-22 fps regardless of entity count
  // (pre-M1 empty-scene baseline: 22). This floor catches sim-cost explosions only;
  // the real 60 fps gate runs on hardware at milestone playtests (CLAUDE.md §9).
  expect(frames).toBeGreaterThanOrEqual(12);
});
