# Drain review: `canyon-works-traversal-1`, the creek bank crosses; the t2 wall is next (Opus 5.5 implementer at max effort; from Astra's F-PP2-2)

**Branch** `fix/canyon-works-traversal-1` at `2bba21639` · **merge** `752d624e8` · engine hash #63 `9a995b76` · drained attended 2026-09-26 00:31Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `cw1`).

**Verdict: LANDED.**

### What it does
Astra's play-proofs run 2 found the Canyon Works unwinnable on foot (F-PP2-2): the creek bank's blend, 1.5 m over 2 m, had a peak sim gradient of 1.03 against the 0.35 traversal limit, a full-width wall at z minus 7.88 that no honest route crossed. This branch (Opus 5.5 implementer at max effort) moves one number in the contract's elevation block, `creekBlendStart` minus 8 to minus 14, so the same 1.5 m drop runs over 8 m, the run this map's own t1 ramp and the Hill Mine's terraces already use; `creekBlendEnd`, `creekHeight` and `railHeight` are unchanged, so the amplitude, the channel depth (exactly minus 1 from the shallows through the ford) and every table stayed. Measured with the sim's own `simSlope` and `isTraversable`: peak gradient 1.0313 at z minus 7 before (refused at x 0, plus or minus 24 and plus or minus 44, reproducing Astra's stop), 0.2798 at z minus 10 after, a margin of 0.07, no refused point; on foot 6 of 6 pylon sites and the bridge reachable (before 4 of 6, bridge not). Null floors 83 of 83, both canyon seeds' view streams byte-identical to their pins. The new `e2e/e3-canyon-works-traversal.spec.ts` walks the hero across the bank on both projects. Astra's own acceptance spec now passes its traversal step (`crossed=true`, hero at z minus 5.53) and fails further north at `secures` with gold 0, which is F-CW1-1: a SECOND wall, the t2 ramp (0.5 to 4.5 m over z 18 to 28, peak 0.598), refuses z 19.8 to 26.2 at every x, so all four seams, both galleries, the lamps and the turrets stay unreachable and the map is still not winnable on foot. Where the player sees it: the Canyon Works' creek bank can be walked; the works above it cannot yet.

### Measured
tsc, build and the release build rc 0; the guard trio 25 of 25; `e3-canyon-works`, `task-025` and `m2-01` 28 of 28 unchanged; the new spec green on both projects (bridge and x plus or minus 24 all pass z minus 6 at 1.75 s of sim, no stalls); float or sink 0.000 m (the render stands the hero on the GLB's baked grid, a constant 0.06 m lift, 142 of 139 bank samples at 1280 and 390, zero console or page errors). The engine hash moves to `3f4e5c11…` (a contract line); the drain pins it and republishes the mask-table mirror (`assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json`, `creekBlendStart` minus 14), which the implementer's firewall kept it from.

### Merge classification
LANE-TOUCHED: `assets/contracts/epoch-3-voltage/contracts.json` (one line), `e2e/e3-canyon-works-traversal.spec.ts` (new), `artifacts/canyon-works-traversal-1/**` (slope tables before and after, boards, native acceptance, guard and floor logs). Drain cure: the mask-table mirror line and `artifacts/canyon-works-traversal-1/report.md` written from the implementer's message (its harness refused the file).

### Findings
- **F-CW1-1 (blocks the win; a corrective, on the desk with a recommendation):** the t2 ramp peaks at 0.598 and refuses z 19.8 to 26.2 at every x. The terrain spec wants "switchback descents (slope-legal)"; measured in memory, a ramp window of 14 to 32 (peak 0.333) or 13 to 33 (0.2998) opens every gallery target. The implementer believes gt-03's goal-side rows rely on this wall and did not run them against a change. Recommendation: a contract-only corrective (`canyon-works-traversal-2`) that widens the window to 14 to 32 and re-baselines gt-03 with the reason, then Astra's acceptance to `secures`.
- **F-CW1-2 (the art owner's):** the sim ground now sits up to 1.44 m below the visible bank, because `canyon-works-terrain.glb` keeps its 1.5 m face at z minus 8 to minus 6 (131 of 142 samples differ by more than 0.3 m). Regrade the bank face in the GLB and its terrain-contract copy; no GLB or `src/` edit in this slice.
- **F-CW1-3 (noted):** the `er01-e3-census` canyon row expects `byWave` 6 while the contract says 8 since the owner's 2026-09-06 ruling; red before this change.

### Battery attribution (drain, 15:58Z)
Four reds in the chain battery: the two registry rows ("rotation registry stays outside the engine identity corpus", "the landed registry names the live engine") are the expected pre-pin reds of a hash-moving branch and the contention row is advisory (all three allowed by default); the fixture sweep failed on "scripts/bench-seeds.test.mjs child failed", which is that same pre-pin red seen through the sweep's child (the bench seeds name the live engine hash, which this contract line moves; the pin cures it). Allowed for this landing only.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1127 files, 97708423 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34349803 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (311.7s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 167 ℹ fail 0` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.3m)` |
| e2e both projects, --workers=1 | `rc=0   30 passed (2.2m)  15:47Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1009 ℹ fail 4 ℹ skipped 5  15:56Z` |
| engine hash | `merged: 76aedf0c3ab4145f8b14786de9d8a04b706f8475f00a4b43649c1d3d3f459ced (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
