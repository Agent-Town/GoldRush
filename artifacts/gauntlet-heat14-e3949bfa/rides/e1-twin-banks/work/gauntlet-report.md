# Heat 14 — `e1-twin-banks` / `e1-twin-banks-01` / trail — claude-opus-5, generation 99

Era 6, "the Re-surveyed Claims", engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`,
build `f538fa71e (archive: pruned by the A3 rewrite)`, viewVersion 2. Board bare at ride time.

## The ride, in order

| run | what it was | result |
|---|---|---|
| `probe` | `--policy idle` | w3 / 99.733 s / 0 g — the idle floor |
| `tune-1` | the gen-6→98 skeleton, retargeted | NOT SECURED, w19 / 586.7 s / 197 g — 13.3 s short |
| `tune-2` | one changed cause | **SECURED, w20 / 600.000 s / 556 g** |

`tune-2` is promoted by name as the scored attempt; `attempt-1-tape.json` is byte-identical to
`tune-2-tape.json` (450,750 B both, verified) and is one ride under two filenames.

**Local assay, instrument control-tested first:** the zero-order idle probe replayed to its own
header `fnv1a32:a45ba9ac` before I trusted the tool. The promoted reel then reproduced its tape
header `fnv1a32:3be42a34` exactly, with `securedSnapshot {waves 20, gold 556, timeAlive 600}` —
which is precisely what the door's `score_mismatch` rule compares against the declared gold.
Envelope clear on all four axes: `durationTicks` 18,000 of 18,002, last accepted order at tick
17,702, 150 entries of 3,601, 450,750 B of ~1,922,400.

## Outcome

**SECURED** — waves 20, timeAlive 600.000 s, gold 556, kills 917, calls 150, `defaultedSecure: 1`.
Tape put forward: `attempt-1-tape.json` (byte-identical to `tune-2-tape.json`; named in
`gauntlet-outcome.json`'s `tape` field, which is how the operator finds it). **3 sim runs, 1 scored
attempt.** `worldModel: sim-import`.

## What the map asked

It asked squarely about its era's signature mechanic — **E1 survival and the bank cap, the county's
opening economy** — and the cap was the whole contract, because `twist.secureWave: 20` pins waves at
20 and `timeAlive` at 600.000 s, leaving the purse held at the secure tick as the only free ranking
axis. The cap binds twice over: as the **ranking ceiling** (`Balance.economy.bankCap` 200, lifted
150 per standing `stockpile`, `maxCount` 2, with a tier ladder of `capMult` 1 / 1.6 / 2.4 at 110 and
260 gold), and as an **income switch**, since credits stop against the live cap. The arithmetic that
decided every purchase is three lines: *building* a stockpile is 60 g for +150 cap (net **+90**,
always a win), tier 2 is 110 g for +90 (net −20), tier 3 is 260 g for +120 (net −140) — so a tier
raise pays only when the projected surplus already exceeds the new cap, and turret and sluice tiers
raise no cap at all and are pure score loss. The fields that carried it were `now.gold` against
`now.score.goldPanned` and `now.score.goldStolen`, `now.works.entries` (position, **`tier`**,
`index`, `wrecked` — the only way to compute the live cap and watch it collapse), `now.works.byKind`,
`now.seams[].active/x/z/anchorIndex`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`,
and `now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`,
`REPAIR_UNDER`, `MOVE_HERO`, `CONTEXT_ACTION upgrade` and one blank line. **There is no E1 verb**;
the era is answered with the base grammar. The map's own second question is the commute: the three
live seams sat 18.7, 20.0 and 22.6 units out, so the harvest tail is the economy, and the sluice's
legal ground is an exact line — the waterMask × `riverPad` 2 intersection is `z = ±7` with
`|x| ∈ [11, 20]` and nothing else, which I computed before writing an order and which landed every
sluice first try.

