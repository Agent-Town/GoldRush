#!/usr/bin/env node
/**
 * desk-lock-predicate-guard.test.mjs — do all FOUR desk tools agree on what a
 * live ACTIVE lock line is? (F-2227-1, s2227.)
 *
 * WHY THIS EXISTS
 * ---------------
 * "Is line-1 a lock or a handoff?" is implemented FOUR times in this repo:
 * desk-carryforward-guard.mjs, desk-birth-guard.mjs and desk-declaration-guard.mjs
 * each export an identical isLockLine(), and desk-state-audit.mjs had its own.
 * Three were the robust form; the fourth was `line1.startsWith('ACTIVE')`,
 * written for a line-1 convention that has since been retired.
 *
 * Today's lock line reads `Last updated: <stamp> ACTIVE (sNNNN fire) — <intent>`,
 * which does not START with the word. Measured s2227 over all 4,639 STATUS.md
 * commits: the sibling predicate identifies 2,119 lock lines, `startsWith` only
 * 1,696 — 423 disagreements, and the disagreement is CURRENT.
 *
 * The consequence was not a false green — it was the loss of a DOCUMENTED
 * behaviour. desk-state-audit's lock branch became unreachable, so every lock
 * line fell through to `kind:'none'` and the tool REFUSED at rc=2 with "no desk
 * header on line-1", while fire.md §4 and gate-caller-baseline.json's F-1566-2
 * entry both tell a fire to expect a benign SKIP.
 *
 * The drift was silent because its direction was CONSERVATIVE. That is the
 * lesson worth guarding: a predicate can rot for hundreds of fires precisely
 * BECAUSE its failure is loud and safe, so nobody is ever forced to look at it.
 *
 * WHAT THIS ASSERTS — AND THE REVERSE CONTROLS THAT BOUND IT
 * ----------------------------------------------------------
 * A cure one level too general is the real hazard here: widening the predicate
 * until a HANDOFF line reads as a lock would make all four desk gates SKIP on
 * every handoff, silently retiring the entire desk-gating layer. Arms 3, 4 and 8
 * exist solely to catch that, and each was proven by manufacturing it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

import { desk } from './desk-state-audit.mjs';
import { isLockLine as carryforward } from './desk-carryforward-guard.mjs';
import { isLockLine as birth } from './desk-birth-guard.mjs';
import { isLockLine as declaration } from './desk-declaration-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUDITOR = path.join(HERE, 'desk-state-audit.mjs');

/**
 * Real line-1 shapes, copied verbatim from STATUS.md history rather than
 * invented — the s2227 measurement is only meaningful against the shapes the
 * factory actually writes.
 */
const CURRENT_LOCK =
  'Last updated: 2026-08-23T09:25Z ACTIVE (s2227 fire) — board triage; if dry, TEST the inherited aim (B)';
const OLDER_LOCK =
  'Last updated: 2026-08-23T08:57Z (s2226 fire) — ACTIVE — board triage; board reads DRY (dry-board-probe)';
const LEGACY_LOCK =
  'ACTIVE 2026-07-20T06:54Z (s752 fire) — drain the lane-a demo-profiles output';
const HANDOFF =
  "Last updated: 2026-08-23T09:14Z s2226 handoff, lock CLEARED — F-2226-1 cured. " +
  "\u{1F53A} **OWNER'S DESK — 1 awaiting a word.** \u{1F53A} **F-2190-2** the Durable Object call";

/**
 * A SELF-CONTAINED fixture board.
 *
 * main() resolves --backlog and --goals CWD-RELATIVELY (desk-state-audit.mjs:180),
 * so an arm that supplies only --status reads whatever board the runner happens
 * to stand in — and off the repo root that is an ENOENT refusal at rc=2, the
 * SAME exit code the desk-header refusal uses. Arm 8 below asserts rc=2, so it
 * passed for the wrong reason on the first writing of this file and only its
 * MESSAGE assertion exposed the confound. Every arm therefore supplies all three
 * paths explicitly: the fixture is hermetic and the live board is never read.
 */
function board(line1) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-lock-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(
    path.join(dir, 'STATUS.md'),
    line1 + '\n\n- **s0001 handoff (line-1 archive):** old\n',
  );
  fs.writeFileSync(
    path.join(dir, 'tasks', 'BACKLOG.md'),
    '# BACKLOG\n\n- 🔺 **F-2190-2** a carried owner item — GATE: owner ruling\n' +
      '- 🔺 **F-1234-5** another carried owner item — GATE: owner word\n',
  );
  fs.writeFileSync(path.join(dir, 'tasks', 'goals.json'), JSON.stringify({ children: [] }));
  return [
    '--status', path.join(dir, 'STATUS.md'),
    '--backlog', path.join(dir, 'tasks', 'BACKLOG.md'),
    '--goals', path.join(dir, 'tasks', 'goals.json'),
  ];
}

