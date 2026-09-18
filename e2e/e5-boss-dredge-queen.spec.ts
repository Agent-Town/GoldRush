import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { DREDGE_QUEEN_WRECK_KEY } from '../src/game/ProfileStorage';

const QUERY = '/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&seed=dredge-queen';
const SHOT_DIR = path.resolve('reviews/shots-e5-boss-dredge-queen');
const WIRE_SHOT_DIR = path.resolve('reviews/shots-wire-dq-3d');
const BOSS_STORM_AT = 8;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ epochKey }) => {
  if (!sessionStorage.getItem('dredge-queen-test')) {
    localStorage.clear();
    sessionStorage.setItem('dredge-queen-test', '1');
  }
  localStorage.setItem(epochKey, 'epoch-5-deepwater');
}, { epochKey: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await dismissBriefing(page);
  await configureBossHarness(page);
  return errors;
}

async function configureBossHarness(page: Page): Promise<void> {
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('dredgeQueen.approachSeconds', 2);
    test.setBalance('dredgeQueen.clawCycleSeconds', 1);
    test.setBalance('dredgeQueen.repositionEveryCycles', 99);
    test.setBalance('dredgeQueen.swatIntervalSeconds', 1);
    test.setBalance('dredgeQueen.swatTelegraphSeconds', 0.5);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
  });
}

async function dredge(page: Page) {
  return page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim as any).dredgeQueenBoss);
}

async function parts(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'dredge_queen'));
}

async function damagePart(page: Page, componentId: string, lethal: boolean): Promise<void> {
  const position = await page.evaluate(({ id, kill }) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    const component = snapshot.enemies.active.find((enemy: any) => enemy.variantId === 'dredge_queen' && enemy.bossComponentId === id);
    if (!component) return null;
    if (kill) component.hp = 0.01;
    if (!test.restoreSuspend(snapshot)) return null;
    return test.enemyPositions().find((enemy) => enemy.variantId === 'dredge_queen' && enemy.bossComponentId === id) ?? null;
  }, { id: componentId, kill: lethal });
  expect(position).not.toBeNull();
  await page.evaluate(({ target, kill }) => {
    const test = window.__GR_TEST__!;
    test.setBalance('blast.damage', kill ? 1 : 0.5);
    test.launchBlastAt(target.x, target.z, 0.05);
    test.advanceSim(0.3);
  }, { target: position!, kill: lethal });
  if (lethal) await expect.poll(async () => (await parts(page)).some((enemy) => enemy.bossComponentId === componentId)).toBe(false);
}

async function spawnAndAnchor(page: Page): Promise<void> {
  await page.evaluate((bossAt) => window.__GR_TEST__!.advanceSim(Math.max(0, bossAt + 0.05 - window.__THREE_GAME_DIAGNOSTICS__!.timeAlive)), BOSS_STORM_AT);
  await expect.poll(() => dredge(page)).toMatchObject({ act: 0, stormFrontWave: 1, approaching: true });
  expect((await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'corsair_skiff' && enemy.variantLabel === 'Dredge-Queen Escort'))).length).toBe(3);
  for (let step = 0; step < 30 && (await dredge(page)).act === 0; step += 1) {
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  }
  await expect.poll(() => dredge(page)).toMatchObject({ act: 1, anchored: true, livePaddles: 2, act2Locked: true });
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  const storyBeat = page.getByTestId('story-beat-card');
  if (await storyBeat.isVisible()) {
    await page.mouse.click(6, 6);
    await expect(storyBeat).toBeHidden();
  }
  const prefix = testInfo.project.name === 'desktop-chrome' ? '' : 'mobile-';
  await page.screenshot({ path: path.join(SHOT_DIR, `${prefix}${name}.png`) });
}

async function wireShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  if (testInfo.project.name !== 'desktop-chrome') return;
  await mkdir(WIRE_SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(WIRE_SHOT_DIR, `${name}.png`) });
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

async function skipCeremony(page: Page): Promise<void> {
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.baronCeremony.active)).toBe(false);
  const secured = page.getByTestId('claim-secured');
  if (await secured.isVisible()) {
    await page.getByTestId('stay-for-rush').click();
    await expect(secured).toBeHidden();
  }
}

async function frameP95(page: Page, frames = 180): Promise<number> {
  return page.evaluate((sampleCount) => new Promise<number>((resolve) => {
    const samples: number[] = [];
    let previous = performance.now();
    const tick = (now: number) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < sampleCount) return requestAnimationFrame(tick);
      samples.sort((a, b) => a - b);
      resolve(Number(samples[Math.floor((samples.length - 1) * 0.95)]!.toFixed(2)));
    };
    requestAnimationFrame(tick);
  }), frames);
}

