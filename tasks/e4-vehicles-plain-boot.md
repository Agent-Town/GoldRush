# Task e4-vehicles-plain-boot: a player on the Motor Frontier gets the Hauler and the tar in a plain boot — the rider already does (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `reviews/e4-roads-and-convoys.md` finding **F-E4-3** (human parity NOT met: a plain boot of `e4-dust-flats` mounts no Hauler and no tar; `src/game/Game.ts:4585` gates the vehicles behind `?debug&vehicles`; the e2e `e2e/e4-roads-and-convoys.spec.ts` pins the gap and reds the day it closes); `specs/epoch-saga/CAPABILITY-LADDER.md` L7 (THE SAME LAWS LAW: whatever a rider can order, the player can do in a plain boot); `src/sim/MotorSocket.ts` (what the rider composes: road, fuelled Hauler, convoy, tow) and the browser's E4 composition (grep `vehicles` and `MotorSocket`/`ConvoyBehavior` in `src/game/Game.ts`); `specs/epoch-saga/e4-motor-bundle.md` §B (the Dust Flats teaches driving; the Hauler relocates cargo).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-E4-3, drain 2026-09-04; owner 2026-09-02: "The laws for human and AI players have to be the same")
The rider can grade a road and haul; the player who opens the same map in a plain boot finds no Hauler and no tar. That is the pan_at asymmetry again, in the other direction.

## Scope
1. Vehicles mount in a plain boot for every contract whose twist declares `motorFrontier` (the four Motor maps), through the same composition the debug flag used; the flag stays only as an override for non-Motor contracts (say where).
2. The player can perform the four errands the rider can (haul, convoy, deliveries, tow) with existing inputs (drive, select, context actions); a first-time trail-guide line for the Hauler; the encyclopedia entry updated; LEXICON-clean, no em-dashes.
3. The pinned e2e assertion in `e2e/e4-roads-and-convoys.spec.ts` flips from "gap present" to "vehicle and fuel present in a plain boot" (assertion strengthened, never weakened); a plain-boot drive on the Dust Flats without `?debug` at desktop + 390px, zero console errors, screenshots to `reviews/shots-e4-vehicles-plain-boot/`.
4. Human tape: a player's errand actions are recorded inputs so human tapes replay (the same requirement the Prospector dispatch met); prove with one recorded plain-boot ride assay-replayed locally.

## Firewall
Touch ONLY: `src/game/Game.ts` (the vehicle mount gate and the player errand inputs), `src/game/RunTape.ts` (input kinds, additive), the trail-guide/encyclopedia copy files, the spec above, BACKLOG row. NO changes to: `src/sim/**`, the rider verbs, `Balance.ts`, other epochs, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` green (count); the E4 spec green both projects with the flipped assertion; `e2e/same-laws-harvest-parity.spec.ts` unmodified-green (the sibling parity); the replay proof quoted; zero console/page errors; the engine hash of the tree reported (src moves; the drain pins).
End: READY-FOR-GATES + the mount-gate diff, the errand input list, the replay slip.

## No-op / honesty guard
If vehicles already mount in a plain boot on current main (premise wrong), STOP and cite the line and the commit.
