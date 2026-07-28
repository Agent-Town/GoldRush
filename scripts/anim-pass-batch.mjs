#!/usr/bin/env node
/**
 * anim-pass-batch.mjs — THE EIGHT WINDS (2026-07-28), fan-out arm.
 *
 * One wind is ~165s of wall clock, and the cast wants sixty-odd of them. This
 * runs a bounded fan-out over `<character>:<wind>` pairs: it writes each prompt
 * from cast.json, calls the generation arm, and prints one line per wind so a
 * partial batch is legible rather than a wall of interleaved logs.
 *
 * A wind whose output PNG already exists is SKIPPED, so the batch is resumable
 * and a re-run after one bad take costs exactly the retakes.
 *
 *   node scripts/anim-pass-batch.mjs --limit 5 tavernkeeper:sw storekeeper:se ...
 *   node scripts/anim-pass-batch.mjs --limit 5 --all storekeeper elder newsie-mei
 */
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const has = (k) => A.includes(k);
const limit = Number(arg('--limit', '5'));
const force = has('--force');
const CAST = JSON.parse(fs.readFileSync('reviews/eight-winds/cast.json', 'utf8')).cast;
const WINDS = ['sw', 'se', 'nw', 'ne'];

const words = A.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--limit'].includes(A[i - 1])));
const jobs = [];
for (const w of words) {
  if (w.includes(':')) { const [n, d] = w.split(':'); jobs.push({ name: n, wind: d }); continue; }
  for (const d of WINDS) jobs.push({ name: w, wind: d });
}
for (const j of jobs) if (!CAST[j.name]) { console.error(`unknown character ${j.name}`); process.exit(2); }

const run = (cmd, args) => new Promise((res) => {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let o = '';
  p.stdout.on('data', (d) => { o += d; });
  p.stderr.on('data', (d) => { o += d; });
  p.on('close', (code) => res({ code, out: o }));
});

let done = 0;
const results = [];
async function one(j) {
  const c = CAST[j.name];
  const out = `reviews/eight-winds/gen/${j.name}-${j.wind}-${c.frames >= 8 ? '4x2' : '2x2'}.png`;
  if (!force && fs.existsSync(out)) { results.push(`SKIP  ${j.name}:${j.wind} (exists)`); return; }
  const p = await run('node', ['scripts/anim-pass-prompt.mjs', j.name, j.wind]);
  if (p.code !== 0) { results.push(`FAIL  ${j.name}:${j.wind} prompt: ${p.out.trim()}`); return; }
  const promptPath = `reviews/eight-winds/prompts/${j.name}-${j.wind}.txt`;
  const g = await run('node', ['scripts/anim-pass-gen.mjs', '--prompt', promptPath,
    '--ref', `assets/raw/${c.base}.png`, '--out', out, '--timeout', '900']);
  const line = g.out.trim().split('\n').pop();
  results.push(`${g.code === 0 && fs.existsSync(out) ? 'OK   ' : 'FAIL '} ${j.name}:${j.wind}  ${line}`);
  console.log(`[${++done}/${jobs.length}] ${results[results.length - 1]}`);
}

console.log(`batch: ${jobs.length} winds, ${limit} at a time`);
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
  while (queue.length) await one(queue.shift());
}));
console.log(`\n--- batch complete ---`);
results.sort().forEach((r) => console.log(r));
const bad = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`${results.length - bad} ok · ${bad} failed`);
process.exit(bad ? 1 : 0);
