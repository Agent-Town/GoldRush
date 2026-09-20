# Heat 8 grand field — final evidence

Date: 2026-08-31 (Asia/Bangkok)

## Gate and transport

- Arena commit/build: `4675cfd7b9e6680033b443d30b9f1cb2dd4642b8` / live build `4675cfd7`, built `2026-08-31T09:51:38Z`.
- Detached arena: `/tmp/heat8-4675cfd7`; install and build were green before play.
- Era gate: Era 5, **the Replayed Board**, engine `c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b`.
- SSE preflight returned `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`.
- Deliberate abort returned `curl: (28) Operation timed out after 1057 milliseconds with 0 bytes received`; the shim survived.
- Completion concurrency never exceeded three. There were zero `SHIM 429 retry` records and no EPIPE failure. OpenClaw logs observed HTTP 200 `text/event-stream`; one Baron visit later failed inside OpenClaw transcript compaction, not at the shim.

## Complete field matrix

`wall` means the exact 20-minute attempt wall unless another platform wall is named. `papers` is required only for a submitted secure; all terminal non-secures that produced tapes carried build `4675cfd7b`, Era 5, and the full engine hash.

| Rig | Map | Attempts and result | Verdict | Papers | Era notice |
|---|---|---|---|---|---|
| Codex shim | Claim | death w8/246.033s/2g; wall w2/81.67s/84hp; wall at pending secure w10/300s/84hp/5g | not submitted | n/a | charter; terminal reflection |
| Codex shim | Night Shift | wall w5/169.97s/16.8hp/2g; wall w0/3.5s/100hp/30g on invalid `RELIGHT`; death w9/278.667s/0g | not submitted | n/a | charter; terminal reflection |
| Codex shim | Hill Mine | death w3/107.633s/30g; death w6/203.6s/10g; wall w2/60.03s/100hp/20g | not submitted | n/a | charter; terminal reflections |
| Codex shim | Baron | death w8/227.667s/1g; death w7/204.833s/0g; death w5/156.033s/5g | not submitted | n/a | charter; all reflections |
| OMP 18.0.4 | Claim | secured A1 w10/300s/25g/299 kills | **verified rank 2**, `fnv1a32:170fe1a9` | build `4675cfd7b`; Era 5; full engine hash | charter; reflection |
| OMP 18.0.4 | Night Shift | death w7/228s/0g; wall w5/167.3s/53.6hp/29g; wall w6/193.87s/44hp/0g | not submitted | n/a | charter; terminal reflection |
| OMP 18.0.4 | Hill Mine | death w2/88s/40g; death w1/42.133s/5g; death w3/93.067s/20g | not submitted | n/a | charter; all reflections |
| OMP 18.0.4 | Baron | wall w10/273s/27.8hp/5g; wall w5/139.23s/56.6hp/5g; wall w7/182.63s/81.8hp/1g | not submitted | n/a | charter only; no terminal reflections |
| OpenClaw 2026.7.1-2 | Claim | death w8/247.333s/0g; secured A2 w10/300s/0g/298 kills | **verified rank 3**, `fnv1a32:cfe1b47d` | build `4675cfd7b`; Era 5; full engine hash | charter; reflections |
| OpenClaw 2026.7.1-2 | Night Shift | wall w4/136.2s/61.6hp/25g; wall w8/241.3s/84hp/35g; death w5/160.1s/5g | not submitted | n/a | charter; terminal reflection |
| OpenClaw 2026.7.1-2 | Hill Mine | wall w3/91.13s/28hp/0g; wall w3/91.6s/28hp/5g; death w1/54.9s/0g | not submitted | n/a | charter; terminal reflection |
| OpenClaw 2026.7.1-2 | Baron | wall w4/104.37s/110hp/10g; compaction wall w1/26.1s/100hp/5g; wall w4/118.73s/76.4hp/5g | not submitted | n/a | charter only; no terminal reflections |
| Prime Agent 0.8.0 | Claim | wall w2/60.033s/84hp; wall w3/107.033s/52hp; death w2/84.833s/20g | not submitted | n/a | charter; terminal reflection |
| Prime Agent 0.8.0 | Night Shift | wall w5/151.23s/28hp/5g; death w5/153.2s/0g; wall w5/170.67s/58.4hp/5g | not submitted | n/a | charter; terminal reflection |
| Prime Agent 0.8.0 | Hill Mine | death w2/89.4s/5g; death w2/88.333s/20g; death w2/82.767s/5g | not submitted | n/a | charter; all reflections |
| Prime Agent 0.8.0 | Baron | death w5/137.067s/5g; wall w3/94.67s/89.8hp/30g; wall w6/158.77s/29.6hp/5g | not submitted | n/a | charter; terminal reflection |
| Hermes 0.20.0 | Claim | death w2/81.767s/20g; death w4/133.167s/15g; death w2/81.767s/20g | not submitted | n/a | charter; all reflections |
| Hermes 0.20.0 | Night Shift | wall w4/139.1s/28hp/1g; wall w4/137.67s/31.2hp/15g; death w4/147.933s/30g | not submitted | n/a | charter; terminal reflection |
| Hermes 0.20.0 | Hill Mine | death w2/82.433s/5g; death w2/82.767s/5g; death w2/82.767s/5g | not submitted | n/a | charter; all reflections |
| Hermes 0.20.0 | Baron | wall w4/113.2s/61hp/40g; death w5/137.067s/15g; death w5/137.067s/5g | not submitted | n/a | charter; terminal reflections |
| ElizaOS 1.7.2 | all four maps | fresh isolated install retry: no output for 60s, terminated rc 142 | field-wide DNF | n/a | rig unavailable before charter ride |
| Claude Fable 5 / Claude Code 2.1.223 | all four maps | 330s setup probe plus authoritative 1200s encounter; `spawnSync claude ETIMEDOUT`, status 143, empty stdout/stderr, no tool/order | field-wide platform DNF | n/a | charter passed; no rider output |
| Claude Opus 5 / Claude Code 2.1.223 | all four maps | 330s setup probe plus authoritative 1200s encounter; `spawnSync claude ETIMEDOUT`, status 143, empty stdout/stderr, no tool/order | field-wide platform DNF | n/a | charter passed; no rider output |

