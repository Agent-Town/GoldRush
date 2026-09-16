# Playability census — 2026-09-17 (standing duty, s2596 fire)

**Method:** `npm run test:playability` (`e2e/playability-smoke.spec.ts`: every board contract booted the way a
human boots it — no `?debug`, no test seam — and asked six questions: boots, briefing, HUD, moves, reaches
wave 2, no console/page errors) on a **detached worktree** (`gate-census-s2596`) at main `cac00799d`, both
projects, one worker, **24.1 min wall**, board dry (64th consecutive dry fire), machine otherwise idle —
load 3.23 at launch with **nothing over 1% CPU** (the 15 chromium processes on the box are parked orphans
1–8 days old at 0.0%, not live work), and deliberately nothing was run beside it, per F-2462-1. Arena proved
clean before the run (`git status --porcelain -uall` = 1 entry, the `node_modules` symlink). Transcript:
`artifacts/playability-census-2026-09-17/census-desktop-and-mobile.log`. 84/84 runs accounted for; no flaky,
no skipped.

**Result: 82 of 84 runs pass. `e6-picnic` is the sole failing contract, on both projects, at "reaches wave 2".
Three of yesterday's four rows have recovered.**

| contract | epoch | desktop | mobile | what the run reported |
|---|---|---|---|---|
| e6-picnic | 6 | ✗ | ✗ | `runState=dead` before wave 2 (F-PLAY-E6-1) |
| e1-drill-yard | 1 | ✓ | ✓ | recovered — passes under its declared practice exemption (F-PLAY-E1-1) |
| e2-trestle | 2 | ✓ | ✓ | recovered — reaches wave 2 (F-PLAY-E2-1) |
| e2-incline | 2 | ✓ | ✓ | recovered — reaches wave 2 (F-PLAY-E2-2) |
| the other 38 | 1–10 | ✓ | ✓ | |

## This run converts a labelled inference into a measurement, and that is its whole value

F-2588-1 corrected the 2026-09-16 census in place, because that document is named for a DAY and measures an
INSTANT: its subject was `e55c1aee1` at 01:26, and at 08:09 the attended session merged `2d053781c`, curing
three of its four rows. That correction re-measured **only the four-contract subset** on the merged tree and
was scrupulous about saying so:

> The `82 of 84` that a full re-run would presumably now report is an **INFERENCE and is labelled one**:
> only the four-contract subset was re-measured, not all 42.

**It is now measured, over all 42 contracts × 2 projects, and it is `82 of 84` — matching the inference to the
digit.** The three recovered rows are recovered on a full census, not merely on the subset that was looked at,
and no contract outside that subset regressed while the first wave landed.

**The subject is the cured tree and nothing has moved since.** Applying the census's own staleness predicate —
the `src/ assets/ public/ functions/ site/ index.html e2e/` diff — `e55c1aee1..cac00799d` is **exactly the 6
files / +386/−61** F-2588-1 recorded for `2d053781c` (the two contracts' data, `null-floors.json`,
`engine-era.json`, and the harness itself at `e2e/playability-smoke.spec.ts` +102). So the entire observable
delta between yesterday's census and mine is that one attended merge. My own lock commit touches `STATUS.md`
only and is invisible to this harness.

## The E2 gates are MET — reported here, deliberately not closed

The standing rows carry a gate: *"the census row green on both projects and the null floor re-recorded."*
Both halves are now satisfied for the two E2 rows, and the evidence is:

- **census row green on both projects** — measured above, this run.
- **null floor re-recorded** — `f4831889d` (2026-09-16), the same first-wave merge, rewrites
  `assets/contracts/null-floors.json` for both contracts (`e2-trestle` now `waves:1, timeMs:70700`;
  `e2-incline` now `waves:2, timeMs:119333`).

**F-PLAY-E1-1** is a different shape and should not be read as the same kind of recovery: it was always a
**census defect rather than a map defect** — the smoke asked for wave 2 on a contract that has no waves — and
its cure is the practice exemption declared in the harness itself (`e2e/playability-smoke.spec.ts` +102), not
a map change. It has no `null-floors.json` entry at all, by design, so that half of the gate does not apply.

➡️ **Nothing is closed in this fire.** The duty says *never fix anything from it in the same fire*, and
retiring an F-PLAY row is a judgement about ledger state that belongs to the fire or attended session holding
the evidence, not to the census that produced it. The measurement is banked here so whoever closes them
inherits a fact rather than a hunt.

## The durations, reported as a band and deliberately not as a key

Per F-2583-1, every "N s sim" figure this census prints is **wall-clock-derived and load-dependent**, so an
F-PLAY row keyed on a duration measures the machine and not the map. The e6-picnic figures across all three
censuses:

| | 09-15 | 09-16 desktop | 09-16 mobile | 09-17 desktop | 09-17 mobile |
|---|---|---|---|---|---|
| e6-picnic sim | 38 s | 34.7 s | 27.2 s | **37.9 s** | **37.9 s** |
| reached wave | 1 | 1 | 0 | **1** | **1** |

Today's two projects agree **to the tenth of a second** (37.9 / 37.9, `simTick` 296 vs 299), where 09-16 spread
~29% between its own two projects. That is consistent with an idle machine and is **not** evidence that the
harness has become deterministic — it is one observation, and F-2583-1's rule stands unchanged: **key the row
on the VERDICT — which of the six questions failed, and the run state — never on the duration.**

## Findings — no new rows

- **F-PLAY-E6-1** — e6-picnic: an unassisted plain-boot hero dies before wave 2. Unchanged and now the **sole
  survivor** of the four. Verbatim, both projects:
  `wave 2: reached wave 1 after 5.6s wall / 37.9s sim at timescale 4 (runState=dead, HUD wave reads "1",
  simTick=296)` (mobile: `simTick=299`), failing at `e2e/playability-smoke.spec.ts:522`
  ("`${contract.id}` boots plain, briefs, moves and reaches wave 2" — the `wave 2:` assertion inside the
  describe "playability smoke: every board contract, plain boot", whose `test(` is at `:311`).
  It is on the **OWNER'S DESK as A21** and waits on his word; no fire rules it.
- **F-PLAY-E1-1 / F-PLAY-E2-1 / F-PLAY-E2-2** — green this census; gate evidence above; not closed here.

Per the standing duty, **nothing was fixed in this fire.**

## What was retained, and what was deliberately not — with the magnitude stated

The arena's `test-results/` held **356 MB**, and the arena is removed after a census, so this was a judgement
rather than a default. Retained to `artifacts/playability-census-2026-09-17/`: the transcript (27 KB) and the
**e6-picnic failure screenshots + error contexts, 2.19 MB** — the one artifact of the sole surviving,
desk-gated failure that the text cannot reconstruct. **Not retained: the two `trace.zip`, 338 MB**
(191 MB desktop + 147 MB mobile). The verbatim failure line, run state, `simTick`, HUD reading and spec
coordinates are all in the transcript and quoted above, so per F-2483-1's fifth test the traces are redundant
in content and disproportionate in bytes — and per F-2492-1 the convention was re-checked at HEAD rather than
assumed: `git log --all --diff-filter=A` over `*playability-census*` shows only transcripts and bench docs
have ever been tracked, across all three censuses. The magnitude is stated because a one-word remedy with an
unstated magnitude is discovered by attempting it (F-2563-1).

---
*s2596 fire, 2026-09-17. Detached worktree `gate-census-s2596` at `cac00799d`, removed after the run.
84 runs, 82 pass, 2 fail, 24.1 min. Subject = the cured tree (`2d053781c` merged), first FULL census on it.*
