// s1238 drain: re-run guard-fx-02's three mutation arms MYSELF on the merged tree.
// Subject mutated, never the test. Byte-identical restore proven per arm.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';

const MOD = 'scripts/lib/subject-tree.mjs';
const orig = readFileSync(MOD);
const hash = (buf) => execSync('git hash-object --stdin', { input: buf }).toString().trim();
const BASE = hash(orig);
console.log('module hash BEFORE:', BASE);

const ARMS = [
  {
    name: 'A. fail-open deleted (throw unconditionally)',
    from: '      if (!ignoreReadErrors) throw error;',
    to: '      throw error;',
    expect: 'ignoreReadErrors returns only readable paths',
  },
  {
    name: 'B. fail-closed deleted (swallow unconditionally)',
    from: '      if (!ignoreReadErrors) throw error;',
    to: '      if (false) throw error;',
    expect: 'default walk fails closed on an unreadable subtree',
  },
  {
    name: 'C. floor call removed',
    from: '  assertSubjectFloor(files, subject);',
    to: '  // assertSubjectFloor(files, subject);',
    expect: 'floor catches files hidden by an ignored read error',
  },
];

for (const arm of ARMS) {
  const before = orig.toString();
  const mutated = before.replace(arm.from, arm.to);
  if (mutated === before) { console.log(`${arm.name} -> MUTATION DID NOT APPLY`); continue; }
  writeFileSync(MOD, mutated);
  try {
    const r = spawnSync('node', ['--test', 'scripts/subject-tree.test.mjs'], { encoding: 'utf8', timeout: 120000 });
    const out = (r.stdout || '') + (r.stderr || '');
    // Which named cases failed, and with what text?
    const failed = [...out.matchAll(/not ok \d+ - (.+)/g)].map((x) => x[1].trim());
    const reason = (out.match(/(AssertionError.*|Error: EACCES.*|error: .*)/) || ['(no reason line)'])[0];
    console.log(`${arm.name}\n   rc=${r.status}  failed cases: ${failed.length ? failed.join(' | ') : 'NONE (arm did not redden!)'}`);
    console.log(`   reason: ${reason.slice(0, 150)}`);
    console.log(`   named case reddened as predicted: ${failed.includes(arm.expect) ? 'YES' : 'NO -> ' + arm.expect}`);
  } finally {
    writeFileSync(MOD, orig);
    const back = hash(readFileSync(MOD));
    console.log(`   restored byte-identically: ${back === BASE ? 'YES ' + back : 'NO! ' + back}`);
  }
}
console.log('final porcelain for the module:', execSync(`git status --porcelain -- ${MOD}`, { encoding: 'utf8' }).trim() || '(clean)');
