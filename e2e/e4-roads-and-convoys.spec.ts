import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// E4 ROADS AND CONVOYS — the both-engine proof (`tasks/e4-roads-and-convoys.md` scope 1).
//
// "Both engines" here is the county's own definition for agent reels (`e2e/true-reel-harness.spec.ts`,
// `scripts/assay-replay.mjs:29-34`): the same `HeadlessContractSim` ridden in Node and in the browser
// runtime, one seed, one order stream, one event-log hash. The Game.ts world was never in hash
// agreement with the headless door (the seam census at tick 0 differs), and today's plain-boot
// browser composes no motor consumer at all — that fork is the report's, not this spec's.
//
// Three proofs, all viewport-independent, run on desktop and 390px alike:
//   1. the Node-recorded Dust Flats reel replays to its claimed hash in Node AND in the browser worker;
//   2. the composed Dust Flats, ridden live in the browser runtime with the shared floor policy,
//      terminates on the hash and the motor summary Node recorded;
//   3. an undeclared Motor map composes no socket and refuses GRADE with a reason a rider can read.
const ARTIFACTS = 'artifacts/e4-roads-and-convoys';
const TAPE = `${ARTIFACTS}/e4-dust-flats-floor.tape.json`;
const SUMMARY = `${ARTIFACTS}/e4-dust-flats-floor.summary.json`;
const HARNESS = (contract: string, seed: string) => `/src/replay/harness.html?debug&contract=${contract}&seed=${seed}`;
const E4_EVENT_KINDS = ['motor_haul_arrived', 'motor_haul_dispatched', 'motor_road_graded', 'motor_tar_harvested', 'motor_weather'];
// Module paths the browser page imports live; passed as values so tsc does not try to resolve them
// against this file (the harness page is served from /src/replay/, so a relative specifier cannot
// satisfy both the type-checker and the browser).
const MODULES = { sim: '/src/sim/HeadlessContractSim.ts', floor: '/scripts/e4-motor-floor.mjs' };

type BrowserOrder = { verb: string; status: string; reason: string | null };
type BrowserMotor = { objective: { arrived: boolean; securableAtWave: number | null }; events: Array<{ type: string }>; eventCount: number } | null;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

test('the Dust Flats reel replays to the claimed hash in Node and in the browser worker', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  const tape = JSON.parse(await readFile(TAPE, 'utf8'));
  const node = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay-agent.mjs', TAPE], { encoding: 'utf8', timeout: 150_000 }));
  await page.goto(HARNESS(tape.contract, tape.seed));
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const browser = await page.evaluate(async (reel) => {
    const startedAt = performance.now();
    const replay = await window.__GR_AGENT_TAPE_REPLAY__!.replay(reel);
    return { ...replay, wallMs: Math.round(performance.now() - startedAt) };
  }, tape);

  expect(tape.contract).toBe('e4-dust-flats');
  expect(node.eventLogHash).toBe(tape.eventLogHash);
  expect(browser.eventLogHash).toBe(tape.eventLogHash);
  expect(browser.outcome).toEqual(node.outcome);
  expect(browser.ticks).toBe(node.ticks);
  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `true-reel-${testInfo.project.name}.json`), `${JSON.stringify({
    contract: tape.contract, seed: tape.seed, claimed: tape.eventLogHash, node, browser,
  }, null, 2)}\n`);
  console.log(`[e4-true-reel] claimed=${tape.eventLogHash} node=${node.eventLogHash} browser=${browser.eventLogHash} browserWallMs=${browser.wallMs}`);
  expect(errors).toEqual([]);
});

