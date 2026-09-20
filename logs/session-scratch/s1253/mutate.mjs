/**
 * mutate.mjs — s1253. Prove each arm of gate-caller-audit.test.mjs actually BITES,
 * by breaking the SUBJECT one defect at a time (never the guard — that only
 * proves the guard can be edited). House practice per s1251/s1252.
 *
 * Subject is restored byte-identical at the end and the sha256 is printed both
 * before and after, because "I put it back" is a claim.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SUBJECT = 'scripts/gate-caller-audit.mjs';
const TESTFILE = 'scripts/gate-caller-audit.test.mjs';
const OUT = 'logs/session-scratch/s1253/mutation-transcript.txt';
const BACKUP = 'logs/session-scratch/s1253/gate-caller-audit.mjs.bak';

const original = readFileSync(SUBJECT, 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
writeFileSync(BACKUP, original);
writeFileSync(OUT, 's1253 mutation transcript\nsubject sha256(16) BEFORE: ' + sha(original) + '\n\n');
function log(s) { console.log(s); appendFileSync(OUT, s + '\n'); }

// Each mutation names the defect it reintroduces and the arm(s) that must catch it.
const MUTATIONS = [
  {
    id: 'M1',
    what: 'drop the *.config.ts root seeding — the vocabulary gap that fooled my own first draft',
    expect: 'the config.ts webServer arm',
    apply: (s) => s.replace(
      /^for \(const cfg of configFiles\) \{[\s\S]*?^\}$/m,
      '/* M1: config edges removed */',
    ),
  },
  {
    id: 'M2',
    what: 'stop stripping comments — a guard NAMED in prose reads as called (the s1252 defect exactly)',
    expect: 'the "prose is not a caller" arm',
    // Surgical: leave block-comment stripping in place and disable ONLY the
    // line-comment arm. A blunter mutation (return the raw text) reds all 15 arms
    // and therefore isolates nothing.
    apply: (s) => s.replace(".replace(/^\\s*\\/\\/.*$/gm, ' ')", ''),
  },
  {
    id: 'M3',
    what: 'read a missing baseline as {} — F-1252-1: a ratchet without its baseline is not a ratchet',
    expect: 'the missing-baseline refusal arm',
    apply: (s) => s.replace(
      /if \(!fs\.existsSync\(BASELINE\)\) \{\n\s*console\.error\('gate-caller-audit: REFUSING — no baseline[\s\S]*?process\.exit\(2\);\n\}/,
      'if (!fs.existsSync(BASELINE)) { /* M3 */ }',
    ),
  },
  {
    id: 'M4',
    what: 'remove the anchor self-check — the resolver may report orphans without proving it resolved anything',
    expect: 'the anchor refusal arm',
    apply: (s) => s.replace('if (brokenAnchors.length && !REPORT) {', 'if (false) {'),
  },
  {
    id: 'M5',
    what: 'ratchet on EVERY npm script, not just gate-shaped ones — trains fires to ignore the guard',
    expect: 'the "dev/preview/census are not gates" arm',
    apply: (s) => s.replace('const GATE_NAME = /^(test|verify|build):|^test$/;', 'const GATE_NAME = /./;'),
  },
  {
    id: 'M6',
    what: 'green over a package.json with no scripts block — the vacuous pass, F-1251-2 class',
    expect: 'the no-scripts-block refusal arm',
    apply: (s) => s.replace('if (Object.keys(scripts).length === 0) {', 'if (false) {'),
  },
];

function runArms() {
  const r = spawnSync(process.execPath, ['--test', TESTFILE], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 300_000,
  });
  const all = (r.stdout || '') + (r.stderr || '');
  const pass = Number((all.match(/^ℹ pass (\d+)$/m) || [])[1] ?? -1);
  const fail = Number((all.match(/^ℹ fail (\d+)$/m) || [])[1] ?? -1);
  const names = [...all.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
  return { rc: r.status, pass, fail, names };
}

log('=== BASELINE (unmutated subject) ===');
const base = runArms();
log('rc=' + base.rc + '  pass=' + base.pass + '  fail=' + base.fail);
if (base.fail !== 0) { log('ABORT: arms are not green before mutating'); process.exit(1); }

for (const m of MUTATIONS) {
  const mutated = m.apply(original);
  if (mutated === original) { log('\n' + m.id + ' — MUTATION DID NOT APPLY (pattern missed) — INVALID ARM'); continue; }
  writeFileSync(SUBJECT, mutated);
  const r = runArms();
  log('\n' + m.id + ' — ' + m.what);
  log('   expected to be caught by: ' + m.expect);
  log('   measured: rc=' + r.rc + '  pass=' + r.pass + '  fail=' + r.fail);
  for (const n of r.names) log('     RED: ' + n);
}

writeFileSync(SUBJECT, original);
const after = readFileSync(SUBJECT, 'utf8');
log('\n=== RESTORE ===');
log('sha256(16) AFTER : ' + sha(after) + '   identical=' + (after === original));
const final = runArms();
log('post-restore arms: rc=' + final.rc + ' pass=' + final.pass + ' fail=' + final.fail);
