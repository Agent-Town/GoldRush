# F-SOL-SIM-001 gate evidence

Status: **PARKED — NOT READY-FOR-GATES.** See `FINAL-EVIDENCE.md` and `MP-BLOCKER-EVIDENCE.md`.

- Current-tip fixed-step observation: 6/6 passed; 30/60/144 fps produced identical 300-tick timelines and Economy hash `fnv1a32:0f6f2150`; output not retained.
- Current-tip perf-04 observation: 2/2 passed; two 600-second runs produced 18,000 samples and `fnv1a32:598dff4d`; output not retained.
- Current-tip Night Shift observation: 2/2 passed after root-caused fixture correction; output not retained; no product pause or Balance change.
- Current-tip authorized-driver observation: 42 passed / 1 project-skip with assertion intent preserved; output not retained.
- Wave-20 FULL p95 observation: current main median 29 ms; branch median 27 ms. The final raw captures were not retained, so this is not claimed as checksummed gate evidence.
- Full desktop observation: 537 enumerated; 496 passed / 31 failed / 4 skipped / 6 did not run. The final reporter output was not retained, so the older checksummed full log remains the only raw full-run artifact.
- Multiplayer: identity and MP-03 pass isolated; the required desync-restore case fails 0/2 in exact isolation. Fixed scheduling exposes unilateral mismatch detection, while the checked-in task-067 green artifact itself contains unequal post-restore hashes.
- Feel A/B: two exact 30-second captures, zero browser errors, contact sheet and side-by-side video under `artifacts/sol/fixed-step-feel/`.

Older raw logs in this directory remain the original park-time evidence and predate `069ba5e`. The blocker files supersede the prior interpretation, not the raw outputs.
