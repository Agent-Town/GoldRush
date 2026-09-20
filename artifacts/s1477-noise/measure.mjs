// F-1476-1 — measure the run-to-run reproducibility of the retained renderer counts.
// Design: SUBJECT FIXED (one commit, one worktree, no edits between runs), INSTRUMENT PINNED
// (same playwright config, same --workers=1 fire-shell serialisation). The only thing varying
// between samples is the run itself, so any spread IS the noise band.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1477';
const OUT = '/Users/robin/Claude/Projects/Gold Rush/artifacts/s1477-noise';
const N = Number(process.argv[2] ?? 12);
const PROJECT = process.argv[3] ?? 'desktop-chrome';
const COUNTS = path.join(WT, 'artifacts/wire-crawler-3d', `renderer-counts-${PROJECT}.json`);

fs.mkdirSync(OUT, { recursive: true });
const samples = [];

for (let i = 1; i <= N; i++) {
  if (fs.existsSync(COUNTS)) fs.rmSync(COUNTS);
  const started = Date.now();
  let rc = 0;
  try {
    execFileSync('npx', ['playwright', 'test', 'e2e/wire-crawler-3d.spec.ts',
      `--project=${PROJECT}`, '--workers=1', '--reporter=line'],
      { cwd: WT, stdio: 'pipe', encoding: 'utf8' });
  } catch { rc = 1; }
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (!fs.existsSync(COUNTS)) { console.log(`run ${i}: rc=${rc} NO ARTIFACT (${secs}s)`); continue; }
  const counts = JSON.parse(fs.readFileSync(COUNTS, 'utf8'));
  samples.push({ run: i, rc, secs, counts });
  const c = counts.coldBaseline;
  console.log(`run ${i}: rc=${rc} ${secs}s  coldBaseline calls=${c.calls} tri=${c.triangles} geo=${c.geometries} tex=${c.textures}`);
}

fs.writeFileSync(path.join(OUT, `samples-${PROJECT}.json`), JSON.stringify(samples, null, 2) + '\n');

// Per-phase, per-metric spread across the samples.
const phases = Object.keys(samples[0].counts);
const report = {};
console.log('\n=== SPREAD ACROSS ' + samples.length + ' RUNS (same commit) ===');
for (const phase of phases) {
  report[phase] = {};
  for (const metric of Object.keys(samples[0].counts[phase])) {
    const vals = samples.map((s) => s.counts[phase][metric]);
    const min = Math.min(...vals), max = Math.max(...vals);
    const uniq = [...new Set(vals)].sort((a, b) => a - b);
    report[phase][metric] = { min, max, spread: max - min, distinct: uniq.length, values: uniq, stable: min === max };
    const flag = min === max ? 'STABLE' : `NOISY  spread=${max - min}`;
    console.log(`${phase}.${metric}: ${flag}  observed=[${uniq.join(', ')}]`);
  }
}
fs.writeFileSync(path.join(OUT, `spread-${PROJECT}.json`), JSON.stringify(report, null, 2) + '\n');

const noisy = [];
for (const p of phases) for (const m of Object.keys(report[p])) if (!report[p][m].stable) noisy.push(`${p}.${m}`);
console.log(`\nNOISY METRICS: ${noisy.length} of ${phases.length * Object.keys(samples[0].counts.coldBaseline).length} → ${noisy.join(', ') || '(none)'}`);
