# Task gauntlet-heat3c-shim-streaming: the shim learns to stream — the one wall all four riders hit (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the heat-3b run's verdict (tasks/runs/20260824-163258-lane-b-gauntlet-heat3b-full-field.md.log tail + its BACKLOG row): Prime Agent 0.8.0, OMP 18.0.4, Hermes 0.20.0 and OpenClaw 2026.7.1-2 ALL reached the shim and ALL config-DNF'd on `400 Streaming is not supported` — one cure, four riders**; server/codex-shim/serve.mjs + serve.test.mjs (heat-3a's shipped shim: `codex exec --ephemeral --json` wrapper, localhost-only, no auth material touched); docs/ops/codex-shim.md; reviews/gauntlet-heat3a-codex-backend-shim.md (the gate story + F-2272-1's spend caveat — the live test costs ~16.7k prompt tokens per run, which is why the suite is grandfathered un-rooted).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch may be ahead with heat-3b's UNDRAINED evidence commit — that is NOT yours to reset: if `git log main..lane/b` shows the heat-3b run's commit and a fire has not drained it yet, BUILD-ON-PREDECESSOR is not declared for this master, so STOP and report "heat-3b undrained" UNLESS the ahead content is already merged (then SAFE DUPE → `git checkout -B lane/b main && git clean -fd`, PROCEED). FACTORY-CHURN EXCEPTION (F-1407-1) as always. `npm install --no-audit --no-fund`; build green.

## Why (owner directive standing: "we want to run hermes, openclaw and all of them on Codex/subscription"; heat-3b measured the single blocker)
Modern harness loops consume Server-Sent-Events streaming from `/v1/chat/completions` and refuse non-streaming endpoints. The shim answers `400` to `"stream": true`. Four installed riders wait on exactly this.

## Scope
1. `stream: true` requests answer as SSE (`text/event-stream`): emit OpenAI-shape `chat.completion.chunk` deltas and the terminal `[DONE]`. HONEST streaming is acceptable at minimum viable fidelity: run the underlying `codex exec --json` to completion, then emit the result as chunked deltas (role chunk, content chunk(s), finish chunk) — riders need the PROTOCOL, not token-by-token latency; if the underlying mode surfaces incremental output cheaply, pass it through, but do not build a token pump the backend doesn't offer.
2. Non-streaming behavior byte-unchanged (the heat-3a tests must stay green unmodified where they assert it).
3. Usage fields on the final chunk per the OpenAI shape (the heats meter arm costs from them).
4. Tests: extend serve.test.mjs — a streaming round trip (pure-arm parse test with a stubbed backend + a live arm behind the same auth-presence skip guard heat-3a shipped); a client-abort mid-stream leaves no orphan codex process (assert by pgrep before/after).
5. docs/ops/codex-shim.md: the streaming section + the fidelity caveat stated plainly.

## Firewall
Touch ONLY: server/codex-shim/**, docs/ops/codex-shim.md, BACKLOG row. package.json only if a test target needs it. NO game code, no heats' artifacts, no guest harness configs.

## Self-check (evidence, not vibes)
tsc + build green; the shim suite green including the new arms (quote the live streaming arm's chunk count + usage); the abort test proves no orphans; non-streaming arm unchanged. End: READY-FOR-GATES + report: the SSE shape shipped, fidelity honestly stated, per-completion latency streaming vs not.

## No-op / honesty guard
If `codex exec --json` structurally cannot back even chunked-at-completion SSE, STOP with the measurement — heat-4 waits on truth, not on a fake stream that breaks mid-ride.
