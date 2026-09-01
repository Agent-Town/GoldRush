# probe-rows-unranked — the county's own smoke tests stop outranking riders

- **Slice:** `probe-rows-unranked` (lane-c, master `tasks/probe-rows-unranked.md`)
- **Branch:** `lane/c` · **tip** `5384117f4` (`runner(lane-c): probe-rows-unranked.md`)
- **Base:** `8c105470411dfcf99cefb6cccb611b40362b2853` (s2440 handoff) — 6 commits behind main at gate time, ~13 min stale
- **Drained by:** s2441 fire · **gate worktree:** `gate-s2441` (detached, §3.0b custody)

## Verdict

**PASS — merged.** Four LANE-TOUCHED files apply clean, one BOTH-MOVED file (`tasks/BACKLOG.md`) auto-merged by `ort` and was verified BY CONTENT, not by the absence of a conflict marker. The production surface is three added lines in one worker file, all read-side and non-destructive.

## What it does

Rows that self-declare `stack.harness === 'operator-probe'` — the mandatory per-heat skew probes the county submits to prove production/assayer parity before riders ride — are no longer ranked. `isRankedRow` gains one clause excluding them (alongside the existing lineage-retirement and `rejected`/`unassayable` clauses), so probes leave the ranked board and mint no rank, exactly as retired rows already do. They are **not** deleted, hidden, or altered: they stay in storage, keep their assay verdicts, keep serving their reel by id through the WATCH projection, and keep answering the verdict endpoint — the probe's value is its verdict, not its rank (Retention Law). The board response gains `probeCount` beside the existing `retiredCount`/`rejectedCount`, so the omission is declared rather than silent. `public/skill.md` states the law in one sentence for riders, and `scripts/skillmd-guard.test.mjs` pins that sentence so it cannot silently decay.

The live defect this cures: the era-5 Claim board carried `#3 Heat 8 Era Probe` and `#4 Heat 9 R2 Era Probe` above OMP, PI, OpenClaw and Prime — four real riders pushed down the public board by the county's own pipeline checks.

## Evidence

All arms run on the **merged tree** in the detached `gate-s2441` worktree, fire shell, node v26.4.0.

| Arm | Result | Time | Counts |
|---|---|---|---|
| `npx tsc --noEmit` | **PASS** | 5.8 s | clean, 0 B output |
| `npm run build` | **PASS** | 25.0 s | vite build green (pre-existing >900 kB chunk advisory only) |
| `npm run test:stats` | **PASS** | 12.5 s | stats worker 87 · standings assay **KV 193** · standings assay **SQLite 193** · ledger HTTP contract 19 |
| `npm run test:accounts` | **PASS** | 4.3 s | accounts KV 43 · accounts SQLite 43 |
| `npm run test:mp` | **PASS** | 9.5 s | multiplayer relay 466 |
| `node --test scripts/skillmd-guard.test.mjs` | **PASS** | 4.7 s | incl. the new `skill.md pins the operator-probe ranking law` |
| `npm run test:power-budget` | **PASS** | 0.2 s | p95 = 0.378 ms vs cap 0.500 ms, 160 samples |
| `npm run test:citations` | **PASS** | 1.4 s | — |
| `npm run test:gate-callers` | **PASS** | 0.3 s | every gate-shaped subject reached or grandfathered |
| `npm run test:node-guards` | see F-2441-2 | — | — |
| `npm run test:task-guards` | **NOT EVIDENCE — vacuous** | 0.1 s | see F-2441-1 |

**The worker battery was mandatory, not optional:** the diff touches `functions/api/standings.ts`, and `tsconfig.json`'s `include` is `["src","e2e","playwright.config.ts"]`, so `tsc` never reads `functions/**` and `vite build` never bundles Pages Functions (F-1229-1). `run-guards.mjs --changed-since <base>` independently selected the same set — it reported `19 file(s) changed`, base gate + `test:stats, test:accounts, test:mp <- 1 file(s) in functions/**`.

**The drain's own re-run is a free control on the runner's headline, and it corroborates:** the runner reported `test:stats` green at "KV/SQLite 193 each"; re-run here on the merged tree, both arms read **193** exactly.

**No boot probe / playwright arm was run, and it is not owed:** the diff touches zero files under `src/` or `e2e/`, so the client bundle's behaviour is byte-identical to main and a boot probe could not differ from it. Stated rather than skipped silently.

## Merge classification

