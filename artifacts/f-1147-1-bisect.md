# F-1147-1 palisade-budget bisect

Diagnosis only. This slice intentionally changes no `src/` or `e2e/` file; the protected budget assertion remains byte-unchanged.

## Scope 1 — reproduction

Command:

```sh
npx playwright test e2e/m2-04-gold-stealing.spec.ts -g "palisade line" --project=desktop-chrome --project=mobile-chrome --repeat-each=3 --workers=1 --reporter=line
```

Result: **5 failed / 1 passed** in 1.5 minutes, confirming the premise under the task's 5/6+ rule.

| Project | Repeat | Result | Failure line | `Received:` |
|---|---:|---|---|---|
| desktop-chrome | 1 | failed | budget assertion, current tree `:226` | `20.666666666666643` |
| desktop-chrome | 2 | failed | budget assertion, current tree `:226` | `20.333333333333336` |
| desktop-chrome | 3 | passed | — | no `Received:` emitted |
| mobile-chrome | 1 | failed | budget assertion, current tree `:226` | `20.333333333333307` |
| mobile-chrome | 2 | failed | `placeBuildableAt`, `:46` | `false` |
| mobile-chrome | 3 | failed | budget assertion, current tree `:226` | `21.666666666666643` |

The task calls the budget assertion `:227`; it is `:226` on the measured tree. The assertion text is identical and was not edited.

## Scope 2 — failure-line split

- Budget assertion (`:226` on the current tree): **4/6**
- `placeBuildableAt` (`:46`): **1/6**
- Pass: **1/6**

The budget failure dominates, so the bisect continued. The isolated `:46` failure remains a separate placement fault and was not treated as a bad bisect result.

## Scope 3 — bisect

Bisect runner: `scripts/tmp-f-1147-1-bisect.sh`. It exits `125` for build failures and for any Playwright failure that is not the `< 20` budget assertion.

Full `git bisect log`, verbatim:

```text
# bad: [385dea81180cb56d0a2a842e7c7dbbfee4bafbe6] s1147: author lane-c-m2-04-palisade-budget-bisect — the F-1147-1 regression gets an owner, DIAGNOSIS-ONLY
# good: [fb9e2c64fcabea101b325df2b9712c22ebc58fc9] feat(m2-07b): building-incentive tune (tasks/013) — global proportional repair costs on paid cost, sluice rent 2->3, stockpile reclaim +25%, shared pressure budget knob (default byte-identical), blast upgrade family + usage probe. Gates: m2-07b 8/8, m2-04 7/7, m2-05 7/7, m2-05b 5/5, tsc/build clean. One sanctioned harness fix (income-during-dwell race). Review: reviews/m2-07b-building-incentive-tune.md
git bisect start 'main' 'fb9e2c64'
# bad: [3de3432ce0e3b3481914a8741f34a95e0cf66f11] s620: lock ACTIVE — VERIFY-DRY re-confirmation sweep (22nd consecutive)
git bisect bad 3de3432ce0e3b3481914a8741f34a95e0cf66f11
# bad: [6c4d2696af0a5c5ee548260b95af2d5496290372] lore: THE NEWSIE ruled — new girl, different heritage (seed name Mei, renameable); kids-rule clarified (fictional youngsters fine in marketing)
git bisect bad 6c4d2696af0a5c5ee548260b95af2d5496290372
# bad: [6d8655f8cb8f68c3ade422bb7c0d65018758a494] s176 drain: e2 rail-entity + stamp-mill — lane/perf 3749f12 onto main (3-way; base 9c6b693). RailPath entity + stamp-mill megaproject manifest.
git bisect bad 6d8655f8cb8f68c3ade422bb7c0d65018758a494
# good: [371008a60488a213ee0e3a4678fb6fb38f18c5a2] s104: lock ACTIVE — no-drain triage (main slot 042 LIVE, dirty tree, no clean-main path) + bookkeeping
git bisect good 371008a60488a213ee0e3a4678fb6fb38f18c5a2
# bad: [4ad754175ce21c54c122814593f1d0392fac53dc] s134: bookkeeping — retire merged m4-10 done-moves (f85bc0b); commit stale e2e screenshot regen + dashboard (disjoint, non-code)
git bisect bad 4ad754175ce21c54c122814593f1d0392fac53dc
# good: [299940db6e23b7aa6ff2f2ea745ad49fcadeb7f9] fix: vfx layering — impact vfx render above ground decals (grenade explosions no longer hide under rubble, owner finding)
git bisect good 299940db6e23b7aa6ff2f2ea745ad49fcadeb7f9
# bad: [392a0da00776e3d50c5795ce4efaf652fb29bc9f] s128: lock ACTIVE — gate ungated main HEAD 3c74960 + pile-mode drain
git bisect bad 392a0da00776e3d50c5795ce4efaf652fb29bc9f
# good: [27f5b246d8962224ab894c5bfd026e7c52ec4b85] s61: drain review — 047 valves + W1-07 natural claim (38/38 + 43/43)
git bisect good 27f5b246d8962224ab894c5bfd026e7c52ec4b85
# bad: [14af714c59da5f011cee07b3da26500c2d3e4948] sci: meta-presence + the Elder Survey Chart — provenance badges, claim-remembers recap, pause meta panel, full tree overview w/ pin planner
git bisect bad 14af714c59da5f011cee07b3da26500c2d3e4948
# good: [74ce90d3ca76887ad861eea4a9c9e12cca7ba7ce] s126 handoff: NO DRAIN — 048 still-live main runner + hot attended (E1 build-out); pending pile grew to 4 commits/3 lanes; all deferred
git bisect good 74ce90d3ca76887ad861eea4a9c9e12cca7ba7ce
# good: [4e1d7ad7ae315f0bf59116d03ee839ea0f6f4621] sci: add Elder survey chart planner
git bisect good 4e1d7ad7ae315f0bf59116d03ee839ea0f6f4621
# bad: [9f6ec59d412028bae9f983a1e63cfc9d15e1b39c] runner(art): art-batch-011-e1-contracts.md
git bisect bad 9f6ec59d412028bae9f983a1e63cfc9d15e1b39c
# good: [a26eca0293d1a262971f8e6f7700e2323259e9cc] s127 handoff: NO DRAIN (8th contended) — 048 live main runner still owns dirty main + attended hot; pile grew to 5 commits/4 lanes (perf +dry-gulch new); all deferred
git bisect good a26eca0293d1a262971f8e6f7700e2323259e9cc
# first bad commit: [9f6ec59d412028bae9f983a1e63cfc9d15e1b39c] runner(art): art-batch-011-e1-contracts.md
```

