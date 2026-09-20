# heat 13 — e8-mare-claim — claude-opus-5 (generation 61)

Rig `claude__opus-5` · Claude Code CLI 2.1.257 · worldModel `sim-import` ·
engine era 5, arena hash `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`.

## The ride, in order

1. Read `public/skill.md` § THE GRAMMAR as the only authority. `MOVE_TO`, `HOLD` and `FALLBACK_IF`
   are gone; `MOVE_HERO` is the only order that positions a body and that body is **my hero**. My
   notebook's entire model of this map — "the hero is welded to the claim at (0,12), and every
   legal square of build ground lies south of it, so nothing can be built within 6 wu of the body
   that must survive" (generations 29 and 39) — is dead. The hero can now walk into her own fort.
2. Read `assets/contracts/epoch-8-orbital/contracts.json`. **The contract has been re-authored.**
   `twist.atmosphere = { regolithRequired: 4, regolithWindowWaves: 4, suitSeconds: 60,
   harmPerSecond: 5, pressurisedZoneIds: [the three dome-cluster pads] }`. Generation 39 rode a map
   whose air wall cost **one pan** and then sat inert for 488 of 600 seconds. This one wants four
   grounds in four separate windows and charges **5 hp/s** for an empty suit.
3. Idle probe → **w2 / 76.033 s**, and the tape names the cause exactly: the hero lands at (0,12),
   `inDome: null`, suit 60 → 30 → 0 across the first 60 seconds, then hp 100 → 45 → 0 in sixteen
   seconds. The air wall alone kills an orderless rider on this map now.
4. Read `E8PhysicsSystem` + `E8AirWindow` end to end (my standing move, sixth generation running).
   They hand over the whole contract: `notePan(anchorIndex)` credits a ground only while **the
   hero's** suit holds air, and `E8AirWindow.claim()` allows at most one FRESH ground per
   `4 waves × 30 s = 120 s` window. Four credits therefore cannot land before t = 360 s.
5. The plan that falls out: the suit is the hero's but **the pan is the Prospector's**. Park the
   hero inside a dome pad — where she breathes, and which is also the only build ground near her —
   and let the Prospector walk the regolith. Every pan then credits.

## Receipt

`node scripts/assay-replay-agent.mjs artifacts/heat13/opus/e8-mare-claim/attempt-1-tape.json`
reproduces `fnv1a32:5ace32f2` and all four outcome fields (`secured: true`, `waves: 20`, `gold: 70`,
`timeAlive: 600`) without riding anything. That is the **tape header's** hash; the stdout outcome
line's `fnv1a32:9163b781` is a different number by design, and comparing the wrong pair reads as a
false mismatch on a good reel. Papers: `meta.engineHash`
`09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`, era 5, `viewVersion` 2 — current
for this arena.

## Outcome

**SECURED.** `attempt-1`: **waves 20 · timeAlive 600.000 s · gold 70 · calls 60**
(kills 885, `defaultedSecure: 1`, `eventLogHash` `fnv1a32:9163b781`).
**3 sim runs (idle probe, `tune-1`, `attempt-1`), 1 scored attempt.**

Tape put forward: **`artifacts/heat13/opus/e8-mare-claim/attempt-1-tape.json`**, declared in
`gauntlet-outcome.json`'s `tape` field. It clears every envelope axis with room to spare —
**155,762 B of a 592,384 B ceiling · 60 entries · last accepted order at tick 17,681 of 18,002** —
so neither `reel_too_large` nor the F-HEAT11-1 terminal-tick refusal is in play. The secure boundary
was answered with a blank line, which is why `defaultedSecure` is 1 and the last order sits 321 ticks
inside the envelope.

The era gate latched at **t = 364.4 s**, all four grounds worked on suit air in windows 0/1/2/3 —
the earliest the authored rule permits is window 3, i.e. t ≥ 360 s, so the run took the gate in the
first window that could hold it.

The unsecured predecessor is worth recording because the diff is one idea: `tune-1` ran the same
policy with a single `MOVE_HERO` per array and died **w15 / 459.967 s / 65 g**, with the suit pinned
at 0–13 for its last minute. `attempt-1` changed exactly one thing — interleaving re-arming
`MOVE_HERO` records through the harvest chain — and the suit rode 40–60 for the rest of the run.

## What the map asked

It asked me about **air as the wall, twice over — once as an objective and once as a survival
problem** — so this contract is now a genuine, load-bearing exercise of its era's signature
mechanic, and the county's old reading of it (and my own generation-39 notebook entry) is out of
date in the most interesting possible direction. The second question cost me `tune-1` outright and
is what the scored attempt was built to answer.

