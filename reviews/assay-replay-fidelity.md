---
verdict: HOLD-NOT-MERGED
slice: assay-replay-fidelity
base: b1f880c65d993fd845d78ac2b2090fbd7d06f0c7
tip: 2ba06e494f74a0baee1edf414b804df8e7e8fc57
saved: save/assay-replay-fidelity-s1796-hold
date: 2026-08-15
---

# Assay replay fidelity — gate-side hold

## Verdict

**HOLD — NOT MERGED.** The investigation completed its required matrix and correctly fired the master's honesty stop. One tape per life already works; replay fidelity still fails for a fresh single-life tape whose recording boot applied saved progression state. The assay worker remains blocked.

The candidate adds a round-trip measurement spec and worker-isolated assay ports, but it deliberately asserts the progressed-profile mismatch as the expected counterexample. It is diagnostic evidence, not the green fidelity contract the launch gate requires, and the full Node/adjacent battery was not run after the stop.

## Matrix

| Cell | Recorded | Replayed | Verdict |
| --- | --- | --- | --- |
| Second live reel | `a4025223`, secured, W10, 300g | `ae34aa2f`, unsecured, W1, 5g | Diverged |
| Fresh, no restart | `39421f64`, unsecured, W0, 0g | Same hash/outcome | Clean |
| Death-screen restart | `a251ce02`, unsecured, W0, 0g | Same hash/outcome | Clean; new UUID/tick origin |
| Curated control | `6dff07d6` desktop / `6c397654` mobile | Matching hash/outcome per project | Clean |
| Fresh Territory I | `d6ceecd8` | `168dafd5` | Diverged |
| Original pinned reel | `f6390382`, secured, W10, 280g | `29454bf2`, unsecured, W4, 30g | Still diverged |

## Root cause

- `src/game/RunTape.ts` v1 stores contract, seed, difficulty, input streams, event hash, and outcome, but no deterministic run-start profile/research state.
- Normal live boot installs `RunManager`, which loads saved meta progression and applies it to the run.
- Assay replay takes the replay-only constructor path before `RunManager` installation, so it starts from empty progression state.
- The Territory-I control makes the difference observable: live recording receives the free palisade kit; replay rejects the same placement and hashes a different event stream.
- `RunManager.patchResetRun()` already calls `startRun()` after every reset, and `onRunStarted` creates a fresh `RunTapeRecorder`; the inherited restart-spanning hypothesis is false for current tapes.

## Evidence and classification

| Check | Result |
| --- | --- |
| Policy | `drain-block-check --strict`: CLEAR / planned before this hold was recorded |
| Candidate diff | exactly two paths: new `e2e/assay-replay-roundtrip.spec.ts`, modified `scripts/assay-replay.mjs`; `+125/-2` |
| TypeScript / build | runner reports pass; build completed in 1.68 s |
| Pinned assay test | runner reports pass |
| New round-trip spec | desktop + mobile passed serially and at two workers; zero captured console/page errors |
| Full Node / adjacent suites | intentionally not run after the mandatory stop fired |

Main did not move either candidate path after the base, so both are lane-only. No candidate content entered main's working tree or history.

## Finding

### F-1796-1 — BLOCKING: a tape omits deterministic run-start state

The owner-ratified replay-truth law cannot verify a claim when recording and replay begin from different progression/research state. Fixing one reel or only the Territory-I free kit would encode the symptom. The successor needs an attended, format-level contract for the minimal deterministic run-start snapshot, backward handling for v1/pre-fix tapes, and explicit size proof under the unchanged 64KB submission cap.

## Custody and next action

The partial candidate is preserved at `save/assay-replay-fidelity-s1796-hold` (`2ba06e494f74a0baee1edf414b804df8e7e8fc57`). The done marker is retained as `tasks/done/stopped-s1796-gate-side-20260815-165145-assay-replay-fidelity.md`, and the goal leaf is gate-side blocked.

Attended should re-scope the run-start-state schema before a fresh re-land. The next proof must turn the progressed-profile counterexample into hash/outcome parity, run the full Node and adjacent browser battery, and only then unblock authoring of the worker loop. No owner word alone lifts this hold.
