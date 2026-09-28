# Native play proofs — run 18 (sol-play-proofs-holds-4)

2026-09-28. **READY-FOR-GATES with recorded holds, not all-green gameplay acceptance.** Archive and Deepwater PASS both screens. Phone Tape and Long Road remain instrument holds; Showroom survival is held, and phone dies before its sixth capture. No proven player-facing defect, no F-PPH4 ID, no production/balance change. Base `e24b4d382cf309a3b3ef12daa15330757b8c3318`; lane `sol/map-art-campaign-2`.

| Map | Desktop | 390 px phone | Verdict |
| --- | --- | --- | --- |
| Archive World | 1 light hold, wave 12, 119 HP, bank/Book/reload | 1 light hold, wave 12, 135 HP, bank/Book/reload | [PASS both](e10-archive-world/proof.md) |
| Relay Valley | Not re-ridden; run-17 survival holds retained | Default abort wave 2 / 400 HP; correction abort wave 3 / 363.2 HP; uses 0 | [HELD — instrument hit-testing](e7-relay-valley/finding.md) |
| Long Road | Centreline/waypoint reached; final approach stalls; death wave 3 | Same; death wave 3 | [HELD — final route](e4-long-road/finding.md) |
| Deepwater Claim | Three pads, carried rider, boss/terminal; write then restored wreck | Same; independent write and later-birth receipts | [PASS both](e5-deepwater-claim/proof.md) |
| Showroom | 6/6 captures, death wave 3, 0/0 standing works | 5/6 captures, death wave 4, 0/0 works | [HELD — survival / phone objective incomplete](e6-showroom/finding.md) |

[Exact rows](measurements.json): **10 requested-map rides** in task order, 4 passed and 6 failed honestly. Archive two, phone Tape two, Long Road two, Deepwater two, Showroom two. Desktop then phone where both were requested. Archive passed defaults; Long Road objectives never completed, so no restore-ground ride is eligible. Phone used its single correction allowance; Deepwater and Showroom each used their one ride per project. No third ride or hidden probe. Deepwater's two later-birth observations are the requested persistence check, not extra survival rides. All requested rides and re-entries have zero console/page errors.

## Root causes, adaptations and remaining uncertainty

- **Archive cured:** generic placement accepted a valid ghost outside the light disc. Native steering now requires validity AND distance within the runtime site radius. Both beacons land at (-24,-6), distance 4 from (-28,-6), restore west-stacks-wing through a complete warning/squall, and secure. Full score reloads retain 7,229 bytes.
- **Phone Tape measured, not cured:** [moment JSON](e7-relay-valley/phone-tap-moment.json) and [outlined 390 px JPEG](e7-relay-valley/phone-tap-moment.jpg) show centre and four corners hitting the toggle/child, zero scroll offsets, visible control, no modal. Playwright nevertheless reports canvas interception during click dispatch. Unlike the run-17 interpretation, the first ride's Record and turret placement worked; the failure is reopening Tape to stop recording. The native-tap/rail-wait correction aborts at its hit-test wait before any tap. It was reverted; [exact attempted patch](e7-relay-valley/phone-tap-corrected/driver-change.patch) reconstructs the command's recorded SHA256. **Classification: unresolved instrument/viewport mismatch, no demonstrated player-facing canvas-over-toggle defect, no F-ID.** Event-time pointer and visualViewport geometry are still missing; the post-timeout sample cannot prove a transient cause.
- **Long Road improved route, still held:** reads stopReach=2.5 from the contract's derived mechanics; joins the graded centreline and passes (136,0). Final stalls are desktop (188.167,5.086), phone (188.169,4.933), outside the stop disc. Both Haulers remain idle at (-180,0). The railhead mount near the target suggests a collision/route investigation; bounded walker failure is not proof of human impossibility. Final source review preserves every other motor map's strict `<2` predicate and adds a null/dead read guard; measured Long Road acceptance remains `<=2.5`.
- **Deepwater persistence cured as an evidence gap:** no initial wreck; ceremony writes the render entry at sim 40.933 desktop / 39.467 phone. Payload is (-18,-30) desktop, (0,-22) phone. After wave-12 bank, Book and byte-identical 7,223-byte score reload, a native Book launch reads the same entry with persistentWreck=true and hulkPresent=true. Both deck sequences occupy and move three pads and carry the hero. No game/storage write by the driver.
- **Showroom:** the existing death guard now retains honest death snapshots. Desktop completes six captures, phone five; both die with zero standing works at waves 3/4. Desktop is a survival ceiling; phone has an incomplete objective at death. Run-16's phone six-capture proof remains historical evidence, not this run's result. No balance change or additional ride.

