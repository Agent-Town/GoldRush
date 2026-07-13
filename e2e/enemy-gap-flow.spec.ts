import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { ledgerEntries } from '../src/encyclopedia/registry';

const ARTIFACT_DIR = 'artifacts/enemy-gap-flow';

async function openRun(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?debug&nowaves&nolevel&nopause&nokill&nosteal&seed=enemy-gap-flow');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await page.evaluate(() => {
    localStorage.setItem('gr.story.tales.v1', '1');
    (document.querySelector('[data-testid="contract-briefing-dismiss"]') as HTMLButtonElement | null)?.click();
    window.__GR_TEST__?.setManualSim(true);
  });
  return errors;
}

async function placeGapWall(page: Page): Promise<void> {
  for (const x of [-6.5, -3.5, 3.5, 6.5]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 12, 1), x)).toBe(true);
  }
}

async function placeSealedRing(page: Page): Promise<void> {
  for (const x of [-3, 0, 3]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 8, 1), x)).toBe(true);
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 16, 1), x)).toBe(true);
  }
  for (const z of [10, 13]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', -5, at, 0), z)).toBe(true);
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', 5, at, 0), z)).toBe(true);
  }
}

test('eight runners commit to the wall gap without tripping the watchdog', async ({ page }, testInfo) => {
  const errors = await openRun(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await placeGapWall(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(5, 6);
    window.__GR_TEST__?.spawnPack(8, 0.7, { speedScale: 1 });
    window.__GR_TEST__?.teleport(0, 18);
  });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-gap-0s.png` });
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(5));
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-gap-5s.png` });
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(5));
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-gap-10s.png` });

  const result = await page.evaluate(() => ({
    enemies: window.__GR_TEST__?.enemyPositions() ?? [],
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
  }));
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-gap-report.json`, JSON.stringify(result, null, 2));
  expect(result.enemies).toHaveLength(8);
  expect(result.enemies.every((enemy) => enemy.z > 13)).toBe(true);
  expect(result.wreck?.stuckWatchdogTrips).toBe(0);
  expect(errors).toEqual([]);
});

test('a sealed ring triggers reduced gnawing and the breach ends it immediately', async ({ page }, testInfo) => {
  const errors = await openRun(page);
  await placeSealedRing(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 4);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 1 });
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.advanceSim(6);
  });
  const gnaw = await page.evaluate(() => ({
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
    damaged: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.hp < entry.maxHp),
    enemies: window.__GR_TEST__?.enemyPositions(),
    palisades: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade'),
  }));
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-gnaw-report.json`, JSON.stringify(gnaw, null, 2));
  expect(gnaw.wreck?.stuckWatchdogTrips).toBeGreaterThan(0);
  expect(gnaw.wreck?.gnawing).toBe(1);
  expect(gnaw.damaged?.hp).toBeLessThan(gnaw.damaged?.maxHp ?? 0);
  const breach = gnaw.palisades?.find((entry) => entry.position.z === 8 && entry.index !== gnaw.damaged?.index);
  expect(breach && await page.evaluate((index) => window.__GR_TEST__?.wreck('palisade', index), breach.index)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.2));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.gnawing)).toBe(0);
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-breached-ring.png` });
  expect(errors).toEqual([]);
});

test('an open-ended wall routes around its nearest end without gnawing', async ({ page }) => {
  const errors = await openRun(page);
  for (const x of [-3, 0, 3]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 12, 1), x)).toBe(true);
  }
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 6);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 1 });
    window.__GR_TEST__?.teleport(0, 18);
    window.__GR_TEST__?.advanceSim(10);
  });
  const result = await page.evaluate(() => ({
    enemy: window.__GR_TEST__?.enemyPositions()[0],
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
    damaged: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade' && entry.hp < entry.maxHp),
  }));
  expect(result.enemy?.z).toBeGreaterThan(13);
  expect(result.wreck?.stuckWatchdogTrips).toBe(0);
  expect(result.damaged).toEqual([]);
  expect(errors).toEqual([]);
});

test('a lone runner clears a finite side-by-side palisade line without tripping the watchdog', async ({ page }, testInfo) => {
  const errors = await openRun(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  for (const x of [-2, -1, 0, 1, 2]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 9), x)).toBe(true);
  }
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 6, { speedScale: 1 });
    window.__GR_TEST__?.advanceSim(10);
  });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-finite-line-10s.png` });

  const result = await page.evaluate(() => ({
    enemy: window.__GR_TEST__?.enemyPositions()[0],
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
  }));
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-finite-line-report.json`, JSON.stringify(result, null, 2));
  expect(Math.hypot(result.enemy?.x ?? Infinity, (result.enemy?.z ?? Infinity) - 12)).toBeLessThanOrEqual(1.25);
  expect(result.wreck?.stuckWatchdogTrips).toBe(0);
  expect(errors).toEqual([]);
});

