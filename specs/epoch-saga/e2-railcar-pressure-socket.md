# E2 Railcar Socket — making the Steamworks railcar beatable
### Status: RATIFIED 2026-08-13 (Q1 answered by owner; Q2 tunable in the balance slice) · attended session · fixes F-E2S-3 · buildable now

## Why (owner directive + finding)
Owner, 2026-08-13, verbatim: *"I remember playing E2 and then I found a lot of things to fix. I think it is important to fix these things now. As we are basically ready to release the first epoch."*
F-E2S-3: `e2-hill-mine`, `e2-trestle`, `e2-incline` are de-listed from the benchmark door — exemption text *"no weapon reaches the railcar"* (`src/sim/HeadlessContractSim.ts:71-92`). Ruled *"de-list now, socket later"* 2026-08-06; the socket master was never authored (`tasks/BACKLOG.md` clean-slate law).

## Verified mechanics (✓ read directly, do not re-assume)
- ✓ The railcar is an elite enemy (`EnemyEliteKind = 'baron' | 'railcar'`, `Enemy.ts:17`) and takes **ordinary projectile damage** via `enemy.takeDamage()` (`CombatSystem.ts:727,758`). It is NOT damage-immune — so there is no missing "pressure→damage" path; the railcar already bleeds to normal hits.
- ✓ The E2 weapons themed to fight it are the **pressure arsenal** — `boilerLance`, `pressureMortar`, `skyRocket` (`PressureArsenalSystem.ts:7`) — which register as ordinary CombatSystem shooters (real damage, pressure-costed).
- ⚠️ ROOT-CAUSE CANDIDATE (? INFERRED — Slice 1 pins it): the arsenal is behind **unlock gates** — `hasBaronMedal()`, research, and rocket-cart capture (`Game.ts:1353-1358`, `Medals.ts`, `hasRocketCartCaptured`). A headless probe starts with none → the arsenal never activates → "no weapon reaches the railcar." A human only holds these weapons **after beating the E1 Baron**.

## Q1 — ANSWERED (owner, 2026-08-13, verbatim: *"no, I did not have the weapons then"*)
The owner played the E2 railcar maps **without** having beaten the E1 Baron, so the pressure arsenal was locked and nothing could touch the railcar. **This is the progression gate, confirmed — not a balance problem.**
**Design ruling (attended, veto-window):** a contract that fields the railcar boss must itself provide the means to beat it — an unwinnable-by-construction contract is a bug. So the three E2 railcar contracts **grant the pressure arsenal as a floor**, making them winnable standalone (benchmark, direct pick, or debug), while the E1→E2 "earn the rockets by beating the Baron" narrative stays intact for normal campaign flow (the grant is a floor, not a removal of the reveal). Reverse with one word if the gate was meant to be hard.

**Q2 — damage-feel (still open, non-blocking):** which weapon reads as the railcar-cracker — the arcing **skyRocket** salvo (matches the rocket weapon you remembered, E2 bundle §B2, my default), or the **boiler lance / pressure mortar**? The core fix grants all three; this only tunes which one *feels* like the finisher, and can be settled in the balance slice.

## Slices (each ends in a playable checkpoint + its gate)
1. **Pin the reach failure** — repro on `e2-hill-mine` headless AND in dev: medal-holder-with-arsenal vs no-medal run → railcar HP delta. Confirm the gate (not range/immunity) is the cause; identify exactly which unlock(s) block it. Gate: a written repro table. No code change.
2. **Grant the arsenal where the railcar lives** — per Q1: bench-mode arsenal grant for headless admission, or an E2-board unlock. Gate: the pressure weapons are acquirable in the intended context on all three maps; e2e proves they fire and damage the railcar.
3. **Balance the fight** — tune `Balance.steamworksArsenal` damage vs railcar component HP so a competent build secures in a sane wave count. Gate: a real secure on each of the three maps (headless probe + one dev playtest), frame p95 in budget.
4. **Re-admit** — remove the three `CONTRACT_ADMISSION_EXEMPTIONS` entries; door re-admits; `skillmd-guard` green. Gate: `node scripts/gr-sim.mjs --contract e2-hill-mine …` reaches a lawful secure; same for trestle/incline.

## Integration map
Touches: `src/game/Game.ts` (arsenal gate), likely `src/game/Balance.ts` (steamworksArsenal), `src/sim/HeadlessContractSim.ts` (exemption removal), possibly the E2 contract defs. Untouched: `e1-baron` (its medal-award path is the reference), the railcar entity's damage model (already correct), all other epochs.

## Ratification questions (batched)
- Q1 progression-gate intent (with the diagnostic above). Q2 damage-feel. Both owner-only; the rest is builder work once answered.
