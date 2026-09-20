import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';

// 1. Goal leaf -> shipped + mergeHash (Goal Registration Law: in the drain commit).
const GP = 'tasks/goals.json';
const g = JSON.parse(readFileSync(GP, 'utf8'));
let leaf = null;
(function w(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) return n.forEach(w);
  if (n.id === 'factory-fail-open-branch-proof') leaf = n;
  for (const k in n) w(n[k]);
})(g);
if (!leaf) { console.error('LEAF NOT FOUND'); process.exit(9); }
leaf.status = 'shipped';
leaf.mergeHash = '032eca5a';
leaf.note_s1238_drain =
  'DRAINED s1238 2026-07-30, 032eca5a, reviews/guard-fx-02.md. Verdict ACCEPTED -- authored AND drained by the same fire, disclosed in the review, so every report claim was re-derived by command on the merged tree. Case count 4 -> 7, TAP-verified by name, 0 skipped. THE DIFF IS ONE FILE (+58/-2) and scripts/lib/subject-tree.mjs is ABSENT from it -- blob still 93012a5c, so the firewall requirement that the module be unchanged in the final commit holds. SAFE-DUPE preflight worked: the runner reset lane/m3 onto fresh main, so the stale-base phantoms that made it read "+2" are gone and main..lane/m3 is one real commit. MUTATION RE-RUN BY THE DRAIN WITH THE TAP REPORTER, each red named not counted: fail-open deleted -> reddens the fail-open case AND the backstop case; fail-closed deleted -> reddens EXACTLY its own case and nothing else (the cleanest arm in the ladder, and the arm F-1237-1 never asked for -- premise 2 predicted it was equally unproven and it was); floor removed -> reddens the backstop plus both prior floor cases. Restored byte-identically 3/3. Two refinements on the report: it listed ONE red per arm where arms A and C redden 2 and 3 -- reasons right, blast radius understated, extra reds all correct behaviour. Scope-4 teardown MEASURED: 0 gold-rush-subject-tree-* leftovers after two consecutive runs. F-1237-1 DISCHARGED: 12 proved/1 unproven becomes 15 proved/0 unproven for this module, and the convergence caveat now matters MORE, not less -- keep both guards routed through the module. F-1238-2 (new, non-blocking, fire-authorable): site-contract.test.mjs leaks one temp dir per run and has leaked 132 since 2026-07-09 (71 gr-site-parse + 61 gr-site-inline), +4 during this very battery because it runs twice; found BY this slice\'s teardown check, which itself leaks zero. F-1238-3 (new, method): my own first mutation instrument parsed TAP `not ok` out of node --test\'s SPEC reporter and reported "no case reddened" alongside rc=1 -- a self-contradicting false negative in MY tool, caught only because the master\'s bar forbids reading a red by rc alone. Fourth rung of the F-1232-1 class, this time in the verifier rather than the subject.';
writeFileSync(GP, JSON.stringify(g, null, 2) + '\n');
console.log('goal leaf -> shipped, mergeHash 032eca5a');

// 2. BACKLOG: retire the authored headline in place (RETENTION LAW: supersede, never delete).
const BP = 'tasks/BACKLOG.md';
let b = readFileSync(BP, 'utf8');
const old = '✍️ **NEXT lane-a RUNG — `guard-fx-02-fail-open-branch-proof` (AUTHORED + QUEUED s1238';
const i = b.indexOf(old);
if (i < 0) { console.error('BACKLOG ANCHOR NOT FOUND'); process.exit(9); }
// Retire the HEADLINE, not just the body -- F-1236-1's lesson.
b = b.slice(0, i) + '✅ **SHIPPED s1238 (`032eca5a`, review `reviews/guard-fx-02.md`) — F-1237-1 DISCHARGED; the tally goes 12 proved/1 unproven → 15 proved/0 unproven for this module.** Runner took it **9 minutes** after queueing. **One file, +58/−2, and `scripts/lib/subject-tree.mjs` is ABSENT from the diff** (blob still `93012a5c`) — the gap was in what tested the branch, not the branch. Cases **4 → 7**, TAP-verified by name, **0 skipped**. 🧪 **Mutation re-run by the drain, each red NAMED:** fail-open deleted → reddens the fail-open case **+** the backstop · **fail-closed deleted → reddens EXACTLY its own case and nothing else** (the cleanest arm in the ladder — and the arm **F-1237-1 never asked for**: premise 2 predicted the default was equally unproven, and it was) · floor removed → reddens the backstop **+** both prior floor cases. Restored byte-identically **3/3**. **Teardown measured: 0 leftovers** after two consecutive runs. 📋 **F-1238-2 (new, fire-authorable):** `site-contract.test.mjs` **leaks one temp dir per run — 132 since 2026-07-09**, **+4 during this battery** (it runs twice), found **by** this slice\'s teardown check, which leaks zero. 📋 **F-1238-3 (new, method):** my **own** first mutation instrument read TAP out of the **spec** reporter and reported *"no case reddened"* beside **rc=1** — a false negative in the **verifier**, caught only because the master forbids reading a red by rc alone. **Fourth rung of the F-1232-1 class, this time in the instrument.** ⚠️ **Convergence caveat now matters MORE, not less: keep both guards routed through the module or all 15 revert to unproven.**\n\n<sub>Original author/queue line, retained per the RETENTION LAW:</sub> ' + b.slice(i);
writeFileSync(BP, b);
console.log('BACKLOG: headline retired in place, original preserved as a sub-line');

// 3. Done-move disposition.
const D = 'tasks/done/';
const src = '20260730-030908-guard-fx-02-fail-open-branch-proof.md';
if (existsSync(D + src)) {
  renameSync(D + src, D + 'drained-s1238-032eca5a-' + src);
  console.log('done-move -> drained-s1238-032eca5a-' + src);
} else console.log('done-move already dispositioned');
