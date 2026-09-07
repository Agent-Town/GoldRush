import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import type { RunTape } from '../src/game/RunTape';

// E4 ROADS AND CONVOYS — the both-engine proof and the human-parity pin
// (`tasks/e4-roads-and-convoys.md` scope 1 and 4).
//
// "Both engines" here is the county's own definition for agent reels (`e2e/true-reel-harness.spec.ts`,
// `scripts/assay-replay.mjs:29-34`): the same `HeadlessContractSim` ridden in Node and in the browser
// runtime, one seed, one order stream, one event-log hash. The Game.ts world was never in hash
// agreement with the headless door (the seam census at tick 0 differs), so it is not claimed here.
//
// Four proofs, all viewport-independent, run on desktop and 390px alike:
//   1. all four Motor reels replay to their claimed hash in Node AND in the browser worker;
//   2. the composed Dust Flats, ridden live in the browser runtime with the shared floor policy,
//      terminates on the hash and the motor summary Node recorded;
//   3. every Motor map publishes its own errand to a browser rider, and GRADE is refused off-stake
//      with a reason that names the nearest stake;
//   4. HUMAN PARITY: a PLAIN Motor boot mounts the Hauler and tar, while the
//      debug flag remains an override for non-Motor contracts.
const ARTIFACTS = 'artifacts/e4-roads-and-convoys';
const HARNESS = (contract: string, seed: string) => `/src/replay/harness.html?debug&contract=${contract}&seed=${seed}`;
// Module paths the browser page imports live; passed as values so tsc does not try to resolve them
// against this file (the harness page is served from /src/replay/, so a relative specifier cannot
// satisfy both the type-checker and the browser).
const MODULES = { sim: '/src/sim/HeadlessContractSim.ts', digest: '/scripts/e4-motor-digest.mjs' };

const MAPS = [
  // `far` is only where the Prospector is told to hold after the refusal; the refusal itself comes
  // from its START, which is off every stake on all four maps.
  { id: 'e4-dust-flats', kind: 'haul', corridorId: 'camp-to-railhead', far: { x: 34, z: 30 } },
  { id: 'e4-long-road', kind: 'convoy', corridorId: 'the-long-road', far: { x: 60, z: 30 } },
  { id: 'e4-gusher-county', kind: 'deliveries', corridorId: 'camp-to-west-lease', far: { x: 34, z: 30 } },
  { id: 'e4-boneyard', kind: 'tow', corridorId: 'gate-to-west-rows', far: { x: 34, z: 30 } },
] as const;

type BrowserOrder = { verb: string; status: string; reason: string | null };
type BrowserMotor = {
  objective: { kind: string; corridorId: string; arrived: boolean; securableAtWave: number | null };
  events: Array<{ type: string }>;
  eventCount: number;
} | null;

function collectErrors(page: Page, errors: string[] = []): string[] {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function walkToZ(page: Page, target: number): Promise<void> {
  for (let step = 0; step < 40; step += 1) {
    const z = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 8);
    if (Math.abs(z - target) < 0.6) return;
    await page.keyboard.press(z > target ? 'KeyW' : 'KeyS', { delay: 120 });
    await page.waitForTimeout(30);
  }
  throw new Error(`Player did not reach z=${target}.`);
}

async function confirm(page: Page, projectName: string): Promise<void> {
  if (projectName === 'mobile-chrome') await page.locator('#confirm-button').click();
  else await page.keyboard.press('Space');
}

