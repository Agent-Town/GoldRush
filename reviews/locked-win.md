# Review — locked-win (THE LOCKED-WIN LAW, owner-P1)

**Slice:** lane-locked-win · **Branch:** lane/m3 · **Tip:** 0b0aa8e3 · **Merged:** c21d1839 (--no-ff) · **Base:** 1a477b66 (fresh, ~3 commits back)
**Drained by:** s888 fire · 2026-07-22T09:xxZ · **Verdict:** ✅ PASS — merged to main.

## What it does (one paragraph)
Implements the owner's ruling from the game's first external tester (2026-07-21, verbatim: *"I would just make the win condition 10 waves so after 6 minutes there is a feeling of accomplishment - everyone can keep playing after that. It has to be clear that the win is already locked in if they continue."*). Reaching a map's `secureWave` is now **THE WIN, LOCKED** — the victory result (medal, banked outcome, telemetry row) is written AT THE SECURE MOMENT, not at run end. Continuing is free play: rewards keep accruing, a post-secure overrun ends the run but the recorded win STANDS. A persistent HUD chip ("CLAIM SECURED ✓") states the win is banked while continuing, so no player wonders whether dying now loses the win. The Claim's `secureWave` drops 20→10 (both its contract datum in `epoch-1-frontier/contracts.json` and its charter `the-river.json`, id=`the-claim` — same map, kept in sync); its card GOALS/RULES copy updated to match in-world voice. Telemetry records both `secureWave` reached and deepest wave continued (the Assay Office learns what first-timers actually do). All other maps' secure waves untouched.

## Evidence (real numbers, s888 fire, merged tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | ✓ built in 1.49s |
| `e2e/locked-win.spec.ts` + `task-023-victory-palisade` + `task-027-victory-must-matter` (desktop+mobile) | **22 passed (32.9s)** |
| `e2e/e1-baron.spec.ts` + `task-025-bandits-dont-swim` (desktop+mobile) | **22 passed (1.5m)** |
| Config | `playwright.s888-scratch.config.ts` — self-booting dev on :5288 (isolated from the hung lane-b accounts battery) |
| Console/page errors | zero (all specs boot the game and assert clean; every case green) |

Key guard cases proven green:
- `locked-win.spec.ts:65` — wave 10 banks the win; a wave-12 Rush death KEEPS it and records both wave marks.
- `locked-win.spec.ts:108` — leaving at secure follows the full victory ledger flow.
- `locked-win.spec.ts:122` — **The Claim card names wave 10 while Night Shift and Baron keep their tuned secure waves** (firewall: other maps' win conditions unchanged).
- `e1-baron.spec.ts:675` — same-frame overrun + Baron kill does not award the medal (secure/win resolution ordering intact).

Screenshots (shipped with the slice): `artifacts/locked-win/{desktop,mobile}-chrome-secured-chip-mid-rush.png`, `artifacts/locked-win/{desktop,mobile}-chrome-summary-after-rush-death.png`.

## Merge classification
Base `1a477b66` (the alt-shift WALL-LIFTED commit). Main's commits since base (rehearsal ledger cc296891, gitignore 67798e3d, s888 STATUS/queue bookkeeping) touch **no src/e2e/assets** the slice touches → every file is **LANE-TOUCHED only**, clean `git merge --no-ff`, zero conflicts. 20 files, +449/-97.

| File | Class |
|------|-------|
| `assets/contracts/epoch-1-frontier/contracts.json` | LANE — the-claim `twist.secureWave: 10` + card copy (only the first/the-claim entry; epoch-2..6 untouched) |
| `assets/charters/the-river.json` | LANE — same map (id=`the-claim`), `twist.secureWave: 10` kept in sync |
| `src/game/{Game,RunManager,RunSuspend,Scoreboard}.ts`, `src/core/EventBus.ts`, `src/meta/ContractFamilies.ts` | LANE — secure-moment win resolution + banked event |
| `src/ui/DeathOverlay.ts`, `src/ui/theme.css` | LANE — post-secure summary "win stands" + CLAIM SECURED chip |
| `src/telemetry/{payload,runBeacon}.ts`, `functions/api/telemetry.ts` | LANE — secureWave-reached + deepest-continued rows |
| `e2e/locked-win.spec.ts` | NEW spec |
| `e2e/task-023-victory-palisade.spec.ts`, `e2e/task-027-victory-must-matter.spec.ts` | LANE — adjacent victory specs updated for the new secure semantics |
| `artifacts/locked-win/*.png` (4) | NEW evidence shots |

## Findings
- **F-1 (non-blocking, note):** `assets/charters/the-river.json` display `name` is "The River" while its `id` is `the-claim` and the contract boardRow name is "The Claim" — the two data sources use different display names for the same starting map. Not a defect for this slice (both correctly carry secureWave 10); flagging for the owner in case the map's display name should be unified. No corrective spawned.
- No blocking findings. Firewall respected: no wave/difficulty tuning, no other maps' win conditions, Economy stays sole gold writer, all changes inside secure/win resolution + HUD chip + the-claim datum + specs.
