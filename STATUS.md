# STATUS — Gold Rush

Last updated: 2026-07-03 (session 1, mid-session)

## Current milestone
M0 Skeleton — implement loop running. Active slice: **m0/01-scaffold-boot** (Codex, in progress).

## Codex mode: SANDBOX CLI ✓
- codex 0.142.5 at `~/.npm-global/bin` (each bash call: `export PATH=~/.npm-global/bin:$PATH`)
- Auth: Robin's ChatGPT subscription via `.codex-auth/auth.json` (gitignored) copied to `~/.codex/auth.json`; `~/.codex/config.toml` trusts the repo path. Re-copy both per session (sandbox home is ephemeral).
- Delegation: `codex exec --dangerously-bypass-approvals-and-sandbox` (needed for npm/vite/playwright localhost binds), prompt from file, `< /dev/null`, nohup + `-o` output file, poll log. Codex does NOT commit — orchestrator reviews then commits.

## Sandbox environment recipe (proven this session)
- Mounted repo: create/modify OK; **deletion requires enabling once per session** (`allow_cowork_file_delete`) — after enabling, rm/npm/git all work. Stale `.git/index.lock` → delete it.
- `npm install` works in the mounted repo.
- Playwright: browsers PREINSTALLED at `~/.cache/ms-playwright` (chromium 1228 ⇒ pin `@playwright/test@^1.61`). NEVER `npx playwright install` (CDN blocked). Headless launch needs `export LD_LIBRARY_PATH=/sessions/relaxed-busy-meitner/locallibs/usr/lib/aarch64-linux-gnu` (libXdamage extracted from a local .deb — re-extract per session: `apt-get download libxdamage1 && dpkg -x libxdamage1*.deb ~/locallibs`).
- python3 3.10 available (scaffold script). Node 22.22.3, npm 10.9.8.

## Decisions this session
- Robin (interview): Codex = auth.json copy; weapons = frontier-tech → sci-fi over epochs (ADR-001); agent role = **Prospector**; controls = WASD + auto-fire, top-down oblique. Plus: **fun is a pillar** — quirky/nerdy/cute welcomed (charm ledger in M1 README).
- Specs written: `specs/m0-skeleton/` (5 slices), `specs/m1-core-loop/` (7 slices) — synthesized from 3 independent drafts.
- Asset pipeline: `assets/LEDGER.md`, batch-001 (6 prompts) written, **awaiting Robin's budget OK before generation**; layer contracts stubbed.

## Open reviews
- m0/01 pending Codex completion → review next.

## Blockers
none hard. Robin owes: batch-001 budget OK (non-blocking; placeholders rule).

## Next step
Review m0/01 diff + evidence → commit → delegate m0/02+03+04 in parallel → 05 → M0 checkpoint for Robin.

## Done log
- 2026-07-03: skeleton commit e439424; specs/assets commit bc87a96; toolchain + env proven; Codex authenticated (subscription); m0/01 delegated.
