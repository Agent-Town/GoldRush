#!/usr/bin/env node
/**
 * dry-board-probe.mjs — answers scripts/fire.md §2F in ONE command:
 * "is there a drain in tasks/done/ that I am about to walk past?"
 *
 * WHY THIS EXISTS (F-2207-1, s2207 — the fourth instance of F-2204-1's class)
 * -------------------------------------------------------------------------
 * §2F has had its subject-selection rule guessed wrong TWICE, by two fires that
 * were each being careful:
 *
 *   s1061  found `art-batch-roster-e9` UNDRAINED FOR 28 HOURS after s1057-s1060
 *          each honestly reported "no drain exists" off `ls -1t | head`. Closed
 *          done-moves are RENAMED with a prefix, and a rename re-stamps the file,
 *          so every closed entry sorts ABOVE every undrained one. The probe could
 *          not fail loudly. (F-2205-1)
 *   s2206  cured the fold by deriving the window as a DATE rather than a
 *          `tail -30` guess -- correctly -- but validated the cure only over
 *          BARE-DATED files. (F-2206-1)
 *
 * F-2207-1 is the residue of that second cure. §2F's filter reads
 * "bare-dated AND date >= 20260725", which is complete over bare-dated files and
 * BLIND to every prefixed one. That is safe only if every prefix asserts a
 * terminal state -- and 5 of the 13 prefixes in the live corpus do NOT:
 *
 *     TERMINAL (581): drained 327 · shipped 149 · stopped 82 · noop 16 ·
 *                     superseded 3 · rejected 2 · duplicate 1 · reverted 1
 *     NOT      ( 11): held 6 · blocked 2 · OWNER 1 · partial 1 · ready 1
 *
 * Those 11 are exactly where a deferred drain would hide, and two of them say so
 * in their own filenames:
 *
 *   held-s2125-owner-fork-f2125-1-...-e10s-1b-ember-shore-schema-and-data.md
 *       -- the ONLY live undrained slice on the board at s2207 (lane/a ahead=1,
 *          7 held paths, gate-side blocked by F-2165-1)
 *   ready-for-gates-s1330-UNDRAINED-7c4f132f-leaf-blocked-...
 *       -- carries the word UNDRAINED in its name and is invisible to §2F
 *
 * Cost at s2207: ZERO. All 11 resolved merged/closed/blocked, so the board really
 * was dry. Stated plainly because that is the honest reading -- and because a
 * probe that is right by luck and cannot be wrong out loud is precisely the one
 * that costs you 28 hours the day the luck runs out.
 *
 * THE FIX IS TO INVERT THE TEST, WHICH IS THE ONLY PART THAT GENERALISES
 * ---------------------------------------------------------------------
 * §2F enumerates what to LOOK AT. This enumerates what to SKIP -- the terminal
 * tokens below -- and probes everything else. So a prefix nobody has invented yet
 * lands in the subject set rather than in the blind spot: it fails SAFE where the
 * prose form fails BLIND. The convention-start date is likewise DERIVED from the
 * corpus (the earliest date embedded in any prefixed done-move) instead of pinned,
 * so it never needs re-measuring by hand -- F-2206-1's own principle, applied to
 * the half it did not reach.
 *
 * ADVISORY BY DEFAULT (exit 0), by the drain-block-check UNKNOWN precedent: this
 * reports, it does not gate. `--strict` exits 1 on a real drain and 2 on an
 * UNKNOWN -- the same two codes, meaning the same two things, as the tool whose
 * precedent this cites. READ THE WORD, not just the code (the lane-usable rule).
 *
 * UNKNOWN IS NOT A CLEARANCE. drain-block-check exits 0 for "no goal leaf
 * matches", which is the ledger DECLINING TO ANSWER, not permission. Those are
 * bucketed separately here and each one owes the s1061 file probe: read the
 * master, list the artifacts it claims, ask `git ls-files` for them on main.
 *
 * F-2208-1 (s2208): that paragraph was true of the BUCKETING and false of the
 * EXIT CODE for this script's whole first day. `--strict` mapped only the drain
 * arm to a non-zero code, so the middle verdict -- printed in this script's own
 * words as "NO DRAIN FOUND, but N UNKNOWN(s) owe a file probe BEFORE YOU MAY SAY
 * DRY" -- exited 0, byte-identical to the earned "✅ DRY". In the one mode whose
 * entire purpose is to turn the verdict into an exit code, "you have not earned
 * this word" and "the word is earned" were the same answer. Measured on the live
 * board at s2208: 3 UNKNOWNs present, `--strict` rc=0.
 *
 * It is F-1597-1's shape surviving the cure that names it, one more time: a
 * branch falling through to an affirmative-looking clearance. F-2097-1 drew the
 * general rule -- WHEN YOU CURE A FALL-THROUGH, ASK WHICH OTHER CHECKS SIT
 * BEHIND THE SAME EARLY EXIT. Here the fall-through and the cure were in one
 * file, nine tests apart.
 *
 * The nine guard tests missed it by construction: every one exercised
 * selectSubjects/bucketOf, and the decision lived inline in main() where no test
 * could reach it. `exitCodeFor` is exported for exactly the reason the two
 * functions above are -- so the arm that decides can be exercised, not admired.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Leading tokens that assert a done-move reached a terminal state -- it either
 * reached main or was abandoned. Anything else is a subject.
 * DO NOT add a token here to quieten output: a token belongs here only if its
 * presence PROVES no drain is owed. When in doubt, leave it out -- an extra
 * probe costs one second, a missed drain costs a day.
 */
