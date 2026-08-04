CODEX: model=gpt-5.6-sol effort=high

# lane-mp-06-party-overview — THE RIDERS' ROSTER: see your party, glance at a rider

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). You implement EXACTLY this task, commit on the lane branch with prefix `mp-06:`, and never touch STATUS.md, reviews/, tasks/queue/, or other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` must print `lane/a`. `git status --porcelain` — if ANY dirty tracked blob is not reachable in git, STOP and report instead of resetting. If stale vs main, `git checkout -B lane/a origin/main` ONLY when the worktree is clean. Not-already-shipped check: `grep -rn "party-overview\|riderRoster\|rider-card" src/` must show no implementation. If present, STOP and report SAFE-DUPE.

## WHY (owner directive, 2026-08-04, verbatim — this is the mandate and the design)
"In a way, the user already knows whom they share their code with, right? But it would be good to somehow see an overview of the players, their health, and their resources on the screen? So that I can see who is riding with me. And if I click that rider, maybe the game could help me by pointing the camera at them? Then I could checkout quickly what they are doing. Lets work on this, if we can ship this in E1, then that is great. I want to try it."

Two rulings inside it: (1) NO species marker on riders — the host knows whom they invited; the roster treats every rider the same. (2) He will personally playtest this — it gates into MP-05 (the family playtest).

## READ-FIRST (in order)
1. `specs/multiplayer/README.md` — the lockstep architecture (every client runs the FULL sim — every rider's state is already local), MP-03's laws (name chips from town names, camera stays PER-PLAYER LOCAL), the shared-credit ruling.
2. The merged co-op ladder in code: how hero actors map to riders (`bundle.inputs[i]` → hero-actor[i]), where name chips render, where per-rider HP lives, and HOW GOLD WORKS IN CO-OP — read `src/game/Economy.ts` and the mp-r3 arsenal slice's reality (per-rider vs shared pot) and display what is TRUE, not what this master guesses.
3. `e2e/mp-02-lockstep.spec.ts` — the two-headless-clients-over-relay harness pattern (dynamic port, pid-scoped DO state). Your e2e reuses this pattern. NOTE: `:67` (desync-restore) is a KNOWN RED on main — not yours to fix, not yours to inherit blame for; cite it if it reds your run.
4. The run HUD layout (where wave/vitals render, both viewports) and the camera controller (follow logic, zoom clamps).

## SCOPE (numbered, each testable)
1. THE ROSTER: during a co-op run (2+ riders) a compact rider strip renders — one card per rider: name (existing chip source), HP bar (live), and their resources (gold — per the economy truth you read; if the pot is shared, show the pot ONCE and per-rider contribution only if the sim already tracks it — invent NO new sim accounting). Self is listed first and visually distinct. Solo runs: the strip does NOT render and no solo pixel changes.
2. THE GLANCE: clicking/tapping a rider card eases the LOCAL camera to that rider and follows them; any own-movement input, Escape, or clicking the card again returns the camera to your own Prospector. Camera change is render-side only — zero sim bytes, per-player local (the other clients see nothing).
3. Layout: desktop and 390px mobile (the strip must not cover the touch stick zone or existing HUD — check `world-info-notes` conventions for the safe areas).
4. Live truth: HP/gold update as the replicated sim ticks — read from the same replicated state every client already holds; NO new network messages, NO relay changes.
5. e2e `e2e/mp-06-party-overview.spec.ts` (two headless clients over the relay, mp-02 harness pattern): roster shows both riders with names; damaging one rider on client A shows the HP drop on client B's roster; glance click moves the local camera target to the remote rider and returns on input; solo boot renders no roster; zero console/page errors. Both projects.

## TOUCH-ONLY
New roster UI module under `src/ui/` (+ its css) · the run-HUD mount point (one hook) · the camera controller (glance target API, additive) · `e2e/mp-06-party-overview.spec.ts` · `tasks/BACKLOG.md` (goal-leaf under the coop milestone, same commit).

## NO
Sim/lockstep/relay/Economy logic (read-only display) · new network traffic · species/agent markers of any kind (ruling 1) · solo-run pixels · `functions/` · Balance · the mp-02 desync red (separate, attended).

## SELF-CHECK (before done-move)
tsc clean · build green · own spec green desktop+mobile · `mp-02-lockstep` suite at its KNOWN state (its `:67` red is pre-existing — anything NEWLY red is yours) · solo boot pixel-untouched (a plain-boot probe) · zero console/page errors · screenshots: roster with 2 riders + mid-glance camera, desktop + 390px, into `reviews/shots-mp-06/`.

READY-FOR-GATES. Report: files touched, the economy truth you found (per-rider vs pot) and what the card shows because of it, screenshot paths.
