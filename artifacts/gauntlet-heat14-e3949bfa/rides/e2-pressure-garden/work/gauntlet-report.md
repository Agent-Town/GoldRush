# Gold Rush Gauntlet — heat 14, era 6 · `e2-pressure-garden` / `e2-pressure-garden-01`
### rig `claude__opus-5` · Claude Code CLI 2.1.272 · generation 101 · worldModel `sim-import`

Engine of this arena: `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` (era 6, "the Re-surveyed Claims", pin #8).

## Method, briefly

Two runs: a ten-second idle probe and one controller. The reading budget went to the
contract JSON, `Balance` (cap / tiers / steal / seam / wreck), the roster's flags, the
era-pin ledger read as a diff against my notebook, and `runTapeEnvelopeForContract`. The
riding budget went to the unmodified generation-6→100 skeleton with the one thing this
board does differently — the cap arithmetic — put into the *first* controller, because on
a contract whose ranking axes are all pinned but gold there may not be a second ride.

**Ranking arithmetic, done before writing an order.** `twist.secureWave: 12` pins waves at
12 and `timeAlive` at 360.000 s, so the purse held at the secure tick is the entire
remaining score. `banked = min(earnings − spend, liveCap)`, and `liveCap = 200 +
150·capMult(tier)` per **unwrecked** `stockpile` (max 2). Building a stockpile is 60 g for
+150 cap — net **+90**, always a win when cap-bound. Tier 2 is 110 g for +90 — net **−20**,
worth it only when the surplus would otherwise exceed the new cap. Tier 3 is 260 g for
+120: never. So the plan was two stockpiles early, the smallest fort that holds twelve
waves, a bank gate from t = 145, and a **hard build stop at t = 315** with no bypass —
because generation 85 secured this exact map banking 18 gold when an `urgent` bypass let a
40 g sluice land five seconds before the secure tick.

---

## Outcome

**SECURED** — `e2-pressure-garden` / `e2-pressure-garden-01`, trail difficulty.

| | |
|---|---|
| waves | **12** (the contract's secure wave) |
| timeAlive | **360.000 s** |
| gold | **227** |
| kills | 385 |
| calls | **74** |
| sim runs | **2** (one idle probe, one controller) |
| scored attempts | **1** |
| worldModel | `sim-import` |

**Tape put forward:** `artifacts/heat14/opus/e2-pressure-garden/attempt-1-tape.json` —
declared in `gauntlet-outcome.json`'s `"tape"` field. It is a **byte-identical copy**
(270,657 bytes, verified equal) of `tune-1-tape.json`: the first controller secured, the
stop rule ends the heat at the first SECURED outcome, so that tune **is** the scored
attempt. One ride under two filenames.

**Receipt.** The local assay instrument was control-tested first on the zero-order idle
probe, which replayed to its own header (`fnv1a32:a45ba9ac`). The securing reel then
replayed to **`fnv1a32:395a7a37`**, matching its tape header exactly, with
`securedSnapshot {waves: 12, gold: 227, timeAlive: 360}` — which is what the door's
`score_mismatch` rule compares against the declared gold. (The stdout outcome line's
`fnv1a32:f9ddeb08` is a different number *by design*; comparing that pair reads as a false
mismatch on a good reel.)

**Envelope**, computed from `runTapeEnvelopeForContract` rather than the charter's summary
of it: `durationTicks` 10,800 of a **18,002** ceiling, last accepted order at tick 10,739,
74 entries of 3,601, 270,657 bytes of ~1,938,784. All four axes clear with wide margin.
The charter's published `16 KiB + maxEntries × 160` formula omits the live function's
second `maxOrderEntries × (2400 − 160)` term and understates the byte ceiling by ~3.3×; a
rider throttling against the published floor would be optimising against a number the
county has already fixed.

---

## What the map asked

Its era's signature mechanic is **E2 pressure with hazard — vent-or-boom resource
management** — and it asked me nothing about it, for the **eighth time across my
generations**, on the map that is *named* for the mechanic. I verified that on this run's
own data rather than inheriting it: the union of `now` keys is `blastReadyInMs · gold ·
hero · needsRider · orders · prospector · score · seams · threats · timers · wave · weapon
· works`, and a regex for `/pressure|coal|boiler|vent/` over `now` returns **false** —
while `stablePrefix.mechanics.rules` publishes all four of `pressure_generation`,
`pressure_bands`, `pressure_auto_vent` and `pressure_powers`, `mechanics.buildables` lists
`boiler_house` at 70 g × 3, and `stablePrefix.map.coalSeams` names three seams at (−12,39),
(−5,43) and (3,39) on the authored `coal-bed-terrace`. `mechanics.interactables` is empty.
The subsystem is fully declared and completely unobservable, the grammar has no vent verb,
and the auto-vent spends the resource for you above 80.

**On the cure the charter names:** `boilerHouse.coalSeconds` really has moved 12 → 36 in
`Balance` (I read it). Through the door that is three times as long a process I cannot
observe, cannot steer and cannot spend — so it does not soften the finding, it triples the
duration of the thing that is invisible. Generation 84 sharpened the *reason* on the
Incline (`PressureArsenalSystem`'s three weapons are constructed but gated on
`hasResearch && hasBaronMedal`, neither of which a plain-boot door run supplies), which
makes 210 gold of boiler a **strictly dominated purchase** here rather than an unreadable
gamble. I built none.

What the contract *does* ask, in its own right, is a good **opening-economy and one-pocket
geometry question**, and it asks it well. Gold starts at 0, the first turret costs 50, an
unattended hero is dead 57 seconds in, and the nearest seam is 16.2 units up-slope — so the
whole opening is "can you turn thirty seconds of quiet into a gun." It can, because the
loss stake at (−12,12) sits *inside* the lowest terrace (`boiler-terrace`, x −36..36,
z 7..16), so a ring needs no compromise: six works landed with zero `out_of_zone` and zero
`out_of_reach`. The roster is a three-way squeeze that shapes the ring — `rail_tough` from
the south gate (0,−46), funnelled by the river through the single `garden-crossing` ford at
x ∈ [−6,6]; `steam_wrecker` (`buildingDamageScale: 2.5`, a real wrecker) from the east and
west gates at (±46,20); `coal_thief` (`thief: true`) from (0,46). The fields that carried
the run were `now.gold` against `now.score.goldPanned` (the pair that separates a dead sink
from a starved economy, and which read the ending exactly), `now.works.entries` (position,
`tier`, `index`, **`wrecked`** — the only way to compute the live cap and watch it
collapse), `now.works.byKind`, `now.seams[].active/x/z` (an inactive seam publishes `x`,
`z` and `anchorIndex` as **`null`**, and one non-finite number refuses the whole array
silently), `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, and
`now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`,
`BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO` and one blank line. **Not one E2 verb, because E2
has none.**

**Does my notebook still describe this map?** Yes in its bones — and on an era named for
rebuilt maps, proving that is itself the result. Generations 9 and 85 rode this seed, and
every structural number reproduced: the claim, all six harvest anchors, all four build
zones, the ford, the three spawn gates, the wave-12 / 360.000 s secure, the 200 bank cap
and the two 150-point stockpiles, and a wave-1 idle death (57.100 s here). None of era 6's
eight pins touches this contract — pin #4, the playability wave, re-parameterised
`e2-trestle` and `e2-incline` only — and the twist is still exactly
`{pressureEnabled, secureWave: 12, enemyRoster[3]}`. The re-survey moved this map's
rendering, not its rules. What moved is my own reading of it: generation 85 banked **18**
gold here; the same map, the same secure, banked **227**.

---

## Winnability

Secured, and the margin was **wide on survival and still open on the score**: the hero never
fell below 81.7 % of its running maximum (finishing 143/175), `threats.alive` peaked at 44
against a 60 cap, `goldStolen` was **0** all run, and nothing was wrecked until t = 321 of
360 — while the ranked number, 227 of a 500 cap, lost roughly 110–140 gold to two causes I
can name to the second. **(1)** My harvest tail carried a 32-unit reach cap from the claim,
and from **t = 335.6 `score.goldPanned` froze at 630** for the last 24 seconds because every
live seam had re-anchored outside that cap and my fallback named two inactive near seams
instead of the nearest live one at any distance — a reach cap that excludes every live seam
turns the tail into a no-op, worth ~50–80 gold. **(2)** Both cap-raisers were wrecked in the
endgame (stockpile #1 at t = 330, #0 at t = 353.97), dropping the live cap 500 → 350 → 200
and leaving the purse **stranded at 227 above its own ceiling**, where no further credit is
possible — the generation-82 signature, worth another ~30–60. Neither is a wall in the map,
the grammar, the economy or the door; both are one line of controller each.

---

## Lessons for my notebook

- **A reach cap on the harvest tail must fall back to the nearest LIVE seam, not to a
  hardcoded near one.** I capped the tail at 32 units from the claim (gen 100's cure for
  chasing a seam across the map) and gave it a fixed two-seam fallback for the respawn gap.
  When the live set re-anchored entirely outside the cap, the fallback named two *inactive*
  seams and `goldPanned` froze at 630 for the last 24 seconds of a gold-ranked contract.
  Gen 100's rule is right for a temporary gap and wrong for an exclusion: **rank live seams
  by distance, prefer those inside the cap, but always name the nearest live one when the
  cap admits none.** A guard that can select an empty set is a wipe generator (gens 42, 51,
  59) — this is the same failure wearing a distance filter.
- **Place the cap-raisers where the fort can actually keep them, and count the cap from
  unwrecked ones every view.** I did the second half (gen 82) and it is what made the
  ending legible; I did not do the first. Both stockpiles sat inside the turret ring and
  still died at t = 330 and t = 354, taking the cap from 500 to 200 with 227 in the purse —
  a purse stranded *above* its own ceiling, a state no amount of panning escapes. On a
  gold-ranked map, a cap-raiser is not a building, it is the scoreboard: it belongs behind
  the deepest work on the board, and it deserves the last repair.
- **The hard build stop worked exactly as designed and should be standing equipment.**
  Generation 85 banked 18 of 500 on this map because an `urgent` bypass let a 40 g sluice
  land five seconds before the secure tick. A flat `t < 315` floor with **no bypass**,
  sitting above a bank gate that itself only arms at t = 145, cannot do that — the last
  build landed at t ≈ 264 and the purse climbed from 115 to 227 afterwards. A bank gate is
  arithmetic and can be argued with; a hard floor cannot.
- **Do the net-gold arithmetic on a tier ladder before ranking it, and it will often say
  no.** stockpile build 60 → +150 cap = **+90**; tier 2 110 → +90 = **−20**; tier 3 260 →
  +120 = **−140**. I emitted no tier upgrade at all here and that was correct: the surplus
  never approached 500, so every tier would have been pure score loss. Gen 99 spent ~900
  gold driving turrets and sluices to tier 3 on a map whose tiers raised no cap; the
  general form is **whitelist a sink by what it buys on the ranked axis, not by whether it
  has a tier row** — and on a cap-bound contract, check that the surplus can still fill the
  cap you are about to raise.
- **Verify a notebook finding from the current run's own view, even when you are confident.**
  I have written "E2 pressure is published and unplayable" seven times, and it would have
  been cheap to assert it an eighth. One command over this run's view0 made it a
  measurement: `now`'s key union carries no pressure/coal/boiler/vent field, while
  `mechanics.rules` publishes all four pressure rules and `interactables` is empty. That
  also let me say something *new* — the charter's `coalSeconds` 12 → 36 cure is real in
  `Balance` and, through the door, only triples the duration of the unobservable.
- **An era named for rebuilt maps can leave a map's rules untouched, and proving it is a
  result.** Fourth heat running (gens 97, 98, 99, 101) that era 6 moved rendering and not
  rules. The cheap procedure is now fixed: read `assets/engine-era.json`'s pins as a
  per-contract diff, check whether any pin names *your* map (here pin #4 named the Trestle
  and the Incline, not this one), then confirm with a ten-second idle probe against the
  notebook's remembered floor. Four minutes, and it redirects the whole heat's budget from
  geometry to whatever is actually free — here, the economy.
- **Ride the skeleton first and change nothing — seventeenth heat where that is the whole
  discipline, and the fourteenth in a row where it secured on ride one.** Two runs total.
  The one thing I changed for this board was the cap plan, and gen 85 had already named why
  it had to go in the *first* controller: on a contract whose ranking axes are pinned except
  gold, the ride that gets the receipt is the ride that sets the row, and the stop rule
  makes you choose before you know. Eighteen of my generations end on "I proved the parts
  and never fired the combination"; the cure keeps turning out to be reading, not riding.
- **Control-test the assay before believing it, then compare the right pair of hashes.** The
  idle probe replayed to its own header first (instrument verified), and only then did the
  securing reel's `fnv1a32:395a7a37` mean anything. Six of my generations have tripped on
  comparing the replay against the *outcome line's* hash instead of the *tape header's*;
  they are different numbers by design. And read `securedSnapshot` — it is precisely what
  the door's `score_mismatch` rule compares against the declared gold.
- **The blank line at `pendingSecure` did its four jobs again, fourteenth contract running:**
  it banked the default (`defaultedSecure: 1`), it left the last accepted order 61 ticks
  inside `durationTicks`, it held a 76-view run to 74 entries, and — the reason that matters
  most — it **cannot be rejected**, so the replay cannot diverge the way generation 84's
  nearly did when rejected submissions inside the choice window (invisible to the tape,
  visible to the sim) desynchronised a perfectly good reel.
- **The runner before the probe, eleventh heat running.** This arena refuses shell
  redirection and compound `cd`, and `timeout` is not on macOS. A node runner that spawns
  `gr-sim`, drives the controller, logs every view to a compact table and writes
  `gauntlet-outcome.json` plus all three envelope axes on every child exit is not a
  convenience — it is the only way the intermediate-results law gets satisfied here, and its
  per-view table is the entire evidence base of this report, including the exact tick at
  which the purse stopped crediting.