test('the composed Dust Flats rides to the same terminal hash in the browser runtime as in Node', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  const summary = JSON.parse(await readFile(SUMMARY, 'utf8'));
  await page.goto(HARNESS(summary.contract, summary.seed));
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const browser = await page.evaluate(async ({ contract, seed, variant, modules }) => {
    const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
    const { motorFloorOrders } = await import(/* @vite-ignore */ modules.floor);
    const sim = new HeadlessContractSim({ contractId: contract, seed });
    const secureWave = sim.manifest.twist.secureWave ?? 20;
    const ceiling = Math.max(secureWave, sim.manifest.twist.baron?.wave ?? 0) + 6;
    let turn = sim.currentTurn();
    const opening = turn.view.now.motor;
    const rejected: string[] = [];
    let motorArrivedWave: number | null = null;
    let endReason: string | undefined;
    while (!turn.terminal) {
      if (turn.view.now.wave >= ceiling) { sim.hero.hp = 0; sim.dead = true; endReason = 'wave-ceiling'; turn = sim.currentTurn(); break; }
      const receipt = sim.submitOrders(motorFloorOrders(turn.view, variant));
      if (!receipt.outcome.ok) rejected.push(String(receipt.outcome.message));
      if (motorArrivedWave === null && turn.view.now.motor?.objective.arrived) motorArrivedWave = turn.view.now.wave;
      turn = sim.advanceToTurn();
    }
    const outcome = sim.outcome();
    return { opening, outcome, endReason, rejected, motorArrivedWave, terminalMotor: turn.view.now.motor as BrowserMotor, calls: outcome.calls };
  }, { contract: summary.contract, seed: summary.seed, variant: summary.variant, modules: MODULES });

  expect(browser.opening).toMatchObject({
    contractId: 'e4-dust-flats',
    objective: { kind: 'haul', corridorId: 'camp-to-railhead', stop: { x: 0, z: 72 }, arrived: false, securableAtWave: null },
    roads: { graded: [], friendlySpeedMultiplier: 2.5, friendlyFuelMultiplier: 0.4 },
    fuel: { stored: 0, capacity: 24, harvestedNodes: 0 },
    vehicle: { state: 'idle', x: -20, z: -8 },
  });
  expect(browser.rejected).toEqual([]);
  expect(browser.outcome.eventLogHash).toBe(summary.outcome.eventLogHash);
  expect(browser.outcome).toMatchObject({
    secured: summary.outcome.secured,
    waves: summary.outcome.waves,
    kills: summary.outcome.kills,
    gold: summary.outcome.gold,
    timeMs: summary.outcome.timeMs,
    motor: summary.outcome.motor,
  });
  expect(browser.outcome.motor).toMatchObject({ hauled: true, graded: ['camp-to-railhead'] });
  expect(browser.outcome.motor.roadDistance).toBeGreaterThan(50);
  expect(browser.terminalMotor?.objective).toMatchObject({ arrived: true, securableAtWave: 12 });
  const kinds = [...new Set((browser.terminalMotor?.events ?? []).map((event) => event.type))].sort();
  // The view carries a 12-event tail; the terminal tail always includes the arrival and the storm clock.
  expect(kinds).toEqual(expect.arrayContaining(['motor_haul_arrived', 'motor_weather']));
  expect(browser.terminalMotor?.eventCount).toBe(summary.motorEventCount);
  expect(summary.motorEventKinds).toEqual(E4_EVENT_KINDS);
  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `browser-ride-${testInfo.project.name}.json`), `${JSON.stringify({
    contract: summary.contract, seed: summary.seed, variant: summary.variant,
    node: summary.outcome, browser: browser.outcome, motorArrivedWave: browser.motorArrivedWave, terminalMotor: browser.terminalMotor,
  }, null, 2)}\n`);
  console.log(`[e4-browser-ride] node=${summary.outcome.eventLogHash} browser=${browser.outcome.eventLogHash} waves=${browser.outcome.waves} hauled=${browser.outcome.motor.hauled}`);
  expect(errors).toEqual([]);
});

test('an undeclared Motor map composes no socket and refuses GRADE with a readable reason', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await page.goto(HARNESS('e4-long-road', 'e4-long-road-01'));
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const result = await page.evaluate(async ({ modules }) => {
    const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
    const sim = new HeadlessContractSim({ contractId: 'e4-long-road', seed: 'e4-long-road-01' });
    const opening = sim.currentTurn().view;
    const receipt = sim.submitOrders([{ verb: 'GRADE' }, { verb: 'HAUL' }, { verb: 'HOLD', pos: { x: -180, z: 0 } }]);
    for (let tick = 0; tick < 3; tick += 1) sim.advanceOneTick();
    const orders: BrowserOrder[] = sim.standingOrdersSnapshot().orders
      .map((record: { order: { verb: string }; status: string; reason?: string }) => ({ verb: record.order.verb, status: record.status, reason: record.reason ?? null }));
    const rules: string[] = opening.stablePrefix.mechanics.rules.map((rule: { id: string }) => rule.id);
    return { motor: (opening.now.motor ?? null) as BrowserMotor, accepted: receipt.outcome.ok as boolean, orders, rules };
  }, { modules: MODULES });
  expect(result.motor).toBeNull();
  expect(result.accepted).toBe(true);
  expect(result.orders[0]).toMatchObject({ verb: 'GRADE', status: 'failed' });
  expect(result.orders[0]!.reason).toMatch(/twist\.motorFrontier/);
  expect(result.orders[1]).toMatchObject({ verb: 'HAUL', status: 'failed' });
  expect(result.rules.filter((id: string) => id.startsWith('motor_'))).toEqual([]);
  expect(errors).toEqual([]);
});
