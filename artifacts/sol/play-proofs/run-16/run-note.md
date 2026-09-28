# Native play proofs — run 16 (sol-play-proofs-holds-2)

2026-09-28. **All five maps HELD. Objective driver gaps cured on the measured paths; survival and mobile-control holds remain. No proven map defect, no F-PPH2 IDs, no production/balance changes.** **READY-FOR-GATES with recorded holds.** Base `a2e0e6f089c3fa90485cf7ee3dd89b7823e64330`; lane `sol/map-art-campaign-2`.

| Map | Desktop | 390 px phone | Verdict |
| --- | --- | --- | --- |
| The Picnic | All three stakes held; deaths 17 default / 18 restore | All three stakes held; deaths 17 / 17 | [HELD — survival](e6-picnic/finding.md) |
| The Showroom | Default captures 6/6, death 5; restore terminal lost | Default captures 6/6, death 13; restore terminal lost | [HELD — survival and terminal instrument](e6-showroom/finding.md) |
| The Dead Band | Refusal latch true; deaths 19 / 17 | Refusal latch true; deaths 12 / 14 | [HELD — survival](e7-dead-band/finding.md) |
| Echo Canyon | One real tape use, one squad/two bodies; deaths 16 / 17 | Initial Tape toggle timeout before Record; reporter ledger shows death 8 | [HELD — desktop survival, phone control](e7-echo-canyon/finding.md) |
| Relay Rush | Deadline 3/3, muted use 1; deaths 16 / 18 | Initial Tape toggle blocked; alive abort wave 2 / 77.6 HP, no tape/sites | [HELD — desktop survival, phone control](e7-relay-rush/finding.md) |

**18 rides**, in requested map order, default desktop then phone, followed by only qualifying restoration rides. Picnic, Showroom and Dead Band get one restore per project; Echo and Relay get desktop only. The two phone Tape objectives were not met and do not qualify for restoration. No third ride, no Half-Life Hollow re-ride. Every ride has zero console/page errors. All 18 native tests fail honestly; the ten ride commands exit 1. None of these five maps proves secure/bank/Book/reload in this run. [Ride ledger](ride-ledger.json), [machine measurements](measurements.json).

## Driver changes and measured limits

1. **Stake hold:** read the authored stake positions and imported system radius, place three low-cost fences, reject displaced stake-target purchases, log first observed stake losses. All measured fences are one unit from their stake centre, under radius three. All three stakes remain held in all four rides; the old wave-2 failure is cured.
2. **Capture:** walk the clear Showroom aisle and confirm exhausted machines outside build mode; use the authored house floor/stair data to leave a dwelling through its doorway. Both defaults capture six. The village circuit now uses village bounds. A phone doorway exit leaves the floor but misses the helper's tight endpoint tolerance. The two restoration rides exposed post-death confirms dismissing the ledger; the final guard stops those confirms. That guard is source/type/build checked, **not re-ridden**, because the allowed rides are exhausted.
3. **Tape Reel:** one helper gathers before recording, records short real movement and a funded build, saves, uses the player UI, observes the county response, and stops replay when appropriate. Dead Band refuses Record, correctly setting the refusal latch with successful uses=0. Echo desktop's saved tapes contain movement and `place_build`; use at wave 2 fields one squad/two bodies at wave 3. Relay desktop builds three authored sites before front three and attempts Replay under the live front, recording one intended muted refusal. No debug action, injected tape, forced click, seed pin, balance edit or simulation mutation.
4. **Phone interaction limit:** Echo's first toggle click used the test's full 840,000 ms timeout, initially intercepted by the canvas and later upgrade/death overlays. It never reached Record. The final helper bounds native clicks to eight 600 ms attempts and handles visible upgrade cards through ordinary pointer input. Relay phone still reproduces canvas interception of the visible button, and stops alive with its failed objective honestly captured. The shared mobile hit-test symptom needs a scoped human-touch/bounds investigation; these two automation failures alone do not establish a map defect or justify editing source here.

**Evidence exceptions:** Showroom's two restore rows and Echo phone have no frozen diagnostic snapshot. Their original row zeros are uninitialized, not terminal counters; the measurement table uses nulls. Echo's reporter snapshot separately shows wave 8 / displayed 04:09 / 0 HP / 50 gold, but no exact diagnostic time or JPEG was recovered. Relay phone has a valid *live failure-time* snapshot, not a game terminal. None of these is presented as a success. Full details and source paths are in the per-map findings.

## Checks and provenance

