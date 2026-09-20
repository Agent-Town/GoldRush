# f1473-1-crawler-dispose-tier-pin — drain review (s1476)

**Slice:** `f1473-1-crawler-dispose-tier-pin` (FIRE-AUTHORED s1475, master `tasks/lane-f1473-1-crawler-dispose-tier-pin.md`)
**Branch / tip:** `lane/a` @ `6e27050d1` ("crawlerpin: pin fallback disposal states")
**Base:** `59d0f4607` (merge-base with main) · main at drain time `64b1f684d`
**Gated in:** detached worktree `gate-s1476/` (§3.0b custody — undecided content never entered main's tree)

## VERDICT: MERGE — green in both projects, and the pin is proven load-bearing by a manufactured defect.

## What it does
Closes the GATE that F-1473-1 wrote for itself: until now `e2e/wire-crawler-3d.spec.ts` asserted
Crawler 3D disposal **only on the GLB-ready path**. The two fallback tiers — LITE (placeholder,
never fetches the GLB) and FAILED (invalid GLB bytes) — spawned, damaged and killed the boss with
**no assertion that the presentation was torn down**. This slice pins `data-crawler3d-state=disposed`,
`-source=placeholder` and `-mounted=false` after a full three-component kill on **both** fallback tiers.

The one structural change is the seam the master gave away up front: `destroyComponent()` unconditionally
called `awaitMounted()`, which asserts state `ready` on a 15 s timeout — unusable from a tier that
publishes `lite` or `failed`. It now takes an `awaitState` parameter defaulting to `'ready'`, so every
pre-existing caller is byte-unchanged in behaviour.

**TEST-ONLY.** Firewall held exactly: `git diff --name-status main...lane/a` = one file,
`e2e/wire-crawler-3d.spec.ts`, +11/−2. **Zero `src/` paths** — s1475's standing refuse-condition
("refuse the drain if `src/systems/CrawlerBossSystem.ts` moved at all") measured **0**. Because no
`src/sim/`, `src/systems/` or `src/entities/` path is touched, the F-1460-1 `test:node-guards` trigger
does **not** fire on this diff.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | clean |
| `npm run build` | green, built in 1.10s |
| `wire-crawler-3d.spec.ts` desktop-chrome + mobile-chrome, `--workers=1` | **6 passed (28.8s)**, re-run **6 passed (29.8s)** |
| Console / page errors | `expect(errors).toEqual([])` in all three tests — zero |
| Renderer baselines vs **control run on unmodified main** | **byte-identical** (see F-1476-1) |
| Merge classification | 1 file, LANE-TOUCHED only. Main moved only `STATUS.md` since base — **disjoint, no conflict possible** |

### The pin has teeth — proved by manufacturing the defect, not by a green
A passing assertion never executes its violation path, so its green says nothing about the red it
claims to guard (the s1299/s1300 standard). In `gate-s1476/` I injected the exact bug class F-1473-1
exists to catch — disposal wired **only** for the GLB-ready path:

```
src/systems/CrawlerBossSystem.ts:210
- if (components.size === 0 && this.crawler3dState !== 'disposed') this.disposeCrawler3d('disposed');
+ if (components.size === 0 && this.crawler3dState === 'ready')    this.disposeCrawler3d('disposed');
```

Result, desktop-chrome, `--workers=1`: **2 failed, 1 passed.**

- `:152 LITE keeps the placeholder …` — **RED** (`data-crawler3d-state` never reached `disposed`)
- `:168 invalid Crawler GLB bytes …` — **RED** (same, at `spec.ts:175`)
- `:114 mounts the Crawler GLB … and disposes on kill` — **GREEN**

That last line is the important one: **the pre-existing test is blind to the defect the new
assertions catch.** The coverage this slice adds is genuinely new, not redundant. Probe reverted;
`CrawlerBossSystem.ts` restored **byte-identical** (verified by content comparison, not by `git status`).

### Expected value was ruled in advance, and held
The master ruled the post-death value must be `disposed` on **every** tier — from the guard at
`CrawlerBossSystem.ts:210` plus `disposeCrawler3d(nextState)` assigning `crawler3dState = nextState` —
and that a differing measurement is a **FINDING, never a licence to edit the assertion**
(*a test that pins whatever happened blesses the bug it was written to catch*). Measured: LITE
`disposed`, FAILED `disposed`. No assertion was bent to fit an observation.

### Race check (raised and cleared by reading, before executing)
Inside the kill loop, `destroyComponent(id, 'lite')` asserts the tier state on **every** iteration
including the third — which looked like it should race against the crawler's own disposal. It does not:
the helper first sets the target component to **0.49 × maxHp** (alive), advances 0.1 s, and asserts the
tier state *there*; only afterwards does it blast the component to death. At every assertion point the
crawler is still alive, so `lite`/`failed` is the correct expected value, and `disposed` is asserted
only after the loop. No race, no flake — and the two independent 6/6 runs agree.

## Findings

**F-1476-1 — the committed renderer-count baselines are STALE ON MAIN, and this spec rewrites tracked
evidence on every run. NON-BLOCKING for this slice, proven by a control arm.**

Running the spec dirties 12 tracked files under `artifacts/wire-crawler-3d/` (10 PNGs + both
`renderer-counts-*.json`). The JSON deltas are substantive and uniform across **all five** phases —
desktop `coldBaseline` `calls 72→74`, `triangles 146026→147708`, `geometries 80→81`, `textures 32` ;
mobile `geometries 68→69`, `textures 31→30`; the same ±1 geometry / −1 texture shape in `mounted`,
`loadedBeforeKill`, `presentationBaseline` and `disposed`.

`coldBaseline` is measured in the **first** test — the one this slice never touches — which is what
prompted a control run rather than a verdict. Three-way comparison:

| Comparison | Result |
|---|---|
| control (pure main) vs committed baseline | **DIFFERENT** |
| merged (slice) vs control (pure main) | **BYTE-IDENTICAL** |
| merged (slice) vs committed baseline | different (inherited from main) |

➡️ **The slice causes zero renderer change.** The drift belongs to main — some earlier merge moved the
scene by one geometry and one texture and the retained baselines were never refreshed. s1475's standing
order asked me to confirm the baselines were "byte-unchanged"; against the *committed file* they are not,
and a fire that checked only that would have wrongly blocked this slice. Against the **control**, which is
the question that discriminates, they are identical.

**⚠️ CORRECTION, measured later in this same fire — the paragraph above this one was right, the cure I
first proposed was not.** My original recommendation was to "refresh the baselines in a commit that names
the main-side change responsible". I then tried to name it, and **for the `calls`/`triangles` component
there is no such change.**

I built the bisect harness and proved it constructible *before* scoping any work (the F-1475-1 lesson):
a detached worktree with the **instrument pinned and the subject varied** — today's spec +
`playwright.config.ts` + `scripts/external-server-guard.mjs` overlaid on each candidate commit, 14.4 s a
step. That third file matters: today's config requires the F-1457-1 guard that only landed 08-05, so
without it every old commit dies `MODULE_NOT_FOUND` — a harness that fails identically at all 1,092
commits and converges on an innocent one.

Then the predicate failed its own validation, both ways:

| commit | date | desktop `coldBaseline` |
|---|---|---|
| committed artifact | 07-25 | `calls 72, triangles 146026, geometries 80` |
| `513651740` | 07-31 | `calls 73, triangles 146028, geometries 80` |
| `265d585e8` | 08-02 | `calls 72, triangles 146026, geometries 80` |
| `265d585e8` **re-run, same shell** | 08-02 | `calls 73, triangles 146028, geometries 80` |
| main | 08-06 | `calls 74, triangles 147708, geometries 81` |

Non-monotonic, so bisect's precondition is violated — and the last two rows are the control that explains
why: **the same commit measured twice gives two different answers.** The ±1 `calls` / ±2 `triangles`
component is **noise, not drift**, and no commit can be blamed for it.

What survives as possibly real: `geometries 80→81` was stable at 80 across both runs at `265d585e8` and
reads 81 on main, as does the `+1682` triangle step. Those are **unattributed and not bisectable by this
predicate** — naming them needs a denoised statistic (n runs per commit, compare distributions), not a
byte comparison.

**The reusable lesson is bigger than this artifact: a number committed as "retained evidence" implies a
reproducibility it was never measured to have.** Every reader since 07-25 — including this review's own
first draft, and the standing order to confirm these baselines "byte-unchanged" — treated byte-equality as
the pass condition for a quantity that is not byte-stable.

Two owed acts, neither in this slice's firewall (test-only, single file):
1. **Do NOT refresh these baselines as a drive-by.** It would bless one sample of a noisy quantity as
   truth and restart exactly this misreading. Either re-characterise the counts with a measured noise band
   and record a tolerance, or stop writing them into the tracked tree.
2. **The churn itself** is the F-1407-1 artifact-churn class: any lane or fire that runs this spec is left
   with 12 dirty tracked files, which can trip a pre-flight's clean-vs-main test. Candidate cure is a
   scratch output dir under `GR_CAPTURE_*`, but note the standing warning that a scratch-dir override is
   *also* the one config that hides this defect.

**No other findings.** No unresolved runner findings; the runner's own report ("failed-state race …
delayed-response control passed 2/2", "GLB renderer baselines remain byte-identical") was re-derived
here rather than inherited — its baseline claim is true against the control, which is the reading that
holds.

## Merge
Path-scoped: `git add e2e/wire-crawler-3d.spec.ts` only. Goal leaf
`f1473-1-crawler-dispose-tier-pin` flipped to `merged` with the merge hash in the immediately following
commit (F-1384-1 two-commit sequence — a commit cannot contain its own hash).

**GZ-01:** no gazette item — test-only, nothing a player can see.
