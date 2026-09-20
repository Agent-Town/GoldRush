#!/usr/bin/env node
// drain-block-check.mjs — answer ONE question before any drain: is this slice ALLOWED to land?
//
// WHY THIS EXISTS (F-1104-7, 2026-07-27): s1104 merged rf-34 (hero-y) onto main although it was
// owner-gated, then had to reverse it in the same fire. Every check that fire ran asked "is it
// READY" — `main..lane/m3` ahead, two-dot diff real, main never moved the file, the runner's
// report sound. All true, and all blind: a policy block is not a property of the tree, so no git
// probe can see it. It lives in `tasks/goals.json` as `status:"blocked"` + `blockedReason`, keyed
// by `taskFile` — which every done-move filename already contains. So it is a LOOKUP, not a
// judgement, and a lookup belongs in a script rather than in a tired reader's discipline.
//
// USAGE
//   node scripts/drain-block-check.mjs <done-move filename | task file | branch | slice id>
//   node scripts/drain-block-check.mjs <task file> --queue # refuse already-shipped work
//   node scripts/drain-block-check.mjs --all          # audit every blocked leaf
//   node scripts/drain-block-check.mjs <arg> --strict # unknown slice becomes a failure too
//
// EXIT CODES
//   0  CLEAR    — a leaf matched and it is neither blocked nor terminal-closed (or --all found
//                 nothing blocked)
//   1  BLOCKED  — DO NOT DRAIN/QUEUE. The reason is printed. Three refusal classes land here: an owner
//                 BLOCK (status="blocked", lifted by the owner only) and a terminal-CLOSED leaf
//                 (status in TERMINAL_CLOSED_STATUSES — the question is dead or parked, so there is
//                 nothing to land; added on the drain path by F-1248-1), plus a new bare citation
//                 in the named master on --queue (F-1311-2).
//   2  UNKNOWN  — no goal leaf matched. Advisory by default (Goal Registration Law says one
//                 should exist, so this is itself a bookkeeping finding); fails under --strict.

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * 'on-branch' | 'detached' | 'no-git' | 'unverifiable' — F-2333-1's detachment half.
 *
 * A LOCAL COPY, and the choice is MEASURED rather than stylistic. F-2227-1 says import the
 * sibling predicate rather than write a copy, and s2333's first draft did exactly that —
 * `import { headDetached } from './corpus-tree.mjs'`. The ledger battery reddened: guard
 * fixtures copy this file into a temp dir by a FIXED LIST (they must not `cpSync` the whole
 * scripts/ tree — F-2284-1), so a new sibling import is ERR_MODULE_NOT_FOUND in 19 of them.
 * Patching 19 hardcoded lists is the "hardcoded list of what git already knows" defect and
 * breaks again for the next importer. This file is deliberately self-contained — which is
 * also why it already carries its own `corpusTree` — so the predicate is inlined and the
 * ANTI-DRIFT duty F-2227-1 really wants is discharged by a guard asserting the copies AGREE,
 * the same shape `desk-lock-predicate-guard` uses for its four-way predicate.
 *
 * Codes MEASURED s2333, not assumed (F-2212-1): non-repo -> 128 · unborn branch -> 0 + a ref
 * (lawful, NOT frozen) · on a branch -> 0 + a ref · detached -> 1 and SILENT · missing path ->
 * status null. 128 stays PERMISSIVE: corpusTree above maps it onto 'main' for fixture roots,
 * so refusing there would red every legacy fixture (F-1460-1, the `cross-engine` fate).
 */
function headDetached(root) {
  const r = spawnSync('git', ['-C', root, 'symbolic-ref', '-q', 'HEAD'], { encoding: 'utf8', timeout: 10000 });
  if (r.error || r.status === null) return 'unverifiable';
  if (r.status === 0 && String(r.stdout).trim()) return 'on-branch';
  if (r.status === 1) return 'detached';
  if (r.status === 128) return 'no-git';
  return 'unverifiable';
}
const GOALS = 'tasks/goals.json';
const BACKLOG = 'tasks/BACKLOG.md';

// F-2223-1 (filed s2223, cured s2224) — EVERY CORPUS THIS TOOL READS IS TRACKED, SO A LINKED
// WORKTREE HANDS IT A BOARD FROZEN AT THAT LANE'S COMMIT AND NOTHING ANYWHERE SAYS SO.
//
// `GOALS` and `BACKLOG` are bare relative paths and `main()` roots at process.cwd(), so from
// `worktrees/lane-c` this file reads that lane's checkout of the ledger. Measured s2224 on the live
// board: `--all` prints "Scanned 594 goal leaves" from the repo root and "Scanned 591" from
// lane-c — IDENTICAL rc, IDENTICAL 7371 bytes, exactly ONE diverging line out of 56.
//
// THE HARM IS NOT THE MISSING COUNT, IT IS THE MISTAKE #8 POLARITY ON THE --queue ARM. Loss is
// monotone (3 leaves present in main, 0 present only in the lane; all 3 status="merged"), and a
// master whose leaf is missing falls to the UNKNOWN branch at :509, which exits 0. Controlled
// experiment, same master, same binary, the ONLY variable being the cwd:
//   c4-assay-queue-index.md --queue   ROOT -> "⛔ ALREADY SHIPPED — DO NOT QUEUE"  rc=1
//   c4-assay-queue-index.md --queue   LANE -> "? UNKNOWN"                          rc=0
// All three delta masters behave identically. So from a lane worktree the guard that exists to stop
// a re-derivation of already-merged work — the 824k Flail, Mistake #8 — hands out a clearance. That
// is F-2222-2's polarity in the OTHER Mistake #8 instrument, and this one is §3.0's FIRST COMMAND OF
// EVERY DRAIN.
//
// LATENT in the prescribed invocation (§3.0 says the repo root, and every verdict this streak has
// read was TRUE — verified, not assumed). But reachability is not exotic: §3.0b MANDATES gating
// undecided content in a detached worktree, so the law itself sends fires into trees where this
// tool goes quiet.
//
// WHY THIS REFUSES WHERE `dispatchCorpus`'s `absent` ONLY DECLARES — the boundary is s2223's and it
// transfers verbatim: an ABSENT corpus can be a lawful routine state, so refusing there gets
// excused into uselessness (F-1460-1, the `cross-engine` fate). A STALE BOARD IS NEVER LAWFUL FOR
// THIS QUESTION. The tool asks "does MAIN's ledger block this?"; a lane's frozen checkout answers a
// different question and reports it as this one.
//
// Values are STRINGS for F-2212-1's reason: a careless truthiness test at a call site coerces every
// failure value to TRUE, i.e. toward REFUSING rather than toward the permissive silence.
//
// `cwd` is process.cwd() and NOT an anchored root, deliberately: this file has no --root flag and
// roots its whole corpus at the working directory, so the question is genuinely about the tree the
// process sits in. (Its sibling `master-shipped-classifier` uses `cwd: root` for the opposite and
// equally deliberate reason — it takes an explicit --root, so the caller NAMES the tree.)
//
// git exit 128 is "not a repository" and is LAWFUL, not a failure: every fixture-rooted test in
// this family builds a bare mkdtemp directory and must keep asserting exactly what it always
// asserted. Only a git that could not ANSWER is 'tree-unverifiable'. spawnSync, not execFileSync:
// it reports by RETURN VALUE and never throws (s2216), so this reads a status rather than relying
// on a catch.
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
  // Equal means the MAIN worktree or any subdirectory of it — correct, and must not be flagged.
  // A linked worktree's gitdir is <main>/.git/worktrees/<name> while --git-common-dir still
  // resolves to the main .git.
  if (a === b) return { tree: 'main', detail: '' };
  return { tree: 'linked-worktree', detail: `the board lives in ${dirname(b)}` };
}

// Filename-level markers. Independent of goals.json on purpose: the done-move rename convention
// ("OWNER-GATED-...-do-not-drain-...") is a second, cheaper line of defence, and a fire that
// renames a file but forgets the leaf should still be stopped.
const FILENAME_BLOCK_MARKERS = [/do-not-drain/i, /OWNER-GATED/i];

