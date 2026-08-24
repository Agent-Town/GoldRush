/**
 * F-2271-1 — the desk family reads STATUS.md ONCE per verdict, not twice.
 *
 * WHY THIS EXISTS. F-2265-1 (s2265) cured `authorable-candidates.mjs`, which read
 * `tasks/goals.json` twice per verdict, and named the axis: every declaration this
 * streak has built since s2204 asks WHETHER a corpus could be read (F-2217-1) or
 * WHICH TREE it came from (F-2222-1); none asks WHEN. It then handed the next fire
 * a MEASURED residue — desk-birth-guard.mjs reads STATUS.md at two sites separated
 * by git calls — explicitly marked "UNMEASURED as to harm; test before spending".
 *
 * MEASURED s2271, and the harm half is REFUTED for the prescribed invocation while
 * the structure is real. Both arms manufactured against corpus-tree.mjs directly,
 * with the control varied across the decision boundary (the first attempt was
 * VACUOUS — it never supplied a line-1 equal to main's, so both values landed on
 * the same branch and it wrongly read DISCARDED in both trees):
 *
 *   main worktree    statusText DISCARDED — frozenTreeCheck returns at its
 *                    `tree !== 'linked-worktree'` line BEFORE the argument is used.
 *                    REAL text and GARBAGE text give identical answers.
 *   linked worktree  statusText CONSUMED — main's own line-1 -> PROCEED,
 *                    GARBAGE -> REFUSAL. The answers DIFFER.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: this was never a false
 * green and no verdict was ever wrong. In the prescribed invocation the second
 * read's VALUE is discarded; in a linked worktree it is consumed, but a mid-run
 * rewrite of a frozen tracked checkout is part of no workflow (lane tasks are
 * firewalled from STATUS.md). The window is real in the CODE and unreachable in the
 * WORKFLOW. The unconditional cost is a 12.7 MB read thrown away on every run.
 *
 * THE CURE IS FINISHING A CLASS, NOT A NEW IDEA: desk-carryforward-guard.mjs:341
 * has ALWAYS had the cured structure (`statusText` read once, fed to analyse AND to
 * frozenTreeCheck). Its two siblings did not. For the Nth fire running in this
 * streak, the corpus already held the correct pattern and two files had simply
 * never adopted it — so arm 3 pins the sibling as a REVERSE CONTROL, proving the
 * assertion is not newly invented and cannot be satisfied vacuously.
 *
 * WHY THE COUNTER IS A RUNTIME SHIM AND NOT A SOURCE REGEX. s2265's own note (D)
 * recorded that its lexical "read exactly ONCE" arm did NOT red pre-cure, because
 * the second read hid behind a helper. s2271 then measured BOTH directions of that
 * error on this repo: a token census OVER-admits, because this repo's cure comments
 * QUOTE the code they cure (attended-owed-audit.mjs:122 is a COMMENT reading "the
 * `readFileSync(target)` probe below"), so a lexical sweep systematically accuses
 * the best-documented files; and naive comment-stripping UNDER-admits SILENTLY — a
 * template-literal stripper ate the live code in this very file and made all three
 * real subjects vanish from the census, which is the direction F-2207-1 warns about
 * (make a selector's failure mode over-inclusion). Counting the actual reads at
 * RUNTIME is immune to both, and it asserts the property rather than a proxy for it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const roots = [];
const variants = [];

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(args.join(' ') + ': ' + r.stderr);
  return r;
}

const HANDOFF = (n) =>
  `Last updated: 2026-08-23T0${n}:00Z s100${n} handoff, lock CLEARED — work landed. ` +
  `🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-AAA-1**`;

/**
 * A CLEAN board plus a linked worktree branched one handoff early. Clean is
 * load-bearing: frozenTreeCheck sits on the PASS path only (F-2241-1), so a fixture
 * carrying a defect FAILS before the second read and the pre-cure arms would count
 * 1 and pass vacuously — the same shape as running these guards while a fire holds
 * the lock, where line-1 is ACTIVE, both guards SKIP, and a before/after comparison
 * comes back "identical" having executed nothing (s2227's trap: a SKIP is not
 * silence, it DEFEATS the agreeing-silences rule by satisfying it).
 */