The first question is the regolith run, and it is real reasoning rather than a toll. The claim
cannot be offered a secure at any wave until four of the six authored grounds have been worked
**while the hero's suit holds air**, at most one fresh ground per 120-second window. The fields that
carried it are `now.air.suit` (`seconds`, `capacity: 60`, `refillPerSecond: 4`, `harmPerSecond: 5`,
`inDome`, `empty`), `now.air.domes[]` (`air`, `breached`, `siegers`), `now.air.regolith`
(`worked`, `required: 4`, `window`, `creditedThisWindow`, `complete`) and — decisively —
`now.seams[].anchorIndex`, which is the direct handle on *which ground a pan will credit*. My
controller sorts live seams fresh-ground-first off that field, and in the secured run the four
credits landed at t ≈ 60 / 128 / 278 / 364 — windows 0, 1, 2 and 3, one apiece, exactly as authored.

The second question is the one the era is actually named for, and it is the best thing on this map:
**`now.gravity` is `{ movement: "floaty", feelG: 0.6, knockbackScale: 1.3, vacuum: true }`, and under
low gravity a knockback throws the hero clean out of her own air.** My hero's home is the centre of
`dome-cluster-pad-center`, a pad only 12 units wide. The per-view log has her at z = −6.3, +5.3,
+6.0, then later at **z = 54 and z = −63.5** — flung the width of the map by a scrum she was standing
in. Every metre outside the pad is a second off a 60-second suit, and an empty suit is 5 hp/s. That
is "transfer under changed physics" stated as a survival problem, and it is genuinely new: my
notebook has ridden this map twice and never met it, because a welded hero cannot be knocked
anywhere.

The trap inside that, which cost me `tune-1`: **`MOVE_HERO` completes at an arrival radius of 0.5,
its record goes `done`, and a `done` record is skipped for the rest of that array — so it stops
steering.** `StandingOrders.tick` clears `heroSteer` every tick and only an *active* `MOVE_HERO`
re-supplies it. So one `MOVE_HERO` per array parks the hero once and then abandons her to the
knockback until the next view, which on this map is ~8 seconds away. Views 40–48 of `tune-1` show it
plainly: `MOVE_HERO {x:0,z:0} done` while the hero sits at z = −63.5. The suit sat at 0–13 for the
last minute of the run and 5 hp/s finished her at wave 15 with the fort still standing (7 works, none
wrecked — neither `scrap_corsair` nor `sun_glare_shambler` carries `wrecker` or `thief`).

The cure, which my scored attempt rode and which secured the contract, is to **interleave re-arming
`MOVE_HERO` records through the draining harvest chain** — `[MOVE_HERO, HARVEST, MOVE_HERO, HARVEST,
…]` at small distinct offsets inside the pad. Because records drain roughly one per tick, each pan
hands the next `MOVE_HERO` a fresh chance to notice the hero has been flung and walk her back, all
inside a single array. Measured: same policy, one `MOVE_HERO` per array → suit pinned at 0–13 and
death at w15; interleaved → suit 40–60 and a wave-20 secure at 93.6/175. That is the shape the new
grammar wants, and it is not something the retired `HOLD` would have taught me.

Orders used: `MOVE_HERO`, `HARVEST`, `BUILD`, `PICK_UPGRADE`, `BLAST_AT`, `CONTEXT_ACTION upgrade`,
and a blank line at the secure boundary. **Not one E8 verb, because E8 has none** — the whole era is
answered with the player's own controls, which is precisely what ADR-005 intended.

## Winnability

Secured, and the margin was **comfortable on the objective and honestly narrowing on hit points**:
the era gate latched at t = 364.4 s with 235 seconds of slack, none of the eight works was ever
wrecked (neither roster entry carries `wrecker` or `thief`), and the suit held 40–60 of 60 for the
whole back half — but the hero came down from 167/175 to **93.6/175** over the last seventy seconds
against 36–59 live threats, so a wave-22 gate on this line would have been a real question rather
than a formality.

## Lessons for my notebook

- **The grammar change rewrote this map's central fact, and my notebook was the most confidently
  wrong thing I carried in.** Generations 29 and 39 both open from "the hero is welded at (0,12) and
  no buildable can come within 6 wu of her." `MOVE_HERO` deletes that sentence: the hero walks into
  the dome pads, which are *also* the build zones, so the fort now rings the body it defends. When a
  door ruling retires a verb, re-derive the GEOMETRY, not just the syntax — a removed verb can be
  worth more than the one that replaced it.
- **`MOVE_HERO` is not `HOLD`, and the difference is the whole contract on a knockback map.** It
  completes inside 0.5, marks the record `done`, and `tick()` skips `done` records forever — so it
  parks the hero once and then abandons her. `StandingOrders.ts:404` clears `heroSteer` every tick
  and only an *active* `MOVE_HERO` re-supplies it. The door's own comment ("hold the hero here is
  already MOVE_HERO plus silence") is true only where nothing pushes her. **Under
  `knockbackScale: 1.3` silence is not a hold.**
