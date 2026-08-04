#!/usr/bin/env node

// When a GR-SIM run is submitted to county standings, callers may add stack.tokensIn,
// stack.tokensOut, and stack.calls; use the outcome's calls value and omit unknown token counts.

import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const options = parseArgs(process.argv.slice(2));
const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', options.contract);
location.searchParams.set('seed', options.seed);
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
} finally {
  input?.close();
  Object.assign(console, originalConsole);
  await vite.close();
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
    if (!raw.startsWith('--') || !['contract', 'seed', 'policy', 'mode'].includes(key)) {
      throw new Error(`Unknown argument: ${raw}`);
    }
    const value = match?.[2] ?? args[++index];
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
    values[key] = value;
  }
  if (!values.contract) throw new Error('--contract is required.');
  const policy = values.policy ?? 'stdin';
  if (policy !== 'stdin' && policy !== 'idle') throw new Error('--policy must be stdin or idle.');
  if (values.mode !== undefined && values.mode !== 'escort') throw new Error('--mode must be escort.');
  return { contract: values.contract, seed: values.seed ?? 'gold-rush', policy, mode: values.mode };
}
