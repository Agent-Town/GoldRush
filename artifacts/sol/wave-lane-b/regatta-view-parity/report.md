# Regatta view parity — READY-FOR-GATES with explicit acceptance exceptions

Implementation is complete and coherent. **The required census is not green:** its schema-3 assertions are protected by the task's Firewall. The proposed minimal repair is supplied, not applied. The task's universal-false Regatta shore claim and its Deepwater jetty trip are also contradicted by current code/data; no terrain, movement or forfeit rule was changed to manufacture those results.

Task: `lane-b--20260922-202316-sol-regatta-view-parity.md`. Base: `ca69148e67cc810aaaec21090148f7577f387334`, branch `sol/wave-lane-b`. Local implementation only; integration and era pin remain the drain's.

## Published contract

- `now.regatta.finishedAt: number | null` and `forfeitedAt: number | null`: run seconds, rounded exactly like `buoysPassed[].atSeconds`; null before the event. The sixth and final buoy row is the `claim-boat` finish stake, with the same timestamp as `finishedAt`.
- `now.regatta.canStepAshore: boolean`: deterministic 16-heading shore geometry probe at the gangway reach, independent of boarding. It applies the existing off-deck, non-navigable and walkable clauses, so swimming water is not reported as a shore.
- `regatta_boat.waterBounds`: `{minX:-49.75,maxX:49.75,minZ:-49.75,maxZ:49.75}`, read from the existing hull-water derivation, with `gangwayReach: 6.4` unchanged.
- Published rule sentence: **A step ashore needs STANDABLE ground — walkable terrain off the deck and outside the hull water bounds, within gangwayReach of the deck anchor. The Regatta has walkable shallows beyond parts of this clamp; other points are blocked. Read canStepAshore before ordering: all-water scenery does not make leaving the boat unreachable.**
- `viewSchema.version` **3 → 4**; `viewSchema.additions` names all three new fields. The canonical field list stays unchanged because `now.regatta` is contract-scoped. See [schema.diff](schema.diff). No era pin edited.

The single query is `DeepwaterClaimTile.canStepAshore(ports)` in `src/world/DeepwaterClaimTile.ts`. Both diagnostic builders call it with their existing helm walkability port. `View.readRegatta` remains the sole mapper. Browser and headless boot views compare as identical JSON on desktop and mobile. Unit tests cover terminal/null/forfeit/reset cases, six gate rows, non-finite inputs, 16 headings, state immutability, the live terrain counterexample and manifest bounds.

## F-RVP-1 — the requested universal-false shore assertion is false

At the Regatta's starting hull **(-49, 0)**, unchanged `ClaimBoat.stepAshore({x:-55,z:0}, heroWalkable)` returns **true**. That point is off-deck, outside the clamp, 6 m from the anchor, and Terrain calls it walkable shallows (depth 0.2). The contract authors a radius-64 `spring_pond` with depth 0.2. Heat 15's **(-50.41, 0)** remains unwalkable: one blocked point did not prove the entire rim unreachable. See [shore-investigation.log](shore-investigation.log) and the regression test in `scripts/claim-boat-view.test.mjs`.

The real public-order ride samples **273** hull positions inside the clamp: **149 true / 124 false**. A separate geometry sweep samples **45 positions: 36 true / 9 false**. Examples at z=0: x=-49.75, -49, -45.21, 45.21, 49, 49.75 are true; x=-40, 0, 40 are false. See [regatta-shore-samples.json](regatta-shore-samples.json).

I asked whether to publish the measured boundary or defer the shore portion, then completed the reversible view implementation with the measured boundary stated explicitly. No approval to change the terrain or movement rule was inferred.

## F-RVP-2 — the census cannot pass under the task's protected-file boundary

`e2e/er01-e5-census.spec.ts:285` asserts `viewVersion === 3`; schema 4 necessarily fails it in both projects. Its exact `now.regatta` object also omits the three new fields. These are deterministic expectation mismatches, not the task's named boat-load flake.

[proposed-census.patch](proposed-census.patch) changes only that version, adds a dated cause, and adds `finishedAt:null`, `forfeitedAt:null`, `canStepAshore:true` to the exact boot snapshot. `git apply --check` passes. **Not applied:** the task explicitly says no e2e assertion edits outside the two named files. A precise exception was requested; no reply was received during this run so far.

## F-RVP-3 — Deepwater has shore, but no authored jetty trip

The real `e5-deepwater-claim` boot at lagoon **(0,30)** gives false. A geometry-only hull fixture at **(49.75,30)** on the real map gives true, proving the shared query's positive side. It is explicitly a positional fixture, not a claimed gameplay trip. This boat has no sailing physics and only lagoon (0,30) and open-water (-24,12) anchors; neither is a jetty. `now.regatta` remains absent on this non-race map. See [deepwater-shore-samples.json](deepwater-shore-samples.json).

## Proof and gates

