// s1274 — CHILD-SCALING INSTRUMENT v3. Supersedes s1268's v2 for the OBSERVATION half only.
// v2 and its two recorded result files are left byte-untouched (Retention Law); this is a new file.
//
// WHAT CHANGED AND WHY (F-1269-2, confirmed at the raw capture by s1274)
// v2 scheduled its one CPU observation with a HARD-CODED `setTimeout(..., 3500)` and then printed
// the result unconditionally as "idle during 8-child arm: N%". Two facts make that label a claim
// rather than a measurement:
//   1. `top -l 2` is not instantaneous. Measured on this machine, three consecutive runs took
//      1815 / 1786 / 1780 ms, and the block v2 parses is the SECOND sample — so the reading it
//      keeps corresponds to roughly 3500 + ~1000 ms in, and the command does not return until
//      ~5290 ms in.
//   2. The arms have very different lengths. The fire arm's 8-child reps ran 10.14 / 10.50 / 9.92 s,
//      so 3500 ms landed ~36% in — a valid mid-arm reading, and indeed it captured all eight
//      children at ~54.5% CPU each. The LANE arm's reps ran 4.06 / 4.18 / 4.33 s, so the sample
//      landed at or past the end.
// The lane file records the consequence in full: `childCpuPercents: []` and `idlePercent: 77.61`,
// and its `topRaw` shows "3 running", no node process anywhere in a list SORTED BY CPU (top entry
// com.apple.Virtua at 20.7%). Eight saturated children cannot be absent from that list, so the
// children had already exited — it is a timing failure, not a filter failure. That post-work idle
// reading was then printed as "idle during 8-child arm: 77.61%" and compared against the fire arm's
// genuine in-arm 45.32%. A fixed delay cannot straddle two arms that differ ~2.4x in length.
//
// ⚠️ SCOPE, STATED PRECISELY SO THIS IS NOT OVER-READ: this defect does NOT touch the throughput
// numbers. 7.53x (lane) and 3.47x (fire) come from `runN()`'s hrtime around child exit, a separate
// and sound path, and F-1270-4's confirming test is stated in those multipliers ("~7-12x confirms
// the mechanism, ~3x refutes it"). Only the corroborating idle/child-CPU observation was invalid,
// and only on the short arm. The v2 CONCLUSION stands; one of its supporting fields did not.
//
// THE FIX: sample PROPORTIONALLY to the arm this machine actually measured, and refuse to label a
// reading the run cannot substantiate.
//   - The reps run first, so the 8-child duration is already known: schedule from the median of it.
//   - Compensate for top's own latency so the SECOND sample, not the invocation, lands mid-arm.
//   - Record when the sample happened, how long the arm was, and how many children were still
//     alive when top returned — so the label is falsifiable by the reader instead of trusted.
//   - If the arm is too short to contain a valid sample, say so; do not sample anyway.
//   - If zero children were captured, the reading is INVALID and is never labelled "during".
//
// Usage:  node logs/session-scratch/s1274/child-scaling-v3.mjs <tag> [reps]
//   <tag>  goes in the filename: logs/session-scratch/s1274/child-scaling-v3-<tag>.json
//          Use 'lane' in the lane worktree, 'fire' in a fire. NEVER overwrite another shell's file.
//   [reps] repetitions of the sweep, default 3. n=1 is never a decision (F-1265-2).
// Writes ONE new json file and edits nothing else.
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1274';
mkdirSync(OUT, { recursive: true });

const TAG = process.argv[2] || 'fire';
const REPS = Number(process.argv[3] || 3);
const STEPS = [1, 2, 3, 6, 8];
const WIDEST = 8;

// identical fixed CPU work in a fresh process: no I/O, no allocation churn. UNCHANGED from v2 —
// the throughput half is sound and a changed workload would break comparability with the v2 runs.
const WORK = "let x=0;for(let i=0;i<9e8;i++){x+=Math.sqrt(i%1000);}process.stdout.write(String(x));";

// Measured cost of `top -l 2` on this class of machine. The SECOND sample (the one parsed) is taken
// about one delay-interval in, and the process exits ~1.8 s in. Both are recorded per-run below
// rather than assumed, so a machine that disagrees is visible in the output instead of silent.
const TOP_SECOND_SAMPLE_MS = 1000;
const TOP_MIN_LEAD_MS = 300;
const SAMPLE_AT_FRACTION = 0.5;

function runN(n) {
  return new Promise((resolve) => {
    const t0 = process.hrtime.bigint();
    let done = 0;
    for (let i = 0; i < n; i++) {
      const c = spawn(process.execPath, ['-e', WORK], { stdio: 'ignore' });
      c.on('exit', () => { if (++done === n) resolve(Number(process.hrtime.bigint() - t0) / 1e9); });
    }
  });
}

function parseTop(stdout) {
  // second `Processes` block = the sample with true CPU deltas (ps %CPU is a lifetime average and
  // has misled this question before)
  const half = stdout.slice(stdout.indexOf('Processes', stdout.indexOf('Processes') + 1));
  const idle = (half.match(/CPU usage:.*?([\d.]+)% idle/) || [])[1];
  const childRows = half.split('\n').filter((l) => /\bnode\b/.test(l));
  return {
    idlePercent: idle ? Number(idle) : null,
    childCpuPercents: childRows.map((l) => l.trim().split(/\s+/).pop()).slice(0, WIDEST),
    childRowsSeen: childRows.length,
    topRaw: half.split('\n').slice(0, 20).join('\n'),
  };
}

