// s1516: correct a factually WRONG sentence I put in my own handoff line-1.
// I claimed the runner done-moves at DISPATCH. Measured: it moves at COMPLETION, but `mv`
// preserves the mtime the file got when it was `cp`'d into the queue.
import fs from 'node:fs';

const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

const WRONG =
  'ⓘ **One correction for the next fire, learned the hard way: the lane runner done-moves a task at DISPATCH, not at completion.** A file in `tasks/done/` therefore proves a run STARTED. Judge completion by the run-log tail and the lane branch, never by the done-move\'s existence. (It also re-dispatched f1515-1 because I left the queue file in place after the drain; that second run correctly no-opped — "nothing to commit, working tree clean".)';

const RIGHT =
  '🆕 **[F-1516-2] FILED — A DONE-MOVE\'S MTIME IS ITS QUEUE-INSERTION TIME, SO §2B\'S OWN TRIGGER CAN SKIP A FRESH DRAIN.** I first mis-read this as "the runner done-moves at dispatch" and corrected it by measurement rather than leaving the guess in the ledger. **The runner `mv`s the queue file to `tasks/done/` at COMPLETION — but `mv` PRESERVES the mtime the file got when it was `cp`\'d into the queue.** Measured on my own dispatch: master written **09:32:08**, done-move mtime **09:34:13** (my `cp`), run log last write **09:39:27** (completion). ⚠️ **The consequence is not cosmetic: §2B says to drain "done-moves in `tasks/done/` newer than the last handoff", and that clock is systematically WRONG in the starving direction.** f1515-1 was queued **09:07**, completed **~09:34**, and its done-move carries mtime **09:07** — **older than s1515\'s 09:21 handoff**. A fire obeying §2B literally would have skipped a finished, mergeable slice; I found it only because I listed `tasks/runs/` and read the log tail. **REC: trigger on the RUN LOG\'s mtime (completion) or on `git log main..lane/*`, never on the done-move\'s mtime; `ls -lt tasks/done/` sorts by DISPATCH order.** (Separately: I left the queue file in place after drain 1, so the runner re-dispatched f1515-1; that second run correctly no-opped — "nothing to commit, working tree clean".)';

const i = lines[0].indexOf(WRONG);
if (i === -1) { console.error('anchor not found — refusing to edit'); process.exit(2); }
lines[0] = lines[0].replace(WRONG, RIGHT);
fs.writeFileSync(P, lines.join('\n'));
console.log('line-1 corrected; new length', lines[0].length);
