#!/usr/bin/env node

// When a GR-SIM run is submitted to county standings, callers may add stack.tokensIn,
// stack.tokensOut, and stack.calls; use the outcome's calls value and omit unknown token counts.
//
// TWO DRIVERS, ONE SIM.
//   default            — the solo headless run: advance a whole wave, print THE VIEW, read orders.
//   --room <code>      — THE AGENT SEAT: full sim in headless-only rooms; thin view/order wire
//                        when a browser owns the world. See src/sim/SeatedLockstepSim.ts.

import { createInterface } from 'node:readline';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import { computeEngineHash } from './assay-replay-agent.mjs';

const BUILD_ID = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

// Declared above the first call: `parseArgs` runs at module top level, so a `const`
// further down is still in its temporal dead zone by then.
const SOLO_KEYS = ['contract', 'seed', 'policy', 'mode', 'preset', 'difficulty', 'overtime', 'tape', 'science-steps', 'resume', 'to-tick'];
const SEAT_KEYS = ['room', 'origin', 'name', 'town', 'party', 'tick-rate', 'max-ticks', 'desync-at', 'strict', 'model', 'harness', 'harness-version', 'harness-ref', 'config', 'source'];
const DIFFICULTY_VALUES = ['greenhorn', 'trail', 'vein-hunter', 'vein_hunter', 'hard'];

if (process.argv.includes('--help')) {
  process.stdout.write('Usage: gr-sim --contract <id> [--seed <seed>] [--policy=idle] [--overtime] [--science-steps N] [--tape <path>]\n'
    + '       gr-sim --resume <tape.json> [--to-tick N] [--tape <path>]\n'
    + '         A resume without --tape records to the sibling <tape>.resumed.json and NEVER over its input.\n'
    + '       gr-sim --room <code> --origin <url> [--model <id>] [--harness <name>] [--harness-ref <commit-or-url>] [--party 2-4] [--max-ticks N] [--strict]\n\n'
    + 'A seat invited into a browser room rides that browser world: room-served NDJSON views arrive on stdout and stdin order arrays travel as agent_orders acts. --strict still refuses mixed rooms.\n');
  process.exit(0);
}
const options = parseArgs(process.argv.slice(2));
const resumeTape = options.resume ? JSON.parse(await readFile(resolve(options.resume), 'utf8')) : null;
// A seat cannot pick its own contract: it boots whatever the host already committed the
// room to, which is why the setup is read BEFORE any game module is loaded.
const seatSetup = options.room ? await fetchRoomSetup(options.origin, options.room) : null;

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', seatSetup?.contractId ?? resumeTape?.contract ?? options.contract);
location.searchParams.set('seed', seatSetup?.seed ?? resumeTape?.seed ?? options.seed);
globalThis.location = location;
globalThis.window = { location };

const originalConsole = {
  log: console.log,
  info: console.info,
  debug: console.debug,
};
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});

