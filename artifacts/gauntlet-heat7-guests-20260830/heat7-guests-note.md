# Heat 7 guests — Era 4 party report

## Verdict

The live Era 4 simulator mints deterministic, assay-verifiable tapes with full `meta.buildId`, `meta.era`, and `meta.engineHash`. Three submitted rows—the operator probe, OMP Claim, and OpenClaw Claim—verified against their original event-log hashes.

The public WATCH projection does **not** carry the full Era 4 papers. For every verified row, `.reel.meta` was exactly `{"buildId":"81caa6956"}`: both `meta.era` and `meta.engineHash` were missing. This is the tape-proof finding the attended EH-3b playback session must take forward.

## Field matrix

| Rider | Map | Attempts / result | Verdict | Shim behavior | Era notice acknowledged in reflection? | Verified WATCH reel papers |
|---|---|---|---|---|---|---|
| OMP 18.0.4 | The Claim | A1 secure: w10, 300s, 40g, 297 kills | SECURED + verified | SSE 200; no retry | Yes — close sites, Spring Heels, distant-seam travel tax | **FAIL** — only `buildId`; era/hash absent |
| OMP 18.0.4 | Night Shift | Three 20m walls: w10 / w13 / w7 | No tape, no secure | SSE 200; no retry | Unobserved — no terminal reflection | n/a |
| OMP 18.0.4 | Hill Mine | Deaths: w1 / w1 / w3 | No secure | SSE 200; no retry | Yes on all terminal reflections | n/a |
| OMP 18.0.4 | Baron | Wall w5; death w12; wall w6 | No encounter; crown open | SSE 200; no retry | Yes on the sole terminal reflection; walls unobserved | n/a |
| Prime Agent 0.8.0 | The Claim | Wall w2; deaths w3 / w3 | No secure | SSE 200; no retry | No on terminal runs; wall unobserved | n/a |
| Prime Agent 0.8.0 | Night Shift | Wall w4; death w2; wall w5 | No dawn secure | One recovered 429 retry; otherwise SSE 200 | No on terminal run; walls unobserved | n/a |
| Prime Agent 0.8.0 | Hill Mine | Deaths w2 / w3 / w2 | No secure | SSE 200; no retry | No on all | n/a |
| Prime Agent 0.8.0 | Baron | Three deaths at w5 | No encounter; crown open | SSE 200; no retry | No on all | n/a |
| Hermes 0.20.0 | The Claim | Three deaths at w2 (81.767s) | No secure | SSE 200; no retry | No on all | n/a |
| Hermes 0.20.0 | Night Shift | Wall w4; deaths w5 / w4 | No dawn secure | Four recovered 429 retries; terminal/wall results retained | No on terminal runs; wall unobserved | n/a |
| Hermes 0.20.0 | Hill Mine | Three deaths at w2 | No secure | SSE 200; no retry | No on all | n/a |
| Hermes 0.20.0 | Baron | Wall w5; deaths w5 / w5 | No encounter; crown open | SSE 200; no retry | No on terminal runs; wall unobserved | n/a |
| OpenClaw 2026.7.1-2 | The Claim | A1 secure: w10, 300s, 45g, 297 kills | SECURED + verified | SSE 200; no retry | Yes — remote harvest changed central fort plan | **FAIL** — only `buildId`; era/hash absent |
| OpenClaw 2026.7.1-2 | Night Shift | Three capacity stops; deepest partial w3 | No tape, no secure | Nine retries; all three exhausted on HTTP 429 under five-call party load | Unobserved — no terminal reflection | n/a |
| OpenClaw 2026.7.1-2 | Hill Mine | Deaths w3 / w2 / w2 | No secure | Serialized; SSE 200; no retry | Yes on all — legal pads and remote travel drove the plan | n/a |
| OpenClaw 2026.7.1-2 | Baron | Three 20m walls: w5 / w6 / w4 | No encounter; crown open | Serialized; SSE 200; no retry | Unobserved — no terminal reflection | n/a |
| elizaOS 1.7.2 | Install/runtime gate | One fresh isolated retry; no version output in 60s; exit 142 | DNF; did not ride | Did not reach shim | n/a | n/a |

## Verified slips and WATCH duty

- Operator probe: tape `agent-0b91cbb4-f4879d5c-fa40-4817-9537-72e63f0087cf`, `assay:"verified"`, `assayHash:"fnv1a32:8886f412"`; `.reel.meta = {"buildId":"81caa6956"}`.
- OMP Claim: tape `agent-90ebe418-32a73f30-8ccb-4d35-a4d1-4d44dc293e57`, `assay:"verified"`, `assayHash:"fnv1a32:775ec7ed"`; `.reel.meta = {"buildId":"81caa6956"}`.
- OpenClaw Claim: tape `agent-1caf920e-9df34c0c-3324-498e-93f3-f749e57d93a1`, `assay:"verified"`, `assayHash:"fnv1a32:8b91245f"`; `.reel.meta = {"buildId":"81caa6956"}`.

Exact finding: **a verified row's WATCH response carries `.reel.meta = {"buildId":"81caa6956"}` and omits both `meta.era` and `meta.engineHash`, although its submitted tape carries all three fields.** Reproduced 3/3 verified rows.

## Other findings

- Embodiment was legible to OMP and OpenClaw but not to Prime Agent or Hermes. The latter two repeatedly declined to say walking changed the plan even when high call counts measured the rider-boundary tax.
- OpenClaw Hill Mine produced the clearest walking evidence: remote harvesting exposed the body, proximity did not imply a legal build pad, and `(-5,12)` was the one proven reachable west pocket.
- More than three concurrent completion calls produced real HTTP 429 capacity failures. Returning to three or fewer active calls removed new retries; later OpenClaw maps were serialized.
- The heat-local driver initially registered a child `close` listener too late. A completed secure could therefore leave the driver waiting after the tape was already finalized. Registering the exit promise at spawn fixed the operator harness without changing any rider tape.
- No guest reached the wave-20 Baron encounter. The Era 4 crown remains open.

## Closeout

- Preflight, era gate, shim SSE/EPIPE proof, and early probe: `preflight.md` plus `shim/` and `probe/`.
- Global OpenClaw approvals snapshot restored byte-for-byte: backup and live SHA-256 both `f16d885841a3a5f3326a99495f198aa535512cca7c36f24b6ac936a736e97c94`.
- Final shim health check returned both `gpt-5.6-luna` and `gpt-5.6-sol`; shim then stopped cleanly and port 8899 refused connection as expected.
- Final `npm run build`: green (`tsc`, Vite, asset diet).
- Commons commits, local only and never pushed: `55840d9`, `b76bbc4`, `dc9b7cc`, `ba5374b`, `6804b92`, `791352a`, `9551fda`, `e500653`, `0eb5096`, `b14ed7b`, `0ecf641`, `f8c74ff`, `9eb0b58`, `b46c111`, `18caea7`, `28eeb0b`.
