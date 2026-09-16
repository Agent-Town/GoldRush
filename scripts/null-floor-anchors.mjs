#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { OUTCOME_FIELDS, classifyNullFloors, exitCodeFor, reportNullFloors } from './null-floor-compare.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_ARTIFACT = path.join(ROOT, 'assets/contracts/null-floors.json');
const args = process.argv.slice(2);
const check = args[0] === '--check';
const compare = args[0] === '--compare';

if ((!check && !compare && args.length > 0) || (check && args.length > 2) || (compare && args.length !== 3)) {
  throw new Error('Usage: node scripts/null-floor-anchors.mjs [--check [artifact-path]] | --compare <pinned> <derived>');
}

// --compare judges two artifacts that already exist. Same classifier, same exit codes, same
// channels as --check, and NO sim and NO git — so the decision this CLI makes is exercisable
// for pennies. Extracting a decision creates a new untested seam at the CALL SITE (F-2209-1);
// this mode is how that seam gets tested from where the caller stands.
if (compare) {
  const pinned = JSON.parse(readFileSync(path.resolve(args[1]), 'utf8'));
  const derivedArtifact = JSON.parse(readFileSync(path.resolve(args[2]), 'utf8'));
  const result = classifyNullFloors(pinned, derivedArtifact);
  reportNullFloors(result, {
    label: path.relative(ROOT, path.resolve(args[1])),
    out: (t) => process.stdout.write(t),
    err: (t) => process.stderr.write(t),
  });
  process.exit(exitCodeFor(result));
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
  const result = classifyNullFloors(pinned, derived);
  reportNullFloors(result, {
    label: path.relative(ROOT, artifactPath),
    seconds,
    out: (t) => process.stdout.write(t),
    err: (t) => process.stderr.write(t),
  });
  process.exitCode = exitCodeFor(result);
}
