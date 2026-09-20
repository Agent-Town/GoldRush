#!/usr/bin/env node
// s1451 drain gate for f1440-2 — the E1 perf gate re-landed without a frozen baseline.
//
// WHY THIS SCRIPT EXISTS: the arms below must differ in exactly ONE variable
// (E1_PERF_COMPARE_BASELINE), so both are launched through one code path where a flag
// cannot drift between them (the s1448/s1450 matched-battery practice).
//
// Arm A "default"  — no opt-in flag. Must be GREEN. This is the merged tree's contribution
//                    to the shared battery, and it must be machine-independent.
// Arm B "optin"    — opt-in flag ON, against the committed M4-Max baseline, run in the FIRE
//                    SHELL. This is the arm s1440 measured RED (F-1440-2: dry-gulch draw
//                    calls 137 vs <=136; the-claim mobile p95 28.5 vs <=25.05). It is run
//                    here NOT as a pass/fail gate but to demonstrate the defect still exists
//                    behind the flag and is therefore genuinely opt-in.
//
// Usage: node artifacts/f1440-2/gate-battery.mjs <default|optin>
import { spawnSync } from 'node:child_process';

const arm = process.argv[2];
if (!['default', 'optin'].includes(arm)) {
  console.error('usage: gate-battery.mjs <default|optin>');
  process.exit(2);
}

const env = {
  ...process.env,
  GR_CAPTURE_EXTERNAL_SERVER: '1',
  GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5241',
  // The opt-in arm must point at the RETAINED baseline tree, because reproducing F-1440-2
  // requires the real committed M4-Max numbers. STAGE='gate' only ADDS census-gate-*.json and
  // a gate/ dir there; it never overwrites before/ or after/ (RETENTION LAW, and the master's
  // NO list). This runs in a throwaway gate worktree, so main is untouched either way.
  E1_PERF_ARTIFACT_DIR: arm === 'optin' ? 'artifacts/e1-perf-pass' : `artifacts/f1440-2/gate-s1451-${arm}`,
  E1_PERF_STAGE: 'gate',
};
if (arm === 'optin') env.E1_PERF_COMPARE_BASELINE = '1';

const started = Date.now();
const r = spawnSync('npx', [
  'playwright', 'test', 'e2e/e1-perf-pass.spec.ts',
  '--project=desktop-chrome', '--project=mobile-chrome',
  '--workers=1', '--reporter=list',
], { env, encoding: 'utf8', stdio: 'inherit' });

console.log(`\nARM=${arm} RC=${r.status} WALL_S=${((Date.now() - started) / 1000).toFixed(1)}`);
process.exit(0); // never mask the transcript behind a nonzero exit; read RC above
