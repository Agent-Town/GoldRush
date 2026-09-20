// s1268 — read-only observation of the chromium CHILDREN spawned by a playwright arm in the
// FIRE shell. s1265 "refuted a CPU/QoS scheduling cap" with an instrument that measured node
// worker-thread arithmetic INSIDE one already-running process; that workload cannot see a policy
// binding on spawned child processes. This probe looks at the actual children.
//
// Read-only and cheap: `ps` every 4s, one `top -l 2` (instantaneous CPU; ps %CPU is a LIFETIME
// AVERAGE and has misled this question before) per invocation.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });
const SECONDS = Number(process.argv[2] || 60);
const TAG = process.argv[3] || 'probe';

const samples = [];
const t0 = Date.now();

function psSnapshot() {
  const r = spawnSync('ps', ['-Ao', 'pid,ppid,ni,pri,stat,%cpu,rss,comm'], { encoding: 'utf8' });
  const lines = (r.stdout || '').split('\n');
  const browser = lines.filter((l) => /headless_shell|Chromium|chrome/i.test(l) && !/grep/.test(l));
  return browser.map((l) => l.trim());
}

function tick() {
  samples.push({
    tSeconds: +((Date.now() - t0) / 1000).toFixed(1),
    loadavg: os.loadavg().map((x) => +x.toFixed(2)),
    browserProcs: psSnapshot(),
  });
  writeFileSync(`${OUT}/policy-${TAG}.json`, JSON.stringify(samples, null, 2));
  const last = samples[samples.length - 1];
  console.log(`t=${last.tSeconds}s load=${last.loadavg[0]} browserProcs=${last.browserProcs.length}`);
  if ((Date.now() - t0) / 1000 < SECONDS) setTimeout(tick, 4000);
  else {
    // one instantaneous CPU reading at the end (top -l 2: the second sample is the true one)
    const top = spawnSync('top', ['-l', '2', '-n', '12', '-o', 'cpu', '-stats', 'pid,command,cpu,th,state'], { encoding: 'utf8' });
    const out = top.stdout || '';
    const half = out.slice(out.length / 2);
    writeFileSync(`${OUT}/top-${TAG}.txt`, half);
    console.log('top written');
  }
}
tick();
