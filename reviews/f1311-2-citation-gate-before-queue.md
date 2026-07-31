# f1311-2 — the citation gate moves before the queue copy

**Slice:** `lane-a-f1311-2-citation-gate-before-queue` · **branch:** `lane/m3` · **lane tip:** `817622e3` · **base:** `0b06a62e`
**Merged to main at:** `<MERGE_HASH>` · **drained by:** s1312 · **date:** 2026-08-01

## Verdict

**MERGED — PASS.** tsc rc=0 · build rc=0 (1.38 s, asset-diet green) · focused `drain-block-check.test.mjs` **18/18** · `test:node-guards` **203/203** · ticker-stats / findings-state / blocker-panel / ruling-propagation all rc=0 · `--all` still **4 BLOCKED** · citations PASS.

**The count reconciles: 199 at s1311 + exactly 4 new assertions = 203.** Derived from my own run, not inherited from the report.

## What it does

`scripts/drain-block-check.mjs --queue <master>` now refuses a **new bare `spec:line` citation in the named master**, exiting 1 with the offending key, the source line, and the repair instruction. It does this by **calling `citation-title-guard.mjs`** — not by reimplementing it — inside a throwaway temp repo (`mkdtemp` + `git init`, real `e2e/` symlinked in, a sentinel spec and sentinel master written), so the guard sees a tracked-file world of exactly one master. The grandfathered baseline is honoured, so legacy re-queues keep working.

**The drain arm is deliberately untouched.** Only `--queue` gained the check — you cannot be blocked from draining work that already exists because of a citation defect in its master.

This is F-1311-2's mechanism: s1306 authored a master, copied it to the queue per author-task §5, and only then ran the battery that judged it (the s1301 last-act law) — which reddened `citation-title-guard` against its own master, *after dispatch*. The gate now runs at the copy, where it can still prevent something.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | rc=0, **✓ built in 1.38 s**, asset-diet green |
| `node --test scripts/drain-block-check.test.mjs` | **18/18 pass**, 0 fail |
| `test:node-guards` (`node --test` arm, 37 files) | **203 tests / 203 pass / 0 fail**, 42.5 s |
| `scripts/test-ticker-stats.mjs` | all 8 checks passed |
| `findings-state-guard` | PASS — 150 closed / 44 open / **0 double-state** |
| `blocker-panel-closed-guard` | PASS — 206 census closed, **0 closed-on-panel** |
| `ruling-propagation-guard` | PASS — 3 RULED, 20 leaves refuse, **0 stale** |
| `drain-block-check --all` | **4 BLOCKED** (unchanged) |
| `citation-title-guard` | PASS — 367 scanned, 0 new bare |
| `src/` + `e2e/` changed | **0 files** — no runtime surface, so no playwright (§3.1 n/a) |

### The manufactured red — taken on the LIVE tree, not on a fixture

A passing guard never executes its violation path, so the runner's green is not evidence about the red. I ran the defect against the **real, registered, `status:"queued"` master** `tasks/lane-a-f1311-2-citation-gate-before-queue.md`, and the discrimination is three-way, not two-way:

| Probe on the live master | Exit | Result |
|---|---:|---|
| untouched (control) | **0** | `✅ CLEAR — … status="queued"` |
| append bare `` `e2e/agent-view.spec.ts:1` `` | **1** | `FAIL` naming `tasks/lane-a-f1311-2-citation-gate-before-queue.md::e2e/agent-view.spec.ts:1`, quoting source line `:141`, printing the repair |
| same citation + a **fabricated** title | **1** | still refused |
| same citation + the **real** title at `:250` | **0** | `✅ CLEAR` |

Master restored: sha256 `eb4e3a0b…f063` **byte-identical** before and after; `git status --porcelain -- tasks/` empty.

**The third row is the one the fixtures could not have found.** The runner's `--queue accepts the same citation with its test title` fixture writes a sentinel spec whose title matches by construction, so it proves only *a title is present*. On the live tree a **made-up** title is still refused — the guard resolves the cited line and requires the quoted title to be recoverable there. **The gate is stronger than its own test advertises**, which is a good direction to be wrong in, but it means the fixture is not measuring the load-bearing property.

### Firewall honoured

`git status` at hand-off shows **neither `scripts/citation-title-baseline.json` nor `tasks/goals.json`** — s1311's explicit check. LANE-TOUCHED is exactly two files.

