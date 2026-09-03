# Task tape-resume: gr-sim replays a tape to a tick and resumes the ride from there, and the door accepts the resumed tape as one contiguous log (lane-c, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; the stopped run `tasks/done/stopped-s2467-honesty-guard-gr-sim-has-no-replay-to-tick-20260903-100116-checkpoint-by-tape.md` and its report (`tasks/runs/20260903-100116-main-checkpoint-by-tape.md.log`: "gr-sim rejects --replay, --resume, and --to-tick as unknown arguments; assay-replay only verifies an entire tape and cannot emit resumable state"); `scripts/gr-sim.mjs` (the rider CLI: how a ride is driven and its tape written); `src/replay/AgentTapeReplay.ts` (the ONE replay implementation node and browser share; deterministic to the tick); `scripts/assay-replay.mjs` + `scripts/assay-replay-agent.mjs` (how the county replays and hashes a whole tape); `src/playbook/PlaybookFormat.ts` (the tape envelope: entries, durationTicks, the per-contract ceiling and the +1 fencepost law); `docs/research/2026-09-03-harnessdev-and-the-county.md` §3 E.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner-approved 2026-09-03; HarnessDev's clearest gap is checkpointing; the county's answer is its own tape, once the tool exists)
A rider that hits a wall mid-ride loses the ride. The sim is deterministic and the tape is the full input log, so the state at tick N is reconstructible. Nothing exposes it.

## Scope
1. **`gr-sim --resume <tape.json> [--to-tick N]`:** replays the tape's inputs through `AgentTapeReplay` to tick N (default: the tape's last tick), then hands control to the rider loop from that exact state; the recorder continues the SAME tape (prefix entries unchanged + continuation), so the finished tape is one contiguous log with one era stamp and a single `durationTicks`.
2. **Determinism proof:** a ride recorded straight through and the same ride resumed at tick N (same orders after N) produce byte-identical tapes and the same event-log hash; quote both hashes.
3. **The door:** a resumed tape needs no new field; prove one submits locally and assay-verifies (quote the slip). If the envelope's ceiling arithmetic breaks on a resumed tape (the +1 fencepost), fix it at the derivation, never per contract.
4. **skill.md:** the "Your tape is your checkpoint" paragraph with the three real commands (ride, resume-to-tick, submit), verified by running them; guards re-pinned (the fenced contract list from `skillmd-contract-list-generator` may or may not have landed: touch only the RUN REELS/SUBMITTING sections).
5. **Tests:** node: the determinism proof and a resume from a mid-ride tick; `test:stats` green.

## Firewall
Touch ONLY: `scripts/gr-sim.mjs`, `src/replay/AgentTapeReplay.ts` ONLY if a resume entry point is missing (additive; the replay of existing tapes must hash identically: prove with the assayer fixture), `src/playbook/PlaybookFormat.ts` ONLY for the fencepost derivation if it breaks, `public/skill.md` (+ guards), the tests, BACKLOG row. NO changes to: the sim mechanics, the door's ranking/validation, `assets/engine-era.json` (the drain pins if src moves), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` + `npm run test:stats` green (counts); the two hashes equal; the slip quoted; `e2e/true-reel-harness.spec.ts` unmodified-green both projects (the shared replay must not move); the engine hash of the tree reported.
End: READY-FOR-GATES + the hash proof, the slip, the skill.md paragraph.

## No-op / honesty guard
If resuming requires state the tape does not carry (name it with file:line), STOP and report the exact missing input; do not add a new tape field silently.
