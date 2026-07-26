# Task lane-blocked-storage-boot-3: END THE STORAGE WHACK-A-MOLE — ONE EXPORTED GUARD, THE NAMED BOOT-PATH SITES (LANE-A, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1083, 2026-07-26. Round 3 and the LAST one, by design. Rounds 1 and 2 (`rf-19`, `rf-20`) merged in `2cd221d1d3c0e0d05da093693da243f6cd0e14a9`; each fixed exactly the one read that happened to be next. This task fixes the REASON there is always a next one.**

You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT — safe-dupe, and this lane IS safe to reset (verified s1083, not assumed)
⚠️ **READ THIS BEFORE YOU RUN ANY CHECK. `git log main..lane/m3` WILL PRINT TWO COMMITS, AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
`lane/m3`'s two commits (`a86bc334`, `76ded07b`) were drained to main at `2cd221d1` by a **tip graft**: their *content* was merged byte-identical, but the branch was never merged, so the branch still reads "2 ahead". **An ahead-count is not a drain signal** (F-1066-1 / F-1073-1 / the tip-graft false-ahead law). The reset is loss-free because the **content** is on main.

Verify by CONTENT, not by counting — all three must hold before you touch a file:
1. `git diff main lane/m3 -- src/game/ProfileStorage.ts src/game/TileStateStore.ts` is **EMPTY**. This is the real test: empty means every byte the lane wrote is already on main.
2. `git log --oneline main..lane/m3` prints **exactly these two and no others**: `76ded07b runner(lane-a): lane-blocked-storage-boot-2.md` and `a86bc334 runner(lane-a): lane-blocked-storage-boot.md`. A **third** commit would be undrained work and **only then do you STOP and report.**
3. `src/game/ProfileStorage.ts` `rawGet():484` and `rawSet():492` **both contain a `try`/`catch`** on main. Read them and confirm.
If all three hold, start from fresh main (`git checkout -B lane/m3 main`) — the two grafted commits are safe to leave behind. If 1 fails, or 2 shows anything extra: **STOP and report.** Do not reconcile it yourself.

