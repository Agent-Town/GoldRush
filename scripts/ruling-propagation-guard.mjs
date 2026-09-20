#!/usr/bin/env node
// RULING PROPAGATION GUARD (s1279, F-1279-1).
//
// THE DEFECT IT EXISTS FOR. An owner ruling is recorded in `tasks/BACKLOG.md` as prose, but the
// thing that actually REFUSES work is `tasks/goals.json` — read by scripts/drain-block-check.mjs,
// the §3.0 first-command-of-every-drain guard. Those two surfaces are joined by nothing but a
// fire remembering to edit both. On 2026-07-30 commit 27346d6d recorded the owner's agent-verb-rung
// ruling ("F-1219-1 RULED") and, in the SAME commit, executed the ruling's other half as a real
// permission change to .claude/settings.json — but never touched goals.json. The leaf
// `ap-06b-adapter-wiring` therefore kept `status:"blocked"` with a blockedReason that asked for the
// very ruling that had just been given, and drain-block-check kept returning ⛔ BLOCKED for 21 hours
// across three fires (s1276/s1277/s1278), each of which read the board as "lanes owner-blocked, do
// NOT invent scope" and stood down. The ruling freed three items and the mechanism refused all three.
//
// WHAT IT CHECKS. For every goal leaf that still REFUSES work (status "blocked", or a terminal-closed
// status that drain-block-check refuses), extract the F-ids named in its refusal reason. Red if any
// of those F-ids is recorded in BACKLOG as RULED by the owner. A refusal that cites an answered
// question is, by construction, stale.
//
// WHY THIS SHAPE. The narrow, explicit `F-<id> RULED` spelling is deliberate: it is the phrasing the
// ledger already uses for a delivered ruling, and it keeps the guard from firing on the far commoner
// "RULING REQUIRED" / "needs the owner ruling" prose that a LIVE block is supposed to contain.
// Widen the vocabulary only when the practice widens it — the same reasoning goal-tracker.test.mjs
// applies to its status set, and the opposite of fitting a guard to whatever its data happens to say.
//
// Usage:
//   node scripts/ruling-propagation-guard.mjs            # exit 1 on any stale refusal
//   node scripts/ruling-propagation-guard.mjs --report    # print what it matched, always exit 0

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FINDING } from './findings-state-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = process.argv.includes('--report');

// Mirrors scripts/drain-block-check.mjs — a leaf in one of these refuses a drain, so a stale reason
// here has the same cost as a stale `blocked`.
const TERMINAL_CLOSED_STATUSES = new Set(['superseded', 'void', 'abandoned', 'stopped']);

// F-2247-1 (s2247). This list was a subject test by FORMAT under a claim defined by ROLE: the
// verdict below says "no REFUSAL cites a finding the owner has already ruled" — universal over
// refusals — while the list read six exact spellings. MEASURED on the live tree: 17 of the 44
// refusing leaves (38.6%) carried NONE of the six, so the scan joined an EMPTY string and could
// never red on them whatever they said — 38,681 chars of refusal prose unread, 13 of the 17 citing
// an F-id. The tree holds 138 reason/note spellings, and this guard was reading `closedReason`
// (4 uses or fewer) while ignoring `closureReason` (24), `drainNotes` (172), `note` (160) and
// `authorNotes` (146). The file already mirrors drain-block-check.mjs for the status set and for
// the leaf definition; it had not mirrored the one thing that decides what it reads.
//
// WIDENED to the spellings whose NAME states the refusal BASIS. Residue 17 -> 5, verdict unchanged.
const REFUSAL_REASON_KEYS = [
  'blockedReason', 'closedReason', 'stoppedReason', 'stopNote', 'supersededBy', 'reason',
  'closureReason', 'supersededReason', 'stoppedNote', 'closedNote', 'voidReason', 'abandonedReason',
  'supersededNote', 'drainNote',
];

// DELIBERATELY NOT WIDENED to the narrative fields `note`, `drainNotes` (plural) and `authorNotes`,
// and the boundary is MEASURED rather than stylistic: a union scan over them reds on THREE live
// leaves and ALL THREE reds are FALSE. b4v2-picnic-stake-pressure and vp-02e-jumper-8way-activation
// each RECORD that a ruling was propagated ("(F-2085-1 RULED)", "OWNER RULING PROPAGATED s1655"),
// and lane-vp-02b-jumper-slot-red's drainNotes REFUTES the citation outright ("It is NOT --
// F-1166-1 ... treats this spec as GREEN"). In a narrative field an F-id is as likely to be a
// refutation or a propagation record as a basis. Redding there would turn this guard's own remedy
// text — "say so without naming the ruled finding" — into an instruction to DELETE propagation
// records, i.e. to corrupt correct bookkeeping under the Retention Law, and a guard that fires on
// ordinary correct work is excused into uselessness inside a week (F-1460-1).
//
// EXCLUDED for the reason drain-block-check excludes them: `prior*` spellings are RETIRED reasons
// kept for history (agent-rung-honest-gate's own authorNotes says the ruling OVERTURNS the prior
// one), and `authorNotes*` is written at AUTHORING time, so it states intent, never outcome.
const RETIRED_OR_AUTHORING = /^(prior|authorNotes)/i;

// A session stamp is not a new field: `stoppedNote_s1263` and `stoppedNote` are the same record,
// and s1249 lost three leaves to exactly this by anchoring on one stamped spelling's suffix.
export function refusalText(leaf) {
  const parts = [];
  for (const key of Object.keys(leaf)) {
    if (RETIRED_OR_AUTHORING.test(key)) continue;
    const stem = key.replace(/_s\d+.*$/i, '');
    if (!REFUSAL_REASON_KEYS.includes(stem)) continue;
    if (typeof leaf[key] === 'string' && leaf[key].trim()) parts.push(leaf[key].trim());
  }
  return parts.join(' ');
}

