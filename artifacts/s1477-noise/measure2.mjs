// Generalised sibling of measure.mjs — same design (subject fixed, instrument pinned),
// parameterised on the spec so the railcar twin can be measured with the same instrument.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1477';
const OUT = '/Users/robin/Claude/Projects/Gold Rush/artifacts/s1477-noise';
const SLICE = process.argv[2];                       // e.g. wire-railcar-3d
const N = Number(process.argv[3] ?? 12);
const PROJECT = process.argv[4] ?? 'desktop-chrome';
const COUNTS = path.join(WT, 'artifacts', SLICE, `renderer-counts-${PROJECT}.json`);

fs.mkdirSync(OUT, { recursive: true });
const samples = [];
for (let i = 1; i <= N; i++) {
  if (fs.existsSync(COUNTS)) fs.rmSync(COUNTS);
  const started = Date.now();
  let rc = 0;
  try {
    execFileSync('npx', ['playwright', 'test', `e2e/${SLICE}.spec.ts`,
      `--project=${PROJECT}`, '--workers=1', '--reporter=line'],
      { cwd: WT, stdio: 'pipe', encoding: 'utf8' });
  } catch { rc = 1; }
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (!fs.existsSync(COUNTS)) { console.log(`run ${i}: rc=${rc} NO ARTIFACT (${secs}s)`); continue; }
  samples.push({ run: i, rc, secs, counts: JSON.parse(fs.readFileSync(COUNTS, 'utf8')) });
  console.log(`run ${i}: rc=${rc} ${secs}s`);
}
if (!samples.length) { console.log('NO SAMPLES'); process.exit(1); }
fs.writeFileSync(path.join(OUT, `samples-${SLICE}-${PROJECT}.json`), JSON.stringify(samples, null, 2) + '\n');

const report = {};
let total = 0; const noisy = [];
console.log(`\n=== ${SLICE} — SPREAD ACROSS ${samples.length} RUNS (same commit) ===`);
for (const phase of Object.keys(samples[0].counts)) {
  report[phase] = {};
  for (const metric of Object.keys(samples[0].counts[phase])) {
    const vals = samples.map((s) => s.counts[phase][metric]);
    const uniq = [...new Set(vals)].sort((a, b) => a - b);
    const min = Math.min(...vals), max = Math.max(...vals);
    report[phase][metric] = { min, max, spread: max - min, values: uniq, stable: min === max };
    total++;
    if (min !== max) noisy.push(`${phase}.${metric}`);
    console.log(`${phase}.${metric}: ${min === max ? 'STABLE' : `NOISY spread=${max - min}`}  observed=[${uniq.join(', ')}]`);
  }
}
fs.writeFileSync(path.join(OUT, `spread-${SLICE}-${PROJECT}.json`), JSON.stringify(report, null, 2) + '\n');
console.log(`\nNOISY: ${noisy.length} of ${total} → ${noisy.join(', ') || '(none)'}`);
