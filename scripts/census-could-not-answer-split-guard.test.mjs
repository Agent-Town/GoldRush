// Guard for the `could-not-answer` SPLIT in scripts/modified-tracked-evidence-census.mjs
// (F-2617-1).
//
// WHY THIS EXISTS. The census correctly refuses to answer about a worktree that has lost
// its `.git`, and prints that refusal as `could-not-answer (N)` followed by a few paths —
// F-2485-1's rule that an error is never "nothing here". What the bucket could not say is
// WHICH KIND of unreadable tree each one is, and the two kinds have opposite consequences:
//
//   HOLLOW  — the reaper took the files too. Nothing to lose, and the refusal is academic.
//   HOLDING — the tree lost `.git` but KEPT evidence files. No instrument reads these:
//             the census refuses (no index), `untracked-evidence-durability` is MAIN-scoped
//             by design, and `--all-trees` hits the same missing `.git`.
//
// Measured s2617 on the live board: 24 could-not-answer trees, 19 HOLLOW and 5 HOLDING,
// the 5 carrying 1,874 evidence files. Every path in that list reads as `/tmp` scratch, so
// a reader correctly infers "reaped corpses, nothing there" — right for 19, wrong for 5.
//
// The gap is NOT fixable inside the census's own question: its population is "modified
// TRACKED", which needs an index the tree no longer has. So the cure is a DECLARATION plus
// the runnable remedy, not a new verdict — and this guard pins both, because a declaration
// nobody is sent to read is a declaration the factory does not have (F-2449-1), and an
// un-annotated cure can silently undo itself (F-1667-1).
//
// RESTRAINT, pinned by two reverse controls: a gitless registered worktree is a LAWFUL,
// routine state — it is what a finished heat leaves behind — so this must DECLARE and never
// REFUSE. A red on the normal state is excused into uselessness inside a week (F-1460-1,
// the `cross-engine` fate).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'modified-tracked-evidence-census.mjs');

// Every sync spawn is BOUNDED with SIGKILL: spawnSync blocks the event loop, so
// `--test-timeout` can never fire on a wedged child (F-2429-1 / F-2430-1).
const BOUND = { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20 };

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, ...BOUND, stdio: ['pipe', 'pipe', 'pipe'] });
  assert.equal(r.status, 0, 'fixture git failed: ' + args.join(' ') + ' :: ' + (r.stderr || ''));
  return r.stdout;
}

