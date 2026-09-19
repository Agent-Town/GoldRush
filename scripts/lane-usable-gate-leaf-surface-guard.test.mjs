// s2349 — F-2349-1. `lane-usable.mjs`'s RUN_SURFACE was a HARDCODED list of nine
// top-level entries, and `surfaceDrift()` computes from it the panel a fire reads to
// decide whether a lane's GATES can be trusted. The panel's green says, in words:
//
//     "✅ …but NONE of it is run-surface … The gap is bookkeeping only —
//      nothing here can stop a task running."
//
// That is a universal claim about the whole tree, computed from a list drawn when
// those nine entries WERE the whole run surface. The repo has since grown `server/`,
// `ops/` and `foundry/`, and gate leaves moved into all three — so the list rotted by
// ADDITION ELSEWHERE, a direction no guard on this file could see.
//
// MEASURED s2349 against main's own package.json: EIGHT gate leaves live outside the
// base list, two of them leaves of the batteries every fire runs —
//     test:ledger-guards -> foundry/kit/test-init.sh
//     test:node-guards   -> ops/droplet/ledger-backup.test.mjs
//     test:codex-shim    -> server/codex-shim/serve{,.test}.mjs
//     test:preview / test:release / test:release-base -> playwright.*.config.ts
// and `foundry/kit/test-init.sh` GENUINELY DIVERGES on lane/a and lane/b today.
//
// SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: the affirmative GREEN is
// LATENT on today's board — all four lanes carry non-zero base drift, so the amber
// prints and no fire was told "nothing can stop a task running" while a gate leaf
// diverged. What is LIVE is the UNDER-COUNT and the omission of gate leaves from the
// file list a reader is shown. The direction is permissive, which is why it earns a
// guard; the realised cost so far is zero. The cure only ever raises a drift count
// (measured: all 16 lanes rose 4–17 files, none fell) and moves NO verdict.
//
// EVERY RED ARM BELOW WAS PROVEN BY MANUFACTURING THE DEFECT, never by reading.
// THE REVERSE CONTROLS MATTER MOST, and each catches exactly the over-general cure
// built for it: widening past the gates turns every lane amber and retires the green
// (arm 4); REFUSING when package.json is unreadable reds on the lawful state every
// fixture repo in this file's four sibling suites is in (arm 6); reading the LANE's
// package.json instead of main's re-creates the F-1343-2 subset hazard inside the very
// probe built to report it (arm 8).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'lane-usable.mjs');

const GREEN = /NONE of it is run-surface/;
const DRIFT = /run-surface drift:/;
const DECL = /^run surface: \d+ base \+ gate leaves from /m;

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_NAME: 'g', GIT_AUTHOR_EMAIL: 'g@x', GIT_COMMITTER_NAME: 'g', GIT_COMMITTER_EMAIL: 'g@x' },
  });
}

/**
 * A fixture repo whose lane is ahead=0 / behind=1 — the ONLY state that reaches the
 * drift panel, since report() attaches it to USABLE with behind > 0.
 *
 * main moves a GATE LEAF that lives outside the nine base entries (`foundry/`), and
 * NOTHING inside them, so the base list alone sees a clean surface and prints the
 * green. package.json is written in the BASE commit, before the branch, so it is
 * itself identical on both sides — otherwise package.json (a base entry) would show
 * drift and the arm would pass for the wrong reason.
 *
 * `realpathSync` because os.tmpdir() is SYMLINKED on macOS (/var -> /private/var).
 * This subject's module-main guard is keyed on the FILENAME so it is not the s1334
 * trap, but the git worktree bookkeeping compares resolved paths and a fixture root
 * is a corpus selector — a symlink narrows it while reporting success.
 */
function fixture(t, { pkg = undefined, leafDir = 'foundry', movesBaseSurface = false, lanePkg = undefined } = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'f2349-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  git(['init', '-b', 'main', '-q', root], os.tmpdir());
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(root, 'README.md'), 'base\n');
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), 'base\n');
  const baseAdd = ['README.md', 'tasks/BACKLOG.md'];

  if (pkg !== undefined) {
    fs.writeFileSync(path.join(root, 'package.json'), pkg);
    baseAdd.push('package.json');
  }
  git(['add', ...baseAdd], root);
  git(['commit', '-qm', 'base'], root);

  git(['branch', 'lane/x'], root);
  git(['worktree', 'add', '-q', path.join(root, 'worktrees', 'lane-x'), 'lane/x'], root);

  // arm 8 only: give the LANE a package.json that names NO gate leaf, so a probe
  // reading the worktree's copy instead of main's sees an empty derivation.
  if (lanePkg !== undefined) {
    const lw = path.join(root, 'worktrees', 'lane-x');
    fs.writeFileSync(path.join(lw, 'package.json'), lanePkg);
    git(['add', 'package.json'], lw);
    git(['commit', '-qm', 'lane narrows its own gates'], lw);
  }

  // main moves ahead on the GATE LEAF alone (outside the nine base entries).
  fs.mkdirSync(path.join(root, leafDir, 'kit'), { recursive: true });
  fs.writeFileSync(path.join(root, leafDir, 'kit', 'test-init.sh'), 'echo moved\n');
  const staged = [`${leafDir}/kit/test-init.sh`];
  if (movesBaseSurface) {
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'foo.ts'), 'export const foo = 1\n');
    staged.push('src/foo.ts');
  }
  git(['add', ...staged], root);
  git(['commit', '-qm', 'main moves a gate leaf'], root);
  return root;
}

