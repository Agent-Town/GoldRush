# the-claim · e1-the-claim-01 · trail · era 6 "the Re-surveyed Claims"

rig `claude__opus-5` · model `claude-opus-5` · Claude Code CLI 2.1.272 · worldModel `sim-import`
engine hash `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` · era 6 · viewVersion 2

## Ride log

| run | kind | result |
|---|---|---|
| `probe-idle` | `--policy idle`, zero orders | NOT secured, w2 / 81.767 s / 0 g / 36 kills — the idle floor |
| `tune-1` = `attempt-1` | `ctrl-v1.mjs`, the skeleton retargeted | **SECURED, w10 / 300.000 s / 498 g / 36 calls** |

Two runs, one scored attempt. The securing ride was the first controller of the heat; the stop
rule ends the heat at the first SECURED outcome, so `tune-1-tape.json` is promoted by name (a
byte-identical copy sits at `attempt-1-tape.json`, and `gauntlet-outcome.json`'s `tape` field
names it — one ride under two filenames).

### Pre-ride reading (four minutes, and it was the whole plan)
- `twist` declares **only** `secureWave: 10`. So waves are pinned at 10 and `timeAlive` at
  300.000 s by the gate, and the county's ordering (secured → waves → gold → time) leaves
  **gold as the only free axis**. The ride is an economy problem wearing a survival map's clothes.
- `Balance.economy.bankCap: 200`; `stockpile` costs 60, `maxCount: 2`, `capBonus: 150` each.
  Two stockpiles are therefore not an economy purchase, they are a **+300 ranking purchase**.
- Roster: the contract declares none, so `View.ts:899` fabricates the almanac's `claim_jumper`
  line for an empty roster — the almanac composition is a placeholder here, not the mix. The live
  view later shows `threats.wreckers` up to 2 and `threats.thieves` up to 3, so works ARE
  attackable and a stockpile can be wrecked (which would drop the live cap under the purse).
  Answer: one ungated `REPAIR_UNDER 99` in every array, and both stockpiles inside the turret ring.
- Geometry: claim (0,12), six authored anchors, three live — (7.5,6.5) at 9.3 wu and (-9,6.7) at
  10.4 wu from the claim, both on the north bank; the z ≈ −7 anchors are across the river behind a
  single ford at x=0 and were never used. `Number.isFinite` filtering is mandatory: an inactive
  seam publishes `x`/`z`/`anchorIndex` as `null`.

### What the ride actually spent
4 works, 240 gold: `turret`(-5,14) → `stockpile`(0,14) → `turret`(5,14) → `stockpile`(-3,17), all
four standing at full HP at the bank, **0 wrecked**. Plus ~20 gold of proportional mends. The
emergency rungs (beacons, turrets 3–4, palisades) were carried but never latched, because the
hero never fell below its running maximum and `works.wrecked` never left 0 — every gold they would
have cost stayed on the board as score.

Economy: `score.goldPanned` finished at **740**, `goldStolen` **0**. It was earned at 2.8 g/s while
the purse had headroom (740 g by t = 263.6); after that the purse sat at 498 and panning credited
nothing for the last 36 seconds — the cap binding exactly as authored.

## Outcome

**SECURED.** `{"secured":true,"waves":10,"timeMs":300000,"gold":498,"kills":298,"calls":36,"defaultedPicks":0,"defaultedSecure":1,"eventLogHash":"fnv1a32:6d830a40"}`

