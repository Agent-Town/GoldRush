#!/usr/bin/env node

/**
 * THE KITE BATTERY (2026-08-20) — the controlled experiment behind `kite-prover.mjs`, run the way
 * this house runs evidence: every arm twice, one log kept beside the prover that made it.
 *
 *   kite-<seed>-<pattern><+blast>-run<n>.log
 *
 * THE ARMS. Three movement patterns (`still` control, `hug` 5wu ring, `drag` 200wu circuit through
 * both spawn lanes) on both bench seeds, plus the `drag` arm again with `--blast` so the kite is
 * not accused of fighting one-handed. Zero BUILD orders anywhere: the owner built nothing, so
 * neither does this.
 *
 * WHAT THE COMPARISON DECIDES. If the wave can see the rider, `drag` must differ from `still`. If
 * it cannot, all three arms land on the same waves/kills/guard curve and the rider's position is
 * simply not an input — which is a finding about the ENGINE, not about the map.
 *
 * Usage: node artifacts/e9-seed-run/run-kite-evidence.mjs
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const seeds = ['e9-seed-run-01', 'e9-seed-run-02'];
const arms = [
  { pattern: 'still', blast: false },
  { pattern: 'hug', blast: false },
  { pattern: 'drag', blast: false },
  { pattern: 'drag', blast: true },
];
const rows = [];

for (const arm of arms) {
  for (const seed of seeds) {
    for (const run of [1, 2]) {
      const argv = [
        path.join(HERE, 'kite-prover.mjs'), '--seed', seed, '--pattern', arm.pattern, '--quiet',
        ...(arm.blast ? ['--blast'] : []),
      ];
      const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      const stdout = result.stdout ?? '';
      // The renderer prints its performance-tier banner to stdout on boot, so the outcome is the
      // last JSON OBJECT line rather than simply the last line (the `prover.mjs` lesson).
      const line = stdout.trim().split('\n').filter((entry) => entry.startsWith('{"secured"')).at(-1);
      if (!line) throw new Error(`${arm.pattern}/${seed} run${run} produced no outcome:\n${result.stderr}`);
      const label = `${arm.pattern}${arm.blast ? '+blast' : ''}`;
      writeFileSync(path.join(HERE, `kite-${seed.slice(-2)}-${label}-run${run}.log`), `${line}\n`);
      const outcome = JSON.parse(line);
      rows.push({ arm: label, seed, run, ...pick(outcome) });
      process.stdout.write(`${label} ${seed} run${run}: secured=${outcome.secured} waves=${outcome.waves} `
        + `kills=${outcome.kills} maxFromHero=${outcome.kite.maxDistanceFromHero} `
        + `caravan=${outcome.caravan?.state}/${outcome.caravan?.hp}of${outcome.caravan?.maxHp} `
        + `hash=${outcome.eventLogHash}\n`);
    }
  }
}

// DETERMINISM IS PART OF THE CLAIM: run 2 must equal run 1 in every field.
for (const row of rows.filter((entry) => entry.run === 2)) {
  const first = rows.find((entry) => entry.arm === row.arm && entry.seed === row.seed && entry.run === 1);
  const { run: _a, ...second } = row;
  const { run: _b, ...pinned } = first;
  if (JSON.stringify(second) !== JSON.stringify(pinned)) {
    process.stdout.write(`NONDETERMINISM ${row.arm} ${row.seed}\n  run1 ${JSON.stringify(pinned)}\n  run2 ${JSON.stringify(second)}\n`);
    process.exitCode = 1;
  }
}

/**
 * THE EXPERIMENT'S OWN READOUT. Per seed, does moving change the run at all? Reported rather than
 * asserted — this battery is evidence for the owner's F-A8-4 fork, not a gate on it.
 */
const verdict = seeds.map((seed) => {
  const forSeed = (arm) => rows.find((row) => row.seed === seed && row.arm === arm && row.run === 1);
  const still = forSeed('still');
  const drag = forSeed('drag');
  return {
    seed,
    stillWaves: still.waves,
    dragWaves: drag.waves,
    hugWaves: forSeed('hug').waves,
    dragBlastWaves: forSeed('drag+blast').waves,
    movementChangedTheRun: still.waves !== drag.waves || still.kills !== drag.kills || still.timeMs !== drag.timeMs,
    anyArmSecured: rows.some((row) => row.seed === seed && row.secured === true),
  };
});
process.stdout.write(`${JSON.stringify(verdict, null, 2)}\n`);

writeFileSync(
  path.join(HERE, 'kite-summary.json'),
  `${JSON.stringify({ generatedFor: 'e9-seed-run', experiment: 'kite-vs-stand', verdict, rows }, null, 2)}\n`,
);

function pick({ secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason, kite, caravan }) {
  return { secured, waves, timeMs, gold, kills, calls, defaultedPicks, defaultedSecure, eventLogHash, endReason: endReason ?? null, kite, caravan };
}