function run(args, cwd = HERE) {
  return spawnSync('node', [AUDITOR, ...args], { cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
}

// ARM 1 — THE DEFECT ARM. Pre-cure this reds: `startsWith('ACTIVE')` is false for
// the current convention, so desk() returned kind:'none' instead of kind:'lock'.
test('the CURRENT lock-line convention is classified as a lock', () => {
  assert.equal(desk(CURRENT_LOCK).kind, 'lock');
  assert.equal(desk(OLDER_LOCK).kind, 'lock');
});

// ARM 2 — REGRESSION. The retired convention must keep working: 1,696 of the
// 4,639 historical line-1s are this shape, and replaying history is a live
// instrument (this fire replayed 20 handoffs through these very tools).
test('the RETIRED startsWith-ACTIVE convention is still classified as a lock', () => {
  assert.equal(desk(LEGACY_LOCK).kind, 'lock');
});

// ARM 3 — REVERSE CONTROL. The over-general cure — treating any line naming
// ACTIVE as a lock — would make every desk gate SKIP on every handoff.
test('a real HANDOFF line is NOT a lock and still yields a desk', () => {
  const r = desk(HANDOFF);
  assert.equal(r.kind, 'desk');
  assert.ok(r.items.length > 0, 'a handoff with a desk header must yield items');
});

// ARM 4 — REVERSE CONTROL, the sharp one. A handoff whose PROSE narrates the
// word ACTIVE must still read as a handoff; `lock CLEARED` is what decides it.
test('a handoff whose prose contains ACTIVE is still a handoff', () => {
  const line =
    "Last updated: 2026-08-23T10:00Z s2228 handoff, lock CLEARED — the lane went ACTIVE mid-drain. " +
    "\u{1F53A} **OWNER'S DESK — 1 awaiting a word.** \u{1F53A} **F-1234-5** a thing";
  assert.equal(desk(line).kind, 'desk');
});

// ARM 5 — THE CLASS GUARD. Four implementations drifted apart once; assert they
// agree, so the next drift reds here instead of rotting silently for 423 lines.
test('all four desk tools agree on every real line-1 shape', () => {
  const corpus = [CURRENT_LOCK, OLDER_LOCK, LEGACY_LOCK, HANDOFF, '', 'Last updated: nothing here'];
  for (const line of corpus) {
    const votes = {
      carryforward: carryforward(line),
      birth: birth(line),
      declaration: declaration(line),
      'desk-state-audit': desk(line).kind === 'lock',
    };
    const distinct = new Set(Object.values(votes));
    assert.equal(
      distinct.size, 1,
      `the four lock predicates disagree on ${JSON.stringify(line.slice(0, 70))}: ${JSON.stringify(votes)}`,
    );
  }
});

// ARM 6 — THE OBSERVABLE (F-2210-1's rule). The pure function is not what a fire
// reads; assert the CLI's stdout and exit code, which is the whole interface.
test('CLI on a lock line prints SKIP at rc=0, the behaviour fire.md documents', () => {
  const r = run(board(CURRENT_LOCK));
  assert.equal(r.status, 0, `expected rc=0, got ${r.status}: ${r.stderr}`);
  assert.match(r.stdout, /SKIP — line-1 is a lock line/);
  assert.doesNotMatch(r.stderr, /no desk header/);
});

// ARM 7 — REVERSE CONTROL on the CLI: the prescribed --status path must not move.
test('CLI on a handoff still audits rather than skipping', () => {
  const r = run(board(HANDOFF));
  assert.equal(r.status, 0);
  assert.doesNotMatch(r.stdout, /SKIP —/);
});

// ARM 8 — REVERSE CONTROL. The genuine refusal must survive: a handoff-shaped
// line with NO desk header is still an rc=2 refusal, not a swallowed skip.
test('a non-lock line with no desk header still REFUSES at rc=2', () => {
  const r = run(board('Last updated: 2026-08-23T10:00Z s2228 handoff, lock CLEARED — no desk written'));
  assert.equal(r.status, 2, `expected the refusal to survive, got rc=${r.status}`);
  assert.match(r.stderr, /no desk header/);
});
