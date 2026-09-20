#!/usr/bin/env node

/**
 * THE STILLWATER EVIDENCE BATTERY (A2, 2026-08-21) — the "x2 per seed" law made executable.
 *
 * For every policy x every bench seed x two runs it writes one log and one outcome, then asserts
 * the repeat is byte-identical. Preserved beside the prover per the retention law: these runs are
 * the whole basis of `e5-stillwater`'s rewritten `CONTRACT_ADMISSION_EXEMPTIONS` row, and a row
 * whose evidence cannot be re-run is a claim rather than a measurement.
 *
 * Usage: node artifacts/e5-stillwater/run-evidence.mjs [--only idle|secure]
 * Writes artifacts/e5-stillwater/<policy>-<seed>-run<N>.log and summary.json.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const only = args.indexOf('--only') >= 0 ? args[args.indexOf('--only') + 1] : null;
const SEEDS = ['e5-stillwater-01', 'e5-stillwater-02'];
/**
 * Seven premises, each changing exactly one thing from the one above it, so a reader can tell
 * WHICH lever moved the number. `harvest=off` keeps the Prospector on the deck: it gives up the
 * gold but also the pump, because a HARVEST standing order walks the body onto the seam where
 * the continuous channel — the machine — engages.
 */
const CASES = [
  // THE ADMISSION ROWS (2026-08-21). `plain` drives `scripts/gr-sim.mjs` with NO admissionProbe —
  // the door every rider gets — and is what the re-admission stands on. The in-process rows below
  // are kept because they are what the whole exemption history was measured on.
  { name: 'ADMIT-plain-door-secure', policy: 'bait', deck: 'turret,sentry_beacon,turret', harvest: 'on', plain: true },
  { name: 'ADMIT-plain-door-idle', idle: true, plain: true },
  { name: 'ADMIT-in-process-secure', policy: 'bait', deck: 'turret,sentry_beacon,turret', harvest: 'on' },
  { name: 'idle', idle: true },
  // The pre-anchor baseline, kept so the aiming rows have something to beat.
  { name: 'deck-gun-beacon-gun-quiet-pan', policy: 'deck', deck: 'turret,sentry_beacon,turret', harvest: 'off' },
  { name: 'deck-total-silence', policy: 'deck', deck: 'sentry_beacon,sentry_beacon,sentry_beacon', harvest: 'off' },
  { name: 'drift-stay-quiet', policy: 'drift', deck: 'turret,sentry_beacon,turret', harvest: 'off' },
  // THE AIMING ROWS (owner ruling 2026-08-21 — `shelf-watch`).
  { name: 'aim-lure', policy: 'aim', deck: 'turret,sentry_beacon,turret', harvest: 'on' },
  { name: 'aim-three-guns', policy: 'aim', deck: 'turret,turret,turret', harvest: 'on' },
  { name: 'aim-silent-control', policy: 'aim', deck: 'turret,sentry_beacon,turret', harvest: 'off' },
  { name: 'bait-shelf-while-trailed', policy: 'bait', deck: 'turret,sentry_beacon,turret', harvest: 'on' },
  { name: 'shed-buy-the-decks-back', policy: 'shed', deck: 'turret,sentry_beacon,turret', harvest: 'on' },
  { name: 'kite-hop-the-loud-stations', policy: 'kite', deck: 'turret,sentry_beacon,turret', harvest: 'on' },
];

mkdirSync(HERE, { recursive: true });
const summary = [];
for (const entry of CASES) {
  if (only === 'idle' && !entry.idle) continue;
  if (only === 'secure' && entry.idle) continue;
  for (const seed of SEEDS) {
    const outcomes = [];
    for (const run of [1, 2]) {
      const argv = ['artifacts/e5-stillwater/prover.mjs', '--seed', seed];
      if (entry.plain) argv.push('--plain', '--quiet');
      if (entry.idle) argv.push('--idle');
      else argv.push('--policy', entry.policy, '--deck', entry.deck, '--harvest', entry.harvest);
      const result = spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', timeout: 600_000 });
      const line = result.stdout.trim().split('\n').at(-1) ?? '{}';
      writeFileSync(`${HERE}${entry.name}-${seed.slice(-2)}-run${run}.log`, `${result.stderr}\n${line}\n`);
      outcomes.push(JSON.parse(line));
    }
    const [first, second] = outcomes;
    const identical = JSON.stringify(first) === JSON.stringify(second);
    summary.push({ case: entry.name, seed, identical, ...first });
    process.stdout.write(`${entry.name.padEnd(26)} ${seed} secured=${first.secured} waves=${first.waves}`
      + ` kills=${first.kills} strikes=${first.noiseHunt?.strikes ?? '-'} ${first.eventLogHash}`
      + ` repeat=${identical ? 'IDENTICAL' : 'DIVERGED'}\n`);
  }
}
writeFileSync(`${HERE}summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
if (summary.some(({ identical }) => !identical)) process.exitCode = 1;
if (summary.some(({ case: name, secured }) => name === 'idle' && secured)) process.exitCode = 1;
