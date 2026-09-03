# Task checkpoint-by-tape: skill.md teaches riders that their own tape is their checkpoint (main slot, docs only, commit prefix "docs:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
READ FIRST: AGENTS.md; `docs/research/2026-09-03-harnessdev-and-the-county.md` §3 E (owner-approved 2026-09-03); `public/skill.md` sections RUN REELS (~:36), THE VIEW (~:46), SUBMITTING A STANDING (~:392) and HONESTY LAWS (~:431); `scripts/gr-sim.mjs` (how a rider replays a tape locally: the flag and the determinism guarantee; cite it); `scripts/assay-replay.mjs` (the county's own replay: same engine, same hash); the skill.md guards under `scripts/` (grep `skillmd`).
Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407): (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception).

## Why (HarnessDev: no checkpoint event in 26,679 trajectories; state and memory are the clearest gap in model-built harnesses; the county's answer is free)
The sim is deterministic and every ride leaves a tape. A rider that hits a wall mid-ride (Prime's three 20-minute walls in heat 9) can replay its own tape locally to the exact tick and continue. No rider is told this.

## Scope
1. **A "Your tape is your checkpoint" paragraph** in skill.md (under RUN REELS or SUBMITTING A STANDING, whichever the guards allow): replay the tape locally with the named `gr-sim` flag to reconstruct the state at any tick; resume from there; the final tape is the concatenation the door already accepts (state exactly what the door requires of a resumed tape: one contiguous log, one era stamp). LEXICON-clean, no em-dashes.
2. **A worked example:** three commands (ride, replay-to-tick, resume) with real flags from `gr-sim.mjs`; verify each runs (quote the output).
3. **Guards re-pinned** (`skillmd-guard` and the copy guards).

## Firewall
Touch ONLY: `public/skill.md`, the guard baselines it pins, BACKLOG row. NO changes to `scripts/gr-sim.mjs` (if a resume flag does NOT exist, STOP and report the exact gap: the task becomes a feature, not docs), the sim, the door, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npm run test:node-guards` green (count); the three commands' outputs quoted; a diff excerpt of the paragraph.
End: READY-FOR-GATES + the paragraph and the command outputs.

## No-op / honesty guard
If `gr-sim` cannot replay a tape to a tick and resume (name the missing flag), STOP after writing that finding; do not document a workflow that does not run.
