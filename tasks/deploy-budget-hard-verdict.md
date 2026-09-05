# Task deploy-budget-hard-verdict: production deploys fail closed on the delivery budget and print a release verdict (MAIN, commit prefix "chore:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac at the repo root (the main slot).
READ FIRST: AGENTS.md; `docs/reviews/2026-09-05-astra-3d-review.md` §6 (F-ASTRA-12); `scripts/deploy.sh` (`STRICT=0` at `:8`, `--strict` at `:9`; the non-strict `finish` exits 0 at `:27-:28`; `BUDGET_LIMIT=25000000` at `:57`; the budget block from `:63`); `docs/release/RELEASE-VERDICT.md` (the owner's device checklist, attended 2026-09-05).
CODEX: model=gpt-6-astra effort=xhigh
Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
**FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception). What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05, verbatim: "Ok, then lets have it fix these findings. This is important stuff."; Astra F-ASTRA-12, verified attended 2026-09-05 at `deploy.sh:8`)
The 25 MB first-town budget exists, and by default it only warns: an overage or a failed measurement still publishes. Astra: "Require a recorded verdict for delivery budget, actual iPhone/lite readability, and a representative Android run." The device runs are the owner's (see the checklist); the budget half is the factory's and this task makes it binding.

## Scope
1. **Fail closed on the budget:** an overage or a failed measurement exits non-zero and does NOT publish, unless `--allow-over-budget` is passed, in which case the overage is logged with the numbers. `--strict` keeps its meaning for the other failure classes.
2. **Report the budget:** print measured bytes vs limit and the top five contributing files.
3. **Print a RELEASE VERDICT block** at the end of every deploy: build id, budget PASS/FAIL (+ allowance if used), and whether `docs/release/verdict-<build>.md` exists (the owner's device runs) — WARN only when it is missing; a fire cannot hold an iPhone.
4. **Guard:** `scripts/deploy-budget.test.mjs` builds a synthetic over-budget dist in a temp dir and asserts the fail-closed path and the `--allow-over-budget` path (drive `deploy.sh` with an env/flag that skips wrangler; do not touch the network); add it to `package.json`'s `test:node-guards` file list (ONE invocation — append).

## Firewall
Touch ONLY: `scripts/deploy.sh`, the new guard, `package.json` (list append), `docs/release/RELEASE-VERDICT.md` (append the verdict-file naming rule), `tasks/BACKLOG.md` (your row). NO changes to: `scripts/deploy-site.sh`, wrangler config, the assayer rsync allowlist, `src/**`.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If a scope item is impossible inside the firewall, STOP with the coupling points as file:line and the measured evidence; do not widen the firewall yourself.

## Self-check (evidence, not vibes)
`node --test scripts/deploy-budget.test.mjs` green; a dry run of `bash scripts/deploy.sh` with the network-skipping flag prints the verdict block (paste it); `npm run test:node-guards` counts reported (node 26).
End: READY-FOR-GATES + the verdict block text and the guard counts.
