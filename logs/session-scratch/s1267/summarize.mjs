// Parse the arm logs into a table. Reds are counted ONLY where the failure carries the drift
// assertion's own signature (`Expected: < 1` immediately above a `Received:`), so a red from any
// other assertion in the same test cannot inflate the rate.
import { readFileSync, readdirSync } from 'node:fs';

const OUT = 'logs/session-scratch/s1267';
const prefix = process.argv[2] || 'fire-concurrent';
const meta = JSON.parse(readFileSync(`${OUT}/${prefix.replace(/-\d+$/, '')}-meta.json`, 'utf8'));

let totalReds = 0;
let totalInstances = 0;
const rows = [];
for (const m of meta) {
  const txt = readFileSync(m.log, 'utf8');
  const workers = (txt.match(/Running (\d+) tests using (\d+) workers?/) || [])[0] || 'UNKNOWN';
  const failed = Number((txt.match(/^\s+(\d+) failed/m) || [0, 0])[1]);
  const passed = Number((txt.match(/^\s+(\d+) passed/m) || [0, 0])[1]);
  const lines = txt.split('\n');
  const received = [];
  for (let i = 1; i < lines.length; i++) {
    if (/Received:/.test(lines[i]) && /Expected:\s*<\s*1\s*$/.test(lines[i - 1])) {
      received.push(Number(lines[i].split('Received:')[1].trim()).toFixed(3));
    }
  }
  totalReds += received.length;
  totalInstances += failed + passed;
  rows.push({ run: m.run, workers, failed, passed, wall: m.wallSeconds, load: m.loadavgBefore, driftReds: received.length, received });
}
console.log(JSON.stringify({ arm: meta[0].arm, cwd: meta[0].cwd || '(repo root)', rows, rate: `${totalReds} / ${totalInstances}` }, null, 2));