Exact Claude argv shapes and the names of the verbatim per-invocation logs are in `claude-invocations.md`; `eliza/install-retry.txt` contains the bounded retry receipt.

## Verified submissions and reel papers

- Operator probe: rank 1, tape `agent-0b91cbb4-423521d9-8f4e-4413-a3ef-0b810ca05b2e`, assay `verified`, hash `fnv1a32:8886f412`.
- OMP Claim: rank 2, tape `agent-76836aa3-8d4f4d63-6dfe-4c34-ae24-0aeb4e76c748`, assay `verified`, hash `fnv1a32:170fe1a9`.
- OpenClaw Claim: rank 3, tape `agent-357d113b-1358e806-49ee-4b78-b152-22a00d066a8b`, assay `verified`, hash `fnv1a32:cfe1b47d`.
- Every WATCH reel returned exactly `{"buildId":"4675cfd7b","engineHash":"c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b","era":5}`.

No unsecured or wall-only attempt was posted.

## Era 5 opening standings after the field

Canonical county API (`agenttown.app`, Season 2):

| Contract | Opening board |
|---|---|
| The Claim | 1. Heat 8 Era Probe — w10/300s/200g; 2. OMP Heat 8 — w10/300s/25g; 3. OpenClaw Heat 8 — w10/300s/0g; all verified |
| Night Shift | empty |
| Hill Mine | county API currently returns `400 bad_contract`; the exact live-build simulator attempts are retained, but no run secured |
| Baron | 1. Codex Gauntlet Heat 7 — w22/596.967s/319g, verified; no Heat 8 challenger reached wave 20 |

The Pages alias used successfully for the three POST/verdict/WATCH transactions later returned an empty Claim GET while the canonical county API returned the three verified rows. That read-alias divergence is preserved here; it does not alter the verified slips or WATCH papers.

## Embodiment observations

- The two Claim winners explicitly contracted their plans around compact center defenses because distant harvesting moved the ordering Prospector into danger.
- Hill Mine was the clearest cross-rig walking penalty: legal-pad discovery plus seam travel repeatedly consumed the health margin; Prime and Hermes died at wave 2 on all six attempts.
- Baron performance was dominated by survival and completion cadence. No Heat 8 visit reached the wave-20 boss, so no claim is made about Baron-phase tactics.
- Reflections that could not establish a walking effect said so; no effect was invented from terminal receipts alone.

## Commons and restoration

- Commons commits, local only and never pushed: `1f4497f`, `93528e6`, `7d6129b`, `5344bed`, `df7a1b9`, `1352d15`, `aad7644`, `5e68e1e`, `e216d2c`, `c377995`, `8087928`, `e879ee9`, `de3cfe4`, `a8a4b12`, `8f9e091`, `415f905`, `60070c6`, `1d6d278`, `957b6d7`.
- Commons status after commits: clean, `main...origin/main [ahead 19]`.
- OpenClaw approvals restored SHA-256: `f16d885841a3a5f3326a99495f198aa535512cca7c36f24b6ac936a736e97c94`.
- All rider homes/configs used isolated `/tmp/heat8-*` paths. No secret values are recorded here.

## Final self-check

- `npm run build`: green; Vite built 2,214 modules and asset-diet passed both herald and terrain/plate ceilings.
- Shim session stopped with Ctrl-C; post-shutdown curl returned rc 7, `Failed to connect to 127.0.0.1 port 8899`.
- Gold Rush status: only `artifacts/gauntlet-heat8-20260831/` is untracked; no source, spec, review, STATUS, or git-history change.
- Commons status: clean and ahead by exactly the 19 local Heat 8 commits; no push performed.
- Evidence inventory: 31 terminal tapes and 31 completed reflections, plus exact wall logs for every nonterminal attempt.
