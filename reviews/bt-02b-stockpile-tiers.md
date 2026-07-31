# bt-02b — stockpile tiers

- **Slice:** `bt-02b-stockpile-tiers` (BT ladder, building-tiers)
- **Branch / lane:** `lane/m4` (lane-b) · runner tip `2b4f1615` · merge-base `625831a8`
- **Merged to main:** `5528331e50fa179cf0a42f1b3df57117a46de945` (s1314 fire)
- **Task master:** `tasks/lane-b-bt-02b-stockpile-tiers.md` (v2, re-authored s1313 after v1's lawful firewall STOP)
- **§3.0 drain-block-check:** ✅ CLEAR under `--strict`, matched by name (`bt-02b-stockpile-tiers`, status `queued`)

## Verdict

**MERGE.** The Stockpile Yard is now a purchasable three-rung upgrade whose every cap write is
tier-aware, whose tiered save restores at its real cap, and whose demolition returns the cap to
baseline with no orphaned source. Three findings ship with it, all out-of-firewall and all
reported by the runner rather than silently fixed; one (F-1314-3) is a player-visible text defect
that this merge *opens the door to*, and it spawns a corrective task in this same commit.

## What it does

Before this slice a Stockpile Yard contributed a flat `150g` cap at every conceptual tier, and
`upgradeBuilding` rejected it outright — the tier was not merely inert, it **could not be bought at
all** (s1313's correction of s1312's "buys nothing" framing). The slice adds
`Balance.tiers.stockpile` (`capMult 1 / 1.6 / 2.4`, costs `0 / 110 / 260`), adds `capMult` to
`TierStat`, adds `stockpile` to both hand-maintained upgrade registries, and routes all four cap
write sites — placement, repair, upgrade, restore — through the existing `effectiveStat` helper
against the existing `stockpile:${index}` key. With the `200g` base cap one stockpile now yields
`350 → 440 → 560`. The cost curve clears the spec's `^1.6+` valve (`260/110 = 2.36`).

The runner chose **refresh-after-tier** in `restoreBuilding`: `finishPlacement` keeps its
established initialisation and the restored tier then replaces the same keyed cap source, rather
than reordering placement init. Lower risk, and it makes the orphan-cap question structural.

## Evidence

All Playwright runs `--workers=1` per §3.1, both projects, on the merged tree.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.98 s; only the pre-existing chunk-size advisory |
| Slice spec `e2e/bt-01-tiers.spec.ts` | **18 passed / 4 failed** (3.2 m) — 4 reds fingerprinted PRE-EXISTING below |
| Adjacent suites (derived, see below) | **37 passed / 1 failed** (5.8 m) — red fingerprinted PRE-EXISTING below |
| `test:node-guards` (203-test set, run via `node --test`) | **203 passed / 0 failed**, 40.1 s |
| Plain boot `e2e/trail-guide-plain-boot.spec.ts` | **2/2**, desktop + 390 px, zero console/page errors |

**Adjacent suites were derived by changed write site, not taken from the runner's list**
(house law). The slice moves four cap writes, so: `build-placement-pure` (placement),
`m2-05-base-damage-repair` (repair), `run-suspend` (restore — the highest-risk one, since
`restoreBuilding` changed), and `m2-04-gold-stealing` (the economy-cap consumer).

### The five reds, each fingerprinted with my own merge-base control

I did not accept the runner's "unchanged assertions" claim. Control method: revert the merge's
three behavioural files (`src/systems/BuildSystem.ts`, `src/game/Balance.ts`,
`e2e/bt-01-tiers.spec.ts`) to merge-base `625831a8`, re-run the named assertions, restore
byte-exact (sha256-verified, `MATCH = true` on both controls).

1. **`bt-01-tiers` × 4** (`Enter tears down after clicking upgrade…` and `insufficient gold leaves
   tier and gold unchanged`, both projects). Control: **the same 4 fail at merge-base**, same
   assertions, at pre-merge coordinates `:345` / `:211` rather than `:395` / `:205`. The line
   shift *is* the evidence that the control ran the pre-merge spec. **PRE-EXISTING.**
2. **`m2-04-gold-stealing:211` (mobile only)** — not in the runner's report, found by my derived
   adjacent set. Discriminated in three steps rather than judged: it survives an **isolated**
   re-run (so not a load flake), and the control at merge-base **fails identically** at
   `:226 expect(timeAlive - spawnedAt).toBeLessThan(20)`. That is exactly the documented
   **F-1156-2** dominant m2-04 red (regression F-1147-1, observed ~20.999), whose cure is
   **owner-gated** behind the E① pathing thread F-1131-5. **PRE-EXISTING and already classified.**

Collection arithmetic agrees with the runner: `2452 → 2454` tests across `345 → 345` files —
exactly one new test in two projects. Node guards `203 → 203`.

### Merge classification

One commit (`2b4f1615`), six paths, **all LANE-ONLY** — `git diff --name-only` of each path
between merge-base and `main` is empty, so main never moved any of them since the fork. No
3-way graft, no conflict, no MAIN-MOVED file. Merged `--no-ff` onto main with the working tree
clean across every merge-relevant path.

### Behavioural proof (the doubled bar s1313 set)

s1313 pre-declared that a green missing **either** the demolish/orphan-cap result **or** the
save/restore round-trip is a STOP. Both are present in the new test and both passed on both
projects:

- **Save/restore:** captured suspend carries tier 3; after `restoreSuspend` the building is still
  tier 3 and the Economy cap is `560g`, not the flat `350g`.
- **Demolish/orphan cap:** demolishing the restored tier-3 stockpile returns the cap to the
  pre-build `200g`. One key (`stockpile:${index}`) is used by all four writes, so
  `addCapSource` is a keyed replace and `teardownBuilding` deletes that same key — the hazard is
  structurally prevented *and* now measured, which is the pairing s1313 asked for.
- **Mistake #10 answer:** in a plain boot the player opens build mode, approaches a built
  Stockpile Yard, and its context card offers the next tier, then shows the attained tier and the
  tier-3 ceiling. Screenshots: `artifacts/bt-02b-stockpile-tiers/desktop-chrome-tier-3.png`,
  `…/mobile-chrome-tier-3.png`.

## Findings

**F-1314-3 — 🔴 PLAYER-VISIBLE, AND THIS MERGE IS WHAT EXPOSES IT. Buying a Stockpile tier floats
`Turret II - brass cadence quickens`.** Verified at source, not inherited: `upgradeFloatText`
(`src/systems/BuildSystem.ts:1996-2001`) branches on `sluice` and `palisade` and **falls through to
a turret default at `:2000`**; it is called at `:1254`, inside `upgradeBuilding` — precisely the
path this slice just opened for `stockpile`. Before the merge no stockpile could reach it. The
same turret-fallback shape exists in `tierGain` (`:1990-1994`, fallback `:1993`), whose `gain`
string is built at `:1931` — the runner reports it is not currently rendered, which I did not
independently confirm and mark **UNVERIFIED**. Non-blocking (the cap, the save/restore and the
demolish path are all correct; this is a label), but it spawns a corrective in this same commit.

**F-1314-4 — 🟠 the build menu and the encyclopedia have no cap-per-tier line for the stockpile.**
`buildableTierEffectLine` (`src/game/buildables.ts:181-196`) has explicit palisade / sluice /
turret branches and no stockpile branch. The runner named one consumer (the build-menu card,
`BuildSystem.ts:528`); **there is a second it did not name — the encyclopedia
(`src/encyclopedia/registry.ts:353`)**. So a player who upgrades a stockpile sees the correct
in-world context card but no tier effect line in either of the two menu surfaces. Folded into the
same corrective.

**Non-finding, recorded so it is not re-derived:** steal-pressure coupling remains absent and was
correctly not implemented; `Economy.ts`, `Upgrades.ts`, `ResearchChart.ts` and the
`upgrade:stockpile_cap` research source were not touched, so the research cap source and the
building cap source remain separate.

## Corrective spawned in this commit

`tasks/lane-a-f1314-3-stockpile-tier-voice.md` → queued to **lane-a** (verified `USABLE` by
`scripts/lane-usable.mjs` before the copy). It covers F-1314-3 and F-1314-4 together, because both
are the same defect class — a hand-maintained per-buildable branch list that gained a fourth member
without gaining a fourth branch — and splitting them would leave the player half-informed either
way.