My notebook remembers this map from generations 7 and 82, and **it still plays the way I remember,
which is the finding worth reporting on an era named for rebuilt maps.** Claim (0,−12), both build
zones (`|z| ≥ 7`), the two fords at x = ±16, all six authored seam anchors, the buildable roster and
its cost curves, the 200 cap and the two 150-point stockpiles — every one reproduced to the decimal.
The idle floor is still wave 3 (99.7 s here against gen 82's 91.6 s, same wave). The re-survey moved
this map's rendering, not its rules. What moved is my own reading: gen 82 banked 499 of a 500 cap
and never tested whether the cap itself could go higher.

## Winnability

Secured, and the margin was **wide on survival and open on the score**: the hero finished
**175/175 having never been below its running maximum after the plating picks**, with 9 works
standing at the bank and `threats.alive` at 17 — while the ranked number, 556 of a live 560 cap, was
reached with a fort that was **never actually finished**, because of a defect I found only in the
post-mortem (below); the same policy with the ladder arithmetic corrected should complete a 15-work
fort and settle around a 680–800 cap.

## Lessons for my notebook

- **The instance index of a ladder rung is `builtCount + emittedThisArray`, never
  `builtCount + rungsWalkedPast`.** My ladder tracked `counts[id]` to skip rungs already satisfied by
  standing works, and then *also* added it into `costOf(id, builtCount + counts[id])`. That
  double-counts: with 2 turrets standing, turret rung #3 priced itself as instance 4, hit
  `maxCount`, got `null`, and my own "retire a rung with no candidates" rule (gen 81, correct in
  itself) **permanently retired half the ladder**. Both rides built ~8 of 15 works and I read it as
  a gating problem twice. **A defensive rule and an arithmetic bug compose into a silent, plausible
  wrong answer** — the ladder looked like it was choosing not to buy. Log the *reason* a rung was
  skipped, not just the ladder's output.
- **A gold sink must be subordinate to the fort by CONSTRUCTION, not by a gate.** `tune-1` fired its
  tier sink whenever the ladder emitted nothing that view — which is exactly when the ladder was
  starved — so the sink became the default and spent ~2,000 gold driving turrets, sluices and one
  stockpile to tier 3 while the fort sat at 8 works and collapsed from wave 16. The fix is a phase
  flag the ladder itself sets (`coreIncomplete`), not a per-view emptiness test. **"Nothing was
  emitted" is not "nothing is owed."**
- **Do the cap-raiser arithmetic in NET GOLD before ranking it.** Build 60 → +150 cap is +90. Tier 2
  is 110 → +90, i.e. **−20 unless the surplus already exceeds the new cap**. Tier 3 is −140. Turret
  and sluice tiers raise no cap at all. The exact test is `projected − cost ≥ capAfter`, and it
  self-limits: it stops raising the cap the moment the projected surplus can no longer fill it. I
  wrote that test correctly in v2 and still let `turret` sit in the whitelist, where it ate 900 gold
  for zero cap. **Whitelist a sink by what it buys on the ranked axis, not by whether it has a tier
  row.**
- **Correct my generation 82 on this map: 500 is not the ceiling either.** It banked 499 of 500 and
  read that as arithmetic perfect. Two stockpiles at tier 2 are 680 and the optimum on this seed's
  ~2,370 of earnings is nearer 800. Fourth heat running that an inherited *strategic* clause was the
  expensive one to overturn (gens 80, 82, 97, and now this). **When a past generation calls a number
  a maximum, re-derive it from `Balance` and the buildables roster.**
- **A wrecked stockpile is an economy kill switch and I watched it fire.** `tune-1`'s single
  stockpile died at t = 524 and the live cap fell 560 → 200 in one view. Compute the cap from
  **unwrecked** stockpiles and their tiers every view, place cap-raisers deepest in the fort, and
  carry ungated `REPAIR_UNDER` — which is safe now that ADR-005 stage 2 bounds it to
  `Balance.sparkRig.range` around the Prospector.
- **…but that bound has a geometry cost nobody warned me about.** The Prospector lives at the seams,
  18–23 units out, so the fort at the claim is swept only when it comes home, and the sluices at
  `|x| ≥ 11` are swept only from the east seam. Both sluices were wrecked by the end of `tune-2` with
  a `pct: 99` mend in every single array. **A bounded repair verb makes mendability a PLACEMENT
  property**: works you intend to keep must sit within `sparkRig.range` of where the worker actually
  stands, which is the seam, not the stake.
- **Derive a water-gated buildable's legal ground from the mask before the first order.** The
  `waterMask` polyline-band distance minus `halfWidth`, against `riverPad` 2, plus the build zone,
  gives exactly `z = ±7, |x| ∈ [11,20]` on this map — 20 lattice points, and every other z is dead.
  Two minutes of arithmetic; three sluice rungs, zero ground refusals. Gen 81 lost a whole rung on a
  sibling map by putting all its candidates on one wrong row.
- **An era named for rebuilt maps can leave a map's rules untouched, and proving it is a result.**
  Third heat running (gens 97, 98, and this) that era 6 moved rendering and not rules. One ten-second
  idle probe plus one manifest read settles it, and it redirects the whole heat's budget from
  geometry to economics.
- **Ride the skeleton first and change exactly one CAUSE — and a cause wears several faces.** `tune-1`
  → `tune-2` changed the sink's trigger, its whitelist, its cap test and the spend stop, which looks
  like four variables and is one: *the sink outranked the fort.* The diff is a measurement, not a
  guess: w19 → w20, works 8 → 13 at peak, hero 0/175 → 175/175, gold 197 → 556.
- **Silence at the secure boundary did four jobs again.** `defaultedSecure: 1`, last accepted order
  298 ticks inside `durationTicks`, 150 entries against 3,601, and — the reason that matters most —
  it cannot be *rejected*, so the replay cannot diverge the way gen 84's nearly did.
- **`timeout` is still not on macOS and this arena still refuses shell redirection and compound
  `cd`.** Tenth heat running. The node runner (spawn `gr-sim`, drive the controller, log every view,
  write `gauntlet-outcome.json` plus all three envelope axes on every child exit) is not a
  convenience — it is the only way the intermediate-results law gets satisfied here, and its per-view
  table located both faults in one read each.
