# f2134-1 — bench terrain contract scope (REFUSED, corrective authored)

**Slice:** `f2134-1-bench-terrain-contract-scope`
**Branch/tip:** `lane/b` @ `6076a93b2167ce43c91f35e1dee668772a1092b0`
**Base:** main (lane reads `ahead=1 behind=12`)
**Reviewed:** 2026-08-21, s2136 fire
**Diff:** 4 files, +204/-1 — `scripts/terrain-contract-scope.mjs` (new, 109) · `scripts/terrain-contract-scope.test.mjs` (new, 35) · `docs/bench/terrain-contract-scope.md` (new, 59) · `package.json` (+2/-1, roots the npm script)

## VERDICT: REFUSE THE MERGE — re-use the output, correct the instrument's SPECIFICATION

`drain-block-check` reads ✅ CLEAR (`status="queued"`, no policy block), so this refusal is a
readiness judgement, not a gate. **No gate battery was run and none is owed yet:** both defects are
in what the instrument *measures*, so a green battery would only prove a wrong number reproducible.
Gating first would have manufactured evidence for a number that should not ship.

## What it does

Ships a standalone SSR reporter for F-A10-1. It boots a `vite` server in middleware mode,
`ssrLoadModule`s `src/world/Terrain.ts` and `src/meta/ContractFamilies.ts`, and for every board
contract declaring a non-empty `buildZones`, probes the centre of its **first** declared zone
through `Terrain.isBuildable`. It also parses `Terrain.ts` at runtime for a seam census, writes a
dated ledger-voice report to `docs/bench/terrain-contract-scope.md`, and `--check` reds when the
committed report drifts from a freshly derived one.

**The core measurement is TRUE and is worth keeping:** `22 of 36` contracts have their own first
declared build-zone centre rejected by `Terrain.isBuildable` under SSR, matching s2134's
independent probe exactly. The "what this means" paragraph states the browser-fact-vs-bench-fact
distinction correctly. The `--check` guard was proven by manufacturing the defect (red on line 11,
byte-identical restore, green again) — the s1299/s1300 standard, met.

## Findings

### 🔺 F-2136-1 — the `AGREE`/`DIVERGE` label is a two-sided claim derived from one-sided evidence, and the defect is in the MASTER, not the runner

`scripts/terrain-contract-scope.mjs:33-34`:

```js
const buildable = Terrain.isBuildable(x, z);
return [{ contract: contract.id, x, z, buildable, result: buildable ? 'AGREE' : 'DIVERGE' }];
```

A single call is made, against the **module-scoped** `Terrain` — which this very slice measures as
baked to `the-claim`. "AGREE" asserts that the bench's ground and *the contract's own* ground reach
the same verdict, but the contract's own ground is never evaluated. The label therefore cannot be
sound in either direction, and **the direction of error is unprovable without a second load** — which
is precisely why the label must be DROPPED rather than re-derived.

⚠️ **THE DEFECT ORIGINATES IN THE MASTER, WHICH CHANGES WHO THE CORRECTIVE IS FOR.** The master
specifies the label verbatim at `tasks/done/20260821-165054-f2134-1-…md:39`: *"probe the centre of
its **first** declared zone through `Terrain.isBuildable` and classify `AGREE` / `DIVERGE`"*. The
runner **identified this defect itself and correctly declined to fix it**, recording in its own
report:

> *"Independent review suggested redefining DIVERGE as a comparison against separately loaded
> contract terrain and excluding the declaration/fallback from the seam census. Those suggestions
> were not adopted because the queued task explicitly defines the first-zone false-result instrument
> and expects the raw 21/7 census; the report-boundary wording was narrowed instead."*

That is CLAUDE.md §4.5 executed exactly as written — *"Codex reporting adjacent problems = good;
fixing out of scope = violation."* **This slice is a firewall success, not an implementation
failure**, and the corrective must not read as though the runner erred.

