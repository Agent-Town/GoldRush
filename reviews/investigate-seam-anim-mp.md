# investigate-seam-anim-mp — seam panning follows the harvesting rider

**Slice:** `investigate-seam-anim-mp` · **Branch:** `lane/lane-c` · **Tip:** `2310f86036af6b7f6f4d4f061644c294b5e5b93d` · **Base:** `e3f3874d5f10ac6471cca3a3011026ee5b45417d`
**Merged to main:** `0c4acd6f0550e86b293acb0c7de3085f4980f4dc` · **Drained:** s1787, 2026-08-15
**Gated in:** detached worktree `/tmp/gr-s1787-seam.TL33OB`; merged to main as one act

## VERDICT: MERGE — multiplayer seam collection now animates the rider actually holding the harvest channel.

## Root cause and fix

The mixed human+AI ride put the browser rider in slot 1. Harvest state correctly named actor `"1"`, but the render loop drove the pan clip from transient `mpActionSlot`, which had already returned to slot 0. The collecting rider therefore remained idle.

The fix asks the existing harvest snapshot whether each rendered actor owns an active channel. It adds no parallel state, timer, protocol field, or fallback animation path.

## Measurement matrix

| Scenario | Active channel | Clip before | Clip after |
|---|---:|---|---|
| Browser rider in slot 1 beside a headless rider | `1` | `idle` | `pan` |
| Solo desktop | `0` | — | `pan` |
| Solo mobile, 390px | `0` | — | `pan` |
| Solo after the headless rider drops | `0` | — | `pan` |

The retained JSON also reports frame-time p95 of 381.5 ms in the pre-fix multiplayer capture and 35.8 ms after, plus 71.3 ms desktop solo, 41.8 ms mobile solo, and 8.9 ms after drop. Those separate captures show no observed regression; they are not a causal performance claim.

## Evidence

| Gate | Result |
|---|---|
| Policy | exact done-move `drain-block-check --strict` **CLEAR** immediately before merge |
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green; Vite build and asset-diet checks passed |
| New seam animation coverage | **3 passed + 1 intentional mobile multiplayer skip**, `--workers=1` |
| Required `task-025` + `m1-01` + `m2-01` canaries | **32/32 passed**, desktop + 390px mobile |
| Crossing/plain-boot hygiene | **4/4 passed**, desktop + mobile, zero browser/page errors |
| Combined browser evidence | **39 passed + 1 expected skip** |
| Screenshots and telemetry | `artifacts/seam-anim-mp/` contains the before/after multiplayer pair and solo desktop/mobile/drop captures with JSON |
| Node guard battery | not triggered: no `src/sim/`, `src/systems/`, or `src/entities/` path changed |

Visual comparison confirms the target actor is standing idle in the pre-fix multiplayer capture and visibly panning beside the seam in the corrected capture. The `+5` float and active-channel telemetry identify the same collecting rider.

## Merge classification

Main moved neither touched source/spec path after base `e3f3874d`; the final main merge was a clean `ort` merge with no conflict or graft.

| Path | Classification |
|---|---|
| `src/game/Game.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — per-actor clip selection uses the existing harvest snapshot |
| `e2e/mp-02-lockstep.spec.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — solo and mixed-rider regression proof |
| `artifacts/seam-anim-mp/*` | new, lane-only visual and telemetry evidence |

## Findings

No blocking or corrective finding. The measured root cause is fixed at the shared render decision without expanding protocol or simulation scope.
