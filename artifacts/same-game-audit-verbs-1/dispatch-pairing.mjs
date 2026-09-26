#!/usr/bin/env node
// same-game-audit-verbs-1, scope 2: does the harness's order that sends the Prospector (HARVEST) produce what a
// solo `prospector_dispatch` produces? Measured with the sim, per contract, same contract and same seed.
//
// THE METHOD IS THE AUDIT'S OWN, TWICE OVER.
//   1. Where the audit cannot run the browser it LIFTS Game.ts source and evaluates it in node
//      (`browserPredicate`, scripts/same-game-audit.mjs). Arm D does the same with the dispatch itself:
//      `beginProspectorDispatch`, `advanceProspectorDispatch`, `prospectorDispatchPoint`, `distanceSq2` and
//      `PROSPECTOR_DISPATCH_SETTLE_TICKS` are read out of src/game/Game.ts at run time, transpiled, and run
//      against the harness's world. Nothing of the dispatch is retyped here, so a change to it in Game.ts
//      changes this measurement.
//   2. The audit measures the door by booting HeadlessContractSim per contract with its own seed
//      (`same-game-seam-<id>`, the seam row). Every arm below boots exactly that.
// The three substitutions the lift needs, and why each is faithful:
//   this.prospector      -> sim.prospector: the SAME ProspectorEmbodiment class both engines move.
//   this.panAgentAt(n)   -> sim.panAt(n): the harness's twin of Game.panAgentAt, the one pan_at a HARVEST
//                           order reaches in this engine, so both arms pan through ONE function.
//   this.state           -> playing until the harness is terminal (the harness has no pause).
// Tick placement mirrors Game.ts: the action is applied at the top of the tick (applyMultiplayerActions) and
// advanceProspectorDispatch runs right after prospector.updateSimulation. The harness step ends with systems
// that read the hero only (hollow crossing, suit air, light), so running advance after advanceOneTick() is the
// same point in the order for the Prospector and the harvest.
//
// Arms, per contract, each on a FRESH sim with one warm-up tick (e2e/same-laws-harvest-parity.spec.ts steps
// one before issuing):  D = one dispatch; H = one HARVEST {seam} through sim.submitOrders; C = no command.
// D and H are each run twice to prove the seed reproduces the world. The target is the active seam nearest the
// Prospector in the rider's own view; the window is 30 s after the command, or 10 s past the straight-line
// arrival when the seam is further than 30 s away. Then, once on the Claim: the wire (a `prospector_dispatch`
// handed to the harness's peer-action seam, applyWireAction) and the sluice half of the dispatch.
// Usage: node artifacts/same-game-audit-verbs-1/dispatch-pairing.mjs  (SGA1_ONLY=<id,id> narrows it).
// SGA1_PAN_LEGEND_STACKS=<n> gives BOTH arms n stacks of `pan_legend` after the warm-up tick, through the stat path
// Progression.applyUpgrade itself takes (stacks, effectiveStats, onStatsChanged) minus its offer gate, and writes
// dispatch-pairing-pan-legend-<n>.json: it asks whether HARVEST's post-pan linger earns a passive pan the dispatch
// does not once panning is faster (in this engine the Prospector is the harvest actor '0', so standing at a seam
// channels it). The committed county run is the default, 0 stacks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = process.env.SGA1_OUT ?? fileURLToPath(new URL('./', import.meta.url)); // SGA1_OUT redirects the JSON
const WINDOW_TICKS = 900; // 30 s of 1/30 s fixed steps from the command, the floor of every arm's window
const PAN_LEGEND_STACKS = Number(process.env.SGA1_PAN_LEGEND_STACKS ?? 0);
const STEP_SECONDS = 1 / 30;
const print = (text) => process.stdout.write(`${text}\n`);
console.log = () => undefined;
console.info = () => undefined;

function between(text, start, end) {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`source shape missing: ${start}`);
  return text.slice(from, to);
}
function lineOf(text, needle) {
  const index = text.indexOf(needle);
  if (index < 0) throw new Error(`anchor missing: ${needle}`);
  return text.slice(0, index).split('\n').length;
}

