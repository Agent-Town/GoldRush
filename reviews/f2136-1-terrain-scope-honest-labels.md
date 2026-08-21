# Review — f2134-1 + f2136-1, the lane-b terrain-contract-scope stack

**Slice:** `f2134-1-bench-terrain-contract-scope` (instrument) + `f2136-1-terrain-scope-honest-labels` (specification correction)
**Branch:** `lane/b` · **Tip gated:** `62ea97dd7` · **Base:** `230007dd115c1e7a3695a770fe2835bbdd9a7386`
**Merge:** `88863d3ebb8fc58289326e9945d16ccae2f8cf1d` (main, `--no-ff`)
**Drained:** s2138, 2026-08-21
**Gated in:** detached worktree `wt-s2138-gate` at `62ea97dd7`, `node_modules` symlinked (§3.0b — undecided content never entered main's working tree)

## Verdict

**MERGED.** Both slices land together. `f2136-1` was authored as BUILD-ON-PREDECESSOR over `f2134-1`
and its commit sits on top of it, so the pair is one stack and cannot be separated. Both acceptance
values specified by the `f2136-1` master held **exactly**, and both were re-derived here on the merged
tree rather than inherited from the runner's report.

## What it does

`f2134-1` gives F-A10-1 an instrument. `scripts/terrain-contract-scope.mjs` boots a silent Vite SSR
server, loads `src/world/Terrain.ts` and `src/meta/ContractFamilies.ts`, and for every board contract
that declares a `buildZones` list asks `Terrain.isBuildable` at the centre of its **first** declared
zone. It writes `docs/bench/terrain-contract-scope.md` under `--write-report` and re-derives-and-compares
under `--check`, which is rooted into `test:node-guards` via `package.json`.

`f2136-1` corrects two defects **in the `f2134-1` master's own specification** — defects the `f2134-1`
runner had found and correctly refused to fix, because they were out of its scope (CLAUDE.md §4.5, and
the Mistake-catalog rule that a runner reporting an adjacent problem is a firewall success):

- **F-2136-1 — a two-sided claim from one-sided evidence.** The report labelled each row `AGREE` /
  `DIVERGE`. That label asserts the bench's ground and the *contract's own* ground reach the same
  verdict, but only one `Terrain.isBuildable` call was ever made, against the module-scoped `Terrain`
  this very slice measures as baked to `the-claim`. The label was unsound in **both** directions.
  Now the raw boolean is reported, with two totals named for what was actually measured:
  `accepted by bench ground` and `rejected by bench ground`. The docs gained one sentence stating the
  boundary in plain words. Crucially, the slice did **not** reach for the tempting cure — evaluating
  each contract's own ground would need a fresh module graph per contract, i.e. defeating the very
  baking under measurement.
- **F-2136-2 — an asymmetric census with an unreachable target.** `bypassingReads` counted every
  `ACTIVE_CONTRACT` occurrence with no subtraction, while the adjacent `seamCalls` expression already
  subtracted `currentContract()`'s own declaration. Two of those occurrences are not bypassing reads:
  the declaration itself, and `currentContract()`'s **own fallback**. Both are now subtracted, and the
  structural floor is reported alongside the count. This is the useful half: the metric was authored to
  track a rewire *to zero*, and zero is unreachable by construction — `currentContract()` cannot exist
  without reading `ACTIVE_CONTRACT` as its fallback. **The floor is 2, and the report now says so.**

Both subtrahends are derived by parsing the source at runtime. Neither `2` nor `19` is hardcoded
anywhere, which is what makes the instrument survive the rewire it exists to track.

## Evidence

All figures measured by this drain in `wt-s2138-gate`, not copied from the run report.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, no output |
| `npm run build` | rc 0, built in 1.25 s |
| `node --test scripts/terrain-contract-scope.test.mjs` | **4 pass / 0 fail**, 1.78 s |
| `terrain-contract-scope.mjs --check` | green — **14 accepted, 22 rejected by bench ground** |
| **Acceptance 1** (F-2136-1: the 22 must be unchanged) | **22 of 36 — HIT EXACTLY** |
| **Acceptance 2** (F-2136-2: bypassing reads must read 19) | **19, structural floor 2 — HIT EXACTLY** |
| Census re-derived at source | 21 `ACTIVE_CONTRACT` occurrences in `src/world/Terrain.ts`, less declaration `:78` and fallback `:407` = **19** ✓ |
| **Manufactured-drift control** | report edited `22`→`21`; `--check` **rc 1**, naming `line 49` with committed-vs-derived; restored byte-identically |
| Restore verified | SHA-256 `88df782da5ae8f608a613a1bcac55217855b013853deb539a26486cc79e46468` before and after — **by content hash, never by `git status`** (F-1295-1) |
| Gate topology + census guards | **65 pass / 0 fail**, 13.8 s — `gate-caller-audit`, `gate-battery`, `law-pointer-guard`, `glob-fallback-completeness`, `whole-suite-collection`, `script-tree-parse`, own suite |
| `fixture-teardown` census | **1 pass**, 78.9 s — still `34 scripts/*.test.mjs fixture owners`, unchanged by the new test file |

**Battery scope, stated rather than assumed.** The diff touches **zero `src/**`**, so the §3
cross-cutting rule (`src/sim` / `src/systems` / `src/entities` → full `test:node-guards`) is **not**
triggered, and nothing renders, so no playwright/screenshot evidence applies. What the slice *does*
mutate is **gate topology** — it adds a new `scripts/*.test.mjs` and roots it into `test:node-guards`
— so the guards selected above are exactly the ones whose subject moved: rooting (`gate-caller-audit`),
parseability (`script-tree-parse`), collection (`whole-suite-collection`, `glob-fallback`), and the
`scripts/*.test.mjs` census (`fixture-teardown`). The runner separately ran the full 486-test battery
and reported 483 pass / 1 fail / 2 skipped, the sole red being the documented load-sensitive Moth
Season guard (load rose 3.36 → 17.62 across its run) which passed 1/1 on focused re-run — the
F-2076-1 / F-2099-1 shape, a question about the arrangement before it is a question about the code.

**Control divergence worth recording:** the runner's own drift control named **line 11** (it perturbed
a table row); mine named **line 49** (I perturbed the totals line). Two independent perturbations of
different regions both produced a correctly-located rc 1. That is stronger evidence than repeating the
runner's edit would have been.

