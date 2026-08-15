# Task investigate-seam-anim-mp: seam-collect animation lost during a multiplayer ride — INVESTIGATE, then minimal fix (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `src/systems/HarvestSystem.ts` (seam/pan mechanics — `:290-300` run stats); `src/game/Game.ts:1015-1056` (`multiplayerActive()`, `syncMultiplayerActors()`, the MP actor lifecycle); the hero animation state machine (find where the panning/harvest animation state is set — grep `side-actions`, `pan`, animation state names in `src/assets/SpriteAnimator.ts` + `src/entities/pools.ts` + Game.ts); `docs/playtests/2026-08-15-robin-playtest-01.md` (the report's context).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/lane-c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*`, and any `.png` are NEVER "work" and NEVER a STOP — discard and PROCEED, listing them. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner, 2026-08-15, mid-ride in the FIRST mixed human+AI multiplayer session — verbatim)
*"I am still playing - but collecting seams has lost its animation somehow."*
Context that matters: he was HOSTING a live Ride Together (room `28D9B45F…`, the-claim/trail, a headless agent seated as the second rider) — so the report is from **multiplayer mode**, where the hero may be driven through the lockstep/actor-sync path rather than the solo animation path. It is NOT verified whether the animation is also missing solo — that split is the first measurement. Attended triage found NO obvious `multiplayerActive()` gate on harvest/animation (`Game.ts:1349-1450` gates are epoch arsenals + blast aiming), so the mechanism is genuinely unknown — this is an INVESTIGATE-then-fix, never a blind fix (playtest-intake law).

## Scope
1. **Measurement matrix FIRST (report all cells before any fix):** does the seam/pan collect animation play — (a) solo plain boot, desktop; (b) solo, 390px; (c) MP host with a second seat connected (drive the seat headless via `node scripts/gr-sim.mjs --room … --policy=idle`, or stub the lockstep client if a live room is impractical in e2e); (d) if reproducible in MP only: with the agent rider present vs after the rider drops. Name the exact animation state that should fire (file:line of where panning sets it) and where the MP path diverges.
2. **Root cause** — name file:line of the actual break (candidate classes to check, not assume: the MP actor-sync path overriding/never-setting the local hero's animation state; a recent merge regressing the pan state trigger — check `git log` on the animation files since 2026-08-10; a perf-tier/animation-budget gate). If the animation turns out MISSING SOLO TOO, say so plainly — then it's a regression, find the introducing commit.
3. **Minimal fix** on the identified path only. No animation-system refactor, no balance/sim change (animation is render-side; the sim stays untouched — CLAUDE.md §4.6).
4. **Regression assertion**: extend or add an e2e spec asserting the pan/harvest animation state fires during collection (solo; MP too if the harness supports it) — his scenario, so it can't silently regress.

## Firewall
Touch ONLY: the identified render/animation path (`src/game/Game.ts` animation wiring, `src/assets/SpriteAnimator.ts`, `src/entities/pools.ts` — whichever the root cause names), one e2e spec (new or extended).
NO changes to: sim semantics (`HarvestSystem` yields/timing), lockstep protocol (`LockstepClient.ts` wire format), `functions/api/**`, balance, existing e2e assertions, anything outside the named animation path. If the root cause lands OUTSIDE these files, STOP and report with the file:line — do not widen scope silently.

## Self-check
tsc + `npm run build` green. The measurement matrix reported with evidence (screenshots/frames to `artifacts/seam-anim-mp/`). The new/extended spec green desktop+mobile at `--workers=1`. Adjacent `task-025` + `m1-01` + `m2-01` unmodified-green. Zero console/page errors, plain boot. Frame p95 unchanged (render-side fix — no perf regression).
End: READY-FOR-GATES + report: the matrix, root cause file:line, the introducing commit if it's a regression, the fix's diff summary.

## No-op / honesty guard
If the animation plays fine in every matrix cell (unreproducible), WRITE the matrix as evidence, file the result honestly, and STOP — do not "fix" what you cannot reproduce; the owner's report then needs a live-session variable we did not model (say which you'd test next).