💡 **Why the cheap cure is the right one.** Evaluating each contract's own ground in-process would
require a fresh module graph per contract, because module-scope baking is the defect under
measurement. Ordering that would be ordering the runner to defeat the thing being measured. The
honest cure is to report what the single call actually establishes — *rejected by the bench's baked
ground* — which is the F-A10-1 finding itself and needs no second load.

### 🔺 F-2136-2 — the seam census floor is TWO, not zero: it counts its own declaration AND the seam's own fallback

`:42-44` is asymmetric with the expression immediately following it:

```js
directReads: [...source.matchAll(/\bACTIVE_CONTRACT\b/g)].length,          // no subtraction
seamCalls: [...source.matchAll(/\bcurrentContract\(\)/g)].length
  - [...source.matchAll(/\bfunction currentContract\(\)/g)].length,        // subtracts its declaration
```

**Measured on main by reading `src/world/Terrain.ts`, not by grep count alone — 21 matches, of which
TWO are not bypassing reads:**

| line | text | class |
|---|---|---|
| `:78` | `const ACTIVE_CONTRACT = activeContract();` | **declaration** |
| `:407` | `return editorPreviewContract ?? ACTIVE_CONTRACT;` | **the seam's own fallback**, inside `currentContract()` (`:406`) |
| 19 others | `:79 :83 :85 :86 :102 :109 :142 :143 :167 :187 :190 :241 :277 :308 :316 :323 :703 :1460 :1461` | genuine bypassing reads |

So the true count of reads that bypass the seam is **19**, and the metric **cannot reach zero even
after a complete rewire** — `currentContract()` is structurally unable to exist without reading
`ACTIVE_CONTRACT` as its fallback, and the declaration must survive to feed it. **The floor is 2 by
construction.** A metric authored to track a rewire to zero can never register success.

⚠️ **The off-by-two propagates OUT of the script into the master's own prose and into the successor's
scope**, which is the expensive half: the master asserts *"21 reads in `Terrain.ts` go to
`ACTIVE_CONTRACT` directly"* (`:30`), scopes the firewall by *"the 21 reads"* (`:57`), names the
successor as *"route Terrain's 21 legality reads through the existing `currentContract()` seam"*
(`:75`), and pins `21` as an **expected value** in the self-check (`:71`). The runner was ordered to
produce the wrong number and did so faithfully. **Correct the instruction, not just the ledger.**

### ⓘ F-2136-3 — correcting one inherited attribution (non-blocking, bookkeeping)

s2135's line-1 states the runner *"named both directions (`e9-old-canal` false-positive DIVERGE,
`e2-hill-mine` false-negative AGREE)"*. **Re-read at source: it did not.** The runner's note is the
general one quoted in F-2136-1; those two contract ids appear in the run log only inside the data
table and in unrelated BACKLOG rows. The substance of s2135's verdict survives intact — the label IS
unsound in both directions — but no named counterexample was ever measured by anyone, and per
F-2136-1 none can be without a second load. Recorded so the next reader does not go looking for a
measurement that was never taken.

## Merge classification

Not merged. Per-file, had it merged: all four paths are **LANE-ONLY** (`lane-usable` reports
`31 of 31`, `109 of 109`, `59 of 59` added lines absent from main; `package.json` is the single
shared surface, a one-line additive script rooting). No conflicts, no MAIN-MOVED paths, no 3-way
graft owed. **The refusal is about content, not mergeability.**

🚫 **NOT part-good — do not isolate by reverting one file.** The classifier is upstream of all three
other paths: the test asserts its output, the report is its output, and `package.json` roots it.
Reverting any single file leaves the wrong labels shipping from another.

## Disposition

**Re-use this output.** It is honest work that found both of its own defects and obeyed its firewall
rather than fixing them. Corrective authored this fire: `tasks/f2136-1-terrain-scope-honest-labels.md`
→ lane-b, which re-specs the two measurements and re-lands on top of this branch's proven structure.
