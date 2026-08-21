# Review — A5 `e7-relay-rush`, the interference front (mechanic SHIPPED 08-20, door ADMITTED 08-21 on an owner ruling)
**Slice/branch/tip:** `worktree-agent-a177c1e22ed14fe03`. Part 1 built on base `1cb47bdca` and drained to main 2026-08-20 (`ea2872dd3`…`7b8c87181`). Part 2 built 2026-08-21 on top, after merging main (`bda894776`) — a clean FAST-FORWARD, zero conflicts, because part 1 was already on main. Built by a headless Opus-5 agent (owner directive 2026-08-20: remaining coding on Opus).

**Verdict part 1 (2026-08-20): MERGED — mechanic GREEN in both engines, admission HELD on a measured map ceiling.**
**Verdict part 2 (2026-08-21): PROPOSED — ADMISSION REVERSED. Both bench seeds secure at wave 20, twice each, through the ordinary door.**

---

## Part 2 — the owner's stake, and the reversal (2026-08-21)

**The ruling.** F-A5-1 below had measured the A5 refusal to authored GEOMETRY rather than to the mechanic, and put the fork to the owner with a recommendation. He ruled it, verbatim, to the five-map fork table: **"lets follow your recommendation"** — i.e. a `heroStart` stake inside a relay site.

**The stake, and why this exact point.** `tileParams.stakeMarkers` now carries `relay-ridge-command-stake` at **(-25, 41)** — the **centre of `relay-site-r2`**. The centre is not a taste, it is the only point that works: `Balance.beacon.range` is 8 and a 10×10 box has a 7.1wu half-diagonal, so the centre is the ONLY placement from which the whole box sits inside beacon reach, and turret range 16 then covers it twice over. r2 rather than r3 because they are geometrically symmetric (both are interior boxes with a 10wu gap to their outer neighbour, both 29wu from their nearest spawn edge) and r2 is the one the briefing's own reading walks first; the measurement, not the reasoning, is what settles it, and r2 secures both seeds. **Nothing else moved** — no zone added, no cap raised, no balance number touched, and the four `harvestAnchors` are untouched from part 1. The mask table mirrors the stake byte-for-byte; the briefing gains one rule line and a geography clause so a player is told where they stand.

**The result.** The map is now a real "expand under deadline": the home box is the claim's garrison AND the first relay, and the other two relays the deadline needs cost two of the six beacon slots plus a walk. The front is no longer a rumour either — **six crossings per run** instead of one, ~2000 muted work-steps, which also discharges F-A5-3.

### Evidence — twelve runs, every repeat byte-identical

| Row | Result |
| --- | --- |
| Prover, seed 01 ×2 (`admissionProbe`) | **SECURED wave 20**, 671 kills, `litAtDeadline` **3** of 3, 6 fronts, 1980 muted work-steps — `fnv1a32:bc89348d` |
| Prover, seed 02 ×2 (`admissionProbe`) | **SECURED wave 20**, 717 kills, `litAtDeadline` **3** of 3, 6 fronts, 2340 muted work-steps — `fnv1a32:b25f69b0` |
| Prover, seed 01 ×2 **plain door** (`--plain`, no probe flag) | **SECURED wave 20** — `fnv1a32:bc89348d`, byte-identical to the probe path |
| Prover, seed 02 ×2 **plain door** | **SECURED wave 20** — `fnv1a32:b25f69b0`, byte-identical to the probe path |
| Idle floor, seed 01 ×2 (Law 2) | secured **false**, wave **2**, 81.3s, lit **0**, latch never set — `fnv1a32:ebf7134e` |
| Idle floor, seed 02 ×2 (Law 2) | secured **false**, wave **2**, 79.8s, lit **0** — `fnv1a32:862ecace` |
| Cross-check | `scripts/null-floor-anchors.mjs` independently generated the same two idle hashes into `null-floors.json` — the generator and the battery agree without being told to |
| Pre-stake control | before the stake, on the MERGED tree, the old prover still reproduced `fnv1a32:49f11d65` at wave 4 exactly — 234 commits of main drift changed nothing about this map, so the reversal is the stake and only the stake |

