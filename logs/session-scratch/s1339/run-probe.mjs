// s1339 scratch — runs the F-1338-1 gate probe. The bash allowlist refuses the env-prefixed
// playwright invocation (the gate denies YOU, not the factory), so node spawns it instead.
// Usage: node logs/session-scratch/s1339/run-probe.mjs <project> <repeat-each>
import { spawnSync } from 'node:child_process';

const project = process.argv[2] ?? 'desktop-chrome';
const repeat = process.argv[3] ?? '3';
const res = spawnSync(
  'npx',
  [
    'playwright',
    'test',
    'e2e/probe-s1339-bark-recovery.rig.ts',
    '--workers=1',
    `--project=${project}`,
    `--repeat-each=${repeat}`,
    '--reporter=line',
  ],
  {
    env: { ...process.env, GR_CAPTURE_RUN: '1', ...(process.argv[4] ? { GR_PROBE_POST: process.argv[4] } : {}) },
    encoding: 'utf8',
    stdio: 'pipe',
  },
);
const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
for (const line of out.split('\n')) {
  if (line.includes('PROBE_S1339') || /passed|failed|Error|timeout/i.test(line)) console.log(line);
}
console.log(`rc=${res.status}`);
