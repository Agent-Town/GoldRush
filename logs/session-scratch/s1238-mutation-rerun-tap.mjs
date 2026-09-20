// s1238 drain, attempt 2: the first re-run used a `not ok` regex against node --test's
// SPEC reporter, which never emits it -- a false "no case reddened" of my own making.
// Force the TAP reporter so each red is identified by its case NAME, per the master's bar.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';

const MOD = 'scripts/lib/subject-tree.mjs';
const orig = readFileSync(MOD);
const hash = (b) => execSync('git hash-object --stdin', { input: b }).toString().trim();
const BASE = hash(orig);

const ARMS = [
  { name: 'A. fail-open deleted (throw unconditionally)', from: '      if (!ignoreReadErrors) throw error;', to: '      throw error;', expect: 'ignoreReadErrors returns only readable paths' },
  { name: 'B. fail-closed deleted (swallow unconditionally)', from: '      if (!ignoreReadErrors) throw error;', to: '      if (false) throw error;', expect: 'default walk fails closed on an unreadable subtree' },
  { name: 'C. floor call removed', from: '  assertSubjectFloor(files, subject);', to: '  // assertSubjectFloor(files, subject);', expect: 'floor catches files hidden by an ignored read error' },
];

// Control: the clean tree must be GREEN, or every arm below is meaningless.
const ctl = spawnSync('node', ['--test', '--test-reporter=tap', 'scripts/subject-tree.test.mjs'], { encoding: 'utf8' });
const ctlOut = (ctl.stdout || '') + (ctl.stderr || '');
console.log(`CONTROL (unmutated): rc=${ctl.status}  passing=${(ctlOut.match(/^ok \d+/gm) || []).length}  failing=${(ctlOut.match(/^not ok \d+/gm) || []).length}`);
console.log(`   cases: ${[...ctlOut.matchAll(/^ok \d+ - (.+)$/gm)].map((m) => m[1].trim()).join(' · ')}`);

for (const arm of ARMS) {
  const mutated = orig.toString().replace(arm.from, arm.to);
  if (mutated === orig.toString()) { console.log(`${arm.name} -> MUTATION DID NOT APPLY`); continue; }
  writeFileSync(MOD, mutated);
  try {
    const r = spawnSync('node', ['--test', '--test-reporter=tap', 'scripts/subject-tree.test.mjs'], { encoding: 'utf8', timeout: 120000 });
    const out = (r.stdout || '') + (r.stderr || '');
    const failed = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
    const greens = [...out.matchAll(/^ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
    console.log(`${arm.name}\n   rc=${r.status}  RED cases (${failed.length}): ${failed.join(' | ') || 'NONE'}`);
    console.log(`   still green (${greens.length}): ${greens.length}`);
    console.log(`   predicted case "${arm.expect}" reddened: ${failed.includes(arm.expect) ? 'YES' : 'NO'}`);
    const only = failed.length === 1 && failed[0] === arm.expect;
    console.log(`   SPECIFIC (that case and no other): ${only ? 'YES' : 'no — ' + failed.length + ' red'}`);
  } finally {
    writeFileSync(MOD, orig);
    console.log(`   restored: ${hash(readFileSync(MOD)) === BASE ? 'byte-identical ' + BASE : 'MISMATCH'}`);
  }
}
console.log('porcelain:', execSync(`git status --porcelain -- ${MOD}`, { encoding: 'utf8' }).trim() || '(clean)');
