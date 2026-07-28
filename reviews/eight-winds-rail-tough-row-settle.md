# Review — `lane-c-eight-winds-rail-tough-row-settle`

- **Slice:** settle the Rail Tough diagonal `2v3` disagreement with a non-silhouette instrument
- **Branch / tip:** `lane/e2-arsenal` @ `44efb1f3be79caca73c3c95cb6f205b70275848f` ("docs: settle Rail Tough diagonal row pair")
- **Base:** `main` @ `71f55aa5` (the lane refreshed itself off that tip; a false-ahead SAFE DUPE was re-derived and reset, per its own report §"Lane safety")
- **Drained by:** s1191 fire, 2026-07-29
- **§3.0 `drain-block-check`:** ✅ CLEAR — run **first**, before any classification or opinion

## Verdict: **ACCEPTED**

The question was settled, and it was settled by the experiment the master pre-declared as decisive — not by re-running the louder instrument.

## What it does

s1189's row-order survey left Rail Tough diagonal rows 2 and 3 as `UNCERTAIN`/confidence `NONE`, because two instruments gave opposite answers: the **bodies** read as an `nw`/`ne` mirror pair, while the **`2v3` IoU was direct-dominant (+0.248)**, which reads as *the same heading twice* — a duplicate row. s1190 authored this slice around the hypothesis that **the silhouette was the thing that was wrong**: every instrument used so far discards all but the outline, and the Rail Tough is the one character of the three carrying a large one-hand prop, so mirroring a true body heading would align the bodies while throwing the wrench blob onto the **opposite** side — deflating the mirrored score and inflating the direct one.

This run built a **non-silhouette** wrench locator (two interior metal landmarks — the wrench root at the gripping hand and the open-jaw centre — against a blue-coat-interior body centroid), published a visual validation board showing every landmark **before** any verdict, masked the prop, and re-ran the same floor-calibrated IoU. **The `2v3` score flips from `0.706 direct / 0.456 mirrored` to `0.705 direct / 0.832 mirrored`.** The duplicate-row hypothesis is dead: rows 2 and 3 are a lawful `nw`/`ne` mirror pair.

Net effect on the E2 art request: **4 regenerated rows across three sheets**, down from the "3 or 4 Rail Tough rows alone" fallback the master had banked.

## Evidence — every published number RE-DERIVED, not read

I re-ran `logs/s1190-rail-tough-wrench-probe.mjs` on the merged tree rather than trusting the report's tables.

| Measure | Report claims | s1191 re-derived | Match |
|---|---|---|---|
| `2v3` **wrench included** | `0.706 / 0.456`, Δ **+0.250** | `0.706117 / 0.456002`, Δ **+0.250115** | ✓ |
| `2v3` **wrench excluded** | `0.705 / 0.832`, Δ **−0.127** | `0.705447 / 0.832448`, Δ **−0.127001** | ✓ |
| Subject self-mirror floor | `0.452` | `0.4524952` | ✓ |
| Mask sensitivity (shaft 10/12/14 × jaw 20/22/24) | 9 cases, all mirror-dominant, Δ `−0.118 … −0.127` | **9/9 mirror-dominant**, Δ range `−0.1176 … −0.1270` | ✓ |
| Diagonal wrench side, rows 0/1 | screen-**left** (control) | row 0 `−69.5 −63.5 −52.8 −56.5`; row 1 `−62.4 −45.5 −56.7 −52.7` → **LEFT** | ✓ |
| Diagonal wrench side, rows 2/3 | screen-**right** | row 2 `+52.6 +59.8 +46.4 +53.7`; row 3 `+59.3 +64.5 +58.3 +61.2` → **RIGHT** | ✓ |
| Cardinal `s` row 0 / `n` row 3 | both screen-left ⇒ control REJECTED | row 0 **LEFT**; row 3 **LEFT** (`−46.6 −49.8 −50.4 −46.8`) | ✓ |

**Provenance proved by hash, not by claim:** the probe is deterministic across two consecutive runs, and its live stdout hashes to `bdb7d8c6254f035f…` — **byte-identical to the committed `artifacts/eight-winds-rail-tough/probe-results.json`** (`bdb7d8c6254f035fe67cc5d21639fed15a106cd0ee5a885e38e1f31752a5c7a9`). Both locator boards match their published SHA-256s (`c1e7adc2…`, `3d1112b2…`). The retained artifact is what the code produces on main today, not a hand-kept snapshot.

| Gate | Result | Exit |
|---|---|---:|
| `drain-block-check` (§3.0, first) | ✅ CLEAR | 0 |
| `npx tsc --noEmit` | clean | 0 |
| `npm run build` | ✓ built in **1.58 s**; asset-diet green | 0 |
| `test:node-guards` (12 files) | **61 tests / 61 pass / 0 fail** | 0 |
| `node logs/s1190-rail-tough-wrench-probe.mjs` | deterministic ×2; all published figures reproduce | 0 |
| Staged-path audit | **zero** paths outside `artifacts/eight-winds-rail-tough/`, the probe, and the run report | — |

