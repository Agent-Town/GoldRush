# F-2070-1 — the canyon-works wave-6 deadline is not walk-era DRIFTED, it is walk-era UNCALIBRATED

**Fire:** s2070 (eighth consecutive dry board) · **Date:** 2026-08-19
**Subject:** the premise sentence inside the F-E2S-4 desk row (2026-08-09), ten days old, re-measured per s2069's (B).

## The premise under test

F-E2S-4's row states, verbatim:

> ⚠️ The deadline predates the Walk Era (f-door-5 added travel time to every harvest funding the 330g
> beacon chain — Luna's gen-1 notebook documents the chain cost); the 2.77s margin smells like era
> drift, not design.

That sentence carries the whole rationale for owner fork **(a) recalibrate the deadline for walk-era
economics**. It is a provenance claim, so git can answer it directly — no sim run required.

## What was measured

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | What IS the deadline? | `connect: { required: 2, byWave: 6 }` | `assets/contracts/epoch-3-voltage/contracts.json` |
| 2 | When was it introduced? | **2026-07-15T01:38:27+07:00** | `dafe9b633` `runner(lane-b): canyon-works-01.md` (`git log -S '"byWave": 6'`) |
| 3 | When was the headless sim born? | **2026-07-30T15:40:33+07:00** | `b33afb047` — first commit adding `src/sim/HeadlessContractSim.ts` |
| 4 | What did the Walk Era touch? | headless sim + docs + tests ONLY | `3dd7790d6`, 5 files, **zero** browser gameplay source |
| 5 | Where did "wave 6" come from? | a spec PROSE line | `specs/epoch-saga/e3-voltage-bundle.md:75` |
| 6 | Was the deadline ever timed? | **NO** | `e2e/e3-canyon-works.spec.ts:34` ("strings the gorge, holds the night, and restores a cut span") |

## Three results

**(1) The chronology in the row is TRUE but the inference from it is FALSE.** The deadline (2026-07-15)
does predate the Walk Era (2026-08-08) — but the headless sim did not exist until **2026-07-30, fifteen
days AFTER the deadline was authored**. The deadline therefore *cannot* have been calibrated against
teleporting headless harvests, because on the day it was written the only way to play this map was the
browser, where the walk has always been real. "Predates the Walk Era" is true of the calendar and
irrelevant to the economics.

**(2) f-door-5 changed nothing a browser player experiences.** Its five files are
`e2e/front-door-parity.spec.ts`, `public/skill.md`, `scripts/gr-sim.test.mjs`,
`src/agent/StandingOrders.ts` and `src/sim/HeadlessContractSim.ts` — no `src/game/`, no `src/systems/`,
no `src/entities/`. F-DOOR-5's own row says why: *"a browser player pays the walk to every seam"*
already. The Walk Era **removed a headless-only advantage**; it did not add a cost to the map. So the
2.77 s miss is a fact about *agent routing measured under honest rules for the first time*, not about a
deadline that moved.

**(3) THE DEADLINE HAS NEVER BEEN CALIBRATED AGAINST ANY ECONOMICS, IN ANY ERA.** This is the finding
that outlives the refutation. `byWave: 6` descends from one prose clause in the E3 bundle spec —
*"connect (power N galleries by wave 6 — the era's teaching contract)"* — a design-intent phrase that
does not even fix N (the implementation chose `required: 2`). And its only acceptance test — `e2e/e3-canyon-works.spec.ts:34` ("strings the gorge, holds the night, and restores a cut span") — boots with

```
?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1
```

`nowaves&nospawn`. The suite proves CONNECT *mechanically completes*; it is structurally incapable of
proving CONNECT is *reachable in time*, because with waves off there is no clock to miss. **Sol's
gen-2 arm in August was the first time anyone put a stopwatch on this objective.**

## What this does to the owner fork

Fork **(a)** reads *"recalibrate the deadline for walk-era economics"*. That verb presumes a prior
calibration to re-do. There was none. The honest restatement is **"calibrate it for the first time"** —
which is the same census measurement, at the same cost, but stops crediting a baseline that never
existed. Forks (b) and (c) are unaffected in substance: an untested number can still be accepted as an
elite challenge or left open.

## What is NOT claimed

- **Sol's negative result stands entirely untouched.** Nothing here says the deadline is reachable; the
  2.77 s miss was not re-run and is not disputed.
- **Nothing here says the deadline is WRONG.** An uncalibrated number can be accidentally well-judged.
  What is now known is that nobody has ever checked, which is a different fact from "it drifted".
- **The census measurement named in the row is still UNRUN.** Fastest-possible chain time under current
  economics remains the open number, and it is still fire-authorable.
- **The 330 g chain cost is INHERITED, NOT VERIFIED.** It comes from Luna's gen-1 notebook via the row;
  I did not locate a pylon cost in `src/` and did not re-derive it. Immaterial to this refutation, which
  rests only on provenance.

## The reusable half

**"X predates Y" is a claim about the calendar; "X was calibrated under Y's absence" is a claim about
evidence, and the first does not imply the second.** The row inferred the second from the first, and the
gap between them was fifteen days in which the measuring instrument did not yet exist. When a premise
blames drift, check whether a baseline was ever taken — *an uncalibrated number and a drifted number
look identical from the miss, and they call for opposite verbs.*
