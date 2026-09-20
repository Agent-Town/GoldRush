#!/usr/bin/env node
// s1529 POSITIVE CONTROL for the reachability probe.
//
// The storm arm reports `failed: {seen: N, suppressed: 0}`. A counter that only
// ever prints 0 proves nothing until it is shown printing non-zero, so this arm
// submits a VALID harvest: the record goes `active` and STAYS active across the
// many ticks inside one turn, which is the transition the de-dupe guard is
// actually there for. Expect `active.suppressed` >> 0.

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const PLAN = JSON.stringify([{ verb: 'HOLD', pos: { x: 12, z: 12 } }]);
const MAX_TURNS = 12;

const child = spawn(
  process.execPath,
  ['scripts/gr-sim.mjs', '--contract=the-claim', '--seed=e1-the-claim-01'],
  { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
);

let submissions = 0;
let outcome = null;
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d).slice(-3000); });

const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  let parsed;
  try { parsed = JSON.parse(line); } catch { continue; }
  if (parsed && typeof parsed === 'object' && 'calls' in parsed) { outcome = parsed; continue; }
  if (parsed && typeof parsed === 'object' && 'now' in parsed) {
    if (submissions >= MAX_TURNS) { child.stdin.end(); continue; }
    submissions += 1;
    child.stdin.write(PLAN + '\n');
  }
}

const code = await new Promise((resolve) => child.on('close', resolve));
console.log(JSON.stringify({
  label: 'CONTROL-VALID-ORDER', rc: code, submissions,
  calls: outcome?.calls ?? null,
  probe: stderrTail.split('\n').filter((l) => l.includes('S1529-PROBE')).slice(-1)[0] ?? null,
  node: process.version,
}, null, 2));