test('a multi-turn route clears successive open walls without gnawing', async ({ page }) => {
  const errors = await openRun(page);
  for (const z of [10, 14]) {
    for (const x of [-3, 0, 3]) {
      expect(await page.evaluate(({ x, z }) => window.__GR_TEST__?.placeFree('palisade', x, z, 1), { x, z })).toBe(true);
    }
  }
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 6);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 1 });
    window.__GR_TEST__?.teleport(0, 18);
    window.__GR_TEST__?.advanceSim(15);
  });
  const result = await page.evaluate(() => ({
    enemy: window.__GR_TEST__?.enemyPositions()[0],
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
    damaged: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade' && entry.hp < entry.maxHp),
  }));
  expect(result.enemy?.z).toBeGreaterThan(15);
  expect(result.wreck?.stuckWatchdogTrips).toBe(0);
  expect(result.damaged).toEqual([]);
  expect(errors).toEqual([]);
});

test('a connected U-wall routes around its distant opening without gnawing', async ({ page }) => {
  const errors = await openRun(page);
  for (const x of [-3, 0, 3]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 8, 1), x)).toBe(true);
  }
  for (const z of [10, 13]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', -5, at, 0), z)).toBe(true);
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', 5, at, 0), z)).toBe(true);
  }
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 4);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 1 });
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.advanceSim(15);
  });
  const result = await page.evaluate(() => ({
    enemy: window.__GR_TEST__?.enemyPositions()[0],
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
    damaged: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade' && entry.hp < entry.maxHp),
  }));
  expect(result.enemy?.z).toBeGreaterThan(10);
  expect(result.wreck?.stuckWatchdogTrips).toBe(0);
  expect(result.damaged).toEqual([]);
  expect(errors).toEqual([]);
});

test('gnaw state survives strict suspend normalization and reconnect restore', async ({ page }) => {
  const errors = await openRun(page);
  await placeSealedRing(page);
  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    test.teleport(0, 4);
    test.spawnPack(1, 0.1, { speedScale: 1 });
    test.teleport(0, 12);
    test.advanceSim(6);
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const before = test.captureSuspend();
    const normalized = suspend.normalizeRunSuspendDatum(before);
    const restored = normalized ? test.restoreSuspend(normalized) : false;
    const after = test.captureSuspend();
    const fields = (snapshot: typeof before) => {
      const enemy = snapshot.enemies.active[0];
      return enemy && {
        gapBlockerId: enemy.gapBlockerId,
        gapWaypoint: enemy.gapWaypoint,
        watchdogElapsed: enemy.watchdogElapsed,
        watchdogAnchor: enemy.watchdogAnchor,
        watchdogTrips: enemy.watchdogTrips,
        gnawTargetId: enemy.gnawTargetId,
        gnawing: enemy.gnawing,
      };
    };
    return { normalized: normalized !== null, restored, before: fields(before), after: fields(after) };
  });
  expect(result.normalized).toBe(true);
  expect(result.restored).toBe(true);
  expect(result.before).toMatchObject({ gnawing: true, watchdogTrips: 1 });
  expect(result.after).toEqual(result.before);
  expect(errors).toEqual([]);
});

test('wreckers ignore the gap, damage the nearest wall, and carry the rust tell', async ({ page }, testInfo) => {
  const errors = await openRun(page);
  await placeGapWall(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 6);
    window.__GR_TEST__?.spawnPack(1, 0.1, { wrecker: true, speedScale: 1, variantId: 'steam_wrecker' });
    window.__GR_TEST__?.teleport(0, 18);
    window.__GR_TEST__?.advanceSim(5);
  });
  const result = await page.evaluate(() => ({
    enemy: window.__GR_TEST__?.enemyPositions()[0],
    damaged: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade' && entry.hp < entry.maxHp) ?? [],
  }));
  expect(result.enemy?.wrecker).toBe(true);
  expect(result.enemy?.wreckState).toBe('swinging');
  expect(result.enemy?.presentation).toMatchObject({ wreckerMarker: true, markerColor: '#a0522d' });
  expect(result.damaged).toHaveLength(1);
  expect(ledgerEntries.find((entry) => entry.id === 'wrecker')?.loreLine).toBe('Wreckers go for your buildings; the rest take the gaps.');
  await page.screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-wrecker-tell.png` });
  expect(errors).toEqual([]);
});
