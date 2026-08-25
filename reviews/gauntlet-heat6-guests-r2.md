# Review — gauntlet-heat6-guests-r2

**Slice:** `gauntlet-heat6-guests-r2` · **Branch:** `lane/b` · **Tip:** `6e3ba9374`
**Base:** `main` @ `cae84d37adb5e1c87489e9a2771cf0a7575f8eb5` · **Drained:** s2309 (fire), 2026-08-25
**Verdict:** **MERGED** — evidence-only (338 artifacts + one BACKLOG row, ZERO `src/`/`e2e/`/`scripts/`/`functions/`). One battery leg red; proven environmental with a **zero differential** (F-2309-1).

## What it does

Re-rides the Heat 6 guest field on the cured-parity premise. Lane-b re-derived live build `61681a77` (`61681a776470d583886fa18161215d85e544f321`), passed a detached production build, and proved a fresh Claim parity probe publicly `verified` **before** riding — the gate that stopped the r1 field at attempt 0. The streaming shim then passed SSE, survived one deliberate mid-stream abort, and stayed alive across the probe plus 46 guest launches without repeating Heat 4's EPIPE death. Under concurrent load it exposed a retryable `HTTP 429: Too many concurrent completions`; serialising OpenClaw removed 429s entirely and exposed rider context/decision latency as the real ceiling instead. **One guest secured: OMP 18.0.4 took The Claim at wave 10 / 11g, stored rank 7, publicly verified.** The other 15 rider/map cells were truthful deaths, wall partials, or exact no-reel DNFs; no guest met the wave-20 Baron. Eliza stable CLI 1.7.2 repeated its bounded 60 s no-output DNF.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check` (pre-merge, and re-asserted on the merged tree) | ✅ CLEAR, `status="queued"`, exact name beat the `gauntlet-heat6-guests[merged]` sibling |
| `npx tsc --noEmit` (merged tree) | **rc=0** |
| `npm run build` (merged tree) | **rc=0** |
| `run-guards --changed-since cae84d37` | **7/8** — 497 files changed; base gate + `test:stats`/`test:accounts`/`test:mp` auto-added (1 file in `functions/**`) |
| ├ `test:node-guards` | PASS rc=0, **706 s** |
| ├ `test:stats` · `test:accounts` · `test:mp` | PASS rc=0 — 19 s · 6 s · 6 s |
| ├ `test:task-guards` · `test:citations` · `test:gate-callers` | PASS rc=0 |
| └ `test:power-budget` | **FAIL rc=1** — `p95=0.504ms cap=0.500ms samples=160` → **F-2309-1, environmental, differential ZERO** |
| Independent secret scan of all 338 new artifacts | CLEAR (no key/token/PEM patterns; `shim-models.json` carries only model ids, the shim key is the literal `local-subscription`) |

**Public proof corroborated against the verdict slips themselves, not the report's table** (the s2299 standard):

- Parity probe — `probe/verdict-slip.json`: `"assay":"verified"`, `"ranked":true`, `"assayHash":"fnv1a32:ade9c894"`, tape `agent-7f16d24a-112e39fe-66c6-4891-8bb5-6f7ec5c494d2`. Matches the note exactly.
- OMP Claim — `omp/the-claim/verdict-slip.json`: `"assay":"verified"`, `"ranked":true`, `"assayHash":"fnv1a32:d0e07bd9"`, tape `agent-94d8e238-9123839c-fcbe-4928-9a50-69679e1e674b`. Matches the note exactly.

Run log: `tasks/runs/20260825-121216-lane-b-gauntlet-heat6-guests-r2.md.log` — ends `READY-FOR-GATES`, 1,261,824 tokens. Its self-reported `verification.txt` (build PASS, asset-diet PASS at 1,158,214 B < 1,500,000 B ceiling, secret scan CLEAR, configs restored byte-for-byte, gauntlet commits local and unpushed) is corroborated by the battery above rather than taken on trust.

## Merge classification

Base `cae84d37adb5e1c87489e9a2771cf0a7575f8eb5`. Merged `--no-ff` in a **detached gate worktree** (`gate-s2309`) per fire.md §3.0b — undecided content never entered main's working tree, and the merge was committed as one act rather than left staged.

