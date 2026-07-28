# art-e8-town-icons — drain review (s1162)

**Slice:** `art-e8-town-icons` (ART slot) · **tip:** `1d25c5cf` · **shipped on:** `main`
**Not a merge — a GATE-AND-BLESS.** The ART slot commits straight into main's own tree (s1161 established this), so there is no lane branch to graft. The job is to decide whether the content earns its place, not to move it.

## VERDICT: **PASS** — merged content accepted. Two non-blocking findings (F-1162-1, F-1162-2), one of which is a factory defect that has been live for five hours and is **not** this batch's fault.

## What it does

Four fresh E8 (orbital era) townsfolk portraits — **launch master · dome gardener · suit fitter · moon-born child** — plus a four-up contact sheet, in the pinned `tf-*` engraved-sepia convention. Reference tier: no key, no extraction, no consumer, no player-visible change. The **He-3 assayer and every aging edit remain withheld** under F-1161-3 (owner's desk), exactly as the master ordered — the batch is 4+1, not 5+1, and no substitute identity was invented.

## Evidence (every number re-measured by me; none inherited)

**The binding gate ran FIRST and passed.** Per s1160's precondition — *if the run did not reproduce the pinned E1 values, its E8 measurements mean nothing* — I re-implemented the statistic independently (`logs/session-scratch/s1162-e8-warmth.mjs`) and controlled it on the six E1 raws **before** measuring a single E8 file:

| E1 control | TL | TR | mean | pinned | drift |
|---|---:|---:|---:|---:|---:|
| tf-assay-clerk | 137.2 | 138.5 | 137.8 | 137.8 | 0.02 |
| tf-elder-rowan | 137.3 | 130.6 | 134.0 | 134.0 | 0.05 |
| **tf-mei** | 106.4 | 104.2 | **105.3** | 105.3 | 0.04 |
| tf-preacher | 124.1 | 124.9 | 124.5 | 124.5 | 0.00 |
| tf-schoolteacher | 141.8 | 139.1 | 140.4 | 140.4 | 0.01 |
| tf-storekeeper | 144.4 | 143.3 | 143.9 | 143.9 | 0.04 |

**Max drift 0.05; exactly one flag (`tf-mei`), which is the known F-1120-1 outlier.** Control PASSED ⇒ the E8 numbers are admissible.

| E8 deliverable | dims / channels | alpha / transparent | exact+near magenta | TL | TR | mean | spread | both corners >120 |
|---|---|---|---|---:|---:|---:|---:|---|
| tf-launch-master-e8 | 1254×1254 RGB/3 | none / 0 | 0 / 0 | 137.3 | 132.7 | 135.0 | 4.5 | ✅ |
| tf-dome-gardener-e8 | 1254×1254 RGB/3 | none / 0 | 0 / 0 | 139.9 | 131.0 | 135.4 | 8.9 | ✅ |
| tf-suit-fitter-e8 | 1254×1254 RGB/3 | none / 0 | 0 / 0 | 134.3 | 128.4 | 131.4 | 6.0 | ✅ |
| tf-moon-born-child-e8 | 1254×1254 RGB/3 | none / 0 | 0 / 0 | 133.6 | 135.1 | 134.4 | 1.6 | ✅ |

**All eight of the runner's TL/TR figures reproduce EXACTLY — it measured honestly.** TL and TR reported separately per F-1161-2. All four clear the 120 floor and sit inside the accepted 124–145. ✅ **This is an improvement on E7:** every corner clears 120 individually, where `tf-drone-keeper-e7`'s TR alone read 122.5. Max spread **8.9** (gardener) vs E7's 10.0 — so F-1161-2's "a third batch would argue for bounding the spread" has **not** yet been triggered by a floor breach, but the spread is real and TL>TR in 3 of 4.

**Contact-sheet order — proven by an instrument that could have disagreed.** The run reports true-pairing MAE `0.00`, and **credits itself with knowing why that is weak**: *"The true-pairing zero is near-tautological because the sheet was assembled from the same resized raw bytes."* (s1161's lesson has propagated into the runner's own reasoning — worth noting.) Re-sliced under a **different kernel (`nearest`)**, `logs/session-scratch/s1162-e8-sheet-order.mjs`:

| sheet cell | launch | gardener | fitter | child | argmin |
|---|---:|---:|---:|---:|---|
| 1 | **10.71** | 35.17 | 35.53 | 37.01 | launch ✓ |
| 2 | 35.77 | **7.86** | 35.14 | 38.37 | gardener ✓ |
| 3 | 36.13 | 34.95 | **9.83** | 40.31 | fitter ✓ |
| 4 | 37.55 | 38.44 | 40.38 | **8.44** | child ✓ |

**4/4 bijective; true pairings 7.86–10.71 vs twelve wrong-pairing positive controls 34.95–40.38; ×3.26 minimum separation, no overlap.** Order confirmed: launch master / dome gardener / suit fitter / moon-born child.

**Firewall — checked structurally, not taken on the report's word.** `git show --name-status 1d25c5cf`: **every art blob is `A` (added); zero `M` on any existing `tf-*`**, so no shipped portrait was repainted. Zero `src/`, zero `e2e/`, zero `assets/processed/` (the 18 `e8` files in processed are unrelated `char-e8-scrap_corsair` enemy cells), zero `icons-e8`. The run's own 17-hash byte-identity table is therefore corroborated by the commit's structure rather than trusted.

**Canon (§9) at full size and 120px:** no letters/type anywhere; the launch master's signal lamp is held **upright beside the shoulder with no barrel, muzzle, bore, stock, mount, sight or aimed form**; the measuring ribbon is smooth and ungraduated; the moon-born child is cheerful, safe, fully clothed and **not pitiable** (the prompt bans "deprived, wistful, sad, fragile, stranded" explicitly); no gore, no enemy styling.

**Gates:** `npx tsc --noEmit` **rc=0** · `npx vite build` **rc=0, 2.27s** (no pipe). **Playwright deliberately NOT run, and the reason is on the record:** the slice has **no consumer** (`grep -rn 'tf-' src/` returns only `utf-8` in `CharterShare.ts`), so there is no runtime surface to exercise — and **lane-b and lane-d were both live** (the 2396-test inventory + my own freshly-queued task), so a second browser load would inject contention false-reds (Mistake #12). Reference tier ⇒ **extraction WITHHELD**, **no gazette** (filter law: nothing player-visible), **no deploy** (zero `src/`).

## Findings

### F-1162-1 — **the art runner's commit swept 8 files it does not own, and s1154's fix for exactly this has been INERT for five hours** (non-blocking here; factory defect)

`1d25c5cf` carries, beyond its 6 legitimate art/LEDGER paths: `logs/session-scratch/s1161-{defector-e6-vs-e7,drone-keeper}.png`, `s1161-handoff-line.txt` (a departed fire's scratch), `logs/dashboard.html`, `logs/task-stats.jsonl`, `reviews/shots-…`, `tasks/runs/…`, and **`tasks/lane-b-anim-8frame-townsfolk.md` — the master I was mid-authoring in this very fire.** Nothing dangerous landed, but a runner committed another session's in-progress file under its own name; had that file been half-written, a broken master would have shipped.

**This is F-1154-1's class, and the diagnosis is verified rather than inferred.** s1154 fixed it at `d10167f4` (06:04 today) by giving the commit its own pathspec, and its own handoff said: *"The runner is LIVE (pid 35584), so the fix is INERT until it next restarts."* ✅ **`pid 35584` is still alive.** The runner has not restarted since 06:04, so the fix has never loaded, and the sweep recurred on schedule. ⚠️ **Every "F-1154-1 is fixed" reading in the ledger should be re-read as "patched on disk, not loaded."**

➡️ **Remedy is a RUNNER RESTART, which is an owner/attended action, not a fire's** — killing it is precisely the never-kill-by-a-remembered-pid law's target, and it is Robin's Terminal process. **OWNER'S DESK.** (Secondary, for whoever restarts it: the scoped ART branch at `lane-runner-v3.sh:88` only fires when `$wd = $ROOT`, and `worktrees/art` **does exist** as a plain non-git dir — so the art slot resolves to the *other* branch at `:105`. Worth confirming the intended path actually covers the art slot once the fix is live.)

### F-1162-2 — **the master asked for a RANKING, and a ranking is not something a generator can aim at — so it was met by arithmetic on the measured channel** (non-blocking; a lesson for every future art master)

The batch's one post-processing step is disclosed in full: the gardener received a *"deterministic `+5.5%` red-channel calibration"*, moving her from TL 125.9 / TR 117.0 (mean **121.4**) to 139.9 / 131.0 (mean **135.4**). ✅ **The disclosure is honest and I corroborated it independently** — whole-image channel means give the gardener **R/G = 1.597** against the other three's 1.386 / 1.458 / 1.455, a clear outlier; and the arithmetic is consistent (a +5.5% boost on a near-saturated parchment corner of R≈241 yields ≈+14 on R−B, which is exactly the observed shift).

**The point is not that the runner cheated — it did the honest thing and wrote down all five attempts.** The point is *why it had to*: `tasks/art-e8-town-icons.md:61` requires **"Her ground must be the warmest of the four."** That is a **comparative requirement against three files that do not exist when she is generated** — it cannot be aimed at, only discovered, and three further native retakes (126.7, 70.5, 214.0) failed to satisfy it. Once art has been exhausted, the only remaining lever is arithmetic **on the very channel the guard measures**.

⚠️ **The rot this invites, stated plainly: if a batch can move its own warmth score by post-hoc channel arithmetic, the warmth guard stops measuring the art and starts measuring the calibration.** ➡️ **Recommendation for future masters: state warmth as an ABSOLUTE band the generator can aim at (e.g. "her ground in 138–145"), never as a rank against unmade siblings.** Not a corrective task — a wording rule for the next art master, recorded here and in BACKLOG.

## Merge classification

Not applicable in the usual sense — **no branch, no graft, no conflicts.** The ART slot committed to `main` directly at `1d25c5cf`; base is main's own tip. Per-file: all art paths **NEW (`A`)**, `assets/LEDGER.md` **`M` (+1 row, row 63)**, and the 8 swept paths of F-1162-1 (**not** this slice's content, left in place rather than rewritten — history is not rewritten to tidy attribution; §7.7).
