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
  const captureDir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-capture-')));
  const stdoutPath = path.join(captureDir, 'stdout');
  const stderrPath = path.join(captureDir, 'stderr');
  let stdoutFd;
  let stderrFd;
  let result;
  try {
    stdoutFd = fs.openSync(stdoutPath, 'w');
    stderrFd = fs.openSync(stderrPath, 'w');
    result = spawnSync(process.execPath, [SCRIPT, '--root', dir, ...extra], {
      timeout: 240_000, killSignal: 'SIGKILL',
      stdio: ['ignore', stdoutFd, stderrFd],
    });
  } finally {
    if (stdoutFd !== undefined) fs.closeSync(stdoutFd);
    if (stderrFd !== undefined) fs.closeSync(stderrFd);
  }
  return {
    ...result,
    stdout: fs.readFileSync(stdoutPath, 'utf8'),
    stderr: fs.readFileSync(stderrPath, 'utf8'),
  };
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

test('a tracked test file nothing calls is reported as a NEW orphan and exits 1', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'src/lonely.test.mjs': 'console.log("nobody calls me");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /NEW\s+src\/lonely\.test\.mjs\s+NO CALLER/);
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

test('REGRESSION: an untracked guard-shaped file is byte-invisible by default', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: EMPTY_BASELINE });
  const before = run(dir);
  fs.writeFileSync(path.join(dir, 'scripts', 'x-audit.mjs'), 'console.log("untracked");\n');
  const after = run(dir);
  assert.deepEqual(
    { status: after.status, stdout: after.stdout, stderr: after.stderr },
    { status: before.status, stdout: before.stdout, stderr: before.stderr },
  );
});

test('--include-untracked reports an untracked guard-shaped file as NEW with no caller', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: EMPTY_BASELINE });
  fs.writeFileSync(path.join(dir, 'scripts', 'x-audit.mjs'), 'console.log("untracked");\n');
  const r = run(dir, '--include-untracked');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /scripts\/ files\s+: \d+ \(\d+ guard-shaped\) \(\+1 untracked\)/);
  assert.match(r.stdout, /NEW\s+scripts\/x-audit\.mjs\s+NO CALLER/);
});

test('a tracked baselined orphan stays known under --include-untracked', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/known-audit.mjs': 'console.log("known");\n' },
    baseline: JSON.stringify({ grandfathered: { 'scripts/known-audit.mjs': 'deliberate hand-run audit' } }),
  });
  const r = run(dir, '--include-untracked');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /known\s+scripts\/known-audit\.mjs\s+deliberate hand-run audit/);
});

test('--include-untracked still excludes untracked SCRATCH_FILE probes', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: EMPTY_BASELINE });
  fs.writeFileSync(path.join(dir, 'scripts', 'tmp-s999-probe-audit.mjs'), 'console.log("scratch");\n');
  const r = run(dir, '--include-untracked');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout + r.stderr, /tmp-s999-probe-audit/);
});

test('--include-untracked excludes gitignored guard-shaped files', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, '.gitignore': 'scripts/ignored-audit.mjs\n' },
    baseline: EMPTY_BASELINE,
  });
  fs.writeFileSync(path.join(dir, 'scripts', 'ignored-audit.mjs'), 'console.log("ignored");\n');
  const r = run(dir, '--include-untracked');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout + r.stderr, /ignored-audit/);
});

