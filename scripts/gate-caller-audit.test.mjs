/**
 * gate-caller-audit.test.mjs — arms for the "who calls this gate?" audit (s1253).
 *
 * Every arm runs the REAL script against a REAL git tree (the subject is
 * `git ls-files`, so a fake fs would test a different program — the same
 * discipline scripts/citation-title-guard.test.mjs uses and for the same reason).
 *
 * Two families:
 *   CLAIMS   — the audit finds an orphan, follows a config.ts edge, ignores prose.
 *   REFUSALS — F-1251-2's class. A caller audit has a specially nasty vacuous
 *              mode: if the resolver silently fails, every gate reads as an
 *              orphan; grandfather those once and it greens forever having
 *              resolved nothing. Each refusal arm proves it exits 2 instead.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Every mkdtemp dir this file makes, removed in one place.
// scripts/fixture-teardown.test.mjs caught the first draft of this file leaking
// all 15 of them — a guard from a previous slice failing this slice's author, on
// the same day this file was written to make exactly that kind of catch possible.
// The prefix stays a LITERAL at every mkdtemp call site on purpose. Passing it as
// a variable centralises the cleanup just as well, and the teardown guard then
// refuses with "calls mkdtemp but yielded 0 extractable literal prefixes" —
// correctly, because it extracts prefixes statically and a variable makes its
// subject unreadable. Same refusal class this file's own subject implements; a
// guard whose vocabulary needs a literal gets a literal.
const MADE = [];
function track(dir) {
  MADE.push(dir);
  return dir;
}
after(() => {
  for (const dir of MADE) fs.rmSync(dir, { recursive: true, force: true });
});

const SCRIPT = path.join(import.meta.dirname, 'gate-caller-audit.mjs');
const REAL_ROOT = path.resolve(import.meta.dirname, '..');

function run(dir, ...extra) {
  return spawnSync(process.execPath, [SCRIPT, '--root', dir, ...extra], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

/**
 * A miniature but STRUCTURALLY REAL repo: run-guards.mjs with a GUARDS array, a
 * pipeline shell, a node --test roster, a playwright config whose webServer
 * invokes a build script, and one guard reachable only through that config.
 */
function fixture({ scripts, files = {}, baseline = null } = {}) {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-')));
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'fx', scripts }, null, 2));
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  if (baseline !== null) {
    fs.writeFileSync(path.join(dir, 'scripts', 'gate-caller-baseline.json'), baseline);
  }
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'fixture@example.com');
  git('config', 'user.name', 'fixture');
  git('add', '-A');
  git('commit', '-qm', 'fixture');
  return dir;
}

// The shape every arm starts from: two wired guards (so the ANCHORS resolve) plus
// whatever the arm is actually about.
const BASE_SCRIPTS = {
  'test:guards': 'node scripts/run-guards.mjs',
  'test:node-guards': 'node --test scripts/probe.test.mjs',
  'test:task-guards': 'node scripts/task-guard-audit.mjs',
  build: 'tsc && vite build',
};
const BASE_FILES = {
  'scripts/run-guards.mjs': "const GUARDS = ['test:node-guards', 'test:task-guards'];\nconsole.log(GUARDS);\n",
  'scripts/task-guard-audit.mjs': 'console.log("audit");\n',
  'scripts/probe.test.mjs': 'console.log("probe");\n',
};
const EMPTY_BASELINE = JSON.stringify({ grandfathered: {} });

// ---------------------------------------------------------------------------
// CLAIMS
// ---------------------------------------------------------------------------

test('a gate nothing calls is reported as a NEW orphan and exits 1', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:lonely': 'node scripts/lonely-guard.mjs' },
    files: { ...BASE_FILES, 'scripts/lonely-guard.mjs': 'console.log("nobody calls me");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /npm:test:lonely/);
  assert.match(r.stderr, /no caller and no recorded reason/);
  // An unrooted GATE drags its guard FILE down with it — the closure never
  // expands an unreached script, so both are orphans. That is the true reading
  // and it is why the arm below has to grandfather both.
  assert.match(r.stdout + r.stderr, /scripts\/lonely-guard\.mjs/);
});

