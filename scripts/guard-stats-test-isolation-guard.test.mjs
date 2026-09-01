// F-2418-1 — a test that spawns `run-guards.mjs` must redirect its stats path.
//
// WHY THIS EXISTS. `run-guards.mjs` anchors its stats file to the SCRIPT TREE, not to cwd
// (`run-guards.mjs:45-46`, the F-2220-1 anchoring lesson applied correctly). That is right for
// the gate and wrong for a TEST: a test that spawns the real script from a stub fixture still
// appends to the live `logs/guard-stats.jsonl` -- the per-leg prior F-2312-1 (7)(b) built to be
// READ as a cheap prior for gate reds.
//
// Measured s2418: `run-guards.test.mjs` had ZERO `GR_GUARD_STATS_PATH` mentions, and one run of
// it appended 58 fixture rows -- stub legs, `seconds: 0`, `rc: 0` -- into that corpus. All 465
// rows on disk were fixture output; not one was a real gate run. The prior therefore reported
// `test:node-guards` as 56 runs / 0 red / 100% GREEN on a day its first leg (`engine-era-guard`)
// was RED on main. The rows carry real HEAD shas, which is what makes them look authentic.
//
// WHY A GUARD RATHER THAN A COMMENT. The defect is a one-line omission, it is silent (the tests
// pass 12/12 either way, and the persistence write is inside a try that cannot change a guard
// exit), and it is re-introducible by anyone adding a spawn site. The sibling
// `guard-stats-persistence.test.mjs` has always redirected -- the practice existed and this file
// simply never adopted it, which is this factory's most-repeated shape. A red here can never fire
// on lawful work: there is no legitimate reason for a TEST to write into the production prior,
// so this cannot be excused into uselessness (F-1460-1).
//
// The subject set is DERIVED, never transcribed, so a new spawner is covered the day it lands.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.basename(fileURLToPath(import.meta.url));

// A subject is a test file that resolves the REAL sibling run-guards.mjs for execution.
// Excludes itself: this guard quotes the script's name to explain the rule and must not become
// its own subject (the "a pgrep liveness probe inside the command it probes" tautology).
//
// ⚠️ THE SELECTOR MUST BE KEYED ON PROVENANCE, NOT ON ONE SPELLING (F-2422-1, s2422).
//
// The ORIGINAL selector was the single idiom `new URL('./run-guards.mjs', import.meta.url)`,
// chosen for a MEASURED reason that is still correct and is preserved below: keying on "mentions
// run-guards.mjs anywhere AND spawns anything" reddened on `gate-caller-audit.test.mjs`, a FALSE
// POSITIVE -- that file spawns `gate-caller-audit.mjs` and merely WRITES a synthetic stub named
// `scripts/run-guards.mjs` into its own fixture repos.
//
// But that reason argues only against looseness in the FIXTURE-CONTENT direction. It says nothing
// about OTHER GENUINE SPAWN SPELLINGS -- and the header above promises "a new spawner is covered
// the day it lands", which one idiom cannot keep. Measured s2422 against a RELOCATED copy of this
// guard over a fixture corpus: three ordinary idioms that resolve the real sibling and do NOT
// redirect GR_GUARD_STATS_PATH all passed 4/4 at rc=0, byte-comparable to a clean board --
//   `path.join(HERE, 'run-guards.mjs')` · `path.resolve(DIR, 'run-guards.mjs')`
//   · `new URL('./' + NAME, import.meta.url)` with NAME bound to the filename
// while the one covered idiom correctly redded. LIVE OFFENDERS WERE ZERO, so nothing was ever
// certified wrongly; what was wrong is that the guard's own coverage promise outran its pattern.
//
// THE DISCRIMINATOR IS PROVENANCE, exactly as in F-2421-1: the path must be bound to THIS FILE'S
// OWN directory (import.meta.url / import.meta.dirname), never to a fixture root that a test
// happens to have built. `path.join(<mkdtemp dir>, 'scripts', 'run-guards.mjs')` is a stub being
// written; `path.join(<self dir>, 'run-guards.mjs')` is the real script being resolved. Both
// reverse controls below pin that boundary, so the exclusion stays honest rather than accidental.
//
// 📐 DECLARED BOUNDARY, not a completeness claim: this covers `new URL(..., import.meta.url)` and
// a join/resolve anchored to a self-dir binding. A path assembled some third way still evades it.

