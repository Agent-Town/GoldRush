# Task lane-blocked-storage-boot-2: FINISH THE BLOCKED-STORAGE BOOT FIX — THE THIRD READ (LANE-A, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1082, 2026-07-26. This is the CONTINUATION of `lane-blocked-storage-boot.md`, which STOPPED LAWFULLY on a firewall. It is attempt 2 with a CHANGED PREMISE: the firewall that stopped you is explicitly LIFTED below for exactly one file.**

You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT — ⛔ DO **NOT** RESET THIS LANE. READ THIS TWICE.
The previous run's work is **committed on `lane/m3` at `a86bc334` and is NOT on main.** A `git checkout -B lane/m3 main` would **destroy it** (this is the Reset Massacre, CLAUDE.md Mistake #2). You are **continuing on top of it**, not starting over.
Verify, do not inherit — all three must hold before you touch a file:
1. `git log -1 --format=%h lane/m3` prints **`a86bc334`**.
2. `git log main..lane/m3` prints **exactly one commit**, `runner(lane-a): lane-blocked-storage-boot.md`.
3. `src/game/ProfileStorage.ts` `rawGet()` and `rawSet()` **both already contain a `try`/`catch`** (the predecessor's work — read them and confirm).
If any of the three fails: **STOP and report.** Do not reconcile it yourself.

READ FIRST (paths, in your worktree, before writing anything):
- `src/game/TileStateStore.ts` — `readSnapshot():47-55` (**the defect**), `commitAtRunEnd():98-102` (**the pattern to copy — the WRITE in this very class already guards with `try`/`catch` and a `console.warn`**), and `parseSnapshot():172-173`.
- `src/game/ProfileStorage.ts` — `rawGet():484-491` as the predecessor left it, and `export type ProfileStorage = Pick<Storage,'getItem'|'setItem'|'removeItem'>` at `:92`.
- `src/systems/E6TileConsumerSystem.ts:379-381` — `readState()`, the boot-path caller.
- `tasks/lane-blocked-storage-boot.md` — the predecessor master, and its report in `tasks/runs/20260726-184130-lane-a-lane-blocked-storage-boot.md.log` (tail).

## Why this task
The predecessor guarded `rawGet`/`rawSet` and then reported, verbatim:

> After the helper fix, the same case advances to a third unguarded boot read:
> `TileStateStore.readSnapshot:51 → E6TileConsumerSystem.readState:380 → new E6TileConsumerSystem → Game → startGame`
> The task firewall allows only `src/game/ProfileStorage.ts` … Completing the boot fix therefore requires the orchestrator to authorize `src/game/TileStateStore.ts` or re-author the task.

**That STOP was correct and is the behaviour this factory wants** — the predecessor master contradicted itself (scope item 3 said "guard it", the firewall said "no other `src/` file **at all**"), and Codex obeyed the firewall. That authoring defect is recorded as **F-1082-1**; it is not your problem to fix.

**Re-verified at authoring time by reading the files (s1082), not inherited:**
- `TileStateStore.ts:51` is `const raw = this.storage.getItem(tileStateKey(...))` — a **direct** call on `ProfileStorage`, which is a `Pick<Storage,…>`, i.e. the raw browser API. Under a throwing `getItem` it propagates. ✓
- `E6TileConsumerSystem.readState():380` calls `this.tileState.readSnapshot(this.contractId)` on the boot path. ✓
- **The same class already guards its WRITE:** `commitAtRunEnd():99` wraps `this.storage.setItem` in `try`/`catch`. The read was simply forgotten. This is the *identical asymmetry* as `ProfileStorage`'s guarded `browserStorage()` beside its (formerly) unguarded `rawGet()` — the same defect shape, twice, in two files.
- **The degradation is provably safe:** `parseSnapshot(null)` returns `emptySnapshot()` (`:172-173`). So "storage threw" collapses to "no tile state saved yet" — the ordinary first-boot state every caller already handles. You are not inventing a fallback; you are routing to the one that exists.

## Scope
1. **`TileStateStore.readSnapshot` becomes fail-soft.** A throwing `getItem` must yield `emptySnapshot()` via the existing `parseSnapshot(null)` path — **not** a new empty-object literal, and **not** a changed return type. Match the house voice of the guard 48 lines below it in the same file (`commitAtRunEnd():99-102`): a `console.warn` naming the `contractId` and the reason. Cache the result in `this.snapshots` exactly as the success path does, so a blocked browser degrades **once** rather than throwing-and-warning on every frame that reads tile state.
2. **Do NOT invent a shared helper, a retry, or an in-memory shadow store.** An exported `safeGetItem` is a tempting generalisation and is explicitly **out of scope** — there are ~30 other direct storage reads across `src/` (item 4) and choosing a migration strategy for them is a design decision, not this task.
3. **Prove it with the oracle, end to end.** `e2e/task-024-blast-aim-presets.spec.ts:130` must now go **green on both projects** — the predecessor reported it advancing past `rawGet` and dying at this read with `Test timeout of 30000ms exceeded. / Error: page.waitForFunction: Test ended.` Getting past *that* verbatim failure is the acceptance bar.
4. **Report — do NOT fix — the rest of the class.** `grep -rn "storage\.getItem\|localStorage\.getItem\|sessionStorage\.getItem" src/` returns **~33 direct reads** (s1082 measured; `SaveSlots`, `MetaProgress`, `Medals`, `ResearchTree`, `AccountSync`, `RideTogether`, `TownNaming`, `encyclopedia/*` and more). **List in your report only those you can show are on the plain-boot path**, with the call chain for each. That list becomes the next rung; guarding them here would be unbounded scope.
5. **Mutation control (mandatory — this is how the fix is proven).** Once green, revert *only* your `readSnapshot` guard, re-run the oracle, and **record the failure message verbatim**; then restore and confirm green again. A green test proves nothing about a fix that would have passed either way (F-1080-B). State explicitly that the restored tree is the tree you are handing over (re-run `tsc` after the restore).

## Firewall
**TOUCH-ONLY:** `src/game/TileStateStore.ts` · `e2e/task-024-blast-aim-presets.spec.ts` (only if scope item 3 needs a case).
🔓 **FIREWALL LIFT, EXPLICIT:** the predecessor's blanket "**NO:** any other file under `src/`" is **hereby lifted for `src/game/TileStateStore.ts` and that file ALONE.** You are authorized to edit it. Everything else below stays forbidden.
**NO:** `src/game/ProfileStorage.ts` — **the predecessor's guards are already correct and committed; do not re-touch, re-format, or "improve" them** · any other file under `src/` · `functions/` at all · `src/game/Balance.ts` · `rehearsal/segments/e1-depth-play.mjs` · `src/town/**` and `src/ui/**` · no new dependency · no reformatting of untouched lines.

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/task-024-blast-aim-presets.spec.ts` green on **both** projects (desktop-chrome and mobile-chrome/390).
- Adjacent, unmodified-green on both projects: `e2e/profile-first-boot.spec.ts` · `e2e/m3-06-demo-profiles.spec.ts` · `e2e/board-gating-and-profiles.spec.ts`.
- 🔴 **MANDATORY, not optional — the three suites that actually exercise the file you are editing:** `e2e/tp00-tile-persistence.spec.ts` · `e2e/e6-tile-consumers.spec.ts` (**this one covers `E6TileConsumerSystem`, the exact boot-path caller in your trace**) · `e2e/tile-identity-pass.spec.ts`. Names verified to exist at authoring time (s1082). **Omitting the suite that covers your own edit is precisely the gap F-1081-1 was written about** — the lane report that ran everything *except* the two suites exercising the function it had just modified. Run all three on both projects and report their counts.
- ⚠️ **Do NOT add `e2e/town-t5-townsfolk.spec.ts` or any `ts-0*`/`safari-swap`/`never-trap` spec:** they abort at COLLECTION via `import.meta.glob` (F-1081-6) and take the whole run's verdict with them. **If any run prints no `N passed`/`N failed` summary line, treat it as ABORTED, not clean.**
- Zero console/page errors in a plain boot probe (no `?debug`), desktop and 390px. ⚠️ Note your own scope-1 `console.warn` fires **only** under blocked storage, so a normal boot probe must still be silent — if it warns in a normal boot, your guard is catching something it shouldn't.

READY-FOR-GATES + report: the mutation-control failure message verbatim, the oracle's before/after on both projects, your scope-4 boot-path list (with call chains), and confirmation that `ProfileStorage.ts` is byte-identical to how the predecessor left it.
