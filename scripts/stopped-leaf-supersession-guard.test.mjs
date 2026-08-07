// F-1521-1 (s1521) — GUARD: when a leaf SHIPS while naming a still-`stopped` leaf, somebody must
// walk the pair and say out loud whether the ship superseded the stop.
//
// WHY THIS EXISTS, AND WHY IT IS NOT THE GUARD s1520 SHIPPED. s1520 closed the FORWARD tell: a
// stopped leaf that names `Successor: y.md` where y has shipped. It said plainly that this catches
// only ONE of the two ghost tells, and asked the next fire to PRICE the other before building it.
// F-1518-2's ghost is the second: `e1-baron-fort-solidity` named no successor at all. What made it
// look live was a DISPATCH-TIME row for `f1452-1` asserting in bold that the leaf "stays `stopped`"
// and that the successor "supersedes nothing" — true when written, false from the moment f1452-1
// merged three days later. s1517 spent a whole fire re-opening the question; s1518 found it by hand.
//
// THE PRICING, MEASURED s1521 BEFORE A LINE OF THIS FILE WAS WRITTEN (the whole point of the ask):
//
//   1. THE TELL IS NOT WHERE IT WAS ASSUMED TO BE. The phrase "supersedes nothing" lives in
//      tasks/BACKLOG.md:3024 and STATUS.md:122 — PROSE LEDGERS — not in tasks/goals.json. A parser
//      for expired dispatch-time claims would have to read the handoff corpus and understand future
//      tense. That is the expensive guard s1520 feared, and it is correctly NOT built here.
//
//   2. BUT THE PAIR IS STRUCTURALLY VISIBLE FROM THE OTHER END, WITH NO PROSE PARSING AT ALL.
//      f1452-1's own leaf names `e1-baron-fort-solidity` in its prose. So the predicate is just:
//      a SHIPPED leaf whose strings name a STOPPED leaf. No tense, no NLP, two statuses and a
//      reference. Reversing the direction turned an English problem into a lookup.
//
//   3. IT WAS REPLAYED, NOT ASSUMED. Over all 884 revisions of tasks/goals.json since 2026-07-01:
//      18 distinct pairs ever fire; 11 of them RESOLVED on their own (the leaf was later retired —
//      the true-positive shape in hindsight); 7 stand on today's board. It names BOTH known ghosts:
//      `f1452-1-fort-solidity-static-routing -> e1-baron-fort-solidity` for 104 revisions (first
//      firing 2026-08-05T18:34, the moment f1452-1's leaf went merged — i.e. ~1.7 days and one
//      wasted fire before s1518 found it by hand), and `f1441-2-crossings-keep-their-z ->
//      tb-stall-census` for 114, which is F-1519-1.
//
//   4. THE SCOPE NARROWED BY MEASUREMENT, TWICE, AND BOTH NARROWINGS ARE LOAD-BEARING.
//      (a) An earlier draft ran the predicate FORWARD-loose — a non-shipped leaf naming any shipped
//          .md — and produced 8 candidates of which 6 sat on already-`superseded` leaves: it mostly
//          re-flags cured work. Dropped.
//      (b) Including `blocked` leaves adds 6 standing false positives and zero real ghosts. Reading
//          blockClass on the live board explains why: all 6 blocked leaves are owner-gated (5
//          `owner-fork` + f1328-1 `disputed`, which fire.md 3.0 says to treat as owner-fork). A
//          fire re-opening one of those is the rf-34 shape the block exists to prevent. So the
//          restriction to `stopped` is not a heuristic tuned for a number — it is the statement
//          that only a fire's OWN hold is a fire's to re-examine.
//
// WHY IT ACKNOWLEDGES RATHER THAN REDS. 7 standing pairs on a board this old are not 7 defects;
// they are 7 questions already answered in prose. A guard that reds on all of them every fire is
// the failure mode s1520 named — one fires learn to skip. So a stopped leaf carries
// `supersessionChecked`: an OBJECT from referent-leaf-id to the reason it does not supersede.
// An object, not an array, so an ack cannot be a silent tick — it must say why. Once the standing
// 7 are acknowledged the guard is silent, and only a NEWLY shipped referent speaks up. That is
// exactly the moment F-1518-2 needed a voice and had none.
//
// A RED HERE IS A QUESTION, NOT A VERDICT. It means: read the shipped leaf, and either retire the
// stopped leaf as `superseded` (recording supersededBy), or add the referent to
// supersessionChecked with the reason it does not. Both outcomes are one line.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);

// Short ids match prose by accident ("m4", "e2-rail"). Every real leaf id on this board is longer.
const MIN_KEY = 8;

const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');

export function collectLeaves(goals) {
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id || n.taskFile) out.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: goals.goals || [] });
  // Containers carry children; only childless nodes are leaves with a status worth judging.
  return out.filter((n) => !(n.subgoals || n.tasks));
}

