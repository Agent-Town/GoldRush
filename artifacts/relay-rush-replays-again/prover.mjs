/**
 * RELAY RUSH — THE PUBLIC-VERB PROVER. Light three relay grounds, let the static wall roll over a
 * running program, hold the second ground, secure at wave 20.
 *
 *   node artifacts/relay-rush-replays-again/prover.mjs --seed e7-relay-rush-01
 *   node artifacts/relay-rush-replays-again/prover.mjs --all > artifacts/relay-rush-replays-again/prover.json
 *
 * WHAT MAKES THIS A PROVER RATHER THAN A PROBE (the door law, `reviews/e6-picnic-admission.md` §3,
 * and the shape of `artifacts/e10s-4-door/prover.mjs`): it drives `scripts/gr-sim.mjs` as a
 * separate process over stdin/stdout in the door's OWN vocabulary and nothing else — BLAST_AT,
 * BUILD, HARVEST, HOLD, PLAYBOOK_USE, SECURE_CHOICE. No engine import, no private handle, no
 * balance edit, no minted gold. Every coin spent on a relay was panned out of an authored seam.
 *
 * THE MAP, IN THE THREE RULES THAT DECIDE IT (all read off the contract, none chosen here):
 *   - `twist.interferenceFront`: a 12wu wall of static crosses the whole corridor every 90 s and
 *     takes 20 s to do it, so it stands over any one point for about two seconds
 *     (`src/systems/InterferenceFrontSystem.ts:38,41,60`);
 *   - THE DEADLINE: three of the four surveyed relay grounds must carry a standing POWERED work — a
 *     turret or a sentry beacon, nothing else (`POWERED_RELAY_KINDS`) — when the THIRD front
 *     arrives at t = 270 s. Missing it is final: the run can no longer secure at any wave
 *     (`InterferenceFrontSystem.ts:291-295`);
 *   - THE ERA'S ERRAND (`E7PlaybookLatch`, objective `suspended` on this map): the claim is not
 *     opened by surviving. `interferenceFront.refusals.playbooks` must be greater than zero — the
 *     rider must have had a playbook MUTED by the wall — or `autoSecureWaveForRun` refuses the
 *     secure at every wave (`src/sim/HeadlessContractSim.ts:1473`).
 *
 * HOW THE ERRAND IS DISCHARGED, and why it takes two turns rather than one. A `PLAYBOOK_USE` that
 * is NOT standing in the wall is accepted: it records the rider's submissions so far as a named
 * tape and INSTALLS them as the standing program. A running program is asked the wall's question
 * again on every fixed step (`syncProgramSuspension`), so it is enough to use the playbook in the
 * calm and then LEAVE THE WHEEL ALONE while the next front crosses — the suspension is the
 * refusal, and it is counted. gr-sim reads a bare newline as "no orders this turn", which is how a
 * rider declines to take the wheel back without lying about what it did.
 *
 * The first front arrives at t = 90 s, so the playbook is used on the first turn at or after 55 s
 * and the wheel is left alone until the front has passed. Nothing here is timed against a
 * stopwatch: the loop watches `now.playbookUse.objectiveMet` and takes the wheel back the turn
 * after it turns true.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e7-relay-rush';
const SEEDS = [`${CONTRACT}-01`, `${CONTRACT}-02`];

/** The claim's stake, where the guns can stand with the hero (the briefing's own words). */
const HOLD_AT = { x: -25, z: 35 };
/** The north approach, one blast radius ahead of the stake. */
const BLAST_AT = { x: -25, z: 41 };
/** The rider's own submission ceiling, restated (`PROGRAM_ORDER_CAP`, `HeadlessContractSim:564`). */
const ORDER_CAP = 31;
/** Everything the cap leaves after the turn's errand is spent panning. */
const PANS_PER_TURN = 28;

/**
 * THE PICK ORDER, and why it is a list rather than a rule. `PICK_UPGRADE` is refused outright
 * unless the id is in `state.pendingOffer` (`src/agent/StandingOrders.ts:273-276`), and a refusal
 * rejects the WHOLE submission — so a rider must read the offer off `now.pendingOffer` and name
 * something it can actually see. Left to itself the sim takes the first offer
 * (`hero.upgradeChoiceRule`), which is what the first ride of this prover did: it discharged both
 * era gates and still died at wave 15 / 458.1 s with the hero at 100 max hp and sixteen picks
 * defaulted. The wave-18 wall is the same one Relay Valley measured (F-RVW-5) — the hero is welded
 * and only hit points cross it — so plating leads, three stacks of it (+25 hp and +25 heal each,
 * `src/game/Upgrades.ts:76-82`), and the rest is what shoots back.
 */
