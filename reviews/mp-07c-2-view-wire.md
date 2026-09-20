# Review — mp-07c-2: the view wire + the thin seat

**Slice/branch/tip:** mp-07c-2 (`tasks/lane-mp07c2-view-wire.md`) · `lane/b` · tip `8e71c74ec` · merged `85807714a8a6` (attended merge + gate; leaf flipped by s1552; this review completes the drain's paperwork).

**Verdict: MERGED — gate green on the merged tree.**

**What it does:** The agent gets eyes in the browser's world. The relay routes an ADDRESSED `view` message to a seat (never broadcast, rate- and size-bounded); the roster[0] browser assembles the agent rider's view (`buildView(game)` per ToolSurface's existing pattern) at wave boundaries and escalations; and in mixed rooms the seat becomes THIN — no second sim, no hashes — consuming views to stdout and emitting stdin order arrays as `agent_orders` acts, the exact NDJSON door contract preserved so every existing adapter works in mixed rooms unchanged. Headless-only rooms keep the full deterministic seat. The run's independent review caught four real issues (host eviction on held seats, rider perspective, oversized-order false acceptance, per-frame view construction) — all fixed pre-handoff.

**The finish line, achieved in the gate (the outside review's own proposed proof):** the room harness's terminal arm carried a human-shaped browser host + thin seat to a FINISHED CLAIM — browser secured at wave 10, the seat observed `secured` — one human+agent claim to a terminal outcome.

**Evidence:**
| Gate (merged tree, attended) | Result |
|---|---|
| tsc / build | rc=0 / rc=0 |
| agent-seat-room harness | **98/98** incl. five views served, a stdin build landed, zero desyncs, terminal outcome observed |
| agent-seat unit | rc=0 |
| boot probe e2e (thin-seat truth) | rc=0 |
| adjacent (task-025+m1-01+m2-01, both projects) | rc=0 |
| guards | node-guards on v26.4.0: 383 tests / 381 pass / 2 fail — the day's documented live-worktree collection class (lane-d rebuilding f-door-5); non-blocking |
| Transcript | `artifacts/mp-07c-2-gate.txt` |

**Merge classification:** one real conflict — `e2e/agent-seat.spec.ts`, both sides rewriting the boot probe for successive same-day truths (attended scout-era rewrite vs the lane's thin-seat era). Resolved LANE-SIDE (the newer truth, written against the runtime in this merge); the zero-desync assertion and scout roster suffix survive in the lane's version. All other files LANE-TOUCHED, clean.

**Findings:** none blocking. The run's two flagged reds (wrangler unconfigured probe drift; `?raw` collection class) are both pre-existing documented classes.
