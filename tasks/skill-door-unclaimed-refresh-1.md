# Task skill-door-unclaimed-refresh-1: the agents' door page stops calling two secured Era 10 contracts "unclaimed" (LANE-C, Astra, commit prefix "fix:")

CODEX: model=gpt-6-astra

You are Codex (gpt-6-astra), implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c` (branch `sol/map-art-campaign-2`; the branch name is history, your commits are path-scoped). You do not touch STATUS.md, reviews, tasks or other lanes. Lane-c's `node_modules` is a symlink to the primary checkout: expected, not dirt; do NOT run `npm install`/`npm ci`.
READ FIRST: AGENTS.md; `public/skill.md` (the door-contracts block around lines 446 to 483: one row per contract with "first secured by <rider> on <date>" or "unclaimed"); `reviews/heat-14-era6-reride.md` (line 11 records the first-ever secures of `e10-archive-world` and `e10-ember-shore` on 2026-09-18, with the riders); `scripts/assay-lineage-sweep.mjs:131-133` (a READER of that block, so its shape is a contract); then FIND THE WRITER: `grep -rn "first secured by" scripts/ functions/ server/ 2>/dev/null` and whatever data file the block is rendered from (the thread review noted the data last changed 2026-09-12). Never send a request to the live county.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL; the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B sol/map-art-campaign-2 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work; resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) are NEVER work and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` are always expected, never a STOP; what still STOPs is modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (attended, 2026-09-29, from the launch-thread review)
The door page is what agents read to ride. It tells them `e10-archive-world` and `e10-ember-shore` are unclaimed (`public/skill.md:451-452`), while the county recorded first secures of both on 2026-09-18 (`reviews/heat-14-era6-reride.md:11`). A stale "unclaimed" invites agents to chase a bounty that is gone, on launch day.

## Scope
1. Establish the truth for each of the two rows from the ledger surfaces named above (rider id, display name, date); if the review and any data file disagree, the review's dated evidence wins and you say so.
2. If a generator writes the block, fix its INPUT (the data file) and regenerate; if the block is hand-written, edit the two rows in the block's exact shape. Either way `scripts/assay-lineage-sweep.mjs` must still parse it (run it, or its test, and show the result).
3. Audit the rest of the block the same way, cheaply: list every "unclaimed" row and, for each, grep `reviews/` and `tasks/BACKLOG.md` for a recorded first secure; fix only what a dated record proves; report the rest as still unclaimed.
4. Report `artifacts/skill-door-unclaimed-refresh-1/report.md`: the writer you found (or "hand-written"), before/after rows, the audit table. If you find yourself about to exit without changes, WRITE WHY into your report first.

## Firewall
Touch ONLY: `public/skill.md` (the door-contracts block rows), the block's data source and generator if they exist (name them in the report), `artifacts/skill-door-unclaimed-refresh-1/**`.
NO changes to: `src/**`, `e2e/**`, `site/**`, `functions/**` behaviour, `tasks/**`, `specs/**`, `reviews/*.md`, `STATUS.md`, other lanes' work; no live-county requests; no invented dates or riders.

## Self-check (evidence, not vibes)
`node scripts/assay-lineage-sweep.mjs` (or its test) still parses the block; `npx tsc --noEmit` and `npm run build` green; `e2e/task-025-bandits-dont-swim.spec.ts` and `e2e/m2-01-build-menu.spec.ts` unmodified-green both projects; any spec that reads `public/skill.md` (`grep -l "skill.md" e2e/*.ts`) green. No `src/**` change (hash unchanged landing unless the build hashes `public/`; report which).
End: READY-FOR-GATES + the rows as landed + the audit table + the writer + commit hash.
