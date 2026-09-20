/**
 * hero-move-verb: the door's own proof that MOVE_HERO moves the hero, driven through
 * `scripts/gr-sim.mjs` over stdin/stdout in the door's public vocabulary and nothing else.
 *
 *   node artifacts/hero-move-verb/verb-probe.mjs [--seed the-claim-01] [--contract the-claim]
 *
 * Each turn it sends one MOVE_HERO to a point the view itself names (a reflection of the hero's
 * start across the claim), then reports where the hero actually is on the next turn plus the order
 * record the executor published for it. No engine import, no private handle, no balance edit.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const read = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const CONTRACT = read('--contract', 'the-claim');
const SEED = read('--seed', 'the-claim-01');
const TARGETS = JSON.parse(read('--targets', '[{"x":0,"z":-6},{"x":8,"z":10},{"x":0,"z":12}]'));

async function ride(tape) {
  const argv = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED];
  if (tape) argv.push('--tape', tape);
  const child = spawn(process.execPath, argv, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const trace = [];
  let outcome = null;
  let turn = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.now === undefined) { outcome = message; continue; }
    const now = message.now;
    const record = (now.orders ?? []).find((entry) => entry.order?.verb === 'MOVE_HERO') ?? null;
    trace.push({
      turn,
      runSeconds: now.timers?.runSeconds ?? null,
      hero: { x: now.hero.x, z: now.hero.z },
      prospector: now.prospector ? { x: now.prospector.x, z: now.prospector.z } : null,
      moveHero: record ? { status: record.status, reason: record.reason ?? null, pos: record.order.pos } : null,
      needsRider: now.needsRider,
    });
    if (now.pendingSecure) { child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`); continue; }
    const target = TARGETS[turn % TARGETS.length];
    turn += 1;
    child.stdin.write(`${JSON.stringify([{ verb: 'MOVE_HERO', pos: target }])}\n`);
  }
  child.stdin.end();
  const exitCode = await new Promise((resolve) => child.on('close', resolve));
  return { seed: SEED, contract: CONTRACT, exitCode, outcome, trace, stderr: stderr.join('').slice(-2000) };
}

const runs = [await ride(read('--tape', null)), await ride(null)];
const same = JSON.stringify(runs[0].outcome) === JSON.stringify(runs[1].outcome)
  && JSON.stringify(runs[0].trace) === JSON.stringify(runs[1].trace);
process.stdout.write(`${JSON.stringify({ identical: same, runs }, null, 2)}\n`);
