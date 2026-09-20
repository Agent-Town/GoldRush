# Heat 7 guests — preflight

- Safe-dupe refresh: `lane/b` was 39 behind and 0 ahead of `main`; refreshed to `a234779f4` before work.
- Lane install/build: `npm install --no-audit --no-fund` completed; `npm run build` green.
- Live production build: `4dd88e1b24e93c86c74b1a46217f9c54579e5e35` (`version.json` build `4dd88e1b`, built `2026-08-30T13:47:43Z`).
- Detached live worktree: `/tmp/heat7g-81caa695`; install and build green.
- Era gate quote: `{"era":4,"name":"the Embodied Hand","engineHash":"d5b04061596bdf43b313a0e430229a46d10e67e52877c6394b61aea05efd389a"}`.
- Shim SSE gate quotes: `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`.
- Deliberate stream-abort quote: `curl: (28) Operation timed out after 1147 milliseconds with 0 bytes received`; the same shim then returned both `gpt-5.6-luna` and `gpt-5.6-sol` from `/v1/models`.
- Early probe: wave-10 secure verified under tape `agent-0b91cbb4-f4879d5c-fa40-4817-9537-72e63f0087cf`; event-log/assay hash `fnv1a32:8886f412`.
- Early WATCH finding: `.reel.meta` was exactly `{"buildId":"4dd88e1b2"}`. It omitted both `meta.era` and `meta.engineHash`.
