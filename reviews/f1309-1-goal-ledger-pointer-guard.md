# f1309-1 — goal-ledger pointer guard

- **Slice:** `f1309-1-goal-ledger-pointer-guard` (master `tasks/lane-a-f1309-1-goal-ledger-pointer-guard.md`, FIRE-AUTHORED s1309)
- **Branch / tip:** `lane/m3` @ `157e47c7` — one runner commit
- **Merge base:** `d19a6f7b`
- **Drained by:** s1310, 2026-08-01
- **§3.0 drain-block-check:** ✅ CLEAR under `--strict`, matched BY NAME (`f1309-1-goal-ledger-pointer-guard`, status `queued`)

## VERDICT: MERGE — but the runner was right to stop short of READY-FOR-GATES, and completing it took a fire-side ledger fix it was firewalled from making.

The runner delivered the guard and its test, then **declined to baseline**, reporting that `main` carried a
newly-rotted pointer it was forbidden to correct (`tasks/goals.json` is an explicit NO in the master).
That was the correct call, and it is the reason this drain has content beyond a rubber stamp.

## What it does

`scripts/law-pointer-guard.mjs` gains a **second source class** alongside its six text `SURFACES`: it walks
`tasks/goals.json` and extracts `file:line` pointers from `blockedReason` on **non-terminal leaves only** —
the text `scripts/drain-block-check.mjs` prints to a fire at §3.0, the first command of every drain.

Faithful to the master's three scoping constraints, each of which s1309 had *measured* rather than guessed:

- Terminal statuses are **re-derived from `drain-block-check.mjs`'s own source** (`TERMINAL_SHIPPED_STATUSES`
  + `TERMINAL_CLOSED_STATUSES`), not retyped — so the guard's denominator cannot drift from the gate's.
  `drain-block-check.mjs` was **not modified**; the runner parses it rather than needing the `export` the
  master permitted. One less file in the blast radius.
- The walk concatenates **both** `subgoals` and `tasks` on every node — the six-nodes-carry-both trap that
  cost s1309 95 of 501 leaves on its first pass.
- Historical `note`-field pointers on merged leaves stay **out** (~493 of them). Adding `goals.json` to
  `SURFACES` wholesale was measured by s1309 at **497 new reds** and reverted; this is the scoped alternative.

Pointer ids carry the leaf: `tasks/goals.json[<leaf-id>] -> <file>:<line>`, so a red names the leaf a reader
must go fix. `KNOWN_ROTTEN` grandfathers rf-34's deliberately-unrebased coordinate **by full id with its
reason**, and reports it in its own `known-rotten` state — never silently as `ok`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, built in 1.96s |
| `node --test scripts/law-pointer-guard.test.mjs` | **10/10 pass**, 580 ms (incl. new fixture case + `THE REAL TREE` case) |
| `test:node-guards` — `node --test` arm (37 files) | **198/198 pass**, 0 fail, 39.7 s |
| `test:node-guards` — `test-ticker-stats.mjs` | passed (8 checks) |
| `findings-state-guard` | **PASS** — 192 subjects / 148 closed / 44 open / **0 double-state** |
| `blocker-panel-closed-guard` | **PASS** — 204 census-closed, 0 on panel |
| `ruling-propagation-guard` | **PASS** — 3 RULED / 20 refusals / 0 stale |
| `drain-block-check --all` (negative control) | **4 BLOCKED**, unchanged — a guard changed, not a gate |
| `law-pointer-guard` before (main) | 6 surfaces / 14 pointers / 12 checked / 2 illustrative — PASS |
| `law-pointer-guard` after (merged) | **7 surfaces / 19 pointers / 16 checked / 2 illustrative / 1 known-rotten** — PASS |

**No playwright, stated rather than skipped silently:** the merge touches two `scripts/*.mjs` files and
`tasks/goals.json`. Zero `src/`, zero `e2e/` bytes ship in this drain — `git diff --stat` over `src/`,
`e2e/`, `index.html`, `vite.config.ts`, `package.json` is **empty**, so there is no runtime surface to drive
and a browser green would have been about the harness, not the slice.

### The acceptance bar was a manufactured red, and both arms were rebuilt here — not read

The master's slice 4 forbids accepting a green: *"a passing guard never executes its violation path."*

- **Fixture arm** — `GOAL LEDGER ROT: a live non-terminal blockedReason pointer moves -> red names the leaf`:
  baseline rc 0 → insert a line above the cited coordinate → **rc 1**, output matches `/POINTER DRIFT/` and
  `/tasks\/goals\.json\[ledger-leaf\]/`. Passes.
- **Live-tree arm (re-run by this fire, not inherited)** — inserted one comment line above
  `src/game/RunSuspend.ts:837`, which only the ledger cites, isolating the new code path:

