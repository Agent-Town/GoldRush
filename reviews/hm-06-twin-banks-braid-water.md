# Drain review: `hm-06-twin-banks-braid-water`, the Twin Banks water follows the braid the owner ratified (Astra run 2; owner 2026-09-24 (5)(b), 2026-09-25 twin banks; F-TB-1)

**Branch** `sol/map-art-campaign-2` at `4b05c78ca` · **merge** `1920cfbbe` · engine hash #61 `c63def1b` · drained attended 2026-09-25 04:00Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `hm06`).

**Verdict: LANDED.**

### What it does
Twin Banks' simulation has been braided since the mask reached the production contract on 2026-09-12 (two 3 m channels, a dry plait, the two fords as the only crossings), and the owner ratified the braid on 2026-09-24 ((5) (b)). Run 1 of this master stopped at the firewall in three minutes with the measurement that made run 2 right: the mounted-GLB pilot already drew two animated ribbons, a confluence mesh and a ford sheet from the mask, while the single 15.6 m band survived only in the fallback surface, and the production mask's source rectangle had no pool because the shared water constructor took only polyline rivers and rect fords. Run 2, with that constructor inside the firewall, makes the production water mask the authority for both paths: the pilot's ribbons read it, the guessed interior confluence span becomes the declared 4 x 4 m source pool inside the existing confluence draw (no new draw, no new light), the fords keep their shallow draws and animation, and the fallback surface builds the two piecewise-linear bands with round joins, the source rectangle and the ford shapes from the same mask, so the plait shows dry ground instead of a plane. Every tile without a mask keeps its construction. No sculpt cut or re-bake was needed: fresh samples from the delivered GLB read the north bed at -0.452 m, the south at -0.316 m and the plait at +0.259 m, the bars grounded on it. Where the player sees it: on Twin Banks the water sits where the ground is wet, the plait between the channels is walkable dry ground, and the spring shows as a pool.

### Astra's measurements (its report under `artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks/`)
Plain boards at 1280 and 390 before and after, same seed and viewport, no debug query; paired hardware performance over three interleaved runs per arm and width, desktop p95 median 9.0 to 8.7 ms, phone within the 15 percent bar; first-town payload 34,346,281 to 34,349,803 B (+3,522 B, no asset bytes); `null-floor-anchors --check` 83 of 83 including all three Twin Banks seeds; the five dev specs on both projects 52 passed, 2 skipped, 2 failed, both failures pre-existing with controls; the node battery on Node 26 green except the four pre-pin hash rows the drain's pin retires.

### Merge classification
Code: `src/world/Terrain.ts` (the fallback water surface from the mask), `src/world/Terrain3dClaimPilot.ts` (the constructor reads the production mask, the source pool, the Twin Banks entry). Tests: `e2e/e1-twin-banks.spec.ts` (the centre zone is the dry plait, two channel samples read river) and `e2e/beauty-twin-banks.spec.ts` (the sim-truth block asserts the mask's truth, the render assertions the two ribbons, the frame budget unchanged). Ledger: the Twin Banks row of the campaign status doc (resolved by row key at the drain), the campaign report's run-11 sections, the evidence under `run-11/braid/`. No contract change (the ruling ratifies what is there), no `Terrain.sample` or sim rule, no store commit.

### Findings
- **F-TB-1 (closed):** the two tests that pinned the single band are re-pinned to the braid; the E1 control reds of 2026-09-24 on `e1-twin-banks` and `beauty-twin-banks` are green.
- **F-E1T-1 (open, the test owner's, main's):** `beauty-twin-banks` "the reed field is alive in a still frame" fails on baseline and candidate alike since the riparian cards landed; outside this run's two authorized tests.
- **F-SEF2-5c (open, the test owner's):** the seeded-diagnostics determinism test lacks a mounted-height readiness wait and reds intermittently on both arms.
- **F-HUD-1 (held as in run 10):** the paired-bank entry composition is camera work, not this repair.
- **F-HM06-1 (noted):** the run's first attempt cost 78k tokens to discover a constructor outside its firewall; the master now names conditional lifts explicitly (F-1082-1), and the reader of a held-maps master should expect the mounted and fallback paths to differ.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1127 files, 97706953 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34349803 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (288.9s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=1   2 failed   2 skipped   66 passed (5.6m)  03:15Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1010 ℹ fail 3 ℹ skipped 5  03:23Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned 91dd025ed5e01410a9095d72db2669ccbffd930e4fc7067cc21455618938145f)` |
