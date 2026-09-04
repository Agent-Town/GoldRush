# Task receipts-outside-engine-corpus: the winnability receipts ledger moves out of the engine identity corpus, so a regenerated receipt can never rotate the engine hash (main slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
READ FIRST: AGENTS.md; `scripts/assay-replay-agent.mjs` `ENGINE_SOURCE_INPUTS` (`assets/contracts` is a whole-directory entry); `assets/contracts/winnability-receipts.json` + `scripts/winnability-receipts.mjs` + `scripts/render-skillmd-contracts.mjs` + `scripts/skillmd-contracts-guard.test.mjs` + `scripts/winnability-guard.test.mjs` (every reader/writer of the receipts path); `reviews/transfer-board-v2-registry-outside-engine-corpus.md` (the precedent: the rotation registry moved to `assets/rotations/`, with a guard that DERIVES the corpus and asserts the file is outside it); `assets/engine-era.json` (the two pins appended attended on 2026-09-04 whose cause line names this defect).
Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407): (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception).

## Why (2026-09-04: two receipts regenerations rotated the engine hash twice in one morning, each time leaving production briefly on an unrecorded pin until an attended pin and a redeploy)
The receipts are a ledger about the door, not an input the replay reads. Inside the corpus they make every first secure an "engine change".

## Scope
1. Move the ledger to `assets/receipts/winnability-receipts.json` (or beside the rotations under `assets/rotations/`; choose one and say why); update every reader/writer; keep the file's shape.
2. A corpus guard in `scripts/winnability-guard.test.mjs` (or a sibling) that derives `ENGINE_SOURCE_INPUTS` and asserts the receipts path is outside it, in the shape of the rotation-registry guard.
3. Prove `computeEngineHash` is unchanged by a receipts regeneration (hash before, regenerate, hash after; quote both).
4. skill.md render path unchanged in output (the fenced list identical byte-for-byte after the move); guards re-pinned only if a path string appears in a baseline.

## Firewall
Touch ONLY: the receipts file (move), the four scripts named, the guard, BACKLOG row. NO changes to: `ENGINE_SOURCE_INPUTS` itself, the sim, `assets/engine-era.json` (report the hash; the move itself changes it once — the drain pins), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` green including the new corpus guard and the skill.md guards (counts); the before/after hash proof.
End: READY-FOR-GATES + the proof and the new path.

## No-op / honesty guard
If the receipts path is already outside the corpus (premise wrong), STOP and cite the entry.
