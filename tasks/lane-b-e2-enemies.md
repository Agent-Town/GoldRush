# Task e2-enemies: the Steamworks outfit — E2's bandits + the component boss (LANE-B, branch lane/m4, commit prefix "e2:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/epoch-saga/e2-steamworks-bundle.md (enemy roster + the component boss — BINDING: stats, behaviors, the rail-route boss path on the Hill Mine)**; the elite/baron machinery (eliteKind/banner/boss-bar — REUSE); the epoch gating (E2 enemies spawn only on epoch-2 contracts/tiles — the Hill Mine's dev door tests them); canon §9 (machines/companies, never peoples). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Scope
1. **The roster (per bundle, DATA-driven via the epoch manifest)**: the era's 3–4 enemy types as stat-blocks + behavior flags on the EXISTING enemy machinery (no new AI systems — variants: armored/steam-fast/wrecker-class per bundle); placeholder-first sprites (tinted jumper variants at distinct scales/tints; the walk4 sheets ride a later art batch — LEDGER slot rows added PENDING-ART).
2. **THE COMPONENT BOSS** (the bundle's Hill Mine finale): the multi-part machine that arrives ALONG THE RAIL SPURS (the boss rail-route from the tile's descriptor) — parts as linked elite entities sharing a boss bar (the baron bar generalized to segments); destroying parts degrades it (per bundle). CombatSystem sole-resolver law absolute.
3. **Epoch gating proven**: E1 contracts spawn ZERO of these (byte-identity asserted); the Hill Mine dev door spawns the roster + boss at its specced waves.
4. Taunt/arrival/defeat beats via the story engine (the baron pattern — data entries; the defeat = the era's graduation-adjacent beat per bundle).
5. Determinism + 200-enemy stress in envelopes.

## Firewall
Touch ONLY: epoch-2 enemy manifest data, variant flags on existing enemy machinery (additive), the segmented boss-bar generalization, beat entries, LEDGER art rows, e2e, artifacts. NO E1 behavior changes, NO new combat paths, NO epoch activation.

## Self-check
tsc/build; new `e2e/e2-enemies.spec.ts` (roster spawns on the mine via dev door + stats asserted · boss arrives by rail + segment destruction degrades · E1 byte-identity · determinism · stress); baron + hill-mine + m1-01 + m2-01 green both projects; zero console errors; screenshots into artifacts/e2-enemies/. Commit on lane/m4. End: READY-FOR-GATES + the roster table + results.