// Identifiers bound to THIS FILE'S OWN directory -- the provenance half of the question.
function selfDirBindings(source) {
  const bound = new Set(['import.meta.dirname']);
  const decl = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g;
  for (const m of source.matchAll(decl)) {
    const [, name, rhs] = m;
    if (/import\.meta\.dirname/.test(rhs)) bound.add(name);
    // path.dirname(fileURLToPath(import.meta.url)) and friends
    else if (/dirname\s*\(/.test(rhs) && /import\.meta\.url/.test(rhs)) bound.add(name);
    // fileURLToPath(new URL('.', import.meta.url))
    else if (/new URL\(\s*['"]\.\/?['"]\s*,\s*import\.meta\.url\s*\)/.test(rhs)) bound.add(name);
  }
  return bound;
}

// Identifiers bound to the literal filename, so `new URL('./' + NAME, ...)` is still a resolution.
function nameBindings(source) {
  const bound = new Set();
  const decl = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*['"]\.?\/?run-guards\.mjs['"]/g;
  for (const m of source.matchAll(decl)) bound.add(m[1]);
  return bound;
}

// EXPORTED so the arms below can exercise the DECISION on string fixtures rather than by copying
// the shared scripts/ dir -- F-2284-1's race hazard is avoided by never building a corpus at all.
export function resolvesRealScript(source) {
  const names = nameBindings(source);
  const nameAlt = ['run-guards\\.mjs', ...[...names].map((n) => `\\b${n}\\b`)].join('|');

  // (a) any `new URL(<...run-guards.mjs or a name var...>, import.meta.url)`
  const viaUrl = new RegExp(`new URL\\(\\s*[^,)]*(?:${nameAlt})[^,)]*,\\s*import\\.meta\\.url\\s*\\)`);
  if (viaUrl.test(source)) return true;

  // (b) a join/resolve whose FIRST argument is a self-dir binding and which names the script
  const selves = selfDirBindings(source);
  const joins = /path\.(?:join|resolve)\(\s*([^,)]+)\s*,([^)]*)\)/g;
  for (const m of source.matchAll(joins)) {
    const head = m[1].trim();
    const rest = m[2];
    if (!selves.has(head)) continue;
    if (new RegExp(nameAlt).test(rest)) return true;
  }
  return false;
}

function subjects() {
  return fs
    .readdirSync(SCRIPTS)
    .filter((f) => f.endsWith('.test.mjs') && f !== SELF)
    .map((f) => ({ file: f, source: fs.readFileSync(path.join(SCRIPTS, f), 'utf8') }))
    .filter(({ source }) => resolvesRealScript(source));
}

test('every test that spawns run-guards.mjs redirects GR_GUARD_STATS_PATH', () => {
  const found = subjects();

  // F-2217-1: a `for` loop over nothing registers no assertions and reports success. An empty
  // subject set means the derivation broke, not that the repo is clean -- refuse instead.
  assert.ok(
    found.length > 0,
    'REFUSING: derived zero subjects. Either no test spawns run-guards.mjs any more (then delete ' +
      'this guard deliberately) or the derivation is broken -- an empty set must not pass as clean.',
  );

  const offenders = found.filter(({ source }) => !source.includes('GR_GUARD_STATS_PATH'));
  assert.deepEqual(
    offenders.map((o) => o.file),
    [],
    `these tests spawn run-guards.mjs without redirecting its stats path, so they append fixture ` +
      `rows into the live logs/guard-stats.jsonl (F-2418-1): ${offenders.map((o) => o.file).join(', ')}`,
  );
});

test('the production prior is never a literal target in a test file', () => {
  const found = subjects();
  assert.ok(found.length > 0, 'REFUSING: derived zero subjects');

  // A redirect that points AT the live file is the defect wearing the cure's clothes.
  const pointingAtLive = found.filter(({ source }) =>
    /GR_GUARD_STATS_PATH[^\n]*logs\/guard-stats\.jsonl/.test(source),
  );
  assert.deepEqual(
    pointingAtLive.map((o) => o.file),
    [],
    'a test redirected GR_GUARD_STATS_PATH back at the production corpus',
  );
});

test('the selector does not over-reach onto fixture content (reverse control)', () => {
  // gate-caller-audit.test.mjs names `scripts/run-guards.mjs` repeatedly -- it BUILDS one as a
  // fixture -- but never spawns the real script, so it must not be a subject. This arm exists
  // because a looser selector really did flag it (see RESOLVES_REAL_SCRIPT above); without it,
  // the exclusion would be an accident nobody is defending.
  const names = subjects().map((s) => s.file);
  const decoy = 'gate-caller-audit.test.mjs';
  assert.ok(
    fs.existsSync(path.join(SCRIPTS, decoy)),
    'the decoy this control is built from no longer exists; re-derive the control',
  );
  assert.ok(
    fs.readFileSync(path.join(SCRIPTS, decoy), 'utf8').includes('run-guards.mjs'),
    'the decoy no longer mentions run-guards.mjs, so this control proves nothing -- re-derive it',
  );
  assert.ok(!names.includes(decoy), `selector over-reached onto fixture content: ${decoy}`);
});

// ---------------------------------------------------------------------------------------------
// F-2422-1 teeth. These exercise the DECISION on string fixtures, so they need no filesystem and
// cannot race the shared scripts/ dir (F-2284-1). Each of the three sources below was MEASURED
// s2422 to pass the pre-cure guard 4/4 at rc=0 while carrying the exact F-2418-1 defect.

const UNCOVERED_IDIOMS = {
  'path.join(HERE, name)':
    "const HERE = path.dirname(fileURLToPath(import.meta.url));\n" +
    "const SUBJECT = path.join(HERE, 'run-guards.mjs');\n",
  'path.resolve(DIR, name)':
    "const DIR = path.dirname(fileURLToPath(import.meta.url));\n" +
    "spawnSync(process.execPath, [path.resolve(DIR, 'run-guards.mjs')]);\n",
  'new URL with a bound name':
    "const NAME = 'run-guards.mjs';\n" +
    "const SUBJECT = fileURLToPath(new URL('./' + NAME, import.meta.url));\n",
  'import.meta.dirname':
    "const SUBJECT = path.join(import.meta.dirname, 'run-guards.mjs');\n",
};

test('the selector covers the PROPERTY its header names, not one spelling of it', () => {
  for (const [label, source] of Object.entries(UNCOVERED_IDIOMS)) {
    assert.ok(
      resolvesRealScript(source),
      `a test resolving the real sibling via ${label} is not selected, so it could append fixture ` +
        `rows into the live prior and stay green (F-2422-1)`,
    );
  }
});

test('the originally covered idiom still matches (regression control)', () => {
  assert.ok(
    resolvesRealScript("const S = fileURLToPath(new URL('./run-guards.mjs', import.meta.url));\n"),
    'the widening lost the one idiom the pre-cure selector caught',
  );
});

test('provenance is load-bearing: a fixture-rooted path is NOT a subject (reverse control)', () => {
  // This is the FALSE POSITIVE the original narrow selector was built to avoid, and it must stay
  // excluded after the widening -- otherwise the cure reds on every test that builds a stub repo,
  // and gets excused into uselessness inside a week (F-1460-1).
  const fixtureRooted =
    "const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'x-'));\n" +
    "fs.writeFileSync(path.join(dir, 'scripts', 'run-guards.mjs'), 'console.log(1);');\n";
  assert.ok(
    !resolvesRealScript(fixtureRooted),
    'the selector over-reached onto a stub written into a fixture root',
  );

  // A self-dir binding may coexist with fixture work in the same file; only the join that names
  // the script decides. This pins that the two questions stay carried together.
  const mixed =
    "const HERE = path.dirname(fileURLToPath(import.meta.url));\n" +
    "const helper = path.join(HERE, 'helper.mjs');\n" +
    "fs.writeFileSync(path.join(tmp, 'scripts', 'run-guards.mjs'), 'stub');\n";
  assert.ok(!resolvesRealScript(mixed), 'a self-dir binding elsewhere in the file leaked onto a stub path');
});

test('a prose mention of the script is NOT a subject (reverse control)', () => {
  // script-tree-parse.test.mjs and site-contract.test.mjs both discuss `run-guards.mjs` in their
  // headers and spawn nothing. Measured s2422: both are correctly excluded.
  assert.ok(
    !resolvesRealScript(" * `node scripts/run-guards.mjs` rc=0, 8/8 PASS. The break was invisible.\n"),
    'a comment naming the script was selected as a spawner',
  );
});

test('the anchoring behaviour this guard depends on is still real', () => {
  // If run-guards ever stopped anchoring to the script tree, this guard would be asserting a
  // rule with no hazard behind it -- decoration. Pin the mechanism, not just the symptom.
  const runner = fs.readFileSync(path.join(SCRIPTS, 'run-guards.mjs'), 'utf8');
  assert.match(
    runner,
    /GR_GUARD_STATS_PATH/,
    'run-guards.mjs no longer honours GR_GUARD_STATS_PATH; this guard and its subjects need re-deriving',
  );
  assert.match(
    runner,
    /repoRoot\s*=\s*path\.dirname\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\)\)/,
    'run-guards.mjs no longer anchors its root to the script tree; re-measure F-2418-1 before trusting this guard',
  );
});
