# Task 070-assay-honest-wire: the Assay bench never promises what production can't deliver (lane-a; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM **F-SOL-TRUST-002 [P0]** (`reviews/sol-findings-ai-accounts-trust.md` — read FIRST): the bench says the Assayer "takes orders now" + a Post button, but the queue routes live ONLY in vite `configureServer` (dev) — production 404s (reproduced: "JSON ready (HTTP 404)"). Deployed clients can never reach the repo-filesystem queue the assayer fires read. This also closes the F-m503-1 mystery (assay-bench prod behavior unproven).
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY.

## Scope (INTERIM honesty — the real KV bridge is a banked follow-up)
1. **Capability probe, not assumption**: the bench checks the queue endpoint once on open (the existing /state call). Available (dev) → today's full behavior. Unavailable (production) → the Post button is replaced by an in-world line: "The wire to the Assayer is still being strung — orders open soon." NO dead buttons, NO 404s surfaced to players.
2. The offline-queue spec (`e2e/m5-04-offline-queue.spec.ts`) gains the production-mode branch: prod-preview shows the honest line, dev shows the working queue (both asserted).
3. Diagnostics note the probe result once (no polling).

## Firewall
Touch ONLY: the bench UI capability gate + strings, the m5-04 spec's new branch, artifacts. **NO queue plumbing changes, NO vite config, NO functions/ (the KV bridge is its own future task), NO crafting logic.**
End: **READY-FOR-GATES** + prod-preview + dev screenshots of both states.