test('every Motor reel replays to its claimed hash in Node and Chromium', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  const table: Array<Record<string, unknown>> = [];
  const mismatches: Array<Record<string, unknown>> = [];
  const context = page.context();
  await page.close();
  const nodeDigests = JSON.parse(execFileSync(process.execPath, ['scripts/e4-motor-digest.mjs', '--all'], { encoding: 'utf8', timeout: 240_000 }).trim().split('\n').at(-1)!);
  for (const map of MAPS) {
    const tapePath = `${ARTIFACTS}/${map.id}-floor.tape.json`;
    const tape = JSON.parse(await readFile(tapePath, 'utf8'));
    const node = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay-agent.mjs', tapePath], { encoding: 'utf8', timeout: 150_000 }).trim().split('\n').at(-1)!);
    expect(tape.contract).toBe(map.id);
    // THE HASH CLAIM, in the half that holds: the reel this slice recorded replays to its claimed
    // hash in a second Node engine (`assay-replay-agent.mjs`, a separate process and module graph).
    expect(node.eventLogHash).toBe(tape.eventLogHash);

    // This whole-run gate disproved F-E4-2's height-arithmetic attribution. The first divergent tick
    // is the first enemy spawn: the browser worker boots the Claim contract because its location
    // shim and ContractFamilies.currentSearch() read different globals. Keep collecting all four
    // rows so the routing corrective has one complete regression gate.
    // The harness navigates itself after a replay, so isolate each map in a disposable page.
    const replayPage = await context.newPage();
    collectErrors(replayPage, errors);
    await replayPage.goto(HARNESS(map.id, `${map.id}-01`));
    await replayPage.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
    let browser: { eventLogHash?: string; outcome?: unknown; ticks?: number; error?: string };
    try {
      browser = await replayPage.evaluate(async (reel) => window.__GR_AGENT_TAPE_REPLAY__!.replay(reel), tape);
    } catch (error) {
      browser = { error: error instanceof Error ? error.message : String(error) };
    }
    if (browser.eventLogHash !== node.eventLogHash
      || JSON.stringify(browser.outcome) !== JSON.stringify(node.outcome)
      || browser.ticks !== node.ticks) {
      mismatches.push({ contract: map.id, node, browser });
    }
    const browserDigest = await replayPage.evaluate(async ({ contract, modules }) => {
      const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
      const { motorDigest } = await import(/* @vite-ignore */ modules.digest);
      return motorDigest(new HeadlessContractSim({ contractId: contract, seed: `${contract}-01` })) as string[];
    }, { contract: map.id, far: map.far, modules: MODULES });
    expect(browserDigest).toEqual(nodeDigests[map.id]);

    table.push({ contract: map.id, seed: tape.seed, claimedHash: tape.eventLogHash, nodeReplayHash: node.eventLogHash, browserReplayHash: browser.eventLogHash, browserError: browser.error, nodeTicks: node.ticks, browserTicks: browser.ticks, subWaveDigestMatches: true, digestMarks: browserDigest.length });
    console.log(`[e4-both-engines] ${map.id} claimed=${tape.eventLogHash} node=${node.eventLogHash}/${node.ticks} browser=${browser.error ?? `${browser.eventLogHash}/${browser.ticks}`}`);
    await replayPage.close();
  }
  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `both-engines-${testInfo.project.name}.json`), `${JSON.stringify(table, null, 2)}\n`);
  expect(errors).toEqual([]);
  expect(mismatches).toEqual([]);
});

test('every Motor map publishes its own errand to a browser rider, and GRADE is refused off-stake', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  for (const map of MAPS) {
    // Settle on a blank page first: the harness boots its own navigation from `?contract=`, and
    // under parallel workers that pending navigation interrupts the NEXT map's goto
    // ("is interrupted by another navigation to ..."). One blank hop per map costs nothing.
    await page.goto('about:blank');
    await page.goto(HARNESS(map.id, `${map.id}-01`));
    await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
    const result = await page.evaluate(async ({ contract, far, modules }) => {
      const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
      const sim = new HeadlessContractSim({ contractId: contract, seed: `${contract}-01` });
      const opening = sim.currentTurn().view;
      // Far from every stake on every one of these maps, so GRADE has to refuse and say why.
      // The Prospector starts more than the 2.5wu grade reach from EVERY stake on all four maps
      // (nearest is 5.4wu, the Dust Flats' own camp-to-railhead), so GRADE has to refuse right here
      // and name the nearest one. No walk, so no wave boundary is crossed and nothing can time out.
      const receipt = sim.submitOrders([{ verb: 'GRADE' }, { verb: 'MOVE_HERO', pos: { x: far.x, z: far.z } }]);
      for (let tick = 0; tick < 10; tick += 1) sim.advanceOneTick();
      const orders: BrowserOrder[] = sim.standingOrdersSnapshot().orders
        .map((record: { order: { verb: string }; status: string; reason?: string }) => ({ verb: record.order.verb, status: record.status, reason: record.reason ?? null }));
      const rules: string[] = opening.stablePrefix.mechanics.rules.map((rule: { id: string }) => rule.id);
      return { motor: (opening.now.motor ?? null) as BrowserMotor, accepted: receipt.outcome.ok as boolean, orders, rules };
    }, { contract: map.id, far: map.far, modules: MODULES });

    expect(result.accepted).toBe(true);
    expect(result.motor?.objective).toMatchObject({ kind: map.kind, corridorId: map.corridorId, arrived: false, securableAtWave: null });
    expect(result.rules).toEqual(expect.arrayContaining(['motor_roads', 'motor_fuel', 'motor_hauler', 'motor_haul_objective', 'motor_weather']));
    const grade = result.orders.find((order) => order.verb === 'GRADE');
    expect(grade?.status).toBe('failed');
    expect(grade?.reason).toMatch(/OUT_OF_REACH: GRADE needs an ungraded corridor stake within 2\.5wu/);
    expect(grade?.reason).toMatch(/The nearest ungraded stake is /);
  }
  expect(errors).toEqual([]);
});

