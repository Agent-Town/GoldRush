# Review — tasks/022 / m2-07 base self-hold (s35 fire, 2026-07-05)

**Verdict: INTEGRATED.** Primary acceptance gate (Robin's binding ruling: base holds itself) passed in-VM with direct evidence. One test-side portability finding, one process finding on the blast knob. Full-regression + TTK numbers owed from Robin's Mac (evidence-first protocol).

## Scope (matches task firewall, two justified touches beyond)
- `src/game/Balance.ts` — durability curve: palisade perWave 4→8 capMult 2→3; NEW turret + sentry_beacon hpWaveScale entries (perWave 8/6, startWave 6, capMult 3). Turret: damage 26→52, fireRate 0.8→1.1, range 12→16 (≈2.75x DPS — thin-before-contact intent). blast.dmgPerWave 0.02→0.28 (see F-022-2).
- `src/systems/BuildSystem.ts` — `maxHpForPlacement` generalized from palisade-only to any hpWaveScale id. Required to make the curve real; minimal.
- `src/game/Game.ts` — confirmBuild publishes diagnostics + returns placed (4 lines, test-enabling). Slightly beyond "Balance + e2e only" firewall; accepted, no new system.
- `e2e/m2-07-base-self-hold.spec.ts` — NEW: self-hold probe (the m2-07 gate) + blast TTK ratio probe.
- Architecture watches: Economy sole gold writer ✓ (debug grantGold only), CombatSystem sole damage resolver ✓ (knobs only). Canon untouched.

## Gates (VM, /tmp/gr, chromium-1228)
| Gate | Result |
|---|---|
| tsc --noEmit | clean |
| vite build | clean (449ms) |
| **SELF-HOLD probe** (desktop) | **PASS** — 11/11 standing after 2 wave-15 pulse cycles +20s sim (gate ≥7), stockpile alive, wreckers present (4 @pulse2), 8 wrecker hits resolved, 0 console/page errors. Evidence: `shots-m2-07/self-hold-report.json` |
| Canary: m2-05b "wave-12 palisade line…repair cheaper" | PASS 14.9s (repair-cost vs raised maxHp — the riskiest assert) |
| Canary: m2-06 "blast friendly fire…" | PASS 10.0s (blast dmg ↑5x mid-wave) |
| Canary: m2-06 "turret line of sight…" | PASS 11.1s (range 12→16) |
| Canary: m2-07b "six blast stacks wave-15 clump" | PASS 10.0s |
| Boot smoke shots | `shots-m2-07/desktop-1280x800-base.png` (built turrets/palisades/beacon render, FL style holds), `mobile-390x844-boot.png` (touch controls intact), 0 errors both |
| Blast TTK probe | **NOT RUN TO VERDICT in-VM** — F-022-1 |
| Full regression | **Mac-owed** (VM 43s/call ceiling — see env laws in STATUS) |

## Findings
- **F-022-1 (test robustness, corrective owed):** TTK test races on slow envs — `waitForStableWave(minWindow=10)` leaves 10 sim-s = **0.83 wall-s at timescale 12** for ~5 protocol round-trips; deterministic fail here (`start.wave` expected 10/got 11, 3/3 attempts), will pass on darwin. Fix (test-side only): widen minWindow to ≥30 with `waves.waveInterval` pinned ≥40 during measurement, or freeze wave clock while measuring. Batch into next Codex task.
- **F-022-2 (process):** Task demanded TTK **data first, then knob** — Codex knobbed dmgPerWave 14x and built the instrument instead of reading run-summary logs. Accepted provisionally BECAUSE the committed probe is now the permanent instrument and gates the value (ratio ≤2). If Robin's Mac run fails the ratio, re-tune is a knob-only follow-up.
- Watch (not debt): self-hold final = 11/11 with 8 hits absorbed — the curve may be GENEROUS. If Robin's playtest says wave-15 pressure feels toothless, first lever down is turret damage 52→44, not HP.

## Robin owes (batched)
1. Mac: `npx playwright test` (full, both projects) — commit evidence file incl. `test-results/m2-07-base-self-hold/blast-ttk.json` numbers.
2. Start `scripts/lane-runner-v2.sh` (v1 is retired; it produced this very on-main drop).
3. Playtest turret feel (2.75x DPS is a big swing — your ruling, but feel it).

## F-022-1 corrective (s36, 2026-07-05)

Test-side de-race landed directly (review-fix authority, ~9 lines, e2e-only): `measureBlastTtk` now arrives two waves early (`waitForWave(target-2)`), pins `waves.waveInterval` 12→40 **before the target wave is planned** (WaveSystem plans just-in-time, telegraph-lead ahead; `waveInterval()` reads Balance live — so pinning at N−2 guarantees the ≥40 sim-s gap around wave N in both planning-race orderings), waits `waitForStableWave(target, 30, 60s)`, and restores 12 after each measurement. `test.setTimeout` 60s→90s absorbs the two pinned gaps.

Gates (in-VM, /tmp/gr-s36): tsc --noEmit clean; spec collects both projects; mechanism probe PASS (`shots-m2-07/f-022-1-mechanism-probe.json`) — detection at wave 5 with 39.99 sim-s window, still on-wave with 36.6 sim-s after 6 protocol RTs at ts12. Full TTK run remains **Mac-owed** (by design it now spans ~50s wall, over the VM's 43s call wall): Robin's regression run supplies blast-ttk.json numbers; ratio≤2 gate unchanged (F-022-2).

Env notes for next fire: `~/.cache/ms-playwright` symlink vanished again (s25 pattern) — set `PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers` per call; `~/locallibs` wiped — xdamage stub rebuilt from `scripts/xdamage-stub.c` into `/tmp/gr-s36/locallibs`.
