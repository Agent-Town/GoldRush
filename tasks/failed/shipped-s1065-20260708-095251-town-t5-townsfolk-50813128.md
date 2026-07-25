# Task town-t5: the townsfolk arrive — names, posts, and barks (LANE-D, branch lane/perf, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/town-v1/README.md T5 (BINDING; law §1 town=scene-not-sim)**; the batch-009 processed townsfolk sprites (tavernkeeper/storekeeper/elder/preacher/schoolteacher/assay-clerk/youngsters — LEDGER states); townLayout + T4's growth manifest (folk appear WITH their buildings: storekeeper only once the store stands); SS-01 beats (bark integration — approach barks are info-note-adjacent but character-voiced; reuse the note prompt PLACEMENT machinery with the beat card STYLE). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-04 in this lane's queue.

## Scope (spec T5)
1. **The roster placed** (data-driven per townLayout + growth state): tavernkeeper inside the tavern (board room), the Elder at the schoolhouse, assay clerk at the office porch, preacher at the chapel (growth-gated), storekeeper at the store (growth-gated), two youngsters roaming a small fixed loop on the square (scene-level wander, zero sim). Idle facing + subtle breathe/sway (SpriteAnimator idle patterns).
2. **Approach barks**: ≤90 chars each, character-voiced (the story-spine cast sheet), data file, rotating 2–3 per character, epoch-aware slot (E1 set now). The Prospector idles near the claim office and greets BY TOWN NAME (reads T2's name).
3. **The concept plate is the placement truth**: batch-013's concept-town-square.png — match its staging where layout allows (report deviations).
4. Growth integration: folk appear/disappear with their buildings (seeded growth-state e2e).
5. Mobile: barks readable, no stick-zone overlap at 390px.

## Firewall
Touch ONLY: town folk placement/rendering + bark data + the bark prompt reuse, e2e, artifacts. NO run-scene changes, NO sim entities in town (scene-only actors), NO SS-01 engine changes, NO T2/T3/T4 logic edits.

## Self-check
tsc/build; new `e2e/town-t5-townsfolk.spec.ts`: seeded growth tiers → correct roster present/absent · barks trigger on approach with correct speaker text (3 sampled) · Prospector greets by seeded town name · youngsters stay on-loop (positions bounded); town suites + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (the peopled square vs the concept plate side-by-side, 390px) into artifacts/town-t5/. Commit on lane/perf. End: READY-FOR-GATES + concept-fidelity notes + results.
