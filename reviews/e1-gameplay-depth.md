# E1 IN DEPTH — the release maps, played for gaps and gold
Session: dedicated Opus 5, branch `review/e1-gameplay-depth`, 2026-07-25 23:03 → 01:00 (+07).
Commission (owner, 2026-07-25 night): *"E1's maps are most important for the release... understand the gameplay and look for gaps and optimizations."*

## VERDICT LINE FIRST (the honest partial)
**Two of the five release maps never tell the player how to win, and silently double the win length.** That is tonight's gold, it is verified at source, and it is a copy-sized fix. **The five maps were NOT each played to a secured outcome** — the window went into building an honest-play instrument and the instrument was still one defect short when the window closed. What follows separates, ruthlessly, what was **played**, what was **verified at source**, and what remains **unverified**. Nothing here is inferred from a grep alone (claim-verification rule).

---

## 1. WHAT WAS ACTUALLY PLAYED (the honest-play ledger)
The honest-play doctrine forbids debug assists. The rig's E1 segments all use grinding shortcuts (`maxUpgrades`, `grantGold`, `placeFree`, `setWave`) — none of them can answer "is this map any good", so a new instrument was required: `rehearsal/segments/e1-depth-play.mjs`.

| Run | Map | Timescale | Waves reached | Outcome | Console/page errors |
|---|---|---|---|---|---|
| smoke | the-claim | 3 | 2 | died | 0 / 0 |
| smoke2 | the-claim | 3 | 1 | died | 0 / 0 |
| smoke3 | the-claim | 1 | 6 | budget out | 0 / 0 |
| smoke4 | the-claim | 1 | 6 | budget out | 0 / 0 |
| smoke5 | the-claim | 1 | 1 | died | 0 / 0 |
| smoke6 | the-claim | 1 | 6 | budget out | 0 / 0 |
| idle-probe ×2 | the-claim | 1 | 2 | halted at level-up | 0 / 0 |

**Only `the-claim` was booted and driven.** `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron` were **not played** — per the RESUME LAW the next session starts at `e1-dry-gulch`. Their findings below are source-verified, not play-verified, and are labelled so.

**Cited assists (the only two):** `?contract=<id>` (a *door* — the unlock ladder for these maps is science≥3 / 2-secured / firstSecuredClaim and cannot be walked inside one night) and `timescale` (a uniform sim multiplier, `Game.ts:2312`; it compresses wall clock only, and for a scripted driver it makes play *harder*, so it never flatters). No `maxUpgrades`/`grantGold`/`placeFree`/`setWave`/`setBalance`/`teleport` — grep the segment to confirm.