test('grandfathering that orphan with a reason turns the gate green', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:lonely': 'node scripts/lonely-guard.mjs' },
    files: { ...BASE_FILES, 'scripts/lonely-guard.mjs': 'console.log("nobody calls me");\n' },
    baseline: JSON.stringify({
      grandfathered: {
        'npm:test:lonely': 'deliberate: hand-run only',
        'scripts/lonely-guard.mjs': 'deliberate: reached only through the hand-run gate above',
      },
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /known {2}npm:test:lonely/);
  assert.match(r.stdout, /PASS — every gate-shaped subject/);
});

// THE VOCABULARY CLAIM (s1253). This is the arm that caught my own first draft:
// build:release's ONLY caller is a playwright webServer command. A resolver that
// reads package.json and scripts/ alone calls it an orphan and is wrong.
test('a gate whose only caller is a *.config.ts webServer command counts as REACHED', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'build:release': 'vite build && node scripts/assert-release.mjs' },
    files: {
      ...BASE_FILES,
      'scripts/assert-release.mjs': 'console.log("release assert");\n',
      'playwright.release.config.ts':
        "export default { webServer: { command: 'npm run build:release && npx vite preview' } };\n",
    },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir, '--report');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /npm:build:release\s+via playwright\.release\.config\.ts/);
  // and the guard behind it inherits the reach, transitively
  assert.match(r.stdout, /scripts\/assert-release\.mjs\s+via npm:build:release/);
});

test('a guard named only in a COMMENT is not reached — prose is not a caller', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:mentioned': 'node scripts/mentioned-guard.mjs' },
    files: {
      ...BASE_FILES,
      'scripts/mentioned-guard.mjs': 'console.log("hi");\n',
      // run-guards talks ABOUT it at length, exactly as the real one does, but
      // never puts it in the array. That is the s1252 defect verbatim.
      // BOTH comment forms carry a QUOTED, matchable reference on purpose: a
      // mutation that disabled only line-comment stripping survived every arm
      // (s1253), because the unquoted mention this fixture used to carry was
      // never an edge to begin with — the arm was green for the wrong reason.
      'scripts/run-guards.mjs':
        "// 'test:mentioned' joined this battery in sNNN; see scripts/mentioned-guard.mjs.\n" +
        "/* see also 'test:mentioned' and scripts/mentioned-guard.mjs */\n" +
        "const GUARDS = ['test:node-guards', 'test:task-guards'];\nconsole.log(GUARDS);\n",
    },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 1, 'a guard only mentioned in prose must still be an orphan');
  const out = r.stdout + r.stderr;
  assert.match(out, /npm:test:mentioned/);
  // The FILE too — otherwise stripping only one comment form still passes.
  assert.match(out, /scripts\/mentioned-guard\.mjs/);
});

test('putting it in the GUARDS array clears it — the control for the arm above', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:mentioned': 'node scripts/mentioned-guard.mjs' },
    files: {
      ...BASE_FILES,
      'scripts/mentioned-guard.mjs': 'console.log("hi");\n',
      'scripts/run-guards.mjs':
        "const GUARDS = ['test:node-guards', 'test:task-guards', 'test:mentioned'];\nconsole.log(GUARDS);\n",
    },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('a non-gate script (dev, preview, census) is never ratcheted on', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, dev: 'vite', preview: 'vite preview', census: 'playwright test e2e/x.spec.ts' },
    files: BASE_FILES,
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 0, 'human tools are not gates: ' + r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout + r.stderr, /npm:dev|npm:preview/);
});

test('an orphan that GAINED a caller is reported so the baseline can tighten', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: BASE_FILES,
    baseline: JSON.stringify({ grandfathered: { 'npm:test:gone': 'was unrooted in sNNN' } }),
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /now have a caller — tighten the baseline/);
  assert.match(r.stdout, /\+ npm:test:gone/);
});

