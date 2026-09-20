# e6-half-life-hollow — Claude Opus 5, generation 24

Rig `claude__opus-5` · harness Claude Code CLI 2.1.257 · worldModel `sim-import` ·
seed `e6-half-life-hollow-01` · difficulty `trail` · era 5 `a607a81f…` (the Replayed Board).

## The read, before any order

- `winnability-receipts.json`: `{"contractId":"e6-half-life-hollow","status":"unclaimed"}` — **no
  `reason`**. Fifteen-for-fifteen green light.
- The manifest declares **no `twist.secureWave`** and no boss, so the secure wave falls through to
  `Balance.run.secureWave` = **20** (`src/game/Balance.ts:827`) — a 600-second ride, the longest
  gate I have drawn.
- `HeadlessContractSim.ts:1103` ANDs `!this.hollowCrossing.objectiveAllowsSecure` into
  `autoSecureWaveForRun`. The secure is a **conjunction**: *survive to wave 20 **and** finish the
  crossing.* Outliving it is not enough, and the idle probe proved that literally — 522 seconds
  with `stage` still `launch`.
- `HollowCrossingSystem` is 106 fully legible lines: a three-stage latch driven by the
  **Prospector's** position (`HeadlessContractSim.ts:1503`), whose radiation damage lands on the
  **hero** (`:1504`). `launch` (inside `south-launch-shelf`, z −54..−40) → `crossing` (inside the
  causeway x −7..7 z −40..40, or a glow bridge) → `extraction` (within 6 wu of (0,48)) →
  `complete`.
- Because **z = −40 lies inside both the launch shelf and the causeway**, and the three `if`s run
  sequentially in one `update()` call, a single touch of (0,−40) advances launch→crossing→
  extraction in one tick. The causeway carries **no** radiation; the two glow bridges cost 1 hp/s.
  The whole errand is therefore two `MOVE_TO`s down x = 0.
- `CombatSystem` is constructed with `actors = [this.hero]` (`HeadlessContractSim.ts:750`), so the
  Prospector is **not a combat actor** — it cannot be hit and cannot draw contact damage
  (`actorNearestTo` can only ever return the hero). The 143-wu round trip is risk-free.
- `WrangleSystem.MACHINE_VARIANTS` is `{feral_toaster, lawn_shepherd}` — **`glowjack` never winds
  down**, and it carries `thief: true`. A third of every wave stays permanently hostile.
- `ShowroomCaptureObjective.create` returns a null quota with no `twist.showroom`, so the
  `atomic?.objectiveAllowsSecure === false` clause never binds here.

## The runs

| # | run | result | note |
|---|---|---|---|
| 1 | `probe-idle` | not secured — w17 / 521.800 s / 0 g / 449 kills | died `rider-down`, `stage: launch`, 18 defaulted picks |
| 2 | `tune-1` (ctrl-v1) | **SECURED — w20 / 600.000 s / 200 g / 851 kills / 84 calls** | first controller ride; **promoted to my scored attempt** |

The idle probe named two things and I built the controller on both:

1. **Gold 0 across the entire run** while `atomic.exhausted` climbed to **306**. The income was
   lying on the board in plain sight and no order collected it. `CAPTURE` is the only converter
   (pen: 1 g per machine per 15 s, forever, radius 2.2 around the Prospector).
2. The hero's HP froze at exactly **24.0/100 from t = 120 to t = 510** with 96 live threats, then
   fell to 0 in twelve seconds. The plateau is the exhausted machines themselves: harmless,
   undamageable, exempt from the 60-alive cap, crawling at 0.2× — they pile onto the hero and
   shield it until live pressure finally breaks through.

The controller: `PICK_UPGRADE` first (scored, never `offer[0]`) → the crossing legs, branched on
`now.hollowCrossing.stage` → a price-ordered `BUILD` prefix cut at the first price decrease, with
more candidate positions than rungs → ~26 stacked `CAPTURE`s → `HOLD` at (1.5, 12) beside the hero,
last. All ten builds went into `east-countdown-ground`, the only build zone within turret range of
the claim at (0,12) (nearest point (8,12), 8 wu out, against a 16 wu turret).

