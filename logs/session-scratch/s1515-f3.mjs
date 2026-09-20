import fs from 'node:fs';
const bp = 'tasks/BACKLOG.md';
let b = fs.readFileSync(bp, 'utf8');
const lines = b.split('\n');
const i = lines.findIndex((l) => l.includes('**F-1515-2 (s1515 —'));
if (i < 0) throw new Error('F-1515-2 row not found');

const row =
  '🟡 **F-1515-3 (s1515 — AN AUTHORED MASTER\'S OWN COMMIT CAN MOVE THE MEASUREMENT ITS GATE FIXES, MAKING THE GATE ' +
  'UNSATISFIABLE BEFORE ANY CODE IS WRITTEN. CAUGHT BY THE RUNNER, ON MY OWN MASTER, WITHIN MINUTES.** Non-blocking; the ' +
  'instance is cured, the CLASS is what this row is for.) 🎯 **THE INCIDENT:** `f1515-1`\'s scope 3 fixed a hard bar of ' +
  '*"`citations scanned` must stay **511**"*, measured true on main at authoring time. But the authoring commit `3013d09b8` ' +
  '**itself added four citations** — two in `tasks/goals.json` (the leaf quotes the two priced subjects) and two in the master ' +
  'body — so the corpus read **515 before any code changed**. The runner ran the pre-flight clean, took the required "before" ' +
  'table, did the arithmetic (**515 != 511, surplus 4**), noted that the firewall forbids rewording `tasks/**` or touching ' +
  '`CITE`/`WINDOW`, concluded *"there is no lawful implementation that can restore the required denominator"*, and **STOPPED ' +
  'without writing code** — declining to manufacture defect arms for a change that could not pass, because that *"would create ' +
  'undrainable code rather than evidence"*. **That is exactly right, and it is the second consecutive fire in which a runner\'s ' +
  'refusal was the most valuable thing in the run** (the first: `e47354c6`). Report salvaged to ' +
  '`docs/bench/f1515-1-citation-scan-nondestructive-stop.md`. ' +
  '📐 **WHY IT IS A CLASS AND NOT A SLIP:** the numeric sibling of the citation-rot law. Coordinates rot when a merge shifts ' +
  'code; **counts rot when a commit shifts the CORPUS** — and a fire\'s authoring commit is *guaranteed* to touch the ledger ' +
  '(Goal Registration Law requires the leaf in the same commit), so **any master gating on a whole-ledger count is at risk by ' +
  'construction.** The author measures on main, the runner measures on a tree that includes the authoring commit, and those are ' +
  'never the same tree. ⚠️ **It fails CLOSED — a wasted lane run, not a bad merge** — but it burns the scarcest resource the ' +
  'board has, and [F-1511-5] says that is one lane-fire. ' +
  '✅ **CURED IN THE INSTANCE by making the bar RELATIVE:** the master now orders the runner to take its own `--report` on the ' +
  'lane as found, name it `B_scanned`/`B_title`/`B_number`, and hold `scanned == B_scanned`, `CARRIES-TITLE >= B_title`, ' +
  '`NUMBER-ONLY <= B_number`, with the authoring-time figures demoted to *"for orientation only, not a bar"*. A relative bar ' +
  'cannot be rotted by a later ledger edit and still detects every regression the absolute one did. ' +
  '**REC: make this the house form — a master may quote an absolute count as ORIENTATION, but any hard acceptance bar over a ' +
  'whole-corpus measurement must be expressed against a baseline the runner takes itself. Cheap authoring-time probe: after ' +
  'writing the master and its leaf, re-run the gate\'s own measurement on the authoring commit, not on main.** ' +
  '**GATE: closes when either (a) an attended session rules the relative-bar form into `/author-task`, or (b) a measured sweep ' +
  'shows no other live master gates on an absolute whole-corpus count.** Related: [F-1515-1], [F-1514-1], [F-1310-1], [F-1511-5].';

lines.splice(i, 0, row);
fs.writeFileSync(bp, lines.join('\n'));
console.log('F-1515-3 filed');