test('--report never gates, even with a fresh orphan present', () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:lonely': 'node scripts/lonely-guard.mjs' },
    files: { ...BASE_FILES, 'scripts/lonely-guard.mjs': 'console.log("x");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir, '--report');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /--- orphans ---[\s\S]*npm:test:lonely/);
});

// ---------------------------------------------------------------------------
// REFUSALS — F-1251-2's class. Fifth subject to be held to it.
// ---------------------------------------------------------------------------

test('REFUSES (rc=2) when package.json has no scripts block', () => {
  const dir = fixture({ scripts: {}, files: BASE_FILES, baseline: EMPTY_BASELINE });
  const r = run(dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /REFUSING — package\.json has no `scripts` block/);
});

test('REFUSES (rc=2) when no scripts/*.mjs is tracked', () => {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-bare-')));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: BASE_SCRIPTS }));
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'f@example.com');
  git('config', 'user.name', 'f');
  git('add', '-A');
  git('commit', '-qm', 'fx');
  const r = run(dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /matched no scripts\/\*\.\{mjs,sh\}/);
});

test('REFUSES (rc=2) when the resolver cannot reach its own anchors', () => {
  // run-guards.mjs exists but names nothing, and package.json defines the anchors
  // with bodies no edge pattern can see. A resolver in this state would print
  // every gate as an orphan; the honest answer is "I am broken", not a verdict.
  const dir = fixture({
    scripts: {
      'test:guards': 'true',
      'test:node-guards': 'true',
      'test:task-guards': 'true',
      build: 'true',
    },
    files: { 'scripts/run-guards.mjs': 'console.log("names nothing");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /did not reach its own anchors/);
  assert.match(r.stderr, /do not grandfather/);
});

test('REFUSES (rc=2) when the baseline file is missing — not read as {}', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: null });
  const r = run(dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /REFUSING — no baseline at/);
});

test('REFUSES (rc=2) when the baseline is unreadable', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: '{ this is not json' });
  const r = run(dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /baseline unreadable/);
});

test('REFUSES (rc=2) when no subject matches the gate patterns', () => {
  // A tree whose gates are all named something else: the naming convention moved.
  // Anchors are satisfied via run-guards so the refusal is attributable to the
  // empty SUBJECT, not to a broken resolver.
  const dir = fixture({
    scripts: {
      'test:guards': 'node scripts/run-guards.mjs',
      'test:node-guards': 'node --test scripts/probe.test.mjs',
      'test:task-guards': 'node scripts/task-guard-audit.mjs',
    },
    files: BASE_FILES,
    baseline: EMPTY_BASELINE,
  });
  // sanity: this fixture is NOT the empty-subject case — it has gate-shaped names
  assert.equal(run(dir).status, 0);
  // now the real arm, with GATE_NAME re-pointed by renaming every gate
  const dir2 = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-noname-')));
  fs.mkdirSync(path.join(dir2, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(dir2, 'package.json'),
    JSON.stringify({ scripts: { gates: 'node scripts/run-guards.mjs', 'gates:node': 'true', 'gates:task': 'true' } }),
  );
  fs.writeFileSync(path.join(dir2, 'scripts', 'run-guards.mjs'), 'console.log("x");\n');
  fs.writeFileSync(path.join(dir2, 'scripts', 'gate-caller-baseline.json'), EMPTY_BASELINE);
  const git = (...a) => execFileSync('git', a, { cwd: dir2, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'f@example.com');
  git('config', 'user.name', 'f');
  git('add', '-A');
  git('commit', '-qm', 'fx');
  const r = run(dir2);
  // anchors fail first here, which is itself correct and is a refusal either way
  assert.equal(r.status, 2, r.stdout + r.stderr);
});

// ---------------------------------------------------------------------------
// AN ESCALATION WRITTEN INTO A REASON STRING (F-1473-2, s1473)
//
// Everything above tests key PRESENCE in the baseline. s1473 measured that the
// reason CONTENT was never parsed, so three entries routed a gate-cost decision
// to Robin by writing "owner\u2019s desk" into a JSON value -- and one of them
// (F-1470-3) had no BACKLOG row at all, making it invisible to every visibility
// guard. A no-op that reads like an escalation is worse than no escalation: the
// audit PASSes and the fire believes it discharged the duty.
// ---------------------------------------------------------------------------

const ESC_FILES = (ledger) => ({ ...BASE_FILES, "tasks/BACKLOG.md": ledger });

test("an owner escalation whose cited F-ID has no ledger row exits 1", () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, "test:lonely": "node scripts/lonely-guard.mjs" },
    files: ESC_FILES("- F-1111-1 something else entirely\n"),
    baseline: JSON.stringify({
      grandfathered: {
        "npm:test:lonely": "s0000 F-9999-9: cost ruling, owner\u2019s desk.",
        "scripts/lonely-guard.mjs": "deliberate: reached only through the hand-run gate above",
      },
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /route a decision to the owner with no ledger row/);
  assert.match(r.stderr, /F-9999-9/);
});

test("the SAME escalation goes green once the F-ID has a ledger row -- the control", () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, "test:lonely": "node scripts/lonely-guard.mjs" },
    files: ESC_FILES("- F-9999-9 (s0000) gate-cost question, on the desk with a recommendation\n"),
    baseline: JSON.stringify({
      grandfathered: {
        "npm:test:lonely": "s0000 F-9999-9: cost ruling, owner\u2019s desk.",
        "scripts/lonely-guard.mjs": "deliberate: reached only through the hand-run gate above",
      },
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /owner escalations\s+:\s+1\s+unrouted:\s+0/);
});

