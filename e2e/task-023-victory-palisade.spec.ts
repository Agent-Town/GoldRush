import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type WallProbe = {
  crossedThrough: boolean;
  reached: boolean;
  done: boolean;
  samples: number;
  last: { x: number; z: number } | null;
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
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  return errors;
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function fastToSecure(page: Page): Promise<void> {
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'waves.waveInterval', 0.35);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'waves.pulseBase', 1);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await setBalance(page, 'waves.edgesPerPulse', 1);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placePalisade(page: Page, x: number, z: number, rotated = false): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));
  if (rotated) await page.evaluate(() => window.__GR_TEST__?.rotateBuildGhost());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

test('live secure wave shows Claim Secured, Stay for the Rush resumes, and later death ends as rush', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=100&nolevel&seed=task-023-victory');
  await fastToSecure(page);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('[data-testid="claim-secured"] h1')).toHaveText('Claim Secured');
  await expect(page.getByTestId('stay-for-rush')).toContainText('Stay for the Rush');
  const secureWave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave ?? 0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave)).toBe(secureWave);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(true);
  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);

  await page.getByTestId('stay-for-rush').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 8_000 }).toBeGreaterThan(
    secureWave,
  );

  await setBalance(page, 'enemy.contactDamage', 999);
  await teleport(page, 0, 12);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 }));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason), { timeout: 8_000 }).toBe(
    'rush',
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('legacy meta profile still reaches the live Claim Secured ceremony', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gr.meta.v1', JSON.stringify({ territory: 2, science: 1, hero: 0, agent: 0 }));
  });
  const errors = await openGame(page, '?debug&timescale=20&nolevel&seed=task-023-legacy');
  await fastToSecure(page);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('[data-testid="claim-secured"] h1')).toHaveText('Claim Secured');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Bank Claim opens the secured ledger and secondary New Claim resets fresh', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=100&nolevel&seed=task-023-bank');
  await fastToSecure(page);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await setBalance(page, 'waves.waveInterval', 999);
  await page.getByTestId('bank-secured-claim').click();

  await expect(page.getByTestId('claim-secured')).toBeHidden();
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toHaveText('New Claim');
  await page.getByTestId('run-secondary-action').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? true)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('secured');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(false);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Claim Secured cannot be bypassed by a pending level-up', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=100&nokill&seed=task-023-secure-levelup');
  await fastToSecure(page);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  const securedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.grantXp(12));
  await page.waitForTimeout(200);

  await expect(page.getByTestId('claim-secured')).toBeVisible();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.offer)).toBeNull();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0)).toBe(securedAt);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Claim Secured blocks gameplay input behind the modal', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=100&nolevel&seed=task-023-secure-input');
  await fastToSecure(page);
  await grantGold(page, 40);
  await teleport(page, 0, 11);
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  const before = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? -1,
    palisades: window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? -1,
  }));
  await page.keyboard.press('Space');
  await page.waitForTimeout(100);

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? -1)).toBe(before.gold);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? -1)).toBe(before.palisades);
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('rotated palisade blocks as the mirrored unrotated footprint', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=task-023-wall');
  await setBalance(page, 'enemy.speed', 2.2);

  await assertWallProbe(page, 'unrotated', false, { x: 0, z: 5 }, { x: 0, z: 13 });
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await assertWallProbe(page, 'rotated', true, { x: -4, z: 9 }, { x: 4, z: 9 });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wrecker reach uses the rotated palisade rectangle, not the center radius', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=task-023-wrecker');
  await setBalance(page, 'wreck.damage', 1);
  await setBalance(page, 'wreck.hitCooldown', 0.2);
  await grantGold(page, 40);
  await placePalisade(page, 0, 9, true);

  await teleport(page, 0, 11.5);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.1, { wrecker: true, speedScale: 0 }));
  await waitForSim(page, 1.2);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0)).toBe(0);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await teleport(page, 0, 10.1);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.1, { wrecker: true, speedScale: 0 }));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 8_000 }).toBeGreaterThan(0);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function assertWallProbe(
  page: Page,
  name: 'unrotated' | 'rotated',
  rotated: boolean,
  start: { x: number; z: number },
  target: { x: number; z: number },
): Promise<void> {
  await grantGold(page, 20);
  await placePalisade(page, 0, 9, rotated);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await teleport(page, target.x, target.z);
  await page.evaluate(
    ({ name: probeName, target: probeTarget }) => {
      if (probeName === 'rotated') {
        window.__TASK_023_ROTATED__ = { crossedThrough: false, reached: false, done: false, samples: 0, last: null };
      } else {
        window.__TASK_023_UNROTATED__ = { crossedThrough: false, reached: false, done: false, samples: 0, last: null };
      }
      const startAt = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
      const tick = () => {
        const tracker = probeName === 'rotated' ? window.__TASK_023_ROTATED__! : window.__TASK_023_UNROTATED__!;
        const enemy = window.__GR_TEST__?.enemyPositions()[0];
        const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? startAt;
        if (enemy) {
          const last = tracker.last;
          if (probeName === 'rotated') {
            if (last && last.x <= 1.55 && enemy.x > 1.55 && Math.abs(enemy.z - 9) <= 0.75) tracker.crossedThrough = true;
          } else if (last && last.z <= 10.55 && enemy.z > 10.55 && Math.abs(enemy.x) <= 0.75) {
            tracker.crossedThrough = true;
          }
          const dx = enemy.x - probeTarget.x;
          const dz = enemy.z - probeTarget.z;
          tracker.reached ||= dx * dx + dz * dz <= 1.45 * 1.45;
          tracker.last = { x: enemy.x, z: enemy.z };
          tracker.samples += 1;
        }
        if (!tracker.reached && now - startAt < 14) requestAnimationFrame(tick);
        else tracker.done = true;
      };
      requestAnimationFrame(tick);
    },
    { name, target },
  );
  await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), start);
  await expect
    .poll(
      () =>
        page.evaluate((probeName) =>
          probeName === 'rotated' ? (window.__TASK_023_ROTATED__?.done ?? false) : (window.__TASK_023_UNROTATED__?.done ?? false),
        name),
      { timeout: 12_000 },
    )
    .toBe(true);
  const probe = await page.evaluate((probeName) =>
    probeName === 'rotated' ? window.__TASK_023_ROTATED__ : window.__TASK_023_UNROTATED__,
  name);
  expect(probe?.samples).toBeGreaterThan(0);
  expect(probe?.crossedThrough).toBe(false);
  expect(probe?.reached).toBe(true);
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target, start + seconds, {
    timeout: 10_000,
  });
}

declare global {
  interface Window {
    __TASK_023_ROTATED__?: WallProbe;
    __TASK_023_UNROTATED__?: WallProbe;
  }
}
