# e9-dome-basin — heat 11, generation 32 (claude-opus-5)

worldModel: `sim-import` (read `src/sim/HeadlessContractSim.ts`, `src/game/Balance.ts`,
`src/world/Terrain.ts`, `src/playbook/PlaybookFormat.ts`, the epoch-9 manifest).

## Pre-ride reads

- `winnability-receipts.json`: `{"contractId":"e9-dome-basin","status":"unclaimed"}` — no `reason`.
  Green light, seventeen-for-seventeen.
- Manifest `twist` declares **only** `enemyRoster` — no `secureWave`, no `baron`, no
  `persistentCanalChoices`. So `secureWave = Balance.run.secureWave = 20`
  (`HeadlessContractSim.ts:1089`), a **600-second** ride, and the wave ceiling is 22.
- `now` publishes no E9 socket of any kind (union of keys across every view:
  `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer ·
  prospector · score · seams · threats · timers · wave · weapon · works`). `CanalChoiceSystem`
  is composed only where `twist.persistentCanalChoices` is declared; this contract does not
  declare it. **The county's RESKIN measurement is correct here.**

## THE ENVELOPE FINDING (carried forward from generations 24/25/26 — it applies to this contract)

Because the manifest declares no `twist.secureWave`, `runTapeEnvelopeForContract`
(`src/playbook/PlaybookFormat.ts:63`) skips its `+2` inclusive-endpoint slack and grants a flat
`MAX_PLAYBOOK_TICKS = 18_000`. A wave-20 secure lands at t = 600.000 s = tick 18 000 exactly;
`gr-sim.mjs:281` computes `durationTicks = Math.max(elapsedTicks, lastEntryTick + 1)` = **18 001**,
and `PlaybookFormat.ts:169` refuses `durationTicks > maxDurationTicks`. **Any secure of this
contract is therefore inadmissible at the door as `reel_duration_exceeded`, however it is played** —
there is no earlier secure window to bank at, and letting the choice default only adds ticks
(`HeadlessContractSim.ts:1370` steps the sim through the whole 20-second choice clock).
This is the same class defect gens 24/25 ate on `e6-picnic` and `e6-half-life-hollow`.

## What I measured

| run | policy | waves | timeAlive | gold | calls | note |
|---|---|---|---|---|---|---|
| probe-idle | `--policy idle` | 2 | 82.600 s | 0 | 0 | hero down at t=82.6, 34 kills |
| tune-1 | seam-pocket fort | **5** | **160.733 s** | 20 | 19 | 540 g panned; **works.wrecked = 0** |
| tune-2 | rim-lane fort, both sides | 5 | 152.267 s | 1 | 54 | bait works (4/4 wrecked); economy died |
| tune-3 | **east-rim-only fort** | **13** | **407.000 s** | 33 | 141 | the synthesis: bait + short commute, 506 kills |

`gauntlet-outcome.json` was rewritten by the runner on every child exit, from the idle probe on.

## The map, as measured

- Hero **welded at the claim (0,12)** in every view of every run; the Prospector is the order
  actor and is untargetable (`CombatSystem` actors = `[hero]`).
- **No build zone comes within 28 wu of the hero.** Nearest legal ground is `rim-dome-pad-east`
  at 28.3 wu and `rim-dome-pad-west` at 28.6 wu, against a turret range of 16 and a beacon
  radius of 8. *Nothing buildable can defend the body that must survive.*
- Roster: `feral_terraformer` (**wrecker**, hpScale 1.7, speed 0.6, contact 1.0, building 1.4)
  and `claim_jump_prospect_drone` (thief, hpScale 0.7, speed 1.1, contact 0.7). Spawn edges are
  north, west and east, all converging on (0,12), with a 2.4-second continuous trickle on top.
- All four gold seams sit **inside** buildZone `seed-rows-footing` (x 18..44, z −32..−18), 45.6 wu
  from the claim. That pocket pans ~3.4 g/s (540 gold by t=160) — the economy is not the wall.

## Outcome

**NOT SECURED.** Best run: **tune-3 — waves 13, timeAlive 407.000 s, gold 33, kills 506,
calls 141** (`eventLogHash fnv1a32:22f6d5fb`, tape `tune-3.json`). **4 sim runs, 0 scored
attempts.** Nothing is put forward: no ride secured, and a secure of this contract is inadmissible
at the door for the envelope reason above, so spending a scored-attempt slot on a tape that cannot
be submitted buys nothing. The last run landed at the wall with the trend still climbing — wave 5
→ wave 13 on a single change — so the ride ended short of an answer, not short of a line.

## What the map asked

It asked me nothing about E9 persistent tiles, and the county's **RESKIN** measurement is right —
sharply so, because the engine *has* the consumer and this contract declines it. `CanalChoiceSystem`
is real, live headless, and gates the secure through `autoSecureWaveForRun`
(`HeadlessContractSim.ts:1114`: `this.canalChoices !== null && !this.canalChoices.objectiveAllowsSecure`),
with `CONTEXT_ACTION redig`/`backfill` wired as public verbs — but it is keyed on
`twist.persistentCanalChoices`, and **this manifest declares no twist but an enemy roster**. So the
three canal stage-gates C1 (−28,34), C2 (−12,10) and C3 (4,−24) that the briefing tells me to defend,
the feeder-canal rail through them, the ice quarry, the dust-devil patrol lane and the height-four
scarp are all `tileParams` scenery: none of them appears in `now`, none has a verb, and the only
persistent thing on the board is the pathing. What the map actually asked was a pure geometry
question with a harsh answer: **where can you build, relative to the body you must keep alive?**
The fields that carried both controllers were `now.works.entries` (positions, `hp`, `wrecked` — the
only way to see that a fort was being ignored), `now.works.byKind`, `now.seams[].active/x/z`,
`now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive/wreckers/thieves` and `now.pendingOffer`;
the orders were `BUILD`, `HARVEST`, `REPAIR_UNDER` and `PICK_UPGRADE` — epoch-1 grammar throughout,
because E9 offers this contract no verb at all.

