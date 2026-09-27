# Native play proofs — run 12 (sol-play-proofs-8)

2026-09-27. **READY-FOR-GATES with recorded holds.** All six maps received native desktop then 390×844 phone rides. **Long Road HELD; Deepwater Claim HELD; Flotilla PASS; Regatta PASS; Stillwater PASS; Glow Mesa PARTIAL. No reproducible map defect, no F-PP8 IDs, no production or balance changes.** Base `1168df70bd8980049fa11c2fb4bb59f50b9e24d3`, branch `sol/map-art-campaign-2`.

| Map | Desktop | Phone | Verdict / evidence |
| --- | --- | --- | --- |
| Long Road | default death 4, 15 gold, 0 repairs, 2/2 standing; Hauler idle | default death 5, 35 gold, 0 repairs, 2/2 standing; Hauler idle | [HELD](e4-long-road/finding.md) |
| Deepwater Claim | default budget exit alive at wave 100; 100 HP, 0 gold/builds/repairs | same, wave 100; boss paddles intact | [HELD](e5-deepwater-claim/finding.md) |
| Flotilla | secure 12 / 272.133 s, 100 HP, full bank/Book/reload | same terminal and persistence | [PASS terminal journey](e5-flotilla/proof.md) |
| Regatta | six gates at 147.733 s; secure 12 / 272.133 s; full journey | six gates at 148.133 s; same secure and full journey | [PASS](e5-regatta/proof.md) |
| Stillwater | secure 12 / 360.133 s, 159 HP, full journey | secure 12 / 360.133 s, 151 HP, full journey | [PASS terminal journey](e5-stillwater/proof.md) |
| Glow Mesa | default death 6; restoration authored terminal 8, ~263.1 s, 51 displayed HP, 10 displayed gold, 0 repairs | default death 6; restoration authored terminal 9, ~288.7 s, 9 displayed HP, 1 repair | [PARTIAL both](e6-glow-mesa/finding.md): bank/Book/reload not verified |

[Machine measurements](measurements.json) and each map note contain commands, direct exits, gold, repairs, pieces standing and objective state. All **14 native rides have zero console/page errors**. Six full journeys pass their native tests; eight tests fail honestly: Long Road 2, Deepwater 2, Glow Mesa default 2 and restoration 2. No failed proof is relabeled green. Exactly one default ride per project per map; Glow Mesa alone received one restore-ground ride per project. No quota, disconnect or boot retry.

## Scope of the passes and holds

PASS means this task's own terminal (secure wave or authored objective), new banked score, Book return, byte-identical plain reload, clean browser and the applicable screenshot triplet. It does not certify every optional mechanic or all briefing goals. Flotilla loses the kitchen scow and continues with two hulls, as its contract permits; construction across three hulls and intentional reshaping remain unproved. Stillwater finishes with inactive noise sources/no hunting trail, but no hand-pan gold or five-ground traversal/depletion. None of these broader gaps are silently closed.

Long Road's generic route never dispatches its Hauler (distance 0). Deepwater's ordinary ground ghosts never place a deck building, and the boss remains in act 1 with both paddles alive even after 600 wall seconds per project. Neither gets a restoration retry: their objective engagement is missing, rather than a survival failure on a working route. Follow-up owner: QA/native driver, map-specific convoy route and native deck/boss interaction respectively; no impossible-map inference.

Glow Mesa gathering and construction worked, but both default rides died at wave 6 with all three defenses standing, so the single permitted survival retry used restore-ground. Both retries reached the Homemaker ending, DONE/act 3/poweredDown/chairPlaced/kept, observed secure counters 8 and 9. The driver clicks the bank, then rejects its own early ending because its score filter requires `waves >= 12`; it skips Book/reload. The stored Glow Mesa score itself was not captured in the truncated fresh-score excerpt, so bank success is not inferred from source or the overlay. The two-ride allowance is exhausted. This is **PARTIAL**, not a map defect.

That failed bank check also makes the driver's finally block replace its terminal snapshot with a post-bank scene reset. Do not use the restoration rows' time 0 / HP 100 / empty defenses as terminal facts. [Terminal audit](e6-glow-mesa/terminal-audit.json) records the recoverable pre-bank values from objective captures, secure details and screenshots. Terminal standing counts and phone purse were not retained; aggregate measurements use null. Follow-up owner: QA, objective-aware early-bank proof and a terminal snapshot frozen before banking. No shared banking/assertion change here: the only shared-driver authorization was movement.

## Adaptation and evidence retention

Six new specs gated by `GR_NATIVE_PROOF=1`; the existing run-11 adapter walks from the town menu to the Book and clicks the real map card before adding the permitted timescale 4. Existing progressed profile, public plain seed, no debug URLs, no teleport/free-build/sim writes, native keyboard/HUD inputs. Phone evidence is browser emulation, not a touch-only physical-device test.

The sole shared-driver change is Regatta's missing `regattaJourney` movement helper and its map-id-guarded call. It first reuses `journey` for the gangway crossing, then uses WASD and the public boat/race diagnostics to follow heat-15's water-clamped route through six gates. Both rides prove `race.finished=true`, `forfeited=false`. Removing just this helper and call reproduces the entire base driver byte for byte ([checker](verify-driver.py), [hashes/result](driver-equivalence.json)). Default survival, existing map paths, kits, repairs and all existing assertions are unchanged.

