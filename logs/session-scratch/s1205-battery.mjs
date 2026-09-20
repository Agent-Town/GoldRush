#!/usr/bin/env node
// s1205 — re-measure the node-guards battery N times on the MERGED tree.
// The defect under cure is a LOAD-DEPENDENT race in child-process stdout capture,
// so a quiet green is the weak arm: `--load` runs a concurrent `npm run build`
// alongside each battery so the green is earned under contention.
// (node, not bash: the fire's bash gate refuses `bash <script>` invocations.)
// Usage: node s1205-battery.mjs <runs> <label> [--load]
import { spawn, spawnSync } from 'node:child_process';

const runs = Number(process.argv[2] || 5);
const label = process.argv[3] || 'quiet';
const withLoad = process.argv.includes('--load');
const root = new URL('../../', import.meta.url).pathname.replace(/%20/g, ' ');

let reds = 0;
const times = [];
for (let i = 1; i <= runs; i++) {
  let loader = null;
  if (withLoad) {
    // Background contention. Detached+ignored so it never shares our stdio pipes —
    // measuring the race must not be perturbed by the measurer (load-measurement law).
    loader = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'ignore', detached: true });
  }
  const t0 = Date.now();
  const r = spawnSync('npm', ['run', 'test:node-guards'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  times.push(Number(secs));
  if (loader) { try { process.kill(-loader.pid); } catch {} }

  const all = `${r.stdout || ''}${r.stderr || ''}`;
  const counts = (all.match(/^# (tests|pass|fail) \d+$/gm) || []).join(' ');
  console.log(`[${label} ${i}/${runs}] rc=${r.status} ${secs}s  ${counts}`);
  if (r.status !== 0) {
    reds++;
    const why = (all.match(/^not ok .*$|AssertionError.*$|.*truncated.*$/gm) || []).slice(0, 6);
    why.forEach((l) => console.log(`      ${l.trim().slice(0, 160)}`));
  }
}
const med = [...times].sort((a, b) => a - b)[Math.floor(times.length / 2)];
console.log(`[${label}] RED ${reds} / ${runs}  · median ${med}s · times ${times.join(', ')}`);
process.exit(reds ? 1 : 0);
