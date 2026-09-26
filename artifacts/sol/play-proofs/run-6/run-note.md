# Native play proofs — run 6 and campaign close

2026-09-26. **READY-FOR-GATES with the recorded holds.** All three final untouched maps received desktop and phone journeys, in order. **Old Canal FAIL; Last Claim PASS both projects; River PARTIAL both projects.** No quota refusal, disconnect, boot stall or host-load retry. Base `7b509e624` (full hash in `base.txt`), lane `sol/map-art-campaign-2`.

| Map | Desktop / phone | Evidence |
| --- | --- | --- |
| Old Canal | Death waves 19 / 18; all three choices work; eight / seven builds. No secured bank/reload. | [F-PP6-1](e9-old-canal/finding.md) |
| Last Claim | PASS, wave 8 / 240.07s, vent 331.2 / 338.4 of 360 HP, bank, actual finale Book return and byte-identical reload. | [Proof](e10-last-claim/proof.md) |
| River | Authored lever and pan PASS: 30 gold, wave 0, no enemies through 35.10 / 35.00s; Book return PASS. Completed bank/persistence FAIL: no ending score. | [F-PP6-2](e10-river/finding.md) |

All six map rows and both final Incline rows have zero console/page errors. Full assertions remain enabled: Old Canal's two commands exit 1, Last Claim's paired command exits 0, River's paired command exits 1 at banks. No failed full proof is called green. Old Canal and River each have two honest journeys; no further retries in this task.

## What changed and what it proves

Old Canal's route demolishes B to open central defense ground near the seams, builds an early turret, then re-digs A/C through real context buttons. Both final snapshots prove all three choices and the derived water/open-ground split. That resolves the generic kit's placement refusal; its remaining survival failures do not establish a map defect. Choices persisting across a completed run were not tested.

Last Claim retains the existing native kit and requires the live warm vent at wave 8. The bank click runs the finale, so the driver now uses the actual Return to the Ark button to reach the Book. This completes the journey the earlier instrument stopped measuring. The current briefing's warm-vent objective is proven; no broader presentation or ten-deck narrative acceptance is inferred.

River earns a separate Last Claim prelude in each project, then clicks the real Charter Press lever. The application itself produces `?contract=the-claim&nowaves=`; the harness never synthesizes the flag or stages a charter. River's prelude lives in `objective.prelude`; its terminal fields measure the quiet pan. Ordinary Back to Town suspends this ending and reaches the Book, but writes no completed `e10-river` score. Reload keeps 7,396 existing score bytes and reopens the Book, not a nonexistent ending score. This is a mismatch between the requested bank criterion and the authored door-exempt ending, not a wave-survival failure. Prior Last Claim and raw River census text is retained verbatim with our measurements appended.

Shared-driver Incline regression ran on desktop then phone before Old Canal, and again after finale support before Last Claim. Both paired commands pass. Final rows: desktop wave 14 / 591.33s / 87 HP, phone wave 14 / 583.87s / 66 HP, carts 180/180, all six cells, zero errors. Initial rows are retained in `incline-initial/`; both command logs remain.

## Method and scope

Progressed-profile seed and permitted timescale 4, real WASD/Space/upgrade keys and HUD clicks, read-only diagnostics. Own Vite PID 93359 on 5303, stopped at closeout; one worker; projects sequential; trace off. No runtime, balance, contract, art-store, protected test or config edits. Task firewall excludes vault writes; this note is the durable handoff.

Preflight: clean lane, no ahead commits; authorized reset/clean discarded no evidence. Install and preflight build exit 0. Restored only npm-generated optional-platform libc metadata and verified clean before edits. See [preflight](preflight.md). No attended ports used.

## Gates and commands

Each native invocation uses `GR_NATIVE_PROOF=1 GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/native-proofs/<id>.spec.ts --project=<desktop-chrome|mobile-chrome> --workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-6/<id>/results`. Paired invocations pass both project flags, still one worker and sequential. Incline adds `GR_NATIVE_RUN=6`.

