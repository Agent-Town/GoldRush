CODEX: model=gpt-5.6-sol effort=high
# f1453-1 — crossings hygiene: three latent traps closed, and the fourth deliberately left alone
**FIRE-AUTHORED (attended review welcome)** — s1453, 2026-08-04

ROLE: lane implementer. WORKDIR: this lane worktree (lane-d). One task, firewalled.

## READ FIRST (paths, not memory — read these before writing a line)
- `reviews/f1441-2-crossings-keep-their-z.md` §F-1448-3 / -4 / -5 — where the three findings were
  first written.
- `reviews/f1448-1-crossings-keep-the-hero-out-of-it.md` §F-1450-2 and §"F-1448-3 / F-1448-4 /
  F-1448-5 — carried forward" — where they were re-read against the merged code and confirmed.
- `src/entities/Enemy.ts` — `crossingData()`, `goalSideCrossing()`, `blockerSlideDirection()` and the
  blocker-resolution site that calls it twice.
- `src/world/Terrain.ts` — `resolveFordRanges()` and `fordRanges()`.
- `assets/contracts/epoch-1-frontier/contracts.json` — the six E1 contracts and their
  `tileParams.ford` / `tileParams.fords` / `tileParams.water.gravelBars`.
- `scripts/twin-banks-stall-census.mjs` — the census that is your acceptance instrument.

## WHY

Four findings were filed non-blocking against the crossings work and carried forward unfixed. Three
are latent traps worth closing while the code is small. The fourth is **not** hygiene, and this task
exists partly to say so with evidence.

## ⚠️ A CORRECTION TO THE REVIEWS THAT SENT THIS TASK (F-1453-1, measured s1453 — read this before
## you touch anything, because it changes what is safe to do)

Both reviews justify F-1448-4 as harmless with the same sentence — *"Harmless today (Twin Banks has
no fords in the relevant path)"*. **That premise is false, and it was measured false by reading the
contract, not inferred.** `e1-twin-banks` declares BOTH:

```
tileParams.ford  = true
tileParams.fords = [ {id:"west-ford", x:-16, halfWidth:3}, {id:"east-ford", x:16, halfWidth:3} ]
tileParams.water.gravelBars = [ {id:"west-mid-channel-bar", x:-7.5, …}, {id:"east-mid-channel-bar", x:7.4, …} ]
```

and `resolveFordRanges()` returns `[]` **only** when `tileParams.ford` is falsy, so
`Terrain.fordRanges()` has **length 2** on Twin Banks. Therefore in `goalSideCrossing`:

`  const crossings = fords.length > 0 ? fords : crossingData().crossings;`

the fords always win and **the two gravel bars can never be selected as a routing target on the one
map that has them.** Measured across all six E1 contracts:

