// s1491 — rewrite the F-1489-1 ledger row to CLOSED, retaining the superseded text verbatim
// (Quality bar: superseded lines are retired, never deleted).
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.includes('F-1489-1 (s1489'));
if (i === -1) throw new Error('F-1489-1 row not found');
const old = lines[i];

const row =
  '- ✅ **F-1489-1 — CLOSED s1491, PREMISE REFUTED BY MEASUREMENT: THE QUIET-GREEN PROPERTY WAS NEVER LOST, SO THERE WAS NOTHING TO BISECT — AND RUNNING THE BISECT THIS GATE ASKED FOR WOULD HAVE CONVICTED AN INNOCENT COMMIT.** ' +
  'F-1146-6’s recipe executed **verbatim** on current main (`2895ab088`, which already contains the halo-cure merge) returns its documented result exactly: `-g "warmed test clip swaps" --repeat-each=3` → **3/3 PASS desktop, 3/3 PASS mobile**. Across four quiet-arm runs, **18 of 20 instances PASS**. ' +
  'The contended half reproduces too: the **3-spec battery** (`vp-02-sprite-animation` + `vp-02b-rotation-resolver` + `run3d-rail-elements` — the composition s1489’s own evidence table names at `reviews/f1486-1.md:29`) went **RED in 2 of 2 runs** at `:461`. ' +
  '⭐ **So the contended-RED / quiet-GREEN fingerprint is INTACT IN BOTH DIRECTIONS, and the next fire that meets this red CAN retire it the documented way** — the clearance path F-1489-1 reported as unavailable is available. ' +
  '⚠️ **AND `:461` AND `:467` ARE NOT "SAME LINES" — THEY ARE DIFFERENT QUANTITIES**, which every prior write-up of this class collapsed into one "off-by-one": `:461` is `expect(afterTextures).toBe(baselineTextures)`, `:467` is `expect(afterCalls).toBe(baselineCalls)`. Because an early assertion disables what follows, a desktop `:461` red means `:467` was **never evaluated** — so "both projects, same signature" has always been two different measurements wearing one label. ' +
  '🔬 **TWO HYPOTHESES RAISED AND KILLED WITH MY OWN DATA, WHICH IS THE DURABLE HALF:** (1) *composition is the discriminator* — it fit runs 1–4 and would have explained s1489 neatly as a conflation of two meanings of "isolated" (composition-isolated vs quiet-box); **killed by run 5**, an isolated run that reddened. (2) *a cold dev server is the discriminator* — seductive: both reds were `repeat1`, the FIRST instance of each project, greening on repeats 2–3, and mobile’s **61→62** is *exactly* s1489’s number; **killed by run 6**, same cold arrangement, 6/6 green. **Neither survived a re-run of its own arrangement, and both would have shipped as solid findings had I stopped one run earlier.** ' +
  '📐 **WHY THE BISECT IS THE WRONG INSTRUMENT — now measured rather than cited:** in the quiet arm the predicate is **non-deterministic** (18/20), so a bisect step can flip on noise alone; in the battery arm it is red at current main **and** was red at pre-merge main (s1489’s own control), i.e. **all-BAD**, which converges on an innocent commit by construction. Both failure modes were already house law; this is the first time they have been demonstrated on a live subject. ' +
  '🏷️ **NAMED CAUSE (the GATE’s second branch, satisfied):** a **load- and arrangement-sensitive flake**, unchanged in kind since F-1136-1. The harness’s own comment records that boot-time lazy uploads "land for seconds and vary run-to-run", so when the box or the harness is slow enough exactly one lazy upload crosses the `baseline`/`after` boundary. That is why the signature is always **+1**, why it migrates between `:461` and `:467`, and why the absolute counts drift upward as the game grows (desktop 30→32→84). **NOT a regression, NOT a re-pin candidate, owned by no commit.** ' +
  '📂 Evidence: `artifacts/f1489-1/measurements.md` (the six-run table), `probe.mjs` (the predicate kept as ONE file so it cannot drift between runs), `quiet-cold.log`, `battery-run2.log`. Measured in detached worktree `gate-s1491` on scratch port **5234** — never main’s tree (§3.0b), never 5188 (`lane-a` was BUSY and holds it under `strictPort`), with a Codex lane running throughout, so **the green arms greened under MORE load than the control that reported them red.**';

lines[i] = row;
lines.splice(
  i + 1,
  0,
  '  - ↳ *superseded s1491* (kept verbatim — a refuted finding’s reasoning is worth more than its verdict, and this one was refuted only because it was written honestly enough to be checkable): ' +
    old.replace(/^- /, ''),
);
writeFileSync(p, lines.join('\n'));
console.log(`row ${i + 1} rewritten; superseded text retained on the line below`);