const PICK_ORDER = [
  'tinkers_plating',
  'field_dressing',
  'heavy_spark',
  'double_tap_coil',
  'split_spark',
  'long_resonator',
  'beacon_dynamo',
  'sharpen',
  'wide_ring',
  'quick_fuse',
  'powder_charge',
  'prospectors_luck',
  'pan_legend',
  'auto_pan',
  'assay_bonus',
  'spring_heels',
];
const PLAYBOOK_NAME = 'relay-program';
/** The first front arrives at 90 s; the program has to be installed and running before it. */
const PLAYBOOK_AT_SECONDS = 55;

/**
 * THE LADDER, in build order. The first three entries put a powered work on three DIFFERENT
 * grounds (r2, r1, r3) as cheaply as the price ladder allows, which is the deadline discharged by
 * t ≈ 45 s — six times the margin the third front needs. Everything after that is defence on the
 * staked ground, because that is where the hero is welded (F-RVW-6) and the crowd arrives there.
 * Prices are the registry's own ladders as the contract's mechanics manifest publishes them
 * (`sentry_beacon` 25/35/45/55/75/95, `turret` 50/70/95/125); they are copied rather than read off
 * the view because the solo view publishes the purse, not the shop, and a wrong entry only ever
 * makes the prover POORER — it holds back until it believes it can pay.
 */
const LADDER = [
  { what: 'turret', where: { x: -25, z: 38 }, price: 50 },
  { what: 'sentry_beacon', where: { x: -45, z: 41 }, price: 25 },
  { what: 'sentry_beacon', where: { x: 25, z: 41 }, price: 35 },
  { what: 'turret', where: { x: -29, z: 42 }, price: 70 },
  { what: 'turret', where: { x: -21, z: 42 }, price: 95 },
  { what: 'sentry_beacon', where: { x: 45, z: 41 }, price: 45 },
  { what: 'turret', where: { x: -25, z: 45 }, price: 125 },
  { what: 'sentry_beacon', where: { x: -28, z: 40 }, price: 55 },
  { what: 'sentry_beacon', where: { x: -22, z: 40 }, price: 75 },
  { what: 'sentry_beacon', where: { x: -25, z: 43 }, price: 95 },
];

function parseArgs(argv) {
  const out = { seeds: null, tape: null, trace: false, all: false, runs: 2 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--all') out.all = true;
    else if (argv[i] === '--trace') out.trace = true;
    else if (argv[i] === '--seed') out.seeds = [argv[i + 1]];
    else if (argv[i] === '--tape') out.tape = argv[i + 1];
    else if (argv[i] === '--runs') out.runs = Number(argv[i + 1]);
  }
  if (!out.seeds) out.seeds = out.all ? SEEDS : [SEEDS[0]];
  return out;
}

/** The next unbuilt rung, read STATELESSLY off `works.byKind` so a lost gun is rebuilt, not remembered. */
function nextRung(byKind) {
  const seen = {};
  for (const rung of LADDER) {
    seen[rung.what] = (seen[rung.what] ?? 0) + 1;
    if ((byKind[rung.what] ?? 0) < seen[rung.what]) return rung;
  }
  return null;
}

/** The whole policy, small enough to read: everything it decides is a function of the view. */
function planOrders(view, state, trace) {
  const now = view.now;
  const orders = [];
  const playbook = now.playbookUse;
  const runSeconds = now.timers?.runSeconds ?? 0;

  const usePlaybook = playbook?.declared === true
    && playbook.objectiveMet !== true
    && state.playbookUses === 0
    && runSeconds >= PLAYBOOK_AT_SECONDS;
  if (usePlaybook) {
    orders.push({ verb: 'PLAYBOOK_USE', name: PLAYBOOK_NAME });
    state.playbookUses += 1;
  }

  const offered = (now.pendingOffer ?? []).map((entry) => entry.id);
  const pick = PICK_ORDER.find((id) => offered.includes(id)) ?? offered[0];
  if (pick) orders.push({ verb: 'PICK_UPGRADE', id: pick });

  orders.push({ verb: 'BLAST_AT', pos: BLAST_AT });
  const rung = nextRung(now.works?.byKind ?? {});
  if (rung) orders.push({ verb: 'BUILD', what: rung.what, where: rung.where, when: { goldGte: rung.price } });
  const seam = (now.seams ?? []).find((entry) => entry.active && entry.x !== null);
  const pans = seam ? Math.min(PANS_PER_TURN, ORDER_CAP - orders.length - 1) : 0;
  for (let i = 0; i < pans; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'HOLD', pos: HOLD_AT });

  trace?.push({
    wave: now.wave,
    runSeconds,
    gold: now.gold,
    heroHp: now.hero.hp,
    works: { ...(now.works?.byKind ?? {}) },
    litCount: now.interferenceFront?.litCount ?? null,
    frontsArrived: now.interferenceFront?.frontsArrived ?? null,
    deadline: now.interferenceFront?.objectiveMet ?? null,
    mutedPlaybooks: now.interferenceFront?.refusals?.playbooks ?? null,
    runningProgram: playbook?.runningProgram ?? null,
    objectiveMet: playbook?.objectiveMet ?? null,
    threats: now.threats?.alive ?? null,
    build: rung ? rung.what : null,
    pick: pick ?? null,
    heroMaxHp: now.hero.maxHp,
    pans,
  });
  return orders;
}