**One real-play datum worth banking:** across ~8 fresh-profile boots of the Claim, **zero console errors and zero page errors** (launch-gate line: "zero console on all five boots" — the Claim's boot is clean, the other four are unmeasured).

---

## 2. THE FINDINGS

### F-E1-1 — TWO RELEASE MAPS NEVER STATE THEIR WIN CONDITION, AND SILENTLY RUN 2× LONG ✓ VERIFIED (source)
The strongest finding of the night, and the cheapest to fix.

`src/game/Game.ts:4532` resolves the win length as:
```ts
secureWaveForRun(): number {
  return Math.max(0, Math.floor(this.activeContract.twist.secureWave ?? Balance.run.secureWave));
}
```
`src/game/Balance.ts:807` — `secureWave: 20`. So **any contract that omits `twist.secureWave` silently becomes a wave-20 map.** From `assets/contracts/epoch-1-frontier/contracts.json`:

| Map | `twist.secureWave` | Effective | Card tells the player? |
|---|---|---|---|
| the-claim | `10` | 10 | ✅ "Hold the claim through wave 10." |
| **e1-dry-gulch** | **absent** | **20** | ❌ "Work the dry washes around the lone spring." |
| e1-night-shift | `25` | 25 | ✅ "Survive to DAWN at wave 25." |
| **e1-twin-banks** | **`{}` (empty twist)** | **20** | ❌ "Build on either bank and watch both fords." |
| e1-baron | `20` | 20 | ✅ "The Baron rides at wave 20." |

The three maps that *state* a number have one; the two that don't, don't. Dry Gulch is the map a player reaches **immediately after** the Claim (`unlock: wave10OnClaim`) — so the first thing the game does after teaching "a claim is secured at 10" is hand the player a claim that is secured at 20 **without saying so**. That is a difficulty cliff wearing no sign, delivered to the exact player the release exists to serve — the first external tester who *"did not exactly understand what to do"* (RF-02's founding evidence).

Twin Banks is worse in kind: `twist: {}` is *completely empty*. Its two goal lines are a **description of the terrain, not an objective** — "Build on either bank and watch both fords" tells a stranger nothing about what ends the run.

This is an instance of the register's **MQ-7** (player-facing promises vs engine truth, status OPEN, "AUDIT OWED for the other 40") — filed as an instance, **not** re-filed as a class, per the register's law. Corrective: `tasks/DRAFT-e1-secure-wave-truth.md`.

### F-E1-2 — THE CONTRACT DOOR BOOTS STRAIGHT IN: NO START MENU, NO GREENHORN OFFER, NO TRAIL GUIDE ✓ VERIFIED (played)
Every one of the ~8 boots logged `(no start menu on this door — contract door boots straight in)`. Booting `?contract=<id>` skips the first-boot seam entirely: no start menu, no "First time prospecting?" greenhorn offer, no Trail Guide bark track. Difficulty still resolved to `trail` (correct — `ProfileStorage.ts:26` `DEFAULT_DIFFICULTY_PRESET = 'trail'`), so the *difficulty* default is sound.

Why it matters for the release: RF-02 (the Trail Guide) and the greenhorn offer are the release's whole answer to the first-tester lesson, and **the fresh-profile teaching path is not exercised by the door that testing uses**. Any tester handed a `?contract=` link — the natural way to share a specific map for feedback — gets the untaught experience. This is *not* a claim that the Trail Guide is broken in normal play (**✗ UNVERIFIED** — the plain-boot path was never reached tonight); it is a claim that the door bypasses it, which is exactly Mistake #10's shape (*"where does the PLAYER see this, in a plain boot?"*). Corrective: `tasks/DRAFT-e1-trail-guide-plain-boot-proof.md`.

### F-E1-3 — TWIN BANKS' SIGNATURE MECHANIC IS DATA-ONLY: IT DECORATES, IT DOES NOT CARRY ? INFERRED (source), NEEDS PLAY
The task asks per map whether the signature mechanic *carries the map or decorates it*. Twin Banks is the one that can be partly answered from source: its braid — `fords: [west-ford, east-ford]`, `buildZones: [south-bank, north-bank]`, `stakeMarkers` with `south-claim-stake.lossCondition: true` — is entirely **tileParams**, with an **empty `twist`**. Every other E1 map carries its signature in the twist where the run logic reads it (night's `lightRamp`, the gulch's `sluicesNeedWaterSource` + `seamYieldMult`, the Baron's whole act structure).

So the braid shapes *where things are*, and nothing in the run *asks the player about it*. That is the textbook shape of a decorating mechanic. Marked INFERRED because "does the geometry generate real two-front decisions in play" is a question only play answers — and Twin Banks was not played. **This is the single highest-value thing for the next session to play first**, ahead of even Dry Gulch.

### F-E1-4 — NOT A BUG: the idle-hero "freeze" is the level-up pause ✓ VERIFIED (played, and disproved)
Recorded because it nearly became a false finding. An unattended hero froze *totally* — hp 76, kills 24, alive 7, nearest enemy 2.8 m — identical across five consecutive 15-second samples. It reads exactly like a simulation halt. It is not: a follow-up probe caught `state: 'levelup'`, `pendingLevels: 1`, `offer: ['wide_ring','spring_heels','heavy_spark']`, overlay `aria-hidden=false`. The game is correctly waiting for an upgrade pick. **No corrective owed.** (Two-pass audit, per the claim-verification rule — pass 1 hypothesis, pass 2 killed it.)

---

## 3. THE INSTRUMENT, AND ITS ONE REMAINING DEFECT (handed forward, not hidden)
`rehearsal/segments/e1-depth-play.mjs` — parameterised: `node rehearsal/segments/e1-depth-play.mjs <contract> <label> <timescale> <budget-min> [mobile]`.

**Works, verified by play:** fresh user-data-dir per map (true first-boot feel) · Trail confirmed from diagnostics · reads the real rendered briefing · real WASD movement · **real pan economy** (gold 0→30 earned honestly; `panned=30`) · real upgrade picks off the real offer (`heavy_spark`, `powder_charge`, `spring_heels`, `double_tap_coil` all taken from the live overlay) · per-wave telemetry (hp/gold/panned/level/enemies/seams/builds/idle-fraction) · screenshots · local video · JSON report per run · console/page error capture.

**The defect (blocking, honest):** *builds never succeed* — 0/49 in the best run. Two of the three causes were found and fixed at source-truth during the session:
- `HarvestSystem.ts:355` — `if (collector.speed > Balance.goldSeam.slowSpeed) return null` → **you must actually stand still to pan.** (Fixed; this is what unlocked the real gold economy.)
- `BuildSystem.ts:1391-1394` — the ghost must lie within `placeRadius` **of the hero** → building is hero-local, not map-global. (Fixed.)
- **Still open:** with gold ≥ cost and a hero-local aim, `build.ghostValid` never returned true across 10 nudges. Remaining suspects, in order: the `canAfford` flag read true at `gold: 0` (so the affordability pre-check is not gating what it looks like it gates); `matchesPlacement` terrain rules (`Terrain.isBuildable` / `walkable`) may reject the river-claim ground the driver happens to stand on; `snap()` may move the ghost out of `placeRadius` after the raycast. **~15 minutes of probe would close this**, and it converts the instrument from "boots and pans" to "plays a map to secured".

Until that is closed, **no difficulty, pacing, dead-minute or dominant-strategy claim about any E1 map can be made from this instrument** — a driver that cannot build is not playing the game the maps are designed around. This review makes none.

---

## 4. THE RELEASE VERDICT — "is E1 ready to meet strangers?"
**Not yet, and tonight found one concrete reason why rather than a vibe.** Two of the five maps — Dry Gulch and Twin Banks — do not tell a stranger what winning is, and both quietly run twice as long as the map that taught them the rule. For a release whose entire purpose is *"push something out and get feedback"* from people who already told us they *"did not exactly understand what to do"*, that is a release-blocking clarity defect, not a polish item. It is also perhaps thirty minutes of work (F-E1-1's draft).

Beyond that, the honest answer is **unknown, and it is unknown for a reportable reason**: four of the five maps were never played, and the fifth was played by an instrument that could not build. The Claim boots clean (zero console/page errors, correct Trail default, briefing renders, pan economy works, upgrades offer and apply) — that is real, and it is the floor, not the verdict. The launch gate's own line — *census green on the 5 E1 maps · locked-win + rush verified · Baron 22/22 · Trail Guide plays for a fresh profile* — remains unproven by play, and this session did not prove it.

**Recommended next shift (in order):** close the `ghostValid` defect (~15 min) → play **Twin Banks** first (F-E1-3: the one map that may have no arc at all) → Dry Gulch (the cliff in F-E1-1) → Night Shift → Baron.

---

## 5. DRAFTS FILED
- `tasks/DRAFT-e1-secure-wave-truth.md` — F-E1-1, the win-condition truth fix (copy + data).
- `tasks/DRAFT-e1-trail-guide-plain-boot-proof.md` — F-E1-2, prove the teaching path in a plain boot.
- `tasks/DRAFT-e1-depth-instrument-ghostvalid.md` — close the instrument's build defect so the remaining four maps can be really played.

READY-FOR-GATES — with the scope stated plainly: this is a **verified-partial**. Evidence: `reviews/shots-e1-depth/*.png`, `reviews/shots-e1-depth/*-report.json`, local video in `e1-review-video/` (gitignored class). Gates not run — this branch touches no `src/`, no assets, no Balance, no contracts; the only non-review file is a new rig segment plus one `.gitignore` line.
