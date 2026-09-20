#!/usr/bin/env node
// s1256 — is port 5188 taken (the lane worktrees share it, and a live lane run must not be killed),
// and what is the box's load while lane-a runs GG-03e?
import { spawnSync } from 'node:child_process';
import { loadavg, cpus } from 'node:os';

const lsof = spawnSync('lsof', ['-nP', '-iTCP:5188', '-sTCP:LISTEN'], { encoding: 'utf8' });
console.log('--- lsof :5188 ---');
console.log(lsof.stdout.trim() || '(nothing listening)');
const lsof99 = spawnSync('lsof', ['-nP', '-iTCP:5199', '-sTCP:LISTEN'], { encoding: 'utf8' });
console.log('--- lsof :5199 ---');
console.log(lsof99.stdout.trim() || '(nothing listening)');
console.log('--- load ---');
console.log(`loadavg=${loadavg().map((n) => n.toFixed(2)).join(' ')} cpus=${cpus().length}`);
