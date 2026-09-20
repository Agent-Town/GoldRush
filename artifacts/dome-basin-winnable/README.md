# dome-basin-winnable — the reel budget (F-HEAT12-2) and the first wave-20 secure on Dome Basin

Worktree `fix/dome-basin-winnable`, base `41b1e63cf`, engine hash
`c8d16b36c8bad21955caa51ab8c2d6d3bd85bb9f0cb519dd8dd7f9b6a707ca4d`, seed `e9-dome-basin-01`,
difficulty `trail`, gate wave 20 / 600 s.

## 1. The envelope (F-HEAT12-2)

`runTapeEnvelopeForContract` priced every entry at 160 B, a figure calibrated on the retained Baron
proof (140.7 B/entry, one small standing order per change-point). An entry may lawfully carry 24
actions of up to 32 orders each, so an order-array rider pays far more, and the byte axis bound a
POLICY CLASS rather than a size.

Two-class pricing now: `16,384 + maxEntries*160 + ceil(maxTicks/30)*(2,400 - 160)`.

| | before | after |
|---|---:|---:|
| `e9-dome-basin` `maxTapeBytes` | 592,544 | 1,938,784 |
| `MAX_JSON_BYTES` (outer wall) | 802,080 | 2,531,360 |
| `maxTicks` / `maxEntries` | 18,002 / 3,601 | unchanged |

2,400 B is the corpus maximum entry (2,162 B measured over 505 retained reels / 68,505 entries,
`probe-corpus.mjs`) plus 11%. 30 ticks is the engine's own cadence: the lockstep hash exchange,
the run-tape probe interval, and one second of sim time.

### The blocker's numbers were measured on the wrong artifact

`scripts/gr-sim.mjs:326` writes a tape with `JSON.stringify(tape, null, 2)`. The door re-serialises
compactly (`standings.ts` `validateTape`), so the file on disk is about 2.9x the submitted form.
Heat 12's ride harness compared `fs.statSync(tape).size` against `maxTapeBytes`
(`artifacts/gauntlet-heat12-20260905/rides/e9-dome-basin.attempt-1/work/run.mjs`), and both heats
reported refusals that do not happen:

| reel | file on disk | compact, as the door measures | ceiling | door verdict |
|---|---:|---:|---:|---|
| Dome Basin w16 (heat 12) | 621,674 | **217,452** | 592,544 (old) | **ACCEPT, then and now** |
| Relay Valley tune-1 (heat 11) | 1,724,873 | **543,868** | 592,544 (old) | **ACCEPT, then and now** |

Swept with `probe-corpus.mjs` over every retained reel in `artifacts/**`: **505 tapes, 0 over the
byte ceiling, 0 over `maxEntries`, 0 over `maxTicks`.** No measured reel has ever been refused.

The defect the fix cures is real but PROJECTED, not observed: Relay Valley tune-1 wrote 138.6 B/tick
in 415 entries over 3,924 ticks, which at a full 18,002-tick clock is 2,495,085 B against 592,544
while using about 1,900 of 3,601 permitted entries. The byte axis binds first for that class.

## 2. The play, measured

`run.mjs` drives `scripts/gr-sim.mjs` with a controller module and measures the reel the way the
door measures it. Every row below is one full headless run on seed `e9-dome-basin-01`.

| run | controller | result | reel (compact / entries) |
|---|---|---|---:|
| `baseline` | heat 12's `tune-3`, verbatim | **w16 / 499.200 s**, `fnv1a32:2b4a09b5` — the heat's line, reproduced exactly | 217,452 / 265 |
| `v1` | rebuilt short-array policy | w14 / 427.267 s | 28,730 / 103 |
| `v2` | rebuilt long-array policy | w10 / 326.200 s | 249,698 / 271 |
| `v3` | tune-3 + the three defect fixes | w18 / 553.700 s | 318,892 / 399 |
| `v4-income` | v3 + income-tilted upgrades | w10 / 308.167 s | 65,097 / 80 |
| `v4-beacons` | v3 + 6 sentry beacons after 12 palisades | w19 / 590.333 s | 213,425 / 285 |
| `v5a/v5b/v5c` | + always-buy-a-palisade fallback | w15 / w17 / w18 | see summaries |
| `v6a` = `v7a` | 4 beacons after 18 palisades | **SECURED w20 / 600.000 s**, `fnv1a32:d9948f99` | 290,798 / 370 |
| `v6b` | 4 beacons after 12 palisades | **SECURED w20 / 600.000 s**, `fnv1a32:26e7a0a2` | 230,233 / 296 |
| `proof` | 6 beacons after 15 palisades | **SECURED w20 / 600.000 s**, `fnv1a32:2381e895` | 248,830 / 324 |
| `lever-bank` | `proof`-class ladder, contract lever applied | w18 / 556.900 s — the lever LOST two waves | 278,644 / 352 |

### The baseline death, at file:line resolution

`baseline-trace.json`, one row per view:

