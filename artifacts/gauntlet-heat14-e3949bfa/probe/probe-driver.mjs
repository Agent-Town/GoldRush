// HEAT 13 PROBE DRIVER — operator transport only, no strategy.
// Replays a source tape's order arrays order-for-order through the ARENA's sim.
//   --filter-retired   drop MOVE_TO / HOLD / FALLBACK_IF orders from every array (the ADR-005
//                      grammar change applied mechanically; nothing else is altered).
// Without the flag the arena's door answers the retired verbs itself: that refusal, verbatim, is the
// era gate's first proof.
// usage: node probe-driver.mjs <arena> <sourceTape> <outTape> [--filter-retired] [--contract=..] [--seed=..]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

const argv = process.argv.slice(2);
const [arena, sourceTape, outputTape] = argv.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=') || true]; }));
const RETIRED = new Set(['MOVE_TO', 'HOLD', 'FALLBACK_IF']);
const src = JSON.parse(readFileSync(sourceTape, 'utf8'));
const contract = flags.contract ?? src.contract;
const seed = flags.seed ?? src.seed;
let orders = src.inputLog.entries.map((entry) => entry.a[0].orders);
let dropped = 0;
if (flags['filter-retired']) {
  orders = orders.map((arr) => { const kept = arr.filter((o) => !RETIRED.has(o.verb)); dropped += arr.length - kept.length; return kept; });
}
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', resolve(outputTape)], { cwd: arena, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
sim.stderr.on('data', (d) => { stderr += d; });
const exit = new Promise((done) => sim.once('close', done));
let index = 0; let outcome; const surprises = [];
for await (const line of createInterface({ input: sim.stdout })) {
  let view; try { view = JSON.parse(line); } catch { continue; }
  if (view.schema === 'goldrush.view.v1') {
    for (const s of view.surprises ?? []) surprises.push({ t: view.now?.t ?? null, s });
    sim.stdin.write(`${JSON.stringify(view.now?.pendingSecure ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : orders[Math.min(index++, orders.length - 1)])}\n`);
  } else outcome = view;
}
const rc = await exit;
const result = { contract, seed, filterRetired: Boolean(flags['filter-retired']), ordersDropped: dropped, rc, outcome: outcome ?? null, surpriseCount: surprises.length, firstSurprises: surprises.slice(0, 12), lastSurprises: surprises.slice(-4), stderr: stderr.slice(0, 4000) };
writeFileSync(`${outputTape}.driver.json`, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (rc) process.exitCode = 1;
