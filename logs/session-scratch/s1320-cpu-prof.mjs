// s1320: CPU-profile the WITH-FIXTURES night-shift run and rank functions by SELF time.
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, mkdirSync } from 'node:fs';

const dir = '/tmp/s1320prof';
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const run = spawnSync(
  process.execPath,
  ['--cpu-prof', '--cpu-prof-dir', dir, 'scripts/gr-sim.mjs',
   '--contract', 'e1-night-shift', '--seed', 'e1-night-shift-01', '--policy=idle'],
  { cwd: process.cwd(), encoding: 'utf8', timeout: 180_000, maxBuffer: 1 << 28 },
);
console.log('status', run.status, (run.stderr || '').trim().split('\n').at(-1));

const file = readdirSync(dir).find((f) => f.endsWith('.cpuprofile'));
const prof = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));

// self time per node id from the sample stream
const selfTicks = new Map();
for (const id of prof.samples) selfTicks.set(id, (selfTicks.get(id) ?? 0) + 1);
const totalDeltaUs = prof.timeDeltas.reduce((a, b) => a + b, 0);
const usPerSample = totalDeltaUs / prof.samples.length;

const byFn = new Map();
for (const node of prof.nodes) {
  const ticks = selfTicks.get(node.id) ?? 0;
  if (!ticks) continue;
  const cf = node.callFrame;
  const key = `${cf.functionName || '(anon)'} @ ${(cf.url || '').replace(/^.*\/Gold Rush\//, '')}:${cf.lineNumber + 1}`;
  byFn.set(key, (byFn.get(key) ?? 0) + ticks);
}

const ranked = [...byFn.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
console.log(`total profiled ${(totalDeltaUs / 1e6).toFixed(2)}s over ${prof.samples.length} samples`);
console.log('--- top 25 by SELF time ---');
for (const [key, ticks] of ranked) {
  const ms = (ticks * usPerSample) / 1000;
  console.log(`${ms.toFixed(0).padStart(7)}ms ${((ticks / prof.samples.length) * 100).toFixed(1).padStart(5)}%  ${key}`);
}