// F-1383-1 (s1383). `status:"blocked"` is OVERLOADED across two opposite kinds of refusal, and
// until now the ONLY discriminator was free prose inside blockedReason — so it could be, and was,
// silently omitted. MEASURED s1383 across all 9 blocked leaves: 5 are genuine OWNER forks/banks,
// 3 are fire-recorded readiness HOLDS ("this has not been gated yet"), 1 asserts both. s1381's
// handoff states it flipped "all three" of its leaves to blocked with an explicit
// "GATE-SIDE HOLD, NOT AN OWNER GATE" reason "so the next fire cannot misread them as owner
// forks"; the label actually reached TWO of the three, and the leaf it missed —
// e1-authored-bundle-validation — is the one the next two handoffs each named as the #1 priority
// and "the cheapest real merge on the board". Meanwhile the closing verdict below printed
// "A block is lifted by the OWNER" UNCONDITIONALLY, asserting the owner-only reading on behalf of
// leaves whose own text denied it. That is the [misapplied owner-gate] shape that once cost 19
// days: mis-scoping UP is far more expensive than mis-scoping down, because an owner-gate tag
// halts every fire that reads it and nothing re-checks a parked question.
//
// ⚠️ THIS FIELD CHANGES NO EXIT CODE. Every class below still exits 1 and still refuses the drain.
// It changes only WHO THE READER IS TOLD CAN LIFT IT, which is the thing that was wrong. A
// gate-side hold is lifted by SATISFYING its stated condition and re-registering the leaf in the
// same commit — never by merging first, and never by an owner word that will never come.
// UNCLASSIFIED fails SAFE (treated as owner-fork), so forgetting the field cannot unblock anything.
const BLOCK_CLASS_VERDICTS = {
  'owner-fork': [
    `  blockClass=owner-fork — a block is lifted by the OWNER, never by a green gate`,
    `  battery or a sound runner report. If you believe it is stale, re-verify the`,
    `  leaf and say so in the handoff — do not merge first.`,
  ],
  'gate-side': [
    `  blockClass=gate-side — a FIRE-RECORDED readiness hold, NOT an owner debt. No`,
    `  owner word exists that would lift this one, so carrying it to the desk parks it`,
    `  forever. It still refuses the drain (rc=1): lift it by SATISFYING the condition`,
    `  printed above and re-registering the leaf IN THE SAME COMMIT — not by merging`,
    `  first, and not by a green battery that answers a narrower question than the hold.`,
  ],
  disputed: [
    `  blockClass=disputed — this leaf's OWN reason asserts both an owner gate and a`,
    `  gate-side hold. Treat it as owner-gated (fail-safe) and put the contradiction on`,
    `  the desk for an attended ruling; do not resolve it yourself by picking a reading.`,
  ],
};
const BLOCK_CLASS_UNCLASSIFIED = [
  `  ⚠️ blockClass MISSING — this blocked leaf never declared which kind of refusal it`,
  `  is. Treated as owner-fork (fail-safe), but that is a Goal Registration bookkeeping`,
  `  finding, not a verdict: classify it (owner-fork | gate-side | disputed) in the same`,
  `  commit as whatever you do next, so the next fire is not told an owner owes a word`,
  `  that no owner has ever been asked for.`,
];
const TERMINAL_SHIPPED_STATUSES = new Set(['merged', 'shipped']);
// F-1123-3 (s1123). The two refusal arms below both assume a terminal task LEFT A COMMIT:
// status merged/shipped, or a mergeHash that is an ancestor of main. A master whose question is
// dead but which never merged code has NEITHER — its own run can have been a lawful STOP with a
// byte-identical tree, so there is no hash to refuse it with, and its lifecycle word is the ONLY
// thing that can stop a re-queue. Measured live: cw-02-wrecker-target-premise was overturned at
// source by s1116 and carried down two further layers that BOTH merged, yet `--queue` printed a
// bare ✅ CLEAR — and still did after it was correctly relabelled "superseded", which is how a
// data-only fix would have re-created F-1117-1 under a new spelling.
// Keep this set disjoint from "diagnosed", which is deliberately NON-terminal: it means the
// diagnosis landed and follow-up work is genuinely OWED, so the master must stay queueable
// (calibrate-suite-workers is the live example — s1119 removed its mergeHash on purpose).
const TERMINAL_CLOSED_STATUSES = new Set(['superseded', 'void', 'abandoned', 'stopped']);

// The "why" of a CLOSED leaf has no agreed key, and only `blocked` is schema-forced to carry one
// (goal-tracker.test.mjs:82 asserts blockedReason; nothing asserts a stop reason). Measured s1248
// across the six status:"stopped" leaves on main, the reason lived under FIVE different spellings —
// stopNote, stoppedReason, stoppedNote_s1216, drainNotes, note_s1205 — and plain `reason` was
// undefined on all six. So read every spelling we have seen rather than minting a sixth, and say
// plainly when there is none: a refusal that cannot state its cause teaches the next fire nothing.
const CLOSED_REASON_KEYS = ['closedReason', 'stoppedReason', 'stopNote', 'supersededBy', 'reason', 'drainNotes'];

// F-1249-1. The adhoc arm below used to be `/^(stopped|stop|closed)Note/i` — anchored to the SUFFIX
// stem of the single session-stamped spelling s1248 happened to hold (stoppedNote_s1216), so it missed
// every sibling that varies the STEM instead. Measured s1249 against the live tree: 3 of the 15
// terminal-closed leaves printed "(no reason recorded on the leaf ...)" and ALL THREE carried the why
// ON the leaf — supersededNote_s1116 ("ITS 2a VERDICT IS OVERTURNED"), drainNote_s1170 + note_s1170,
// and autosprite-trial-gate's title (the owner's verbatim canning, quoted with its date). Zero were
// genuinely silent, so the old sentence was not a hedge: it was a false claim about the object this
// script had just parsed, and about two files it never opened. It cost real work — s1248 read that
// silence over autosprite-trial-gate and escalated "a money-gated item has been quietly moved off
// Robin's desk" to the next fire, which is the alarm s1249 opened by refuting.
// Match by reason-ish stem ANYWHERE in the key name, and rank closure-specific stems first so
// `supersededNote_s1116` outranks a generic `note`.
const REASON_ISH_KEY = /(note|reason|why|outcome|verdict)/i;
const CLOSURE_STEM_KEY = /(superseded|closed|stop|drain|refut|retir|cann)/i;

// DELIBERATELY EXCLUDED from the closed-path scan even though it matches REASON_ISH_KEY: a
// `blockedReason` describes the state the leaf used to be in, not why it closed. autosprite-trial-gate
// is the live proof — the owner CANNED it 2026-07-29 and the leaf still carries the pre-retirement
// "OWNER-GATED ON CREDITS ... Lifted by the OWNER only, never by a green battery". Printing that as the
// closure cause would be WORSE than silence: it would tell the next fire a money gate is live when the
// owner has closed the question. Retired reasons belong under `priorBlockedReason` (the spelling
// e1-trail-guide-plain-boot-proof already uses), and that is excluded for the same reason.
//
// F-1274-2 (s1274) adds `authorNotes` on EXACTLY the argument above, which s1249 applied to
// blockedReason and did not carry to its sibling. `authorNotes` is written when the master is
// AUTHORED — before the runner executes — so it can describe intent but never outcome. It is also
// the single most common reason-ish key on the tree (60 of 483 leaves; more than drainNotes at 46),
// and it matches REASON_ISH_KEY only because it contains "Note". FOUND BY MUTATION, not by reading:
// s1274 deleted `stopNote` from eight-winds-wiring-e2-enemies to prove the new guard could go red,
// and the guard stayed GREEN — the fallback had silently substituted that leaf's 3,438-char
// authoring rationale for its missing closure reason. That is the masking case the guard exists to
// catch, so the fallback was defeating its own purpose. VERIFIED BEHAVIOUR-NEUTRAL ON THE LIVE TREE
// BEFORE LANDING: all 16 terminal-closed leaves resolve to a closure-specific key, and ZERO depend
// on authorNotes, so no current output changes — this only stops a FUTURE silent leaf from hiding.
// Deliberately NOT excluded: the bare `note` spelling (45 uses). It is genuinely ambiguous — a
// closure note is often written there — and suppressing it would trade a masking risk for an
// information loss, which is the worse direction.
const NOT_A_CLOSURE_REASON = new Set(['blockedReason', 'priorBlockedReason', 'authorNotes']);

// F-2247-2 (s2247). The set above excluded ONE retired spelling by name; the tree holds SIX
// (priorBlockedReason, priorStoppedReason, priorStopNote_s1206, priorStopNote_s1288,
// priorBlockReason_s1110_SUPERSEDED, priorBlockClass), so five slipped through. Worse, they slip
// through into the RANKED-FIRST bucket: `priorStoppedReason` matches CLOSURE_STEM_KEY on "stop"
// while the leaf's real record, `closureReason`, does NOT — so the retired reason OUTRANKED the
// live one. MEASURED on the live tree: 2 of the 42 terminal-closed leaves resolved to
// `priorStoppedReason` (agent-rung-honest-gate, ap-06b-panel-ladder-and-voice), and BOTH carry a
// `closureReason` stating the actual supersession. agent-rung-honest-gate's own authorNotes warns
// in words — "READ THIS BEFORE THE PRIOR REASON BELOW, WHICH THE RULING OVERTURNS" — and the
// instrument picked exactly the overturned one. That is precisely the harm the comment above
// describes for priorBlockedReason ("printing that as the closure cause would be WORSE than
// silence"), reached by a spelling the exclusion did not cover. Exclude the CLASS, not the member.
const RETIRED_REASON_KEY = /^prior|_SUPERSEDED$/i;

function closedReason(leaf) {
  for (const key of CLOSED_REASON_KEYS) {
    const value = leaf[key];
    if (typeof value === 'string' && value.trim()) return `${key}: ${value.trim()}`;
  }
  const candidates = Object.keys(leaf).filter(
    (key) =>
      !NOT_A_CLOSURE_REASON.has(key) &&
      !RETIRED_REASON_KEY.test(key) &&
      REASON_ISH_KEY.test(key) &&
      typeof leaf[key] === 'string' &&
      leaf[key].trim(),
  );
  const ranked = [
    ...candidates.filter((key) => CLOSURE_STEM_KEY.test(key)),
    ...candidates.filter((key) => !CLOSURE_STEM_KEY.test(key)),
  ];
  if (ranked.length) return `${ranked[0]}: ${leaf[ranked[0]].trim()}`;
  // Nothing found. Say what was SEARCHED rather than asserting where the why lives — this script reads
  // ONE file and cannot know what BACKLOG or reviews/ contain, so the old sentence ("the why lives only
  // in BACKLOG/reviews") was a claim about two files it never opened. The title is printed
  // unconditionally by both refusal arms, so the reader still has the leaf's own words.
  const searched = Object.keys(leaf).join(', ') || '(none)';
  return `(no reason-bearing key on this leaf — searched: ${searched})`;
}

