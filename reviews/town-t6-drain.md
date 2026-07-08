# reviews/town-t6-drain.md — town-T6 surfaces + spec-align DRAIN

**Slice:** town-T6 (menu surfaces move into town) + F-t6-1 spec-align corrector
**Branch/tip drained:** `lane/m4` — town-T6 `541dac8` + corrector `d9bc521` (runner-committed)
**Merged to main:** `d782be6` (s218 fire, 2026-07-08)
**Verdict:** ✅ SHIPPED — **town-v1 is COMPLETE.**

## What it does
Completes the last town-v1 slice. town-T6 moves menu-only surfaces into the
town world: the Start menu is thinned (New Claim / Research entries removed);
the **Schoolhouse** becomes the live "Elder's Survey Chart" (research overlay,
reusing `renderResearchChart`); the **Assay Office porch** shows crafting
**order status**; run-launch stays reachable through the **tavern contract
board** (`town-open-board` → `contract-launch-the-claim`). Tavern + Claim
Office keep their "opens soon" prompts.

The F-t6-1 corrector (`d9bc521`) re-aligned the two adjacent specs that the
thinned-menu model had invalidated:
- **`e2e/town-t1-square.spec.ts`** — launch tail now exits to menu, re-enters
  town, walks to the Tavern, opens the board, launches `contract-launch-the-claim`,
  and asserts `state==='playing'` + `contract.activeId==='the-claim'`.
- **`e2e/town-t3-board.spec.ts`** — both former `start-menu-new-claim` launch
  sites now reuse `openBoard()`; menu-vs-direct contract hash still matches.

## Evidence (gated on the MERGED main tree, s218)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (280ms) |
| town-t1-square + town-t3-board + town-t6-surfaces + 044 | **34/34** both projects |
| adjacent town-t2 + town-t4 + town-t5 + m1-01 + m2-01 | **46/46** both projects |
| console/page errors | zero (specs assert) |
| desktop + 390px mobile | both covered in the passing specs |

Corrector's own pre-merge run (lane/m4): tsc+build green, edited specs 12/12,
regression batch 68/68, 80 total passed, firewall-clean (only the two e2e
files + allowed town-t1/town-t3 artifacts).

## Merge classification
Base = merge-base `fe470f5`. Main had advanced far past it (perf-05,
night-shift, ss-02 all merged since) — so `main..lane/m4` is noisy with
MAIN-MOVED files; classification done off the lane's OWN base diff
(`fe470f5..lane/m4`), per [[stale-lane-shows-mainmerge-as-deletions]].

**LANE-TOUCHED (clean checkout from lane/m4):**
- `src/town/TownScene.ts`, `src/town/town.css`, `src/ui/menu/StartMenu.ts` — the implementation. Main untouched since base → clean apply.
- `e2e/town-t1-square.spec.ts`, `e2e/town-t3-board.spec.ts` — corrector aligns.
- `e2e/044-start-screen.spec.ts` — town-T6 menu-thinning updates.
- `artifacts/town-t1/*`, `artifacts/town-t3/*` — corrector-regenerated evidence.

**Already on main (identical, no-op):**
- `e2e/town-t6-surfaces.spec.ts` + `artifacts/town-t6/*` — swept into main via
  the s217 lock commit `5038620` (leftover staged from s216); byte-identical to
  lane, verified. Main therefore had the *test + evidence* but not the *impl*
  until this drain — this merge closes that gap.

No 3-way was required: the only lane-touched file main had also written
(`town-t6-surfaces.spec.ts`) was identical.

## Findings
None blocking. F-t6-1 (the two stale adjacent specs) is **CLOSED** by this drain.
