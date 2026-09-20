#!/usr/bin/env node
/**
 * add-goal-leaf.mjs — register the s1472 direct corrective under factory-truth.
 *
 * Goal Registration Law: a direct corrective is still shipped work and still
 * owes the goal tree a row (s1463's ruling). Shape copied from the comparable
 * no-taskFile leaves f1402-1-main-lock-gate / f1457-1-guard-the-external-gate-server.
 *
 * The mergeHash is the CODE commit, which is why this is a separate commit from
 * it: a commit cannot contain its own hash (F-1384-1), and goal-tracker.test.mjs
 * requires /^[0-9a-f]{40}$/.
 */
import fs from 'node:fs';

const HASH = '21b22c39f79abf79a7e448b259ae713844e78111';
const g = JSON.parse(fs.readFileSync('tasks/goals.json', 'utf8'));
const sg = g.goals.find((x) => x.id === 'factory-infra').subgoals.find((s) => s.id === 'factory-truth');

const id = 'f1471-3-desk-guard-line1-anchor';
if (sg.tasks.some((t) => t.id === id)) {
  console.log('leaf already present — nothing to do');
  process.exit(0);
}

sg.tasks.push({
  id,
  title:
    "F-1471-3: desk-declaration-guard searched the WHOLE of STATUS.md for one spelling of the desk header and took the FIRST hit, so a headerless or possessively-spelled line-1 silently resolved to an ARCHIVED desk — which is by construction already declared, so it reported a clean board. Anchor to line 1, match all four spellings, refuse rather than read an archive.",
  status: 'merged',
  mergeHash: HASH,
  attempts: 1,
  authoredBy: 's1472 fire (FIRE-AUTHORED, direct corrective — no lane master)',
  drainNotes:
    's1472. Not a drain: board was drain-dry (six queues empty, every done-move prefixed, failed/ all prefixed, no CODEX-WALL, assayer pending empty) and lane-a was LIVE on e3-crawler-socket, so the fire took the flagged red corrective instead. ' +
    'PROVEN FAIL-CLOSED, not by a green: 7 new tests each manufacture a violation and drive a specific exit code — an archived desk never satisfies the guard (exit 2), an archived desk cannot MASK an undeclared live item (exit 1 naming it), all four spellings are read, an ACTIVE lock line SKIPs, a lock line mentioning the desk in prose is still a lock, an upstream prose mention loses to the real tail header. ' +
    'ALSO PROVEN ON THE REAL BOARD: reconstructing STATUS.md as it stood at s1471 and rewriting only the desk word to the majority spelling, the OLD parser reads 145 F-IDs (the s1414 archive of 2026-08-03) and the NEW reads the live 8; control arm (s1471 verbatim, bare spelling) both agree at 8. ' +
    'A separator whitelist was the obvious design and was refuted by measuring all 617 historical desk-bearing line-1s before building it: it would have failed CLOSED on hundreds of legitimate headers. ' +
    'CLASS FIX: the guard own test file re-implemented the same broken selector to check the grandfather list and read the same stale archive; it imports deskIds now. ' +
    'Gates: test:node-guards 299 tests / 296 pass / 0 fail / 3 skipped rc=0 (292 before). Law pointer attended-owed-audit.mjs:20 -> desk-declaration-guard.mjs:26-34 re-verified INTACT by reading. ' +
    'Uncovered F-1472-1 (the desk header is a lapsed convention: 632 of 1249 line-1s carry no desk word), enforced this fire under a veto window with the duty written into scripts/fire.md section 4.',
});

fs.writeFileSync('tasks/goals.json', JSON.stringify(g, null, 2) + '\n');
console.log(`added leaf ${id} under factory-infra/factory-truth (${sg.tasks.length} leaves)`);