- `npx tsc --noEmit`: PASS, exit 0 ([log](tsc-final.log)).
- `npm run build`: PASS, exit 0, including TypeScript and asset checks; existing Vite/asset-diet warnings ([log](build-final.log)).
- `npx playwright test --list --workers=1`: PASS, exit 0, 3,484 tests / 472 files ([log](default-list.log)). Collection alone does not establish skipping.
- Actual env-unset native run, desktop/phone and one worker: **40 skipped, exit 0** ([log](gate-unset.log)). No new default long run.
- Final-driver Incline: **2 passed, exit 0** ([log](incline-finale.log)); initial paired regression also 2 passed ([log](incline.log)).
- Scope/evidence verifier: PASS, `python3 artifacts/sol/play-proofs/run-6/verify.py`; only allowed paths, exactly three second-column edits, prior E10 instruments preserved, eight final rows and required PNGs ([result](verification.json)).
- Direct image inspection: Incline phone Book, Old Canal desktop loss, Last Claim desktop secure, River desktop pan. Screenshots are observations, not visual-art acceptance.
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, desktop/phone, one worker, trace off: **2 passed, exit 0** ([log](adjacent.log)). This is not a full existing-suite run.

## Commits

- `a07d4234c` — Old Canal choices, survival holds and initial regression.
- `31d589fc2` — Last Claim full proof, shared finale support and final Incline regression.
- `2afa45a3d` — River authored journey and completed-score hold.
- Closeout evidence/report: containing commit, hash in final response. The closeout corrects River's prose timings to the exact row values, 35.10/35.00 seconds; rows are unchanged.

## REMAINING LIST IN ORDER

**No untouched campaign maps and no further play attempts remain in this task.** These are follow-up owners' unresolved acceptances, not permission to repeat exhausted attempts:

1. e10-river — decide ending-specific acceptance versus a separately authorized completion record; F-PP6-2.
2. e9-old-canal — stronger central defense/repair survival or human test; F-PP6-1.
3. e1-baron — boss defeat and survival; F-PP1-1.
4. e1-twin-banks — wave-20 survival; F-PP1-2.
5. e2-pressure-garden — three hot boiler beds plus survival; F-PP1-3.
6. e3-blackout-ridge — live current storage in both authored banks; F-PP2-1.
7. e3-canyon-works — separate corrective owner and subsequent native re-proof; F-PP2-2 (historical campaign defect, no current re-test here).
8. e3-fairground — spinning wheel and all flock crossings; F-PP2-3.
9. e4-dust-flats — haul, Land-Yacht and secure; F-PP3-1.
10. e4-gusher-county — delivered leases plus survival; F-PP3-2.
11. e4-boneyard — tow route/arrival tolerance plus survival; F-PP3-3.
12. e8-far-side — orbital movement and northern build/survival; F-PP4-1.
13. e8-low-orbit — orbital survival; F-PP4-2.
14. e8-eclipse — orbital stopping/air, full grounds and survival; F-PP4-3.
15. e9-dome-basin — defense survival after the working quarry/gates; F-PP5-1.
16. e9-seed-run — survival after the working escort; F-PP5-2.
17. e9-devils-alley desktop — eastern build; phone already proves the map; F-PP5-3.

## CAMPAIGN TABLE

**Inventory correction:** the task says 26 touched maps. The original run-1 task lists **19 target contracts**. Saved rows in runs 1–5 contain **17 unique contracts including the Claim control**, and this run adds the remaining three: **20 unique measured contracts**, not 26. [Prior inventory](prior-inventory.json). Older status-table proofs are separate evidence and are not silently counted as new runs. The task's prior “3 proved, 2 partial, 1 defect, 12 holds” also overlaps Devil's Alley's one-project proof with its desktop partial. The table below uses mutually exclusive categories: **2 PROVED both, 2 PROVED one, 2 PARTIAL, 13 HELD, 1 historical DEFECT**. It records every identifiable campaign map; no six fictitious rows are added to force the requested total.

