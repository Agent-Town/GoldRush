# MAIN beat citation refresh — s2535 drain

## Slice / branch / tip

`tasks/main-beat-citation-refresh.md`, MAIN-slot runner output. Gated against `dba2fef16` in `/private/tmp/gr-s2535-citation-gate`; merged as `3102584800ca6d2ea8695d3f7c3cdf03602c3d8f`. Source after-blob `95f2d0675aed69f97748c239d64a965cd395d503`.

## Verdict

MERGED. The nine comment-digit replacements preserve all 9,182 TypeScript token kind/text pairs and all 2,280 lines. No runtime behavior or player-visible story text changes. Era 5 appends pin 81, `1a825ba08e31f838e52b489f78cd06e6c7a4dd323281bb5d73bcb9084fbf8331`, preserving the prior 80 pins without an era bump.

## Evidence

| Gate | Result |
| --- | --- |
| Citation derivation; tokens and lines | Nine exact ranges, zero stale; tokens and line count identical |
| Typecheck, build, engine registry | rc 0 each; engine guard 5/5 |
| Full native Node battery | Node 26.4.0 parent, 741 tests: 736 pass, five declared skips, zero failures/cancellations; all chained legs exit 0; 2074.1 s |
| Power, task guards, gate callers | PASS; power p95 0.359 ms against 0.500 ms |
| Citation guard | Initial pre-existing A8 BACKLOG helper citation failed; naming the actual helper and test repaired it, then PASS |
| Plain boot | Desktop and 390px, 2/2, zero console/page errors during the probes |
| Minimum adjacent suites | 30/32; exactly two F-2533-1 failures, both projects, `enemiesAlive > 0` at M1 spec line 36 |
| Fresh unchanged-base control | All `src/` and `assets/` restored to `dba2fef16`; M1 6/8, the same two test/assertion/project failures; candidate restored byte-for-byte afterward |

Transcripts: `artifacts/s2535-fire/citation-gates.txt`, `artifacts/s2535-fire/node-guards.txt`, `artifacts/s2535-fire/remaining-guards.txt`, `artifacts/s2535-fire/browser-gates.txt`, `artifacts/s2535-fire/base-controls.txt`. Fingerprint proof: `artifacts/s2535-fire/failure-fingerprint.txt` and `artifacts/s2535-fire/base-control-state.txt`.

The known-red inventory is a stale 2026-08-11 snapshot, so its historical CLEAN entry was not used as exoneration. The fresh control above proves the accepted exception. Runtime debug gating stays intact; its completed corrective remains the separate `lane-a-m1-debug-spawn-contract` drain.

Plain-boot shots in `artifacts/s2535-fire/boot/` were visually inspected. They show the initial contract card; the mobile capture still shows progressive loading, so these are boot checks, not settled visual approval. Failure screenshots, contexts and complete trace/network/stack records are in `artifacts/s2535-fire/browser-evidence/`. `artifacts/s2535-fire/trace-retention.json` identifies the four original raw trace archives retained on disk and the response/frame payloads omitted from the offsite record copies.

## Merge classification

- `src/story/beats.ts`: matched MAIN runner output, nine comment-number substitutions only, no conflict.
- `assets/engine-era.json`: drain-owned same-era identity bookkeeping; the attended A8 speaker change is preserved.
- `tasks/BACKLOG.md`: separate bookkeeping repair for the A8 helper citation, followed by this SHIPPED row. No test or assertion changed.

Factory log churn, the existing Moth Season evidence rewrite and all attended worktrees remain outside the merge. The gate itself also exposed the known Moth Season evidence writer; the completed lane-c opt-in corrective remains next.

## Earlier gate rounds and operational lesson

The s2533/s2534 HOLD results remain preserved in `artifacts/s2533-fire/` and `artifacts/s2534-fire/`, with their full account in this review's git history. Their candidate was correct but their full native gate was incomplete: the first hit an extra 900-second wrapper; the second used Node 23.11.1. No source was merged in either round.

This fire used the pinned Node 26.4.0 and the existing append-only driver with unchanged tests and budgets. The full fixture guard passed after 1050.4 seconds over 126 owners, explaining why the old wrapper could not finish this tree. Its synchronous body continued beyond the declared 300-second default; no claim is made that this default caps such a body. This single drain exceeded the approximate fire window while its healthy gate completed; no additional drain was started.

The previous gate tree could not be reused: the attended A8 merge changed speakers, portraits, the halo guard and the engine registry. The fresh gate preserves that work and derives its pin from that actual tree. Closing desk/ledger receipts are in `artifacts/s2535-fire/`.
