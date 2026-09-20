# e7-relay-valley — heat 13, generation 78 (claude-opus-5)

seed `e7-relay-valley-01` · trail · era 5 `09838c35…` · viewVersion 2 · worldModel `sim-import`

## How the ride went

Idle probe (w7 / 231.4 s) published two facts that reset everything my notebook
believed about this map:

1. `stablePrefix.mechanics.rules` carries a new rule, `contract_hero_grit`:
   `twist.hero.maxHpBonus: 300`, so **the hero stands up with 400 hit points, not
   100.** The briefing states the reason outright — "no relay site on either
   ridge comes within 31wu of the claim."
2. The roster is `rogue_automaton` + `data_rustler`, and neither carries
   `wrecker` (`thief: true` forces `wrecker = false`). The idle run's loss was
   `hero_down` with `worksHp.max: 0` throughout. **Works cannot be attacked and
   the claim is not a loss condition. The only thing that has to survive is the
   hero — and `MOVE_HERO` can walk it anywhere.**

That converts the map's historic wall into a non-problem. Three of my previous
generations opened from "nothing can be built within 31.24 wu of the welded
hero, so not one gold buys a point of defence." The hero is not welded any more.
I walked it 36 units north into `relay-site-r3` (x 20..30, z 36..46) and built
the fort *around it* there — and because the same fort's first work is a
`sentry_beacon` standing inside a relay site, the era gate and the defence are
literally the same 25-gold purchase.

One controller, first ride, secured.

## Outcome

**SECURED** — waves **20**, timeAlive **600.000 s**, gold **110**, calls **75**
(903 kills, `defaultedPicks: 0`, `defaultedSecure: 1`).

Tape put forward: **`attempt-1-tape.json`** (declared in `gauntlet-outcome.json`'s
`tape` field). It is a byte-identical copy of `tune-1-tape.json` — **one ride
under two filenames**, promoted by name because the controller secured on its
first ride and the stop rule ends the heat there.

- **sim runs: 2** (one `--policy idle` probe, one controller ride)
- **scored attempts: 1**

Envelope, measured off the reel: `durationTicks` 18000, last accepted order at
tick **17915**, **75** entries, **263,853** bytes — clear on all three axes.
Papers: engineHash `09838c35…`, era 5, viewVersion 2.

Tape header `eventLogHash` is `fnv1a32:41eea3b5`; the stdout outcome line's is
`fnv1a32:ea5b188c`. Those differ by design — an assayer replay must reproduce
the **tape's**. I could not run the local assay as a receipt: this arena's
`scripts/assay-replay-agent.mjs` fails to resolve its own vite root
(`ENOENT … scripts/asset-diet.mjs`). Determinism is therefore **unverified
locally** and rests on the county's replay.

## What the map asked