export const TERMINAL_TOKENS = new Set([
  'drained',
  'shipped',
  'stopped',
  'noop',
  'superseded',
  'rejected',
  'duplicate',
  'reverted',
]);

/**
 * A done-move stamp is YYYYMMDD-HHMMSS. Eight digits alone is NOT enough to
 * identify one: this corpus is full of NUMERIC SHORT HASHES in the same shape
 * and the same position --
 *     shipped-09102598-20260727-133154-lane-055-standard-note-assertion...
 *     drained-s1243-15505222-20260730-051923-ret-01-run-log-recoverability...
 * -- so a naive /(\d{8})-\d{6}/ reads `09102598` as the year 0910 and drags the
 * derived convention boundary back to prehistory. That is not hypothetical: it
 * is what this script did on its first live run, turning a 32-subject board into
 * a 562-subject one. Validate the calendar, not just the digit count.
 */
const STAMP = /(?<![0-9])(20\d{2})(\d{2})(\d{2})-\d{6}(?![0-9])/g;

function plausibleDate(y, m, d) {
  const year = Number(y); const mon = Number(m); const day = Number(d);
  return year >= 2024 && year <= 2099 && mon >= 1 && mon <= 12 && day >= 1 && day <= 31;
}

/** The leading YYYYMMDD of a bare-dated done-move, or null. */
export function bareDate(name) {
  const m = name.match(/^(20\d{2})(\d{2})(\d{2})-/);
  return m && plausibleDate(m[1], m[2], m[3]) ? m[1] + m[2] + m[3] : null;
}

/** The earliest CALENDAR-PLAUSIBLE stamp embedded anywhere in a name, or null. */
export function embeddedDate(name) {
  let best = null;
  for (const m of name.matchAll(STAMP)) {
    if (!plausibleDate(m[1], m[2], m[3])) continue;
    const d = m[1] + m[2] + m[3];
    if (best === null || d < best) best = d;
  }
  return best;
}

/**
 * Pure subject selection. Exported so the guard can exercise it without spawning
 * drain-block-check over the whole corpus.
 *
 * @param {string} root repo root (or a fixture root) containing tasks/done/
 * @returns {{subjects: string[], conventionStart: string|null, skippedLegacy: string[],
 *            skippedTerminal: string[], tokens: Record<string, number>, total: number}}
 */
