# s2539 follow-up — classification hold lifted, candidate still unmerged

F-2537-2 is closed by the M2 test-readiness drain `0eac2a9bec302665ab3483ec0413eca2e7469992`. The goal is re-registered for draining its existing completed output; no runner re-dispatch is needed. Rebase the saved six-wait candidate `83f1429f6ff2dc26254f0c18225466991b6454ea` onto current main and run its required chapter, adjacency and boot gates. This fire did not accept or merge that candidate. See `reviews/main-m2-palisade-placement-diagnosis.md` for the causal proof.

# MAIN chapter story readiness

## Slice and candidate

Task: `tasks/main-chapter-story-readiness.md`. Done-move: `20260907-172449-main-chapter-story-readiness.md`. Detached candidate `83f1429f6ff2dc26254f0c18225466991b6454ea` at `/private/tmp/gr-gate-s2538`, based on `03d9fe1a1bcd6c771d085175b51bc6e02583b10d`.

## Verdict

HOLD — no implementation merged. Candidate `83f1429f6ff2dc26254f0c18225466991b6454ea` is backed up on `origin/save/main-chapter-readiness-s2538`. Its six MAIN edits were removed only after verifying the captured patch and saved commit. The goal is blocked with blockClass gate-side pending F-2537-2 classification; the original done-move remains as provenance, not permission to re-dispatch.

## What it does

The six Frontier exclusion tests wait for the story reader before requiring its later-epoch queue to equal `[]`. Contract diagnostics become ready independently of the deferred story import in `src/main.ts`; they cannot prove that `StoryRuntime` has published its reader. Each test reuses the wait already present in its neighboring epoch controls. Queue equality, DOM absence and console assertions remain strict. No runtime, timeout, screenshot path, fixture or helper changes.

## Evidence

The implementer reported twelve selected tests and twelve passes across desktop and mobile, three additional mobile E7 passes, typecheck and build. Its report identifies Node 23.11.1, so those results are distinct from the fire's required Node 26 verification: `artifacts/chapter-story-readiness/report.md`.

The fire's detached tree was clean after `npm ci`. Native Node 26.4.0 typecheck passed in 5.5 seconds and build in 23.1 seconds. Power passed at p95 0.428 ms against 0.500 ms; task, citation and gate-caller legs passed. The optional full Node attempt is incomplete: the generic wrapper terminated it at its 900-second limit. No Node pass is claimed. The explicit FIRE rule makes Node mandatory for simulation/entity/system changes; this candidate touches e2e only. The scope decision and failed wrapper receipt are retained in `artifacts/s2538-fire/gate-scope.md`. Receipts: `artifacts/s2538-fire/candidate.json`, `artifacts/s2538-fire/readiness.patch`, `artifacts/s2538-fire/npm-ci.log`, `artifacts/s2538-fire/core-gates.log`.

The fire's collection reported exactly twelve tests in six files. All twelve passed in 80.9 seconds; the additional mobile E7 repeat passed 3/3 in 22.5 seconds. Every selected test reported zero suppressed GLTFLoader errors. Receipts: `artifacts/s2538-fire/readiness-collection.txt`, `artifacts/s2538-fire/browser-gates.log`. The adjacent set returned 29/32 in 138.5 seconds: both M1 debug-spawn cases expected enemiesAlive > 0 and received 0, and mobile M2 edge-touch expected count 2 and received 1. The plain desktop/390px boots passed in 8.5 seconds with zero console/page errors. The complete unchanged-base adjacent control returned 30/32 in 131.5 seconds, reproducing both M1 errors exactly but passing both M2 cases. Therefore M2 remains unexplained and this candidate is not accepted; `artifacts/s2538-fire/base-control-state.json` proves every runtime, test, script and configuration source matches the integration base for that control.

## Merge classification

All six paths are finished MAIN-slot output, with one additive line each and no overlapping foreign edit: `e2e/ss-06-e5-beats.spec.ts`, `e2e/ss-07-e6-beats.spec.ts`, `e2e/ss-08-e7-beats.spec.ts`, `e2e/ss-09-e8-beats.spec.ts`, `e2e/ss-10-e9-beats.spec.ts`, `e2e/ss-11-e10-beats.spec.ts`. The report is new. The policy probe returned CLEAR for the registered queued leaf. Factory logs and unrelated artifacts remain outside this drain.

## Findings

F-2537-1 is addressed in the saved implementation, but its leaf remains held until drain acceptance. F-2537-2, the unresolved M2 edge-touch result, is separate. The broader `lane-c-chapter-evidence-opt-in` writer patch remains held under `reviews/chapter-evidence-opt-in.md`; accepting these six waits would not accept that patch or its older receipts.

F-2441-2 recurred as a measurement error: the 900-second generic wrapper cannot complete a battery whose recent native runs took 35–40 minutes. The process census after termination found no surviving child. The timeout is retained without a gameplay attribution, timeout increase or replacement green. This test-only task uses the explicit FIRE gate scope, not the broader generic skill default.

The next measurement is registered as `tasks/main-m2-palisade-placement-diagnosis.md`, restricted to M2 test readiness and diagnostic evidence. Runtime changes require a separately justified slice. Candidate and base failures are retained in `artifacts/s2538-fire/adjacent-results/` and `artifacts/s2538-fire/base-results/`; the three ordinary M2 screenshots last written by the base control are separately labelled `artifacts/s2538-fire/base-generated/`. They do not replace main's retained images.

The original port-22 backup failed with No route to host. An SSH-over-443 retry, preserving strict host-key checking and using the same GitHub remote, succeeded; see `artifacts/s2538-fire/candidate-backup.txt`. The owned Vite process was stopped.

Closing bookkeeping verification: main task guard 1,325 masters / zero invisible; ledger gate passed after the real handoff line existed, 1,050 assertions and 83 foundry checks in 106.2 seconds. This closes the fire paperwork, not the held implementation. Receipt: `artifacts/s2538-fire/closing-gates.log`.