## Method, checks and evidence custody

Campaign progressed-profile fixture; native town walk, Book/card launch; public plain seed; no debug or seed URL; existing timescale 4. Phone is 390×844 Chromium emulation, not a physical touch-only device proof. Native keys/HUD and read-only diagnostics; no forced clicks, direct damage, simulation writes or production edits. [Pre-flight](preflight.md) records clean lane, dependency landing, fresh fetch and install/build. Task firewall excludes vault writes; this is the durable handoff.

- **Equivalence PASS:** 2 passed, exit 0. Flotilla/Regatta desktop match run 12 on wave 12, fresh bank, Book return, byte-identical score reload and zero browser errors. [Protocol/comparison](driver-equivalence.json), [command and final driver hash](equivalence-command.json). The strategy name is only an output label; no strategy flag matches it. No extra browser replay.
- **Type/build PASS:** npx tsc --noEmit and npm run build both exit 0, existing Vite/asset warnings only. [Check receipts](checks.json).
- **Task guards PASS:** lane exit 0 with its explicit linked-worktree skip; actual main-checkout audit 1,453 masters, 0 invisible, exit 0. No task edit. [Main log](task-guards-main.log).
- **Evidence audit PASS:** raw-row preservation, plain URLs, zero browser errors, ride/image limits, restored wrecks, Archive holds, equivalence and identical 42-map tables. [Verification](verification.json). This is evidence integrity, not an all-green gameplay claim. Initial audit invocation preceded checks.json creation; it was rerun after the checks completed, without another browser ride.
- **12 browser rides total:** ten requested-map rides plus two equivalence rides; zero console/page errors in all 12 and the two Deepwater re-entry observations. git diff --check passes; only firewall paths changed.

Raw rows, full logs, Playwright dumps and redundant screenshots live under `~/.goldrush/play-proofs/run-18/`. In-tree JPEGs use q80. Exactly one terminal/Book/bank triplet for each passing project; held maps retain honest loss/live-abort images. Phone has the required outlined moment plus two distinct abort previews. Visual inspection covered Archive desktop secure, Deepwater phone secure, Showroom desktop death and both Tape moments. Compact rows retain all non-sample fields and cite untouched external raw rows.

Evidence budget: **3480604 bytes added**, including **3480590 bytes in run 18**, below 25,000,000; final command `node scripts/evidence-budget.mjs e24b4d382cf309a3b3ef12daa15330757b8c3318 HEAD --limit 25000000 --json`. Final receipt: `~/.goldrush/play-proofs/run-18/evidence-budget-final.json`. This value is verified against committed HEAD before READY.

Own dev server at http://127.0.0.1:5303, PID 73513; stopped after the final browser ride with `kill 73513`. No other process stopped.

## Complete campaign table

Amended by run 18: all 42 contracts appear once; five rows now use deciding run 18. Earlier rows retain their proof qualifications. Totals: **11 PROVED both, 3 PROVED one, 1 PARTIAL, 26 HELD, 1 historical DEFECT corrected**.

