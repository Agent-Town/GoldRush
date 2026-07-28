# Review — eight-winds-wiring-e2-enemies (E2 enemy diagonal wiring, slice 3)

**Slice:** `tasks/lane-c-eight-winds-wiring-e2-enemies.md` (authored s1187, `89b7239c`)
**Branch:** `lane/e2-arsenal` · **Tip:** `fe3ae8cb` · **Base:** `0b03545a`
**Drained:** s1188 fire, 2026-07-29
**Verdict:** ✅ **ACCEPTED AS A LAWFUL SCOPE-3 STOP.** No code merged; evidence merged. The slice is
**re-queue-blocked** pending an art correction — and the runner's own recommendation for that
correction is **insufficient as written** (F-1188-2 below).

## What it does

Nothing to the game — and that is the correct outcome. The master (s1187) pre-declared that the
row→heading mapping for the three E2 enemy `walkdiag4-a` sheets must be **derived from the cells**,
never assumed from slice 1's hero order, and that an ambiguous mapping is a **STOP, not a guess**,
because a wrong mapping renders backwards and **no test catches it**. The runner extracted all three
sheets, found Coal Thief's southern rows indistinguishable, reverted the contract to byte-identical,
removed the 51 unbound cells so they could not enter the lazy asset glob as dead bundle weight, and
stopped before binding. It shipped its reasoning plus one evidence board.

## Evidence

| Gate | Result |
|---|---|
| Merged content | **2 files, 0 lines of code** — `git show --name-only fe3ae8cb`: one run report, one PNG |
| `src/**`, `e2e/**`, `assets/**` touched | **none** — verified by `--name-only`, not by the report's claim |
| Character contract vs main | **byte-identical** (runner reverted; confirmed by the empty diff above) |
| `node --test scripts/*.test.mjs` (main, pre-merge) | **61/61, fail 0**, exit 0 — incl. `whole-suite-collection` |
| Runner-side baseline | collection `2418 tests in 337 files`, exit 0; build green; guards 61/61 |
| `drain-block-check.mjs` | ✅ CLEAR (`status="queued"`) — run **first**, per §3.0 |
| tsc / build | **not re-run and not required** — the merge introduces zero code; main's greens stand |

## Merge classification

Base `0b03545a`; both files are **pure additions** on paths main has never held (`artifacts/eight-winds-e2/`
did not exist on main). No LANE-TOUCHED/MAIN-MOVED conflict was possible. Grafted with
`git checkout lane/e2-arsenal -- <2 paths>`; path-scoped add.

## Findings

### F-1188-1 — Coal Thief's southern rows are ONE heading, not an sw/se pair. **CONFIRMED.** 🔺 blocking (art)

The runner's blocking claim, re-derived at the pixels rather than inherited. Instrument: silhouette
IoU over the magenta-keyed raw (`assets/raw/char-coalthief-sheet-walkdiag4-a.png`, 1252², 4×4,
cell 313), bounding-box aligned to remove translation, best-over-frame-pairs, compared **direct vs
mirrored**. A genuine sw/se pair must be *mirror*-dominant; a duplicate is *direct*-dominant.

Crucially, the instrument is calibrated against each subject's **own** mirror symmetry floor
(`IoU(row, flip(row))`), because a walking human silhouette is near-symmetric and raw mirror scores
alone carry no heading information:

| Coal Thief row pair | direct | mirrored | reading |
|---|---:|---:|---|
| **0 vs 1** | **0.863** | 0.671 | **+0.192 direct-dominant → SAME heading** |
| 2 vs 3 | 0.579 | **0.767** | −0.188 mirror-dominant → lawful nw/ne pair |
| 0v2 / 0v3 / 1v2 / 1v3 | ~0.60 | ~0.60 | inside noise (|Δ| ≤ 0.086) |

Subject symmetry floor = 0.588. The 0v1 direct score (0.863) is the **largest direct-dominance in the
whole batch** and exceeds both rows' own within-row frame-to-frame similarity — two frames from
*different* rows match better than two frames from the *same* row. Corroborated independently by
(a) direct visual read of the committed board — both rows show face + bandana + sack on the far side,
striding right — and (b) the runner's blind image-only review.

➡️ **The sheet cannot supply four distinct diagonal headings. The STOP was correct.**

**Narrowing the runner got wrong, in its own favour's opposite direction:** its report hedged row 3
("`ne`-intended, but prior art evidence also flags its front/back read"). **The pixels do not support
that hedge** — rows 2/3 are a clean mirror pair at −0.188. The defect is **confined to the southern
pair**, which makes the art correction smaller than the report implies.

### F-1188-2 — the runner's RECOMMENDATION is not safe to execute. 🔺 blocking (re-queue)

Its closing line: *"an art correction for Coal Thief's missing southwest row … followed by re-queueing
this wiring slice unchanged."* That presumes **Rail Tough and Steam Wrecker are correctly mapped**,
which the report asserts confidently (per-row evidence, incl. the Wrecker's amber porthole eye).
**I could not confirm it, and my instrument actively disagrees:**

- **Rail Tough** — all four *cross* pairs (0v2, 0v3, 1v2, 1v3) are **mirror**-dominant (−0.086 to
  −0.337) while **0v1 (+0.119) and 2v3 (+0.254) are direct**-dominant. Under the report's
  `[sw, se, nw, ne]` labels, 0v1 and 2v3 are exactly the pairs that *should* be mirrors. High-zoom
  inspection confirms rows 0,1 are front-facing and rows 2,3 back-facing (the report's front/back
  read is right), but row 1 appears to **flip horizontal heading mid-row** (frames 1 vs 3–4).
  ⚠️ **UNVERIFIED** — the Rail Tough may carry shoulder armour on *both* shoulders, which would void
  the costume-asymmetry tell I used. I did not resolve it and I am not asserting it.
- **Steam Wrecker** — **every** margin sits inside the noise band (|direct − mirrored| ≤ 0.095 against
  a 0.522 floor). The instrument returns **no information** about this sheet. That is *indeterminate*,
  **not "clean"** — and it is the sheet whose mapping the report was most confident about.

➡️ **Do not art-correct Coal Thief alone and re-queue.** The row-order premise must be established
for **all three** sheets first, by an instrument that can actually see heading. A wrong mapping ships
silently — the master says so, and that is precisely why this slice stopped.

## Where does the PLAYER see this?

Nowhere, by design — zero code merged, contract byte-identical, extracted cells removed. The three
E2 enemies keep their existing ACTIVE `walk4` blocks and render exactly as before this slice.
