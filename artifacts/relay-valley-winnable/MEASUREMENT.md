# relay-valley-winnable — the measured ladder

Owner ruling 2026-09-06, verbatim: **"lets adjust the policy so the hard levels can be won"**.
Every row below is a real headless run on contract `e7-relay-valley`, seed `e7-relay-valley-01`,
driven by the heat-12 rider's own controller through `artifacts/relay-valley-winnable/run.mjs`
(the rider's `run.mjs` with only the workspace paths changed). A wave-20 secure is 600.000 s.

## 0. Baseline — reproduced exactly, on this tree

| | |
|---|---|
| controller | `ctrl-v3.mjs`, copied byte-for-byte from `artifacts/gauntlet-heat12-20260905/rides/e7-relay-valley.attempt-1/work/ctrl-v3.mjs` |
| outcome | **not secured — wave 15, t = 460.333 s, 40 g, 537 kills, 62 calls** |
| tape | `fnv1a32:f9866fc8` — identical to heat 12's promoted attempt, so the baseline is the same run, not a lookalike |
| death | hero 18.2 → 0 of 175 between t = 453.8 and t = 460.3 |
| heal offers | **zero**. 21 offers, not one containing a filler: `field_dressing` was never eligible, exactly as the blocker says |
| hero | welded at (0,12) for all 460 s. `MOVE_TO`/`HOLD` move the PROSPECTOR (`StandingOrders.ts:351`); no verb in the union moves the hero |

Gross damage over the whole run is only **175 hp — 0.38 hp/s averaged** — but it is end-loaded:
−57.6 in one step at wave 12, −27.2 at wave 14, −18.2 at wave 15.

## 1. Lever (a) — a claim-side build zone

The contract's four `relay-site-*` zones all sit at z ∈ [36,46], |x| ≥ 20; the nearest corner is
**31.24 wu** from the weld. `Terrain.isBuildable` (`src/world/Terrain.ts:238`) gates on the zone
list alone here — `river: false` and a `mode: 'visual'` heightfield make every in-bounds point
walkable bank — so **the contract's own buildZones ARE the constraint**, confirmed by probe:
with a `valley-camp` zone added, (0,20), (0,4) and (−5,10) become buildable. ((0,18) does not: a
landmark blocker stands there.) No buildable in the registry heals the hero — the only heals in the
engine are `tinkers_plating` and `field_dressing`, both cards — so (a) can only ever buy defence.

| probe | build | outcome |
|---|---|---|
| `probe-a-turret2` | one gun at (0,20) | not secured — w15, **461.933 s** (+1.6 s), 562 kills |
| `probe-a-fort` | three guns + a ten-post palisade screen | not secured — w18, **556.867 s** (+96.5 s), 736 kills |

**(a) is dead at its ceiling**, and its ceiling is a wholesale fortification of the valley floor
that contradicts the contract's own briefing rule ("Four relay sites span the two exposed ridges").

## 2. Lever (b) — a per-contract draft rule opening `field_dressing` early

Two shapes were built and measured. Both were reverted; neither is in the diff.

| shape | wave | outcome |
|---|---|---|
| fillers drawn into the main pool | 12 | not secured — w18, **552.700 s**, 5 `field_dressing` picks of 23 offers |
| fillers drawn into the main pool | 8 | not secured — w17, **523.767 s** |
| a reserved slot for any filler | 12 | not secured — w16, **488.233 s** — the invest weight steers the slot to `sharpen` |
| a reserved slot for `field_dressing` itself | 12 | not secured — w18, **557.033 s**, 7 of 23 offers healed |
| the same, controller skips a bandage above 70% hp | 12 | not secured — w18, **553.433 s** |
| the same | 8 | not secured — w18, **555.433 s** |
| the same | 6 | not secured — w17, **528.600 s** |

The reserved-bandage shape works exactly as designed — from wave N *every* offer carries
`field_dressing` — and it still plateaus. The arithmetic says why: a level-up arrives about every
25 s and heals 0.3 × maxHp = 52.5, i.e. **2.1 hp/s**, against a wave-18 bite of **~8 hp/s**.
Opening the kit earlier does not help, because a bandage taken at full health is a patent not taken.

## 3. What actually ends the run

At wave 18 the board holds **57 live enemies, 37 of them thieves**, 860 spawned, against ONE welded
hero and one turret; the hero loses its whole pool inside a single wave. Halving the roster's
`contactDamageScale` (pure authored data, no engine change) reaches **562.467 s** — the same wave-18
ceiling. Three unrelated levers all stop at wave 18. The map's wall is the late swarm, not slow
attrition, and the blocker's "~80 seconds of HP" is an under-estimate.

## 4. Lever (c) — the claim grit, `twist.hero.maxHpBonus`

Probed by raising `Balance.hero.maxHp` under an env var (reverted; `probe-c-control` at +0
reproduces `fnv1a32:f9866fc8` exactly, so the probe is inert at zero).

| grit | outcome | hero hp at end |
|---|---|---|
| +200 | not secured — w18, 567.767 s | 0 of 375 |
| +210 | not secured — w18, 569.433 s | 0 of 385 |
| +225 | not secured — w19, 579.433 s | 0 of 400 |
| +250 | **SECURED — w20, 600.000 s** | 10.6 of 425 — a 2.5% margin, a knife edge |
| +300 | **SECURED — w20, 600.000 s** | 90.6 of 475 |
| +400 | **SECURED — w20, 600.000 s** | 242.2 of 575 |

**300 is the authored value**: the first rung with real headroom rather than the first rung that
survives. The map is priced at 300, not tuned to 250.

## 5. The proof, on the landed implementation

`proof-v3` runs the rider's **unmodified** `ctrl-v3.mjs` against the shipped
`twist.hero.maxHpBonus: 300`:

| | |
|---|---|
| outcome | **SECURED — wave 20, t = 600.000 s, 90 g, 749 kills, 82 calls** |
| tape | **`fnv1a32:bf2ad127`** — byte-identical to `probe-c2-hp300`, which is the cross-check that the landed code equals the probe |
| margin | **+139.667 s** past the baseline death point (460.333 s); the hero never drops below 90.6 hp after t = 30 |
| start | 400 of 400 — the grit is paid in hit points at run start, not only in ceiling |
| envelope | 18000 ticks of 18002, last entry at 17857 |

## 6. Floors

`node scripts/null-floor-anchors.mjs --check` over all 34 contracts × 2 seeds: **the only rows that
moved are this contract's two**, plus the `eraStamp` (pinned `ed57402e8`, this branch's merge-base
`41b1e63cf` — a branch-position artifact, not a behaviour change). Both relay-valley floors **still
LOSE**:

