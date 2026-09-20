#!/usr/bin/env node
// s1529 gate driver — F-ER02-1 storm arms.
//
// Drives the shipped gr-sim CLI with a rider that submits ONE impossible order
// on every turn it is asked for. That is the exact shape of the ER-02 storm:
// a failing order raises a surprise, the surprise mints a turn, the turn
// demands a submission, the submission re-arms the failing order.
//
// Prints the run's `calls` and `eventLogHash` so two trees can be compared.
// Usage: node driver-storm-arms.mjs <contract> <seed> <label>

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [contract, seed, label] = process.argv.slice(2);
const PLAN = JSON.stringify([{ verb: 'HARVEST', seam: 'gold-seam-999' }]);
const HARD_CAP = 20000; // safety only; the sim's own cap should bite first

const child = spawn(
  process.execPath,
  ['scripts/gr-sim.mjs', `--contract=${contract}`, `--seed=${seed}`],
  { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
);

let submissions = 0;
let outcome = null;
let views = 0;
let stderrTail = '';

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d).slice(-2000); });

const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  let parsed;
  try { parsed = JSON.parse(line); } catch { continue; }
  if (parsed && typeof parsed === 'object' && 'calls' in parsed) { outcome = parsed; continue; }
  if (parsed && typeof parsed === 'object' && 'now' in parsed) {
    views += 1;
    if (submissions >= HARD_CAP) { child.stdin.end(); continue; }
    submissions += 1;
    child.stdin.write(PLAN + '\n');
  }
}

const code = await new Promise((resolve) => child.on('close', resolve));
console.log(JSON.stringify({
  label, contract, seed, rc: code, views, submissions,
  calls: outcome?.calls ?? null,
  eventLogHash: outcome?.eventLogHash ?? null,
  wave: outcome?.wave ?? null,
  node: process.version,
  stderrTail: stderrTail.split('\n').filter(Boolean).slice(-3),
}, null, 2));
