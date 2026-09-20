# Review: deploy-budget-production-probe — production deploys fail closed on the first-town budget and print a release verdict (main slot, codex runner on gpt-6-astra xhigh; fire-authored s2518 corrective; attended drain 2026-09-05)

**Slice:** `deploy-budget-production-probe` (main slot, over the s2518-rejected `deploy-budget-hard-verdict` output re-applied from `save/deploy-budget-hard-verdict-s2518`) · committed attended in the drain commit (path-scoped from the root working tree).
**Verdict:** MERGED. F-ASTRA-12's factory half is cured: the budget is binding; the device half stays the owner's (`docs/release/RELEASE-VERDICT.md`).

## What it does
`scripts/deploy.sh`: the first-town budget probe (`playwright.preview.config.ts`, `e2e/asset-diet.spec.ts` "town cue-window budget through player entry", desktop + mobile) must return exactly two measured projects with matching per-URL totals; an overage, a failed measurement or a zero-project parse ABORTS the deploy (`--allow-over-budget` waives it explicitly and logs the numbers); a RELEASE VERDICT block prints build, budget PASS/FAIL with per-project bytes and the top five URLs, and whether `docs/release/verdict-<build>.md` exists (WARN only). `scripts/test-deploy-contract.sh` gains the schedule assertion; `e2e/asset-diet.spec.ts` separates production town measurement, town entry/re-entry cues and cold Claim cues; `scripts/deploy-budget.test.mjs` (new, in the single `run-node-guards` list) proves the fail-closed and waiver paths with stubbed wrangler/npm/ssh/rsync.

## Evidence
| Gate | Result |
|---|---|
| `node --test scripts/deploy-budget.test.mjs` | 15/15 (attended re-run, node 26) |
| `bash scripts/test-deploy-contract.sh` | PASS, 14 cases + the default schedule (attended re-run) |
| `bash -n scripts/deploy.sh` / `npx tsc --noEmit` | ok / rc 0 |
| Runner's real `bash scripts/deploy.sh --dry-run` on build `93d4c6d4` | exit 0; budget PASS: desktop 15,388,541 / mobile 16,980,887 of 25,000,000 bytes; top five URLs: the E1 loop mp3 1.80 MB, the title theme 1.20 MB, the Claim terrain 0.97 MB, the town plate 0.88 MB, the Claim panorama 0.52 MB; device verdict WARN (no verdict file) |
| Attended `--dry-run` at 12:3x | rc 5, `Budget: FAIL (probe rc=1; measured projects=0)` — the probe's preview port **5189** was held by the lane-c Lantern implementer's vite (`worktrees/lane-c`, 34 min); the fail-closed path worked exactly as designed, on an environmental cause → F-DEPLOY-1 |
| `e2e/asset-diet.spec.ts` on the dev-server drain port | 10 skipped (the suite self-skips off the preview harness; the probe above is its real run) |

## Findings
- **F-DEPLOY-1 (fire-authorable, small):** the budget probe binds a FIXED port (5189, `playwright.preview.config.ts:5-6,11`) with no `reuseExistingServer`; any lane's playwright holding it turns a production deploy into a fail-closed ABORT. Give the deploy probe its own scratch port (the 5199/5231/5234 family) or an ephemeral one, and print the holder on collision.
- **Desk (owner):** the device rows in `docs/release/RELEASE-VERDICT.md` remain unfilled; the deploy prints WARN until `docs/release/verdict-<build>.md` exists.
