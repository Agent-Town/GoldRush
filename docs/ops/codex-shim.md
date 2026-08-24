# Codex subscription shim

This localhost-only service lets OpenAI-compatible guest harnesses use Robin's existing Codex subscription login. It wraps the public `codex exec --ephemeral --json` mode; it does not read, copy, print, or translate `~/.codex/auth.json` itself.

## Operate it

Start it from the repository root:

```sh
npm run codex-shim
```

It listens only on `127.0.0.1:8899`. Set `PORT` to change the port. Stop it with `Ctrl-C` or `SIGTERM`. Point a guest harness at `http://127.0.0.1:8899/v1`; the API implements `GET /v1/models` and streaming or non-streaming `POST /v1/chat/completions`.

Each request launches one `codex exec --ephemeral` process in a read-only temporary working directory. No Codex thread is persisted or resumed. OpenAI function tools, developer messages, and tool-result messages are translated across the boundary; Codex returns function calls through a constrained JSON schema for the guest harness to execute. The launcher selects a working Codex CLI 0.149.1 or newer, including the repo runner's nvm installation when the shell's bare `codex` is stale. `CODEX_BIN` may pin an explicit client.

Only non-browser `application/json` requests are accepted, and at most four completions run concurrently by default. Set `CODEX_SHIM_MAX_CONCURRENCY` to tune that cap.

## Models and billing

| Requested model | Codex subscription model |
| --- | --- |
| `codex` or omitted | `gpt-5.6-luna` |
| `gpt-5.6-luna` | `gpt-5.6-luna` |
| `gpt-5.6-sol` | `gpt-5.6-sol` |

Both model ids were verified through Codex CLI 0.149.1 on 2026-08-24. Other ids are rejected instead of silently changing providers.

## Streaming fidelity

Requests with `"stream": true` receive standard Server-Sent Events: an assistant-role chunk, a content or tool-call chunk, a finish chunk containing usage, then `[DONE]`. This is protocol-compatible buffered streaming, not token-by-token streaming: the shim waits for `codex exec --json` to finish before it emits the chunks. Aborting the client request terminates the in-flight Codex process.

Billing truth: completions use the OpenAI account currently logged into Codex and draw on that account's Codex subscription allowance and limits. They do not use an API key or OpenRouter. This is an agent-turn compatibility bridge, not a raw OpenAI API endpoint: Codex's own agent instructions remain part of each turn, which adds substantial input tokens and may not reproduce every chat-completions parameter exactly.

## Verify it

```sh
npm run test:codex-shim
```

The test makes non-streaming and streaming round trips plus three parallel requests. It skips live arms loudly when `${CODEX_HOME:-~/.codex}/auth.json` is unavailable; the pure streaming and client-abort arms still run. Prove that path without changing auth by pointing `CODEX_HOME` at an empty directory:

```sh
CODEX_HOME=/tmp/no-codex-auth npm run test:codex-shim
```
