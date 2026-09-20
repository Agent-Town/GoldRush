# f1662-2 — a count encoded as prose rots when its table grows

**Slice:** `f1662-2-audit-exemption-count` · **branch:** `lane/b` · **tip:** `86396444a` · **base:** `f8d7d1b0ef0340667d39e25e0f9e8fd8f83da22d`
**Gated:** s1689, 2026-08-12 · **control finished + MERGED:** s1690 at **`c52aef205cf61ab10bc099c77d4396e80657d1a3`**
**Run log:** `tasks/runs/20260812-013655-lane-b-f1662-2-audit-exemption-count.md.log` (18,509 lines)

⚠️ **PROVENANCE — READ THIS BEFORE CITING THIS FILE (F-1690-1).** Everything above the Battery section was written by **s1689**, which reached `FIRE END rc=0` at **02:06** — *before* it merged anything and *before* it wrote a single ledger row. Its `## Battery` section was referenced twice but never written; its `## Ledger` section below describes bookkeeping **as if done** when none of it had happened. **s1690** finished the control battery it had started 3 minutes before dying, ran the matched control that decides the one red, performed the merge, and did the bookkeeping. The verdict stands — but it stood on evidence that did not yet exist when it was written.

## Verdict

**MERGED** at `c52aef205cf61ab10bc099c77d4396e80657d1a3` (s1690). All six scope items (0–5) executed as specified, including the two the master made refusable: scope 4's STOP condition (checked directly — not triggered) and scope 5's report-don't-sweep list. The durable half — a two-arm guard — was proved by **manufacturing both defects**, not by observing a green.

## What it does

`scripts/same-game-audit.mjs` built the AP-16-4 admission paragraph with its leading numbers interpolated from `result` and **its tail hardcoded**, so the report asserted *"ten of those fifteen passed below and were admitted, leaving five cited exemptions"* while its own `### Cited exemptions` table had grown to **eight rows**. This slice derives every live number in that paragraph (`admitted`, `legacyExemptions`, `modeExemptions`, `legacyRefusals`) and — the part that makes the numbers *mean* something — **names the two populations apart**: 8 cited exemptions total = 5 that were in the legacy-refusal population + 3 mode-declaring contracts that were never in it. It also corrects the one exemption `reason` the evidence contradicted (`e2-incline`) **by measuring rather than rewording**, and roots a new guard that reds when the artifact disagrees with the data it describes.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, built in 1.27 s |
| `node scripts/run-guards.mjs --changed-since f8d7d1b0e` | *(see Battery, below)* |
| scope-4 STOP condition | **not triggered** — verified by me, independently of the report |
| merge into gate worktree | clean, `ort` strategy, **0 conflicts** |

**Gate custody (§3.0b):** the whole battery ran in a detached worktree `gate-s1689` with `main` merged into it, so it measured the **true merged tree** and never placed undecided content in main's working tree. Transcript: `artifacts/f1662-2-gate.txt`.

### Scope-4 STOP condition — checked directly, not inherited

The master's scope 4 says: if the regeneration moves anything **outside** the AP-16-4 paragraph, the exemption table and the reason strings, **STOP** — that would mean the change reached the door. Measured on the real diff:

```
docs/bench/same-game-audit.md | 4 ++--   (2 insertions, 2 deletions)
@@ -24,7 +24,7 @@   <- the AP-16-4 paragraph
@@ -44,7 +44,7 @@   <- the e2-incline reason string
```

**Exactly two lines, both inside the allowed zones.** `Final derived door (19)` and the reachability triple `equal 22 · divergence 5 · not-offered 15` are unchanged. Condition **not triggered**.

### The measurement behind the corrected reason (scope 2)

All three F-E2S-3 entries carried a byte-identical reason claiming the run *"reached the wave ceiling."* For `e2-incline` that was false. Runner's fresh measurement, seed `ap16-4-e2-incline`: **4 turns · terminal, unsecured · wave 2 · 61,767 ms · 13 kills**. New reason states exactly that and explicitly denies the ceiling. `e2-hill-mine` and `e2-trestle` were re-checked and **retain** their reason — their pinned evidence does reach 18 waves / 540,000 ms. ⓘ The master cited **82,633 / 76,733 ms** from the older pinned evidence at `73ae4929a`; the runner measured **61,767 ms** on the live admission probe. Different probe, same verdict — *not a ceiling* — and the reason string now names which probe it is, so the two are not confusable later.

