# Review — eight-winds E2 diagonal row-order survey

**Slice:** `lane-c-eight-winds-e2-row-order-survey` (FIRE-AUTHORED s1188 `4ec1bbbb`)
**Branch/tip:** `lane/e2-arsenal` @ `7a840663` ("runner(lane-c): lane-c-eight-winds-e2-row-order-survey.md")
**Drained by:** s1189 fire, 2026-07-29
**Run report:** `tasks/runs/20260729-010959-lane-c-eight-winds-e2-row-order-survey.md`

**§3.0 drain-block-check:** `✅ CLEAR — lane-c-eight-winds-e2-row-order-survey.md [eight-winds-e2-row-order-survey] status="queued"` — **run first, before classification and before I formed an opinion.**

## Verdict: **ACCEPTED** — merged as evidence. It answered the question that blocked its predecessor, and it was honest about its own instrument. One finding (F-1189-2) narrows its Steam Wrecker verdict without overturning it.

## What it does

Nothing ships but evidence: three labelled contact boards under `artifacts/eight-winds-e2/` and a 229-line report. Zero `src/`, zero `assets/`, zero `e2e/`, zero contract bytes — the wiring slice stays blocked, which is the correct outcome.

Its substance: for each of the three E2 diagonal enemy sheets it **validated a left/right discriminator before labelling any row**, then produced a 12-row mapping with front/back and west/east judged separately, cross-checked every row against the mirror-IoU instrument, and reported each disagreement as `UNCERTAIN` instead of resolving it.

**It answered the exact question that voided s1188's own discriminator.** F-1188-2 stalled on whether the Rail Tough carries a brass pauldron on one shoulder or both; the report reads *"The Rail Tough wears brass pauldrons on **both** shoulders"* with frames cited (row 0 `c0`/`c2`, row 1 `c1`), declares the one-pauldron tell invalid, and **replaces** it with the wrench hand — validated by showing the wrench holds screen-left across front rows `0/1` and screen-right across back rows `2/3`, i.e. a stable one-hand prop rather than alternating decoration. That is the deliverable.

**It also invented a better instrument than the master asked for.** For the Steam Wrecker — which s1188 measured as *unmeasurable by silhouette* — it used the **shipped cardinal sheet as a control**, establishing the cyan tank's body side from cardinal `s` (front, screen-right) and cardinal `n` (back, screen-left) without assuming any diagonal ordering. That converted an indeterminate sheet into a row-level verdict.

**And it incriminated itself where the master told it to.** Four of the five published Coal Thief controls reproduced exactly; `0v1` direct came back **0.856 vs my 0.863 (−0.007)**. It applied the master's own binding rule against its own numbers: *"the task explicitly says an inexact control makes the whole table suspect. These numbers are evidence, not binding data."* Every qualitative dominance verdict still agrees with mine.

## Evidence

