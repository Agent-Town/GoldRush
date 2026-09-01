# Task deploy-mirror-allowlist: the droplet mirror ships the runtime set and nothing else — allowlist, not denylist, with a guard that knows what the runtime imports (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: AGENTS.md; `scripts/deploy.sh` (the ASSAYER LEG rsync ~`:175` — today a growing `--exclude` list (F-DEPLOY-0829 `gate-s*`, F-DISK-0902 reviews/e1-review-video/marketing/env/raw art) plus the post-sync MIRROR-BLOAT gauge added attended); `server/ledger/serve.mjs` + `scripts/assay-worker.mjs` + `scripts/assay-replay-agent.mjs` (`ENGINE_SOURCE_INPUTS`) — what the box's two services actually import at runtime; `ops/droplet/*.service` (WorkingDirectory + ExecStart paths); the owner's question (2026-09-02): "How can we make sure that the next sync/deploy will [not] result in the same issue?"

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm ci`; `npm run build` green.

## Why (a denylist is a promise to remember every future folder; an allowlist is a fact about what runs)
Twice in a week the mirror shipped gigabytes the box never reads — gate scratch, then review video and raw art — because the rsync excludes by NAME. The next new directory at the repo root ships by default. The box needs exactly: the two services' import closure + the engine surface + the static site + package files. Everything else should be impossible to ship, not merely remembered.

## Scope
1. **Flip the rsync to an allowlist**: `--include` the runtime set — `src/`, `scripts/` (only what the services and the replay import; if the whole dir is simpler, justify), `functions/`, `server/`, `ops/`, `site/`, `public/` (if the ledger serves anything from it — verify), `assets/contracts/`, `assets/layer-contracts/`, `assets/crafting-queue/`, `assets/pilots/map-rebuild-spike/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `assets/engine-era.json` — then `--exclude '*'`. **Protect box-local state from `--delete`**: `node_modules/` (installed ON the box), and confirm the ledger DB (`/opt/goldrush-ledger/`) and site uploads are outside the mirror root (they are; assert in the test). Decide `--delete-excluded` deliberately: it is the mechanism that would have removed the spillover automatically, but it must never touch the protected paths — use rsync filter rules (`P node_modules/`) and prove it with the dry-run test below.
2. **The guard** (`scripts/deploy-mirror-allowlist.test.mjs`, rooted in `test:node-guards`): (a) every path in `ENGINE_SOURCE_INPUTS` is inside the allowlist; (b) the static import closure of `server/ledger/serve.mjs` and `scripts/assay-worker.mjs` (walk their imports; `functions/api/*` reached via vite ssrLoadModule counts) is inside the allowlist; (c) an rsync `--dry-run` against a fixture tree containing decoys (`e9-review-video/`, `gate-t99/`, `assets/raw/x.png`, a 3 MB junk file at the root) ships NONE of them and DOES ship every runtime path; (d) the protected paths survive a dry-run with `--delete`.
3. **Say the weight**: keep the attended post-sync gauge; lower the ceiling to what the allowlisted mirror actually weighs + 50% (measure it on the box after the first allowlisted sync) so bloat is caught at the first deploy that ships it.
4. **fire.md**: one line in the deploy law — the mirror is allowlisted; a new runtime dependency means editing the allowlist AND the guard passes, never a fresh exclude.

## Firewall
Touch ONLY: `scripts/deploy.sh` (the rsync invocation + gauge ceiling), the new guard + its fixture, `package.json` (test:node-guards registration only), `scripts/fire.md` (one line), BACKLOG row. NO service code, NO nginx, NO era logic.

## Self-check (evidence, not vibes)
`bash -n scripts/deploy.sh`; `npm run test:node-guards` green including the new guard (count); a REAL dry-run against the live repo root printed in the report (`rsync -n -i` file list: nothing outside the allowlist); the first real sync's mirror weight quoted from the deploy log. Report: the allowlist, the protected paths, the delete-excluded decision, the import-closure listing the guard derived.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If the import closure reaches a path you did not expect (a runtime dependency on something outside the runtime set), the allowlist grows and the report names it — never widen to a directory wholesale to make the test pass.