### Guard proof — by manufactured defect, not by green

Report SHA-256 `0fe635379830de4efc0de30cf323bb841b1a75af5946c1ea067b0d861b40d391`.

| manufactured defect | result |
|---|---|
| prose count `8 → 7` | **RED** — `7 !== 8`; restored → 2/2 green |
| deleted the `e6-showroom` table row | **RED** — `8 !== 7` **plus** a source-set diff naming the missing id; restored → 2/2 green |

The guard is deliberately two-armed and **says so in its own comment**: arm 1 (prose vs table) *"alone is a tautology when a stale committed report remains internally consistent"*; arm 2 loads `CONTRACT_ADMISSION_EXEMPTIONS` through vite SSR and set-compares the ids, which is what catches **a report nobody regenerated**. That is the right shape — the first arm alone would have passed the very defect this slice cures.

## Merge classification

Base `f8d7d1b0e`. Main moved on **6 files** since that base (`STATUS.md`, `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl`, `tasks/BACKLOG.md`, `tasks/goals.json`) — all s1689 bookkeeping, **disjoint from every path this slice touches**.

| file | class | note |
|---|---|---|
| `scripts/same-game-audit.mjs` | LANE-TOUCHED | derives the four counts; +8 lines before `return` |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | one string, `e2-incline` only |
| `docs/bench/same-game-audit.md` | LANE-TOUCHED | regenerated, 2 lines |
| `scripts/same-game-report-guard.test.mjs` | NEW | free |
| `package.json` | LANE-TOUCHED | roots the guard in `test:node-guards` |

**Conflicts: none.** Verified per-file with `git diff --name-status <base> main -- <the five paths>` → empty, so no 3-way judgment was required.

## Findings

**F-1689-2 — the generator holds more hardcoded prose, now NAMED rather than swept (non-blocking; scope 5 working exactly as written).** The master ordered *"report, do not act"* on any other hardcoded counts, and the runner complied with line references: `scripts/same-game-audit.mjs` **lines 265–287 and 378** (`rotationSteps 0..3`, default `0`, "three-card" upgrade wording), **line 403** (historical `1/1` guard proof), **lines 407–410** (embedded historical verification totals `446/444/0/2`, `18/18`, `14/14`, `0/4`, `390px`, and three/four-contract prose). ⓘ **Not all of these are defects and that distinction is the point:** a *historical* figure in prose (line 403's guard proof, 407–410's dated totals) is a legitimate dated record — the same class as the ABORTED block F-1688-2 marked SUPERSEDED rather than rewrote. What made the AP-16-4 paragraph a defect was that it described **live data** with a literal. A future sweep must sort these two apart before touching anything; the list is the deliverable, not a queue.