Base `8c105470411dfcf99cefb6cccb611b40362b2853`; `git diff --name-status <base> main` over the five paths shows main moved on exactly one.

| File | Class | Resolution |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED only | clean apply (+4) |
| `public/skill.md` | LANE-TOUCHED only | clean apply (+2) |
| `scripts/skillmd-guard.test.mjs` | LANE-TOUCHED only | clean apply (+5) |
| `scripts/test-standings.mjs` | LANE-TOUCHED only | clean apply (+71) |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | auto-merged by `ort`; **verified by content** — the lane's `PROBE ROWS UNRANKED` row and main's `F-2408-1 CONFIRMED BY EXECUTION s2409` row are both present. Line arithmetic corroborates: main 5055 + the lane's 2 added lines = merged **5057**. |

`lane-usable.mjs lane-c` read **HOLDS** before the merge and named all five paths with their absent-from-main line counts (3 of 4 · 1 of 1 · 3 of 4 · 62 of 67 · 1 of 1) — i.e. this was genuinely unabsorbed content, not a false-ahead.

## Findings

### F-2441-1 — NON-BLOCKING, method: `test:task-guards` PASSES VACUOUSLY FROM A GATE WORKTREE, AND A PASS IS THE SHAPE ITS DECLINE TAKES

Run from `gate-s2441`, `npm run test:task-guards` exits **0** while printing, in its own words, that *"the invisible set cannot be computed here. Reporting a number from this cwd would be a false red (F-1151-1). Run this guard from the main checkout to get a real number."*

The guard is **behaving correctly** — F-1151-1 deliberately made it decline rather than emit a false red, and declining is the conservative direction. What earns a finding is that **the decline and a real pass are indistinguishable on the exit code**, and §3.0b *mandates* gating undecided content in exactly the cwd where it declines. So the law sends every drain to the one place this leg cannot answer, and a drainer reading rc=0 banks a measurement that was never taken.

This is the streak's own empty-corpus class arriving through a **cwd** (F-2220-1's axis), with one difference worth noting: it is not silent — the guard says so in plain words on stdout. The failure is entirely in the READER, which is why this is a reading habit and not a code cure.

**Discharged, not merely filed:** the leg was re-run from the main checkout after the merge; the result is recorded in the drain commit's evidence line.

**No guard proposed, and the restraint is measured:** a red on "this leg declined" would fire on every lawful §3.0b gate — i.e. during ordinary correct operation — and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate).

### F-2441-2 — NON-BLOCKING, method: `rc=null` AT EXACTLY THE BOUND IS A TIMEOUT, NOT A GREEN, AND ITS STDOUT LOOKS LIKE A SUCCESSFUL START

The first attempt at `run-guards.mjs --changed-since <base>` was wrapped at `timeout: 900000` and returned **`rc=null` at 900.0 s** — `ETIMEDOUT`, the wrapper's own SIGTERM, with `[exited with code 0]` reported by the shell wrapper around it. Its captured stdout is the battery's **plan** (`19 file(s) changed`, the selected leg list) and contains not one result line.

A drainer skimming that output sees a correctly-selected battery and a zero exit code from the outer shell. **It measured nothing.** Reported here rather than quietly re-run, because "the battery printed its plan" is exactly what a green start looks like, and the tell is the *arithmetic* — 900.0 s is the bound to the tenth of a second, which no real battery lands on.

Cause is contention, not a defect: `test:node-guards` is **529.8 s alone** (F-2166-2) and lane-d was concurrently running `scripts/assay-replay.test.mjs` in its own worktree throughout — the "run it ALONE" hazard F-1537-1 names, which a drain cannot arrange while the runner owns two lanes. The legs were therefore run individually, and `test:node-guards` re-launched under a 2400 s bound with `killSignal: 'SIGKILL'` (F-2430-1's shape).

**Nothing was gated on the timed-out run.**

## Scope / firewall

Master's TOUCH-ONLY: `functions/api/standings.ts` + its suites, `public/skill.md` + guards, the BACKLOG row. **Exactly those five files moved, nothing else.** The NO list — no write-path changes, no UI, no worker — holds by reading: the change is confined to `isRankedRow` (read-side) and `getBoard`'s response shape; `scripts/assay-worker.mjs` is untouched, and no submission/storage path moved. The master's own honesty guard ("never delete or rewrite a stored probe row") is satisfied by construction, and the runner's `checkOperatorProbes` test asserts the re-rank is **read-only** by comparing the KV bytes before and after.