`main` advanced through task/handoff commits while the diagnosis ran. No commit between the reproduced tip and the final reset changed `Enemy.ts`, `pools.ts`, `Balance.ts`, `Game.ts`, or this e2e spec, and `9f6ec59d` remains an ancestor of current `main`.

## Scope 4 — named commit and parent/child confirmation

- Commit: `9f6ec59d412028bae9f983a1e63cfc9d15e1b39c`
- Date: `2026-07-07T15:40:59+07:00`
- Subject: `runner(art): art-batch-011-e1-contracts.md`
- Parent: `a26eca0293d1a262971f8e6f7700e2323259e9cc`

The responsible hunk is in `ClaimJumperEnemy.update()` in `src/entities/Enemy.ts`. It adds a seeded lateral `spreadBiasX`/`spreadBiasZ` to every enemy's desired heading. The scripted south thief is the first pool spawn, so seed `0` produces a formation offset of about `-1.348`, clamped to `-1.2`. With no other enemy alive, the new formation-separation terms are zero; the lateral bias itself is the source change that affects this case.

Direct test confirmation, both built and run at the named revisions with desktop Chrome and `--trace=on`:

| Revision | Result | `Received:` |
|---|---|---:|
| parent `a26eca02` | passed | `10.33400000000001` |
| child `9f6ec59d` | failed | `20.59599999999999` |

The passing parent's value was recovered exactly from the trace's spawn/final `timeAlive` evaluations (`16.237439999046327` → `26.571439999046337`); Playwright prints no `Received:` line for a pass. The child value is Playwright's emitted failure value.

An in-page rAF trajectory probe of the same setup separated route behavior from Playwright's polling delay:

| Revision | Sim time to theft | Sampled path distance | X range |
|---|---:|---:|---:|
| parent `a26eca02` | `7.997` s | `18.648` | `0.000 … 3.256` |
| child `9f6ec59d` | `10.836` s | `19.423` | `-0.628 … 3.230` |

The child route takes `2.839` s longer (`35.5%`) and travels about `0.775` world units farther (`4.2%`). More importantly, its shape changes: the parent heads only toward the right end of the palisade, while the child first bends left to `x=-0.628` under the seeded formation bias, then crosses back around the right end. The exact test's `expect.poll` cadence amplifies that genuine route delay into the larger 10.334 → 20.596 observed jump.

## Scope 5 — classification and recommendation

**(a) REAL PATHING REGRESSION.** The route is measurably longer and slower, and its shape gains an unnecessary S-bend. This is not a `timeAlive` accounting change: the first bad commit changes enemy steering, not the fixed-step or spawn-frame clock, and in-page trajectory sampling independently observes the changed motion.

Recommendation: preserve formation spreading for ordinary groups, but do not apply its lateral lane bias to a solitary thief following an obstacle-aware holding route (or compose the bias before blocker routing so it cannot oppose the chosen detour). Gate that repair with this unchanged `< 20` assertion plus a direct route-shape check. Do not widen the budget; the regression is in steering, and the polling amplification should be handled only in a separately scoped harness-hardening change.

No repair was applied here: **zero `src/` changes and zero `e2e/` changes is the intended deliverable.**

## Final self-check

After `git bisect reset`, the lane was returned to the then-current `main` tip and the following final-tree checks passed:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | `rc=0`, `3.66 s` |
| `npm run build` | `rc=0`, `13.54 s` |

Staged diff stat:

```text
 artifacts/f-1147-1-bisect.md   | 127 +++++++++++++++++++++++++++++++++++++++++
 scripts/tmp-f-1147-1-bisect.sh |  28 +++++++++
 2 files changed, 155 insertions(+)
```

Only the diagnosis artifact and retained bisect runner are present. There is no `src/` diff, no `e2e/` diff, and `e2e/m2-04-gold-stealing.spec.ts` is byte-unchanged.