- [Pre-flight](preflight.md): fresh origin/main matched main, holds-1 landed, no undrained commits or user edits; authorized lane advance; install/build exit 0. Only empty regenerated directories and npm-generated optional-platform metadata were removed/restored.
- [Driver isolation](driver-isolation.json), [checker](verify-isolation.py): stripping only the five-map additions reproduces the base driver **byte for byte**. Existing assertions and every unrelated gameplay path remain unchanged. The late Showroom guard affects Showroom only; the bounded Tape control correction is used by Echo desktop restoration and Relay's rides. New run commands record HEAD and driver hash at launch.
- `npx tsc --noEmit`: **exit 0** after the final driver ([receipt](tsc-final.exit)). `npm run build`: **exit 0** after the final driver ([receipt](build-final.exit), [trimmed log](build-final.log)); existing Vite/chunk/asset-diet warnings remain, full log external.
- `npm run test:task-guards`: lane exit 0 with its explicit linked-worktree skip; actual main-checkout audit **1,448 masters, 0 invisible**, exit 0. [Lane log](task-guards.log), [main log](task-guards-main.log). No task edits.
- First Picnic command failed Node JSON-import collection before any browser ride; fixed and retained in [collection-failure](e6-picnic/collection-failure/command-tail.log). It does not consume a ride and was not a boot retry.
- Protocol: existing progressed-profile seed, real town-to-Book movement and contract card launch, public plain URL with permitted timescale 4, native keyboard/HUD input plus read-only diagnostics. Phone is 390×844 emulation, not a physical touch-device verification.
- Raw logs, full samples, reporter dumps and redundant images stay outside the tree under `~/.goldrush/play-proofs/run-16/`. In-tree images use JPEG quality 80: one final terminal image per available project/map, or the explicitly blocked alive phone image. Earlier terminals were moved outside, not deleted. No five-map success triplet exists to claim.
- Direct image inspection: Picnic desktop loss, Showroom phone loss, Dead Band desktop restore loss, Echo desktop restore loss, Relay phone blocked alive Tape control. These agree with the bounded counters; no art approval inferred.
- Own Vite at `http://127.0.0.1:5303`, PID 10704. Stopped after all browser checks using that exact PID; no other process was stopped. No attended server touched. Task firewall excludes vault writes; this run note is the durable handoff.

## Equivalence, audit and evidence budget

**Equivalence PASS, exit 0:** unchanged Flotilla and Regatta desktop specs both secure at wave 12, bank a new score, return to the Book, and preserve the entire score string byte for byte across plain reload, with zero console/page errors. Their rows match run 12 under the declared protocol. [Comparison](driver-equivalence.json), [command](equivalence-command.json), [direct exit](equivalence-command.exit). `GR_NATIVE_STRATEGY=equivalence` is an output label only; the driver recognizes only hold-ground/restore-ground as strategy switches.

[Evidence audit](verification.json), [checker](verify.py): **PASS** for 18 authorized five-map rides, raw-row/sample preservation, applicable independent counter matches, restoration eligibility, scope firewall and explicit missing-snapshot exceptions. This is an evidence-integrity pass, not a gameplay pass. Two additional equivalence rides pass, giving **20 rides total**. Echo's timed-out phone row bypassed normal afterEach compaction; its exact original was preserved externally after completion before adding metadata/compacting samples. `git diff --check`: PASS.

Added landing evidence: **2691128 bytes** including run-15 table growth; run-16 files alone: **2691038 bytes**. Below the task ceiling of 25,000,000. Measured on the final staged tree and confirmed against HEAD after commit with `node scripts/evidence-budget.mjs a2e0e6f089c3fa90485cf7ee3dd89b7823e64330 HEAD --limit 25000000 --json`. Final receipt: `~/.goldrush/play-proofs/run-16/evidence-budget-final.json`.

## Commits

- `1a60d4962`: test: hold Picnic stakes inside their authored radius
- `5464b5869`: test: route Showroom doorway and confirm exhausted captures
- `4dd626204`: test: exercise native Tape Reel and relay site objectives
- `2791baede`: test: declare Showroom JSON import for native collection
- `93b9aad3e`: test: prove Picnic stake holds and retain survival ceiling
- `0b5711859`: test: keep Showroom circuit on its village ground and retain tape evidence
- `b2319ad5b`: test: stop Showroom confirms at death to preserve the ledger
- `8ca3e120f`: test: retain Showroom six-capture proof and terminal instrument hold
- `068e9d2a1`: test: keep upgrade keys outside the Tape Reel text field
- `3d8ebd713`: test: prove Dead Band refusal and record survival holds
- `cdcaccdec`: test: bound Tape controls and handle intervening upgrade overlays
- `0b1060817`: test: prove Echo mirror on desktop and retain phone control timeout
- `6599bec0a`: test: prove Relay deadline and muted use on desktop; retain phone hold
- Final equivalence/campaign/audit record: containing `test:` commit, exact hash in final response.

## Complete campaign table

All 42 contracts appear once. The five task rows now have deciding run **16**, with the same amendments in run 15's table. Other campaign rows retain prior evidence; equivalence does not expand those maps' historical proof scope. Totals remain **8 PROVED both, 3 PROVED one, 2 PARTIAL, 28 HELD, 1 historical DEFECT corrected**.

Run-17 table amendment (2026-09-28): Mare and Relay desktop objectives now work but survival remains held; Archive remains held on preview placement; Ember is PROVED both. The four amended rows below use deciding run 17. Current totals: **9 PROVED both, 3 PROVED one, 2 PARTIAL, 27 HELD, 1 historical DEFECT corrected**. The run-16 results above remain historical.

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

## REMAINING LIST IN ORDER

1. QA/native mobile controls + HUD maintainer: investigate the visible Tape toggle's canvas interception at 390 px with ordinary touch/hit-target evidence; Echo/Relay phone objectives remain unproved. Any production correction needs its own scoped task.
2. QA/native Showroom: verify the final death guard and doorway endpoint, then a survivable capture/build sequence under a new authorized ride allowance. Restoration terminals here are incomplete evidence, not fresh measurements.
3. Owner/F-PP-CAMPAIGN and QA/native strategy: the measured objective-complete survival ceilings remain on Picnic, Dead Band, Echo desktop and Relay desktop; no balance conclusion follows from these deaths.

**F-PPH2 IDs: none.** No reproducible human map fault was established. All requested ride allowances are exhausted or correctly withheld for unmet objectives; further rides require a new task.
