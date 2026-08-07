# F-1510-3 successor — PRICING (s1516, 2026-08-07)

> ⛔ **CORRECTION, SAME FIRE — §2's PRESCRIPTION OF `__dirname` IS REFUTED. DO NOT FOLLOW IT.**
> The lane run this document priced STOPPED as a licensed negative result (`f9c0e498`, report
> `docs/bench/f1510-3-inventory-revision-metadata-negative-result.md`, review
> `reviews/f1510-3-inventory-revision-metadata.md`). Playwright loads this repo's TS config as **ESM**
> (`package.json:5` is `"type": "module"`), so **`__dirname` is undefined** and the mechanism
> serialised `revision: "unrecorded"`.
> **Why this document got it wrong (F-1516-1):** the probe in §2 ran in `/tmp/s1516-pw-probe`, which
> has **no `package.json`**, so its config transpiled to **CommonJS** where `__dirname` exists. The
> probe matched the subject on flags but **not on composition**, and validated the right mechanism
> through the wrong module system.
> ✅ **WHAT STANDS, and it is most of this document:** the *threading channel* is real and is now
> confirmed **twice, in two trees** — user-declared `metadata` keys ride into the JSON report verbatim
> alongside Playwright's injected `actualWorkers` (the failing run itself emitted
> `{"revision":"unrecorded","dirty":"unrecorded","actualWorkers":1}`, which is exactly that
> co-existence). §1, §3, §4, §5 and §6 are unaffected.
> ➡️ **The successor is SMALLER than the task this priced:** swap the directory source for
> `import.meta.dirname` (available on the pinned 26.4.0) or `fileURLToPath(import.meta.url)`, then
> re-run the JSON-reporter proof the runner has already built and documented.

The BACKLOG row's scope note ends: *"this is no longer the trivial one-line change this row was
filed as, because it reaches the run harness, not just the reducer — **price it before queueing
it**."* This is that pricing. Every number below was measured this fire; nothing is inherited.

**Headline: the scope note is HALF RIGHT, and the half that is wrong is the expensive-sounding
half.** The cure does reach the run harness — but the harness already has a metadata channel that
Playwright serialises verbatim into the raw report, so no sidecar file and no threading plumbing is
needed. Measured price: **~12 lines across 3 files**, plus test arms. It is a small lane task.

## The gate being priced

> **GATE (revised s1514):** closes when `logs/suite-red-inventory.md` names the commit THE SUITE RAN
> AT — which requires the revision to be captured BY the Playwright run and threaded alongside the
> raw report, then copied verbatim by the reducer. Deriving a revision while reducing is
> disqualified by construction.

## 1. The threading point already exists, and is already in use

`report.config.metadata` is present in the tracked snapshot and already carries a value:

```
config keys: [ argv, configFile, rootDir, ..., metadata, ..., version, workers, webServer ]
metadata:    {"actualWorkers":2}
rootDir:     /Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/e2e
configFile:  /Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/playwright.config.ts
```

`actualWorkers` is **Playwright-injected**, not repo-set — `node_modules/playwright/lib/runner/index.js:6092`
does `testRun.config.config.metadata.actualWorkers = …`. Note it **mutates** the existing metadata
object rather than replacing it, which is why user-declared keys survive alongside it.

The reducer already consumes it, with the exact degradation pattern the cure needs
(`scripts/suite-red-inventory.mjs:262`):

```
`- Harness: configured workers **${report.config?.workers ?? 'unrecorded'}**; actual workers
   **${report.config?.metadata?.actualWorkers ?? 'unrecorded'}**; …`
```

## 2. PROVEN by probe, not by reading source

A user-declared `metadata` block does survive into the JSON report verbatim. Minimal Playwright
project in `/tmp/s1516-pw-probe` (outside the repo, so no guard or suite could see it), config
declaring `metadata: { revision: <git rev-parse HEAD>, s1516Probe: 'threaded-from-config' }`:

```
rc = 0
  1 passed (193ms)
--- config.metadata as serialized by the json reporter ---
{
  "revision": "6e21f9831909b2e939b94561c90ffb3189a13cb8",
  "s1516Probe": "threaded-from-config",
  "actualWorkers": 1
}
```

`6e21f9831…` is exactly this fire's lock commit — so the value is a real sha captured at
config-evaluation time, and Playwright's own `actualWorkers` coexists with it rather than
overwriting it.

**Does this make the gate TRUE?** Asking the F-1514-1 question explicitly, conjunct by conjunct:

