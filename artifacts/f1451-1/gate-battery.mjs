#!/usr/bin/env node
// s1452 drain gate for f1451-1 — the E1 perf census must stop publishing over retained evidence.
//
// WHY THIS SCRIPT EXISTS: a GREEN on the cured arm is NOT evidence that the defect is cured.
// The spec passed before this slice too — it always passed; what it did wrong was WHERE it
// wrote. So the load-bearing measurement is DIRT, not pass/fail, and the two arms must differ
// in exactly ONE variable (E1_PERF_STAGE) through one code path so nothing can drift between
// them (the s1448/s1450/s1451 matched-battery practice).
//
// Arm "cured"   — no env override at all. Runs exactly as the shared battery runs it.
//                 EXPECTED: rc=0 AND zero tracked files dirtied under artifacts/e1-perf-pass.
// Arm "control" — E1_PERF_STAGE=after, i.e. the pre-cure default, one variable changed.
//                 EXPECTED: rc=0 AND a NON-ZERO dirt count. This reproduces F-1451-1 and is
//                 what proves the dirt probe can see the defect at all. Run it LAST: it
//                 deliberately overwrites the retained tree INSIDE the throwaway detached gate
//                 worktree (main is never touched, and this worktree is deleted afterwards).
//
// Usage: node artifacts/f1451-1/gate-battery.mjs <cured|control>   (cwd = the gate worktree)
import { spawnSync } from 'node:child_process';

const arm = process.argv[2];
if (!['cured', 'control'].includes(arm)) {
  console.error('usage: gate-battery.mjs <cured|control>');
  process.exit(2);
}

const env = {
  ...process.env,
  GR_CAPTURE_EXTERNAL_SERVER: '1',
  GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5243',
};
// THE ONE VARIABLE. The cured arm sets nothing, so it exercises the merged default.
if (arm === 'control') env.E1_PERF_STAGE = 'after';

const dirt = () =>
  spawnSync('git', ['status', '--porcelain', '--', 'artifacts/e1-perf-pass'], { encoding: 'utf8' })
    .stdout.split('\n')
    .filter(Boolean);

const before = dirt();
const started = Date.now();
const r = spawnSync(
  'npx',
  [
    'playwright', 'test', 'e2e/e1-perf-pass.spec.ts',
    '--project=desktop-chrome', '--project=mobile-chrome',
    '--workers=1', '--reporter=list',
  ],
  { env, encoding: 'utf8', stdio: 'inherit' },
);
const after = dirt();

console.log(`\nARM=${arm} RC=${r.status} WALL_S=${((Date.now() - started) / 1000).toFixed(1)}`);
console.log(`DIRT_BEFORE=${before.length} DIRT_AFTER=${after.length}`);
for (const line of after.slice(0, 30)) console.log(`  ${line}`);
process.exit(0); // never mask the transcript behind a nonzero exit; read RC above
