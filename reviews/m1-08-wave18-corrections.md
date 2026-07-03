# Review: m1-08 wave18-corrections — PASS

Session s7 (scheduled, 2026-07-04). Implementer: Codex H `019f28fa-1735-7bf0-899b-c8fdbe9446bd` (~13 chunks; write-livelock on the e2e file un-stuck by the s4 low-reasoning remedy). Spec: `specs/m1-core-loop/slices/08-wave18-corrections.md` (BINDING, Robin wave-18 findings).

## Verdict

All three product-owner findings fixed with evidence. **No game-code findings.** One test-authoring defect fixed supervisor-side (<20 lines, permitted class). No Codex correction round needed.

## Evidence

- `tsc --noEmit` clean · `npm run build` green.
- **Full regression 51/51** (serial, desktop-chrome, hermetic base config, per spec file): visual 5 · feedback-fx 3 · m1-01 4 · m1-02 3 · m1-03 5 · m1-04 4 · m1-05 6 · m1-06 8 · m1-07 7 · **m1-08 6 (new)**.
- Zero console/page errors asserted inside the new spec's tests.
- Shots in `reviews/shots-m1-08/`: `death-ledger-desktop.png` (1280×800), `death-ledger-mobile.png` (390×844), `filler-cards-desktop.png`.

## Fix 1 — lifetime Gold Panned (root cause confirmed)

`Game.endRun()` emitted `goldPanned: this.economy.gold` (held at death). Now: pure `summarizeLog(log)` in `Economy.ts` → `{panned, granted, spent, beaconsBuilt}`; shadow counter `this.goldPanned` DELETED (log is the single truth). Death ledger + scoreboard use derived panned; Run Ledger gains **Spent** and **Beacons Built** lines (screenshot shows Panned 0 / Spent 25 / held 15 simultaneously — the exact confusion Robin hit, now visibly distinct). New `gold_granted` event (`source: 'upgrade_assay' | 'debug'`); `__GR_TEST__.grantGold` rerouted to it (was polluting `gold_panned`). `logCapacity` 128 → 2048 (truncation would silently under-count the derive). `run_reset` zeroes the summary (per-run lifetime).

## Fix 2 — beacon falloff knob round

`Balance.beacon.damage` 8 → **10**, new knob `damagePerWave: 0.75` (bolt damage = damage + perWave × current wave, computed at fire time via `ShooterHandle.getDamage`; hero rig untouched; no targeting change). Both in lil-gui. Acceptance e2e: 2 beacons + hero vs 3× wave-10-HP (87) clump → cleared well inside 12 s with hero ≥ 50 HP (ran 11 s incl. setup). Recorded in the slice spec.

## Fix 3 — upgrade-pool exhaustion

3 filler defs (`assay_bonus` +15 gold · `field_dressing` heal 30 capped · `sharpen` +5% dmg), `filler: true`, infinite stacks, patent-office copy + dedicated procedural glyphs (receipt / bandage / whetstone — screenshot attached, canon-clean). `rollOffer`: core-first, filler-pad to 3, never a maxed card. `beginChoice` while-loop consumes pending levels when nothing offerable — no freeze (e2e-proven with `setFillersDisabled(true)` harness hook). Instant effects flow through seams: assay → `Economy.apply(gold_granted/upgrade_assay)` + gold float; heal → `onHeal` callback + green float (standing float rule honored); sharpen → normal additive StatSheet delta. No double-heal: tinkers stays special-cased by `pickedId`, field_dressing only via `onHeal`.

## Supervisor fixes (test-only, in-slice)

1. Test 1 deadlock+race: placed beacon while hero stood ON the seam (ghost overlap-invalid → `ghostValid` poll timeout) while channeling kept adding pan ticks. Fixed: teleport off-seam (3,12 — terrain proven by test 6), capture exact `panned`, assert ledger equals it AND ≠ held. 2. Hardened same test to poll `economy.summary.spent` instead of raced `gold === 0`.

## Carried minors (no correction round)

- Filler card description descenders sit close to the bottom pip (slight clip on "patent."/"kit.") — fold into next UI polish pass.
- `summarizeLog` also runs in per-frame diagnostics publish next to the pre-existing per-frame replay-reduce; with capacity 2048 that is 2× O(n)/frame in the diagnostics path. Fine today (frameMs gates unchanged) — throttle the diagnostics economy section in M2 if it creeps.
- Two code paths for the `heal` delta (tinkers via `applyStats`, field_dressing via `onHeal`) — consolidation candidate for a future `refactor-clean`.
- `weight: 1` on filler defs is dead data (uniform roll) — matches the carried uniform-weights item from m1-06.

## New harness surface

`__GR_TEST__.setFillersDisabled(bool)` · `economyLog()` · `summarizeLog(events)` · `setBeaconWave(n|null)`; diagnostics gains `economy.summary` + `deathLedger.spent/beaconsBuilt`.