function build() {
  const root = mkdtempSync(path.join(tmpdir(), 's2271-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'f@x');
  git(root, 'config', 'user.name', 'f');

  const archive = [];
  let prev = null;
  const status = (t) => {
    if (prev) archive.unshift(`- **s${1000 + archive.length + 1} handoff (line-1 archive):** ${prev}`);
    prev = t;
    writeFileSync(path.join(root, 'STATUS.md'), [t, ...archive].join('\n') + '\n');
  };

  status(HANDOFF(1));
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'),
    '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1001 handoff: base');

  // Two handoffs before the branch point: desk-birth-guard's window is
  // [previous handoff .. HEAD] and a one-commit tree refuses for lack of history —
  // a FIXTURE artifact that would masquerade as the property under test.
  status(HANDOFF(2));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1002 handoff: still clean');

  const wt = path.join(root, 'wt');
  git(root, 'worktree', 'add', '-q', '-b', 'lane', wt);

  status(HANDOFF(3));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1003 handoff: clean');
  return { root, wt };
}

/** Patch fs.readFileSync in the CHILD and count reads of STATUS.md. */
function counterShim(dir) {
  const p = path.join(dir, 'counter.cjs');
  writeFileSync(p, [
    "const fs = require('fs');",
    "const path = require('path');",
    'let n = 0;',
    'const orig = fs.readFileSync;',
    'fs.readFileSync = function (f, ...rest) {',
    "  try { if (typeof f === 'string' && path.basename(f) === 'STATUS.md') n += 1; } catch {}",
    '  return orig.call(this, f, ...rest);',
    '};',
    "process.on('exit', () => {",
    '  try { fs.writeFileSync(process.env.S2271_COUNT_FILE, String(n)); } catch {}',
    '});',
  ].join('\n'));
  return p;
}

/** Run `script` from `cwd` and return how many times it read STATUS.md. */
function reads(scriptPath, cwd, dir) {
  const shim = counterShim(dir);
  const countFile = path.join(dir, 'count.' + path.basename(scriptPath) + '.txt');
  const r = spawnSync('node', ['-r', shim, scriptPath], {
    cwd, encoding: 'utf8', env: { ...process.env, S2271_COUNT_FILE: countFile },
  });
  const all = (r.stdout ?? '') + (r.stderr ?? '');
  assert.ok(all.length > 0, 'control validity (F-2215-1): the arm produced no output at all — it did not run');
  assert.doesNotMatch(r.stdout ?? '', /SKIP —/,
    'control validity: the guard SKIPped, so it never reached the second read — this arm would pass vacuously');
  assert.ok(existsSync(countFile), 'the counter shim never wrote its tally — the instrument, not the subject, failed');
  return { n: Number(readFileSync(countFile, 'utf8')), rc: r.status, all };
}

/**
 * Restore the pre-cure double read on a scratch copy. Lives in SCRIPTS/ because
 * both guards import './corpus-tree.mjs' relatively — s2265's trap (C): a copy away
 * from its imports dies MODULE_NOT_FOUND having never run, and an arm that reads
 * that as "0 reads" passes for the wrong reason.
 */
function preCure(name) {
  const needle = 'frozenTreeCheck(ROOT, statusText, ';
  const src = readFileSync(path.join(SCRIPTS, name + '.mjs'), 'utf8');
  assert.ok(src.includes(needle), `variantOf: the anchor is absent from ${name} — the edit matched NOTHING, so this arm would test a file it never modified (s2264)`);
  const out = path.join(SCRIPTS, '.s2271-precure-' + name + '.mjs');
  writeFileSync(out, src.replace(needle, "frozenTreeCheck(ROOT, fs.readFileSync(statusPath, 'utf8'), "));
  variants.push(out);
  // The first draft of this helper replaced the CALL PREFIX rather than the
  // argument, producing `const frozen = fs.readFileSync(...)'desk-birth-guard');`
  // — a SYNTAX ERROR. The variant then read STATUS.md zero times and the arm
  // failed with 0 !== 2. That is s2264's trap ("a variant that no longer
  // CONSTRUCTS is indistinguishable from a guard with teeth") arriving as a wrong
  // COUNT instead of a false pass, and it is why asserting the needle MATCHED is
  // not enough: assert the variant still PARSES AND RUNS.
  const syntax = spawnSync('node', ['--check', out], { encoding: 'utf8' });
  assert.equal(syntax.status, 0,
    `the manufactured variant does not parse, so it tests nothing:\n${syntax.stderr}`);
  return out;
}

test.after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
  for (const v of variants) rmSync(v, { force: true });
});

