// s1307 — correct F-1307-1 in BOTH the BACKLOG row and the review file.
// I asserted "the runner COPIES queue->running". That is FALSE:
// scripts/lane-runner-v3.sh:59 is `mv "$f" "$run"`. Refuted by reading the code
// I should have read before writing the row. The OBSERVATION stands; the
// mechanism does not, and is now stated as open rather than concluded.
import fs from 'node:fs';

const corrected =
  '\u{1F7E1} **F-1307-1 (s1307, MEASURED — A COMPLETED LANE TASK RAN A SECOND TIME; THE OBSERVATION IS SOLID AND MY FIRST MECHANISM FOR IT WAS WRONG).** Run `20260801-002355` of `lane-a-f1305-2` completed READY-FOR-GATES (300,016 tokens) and done-moved; **14 seconds later the runner started run `20260801-004329` of the same master**, which burned **24,818 tokens for zero output**. ✅ **It was contained, and by exactly the right mechanism:** the master\'s safe-dupe pre-flight (`node scripts/lane-usable.mjs lane-a` must print `USABLE`) read **`HOLDS`** against run 1\'s own committed work and stopped without changes, reporting the word verbatim. **Had that master used a bare `reset --hard` pre-flight, run 2 would have destroyed run 1 — Mistake #2 exactly.** So this is a COST finding, not a data-loss one, and it is standing evidence that the safe-dupe template earns its keep. ⚠️ **MECHANISM OPEN — I first wrote that "the runner *copies* queue→running so the entry survives the done-move", and that is REFUTED: `scripts/lane-runner-v3.sh:59` is `mv "$f" "$run"`, a move.** A second theory — that the queue file is tracked and got restored by a checkout — is also refuted (`git ls-files tasks/queue/` lists only three `.req` files). **Leading hypothesis, explicitly NOT concluded:** the entry was created twice (a double `cp` at queue time), and the per-slot pidfile at `:37` deferred the duplicate until run 1 released it — which fits the 20-minute gap and the 14-second start, but I have not proven it. **Whoever picks this up: establish the mechanism before curing it.** Two candidate cures point in opposite directions (dedupe at queue time vs. an idempotence guard at pickup), so the wrong diagnosis buys the wrong fix.';

// --- BACKLOG ---
const p = 'tasks/BACKLOG.md';
const b = fs.readFileSync(p, 'utf8').split('\n');
const i = b.findIndex((l) => l.startsWith('\u{1F7E1} **F-1307-1'));
if (i < 0) throw new Error('F-1307-1 row not found');
b[i] = corrected;
fs.writeFileSync(p, b.join('\n'));
console.log('BACKLOG F-1307-1 corrected at row', i + 1);

// --- review file ---
const rp = 'reviews/f1305-2-console-watch-single-source.md';
let r = fs.readFileSync(rp, 'utf8');
const oldSentence =
  'because the queue file is copied rather than moved and survives the done-move';
if (!r.includes(oldSentence)) throw new Error('review sentence not found');
r = r.replace(
  oldSentence,
  '**for reasons not yet established** (see the correction below)',
);
const oldCure =
  'Cheap cure available: have the runner `mv` rather than `cp` the queue entry, or delete the queue copy on done-move.';
if (!r.includes(oldCure)) throw new Error('review cure sentence not found');
r = r.replace(
  oldCure,
  '⚠️ **Correction, same fire:** I first wrote that the runner *copies* queue→running. That is **false** — `scripts/lane-runner-v3.sh:59` is `mv "$f" "$run"`. A tracked-file-restore theory is also refuted (`git ls-files tasks/queue/` lists only three `.req` files). The leading hypothesis is now a double `cp` at queue time, with the per-slot pidfile at `:37` deferring the duplicate until run 1 finished — **stated as a hypothesis, not a conclusion.** No cure should be authored until the mechanism is established, because the two candidate cures (dedupe at queue time vs. idempotence at pickup) point in opposite directions.',
);
fs.writeFileSync(rp, r);
console.log('review F-1307-1 corrected');
