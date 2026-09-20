# Review — f1607-1: THE HILL MINE RAILCAR DIES SOONER

**Slice/branch/tip:** `f1607-1-hill-mine-railcar-pacing` · `lane/a` @ `301728d40` · base `main` @ `4bfb451f3`
**Merged main at:** `cb7208e6447c60225bc6a0ccf3d3f5965d826937` (s1608 fire, 2026-08-10)
**Master:** `tasks/f1607-1-hill-mine-railcar-pacing.md` (authored s1607) · **Leaf:** `f1607-1-hill-mine-railcar-pacing`
**Owner ruling it serves:** F-1493-3, 2026-08-09 desk walkthrough, verbatim — **"Tune the fight shorter"**

## VERDICT: MERGED — one value moved, with a named cause and four instrumented numbers on both sides of it; all six reds control-confirmed pre-existing; the three-contract scope firewall verified on the merged tree.

## What it does

One line of `assets/contracts/epoch-2-steamworks/contracts.json`: the e2-hill-mine Baron block's `hpScale` **30 → 12.5**. Everything else in the 21-file diff is evidence — 3,442 insertions of measurement JSON and fight screenshots against **1 deletion**. That ratio is the master working as designed: it forbade any value moving until four instrumented numbers were reported.

| Measurement | Before (`30`) | After (`12.5`) |
|---|---:|---:|
| Destruction wave | 16 | 13 |
| Arrival-to-destruction | 141.67 s | 35.27 s |
| Component damage share | 30% / 41.67% / 28.33% | **unchanged** |
| Escorts alive | 6/6 | **unchanged** |

**Named cause (F-1441-3 requires one per value changed, and forbids re-pinning to make a red go away):** the global `hpScale` dominates — absorbed component HP fell `8,374.16 → 3,489.23`. Component scales total exactly `3.0`, so they only redistribute HP; `componentDegradeSpeedMult` changes movement after damage, not the burden. **`12.5` was the largest tested value that cleared the first rail pass** (`13` survived to wave 14 for 86.97 s). The runner banked the whole ladder it tried — `after-12`, `after-12-5`, `after-13`, `after-14`, `after-15`, `after-20` — so the choice is auditable rather than asserted.

That the damage share and escort count held while the clock more than quartered is the useful part: the fight got **shorter**, not **different**. The owner asked for the former.

## Evidence (gated on the MERGED tree, detached worktree `gate-s1608`, fire.md §3.0b)

| Gate | Result | Numbers |
|---|---|---|
| `npx tsc --noEmit` | **clean** | 0 errors |
| `npm run build` | **green** | vite ✓ + asset-diet ✓, 1.07 s |
| Own spec `e2-hill-mine` | **10 passed** | 2 failed (control-confirmed), 2 skipped, 1.4 m, `--workers=1`, both projects |
| Adjacent `e2-enemies` + `e2-rail-entity` + `e2-arsenal` | **19 passed** | 4 failed (control-confirmed), 1 skipped, 2.0 m, `--workers=1` |
| `test:node-guards` **run ALONE** | **rc=0** | 330.3 s — F-1460-1: contract data is behaviour the sim replays |
| Boot probe (runner) | **0 / 0** | zero console + zero page errors, desktop and 390×844 |

Screenshots: `reviews/shots-f1607-1/desktop-chrome-railcar-fight.png`, `.../mobile-chrome-railcar-fight.png`. Measurement ladder: `artifacts/f1607-1-measurement/`.

## The six reds were controlled, not excused

The runner reported six Playwright failures and asserted all six reproduce on unmodified `main`. **That assertion is exactly the kind this drain must not inherit** — a wave-determinism red is precisely what a Baron HP change could plausibly cause, so believing the runner here would be believing the thing most likely to be wrong.

**Control = the same gate worktree, same harness, same load profile, with ONLY `contracts.json` reverted to main's version.** Reverting just the changed file (rather than gating a separate checkout) leaves every other variable pinned.

| Suite | Merged arm | Control arm | Verdict |
|---|---|---|---|
| `e2-hill-mine:131` render descriptor | 2 failed (desktop + mobile) | **2 failed, same titles** | pre-existing |
| `e2-enemies:113` wave pulses · `:314` same-seed determinism | 4 failed | **4 failed, same titles** | pre-existing |

⚠️ **The members match, not merely the counts.** A matched *total* would prove nothing (F-"matched prediction ≠ inert subject"); identical failing *titles* on both arms is what makes this a real control. Six named, six reproduced, zero attributable to the slice.

## Merge classification

Single-parent lane merge onto clean main, `ort`, **zero conflicts**. 20 of 21 paths are new files under `artifacts/f1607-1-measurement/` and `reviews/shots-f1607-1/` — LANE-ONLY, main had never seen them. The 21st, `assets/contracts/epoch-2-steamworks/contracts.json`, is LANE-TOUCHED and main had not moved it since the lane branched.

## Findings

**F-1608-2 (non-blocking, reported not fixed — the runner did exactly right).** The e2-hill-mine Baron block is **byte-identical across three contracts**; the master barred the other two because the owner ruled about Hill Mine only, and told the runner a same-cure diagnosis is *a finding, not an edit*. It obeyed, and reported: *"Trestle Run and The Incline retain `hpScale: 30`. Their identical Baron configuration likely carries the same HP burden, but they were deliberately not tuned because the ruling covers Hill Mine only."*

**Verified independently on the merged tree rather than taken on trust:** `"hpScale": 30` returns **3** on main and **2** on the merged tree. Trestle Run (`:418`) and The Incline (`:810`) are untouched. **GATE: owner — the same cure is probably owed to both, but "probably" is not a ruling, and neither map has been played to the Baron.** Recommend folding it into the next desk walkthrough rather than minting a separate question.

**No finding blocks this merge.**
