# Task jumper-grab-flee-clips: the jumper steals in character — grab/flee clips on the LEGACY-scoped sheets (lane-c, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; **the OWNER RULING in the Why (it voids the old rotation gate)**; tasks/lane-c-jumper-8way-wiring.md INCLUDING its supersede banner (the predecessor master — its verified call-site map is your treasure: `src/entities/Enemy.ts:198/:753/:888/:894` OrientationResolver + grab/flee clip call sites, `assets/layer-contracts/characters.v2.json:336`-area the dormant `grab`/`flee` clip blocks, `e2e/vp-02b-rotation-resolver.spec.ts:233` ("action clips stay on coarse orientation cells and jumper diagnostics stay old shape") the currently-green pin your change must UPDATE not fight); assets/LEDGER.md rows 27-31 (which sheets carry the grab/flee cells and their processing state — batch-003/004 era).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — town-cast-wiring's runner commit IS merged at `9d9fb4b5d`), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner ruling 2026-08-24, verbatim: "ok legacy for now")
The full-rotation sheet is DECLARED LEGACY: the ≥460px retake failed its own size law after all allowed takes (LEDGER row 31, s2249 — 0/12 cells passed height+registration), and the owner ruled against further art spend. walk8 stands as the jumper's animation set. What survives of the old wiring ambition is the part a player actually notices: a jumper that GRABS gold and FLEES with it in character, instead of doing the deed in its walking pose. The clips exist in the contract, dormant; the call sites exist in Enemy.ts, verified by the predecessor master.

## Scope
1. **THE SIZE GATE COMES FIRST, AND IT CAN END THE TASK**: measure the grab/flee cells' effective figure heights in the PROCESSED batch-003/004 assets (bbox × scale, against the OUTPUT cell — the batch-007 lesson) and compare against the ACTIVE walk8 band the runtime renders (the predecessor cites 227–327px; re-measure, don't inherit). Fit within the band's tolerance (state the tolerance you apply and why — the LEDGER's own bands are the precedent) → proceed. DO NOT FIT → **STOP and report the numbers**; the outcome is then an art item for the owner's next batch, not a wiring hack. NO runtime scaling compensation (the s39 ruling stands: the extractor never upscales, no SpriteAnimator special cases).
2. If fit: wire the `grab`/`flee` clips — the contract blocks activate, `Enemy.ts`'s existing clip call sites consume them on the coarse orientation cells (the vp-02b pin's own current law: "action clips stay on coarse orientation cells" — KEEP that law; you are lighting clips up inside it, not changing it).
3. Update `e2e/vp-02b-rotation-resolver.spec.ts` to assert the clips now RENDER during a grab and a flee (extend the pin, keep its shape assertions; the :286 shape assert may move — update honestly).
4. The rotation block stays DORMANT and is NOT removed (retention; legacy ≠ deleted).
5. Visual proof: a grab moment and a flee moment screenshotted desktop + 390px to `reviews/shots-jumper-clips/`; NO size pop across the walk→grab→flee→walk cycle (assert sprite scale continuity in the e2e if the harness exposes it, else state the visual check).

## Firewall
Touch ONLY: assets/layer-contracts/characters.v2.json (the two clip blocks), src/entities/Enemy.ts (clip activation at the existing call sites ONLY), e2e/vp-02b-rotation-resolver.spec.ts, BACKLOG row + LEDGER row addendum (same commit). NO changes to: the rotation block, SpriteAnimator, walk8 wiring, pools.ts mounts, sim/combat behavior (the ANIMATION changes, the mechanics do not), other enemies.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; vp-02b updated-green both projects; task-025 + m1-01 unmodified-green; floors `--check` clean (pure render-side — if floors move you touched mechanics: STOP); zero console/page errors plain boot. End: READY-FOR-GATES + report: the measured cell heights vs the live band (the gate-1 numbers EITHER WAY), the clips' render proof, pin updates.

## No-op / honesty guard
Gate 1 failing is a SUCCESS outcome of this task — the report with numbers is the deliverable, and no wiring lands. Never compensate size in code.
