# f1550-1 — the suite collects again: `takeBuildRejectionDetail` moves to a zero-import leaf

Slice: `tasks/lane-f1550-1-suite-collection-reland.md` (FIRE-AUTHORED s1550)
Branch: `lane/c` · tip `279b01c03` · base (merge-base) `b6c10a1115`
Drained by: **s1551** · merged to main at **`c6b09a17871b5fbd440fff40e5a844eb86317afb`**
Gate worktree: `gate-s1551` (detached at `279b01c03`, §3.0b custody — no undecided content ever entered main's working tree)
Transcript: `artifacts/f1550-1-gate.txt`

## VERDICT: MERGED — all gates green, and the decisive number moved from 0 to 2740.

## What it does

`npm test` — `package.json:11`'s `"test": "playwright test"` — had been collecting **zero tests** since 08:41 this morning. F-1550-1 (s1550) bisected it to a single spec and a single import edge: `e2e/task-026-prospector-collects-xp.spec.ts` reaches `src/agent/ToolSurface.ts:17`, which value-imported `takeBuildRejectionDetail` from `src/systems/BuildSystem.ts`, which does `import * as Terrain` from `src/world/Terrain.ts:2`, whose `?raw` JSON import Node cannot parse during Playwright's Node-side collection. One edge, three hops, whole suite dark.

This slice cuts the edge the only way it can be cut. Because the symbol is used as a **runtime value** (`ToolSurface.ts:248`/`:250`), `import type` was unavailable — the symbol had to **move**. It now lives in a new zero-import leaf module, `src/systems/buildRejectionDetail.ts`, holding the `BuildRejectionDetail` type, the module-level `pendingBuildRejectionDetail` slot, the `takeBuildRejectionDetail()` taker and a `setBuildRejectionDetail()` setter. `BuildSystem` imports the setter back and re-points its single write site; `ToolSurface` imports the taker from the leaf. `rejectionDetail()` correctly **stayed** in BuildSystem, since it maps a `ConfirmBuildDiagnostics['reason']` whose type lives there. No re-export was added — s1550 measured ToolSurface as the sole external consumer and the runner confirmed it.

**The second trap was the load-bearing one, and it was honoured.** This is a module-level **mutable handoff**, not a pure function: had only the taker moved, writer and reader would have split across two module instances and the rejection detail would have become silently always-`undefined` — a green `tsc`, a green build, and a quietly dead feature. The slot moved **with** the taker, which is what makes the writer/reader pair stay on one instance.

## Evidence

| Gate | Result |
|---|---|
| **`npx playwright test --list` (merged tree)** | **exit 0 — `Total: 2740 tests in 389 files`** |
| **`npx playwright test --list` (CONTROL, main at `0ac57f63b`)** | **`Total: 0 tests in 0 files`** + `TypeError: Module ".../m1-core.layer-contract.v1.json?raw" needs an import attribute of "type: json"` |
| `npx playwright test --list` (main AFTER merge) | exit 0 — `Total: 2740 tests in 389 files` |
| `npx tsc --noEmit` | **0** |
| `npm run build` | green (vite 1.04 s; asset-diet ran, 84% terrain cut, herald 1,158,214 / 1,500,000 ceiling) |
| `node scripts/whole-suite-collection.test.mjs` | green — **fail 0** (1.68 s) |
| `npm run test:node-guards` | **383 tests / 380 pass / 0 fail / 3 skipped** (261 s, fire-shell concurrency 1) |
| `e2e/task-026-prospector-collects-xp.spec.ts` + `m2-01-build-menu` + `agent-seat`, **desktop-chrome** | green, `--workers=1` |
| same three, **mobile-chrome** | green — 8 passed / 1 skipped (58.5 s), `--workers=1` |
| `node scripts/agent-seat.test.mjs` | **5 / 5** |
| Boot probe `_s106-prospector-boot-probe` both projects | **2 / 2**, zero console / page errors, plain boot (no `?debug`) |

**The three F-1550-1 failures are GONE.** s1550 measured the pre-cure tree at 383 tests / **377 pass / 3 fail**; this tree is 380 pass / **0 fail**, and `whole suite collects without loading Vite-only modules` — the root failure both others cascaded from — now passes. The delta is exactly the three, with nothing else moved.

`test:node-guards` was run because the diff touches `src/systems/` (F-1460-1), and run **alone** (F-1537-1). The two `cross-engine` skips are the documented fire-shell non-coverage (F-1408-2), not reds.

## Mutation control (the master required it; a passing guard never executes its violation path)

Performed by the runner and recorded in its report: re-pointing `ToolSurface` at `BuildSystem` reproduced **`Total: 0 tests in 0 files`** plus the same JSON import-attribute `TypeError`; the restore was verified **byte-identical** at blob `9abaa3bd8d38b444451ee3f82b5fa35e629a0cef`. The drain independently re-derived the two headline numbers (`2740 / 389` and the 383-test guard line) rather than inheriting them, and both agreed.

## Merge classification

**Pure LANE-TOUCHED across all three files, ZERO MAIN-MOVED.** `git diff <merge-base b6c10a1115> main` over `src/agent/ToolSurface.ts`, `src/systems/BuildSystem.ts`, `src/systems/buildRejectionDetail.ts` is **empty** — main never moved any of them while the lane worked. Clean `ort` merge, no graft, no conflict resolution. Firewall held exactly: three files, +22 / −18, and `src/world/Terrain.ts` untouched (the `?raw` import is a Vite contract and a separate design question, correctly left alone). None of the forbidden greens were taken — no `e2e/` edit, no testIgnore entry, no alias re-import.

## Findings

**F-1551-3 (drain-side, non-blocking, INSTRUMENT not slice).** The first battery arm reported rc=1 on both playwright projects, and the red was **mine, not the tree's**: I passed `--env GR_CAPTURE_BASE_URL=http://127.0.0.1:5234` **without** the matching `GR_CAPTURE_EXTERNAL_SERVER=1`, so `playwright.config.ts:68`'s `webServer` booted `npm run dev` on vite's own port while the config waited on 5234 — `Error: Timed out waiting 20000ms from config.webServer`, twice. The two flags in `.claude/skills/drain/SKILL.md:42` are a **pair**: the scratch base URL means *"I am serving this myself"*, and supplying one alone points the suite at a port nothing is listening on. Re-run with the config's own server (ports 5188/5199/5231/5234 all probed FREE first) went green. ⚠️ **Worth recording because the failure text names `config.webServer` and not the port pairing, so it reads like a dev-server fault in the tree** — the F-1270-1 discipline generalises: *a red is not evidence about the slice until the instrument is proved right.* No corrective task owed; this is a call-site discipline, and the skill already documents the pair.

No blocking findings. No corrective task spawned.

## Why this mattered enough to be the board's top priority

Until this landed, `npm test` was dead and **every gate in the repo was blind to whole-suite collection** — the same structural blind spot that let the 2026-07-18 incident (F-1094-1) run nine days unnoticed, because `package.json:11` is the only caller of the unfiltered suite and every gate here runs **named** specs. This regression was caught at ~2 hours old instead. The instrument that catches it, `scripts/whole-suite-collection.test.mjs`, is now green in `test:node-guards` on main.
