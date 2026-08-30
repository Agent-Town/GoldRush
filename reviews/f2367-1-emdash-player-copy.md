# Review — f2367-1 em-dash player copy + guard scan-space widening

**Slice:** `lane-c-emdash-player-copy-and-guard-denominator` (leaf `f2367-1-emdash-player-copy-and-guard-denominator`)
**Branch/tip:** `lane/c` @ `937c301e1` · **base** `6a6c8b590`
**Merge:** `b4b65f0efaa135eb1be34a31661028206f702444` (main, `--no-ff`)
**Gated by:** s2371, detached worktree `gate-s2371/` at the merged tree, every playwright leg `--workers=1` (§3.1)

## VERDICT: MERGE

## What it does

Three player-read strings drop their em dashes for full stops: the lantern honesty banner
(`src/ui/LanternShow.ts`), the reel-divergence ending line (same file), and the run-suspend
rejection line (`src/game/RunSuspend.ts`). `e2e/agent-reels.spec.ts` moves its two assertions
to match. Then `scripts/no-emdash-guard.test.mjs` grows the arm the slice exists for: it scans
tracked `src` TypeScript for em dashes **outside comments** (via `ts.transpileModule` with
`removeComments`), carries an eight-file `SRC_EXCEPTIONS` allowlist each with a written reason,
and declares its scan space on stdout on every run.

The comment/string split is the correct reading of the owner ruling and is load-bearing: the
em dash surviving at `src/game/RunSuspend.ts:40` is a code comment whose own text says *"the
player never sees this"*. s2370 banked that divergence as F-2370-2; this gate confirms it —
the guard the slice ships agrees with the runner, by construction.

## Evidence

All legs on the merged tree in `gate-s2371/`, node v26.4.0, fire shell.

| Leg | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0, no output |
| `npm run build` | green, built in 1.35s, asset-diet 84%/87% cuts nominal |
| `node --test scripts/no-emdash-guard.test.mjs` | **1/1 pass**, 1077 ms; declares `263 scanned, 8 skipped` |
| `e2e/agent-reels.spec.ts` (own spec) | **2/2 pass**, 39.6 s, desktop-chrome + mobile-chrome (390px) |
| `e2e/tape-02-lantern-show.spec.ts` + `e2e/restore-validation.spec.ts` (adjacent) | **36/38 pass**, 1.9 m — 2 reds attributed to main, see F-2371-2 |
| `e2e/_s2080-f1742-1-boot-probe.spec.ts` + `e2e/f1297-2-plain-boot-tape-button.spec.ts` | **8/8 pass**, 1.2 m, zero console/page errors, both projects |
| Screenshots | `artifacts/lane-c-emdash/desktop-lantern-banner.png` (641,837 B), `artifacts/lane-c-emdash/mobile-390-lantern-banner.png` (322,195 B) |

`test:node-guards` was **not** run in full and is **not** owed: the diff touches no `src/sim/`,
`src/systems/` or `src/entities/`, so the §3 path rule does not mandate it. The one leg of that
battery the slice actually changes — `no-emdash-guard.test.mjs` — was run directly and is green.

### The new guard arm has teeth (proven by manufacturing, not by a green)

A passing guard never executes its violation path, so its green says nothing about its red.
Two variants on the merged tree, control asserting its own validity first (F-2215-1 — the
variant was confirmed to have changed the file before anything was believed):

| Variant | Result |
|---|---|
| em dash inserted into a **string literal** in `src/ui/LanternShow.ts` | **rc=1 RED**, and it names `src/ui/LanternShow.ts` |
| em dash inserted into a **comment** in the same file | **rc=0 GREEN** — comments correctly exempt |

Both restored byte-identical. The arm is not decoration, and its comment exemption is a
deliberate behaviour rather than an accident of the transpile.

## Merge classification

