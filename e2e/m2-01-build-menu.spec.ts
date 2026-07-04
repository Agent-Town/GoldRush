import { expect, test, type Page, type TestInfo } from '@playwright/test';

type BuildableId = 'sentry_beacon' | 'palisade';
type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

type Rect = { x: number; y: number; width: number; height: number };
type WallTracker = {
  crossedThrough: boolean;
  reached: boolean;
  done: boolean;
  samples: number;
  last: { x: number; z: number } | null;
};

declare global {
  interface Window {
    __M2_01_TRACKER__?: WallTracker;
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

async function openGame(page: Page, query = '?debug&timescale=3&nowaves'): Promise<ErrorBucket> {
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
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function openBuildMenu(page: Page): Promise<void> {
  await page.keyboard.press('KeyB');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? false)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? false)).toBe(true);
}

async function selectFromMenu(page: Page, id: BuildableId): Promise<void> {
  await page.keyboard.press(id === 'palisade' ? 'Digit2' : 'Digit1');
  await expect.poll(() => selectedBuildable(page)).toBe(id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? true)).toBe(false);
}

async function selectedBuildable(page: Page): Promise<string | undefined> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => selectedBuildable(page)).toBe(id);
  await placeSelected(page, id);
}

async function placeSelected(page: Page, id: BuildableId): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  const before = await buildableCount(page, id);
  await page.keyboard.press('Enter');
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function closeBuild(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? true)).toBe(false);
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test('menu places a palisade and logs build_palisade spend', async ({ page }, testInfo: TestInfo) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-palisade');
  await grantGold(page, 20);

  await openBuildMenu(page);
  await testInfo.attach('m2-01-desktop-menu-open', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await selectFromMenu(page, 'palisade');
  await placeSelected(page, 'palisade');

  expect(await gold(page)).toBe(10);
  const spent = await page.evaluate(() =>
    (window.__GR_TEST__?.economyLog() ?? []).filter((event) => {
      const entry = event as { type?: string };
      return entry.type === 'gold_spent';
    }),
  );
  expect(spent.at(-1)).toMatchObject({ type: 'gold_spent', sink: 'build_palisade', amount: 10 });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('palisade footprint rejects overlap while allowing edge-touch chaining', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-palisade-footprint');
  await grantGold(page, 50);

  await placeBuildableAt(page, 'palisade', 0, 9);

  await teleport(page, 0, 12);
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await page.keyboard.press('Enter');
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(1);
  expect(await gold(page)).toBe(40);

  await placeBuildableAt(page, 'palisade', 0, 12);
  expect(await buildableCount(page, 'palisade')).toBe(2);
  expect(await gold(page)).toBe(30);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('beacon cost curve stays intact through the menu', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-beacon-cost');
  await grantGold(page, 80);

  await openBuildMenu(page);
  await selectFromMenu(page, 'sentry_beacon');
  await placeSelected(page, 'sentry_beacon');
  expect(await gold(page)).toBe(55);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(35);

  await closeBuild(page);
  await teleport(page, 3, 12);
  await openBuildMenu(page);
  await selectFromMenu(page, 'sentry_beacon');
  await placeSelected(page, 'sentry_beacon');

  expect(await gold(page)).toBe(20);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(45);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('single enemy slides around a finite palisade line without passing through', async ({ page }, testInfo: TestInfo) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nokill&seed=m2-01-wall');
  await grantGold(page, 100);

  for (const x of [-2, -1, 0, 1, 2]) {
    await placeBuildableAt(page, 'palisade', x, 9);
  }
  await testInfo.attach('m2-01-palisade-line', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await teleport(page, 0, 12);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 6));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);

  await page.evaluate(() => {
    const start = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    window.__M2_01_TRACKER__ = {
      crossedThrough: false,
      reached: false,
      done: false,
      samples: 0,
      last: null,
    };

    const tick = () => {
      const tracker = window.__M2_01_TRACKER__!;
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      if (enemy) {
        const last = tracker.last;
        if (last && last.z <= 10.5 && enemy.z > 10.5 && Math.abs(enemy.x) <= 3.18) {
          tracker.crossedThrough = true;
        }
        const dx = enemy.x;
        const dz = enemy.z - 12;
        tracker.reached ||= dx * dx + dz * dz <= 1.25 * 1.25;
        tracker.last = { x: enemy.x, z: enemy.z };
        tracker.samples += 1;
      }
      if (!tracker.reached && now - start < 20) requestAnimationFrame(tick);
      else tracker.done = true;
    };
    requestAnimationFrame(tick);
  });

  await expect.poll(() => page.evaluate(() => window.__M2_01_TRACKER__?.done ?? false), { timeout: 8_000 }).toBe(true);
  const tracker = await page.evaluate(() => window.__M2_01_TRACKER__);
  expect(tracker?.samples).toBeGreaterThan(0);
  expect(tracker?.crossedThrough).toBe(false);
  expect(tracker?.reached).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('390px build menu is visible, tappable, and clear of HUD controls', async ({ page }, testInfo: TestInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-mobile');
  await grantGold(page, 20);

  await page.getByTestId('hud-build').click();
  const menu = page.getByTestId('hud-build-menu');
  await expect(menu).toBeVisible();
  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  if (!menuBox) return;

  for (const id of ['sentry_beacon', 'palisade'] as const) {
    const box = await page.getByTestId(`hud-build-tile-${id}`).boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  for (const locator of [
    page.getByTestId('hud-vitals'),
    page.getByTestId('hud-gold'),
    page.getByTestId('hud-xp'),
    page.locator('#touch-stick'),
    page.locator('#confirm-button'),
  ]) {
    const box = await locator.boundingBox();
    if (box) expect(intersects(menuBox, box)).toBe(false);
  }

  await testInfo.attach('m2-01-390-menu', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.getByTestId('hud-build-tile-palisade').click();
  await expect.poll(() => selectedBuildable(page)).toBe('palisade');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? false)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('stress draw calls stay under 200 with palisades and beacons', async ({ page }) => {
  // s16 retro-gate: 120-enemy stress spawn + 8-buildable loop legitimately runs
  // ~38s wall on slow VMs (proof-of-innocence in reviews/vp-02-retro-gate.md);
  // the 30s default flakes under load while the draw-call budget itself holds.
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=3&nowaves&nokill&stress=120&seed=m2-01-draws');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBeGreaterThan(0);
  await grantGold(page, 600);

  for (const x of [-8, -5, -2, 2, 5, 8]) {
    await placeBuildableAt(page, 'sentry_beacon', x, 10);
  }
  for (const x of [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]) {
    await placeBuildableAt(page, 'palisade', x, 16);
  }

  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 999)).toBeLessThanOrEqual(200);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