/**
 * F-2222-1 (s2222). WHICH TREE is this corpus a checkout OF?
 *
 * Six fires built discriminators for a corpus that is ABSENT (F-2218-1),
 * UNREADABLE (F-2217-1), CRASHED (F-2211-1) or EMPTY (F-2215-1). None of them can
 * see a corpus that is present, readable, complete-looking and STALE -- and a
 * LINKED WORKTREE is exactly that: `tasks/done` is TRACKED, so every worktree
 * holds a checkout of it frozen at whatever commit that lane sits on. Measured
 * s2222: worktrees/lane-c holds 154 done-moves against main's 1,353, and the
 * probe printed "✅ DRY -- every subject resolves merged or closed. The word is
 * earned." at rc=0, with F-2217-1's own declaration line affirmatively reading
 * `read`. The cure that was built to stop the s1061 banner CERTIFIED it, because
 * it discriminates readable-from-unreadable and not right-corpus-from-wrong-one.
 *
 * s2217 named this hazard in its own handoff and left it open ("a stale TRACKED
 * subset ... the defence remains 'run it from the repo root'"). This closes it.
 *
 * The test is exact and cheap: a LINKED worktree's gitdir is
 * <main>/.git/worktrees/<name> while --git-common-dir still resolves to the MAIN
 * .git. Equal => the main worktree OR ANY SUBDIRECTORY OF IT, which is correct
 * and must NOT be flagged (that is the over-general cure -- it would refuse from
 * `scripts/`, and s2221's near-catastrophic reverse control is the standing
 * warning about anchoring helpers one level too general).
 *
 * spawnSync, not execFileSync: it reports by RETURN VALUE and never throws
 * (s2216), so the discriminator reads a status rather than a caught exception.
 * Exit 128 is git's "not a repository" -- LAWFUL here, because the pre-existing
 * fixture-rooted tests (F-2209-1's CLI arms) build non-git temp roots and must
 * keep asserting exactly what they always asserted. Only a git that could not
 * ANSWER is 'tree-unverifiable'.
 *
 * @returns {{tree: 'main'|'linked-worktree'|'tree-unverifiable', detail: string}}
 */
function corpusTree(root) {
  const opts = { cwd: root, encoding: 'utf8', timeout: 10000 };
  const ask = (args) => spawnSync('git', args, opts);
  const gitDir = ask(['rev-parse', '--absolute-git-dir']);
  if (gitDir.status === 128) return { tree: 'main', detail: '' }; // not a repo: a fixture root
  if (gitDir.status !== 0) {
    return { tree: 'tree-unverifiable', detail: String(gitDir.error?.code || `git rev-parse exit ${gitDir.status}`) };
  }
  const common = ask(['rev-parse', '--path-format=absolute', '--git-common-dir']);
  if (common.status !== 0) {
    return { tree: 'tree-unverifiable', detail: String(common.error?.code || `git rev-parse exit ${common.status}`) };
  }
  const a = (gitDir.stdout || '').trim();
  const b = (common.stdout || '').trim();
  if (!a || !b) return { tree: 'tree-unverifiable', detail: 'git rev-parse returned empty' };
  if (a === b) return { tree: 'main', detail: '' };
  return { tree: 'linked-worktree', detail: `the board lives in ${path.dirname(b)}` };
}

