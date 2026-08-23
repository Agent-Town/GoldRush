/**
 * F-2241-1 — the desk family's two `npm run` legs must not certify a frozen tree.
 *
 * WHY THIS EXISTS. F-2232-1 gave desk-carryforward-guard the corpusTree
 * discriminator and closed its census with "THE FIVE BARE LEGS ARE NOW ALL
 * ACCOUNTED FOR ... the next rung is NOT another tree question". That census key
 * was INVOCATION SYNTAX — legs invoked BARE in test:ledger-guards. Six more legs
 * of the SAME battery are reached through `npm run` aliases, and two of them
 * (desk-declaration-guard, desk-birth-guard) are process.cwd()-rooted members of
 * the SAME family reading the SAME two tracked corpora. They were invisible to
 * the key, so they never got the cure, and the "closed" verdict told the next
 * fire to stop looking.
 *
 * PROVEN BY MANUFACTURING, not by a green (s2241). Ground truth = main carries a
 * REAL defect; a worktree branched one commit earlier printed
 *   desk-declaration-guard : "PASS — every non-grandfathered desk item has a
 *                             declaring row." rc=0, BYTE-IDENTICAL on stdout,
 *                             stderr AND rc to a genuinely clean board
 *   desk-birth-guard       : "PASS — every owner-gated row filed this window
 *                             reached the desk." rc=0, same verdict line and rc
 *                             as a clean board
 * — and F-2227-2's banked reading habit tells a fire to trust exactly that word.
 *
 * The fixture ships its ground truth in a corpus that ACTUALLY GOES STALE
 * (s2223's rule): the defect lands on main AFTER the worktree branches.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, appendFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { corpusTree } from './corpus-tree.mjs';
import { corpusTree as viaCarryforward } from './desk-carryforward-guard.mjs';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const roots = [];

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(args.join(' ') + ': ' + r.stderr);
  return r;
}

function guard(name, cwd) {
  const r = spawnSync('node', [path.join(SCRIPTS, name + '.mjs')], { cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '', all: (r.stdout ?? '') + (r.stderr ?? '') };
}

const HANDOFF = (n, ids) =>
  `Last updated: 2026-08-23T0${n}:00Z s100${n} handoff, lock CLEARED — work landed. ` +
  `🔺 **OWNER'S DESK — ${ids.length} awaiting a word.** ` + ids.map((i) => `🔺 **${i}**`).join(' · ');

/**
 * scenario 'declaration' -> a desk item main added with NO declaring row
 * scenario 'birth'       -> an owner-gated row main filed that never reached the desk
 * scenario 'clean'       -> no defect at all (the reverse control)
 */
function build(scenario) {
  const root = mkdtempSync(path.join(tmpdir(), 's2241-' + scenario + '-'));
  roots.push(root);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'f@x');
  git(root, 'config', 'user.name', 'f');
  const BL = path.join(root, 'tasks', 'BACKLOG.md');
  // STATUS.md is line-1 plus the §4 archive bullets. The bullets are not
  // decoration here: desk-carryforward-guard reads the PREVIOUS desk from them,
  // and without one it refuses for lack of history — a refusal that looks exactly
  // like the frozen-tree one this suite is about (caught by arm 7 on first run).
  const archive = [];
  let prevLine1 = null;
  const status = (t) => {
    if (prevLine1) {
      archive.unshift(`- **s${1000 + archive.length + 1} handoff (line-1 archive):** ${prevLine1}`);
    }
    prevLine1 = t;
    writeFileSync(path.join(root, 'STATUS.md'), [t, ...archive].join('\n') + '\n');
  };

  status(HANDOFF(1, ['F-AAA-1']));
  writeFileSync(BL, '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1001 handoff: base');

  // TWO handoffs before the branch point: desk-birth-guard's window is
  // [previous handoff .. HEAD], so a one-commit worktree refuses for lack of
  // history — a FIXTURE artifact that would masquerade as the cure working.
  status(HANDOFF(2, ['F-AAA-1']));
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1002 handoff: still clean');

  const wt = path.join(root, 'wt');
  git(root, 'worktree', 'add', '-q', '-b', 'lane', wt);

  if (scenario === 'declaration') {
    status(HANDOFF(3, ['F-AAA-1', 'F-BBB-1']));           // desked, never declared
  } else if (scenario === 'birth') {
    status(HANDOFF(3, ['F-AAA-1']));
    appendFileSync(BL, '\n🔺 **F-BBB-1 (s1003)** — a real fork. GATE: closes on owner ruling.\n');
  } else {
    status(HANDOFF(3, ['F-AAA-1']));
  }
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 's1003 handoff: ' + scenario);
  return { root, wt };
}

test.after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

// ---------------------------------------------------------------- declaration
test('1. desk-declaration-guard FAILS on main when a desk item has no declaring row', () => {
  const { root } = build('declaration');
  const r = guard('desk-declaration-guard', root);
  assert.equal(r.rc, 1, r.all);
  assert.match(r.all, /no declaring row/);
  assert.match(r.all, /F-BBB-1/);
});

