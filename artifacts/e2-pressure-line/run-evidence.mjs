#!/usr/bin/env node

/**
 * THE EVIDENCE BATTERY for the owner's 2026-08-21 pressure-line ruling on `e2-incline` and
 * `e2-trestle` ("E2's pressure ... - lets do that", executing desk recommendation F-E2PA-6,
 * "give both the pressure line").
 *
 * Three rows per bench seed, each run TWICE so every number carries its own determinism check:
 *
 *   line  the best measured play that USES the pressure line — the boiler is bought, a body walks
 *         to the coal, and the E2 arsenal spends what the boilers make. This is the ruling's gift,
 *         measured. Per-seed flags come from the 97-run search in `<tag>-summary.json`.
 *   dry   the same rider IGNORING the pressure line: `turrets-dry` (the ladder with the boiler
 *         struck out) and `--coal-waves 99,99,99` (never leave the claim). This is the play the
 *         maps had BEFORE the ruling, and it is the attribution control — it must reproduce the
 *         review's own pre-ruling hashes bit for bit, which is the proof the contract edit moved
 *         no balance.
 *   idle  no orders at all, no declaration: the Law-2 null floor with pressure now declared. A
 *         floor that stayed honest is a floor that still builds nothing.
 *
 * Usage: node artifacts/e2-pressure-line/run-evidence.mjs [--only <prefix>]
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

/** Best-of-search per seed, taken from the sweep summaries in this directory — never hand-tuned. */
/**
 * Best-of-search per seed, taken from the sweep summaries in this directory — never hand-tuned.
 * RE-CHOSEN 2026-08-21 after the owner's `coalSeams` ruling moved each map's coal onto its own
 * ground: the fuel economics changed, so the winning flags were re-measured rather than inherited
 * (64 runs, `v2*.jsonl`). `line` is the deepest run that actually SPENDS pressure; `deep` is the
 * deepest run of any kind, which on both trestle seeds is one that declines the line.
 */
const LINE = {
  'e2-trestle-01': ['--ladder', 'turrets', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
  'e2-trestle-02': ['--ladder', 'turrets', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
  'e2-incline-01': ['--ladder', 'railcar', '--upgrades', 'tank', '--coal-waves', '5,8,11'],
  'e2-incline-02': ['--ladder', 'railcar', '--upgrades', 'tank', '--coal-waves', '5,8,11'],
};
const DEEP = {
  'e2-trestle-01': ['--ladder', 'railcar', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
  'e2-trestle-02': ['--ladder', 'railcar', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
  'e2-incline-01': ['--ladder', 'turrets', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
  'e2-incline-02': ['--ladder', 'turrets', '--upgrades', 'damage', '--coal-waves', '5,8,11'],
};
const DRY = ['--ladder', 'turrets-dry', '--upgrades', 'damage', '--coal-waves', '99,99,99'];

const rows = [];
for (const contract of ['e2-trestle', 'e2-incline']) {
  for (const n of ['01', '02']) {
    const seed = `${contract}-${n}`;
    const base = ['--contract', contract, '--seed', seed];
    rows.push({ name: `line-${seed}`, args: [...base, ...LINE[seed]] });
    rows.push({ name: `deep-${seed}`, args: [...base, ...DEEP[seed]] });
    rows.push({ name: `dry-${seed}`, args: [...base, ...DRY] });
    rows.push({ name: `idle-${seed}`, args: [...base, '--policy', 'idle', '--cold'] });
  }
}

const summary = [];
for (const row of rows) {
  if (only && !row.name.startsWith(only)) continue;
  for (const pass of [1, 2]) {
    const started = Date.now();
    const { stdout, stderr } = await run(row.args);
    await writeFile(`${HERE}${row.name}-run${pass}.log`, stderr);
    const outcome = JSON.parse(stdout.trim().split('\n').at(-1));
    const line = {
      run: row.name,
      pass,
      flags: row.args.join(' '),
      secured: outcome.secured,
      waves: outcome.waves,
      hash: outcome.eventLogHash,
      kills: outcome.kills,
      fires: outcome.arsenal?.fires ?? null,
      pressureSpent: outcome.arsenal?.pressureSpent ?? 0,
      pressureGranted: outcome.pressure?.granted ?? 0,
      seconds: Math.round((Date.now() - started) / 1000),
    };
    summary.push(line);
    process.stdout.write(`${JSON.stringify(line)}\n`);
  }
}
await writeFile(`${HERE}summary.json`, `${JSON.stringify(summary, null, 2)}\n`);

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['artifacts/e2-railcar-arsenal/prover.mjs', ...args], { cwd: ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', () => (stdout.trim() ? resolve({ stdout, stderr }) : reject(new Error(`no outcome: ${stderr.slice(-400)}`))));
  });
}