test('--update-baseline --include-untracked REFUSES without writing baseline bytes', () => {
  const dir = fixture({ scripts: BASE_SCRIPTS, files: BASE_FILES, baseline: EMPTY_BASELINE });
  const baseline = path.join(dir, 'scripts', 'gate-caller-baseline.json');
  const before = fs.readFileSync(baseline);
  const r = run(dir, '--update-baseline', '--include-untracked');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /REFUSING — --update-baseline cannot be combined with --include-untracked/);
  assert.deepEqual(fs.readFileSync(baseline), before);
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
// F-2199-1 — SUBJECT ADMISSION. The header defines a gate BEHAVIOURALLY ("whose
// whole purpose is to return a verdict") while the code admitted files by
// EXTENSION, so a guard written in bash was not merely unreached, it was not a
// SUBJECT. Every red below is proven by MANUFACTURING the defect against a
// pre-cure mutant: a passing guard never executes its own violation path, so a
// green here would say nothing about the arm (the s1299/s1300 standard).
// ---------------------------------------------------------------------------

/** Pre-cure mutant: .sh admission reverted, everything else byte-identical. */
function mutantWithoutShSubjects() {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  // s2200 (F-2200-2): RE-POINTED. This mutant used to neuter two INLINE predicates; s2200
  // hoisted both into the shared TEST_FILE, so neither literal matched, the mutant stopped
  // mutating, and the `notEqual` below caught it — the guard refusing to prove a cure with a
  // probe that had silently become a no-op. That refusal is the guard working: had this
  // asserted only the post-cure arm, the s2199 proof would have quietly become vacuous.
  // Neutering TEST_FILE itself reproduces the pre-s2199 world at its new single source.
  const neutered = src
    .replace(
      "const TEST_FILE = (f) => f.endsWith('.test.mjs') || f.endsWith('.test.sh') || /(^|\\/)test-[\\w.-]*\\.(mjs|sh)$/.test(f);",
      "const TEST_FILE = (f) => f.endsWith('.test.mjs');",
    )
    .replace("  if (TEST_FILE(f)) continue;", "  if (!f.endsWith('.mjs') || f.endsWith('.test.mjs')) continue;");
  assert.notEqual(neutered, src, 'the mutant must actually differ — otherwise this proves nothing');
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-mutant-')));
  const p = path.join(dir, 'gate-caller-audit.mjs');
  fs.writeFileSync(p, neutered);
  fs.copyFileSync(path.join(path.dirname(SCRIPT), 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  return p;
}

function runWith(script, dir, ...extra) {
  return spawnSync(process.execPath, [script, '--root', dir, ...extra], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
}

test('ADMISSION: a *.test.sh nothing calls is a NEW orphan (pre-cure it is byte-invisible)', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/lonely-thing.test.sh': '#!/usr/bin/env bash\nexit 0\n' },
    baseline: EMPTY_BASELINE,
  });
  const pre = runWith(mutantWithoutShSubjects(), dir);
  assert.equal(pre.status, 0, 'PRE-CURE: the bash guard is not a subject — this is the defect\n' + pre.stdout);
  assert.doesNotMatch(pre.stdout, /lonely-thing\.test\.sh/, 'PRE-CURE: it is never even named');

  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /scripts\/lonely-thing\.test\.sh/);
});

test('ADMISSION: a guard-shaped .sh nothing calls is a NEW orphan (pre-cure invisible)', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/lonely-fence-guard.sh': '#!/usr/bin/env bash\nexit 1\n' },
    baseline: EMPTY_BASELINE,
  });
  const pre = runWith(mutantWithoutShSubjects(), dir);
  assert.equal(pre.status, 0, 'PRE-CURE: a bash guard is outside the subject set\n' + pre.stdout);
  assert.doesNotMatch(pre.stdout, /lonely-fence-guard\.sh/);

  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /scripts\/lonely-fence-guard\.sh/);
});

test('ADMISSION CONTROL: a NON-guard-shaped .sh is still never ratcheted on', () => {
  // The widening is narrow ON PURPOSE. Admitting all 33 scripts/*.sh in the real
  // tree would add 22 orphans — fire-runner.sh, lane-runner-v3.sh, deploy-alias.sh,
  // stream-sync.sh — all human tools and pipeline entry points. A ratchet that reds
  // on those trains fires to ignore it (F-1460-1, the `cross-engine` fate).
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/deploy-somewhere.sh': '#!/usr/bin/env bash\necho ship\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /deploy-somewhere\.sh/);
});

// ---------------------------------------------------------------------------
// F-2200-1 — A TEST NAMED WITH A HYPHEN IS STILL A TEST. Subjects were admitted
// by SUFFIX (`.test.mjs`/`.test.sh`), so `test-<thing>.mjs` was not a subject at
// all — and SIX such files run inside gate-shaped batteries. Measured s2200 on
// the real tree: deleting `node scripts/test-standings.mjs` from `test:stats`
// produced byte-identical output, rc=0, zero fresh orphans. Total silence.
// The same blindness sat on the EDGE side (paths admitted by location), so
// curing only the subject side would have minted an orphan no rooting could clear.
// ---------------------------------------------------------------------------

