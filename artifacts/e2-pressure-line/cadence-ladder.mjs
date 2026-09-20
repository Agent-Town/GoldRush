#!/usr/bin/env node

/**
 * THE CADENCE LADDER — the Stillwater knife-edge method applied to E2's last two maps.
 *
 * Owner, 2026-08-22, verbatim: **"yes, I want to admit it, E2 should be finished as well"**, and
 * twice before that: *"we can balance later during testing"*. So the intent is FINISHED, and the
 * discipline is: find the SINGLE smallest additional dial, ladder it, and ship one clear step inside
 * the securing boundary with margin both ways — never more than the measured minimum.
 *
 * WHY THIS DIAL AND NOT ANOTHER. The ruled `hpScale` 30 -> 12.5 cut was applied first and MEASURED,
 * and its result is the reason this ladder exists: on the runs that die at wave 6 or 10 the cut
 * changed nothing at all — the event-log hashes came back byte-identical (`e6fe4301`, `74a94d27`,
 * `17116d57`, `2207a312`), because the railcar spawns at wave 12 and those claims never met it. A
 * boss-HP dial cannot reach a claim that dies before the boss. What the measurements say the claims
 * actually lack is TIME to convert gold into guns: `waveInterval = Balance.waves.waveInterval /
 * waveCadenceMult` (`WaveSystem.ts:839` browser, `HeadlessContractSim.ts:2016` headless — one
 * formula, both engines), so a cadence BELOW 1 lengthens the gap between waves and nothing else.
 * It is already a lawful `AUTHORED_TWIST_KEY`, it is one number per contract, and it is the only
 * dial in the vocabulary that moves the measured cause.
 *
 * Usage:
 *   node artifacts/e2-pressure-line/cadence-ladder.mjs --contract e2-trestle --seeds 01 \
 *     --rungs 1,0.9,0.8,0.7,0.6 --configs turrets/damage,railcar/damage
 *
 * The contract file is edited in place per rung and ALWAYS restored, including on a crash.
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACTS = `${ROOT}assets/contracts/epoch-2-steamworks/contracts.json`;
const args = process.argv.slice(2);
const valueOf = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : undefined);

const contractId = valueOf('--contract') ?? 'e2-trestle';
const seeds = (valueOf('--seeds') ?? '01,02').split(',').map((n) => `${contractId}-${n}`);
const rungs = (valueOf('--rungs') ?? '1,0.9,0.8,0.7,0.6').split(',').map(Number);
const configs = (valueOf('--configs') ?? 'turrets/damage').split(',').map((entry) => {
  const [ladder, upgrades] = entry.split('/');
  return { ladder, upgrades };
});
const coal = valueOf('--coal') ?? '5,8,11';

const original = readFileSync(CONTRACTS, 'utf8');
const restore = () => writeFileSync(CONTRACTS, original);
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });

const table = [];
try {
  for (const cadence of rungs) {
    setCadence(cadence);
    for (const { ladder, upgrades } of configs) {
      for (const seed of seeds) {
        const started = Date.now();
        const { stdout } = await run(['--contract', contractId, '--seed', seed,
          '--ladder', ladder, '--upgrades', upgrades, '--coal-waves', coal, '--quiet']);
        const outcome = JSON.parse(stdout.trim().split('\n').at(-1));
        const row = {
          contractId,
          cadence,
          waveIntervalSeconds: Number((30 / Math.max(0.1, cadence)).toFixed(1)),
          ladder,
          upgrades,
          seed,
          secured: outcome.secured,
          waves: outcome.waves,
          hash: outcome.eventLogHash,
          pressureSpent: outcome.arsenal?.pressureSpent ?? 0,
          seconds: Math.round((Date.now() - started) / 1000),
        };
        table.push(row);
        process.stdout.write(`${JSON.stringify(row)}\n`);
      }
    }
  }
} finally {
  restore();
}
writeFileSync(`${ROOT}artifacts/e2-pressure-line/cadence-ladder-${contractId}.json`, `${JSON.stringify(table, null, 2)}\n`);

/** Sets (or removes, at 1) `twist.waveCadenceMult` on the target contract, preserving byte layout. */
function setCadence(cadence) {
  const lines = original.split('\n');
  const out = [];
  let inContract = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes(`"id": "${contractId}"`)) inContract = true;
    else if (/^      "id": "/.test(line)) inContract = false;
    out.push(line);
    if (inContract && line === '      "twist": {' && cadence !== 1) {
      out.push(`        "waveCadenceMult": ${cadence},`);
    }
  }
  const text = out.join('\n');
  JSON.parse(text);
  writeFileSync(CONTRACTS, text);
}

function run(runArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['artifacts/e2-railcar-arsenal/prover.mjs', ...runArgs], { cwd: ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', () => (stdout.trim() ? resolve({ stdout, stderr }) : reject(new Error(`no outcome: ${stderr.slice(-300)}`))));
  });
}
