# Review — mp-07a: the invited scout

**Slice/branch/tip:** mp-07a (`tasks/lane-mp07a-honest-door.md`) · `lane/b` · tip `47d73d021` · merged `f59b1c1b32eb1555f5eb423b6b45279d89321ac4` · drained attended 2026-08-08. Owner ruling folded verbatim: "I would like the player to be able to invite his agent or multiple agents if they want."

**Verdict: MERGED — gate green; two pre-existing reds documented with proof.**

**What it does:** Join payloads declare `client: 'browser' | 'headless'` (old clients default browser). A seat that finds browser riders AUTO-ENTERS scout mode: no hash exchange, "(scout)" roster suffix, `advisory: true` envelopes, builds still landing as wire acts; late browser arrivals flip a riding seat to scout mid-ride. Multiple scouts legal (partySize 2-4). `--strict` refuses with the foreshadowing sentence naming MP-07c. skill.md tells the door truth. **The 1AM owner-reported desync-at-tick-30 surface is CURED: a mixed room never shows "The wire crossed" again.**

**Evidence:**
| Gate | Result |
|---|---|
| tsc / build | rc=0 / rc=0 |
| agent-seat-room harness (merged tree, real playwright browser rider + wrangler relay) | **70/70** — scout auto-entry 120/123 ticks 0 desyncs · two scouts 900 ticks, 2 builds landed, 0 desyncs/console/page errors · strict refusal exact sentence · seat+seat hash-exchanging through tick 2193 |
| agent-seat unit tests | rc=0 (4/4) |
| adjacent e2e (task-025 + m1-01 + m2-01, both projects) | rc=0 |
| guards | node-guards on v26.4.0: 382 / 379 pass / 3 fail = the day's documented collection-class (lane worktree residue) · **test:mp red = PRE-EXISTING**: identical assertion (`test-multiplayer.mjs:51 checkUnconfigured503`, "saddle copy … got undefined") recorded in `artifacts/multiplayer-relay/test-multiplayer.json` generated 2026-08-08T01:08 — before ANY of today's lanes; filed as F-MP503-1, not this slice's |
| Transcript | `artifacts/mp-07a-gate.txt` |

**Merge classification:** base = post-f-door-2 main; six files, all LANE-TOUCHED, clean auto-merge.

**Findings:** F-MP503-1 spawned (below in BACKLOG). Non-blocking here by the 01:08 pre-existence proof.
