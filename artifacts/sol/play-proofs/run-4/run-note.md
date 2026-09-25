# Native play proofs — run 4 handoff

**Driver control: PASS.** The unchanged shared driver secured the Claim on desktop at wave 10 / 300.07 s, 143 HP, six buildings and 299 kills. All six cells pass: banked score, Book return, plain reload preserving 7400 score bytes, Book reopened on foot, zero console/page errors. [Control row](the-claim/row-desktop-chrome.json).

2026-09-25. **READY-FOR-GATES, with all three new-map full proofs HELD.** Three-map batch after the control, within the task's expected three-to-six range. No quota refusal, disconnect or timing failure is claimed. Actual base `e6336dd0c0ab196de897c5f1f3cb25df42ce360c`; lane `sol/map-art-campaign-2`.

| Map | Desktop / phone result | Evidence |
| --- | --- | --- |
| Far Side | FAIL, death waves 12 / 17. Phone: four air-supported crossings, probe recovered, one playback; four landing-yard builds, no northern build. | [F-PP4-1](e8-far-side/finding.md) |
| Low Orbit | FAIL, death waves 13 / 14. Both: four air-supported deck credits. Phone: all three grounds built. Zero suit harm. | [F-PP4-2](e8-low-orbit/finding.md) |
| Eclipse | FAIL, death waves 16 / 13. Three of four grounds each. Phone: dome/rim builds and four post-shadow pans; late stopping delay and 45 suit harm. | [F-PP4-3](e8-eclipse/finding.md) |

All nine rows (control, six map attempts, two Incline regressions) pass boot/clean with zero console/page errors. No new map has bank/Book/reload acceptance. Each new map received exactly two honest attempts, desktop then phone; its full-objective assertions remain enabled and red. No contract, runtime or balance defect is established by these strategies.

## What the driver learned

The Claim control validates ordinary movement, harvesting, building and persistence. It does **not** calibrate floaty/free-fall movement. The first Far Side attempt reached the crater, then coasted out of pan range while the funding helper waited. Counter-thrust and range rechecks restored actual gathering on phone. Probe recovery now waits for the published latch after real confirm presses. Low Orbit uses the handhold route around the solid centre, its own air/refill grounds and three-deck building goals. Eclipse uses the centre reserve and fresh regolith grounds across its four-wave windows. The score threshold now records the engine's secure wave, including 20 when a manifest has no override.

A second instrument error surfaced: the new helper demanded normalized momentum below 0.12 even after reaching its requested position. Eclipse phone waited at (-8.191990,20.469957), 0.508 units from its (-8,20) target, until its budget expired; this delay consumed suit air. The final correction accepts the actual walking tolerance and leaves panning proximity to the funding loop's continuing checks. It preserves all authored objective assertions. **That last correction is not an E8 play proof:** it landed after the second Eclipse attempt. Per-attempt driver snapshots preserve the exact earlier versions. The final driver passes Incline on both projects, but its final orbital behavior awaits a later planned attempt.

Owner handoff: continue with Dome Basin as the next untouched map; any planned E8 retry should first verify the final stopping behavior and air budget. These findings do not justify changing map balance. The passed Claim control must not turn a demonstrated orbital driver limit into a map-defect claim.

## Method, preflight and scope

Progressed-profile seed and staged launch as in the reference spec; permitted timescale 4; real WASD, Space, upgrade keys and HUD clicks only. Read-only diagnostics. Desktop 1280×800 and phone 390×844 in sequence, one worker, traces off. Own Vite port 5303, PID 91334, stopped at closeout. No attended ports used.

No ahead commits or uncommitted source work at preflight. Ran the authorized reset/clean, install and preflight build (exit 0). No evidence discarded. Restored only npm-generated optional-platform libc lock metadata and verified clean status before edits. **Base correction:** initial inspection saw main at `0bb2dfa07`; main advanced before `git checkout -B ... main`. Reflog confirms the actual reset/base was `e6336dd0c`, whose pre-existing attended scripts/task changes are not this task's edits. Final scope checks use that actual base. The TOUCH-ONLY firewall excludes vault writes; this allowed artifact is the durable handoff.

## Commands and verification

Per map/project: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/<id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-4/<id>/<desktop|mobile>-results`. All six new-map commands exit 1 at their full-goal assertion; the Claim control exits 0. Incline adds `GR_NATIVE_RUN=4` so earlier evidence is not rewritten.

- `npx tsc --noEmit`: PASS, exit 0 ([log](tsc-final.log)).
- `npm run build`: PASS, exit 0, including TypeScript and asset checks; existing Vite/asset-diet warnings ([log](build-final.log)).
- `npx playwright test --list --workers=1`: PASS, exit 0, 3446 tests / 469 files ([log](default-list.log)). Collection is not a skip proof.
- Actual env-unset native suite, both projects, one worker: **28 skipped**, exit 0 ([log](gate-unset.log)). No new long default run.
- Final-driver Incline: **PASS desktop/phone**, wave 14 / 17, 573.73 / 703.07 s; both carts 180/180 HP, all six cells, zero errors. [Desktop](e2-incline/row-desktop-chrome.json), [phone](e2-incline/row-mobile-chrome.json), [desktop command](incline-desktop.log), [phone command](incline-mobile.log).
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, one worker: **2 passed**, exit 0 ([log](adjacent.log)); this is a bounded adjacent check, not the full suite.
- `python3 artifacts/sol/play-proofs/run-4/verify.py`: PASS ([result](verification.json)). Only allowed task paths; exactly three status rows, second column only; one appended report section; nine clean rows; all terminal PNGs and successful Book PNGs present. Direct image inspection includes Claim secure, Far Side phone death, Incline desktop secure and phone Book.

## Commits

- `8eee43946` — Claim control.
- `733968175` — Far Side attempts and drift correction.
- `a9e5dd694` — Low Orbit deck attempts.
- `be1c64817` — Eclipse attempts and final arrival correction.
- Final gates and this handoff: the containing closeout commit, hash in the final response.

## REMAINING LIST IN ORDER

Current unresolved map first, then untouched continuation, then this batch's earlier exhausted holds. **Next untouched: e9-dome-basin.** Do not repeat the two-attempt holds without a planned follow-up.

1. e8-eclipse — FAIL, F-PP4-3; final stopping correction still awaits E8 proof.
2. e9-dome-basin.
3. e9-seed-run.
4. e9-devils-alley.
5. e9-old-canal.
6. e10-last-claim.
7. e10-river.
8. e8-far-side — FAIL, F-PP4-1; two attempts exhausted.
9. e8-low-orbit — FAIL, F-PP4-2; two attempts exhausted.

Earlier Baron, Twin Banks, Pressure Garden, Blackout Ridge, Fairground and E4 holds remain outside this run. Canyon Works remains with its separate corrective owner.