**No playwright run, and that is proportionate, not a thinning of the bar:** the slice changes **39 files, 1110 insertions, 0 deletions**, none of them under `src/`, `e2e/`, `assets/`, `scripts/` or any contract — verified by the staged-path audit above, not by the runner's assertion. Nothing renders, so Mistake #10 ("where does the PLAYER see this?") has the honest answer *nowhere yet* — this is the measurement that sizes the art batch which the player will eventually see.

## Merge classification

Base `71f55aa5`. The lane commit is **pure-add**. Main moved during this fire (my own `35aebd7e` lock, `db79e121` m3-05d authoring, `4e0e59e5` log churn), touching `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-a-*.md`, `logs/{dashboard,.goal-tree,task-stats,factory-usage,usage-history}.*`.

| Class | Files |
|---|---|
| **LANE-TOUCHED-ONLY** | all **39**: `artifacts/eight-winds-rail-tough/**` (32 extracted cells + 2 `frames.json` + `probe-results.json` + 2 locator boards), `logs/s1190-rail-tough-wrench-probe.mjs`, `tasks/runs/20260729-020242-…md` |
| **MAIN-MOVED-ONLY** | the bookkeeping set above — **disjoint** from the lane's file set |
| **BOTH (graft needed)** | **none** |

Merged by path-scoped `git checkout 44efb1f3 -- <the three lane paths>`; no 3-way graft, no conflict, no `-A`.

## Why this one is accepted where a confident table would have been rejected

s1190's standing gate was explicit: *"gate it on whether it VALIDATED ITS WRENCH-LOCATOR before labelling, not on whether its table looks confident."* It did, and it did the harder half too:

1. **The locator was validated on the known-good rows first.** Diagonal rows 0 and 1 are unambiguous from the prior survey, and the locator reproduces their published screen-left wrench control before it is pointed at the disputed rows.
2. **It REJECTED a discriminator rather than forcing a conclusion from it.** The obvious cardinal cross-check — "does the wrench swap sides between `s` and `n`?" — **fails**: the consumer's `n` row 3 keeps the wrench screen-left, exactly like `s` row 0 (re-derived above). The report calls this out as `Confidence: NONE as a body-side control`, explains why (the row-3 pixels expose face/chest/badge like a side-or-front turn, not a back view), isolates it from the verdict, and changes nothing in the asset or contract. **A weaker run would have reported the cardinal agreement as corroboration.**
3. **The result is interpretable, not just favourable.** Masking moved the direct score by `−0.001` and the mirrored score by `+0.376`. That one-sided signature *is* the confound the hypothesis predicted; a mask that merely shrank both scores would have proved nothing.
4. **It is not a mask-size coin flip** — 9/9 sensitivity cases stay mirror-dominant.

The honest-failure branch was pre-declared a success that still ships a sized batch; it did not need to be taken.

## Findings

**F-1191-1 🔻 (non-blocking, recorded because it is the one claim in the report that a green gate cannot check) — the `nw` vs `ne` LABELS are one confidence tier below the PAIR.** The report is careful about this and its own table says so (`HIGH pair / MEDIUM label`), but it deserves a ledger line so a later fire does not read "no diagonal row remains UNCERTAIN" as uniform certainty. What is now HIGH-confidence is that rows 2 and 3 are **two distinct headings forming a mirror pair**. Which of them is `nw` and which is `ne` rests on the *visual* west/east read, because the decisive instrument is symmetric by construction — masking the prop is precisely what removes the information that could tell the pair apart. **Consequence if wrong:** rows 2 and 3 are swapped, i.e. the character faces north-east when the game asks for north-west; the fix is a one-line contract swap and no regeneration. **Recommendation:** when the E2 wiring slice lands, the in-game review checks a north-west walk on camera — that is a cheaper and stronger settlement of the label than any further pixel work.

**F-1191-2 ⓘ (informational) — `logs/s1190-rail-tough-wrench-probe.mjs` is a genuinely re-runnable instrument, and nothing calls it.** It is deterministic, self-asserting, exits 0, and re-derives its own published artifact byte-for-byte — but it lives in `logs/` and is in no npm script, so it is an unrun guard the moment this fire ends (the standing shape of F-1185-5 / "an unrun guard is an unread verdict"). **Not fixed here:** it reads `artifacts/` scratch extractions that are deliberately not part of the shipped asset set, so wiring it into `test:node-guards` would couple the guard battery to scratch bytes. Recorded so the E2 wiring slice can decide whether to promote it or let it stand as a one-shot instrument with its results banked in `probe-results.json`.

## The E2 art request this settles (unchanged from the report, restated for the next fire)

| Sheet | Rows to regenerate |
|---|---|
| **Coal Thief** | **1 row** — row 0 as `sw`; preserve 1/2/3 as `se`/`nw`/`ne` |
| **Steam Wrecker** | **2 rows** — row 1 as lawful `se` **with a single cyan tank** (F-1189-2, non-negotiable); row 2 as lawful `nw`; preserve 0/3 |
| **Rail Tough** | **1 row** — row 1 as one stable `se`; preserve row 0 `sw` and rows 2/3 `nw`/`ne` |

**Total: 4 rows. The batch is now fully sized and ships as ONE request.**
