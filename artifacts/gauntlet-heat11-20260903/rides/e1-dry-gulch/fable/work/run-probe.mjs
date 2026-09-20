#!/usr/bin/env node
// Probe runner: spawns gr-sim with a given policy and captures stdout/stderr to files.
// Usage: node run-probe.mjs <label> [extra gr-sim args...]
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-dry-gulch';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const label = process.argv[2] ?? 'probe';
const extra = process.argv.slice(3);

const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-dry-gulch',
  '--seed', 'e1-dry-gulch-01',
  '--difficulty', 'trail',
  ...extra,
];
const res = spawnSync('node', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
writeFileSync(`${WS}/${label}-stdout.ndjson`, res.stdout ?? '');
writeFileSync(`${WS}/${label}-stderr.txt`, res.stderr ?? '');
const lines = (res.stdout ?? '').trim().split('\n').filter(Boolean);
console.log(`status=${res.status} stdoutLines=${lines.length}`);
console.log('LAST LINE:', lines.at(-1)?.slice(0, 600));
