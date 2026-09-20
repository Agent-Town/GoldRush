import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const slice = process.argv[2];
const runs = Number(process.argv[3] ?? 8);
const project = process.argv[4] ?? 'mobile-chrome';

if (!['wire-crawler-3d', 'wire-railcar-3d'].includes(slice) || !Number.isInteger(runs) || runs < 1) {
  throw new Error('usage: node artifacts/f1476-1/measure.mjs <wire-crawler-3d|wire-railcar-3d> [runs] [project]');
}

const root = process.cwd();
const outputDir = path.join(root, 'artifacts/f1476-1');
const countsPath = path.join(root, 'artifacts', slice, `renderer-counts-${project}.json`);
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const samples = [];

fs.mkdirSync(outputDir, { recursive: true });
for (let run = 1; run <= runs; run += 1) {
  fs.rmSync(countsPath, { force: true });
  const started = Date.now();
  let rc = 0;
  try {
    execFileSync('npx', [
      'playwright', 'test', `e2e/${slice}.spec.ts`,
      `--project=${project}`, '--workers=1', '--reporter=line',
    ], { cwd: root, stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    rc = error.status ?? 1;
  }
  const seconds = Number(((Date.now() - started) / 1000).toFixed(1));
  if (!fs.existsSync(countsPath)) throw new Error(`run ${run}: rc=${rc}, renderer-count artifact missing`);
  samples.push({ run, rc, seconds, counts: JSON.parse(fs.readFileSync(countsPath, 'utf8')) });
  console.log(`run ${run}/${runs}: rc=${rc} ${seconds}s`);
}

const phases = Object.keys(samples[0].counts).filter((phase) => phase !== 'despawnDelta');
const spread = {};
for (const phase of phases) {
  spread[phase] = {};
  for (const metric of Object.keys(samples[0].counts[phase])) {
    const values = [...new Set(samples.map((sample) => sample.counts[phase][metric]))].sort((a, b) => a - b);
    spread[phase][metric] = {
      min: values[0],
      max: values.at(-1),
      spread: values.at(-1) - values[0],
      values,
      stable: values.length === 1,
    };
  }
}

const deltas = {};
for (let fromIndex = 0; fromIndex < phases.length; fromIndex += 1) {
  for (let toIndex = fromIndex + 1; toIndex < phases.length; toIndex += 1) {
    const from = phases[fromIndex];
    const to = phases[toIndex];
    const pair = `${to}-${from}`;
    deltas[pair] = {};
    for (const metric of ['geometries', 'textures']) {
      const values = [...new Set(samples.map((sample) => sample.counts[to][metric] - sample.counts[from][metric]))].sort((a, b) => a - b);
      deltas[pair][metric] = { values, stable: values.length === 1 };
    }
  }
}

fs.writeFileSync(
  path.join(outputDir, `samples-${slice}-${project}.json`),
  `${JSON.stringify({ slice, project, commit, n: samples.length, samples }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outputDir, `spread-${slice}-${project}.json`),
  `${JSON.stringify({ slice, project, commit, n: samples.length, phases: spread, deltas }, null, 2)}\n`,
);

if (samples.some((sample) => sample.rc !== 0)) process.exitCode = 1;
