CODEX: model=gpt-5.6-sol effort=high
# f1406-1-aim-the-cross-engine-guard-at-a-subject-that-diverged — make the determinism guard able to fail (FIRE-AUTHORED, attended review welcome)
DISPATCH 2 (s1407) — content UNCHANGED; only the PRE-FLIGHT was repaired (F-1407-1). Dispatch 1
never reached scope 1: it stopped at a pre-flight that forbade churn the factory produces itself.
This is a CHANGED-PREMISE re-dispatch per CLAUDE.md §7.5, not an identical retry.
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled. Small.

WHY (F-1406-1 + F-1406-2, s1406 drain gate — reviews/f1405-1-cross-engine-wave-scaling-cure.md):
the f1405-1 cure is correct and is MERGED. Its guard is not wrong, it is **inert**: it probes
`the-claim`, and `the-claim` never diverged across engines — before the cure or after it.

✓ **CONTROL-PROVEN s1406, not inferred.** The guard file was copied unchanged into a detached
worktree at the PRE-cure tree and run there: **rc=0, 1 pass / 0 fail.** Green on the broken tree and
green on the fixed tree. A passing guard never executes its violation path, so its green was never
evidence about the red.

MEASURED THIS FIRE — all three contracts `HeadlessContractSim` supports, both interpreters, with the
pre-cure arm taken in a detached worktree (`scripts/twin-banks-hash-probe.mjs`):

  contract         pre-cure n26   pre-cure n23                cured n26    cured n23
  e1-dry-gulch     9de5c985       9de5c985      AGREE         9de5c985     9de5c985     AGREE
  the-claim        02561b7f       02561b7f      AGREE         b1eeb320     b1eeb320     AGREE
  e1-night-shift   c832307e       ed5d8203   ** DIVERGE **    30373c0b     30373c0b     AGREE

`e1-night-shift` is the discriminating subject: it would have gone **RED pre-cure, GREEN post-cure**.
It reproduces 3/3 on each engine. **The guard picked one of the two contracts that could not fail.**

⚠️ And the bench has the same blind spot, which is the class (F-1406-2): `scripts/gr-sim.test.mjs`
pins exactly ONE `eventLogHash` (`:162`, `the-claim`). The Night Shift test (`:184`) asserts only
`works.byKind.lantern_post` and never looks at a hash — which is how a live cross-engine divergence
sat on main unmeasured while the suite read a truthful 6/6/0 on both engines.

READ-FIRST (paths, read them, do not skim):
 · `reviews/f1405-1-cross-engine-wave-scaling-cure.md` — the matrix above and the control run.
 · `scripts/wave-scaling-cross-engine.test.mjs` — the guard as shipped (one contract, hard-coded).
 · `scripts/twin-banks-hash-probe.mjs` — the instrument; note its `--contract` / `--seed` flags and
   that `HeadlessContractSim` supports exactly `e1-dry-gulch`, `the-claim`, `e1-night-shift`.

PRE-FLIGHT (main slot, factory-churn aware — REPAIRED s1407, this master's first dispatch died here):
`git status --porcelain` must show no tracked dirt OUTSIDE the two factory-churn classes below. If
tracked dirt exists outside them and belongs to no task, STOP and report.
 ⚠️ **EXPECTED, NEVER A STOP — list them and PROCEED:**
   (a) `logs/**` — fire/runner accounting, rewritten every cycle by the factory itself.
   (b) `artifacts/**`, `reviews/shots-*`, any `.png` — regenerated evidence. The drain gate that
       dispatched you runs playwright, which rewrites tracked screenshots; this is the F-1266-1
       EVIDENCE-ARTIFACT EXCEPTION the lane pre-flight template has carried since s1266.
 ⓘ Dispatch 1 (`20260802-225251`) stopped right here having spent **54,875 tokens for zero edits**:
   it found 26 modified tracked PNGs under `artifacts/054/`, `artifacts/baron-presence/`,
   `artifacts/e2-enemies/` — the exhaust of the s1406 drain that authored this very master, one
   minute earlier. The run was CORRECT to refuse to guess; the pre-flight was the defect (F-1407-1).
 🚫 What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`,
   `specs/**`, `reviews/*.md` — anything a live drain or concurrent task could actually own.
   In particular `scripts/wave-scaling-cross-engine.test.mjs` must be clean before you touch it.

SCOPE (numbered, each testable):
 1. Widen `scripts/wave-scaling-cross-engine.test.mjs` to cover ALL THREE supported contracts:
    `e1-dry-gulch`/`e1-dry-gulch-01` · `the-claim`/`e1-the-claim-01` · `e1-night-shift`/`e1-night-shift-01`.
    Emit **one test per contract** so a red names the contract in its title rather than in a diff.
    Keep the existing clean-skip when a second interpreter is absent, and keep the FAIL-not-skip
    behaviour when both are present and disagree.

 2. Do NOT pin any hash value in this guard. Its assertion stays "the engines agree with each
    other", never "the engines produce <literal>" — a pinned literal is the thing this whole thread
    has failed on four times, and it would red the moment any lawful balance change lands.

 3. **PROVE THE GUARD CAN FAIL — this is the deliverable, not the green.** Manufacture the defect:
    in a scratch copy (a detached worktree, or revert the helper in a throwaway checkout — do NOT
    do this in main's working tree), restore `Math.pow(Balance.waves.hpScalePerWave, wave)` at the
    `spawnAtPosition` site, run the widened guard there, and report the **exact failure output**
    naming `e1-night-shift`. Then restore and show the green. Report both.
    ⓘ A guard whose red you have not seen is a guard you have not tested.

 4. Report the wall-clock the widened guard adds to `npm run test:node-guards` (it is 6 probes
    instead of 2; the s1406 measurement was ~6.3 s for 2). If it exceeds ~60 s, say so and propose
    a cheaper shape — do not silently accept a slow battery.

TOUCH-ONLY: `scripts/wave-scaling-cross-engine.test.mjs`.
NO: `src/systems/WaveSystem.ts` (the cure is merged and correct — do not touch it) · `Balance.ts` ·
`scripts/gr-sim.test.mjs` (widening the BENCH's pin coverage is F-1406-2 and is a SEPARATE slice —
if you think it belongs here, STOP and say so) · `scripts/twin-banks-hash-probe.mjs` (reuse it, do
not modify it) · `package.json` (the guard is already wired into `test:node-guards`) · any lane
branch · browser behaviour · meta.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/wave-scaling-cross-engine.test.mjs` — the triple, all three contracts green.
 · **The manufactured-defect run from scope 3** — paste the red, naming the contract.
 · `npm run test:node-guards` — exact `tests/pass/fail` triple, and the added wall-clock.

READY-FOR-GATES + report: the three-contract green triple, the manufactured red proving the guard
discriminates, and the wall-clock delta.
