// s1241 drain probe for ts-cov-02 — re-derive the mutation table on main's tree.
// Every arm: mutate transiently, read the guard's red by MESSAGE TEXT (never rc),
// discriminate against the pre-existing whole-project tsc step at :24-28, restore
// byte-identically and prove it with git hash-object.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

const TARGET = 'functions/api/stats.ts';
const GUARD = 'scripts/worker-type-coverage.test.mjs';
const ORIGINAL = readFileSync(TARGET);

const hash = (p) => execFileSync('git', ['hash-object', p], { encoding: 'utf8' }).trim();

function runGuard() {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', GUARD], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  // Which assertion fired? Identify by the message text each branch owns.
  let branch = 'NONE';
  if (out.includes('worker files disabling semantic checks')) branch = ':22 suppression-filter (THE NEW CHECK)';
  else if (out.includes('worker files missing from tsc --listFiles')) branch = ':32 listFiles-membership';
  else if (out.includes('error TS')) branch = ':28 whole-project tsc (PRE-EXISTING)';
  else if (out.includes('expected >=')) branch = 'subject-tree floor';
  else if (out.includes('is missing — this guard')) branch = 'subject-tree existence';
  return { rc: r.status, out, branch };
}

function runProjectTsc() {
  const r = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return { rc: r.status, out: ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(0, 3).join(' | ') };
}

// Pull the named files out of the :22 message so we can assert it names file AND directive.
function named(out) {
  const lines = out.split('\n').filter((l) => /\(\.d\.ts\)|\(@ts-/.test(l));
  return lines.map((l) => l.replace(/^[#\s+]*/, '').trim());
}

const ARMS = [
  { id: '0 control', kind: 'none' },
  {
    id: 'A real error + @ts-ignore',
    kind: 'append',
    text: '\n// @ts-ignore\nexport const __s1241Probe: number = \'not a number\';\n',
  },
  {
    id: 'B real error + USED @ts-expect-error',
    kind: 'append',
    text: '\n// @ts-expect-error deliberate: transient s1241 mutation arm\nexport const __s1241Probe: number = \'not a number\';\n',
  },
  { id: 'C @ts-nocheck control (filter extended, not replaced)', kind: 'prepend', text: '// @ts-nocheck\n' },
  {
    id: 'E NEGATIVE CONTROL: bare unused @ts-expect-error, NO real error',
    kind: 'append',
    text: '\n// @ts-expect-error nothing is wrong on the next line\nexport const __s1241Clean: number = 1;\n',
  },
];

const rows = [];
for (const arm of ARMS) {
  if (arm.kind === 'append') writeFileSync(TARGET, ORIGINAL.toString() + arm.text);
  else if (arm.kind === 'prepend') writeFileSync(TARGET, arm.text + ORIGINAL.toString());
  const g = runGuard();
  const t = runProjectTsc();
  writeFileSync(TARGET, ORIGINAL);
  const h = hash(TARGET);
  rows.push({ arm: arm.id, guardRc: g.rc, branch: g.branch, names: named(g.out).join(' ; '), tscRc: t.rc, tscFirst: t.out, restored: h });
  console.log('---', arm.id);
  console.log('  guard rc=' + g.rc + '  branch=' + g.branch);
  console.log('  named: ' + (named(g.out).join(' ; ') || '(none)'));
  console.log('  project tsc rc=' + t.rc + (t.rc ? '  first: ' + t.out : ' (GREEN — so a guard red cannot come from :28)'));
  console.log('  restored blob=' + h);
}

// ARM D — the branch this diff RESTRUCTURED (filter predicate -> unshift) and the
// runner declared unprovable. A transient .d.ts is the same technique, not a
// structural change: the walker matches ext '.ts', and '.d.ts' ends with '.ts'.
const DTS = 'functions/api/__s1241probe.d.ts';
writeFileSync(DTS, 'export type S1241Probe = string;\n');
const gD = runGuard();
const tD = runProjectTsc();
rmSync(DTS);
console.log('--- D transient functions/api/__s1241probe.d.ts (no directives)');
console.log('  guard rc=' + gD.rc + '  branch=' + gD.branch);
console.log('  named: ' + (named(gD.out).join(' ; ') || '(none)'));
console.log('  project tsc rc=' + tD.rc + (tD.rc ? '  first: ' + tD.out : ' (GREEN)'));
console.log('  probe file removed: ' + !existsSync(DTS));
rows.push({ arm: 'D transient .d.ts', guardRc: gD.rc, branch: gD.branch, names: named(gD.out).join(' ; '), tscRc: tD.rc, tscFirst: tD.out, restored: hash(TARGET) });

console.log('\n=== FINAL: target restored? ===');
console.log('blob ' + hash(TARGET) + '  (must equal the control row)');
console.log('git status for functions/: ' + (execFileSync('git', ['status', '--short', 'functions'], { encoding: 'utf8' }).trim() || '(clean)'));
writeFileSync('logs/session-scratch/s1241-arms.json', JSON.stringify(rows, null, 2));
