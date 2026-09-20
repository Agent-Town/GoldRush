import { spawnSync } from 'node:child_process';
const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const r = spawnSync(process.execPath, [
  `${REPO}/scripts/suite-red-inventory.mjs`,
  `${REPO}/logs/session-scratch/s1197-f1167-4-fixture.json`,
  '/tmp/s1197-crash.md',
], { cwd: '/tmp', encoding: 'utf8' });
const lines = (r.stderr ?? '').split('\n');
console.log(`exit=${r.status}`);
console.log(lines.filter((l) => /Error|ENOENT|path:|suite-red-inventory|at /.test(l)).slice(0, 12).join('\n'));
