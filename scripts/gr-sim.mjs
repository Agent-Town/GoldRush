#!/usr/bin/env node

// When a GR-SIM run is submitted to county standings, callers may add stack.tokensIn,
// stack.tokensOut, and stack.calls; use the outcome's calls value and omit unknown token counts.
//
// TWO DRIVERS, ONE SIM.
//   default            — the solo headless run: advance a whole wave, print THE VIEW, read orders.
//   --room <code>      — THE AGENT SEAT: the same sim rides in a live lockstep room, one tick per
//                        tick-bundle the room agrees on. The room owns the contract, the seed and
//                        the clock; see src/sim/SeatedLockstepSim.ts.

import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// Declared above the first call: `parseArgs` runs at module top level, so a `const`
// further down is still in its temporal dead zone by then.
const SOLO_KEYS = ['contract', 'seed', 'policy', 'mode'];
const SEAT_KEYS = ['room', 'origin', 'name', 'town', 'party', 'tick-rate', 'max-ticks', 'desync-at'];

const options = parseArgs(process.argv.slice(2));
// A seat cannot pick its own contract: it boots whatever the host already committed the
// room to, which is why the setup is read BEFORE any game module is loaded.
const seatSetup = options.room ? await fetchRoomSetup(options.origin, options.room) : null;

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', seatSetup?.contractId ?? options.contract);
location.searchParams.set('seed', seatSetup?.seed ?? options.seed);
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
    input = await rideSeated(vite, options, seatSetup);
  } else {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: options.contract, seed: options.seed, mode: options.mode });
    const waveCeiling = (sim.manifest.twist.secureWave ?? 20) + 2;
    Object.assign(console, originalConsole);

    input = options.policy === 'idle'
      ? undefined
      : createInterface({ input: process.stdin, crlfDelay: Infinity });
    const lines = input?.[Symbol.asyncIterator]();
    let turn = sim.currentTurn();
    while (true) {
      if (turn.view.now.wave > waveCeiling) {
        throw new Error(`gr-sim wave ceiling exceeded: contract=${options.contract} mode=${options.mode ?? 'default'} seed=${options.seed} wave=${turn.view.now.wave} ceiling=${waveCeiling}`);
      }
      process.stdout.write(`${JSON.stringify(turn.view)}\n`);
      if (turn.terminal) break;
      if (options.policy !== 'idle') await readOrders(lines, sim);
      turn = sim.advanceToTurn();
    }

    const outcome = sim.outcome();
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
  const seat = await AgentSeat.take({
    origin: options.origin,
    code: options.room,
    setup,
    player: { name: options.name, town: options.town },
    partySize: options.party,
    tickRate: options.tickRate,
    maxTicks: options.maxTicks,
    desyncAtTick: options.desyncAt,
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

async function readOrders(lines, sim) {
  while (true) {
    const next = await lines.next();
    if (next.done) throw new Error('stdin ended while gr-sim was waiting for standing orders.');
    let orders;
    try {
      orders = JSON.parse(next.value);
    } catch (error) {
      process.stderr.write(`gr-sim rejected orders: ${error instanceof Error ? error.message : String(error)}\n`);
      continue;
    }
    const receipt = sim.submitOrders(orders);
    if (receipt.outcome.ok) return;
    process.stderr.write(`gr-sim rejected orders: ${receipt.outcome.message ?? receipt.outcome.reason}\n`);
  }
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
    const value = match?.[2] ?? args[++index];
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
    values[key] = value;
  }
  const policy = values.policy ?? 'stdin';
  if (policy !== 'stdin' && policy !== 'idle') throw new Error('--policy must be stdin or idle.');
  if (values.mode !== undefined && values.mode !== 'escort') throw new Error('--mode must be escort.');

  if (values.room === undefined) {
    for (const key of SEAT_KEYS) {
      if (values[key] !== undefined) throw new Error(`--${key} needs --room.`);
    }
    if (!values.contract) throw new Error('--contract is required.');
    return { contract: values.contract, seed: values.seed ?? 'gold-rush', policy, mode: values.mode };
  }

  // The room already agreed on these. Accepting a second opinion here would only let a
  // seat boot a different world than the one it is about to hash against.
  for (const key of ['contract', 'seed', 'mode']) {
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
