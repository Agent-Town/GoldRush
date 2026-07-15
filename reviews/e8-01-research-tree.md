# Review — e8-01-research-tree

**Slice:** e8-01-research-tree — the Orbital Frontier research chart (epoch-8)
**Branch/tip:** lane/m4 @ `47f4181d` (`runner(lane-b): e8-01-research-tree.md`); base `a3d0d5e2` (ancestor of main)
**Drained by:** s594 fire, 2026-07-15
**Verdict:** ✅ MERGE — clean additive graft, board-gated future era (NOT player-visible → NO GZ)

## What it does
Adds the epoch-8 "Orbital Frontier" research tree following the proven e3/e4/e5/e6/e7 pattern: a locked epoch dir (`assets/contracts/epoch-8-orbital/`) with a manifest (order 8, `scienceThreshold` 20, `locked:true`), EMPTY contracts (banked, application unwired until its slice), and a FULL 15-node research tree across 3 branches — **Astrogation** (gravity & atmosphere: mare survey → gravity tables / atmosphere dials → lunar-day ledger → lava-tube charts), **Arsenal** (lenses & seals: vacuum lenses → lens turret / breach seals → magnet grapple → claw component science), **Fabrication** (regolith & cargo: regolith assay → dome panels / airlock receipts → mass-driver windows → riverward manifest). Registers epoch-8 in `src/meta/ContractFamilies.ts` + `src/encyclopedia/registry.ts`; reveals in ledger voice; a `colony-seed` megaproject transitions to e9 "The Red Fields". Placeholder icons reused until `icons-e8.png` is processed (LEDGER note added).

## Merge classification
Base `a3d0d5e2` is an ancestor of main (`82e73807`). Runner delta (`a3d0d5e2..47f4181d`) is a surgical 9-file set, all **LANE-TOUCHED**; `git diff a3d0d5e2 main` on the 4 modified files is EMPTY (main did not move them since base) → **no 3-way graft needed**, clean checkout-graft. New paths (`epoch-8-orbital/`, `e8-research-tree.spec.ts`, `artifacts/e8-research-tree/`) do not exist on main; `git grep epoch-8 main` = empty → **no epoch-8 collision** (e8 is the live frontier, main has e1–e7 only). The `git diff main lane/m4` superset (STATUS.md + retired queue files) is stale-base noise from the lane's older fork point — correctly EXCLUDED from the graft.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 663ms |
| `e8-research-tree.spec.ts` (own) | **2/2** — desktop + mobile (Orbital Frontier chart renders frontier, picks pinnable) |
| `research-inheritance.spec.ts` (adjacent) | 2/2 (Frontier science suspend-canonical in Steamworks; sha256 stable) |
| `schoolhouse-era-truth.spec.ts` (adjacent) | 4/4 (era-truth + heal-forward) |
| `research-chart.spec.ts` (adjacent) | 8/8 (node states, pins, no false marks, banked overflow) |
| `e7-research-tree.spec.ts` (nearest prior) | 2/2 (registry graft preserved) |
| Boot / console errors | zero — covered by the spec boots (playwright fails on page errors) |

Adjacent battery: **18/18 green** — the additive registry graft broke nothing.

## Canon check (brief §9)
Clean. No firearms: "Vacuum Lenses" = a warm beam through empty air "where no report or concussion can follow"; "Lens Turret" = a tracking silver lens on the beam-relay footing. Frontier-tech orbital voice throughout (mare atlas, gravity tables, dome panels, mass-drivers), warm illustrated ledger prose, no gore, no peoples-as-enemies.

## Findings
None blocking.
- **F-1 (owner ratification, non-blocking):** the 15-node table (3 branches × 5) awaits owner sign-off per the master's END clause. Node list is in the manifest (`assets/contracts/epoch-8-orbital/manifest.json`) and summarized above. Application stays unwired until the e8 gameplay slice, so the nodes are display-safe. → OWNER'S DESK.

## Screenshots
`artifacts/e8-research-tree/{desktop,mobile}-chrome-chart.png` (runner-produced).
