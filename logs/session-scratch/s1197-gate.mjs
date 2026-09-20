// s1197 drain gate: capture EXIT CODES, not printed counters (F-1125-1 law).
import { spawnSync } from 'node:child_process';
const REPO = '/Users/robin/Claude/Projects/Gold Rush';
function run(label, cmd, argv) {
  const r = spawnSync(cmd, argv, { cwd: REPO, encoding: 'utf8', timeout: 600_000 });
  const tail = (r.stdout ?? '').trim().split('\n').slice(-3).join(' | ');
  console.log(`${label}: EXIT=${r.status}  ${tail.slice(0, 200)}`);
  return r.status;
}
run('node-guards(files)', process.execPath, ['--test',
  ...['e3-mask-tables','entry-damage-table','glob-fallback-completeness','goal-tracker','probe-base',
      'rehearsal-base','run-guards','stream-curate','stream-director','stream-showcase-queue',
      'suite-red-inventory','town-era-props-node-safety','town-spec-collection','whole-suite-collection']
    .map((n) => `scripts/${n}.test.mjs`)]);
run('ticker-stats', process.execPath, ['scripts/test-ticker-stats.mjs']);
run('new-spec-1', process.execPath, ['--test', 'scripts/suite-red-inventory.test.mjs']);
run('new-spec-2', process.execPath, ['--test', 'scripts/suite-red-inventory.test.mjs']);
