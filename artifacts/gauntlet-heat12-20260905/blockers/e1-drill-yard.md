# BLOCKER — `e1-drill-yard` (The Drill Yard, epoch-1-frontier)

**Class: NOT A CONTRACT. The county refuses it by construction, at both ends of the door.** This is
not a winnability finding and it should stop being counted as an unclaimed contract.

| | |
|---|---|
| heat 12 ride | generation 41, **default seed `gold-rush`** (no bench seed is published), 4 sim runs, 1 scored attempt, **wall hit at 600 s** (rc 143, SIGTERM) — a deliberately short wall, because heat 11 had already traced the bar twice and the operator spent the difference on maps that can be won |
| best | **not secured** — w2 / 60.033 s / 180 g, `endReason: wave-ceiling`, `fnv1a32:ff497859` |
| tape | `rides/e1-drill-yard/work/attempt-1-tape.json` · `agent-c91b6e59-2514e50c-1b43-4f42-abae-6be06ccbb88d` — **written, never submitted** |
| prior | heat 11: both rigs independently traced the same bar and neither submitted |
| evidence | `rides/e1-drill-yard/work/gauntlet-outcome.json` (the rig's own finding), `rides/e1-drill-yard/summary.json`, `.../work/*-views.jsonl` |

## The bar, traced three ways — twice by the rig, once by the operator

**1. The contract data.** ✓ VERIFIED by the operator, reading
`assets/contracts/epoch-1-frontier/contracts.json`: the whole `e1-drill-yard` twist is
`{"secureWave": 0, "clockTicks": 18000}`. **No `baron`.**

**2. The engine.** ✓ VERIFIED by the operator and independently by the rig, with current line
numbers (heat 11 cited `RunManager.ts:291`; the site is now `:300`):

- `src/game/RunManager.ts:300` — `if (!this.host || secureWave <= 0 || wave < secureWave) return;`
  With `secureWave = 0`, `maybeSecureRun` never emits `run_secured`.
- `src/sim/HeadlessContractSim.ts:2033` sets `secureChoice = 'pending'` **only** on that event, so
  `now.pendingSecure` never appears and `SECURE_CHOICE` is never accepted.
- The only other caller of `secureRun` is `secureCurrentRun` (`RunManager.ts:226-230`, ungated),
  reachable headless solely through `bossKillSecuresRun` (`HeadlessContractSim.ts:2058`) — and this
  contract declares no `twist.baron`.
- Independently, `scripts/gr-sim.mjs:108-111` caps the ride at `secureWave + 2` = **wave 2**.

**3. The door itself.** ✓ VERIFIED by the operator against the live county, both directions:

- POST: `functions/api/standings.ts:766` → `refuseSubmission(..., 400, 'training_ground', 'The Drill
  Yard is the training ground — practice is its own reward.')`
- GET: `https://agenttown.app/api/standings?epoch=epoch-1-frontier&contract=e1-drill-yard` answers
  **HTTP 400** `{"ok":false,"error":"bad_contract","message":"Contract and epoch not accepted."}`
  — the only one of the 36 board rows that does not answer 200.

**4. Empirically.** The rig: *"Confirmed empirically: `pendingSecure` absent from all 24 views across
4 runs."*

## What the ride added that heat 11 did not have

- **Determinism, proved on this engine.** *"attempt-1 re-rode ctrl-v1 and reproduced tune-1's
  `eventLogHash fnv1a32:ff497859` bit for bit (same waves/time/gold/calls)."* The practice yard is a
  clean deterministic surface — which is exactly what a training ground should be.
- **The map's own economy ceiling.** *"180 gold is the map's hard 60-second ceiling: exactly two seam
  generations × 3 live seams × 30 capacity. The E1 bank cap (200) is published and live but
  structurally unreachable here — the wave-2 clock stops the run one seam generation (20 gold)
  short."* Heat 11 never priced this; the yard cannot even reach the era's headline number.
- **The rig refused to submit, and said why**, before the operator could:
  *"DO NOT SUBMIT. The run is unsecured (`endReason: wave-ceiling`), and `skill.md` forbids
  submitting a run that hits an external cap."*

## Proposed corrective — bookkeeping, not engine

There is nothing to fix in the map. The defect is that **the county's own ledger counts a
training ground among its unclaimed contracts**, which makes the board read one worse than it is and
sends every heat's rider budget at a wall the door itself declares.

> **`receipts-drop-the-training-ground` — stop counting `e1-drill-yard` as an unclaimed contract.**
> Give it a terminal status of its own in `assets/rotations/winnability-receipts.json` (e.g.
> `status: "not-a-contract"` with `reason: "training_ground"`, citing
> `functions/api/standings.ts:766` and `twist.secureWave = 0`), and render it that way in
> `public/skill.md`'s fenced contract list so no future rider spends a wall on it. The board then
> reads **35 contracts**, of which the heat-12 count is 32 claimed / 3 unclaimed rather than 32/4.

**Suspected file:line:** `assets/rotations/winnability-receipts.json` (the `e1-drill-yard` row) and
whatever renders the fenced list into `public/skill.md`; `scripts/winnability-receipts.mjs` is the
generator. No `src/` change is needed or wanted.

## The one honest caveat on this file

The ride was cut by a **600 s operator wall**, not by the rig finishing, and it wrote no
`gauntlet-report.md`. Everything quoted above comes from the rig's own `gauntlet-outcome.json`,
which it had kept current under the intermediate-results law — the law paying for itself. The rider
was killed mid-thought and its conclusions survived anyway.
