import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const drafted = readFileSync('logs/session-scratch/s1238-handoff-line.txt', 'utf8').trim();

// The drafted handoff said "authored, no drain". The runner then shipped it and I drained it,
// so the headline and section (D) must both change -- retire the HEADLINE, not just the body (F-1236-1).
let h = drafted;

h = h.replace(
  'Last updated: 2026-07-30T03:11Z s1238 handoff, lock CLEARED — **I INHERITED A DEAD FIRE’S UNFINISHED BUSINESS AND THE ONLY THING MISSING WAS ITS HANDOFF; THEN THE DRY BOARD PAID OUT A MASTER WHOSE SCOPE MY OWN RE-MEASUREMENT CHANGED TWICE.**',
  'Last updated: 2026-07-30T03:47Z s1238 handoff, lock CLEARED — **INHERITED A DEAD FIRE’S UNFINISHED HANDOFF, AUTHORED A MASTER MY OWN RE-MEASUREMENT CHANGED TWICE, AND THEN THE RUNNER SHIPPED IT IN 9 MINUTES SO I DRAINED IT IN THE SAME FIRE. 1 DRAIN, 1 MASTER, F-1237-1 DISCHARGED.**',
);

// Section (D) was written before the drain existed; supersede it in place.
const dMark = '🎯 **(D) THE FIRE’S DELIVERABLE';
const eMark = '🧪 **(E) I RE-MEASURED';
const di = h.indexOf(dMark), ei = h.indexOf(eMark);
if (di < 0 || ei < 0) { console.error('SECTION ANCHORS MISSING'); process.exit(9); }
h =
  h.slice(0, di) +
  '🎯 **(D) THE FIRE’S DELIVERABLE — AUTHORED *AND* SHIPPED *AND* DRAINED, ALL THREE IN THIS FIRE.** `guard-fx-02-fail-open-branch-proof` authored + queued → lane-a (`81208e21`, goal leaf `factory-fail-open-branch-proof` + BACKLOG line same commit, `drain-block-check --queue` ✅ CLEAR). **The runner took it 9 minutes later and finished it** — so I re-armed the lock and drained it: **merge `032eca5a`, review `reviews/guard-fx-02.md`**, leaf `shipped` + full 40-char `mergeHash`, BACKLOG **headline** retired in place with the original preserved beneath (F-1236-1’s lesson applied to my own entry). **F-1237-1 DISCHARGED — the tally goes 12 proved / 1 unproven → 15 proved / 0 unproven for that module.** ⚖️ **I DISCLOSED THE CONFLICT RATHER THAN QUIETLY SELF-APPROVING:** I wrote the master, so the review says so on line 4 and every report claim was re-derived by command on the merged tree. **The report survived independent checking; my own first checking tool did not (see §K).** 🧾 **DRAIN GATES:** `tsc` **rc=0** · `build` **rc=0** · the suite **7/7 rc=0, 0 skipped** (TAP-verified **by case name**) · **three** adjacent guards named individually **rc=0** · `test:node-guards` **rc=0** · `run-guards.mjs` **`guards: 8/8 passed` rc=0** (107s). **One file, +58/−2, and `scripts/lib/subject-tree.mjs` is ABSENT from the diff** (blob still `93012a5c`) — the module was correct; only its coverage was missing, and the master forbade "fixing" it. No player-visible bytes → **no boot probe owed and none fabricated.** 🔬 **MUTATION RE-RUN BY THE DRAIN, EACH RED NAMED NOT COUNTED:** fail-open deleted → reddens the fail-open case **+** the backstop · **fail-closed deleted → reddens EXACTLY its own case and nothing else** — the cleanest arm in the ladder, and **the arm F-1237-1 never asked for** · floor removed → reddens the backstop **+** both prior floor cases. Restored **byte-identically 3/3**. Two honest refinements on the runner’s table: it listed **one** red per arm where A and C redden **two** and **three** — reasons right, blast radius understated, every extra red correct behaviour. **Teardown measured, not asserted: 0 leftovers.** ' +
  h.slice(ei);

// Fold the drain's two new findings into (G), and correct the GZ/deploy lines the drain changed.
const gMark = '🧾 **(G) DUTIES.**';
const gi = h.indexOf(gMark);
if (gi < 0) { console.error('G ANCHOR MISSING'); process.exit(9); }
const newFindings =
  '📋 **(G0) TWO NEW FINDINGS FROM THE DRAIN, BOTH FOUND BY DOING THE SMALL DUTY PROPERLY.** **F-1238-2 (non-blocking, FIRE-AUTHORABLE, not this slice’s fault):** counting `os.tmpdir()` for the teardown check turned up **148** fixture dirs of which **0** are this harness’s — the population is **71 `gr-site-parse-*` + 61 `gr-site-inline-*` = 132**, accumulating since **2026-07-09**, and **+4 landed during this very battery** because `site-contract.test.mjs` runs twice (under `test:node-guards` and under `run-guards.mjs`). **The leak is live and per-run, not residue.** The contrast is the point: the slice under review tears down in a `finally` and leaks **zero**, while a sibling guard in the same battery leaks two per invocation. **The 132 were LEFT IN PLACE — I swept nothing; they are the evidence, and deleting is not this fire’s business.** **F-1238-3 (method, no action owed):** my **own** first mutation instrument parsed TAP `not ok` lines out of `node --test`’s **spec** reporter, which never emits them — so all three arms reported *"no case reddened"* **beside rc=1**, a self-contradicting false negative **in the verifier, not the subject**. Re-run with `--test-reporter=tap`, every arm named its predicted case. **Fourth consecutive rung of the F-1232-1 class, and this time the unexercised branch was in my instrument.** It was caught *only* because the master’s own bar forbids reading a red by rc alone — the rc said pass-the-arm, the parsed names said fail-the-arm, and the disagreement forced the second look. Fixed tool kept at `logs/session-scratch/s1238-mutation-rerun-tap.mjs`, broken first attempt kept beside it as the control. ';
h = h.slice(0, gi) + newFindings + h.slice(gi);

// Duties that the drain changed: GZ-01 filter and DEPLOY both need re-stating truthfully.
h = h.replace(
  '**GZ-01 NO ITEM** — zero player-visible bytes merged this fire. **DEPLOY SKIPPED** — authored + bookkeeping only, no gameplay merge.',
  '**GZ-01 NO ITEM — and this is the filter law working, not an omission:** the fire merged **`032eca5a`**, but its review names **zero player-visible bytes** (0 files under `src/ e2e/ assets/ public/`), so there is no news item to write; the Gazette reports what players can see, and nobody can see a fixture case. **DEPLOY SKIPPED** for the same reason — the merge is test-only, so no gameplay build changed.',
);

lines[0] = h;
writeFileSync(P, lines.join('\n'));
console.log('final handoff written; line-1 chars:', h.length);
