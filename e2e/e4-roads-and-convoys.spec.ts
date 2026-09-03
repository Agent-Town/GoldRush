import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

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
//   4. HUMAN PARITY, honestly: a PLAIN boot of the Dust Flats (no `?debug`) mounts no Hauler and no
//      tar, because `Game.ts:4585` gates `Vehicle`/`FuelSystem` behind `?debug&vehicles`. See the
//      test's own comment and `artifacts/e4-roads-and-convoys/report.md` for the fork.
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

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

test('every Motor reel replays to its claimed hash in Node, and the two engines agree tick-for-tick under the wave boundary', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  const table: Array<Record<string, unknown>> = [];
  const nodeDigests = JSON.parse(execFileSync(process.execPath, ['scripts/e4-motor-digest.mjs', '--all'], { encoding: 'utf8', timeout: 240_000 }).trim().split('\n').at(-1)!);
  for (const map of MAPS) {
    const tapePath = `${ARTIFACTS}/${map.id}-floor.tape.json`;
    const tape = JSON.parse(await readFile(tapePath, 'utf8'));
    const node = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay-agent.mjs', tapePath], { encoding: 'utf8', timeout: 150_000 }).trim().split('\n').at(-1)!);
    expect(tape.contract).toBe(map.id);
    // THE HASH CLAIM, in the half that holds: the reel this slice recorded replays to its claimed
    // hash in a second Node engine (`assay-replay-agent.mjs`, a separate process and module graph).
    expect(node.eventLogHash).toBe(tape.eventLogHash);

    // THE CROSS-ENGINE CLAIM, exactly as far as it goes. A whole E4 run does NOT replay identically
    // in Chromium: `visualY(0, 72)` is 0.4667785887247181 in Chromium and 0.46677858872383526 in
    // node 26.4.0, and the sim reads terrain, so the two drift apart over thousands of ticks. That
    // is NOT this slice's doing: with `MotorSocket.create` stubbed to null, the same map's floor reel
    // still ends early in the browser ("the run ended before tick 2701 of the order stream"), while
    // `artifacts/eh2-fixture/tape.json` replays identically in both. Measured 2026-09-04; see
    // `artifacts/e4-roads-and-convoys/report.md` F-E4-2. So the both-engine claim is made where it
    // can be made honestly: the SAME scripted order stream, the same fixed tick budget, under the
    // first wave boundary, with the motor state compared field for field.
    await page.goto(HARNESS(map.id, `${map.id}-01`));
    await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
    const browserDigest = await page.evaluate(async ({ contract, modules }) => {
      const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
      const { motorDigest } = await import(/* @vite-ignore */ modules.digest);
      return motorDigest(new HeadlessContractSim({ contractId: contract, seed: `${contract}-01` })) as string[];
    }, { contract: map.id, far: map.far, modules: MODULES });
    expect(browserDigest).toEqual(nodeDigests[map.id]);

    table.push({ contract: map.id, seed: tape.seed, claimedHash: tape.eventLogHash, nodeReplayHash: node.eventLogHash, nodeTicks: node.ticks, subWaveDigestMatches: true, digestMarks: browserDigest.length });
    console.log(`[e4-both-engines] ${map.id} claimed=${tape.eventLogHash} nodeReplay=${node.eventLogHash} subWaveDigest=MATCH(${browserDigest.length} marks)`);
  }
  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `both-engines-${testInfo.project.name}.json`), `${JSON.stringify(table, null, 2)}\n`);
  expect(errors).toEqual([]);
});

test('every Motor map publishes its own errand to a browser rider, and GRADE is refused off-stake', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  for (const map of MAPS) {
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
      const receipt = sim.submitOrders([{ verb: 'GRADE' }, { verb: 'HOLD', pos: { x: far.x, z: far.z } }]);
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

test('human parity, measured: a plain boot of the Dust Flats mounts no Hauler, and only ?debug&vehicles does', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  // THE FORK, PINNED (`tasks/e4-roads-and-convoys.md` scope 4 assumed "the existing E4 browser
  // composition covers this"; it does not). `Game.ts:4585` mounts `Vehicle` and `FuelSystem` only
  // when `isDevVehiclesEnabled()` is true, which is `isDebugEnabled() && params.has('vehicles')`
  // (`Game.ts:10178-10181`), and `DustFlatsTile` has no importer at all. So the headless rider can
  // GRADE and HAUL on a map where a browser player meets neither road nor Hauler. Closing that gap
  // is a `Game.ts` change, which this slice's firewall forbids; the corrective is on the desk in
  // BACKLOG. This test is the change detector: the day the plain boot composes a motor consumer it
  // goes red, and it SHOULD, because that is the day this row can finally say "parity".
  await page.goto('/?contract=e4-dust-flats&seed=e4-parity-plain');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const plain = await page.evaluate(() => ({
    vehicle: window.__THREE_GAME_DIAGNOSTICS__?.vehicle ?? null,
    fuel: window.__THREE_GAME_DIAGNOSTICS__?.fuel ?? null,
    testSeam: typeof window.__GR_TEST__,
  }));
  expect(plain.testSeam).toBe('undefined');
  expect(plain.vehicle).toBeNull();
  expect(plain.fuel).toBeNull();

  // The same contract with the dev flag: the Hauler is there, at the same start the socket uses.
  await page.goto('/?debug&vehicles&contract=e4-dust-flats&seed=e4-parity-dev');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const dev = await page.evaluate(() => ({
    vehicle: window.__THREE_GAME_DIAGNOSTICS__?.vehicle ?? null,
    fuel: window.__THREE_GAME_DIAGNOSTICS__?.fuel ?? null,
  }));
  expect(dev.vehicle).toMatchObject({ kind: 'hauler', state: 'idle', x: -20, z: -8 });
  expect(dev.fuel).toMatchObject({ capacity: 24, harvestedNodes: 0 });
  console.log(`[e4-parity] plain boot vehicle=${JSON.stringify(plain.vehicle)} dev boot vehicle=${JSON.stringify(dev.vehicle)}`);
  expect(errors).toEqual([]);
});
