# engine-surface-narrowing — drain review (s2443)

**Slice:** `engine-surface-narrowing` · **branch:** `lane/d` · **lane tip:** `d1a07f399` · **base:** `8c1054704` (2026-09-02T05:43:17+07:00, ~2 h stale)
**Merge:** `dbb42b97d5e44d0366280184ae195fe6f088a438` (gated commit fast-forwarded onto main — the tree that was measured is the tree that landed)

## Verdict

**MERGED.** Own guards 15/15 green on the merged tree. Two battery reds were investigated and **neither is this slice's**: `test:node-guards` was `rc=signal:SIGTERM` (killed by timeout, every test in its tail a ✔), and `test:power-budget` is **already red on unmerged main, and worse there** — measured, not argued.

## What it does

Engine identity stops hashing the whole repo and hashes only what a replay actually reads: the assay replay agent, `src`, and the replay-read contract/crafting/layer/map-rebuild data. `package.json`, the lockfile, `tsconfig.json` and `vite.config.ts` leave the corpus — so a fire's guard-hygiene edit to a tooling file no longer rotates the engine hash and no longer costs the registry a pin. Compatibility is kept by **dual basis**: every old-basis pin carries its new-basis alias, and show/worker/standings membership accepts either. The runner proved the narrowing behaviour-neutral by mutating all four dropped files and getting the identical 9,001-tick replay result `fnv1a32:cc026656`.

## Evidence (measured this fire, on the merged tree in a detached worktree — §3.0b)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 1.80 s |
| `engine-era-guard.test.mjs` + `assay-worker.test.mjs` | **15 pass / 0 fail / 0 cancelled**, 6.82 s |
| `run-guards --changed-since 8c1054704` | 6/8 — see the two reds below |
| `git diff --check` | clean |
| Registry after resolution | head `eaadcc383d`, **5 pins**, all four old-basis pins carry 1 alias, lineage append-only |

### The two reds, and why neither blocks

- **`test:power-budget` — PRE-EXISTING ON MAIN, and the slice measures BETTER.** Control run alone on unmerged main: `p95=3.252 ms cap=0.500 ms`. Merged tree in the battery: `p95=2.663 ms`. Both fail the 0.500 ms cap; main is the worse of the two. This slice touches no `src/systems/PowerGraph.ts`. A 5–6× overshoot against a 0.5 ms cap on a machine that had just run a 16-minute battery is a **load ceiling, not a line** — gated here on the **differential**, which is favourable.
- **`test:node-guards` — NOT A FAILING ASSERTION.** `rc=signal:SIGTERM`: the harness killed it on time, and every test visible in its tail is a ✔. F-2166-2 prices this battery at **529.8 s and growing** (284 → 363 → 424 → 472 → 503 tests), so a SIGTERM under concurrent load is the arrangement, not the slice. **Stated honestly per F-2428-1: the aggregate did not complete, and I am not reporting a green I did not get.** The two guards this slice actually modifies were therefore run directly and are 15/15.

## Merge classification (base `8c1054704`; main moved 23 files since)

| File | Class | Resolution |
|---|---|---|
| `scripts/assay-replay-agent.mjs`, `scripts/assay-worker.mjs`, `scripts/assay-worker.test.mjs`, `scripts/engine-era-guard.test.mjs`, `src/game/Game.ts` | LANE-ONLY | clean apply |
| `src/replay/EngineEraLineage.mjs`, `.d.mts` | NEW | free |
| `functions/api/standings.ts`, `scripts/test-standings.mjs`, `scripts/fire.md` | BOTH-MOVED | auto-merged, no conflict |
| `assets/engine-era.json` | **BOTH-MOVED — CONFLICT** | resolved by field, below |
| `tasks/BACKLOG.md` | **BOTH-MOVED — CONFLICT** | union of both heads, 4 main rows + 1 lane row, nothing retired |

### The registry conflict, resolved by field (nothing synthesised)

Both sides edited the same `d47f32f6…` pin. **Main** wrote a richer `cause` naming the three rotating commits by F-ID (`8dbb5122a` F-2424-1, `b116a45be` F-2433-1, `3d9484a61` F-2435-1) and already anticipating this narrowing; **the lane** added the `aliases` array that keeps old-basis reels verifiable under the new basis. Each field was taken **verbatim from the side that owns it** — the lane wins on its feature intent (the alias is the whole compatibility mechanism), main wins on provenance. The head `engineHash` goes to the lane's narrowed `eaadcc383d…`, and the lane's new pin is appended. `assay-worker`/`engine-era` guards then assert exactly this shape and pass, including *"a new-basis alias keeps its old-basis pin in the current era"* and *"removing an earlier pin reds"*.

`scripts/fire.md` gains exactly one line — §2H, the heat-arena law (`npm ci`, never `npm install`; prove the arena clean before minting an engine probe). Verified as the *only* delta the merge introduces to that surface.

## Findings

- **F-2443-1 (non-blocking, ALREADY OPEN as a class): `test:power-budget` is red on main at 3.252 ms against a 0.500 ms cap.** Not caused by any slice drained here. It is a load-sensitive microbenchmark whose cap does not survive a busy machine, so it reds during ordinary correct operation — the F-1460-1 shape, where a guard gets excused into uselessness. **Recorded, not cured, and deliberately NOT re-capped: raising a cap until it goes green is F-1410-2.** The honest options are an owner call between (a) making the measurement load-robust (best-of-N, or a warm quiet-machine precondition) and (b) accepting it as advisory. Filed for triage, not carried to the desk as a new owner word.
- **F-2443-2 (non-blocking, method note): `deploy-mirror-allowlist` is a FALSE DONE, not a drain.** Its done-move (`20260902-065905`) exists with no lane commit anywhere: the run STOPPED at its mandatory lane-safety pre-flight because `lane/d` held this very slice undrained (62,215 tokens, zero files touched, zero work lost). **That is the Mistake #2 firewall working exactly as designed**, and `dry-board-probe` correctly counts it as a real drain because it cannot see why. It is unblocked by this merge and owed a re-queue.
