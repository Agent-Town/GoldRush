# Native play proofs — run 15 (sol-play-proofs-holds-1)

2026-09-28. **Long Road HELD; Deepwater Claim PARTIAL; Glow Mesa PASS. No proven map defect, no F-PPH1 IDs, no production or balance change.** Base `cabbffa32f64fcbcbca4d5233952a7a04d92cc3b`; lane `sol/map-art-campaign-2`. **READY-FOR-GATES with recorded holds.**

| Map / default | Desktop | 390 px phone | Verdict |
| --- | --- | --- | --- |
| Long Road | death 3 / 103.333 s; 0 HP, 0 gold, 0 repairs, 0/0 standing | death 3 / 118.800 s; same HP/gold/repairs/pieces | [HELD](e4-long-road/finding.md): far-stop approach stalls before Hauler dispatch |
| Deepwater Claim | secure 12 / 272.133 s; 100 HP, 40 gold, 0 repairs, 0/0 ground and 0/3 deck occupied | same terminal/time/HP/gold/repairs/pieces | [PARTIAL](e5-deepwater-claim/finding.md): boss/full terminal journey proved; deck and wreck restoration unproved |
| Glow Mesa | secure 8 / 254.800 s; 64.6 HP, 31 gold, 0 repairs, 0/0 standing | secure 8 / 260.667 s; 69.4 HP, 20 gold, 0 repairs, 3/4 standing | [PASS](e6-glow-mesa/proof.md): authored ending banks and survives plain reload |

Six re-rides completed, desktop then phone per map, one worker. Four native tests pass (Deepwater and Glow Mesa); Long Road's two tests honestly fail their secure assertion. Every ride has zero console/page errors. Exactly one default ride per project/map; no restore-ground retry. Long Road's objective did not complete, and the other maps survived, so none qualified for that retry. No extra diagnostic ride, quota refusal, disconnect or boot retry.

## Driver changes and what the evidence establishes

**Long Road:** `motorOpening` resolves the convoy corridor from `twist.motorFrontier`, grades its start with Confirm, gathers all three tar nodes, and calls the existing `motorStop` at its authored end. Stored fuel reaches 24 with 3 tar held. The native approach to `(190,0)` stalls at desktop `(187.774,5.199)` and phone `(185.281,3.600)` before destination Confirm. Hauler distance remains 0; no arrival is claimed. This is a narrower route-driver hold than run 12's missing invocation. Owner: QA/native motor driver; inspect the railhead approach and supply an obstacle-aware native route under a new ride allowance. No inference that the human route is impossible.

**Deepwater:** the driver targets the authored pad IDs and uses the deck context, then pursues the live boss anchor/components using native movement and rig auto-fire. Both rides unlock act 2, destroy the hold and reach act 3 with `hulkPresent=true`. Desktop/mobile act-2 observations are 78.533/68.933 s; act 3 is 84.133/76.000 s. Both secure wave 12, bank, return to the Book and retain the score byte for byte across reload (7,223 bytes). But all pad clicks time out behind a collapsed `<details>`, so every pad placement is null and reanchoring never moves the hull. The final follow-up opens the native summary before its button and records refusals. That final change is type/build/source checked, **not re-ridden**: successful survival is ineligible for a restore-ground retry. The live hulk is observed; stored wreck/re-entry persistence is not. `persistentWreck` is a loaded-at-birth flag and remains false in the winning birth, so its value alone is not a failed write. Owner: QA/native deck driver, final pad/rider-carry proof and direct wreck persistence capture. No map fault is inferred.

**Glow Mesa:** the bank predicate requires a fresh secured score after the observed Claim Secured terminal, without a wave floor. Both default rides reach DONE/act 3/poweredDown/chairPlaced/kept at wave 8, bank, return to the Book and retain all score bytes (7,225) across plain reload. `finally` only fills a missing terminal snapshot; it cannot replace pre-bank values after a failed bank. Independent pre-bank objective captures agree with the retained wave/time/HP/purse/repairs/defenses. Desktop's empty defenses are real boss unbuilds, not scene-reset counters. No strategy or balance change was needed; these measured default wins do not retroactively alter run 12's losses.

[Driver isolation](driver-isolation.json) / [checker](verify-driver.py): stripping only these three authorized correctives reproduces the entire base driver byte for byte. Other map-specific routes, Regatta, kits, funding, repair strategies and existing assertions remain unchanged. Long Road and Deepwater measured driver SHA256 `ca1aa64184acc403823b075552f9f3910509d28ad63db18c0d3399b16a9f0c36`; Glow Mesa and equivalence use final SHA256 `23a4975b439ba7fd7738968801477f59fb538d6c74fd85976ecc65a03f912aa4`. The difference is the Deepwater-only panel expansion/refusal logging.

## Equivalence, checks and evidence

**Equivalence PASS, direct exit 0:** Flotilla and Regatta both retain terminal wave 12 and successful secure/bank/Book/reload, matching run 12; both have zero browser errors. [Comparison receipt](driver-equivalence.json), [command](equivalence-command.json), [exit](equivalence-command.exit). The unchanged `e5-flotilla.spec.ts` and `e5-regatta.spec.ts` run on desktop with the final driver; comparison to run 12 requires the same terminal wave and the same successful bank/Book/byte-identical reload, plus zero browser errors. `GR_NATIVE_STRATEGY=equivalence` is a raw-output label only: neither of the two strategy switches matches, so gameplay remains default. It prevents run-12's unchanged hook from overwriting its historical raw rows. [Runner](equivalence.py).