## Merge classification

**Base `0b06a62e`.** Both LANE-TOUCHED paths are disjoint from everything main moved:

| Path | Class |
|---|---|
| `scripts/drain-block-check.mjs` (+68/−8) | LANE-TOUCHED only |
| `scripts/drain-block-check.test.mjs` (+60, new) | LANE-TOUCHED only |
| `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-a-f1311-2-…md` | MAIN-MOVED only |

**Zero overlap → no 3-way graft.** ⚠️ The two-dot `main..lane/m3` diff shows those four bookkeeping files as *deletions*; that is the stale-base phantom, not content loss — the lane branched at `0b06a62e`, before s1311's bookkeeping and my own lock. Applied with `git checkout lane/m3 -- <2 paths>`; `git diff lane/m3 --` over both is **0 lines** (graft byte-identical to the lane tip).

## Findings

### 🟡 F-1312-1 — the citation gate's denominator is *registered* masters; an unregistered master is never citation-checked

Measured, not inferred. `checkQueuedMasterCitations` is called only after a goal leaf matched and passed the terminal check. A master with **no leaf** exits at the UNKNOWN branch first, and that branch is `process.exit(strict ? 2 : 0)` — so:

```
--queue on an unregistered master carrying a bare citation  →  exit 0, "? UNKNOWN", no citation check
```

Verified with a throwaway `tasks/__s1312-unregistered-probe.md` containing a bare `` `e2e/agent-view.spec.ts:1` ``: **rc=0**, UNKNOWN, citation never scanned. Probe deleted.

**Severity is low and the scoping is arguably correct**, which is why this is a row and not a corrective. §3.0 measures **526 of 762 masters (69.0%) carry no leaf** — but that is *legacy* debt, and the Goal Registration Law requires every **newly authored** master to register its leaf in the same commit. The defect class F-1311-2 addresses is precisely a freshly-authored master, and those are always registered. The gap is re-queues of legacy masters. ⓘ **A fire that passes `--strict` is already covered by a different route** — UNKNOWN becomes rc=2 and stops. Recommend the eventual author-task wording say `--strict --queue`, not bare `--queue`.

### 🔵 F-1312-2 — lane-c's eight-winds rung is ART-gated, not wiring-gated: **PIPELINE-DRY**

Re-derived this fire because the `stopped` leaf `eight-winds-wiring-e2-enemies` reads as available work to a goal-tree walk, and it is not. Current contract state on main (`assets/layer-contracts/characters.v2.json`): `char.e2.rail_tough` is **BOUND** (8 directions, `aliases {}`); `char.e2.steam_wrecker` and `char.e2.coal_thief` still carry only `s/w/e/n` with `aliases` mapping the four diagonals onto cardinals. Processed diagonal cells on disk: railtough **16**, steamwrecker **0**, coalthief **0**.

The blocker is no longer the row→heading mapping — the row-order survey answered that. It is that **two rows are defective art** (Coal Thief r0 duplicates `se` instead of `sw`; Steam Wrecker r1 carries `2,2,2,2` cyan clusters) and the art batch **parked both after three attempts each, every one with a changed premise**. `tasks/BACKLOG.md` F-1261-7 rules it verbatim: *"It is ART-gated, not wiring-gated: a 4th generation premise must land first."*

**Therefore not fire-authorable** (§2E hard limit: a 4th generation premise is an art/design fork, and CLAUDE.md §7.5 forbids an identical retry). Re-queueing the stopped master unchanged would ship the defect its own STOP prevented **and** now collide on the already-bound Rail Tough slot. Flagged **PIPELINE-DRY: lane-c (needs an art premise / owner)**.

ⓘ Incidental, not repaired here: four `eight-winds-*` leaves in `goals.json` cite `BACKLOG:1643`/`:1644` for a gate-release string that now lives at `:2147`. F-1310-1's ban does not reach them — it covers `blockedReason` on non-terminal leaves, and these sit in other fields on merged leaves. Same rot class, wider denominator; recorded, not tasked.

### ✅ The runner's report was accurate on every number I re-derived

203/203, 18/18, 4 BLOCKED, `--all` unchanged, `git status` clean of the two firewalled files, five real masters passing. Recorded because "the report was right" is itself evidence worth keeping — the re-derivation is what makes the green mean something, not the agreement.
