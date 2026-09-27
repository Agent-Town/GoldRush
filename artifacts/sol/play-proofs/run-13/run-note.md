# Native play proofs — run 13 (sol-play-proofs-9)

2026-09-27. **READY-FOR-GATES with recorded holds. All six maps HELD on desktop and 390×844 phone. No proven map defect, no F-PP9 IDs, no balance or production edits.** Base `37062bef74ea586cb280ab8962826c6c786ac47f`; lane `sol/map-art-campaign-2`.

| Map | Desktop | Phone | Verdict / evidence |
| --- | --- | --- | --- |
| Half-Life Hollow | default death 4 / 25 gold; restore death 4 / 25 gold; both 0 repairs, 2/2 standing | default death 4 / 25 gold; restore death 4 / 30 gold; both 0 repairs, 2/2 standing | [HELD](e6-half-life-hollow/finding.md): crossing completes in all four; radiation 36/37 default and 37/39 restore |
| The Picnic | all stakes lost wave 2 / 83.333 s, 100 HP, 15 gold, 0 repairs, 2/2 standing | same loss wave 2 / 81.333 s, same HP/gold/works | [HELD](e6-picnic/finding.md): works outside the stake protection radius |
| The Showroom | budget exit alive wave 79 / 2372.800 s, 175 HP, 10 gold, 0 repairs, 1/1 standing | alive wave 78 / 2367.067 s, same HP/gold/works | [HELD](e6-showroom/finding.md): captures 0/6, house-aware route/capture missing |
| The Dead Band | death 18 / 550.000 s, 0 gold, 0 repairs, 8/8 standing | death 18 / 547.467 s, same gold/works | [HELD](e7-dead-band/finding.md): suppression active; refusal latch unexercised |
| Echo Canyon | death 16 / 487.200 s, 50 gold, 0 repairs, 7/7 standing | death 19 / 581.333 s, 0 gold, 0 repairs, 8/8 standing | [HELD](e7-echo-canyon/finding.md): no playbook use or fielded mirror |
| Relay Rush | death 18 / 545.600 s, 0 gold, 0 repairs, 8/8 standing | death 19 / 579.333 s, same gold/works | [HELD](e7-relay-rush/finding.md): deadline 1/3 sites and no muted playbook attempt |

[Machine measurements](measurements.json) preserve all 14 rides. **Every ride has zero console/page errors. Every native test honestly fails its unchanged secure assertion; all seven paired native commands exit 1.** No secure/bank/Book/reload success is claimed. There are no successful terminal/Book/bank triplets to supply; each final project/map has its observed terminal JPEG, and missing bank/Book evidence remains part of each hold.

## Method and decisions

Real town-to-Book movement and real contract card launch via the existing run-11 board-entry adapter; progressed-profile seed from the shared driver, public plain seed, no `?debug` or `?seed`, permitted timescale 4, native keyboard/HUD input and read-only diagnostics. Phone means 390×844 browser emulation, not a physical touch-only device test. Desktop precedes phone, one worker, trace off; no quota refusal, disconnect, boot retry or extra ride.

Each map first received the unchanged default driver. Half-Life Hollow alone qualified for the single restore-ground ride per project: the crossing completed before a hero-survival death. Restoration also died at wave 4, before repair maintenance could help. Picnic's stakes were unprotected by the misplaced kit; Showroom never captured; E7 never exercised the relevant playbook action, and Relay Rush also missed its site deadline. These are objective-route gaps, so none received a survival-only restoration retry. No more rides are authorized in this run.

**Shared driver is byte-identical to base**, including default and restore-ground behavior ([SHA-256 comparison](driver-equivalence.json)). Six new gated specs reuse it. The new evidence adapter freezes map-specific diagnostics before banking, saves quality-80 JPEGs, and retains only first/last samples in-tree while preserving full original rows outside the tree. The new terminal capture avoids the post-bank reset ambiguity observed in run 12 without changing any banking assertion or gameplay action. No movement/helper or production change was made.

