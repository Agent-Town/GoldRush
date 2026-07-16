# Task lane-b-e5-boss-dredge-queen: the Dredge-Queen — E5's competing boss, acts 0-3 with placeholder presentation (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e5-deepwater-bundle.md (§boss + §OWNER RULING — DREDGE-QUEEN ACT STRUCTURE, 2026-07-16 — the act structure is RATIFIED LAW); src/systems/CrawlerBossSystem.ts + src/systems/LandYachtBossSystem.ts (the component-boss house pattern — follow their integration shape: CombatSystem stays the sole damage resolver, boss systems orchestrate components/acts); src/world/DeepwaterClaimTile.ts + the e5-deepwater-claim contract (assets/contracts/epoch-5-deepwater/contracts.json) and its existing e2e spec (the board-launch/boot pattern for an unarmed era); src/systems/StormWaveScheduler.ts (Act 0 rides the storm front); src/game/ProfileStorage.ts (profile-scoped persistence patterns — W6 uses the PROFILE scope, gr.profile.v2 pattern, never the global scope).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: grep `DredgeQueen` across src/ — absent (verified 2026-07-16; only a research-node label mentions "dredge") = phantom = BUILD IN FULL per this master. If a DredgeQueenBossSystem exists, STOP and report SHIPPED.

## Why (owner ratification 2026-07-16, verbatim)
"The inconsistency in the boss fight is how the paddles broke, that is not explained. So that should be part of Act 1 - stop her from clawing up history (which potentially the players don't really care about) - but at the same time destroy the paddles to reach Act 2. Otherwise - this is great. Especially that she becomes another map."
The choreography is ratified (storybook E5 §BOSS + bundle ruling); the E5→E6 ladder is blocked on exactly this boss. The deepwater tile is SHIPPED (bb3b60b1: DeepwaterClaimTile, boat pads, storm-scheduled skiff waves) — the arena exists; the fight does not.

## Scope
1. **DredgeQueenBossSystem** (new, src/systems/, crawler/land-yacht precedent): a component boss — CLAW / PADDLES(×2) / HOLD — on e5-deepwater-claim, boss-run triggered per the crawler's contract-hook pattern (boss variant/wave threshold on this contract only). Placeholder presentation throughout (primitive barge + flag + claw shapes — the railcar precedent: choreography ships factory-side; the painted plate + 3D body wire in later).
2. **Act 0, the dread**: her flag/silhouette appears riding the NEXT storm front (integrate with StormWaveScheduler's schedule — she arrives WITH weather, never from nowhere). One approach pass, then she anchors over a marked wreck-site zone.
3. **Act 1, the race — TWO-FRONT (the owner's correction, the heart of this task)**:
   - THE CLAW works a visible cycle timer over the wreck site; each COMPLETED cycle moves one loot unit to her HOLD (visible counter). Hitting the claw-zone mid-cycle INTERRUPTS that cycle (the story pressure — optional, skill-rewarded).
   - THE PADDLES (port + starboard, separate damage zones per the house pattern) are the REQUIRED objective: both destroyed → Act 2. She repositions between wreck zones every N cycles while any paddle lives (the paddles are WHY she can keep robbing — destroying them is self-evidently the counter; no tutorial text needed).
   - Escort skiffs screen her while she dredges (reuse the tile's existing storm-skiff wave machinery, boss-flagged).
4. **Act 2, the anchored stand**: paddles gone → she CANNOT reposition; the claw turns defensive (swats a melee-range arc — new attack pattern, telegraphed); escorts intensify. The HOLD becomes attackable. (The era's fight-from-BENEATH dive play is NOT in this task — firewall: the dive verb belongs to the era's dive slice; this act plays surface-side now and the system leaves an act-2 hook comment where dive pressure will attach.)
5. **Act 3, the sea's tax + the quit**: HOLD cracked → every banked loot unit SPILLS: scatter as gold/pickup drops across the wreck zone (the sea's handling fee = scatter radius, not loss). Her crew QUITS WARM (cure-arms law: skiffs disengage and row off the map edge — never slain; reuse/coordinate with the freed-walker grammar for the crew read). The hulk SETTLES at her anchor point and stays for the rest of the run.
6. **W6 — SHE BECOMES ANOTHER MAP (the owner's keeper beat)**: on boss defeat, write a PROFILE-SCOPED flag (ProfileStorage patterns, gr.profile.v2 scope — NEVER global scope) e.g. `e5W6Wreck: true`. On every subsequent run of e5-deepwater-claim under that profile, mount the settled hulk as a permanent wreck prop at the same anchor position (placeholder hulk mesh; non-colliding scenery consistent with the tile's prop patterns). The saga's first persistence beat, four eras early — keep the mechanism this small.
7. **Balance**: all tunables (component HP, cycle seconds, loot units, act thresholds) in src/game/Balance.ts under a `dredgeQueen` block — numbers are placeholder-reasonable, tuned later by playtest.
8. **New spec e2e/e5-boss-dredge-queen.spec.ts** (GATE-AUTHORSHIP — assert exactly, desktop AND mobile):
   a. Boss run boots on e5-deepwater-claim (existing deepwater boot pattern), boss spawns with the storm front, anchors, and the claw cycle counter advances.
   b. THE GATE ASSERTION: Act 2 is unreachable while any paddle lives, and destroying both paddles (debug damage path per the crawler spec's precedent) transitions to Act 2 — the paddles-gate is the owner's correction made testable.
   c. Claw interrupt: a mid-cycle hit on the claw zone cancels that cycle's loot transfer (counter does not advance).
   d. Act 3: hold cracked → spill pickups appear, skiffs exit, hulk prop present until run end.
   e. W6: after defeat, a second boot of the same contract under the same profile mounts the wreck prop; a FRESH profile does not.
   f. Zero console/page errors throughout; the tile's existing spec (e5 deepwater) stays unmodified-green.

## Firewall
Touch ONLY: new src/systems/DredgeQueenBossSystem.ts (+ a small entity/props file if the house pattern needs one), the boss-hook wiring in the e5 contract config + Game.ts boss-integration site (crawler-precedent-sized, ≤~40 lines there), Balance.ts `dredgeQueen` block, ProfileStorage additive key, e2e/e5-boss-dredge-queen.spec.ts.
NO changes to: CombatSystem's damage resolution (single-writer law — integrate like crawler/land-yacht do), Economy/gold writers, the dive mechanic (does not exist — do NOT invent it), other contracts/eras, existing e2e assertions, the freed-walker system internals (call its public grammar if reusable, else placeholder row-off), art assets (placeholder primitives only).

## Self-check (evidence, not vibes)
tsc + `npm run build` green. e2e/e5-boss-dredge-queen.spec.ts green desktop+mobile. Adjacent unmodified-green both projects: the e5 deepwater tile spec, the crawler boss spec, task-025 baseline. Zero console/page errors. Screenshots to reviews/shots-e5-boss-dredge-queen/: act1-two-front.png (claw cycle + paddle zones visible), act3-spill.png, w6-wreck-second-run.png. Perf: boss-run frame p95 within 15% of the tile's non-boss run.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: act-transition evidence, the Balance block's numbers, the W6 profile-scope key name, and any tile-integration surprises as findings.