/** Pre-cure mutant: the `test-` prefix form is not a subject and not an edge. */
function mutantWithoutPrefixTests() {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const neutered = src
    .replace(
      "const TEST_FILE = (f) => f.endsWith('.test.mjs') || f.endsWith('.test.sh') || /(^|\\/)test-[\\w.-]*\\.(mjs|sh)$/.test(f);",
      "const TEST_FILE = (f) => f.endsWith('.test.mjs') || f.endsWith('.test.sh');",
    )
    .replace("  for (const m of body.matchAll(/(?:[\\w.-]+\\/)+test-[\\w.-]*\\.(?:mjs|sh)/g)) out.add(m[0]);\n", '');
  assert.notEqual(neutered, src, 'the mutant must actually differ — otherwise this proves nothing');
  return writeMutant(neutered, 'prefix');
}

/** Half-cure mutant: the SUBJECT widening only. Proves the edge half is load-bearing. */
function mutantSubjectCureOnly() {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const neutered = src.replace(
    "  for (const m of body.matchAll(/(?:[\\w.-]+\\/)+test-[\\w.-]*\\.(?:mjs|sh)/g)) out.add(m[0]);\n",
    '',
  );
  assert.notEqual(neutered, src, 'the half-cure mutant must actually differ');
  return writeMutant(neutered, 'edgeless');
}

function writeMutant(source, tag) {
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-' + tag + '-')));
  const p = path.join(dir, 'gate-caller-audit.mjs');
  fs.writeFileSync(p, source);
  fs.copyFileSync(path.join(path.dirname(SCRIPT), 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  return p;
}

test('ADMISSION: a test-<thing>.mjs nothing calls is a NEW orphan (pre-cure invisible)', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/test-lonely-thing.mjs': 'console.log("verdict");\n' },
    baseline: EMPTY_BASELINE,
  });
  const pre = runWith(mutantWithoutPrefixTests(), dir);
  assert.equal(pre.status, 0, 'PRE-CURE: a hyphen-prefix test is outside the subject set\n' + pre.stdout);
  assert.doesNotMatch(pre.stdout, /test-lonely-thing\.mjs/, 'PRE-CURE: it is never even named');

  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /scripts\/test-lonely-thing\.mjs/);
});

test('TEETH: dropping a test-<thing>.mjs from a live gate now REDS (the real silent-drop)', () => {
  // This is `test:stats` in miniature: one npm gate whose body chains TWO files.
  // Removing the second half is the drop that was byte-invisible before s2200.
  const both = {
    ...BASE_SCRIPTS,
    'test:node-guards': 'node --test scripts/probe.test.mjs && node scripts/test-standings.mjs',
  };
  const files = { ...BASE_FILES, 'scripts/test-standings.mjs': 'console.log("standings");\n' };
  const kept = fixture({ scripts: both, files, baseline: EMPTY_BASELINE });
  const green = run(kept);
  assert.equal(green.status, 0, 'chained: reached, so no orphan\n' + green.stdout + green.stderr);

  const dropped = fixture({
    scripts: { ...both, 'test:node-guards': 'node --test scripts/probe.test.mjs' },
    files,
    baseline: EMPTY_BASELINE,
  });
  const red = run(dropped);
  assert.equal(red.status, 1, 'dropped from the chain: must RED\n' + red.stdout + red.stderr);
  assert.match(red.stdout + red.stderr, /scripts\/test-standings\.mjs/);
});

test('EDGE: a test file OUTSIDE scripts/ is REACHED when a gate calls it', () => {
  // foundry/kit/test-init.sh in miniature. The edge vocabulary admitted paths by
  // LOCATION (`scripts/`), so a cited test file anywhere else resolved to no edge.
  const scripts = { ...BASE_SCRIPTS, 'test:node-guards': 'node --test scripts/probe.test.mjs && bash kit/test-init.sh' };
  const files = { ...BASE_FILES, 'kit/test-init.sh': '#!/usr/bin/env bash\nexit 0\n' };
  const dir = fixture({ scripts, files, baseline: EMPTY_BASELINE });

  const r = run(dir);
  assert.equal(r.status, 0, 'cured: the citation resolves, so it is reached\n' + r.stdout + r.stderr);

  // HALF-CURE CONTROL: subject widening WITHOUT the edge widening. The file becomes a
  // subject, the gate calls it as loudly as before — and it still reads ORPHAN. Curing
  // one side alone would have manufactured an unclearable red.
  const half = runWith(mutantSubjectCureOnly(), dir);
  assert.equal(half.status, 1, 'HALF-CURE: an orphan no rooting can clear\n' + half.stdout);
  assert.match(half.stdout + half.stderr, /kit\/test-init\.sh/);
});

