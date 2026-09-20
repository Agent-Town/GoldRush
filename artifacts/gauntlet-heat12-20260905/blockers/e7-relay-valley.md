# BLOCKER — `e7-relay-valley` (Relay Valley, epoch-7-signal)

**Class: HARD, not unwinnable — and it moved a long way toward winnable this week.** The map's own
objective is no longer the obstacle; survival is, and the rider priced the gap at roughly **80
seconds of HP**.

| | |
|---|---|
| heat 12 ride | generation 38, seed `e7-relay-valley-01`, 4 sim runs, 1 scored attempt, wall 919 s of 1500 s (rig stopped itself) |
| best | **not secured** — w15 / 460.333 s / 40 g / 39 calls, `fnv1a32:f9866fc8` |
| tape | `rides/e7-relay-valley.attempt-1/work/tune-3-tape.json` · `agent-211bb7c1-655ec773-5a6b-4afd-8665-5871fa07cff4` (**promoted by the rig in `gauntlet-outcome.json`, not by filename** — see F-HEAT12-1) |
| prior | heat 11: not secured in 4 runs, best **w4 / 130.8 s / 200 g**; that ride is the one that found F-HEAT11-1 |
| **second attempt (changed plan)** | generation 59, 2 runs, 1 scored attempt, wall 554 s of 1400 s — **not secured**, w10 / 307.867 s / 70 g, `fnv1a32:56777ed0`. **Worse than the first attempt**, and the rig says why in its own words: two of its three faults were controller bugs, not the map. |
| evidence | `rides/e7-relay-valley.attempt-1/summary.json`, `.../work/gauntlet-report.md`, `.../work/ctrl-v{1,2,3}.mjs`, `.../work/tune-*-views.jsonl` |

## What the rider tried

An idle probe (w2 / 79.3 s), then three controllers in a measured ladder:
**idle w2 → v1 w13 / 398.5 s → v2 (thief decoy) w14 / 429.9 s → v3 w15 / 460.3 s.** Four runs, one
promoted as the scored attempt. The rig stopped itself at 919 s of a 1500 s wall.

## What the map did

**The E7 objective latch is discharged, reliably and cheaply.** On *every* controller ride:
`now.playbookUse.objectiveMet: true`, `relaysLitByProgram: ['relay-site-r3']`, `programRuns: 1`, at
**t = 11.6 s** on the cheap line. This is the direct consequence of the week's change — the
`e7-playbook-rows` drain (`b38d60295`) added `PLAYBOOK_USE` and the signal-system composition to the
four Signal Era maps, and `e7-player-playbook-parity` made `E7PlaybookLatch.ts` the single four-rule
secure decision. **Heat 11 rode this map with no playbook verb at all and reached wave 4.** Heat 12
reached wave 15 with the objective met in under twelve seconds.

What ends the run now is pure attrition, and the rider's diagnosis is specific:

> *"no buildable on this contract can come within 31.24 wu of a hero welded at (0,12) with a 175-hp
> ceiling, so a wave-20 (600 s) secure has to be paid for entirely out of the draft, and the draft's
> one repeatable heal (`field_dressing`, filler, infinite stacks, 0.3×maxHp) is only offered once
> fewer than three non-filler cards remain eligible; my best ride was level 21 with six non-fillers
> still in the pool at t = 460 and needed roughly four more levels (≈ t = 540) to open the fillers it
> would then have ridden to 600 — so the gap is ~80 seconds of HP, not a structural refusal."*

## Is it a defect or is it hard?

**Hard.** The rider explicitly declines to call it a wall — *"Undecided-leaning-yes on the map and
firmly not-my-budget-alone"* — and names three untried levers that all push the right way: a second
stockpile decoy to split the west lane, farming `order_failure` surprises for more `BLAST_AT`
windows, and burning the junk cards faster by keeping `beacon_dynamo`, `sluice` and `assay_office`
out of the eligible pool so the fillers open earlier. **No corrective is proposed.** The lesson is a
notebook lesson, and it is in generation 38.

If a future heat wants this one claimed, the shape of the ride is now known: discharge the latch in
the first twelve seconds (it is cheap), then spend the whole remaining budget on the **draft-pool
composition problem** — making `field_dressing` eligible before t ≈ 540 rather than after it.

## The envelope, re-measured

The rig confirmed F-HEAT11-1's cure holds on this contract, from the code rather than from the note:
`twist.clockTicks 18000` now feeds `runTapeEnvelopeForContract`, giving **maxTicks 18002** against a
wave-20 secure at tick 18000. The contract that discovered the fencepost is no longer exposed to it.


## The second attempt (generation 59) — worse, and honest about why

The changed plan cost more than it bought, and the rig booked that against itself rather than the
map:

> *"Undecided-leaning-yes, and what stopped me was my own budget — **two of my three faults were
> controller bugs, not the map**: the era gate is cheap and provably closable (t = 34.5), the economy
> is fine (810 panned by t = 300), and gen 38 already showed w15/460 s on this seed, but I spent run 1
> on a refused-array freeze … and run 2 on a hypothesis the constants already refuted."*

Three facts came out of it that are worth more than the wave count, and two of them are **traps for
every future rider**:

1. **`now.seams` publishes `x`/`z` as `null` for an inactive seam.** A terminal `HOLD` built from
   those coordinates carries non-finite numbers, **the whole order array is refused**, and the run
   silently freezes — `goldPanned` sat at exactly 75 for 110 seconds. This is the same shape the
   operator hit reading Canyon Works' view (`gold-seam-3/4`: `active: false, x: null, z: null`); it is
   published, documented nowhere, and it costs a whole run in silence.
2. **A second stockpile cannot help**, because `Balance.steal.maxConcurrentCap` is 4. The rig spent a
   run on a hypothesis its own constants already refuted.
3. **F-HEAT12-2 corroborated on a second contract**: a per-tick order-failure surprise loop burned
   **259 entries and 960 KB against this contract's ~576 KB reel ceiling.** The byte budget is not an
   `e9-dome-basin` peculiarity; it is a property of order-dense play anywhere.

**Verdict unchanged and now doubly-sourced: HARD, not unwinnable.** The best line on this map remains
generation 38's **w15 / 460.3 s**, with the objective latch discharged in under twelve seconds and
roughly 80 seconds of HP between it and a wave-20 secure. **Never a third attempt.**
