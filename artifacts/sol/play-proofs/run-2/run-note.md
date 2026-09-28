# Native play proofs — run 2 findings and continuation

2026-09-25. **READY-FOR-GATES**, with the failed native objectives explicitly held. Three-map batch: **no new full map proof**, one partial and two failed proofs. Each map received two honest native attempts, desktop then phone. Closing at the task's expected three-to-six-map batch boundary; no quota refusal, disconnect or host-load failure is claimed. Base `adac606285211dd2dff461fa0954ca5d7f634675`, lane `sol/map-art-campaign-2`.

| Map | Outcome on desktop / phone | Finding |
| --- | --- | --- |
| Blackout Ridge | PARTIAL: wave 12 both; bank/Book/reload/clean PASS; storage FAIL | F-PP2-1: banks and trunk did not remain alive together; both banks peak 0 Wh. |
| Canyon Works | FAIL: both outlive wave 8, CONNECT 0/2, no gold or buildings | F-PP2-2: full-width southern slope blocks the bridge and both flanks around z=-7.88. |
| Fairground | FAIL: wheel stops at wave 2 / wave 1 | F-PP2-3: wall-first opening gives 0 crossings; early-beacon phone gives 1/3 crossings. |

[Blackout finding](e3-blackout-ridge/finding.md) · [Canyon finding and source calculation](e3-canyon-works/finding.md) · [Fairground finding](e3-fairground/finding.md). All six map rows report zero console/page errors. Findings distinguish measured strategy failures from the Canyon's source-supported traversal defect. Failed full-objective assertions remain enabled behind the opt-in gate.

## Method and adaptations

Existing progressed-profile seed, staged contract launch and permitted timescale 4. Real WASD, upgrade keys, HUD clicks and Space only; diagnostics are read-only. No game, balance, contract, config, art-store or existing non-native-test edits. Own Vite on 5303, PID 51764 (stopped at closeout); desktop and phone browser runs sequential, one worker, trace off. Later source inspection supports findings without changing gameplay.

Blackout's first route repaired the nearest damaged bank/frame, funding each separately; the second reserves repair gold and services west-to-east. The second is retained. Canyon's route probes the central bridge then west positions on desktop, east positions on phone, before trying the gallery economy; it records the failed CONNECT latch. Fairground first built six walls before guns; the retained phone strategy interleaves guns earlier and approaches repairs within the actual radius. Wheel spinning plus every flock crossing are explicit assertions. A stopped wheel ends the proof because it cannot recover. Screenshots show the failed boards rather than implying an objective pass.

`nativeProof(id, run)` isolates evidence by run. `GR_NATIVE_RUN=2` routes the unmodified Incline regression spec into this run's evidence directory; no run-1 artifacts are rewritten. Incline's strategy and full objective assertions are unchanged.

## Commands and verification

- Preflight: clean lane, no ahead commits, no uncommitted work. `npm install --no-audit --no-fund` and `npm run build` passed. npm removed only optional-platform libc metadata in package-lock; restored that self-generated churn and verified clean status before edits. No regenerated evidence needed discarding. All new evidence stays under run-2; Playwright failure contexts and last-frame images are retained with the proof rows.
- Final TypeScript: `npx tsc --noEmit`, exit 0 ([log](tsc-final.log)).
- Final build: `npm run build`, exit 0 ([log](build-final.log)); existing Vite/asset-budget warnings only.
- Collection: `npx playwright test --list --workers=1` ([log](default-list.log)); actual gate-unset invocation, both projects, **14 skipped, exit 0** ([log](gate-unset.log)). Collection alone does not establish skips.
- Shared-driver regression: Incline **PASS desktop/phone**, wave 17 / 694.13 s and wave 14 / 573.47 s, all six cells and 180/180 HP carts, zero errors. [Desktop row](e2-incline/row-desktop-chrome.json), [phone row](e2-incline/row-mobile-chrome.json), both enabled commands exit 0.
- Final scope/row verification: PASS ([JSON](verification.json), rerunnable [script](verify.py)); exactly three status rows changed, second column only, one appended campaign section, all eight rows clean, all terminal PNGs present and all four banked rows have Book PNGs. Adjacent unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects with one worker: **2 passed, exit 0** ([log](adjacent.log)). This is a bounded adjacent check, not the full suite.

Play command per map/project: `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/<id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-2/<id>/<project>-results`. All six new map attempts exit 1 at their full-goal assertion. Their boots and clean cells pass; Blackout's banking/Book/reload also pass. No failed map is claimed green. Incline regression adds `GR_NATIVE_RUN=2`.

The task's TOUCH-ONLY firewall excludes Obsidian writes; this allowed run note is the durable handoff.

## Commits

- `757a90f14` — Blackout Ridge repair strategies and partial evidence.
- `98c84a42e` — Canyon Works crossing controls and slope blocker.
- `02573a4ac` — Fairground fort openings and full wheel/flock assertions.
- Final gate evidence and handoff: containing closeout commit, hash in the final response.

## REMAINING LIST IN ORDER

Current unresolved map first, then untouched maps in the task's exact order, then exhausted earlier findings. **Next untouched map: e4-dust-flats.** Do not repeat two-attempt findings without a planned follow-up; Canyon needs its traversal defect assigned to the contract/simulation owner. Original three holds remain for the campaign's planned final attempt.

1. e3-fairground — current FAIL, F-PP2-3; two attempts exhausted.
2. e4-dust-flats.
3. e4-gusher-county.
4. e4-boneyard.
5. e8-far-side.
6. e8-low-orbit.
7. e8-eclipse.
8. e9-dome-basin.
9. e9-seed-run.
10. e9-devils-alley.
11. e9-old-canal.
12. e10-last-claim.
13. e10-river.
14. e3-blackout-ridge — PARTIAL, F-PP2-1; two follow-up attempts exhausted.
15. e3-canyon-works — FAIL, F-PP2-2; two attempts exhausted, three routes in each attempt.
16. e1-baron — original hold, F-PP1-1.
17. e1-twin-banks — original hold, F-PP1-2.
18. e2-pressure-garden — original hold, F-PP1-3.