let input;
try {
  if (seatSetup) {
    try {
      input = await rideSeated(vite, options, seatSetup);
    } catch (error) {
      Object.assign(console, originalConsole);
      process.stderr.write(`gr-sim refused room: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  } else {
    let difficulty = 'trail';
    let sim;
    let start;
    let prefixEntries = [];
    if (resumeTape) {
      const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
      const replay = new AgentTapeReplaySession(resumeTape);
      const resumeTick = options.toTick ?? Math.max(0, replay.durationTicks - 1);
      sim = replay.resumeAt(resumeTick);
      difficulty = resumeTape.difficulty;
      start = resumeTape.inputLog.start;
      prefixEntries = resumeTape.inputLog.entries.filter((entry) => entry.t < resumeTick);
      process.stderr.write(`gr-sim resumed: ${options.resume} at tick ${resumeTick}\n`);
    } else {
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const { Balance, applyDifficultyPreset, normalizeDifficultyPreset } = await vite.ssrLoadModule('/src/game/Balance.ts');
      difficulty = normalizeDifficultyPreset(options.preset ?? options.difficulty);
      if (options.preset !== undefined || options.difficulty !== undefined) {
        applyDifficultyPreset(difficulty);
        process.stderr.write(`gr-sim preset: ${difficulty} enemy.hp=${Balance.enemy.hp}\n`);
      }
      sim = new HeadlessContractSim({
        contractId: options.contract,
        seed: options.seed,
        mode: options.mode,
        overtime: options.overtime,
        scienceSteps: options.scienceSteps,
      });
      const turn = sim.currentTurn();
      start = { x: turn.view.now.hero.x, z: turn.view.now.hero.z };
    }
    // F-E2S-1: boss fights get six full waves after the later posting boundary.
    const BOSS_GRACE_WAVES = 6;
    const secureWave = sim.manifest.twist.secureWave ?? 20;
    const waveCeiling = sim.manifest.twist.baron
      ? Math.max(secureWave, sim.manifest.twist.baron.wave) + BOSS_GRACE_WAVES
      : secureWave + 2;
    // AP-15: wave scaling should end overtime first; this is only an anti-hang bound.
    const OVERTIME_CEILING_WAVES = 50;
    Object.assign(console, originalConsole);

    input = options.policy === 'idle'
      ? undefined
      : createInterface({ input: process.stdin, crlfDelay: Infinity });
    const lines = input?.[Symbol.asyncIterator]();
    let turn = sim.currentTurn();
    const submissions = [];
    let endReason;
    while (true) {
      const rushing = turn.view.now.overtime === true;
      const overtimeCeiling = rushing && sim.bankedSecureWave !== null
        && turn.view.now.wave >= sim.bankedSecureWave + OVERTIME_CEILING_WAVES;
      if (!turn.terminal && (overtimeCeiling || (!rushing && turn.view.now.wave >= waveCeiling))) {
        sim.hero.hp = 0;
        sim.dead = true;
        endReason = overtimeCeiling ? 'overtime-ceiling' : 'wave-ceiling';
        turn = sim.currentTurn();
      }
      process.stdout.write(`${JSON.stringify(turn.view)}\n`);
      if (turn.terminal) break;
      if (options.policy !== 'idle') await readOrders(lines, sim, submissions);
      turn = sim.advanceToTurn();
    }

    const outcome = { ...sim.outcome(), ...(endReason ? { endReason } : {}) };
    // F-E10S4-3, CURED 2026-09-07 (`spec-hygiene-batch`). This line used to read
    // `options.tape ?? options.resume`, so a bare `--resume ride.tape.json` wrote the NEW recording
    // over the one it had just replayed: the input destroyed by reading it, found by tripping it at
    // the E10S-4 drain and worked around there with a scratch `--tape` on every invocation. A resume
    // with no `--tape` now writes the SIBLING `<stem>.resumed<ext>` instead, and an explicit `--tape`
    // still wins. `scripts/gr-sim-resume-tape-safety.test.mjs` holds the input's bytes to it.
    const tapePath = options.tape ?? (options.resume ? resumedTapePath(options.resume) : undefined);
    if (tapePath) await writeAgentTape(vite, resolve(tapePath), sim, outcome, {
      contract: resumeTape?.contract ?? options.contract,
      seed: resumeTape?.seed ?? options.seed,
      difficulty,
      start,
      prefixEntries,
      submissions,
      baseTape: resumeTape,
    });
    process.stdout.write(`${JSON.stringify(outcome)}\n`);
    process.stderr.write(`gr-sim speed: ${sim.wavesPerSecond.toFixed(2)} waves/s\n`);
  }
} finally {
  input?.close();
  Object.assign(console, originalConsole);
  await vite.close();
}

/**
 * THE SEATED RIDE. Returns the readline handle so the outer `finally` closes it — an
 * open stdin reader keeps node alive long after the ride is over.
 *
 * Orders arrive on stdin whenever the rider answers, NOT when the sim asks: the room
 * cannot be made to wait for an inference. Between answers the seat streams empty ticks,
 * which is the whole of THE TWO CLOCKS in one loop — the room keeps its tick rate, the
 * rider keeps its own, and the seat never blocks one on the other.
 */
async function rideSeated(vite, options, setup) {
  const { AgentSeat } = await vite.ssrLoadModule('/src/sim/SeatedLockstepSim.ts');
  const { assembleSelfDeclaredStack } = await vite.ssrLoadModule('/src/agent/DeclaredStack.ts');
  const stack = await assembleSelfDeclaredStack({
    model: options.model,
    harness: options.harness,
    harnessVersion: options.harnessVersion,
    harnessRef: options.harnessRef,
    config: options.config,
    source: options.source,
    charterText: process.env.GR_HARNESS_CHARTER_TEXT,
    notebookGenerationHeader: process.env.GR_HARNESS_NOTEBOOK_HEADER,
  });
  const seat = await AgentSeat.take({
    origin: options.origin,
    code: options.room,
    setup,
    player: {
      name: options.name,
      town: options.town,
      ...(stack ? { stack } : {}),
    },
    partySize: options.party,
    tickRate: options.tickRate,
    maxTicks: options.maxTicks,
    desyncAtTick: options.desyncAt,
    strict: options.strict,
    onTurn: (turn) => process.stdout.write(`${JSON.stringify(turn.view)}\n`),
    onNotice: (line) => process.stderr.write(`gr-sim ${line}\n`),
  });
  Object.assign(console, originalConsole);
  process.stderr.write(`gr-sim seated: room=${options.room} contract=${setup.contractId} seed=${setup.seed}\n`);

  const reader = options.policy === 'idle'
    ? undefined
    : createInterface({ input: process.stdin, crlfDelay: Infinity });
  reader?.on('line', (line) => {
    if (!line.trim()) return;
    let orders;
    try {
      orders = JSON.parse(line);
    } catch (error) {
      process.stderr.write(`gr-sim rejected orders: ${error instanceof Error ? error.message : String(error)}\n`);
      return;
    }
    const verdict = seat.submitOrders(orders);
    if (!verdict.ok) process.stderr.write(`gr-sim rejected orders: ${verdict.message}\n`);
  });

  const result = await seat.ride();
  process.stdout.write(`${JSON.stringify({ schema: 'goldrush.seat.v1', ...result })}\n`);
  process.stderr.write(`gr-sim seat speed: ${result.ticksPerSecond.toFixed(2)} ticks/s over ${result.ticks} ticks\n`);
  // A resigned seat must not report success: a rider that believes it rode is worse than
  // one that knows it was thrown.
  if (result.resigned) process.exitCode = 3;
  return reader;
}

/** Reads the ride's canonical setup before any game module has an opinion about it. */
async function fetchRoomSetup(origin, code) {
  const response = await fetch(`${origin.replace(/\/$/, '')}/api/multiplayer/inspect?code=${encodeURIComponent(code)}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(`the relay would not open room ${code}: ${body.error ?? `http ${response.status}`}`);
  if (!body.setup) throw new Error(`room ${code} has no ride setup — the host has not picked a contract yet.`);
  if (body.started) throw new Error(`room ${code} already left the post; a seat has to be taken before tick 0.`);
  return body.setup;
}

async function readOrders(lines, sim, submissions) {
  while (true) {
    const next = await lines.next();
    if (next.done) {
      if (sim.currentTurn().view.now.pendingSecure) return;
      throw new Error('stdin ended while gr-sim was waiting for standing orders.');
    }
    if (!next.value.trim()) return;
    let orders;
    try {
      orders = JSON.parse(next.value);
    } catch (error) {
      rejectOrders(error instanceof Error ? error.message : String(error), sim);
      continue;
    }
    if (orders === null) return;
    const receipt = sim.submitOrders(orders);
    if (receipt.outcome.ok) {
      submissions.push({ t: Math.round(sim.timeAlive * 30), orders: structuredClone(orders) });
      return;
    }
    rejectOrders(receipt.outcome.message ?? receipt.outcome.reason, sim);
  }
}

/**
 * THE REFUSAL, ON BOTH WIRES (F-MCAP-1; owner ruling 2026-09-06, verbatim: "(5) both").
 *
 * A log reader gets this stderr line, in the same `gr-sim <what happened>` shape every other
 * diagnostic here uses; a rider that reads only stdout gets the SAME words inside the re-printed
 * view, because the refusal now rides `now.orders[]` with `status: "failed"` and a `reason` that
 * begins with the refusal word (`src/agent/StandingOrders.ts`, `SECURE_WINDOW_REFUSAL`). The word
 * is deliberately NOT written to stdout as a bare line: stdout is strict NDJSON here and every
 * consumer JSON-parses it line by line, so a diagnostic there would break the transport it is
 * meant to inform.
 */
function rejectOrders(reason, sim) {
  process.stderr.write(`gr-sim rejected orders: ${reason}\n`);
  process.stdout.write(`${JSON.stringify(sim.currentTurn().view)}\n`);
}

/**
 * THE SIBLING A BARE `--resume` WRITES TO (F-E10S4-3). `ride.tape.json` -> `ride.tape.resumed.json`,
 * `ride` -> `ride.resumed`. Directory and stem are kept so the pair reads as one pair on disk, and
 * the returned path is never the input path — which is the whole point: a replay must not be able to
 * destroy the recording it replays. NOT exported: this module runs its CLI at import time (parseArgs
 * at top level), so `scripts/gr-sim-resume-tape-safety.test.mjs` drives the real binary instead of
 * importing this helper — which is the stronger evidence anyway, since it measures the file on disk.
 */
function resumedTapePath(input) {
  const resolved = resolve(input);
  const ext = extname(resolved);
  return ext ? `${resolved.slice(0, -ext.length)}.resumed${ext}` : `${resolved}.resumed`;
}

async function writeAgentTape(vite, path, sim, outcome, run) {
  const { RUN_TAPE_SIM_VERSION, RUN_TAPE_VERSION, agentOrdersEventLogHash } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  const { stableHash } = await vite.ssrLoadModule('/src/mp/LockstepClient.ts');
  // THE TERMINAL-INSTANT ORDER (F-ASSAY-E2E-2). The elapsed clock alone is not a legal duration
  // for this log. The browser recorder samples BEFORE each step, so its last entry always lands at
  // `durationTicks - 1` and both validators (`PlaybookFormat.validateEntries`, the county's
  // `validTapeEntries`) enforce `t < durationTicks`. gr-sim's rider, though, may answer AT the
  // boundary — a `SECURE_CHOICE` accepted at the instant the run ends is recorded at
  // `round(timeAlive * 30)`, which equals the elapsed tick count exactly and is refused with HTTP
  // 400 `bad_payload`. The recorded tick is the truth (that order is what secured the claim, and
  // moving it earlier would replay into a closed secure window); the elapsed count is the side
  // that was wrong, because this log's timeline runs one tick past the last step it caused.
  const elapsedTicks = Math.round((outcome.timeMs / 1000) * 30);
  const entries = [...run.prefixEntries, ...run.submissions.map(({ t, orders }) => ({ t, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders }] }))];
  const lastEntryTick = entries.length ? entries[entries.length - 1].t : -1;
  const durationTicks = Math.max(elapsedTicks, lastEntryTick + 1);
  const eventLogHash = agentOrdersEventLogHash(sim.standingOrdersSnapshot());
  const contentId = `agent-${stableHash({ contract: run.contract, seed: run.seed, difficulty: run.difficulty, eventLogHash }).slice('fnv1a32:'.length)}`;
  // Identical proof content must remain deterministic, but its public lookup handle must not
  // collide. Mint uniqueness only in the recording's id; the input-log name keeps the stable
  // content id, so two identical runs differ in exactly this field.
  const id = `${contentId}-${randomUUID()}`;
  const tape = {
    ...(run.baseTape ?? {}),
    version: RUN_TAPE_VERSION,
    id: run.baseTape?.id ?? id,
    createdAt: 0,
    kept: true,
    contract: run.contract,
    seed: run.seed,
    difficulty: run.difficulty,
    simVersion: RUN_TAPE_SIM_VERSION,
    meta: run.baseTape?.meta ?? { buildId: BUILD_ID, engineHash: await computeEngineHash(root), era: engineEra.era, viewVersion: engineEra.viewSchema.version },
    // Tape v2's declaration (`specs/agent-play/tape-contract.md` §2-§3): the progression this run
    // was born under, captured by the sim at birth rather than re-derived here.
    runStart: run.baseTape?.runStart ?? sim.runStart,
    inputLog: {
      ...(run.baseTape?.inputLog ?? {}),
      version: 1,
      name: run.baseTape?.inputLog.name ?? contentId,
      contractId: run.contract,
      seed: run.seed,
      difficultyPreset: run.difficulty,
      stepSeconds: 1 / 30,
      start: run.start,
      durationTicks,
      entries,
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash,
    outcome: {
      reason: outcome.secured ? 'secured' : 'death',
      secured: outcome.secured,
      waves: outcome.waves,
      timeAlive: outcome.timeMs / 1000,
      gold: outcome.gold,
    },
  };
  await writeFile(path, `${JSON.stringify(tape, null, 2)}\n`);
}

function parseArgs(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const raw = args[index];
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    const key = match?.[1] ?? raw.replace(/^--/, '');
    if (!raw.startsWith('--') || ![...SOLO_KEYS, ...SEAT_KEYS].includes(key)) {
      throw new Error(`Unknown argument: ${raw}`);
    }
    if (key === 'strict' || key === 'overtime') {
      if (match) throw new Error(`--${key} does not take a value.`);
      values[key] = true;
      continue;
    }
    const value = match?.[2] ?? args[++index];
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
    values[key] = value;
  }
  const policy = values.policy ?? 'stdin';
  if (policy !== 'stdin' && policy !== 'idle') throw new Error('--policy must be stdin or idle.');
  if (values.mode !== undefined && values.mode !== 'escort') throw new Error('--mode must be escort.');
  for (const key of ['preset', 'difficulty']) {
    if (values[key] !== undefined && !DIFFICULTY_VALUES.includes(values[key])) {
      throw new Error(`--${key} must be one of: ${DIFFICULTY_VALUES.join(', ')}.`);
    }
  }
  if (values.preset !== undefined && values.difficulty !== undefined && values.preset !== values.difficulty) {
    throw new Error('--preset and --difficulty must have the same value when both are given.');
  }

  if (values.room === undefined) {
    for (const key of SEAT_KEYS) {
      if (values[key] !== undefined) throw new Error(`--${key} needs --room.`);
    }
    if (!values.contract && !values.resume) throw new Error('--contract or --resume is required.');
    if (values.resume && ['contract', 'seed', 'mode', 'preset', 'difficulty', 'overtime', 'science-steps'].some((key) => values[key] !== undefined)) {
      throw new Error('--resume reads contract, seed, difficulty, and run setup from the tape.');
    }
    if (values['to-tick'] !== undefined && !values.resume) throw new Error('--to-tick needs --resume.');
    return {
      contract: values.contract,
      seed: values.seed ?? 'gold-rush',
      policy,
      mode: values.mode,
      preset: values.preset,
      difficulty: values.difficulty,
      overtime: values.overtime === true,
      scienceSteps: integerArg(values, 'science-steps', 0, 0, Number.MAX_SAFE_INTEGER),
      tape: values.tape,
      resume: values.resume,
      toTick: integerArg(values, 'to-tick', undefined, 0, Number.MAX_SAFE_INTEGER),
    };
  }

  // The room already agreed on these. Accepting a second opinion here would only let a
  // seat boot a different world than the one it is about to hash against.
  if (values.preset !== undefined || values.difficulty !== undefined) {
    throw new Error('--preset and --difficulty cannot be used with --room; the host room owns difficulty.');
  }
  for (const key of ['contract', 'seed', 'mode', 'overtime', 'tape', 'science-steps', 'resume', 'to-tick']) {
    if (values[key] !== undefined) throw new Error(`--${key} is decided by the room; drop it when using --room.`);
  }
  if (!values.origin) throw new Error('--room requires --origin.');
  if (!/^[A-Fa-f0-9]{24}$/.test(values.room)) throw new Error('--room must be a 24-character room code.');
  return {
    policy,
    room: values.room.toUpperCase(),
    origin: values.origin,
    name: values.name ?? 'Rig',
    town: values.town ?? 'Calculating House',
    party: integerArg(values, 'party', 2, 2, 4),
    tickRate: integerArg(values, 'tick-rate', undefined, 1, 45),
    maxTicks: integerArg(values, 'max-ticks', null, 1, 10_000_000),
    // Test-only: corrupts this seat's own hash so the resignation path can be exercised.
    desyncAt: integerArg(values, 'desync-at', null, 0, 10_000_000),
    strict: values.strict === true,
    model: values.model,
    harness: values.harness,
    harnessVersion: values['harness-version'],
    harnessRef: values['harness-ref'],
    config: values.config,
    source: values.source,
  };
}

function integerArg(values, key, fallback, min, max) {
  if (values[key] === undefined) return fallback;
  const parsed = Number(values[key]);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`--${key} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}
