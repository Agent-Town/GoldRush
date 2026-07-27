# Town T6 assay supersession

Branch: `lane/m3`  
Base: `4fd61ca0`  
Scope: `e2e/town-t6-surfaces.spec.ts` only

---

## DRAIN VERDICT (s1139) — **ACCEPT**

Slice: `lane-town-t6-assay-supersession` · Branch `lane/m3` tip `73f4b661` · Base `4fd61ca0` (already an ancestor of main) · Drained onto main by s1139.

**What it does.** Retires the last two unreachable `assay-bench` assertions in `town-t6-surfaces.spec.ts`, the one sibling file s931's F-931-1 corrective missed. RF-03b put the Complaints Desk in normal play and moved the crafting bench behind `?debug`, so both tests were asserting shipped-reversed behaviour. Each test now gets the boot **its own subject** requires: `:119` (the debug-only crafting panel) boots `?debug` and keeps its full assertion chain; `:155` (plain-boot 390px readability) keeps its plain boot and asserts `complaint-desk`. Test-only — **zero `src/` diff**.

### §3.0 block check
`node scripts/drain-block-check.mjs 20260727-203516-lane-town-t6-assay-supersession.md` → **✅ CLEAR** (`status:"queued"`), run before classification.

### Merge classification
| File | Class | Handling |
|---|---|---|
| `e2e/town-t6-surfaces.spec.ts` | LANE-TOUCHED | clean checkout from `lane/m3`, verbatim — `git diff main:… lane/m3:…` = the same `4 insertions(+), 3 deletions(-)` as the runner commit |
| `reviews/lane-town-t6-assay-supersession.md` | LANE-TOUCHED (new) | taken as-is, this verdict prepended |

Everything else in `main..lane/m3` (`STATUS.md`, `vp-02*.spec.ts`, `reviews/vp-02f.md`, `BACKLOG.md`, `goals.json`, `tasks/…`) is **MAIN-MOVED-ONLY** — main advanced past the base with s1138's own drain. No graft, no conflict.

### Evidence (measured by s1139 on a quiet box, load avg **1.31**, no `codex exec` live; scratch port **5243** — 5188 belongs to the lane runners, Mistake #12)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.69s** |
| `town-t6-surfaces`, both projects, `--workers=1` | **10 passed / 0 failed (36.3s)** |
| ↳ `:119` Assay porch opens the existing crafting order status panel | **PASS** desktop (3.0s) + mobile (3.3s) |
| ↳ `:155` town surfaces stay readable at 390px | **PASS** desktop (5.4s) + mobile (5.9s) |
| Adjacent `bug-office-desk` | **4/4 both projects** |
| Adjacent `m5-04-offline-queue` | **11/11 both projects** |
| Adjacent `task-037-assay-bench-ungate` | 3 reds — **pre-existing, see F-1139-1** |
| Console/page errors | none — every test in the suite ends at `assertNoErrors`, and the suite covers plain-boot desktop (`:90`) and 390px (`:155`) |

**The bar s1138 set, answered literally.** Its handoff required that `assay-pending-card:126` still be **present** in the final test body, because F-1137-4's prescribed wholesale realign would have deleted the suite's only pending-card assertion. ✓ **VERIFIED — it survives**, at `e2e/town-t6-surfaces.spec.ts:127` post-merge, still the **only** hit in all of `e2e/`:

```ts
await expect(page.getByTestId('assay-bench')).toBeVisible();
await expect(page.getByTestId('assay-pending-card')).toBeVisible();
await expect(page.getByTestId('assay-queue-pending')).toBeVisible();
```

The whole diff is 3 changed lines; it deletes no assertion anywhere.

**Mechanism ✓ VERIFIED at source, not taken from the runner.** `AssayBench.ts:283` reads `new URLSearchParams(window.location.search).has('debug')` inside `install()`, and `TownScene.ts:1748` calls it **lazily** — `this.assayBench ??= installAssayBench(…)` from `openAssayBench()` (`:968`), on first door-open. The helper's `history.replaceState` runs after `goto('/')` but before the town is even entered, so the query is in place long before that read. The `replaceState(null, '', \`/${value}\`)` form is **canonical**, not invented: six sibling specs use it byte-identically (`town-chapel-blender:83`, `town-plaza-props-blender:24`, `town-general-store-blender:83`, `town-plate-blender:33`, `town-tavern-blender:83`, `story-loop:57`). It is also deliberately narrower than `goto('/?debug')` — debug reaches only post-boot lazy reads, leaving boot behaviour untouched.

