# Task ac-02: sign-in + save-sync — the family's ledgers become accident-proof (LANE-B, branch lane/m4, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/accounts/README.md (AC-02 slice — BINDING) + docs/api-accounts.md (the AC-01 contract — build against it exactly)**; ProfileTransfer (the bundle = the sync payload); save-slots (slots ride the bundle); the menu/profiles UI patterns. ALL DEPS MERGED (ac-01 worker, profile-first-boot, run-suspend, save-slots). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after the baron chain in this lane's queue (054/055/057 — same lane, disjoint surfaces; safe-dupe handles merged ones).

## Scope (spec AC-02)
1. **The sign-in card** (menu → Profiles area): email → 6-digit code → session. DEV MODE against local wrangler (the AC-01 test path) for e2e; production endpoints configurable. Signed-out play IDENTICAL to today (offline-first law — regression-asserted).
2. **Sync loop**: push the active profile's bundle (debounced ≥30s) on wave-boundary + meta changes; pull on sign-in with the compare card ("Cloud has <town> at science 6 from yesterday — use cloud / keep local"); last-write-wins + the server's 5 versions.
3. **The status chip**: "ledger backed up ✓ 2 min ago" (menu + pause, quiet), error states warm ("the wire's down — your ledger stays safe here").
4. **Burn the ledger**: account deletion flow (confirm + done state) per the spec's privacy law.
5. e2e via wrangler-dev DEV_AUTH: full round-trip (sign-in → push → wipe local → pull → restored), compare-card both choices, offline-first byte-identity signed-out.

## Firewall
Touch ONLY: sign-in/sync UI + client module, the chip, e2e (+ the wrangler-dev harness wiring for tests), artifacts. NO worker changes (AC-01's contract is law — flag mismatches), NO changes to bundle format (ProfileTransfer's), NO sim, NO analytics.

## Self-check
tsc/build; the round-trip e2e green (dev-auth local worker) both projects where applicable; profile suites + run-suspend + save-slots + m1-01 + m2-01 unmodified green both projects; zero console errors incl. signed-out boot; screenshots (sign-in card, the chip, compare card, burn flow) into artifacts/ac-02/. Commit on lane/m4. End: READY-FOR-GATES + results. NOTE for the report: production activation still needs the owner's Resend key + KV binding (AC-03) — list the exact desk lines.
