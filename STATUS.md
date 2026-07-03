# STATUS — Gold Rush

Last updated: 2026-07-03 (session 1)

## Current milestone
M0 Skeleton — in progress (session goal: reach M0 playable checkpoint)

## Active slice
none yet — specs being written

## Codex mode
TBD this session. Sandbox CLI installed (codex 0.142.5, `~/.npm-global/bin`); `api.openai.com` reachable but no auth. Needs Robin's API key in `.env.local` (OPENAI_API_KEY) for sandbox mode, else file relay via `tasks/`.

## Sandbox constraints (learned 2026-07-03)
- Mounted repo: file **create/modify OK, delete blocked by default** — deletion was enabled for this session via Cowork permission, but future sessions must re-enable it (`allow_cowork_file_delete`) before any `rm`/git ops that unlink.
- A stale `.git/index.lock` from a blocked unlink will wedge git — delete it first if git errors.
- `npm install` in the mounted repo untested; if it fails on renames/unlinks, build in `~/work/goldrush` (sandbox home) and rsync back. Test at scaffold time.
- npm global installs need `npm config set prefix ~/.npm-global`; add `~/.npm-global/bin` to PATH each bash call.

## Open reviews
none

## Blockers
- Codex auth decision (Robin: API key vs file relay) — interview pending
- Canon sign-off on §9.2 genre-signal bend — interview pending

## Next step
Interview Robin (batched round), then write specs/m0-skeleton/ + specs/m1-core-loop/, then start M0 implement loop.

## Done log
- 2026-07-03: repo skeleton, .gitignore, first commit e439424. Brief + 4 SKILL.md playbooks read. Toolchain verified (node 22.22.3, npm 10.9.8, codex CLI installed, unauthenticated).
