# f1617-1 — saveData keeps the two bulk town halls cold (MERGED)

Slice: `f1617-1-savedata-town-trim` · branch `lane/c` · tip `f68738008` · merge `bbc35cc0b`
Drained by s1618, 2026-08-10.

## Verdict

**MERGED.** The slice cures F-1617-4 (the blocking finding that held f1615-1) and re-lands f1615-1's
functional surface verbatim on fresh main. Its own contract gate is green at the exact assertion that
reads 8/10 without it, and — the fact the merge actually turns on — it **strictly reduces** the
adjacent suite's red count in the same instrument, same shell, same hour: **33 red → 14 red**.

## What it does

f1615-1 (owner ruling, branch (a)) removed the `stamp-mill`/`dynamo_hall` exclusion from
`townPrefetchUrls()`, so the town prefetch set warms every town GLB. Correct on a normal connection —
but `AdvanceStream.ts` narrows prefetch to `priority === 1` targets under `saveDataEnabled()`, and town
IS priority-1, so the two bulk era-2 GLBs rode straight through the saveData filter onto metered
connections.

The trim lives in `src/assets/AdvanceStream.ts:30`: `townUrls(saveData)` filters
`/stamp-mill|dynamo-hall/` out of the town set **only** when saveData is on. Normal connections keep
f1615-1's full set unchanged. The runner chose this shape over an option on `townPrefetchUrls()` and
said so.

⭐ **The trim's regex is the contract's own regex, applied to the same URL strings.** `advance-stream.spec.ts:69`
asserts `prefetched.some((url) => /stamp-mill|dynamo-hall/.test(url))` is false; the filter tests the
identical pattern against the identical URLs. The pilot's id is `dynamo_hall` (underscore) but its path
is `assets/pilots/dynamo-hall-3d/dynamo-hall.glb` (hyphen) — checked, because an id/URL mismatch here
would have made the dynamo half of the trim a silent no-op. Coupling the filter to the assertion's own
pattern means the two cannot drift apart.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.17 s |
| `e2e/advance-stream.spec.ts` **UNMODIFIED** | **10/10**, both projects (21.8 s) |
| scope-4 `normal connections prefetch both bulk town halls` | **2/2**, desktop + mobile |
| `test:node-guards` | **correctly OUT** per F-1460-1 — zero `src/sim`, `src/systems`, `src/entities` |
| Firewall | 12 non-artifact files = the 11 salvage + `AdvanceStream.ts`; `advance-stream.spec.ts` untouched |

Salvage fidelity (scope 1): `git diff lane/a lane/c` over the eleven files = **1 file changed, +13** —
the scope-4 assertion, and nothing else. The salvage is verbatim. `lane/a` untouched at `914a7e93b`.

All gates run in a detached worktree (§3.0b) against a scratch dev server on **5199**, `--workers=1`
(§3.1), merge and commit as one act (F-1589-5).

## [F-1618-1] The adjacent suite is red on BOTH arms, and the slice makes it markedly less red

The ten `town-*-blender` specs read **14 failed / 70 passed** on the merged tree — against the runner's
`84/84` in the lane shell. That divergence is the fire shell's CPU ceiling (F-1269-1), not the slice,
and the way to read an unreliable instrument is to **compare arms, never absolutes**:

| Arm, same shell, same hour, `--workers=1`, ten specs | Result |
|---|---|
| **control** — main without the slice | **33 failed / 49 passed** (6.6 m) |
| **merged** — main with the slice | **14 failed / 70 passed** (11.3 m) |

The control's 19 extra failures are a **different class**: fast (2–4 s) assertion failures such as
`LITE tier always keeps the Chapel facade and never fetches the GLB`, whose error is
`expect([]).toEqual(["…/chapel-3d/chapel.glb"])` — main asserts *request*-laziness while prefetch warms
the GLB. That is exactly the pre-existing defect f1615-1's re-scope cures, and this merge cures it.

Every one of the merged tree's 14 remaining failures is the **p95 frame-time class** (e.g. chapel:
`p95 regression … p95Ratio 1.9647`, `16.7 ms` against a `9.775 ms` budget) — a timing measurement, not
an assertion about behaviour. **Not one is a prefetch, mount, distinct-request or console-error
assertion.**

⚠️ **I twice reached a wrong reading here and both corrections are worth recording, because each came
from a probe that was still carrying load it did not look like it was carrying.**
1. First read: "load ceiling, proven" — from tavern desktop passing alone (**8.2 s**) after failing in
   the batch (17.6 s). True, but one test.
2. Second read: "reproducible slice-attributable regression on stamp-mill mobile" — from a per-spec
   probe that reported RED. **Wrong**: that probe ran the *whole* spec, both projects, including the new
   prefetch test that downloads both bulk halls, so the measurement was still loaded. Run genuinely
   alone, stamp-mill mobile frame-time is **3/3 GREEN on the merged tree (7.5 / 8.2 / 8.3 s)** against
   the control's **7.3 s** — the arms agree and the regression evaporates.

💡 **Reusable: "in isolation" is a property of the MEASUREMENT, not of the command.** A single-spec
invocation is not an unloaded measurement when the spec contains six tests and one of them fetches two
bulk GLBs. Narrow to the single test before concluding anything about a timing gate.

**GATE: none owed to the owner.** The p95 sites are the known bimodal class s1616's handoff warned
must be *read* rather than trusted; the reading is now done and recorded here, on both arms.

## [F-1618-2] non-blocking — the fire shell cannot adjudicate a p95 gate at all

An instrument that reds **33 of 82** on an untouched control cannot settle a 2-test difference between
arms. Frame-time gates are only trustworthy in the lane shell (F-1269-1: 7.53× vs 3.47× at eight
children). Fires draining these suites should gate on the **assertion** classes and compare red *sets*
across arms, exactly as done here, rather than chase an absolute green they cannot obtain.

## Carried forward, still unverified (inherited from the f1615-1 review, not re-derived here)

- Runner's `240/246` at `--repeat-each=3` and its `22/28` adjacent tally — unconfirmed drain-side.
- The mobile asset-diet growth of **~1.9 MB** flagged in the f1615-1 review as possibly sharing
  F-1617-4's cause. The trim only changes the **saveData** path, so it cannot have moved the normal-path
  mobile figure; that number is still owed a look on a lane-shell gate.

## Merge classification

`main..lane/c` = 1 commit `f68738008`, **124 paths**, all LANE-ONLY. Functional surface 12 files
(+45/-71); the remaining 112 are regenerated `artifacts/**` evidence, which is never byte-identity
gated (F-1266-1). Main had not moved any of the twelve since the lane's base — no three-way graft
needed, merge applied clean.

## Runner conduct

Exemplary. It verified the salvage before trimming (`11 files, +28/-68`, exclusion grep `0`), stated
which trim shape it chose and why, left `advance-stream.spec.ts` unmodified as scope 3 demanded rather
than re-scoping the assertion to fit (Mistake #14), added the positive-direction assertion scope 4
asked for, and never wrote to `lane/a`.
