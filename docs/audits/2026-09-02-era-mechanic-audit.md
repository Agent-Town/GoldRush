---
date: 2026-09-02
type: audit
scope: E3-E10 door contracts
---

# Era mechanic audit: E3-E10 door contracts

## Verdict

Current corpus: **32 contracts** (four in each of E3-E10). The current `public/skill.md` door list admits **26** of them; the six absent contracts are exactly the six `gr-sim` refusals below. Results: **9 EXERCISES · 3 PARTIAL · 14 RESKIN · 6 UNRIDDEN**.

The task's inherited premise that E4, E8, and E9 have “no engine system” is stale. E4 has `ConvoyBehavior`, `RoadNetwork`, and `WeatherSystem`; E8 has `E8PhysicsSystem`; E9 has `SeedCaravanSystem`, `CanalChoiceSystem`, `ScheduledRelocationSystem`, and `E9CanalSystem` (`src/systems/ConvoyBehavior.ts:34`, `src/systems/RoadSegment.ts:53`, `src/systems/WeatherSystem.ts:30`, `src/systems/E8PhysicsSystem.ts:38`, `src/systems/SeedCaravanSystem.ts:163`, `src/systems/CanalChoiceSystem.ts:138`, `src/systems/ScheduledRelocationSystem.ts:168`, `src/systems/E9CanalSystem.ts:52`). The real defect is composition: `HeadlessContractSim` imports/composes no E4 transport/weather system and no `E8PhysicsSystem`; it composes only Low Orbit's projectile-return subset and three E9 contract consumers (`src/sim/HeadlessContractSim.ts:52-83`, `src/sim/HeadlessContractSim.ts:728-744`). E10 likewise has browser systems but no headless composition (`src/game/Game.ts:2002-2013`; `src/systems/E10FinaleSystem.ts:34`; `src/systems/E10StaticBossSystem.ts:54`).

## Method and honesty limit

Each admitted contract was ridden once through `node scripts/gr-sim.mjs --contract <id> --seed <first-pinned-seed> --policy idle`, except Low Orbit, whose one ride used a legal repeated `BLAST_AT` floor to exercise orbital return. E10 has no pinned bench seeds, so its attempts use `<id>-audit-01`; this does not turn them into bench evidence. Each refusal is preserved verbatim.

`gr-sim` does **not serialize the event list**: `bindEventLog` subscribes to `hero_damaged`, `hero_died`, `enemy_killed`, `wave_started`, `building_damaged`, `building_wrecked`, `run_started`, `run_secured`, and `run_ended`, but the terminal output exposes only `eventLogHash` (`src/sim/HeadlessContractSim.ts:1205-1247`, `src/sim/HeadlessContractSim.ts:1638-1659`). Therefore those event kinds were grepped and found only as the opaque hash boundary; mechanic invocation is judged from rider-visible live diagnostics: `deepwater.storm.waves`, `atomic.exhausted`/decay stages, `lowOrbit.returnsScheduled`/`returnsDetonated`, `fairground`, `canyonConnect`, `broadcastMirror`, `signalSuppression`, `interferenceFront`, and `devilsAlley`. No hidden event contents are guessed.

Verdicts mean: **EXERCISES** = the headless ride actually advances the ladder mechanic; **PARTIAL** = a real subset/declared socket is present but the full reasoning problem cannot fire; **RESKIN** = the ride is ordinary survival or another mechanic, not the ladder mechanic; **UNRIDDEN** = the public door refused construction, so no runtime verdict is invented.

## Contract table

