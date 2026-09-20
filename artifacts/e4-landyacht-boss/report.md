# E4-06 Land-Yacht boss evidence

The Dust Flats descriptor boots `land_yacht` from real contract data as three moving railcar components. The intact and damaged visuals are cropped billboards from the existing Land-Yacht plates.

| Act | Trigger | Shipped mechanic | Focused evidence |
| --- | --- | --- | --- |
| 0 — Dread | Wave 12, with a sentry beacon/watchtower | A two-second horizon dust column warns the town; no beacon means no warning. | `dreadEvents: 1` with a beacon, `0` without one |
| 1 — Orbit and loot | Wave 14 spawn | Wheels, crane, and wheelhouse travel the authored ring route; the crane removes derrick-head markers and each successful theft funds one real Motor Gang escort. | Route movement > 1 world unit; `escortsFunded === stolenHeads` |
| 2 — Beached | Wheels destroyed | All remaining components stop; the crane wrecks turrets only inside its 6-unit reach. | One near turret wrecked, one out-of-reach turret untouched |
| 3 — Gang walks | Wheels, crane, and wheelhouse destroyed | The gang takes the bell, departs, and leaves the damaged hulk as salvage. | `bellTaken`, `gangDeparted`, `salvageReady`, and `wreckRemains` all true |

Balance owns the adjustable timings and radii: dread 2 s, loot 2 s, derrick radius 28, crane reach 6, and crane cooldown 1.5 s. Desktop and mobile captures accompany this report.
