// F-1520-1 (s1520) — GUARD: a `stopped` leaf may not name a successor that has already shipped.
//
// WHY THIS EXISTS. Nothing in the fire loop ever WALKS a successor pointer. A leaf is stopped, its
// reason names the master that will replace it, that master later merges — and the stopped leaf
// sits there, because the act of merging the successor touches the successor's leaf and nobody
// else's. s1519 found `tb-stall-census` in exactly that state: the leaf had recorded
// `Successor: f1441-2-crossings-keep-their-z.md` in the RIGHT field, that successor merged at
// 65e3aaec on 2026-08-04, and the leaf still read `stopped` three days later. It was the second
// stale stopped leaf found in two fires, and s1519's handoff asked for precisely this guard.
//
// A named forward reference is only as good as the pass that follows it. This file is that pass.
//
// WHAT IT COSTS TO GET WRONG, AND WHY THE PARSER IS DELIBERATELY NARROW. Successor pointers on this
// tree live in two places: a structured `supersededBy` key, and free prose under at least ten
// different key spellings (stopReason, stopNote, drainNotes, supersededNote_s1116,
// stoppedNote_s1216, authorNotes, note, priorBlockedReason, authorNotesSuccessor, reason).
// MEASURED s1520 across all 663 leaves: the strict `Successor: <file>.md` form appears 3 times,
// resolves to a real leaf 3 times, and misresolves 0 times. A LOOSER parser was tried first and
// REJECTED on evidence, not on taste: `f1424-4-lane-shell-worker-arms` carries
// `authorNotesSuccessor: "SUPERSEDED IN PRACTICE BY f1426-2-repair-the-concurrency-harness-contract"`,
// and f1426-2 IS merged — so a loose reading reds a leaf that is correctly parked. f1426-2 repaired
// the harness contract (a BLOCKER); it never made the measurement the stopped leaf exists for, and
// the real successor (f1424-4-worker-arm-rates) was still building when this guard was written.
// "Superseded in practice" is a human hedge; `Successor: x.md` is a commitment. Only the second is
// mechanisable, so only the second is mechanised here. Widening this regex without re-measuring the
// corpus will produce false reds on parked work — the failure mode that makes fires ignore a guard.
//
// A red here is NOT "go re-queue the stopped master". It means: walk the pointer, and if the
// successor genuinely did the job, retire the leaf as `superseded` with its supersededBy recorded
// (the s1519 cure, 1c511237). If it did not, the pointer is wrong and the prose should be fixed.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// A successor that has reached any of these has shipped: a stopped leaf pointing at one is stale.
const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);

// Deliberately strict — see the header. `Successor:` + a .md filename, optionally backticked.
const STRICT_SUCCESSOR = /[Ss]uccessor:\s*`?([A-Za-z0-9._/-]+\.md)/g;

// Keys that are structurally a pointer rather than prose. Values may be compound ("a + b").
const POINTER_KEYS = ['supersededBy'];

const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');

export function collectLeaves(goals) {
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id || n.taskFile) out.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: goals.goals || [] });
  return out;
}

// Every pointer a leaf names, as bare stems. Structured keys first, then strict prose.
export function successorStems(leaf) {
  const stems = new Set();
  for (const key of POINTER_KEYS) {
    const v = leaf[key];
    if (typeof v !== 'string') continue;
    for (const part of v.split(/\s+\+\s+/)) if (part.trim()) stems.add(stem(part));
  }
  for (const v of Object.values(leaf)) {
    if (typeof v !== 'string') continue;
    for (const m of v.matchAll(STRICT_SUCCESSOR)) stems.add(stem(m[1]));
  }
  return [...stems];
}

// THE PREDICATE. Exported and unit-tested against a synthetic fixture below, so the violation path
// executes on every run rather than only when the board happens to be broken (the s1299/s1300
// standard: a passing guard never runs its own failure branch, so its green is not evidence).
export function findStaleStops(leaves) {
  const byId = new Map();
  const byFile = new Map();
  for (const l of leaves) {
    if (l.id) byId.set(l.id, l);
    if (l.taskFile) byFile.set(stem(l.taskFile), l);
  }
  const stale = [];
  for (const leaf of leaves.filter((l) => l.status === 'stopped')) {
    for (const s of successorStems(leaf)) {
      const target = byFile.get(s) || byId.get(s);
      if (target && target !== leaf && SHIPPED.has(target.status)) {
        stale.push({ leaf: leaf.id || leaf.taskFile, successor: s, successorStatus: target.status });
      }
    }
  }
  return stale;
}

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const leaves = collectLeaves(goals);

test('no stopped leaf names a successor that has already shipped', () => {
  assert.ok(leaves.length > 100, `walker collected only ${leaves.length} leaves; it may be broken`);
  const stale = findStaleStops(leaves);
  assert.deepStrictEqual(
    stale.map((s) => `${s.leaf} -> ${s.successor} [${s.successorStatus}]`),
    [],
    'These leaves are still `stopped` while the successor they name has shipped. Walk the pointer: ' +
      'if the successor did the job, retire the leaf as `superseded` and record supersededBy ' +
      '(precedent 1c511237, F-1519-1). If it did not, the pointer is wrong — fix the prose.'
  );
});

// Proves the detector DETECTS. Reproduces F-1519-1's exact shape: the pointer in prose, under a
// key spelling (`stopReason`) that no schema requires, resolved through the successor's taskFile.
test('the detector fires on the F-1519-1 shape (manufactured, not observed)', () => {
  const fixture = [
    {
      id: 'ghost-census',
      status: 'stopped',
      stopReason: 'NO mergeHash on purpose. Successor: f1441-2-crossings-keep-their-z.md.',
    },
    { id: 'the-successor', taskFile: 'tasks/f1441-2-crossings-keep-their-z.md', status: 'merged' },
  ];
  const stale = findStaleStops(fixture);
  assert.strictEqual(stale.length, 1, 'the F-1519-1 shape must be detected');
  assert.strictEqual(stale[0].leaf, 'ghost-census');
  assert.strictEqual(stale[0].successorStatus, 'merged');
});

// Locks the narrowness in. If someone widens the regex to catch prose like "SUPERSEDED IN PRACTICE
// BY x", this reds — because that phrasing is live on a CORRECTLY parked leaf today
// (f1424-4-lane-shell-worker-arms), and reding it would be a false alarm on real work.
test('loose supersession prose is NOT treated as a successor commitment', () => {
  const fixture = [
    {
      id: 'parked-measurement',
      status: 'stopped',
      authorNotesSuccessor: 'SUPERSEDED IN PRACTICE BY f1426-2-repair-the-harness — see that leaf.',
    },
    { id: 'f1426-2-repair-the-harness', status: 'merged' },
  ];
  assert.deepStrictEqual(
    findStaleStops(fixture),
    [],
    'A hedge ("superseded in practice") is not a `Successor:` commitment. Widening the parser to ' +
      'catch it reds parked work — measured s1520 on f1424-4-lane-shell-worker-arms.'
  );
});

// A stopped leaf pointing at a successor that is itself still in flight is the HEALTHY state and
// must stay silent, or the guard would nag every correctly-sequenced stop on the board.
test('a stopped leaf whose successor is still in flight stays green', () => {
  const fixture = [
    { id: 'waiting', status: 'stopped', supersededBy: 'still-building' },
    { id: 'still-building', status: 'building' },
  ];
  assert.deepStrictEqual(findStaleStops(fixture), []);
});
