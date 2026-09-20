#!/usr/bin/env node

/**
 * THE PRESSURE-LINE SWEEP (2026-08-21) — the search for "best measured play" on the two E2 railcar
 * maps that the owner's ruling just gave a pressure line to.
 *
 * It changes nothing about the game. It only drives `artifacts/e2-railcar-arsenal/prover.mjs` — the
 * SAME prover that re-admitted the Hill Mine, with the SAME public-verb grammar and the SAME declared
 * E1 progression — across the site plans and upgrade orders that prover already offers as flags.
 * The review's own standard is "best measured play"; this is the measuring.
 *
 * Usage:
 *   node artifacts/e2-pressure-line/sweep.mjs --contract e2-incline --seed e2-incline-01 \
 *     [--ladders a,b,c] [--upgrades damage,tank] [--tag probe]
 * Writes one log per run beside this file and prints one JSON line per run on stdout.
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const valueOf = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : undefined);

const contract = valueOf('--contract') ?? 'e2-incline';
const seeds = (valueOf('--seed') ?? `${contract}-01`).split(',');
const ladders = (valueOf('--ladders') ?? 'turrets,beacons,railcar,battery,battery1,rail,rail3').split(',');
const upgrades = (valueOf('--upgrades') ?? 'damage,tank').split(',');
// The coal axis, pipe-separated because each entry is itself a comma list. `99,99,99` never leaves
// the claim and is therefore the pre-ruling control: the same play the review measured when these
// two maps had no pressure line at all.
const coals = (valueOf('--coals') ?? '5,8,11').split('|');
const tag = valueOf('--tag') ?? 'sweep';
const passes = Number(valueOf('--passes') ?? 1);

const summary = [];
for (const seed of seeds) {
  for (const ladder of ladders) {
    for (const upgrade of upgrades) {
      for (const coal of coals) {
      for (let pass = 1; pass <= passes; pass += 1) {
        const started = Date.now();
        const runArgs = ['--contract', contract, '--seed', seed, '--ladder', ladder, '--upgrades', upgrade,
          '--coal-waves', coal];
        const name = `${tag}-${seed}-${ladder}-${upgrade}-c${coal.replaceAll(',', '_')}`;
        const { stdout, stderr } = await run(runArgs);
        await writeFile(`${HERE}${name}-run${pass}.log`, stderr);
        const outcome = JSON.parse(stdout.trim().split('\n').at(-1));
        const line = {
          run: name,
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
    }
  }
}
await writeFile(`${HERE}${tag}-summary.json`, `${JSON.stringify(summary, null, 2)}\n`);

function run(runArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['artifacts/e2-railcar-arsenal/prover.mjs', ...runArgs], { cwd: ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', () => (stdout.trim() ? resolve({ stdout, stderr }) : reject(new Error(`no outcome: ${stderr.slice(-400)}`))));
  });
}
