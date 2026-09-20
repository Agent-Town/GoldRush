# gazette-welcome-release-state-probe

**Slice:** `lane-b-gazette-welcome-release-state-probe` (FIRE-AUTHORED s1261)
**Branch:** `lane/m4` (lane-b worktree) · **Tip:** `103f07cc96ec1f992d619788c0388efc4a4ba9c1`
**Base:** `68f37c2dc708e043ea3516cb5efbeb3e91548d65` (s1261's own authoring commit)
**Drained:** s1262

## Verdict

**ACCEPTED — MERGED, with one pre-existing red proven pre-existing by control, and one finding
that outranks the slice (F-1262-5).**

The slice does what it was authored to do and its scope-1 observe-first STOP was executed
honestly. It is merged because a control on the **unmodified** spec reproduces the residual red
identically — the change neither causes nor cures it.

## What it does

`e2e/gazette-welcome.spec.ts:45` ("the Gazette welcome fires once, walks skippably, and retriggers
through the newsie") asserted that the newsie **stops following the player** after the welcome's
final beat by waiting **50 ms of wall clock** and then checking displacement. That coupled a
behavioural claim to how many sim ticks happen to fit in 50 ms.

The slice exposes the state that claim is *about* and asserts on it directly:

- `src/town/TownScene.ts:162` — `welcomeFollowsPlayer: boolean` added to the `TownDiagnostics` type.
- `src/town/TownScene.ts:2217` — populated from `this.welcome.followsPlayer`, a read-only getter
  over `phase` that `TownScene` already reads every frame. Behaviour-neutral: no new state, no
  new writes.
- `e2e/gazette-welcome.spec.ts:86` — `waitForTimeout(50)` replaced by
  `await expect.poll(() => …welcomeFollowsPlayer).toBe(false)`. The displacement bound is **kept**,
  now sampled after the state settles rather than racing it.

3 insertions, 1 deletion, 2 files. `src/**` change is additive and diagnostic-only.

## Scope 1 — the mandatory observe-first STOP: EXECUTED, and it cleared

The master made scope 1 a STOP with two exits, either of which would have outranked the test
change. **Neither fired.** The run's probe, sampled per frame immediately after the final click:

| Sample | Frame | Phase | `followsPlayer` | Displacement |
|---:|---:|---|---|---:|
| 1 | 440 | idle | false | 0.130384 |
| 6 | 445 | idle | false | 0.358050 |
| 12 | 451 | idle | false | 0.702140 |

- `followsPlayer` **does** go `false`, immediately, phase `idle` → the release genuinely happens;
  the pre-existing green was not luck. **Exit 1 did not fire.**
- Peak displacement over the 12-frame window **0.702140 < 1** → **exit 2 did not fire** *in the
  run's environment*. ⚠️ It fires in mine — see F-1262-4.

## Evidence — gates on the MERGED tree (this fire, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, Vite 1.37 s; asset-diet ceilings respected (herald 1,158,214 / 1,500,000 B) |
| `run-guards.mjs` (full battery) | **10/10 PASS** |
| `citation-title-guard` | **PASS**, 330 scanned |
| `findings-state-guard` | **PASS**, double-state 0 |
| Slice spec, `--project=desktop-chrome`, 1 worker | **5 passed** |
| Slice spec, both projects, default workers, `--repeat-each=3` | **24 passed / 6 failed** — all 6 the `:88` displacement bound |

### The residual red, and why it does not block

`e2e/gazette-welcome.spec.ts:88` — `expect(Math.hypot(…)).toBeLessThan(1)` — fails under
concurrency. **The `expect.poll` the slice added is NOT the failing assertion; it passes.**

**Control (the decisive evidence):** the spec reverted to its pre-merge form
(`waitForTimeout(50)`, `git checkout HEAD -- e2e/gazette-welcome.spec.ts`), same tree, same load,
same command:

| Arm | Spec | Workers | Result | Displacement |
|---|---|---:|---|---:|
| Treatment | merged (`expect.poll`) | 6 | **6 failed** / 24 passed | 1.958290 |
| **Control** | **unmodified (`waitForTimeout(50)`)** | 6 | **6 failed** / 24 passed | — |
| **Control** | **unmodified (`waitForTimeout(50)`)** | 2 | **1 failed** | **1.140395** |
| Either | — | 1 | **5 passed** | — |

The unmodified spec fails the same assertion with the same shape. ⇒ **the slice is exonerated**;
this is a pre-existing, load-dependent red on clean main. Machine load average during all arms:
**24.25 / 17.75 / 12.29**.

## Merge classification

Base `68f37c2d`. Both changed files verified **LANE-TOUCHED ONLY** — `git log <base>..main -- <file>`
is empty for each, so main never moved either. **No graft required; no conflict possible.**

The two-dot `main..lane/m4` diff additionally shows `D` on four `logs/session-scratch/s1262/*`
files and `M` on `STATUS.md` / `tasks/BACKLOG.md` / the generated `logs/*.html`. Those are
**stale-base artefacts** — the lane branched at `68f37c2d`, before this fire's commits — not
deletions the lane performed. Merge was path-scoped to the two real files only.

## Findings

- **F-1262-4** — the `<1` displacement bound is load-dependent and reds on the **unmodified** spec
  at ≥2 workers. The bound is only meaningful relative to a *bounded observation window*; the old
  `waitForTimeout(50)` supplied one implicitly, and swapping it for a state poll removes the window
  while keeping the bound. Non-blocking for this merge (control-proven pre-existing) but the test
  is now **less** bounded than before, not more. Corrective needed — see next-fire note.
- **F-1262-5** — this measurement **refutes the basis of s1261's F-1261-6 retirement** of the
  `gazette-welcome-newsie-drift-window` leaf. That retirement rested on "0 failures in 48
  executions across workers {1,2,4}". I reproduce the failure at **2 workers on the unmodified
  spec**, inside that stated sample. ⇒ the leaf was retired on an undersampled measure. **Attended/
  owner call to un-retire.**
- The run self-declared **NOT READY-FOR-GATES** for one honest reason: a desktop `wd02-barks` red
  (`hintsSeen=true` before dismissal) whose exact signature is absent from `suite-red-inventory.md`,
  where the master required an inventory fingerprint for every red. F-1113-2 names that test
  flaky/non-blocking and the run's isolated rerun was **6/6**. Given the load regime measured above,
  that red is the same class as F-1262-4. **The refusal was correct discipline and is recorded, not
  punished.**

## Next fire

The corrective is **not** "raise the bound". Restore the missing *window*: sample the newsie over a
fixed frame count after `welcomeFollowsPlayer` goes false (the run's own scope-1 probe already does
exactly this — 12 frames, peak 0.702) and assert on that peak. That makes the assertion
load-invariant instead of load-scaled. **Requires a measured basis for the frame count and the
bound — do not guess it.**
