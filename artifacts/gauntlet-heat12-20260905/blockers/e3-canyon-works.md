# BLOCKER — `e3-canyon-works` (The Canyon Works, epoch-3-voltage)

**Class: UNWINNABLE as shipped — and the reason is ONE NUMBER, not the four this file first named.**

> ### `Balance.economy.bankCap` is **200**. The connect latch costs **330 gold**. The purse cannot hold the tour.

This was the heat's designated first question. It took two rides to answer, and the second one
**overturned the first** — including two claims this very file made. That correction is the finding.

| | |
|---|---|
| attempt 1 | generation 37, 6 sim runs, 1 scored attempt, wall 1007 s — not secured, **w3 / 106.500 s / 120 g**, `fnv1a32:8e30df40`, tape `agent-9284f916-48c7172d-7762-4e69-a80a-b6ed50c2c1cd` |
| **attempt 2 (changed plan)** | generation 60, 3 sim runs, 1 scored attempt, wall 606 s of 1400 s — not secured, **w20 / 600.000 s / 200 g**, `fnv1a32:d5528e07`, tape `agent-d5f94574-bea24874-619b-41e4-93a3-54f3718ab9eb` |
| prior | heat 11, generation 12: 3 runs, 0 scored attempts; same verdict, two caveats left open |
| evidence | `rides/e3-canyon-works.attempt-1/` and `rides/e3-canyon-works/` — each `summary.json`, `work/gauntlet-report.md`, `work/*.mjs`, `work/viewlog-*.json` |

---

## What attempt 2 proved, and what it retracted

**Retracted — survival is NOT a wall on this map.** Generations 12 and 37 both died at wave 3,
t ≈ 100, in four independent configurations, and both reported the Canyon Works as a survival wall
*as well as* an economy wall. **It is not.** Generation 60 rode to **wave 20 / 600.000 s** with the
hero at **78/150**, **six beacons built**, and **BOTH galleries powered, 2/2**. The grid completed.
The map can be survived and the objective can be built. The first version of this file was wrong
about half its own case, and the correction cost one ride.

**Sharpened — the wall is the BANK CAP against a one-way deadline.** In the rider's words:

> *"the latch needs six `sentry_beacon`s worth **330 gold** while `Balance.economy.bankCap` is
> **200**, so the tour cannot be bought on one descent at any income speed, and two descents at
> ≥ 32 s each plus an 81 wu opening commute plus 330 gold at the seams' hard 2.07 g/s ceiling comes to
> **≥ 208 s against a 180 s deadline** — measured, 180 gold panned at t = 180 and the grid completing
> 2/2 only **after** the latch had already failed."*

That is a different and much stronger claim than "the economy is slow". **No amount of income speed
can fix it**, because the binding constraint is not a rate — it is that the purse physically cannot
hold the price of the tour, so the Prospector must make **two round trips** between the seams and the
pylon line, and two round trips do not fit inside the deadline.

✓ **`bankCap: 200` verified by the operator** at `src/game/Balance.ts:824`.

---

## The constants, all re-derived on the current engine

- `now.canyonConnect {powered, required: 2, byWave: 6}` counts **gallery** consumer nodes in state
  `powered` (`src/sim/HeadlessContractSim.ts` `canyonConnectDiagnostics`). Two galleries:
  `gallery-west` (−28, 28), `gallery-east` (28, 28).
- Each gallery hangs off a three-relay chain from a single 26 W producer (`sub-hall`, (0, −44)).
  `maxSpanLength: 30` kills every shortcut (measured cross-links 33.9, 39, 48, 59), so **all six
  pylons are load-bearing**. The watt ledger sheds lamps (priority 30) so both galleries hold on 26 W
  against 28 W of demand — the grid is authored to *just* work.
- A pylon comes online **only** while an unwrecked `sentry_beacon` stands within 2.5 wu of its site.
- `sentry_beacon`: `maxCount: 6`, ladder `[25,35,45,55,75,95]` = **330 gold**. Six sites, six
  beacons — **every unit of the only defensive buildable is pre-spent by the objective**, and there
  is no turret on this map (filtered wherever `twist.powerGrid` exists).
- Waves arrive every 30 s, so the `wave <= 6` latch closes at **t = 180**.
- Missing it is terminal: `autoSecureWaveForRun` returns unsecurable while
  `!canyonConnectCompletedByDeadline`, and `postBaronDefeat` ANDs the same flag. **A run that misses
  the latch cannot secure at any wave** — generation 60 is the proof, having reached wave 20 with a
  completed grid and still been refused.
- **Exactly two of four seam anchors are ever live** — ✓ operator-verified on a fresh run:
  `gold-seam-1` (−34, 30) and `gold-seam-2` (−22, 34) `active: true`; `gold-seam-3`/`-4`
  `active: false, x: null, z: null` in every view. Ceiling **≈ 2.07 g/s** against `Balance.ts:915
  activeMax: 3`, which this map never reaches. All anchors sit ~81 wu north across the river.
- The sabotage half is real and load-bearing: `fevered_saboteur` (`waveMin 4`,
  `buildingDamageScale 1.25`) has `spawnGates` at **(±46, 38)** — *on top of the rim pylons* — and
  generation 60 watched `works.standing` fall 4 → 3 → 2 at t = 125–133 as it ate beacons off the far
  end of both chains. ✓ Roster verified by the operator in
  `assets/contracts/epoch-3-voltage/contracts.json`.

---

## Is it a defect or is it hard?

**A defect of contract data, and now a precisely located one.** Every constant is individually sane;
their *conjunction* prices an objective the map's own purse cannot carry inside its own deadline.
The engine does exactly what the contract row asks. The contract row asks for the impossible.

### Proposed corrective

> **`e3-canyon-works-payable-latch` — make the Canyon Works' connect latch fit in the purse.**
> The binding constraint is `bankCap 200 < 330 g of beacons`, so the fix must attack *that*, not the
> income rate. Cheapest first, pick ONE and re-measure the idle and played floors:
> **(a)** reprice the `sentry_beacon` ladder so six cost **≤ 200** (e.g. `[20,25,30,35,40,45]` = 195)
> — one descent, no engine change; **(b)** give this contract a raised bank cap in its twist; or
> **(c)** widen `byWave` 6 → 8 (t = 180 → 240), which buys the second descent the current price
> demands. **Do NOT touch the enemy roster or the seam anchors** — attempt 2 proved survival is not
> the wall, and (a) leaves the grid puzzle, the saboteur and the watt ledger exactly as authored.

**Suspected file:line:** `assets/contracts/epoch-3-voltage/contracts.json`, the `e3-canyon-works`
row's `twist.powerGrid` block (the beacon ladder and the `byWave` deadline); the cap it collides with
is `src/game/Balance.ts:824` (`bankCap: 200`). **No `src/` change should be needed** for option (a) —
the same shape as the `e3-moth-season` cure, which shipped as "zero src/ edits".

---

## Both of generation 12's open caveats are now closed

1. *"a pure fortress line conceding the connect latch"* — **closed by generation 37**: a run that
   misses the latch cannot secure at any wave, by any play.
2. *"the stake-first beacon chain, run to completion"* — **closed by generation 60**, which is
   essentially that line: it built all six beacons and powered both galleries, and the latch had
   already failed by the time it did.

Two heats, three generations, and the map is now fully described. **Never a third attempt.** What
this contract needs is a one-line repricing, not another rider.
