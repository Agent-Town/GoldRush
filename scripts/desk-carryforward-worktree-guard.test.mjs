/**
 * F-2232-1 — desk-carryforward-guard must not certify a FROZEN tree.
 *
 * Both corpora it reads (STATUS.md, tasks/BACKLOG.md) are TRACKED, so a linked
 * worktree hands it a board frozen at that lane's commit. The two desks then
 * compare self-consistently against each other (F-2230-2) and it prints PASS
 * about a handoff that is not the one on main.
 *
 * MEASURED s2232 by manufacturing the defect, ground truth = a real silent drop
 * on main: repo root -> FAIL rc=1 naming the id; linked worktree branched one
 * commit earlier -> "PASS — every item on the previous desk is carried, closed,
 * or accounted for." at rc=0, BYTE-IDENTICAL on stdout AND rc to a genuinely
 * clean board. This is a chained bare leg of test:ledger-guards, so the false
 * green lands in a GATE, in the permissive direction, in its default mode.
 *
 * THE FIXTURE SHIPS ITS GROUND TRUTH IN A CORPUS THAT ACTUALLY GOES STALE
 * (s2223's rule): the drop is introduced on main AFTER the worktree branches, so
 * the worktree's STATUS.md genuinely predates it. Planting it anywhere git can
 * still reach from inside the worktree would prove nothing.
 *
 * REVERSE CONTROLS ARE THE POINT. The over-general cure — refusing in ANY linked
 * worktree — passes every defect arm and reds the LAW: §3.0b mandates gating in
 * a detached worktree and this guard is chained in that battery (F-1460-1).
 * Arms 5 and 6 exist to catch exactly that, and arm 7 to catch treating git's
 * lawful exit 128 as a failure, which would red every legacy non-git fixture.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { corpusTree } from './desk-carryforward-guard.mjs';

const GUARD = fileURLToPath(new URL('./desk-carryforward-guard.mjs', import.meta.url));

const BACKLOG = `# BACKLOG
🔺 **F-AAA-1** first thing the owner must rule on. GATE: owner ruling.
🔺 **F-BBB-1** second thing the owner must rule on. GATE: owner ruling.
`;

const deskBoth = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-AAA-1** first item. 🔺 **F-BBB-1** second item.";
const deskDropped = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-AAA-1** first item.";

const h1 = `Last updated: 2026-08-20T10:00Z s1001 handoff, lock CLEARED — first. ${deskBoth}`;
const h2 = `Last updated: 2026-08-21T10:00Z s1002 handoff, lock CLEARED — second. ${deskBoth}`;
const h3 = `Last updated: 2026-08-22T10:00Z s1003 handoff, lock CLEARED — drops one silently. ${deskDropped}`;
const lock = `Last updated: 2026-08-22T11:00Z ACTIVE (s1004 fire) — working.`;

function statusText(line1, archives) {
  return [line1, ...archives.map((a) => `- **s${a.n} handoff (line-1 archive):** ${a.line}`), '', '## body'].join('\n');
}

function run(cwd, extra = []) {
  const r = spawnSync(process.execPath, [GUARD, ...extra], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: String(r.stdout || ''), err: String(r.stderr || '') };
}

/** A scratch git repo: main carries the silent drop; `wt` branched before it. */
function buildRepo({ dropOnMain = true, worktreeLine1 = null } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'f2232-'));
  const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git(['init', '-q', '-b', 'main']);
  git(['config', 'user.email', 'f@f']);
  git(['config', 'user.name', 'f']);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks/BACKLOG.md'), BACKLOG);
  writeFileSync(path.join(root, 'STATUS.md'), statusText(h2, [{ n: 1001, line: h1 }]));
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'clean']);

  const wt = path.join(root, 'wt');
  git(['worktree', 'add', '-q', '-b', 'lane', wt]);

  if (dropOnMain) {
    writeFileSync(path.join(root, 'STATUS.md'), statusText(h3, [{ n: 1002, line: h2 }, { n: 1001, line: h1 }]));
    git(['add', '-A']);
    git(['commit', '-q', '-m', 'silent drop']);
  }
  if (worktreeLine1) {
    // make the worktree's line-1 match main's exactly — the lawful merged-gate shape
    writeFileSync(path.join(wt, 'STATUS.md'), worktreeLine1);
  }
  return { root, wt, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function plainRoot(line1, archives) {
  const root = mkdtempSync(path.join(tmpdir(), 'f2232p-'));
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks/BACKLOG.md'), BACKLOG);
  writeFileSync(path.join(root, 'STATUS.md'), statusText(line1, archives));
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

// ---------------------------------------------------------------- defect arms

test('1. a frozen linked worktree REFUSES rather than passing on a stale board', () => {
  const f = buildRepo();
  try {
    const r = run(f.wt);
    // validity (s2227's form): assert the arm REACHED the branch under test,
    // not merely that it produced bytes.
    assert.match(r.out, /corpus tree\s+: linked-worktree/, 'arm never classified the tree');
    assert.equal(r.rc, 2, 'a frozen tree must refuse with 2 = "could not answer"');
    assert.match(r.err, /REFUSING/);
    assert.match(r.err, /linked worktree/);
    assert.doesNotMatch(r.out, /PASS —/, 'must not certify a board it never read');
  } finally { f.cleanup(); }
});

test('2. the same board from the MAIN worktree still FAILS loudly and names the id', () => {
  const f = buildRepo();
  try {
    const r = run(f.root);
    assert.match(r.out, /corpus tree\s+: main/);
    assert.equal(r.rc, 1, 'a real silent drop is answered, not refused');
    assert.match(r.err, /F-BBB-1/);
  } finally { f.cleanup(); }
});

test('3. the refusal is distinguishable from a clean board on BOTH channels', () => {
  const f = buildRepo();
  const c = plainRoot(h2, [{ n: 1001, line: h1 }]);
  try {
    const frozen = run(f.wt);
    const clean = run(c.root);
    assert.equal(clean.rc, 0);
    assert.match(clean.out, /PASS —/);
    assert.notEqual(frozen.rc, clean.rc, 'pre-cure these were byte-identical');
    assert.notEqual(frozen.out, clean.out);
  } finally { f.cleanup(); c.cleanup(); }
});

// ------------------------------------------------------------- reverse controls

test('4. a genuinely clean MAIN worktree still PASSES', () => {
  const f = buildRepo({ dropOnMain: false });
  try {
    const r = run(f.root);
    assert.match(r.out, /corpus tree\s+: main/);
    assert.equal(r.rc, 0);
    assert.match(r.out, /PASS —/);
  } finally { f.cleanup(); }
});

test('5. REVERSE CONTROL — a linked worktree whose line-1 MATCHES main must NOT refuse', () => {
  // This is the law-mandated detached gate worktree (§3.0b): a merged tree
  // carries main's STATUS.md unchanged, because lane tasks are firewalled from
  // it. A blanket linked-worktree refusal would red the mandated drain gate.
  const f = buildRepo({ dropOnMain: false });
  try {
    const mainStatus = execFileSync('git', ['-C', f.root, 'show', 'main:STATUS.md'], { encoding: 'utf8' });
    writeFileSync(path.join(f.wt, 'STATUS.md'), mainStatus);
    const r = run(f.wt);
    assert.match(r.out, /corpus tree\s+: linked-worktree/, 'arm never reached the linked-worktree branch');
    assert.equal(r.rc, 0, 'the lawful detached gate must not be redded (F-1460-1)');
    assert.match(r.out, /PASS —/);
  } finally { f.cleanup(); }
});

test('6. REVERSE CONTROL — a live ACTIVE lock still SKIPs from a linked worktree', () => {
  // A SKIP asserts nothing, so it cannot hide a drop; refusing here would red
  // every lane worktree that happens to hold a lock line.
  const f = buildRepo({ dropOnMain: false });
  try {
    writeFileSync(path.join(f.wt, 'STATUS.md'), statusText(lock, [{ n: 1002, line: h2 }, { n: 1001, line: h1 }]));
    const r = run(f.wt);
    assert.equal(r.rc, 0);
    assert.match(r.out, /SKIP —/);
    assert.doesNotMatch(r.err, /REFUSING/);
  } finally { f.cleanup(); }
});

test('7. REVERSE CONTROL — git exit 128 (not a repo) is LAWFUL, not a failure', () => {
  // Every legacy fixture in this family builds a non-git temp root.
  const c = plainRoot(h2, [{ n: 1001, line: h1 }]);
  try {
    const r = run(c.root);
    assert.match(r.out, /corpus tree\s+: no-git/);
    assert.equal(r.rc, 0);
    assert.match(r.out, /PASS —/);
  } finally { c.cleanup(); }
});

test('8. a subdirectory of the MAIN worktree is still main, and is not flagged', () => {
  const f = buildRepo({ dropOnMain: false });
  try {
    assert.equal(corpusTree(path.join(f.root, 'tasks')), 'main');
    assert.equal(corpusTree(f.root), 'main');
    assert.equal(corpusTree(f.wt), 'linked-worktree');
  } finally { f.cleanup(); }
});

test('9. the corpus tree is declared ALWAYS, including on the happy path', () => {
  // F-2208-1: a declaration that appears only on failure re-creates the
  // ambiguity it removes.
  const c = plainRoot(h2, [{ n: 1001, line: h1 }]);
  try {
    const r = run(c.root);
    assert.match(r.out, /^corpus tree\s+: /m, 'no declaration on a passing run');
  } finally { c.cleanup(); }
});

test('10. exit 128 maps to no-git, and that conflation is deliberate', () => {
  // git exits 128 both for "not a repository" and for "cannot chdir there", so
  // this mapping cannot tell them apart. That is SAFE here and the reason is
  // reachability, not indifference: main() refuses at its existsSync check on
  // STATUS.md/BACKLOG.md before corpusTree is ever called, so a nonexistent
  // root cannot reach this function in the shipped path. Asserted rather than
  // assumed, so a future refactor that moves the existsSync check has to face
  // this comment.
  assert.equal(corpusTree('/nonexistent-path-f2232'), 'no-git');
  const c = plainRoot(h2, [{ n: 1001, line: h1 }]);
  try {
    const r = run(c.root, ['--root', path.join(c.root, 'nope')]);
    assert.equal(r.rc, 2, 'an unreadable root refuses before the tree question');
    assert.match(r.err, /cannot read/);
  } finally { c.cleanup(); }
});
