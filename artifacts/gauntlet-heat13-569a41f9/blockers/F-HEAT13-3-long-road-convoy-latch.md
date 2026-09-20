# F-HEAT13-3 — `e4-long-road` is UNWINNABLE under the 1:1 grammar, by 0.359 world units, and the cure is one clause

**This answers the open desk question F-RPG-10** ("`e4-long-road` cannot land its convoy errand at all
under the 1:1 grammar — a re-ride should not be scheduled for it until that finding is ruled on").
It was ridden anyway, as the master directed, exactly as it is. This is what the rider met.

**Ride 10, generation 70, seed `e4-long-road-01`, 1,265 s wall, NOT SECURED at w14 / 420.000 s / 0 g.**
Evidence: `rides/e4-long-road/` (tape, report, views, driver log). The rider's own one-line verdict is
quoted in full in `matrix.md` and the notebook; the measurement chain is this:

| link | where | what it says |
|---|---|---|
| the secure gate | `HeadlessContractSim.ts:2354`, `:1493` | no wave can be offered a secure until `now.motor.objective.arrived` |
| `arrived`, for `kind: "convoy"` | `MotorSocket.ts:345`, `ConvoyBehavior.ts:71` | `leaderDistance >= 370 − 1e-6` — the lead Hauler within **~0.0005 wu** of (190, 0) |
| how a Hauler is sent | `HeadlessContractSim.ts:3107` | `HAUL` can only send it **to the hero's own float position** |
| where the hero can stand | measured, this ride | `MOVE_HERO` refuses (190, 0), (190, ±3) and (188.7, 0) as `UNREACHABLE_TERRAIN`, and **has no arrival snap** |
| the nearest legal rest | measured, this ride | **(191.070, −0.355)** — the latch closed **0.359 wu short** and stayed there for five minutes |

## Why the ruling did this, precisely

`Embodiment.stepTowardTarget` assigns `position = target` **exactly** inside its arrive radius.
`Hero.update` does not: the hero gets a 0.5 arrival radius and then an asymptotic deceleration with
**no snap**. So the retired `MOVE_TO`/`HOLD` could put a body *on* a point, and `MOVE_HERO` can only
put one *near* one. Every mechanic whose latch is an **equality** rather than a radius therefore
changed meaning on 2026-09-07, and this is the first one the field has caught doing it. The rider's
own generation 18 secured this same seed on 2026-09-03 by aiming the Prospector at the railhead.

It is worth being exact about the blame: **the map did not get harder, the errand lost its cursor.**
The distance half of the contract is *more* E4 than it was — 370 units walked by the body that has to
survive the walk, 6.0 wu/s of hero against outlaws capped at 4.14, a real kiting problem the retired
grammar never posed — and the rider solved the survival side (it found a corner where 60 enemies could
not touch it for 342 seconds) and the economy side (the single free `GRADE` at the west stake, 36 fuel
against a route that costs 123 ungraded and 19.7 graded). It lost on a tolerance.

## Corrective `convoy-latch-on-stop-reach` — ONE CLAUSE, not a balance change

`now.motor.objective` already publishes **`stopReach: 2.5`** on this contract, and the `haul` and `tow`
objective kinds already latch on it. `convoy` alone compares against `total - 1e-6`. Either:

1. **latch `convoy` on `MOTOR_STOP_REACH` as its two siblings already do** (`MotorSocket.ts:345`), or
2. make the railhead at (190, 0) walkable ground.

(1) is the smaller change and the one the published view already promises. Do **not** reprice the fuel
leash, the road cost or the wave gate — all three were measured this ride and all three are fair.

## A second, cheaper finding that fell out of the same ride

**An objective block can publish the reach of a *sibling* objective kind.** `now.motor.objective`
advertises `stopReach: 2.5` while the latch that actually decides this contract compares against
`>= total - 1e-6`. A rider that reads the published field and steers to it is steering to a number no
consumer on this map uses. Separately, `ConvoyBehavior.diagnostics` rounds `leaderDistance` with
`round3`, which silently turns a 1e-6 gate into a 5e-4 one — a 500× difference in a tolerance, visible
nowhere. Both are one line of `skill.md` or one line of code away from honest.
