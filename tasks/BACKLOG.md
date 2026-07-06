# Task backlog — the refill ladder (COMPLETE work ledger)

Owner directive (Robin, 2026-07-06): **4–5 lanes working constantly.** Fires refill from this ladder per fire.md §2E — and when a ladder runs dry, an idle fire AUTHORS the next master itself from the spec slice + evidence chain (FIRE-AUTHORED header, one per fire). Only three things escalate to the attended session: a missing spec, a design fork, or a canon question (PIPELINE-DRY flag). Robin authors nothing and verdicts everything.
**Completeness law (owner ask, 2026-07-06 evening): every known work item lives HERE — queued, gated, owner-owed, or explicitly retired to Stale. If work is discovered anywhere (review finding, fire flag, playtest, spec slice), it gets a ladder line in the same commit.** The dashboard renders this file; an item missing here is invisible, and invisible = forgotten (Demo Day taught us).

**Stale-check law**: a master written >2 days ago gets a 60-second reality check against current main before queueing (the m4-02 "6→40 refresh" lesson) — refresh it or flag it, never blind-queue.

## main (serial slot; balance/fix/feature tune — THROTTLE: ≤1 queued while drain pile ≥3)
1. **RE-RUN 034 vp02 mobile-stick** — GATE: main slot free — its first run's output was gate-blocked (038 contamination) and LOST in the compound-pile cleanup (never merged, verified 2026-07-06 19:4x: no vp02 code on main); master intact, contamination cause gone
2. fix-037-panGold-flake — GATE: authorable now — F-1 from 037's gate (task-037:115 harness flake, non-blocking but owed; fire-authorable, small)
3. 012 overwhelm-valves (wave-32 wall, tower-defense side)
4. 011 build-menu-blurbs refresh (stale-check first — build menu changed since)
5. 014 charm-pass · then 015 soak-harness (verify runtime budget fits runner first)

## lane-a (meta/progression)
1. ✅ demo-profiles-v2 SHIPPED (s82 `0834a44`); ✅ SCI-01 research loop SHIPPED (s84 `6b6624c`)
2. **IN QUEUE: SCI-02 epoch-gated families + mastery** — FIRE-AUTHORED s84 (`tasks/lane-a-sci-02-families-mastery.md`); full epoch-1 families.json + mastery conversions; wave-30 wall is the owner playtest gate
3. SCI-03 assay & agent research branch — GATE: after SCI-02 AND the live assayer has produced real approvals (contract tier must gate something real)
5. SCI-04 contract-family registry — authorable anytime (socket only)

## lane-b (agent)
1. IN QUEUE/RUNNING: m4-re-land (embodiment + voice on fresh main, salvage-ref save/m4-embodiment-voice-v1)
2. m4-05 agent-closeout — GATE: after m4-re-land merges (stale-check the master)
3. M4-07 receipts-UX clarity — AUTHOR from VISION-HOOKS "clarity is craft" note + m4-re-land review findings

## lane-c (world/polish) — ⚠ DRAIN FIRST
Drain order before ANY refill: (1) w1-06 vista = tip commit on lane/polish (secure-committed s61); (2) w1-04 scatter = branch `save/w1-04-scatter` (3-way vs base 789c978). Both bases are from TODAY — headless-mergeable, dry-merge first, DISJOINT-PAIR batch allowed. THEN:
1. **RERUN w1-03 light+atmosphere** — output DESTROYED by w1-04's reset pre-flight (master intact, includes owner's water fix) — GATE: lane-c fully drained
2. **RERUN polish-02 rivalry-stats** — output DESTROYED by w1-06's reset — GATE: after the w1-03 rerun
2b. **combat-readability** (owner playtest finding 2026-07-06: "no lifebars… should be visualized"; master ready — enemy hit-flash, building bars made visible, palisade wear, turret muzzle pulse) — GATE: after polish-02 rerun; may float to main if lane-c stays congested
3. W1-05 building shells — AUTHOR after 029 town art reviewed in-world (spec slice exists; art processed s64, LEDGER rows deferred)
4. **W1-07 the natural claim** — AUTHOR after the W1-03/04/06 combined in-world review (owner directive: "whole map natural… more feel/style/natural look")
5. polish-03 mobile-pass → polish-04 first-run-hints (owner: "can come later with a menu") → polish-05 portraits+screens
6. lane-c-docs-animation-pipeline (docs task, master exists — lowest priority, any idle window)