- **A `done` record is a spent record, so re-arming means MORE RECORDS, not more submissions.** I
  already submitted on 55 of 56 views in `tune-1` — the view cadence, not my dedupe, was the ceiling.
  The fix lives *inside* the array: interleave `MOVE_HERO` through the draining worklist so each
  drained record hands the next one a fresh chance to act. Generalise it: **when a corrective order
  can go `done`, and the condition it corrects can recur mid-array, put several of them down the
  array at distinct identities.**
- **An order that returns truthy owns the tick — so check whether the corrective BLOCKS the work.**
  `MOVE_HERO` returns `{heroMovement}` while walking (blocks everything after it) and `{}` on arrival
  (falls through). That is exactly the behaviour I want — pan when safe, walk home when displaced —
  but only because I put it before the harvest tail and after `PICK_UPGRADE`. `BLAST_AT` returns `{}`
  on success *and* on failure, so it is safe anywhere; I moved it above `MOVE_HERO` for that reason.
- **`now.seams[].anchorIndex` is the direct handle on a windowed objective, and it turns a guessing
  game into a sort.** The regolith latch counts distinct ground indices; the view publishes each live
  seam's index; so "pan a FRESH ground this window" is one filter against `now.air.regolith.worked`.
  Do not infer the ground from coordinates when the view names it. (And the published null trap
  still bites: an inactive seam carries `x`/`z`/`anchorIndex` all `null` — filter on
  `Number.isFinite` before sorting, or the whole array is refused.)
- **Read the contract JSON before the era system, and read the era system before the first order.**
  `regolithRequired: 4` / `regolithWindowWaves: 4` / `harmPerSecond: 5` are three numbers in a
  manifest that turned a map my notebook calls "half an exercise, one pan and then a 600-second
  grind" into the most load-bearing E8 board I have ridden. Four minutes of reading produced the
  entire plan; inheriting my own summary would have cost the heat.
- **Whose body a mechanic measures is the first question, and the answer moved this year.**
  `E8HumanSuit`'s own comment says it: the suit used to be the Prospector's and is now the hero's,
  "the body a rider steers with `MOVE_HERO`". But `notePan` is still called on the *Prospector's*
  pan. So the gate is a two-body condition — her lungs, its hands — and the winning shape is to
  split them: hero in the dome, Prospector on the regolith. Gen 19 said re-read `getPos`; gen 21 the
  target function; gen 61 adds **re-read which body each half of a compound gate measures.**
- **The idle floor was worth more than usual and should have been read harder.** w2 / 76.0 s with
  `inDome: null` and a suit falling on a perfect 1/s line is not a difficulty rating — it is the
  contract, stated in five rows: the hero starts six paces outside the only air on the map.
- **The node runner remains the answer to a shell that refuses redirection, and `timeout` is still
  not on macOS** (gen 48 wrote this; I burned a run rediscovering it). Write the runner before the
  probe: it made the intermediate-results law automatic, printed the envelope axes on every child
  exit, and gave me the per-view table that located the knockback in one read.
- **`durationTicks` lives on `inputLog`, not the tape root — and an envelope field that reads
  `undefined` looks exactly like a field that passed.** My runner printed a tidy envelope block with
  a silently missing tick count, and I only caught it because the assay reported `ticks: 18600` and
  I went to reconcile the two numbers. They are unrelated (the replay's internal step count vs the
  reel's declared duration), but chasing the discrepancy is what surfaced the bad path. **Assert the
  envelope fields are present, not just under their ceilings** — three of my generations lost reels
  to this envelope and none of them lost it to a typo in the reader.
- **Ride the skeleton first, then change exactly one thing — and this time I did, and it paid.**
  Seven heats running my notebook has ended on "I proved the parts and never fired the combination."
  Here `tune-1` was the unmodified gen-6→48 skeleton retargeted to the new grammar, the per-view log
  named a single cause, `attempt-1` changed that one thing, and the diff between the two runs is a
  measurement (w15 → w20, suit 0–13 → 40–60) rather than a guess. Three runs, one scored attempt,
  secured. **The discipline is not "more runs", it is "one interpretable diff per run."**
- **A contract's standing in my own name dates the reel, not the map — sixth heat running.**
  `e8-mare-claim` is listed as first secured by me on 2026-09-05, and that row was retired because
  the grammar and the contract both moved underneath it. Read `assets/engine-era.json` and the
  contract JSON as a **diff against the notebook**, not as background; on this ride the diff *was*
  the strategy.
