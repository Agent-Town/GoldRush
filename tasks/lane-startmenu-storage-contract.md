# Task lane-startmenu-storage-contract: THE DEGRADE THAT ONLY WORKS BY ACCIDENT — AND WHY THE OBVIOUS ONE-LINE FIX MAKES IT WORSE (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1093, 2026-07-26. This is the F-1084-2 rider, recorded s1084 and RE-MEASURED END-TO-END by s1093 before authoring — which CONTRADICTS the finding's own prescription. Read the WHY before you touch anything: the naive fix the finding suggests would ship a player-facing regression.**

You are Codex (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

F-1084-2 (BACKLOG:1106, ✓ verified s1084 by reading both copies) records, verbatim:

> 🟢 **F-1084-2 (rider) — `StartMenu.ts:431` HOLDS A SECOND, SEPARATE `hasLegacyProfileData` WITH NO INTERNAL TRY/CATCH.** The `ProfileManager.ts:502` copy is self-guarded; this one is protected **only** by the enclosing `setupProfileStorage()` catch at `StartMenu.ts:426`. Safe on the boot path today, but safe *by its caller* — the fragile kind, and **the natural first customer for the accessor `rf-22` just exported.**

✓ **s1093 re-verified every line of that by reading the files, and it is accurate.** `StartMenu.ts:431-436` loops `storage.getItem(key)` with no internal guard; `ProfileManager.ts:502-509` is the same loop with a **per-key** `try {} catch {}`. `rf-22` did export the accessor: `rawGet` (`ProfileStorage.ts:500`) and `rawSet` (`:508`), both of which **do** `try`/`catch` and return `null` / swallow.

📌 **And `rawGet`/`rawSet` have ZERO consumers outside `ProfileStorage.ts` today** (`grep -rn "rawGet\|rawSet" src --include=*.ts` → only their own file). `rf-22`'s export is currently dead capability. So the finding's instinct — make this site its first customer — is a good one.

### ⚠️ BUT THE PRESCRIPTION IS WRONG, AND s1093 MEASURED WHY

The finding treats this as an isolated fragile helper. It is not. **That unguarded `getItem` is load-bearing: it is the accidental usability probe that gives the whole StartMenu its clean degrade under blocked storage.**

Trace `setupProfileStorage()` (`StartMenu.ts:416-429`) under **mode 1** blocked storage — `localStorage` returns an object whose *methods* throw (the shape pinned by `e2e/task-024-blast-aim-presets.spec.ts:130`):

| line | today |
|---|---|
| `:418` `const storage = globalThis.localStorage` | succeeds — mode 1 lets the *access* through |
| `:419` `if (!storage) return undefined` | truthy, continues |
| `:420` `loadProfileState(storage)` | **guarded** (`ProfileStorage.ts:133`, try/catch + `rawGet`) → `null` |
| `:420` `hasLegacyProfileData(storage)` | **THROWS** — the first unguarded call on the path |
| `:426` `catch` → `:427` | **`return undefined`** |

⇒ `this.storage` is `undefined` (`:71`), so `this.firstBoot = !!this.storage && …` is **false** (`:72`), and `:233`'s `if (!this.storage) return;` short-circuits the entire profile-creation path. **That is the clean degrade, and it exists only because `:433` throws.**

**Now re-point `:433` at `rawGet` and nothing else** — the "small rider" reading:

- `hasLegacyProfileData` returns **`false`** instead of throwing.
- `:421` `if (loadProfileState(storage))` → `null`, skipped.
- `:425` **`return storage`** ← the throwing object is now handed out.
- `:72` `firstBoot` becomes **`true`** ⇒ the **"Who's prospecting?" first-profile screen renders** under blocked storage, where today it does not.
- The player types a name and clicks create ⇒ `:233`'s guard **is now a no-op** ⇒ `:236 createProfile(throwingStorage, …)` ⇒ `:242 installProfileStorageScope(throwingStorage)`.
- `installProfileStorageScope` (`ProfileStorage.ts:291`) sets `scopedStorage = storage` and **monkey-patches `Storage.prototype.getItem/setItem` process-wide**, then calls `nativeStorage.getItem!.call(this, scoped)` (`:301`) — where `this` is a **plain object, not a `Storage` instance** ⇒ **`TypeError: Illegal invocation`**, globally, on every subsequent storage read.

➡️ **So the one-line fix converts "storage is unavailable, degrade quietly" into "offer the player a profile screen, accept a name, persist nothing, and install a global shim that throws."** A silent clean degrade becomes a visible broken promise. **That is a player-facing regression, and no existing test would catch it** — see below.

### The existing oracles cannot see this

Both storage oracles (`task-024-blast-aim-presets.spec.ts:130` mode 1, `:167` mode 2) boot with `?debug&nowaves&nolevel` and assert only `difficultyPreset === 'trail'` + empty console/pageErrors. **Neither drives the create-profile flow**, so neither would redden. The instrument that *does* drive it is `e2e/profile-first-boot.spec.ts:41` (`page.goto('/')` → `profile-title` → `profile-name-input` → `profile-create`) — plain boot, no `?debug`, already in `rf-23`'s battery.

⇒ **The right slice is not "re-point the helper." It is "make the contract deliberate, THEN re-point the helper, and pin the contract with a test."**

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/perf` WILL PRINT ONE COMMIT (`da0f4240 runner(lane-d): lane-tailor-wagon.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.** ✓ s1093 re-measured it per file this fire (F-1091-2 independently reconfirmed): of the 13 files that commit touched, **8 are byte-identical to main**, **4 are its own run screenshots and all present on main**, and the last — `e2e/cosmetic-grants.spec.ts` and `src/game/ProfileStorage.ts` — show **main strictly AHEAD**: the branch would *delete* main's 21-code `bad_payload` assertion, `inertStorage`, and `safeLocalStorage()`. Its content merged as `925a0c3b`, ✓ confirmed an ancestor of main. The branch is **FALSE-AHEAD with stale-base phantom deletions**; a reset is **loss-free**. An ahead-count is not a drain signal (F-1066-1 / F-1073-1 — it misled on three separate lanes in one week).

⚠️⚠️ **ORDER MATTERS, AND THE FIRST VERSION OF THIS MASTER GOT IT WRONG (F-1093-5, s1093).** The
premise checks below describe **main's** content. `lane/perf` is **91 commits behind main**, so running
them on the un-reset lane measures a stale tree and they fail for the wrong reason: attempt 1 of this
task **correctly STOPPED** because `src/game/ProfileStorage.ts` on the stale lane still has the *old
private* `function rawGet` at `:484` instead of the exported one at `:500`. That STOP was the runner
obeying its firewall, not a failure. **So: the lane-safety check comes first, then the reset, and the
premise checks run on the FRESH tree.**

### STEP 1 — lane safety (run this on the branch as it stands, BEFORE any reset)

`git log --oneline main..lane/perf` must print **exactly `da0f4240` and nothing else.** A **second**
commit would be undrained work — **only then STOP and report.**

### STEP 2 — reset to fresh main

`git checkout -B lane/perf main`. `da0f4240` is safe to leave behind, per the loss-free measurement
above.

### STEP 3 — premise checks, on the freshly-reset tree (all three must hold)

If any of these fails **now**, the ground genuinely moved under this master — **STOP and report.**

1. `grep -n "storage.getItem(key)" src/ui/menu/StartMenu.ts` → **must print line `433`.** If it is
   already `rawGet`, someone landed this and the premise is gone.
2. `grep -n "export function rawGet" src/game/ProfileStorage.ts` → **must print `500`.** The accessor
   this whole slice depends on must exist **and be exported**. ⚠️ If you see a bare
   `function rawGet` at `:484` with no `export`, **you are on the stale lane — you skipped STEP 2.**
3. `grep -n "if (!this.storage) return" src/ui/menu/StartMenu.ts` → **must print `233`.** That
   early-exit is the guard the WHY's blast radius turns on; if it has moved or gone, the analysis
   needs redoing.

## READ FIRST (in your worktree, before writing anything)

- `src/ui/menu/StartMenu.ts` — lines **60–80** (`this.storage`, `firstBoot`), **225–255** (the create-profile handler and its `:233` guard), and **410–450** (`setupProfileStorage`, `hasLegacyProfileData`, `migrateLegacySuspendResources`).
- `src/game/ProfileStorage.ts:488–519` — `browserStorage`, `safeLocalStorage`, **`rawGet`**, **`rawSet`**, `isNativeStorage`. Note `rawGet` catches and returns `null`; that is exactly why it **cannot** be used as a usability probe (scope 1).
- `src/game/ProfileStorage.ts:291–315` — `installProfileStorageScope`, so you can see for yourself why handing it a non-`Storage` object is unsafe.
- `src/game/ProfileManager.ts:502–509` — the sibling copy that is already guarded. **Read it; do not edit it.**
- `e2e/profile-first-boot.spec.ts:41–64` — the plain-boot create-profile flow you will copy for scope 4.
- `e2e/task-024-blast-aim-presets.spec.ts:129–165` — the mode-1 `blockedStorage` init-script you will reuse verbatim. **Read it; do not edit it.**

## SCOPE (numbered; each item is checkable)

1. **Make the usability probe DELIBERATE in `setupProfileStorage()`.** Immediately after the `:419`
   `if (!storage) return undefined;` line, add a single **direct** read whose throw is the signal —
   `storage.getItem(RUN_SUSPEND_KEY);` is sufficient (`RUN_SUSPEND_KEY` is **already imported** at
   `:3`; add no new import) — with a comment naming what it is: a mode-1 usability probe whose throw
   is caught by `:426` so an unusable storage is never handed to callers.

   ⚠️ **THE PROBE MUST NOT USE `rawGet`, AND THIS IS THE WHOLE POINT.** `rawGet` swallows and
   returns `null`, so it **cannot** signal unusability. A future reader "harmonising for
   consistency" would silently destroy the contract. Say so in the comment.

   ✅ **Net behaviour change: NONE.** Under mode 1, before and after, `setupProfileStorage()` returns
   `undefined`. You are moving *where* the throw comes from — from an accident inside a helper to an
   intentional, documented line — not *whether* it happens. State this in your report.

2. **Re-point `hasLegacyProfileData` (`:431-436`) at the exported `rawGet`.** Replace
   `storage.getItem(key) !== null` with `rawGet(storage, key) !== null`, importing `rawGet` from
   `'../../game/ProfileStorage'` by **adding it to the existing import block at `:1-8`** — do not add
   a second import statement from the same module. This is F-1084-2's actual complaint, and it is now
   safe because scope 1 guarantees an unusable storage never reaches this function.

3. **Re-point `migrateLegacySuspendResources` (`:438-448`) at `rawGet`/`rawSet`** — `:441` and `:446`.
   ⚠️ **KEEP the surrounding `try {} catch {}` at `:440-447`. Do NOT remove it.** It also guards the
   **`JSON.parse` at `:443`**, which `rawGet` does not and cannot cover. Removing it because "the
   accessors are guarded now" would introduce a crash on corrupt suspend data. The outcomes are
   provably identical either way (`rawGet` → `null` → `if (!raw) return;`), so this item is
   consistency, not a fix — take it because it leaves no sibling instance of the class behind, and
   say in your report that it is behaviour-neutral.

4. **Pin the contract with a new oracle in `e2e/profile-first-boot.spec.ts`.** One new `test(...)`,
   appended, that reuses the **mode-1 `blockedStorage` init-script** from
   `task-024-blast-aim-presets.spec.ts:131-156` (copy it into this spec — do **not** import across
   specs and do **not** edit `task-024`) and then, on a **plain boot** (`page.goto('/')`, no
   `?debug`), asserts the degrade the WHY describes:
   - the start menu **is** present (`start-menu` visible) — the game still boots, and
   - the first-profile prompt is **ABSENT** (`profile-title` → `toHaveCount(0)`) — this is the
     assertion that catches the regression, because the naive fix makes it appear, and
   - **zero `pageErrors`** and no error text matching `/Illegal invocation/`.

   ⚠️ **Assert the ABSENCE of `profile-title`, not merely that the page booted.** A boot-only
   assertion would stay green through the exact regression this task exists to prevent — a one-sided
   assertion is how `rf-29`'s guard went blind (F-1091-1), and this family of tasks is about guards
   that do not check the claim they are named for.

5. **MUTATION CONTROL — mandatory, and it is the evidence this task lives or dies on.** With scopes
   1–4 in place, **temporarily delete the scope-1 probe line only** (leave scopes 2–4 intact — that
   reproduces exactly the "naive rider" fix the WHY warns about). Re-run your new oracle.
   - **It MUST go RED**, and the failure must be the **`profile-title` count assertion** (the
     first-profile screen appearing under blocked storage) — not a timeout, not a boot failure.
   - **Quote the red output**, and report whether you also observed `Illegal invocation` when driving
     `profile-create` (report either way — its absence does not invalidate the red, since the count
     assertion is the detector).
   Then **revert**, prove it with `git diff -- src/ui/menu/StartMenu.ts` showing your intended change
   only, and re-run to green. **A guard you have not watched fail is not evidence** (rf-28's lesson).

## TOUCH-ONLY

- `src/ui/menu/StartMenu.ts` — scopes 1, 2, 3 and the one import-block addition only
- `e2e/profile-first-boot.spec.ts` — scope 4, **appended test only**; do not alter existing tests

## NO (firewall — report, do not fix)

- ❌ **`src/game/ProfileStorage.ts`.** `rawGet`/`rawSet`/`installProfileStorageScope` ship as-is. If
  you believe `installProfileStorageScope` should reject a non-`Storage` argument, that is a **real
  follow-up rung — write it in your report**, do not implement it here. (It is the deeper fix; it is
  also a wider blast radius than this slice, since it is called from four sites.)
- ❌ **`src/game/ProfileManager.ts`.** Its `hasLegacyProfileData` is already guarded. Leave it. Do
  **not** deduplicate the two copies — that is a separate rung with its own risk.
- ❌ **`e2e/task-024-blast-aim-presets.spec.ts`.** Both storage oracles are the instrument; copy the
  init-script out of it, change nothing in it.
- ❌ `src/game/SaveSlots.ts` and any other file under `src/`. If the `:233` blast radius makes you
  want to guard `createProfile`'s callers, **report it** — this master deliberately fixes the
  contract at the source instead.
- ❌ Anything under `functions/`, `scripts/`, `rehearsal/`.
- ❌ The ticker `StatsEndpointReadError` (**F-1088-1**) — see self-check.
- ❌ `scripts/deploy.sh` (**F-1073-1**, permanent).

## SELF-CHECK (run these exact things; report real numbers)

1. `npx tsc --noEmit` → **exit 0.** ✅ **Cite it — it is real coverage here.** `tsconfig.json`
   includes `src` and `e2e`, and this slice is entirely those two (F-1087-1 only bites for
   `scripts/`- or `rehearsal/`-only slices, which this is not).
2. `npm run build` → **exit 0**, report the time.
3. **Your own spec**: `e2e/profile-first-boot.spec.ts` in full, **both projects** (desktop +
   mobile-390), `--workers=1`. Report passed/failed with the summary line present. The pre-existing
   tests in that file must be **unchanged and green**.
4. **The two storage oracles must stay green**: run `e2e/task-024-blast-aim-presets.spec.ts` and
   report `:130` (mode 1) and `:167` (mode 2) explicitly, both projects. These are the closest
   neighbours to what you changed; a red here is a real regression, not noise.
5. **Adjacent suites** — run and report: `e2e/run-suspend.spec.ts` (scope 3 touches the
   `RUN_SUSPEND_KEY` read/write path — this is the suite that covers it), `e2e/save-slots.spec.ts`,
   and `e2e/m3-06-demo-profiles.spec.ts`. Any failure: attribute it — pre-existing or yours — with
   evidence, and **do not fix an unrelated red.**
6. **Plain-boot console probe**, desktop 1280×800 **and** mobile 390×844 → **0 errors / 0 warnings /
   0 pageErrors**. Use `scripts/probe-plain-boot-console.mjs`; ⚠️ it now **requires `PROBE_BASE`**
   and proves the listener was started from this checkout (rf-27..rf-30) — a bare positional
   argument **throws a directive error** by design. Set the env var.
7. `npm run test:node-guards` → report the **`node --test` phase** count and confirm it is
   **unchanged** by this slice (you add no `scripts/*.test.mjs`).
   ⚠️ **The command's OVERALL exit code is `1` on main today and that is NOT your slice** — the
   pre-existing ticker `StatsEndpointReadError` (F-1088-1) fires after the node phase. **Judge by the
   phase count, never the overall rc.**
8. Quote the scope-5 mutation control in full: the red (naming which assertion failed), and the revert.
9. **State the behaviour-change ledger explicitly**, in one short table: for mode-1 blocked storage,
   what `setupProfileStorage()` returns **before** and **after** your change (both must be
   `undefined`), and what `firstBoot` is (both must be `false`). If either column differs, you have
   changed behaviour and must say so loudly rather than let a drain discover it.

READY-FOR-GATES + report: the scope-9 behaviour-change ledger, the scope-5 mutation control's red and revert, your new oracle's numbers on both projects, the two `task-024` storage oracles' explicit results, the adjacent suites with attributions, the `node --test` phase count (unchanged), and — as a follow-up rung, not an edit — whether you think `installProfileStorageScope` should reject a non-`Storage` argument.
