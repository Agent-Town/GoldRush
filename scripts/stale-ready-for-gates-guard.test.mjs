// Tests for stale-ready-for-gates-guard (F-1461-4, built s1483).
//
// These exercise the exported predicate directly on synthetic rows rather than building a
// temp-dir corpus. That is deliberate: s1482's sibling guard test leaked 8 temp dirs and was
// caught only by `fixture-teardown`, invisible to its own greens. No fixture, no leak.
//
// THE CENTRAL CASES ARE REAL, NOT INVENTED. Rows 1 and 2 are verbatim from git history — a
// green that never executes the violation path is not evidence (the s1299/s1300 standard).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { classifyRow, headline, indexLeaves, LANDED } from './stale-ready-for-gates-guard.mjs';

const GUARD = path.join(path.dirname(fileURLToPath(import.meta.url)), 'stale-ready-for-gates-guard.mjs');
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// A miniature goal tree carrying only what these rows resolve against.
const KEYS = indexLeaves({
  goals: [
    {
      id: 'root',
      subgoals: [
        {
          id: 'era',
          tasks: [
            { id: 'er-01-e4-census', taskFile: 'lane-er01-e4-census.md', status: 'merged', mergeHash: 'f'.repeat(40) },
            { id: 'e3-moth-socket', taskFile: 'lane-e3-moth-socket.md', status: 'merged', mergeHash: '4'.repeat(40) },
            { id: 'board-chapter-seed-scope', taskFile: 'lane-board-chapter.md', status: 'shipped' },
            { id: 'still-building-slice', taskFile: 'lane-still-building.md', status: 'building' },
          ],
        },
      ],
    },
  ],
});

// ── 1. THE HISTORICAL INCIDENT (verbatim, pre-a678fe3f0 tasks/BACKLOG.md:2978) ──────────────
// The row s1461 retired BY HAND. If the guard cannot see this, it does not close F-1461-4.
const INCIDENT =
  '- ⚙️ **ER-01 E4 GOAL LEAF `er-01-e4-census` — READY-FOR-GATES on lane/c (2026-08-05).** ' +
  'Census result: 0 AGENT-READY, 4 DATA-GAP, 0 BROKEN; all four Motor contracts correctly remain outside SUPPORTED_CONTRACTS.';

test('reds on the s1461 incident row that motivated the finding', () => {
  const c = classifyRow(INCIDENT, KEYS);
  assert.equal(c.verdict, 'STALE');
  assert.equal(c.key, 'er-01-e4-census');
  assert.equal(c.status, 'merged');
});

// ── 2. THE RECURRENCE (verbatim, tasks/BACKLOG.md:2992 as found s1483) ──────────────────────
// Filed s1461, recurred eight fires later at s1469 — the proof hand-retirement does not scale.
const RECURRENCE =
  '- 🟡 **GOAL LEAF `e3-moth-socket`: lane implementation READY-FOR-GATES on `lane/a`; merge receipt awaits the drain.** ' +
  'Moth Season is now **AGENT-READY 2 of 4** with production swarm/light behavior.';

test('reds on the live e3-moth-socket ghost line', () => {
  const c = classifyRow(RECURRENCE, KEYS);
  assert.equal(c.verdict, 'STALE');
  assert.equal(c.key, 'e3-moth-socket');
});

// ── 3. THE FALSE POSITIVE THIS GUARD REDDED ON ITSELF (tasks/BACKLOG.md:2518) ───────────────
// A 3,478-char row about rf-37 that cites `board-chapter-seed-scope` only as a load-average
// aside. Mentioning a leaf is not claiming to be that leaf.
test('stays silent on a leaf mentioned in the body as an aside', () => {
  const row =
    '🟠 **F-1112-3 — rf-37 ATTEMPT 3 CAME BACK `READY-FOR-GATES` AND ITS PREMISE HELD.** ' +
    'Load was CERTAINLY MINE, NOT THE SLICE: sysctl read 27.55 during the run, because ' +
    "lane-c's `board-chapter-seed-scope` was dispatched by this same fire, and the run came back READY-FOR-GATES anyway.";
  assert.equal(classifyRow(row, KEYS).verdict, 'body-only');
});

// ── 4. ARM (a)'s REJECTION, MECHANISED ──────────────────────────────────────────────────────
// The gate as filed said "any READY-FOR-GATES/🟡 row whose goal leaf is merged". 18 of the 20
// rows that would have redded are 🟡 OPEN FINDINGS whose slice merged — normal, not stale.
// A guard that reds on these is wrong 18 times out of 20, so the 🟡 clause is NOT enforced.
test('does not red on an open 🟡 finding whose slice merged (arm (a) is rejected)', () => {
  const row =
    '🟡 **F-1362-1 (s1362, MEASURED — THE TREE IS DIRTY BY DESIGN).** The `e3-moth-socket` slice ' +
    'merged, and this finding about it remains open, as findings routinely do.';
  assert.notEqual(classifyRow(row, KEYS)?.verdict, 'STALE');
});

