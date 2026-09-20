// s1263 analysis: turn the probe trajectories into the numbers the corrective needs.
// For each run: the cross-CDP window the shipped assertion uses, and — for every candidate
// frame-count N — the displacement an in-page fixed-frame-count window would have measured.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('logs/session-scratch/s1263');
const CANDIDATES = [4, 8, 12, 16, 24, 32, 48];
const files = readdirSync(DIR).filter((f) => f.startsWith('probe-') && f.endsWith('.json')).sort();

const hyp = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const rows = [];

for (const file of files) {
  const run = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'));
  const samples = run.trajectory.samples;
  const firstFalse = samples.findIndex((s) => !s.follows);
  const anchor = samples[firstFalse];
  const window = {};
  let peakStep = 0;
  for (const n of CANDIDATES) {
    const slice = samples.slice(firstFalse, firstFalse + n + 1);
    window[`n${n}`] = Number(Math.max(...slice.map((s) => hyp(s, anchor))).toFixed(4));
  }
  // per-frame step size across the whole post-false tail: the teleport/snap invariant
  const tail = samples.slice(firstFalse);
  for (let i = 1; i < tail.length; i += 1) peakStep = Math.max(peakStep, hyp(tail[i], tail[i - 1]));
  const settled = tail.findIndex((s, i) => i > 0 && hyp(s, tail[i - 1]) < 1e-6);

  rows.push({
    arm: file.includes('-loaded-') ? 'loaded' : 'quiet',
    file,
    crossCdpDisplacement: Number(run.crossCdp.displacement.toFixed(4)),
    msTotalWindow: run.crossCdp.msTotalWindow,
    msClick: run.crossCdp.msClickRoundTrip,
    msPoll: run.crossCdp.msPollToFalse,
    msAfterSample: run.crossCdp.msPollDoneToAfterSample,
    framesSampled: samples.length,
    firstFalseIndex: firstFalse,
    peakPerFrameStep: Number(peakStep.toFixed(4)),
    framesUntilSettled: settled,
    totalWalkHome: Number(Math.max(...tail.map((s) => hyp(s, anchor))).toFixed(4)),
    medianFrameMs: Number(
      (() => {
        const deltas = tail.slice(1).map((s, i) => s.t - tail[i].t).sort((a, b) => a - b);
        return deltas[Math.floor(deltas.length / 2)] ?? 0;
      })().toFixed(2),
    ),
    ...window,
  });
}

console.log('=== PER RUN ===');
console.table(rows.map(({ file, ...rest }) => rest));

console.log('\n=== SHIPPED ASSERTION (cross-CDP, bound <1) ===');
for (const arm of ['quiet', 'loaded']) {
  const set = rows.filter((r) => r.arm === arm);
  const d = set.map((r) => r.crossCdpDisplacement);
  const w = set.map((r) => r.msTotalWindow);
  console.log(
    `${arm.padEnd(7)} n=${set.length} displacement ${Math.min(...d).toFixed(3)}..${Math.max(...d).toFixed(3)}` +
    `  window ${Math.min(...w)}..${Math.max(...w)} ms  breaches(>=1): ${d.filter((v) => v >= 1).length}`,
  );
}

console.log('\n=== CANDIDATE FIXED-FRAME WINDOWS (peak displacement from the follow-false anchor) ===');
for (const n of CANDIDATES) {
  const key = `n${n}`;
  const q = rows.filter((r) => r.arm === 'quiet').map((r) => r[key]);
  const l = rows.filter((r) => r.arm === 'loaded').map((r) => r[key]);
  console.log(
    `n=${String(n).padStart(2)}  quiet ${Math.min(...q).toFixed(3)}..${Math.max(...q).toFixed(3)}` +
    `   loaded ${Math.min(...l).toFixed(3)}..${Math.max(...l).toFixed(3)}` +
    `   overall max ${Math.max(...q, ...l).toFixed(3)}`,
  );
}

console.log('\n=== PER-FRAME STEP (the load-invariant teleport guard) ===');
for (const arm of ['quiet', 'loaded']) {
  const s = rows.filter((r) => r.arm === arm).map((r) => r.peakPerFrameStep);
  console.log(`${arm.padEnd(7)} peak per-frame step ${Math.min(...s).toFixed(4)}..${Math.max(...s).toFixed(4)}`);
}
console.log('\ntheoretical per-frame cap = presentationDelta(0.05s) * 7 u/s = 0.35');
