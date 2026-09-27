# Native play proofs — run 11 (sol-play-proofs-7)

2026-09-27. **READY-FOR-GATES with recorded holds.** All six requested maps measured in epoch order, desktop before 390×844 phone. **Drill Yard PASS both; Dry Gulch, Night Shift, Hill Mine, Trestle and Moth Season HELD both. No reproducible map defect established, so no F-PP7 IDs assigned. No balance or production changes.** Base `1ddb5f4537cf2765cfc384605e106bf40679c952`, lane `sol/map-art-campaign-2`.

| Map | Desktop default / restore | Phone default / restore | Verdict and evidence |
| --- | --- | --- | --- |
| Drill Yard | One bell wave, 100 practice gold, Book and plain reload PASS on corrected instrument | Same PASS | [Practice proof](e1-drill-yard/proof.md); standings POST/GET refusal asserted |
| Dry Gulch | Death 16 / 16 | Death 16 / 16 | [HELD](e1-dry-gulch/finding.md) — hero survival before wave 20 |
| Night Shift | Death 17 / 16 | Death 15 / 16 | [HELD](e1-night-shift/finding.md) — survival before dawn at 25 |
| Hill Mine | Death 1 / 1; cart 1/1 in both | Death 2 / 2; cart 1/1 in both | [HELD](e2-hill-mine/finding.md) — terrace approach/opening, no builds |
| Trestle | Death 13 / 13; cart 1/1 in both | Death 13 / 11; cart 1/1 in both | [HELD](e2-trestle/finding.md) — railcar, survival and both-approach construction |
| Moth Season | Death 12, CONNECT 0/1; no restore | Death 13, CONNECT 0/1 failed; no restore | [HELD](e3-moth-season/finding.md) — driver never establishes authored objective |

Per-map findings contain exact simulation time, death wave, gold, repairs, standing/total pieces, full rows, commands and exit codes. Standing counts include preplaced fixtures. All **22 actual rides** (including the two initial Drill Yard instrument failures) have zero console/page errors. Warnings are not counted as errors; the server log retains the shipped Drill Yard render-demotion warning. The 18 ordinary-map rides exit 1 at the unchanged secure assertion; the final paired Drill Yard run exits 0. No failed full proof is called green.

## Method, adaptations and limits

- Reused the shared driver byte for byte, including its progressed-profile seed, timescale 4, native keyboard/HUD inputs, upgrade selection and optional restore-ground strategy. Six new opt-in specs. No debug URLs, seed pins, teleports, free builds, simulated combat or runtime writes. This is browser phone emulation, not a touch-only physical-device test.
- The run-local [entry adapter](board-entry.ts), used only by these new specs, replaces the driver's first direct navigation with a real town walk and Book launch. It retains the application's own mode URL, then adds only timescale 4, as the existing Incline proof does. This makes the two E2 ore-cart modes real, not diagnostic fixtures. Shared-driver behavior/default path remains unchanged; no movement helper added.
- Drill Yard has no finite tutorial/secured score in its contract. Its measured practice terminal is one cleared bell wave and authored Return to Town. Both corrected journeys retain score and meta-progress bytes across plain reload and reopen the Book on foot, with no best-score cell and zero standings requests. No claim that every optional practice building or target was exercised. The unmodified field-book refusal test independently rejects both POST and GET. Initial rides proved the bell/Book but failed when the helper expected a menu after the app resumed directly into town. The helper now accepts either native entry state; both initial rows/screens remain under initial/. One earlier import failure happened before any browser ride. No more than two rides per project.
- Default then one restore-ground ride for each survival hold on Dry Gulch, Night Shift, Hill Mine and Trestle. Moth Season gets only default on each project: no pylon or decoy was built and CONNECT never worked, so the task's survival-only retry condition is false. The generic kit's missing Moth turrets and west-yard circuit explain this coverage gap; no impossible-map inference.
- Night Shift remains the shipped seven-cold-lantern contract; HM-01a remains parked. Hill Mine delivers the cart at 148/180 HP in all rides; Trestle delivers it at 180/180. Those successes do not substitute for full secure/bank/reload.
- No new score was secured on the five held maps. Their terminal/last images show actual held/lost states. Bank-cell/Book screenshots cannot honestly be supplied for those failures. Drill Yard supplies terminal, Book and the intentionally unranked card image in place of a bank cell. Successful-score screenshot hooks exist in each ordinary-map spec but were not reached in this run.
- Direct screenshot inspection: Drill Yard desktop clear-wave and phone unranked card; Dry Gulch phone loss; Night Shift desktop loss; Hill Mine desktop loss; Trestle desktop loss; Moth Season phone loss. Images agree with saved counters. This is gameplay evidence, not visual-art acceptance.

