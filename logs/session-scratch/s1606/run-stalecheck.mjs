// s1606 — rf-34 stale-check runner. Pre-flight step 3 of tasks/lane-hero-y-restore-roundtrip.md,
// run against the 5199 scratch dev server so live lane-b keeps 5188 (Mistake #12).
// --workers=1 is mandatory for every fire-side playwright command (F-1270-1, fire.md §3.1).
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const r = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5199',
  },
});
console.log(`\n[stale-check] rc=${r.status}`);
process.exit(r.status ?? 1);
