# gauntlet-heat4-streaming-field — drain review (fire s2279)

**Slice:** `gauntlet-heat4-streaming-field` · **branch:** `lane/b` · **lane tip:** `32ac30712` · **base:** `dbdd13a41326d11a28d2908566d25bb45a6ff12d` · **merge:** `7ecd2817fbe636b4ab3cba857d17391ee595df40`

## Verdict

**MERGED.** The heat did what a heat is for: it rode the field, put one honest verified row on the live board, diagnosed the near-miss its predecessor left behind, and stopped precisely at the next wall instead of patching around it. Evidence is complete and the firewall held exactly.

## What it does

Four installed harnesses — Prime Agent 0.8.0, OMP 18.0.4, Hermes 0.20.0, OpenClaw 2026.7.1-2 — rode a short program (the-claim, night-shift, hill-mine) against the heat-3c streaming shim, all pinned to the live deploy `22365118a`. **Prime Agent secured `the-claim` at wave 10 and the assayer returned `verified`** (`assayHash: fnv1a32:9b5b0e7d`, matching the tape event-log hash) — a third-party harness standing on the live ledger. OMP and Hermes produced honest gameplay DNFs (deaths, 20-minute walls); elizaOS 1.7.2 DNF'd install/runtime on its one bounded retry, as the master allowed. The operator relayed guest-produced JSON and authored no standing orders.

The heat also discharged its two non-riding duties. It **diagnosed the heat-2 `bad_payload`**: the retained dry-gulch tape carries `inputLog.durationTicks: 18001` with a final accepted `SECURE_CHOICE` at tick `18000`, while `functions/api/standings.ts` permits duration only through `18000` and requires every entry tick `< duration`. The cause is a gr-sim/validator terminal-boundary mismatch — gr-sim can serialize `max(lastTick + 1, elapsed)` as 18001. The heat routed around it honestly rather than falsifying: `build-submission.mjs` now refuses duration above 18000, refuses entries outside `[0, duration)`, and refuses unsecured tapes.

And it named the next wall. Under sustained field load a socket emitted `EPIPE` with no error handler and Node terminated the whole shim; every subsequent rider received `ECONNREFUSED` / `Unable to connect`. **No mid-heat patch or restart was made** — the firewall said findings, not fixes, and the runner obeyed it.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 1.48s |
| `run-guards.mjs --changed-since dbdd13a41` | 572 files changed; base gate = 5 legs (no path rule matched) |
| → `test:power-budget` | **rc=0**, p95 = 0.374 ms |
| → `test:task-guards`, `test:citations`, `test:gate-callers` | **rc=0** |
| → `test:node-guards` | rc=1, 598 s — **exactly one** assertion, attributed below |
| law-pointer-guard, after the cure, on the re-merged tree | **rc=0 — PASS**, 45 pointers (43 checked), 56 instruments resolved |

**The single red was this fire's own bookkeeping, not the slice.** The transcript carries exactly **one** `ERR_ASSERTION` across the whole battery, at `scripts/law-pointer-guard.test.mjs:105`, reporting `NEW POINTER scripts/fire.md -> marketing/outbox/gazette-queue.md:1418`. That coordinate moved because s2279 filed its own GZ-01 item at the top of `gazette-queue.md` earlier in this same fire — the rot the fire.md clause explicitly predicts for any fire that discharges GZ-01. The pointer was verified by eye to land on the `ac51296d` upgrade-clock citation it was written for, re-based, and the baseline re-pinned at `4c2a5cef1` with the **fingerprint unchanged** (`d7293afa016e`) — proof the pointer resolves to identical content and did not relocate to a different line. Re-running the guard on the re-merged tree returns **PASS / rc=0**.

No slice spec exists and none is owed: the slice touches **zero** `src/`, `e2e/`, `scripts/`, `functions/`, `assets/` or `specs/` paths. Boot probes and perf snapshots are not applicable for the same reason — nothing renders that did not render before.

