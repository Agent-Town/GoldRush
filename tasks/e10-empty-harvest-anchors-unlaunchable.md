# Task e10-empty-harvest-anchors-unlaunchable: three Deep Sky maps cannot be launched at all (SCRATCH WORKTREE, commit prefix "fix:")

You are the implementer for Gold Rush (Claude Opus 5, the overnight wave of 2026-09-05), running natively on Robin's Mac in a scratch worktree the attended session prepares (branch `fix/e10-harvest-anchors`).
READ FIRST: AGENTS.md; `artifacts/playability-smoke/report.md` (F-SMOKE-1: `e10-ember-shore`, `e10-archive-world`, `e10-river` fall back to The Claim in 12/12 cells with `fallbackReason=unavailable-contract`; "The Ember Shore is not ready for a direct claim; The Claim opened instead"); `src/meta/ContractFamilies.ts:1345-1358` (the refusal: `requested.tileParams.harvestAnchors?.length === 0` → `unavailable-contract` and the fallback briefing line); `assets/contracts/epoch-10-*/contracts.json` (the three rows declare `"harvestAnchors": []` — exactly the three, verified attended; `e10-last-claim` has anchors and launches); `specs/epoch-saga/e10-deepsky-bundle.md` and `specs/e10-preserve-objective.md` (what these maps are: the preserve era — do they harvest at all?); `lore/STORYBOOK.md:581-630` (Chapter E10).
Pre-flight: the scratch worktree is on a fresh branch from current main; verify `git status --short` is clean apart from the FACTORY-CHURN EXCEPTION below and `git branch --show-current` is `fix/e10-harvest-anchors`, else STOP.
**FACTORY-CHURN EXCEPTION (F-1407-1):** list and proceed past regenerated `logs/**`, `artifacts/**`, `reviews/shots-*` and `.png` evidence; do not discard another writer's files. Other modified tracked files, including `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**` and `reviews/*.md`, still STOP the task.

## Why (Owner, 2026-09-05 night: "how do we get them all playable for me to test? … push hard while I sleep"; the 42-contract smoke of 2026-09-05)
A player who clicks any of these three E10 contracts is silently sent to The Claim. Either the maps are unfinished (then they must not sit on the board as launchable) or the refusal is wrong for preserve-era maps that deliberately have no seams (then the guard must accept them). Nobody has ruled; this task finds the truth from the specs and lands the honest fix.

## Scope
1. **Decide from the specs, with citations:** for each of the three maps, does the E10 bundle intend seam harvesting (then author the `harvestAnchors` the map's geography calls for, in the row's own coordinate frame, mirroring how `e10-last-claim` places its anchors) or a harvest-free preserve objective (then the refusal at `ContractFamilies.ts:1349` must exempt contracts whose twist declares the preserve objective, with a comment citing the spec line)? Do not invent a third option.
2. **Prove launchability:** each of the three launches plain (no `?debug`) from the board on the full-board build, shows its own briefing (not The Claim's), and reaches wave 2 or its preserve objective's first beat; desktop + 390px; zero console/page errors; screenshots.
3. **Tests:** extend `e2e/playability-smoke.spec.ts` ONLY if a new assertion is needed for the fix (it already boots all 42 under `GR_PLAYABILITY_SMOKE=1`); add a node guard `scripts/board-launchable-guard.test.mjs` asserting every board contract either has anchors or a declared harvest-free objective (so a fourth such map can never ship silently); add it to the single `run-node-guards` list.
4. **Determinism:** if contract data changes, the affected maps' null floors move — re-record their pins with the reason (the receipts ledger `assets/rotations/winnability-receipts.json` may need the three rows marked re-baselined); every OTHER contract byte-identical; report the engine hash (a `src/` change rotates it; the drain pins).

## Firewall
Touch ONLY: `assets/contracts/epoch-10-*/contracts.json` (the three rows) OR `src/meta/ContractFamilies.ts` (the one refusal site), whichever the specs decide — say which and why; `scripts/board-launchable-guard.test.mjs` (new), `package.json` (list append only), the null-floor/mask pins for the three maps if data changed, `artifacts/e10-launchable/**`, `tasks/BACKLOG.md` (your row). NO changes to: other contracts, the sim, `specs/**`.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line. Commit what you have even if you stop early.

## Self-check (evidence, not vibes)
tsc + build green; the guard green; the three maps launch plain both projects with screenshots; the hash table; the spec citations for the decision.
End: READY-FOR-GATES + the decision per map with its citation, the launch proof, the guard, the engine hash.
