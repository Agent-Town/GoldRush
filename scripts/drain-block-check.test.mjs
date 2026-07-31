// drain-block-check.test.mjs — the §3.0 first-command-of-every-drain guard had NO test at all
// until s1248, and it is the only mechanism standing between a fire and F-1104-7 (s1104 merged
// owner-gated rf-34 off a sound-looking runner report, then reversed it the same fire).
//
// WHY THESE ARMS: F-1248-1 measured that the DRAIN path (no --queue) decided on `status === 'blocked'`
// alone, while the SAME file's --queue path also refused TERMINAL_CLOSED_STATUSES. So a leaf whose run
// STOPPED lawfully pending an owner fork printed "✅ CLEAR" at rc=0 on the path fire.md §3.0 calls the
// first command of every drain. Every arm below therefore comes in pairs: the refusal AND the control
// that proves the refusal is driven by the STATUS WORD rather than by the filename or the fixture.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./drain-block-check.mjs', import.meta.url));

// One leaf per fixture keeps the "longest match wins" tie-breaker out of the way — these arms are
// about the STATUS word, and a second leaf would test a different thing.
//
// F-1250-1 (s1250): that sentence was true of the arms above it and was ALSO this suite's blind spot.
// "A second leaf would test a different thing" is correct — and the different thing was broken. The
// multi-leaf arms at the bottom of this file use `fixtureN` and exist because the tie-break, declared
// out of scope here, was silently deciding refusals. A suite inherits the blind spots of its fixtures.
function fixture(leaf) {
  return fixtureN([leaf]);
}

function fixtureN(tasks) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-drain-block-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(
    path.join(dir, 'tasks', 'goals.json'),
    JSON.stringify({
      version: 1,
      goals: [{ id: 'factory-infra', title: 'Factory Infra', subgoals: [{ id: 'guards', title: 'Guards', tasks }] }],
    }),
  );
  fs.writeFileSync(
    path.join(dir, 'scripts', 'citation-title-baseline.json'),
    JSON.stringify({ grandfathered: {} }),
  );
  return dir;
}

function citationFixture(t, text, baseline = {}) {
  const taskFile = 'lane-a-citation-gate.md';
  const dir = fixture({
    id: 'citation-gate',
    title: 'Citation gate fixture',
    taskFile,
    status: 'queued',
  });
  cleanup(t, dir);
  fs.mkdirSync(path.join(dir, 'e2e'));
  fs.writeFileSync(
    path.join(dir, 'e2e', 'citation-gate.spec.ts'),
    `test('the citation remains recoverable after lines move', () => {});\n`,
  );
  fs.writeFileSync(path.join(dir, 'tasks', taskFile), text);
  fs.writeFileSync(
    path.join(dir, 'scripts', 'citation-title-baseline.json'),
    JSON.stringify({ grandfathered: baseline }),
  );
  return { dir, taskFile };
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8', timeout: 30_000 });
}

const cleanup = (t, dir) => t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

// The real shape that produced the false CLEAR: a lane-c done-move whose leaf STOPPED pending the
// unruled F-1219-1 owner fork, entered by its done-move filename exactly as §3.0 instructs.
const DONE_MOVE = 'stopped-item2-owner-fork-F1219-1-s1219-20260729-184515-lane-c-agent-rung-honest-gate.md';
const leafOf = (status, extra = {}) => ({
  id: 'agent-rung-honest-gate',
  title: 'Make the tool-surface permission gate able to express the rung it already declares',
  taskFile: 'lane-c-agent-rung-honest-gate.md',
  status,
  ...extra,
});

