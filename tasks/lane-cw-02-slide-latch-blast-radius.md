# Task lane-cw-02-slide-latch-blast-radius: does the wall-slide latch freeze enemies in NORMAL PLAY, or only in cw-02? (lane-a, commit prefix "diag:")

**FIRE-AUTHORED s1129 (attended review welcome). DIAGNOSIS ONLY — the expected final diff is a single new measurements file and NOTHING else.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/lane-cw-02-wrecker-movement-diagnosis.md` (your predecessor's measured table — the ground you start from); `src/entities/Enemy.ts` lines 1230–1298 (all of `resolveTerrain`), 495–510 and 560–575 (the snapshot/restore of `terrainSlideSide`), 630–640 and 820–835 (where it is reset to 0); `src/world/Terrain.ts` lines 119–125 and 164–170.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1129 pre-measured this for you and you must still re-verify it yourself: `lane/m3` was 1 ahead at `c14097e0`, `runner(lane-a): lane-055-standard-note-assertion-and-briefing.md`, whose done-move is `shipped-09102598-…` and whose two-dot `src/`+`e2e/` diff vs main is **EMPTY** — a SAFE DUPE, so the reset is loss-free. The worktree was CLEAN and the queue empty.)*

## Why (F-1118-1 + F-1118-2, recorded in `tasks/goals.json` at the `cw-02-wrecker-movement-diagnosis` leaf; every source fact below re-verified by s1129 at source)

The four-fire `cw-02-escort.spec.ts:134` chain is **solved at the mechanism level**. Do not re-open it:

- **CLOSED — geometry, target selection, sim budget.** See the leaf's `drainNote_s1118`.
- **CLOSED — which transform.** Candidate (C) fires, 3/3 runs identical to six decimals: `resolveTerrain()` picks its wall-slide direction from the sign of the entity's **world coordinate**, not from the goal.

**THE FACT THAT MAKES THIS A GAME PROBLEM AND NOT A TEST PROBLEM (F-1118-1):** it is not a slowdown, it is a **terminal self-latching deadlock**. The wrecker's position freezes at `(-47.997672, 26.215056)` from **+2.8 s and never moves again** — 5.2 s of exactly zero displacement, byte-identical across all 3 runs. ✓ s1129 re-verified the mechanism at source:

- `Enemy.ts:1253` and **`Enemy.ts:1264`** — **two byte-identical sites**, both `terrainSlideSide = (northSouth ? Math.sign(previous.x) : Math.sign(previous.z)) || this.avoidanceSide()`. Origin-derived, goal-blind.
- `Enemy.ts:1252` / `:1263` assign **only when the side is already 0**; `Enemy.ts:1249` clears it to 0 **only when the goal lookahead is walkable**. An entity that cannot move can never make its own lookahead walkable ⇒ **the latch is permanent.**
- `src/world/Terrain.ts:165-167` returns `{walkable:false, zone:'out'}` outside `bounds` (`:119-125`, `±CLAIM_HALF_X/Z`) — the western map edge the wrecker parks against.

**AND THE REASON THIS TASK EXISTS — s1129's own source finding, which widens F-1118-1 beyond what it recorded.** `Terrain.ts:168` returns the **same** `{walkable:false, speedMul:0, zone:'out'}` for `ELEVATION_TILE && !isSimTraversable(x,z)` — i.e. for **every non-traversable elevation tile**, not merely for the map boundary. So the latch's trigger condition is not "an enemy reached the edge of the world"; it is "an enemy's 0.6-unit goal lookahead went unwalkable", which is available at **every cliff and blocked tile on every elevation contract**. That is a hypothesis about reach, **not a measurement**, and turning it into a measurement is your entire job.

**WHY YOU ARE NOT FIXING IT.** s1118 ruled the cure — re-deriving the slide side from the goal, plus F-1118-2's unstick condition — an **attended/owner call**, because it changes pathing for **every** caller, not just wreckers. That ruling stands. The owner cannot weigh a global pathing change without knowing whether this defect currently reaches players at all. **You are producing exactly that number.**

## Scope

**1. MANDATORY MEASUREMENT — a latch detector.** Add temporary instrumentation that, per enemy per frame, records: `id` · `kind` · `group.position (x,z)` · `terrainSlideSide` · `Terrain.sample(pos).zone`/`.walkable` · whether the 0.6-unit goal lookahead is walkable. Define an enemy as **LATCHED** when `terrainSlideSide !== 0` **and** net displacement over the trailing **2.0 sim seconds** is `< 0.1` units **and** it is still alive with a live target. Report, per scenario: number of enemies spawned, number that ever latch, number **still latched at scenario end**, and for each latched enemy the `(x,z)` where it stuck and whether that point is out-of-bounds (`Terrain.ts:165-167`) or an elevation-blocked tile (`:168`). **The out-of-bounds vs elevation-tile split is the headline result** — it decides whether this is a map-edge curiosity or a live hazard on every canyon contract.

**2. RUN IT ACROSS SCENARIOS, NOT JUST cw-02.** At minimum: the `e3-canyon-works` contract that cw-02 uses; **at least two non-canyon contracts** including one with **no** elevation tile (so `Terrain.ts:168` cannot fire) as a **negative control**; and **a plain boot with no `?debug` flag** playing far enough to see real waves — Mistake #10's question, *"where does the PLAYER see this?"*, must be answered with an observation, not an argument. Report per scenario, never pooled.

**3. STATE THE PLAYER-VISIBLE CONSEQUENCE IN PLAIN WORDS.** If enemies latch in normal play, say what the player actually sees (enemies frozen against a cliff? a wave that never completes? a contract that cannot be lost?) and whether anything downstream — wave-completion counts, victory conditions, escort timers — depends on those enemies ever arriving. If nothing latches outside cw-02, **say that just as plainly**; a measured "this is confined to one synthetic test" is a **first-class success** and materially changes the owner's decision.

**4. Recommend, do NOT implement.** End with the engine change you would make and the file:line it belongs at, folding in **F-1118-2's requirement that clause 1 alone is insufficient**: re-deriving the side from the goal fixes this geometry, but **keeping the latch leaves the deadlock one unlucky geometry away**, so the cure needs an unstick condition too. **Landing it is a separate, owner-gated task. Do not land it here.**

## Firewall

Touch ONLY: a new `reviews/lane-cw-02-slide-latch-blast-radius.md` (your measurements + verdict), and optionally raw logs under `artifacts/cw-02-latch/`.

NO changes to: **any `src/` file in the final tree** · **any pre-existing `e2e/` file** · `e2e/cw-02-escort.spec.ts` at all — **it stays red, that is expected and correct**, and re-anchoring `:134`/`:135` is forbidden · `advanceSim(8)` · `Balance.enemy.speed` or any sim semantics · other tasks' fresh work.

**Temporary instrumentation IS allowed** — a scratch probe spec and/or temporary logging inside `src/` — **but it MUST be reverted before you finish.** The acceptance test is mechanical: **`git diff --name-only main...HEAD` must list ZERO `src/` files and ZERO pre-existing `e2e/` files.** Your three predecessors each did exactly this and each had a clean two-dot diff — match them.

⚠️ **DO NOT "FIX" ANYTHING YOU FIND.** If your instrumentation makes the cure obvious, that is the expected outcome and it still belongs in scope 4's paragraph, not in the tree. A `src/` edit here is a firewall violation even if it works — **especially** if it works, because it would land a global pathing change with no owner ruling and no gate battery aimed at it.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean · `npm run build` green (say so plainly if it is vacuous for a docs-only final diff) · the two-dot diff check above pasted verbatim into your report · per-scenario tables, never pooled · the negative control (no-elevation contract) reported **even if it shows nothing**, because a control that fires would invalidate the whole measurement · measurements file written to the exact path in the Firewall.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**"I could not measure X because Y" is a SUCCESS. A confident guess is a FAILURE.** Three fires in a row named a favourite candidate that measurement then killed, and that is the only reason this chain reached a mechanism. Do not protect s1129's elevation-tile hypothesis: **if the latch turns out to be confined to the map boundary, say so and the hypothesis dies.**

End: READY-FOR-GATES + the per-scenario latch counts, the out-of-bounds vs elevation-tile split, the plain-boot answer to "where does the PLAYER see this?", and the recommend-only paragraph from scope 4.