| Check | Result |
|---|---|
| Preflight | No ahead commits; only `logs/guard-stats.jsonl` churn. Dependency install and baseline build passed before edits. |
| `npx tsc --noEmit` | PASS, including the extended browser test. |
| `npm run build` | PASS. |
| `GR_RELEASE=full npm run build` | PASS. |
| `GR_RELEASE=e1 npm run build` | PASS. |
| E1 first-town payload | **34,278,032 B**, below 52,000,000 B. Full-release payload probe is not applicable because it lacks the E1 ceremony family; the valid E1 result is [payload-e1.json](payload-e1.json). |
| Six task-scoped Node guard files | **48/48 passed**; [scoped-guards.log](scoped-guards.log). Final manifest-bound assertions rechecked in [claim-boat-final.log](claim-boat-final.log). |
| Factory guards | **3/3 passed**: task-guards, citations, gate-callers. |
| Three requested e2e files, both projects, workers=1 | **26 passed / 2 failed**. Only the protected census expectations above fail; [playwright.log](playwright.log). |
| `e2e/agent-view.spec.ts` | **12/12 passed**, including exact browser/headless Regatta boot equality. |
| `e2e/e5-regatta-boat.spec.ts` | **6/6 passed**, including both plain-boot wins and both immutable tape replays. |
| `e2e/er01-e5-census.spec.ts` | **8/10 passed**; Regatta schema-3 snapshot fails once per project. |
| Plain Regatta errors | Zero console/page errors at 1280 and 390; the real Regatta checks suppressed zero known transient errors. The console-watch mutation-control test deliberately emits its expected error. |
| Same-game audit | **EQUAL** on the existing Regatta `MOVE_HERO` row and `MOVE_HERO`/`BOAT_BUILD`/`REANCHOR` controls; overall controls **15 equal / 0 agent-only / 0 human-only-richer**. These rows measure verbs and controls, not view fields. Existing legacy tape-action gaps remain, no new verb added. |
| Public-order headless ride | Banks wave 12 at 272 s; repeat is byte-identical. **finishedAt 139.33 = last buoy (`claim-boat`) atSeconds 139.33**; forfeitedAt null. |
| Immutable movement tape | **fnv1a32:dd4116bf**, unchanged, same track in both browser projects. |
| Immutable schema-3 view track | **fnv1a32:9e79d1e9**, unchanged. Existing final fields/five rows compare exactly; new finish row and fields are asserted separately. No tape re-minted. |
| Diff hygiene | `git diff --check` passed; store untouched. |

All commands used `/opt/homebrew/bin` first on PATH. Browser server used only port 5312 with `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5312 --workers=1`. No full battery was invoked. The factory wrapper's first shell ended after its successful 3/3 result because zsh reserves `status`; the audit was then run separately and succeeded.

[ride.mjs](ride.mjs) reproduces the headless proof; [ride-transcript.json](ride-transcript.json) contains orders, every sample, the final view and outcome. [same-game-summary.json](same-game-summary.json) isolates the relevant audit rows. Screenshots in this directory include plain sailing, plain race won, unchanged tape replay and view boot on both viewport sizes. Inspected desktop and mobile captures: game renders and controls remain present. The mobile L3 status label extends past its panel in a plain-boot screenshot; this is outside the HUD-protected slice, not repaired here.

## Hash pair and preservation

- Before source change, reconstructed from base HEAD against the same observed store bytes: `9743e025e0ba93040e7ef8225b129556538889933a211f65fd528720ccc7669c`.
- After: `02804461a4d27b98c90161a16f53d3f0dcf5b16c39abd629d2301dc0b9148d10`.
- Independent `computeEngineHash` agrees; store stable during this comparison. This is **not** a claimed preflight store snapshot. Reproduction: [hashes.mjs](hashes.mjs), output [hash-pair.json](hash-pair.json).

Main advanced during the run as the task warned; the lane was not reset/rebased. No store writes, push, era pin, STATUS, BACKLOG, spec or review edits. Generated screenshots from old evidence paths were copied here then those original paths restored; [restored-evidence.json](restored-evidence.json) lists them. The named Regatta e2e list alone gains the sixth gate to match the task's explicit finish-row addition.

## Next agent prompt

Review F-RVP-1 and F-RVP-3 against the recorded live counterexample: do not hardcode false or invent a jetty to satisfy mistaken acceptance language. If the protected census exception is approved, apply `proposed-census.patch`, run the census on both projects at port 5312 with workers=1, and recheck tsc. Then integrate and measure/pin the engine against the drain's own store snapshot. All other authorized implementation and evidence are complete; census green and acceptance of the corrected shore wording remain outstanding.

`exploratory-raw-walkable.log` preserves the early raw-walkability probe before the off-deck/non-navigable clauses were included; it is exploration history, not the final diagnostic result. The final geometry/ride JSONs and final guard log are authoritative.
