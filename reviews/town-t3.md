# Review — Town T3: the tavern contract board (the run launcher)

- **Slice:** town-T3 (`specs/town-v1` T3) — the tavern board becomes THE run launcher.
- **Branch/tip:** `lane/m4` @ `0726fdf` "town: add tavern contract board".
- **Merged to main:** s140 fire, 3-way `--no-ff` onto clean main (see commit below).
- **Verdict:** PASS — merged.

## What it does
Turns the tavern shell into the contract board that starts runs from inside the world. Entering the tavern renders parchment cards built from the E1 contract manifests (name, ledger blurb, difficulty tag, unlock state; locked cards show their unlock condition in plain words). Selecting an unlocked card launches the run with that contract's config via the same `?contract=` path the loader uses — now player-facing through a staged `sessionStorage` launch key (`gr.contract.launch.v1`) that whitelists the requested contract past the debug gate. Menu **New Claim** reroutes through the board's default contract (`the-claim`); post-run overrun/victory returns THROUGH the town board (spec ratification default 2, one-click skippable). Best-result read is threaded onto score records via a new optional `contractId` field. Unlock conditions evaluate from existing per-profile/scoreboard state — no new tracking.

## Merge classification (base `4ff6ea2` = s139 refill; main advanced to `84a4cf0`)
- main moved only `STATUS.md` + `tasks/BACKLOG.md` since the merge-base → **fully disjoint** from every T3 src/e2e file. Auto-merge clean, no conflicts, no 3-way hand-resolution needed.
- All 12 files **LANE-TOUCHED** (T3-authored); zero MAIN-MOVED overlap.
- Firewall verified: Game.ts (+3), Scoreboard.ts (+2), DeathOverlay.ts (+1), ContractFamilies.ts (+launch-stage/search-aware selection), main.ts (board/return wiring), TownScene.ts + town.css (board UI), e2e — all **additive**; no removal of committed code outside firewall (gate-rider check clean).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 777ms |
| `town-t3-board.spec.ts` desktop-chrome | 6/6 pass |
| `town-t3-board.spec.ts` mobile-chrome | 6/8 first pass; the 2 reds (`board launch loads Dry Gulch`, `post-run overrun returns`) were **load-flake** (30s click-timeout under two concurrent lane gates) — **re-ran isolated single-worker: 2/2 PASS (10.3s + 3.7s)**. Fingerprint F-S140-1. |
| Adjacent single-worker both projects | **42/42** — town-t1 (2), town-t2 (3), e1-dry-gulch, m1-01 (4), m2-01 (6) × 2 projects |
| Screenshots | `artifacts/town-t3/` — desktop+mobile mixed-lock board + 390px board |

## Findings
- **F-S140-1 (non-blocking, environmental):** the T3 mobile suite load-flakes (element-click timeout) when two lane gates run concurrently; passes single-worker in <11s. Not a slice defect. Standing guidance already: run suspect reds single-worker.
