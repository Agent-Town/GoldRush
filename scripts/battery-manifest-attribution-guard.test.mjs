// F-2234-1 (measured s2234) — THE ROSTER IS THE SOLE ATTRIBUTION SOURCE, AND IT NAMED ONE BATTERY.
//
// `battery-manifest.mjs` resolves every row's `file` by matching test-name literals against the
// sources named in its roster. A real `node --test <files>` log carries ZERO file markers and
// mentions ZERO test-file paths (measured on a live 419-test `test:ledger-guards` log), so the
// log-harvest contributes nothing and the roster decides everything. Reading only
// `scripts['test:node-guards']` made the tool structurally incapable of attributing any other
// battery: 32 of `test:ledger-guards`' 40 files produced ZERO rows and 297 of 419 rows (70.9%)
// collapsed to <unknown> — while `totals` reconciled PERFECTLY against the log's own summary.
// A correct headline over an attribution that had silently narrowed.
//
// Every arm below builds a SELF-CONTAINED fixture root (its own package.json + its own test
// sources + a copy of the script), because `parse()` anchors both reads to `import.meta.url`.
// That is deliberate: it means these arms cannot rot when the live package.json changes, and it
// is the only way to exercise the roster's BATTERY SELECTION rather than this repo's contents.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./battery-manifest.mjs', import.meta.url));

// A log in the shape node's reporter actually emits: NO file markers, only test names.
// That shape is the whole reason the roster is load-bearing — see the header.
function log(names, extra = {}) {
  const rows = names.map((n) => `✔ ${n} (1ms)`);
  return `${rows.join('\n')}\nℹ tests ${names.length}\nℹ suites 0\nℹ pass ${names.length}\n`
    + `ℹ fail 0\nℹ cancelled 0\nℹ skipped ${extra.skipped ?? 0}\n`;
}