test('human parity: a Motor plain boot mounts its declared Hauler and tar', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await page.addInitScript(({ epochKey, profileEpochKey, profileKey }) => {
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(epochKey, 'epoch-4-motor');
    localStorage.setItem(profileEpochKey, 'epoch-4-motor');
    sessionStorage.setItem('gr.contract.launch.v1', 'e4-dust-flats');
  }, { epochKey: ACTIVE_EPOCH_KEY, profileEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY), profileKey: PROFILE_KEY });
  await page.goto('/?contract=e4-dust-flats&seed=e4-parity-plain');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats' && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const plain = await page.evaluate(() => ({
    vehicle: window.__THREE_GAME_DIAGNOSTICS__?.vehicle ?? null,
    fuel: window.__THREE_GAME_DIAGNOSTICS__?.fuel ?? null,
    testSeam: typeof window.__GR_TEST__,
  }));
  expect(plain.testSeam).toBe('undefined');
  expect(plain.vehicle).toMatchObject({ kind: 'hauler', state: 'idle', x: -20, z: -8 });
  expect(plain.fuel).toMatchObject({ capacity: 24, harvestedNodes: 0 });

  // `?debug&vehicles` remains the explicit override outside the Motor Frontier.
  await page.goto('/?debug&vehicles&contract=e1-dry-gulch&seed=e4-parity-dev');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const dev = await page.evaluate(() => ({
    vehicle: window.__THREE_GAME_DIAGNOSTICS__?.vehicle ?? null,
    fuel: window.__THREE_GAME_DIAGNOSTICS__?.fuel ?? null,
  }));
  expect(dev.vehicle).toMatchObject({ kind: 'hauler', state: 'idle', x: -20, z: -8 });
  expect(dev.fuel).toMatchObject({ capacity: 24, harvestedNodes: 0 });
  expect(errors).toEqual([]);
});

test('a plain-boot Dust Flats player gathers tar and calls the Hauler with recorded inputs', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await page.addInitScript(({ epochKey, profileEpochKey, profileKey }) => {
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(epochKey, 'epoch-4-motor');
    localStorage.setItem(profileEpochKey, 'epoch-4-motor');
    sessionStorage.setItem('gr.contract.launch.v1', 'e4-dust-flats');
  }, { epochKey: ACTIVE_EPOCH_KEY, profileEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY), profileKey: PROFILE_KEY });
  await page.goto('/?contract=e4-dust-flats&seed=e4-player-ride');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats' && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();

  // Start is (0, 8); the road stake is (0, 12), and the middle tar node is (0, -8). These are
  // ordinary player movement and the shared Confirm context action, with no debug bridge or flag.
  await walkToZ(page, 12);
  await confirm(page, testInfo.project.name);
  await walkToZ(page, -8);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.fuel?.harvestedNodes ?? 0) > 0, null, { timeout: 5_000 });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.fuel?.stored ?? 0) > 0);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vehicle!.x);
  await confirm(page, testInfo.project.name);
  await page.waitForFunction((x) => Math.abs(window.__THREE_GAME_DIAGNOSTICS__!.vehicle!.x - x) > 0.5, before);

  await mkdir('reviews/shots-e4-vehicles-plain-boot', { recursive: true });
  await page.screenshot({ path: `reviews/shots-e4-vehicles-plain-boot/${testInfo.project.name}.png` });
  const ride = await page.evaluate(() => ({
    vehicle: window.__THREE_GAME_DIAGNOSTICS__!.vehicle,
    fuel: window.__THREE_GAME_DIAGNOSTICS__!.fuel,
  }));
  expect(ride.vehicle).toMatchObject({ kind: 'hauler' });
  expect(ride.fuel!.harvestedNodes).toBeGreaterThan(0);

  // The assay harness adds only deterministic clocks and a run-end control; repeat the same player
  // inputs there so the production recorder can seal immediately instead of waiting for a death.
  await page.goto('/?debug&nolevel&nowaves&contract=e4-dust-flats&seed=e4-player-tape');
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats');
  if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await walkToZ(page, -8);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.fuel?.stored ?? 0) > 0);
  const tapeBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vehicle!.x);
  await page.keyboard.press('Space');
  await page.waitForFunction((x) => Math.abs(window.__THREE_GAME_DIAGNOSTICS__!.vehicle!.x - x) > 0.5, tapeBefore);
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const tape = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  expect(tape.inputLog.motorActions).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'motor_haul' })]));
  const tapePath = testInfo.outputPath('plain-boot-motor.tape.json');
  await writeFile(tapePath, JSON.stringify(tape));
  const slip = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay.mjs', tapePath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 180_000,
    env: { ...process.env, GR_ASSAY_REPLAY_PORT: String(5640 + testInfo.workerIndex) },
  }).trim()) as { eventLogHash: string; ticks: number };
  expect(slip.eventLogHash).toBe((tape as RunTape).eventLogHash);
  expect(slip.ticks).toBe((tape as RunTape).inputLog.durationTicks);
  console.log('E4_PLAIN_BOOT_ASSAY_SLIP', JSON.stringify(slip));
  expect(errors).toEqual([]);
});