export function selectSubjects(root) {
  const dir = path.join(root, 'tasks', 'done');
  let names = [];
  // F-2217-1. This handler used to return the empty selection with no way for a
  // caller to tell "the corpus is clean" from "the corpus was never read" -- and
  // an empty subject set drives every bucket to zero, so `main()` printed
  // "✅ DRY ... The word is earned." at rc=0 in BOTH modes. That is the s1061
  // incident reproduced inside the tool built to prevent it, one layer further IN
  // than F-2211-1 reached: F-2209-1 crossed to the exit code, F-2210-1 to stdout,
  // F-2211-1 to the CAPTURE -- this is the ENUMERATION, where the subject set is
  // empty because the read failed rather than because the board is clean.
  //
  // `corpus` is a STRING for F-2212-1's reason: any careless truthiness test at a
  // call site coerces 'unreadable' to TRUE, i.e. toward NOTICING rather than
  // toward silently declaring dry. Fail-safe by construction, not by discipline.
  try {
    names = fs.readdirSync(dir).filter((n) => n.endsWith('.md'));
  } catch (err) {
    return {
      subjects: [], conventionStart: null, skippedLegacy: [],
      skippedTerminal: [], tokens: {}, total: 0,
      corpus: 'unreadable', corpusDetail: String(err?.code || err?.message || err),
    };
  }

  const prefixed = names.filter((n) => bareDate(n) === null);

  // DERIVED, never pinned: the convention starts the day the first prefixed
  // done-move was written. Before that date, bare-dating carries no signal at
  // all (every file is bare), so those entries are genuine legacy.
  let conventionStart = null;
  for (const n of prefixed) {
    const d = embeddedDate(n);
    if (d !== null && (conventionStart === null || d < conventionStart)) conventionStart = d;
  }

  const tokens = {};
  for (const n of prefixed) {
    const t = n.split('-')[0];
    tokens[t] = (tokens[t] ?? 0) + 1;
  }

  const subjects = [];
  const skippedLegacy = [];
  const skippedTerminal = [];

  for (const n of names) {
    const d = bareDate(n);
    if (d !== null) {
      // A bare-dated file is a subject only once the prefix convention exists to
      // give bare-dating meaning. With no prefixed file anywhere, nothing is legacy.
      if (conventionStart === null || d >= conventionStart) subjects.push(n);
      else skippedLegacy.push(n);
      continue;
    }
    if (TERMINAL_TOKENS.has(n.split('-')[0].toLowerCase())) skippedTerminal.push(n);
    else subjects.push(n); // non-terminal OR unrecognised -> probe it. Fails safe.
  }

  subjects.sort();
  // F-2222-1. The dir read FINE; the question left is whether it is the right dir.
  // Counts are still reported (seeing "154" against main's 1,353 is the whole
  // tell), but the verdict is refused below -- a stale subset of the board can
  // never earn the word.
  const tree = corpusTree(root);
  return {
    subjects, conventionStart, skippedLegacy, skippedTerminal, tokens, total: names.length,
    corpus: tree.tree === 'main' ? 'read' : tree.tree, corpusDetail: tree.detail,
  };
}

/**
 * A verdict drain-block-check actually PRINTED, as opposed to text that merely
 * contains a verdict word. F-2211-1: the distinction is the whole finding.
 */
export const VERDICT_MARKER = /⛔|✅ CLEAR|\? UNKNOWN/;

/**
 * Reduce one drain-block-check invocation to the text that may be CLASSIFIED --
 * and refuse to classify a CRASH as a verdict.
 *
 * F-2211-1 (measured s2211). drain-block-check exits 1 for every "do not drain"
 * verdict, so the catch below is not an edge case: it is the path EVERY closed
 * and blocked subject on the live board travels (8 of 8 at s2211, verdict on
 * stdout, stderr empty). An uncaught exception ALSO exits 1, so the exit code
 * cannot tell a verdict from a crash -- only the content can.
 *
 * The trap is that node writes the THROWING SOURCE LINE into stderr, and
 * drain-block-check's own source carries the verdict literals it prints (⛔ at
 * :365/:493/:525/:533/:624, "? UNKNOWN" at :429). So folding stderr into the
 * classified text lets a crash be read as the verdict whose line it died on.
 * Measured on scratch copies, subject truth = A REAL DRAIN in every arm:
 *
 *   throw on the "⛔ CLOSED" line   -> classified 'closed'  -> "✅ DRY ... earned"
 *   throw on the "⛔ BLOCKED" line  -> classified 'closed'  -> "✅ DRY ... earned"
 *   throw on the "? UNKNOWN" line   -> classified 'unknown' -> "owe a file probe"
 *   throw on a status="merged" line -> classified 'merged'  -> "✅ DRY ... earned"
 *   CONTROL: throw on a line with no verdict literal -> 'drain' -> "⛔ NOT DRY"
 *
 * Three of four print the s1061 banner on a board the classifier never read.
 * Only the CONTROL is fail-safe -- and it is the one parameterisation s2210
 * happened to hit when it recorded this catch as "loud in both directions".
 *
 * The cure is to classify from STDOUT ONLY. bucketOf('') is 'drain', so a crash
 * falls out loud by construction rather than by luck.
 *
 * @param {{stdout?: string, stderr?: string, failed: boolean}} cap
 * @returns {{text: string, crashed: boolean, detail: string}}
 */
export function classifiableCapture(cap) {
  const stdout = cap.stdout ?? '';
  if (!cap.failed || VERDICT_MARKER.test(stdout)) {
    return { text: stdout, crashed: false, detail: '' };
  }
  const detail = (cap.stderr ?? '').split('\n').map((l) => l.trim())
    .find((l) => /^[A-Za-z]*Error\b/.test(l)) ?? 'exited non-zero with no verdict on stdout';
  return { text: '', crashed: true, detail };
}

