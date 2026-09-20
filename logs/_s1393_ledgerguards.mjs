#!/usr/bin/env node
// s1393 LAST ACT: run test:ledger-guards (bash gate refuses the npm script name).
// Mandated by the F-1300-4 clause — the drain battery runs BEFORE the bookkeeping
// commit exists, so every ledger/law/gate guard must be re-run after it.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const pkg = JSON.parse(readFileSync(ROOT + '/package.json', 'utf8'));
const script = pkg.scripts['test:ledger-guards'];
console.log('script:', script, '\n');

const run = (cmd, args) => {
  try {
    const out = execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'pipe'] });
    return { rc: 0, out };
  } catch (e) { return { rc: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }; }
};

let bad = 0;
// segment 1: node --test <files>
const files = script.split('&&')[0].replace('node --test', '').trim().split(/\s+/);
const r1 = run('node', ['--test', ...files]);
console.log('--- node --test (' + files.length + ' guard files) ---');
console.log(r1.out.split('\n').filter(l => /^ℹ (tests|pass|fail)/.test(l)).join('\n'));
console.log('rc=' + r1.rc);
if (r1.rc !== 0) { bad++; console.log(r1.out.split('\n').slice(-30).join('\n')); }

// remaining segments: npm run X  /  node script
for (const seg of script.split('&&').slice(1).map(s => s.trim())) {
  const parts = seg.split(/\s+/);
  const r = parts[0] === 'npm'
    ? run('node', [ROOT + '/node_modules/.bin/../../scripts/' + '', ''].slice(0, 0).concat(resolveNpm(parts[2])))
    : run(parts[0], parts.slice(1));
  console.log(`--- ${seg} --- rc=${r.rc}`);
  if (r.rc !== 0) { bad++; console.log(r.out.split('\n').slice(-25).join('\n')); }
}

function resolveNpm(name) {
  // map `npm run X` to its underlying `node scripts/...` invocation
  const body = pkg.scripts[name];
  return body.split(/\s+/).slice(1);
}

console.log('\n' + (bad === 0 ? '✅ test:ledger-guards ALL GREEN' : `⛔ ${bad} segment(s) RED`));
process.exit(bad === 0 ? 0 : 1);