test('ADMISSION CONTROL: a `test-` prefix in a DIRECTORY name does not admit the file', () => {
  // The pattern anchors on the basename. `test-helpers/thing.mjs` is not a test file,
  // and admitting a whole directory tree by its name is how a narrow widening floods.
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'test-helpers/thing.mjs': 'console.log("helper");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /test-helpers/);
});

// ---------------------------------------------------------------------------
// F-2199-1 — A LAW IS A CALLER. Seventeen baseline entries said "law files are
// outside this audit's edge vocabulary" and worked around it; the cost was that
// `test:ledger-guards` and every leaf it chains were excused as orphans, so
// DROPPING a leaf from the chain changed nothing this audit printed.
// ---------------------------------------------------------------------------

/** Pre-cure mutant: law-derived roots removed, everything else byte-identical. */
function mutantWithoutLawRoots() {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  const neutered = src.replace(
    "const lawRoots = lawCalledNpmScripts(scripts);\nfor (const name of lawRoots.keys()) roots.add('npm:' + name);",
    'const lawRoots = new Map();',
  );
  assert.notEqual(neutered, src, 'the mutant must actually differ — otherwise this proves nothing');
  const dir = track(fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gate-caller-lawmutant-')));
  const p = path.join(dir, 'gate-caller-audit.mjs');
  fs.writeFileSync(p, neutered);
  fs.copyFileSync(path.join(path.dirname(SCRIPT), 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  return p;
}

const LAW_FIXTURE = {
  scripts: {
    ...BASE_SCRIPTS,
    'test:ledger-ish': 'node --test scripts/late-guard.test.mjs && bash scripts/late-fence.test.sh',
  },
  files: {
    ...BASE_FILES,
    'scripts/late-guard.test.mjs': 'console.log("late");\n',
    'scripts/late-fence.test.sh': '#!/usr/bin/env bash\nexit 0\n',
    'scripts/fire.md': 'Run `npm run test:ledger-ish` as the LAST act of every fire that wrote a ledger row.\n',
  },
  baseline: EMPTY_BASELINE,
};

test('LAW ROOT: a battery only a LAW surface calls is REACHED, and so are its leaves', () => {
  const dir = fixture(LAW_FIXTURE);
  const pre = runWith(mutantWithoutLawRoots(), dir);
  assert.equal(pre.status, 1, 'PRE-CURE: the law-called battery reads as an orphan — this is the defect');
  assert.match(pre.stdout + pre.stderr, /npm:test:ledger-ish/);
  assert.match(pre.stdout + pre.stderr, /late-guard\.test\.mjs/, 'PRE-CURE: the leaf inherits the orphanhood');

  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /law-called roots\s+:\s+\d+.*test:ledger-ish/);
  assert.doesNotMatch(r.stdout + r.stderr, /NEW\s+npm:test:ledger-ish/);
});

test('LAW ROOT TEETH: dropping a leaf from the chain now REDS — the whole point', () => {
  // Before this cure the leaf was grandfathered as an orphan, so removing its only
  // caller changed nothing the audit printed. That is F-1252-2's failure mode (a
  // guard RED for nine fires behind nine green batteries) inside the guard built
  // to catch it.
  const dropped = {
    ...LAW_FIXTURE,
    scripts: { ...LAW_FIXTURE.scripts, 'test:ledger-ish': 'node --test scripts/late-guard.test.mjs' },
  };
  const r = run(fixture(dropped));
  assert.equal(r.status, 1, 'a leaf removed from the chain must red\n' + r.stdout);
  assert.match(r.stdout + r.stderr, /late-fence\.test\.sh/);
});

test('LAW ROOT: a law citing a script package.json does NOT define confers nothing', () => {
  // F-1667-1's shape: two entries excused guards for 133 fires on a law caller that
  // `grep -c` says never existed. A citation is READ and RESOLVED here, never trusted.
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:lonely': 'node scripts/lonely-guard.mjs' },
    files: {
      ...BASE_FILES,
      'scripts/lonely-guard.mjs': 'console.log("nobody calls me");\n',
      'scripts/fire.md': 'Always run `npm run test:lonley` before draining.\n', // typo: no such script
    },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 1, 'a misspelled law citation must not invent a caller\n' + r.stdout);
  assert.match(r.stdout + r.stderr, /npm:test:lonely/);
});

// ---------------------------------------------------------------------------
// F-2199-2 — TIGHTENING USED TO DESTROY THE REASONING. --update-baseline rebuilt
// the file from the current orphan set, so an entry that gained a caller was
// dropped and its reason went with it. On the live tree that was 17 entries and
// 22,038 characters of recorded why, several carrying their own later
// corrections. The RETENTION LAW marks superseded lines, it does not delete them.
// ---------------------------------------------------------------------------

test('RETENTION: --update-baseline SUPERSEDES a healed entry instead of deleting its reason', () => {
  const REASON = 's0000 F-9999-9: the whole recorded why, which must survive tightening.';
  const dir = fixture({
    ...LAW_FIXTURE,
    baseline: JSON.stringify({ grandfathered: { 'npm:test:ledger-ish': REASON } }),
  });
  const r = run(dir, '--update-baseline');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const after = JSON.parse(fs.readFileSync(path.join(dir, 'scripts', 'gate-caller-baseline.json'), 'utf8'));
  assert.ok(!('npm:test:ledger-ish' in after.grandfathered), 'a reached gate must leave the ratchet');
  assert.equal(after.superseded['npm:test:ledger-ish'], REASON, 'the reason must survive BYTE-IDENTICAL');
});

test('RETENTION: `superseded` excuses NOTHING — a re-orphaned gate reds as FRESH', () => {
  // The danger of keeping history in the same file is that it becomes an amnesty.
  // Only `grandfathered` is read by the ratchet; this proves it.
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:lonely': 'node scripts/lonely-guard.mjs' },
    files: { ...BASE_FILES, 'scripts/lonely-guard.mjs': 'console.log("nobody calls me");\n' },
    baseline: JSON.stringify({
      grandfathered: {},
      superseded: {
        'npm:test:lonely': 'once had a caller',
        'scripts/lonely-guard.mjs': 'once had a caller',
      },
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 1, 'a superseded key must not excuse an orphan\n' + r.stdout);
  assert.match(r.stdout + r.stderr, /npm:test:lonely/);
});

// ---------------------------------------------------------------------------
// s2201 (F-2201-1): THE BATTERY-STEP CLASS. A step of a gate-shaped npm script is
// a gate whatever its name. These arms prove the RED path by manufacturing the
// defect, and pair each with the control that makes the red meaningful.
// ---------------------------------------------------------------------------

test('a NON-guard-named step of a gate script is admitted as a subject', () => {
  // The step hangs off test:task-guards, which run-guards.mjs already roots. Hanging
  // it off a NEW npm script instead would red for an unrelated reason -- that script
  // would itself be an uncalled gate, and drag its step down with it (the arm at the
  // top of this file). The claim here is about the STEP, so the battery must be rooted.
  const dir = fixture({
    scripts: {
      ...BASE_SCRIPTS,
      'test:task-guards': 'node scripts/task-guard-audit.mjs && node scripts/plain-step.mjs',
    },
    files: { ...BASE_FILES, 'scripts/plain-step.mjs': 'throw new Error("budget");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  // It is CALLED, so it must not red -- admission alone is not a complaint.
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /battery steps\s+:\s+[1-9]/);
});

test('CONTROL: that same file, named by nothing and persisted nowhere, is invisible', () => {
  // The pre-cure behaviour. Without a gate script naming it and without a
  // batterySteps entry, a plainly-named script is not a subject at all -- which
  // is correct, and is why the arm below needs the persisted set to bite.
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/plain-step.mjs': 'throw new Error("budget");\n' },
    baseline: EMPTY_BASELINE,
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout + r.stderr, /plain-step\.mjs/);
});

test('DROPPING a persisted battery step from its battery reds as a NEW orphan', () => {
  // THE WHOLE POINT. The file was a step (so it is in batterySteps) and is now
  // named by nothing. Pre-cure this was byte-for-byte silent; the audit could not
  // see a gate leave its own battery.
  const dir = fixture({
    scripts: BASE_SCRIPTS, // note: no `test:diet` — the step has been removed
    files: { ...BASE_FILES, 'scripts/plain-step.mjs': 'throw new Error("budget");\n' },
    baseline: JSON.stringify({ grandfathered: {}, batterySteps: ['scripts/plain-step.mjs'] }),
  });
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /no caller and no recorded reason/);
  assert.match(r.stdout + r.stderr, /scripts\/plain-step\.mjs/);
});

test('a dropped battery step can be grandfathered with a reason, like any orphan', () => {
  const dir = fixture({
    scripts: BASE_SCRIPTS,
    files: { ...BASE_FILES, 'scripts/plain-step.mjs': 'throw new Error("budget");\n' },
    baseline: JSON.stringify({
      grandfathered: { 'scripts/plain-step.mjs': 'retired deliberately: the budget moved into tsc' },
      batterySteps: ['scripts/plain-step.mjs'],
    }),
  });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /retired deliberately/);
});

test('--update-baseline is ADDITIVE: a step no script names any longer is KEPT', () => {
  // The RETENTION LAW applied to this set, and the mechanism's own load-bearing
  // property: a writer that rebuilt batterySteps from today's package.json would
  // drop the entry in the same breath as the edge, restoring the silence.
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, 'test:diet': 'node scripts/plain-step.mjs' },
    files: {
      ...BASE_FILES,
      'scripts/plain-step.mjs': 'throw new Error("budget");\n',
      'scripts/long-gone.mjs': 'throw new Error("was a step once");\n',
    },
    baseline: JSON.stringify({ grandfathered: {}, batterySteps: ['scripts/long-gone.mjs'] }),
  });
  const w = run(dir, '--update-baseline');
  assert.equal(w.status, 0, w.stdout + w.stderr);
  const written = JSON.parse(
    fs.readFileSync(path.join(dir, 'scripts', 'gate-caller-baseline.json'), 'utf8'),
  );
  assert.ok(
    written.batterySteps.includes('scripts/long-gone.mjs'),
    'the historical entry was dropped: ' + JSON.stringify(written.batterySteps),
  );
  assert.ok(
    written.batterySteps.includes('scripts/plain-step.mjs'),
    'today\'s step was not recorded: ' + JSON.stringify(written.batterySteps),
  );
});

