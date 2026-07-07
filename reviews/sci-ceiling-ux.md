# Review — sci-ceiling-ux (lane-a, s110 drain)

**Slice:** SCI ceiling / "Continued Study" — make the science ceiling read forward instead of a dead-end.
**Lane commit:** `542371a` (lane/m3) "sci: make science ceiling promise forward"
**Merged:** onto clean main (s110 fire), `--no-commit` gated then committed.
**Verdict:** ✅ PASS — merged.

## What it does
- Science meter, once `steps >= STEAMWORKS_THRESHOLD`, stops reading `"… (locked)"` and reads
  `"Epoch science complete — the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.)"` plus a `banked: +N toward the Steamworks` span (DeathOverlay + StartMenu, `data-testid="science-banked"`).
- **Continued Study**: once the normal research frontier is exhausted (`frontier.length === 0`), `availablePicks` surfaces three repeatable nodes (Seam Yield / Turret Damage / Stockpile Ledger). Each take grants a small run-stat payload: `+1% seam yield`, `+1% turret damage`, `+5 stockpile cap` (`continuedStudyBonuses`).
- Wiring: `Game.applyResearch*` now passes `1 + continued.seamYieldMult` / `1 + continued.turretDamageMult` into `HarvestSystem.applyStats` / `BuildSystem.applyStats` (both signatures extended with an optional param, **default 1 = behavior-safe**), and folds `continued.stockpileCapBonus` into the assay-grading cap source. `scienceView` diagnostics gain `overflow` + `continued`.

## Firewall check ✓
- **No `Balance.ts` constant edits** (not in diff). **No threshold change** — `STEAMWORKS_THRESHOLD` still `loadEpoch('epoch-1-frontier').threshold`. **No epoch-2 / meta change.** Multipliers are additive run-stat payloads that default to 1/0 on a fresh run (identical behavior when no Continued Study is taken).
- Touches beyond the "meter-copy only" s108 note (BuildSystem/HarvestSystem/DeathOverlay/StartMenu/Game/vite-env) are the **legitimate reward payload** of Continued Study — a repeatable node that granted nothing would be a no-op button. Accepted as in-scope for the slice's ratified intent ("infinite Continued Study repeatable proposals").

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (526ms; only the pre-existing >900kB chunk-size advisory).
- Science e2e (both projects): **sci-01 + sci-02 + sci-03 + sci-04 = 48/48 passed**, including the extended sci-01 cases (ceiling copy, banked counter, Continued-Study proposal, victory second round, launch/live effects, registry-per-profile).
- Boot probe (`_s106-sci-copy-boot-probe`, both projects): **2/2 passed, zero console/page errors.**
- Adjacent economy/build/wave (m1-03 / m1-04 / m1-05, both projects): m1-04 fully green; **F-S110-1** and a renderer flake noted below — both out of blast radius.
- Lane's own captured screenshots merged in: `artifacts/sci-ceiling/{desktop,mobile}-chrome-{ceiling-meter,continued-study-proposal}.png`.

## Findings (non-blocking, flagged for Robin)
- **F-S110-1 (pre-existing, NOT this drain):** `e2e/m1-03-wave-pressure.spec.ts:89` ("resetRun mid-wave … opens with the claim banner") hard-fails on `getByTestId('hud-wave')` expecting `"Stake your claim."` but receiving cycling `hud-wave` content — prospector chip hints ("the Prospector: follows and observes…") and wave warnings ("South bank dust is moving!"). At `?timescale=8` the "Stake your claim." banner is immediately overwritten. **My merge touches ZERO wave/HUD files** (`git diff --cached --name-only` has no wave/Hud/m1-03 entry) — identical code path in main and merged tree → pre-existing, introduced when prospector-presence (s106) began cycling hints through the `hud-wave` slot. Fix belongs to a HUD-banner corrective (either give the claim banner a hold window after reset, or assert against a dedicated testid), not here.
- **Renderer flake (F-042 family):** `m1-05-sentry-beacon-build.spec.ts:112` ("… keeps renderer memory stable") flaked under concurrent + first serial load, **passed on retry**. Known WebGL-context concurrent-load flake; non-blocking.
