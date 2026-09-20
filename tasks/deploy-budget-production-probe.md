# Task deploy-budget-production-probe: re-land the hard verdict with a production-compatible probe (MAIN, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome), s2518, 2026-09-05.**
You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (main slot).
CODEX: model=gpt-6-astra effort=xhigh

READ FIRST: AGENTS.md; `tasks/deploy-budget-hard-verdict.md`; `reviews/deploy-budget-hard-verdict-s2518.md`; `docs/reviews/2026-09-05-astra-3d-review.md` F-ASTRA-12; `scripts/deploy.sh`; `scripts/test-deploy-contract.sh`; `e2e/asset-diet.spec.ts` ("honest town and claim cues appear while GLBs are throttled and leave at ready" and "town byte budget reports normal and saveData arms by URL"); `playwright.preview.config.ts`; `docs/release/RELEASE-VERDICT.md`.

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
**FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Never reset main, another branch or a live lane. The fire already restored the predecessor's four paths after pushing its save ref; uncommitted predecessor code is not expected.

## Verified premise and authorisation

The owner authorised the Astra findings: "Ok, then lets have it fix these findings. This is important stuff." This corrective completes F-ASTRA-12, with explicit firewall expansion to the existing release probe and deploy fixture. It changes no product policy.

The predecessor's new hard-verdict guard passes 13/13, but no release PASS exists. Its real E1 dry run measured only mobile (17,365,554 bytes) and returned 5. The selected test's Claim path uses debug, stripped by E1 release. Its desktop cue was already hidden before the observation. Separately, the old deploy fixture provides no budget output and fails its first assertion on both HEAD and the candidate. The full Node battery was interrupted under contention and is not acceptance evidence.

## Scope — one corrective, including the preserved implementation

1. Re-land ONLY the four-path diff from `295740553ce343019adac79655b5f4e9af23d642` to `36176d1ca93701e2f6ceb0d3d9f52df79e164443` (`save/deploy-budget-hard-verdict-s2518`): `scripts/deploy.sh`, `scripts/deploy-budget.test.mjs`, `package.json`, `docs/release/RELEASE-VERDICT.md`. Inspect against current main first. Apply the diff, not the save commit's whole tree. Preserve concurrent package-list additions and device-checklist edits. Do not re-create the proven logic from scratch.
2. Make deploy's budget probe work against `GR_RELEASE=e1` through ordinary player entry. Separate town budget measurement from the debug-only Claim cue coverage, reusing the measurement helpers already in `e2e/asset-diet.spec.ts`. Splitting that existing test is allowed; retain its town/Claim cue behavior assertions in the appropriate non-release coverage. Observe transient UI from before the action where needed; no sleeps, forced cue lifetime, runtime changes, dropped assertions or hidden failures.
3. Preserve the existing **cue-window** response quantity, per-project URL reports and strict less-than 25,000,000-byte limit. Do not adopt the settled measurement or decide F-1625-4. Deploy must fail closed on any failed/missing measurement unless the explicit owner allowance is present, with FAIL still printed when waived. Report both desktop and mobile; never count one as two. Physical device verdicts remain the owner's, file presence is not SHIP.
4. Repair `scripts/test-deploy-contract.sh` with a valid under-budget measurement and matching URL report in its npm fixture. Stub all external publication/sync commands, including ssh/rsync; the existing local alias HTTP fixture is allowed. Keep every existing strict/default/alias/retry assertion. Preserve the new 13-arm hard-verdict guard and add only meaningful coverage needed by any changed probe selection.

## Firewall

Touch ONLY the four re-land paths above, `scripts/test-deploy-contract.sh`, `e2e/asset-diet.spec.ts`, `artifacts/deploy-budget-production-probe/**`, and your row in `tasks/BACKLOG.md`. `package.json` may contain the predecessor's ONE new guard invocation; preserve every existing invocation. No changes to runtime `src/**`, assets, sim, `scripts/deploy-site.sh`, wrangler configuration, rsync allowlist, preview/server configuration, other tests, thresholds, gate baselines, STATUS, specs, goals or git history. Never publish, read deployment credentials, or use `--allow-over-budget` to manufacture the real passing arm. The real dry-run flag stops before credentials and publication.

## Verification and handoff

- Node 26.4.0: `node --test scripts/deploy-budget.test.mjs`, `bash -n scripts/deploy.sh`, `bash scripts/test-deploy-contract.sh`, TypeScript and build pass. Record real commands and exits.
- Run the production-selected budget test under E1 on desktop and mobile. Then `bash scripts/deploy.sh --dry-run` must produce both project totals/top files and its honest RELEASE VERDICT. If assets genuinely exceed the ceiling, report that measured refusal; do not alter the ceiling or declare PASS. Do not interrupt another task's preview server on port 5189; use the committed preview config only when its port is free and report any collision honestly.
- Retained asset-diet cue coverage remains green in the build mode it actually supports; list any split titles and their modes. Zero console/page errors. The measurement failure/overage synthetic arms must still prevent all external calls.
- Run the complete `npm run test:node-guards` under Node 26 once other heavy gate jobs have settled; report total/pass/fail/cancelled/skipped and the actual exit. An interrupted or contaminated run is incomplete, not a waiver. Do not modify the command or guard list to hide failures.
- Write `artifacts/deploy-budget-production-probe/report.md` with the replayed source hash, before/after failure evidence, both measured project byte totals and top files, exact verdict, guard counts, and any remaining blocker. Keep new evidence in that directory. A fire will gate and merge; do not commit from main.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If a cure needs another file, STOP with the coupling evidence instead of widening the firewall. End READY-FOR-GATES with evidence paths and remaining limits. On successful drain, the fire closes this leaf and archives `save/deploy-budget-hard-verdict-s2518`; the predecessor was superseded, never shipped separately.
