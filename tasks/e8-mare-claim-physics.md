# Task e8-mare-claim-physics: the Mare Claim composes E8PhysicsSystem headless — low gravity and air as the wall become the ride (lane-d, commit prefix "feat:", CLAUDE IMPLEMENTER — attended-dispatched; the lane runner must not pick this up)

You are a Claude implementer for Gold Rush, working in worktrees/lane-d on branch lane/d.
READ FIRST: AGENTS.md; `docs/audits/2026-09-02-era-mechanic-audit.md` row `e8-mare-claim` (RESKIN: "No E8PhysicsSystem headless"; gravity declaration `assets/contracts/epoch-8-orbital/contracts.json:6,134`; browser-only composition `src/game/Game.ts:804`; headless surface `src/sim/HeadlessContractSim.ts:52-83`; log `artifacts/era-mechanic-audit/e8-mare-claim.log`) and its smallest-slice line ("compose E8PhysicsSystem into headless movement/combat and publish suit-air/air-wall diagnostics"); `src/systems/E8PhysicsSystem.ts` (what it changes: lob arcs, movement, air); `specs/epoch-saga/e8-orbital-bundle.md` §B (air is the wall; the lunar day; lob arcs 2.4x); `specs/epoch-saga/CAPABILITY-LADDER.md` L1 ("transfer under changed physics"), L7; `src/agent/View.ts` (additive fields; view version bump).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (the audit: the system exists in the browser and not in the sim a rider plays)
A rider on the Mare Claim today plays the Claim in silver. The era's question is whether an agent adapts to changed physics; that question needs the physics.

## Scope
1. **Compose `E8PhysicsSystem` in `HeadlessContractSim`** when the contract declares gravity/atmosphere (the existing twist keys), mirroring `Game.ts:804` so both engines agree (one seed, both engines, same event-log hash: prove it).
2. **Air as the wall:** suit-air outside domes and the air-wall of a breached dome reach the sim's movement/combat exactly as in the browser; the SECURE rule for `e8-mare-claim` gates on the era mechanic (the bundle's objectives: dome cluster held with air, or a regolith run on suit timers; choose the smallest that the contract's briefing already promises, cite it).
3. **Diagnostics for riders:** additive view fields (`now.air`, dome breach state, gravity profile) documented in skill.md; version bump.
4. **Proof:** a headless ride whose event log shows gravity-scaled lobs and air drain (`artifacts/e8-mare-claim-physics/mare-claim.log`); a scripted floor ride secures (L2); the plain-boot browser e2e for the Mare Claim unmodified-green (L7).
5. **Tests:** node (both-engine hash agreement; the secure gate; a mutation proof that removing the composition reds), `test:stats` green, E1 adjacent specs unmodified-green.

## Firewall
Touch ONLY: `src/sim/HeadlessContractSim.ts`, `src/systems/E8PhysicsSystem.ts` ONLY for a headless-safe interface (browser behaviour unchanged: prove with its e2e), `assets/contracts/epoch-8-orbital/contracts.json` (`e8-mare-claim` only), `src/agent/View.ts` (additive), `public/skill.md` (+ guards), tests, evidence, BACKLOG row. NO changes to: other E8 maps (they are the ladder's next rows), E1–E7, `Balance.ts` numbers, ranking, `assets/engine-era.json`, other lanes' files.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the ride log; the hash table; the browser e2e green both projects, zero console errors. Commit path-scoped on lane/d with prefix `feat: e8-mare-claim-physics —`, ending every message with the two attribution lines this repo uses today. Do not push.
End: READY-FOR-GATES + the hash table, the event evidence, the view fields.

## No-op / honesty guard
If `E8PhysicsSystem` depends on three.js render state (name the line), STOP and report the exact coupling; a headless port that changes the browser's physics is a violation, not a fix.
