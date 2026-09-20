/**
 * s1449 gate runner. Runs playwright against a SCRATCH dev server so nothing this fire
 * measures can be contaminated by, or contaminate, the live lane-c run on 5188
 * (Mistake #12 — gate contamination). Serial by law: --workers=1 is a correctness
 * requirement of the fire shell, not an optimisation (F-1270-1, scripts/fire.md §3.1).
 *
 *   node artifacts/drill-yard-props/run-gate.mjs <spec...> [-- extra playwright args]
 */
import { spawnSync } from 'node:child_process';

const BASE = process.env.GATE_BASE_URL ?? 'http://127.0.0.1:5237';
const args = process.argv.slice(2);

const res = spawnSync(
  'npx',
  ['playwright', 'test', ...args, '--workers=1', '--reporter=list'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      GR_CAPTURE_EXTERNAL_SERVER: '1',
      GR_CAPTURE_BASE_URL: BASE,
    },
  },
);
process.exit(res.status ?? 1);
