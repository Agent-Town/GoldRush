#!/usr/bin/env node

/**
 * The Old Canal evidence battery (2026-08-21, A10). Every row of the review's table, run TWICE,
 * with one log kept beside the prover that produced it — the E2/E7/A8 convention, which exists
 * because a prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-decide-run<n>.log    the public-verb prover, objective discharged
 *   secure-<seed>-nodecide-run<n>.log  THE CONTROL: the same rider, objective ignored
 *   idle-<seed>-run<n>.log             the null floor, which must NOT secure (Law 2)
 *
 * THE CONTROL IS THE POINT OF THIS BATTERY, not a curiosity. `e9-old-canal` does not secure, so
 * the review has to answer "is the new mechanic what loses it?" with a measurement rather than a
 * sentence. `--no-decide` plays the identical policy with the three verdicts never taken: it
 * cannot secure by construction (the latch never closes), but the WAVE it reaches prices the walk
 * and the ground veto exactly. Both reach wave 17 of 20, so neither costs a wave.
 *
 * NOTE ON THE FLOOR. `e9-old-canal` is admission-exempt, so it carries no row in
 * `assets/contracts/null-floors.json` and `scripts/null-floor-anchors.mjs` will not generate one —
 * that generator walks `supportedContractIds()`. The floor therefore lives here, produced by the
 * same binary, and it is checked the same way: an idle run that secures fails the battery.
 *
 * Usage: node artifacts/e9-old-canal/run-evidence.mjs [--only secure|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e9-old-canal-01', 'e9-old-canal-02'];
const rows = [];

for (const kind of ['secure', 'idle']) {
  if (only && only !== kind) continue;
  const variants = kind === 'secure' ? ['decide', 'nodecide'] : ['idle'];
  for (const variant of variants) {
    for (const seed of seeds) {
      for (const run of [1, 2]) {
        const argv = [
          path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet',
          ...(kind === 'secure' ? (variant === 'nodecide' ? ['--no-decide'] : []) : ['--idle']),
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
          + `kills=${outcome.kills} canal=${outcome.canal?.decided}/${outcome.canal?.total} `
          + `flow=${JSON.stringify(outcome.canal?.flow ?? [])} open=${JSON.stringify(outcome.canal?.openGround ?? [])} `
          + `hash=${outcome.eventLogHash}\n`);
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
// THE OBJECTIVE IS DISCHARGE-ABLE, asserted rather than described: the played rider must finish
// with all three segments decided, or the exemption below would be measuring the wrong thing.
for (const row of rows.filter((entry) => entry.kind === 'secure' && entry.variant === 'decide')) {
  if (row.canal?.allDecided !== true) {
    process.stdout.write(`OBJECTIVE NOT DISCHARGED: ${row.seed} run${row.run} ${JSON.stringify(row.canal)}\n`);
    process.exitCode = 1;
  }
}

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({ generatedFor: 'e9-old-canal', rows }, null, 2)}\n`);

function pick({ secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason, canal }) {
  return { secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason: endReason ?? null, canal };
}