| Gate conjunct | Verdict | Why |
|---|---|---|
| captured BY the Playwright run | ✅ | the config is evaluated in the run's own process |
| in the tree that was TESTED | ✅ | `config.configFile` = `worktrees/lane-d/playwright.config.ts` — the config is loaded FROM the tested tree, so `__dirname` IS that tree |
| threaded alongside the raw report | ✅ | it is inside `config.metadata` OF the raw report |
| copied verbatim by the reducer | ✅ | same `?? 'unrecorded'` shape already shipping one line above |
| NOT derived while reducing | ✅ | the reducer copies; it computes nothing |

## 3. `git rev-parse` works from inside a linked worktree — measured, not assumed

That is the deployment condition (the suite runs in `worktrees/lane-*`, per `configFile` above):

```
worktrees/lane-d   sha=61892d1813f2 branch=lane/d   dirty=clean (0 entries)
worktrees/lane-a   sha=199e13c9eb8c branch=lane/a   dirty=DIRTY (3 entries)
.                  sha=6e21f9831909 branch=main     dirty=DIRTY (127 entries)
```

## 4. DESIGN CORRECTION, found by measuring: the dirty marker must be TRACKED-ONLY

s1513's scope note asked for a dirty/clean marker because *"a bare sha is a lie if the tree had
uncommitted changes when the suite ran."* Correct — but **which** dirt counts decides whether the
marker carries information:

```
.                  all=128  tracked-only=  8   => naive:DIRTY  tracked:DIRTY
worktrees/lane-d   all=  0  tracked-only=  0   => naive:clean  tracked:clean
worktrees/lane-a   all=  3  tracked-only=  2   => naive:DIRTY  tracked:DIRTY
```

Main carries **128** porcelain entries but only **8** tracked — the rest is untracked scratch and
logs, which are not part of the code under test. A naive `git status --porcelain` marker would
label nearly every run DIRTY and the field would mean nothing. Use
`git status --porcelain --untracked-files=no`.

## 5. HARD AUTHORING CONSTRAINT: do not move `playwright.config.ts:50`

`workers: isFireShell ? 1 : undefined,` sits at **line 50**, and **three baselined law pointers
cite that coordinate** (`scripts/law-pointer-baseline.json`):

```
scripts/fire.md                        -> playwright.config.ts:50
.claude/skills/drain/SKILL.md          -> playwright.config.ts:50
tasks/goals.json[calibrate-suite-workers-v2] -> playwright.config.ts:50
```

`scripts/law-pointer-guard.mjs` fingerprints every such coordinate, so **any line inserted above
:50 reds `test:node-guards`** — and the law surfaces it would rot are exactly the ones a lane runner
must not edit. This is the "your own cure rots the coordinates its evidence cites" class.

➡️ **The cure must not shift line 50.** Clean solution: put the `metadata:` key BELOW the `workers:`
line and declare the revision helper as a **`function` declaration at the bottom of the file** —
function declarations are hoisted, so it is callable from the object literal above it. A
`const rev = () => …` would NOT work (temporal dead zone) and would force the helper above :50.

Baseline before any change: `node scripts/law-pointer-guard.mjs` → `PASS — every law-surface
pointer still lands on the line it was written for` (26 pointers, 23 checked).

## 6. The raw input is ABSENT, so the cure cannot be proved end-to-end — use the fixtures

`logs/suite-red-inventory-raw.json` **does not exist on disk** (only the reduced `.md` and the
`-compact.json` are tracked). So no runner can regenerate the real inventory to demonstrate the
cure; a full regeneration needs a ~3 h Playwright suite run, which is not a lane task.

`scripts/suite-red-inventory.test.mjs` already synthesises raw reports — `fixture(t, config)` spreads
`config` into `report.config`, and the test at `:90` already passes `metadata: { actualWorkers: 3 }`.
That is the proof path.

⚖️ **Consequence, stated rather than glossed:** this task ships the MECHANISM and proves it by
fixture. The gate sentence closes on the **next real regeneration** of the inventory, which will
then carry the field. The row should therefore be marked cured-pending-regeneration rather than
closed by the drain — the same discipline that kept it open at s1513 rather than closing it on a
cure that satisfied its purpose but not its predicate.

## Measured price

| # | File | Change | Size |
|---|---|---|---|
| 1 | `playwright.config.ts` | `metadata: { revision, dirty }` below `:50` + hoisted helper at EOF | ~10 lines |
| 2 | `scripts/suite-red-inventory.mjs` | one provenance line copying `metadata.revision` | ~2 lines |
| 3 | `scripts/suite-red-inventory.test.mjs` | fixture arms incl. a manufactured-defect (absent → `unrecorded`) | ~25 lines |

No sidecar file. No change to the run harness beyond a config key. No new npm script (so no
`gate-caller-audit` rooting question).
