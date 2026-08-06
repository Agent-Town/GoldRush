#!/usr/bin/env node
// ER-02 REHEARSAL RIDER — the command clock's inbox for the SHIPPED headless pipeline.
//
// This file implements NO game verb. Every order goes through the shipped
// StandingOrders/ToolSurface path inside HeadlessContractSim; every view comes from
// the shipped View. Two transports, deliberately:
//   --transport=cli    -> spawns `node scripts/gr-sim.mjs` unmodified and speaks its NDJSON.
//   --transport=inproc -> replicates gr-sim.mjs's own loop in-process, because the CLI
//                         cannot express a difficulty preset (see the review, F-ER02-1).
// The two are proved equivalent on trail by eventLogHash before any vein-hunter number
// is quoted (the control run).
//
// Usage:
//   node play.mjs --contract=e2-trestle --seed=e2-trestle-01 --preset=trail \
//                 --transport=cli --plan=plans/foo.json --out=runs/foo [--mode=escort]

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const opts = parseArgs(process.argv.slice(2));
const plan = JSON.parse(readFileSync(opts.plan, 'utf8'));
mkdirSync(opts.out, { recursive: true });

// ---------------------------------------------------------------- rider state
let riderPlan = [];          // the last order list the RIDER authored
let riderCalls = 0;          // model-clock invocations (the doctrine's budget)
let submissions = 0;         // protocol submissions (what gr-sim counts as `calls`)
let answersUsed = 0;
let viewBytes = 0;
const turns = [];
const seenSurprises = new Set();

const usedAnswers = new Set();
function riderAnswer(view, turnIndex) {
  // Returns the order list to submit this turn, and whether it cost a rider call.
  // First UNUSED answer whose trigger is met — a rider spends a call when its own
  // precondition (a wave reached, a price afforded) is true, not in list order.
  const index = plan.answers.findIndex((a, i) => !usedAnswers.has(i) && triggerMet(a.at, view, turnIndex));
  const next = index >= 0 ? plan.answers[index] : null;
  if (next) {
    usedAnswers.add(index);
    answersUsed += 1;
    riderCalls += 1;
    riderPlan = structuredClone(next.orders);
    return { orders: riderPlan, riderCall: true, note: next.note ?? null };
  }
  // No rider call: the reflex layer carries the standing plan forward.
  return { orders: carry(view), riderCall: false, note: null };
}

function triggerMet(at, view, turnIndex) {
  if (at === undefined) return false;
  if (at.turn !== undefined) return turnIndex >= at.turn;
  if (at.wave !== undefined) return view.now.wave >= at.wave;
  if (at.gold !== undefined) return view.now.gold >= at.gold;
  return false;
}

// THE CARRY POLICY — the only thing the reflex layer decides, stated so it can be audited.
// The protocol forces a submission every turn and every submission REPLACES the record
// set, so "say nothing" does not exist. `remainder` re-states the orders that have not
// yet succeeded; `all` re-states everything (and re-buys); `none` submits [].
function carry(view) {
  const records = view.now.orders ?? [];
  if (plan.carry === 'all' || records.length === 0) return riderPlan;
  if (plan.carry === 'none') return [];
  const doneKeys = new Set(
    records.filter((r) => r.status === 'done').map((r) => orderKey(r.order)),
  );
  const failedKeys = new Set(
    records.filter((r) => r.status === 'failed').map((r) => orderKey(r.order)),
  );
  return riderPlan.filter((order) => {
    const key = orderKey(order);
    if (doneKeys.has(key)) return false;                       // already served
    if (plan.carry === 'remainder-noretry' && failedKeys.has(key)) return false;
    return true;                                               // default: failures re-arm
  });
}

const orderKey = (order) => JSON.stringify(order);

