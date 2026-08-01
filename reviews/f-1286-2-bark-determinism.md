# F-1286-2 — bark-card determinism (CLOSED-BY-REPAIR, s1339)

**Slice:** test-harness repair, `e2e/en-02-e1-coverage.spec.ts` · **Branch:** main · **Tip:** see the s1339 cure commit
**Verdict:** ✅ REPAIRED. The gate F-1338-1 wrote was run; its answer refuted **both** options the gate itself
offered, and the cure came from a third mechanism neither prior finding had considered.

## What it does

`"EN-02 town board and bark discover contracts and townsfolk"` asserted, immediately after
`approachTavern`, that the bark card belongs to the tavernkeeper. It failed at ~1/6 for three fires
(s1286, s1337, s1338). The repair inserts one line — `standAtTownActor(page, 'tavernkeeper')` — which
reads the actor's live post out of `__GR_TOWN_DIAGNOSTICS__.actors[]` and teleports the hero onto it,
making the assertion independent of where the town's wandering cast happens to be. **Test-only: zero
`src/` bytes changed.**

## The gate, and its literal answer

> *"measure whether `activeBark.actorId` returns to `tavernkeeper` on its own after a youngster
> occludes it, and how long that takes"* — F-1338-1

**Transient, always.** 8/8 probe runs recovered on their own; the card is never stuck. **But the
latency straddles the deadline**, which is what made it a coin flip rather than a red:

| project | time from arrival to tavernkeeper ownership (ms) |
|---|---|
| desktop-chrome (n=3) | 1631 · 2323 · 2228 |
| mobile-chrome (n=5) | 2181 · 3277 · **6266** · 967 · 1626 |

**1 of 8 exceeds the 5000 ms `toHaveAttribute` default = 12.5%**, statistically indistinguishable
from the 1/6 (~17%) s1337 measured. That single 6266 ms sample is a direct capture of the failure.

## Three findings, three wrong actors

s1286 called it a *"rotating-bark-carousel race"*; s1338 reasoned about *"a youngster passing
through"*. **At the assertion instant the card belonged to the NEWSIE in 8/8 runs**, never a
youngster. Chen Mei is anchored to the tavern and loops its trail (`src/town/townsfolk.ts:198-211`;
`seconds: 19, phase: 0.16, pauses: {0: 4}`) — a co-located resident. Youngsters do occlude, but in
the 3–11 s band, after the assertion has already resolved.

The upstream decoupling F-1338-1 diagnosed is confirmed quantitatively: `activePrompt` held
`'tavern'` in **100% of ~1,900 samples** while the card changed owner 6–10 times per run.

## Both gate options refuted, by the same probe

1. **Wait on the world condition.** `activeBark.actorId` vs the DOM `data-actor-id`: **0 divergences
   in ~1,900 samples.** Same information, same clock — a longer wait under a different name. And no
   deadline is derivable: the probe measured a **16,019 ms** newsie-owned episode at the same spot,
   which nothing inside the spec's 30 s budget clears.
2. **Make the approach deterministic** — refuted *in its obvious form*: teleporting to the
   tavernkeeper's `TOWN_ACTORS` coordinate `(-5.4, -6.75)` won for **1 sample of 235**, then the hero
   drifted up to 3.67 world units away.

## The cure — the failed attempt named its own defect

`townActorPlazaPlacement` (`src/town/TownScene.ts:3618`) **overrides the definition position for
loop-less actors**: the tavernkeeper's real post is `anchor + offset` = **(-6.5, -4.85)**. The
literal in `townsfolk.ts` is not where she stands, and it sits *inside the tavern footprint*, where
collision ejects the hero. Option 2 was never wrong — the coordinate was.

At the true post the hero holds, `distanceSq = 0`, and the selection at `TownScene.ts:1444` is a
**strict `<`**, so no actor can displace it.

| post | tavernkeeper share of samples | first ownership | prompt |
|---|---|---|---|
| `(-5.4, -6.75)` — definition literal | 1/235 · 1/236 · 1/234 | 73 / 117 / 180 ms | `tavern` |
| `(-4.3, -6.75)` — outside footprint | 0/235 · 0/233 | never | `tavern` |
| **`(-6.5, -4.85)` — true placement** | **232/233 · 234/235 · 234/234** | **220 / 150 / 4 ms** | `tavern` |

The helper reads the post from diagnostics rather than hardcoding it, so the placement rule cannot
rot out from under the test.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| cure at the defect's own denominator — `en-01`+`en-02`+`en-03`, `--workers=1`, `--repeat-each=3`, both projects | **42/42 green ×2 batteries = 84/84 instances** (12 of them the repaired test) |
| probe rig, desktop + mobile | 8 arrival runs, 8 determinism runs, ~1,900 samples |

The 42-instance battery is the identical one that produced this row's 1/6 **and** F-1337-1's 3/6.

## Findings

- **F-1339-1** (this review, non-blocking): the probe aimed at the definition coordinate twice and
  produced a confident refutation of the *strategy* that was actually a refutation of the
  *coordinate*. A measurement aimed at the wrong subject does not read as noise — it reads as a
  result. Filed as the through-line, no corrective owed: the repair reads the post from diagnostics
  precisely so no future reader can repeat it.

## Scratch

Probe rig `e2e/probe-s1339-bark-recovery.rig.ts` (testIgnored by the default config — never enters a
gate battery) and its runners under `logs/session-scratch/s1339/`, mirrored into git per the
RETENTION LAW.