- [Pre-flight](preflight.md): clean lane, no undrained work, fresh main verified; authorized advance and install/build green. Only empty regenerated run-14 directory and npm's generated optional-platform lock metadata discarded/restored.
- `npx tsc --noEmit`: exit 0 after final code ([receipt](tsc-final.exit)).
- `npm run build`: exit 0 after final code ([receipt](build-final.exit), [trimmed log](build-final.log)). Existing Vite/native-config, chunk size and asset-diet warnings remain; full log outside tree.
- `npm run test:task-guards`: exit 0, explicitly SKIPPED by the linked-worktree guard ([log](task-guards.log)). The same guard run from the main checkout actually passes: **1,447 masters, 0 invisible**, exit 0 ([log](task-guards-main.log), [receipt](task-guards-main.exit)). No task edits.
- [Final scope/ride/counter/evidence audit](verification.json): PASS ([checker](verify.py), [machine measurements](measurements.json)). Eight rides total, six successful terminal tests and two honest Long Road failures. `git diff --check`: PASS. Every retained terminal counter agrees with its frozen snapshot; independent objective captures agree where the prior unchanged hook exposes those fields.
- Added landing evidence: **2834992 bytes**, including the run-14 table growth; run-15 files alone: **2834659 bytes**. Both are below 25,000,000. Measured on the final staged tree, then confirmed against HEAD after commit; receipt outside tree at `~/.goldrush/play-proofs/run-15/evidence-budget-final.json`. Required command is `node scripts/evidence-budget.mjs cabbffa32f64fcbcbca4d5233952a7a04d92cc3b HEAD --limit 25000000 --json`.
- Direct image inspection: Long Road phone loss (wave 3), Deepwater desktop secure (wave 12 / 100 HP / 40 gold / zero buildings), Glow Mesa phone secure (wave 8 / Homemaker defeated), Glow Mesa desktop bank cell (Secured wave 8, 31 gold). Images agree with the measured bounded claims; no art acceptance is implied.

[Re-ride runner](run-map.py) records exact argv, controlled environment, full external log and direct exit; each map links its receipts. Existing progressed profile, human-shaped town walk/Book launch, public plain seed, no debug/seed URL, permitted timescale 4, ordinary keys/HUD and read-only diagnostics. Phone is 390×844 browser emulation, not physical touch-only validation. One JPEG-quality-80 terminal/Book/bank triplet per successful project/map; Long Road has only honest loss terminals. Raw rows, logs, Playwright dumps and redundant last images are outside the tree under `~/.goldrush/play-proofs/run-15/`; compact rows cite their raw paths. No post-bank snapshot is presented as a terminal.

Own Vite at `http://127.0.0.1:5303`, PID 93776; stopped after equivalence using its exact PID. No attended server touched. Vault writes excluded by the task firewall; this run note is the durable handoff.

## Commits

- `f741dd675`: Long Road errand and evidence adapter.
- `61e24cbad`, `4840c818b`: native deck/boss path and optional diagnostic guard.
- `1b99e911b`: authored early bank and frozen terminal fallback.
- `601e8aa00`: Long Road observed approach holds.
- `5f74a1483`: expand collapsed deck controls; verification qualification above.
- `33e4dadf9`: Deepwater boss/terminal evidence and remaining deck hold.
- `3176bd28c`: Glow Mesa early-ending proof.
- Final equivalence/campaign/gate/evidence record: containing `test:` commit, exact hash in final response.

## Complete campaign table

All 42 contracts appear once. Only Long Road, Deepwater and Glow Mesa rows move to deciding run 15. The remaining rows carry run 14's evidence without re-testing or upgrading their claims; Flotilla/Regatta equivalence does not expand their historical proof scope. Current mutually exclusive totals: **8 PROVED both, 3 PROVED one, 2 PARTIAL, 28 HELD, 1 historical DEFECT corrected**. Run 14's table receives the same three amendments while its original run measurements remain historical.

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
| Relay Valley (e7-relay-valley) | HELD — objective never engaged; playbook uses 0, deaths 17/17 | 14 | [Finding](../run-14/e7-relay-valley/finding.md) |
| The Mare Claim (e8-mare-claim) | HELD — orbital movement / driver instrumentation; wrong air read, 1/4 mining, deaths 2/2 | 14 | [Finding](../run-14/e8-mare-claim/finding.md) |
| The Archive World (e10-archive-world) | HELD — objective never engaged; 0 light holds, deaths 20/20 | 14 | [Finding](../run-14/e10-archive-world/finding.md) |
| The Ember Shore (e10-ember-shore) | HELD — objective never engaged; 0 stokes, vent lost 3/3 | 14 | [Finding](../run-14/e10-ember-shore/finding.md) |

## REMAINING LIST IN ORDER

All authorized rides and checks in this run are complete; the following holds require follow-up authorization and are not hidden passes.

1. QA/native motor driver: inspect and route the Long Road far-stop approach before any new authorized ride; convoy arrival remains unproved.
2. QA/native deck driver: prove the final expanded-panel pad actions and rider carry, then capture direct wreck persistence/re-entry. This run's successful survival does not authorize an extra retry.
3. The separate holds-2 task owns Picnic, Showroom, Dead Band, Echo Canyon and Relay Rush. Survival-ceiling questions remain with the owner under F-PP-CAMPAIGN; no balance change from these holds.

**F-PPH1 IDs: none.** No reproducible plain-boot map defect was established. The two named owners above own instrument/route follow-ups, not map-balance changes.
