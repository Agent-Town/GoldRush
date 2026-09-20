// s1263 measurement driver: runs the newsie-window probe under a named load arm.
// usage: node logs/session-scratch/s1263/run-probe.mjs <label> <workers> <repeatEach>
import { spawnSync } from 'node:child_process';

const [label = 'unlabelled', workers = '1', repeatEach = '3'] = process.argv.slice(2);
const result = spawnSync(
  'npx',
  [
    'playwright', 'test', 'e2e/s1263-newsie-window.spec.ts',
    '--project=desktop-chrome',
    `--workers=${workers}`,
    `--repeat-each=${repeatEach}`,
    '--reporter=line',
  ],
  { env: { ...process.env, GR_PROBE_LABEL: label }, encoding: 'utf8', stdio: 'inherit' },
);
console.log(`\n[run-probe] label=${label} workers=${workers} repeatEach=${repeatEach} rc=${result.status}`);
process.exit(result.status ?? 1);
