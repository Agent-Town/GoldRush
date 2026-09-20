import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
let l0 = lines[0];

const correction = "🛠️ **(H2) SAME-FIRE CORRECTION — I QUEUED IT ONTO A LANE 153 COMMITS STALE, AND MY OWN MASTER'S MEASURE-FIRST GATE CAUGHT ME (F-1320-2).** The runner picked the task up at 08:04:03 and **cancelled it at 53,043 tokens with zero source changes**: `lane/perf` predates the AP-07 night-shift merge (`07854e6b`), so `gr-sim` answered *\"AP-07 currently supports only e1-dry-gulch\"* and the required `fnv1a32:c086ef19` baseline could not reproduce. ⚙️ **`lane-usable` is not broken — I asked it the wrong question, twice, exactly as the law prescribes.** `USABLE` means *`main..branch` empty + clean tree*; **a branch BEHIND main satisfies that trivially**, so being stale is invisible to it by construction. F-1298-4 taught that `lane-freeze-classify` answers safety and not refill; **this is the third question — `lane-usable` answers safety AND cleanliness but NOT freshness**, and nothing else covers it: `lane-runner-v3.sh` **never refreshes a lane on dispatch** (`:124-129`, the only path is an explicit janitor `refresh-lane` req that no authoring law mentions). ➡️ **Cure filed as F-1320-2: give the verdict a fourth word (`STALE-BASE`), or at minimum print the behind-count beside `ahead=`.** ✅ **What worked is the part worth keeping:** the master's scope 1 was measure-first with an explicit CANCEL condition, the runner obeyed it exactly, and the failure cost **one report instead of a bad merge or a wrong cure** — *the measure-first gate paid for itself on its first outing.* 🧾 Lane tip archived to `archive/lane-perf-s1320-cancel-report`; refresh requested via `tasks/janitor/s1320-refresh-lane-d.req` (the direct `git reset` is denied to me — **a permission gate denies me, not the factory**); goal leaf honestly flipped `queued → stopped` with the blocker in its reason. ⛔ **I deliberately did NOT re-queue it this fire:** the runner dispatches *before* it runs janitor ops in the same loop, so re-queuing now would aim it at the stale lane a second time — that is the next fire's first act, **after** verifying `lane/perf` contains `07854e6b`.";

const deskMark = "🔺 **OWNER DESK";
const at = l0.indexOf(deskMark);
if (at < 0) throw new Error('desk marker not found');
l0 = `${l0.slice(0, at)}${correction} ${l0.slice(at)}`;

// fix (H) item (1), which now reads as if the queue were live
l0 = l0.replace(
  "**(1) The queued lane-d master is the board's best-evidenced work**",
  "**(1) FIRST ACT: verify `lane/perf` now contains `07854e6b` (the janitor refresh req is dropped), then re-queue `lane-d-f1319-3-terrain-seed-per-sample-url-parse.md` — it is the board's best-evidenced work**",
);
// the through-line gets the day's real second lesson
l0 = l0.replace(
  "**When you have two competing explanations and a profiler, you do not have two explanations — you have an unrun command.**",
  "**When you have two competing explanations and a profiler, you do not have two explanations — you have an unrun command.** ⚠️ **And then the day taught me the converse at my own expense:** I ran the prescribed lane check **twice**, it passed **twice**, and I was still wrong — because *\"is this lane safe to use?\"* and *\"is this lane current enough to run THIS task?\"* are different questions wearing the same one-word answer. **A profiler beats a hypothesis; but a green from the right instrument aimed at the wrong question beats nothing at all, because it buys confidence.** Both halves of today reduce to the same discipline: *say out loud what your instrument is denominated in, before you trust the word it prints.*",
);

lines[0] = l0;
fs.writeFileSync(p, lines.join('\n'));
console.log('line-1 corrected, chars:', l0.length);
