# art-e7-town-icons — s1161 drain review

**Slice:** `art-e7-town-icons` (E7 townsfolk portraits, portrait-only split)
**Branch/tip:** none — the ART slot works in **main's own tree**; the runner auto-committed `7873eaee` (`runner(art): art-e7-town-icons.md`, 2026-07-28T10:18:26+07:00) directly onto main.
**Drain:** this is therefore a **gate-and-bless, not a merge.** Nothing was grafted; the question is only whether the committed content earns its place.

## VERDICT: QA PASS — reference-tier, extraction WITHHELD.

Five E7 townsfolk portraits (4 fresh + 1 identity-preserving era edit) plus a five-up contact sheet, in the pinned engraved-sepia `tf-*` convention. **Every number below was re-measured by this drain with its own instrument (`logs/session-scratch/s1161-e7-art-gate.mjs`); none is inherited from the run report.**

## The binding gate came first, and it passed

s1160 set one precondition on this drain, and it is the right one: *"if the run did not reproduce `tf-mei` ≈104 on the E1 raws, its E7 measurements mean nothing."* An instrument that has not been shown to reproduce a known answer cannot convict or acquit a new one.

Statistic (pinned, LEDGER row 60 / s1155): **mean (R − B) over the TL+TR 60×60 corners. Flag below 120.** Accepted observed range 124–145.

| E1 control | TL | TR | mean | pinned | drift | result |
|---|---:|---:|---:|---:|---:|---|
| `tf-assay-clerk` | 137.2 | 138.5 | 137.8 | 137.8 | +0.02 | pass |
| `tf-elder-rowan` | 137.3 | 130.6 | 134.0 | 134.0 | −0.05 | pass |
| `tf-mei` | 106.4 | 104.2 | **105.3** | 105.3 | +0.04 | **FLAG** |
| `tf-preacher` | 124.1 | 124.9 | 124.5 | 124.5 | 0.00 | pass |
| `tf-schoolteacher` | 141.8 | 139.1 | 140.4 | 140.4 | +0.01 | pass |
| `tf-storekeeper` | 144.4 | 143.3 | 143.9 | 143.9 | −0.04 | pass |

**Reproduces all six pinned values to within ±0.05 and flags exactly one file, `tf-mei` — the F-1120-1 outlier.** The instrument is sound, so the E7 numbers below are admissible.

## Deliverables — measured

