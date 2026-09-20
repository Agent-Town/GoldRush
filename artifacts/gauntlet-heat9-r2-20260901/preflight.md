# Heat 9 R2 preflight

- Safe-dupe: `lane/b` was clean, with zero commits ahead of `origin/main` (119 behind). Factory churn: none present; F-1407-1 acknowledged.
- Live production at run time: `https://gold-rush-3in.pages.dev/version.json` returned build `ec71f923`, built `2026-09-01T08:25:06Z`.
- Detached arena: `/tmp/heat9-r2-c13b4c24` at `ec71f9234`; `npm install` and `npm run build` green (2,214 modules; asset-diet green).
- Era gate: Era 5, **the Replayed Board**. Registry pins: declaration `c0a015ae…`, missed fencepost rotation `417ac150…`, current declaration `25040ad5…`; each carries a cause.
- Shim SSE returned `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`.
- Deliberate abort returned curl rc 28 after 1.15s; the same shim process immediately served both models from `GET /v1/models`.
- Completion calls were serialized by rig and attempt; the >3 concurrent 429 condition was never approached.
- Mandatory early probe secured The Claim and minted build `ec71f9234`, engine `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`, Era 5.
- The public door accepted the probe at rank 4. A transient TLS `ECONNRESET` interrupted only the first verdict poll; the tape was not reposted. Resume-by-tape-id returned `verified`, assay hash `fnv1a32:8886f412`; WATCH papers exactly matched the tape.

