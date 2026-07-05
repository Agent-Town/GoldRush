import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=3&nowaves'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(amount);
}

async function setBuildMode(page: Page, on: boolean): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.setBuildMode(value), on);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? false)).toBe(on);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placeBeacon(page: Page): Promise<void> {
  await setBuildMode(page, true);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0);
  await page.keyboard.press('Enter');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(before + 1);
}

test('grant gold then keyboard-build places one Sentry Beacon for 25g', async ({ page }) => {
  const errors = await openGame(page);
  await grantGold(page, 30);

  await page.keyboard.press('KeyB');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? false)).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await page.keyboard.press('Enter');

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).toBe(5);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Sentry Beacon registers kills through combat with zero input', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-05-kills');
  await grantGold(page, 30);
  await placeBeacon(page);
  // Single Jumper: dumb bolts diffuse damage across a clump (first-in-pool within
  // radius eats the hit), so packs make beacon kills nondeterministic. One enemy
  // concentrates every bolt -> 4th kills, while the hero rig sits 30 m away.
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 2));
  await teleport(page, 0, -20);

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.beacons ?? 0), {
      timeout: 20_000,
    })
    .toBeGreaterThanOrEqual(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('river placement is rejected without spending gold', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-05-river');
  await grantGold(page, 30);
  await teleport(page, -12, 0);
  await setBuildMode(page, true);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).toBe(30);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons)).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Sentry Beacon cost escalates after each placement', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-05-cost');
  await grantGold(page, 80);

  await teleport(page, 0, 12);
  await placeBeacon(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).toBe(55);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(35);

  await teleport(page, 3, 12);
  await placeBeacon(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).toBe(20);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(45);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('resetRun clears Sentry Beacons, owner kills, and keeps renderer memory stable', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-05-reset');
  await page.evaluate(() => window.__GR_TEST__?.warmVfx());

  // Warm cycle: identical to the measured cycle. First renders lazily upload
  // geometries as the camera sweep brings meshes into view (probe: teleport
  // alone costs +1), so the leak gate baselines AFTER one full pass.
  const cycle = async () => {
    await page.evaluate(() => window.__GR_TEST__?.grantGold(80));
    await teleport(page, 0, 12);
    await placeBeacon(page);
    await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 2));
    await teleport(page, 0, -20);
    await expect
      .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.beacons ?? 0), {
        timeout: 20_000,
      })
      .toBeGreaterThanOrEqual(1);
    await page.evaluate(() => window.__GR_TEST__?.resetRun());
    await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? -1)).toBe(0);
  };

  await cycle();
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);

  // s30 gate harness fix (s27 law: global renderer counters are not pure functions
  // of the system under test). 016 made walk pairs cycle on ALL directions (hero and
  // jumpers) instead of freezing on idle-less ones, which doubled the lazy sprite-cell
  // matrix: which stride cell is on screen when a heading is crossed is phase-dependent,
  // so ONE warm cycle no longer deterministically saturates texture uploads (A/B s30:
  // HEAD passes, 016-only fails +2, vp-02's own warmed memory gate green). Geometries
  // stay EXACT from the first baseline — beacon meshes are the reset surface under
  // test. Textures follow the s27 warm -> grace -> zero-growth pattern: a grace cycle
  // absorbs remaining lazy depth, then the measured cycle must add ZERO textures. A
  // real leak (s27 pinned-overlay class, grows per cycle) still fails.
  const stableTextures = async (): Promise<number> => {
    let last = -1;
    await expect
      .poll(
        async () => {
          const current = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer?.textures ?? -1);
          const settled = current === last;
          last = current;
          return settled;
        },
        { intervals: [1000], timeout: 15_000 },
      )
      .toBe(true);
    return last;
  };

  await cycle(); // grace cycle — absorbs lazy sprite-cell depth
  const graceTextures = await stableTextures();

  await cycle(); // measured cycle
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.beacons ?? 0)).toBe(0);
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);
  expect(after?.geometries).toBe(baseline?.geometries);
  expect(await stableTextures()).toBe(graceTextures);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('resetRun clears active harvest channel progress', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-05-harvest');
  const target = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const hero = diagnostics?.heroPos ?? { x: 0, z: 0 };
    const nodes = diagnostics?.harvest.activeNodes.filter((node) => node.active) ?? [];
    nodes.sort((a, b) => {
      const adx = a.position.x - hero.x;
      const adz = a.position.z - hero.z;
      const bdx = b.position.x - hero.x;
      const bdz = b.position.z - hero.z;
      return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
    });
    return nodes[0]?.position ?? { x: 0, z: 12 };
  });

  await teleport(page, target.x, target.z);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false)).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0)).toBeGreaterThan(0);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? true)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channelNodeId)).toBe(null);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
