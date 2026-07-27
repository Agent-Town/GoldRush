# board-chapter-tab-adoption — drain review (s1112)

- **Slice:** `lane-board-chapter-tab-adoption` (F-1109-1's four frozen page-dot sites)
- **Branch / tip:** `lane/m4` @ `de8f9b00` `runner(lane-b): lane-board-chapter-tab-adoption.md`
- **Merge base:** `c2de2e99`
- **Drained by:** s1112 fire, 2026-07-27
- **§3.0 block-check:** `node scripts/drain-block-check.mjs 20260727-075023-lane-board-chapter-tab-adoption.md` → **✅ CLEAR** (leaf `board-chapter-tab-adoption`, status `authored`)

## Verdict

**MERGED — correct but INCOMPLETE, and the runner said so itself.**

The runner closed its report with **"NOT READY-FOR-GATES"**. I merged anyway, deliberately, and the
reasoning is the substance of this review: the change is *provably in the right direction, provably
non-regressive, and its remaining blocker is a different defect in a different line* that this master
was explicitly forbidden to touch. Merging banks the correct work; the residue is filed as **F-1112-1**
with its cure already verified against a green sibling.

This is **not** a "four greens" merge and must never be cited as one. See the per-spec verdicts below.

## What it does

`6822607f` (2026-07-20, *"reorganize The Book into era chapters"*) retired the per-contract page dot in
favour of per-era chapter tabs, updating seven e2e files and leaving four frozen on the dead control.
This slice moves those four onto the live control:

```
- await page.getByTestId('contract-page-dot-e2-incline').click();
+ // Chapter tabs since 6822607f; chapter derived from the manifest so no literal can freeze again.
+ await goToContractPage(page, 'e2-incline');
```

`goToContractPage()` resolves the chapter from the manifest at runtime
(`listEpochs()` / `loadEpoch()`), so it carries **no frozen epoch literal** — the master forbade
"simplifying" it to a hardcoded id, and the runner obeyed. A local helper per file, as ordered.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean** |
| `npm run build` (merged tree) | **green, ✓ built in 1.94s** |
| Landed bytes vs branch | `git diff lane/m4 -- <4 files>` → **0 lines** (byte-identical) |
| `contract-page-dot` remaining in repo | **0** in `src/`, **0** in `e2e/` (was 4) |
| Runner battery (lane worktree, identical bytes) | desktop **3/7 before → 3/7 after**; 4 failed / 3 passed (6.4m) |
| Chapter guard (`board-era-chapters`) | **3/3 both projects** |
| Console / page errors | **zero** |
| Zero-collection check | no command collected 0 tests |
| `Missing chapter` throw | **never fired** — all four ids resolved in the manifest |

### Per-spec three-way verdict (as the master required — NOT "four greens")

| Spec | Verdict |
|---|---|
| `e2e/cw-02-escort.spec.ts:76` | **unchanged / navigation-red** |
| `e2e/e2-incline.spec.ts:69` | **unchanged / navigation-red** |
| `e2e/e2-pressure-garden.spec.ts:77` | **unchanged / navigation-red** |
| `e2e/e2-trestle.spec.ts:77` | **unchanged / navigation-red** |

Net green count is **unmoved (3/7 → 3/7)**, with the same three passing and the same four failing.
No regression; no gain in greens either.

### Gate deferral, stated honestly

I did **not** re-run the four specs on the merged tree. This is a deliberate Mistake-#12 avoidance,
not an omission:

- lane-a was mid-flight with **rf-37 attempt 3** (codex `63059`), whose entire acceptance proof is a
  **3× desktop repeat of wall-clock races**. s1107 recorded a five-run calibration **voided** by exactly
  this kind of concurrent load. rf-37 has already burned two attempts; corrupting a third to re-measure
  a known-red test is a bad trade.
- The change is **e2e-only**. Nothing imports a `.spec.ts`, so no adjacent suite can be affected; the one
  new cross-file surface is the `listEpochs, loadEpoch` import, which `tsc` covers on the merged tree.
- The behavioural delta was measured by the runner **minutes earlier on byte-identical content**; main's
  only movement since the merge base is `STATUS.md` / `goals.json` / `BACKLOG.md` / a task `.md`, none of
  which can change spec behaviour.

**Attribution:** `tsc`, `build`, the byte-identity check and the `contract-page-dot` sweep are mine on the
merged tree. The 3/7 → 3/7 battery is **the runner's**, cited as the runner's.

## Merge classification

Merge base `c2de2e99`. Per-file, three buckets:

| Bucket | Files |
|---|---|
| **LANE-TOUCHED — payload (merged)** | `e2e/cw-02-escort.spec.ts`, `e2e/e2-incline.spec.ts`, `e2e/e2-pressure-garden.spec.ts`, `e2e/e2-trestle.spec.ts` |
| **LANE-TOUCHED — debris (NOT merged)** | 18 × `.wrangler/tmp/**` bundle scratch, `artifacts/accounts-worker/test-accounts.json`, `artifacts/multiplayer-relay/test-multiplayer.json` |
| **MAIN-MOVED-ONLY (NOT touched, main wins)** | `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-approach-steer-to-arrival.md` |

No 3-way graft was needed: no file moved on both sides. Landed path-scoped via `git show lane/m4:<file>`,
then verified byte-identical to the branch.

**The debris was predicted.** s1110(D) forecast it precisely: F-1108-2's fix (`019e943a`) is **inert**
because the runner parent (pid `35584`, up 16+ days) forked its lane subshell from the *old parsed*
`git add -A`. This is the **third** drain forced to land path-scoped for that reason.
**Robin still owes one clean runner restart.**

## Findings

### F-1112-1 — the four specs' fixtures seed the epoch at the UNSCOPED key, so profile boot falls back to Frontier and the chapter tab they now click is never rendered (P1, cure verified, fire-authorable)

The runner found this and named it correctly; I verified it at source rather than inheriting it.

- The fixtures write `localStorage.setItem(ACTIVE_EPOCH_KEY, 'epoch-2-steamworks')` — the **raw** key
  (`e2-incline.spec.ts:31`, and the sibling shape in the other three), while `profile`, `town` and
  `scores` in the *same* fixture are correctly wrapped in `profileDataKey('robin', …)`.
- `ACTIVE_EPOCH_KEY` is a member of **`PROFILE_DATA_KEYS`** (`src/game/ProfileStorage.ts:53`) and of
  `LATE_PROFILE_DATA_KEYS` (`:70`), so profile storage redirects reads to the **profile-scoped** key.
  The raw seed is therefore never read; `activeEpochId()` (`src/meta/ContractFamilies.ts:947`) misses and
  returns `DEFAULT_EPOCH_ID` — Frontier.
- Only the Frontier chapter tab renders (`src/town/TownScene.ts:1826`), so
  `contract-chapter-tab-epoch-2-steamworks` never exists and the click times out.

**The cure is proven by a green sibling, not by reasoning:** `board-era-chapters.spec.ts:43` — the spec
that already ships green on this very control — seeds
**`activeEpochKey: profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY)`**. That is the house-correct idiom, and a
class sweep confirms it is the majority: **31 e2e specs scope the key via `profileDataKey`, 19 do not**,
and all four of these are in the unscoped bucket.

⚠️ **Do NOT promise four greens when authoring the corrective.** s1110's warning still binds: the
navigation click is only these specs' **first** failure. Success remains *"navigation succeeds, nothing
regressed"*, with a per-spec three-way verdict and a measured before-baseline.

### F-1112-2 — `lane/m4` is left false-ahead by the debris commit (bookkeeping)

After this merge, `git diff main lane/m4 -- e2e/` is empty, but `de8f9b00` keeps the branch "1 ahead" on
`.wrangler/tmp` scratch. Per F-1108-2 that commit will **STOP the next task dispatched to lane-b**.
Handled this fire; recorded so the next reader does not mistake it for owed content.

## Not player-visible

Test-only change; no gameplay surface moved. **No gazette item, no deploy**, per the filter law.
