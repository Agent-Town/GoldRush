import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; sink?: string; amount?: number };
type BannerRecord = { text: string; at: number; time: number; wave: number; pulse: number };
type BannerTrack = { records: BannerRecord[]; lastText: string; lastAt: number };
type CapTrack = { max: number; samples: number };
type PulseRecord = { wave: number; pulse: number; lastPulseAt: number };
type PulseTrack = { records: PulseRecord[]; lastPulseAt: number };

const shotDir = path.resolve('reviews/shots-m2-05b');

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

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: false });
}

async function setBalance(page: Page, pathKey: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathKey, value] as const)).resolves.toBe(
    true,
  );
}

async function setBalances(page: Page, values: Record<string, number>, reset = true): Promise<void> {
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

async function placeStockpile(page: Page): Promise<void> {
  await setBalance(page, 'stockpile.cost', 0);
  await grantGold(page, 1);
  await placeBuildableAt(page, 'stockpile', 0, 12);
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
}

async function hpEntries(page: Page, id: BuildableId) {
  return page.evaluate((family) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === family) ?? [], id);
}

async function wreck(page: Page, id: BuildableId, index = 0): Promise<void> {
  await expect(page.evaluate(([family, i]) => window.__GR_TEST__?.wreck(family, i), [id, index] as const)).resolves.toBe(true);
  await expect
    .poll(() => hpEntries(page, id).then((entries) => entries.find((entry) => entry.index === index)?.wrecked ?? false))
    .toBe(true);
}

function repairCost(id: BuildableId): number {
  if (id === 'palisade') return Math.ceil(Balance.palisade.cost * Balance.wreck.repairCostFrac);
  if (id === 'sentry_beacon') return Math.ceil(Math.ceil(Balance.beacon.costBase / 5) * 5 * Balance.wreck.repairCostFrac);
  if (id === 'sluice') return Math.ceil(Balance.sluice.cost * Balance.wreck.repairCostFrac);
  if (id === 'stockpile') return Math.ceil(Balance.stockpile.cost * Balance.wreck.repairCostFrac);
  return Math.ceil(Math.ceil(Balance.turret.costBase / 5) * 5 * Balance.wreck.repairCostFrac);
}