READ FIRST (paths, in your worktree, before writing anything):
- `src/game/ProfileStorage.ts` — `browserStorage():476-482`, `rawGet():484-490`, `rawSet():492-499`, `isNativeStorage():501-503`, and the export block (`PROFILE_KEY` … `notifyProfileDataChanged`). Note `nativeStorage` and why `isNativeStorage` exists — you must preserve that behaviour exactly.
- `src/game/TileStateStore.ts` — `readSnapshot():47-60` (round 2's guard, the shape to reuse) and `commitAtRunEnd():98-102`.
- `reviews/blocked-storage-boot.md` — the drain review, especially **F-1083-1**, which is this task's evidence.
- Each of the seven call sites in Scope 2 below, before editing any of them.

## Why this task
✓ VERIFIED s1083 by reading the file (F-1083-1). `rawGet` and `rawSet` are declared plain `function` and are **NOT exported**. So the other **20 files** in `src/` that touch storage directly *cannot* reuse the guard — every fix is structurally forced to be another local `try`/`catch`, which is exactly why this thread has now cost three runs. Measured denominator: **59 direct storage calls across 21 files**; `2cd221d1` guards **three**.

This is the same shape as **F-1080-1**, where `bumpCounter`/`clientIpHash` ended up copied into four endpoints because the original was module-private. Twice in one week a private helper has manufactured duplicate work. The fix is to make the guard reusable **once**, then re-point the sites that are provably on the boot path.

The predecessor master deferred this as *"a design decision, not this task"* — correct at the time, and now decided: **export one accessor, re-point only the named boot-path sites, leave the rest alone.** It is a technical strategy choice with **no player-visible behaviour change** and no canon surface. The strategy is fixed by this master; you are not being asked to choose it.

## Scope
1. **Export exactly ONE guarded read accessor and ONE guarded write accessor from `src/game/ProfileStorage.ts`.** Suggested names `safeStorageGet` / `safeStorageSet`; keep the existing private `rawGet`/`rawSet` as the implementation and export thin wrappers, **or** export the existing functions directly — your call, but:
   - The `nativeStorage` / `isNativeStorage` behaviour must be **preserved byte-for-byte in effect**. `installProfileStorageScope` exists for a reason; do not bypass it.
   - A rejected read returns `null`. A rejected write is a silent no-op. **Do not add retries, a shadow store, or an in-memory cache** — that is F-1083-3 and it is explicitly out of scope.
   - **Do not change the behaviour of any existing caller of `rawGet`/`rawSet` inside `ProfileStorage.ts`.** This step is additive.
2. **Re-point these seven boot-path sites, and ONLY these seven.** Each was enumerated by the round-2 runner with its call chain and is listed in F-1083-1. **Find each one yourself and confirm it is a direct unguarded storage call before you touch it** — if any is already guarded, or the chain does not hold, **leave it alone and say so in your report** (a stale premise is a finding, not an obstacle):
   - `src/game/AccountSync.ts` — `readSession`, reached by `main → accountSync.install`
   - `src/game/ProfileManager.ts` — `hasLegacyProfileData` / `migrateLegacySuspendResources`, reached by `showStartMenu`
   - `src/game/SaveSlots.ts` — `readSaveSlots`, reached by `StartMenu.render`
   - `reconcileActiveEpoch` (locate it; `setupProfileStorage` calls it)
   - `src/game/MetaProgress.ts` — `loadMetaProgress`, reached by `startGame → new Game → loadResearchState`
   - `src/systems/E7SignalSystem.ts` — `readMilestones`, reached by `new Game`
   - `src/town/TownNaming.ts` — `readTownName`, reached by `Game.start → showRunStartMetaRecap`
3. **Do NOT touch the other ~26 direct calls.** `Medals`, `Scoreboard`, `ProfileTransfer`, `ResearchTree`, `RideTogether`, `PlaybookStore`, `CharterShelf`, `encyclopedia/*`, `DebugEraSeed`, `worldDispatches`, `Game.ts` and `StartMenu.ts`'s non-boot reads are **out of scope** — they run after the game is already up, so a throw there degrades a feature rather than preventing play. Guarding them is a later rung. **List in your report any you believe are also boot-path**, with the call chain; do not act on it.
4. **No behaviour change in a working browser.** This is a pure-robustness change: with storage functioning, every re-pointed site must return exactly what it returns today. Say so explicitly in your report and name how you checked it.
5. **Mutation control (mandatory — this is how the fix is proven).** Once green: revert **one** re-pointed site of your choosing back to a direct unguarded call, re-run the oracle, and **record the failure message verbatim**; then restore and confirm green again. A green test proves nothing about a fix that would have passed either way (F-1080-B — it is what earned `2cd221d1`). ⚠️ **If reverting a site does NOT make the oracle fail, that is the interesting result and you must report it**, because it means the oracle does not reach that site and site's guard is unproven.
6. **Extend the oracle so round 4 cannot happen silently.** `e2e/task-024-blast-aim-presets.spec.ts:130` already installs a storage stub that throws on every method. It proves the game *boots*. Add **one** assertion to that existing test (do not write a new spec file): after frames pass, assert the game reached a named later-boot milestone that at least one of your seven sites feeds — so a future unguarded boot read fails a test instead of waiting for a fire to find it. Keep it derived from live state, **never a hardcoded string** (the `ed-04` vacuous-guard class, and F-1077-2).

## Firewall
**TOUCH-ONLY:** `src/game/ProfileStorage.ts` · `src/game/AccountSync.ts` · `src/game/ProfileManager.ts` · `src/game/SaveSlots.ts` · `src/game/MetaProgress.ts` · `src/systems/E7SignalSystem.ts` · `src/town/TownNaming.ts` · the one file containing `reconcileActiveEpoch` (name it in your report) · `e2e/task-024-blast-aim-presets.spec.ts`.
🔓 **FIREWALL LIFT, EXPLICIT AND DELIBERATE:** the round-1/round-2 masters' blanket "**NO:** any other file under `src/`" is **hereby lifted for the nine files listed on the TOUCH-ONLY line above, and for those alone.** You are authorized to edit every one of them. This lift exists because that blanket firewall contradicted its own scope twice (F-1082-1) and lawfully STOPPED the run both times; it is not an invitation to widen further.
**NO:** `src/game/TileStateStore.ts` — **round 2's guard is correct and merged; do not re-touch, re-format or "improve" it** · the ~26 non-boot-path storage calls in scope item 3 · `src/game/Balance.ts` · `functions/` at all · `scripts/deploy.sh` (FORBIDDEN, F-1073-1 — never in any diff) · `rehearsal/segments/e1-depth-play.mjs` · `src/town/**` other than `TownNaming.ts` · `src/ui/**` · no new dependency · no reformatting of untouched lines · **no new e2e spec file.**

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- **The oracle:** `e2e/task-024-blast-aim-presets.spec.ts` green on **both** projects (desktop-chrome and mobile-chrome/390), including your scope-6 assertion.
- 🔴 **MANDATORY — the suites that exercise the files you are editing** (names verified to exist at authoring time, s1083; omitting the suite that covers your own edit is the gap F-1081-1 was written about): `e2e/profile-first-boot.spec.ts` · `e2e/m3-06-demo-profiles.spec.ts` · `e2e/board-gating-and-profiles.spec.ts` · `e2e/tp00-tile-persistence.spec.ts` · `e2e/e6-tile-consumers.spec.ts`. All on **both** projects; report their counts. **These six suites (with the oracle) ran 52 passed / 0 failed on main at `2cd221d1` — that is your baseline, so any red is yours until you prove otherwise with a cp-revert control against `2cd221d1`.**
- ⚠️ **`e2e/tile-identity-pass.spec.ts` is NOT a gate for you and you must NOT block on it.** ✓ Measured s1083 on clean main, twice, isolated: **1 passed / 3 failed**, and it is both non-deterministic and load-sensitive (**F-1083-2**). Round 2 declined to claim READY-FOR-GATES purely because of it and cost a whole re-verification cycle. Run it if you like and report the count for the record, but **it does not gate this task.**
- ⚠️ **Do NOT add `e2e/town-t5-townsfolk.spec.ts` or any `ts-0*`/`safari-swap`/`never-trap` spec:** they abort at COLLECTION via `import.meta.glob` (F-1081-6) and take the whole run's verdict with them. **If any run prints no `N passed`/`N failed` summary line, treat it as ABORTED, not clean.**
- Plain-boot check, no `?debug`, desktop and 390px: zero console errors and zero page errors. Run `node scripts/probe-plain-boot-console.mjs <baseURL>` — it reports **warnings** too, which every e2e spec is blind to (they filter `type() === 'error'`). ⚠️ Your guards must stay **silent** in a working browser; a warn in a normal boot means a guard is catching something it should not. **Prove the server you measure is your own tree before trusting a number (F-1077-3), and never wrap an evidence-gathering wait in a bare `catch` (F-1082-5).**

READY-FOR-GATES + report: the mutation-control failure message verbatim (and which site you reverted), the exported accessor's signature, the file holding `reconcileActiveEpoch`, per-suite counts on both projects, your scope-3 list of any further boot-path reads with call chains, and explicit confirmation that `TileStateStore.ts` is untouched and no working-browser behaviour changed.
