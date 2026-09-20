#!/usr/bin/env node

/**
 * THE STRIKE-COST DIAL SWEEP (owner ruling 2026-08-21, verbatim: "ok, lets do it, we can balance
 * later during testing").
 *
 * The owner authorised the admitting value for `NOISE_HUNT_RULES.strikeDamage` and asked for the
 * HIGHEST number that secures both bench seeds twice WITH A ONE-STRIKE MARGIN — so the
 * balance-later session has headroom in both directions rather than a knife-edge.
 *
 * MARGIN IS MEASURED, NOT ASSUMED. A run "has margin" when it secures AND at least one deck pad
 * is still standing at the end with integrity >= the strike cost, i.e. it could have taken one
 * more strike and lived. A secure whose last pad ends on 2 integrity is a secure that a single
 * unlucky wave would have taken away, and pinning that would be pinning a coin-flip.
 *
 * It rewrites the constant in place, measures, and ALWAYS restores the original on exit.
 *
 * Usage: node artifacts/e5-stillwater/dial-sweep.mjs [--values 5,4,3] [--policy bait]
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SOURCE = `${ROOT}src/systems/NoiseHuntSystem.ts`;
const args = process.argv.slice(2);
const valueOf = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : undefined);
const values = (valueOf('--values') ?? '5,4,3').split(',').map(Number);
const policy = valueOf('--policy') ?? 'bait';
const SEEDS = ['e5-stillwater-01', 'e5-stillwater-02'];

const original = readFileSync(SOURCE, 'utf8');
const match = /strikeDamage: ([\d.]+),/.exec(original);
if (!match) throw new Error('strikeDamage not found');
const restore = () => writeFileSync(SOURCE, original);
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });

const rows = [];
try {
  for (const damage of values) {
    writeFileSync(SOURCE, original.replace(/strikeDamage: [\d.]+,/, `strikeDamage: ${damage},`));
    const strikesPerPad = Math.ceil(96 / damage);
    for (const seed of SEEDS) {
      const outcomes = [1, 2].map(() => {
        const run = spawnSync(process.execPath, [
          'artifacts/e5-stillwater/prover.mjs', '--seed', seed,
          '--policy', policy, '--deck', 'turret,sentry_beacon,turret', '--harvest', 'on', '--quiet',
        ], { cwd: ROOT, encoding: 'utf8', timeout: 600_000 });
        return JSON.parse(run.stdout.trim().split('\n').at(-1) ?? '{}');
      });
      const [first, second] = outcomes;
      const identical = JSON.stringify(first) === JSON.stringify(second);
      const decks = (first.noiseHunt?.decks ?? []).map((entry) => Number(entry.split(':').at(-1)));
      const survivors = decks.filter((integrity) => integrity > 0);
      // One-strike margin: a pad is still standing that could eat another strike and live.
      const margin = survivors.length > 0 ? Math.max(...survivors) : 0;
      rows.push({ damage, seed, secured: first.secured, waves: first.waves, identical, margin, strikesPerPad });
      process.stdout.write(`d=${String(damage).padStart(4)} padSurvives=${String(strikesPerPad).padStart(2)} ${seed}`
        + ` secured=${String(first.secured).padEnd(5)} waves=${String(first.waves).padStart(2)}`
        + ` strikes=${String(first.noiseHunt?.strikes ?? 0).padStart(3)}`
        + ` decksLeft=${survivors.length} bestIntegrity=${String(margin).padStart(3)}`
        + ` margin=${margin >= damage ? 'YES' : 'NO '} ${identical ? 'IDENTICAL' : 'DIVERGED'} ${first.eventLogHash}\n`);
    }
  }
} finally {
  restore();
}

const qualifying = values.filter((damage) => {
  const forValue = rows.filter((row) => row.damage === damage);
  return forValue.length === SEEDS.length
    && forValue.every((row) => row.secured && row.identical && row.margin >= damage);
});
process.stdout.write(`\nQUALIFYING (secures both seeds x2 WITH a one-strike margin): ${qualifying.join(', ') || 'none'}\n`);
process.stdout.write(`HIGHEST QUALIFYING: ${qualifying.length ? Math.max(...qualifying) : 'none'}\n`);