/** Bucket one drain-block-check result. UNKNOWN is deliberately NOT a clearance. */
export function bucketOf(output) {
  if (/UNKNOWN/.test(output)) return 'unknown';
  if (/⛔|DO NOT DRAIN/.test(output)) return 'closed';
  if (/status="merged"/.test(output)) return 'merged';
  return 'drain';
}

/**
 * The verdict, as an exit code. Pure and exported so the guard can exercise the
 * arm that DECIDES -- F-2208-1: for this script's first day the decision sat
 * inline in main(), and all nine tests asserted the bucketing instead.
 *
 * Codes match drain-block-check, whose precedent this script's header cites:
 *   1 = a real drain (the definite bad thing)
 *   2 = the ledger declines to answer; a file probe is owed before "dry"
 *   0 = advisory mode, or a genuinely earned "dry"
 *
 * @param {{drain: unknown[], unknown: unknown[]}} buckets
 * @param {boolean} strict
 */
// F-2217-1: `corpus` defaults to 'read' so the four F-2208-1 tests that call this
// with two arguments keep asserting exactly what they always asserted. An
// unreadable corpus is 2 = "could not answer", never 1 = "answered, and the
// answer refuses" -- the convention drain-block-check, master-shipped-classifier
// and review-evidence-audit already carry. It outranks every bucket verdict
// because when the corpus was never read, the buckets are not evidence at all.
export function exitCodeFor(buckets, strict, corpus = 'read') {
  if (!strict) return 0;
  if (corpus !== 'read') return 2;
  if (buckets.drain.length) return 1;
  if (buckets.unknown.length) return 2;
  return 0;
}

