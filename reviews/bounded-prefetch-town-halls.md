# Review: bounded-prefetch-town-halls — the halls are the town, and the stream names its terminal state (lane-b, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `bounded-prefetch-town-halls` · `lane/b` · commit `44efbf3d6` over base `c3884d89d` · merge `22bb1b29c` (no-ff; BACKLOG union).
**Verdict:** MERGED. F-PBW-2 cured, and a real ordering bug in the bounded stream (F-BPTH-1) with it.

## What it does
- **Ruling, measured:** the town's priority-1 set already includes both bulk halls on normal connections (`townPrefetchUrls()` emits them; only Save Data trims them), so `TownTavernPilot.ts` was left alone. On the BUILT tree (asset-diet `1408f6b4`) the town costs 2.61–3.76 MB per epoch WITH the halls (halls 0.31–0.49 MB, ≤ 4.1% of the 12 MB mobile allowance); the worst plan, `town` scene likely+successor, is 8.86 MB (73.8%). Allowance not raised, none proposed. End-to-end on `vite preview`: both projects reach `ready`, 19/19 URLs, 5.12 MB used (42.7%), both halls fetched, zero errors.
- **State machine** documented at the top of `AdvanceStream.ts` and typed (`AdvanceStreamState`, `ADVANCE_STREAM_TERMINAL_STATES`): `settling → resolving → fetching`, `paused` (non-terminal), terminal `ready` / `partial` / `allowance`. The previous slice had shipped the stop state as `budget-exhausted`; renamed to `allowance` (two files, no player-facing string) so it no longer collides with the deploy's 25 MB budget verdict.
- **F-BPTH-1 (bug, fixed):** `run()` checked the allowance ABOVE the drained-plan check, so a plan that fetched every URL and landed at or over the allowance published the early stop and never `ready` (control on the old ordering: `ready=19 total=19` with `state="allowance"`, both projects). Guarded by the new `advance-stream-bounded.spec.ts:84` case.
- **Assertions changed:** `town-stamp-mill-blender.spec.ts` test renamed to "…both bulk town halls inside the town priority-1 set" (`:163`): polls the terminal set then asserts `ready`, stubs GLB bodies (the house pattern), asserts town-state ready, both halls in `townPrefetchUrls()`, every town URL fetched, the last town request before the first non-town one, no errors. `advance-stream-bounded.spec.ts`: `budget-exhausted → allowance` at `:41/:57/:61`; new test at `:84`.

## Evidence
| Gate | Result |
|---|---|
| Runner: town-stamp-mill-blender 12 · advance-stream 12 · advance-stream-bounded 6 · walkthrough 2 · cache-reuse 4 (own port 5302, both projects) | 36/36 (2.5 min), zero console/page errors; tsc 0; build 0 |
| Attended on the merged tree | see the drain commit message (the five suites on the drain port, era pin, battery) |
| Era pin on the merged tree | `ea4dcc6e` (5/5) — the lane's own `17943318` was for a tree that never ships |

## Findings
- **F-BPTH-2 (fire-authorable, out of this firewall):** `e2e/asset-diet.spec.ts:339` waits 45 s for `data-asset-prefetch-town-state='ready'` under the real DEV byte flow; `?tier=full` cannot beat `matchMedia('(pointer: coarse)')` at `AdvanceStream.ts:251`, so mobile gets the 12 MB allowance while the dev tree's town is 18.0 MB pre-diet (`town-plate.glb` alone 7.9 MB) — that wait can never succeed on a dev server. The deploy probe runs it on the built preview, where it passes.
- **Stale numbers corrected:** `reviews/prefetch-bounded-warming.md`'s town/Claim/Dry Gulch bytes predate the 86% diet; post-diet: 2,614,544 / 2,508,228 / 3,248,396.
