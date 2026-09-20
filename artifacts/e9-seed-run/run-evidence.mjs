#!/usr/bin/env node

/**
 * The Seed Run evidence battery (2026-08-20, A8). Every row of the review's table, run TWICE, with
 * one log kept beside the prover that produced it — the E2/E7 convention, which exists because a
 * prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-<plants>-run<n>.log   the public-verb prover
 *   idle-<seed>-run<n>.log              the null floor, which must NOT secure (Law 2)
 *
 * NOTE ON THE FLOOR. `e9-seed-run` is admission-exempt, so it carries no row in
 * `assets/contracts/null-floors.json` and `scripts/null-floor-anchors.mjs` will not generate one —
 * that generator walks `supportedContractIds()`. The floor therefore lives here, produced by the
 * same binary through the same `admissionProbe` seam, and it is checked the same way: an idle run
 * that secures fails the battery.
 *
 * Usage: node artifacts/e9-seed-run/run-evidence.mjs [--only secure|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e9-seed-run-01', 'e9-seed-run-02'];
const rows = [];

for (const kind of ['secure', 'idle']) {
  if (only && only !== kind) continue;
  const variants = kind === 'secure' ? ['none', 'all'] : ['idle'];
  for (const variant of variants) {
    for (const seed of seeds) {
      for (const run of [1, 2]) {
        const argv = [
          path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet',
          ...(kind === 'secure' ? ['--plants', variant] : ['--idle']),
        ];
        const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
        const stdout = result.stdout ?? '';
        // The renderer prints its performance-tier banner to stdout on boot, so the outcome is the
        // last JSON OBJECT line rather than simply the last line.
        const line = stdout.trim().split('\n').filter((entry) => entry.startsWith('{"secured"')).at(-1);
        if (!line) throw new Error(`${kind}/${variant}/${seed} run${run} produced no outcome:\n${result.stderr}`);
        writeFileSync(path.join(HERE, `${kind}-${seed.slice(-2)}-${variant}-run${run}.log`), `${line}\n`);
        const outcome = JSON.parse(line);
        rows.push({ kind, variant, seed, run, ...pick(outcome) });
        process.stdout.write(`${kind}/${variant} ${seed} run${run}: secured=${outcome.secured} waves=${outcome.waves} `
          + `kills=${outcome.kills} caravan=${outcome.caravan?.state}/${outcome.caravan?.hp}of${outcome.caravan?.maxHp} `
          + `planted=${JSON.stringify(outcome.caravan?.planted ?? [])} hash=${outcome.eventLogHash}\n`);
      }
    }
  }
}

// DETERMINISM IS PART OF THE CLAIM, not a footnote: run 2 must equal run 1 in every field.
for (const row of rows.filter((entry) => entry.run === 2)) {
  const first = rows.find((entry) => entry.kind === row.kind && entry.variant === row.variant
    && entry.seed === row.seed && entry.run === 1);
  const { run: _a, ...second } = row;
  const { run: _b, ...pinned } = first;
  if (JSON.stringify(second) !== JSON.stringify(pinned)) {
    process.stdout.write(`NONDETERMINISM ${row.kind}/${row.variant} ${row.seed}\n  run1 ${JSON.stringify(pinned)}\n  run2 ${JSON.stringify(second)}\n`);
    process.exitCode = 1;
  }
}
// LAW 2, asserted rather than described.
for (const row of rows.filter((entry) => entry.kind === 'idle')) {
  if (row.secured !== false) {
    process.stdout.write(`LAW-2 VIOLATION: idle ${row.seed} run${row.run} secured\n`);
    process.exitCode = 1;
  }
}

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({ generatedFor: 'e9-seed-run', rows }, null, 2)}\n`);

function pick({ secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason, caravan }) {
  return { secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason: endReason ?? null, caravan };
}
