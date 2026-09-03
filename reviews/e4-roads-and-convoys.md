# e4-roads-and-convoys — drain review (attended, 2026-09-04)

**Slice/branch/tip:** `e4-roads-and-convoys` · `lane/b` · tip `5d8603982` (13 commits, two merges of main inside) · base `5f7fe4e59` · merge `48ef7df8d`
**Verdict: MERGED, with three findings spawning correctives in this drain.** Claude implementer (Opus, attended-dispatched; resumed four times across the API incident and a session-limit reset; the interrupted Fable implementer's WIP was salvaged and kept).

## What it does
All four Motor Frontier RESKIN rows of the era-mechanic audit are cured with no new balance number: `src/sim/MotorSocket.ts` composes the classes the era already had (`ConvoyBehavior`, `RoadSegment`, `WeatherSystem`), gated on `twist.motorFrontier`. Each map carries one errand that gates SECURE: Dust Flats `haul` (a road plus a fuelled Hauler; distance traversal), Long Road `convoy` (the town gains only the ground the lead Hauler gains toward the far stop), Gusher County `deliveries` (each storm washes out one lease by the weather cycle alone), Boneyard `tow` (one salvage hulk delivered). Riders get two additive targetless verbs, `GRADE` and `HAUL`, and `now.motor` in the view; the view schema moved 1 → 2 and skill.md documents it. The null floors were re-derived.

## Evidence (lane, both gates re-run on the merged tree; see the SHIPPED row for the merged-tree exits)
| gate | result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | 0 / 0 |
| `npm run test:stats` | 0 (87+223+223+26) |
| `scripts/e4-roads-and-convoys.test.mjs` | 11/11 |
| e2e (E4 + census + adjacent E1 task-025), desktop + 390px | 24 passed, zero console errors |
| `npm run test:node-guards` | 632/639 on the lane: 3 reds are the drain's (engine pin, fixture-teardown cascade), 2 pre-existing on main (a stale ledger row of E8's, desk-declaration/contention under load); three the implementer's own, fixed |
| claimed reel vs node replay | dust-flats `086670cf`, long-road `9cdc36d6`, gusher-county `ca739103`, boneyard `4ef6662b`: all equal; sub-wave digests Chromium = node |
| whole-run browser hash | NOT claimed (F-E4-2 below), honestly |

## Merge classification
Base `5f7fe4e59`. LANE-TOUCHED: `src/sim/MotorSocket.ts` (new), `src/sim/HeadlessContractSim.ts`, `src/agent/{StandingOrders,MechanicsManifest,View}.ts`, `src/meta/ContractFamilies.ts`, `assets/contracts/epoch-4-motor/contracts.json`, `assets/contracts/null-floors.json`, `public/skill.md`, `scripts/e4-motor-{floor,ride}.mjs`, `scripts/e4-roads-and-convoys.test.mjs`, `e2e/e4-roads-and-convoys.spec.ts`, `e2e/er01-e4-census.spec.ts`, `package.json`, evidence. MAIN-MOVED: `tasks/BACKLOG.md` only (auto-merged; the lane had merged main twice, including the E8 physics drain, so `HeadlessContractSim.ts` carried both compositions already).

## Findings
- **F-E4-3 (BLOCKING for the L7 claim on E4; CORRECTIVE QUEUED):** human parity is NOT met: a plain boot of `e4-dust-flats` mounts no Hauler and no tar; `src/game/Game.ts:4585` gates the vehicles behind `?debug&vehicles`. The rider can haul; the player cannot. The e2e pins the gap and reds the day it closes. Master: `tasks/e4-vehicles-plain-boot.md` (lane-c).
- **F-E4-2 (CORRECTIVE QUEUED):** cross-engine float drift: `visualY(0,72)` is `0.4667785887247181` in Chromium and `0.46677858872383526` in node, and the sim reads terrain on the motor path, so a whole-run browser hash for an E4 tape can diverge from node while the eh2 fixture replays identically. The county's ranking is node-side; the browser show would refuse honestly. Cure at the source: quantize terrain reads on the sim path onto the existing 1e15 canonicalization grid. Master: `tasks/sim-terrain-read-canonicalization.md` (lane-d).
- **F-E4-1 (INVESTIGATE, QUEUED):** the implementer reports `RunSuspend.captureSnapshot` crashing a live browser ride at the first wave boundary under its harness, reproduced on `the-claim`. Players ride the Claim daily and the plain-boot e2e batteries pass, so the trigger is likely harness-specific; it must be reproduced or refuted with a plain boot before anything is changed. Master: `tasks/f-e4-1-suspend-snapshot-repro.md` (lane-a).
- **L2 winnability, open:** no scripted floor variant secures any Motor map (best: Gusher County defend-first, wave 11 of 12); the errands land early and cheaply, the survival floor is the blocker, and `Balance.ts` was firewalled. Heat 11's Opus rides will say whether a real rider secures; if none does, a balance slice follows (owner precedent: "we can balance later during testing").
- **The engine pin:** appended in this drain.
