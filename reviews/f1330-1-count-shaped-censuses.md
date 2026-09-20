# f1330-1 — the two COUNT-shaped E1 censuses assert 42, not 41

**Slice:** `f1330-1-count-shaped-censuses` · **branch:** `lane/e2-arsenal` · **lane tip:** `23a9a9af`
**Merge commit:** `68deb90a3554df4d9d633a2b8098ed9b9d73a938` (main) · **drained by:** s1331, 2026-08-01

## Verdict

**MERGED — green on every gate it owns.** One suite (`board-card-images`) remains red, and a
control run proves it was already red on clean main *before* this merge. The merge does not
fix that suite; it **moves its failure from a bookkeeping lie to a real defect** (F-1331-1).

## What it does

Two E2E specs assert the total contract count against a **live-derived** array
(`listEpochs()` / `loadEpoch()`), compared to a hard literal:

- `e2e/board-card-images.spec.ts:37` — `expect(EPOCHS.flatMap((epoch) => epoch.contracts)).toHaveLength(41)`
- `e2e/map-census.spec.ts:63` — `expect(CONTRACTS).toHaveLength(41)` (inside `test.afterAll`)

Both literals now read **42**. The `41` predates `e1-drill-yard`, which landed today at
**08:14** (`f86b28b3`, `runner(lane-b): lane-drill-yard.md`).

**The count was re-derived on main, not inherited.** s1331 read every
`assets/contracts/*/contracts.json` and summed: **42** across ten epochs, **E1 = 6**. This
agrees with s1330's independent count; two counts that agree can still enumerate different
sets, so the per-epoch breakdown is recorded here: E1 6 · E2–E10 4 each.

## Merge classification

| | |
|---|---|
| merge-base | `67282ffa` |
| lane commits ahead | **1** (`23a9a9af`, 2 files / 2 lines) |
| `git log 67282ffa..main -- <both files>` | **empty — main moved NEITHER file** |
| classification | both files **pure LANE-TOUCHED**; no MAIN-MOVED, no 3-way conflict |
| strategy | real `git merge --no-ff` (not a file checkout) so the lane records ancestry |
| post-merge `main..lane/e2-arsenal` | **empty** — lane absorbed, not falsely ahead |

The two-endpoint diff (`git diff main..lane/e2-arsenal`) shows 114 files and 8,741 deletions.
**Those are stale-base phantoms, not lane content** — lane-c is 37 commits behind, so every
file main added since the merge-base reads as a deletion. The lane's actual content is its
single commit's `--stat`: 2 files, 2 insertions, 2 deletions.

## Evidence

All Playwright runs `--workers=1` per §3.1 (fire-shell serialisation).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, built in 1.28s |
| `e2e/map-census.spec.ts` | **94 passed** (47 desktop + 47 mobile), 4.1m |
| `test:node-guards` (36 files) | **209 pass / 0 fail**, 40.9s |
| `scripts/test-ticker-stats.mjs` | pass (8 checks) |
| boot probes (`_s106-prospector`, `profile-first-boot`) | **14 passed**, zero console/page errors, desktop + mobile-390 |
| `e2e/board-card-images.spec.ts` | **2 failed** — see below, pre-existing |

### The one red, attributed by control run

The runner reported `board-card-images` 0/1 per project and guessed the cause. That guess was
correct, but a guess is not an attribution, so it was measured:

| Run | Tree | Result |
|---|---|---|
| **Control** | clean main, pre-merge | 2 failed **at `:37`** — `toHaveLength(41)` vs 42 received |
| **Merged** | this merge | 2 failed **at `:45`** — `expect(imageUrl, contract.id).not.toBe(claimUrl)`, `Error: e1-drill-yard` |

Same two tests red before and after. **Net effect on the suite: ±0 red, one real defect
unmasked.** Merging is strictly better than not: without it the count assertion stays wrong
*and* it keeps hiding F-1331-1.