async function installCapTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__M2_05B_CAP__ = { max: 0, samples: 0 };
    const tick = () => {
      const thieves = window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.thief).length ?? 0;
      window.__M2_05B_CAP__!.max = Math.max(window.__M2_05B_CAP__!.max, thieves);
      window.__M2_05B_CAP__!.samples += 1;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function installBannerTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state = window.__THREE_GAME_DIAGNOSTICS__;
    window.__M2_05B_BANNERS__ = {
      records: [],
      lastText: state?.ui?.announcement ?? '',
      lastAt: state?.ui?.announcementAt ?? -1,
    };
    const tick = () => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__;
      const track = window.__M2_05B_BANNERS__!;
      const text = snapshot?.ui?.announcement ?? '';
      const at = snapshot?.ui?.announcementAt ?? -1;
      if (text && (text !== track.lastText || at !== track.lastAt)) {
        track.records.push({
          text,
          at,
          time: snapshot?.timeAlive ?? 0,
          wave: snapshot?.wave ?? 0,
          pulse: snapshot?.pulse ?? 0,
        });
        track.lastText = text;
        track.lastAt = at;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function installPulseTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__M2_05B_PULSES__ = { records: [], lastPulseAt: Number.NEGATIVE_INFINITY };
    const tick = () => {
      const snapshot = window.__THREE_GAME_DIAGNOSTICS__;
      const track = window.__M2_05B_PULSES__!;
      const lastPulseAt = snapshot?.lastPulseAt ?? Number.NEGATIVE_INFINITY;
      if (Number.isFinite(lastPulseAt) && lastPulseAt !== track.lastPulseAt) {
        track.records.push({ wave: snapshot?.wave ?? 0, pulse: snapshot?.pulse ?? 0, lastPulseAt });
        track.lastPulseAt = lastPulseAt;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

test('scheduled thief flags never exceed the concurrency cap', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nokill&nolevel&nopause&nowreck&seed=m2-05b-cap');
  await setBalances(page, {
    'steal.minWave': 1,
    'steal.share': 1,
    'steal.maxConcurrent': 2,
    'steal.maxConcurrentPerWaves': 999,
    'steal.maxConcurrentCap': 2,
    'waves.waveInterval': 12,
    'waves.trickleInterval': 9999,
    'waves.pulseBase': 12,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 2,
  });
  await placeStockpile(page);
  await grantGold(page, 200);
  await installCapTracker(page);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  const track = await page.evaluate(() => window.__M2_05B_CAP__ as CapTrack);
  expect(track.samples).toBeGreaterThan(0);
  expect(track.max).toBeGreaterThan(0);
  expect(track.max).toBeLessThanOrEqual(2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wrecker pulses get a distinct telegraph and normal pulses do not', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nokill&nolevel&nopause&nosteal&seed=m2-05b-telegraph');
  await setBalances(page, {
    'wreck.minWave': 1,
    'wreck.pulseEvery': 2,
    'wreck.share': 1,
    'waves.waveInterval': 12,
    'waves.trickleInterval': 9999,
    'waves.pulseBase': 4,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 2,
    'waves.edgesPerPulse': 1,
    'waves.lullSeconds': 3,
  });
  await grantGold(page, 20);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await installBannerTracker(page);

  await expect
    .poll(() => page.evaluate(() => window.__M2_05B_BANNERS__?.records.some((record) => record.text.includes('Wrecking crew')) ?? false), {
      timeout: 14_000,
    })
    .toBe(true);
  await expect(page.getByTestId('hud-wave')).toContainText('Wrecking crew');
  await shot(page, 'wrecker-telegraph-banner');

  const records = await page.evaluate(() => window.__M2_05B_BANNERS__?.records ?? []);
  expect(records.some((record) => record.pulse === 1 && !record.text.includes('Wrecking crew'))).toBe(true);
  expect(records.some((record) => record.pulse === 1 && record.text.includes('Wrecking crew'))).toBe(false);
  expect(records.some((record) => record.pulse === 2 && record.text.includes('Wrecking crew'))).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('lullFloor12 only clamps post-wave-12 pulse spacing', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&nosteal&nowreck&seed=m2-05b-lull');
  await setBalances(page, {
    'waves.waveInterval': 4,
    'waves.trickleInterval': 9999,
    'waves.pulseBase': 2,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 2,
    'waves.edgesPerPulse': 1,
    'waves.lullSeconds': 0.5,
    'waves.lullFloor12': 2,
    'waves.aliveCap': 96,
  });
  await installPulseTracker(page);

  await expect
    .poll(() => page.evaluate(() => window.__M2_05B_PULSES__?.records.some((record) => record.wave >= 12 && record.pulse === 2) ?? false), {
      timeout: 15_000,
    })
    .toBe(true);
  const records = await page.evaluate(() => window.__M2_05B_PULSES__?.records ?? []);
  const wave1 = records.filter((record) => record.wave === 1);
  const wave12 = records.filter((record) => record.wave === 12);
  expect(wave1[1].lastPulseAt - wave1[0].lastPulseAt).toBeCloseTo(0.5, 4);
  expect(wave12[1].lastPulseAt - wave12[0].lastPulseAt).toBeGreaterThanOrEqual(2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('theft ping shows edge glyph, auto-hides, and debug flags suppress it', async ({ page }) => {
  let errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=m2-05b-ping');
  await placeStockpile(page);
  await grantGold(page, 100);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);

  await expect(page.getByTestId('hud-wave')).toContainText('Gold snatched', { timeout: 10_000 });
  await expect(page.getByTestId('hud-edge')).toHaveText('N');
  await expect(page.getByTestId('hud-edge')).toHaveAttribute('data-edge', 'north');
  await shot(page, 'theft-ping-edge');
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, '390px-frame');
  await page.waitForTimeout(Balance.steal.pingSeconds * 1000 + 700);
  await expect.poll(() => page.getByTestId('hud-wave').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.05);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&noping&seed=m2-05b-noping');
  await placeStockpile(page);
  await grantGold(page, 100);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(250);
  await expect(page.getByTestId('hud-wave')).not.toContainText('Gold snatched');
  await expect(page.getByTestId('hud-edge')).toHaveText('');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&nosteal&seed=m2-05b-nosteal');
  await placeStockpile(page);
  await grantGold(page, 100);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(false);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0)).toBe(0);
  await expect(page.getByTestId('hud-wave')).not.toContainText('Gold snatched');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wave-12 palisade line survives one wrecker pulse and repair stays cheaper than new placement', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=m2-05b-wave12-wall');
  await setBalances(
    page,
    {
      'enemy.contactDamage': 0,
      'wreck.damage': 8,
      'wreck.hitCooldown': 0.9,
    },
    false,
  );
  await page.evaluate(() => window.__GR_TEST__?.setBeaconWave(12));
  await grantGold(page, 120);
  for (const x of [-3, -2, -1, 0, 1, 2]) await placeBuildableAt(page, 'palisade', x, 9);

  const before = await hpEntries(page, 'palisade');
  expect(before).toHaveLength(6);
  expect(before.every((entry) => entry.maxHp > Balance.wreck.hp.palisade)).toBe(true);

  await teleport(page, 0, 6);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(2);
  await shot(page, 'wave12-wall-under-assault');

  const afterPulse = await hpEntries(page, 'palisade');
  expect(afterPulse).toHaveLength(6);
  expect(afterPulse.every((entry) => !entry.wrecked)).toBe(true);
  expect(afterPulse.some((entry) => entry.hp < entry.maxHp)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const newPlacementCost = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost ?? 0);
  const cost = repairCost('palisade');
  expect(cost).toBeLessThan(newPlacementCost);
  await wreck(page, 'palisade', 0);
  await grantGold(page, cost);
  await teleport(page, -3, 9);
  await expect
    .poll(() => hpEntries(page, 'palisade').then((entries) => entries.find((entry) => entry.index === 0)?.wrecked ?? true), {
      timeout: 10_000,
    })
    .toBe(false);
  expect((await economyLog(page)).some((event) => event.type === 'gold_spent' && event.sink === 'repair_palisade' && event.amount === cost)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __M2_05B_CAP__?: CapTrack;
    __M2_05B_BANNERS__?: BannerTrack;
    __M2_05B_PULSES__?: PulseTrack;
  }
}