| Contract | Era | Signature mechanic | Headless system present? | Invoked in ride? | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| `e3-blackout-ridge` | E3 | grid under sabotage | Yes: `PowerGraphSystem` | Yes: graph stepped through four waves | **EXERCISES** | `assets/contracts/epoch-3-voltage/contracts.json:6,49`; constructor/step `src/sim/HeadlessContractSim.ts:844-847,1402-1411`; `artifacts/era-mechanic-audit/e3-blackout-ridge.log` (w4, `928c3618`) |
| `e3-moth-season` | E3 | grid under sabotage | No grid; day/night + moths only | No | **RESKIN** | contract has `mothSeason`, not `powerGrid`: `assets/contracts/epoch-3-voltage/contracts.json:84,115`; graph gate `src/sim/HeadlessContractSim.ts:844-847`; `artifacts/era-mechanic-audit/e3-moth-season.log` (w4, `7f1ac8a2`) |
| `e3-canyon-works` | E3 | grid under sabotage | Yes: graph + connect latch | Yes: `canyonConnect` remained 0/2 through w3 | **EXERCISES** | `assets/contracts/epoch-3-voltage/contracts.json:147,239`; `src/sim/HeadlessContractSim.ts:844-878,2010-2018`; `artifacts/era-mechanic-audit/e3-canyon-works.log` (`canyonConnect`, `ac7eaf69`) |
| `e3-fairground` | E3 | grid under sabotage | Yes: graph powers damageable wheel | Yes: wheel fell to 0 HP, stopped producing, escort became unsecurable | **EXERCISES** | `assets/contracts/epoch-3-voltage/contracts.json:336,376`; `src/sim/HeadlessContractSim.ts:848-869,1974-1982`; `artifacts/era-mechanic-audit/e3-fairground.log` (`wheelSpinning:false`, `647fa993`) |
| `e4-dust-flats` | E4 | distance, roads, convoys | No E4 system composed | No | **RESKIN** | contract `assets/contracts/epoch-4-motor/contracts.json:6,75`; headless import/composition surface `src/sim/HeadlessContractSim.ts:52-83`; `artifacts/era-mechanic-audit/e4-dust-flats.log` (w2, `5d4aeff2`) |
| `e4-long-road` | E4 | distance, roads, convoys | No E4 system composed | No | **RESKIN** | contract `assets/contracts/epoch-4-motor/contracts.json:138,200`; `src/sim/HeadlessContractSim.ts:52-83`; `artifacts/era-mechanic-audit/e4-long-road.log` (w4, `2b27b21d`) |
| `e4-gusher-county` | E4 | distance, roads, convoys | No E4 system composed | No | **RESKIN** | contract `assets/contracts/epoch-4-motor/contracts.json:244,316`; `src/sim/HeadlessContractSim.ts:52-83`; `artifacts/era-mechanic-audit/e4-gusher-county.log` (w5, `95f5777c`) |
| `e4-boneyard` | E4 | distance, roads, convoys | No E4 system composed | No | **RESKIN** | contract `assets/contracts/epoch-4-motor/contracts.json:348,415`; `src/sim/HeadlessContractSim.ts:52-83`; `artifacts/era-mechanic-audit/e4-boneyard.log` (w4, `717f1001`) |
| `e5-deepwater-claim` | E5 | storms schedule waves | Yes: `DeepwaterSocket` / storm scheduler | Yes: 18 storm waves scheduled | **EXERCISES** | `assets/contracts/epoch-5-deepwater/contracts.json:6,40,80`; `src/sim/HeadlessContractSim.ts:953-980,1359-1361`; `artifacts/era-mechanic-audit/e5-deepwater-claim.log` (`storm.waves:18`, `9c344f09`) |
| `e5-regatta` | E5 | storms schedule waves | Yes: `DeepwaterSocket` / storm scheduler | Yes: 14 storm waves scheduled | **EXERCISES** | `assets/contracts/epoch-5-deepwater/contracts.json:158,196,236`; `src/sim/HeadlessContractSim.ts:953-980`; `artifacts/era-mechanic-audit/e5-regatta.log` (`storm.waves:14`, `80b36bec`) |
| `e5-stillwater` | E5 | storms schedule waves | Deepwater present; storm deliberately suppressed | No storm-scheduled wave | **RESKIN** | `assets/contracts/epoch-5-deepwater/contracts.json:282,320,373`; scheduler selection `src/sim/HeadlessContractSim.ts:976-980`; `artifacts/era-mechanic-audit/e5-stillwater.log` (`storm.waves:0`, `e323e4fa`) |
| `e5-flotilla` | E5 | storms schedule waves | Yes: Deepwater + flotilla | Yes: two storm waves / six corsairs before loss | **EXERCISES** | `assets/contracts/epoch-5-deepwater/contracts.json:421,463,505`; `src/sim/HeadlessContractSim.ts:953-980`; `artifacts/era-mechanic-audit/e5-flotilla.log` (`corsairWaves:2`, `68d87963`) |
| `e6-glow-mesa` | E6 | everything decays | Yes: `AtomicSocket` / `DecayScheduler` | Yes: puddle stages changed and 342 machines exhausted | **EXERCISES** | `assets/contracts/epoch-6-atomic/contracts.json:6`; `src/sim/AtomicSocket.ts:94-97`; tick `src/sim/HeadlessContractSim.ts:712,1359-1376`; `artifacts/era-mechanic-audit/e6-glow-mesa.log` (`atomic.tiles`, `exhausted:342`, `0ae65b8e`) |
| `e6-showroom` | E6 | everything decays | Available behind admission, not constructed | Refused before ride | **UNRIDDEN** | exemption/admission gate `src/sim/HeadlessContractSim.ts:141-160,232-234,693-696`; `artifacts/era-mechanic-audit/e6-showroom.log` (AP-07 refusal) |
| `e6-half-life-hollow` | E6 | everything decays | Yes: `AtomicSocket` / decay | Yes: 306 machines exhausted | **EXERCISES** | `assets/contracts/epoch-6-atomic/contracts.json:296,353`; `src/sim/HeadlessContractSim.ts:712,1359-1376`; `artifacts/era-mechanic-audit/e6-half-life-hollow.log` (`exhausted:306`, `5e7517ff`) |
| `e6-picnic` | E6 | everything decays | Yes: `AtomicSocket` / decay | Yes: six machines exhausted while hold state advanced | **EXERCISES** | `assets/contracts/epoch-6-atomic/contracts.json:413,489`; `src/sim/HeadlessContractSim.ts:712-717,1359-1376`; `artifacts/era-mechanic-audit/e6-picnic.log` (`exhausted:6`, `c26f77d5`) |
| `e7-relay-valley` | E7 | playbooks and the Echo | No `E7SignalSystem` or substitute | No | **RESKIN** | contract `assets/contracts/epoch-7-signal/contracts.json:6`; explicit headless absence `src/sim/HeadlessContractSim.ts:511-522`; `artifacts/era-mechanic-audit/e7-relay-valley.log` (w2, `1c8a5f74`) |
| `e7-echo-canyon` | E7 | playbooks and the Echo | Partial: `BroadcastMirror` only | No: public grammar has no playbook verb; `recordedUses:0` | **PARTIAL** | `assets/contracts/epoch-7-signal/contracts.json:135,247`; limitation `src/sim/HeadlessContractSim.ts:526-538`; `artifacts/era-mechanic-audit/e7-echo-canyon.log` (`bodiesFielded:0`, `1cf3c0e1`) |
| `e7-dead-band` | E7 | playbooks and the Echo | Partial: `SignalSuppression` only | Only by construction; all refusal counters 0 | **PARTIAL** | `assets/contracts/epoch-7-signal/contracts.json:276,362`; limitation `src/sim/HeadlessContractSim.ts:509-522`; `artifacts/era-mechanic-audit/e7-dead-band.log` (`refusals:0`, `8659e124`) |
| `e7-relay-rush` | E7 | playbooks and the Echo | Interference front, not playbook/Echo runtime | No ladder mechanic; ride died before first front | **RESKIN** | `assets/contracts/epoch-7-signal/contracts.json:393,490`; `src/sim/HeadlessContractSim.ts:593-613,741,1417-1420`; `artifacts/era-mechanic-audit/e7-relay-rush.log` (`frontsArrived:0`, `ebf7134e`) |
| `e8-mare-claim` | E8 | low gravity, air as wall | No `E8PhysicsSystem` headless | No | **RESKIN** | gravity declaration `assets/contracts/epoch-8-orbital/contracts.json:6,134`; browser-only composition `src/game/Game.ts:804`; headless surface `src/sim/HeadlessContractSim.ts:52-83`; `artifacts/era-mechanic-audit/e8-mare-claim.log` (`ee2f7c14`) |
| `e8-far-side` | E8 | low gravity, air as wall | No physics; signal/probe systems instead | No changed-physics diagnostics | **RESKIN** | `assets/contracts/epoch-8-orbital/contracts.json:214,263,324`; `src/sim/HeadlessContractSim.ts:720-729`; `artifacts/era-mechanic-audit/e8-far-side.log` (`signalSuppression`/`probeRecovery`, `3fe83eca`) |
| `e8-low-orbit` | E8 | low gravity, air as wall | Partial: `LowOrbitSystem`, not full physics/air | Yes, partially: one return scheduled and detonated; movement/air stayed inert | **PARTIAL** | `assets/contracts/epoch-8-orbital/contracts.json:358,413,510`; `src/sim/HeadlessContractSim.ts:549-562,728,765-773`; `artifacts/era-mechanic-audit/e8-low-orbit.log` (`returnsScheduled>=1`, `returnsDetonated:1`, `d1b466b9`) |
| `e8-eclipse` | E8 | low gravity, air as wall | No `E8PhysicsSystem` or eclipse consumer headless | No | **RESKIN** | `assets/contracts/epoch-8-orbital/contracts.json:540,669,737`; browser physics `src/game/Game.ts:804`; `artifacts/era-mechanic-audit/e8-eclipse.log` (`fac5d558`) |
| `e9-dome-basin` | E9 | persistent tiles | No persistent consumer | No | **RESKIN** | contract `assets/contracts/epoch-9-redfields/contracts.json:6`; conditional E9 composition `src/sim/HeadlessContractSim.ts:730-744`; `artifacts/era-mechanic-audit/e9-dome-basin.log` (`85282db9`) |
| `e9-seed-run` | E9 | persistent tiles | `SeedCaravanSystem` exists behind admission | Refused before construction | **UNRIDDEN** | `assets/contracts/epoch-9-redfields/contracts.json:210,322`; create seam `src/sim/HeadlessContractSim.ts:730-732`; admission exemption `src/sim/HeadlessContractSim.ts:210-230`; `artifacts/era-mechanic-audit/e9-seed-run.log` (AP-07 refusal) |
| `e9-devils-alley` | E9 | persistent tiles | Relocation system, not persistence | Three sweeps started; zero persistent state | **RESKIN** | `assets/contracts/epoch-9-redfields/contracts.json:350,500`; `src/sim/HeadlessContractSim.ts:742-744,1421-1430`; `artifacts/era-mechanic-audit/e9-devils-alley.log` (`sweepsStarted:3`, `relocations:0`, `1a15181a`) |
| `e9-old-canal` | E9 | persistent tiles | `CanalChoiceSystem` exists behind admission | Refused before construction | **UNRIDDEN** | `assets/contracts/epoch-9-redfields/contracts.json:528,641`; create seam `src/sim/HeadlessContractSim.ts:733-738`; exemption `src/sim/HeadlessContractSim.ts:184-208`; `artifacts/era-mechanic-audit/e9-old-canal.log` (AP-07 refusal) |
| `e10-ember-shore` | E10 | preserve, don't extract | No E10 headless system | Refused; no pinned bench seed | **UNRIDDEN** | `assets/contracts/epoch-10-deepsky/contracts.json:6,85`; admission gate `src/sim/HeadlessContractSim.ts:232-234,693-696`; `artifacts/era-mechanic-audit/e10-ember-shore.log` (AP-07 refusal) |
| `e10-archive-world` | E10 | preserve, don't extract | No E10 headless system | Refused; no pinned bench seed | **UNRIDDEN** | contract `assets/contracts/epoch-10-deepsky/contracts.json:137`; browser E10 systems `src/game/Game.ts:2002-2013`; `artifacts/era-mechanic-audit/e10-archive-world.log` (AP-07 refusal) |
| `e10-last-claim` | E10 | preserve, don't extract | No E10 headless system | No: ordinary survival to w4 | **RESKIN** | contract/preserve sites `assets/contracts/epoch-10-deepsky/contracts.json:311,455`; browser-only systems `src/game/Game.ts:2002-2013`; `artifacts/era-mechanic-audit/e10-last-claim.log` (`33b03c0e`) |
| `e10-river` | E10 | preserve, don't extract | No E10 headless system | Refused; no pinned bench seed | **UNRIDDEN** | contract `assets/contracts/epoch-10-deepsky/contracts.json:517`; admission gate `src/sim/HeadlessContractSim.ts:232-234,693-696`; `artifacts/era-mechanic-audit/e10-river.log` (AP-07 refusal) |

