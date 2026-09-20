#!/usr/bin/env node
// s1205 — scope-6 check: the collection guards must still pass from a NON-ROOT cwd.
// That root-invariance is the whole point of the predecessor slice (fbefb903); this
// slice rewrote the capture inside both guards, so it is exactly the property most at
// risk of silent regression. Run from scripts/ AND from a tmp dir outside the repo.
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname.replace(/%20/g, ' ');
const guards = ['whole-suite-collection.test.mjs', 'town-spec-collection.test.mjs'];
const cwds = [
  ['scripts/', path.join(root, 'scripts')],
  ['tmpdir (outside repo)', mkdtempSync(path.join(os.tmpdir(), 'gr-rootinv-'))],
];

let bad = 0;
for (const [label, cwd] of cwds) {
  for (const g of guards) {
    const file = label.startsWith('scripts') ? g : path.join(root, 'scripts', g);
    const r = spawnSync('node', ['--test', file], { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const all = `${r.stdout || ''}${r.stderr || ''}`;
    const pass = (all.match(/^ℹ pass (\d+)$/m) || [])[1];
    const fail = (all.match(/^ℹ fail (\d+)$/m) || [])[1];
    if (r.status !== 0) bad++;
    console.log(`[${label}] ${g} → rc=${r.status} pass=${pass} fail=${fail}`);
    if (r.status !== 0) console.log(`      ${(all.match(/AssertionError.*$/m) || [''])[0].slice(0, 160)}`);
  }
}
// run-guards wrapper (the caller the battery is invoked through in CI)
const rg = spawnSync('node', ['scripts/run-guards.mjs', '--only', 'test:node-guards'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
console.log(`[run-guards --only test:node-guards] rc=${rg.status} ${(`${rg.stdout}${rg.stderr}`.match(/(PASS|FAIL).*$/m) || [''])[0].slice(0, 120)}`);
if (rg.status !== 0) bad++;
console.log(bad ? `ROOT-INVARIANCE: ${bad} FAILURE(S)` : 'ROOT-INVARIANCE: ALL GREEN');
process.exit(bad ? 1 : 0);
