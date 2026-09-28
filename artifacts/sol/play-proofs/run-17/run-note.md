# Native play proofs — run 17 (sol-play-proofs-holds-3)

2026-09-28. **Ember PASS both screens; Mare, Relay Valley and Archive HELD.** No proven map defect, no F-PPH3 IDs and no production/balance changes. **READY-FOR-GATES with the recorded holds.** Base `3bac7b9e44f1f8e24065451a58b87e0e29d4657d`; lane `sol/map-art-campaign-2`.

| Map | Desktop | 390 px phone | Verdict |
| --- | --- | --- | --- |
| Mare Claim | 4/4 mining, zero air harm; deaths 13 default / 14 restore | 4/4 mining, zero air harm; deaths 15 / 15 | [HELD — survival](e8-mare-claim/finding.md) |
| Relay Valley | One native program lights r1; deaths 18 / 19 | Tape toggle blocked before Record; alive abort wave 2, 400 HP | [HELD — desktop survival / phone control](e7-relay-valley/finding.md) |
| Archive World | West preview outside radius 4; zero holds; death 17 | Same initial miss; zero holds; death 20 | [HELD — placement driver](e10-archive-world/finding.md) |
| Ember Shore | Seven Stokes, three squalls, wave 12, bank/Book/reload | Same; exact reload persistence | [PASS both](e10-ember-shore/proof.md) |

**11 requested-map rides** in map order: Mare four, Relay three, Archive two, Ember two. Default desktop then phone; restore-ground only after an objective-complete survival loss, one per eligible project. No third ride. Relay phone and both Archive projects do not qualify. Optional E8 siblings were not re-ridden: Far Side/Low Orbit need distinct vacuum crossings and probe/deck work; Eclipse needs the post-shadow reserve and rim work. Their existing consumer read was already correct; the Mare-specific correction does not establish those routes.

