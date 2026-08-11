#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_ARTIFACT = path.join(ROOT, 'assets/contracts/null-floors.json');
const OUTCOME_FIELDS = ['secured', 'waves', 'timeMs', 'gold', 'kills', 'eventLogHash'];
const args = process.argv.slice(2);
const check = args[0] === '--check';

if ((!check && args.length > 0) || (check && args.length > 2)) {
  throw new Error('Usage: node scripts/null-floor-anchors.mjs [--check [artifact-path]]');
}

const artifactPath = check && args[1] ? path.resolve(args[1]) : DEFAULT_ARTIFACT;
const startedAt = performance.now();
const base = execFileSync('git', ['merge-base', 'HEAD', 'main'], { cwd: ROOT, encoding: 'utf8' }).trim();
const eraStamp = execFileSync('git', ['rev-parse', '--short', base], { cwd: ROOT, encoding: 'utf8' }).trim();
const benchSeeds = JSON.parse(readFileSync(path.join(ROOT, 'assets/contracts/bench-seeds.json'), 'utf8'));
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let supported;
try {
  const { supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  supported = new Set(supportedContractIds());
} finally {
  await vite.close();
}

const floors = {};
let pairCount = 0;
for (const [contract, seeds] of Object.entries(benchSeeds)) {
  if (!supported.has(contract)) continue;
  floors[contract] = {};
  for (const seed of seeds) {
    const run = spawnSync(process.execPath, [
      'scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle',
    ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    if (run.status !== 0) throw new Error(`${contract}/${seed} failed (rc=${run.status}): ${run.stderr}`);
    const outcome = JSON.parse(run.stdout.trim().split('\n').at(-1));
    floors[contract][seed] = Object.fromEntries(OUTCOME_FIELDS.map((field) => [field, outcome[field]]));
    pairCount += 1;
  }
}

const derived = {
  schema: 'goldrush.nullfloor.v1',
  eraStamp,
  policy: 'idle',
  floors,
};
const seconds = ((performance.now() - startedAt) / 1000).toFixed(1);

if (!check) {
  writeFileSync(DEFAULT_ARTIFACT, `${JSON.stringify(derived, null, 2)}\n`);
  process.stdout.write(`Wrote ${pairCount} null floors to ${path.relative(ROOT, DEFAULT_ARTIFACT)} in ${seconds}s.\n`);
} else {
  const pinned = JSON.parse(readFileSync(artifactPath, 'utf8'));
  const drift = diff(pinned, derived);
  if (drift === 0) {
    process.stdout.write(`${pairCount} null floors match ${path.relative(ROOT, artifactPath)} (${seconds}s).\n`);
  } else {
    process.stderr.write(`${drift} null-floor difference${drift === 1 ? '' : 's'} found (${seconds}s).\n`);
    process.exitCode = 1;
  }
}

function diff(pinned, derived) {
  let count = 0;
  for (const field of ['schema', 'eraStamp', 'policy']) {
    if (pinned[field] === derived[field]) continue;
    process.stderr.write(`${field}: pinned=${JSON.stringify(pinned[field])} derived=${JSON.stringify(derived[field])}\n`);
    count += 1;
  }
  const contracts = new Set([...Object.keys(pinned.floors ?? {}), ...Object.keys(derived.floors)]);
  for (const contract of [...contracts].sort()) {
    const seeds = new Set([
      ...Object.keys(pinned.floors?.[contract] ?? {}),
      ...Object.keys(derived.floors[contract] ?? {}),
    ]);
    for (const seed of [...seeds].sort()) {
      const before = pinned.floors?.[contract]?.[seed];
      const after = derived.floors[contract]?.[seed];
      if (before === undefined || after === undefined) {
        process.stderr.write(`${contract}/${seed}: pinned=${before === undefined ? '<missing>' : JSON.stringify(before)} derived=${after === undefined ? '<missing>' : JSON.stringify(after)}\n`);
        count += 1;
        continue;
      }
      for (const field of OUTCOME_FIELDS) {
        if (before[field] === after[field]) continue;
        process.stderr.write(`${contract}/${seed} ${field}: pinned=${JSON.stringify(before[field])} derived=${JSON.stringify(after[field])}\n`);
        count += 1;
      }
    }
  }
  return count;
}
