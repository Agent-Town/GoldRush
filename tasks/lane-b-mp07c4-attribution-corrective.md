# Task lane-b-mp07c4-attribution-corrective: re-land THE RECKONING with honest per-run, single-writer attribution (lane-b, prefix "fix:")

**FIRE-AUTHORED s1773 (attended review welcome).** Corrective to the held MP-07c-4 candidate; no new feature scope.

READ FIRST: `AGENTS.md`; `specs/multiplayer/mp-07c-agent-rides-the-browsers-world.md` MP-07c-4 + ANSWERS; `specs/agent-play/README.md` ledger-honesty law; `reviews/mp-07c-4-the-reckoning.md`; and saved tip `save/mp07c4-reckoning-s1773-attribution-hold` at exactly `22b9a89636500e7b06026f1333ebca17923bf862`.

Pre-flight (drain-gated re-land): STOP unless `git branch --show-current` is `lane/b`, `git status --short` is clean except permitted artifact/log churn, `git rev-list --count main..HEAD` is `0`, and the saved ref resolves to the exact SHA above. Confirm this source key returns exactly 1 on your branch before editing: `grep -Fc 'GATE VERDICT: HOLD — three attribution defects block MP-07c-4.' reviews/mp-07c-4-the-reckoning.md`. Re-land the saved commit without committing (`git cherry-pick --no-commit save/mp07c4-reckoning-s1773-attribution-hold`); STOP on any conflict or if the resulting surface differs from the ten paths in the review. The runner owns the final commit.

## Why

The candidate's focused gates are green, but s1773 found three attribution failures at the real lifecycle seam: the copied invitation command can produce an undeclared agent, a departed rider survives into a later retry, and every browser can post the same team secure. The candidate is preserved intact; fix only those three defects before re-running its gates.

## Scope

1. **Always identify a headless rider as an agent on a mixed standing.** A headless rider with no optional model/harness details must produce the existing honest `unregistered rig`/declared-agent shape, not a human-shaped rider. Do not invent model or harness values. When details are supplied, preserve the validated values exactly. Agents-only benchmark room and standing payloads remain byte-identical.
2. **Make the recorded party per-run.** Clear the accumulated standing roster at `resetRun()` before repopulating it from any still-active multiplayer roster. Prove that a departed agent may remain credited for the run it joined but cannot leak into a later solo retry.
3. **One browser submits one room standing.** Elect the first browser in deterministic roster order while a multiplayer room is active; non-authority browsers do not POST the party standing. Keep the surviving-browser fallback honest when a peer disappears rather than suppressing the only possible submission.
4. Extend `e2e/mp-07c-4-reckoning.spec.ts` (and the existing MP harness only where needed) to prove all three red paths: invitation-style headless rider with no detail is still declared as an agent; retry clears departed attribution; a two-browser roster chooses exactly one submitter. Mutation-check at least the authority predicate or reset placement once, restore it byte-identically, and report the red.

## Firewall

Touch ONLY the held candidate's ten paths: `e2e/mp-07c-4-reckoning.spec.ts`, `functions/api/_multiplayer.ts`, `functions/api/standings.ts`, `public/skill.md`, `scripts/gr-sim.mjs`, `scripts/test-multiplayer.mjs`, `src/agent/DeclaredStack.ts`, `src/game/Game.ts`, `src/mp/LockstepClient.ts`, `src/sim/SeatedLockstepSim.ts`.

NO changes to ratified specs, `STATUS.md`, reviews, existing unrelated e2e specs, gameplay balance, ranking order, bench seeds, agents-only room behavior, single-player standings, or the shipped MP-07c-1/2/3 action/view/invitation behavior. Do not manufacture a model/harness default. Report adjacent findings; do not fix them.

## Gates

`npx tsc --noEmit` + `npm run build` + `npm run test:mp` (report count) + `npm run test:node-guards` alone. Then `npx playwright test e2e/mp-07c-4-reckoning.spec.ts e2e/milk-county-board.spec.ts e2e/mp-07c-3-invitation.spec.ts e2e/agent-seat.spec.ts --workers=1` on desktop + 390px, with zero console/page errors and the existing expected skip identified. Finish with `git diff --check` and exact firewall path list.

End: `READY-FOR-GATES` + report the undeclared-agent, retry, and single-submitter proofs; the benchmark byte-identity proof; MP check count; node-guard totals; and mutation red.