## Winnability

**Undecided-leaning-YES on the map and NO at the door, and what stopped me was my own budget:**
the map's geometry is hard but tractable — the hero is welded to a claim no buildable can reach
(nearest legal ground 28.3 wu against turret range 16), and the claim is itself the nearest building
to every spawn so a distant fort baits nothing (tune-1: `works.wrecked = 0` all run) while a
two-sided bait starves the economy that pays for it (tune-2: `goldPanned` frozen at 150 from t=110)
— but the synthesis of those two measurements, an **east-rim-only** fort that baits the east lane
while keeping the 20 wu seam commute, took the same seed from wave 5 to **wave 13 / 407.0 s / 506
kills on its first ride**, and I hit the wall one run later with the curve still rising and the
obvious next levers (`SET_WEAPON blast` against a scrum piled on a fixed hero, repair/rebuild of the
bait, turret tier upgrades on a 3.4 g/s economy) untested; **even so, a wave-20 secure here would be
refused at the door as `reel_duration_exceeded`, because this manifest declares no
`twist.secureWave` and a wave-20 bank reports `durationTicks` 18 001 against a flat 18 000-tick
envelope — so the L2 answer is "winnable in the map, unsubmittable through the door."**
The superseded reading, kept for the record:
the hero is welded to a claim that no buildable can reach (nearest legal ground 28.3 wu against
turret range 16), the claim is itself the nearest building to every spawn so a distant fort baits
nothing (tune-1: `works.wrecked = 0` for the whole run) while a fort placed close enough to bait
sits 65 wu from the only seams and starves the economy that pays for it (tune-2: `goldPanned` frozen
at 150 from t=110), and both lines died at wave 5 of 20 with the hero taking 100+ damage in the
last 40 seconds — **and even a secure would be refused at the door as `reel_duration_exceeded`,
because this manifest declares no `twist.secureWave` and a wave-20 bank reports `durationTicks`
18 001 against a flat 18 000-tick envelope.** Honest caveats: I did not test `SET_WEAPON blast`
(AoE against a scrum piled on a fixed hero is the one untried lever with real upside), nor an
east-rim-only fort that keeps the 20 wu seam commute while still baiting the east lane, and my
whole heat ran to three runs — so this is a strong prior about difficulty, not a proof of
impossibility.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen** — and
  seventeen times running it has told me about the *standings*, never about the map. It was a green
  light here for a contract I could not win.
- **Check the envelope BEFORE choosing a strategy, not after the door refuses.** Generation 26
  named the line and generation 29 warned about it; this is the first time I read
  `PlaybookFormat.ts:63` at minute five instead of minute twenty. A `secureWave`-silent manifest is
  the tell, and on this door it means a 600-second ride whose secure is inadmissible however it is
  played. That single read changes what a scored attempt is *for*.
- **`nearestBuilding` counts the claim.** Generation 13 taught me "your own walls are somebody
  else's armour" and generation 28 taught me an era can override the target function; the missing
  middle is that on an ordinary map the **claim is already a building**, so a bait only baits when
  it is nearer to the spawn edge than the claim is. My seam fort was 45 wu out, every spawn edge
  was nearer the claim, and `works.wrecked` sat at 0 for an entire run while I paid 500 gold for it.
  **Measure a bait by `works.wrecked`, not by hope** — a fort nothing attacks is a fort doing nothing.
- **Compute `distance(defended point, nearest legal build ground)` against weapon range as the very
  first arithmetic on any map.** 28.3 wu against a 16 wu turret and an 8 wu beacon decided this
  contract before I wrote an order. Generation 18 hit the same shape on the Long Road and solved it
  by finding which distant box sat on the enemies' line; here both boxes that sit on a line are the
  wrong distance from the money.
- **Bait and economy can be mutually exclusive, and that trade is the contract.** v1 had the perfect
  economy (3.4 g/s, seams inside their own build zone) and a fort nothing attacked; v2 had a fort
  that pulled every west/east wrecker and an economy frozen at 150 gold by the 65 wu commute between
  them. When the two sites are far apart and one body serves both, price the fort in *panning
  seconds*, not gold — and prefer the site whose commute is short even if its coverage is worse.
- **Run the synthesis before you are sure — it was worth 8 waves and I nearly never fired it.**
  v1 and v2 were a clean pair of one-variable experiments (perfect economy / useless fort, working
  bait / dead economy) and the answer they jointly implied — bait only the lane whose build ground
  is *near the money* — took the same seed from wave 5 to wave 13 on its first ride, a one-line
  edit made with two minutes left. Generation 13 wrote "one attempt per competing explanation";
  the missing half is **budget a slot for the explanation that combines them**, and fire it early,
  because a pair of well-documented failures is worth less than one untested combination.
- **Three runs is not a heat.** I spent the first third of the wall on source reading that was
  genuinely load-bearing (the envelope, the roster's wrecker flag, `isBuildable`'s zone rule, the
  absent canal socket) and it left one run per hypothesis with nothing for the synthesis both runs
  pointed at. Generation 10 wrote "budget the source read against the wall"; the sharper version is
  **reserve the last third for the run that combines what the earlier runs proved**, and start it
  before you are sure, because an untested synthesis beats a well-documented pair of failures.
- **A `--policy idle` death at wave 2 still told me nothing about difficulty** (twelfth map running)
  — but its *inventory* did again: `gold: 0` with three live seams 45 wu away named the commute as
  the map's central fact in ten seconds.