// ---------------------------------------------------------------- turn handling
function onView(line) {
  viewBytes += Buffer.byteLength(line, 'utf8');
  const view = JSON.parse(line);
  const turnIndex = turns.length;
  const fresh = (view.now.orders ?? []).flatMap((r) =>
    r.status === 'failed' && !seenSurprises.has(r.id + r.reason)
      ? [(seenSurprises.add(r.id + r.reason), { id: r.id, reason: r.reason })]
      : [],
  );
  const answer = riderAnswer(view, turnIndex);
  submissions += 1;
  turns.push({
    turn: turnIndex,
    wave: view.now.wave,
    runSeconds: view.now.timers.runSeconds,
    gold: view.now.gold,
    heroHp: view.now.hero.hp,
    heroAt: { x: view.now.hero.x, z: view.now.hero.z },
    works: view.now.works,
    threats: view.now.threats,
    seams: (view.now.seams ?? []).filter((s) => s.active).map((s) => s.id),
    needsRider: view.now.needsRider,
    orderStates: (view.now.orders ?? []).map((r) => ({ id: r.id, verb: r.order.verb, status: r.status, reason: r.reason ?? null })),
    newFailures: fresh,
    almanac: view.almanac?.projection ?? null,
    riderCall: answer.riderCall,
    note: answer.note,
    submitted: answer.orders,
    viewBytes: Buffer.byteLength(line, 'utf8'),
  });
  // Keep every rider-call view and a stride of the rest: a livelocked run can emit
  // thousands of turns and 76 MB (measured), and the storm is the finding, not the bytes.
  if (answer.riderCall || turnIndex % 25 === 0 || turnIndex < 5) {
    writeFileSync(path.join(opts.out, `view-${String(turnIndex).padStart(5, '0')}.json`), line);
  }
  if (opts.maxTurns && turns.length >= Number(opts.maxTurns)) throw new TurnCap(turnIndex);
  return answer.orders;
}

class TurnCap extends Error {
  constructor(turn) { super(`turn cap ${turn}`); this.turn = turn; }
}

function finish(outcome, extra = {}) {
  const summary = {
    label: plan.label ?? path.basename(opts.out),
    contract: opts.contract,
    seed: opts.seed,
    preset: opts.preset,
    mode: opts.mode ?? null,
    transport: opts.transport,
    carry: plan.carry ?? 'remainder',
    outcome,
    riderCalls,
    submissions,
    turns: turns.length,
    viewBytes,
    estMarginalTokens: Math.round(viewBytes / 4),
    ...extra,
  };
  writeFileSync(path.join(opts.out, 'result.json'), JSON.stringify({ summary, turns }, null, 1));
  // TAPE-01-shaped record, with the fields the headless door cannot fill marked null.
  writeFileSync(path.join(opts.out, 'tape.json'), JSON.stringify({
    version: 1,
    id: `er02-${summary.label}`,
    createdAt: null,                     // gr-sim forbids wall-clock (determinism)
    kept: true,
    contract: opts.contract,
    seed: opts.seed,
    difficulty: opts.preset,
    simVersion: null,                    // NOT PUBLISHED by the headless door
    inputLog: null,                      // NOT RECORDED: no PlaybookRecording in gr-sim
    orderLog: turns.map((t) => ({ turn: t.turn, wave: t.wave, riderCall: t.riderCall, orders: t.submitted })),
    eventLogHash: outcome.eventLogHash,  // present, but a different payload from RunTape's
    outcome: { reason: outcome.secured ? 'secured' : 'death', secured: outcome.secured, waves: outcome.waves, timeAlive: outcome.timeMs / 1000, gold: outcome.gold },
  }, null, 1));
  console.log(JSON.stringify(summary));
}