## Per-era summary

- **E3 — 3 EXERCISES, 1 RESKIN.** Blackout, Canyon, and Fairground route material objectives through the graph. Moth Season is darkness/moth pressure with no grid.
- **E4 — 0 EXERCISES, 4 RESKIN.** Every contract rides as ordinary stationary survival. Transport, road, convoy, and weather classes exist, but none is composed into the headless door.
- **E5 — 3 EXERCISES, 1 RESKIN.** Deepwater Claim, Regatta, and Flotilla visibly schedule waves from storm cycles. Stillwater deliberately suppresses that schedule and tests noise hunting instead.
- **E6 — 3 EXERCISES, 1 UNRIDDEN.** Every admitted ride visibly advances decay/exhaustion. Showroom is refused by its admission exemption.
- **E7 — 0 EXERCISES, 2 PARTIAL, 2 RESKIN.** Echo and Dead Band publish fragments, but headless has no playbook verb, drone, relay graph, or `E7SignalSystem`; Relay Valley and Relay Rush do not run the ladder's programming/self-play problem.
- **E8 — 0 EXERCISES, 1 PARTIAL, 3 RESKIN.** Low Orbit proves returning lobs, but headless movement is fixed idle and no atmosphere-wall consumer exists. The other three do not compose `E8PhysicsSystem`.
- **E9 — 0 EXERCISES, 2 RESKIN, 2 UNRIDDEN.** Persistence consumers exist for Seed Run and Old Canal but both public rides are refused. Dome Basin has none; Devil's Alley is transient relocation, not cross-run stewardship.
- **E10 — 0 EXERCISES, 1 RESKIN, 3 UNRIDDEN.** Last Claim is admitted without its preserve systems; the other three are refused and none has a published bench seed.