test('drain path REFUSES a terminal-closed leaf (F-1248-1) — and clears the same fixture when live', (t) => {
  const stopped = fixture(leafOf('stopped', { stoppedReason: 'LAWFUL ITEM-2 STOP; the cure is an OWNER design fork (F-1219-1).' }));
  const live = fixture(leafOf('building'));
  cleanup(t, stopped);
  cleanup(t, live);

  const refused = run(stopped, DONE_MOVE);
  assert.equal(refused.status, 1, `expected rc=1, got rc=${refused.status}\n${refused.stdout}${refused.stderr}`);
  assert.match(refused.stdout, /⛔ CLOSED — DO NOT DRAIN/);
  assert.match(refused.stdout, /status="stopped"/);
  // The refusal must state its cause, or it teaches the next fire nothing.
  assert.match(refused.stdout, /stoppedReason: LAWFUL ITEM-2 STOP/);
  // It must NOT borrow the --queue arm's wording: "already shipped" is a lie for a lawful stop.
  assert.doesNotMatch(refused.stdout, /ALREADY SHIPPED/);
  assert.doesNotMatch(refused.stdout, /DO NOT QUEUE/);

  // IN-TEST CONTROL — identical input, only the status word changed. If this also failed, the arm
  // above would be proving something about the filename (it contains "stopped-") rather than the leaf.
  const cleared = run(live, DONE_MOVE);
  assert.equal(cleared.status, 0, `control must CLEAR, got rc=${cleared.status}\n${cleared.stdout}`);
  assert.match(cleared.stdout, /✅ CLEAR/);
  assert.match(cleared.stdout, /status="building"/);
});

test('every TERMINAL_CLOSED word is refused on the drain path, and no other word is', (t) => {
  // Enumerating the vocabulary is the point: a guard that refuses 'stopped' but not 'superseded'
  // just moves the hole. 'void'/'abandoned' are unused in the tree today and are asserted anyway —
  // the set is the contract, not the current data.
  for (const status of ['stopped', 'superseded', 'void', 'abandoned']) {
    const dir = fixture(leafOf(status));
    cleanup(t, dir);
    const r = run(dir, DONE_MOVE);
    assert.equal(r.status, 1, `status="${status}" must refuse the drain, got rc=${r.status}\n${r.stdout}`);
    assert.match(r.stdout, /⛔ CLOSED — DO NOT DRAIN/);
  }
  // The deliberate boundary (see :216): merged/shipped still CLEAR, because /drain §3 re-asserts this
  // command on the merged tree and a unit drained by an earlier fire reads `merged`. Re-draining
  // merged work is caught by the two-dot diff; reddening a lawful re-check would be a false positive.
  for (const status of ['merged', 'shipped', 'planned', 'queued', 'building', 'diagnosed']) {
    const dir = fixture(leafOf(status, status === 'merged' ? { mergeHash: 'a'.repeat(40) } : {}));
    cleanup(t, dir);
    const r = run(dir, DONE_MOVE);
    assert.equal(r.status, 0, `status="${status}" must CLEAR the drain path, got rc=${r.status}\n${r.stdout}`);
    assert.match(r.stdout, /✅ CLEAR/);
  }
});

test('an owner BLOCK still outranks everything and still names the owner (unchanged by F-1248-1)', (t) => {
  const dir = fixture(leafOf('blocked', { blockedReason: 'OWNER DESIGN FORK - RULING REQUIRED (F-1219-1).' }));
  cleanup(t, dir);
  const r = run(dir, DONE_MOVE);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /⛔ BLOCKED — DO NOT DRAIN/);
  assert.match(r.stdout, /OWNER DESIGN FORK/);
  assert.match(r.stdout, /lifted by the OWNER/);
  // A block is a different animal from a closed question; the two must not print the same headline.
  assert.doesNotMatch(r.stdout, /⛔ CLOSED/);
});

test('--queue keeps its own wording and its own reason line', (t) => {
  const dir = fixture(leafOf('stopped', { stopNote: 'STOPPED LAWFULLY AT SCOPE 3; no mergeHash by design.' }));
  cleanup(t, dir);
  const r = run(dir, 'lane-c-agent-rung-honest-gate.md', '--queue');
  assert.equal(r.status, 1);
  assert.match(r.stdout, /⛔ CLOSED — DO NOT QUEUE/);
  assert.match(r.stdout, /left no commit to refuse it with/);
  assert.match(r.stdout, /stopNote: STOPPED LAWFULLY AT SCOPE 3/);
});

