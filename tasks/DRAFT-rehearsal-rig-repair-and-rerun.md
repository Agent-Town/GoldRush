# DRAFT (UNQUEUED) — SAGA REHEARSAL: rig repair + honest re-run (the release gate)
> Authored by the saga-rehearsal interpretation leg 2026-07-22 (F-REH-04 P1, reviews/saga-rehearsal-2026-07-22.md). NOT queued. Pipeline-side: this task may edit ONLY rehearsal/* (the rig is evidence tooling, not gameplay). Run AFTER DRAFT-t6-t10-ceremonies + DRAFT-e7-e10-claimable-eras land, or before them for the E1→E6 half alone.

## ROLE / WORKDIR
Dedicated verifier session (Fable) or attended, in a rehearsal worktree on a fresh branch. Solo writer.

## WHY (evidence, dated 2026-07-22)
The 2026-07-22 rehearsal's boss and ceremony legs were voided by four rig defects (review §RIG DEFECTS, all ✓ VERIFIED):
- **R1**: `upgradeOpen` tested `getClientRects().length` on cards inside an overlay hidden via `visibility:hidden` (theme.css:1319 — boxes still generated) → always true → every boss loop pressed digits and `continue`d for 10 minutes; driver never moved, never detected death.
- **R2**: boss detection filtered `enemyPositions()` on a nonexistent `eliteKind` field (entries expose `variantId`).
- **R3**: the Stamp Mill was funded 1/3 and abandoned → the T1 door was correctly absent → the profile never left epoch 1 → every T2–T5 leg probed an epoch-1 town and crashed.
- **R4**: the E10 segment skipped its reference spec's setup (`setManualSim(true)`, `e10Static.arrivalZ`, epoch param — e2e/e10-static-boss.spec.ts:19–27) → Static never engaged.
Consequently T1–T5 chaining, arsenal inheritance, per-era wardrobe, and board chapters remain e2e-asserted only, and no kill-boss except (on film) the Railcar and the Homemaker has live evidence.

## SCOPE
1. **Fix R1**: gate on the overlay's real open state (`.upgrade-overlay--visible` class or `aria-hidden="false"`), not client rects. Grep the rig for every other `getClientRects` visibility check and fix the same way.
2. **Fix R2**: detect bosses by `variantId` (and `bossComponentId` where componentized).
3. **Fix R3**: fund the mill to 3/3 (wait per-stage on `stage > N` with a generous, sim-time-aware deadline; ensure science ≥ unlock before first fund) so T1 actually arms E2 and the profile advances legitimately; then T2–T5 legs run against the RIGHT eras.
4. **Fix R4**: mirror the e10 spec's setup for the Static leg.
5. **Add per-boss act verbs** (the real point of a piloted run): kite/aim toward the boss, E5 claw-interrupt, E4 beaching pressure, E3 secure-path — each from the boss's spec; cite every seam.
6. **Re-run the full traversal** (run-all) on a FRESH profile; treat any segment exit≠0 as a stop-and-diagnose, not a continue.
7. **Evidence debts from the last run**: piloted F-REH-05 probe (E5 HUD wave 0 / no XP for 40 sim-min — real or deepwater-by-design?); live E4 yacht orbit read (the 883 was post-death); clean live wall-proof at a legitimate E6 (F-REH-01); first-claim securing (e1-01b crashed browser-side last time).
8. Ledger: per-era rows + contact sheet per the recording law; update reviews/saga-rehearsal ledger or successor file.

## FIREWALL
TOUCH-ONLY: `rehearsal/**`, `reviews/**`, `rehearsal-video/**` (local), `tasks/DRAFT-*` updates. NO src/, NO assets/, NO e2e/ edits — findings become drafts, never fixes (≤10-line P0 unblocks cited, per the verifier law).

## SELF-CHECK / GATES
- Every boss loop logs act transitions (proof the driver observes) and ends with an outcome ≠ timeout OR a diagnosed, footage-cited reason.
- T1–T5 each: door state ready → hand played → successor armed exactly once → persists across reload — on ONE profile, no `&era=`.
- Zero console/page errors per segment (already achieved last run — keep it).
- Deliverable: updated master ledger with per-gate verdicts, THE TEN MOMENTS refreshed, drafts for anything new.

READY-FOR-GATES when queued + report: gates-passed table, the E6→E7 door moment on film (post-ceremonies), tip.