const gameFile = 'src/game/Game.ts';
const gameSource = fs.readFileSync(path.join(ROOT, gameFile), 'utf8');
const lifted = ['beginProspectorDispatch', 'advanceProspectorDispatch', 'prospectorDispatchPoint'].map((name) => {
  const start = `  private ${name}(`;
  return { name, line: lineOf(gameSource, start), text: `${between(gameSource, start, '\n  }')}\n  }` };
});
const distanceSq2 = { line: lineOf(gameSource, 'function distanceSq2('), text: `${between(gameSource, 'function distanceSq2(', '\n}')}\n}` };
const settleMatch = /^const PROSPECTOR_DISPATCH_SETTLE_TICKS = (\d+);$/m.exec(gameSource);
if (!settleMatch) throw new Error('PROSPECTOR_DISPATCH_SETTLE_TICKS shape changed');
const settle = { line: lineOf(gameSource, settleMatch[0]), value: Number(settleMatch[1]) };
const classSource = [
  distanceSq2.text,
  `const PROSPECTOR_DISPATCH_SETTLE_TICKS = ${settle.value};`,
  'class BrowserDispatch {',
  ...lifted.map((entry) => entry.text),
  '}',
].join('\n');
const transpiled = ts.transpileModule(classSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

const vite = await createServer({ root: ROOT, server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' });
let HeadlessContractSim;
let supportedContractIds;
let Balance;
let effectiveStats;
try {
  ({ HeadlessContractSim, supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'));
  ({ Balance } = await vite.ssrLoadModule('/src/game/Balance.ts'));
  ({ effectiveStats } = await vite.ssrLoadModule('/src/game/StatSheet.ts'));
} finally {
  await vite.close();
}
const BrowserDispatch = Function('Balance', `${transpiled}\nreturn BrowserDispatch;`)(Balance);

/** Game.ts's own dispatch methods, bound to one harness sim. */
function dispatcher(sim) {
  const shim = Object.create(BrowserDispatch.prototype);
  Object.defineProperties(shim, {
    prospector: { get: () => sim.prospector },
    harvestSnapshot: { get: () => sim.harvestSnapshot },
    buildSystem: { get: () => sim.build },
    state: { get: () => ({ current: sim.isTerminal ? 'dead' : 'playing', isPaused: false }) },
  });
  shim.runTapeReplay = null;
  shim.prospectorDispatchQueue = [];
  shim.prospectorDispatchSettleTicks = 0;
  shim.panAgentAt = (node) => sim.panAt(node);
  shim.speakTrailGuide = () => undefined; // presentation only: a trail-guide bark
  return shim;
}

function contracts() {
  const dir = path.join(ROOT, 'assets/contracts');
  return fs.readdirSync(dir)
    .map((epoch) => path.join(dir, epoch, 'contracts.json'))
    .filter((file) => fs.existsSync(file))
    .sort()
    .flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')).contracts);
}

const round4 = (value) => Math.round(value * 10_000) / 10_000;
const seedFor = (id) => `same-game-seam-${id}`;

function boot(contractId) {
  const sim = new HeadlessContractSim({ contractId, seed: seedFor(contractId), admissionProbe: true });
  sim.advanceOneTick();
  if (PAN_LEGEND_STACKS > 0) {
    // Progression.applyUpgrade's own stat path (src/game/Progression.ts), without the offer gate.
    const progression = sim.progression;
    progression.stacksValue.pan_legend = PAN_LEGEND_STACKS;
    progression.statsValue = effectiveStats(progression.stacksValue);
    progression.options.onStatsChanged(progression.statsValue, 'pan_legend');
  }
  return sim;
}

/** The target a player would click: the active seam nearest the Prospector, read off the rider's own view. */
function chooseTarget(contractId) {
  const sim = boot(contractId);
  const from = sim.prospector.position;
  const seams = sim.currentTurn().view.now.seams
    .filter((seam) => seam.active)
    .map((seam) => ({ id: seam.id, x: seam.x, z: seam.z, remaining: seam.remaining, distance: round4(Math.hypot(seam.x - from.x, seam.z - from.z)) }))
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  return { target: seams[0] ?? null, activeSeams: seams.length, prospectorStart: { x: round4(from.x), z: round4(from.z) } };
}

/** 30 s, or 10 s past the straight-line arrival at Balance.agent.moveSpeed when the target is further than that. */
function windowFor(target) {
  return Math.max(WINDOW_TICKS, Math.ceil(target.distance / (Balance.agent.moveSpeed * STEP_SECONDS)) + 300);
}

function runArm(contractId, target, command, setup = null) {
  const sim = boot(contractId);
  if (setup) setup(sim);
  const windowTicks = windowFor(target);
  const t0 = sim.timeAlive;
  const logStart = sim.economy.log.length;
  const remainingOf = () => sim.harvestSnapshot.activeNodes.find((node) => node.id === target.id)?.remaining ?? null;
  const before = remainingOf();
  let shim = null;
  let accepted = null;
  let refusal = null;
  if (command === 'dispatch') {
    shim = dispatcher(sim);
    accepted = shim.beginProspectorDispatch(target.id);
  } else if (command === 'harvest') {
    const sluice = /^sluice-(\d+)$/.exec(target.id)?.[1];
    const order = sluice ? { verb: 'HARVEST', sluice: Number(sluice) - 1 } : { verb: 'HARVEST', seam: target.id };
    const receipt = sim.submitOrders([order]);
    accepted = receipt.outcome.ok;
    if (!accepted) refusal = receipt.outcome.reason ?? 'refused';
  } else if (command === 'wire') {
    accepted = sim.applyWireAction({ type: 'prospector_dispatch', node: target.id });
  }
  const trace = [];
  let arrivedTick = null;
  let ticks = 0;
  for (let tick = 1; tick <= windowTicks && !sim.isTerminal; tick += 1) {
    sim.advanceOneTick();
    if (shim) shim.advanceProspectorDispatch();
    ticks = tick;
    const p = sim.prospector.position;
    trace.push([round4(p.x), round4(p.z)]);
    if (arrivedTick === null && Math.hypot(p.x - target.x, p.z - target.z) <= Balance.agent.arriveRadius) arrivedTick = tick;
  }
  const tickOf = (at) => Math.round((at - t0) * 30);
  const pans = sim.economy.log.slice(logStart).filter((event) => event.type === 'gold_panned');
  const onTarget = pans.filter((event) => event.nodeId === target.id).map((event) => ({ tick: tickOf(event.at), amount: event.amount }));
  const firstPan = onTarget[0]?.tick ?? null;
  const atFirstPan = firstPan === null ? null : trace[firstPan - 1];
  // The first tick, after the Prospector reached the target, on which it stands outside arriveRadius again.
  const leftTick = arrivedTick === null ? null
    : (trace.findIndex((p, index) => index >= arrivedTick && Math.hypot(p[0] - target.x, p[1] - target.z) > Balance.agent.arriveRadius) + 1 || null);
  const order = command === 'harvest'
    ? sim.standingOrdersSnapshot().orders.map((record) => ({ status: record.status, ...(record.reason ? { reason: record.reason } : {}) }))
    : null;
  const end = trace.at(-1);
  return {
    command,
    accepted,
    ...(refusal ? { refusal } : {}),
    ticks,
    terminal: sim.isTerminal,
    arrivedTick,
    leftTick,
    pansOnTarget: onTarget,
    goldPannedOnTarget: onTarget.reduce((sum, event) => sum + event.amount, 0),
    pansElsewhere: pans.length - onTarget.length,
    remainingBefore: before,
    remainingAfter: remainingOf(),
    goldAtEnd: round4(sim.economy.gold),
    prospectorAtFirstPan: atFirstPan,
    distanceAtFirstPan: atFirstPan ? round4(Math.hypot(atFirstPan[0] - target.x, atFirstPan[1] - target.z)) : null,
    prospectorAtEnd: end,
    dispatchQueueLeft: shim ? shim.prospectorDispatchQueue.length : null,
    order,
    trace,
  };
}

const strip = ({ trace: _trace, ...rest }) => rest;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const supported = new Set(supportedContractIds());
const results = [];
const started = Date.now();
// SGA1_ONLY=<id,id> narrows the run for a quick look; the committed evidence is the full county run.
const only = process.env.SGA1_ONLY ? new Set(process.env.SGA1_ONLY.split(',')) : null;
for (const contract of contracts().filter((entry) => !only || only.has(entry.id))) {
  // The audit's own admission expression (scripts/same-game-audit.mjs, `agentCanEnter`).
  const agentCanEnter = supported.has(contract.id) || (contract.modes?.length ?? 0) > 0;
  const scout = chooseTarget(contract.id);
  if (!scout.target) {
    results.push({ contract: contract.id, agentCanEnter, activeSeams: 0, verdict: 'no-target', note: 'no active seam in the view at the command tick' });
    continue;
  }
  const { target } = scout;
  const D = runArm(contract.id, target, 'dispatch');
  const H = runArm(contract.id, target, 'harvest');
  const C = runArm(contract.id, target, 'none');
  const D2 = runArm(contract.id, target, 'dispatch');
  const H2 = runArm(contract.id, target, 'harvest');
  const firstD = D.pansOnTarget[0]?.tick ?? null;
  const firstH = H.pansOnTarget[0]?.tick ?? null;
  // The walk: tick for tick from the command to the arrival (the first tick within arriveRadius of the target).
  const samePath = D.arrivedTick !== null && D.arrivedTick === H.arrivedTick
    && same(D.trace.slice(0, D.arrivedTick), H.trace.slice(0, H.arrivedTick));
  const endGap = round4(Math.hypot(D.prospectorAtEnd[0] - H.prospectorAtEnd[0], D.prospectorAtEnd[1] - H.prospectorAtEnd[1]));
  const checks = {
    bothAccepted: D.accepted === true && H.accepted === true,
    commandCausedAPan: D.pansOnTarget.length > C.pansOnTarget.length && H.pansOnTarget.length > C.pansOnTarget.length,
    samePansOnTarget: same(D.pansOnTarget.map((event) => event.amount), H.pansOnTarget.map((event) => event.amount)),
    sameGoldPanned: D.goldPannedOnTarget === H.goldPannedOnTarget,
    sameRemainingAfter: D.remainingAfter === H.remainingAfter,
    samePansElsewhere: D.pansElsewhere === H.pansElsewhere,
    sameGoldAtEnd: D.goldAtEnd === H.goldAtEnd,
    samePathAndArrivalTick: samePath,
    bothPannedAtTheSeam: (D.distanceAtFirstPan ?? Infinity) <= Balance.agent.arriveRadius && (H.distanceAtFirstPan ?? Infinity) <= Balance.agent.arriveRadius,
    deterministic: same(strip(D), strip(D2)) && same(strip(H), strip(H2)) && same(D.trace, D2.trace) && same(H.trace, H2.trace),
  };
  const holds = Object.values(checks).every(Boolean);
  results.push({
    contract: contract.id,
    agentCanEnter,
    seed: seedFor(contract.id),
    activeSeams: scout.activeSeams,
    prospectorStart: scout.prospectorStart,
    target,
    verdict: holds ? 'pairs' : 'differs',
    checks,
    windowTicks: D.ticks,
    firstPanTick: { dispatch: firstD, harvest: firstH, dispatchMinusHarvest: firstD !== null && firstH !== null ? firstD - firstH : null },
    arrivedTick: { dispatch: D.arrivedTick, harvest: H.arrivedTick },
    leftTargetTick: { dispatch: D.leftTick, harvest: H.leftTick, harvestMinusDispatch: D.leftTick !== null && H.leftTick !== null ? H.leftTick - D.leftTick : null },
    endGap,
    arms: { dispatch: strip(D), harvest: strip(H), control: strip(C) },
  });
}

// The wire, once, on the Claim: the harness's only door for a peer's action (applyWireAction) honours place_build
// alone, so a dispatch arriving on the wire is REPORTED as not honoured (returns false) and moves nothing.
const claim = results.find((entry) => entry.contract === 'the-claim');
const wire = claim?.target ? strip(runArm('the-claim', claim.target, 'wire')) : null;

// The sluice half of the dispatch (`sluice-N` resolves to BuildSystem's Nth active sluice, Game.ts prospectorDispatchPoint),
// once, on the Claim. A sluice has to exist first, so each arm gets the SAME setup on its fresh sim before the
// command: the sluice's cost granted through the Economy (a `debug` grant, the sole gold writer) and one sluice
// placed through the harness's public wire seam (applyWireAction place_build) at the first spot, nearest the
// hero, that the build rules accept. Then D dispatches `sluice-1` and H orders HARVEST {sluice: 0}.
function placeSluice(sim) {
  sim.economy.apply({ id: 'sga1-sluice-grant', at: sim.timeAlive, type: 'gold_granted', source: 'debug', amount: Balance.sluice.cost });
  const hero = sim.hero.group.position;
  const spots = [];
  for (let x = -12; x <= 12; x += 1) for (let z = -12; z <= 16; z += 1) spots.push({ x, z });
  spots.sort((a, b) => Math.hypot(a.x - hero.x, a.z - hero.z) - Math.hypot(b.x - hero.x, b.z - hero.z) || a.x - b.x || a.z - b.z);
  for (const position of spots) {
    if (sim.applyWireAction({ type: 'place_build', id: 'sluice', position, rotationSteps: 0 })) return { position, sluices: sim.build.diagnostics.sluicePositions.map((p) => ({ x: round4(p.x), z: round4(p.z) })) };
  }
  return null;
}
let sluice = null;
if (!only || only.has('the-claim')) {
  const probe = boot('the-claim');
  const placed = placeSluice(probe);
  if (placed && placed.sluices.length === 1) {
    const from = probe.prospector.position;
    const s0 = placed.sluices[0];
    const target = { id: 'sluice-1', x: s0.x, z: s0.z, distance: round4(Math.hypot(s0.x - from.x, s0.z - from.z)) };
    const setup = (sim) => { placeSluice(sim); };
    const D = runArm('the-claim', target, 'dispatch', setup);
    const H = runArm('the-claim', target, 'harvest', setup);
    const C = runArm('the-claim', target, 'none', setup);
    sluice = {
      contract: 'the-claim',
      placedAt: placed.position,
      target,
      checks: {
        bothAccepted: D.accepted === true && H.accepted === true,
        bothReachedTheSluice: D.arrivedTick !== null && H.arrivedTick !== null,
        samePathAndArrivalTick: D.arrivedTick === H.arrivedTick && same(D.trace.slice(0, D.arrivedTick), H.trace.slice(0, H.arrivedTick)),
        controlNeverArrives: C.arrivedTick === null,
        neitherPans: D.pansOnTarget.length === 0 && H.pansOnTarget.length === 0,
        sameGoldAtEnd: D.goldAtEnd === H.goldAtEnd,
        dispatchServed: D.dispatchQueueLeft === 0,
        orderDone: (H.order ?? []).every((record) => record.status === 'done'),
      },
      arms: { dispatch: strip(D), harvest: strip(H), control: strip(C) },
    };
    sluice.verdict = Object.values(sluice.checks).every(Boolean) ? 'pairs' : 'differs';
  } else {
    sluice = { contract: 'the-claim', verdict: 'unmeasured', note: 'no sluice could be placed', placed };
  }
}

const pairs = results.filter((entry) => entry.verdict === 'pairs');
const differs = results.filter((entry) => entry.verdict === 'differs');
const noTarget = results.filter((entry) => entry.verdict === 'no-target');
const summary = {
  contracts: results.length,
  pairs: pairs.length,
  differs: differs.length,
  noTarget: noTarget.length,
  pairsAmongDoorAdmitted: pairs.filter((entry) => entry.agentCanEnter).length,
  doorAdmitted: results.filter((entry) => entry.agentCanEnter).length,
  firstPanDeltaTicks: [...new Set(results.filter((entry) => entry.firstPanTick?.dispatchMinusHarvest !== undefined)
    .map((entry) => entry.firstPanTick.dispatchMinusHarvest))].sort((a, b) => a - b),
  linger: [...new Set(results.filter((entry) => entry.leftTargetTick?.harvestMinusDispatch !== undefined)
    .map((entry) => entry.leftTargetTick.harvestMinusDispatch))].sort((a, b) => a - b),
  sluice: sluice?.verdict ?? null,
  wallMs: Date.now() - started,
};
const report = {
  schema: 'same-game-audit-verbs-1.dispatch-pairing.v1',
  windowTicks: WINDOW_TICKS,
  panLegendStacks: PAN_LEGEND_STACKS,
  panTickMult: boot('the-claim').progression.stats.panTickMult,
  lifted: {
    file: gameFile,
    methods: lifted.map(({ name, line }) => `${gameFile}:${line} ${name}`),
    distanceSq2: `${gameFile}:${distanceSq2.line}`,
    settleTicks: `${gameFile}:${settle.line} = ${settle.value}`,
  },
  arriveRadius: Balance.agent.arriveRadius,
  summary,
  wire,
  sluice,
  results,
};
fs.writeFileSync(path.join(OUT, PAN_LEGEND_STACKS > 0 ? `dispatch-pairing-pan-legend-${PAN_LEGEND_STACKS}.json` : 'dispatch-pairing.json'), `${JSON.stringify(report, null, 2)}\n`);

print(`lifted: ${report.lifted.methods.join(', ')}; ${report.lifted.distanceSq2} distanceSq2; settle ${report.lifted.settleTicks}`);
print(`window ${WINDOW_TICKS} ticks after the command (or 10 s past the arrival); seed same-game-seam-<id>; one warm-up tick; pan_legend stacks ${PAN_LEGEND_STACKS} (panTickMult ${report.panTickMult})`);
print('');
print('| contract | door admits | target (distance) | window | dispatch: first pan tick, gold | HARVEST: first pan tick, gold | control pans | pan D-H | left seam H-D | verdict |');
print('|---|---|---|---:|---|---|---:|---:|---:|---|');
for (const entry of results) {
  if (entry.verdict === 'no-target') {
    print(`| ${entry.contract} | ${entry.agentCanEnter} | none | - | - | - | - | - | - | ${entry.verdict} |`);
    continue;
  }
  const { dispatch: D, harvest: H, control: C } = entry.arms;
  print(`| ${entry.contract} | ${entry.agentCanEnter} | ${entry.target.id} (${entry.target.distance}) | ${entry.windowTicks} | ${entry.firstPanTick.dispatch}, ${D.goldPannedOnTarget} | ${entry.firstPanTick.harvest}, ${H.goldPannedOnTarget} | ${C.pansOnTarget.length} | ${entry.firstPanTick.dispatchMinusHarvest} | ${entry.leftTargetTick.harvestMinusDispatch} | ${entry.verdict}${entry.verdict === 'differs' ? ` (${Object.entries(entry.checks).filter(([, ok]) => !ok).map(([name]) => name).join(', ')})` : ''} |`);
}
print('');
print(`summary ${JSON.stringify(summary)}`);
print(`wire (the-claim): applyWireAction(prospector_dispatch) returned ${wire?.accepted}; pans on target ${wire?.pansOnTarget.length}; control pans ${claim?.arms.control.pansOnTarget.length}`);
if (sluice?.arms) {
  const { dispatch: D, harvest: H } = sluice.arms;
  print(`sluice (the-claim, placed at ${JSON.stringify(sluice.placedAt)}, ${sluice.target.id} at ${sluice.target.x},${sluice.target.z}, distance ${sluice.target.distance}): dispatch arrived ${D.arrivedTick} left ${D.leftTick} pans ${D.pansOnTarget.length} queue ${D.dispatchQueueLeft}; HARVEST arrived ${H.arrivedTick} left ${H.leftTick} pans ${H.pansOnTarget.length} order ${JSON.stringify(H.order)}; gold at end ${D.goldAtEnd} / ${H.goldAtEnd}; verdict ${sluice.verdict}${sluice.verdict === 'differs' ? ` (${Object.entries(sluice.checks).filter(([, ok]) => !ok).map(([name]) => name).join(', ')})` : ''}`);
} else if (sluice) {
  print(`sluice: ${JSON.stringify(sluice)}`);
}