/**
 * F-BMB-3 (2026-09-18). This gate compared ONE p95 from each arm, and three drains in a row had to
 * re-derive its red by hand, because the host's frame time is not a number — it is a distribution
 * with modes. The boss-models drain measured the boss arm identical across trees (median 16.65 vs
 * 16.55 ms) while the non-boss DENOMINATOR flipped between a vsync-locked ~16.6 ms and a free
 * ~10.3 ms (F-DRB-10), so one sample over one sample was a coin flip on every tree.
 *
 * MEASURED HERE, before the change, on an unchanged tree: eight runs of this test (four per
 * project, same host, `--workers=1`) produced ratios 0.99 / 0.97 / 0.93 / 0.98 on desktop and
 * 1.16 / 0.92 / 1.03 / 0.99 on mobile — one of the eight red at 1.1628, with nothing changed.
 *
 * THE FIX, and why the MINIMUM. Each arm is now sampled `P95_SAMPLES` times back to back and the
 * arms are compared FLOOR to FLOOR. The floor is the right estimator because the noise is
 * one-sided: every source of inflation here (a vsync lock, a compositor hiccup, another agent on
 * the box) makes a sample slower, never faster, so the smallest of N samples is the closest reading
 * of the frame's own work. The intent is unchanged — a boss arm whose floor is more than 15 % above
 * the non-boss floor still fails — but the comparison is now between two like readings.
 *
 * THE ONE THING IT STILL CANNOT SEE: if BOTH arms sit on the vsync plateau in every sample, the
 * ratio is ~1.0 no matter what the boss costs. That is a property of the clock, not of this test,
 * so it is DETECTED and printed rather than silently passed.
 */
const P95_SAMPLES = 5;
/** Above this, a p95 reading is the compositor's vsync plateau rather than the frame's own work. */
const VSYNC_PLATEAU_MS = 15;

async function frameP95Floor(page: Page, samples = P95_SAMPLES): Promise<{ series: number[]; floor: number }> {
  const series: number[] = [];
  for (let index = 0; index < samples; index += 1) series.push(await frameP95(page));
  return { series, floor: Math.min(...series) };
}

test('rides the storm, gates Act 2 on both paddles, spills the hold, and persists W6 per profile', async ({ page }, testInfo) => {
  const errors = await open(page);
  await spawnAndAnchor(page);

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(5.5));
  await expect.poll(() => dredge(page)).toMatchObject({ clawCycles: 5, holdLoot: 5, act: 1 });
  const bankedLoot = (await dredge(page)).holdLoot;
  const anchor = (await dredge(page)).anchor;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 9), anchor);
  await shot(page, testInfo, 'act1-two-front');
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-mounted', 'true');
  await wireShot(page, testInfo, 'act1-model');

  await damagePart(page, 'paddle_port', true);
  expect(await dredge(page)).toMatchObject({ act: 1, livePaddles: 1, act2Locked: true });
  expect((await parts(page)).some((enemy) => enemy.bossComponentId === 'hold')).toBe(false);

  await damagePart(page, 'paddle_starboard', true);
  await expect.poll(() => dredge(page)).toMatchObject({ act: 2, livePaddles: 0, act2Locked: false, escortMultiplier: 2 });
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-damage-states', /"paddle_port":"broken".*"paddle_starboard":"broken"/);
  expect((await parts(page)).map((enemy) => enemy.bossComponentId)).toEqual(['hold']);
  expect((await dredge(page)).escortSkiffs).toBeGreaterThanOrEqual(6);

  await damagePart(page, 'hold', true);
  await expect.poll(() => dredge(page)).toMatchObject({ act: 3, crewQuit: true, hulkPresent: true, spillPickups: bankedLoot, persistentWreck: false });
  expect(await dredge(page)).toMatchObject({ escortsExiting: true, escortSkiffs: 0 });
  expect((await page.evaluate(() => window.__GR_TEST__!.goldPickups())).filter((pickup) => pickup.active)).toHaveLength(bankedLoot);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(false);
  await skipCeremony(page);
  await shot(page, testInfo, 'act3-spill');
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-presentation', 'hulk');
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-damage-states', /"hold":"broken"/);
  await wireShot(page, testInfo, 'act3-hulk');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(12));
  await expect.poll(() => dredge(page)).toMatchObject({ escortsExiting: false, escortsExited: 6, hulkPresent: true });

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await dismissBriefing(page);
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 3, hulkPresent: true, persistentWreck: true });
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-presentation', 'hulk');
  await expect(page.locator('canvas')).toHaveAttribute('data-dredge-queen3d-damage-states', /"claw":"broken".*"hold":"broken"/);
  const secondRunAnchor = (await dredge(page)).anchor;
  expect(secondRunAnchor).toEqual(anchor);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 9), secondRunAnchor);
  await shot(page, testInfo, 'w6-wreck-second-run');
  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(12));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(true);

  await page.evaluate(async () => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.createProfile(localStorage, 'Fresh Dredger');
  });
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 0, hulkPresent: false, persistentWreck: false });
  expect(errors).toEqual([]);
});

