# Native play proofs — run 14 (sol-play-proofs-10)

2026-09-28. **READY-FOR-GATES with recorded holds. All four maps HELD on desktop and 390×844 phone. No proven map defect and no F-PP10 IDs.** Base `59733b98d6d98e6bfc8713240c470e2e12e11ce8`; lane `sol/map-art-campaign-2`.

**Run 14 closes the map list: 42/42 measured; 7 PROVED both screens, 3 PROVED one screen, 2 PARTIAL, 29 HELD, 1 historical DEFECT corrected (full campaign re-proof still unproved).** Practice-terminal and other bounded proof qualifications remain explicit in the table. This is an evidence inventory, not a claim that all maps are won or launch-ready.

| Map | Desktop | Phone | Verdict |
| --- | --- | --- | --- |
| Relay Valley | death 17 / 516.800 s; 0 gold; 0 repairs; 8/8 standing | death 17 / 515.200 s; same gold/repairs/works | HELD — no playbook use or program-lit site |
| Mare Claim | death 2 / 80.133 s; 0 gold; 0 repairs; 2/2 standing | same | HELD — suit exhausted; wrong diagnostic read; 1/4 mining credit |
| Archive World | death 20 / 606.933 s; 0 gold; 0 repairs; 8/8 standing | death 20 / 611.067 s; same gold/repairs/works | HELD — no restored wing or completed light hold |
| Ember Shore | objective loss 3 / 92.933 s; 92 HP; 15 gold; 0 repairs; 2/2 standing | same | HELD — 0 stokes, vent cold, hero alive |

[Machine measurements](measurements.json) and each linked finding preserve the numbers and root-cause evidence. **All eight rides have zero console/page errors. All eight native tests honestly fail their unchanged secure assertion; all four paired commands exit 1.** No successful secure/bank/Book/reload or screenshot triplet is claimed. Each project/map has its observed terminal JPEG; lost runs cannot supply honest bank/Book images.

## Method, adaptations and owners

Exactly one default ride per project per map, desktop then phone, one worker, trace off. No extra ride, quota refusal, disconnect or boot retry. Existing progressed-profile seed, public plain seed (no `?seed` or `?debug`), permitted timescale 4, real town walk/Book launch, native keyboard/HUD actions and read-only diagnostics. Phone is 390×844 browser emulation, not a physical touch-only device test. Seeding unlocks is the established campaign method; it does not prove a fresh-profile progression journey.

No map qualified for the authorized restore-ground retry: Relay/Archive/Ember never perform the required objective action, and Mare loses to air routing before its multi-window mining objective completes. A repair strategy does not supply those missing actions. **Shared driver is byte-identical to base**, including all existing assertions and both strategies ([hash comparison](driver-equivalence.json)). Four new gated specs reuse it. The run-14 evidence adapter reuses the prior town entry and JPEG/sample-compaction approach, recording map-specific diagnostics at the terminal. No movement helper was changed and no default behavior was changed.

Mare's precise driver fault is the new information: `read()` watches `e8SuitAir=null`, while this map publishes its live suit/mining state under `e8Atmosphere`. The low-air refill branch never fires. Both suits drain 60 seconds, then deal 100 damage over 20 ticks; three breathing domes remain full. The final seam approach stalls at desktop (-31.818931,34.855370) and phone (-33.705645,12.845040) for target (-34,12). Even the generic refill target (10,-6) is outside its dome ellipses. The [Mare finding](e8-mare-claim/finding.md) separates this instrumentation/route fault from the correctly functioning map consumer.

All four follow-up owners are **QA/native objective or orbital driver**, named in their findings. No reproducible contract, art or runtime fault was established, so **no F-PP10 defect ID is manufactured**. No production, balance, contract, art-store, existing-spec assertion, task, ledger or spec-document changes. The task firewall excludes vault writes; this run note is the durable handoff.

## Evidence and checks

- [Pre-flight](preflight.md): clean lane, no undrained work, authorized advance to main; two install/build passes exit 0. Only npm-generated optional-platform lock metadata restored; clean removed empty regenerated run-13 strategy directories.
- `npx tsc --noEmit`: **PASS, exit 0** ([receipt](tsc-final.exit)).
- `npm run build`: **PASS, exit 0** ([trimmed log](build-final.log), [receipt](build-final.exit)). Full log external; existing Vite/chunk/quantization warnings.
- Actual env-unset four-spec invocation, both projects, one worker: **8 skipped, exit 0** ([log](gate-unset.log), [receipt](gate-unset.exit)).
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, one worker: **2 passed, exit 0** ([log](adjacent.log), [receipt](adjacent.exit)). Its existing debug fixture is not counted as a native ride or whole-suite pass.
- [Scope, raw-row and ride audit](verify.py): PASS ([receipt](verification.json)). Raw rows equal compact observations after documented sample trimming. Driver unchanged, public URLs, clean browsers, ride limits and applicable screenshots checked. `git diff --check`: PASS.
- Direct inspection: Relay Valley phone loss (wave 17), Mare desktop loss (AIR 0s/wave 2), Archive desktop loss (0/3 restored/wave 20), Ember phone objective loss (92 HP/wave 3). No art acceptance inferred.
- Added evidence: **1,615,430 bytes**, under 25,000,000. Required command: `node scripts/evidence-budget.mjs 59733b98d6d98e6bfc8713240c470e2e12e11ce8 HEAD --limit 25000000 --json`; final receipt external at `~/.goldrush/play-proofs/run-14/evidence-budget-final.json`.
- Own Vite `http://127.0.0.1:5303`, PID 20567; stopped after final checks. No attended server touched. Full original rows, command logs, redundant last images and Playwright dumps remain under `~/.goldrush/play-proofs/run-14/`; in-tree rows cite their exact raw paths. Terminal images are JPEG quality 80; one per project/map.