// Observe DURING the widest arm, at a delay derived from this machine's own measured arm length.
function sampleDuringWidest(expectedArmSeconds) {
  return new Promise((resolve) => {
    const armMs = expectedArmSeconds * 1000;
    const fireAt = Math.round(armMs * SAMPLE_AT_FRACTION - TOP_SECOND_SAMPLE_MS);
    const plan = {
      expectedArmSeconds: +expectedArmSeconds.toFixed(2),
      sampleAtFraction: SAMPLE_AT_FRACTION,
      topInvokedAtMs: fireAt,
      // where the parsed sample is PREDICTED to land, as a fraction of the arm
      predictedSampleFraction: +(((fireAt + TOP_SECOND_SAMPLE_MS) / armMs)).toFixed(3),
    };

    // An arm too short to contain a valid mid-arm sample is reported, never sampled anyway. This is
    // the exact case v2 walked into on the lane arm and labelled as a reading.
    if (fireAt < TOP_MIN_LEAD_MS) {
      plan.skipped = `arm ~${expectedArmSeconds.toFixed(2)}s is too short: a top -l 2 second-sample ` +
        `cannot land before ~${((TOP_SECOND_SAMPLE_MS + TOP_MIN_LEAD_MS) / 1000).toFixed(1)}s. ` +
        `NO SAMPLE TAKEN — an unsampled arm reports nothing, not idle.`;
    }

    const t0 = process.hrtime.bigint();
    const sinceStartMs = () => Number(process.hrtime.bigint() - t0) / 1e6;
    let done = 0;
    let sample = null;
    let timer = null;

    for (let i = 0; i < WIDEST; i++) {
      const c = spawn(process.execPath, ['-e', WORK], { stdio: 'ignore' });
      c.on('exit', () => {
        done += 1;
        if (done === WIDEST) {
          if (timer) clearTimeout(timer);
          resolve({ wall: Number(process.hrtime.bigint() - t0) / 1e9, plan, sample });
        }
      });
    }

    if (plan.skipped) return;

    timer = setTimeout(() => {
      const startedAt = sinceStartMs();
      const aliveAtStart = WIDEST - done;
      const r = spawnSync('top', ['-l', '2', '-n', '12', '-o', 'cpu', '-stats', 'pid,command,cpu'], { encoding: 'utf8' });
      const returnedAt = sinceStartMs();
      const aliveAtReturn = WIDEST - done;
      const parsed = parseTop(r.stdout || '');

      // THE LABEL IS EARNED HERE OR NOT AT ALL. v2's bug was not the delay by itself; it was
      // printing "during the 8-child arm" over a reading that contained no children.
      const valid = parsed.childRowsSeen > 0 && aliveAtReturn > 0;
      sample = {
        ...parsed,
        valid,
        verdict: valid
          ? `IN-ARM: ${parsed.childRowsSeen} child row(s) observed, ${aliveAtReturn}/${WIDEST} still alive when top returned`
          : `INVALID — NOT an in-arm reading: ${parsed.childRowsSeen} child row(s) observed, ` +
            `${aliveAtReturn}/${WIDEST} alive when top returned. Do NOT read idlePercent as arm load.`,
        timing: {
          topInvokedAtMs: +startedAt.toFixed(0),
          topReturnedAtMs: +returnedAt.toFixed(0),
          topLatencyMs: +(returnedAt - startedAt).toFixed(0),
          childrenAliveAtTopInvoke: aliveAtStart,
          childrenAliveAtTopReturn: aliveAtReturn,
        },
      };
    }, fireAt);
  });
}

const out = { tag: TAG, instrument: 'v3 (s1274, F-1269-2)', node: process.version, cores: os.cpus().length, cpuModel: os.cpus()[0]?.model, reps: [] };
for (let rep = 1; rep <= REPS; rep++) {
  const row = { rep, loadavgBefore: os.loadavg().map((x) => +x.toFixed(2)), steps: {} };
  for (const n of STEPS) row.steps[n] = +(await runN(n)).toFixed(2);
  const base = row.steps[1];
  row.throughput = Object.fromEntries(STEPS.map((n) => [n, +((n * base) / row.steps[n]).toFixed(2)]));
  out.reps.push(row);
  console.log(`rep ${rep}: ` + STEPS.map((n) => `${n}ch=${row.steps[n]}s(${row.throughput[n]}x)`).join(' '));
  writeFileSync(`${OUT}/child-scaling-v3-${TAG}.json`, JSON.stringify(out, null, 2));
}

// Derive the observation delay from THIS machine's measured arm, not from a constant.
const eights = out.reps.map((r) => r.steps[WIDEST]).sort((a, b) => a - b);
const medianArm = eights[Math.floor(eights.length / 2)];
const widest = await sampleDuringWidest(medianArm);
out.widestArmObservation = widest;
writeFileSync(`${OUT}/child-scaling-v3-${TAG}.json`, JSON.stringify(out, null, 2));

const best = Math.max(...out.reps.map((r) => r.throughput[WIDEST]));
console.log(`\nBEST ${WIDEST}-child throughput: ${best}x on ${out.cores} cores   [this is F-1270-4's deciding number]`);
if (widest.plan.skipped) {
  console.log(`observation: SKIPPED — ${widest.plan.skipped}`);
} else if (widest.sample?.valid) {
  console.log(`idle DURING ${WIDEST}-child arm: ${widest.sample.idlePercent}%  child %CPU: ${JSON.stringify(widest.sample.childCpuPercents)}`);
  console.log(`  ${widest.sample.verdict}`);
} else {
  console.log(`observation: ${widest.sample?.verdict ?? 'no sample recorded'}`);
  console.log(`  (idlePercent seen: ${widest.sample?.idlePercent ?? 'n/a'}% — NOT an arm reading, do not compare it across arms)`);
}
console.log(`written: ${OUT}/child-scaling-v3-${TAG}.json`);