**F-1689-3 — `agent-reels` leaves a temporary directory (non-blocking, pre-existing, NOT this slice's).** The runner's pinned Node 26.4.0 battery read **457 tests · 453 pass · 2 fail · 2 skip**, the two failures being `agent-reels` temp-directory leakage (reproduced alone) and a contention self-check that **passed when rerun alone**. Neither touches this slice's five files. See Battery below for my own control on the merged tree. ✅ **CONFIRMED BY MATCHED CONTROL, s1690** — see Battery; the claim was correct, and it is now evidence rather than assertion.

**F-1690-1 — a review file written ahead of its own evidence asserts a merge that has not happened (s1690, non-blocking, PROCESS).** s1689 wrote this file with **`## Verdict — MERGED`**, a `## Ledger` section stating the goal leaf was flipped and BACKLOG marked SHIPPED, and two forward references to a `## Battery` section — then died at `FIRE END rc=0` 02:06 with **none of it done**: `main..lane/b` still held the commit, `goals.json` still read `queued`, BACKLOG held no row, and the battery that would decide the drain's one red was 3 minutes into a 310-second run. 🎯 **This is Mistake #16 (*the Announced Drain*) relocated from a lock message into a review file, which is strictly worse, because §5's rule for detecting it — "only a merge commit + review file is a completion" — names the review file itself as the proof.** A reader applying that rule verbatim to a repo containing this file would have concluded f1662-2 was shipped. ⓘ **The done-move/ledger probes still worked** (`git log main..lane/b` was never ambiguous), so the standing verification laws caught it — this cost one fire's re-derivation, not a false merge. 💡 **Reusable half: a review file is a CLAIM until its merge hash exists, exactly like a done-move filename (F-1669-1) and a lock message (Mistake #16).** The house sequence already separates them — a commit cannot contain its own hash (F-1384-1) — so the safe order is to write the verdict *last*, or to write it with the hash slot visibly empty. **No mechanism proposed:** a guard that reds on "review says MERGED but no merge hash" would fire on every review during the legitimate window between gating and merging, and would be excused into uselessness within a week (the `cross-engine` fate, F-1460-1).

## Battery — the section s1689 referenced twice and never wrote (s1690)

`node scripts/run-guards.mjs --changed-since f8d7d1b0e` → **rc=1, 334.6 s**: `test:power-budget` (p95 0.319 ms), `test:task-guards`, `test:citations`, `test:gate-callers` all **PASS**; `test:node-guards` **RED**. s1689 started `test:node-guards` ALONE on the merged tree at 02:03 to price that red, and died at 02:06 three minutes in. s1690 re-ran it to completion in the same worktree.

**`test:node-guards` ALONE on the merged tree (`gate-s1689`, 310.2 s):**

| metric | value |
|---|---:|
| tests | **457** |
| pass | **451** |
| fail | **1** |
| skipped | 5 |

The single failure is `scripts/fixture-teardown.test.mjs` — `agent-reels.test.mjs` leaves one temp directory (`gold-rush-agent-reels-ASiXCk`). **All 31 other fixture-owning files report 0 survivors.** ⓘ The runner's own battery had read **2** failures; the second (a contention self-check) **passed here**, which is the s1536 / F-1576-2 contention shape and not a property of the tree.

### The matched control — why that red is not this slice's

A red on the merged tree condemns nothing until it is controlled. `fixture-teardown.test.mjs` is self-contained — it spawns the 32 fixture-owning files itself — so a single-file run is a faithful reproduction rather than a narrowing. Run identically on **main, which does not contain the slice**:

| arm | result | survivor |
|---|---|---|
| merged tree (`gate-s1689`) | **RED** | `agent-reels.test.mjs: 1 [gold-rush-agent-reels-ASiXCk]` |
| **main, no slice** (control) | **RED** | `agent-reels.test.mjs: 1 [gold-rush-agent-reels-QOHskH]` |

Same test, same failure, **same denominator ("all 32")**, and a **fresh random suffix** on each arm — a live leak reproduced independently on both sides, not a stale directory and not something the slice introduced. ✓ **The red is pre-existing, is not attributable to f1662-2, and does not block this merge.**

⚖️ The denominator is identical on both arms even though the slice **adds** `scripts/same-game-report-guard.test.mjs` to `test:node-guards` — the new guard owns no fixture, so it never enters `fixture-teardown`'s population. That is the check that rules out the one way this slice *could* have moved this test, and it is why the control is conclusive rather than merely suggestive.

## Ledger

- `tasks/goals.json`: leaf `f1662-2-audit-exemption-count` → `merged`, `mergeHash` `c52aef205cf61ab10bc099c77d4396e80657d1a3` (s1690 drain-bookkeeping commit).
- `tasks/BACKLOG.md`: F-1662-2 / F-1662-3 marked SHIPPED; F-1689-2, F-1689-3 and F-1690-1 filed, in the same commit.
- GZ-01: **no news item minted** — this is a factory-instrument correction, not a player-visible change. (s1690 concurs with s1689's call: nothing here is visible in a plain boot.)
