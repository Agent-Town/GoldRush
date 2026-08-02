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
import { basename, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
const GOALS = 'tasks/goals.json';
const BACKLOG = 'tasks/BACKLOG.md';

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

function closedReason(leaf) {
  for (const key of CLOSED_REASON_KEYS) {
    const value = leaf[key];
    if (typeof value === 'string' && value.trim()) return `${key}: ${value.trim()}`;
  }
  const candidates = Object.keys(leaf).filter(
    (key) =>
      !NOT_A_CLOSURE_REASON.has(key) &&
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

function isMainAncestor(mergeHash) {
  if (typeof mergeHash !== 'string' || !mergeHash.trim()) return false;
  const hash = mergeHash.trim();
  try {
    execFileSync('git', ['cat-file', '-e', '--', `${hash}^{commit}`], { stdio: 'ignore', timeout: 2_000 });
    execFileSync('git', ['merge-base', '--is-ancestor', '--', hash, 'main'], { stdio: 'ignore', timeout: 2_000 });
    return true;
  } catch {
    return false;
  }
}

function collectLeaves(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectLeaves(child, out);
    return out;
  }
  if (typeof node.taskFile === 'string') out.push(node);
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectLeaves(value, out);
  }
  return out;
}

// Reduce any input shape to the bare slice name:
//   20260727-011937-lane-hero-y-restore-roundtrip.md          (done-move)
//   OWNER-GATED-F-1096-2-do-not-drain-20260727-011937-lane-... (renamed done-move)
//   tasks/lane-hero-y-restore-roundtrip.md                     (master)
//   lane/m3                                                    (branch — matched loosely)
function normalize(raw) {
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
    const taskKey = normalize(leaf.taskFile).toLowerCase();
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

  if (!existsSync(GOALS)) {
    console.error(`drain-block-check: ${GOALS} not found (run from the repo root)`);
    process.exit(2);
  }
  const leaves = collectLeaves(JSON.parse(readFileSync(GOALS, 'utf8')));

  if (all) {
    const blocked = leaves.filter((l) => l.status === 'blocked');
    console.log(`Scanned ${leaves.length} goal leaves — ${blocked.length} BLOCKED.`);
    for (const leaf of blocked) {
      console.log(`\n  BLOCKED  ${leaf.taskFile}  [${leaf.id}]`);
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
        console.log(`    ${String(leaf.status).padEnd(11)} ${leaf.taskFile}  [${leaf.id}]`);
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
        console.log(`  you asked about : ${hits[0].id}  status="${hits[0].status}" (${hits[0].taskFile})`);
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
    ? hits.find((l) => normalize(l.taskFile).toLowerCase() === normalize(target).toLowerCase())
    : hits[0];
  const branchFallback = branchShaped && !queueTaskFile;
  if (!leaf || branchFallback) {
    console.log(`  ? UNKNOWN — no ${branchFallback ? 'BLOCKED ' : ''}goal leaf matches "${target}".`);
    console.log(`${branchFallback ? '    (branch names are not registered as leaves — check the done-move filename too)\n' : ''}    Goal Registration Law: every authored master registers a leaf in ${GOALS}.\n    A missing leaf is a bookkeeping finding, not a clearance.`);
    process.exit(strict ? 2 : 0);
  }

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
    console.log(`\n  ⛔ CLOSED — DO NOT DRAIN: ${leaf.taskFile} [${leaf.id}]`);
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
    const shippedByAncestry = !shippedByStatus && isMainAncestor(leaf.mergeHash);
    const closedByStatus = TERMINAL_CLOSED_STATUSES.has(leaf.status);
    if (shippedByStatus || shippedByAncestry) {
      console.log(`  ⛔ ALREADY SHIPPED — DO NOT QUEUE: ${leaf.taskFile} [${leaf.id}]`);
      console.log(`    mergeHash="${leaf.mergeHash || '(not recorded)'}"`);
      console.log(`    refusal arm=${shippedByStatus ? `status="${leaf.status}"` : `mergeHash is an ancestor of main (status="${leaf.status}")`}`);
      process.exit(1);
    }
    if (closedByStatus) {
      // Deliberately a DIFFERENT headline: "already shipped" would be a lie for a master that
      // never merged a line, and a wrong reason teaches the next fire the wrong lesson.
      console.log(`  ⛔ CLOSED — DO NOT QUEUE: ${leaf.taskFile} [${leaf.id}]`);
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
  console.log(`  ✅ CLEAR — ${leaf.taskFile} [${leaf.id}] status="${leaf.status}"`);
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
// master it had just dispatched, repaired it at 08:40:53 (`a5c6cd1d`, +14 lines of quoted test
// titles), and re-copied. The runner holds one pidfile per slot, so the second copy simply WAITED —
// and the instant run 1 released the slot at 08:57:30 it dispatched the 9,856-byte version as run 2.
// Two runs, one master, two VERSIONS: exactly F-1307-1, five sessions after its cure shipped.
//
// The cost differs from s1307's in a way worth recording. There, run 2's safe-dupe pre-flight read
// HOLDS and stopped. Here the corrective's pre-flight is deliberately BUILD-ON-PREDECESSOR (lane/m4
// is intentionally ahead — resetting it would destroy the Drill Yard), so nothing stopped run 2 and
// it re-derived work run 1 had already committed at `74df35dc`, on top of a 250,318-token run 1.
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

function checkAlreadyDispatched(target) {
  const name = basename(target.trim());
  const runningDir = resolve(process.cwd(), 'tasks', 'running');
  const doneDir = resolve(process.cwd(), 'tasks', 'done');
  const RUNNING = new RegExp(`^[\\w.-]+--\\d{8}-\\d{6}-${escapeRe(name)}$`);
  const DONE = new RegExp(`^\\d{8}-\\d{6}-${escapeRe(name)}$`);

  const live = existsSync(runningDir) ? readdirSync(runningDir).filter((f) => RUNNING.test(f)) : [];
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

  const undrained = existsSync(doneDir) ? readdirSync(doneDir).filter((f) => DONE.test(f)) : [];
  if (undrained.length) {
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