| contract | `ford` | `fords` | `gravelBars` | `fordRanges().length` | |
|---|---|---|---|---|---|
| `the-claim` | true | 1 | 0 | 1 | |
| `e1-drill-yard` | true | 0 | 0 | 1 (default) | |
| `e1-dry-gulch` | **false** | 0 | 0 | **0** | ← the only fordless map (F-1448-3's live path) |
| `e1-night-shift` | true | 1 | 0 | 1 | |
| `e1-twin-banks` | true | **2** | **2** | 2 | ← the only both-map (F-1448-4's live path) |
| `e1-baron` | true | 1 | 0 | 1 | |

**The consequence for you:** Twin Banks is *both* the only map where F-1448-4 bites *and* the map
whose stall census (stalls **0**, reaching **70/70**, kills **202**) is the acceptance baseline for
all the crossings work. "Fixing" F-1448-4 by feeding the union to `goalSideCrossing` is therefore a
**routing behaviour change on the baseline map**, not a tidy-up — it would let enemies steer for a
bar at x≈±7.5 instead of a ford at x=±16. That may well be the right game, but it is a change that
needs its own census and its own before/after, and it is **out of scope here** (see NO).

ⓘ The bars are not dead — `resolverCrossingAt()` and `riverBlocksEnemyCrossingAt()` both consult
`crossingData().gravelBars`, so the bars still work as **passable water**. They are walkable but not
navigable. State it that way in your report; do not describe them as unused.

## SCOPE (three items; each must be provably behaviour-identical on all six E1 contracts)

1. **F-1448-5 — stop computing the two slide directions unconditionally.**
   `    const targetSlideX = this.blockerSlideDirection('x', moveTarget);`
   `    const targetSlideZ = this.blockerSlideDirection('z', moveTarget);`
   are evaluated on every blocker resolution, then discarded whenever the `e1-twin-banks` override
   below them applies. Make each one lazy so it is computed only on the branch that uses it.
   ⚠️ `blockerSlideDirection` is **pure** (it reads `this.gapBlockerId`, `this.gapWaypoint`,
   `this.group.position` and `avoidanceSide()`, and writes nothing) — verify that yourself before you
   rely on it, because laziness is only safe if it is true. **Do not change what the function
   returns**; only when it is called.

2. **F-1450-2 — give the crossing cache an explicit, tested invalidation seam.**
   `let cachedCrossingData: {` is a module-level `let` populated on first use and never cleared:
   `  if (cachedCrossingData) return cachedCrossingData;`
   Add a `resetCrossingData()` that clears it, and a comment binding its lifetime to the fact that
   `ACTIVE_TILE_ID` is an **import-time `const`** — i.e. today the whole module is frozen per page
   load and no soft contract switch exists, which is exactly why this is latent rather than broken.
   ⚠️ **Do not invent a contract-swap call site.** There is none; adding one is out of scope. The
   seam's consumer is your test, and the comment is there so a future soft switch has one obvious
   place to call.

3. **F-1448-3 — give the fordless speed fallback a principled meaning, and make a zero non-fatal.**
   `    speed: Terrain.sample(fords[0]?.centerX ?? 0, (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2).speedMul,`
   On a fordless map this samples **x = 0 at river centre** — an arbitrary point that is not a
   crossing. It feeds the `speedMul || (…)` fallback that governs whether an enemy on a gravel bar
   moves at all, so a `0` there would freeze enemies **on** the bar. Prefer, in order: a ford centre
   if one exists (unchanged for five of six maps), else a gravel-bar centre (an actual crossing),
   else the current x = 0. Then make a non-positive sample fall back to a sane speed rather than
   propagate. **On all six contracts today this must produce the same number as before** — the first
   branch is unchanged, and `e1-dry-gulch` has no bars so it still lands on x = 0. Show that.

## ⚠️ ACCEPTANCE: THIS SLICE MUST CHANGE NO BEHAVIOUR, AND A GREEN CANNOT PROVE THAT

Every item above is hygiene, so a passing suite is equally consistent with "correct" and "did
nothing measurable" — and *also* with "quietly changed enemy routing". The load-bearing evidence is
a **before/after census with identical numbers**, not a green:

- Run `node scripts/twin-banks-stall-census.mjs` on the **unmodified lane tree** first and keep the
  output. Then run it again on your finished tree. **Stalls, reaching and kills must match exactly.**
  Both transcripts go in the report. If any number moves, you have changed behaviour — STOP and
  report it rather than adjusting the census.
- For scope 3, additionally print the resolved `crossingData().speed` for all six contracts before
  and after, and show the six pairs are equal.
- For scope 2, a test that calls `resetCrossingData()` and proves the next `crossingData()` rebuilds
  (i.e. the seam actually works — a reset that resets nothing is worse than none).

## TOUCH-ONLY
- `src/entities/Enemy.ts` (the three seams above, nothing else)
- up to one new e2e or node spec for the scope-2 reset seam and the scope-3 speed table
- `artifacts/f1453-1/` for your evidence and both census transcripts

## NO (firewall)
- ❌ **Do NOT "fix" F-1448-4.** Do not change
  `  const crossings = fords.length > 0 ? fords : crossingData().crossings;`
  It is a routing behaviour change on the acceptance-baseline map (see the correction above), it needs
  its own census, and it is reserved for a successor task. Report anything you learn about it.
- ❌ **`blockerSlideDirection`'s body** — main's version is s1445's control-proven F-BW-10 fix for the
  owner's *"opponents get stuck"*. Do not restore any archived variant (F-1446-3). Scope 1 changes
  **when it is called**, never what it returns.
- ❌ `e2e/e1-twin-banks.spec.ts` and `e2e/gt-05-water-depth.spec.ts` — **these are the judges.** Do not
  edit them to make anything pass.
- ❌ `scripts/twin-banks-stall-census.mjs` — it is your instrument; changing it invalidates the
  comparison.
- ❌ `src/world/Terrain.ts`, the contracts JSON, water/terrain rendering, `Balance.ts`
- ❌ any change to `playwright.config.ts` (do not add or ignore specs there)
- ❌ adding a contract-swap call site for `resetCrossingData()`

## PRE-FLIGHT (LANE-SAFETY, run from the repo root of THIS lane worktree)
1. `git status --porcelain` — if any **tracked** file is dirty, STOP and report (see the churn
   exception below for the four `logs/` files, which do not count).
2. `node artifacts/f1453-1/verify-keys.mjs` — it prints one count per citation key and exits 0 only
   when **all seven are exactly 1**. Any other result means the lane is stale or the seam moved:
   **STOP and report, do not adapt.** (All seven were proved `=1` on main and again inside this
   refreshed lane at authoring time.)
3. Confirm `scripts/twin-banks-stall-census.mjs` exists and runs before you edit anything — its
   pre-change output is half your evidence and cannot be recovered afterwards.

## SELF-CHECK (name the suites; run both projects; `--workers=1`)
- `npx tsc --noEmit` clean · `npm run build` green.
- Twin Banks census **before and after, numbers identical** (the acceptance proof above).
- The six-contract `crossingData().speed` table, before and after, equal pairwise.
- The new reset-seam spec, desktop **and** mobile (390px).
- `e2e/e1-twin-banks.spec.ts`, `e2e/gt-05-water-depth.spec.ts` and the E1 map suites green both
  projects — derive the exact filenames by grep, do not guess — or each red fingerprint-matched to a
  KNOWN-RED with its inventory row quoted. ⚠️ `node scripts/red-inventory-lookup.mjs` answers this, but
  **`KNOWN-RED` is not exoneration** (F-1444-2): if your slice touches what the red touches, prove it
  on clean main too.
- Zero console/page errors on a plain boot with no `?debug`, desktop and 390px (Mistake #10).

## FACTORY-CHURN EXCEPTION (F-1407-1)
`logs/dashboard.html`, `logs/.goal-tree.html`, `logs/factory-usage.json`, `logs/task-stats.jsonl` and
`logs/usage-history.jsonl` are written by the factory's own tooling while you work. If they are dirty,
that is **not** your change and **not** a pre-flight STOP — leave them alone and do not commit them.

READY-FOR-GATES + report: both census transcripts side by side · the six-contract speed table before
and after · your verification that `blockerSlideDirection` is pure · what you learned about F-1448-4
without touching it · and anything you had to leave for the owner.