| Map | Campaign verdict | Deciding run | Finding / evidence |
| --- | --- | --- | --- |
| The Claim (the-claim) | PROVED one screen — desktop control | 4 | [Control](../run-4/the-claim/row-desktop-chrome.json); older both-project status proof is outside this series |
| Baron | HELD — survival ceiling; deaths 16/23; boss alive | 1 | [F-PP1-1](../run-1/e1-baron/finding.md) |
| Twin Banks | HELD — survival ceiling; latest phone deaths 17/18 | 10 | [Ground strategy finding](../run-10/e1-twin-banks/finding.md) |
| Pressure Garden | HELD — objective never engaged; three-hot-bed objective/survival unproved | 1 | [F-PP1-3](../run-1/e2-pressure-garden/finding.md) |
| Incline | PROVED both screens | 1; regressions through 6 | [Proof](../run-1/e2-incline/proof.md); F-PP1-4 resolved |
| Blackout Ridge | PARTIAL — secure/bank/reload; no stored current | 2 | [F-PP2-1](../run-2/e3-blackout-ridge/finding.md) |
| Canyon Works | DEFECT corrected — historical traversal block; fresh full campaign proof still unproved | 2; status/backlog follow-up | [Historical F-PP2-2](../run-2/e3-canyon-works/finding.md); no re-test in this run |
| Fairground | HELD — objective never engaged; wheel/flock strategy fails | 2 | [F-PP2-3](../run-2/e3-fairground/finding.md) |
| Dust Flats | HELD — objective never engaged; haul/boss survival | 3 | [F-PP3-1](../run-3/e4-dust-flats/finding.md) |
| Gusher County | HELD — survival ceiling; deliveries work; survival fails | 3 | [F-PP3-2](../run-3/e4-gusher-county/finding.md) |
| Boneyard | HELD — objective never engaged; tow route and survival | 3 | [F-PP3-3](../run-3/e4-boneyard/finding.md) |
| Far Side | HELD — orbital movement; orbital movement/build/survival | 4 | [F-PP4-1](../run-4/e8-far-side/finding.md) |
| Low Orbit | HELD — orbital movement; crossing works; survival fails | 4 | [F-PP4-2](../run-4/e8-low-orbit/finding.md) |
| Eclipse | HELD — orbital movement; orbital stop/air and survival | 4 | [F-PP4-3](../run-4/e8-eclipse/finding.md) |
| Dome Basin | HELD — survival ceiling; quarry/gates/grounds work; survival fails | 5 | [F-PP5-1](../run-5/e9-dome-basin/finding.md) |
| Seed Run | HELD — survival ceiling; caravan arrives; survival fails | 5 | [F-PP5-2](../run-5/e9-seed-run/finding.md) |
| Devil's Alley | PROVED one screen — phone; desktop partial | 5 | [F-PP5-3](../run-5/e9-devils-alley/finding.md) |
| Old Canal | PROVED one screen — phone on final driver; desktop HELD wave 18 | 9–10 | [Phone proof](../run-9/e9-old-canal/finding.md); [final desktop hold](../run-10/e9-old-canal/finding.md) |
| Last Claim | PROVED both screens — vent/wave 8, bank/Book/reload | 6 | [Full proof](../run-6/e10-last-claim/proof.md) |
| River | PROVED both screens; county post held separately | 7 | [Ending proof](../run-7/e10-river/finding.md) |
| The Drill Yard (e1-drill-yard) | PROVED both screens — practice terminal, no bank by design | 11 | [Evidence](../run-11/run-note.md) |
| The Dry Gulch (e1-dry-gulch) | HELD — survival ceiling; all deaths wave 16 | 11 | [Evidence](../run-11/run-note.md) |
| Night Shift (e1-night-shift) | HELD — survival ceiling; desktop 17/16, phone 15/16 | 11 | [Evidence](../run-11/run-note.md) |
| The Hill Mine (e2-hill-mine) | HELD — survival ceiling; escort works; deaths 1/1 and 2/2 | 11 | [Evidence](../run-11/run-note.md) |
| The Trestle (e2-trestle) | HELD — survival ceiling; escort works; deaths 13/13 and 13/11 | 11 | [Evidence](../run-11/run-note.md) |
| Moth Season (e3-moth-season) | HELD — objective never engaged; CONNECT 0/1; deaths 12/13 | 11 | [Evidence](../run-11/run-note.md) |
| The Long Road (e4-long-road) | HELD — graded route and radius read work; final railhead approach still stalls; deaths 3/3 | 18 | [Finding](../run-18/e4-long-road/finding.md) |
| Deepwater Claim (e5-deepwater-claim) | PROVED both — three deck pads/carried rider, boss, bank/Book/reload, ceremony write and restored wreck at later birth | 18 | [Proof](../run-18/e5-deepwater-claim/proof.md) |
| Flotilla (e5-flotilla) | PROVED both screens — terminal journey; construction/reshape not proved | 12 | [Proof](../run-12/e5-flotilla/proof.md) |
| Regatta (e5-regatta) | PROVED both screens — six-gate boat race/full journey | 12 | [Proof](../run-12/e5-regatta/proof.md) |
| Stillwater (e5-stillwater) | PROVED both screens — terminal journey; five-ground work not proved | 12 | [Proof](../run-12/e5-stillwater/proof.md) |
| Glow Mesa (e6-glow-mesa) | PROVED both screens — authored wave-8 ending, bank/Book/reload | 15 | [Proof](../run-15/e6-glow-mesa/proof.md) |
| Half-Life Hollow (e6-half-life-hollow) | HELD — survival ceiling; crossing complete; all four deaths wave 4 | 13 | [Finding](../run-13/e6-half-life-hollow/finding.md) |
| The Picnic (e6-picnic) | HELD — three stakes held all rides; survival deaths 17/17 default, 18/17 restore | 16 | [Finding](../run-16/e6-picnic/finding.md) |
| The Showroom (e6-showroom) | HELD — captures 6/6 desktop, 5/6 phone; deaths 3/4; death guard preserves terminal | 18 | [Finding](../run-18/e6-showroom/finding.md) |
| The Dead Band (e7-dead-band) | HELD — refusal latch met all rides; survival deaths 19/12 default, 17/14 restore | 16 | [Finding](../run-16/e7-dead-band/finding.md) |
| Echo Canyon (e7-echo-canyon) | HELD — desktop mirror 1 squad/2 bodies, deaths 16/17; phone Tape toggle timeout before Record | 16 | [Finding](../run-16/e7-echo-canyon/finding.md) |
| Relay Rush (e7-relay-rush) | HELD — desktop deadline 3/3 and muted use 1, deaths 16/18; phone Tape toggle blocked | 16 | [Finding](../run-16/e7-relay-rush/finding.md) |
| Relay Valley (e7-relay-valley) | HELD — desktop survival retained from 17; phone hit-test mismatch, attempted correction failed; uses 0 | 18 | [Finding](../run-18/e7-relay-valley/finding.md) |
| The Mare Claim (e8-mare-claim) | HELD — 4/4 mining and no air damage all rides; survival deaths 13/15 default, 14/15 restore | 17 | [Finding](../run-17/e8-mare-claim/finding.md) |
| The Archive World (e10-archive-world) | PROVED both — valid beacon inside disc, completed light hold, wave-12 bank/Book/reload | 18 | [Proof](../run-18/e10-archive-world/proof.md) |
| The Ember Shore (e10-ember-shore) | PROVED both screens — seven Stokes, three squalls, wave-12 bank/Book/reload | 17 | [Proof](../run-17/e10-ember-shore/proof.md) |