async function ride(seed, { tape, trace }) {
  const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', seed];
  if (tape) args.push('--tape', tape);
  const child = spawn(process.execPath, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

  const state = { playbookUses: 0, wheelLeftAlone: 0 };
  let outcome = null;
  let turns = 0;
  let secureChoices = 0;
  let lastView = null;
  for await (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.now === undefined) { outcome = message; continue; }
    lastView = message;
    turns += 1;
    if (message.now.pendingSecure) {
      secureChoices += 1;
      child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
      continue;
    }
    // THE ERRAND'S ONE PATIENT MOMENT: a program is installed and the wall has not reached it yet.
    // Taking the wheel back here would cancel the program and there would be nothing for the front
    // to mute, so the rider declines this turn — honestly, with the empty line gr-sim reads as "no
    // orders" — and asks again next turn.
    const playbook = message.now.playbookUse;
    if (state.playbookUses > 0 && playbook?.objectiveMet !== true && state.wheelLeftAlone < 3) {
      state.wheelLeftAlone += 1;
      trace?.push({ wave: message.now.wave, runSeconds: message.now.timers?.runSeconds, wheelLeftAlone: state.wheelLeftAlone, runningProgram: playbook?.runningProgram ?? null, mutedPlaybooks: message.now.interferenceFront?.refusals?.playbooks ?? null });
      child.stdin.write('\n');
      continue;
    }
    child.stdin.write(`${JSON.stringify(planOrders(message, state, trace))}\n`);
  }
  child.stdin.end();
  const code = await new Promise((resolve) => child.on('close', resolve));
  return { seed, exitCode: code, turns, secureChoices, outcome, state, stderr: stderr.join(''), final: lastView?.now ?? null };
}

const options = parseArgs(process.argv.slice(2));
const results = [];
for (const seed of options.seeds) {
  for (let run = 1; run <= options.runs; run += 1) {
    const trace = [];
    const tapePath = options.tape && run === 1 ? options.tape : null;
    const result = await ride(seed, { tape: tapePath, trace });
    results.push({
      ...result,
      run,
      tape: tapePath,
      trace: options.trace ? trace : trace.slice(-3),
      final: result.final
        ? {
          wave: result.final.wave,
          runSeconds: result.final.timers?.runSeconds,
          gold: result.final.gold,
          heroHp: result.final.hero?.hp,
          litCount: result.final.interferenceFront?.litCount,
          litAtDeadline: result.final.interferenceFront?.litAtDeadline,
          deadlineMet: result.final.interferenceFront?.objectiveMet,
          mutedPlaybooks: result.final.interferenceFront?.refusals?.playbooks,
          objectiveMet: result.final.playbookUse?.objectiveMet,
          programSuspensions: result.final.playbookUse?.programSuspensions,
        }
        : null,
      stderr: result.stderr.split('\n').filter((entry) => entry.trim()).slice(-6),
    });
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const report = {
  contract: CONTRACT,
  policy: { verbs: ['PLAYBOOK_USE', 'BLAST_AT', 'BUILD', 'HARVEST', 'HOLD', 'SECURE_CHOICE'], hold: HOLD_AT, blast: BLAST_AT, pansPerTurn: PANS_PER_TURN, playbookAtSeconds: PLAYBOOK_AT_SECONDS },
  identical: options.seeds.every((seed) => {
    const runs = results.filter((entry) => entry.seed === seed);
    return runs.length > 1 && runs.every((entry) => same(entry.outcome, runs[0].outcome));
  }),
  runs: results,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