```
t=395.7  w13  26 works standing, 0 wrecked, 2002/2024 hp, 13 wreckers alive
t=425.7  w14  20 standing,  6 wrecked, 1445/2024 hp, 15 wreckers
t=456.3  w15   0 standing, 26 wrecked,    0/2024 hp, 30 wreckers
t=487.2  w16   0 standing, 28 wrecked, hero 100/175, gold 29 unspent
t=499.2  w16  hero 0/175 after 43 s of undefended contact, gold 80 UNSPENT
```

The wall dies first and the hero, which nothing can defend (nearest build ground 28.28 wu from a
welded hero, turret range 16), follows in 43 s. Three defects in the heat's controller, all visible
in that trace and all fixed in `v3`:

1. **A collision blacklisted the ground.** `ctrl-baseline.mjs` condemns a build position after two
   failures of any kind, and a WRECKED frame keeps occupying its position, so from t = 425 every
   BUILD returned `FAILED (collision)` and the pad could not be rebuilt. The last eight views are
   that failure repeating with 80 gold in hand. Cure: a collision marks the slot TAKEN and the
   ladder moves on; only a non-collision failure condemns.
2. **The palisade ladder stopped at 44 of the 48 permitted**, and the blacklist meant it only ever
   placed 24.
3. **It throttled its own decisions to defend a byte ceiling it was never near** (`SUB_BUDGET 205`),
   because the harness measured the pretty-printed file. See section 1.

### What actually won: sentry beacons

Six are permitted (`sentry_beacon`, radius 8, "slows what it touches", 25/35/45/55/75/95 g) and the
heat built none. In `v4-beacons` the wall held **0 wrecked from t = 170 to t = 522** on only twelve
palisades, and income rose from 1.74 to 2.1 g/s because the Prospector stopped commuting to mend.
The remaining tuning is the ladder ORDER: beacons must come after enough bait mass, and an
unaffordable 95 g rung starves the 10 g palisades queued behind it.

## 3. Margin, and where it falls short

Margin is measured by DECLINING the bank at the secure window (`SECURE_CHOICE rush`) and riding on,
so the number is seconds survived past the wave-20 gate rather than an impression:

| policy | secure | rode on to | margin |
|---|---|---:|---:|
| `v6b` | w20 / 600.000 s | 608.367 s | 8.4 s |
| `v6a` / `v7b` | w20 / 600.000 s | 622.767 s | 22.8 s |
| `v7d` (5 beacons after 15) | w20 / 600.000 s | 602.667 s | 2.7 s |
| **`proof` / `v7c`** | **w20 / 600.000 s** | **628.367 s** | **28.4 s** |

**The master's bar is 60 s and the best measured margin is 28.4 s.** At the secure the hero holds
94/175 with 6 of 25 works standing: the map is won, and it is won on the last wave, not comfortably.

## 4. The lever, tried and measured NEGATIVE

The smallest per-contract lever available is an existing authored key: `buildingDamageScale` on the
`e9-dome-basin` `feral_terraformer` roster row (`AUTHORED_ENEMY_KEYS`, read by
`WaveSystem.optionsForVariant` -> `Enemy` constructor -> `Enemy.buildingDamage`, one path serving
both engines). Set to 1 (from the `Balance.e9Roster` default 1.4, a 28.6% cut in wrecking pace) it
made the SAME controller that secures at 600.000 s die at **w18 / 556.900 s** — two waves worse.
A deterministic seed is not monotone in a difficulty dial for a fixed policy: softer wreckers change
which frames survive, which changes every repair target and every walk after it.

**No lever is landed.** The map is winnable as authored, and the one lever measured did not widen
the win.

## 5. Determinism

`v6a` and `v7a` are independent runs of the same effective policy: byte-identical tapes apart from
the minted UUID suffix in `id` (content id `agent-c4f0287e` in both), same event-log hash
`fnv1a32:d9948f99`, same tape hash `fnv1a32:24ada477`.

## 6. Idle floors

`assets/contracts/null-floors.json` is unmoved for this contract, re-measured on this tree:

```
e9-dome-basin-01  secured false, waves 2, timeMs 82600, gold 0, kills 34, fnv1a32:85282db9
e9-dome-basin-02  secured false, waves 2, timeMs 79567, gold 0, kills 31, fnv1a32:bc51140e
```

Both match the banked rows exactly. Nothing regenerated.

## 7. Files here

- `run.mjs` — the measurement harness (drives gr-sim, records the trace, measures the reel COMPACT).
- `ctrl-baseline.mjs` — heat 12's `tune-3` controller, unmodified.
- `ctrl-v1..v5.mjs` — the ladder of attempts; `ctrl-v4.mjs` is the one that secures
  (`GR_BEACONS`, `GR_BEACON_AFTER`, `GR_MENDS`, `GR_MENDGOLD`, `GR_SECURE` knobs).
- `probe-envelope.mjs`, `probe-corpus.mjs`, `probe-table.mjs` — the envelope measurements.
- `shots.mjs`, `shots/` — plain-boot screenshots, desktop 1280x720 and 390x844, zero console errors.
- `*-summary.json`, `*-trace.json`, `*-tape.json` — one set per run. Redundant ablation TAPES were
  not retained; every ablation's numbers survive in its summary and trace.
