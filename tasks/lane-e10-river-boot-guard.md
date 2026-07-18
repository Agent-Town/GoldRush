# Task lane-e10-river-boot-guard: every door boots or declines readably (LADDER, any lane, commit prefix "fix:")
You are Codex, implementer for Gold Rush (worktree per your lane).
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: reviews/smoke-press.md F-SMOKE-1 · src/meta/ContractFamilies.ts activeContractSelection (the fallback machinery — 'unknown-contract' path exists; the stub slips PAST it because e10-river IS a known board entry) · assets/contracts/epoch-10-deepsky/contracts.json (the e10-river stub shape) · e2e/cp05-river.spec.ts (the SUPPORTED river door — keep green).
Pre-flight: standard safe-dupe; tsc+build green.
## Why (F-SMOKE-1, live-deploy smoke 2026-07-18): `?contract=e10-river&debug` boots to a black screen with `TypeError: … (reading 'place')`. Stub board entries are directly reachable and must not throw.
## Scope
1. Direct boot of a stub/board-only contract (no full tile/rules payload) DECLINES readably: fall back to the Claim with a visible one-line reason (the existing fallbackReason surface) — or, where a pressed-charter equivalent exists (THE RIVER via the CP-05 hook), boot THAT instead (preferred if simple).
2. Find the `.place` reader that assumes the full contract shape; make it stub-safe (the guard, not a rewrite).
3. Spec: e2e/e10-river-boot-guard.spec.ts — the raw door yields either the charter-backed RIVER run or the readable fallback, ZERO page errors both projects; cp05-river stays green.
## Firewall: TOUCH-ONLY the boot/fallback path + the one unsafe reader + your spec. NO contract content changes, NO Press changes.
END: READY-FOR-GATES + which option (charter-boot vs fallback) you shipped and why.
