# F-1572-1 — lane arm, uncensored drift

**Slice:** `f1572-1-lane-arm-uncensored-drift`  
**Branch/tip measured:** `lane/b` at `cf2955d957d06c117e5f1044754a2a2b9e0331da`  
**Verdict:** **DECLARED SUCCESS — the uncensored lane arm produced 24 observations, 0 CENSORED runs, and 0 breaches of `0.4`.**

## Arrangement and pre-measurement checks

- Full `e2e/m4-06-embodiment.spec.ts`, never the isolated test and never `--repeat-each`.
- Twelve separate `npx playwright test` invocations per project, `desktop-chrome` then `mobile-chrome`, serially, with `--workers=1`; every invocation started its own dev server.
- Samples were harvested by filtering for the `[m4-06-denied]` substring, then parsing `driftAbs`.
- Both F-1424-3 sequencing probes printed `1` before measurement.
- `npx tsc --noEmit`: rc=0.
- Pre-measurement `npm run build`: green; Vite **1.41s**; `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).`
- Every invocation: rc=0, **10 passed**. `test:node-guards` was **not owed** because this task changes no `src/sim/`, `src/systems/`, or `src/entities/` file.

Raw invocation logs and exit-code companions are under `artifacts/f1572-1-lane-arm/<project>/run-{01..12}.{log,rc}`.

## Raw lines in run order

### `desktop-chrome`

```text
[m4-06-denied] driftAbs=0.33233868267175914 gapClosed=0.33175519291965117
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.2833831328784402 gapClosed=0.2823313158299232
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
```

### `mobile-chrome`

```text
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3497942252239167 gapClosed=0.34914401122789407
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3359077254247072 gapClosed=0.33534841091296563
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
```

## Distribution

