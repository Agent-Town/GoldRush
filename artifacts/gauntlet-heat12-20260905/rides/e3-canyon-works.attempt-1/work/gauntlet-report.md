# e3-canyon-works — heat 12, generation 37 (claude-opus-5)

Seed `e3-canyon-works-01`, trail. worldModel: `sim-import`.
This contract is my own generation 12, which did not secure (3 runs, 0 scored attempts) and left two
caveats explicitly untested. Both are now closed by measurement — one of them against me.

## What the contract actually is (verified from source, not inherited)

- `now.canyonConnect {powered, required: 2, byWave: 6}`. `powered` counts **gallery** consumer nodes
  in state `powered` (`HeadlessContractSim.canyonConnectDiagnostics:2424`). There are exactly two
  galleries: `gallery-west` (−28, 28) and `gallery-east` (28, 28).
- A gallery is reachable only down a three-relay chain per side. `maxSpanLength` is 30 and every
  cross-link is longer (switch→switch 48, rim→far gallery 59, sub-hall→switch 33.9), so **all six
  pylons are load-bearing**; there is no shorter path.
- A pylon comes online **only** while an unwrecked `sentry_beacon` stands within 2.5wu of its site
  (`syncContractPowerGrid:2363`). Nothing else brings a relay up.
- `sentry_beacon` has `maxCount: 6` and costs `[25,35,45,55,75,95]` = **330 gold**. Six sites, six
  beacons: **every beacon the map sells is consumed by the objective, and none can be spared for
  defence.** There is no turret (filtered wherever `twist.powerGrid` exists); the roster is
  `sentry_beacon, palisade, sluice, stockpile, assay_office`.
- Deadline: the latch takes `wave <= 6`, and waves arrive every 30 s (measured: wave 4 at t = 120.0),
  so the objective must be complete before **t = 180**.

**The gate is absolute.** `autoSecureWaveForRun` (`:1339-1340`) returns unsecurable while
`!canyonConnectCompletedByDeadline`, and `postBaronDefeat` (`:2089`) ANDs the same flag. Generation 12
left open the possibility of "a pure fortress line conceding the connect latch". That is now closed:
**a run that misses the latch cannot secure at any wave, by any play.** The connect is the contract.

## The two walls, measured

**Wall 1 — income against the deadline.** Seam constants are `tickGold 5 / tickSeconds 1.5 /
capacity 30 / respawnSeconds 20`, so one anchor yields 30 gold per ~29 s cycle ≈ 1.03 g/s. Exactly
**two** anchors were live in every view of every run (four are authored; `gold-seam-3/4` reported
`active: false, x: null` throughout), giving a hard ceiling of **≈2.07 g/s**. All four harvest anchors
sit 78–81wu north of the stake across the river; the Prospector walks 4.8 wu/s, so the opening commute
alone is 16.9 s. 330 gold at the ceiling therefore lands at **t ≈ 176** at the earliest — while
standing at the seams, with all six beacons still unplaced and a ~147wu placement path to walk.

**Wall 2 — survival.** The hero is welded to the stake at (0, −44) and died at **exactly t = 106.5 in
four independent configurations**: idle (t = 98.3), pure-pan, all-four-seam-rotation, and a run that
bought six palisades. The palisade ring cost 60 gold and moved the death by **zero ticks**, with a
bit-identical HP curve (100 → 76 → 52 → 20 → 0). Palisades are not the defence on this map.

## Outcome

**NOT SECURED.** Best and submitted ride: **wave 3 / 106.500 s / 120 gold / 42 kills / 12 calls**
(`eventLogHash fnv1a32:8e30df40`, `durationTicks 3195`, 12 tape entries). Put forward as my scored
attempt: `artifacts/heat12/opus/e3-canyon-works/attempt-1-tape.json` (declared in
`gauntlet-outcome.json`'s `tape` field; it is the same ride as `tune-3-tape.json` under a second
filename). **6 sim runs, 1 scored attempt.** A seventh run — the stake-first beacon chain, the line I
most wanted to measure — was still spinning at the wall and I stopped it; it wrote no tape, and I do
not know whether it was surviving or caught in an order-failure view storm. That is an unmeasured
question, not a result.

## What the map asked

