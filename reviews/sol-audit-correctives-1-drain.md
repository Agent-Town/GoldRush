# Drain — sol/audit-correctives-1@7788d5c7 → main (2026-07-11) — VERDICT: MERGED (+1 drain-side fix)
Bundle: F-SOL-SIM-004 (death = tick-end outcome boundary — the death screen/telemetry/score equal true end-of-tick state) · F-SOL-SIM-005 (Claim Ledger no longer cancels a player pause on close) · B5-MP-01 (render-visualY REMOVED from the canonical multiplayer hash — sim truth only) · B5-MP-02 (scripted rail arrival on PLANAR distance).
## Gate history
Branch-tree red (restoreSuspend=false) = STALE BASE — cut pre-chain, lacked the canonical-unlocks fix; proven by ancestry check. Composed-tree red = a REAL one-line defect IN the planar fix: the arrival snap sat behind a velocity guard that zeroes inside the heading epsilon → scripted enemies could never cover the last centimeter (its own new test caught it: expected 10.01, got 10.00). Drain-side fix: arrival checked BEFORE the velocity guard (commented in place, Enemy.ts scripted step).
## Evidence
sim-fixed-step 8/8 (incl. the never-before-green planar case) · sealing 12/12 (mp-02 + en-01 + m1-01 + run-suspend) · tsc/build green · clean merge, zero conflicts.