// ---------------------------------------------------------------- transports
if (opts.transport === 'cli') {
  const args = ['scripts/gr-sim.mjs', `--contract=${opts.contract}`, `--seed=${opts.seed}`, '--policy=stdin'];
  if (opts.mode) args.push(`--mode=${opts.mode}`);
  const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (d) => stderr.push(String(d)));
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
  let last = null;
  let capped = false;
  try {
    for await (const line of rl) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      if (parsed.schema === 'goldrush.view.v1') {
        const orders = onView(line);
        if (!child.stdin.destroyed) child.stdin.write(`${JSON.stringify(orders)}\n`);
      } else {
        last = parsed;
      }
    }
  } catch (error) {
    if (!(error instanceof TurnCap)) throw error;
    capped = true;
    child.kill('SIGKILL');
  }
  const code = await new Promise((r) => child.on('close', r));
  if (capped) {
    const t = turns.at(-1);
    finish({ secured: false, waves: t.wave, timeMs: Math.round(t.runSeconds * 1000), gold: t.gold, kills: 0, calls: submissions, eventLogHash: null }, { turnCapped: true });
    process.exit(0);
  }
  if (!last) {
    writeFileSync(path.join(opts.out, 'crash.txt'), stderr.join(''));
    console.error(`NO OUTCOME (exit ${code}):\n${stderr.join('')}`);
    finish({ secured: false, waves: turns.at(-1)?.wave ?? 0, timeMs: 0, gold: 0, kills: 0, calls: submissions, eventLogHash: null }, { crashed: true, stderr: stderr.join('') });
    process.exit(0);
  }
  finish(last, { stderr: stderr.join('') });
} else {
  // In-process: gr-sim.mjs's own loop, plus the one thing its CLI cannot say.
  const { createServer } = await import('vite');
  const location = new URL('http://gr-sim.local/');
  location.searchParams.set('debug', '');
  location.searchParams.set('contract', opts.contract);
  location.searchParams.set('seed', opts.seed);
  if (opts.preset !== 'trail') location.searchParams.set('preset', opts.preset);
  globalThis.location = location;
  globalThis.window = { location };

  const quiet = { log: console.log, info: console.info, debug: console.debug };
  console.log = console.info = console.debug = () => undefined;
  // vite.config.ts reads its own paths off process.cwd(); gr-sim.mjs is only ever run
  // from the repo root, so match it exactly or the config load throws ENOENT.
  process.chdir(REPO);
  const vite = await createServer({ root: REPO, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  let presetProof = null;
  try {
    // The SHIPPED read+apply path — byte-for-byte what src/main.ts:130 does at boot.
    const balance = await vite.ssrLoadModule('/src/game/Balance.ts');
    const applied = balance.applyStoredDifficultyPreset();
    presetProof = { applied, enemyHp: balance.Balance.enemy.hp, xpPerKill: balance.Balance.xp.perKill, investBonus: balance.Balance.offers.investBonus };
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: opts.contract, seed: opts.seed, mode: opts.mode });
    const waveCeiling = (sim.manifest.twist.secureWave ?? 20) + 2;
    Object.assign(console, quiet);
    let turn = sim.currentTurn();
    let ceilingHit = false;
    while (true) {
      if (turn.view.now.wave > waveCeiling) { ceilingHit = true; break; }
      const orders = onView(JSON.stringify(turn.view));
      if (turn.terminal) break;
      const receipt = sim.submitOrders(orders);
      if (!receipt.outcome.ok) turns.at(-1).rejected = receipt.outcome.message ?? receipt.outcome.reason;
      turn = sim.advanceToTurn();
    }
    if (ceilingHit) {
      finish({ secured: false, waves: turn.view.now.wave, timeMs: Math.round(turn.view.now.timers.runSeconds * 1000), gold: turn.view.now.gold, kills: 0, calls: submissions, eventLogHash: null }, { ceilingHit: true, presetProof });
    } else {
      finish(sim.outcome(), { presetProof });
    }
  } finally {
    Object.assign(console, quiet);
    await vite.close();
  }
}

function parseArgs(args) {
  const v = {};
  for (const raw of args) {
    const m = /^--([^=]+)=(.*)$/.exec(raw);
    if (!m) throw new Error(`bad arg ${raw}`);
    v[m[1]] = m[2];
  }
  for (const k of ['contract', 'seed', 'plan', 'out']) if (!v[k]) throw new Error(`--${k} required`);
  v.preset ??= 'trail';
  v.transport ??= 'cli';
  if (v.transport === 'cli' && v.preset !== 'trail') throw new Error('the shipped CLI cannot express a preset (F-ER02-1)');
  return v;
}