## Owner handoff and REMAINING LIST IN ORDER

1. **QA/native phone controls:** resolve the Tape click-versus-hit-test discrepancy with event-time pointer and visualViewport telemetry. The one correction failed and was reverted; the two-ride allowance is exhausted. No player-facing F-ID is justified by the measured centre hits.
2. **QA/native route driver:** find a reachable final approach inside Long Road's railhead disc under a new ride allowance. Centreline routing alone still stalls; objective remains unproved. Escalate to map ownership only with human-facing obstruction evidence.
3. **Owner F-PP-CAMPAIGN / survival strategy:** Showroom desktop needs survival after six captures; phone needs its sixth capture and terminal survival. Keep the earlier campaign survival, escort and orbital holds with their deciding runs.

The campaign now has 26 HELD maps. Archive's instrument placement gap and Deepwater's write/read observation gap are closed. **Instrument work is not complete: phone Tape hit-testing and Long Road's final approach remain explicitly named holds.** Showroom's measured limit remains with the owner, with no balance recommendation inferred. All authorized rides are spent or correctly withheld; follow-up work needs a new ride allowance.

## Commits

- `174c2643e`: Archive placement and both-screen proof.
- `a76600897`: phone refusal geometry and failed-correction finding.
- `418a4d5c1`: Long Road graded approach and measured hold.
- `86cebe3cb`: Deepwater ceremony-write/later-birth proof.
- `6a79ba0d6`: Showroom capture and survival evidence (exact final phone counters in this run note/finding).
- Final `test:` commit: equivalence, report/table, evidence audit, and preservation of other motor maps' strict arrival predicate; hash in final response.
