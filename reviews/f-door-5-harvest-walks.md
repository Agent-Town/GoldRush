# Review — f-door-5: the harvest walks

**Slice/branch/tip:** f-door-5 (`tasks/lane-fdoor5-harvest-walks.md`, with the granted executor lift) · `lane/d` · merged `3dd7790d64114f42ed66fa8cb5346f79e3c54f6c` · drained attended 2026-08-08 ~12:45. Owner ruling verbatim: "Yes, fix that - this is why we have the agents play now."

**Verdict: MERGED — THE WALK ERA BEGINS HERE.**

**What it does:** Headless HARVEST loses its teleport. The executor (StandingOrders.ts, +5 under the lift) routes the prospector to the seam via the existing movement machinery; `panAt` pays only within the browser's own proximity radius. Idle pins are untouched — an idle run never harvests, so the era shift is exactly as wide as the mechanic: dry-gulch's ordered-run hash moved (`f63d981b → 07fd38b9`), nothing else. The parity fixture now genuinely walks seam 2 → 3 → 1 and still secures; the moth-season fixture needed no edit.

**Evidence:** tsc/build rc=0 · gr-sim 15/15 on BOTH engines, pins byte-identical across them · front-door-parity 4/4 + moth + adjacents **38/38** both projects (first battery run hit an orphaned lane-b vite on port 5188 — killed by pid, clean re-run) · node-guards on v26.4.0: 387 tests / 385 pass / 2 fail = the standing collection class · task-guards red was MY OWN unregistered overtime master — leaf registered in this commit (Goal Registration Law, enforced against its operator). Transcript `artifacts/f-door-5-gate.txt`.

**Merge classification:** base = post-f1550-1 main; five files LANE-TOUCHED, skill.md auto-merged clean. The executor edit stayed within the lift (HARVEST routing only; grammar untouched).

**Era note for the Field Book:** pre-walk standings (all of them) are not decision- or economy-comparable with post-walk rows; the AP-15 era-stamp law applies from this merge forward.