function main() {
  const root = process.cwd();
  const strict = process.argv.includes('--strict');
  const sel = selectSubjects(root);

  console.log('dry-board-probe — scripts/fire.md §2F, in one command (F-2207-1)\n');
  // F-2217-1: declared ALWAYS, including the happy path. A declaration that
  // appears only on failure re-creates the very ambiguity it removes (F-2208-1).
  // F-2222-1 extends this line's domain. It stays a SINGLE always-printed
  // declaration rather than a new field, so a reader who learned to check one
  // line still checks one line.
  const corpusLabel = {
    read: 'read',
    unreadable: `UNREADABLE (${sel.corpusDetail})`,
    'linked-worktree': `LINKED WORKTREE — STALE CHECKOUT (${sel.corpusDetail})`,
    'tree-unverifiable': `TREE UNVERIFIABLE (${sel.corpusDetail})`,
  }[sel.corpus] ?? `UNRECOGNISED (${sel.corpus})`;
  console.log(`  corpus tasks/done/      : ${corpusLabel}`);
  console.log(`  done-moves (.md)        : ${sel.total}`);
  console.log(`  prefix convention start : ${sel.conventionStart ?? '(none — no prefixed file)'}  [DERIVED, not pinned]`);
  console.log(`  skipped, legacy         : ${sel.skippedLegacy.length}  (bare-dated before the convention existed)`);
  console.log(`  skipped, terminal prefix: ${sel.skippedTerminal.length}`);
  console.log(`  SUBJECTS to classify    : ${sel.subjects.length}\n`);

  const nonTerminal = Object.entries(sel.tokens)
    .filter(([t]) => !TERMINAL_TOKENS.has(t.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);
  if (nonTerminal.length) {
    console.log('  non-terminal prefixes in the subject set (F-2207-1 — invisible to §2F\'s prose filter):');
    for (const [t, c] of nonTerminal) console.log(`    ${String(c).padStart(4)} · ${t}`);
    console.log('');
  }

  const buckets = { merged: [], closed: [], unknown: [], drain: [] };
  const crashed = [];
  for (const f of sel.subjects) {
    let cap;
    try {
      cap = {
        failed: false,
        stdout: execFileSync('node', [path.join(root, 'scripts', 'drain-block-check.mjs'), f],
          { encoding: 'utf8', cwd: root }),
      };
    } catch (e) {
      // NOT an edge case: rc=1 is how every "do not drain" verdict arrives.
      cap = { failed: true, stdout: e.stdout, stderr: e.stderr };
    }
    const { text, crashed: isCrash, detail } = classifiableCapture(cap);
    if (isCrash) crashed.push(`${f}  [${detail}]`);
    buckets[bucketOf(text)].push(f);
  }

  const label = {
    merged: 'MERGED (shipped-but-unrenamed ghost — cosmetic)',
    closed: 'CLOSED / BLOCKED — do not drain',
    unknown: 'UNKNOWN — the ledger declines to answer; each owes the s1061 FILE PROBE',
    drain: 'REAL DRAINS — work you were about to walk past',
  };
  for (const k of ['drain', 'unknown', 'closed', 'merged']) {
    console.log(`  ${label[k]}: ${buckets[k].length}`);
    if (k === 'merged') continue;
    for (const f of buckets[k]) console.log(`      ${f}`);
  }

  console.log('');
  if (crashed.length) {
    // F-2211-1: name them. They are counted as drains so the verdict fails safe,
    // but a fire sent to file-probe a file whose CLASSIFIER broke would be
    // investigating the wrong subject entirely.
    console.log(`  ⚠️  CLASSIFIER CRASHED on ${crashed.length} subject(s) — counted as drains, NOT as verdicts:`);
    for (const c of crashed) console.log(`      ${c}`);
    console.log('');
  }
  if (sel.corpus === 'linked-worktree') {
    // F-2222-1. The buckets are not empty because the board is clean -- they are
    // empty because this is a STALE CHECKOUT of the board. Cured at the BANNER,
    // not merely at the exit code: advisory is the mode §2F prescribes, and there
    // the verdict travels on stdout alone (F-2210-1).
    console.log('  ⛔ CANNOT VERIFY — this is a LINKED WORKTREE, not the board.');
    console.log(`     tasks/done/ is TRACKED, so this is a checkout of the board frozen at`);
    console.log(`     whatever commit this worktree sits on — ${sel.total} done-move(s) here.`);
    console.log(`     ${sel.corpusDetail}. Re-run from there; §2F means the board, not a lane.`);
  } else if (sel.corpus === 'tree-unverifiable') {
    console.log(`  ⛔ CANNOT VERIFY — could not establish which tree this corpus belongs to`);
    console.log(`     (${sel.corpusDetail}). A stale worktree checkout is indistinguishable`);
    console.log('     from the board until this is answered, so no verdict is offered.');
  } else if (sel.corpus !== 'read') {
    // F-2217-1. The buckets are all empty, but they are empty because the corpus
    // was never read -- NOT because the board is clean. Printing the earned-DRY
    // banner here is the s1061 incident, and in advisory mode (the mode §2F
    // prescribes) stdout is the ONLY channel a caller reads, so this must be
    // cured at the banner and not merely at the exit code (F-2210-1).
    console.log(`  ⛔ CANNOT VERIFY — tasks/done/ was unreadable (${sel.corpusDetail}).`);
    console.log('     This is NOT a dry board. Check your cwd: `main()` roots itself at');
    console.log('     process.cwd(), so running this by absolute path from elsewhere reads');
    console.log('     a directory that has no tasks/done/ and finds nothing by construction.');
  } else if (buckets.drain.length) {
    console.log(`  ⛔ NOT DRY — ${buckets.drain.length} undrained done-move(s). Do not declare §2F.`);
  } else if (buckets.unknown.length) {
    console.log(`  ⚠️  NO DRAIN FOUND, but ${buckets.unknown.length} UNKNOWN(s) owe a file probe before you may say "dry".`);
  } else {
    console.log('  ✅ DRY — every subject resolves merged or closed. The word is earned.');
  }
  console.log('\n  Advisory: this reads tasks/done/ only. A lane branch can hold unabsorbed');
  console.log('  content with no done-move at all — ask `node scripts/lane-usable.mjs --all` too.');

  process.exit(exitCodeFor(buckets, strict, sel.corpus));
}

// NOTE: compare via pathToFileURL, never a `file://${argv[1]}` template. This
// repo's own root contains a space ("Gold Rush"), which import.meta.url encodes
// as %20 -- the template form silently never matches and the CLI prints nothing.
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