## lane-d (perf/foundation) — ⚠ DRAIN FIRST
Drain: `lane/m6-r3a-apply` +2 (perf-02 bench + reviews/m6-r3a-audit.md, the M6 verdict doc). **⚠ CONFLICT NOTE (s84 recon): NOT near-zero — base `e738424` is stale; branch touches Game.ts + main.ts + Balance.ts which main has ALSO moved → genuine 3-way graft on hot core files. Also a stray `src/game/Balance.ts.orig` conflict artifact sits on main (sweep it during this drain). NEW/safe: `e2e/perf-02-fullbase-bench.spec.ts`, `src/diagnostics/fullBaseBenchmark.ts`, `reviews/m6-r3a-audit.md`, CombatSystem.ts + DebugParams.ts (main didn't move these). Needs a focused fire, not a rushed second drain.** THEN:
1. M6 attempt-4 — AUTHOR from the audit verdict once drained (integrate-as-is / rework scope / abandon)
2. perf-03 instancing-ladder (pairs with w1-04 scatter) → m5-03 stat-sim-harness → perf-04 determinism-harness → perf-05 startup

## art (fifth lane — batch-driven, one batch in flight; **Codex generates directly via image_gen/GPT-Image-2 — NEVER an owner chore** [owner reminder 2026-07-06])
1. IN QUEUE: art-batch-008 Prospector companion (2 hover sheets + portrait; pairs with lane-b m4-re-land)
2. art-029 LEDGER rows — deferred-to-M6 by s64; wire when W1-05/town work consumes the assets
3. batch-009 candidates (author after W1 combined review): water-foam/detail sprites if the review wants them, walk4 gap cells
4. Nightly art-shift resumes per VISION-EPOCHS asset strategy once BACKLOG-manifest rows exist

## OWNER'S DESK — blocking on Robin (the human is a lane too; dashboard renders these)
OWNER: turret-feel playtest — the LAST M2 sign-off gate (milestone-blocking since s4x)
OWNER: water-feel fallback preference — air-bar vs chill-drain (rules the 025 fallback; both recorded)
OWNER: favicon 16px eyeball (10 seconds)
OWNER: Mac full-regression evidence run, both projects (standing)
OWNER: science spec pacing re-check after epoch-1 first fill (threshold 6 was the 2026-07-06 stake)

## LATER — attended-authored specs (not fire-authorable; owner-adjacent design)
- **Building-tiers spec RATIFIED 2026-07-06** (`specs/building-tiers/README.md`: endless-as-homestead ✓, science-gated tiers ✓, baseline trio palisade+sluice+turret ✓). **BT-00 demolish = fire-authorable NOW** (small, independent, main-slot candidate — owner-hit gap: built things can't be removed; HP-scaled refund per spec). BT-01 (tier core, the trio) fire-authorable AFTER combat-readability lands (both touch BuildSystem visuals — sequence them). BT-02..04 follow the spec order.
- **Town v1 spec** (staged path S2: tavern CONTRACT BOARD = the ratified between-runs door, town square grown from victories, townsfolk names/barks) — attended authors AFTER M6 attempt-4 resolves
- **Item-application slice** (approved crafted items apply in-run — Robin's multi-target Spark Rig becomes real here) — spec after the assayer produces real approvals + SCI-02's contract-tier groundwork
- **Live assayer = STANDING FIRE DUTY** (fire.md §2D), not a queue item — listed here so the ledger is complete
- **Epoch-2 "Steamworks" content bundle** — S5, after Town v1 + SCI-04 socket; deliberately last

## Stale / superseded — retired, do NOT queue without review
lane-a-m5-01 (contract.v1 shipped via 033-era work), lane-b-m5-02 (incumbent bench shipped), 016 sprite-direction-fixes (likely superseded by 031/032-era anim work), 019-m1-02 reset-memory (verify vs M3 suspend/resume), 031/032/033 masters (s79: partially shipped via other routes — re-evaluate before any use).