| Gate | Result | Exit |
|---|---|---:|
| `node scripts/drain-block-check.mjs <done-move>` | ✅ CLEAR | 0 |
| `npm run test:node-guards` (**run before gating**, per s1187's standing order) | 61 tests / 61 pass / 0 fail, + ticker-stats checks passed | 0 |
| `npx tsc --noEmit` (merged tree) | clean — **and it must be: the slice changes no code** | 0 |
| `npm run build` (merged tree) | `✓ built in 1.85s`; asset-diet green (235 GLBs 84% cut, 60 plate PNGs 88% cut) | 0 |
| Evidence provenance | **all three published SHA-256 hashes MATCH the merged bytes** (`logs/s1189-verify-evidence.mjs`) — 1.70 / 1.71 / 2.12 MB | 0 |
| `scripts/extract-alpha.mjs` untouched | `git status --porcelain` empty; the `--out DIR` flag it used **pre-exists** at `:20`/`:60` — it found the flag rather than adding one, as the firewall required | ✓ |

No playwright run: the slice adds no test and touches no rendering code, and lane-a was **live** with a Codex run during this drain (Mistake #12 — never gate a spec whose files a live task may touch). `tsc` + `build` + guards are the whole applicable battery for a zero-code slice.

## Merge classification

Base: `4ec1bbbb`. `git diff --name-only --diff-filter=A main..lane/e2-arsenal` = **exactly 4 files**, all pure adds, all inside the master's TOUCH-ONLY list:

- `artifacts/eight-winds-e2/rowsurvey-{rail-tough,steam-wrecker,coal-thief}.png`
- `tasks/runs/20260729-010959-lane-c-eight-winds-e2-row-order-survey.md`

Applied to clean main by path-scoped `git checkout lane/e2-arsenal -- <2 paths>`. **LANE-TOUCHED: those 4.** **MAIN-MOVED-ONLY: everything else in the two-dot diff** (`STATUS.md`, `logs/*`, `reviews/shots-*`, `tasks/*`) — those are *this fire's own earlier commits* showing as phantom `D`/`M` against the lane's stale base, not lane deletions. No conflicts; nothing 3-way grafted.

## Findings

- 🔺 **F-1189-2 (real, non-blocking, NARROWS the report's Steam Wrecker verdict — it does not overturn it).** The report names row 1 for regeneration *"as lawful `se`"* because *"the cyan tank is wrongly screen-left in a front view"*. **Measured at the raw pixels this drain (`logs/s1189-tank-side-probe.mjs`, `logs/s1189-tank-cluster-probe.mjs`, `logs/s1189-cardinal-tank-probe.mjs`): diagonal row 1 is the ONLY row in all 32 frames of BOTH Steam Wrecker sheets that carries TWO cyan clusters.**
  - Cardinal `char-steamwrecker-sheet-walk4-a.png`: **16/16 frames = 1 cluster.** Diagonal `…walkdiag4-a.png`: rows 0, 2, 3 = **1 cluster in all 12 frames**; row 1 = **2 clusters in all 4 frames**, separated by a ~110 px empty x-corridor (`c0` 85-97 + 210-223, `c1` 90-103 + 215-230, `c2` 109-121 + 233-246, `c3` 94-106 + 218-231) and carrying **139-171 px of cyan mass against 70-127 px everywhere else**.
  - ⇒ **(a) The one-sided-tank discriminator is VOID for exactly the row the report applies it to.** This is the F-1188-2 / brass-pauldron shape recurring one level down: a tell validated on the cardinal control and on rows 0/3, then applied to a row whose own art breaks the assumption. **The report's own binding rule caught its predecessor and then missed itself.**
  - ⇒ **(b) The report read the LARGER left cluster as "the tank"** (87/107/102/102 px) and never mentions the 47-64 px right-hand cluster — 36% of the row's cyan mass, unreported.
  - ⇒ **(c) The verdict survives, the repair SPEC does not.** "Row 1 must be regenerated" is **correct**, and the 2-row Steam Wrecker count still holds. But an artist told *"put the tank on the other side"* would deliver a row that **still has two tanks**. The row-1 request must read: *one* cyan tank, on the lawful front-view side. **Row 2's verdict is untouched** (single cluster, cyan screen-right in a back view = the anti-mirror defect exactly as described).
- ⓘ **F-1189-3 (corroboration, not a defect).** The runner's independently-implemented instrument reproduced my Rail Tough `2v3` conflict at **+0.248 direct-dominant** against my **+0.254**, and the Coal Thief `2v3` mirror pair exactly (`0.579 / 0.767`). Two different implementations agreeing on every dominance verdict raises confidence in F-1188-1 and F-1188-2 well above one fire's measurement.
- ⓘ **F-1189-4 (bookkeeping).** The report's own "Lane safety" section independently re-derived the SAFE-DUPE proof the master pre-computed (`fe3ae8cb` byte-identical to main, landed in `fba9a446`) before resetting. The lane-safety pre-flight is working as s1179 built it.

## Where the owner acts

**The E2 diagonal art batch is now sized — with one correction folded in:**

| Sheet | Verdict | Rows to regenerate |
|---|---|---|
| **Coal Thief** | (b) defective | **1 row** — row 0 as `sw` (rows 1/2/3 = `se`/`nw`/`ne` preserved) |
| **Steam Wrecker** | (b) defective | **2 rows** — row 1 as lawful `se` **with a single cyan tank (F-1189-2)**; row 2 as lawful `nw` |
| **Rail Tough** | (c) indeterminate | **≥1 row** — row 1 must become one stable `se` row; rows 2/3 remain `UNCERTAIN` pending a non-silhouette measurement |

**Three exact repairs plus a Rail Tough minimum of one.** There is still no honest all-sheet total until the Rail Tough `2v3` disagreement is settled — and that is the correct place to stop.
