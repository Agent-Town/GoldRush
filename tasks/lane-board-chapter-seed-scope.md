# Task lane-board-chapter-seed-scope: FOUR E2E FIXTURES SEED THE ACTIVE EPOCH AT THE UNSCOPED KEY, SO PROFILE BOOT FALLS BACK TO FRONTIER AND THE CHAPTER TAB THEY CLICK NEVER RENDERS

**FIRE-AUTHORED (attended review welcome) — s1112, 2026-07-27. This is the corrective that F-1112-1 ordered.** It is the direct successor to `lane-board-chapter-tab-adoption`, merged this fire at **`5f7e43e6`** as *correct but incomplete*: that slice moved these four specs onto the live chapter-tab control exactly as ordered, and their runner then closed **NOT-READY-FOR-GATES** because the navigation is still red — for a reason in a **different line** that its firewall forbade it to touch. See `reviews/board-chapter-tab-adoption.md`.

**READ THIS FIRST: `src/**` IS NOT THE DEFECT AND IS FIREWALLED.** The predecessor's runner searched for a src-side chapter-filtering bug and found none — *"No `src/` defect found or touched; its chapter filtering behaves correctly."* The defect is four fixture lines.

You are Codex (worktrees/lane-c).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (every claim below was read at source s1112, not grepped and not inherited)

**THE SYMPTOM.** After `5f7e43e6`, all four specs call `goToContractPage(page, '<contract-id>')`, which clicks `contract-chapter-tab-<epochId>`. All four time out there. Runner-measured: desktop **3/7 before → 3/7 after**, `4 failed / 3 passed (6.4m)`, and the `Missing chapter` throw **never fired** (so the manifest lookup is fine — the tab simply is not in the DOM).

**THE CAUSE.** The fixtures seed the active epoch at the **raw** key while the runtime reads it **profile-scoped**:

- `ACTIVE_EPOCH_KEY` is `'gr.activeEpoch.v1'` (`src/meta/ContractFamilies.ts:699`).
- It is a member of **`PROFILE_DATA_KEYS`** (`src/game/ProfileStorage.ts:53`) and of `LATE_PROFILE_DATA_KEYS` (`:70`).
- `installProfileStorageScope()` (`:291-300`) patches `Storage.prototype.getItem` so that any profile-data key read through `localStorage` is redirected to its **profile-scoped** name.
- So `activeEpochId()` (`src/meta/ContractFamilies.ts:947`) — which reads `globalThis.localStorage.getItem(ACTIVE_EPOCH_KEY)` — misses the raw seed, and falls through to `DEFAULT_EPOCH_ID` = Frontier.
- Only the Frontier chapter tab is then rendered (`src/town/TownScene.ts:1826`), so `contract-chapter-tab-epoch-2-steamworks` / `-epoch-3-voltage` never exist.

**THE CURE IS PROVEN BY A GREEN SIBLING, NOT BY THIS REASONING.** `e2e/board-era-chapters.spec.ts:43` — the spec that already ships green on this exact control — seeds:

```ts
activeEpochKey: profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY),
```

A class sweep s1112 confirms this is the house-majority idiom: **31 e2e specs scope the key via `profileDataKey`, 19 do not**, and all four of these are in the unscoped bucket. Note the same fixtures **already** scope their `town` and `scores` keys correctly — the epoch line is the lone straggler, which is what makes this a one-line-per-file fix.

### ⚠️ AN OPEN SUB-QUESTION — REPORT ON IT, DO NOT CHASE IT

There **is** a migration that looks like it should already rescue the raw seed: `migrateProfileDataKeys()` (`ProfileStorage.ts:342-350`), called from `ensureProfileState()` (`:119`) for `LATE_PROFILE_DATA_KEYS`, copies a raw legacy value into the scoped key. **It evidently does not fire here, and s1112 did not prove why.** The leading hypothesis, explicitly labelled a hypothesis:

> `:347` migrates **only when the scoped key is null** (`if (rawGet(storage, profileDataKey(profileId, key)) === null)`). These fixtures `page.goto('/')` **first**, let the app boot once (which creates a profile and may write a scoped epoch), and only then write the raw key and `page.reload()`. By reload time the scoped key is already populated with Frontier, so the migration correctly declines to overwrite it.

