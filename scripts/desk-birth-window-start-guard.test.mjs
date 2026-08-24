#!/usr/bin/env node
/**
 * desk-birth-window-start-guard.test.mjs — F-2260-1.
 *
 * desk-birth-guard's PASS says "every owner-gated row filed THIS WINDOW reached
 * the desk". F-2259-1 cured the parser that decides which ROWS enter that claim.
 * This guard covers the selector one level up: the one that decides which COMMITS
 * the rows are drawn from at all.
 *
 * THE DEFECT. `previousHandoffCommit()` took "the second entry whose subject
 * matches /^s\d+ handoff/". That is not the previous FIRE's handoff. A fire that
 * re-runs the battery after a correction emits a SECOND commit whose subject also
 * matches (`sNNNN handoff addendum:` / `amendment:` / `correction:`), so the
 * window start lands on THIS fire's own earlier handoff and collapses to the
 * minutes between them. `owner-gated rows filed` then reads 0 and the guard
 * prints PASS — accurately, about a set it built too small.
 *
 * MEASURED over all 2,226 matching commits: 83 of 2,136 sessions emit more than
 * one, and replayed at each such fire's FINAL matching commit the start lands on
 * the SAME fire 83 times out of 83. 8 of the last 30 fires did it.
 *
 * PROVEN BY MANUFACTURING, not by a green (arm 1): a fixture whose ground truth
 * is an UNDESKED owner fork filed in the window returns
 * `PASS — every owner-gated row filed this window reached the desk` at rc=0 under
 * the pre-cure selector, byte-identical in verdict and rc to a genuinely clean
 * board. Under the cure it FAILS and names the id.
 *
 * SEVERITY IS LATENT AND IS NOT INFLATED: replaying both windows across all 83,
 * the correct window sees more rows in 3 and produces ZERO new FAIL verdicts.
 * Nothing has ever been missed. What was missing is the guarantee.
 *
 * TEETH — every variant manufactured on a scratch copy, and each over-general
 * cure is caught by exactly the reverse control built for it:
 *
 *     PRE-CURE verbatim              reds 1, 2, 3, 4, 7, 8
 *     refuse on ANY skip             reds 1, 2, 4, 5, 7   <- arm 5 is its control
 *     PARTIAL (declare, do not skip) reds 1, 2, 4, 7, 8
 *     off-by-one (skip only one)     reds 4, 7, 8
 *     declare only on failure        reds 2, 3
 *     unconditional skip advisory    reds 6 ALONE         <- arm 6 is its control
 *
 * THE PRE-CURE RED IS PRICED HONESTLY AND NOT REPORTED AS A HEADLINE: of its six,
 * only THREE are SUBSTANTIVE detections of the defect — arm 1 and arm 4 (a
 * collapsed window PASSES over an undesked owner fork) and arm 8 (it proceeds
 * where it should refuse). Arms 2, 3 and 7 red because the always-on declaration
 * is absent entirely, which is a real regression signal but is NOT evidence about
 * the collapse.
 *
 * ONE PREDICTION CORRECTED, recorded rather than quietly fixed: this docstring
 * first claimed a single over-general cure would red arms 3, 5 and 6. Measured,
 * that is three DIFFERENT variants reddening three different controls, and no one
 * variant reds all three. The reverse controls repriced the thing I was surest of
 * — the sixth time in eight fires.
 *
 * REACHABILITY AUDIT (s2226): all 8 arms redden under at least one manufactured
 * variant, so none is decoration. Arm 6 reached that status only after a sixth
 * variant was built to reach it — until you try to break an arm, it is
 * indistinguishable from a correct one.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-birth-guard.mjs');

const OWNER_GATE = 'GATE: OWNER decides the fork.';
const DESK = (tail) => `🔺 **OWNER'S DESK — n awaiting a word.** ${tail}`;

test('1 — an ADDENDUM does not collapse the window onto this fire: the undesked row still FAILS', () => {
  // Ground truth: an owner fork filed during s2's run and never desked. Under the
  // pre-cure selector the window is [s2 handoff .. HEAD], whose BACKLOG diff is
  // EMPTY, so the guard printed PASS at rc=0.
  const root = fixture({ row: `🔺 **F-9101-1** the fork. ${OWNER_GATE}`, deskTail: '', addenda: 1 });
  const r = run(root);
  assert.equal(r.rc, 1, 'a collapsed window would have printed PASS over an empty diff');
  assert.match(r.err, /F-9101-1/, 'a count is not a name');
});

test('2 — the window start names the PREVIOUS FIRE, not this one', () => {
  const root = fixture({ row: `🔺 **F-9102-1** the fork. ${OWNER_GATE}`, deskTail: '🔺 **F-9102-1**', addenda: 1 });
  const r = run(root);
  assert.equal(r.rc, 0);
  assert.match(r.out, /window start\s+: \w{8} \(s1 handoff\)/,
    'the always-on declaration must name WHOSE handoff — a bare sha cannot show a collapse');
  assert.doesNotMatch(r.out, /\(s2 handoff\)/, 'the window must not start on this fire');
});

test('3 — an ordinary fire with NO addendum is untouched (reverse control)', () => {
  const root = fixture({ row: `🔺 **F-9103-1** the fork. ${OWNER_GATE}`, deskTail: '🔺 **F-9103-1**', addenda: 0 });
  const r = run(root);
  assert.equal(r.rc, 0);
  assert.match(r.out, /window start\s+: \w{8} \(s1 handoff\)/);
  assert.match(r.out, /owner-gated rows filed\s+: 1/, 'the ordinary window must still see its row');
});

test('4 — MULTIPLE addenda are all skipped, not just the first', () => {
  // s2251 emitted three matching commits. Skipping one would still collapse.
  const root = fixture({ row: `🔺 **F-9104-1** the fork. ${OWNER_GATE}`, deskTail: '', addenda: 2 });
  const r = run(root);
  assert.equal(r.rc, 1);
  assert.match(r.err, /F-9104-1/);
});

test('5 — a genuinely clean board WITH an addendum still PASSES (reverse control)', () => {
  // The over-general cure — refuse whenever anything is skipped — reds here.
  const root = fixture({ row: `🔺 **F-9105-1** the fork. ${OWNER_GATE}`, deskTail: '🔺 **F-9105-1**', addenda: 1 });
  const r = run(root);
  assert.equal(r.rc, 0, 'skipping a same-session commit is routine, not a defect');
  assert.match(r.out, /PASS — every owner-gated row filed this window reached the desk/);
});

test('6 — nothing is declared when nothing was skipped (reverse control)', () => {
  const root = fixture({ row: `🔺 **F-9106-1** the fork. ${OWNER_GATE}`, deskTail: '🔺 **F-9106-1**', addenda: 0 });
  assert.doesNotMatch(run(root).out, /skipped \d+ same-session/,
    'an advisory that fires when there is nothing to advise decays into a formality');
});

test('7 — the skip IS declared when it happens, and says how many', () => {
  const root = fixture({ row: `🔺 **F-9107-1** the fork. ${OWNER_GATE}`, deskTail: '🔺 **F-9107-1**', addenda: 2 });
  const r = run(root);
  assert.match(r.out, /skipped 2 same-session handoff commit\(s\)/);
  assert.match(r.out, /F-2260-1/, 'name the finding so a reader can look it up');
});

test('8 — with NO earlier FIRE at all, it REFUSES rather than passing over nothing', () => {
  // The over-general cure — keep taking handoffs[1] regardless — proceeds here and
  // gates over an empty window, which is the fail-open mode this guard exists for.
  const root = soloSessionFixture();
  const r = run(root);
  assert.equal(r.rc, 2, 'a pass here would mean "I read nothing"');
  assert.match(r.err, /REFUSING/);
});

// --- fixture plumbing -------------------------------------------------------

/**
 * s1 handoff (base) -> s2 handoff (files `row`) -> N s2 addenda touching STATUS
 * only. The addenda carry a handoff line-1 so the guard reaches its verdict
 * branch rather than SKIPping — s2227's trap: a SKIP asserts nothing while
 * satisfying "did the arm produce bytes?".
 */
