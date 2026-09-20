#!/usr/bin/env node
// s1277 — does `test:node-guards`' `node --test` phase carry the F-1270-1
// fire-shell defect? Interleaved two-arm measure, same shell, same hour.
//
// ARM A: default concurrency (what package.json actually runs today)
// ARM B: --test-concurrency=1
//
// Method notes (why it is built this way):
//  - the file list is READ FROM package.json, never retyped, so this measures
//    their instrument and not my model of it;
//  - child stdout goes to a FILE, never a pipe: spawnSync truncates under load
//    and this experiment deliberately creates load;
//  - arms are INTERLEAVED so ambient load is shared, not confounded;
//  - the default reporter is left alone — switching to tap would change the
//    instrument being measured.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'logs/session-scratch/s1277');
fs.mkdirSync(OUT, { recursive: true });

const ROUNDS = Number(process.argv[2] || 3);

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const phase = pkg.scripts['test:node-guards'].split('&&')[0].trim();
const FILES = phase.replace(/^node --test\s*/, '').trim().split(/\s+/);

function parse(text) {
  const pass = Number((text.match(/^[^\n]*?\bpass\s+(\d+)/m) || [])[1] ?? NaN);
  const fail = Number((text.match(/^[^\n]*?\bfail\s+(\d+)/m) || [])[1] ?? NaN);
  // failing test names: spec reporter marks them with a leading ✖
  const failed = [...text.matchAll(/^\s*[✖x]\s+(.+?)(?:\s+\(\d)/gm)].map((m) => m[1].trim());
  return { pass, fail, failed: [...new Set(failed)] };
}

function run(arm, round) {
  const args = ['--test'];
  if (arm === 'c1') args.push('--test-concurrency=1');
  args.push(...FILES);

  const logPath = path.join(OUT, `run-${arm}-${round}.log`);
  const fd = fs.openSync(logPath, 'w');
  const t0 = process.hrtime.bigint();
  const res = spawnSync(process.execPath, args, { cwd: ROOT, stdio: ['ignore', fd, fd] });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  fs.closeSync(fd);

  const text = fs.readFileSync(logPath, 'utf8');
  const parsed = parse(text);
  const cell = { arm, round, rc: res.status, wallMs: Math.round(ms), ...parsed, logPath };
  console.log(
    `${arm.padEnd(8)} r${round}  rc=${String(cell.rc).padEnd(3)} ` +
      `pass=${cell.pass} fail=${cell.fail} wall=${(cell.wallMs / 1000).toFixed(2)}s` +
      (cell.failed.length ? `\n           reds: ${cell.failed.join(' | ')}` : ''),
  );
  return cell;
}

console.log(
  `s1277 node --test concurrency measure\n` +
    `  CLAUDE_CONFIG_DIR : ${process.env.CLAUDE_CONFIG_DIR ?? '(unset)'}\n` +
    `  availableParallelism : ${os.availableParallelism()}\n` +
    `  test files : ${FILES.length}\n` +
    `  rounds per arm : ${ROUNDS}\n`,
);

const cells = [];
for (let r = 1; r <= ROUNDS; r += 1) {
  cells.push(run('default', r));
  cells.push(run('c1', r));
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

console.log('\n=== SUMMARY ===');
for (const [arm, s] of Object.entries(summary)) {
  console.log(
    `${arm.padEnd(8)} rc=0 ${s.rcZero}/${s.runs}  red ${s.redRuns}/${s.runs}  ` +
      `mean wall ${s.meanWallS}s  distinct reds: ${s.distinctReds.length ? s.distinctReds.join(' | ') : 'none'}`,
  );
}

fs.writeFileSync(
  path.join(OUT, 'measure-result.json'),
  JSON.stringify({ env: { claudeConfigDir: process.env.CLAUDE_CONFIG_DIR ?? null, availableParallelism: os.availableParallelism(), files: FILES.length }, cells, summary }, null, 2),
);
console.log(`\nwrote ${path.join(OUT, 'measure-result.json')}`);
