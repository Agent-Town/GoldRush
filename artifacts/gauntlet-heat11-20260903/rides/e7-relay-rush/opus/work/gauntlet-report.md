# Relay Rush — heat 11, generation 33 (Claude Opus 5)

- contract `e7-relay-rush` · seed `e7-relay-rush-01` · trail · era 5 (`a607a81f…`) · viewVersion 1
- worldModel: **sim-import** — I read `src/systems/InterferenceFrontSystem.ts`,
  `src/sim/HeadlessContractSim.ts`, `src/playbook/PlaybookFormat.ts`, `src/game/Balance.ts`,
  `scripts/gr-sim.mjs`, `assets/contracts/epoch-7-signal/contracts.json`,
  `assets/contracts/winnability-receipts.json`.
- controller: `ride.mjs` (authored here) · per-view log: `tune-1-tape-log.json`

## Pre-ride reads (two minutes, in this order)

1. `winnability-receipts.json` → `{epoch-7-signal, e7-relay-rush, status: "unclaimed"}` with **no
   `reason`**. Seventeen-for-seventeen: a green light.
2. The manifest. **No `twist.secureWave`** — so the gate falls through to
   `Balance.run.secureWave = 20` (a 600-second ride), and `gr-sim`'s wave ceiling is 22. That single
   absence also decides the door verdict; see §Winnability.
3. `engineDependencies: [{ dep: "interference-front-consumer", status: "missing" }]`. **Wrong
   again** — one idle probe published a complete live `now.interferenceFront`.

## The ride

| run | kind | result |
|---|---|---|
| 1 | `--policy idle` probe | not secured — w2 / 81.333s / 0g / 0 calls. Died at t=81, **nine seconds before the first front**, exactly as the county's audit note records. |
| 2 | `ride.mjs` → `tune-1-tape.json` | **SECURED — w20 / 600.000s / 200g / 68 calls / 644 kills / `fnv1a32:1c343c70`** |

Two sim runs, one scored attempt. `attempt-1-tape.json` is a **byte-identical copy** of
`tune-1-tape.json` (sha256 `2d3e1dc3ac69c4ef…` both) — the same single securing ride, promoted by
name under the brief's promotion clause. The stop rule ends the ride at the first SECURED outcome,
so it was not re-ridden and I hold no self-replay receipt; the assayer's replay is the determinism
proof.

Timeline of the objective (from the per-view log):

| t | event |
|---|---|
| 26.07 | turret at (−25,45) → **r2 lit** (the claim stands inside relay-site-r2) |
| 80.00 | sentry beacon at (−45,41) → **r1 lit** |
| 90.03 | sentry beacon at (25,41) → **r3 lit** — target of 3 met, 180s early |
| 148.20 | sentry beacon at (45,41) → **r4 lit**, the insurance light |
| **270.03** | **front 3 arrives — `litAtDeadline: 4`, `objectiveMet: true`, latched** |
| 600.00 | wave 20, `pendingSecure`, `SECURE_CHOICE bank` |

## Outcome

**SECURED.** `{"secured":true,"waves":20,"timeMs":600000,"gold":200,"kills":644,"calls":68,
"defaultedPicks":0,"defaultedSecure":0,"eventLogHash":"fnv1a32:1c343c70"}` — waves **20**,
timeAlive **600.000s**, gold **200** (pinned at the bank cap from wave 11), calls **68**.
Tape put forward: `attempt-1-tape.json`. **2 sim runs, 1 scored attempt.**

**A first secure for `e7-relay-rush`** — and one caveat the operator must weigh before submitting:
the reel reports `durationTicks 18001` against this contract's `18000`-tick envelope, so the door
will very likely refuse it `reel_duration_exceeded`. The secure is real; the reel may not be
admissible. Detail in §Winnability and in `gauntlet-outcome.json.doorRisk`.

## What the map asked

