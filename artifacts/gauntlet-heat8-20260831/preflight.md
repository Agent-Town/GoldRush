# Heat 8 grand field — preflight

- Safe-dupe refresh: `lane/b` had no ahead content; reset to `main` at `c9d86db11241ef857acb876a4b37bf3f468083ae`.
- Lane install/build: `npm install --no-audit --no-fund`; `npm run build` green.
- Live production: `version.json` returned build `c9d86db1`, built `2026-08-31T09:51:38Z`.
- Detached arena: `/tmp/heat8-4675cfd7` at the full live commit; install/build green.
- Era gate: `{"era":5,"name":"the Replayed Board","engineHash":"c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b"}`.
- Shim SSE: returned `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`.
- Deliberate abort: `curl: (28) Operation timed out after 1057 milliseconds with 0 bytes received`; the shim remained live and listed both `gpt-5.6-luna` and `gpt-5.6-sol`.
- Claude Code CLI: `2.1.223`; runner environment verified separately before each ride with `CLAUDE_CONFIG_DIR` and `CLAUDECODE` removed.