| project | values in run order | observations | distinct | min | max | breaches `>= 0.4` | CENSORED |
|---|---|---:|---:|---:|---:|---:|---:|
| `desktop-chrome` | `0.33233868267175914`, `0.3722002149381437`, `0.3722002149381437`, `0.2833831328784402`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3722002149381437`, `0.3722002149381437` | 12 | 4 | `0.2833831328784402` | `0.3722002149381437` | **0** | **0** |
| `mobile-chrome` | `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3497942252239167`, `0.3722002149381437`, `0.3359077254247072`, `0.3722002149381437`, `0.3722002149381437` | 12 | 4 | `0.30904530412222725` | `0.3722002149381437` | **0** | **0** |

## Three-way comparison

| arm | sampling | observations | breaches `>= 0.4` | max |
|---|---|---:|---:|---:|
| **This lane arm** | uncensored; 12 desktop + 12 mobile | **24** | **0** | `0.3722002149381437` |
| F-1564-1 lane arm | censored | **24** | **0** | `0.3722002149381437` |
| s1572 fire arm | uncensored; desktop | **12** | **0** | `0.3722002149381437` |

## Verdict

The uncensored lane arm **does not breach `0.4`**: 0 of 24 observations breached, and no run was censored. This is a declared successful negative result. On the banked comparison metrics it **does not differ from the uncensored fire arm**: both have zero breaches and the identical maximum `0.3722002149381437`; this lane sample therefore does not support a lane-versus-fire localisation. It also reproduces F-1564-1's zero-breach count and exact maximum after removing that arm's censoring bias. The previously observed lane breach `0.4096828041302199` remains a real observation, but it did not recur in this fixed-size arm and no bound change is justified.

## Firewall and adjacent findings

- `e2e/m4-06-embodiment.spec.ts` is byte-identical to `main`: SHA-256 `72055250610e6c4fda5a2535904ca0011defb693748c88d761ef0d7ab8844fd0` on both.
- No `e2e/**` or `src/**` file changed; no numeric bound changed; `CLAUDE_CONFIG_DIR` was not set.
- No adjacent defect was found or fixed.

---

## DRAIN — s1573, MERGED `d4380c4aad300b05ffacb35c7b429214e18d3303`

**Verdict: MERGE.** §3.0 `drain-block-check` ran FIRST, before any classification or opinion: **CLEAR** (`status="queued"`).

### Classification

Base `cf2955d95` (the master's own dispatch commit). The lane's single commit `ab735d456` touches **25 paths**: 24 `artifacts/f1572-1-lane-arm/**/*.rc` + `reviews/f1572-1-lane-arm-uncensored-drift.md`. Main moved since that base on **`STATUS.md`, `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl`** — **zero overlap**, so all 25 are LANE-TOUCHED / MAIN-UNMOVED. `--no-ff` merge, no conflicts, no graft required.

### The firewall's load-bearing clause, verified by hash rather than by report

The master's central prohibition was that `e2e/m4-06-embodiment.spec.ts` must not change **by one byte** — editing the subject destroys the measurement. ✓ **VERIFIED:** `git rev-parse main:e2e/m4-06-embodiment.spec.ts` and `lane/b:e2e/...` both return blob **`b805c5b455f67e5c93588e31e555cf554b4a3f76`**. The path list independently confirms no `e2e/**`, `src/**`, `playwright.config.ts`, `tasks/**` or `specs/**` file is in the diff at all. No numeric bound moved in either direction; no forbidden green.

### The distribution was RE-DERIVED from the raw logs, not read from the report

A transcribed table is a claim about evidence, not the evidence. Having rescued the raw logs (see F-1573-1 below), I re-parsed all 24 independently — **using the F-1572-3-compliant method the master itself prescribes: substring-filter for `[m4-06-denied]` FIRST, parse the number AFTER**, so no number format can gate an observation's existence.

| project | runs `10 passed` + rc=0 | obs | CENSORED | distinct | min | max | breaches ≥ `0.4` |
|---|---:|---:|---:|---:|---|---|---:|
| `desktop-chrome` | **12/12** | 12 | **0** | 4 | `0.2833831328784402` | `0.3722002149381437` | **0** |
| `mobile-chrome` | **12/12** | 12 | **0** | 4 | `0.30904530412222725` | `0.3722002149381437` | **0** |

**Every value matches the runner's transcription exactly, in run order, for both projects.** The report is fully corroborated by its own raw evidence.

### Gates (proportionate, and the reasoning is stated rather than assumed)

`npx tsc --noEmit` **rc=0** · `npm run build` **green, 1.24s**, `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling)` — matching the runner's pre-measurement figure. **`npm run test:node-guards` NOT owed**, stated explicitly rather than silently skipped: the merged diff contains no `src/sim/`, `src/systems/` or `src/entities/` file (it contains no source file whatsoever). The slice's own spec was executed **24 times on this exact tree** by the runner at `--workers=1`, projects serial — re-running it here would add no information the artifacts do not already carry.

### Findings

**F-1573-1 (non-blocking, RETENTION LAW — the raw logs of a measurement task are silently swallowed by `.gitignore`).** The runner wrote 24 `run-NN.log` files (~1.9 KB each, 192 KB total) carrying the per-test pass detail, and the review cites them as `artifacts/f1572-1-lane-arm/<project>/run-{01..12}.{log,rc}`. **Only the 2-byte `.rc` companions reached git.** ✓ VERIFIED, not inferred: `.gitignore:7` is a repo-wide `*.log`, so the runner's path-scoped `git add` silently dropped every one — the citation is true of the disk and false of the repo, which is precisely the *"bytes in no object database"* bucket `art-staging-audit` exists to catch in the art slot. 🔑 **The class is older than this slice and the precedent is in the file itself:** `.gitignore:42-43` cures the identical disease for exactly one directory (`!reviews/eight-winds/gen/*.codex.log`) with a comment naming the cause — *"The repo-wide `*.log` rule at line 7 was swallowing them"* — so the cure was written narrower than the disease. ⓘ **Measured scope:** of 16 `.log` files tracked under `artifacts/` on main, **all 16 are `artifacts/sol/`** (attended Codex, force-added); **no fire-side measurement has ever landed its raw logs.** The sibling measurements escaped only by *naming their raw output something else* — `f1564-1-m4-06-ceiling/samples.txt`, `f1572-1-fire-shell-drift/measurement.md` — i.e. by luck of extension, not by design. ✅ **RESCUED THIS DRAIN:** all 24 logs `git add -f`'d into the merge (they sit inside the task's own declared TOUCH-ONLY scope, so this is faithful to the master, not scope creep) — and rescuing them is what made the independent re-derivation above possible at all. ⛔ **The general cure is deliberately NOT applied here.** A blanket `!artifacts/**/*.log` would newly track every future playwright log repo-wide, unmeasured, in a drain commit — the wrong place to widen a tracking rule. Filed for a scoped decision.

**Nothing blocking.** The measurement stands, its firewall held, and its numbers reproduce from raw evidence.