It asked me about **the interference front**, squarely and expensively, and **the county's RESKIN
measurement of this contract is out of date on this build**: E7's front is composed headless, fully
published, and it *gates the secure*. `InterferenceFrontSystem` is the whole consumer — schedule,
mute, relay lighting and objective latch — and `HeadlessContractSim:1119` ANDs
`interferenceFront.objectiveAllowsSecure` into `autoSecureWaveForRun`, so a run that misses the
deadline is unsecurable at *every* later wave. The rule reads in `now`, no source import needed:
a wall of static crosses west→east every `cadenceSeconds: 90` over `crossingSeconds: 20` with
`halfWidth: 6`, and **three of the four relay sites must carry a standing turret or sentry beacon at
the instant the third front arrives — t = 270.000s exactly**, sampled once and latched either way.
That is a genuine "expand under deadline" problem, because the four sites are strung along a 100wu
ridge (r1 x −50..−40, r2 −30..−20, r3 20..30, r4 40..50) while the hero is welded to the stake at
(−25,41) and the single order actor — the Prospector — must pan, build and walk with the same feet.
The lit set is *live state, not a latch*: a wrecked light goes dark and the deadline reads whatever
stands, which is why I bought a fourth light at t=148 as insurance for a deadline 122 seconds away.
The map's one kindness is that the claim sits **inside** relay-site-r2, so the fort lights a site for
free and the errand is two walks (20wu and 50wu) rather than three.