### Findings
- **F-1139-1 (non-blocking, PROVEN pre-existing by control run) — `task-037-assay-bench-ungate` is red on main, and the control is WORSE than the treatment.** With the merge applied: 3 reds — `:171` desktop+mobile and `:192` mobile, all failing inside `debugPlaceAssayOffice` at `:129` (`build.assayOffices` stays `0`, 5000 ms predicate timeout). I reverted the one changed file to main's version and re-ran the same suite: **4 reds** — the same three **plus `:142` desktop**, which had *passed* with the change present. A control that fails a superset of the treatment settles it: this is not merge-caused, and it cannot be — the diff is one e2e file that nothing imports (`grep -rn "town-t6-surfaces" e2e src scripts` matches only s1138's leftover scratch helper). Fingerprint: **F-902-2** names `task-037:171/192` failing "at `debugPlaceAssayOffice` (building placement, BEFORE any desk branch)" and s931 **explicitly excluded** them as structurally pre-existing per the attended "investigate-don't-blind-fix" ruling; `:142`'s intermittency matches **F-m503-1** ("desktop `:142` 1000ms predicate timeout in build/walk flow"). ➡️ **Still owed and still not fire-authorable** — the standing BACKLOG:76 ruling that this needs investigation, not a de-flake, is untouched by this drain. New datum for whoever takes it: `:142` is **intermittent**, not deterministic, so that probe needs a rate.

---

## Pre-flight

- `lane/m3` was at `6acfd18f`, 1 commit ahead of `main`; the worktree had no dirty files, so the unique-blob invariant held vacuously.
- Reset to `main`, `git clean -fd`, and `npm install --no-audit --no-fund` completed.
- The untouched baseline `npm run build` passed.

## Before measurement

The required two-project, one-worker run matched the task's WHY exactly:

| Project | Test | Before |
| --- | --- | --- |
| desktop-chrome | plain menu thins to town, profile, settings | PASS |
| desktop-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS |
| desktop-chrome | Assay porch opens the existing crafting order status panel | FAIL — `assay-bench` absent |
| desktop-chrome | run launch remains reachable through the tavern board | PASS |
| desktop-chrome | town surfaces stay readable at 390px | FAIL — `assay-bench` absent |
| mobile-chrome | plain menu thins to town, profile, settings | PASS |
| mobile-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS |
| mobile-chrome | Assay porch opens the existing crafting order status panel | FAIL — `assay-bench` absent |
| mobile-chrome | run launch remains reachable through the tavern board | PASS |
| mobile-chrome | town surfaces stay readable at 390px | FAIL — `assay-bench` absent |

Result: **6 passed / 4 failed**. Both failures occurred after the Assay Office door opened.

## Repair

- `openTown(page, query = '')` now copies the canonical post-menu-load `history.replaceState` query injection.
- The crafting-order-status test boots with `?debug`.
- The 390px plain-boot test asserts the player-facing `complaint-desk` testid.
- No pending-order seed was needed: with the existing profile seed and the debug panel reachable, `assay-pending-card` and `assay-queue-pending` both rendered.

The crafting test body retains every required check and action:

```ts
test('Assay porch opens the existing crafting order status panel', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await openTown(page, '?debug');

  await walkTo(page, { x: 6.6, z: 7.2 }, 'assay_office');
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect(page.getByTestId('assay-pending-card')).toBeVisible();
  await expect(page.getByTestId('assay-queue-pending')).toBeVisible();
  await shot(page, testInfo, 'assay-status');
  await page.getByTestId('assay-close').click();
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  assertNoErrors(errors);
});
```

## Mutation proof

Temporary working-tree mutation: renamed `ComplaintDesk`'s root testid from `complaint-desk` to `complaint-desk-mutation-proof`.

- Mutated run: `town surfaces stay readable at 390px` on `mobile-chrome` — **RED**, specifically at `expect(getByTestId('complaint-desk')).toBeVisible()` because the element was absent.
- Reverted run: the same named test and project — **GREEN, 1 passed**.
- The mutation was reverted; `git diff -- src/` is empty.

## After measurement

Final two-project, one-worker run:

| Project | Test | After |
| --- | --- | --- |
| desktop-chrome | plain menu thins to town, profile, settings | PASS |
| desktop-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS |
| desktop-chrome | Assay porch opens the existing crafting order status panel | PASS |
| desktop-chrome | run launch remains reachable through the tavern board | PASS |
| desktop-chrome | town surfaces stay readable at 390px | PASS |
| mobile-chrome | plain menu thins to town, profile, settings | PASS |
| mobile-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS |
| mobile-chrome | Assay porch opens the existing crafting order status panel | PASS |
| mobile-chrome | run launch remains reachable through the tavern board | PASS |
| mobile-chrome | town surfaces stay readable at 390px | PASS |

Result: **10 passed / 0 failed**.

An earlier post-repair run was 9/10 because desktop's 390px test transiently exhausted `walkTo` before reaching the assay assertion; the unchanged test passed in the final full run.

## Gates

- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `town-t6-surfaces`, desktop + mobile, `--workers=1`: **10/10 PASS**.
- Console/page errors: none; every test reaches `assertNoErrors`.
- Screenshots were written by the existing `shot()` helper under `artifacts/town-t6/`; their tracked refreshes were restored to `main` to honor TOUCH-ONLY.
- Outside TOUCH-ONLY: nothing retained. The required temporary `src/` mutation was reverted.

READY-FOR-GATES