**The plain-door row is the one that certifies the admission.** While the contract sat in `CONTRACT_ADMISSION_EXEMPTIONS` every measurement had to ride `admissionProbe`, the declared measurement seam; a proof taken through that seam proves the play, not the door. `--plain` constructs through the ordinary gate — which would have thrown `AP-07 supports only …` a day ago — and returns the same hashes.

### Admission surfaces reversed
- `CONTRACT_ADMISSION_EXEMPTIONS`: **8 → 7**, the row DELETED rather than reworded, because its reason died whole (it named its own cure: "re-admit when both bench seeds secure"). An ADMISSION MOVE comment quoting the owner verbatim stands where it was.
- `public/skill.md` door-contracts fence **+ `e7-relay-rush`**; `scripts/door-admission-baseline.json` **+ `e7-relay-rush`** (the ratchet is a fixed baseline, so admission has to be written into it deliberately).
- `assets/contracts/null-floors.json`: regenerated **69 pairs** (67 → 69, the two new rows are Relay Rush's), `--check` GREEN, **0 `secured: true`** across the whole door.
- `e2e/er01-e7-census.spec.ts`: relay-rush joins `ADMITTED`; **E7 is 4/4**. The one-day-old `EXEMPT_WITH_SEEDS` set is emptied rather than deleted (the state it names is real and `e9-seed-run`/`e9-old-canal` may yet enter it). The consumer block now pins the stake at its exact coordinates and asserts them EQUAL to the computed centre of `relay-site-r2`, so owner-ruled data cannot drift silently; the exemption's absence is asserted from source. `objectiveAllowsSecure` is still asserted FALSE at run start — admission did not weaken the latch.
- `e2e/e7-relay-rush-front.spec.ts`: pads moved off the claim footprint, and the playbook/drone stop is now one wall-position that asks both questions. It also gained the stronger half: the wall rolls EAST **while still crossing** and the same towers come back on the air with `phase === 'crossing'` — proving it is the wall's POSITION that mutes, not the fact that a front is happening.

### Audit — attributed by revert-and-reproduce, and unusually clean
| Run | rows | agent-lacks / equal / not-offered | exemptions |
| --- | --- | --- | --- |
| stake + exemption removed (shipped) | 1524 | **483 / 1037 / 4** | **7** |
| stake KEPT, exemption row restored | 1524 | 504 / 1016 / 4 | 8 |

The second reproduced main's pins EXACTLY **with the stake still in place**. So the stake is worth **zero** in this audit (it is map data, not a compared surface — the anchors already bought their +39 rows on 08-20), and the entire delta is the admission: **exactly 21 rows flipping `agent-lacks` → `equal`**, the precise inverse of the 21 the exemption cost when it was added. `not-offered` does not move, for the same reason. Files restored byte-identically after the run (`diff` clean).

### Gates part 2 (Node 26.4.0)
tsc clean · build green · **front spec + census 16/16 both projects** (scratch port 5275) · **adjacents 48/48 both projects** (er01-e7-census, task-025, m1-01, m2-01, ap16-4, skillmd-door, e7-dead-band-suppression) · door-data guards green (skillmd + ratchet + mask tables + bench seeds) · audit guards **6/6** · floors 69 pairs `--check` GREEN, 0 `secured: true` · node-guards **480/472/6**, and all six are ONE environmental cause: this worktree's `node_modules/` is empty, so the guards that spawn `node_modules/typescript/bin/tsc` **by path** cannot find it (worker-type-coverage 1, suite-red-inventory reducer 4, fixture-teardown 1 as a cascade). None reads a file this slice touches. Note vs 08-20: the two desk-declaration reds are gone — main's line-1 is now an ACTIVE lock, which that guard skips by design.

### Findings after part 2
- **F-A5-1 — RULED AND DISCHARGED** (owner 2026-08-21, "lets follow your recommendation"). Kept below as the record of what was measured and why.
- **F-A5-2 — still open**, and now the only one. See below.
- **F-A5-3 — DISCHARGED by the stake**: the front's deadline is reached in every run now, and six fronts cross per game. The observation stands only as history.
- **F-A5-4 (new, non-blocking, owner-adjacent):** the stake makes `relay-site-r2` strictly the best home box, so a rider's *first* decision is made for it. That is a fair reading of a map whose teaching intent is triage under deadline — the choice this map asks is WHICH TWO of the remaining three relays to light, not where to stand — but if the owner wants the start to be a choice too, the cheapest version is a second `heroStart`-eligible stake with a board-side pick. **Recommendation: leave it.** Recorded so the next reader knows it was considered rather than missed.

---

## Part 1 — the build (2026-08-20), unchanged below

## What it does
`e7-relay-rush` declared a front that "crosses the map on a schedule and mutes everything it swallows", a `relayTarget` of `"N"` (a placeholder nobody ever resolved), and four 10×10 relay-site `buildZones` on the north ridge. A5 (`specs/agent-play/door-completion-sheet.md:16`, RATIFIED 2026-08-20) is now a real consumer, `src/systems/InterferenceFrontSystem.ts`, in the era-socket shape both A4 and A6 use — private ctor, `create()` read off the CONTRACT and never the epoch, counted refusals, presentation-stripped diagnostics, and (F-A8-7) **not one render import**: the only imports in the file are two TypeScript types.

It carries four things, and both engines read the same object for all four:

1. **The schedule.** A vertical wall arrives every `FRONT_CADENCE_SECONDS` (90, ratified) and sweeps west→east across the declared corridor in `FRONT_CROSSING_SECONDS` (20, ratified). Its centre travels from one half-width west of the corridor to one half-width east of it, so the wall enters and clears inside its own 20 seconds. Between fronts nothing anywhere is muted. `FRONT_HALF_WIDTH = 6` is **AUTHORED, not ratified** — the sheet gave a cadence and a crossing time but no thickness, and a wall needs one before it can cover anything; the file says so in as many words and shows the arithmetic (120wu of travel in 20s ⇒ 6wu/s ⇒ 2s over a point, ~3.7s over a 10wu site).
2. **The mute, applied at the one seam both engines share.** `BuildSystem`'s twelfth constructor argument, `isShooterPowered`, already gated turret fire from the browser's power grid; its signature has declared `'sentry_beacon' | 'turret'` since it was introduced and only the turret half was ever wired. A5 wires the beacon half (a no-op for every existing caller — `Game.ts`'s power closure answers `id !== 'turret' || powerConsumerAt(...)`, i.e. TRUE for every beacon) and both engines now AND the front into it. A covered turret or beacon stops firing for as long as the wall stands over it and starts again the instant it passes. **Nothing in the file writes hp** — `muted != damaged` is ratified and is asserted directly in the browser spec.
3. **Relay lighting, and the reading of "powered" that makes it honest.** The sheet says the objective is "a powered building standing on the site". `e7-relay-rush` declares no `twist.powerGrid` (verified), so "powered" cannot mean a graph node. It is DERIVED from this mechanic instead: a powered building is one the front's own mute can darken — i.e. one with an output to switch off — which is exactly the shooter seam, `POWERED_RELAY_KINDS = ['turret', 'sentry_beacon']`. A palisade is timber and a stockpile is a shelf; the wall passing over them changes nothing, so they cannot be what "powered" distinguishes. Lighting is LIVE state (a wrecked relay goes dark) and is deliberately NOT tied to the instantaneous mute, because the deadline samples at the wall's arrival on the corridor's WEST edge and tying the two would decide the objective by which site the wall happened to be over.
4. **The objective latch, keyed on the sub-fields (F-1471-1).** `create()` refuses to arm unless the front, a corridor AND at least one relay site are all declared — a deadline with no discharge path must never pin a run unsecurable, which is the standing F-1471-1 casualty. Armed, `objectiveAllowsSecure` is false until the deadline front (#3) arrives; at that instant the lit count is sampled once and latched either way. Missing it is FINAL. The clause sits beside the canyon-connect clause in **both** `HeadlessContractSim.autoSecureWaveForRun` and `Game.autoSecureWaveForRun`, and in both `postBaronDefeat` twins.

**The placeholder is resolved in one place** (`resolveRelayTarget`), with the sheet's ruling quoted at the site: `"N"` is not a numeral, so the ratified **3 of 4** stands in; an authored numeral would be honoured instead (the ratification filled a hole, it did not seize the field) and either way the answer is clamped to the sites that exist.

**Agent surface:** `view.now.interferenceFront` carries phase, `centerX`, `secondsToNextFront`, `frontsArrived`, per-site `{lit, litBy, muted}`, `litCount`, `litAtDeadline`, `objectiveMet`, the refusal counters and `mutedWorkSteps`. Present ONLY where declared. The terminal half also rides the determinism hash, spread-if-declared, so no other contract's pinned hash moves. `MechanicsManifest` grows an `interference_front` rule **sourced from the consumer**, so the briefing and the gate cannot disagree.

**Browser presentation:** a flat translucent slate quad over the corridor while the wall crosses, hidden between fronts — "a simple static band (tint/vignette) is enough, no shader work", and every number in it is read from the consumer (the consumer does not know the mesh exists).

**Verbs:** none added. The mute rides the existing shooter seam and the existing playbook/drone gates.

## The door, and why it stays shut
Four `harvestAnchors` authored at `(-45,32) (-25,32) (25,32) (45,32)` — one at the foot of each relay site, so panning a seam and building the relay above it are the same journey — mirrored byte-for-byte into `mask-tables/e7-relay-rush.json`. Bench seeds `e7-relay-rush-01/-02` minted; `public/skill.md`'s seeds fence follows.

Then it was measured, and it does not secure. **`e7-relay-rush` enters `CONTRACT_ADMISSION_EXEMPTIONS` (6 → 7) with a cited re-admit condition** — the A8 shape, second instance.

**The front is not the obstacle, and the counters say so rather than a sentence.** The ratified objective is discharge-able and was part-discharged in ordinary play: the public-verb prover lit **three of the four relay sites by t=131.6s** on seed 01 against a deadline of **t=270s**, and two by t=90s on seed 02. The wall's entire interference across those runs was **120 and 60 muted work-steps** — four and two seconds of beacon time.

**What refuses is the ground.** The claim stands at (0,12). The ONLY buildable ground on this tile is the four 10×10 relay boxes at z 36..46 — twenty-four world units north of the hero — against a turret range of 16 and a beacon range of 8, on a heightfield authored `mode: "visual"`, so `TileHeight.highGroundRange` early-returns and no high-ground reach applies. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the hero cannot walk to the guns either. **No legal placement defends the body the run is scored on.** Four policies were measured — objective-first (shipped), turret-first, all-turret, and hero-only-with-upgrades — and all four terminate at wave 3 or 4 of 20; the idle floor terminates at wave 2. The whole spread is four waves wide against a secureWave of 20.

## Evidence (real numbers, Node 26.4.0)

| Row | Result |
| --- | --- |
| Public-verb prover, seed 01 ×2 | secured **false**, wave **4**, 131.6s, 73 kills, lit **3/3** at t=131.6s, muteSteps 120 — `fnv1a32:49f11d65` both runs |
| Public-verb prover, seed 02 ×2 | secured **false**, wave **3**, 99.6s, 46 kills, lit **2/3**, muteSteps 60 — `fnv1a32:7fed3db1` both runs |
| Idle floor, seed 01 ×2 (Law 2) | secured **false**, wave **2**, 36 kills — `fnv1a32:d7d70356` both runs |
| Idle floor, seed 02 ×2 (Law 2) | secured **false**, wave **2**, 37 kills — `fnv1a32:1651fc73` both runs |
| Cross-check | seed-01 idle reproduces byte-identically through `scripts/gr-sim.mjs --policy=idle` — the in-process `admissionProbe` path and the ordinary door agree |
| tsc | clean |
| build | green (`✓ built in 1.70s`) |
| New spec `e2e/e7-relay-rush-front.spec.ts` | **8/8** both projects (desktop-chrome 1280×800 + mobile-chrome 390×844), scratch port 5275 |
| Adjacents: er01-e7-census · task-025 · m1-01 · m2-01 · ap16-4 · skillmd-door | **44/44** both projects |
| Null floors | regenerated: 59 pairs, `--check` GREEN, **0 `secured: true`** (Law 2); delta is the `eraStamp` alone (`179c8dcb2` → `1cb47bdca`), since an exempt contract gets no floor |
| Door-admission ratchet | GREEN and UNMOVED — `scripts/door-admission-baseline.json` untouched, which is what an exemption is supposed to mean |
| Door-data guards (skillmd · bench-seeds · ratchet · mask-tables) | **38/38** |
| Audit guards (same-game-audit ×3 · report-guard ×2) | **5/5** |
| node-guards full battery | tests 469 · pass 460 · fail 7 · skipped 2 · `GUARDS_EXIT=1` — every red attributed below |

**Idle terminals, stated plainly (Law 2):** an idle run on either seed dies at wave 2, ~87s, having lit nothing — so the latch never sets and the run could not secure even if it survived. If an idle run ever secures here, STOP: that is a Law 2 event, not a pass.

### The seven node-guards reds, every one attributed, zero unattributed
- **5 ENVIRONMENTAL** — this worktree's `node_modules/` is EMPTY (verified: `ls node_modules | wc -l` → 0; `npx` resolves upward, a hardcoded path cannot). The two guards that spawn `node_modules/typescript/bin/tsc` **by path** therefore cannot find it: `worker-type-coverage.test.mjs` (1 red, "every functions/**/*.ts is type-checked") and `suite-red-inventory.test.mjs`'s reducer block (4 reds, which copy scripts into a temp dir where `typescript` is unresolvable). Neither reads a file this slice touches.
- **2 INHERITED REPO STATE** — `desk-declaration-guard.test.mjs` "the live board is green under this guard" refuses because `STATUS.md` line-1 is a handoff carrying no `OWNER'S DESK` header. `STATUS.md` is UNTOUCHED by this slice (last written by base commit `1cb47bdca`; `git status` clean for it) and firewalled from it. `fixture-teardown.test.mjs` fails as a direct cascade of that same child suite.

### Audit pins — attributed by revert-and-reproduce, in three runs
`docs/bench/same-game-audit.md` regenerated; `scripts/same-game-audit.test.mjs` re-pinned to **this branch's** regen verbatim.

| Run | rows | agent-lacks / equal / not-offered | exemptions |
| --- | --- | --- | --- |
| anchors + exemption (shipped) | 1329 | 433 / 887 / 9 | 7 |
| anchors, exemption row removed | 1329 | 412 / 908 / 9 | 6 |
| anchors emptied, exemption removed | **1290** | **402 / 878 / 10** | **6** |

The third run reproduced main's base EXACTLY with every other line of the slice still in place — the consumer, both latches, the manifest rule, the browser band and the playbook/drone gates. So:
- **the anchors** are worth +10 agent-lacks / +30 equal / −1 not-offered / +39 rows — the identical +10/+30/−1/+39 shape the Far Side and Low Orbit anchor moves recorded;
- **the exemption** is worth exactly 21 rows flipping `equal` → `agent-lacks`, the same 21-per-contract shape the Seed Run, glow-mesa and deepwater moves recorded;
- **the consumer moves NOTHING**, measured for the third time in this wave: the audit's rows are buildable/ability/choice/verb/economy surfaces read per contract, and `interference_front` is a mechanics RULE. A5 adds no standing-order verb, so it adds no verb row either.

Both files were restored byte-identically after the attribution runs (`diff` against pre-run copies: clean).

## Census — per-id, one contract's row
`e2e/er01-e7-census.spec.ts` gains three answers for one contract, which is exactly why that file is keyed per id:
- `EXPECTED_ACTIVE_CONTRACT['e7-relay-rush']`: `'the-claim'` → **`'e7-relay-rush'`**. The authored anchors move it out of `activeContractSelection`'s `harvestAnchors?.length === 0` → `'unavailable-contract'` branch (`ContractFamilies.ts:1329`), so the BROWSER door now opens. That the headless door still refuses the same contract in the same test is the proof they are two separate gates.
- `EXPECTED_RULES['e7-relay-rush']`: `['build_zones']` → **`['build_zones', 'interference_front']`**.
- A new `EXEMPT_WITH_SEEDS` set splits a question that used to be one: a seed set is minted by AUTHORING map data, admission is decided by whether the map can be WON, and Relay Rush now has the first without the second.
- A bidirectional consumer block (A4's shape): the front's declaration, its resolved target of 3, its four site ids, its `objectiveAllowsSecure: false`, the manifest rule sourced from `InterferenceFrontSystem.refuse`, the four anchors, and the exemption's citation — with the `else` branch asserting no other Signal contract grows an `interference_front` rule.

**Concurrency note for the drain:** a sibling builder (A3 echo-canyon) is editing this same census file and the same audit pins on its own branch. Every edit here is per-id or additive; expect to union, and re-measure the audit stack on the merged tree rather than trusting either branch's absolutes.

## Findings
- **✅ F-A5-1 (owner fork, blocking re-admission, MEASURED) — RULED 2026-08-21 in favour of (a); see Part 2.** `e7-relay-rush` cannot be secured as authored: the claim at (0,12) has no buildable ground within 24wu and no gun reaches it. This is the **same class as F-A8-4** (`e9-seed-run`), one map further along — an authored geometry that makes a ratified mechanic unwinnable. Two cheap fixes exist and both are one-line data edits inside the contract, but both are map design and therefore owner calls: (a) author a `heroStart` stakeMarker inside or beside a relay site, which also reads true to the fiction ("the Prospector holds the relay ridge"); or (b) author one claim-adjacent buildZone so the fixed post can be garrisoned at all. **Recommendation: (a)** — it changes no zone, keeps the four relay boxes as the objective, and turns "expand under deadline" into a real triage instead of an impossible one. Until then the exemption stands with its cited re-admit condition.
- **🔺 F-A5-2 (truth, non-blocking, fire-authorable).** `tileParams.engineDependencies` on this contract still names `interference-front-consumer` as `status: "missing"`, and that consumer now exists. It is deliberately NOT edited here: `twist.interferenceFront` and `tileParams.interferenceFrontZones` are both still listed in `DECLARED_INERT_PATHS` (`ContractFamilies.ts:1584`, `:1587`), which is what OBLIGES a non-empty `engineDependencies` at all (`:1713-1718`), and that literal is shared with the concurrently-built A3 echo-canyon. Exactly the F-E7DB-1 shape A4 filed for the Dead Band; this is now the **fifth** stale-prose instance and the consolidated truth-pass should sweep both together, DECLARED_INERT_PATHS included.
- **🔺 F-A5-3 (observation, non-blocking).** The front never arrives inside a real bench run on this map — the first is due at t=90s and the best play ends at t=131.6s, so a run sees one crossing and never reaches the deadline. The schedule is proven instead by driving the consumer directly (`e2e/e7-relay-rush-front.spec.ts`, both the browser manual-sim block and the engine block) and by the prover's `front=` trace. If F-A5-1 is fixed and runs reach wave 20 (~600s+), roughly six fronts will cross per run and the mechanic becomes continuously visible; no cadence change is proposed, because 90s/20s is ratified.
- **Non-blocking, recorded not fixed:** `artifacts/e7-relay-rush/prover.mjs` had to set `globalThis.location` before `ssrLoadModule` — `Terrain` reads `activeContract()` ONCE at module load, and without it every BUILD was rejected `out_of_zone` and the run lost three whole waves. Measured, not theorised. Any future in-process prover on a buildZone-restricted map needs the same two lines; the file's comment says so.

## Files
`src/systems/InterferenceFrontSystem.ts` (new) · `src/sim/HeadlessContractSim.ts` · `src/game/Game.ts` · `src/systems/BuildSystem.ts` · `src/systems/TargetingSystem.ts` · `src/agent/MechanicsManifest.ts` · `src/vite-env.d.ts` · `assets/contracts/epoch-7-signal/contracts.json` · `assets/contracts/epoch-7-signal/mask-tables/e7-relay-rush.json` · `assets/contracts/bench-seeds.json` · `assets/contracts/null-floors.json` · `public/skill.md` · `docs/bench/same-game-audit.md` · `scripts/same-game-audit.test.mjs` · `e2e/e7-relay-rush-front.spec.ts` (new) · `e2e/er01-e7-census.spec.ts` · `artifacts/e7-relay-rush/*` (prover, evidence battery, 8 run logs, summary.json, gate.config.ts, node-guards.txt) · `tasks/BACKLOG.md` · this file.