### law-pointer baseline re-based (predicted drift, not a finding)

`scripts/law-pointer-baseline.json` fingerprints both edited lines against the **blocked**
`f1328-1-drill-yard-census-debt` leaf. The guard was run **before** curing, to observe the
predicted red rather than cure blind:

```
FAIL — 2 pointer problem(s):
  POINTER DRIFT tasks/goals.json[f1328-1-drill-yard-census-debt] -> board-card-images.spec.ts:37
  POINTER DRIFT tasks/goals.json[f1328-1-drill-yard-census-debt] -> map-census.spec.ts:63
```

Exactly the two s1330 predicted, no others. Both lines were **re-read** before re-basing (the
guard asks "does it still support the claim?" — they now assert the *cured* value, so they
re-base rather than repoint). `--update` was run **on main**, never on the lane: s1330's master
forbade it there because lane-c's ledger is 37 commits stale and would emit a baseline missing
every pointer main has added since. Diff verified to be **exactly 2 fingerprints + 2 excerpts**;
no pointer dropped. Re-run: **PASS — 19 pointers.**

## Findings

### 🔺 F-1331-1 — the 42nd contract shipped without its board card (BLOCKING nothing; owner/art)

`e1-drill-yard` renders **the Claim's** card image. Proven by set difference, not by eyeball:

```
contracts 42 · plate-contract-*.png 41
contracts with NO plate: [ 'e1-drill-yard' ]
```

`assets/raw/` holds **41** `plate-contract-*.png` for **42** contracts. The stale `41` was
accidentally consistent with the art roster, so the census could not see the gap. This is a
player-visible defect (Mistake #10 shape: a shipped chapter shows another chapter's art).

**Recommendation:** one ART-slot batch item, `plate-contract-drill-yard.png`, following the 41
existing siblings' convention. Not authored this fire — see §Duties.

### 🔺 F-1331-2 — the Drill Yard fails three census columns, and nothing goes red

The regenerated `artifacts/map-census/table.md` gains its first `e1-drill-yard` row:

| Map | Render | MQ-2 band | Landmark brightness |
|---|---|---|---|
| e1-drill-yard | **FAIL: expected glb, got painted** | **FAIL: toHaveAttribute failed** | **FAIL: no mounted landmark** |

The suite still reports **94/94 green**. This is **F-1143-2 reproducing exactly**: the 41
per-map tests store a row and assert nothing, and `probe()` catches every throw into a `FAIL:`
*string*. The census can go 0 → 3 FAILs with every automated gate green.

**Second-order effect, and the reason this went unseen for hours:** `map-census.spec.ts:63`'s
`expect` sits **before** the `mkdir`/write in the same `afterAll`, so while the count was
stale the artifact **could not be written at all**. Verified by reading the source, and
bounded by measurement rather than asserted dramatically: `table.md` was last committed
2026-07-27 (`3629d0ac`), but Drill Yard only landed **08:14 today**, so the freeze this merge
ends is **~5.5 hours**, not five days.

Two cells also flipped **FAIL → PASS** in this regeneration — `e3-moth-season` (was
`luminance=0.041`, the F-1143-1 re-regression) and `e6-showroom` (was `10.1s`). Five days of
merges sit between the two generations, so these are **recorded, not claimed as caused by this
merge**.

## Files

**Merged:** `e2e/board-card-images.spec.ts`, `e2e/map-census.spec.ts`
**Drain bookkeeping:** `scripts/law-pointer-baseline.json` (re-based), `artifacts/map-census/table.md`
(legitimate regeneration — a living artifact with a `Generated:` stamp, now carrying a truer record)

**Restored, not committed (F-1330-3, FIFTH sighting):** the battery rewrote **6 tracked evidence
PNGs** by merely running — `artifacts/profile-first-boot/` ×4, `reviews/shots-prospector-presence/` ×2.
All restored to main's bytes. The per-run-output-dir cure remains unauthored after five fires.
