#!/usr/bin/env node

/**
 * The Devil's Alley evidence battery (2026-08-21, A9). Runs every row of the review's table twice
 * and keeps one log per run beside the prover that produced it — the E2 railcar convention,
 * which exists because a prover nobody preserved is a claim nobody can re-check.
 *
 *   secure-<seed>-run<n>.log      the public-verb prover, anchored fort, which must SECURE
 *   unanchored-<seed>-run<n>.log  THE CONTROL: the same ten works two world units outside the
 *                                 anchor hold, still legal placements — the run that shows what
 *                                 the wind is worth. Not required to secure, and does not.
 *   idle-<seed>-run<n>.log        `--policy=idle`, which must NOT secure (Law 2)
 *
 * Usage: node artifacts/e9-devils-alley/run-evidence.mjs [--only secure|unanchored|idle]
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const seeds = ['e9-devils-alley-01', 'e9-devils-alley-02'];
const rows = [];

for (const kind of ['secure', 'unanchored', 'idle']) {
  if (only && only !== kind) continue;
  for (const seed of seeds) {
    for (const run of [1, 2]) {
      const argv = kind === 'idle'
        ? ['scripts/gr-sim.mjs', '--contract', 'e9-devils-alley', '--seed', seed, '--policy=idle']
        : [
            path.join(HERE, 'prover.mjs'), '--seed', seed, '--quiet',
            ...(kind === 'unanchored' ? ['--policy', 'unanchored'] : []),
          ];
      const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stdout = result.stdout ?? '';
      writeFileSync(path.join(HERE, `${kind}-${seed.slice(-2)}-run${run}.log`), stdout);
      const lines = stdout.trim().split('\n');
      const outcome = JSON.parse(lines.at(-1));
      // THE WIND'S OWN NUMBERS, read off the last VIEW rather than asserted: how many sweeps ran,
      // how many works it actually moved, and how many it was refused by an anchor.
      const wind = lastWind(lines);
      rows.push({ kind, seed, run, ...pick(outcome), wind });
      process.stdout.write(`${kind} ${seed} run${run}: secured=${outcome.secured} waves=${outcome.waves} `
        + `kills=${outcome.kills} sweeps=${wind?.sweepsCompleted ?? '-'} moved=${wind?.relocations ?? '-'} `
        + `held=${wind?.anchoredRefusals ?? '-'} hash=${outcome.eventLogHash}\n`);
    }
  }
}

writeFileSync(path.join(HERE, 'summary.json'), `${JSON.stringify({
  schema: 'goldrush.a9-devils-alley-evidence.v1',
  contract: 'e9-devils-alley',
  ratification: 'specs/agent-play/door-completion-sheet.md:24 (A9, RATIFIED 2026-08-20)',
  laws: {
    secure: 'the public-verb prover must SECURE both bench seeds, twice, with matching hashes',
    unanchored: 'the control: the same works outside the anchor hold, to price what the hold buys',
    idle: 'Law 2 — an idle run must NOT secure',
  },
  rows,
}, null, 2)}\n`);

function pick(outcome) {
  const { secured, waves, timeMs, gold, kills, eventLogHash } = outcome;
  return { secured, waves, timeMs, gold, kills, eventLogHash };
}

/**
 * Reads the wind row from whichever shape the run produced: the prover emits its own
 * `goldrush.a9-wind.v1` line, while `--policy=idle` streams every VIEW and the last one carries
 * the same numbers. Either way this is a READ of what the run published, never an assertion.
 */
function lastWind(lines) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (!line.includes('devilsAlley') && !line.includes('a9-wind')) continue;
    const parsed = JSON.parse(line);
    if (parsed?.schema === 'goldrush.a9-wind.v1') {
      const { schema: _schema, works: _works, ...rest } = parsed;
      return rest;
    }
    const wind = parsed?.now?.devilsAlley;
    if (!wind) continue;
    return {
      sweepsStarted: wind.sweepsStarted,
      sweepsCompleted: wind.sweepsCompleted,
      relocations: wind.relocations,
      anchoredRefusals: wind.refusals.anchored,
      lastRelocation: wind.lastRelocation,
    };
  }
  return null;
}
