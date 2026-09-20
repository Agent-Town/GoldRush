# Heat 9 preflight

- Safe-dupe: `lane/b` had no content ahead of `main`.
- Live production: `https://gold-rush-3in.pages.dev/version.json` returned build `085ad8ac`, built `2026-08-31T23:25:18Z`.
- Detached arena: `/tmp/heat9-325b7398` at `085ad8acda5c9bf3d14a8d87d96c7b81a3466345`.
- The first combined shell accidentally ran install/build in `lane-b`; the first probe caught the detached arena's missing `vite` before a submission or rider launch. Corrective: `npm install && npm run build` was then run in `/tmp/heat9-325b7398`; green (2,214 modules; asset-diet green).
- Era gate: `{"era":5,"name":"the Replayed Board","engineHash":"c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b"}`.
- Shim SSE: returned `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`.
- Deliberate abort: `curl: (28) Operation timed out after 1150 milliseconds with 0 bytes received`; the shim remained live and listed both supported models.
- Completion concurrency is capped at three; this two-rig field is run serially.
- Early probe tape: build `085ad8acd`, Era 5, computed engine `417ac150318346d52acf9658a6578bc1cc9d54d484c922e80fb6cb8965c3c864`.
- Early probe door verdict: HTTP 400 `{"ok":false,"error":"reel_not_current","message":"This reel's engine pin is not recorded in era 5 'the Replayed Board'."}`.
- Registry pin at the same live commit: `c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b`. The skew law therefore stopped the field before either rider launched.