Battery transcript: `artifacts/gauntlet-heat4-20260824/gate-s2279.txt` (391 KB, append-only, gated in detached `gate-s2279/` per §3.0b custody). Heat evidence: `artifacts/gauntlet-heat4-20260824/heat4-note.md` (15-row matrix, per-arm token costs, endpoint drift, crash evidence), `prime/the-claim-submission.json`, `prime/the-claim-slip.json`, `shim-crash.txt`.

## Merge classification

Base `dbdd13a41`. Lane was `ahead=1 behind=23`; one runner commit `32ac30712`.

| path | class | resolution |
|---|---|---|
| `artifacts/gauntlet-heat4-20260824/**` (402 files) | **NEW** | free — no main-side counterpart |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | 3-way, clean. Lane replaced 1 line (its own heat-report row); main independently added 8/-2 at the top (the HEAT-5 AFTERMATH row). Verified disjoint **before** merging: main still carried the lane's `-` line verbatim (`grep -c` = 1). Post-merge the merged tree differs from main by exactly `1 insertion(+), 1 deletion(-)` — main's HEAT-5 row preserved, lane's row landed. |

Zero conflicts. **Firewall held exactly**: the only non-artifact path touched is `tasks/BACKLOG.md`, which the master's TOUCH-ONLY names. Checked explicitly — `git diff --name-only main...lane/b -- tasks/ src/ e2e/ scripts/ functions/ assets/ specs/ public/` returns that one file, so the F-2273-2 foreign-leaf sweep did **not** recur here.

## Findings

**F-2279-1 — OPEN, and it is the heat's real product: the subscription shim dies on an unhandled socket `EPIPE` under sustained streaming load.** After several concurrent riders streamed for many turns, a socket emitted `EPIPE` with no error handler attached and Node terminated the process; OpenClaw then received `ECONNREFUSED` on three attempts and OMP/Hermes/Prime surfaced the same loss. This is a **server availability defect, not a guest DNF** — no rider retry can cure a process that is absent. Exact failure preserved in `artifacts/gauntlet-heat4-20260824/shim-crash.txt`. It cost this heat roughly half its program: OMP hill-mine 2 of 3 attempts, Hermes night-shift 2 of 3 and hill-mine 3 of 3, OpenClaw 8 of 9 — all unridden. **Not fire-authored into a corrective this fire** because the drain budget went to the second live drain; the cure is bounded and well-specified (attach an `error` handler on the response/request sockets in `server/codex-shim/serve.mjs`, and decide whether a dead child should fail one request or the process). Recommended as the next lane-b master.

**F-2279-2 — CLOSED BY A CONCURRENT ATTENDED FIX, recorded because the heat found it independently.** The heat observed that `public/skill.md` still pointed submissions at the retired Pages ledger, and that its own Pages POST created an orphan pending row; it reposted the same secured tape unchanged to `https://agenttown.app` and it verified there. The attended session had diagnosed and fixed the same root cause live at `9ec5c21c7` (skillmd-guard 6/6, deployed `3ccf58e1`) while this heat was still running. **Two independent instruments reaching the same defect is corroboration, not duplication** — and it is why heat-5's four stranded winners were rescuable. s2279 filed the GZ-01 news item for that fix.

**F-2279-3 — NON-BLOCKING, the 18001 boundary, already under cure.** The `bad_payload` diagnosis above is the same terminal-boundary defect that `door-tick-ceiling` (lane-c, dispatched attended 19:57) exists to cure per-contract. The heat's local refusal is the honest short-term route, not the fix; the validator-side cure lands with that slice. Recorded here so the two records point at each other.

**Honesty note, volunteered by the runner and worth preserving:** one operator setup mistake invoked Prime's default OpenRouter model while issuing a shutdown command, costing about **$0.0052**. It made no gameplay decision and is excluded from rider stacks. The heat disclosed it unprompted.