// ── 5. QUOTATION vs CLAIM ───────────────────────────────────────────────────────────────────
test('treats a backticked mention as a quotation, not a claim', () => {
  const row = '- 🚀 **`e3-moth-socket` run log ends `READY-FOR-GATES` as expected.** Narrative follows.';
  assert.equal(classifyRow(row, KEYS).verdict, 'quoted');
});

// ── 6. CLOSED ROWS ARE HISTORY ──────────────────────────────────────────────────────────────
test('stays silent on a row already marked closed', () => {
  const row = '✅ **`e3-moth-socket` GOAL LEAF READY-FOR-GATES row CLOSED s1469.** Retired by hand.';
  assert.equal(classifyRow(row, KEYS).verdict, 'closed-row');
});

// ── 7. THE GUARD MUST NOT RED ON WORK GENUINELY IN FLIGHT ───────────────────────────────────
// This is the whole point of the status test: a real READY-FOR-GATES claim is CORRECT until
// its leaf lands. Reding here would make the guard punish honest bookkeeping.
test('stays silent while the leaf has not landed', () => {
  const row = '- ⚙️ **GOAL LEAF `still-building-slice` — READY-FOR-GATES on lane/d.** Awaiting the drain.';
  const c = classifyRow(row, KEYS);
  assert.equal(c.verdict, 'in-flight');
  assert.equal(c.status, 'building');
});

// ── 8. UNADJUDICABLE ROWS ARE DECLARED, NOT GUESSED ─────────────────────────────────────────
test('reports a claim it cannot resolve rather than guessing', () => {
  const row = '- ⚙️ **Some slice with no registered leaf — READY-FOR-GATES on lane/b.** Body.';
  assert.equal(classifyRow(row, KEYS).verdict, 'unresolved');
});

test('rows without the claim are not classified at all', () => {
  assert.equal(classifyRow('- ✅ **`e3-moth-socket` merged.** Nothing to see.', KEYS), null);
});

// ── 9. RESOLUTION BY taskFile AS WELL AS id ─────────────────────────────────────────────────
// The id half is load-bearing (the s1461 row named only an id); the taskFile half must work
// too, since most rows cite the master.
test('resolves a leaf by taskFile as well as by id', () => {
  const row = '- ⚙️ **`lane-e3-moth-socket.md` — READY-FOR-GATES on lane/a.** Body.';
  const c = classifyRow(row, KEYS);
  assert.equal(c.verdict, 'STALE');
  assert.equal(c.key, 'lane-e3-moth-socket.md');
});

// ── 10. THE HEADLINE RULE ITSELF ────────────────────────────────────────────────────────────
test('headline is the leading bold span, and falls back when there is none', () => {
  assert.equal(headline('- 🟡 **subject here** and then narrative'), '- 🟡 **subject here**');
  const plain = 'x'.repeat(400);
  assert.equal(headline(plain).length, 200);
});

// ── 11. THE ENTRYPOINT ACTUALLY RUNS ────────────────────────────────────────────────────────
// s1482's guard used `file://${process.argv[1]}`, which is ALWAYS false in this repo (the path
// contains a space, percent-encoded by import.meta.url but not by argv[1]). It printed nothing
// and exited 0: a gate that looks rooted and measures nothing. Assert the opposite directly.
test('the guard RUNS when invoked as a script (entrypoint is not a silent no-op)', () => {
  const r = spawnSync('node', [GUARD, '--report'], { cwd: REPO, encoding: 'utf8' });
  assert.match(r.stdout, /row\(s\) carry READY-FOR-GATES/);
  assert.equal(r.status, 0);
});

// ── 12. THE LIVE LEDGER IS THE SUBJECT, NOT ONLY SYNTHETIC ROWS ─────────────────────────────
// Without this, every test above could pass while the real tasks/BACKLOG.md went unexamined —
// the guard would be wired, green, and inert.
test('the live ledger carries no stale READY-FOR-GATES claim', () => {
  const r = spawnSync('node', [GUARD], { cwd: REPO, encoding: 'utf8' });
  assert.equal(r.status, 0, `guard failed on the live ledger:\n${r.stdout}\n${r.stderr}`);
});

// ── 13. THE LANDED SET IS WIDER THAN THE GATE TEXT, DELIBERATELY ────────────────────────────
// The gate said `merged`. A row claiming "awaits the drain" is equally false once the leaf is
// shipped/verified/superseded. Measured s1483: the wider set adds zero reds to the live ledger.
test('a shipped leaf counts as landed, not only a merged one', () => {
  const row = '- ⚙️ **GOAL LEAF `board-chapter-seed-scope` — READY-FOR-GATES on lane/c.** Body.';
  assert.equal(classifyRow(row, KEYS).verdict, 'STALE');
  for (const s of ['merged', 'shipped', 'verified-by-owner', 'superseded']) assert.ok(LANDED.has(s));
  assert.ok(!LANDED.has('building') && !LANDED.has('queued') && !LANDED.has('blocked'));
});
