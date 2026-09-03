# Task sim-terrain-read-canonicalization: the sim's terrain reads land on the canonicalization grid so Chromium and node agree to the last bit (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `reviews/e4-roads-and-convoys.md` finding **F-E4-2** (`visualY(0,72)` is `0.4667785887247181` in Chromium and `0.46677858872383526` in node 26.4.0; the motor path reads terrain, so a whole-run browser hash for an E4 tape can diverge from node while the eh2 fixture replays identically); the existing canonicalization law in the sim (grep `roundMotion`, `1e15`, `canonical` under `src/sim` and `src/core`: the motion quantum the county already applies and the guard that pins it, `scripts/*canonical*`); the terrain read sites on the SIM path (`src/sim/MotorSocket.ts`, `src/sim/HeadlessContractSim.ts`, whatever `Terrain`/`visualY` helpers they call; name each); `e2e/true-reel-harness.spec.ts` (the browser-vs-node hash proof; today it rides only the Claim).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-E4-2: the county's whole thesis is that the browser replays what the node assayed; a transcendental in the terrain path breaks that for any map whose sim reads height)
The sim is planar and deterministic by law; terrain height on the sim path must be a quantized, engine-independent number, exactly as motion already is.

## Scope
1. Every terrain read on the SIM path passes through the existing canonicalization quantum (or a shared `canonicalHeight` helper on the same grid); render-side reads (`visualY` for drawing) stay untouched.
2. Proof: the E4 whole-run browser hash equals the node hash for all four Motor reels (extend `e2e/e4-roads-and-convoys.spec.ts`'s both-engine test from sub-wave digests to the whole run), and the Claim control stays byte-identical to its pinned floor.
3. The true-reel harness gains a non-Claim, terrain-reading fixture (a Motor reel) so this class reds forever.
4. Report the engine hash (src moves; the drain pins) and any tape whose replay changes (there should be none for E1-E3: prove with the null floors).

## Firewall
Touch ONLY: the sim-path terrain read sites you name, one shared helper file if needed under `src/sim/` or `src/core/`, the two specs, BACKLOG row. NO changes to: render-side height, `Balance.ts`, the tape format, ranking, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the whole-run hash table (four Motor reels, Chromium = node); the Claim control; zero console/page errors.
End: READY-FOR-GATES + the hash table and the read sites changed.

## No-op / honesty guard
If the drift originates outside the terrain reads (name the operation with file:line), STOP after the proof harness and report the true source.