It asked a real graph question, and E3's signature mechanic — the grid under sabotage — is the most
load-bearing thing on the board: it *is* the secure condition, not a scoring flourish. This is not
stationary survival wearing the era's name. The network is fully legible from the view alone:
`now.canyonConnect {powered, required, byWave, complete, failed}` is live, and
`stablePrefix.mechanics.rules` names its own source and its `completionLatch:
"one-way-at-or-before-deadline"` with `missedDeadline: "run-unsecurable"`. The reasoning it demands is
genuine graph reasoning: two disjoint three-hop chains from one 26 W producer, a `maxSpanLength` of 30
that forbids every shortcut (I checked all cross-links — 33.9, 39, 48, 59), relay nodes that boot
offline and come online only under a standing beacon, and a watt ledger that sheds by priority so the
two galleries stay powered while the lamps shed. The fields that carried my runs were
`now.canyonConnect`, `now.works.entries` (position + `wrecked` — the only way to see which pylon sites
are actually covered), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp` and `now.threats.alive`;
the orders were `BUILD`, `HARVEST` and `PICK_UPGRADE`. There is no E3 verb — the grid is something you
read and place around, never something you do. My notebook remembers this map from generation 12 and
**it still plays exactly the way I remember**: same latch, same 330-gold price, same 80wu commute,
same wave-3 death at t ≈ 100. The engine moved around it (rendering, sampler, lighting); its rules did
not, and neither did its verdict.

## Winnability

**No — not through the door from its own starting kit, and the wall is the map's economy against its
own deadline, not the grammar and not my budget:** the only secure path requires 330 gold of
`sentry_beacon` (the map sells exactly six, `maxCount: 6`, and all six are spent on pylons, so nothing
is left for defence) placed across a ~147wu path before t = 180, while the two live seam anchors sit
78–81wu north across the river and cap income at ≈2.07 g/s — which lands the 330th gold at t ≈ 176 at
the earliest, *before* a single step of the placement tour. Two honest caveats: I could not test the
stake-first beacon line to completion, and 60 gold of palisades moved the hero's t = 106.5 death by
zero ticks, so I never observed the run reach wave 6 at all.

## Lessons for my notebook

- **Re-derive a returning contract's numbers; do not inherit my own.** Generation 12 wrote that the
  latch "demands 330 gold of beacons strung across six sites" and separately quoted `required: 2` from
  the view. Both are true and they are about different things — `required` counts *galleries*, the six
  beacons are what *reaches* them — but reading my own summary I nearly planned for a two-beacon
  objective. When a past generation's prose and the view disagree in shape, go to the code.
- **Check `maxCount` against the objective's demand before pricing anything.** `sentry_beacon`
  `maxCount: 6` and six pylon sites is the whole contract in one line: every unit of the only
  defensive buildable is pre-spent by the objective. A roster cap that exactly equals an objective's
  requirement is a design statement — read it as one.
- **A cheap defence that changes nothing is a stronger result than a dead run.** Six palisades cost 60
  gold and produced a *bit-identical* HP curve and the same death tick as zero palisades. An
  intervention that moves the outcome by exactly zero is not a weak signal; it is a clean refutation,
  and it cost one run. Prefer experiments that can come back exactly zero.
- **Instrument the run, not the outcome.** Logging `{t, gold, goldPanned, hp, alive, beacons,
  powered}` at every view turned "the economy feels slow" into "60 gold at t=20.1, then flat for 40
  seconds" — which located the fault (the array drains and the next view is a wave boundary away)
  rather than merely confirming the symptom.
- **Stacking a HARVEST chain by seam id is not enough when seams re-anchor.** A depleted seam goes
  `active: false` and the live gold moves to an id my array never named, so the worklist drains into
  instant failures and the Prospector idles until the next wave boundary. Naming all four ids helped
  not at all (they failed instantly too). The real constraint is that **I cannot get a decision point
  when I need one**: respawn is 20 s and views are 30 s apart, and surprise-views back off
  exponentially (0.1, 0.2, 0.6 s… then silence). Budget the array to *outlast* the view gap.
- **Put a wall-clock guard on every controller.** My most informative run was the one I never got to
  read, because it outran the wall with no tape and no partial log. A controller that writes its log
  incrementally, or self-terminates at N seconds, would have converted that into a measurement. Six
  generations of "write the outcome file after every run" and I still lost the best run to a process
  that only reports at exit.
- **`unclaimed` with no `reason` in `winnability-receipts.json` remains a statement about the
  *standings*, never about the map** — nineteen contracts running. Generation 12 said it; this ride
  confirms it on the same contract twice. The receipt cannot encode an *economic* wall, and this is the
  clearest economic wall I have ridden.
- **Two generations, same verdict, and the arithmetic is now the deliverable.** The honest output of a
  contract like this is a priced impossibility with the constants attached, not another tape. If the
  county wants this one claimed, the cheapest lever is the seam anchors (a fifth/sixth anchor south of
  the river, or `activeMax` actually running 3), not the enemy mix — exactly the change that turned
  `e3-fairground` from unclaimable into a first-secure.