It asked its era's signature mechanic **squarely, and for the first time on this
contract the mechanic is also the cheapest thing on the board**. E7 is playbooks
and the Echo. `now.playbookUse.objective` reads `relay`, and
`E7PlaybookLatch.allowsSecure` returns `lit.size > 0`, which the sim ANDs into
the secure gate — no wave count secures this claim until a relay site is lit **by
a running program**. `syncProgramRelays(running, works)` lights a site when a
standing, unwrecked work of `POWERED_RELAY_KINDS` (`turret`, `sentry_beacon`)
sits inside an authored `relay-site` rectangle *while a program holds the wheel*.
So the loop is genuine L1 ladder work: submit the orders you want repeated (they
are the demonstration), get a powered work standing in the zone, then
`PLAYBOOK_USE` a fresh name, which records those arrays as a tape and re-installs
them so the sim runs your own demonstration. I answered the next view with a
blank line so the program kept the wheel rather than being cleared by an accepted
submission. Measured: recorded and used at **t = 14.73 s**, `programRuns: 1`,
`relaysLitByProgram: ["relay-site-r3"]`, `uses: 1`, `repeats: 0`, all three
refusal counters 0. The fields that carried it were
`now.playbookUse.{objective, objectiveMet, relaysLitByProgram, shelf, uses,
runningProgram, refusals}` and `now.works.entries[].{id, position, wrecked}`; the
order was one `PLAYBOOK_USE`. The honest qualifier is that the gate is
**front-loaded and cheap** — one 25-gold beacon and one order inside the first
fifteen seconds of a 600-second contract, and the era never asks again. The other
585 seconds are ordinary survival, carried by `now.hero.hp/maxHp/x/z`,
`now.works.byKind`/`entries`, `now.seams[].active/x/z` (inactive seams publish
`x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`,
`now.threats.alive` and `now.pendingOffer` — with `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `MOVE_HERO` and one blank line.

**My notebook remembers this map from generations 26, 38 and 59, and it does not
play the way any of them remember.** The geography reproduced exactly — claim
(0,12), four relay sites at z 36..46, four harvest anchors, the 31.24 wu
subtraction. Everything else moved. Generation 26 reported no relay, no playbook
and no Echo in `now` and called it RESKIN: dead. Generations 38 and 59 rode a
**welded 100-hp hero** and both concluded the run was a pure attrition race the
draft had to pay for; both of those sentences are now false. The hero has 400 hp
*and* legs, so the unfortifiable claim is simply somewhere I do not have to
stand.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero never
fell below **371/475 (78.1 %)**, finishing 371/475 at level 28; **zero of ten
works were ever wrecked** across 903 kills and `goldStolen` finished at **0**;
the full ladder (4 turrets, 6 beacons) stood; `threats.alive` peaked at 51; and
the era gate latched 585 seconds before the bank. The one number with real slack
left on it is **gold — 110 of 780 panned** — and since waves and `timeAlive` are
both pinned by the wave-20 secure, gold is the only free ranking axis; a bank
gate that stopped spending ~90 s out would have banked far more. The stop rule
correctly ends the heat at the first secure, so that margin stays on the table.

## Lessons for my notebook

- **A contract can be re-balanced, not just re-grammared, and the tell is a new
  rule id in `stablePrefix.mechanics.rules`.** `contract_hero_grit`
  (`twist.hero.maxHpBonus: 300`) quadruples the hero's hit points on the exact
  map whose three prior failures I attributed to a 100-hp ceiling. Nine heats
  running I have said "grade the notebook clause by clause"; the new clause is
  that **`mechanics.rules` is where the county publishes a balance answer to a
  finding I filed.** Diff the rules array against the notebook, not just the
  view's key set — three rules here, and one of them was the whole heat.
- **The briefing's `rules` prose named the fix and cited my own measurement.**
  "you stand up with 400 hit points, not the usual 100, because no relay site on
  either ridge comes within 31wu of the claim." That is generation 26's
  subtraction, quoted back at me as a design justification. **Read the briefing
  for sentences that answer a prior generation's complaint** — when the county
  fixes something a rider reported, it says so in the contract's own words.
- **When a ruling retires a verb, ask what the replacement makes REACHABLE.**
  Sixth heat running I have written that the 1:1 grammar change was free on a
  stationary-hero board. Here it was not free, it was *decisive in my favour*:
  `MOVE_HERO` deletes the sentence three of my generations opened from. The
  unfortifiable claim stops mattering the moment the body that must survive can
  leave it. This is now the second map (with `e8-mare-claim` and
  `e4-gusher-county`) where the parity ruling turned an unfortifiable stake into
  a fortifiable post.
- **Read the roster for what it OMITS, then ask what that makes the loss
  condition.** No wrecker on either entry means works are invulnerable *and* the
  claim is not a loss condition — the idle log's `worksHp.max: 0` and its
  `hero_down` surprise said both in one read. That deletes `REPAIR_UNDER`,
  palisades and every decoy idea, makes the fort a monotone investment, and —
  the part I nearly missed — **frees the hero to stand anywhere on the map.**
  Eleventh contract running this read has paid, and it has never paid this much.
- **Look for the purchase that is simultaneously the era gate and the defence.**
  The cheapest `POWERED_RELAY_KIND` is a 25-gold `sentry_beacon`; putting the
  fort's first rung inside a relay site made the objective free. Before pricing
  an era gate as an errand, check whether a rung you were buying anyway can
  stand where the gate is measured.
- **After `PLAYBOOK_USE`, answer the next view with a blank line.** An accepted
  submission clears `runningProgram`, and `syncProgramRelays` only lights a site
  while a program holds the wheel. One `PLAYBOOK_USE` + one silent view latched
  it on the first attempt with `repeats: 0` and zero refusals — and on a `relay`
  map repeats buy nothing, so one use is the whole cost.
- **Ride the skeleton first and change nothing — ninth heat where that is the
  whole discipline, and the sixth in a row where it secured on ride one.** Two
  runs total. The reading budget went to the contract JSON, `E7PlaybookLatch`,
  `POWERED_RELAY_KINDS` and the roster; the riding budget went to the unmodified
  generation-6→77 skeleton (draft first under replace semantics with a
  plating-first scorer; a cumulatively-gated ladder; more candidate spots than
  slots with a refusal blacklist partitioned into GROUND — poison the coordinate
  — and ECONOMY — retry, poison nothing; `Number.isFinite` seam filtering before
  any sort; one seam drained in a block before walking; a free `BLAST_AT` per
  ready window; a blank line at `pendingSecure`) plus the one thing this board
  does differently. Ten builds, zero stalls, zero wrecked.
- **`BLAST_AT` above `MOVE_HERO`, always.** `MOVE_HERO` returns truthy and owns
  the tick while walking, so anything under it is dead during travel; `BLAST_AT`
  returns `{}` on success *and* failure, so it is safe anywhere and belongs above
  the traveller.
- **What I left on the table, named precisely: 670 gold.** I panned 780 and
  banked 110, because the ladder kept buying to the end. On a fixed-wave secure
  gold is the ONLY free ranking axis. The principled fix is generation 74's bank
  gate — allow a rung of cost `C` only if
  `(gold − C) + rate × (secureTime − t) ≥ cap + 5`, with `rate` measured live off
  `score.goldPanned`. Eighth generation to name this and the fourth to lose most
  of the axis to it; the gate is written and I keep not carrying it forward.
- **Verify the receipt instrument before reporting its silence as a defect.**
  `assay-replay-agent.mjs` failed on its own vite root here, not on my reel. Say
  "determinism unverified locally" plainly rather than implying either a clean
  or a dirty receipt.
