// s1268 — parse the sweep into a curve. Red counting is s1267's signature VERBATIM (a
// `Received:` line immediately preceded by `Expected: < 1`), so a red from any other assertion
// in the same spec cannot inflate the drift rate. Concurrency is read from the reporter's own
// `Running X tests using M workers` line, never from the flag passed (s1217/s1264).
import { readFileSync } from 'node:fs';

const OUT = 'logs/session-scratch/s1268';
const meta = JSON.parse(readFileSync(`${OUT}/sweep-meta.json`, 'utf8'));

const rows = [];
for (const m of meta) {
  const txt = readFileSync(m.log, 'utf8');
  const runLine = (txt.match(/Running (\d+) tests using (\d+) workers?/) || [])[0] || 'UNKNOWN';
  const actualWorkers = Number((txt.match(/using (\d+) workers?/) || [0, 0])[1]);
  const failed = Number((txt.match(/^\s+(\d+) failed/m) || [0, 0])[1]);
  const passed = Number((txt.match(/^\s+(\d+) passed/m) || [0, 0])[1]);
  const lines = txt.split('\n');
  const received = [];
  for (let i = 1; i < lines.length; i++) {
    if (/Received:/.test(lines[i]) && /Expected:\s*<\s*1\s*$/.test(lines[i - 1])) {
      received.push(Number(lines[i].split('Received:')[1].trim()).toFixed(3));
    }
  }
  // the second latency-sensitive assertion s1267 reported as F-1267-2
  const newsieMisses = (txt.match(/Received: +"tavernkeeper"/g) || []).length;
  rows.push({
    seq: m.seq, cycle: m.cycle, flag: m.workersFlag, actualWorkers, runLine,
    wall: m.wallSeconds, rc: m.exitCode, failed, passed,
    driftReds: received.length, received, newsieMisses,
    load1Before: Number(m.loadavgBefore.split(' ')[0]),
    load1After: Number(m.loadavgAfter.split(' ')[0]),
  });
}

// aggregate per worker step
const byStep = {};
for (const r of rows) {
  const k = r.actualWorkers || r.flag;
  byStep[k] ??= { workers: k, runs: 0, wallTotal: 0, walls: [], reds: 0, instances: 0, newsie: 0 };
  const b = byStep[k];
  b.runs += 1; b.wallTotal += r.wall; b.walls.push(r.wall);
  b.reds += r.driftReds; b.instances += r.failed + r.passed; b.newsie += r.newsieMisses;
}
const summary = Object.values(byStep).map((b) => ({
  workers: b.workers,
  runs: b.runs,
  wallMean: +(b.wallTotal / b.runs).toFixed(2),
  walls: b.walls,
  secondsPerTest: +((b.wallTotal / b.runs) / 6).toFixed(2),
  driftRate: `${b.reds} / ${b.instances}`,
  newsieMisses: b.newsie,
})).sort((a, b) => a.workers - b.workers);

console.log(JSON.stringify({ rows, summary }, null, 2));
