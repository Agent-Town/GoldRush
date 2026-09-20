# s2091 — the buried gold seams (owner, 2026-08-20: "There is not gold to be collected")

Evidence for `fix: seams follow the sculpted terrain`. Every shot is desktop-chrome 1280x800,
`?contract=<id>&nolevel&nopause&seed=sr01&debug`, hero teleported to the first live seam's anchor
(`-on`) and 4 m south of it (`-near`). Identical framing across before/after — the ONLY difference
is whether `Game.resampleVisualHeights()` calls `HarvestSystem.resampleTerrain()`.

| File | What it shows |
|---|---|
| `before/e9-seed-run-near.png` | The owner's map. Live seam at (0,9), tooltip firing, gold banking — **bare ground**. |
| `after/e9-seed-run-near.png` | Same anchor, same frame: the seam's gravel-and-pan decal, on the ground. |
| `before/e1-dry-gulch-near.png` | E1 was affected too (−0.42 to −1.59 m). Bare. |
| `after/e1-dry-gulch-near.png` | Seam present. |
| `before/e6-glow-mesa-near.png` | The worst-but-one burial in the family (−5.14 m). Bare. |
| `after/e6-glow-mesa-near.png` | Seam present. |
| `e9-seed-run-afterreset.png` | THE NATURAL EXPERIMENT that named the mechanism, taken on the UNFIXED build: `__GR_TEST__.resetRun()` re-places the seams through the same `GoldNode.place()` **after** the sculpt's height source is installed, and the seam appears at the identical anchor. |
| `e1-dry-gulch-afterreset.png` | Same experiment, same result, second map. |

Reproduction harness: a scratch `playwright.s2091.config.ts` (self-booting `vite --port 5273`,
`.gitignore`d like every other `playwright.s*.config.ts`). The permanent guard needs no scratch
config — `e2e/seam-visual-follows-sculpt.spec.ts` is collected by the default `playwright.config.ts`
and runs on both projects.
