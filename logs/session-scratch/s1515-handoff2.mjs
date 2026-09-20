import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
let h = lines[0];
if (!h.includes('s1515 handoff')) throw new Error('line-1 is not my handoff');

// 1. restamp
h = h.replace('2026-08-07T09:07Z s1515 handoff', '2026-08-07T09:21Z s1515 handoff');

// 2. replace the dispatch paragraph with the fuller story (stop -> re-author)
const oldDispatch = '🔮 **Scope 3 carries a FALSIFIABLE PREDICTION rather than only a bar:** the 0-live measurement says removing the pollution must move **nothing**, so any count movement refutes it and STOPs the run — the value of predicting in advance. A negative result is licensed (precedent `e47354c6`). ';
const newDispatch =
  '🔮 **Scope 3 carries a FALSIFIABLE PREDICTION rather than only a bar:** the 0-live measurement says removing the pollution must move **nothing**, so any count movement refutes it and STOPs the run. A negative result is licensed (precedent `e47354c6`). ' +
  '🛑 **AND THEN THE RUNNER STOPPED MY OWN MASTER WITHIN MINUTES, CORRECTLY, AND IT IS THE BEST THING IN THIS FIRE — [F-1515-3] FILED.** Scope 3 fixed an **absolute** bar of `citations == 511`, true on main when I measured it. But **my own authoring commit `3013d09b8` added four citations** — two in `tasks/goals.json` (the leaf quotes the two priced subjects) and two in the master body — so the corpus read **515 before any code changed** and **the gate was unsatisfiable the moment I wrote it.** The runner ran the pre-flight clean, took the required before-table, did the arithmetic (**515 ≠ 511, surplus 4**), observed that the firewall forbids rewording `tasks/**` or touching `CITE`/`WINDOW`, concluded *"there is no lawful implementation that can restore the required denominator"*, and **stopped without writing code** — declining to manufacture defect arms because that *"would create undrainable code rather than evidence"*. **Second consecutive fire in which a runner\'s refusal was the most valuable output.** Report salvaged to `docs/bench/f1515-1-citation-scan-nondestructive-stop.md` (retention law — it was untracked in the lane). ' +
  '📐 **THE CLASS, which is why this is a finding and not an apology: it is the NUMERIC SIBLING of citation rot.** Coordinates rot when a merge shifts code; **counts rot when a commit shifts the CORPUS** — and the Goal Registration Law *requires* a fire\'s authoring commit to touch the ledger, so **any master gating on a whole-ledger count is at risk by construction.** The author measures on main; the runner measures on a tree containing the authoring commit; those are never the same tree. It fails CLOSED (a wasted lane run, not a bad merge) but it burns the scarcest resource on the board. ' +
  '✅ **RE-AUTHORED AND RE-DISPATCHED THE SAME FIRE with the bar made RELATIVE** — the runner now takes its own `--report` on the lane as found (`B_scanned`/`B_title`/`B_number`) and holds `scanned == B_scanned`, `CARRIES-TITLE ≥ B_title`, `NUMBER-ONLY ≤ B_number`; the authoring-time figures are demoted to *"orientation only, not a bar"*. **A relative bar cannot be rotted by a later ledger edit and still catches every regression the absolute one did.** Leaf carries `attempts: 1` with the stop recorded. Verified before the re-`cp`: lane clean and current at `a8ab8dfd2`, key greps **1**, `is-ancestor` rc=0, and the baseline the runner will actually take is **515 / 262 / 210 / 43** — satisfiable. ' +
  '📎 **A THIRD FACET OF THE SAME DEFECT CLASS, found the same way:** `test:citations` also red\'d my master for citing two specs with no title — and **my first fix failed too**, because the titles **wrapped across a line break** and `QUOTED` excludes `\\n`. **A correctly-quoted title that wraps is invisible to the scanner.** Each now sits on one line, with a note in the master telling the next reader not to reflow them. That is the [F-1425-2] lesson (prose wraps, matchers are line-oriented) arriving in a third costume this week. ';
if (!h.includes(oldDispatch)) throw new Error('dispatch paragraph not found');
h = h.replace(oldDispatch, newDispatch);

// 3. update NEXT (A) and the desk count line
h = h.replace(
  '**NEXT: (A)** drain `f1515-1` when lane-a reports',
  '**NEXT: (A)** drain `f1515-1` when lane-a reports (attempt 2; attempt 1 stopped on my bad gate, cured)',
);
h = h.replace(
  '🔺 **OWNER\'S DESK — 16 awaiting a word (0 added this fire; F-1515-1 and F-1515-2 are fire-side findings, already priced and authored, not owner questions).**',
  '🔺 **OWNER\'S DESK — 16 awaiting a word (0 added this fire; F-1515-1, F-1515-2 and F-1515-3 are all fire-side findings — priced, cured or authored — not owner questions).**',
);

lines[0] = h;
fs.writeFileSync(p, lines.join('\n'));
console.log('handoff updated');