// F-2212-1 (s2212) — A CRASH WAS READ AS THE VERDICT "NOT SHIPPED", IN THE PERMISSIVE
// DIRECTION. This function used to wrap both git calls in a bare `catch { return false }`.
// But `merge-base --is-ancestor` uses EXIT 1 AS A LEGITIMATE VERDICT ("not an ancestor"),
// so the catch could not tell that verdict from a broken instrument — F-2211-1's class,
// one file over, and here the failure direction is the dangerous one: false => "not
// shipped" => the master is CLEARED FOR DISPATCH. That is the Mistake #8 guard (the 824k
// Flail) silently disarming itself.
//
// AND THE FAILURE IS NOT EXOTIC: these two calls carried the ONLY 2-second bound in this
// file (every other git call here is unbounded or 30 s), so a load spike selectively kills
// THIS check and leaves everything else working — the fire shell under a concurrent
// ~9-minute node-guards battery is the documented load case (F-2166-2).
// PROVEN BY MANUFACTURING, not by reading (s2212): fixture leaf status="queued" with a
// mergeHash that IS an ancestor of main, git made slow ONLY on these two calls —
//   healthy git => `⛔ ALREADY SHIPPED — DO NOT QUEUE` (rc=1)
//   2 s timeout => `✅ CLEAR` (rc=0), no crash, no warning.
//
// THE SIGNATURES, MEASURED rather than assumed — this is what makes the two separable:
//   cat-file -e     present object  -> status 0
//   cat-file -e     MISSING object  -> status 128 + "fatal: Not a valid object name"
//   is-ancestor     yes             -> status 0
//   is-ancestor     NO (the verdict)-> status 1, stderr EMPTY
//   timeout                         -> status null, error ETIMEDOUT
// So exit 1 WITH EMPTY STDERR is the only non-zero code that means anything, which is the
// same discriminator `blocker-panel-closed-guard.mjs` already uses for `grep`. Everything
// else is the instrument breaking and must never be read as either verdict.
//
// Returns 'yes' | 'no' | 'absent' | 'unverifiable'. Deliberately a STRING, not a boolean:
// any careless truthiness test at a call site coerces 'unverifiable' to TRUE, i.e. toward
// REFUSING a queue rather than clearing one — the fail-safe direction by construction.
// VERIFIED BEHAVIOUR-NEUTRAL ON THE LIVE TREE BEFORE LANDING (the F-1274-2 standard):
// all 593 leaves resolve 550 'yes' / 43 'absent' / ZERO 'unverifiable', so no master that
// queues today starts being refused; this only stops a FUTURE silent clearance.
function ancestryOfMain(mergeHash) {
  if (typeof mergeHash !== 'string' || !mergeHash.trim()) return 'absent';
  const hash = mergeHash.trim();
  // 10 s, not the old 2 s. This is NOT "raise it until it goes green" (F-1410-2's standing
  // prohibition): the failure mode below is now a LOUD refusal, so a generous bound only
  // trades false alarms for patience — it can no longer hide anything. Two O(1) plumbing
  // calls have no business taking 10 s, so this still bounds a genuine hang.
  const probe = (args) => spawnSync('git', args,
    { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8', timeout: 10_000 });

  const exists = probe(['cat-file', '-e', '--', `${hash}^{commit}`]);
  if (exists.error || exists.status !== 0) return 'unverifiable';

  const anc = probe(['merge-base', '--is-ancestor', '--', hash, 'main']);
  if (anc.error) return 'unverifiable';
  if (anc.status === 0) return 'yes';
  if (anc.status === 1 && !String(anc.stderr ?? '').trim()) return 'no';
  return 'unverifiable';
}

// F-1597-1 (s1597) — A BLOCKED LEAF WITH NO `taskFile` WAS INVISIBLE TO THIS ENTIRE FILE.
// The `typeof node.taskFile === 'string'` test is what distinguishes a LEAF from a parent goal, and
// that is still its job — but it also silently dropped a leaf that is blocked and simply has no
// master yet. Measured s1597: goals.json held 5 `status:"blocked"` leaves and `--all` reported 4.
// The missing one, bt-04-homestead-automation, says in its own title that it was "REGISTERED AS
// BLOCKED s1354 for Goal Registration Law visibility ONLY" — so the registration's whole purpose,
// machine visibility, was the one thing it did not buy. `scripts/block-class-guard.test.mjs` walks
// the tree WITHOUT the taskFile filter, saw all 5, and passed them (bt-04 declares a valid
// blockClass), so the board read green while the §3.0 guard could not see the leaf at all: two
// guards over one tree with two denominators, neither asserting the blocked set is reachable from
// the drain path. This is F-1248-1's class one layer down — there the audit's vocabulary was too
// narrow, here its INPUT is — so it is cured the same way: widen the denominator, keep the leaf/
// parent distinction. A blocked leaf with no master is LEGITIMATE (it is how a fork gets registered
// before anyone authors it); what is not legitimate is it claiming a visibility it does not have.
// Such a leaf is keyed by `id` instead, so authoring `bt-04-homestead-automation.md` now STOPS.
// The parent-goal exclusion is explicit rather than incidental: a container carries a child array.
function isBlockedUnkeyedLeaf(node) {
  return (
    node.status === 'blocked' &&
    typeof node.id === 'string' &&
    !Array.isArray(node.tasks) &&
    !Array.isArray(node.subgoals) &&
    !Array.isArray(node.children)
  );
}

function collectLeaves(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectLeaves(child, out);
    return out;
  }
  if (typeof node.taskFile === 'string' || isBlockedUnkeyedLeaf(node)) out.push(node);
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectLeaves(value, out);
  }
  return out;
}

// An unkeyed leaf has no taskFile to print. Say so in the words the reader must act on, rather than
// printing "undefined" — the whole finding is that this leaf's reachability is not what it looks.
function leafLabel(leaf) {
  return leaf.taskFile || `(no taskFile — id-keyed: ${leaf.id})`;
}

