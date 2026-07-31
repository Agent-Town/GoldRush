#!/usr/bin/env node
// RULING PROPAGATION GUARD (s1279, F-1279-1).
//
// THE DEFECT IT EXISTS FOR. An owner ruling is recorded in `tasks/BACKLOG.md` as prose, but the
// thing that actually REFUSES work is `tasks/goals.json` — read by scripts/drain-block-check.mjs,
// the §3.0 first-command-of-every-drain guard. Those two surfaces are joined by nothing but a
// fire remembering to edit both. On 2026-07-30 commit 9c621751 recorded the owner's agent-verb-rung
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = process.argv.includes('--report');

// Mirrors scripts/drain-block-check.mjs — a leaf in one of these refuses a drain, so a stale reason
// here has the same cost as a stale `blocked`.
const TERMINAL_CLOSED_STATUSES = new Set(['superseded', 'void', 'abandoned', 'stopped']);
const REFUSAL_REASON_KEYS = [
  'blockedReason', 'closedReason', 'stoppedReason', 'stopNote', 'supersededBy', 'reason',
];
const FINDING = /\bF-\d+-\d+\b/g;

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
  for (const leaf of refusingLeaves(goals)) {
    const reason = REFUSAL_REASON_KEYS.map((k) => leaf[k] || '').join(' ');
    const cited = new Set(reason.match(FINDING) || []);
    const hits = [...cited].filter((id) => ruled.has(id));
    if (hits.length) stale.push({ leaf, hits, ruledAt: hits.map((h) => ruled.get(h)) });
  }
  return { stale, ruledCount: ruled.size, ruled };
}

function main() {
  const goals = JSON.parse(fs.readFileSync(path.join(ROOT, 'tasks/goals.json'), 'utf8'));
  const backlog = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
  const { stale, ruledCount } = staleRefusals(goals, backlog);
  const refusing = refusingLeaves(goals).length;

  console.log(
    `ruling-propagation: ${ruledCount} findings recorded RULED · ${refusing} goal leaves still refuse work · ${stale.length} stale`,
  );

  if (REPORT) {
    for (const leaf of refusingLeaves(goals)) {
      console.log(`  ${String(leaf.status).padEnd(11)} ${leaf.id}`);
    }
  }

  if (!stale.length) {
    console.log('PASS — no refusal cites a finding the owner has already ruled.');
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