test('F-1311-2: --queue refuses a fresh bare citation and names the repair', (t) => {
  const { dir, taskFile } = citationFixture(t, '`e2e/citation-gate.spec.ts:1`\n');
  const r = run(dir, taskFile, '--queue');
  assert.equal(r.status, 1, `fresh bare citation must refuse, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /tasks\/lane-a-citation-gate\.md::e2e\/citation-gate\.spec\.ts:1/);
  assert.match(r.stdout, /Fix: quote the test title beside the citation/);
});

test('F-1311-2: --queue accepts the same citation with its test title', (t) => {
  const { dir, taskFile } = citationFixture(
    t,
    '`e2e/citation-gate.spec.ts:1` ("the citation remains recoverable after lines move")\n',
  );
  const r = run(dir, taskFile, '--queue');
  assert.equal(r.status, 0, `titled citation must clear, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /✅ CLEAR/);
});

test('F-1311-2: --queue respects the grandfathered baseline', (t) => {
  const key = 'tasks/lane-a-citation-gate.md::e2e/citation-gate.spec.ts:1';
  const { dir, taskFile } = citationFixture(t, '`e2e/citation-gate.spec.ts:1`\n', { [key]: 1 });
  const r = run(dir, taskFile, '--queue');
  assert.equal(r.status, 0, `grandfathered citation must clear, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /✅ CLEAR/);
});

test('F-1311-2: the drain arm remains unchanged for a fresh bare citation', (t) => {
  const { dir, taskFile } = citationFixture(t, '`e2e/citation-gate.spec.ts:1`\n');
  const r = run(dir, taskFile);
  assert.equal(r.status, 0, `drain arm must remain clear, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /✅ CLEAR/);
});

test('a closed leaf whose reason sits under a session-stamped key is still explained', (t) => {
  // Measured s1248: the six status:"stopped" leaves on main spelled their reason FIVE different ways
  // and `reason` was undefined on all six. "stoppedNote_s1216" is a real one — the near-miss-KEY
  // shape the F-1123-1 rider polices for "mergeCommit", one level up at the field name.
  const dir = fixture(leafOf('stopped', { stoppedNote_s1216: 'Premise not reproduced; do not re-queue as-is (F-1215-2).' }));
  cleanup(t, dir);
  const r = run(dir, DONE_MOVE);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /stoppedNote_s1216: Premise not reproduced/);

  // And when there is genuinely no reason anywhere, it must say so rather than print an empty line.
  // F-1249-1 changed this sentence deliberately: it used to end "the why lives only in BACKLOG/reviews",
  // which is a claim about two files this script never opens — and was false on all 3 live leaves that
  // printed it. The replacement states the SEARCH, which is the only thing the script actually knows.
  const bare = fixture(leafOf('stopped'));
  cleanup(t, bare);
  const r2 = run(bare, DONE_MOVE);
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /no reason-bearing key on this leaf — searched: id, title, taskFile, status/);
  assert.doesNotMatch(r2.stdout, /the why lives only in BACKLOG/);
});

