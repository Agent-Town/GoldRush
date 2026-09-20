#!/usr/bin/env node
// s1277 — the load arm. The ambient arm returned 6/6 green for the default
// concurrency, but F-1088-2's claim is LOAD-sensitivity, so an idle-machine
// green has almost no power against it. This arm holds a fixed CPU load while
// both concurrency settings run interleaved.
//
// Load model: K spinner children, matching the shape F-1269-1 used when it
// measured the fire shell's per-job CPU ceiling (that finding's headline number
// was taken at eight children).

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'logs/session-scratch/s1277');
fs.mkdirSync(OUT, { recursive: true });

const ROUNDS = Number(process.argv[2] || 3);
const LOADERS = Number(process.argv[3] || 12);

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const phase = pkg.scripts['test:node-guards'].split('&&')[0].trim();
const FILES = phase.replace(/^node --test\s*/, '').trim().split(/\s+/);

const SPINNER = 'const e=Date.now()+1000*60*60;while(Date.now()<e){Math.sqrt(Math.random());}';

function startLoad(n) {
  const kids = [];
  for (let i = 0; i < n; i += 1) {
    kids.push(spawn(process.execPath, ['-e', SPINNER], { stdio: 'ignore' }));
  }
  return kids;
}

function parse(text) {
  const pass = Number((text.match(/^[^\n]*?\bpass\s+(\d+)/m) || [])[1] ?? NaN);
  const fail = Number((text.match(/^[^\n]*?\bfail\s+(\d+)/m) || [])[1] ?? NaN);
  const failed = [...text.matchAll(/^\s*[✖x]\s+(.+?)(?:\s+\(\d)/gm)].map((m) => m[1].trim());
  return { pass, fail, failed: [...new Set(failed)] };
}

function run(arm, round) {
  const args = ['--test'];
  if (arm === 'c1') args.push('--test-concurrency=1');
  args.push(...FILES);
  const logPath = path.join(OUT, `load-${arm}-${round}.log`);
  const fd = fs.openSync(logPath, 'w');
  const t0 = process.hrtime.bigint();
  const res = spawnSync(process.execPath, args, { cwd: ROOT, stdio: ['ignore', fd, fd] });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  fs.closeSync(fd);
  const parsed = parse(fs.readFileSync(logPath, 'utf8'));
  const cell = { arm, round, rc: res.status, wallMs: Math.round(ms), ...parsed, logPath };
  console.log(
    `${arm.padEnd(8)} r${round}  rc=${String(cell.rc).padEnd(3)} pass=${cell.pass} fail=${cell.fail} ` +
      `wall=${(cell.wallMs / 1000).toFixed(2)}s` +
      (cell.failed.length ? `\n           reds: ${cell.failed.join(' | ')}` : ''),
  );
  return cell;
}

console.log(`s1277 LOAD arm — ${LOADERS} spinners on ${os.availableParallelism()} cores, ${ROUNDS} rounds/arm\n`);
const kids = startLoad(LOADERS);
const cells = [];
try {
  // let the load settle so round 1 is not measured during ramp-up
  spawnSync(process.execPath, ['-e', 'const e=Date.now()+3000;while(Date.now()<e);'], { stdio: 'ignore' });
  for (let r = 1; r <= ROUNDS; r += 1) {
    cells.push(run('default', r));
    cells.push(run('c1', r));
  }
} finally {
  for (const k of kids) k.kill('SIGKILL');
}

const summary = {};
for (const arm of ['default', 'c1']) {
  const a = cells.filter((c) => c.arm === arm);
  summary[arm] = {
    runs: a.length,
    rcZero: a.filter((c) => c.rc === 0).length,
    redRuns: a.filter((c) => c.rc !== 0).length,
    meanWallS: Number((a.reduce((s, c) => s + c.wallMs, 0) / a.length / 1000).toFixed(2)),
    distinctReds: [...new Set(a.flatMap((c) => c.failed))],
  };
}
console.log('\n=== SUMMARY (under load) ===');
for (const [arm, s] of Object.entries(summary)) {
  console.log(
    `${arm.padEnd(8)} rc=0 ${s.rcZero}/${s.runs}  red ${s.redRuns}/${s.runs}  mean wall ${s.meanWallS}s  ` +
      `distinct reds: ${s.distinctReds.length ? s.distinctReds.join(' | ') : 'none'}`,
  );
}
fs.writeFileSync(
  path.join(OUT, 'measure-load-result.json'),
  JSON.stringify({ loaders: LOADERS, cores: os.availableParallelism(), cells, summary }, null, 2),
);
console.log(`\nwrote ${path.join(OUT, 'measure-load-result.json')}`);