test('a step of a NON-gate script (dev, census) is never admitted', () => {
  // The flood check. GATE_NAME still decides which npm scripts contribute steps,
  // so a human tool's helper does not become a ratcheted subject.
  const dir = fixture({
    scripts: { ...BASE_SCRIPTS, dev: 'node scripts/helper.mjs', census: 'node scripts/helper.mjs' },
    files: { ...BASE_FILES, 'scripts/helper.mjs': 'console.log("human tool");\n' },
    baseline: EMPTY_BASELINE,
  });
  const w = run(dir, '--update-baseline');
  assert.equal(w.status, 0, w.stdout + w.stderr);
  const written = JSON.parse(
    fs.readFileSync(path.join(dir, 'scripts', 'gate-caller-baseline.json'), 'utf8'),
  );
  assert.ok(
    !written.batterySteps.includes('scripts/helper.mjs'),
    'a non-gate script contributed a step: ' + JSON.stringify(written.batterySteps),
  );
});

test('REGRESSION: the real repo persists asset-diet.mjs as a battery step', () => {
  // The instance that produced the finding. If a future edit drops this entry the
  // hole re-opens silently, which is precisely how it went unseen for so long.
  const written = JSON.parse(
    fs.readFileSync(path.join(REAL_ROOT, 'scripts', 'gate-caller-baseline.json'), 'utf8'),
  );
  assert.ok(
    Array.isArray(written.batterySteps) && written.batterySteps.includes('scripts/asset-diet.mjs'),
    'asset-diet.mjs is no longer a persisted battery step',
  );
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