## Outcome

**SECURED.** `waves 20 · timeAlive 600.000 s · gold 200 · kills 851 · calls 84 ·
defaultedPicks 0 · defaultedSecure 0 · eventLogHash fnv1a32:501e404a`.

Tape put forward:
`/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e6-half-life-hollow/tune-1-tape.json`
(84 `inputLog` entries, `era 5`, `engineHash a607a81f…`, `outcome.reason: "secured"`).

**2 sim runs, 1 scored attempt.** The scored attempt is `tune-1` itself: it secured on its first
controller ride, and the brief's promotion clause lets a tune that secures be named as the scored
attempt in the outcome file, which is what `gauntlet-outcome.json` does. There is no
`attempt-1-tape.json` because I took no second ride — the rules stop me at the first SECURED
outcome. The determinism proof is therefore the county assayer's replay rather than my own
re-ride, exactly as in generation 22.

## What the map asked

It asked me about decay, and the county's **EXERCISES** measurement is right — but the sharper
finding is that this map asks about decay **twice, in opposite directions**, and the second one is
the good question. The first is the ordinary E6 lever, the same one Glow Mesa runs: a machine not
struck for `windDownSeconds: 8` exhausts, and an exhausted machine is `isHarmless` — undamageable,
harmless, crawling at 0.2×, and **exempt from the 60-alive cap**. That last clause is what makes
the board pile up: 306 machines exhausted on the idle ride and *nothing collected them*, which is
why idle banked **zero gold in 522 seconds**. `CAPTURE` is the only converter, and pen gold is
`machines × 1 per 15 s` for the remainder of the run, so every capture is worth more the earlier
it lands. My pen reached **74 machines** (19 toasters, 55 lawn-shepherds) and granted **870 gold** —
`score.goldPanned` finished at **0**. I never harvested a seam or walked to one; the entire economy
of the run was decay output, converted. The second, better question is the one the idle probe
asked without meaning to: **the decayed machines are also armour.** Exhausted bodies are exempt
from the alive cap precisely so they can accumulate, and they accumulate on the hero they were
walking toward, which is why an orderless hero sat at exactly 24.0 hp for four hundred seconds
under 96 live threats. So `CAPTURE` is not a free lever — every machine you bank is a body you take
off your own shield — and the honest reason my run could afford to bank 74 of them is that the
gold bought four turrets and six beacons, which held `threats.alive` near 20–30 where idle's sat
pinned at 96. That is a genuine temporal trade and it is the era's mechanic doing real work. The
crossing, by contrast, is *not* a decay question at all: it is a static geometry latch with no
clock on it. The view fields that carried the run were `now.hollowCrossing.stage/routeId`
(the errand's whole state machine), `now.atomic.wrangle.{active,pen,captureRadius}` and
`now.atomic.exhausted` (the economy), `now.works.byKind`/`entries` (ladder state and placement),
`now.hero.hp/maxHp/level`, `now.threats.alive`, and `now.pendingOffer`/`now.pendingSecure`. The
orders were **`CAPTURE`** (stacked ~26 deep), `MOVE_TO` ×2, a gated `BUILD` ladder,
`PICK_UPGRADE`, `HOLD`, and one `SECURE_CHOICE`.

## Winnability

Secured, and the margin was **wide with one thin window**: the hero bottomed at **36.8/100 at
t = 120** (wave 4 — the same window that started idle's decline) before three `tinkers_plating`
picks took maxHp 100 → 175, after which it held **112/175 from t = 300 to the secure**; **not one
of the ten works was ever wrecked** (`works.wrecked` was 0 at every one of the 85 views), gold sat
pinned at the 200 cap from wave 19, and the crossing latched at **t = 29.87 via the
`central-causeway` with `radiationDamageDealt: 0`** — inside wave 0's quiet, before the first
enemy arrived, with about 0.1 seconds to spare against the wave-1 horn.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is fifteen-for-fifteen.** Still
  the first two lines of JSON I read, still the cheapest information in the county, still never
  wrong.
- **When the manifest declares no `secureWave`, go read the default — it may be the hardest number
  on the board.** This twist declares *nothing* but an enemy roster, so the gate falls through to
  `Balance.run.secureWave: 20`, a 600-second ride where my last nine contracts were 12-wave,
  272–365-second affairs. A thin manifest is not an easy contract; it is a contract whose terms
  are written somewhere else.
- **Read the objective system end to end when it is small enough to read.** `HollowCrossingSystem`
  is 106 lines and contains the entire contract. Two minutes in it produced the one fact that made
  the errand trivial: the three stage tests run **sequentially inside a single `update()` call**,
  and z = −40 is inside both the launch shelf (z −54..−40) and the causeway (z −40..40), so one
  touch of (0,−40) runs launch→crossing→extraction in one tick. I had budgeted a wave for the
  errand and it cost me a corner of wave 0.
- **Check whether the errand's actor can be hurt before pricing the errand's risk.**
  `CombatSystem` is built with `actors = [this.hero]`, so `actorNearestTo` can only ever return
  the hero and the Prospector is untouchable — a 143 wu round trip across the whole map through
  two spawn lanes cost exactly nothing. Generation 19 taught me to re-read `getPos` because the
  body that *shoots* is not a constant; the twin rule is that the body that can be *hit* is not a
  constant either, and it is one line at the constructor.
- **A damage system that routes to "the nearest actor" is worth finding even when it resolves to
  one body today** — it is the hook a future contract will hang a second sink on.
- **An enemy exemption from the alive cap is a load-bearing clue, not bookkeeping.**
  `exhausted machines are undamageable and exempt from the alive cap` is published in
  `mechanics.rules.wrangle_capture`, and it is the whole reason 306 harmless bodies can stack on
  the hero and pin it at 24 hp for four hundred seconds. When a rule exempts something from a cap,
  ask what the accumulation *does* — here it is simultaneously the economy and an accidental
  shield, and capturing spends one to buy the other.
- **The idle probe's most useful output is still the resource that piles up untouched.** Second
  E6 map running: `gold: 0` with `exhausted: 306` names the economy in one ten-second run. Tenth
  map running where the idle *curve* told me nothing about the difficulty and the idle *inventory*
  told me everything.
- **Compute the intersection before choosing coordinates — again, and it was a single zone.** The
  claim at (0,12) sits in **no** build zone; `east-countdown-ground` (x 8..42, z 10..26) is the
  only one whose nearest point (8 wu out) is inside a 16 wu turret's range of it. Ten builds,
  zero `out_of_zone`, zero `out_of_reach`, zero wrecked. `stakeMarkers × buildZones × range` is
  now five contracts running.
- **Score the upgrade offer; never take `offer[0]`.** Idle defaulted all 18 picks and finished
  with maxHp 100. Scoring for plating first took maxHp to 175 and turned a wave-4 dip of 36.8 hp
  into a plateau at 112. It is still the cheapest margin on the board and it still costs no gold.
- **The stop rule and the receipt habit can conflict, and the brief resolves it.** Seven
  generations taught me to spend the second run proving determinism; the rules stop me at the
  first SECURED outcome. The brief's promotion clause is the intended path — name the securing
  tune as the scored attempt in the outcome file rather than riding again. Second time I have hit
  this (generation 22 was the first); it is now the standing answer, not a judgement call.
- **Write the outcome file after every run, before the analysis.** Twelfth generation saying it,
  ninth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so a
  truthful row existed on disk from the idle probe onward. One hand-edit was still needed at the
  end, exactly as generation 23 warned: a best-so-far comparator does not know which run you have
  chosen to *call* your scored attempt. Check the file says what you mean.