// Extracted so the HAPPY path can be exercised rather than admired: main() reads the live tree
// through an import.meta.url-anchored ROOT, so no fixture can drive it to unreadable === 0, and a
// CLI-only assertion would pass just as well if the line were printed on failure alone (F-2209-1).
export function corpusDeclaration(refusing, unreadable) {
  return `  reason corpus     : ${refusing - unreadable}/${refusing} refusals state their basis under a key this guard reads`
    + (unreadable ? ` · ${unreadable} DECLARED UNREAD` : '');
}

// Likewise the verdict: it used to read as universal over refusals while the scan was silent about
// the ones it could not read at all.
export function passVerdict(unreadable) {
  return unreadable
    ? `PASS — no READABLE refusal cites a finding the owner has already ruled. ${unreadable} refusal(s) state their basis in a narrative field this guard does not scan; their text is above.`
    : 'PASS — no refusal cites a finding the owner has already ruled.';
}
// FINDING is IMPORTED, not redeclared — see findings-state-guard.mjs (F-2228-1).
// The private copy this replaced could not see a lettered id, so a refusal citing
// one the owner had already ruled was invisible to this guard by construction.

export function ruledFindings(backlogText) {
  const ruled = new Map(); // id -> line number
  for (const [index, line] of backlogText.split('\n').entries()) {
    // "F-1219-1 RULED", "F-1024-4 RULED:", "F-1212-5 RULED" — the id immediately before the verb.
    for (const m of line.matchAll(/\b(F-\d+-\d+)\s+RULED\b/g)) {
      if (!ruled.has(m[1])) ruled.set(m[1], index + 1);
    }
  }
  return ruled;
}

// MIRRORS scripts/drain-block-check.mjs:136 EXACTLY, and the fidelity is load-bearing. A "leaf" in
// this tree is ANY node carrying a `taskFile` string — NOT a childless node. The first draft of this
// guard used the childless definition, found 0 refusing leaves against drain-block-check's 4, and
// would have shipped a vacuous PASS. Measure the subject with the subject's own instrument.
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

export function refusingLeaves(goals) {
  return collectLeaves(goals).filter(
    (leaf) => leaf.status === 'blocked' || TERMINAL_CLOSED_STATUSES.has(leaf.status),
  );
}

export function staleRefusals(goals, backlogText) {
  const ruled = ruledFindings(backlogText);
  const stale = [];
  const unreadable = [];
  for (const leaf of refusingLeaves(goals)) {
    const reason = refusalText(leaf);
    // A refusal whose basis is stored under none of the read spellings is a HOLE IN THE
    // DENOMINATOR, not a clean subject. It is counted and named rather than refused on: an
    // unreadable reason is a lawful, routine state (F-2218-1's restraint).
    if (!reason) unreadable.push(leaf);
    const cited = new Set(reason.match(FINDING) || []);
    const hits = [...cited].filter((id) => ruled.has(id));
    if (hits.length) stale.push({ leaf, hits, ruledAt: hits.map((h) => ruled.get(h)) });
  }
  return { stale, ruledCount: ruled.size, ruled, unreadable };
}

function main() {
  const goals = JSON.parse(fs.readFileSync(path.join(ROOT, 'tasks/goals.json'), 'utf8'));
  const backlog = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
  const { stale, ruledCount, unreadable } = staleRefusals(goals, backlog);
  const refusing = refusingLeaves(goals).length;

  console.log(
    `ruling-propagation: ${ruledCount} findings recorded RULED · ${refusing} goal leaves still refuse work · ${stale.length} stale`,
  );

  // Printed ALWAYS, including the happy path: a declaration that appears only on failure re-creates
  // the ambiguity it removes (F-2208-1). This line is the difference between "I read 44 refusals
  // and found nothing" and "I read 39 of them".
  console.log(corpusDeclaration(refusing, unreadable.length));
  for (const leaf of unreadable) {
    const keys = Object.keys(leaf).filter((k) => /note|reason/i.test(k)).join(', ') || '(no reason-bearing key)';
    console.log(`      unread: ${String(leaf.status).padEnd(11)} ${leaf.id}  [${keys}]`);
  }

  if (REPORT) {
    for (const leaf of refusingLeaves(goals)) {
      console.log(`  ${String(leaf.status).padEnd(11)} ${leaf.id}`);
    }
  }

  if (!stale.length) {
    console.log(passVerdict(unreadable.length));
    return 0;
  }

  for (const { leaf, hits, ruledAt } of stale) {
    console.log(`\n  ⛔ STALE REFUSAL — ${leaf.id}  (status="${leaf.status}", ${leaf.taskFile})`);
    console.log(`     cites RULED: ${hits.map((h, i) => `${h} (BACKLOG.md:${ruledAt[i]})`).join(', ')}`);
    console.log('     The owner answered this. Propagate the ruling into the leaf — status + reason —');
    console.log('     or, if the leaf is blocked on something ELSE, say so in the reason without');
    console.log('     naming the ruled finding.');
  }
  return REPORT ? 0 : 1;
}

// NOTE: the usual `import.meta.url === \`file://${process.argv[1]}\`` idiom is WRONG in this repo —
// the checkout path contains a space ("Gold Rush"), which import.meta.url percent-encodes to %20
// while process.argv[1] does not. The comparison silently fails and main() never runs, so the guard
// prints nothing and exits 0: a green that means "executed nothing", the worst kind. Compare
// resolved paths instead.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
