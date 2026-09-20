#!/usr/bin/env node

/**
 * The Echo Canyon evidence battery (2026-08-20, A3). Runs every row of the review's table twice
 * and keeps one log per run beside the prover that produced it — the E2 railcar convention, kept
 * by A4 and A8, which exists because a prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-run<n>.log   the public-verb prover, which must SECURE
 *   idle-<seed>-run<n>.log     `--policy=idle`, which must NOT (Law 2)
 *
 * Usage: node artifacts/e7-echo-canyon/run-evidence.mjs [--only secure|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e7-echo-canyon-01', 'e7-echo-canyon-02'];
const rows = [];

for (const kind of ['secure', 'idle']) {
  if (only && only !== kind) continue;
  for (const seed of seeds) {
    for (const run of [1, 2]) {
      const argv = kind === 'secure'
        ? [path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet']
        : ['scripts/gr-sim.mjs', '--contract', 'e7-echo-canyon', '--seed', seed, '--policy=idle'];
      const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stdout = result.stdout ?? '';
      writeFileSync(path.join(HERE, `${kind}-${seed.slice(-2)}-run${run}.log`), stdout);
      const outcome = JSON.parse(stdout.trim().split('\n').at(-1));
      rows.push({ kind, seed, run, ...pick(outcome) });
      process.stdout.write(`${kind} ${seed} run${run}: secured=${outcome.secured} waves=${outcome.waves} `
        + `kills=${outcome.kills} hash=${outcome.eventLogHash}\n`);
    }
  }
}

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({ generatedFor: 'e7-echo-canyon', rows }, null, 2)}\n`);

function pick({ secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash }) {
  return { secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash };
}
