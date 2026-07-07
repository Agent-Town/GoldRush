import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/045');

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
  await page.addInitScript(
    ({ metaKey, researchKey, scoreKey }) => {
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 6, hero: 0, agent: 0 },
        }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: [], proposalSalt: 0 }));
    },
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY, scoreKey: SCOREBOARD_KEY },
  );
  await page.goto('/?debug&megaproject=dev&timescale=3&nolevel&nopause&seed=045');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 120);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setWave(0);
  });
  return errors;
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function waitForWave(page: Page, wave: number): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 12_000 })
    .toBeGreaterThanOrEqual(wave);
}

async function megaproject(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.megaproject);
}

test('debug dev megaproject reserves, funds, delays, completes, and persists', async ({ page }, testInfo) => {
  const errors = await openGame(page);

  const initial = await megaproject(page);
  expect(initial).toMatchObject({
    id: 'dev-stamp-mill-site',
    name: 'The Stamp Mill',
    unlocked: true,
    complete: false,
    stage: 0,
    totalStages: 2,
    funded: false,
    hp: 24,
    maxHp: 24,
  });
  expect(initial.siteFootprint).toEqual({ x: -6, z: 12, w: 3, d: 2 });

  const unfundedHitsBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0);
  await page.evaluate(() => {
    const footprint = window.__THREE_GAME_DIAGNOSTICS__!.megaproject.siteFootprint!;
    window.__GR_TEST__?.setBalance('waves.aliveCap', 60);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('wreck.damage', 999);
    window.__GR_TEST__?.teleport(footprint.x, footprint.z);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0, wrecker: true });
  });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0)).toBe(unfundedHitsBefore);
  expect((await megaproject(page)).delayTicks).toBe(0);
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
  });

  await page.evaluate(() => window.__GR_TEST__?.grantGold(100));
  await page.evaluate(() => {
    const footprint = window.__THREE_GAME_DIAGNOSTICS__!.megaproject.siteFootprint!;
    window.__GR_TEST__?.teleport(footprint.x, footprint.z + 2);
    window.__GR_TEST__?.selectBuildable('sentry_beacon');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.reservedFootprints[0]?.id)).toBe(
    'dev-stamp-mill-site',
  );

  expect(await page.evaluate(() => window.__GR_TEST__?.fundMegaproject())).toBe(true);
  await expect.poll(() => megaproject(page).then((site) => site.funded)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).toBe(90);
  expect(
    await page.evaluate(() =>
      (window.__GR_TEST__?.economyLog() ?? []).some(
        (event) =>
          typeof event === 'object' &&
          event !== null &&
          (event as { type?: string; sink?: string; amount?: number }).type === 'gold_spent' &&
          (event as { sink?: string }).sink === 'megaproject_dev-stamp-mill-site' &&
          (event as { amount?: number }).amount === 10,
      ),
    ),
  ).toBe(true);
  await screenshot(page, testInfo, 'site-stage-1');

  await page.evaluate(() => window.__GR_TEST__?.setBalance('waves.waveInterval', 1));
  await page.evaluate(() => window.__GR_TEST__?.setWave(0));
  await waitForWave(page, 1);
  expect((await megaproject(page)).ticksRemaining).toBe(1);
  await waitForWave(page, 2);
  expect((await megaproject(page)).ticksRemaining).toBe(1);
  await waitForWave(page, 3);
  expect(await megaproject(page)).toMatchObject({ stage: 1, funded: false, complete: false });

  const hitsBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0);
  await page.evaluate(() => {
    const wave = window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0;
    const footprint = window.__THREE_GAME_DIAGNOSTICS__!.megaproject.siteFootprint!;
    window.__GR_TEST__?.setBalance('waves.waveInterval', 120);
    window.__GR_TEST__?.setWave(wave);
    window.__GR_TEST__?.grantGold(10);
    window.__GR_TEST__?.fundMegaproject();
    window.__GR_TEST__?.setBalance('waves.aliveCap', 60);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('wreck.damage', 999);
    window.__GR_TEST__?.setBalance('wreck.hitCooldown', 120);
    window.__GR_TEST__?.teleport(footprint.x, footprint.z);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0, wrecker: true });
  });
  await expect
    .poll(() => page.evaluate((hits) => (window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0) > hits, hitsBefore), {
      timeout: 10_000,
    })
    .toBe(true);
  await expect.poll(() => megaproject(page).then((site) => site.delayTicks), { timeout: 10_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.swinging ?? 0)).toBeGreaterThan(0);
  await screenshot(page, testInfo, 'under-attack');
  expect(await megaproject(page)).toMatchObject({ stage: 1, funded: true, ticksRemaining: 2, delayTicks: 1 });

  const waveBeforeDelay = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
  await page.evaluate((wave) => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 1);
    window.__GR_TEST__?.setWave(wave);
  }, waveBeforeDelay);
  await waitForWave(page, waveBeforeDelay + 1);
  expect(await megaproject(page)).toMatchObject({ ticksRemaining: 2, delayTicks: 0 });
  await waitForWave(page, waveBeforeDelay + 2);
  expect((await megaproject(page)).ticksRemaining).toBe(1);
  await waitForWave(page, waveBeforeDelay + 3);
  expect(await megaproject(page)).toMatchObject({ stage: 2, funded: false, complete: true });
  await screenshot(page, testInfo, 'complete');

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await megaproject(page)).toMatchObject({ stage: 2, complete: true, funded: false });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
