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

// A subject is a test file that resolves the REAL sibling run-guards.mjs for execution --
// the `new URL('./run-guards.mjs', import.meta.url)` idiom both live spawners use. Excludes
// itself: this guard quotes the script's name to explain the rule and must not become its own
// subject (the "a pgrep liveness probe inside the command it probes" tautology).
//
// ⚠️ THE SELECTOR IS DELIBERATELY THIS NARROW, AND IT WAS MEASURED, NOT GUESSED. My first draft
// keyed on "mentions run-guards.mjs anywhere AND spawns anything", and it reddened on
// `gate-caller-audit.test.mjs` -- a FALSE POSITIVE. That file spawns `gate-caller-audit.mjs` and
// merely WRITES a synthetic stub named `scripts/run-guards.mjs` into its own fixture repos. A
// name appearing in fixture CONTENT is not a spawn of the real thing; keying on the resolution
// idiom separates them. The over-reach control below pins that, so the exclusion stays honest.
const RESOLVES_REAL_SCRIPT = /new URL\(\s*['"]\.\/run-guards\.mjs['"]\s*,\s*import\.meta\.url\s*\)/;

function subjects() {
  return fs
    .readdirSync(SCRIPTS)
    .filter((f) => f.endsWith('.test.mjs') && f !== SELF)
    .map((f) => ({ file: f, source: fs.readFileSync(path.join(SCRIPTS, f), 'utf8') }))
    .filter(({ source }) => RESOLVES_REAL_SCRIPT.test(source));
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