function root(t, { scripts, sources, variant }) {
  const dir = mkdtempSync(join(tmpdir(), 'bm-attribution-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  const target = join(dir, 'scripts', 'battery-manifest.mjs');
  copyFileSync(SCRIPT, target);
  if (variant) {
    const original = readFileSync(target, 'utf8');
    const edited = variant(original);
    // A variant that matched nothing is a CONSTRUCTION failure, not a passing arm
    // (s2223: an unmatched edit reds for a reason that is not evidence about the defect).
    assert.notEqual(edited, original, 'variant edit matched nothing — the arm would test the cured file');
    writeFileSync(target, edited);
  }
  if (scripts !== null) writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts }, null, 2));
  for (const [name, body] of Object.entries(sources ?? {})) {
    mkdirSync(join(dir, name, '..'), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  return { dir, target };
}

function manifest({ dir, target }, contents) {
  const logPath = join(dir, 'run.log');
  writeFileSync(logPath, contents);
  const run = spawnSync(process.execPath, [target, '--from-log', logPath], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  // Assert the arm REACHED the branch, not merely that it emitted bytes (s2232: a crash
  // produces plenty, and a pre-cure copy away from its inputs dies having never run).
  assert.ok(run.stdout.length > 0, 'manifest arm produced no stdout — it never ran');
  return JSON.parse(run.stdout);
}

const src = (names) => names.map((n) => `test('${n}', () => {});`).join('\n');

// The defining case: a test file named ONLY by a battery other than test:node-guards.
const TWO_BATTERIES = {
  scripts: {
    'test:node-guards': 'node --test scripts/known.test.mjs',
    'test:ledger-guards': 'node --test scripts/other.test.mjs',
  },
  sources: {
    'scripts/known.test.mjs': src(['a known test']),
    'scripts/other.test.mjs': src(['an other-battery test']),
  },
};
const BOTH_NAMES = ['a known test', 'an other-battery test'];

const PRE_CURE_ROSTER = (s) => s.replace(
  /roster = \[\.\.\.new Set\(Object\.values\(scripts\)\.flatMap[\s\S]*?\)\)\];/,
  "roster = [...(scripts['test:node-guards'] ?? '').matchAll(/\\b((?:scripts|src)\\/[^\\s'\"`]+\\.test\\.mjs)\\b/g)].map((match) => match[1]);",
);

test('a test file named by a NON-node-guards battery is attributed to its file', (t) => {
  const m = manifest(root(t, TWO_BATTERIES), log(BOTH_NAMES));
  const byName = Object.fromEntries(m.tests.map((e) => [e.name, e.file]));
  assert.equal(byName['an other-battery test'], 'scripts/other.test.mjs');
  assert.equal(byName['a known test'], 'scripts/known.test.mjs');
  assert.equal(m.attribution.unattributed, 0);
});

test('PRE-CURE CONTROL: the single-battery roster leaves the other battery unattributed', (t) => {
  const m = manifest(root(t, { ...TWO_BATTERIES, variant: PRE_CURE_ROSTER }), log(BOTH_NAMES));
  const byName = Object.fromEntries(m.tests.map((e) => [e.name, e.file]));
  assert.equal(byName['an other-battery test'], '<unknown>', 'pre-cure must lose the other battery');
  assert.equal(byName['a known test'], 'scripts/known.test.mjs');
  // The headline reconciles perfectly while attribution has narrowed — the F-2234-1 shape.
  assert.equal(m.totals.tests, 2);
  assert.equal(m.attribution.unattributed, 1);
});

test('unattributed rows are COUNTED, not merely marked <unknown> row by row', (t) => {
  const fixture = root(t, {
    scripts: { 'test:node-guards': 'node --test scripts/known.test.mjs' },
    sources: { 'scripts/known.test.mjs': src(['a known test']) },
  });
  const m = manifest(fixture, log(['a known test', 'a nameless one', 'another nameless one']));
  assert.equal(m.attribution.unattributed, 2);
  assert.equal(m.totals.tests, 3, 'the tally must still reconcile — that is what hid this');
});

test('the declaration is present on the HAPPY path, not only when something is wrong', (t) => {
  const m = manifest(root(t, TWO_BATTERIES), log(BOTH_NAMES));
  assert.equal(m.attribution.unattributed, 0);
  assert.equal(m.attribution.source, 'package-scripts');
  assert.ok(Number.isInteger(m.attribution.rosterFiles) && m.attribution.rosterFiles > 0);
});

test('an unreadable package.json DECLARES log-only rather than pretending to a roster', (t) => {
  const fixture = root(t, { scripts: null, sources: {} });
  const m = manifest(fixture, log(['a nameless one']));
  assert.equal(m.attribution.source, 'log-only');
  assert.equal(m.attribution.unattributed, 1);
});

test('--diff flags a DEGRADED comparison when either side has unattributed rows', (t) => {
  const fixture = root(t, {
    scripts: { 'test:node-guards': 'node --test scripts/known.test.mjs' },
    sources: { 'scripts/known.test.mjs': src(['a known test']) },
  });
  const a = join(fixture.dir, 'a.json');
  const b = join(fixture.dir, 'b.json');
  writeFileSync(a, JSON.stringify(manifest(fixture, log(['a known test']))));
  writeFileSync(b, JSON.stringify(manifest(fixture, log(['a known test', 'a nameless one']))));
  const run = spawnSync(process.execPath, [fixture.target, '--diff', a, b], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /ATTRIBUTION: DEGRADED \(after 1 unattributed\)/);
});

test('REVERSE CONTROL: a fully attributed diff carries NO attribution line', (t) => {
  const fixture = root(t, TWO_BATTERIES);
  const a = join(fixture.dir, 'a.json');
  const b = join(fixture.dir, 'b.json');
  writeFileSync(a, JSON.stringify(manifest(fixture, log(['a known test']))));
  writeFileSync(b, JSON.stringify(manifest(fixture, log(BOTH_NAMES))));
  const run = spawnSync(process.execPath, [fixture.target, '--diff', a, b], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.doesNotMatch(run.stdout, /ATTRIBUTION/, 'an unconditional banner is noise that decays into a formality');
  assert.match(run.stdout, /RESIDUE: accounted for/);
});

test('REVERSE CONTROL: widening the roster does not re-point a name shared by two files', (t) => {
  // The live neutrality risk, measured s2234: exactly ONE test name is shared between a
  // test:node-guards file and a newly-visible test:ledger-guards file. Occurrence order must
  // still hand the FIRST sighting to the alphabetically-first file, exactly as before.
  const fixture = root(t, {
    scripts: {
      'test:node-guards': 'node --test scripts/aaa.test.mjs',
      'test:ledger-guards': 'node --test scripts/bbb.test.mjs',
    },
    sources: {
      'scripts/aaa.test.mjs': src(['a shared name']),
      'scripts/bbb.test.mjs': src(['a shared name']),
    },
  });
  const m = manifest(fixture, log(['a shared name']));
  assert.equal(m.tests[0].file, 'scripts/aaa.test.mjs');
  assert.equal(m.attribution.unattributed, 0);
});
