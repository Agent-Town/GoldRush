# ux-entry-robustness-1 — implementer report

**Branch** `fix/ux-entry-robustness-1` · **worktree** `/Users/robin/Claude/Projects/wt-ux1` · **cut from** `e0df64c53`
**Implementer** Claude Opus 5 (attended, owner's Anthropic subscription) · **date** 2026-09-24 · **prefix** `fix:`

| # | Commit | What |
| --- | --- | --- |
| 1 | `7c8656fa8` | focus loss clears held keys; solo pick clock freezes while hidden (UX-4) |
| 2 | `9a0ee33d4` | the unnamed-prospector fallback stops using the owner's name (UX-1) |
| 3 | `336841c1e` | the menu decision inverts to a run-route allowlist, plus the boot guard (UX-1, UX-2, UX-7) |
| 4 | `b64c08175` | `e2e/entry-params.spec.ts` (UX-1, UX-2, UX-4) |
| 5 | `cefe9f29d` | this report, first cut |
| 6 | `834f27195` | the pick-clock freeze keys on an OBSERVED visibility transition (UX-4) |
| 7 | `c52d3cd89` | item 4 reverted to the boot-path emit; `?contract=` accepts a matching run suspend (F-UX7-1, F-UX1-4) |

Pre-flight: `git status --short` showed only `?? node_modules` (no factory-churn exception needed) · `git log main..HEAD` empty · `npm run build` rc=0 in 31.3 s.

---

## Items, and where each landed

| Item | State |
| --- | --- |
| 1. run-route allowlist | **DONE**. Also: neutral fallback name. `shouldSeedDefaultProfile` NOT changed — see F-UX1-3. |
| 2. boot guard | **DONE**. Telemetry reporting deliberately absent — see F-UX2-1. |
| 3. focus loss + solo pick clock | **DONE**. The "while paused" half is unreachable — see F-UX4-2. |
| 4. first-boot at the naming flow | **REVERTED after measurement** — see F-UX7-1. This is the one scope item not delivered. |
| 5. tests | **DONE** (9 tests x 2 projects), with one substitution — see F-UX5-1. |
| 6. report | this file. |

---

## Item 1 — the menu decision inverts to an allowlist of run routes

The old rule showed the menu only if **every** query key was in a six-key `MENU_SAFE_PARAMS` set and launched a run otherwise, so the default for an unrecognised parameter was "skip the menu and start playing". Now the menu is the default and a run launches only when the query **names** a route into one.

**Group 1 — run routes, honoured by a release build (7):** `seed` `difficulty` `mode` `press` `replay` `epoch` `profiles`

**Group 1b — `contract`, the conditional member.** It names a run when (a) a player launch is staged in sessionStorage (`stagedPlayerContractLaunch()` — what `launchContract`, `continueSavedRun` and the Charter Press return all write before reloading), or (b) `?debug` on a non-release build, or (c) **a run suspend for exactly that contract exists in localStorage** (added as F-UX1-4, below). A typed or pasted `?contract=` satisfies none of these and lands on the menu.

**Group 2 — the debug harness, compiled out of the release build (25):** `debug` `bench` `editor` `timescale` `nospawn` `nowaves` `nolevel` `nokill` `nopause` `nosteal` `nowreck` `noping` `stress` `profile` `nobeauty` `nopoolgrade` `performance` `era` `mp` `mpRelay` `mpCode` `mpName` `mpTown` `mpParty` `mpDesyncAt`

Group 2 is derived from source, not from the corpus: every key `src/core/DebugParams.ts` honours, plus its two aliases (`bench=fullbase`, `editor`, `DebugParams.ts:40`) and the mp/era doors. `readDebugParams` returns `DEFAULT_PARAMS` when `__GR_RELEASE_E1__` (`DebugParams.ts:34`), so **a release build's only run routes are group 1**.

Not on either list, deliberately: `town3dPilot` `run3dPilot` `tier` `townDusk` `townNight` `townSky`. The master's parenthetical suggests putting them on the run list; that would re-open F-BT-1 and the owner's own report ("owner hit /?town3dPilot=all then landed in The Claim"). Under the inverted rule they need no special case at all.

**Measured before/after:** static scan of every `goto` in `e2e/**` (literal URLs plus in-file `const` resolution): **482 files, 759 calls, 0 verdicts flipped**. With a naive run-routes-only list, 14 flipped (all debug-modifier-only URLs: `?nowaves`, `?timescale=2`, `?performance=full`, `?nolevel&nopause`, `?stress=120&nowaves&nokill`, `?nospawn&nowaves`) — that is why group 2 exists, and why `main.ts` carries the warning that a new harness key must be added there or its URL lands on the menu.

| URL, fresh profile store | Before | After (asserted in `entry-params`) |
| --- | --- | --- |
| `/?utm_source=x&fbclid=y` | run of The Claim, profile minted with the owner's name | start menu + naming form, **no profile index** |
| `/?gclid=z` | run, profile minted | start menu, **no profile index** |
| `/?contract=e1-night-shift` (shared) | run, profile minted | start menu, **no profile index** |
| `/?contract=the-claim` + staged launch | run | run |
| `/?debug&seed=...` | run | run |
| `/?town3dPilot=all` | menu | menu |

### The neutral fallback name

| Site | Before | After |
| --- | --- | --- |
| `ProfileStorage.activeProfileName()` storage-absent / throwing return | `'Robin'` | `UNNAMED_PROSPECTOR_NAME` = `'Prospector'` |
| `DeathOverlay.ts:412`, legacy score row with no `profileName` | `'Robin'` | `UNNAMED_PROSPECTOR_NAME` |

Honest caveat: no existing assertion exercises either fallback, so the suite cannot observe this change. It is a read-and-trace claim, not a measured one.

---

## Item 2 — the boot guard

`src/core/BootGuard.ts` (225 lines), **armed by being `main.ts`'s first import** — module bodies evaluate in import order, so it listens before any line below it can fail.

* `window` `error`, `unhandledrejection`, `vite:preloadError` → the card, until `markBootReached()` fires in `afterFirstFrame`. After that an error belongs to a running game and a card would replace a working page with a tombstone.
* `webgl2Available()` — probed once, cached, and it calls `WEBGL_lose_context.loseContext()` on the probe context so the check can never starve the real renderer. Called at the top of **both** `startGame()` and `openTown()`, before `createRenderer` is reached.
* All **17** runtime dynamic import call sites in `main.ts` go through `guardedImport(label, () => import(...))`. (The master says 27; 6 of the 27 `import(` occurrences are type positions at `:38-43`. `grep -n "import('\./" src/main.ts | grep -v guardedImport` now returns only those 6.) On failure it shows the card and returns a **never-settling** promise: rethrowing would trip an unhandled rejection at every `void import(...)` site, and resolving with a stub would run the caller's continuation against a module that does not exist.

**Card copy, verbatim.** Chunk/script: **"The trail washed out."** / "Part of the way in never arrived. Give it another go and the claim will be waiting." / `[Reload]` (the `script` kind reads "Something on the way in came apart."). webgl2: **"This window cannot see the valley."** / "The claim is drawn with hardware graphics this browser is not offering; try another browser, or switch hardware acceleration on." / `[Reload]`

Testids `boot-failure-card` (+ `data-boot-failure-kind`), `boot-failure-title`, `boot-failure-line`, `boot-failure-reload`. Styled **entirely inline** (parchment `#efe2c6` on ink `#161412`, 44 px min button) because a boot that failed because a chunk did not arrive cannot be told "your stylesheet will explain it". `index.html` gained one `<noscript>` line.

**F-UX2-1 — no client-error kind exists, so it reports to nobody.** `src/telemetry/payload.ts:16-28` is run-shaped (contract, stage, waves, secureWave, deepestWave, duration, upgradesTaken, tier, frameP95, deviceClass, buildHash, nonce); `functions/api/telemetry.ts:26` accepts `stage: 'secure' | 'end' | 'legacy'` and `:163` nulls anything else; the only beacon is `src/telemetry/runBeacon.ts:89`. Adding a kind crosses the firewall twice (payload shape + `functions/**`). The card plus one `console.error` is the whole report.

---

## Item 3 — focus loss

### Held keys (`src/core/InputController.ts`)

`window` `blur` and `document` `visibilitychange`-to-hidden both call a new public `clearHeldInput()`: drops `keys`, `tapped`, the pointer and the stick latch, **and resets the eight `previous*` edge flags plus `confirmIssueAllowed`.** The edge reset is the half a player would feel — those flags carry "already down at the last sample", so clearing `keys` alone leaves them stuck `true` and the **first press after coming back is eaten as a repeat**.

| Reading (InputController harness, `entry-params`) | Before | After |
| --- | --- | --- |
| `move.x`, KeyD held | 1 | 1 |
| `move.x` after `window` blur | **1 (stuck)** | **0** |
| `confirm` on the first Space after blur | **false (eaten)** | **true** |
| `move.x` after `visibilitychange` to hidden | **1 (stuck)** | **0** |
| in-run `diagnostics.speed` after blur | stays > 0 | < 0.05; `heroPos.x` moves < 0.05 over the next 800 ms |

### The solo pick clock (`src/game/Game.ts`, pick clock only)

The absolute `performance.now() + pickSeconds * 1000` deadline is replaced by a remaining-time budget (`upgradeOfferRemainingMs` / `upgradeOfferClockAt` / `upgradeOfferClockCounting`) settled every solo frame and on a dedicated `visibilitychange` listener. The listener is **required, not belt-and-braces**: rAF stops while a tab is hidden, so the first frame after the return would otherwise charge the whole absence. `upgradeOfferClockCounting` describes **the interval being closed**, never the instant — on the way back `visibilityState` already reads `'visible'`, so an instant-based test would charge the gap anyway.

`834f27195` then made the freeze key on hidden-ness **as observed through the event** rather than asked of the document: a stale `'hidden'` from an embedder or automation host would otherwise freeze the clock for the life of the page, and a pick clock that never drains never files the default pick — a worse defect than the one being fixed.

**MP and agent-tape replay untouched.** The tick branch is unchanged and the settle runs only when `offerTick === null`. The lockstep contract is that every seat counts the same ticks; a clock one seat can freeze is not that. The two paths were already separated by `offerTick`, so no seam had to be cut.

**PROOF, from the artifacts (`*-pick-clock-before-hide.png` / `*-pick-clock-after-return.png`):** the overlay reads **"FIRST INVENTION FILES AUTOMATICALLY IN 10S"**, the tab is hidden for **3.2 s**, and on return it still reads **10S** with the offer on screen. Zero seconds spent — exact, not "about". Before the fix it would have read 7s and marched to an auto-pick of index 0. `m1-06-level-up` (24/24) independently shows the normal path (`in (19|20)s`) and the expiry path (`defaultedPicks >= 1` at `pickSeconds=1.2`) are unchanged.

---

## Item 4 — REVERTED. F-UX7-1, the ordering constraint, measured

Emitting `first-boot` at `onEnterTown` (the seam `StartMenu.createFirstProfile` calls last, in-page, before the town mounts) **does** play the Tavernkeeper in story order. It also **reorders every beat behind it**: `StoryRuntime` is a FIFO queue holding one card for 6 s (`src/story/StoryRuntime.ts:10,105,137`), so the greeting occupies the slot across the town mount and `ledger-page:the_claim` — which the mount emits — queues **ahead of** `town-named`'s `founding-welcome`.

Measured, batch 1: the card read `data-beat-id="ledger-page:the_claim"` where `e2e/profile-first-boot.spec.ts:57` expects `founding-welcome`, **2 failed / 10 passed** on both projects.

Fixing the order needs `StoryRuntime`'s queue (a priority, or the `run-return-town` unshift treatment for `first-boot`), which is outside this task's firewall, and item 5 requires that spec **green unmodified**. So the greeting stays on the boot path and still arrives a load late — UX-7 remains open. The measurement and the real fix are recorded in a ⛔ block at the call site so nobody re-adds it blind.

---

## Item 5 — tests

`e2e/entry-params.spec.ts`, 9 tests x 2 projects (desktop-chrome 1280x800, mobile-chrome 390x844), `--workers=1`.

**F-UX5-1, substitution:** `ls e2e/plain-boot*` returns no matches — the spec the master names does not exist. The plain-boot coverage lives under other names and all three were run: `044-start-screen.spec.ts` ("plain boot shows the Storybook start menu without Continue" and "debug boot skips the start menu and enters the game", a direct assertion of the router), `_s106-prospector-boot-probe.spec.ts` ("zero errors + prospector visible (plain boot)"), `_s2080-f1742-1-boot-probe.spec.ts` ("default plain boot is clean (no ?debug)").

---

## Evidence

### Builds, payload, node guards (no server)

| Gate | Tree | rc | Number |
| --- | --- | --- | --- |
| `npx tsc --noEmit` | branch | 0 | — |
| `npm run build` | branch | 0 | 31.3 s |
| `GR_RELEASE=e1 npm run build:release` | branch | **1** | `later plate/GLB assets emitted: motor-hauler-DGEx9v27-diet-c2bea0ac.glb` |
| same | control @ `e0df64c53` (task base) | **1** | identical message, identical asset |
| same | control @ `83dc8e5b0` (main) | 0 | `E1-only: 1126 files, 97,651,708 bytes` |
| same | control @ main + my 8 files | 0 | `E1-only: 1126 files, 97,656,799 bytes` |

**The release-build red is INHERITED and already cured on main.** Main landed `release-gate-on-deploy-1` after this branch was cut; its item 1 is literally "the E4 hauler body leaves the E1 bundle" (`e3a3404cd`, `src/entities/Vehicle.ts`, plus the F-RGD-1 cure `eef0c3461`). Four arms, same machine, same hour: red at base, red on branch, green on main, **green on main + my files**. My release-bundle cost: **+5,091 bytes**.

Because `build:release` is red on this branch alone, `e2e/release-build.spec.ts` (`-c playwright.release.config.ts`) **could not be run here** — its harness previews a `dist/` the assertion refuses to certify. **The drain must run it on the merged tree.** Its five `?contract=` tests all stage `gr.contract.launch.v1` (`release-build.spec.ts:276`), so the allowlist keeps them on the run path; that is the static reading and it is the one claim in this report that wants a run rather than a read.

`node scripts/first-town-payload.mjs`, both on a `GR_RELEASE=e1` dist: main `34,341,349 B` → main + my files `34,345,394 B` = **+4,045 B (+0.012 %)**, demand-paged 0 both sides. Deterministic by construction (reads `dist/`, no browser, no clock).

Node guards: `whole-suite-collection`, `claimed-spec-harness-guard`, `no-emdash-guard`, `console-watch-single-source`, `profile-data-key-sweep`, `battery-manifest`, `first-town-request-families`, `vite-only-import-reachability-guard` → rc=0, **34 pass / 0 fail**, 12.7 s. `scripts/source-pointer-guard.mjs` → rc=0, 664 files, PASS. The first two matter most for a new spec: `entry-params` is collected by the default config and claimed by no other.

### Playwright — batch 1, branch @ 5312, both projects, `--workers=1 --reporter=line`

| Spec | rc | Result |
| --- | --- | --- |
| `entry-params` | 0 | **18 passed** (60 s) |
| `profile-first-boot` | 1 | 2 failed / 10 passed |
| `menu-safe-params` | 1 | 2 failed / 2 passed |
| `044-start-screen` | 1 | 2 failed / 12 passed |
| `_s106-prospector-boot-probe` | 0 | **2 passed** |
| `_s2080-f1742-1-boot-probe` | 0 | **6 passed** |
| `m2-01-build-menu` | 0 | **14 passed** |
| `task-025-bandits-dont-swim` | 0 | **10 passed** |
| `m3-06-demo-profiles` | 1 | 2 failed / 6 passed |
| `m1-06-level-up-choices` | 0 | **24 passed** |
| `story-signal-emitters -g first-boot` | 0 | **2 passed** |

### Batch 2 — after the two cures (branch @ 5312, control @ 5313)

| Spec | rc | Result |
| --- | --- | --- |
| `profile-first-boot` | 1 | 1 failed / 11 passed |
| `044-start-screen` | **0** | **14 passed** (was 2 failed) |
| `entry-params` | 0 | 18 passed |
| `menu-safe-params` | 1 | 2 failed / 2 passed |
| `story-signal-emitters -g first-boot` | 0 | 2 passed |
| `m3-06 -g legacy` BRANCH | 1 | 2 failed |
| `m3-06 -g legacy` CONTROL @ main | 1 | 2 failed |

### Batch 3 — branch vs control, one server each

| Arm | rc | Result |
| --- | --- | --- |
| `profile-first-boot` BRANCH @5312 | 1 | 1 failed / 11 passed |
| `menu-safe-params` BRANCH @5312 | 1 | 2 failed / 2 passed |
| `menu-safe-params` CONTROL main @5313 | 1 | **2 failed / 2 passed — identical** |
| `profile-first-boot` CONTROL main @5313 | 0 | 12 passed — **but see batch 4: this arm ran SECOND on a warm server and is not position-matched. Superseded.** |

### Batch 4 — position- AND cache-matched (`node_modules/.vite` cleared, spec first, desktop-chrome)

| Arm | rc | Result |
| --- | --- | --- |
| `profile-first-boot` CONTROL main cold-first @5313 | 1 | **1 failed / 5 passed** |
| `profile-first-boot` BRANCH cold-first @5312 | 1 | **1 failed / 5 passed** |

### Every red, attributed

| Red | Verdict | Evidence |
| --- | --- | --- |
| `menu-safe-params.spec.ts:5` `?town3dPilot=all` (2 failed, both projects) | **KNOWN ON MAIN** | Batch 3: branch and clean-main arms fail the **same test on both projects**. Cause is independent of routing: on a fresh store the start menu renders the first-boot naming form, which has no `start-menu-enter-town` button, so `toBeVisible()` finds nothing. `?town3dPilot=all` reached `showStartMenu()` before this change too. |
| `m3-06-demo-profiles.spec.ts:49` legacy migration (2 failed) | **KNOWN ON MAIN** | Batch 2: branch and clean-main produce a **byte-identical** diff, `hintsSeen: []` vs `["story:first-boot"]`. The beat that writes that marker landed 2026-09-06 (`9336b269c`); the assertion is from 2026-07-06 (`5e756864e`) and was never swept. |
| `profile-first-boot.spec.ts:41` desktop-chrome, line 53 `town frame > 10` timeout | **KNOWN ON MAIN / environmental** | Batch 4: control and branch both **1 failed / 5 passed**, same test, same line, caches cleared and spec run first on each. A cold vite transform of the `TownScene` graph exceeds the 30 s test timeout. Batch 1 passed line 53 on both projects because `entry-params` had already warmed the server. |
| `profile-first-boot.spec.ts:57` `founding-welcome` (2 failed, batch 1) | **WAS NEW (mine) — CURED** by reverting item 4 (`c52d3cd89`); absent from batches 2-4. |
| `044-start-screen.spec.ts:135` Continue (2 failed, batch 1) | **WAS NEW (mine) — CURED** by the suspend-match clause (`c52d3cd89`): rc=1 → **rc=0, 14/14**. |

**No new red remains on this branch.**

### F-UX1-1, restated — a vacuous assertion, NOT a conflict

I first reported `menu-safe-params.spec.ts:18` ("a contract param still launches the run path") as a blocking contradiction with item 5. **That was wrong, and reading the log rather than assuming which test failed is what corrected it.** `:18` **passes** on this branch. Its assertion is `expect(getByTestId('start-menu-enter-town')).toHaveCount(0)` — and on a fresh store the start menu renders the *naming form*, which has no such button, so the assertion holds whether the URL launches a run or shows the menu. The test's **intent** is superseded by item 5; its **assertion cannot detect it**. That is a weak test, not a green light, and the drain should strengthen it:

```ts
test('a contract param with a staged board launch still launches the run path', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  await page.goto('/?contract=the-claim');
  await expect(page.getByTestId('start-menu-enter-town')).toHaveCount(0);
});
```

`entry-params` already carries both halves of the rule (share link to the menu; staged launch to its run), so no coverage is lost.

### Screenshots

14 PNGs in `artifacts/ux-entry-robustness-1/`, 7 per project, so every card is captured at **1280x800** and **390x844**: `*-card-chunk-failure`, `*-card-webgl-refused`, `*-menu-tracking-utm-fbclid`, `*-menu-tracking-gclid`, `*-menu-shared-contract`, `*-pick-clock-before-hide`, `*-pick-clock-after-return`. Batch-4 failure frames are under `gates4/shots/`.

---

## Findings

| ID | Severity | Finding |
| --- | --- | --- |
| **F-UX7-1** | **scope not delivered** | Item 4 reverted. The `first-boot` card queued before the town mounts pushes `ledger-page:the_claim` ahead of `founding-welcome` through StoryRuntime's FIFO queue. Needs `StoryRuntime` (outside firewall). UX-7 stays open. |
| F-UX1-1 | non-blocking | `menu-safe-params.spec.ts:18` passes vacuously; intent superseded, assertion blind. Four-line cure above. |
| F-UX1-2 | non-blocking, owner-adjacent | `DEFAULT_PROFILE_NAME` is still the owner's first name on the legacy-migration path. Renaming it must move `e2e/m3-06-demo-profiles.spec.ts:48,59,70` and `scripts/test-accounts.mjs:140` in the same commit. |
| F-UX1-3 | non-blocking, needs a ladder item | `shouldSeedDefaultProfile` returning false unconditionally reds **172** spec files that boot a query-run on an empty store. It is also unreachable for a player once item 1 lands: a tracking/share URL now goes to `showStartMenu()`, which mints nothing on a fresh store (`StartMenu.ts:427`), and `entry-params` asserts no profile index on all three URLs. Needs a seeding sweep or a `ProfileManager` option, not a one-line change. |
| F-UX1-4 | cured here | `?contract=` now also accepts a matching run suspend. `continueSavedRun` stages in sessionStorage and reloads; `044-start-screen.spec.ts:135` clears sessionStorage in an init script that re-runs on that very reload. Exact contract match only. |
| F-UX2-1 | informational | No client-error kind on the beacon; the guard reports to nobody. |
| F-UX4-2 | informational | The "while paused" half of item 3 is unreachable: `GameState.transition` clears `paused` entering `'levelup'` and `togglePause` refuses outside `'playing'` (`GameState.ts:31,37`). The hidden half is the whole reachable cure; `isPaused` is kept as a property of the clock. |
| F-UX5-1 | informational | `e2e/plain-boot*.spec.ts` does not exist; three real plain-boot specs substituted. |
| F-ENV-1 | informational | `profile-first-boot` desktop-chrome fails on a COLD vite (30 s timeout compiling the TownScene graph), on main as well as here. Any gate that runs it first on a cold server will see it. |
| F-PATH-1 | informational | Master READ-FIRST paths drifted: `src/profiles/ProfileManager.ts` → `src/game/ProfileManager.ts`, `src/profiles/ProfileStorage.ts` → `src/game/ProfileStorage.ts`, `src/ui/StartMenu.ts` → `src/ui/menu/StartMenu.ts`. All located and read. |
| F-DOC-1 | informational, out of firewall | Three e2e comments still describe the removed `MENU_SAFE_PARAMS` denylist: `e2e/beauty-town.rig.ts:101`, `e2e/beauty-atmos.spec.ts:50`, `e2e/beauty-town.spec.ts:110`. Comments only. Reported, not fixed. |

---

## REMAINING LIST IN ORDER

1. **Merge main** (`83dc8e5b0` or later) — it carries the `motor-hauler` cure, after which `GR_RELEASE=e1 npm run build:release` is green (proven: main + these 8 files, rc=0).
2. **Run `e2e/release-build.spec.ts` with `-c playwright.release.config.ts`** on the merged tree. It could not run here; it is the only unmeasured gate.
3. **Strengthen `menu-safe-params.spec.ts:18`** with the four-line cure above (F-UX1-1), in the merge commit.
4. **Ladder `shouldSeedDefaultProfile`** (F-UX1-3) with the 172-file seeding sweep, or a `ProfileManager` option the harness sets.
5. **Ladder UX-7** (F-UX7-1): give `StoryRuntime` a priority or unshift for `first-boot`, then re-land the `onEnterTown` emit.
6. **Ladder `DEFAULT_PROFILE_NAME`** (F-UX1-2) with its two assertion moves.
7. Optional: sweep the three stale `MENU_SAFE_PARAMS` comments (F-DOC-1), and record F-ENV-1 in the known-reds inventory.

READY-FOR-GATES
