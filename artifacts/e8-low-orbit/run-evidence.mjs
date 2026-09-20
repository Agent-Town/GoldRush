#!/usr/bin/env node

/**
 * The Low Orbit evidence battery (2026-08-20, A7). Runs every row of the review's table twice
 * and keeps one log per run beside the prover that produced it — the E2 railcar convention,
 * which exists because a prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-run<n>.log   the public-verb prover, which must SECURE
 *   idle-<seed>-run<n>.log     `--policy=idle`, which must NOT (Law 2)
 *
 * Usage: node artifacts/e8-low-orbit/run-evidence.mjs [--only secure|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e8-low-orbit-01', 'e8-low-orbit-02'];
const rows = [];

for (const kind of ['secure', 'idle']) {
  if (only && only !== kind) continue;
  for (const seed of seeds) {
    for (const run of [1, 2]) {
      const argv = kind === 'secure'
        ? [path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet']
        : ['scripts/gr-sim.mjs', '--contract', 'e8-low-orbit', '--seed', seed, '--policy=idle'];
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

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({
  schema: 'goldrush.a7-low-orbit-evidence.v1',
  contract: 'e8-low-orbit',
  ratification: 'specs/agent-play/door-completion-sheet.md:20 (A7, RATIFIED 2026-08-20)',
  laws: {
    secure: 'the public-verb prover must SECURE both bench seeds, twice, with matching hashes',
    idle: 'Law 2 — an idle run must NOT secure',
  },
  rows,
}, null, 2)}\n`);

function pick(outcome) {
  const { secured, waves, timeMs, gold, kills, eventLogHash } = outcome;
  return { secured, waves, timeMs, gold, kills, eventLogHash };
}