function fixture({ row, deskTail, addenda }) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 's2260-window-')));
  fs.mkdirSync(path.join(d, 'tasks'));
  const g = (a) => execFileSync('git', a, { cwd: d, encoding: 'utf8' });
  g(['init', '-q', '-b', 'main']);
  g(['config', 'user.email', 'f@x']);
  g(['config', 'user.name', 'fixture']);

  fs.writeFileSync(path.join(d, 'tasks/BACKLOG.md'), '# BACKLOG\n');
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    `Last updated: 2026-01-01T00:00Z s1 handoff, lock CLEARED — base. ${DESK('')}\n`);
  g(['add', '-A']);
  g(['commit', '-qm', 's1 handoff: base']);

  fs.appendFileSync(path.join(d, 'tasks/BACKLOG.md'), `${row}\n`);
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    `Last updated: 2026-01-02T00:00Z s2 handoff, lock CLEARED — window. ${DESK(deskTail)}\n`);
  g(['add', '-A']);
  g(['commit', '-qm', 's2 handoff: window']);

  for (let i = 1; i <= addenda; i++) {
    fs.writeFileSync(path.join(d, 'STATUS.md'),
      `Last updated: 2026-01-02T0${i}:00Z s2 handoff, lock CLEARED — window, correction ${i}. ${DESK(deskTail)}\n`);
    g(['add', 'STATUS.md']);
    g(['commit', '-qm', `s2 handoff addendum: correction ${i}`]);
  }
  return d;
}

/** Every matching commit belongs to one session — there is no previous fire. */
function soloSessionFixture() {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 's2260-solo-')));
  fs.mkdirSync(path.join(d, 'tasks'));
  const g = (a) => execFileSync('git', a, { cwd: d, encoding: 'utf8' });
  g(['init', '-q', '-b', 'main']);
  g(['config', 'user.email', 'f@x']);
  g(['config', 'user.name', 'fixture']);
  fs.writeFileSync(path.join(d, 'tasks/BACKLOG.md'), '# BACKLOG\n');
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    `Last updated: 2026-01-01T00:00Z s2 handoff, lock CLEARED — only. ${DESK('')}\n`);
  g(['add', '-A']);
  g(['commit', '-qm', 's2 handoff: only']);
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    `Last updated: 2026-01-01T01:00Z s2 handoff, lock CLEARED — only, corrected. ${DESK('')}\n`);
  g(['add', 'STATUS.md']);
  g(['commit', '-qm', 's2 handoff addendum: correction']);
  return d;
}

function run(root) {
  const r = spawnSync('node', [GUARD, '--root', root], { encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}
