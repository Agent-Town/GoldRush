# Native play proofs — run 16 (sol-play-proofs-holds-2)

2026-09-28. Work in progress. Base `a2e0e6f089c3fa90485cf7ee3dd89b7823e64330`; lane `sol/map-art-campaign-2`.

Three driver correctives committed: stake-radius opening, Showroom doorway/capture route, and shared native Tape Reel with relay service. No production/balance changes. Plain Book launch, no debug/seed, desktop then 390×844 phone, one worker. First Picnic command failed collection on Node's JSON import attribute; corrected before any browser ride. Collection failure retained separately and does not count as a ride.

[Pre-flight](preflight.md). [Driver isolation](driver-isolation.json): stripping five-map additions reproduces the base byte for byte. Full logs and dumps external under `~/.goldrush/play-proofs/run-16/`. Task firewall excludes vault writes; this file is the durable handoff.

## Complete campaign table

Carried from run 15; only rows with new completed measurements will move to deciding run 16.

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
| The Dead Band (e7-dead-band) | HELD — objective never engaged; deaths 18/18; refusal unexercised | 13 | [Finding](../run-13/e7-dead-band/finding.md) |
| Echo Canyon (e7-echo-canyon) | HELD — objective never engaged; deaths 16/19; no playbook/mirror | 13 | [Finding](../run-13/e7-echo-canyon/finding.md) |
| Relay Rush (e7-relay-rush) | HELD — objective never engaged; deaths 18/19; deadline 1/3, no muted use | 13 | [Finding](../run-13/e7-relay-rush/finding.md) |
| Relay Valley (e7-relay-valley) | HELD — objective never engaged; playbook uses 0, deaths 17/17 | 14 | [Finding](../run-14/e7-relay-valley/finding.md) |
| The Mare Claim (e8-mare-claim) | HELD — orbital movement / driver instrumentation; wrong air read, 1/4 mining, deaths 2/2 | 14 | [Finding](../run-14/e8-mare-claim/finding.md) |
| The Archive World (e10-archive-world) | HELD — objective never engaged; 0 light holds, deaths 20/20 | 14 | [Finding](../run-14/e10-archive-world/finding.md) |
| The Ember Shore (e10-ember-shore) | HELD — objective never engaged; 0 stokes, vent lost 3/3 | 14 | [Finding](../run-14/e10-ember-shore/finding.md) |

## REMAINING LIST IN ORDER

1. Complete Picnic desktop/phone and qualifying restore-ground rides.
2. Showroom desktop/phone.
3. Dead Band desktop/phone and qualifying restore-ground rides.
4. Echo Canyon desktop/phone and qualifying restore-ground rides.
5. Relay Rush desktop/phone and qualifying restore-ground rides.
6. Flotilla/Regatta equivalence, final type/build/task guards, findings, campaign amendments and evidence budget.
