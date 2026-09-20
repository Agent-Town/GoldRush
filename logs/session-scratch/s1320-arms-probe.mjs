// s1320 F-1319-3 discriminator probe (untracked scratch; see reviews/ + BACKLOG row).
// Separates construction-time cost (placeFree loop) from per-tick cost using the
// sim's OWN advanceCpuMs instrument, exported as `gr-sim speed: N waves/s` on stderr.
import { spawnSync } from 'node:child_process';

const label = process.argv[2] ?? 'arm';
const runs = Number(process.argv[3] ?? 3);
for (let i = 0; i < runs; i += 1) {
  const t0 = performance.now();
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-night-shift', '--seed', 'e1-night-shift-01', '--policy=idle'],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000, maxBuffer: 1 << 28 },
  );
  const wallMs = performance.now() - t0;
  if (run.status !== 0) {
    console.log(`${label} run${i + 1}: STATUS=${run.status} stderr=${(run.stderr || '').slice(0, 400)}`);
    continue;
  }
  const speed = /gr-sim speed: ([0-9.]+) waves\/s/.exec(run.stderr || '');
  const lines = run.stdout.trim().split('\n');
  const outcome = JSON.parse(lines.at(-1));
  const wavesPerSec = speed ? Number(speed[1]) : NaN;
  const advanceCpuMs = wavesPerSec > 0 ? (outcome.waves / wavesPerSec) * 1000 : NaN;
  const firstView = JSON.parse(lines[0]);
  const lanterns = firstView.now?.works?.byKind?.lantern_post ?? 0;
  console.log(JSON.stringify({
    label,
    run: i + 1,
    wallMs: Math.round(wallMs),
    advanceCpuMs: Math.round(advanceCpuMs),
    nonTickMs: Math.round(wallMs - advanceCpuMs),
    wavesPerSec,
    turns: lines.length - 1,
    lanterns,
    waves: outcome.waves,
    timeMs: outcome.timeMs,
    eventLogHash: outcome.eventLogHash,
  }));
}
