# Review — fix-town-spec-flow (lane/e2-arsenal `5b12e916`, ATTEMPT 2) — s753 DRAIN

**Slice:** fix-town-spec-flow — "town blender specs learn the new create→enter flow" (attempt 2, fire-authored corrective after s751 rejected attempt-1 as a partial).
**Branch/tip:** lane/e2-arsenal `5b12e916` (`runner(lane-c): fix-town-spec-flow.md`, 2026-07-20 06:04).
**Base:** merge-base `b1f283da`; `git diff b1f283da main -- e2e/town-*-blender.spec.ts` = EMPTY → main untouched all 10 files since fork = **clean additive checkout-graft, no 3-way**.
**Verdict:** ✅ **MERGED — all 10 town-*-blender specs GREEN both projects (82/82). The attempt-1 defect (specs shipped READY-FOR-GATES while RED) is closed: this drain ran them green on the merged tree before merging.**

## What it does
Rewrites the shared `openTown()` helper AND the mid-test re-entry sequences across all 10 `e2e/town-*-blender.spec.ts` to drive the CURRENT create→enter flow faithfully. Attempt 1 fixed only the initial `openTown` (a seeded profile boots straight into town, so no first-entry `Enter Town` click) but left the mid-test re-entry paths stale (`town-exit` → set params → `start-menu-enter-town`), so re-entered town never established interactive prospector state and `walkToHall`'s `expect.poll(__GR_TOWN_DIAGNOSTICS__.activePrompt)` saw `null`. Attempt 2 makes both the initial entry and every re-entry use the real Start-Menu flow, so the interaction walks reach their building ids, and keeps the pre-T2 path correct (`seed(page,false)` → `data-town3d-pilot-state='off'`, render-source `facade`, `dynamoHall.visible=false`). Test-helpers/bodies only, no src (firewall respected).

## Evidence (the gate)
- `npx tsc --noEmit` — clean. `npm run build` — ✓ built in 1.26s. (Task is test-only; build unaffected.)
- **Full 10-spec battery, BOTH projects, single-worker, scratch port 5253 (isolated from stale attended servers 5207/8788/8799 + the hung accounts battery → no contention false-reds): `82 passed (4.2m)`.** Per-spec (desktop N/N · mobile N/N):

| Spec | Desktop | Mobile |
|---|---:|---:|
| assay-office | 5/5 | 5/5 |
| chapel | 4/4 | 4/4 |
| claim-office | 4/4 | 4/4 |
| dynamo-hall | 6/6 | 6/6 |
| general-store | 4/4 | 4/4 |
| plate | 3/3 | 3/3 |
| plaza-props | 3/3 | 3/3 |
| schoolhouse | 4/4 | 4/4 |
| stamp-mill | 5/5 | 5/5 |
| tavern | 3/3 | 3/3 |
| **Total** | **41/41** | **41/41** |

- The definitive attempt-1 failures (`town-dynamo-hall :80/:107/:117/:124`, `walkToHall` activePrompt null, 8/12 red) are all GREEN here (dynamo-hall 6/6 both projects, "interaction walk and pre-T2 path verified").
- Boot probe: each spec boots the game and several use `collectErrors`; the passing specs assert zero-error render + interaction, and the "stays inside the frame-time gate" assertions passed — boot/perf coverage is embedded in the battery.

## Merge classification (base `b1f283da`)
| File | Class | Resolution |
|---|---|---|
| e2e/town-{assay-office,chapel,claim-office,dynamo-hall,general-store,plate,plaza-props,schoolhouse,stamp-mill,tavern}-blender.spec.ts (×10) | LANE-TOUCHED only | `git checkout 5b12e916 -- <files>` — main byte-identical to base for all 10 (diff empty), no 3-way. |

No src files touched (firewall verified: `git diff --cached --name-only` = the 10 e2e specs, zero src). Adjacent src-exercising suites are therefore unmodified — the known pre-existing F-1 (`m1-01:70` / `m2-01:322` contention flakes, s748 archive) is graft-independent and not re-run here (running it against a test-only change guards nothing and only risks a contention false-red).

## Findings
- None blocking. Attempt-1's F-1 (re-entry sequences not migrated) is closed by this attempt.
- `d70453f1` assay-ledger-page remains stacked on lane/e2-arsenal above this commit (file-disjoint `src/encyclopedia/*`) — separate drain, not part of this slice.
- Salvage `save/fix-town-spec-flow-partial` (attempt-1 `7f0bdb62`) is now superseded — safe to archive (branch-op fire-gated → attended/owner reap).