test('F-1249-1: a session-stamped reason key that varies the STEM is explained, and non-reason keys are not', (t) => {
  // The arm above proved "stoppedNote_s1216" works. That spelling was the ONE s1248 held, and the
  // pattern it wrote (/^(stopped|stop|closed)Note/i) was anchored to that suffix stem — so the live
  // siblings that vary the stem printed silence: supersededNote_s1116 and drainNote_s1170 + note_s1170.
  const superseded = fixture(leafOf('superseded', { supersededNote_s1116: 'ITS 2a VERDICT IS OVERTURNED by reading the chain at source.' }));
  cleanup(t, superseded);
  const r = run(superseded, DONE_MOVE);
  assert.equal(r.status, 1, `expected rc=1, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /supersededNote_s1116: ITS 2a VERDICT IS OVERTURNED/);

  // RANKING: a closure-specific stem outranks a generic note, so the printed line is the relevant one.
  const both = fixture(leafOf('superseded', {
    note: 'FIRE-AUTHORED s1114 and queued same fire to lane-a.',
    drainNote_s1170: 'THE REMEDY IS REFUTED AND MUST NOT BE BUILT.',
  }));
  cleanup(t, both);
  const r2 = run(both, DONE_MOVE);
  assert.match(r2.stdout, /drainNote_s1170: THE REMEDY IS REFUTED/);
  assert.doesNotMatch(r2.stdout, /note: FIRE-AUTHORED/);

  // CONTROL — the widened match must key off reason-ish NAMES, not "any string on the leaf". A hash
  // pointer is not a cause, and printing one would be a well-formed lie in place of the old silence.
  const pointer = fixture(leafOf('superseded', { drainedBy: 'a0aae876', reportMergeHash: 'af226e93' }));
  cleanup(t, pointer);
  const r3 = run(pointer, DONE_MOVE);
  assert.match(r3.stdout, /no reason-bearing key on this leaf/);
  assert.doesNotMatch(r3.stdout, /a0aae876/);
});

test('F-1249-1: a stale blockedReason is never printed as the CLOSURE cause', (t) => {
  // The live case: autosprite-trial-gate. The owner CANNED it 2026-07-29, the leaf went superseded,
  // and it kept a pre-retirement blockedReason reading "OWNER-GATED ON CREDITS ... Lifted by the OWNER
  // only". s1248 read that field and escalated "a money-gated item has been quietly moved off Robin's
  // desk" to the next fire. Printing it as the closure cause would be WORSE than silence.
  const stale = fixture(leafOf('superseded', {
    blockedReason: 'OWNER-GATED ON CREDITS — NOT FIRE-QUEUEABLE, AND IT SPENDS MONEY. Lifted by the OWNER only.',
  }));
  cleanup(t, stale);
  const r = run(stale, DONE_MOVE);
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stdout, /OWNER-GATED ON CREDITS/);
  assert.doesNotMatch(r.stdout, /SPENDS MONEY/);
  assert.match(r.stdout, /no reason-bearing key on this leaf/);

  // CONTROL — the exclusion is about the KEY NAME, not the text. The identical sentence under
  // `closedReason` must print, or this arm would be asserting a censored substring rather than a rule.
  const live = fixture(leafOf('superseded', {
    closedReason: 'OWNER-GATED ON CREDITS — NOT FIRE-QUEUEABLE, AND IT SPENDS MONEY. Lifted by the OWNER only.',
  }));
  cleanup(t, live);
  const r2 = run(live, DONE_MOVE);
  assert.match(r2.stdout, /closedReason: OWNER-GATED ON CREDITS/);
});

test('F-1249-1: the leaf TITLE is printed on both refusal arms, even when a reason key exists', (t) => {
  // §4.7 puts an owner's verbatim ruling in the title ("owner directive, date"), so on a canned leaf
  // the title IS the cause and any reason key is secondary bookkeeping — which is exactly how
  // autosprite-trial-gate read: `note_s1174: Verified at source this fire` over an owner canning.
  const canned = fixture({
    id: 'autosprite-trial-gate',
    title: "autosprite.io Pro trial — CANNED (owner 2026-07-29, verbatim: 'this can be canned - we don't need that')",
    taskFile: 'autosprite-trial-gate.md',
    status: 'superseded',
    note_s1174: 'Verified at source this fire by reading the master.',
  });
  cleanup(t, canned);
  for (const args of [['autosprite-trial-gate.md'], ['--queue', 'autosprite-trial-gate.md']]) {
    const r = run(canned, ...args);
    assert.equal(r.status, 1, `expected rc=1 for ${args.join(' ')}\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /leaf title\s+: autosprite\.io Pro trial — CANNED \(owner 2026-07-29/);
    assert.match(r.stdout, /note_s1174: Verified at source/);
  }

  // CONTROL — a leaf with no title must say so rather than print a blank line or crash.
  const untitled = fixture(leafOf('stopped', { title: '' }));
  cleanup(t, untitled);
  const r2 = run(untitled, DONE_MOVE);
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /leaf title\s+: \(untitled leaf\)/);
});

test('--all reports terminal-closed leaves but its exit code still tracks BLOCKED alone', (t) => {
  const closedOnly = fixture(leafOf('stopped'));
  cleanup(t, closedOnly);
  const r = run(closedOnly, '--all');
  assert.equal(r.status, 0, `--all must not fail on a merely-closed board, got rc=${r.status}\n${r.stdout}`);
  // The headline counts BLOCKED only — a closed question is not owner debt and must not inflate it.
  assert.match(r.stdout, /Scanned 1 goal leaves — 0 BLOCKED\./);
  assert.match(r.stdout, /ALSO 1 TERMINAL-CLOSED/);
  assert.match(r.stdout, /agent-rung-honest-gate/);

  const blocked = fixture(leafOf('blocked', { blockedReason: 'OWNER DESIGN FORK.' }));
  cleanup(t, blocked);
  const r2 = run(blocked, '--all');
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /1 BLOCKED/);
  assert.doesNotMatch(r2.stdout, /ALSO \d+ TERMINAL-CLOSED/);
});