| File | dims / channels | alpha / transparent | exact / near magenta | TL | TR | warmth mean | runner said | verdict |
|---|---|---|---|---:|---:|---:|---:|---|
| `tf-switchboard-chief-e7.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | 139.9 | 142.2 | **141.1** | 141.1 | in range |
| `tf-playbook-librarian-e7.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | 143.7 | 145.0 | **144.4** | 144.4 | in range |
| `tf-drone-keeper-e7.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | 132.5 | 122.5 | **127.5** | 127.5 | in range |
| `tf-tape-courier-e7.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | 133.4 | 130.6 | **132.0** | 132.0 | in range |
| `tf-combine-defector-e7.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | 142.6 | 135.7 | **139.2** | 139.2 | in range |
| `tf-e7-town-sheet.png` | 1254×1254 / 3 | false / 0 | 0 / 0 | — | — | n/a | n/a | correct full-bleed tier |

All five clear the 120 floor and sit inside the accepted 124–145 range. **The runner's five warmth figures reproduce to ≤0.04 drift** — it measured honestly. RGB/no-alpha/zero-magenta is correct for the full-bleed, un-keyed reference tier.

## Contact sheet order — proven with a DIFFERENT instrument than the runner used

The runner reported true-pairing MAE **0.00** against wrong pairings 28.05–34.61. A perfect 0.00 is not fraud but it *is* near-tautological: the sheet is a programmatic composite of the resized raws, so re-slicing it with the same resampler must return the same bytes. That measurement proves the sheet was assembled from these raws; it does not independently prove much else.

Re-run here with a **different resize kernel (`nearest`, not the default)**, which breaks the tautology:

| sheet cell \ raw | chief | librarian | keeper | courier | defector | best |
|---|---:|---:|---:|---:|---:|---|
| 1 | **12.25** | 37.28 | 35.28 | 38.20 | 38.53 | chief ✓ |
| 2 | 36.06 | **15.04** | 36.78 | 34.43 | 38.97 | librarian ✓ |
| 3 | 35.21 | 37.89 | **12.51** | 34.21 | 32.92 | keeper ✓ |
| 4 | 36.86 | 34.16 | 32.75 | **15.87** | 34.27 | courier ✓ |
| 5 | 38.01 | 39.61 | 32.28 | 35.14 | **14.39** | defector ✓ |

**5/5 bijective.** True pairings **12.25–15.87**; the twenty wrong-pairing positive controls **32.28–39.61** — a clean ×2.1–3.2 separation with no overlap. Order confirmed: **switchboard chief / playbook librarian / drone keeper / tape courier / combine defector**. This honours F-1154-3: the order is *proven*, not asserted, and the wrong pairings are carried as the positive control.

## Visual review — actually looked at, not inferred

- **120px strip** (`reviews/shots-art-e7-town-icons/e7-portraits-120px-strip.png`, the runner's, re-viewed here): all five separate cleanly at the size the art is consumed at — jack-cord fan / spectacles + card / broad hat + perched drone / askew cap + tape coils / loose tie + mint suit. Consistent shoulders-up framing and comparable head sizes.
- **Canon at full size.** `tf-drone-keeper-e7` is the file with real canon exposure, and it holds: the drone is a **rounded brass dovecote-bird** with teal glass lens eyes — **no barrel, muzzle, bore, mount, blade or aimed form** (ADR-001, brief §9: frontier-tech, never firearms). The tape courier is a warm, safe, fully-clothed child. No letters, numerals or logos anywhere; no gore; no enemy styling. Evidence: `reviews/shots-art-e7-town-icons/s1161-drone-keeper.png`.
- **The era edit holds its identity.** Side-by-side E6→E7 (`reviews/shots-art-e7-town-icons/s1161-defector-e6-vs-e7.png`): same face shape, eyes, nose, mouth, hair wave and part, three-quarter head angle, tired half-smile, loose tie, mint/teal suit, engraved hand, parchment ground. The E6 catalog is gone and **exactly one** new era element appears — an aged-brass jack-cord plug at the collar. This is the strongest identity-preservation in the `tf-*` series so far.

## Firewall — PASS

`git show --numstat 7873eaee` : every art file is a **new** blob. **No existing `tf-*` was modified** — the six E1 control raws and `tf-combine-defector-e6.png` are untouched in the commit (so the run's byte-identical sha256 claim is verified structurally, not merely quoted). **Zero files under `src/`, `e2e/`, `assets/processed/`; no `icons-e7`; no CHALK/civic-agent portrait** (correctly withheld — see F-1160-1). The commit is exactly: 5 raws + 1 sheet + 1 QA strip + 1 run file + LEDGER row 62 + runner bookkeeping.

## Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean (rc 0)** |
| `npm run build` | **green, 1.72s** (asset-diet: 235 GLBs 84% cut, 53 plate PNGs 87% cut) |
| Instrument control on E1 | **PASS** — 6/6 pinned reproduced ≤0.05, exactly one flag |
| Warmth, 5 portraits | **PASS** — 127.5–144.4, all above the 120 floor and inside 124–145 |
| Sheet order | **PASS** — 5/5 bijective under an independent resampler, ×2.1–3.2 control gap |
| File tier | **PASS** — 6/6 1254×1254 RGB, 0 alpha / 0 transparent / 0 magenta px |
| Canon §9 / ADR-001 | **PASS** — no firearms, no type, no gore, no enemy styling |
| Firewall | **PASS** — no `src/`, `e2e/`, `processed/`, no modified prior art |
| Playwright suites | **DELIBERATELY NOT RUN** — see below |

**Why no e2e run, stated plainly rather than omitted:** this slice has **no consumer**. `grep -rn 'tf-' src/` still returns exactly one hit, the string `utf-8` in `src/charter/CharterShare.ts:43` — nothing wires any `tf-*.png`. There is no runtime surface for a spec to exercise, and lane-d is concurrently running a 2396-test inventory whose entire value is an accurate red list; a second playwright load would inject contention false-reds into it (Mistake #12). tsc + build are the honest gates for a reference-tier art batch with zero source change, matching the row 60/61 precedent.

## Reference tier — extraction WITHHELD

No consumer exists, so per rows 60/61 there is **no extraction, no `assets/processed/`, no contract wiring, and no player-visible change** ⇒ **no gazette item** (the filter law is working, not being skipped) and **no deploy** (nothing gameplay-affecting merged).

## Findings

- **F-1161-1 (non-blocking, observation for the next era transform).** The defector edit preserves identity superbly but its **aging signal is faint**: at the 120px the convention is specified for, the eight-year jump is carried almost entirely by the **prop swap** (catalog removed, collar jack added), not by the face — the greying and brow lines are visible only at full size. This is not a defect against the master, which asked for subtlety and got it, and the E6 depot-clerk set the same precedent. It is worth knowing that **era read in this series currently lives in the props**, so any future transform that changes no prop will read as no transform at all.
- **F-1161-2 (non-blocking, instrument note).** `tf-drone-keeper-e7` carries the widest TL/TR spread in the batch — **132.5 / 122.5, 10.0 points**, with TR alone below the 124 accepted floor while the pinned mean (127.5) passes comfortably. Precedent tolerates more (`tf-appliance-wrangler` spreads 13.9), and this is exactly the volatility that made s1155 pin the *mean of both* corners rather than a single one — so the guard behaved as designed. Recorded because it is the second batch to exhibit it: if a third does, the spread itself may deserve a bound, not just the mean.

## Evidence

- Run report: `tasks/runs/20260728-101445-art-e7-town-icons.md`
- Gate instrument: `logs/session-scratch/s1161-e7-art-gate.mjs`
- Shots: `reviews/shots-art-e7-town-icons/` — `e7-portraits-120px-strip.png` (runner), `s1161-drone-keeper.png`, `s1161-defector-e6-vs-e7.png` (this drain)
- LEDGER: row 62
- ART staging audit (ART-SLOT LAW, both buckets): **AT RISK 748 files / 566.47 MB · LOCAL-ONLY 0 files / 0 KB** (also SALVAGED 6, DIVERGED 16). Unchanged since s1156; disposition is F-1120-2 on the owner's desk, not a fire's. **This batch is not part of it** — it is committed to main and pushed.
