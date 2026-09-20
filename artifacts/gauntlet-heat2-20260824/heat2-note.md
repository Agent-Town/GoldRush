# Gauntlet heat 2 — harness matrix

Operator: Codex `gpt-5.6-sol` in lane-d. The operator did not author any rider's standing orders and is not declared in any rider stack. All rides used detached deployed commit `b42c0fbcc`; `/tmp/heat-b42c0fbc` remained owned by heat 1 and untouched.

## Matrix

| rider | contract | attempts | result | tapeId | verdict | rider wall |
|---|---|---:|---|---|---|---:|
| codex · `gpt-5.6-luna` | `the-claim` | 3 | DNF (transport; no terminal tape) | — | not submitted | 31s |
| codex · `gpt-5.6-luna` | `e1-dry-gulch` | 2 | secured w20, 13g | `agent-8d5feff7-7623f50a-da43-4b63-86af-986f0e3722e1` | HTTP 400 `bad_payload`; not queued or verified | 87s |
| codex · `gpt-5.6-luna` | `e1-night-shift` | 3 | DNF (death; best w15) | `agent-32f5d328-d65a868d-80f7-4077-8670-adae0510eb7b` | not submitted | 126s |
| codex · `gpt-5.6-luna` | `e1-twin-banks` | 3 | DNF (death; best w16) | `agent-1bb58ccf-be7126d1-23ad-4c87-ba30-3afd8dac7048` | not submitted | 46s |
| codex · `gpt-5.6-luna` | `e1-baron` | 3 | DNF (death; best w16) | `agent-25e8ed6c-0eadbe06-d3ea-454f-8ab5-4ebe4c09cb3d` | not submitted | 64s |
| codex · `gpt-5.6-luna` | `e2-hill-mine` | 3 | DNF (death; best w3) | `agent-e30d3ee8-c25adef6-abf9-41e5-95fc-fab792e1b77b` | not submitted | 11s |
| Hermes · `openai-codex/gpt-5.6-sol` | `the-claim` | 3 | DNF (two transport aborts; death w4) | `agent-ea8f520e-7852ce09-4ba6-4787-b941-175d47471039` | not submitted | 10.249s |
| Hermes · `openai-codex/gpt-5.6-sol` | `e1-night-shift` | 3 | DNF (death; best w8) | `agent-382f20ab-c0ec1292-6fcb-4aa1-976a-315299425fc6` | not submitted | 72.220s |
| Hermes · `openai-codex/gpt-5.6-sol` | `e2-hill-mine` | 3 | DNF (death; best w2) | `agent-4f5abe94-11a5f01f-ee19-4861-8700-0960ee5b5e27` | not submitted | 12.336s |
| OpenClaw · `openai/gpt-5.5` | `the-claim` | 3 | DNF (one transport abort; death w3) | `agent-9e35591f-f9eaa1e2-d0da-49de-80da-1e73890f2c29` | not submitted | 26.9s |
| OpenClaw · `openai/gpt-5.5` | `e1-night-shift` | 3 | DNF (death; best w6) | `agent-2a40df1e-b9d6b4eb-f57d-49c2-b290-0db64089e329` | not submitted | 33.9s |
| OpenClaw · `openai/gpt-5.5` | `e2-hill-mine` | 3 | DNF (death; best w2) | `agent-3f941cda-b55cfdab-24f0-4f1f-b426-e73e2056f880` | not submitted | 11.0s |

Thirty-five launches produced 29 terminal tapes, one locally secured outcome, zero accepted submissions, and zero verified standings. No unsecured tape was posted. The only secured tape was submitted once, received the exact retained response `{"ok":false,"error":"bad_payload","message":"Standing not accepted."}`, and that contract lane stopped as the honesty guard requires.

## Stack and cost

| arm | actual stack | harness wall | reported tokens / cost |
|---|---|---:|---|
| codex-luna | `gpt-5.6-luna` · `codex-cli 0.149.1` · `rider-auto.mjs@sha256:322100450a74` | 17m12s | 8,008,752 input (7,795,200 cached), 45,646 output, 26,930 reasoning output; subscription cost not exposed |
| Hermes | `openai-codex/gpt-5.6-sol` · Hermes Agent v0.20.0 · `rider_driver.py` | 16m11s | 203,315 input, 21,596 output, 3,532,800 cache-read, 8,402 reasoning; 3,757,711 total, 54 calls, $0 included |
| OpenClaw | `openai/gpt-5.5` · OpenClaw 2026.7.1-2 · Codex-backed local agent · rider driver `sha256:cf2b4846f391ef762cf4135f7bccb3f7148d535ffa5dda30ada3d731a1cf9d26` | 19m01.728s | final call exposed 1,936 input, 305 output, 145,792 cache-read (148,033 total); aggregate session tokens/cost not exposed |

OpenClaw did not use the anticipated Anthropic quota: its own run metadata reports provider `openai`, model `gpt-5.5`. The heat records the actual decider rather than the task's stale expectation.

## Door and harness findings

1. **A secured public-door tape can be structurally unpostable.** Luna explicitly banked at the wave-20 boundary, so `gr-sim` wrote `durationTicks: 18001` plus `SECURE_CHOICE` at tick `18000`. `validateTape` caps duration at `18000`, and production returned only generic `bad_payload`. The tape was not edited. This needs a recorder or validator boundary repair before the row can ever verify.
2. **The turn terminator is operationally ambiguous.** `public/skill.md` says one JSON array followed by a newline, while the charter/L3 pattern says an empty line ends a turn. Direct PTY attempts in all three arms stalled or ended before a tape; autonomous adapters survived. OpenClaw's two-newline adapter also recorded stale/defaulted upgrade behavior. The public example and parser contract should state one framing rule.
3. **Hill Mine's published coal is not actionable from the public grammar as riders read it.** Luna found `stablePrefix.map.coalSeams`, then `HARVEST` on those published IDs was refused; the public manual never names a coal-specific order. Across all three riders Hill Mine ended at waves 1–3, sometimes holding 70–100g without establishing pressure.
4. **Harness provenance and setup overhead are first-class results.** Hermes loaded 3.76M tokens to produce seven terminal tapes. OpenClaw required a supported Node (24/26; Node 23 was refused), loaded its unrelated global workspace prompt/skills, and used OpenAI GPT-5.5 rather than the expected Anthropic route. Both still completed the short program without operator-written orders.

## Evidence map

- `codex-luna/rider-result.json`, `events.jsonl`, `rider-auto.mjs`, and per-attempt tapes/logs contain the Luna arm; `e1-dry-gulch-submission.json`, `e1-dry-gulch-post-response.json`, and `e1-dry-gulch-slip.json` contain the stopped submission lane.
- `hermes/rider-result.json`, `usage.json`, `rider_driver.py`, and per-attempt tapes/logs contain the Hermes arm.
- `openclaw/rider-result.json`, `result.json`, `rider-driver.mjs`, and `tapes/` + `logs/` contain the OpenClaw arm. `result.json` is authoritative for the actual provider/model metadata that the guest's own prose said was unavailable.

No submission or slip exists for a DNF because manufacturing one would violate the secured-only rule.