// ── F-1250-1: the MATCHER, not the status word ────────────────────────────────────────────────────
// The arms above all feed a one-leaf fixture, so they prove what the guard does once it has picked a
// leaf. These prove it picks the RIGHT one. The board's successor-naming convention manufactures the
// collision: a successor appends a suffix, so a predecessor's key is always a strict substring of its
// successor's. All 4 collisions measured on the 227 live leaves are that shape.
const PRED = {
  id: 'blocked-storage-boot',
  title: 'Storage boot, first pass',
  taskFile: 'lane-blocked-storage-boot.md',
  status: 'superseded',
  supersededBy: 'carried down by the -2 successor, which merged',
};
const SUCC = {
  id: 'blocked-storage-boot-2',
  title: 'Storage boot, second pass',
  taskFile: 'lane-blocked-storage-boot-2.md',
  status: 'merged',
  mergeHash: 'b'.repeat(40),
};

test('F-1250-1: an EXACT taskFile match outranks a longer-named sibling (no false CLEAR)', (t) => {
  // THE DEFECT, pre-fix: asking about the superseded predecessor by its own exact taskFile answered
  // "✅ CLEAR — lane-blocked-storage-boot-2.md [blocked-storage-boot-2] status=merged" at rc=0 — an
  // affirmative clearance over a terminal-closed leaf, naming a file the fire never asked about.
  // That is F-1104-7's shape a third time, reached through the matcher instead of the status word.
  const dir = fixtureN([PRED, SUCC]);
  cleanup(t, dir);
  const r = run(dir, PRED.taskFile);
  assert.equal(r.status, 1, `exact-named superseded leaf must refuse, got rc=${r.status}\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /⛔ CLOSED — DO NOT DRAIN: lane-blocked-storage-boot\.md \[blocked-storage-boot\]/);
  // The successor must be disclosed, not silently discarded — it is what the reader needs to judge
  // whether the stop is stale.
  assert.match(r.stdout, /also matched\s+: blocked-storage-boot-2\[merged\]/);

  // CONTROL 1 — the same predecessor ALONE. If this failed too, the arm above would be proving
  // something about the status word rather than about the shadowing.
  const alone = fixtureN([PRED]);
  cleanup(t, alone);
  const r1 = run(alone, PRED.taskFile);
  assert.equal(r1.status, 1);
  assert.doesNotMatch(r1.stdout, /also matched/);

  // CONTROL 2 — asking about the SUCCESSOR must still CLEAR. Without this, "make it refuse" would
  // pass by reddening every drain in the pair, which is the opposite failure.
  const r2 = run(dir, SUCC.taskFile);
  assert.equal(r2.status, 0, `the merged successor must still CLEAR, got rc=${r2.status}\n${r2.stdout}`);
  assert.match(r2.stdout, /✅ CLEAR — lane-blocked-storage-boot-2\.md \[blocked-storage-boot-2\]/);
});

test('F-1250-1: the reverse — a lawful merged drain is not reddened by a longer closed predecessor', (t) => {
  // The same asymmetry runs both ways: pre-fix, a merged successor whose key is a substring of a
  // longer superseded predecessor printed "⛔ CLOSED" at rc=1, blocking a lawful drain and naming a
  // file nobody asked about. A guard that cries wolf is spent as surely as one that clears wrongly.
  const longPred = { id: 'boot-first-pass-with-fixtures', title: 'long predecessor', taskFile: 'lane-storage-boot-2-first-pass-with-fixtures.md', status: 'superseded' };
  const shortSucc = { id: 'storage-boot-2', title: 'short successor', taskFile: 'lane-storage-boot-2.md', status: 'merged', mergeHash: 'c'.repeat(40) };
  const dir = fixtureN([longPred, shortSucc]);
  cleanup(t, dir);
  const r = run(dir, shortSucc.taskFile);
  assert.equal(r.status, 0, `the exactly-named merged leaf must CLEAR, got rc=${r.status}\n${r.stdout}`);
  assert.match(r.stdout, /✅ CLEAR — lane-storage-boot-2\.md \[storage-boot-2\]/);

  // CONTROL — the longer predecessor, asked directly, must still refuse. Exact-match-wins must not
  // have been implemented as "prefer the shorter key", which would pass this arm for the wrong reason.
  const r2 = run(dir, longPred.taskFile);
  assert.equal(r2.status, 1, `the superseded predecessor must still refuse, got rc=${r2.status}\n${r2.stdout}`);
  assert.match(r2.stdout, /⛔ CLOSED — DO NOT DRAIN: lane-storage-boot-2-first-pass-with-fixtures\.md/);
});

test('F-1250-1: with NO exact match, longest-wins still decides (the tie-break is kept, not replaced)', (t) => {
  // The done-move path relies on it: the input is a run-stamped filename, and after normalize() it
  // usually equals the taskFile — but not always, and when it does not, the longest containing key is
  // still the right answer. Exact-match-first must be a PRIORITY, not a replacement.
  const shortLeaf = { id: 'storage-boot', title: 'short', taskFile: 'lane-storage-boot.md', status: 'merged', mergeHash: 'd'.repeat(40) };
  const longLeaf = { id: 'storage-boot-2', title: 'long', taskFile: 'lane-storage-boot-2.md', status: 'superseded' };
  const dir = fixtureN([shortLeaf, longLeaf]);
  cleanup(t, dir);
  // Neither key equals this input; both are contained by it. The longer one must win.
  const r = run(dir, 'drained-s1250-abcd1234-20260730-083000-lane-storage-boot-2-final.md');
  assert.equal(r.status, 1, `longest inexact match must still decide, got rc=${r.status}\n${r.stdout}`);
  assert.match(r.stdout, /⛔ CLOSED — DO NOT DRAIN: lane-storage-boot-2\.md \[storage-boot-2\]/);
});

test('F-1250-1 rider: a blocked SIBLING still refuses, but now says which leaf you actually named', (t) => {
  // s1249 lead (I), measured live on lane-calibrate-suite-workers.md: the blocked arm deliberately
  // scans ALL hits (:220) rather than the winner, which is conservative and right — it can only ever
  // produce rc=1. But it made the named leaf unreachable in the OUTPUT: the reader saw only the -v2
  // owner block and never learned their own leaf was superseded. Refusal unchanged; the report is not.
  const blockedSucc = { ...SUCC, status: 'blocked', blockedReason: 'OWNER-GATED s1125 — the box, not the task.' };
  const dir = fixtureN([PRED, blockedSucc]);
  cleanup(t, dir);
  const r = run(dir, PRED.taskFile);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /⛔ BLOCKED — DO NOT DRAIN/);
  assert.match(r.stdout, /goal leaf\s+: blocked-storage-boot-2\s+\(tasks\/goals\.json, status="blocked"\)/);
  assert.match(r.stdout, /you asked about : blocked-storage-boot\s+status="superseded"/);

  // CONTROL — when the blocked leaf IS the one named, there is no second leaf to disclose and the
  // line must not appear. Otherwise the arm would pass on a guard that printed it unconditionally.
  const direct = fixtureN([blockedSucc]);
  cleanup(t, direct);
  const r2 = run(direct, blockedSucc.taskFile);
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /⛔ BLOCKED/);
  assert.doesNotMatch(r2.stdout, /you asked about/);
});

test('a missing leaf is still UNKNOWN-not-a-clearance, and --strict still escalates it', (t) => {
  const dir = fixture(leafOf('stopped'));
  cleanup(t, dir);
  const r = run(dir, 'stopped-s9999-20260730-000000-lane-z-no-such-slice.md');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\? UNKNOWN/);
  assert.match(r.stdout, /not a clearance/);
  const strict = run(dir, 'stopped-s9999-20260730-000000-lane-z-no-such-slice.md', '--strict');
  assert.equal(strict.status, 2);
});
