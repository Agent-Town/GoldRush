#!/usr/bin/env node
// s1256 — is lane-a's GG-03e run still live at handoff time? Liveness by CPU + running/ contents,
// not by pid existence alone (a pid can outlive its usefulness; a flat-CPU codex is hung).
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const running = readdirSync(resolve(repo, 'tasks/running'));
console.log('tasks/running:', running.join(' ') || '(empty)');

const pidFile = resolve(repo, 'tasks/running/lane-a.pid');
if (existsSync(pidFile)) {
  const pid = readFileSync(pidFile, 'utf8').trim();
  const ps = spawnSync('ps', ['-p', pid, '-o', 'pid=,etime=,%cpu='], { encoding: 'utf8' });
  console.log(`lane-a.pid=${pid} ps: ${ps.stdout.trim() || '(no such process)'}`);
  const kids = spawnSync('pgrep', ['-P', pid], { encoding: 'utf8' }).stdout.trim().split('\n').filter(Boolean);
  for (const kid of kids) {
    const k = spawnSync('ps', ['-p', kid, '-o', 'pid=,etime=,%cpu=,comm='], { encoding: 'utf8' });
    console.log(`  child ${k.stdout.trim()}`);
  }
}
const done = readdirSync(resolve(repo, 'tasks/done'))
  .map((f) => ({ f, t: spawnSync('stat', ['-f', '%m', resolve(repo, 'tasks/done', f)], { encoding: 'utf8' }).stdout.trim() }))
  .sort((a, b) => Number(b.t) - Number(a.t))
  .slice(0, 3);
console.log('newest done-moves:');
for (const d of done) console.log('  ' + d.f);
