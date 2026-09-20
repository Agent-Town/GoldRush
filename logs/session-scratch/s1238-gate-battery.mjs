import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const run = (label, cmd, args) => {
  const t0 = process.hrtime.bigint();
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 600000 });
  const s = Number(process.hrtime.bigint() - t0) / 1e9;
  const out = (r.stdout || '') + (r.stderr || '');
  console.log(`${r.status === 0 ? 'PASS' : 'FAIL'}  rc=${r.status}  ${s.toFixed(1)}s  ${label}`);
  return { rc: r.status, out };
};

const fixtures = () => readdirSync(tmpdir()).filter((n) => /^(gold-rush-|gr-)/.test(n));
console.log('tmpdir fixture dirs BEFORE:', fixtures().length);

run('npx tsc --noEmit', 'npx', ['tsc', '--noEmit']);
run('npm run build', 'npm', ['run', 'build']);

const st = run('subject-tree.test.mjs', 'node', ['--test', 'scripts/subject-tree.test.mjs']);
const m = st.out.match(/^# (pass|fail|tests) \d+$/gm);
console.log('   case tally:', (m || []).join(' · '));
if (/SKIP|# skipped [1-9]/.test(st.out)) console.log('   ⚠️ A SKIP WAS REPORTED — read it:', st.out.match(/.*skip.*/gi)?.slice(0, 4));

run('script-tree-parse.test.mjs (adjacent)', 'node', ['--test', 'scripts/script-tree-parse.test.mjs']);
run('worker-type-coverage.test.mjs (adjacent)', 'node', ['--test', 'scripts/worker-type-coverage.test.mjs']);
run('run-guards.test.mjs (adjacent)', 'node', ['--test', 'scripts/run-guards.test.mjs']);
run('npm run test:node-guards', 'npm', ['run', 'test:node-guards']);

const g = run('node scripts/run-guards.mjs', 'node', ['scripts/run-guards.mjs']);
console.log('   ', (g.out.match(/guards: \d+\/\d+ passed.*/) || ['(no tally line)'])[0]);

// scope-4 duty: two consecutive runs must leave no fixture debris
run('subject-tree.test.mjs (2nd consecutive run)', 'node', ['--test', 'scripts/subject-tree.test.mjs']);
console.log('tmpdir fixture dirs AFTER:', fixtures().length, fixtures().slice(0, 5));
