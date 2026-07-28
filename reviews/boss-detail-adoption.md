# boss-detail-adoption — the duel winners take the field

**Slice:** `lane-boss-detail-adoption` · **branch:** `lane/perf` · **tip:** `8f1264de` · **base:** `11c4d35c`
**Drained:** s1181 fire, 2026-07-28 · **Verdict: MERGE**

## What it does

The boss-detail duel had a confirmed owner verdict (rubric `docs/bench/boss-detail-duel.md`; perf
slice a measured tie) and the winning GLBs were already banked on main — but nothing pointed at
them. Two constants per boss now do:

| Boss | GLB | Triangles |
|---|---|---:|
| Dredge-Queen | `dredge-queen.glb` → `dredge-queen-detail-opus5.glb` | 11,832 → **33,124** |
| Salvage Claw | `salvage-claw.glb` → `salvage-claw-detail-opus5.glb` | 10,164 → **30,100** |

The shipped originals stay in place, so rollback is one revert (per the master, and per the
Retention Law: the runner-up `sol` entries stay in-tree too).

## The risk this slice carries, and how I retired it

Neither count is asserted by any e2e spec. They are an **internal equality gate**:
`DredgeQueenBossSystem.ts:585` and `SalvageClawBossSystem.ts:522` both `return null` unless
mesh count, `meshes.size`, material count **and** triangle count all match. A wrong integer does
not throw — the 3D boss silently fails to mount and the player sees the fallback. That is exactly
the Mistake #10 shape, and a green spec suite is not sufficient evidence against it.

So I verified every term of both gates **directly from the GLB binaries**, not from the runner's
report — parsing the glTF JSON chunk and counting index accessors:

| Gate term | Dredge-Queen | Salvage Claw |
|---|---|---|
| triangles vs constant | 33,124 = **33,124 ✓** | 30,100 = **30,100 ✓** |
| mesh count | 4 = **4 ✓** | 3 = **3 ✓** |
| material count | 1 = **1 ✓** | 1 = **1 ✓** |
| node names vs `contract.mesh` | `claw · paddle_port · paddle_starboard · hold` **✓** | `winch · anchor_feet · crown` **✓** |
| morph target names, 1 influence each | `Damage_SlackClaw · Damage_BrokenPortPaddle · Damage_BrokenStarboardPaddle · Damage_CrackedLootHold` **✓** | `Landing_SprungWinch · Landing_SettledAnchorFeet · Landing_DarkCrown` **✓** |

All four terms of both gates are satisfied by the assets on main. The models mount.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.65 s** |
| `e5-boss-dredge-queen.spec.ts` + `e8-boss-salvage-claw.spec.ts` | **12/12 passed**, desktop + 390px mobile, 2.3 m |
| Frame p95 vs non-boss tile (the ≤15% envelope) | **desktop 1.0217 · mobile 1.0109** — ~3× the triangles cost ~1–2% |
| Merge classification | both files **LANE-TOUCHED only** — `git log 11c4d35c..main -- <both systems>` **EMPTY** |
| Screenshots | `artifacts/boss-adoption/{dredge-queen,salvage-claw}-detail-opus5-mounted.png` |

Gated on **scratch port 5234, external server** — lane-c was LIVE (Mistake #12).

⚠️ **Only the tip commit `8f1264de` was taken.** `lane/perf` also carries `e2838ce3`
(`lane-d-suite-red-inventory`), which uniquely holds the >100 MB `suite-red-inventory-raw.json`
(F-1167-3) and remains **frozen** — the graft was per-file from the tip, and lane-d was neither
reset nor refilled.

## Findings

- **F-1181-4 (non-blocking, owner-visible follow-up, raised by the runner and confirmed here).**
  The winners ship a **2048 atlas**, roughly **16 MB of VRAM per boss** of the delta. A 1024
  variant was correctly **not** attempted — the master forbade it and it is art-slot work. Worth
  scheduling once, for both bosses together.
- **F-1181-5 (bookkeeping).** No goal leaf existed for this master (§3.0 block-check returned
  `? UNKNOWN`); registered in this drain commit. Third instance this fire — see the s1181 handoff.
- Scope 2 ("update every spec pinning the old counts") produced **no diff**, and that is correct,
  not a miss: `grep` over `e2e/` finds no assertion on either count. Verified rather than assumed,
  because "the runner changed nothing here" is the Silent No-Op shape (Mistake #1).