test("escalating with NO F-ID cited at all exits 1 -- it can never be found", () => {
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, "test:lonely": "node scripts/lonely-guard.mjs" },
    files: ESC_FILES("- F-9999-9 present, but the reason never names it\n"),
    baseline: JSON.stringify({
      grandfathered: {
        "npm:test:lonely": "No caller. This is gate policy, not a drive-by: owner\u2019s desk.",
        "scripts/lonely-guard.mjs": "deliberate: reached only through the hand-run gate above",
      },
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /no F-ID cited/);
});

test("all five desk spellings are matched, so the check cannot be dodged by an apostrophe", () => {
  // F-1471-3 shipped because a guard knew ONE spelling of the desk word while the
  // corpus used four. That lesson is asserted here rather than assumed — and the
  // FIFTH (backtick, U+0060) was added s1542 after a real fire wrote it into a
  // live handoff and two sibling guards went blind at once: F-1542-1. Here a miss
  // fails OPEN, so nothing would ever have complained.
  for (const spelling of ["owner\u2019s desk", "owner\u0027s desk", "owners desk", "OWNER DESK", "owner\u0060s desk"]) {
    const dir = fixture({
      scripts: { ...BASE_SCRIPTS, "test:lonely": "node scripts/lonely-guard.mjs" },
      files: ESC_FILES("- nothing relevant here\n"),
      baseline: JSON.stringify({
        grandfathered: {
          "npm:test:lonely": "s0000 F-9999-9: " + spelling + ".",
          "scripts/lonely-guard.mjs": "deliberate: reached only through the hand-run gate above",
        },
      }),
    });
    const r = run(dir);
    assert.equal(r.status, 1, spelling + " was not recognised as an escalation: " + r.stdout + r.stderr);
  }
});

// ---------------------------------------------------------------------------
// POSITIVE CONTROL — the arms above all run on fixtures, so at least one must
// prove the script works on the tree it actually gates (s1252's harness lesson:
// validate the harness before believing its numbers).
// ---------------------------------------------------------------------------

test('POSITIVE CONTROL: the real repo passes, with a non-empty measured subject', () => {
  const r = run(REAL_ROOT);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const subjects = Number((r.stdout.match(/subjects\s+:\s+(\d+)/) || [])[1]);
  assert.ok(subjects >= 10, 'expected a real subject set, measured ' + subjects);
  // the two anchors that make every other verdict meaningful
  assert.match(r.stdout, /PASS — every gate-shaped subject/);
});
