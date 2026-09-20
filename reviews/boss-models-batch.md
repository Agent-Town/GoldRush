# Drain review — `boss-models-batch`: Astra's rebuilt Dredge Queen and Old Digger land with the two morph-contract hunks held out of the runtime land; the Salvage Claw held (attended drain, 2026-09-17)

**Slice/branch/tip:** `feat/boss-models-batch` @ `4d7909242 (archive: pruned by the A3 rewrite)` — three commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `b70ef3b31`; master `tasks/boss-models-batch.md`; the implementer's full report, capture recipes and runtime state: `artifacts/boss-models-batch/report.md`. **Merged as** `acde76581` onto main `a4d038ecc` (`git merge --no-ff`, zero conflicts), era-6 pin #6 `95972a35…` appended on the merged tree (render-side `src`), landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "I think what Astra started is worth it" · 2026-09-17 "Lets do them all." · "All on the Anthropic subscription".

## VERDICT: LANDED — two of three bosses; the Salvage Claw held with the measured reason

## 1. What landed (measured on the landed GLBs by the implementer; spot-checked at the drain: the GLB guard, the era guards, one capture eyes-on)
| | Dredge Queen (E5) | Old Digger (E9) | Salvage Claw (E8) |
|---|---|---|---|
| verdict | **LANDED** | **LANDED** | **HELD** (F-BMB-4) |
| bytes | 6,588,168 → 8,297,784 (optimized 1,480,976 → 1,217,764) | 3,548,152 → 1,959,340 (optimized → 267,216) | 4,323,572 → (7,131,704) |
| triangles | 44,920 → 33,124 | 16,104 → 7,192 | 30,844 → (30,100) |
| meshes / materials | 4 / 1 (same names) | 3 → 4 (`bucket_wheels` split port / starboard) / 1 | 3 / 1, identical |
| atlas | 1024² → 2048² | 1024², 2,209,575 → 1,347,820 B | 1024² → (2048²) |
| morph cycles | claw gains `Cycle_OpenGrab` | `GentleBuckets` on both wheels | identical to main's — gains nothing |

The two held hunks are re-applied by reading against main's current files (seven sites, +31/−12): the Dredge Queen's loader now requires `Cycle_OpenGrab` on the claw and drives it with sin²(π·progress), the same curve as the fallback jaws; the Old Digger's loader requires the 4-mesh split-wheel shape and spins both wheel nodes on z (pivots measured: port lowest point −0.0001, starboard +0.081, so a z-spin turns in place). Main's `presentationCenter`, yaw convention, label widths, ceremony yaw, rider height and emissive values stay (the master's rule). Both contracts hold in the browser (`mounted="true"`, `source="glb"`, both viewports) and the loaders now refuse a model without them — the reason F-SAR-4 held the hunks is gone with the models that caused it. Shipped boss bytes go DOWN: the diet's bosses family 4,989,588 → 4,353,216 B compressed (−12.8 %).

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / `npm run build` / `GR_RELEASE=e1` build | rc=0 / rc=0 / rc=0 | rc=0 / rc=0 / rc=0, first town 48,968,840 B of 52,000,000 (drain, chained tree) |
| first-town payload | 48,914,924 B (no boss in the first town) | — |
| `scripts/glb-contract-guard.mjs` | one grandfathered line with cause: 423 GLBs · 6 violations · 6 grandfathered · 0 live | 423 · 6 · 6 · 0 live |
| `glb-contract-guard.test.mjs` + `deploy-mirror-allowlist.test.mjs` | 24 / 0 (both GLB paths already on the mirror; no diet-manifest change needed) | — |
| e2e, 54 tests both projects (`e5-boss-dredge-queen`, `e9-old-digger*`, `e8-salvage-claw*`/`wire-*-3d`, `e3-crawler-boss`, `057`) | 46 / 8, every red attributed: 4 renderer-count asserts byte-identical on a control built from main's files in the same worktree (the F-SAR-7 chain — no artifact re-recorded, the measured answer), 2× `057:251` pre-existing, 2× `e5:237` p95 with the boss arm identical across trees (median 16.65 vs 16.55 ms) and the non-boss denominator flipping between a vsync-locked ~16.6 ms and a free ~10.3 ms mode (F-DRB-10) | reused — every red carries a control |
| plain boot | zero console/page errors, both viewports | — |
| engine era | hash `95972a35…` reported | pin #6 appended, guards 9/9 |
| full `test:node-guards`, Node 26 | not run (the drainer's) | 796 tests, 793 pass, 1 fail, 2 skipped (883 s) on the chained boss + roster tree: the one red is the fixture-owner sweep, whose only survivor is `scripts/modified-tracked-evidence-census-guard.test.mjs` (eleven `mtec-*` temp directories) — a fire's guard landed on main today (`1cd8dbbd3`, s2603) that passes 16/16 and leaks its directories on MAIN ALONE (measured: `TMPDIR` scratch, 11 survivors), so the sweep is red on main independently of this land (hygiene item 7, F-HYG-7); stages 2–7 run separately on the same tree, rc=0 (`attended-battery-stages2-7-chain.log`). The boss-only battery before the roster merge read 791/2, its second red `secure-choice-refusal.test.mjs` green alone (contention beside the roster agent\'s probes) |

## 3. Findings
- **F-BMB-1 (informational, owner-visible trade):** the Dredge Queen trades 11,796 triangles for a 2048² atlas (4× texture memory); shipped bytes go down and the in-play read is good, but it is two fidelity strategies rather than a straight upgrade. If both are wanted: one Blender re-bake at 1024² with the builder that landed here, then delete the baseline line. Not blocking.
- **F-BMB-2 (pre-existing on main, small corrective):** `salvage-claw-detail-opus5-asset-contract.json` declares 7,131,704 B / 30,100 tri while main ships 4,323,572 B / 30,844 tri — the 2026-09-12 fidelity land replaced the GLB and left that sidecar; the layer contract is accurate, so the family has two contracts and one rotted. The GLB guard does not read the sidecar.
- **F-BMB-3 (instrument, corrective owed):** the E5 p95 gate (`e5-boss-dredge-queen.spec.ts:237`) has been re-derived by hand in three drains now; the diagnosis is firm: a mode-aware comparison, or an absolute boss-arm budget instead of a ratio to a co-measured tile.
- **F-BMB-4 (held):** the Salvage Claw's rebuilt model is the older July duel lineage re-exported on 2026-09-10, superseded by the reviewed 2026-09-12 fidelity bake; identical morph set, +2.8 MB, a second cap violation, and the loader's scale 0.78 would render it 21 % narrower and 17 % shorter. Nothing waits on it.
- The Echo, the Land Yacht and `Balance.ts` stay byte-identical to main (F-SAR-5/-6 are not this task).

## 4. What was touched
`assets/pilots/dredge-queen-3d/**` and `assets/pilots/old-digger-3d/**` (from `92f6cc115`), `assets/layer-contracts/{dredge-queen,old-digger}.v1.json`, `src/systems/{DredgeQueen,OldDigger}BossSystem.ts` (the held hunks and loader constants), `scripts/glb-contract-guard.baseline.json` (one dated line), `assets/LEDGER.md` (one batch row), `artifacts/boss-models-batch/**`; at the drain `assets/engine-era.json` (pin #6), this review, `tasks/goals.json`, `tasks/BACKLOG.md`.
