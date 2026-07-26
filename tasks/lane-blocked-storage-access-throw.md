# Task lane-blocked-storage-access-throw: THE OTHER THROW — GUARD THE bare `localStorage` ACCESS ON THE BOOT PATH, AND TEACH THE ORACLE TO SEE IT (LANE-A, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1084, 2026-07-26. This is NOT round 4 of the whack-a-mole. Rounds 1–3 (`rf-19`, `rf-20`, `rf-22`, merged `2cd221d1` + `338e7895`) fixed storage whose METHODS throw. This fixes storage whose ACCESSOR throws — a different failure mode, on the same boot path, which the existing oracle is STRUCTURALLY INCAPABLE of detecting.**

You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT — verify by CONTENT, never by counting (this trap has now bitten three masters)
⚠️ **`git log main..lane/m3` WILL PRINT ONE COMMIT (`be020fc7`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
`be020fc7` was drained to main at `338e78951a181057a844dc1489f408b3f9b0f69e` by a **tip graft**: its *content* is on main byte-identical, but the branch was never merged, so it still reads "1 ahead". **An ahead-count is not a drain signal** (F-1066-1 / F-1073-1, and F-1084 note H: it misleads the AUTHOR of a pre-flight as readily as the drainer).

All three must hold before you touch a file:
1. `git diff main lane/m3 -- src/game/ProfileStorage.ts e2e/task-024-blast-aim-presets.spec.ts` is **EMPTY**. ✓ Verified empty by s1084 at `338e7895`. This is the real test.
2. `git log --oneline main..lane/m3` prints **exactly `be020fc7 runner(lane-a): lane-blocked-storage-boot-3.md` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
3. `src/game/ProfileStorage.ts` exports `rawGet` and `rawSet` (both carry the `export` keyword, ~`:484`/`:492`), and `browserStorage()` (~`:476`) wraps `globalThis.localStorage` in `try`/`catch`. Read them and confirm.
If all three hold, start from fresh main (`git checkout -B lane/m3 main`) — `be020fc7` is safe to leave behind.

READ FIRST (in your worktree, before writing anything):
- `src/game/ProfileStorage.ts` — `browserStorage():476-482` **this is the pattern and the proof**; `rawGet():484`, `rawSet():492`, `isNativeStorage():501`.
- `src/game/Game.ts` — **`:570`** (`private readonly tileStateStore = new TileStateStore(localStorage);`) and **`:1309`** (bare `localStorage` passed into `new E7SignalSystem(...)`).
- `src/game/TileStateStore.ts` — `constructor(private readonly storage: ProfileStorage):43` and `readSnapshot():47-60` (round 2's guard).
- `e2e/task-024-blast-aim-presets.spec.ts:130-165` — the existing storage-blocked oracle **and its stub**. Read the stub carefully; the whole task turns on what it does not do.
- `reviews/blocked-storage-boot-3.md` — the s1084 drain review (F-1084-1 on `--workers=1`, F-1084-3 on why the current assertion is marginal).

## Why this task
✓ **VERIFIED s1084 by reading all four sites — this is measured, not inherited.**

There are **two** ways a browser refuses storage, and this repo has only ever tested one:

1. **The methods throw.** `window.localStorage` returns an object; `getItem()` raises. Rounds 1–3 fixed this, and the oracle at `task-024:130` simulates exactly this — its stub is `Object.defineProperty(window,'localStorage',{ get: () => blockedStorage })`, where the getter **returns** an object whose methods throw. **The identifier access itself succeeds.**
2. **The ACCESS throws.** Safari with *Block All Cookies*, and Chromium in a third-party-blocked iframe, raise a `SecurityError` on the **property access** `window.localStorage` itself — before any method is called.

**This codebase already knows mode 2 is real**, which is the internal proof: `browserStorage()` (`ProfileStorage.ts:476-482`) exists solely to wrap the bare `globalThis.localStorage` access in `try`/`catch`, and four sibling helpers elsewhere do the same. Nobody writes that guard for a read that cannot throw.

**But two boot-path sites take the access bare:**
- **`src/game/Game.ts:570`** — `private readonly tileStateStore = new TileStateStore(localStorage);` is a **class field initializer**. Under mode 2 it throws *during field initialization*, so `new Game()` never returns, and — decisively — **it cannot be wrapped in a `try`/`catch` where it stands.** It is on the plain boot path (`startGame → new Game`).
- **`src/game/Game.ts:1309`** — bare `localStorage` passed into `new E7SignalSystem(...)`, also in the `Game` constructor.

**This is the same asymmetry that produced rounds 1 and 2** — `ProfileStorage` guarded `browserStorage()` beside an unguarded `rawGet`; `TileStateStore` guarded its write beside an unguarded read. Here, five helpers guard the access and `Game.ts` does not.

⚠️ **And the oracle cannot see it.** Its stub's getter never throws, so a green `task-024:130` says nothing about mode 2. **F-1084-3 measured exactly this blindness from the other side:** s1084 un-guarded `loadMetaProgress` and the oracle failed at the pre-existing `openGame` wait, *not* at `rf-22`'s new assertion. Adding assertions to a stub that simulates the wrong failure cannot close this. **The stub is the thing that must change.**

**The strategy is FIXED by this master; you are not being asked to choose it.** It is the same fail-soft behaviour already ratified and merged three times: when storage is unavailable, the game degrades to "nothing saved yet" and plays. No player-visible change in a working browser, no canon surface.

## Scope
1. **Export ONE guarded storage accessor from `src/game/ProfileStorage.ts`** — suggested `safeLocalStorage()`. It must:
   - Wrap the `globalThis.localStorage` **property access** in `try`/`catch` exactly as `browserStorage():476-482` already does. Reuse `browserStorage` internally rather than duplicating it — **the entire lesson of `rf-22`/F-1083-1 is that a private helper manufactures duplicate work.**
   - Return a **usable `Storage`-shaped value in both cases**, so a field initializer can call it unconditionally. When the real storage is unreachable, return a module-level **INERT** storage: `getItem` → `null`, `setItem`/`removeItem`/`clear` → silent no-op, `length` → `0`, `key()` → `null`.
   - ⚠️ **The inert object is a NULL OBJECT, not a shadow store.** It **must not retain anything** — a value written to it and read back returns `null`. Persisting values in memory is **F-1083-3 and remains explicitly OUT OF SCOPE** (`rf-22` banned it and that ban stands). Allocate it **once** at module scope; do not build one per call.
   - Behaviour when storage **is** available must be **byte-for-byte what it is today**. Preserve `nativeStorage`/`isNativeStorage` semantics; do not route existing `rawGet`/`rawSet` callers through anything new.
2. **Re-point exactly TWO sites, and only these two:** `src/game/Game.ts:570` and `src/game/Game.ts:1309`, from bare `localStorage` to your accessor.
3. **Do NOT re-point the other bare `localStorage` uses.** `Game.ts:1380`, `:1962-1964` (playbooks), `src/meta/DebugEraSeed.ts` (debug-only), `src/ceremony/CeremonySystem.ts:503` are **out of scope** — they run after the game is up, or only under `?debug`, so a throw there degrades a feature rather than preventing play. **List in your report any you believe are also boot-path, with the call chain; do not act on it.**
4. **Teach the oracle the second failure mode — this is the half that stops a round 5.** In `e2e/task-024-blast-aim-presets.spec.ts`, add **ONE** new test beside the existing `:130` one (same file; **no new spec file**). Its stub must make the **property access itself throw**:
   ```ts
   Object.defineProperty(window, 'localStorage', {
     configurable: true,
     get() { throw new Error('SecurityError: storage access denied'); },
   });
   ```
   Then assert the game still boots, using the same live-state shape the existing test uses (`difficultyPreset` === `'trail'`, plus a derived milestone assertion) and zero console/page errors. **Keep every assertion derived from live diagnostics — never a hardcoded string** (the `ed-04` vacuous-guard class, F-1077-2). Leave the existing `:130` test **unchanged** — mode 1 must stay covered.
5. **Mutation control (mandatory — this is how the fix is proven).** Once green: revert **`Game.ts:570`** alone to bare `localStorage`, re-run your new test, and **record the failure message verbatim**; then restore and confirm green. ⚠️ **If reverting it does NOT make your new test fail, that is the interesting result and you must report it** — it means the new stub does not actually reach the site, and the task has not achieved its purpose. Say so plainly rather than claiming success (F-1080-B; `rf-22`'s runner reported exactly such a negative honestly and that was the right call).
6. **No behaviour change in a working browser.** Say so explicitly and name how you checked it.

## Firewall
**TOUCH-ONLY:** `src/game/ProfileStorage.ts` · `src/game/Game.ts` · `e2e/task-024-blast-aim-presets.spec.ts` · `src/game/TileStateStore.ts` **only if** its constructor needs to accept the inert storage's type (see below).
🔓 **FIREWALL LIFT, EXPLICIT AND DELIBERATE:** `rf-22`'s master said "**NO:** `src/game/TileStateStore.ts` — do not re-touch". That is **hereby lifted for a type-compatibility change ONLY**: `TileStateStore`'s constructor takes `ProfileStorage` (`:43`), and if your inert object does not satisfy that type you may widen the parameter type or shape the inert object to fit. **You may NOT change `readSnapshot()`, `commitAtRunEnd()`, or any other logic in that file** — round 2's guard is correct and merged. If no type change is needed, do not touch the file at all.
This lift is narrow and deliberate: a blanket `NO: any other file under src/` lawfully STOPPED two prior rounds (F-1082-1, **thrice**-proven) because it contradicted the task's own scope. It is not an invitation to widen further.
**NO:** the out-of-scope bare `localStorage` sites in scope item 3 · any in-memory/shadow persistence (F-1083-3) · `src/game/Balance.ts` · `functions/` at all · `scripts/deploy.sh` (**FORBIDDEN, F-1073-1 — never in any diff**) · `rehearsal/segments/e1-depth-play.mjs` · `src/town/**` · `src/ui/**` · no new dependency · no reformatting of untouched lines · **no new e2e spec file.**

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- **The oracle, both tests** (the existing `:130` AND your new one) green on **both** projects (desktop-chrome and mobile-chrome/390).
- 🔴 **MANDATORY suites** (they exercise the files you are editing): `e2e/task-024-blast-aim-presets.spec.ts` · `e2e/profile-first-boot.spec.ts` · `e2e/m3-06-demo-profiles.spec.ts` · `e2e/board-gating-and-profiles.spec.ts` · `e2e/tp00-tile-persistence.spec.ts` · `e2e/e6-tile-consumers.spec.ts`. Both projects; report per-suite counts.
- ⚠️ **RUN THAT BATTERY AT `--workers=1`, AND READ THIS BEFORE YOU CALL ANYTHING RED (F-1084-1, measured s1084).** At default parallel workers the battery returns **49 passed / 3 failed** — `m3-06-demo-profiles:14`, `task-024:88`, `tp00-tile-persistence:171`, all desktop-chrome — **and CLEAN MAIN returns the identical 3 failures with the same identities.** They are **load-sensitive, not code**. At `--workers=1` the same tree returns **52 passed / 0 failed, exit 0**. ➡️ **Your baseline is 52/0 at `--workers=1` (main `338e7895`).** If you see those three specific failures, re-run at `--workers=1` before reporting anything — do **not** stop on them, and do **not** try to fix them. **Blocking on a load-flaky suite is what cost round 2 an entire cycle.**
- ⚠️ **`e2e/tile-identity-pass.spec.ts` is NOT a gate for you** (F-1083-2: 1/4 on clean main, non-deterministic AND load-sensitive). Run it if you like and report the count for the record; it does not gate this task.
- ⚠️ **Do NOT add `e2e/town-t5-townsfolk.spec.ts` or any `ts-0*`/`safari-swap`/`never-trap` spec:** they abort at COLLECTION via `import.meta.glob` (F-1081-6) and take the whole run's verdict with them. **If any run prints no `N passed`/`N failed` summary line, treat it as ABORTED, not clean.**
- Plain-boot check, no `?debug`, desktop and 390px: `node scripts/probe-plain-boot-console.mjs <baseURL>` → **zero errors, zero warnings, zero pageErrors**. Your guard must stay **silent** in a working browser; a warn in a normal boot means it is catching something it should not. **Prove the server you measure is your own tree before trusting a number (F-1077-3), and never wrap an evidence-gathering wait in a bare `catch` (F-1082-5).**

READY-FOR-GATES + report: the mutation-control failure message **verbatim** (and confirmation you reverted `Game.ts:570`), your accessor's exact signature, whether `TileStateStore.ts` needed a type change (and if so the exact diff), per-suite counts on both projects **at `--workers=1`**, your scope-3 list of any further boot-path bare accesses with call chains, and explicit confirmation that no working-browser behaviour changed and that the inert storage retains nothing.