- waves **10** (the gate's own wave), timeAlive **300.000 s**, gold **498**, calls **36**.
- Tape put forward: `artifacts/heat14/opus/the-claim/attempt-1-tape.json` (byte-identical to
  `tune-1-tape.json`; declared in `gauntlet-outcome.json`'s `tape` field).
- **2 sim runs, 1 scored attempt.**
- Era papers: the reel stamps era **6** and engine hash `540b49af…`, the arena's own pin.
- Envelope, computed from `runTapeEnvelopeForContract` rather than the brief's summary formula
  (the live ceiling is 3.3× the brief's, because order-bearing entries are billed at 2,400 B):
  ticks 9,000 / 18,002 · last accepted order at tick **8,770 < 9,000** (no terminal-tick order —
  F-HEAT11-1 avoided) · entries 36 / 3,601 · bytes 103,604 / 1,938,784. All four axes clear.
- Local assay: the instrument was control-tested on the zero-order idle probe first (it reproduced
  that reel's own header hash `fnv1a32:a45ba9ac`), then the securing reel replayed to
  **`fnv1a32:79bb2437`** — equal to its own tape header — with `securedSnapshot {waves 10, gold 498,
  timeAlive 300}`. That snapshot is what the door's `score_mismatch` rule compares, and it equals
  the declared gold. Note the outcome line's hash (`6d830a40`) is a different number from the
  tape's by design; comparing the wrong pair reads as a false mismatch.

## What the map asked

It asked squarely about its era's signature mechanic — **E1 survival and the bank cap, the county's
opening economy** — and the cap was the contract, not the survival. It binds twice over. It is the
**ranking ceiling**: with `twist.secureWave: 10` pinning waves at 10 and `timeAlive` at 300.000 s,
the purse held at the secure tick is the entire remaining score, and `stockpile` (60 g, `maxCount`
2, `capBonus` 150) is the published lever that moves it from 200 to 500. And it is an **income
switch**: credits stop against the live cap, which I measured doing exactly its authored job —
`now.gold` reached 498 at t = 263.6 and `score.goldPanned` froze at 740 for the last 36 seconds
while the Prospector kept panning into a full bucket. So the whole design question was "how little
can I spend and still hold ten waves", answered by a four-rung ladder (240 g) plus emergency rungs
that never latched. The fields that carried it were `now.gold` against `now.score.goldPanned` (the
pair that separates a dead sink from a starved economy), `now.seams[].active/x/z/anchorIndex`,
`now.works.entries`/`byKind` (placement and the ladder's state), `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers/thieves`, `now.orders[].status/reason` (the refusal blacklist's source)
and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`,
`BLAST_AT`, `REPAIR_UNDER` and one blank line; **there is no E1 verb** — the era is answered with
the base grammar. My notebook remembers this map from generations 2, 54 and 74, and **it still
plays exactly the way I remember, which is the finding worth reporting on an era named for
rebuilt maps**: the claim is still (0,12), the six anchors are unchanged to the decimal, the two
near seams are still 9.3 and 10.4 wu out, the idle floor is still wave 2 at ~82 s (81.767 here),
the cap is still 200 with two 150-point stockpiles, and the ladder prices are untouched. The
re-survey moved this map's rendering, not its rules. What moved is **my own reading of it**:
generation 74 secured here at 200 gold and reported that "200, the bank cap itself, is the
arithmetic maximum this contract can publish". That was wrong — it is the *default* cap, and two
60-gold stockpiles make the maximum **500**. Same seed, same secure, 200 → 498.

## Winnability

Secured, and the margin was **wide on survival and two gold short of arithmetic perfect**: the hero
never dropped below its running maximum across all 42 views and finished 175/175, all four works
stood unwrecked at the bank with `threats.alive` peaking at 23 of a 60 cap, and the only number with
anything left on it is the purse — **498 against a live cap of 500**, missed by a single 2-gold
proportional mend that landed late enough that the capped economy could never re-earn it.

## Lessons for my notebook

- **Correct my own generation 74 on this map: 200 is the DEFAULT cap, not the arithmetic maximum.**
  It secured `the-claim` at 200 and wrote that no rider can beat that row on any axis. Two
  60-gold stockpiles (`capBonus: 150`, `maxCount: 2`) make the ceiling **500**, and the same seed
  and the same secure banked **498**. Third heat running that an inherited *strategic* clause was
  the expensive one to overturn (gen 82's declined stockpile on twin-banks, gen 80's priced
  impossibility on the canyon works, this). **When a past generation calls a number a maximum,
  re-derive it from `Balance` and the buildables roster before inheriting the ceiling.**
- **An era named for rebuilt maps can leave a map's RULES untouched, and saying so is a result.**
  Era 6 is "the Re-surveyed Claims" and I opened braced for moved ground. The claim, all six
  anchors, the live-seam set, the ladder prices, the cap and the idle floor (81.767 s vs ~82) all
  reproduced to the decimal. Ten seconds of idle probe plus one manifest read settled it, and the
  heat's real work turned out to be the economy, not the geometry. **Grade the notebook clause by
  clause: here every geometry clause held and the strategic clause was the dead one — the inverse
  of the last three heats, where the control clauses were dead and the geometry held.**
- **Gate the emergency half of the ladder on real pressure and it stays unspent.** I carried six
  extra rungs (two beacons, two turrets, more beacons) behind a latch on
  `hp/maxHp < 0.72 || threats.alive > 28 || works.wrecked > 0`. None fired, so **380 gold** of
  contingency (25+35+95+45+125+55 at this board's live prices) stayed on the ranked axis while the
  plan still had an answer if the board turned.
  On a contract where gold IS the score, **conditional defence is worth more than cheap defence**:
  the comfortable run banks it and the hard run buys it.
- **`REPAIR_UNDER` repairs PROPORTIONALLY, so a late mend of a scratch is a permanent score cost.**
  The run's only gold dip (420 → 418 at t = 240) was a 2-gold mend of a scratched work — and once
  the purse is within one pan-tick of the cap, the economy cannot re-earn it. That 2 gold is
  exactly the gap between my 498 and the 500 ceiling. Ungated mending is still right on an
  attackable board (it is why nothing was ever wrecked and why the cap-holding stockpiles survived),
  but **on a gold-ranked contract the mend belongs behind a `works.wrecked > 0 || hp < maxHp*0.6`
  gate in the closing minute**, not behind `hp < maxHp`.
- **The almanac's composition line is a placeholder when the contract declares no roster.**
  `View.ts:899` returns `[{id:'claim_jumper', …}]` for an empty roster, so reading it as the mix
  says "no wreckers, no thieves" on a board that fielded up to 2 wreckers and 3 thieves. Generation
  82 learned not to read an early `threats.wreckers: 0` as a roster fact; the sharper form is
  **when the contract declares no roster, neither the counter NOR the almanac tells you the mix —
  assume the default roster brings wreckers and thieves by mid-run and carry the mend.**
- **Silence at the secure boundary did four jobs again, tenth-plus contract running.** It banked the
  default (`defaultedSecure: 1`), it cannot be *rejected* (gen 84 nearly lost an admissible reel to
  rejected submissions inside the choice window, which are invisible to the tape and visible to the
  sim, so the replay diverges), it left the last accepted order at tick 8,770 of 9,000, and with the
  cheap dedupe it held a 42-view run to 36 entries and 103 KB.
- **Control-test the assay before believing it, then read the right pair of hashes.** The idle probe
  replayed to its own header first (instrument verified), then the securing reel reproduced
  `fnv1a32:79bb2437` — the TAPE header's hash, not the outcome line's `6d830a40`. Five of my
  generations have tripped on that pair. And read `securedSnapshot`: it is precisely what the door's
  `score_mismatch` rule compares against the declared gold.
- **Compute the envelope from `runTapeEnvelopeForContract`, never from the brief's summary of it.**
  This charter published a `16 KiB + maxEntries × 160` formula and a heat-12 casualty at 621,674 B.
  The live function adds `maxOrderEntries × (2400 − 160)`, so the real ceiling here is **1,938,784 B**
  — 3.3× the summary. A rider throttling its own control against the published floor is optimising
  against a number the county already fixed, *because of that casualty*.
- **Ride the skeleton first and change nothing — fourteenth heat where that is the whole discipline,
  and the eleventh in a row where it secured on ride one.** The reading budget went to the twist,
  the cap constants, the buildables roster and the envelope function; the riding budget went to the
  unmodified generation-6→86 skeleton (draft first under replace semantics with a plating-first
  scorer, maxHp 100 → 175; one ladder in *strategy* order with plan-time affordability read off
  `buildables[].costs[builtCount]`; more candidate spots than slots with a refusal blacklist
  partitioned into GROUND — poison the coordinate — and ECONOMY — `insufficient_gold`, retry and
  poison nothing; a rung with no candidates left RETIRED rather than stalling the ladder behind it;
  `Number.isFinite` filtering on seam coordinates before any sort; alternating blocks of six across
  the two nearest live seams; a free `BLAST_AT` per ready window; a come-home `MOVE_HERO` gated on
  displacement; a blank line at `pendingSecure`). Four builds, zero ladder stalls, zero refusals.
- **On this board the retired verbs cost nothing and I checked rather than assumed.** The hero starts
  on the claim, has no drift, and wants to stay, so silence is the hold and the unemployed Prospector
  drifts to the hero — exactly where `HOLD` used to park it. `MOVE_HERO` was emitted only as a
  displacement guard and never had to fire (the hero sat at (0,12) in all 42 views). Ninth heat
  running on a stationary-hero board.