```
FAIL — 1 pointer problem(s):
  POINTER DRIFT tasks/goals.json[rf-34-hero-y-restore-roundtrip] -> RunSuspend.ts:837
      was: "game.syncHeroVisualHeight?.();"
      now: "// s1310 TRANSIENT PROBE — reverted in the next command"
EXIT CODE (drifted tree): 1
```

  Reverted with `git checkout --`; `git diff` and `git status --porcelain` on that path both **empty**;
  `EXIT CODE (reverted tree): 0`.

### Baselined by eye — every line opened and read before `--update`

| pointer | line now holds | supports its claim? |
|---|---|---|
| `[e1-hold-the-claim] -> src/game/Game.ts:6600` | `private endRun(): void {` | ✓ the defeat path |
| `[rf-34] -> reviews/rf-34.md:28` | `- **Exact first divergent write:** \`Game.ts:6669\`, reached from \`RunSuspend.ts:837\`.` | ✓ the provenance line |
| `[rf-34] -> src/game/RunSuspend.ts:837` | `game.syncHeroVisualHeight?.();` | ✓ hero-visual-height restore, the rf-34 subject |
| `[calibrate-suite-workers-v2] -> playwright.config.ts:50` | `workers: isFireShell ? 1 : undefined,` | ✓ the line its pre-flight STOPs on |

## Merge classification

`git diff --stat d19a6f7b main` over the firewall paths is **empty** — **zero MAIN-MOVED**. Both files are
**LANE-TOUCHED only**, so the graft is a clean path-scoped checkout, proved **byte-identical to the lane tip**
(`git diff lane/m3 -- <both files>` empty). 108 insertions / 29 deletions in the guard, 37 / 1 in its test.
`tasks/goals.json` and `scripts/law-pointer-baseline.json` are **fire-side additions in the drain commit**,
not lane content — see F-1310-1.

## Findings

### F-1310-1 — s1309's re-based pointer was invalidated by s1309's OWN finding row, in the same commit. And it is a class, not an accident: 2 of 2 BACKLOG line-pointers in the ledger were rotted.

The runner's stop reason, **verified at source rather than inherited**:

- `tasks/BACKLOG.md:1709` — the coordinate s1309 wrote for the owner's banking quote — resolves to a
  **blank line**. The quote is at `:1711`.
- Cause, established by reading the commits rather than guessing: at `1cd97769` (s1309's parent) the quote
  **was** at `:1709`. s1309's cure commit `f3b6a5fa` wrote `:1709` into `goals.json` **and in the same
  commit prepended a 2-line F-1309-1 finding row at BACKLOG line ~21**, pushing the quote to `:1711`.
  BACKLOG went 2238 → 2240 lines. **The pointer was wrong before the commit that created it had landed.**

This is not carelessness. s1309 read the file and recorded what it saw correctly; **the act of recording the
pointer moved the thing pointed at.** The general property, measured across the last 25 commits touching
BACKLOG (2206 → 2240 lines, growth at the **top**): findings are *prepended*, so **every deep BACKLOG
coordinate rots on every fire that files a finding**. A line coordinate into that file is not decay-prone —
it is unmaintainable by construction, and guarding it would produce a red every fire, which is precisely how
`--update` degrades into the rubber stamp the master warns against.

**Cured, both instances, by content anchors rather than re-basing** — the quote is already inline in the
`blockedReason`, so the line number added nothing a grep cannot do better and cannot rot:

1. `e1-hold-the-claim-defeat-fork`: `tasks/BACKLOG.md:1709` → cite-by-content, with the history recorded.
2. `vp-02e-jumper-8way-activation`: **the fifth rotted pointer**, which s1309's §G(2) anticipated as a
   finding to land rather than wave through. `BACKLOG:1557` had drifted **571 lines** — `:1557` holds a
   worktree table row about `map-fix-early`; the real `GATE: owner picks (a) or (b)` line is at `2128`.

### F-1310-2 (informational, no work proposed) — the guard's documented blind spot is load-bearing, and it hid the worse of the two rots.

F-1310-1's second instance was invisible to `law-pointer-guard` and would have stayed invisible after this
merge: `BACKLOG:1557` is **extensionless shorthand**, and the `POINTER` regex requires a real source
extension. The guard's own header names this gap honestly (`"v2:76/v3:137"`, *"a guard that guesses is worse
than a guard with a documented blind spot"*) — that reasoning is sound and I am **not** proposing to widen it.

Recorded so the gap is not mistaken for coverage: the ledger's remaining pointer is now content-anchored, so
nothing rotten hides behind it today, but **a future `blockedReason` written as `BACKLOG:NNNN` would be
silently unguarded**. The durable answer is the convention this drain establishes — *cite BACKLOG by content,
never by line* — not a regex that guesses which file `v3` means.

## Notes for the next fire

- The **negative control matters more than the greens here**: `drain-block-check --all` still returns
  **4 BLOCKED** with all four owner gates' substance intact. This drain changed a guard and repaired two
  citations; it lifted nothing.
- `scripts/law-pointer-baseline.json` now carries **16** fingerprints (was 12). The four new ones are the
  ledger pointers in the table above, each opened and read before `--update` was run.
