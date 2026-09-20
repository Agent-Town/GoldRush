#!/usr/bin/env node
// Idle probe: runs gr-sim --policy idle, captures views + outcome to files (no shell redirection).
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ROOT = '/private/tmp/heat11-5e7a7c0b';
const WS = `${ROOT}/artifacts/heat11/fable/e2-incline`;
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e2-incline', '--seed', 'e2-incline-01',
  '--policy', 'idle', '--tape', `${WS}/probe-idle.json`], { cwd: ROOT });
let out = '';
let err = '';
child.stdout.on('data', (c) => { out += c; });
child.stderr.on('data', (c) => { err += c; });
child.on('close', (code) => {
  writeFileSync(`${WS}/probe-idle-views.ndjson`, out);
  writeFileSync(`${WS}/probe-idle-stderr.log`, err);
  const lines = out.trim().split('\n');
  process.stdout.write(`exit=${code} lines=${lines.length}\n`);
  process.stdout.write(`${lines.at(-1)}\n`);
});