// Reduce any input shape to the bare slice name:
//   20260727-011937-lane-hero-y-restore-roundtrip.md          (done-move)
//   OWNER-GATED-F-1096-2-do-not-drain-20260727-011937-lane-... (renamed done-move)
//   tasks/lane-hero-y-restore-roundtrip.md                     (master)
//   lane/m3                                                    (branch — matched loosely)
function normalize(raw) {
  // F-1597-1: an unkeyed blocked leaf reaches here as `undefined` via `leaf.taskFile ?? leaf.id`
  // only when both are absent, which the collector already forbids — but callers also pass
  // `l.taskFile` directly (the --queue arm), so tolerate nullish rather than throw.
  if (raw == null) return '';
  return raw
    .replace(/^.*\//, '')            // drop any directory
    .replace(/\.md$/i, '')           // drop the extension
    .replace(/\.log$/i, '')
    .replace(/^.*?(\d{8}-\d{6})-/, '') // drop everything up to and incl. a run stamp
    .replace(/^(lane-[a-d]|main|art)-(?=lane-|art-)/, ''); // drop a leading slot label
}

function findLeaves(leaves, needle) {
  const key = normalize(needle).toLowerCase();
  const hits = [];
  for (const leaf of leaves) {
    // F-1597-1: fall back to the id so a blocked leaf with no master is still matchable — that
    // fallback IS the teeth of the cure, since it is what stops a future bt-04 master.
    const taskKey = normalize(leaf.taskFile ?? leaf.id).toLowerCase();
    if (!taskKey) continue;
    // Substring either way: the done-move carries the taskFile, and an id may be the shorter side.
    if (key.includes(taskKey) || taskKey.includes(key)) hits.push({ leaf, taskKey });
    else if (leaf.id && key.includes(String(leaf.id).toLowerCase())) hits.push({ leaf, taskKey });
  }
  // F-1250-1 (s1250). Longest match wins guards against a short taskFile matching many done-moves by
  // accident — but it is a heuristic for the INEXACT case, and it must never override IDENTITY. An
  // exact normalized match now sorts first; length only breaks ties among inexact hits. This is the
  // rule the --queue arm already used (:276, exact-equality find); the drain path did not have it.
  //
  // WHY IT MATTERS: the board's successor-naming convention manufactures the collision — a successor
  // is named by appending a suffix to its predecessor, so the predecessor's key is ALWAYS a strict
  // substring of its successor's. Measured s1250, all 4 collisions on 227 live leaves are that shape
  // (lane-asset-diet ⊂ lane-asset-diet-gate-honesty, lane-blocked-storage-boot ⊂ ...-boot-2,
  // lane-d-suite-red-inventory ⊂ ...-run-tree-invariance, lane-calibrate-suite-workers ⊂ ...-v2).
  // So asking about a PREDECESSOR by its own exact taskFile answered about its SUCCESSOR instead.
  // Proved by construction against the pre-fix subject, both directions:
  //   superseded predecessor + longer merged successor -> "✅ CLEAR ... status=merged" rc=0
  //     — a FALSE CLEARANCE over a terminal-closed leaf, F-1104-7's shape a third time; and
  //   merged successor + longer superseded predecessor -> "⛔ CLOSED" rc=1
  //     — a lawful drain reddened, naming a file the fire never asked about.
  // Zero live instances the day this landed (all 227 leaves probed through this script: 5 blocked and
  // 15 terminal-closed all rc=1). It was latent, not academic: 3 of the 4 collision predecessors are
  // merged/shipped TODAY, and the CLOSED epilogue at :325 instructs retiring exactly such a leaf to
  // "superseded" when a successor lands. Following this guard's own printed advice was the one edit
  // that would have armed it. The BLOCKED arm was never exposed because it scans ALL hits (:220)
  // rather than the winner — that asymmetry between the two refusal arms IS the defect.
  const exact = (h) => h.taskKey === key;
  hits.sort((a, b) => (exact(a) !== exact(b) ? (exact(a) ? -1 : 1) : b.taskKey.length - a.taskKey.length));
  return hits.map((h) => h.leaf);
}

// F-2262-1 (s2262) — see the call site for the finding. Returns the lines to print when the
// resolved leaf is NOT about the subject, or null when it is. null is the overwhelming majority
// path and prints nothing, which is what keeps this off §3.0's most-run command as noise.
function subjectDivergence(leaf, target, leaves) {
  const key = normalize(target).toLowerCase();
  if (!key) return null;
  const leafKey = normalize(leaf.taskFile ?? leaf.id).toLowerCase();
  if (leafKey === key) return null; // identity: the resolver found YOUR leaf
  // A leaf may be keyed by `id` while its taskFile points at a successor — gg-03-gazette-panel-swap
  // and f1323-2-charter-fuzz-briefing-undefined are both live examples on this board. Those leaves
  // genuinely represent the subject, so compare modulo a leading slot label and do NOT flag them.
  const stripSlot = (s) => s.replace(/^(lane|main|art)-([a-d]-)?/, '');
  const id = String(leaf.id ?? '').toLowerCase();
  if (id && (id === key || id === stripSlot(key) || stripSlot(id) === stripSlot(key))) return null;
  // Only claim a different subject when the board can PROVE there is one: the master exists on disk
  // and no leaf claims it. Without the file, a near-miss cannot be told from ordinary decoration.
  if (!existsSync(join('tasks', `${key}.md`))) return null;
  if (leaves.some((l) => normalize(l.taskFile ?? l.id).toLowerCase() === key)) return null;
  return [
    `  ⓘ NEAREST MATCH, NOT YOUR SUBJECT — you asked about "${key}"; everything below is about`,
    `    "${leafKey}" [${leaf.id}], a DIFFERENT task. tasks/${key}.md exists and NO leaf claims it,`,
    `    so the honest verdict for YOUR subject is "? UNKNOWN" — Goal Registration Law debt, not a`,
    `    clearance. Register the leaf, or file-probe the master itself (the s1061 method).`,
  ];
}

function backlogMentions(needle) {
  if (!existsSync(BACKLOG)) return [];
  const key = normalize(needle).toLowerCase();
  const stem = key.replace(/^lane-/, '').slice(0, 28);
  if (stem.length < 6) return [];
  return readFileSync(BACKLOG, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => line.toLowerCase().includes(stem))
    .filter(({ line }) => /owner|block|gate|desk|unruled|hold/i.test(line))
    .slice(0, 6);
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const all = argv.includes('--all');
  const queue = argv.includes('--queue');
  const target = argv.find((a) => !a.startsWith('--'));

  // F-2223-1: BEFORE any corpus is read, and before any verdict is formed. Every path below
  // (--all, the drain arm, --queue) reads the TRACKED ledger, and tasks/done/ is tracked too
  // (F-2222-1 measured a lane worktree holding 154 done-moves against main's 1,353), so a frozen
  // tree compromises the whole tool rather than one arm of it. 2, not 1: "could not answer" is a
  // different act from "answered, and the answer refuses" — the convention dry-board-probe,
  // master-shipped-classifier and review-evidence-audit already carry.
  //
  // SILENT on the healthy read, loud otherwise — this file's OWN established convention
  // (`dispatchCorpus` at :1020 declares 'absent' always, refuses 'unreadable', and says nothing on
  // 'read'). F-2208-1's "declare even on the happy path" argument governs a corpus whose failure
  // state is a SILENT DEGRADATION; here every non-main state REFUSES, so the absence of a banner
  // is not ambiguous and an always-on line on §3.0's most-run command would be the noise that
  // decays a declaration into a formality.
  const tree = corpusTree(process.cwd());
  if (tree.tree !== 'main') {
    const stale = tree.tree === 'linked-worktree';
    console.log(`\n  ⛔ CANNOT VERIFY — DO NOT DRAIN, DO NOT QUEUE off this run`);
    console.log(`    corpus tree     : ${stale ? 'LINKED WORKTREE' : 'UNVERIFIABLE'} — ${tree.detail}`);
    console.log(`    cwd             : ${process.cwd()}`);
    if (stale) {
      console.log(`    tasks/goals.json and tasks/done/ are TRACKED, so this tree hands the check a`);
      console.log(`    board FROZEN at that branch's commit. A master registered after the branch`);
      console.log(`    point resolves to "? UNKNOWN" — which exits 0 — and a leaf the owner has`);
      console.log(`    since unblocked still reads "blocked". Measured s2224: from worktrees/lane-c`);
      console.log(`    an already-SHIPPED master answered "? UNKNOWN" rc=0 where the repo root`);
      console.log(`    answered "⛔ ALREADY SHIPPED — DO NOT QUEUE" rc=1 (F-2223-1).`);
    }
    console.log(`    Re-run from the repo root. Do NOT re-run elsewhere until it goes green.\n`);
    process.exit(2);
  }

  // F-2333-1 (s2333): the OTHER way this tree can be frozen. The check above asks WHICH
  // TREE and uses that as a proxy for IS THIS BOARD FRESH — and the two come apart in the
  // MAIN worktree, because a DETACHED HEAD here answers 'main', the modal healthy value and
  // the value a correct run prints. `tasks/goals.json` is TRACKED, so it is then frozen at
  // that commit exactly as it is in the linked worktree the block above already refuses.
  //
  // PROVEN BY MANUFACTURING, ground truth = a master that IS already shipped, control
  // asserting its own validity first (F-2215-1):
  //   healthy main worktree            -> `⛔ ALREADY SHIPPED — DO NOT QUEUE`  rc=1
  //   linked worktree frozen at c1     -> `⛔ CANNOT VERIFY`                   rc=2  (cured)
  //   MAIN worktree DETACHED at c1     -> `? UNKNOWN — no goal leaf matches`   rc=0  (this)
  // The defect arm was BYTE-IDENTICAL on stdout, stderr AND rc to a genuinely unregistered
  // master on a healthy board. That is the Mistake #8 polarity — an affirmative-looking
  // clearance to re-derive already-merged work — in §3.0's first command of every drain.
  //
  // SCOPED to a real repo, and that scoping is load-bearing rather than tidy: corpusTree
  // above maps git's 128 onto 'main' for fixture roots (see its own comment), so asking
  // this question without the 'no-git' arm would refuse on every legacy fixture and be
  // excused into uselessness inside a week (F-1460-1). 'no-git' and 'on-branch' proceed.
  //
  // The two failure answers are tested SEPARATELY and neither by inequality, because they
  // owe DIFFERENT ACTS (F-2225-1): 'detached' says `git checkout main`, 'unverifiable' says
  // the instrument itself wants investigating. Collapsing them into `!== 'on-branch'` would
  // print a DETACHED accusation for a git that simply did not answer.
  //
  // IMPORTED, not re-typed: F-2227-1 measured that independently-maintained copies of one
  // predicate is HOW it drifts. (The corpusTree copies stay separate on purpose — they
  // differ in which tree the question is about; see corpus-tree.mjs's header.)
  const head = headDetached(process.cwd());
  if (head === 'detached' || head === 'unverifiable') {
    console.log(`\n  ⛔ CANNOT VERIFY — DO NOT DRAIN, DO NOT QUEUE off this run`);
    console.log(`    corpus tree     : main worktree, but HEAD is ${head === 'detached' ? 'DETACHED' : 'UNREADABLE'}`);
    console.log(`    cwd             : ${process.cwd()}`);
    if (head === 'detached') {
      console.log(`    tasks/goals.json is TRACKED, so a detached HEAD freezes the board at that`);
      console.log(`    commit. A master registered after it resolves to "? UNKNOWN" — which exits 0`);
      console.log(`    — and an ALREADY SHIPPED master reads as a clearance to queue it again`);
      console.log(`    (Mistake #8). Measured s2333: byte-identical to an innocent board on stdout,`);
      console.log(`    stderr and rc. Run \`git checkout main\`, then re-run (F-2333-1).`);
    } else {
      console.log(`    \`git symbolic-ref -q HEAD\` did not answer, so this run cannot tell a tree on`);
      console.log(`    \`main\` from one frozen at a bare commit. This is an INSTRUMENT failure, not a`);
      console.log(`    board state: check git, then re-run. (A non-git root is NOT this case.)`);
    }
    console.log(`    Do NOT re-run elsewhere until it goes green.\n`);
    process.exit(2);
  }

  if (!existsSync(GOALS)) {
    console.error(`drain-block-check: ${GOALS} not found (run from the repo root)`);
    process.exit(2);
  }
  const leaves = collectLeaves(JSON.parse(readFileSync(GOALS, 'utf8')));

  if (all) {
    const blocked = leaves.filter((l) => l.status === 'blocked');
    console.log(`Scanned ${leaves.length} goal leaves — ${blocked.length} BLOCKED.`);
    for (const leaf of blocked) {
      console.log(`\n  BLOCKED  ${leafLabel(leaf)}  [${leaf.id}]`);
      if (!leaf.taskFile) {
        console.log(`           ⚠️  NO MASTER YET (F-1597-1) — this leaf is matched by its id, not a`);
        console.log(`           taskFile. Authoring a master whose name contains that id will STOP.`);
      }
      console.log(`           ${leaf.blockedReason || '(no blockedReason recorded)'}`);
    }
    // F-1248-1: --all was the instrument F-1172-2 used to measure this guard's denominator ("--all
    // scans 164 goal leaves and reports only 2 BLOCKED"), and it could not see a terminal-closed
    // leaf at all — so six leaves that BOTH paths refuse were invisible to the board's own audit of
    // what is held. Report-only: the exit code still tracks BLOCKED alone, because that is what
    // --all is documented to mean and a closed question is not an owner debt.
    const closed = leaves.filter((l) => TERMINAL_CLOSED_STATUSES.has(l.status));
    if (closed.length) {
      console.log(`\n  ALSO ${closed.length} TERMINAL-CLOSED — refused on BOTH the drain and --queue`);
      console.log(`  paths (F-1248-1). Not owner debt; listed so the audit's denominator is honest:`);
      for (const leaf of closed) {
        console.log(`    ${String(leaf.status).padEnd(11)} ${leafLabel(leaf)}  [${leaf.id}]`);
      }
    }
    process.exit(blocked.length ? 1 : 0);
  }

  if (!target) {
    console.error('usage: node scripts/drain-block-check.mjs <done-move|taskfile|branch|id> [--strict]');
    console.error('       node scripts/drain-block-check.mjs --all');
    process.exit(2);
  }

  const marker = FILENAME_BLOCK_MARKERS.find((re) => re.test(target));
  const hits = findLeaves(leaves, target);
  let blockedHit = hits.find((l) => l.status === 'blocked');

  // Branch-name path. /drain step 1 works from `main..<branch>`, but branches are not registered
  // in goals.json, so a fire starting from the branch got no protection (proven: "lane/m3", the
  // exact ref s1104 merged, read UNKNOWN). Blocked leaves are few and they name their branch in
  // prose, so scan THEIR text only — narrow enough to stay false-positive-cheap.
  if (!blockedHit) {
    const token = target.trim().toLowerCase();
    if (/^[\w.-]+\/[\w.-]+$/.test(token)) {
      const wordRe = new RegExp(`(^|[^\\w/-])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w/-]|$)`, 'i');
      blockedHit = leaves.find(
        (l) => l.status === 'blocked' && wordRe.test(`${l.blockedReason || ''} ${l.title || ''}`)
      );
      if (blockedHit) hits.unshift(blockedHit);
    }
  }

  if (marker || blockedHit) {
    console.log(`\n  ⛔ BLOCKED — DO NOT DRAIN: ${target}\n`);
    if (marker) console.log(`  filename marker : ${marker} — the done-move is renamed do-not-drain`);
    if (blockedHit) {
      console.log(`  goal leaf       : ${blockedHit.id}  (${GOALS}, status="blocked")`);
      console.log(`  reason          : ${blockedHit.blockedReason || '(none recorded)'}`);
      // F-1250-1 rider (s1249 lead I). This arm deliberately scans ALL hits rather than the winner,
      // so a blocked SIBLING refuses an input that exactly names a different leaf — conservative and
      // right (it can only ever produce rc=1), but it made the named leaf unreachable in the OUTPUT:
      // lane-calibrate-suite-workers.md reported only the blocked -v2 leaf and never its own
      // superseded one. Say both, so the reader learns which question they actually asked.
      if (hits[0] && hits[0].id !== blockedHit.id) {
        console.log(`  you asked about : ${hits[0].id}  status="${hits[0].status}" (${leafLabel(hits[0])})`);
        console.log(`                    refused via the blocked SIBLING above, which also matched.`);
      }
    } else {
      console.log(`  goal leaf       : none blocked — filename marker alone. Fix the leaf too.`);
    }
    const mentions = backlogMentions(target);
    if (mentions.length) {
      console.log(`\n  BACKLOG context:`);
      for (const { line, n } of mentions) console.log(`    ${BACKLOG}:${n}  ${line.trim().slice(0, 150)}`);
    }
    // F-1383-1: the verdict is now class-specific. A filename-marker-only refusal (no leaf) keeps
    // the owner-fork wording, because the "OWNER-GATED-...-do-not-drain-..." rename convention is
    // itself an owner-gate marker — that arm was never the overloaded one.
    const declared = blockedHit ? blockedHit.blockClass : 'owner-fork';
    const verdict = BLOCK_CLASS_VERDICTS[declared] || BLOCK_CLASS_VERDICTS['owner-fork'];
    console.log('');
    if (blockedHit && !declared) for (const line of BLOCK_CLASS_UNCLASSIFIED) console.log(line);
    else if (blockedHit && !BLOCK_CLASS_VERDICTS[declared]) {
      console.log(`  ⚠️ blockClass="${declared}" is not a known class — treated as owner-fork.`);
    }
    for (const line of verdict) console.log(line);
    console.log('');
    process.exit(1);
  }

  // A CLEAR verdict must never rest on a coincidental substring. Branch names are not registered
  // in goals.json, so "lane/perf" matching an unrelated "perf-05" leaf is noise, not clearance.
  //
  // F-1245-2 (s1245): that branch shape ALSO matches a taskfile path — "tasks/ret-02-foo.md" is
  // `[\w.-]+` + "/" + `[\w.-]+` — so the input shape this file documents as supported at :76
  // ("tasks/lane-hero-y-restore-roundtrip.md (master)") was being reclassified as a branch and its
  // correct match thrown away. Measured on main: `tasks/ret-02-retention-floor-ratchet.md` printed
  // "? UNKNOWN — no BLOCKED goal leaf matches" at rc=0 while the bare name printed ✅ CLEAR for the
  // same leaf, and `--strict` turned that into a FALSE rc=2 on correctly-registered work. §3.0
  // tells the reader UNKNOWN "is a Goal Registration Law bookkeeping finding", so the false verdict
  // invites a fire to re-register a leaf that already exists. Block detection was never affected
  // (a blocked leaf still exits 1 in every spelling, because blockedHit is decided above on the
  // directory-stripped key) — this only restored the CLEAR verdict.
  // A ".md" suffix means taskfile, never a branch: 260 refs on this repo, none ends in ".md". This
  // merely generalises what the --queue arm below already assumed.
  const isTaskFileShaped = /\.md$/i.test(target.trim());
  const branchShaped = /^[\w.-]+\/[\w.-]+$/.test(target.trim()) && !isTaskFileShaped;
  const queueTaskFile = queue && isTaskFileShaped;
  const leaf = queueTaskFile
    // F-1597-1: the id fallback is REQUIRED here, not cosmetic. This is the arm an AUTHOR hits
    // (`--queue <master>.md`), and an unkeyed leaf whose taskFile normalizes to "" would fail this
    // exact-equality find, fall through to UNKNOWN and exit 0 — an affirmative-looking clearance on
    // the one path whose entire job is to refuse a master the owner has reserved.
    ? hits.find((l) => normalize(l.taskFile ?? l.id).toLowerCase() === normalize(target).toLowerCase())
    : hits[0];
  const branchFallback = branchShaped && !queueTaskFile;
  if (!leaf || branchFallback) {
    console.log(`  ? UNKNOWN — no ${branchFallback ? 'BLOCKED ' : ''}goal leaf matches "${target}".`);
    console.log(`${branchFallback ? '    (branch names are not registered as leaves — check the done-move filename too)\n' : ''}    Goal Registration Law: every authored master registers a leaf in ${GOALS}.\n    A missing leaf is a bookkeeping finding, not a clearance.`);
    // F-2390-1 (s2390) — THE UNKNOWN BRANCH THROWS AWAY A NEAR-MISS IT HAS ALREADY RESOLVED, AND A
    // PARK RENAME IS ENOUGH TO REACH IT. `findLeaves` (:396) matches by BIDIRECTIONAL SUBSTRING, so a
    // master renamed with a prefix still finds its own leaf; the --queue arm (:679) then demands
    // EXACT normalized equality, finds nothing, and falls here — printing "no goal leaf matches" while
    // `hits` holds the very leaf that would refuse the dispatch. `normalize` (:383) strips a
    // directory, an extension, a run stamp and a slot label; it does NOT strip an arbitrary prefix.
    //
    // MEASURED LIVE s2390 on the SAME master, byte-identical content (sha256 verified), the ONLY
    // variable being the filename — and the path was control-isolated as a non-confound:
    //   lane-d-toolsurface-terrain-edge.md                        -> ⛔ ALREADY SHIPPED   rc=1
    //   tasks/lane-d-toolsurface-terrain-edge.md                  -> ⛔ ALREADY SHIPPED   rc=1  (path is not the cause)
    //   s2382-PARKED-armed-duplicate-dispatch-<same name>.md      -> ? UNKNOWN            rc=0
    //   tasks/queue-paused/s2382-PARKED-...-<same name>.md        -> ? UNKNOWN            rc=0
    // That file is a real one on this board: a copy of a master whose cure merged at 0331c2b47, parked
    // in tasks/queue-paused/ — the directory §2E tells a fire to re-queue from "once the pile is below
    // 2". So the ACT OF PARKING A MASTER, which is how a fire marks it dangerous, is what removes it
    // from the guard that would refuse it. The louder the human label, the blinder the instrument.
    //
    // THIS IS THE FOURTH TIME THIS ONE FILE HAS SPLIT ON THE SAME SEAM, and it has said so twice
    // itself: F-1597-1 cured the fall-through for the BLOCKED arm, F-2097-1 wrote "the reasoning was
    // never carried across to the dispatch arm, which is why it survived the cure that names it", and
    // F-2262-1 (:763) added near-miss disclosure whose own comment claims it is "placed BEFORE the
    // verdict arms so it covers all of them ... and --queue" — but it sits AFTER this branch's
    // process.exit and takes a resolved `leaf`, so it can never see the case where NO leaf resolved.
    //
    // DECLARES, DOES NOT REFUSE (F-2218-1's restraint), and does not touch the verdict or the exit
    // code: an unregistered master is lawful and common, so refusing here would red ordinary work and
    // be excused into uselessness inside a week (F-1460-1). It is NOT always-on, which is the F-2224
    // concern — a line on every run is the noise that decays a declaration into a formality.
    // BLAST RADIUS MEASURED BEFORE LANDING, not assumed, over all 1191 masters in tasks/*.md, with the
    // census's replication of this resolver CONTROLLED against this very CLI (25/25 agreement):
    //   654 resolve exactly (untouched) · 524 UNKNOWN with zero hits (stays SILENT) · 13 would SPEAK,
    //   and 11 of those 13 name a merged/shipped leaf — the Mistake #8 class this exists to catch.
    // So it fires on 1.1% of subjects and is on-target for 85% of those.
    //
    // SCOPED TO THE --queue ARM DELIBERATELY: the branchFallback path reaches this same branch, and
    // :656 already rules that a branch matching a leaf by substring is "noise, not clearance", so
    // declaring a near-miss for a branch name would advertise exactly the coincidence that comment
    // forbids acting on.
    if (queueTaskFile && hits.length) {
      // `findLeaves` returns LEAVES, not {leaf,taskKey} wrappers — it maps at :432. Reading the
      // return shape rather than assuming it is what the pushes look like is the whole of this line.
      const near = hits.slice(0, 3).map((l) => {
        const st = l.status ? `status="${l.status}"` : 'status=(none)';
        const mh = l.mergeHash ? ` mergeHash="${String(l.mergeHash).slice(0, 8)}"` : '';
        return `      · ${l.taskFile ?? l.id} [${l.id}] ${st}${mh}`;
      });
      console.log(`    ⚠️  NEAR-MISS — this name did not resolve, but ${hits.length} leaf/leaves match it by substring:`);
      for (const line of near) console.log(line);
      if (hits.length > 3) console.log(`      · … and ${hits.length - 3} more`);
      console.log(`    A prefix (a park label, a session tag) defeats the exact-match this arm requires.`);
      console.log(`    If one of the above IS your subject, ask again under its registered name before queueing.`);
    }
    // F-2097-1 (s2097) — THE DUPLICATE-DISPATCH REFUSAL WAS INERT FOR HALF THE BOARD, BECAUSE IT SAT
    // BEHIND A LEAF LOOKUP IT DOES NOT NEED. checkAlreadyDispatched (:615) is called at :543, inside
    // `if (queue)`, which this UNKNOWN branch exits BEFORE ever reaching. So a master with no goal
    // leaf was cleared at rc=0 no matter how many runners held it — and 532 of 1093 masters in
    // tasks/*.md (48.7%, measured s2097) have no leaf, which makes this the majority case, not an
    // edge. F-1538-1 measured the same gap from the other side and read the trend as healthy
    // (93.3% of NEW masters register a leaf); that is true and it is about the FLOW, while this is
    // about the STOCK — legacy debt is exactly where a re-queue reaches, because old masters are
    // what a re-land or a successor is built from.
    //
    // PROVEN BY MANUFACTURING THE DEFECT, NOT BY A GREEN (the s1299/s1300 standard). Two fixtures
    // identical but for the leaf, same master, same `tasks/running/lane-b--<stamp>-<name>`:
    //   leaf present -> rc=1, "⛔ ALREADY DISPATCHED — DO NOT QUEUE"
    //   leaf absent  -> rc=0, "? UNKNOWN", no refusal printed at all
    // The prose two lines above says "not a clearance"; the control flow delivered one. That is the
    // same shape F-1597-1 cured for the BLOCKED arm (an unkeyed leaf "would fall through to UNKNOWN
    // and exit 0 — an affirmative-looking clearance"), and the reasoning was never carried across to
    // the dispatch arm, which is why it survived the cure that names it.
    //
    // THE CHECK NEEDS NOTHING FROM THE GOAL TREE: it reads tasks/running/ and tasks/done/ and
    // matches on the runner's own filename shape. So the leaf lookup was never a precondition — only
    // an accident of where the call sits.
    //
    // ⚠️ ONLY THE REFUSAL ARM RUNS HERE, AND THE ASYMMETRY IS DELIBERATE — `warnUndrained: false`.
    // The live-run arm has "no lawful reading of two runners on one master" (:584) and must fire
    // regardless of bookkeeping. The UNDRAINED WARN must NOT: 403 of those unregistered masters have
    // an un-prefixed done-move (measured s2097), nearly all of them old work that WAS drained before
    // the rename convention existed — the prefix heuristic is a proxy for a fact the ledger holds,
    // and with no leaf there is no ledger to consult. Firing it here would print a warning that is
    // usually false, on the majority path, which is precisely how :594 says a guard "decays into a
    // formality". A refusal that fires on the lawful case gets flagged past by reflex.
    if (queueTaskFile) {
      const rc = checkAlreadyDispatched(target, { warnUndrained: false });
      // A live runner outranks the bookkeeping verdict: --strict's rc=2 means "unknown and I want
      // that to be loud", while rc=1 means "stop, this is dispatched RIGHT NOW". Stop wins.
      if (rc !== 0) process.exit(rc);
    }
    process.exit(strict ? 2 : 0);
  }

  // F-2262-1 (s2262) — THE DRAIN ARM ACCEPTS A NEAR-MISS AS AN IDENTITY, AND SAYS SO ONLY WHEN MORE
  // THAN ONE LEAF HAPPENED TO MATCH. F-1250-1 wrote the correct sentence one screen below — "A CLEAR
  // that names a leaf the reader did not ask about is the exact shape that made the false clearance
  // readable as an affirmative answer" — and then gated it on `hits.length > 1`. The deciding
  // condition is not how many leaves matched; it is whether the winner is YOUR leaf. A subject with
  // exactly ONE inexact hit therefore prints no caveat at all.
  //
  // THE ASYMMETRY BETWEEN THE TWO ARMS IS THE DEFECT, for the third time in this file (F-1597-1 and
  // the blocked-arm note in findLeaves are the same shape): the --queue arm requires exact equality
  // and correctly answers "? UNKNOWN"; the drain arm takes hits[0]. Same resolver, same board, two
  // different answers about the SAME task — measured s2262 on e3-fairground:
  //   --queue e3-fairground.md  -> "? UNKNOWN — no goal leaf matches"                      (correct)
  //   the done-move             -> "✅ CLEAR — lane-d-e3-fairground-mask-table
  //                                 [world-e3-fairground-mask] status=merged"    (a DIFFERENT task)
  //
  // MEASURED s2262 over all 1,284 done-moves against 613 leaves: 30 resolve to an INEXACT winner,
  // and 23 of those are BENIGN — the done-move carries session/hash decoration the normalizer does
  // not strip (`shipped-s1049-deploy-honest-and-serialized-ab528c3f` contains
  // `lane-b-deploy-honest-and-serialized`), so the needle CONTAINS the leaf's key and the leaf
  // really is the subject. INEXACTNESS ALONE IS THEREFORE NOT THE DEFECT AND MUST NOT BE THE
  // TRIGGER: requiring exact equality here is the over-general cure and would break all 23.
  //
  // THE DECIDABLE TRIGGER is the one the board can prove — the subject names a REAL MASTER on disk
  // that has NO leaf of its own. Then the honest verdict is Goal Registration Law debt and any
  // verdict at all is about somebody else. 7 live instances (e3-fairground x3, lane-boss-healthbar
  // x2, lane-e9-arsenal, stream-capture-duty), 5 of which print NO caveat today.
  //
  // DECLARES, DOES NOT REFUSE (F-2218-1's restraint). The near-miss answer is often the useful one,
  // and this is §3.0's most-run command: a refusal here would red lawful drains and be excused into
  // uselessness inside a week (F-1460-1). It is scoped to the provable case rather than to every
  // inexact winner for F-2224's reason — an always-on line on this command is the noise that decays
  // a declaration into a formality. Placed BEFORE the verdict arms so it covers all of them
  // (CLOSED, blocked, CLEAR, --queue), and so the reader learns the subject is wrong before reading
  // an answer about it.
  //
  // DECLARED LIMIT: keyed on the master EXISTING, so a subject whose master was deleted or renamed
  // still resolves to a neighbour silently. That case cannot be told from ordinary decoration
  // without the file, and a guess is worse than a stated gap.
  const divergence = subjectDivergence(leaf, target, leaves);
  if (divergence) for (const line of divergence) console.log(line);

  // F-1248-1 (s1248) — THE DRAIN PATH'S VOCABULARY WAS NARROWER THAN THIS FILE'S OWN --queue PATH.
  // TERMINAL_CLOSED_STATUSES (:46) was consulted ONLY under --queue, so the path §3.0 calls "THE
  // FIRST COMMAND OF EVERY DRAIN, BEFORE CLASSIFICATION AND BEFORE YOU FORM AN OPINION" answered
  // "✅ CLEAR — status=stopped" at rc=0 for a leaf whose run STOPPED lawfully pending an OWNER FORK.
  // MEASURED LIVE ON MAIN BEFORE THE FIX: one body of owner-gated ap-06b code answered THREE
  // different ways depending only on which spelling of it you typed —
  //   save/ap-06b-adapter-wiring                                  -> ⛔ BLOCKED  rc=1
  //   lane/e2-arsenal            (the branch that actually holds it) -> ? UNKNOWN rc=0
  //   stopped-...-lane-c-ap-06b-panel-ladder-and-voice.md (done-move) -> ✅ CLEAR rc=0
  // while 28 of the 30 substantive src/game/Game.ts lines in that commit were absent from main and
  // the sibling leaf ap-06b-adapter-wiring reads "NO LANE TASK CAN LIFT THIS. Needs the owner
  // ruling." CLEAR is the worst of the three: §3.0's own exit table defines 0 as "a leaf matched and
  // it is not blocked", an affirmative clearance, where UNKNOWN at least prints "not a clearance".
  // That is F-1104-7's shape reproduced by the guard written to refuse it. Census at the time:
  // 12 of 31 `stopped-` done-moves cleared this way (6 status=stopped, 6 status=superseded).
  // BOUNDARY, DELIBERATE — TERMINAL_SHIPPED_STATUSES (merged/shipped) is NOT refused here. The
  // /drain skill re-asserts this command on the MERGED tree at the top of its gate battery (§3),
  // which runs BEFORE the leaf flip in its §5, so the normal flow never sees a closed word; but a
  // re-assert over a unit drained by an EARLIER fire reads `merged`, and turning that into rc=1
  // would red a lawful re-check. Re-draining already-merged work is caught by the two-dot diff —
  // a policy word is not, which is the whole reason this file exists.
  if (!queue && TERMINAL_CLOSED_STATUSES.has(leaf.status)) {
    console.log(`\n  ⛔ CLOSED — DO NOT DRAIN: ${leafLabel(leaf)} [${leaf.id}]`);
    console.log(`    refusal arm     : status="${leaf.status}" (terminal-closed; the drain path now`);
    console.log(`                      consults the same set as --queue — F-1248-1)`);
    // The title is printed UNCONDITIONALLY, not as a fallback: §4.7 puts an owner's verbatim ruling
    // in it ("owner directive, date"), so on a canned leaf the title IS the cause and any reason key
    // is secondary bookkeeping. autosprite-trial-gate is the case that proved it — F-1249-1.
    console.log(`    leaf title      : ${(leaf.title || '(untitled leaf)').trim().slice(0, 300)}`);
    console.log(`    ${closedReason(leaf)}`);
    // F-1250-1: this refusal is decided on ONE leaf (unlike the blocked arm, which scans all hits), so
    // when the input matched more than one, name them. A successor that merged is the commonest second
    // hit and it is exactly what the reader needs to see before deciding the stop is stale.
    if (hits.length > 1) {
      console.log(`    also matched    : ${hits.slice(1).map((l) => `${l.id}[${l.status}]`).join(', ')}`);
    }
    const mentions = backlogMentions(target);
    if (mentions.length) {
      console.log(`\n  BACKLOG context:`);
      for (const { line, n } of mentions) console.log(`    ${BACKLOG}:${n}  ${line.trim().slice(0, 150)}`);
    }
    console.log(`\n  A lawful STOP ships no work, so there is usually nothing here to land — and when`);
    console.log(`  a branch DOES hold bytes (work preserved on a lane or save/* ref), the question`);
    console.log(`  that stopped it is the thing to settle first, not the merge. If the stop is stale`);
    console.log(`  because a successor landed, retire THIS leaf (superseded) in the same commit as`);
    console.log(`  that event — do not merge past it.\n`);
    process.exit(1);
  }

  if (queue) {
    const shippedByStatus = TERMINAL_SHIPPED_STATUSES.has(leaf.status);
    const ancestry = shippedByStatus ? 'absent' : ancestryOfMain(leaf.mergeHash);
    // F-2212-1: the probe broke. It is NOT a verdict, and above all it is not the
    // permissive one. Refuse and say which instrument failed, so the fire re-runs
    // instead of dispatching a master that may already be on main (Mistake #8).
    if (ancestry === 'unverifiable') {
      console.log(`  ⛔ CANNOT VERIFY — DO NOT QUEUE: ${leafLabel(leaf)} [${leaf.id}]`);
      console.log(`    mergeHash="${leaf.mergeHash || '(not recorded)'}"`);
      console.log(`    The ancestry probe for this hash did not return a verdict — git errored,`);
      console.log(`    timed out, or the object is not in this clone. That is the INSTRUMENT`);
      console.log(`    failing, not evidence the master is unshipped, so this refuses rather`);
      console.log(`    than clear: re-queueing an already-merged master is Mistake #8.`);
      console.log(`    Re-run this check; if it persists, verify by hand:`);
      console.log(`      git merge-base --is-ancestor ${leaf.mergeHash || '<hash>'} main\n`);
      process.exit(1);
    }
    const shippedByAncestry = ancestry === 'yes';
    const closedByStatus = TERMINAL_CLOSED_STATUSES.has(leaf.status);
    if (shippedByStatus || shippedByAncestry) {
      console.log(`  ⛔ ALREADY SHIPPED — DO NOT QUEUE: ${leafLabel(leaf)} [${leaf.id}]`);
      console.log(`    mergeHash="${leaf.mergeHash || '(not recorded)'}"`);
      console.log(`    refusal arm=${shippedByStatus ? `status="${leaf.status}"` : `mergeHash is an ancestor of main (status="${leaf.status}")`}`);
      process.exit(1);
    }
    if (closedByStatus) {
      // Deliberately a DIFFERENT headline: "already shipped" would be a lie for a master that
      // never merged a line, and a wrong reason teaches the next fire the wrong lesson.
      console.log(`  ⛔ CLOSED — DO NOT QUEUE: ${leafLabel(leaf)} [${leaf.id}]`);
      console.log(`    refusal arm=status="${leaf.status}" (terminal, and it left no commit to refuse it with)`);
      console.log(`    leaf title      : ${(leaf.title || '(untitled leaf)').trim().slice(0, 300)}`);
      console.log(`    ${closedReason(leaf)}`);
      console.log(`    This master's question is dead — overturned, carried down by a successor that`);
      console.log(`    merged, or CANNED by the owner (read the title above before assuming which).`);
      console.log(`    Re-queueing it re-derives finished work (Mistake #8).`);
      console.log(`    If you believe the question is live again, author a SUCCESSOR; do not revive this leaf.`);
      process.exit(1);
    }
    const dispatchStatus = checkAlreadyDispatched(target);
    if (dispatchStatus !== 0) process.exit(dispatchStatus);
    const citationStatus = checkQueuedMasterCitations(target);
    if (citationStatus !== 0) process.exit(citationStatus);
  }
  console.log(`  ✅ CLEAR — ${leafLabel(leaf)} [${leaf.id}] status="${leaf.status}"`);
  if (hits.length > 1) {
    // F-1250-1: "longest wins" was the whole rule and is now only the tie-break, so say the rule that
    // actually decided this. A CLEAR that names a leaf the reader did not ask about is the exact shape
    // that made the false clearance readable as an affirmative answer.
    console.log(`    (${hits.length} leaves matched; exact name wins, then longest.`);
    console.log(`     Others: ${hits.slice(1).map((l) => `${l.id}[${l.status}]`).join(', ')})`);
  }
  process.exit(0);
}

main();

// F-1322-1 (s1322) — THE F-1307-1 CLASS RECURRED, AND THE SHIPPED CURE COULD NOT SEE IT.
//
// s1312 landed the ORDER rule (.claude/skills/author-task/SKILL.md:54): gate the master, THEN `cp`
// it into the queue. That rule is correct and it is still the primary defence. But it is prose, and
// prose cannot refuse an act. s1321 authored the pc-01b corrective, copied it at ~08:39:2x (runner
// dispatched it 08:39:26 as the 9,226-byte version), then found the citation gate red AGAINST the
// master it had just dispatched, repaired it at 08:40:53 (`38b2b701`, +14 lines of quoted test
// titles), and re-copied. The runner holds one pidfile per slot, so the second copy simply WAITED —
// and the instant run 1 released the slot at 08:57:30 it dispatched the 9,856-byte version as run 2.
// Two runs, one master, two VERSIONS: exactly F-1307-1, five sessions after its cure shipped.
//
// The cost differs from s1307's in a way worth recording. There, run 2's safe-dupe pre-flight read
// HOLDS and stopped. Here the corrective's pre-flight is deliberately BUILD-ON-PREDECESSOR (lane/m4
// is intentionally ahead — resetting it would destroy the Drill Yard), so nothing stopped run 2 and
// it re-derived work run 1 had already committed at `19f212b7`, on top of a 250,318-token run 1.
// ⚠️ A safe pre-flight is not a duplicate-dispatch guard; it caught s1307 by side effect, and the
// lanes where it is correct to build on a predecessor are precisely the lanes where it cannot.
//
// So the refusal belongs HERE, at the one command the law already routes every `cp` through.
//
// TWO ARMS, DELIBERATELY UNEQUAL — and the asymmetry is the whole design:
//
//   LIVE RUN (tasks/running/<slot>--<stamp>-<name>) -> rc=1, REFUSE.
//       There is no lawful reading of two runners on one master. The runner names the file
//       "$slot--$stamp-$name" (scripts/lane-runner-v3.sh:58), so the suffix match is exact.
//
//   UNDRAINED DONE-MOVE (tasks/done/<stamp>-<name>, un-prefixed) -> WARN, rc unchanged.
//       NOT a refusal, and this is a measured decision rather than caution. s1320 re-queued
//       `lane-d-f1319-3-terrain-seed-per-sample-url-parse.md` while exactly such a done-move sat in
//       tasks/done/ (`20260801-080403-...`, the lawful self-cancel), and that re-dispatch was
//       CORRECT under §7.5 — the premise had changed, the lane having gone 153 commits fresher.
//       Refusing it would have blocked the board's best-evidenced work to prevent a defect that was
//       not present. A guard that fires on the lawful case teaches fires to pass a flag by reflex,
//       which is how a refusal decays into a formality.
//
// Prefixed done-moves (drained-/rejected-/stopped-/CRASHED-/rc<N>-) never match either arm: the
// stamp anchor is ^\d{8}-\d{6}-, so a drained unit is silently queueable, which is what a
// successor task needs.
// MATCH THE RUNNER'S SHAPE EXACTLY, NOT A SUFFIX. The first draft of this function asked
// `f.endsWith('-' + name)`, which refuses `foo.md` on a running `lane-b--<stamp>-lane-b-foo.md`
// because that string does end in "-foo.md". Two masters whose names differ only by a lane prefix
// are ordinary here (lane-drill-yard.md and lane-b-pc01b-drill-yard-....md shipped this same week),
// so anchoring on the full "$slot--$stamp-$name" is the difference between a refusal and a guess.
// A function DECLARATION, not a const arrow: main() is invoked at :421, above this line, so a
// const would be in its temporal dead zone every time the --queue arm ran. Caught by running it.
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// F-2218-1 (s2218) — THE DISPATCH CORPUS IS ENUMERATED BEHIND AN existsSync GUARD, SO AN ABSENT
// tasks/running/ READS AS "no runner holds this master" AND CLEARS THE QUEUE.
//
// This is the F-2217-1 shape (an empty subject set is the shape of good news) with the PERMISSIVE
// polarity of F-2212-1: the swallow does not mis-label a member of the set, it EMPTIES the set, and
// an empty set here means `live.length === 0` means ✅ CLEAR — an affirmative licence to dispatch a
// master a runner may be holding RIGHT NOW (F-1322-1, whose own message says "a second copy is a
// second DISPATCH that fires the moment this slot frees").
//
// WHY EVERY CENSUS IN THIS STREAK WAS BLIND TO IT, which is the reusable half: s2212 (`grep -c
// catch`), s2213 (spawn lexically inside a try), s2214 (same-file wrapper), s2215 (handler polarity
// LOUD vs SILENT), s2216 (`spawnSync` never throws) and s2217 (enumeration vs classification) are
// ALL KEYED ON A `catch`. There is no catch here and nothing ever throws: `existsSync` returns
// false and the ternary hands back `[]`. A guard-keyed empty is invisible to a catch-keyed census
// BY CONSTRUCTION — the same way s2216 proved a catch-keyed census cannot see `spawnSync`.
// Measured s2218 over 326 non-test scripts/*.mjs: 6 guard-keyed empty enumerations in 5 files.
//
// PROVEN BY MANUFACTURING, ground truth = a runner IS holding this master, and per F-2215-1 the
// control asserted its own validity first (arm A produced 704 B — it really ran):
//   tasks/running present            -> ⛔ ALREADY DISPATCHED, rc=1        (correct)
//   tasks/running renamed away       -> ✅ CLEAR,             rc=0, 89 B  (defect)
//   REVERSE CONTROL, truly no run    -> ✅ CLEAR,             rc=0, 89 B  (correct)
// The defect arm and a genuinely clear board are BYTE-IDENTICAL on stdout AND stderr AND rc.
//
// ⚖️ REACHABILITY IS NOT EXOTIC — IT IS THE DESIGNED STATE OF THE DIRECTORY. `.gitignore:78` lists
// `tasks/running/` as "ephemeral filesystem state the runner manages", so it is absent from every
// fresh clone, removed by any `git clean -fdx`, and — measured s2218 — ABSENT FROM ALL FOUR LANE
// WORKTREES while `tasks/goals.json` is tracked and present in each. So in a worktree this file
// resolves its leaf, runs the whole queue path, and clears. §3.0b MANDATES gating undecided content
// in a detached worktree, which is precisely where the refusal cannot fire.
//
// 🛠️ THE CURE IS A DECLARATION, NOT A REFUSAL, AND THE RESTRAINT IS THE DESIGN. Refusing on
// `absent` is the OVER-GENERAL cure: absence is a LAWFUL routine state (see .gitignore above), so
// that arm would refuse legitimate dispatch after any `git clean -fdx` and be excused into
// uselessness inside a week — the `cross-engine` fate F-1460-1 names. Only `unreadable` — a
// directory that EXISTS and will not enumerate — is an unambiguous instrument failure, and only it
// refuses. `absent` is declared instead, ALWAYS, including on the happy path, because a
// declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1, and the
// §4 desk-header precedent: if the desk is genuinely empty, still write the header).
//
// Returns 'read' | 'absent' | 'unreadable'. Deliberately a STRING, for F-2212-1's reason: any
// careless truthiness test at a call site coerces every failure value to TRUE — i.e. toward
// NOTICING rather than toward the permissive silence — fail-safe by construction, not by
// discipline. Note this file's OTHER discriminator, `ancestryOfMain` (:313), exits 1 on its
// refusal; the newer 2 = "could not answer" / 1 = "answered, and the answer refuses" convention
// (F-2214-1, F-2215-1, F-2217-1) is used for the NEW arm only. Re-coding the old one would be a
// drive-by change to a cure that is working, so it is deliberately left alone.
function dispatchCorpus(dir) {
  if (!existsSync(dir)) return { state: 'absent', entries: [] };
  try {
    return { state: 'read', entries: readdirSync(dir) };
  } catch {
    return { state: 'unreadable', entries: [] };
  }
}

// `warnUndrained` (F-2097-1, s2097): the two arms are separable because they answer different
// questions. The live-run arm is a fact about tasks/running/ and is always sound. The undrained arm
// is a HEURISTIC — "un-prefixed = never drained" — that stands in for a fact the goal tree holds, so
// it is only trustworthy where a leaf was resolved. The UNKNOWN caller passes false; every other
// caller keeps the default and is unchanged.
function checkAlreadyDispatched(target, { warnUndrained = true } = {}) {
  const name = basename(target.trim());
  const runningDir = resolve(process.cwd(), 'tasks', 'running');
  const doneDir = resolve(process.cwd(), 'tasks', 'done');
  const RUNNING = new RegExp(`^[\\w.-]+--\\d{8}-\\d{6}-${escapeRe(name)}$`);
  const DONE = new RegExp(`^\\d{8}-\\d{6}-${escapeRe(name)}$`);

  const runningCorpus = dispatchCorpus(runningDir);
  // F-2218-1: the corpus exists and will not enumerate. That is the INSTRUMENT failing, not
  // evidence that no runner holds this master, so it refuses rather than clears. 2, not 1:
  // "could not answer" is a different act from "answered, and the answer refuses".
  if (runningCorpus.state === 'unreadable') {
    console.log(`\n  ⛔ CANNOT VERIFY — DO NOT QUEUE off this run: ${name}`);
    console.log(`    dispatch corpus : tasks/running/ EXISTS but could not be enumerated`);
    console.log(`    The duplicate-dispatch refusal (F-1322-1) reads that directory and nothing`);
    console.log(`    else. With it unreadable this check has no evidence either way, and an empty`);
    console.log(`    reading would be an affirmative licence to dispatch a master a runner may be`);
    console.log(`    holding RIGHT NOW. Fix the directory, then re-run:  ls tasks/running/\n`);
    return 2;
  }
  // F-2218-1: ALWAYS declared, including the happy path — a declaration that appears only on
  // failure cannot distinguish "asked and found nothing" from "never asked", which is the exact
  // ambiguity that made this defect byte-identical to a clean board.
  if (runningCorpus.state === 'absent') {
    console.log(`\n  ⚠️  DISPATCH CHECK NOT PERFORMED — tasks/running/ is absent under ${process.cwd()}`);
    console.log(`    This is LAWFUL (.gitignore:78 — ephemeral state the runner manages), so it is`);
    console.log(`    not a refusal. But it is NOT the same fact as "no runner holds this master":`);
    console.log(`    the directory is absent from every fresh clone and from all four lane`);
    console.log(`    worktrees, so if you are not at the repo root this check saw nothing at all.`);
    console.log(`    Any ✅ CLEAR below is silent on duplicate dispatch. Re-run from the repo root.`);
  }
  const live = runningCorpus.entries.filter((f) => RUNNING.test(f));
  if (live.length) {
    console.log(`\n  ⛔ ALREADY DISPATCHED — DO NOT QUEUE: ${name}`);
    for (const f of live) console.log(`    live run        : tasks/running/${f}`);
    console.log(`    refusal arm     : a runner holds this master RIGHT NOW (F-1322-1, the F-1307-1 class)`);
    console.log(`\n  Copying it again does not update the running copy — the runner MOVED the first one`);
    console.log(`  out of the queue (lane-runner-v3.sh:59), so a second copy is a second DISPATCH that`);
    console.log(`  fires the moment this slot frees. If you repaired the master after copying it, the`);
    console.log(`  repair belongs to the NEXT run of this work: let the live run finish, drain it, and`);
    console.log(`  judge the repaired master on its own evidence. Gate BEFORE the cp, not after`);
    console.log(`  (.claude/skills/author-task/SKILL.md:54).\n`);
    return 1;
  }

  // F-2218-1: the SIBLING instance of the same guard-keyed empty — "fix the CLASS, not the
  // instance" (the standing order this script's own family, F-1054-1..F-2195-1, is named for).
  // The asymmetry with the arm above is deliberate and is F-2216-1's polarity lesson: that corpus
  // feeds a REFUSAL the law acts on, this one feeds an advisory WARN, and `tasks/done/` is TRACKED
  // (present in all four worktrees, measured s2218) where `tasks/running/` is gitignored. So this
  // declares only when it could NOT read — an always-on line here would be noise on every run,
  // which is how a declaration decays into a formality.
  const doneCorpus = dispatchCorpus(doneDir);
  if (warnUndrained && doneCorpus.state !== 'read') {
    console.log(`\n  ⚠️  UNDRAINED-OUTPUT WARN NOT PERFORMED — tasks/done/ ${doneCorpus.state} under ${process.cwd()}`);
    console.log(`    Absence of the warning below is not evidence that no undrained output exists.`);
  }
  const undrained = doneCorpus.entries.filter((f) => DONE.test(f));
  if (warnUndrained && undrained.length) {
    console.log(`\n  ⚠️  UNDRAINED OUTPUT EXISTS for this master — not a refusal, but say why you are re-queueing.`);
    for (const f of undrained) console.log(`    done-move       : tasks/done/${f} (un-prefixed = never drained)`);
    console.log(`    §7.5 allows a re-dispatch only on a CHANGED PREMISE. An identical retry is forbidden.`);
    console.log(`    If the premise has not changed, DRAIN that output instead of re-deriving it (Mistake #8).\n`);
  }
  return 0;
}

function checkQueuedMasterCitations(target) {
  const repoRoot = process.cwd();
  const direct = resolve(repoRoot, target);
  const source = existsSync(direct) ? direct : resolve(repoRoot, 'tasks', basename(target));
  const taskFile = relative(repoRoot, source);
  const baseline = resolve(repoRoot, 'scripts', 'citation-title-baseline.json');
  if (!taskFile.startsWith(`tasks/`) || !existsSync(source) || !existsSync(baseline)) {
    console.error(`drain-block-check: cannot citation-check queued master "${target}".`);
    console.error(`  Expected the master under tasks/ and the citation baseline under scripts/.`);
    return 2;
  }

  const root = mkdtempSync(join(tmpdir(), 'gold-rush-queue-citations-'));
  try {
    mkdirSync(join(root, 'tasks'), { recursive: true });
    mkdirSync(join(root, 'e2e'), { recursive: true });
    mkdirSync(join(root, taskFile, '..'), { recursive: true });
    copyFileSync(source, join(root, taskFile));

    const e2e = resolve(repoRoot, 'e2e');
    if (existsSync(e2e)) {
      for (const entry of readdirSync(e2e)) symlinkSync(join(e2e, entry), join(root, 'e2e', entry));
    }
    writeFileSync(
      join(root, 'e2e', '__citation-sentinel.spec.ts'),
      `test('citation sentinel title stays resolvable', () => {});\n`,
    );
    writeFileSync(
      join(root, 'tasks', '__citation-sentinel.md'),
      '`e2e/__citation-sentinel.spec.ts:1` ("citation sentinel title stays resolvable")\n',
    );

    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['add', '--', taskFile, 'tasks/__citation-sentinel.md'], { cwd: root });
    const citationGuard = decodeURIComponent(new URL('./citation-title-guard.mjs', import.meta.url).pathname);
    const result = spawnSync(
      process.execPath,
      [citationGuard, '--root', root, '--baseline', baseline],
      { cwd: root, encoding: 'utf8', timeout: 30_000 },
    );
    if (result.status !== 0) {
      process.stdout.write(result.stdout || '');
      process.stderr.write(result.stderr || '');
    }
    return result.status ?? 2;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
