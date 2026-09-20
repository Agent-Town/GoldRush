#!/usr/bin/env node
// Idle probe: run gr-sim with --policy=idle and capture every view line + the outcome.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const seed = process.argv[2] ?? 'e2-hill-mine-01';
const out = process.argv[3] ?? resolve('artifacts/claude-opus-hillmine/idle-probe.ndjson');

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e2-hill-mine', '--seed', seed, '--policy=idle'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';
child.stdout.on('data', (d) => { stdout += d; });
child.stderr.on('data', (d) => { stderr += d; });
child.on('close', (code) => {
  writeFileSync(out, stdout);
  writeFileSync(out.replace(/\.ndjson$/, '.err'), stderr);
  const lines = stdout.trim().split('\n');
  console.log(`exit=${code} lines=${lines.length}`);
  console.log('LAST:', lines[lines.length - 1]?.slice(0, 400));
});