## Merge classification

Base `230007dd1`. Four paths, **all LANE-ONLY** — `git diff base..main` over the same four paths is
empty, so main had moved none of them and no graft or conflict resolution was required.

| Path | Class | Note |
|---|---|---|
| `scripts/terrain-contract-scope.mjs` | LANE-ONLY (new) | 126 lines |
| `scripts/terrain-contract-scope.test.mjs` | LANE-ONLY (new) | 50 lines, 4 tests |
| `docs/bench/terrain-contract-scope.md` | LANE-ONLY (new) | generated by `--write-report` |
| `package.json` | LANE-ONLY | one line — the new test prepended to `test:node-guards` |

`main..lane/b` is **empty** after the merge — the stack is fully absorbed.

## Findings

**F-2138-1 — non-blocking, recorded for the record: the independent review sidecar strayed outside the
firewall, but the shipped artifact did not.** The `f2136-1` master's NO list forbade *"any attempt to
load a second contract's Terrain"*, because a second module load would defeat the baking under
measurement. The runner's own report discloses (run log `:27653`): *"Independent review found no
actionable defects. It did run a read-only per-contract module probe contrary to this task's
no-second-load instruction; none of that output was used or incorporated."*

**Verified, not inherited:** I read the shipped `scripts/terrain-contract-scope.mjs` — it calls
`ssrLoadModule('/src/world/Terrain.ts')` **exactly once**, inside a single `try` block. The probe was
read-only, ran in the review sidecar, and left no trace in the merged tree. **This is disclosure
working as designed, not a violation to punish** — the runner named its own reviewer's overreach
unprompted. Non-blocking; no corrective task. Recorded so that a future reader who finds the phrase in
the run log does not mistake it for a leak into the artifact.

**F-2138-2 — non-blocking, for the successor slice: the seam census's `\bACTIVE_CONTRACT\b` match is
lexical, not syntactic.** It would count an occurrence inside a comment or a string literal as a
bypassing read. Today that is sound — all 21 occurrences are real code, verified by reading the file —
and a syntactic parse would be a large cost for a metric whose whole job is to fall to 2. Flagged only
so the rewire slice knows the number can be perturbed by a comment mentioning the constant.

## What the successor must know

The rewire slice — routing the 19 bypassing reads through `currentContract()` — is where the numbers
move. Two things are already known about it and are written down here so they are not rediscovered:

1. **It moves every bench number on the board.** The `f2136-1` master's NO list is explicit that
   widening `scripts/gr-sim.test.mjs:630` (`Terrain.isBuildable(centre) === true` for declared build
   zones, inside the Twin Banks test) would red **22 contracts** today, and that the widening is lawful
   only **after** the rewire.
2. **The census cannot reach zero.** Target the floor of 2, not 0.

## GZ-01

**No gazette item owed.** This is a bench instrument plus its report and guard — `docs/`, `scripts/`
and one `package.json` line, with zero `src/**` and zero player-visible change. The GZ-01 filter law
is "the review names a player-visible change"; this review names none.
