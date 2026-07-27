# Review — lane-vp02-capture-error-surface

**Slice:** `lane-vp02-capture-error-surface` (FIRE-AUTHORED s1141, from F-1141-1)
**Branch / tip:** `lane/m4` @ `5e9eba91` — `runner(lane-b): lane-vp02-capture-error-surface.md`
**Base (merge-base with main):** `d1bb3420`
**Drained by:** s1142 fire, 2026-07-27
**§3.0 drain-block-check:** ✅ CLEAR — leaf `lane-vp02-capture-error-surface`, `status="queued"` (in neither {merged,shipped}, so a genuine undrained slice, not a re-drain).

## VERDICT: ✅ MERGE

The slice does exactly one thing and does it without collateral: it stops the two east-heading
capture call sites from throwing away the error object that vp-02g (`ef3731b8`) had already built.
Zero `src/`. No assertion loosened. The flake under study stays red.

## What it does

`canvasCaptureAtHeroFrame` **throws** an enriched timeout (`e2e/vp-02-sprite-animation.spec.ts:199`)
carrying the distinct observed `{direction, frameKey, fadeActive}` tuples plus `framesPolled`.
Both callers previously wrote `.catch(() => null)` — the error object was discarded, the test died at
`expect(west).not.toBeNull()`, and the report showed only `Received: null`.

The change captures the rejection reason into a parallel `westReason` / `eastReason` and passes it as
the Playwright `expect` message, **while still resolving to `null`** so the attempt-0 retry keeps
working. 16 lines, one file.

## Evidence (re-run by me on main AFTER the merge — not inherited from the runner)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.32 s** |
| `e2e/vp-02-sprite-animation.spec.ts`, desktop + mobile, `--workers=1` | **19 passed / 3 failed, 4.8 m** |
| Reds | `:566` desktop (the flake under study) · `:732` `char.claim_jumper` desktop + mobile (known) |
| Scratch port | **5257**, external dev server (5188 belongs to the lane runners — Mistake #12) |
| `src/` touched | **zero** |

**The 19/3 count is the expected baseline and matches s1141's measurement exactly.** The runner
honestly reported **18/4** and explicitly declined to chase it; my re-run reproduces 19/3, so the
runner's extra red was the known intermittent `:566` also failing on mobile in its sample. Sampling
noise in a flake whose rate s1141 measured at desktop 5/10, mobile 2/10 — **not a regression, and the
runner was right to report rather than chase it.** (Line numbers shifted `:724` → `:732` by this
diff's +8 lines; same tests.)

### s1141's REJECT bar, checked at source (not by grep of commit messages)

| Bar | Result |
|---|---|
| `:566` must still be RED (a green means the assertion was loosened) | ✅ **RED** on desktop |
| attempt-0 retry present and unmodified | ✅ `if (attempt === 0 && (!west || !east)) {` at `:595` — byte-identical, only line-shifted |
| no `test.retry` / `skip` / `fixme` added | ✅ `grep` finds **none anywhere in the file** |
| positive-control probe reverted | ✅ `r9c9` and `west-capture-timeout` both absent from the tip |
| assertion unweakened | ✅ `expect(west, msg).not.toBeNull()` — the message argument is Playwright's 2nd param; the matcher is unchanged |
| `canvasCaptureAtHeroFrame` body untouched | ✅ absent from the diff |

### The payoff, proven on a REAL failure — stronger than the runner's control

The runner proved the plumbing with a *synthetic* impossible frameKey (`r9c9`), which is the correct
control and it aimed at the defect's own branch (the helper's timeout throw). But my gate run produced
a **genuine, organic `:566` failure**, so the cure is verified on the actual defect, not a stand-in.

`test-results/vp-02-sprite-animation-eas-bf2d4-…-desktop-chrome/error-context.md`, verbatim:

```
Error: Error: page.evaluate: Error: Timed out waiting for
{"direction":"w","frameKey":"char-hero-sheet-rotation-f-r1c0.png","fadeActive":false};
observed=[{"direction":"w","frameKey":"char-hero-sheet-rotation-f-r1c1.png","fadeActive":true},
          {"direction":"w","frameKey":"char-hero-sheet-rotation2-f-r1c3.png","fadeActive":false}];
framesPolled=232

expect(received).not.toBeNull()
Received: null
```

**Before (s1141, same test, same project):** `Error: expect(received).not.toBeNull()` / `Received: null`
— and nothing else. The diagnosis now arrives for free.

## Merge classification

| File | Class | Action |
|---|---|---|
| `e2e/vp-02-sprite-animation.spec.ts` | **LANE-TOUCHED only** — `git log <base>..main -- <file>` is **empty**, main never moved it | straight take, **no graft needed** |
| `STATUS.md` | **MAIN-MOVED only** — `git log <base>..lane/m4 -- STATUS.md` is **empty**, the lane never touched it | **excluded** (stale-base phantom; the lane forked before s1141's handoff and my lock) |

Path-scoped add of the single spec file. No `-A`.

## Findings

### F-1142-1 — the real failure's observed-sequence REFINES F-1137-2, and points past the crossfade gate

s1141 diagnosed F-1137-2 as classification **(c), the crossfade gate**, on the evidence that
"`r1c0` appears only ever with `fadeActive:true`". The runner's synthetic sample agrees — its
observed list contains `r1c0` with `fadeActive:true`.

**But my organic sample does not contain `r1c0` at all.** Two facts from it, ✓ VERIFIED by reading
the artifact above, not inferred:

1. **Only 2 distinct tuples across 232 polled frames.** `observations` dedupes by serialized value,
   so the sprite changed state **twice in ~2 s** — it was effectively **static**, not cycling. A walk
   clip that were advancing would emit many more distinct frames, and `r1c0` would be hit repeatedly.
2. **The resting state is `direction:'w'` with `frameKey: char-hero-sheet-rotation2-f-r1c3.png` and
   `fadeActive:false`** — a **west** heading settling, fade complete, on a **rotation2** (east-family)
   sheet frame.

? **INFERRED, and deliberately not acted on:** (2) looks like a *resolver* symptom rather than a
timing one — if a settled west heading can legitimately rest on a rotation2 cell, the test's premise
is wrong; if it cannot, the bug is upstream of the crossfade. Either way this is **wider than
"fade faster"**, so **F-1141-2's routing to whoever owns sprite crossfade still stands but should
carry this sample with it** — the question to put to them is no longer only *when* to sample, but
*why a west heading rests on an east-family frame at all*.

**Not fire-authored, deliberately.** F-1141-2 is already an owner/attended-routed design fork
(§2E HARD LIMIT: no inventing scope over a design fork), and this refines that fork rather than
opening a separable one. It costs nothing to bank and it would have cost a fire to re-derive.

### F-1142-2 — non-blocking: the runner's 18/4 vs the expected 19/3

Resolved above: sampling noise in a known flake, reproduced at 19/3 by my re-run. Recorded only
because s1141's bar named the count explicitly, and a count that moves should never pass silently.

## Notes

- The runner marked itself **READY-FOR-GATES** and earned it: it ran s1141's scope-1 STOP gate first,
  quoted the "before" verbatim, confirmed rather than assumed the premise, ran a real positive control
  and proved the revert, and reported an unexpected count instead of chasing it. Nothing in its report
  needed correcting.
- Test-only slice, zero `src/` — **no screenshots and no perf table**, because nothing renders
  differently. The `error-context.md` page snapshot above is the rendering evidence.
