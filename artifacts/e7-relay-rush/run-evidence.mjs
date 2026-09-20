#!/usr/bin/env node

/**
 * The Relay Rush evidence battery (2026-08-20, A5). Runs every row of the review's table twice
 * and keeps one log per run beside the prover that produced it — the E2 railcar convention,
 * which exists because a prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-run<n>.log   the public-verb prover through the `admissionProbe` seam
 *   plain-<seed>-run<n>.log    the SAME play through the ORDINARY door, no probe flag at all —
 *                              the run that certifies the admission rather than measuring it
 *   idle-<seed>-run<n>.log     `--idle`, which must NOT secure (Law 2)
 *
 * THE PLAIN ROW IS NEW ON 2026-08-21 AND IT IS THE POINT. While `e7-relay-rush` sat in
 * `CONTRACT_ADMISSION_EXEMPTIONS` the ordinary door refused to construct it, so every row here had
 * to ride `admissionProbe` — the declared measurement seam. The owner's stake ruling reversed that,
 * and a proof taken through the measurement seam is not a proof of the door. So the battery now
 * runs both and the logs sit side by side: same policy, same seeds, two doors, matching results.
 *
 * Usage: node artifacts/e7-relay-rush/run-evidence.mjs [--only secure|plain|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e7-relay-rush-01', 'e7-relay-rush-02'];
const rows = [];

const EXTRA = { secure: [], plain: ['--plain'], idle: ['--idle'] };

for (const kind of ['secure', 'plain', 'idle']) {
  if (only && only !== kind) continue;
  for (const seed of seeds) {
    for (const run of [1, 2]) {
      const argv = [path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet', ...EXTRA[kind]];
      const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stdout = result.stdout ?? '';
      writeFileSync(path.join(HERE, `${kind}-${seed.slice(-2)}-run${run}.log`), stdout);
      const outcome = JSON.parse(stdout.trim().split('\n').at(-1));
      rows.push({ kind, seed, run, ...pick(outcome) });
      process.stdout.write(`${kind} ${seed} run${run}: secured=${outcome.secured} waves=${outcome.waves} `
        + `kills=${outcome.kills} lit=${outcome.front?.litCount ?? '-'} `
        + `met=${outcome.front?.objectiveMet ?? '-'} mute=${outcome.front?.mutedWorkSteps ?? '-'} `
        + `hash=${outcome.eventLogHash}\n`);
    }
  }
}

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({
  schema: 'goldrush.a5-relay-rush-evidence.v1',
  contract: 'e7-relay-rush',
  ratification: 'specs/agent-play/door-completion-sheet.md:16 (A5, RATIFIED 2026-08-20)',
  ruling: 'owner 2026-08-21, verbatim to the five-map fork table: "lets follow your recommendation" — F-A5-1, a heroStart stake inside a relay site. Stake: relay-ridge-command-stake at (-25,41), the centre of relay-site-r2.',
  laws: {
    secure: 'the public-verb prover must SECURE both bench seeds, twice, with matching hashes — MET at wave 20 on both',
    plain: 'and it must do it through the ORDINARY door, with no admissionProbe — which is only possible once admitted',
    idle: 'Law 2 — an idle run must NOT secure',
    objective: 'the ratified deadline is discharge-able: 3 of 4 relay sites lit before the third front (t=270s)',
  },
  rows,
}, null, 2)}\n`);

function pick(outcome) {
  const { secured, waves, timeMs, gold, kills, eventLogHash, front } = outcome;
  return { secured, waves, timeMs, gold, kills, eventLogHash, front };
}