Evidence is organized as `<contract>/<strategy>/`; runner output was moved there at closeout and the runner now performs that packaging itself. One terminal/Book/bank triplet per successful project/map, JPEG quality 80. Holds have their observed final state; unbanked runs cannot provide honest bank/Book shots. Glow Mesa's first-attempt terminal pictures were moved to the external raw folder so only its final pair stays in-tree. Full rows, logs and redundant last images remain under `~/.goldrush/play-proofs/run-12/`; compact rows cite exact raw paths. No per-tick JSON dumps committed.

**Added evidence: ` 4,146,186` bytes**, below this task's 25,000,000-byte target and the 40,000,000-byte landing ceiling. Measured on the final staged tree with `node scripts/evidence-budget.mjs 1168df70bd8980049fa11c2fb4bb59f50b9e24d3 <tree> --json`, then confirmed against HEAD after committing; the confirming receipt lives outside the tree at `~/.goldrush/play-proofs/run-12/evidence-budget-final.json`.

## Gates

- [Pre-flight](preflight.md): clean initial lane, no undrained commits; authorized advance to main; both install/build passes exit 0. Restored only npm's generated optional-platform lockfile metadata; discarded no pre-existing evidence.
- `npx tsc --noEmit`: **exit 0**, [exit](tsc-final.exit).
- `npm run build`: **exit 0**, [trimmed log](build-final.log), [exit](build-final.exit). Full log external at `~/.goldrush/play-proofs/run-12/build-final-full.log`; existing Vite/chunk/quantization warnings.
- Final actual env-unset six-spec run, both projects, one worker: **12 skipped, exit 0**, [log](gate-unset.log), [exit](gate-unset.exit).
- Unmodified adjacent `e2e/locked-win.spec.ts --grep 'The Claim card names'`, both projects, one worker, trace off: **2 passed, exit 0**, [log](adjacent.log), [exit](adjacent.exit). This existing adjacent test uses its own debug fixtures; it is not counted as a native ride or a full-suite run.
- Evidence/scope/ride audit: [verify.py](verify.py), [result](verification.json). This verifies retained observations and applicable screenshots, not success for held gameplay.
- Shared-driver isolation: [verify-driver.py](verify-driver.py), PASS. `git diff --check` against base: PASS. No production, asset, art-store, existing test-assertion, task, spec-document or ledger changes.
- Direct image inspection: Long Road phone loss; Deepwater desktop budget exit; Flotilla desktop bank and phone secure; Regatta phone Book; Stillwater desktop secure; both Glow Mesa restoration secure images. Screenshots agree with the stated bounded observations, not art acceptance.
- The two long Deepwater rides reached the replay recorder max-entry limit ([two server warnings](server-warnings.log), ticks 15097/15296). No full replay-tape retention or replay proof is claimed; the native rows and screenshots remain available.
- Own Vite at `http://127.0.0.1:5303`, PID 23652, stopped after checks. Every Playwright command uses one worker; all native map pairs run desktop before phone. Vault writes excluded by the task firewall; this directory is the durable handoff.

## Commits

- `d9996b82a` — Long Road.
- `d92d1e5cc` — Deepwater Claim.
- `0622bbb1c` — Flotilla.
- `7c43ae31b` — Regatta and its movement helper.
- `bdfc85893` — Stillwater.
- Glow Mesa and final gate/retention record: containing `test:` commit, exact hash in the final response. Final retention changes only move prior map evidence under its contract directory and repair links; no ride data or prior assertion is changed.

## REMAINING LIST IN ORDER

All six requested map measurements are complete within their ride limits. These **ten untouched contracts** remain for the numbered continuation. The known coverage/persistence holds above remain follow-up work, not permission for more rides in this run.

1. `e6-half-life-hollow`
2. `e6-picnic`
3. `e6-showroom`
4. `e7-dead-band`
5. `e7-echo-canyon`
6. `e7-relay-rush`
7. `e7-relay-valley`
8. `e8-mare-claim`
9. `e10-archive-world`
10. `e10-ember-shore`

## CAMPAIGN TABLE

**32 measured contracts of 42; 10 untouched.** The prior 26 rows are carried from run 11's original note at source `0c43f9524443fc86272a530eced87515347aa3d4`, not re-tested here. Run-11 links lead to its retained note/archive pointers because its large original record was offloaded. Historical Canyon Works defect/corrective status remains separate from fresh acceptance. Keep restore-ground opt-in; no balance changes from holds alone.

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
| The Long Road (e4-long-road) | HELD — deaths 4/5; convoy not dispatched | 12 | [Finding](e4-long-road/finding.md) |
| Deepwater Claim (e5-deepwater-claim) | HELD — wave-100 budget exits; boss unengaged | 12 | [Finding](e5-deepwater-claim/finding.md) |
| Flotilla (e5-flotilla) | PROVED terminal journey both; construction/reshape not proved | 12 | [Proof](e5-flotilla/proof.md) |
| Regatta (e5-regatta) | PROVED six-gate boat race and full journey both | 12 | [Proof](e5-regatta/proof.md) |
| Stillwater (e5-stillwater) | PROVED terminal journey both; five-ground work not proved | 12 | [Proof](e5-stillwater/proof.md) |
| Glow Mesa (e6-glow-mesa) | PARTIAL both — boss terminal 8/9; bank instrument rejects early finish | 12 | [Finding](e6-glow-mesa/finding.md) |