**The cure below is correct under this hypothesis and under every alternative**, because seeding the scoped key directly beats whatever boot wrote. So: **implement the cure, and in your report state which of these you actually observed** — (a) scoped key already present before reload, (b) migration ran and was overwritten, (c) something else. **Do not change `src/**` to "fix" the migration.** If you find evidence the migration is genuinely broken for real players, **report it as a finding** — that is a product-side question for the owner, not this task's scope.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/e2-arsenal` → **must be EMPTY.** s1112 measured `lane/e2-arsenal` at **0 ahead / 21 behind main**, worktree clean. **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/e2-arsenal main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -c 'goToContractPage' e2e/e2-incline.spec.ts` → **must be ≥1.** If 0, `5f7e43e6` is not in your base and this task's premise is dead: **STOP and report.**
   - `grep -rc 'contract-page-dot' e2e/` → **must be 0.** Non-zero means the predecessor was reverted: **STOP and report.**
   - `grep -c 'profileDataKey' e2e/board-era-chapters.spec.ts` → **must be ≥1** (the reference idiom still exists). If 0: **STOP and report.**

## SCOPE — exactly four one-line edits, nothing else

Each of the four files **already imports `profileDataKey`** from `../src/game/ProfileStorage`, so **no import needs adding**. Verified s1112 at these exact lines:

| # | file | line | change |
|---|---|---|---|
| 1 | `e2e/e2-incline.spec.ts` | `:37` | `epoch: ACTIVE_EPOCH_KEY,` → `epoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),` |
| 2 | `e2e/e2-trestle.spec.ts` | `:45` | `epoch: ACTIVE_EPOCH_KEY,` → `epoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),` |
| 3 | `e2e/e2-pressure-garden.spec.ts` | `:45` | `epoch: ACTIVE_EPOCH_KEY,` → `epoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),` |
| 4 | `e2e/cw-02-escort.spec.ts` | `:40` | `epochKey: ACTIVE_EPOCH_KEY,` → `epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),` |

The profile id is `'robin'` in all four, matching each fixture's own `town` / `scores` keys on the adjacent lines. **Line numbers are a convenience, not the contract — match on the text.** If a line does not read as stated, **STOP and report** rather than guessing.

**Do NOT** also "tidy" the other 15 unscoped specs found in the sweep. They are not measured, most only *reference* the key rather than seeding it, and widening this surface would forfeit the clean before/after attribution that is this task's entire value.

## FIREWALL

**TOUCH-ONLY:** `e2e/e2-incline.spec.ts`, `e2e/e2-trestle.spec.ts`, `e2e/e2-pressure-garden.spec.ts`, `e2e/cw-02-escort.spec.ts`.

**NO:** any file under `src/**` · any other `e2e/**` spec · `playwright.config.ts` · `tasks/**` · `STATUS.md` · `reviews/**` · `.wrangler/**` · `artifacts/**` (see the note below) · any shared helper module · any new dependency.

> **Artifact/`.wrangler` note:** the runner's lane commit currently sweeps `.wrangler/tmp` scratch and artifact churn into the commit (F-1108-2 — the fix `019e943a` is **inert** until Robin restarts the runner). That is not yours to fix and not a violation on your part; just do not *author* changes there. The draining fire will land your work path-scoped.

## SELF-CHECK — and note what success is NOT

**SUCCESS IS NOT "FOUR GREENS."** This is the second fire to say so and it still binds: these are 60–90 s seeded integration specs, and the chapter-tab click is only their **first** failure. Fixing the seed may simply expose failure #2. **Success = "navigation now succeeds, and nothing regressed."**

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green.
3. **Before-baseline, measured not assumed** — on your base commit, before any edit:
   `npx playwright test e2e/e2-incline.spec.ts e2e/e2-trestle.spec.ts e2e/e2-pressure-garden.spec.ts e2e/cw-02-escort.spec.ts --project=desktop-chrome`
   Record `<passed>/<collected>` **and the failing line of each failure.** A positional arg matching no file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — report `<passed>/<collected>` for every command.
4. Apply the four edits. Re-run the identical command. Report `<passed>/<collected>` again.
5. **Per-spec three-way verdict, one line each** — `green` / `still-red-but-PAST-the-chapter-tab-click` / `unchanged`. **A move from "red at the tab click" to "red at a later line" is a SUCCESS for this task** and must be reported as such, naming the new failing line.
6. Adjacent guard — the reference spec must not regress:
   `npx playwright test e2e/board-era-chapters.spec.ts --project=desktop-chrome` → report `<passed>/<collected>`.
7. Mobile: `--project=mobile-chrome` for the four specs; report `<passed>/<collected>`. Mobile reds that are **identical** to desktop are not new findings; a mobile-only red **is**.
8. Zero console/page errors in the specs that reach their asserts.
9. Answer the open sub-question from WHY in one short paragraph: what did you observe about the scoped key's state at boot?

**If a spec is still red at the chapter-tab click after the edit, STOP and report** with the observed value of the scoped epoch key — that would falsify this task's premise, and a third blind attempt on this file set is forbidden (§7.5, changed-premise rule).

READY-FOR-GATES + report: the before/after `<passed>/<collected>` for both projects, the per-spec three-way verdict with new failing lines named, the `board-era-chapters` guard result, and your answer to the open sub-question.