/**
 * A runnable copy of the subject with `edit` applied. Lands OUTSIDE any repo (F-1665-1).
 *
 * Every sibling the subject imports RELATIVELY travels with it, DERIVED from the variant's
 * own import statements rather than transcribed. It was a hardcoded `lane-residue.mjs` until
 * s2639, when the subject gained a second relative import and this guard's arms went red —
 * correctly and loudly, because a variant that cannot load produces EMPTY stdout, which is
 * indistinguishable from a subject that reported nothing. Deriving it means the NEXT sibling
 * travels without anyone remembering to.
 */
function copyLocalImports(source, dir) {
  const seen = new Set();
  for (const m of source.matchAll(/from\s+'(\.\/[^']+)'/g)) {
    const name = m[1].slice(2);
    if (seen.has(name)) continue;
    seen.add(name);
    fs.copyFileSync(path.join(HERE, name), path.join(dir, name));
  }
  return seen;
}

function variantOf(t, edit) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'f2349-v-')));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const src = fs.readFileSync(SUBJECT, 'utf8');
  const out = edit(src);
  assert.notEqual(out, src, 'variant edit matched nothing — the arm would silently test the cured file');
  const copied = copyLocalImports(out, dir);
  assert.ok(copied.size > 0, 'variant precondition: the subject has relative imports, so some must have travelled');
  const p = path.join(dir, 'lane-usable.mjs');
  fs.writeFileSync(p, out);
  return p;
}