[Measurements](measurements.json) and per-map findings preserve exact counters, coordinates and command exits. Nine requested-map tests fail honestly (including Relay phone's live control abort); Ember's two pass. All 11 have zero console/page errors. Only Ember proves a new secured bank, Book return and byte-identical score persistence in this run. Its score string is 7,229 bytes on both screens.

## Changes and measured limits

- **Mare:** read `e8SuitAir ?? e8Atmosphere`, choose a breathing dome from the declared IDs and contract bounds, brake into it, verify refill, and seek distinct mining grounds in each window. All four rides complete 4/4 with no empty-suit harm. The defaults exposed stale rim clamps after moving home; `35e7092f4` fixes those before restoration. Defaults and retries retain their exact driver hashes; defaults are not claimed as final-source replays.
- **Relay:** reuse the native Tape helper against contract relay-site rectangles. Desktop records, saves and uses the tape; `relaysLitByProgram=['relay-site-r1']`, `objectiveMet=true` in both rides. Phone's visible, enabled toggle is intercepted by the canvas on eight bounded attempts, so Record never happens. No forced click or source workaround.
- **Archive:** read the first ordered wing and site radius using the existing contract consumer, fund the beacon first, route and defend around that wing, reject out-of-disc placement. Both wave-1 previews snap to (-24,-5), distance √17 from (-28,-6), beyond radius 4. The generic valid-preview search does not steer inward to satisfy the second predicate. **Successful placement/light hold remains incomplete**, with zero holds after five/six completed squalls. The exact-wing/wave finding fallback applies; no survival-only retry is justified.
- **Ember:** preserve the runtime Stoke cost during funding, return inside the vent disc before cold, and press native Enter. Both rides record seven Stokes, zero refusals, three survived squalls and no guttering. Terminal warmth is 74.933 desktop / 78.133 phone. The wave-3 loss is cured and the full wave-12 journey passes.

All gameplay additions are scoped to the four named maps; the air fallback changes only the map whose other consumer is null. Existing assertions and other specs are unchanged. The final equivalence result below is the behavioral control; no unperformed byte-isolation test is claimed.

## Method and evidence custody

Existing campaign progressed-profile seed, a real walk from town to the Book and contract-card launch, no `?debug` or `?seed`, public seed, permitted timescale 4, native keyboard/HUD actions and read-only diagnostics. Phone is 390×844 browser emulation, not a physical touch-only device proof or fresh-profile progression test.

[Pre-flight](preflight.md): fresh main matched origin/main, Holds-2 landed, no undrained commits/user edits, install/build exit 0, clean status before changes. Only regenerated run-16 directories and npm-generated optional-platform lock metadata were discarded/restored. The task's missing Atmosphere filename was resolved to its actual class in `E8PhysicsSystem.ts`.

Raw rows, full logs, Playwright dumps and redundant/earlier screenshots live outside the tree under `~/.goldrush/play-proofs/run-17/`. JPEGs use quality 80. One final terminal per held project is retained; Relay phone instead has a clearly named live `blocked` image. Ember has exactly one terminal/Book/bank-cell triplet per project. Earlier Mare and Relay desktop terminals were moved outside, never deleted. Each compact row cites its untouched full raw row; only samples are compacted. Direct image inspection covered Mare's air-filled loss, Relay's live phone block, Archive's phone loss and Ember's secure terminal. No art acceptance is inferred.

Own Vite: `http://127.0.0.1:5303`, PID 34598. Stopped after the last browser ride with `kill 34598`; no other process was stopped. Task firewall excludes vault writes; this run note is the durable handoff.

## Equivalence and checks

- **Equivalence PASS (2 passed, exit 0):** unchanged Flotilla/Regatta desktop specs match run 12 on terminal wave 12, fresh bank, Book return, byte-identical score reload and zero console/page errors. [Comparison](driver-equivalence.json), [command](equivalence-command.json), [exit](equivalence-command.exit). `GR_NATIVE_STRATEGY=equivalence-run17` is an output label only; neither driver strategy flag matches it. The first post-run comparison lookup omitted run-12's `default/` directory; it was corrected and comparison-only rerun against the same completed rides. No additional browser ride.
- `npx tsc --noEmit`: **exit 0**. `npm run build`: **exit 0**, existing Vite/asset warnings only. [Check receipts](checks.json); full logs external and trimmed logs in-tree.
- `npm run test:task-guards`: lane **exit 0 with its explicit linked-worktree skip**; actual main-checkout audit **1,450 masters, 0 invisible, exit 0** ([main log](task-guards-main.log)). No tasks were edited.
- [Evidence audit](verification.json): **PASS** for raw-field/sample preservation, zero browser errors, plain URLs, restoration eligibility, per-project ride/image limits, scope, equivalence and all 42 campaign rows. This is evidence integrity, not a claim that held maps pass. `git diff --check`: **PASS**.
- **13 total browser rides:** 11 requested-map rides plus 2 desktop equivalence rides. All 13 have zero console/page errors. No new source after the tested final driver.
- Added landing evidence: **2851323 bytes**, of which **2850894 bytes** are run 17, below 25,000,000. Measured with `node scripts/evidence-budget.mjs 3bac7b9e44f1f8e24065451a58b87e0e29d4657d HEAD --limit 25000000 --json`. Final receipt external at `~/.goldrush/play-proofs/run-17/evidence-budget-final.json`.

Reproduction commands and direct subprocess exits are in [checks.py](checks.py), [equivalence.py](equivalence.py), [run-map.py](run-map.py) and [verify.py](verify.py). Ride allowances are complete; running them again is follow-up work.

## Complete campaign table

All 42 contracts appear once. The four changed rows use deciding run **17**, identically amended in run 16. Other rows retain their prior evidence and bounded proof qualifications. Totals: **9 PROVED both, 3 PROVED one, 2 PARTIAL, 27 HELD, 1 historical DEFECT corrected**.

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
| The Long Road (e4-long-road) | HELD — tar/grade work; far-stop approach stalls, deaths 3/3 | 15 | [Finding](../run-15/e4-long-road/finding.md) |
| Deepwater Claim (e5-deepwater-claim) | PARTIAL both — boss and full terminal journey proved; deck and wreck restoration unproved | 15 | [Finding](../run-15/e5-deepwater-claim/finding.md) |
| Flotilla (e5-flotilla) | PROVED both screens — terminal journey; construction/reshape not proved | 12 | [Proof](../run-12/e5-flotilla/proof.md) |
| Regatta (e5-regatta) | PROVED both screens — six-gate boat race/full journey | 12 | [Proof](../run-12/e5-regatta/proof.md) |
| Stillwater (e5-stillwater) | PROVED both screens — terminal journey; five-ground work not proved | 12 | [Proof](../run-12/e5-stillwater/proof.md) |
| Glow Mesa (e6-glow-mesa) | PROVED both screens — authored wave-8 ending, bank/Book/reload | 15 | [Proof](../run-15/e6-glow-mesa/proof.md) |
| Half-Life Hollow (e6-half-life-hollow) | HELD — survival ceiling; crossing complete; all four deaths wave 4 | 13 | [Finding](../run-13/e6-half-life-hollow/finding.md) |
| The Picnic (e6-picnic) | HELD — three stakes held all rides; survival deaths 17/17 default, 18/17 restore | 16 | [Finding](../run-16/e6-picnic/finding.md) |
| The Showroom (e6-showroom) | HELD — default captures 6/6 both; deaths 5/13; restore terminal capture lost to driver confirms | 16 | [Finding](../run-16/e6-showroom/finding.md) |
| The Dead Band (e7-dead-band) | HELD — refusal latch met all rides; survival deaths 19/12 default, 17/14 restore | 16 | [Finding](../run-16/e7-dead-band/finding.md) |
| Echo Canyon (e7-echo-canyon) | HELD — desktop mirror 1 squad/2 bodies, deaths 16/17; phone Tape toggle timeout before Record | 16 | [Finding](../run-16/e7-echo-canyon/finding.md) |
| Relay Rush (e7-relay-rush) | HELD — desktop deadline 3/3 and muted use 1, deaths 16/18; phone Tape toggle blocked | 16 | [Finding](../run-16/e7-relay-rush/finding.md) |
| Relay Valley (e7-relay-valley) | HELD — desktop program lights r1, survival deaths 18/19; phone Tape toggle blocked before Record | 17 | [Finding](../run-17/e7-relay-valley/finding.md) |
| The Mare Claim (e8-mare-claim) | HELD — 4/4 mining and no air damage all rides; survival deaths 13/15 default, 14/15 restore | 17 | [Finding](../run-17/e8-mare-claim/finding.md) |
| The Archive World (e10-archive-world) | HELD — west-light preview outside radius 4; zero holds, deaths 17/20 | 17 | [Finding](../run-17/e10-archive-world/finding.md) |
| The Ember Shore (e10-ember-shore) | PROVED both screens — seven Stokes, three squalls, wave-12 bank/Book/reload | 17 | [Proof](../run-17/e10-ember-shore/proof.md) |


## Owner handoff and REMAINING LIST IN ORDER

The campaign still has 27 HELD maps. This run moves Mare's air/mining and Relay desktop's program from missing objective actions to measured survival holds; Ember becomes fully proved on both screens. Archive remains a placement-driver hold and Relay phone a native-control hold. Earlier survival, escort, crossing and objective-routing holds retain their deciding runs; they are not silently cured by this driver work. No balance change follows from any held ride.

1. **QA/native placement:** align Archive's valid preview inside the runtime west-light disc, then seek a newly authorized ride. Current source refuses the misplaced ghost but does not complete the hold.
2. **QA/native mobile controls + HUD maintainer:** investigate Tape toggle canvas interception at 390 px with ordinary human-touch/bounds evidence; Relay Valley phone joins the run-16 Echo/Relay Rush hold class.
3. **Owner F-PP-CAMPAIGN / native survival strategy:** Mare all screens and Relay desktop remain objective-complete survival holds after the allowed restoration attempts. Carry forward the earlier campaign survival/escort/crossing holds.
4. **QA/orbital routing:** retain Far Side, Low Orbit and Eclipse for a later task addressing their own crossing/transfer objectives. No re-proof claimed here.

**F-PPH3 IDs: none.** A proven human map defect is required; these measured holds do not establish one.

## Commits

- `c763d8084`: Mare consumer, dome refill and braking; run-17 harness.
- `991db30f4`: Relay Valley native program/site corrective.
- `91c7f3dcf`: Archive wing routing and light-radius guard.
- `f57e97325`: Ember gold reserve and native Stoke.
- `35e7092f4`: Mare circuit bounds corrected before restoration.
- `cdf1d514c`: Mare four-ride finding and verification helpers.
- `7886475ed`: Relay latch, survival and phone-control evidence.
- `c0f6175f1`: Archive exact placement/wing/wave hold.
- `f1ede7f29`: Ember both-screen terminal/persistence proof.
- Final equivalence, campaign and gate receipts: containing `test:` commit; exact hash in final response.
