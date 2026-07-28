# 066-walk8-hero-expectation-realign — the assertions that had never executed

**Slice:** `lane-c-066-walk8-hero-expectation-realign` · **branch:** `lane/e2-arsenal` · **commit:** `70db5602`
**Drained:** s1181 fire, 2026-07-28 · **Verdict: MERGE (partial delivery, honestly bounded)**

## What it does

`066-walk8-engine.spec.ts:194` asserted the hero *"stays on walk4"*. She was activated to walk8 on
2026-07-12 with owner approval, so the test had been waiting on `frameCount === 4` — a condition
that can never settle — and timing out at the `heroWalk()` helper ever since. `:208` inherited the
same helper and died at the same line, which meant **the cadence law the whole eight-winds program
rests on has not been checked in over a fortnight**.

The realign points both sites at walk8 and restores entry into the tests. Test-only diff; `src/`
and `assets/` untouched.

## Scope 1 was an observe-and-classify STOP, and the observation matters more than the edit

s1179 authored three outcomes and pre-declared that **(b) "on walk8 but the stride duration
CHANGED" is an engine regression** where realigning would install a false green over a live defect.
The runner classified **(a)** and printed its evidence:

```json
{"clip":"walk","frameCount":8,"fps":15.6098,"sourceFrameKey":"char-hero-sheet-walk8-r0c1.png","strideUnitsPerCycle":3.075}
```

✓ **I re-derived this at source rather than accepting it**, because the raw cycle time *does*
change (`4/9.5 = 0.421 s` → `8/15.61 = 0.513 s`) and that is exactly what (b) looks like from the
outside. The engine's cadence law is not cycle time:

- `SpriteAnimator.ts:630` — `strideUnitsPerCycle = speed / (fps / frames)`, i.e. **ground distance per animation cycle**.
- `SpriteAnimator.ts:1090` — `cadenceFrameScale = frames / cadenceReferenceFrames` (= 8/4 = **2**), which scales fps *with* the frame count.

Substituting the hero's fps formula (`Hero.ts:194`), stride-per-cycle reduces to
`Balance.anim.strideUnits × visualScale × walkFpsPerSpeed` — **the frame count cancels out**. For
walk4 and walk8 alike that is `2.05 × 1.5 = 3.075`, precisely the measured value. The gait is
distance-driven; frames and fps doubled together and the stride did not move. **Classification (a)
is correct and this is not a false green.**

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| Slice spec `066-walk8-engine.spec.ts` **after** | **4 passed / 2 failed**, 35.5 s |
| Same spec **before** (my own control, blob `c2fb09a9`) | **2 passed / 4 failed**, 4.3 m |
| Net | **+2 green** (`:194` desktop **and** mobile), suite 7× faster — the lost time was all impossible-precondition timeouts |
| Restored to treatment | blob `6e23f860` verified after the control |
| Merge classification | test-file only; taken from commit `70db5602` specifically, **not** the branch tip |

No assertion was deleted, skipped, or loosened, and the count is unchanged. The one replacement is
a **strengthening**: `expect(sourceFrameKey).not.toContain('walk8')` — a negative that only ever
encoded the stale expectation — became `expect(strideUnitsPerCycle).toBeCloseTo(3.075, 1)`, which
asserts the cadence law itself for the first time.

⚠️ `lane/e2-arsenal` also carries `84905654` (`lane-wardrobe-preview`), which is **not** part of
this drain and remains undrained.

## What this slice does NOT deliver, stated plainly

`:208` still fails on both projects — but it fails **somewhere new**. It now clears the hero
preconditions at `:232` and dies at `:234`:

```
Expected substring: "char-jumper-sheet-walk8-"
Received string:    "char-bandit-base-sheet-walk8-r2c0.png"
```

That is the **owner-gated F-1166-1 Claim-Jumper fork** — whether the mounted `char.bandit_base`
sheet or the dormant `char.claim_jumper` contract is the public truth — and the runner correctly
refused to cross its firewall to force a green. So the jumper's own cadence assertions at
`:235-238` (including `jumper.strideUnitsPerCycle ≈ hero.strideUnitsPerCycle`) **still do not
execute**. The runner said so in writing rather than claiming the test restored; that honesty is
why this merges.

## Findings

- **F-1181-6 (owner, small, unblocks a real assertion).** One word on **F-1166-1** now also buys
  back `066:208`'s jumper cadence assertions, which have never executed. The two questions are the
  same question; F-1166-1 was already on the desk with rec (a).
- **F-1181-7 (cosmetic, non-blocking).** The realigned test still carries stale identifiers from
  its walk4 life: boot label `066-hero-stays-walk4` and screenshot name `hero-walk4-unchanged`.
  Harmless, but they will misdirect the next reader of the artifacts.
- **F-1181-8 (fragility, non-blocking).** `expect(walking.fps).toBeCloseTo(15.61, 1)` pins a
  *derived, speed-dependent* quantity to ±0.05. It is no tighter than the `9.5` it replaced and it
  passed both projects, but the durable invariant beside it (`strideUnitsPerCycle`) is the one that
  cannot drift. If this line ever flakes, delete the fps pin rather than widening it.