## Findings and follow-up owners

**F-IDs: none.** No reproducible map fault was proven. Suggested follow-up owner is driver/QA: hero survival on Dry Gulch/Night Shift; terrace-aware opening on Hill Mine; railcar engagement and north-approach building on Trestle; pylon/decoy opening on Moth Season. These are proposals, not authorized extra rides or map correctives. Keep restore-ground opt-in. Do not change balance based on these holds.

## Checks and evidence

- Pre-flight: clean lane, no ahead commits, 39 behind main; authorized advance to main. Both install/build passes exit 0. Restored only npm's generated 30-line optional-platform libc metadata removal. No pre-existing evidence discarded. [Pre-flight](preflight.md).
- `npx tsc --noEmit`: exit 0, [log](tsc-final.log), [exit](tsc-final.exit).
- `npm run build`: exit 0, [log](build-final.log), [exit](build-final.exit); existing Vite/chunk/quantization warnings retained.
- Actual env-unset final new-spec battery, both Chrome projects and one worker: **12 skipped, exit 0**, [log](gate-unset-final.log). No default long runs introduced.
- Unmodified `e2e/field-book.spec.ts --grep 'training ground — standings refuse'`, both Chrome projects and one worker: **2 passed, exit 0**, [log](e1-drill-yard/refusal.log).
- `python3 artifacts/sol/play-proofs/run-11/verify.py`: scope, unchanged shared-driver hash, saved rows, ride limits, clean browsers and applicable screenshot presence; [machine report](verification.json). This audit does not turn HELD gameplay into PASS.
- `git diff --check` against the recorded base: PASS after removing only trailing whitespace/blank EOF lines from generated logs and error-context Markdown; no measured values changed.
- All native commands use one worker, desktop before phone, traces off. Ordinary-map exact commands/environment and direct exit codes are in each strategy directory; [runner](run-map.py). Drill Yard commands are in the root logs; both project flags, one worker, the same external server.
- Own Vite dev server at `http://127.0.0.1:5303`, PID 92770; verified lane-c command/cwd and stopped only that PID at closeout. No attended server or art-store changes. Task firewall excludes vault writes; this run note is the durable handoff.

## Commits

- `5305db6ca` — Drill Yard, run-local entry helper and pre-flight.
- `2e4f59034` — Dry Gulch.
- `555f2f146` — Night Shift.
- `dfa57680a` — Hill Mine.
- `40554d9d7` — Trestle.
- Moth Season and final evidence: containing `test:` commit; exact hash in the final report.

## REMAINING LIST IN ORDER

These **16 untouched contracts** are for the numbered continuation. The five new holds above remain known follow-up work; their ride allowances are closed in this task.

1. `e4-long-road`
2. `e5-deepwater-claim`
3. `e5-flotilla`
4. `e5-regatta`
5. `e5-stillwater`
6. `e6-glow-mesa`
7. `e6-half-life-hollow`
8. `e6-picnic`
9. `e6-showroom`
10. `e7-dead-band`
11. `e7-echo-canyon`
12. `e7-relay-rush`
13. `e7-relay-valley`
14. `e8-mare-claim`
15. `e10-archive-world`
16. `e10-ember-shore`

## CAMPAIGN TABLE

The verified inventory grows from **20 to 26 measured contracts**, with **16 untouched of 42**. Prior evidence is carried explicitly, not presented as re-tested here. River is updated to run 7's ending proof; Old Canal phone to run 9 and its final-driver desktop hold to run 10. Canyon Works remains historical defect evidence with separate corrective work recorded by the attended status/backlog; this run provides no fresh acceptance of that corrective.

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
| The Drill Yard (e1-drill-yard) | PROVED practice terminal both | 11 | [Evidence](e1-drill-yard/proof.md) |
| The Dry Gulch (e1-dry-gulch) | HELD — all deaths wave 16 | 11 | [Evidence](e1-dry-gulch/finding.md) |
| Night Shift (e1-night-shift) | HELD — desktop 17/16, phone 15/16 | 11 | [Evidence](e1-night-shift/finding.md) |
| The Hill Mine (e2-hill-mine) | HELD — escort works; deaths 1/1 and 2/2 | 11 | [Evidence](e2-hill-mine/finding.md) |
| The Trestle (e2-trestle) | HELD — escort works; deaths 13/13 and 13/11 | 11 | [Evidence](e2-trestle/finding.md) |
| Moth Season (e3-moth-season) | HELD — CONNECT 0/1; deaths 12/13 | 11 | [Evidence](e3-moth-season/finding.md) |
