# BLOCKER — `e9-dome-basin` (Dome Basin, epoch-9-redfields)

**Class: TWO blockers stacked, and the second one is an engine defect that would have refused the
win even if the rider had got it.** The play is HARD-but-rising; the *reel* is inadmissible.

| | |
|---|---|
| heat 12 ride | generation 40, seed `e9-dome-basin-01`, 5 sim runs, **0 scored attempts declared**, wall 1322 s of 1500 s |
| best | **not secured** — w16 / 499.200 s / 80 g, `fnv1a32:2b4a09b5` (against a wave-20 / 600 s gate) |
| tape | `rides/e9-dome-basin.attempt-1/work/tune-3-tape.json` · `agent-8fb761f3-6515dfc7-e4d0-4c2e-a91e-eb18b8ba22d5` (promoted by the rig, **not** claimed as a scored attempt) |
| prior | heat 11: 4 runs, best **w13 / 33 g**, no structural blocker claimed |
| **second attempt (changed plan)** | generation 58, 4 runs, 1 scored attempt, wall 686 s of 1500 s — **not secured**, best **w14 / 439.567 s / 96 g**, `fnv1a32:17e14213`, tape `tune-1-tape.json` · `agent-8e51d98b-58f6f224-e330-4e62-b071-e3d3d8d93ac2`. Neither run submittable. |
| evidence | `rides/e9-dome-basin.attempt-1/` (generation 40) and `rides/e9-dome-basin/` (generation 58) — each with `summary.json`, `work/gauntlet-report.md`, `work/tune-*-tape.json` |

## Blocker 1 — the play: HARD, and rising

Three controllers took the same seed **w14 → w15 → w16** on a strictly rising curve (499.2 s of the
600 s needed), with the mechanism understood and two named, un-run levers left on the table:

1. a **second bait wall on `rim-dome-pad-west`** — its NE corner (−28, 6) is 6.3 wu from the west
   spawn ring point against the claim's 26, so it should own the west lane exactly as the east pad
   owns the east, leaving only the north third of the board on the hero;
2. a **repair rate that keeps up with ~0.24 works/s of wrecking** — the rig mends four per rim trip
   and the wall still went 0 → 28 wrecked over the last 90 s.

The rider's verdict: *"Undecided-leaning-yes, and what stopped me was my own budget, not a wall."*
**No corrective proposed for the map.** A future heat that rides the two levers above should close it.

## Blocker 2 — the reel: `reel_too_large`, and it is an ENGINE defect (F-HEAT12-2)

**The rig's best policy cannot be admitted even when it wins.** Measured, and re-verified by the
operator:

| | |
|---|---|
| `e9-dome-basin` door envelope | `runTapeEnvelopeForContract` → `maxTicks 18002`, `maxEntries 3601`, **`maxTapeBytes 592,544`** |
| the w16 tape | **621,674 bytes** in **265 entries** — 1/13th of the permitted entry count, and 5 % over the byte ceiling |
| implied rate | ~**2,346 bytes/entry** against the envelope's assumed **160** |

`src/playbook/PlaybookFormat.ts:55` sets `RUN_TAPE_BYTES_PER_ENTRY = 160`, and the comment above it
says exactly what it was calibrated on:

> *"The retained Baron proof averages one change-point per 5.44 ticks and 140.7 bytes per entry.
> Five ticks, 160 bytes, and 16 KiB fixed overhead preserve measured margin without an open cap."*

That calibration is sound for **sparse, movement-shaped** play — a Baron proof whose entries are
mostly `(mx, my)` change-points. It is not sound for **order-array** play, where one entry carries a
whole standing-order array. Heat 11 measured the same class from the other end (a tape at 1,724,873
bytes after 131 of 600 seconds, ~4 KB/entry). Heat 12 now has the crisp version: **a tape that is
comfortably inside `maxEntries` and still refused on bytes.** The envelope's two axes disagree about
what an entry costs, so the byte axis binds first and refuses a policy class rather than a size.

This is not the F-HEAT11-1 fencepost (that was one tick, and it is cured — verified live on this
heat's probe at `durationTicks 9001`). This is its sibling and it is still open.

### Proposed corrective

> **`reel-byte-budget-per-entry` — price a reel entry by what an order array actually costs.**
> `RUN_TAPE_BYTES_PER_ENTRY = 160` (`src/playbook/PlaybookFormat.ts:55`) was calibrated at 140.7
> B/entry on movement-shaped Baron play; order-array riders measure 2,346 B/entry (this heat,
> `e9-dome-basin` w16) to ~4,000 B/entry (heat 11). Either (a) raise the per-entry byte budget to
> cover an order array, (b) budget bytes and entries independently rather than deriving bytes from
> entries, or (c) publish the byte ceiling in the view so a rider can *steer* to it instead of
> discovering it after a 600-second run. **Do NOT simply raise `MAX_JSON_BYTES`**
> (`functions/api/standings.ts:1437`): that is the transport cap, and the refusal here is the
> per-contract envelope at `:1250`.

**Suspected file:line:** `src/playbook/PlaybookFormat.ts:55` (`RUN_TAPE_BYTES_PER_ENTRY`) and `:81`
(`maxTapeBytes = RUN_TAPE_FIXED_BYTES + maxEntries * RUN_TAPE_BYTES_PER_ENTRY`); the consumer that
refuses is `functions/api/standings.ts:1250`.

## Why there is no scored attempt on this ride

The rig **declined to declare one**, and said why in its own outcome note: *"Best play tune-3
w16/499.2 s, but its reel is 621,674 B against this contract's 592,544 B ceiling (`reel_too_large`)
so it was never submittable either. No scored attempts declared: none of these is a claim."* That is
the right call — it is the same discipline that made heat 11's `e7-dead-band` rider refuse an 18001
tick tape — and it is why this contract's row reads *not secured* rather than *refused*.


## The second attempt (generation 58) — the trade is now PRICED, and it did not close

Heat 12 allowed one second ride with a changed plan. The rig took it and ran the two halves of its
own hypothesis as a **clean one-variable pair**, which is the most useful thing it could have done:

| line | hero | economy | fort | result |
|---|---|---|---|---|
| `tune-1` two-sided bait, **mend on** | held flat at **119/175 for 200 s** | frozen at **1.09 g/s** | held | **w14 / 439.567 s / 96 g** — the heat's best on this map |
| `tune-2` economy only, **mend off** | — | **2.16 g/s**, lands the entire ladder | eaten to **20/20 wrecked** | w13 / 402.267 s |
| `attempt-1` synthesis | 158/175 at t = 300 | between the two | narrowed | w13 / 419.367 s |

> *"one Prospector's feet must both pan a seam cluster 33–63 wu from the pads and replace ~0.24
> works/s of bait mass … the honest verdict is that I have priced the trade without closing it."*

**Verdict: HARD, undecided-leaning-yes.** Two heats and six controllers have not closed a wave-20 /
600 s gate, and the rig's own read is that the wall is one pair of feet against two full-time jobs,
not a defect. It also declined to submit either run — attempt-1 is the *worse* of the two and
`tune-1` is not a claim — so the county holds nothing false for this map.

Blocker 2 above (the reel byte ceiling) is unchanged and still bites: even the w14 line
would have to be re-shaped, not merely extended, to be admissible at wave 20.

**Never a third attempt.** This file is the deliverable for `e9-dome-basin`.