test('1. desk-birth-guard reads STATUS.md exactly ONCE on the path that consumes it', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-birth-guard.mjs'), wt, path.dirname(wt));
  assert.match(r.all, /linked worktree/, 'the fixture must reach frozenTreeCheck, or the count proves nothing');
  assert.equal(r.n, 1, `read STATUS.md ${r.n}x — the verdict and the freshness check must share one read`);
});

test('2. desk-declaration-guard reads STATUS.md exactly ONCE on the path that consumes it', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-declaration-guard.mjs'), wt, path.dirname(wt));
  assert.match(r.all, /linked worktree/, 'the fixture must reach frozenTreeCheck, or the count proves nothing');
  assert.equal(r.n, 1, `read STATUS.md ${r.n}x — the desk and the freshness check must share one read`);
});

test('3. REVERSE CONTROL — desk-carryforward-guard, which always had the cured structure, still reads ONCE', () => {
  const { wt } = build();
  const r = reads(path.join(SCRIPTS, 'desk-carryforward-guard.mjs'), wt, path.dirname(wt));
  assert.equal(r.n, 1, `read STATUS.md ${r.n}x — the sibling this cure was copied FROM must not regress`);
});

test('4. TEETH — the pre-cure desk-birth-guard reads STATUS.md TWICE', () => {
  const { wt } = build();
  const v = preCure('desk-birth-guard');
  const r = reads(v, wt, path.dirname(wt));
  assert.equal(r.n, 2, 'restoring the second read must be VISIBLE to this instrument, or arm 1 is decoration');
});

test('5. TEETH — the pre-cure desk-declaration-guard reads STATUS.md TWICE', () => {
  const { wt } = build();
  const v = preCure('desk-declaration-guard');
  const r = reads(v, wt, path.dirname(wt));
  assert.equal(r.n, 2, 'restoring the second read must be VISIBLE to this instrument, or arm 2 is decoration');
});

test('6. INSTRUMENT VALIDITY — the counter counts, so a 0 cannot be mistaken for a pass', () => {
  const { root, wt } = build();
  const dir = path.dirname(wt);
  const probe = path.join(dir, 'probe.mjs');
  writeFileSync(probe, [
    "import fs from 'node:fs';",
    "import path from 'node:path';",
    "const p = path.join(process.cwd(), 'STATUS.md');",
    'for (let i = 0; i < 3; i += 1) fs.readFileSync(p, "utf8");',
    "console.log('probe read it three times');",
  ].join('\n'));
  const shim = counterShim(dir);
  const countFile = path.join(dir, 'count.probe.txt');
  const r = spawnSync('node', ['-r', shim, probe], {
    cwd: root, encoding: 'utf8', env: { ...process.env, S2271_COUNT_FILE: countFile },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(Number(readFileSync(countFile, 'utf8')), 3,
    'the shim under-counted a known number of reads — every other arm in this file is then unsound');
});

test('7. the cure is behaviour-neutral — both guards still REFUSE from a frozen worktree', () => {
  const { wt } = build();
  for (const name of ['desk-birth-guard', 'desk-declaration-guard']) {
    const r = spawnSync('node', [path.join(SCRIPTS, name + '.mjs')], { cwd: wt, encoding: 'utf8' });
    const all = (r.stdout ?? '') + (r.stderr ?? '');
    assert.equal(r.status, 2, `${name}: ${all}`);
    assert.match(all, /REFUSING/, name);
    // F-2210-1: assert the WORD, not merely the exit code.
    assert.doesNotMatch(r.stdout ?? '', /PASS —/, name);
  }
});