// Every pair (shipped leaf M, stopped leaf L) where M's own prose names L.
export function supersessionPairs(leaves) {
  const stopped = leaves.filter((l) => l.status === 'stopped');
  const keys = [];
  for (const l of stopped) {
    if (l.id && l.id.length >= MIN_KEY) keys.push({ key: l.id, leaf: l });
    if (l.taskFile && stem(l.taskFile).length >= MIN_KEY) keys.push({ key: stem(l.taskFile), leaf: l });
  }
  const pairs = [];
  const seen = new Set();
  for (const m of leaves.filter((l) => SHIPPED.has(l.status))) {
    const mid = m.id || stem(m.taskFile || '');
    const strs = Object.entries(m).filter(([, v]) => typeof v === 'string');
    for (const { key, leaf } of keys) {
      if (mid === leaf.id) continue; // a leaf naming itself is not a supersession
      const hit = strs.find(([, v]) => v.includes(key));
      if (!hit) continue;
      const sig = `${mid} -> ${leaf.id}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      pairs.push({ shipped: mid, shippedKey: hit[0], stopped: leaf.id, leaf });
    }
  }
  return pairs;
}

// THE PREDICATE. Exported and exercised against a synthetic fixture below, so the violation branch
// runs on every invocation rather than only when the live board happens to be broken — the
// s1299/s1300 standard: a passing guard never executes its own failure path, so its green says
// nothing about its red.
export function findUnacknowledged(leaves) {
  return supersessionPairs(leaves).filter(({ shipped, leaf }) => {
    const ack = leaf.supersessionChecked;
    if (!ack || typeof ack !== 'object' || Array.isArray(ack)) return true;
    const reason = ack[shipped];
    return !(typeof reason === 'string' && reason.trim().length > 0);
  });
}

// ---------------------------------------------------------------------------------------------
// Synthetic fixture: every branch that matters, independent of the live board's current shape.
// ---------------------------------------------------------------------------------------------
const fixture = (over = {}) => ({
  goals: [{
    id: 'g', title: 'g', subgoals: [{
      id: 'sg', title: 'sg', tasks: [
        {
          id: 'stopped-leaf-under-test', title: 'the parked one', status: 'stopped',
          taskFile: 'lane-stopped-leaf-under-test.md', ...over,
        },
        {
          id: 'the-shipped-successor', title: 'ships and names the parked one', status: 'merged',
          mergeHash: 'a'.repeat(40),
          authorNotes: 'this cure sits next to stopped-leaf-under-test and stays clear of it',
        },
        {
          id: 'an-unrelated-shipped-leaf', title: 'names nobody', status: 'merged',
          mergeHash: 'b'.repeat(40), authorNotes: 'touches nothing parked',
        },
        {
          id: 'owner-blocked-leaf', title: 'owner fork', status: 'blocked',
          blockClass: 'owner-fork', blockedReason: 'awaiting Robin',
        },
        {
          id: 'names-the-blocked-leaf', title: 'ships naming an owner-blocked leaf', status: 'merged',
          mergeHash: 'c'.repeat(40), authorNotes: 'deliberately does not touch owner-blocked-leaf',
        },
      ],
    }],
  }],
});

test('THE RED: a shipped leaf naming an unacknowledged stopped leaf is reported', () => {
  const bad = findUnacknowledged(collectLeaves(fixture()));
  assert.equal(bad.length, 1, 'the one real pair must fire');
  assert.equal(bad[0].shipped, 'the-shipped-successor');
  assert.equal(bad[0].stopped, 'stopped-leaf-under-test');
});

test('THE ACK silences it, and only for the referent it names', () => {
  const acked = findUnacknowledged(collectLeaves(fixture({
    supersessionChecked: { 'the-shipped-successor': 'walked s1521 — different subsystem entirely' },
  })));
  assert.equal(acked.length, 0, 'a reasoned ack must silence the pair');

  // An ack for the WRONG referent must not silence the right one.
  const mis = findUnacknowledged(collectLeaves(fixture({
    supersessionChecked: { 'an-unrelated-shipped-leaf': 'irrelevant' },
  })));
  assert.equal(mis.length, 1, 'an ack naming another leaf must not count');
});

test('AN ACK MUST STATE A REASON — empty strings and bare arrays do not acknowledge', () => {
  for (const ack of [{ 'the-shipped-successor': '' }, { 'the-shipped-successor': '   ' }]) {
    assert.equal(findUnacknowledged(collectLeaves(fixture({ supersessionChecked: ack }))).length, 1,
      'a blank reason is a silent tick and must not pass');
  }
  assert.equal(findUnacknowledged(collectLeaves(fixture({
    supersessionChecked: ['the-shipped-successor'],
  }))).length, 1, 'an array cannot carry reasons, so it cannot acknowledge');
});

test('NARROWNESS IS LOCKED IN: owner-gated blocked leaves are NOT this guard\'s business', () => {
  // Measured s1521: including `blocked` adds 6 standing false positives and 0 real ghosts, because
  // every blocked leaf on this board is owner-gated. Widening here re-opens the rf-34 shape.
  const pairs = supersessionPairs(collectLeaves(fixture()));
  assert.ok(!pairs.some((p) => p.stopped === 'owner-blocked-leaf'),
    'a blocked leaf must never be paired — only the owner lifts those');
});

test('a leaf naming ITSELF is not a supersession', () => {
  const self = collectLeaves({
    goals: [{ id: 'g', title: 'g', subgoals: [{ id: 'sg', title: 'sg', tasks: [
      { id: 'self-referential-leaf', title: 's', status: 'stopped',
        note: 'see self-referential-leaf above' },
    ] }] }],
  });
  assert.equal(findUnacknowledged(self).length, 0);
});

// ---------------------------------------------------------------------------------------------
// THE LIVE BOARD.
// ---------------------------------------------------------------------------------------------
test('LIVE: every shipped leaf naming a stopped leaf has been walked and answered', () => {
  const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
  const bad = findUnacknowledged(collectLeaves(goals));
  assert.deepEqual(bad.map((b) => `${b.shipped} -> ${b.stopped}`), [],
    'Each pair below shipped while naming a leaf that is still `stopped`. Walk it: either retire ' +
    'the stopped leaf as `superseded` (with supersededBy), or add the shipped leaf to that leaf\'s ' +
    '`supersessionChecked` with the reason it does not supersede it. See F-1521-1.');
});