function runCli(root) {
  const r = spawnSync('node', [SUBJECT, '--root', root], { cwd: root, ...BOUND });
  return { status: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

/**
 * A fixture repo with registered worktrees, some of which have lost their `.git` FILE
 * while staying REGISTERED — which is exactly the live condition, because the
 * registration lives in the MAIN gitdir, not in the tree.
 */
function fixture(opts = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'gr-cna-split-'));
  const root = join(dir, 'main');
  mkdirSync(root, { recursive: true });
  git(['init', '-q', '-b', 'main'], root);
  git(['config', 'user.email', 'g@example.com'], root);
  git(['config', 'user.name', 'guard'], root);
  // The per-tree control requires tracked files, else an empty modified list is a failed
  // read wearing a clean answer's clothes.
  //
  // ⚠️  THE TRACKED FILE MUST NOT SIT UNDER AN EVIDENCE PREFIX. `git worktree add` checks
  // the commit out into EVERY tree, so a tracked `artifacts/committed.txt` gives every
  // worktree one evidence file and NO tree can ever be HOLLOW — the fixture would then
  // measure a board on which the discriminator is unreachable, and arms 6 and 11 would
  // fail for a reason having nothing to do with the subject. Caught by this guard's own
  // first run; it is F-2358-1's rule that a fixture must hold ONLY the subject.
  writeFileSync(join(root, 'README.md'), 'fixture\n');
  writeFileSync(join(root, 'src.txt'), 'not evidence\n');
  git(['add', '-A'], root);
  git(['commit', '-qm', 'fixture base'], root);

  const made = {};
  for (const [name, spec] of Object.entries(opts.trees ?? {})) {
    const wt = join(dir, name);
    git(['worktree', 'add', '-q', '-b', 'wt-' + name, wt], root);
    if (spec.gitless) {
      // Remove ONLY the tree's .git file. The registry entry survives — the whole point.
      rmSync(join(wt, '.git'), { recursive: true, force: true });
    }
    if (spec.evidence) {
      const ev = join(wt, 'artifacts', 'survivors');
      mkdirSync(ev, { recursive: true });
      for (let i = 0; i < spec.evidence; i++) {
        writeFileSync(join(ev, 'shot-' + i + '.png'), Buffer.alloc(1024, i));
      }
    }
    if (spec.emptyEvidenceDir) {
      mkdirSync(join(wt, 'artifacts', 'reaped', 'deeper'), { recursive: true });
    }
    made[name] = wt;
  }
  return { dir, root, trees: made, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// ---------------------------------------------------------------------------
// 1. the helper is EXPORTED, so the declaration's own logic is reachable to a test
//    rather than only admired through the CLI (F-2209-1 cuts both ways).
// ---------------------------------------------------------------------------
test('1. evidenceFileCount is exported', async () => {
  const mod = await import(SUBJECT);
  assert.equal(typeof mod.evidenceFileCount, 'function', 'evidenceFileCount must be exported');
});

// ---------------------------------------------------------------------------
// 2. HOLLOW: evidence DIRECTORIES that survive with no files in them read as zero.
//    That is F-2607-1's skeleton shape and it must not be confused with a failed walk.
// ---------------------------------------------------------------------------
test('2. an evidence directory holding no files counts zero, and is NOT null', async () => {
  const { evidenceFileCount } = await import(SUBJECT);
  const dir = mkdtempSync(join(tmpdir(), 'gr-cna-hollow-'));
  try {
    mkdirSync(join(dir, 'artifacts', 'reaped', 'deeper'), { recursive: true });
    const c = evidenceFileCount(dir);
    assert.notEqual(c, null, 'a readable but fileless tree is an ANSWER of zero, not a failed read');
    assert.equal(c.files, 0);
    assert.equal(c.bytes, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// 3. HOLDING: surviving files are counted, with their bytes.
// ---------------------------------------------------------------------------
test('3. surviving evidence files are counted with their bytes', async () => {
  const { evidenceFileCount } = await import(SUBJECT);
  const dir = mkdtempSync(join(tmpdir(), 'gr-cna-holding-'));
  try {
    mkdirSync(join(dir, 'artifacts', 'a', 'b'), { recursive: true });
    mkdirSync(join(dir, 'reviews', 'shots-x'), { recursive: true });
    writeFileSync(join(dir, 'artifacts', 'a', 'one.png'), Buffer.alloc(100));
    writeFileSync(join(dir, 'artifacts', 'a', 'b', 'two.png'), Buffer.alloc(200));
    writeFileSync(join(dir, 'reviews', 'shots-x', 'three.png'), Buffer.alloc(300));
    // NOT under a declared prefix: the selector names only the places we thought of
    // (F-2389-1), and this asserts the selector is actually applied.
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'ignored.ts'), Buffer.alloc(9999));
    const c = evidenceFileCount(dir);
    assert.equal(c.files, 3, 'three evidence files across two prefixes');
    assert.equal(c.bytes, 600, 'bytes are summed from the evidence files only');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// 4. SYMLINKS ARE SKIPPED. node_modules in these trees is a symlink INTO main, so
//    following it counts MAIN's files as the tree's — F-2607-1 paid for this one with a
//    reversed headline, and the arm exists so the lesson cannot be un-learned silently.
// ---------------------------------------------------------------------------
test('4. a symlinked directory is NOT followed — it would count another tree', async () => {
  const { evidenceFileCount } = await import(SUBJECT);
  const dir = mkdtempSync(join(tmpdir(), 'gr-cna-symlink-'));
  try {
    const elsewhere = join(dir, 'elsewhere');
    mkdirSync(elsewhere, { recursive: true });
    for (let i = 0; i < 20; i++) writeFileSync(join(elsewhere, 'other-' + i + '.png'), Buffer.alloc(50));
    mkdirSync(join(dir, 'tree', 'artifacts'), { recursive: true });
    writeFileSync(join(dir, 'tree', 'artifacts', 'mine.png'), Buffer.alloc(10));
    symlinkSync(elsewhere, join(dir, 'tree', 'artifacts', 'linked'));
    const c = evidenceFileCount(join(dir, 'tree'));
    assert.equal(c.files, 1, 'only the tree\'s OWN file is counted, never the symlink target\'s 20');
    assert.equal(c.bytes, 10);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// 5. A FAILED WALK RETURNS null, NEVER ZERO. This is the polarity of the whole lineage
//    from F-2217-1 on: an empty bucket is the shape of good news, so a broken read must
//    fail toward NOTICING.
// ---------------------------------------------------------------------------
test('5. an unreadable evidence directory returns null, not a zero', async () => {
  const { evidenceFileCount } = await import(SUBJECT);
  const dir = mkdtempSync(join(tmpdir(), 'gr-cna-unreadable-'));
  try {
    const ev = join(dir, 'artifacts');
    mkdirSync(ev, { recursive: true });
    writeFileSync(join(ev, 'hidden.png'), Buffer.alloc(10));
    chmodSync(ev, 0o000);
    // Under a root runner chmod 000 does not deny, so the arm would assert nothing.
    // Skipping LOUDLY beats a pass that measured nothing.
    const probe = evidenceFileCount(dir);
    if (probe !== null && probe.files === 1) {
      console.log('SKIP arm 5: this process can read a 0o000 directory (root?) — nothing asserted');
      chmodSync(ev, 0o755);
      return;
    }
    assert.equal(probe, null, 'a tree whose evidence dir cannot be walked is UNVERIFIABLE, not empty');
    chmodSync(ev, 0o755);
  } finally {
    try { chmodSync(join(dir, 'artifacts'), 0o755); } catch {}
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// 6. THE CALL SITE. The split prints, with both counts — and it prints even when every
//    could-not-answer tree is HOLLOW, because a declaration that appears only when the
//    news is bad re-creates the ambiguity it removes (F-2208-1).
// ---------------------------------------------------------------------------
test('6. the split declaration prints, and prints on the all-hollow path too', () => {
  const f = fixture({ trees: { hollow1: { gitless: true, emptyEvidenceDir: true }, live1: {} } });
  try {
    const r = runCli(f.root);
    assert.match(r.out, /could-not-answer \(1\)/, 'the fixture must actually produce one unreadable tree');
    assert.match(r.out, /SPLIT BY WHAT SURVIVED/, 'the split must print');
    assert.match(r.out, /HOLLOW\s+1 tree\(s\)/, 'the hollow count must print on the all-hollow path');
    assert.match(r.out, /HOLDING\s+0 tree\(s\)/, 'a zero HOLDING count must be stated, not omitted');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 7. A HOLDING tree is NAMED with its file count — a bucket total nobody can act on is
//    an alarm with no remedy (F-2449-1).
// ---------------------------------------------------------------------------
test('7. a gitless tree that still holds evidence is named with its count', () => {
  const f = fixture({ trees: { keeper: { gitless: true, evidence: 4 }, live1: {} } });
  try {
    const r = runCli(f.root);
    assert.match(r.out, /HOLDING\s+1 tree\(s\)/, 'the holding tree must be counted');
    assert.match(r.out, /4 file\(s\)/, 'its surviving file count must print');
    assert.match(r.out, /keeper/, 'the tree must be named, not merely tallied');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 8. THE REMEDY IS AT THE SITE, and it is runnable. F-2451-1: an alarm whose remedy lives
//    only in a law surface is an alarm the reader cannot act on.
// ---------------------------------------------------------------------------
test('8. the remedy names the two runnable git commands beside the alarm', () => {
  const f = fixture({ trees: { keeper: { gitless: true, evidence: 2 }, live1: {} } });
  try {
    const r = runCli(f.root);
    assert.match(r.out, /REMEDY/, 'a HOLDING count must carry its remedy');
    assert.match(r.out, /git hash-object --stdin-paths/, 'the remedy must be runnable, not a gesture');
    assert.match(r.out, /git cat-file --batch-check/);
    assert.match(r.out, /rev-list --objects --remotes/, 'origin-reachability is the bucket that decides');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 9. REVERSE CONTROL — no noise on a clean board. An always-on block across a board with
//    nothing unreadable is the noise that decays a declaration into a formality.
// ---------------------------------------------------------------------------
test('9. REVERSE CONTROL: with nothing unreadable, neither the bucket nor the split prints', () => {
  const f = fixture({ trees: { live1: {}, live2: {} } });
  try {
    const r = runCli(f.root);
    assert.doesNotMatch(r.out, /could-not-answer \([1-9]/, 'the fixture must have nothing unreadable');
    assert.doesNotMatch(r.out, /SPLIT BY WHAT SURVIVED/, 'the split must not print when the bucket is empty');
    assert.doesNotMatch(r.out, /REMEDY/, 'no remedy without an alarm');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 10. REVERSE CONTROL — DECLARE, DO NOT REFUSE. A gitless registered worktree holding
//     evidence is lawful; turning this into a red would fire on the routine state and be
//     excused into uselessness inside a week (F-1460-1).
// ---------------------------------------------------------------------------
test('10. REVERSE CONTROL: a HOLDING tree declares and does not refuse', () => {
  const f = fixture({ trees: { keeper: { gitless: true, evidence: 3 }, live1: {} } });
  try {
    const r = runCli(f.root);
    assert.equal(r.status, 0, 'a HOLDING tree must not red the instrument — it is a lawful state');
    assert.doesNotMatch(r.out, /⛔ CANNOT VERIFY/, 'the tool answers about the trees it CAN read');
    assert.match(r.out, /HOLDING\s+1 tree\(s\)/, 'and still declares the holding tree');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 11. The two populations are distinguished IN ONE RUN. A split that is only ever
//     exercised all-hollow or all-holding never proves it discriminates.
// ---------------------------------------------------------------------------
test('11. hollow and holding are separated within a single board', () => {
  const f = fixture({
    trees: {
      hollow1: { gitless: true, emptyEvidenceDir: true },
      keeper: { gitless: true, evidence: 5 },
      live1: {},
    },
  });
  try {
    const r = runCli(f.root);
    assert.match(r.out, /could-not-answer \(2\)/, 'two unreadable trees');
    assert.match(r.out, /HOLLOW\s+1 tree\(s\)/);
    assert.match(r.out, /HOLDING\s+1 tree\(s\)/);
    assert.match(r.out, /5 file\(s\)/, 'the holding tree keeps its own count');
    assert.doesNotMatch(r.out, /hollow1.*file\(s\)/, 'the hollow tree is not listed as carrying evidence');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 12. F-2634-1 — THE FORWARD POINTER MUST SIT *ABOVE* THE SPLIT IT NAMES. Arms 6-11
//     all assert the split's CONTENT and are blind to its POSITION: measured s2634 the
//     live output is 65 lines with the DESK FIGURE at 16 and the split at 42-64, so a
//     `head -40` returns a CORRECT desk figure and silently cuts the alarm. This arm is
//     the only one that fails if the pointer is moved below the block, which is the
//     defect F-2606-1 cured on this tool's sibling and never reached here.
// ---------------------------------------------------------------------------
test('12. the forward pointer prints ABOVE the split block it names', () => {
  const f = fixture({ trees: { keeper: { gitless: true, evidence: 4 }, live1: {} } });
  try {
    const r = runCli(f.root);
    const pointer = r.out.indexOf('DO NOT STOP HERE');
    const split = r.out.indexOf('SPLIT BY WHAT SURVIVED');
    assert.notEqual(pointer, -1, 'a board with a HOLDING tree must carry the forward pointer');
    assert.notEqual(split, -1, 'control: the split itself must be present, else this proves nothing');
    assert.ok(pointer < split, `the pointer must precede the split it names (pointer ${pointer}, split ${split})`);
    // And it must survive the truncation that motivated it: the desk figure and the
    // pointer together, with the split still below.
    const desk = r.out.indexOf('THE DESK FIGURE');
    assert.ok(desk !== -1 && desk < pointer, 'the pointer follows the desk figure a truncating reader came for');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 13. The pointer carries the FIGURES, not a bare "look below". A reader who truncates
//     is a reader in a hurry; an actionable number is what stops them (F-2449-1 — an
//     alarm whose remedy the reader cannot act on is a formality).
// ---------------------------------------------------------------------------
test('13. the forward pointer names the count and the bytes it is protecting', () => {
  const f = fixture({ trees: { keeper: { gitless: true, evidence: 7 }, live1: {} } });
  try {
    const r = runCli(f.root);
    const line = r.out.split('\n').find((l) => l.includes('DO NOT STOP HERE')) ?? '';
    assert.match(line, /1 unreadable tree\(s\)/, 'the pointer states how many trees');
    const figures = r.out.slice(r.out.indexOf('DO NOT STOP HERE'));
    assert.match(figures, /7 file\(s\)/, 'and the file count it is protecting');
    assert.match(figures, /MB/, 'and the bytes');
  } finally {
    f.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 14. REVERSE CONTROL — the pointer is GATED ON THE SECTION EXISTING. The tempting
//     over-general cure is an always-on pointer, which on an all-hollow or fully-readable
//     board names a `SPLIT BY WHAT SURVIVED` block that is never emitted — sending a
//     reader to the bottom for nothing, which is how a declaration decays into noise
//     (F-2208-1's boundary, the same one arm 9 draws for the split itself).
// ---------------------------------------------------------------------------
test('14. REVERSE CONTROL: no pointer when there is nothing unreadable, nor when all-hollow', () => {
  const clean = fixture({ trees: { live1: {}, live2: {} } });
  try {
    const r = runCli(clean.root);
    assert.doesNotMatch(r.out, /DO NOT STOP HERE/, 'a fully readable board must not point anywhere');
    assert.match(r.out, /THE DESK FIGURE/, 'control: the run really produced its report');
  } finally {
    clean.cleanup();
  }
  const hollowOnly = fixture({ trees: { hollow1: { gitless: true, emptyEvidenceDir: true }, live1: {} } });
  try {
    const r = runCli(hollowOnly.root);
    assert.match(r.out, /HOLLOW\s+1 tree\(s\)/, 'control: the board really is all-hollow');
    assert.doesNotMatch(r.out, /DO NOT STOP HERE/, 'nothing is held, so there is nothing to point at');
  } finally {
    hollowOnly.cleanup();
  }
});
