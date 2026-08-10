# f1636-1 — the same-game audit measures buildable parity again

**Slice:** f1636-1-same-game-audit-independence · **Branch:** `lane/a` · **Tip:** `4207fd1e723acaa908e7e1b3d81f1d6b6ee211ed`
**Merge:** `fef46f6877054fadf9d282026eb695a44a686fbb` · **Follow-up cure:** `d1e360155` (F-1638-1)
**Drained:** s1638, 2026-08-10 · gated in detached worktree `gate-s1638` (§3.0b)

## VERDICT: MERGED — the guard has teeth, and I proved them myself rather than inherit the runner's arms.

## What it does

ap16-1 correctly unified both engines onto one buildable rulebook, but in the same commit it rewrote
the audit so `doorAccepts` and `browserAccepts` were the *same helper*. Every buildable row then
compared a value to itself: `equal 840`, `diverging 0`, structurally, forever. The guard ap16-1
installed asserted exactly that tautology, replacing a real assertion — a green that could not go red.

This slice restores independence. One side of each buildable row is now the **real browser predicate**
(`Game.ts :: isBuildableEnabled`, extracted from source and executed), the other the **real headless
predicate** (the `(id) => offeredBuildables.has(id)` expression passed into `BuildSystem`). Both read
`mechanicsBuildableIds` imported from the actual TypeScript through Vite's SSR loader — no third
hand-written copy. Two wiring anchors throw loudly (`Browser buildable source wiring changed`,
`Headless buildable source wiring changed`) if either engine's plumbing moves, so the bridge cannot
drift silently into agreement.

`agentCanEnter` gates the agent side again, so a contract the headless sim cannot enter no longer
reports buildable parity while the verb rows of the same document call it unreachable.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.28 s |
| `npm run test:node-guards` | **rc=0**, 5 skipped, 396.0 s (run ALONE, per the battery law) |
| adjacent `task-025` + `m1-01` + `m2-01` | **32/32** desktop + 390px |
| plain boot `_s106-prospector` + `f1297-2-tape-button` | **4/4**, zero console/page errors |
| Playwright flags | `--workers=1` throughout (§3.1), scratch port 5234, external server serving the gate tree |
| Classification | 3 paths, **all LANE-ONLY**; main untouched since base `f0f2e450` — no graft |
| Post-merge `main..lane/a` | empty |

### Teeth proven by manufacturing the defect (s1299/s1300 standard) — re-derived, not inherited

Forced `isBuildableEnabled` to `return false` by **file edit** in the gate worktree (never through a
shell-quoted probe):

```
✖ same-game audit measures reachable browser and headless buildables independently
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  76 !== 0
```

Reverted; `sha256(Game.ts) = 4ac2949d922660eda6d3c8ceb5709f0e3d5cd884098a541a5cf2a16500e35d8d`,
byte-identical — **and identical to the hash in the runner's own GREEN arm**, which independently
corroborates that its restoration was clean too. Guard green again, 3/3.

The RED figure `76` reproduced the runner's report exactly. I also measured the assertion's
**denominator** rather than trusting that it has one: 420 browser-menu rows exist, 120 of them belong
to the 12 reachable contracts, and those 120 are what the assertion ranges over. It is not vacuous.

### Counts re-derived from the merged tree

| Surface | Before | After |
|---|---|---|
| buildable | equal 840 | **equal 480 · agent-lacks 360** |
| ability | equal 12 · agent-lacks 114 | unchanged |
| choice | agent-lacks 294 | unchanged |
| economy | equal 12 · agent-lacks 72 | unchanged |
| verb | equal 12 · agent-lacks 324 | unchanged |

The 360 re-opened buildable divergences are **the correct result, not a regression**: 30 of 42
contracts cannot be entered by the headless sim, and 30 × 12 buildables = 360. The document has
stopped contradicting itself — its verb rows have said `agent-lacks 324` about that same gap all along.

## Findings

**F-1638-1 — a generated report's citations rot at MERGE time, and no guard sees it. CURED in `d1e360155`.**
The lane generated `docs/bench/same-game-audit.md` against a base predating SEA-1. SEA-1 added +5
lines to `functions/api/standings.ts`; the instant this merged, every evidence cell pointing into that
file was five lines short — **252 cells reading `standings.ts:656` where the merged tree says `:661`,
across 630 differing lines of a 1708-line report.** The runner did nothing wrong: its report was
correct on its own base. The defect is a property of the *interval* between generation and merge.

I caught it only because I regenerated the doc on the merged tree and byte-compared instead of
accepting the committed file. `same-game-audit.test.mjs` asserts the markdown's **shape** (headings,
table header) and never that the committed file matches current output, so a stale report is invisible
to the battery that ships it — the same class as "a new guard is invisible to the battery shipping it".

Cured by regenerating in place (byte-identical to generator output, sha256 `9add69ee…`).
**Non-blocking, but the class is open:** a freshness assertion would catch every future instance, at
the cost of reddening unrelated drains that shift any cited file. That trade needs a judgement call
about where the red should land — proposed as a corrective, not taken unilaterally this fire.

**F-1638-2 — the bridge executes source text through `Function()`, which is a real fragility with a
real mitigation.** `browserPredicate = Function('id', browserBody)` takes the *body* of a TS method by
string slicing and evaluates it as JS. It works because the method is one line of plain JS
(`return this.offeredBuildables.has(id);`) with no TS syntax. The moment anyone adds a type annotation,
an optional chain on a typed field, or a second statement referencing another member, this either
throws or — worse — silently mis-measures. The two wiring anchors reduce the blast radius (they throw
on plumbing changes), and the alternative bridges the master offered were weighed and rejected in the
runner's report. **Non-blocking, recorded so the next reader knows why an audit script contains
`Function()`**, which otherwise reads as a mistake.

**Scope 5 honoured:** ability and choice rows untouched; ap16-2 (lane-d) and ap16-3 (lane-c) work not
pre-empted. ✓ VERIFIED by the unchanged counts above.