## Smallest slices for every RESKIN / PARTIAL

- `e3-moth-season` — add the smallest sabotageable two-node light circuit and make surviving darkness depend on restoring it.
- `e4-dust-flats` — compose one contract-authored road plus one fuelled vehicle into headless and make distance traversal gate secure.
- `e4-long-road` — compose its existing convoy route and gate secure on the convoy reaching the far stop.
- `e4-gusher-county` — put the objective on a fuelled vehicle that must choose roads around timed weather closures.
- `e4-boneyard` — make one salvage hulk tow use the shared vehicle/road consumer and gate secure on delivery.
- `e5-stillwater` — schedule at least one adversarial weather-triggered wave without removing its quiet/noise objective.
- `e7-relay-valley` — expose one playbook-use verb and run it through the existing signal system to complete one relay action.
- `e7-echo-canyon` — bind a public playbook-use verb to `BroadcastMirror.noteUse`, so the next wave fields one measurable mirror squad.
- `e7-dead-band` — bind the same playbook verb and return `signal-suppressed` in the dead band, producing a real refusal rather than a by-construction zero.
- `e7-relay-rush` — let one rider-authored playbook automate relay lighting, then have the interference front suspend that program.
- `e8-mare-claim` — compose `E8PhysicsSystem` into headless movement/combat and publish suit-air/air-wall diagnostics.
- `e8-far-side` — route crossing movement through the gravity profile and make suit-air across the vacuum zone part of the secure latch.
- `e8-low-orbit` — route headless movement through handhold/drift scaling and add the atmosphere-wall/suit-air half; keep the proven returning-lob seam.
- `e8-eclipse` — compose gravity/air first, then make the eclipse remove an air/energy route the rider must transfer around.
- `e9-dome-basin` — add one canonical stage snapshot plus one tile mutation that persists only in profile play and resets for bench runs.
- `e9-devils-alley` — persist one anchor/ground decision across profile runs; relocation alone is not the era mechanic.
- `e10-last-claim` — compose the existing three preserve sites into headless, expose the three final verbs, and gate secure on all three held.

## No-system list: confirmed or refuted

- **E4 vehicles — REFUTED as an engine absence, CONFIRMED as a headless absence.** `ConvoyBehavior`, `RoadNetwork`, and `WeatherSystem` exist; `HeadlessContractSim` imports none.
- **E8 gravity/air — REFUTED as an engine absence, CONFIRMED as a headless/full-consumer absence.** `E8PhysicsSystem` exists and the browser constructs it; headless only composes `LowOrbitSystem` for one contract, with no air-wall consumer.
- **E9 persistence — REFUTED.** Seed caravan and canal-choice persistence systems exist and are explicitly constructed with empty per-run stores headless; their two contracts are then blocked at admission. Dome Basin still has no persistence consumer.
- **E10 preserve — additional gap.** Browser preserve/finale systems exist, but the admitted headless Last Claim does not compose them.

## Reproduction

All raw outputs are in `artifacts/era-mechanic-audit/` (32 logs, 2.3 MB). Pinned seed 01 was used for every E3-E9 attempt. Six logs contain the exact AP-07 refusal. The other 26 contain a terminal outcome and `eventLogHash`; Low Orbit additionally records a successful returned-lob counter transition.