| Class | Count | Resolution |
|---|---|---|
| **NEW** (`A`) — all under `artifacts/gauntlet-heat6-guests-r2-20260825/` | 338 | Free; auto-merged clean |
| **MAIN-MOVED too** (`M`) — `tasks/BACKLOG.md` | 1 | **CONFLICT, resolved by classification** |

**The one conflict, and how it was resolved.** The lane rewrote its own line 1 — the Heat 6 row — replacing *"GUEST FIELD STOPPED LAWFULLY AT SKEW GATE"* with *"GUEST R2 FIELD COMPLETE ON CURED PARITY"*. Since the base, main had prepended 14 further rows, pushing that same row down to line 16, so git could not place the edit. Resolved as: **keep all 14 rows main added, and swap only the row the lane actually rewrote.** Both intents preserved, neither side blanket-won.

Proven rather than asserted — a set-difference of the merged file against main's:

- rows only on main: **1** (the superseded Heat 6 row) · rows only in merged: **1** (its replacement) · line count `4644 → 4644`, a one-for-one swap
- the s2309 `door-epic-envelope-v2` row authored earlier this fire: still present
- merged tree vs main: **339 paths — 338 `artifacts/` + `tasks/BACKLOG.md`**, nothing lost, nothing extra

## Findings

**F-2309-1 — NON-BLOCKING: `test:power-budget` is a wall-clock assertion that `run-guards` schedules immediately after a 706-second battery, so it reds on machine state rather than on code.**

`scripts/check-power-graph-budget.mjs:44` asserts `p95 <= 0.500 ms` over 160 samples of `system.diagnostics().lastStepMs`. In the drain battery it read **0.504 ms — a 0.8% overage**. `run-guards.mjs:247` uses `spawnSync`, so its legs run **serially**: this leg executed the instant `test:node-guards` (706 s) released the machine.

📊 **DIFFERENTIAL MEASURED, NOT ARGUED — 3 interleaved pairs, same shell, same minute, load avg 8.20 at the start:**

| | main | merged |
|---|---|---|
| run 1 | 0.300 ms PASS | 0.311 ms PASS |
| run 2 | 0.311 ms PASS | 0.305 ms PASS |
| run 3 | 0.329 ms PASS | 0.302 ms PASS |

**Both trees 3/3 PASS; the merged tree is marginally FASTER than main.** The differential is **ZERO**, which is the only question the gate had to answer — and it is answered decisively, because a diff of 338 artifacts and one ledger row is structurally incapable of moving a `PowerGraph` timing measurement.

⚖️ **Priced honestly and deliberately not inflated:** typical p95 is ~0.30 ms against a 0.500 ms cap (**~67% headroom**), so this is not a guard running near its limit in normal use. What it did was take a **~68% excursion** under self-inflicted battery load. That will recur, on any fire, for any slice — it is an instrument-scheduling property, not a slice property.

🚫 **DELIBERATELY NOT RE-PINNED (F-1441-3): re-pinning to make a red go away is forbidden without a named cause, and "my machine was busy" is not a cause that belongs in a budget constant.** The honest options are to schedule this leg away from the heavy battery, or to sample it under a declared quiescence condition — both are instrument changes, out of scope for an evidence-only drain, and neither should be done as a drive-by. Recorded here so the next fire that sees `p95=0.50x` recognises it in one read instead of re-deriving the control.

ⓘ **The red inventory cannot answer for this leg:** `red-inventory-lookup` indexes `e2e/*.spec.ts` only and refuses a node-guard name outright (*"spec does not exist"*). That refusal is correct and loud — but it means node-guard reds have no inventory at all, so there is nowhere for a fire to have looked this up. Stated as a limitation, not a proposal.

**Non-finding, recorded so it is not re-investigated:** the runner's report and its `verification.txt` agree with every number the battery independently reproduced. No discrepancy found between claim and artifact.

## Ledger

Goal leaf `gauntlet-heat6-guests-r2` → `status:"merged"` + 40-char `mergeHash`, in the drain commit. BACKLOG row marked ✅ SHIPPED in the same commit. GZ-01 item filed for the merge (prior heats are gazetted — `7dab6bde` heat-4, `b31ecbc5` heat-e1).