| Map | Campaign verdict | Deciding run | Finding / evidence |
| --- | --- | --- | --- |
| The Claim (the-claim) | PROVED one project — desktop control | 4 | [Control](../run-4/the-claim/row-desktop-chrome.json); older both-project status proof is outside this series |
| Baron | HELD — deaths 16/23; boss alive | 1 | [F-PP1-1](../run-1/e1-baron/finding.md) |
| Twin Banks | HELD — deaths 19/18 | 1 | [F-PP1-2](../run-1/e1-twin-banks/finding.md) |
| Pressure Garden | HELD — three-hot-bed objective/survival unproved | 1 | [F-PP1-3](../run-1/e2-pressure-garden/finding.md) |
| Incline | PROVED both projects | 1; regressions through 6 | [Proof](../run-1/e2-incline/proof.md); F-PP1-4 resolved |
| Blackout Ridge | PARTIAL — secure/bank/reload; no stored current | 2 | [F-PP2-1](../run-2/e3-blackout-ridge/finding.md) |
| Canyon Works | DEFECT — historical full-width traversal block | 2 | [F-PP2-2](../run-2/e3-canyon-works/finding.md); separate corrective owner |
| Fairground | HELD — wheel/flock strategy fails | 2 | [F-PP2-3](../run-2/e3-fairground/finding.md) |
| Dust Flats | HELD — haul/boss survival | 3 | [F-PP3-1](../run-3/e4-dust-flats/finding.md) |
| Gusher County | HELD — deliveries work; survival fails | 3 | [F-PP3-2](../run-3/e4-gusher-county/finding.md) |
| Boneyard | HELD — tow route and survival | 3 | [F-PP3-3](../run-3/e4-boneyard/finding.md) |
| Far Side | HELD — orbital movement/build/survival | 4 | [F-PP4-1](../run-4/e8-far-side/finding.md) |
| Low Orbit | HELD — crossing works; survival fails | 4 | [F-PP4-2](../run-4/e8-low-orbit/finding.md) |
| Eclipse | HELD — orbital stop/air and survival | 4 | [F-PP4-3](../run-4/e8-eclipse/finding.md) |
| Dome Basin | HELD — quarry/gates/grounds work; survival fails | 5 | [F-PP5-1](../run-5/e9-dome-basin/finding.md) |
| Seed Run | HELD — caravan arrives; survival fails | 5 | [F-PP5-2](../run-5/e9-seed-run/finding.md) |
| Devil's Alley | PROVED one project — phone; desktop partial | 5 | [F-PP5-3](../run-5/e9-devils-alley/finding.md) |
| Old Canal | HELD — three choices work; deaths 19/18 | 6 | [F-PP6-1](e9-old-canal/finding.md) |
| Last Claim | PROVED both projects — vent/wave 8, bank/Book/reload | 6 | [Full proof](e10-last-claim/proof.md) |
| River | PARTIAL — authored quiet pan/Book; no completed score | 6 | [F-PP6-2](e10-river/finding.md) |

**FOR THE OWNER:** This campaign proves complete native journeys on both screens for Incline and Last Claim, a phone journey for Devil's Alley, and the Claim desktop control. It also demonstrates working choices, deliveries, crossings and escort mechanics on several held maps, and the River's real no-wave pan. Most late-map holds measure the shared driver's survival ceiling, commonly around waves 13–17, and its ground-oriented movement rather than impossible maps; Old Canal's 18/19 and Baron's 23 are higher exceptions. The orbital maps need a driver designed for drift, braking and air. Recommend ending this broad sweep here: improve one ground survival/repair strategy and test it on a held ground map, build a separate orbital driver, then use targeted human playtests to settle the remaining strategy limits. Keep Canyon Works with its corrective owner and resolve River's ending-versus-score acceptance separately. Do not change map balance from these holds alone.
