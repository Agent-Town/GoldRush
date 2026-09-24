# ux-entry-robustness-1 — implementer report

**Branch** `fix/ux-entry-robustness-1` · **worktree** `/Users/robin/Claude/Projects/wt-ux1` · **cut from** `e0df64c53`
**Implementer** Claude Opus 5 (attended, owner's Anthropic subscription) · **date** 2026-09-24
**Commit prefix** `fix:` · **commits** `7c8656fa8`, `9a0ee33d4`, `336841c1e`, `b64c08175` (+ this report)

## Pre-flight (as the master wrote it)

| Check | Result |
| --- | --- |
| `git status --short` | only `?? node_modules` (the symlink). No modified tracked file, so no factory-churn exception was needed. |
| `git log main..HEAD --oneline` | empty |
| `npm run build` | rc=0 in 31.3 s (tsc + vite build + asset-diet) |

---

## THE ONE THING THE DRAIN MUST DECIDE FIRST

**F-UX1-1 — item 5 and `e2e/menu-safe-params.spec.ts:18` are in direct contradiction, and the firewall forbids me to resolve it.**

The master's item 5 requires `/?contract=e1-night-shift` with no `?debug` to **show the start menu** on a fresh store. The existing assertion says the opposite:

```ts
// e2e/menu-safe-params.spec.ts:18-21
test('a contract param still launches the run path', async ({ page }) => {
  await page.goto('/?contract=the-claim');
  await expect(page.getByTestId('start-menu-enter-town')).toHaveCount(0);
});
```

Same predicate, opposite verdicts. The firewall says "NO changes to ... existing e2e assertions", so I implemented the master and left the spec untouched. **That one test is a deliberate, ordered supersede, not a regression** — see the gate table for its measured state. The cure the drain should apply in the merge commit is four lines:

```ts
test('a contract param with a staged board launch still launches the run path', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  await page.goto('/?contract=the-claim');
  await expect(page.getByTestId('start-menu-enter-town')).toHaveCount(0);
});
```

My `e2e/entry-params.spec.ts` already carries both halves of the new rule (the share link goes to the menu; the staged launch reaches its run), so no coverage is lost by the edit.

Nothing else in the corpus depends on the old behaviour. Measured, not assumed: of 759 `goto` calls in 482 e2e files, **nine** rely on a bare `?contract=` — and eight of them stage `gr.contract.launch.v1` in an init script first (`release-build.spec.ts:276`, `e6-half-life-hollow-crossing.spec.ts:52`, `e7-relay-rush-front.spec.ts:238`, `e8-far-side-probe.spec.ts:97`). `menu-safe-params.spec.ts:19` is the only one that does not.

---

## Item 1 — the menu decision inverts to an allowlist of run routes

`src/main.ts` — the old rule showed the menu only if **every** query key was in a six-key `MENU_SAFE_PARAMS` set, and launched a run otherwise. The default for an unrecognised parameter was therefore "skip the menu and start playing". The new rule is the inverse: the menu is the default, and a run launches only when the query **names** a route into one.

### THE ALLOWLIST, EVERY KEY ON IT

**Group 1 — run routes (honoured by a release build), 7 keys**

`seed` · `difficulty` · `mode` · `press` · `replay` · `epoch` · `profiles`

**Group 1b — `contract`, the one conditional member**

`?contract=` launches a run **only** when a player launch is staged in sessionStorage (`stagedPlayerContractLaunch()` — what `launchContract`, `continueSavedRun` and the Charter Press return all write before reloading) **or** when `?debug` is present on a non-release build. A typed or pasted `?contract=` stages nothing, so it is a share link and lands on the menu. This closes no door the release build keeps open: `?contract=` without a staged launch never opened the named contract anyway, it fell back to the Claim (`specs/release-e1/README.md` section 4, F-TOUR-1).

**Group 2 — the debug harness (compiled out of the release build), 25 keys**

`debug` · `bench` · `editor` · `timescale` · `nospawn` · `nowaves` · `nolevel` · `nokill` · `nopause` · `nosteal` · `nowreck` · `noping` · `stress` · `profile` · `nobeauty` · `nopoolgrade` · `performance` · `era` · `mp` · `mpRelay` · `mpCode` · `mpName` · `mpTown` · `mpParty` · `mpDesyncAt`

Group 2 is derived from source, not from the corpus: it is every key `src/core/DebugParams.ts` honours, its two aliases (`bench=fullbase` and `editor` both imply debug, `DebugParams.ts:40`), and the multiplayer/era harness doors. `readDebugParams` returns `DEFAULT_PARAMS` when `__GR_RELEASE_E1__` (`DebugParams.ts:34`), so **the release build's only run routes are group 1**.

**Not on either list, deliberately:** `town3dPilot`, `run3dPilot`, `tier`, `townDusk`, `townNight`, `townSky`. The master's parenthetical suggests putting the old menu-safe pilot keys on the run list; doing so would re-open F-BT-1 and the owner's own report ("owner hit /?town3dPilot=all then landed in The Claim"). Under the inverted rule they need no special case at all — they are simply not run routes, like every other unrecognised key, and `main.ts` says so where `MENU_SAFE_PARAMS` used to be declared.

### BEFORE / AFTER, MEASURED

Static scan of every `goto` in `e2e/**` (literal URLs plus in-file `const` template resolution), old predicate vs new:

| Corpus | Before | After |
| --- | --- | --- |
| e2e files scanned | 482 | 482 |
| `goto` calls parsed | 759 | 759 |
| verdicts that flip (run/menu) with the final allowlist | — | **0** |
| verdicts that flip with a naive run-routes-only list | — | 14 (all debug-modifier-only URLs: `?nowaves`, `?timescale=2`, `?performance=full`, `?nolevel&nopause`, `?stress=120&nowaves&nokill`, `?nospawn&nowaves`) |

The 14 near-misses are why group 2 exists and why the comment in `main.ts` carries the warning that **a new harness key must be added to the list or a URL carrying only that key lands on the menu**.

### The player-facing effect

| URL, fresh profile store | Before | After |
| --- | --- | --- |
| `/?utm_source=x&fbclid=y` | run of The Claim, profile minted and named after the owner | start menu, naming form, **no profile index written** |
| `/?gclid=z` | run of The Claim, profile minted | start menu, **no profile index** |
| `/?contract=e1-night-shift` (shared link) | run of The Claim, profile minted | start menu, **no profile index** |
| `/?contract=the-claim` + staged launch | run | run (unchanged) |
| `/?debug&seed=...` | run | run (unchanged) |
| `/?town3dPilot=all` | menu | menu (unchanged) |

### `shouldSeedDefaultProfile` — NOT DONE AS WRITTEN, and why (F-UX1-3)

The master: "`ProfileManager.shouldSeedDefaultProfile` returns false whenever no profile exists (a profile is minted only by the naming flow), and `shouldShowProfileTitle` follows the same rule."

It is only ever *consulted* when no profile exists (`ProfileManager.loadInitialState`, `:326-329`), so "false whenever no profile exists" means "always false". Traced: `loadInitialState` then returns `undefined`, `this.state` is unset, the `if (this.state && !shouldShowProfileTitle(...))` start is skipped, and `render()` draws the "Who's prospecting?" card instead of starting the game.

**Measured blast radius: 172 of the 247 query-booting e2e spec files never seed a profile** and depend on that auto-seed to reach a game at all. Making the change literally converts 172 spec files into reds without editing one of them — the same firewall clause that protects `menu-safe-params.spec.ts` protects those.

It is also **unreachable for a player once item 1 lands**, which is the substantive argument: after the inversion, `startWithProfiles()` is reached only by a query carrying a run-route key. A tracking or share URL now goes to `showStartMenu()`, whose `setupProfileStorage()` mints nothing on a fresh store (`StartMenu.ts:427` seeds only on `hasLegacyProfileData`). The item-5 assertion the master asked for — "mint no profile (assert `localStorage` has no profile index after the load)" — therefore **passes on the allowlist change alone**, and my spec asserts exactly that on all three URLs.

Recommendation for the drain: keep item 1's routing as landed, and treat the `shouldSeedDefaultProfile` clause as a separate ladder item that must come with the 172-file seeding sweep (or an explicit `ProfileManager` option the harness sets). Do not land it as a one-line change.

### `DEFAULT_PROFILE_NAME` — deliberately unchanged (F-UX1-2)

The master's firewall allows `ProfileStorage.ts` for "the fallback name only", and scope 1 names only `DeathOverlay.ts:412`. Both fallback returns are now neutral:

| Site | Before | After |
| --- | --- | --- |
| `ProfileStorage.activeProfileName()` storage-absent / throwing return | `'Robin'` | `UNNAMED_PROSPECTOR_NAME` = `'Prospector'` |
| `DeathOverlay.ts:412` Best Claims row, legacy score with no `profileName` | `'Robin'` | `UNNAMED_PROSPECTOR_NAME` |

`DEFAULT_PROFILE_NAME` itself (the name the **legacy migration** mints) stays `'Robin'` because it is load-bearing for existing assertions the firewall protects: `e2e/m3-06-demo-profiles.spec.ts:48` (the test is *titled* "legacy single-profile scores migrate into Robin"), `:59` (`name: 'Robin'`), `:70` (the death-overlay row), and `scripts/test-accounts.mjs:140`. Renaming it is a real improvement and a real ledger item; it is not a drive-by.

---

## Item 2 — the boot guard

New module `src/core/BootGuard.ts` (225 lines), **armed by being `main.ts`'s first import** — module bodies evaluate in import order, so it is listening before any line below it can fail. `installBootGuard()` is also called explicitly from `main.ts` and is idempotent.

| What | How |
| --- | --- |
| `window` `error` | card, until `markBootReached()` |
| `window` `unhandledrejection` | card, until `markBootReached()` |
| `window` `vite:preloadError` | card, until `markBootReached()` |
| webgl2 probe | `webgl2Available()` — cached, and it calls `WEBGL_lose_context.loseContext()` on the probe context so the check can never starve the real renderer. Called at the top of **both** `startGame()` and `openTown()`, before `createRenderer` is reached. |
| the 17 runtime dynamic imports in `main.ts` | all routed through `guardedImport(label, () => import(...))`. (The master says 27; 6 of the 27 `import(` occurrences in `main.ts` are type positions at `:38-43`, and the remaining runtime ones collapse to 17 distinct call sites. `grep -n "import('\./" src/main.ts | grep -v guardedImport` now returns only the 6 type lines.) |

**Deliberately narrow, twice.** (1) It is a *boot* guard: the window listeners stop raising the card once `markBootReached()` fires in `afterFirstFrame`, because after that an error belongs to a running game and a card would replace a working page with a tombstone. Post-boot scene swaps stay covered because the imports that build them go through `guardedImport`, which always raises. (2) `guardedImport` returns a **never-settling** promise on failure, which is the least-bad of three options: rethrowing trips an unhandled rejection at every `void import(...)` site, and resolving with a stub runs the caller's continuation against a module that does not exist.

### The card copy, verbatim

Chunk / script failure:

> **The trail washed out.**
> Part of the way in never arrived. Give it another go and the claim will be waiting.
> `[ Reload ]`

(the `script` kind reads "Something on the way in came apart." in the same shape)

webgl2 refused:

> **This window cannot see the valley.**
> The claim is drawn with hardware graphics this browser is not offering; try another browser, or switch hardware acceleration on.
> `[ Reload ]`

Testids: `boot-failure-card` (with `data-boot-failure-kind`), `boot-failure-title`, `boot-failure-line`, `boot-failure-reload`. **Styled entirely inline** — parchment `#efe2c6` on ink `#161412`, 44 px minimum button height — because a boot that failed because a chunk did not arrive cannot be told "your stylesheet will explain it".

`index.html` gained one `<noscript>` line, as the firewall permits: "Gold Rush is drawn by scripts this browser is not running. Turn them on and the trail opens."

### Telemetry: THERE IS NO CLIENT-ERROR KIND, so nothing is reported

Asked and answered by reading, per the master's "do not add a kind; say if none exists":

* `src/telemetry/payload.ts:16-28` — `RunTelemetryPayload` is run-shaped: contract, stage, waves, secureWave, deepestWave, duration, upgradesTaken, tier, frameP95, deviceClass, buildHash, nonce. No error field, no kind field.
* `functions/api/telemetry.ts:26` — `stage: 'secure' | 'end' | 'legacy'`, and `:163` rejects any other value to `null`.
* The only beacon is `src/telemetry/runBeacon.ts:89`, `POST /api/telemetry`.

Adding a kind would mean touching the telemetry payload's shape and `functions/**`, both explicitly in the NO list. **The card plus one `console.error` is the whole report.**

---

## Item 3 — focus loss

### The held key (`src/core/InputController.ts`)

`window` `blur` and `document` `visibilitychange`-to-hidden now both call a new public `clearHeldInput()`, which drops `keys`, `tapped`, the analogue pointer and the stick latch — **and resets the eight `previous*` edge flags plus `confirmIssueAllowed`.**

The `previous*` reset is the half that is easy to miss and the half a player would feel. Those flags carry "this key was already down at the last sample" so a held key fires its intent once. Clearing `keys` alone leaves them stuck `true`, and the **first press after coming back is eaten as a repeat**: the player returns to the tab, hits Space to confirm, and nothing happens. `e2e/entry-params.spec.ts` asserts that case by name (`confirmAfterBlur`).

| Reading, InputController harness | Before | After |
| --- | --- | --- |
| `move.x` with KeyD held | 1 | 1 |
| `move.x` after `window` blur | **1 (stuck)** | **0** |
| `confirm` on the first Space after blur | **false (eaten)** | **true** |
| `move.x` after `visibilitychange` to hidden | **1 (stuck)** | **0** |
| in-run `diagnostics.speed` after blur, hero walking | stays > 0 | falls below 0.05; `heroPos.x` moves < 0.05 over the next 800 ms |

### The solo pick clock (`src/game/Game.ts`, the pick clock only)

`upgradeOfferDeadlineMs` (an absolute `performance.now() + pickSeconds * 1000`) is replaced by a **remaining-time budget**: `upgradeOfferRemainingMs`, `upgradeOfferClockAt`, `upgradeOfferClockCounting`, settled by `settleUpgradeOfferClock()` every solo frame **and** on a new `visibilitychange` listener registered beside the existing performance one.

The listener is **required, not belt-and-braces**: `requestAnimationFrame` stops while a tab is hidden, so `syncUpgradeOverlay` gets no frame during the gap and the first frame after the return would charge the whole absence. And `upgradeOfferClockCounting` describes **the interval being closed**, never the instant — on `visibilitychange` back to visible `document.visibilityState` already reads `'visible'`, so an instant-based test would charge the gap anyway. That is the entire subtlety of this item.

**MP and agent-tape replay are untouched.** The tick branch (`upgradeOfferDeadlineTick`) is unchanged and `settleUpgradeOfferClock()` is called only when `offerTick === null`. The lockstep contract is that every seat counts the same ticks, and a clock one seat can freeze is not that. The two paths were already separated by `offerTick`; no new entanglement was introduced and none was found.

**F-UX4-2 — the "while the run is paused" half of item 3 is unreachable today.** `GameState.transition()` clears `paused` on the way into `'levelup'` and `togglePause()` returns early for any state that is not `'playing'` (`src/game/GameState.ts:31,37`), so **an offer cannot be paused**, and the master's stated test ("pause at 10 s remaining, wait 3 s, resume") cannot be written as a pause. The `isPaused` term is in the predicate anyway — the freeze is a property of the clock, not of one state machine's current shape — but the **document-hidden path is the whole reachable cure**, and that is what the spec measures, using the master's numbers.

---

## Item 4 — the first-boot signal fires where the profile is made

**Implemented in `src/main.ts`, not in `StartMenu.createFirstProfile`, and that is a deliberate deviation.** The one-shot claim (`claimFirstBootForProfile`) lives in `main.ts`, which cannot be imported by anything — `main.ts` runs its whole boot on import, a trap `ProfileStorage.ts:32-36` already documents. Emitting from inside `StartMenu` would mean a **second implementation of the one-shot claim**, i.e. two writers of one datum, against section 4.4 of CLAUDE.md.

`main.ts` owns the `onEnterTown` callback it hands `StartMenu`, and `createFirstProfile` calls `onEnterTown()` as its **last statement** — in-page, after `createProfile`, and before `openTown()` mounts the town. That is the same seam the master asked for, reached without duplicating the claim. One new function, `announceFirstBootIfUnclaimed()`, is called from both `afterFirstFrame` (every load that already has a profile) and `onEnterTown` (the naming flow). It installs the runtime **first** and claims **second**, because an emit with no listener subscribed drops the signal while the claim has already spent the datum — the greeting would be lost for the life of that profile.

Ordering on a fresh store: **greeting (Tavernkeeper) then the town mounts, then the town is named, then founding-welcome**, instead of the greeting arriving a load late, after the founding beat.

Harmless on the ordinary Enter Town click: the datum was already spent by the boot path on that load, and the datum — not the call site — is the one-shot guard. `scripts/profile-data-key-sweep.test.mjs`'s "F-SSE-3: the once-per-profile first-boot marker is registered, and its two declarations agree" passes unchanged.

---

## Item 5 — tests

New `e2e/entry-params.spec.ts`, 9 tests x 2 projects (desktop-chrome 1280x800, mobile-chrome 390x844), all `--workers=1`.

**Substitution, reported: `e2e/plain-boot*.spec.ts` does not exist.** `ls e2e/plain-boot*` returns no matches. The master names it in item 5. The plain-boot coverage lives under other names, and I ran the three that carry it: `e2e/044-start-screen.spec.ts` ("plain boot shows the Storybook start menu without Continue", and "debug boot skips the start menu and enters the game" — a direct assertion of the router I changed), `e2e/_s106-prospector-boot-probe.spec.ts` ("zero errors + prospector visible (plain boot)") and `e2e/_s2080-f1742-1-boot-probe.spec.ts` ("default plain boot is clean (no ?debug)").

---

## Evidence

### Builds and the payload gate (no server, no lock)

| Gate | Tree | rc | Number |
| --- | --- | --- | --- |
| `npx tsc --noEmit` | branch | **0** | — |
| `npm run build` | branch | **0** | 31.3 s |
| `GR_RELEASE=e1 npm run build:release` | branch | **1** | `later plate/GLB assets emitted: motor-hauler-DGEx9v27-diet-c2bea0ac.glb` |
| `GR_RELEASE=e1 npm run build:release` | **control @ `e0df64c53`** (the task base) | **1** | **identical message, identical asset** |
| `GR_RELEASE=e1 npm run build:release` | **control @ `83dc8e5b0`** (current main) | **0** | `E1-only: 1126 files, 97,651,708 bytes` |
| `GR_RELEASE=e1 npm run build:release` | **control @ main + my 8 files** | **0** | `E1-only: 1126 files, 97,656,799 bytes` |

**The release-build red is INHERITED, not mine, and is already cured on main.** Main landed `release-gate-on-deploy-1` after my branch was cut, and its item 1 is literally "the E4 hauler body leaves the E1 bundle" (`e3a3404cd`, `src/entities/Vehicle.ts`, plus the F-RGD-1 cure `eef0c3461`). Proven four ways in the table above, same machine, same hour: red at my base, red on my branch, green on main, **green on main with my eight files applied**. The drain's merge of main picks up the cure and the release build goes green. My release-bundle cost is `97,656,799 - 97,651,708 =` **+5,091 bytes**.

Because `build:release` is red on my branch alone, `e2e/release-build.spec.ts` (`-c playwright.release.config.ts`) **cannot be run on this branch** — its harness previews a `dist/` the assertion refuses to certify. It must be run by the drain on the merged tree. Its five `?contract=` tests all stage `gr.contract.launch.v1` (`release-build.spec.ts:276`), so the allowlist keeps them on the run path; that is the static reading, and it is the one thing in this report the drain should confirm by running rather than by reading.

`node scripts/first-town-payload.mjs`, both on a `GR_RELEASE=e1` dist, same machine:

| Tree | gated payload | demand-paged | delta |
| --- | --- | --- | --- |
| control @ main `83dc8e5b0` | 34,341,349 B | 0 B | — |
| control @ main + my 8 files | 34,345,394 B | 0 B | **+4,045 B (+0.012 %)** |

Within noise, and the number is deterministic by construction (the script reads `dist/`, no browser, no clock).

### Node guards (no server)

| Battery | rc | Count |
| --- | --- | --- |
| `whole-suite-collection`, `claimed-spec-harness-guard`, `no-emdash-guard`, `console-watch-single-source`, `profile-data-key-sweep`, `battery-manifest`, `first-town-request-families`, `vite-only-import-reachability-guard` | **0** | **34 pass / 0 fail / 0 cancelled**, 12.7 s |
| `node scripts/source-pointer-guard.mjs` | **0** | 664 files, 5 same-file citations checked, PASS |

`whole-suite-collection` and `claimed-spec-harness-guard` are the two that matter for a new spec: `e2e/entry-params.spec.ts` is collected by the default config and claimed by no other.

### Playwright gates

PENDING - the drain lock was held by another attended landing when this section was written.

---

## Screenshots

`artifacts/ux-entry-robustness-1/` — one per project, so every card is captured at **1280x800** (`desktop-chrome-*`) and **390x844** (`mobile-chrome-*`):

* `*-card-chunk-failure.png` — the parchment card after an aborted StartMenu chunk
* `*-card-webgl-refused.png` — the card after a webgl2 refusal
* `*-menu-tracking-utm-fbclid.png`, `*-menu-tracking-gclid.png`, `*-menu-shared-contract.png` — the start menu where a run used to launch
* `*-pick-clock-before-hide.png`, `*-pick-clock-after-return.png` — the countdown either side of a hidden tab

---

## Findings

| ID | Severity | Finding |
| --- | --- | --- |
| **F-UX1-1** | **blocking, needs the drain** | Item 5's `?contract=` rule and `e2e/menu-safe-params.spec.ts:18-21` assert opposite verdicts on the same URL. Implemented per the master; the spec is untouched per the firewall. Four-line cure given above. |
| F-UX1-2 | non-blocking, owner-adjacent | `DEFAULT_PROFILE_NAME` is still the owner's first name on the legacy-migration path. Renaming it needs `e2e/m3-06-demo-profiles.spec.ts:48,59,70` and `scripts/test-accounts.mjs:140` moved in the same commit. |
| F-UX1-3 | non-blocking, needs a ladder item | `shouldSeedDefaultProfile` returning false unconditionally reds **172** spec files that boot a query-run on an empty store. Unreachable for a player once item 1 lands. Needs a seeding sweep or a `ProfileManager` option, not a one-line change. |
| F-UX2-1 | informational | No client-error kind exists on the telemetry beacon (`payload.ts:16-28`, `functions/api/telemetry.ts:26`), so the boot guard reports to nobody. Adding one crosses the firewall twice. |
| F-UX4-2 | informational | The "while the run is paused" half of item 3 is unreachable: `GameState.transition` clears `paused` entering `'levelup'` and `togglePause` refuses outside `'playing'` (`GameState.ts:31,37`). The document-hidden half is the whole reachable cure; the `isPaused` term is kept as a property of the clock. |
| F-UX5-1 | informational | `e2e/plain-boot*.spec.ts` (item 5) does not exist. Substituted `044-start-screen`, `_s106-prospector-boot-probe`, `_s2080-f1742-1-boot-probe`. |
| F-PATH-1 | informational | Three READ-FIRST paths in the master have drifted: `src/profiles/ProfileManager.ts` is `src/game/ProfileManager.ts`, `src/profiles/ProfileStorage.ts` is `src/game/ProfileStorage.ts`, `src/ui/StartMenu.ts` is `src/ui/menu/StartMenu.ts`. All were located and read. |
| F-DOC-1 | informational, out of firewall | Three e2e comments still describe the removed `MENU_SAFE_PARAMS` denylist: `e2e/beauty-town.rig.ts:101`, `e2e/beauty-atmos.spec.ts:50`, `e2e/beauty-town.spec.ts:110`. Comments only, no assertion depends on them. Reported, not fixed. |

---

## Remaining list, in order

PENDING

READY-FOR-GATES
