# Spec slice — E5 Regatta: the boat is the racing body, and both species steer it
**Status: DRAFT 2026-09-18 (attended), for the owner's ratification.** Supersedes nothing; answers desk A14 (F-RPG-18/19).

## Owner directives, verbatim
- 2026-09-14: "A14 - I am not sure, driving a boat sounds like fun?"
- 2026-09-18: "yes, lets draft the Regatta boat spec slice as well."
- 2026-09-07 (the parity law this slice lives under): "D1 - no, AI and human users have to have the same options and tools, otherwise it is unfair. fairness is crucial."

## The problem this answers (measured 2026-09-07, F-RPG-18/19)
`e5-regatta`'s race course is five beacons in open water (start (−49, 0), north-west (−28, 38), mid-course (0, 18), north-east (28, 38), finish (49, 0), radius 3; `assets/contracts/epoch-5-deepwater/contracts.json` `tileParams.raceCourse`). `src/systems/RegattaRaceSystem.ts` advances when ANY racer point is within a gate's radius. Headless, the socket hands it the Prospector's position as the "hero"; in the browser it races every visible actor plus the boat anchor. Under the 1:1 grammar (ADR-005) the Prospector is not a body anyone positions, and every gate is water no body can stand on — so the race cannot be won honestly by either species today. Option (a) of A14: **the boat is the racing body for both species; the hero rides it; the gates are buoys the boat passes.**

## Laws
1. **One body, one intent.** The Claim-Boat (`src/entities/ClaimBoat.ts`, today a thing that moves between deck anchors) becomes a steerable body while the hero is aboard: it has a position, a heading and a speed, and it is moved by the hero's move intent — a human's keys and a rider's `MOVE_HERO` are the same intent (`heroMoveIntent`), exactly as on land. No new verb. A rider that can walk the hero can sail the boat; a human at the keys gets nothing a rider does not.
2. **Embark and disembark are positions, not buttons.** The hero walks onto the boat's deck anchor to embark (the existing anchor is the gangway); while aboard, move intent steers the boat and the hero stays at the deck anchor; a move intent toward standable shore within reach disembarks. Headless and browser agree (the sim owns it).
   - **2026-09-22, owner, verbatim: "F-RB2-2: gangway-reach only"** — option (a) on F-RB2-2 (`reviews/e5-regatta-boat-02.md`). "Within reach" in this law means the GANGWAY's reach, measured from the deck anchor the aboard body rides and equal in every direction (`CLAIM_BOAT_GANGWAY_REACH` = the deck half-width plus one plank), never the deck rectangle's, which ran the hull's length and reached 16.25 m over the bow. A body therefore leaves her over the SIDE; a bow-ward intent probes a point inside her own deck and the hull runs aground on its clamp instead of putting a racer over the side and forfeiting the race unwarned. One predicate, both species: a rider's `MOVE_HERO` a metre past the bow is refused `UNREACHABLE_WATER` on the same rule.
3. **The race counts the boat.** `RegattaRaceSystem.advance` receives the boat's position as the racer while the hero is aboard, and nothing else; the beacons stay where they are (water) and are read as buoys the boat passes. The finish requires the boat, with the hero aboard, inside the finish radius.
4. **Water physics are minimal and deterministic.** Fixed-step; a top speed, an acceleration, a turn rate, a drag, the fast-water zone's bonus (`raceCourse.fastWaterZone`) applied as a speed multiplier; storm and corsair rules untouched. No wake, no waves in the sim (render-only).
5. **The view tells the truth.** The agent view gains the boat's position and heading and whether the hero is aboard (a view-version bump, because it is new information, not duplicated); `public/skill.md`'s mechanics fence names it. Refusals are the standing-order status channel: `NOT_ABOARD`, `UNREACHABLE_WATER`, the existing `UNREACHABLE_*`.
6. **Same-game audit.** The rider/human controls table must read equal on the Regatta after the slice (`scripts/same-game-audit.mjs`), and the census for E5 pins the new door state with a dated cause.

## Slices (each ends in a playable checkpoint with its gate)
1. **The steerable body (sim + browser).** `ClaimBoat` gains motion state and a steer step driven by the hero's move intent while aboard; `HeadlessContractSim` and `Game.ts` both apply it (parity guard: a tape replays to the same hash on both engines). Checkpoint: a human boots `e5-regatta`, walks onto the boat, and sails it by the keys; a rider's `MOVE_HERO` to a water point sails the same boat. Gate: a new `scripts/regatta-boat-steer.test.mjs` (headless: embark, sail to a point, disembark; refusals), `e2e/e5-regatta-boat.spec.ts` both projects, zero console errors.
2. **The race reads the boat.** `RegattaRaceSystem.advance` takes the boat as the racer; the beacons render as buoys; the finish rule. Checkpoint: a human wins the race by sailing the five buoys; the race no longer advances from a swimming hero or a visible actor. Gate: the spec above extended with a full race; the null floor stays a non-secure (no orders = no race).
3. **Rider parity.** View fields, `skill.md` fence, `MechanicsManifest` rules, the same-game audit equal on the Regatta, the census pin re-pointed with cause. Gate: `same-game-audit.test.mjs`, `skillmd-guard`, `er01-e5-census`, a headless rider tape that wins the race replays to its hash (bench seed), the era pin.
4. **Heat.** The Regatta re-ridden by an Opus rider on the deployed build; its row on the county board.

## Integration map
Touches: `src/entities/ClaimBoat.ts`, `src/systems/RegattaRaceSystem.ts`, `src/sim/HeadlessContractSim.ts` and `src/game/Game.ts` (the steer step and the racer handoff), `src/agent/StandingOrders.ts` (refusal reasons only), the agent view schema (+1 version), `public/skill.md`, `assets/contracts/epoch-5-deepwater/contracts.json` (boat physics constants under `deepwater.claimBoat`, never `Balance.ts`), `e2e/e5-regatta*`, `scripts/regatta-boat-steer.test.mjs`. Untouched: the storm track, the corsairs, the flotilla, every other map, the door.

## Ratification questions (batched)
1. Speed and feel: a boat that turns in about 2 s and crosses the course in about 60 s at top speed — or slower and heavier? (Recommendation: 2 s / 60 s; the fast-water zone ×1.5.)
2. May the hero leave the boat mid-race and walk the shore, or is the race forfeited on disembark? (Recommendation: forfeited — one body races.)
3. Do the buoys stay at Astra's five beacons, or should the course hug the fast-water zone? (Recommendation: stay; the zone is a choice the racer makes.)
4. Name for the boat on the card and in the view: "the Claim-Boat" (today's name) — or a Regatta-specific name? (Recommendation: keep it.)