All follow-up owners are QA/native objective or movement strategy, as detailed per map. The holds do not prove a map fault; **no F-ID is manufactured from them**. Keep restore-ground opt-in and make no balance change from these results. Relay Rush's measured lit/muted state is mechanical evidence, not acceptance of the lamp animation or full art clause. Historical proofs in the status document are not silently reused as this run's acceptance.

## Evidence and gates

- [Pre-flight](preflight.md): clean lane, no undrained commits; accepted predecessor on main; authorized advance; two install/build passes exit 0. Only npm's generated optional-platform lock metadata restored. Clean removed empty regenerated run-12 strategy directories, no user work.
- `npx tsc --noEmit`: **PASS, exit 0**, [receipt](tsc-final.exit).
- `npm run build`: **PASS, exit 0**, [trimmed log](build-final.log), [receipt](build-final.exit). Existing Vite/chunk/quantization warnings. Full log external at `~/.goldrush/play-proofs/run-13/build-final-full.log`.
- Actual env-unset six-spec invocation, both projects, one worker: **12 skipped, exit 0**, [log](gate-unset.log), [receipt](gate-unset.exit). The default battery remains unchanged.
- Existing unmodified `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, one worker, trace off: **2 passed, exit 0**, [log](adjacent.log), [receipt](adjacent.exit). This adjacent test uses its existing debug fixture; it is not counted as a native ride or a whole-suite pass.
- [Scope/ride/evidence audit](verify.py): **PASS**, [receipt](verification.json): 14 rides, raw-row equivalence after documented sample compaction, correct IDs, public URLs, applicable screenshots, shared driver unchanged. This validates observations, not successful gameplay. `git diff --check`: PASS.
- Direct image inspection: Half-Life Hollow phone restore loss, Picnic desktop stake loss, Showroom desktop house/WRANGLE state, Dead Band phone loss, Echo Canyon desktop loss, Relay Rush desktop loss. No art acceptance inferred.
- **Added evidence: 2,658,831 bytes**, below 25,000,000. Measured with `node scripts/evidence-budget.mjs 37062bef74ea586cb280ab8962826c6c786ac47f HEAD --json`; final receipt external at `~/.goldrush/play-proofs/run-13/evidence-budget-final.json`. Full logs, sample dumps, redundant last images and Hollow default terminal images remain under `~/.goldrush/play-proofs/run-13/`; compact rows cite their original raw paths.
- Own strict-port Vite server `http://127.0.0.1:5303`, PID 31074, stopped after verification. No attended server touched. Task firewall excludes vault writes; this run note is the durable handoff.

## Commits

One concern per map, all `test:` commits:

- `35729e35b` — Half-Life Hollow plus shared evidence packaging.
- `a0731a77a` — The Picnic.
- `79fba4187` — The Showroom.
- `2b6b17aa1` — The Dead Band.
- `79f96ef4c` — Echo Canyon.
- Relay Rush and final run-13 gate record: containing commit; exact hash in final response.

## REMAINING LIST IN ORDER

All six requested maps have completed their authorized measurements. The six holds remain follow-up work with the owners above. The numbered continuation's **four untouched contracts**, in epoch order:

1. `e7-relay-valley`
2. `e8-mare-claim`
3. `e10-archive-world`
4. `e10-ember-shore`

## CAMPAIGN TABLE

**38 measured contracts of 42; four untouched.** The 32 predecessor rows are carried from run 12 without re-testing. These six new HELD rows add measurements, not six successes. Historical defect/corrective status remains separate from fresh acceptance.