| seed | before | after |
|---|---|---|
| `e7-relay-valley-01` | w2, 79.300 s, `fnv1a32:1c8a5f74` | w7, 231.400 s, `fnv1a32:ff840039` |
| `e7-relay-valley-02` | w2, 79.500 s, `fnv1a32:2aa1c47d` | w4, 140.600 s, `fnv1a32:e922a60a` |

The reason they moved is the reason the grit exists: an idle hero with 400 hit points takes longer
to fall. It still never lights a relay, so it can never secure.

## 7. The card, plain boot, no `?debug`

`card-shot.mjs` boots `/?contract=e7-relay-valley` with no debug flag. On BOTH projects the
briefing lists four rules ending in the grit line, the card is still up two seconds later, and the
console is empty. The 390px shot also shows the HUD reading **HP 400 / 400** — the browser half
applying the grit and paying it in hit points at run start, which the node guard can only prove at
the source. (F-CWBC-2's vanishing desktop card did NOT reproduce here: the desktop card was visible
at read and still visible at +2 s.) Files: `card-{desktop,mobile}-chrome{,-plus2s}.png`,
`card-shots.log`.

## Files

`run.mjs` (the harness), `ctrl-v3.mjs` (the rider's controller, verbatim), `ctrl-v4.mjs` (the same
with one line: skip a bandage above 70% hp — used only to test lever (b), not for the proof),
`work/` (every tape, result, stderr and view log named above, plus `set-kit.mjs` / `set-roster.mjs`,
the helpers that authored the reverted probes).
