import { spawnSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const pkg = JSON.parse((await import('node:fs')).readFileSync(`${ROOT}/package.json`, 'utf8'));

const jobs = [
  ['node', ['--test',
    'scripts/goal-tracker.test.mjs', 'scripts/goal-closure-reason.test.mjs',
    'scripts/ruling-propagation-guard.test.mjs', 'scripts/law-pointer-guard.test.mjs',
    'scripts/gate-caller-audit.test.mjs', 'scripts/block-class-guard.test.mjs',
    'scripts/banked-master-preflight-guard.test.mjs', 'scripts/stale-hold-verdict-guard.test.mjs',
    'scripts/claimed-spec-harness-guard.test.mjs', 'scripts/stale-ready-for-gates-guard.test.mjs']],
];
for (const name of ['test:findings-state', 'test:blocker-panel', 'test:ruling-propagation',
  'test:citations', 'test:desk-declaration']) {
  const cmd = pkg.scripts[name];
  const parts = cmd.split(/\s+/);
  jobs.push([parts[0], parts.slice(1), name]);
}
jobs.push(['node', ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet']]);
jobs.push(['node', ['scripts/attended-owed-audit.mjs']]);
jobs.push(['bash', ['scripts/main-lock-gate-guard.test.sh']]);
jobs.push(['bash', ['scripts/janitor-request-rejection.test.sh']]);
jobs.push(['node', ['scripts/nul-audit.mjs']]);

let bad = 0;
for (const [bin, args, label] of jobs) {
  const r = spawnSync(bin, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const tag = label ?? `${bin} ${args[0]}`;
  const tail = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-6).join('\n');
  if (r.status !== 0) { bad++; console.log(`\n### RED rc=${r.status} :: ${tag}\n${tail}`); }
  else console.log(`ok rc=0 :: ${tag}`);
}
console.log(bad === 0 ? '\nLEDGER-GUARDS ALL GREEN' : `\nLEDGER-GUARDS RED in ${bad} job(s)`);