| Map | Campaign verdict | Deciding run | Finding / evidence |
| --- | --- | --- | --- |
| The Claim (the-claim) | PROVED one project — desktop control | 4 | [Control](../run-4/the-claim/row-desktop-chrome.json); older both-project status proof is outside this series |
| Baron | HELD — deaths 16/23; boss alive | 1 | [F-PP1-1](../run-1/e1-baron/finding.md) |
| Twin Banks | HELD; latest phone deaths 17/18 | 10 | [Ground strategy finding](../run-10/e1-twin-banks/finding.md) |
| Pressure Garden | HELD — three-hot-bed objective/survival unproved | 1 | [F-PP1-3](../run-1/e2-pressure-garden/finding.md) |
| Incline | PROVED both projects | 1; regressions through 6 | [Proof](../run-1/e2-incline/proof.md); F-PP1-4 resolved |
| Blackout Ridge | PARTIAL — secure/bank/reload; no stored current | 2 | [F-PP2-1](../run-2/e3-blackout-ridge/finding.md) |
| Canyon Works | Historical traversal DEFECT; corrective landed, fresh campaign acceptance unproved | 2; status/backlog follow-up | [Historical F-PP2-2](../run-2/e3-canyon-works/finding.md); no re-test in this run |
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
| Old Canal | PROVED phone on final driver; desktop HELD wave 18 | 9–10 | [Phone proof](../run-9/e9-old-canal/finding.md); [final desktop hold](../run-10/e9-old-canal/finding.md) |
| Last Claim | PROVED both projects — vent/wave 8, bank/Book/reload | 6 | [Full proof](../run-6/e10-last-claim/proof.md) |
| River | PROVED both projects; county post held separately | 7 | [Ending proof](../run-7/e10-river/finding.md) |
| The Drill Yard (e1-drill-yard) | PROVED practice terminal both | 11 | [Evidence](../run-11/run-note.md) |
| The Dry Gulch (e1-dry-gulch) | HELD — all deaths wave 16 | 11 | [Evidence](../run-11/run-note.md) |
| Night Shift (e1-night-shift) | HELD — desktop 17/16, phone 15/16 | 11 | [Evidence](../run-11/run-note.md) |
| The Hill Mine (e2-hill-mine) | HELD — escort works; deaths 1/1 and 2/2 | 11 | [Evidence](../run-11/run-note.md) |
| The Trestle (e2-trestle) | HELD — escort works; deaths 13/13 and 13/11 | 11 | [Evidence](../run-11/run-note.md) |
| Moth Season (e3-moth-season) | HELD — CONNECT 0/1; deaths 12/13 | 11 | [Evidence](../run-11/run-note.md) |
| The Long Road (e4-long-road) | HELD — deaths 4/5; convoy not dispatched | 12 | [Finding](../run-12/e4-long-road/finding.md) |
| Deepwater Claim (e5-deepwater-claim) | HELD — wave-100 budget exits; boss unengaged | 12 | [Finding](../run-12/e5-deepwater-claim/finding.md) |
| Flotilla (e5-flotilla) | PROVED terminal journey both; construction/reshape not proved | 12 | [Proof](../run-12/e5-flotilla/proof.md) |
| Regatta (e5-regatta) | PROVED six-gate boat race and full journey both | 12 | [Proof](../run-12/e5-regatta/proof.md) |
| Stillwater (e5-stillwater) | PROVED terminal journey both; five-ground work not proved | 12 | [Proof](../run-12/e5-stillwater/proof.md) |
| Glow Mesa (e6-glow-mesa) | PARTIAL both — boss terminal 8/9; bank instrument rejects early finish | 12 | [Finding](../run-12/e6-glow-mesa/finding.md) |
| Half-Life Hollow (e6-half-life-hollow) | HELD — crossing complete; all four deaths wave 4 | 13 | [Finding](e6-half-life-hollow/finding.md) |
| The Picnic (e6-picnic) | HELD — stakes lost at wave 2 with full hero HP | 13 | [Finding](e6-picnic/finding.md) |
| The Showroom (e6-showroom) | HELD — alive budget exits 79/78; captures 0/6 | 13 | [Finding](e6-showroom/finding.md) |
| The Dead Band (e7-dead-band) | HELD — deaths 18/18; refusal unexercised | 13 | [Finding](e7-dead-band/finding.md) |
| Echo Canyon (e7-echo-canyon) | HELD — deaths 16/19; no playbook/mirror | 13 | [Finding](e7-echo-canyon/finding.md) |
| Relay Rush (e7-relay-rush) | HELD — deaths 18/19; deadline 1/3, no muted use | 13 | [Finding](e7-relay-rush/finding.md) |
