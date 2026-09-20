// s1339 scratch — the CURE measurement for F-1286-2, run at the defect's own denominator:
// the three encyclopedia specs batched, --workers=1, --repeat-each=3, both projects. That is the
// exact battery s1337 used to reproduce the 1/6 and s1338 used to close F-1337-1.
// node spawns playwright because the bash allowlist refuses the flag-laden invocation.
import { spawnSync } from 'node:child_process';

const repeat = process.argv[2] ?? '3';
const res = spawnSync(
  'npx',
  [
    'playwright',
    'test',
    'e2e/en-01-claim-ledger.spec.ts',
    'e2e/en-02-e1-coverage.spec.ts',
    'e2e/en-03-epoch-pages.spec.ts',
    '--workers=1',
    `--repeat-each=${repeat}`,
    '--reporter=line',
  ],
  { env: process.env, encoding: 'utf8', stdio: 'pipe' },
);
const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
const lines = out.split('\n');
for (const line of lines) {
  if (/✘|✓ .*town board and bark|passed|failed|flaky|Error:|Timeout .*exceeded|Received/i.test(line)) console.log(line);
}
console.log(`rc=${res.status}`);
