---
source: codex
project: gold-rush
date: 2026-08-25
type: digest
---

# Heat 6 guests R2 — cured parity, one guest secure, shim survives

## Verdict

The cured premise held. Live build `2701f6b5` resolved to commit `2701f6b56c088f247da9ed5914520a17e480325d`; the detached production build passed, the fresh first-seed Claim probe secured and publicly verified, and the guest field continued lawfully.

Only OMP secured a guest row: The Claim at wave 10 / 11g, stored at rank 7 and publicly `verified` with assay hash `fnv1a32:d0e07bd9`. No other guest reel was secured, so no other guest submission was made. The top-15 trimming addendum never needed to be invoked.

The streaming shim passed SSE, survived one deliberate mid-stream abort, and remained alive across one parity probe plus 46 guest ride launches. The Heat 4 EPIPE failure did not recur. Concurrent field load did expose `HTTP 429: Too many concurrent completions`; retry exhaustion created some exact DNFs but never killed the shim. Fully serializing OpenClaw removed 429s entirely and exposed its actual ceiling: repeated immediate-order states plus context/decision latency, eventually one to four minutes per replacement.

Eliza's single bounded fresh-install retry remained DNF: stable `@elizaos/cli@1.7.2` emitted no version output inside 60 seconds.

## Public proof

- Parity probe: tape `agent-7f16d24a-112e39fe-66c6-4891-8bb5-6f7ec5c494d2`; POST `{ "ok": true, "stored": true, "rank": 2 }`; slip `{ "assay": "verified", "ranked": true, "assayHash": "fnv1a32:ade9c894" }`.
- OMP Claim: tape `agent-94d8e238-9123839c-fcbe-4928-9a50-69679e1e674b`; POST `{ "ok": true, "stored": true, "rank": 7 }`; slip `{ "assay": "verified", "ranked": true, "assayHash": "fnv1a32:d0e07bd9" }`.

## Guest field matrix

| Rider | Map | Attempts | Best/result | Verdict | Shim behavior |
|---|---|---:|---|---|---|
| Prime Agent 0.8.0 | The Claim | 3 | wall w2; death w2; wall w2 | DNF, no secure reel | SSE survived; slow stateless/rejected-order loops |
| Prime Agent 0.8.0 | Night Shift | 3 | death w4; wall w1; wall w3 | DNF | SSE survived; repeated low-progress orders |
| Prime Agent 0.8.0 | Hill Mine | 3 | wall w1; death w2; wall w1 | DNF | SSE survived; invalid/rejected forms and decision loops |
| Prime Agent 0.8.0 | Baron | 3 | wall w3; death w5; death w5 | DNF; never met Baron | serialized final ride reduced wall latency, not outcome |
| OMP 18.0.4 | The Claim | 1 | **secured w10 / 11g** | **verified**, rank 7, `fnv1a32:d0e07bd9` | SSE survived |
| OMP 18.0.4 | Night Shift | 3 | wall w19; wall w15; wall w8 | DNF, no reels | SSE survived; throughput wall |
| OMP 18.0.4 | Hill Mine | 3 | wall w13; death w6; death w4 | DNF | SSE survived; repair spiral / illegal placements |
| OMP 18.0.4 | Baron | 3 | wall w16; wall w7; wall w13 | DNF; never met Baron | SSE survived; throughput wall |
| Hermes 0.20.0 | The Claim | 3 | death w2; death w2; no reel | DNF | third launch exhausted retryable 429s |
| Hermes 0.20.0 | Night Shift | 3 | wall w4; no reel; wall w5 | DNF | middle launch exhausted 429s; shim stayed live |
| Hermes 0.20.0 | Hill Mine | 3 | no reel; death w2; death w2 | DNF | first launch exhausted 429s; shim stayed live |
| Hermes 0.20.0 | Baron | 3 | no reel at w5; death w5; death w5 | DNF; never met Baron | first launch exhausted 429s; shim stayed live |
| OpenClaw 2026.7.1-2 | The Claim | 3 | three no-reel launches; deepest partial w7 / 100 HP | DNF | concurrent 429 exhaustion; shim stayed live |
| OpenClaw 2026.7.1-2 | Night Shift | 3 | walls w10 / w5 / w6 | DNF, no reels | serialized SSE 200 throughout; immediate-order loops |
| OpenClaw 2026.7.1-2 | Hill Mine | 3 | deaths w2 / w1 / w1 | DNF | serialized SSE 200; illegal placements and no compact defense |
| OpenClaw 2026.7.1-2 | Baron | 3 | walls w6 / w6 / w6 | DNF; never met Baron | serialized SSE 200; context latency became binding |
| Eliza CLI 1.7.2 | install gate | 1 | no output in 60s | DNF (install/runtime) | not seated |

The guest-attempt count is 46 because OMP stopped The Claim on its first secure; every other rider/map cell used all three bounded attempts.

## Commons loop

Each prompt carried the door manual, that rider's own pre-run notebook, the map almanac, and (for Baron only) the war-room board. Initial notebook hashes carried into the field were Prime `d4a43a8d…`, OMP `2fb405c1…`, Hermes `2471a8cc…`, and OpenClaw `e28f16d6…`. Rider reflections were retained where a reel existed; operator-scribed notes are explicitly labeled for wall/429 attempts.

Path-scoped gauntlet commits from this guest heat, never pushed:

- `4d10136` Hermes Claim
- `fc2c7d7` OpenClaw Claim
- `948a381` Prime Claim
- `ee67e1f` Hermes Night Shift
- `2b7b520` Hermes Hill Mine
- `04cd821` OMP Night Shift progress
- `932e911` OMP verified Claim
- `208bf4a` Prime Night Shift
- `0f7a831` Hermes Baron
- `2565537` OMP Hill Mine
- `c42948f` Prime Hill Mine
- `1fc6f36` OMP Baron
- `0844e29` Prime Baron
- `edb4e0d` OpenClaw Night Shift
- `2dc558c` OpenClaw Hill Mine
- `cb79ec5` OpenClaw Baron

## Configuration and evidence hygiene

Prime, OMP, and Hermes used heat-local state paths. OpenClaw's global approvals migration was restored byte-for-byte; final SHA-256 is `f16d885841a3a5f3326a99495f198aa535512cca7c36f24b6ac936a736e97c94`. Later OpenClaw runs used `/tmp/heat6g-r2-openclaw-state`. Heat-local state databases/config copies were removed from the evidence tree after the program; only non-secret evidence remains.

The shim SSE transcript, deliberate abort, model list, parity reel/submission/slip, OMP reel/submission/slip, every rider transcript or exact error, every wall stop, and the Eliza retry are retained beside this note.
