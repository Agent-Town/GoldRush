# contract-art-key-adoption — drain review (s1109)

- **Slice:** `lane-contract-art-key-adoption` (F-1104-6 / s1105-authored corrective)
- **Branch / tip:** `lane/e2-arsenal` @ `7f178acf` — `runner(lane-c): lane-contract-art-key-adoption.md`
- **Merge-base:** `3314658c` · **Merge commit:** `a659020a`
- **Verdict:** ✅ **MERGED** — test-only, renderer untouched, The Adoption preserved.

## What it does

Three e2e specs had frozen assertions on a contract-art vocabulary that **The Adoption**
(`3a007ea7`, owner 2026-07-20, quoted in-source at `TownScene.ts:2527`) retired. Since that
landing, `renderContractArt()` emits the single constant `data-contract-art-key="plate"` for
all 41 cards. The specs still demanded per-card keys (`contract-the-claim`, `contract-dry-gulch`, …),
so they were red on a correct renderer.

The slice moves the specs to the shipped contract and deletes the dead vocabulary:

| File | Change |
|---|---|
| `e2e/town-t3-board.spec.ts` | assertion at `:203` → `'plate'`; **six** dead `BOARD_CONTRACTS.artKey` literals removed |
| `e2e/e2-pressure-garden.spec.ts` | assertion at `:74` → `'plate'` |
| `e2e/e2-trestle.spec.ts` | assertion at `:74` → `'plate'` |

`src/**` was firewalled and is **untouched** — repairing the renderer would have reversed a
ratified owner ruling. Per-card art coverage remains guarded by the pre-existing
`e2e/board-card-images.spec.ts`, which walks all 10 epochs / 41 contracts asserting each card's
image differs from The Claim; the master forbade duplicating it and no duplicate was added.

## Evidence (measured this fire, on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in **1.45s** |
| Battery, **desktop-chrome** | **7 passed / 2 failed**, 1.7m |
| Battery, **mobile-chrome (390px)** | **7 passed / 2 failed**, 2.2m |
| Collected count | **9 tests in 4 files**, both projects (no silent-zero collection — F-1094-1 / F-1104-5 class) |
| Console/page errors | zero across the 7 passing tests |

Battery = `town-t3-board` + `e2-pressure-garden` + `e2-trestle` + `board-card-images`.
The runner's reported `6/9 → 7/9` on desktop reproduces exactly.

### §3.0 block check
`node scripts/drain-block-check.mjs 20260727-065051-lane-contract-art-key-adoption.md`
→ **✅ CLEAR** — `status="authored"`, run **before** classification, per `fire.md §3.0`.

### Merge classification
Two-dot `git diff main lane/e2-arsenal` listed 6 paths. Only the **3 e2e files are LANE-TOUCHED**;
`STATUS.md`, `tasks/goals.json`, and `tasks/lane-town-plaza-slot-diagnostics.md` are
**MAIN-MOVED stale-base phantoms** (main advanced 3 commits past the base; the lane never held them).
No overlap ⇒ no graft needed, `ort` merged cleanly. The lane commit carries **no `git add -A`
debris** (F-1108-2 class): 3 files, 11 insertions, 9 deletions, all `e2e/`.

## Findings

### F-1109-1 — the two remaining reds are a SECOND stale-DOM class the master never knew about, and it has FOUR sites, not two ✓ VERIFIED
`e2-pressure-garden` and `e2-trestle` still fail on both projects — but **not on the assertion this
slice changed**. Both die at **`:69`**, five lines *upstream* of the edit at `:74`:

```
locator.click: Test timeout of 60000ms exceeded.
  waiting for getByTestId('contract-page-dot-e2-trestle')
```

`contract-page-dot-*` appears in **zero** files under `src/` and **four** under `e2e/`.
`git log -G"contract-page-dot" -- src/` names the retirement: **`6822607f`**, *"feat: reorganize
The Book into era chapters"* (2026-07-20, on main) — the same day as The Adoption. That landing
updated **seven** e2e files and left four frozen on the retired control:

| Spec | Line | Retired call |
|---|---|---|
| `e2e/e2-pressure-garden.spec.ts` | `:69` | `contract-page-dot-e2-pressure-garden` |
| `e2e/e2-trestle.spec.ts` | `:69` | `contract-page-dot-e2-trestle` |
| `e2e/e2-incline.spec.ts` | `:61` | `contract-page-dot-e2-incline` |
| `e2e/cw-02-escort.spec.ts` | `:68` | `contract-page-dot-e3-canyon-works` |

All four **click** the dot, so all four are hard-red at that line. s1105 measured two of them and
attributed their redness to the art-key; the art-key assertion in those two files **was never
reached**. So this slice's real gain is `town-t3-board` alone — which is exactly the 6/9 → 7/9 it
reports, and the report is honest.

**Fingerprint:** the failing locator is upstream of the only edited line in each file, and the edit
is a single string literal inside an assertion — structurally incapable of causing a `:69` timeout.
Corroborated independently by the zero-hit `src/` grep and the dated removal commit. **Pre-existing,
not merge-caused.**

**The cure already ships and is green in-repo**: `town-t3-board.spec.ts:121-126`
(`goToContractPage`) navigates by `contract-chapter-tab-<epochId>`, deriving the chapter from the
manifest at runtime via `listEpochs()`/`loadEpoch()` — no frozen literal, so it is also
F-1101-2-compliant. Corrective authored this fire: `tasks/lane-board-chapter-tab-adoption.md`.

### F-1109-2 — `tsc` structurally cannot catch either class ✓ VERIFIED (carried forward from s1105)
`BOARD_CONTRACTS` is a spec-**local** literal and `getByTestId` takes a string, so neither the
retired art keys nor the retired page-dot ids are typed against anything the renderer exports.
Both classes were only visible by running the suite. Non-blocking; recorded because it is the
reason a two-month-old retirement can sit red without a single compile error.

## Player-visible change
**None** — test-only. No gazette item, no deploy, per the filter law.
