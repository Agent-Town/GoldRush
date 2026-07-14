# stream-showcase-queue — nothing ships unseen (lane-d #2; commit prefix "feat:")
ROLE: pipeline tooling. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-14 — owner: a live-only trigger loses completions ("what happened would have not been part of that stream?!"). Design ruling in docs/marketing/STREAMING.md §THE SHOWCASE QUEUE — build it.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: STREAMING.md §THE SHOWCASE QUEUE (the four rules — the spec) · scripts/stream-director.mjs (the consumer to extend: --showcase becomes queue-driven; --check gains queue depth) · scripts/stream-dashboard.html (gains the pipeline strip: built → awaiting gates → merged → shown) · the gazette-append pattern (the same drain-time moment writes the queue entry).

## SCOPE:
1. `assets/stream/showcase-queue.json` (append-only entries + shown flags; schema documented; merge-conflict-friendly: one line per entry).
2. `scripts/stream-showcase-append.mjs <slice> <hash> <spec>`: the drain-time appender (fires/attended call it beside the gazette write; idempotent per hash).
3. Director consumes: when live, pop oldest unshown → FACTORY scene → headed spec replay → mark shown (atomic write). --check prints queue depth + oldest age.
4. Stream dashboard: the pipeline strip (counts per stage incl. "awaiting gates" from undrained-lane detection — read lane aheadness the dashboard-gen way; honest, no shame framing).
5. node tests: queue append/consume idempotency, downtime accumulation → orderly catch-up, no double-show.

## Firewall: the queue file + two scripts + director extension + dashboard strip + tests + artifacts/. NO OBS config, NO sync/player/curator changes, NO src/.

## Self-check: node tests green · a simulated downtime catch-up trace in the report · tsc/build untouched-green.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the queue schema + catch-up trace.
