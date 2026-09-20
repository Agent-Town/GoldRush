#!/usr/bin/env node

/**
 * THE EVIDENCE BATTERY for the E2 pressure-arsenal headless socket (2026-08-20).
 *
 * Runs the prover across the matrix a re-admission claim has to answer, twice per row so every
 * number carries its own determinism check, and writes one log per run beside this file:
 *   secure   e2-pressure-garden, both bench seeds, DECLARED progression   -> the socket works
 *   gap      the three railcar contracts, both bench seeds, DECLARED      -> how far short, exactly
 *   cold     e2-hill-mine, DECLARED=false, same play                      -> the null-progression control
 *   idle     the three railcar contracts, no orders at all                -> the Law-2 floors
 *
 * Usage: node artifacts/e2-railcar-arsenal/run-evidence.mjs [--only <prefix>]
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

const RAILCARS = ['e2-hill-mine', 'e2-trestle', 'e2-incline'];
const rows = [
  ...['01', '02'].map((n) => ({
    name: `secure-e2-hill-mine-${n}`, args: ['--contract', 'e2-hill-mine', '--seed', `e2-hill-mine-${n}`],
  })),
  ...['e2-trestle', 'e2-incline'].flatMap((contract) => ['01', '02'].map((n) => ({
    name: `gap-${contract}-${n}`, args: ['--contract', contract, '--seed', `${contract}-${n}`],
  }))),
  ...['01', '02'].map((n) => ({
    name: `cold-e2-hill-mine-${n}`, args: ['--contract', 'e2-hill-mine', '--seed', `e2-hill-mine-${n}`, '--cold'],
  })),
  ...RAILCARS.flatMap((contract) => ['01', '02'].map((n) => ({
    name: `idle-${contract}-${n}`, args: ['--contract', contract, '--seed', `${contract}-${n}`, '--policy', 'idle', '--cold'],
  }))),
];

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