View fields that carried it: `now.interferenceFront.{sites[].lit/litBy/muted, litCount, frontsArrived,
secondsToNextFront, deadlineFront, relayTarget, deadlineResolved, litAtDeadline, objectiveMet,
phase, centerX}`, plus `now.works.entries` (position + family — the only way to see which rung
landed and which refused), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`,
`now.hero.hp/maxHp`, `now.threats.alive`, `now.pendingOffer`/`now.pendingSecure`. Orders: `BUILD`,
`HARVEST`, `REPAIR_UNDER`, `PICK_UPGRADE`, one `SECURE_CHOICE`. **There is no E7 verb** — the
front is answered entirely with epoch-1 grammar, and that is fine: it is a *placement* mechanic, not
an action one.

Two honest qualifiers. First, the mute itself was nearly inert for me: the band is 12wu wide moving
at 6wu/s, so it stands over any one turret for about two seconds every ninety, and `mutedWorkSteps`
never cost me a wave. The front is a *deadline* here, not an adversary. Second, once the latch
closed at t=270 the remaining eleven waves were ordinary stationary survival at the 200-gold cap
with `threats.alive` pinned at its 60-enemy ceiling and nothing left to decide — the reasoning is
front-loaded into the first 150 seconds. Call it **half a contract of real E7 and half a hold.**

## Winnability

Secured, and the margin was **as wide as this contract can be measured — while the door envelope is
the thing that is thin**: the hero **never dropped below 100, its running maximum, across all 69
views**, finishing 175/175; **zero of ten works were ever wrecked**; the deadline latched with all
**four** sites lit against a target of three, 122 seconds early; gold was capped from wave 11 —
health, defence, objective and money all had spare capacity at once. The one thing with no margin at
all is the reel: `e7-relay-rush` declares no `twist.secureWave`, so
`PlaybookFormat.runTapeEnvelopeForContract` computes its `+2` inclusive-endpoint slack only inside
`if (twist?.secureWave)` and hands this contract a flat `MAX_PLAYBOOK_TICKS = 18000`; the secure
lands at wave 20 = t 600.000s = tick 18000, `gr-sim` records the `SECURE_CHOICE` there, and
`durationTicks = lastEntryTick + 1 = 18001`. **No rider policy can avoid that** — there is no
earlier secure window, riding shorter forfeits the run, and a rejected non-`SECURE_CHOICE` array at
the boundary cannot buy a cheaper tick. This is the same envelope defect that refused generations 24
and 25, now confirmed on a third contract and a third epoch; the fix is one `if` in
`PlaybookFormat.ts`, not a change to the map, the grammar or the economy.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen.** Still
  the first two lines of JSON I read; still never wrong.
- **A silent `twist.secureWave` is now a *two*-sided tell, and I should read it as both at once.**
  Generation 24 learned side one: the gate falls through to `Balance.run.secureWave = 20`, so a thin
  manifest means a 600-second contract, not a 360-second one. Side two, which cost gens 24/25 their
  reels and costs this one too: that same silence skips the `+2` envelope slack in
  `runTapeEnvelopeForContract`, so **any** secure of such a contract reports `durationTicks 18001`
  against `18000` and is inadmissible however it is played. **Check the envelope before choosing the
  contract's plan, and say so in the outcome file rather than letting the operator discover it at the
  door.**
- **`engineDependencies: "missing"` is now wrong five times in seven era rides** (E5 deepwater-claim,
  E5 regatta, E6 glow-mesa, E8 mare-claim, E7 relay-rush) against two right (E4 long-road, E10
  last-claim). Here it disclaims `interference-front-consumer` while `InterferenceFrontSystem` runs
  headless, publishes a fifteen-field diagnostics block in `now`, **and gates the secure**. One idle
  probe settles it in ten seconds; give a "missing" that contradicts a live `now` key zero weight.
- **When the era's mechanic is a placement deadline, buy one more than the target.** The lit set is
  live state, not a latch (`readSites` re-reads every step), so a wrecked light un-lights its site and
  the deadline reads whatever stands at that instant. A fourth beacon at 45 gold insured a one-way
  latch worth the whole contract. Ask of any latched objective: *is the quantity it samples a latch
  or a live count?* — and if it is live, over-buy.
- **The audit's RESKIN label is a measurement of the build it was taken on, and the idle probe is
  why it looked like one.** Idle died at t=81.3, nine seconds before the first front at t=90 — so the
  mechanic was never *reached*, not absent. An audit that samples only the idle ride cannot see a
  mechanic whose first event is at t=90. Generation 15 learned that a stale audit is settled by one
  probe of `now`; the sharper version is **check whether the audit's evidence could physically have
  reached the mechanic's first event.**
- **Put the claim's own zone in the ladder first and get a light for free.** The stake at (−25,41)
  sits inside `relay-site-r2`, so the fort's first turret discharged a third of the objective at
  t=26 with no walk. `stakeMarkers × buildZones × objectiveSites` is the same intersection move that
  found the Incline's pocket — now solved for an *objective* rather than a defence.
- **One BUILD trip in flight, re-issued verbatim until `works.entries` shows it standing.** Gen-13's
  "a stack of gold-gated BUILDs is a commute generator" and gen-28's plan-time affordability compose
  into one rule that needs no suffix arithmetic: emit the *next unbuilt* rung only when
  `gold >= cost` right now, re-issue it each view, and let `works.entries` (not your own counter)
  retire it. Ten rungs, ten first-try landings, across 50wu and 70wu errands.
- **Give every rung a patience budget.** The eight palisade rungs I appended sat outside every build
  zone and refused forever; a six-attempt skip stepped past all of them without stalling the ladder,
  which is exactly the failure that cost me the Trestle in generation 10. Carrying junk at the tail
  of a ladder is free when the ladder can skip.
- **A wave-2 idle death still means nothing.** Twelfth map running: idle died at 81s and the first
  controller rode the same seed to 600s at full health. But this time the idle probe earned its keep
  in a different way — it published the entire `interferenceFront` block in view 0, including the
  cadence, the target, the deadline ordinal and all four site rectangles. **Read the idle probe for
  the mechanic's published constants, not for the difficulty curve.**
- **Write the outcome file after every run, before the analysis.** Fourteenth generation saying it,
  eleventh doing it — and this ride added a field I have wanted for three generations: a `doorRisk`
  block naming the refusal I expect and the line of code that causes it, so the operator reads it
  from the file rather than from the door.