function run(script, cwd, args = ['--all']) {
  const r = spawnSync(process.execPath, [script, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

// The pre-cure source: RUN_SURFACE is the nine hardcoded entries and nothing else.
const preCure = (src) =>
  src.replace('const RUN_SURFACE = [...RUN_SURFACE_BASE, ...gatedRoots().roots]', 'const RUN_SURFACE = [...RUN_SURFACE_BASE]');

const GATE_PKG = JSON.stringify({ scripts: { 'test:ledger-guards': 'bash foundry/kit/test-init.sh' } });
const COVERED_PKG = JSON.stringify({ scripts: { 'test:x': 'node scripts/x.test.mjs' } });

test('VALIDITY + arm 1 (THE DEFECT): pre-cure, a moved GATE LEAF reads as the affirmative all-clear', (t) => {
  const root = fixture(t, { pkg: GATE_PKG });

  const pre = run(variantOf(t, preCure), root);
  assert.equal(pre.rc, 0, pre.err);
  assert.ok(pre.out.length > 0, 'VALIDITY: the pre-cure arm produced no output — it never ran');
  assert.match(pre.out, GREEN, 'pre-cure claims the gap is bookkeeping only');
  assert.doesNotMatch(pre.out, DRIFT, 'pre-cure shows no run-surface drift at all');

  const cured = run(SUBJECT, root);
  assert.equal(cured.rc, 0, cured.err);
  assert.match(cured.out, DRIFT, 'the cured subject reports the gate leaf as run-surface drift');
  assert.doesNotMatch(cured.out, GREEN, 'and withdraws the all-clear');
});

test('arm 2: the drift section NAMES the gate leaf, not merely a bigger number', (t) => {
  // s2222's lesson: assert the OBSERVABLE, never the blob. A count that rose proves
  // nothing about WHICH file a reader is handed.
  const root = fixture(t, { pkg: GATE_PKG });
  const r = run(SUBJECT, root);
  assert.match(r.out, /foundry\/kit\/test-init\.sh/, 'the reader is shown the gate leaf by path');
});

test('arm 3: the derivation is DECLARED on stdout on the happy path (F-2208-1)', (t) => {
  const root = fixture(t, { pkg: GATE_PKG });
  const r = run(SUBJECT, root);
  assert.match(r.out, DECL, 'every run declares the surface it compared');
  assert.match(r.out, /main:package\.json/, 'and names the corpus the gate leaves came from');
  assert.match(r.out, /\(\+1: foundry\)/, 'and names what it added');
});

test('REVERSE CONTROL, arm 4: a package.json naming only COVERED paths adds nothing', (t) => {
  // The over-general cure — widening past what the gates actually execute — would turn
  // every lane amber and retire the green entirely. Here main moved a `foundry/` file
  // that NO script names, so it is genuinely not run surface and the green must survive.
  const root = fixture(t, { pkg: COVERED_PKG });
  const r = run(SUBJECT, root);
  assert.equal(r.rc, 0, r.err);
  assert.match(r.out, /\(\+0\)/, 'nothing derived when the gates name only covered paths');
  assert.match(r.out, GREEN, 'a genuinely bookkeeping-only gap still reads green');
  assert.doesNotMatch(r.out, DRIFT, 'and reports no run-surface drift');
});

test('arm 5: an ABSENT package.json degrades to the base list and SAYS SO', (t) => {
  const root = fixture(t, { pkg: undefined });
  const r = run(SUBJECT, root);
  assert.equal(r.rc, 0, r.err);
  assert.match(r.out, /gate leaves from unverifiable \(\+0\)/, 'the degradation is declared, not silent');
});

test('arm 6 (REVERSE CONTROL): an unreadable package.json must DECLARE, never REFUSE', (t) => {
  // F-2218-1's restraint. A root with no package.json is LAWFUL — every fixture repo
  // in this file's four sibling suites is one — so a refusal here would red on ordinary
  // work and be excused into uselessness inside a week (F-1460-1).
  const root = fixture(t, { pkg: undefined, movesBaseSurface: true });
  const r = run(SUBJECT, root);
  assert.equal(r.rc, 0, 'an absent package.json is lawful and must not change the exit code');
  assert.match(r.out, /USABLE/, 'the lane is still classified');
  assert.match(r.out, DRIFT, 'and base-list drift is still reported');
  assert.match(r.out, /src\/foo\.ts/, 'the nine base entries keep working when the derivation cannot');
});

test('arm 7: a MALFORMED package.json degrades to the base list and says so', (t) => {
  const root = fixture(t, { pkg: '{ not json', movesBaseSurface: true });
  const r = run(SUBJECT, root);
  assert.equal(r.rc, 0, r.err);
  assert.match(r.out, /gate leaves from unparseable \(\+0\)/, 'a parse failure is named apart from an absent file');
  assert.match(r.out, /src\/foo\.ts/, 'and the base list still answers');
});

test('arm 9: the DEGRADED path writes NOTHING to stderr — a 2>&1 consumer parses this output', (t) => {
  // The defect this arm exists for was shipped in the first draft of the cure and caught by
  // the mandated last-act battery, not by the eight arms above. `execFileSync` INHERITS the
  // child's stderr by default even when the throw is caught, so an absent `main:package.json`
  // emitted `fatal: path 'package.json' does not exist in 'main'` onto the parent's stderr.
  // `lane-runner-v3.sh` captures this tool AND `lane-absorbed-lines.mjs` (which imports from
  // this file, so the module-level derivation runs at ITS import too) with `2>&1`, then COUNTS
  // the captured lines — so the stray line made the residue line-count disagree with the
  // absorbed-count and the runner REFUSED a lawful dispatch.
  //
  // It was invisible on the live board because `main:package.json` EXISTS here: ONLY the
  // degraded path speaks, and only into a fixture. That is why this arm asserts the QUIET of
  // the failure mode rather than the correctness of the happy one.
  const root = fixture(t, { pkg: undefined, movesBaseSurface: true });
  const r = run(SUBJECT, root);
  assert.ok(r.out.length > 0, 'VALIDITY: the arm produced no stdout — it never ran');
  assert.equal(r.err, '', `the degraded derivation must stay silent on stderr, got: ${r.err}`);
  assert.match(r.out, /gate leaves from unverifiable/, 'and still declares the degradation on STDOUT');
});

test('arm 10: lane-absorbed-lines.mjs — the IMPORTING consumer — is stderr-clean too', (t) => {
  // Fix the CLASS, not the instance: the runner parses that tool's output, and it inherits
  // this file's module-level derivation simply by importing residueForHeld from it.
  const root = fixture(t, { pkg: undefined });
  const r = spawnSync(process.execPath, [path.join(HERE, 'lane-absorbed-lines.mjs'), 'lane/x', 'README.md'], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: root,
    encoding: 'utf8',
  });
  assert.doesNotMatch(
    r.stderr || '',
    /does not exist in 'main'/,
    'the imported derivation must not leak git diagnostics into a machine-parsed probe',
  );
});

test('REVERSE CONTROL, arm 8: the gates are read from MAIN, not from the lane worktree', (t) => {
  // The F-1343-2 subset hazard, inside the probe built to report it: a lane whose
  // package.json is a strict SUBSET of main's would derive a narrower surface and
  // under-report its own drift — the exact failure this file warns about at :419.
  const root = fixture(t, { pkg: GATE_PKG, lanePkg: COVERED_PKG });
  const lane = path.join(root, 'worktrees', 'lane-x');

  const cured = run(SUBJECT, lane);
  assert.match(cured.out, /\(\+1: foundry\)/, 'main names the gate leaf, so the surface includes it');

  const worktreeRead = run(
    variantOf(t, (s) => s.replace("tryGit(['show', 'main:package.json'], {", "tryGit(['show', 'HEAD:package.json'], {")),
    lane,
  );
  assert.ok(worktreeRead.out.length > 0, 'VALIDITY: the variant produced no output — it never ran');
  assert.match(worktreeRead.out, /\(\+0\)/, "reading the lane's own package.json loses the gate leaf");
});
