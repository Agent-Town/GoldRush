# queue-shipped-guard — F-1115-1's cure: the refill pool gets a fail-loud gate

**Slice:** `lane-queue-shipped-guard` · **Branch:** `lane/e2-arsenal` · **Tip:** `d222122748e87516a2621f1b7d3d0909980837a4`
**Base:** `68b3030a` (s1115's authoring commit) · **Drained:** s1116, 2026-07-27
**VERDICT: MERGE.** Default contract byte-identical across 260 invocations; the guard refuses 119/119 terminal leaves and stays non-vacuous on the 4 live ones. Two non-blocking findings (F-1116-1, F-1116-2).

## What it does

`scripts/drain-block-check.mjs` gains an **opt-in `--queue` mode**. In that mode a goal leaf whose
status is terminal (`merged` or `shipped`) prints `⛔ ALREADY SHIPPED — DO NOT QUEUE`, names the leaf
and its `mergeHash`, and **exits 1**. `/author-task` §0.1 now calls it as the first of its three
pre-flight facts, keeping the BACKLOG grep as corroboration rather than as the primary instrument.

This closes F-1115-1: s1115 found three already-shipped masters sitting queueable in the refill pool,
and found that this repo's own gate printed `status="merged"` and still exited `0 CLEAR` on all three.
Queueing any of them is Mistake #8 (the 824k Flail).

**The runner discovered a second terminal status I had not specified.** F-1115-1 named `merged`;
`goals.json` also carries 8 leaves at `shipped`. Both are covered. That is 119 of 124 leaves.

## Evidence

`npx tsc --noEmit` does **not** cover this file — `tsconfig.include` is `["src","e2e","playwright.config.ts"]`.
The runner said so in its report, and it is why the CLI mutation runs below are the real gate, not the
type-check. I re-ran all of them myself against a pristine `git show main:` copy of the script.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (real, but vacuous for this file — see above) |
| `npm run build` | **green, 1.61s** |
| Importers of the script in `src/`/`e2e/`/`package.json` | **none** — no runtime or render surface |
| Box load (before → after) | **3.42 → 5.94** (16 cores) |
| e2e / screenshots | **N/A, and stated rather than skipped**: the diff is one fire-side CLI + one skill doc |

### (c) The default contract is unchanged — 260 invocations, zero diffs

`fire.md` §3.0 pins the **default** invocation as law, so this was the firewall-critical scope item.
I compared `main`'s script against the merged script over **every one of the 124 leaf `taskFile`s**
plus 6 shapes fires actually use (`lane/m3`, `lane/e2-arsenal`, `--all`, an `OWNER-GATED…do-not-drain`
filename, a nonexistent target, and the real done-move filename), each in both plain and `--strict`
form:

```
(c) DEFAULT CONTRACT: 260 invocations compared, byte+exit diffs = 0
```

The runner tested 4 targets here. I widened it to 260 because "byte-identical" is a claim about a
*contract*, not about the samples someone happened to pick.

### (a)/(b) The guard fires, and it is not vacuous — swept over all 124 leaves

```
authored  -> clear           exit0 :   1  [queue-shipped-guard]
diagnosed -> clear           exit0 :   3  [m2-05-wreck-repair-drift, cw-02-wrecker-target-premise, calibrate-suite-workers]
blocked   -> refused-blocked exit1 :   1  [rf-34-hero-y-restore-roundtrip]
merged    -> refused-shipped exit1 : 111
shipped   -> refused-shipped exit1 :   8
```

- **The named hazard is cured**: all three F-1115-1 masters are in the 111.
- **Not vacuous**: the 4 non-terminal leaves still clear, so the guard discriminates rather than refusing everything.
- **The existing block still wins**: `rf-34` (owner-gated) takes the `BLOCKED` path in queue mode too — the new
  branch is inserted *after* the block check, so `--queue` cannot downgrade an owner gate into a shipped-notice.
- **`diagnosed` deliberately clears.** A diagnosis-only run ships no code, so re-queueing one is not the Flail.
  Recording it here so a later fire reads it as a decision, not an oversight.

### The consumer's literal line actually executes

A lift is only paid when the *consumer's* wording runs. `/author-task` §0.1 now prescribes
`node scripts/drain-block-check.mjs <master> --queue`, so I ran all four shapes an author would plausibly type,
against a genuinely shipped master:

| Typed target | Result |
|---|---|
| `lane-blocked-storage-access-throw.md` | exit 1, ALREADY SHIPPED |
| `tasks/lane-blocked-storage-access-throw.md` | exit 1, ALREADY SHIPPED |
| `./tasks/lane-blocked-storage-access-throw.md` | exit 1, ALREADY SHIPPED |
| `lane-blocked-storage-access-throw` (no extension) | exit 1, ALREADY SHIPPED |

## Merge classification

Base `68b3030a`. Per-file, by blob identity rather than by eyeball:

| File | base==main | base==lane | Class | Action |
|---|---|---|---|---|
| `scripts/drain-block-check.mjs` | ✅ | ❌ | **LANE-TOUCHED** | merged |
| `.claude/skills/author-task/SKILL.md` | ✅ | ❌ | **LANE-TOUCHED** | merged |
| `STATUS.md` | ❌ | ✅ | MAIN-MOVED-ONLY | **not taken** |
| `tasks/BACKLOG.md` | ❌ | ✅ | MAIN-MOVED-ONLY | **not taken** |
| `tasks/goals.json` | ❌ | ✅ | MAIN-MOVED-ONLY | **not taken** (leaf flipped by this drain instead) |

No file moved on both sides, so there is **no conflict and no 3-way graft**. The three MAIN-MOVED files are
s1115's own handoff edits; the lane simply predates them, which is the stale-base phantom shape. Zero debris:
the runner's commit touched exactly the two authorized files.

## Findings

**F-1116-1 (non-blocking, but do not let it be quoted as universal) — the guard's denominator is 120, not 644.**
The queue guard can only refuse a master that *has* a goal leaf. Measured this fire:

```
master files in tasks/ : 644
with a goal leaf       : 120
NO leaf (UNKNOWN -> 0) : 524
```

So **~81% of the artifacts a refill actually starts from are still waved through** — including the pre-Goal-
Registration-Law legacy masters (`001-m2-01-…`, `002-m2-03-…`, …). This is not a defect in the slice: the leaf
is the only record that *can* answer the question, and the Goal Registration Law (owner, 2026-07-16) means every
master authored from now on has one. Two things make it survivable, and both are already in the merged code:
`UNKNOWN` prints *"A missing leaf is a bookkeeping finding, not a clearance"*, and `/author-task` kept the
BACKLOG grep as corroboration. ➡️ **The honest statement is "119 leaves guarded, 524 masters still bare" — never
"the refill pool is protected".** A follow-up could make `--queue` fail closed on UNKNOWN; that is a design call
about authoring friction, not a bug, so it is not fire-authorable as a silent change.

**F-1116-2 (bookkeeping, low) — 3 of 118 recorded `mergeHash` values are not reachable from main.**
`m1-m2-resource-guards`, `factory-diet-gate-honesty`, `calibrate-suite-workers` each name a commit that exists in
the object database but is **not an ancestor of main** — the pre-amend orphan shape (a fire writes the hash into
`goals.json`, then amends the commit, which changes the hash it just recorded; `git show 70ce6e50` shows the
precedent doing exactly this, and only a later correction saved that leaf). It matters slightly more now: the
`--queue` refusal *prints `mergeHash` as its evidence*, so for those three the evidence line cannot be verified by
the reader it is written for. Note `m1-m2-resource-guards` records `d93b1505…` while s1115's content probe put its
shipping at `f7cd0103` — consistent with this, not a contradiction of s1115.
➡️ **This drain avoids minting a fourth**: the leaf is flipped in a follow-on commit that names the real, already-
written main hash, rather than guessing a hash that an amend would invalidate.

## Ledger

- Merged path-scoped: `scripts/drain-block-check.mjs`, `.claude/skills/author-task/SKILL.md`.
- Goal leaf `queue-shipped-guard`: `authored` → `merged`.
- **No gazette item and no deploy**: the change is factory-internal (a fire-side CLI and an authoring skill).
  Nothing a player can see moved — the filter law's question ("where does the PLAYER see this?") answers "nowhere,
  by design".