Base `6a6c8b590` (s2370's lock commit, 35 minutes old at drain time). Main moved 3 files since
base; the lane touched 6. **Intersection empty — all 6 LANE-ONLY, zero BOTH-MOVED.** No graft,
no hand resolution: `ort` merged clean in the scratch worktree and again on main, and the
commit merged is the gated commit itself.

| File | Class |
|---|---|
| `src/ui/LanternShow.ts` | LANE-ONLY |
| `src/game/RunSuspend.ts` | LANE-ONLY |
| `e2e/agent-reels.spec.ts` | LANE-ONLY |
| `scripts/no-emdash-guard.test.mjs` | LANE-ONLY |
| `artifacts/lane-c-emdash/desktop-lantern-banner.png` | LANE-ONLY |
| `artifacts/lane-c-emdash/mobile-390-lantern-banner.png` | LANE-ONLY |

## Findings

### F-2371-1 — the widened guard still certifies a corpus it never scans: `src/**/*.ts` misses the two files sitting directly under `src/`. NON-BLOCKING, cured in this fire.

The master's scope line 48 reads *"scan every tracked `src/**/*.ts`"*. The runner copied that
prose glob verbatim into a git pathspec — `git ls-files -z -- 'src/**/*.ts'` — and git's default
pathspec matching is wildmatch **without** `WM_PATHNAME`, so `*` already crosses `/` and the
literal `/` between `**` and `*` becomes a *requirement*: the pattern matches only paths with at
least two slashes after `src`. Files directly at `src/<name>.ts` never enter the subject set.

**Measured on the merged tree:** the glob returns **271**; tracked `.ts` under `src` is **273**.
The two missed are `src/main.ts` and `src/vite-env.d.ts` — the application entry point and the
global type surface, i.e. not obscure corners.

**Severity stated honestly and deliberately not inflated: LATENT, realised cost ZERO.** Both files
were checked with the guard's *own* predicate: all 7 of their em dashes sit in comments, so
`containsEmDashOutsideComments` returns `false` for both and the guard would have passed on them
anyway. Nothing is wrong in the tree today and no green was false.

What earns it a finding is that **the declaration cannot reveal it.** The master's line 52
demanded the scan space be printed precisely because *"a `0` over an unnamed corpus is
indistinguishable from a `0` over a corpus that excluded everything"* — and the printed line
`263 scanned, 8 skipped` is **true**, complete over the glob's 271, and silently omits the 2 the
glob never offered. The denominator is derived from the narrowed selection, so it is
structurally incapable of reporting the narrowing. That is this repo's recurring class one turn
further in: not a corpus that goes empty, but **a true declaration about a corpus narrowed at
selection time** — and it landed inside the slice whose own title is *"the guard stops
certifying a corpus it never scans"*.

**Cured in this fire** (separate commit, so the gated merge stays the gated commit): the subject
set is now `git ls-files -- src` filtered to `.ts`, which is self-extending and cannot miss a
depth, and the declaration names the true denominator. Guarded by
`scripts/no-emdash-scan-space-guard.test.mjs`, rooted in `test:ledger-guards`.

### F-2371-2 — two pre-existing main reds in `e2e/restore-validation.spec.ts`. NON-BLOCKING, not this slice's, filed for a later fire.

`restore-validation.spec.ts:658` *"active megaproject wrecker references survive strict
normalization and restore"* fails on **both** projects with
`root.hero.position.y: 0.14559222393281415 != 0.2763519114255905` — an `exact: false` where the
test expects `exact: true`.

Attribution was **proven, not assumed**, because the slice does touch `src/game/RunSuspend.ts`
and a hand-wave would have been worthless. A reverted-files control was run in the same
worktree, same shell, minutes apart: main's version of all four changed source files checked out
(the revert was confirmed to have actually changed all four before the arm was believed), same
test, same project. **The control reproduces the failure with byte-identical float values.** The
slice is exonerated.

This is a hero **Y-position** disagreement on restore; the slice changes one string constant and
cannot reach it. It is main debt and is **not** on s2370's known-red list (`engine-era-guard`,
`fixture-teardown`/F-2369-2), which was drawn from `test:node-guards` — nobody had run this
playwright suite on main recently. It is cheap and fire-authorable.

### F-2371-3 — the tracked review shots for this surface still show the old copy. NON-BLOCKING, cosmetic.

`reviews/shots-lantern-honesty/*.png` and `reviews/shots-tape-02/*.png` are tracked files that
the specs rewrite on every run, so they were modified in the gate worktree by this battery. They
were deliberately **left out of the merge** — the merge is the gated commit and nothing else —
which means the copies on main still depict the em-dash wording. Regenerating them is a
bookkeeping act for any later fire; the slice ships its own current evidence under
`artifacts/lane-c-emdash/`.
