// s1619: declares F-1619-1 into tasks/BACKLOG.md, immediately after the F-1616-3 line.
// Written as a file rather than an inline -e because the row's markdown contains backticks,
// which the fire shell's gate reads as a subshell.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');
const tail = '**GATE: none owed to the owner; any fire may take the probe (one per fire).**';
const i = lines.findIndex((l) => l.includes(tail));
if (i < 0) { console.error('F-1616-3 LINE NOT FOUND'); process.exit(2); }

const row = [
  '🔎 **F-1619-1 (s1619 2026-08-10, MEASURED — THE SWEPT CANDIDATE LIST s1618 LEFT FOR THE NEXT FIRE IS 6/6 ALREADY SHIPPED, AND THE PROPERTY IT WAS SWEPT ON CANNOT DETECT THAT.)**',
  ' ⚙️ s1618 ended a dry board by handing forward *"the expensive half: a swept candidate list"* of never-ran `lane-*` masters **"with a LIVE first line"** — i.e. lacking the ⛔ DO-NOT-QUEUE header the s1130–s1132 sweeps added by hand.',
  ' ✓ **All six were stale-checked this fire and every one is already on main:** `lane-a-perf-05-startup-attribution` (drained `63161278` s1039 — verified by FILE PROBE, not by a leaf: the `hasAny` needle in `e2e/perf-05-startup.spec.ts` now reads `/icon-` **with** the leading slash, which is precisely the cure that master proposed, so the substring collision with `favicon-32.png` it was authored to fix no longer exists) · `lane-c-ed-04-gizmo-guards-vacuous` **shipped** · `lane-resource-timing-false-greens` **merged** · `lane-m2-01-fixture-coordinate` **merged** · `lane-d-rf-03b-specs-supersession` **merged** · `lane-b-asset-diet-budget-runnable` **shipped** (corroborated independently of its leaf: `package.json` carries `test:asset-diet` running `e2e/asset-diet.spec.ts` under the preview config — the runnable budget check that master was written to create).',
  ' ⚠️ **THE REUSABLE HALF IS WHY THE SWEEP READ CLEAN: the absence of a DO-NOT-QUEUE header is SILENCE, NOT A NEGATIVE.** That header is added by hand, only when someone happens to notice a shipped master — so it is present on a biased sample and absent from everything nobody has looked at. **Sweeping on it selects for un-audited masters and calls them available**, which is Mistake #8’s exact intake path (the 824k flail was a re-derivation of an already-merged diff).',
  ' 💡 **The one-command check already exists and costs a second: `node scripts/drain-block-check.mjs <master>` resolves the goal leaf and PRINTS `status="shipped"` / `"merged"`.**',
  ' ⚠️ **But READ THE WORD, NEVER THE TICK — it exits `0` with a green `✅ CLEAR` for a shipped leaf**, because its job is block-checking, not shipped-ness; a fire branching on the exit code alone reads *already merged* as *cleared for dispatch*. That is F-1262-3’s lesson (rc=0 UNKNOWN reads as permission) recurring on a different field of the same tool’s output.',
  ' ➡️ **THEREFORE: a candidate list is worth handing forward only if each item was resolved through its goal leaf AND one file probe; a list swept on header-absence should be labelled UNAUDITED, not CANDIDATE.**',
  ' ⓘ **Stated in s1618’s favour, because that handoff was honest and its reasoning was sound on the evidence it had:** it flagged the list as *"worth a stale-check, NOT a blind queue"*, and its ⭐ pick (`asset-diet-budget-runnable`) was chosen for the right reason — a live thread pointed at it. **That thread is real and is now taken up by `f1619-2`, which measures the budget the shipped check made measurable.**',
  ' **GATE: none owed to the owner. Closes when a future dry-board sweep resolves its candidates by leaf + probe rather than by header-absence; the fire that does so should retire this line.**',
].join('');

lines.splice(i + 1, 0, row, '');
writeFileSync(p, lines.join('\n'));
console.log('F-1619-1 declared after line', i + 1);