test('2. desk-declaration-guard REFUSES from a frozen worktree — it must not print PASS', () => {
  const { wt } = build('declaration');
  const r = guard('desk-declaration-guard', wt);
  assert.equal(r.rc, 2, r.all);
  assert.match(r.all, /REFUSING/);
  assert.match(r.all, /linked worktree/);
  // The defect this guard exists for: the WORD, not merely the exit code (F-2210-1).
  assert.doesNotMatch(r.out, /PASS —/);
});

test('3. desk-declaration-guard still PASSES on a genuinely clean main (reverse control)', () => {
  const { root } = build('clean');
  const r = guard('desk-declaration-guard', root);
  assert.equal(r.rc, 0, r.all);
  assert.match(r.out, /PASS —/);
});

// ---------------------------------------------------------------------- birth
test('4. desk-birth-guard FAILS on main when an owner-gated row never reached the desk', () => {
  const { root } = build('birth');
  const r = guard('desk-birth-guard', root);
  assert.equal(r.rc, 1, r.all);
  assert.match(r.all, /F-BBB-1/);
});

test('5. desk-birth-guard REFUSES from a frozen worktree — it must not print PASS', () => {
  const { wt } = build('birth');
  const r = guard('desk-birth-guard', wt);
  assert.equal(r.rc, 2, r.all);
  assert.match(r.all, /REFUSING/);
  assert.doesNotMatch(r.out, /PASS —/);
  // VALIDITY (s2227): the arm must have reached the WINDOW, not refused for lack
  // of history. A refusal for the wrong reason is this fixture's known trap.
  assert.doesNotMatch(r.all, /no PREVIOUS handoff/);
});

test('6. desk-birth-guard still PASSES on a genuinely clean main (reverse control)', () => {
  const { root } = build('clean');
  const r = guard('desk-birth-guard', root);
  assert.equal(r.rc, 0, r.all);
  assert.match(r.out, /PASS —/);
});

// ------------------------------------------------- the F-1460-1 restraint arm
test('7. a worktree whose line-1 MATCHES main must NOT refuse — §3.0b mandates gating there', () => {
  // This is the lawful merged-gate-tree shape: lane work is firewalled from
  // STATUS.md, so the gate tree carries main's line-1 unchanged. A blanket
  // linked-worktree refusal would red the law-mandated drain gate and be excused
  // into uselessness inside a week (F-1460-1, the `cross-engine` fate).
  const { root, wt } = build('clean');
  git(wt, 'merge', '-q', 'main', '-m', 'merge main into the gate tree');
  for (const name of ['desk-declaration-guard', 'desk-birth-guard', 'desk-carryforward-guard']) {
    const r = guard(name, wt);
    // VALIDITY FIRST (s2227): the arm must have REACHED a verdict. A refusal for
    // some other reason would satisfy the message assertion below while proving
    // nothing — which is exactly what this arm did on its first run.
    assert.match(r.out, /PASS —/, name + ' never reached a verdict:\n' + r.all);
    assert.notEqual(r.rc, 2, name + ' refused on a LAWFUL gate tree:\n' + r.all);
    assert.doesNotMatch(r.all, /linked worktree and its STATUS.md/, name);
  }
});

// --------------------------------------------------- one implementation, not four
test('8. the desk family shares ONE corpusTree implementation (F-2227-1)', () => {
  // Not "they agree today" — the SAME function object. Independently-maintained
  // copies of one predicate is HOW this family drifted in the first place.
  assert.equal(corpusTree, viaCarryforward);
});

test('9. corpusTree reads a subdirectory of the MAIN worktree as main, not linked', () => {
  // The macOS realpath case: git answers --git-dir ABSOLUTE (/private/var/...)
  // and --git-common-dir RELATIVE (../.git), which resolve to /var/... — the same
  // directory through a symlink, unequal as strings. Caught by F-2232-1's arm 8.
  const { root, wt } = build('clean');
  assert.equal(corpusTree(root), 'main');
  assert.equal(corpusTree(path.join(root, 'tasks')), 'main');
  assert.equal(corpusTree(wt), 'linked-worktree');
});

test('10. git exit 128 is LAWFUL (no-git), never a refusal', () => {
  // Every legacy fixture in this family builds a non-git temp root; treating 128
  // as a failure would red them all.
  assert.equal(corpusTree('/nonexistent-path-f2241'), 'no-git');
  const bare = mkdtempSync(path.join(tmpdir(), 's2241-nogit-'));
  roots.push(bare);
  mkdirSync(path.join(bare, 'tasks'), { recursive: true });
  writeFileSync(path.join(bare, 'STATUS.md'), HANDOFF(1, ['F-AAA-1']) + '\n');
  writeFileSync(path.join(bare, 'tasks', 'BACKLOG.md'),
    '# BACKLOG\n\n🔺 **F-AAA-1 (s1001)** — declared. GATE: none.\n');
  const r = guard('desk-declaration-guard', bare);
  assert.equal(r.rc, 0, r.all);
  assert.match(r.out, /PASS —/);
});

test('11. the declaration is printed on the happy path too (F-2208-1)', () => {
  // A declaration that appears only on failure re-creates the ambiguity it
  // removes — and it is what separates "I read main" from "I read something".
  const { root } = build('clean');
  for (const name of ['desk-declaration-guard', 'desk-birth-guard']) {
    const r = guard(name, root);
    assert.match(r.out, /corpus tree\s*:\s*main/, name + ':\n' + r.all);
  }
});