test('interrupts a mid-cycle claw hit without transferring loot', async ({ page }) => {
  const errors = await open(page);
  await spawnAndAnchor(page);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.4));
  const before = await dredge(page);
  expect(before).toMatchObject({ clawCycles: 0, clawInterrupts: 0, holdLoot: 0 });

  await damagePart(page, 'claw', false);
  await expect.poll(() => dredge(page)).toMatchObject({ clawCycles: 0, clawInterrupts: 1, holdLoot: 0 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.55));
  expect(await dredge(page)).toMatchObject({ clawCycles: 0, holdLoot: 0 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  await expect.poll(() => dredge(page)).toMatchObject({ clawCycles: 1, holdLoot: 1 });

  await damagePart(page, 'claw', true);
  await damagePart(page, 'paddle_port', true);
  await damagePart(page, 'paddle_starboard', true);
  await expect.poll(() => dredge(page)).toMatchObject({ act: 2, swats: 0 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2.2));
  expect(await dredge(page)).toMatchObject({ act: 2, swats: 0, swatTelegraphed: false });
  expect(errors).toEqual([]);
});

test('damages only inside the telegraphed defensive-claw arc', async ({ page }) => {
  const errors = await open(page);
  await spawnAndAnchor(page);
  await damagePart(page, 'paddle_port', true);
  await damagePart(page, 'paddle_starboard', true);
  const anchor = (await dredge(page)).anchor;

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 2), anchor);
  const hpBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.6));
  expect(await dredge(page)).toMatchObject({ swatTelegraphed: true, swats: 0 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  expect(await dredge(page)).toMatchObject({ swats: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBe(hpBefore);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z - 2), anchor);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1.1));
  expect(await dredge(page)).toMatchObject({ swats: 2 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBeLessThan(hpBefore);
  expect(errors).toEqual([]);
});

test('keeps the boss-run frame p95 within 15% of the non-boss tile', async ({ page }, testInfo) => {
  // Two arms x P95_SAMPLES readings of 180 frames each, plus two reloads: this one test needs more
  // than the file's 90 s.
  test.setTimeout(300_000);
  const errors = await open(page);
  await page.evaluate(({ key }) => localStorage.setItem(key, JSON.stringify({ e5W6Wreck: true, x: 36, z: -20 })), { key: DREDGE_QUEEN_WRECK_KEY });
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await dismissBriefing(page);
  await configureBossHarness(page);
  await page.evaluate((bossAt) => window.__GR_TEST__!.advanceSim(bossAt + 3.2), BOSS_STORM_AT);
  await expect.poll(() => dredge(page)).toMatchObject({ persistentWreck: true, active: false });
  const nonBoss = await frameP95Floor(page);

  await page.evaluate(({ key }) => localStorage.removeItem(key), { key: DREDGE_QUEEN_WRECK_KEY });
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  await dismissBriefing(page);
  await configureBossHarness(page);
  await page.evaluate((bossAt) => window.__GR_TEST__!.advanceSim(bossAt + 3.2), BOSS_STORM_AT);
  await expect.poll(() => dredge(page)).toMatchObject({ act: 1, anchored: true });
  const boss = await frameP95Floor(page);
  const ratio = Number((boss.floor / nonBoss.floor).toFixed(4));
  const plateaued = nonBoss.floor >= VSYNC_PLATEAU_MS && boss.floor >= VSYNC_PLATEAU_MS;

  const reading = `Dredge-Queen perf ${testInfo.project.name}: `
    + `non-boss floor=${nonBoss.floor}ms of [${nonBoss.series.join(', ')}] `
    + `boss floor=${boss.floor}ms of [${boss.series.join(', ')}] ratio=${ratio}`
    + (plateaued ? ' — BOTH ARMS ON THE VSYNC PLATEAU, this run carries no information about the boss cost' : '');
  console.log(reading);
  await testInfo.attach('dredge-queen-frame-p95.json', {
    body: JSON.stringify({ project: testInfo.project.name, nonBoss, boss, ratio, plateaued }, null, 2),
    contentType: 'application/json',
  });
  expect(boss.floor, reading).toBeLessThanOrEqual(nonBoss.floor * 1.15);
  expect(errors).toEqual([]);
});
