# Task town-cast-wiring: the tavernkeeper and storekeeper walk their town — processed sheets reach the runtime (lane-c, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; assets/LEDGER.md rows 46-47 (`char.tavernkeeper` + `char.storekeeper` SHEET walk8 4x8 — **PROCESSED s293: 32/32 cells @512 + frames.json each, scale=1, keyed 74.2%/76.8%, footline spreads 33px/25px recorded per-cell for wire-time anchoring; PENDING-INTEGRATION, no src/ wiring**) + reviews/art-sprite-production-05-town-cast.md; assets/layer-contracts/characters.v2.json (the contract file where the wired blocks land — follow the `char.claim_jumper` walk8 block as the shape precedent); src/town/TownScene.ts (where townsfolk mount and walk); the existing walk8 consumption path (grep `walk8.enabled` — task 066's activation is the wiring precedent).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — c5's lineage all merged at `a51e1a279`), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner 2026-08-23: "Lets burn and make things happen!" — this is shelf-ready work: art PROCESSED six weeks, wiring never authored)
Two town-cast characters sit fully produced and processed (LEDGER s293) with no runtime consumer: the town renders without them or with placeholders. Placeholder-first law means gameplay never waited — but the art is PAID FOR and DONE, and wiring it is pure integration.

## Scope
1. Contract blocks for `char.tavernkeeper` + `char.storekeeper` in characters.v2.json: walk8 4x8, 8 dirs explicit (the processed frames.json is the source of truth for cells; use the recorded per-cell footlines for anchoring — the LEDGER says they were recorded FOR wire-time, so read them from the processed metadata, never eyeball).
2. Mount both in TownScene where the town's cast belongs (read how existing townsfolk/NPCs mount; if the town has no walker system for cast, mount them as idle-with-walk-loop ambient walkers on short authored paths that avoid buildings — smallest honest motion, no new AI).
3. Visual gate: both visible in a plain no-debug town boot, desktop + 390px, screenshots to `reviews/shots-town-cast/`; heights consistent with the town's existing cast band (measure, state the numbers).
4. Zero gameplay impact: town-only, no sim, no contracts.

## Firewall
Touch ONLY: assets/layer-contracts/characters.v2.json, src/town/TownScene.ts (+ a small walker helper if the scene lacks one), processed asset paths as data (NO reprocessing), one new e2e (town boot shows both), BACKLOG row + the LEDGER rows 46-47 Integrated column (same commit — the ledger law). NO changes to: enemy/hero sprites, sim, contracts.json, Balance, existing e2e assertions.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; the new town e2e green both projects; existing town/boot suites unmodified-green; zero console/page errors; screenshots at both viewports; perf: town draw calls within +10 of baseline (state the numbers). End: READY-FOR-GATES + report: footline anchoring as read, height band measurements, LEDGER flips included.

## No-op / honesty guard
If TownScene has no lawful mount point for ambient cast and inventing one exceeds the smallest-honest-motion bar, STOP and report the shape the scene actually needs — do not build a pathing system under a wiring task.
