# Task gauntlet-heat3a-codex-backend-shim: guest harnesses ride the Codex subscription — the local backend shim (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the OWNER DIRECTIVE in the Why**; your own CLI's server surfaces (`codex --help`: `app-server`, `mcp-server`, `exec-server` — investigate which can back a raw chat-completion round trip on the SUBSCRIPTION auth in ~/.codex/auth.json); tasks/gauntlet-heat2-harness-matrix.md (the field this serves; heat-3b consumes your endpoint).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/b main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (owner 2026-08-24, verbatim: "we want to run hermes, openclaw and all of them on Codex/subscription")
Guest harnesses (hermes, openclaw, pi, omp, eliza, the paper harnesses) each expect an OpenAI-compatible API. The owner wants their model calls billed to the Codex subscription, not to per-token keys. No such endpoint exists on this machine — this slice builds the smallest honest one.

## Scope
1. **Investigate first, build second** (the report carries the investigation either way): can `codex app-server` / `exec-server` / the CLI's own wire protocol serve a raw model completion under the subscription auth? Prefer wrapping an EXISTING mode over reverse-engineering private endpoints. If the subscription's terms or the CLI's design make raw completions genuinely unreachable, STOP and report the honest alternatives (the owner decides; NEVER silently fall back to the OpenRouter key in .env.local — that is metered money he did not offer).
2. **The shim**: `server/codex-shim/serve.mjs` — an OpenAI-compatible `/v1/chat/completions` (+ `/v1/models`) on `127.0.0.1:<PORT>` (env, default 8899), translating to the discovered codex backend. Non-streaming first; streaming only if cheap. Binds localhost ONLY. NEVER logs, echoes, or copies auth material; it READS ~/.codex auth in place via the codex tooling itself wherever possible.
3. **Session hygiene**: one guest request = one completion; no persistent codex agent sessions leak between requests; a per-request model parameter maps to the models the subscription actually offers (report the mapping).
4. **Tests**: a round-trip test (spawn shim → POST a chat completion → assert a coherent response + usage fields) — SKIPPED cleanly in CI/fire shells where the subscription auth is absent (guard on auth presence, skip loudly, never red). A concurrency smoke (3 parallel requests).
5. **The operator note**: docs/ops/codex-shim.md — how to start/stop it, the port, the model mapping, and the billing truth (what plan it draws on).

## Firewall
Touch ONLY: `server/codex-shim/**` (new), its test, `docs/ops/codex-shim.md`, `package.json` (a script target), BACKLOG row. NO changes to: ~/.codex/** (read-only), .env.local, any game code, the heats' masters.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; the round-trip test green ON THIS MACHINE (quote the response's model + usage); the skip path proven by running with auth masked via env override. End: READY-FOR-GATES + report: the backend mechanism chosen and why, the model mapping, latency per completion (the heats need to know), the billing truth stated plainly.

## No-op / honesty guard
If every lawful path to subscription-backed completions dead-ends, the STOP report with the option table IS the deliverable — the owner would rather rule on honest options than discover a metered bill or a ToS breach.