Reproduce an authorized ride with `python3 artifacts/sol/play-proofs/run-14/run-map.py <contract>`, which records its argv, controlled env and direct exit and runs desktop then phone with `--workers=1`. This run's ride allowance is complete; reproduction is follow-up work. `checks.py` records final gate commands and direct exits; `summarize.py` regenerates measurements from frozen terminal readings.

## Commits

- `da1672950` — Relay Valley and shared evidence packaging.
- `0f1854373` — Mare Claim.
- `04d422aa5` — Archive World.
- Ember Shore and final campaign/gate record: containing `test:` commit; exact hash in final response.

## Complete campaign table

The 38 predecessor rows are carried from run 13 and its cited deciding runs, without re-testing or promoting older status-document proofs. The table uses mutually exclusive verdicts. “Objective never engaged” groups driver objective-engagement holds: some sub-actions work, but the required complete objective remains unexercised/unproved; the linked finding controls the exact scope. Canyon Works is a historical corrected defect, not a fresh full-proof pass. All 42 contracts appear exactly once; the map list is closed.

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
| The Long Road (e4-long-road) | HELD — objective never engaged; deaths 4/5; convoy not dispatched | 12 | [Finding](../run-12/e4-long-road/finding.md) |
| Deepwater Claim (e5-deepwater-claim) | HELD — objective never engaged; wave-100 budget exits; boss unengaged | 12 | [Finding](../run-12/e5-deepwater-claim/finding.md) |
| Flotilla (e5-flotilla) | PROVED both screens — terminal journey; construction/reshape not proved | 12 | [Proof](../run-12/e5-flotilla/proof.md) |
| Regatta (e5-regatta) | PROVED both screens — six-gate boat race/full journey | 12 | [Proof](../run-12/e5-regatta/proof.md) |
| Stillwater (e5-stillwater) | PROVED both screens — terminal journey; five-ground work not proved | 12 | [Proof](../run-12/e5-stillwater/proof.md) |
| Glow Mesa (e6-glow-mesa) | PARTIAL both — boss terminal 8/9; bank instrument rejects early finish | 12 | [Finding](../run-12/e6-glow-mesa/finding.md) |
| Half-Life Hollow (e6-half-life-hollow) | HELD — survival ceiling; crossing complete; all four deaths wave 4 | 13 | [Finding](../run-13/e6-half-life-hollow/finding.md) |
| The Picnic (e6-picnic) | HELD — objective never engaged; stakes lost at wave 2 with full hero HP | 13 | [Finding](../run-13/e6-picnic/finding.md) |
| The Showroom (e6-showroom) | HELD — objective never engaged; alive budget exits 79/78; captures 0/6 | 13 | [Finding](../run-13/e6-showroom/finding.md) |
| The Dead Band (e7-dead-band) | HELD — objective never engaged; deaths 18/18; refusal unexercised | 13 | [Finding](../run-13/e7-dead-band/finding.md) |
| Echo Canyon (e7-echo-canyon) | HELD — objective never engaged; deaths 16/19; no playbook/mirror | 13 | [Finding](../run-13/e7-echo-canyon/finding.md) |
| Relay Rush (e7-relay-rush) | HELD — objective never engaged; deaths 18/19; deadline 1/3, no muted use | 13 | [Finding](../run-13/e7-relay-rush/finding.md) |
| Relay Valley (e7-relay-valley) | HELD — objective never engaged; playbook uses 0, deaths 17/17 | 14 | [Finding](e7-relay-valley/finding.md) |
| The Mare Claim (e8-mare-claim) | HELD — orbital movement / driver instrumentation; wrong air read, 1/4 mining, deaths 2/2 | 14 | [Finding](e8-mare-claim/finding.md) |
| The Archive World (e10-archive-world) | HELD — objective never engaged; 0 light holds, deaths 20/20 | 14 | [Finding](e10-archive-world/finding.md) |
| The Ember Shore (e10-ember-shore) | HELD — objective never engaged; 0 stokes, vent lost 3/3 | 14 | [Finding](e10-ember-shore/finding.md) |

## Recommendation for the owner

**Keep restore-ground opt-in. Make no balance changes from these holds alone.** The sweep is complete; more identical generic rides will add little information. The next driver work should address named objectives: Mare's actual air consumer and dome/mining-window route; Relay's recording/playback action; Archive's west light placement/hold; Ember's funded Stoke action. The already authored holds-1 task owns Long Road, Deepwater Claim and Glow Mesa instrumentation. Other missing storage, machinery, capture and playbook actions stay with their native-driver owners.

Survival-ceiling holds remain strategy questions: existing ground repairs prove only Old Canal phone on the final revision. Twin Banks, the ground defense/escort maps and Half-Life Hollow need specific positioning, protection or hazard strategies before any map-balance inference. Orbital holds need drift/braking and air-aware routing; restoration alone cannot solve them. The 29 HELD rows are not 29 proven broken maps.

Design questions remain with the owner: whether Twin Banks' hero exposure and Old Canal's desktop pressure feel fair to a human; the raw River route's enemies/no seams (F-RES1-3); and whether the intended teachings remain legible when the terminal has been reached without every optional briefing goal. River's earned ending is already proved in run 7; county replay/post acceptance remains separate. Canyon Works stays with its corrective/re-proof owner until a fresh complete journey is measured.

**Human playtest priority:** Old Canal desktop and Twin Banks first, as previously ruled, to distinguish automation limits from player-facing pressure. Then Mare Claim to assess dome/air-trip readability and stopping; then Ember Shore and Archive World to assess whether Stoke and the first light stake are discoverable. Relay Valley should be played with the record/playback flow to assess its relay teaching. These are follow-up recommendations, not extra rides or balance authorization in this run.
