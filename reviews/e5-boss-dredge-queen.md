# Review — e5-boss-dredge-queen (the Dredge-Queen, E5's competing boss)

- **Slice:** lane-b-e5-boss-dredge-queen — the Dredge-Queen boss, acts 0-3, two-front Act 1, W6 persistence
- **Branch / tip:** lane/m4 @ `20747ed8` (runner auto-commit)
- **Merge commit:** `55ee01d63e24fdd9efa9195a75a8366ff3fd5ca9` (`--no-ff` onto main `804914ff`)
- **Base:** `567e69f9` (2h stale — the task's own author commit; main moved NONE of the shared files since → clean merge)
- **Drained by:** s665 fire, 2026-07-16

## Verdict
**PASS — merged.** Owner-ratified E5 boss (choreography ratified in `specs/epoch-saga/e5-deepwater-bundle.md` §boss + §OWNER RULING 2026-07-16). Gate battery green on the merged tree; unblocks the E5→E6 ladder. One non-blocking finding (F-1, out-of-firewall RunSuspend serialization, codex-reported).

## What it does (one paragraph)
Adds `DredgeQueenBossSystem` — a component boss (CLAW / PADDLES×2 / HOLD) on the e5-deepwater-claim contract, following the crawler/land-yacht house pattern (CombatSystem stays the sole damage resolver; the boss system orchestrates acts). **Act 0**: her silhouette rides storm front 1 and anchors over a wreck site. **Act 1 (the owner's two-front correction)**: the claw works a visible cycle timer banking loot to a `HOLD n/5` counter (mid-cycle hits interrupt the transfer), while destroying BOTH paddles is the required gate to Act 2 — she repositions between wreck zones while any paddle lives; escort skiffs screen her. **Act 2**: paddles gone → no reposition, telegraphed defensive front-arc swat (disabled by killing the claw), intensified escorts, attackable hold. **Act 3**: hold cracked → all banked units SPILL as gold pickups (sea's handling fee = scatter radius), crew QUITS WARM (skiffs row off the map edge, never slain), the hulk settles. **W6**: on defeat, a profile-scoped flag `gr.e5W6Wreck.v1` (via `gr.profile.v2` scope, never global) mounts the settled hulk as a permanent wreck prop on every subsequent run of that contract under that profile — the saga's first persistence beat.

## Evidence (real numbers, merged tree, scratch config port 5231, --workers=1)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (777ms) |
| `e2e/e5-boss-dredge-queen.spec.ts` (own) | **8/8** — desktop + mobile |
| `e2e/e5-deepwater-claim.spec.ts` (tile, adjacent) | green (part of 22/22) |
| `e2e/e3-crawler-boss.spec.ts` (precedent, adjacent) | green (part of 22/22) |
| `e2e/task-025-bandits-dont-swim.spec.ts` (baseline, adjacent) | green (part of 22/22) |
| Adjacent battery total | **22/22** — desktop + mobile |
| Boss-run frame p95 vs non-boss tile | desktop 0.9747, mobile 0.8983 (ceiling 1.15) — boss runs *faster* |
| Console/page errors | zero (asserted in-spec) |

Key spec assertions verified: Act 2 unreachable while any paddle lives + both-paddle destruction transitions to Act 2 (the owner's correction made testable, `:124`); claw mid-cycle interrupt cancels loot transfer (`:175`); defensive-claw arc damages only inside telegraph (`:198`); Act 3 spill + skiff exit + hulk prop persists; W6 second-boot mounts wreck under same profile, fresh profile does not; perf (`:220`).

## Merge classification (per-file)
Base `567e69f9`; main moved none of the shared files since base → all files clean-apply, no 3-way judgment required.

| File | Class | Note |
|---|---|---|
| `src/systems/DredgeQueenBossSystem.ts` | NEW | 640 lines, the boss orchestrator |
| `e2e/e5-boss-dredge-queen.spec.ts` | NEW | 244 lines, gate-authorship spec |
| `reviews/shots-e5-boss-dredge-queen/*.png` (6) | NEW | act1/act3/w6 desktop + mobile |
| `src/game/Game.ts` | LANE-TOUCHED | ~71 lines, boss-integration site (crawler-precedent-sized) |
| `src/game/Balance.ts` | LANE-TOUCHED | additive `dredgeQueen` block |
| `src/game/ProfileStorage.ts` | LANE-TOUCHED | additive W6 key, `gr.profile.v2` scope |
| `assets/contracts/epoch-5-deepwater/contracts.json` | LANE-TOUCHED | boss-hook wiring |

**Balance `dredgeQueen` block (placeholder-reasonable, playtest-tuned later):** approach 3s; HP claw/paddle/hold 80/110/140; cycle 2.5s; 5 loot units × 8 gold; reposition every 2 cycles at speed 10; swat cadence/telegraph/radius/damage 2.5s/0.8s/5/12; spill radius 8; Act 2 multiplier 2 + 3 immediate reinforcements; exit speed 12.

## Findings
- **F-1 (non-blocking, codex-reported, out-of-firewall):** RunSuspend serialization of an *in-progress* Dredge-Queen fight is outside this task's firewall — mid-fight save/restore is not serialized. W6 persistence itself is unaffected (verified in-spec: defeat→flag→second-boot mounts wreck). Not a regression; the fight simply doesn't survive a mid-act suspend. Defer to a follow-up if playtest surfaces it. No corrective task spawned (out of scope, no player-facing break in normal play).
- Canon: no firearms (frontier-tech claw/paddle/dredge machinery), crew quit warm (never slain) — compliant with ADR-001 / brief §9.

## Player-visibility (Mistake #10)
The boss triggers on the e5-deepwater-claim contract at its wave threshold in a plain boot (no `?debug`); the spec boots the boss run via the tile's normal board-launch pattern and drives the full choreography. The paddle-gate assertion uses the crawler-precedent debug damage *path* to reach Act 2 deterministically, but the boss itself is reached through normal play.
