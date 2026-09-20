# f1429-1 — the uninspectable-fixture signal becomes test-visible instead of player-fatal

- **Slice:** `f1429-1-uninspectable-fixture-signal` (ladders F-1429-1, filed s1429 while draining `f1428-2`)
- **Branch / tip:** `lane/m3` @ `b925d706` (runner auto-commit), lane base `7dc69e36`
- **Drained by:** s1431 fire, 2026-08-03
- **Gate tree:** detached worktree `gate-s1431` at main `3469946e` (§3.0b — undecided content never entered main's working tree)

## Verdict

**MERGE.** Both acceptance arms reproduced by me, in both directions, with a control run on clean
main that certifies the aim rather than inheriting the finding.

## What it does

`townLightDiagnostics()` audited the town's two light fixtures for the owner's F-BW-3 clause
(*"E1 town must read FLAME, never electric"*). `f1428-2` made that guard able to fire; its cure
threw when a fixture's material carried no `.color`. F-1429-1 measured the blast radius: that
function is reached from `publishDiagnostics()`, which has **no debug gate** and runs on the plain
town boot path — so the throw was a **player-facing hung boot**, not a diagnostic.

This slice replaces the throw with a counted `uninspectableFixtures` signal, surfaced on the
`lightGrammar` diagnostics object and asserted `0` in **both** beauty-town light-grammar blocks
(day and `?townDusk`).

### On the `return false` that looks like a firewall violation

The master's NO-list says *"Do NOT restore `return false` in the fixture filter"*, and the
implementation contains `return false`. **This is not a violation, and a reader grepping for the
string will think it is.** The prohibition targets a *bare, silent* discard — the F-1428-2 defect,
where a fixture left the denominator with nothing recording that it had. Here the `return false` is
paired with `uninspectableFixtures += 1`, and that count is asserted `0` by two specs. The fixture
remains *visible as such*, which is scope item 1's stated requirement. Loud to the specs, silent to
the player.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, 2.33s |
| `e2e/beauty-town.spec.ts` (own spec) | **6/6**, desktop + mobile |
| Adjacent suites (derived by grep, not from the master's list) | see below |
| Firewall | 2 files, **+9/−1**; `git diff` vs `lane/m3` **byte-identical** after all probes reverted |
| Merge classification | **LANE-TOUCHED only** — `git log 7dc69e36..main -- <both files>` **empty**; clean copy, no graft |

Every playwright command ran `--workers=1` per §3.1.

### Adjacent suites — derived by grep

`grep -rln 'town.dressing\|publishDiagnostics\|townDusk\|TownScene' e2e/` surfaced
`en-02-e1-coverage`, `gz-h1-newsie` and the beauty-town rig; run together with the master's named
`town-era-switch` and s1429's `town-ts-03-prop-ring`:

- **Merged tree: 29 passed, 1 failed** — `town-era-switch.spec.ts:153 › a missing E2 sibling falls
  back to base without errors` (mobile-chrome).

### The red was NOT attributable — proven by control, not by assertion

Re-running `:153` **in isolation** on clean main **passed**, which would have wrongly implicated the
slice: that run changed two variables at once (the slice *and* the batch load). Re-running the
**same 4-suite batch** on clean main:

- **Clean main: 28 passed, 2 failed** — `:153` **and** `:120`.

So `:153` reproduces without the slice (pre-existing), and `:120` reddened *only* on clean main.
Both reds are mobile-chrome inside a 4-suite batch and vary run to run — a load-dependent flake
ceiling, not a line defect, and **not** caused by this merge. Filed as F-1431-1.

### Acceptance arm A — the manufactured red

Probe (merged tree): force the first fixture's material colour to `undefined` in
`townLightDiagnostics()`.

```
-   "uninspectableFixtures": 0,
+   "uninspectableFixtures": 1,
  at e2e/beauty-town.spec.ts:50:38
```

Red on exactly the new field.

### Acceptance arm B — the boot survives (the half that matters)

In that same forced state the failure is a **clean `toMatchObject` assertion at line 50**, reached
only after lines 48–49 asserted and the town mounted. **No unhandled rejection. No timeout.**

**Control — identical probe applied to clean main's version, which still has the `throw`:**

```
[Unhandled rejection] Error: TownPropLanternGlow light fixture material has no color
    2549 | if (!color) throw new Error(`${fixture.name} light fixture material has no color`);
Test timeout of 90000ms exceeded.
Error: page.waitForFunction: Test timeout of 90000ms exceeded.
  > 173 | await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);
```

The town never reaches frame > 2 — it never finishes mounting, at a cost of 1.7m to the timeout.
This reproduces s1429's F-1429-1 observation exactly and shows the merged tree curing it. A guard
red on the broken tree *and* the fixed one would have proved nothing; hang-on-main /
survive-on-merged is what certifies the aim.

### Acceptance arm C/D — restored

`beauty-town` **6/6** both projects on the merged tree with no probe present; both probes reverted;
the two files verified **byte-identical to `lane/m3`** afterwards.

### Scope 4 — F-1428-2 is not re-opened, and the stated acceptance was wrong about the mechanism

The inherited acceptance expected one cool-white `lanternGlass` probe to report **2 at day and 2 at
dusk**. Measured:

| Probe | Day | Dusk |
|---|---|---|
| `lanternGlass` → `#eef2f4` | `coolWhiteEmissiveFixtures` **0 → 2**, RED | green |
| `lanternLight` → `#eef2f4` | green | `coolWhiteEmissiveFixtures` **0 → 2**, RED |

The denominator **is 2 at day and 2 at dusk**, but each site is reached by its **own** colour
source — `fixtureColor` resolves to `accent.lanternGlass` by day and `accent.lanternLight` at dusk.
A single `lanternGlass` probe can only ever red the day site. Both guards fire; F-1428-2 is intact.
`uninspectableFixtures` stayed `0` throughout, confirming the two signals are independent.

## Findings

- **F-1431-1** (new, non-blocking) — `town-era-switch.spec.ts` mobile-chrome is **flaky under batch
  load**: `:153` red in one 4-suite batch, `:153`+`:120` red in another, both green in isolation, on
  trees that differ only by an unrelated 9-line diagnostics slice. The suite passes when run alone,
  which is how the runner and prior fires saw it green. Worth a load-ceiling measurement rather than
  a line fix — same shape as the documented flake/ceiling distinction. **Do not "cure" it by
  loosening the assertions.**
- **F-1431-2** (new, non-blocking, documentation) — the scope-4 acceptance as written in the master
  ("2 day and 2 dusk" from one `lanternGlass` probe) is **not reproducible as stated**, because the
  dusk fixture colour comes from `lanternLight`. Any future master probing this guard must name the
  colour source per mood. Corrected in the table above.
