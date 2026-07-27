# Task lane-c-trail-guide-residue-triggers: cover the Trail Guide's two remaining first-run triggers — first build-menu open, first theft (lane-c, commit prefix "feat:")

**FIRE-AUTHORED s1145 (attended review welcome).** This is the honest residue of polish-04, which shipped as RF-02's Trail Guide under a different design. It has been named as owed, and explicitly as **NOT an owner call**, in four separate ledger entries (F-1132-12, F-1133-1, BACKLOG:73, BACKLOG:1419) and has been left unauthored by three fires because it needs **new player-facing copy**. That blocker is resolved by precedent, not by invention: **F-903-1 ruled the Trail Guide's bark lines "tunable copy — owner wording review welcome"**, so bark copy ships fire-side and the owner retunes wording afterward exactly as he may for the original eight. **Proposed lines are given verbatim in scope 3 — use them as written unless you find a canon conflict, and say so if you do.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1145 measured this lane and you must still re-verify it: `git log main..lane/e2-arsenal` was **1 ahead** at `99e79985`, and that commit is **FALSE-AHEAD** — its content merged to main at `8bfa549c`. Proven by two-dot diff, not by the commit message: `git diff --numstat main lane/e2-arsenal` showed insertions in only **two** files, `STATUS.md` (the lane's stale line-1) and `artifacts/map-census/table.md` — and the lane's census table is the **older** run (`Generated: 2026-07-27T16:17:49`) against main's fresher `16:32:14`, same failures with sub-0.01 luminance jitter. Nothing unique dies. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `src/story/trailGuide.ts` — the whole file (49 lines). `TrailGuideTrigger` union at `:3-11`, the eight `TRAIL_GUIDE_BARKS` at `:15-23`, the fire-once gate at `:26-37`.
2. `e2e/trail-guide.spec.ts` — the whole file (155 lines). `openRun():41`, `expectBark():47`, `guideHints():61`, and the exact-equality assertion at `:82-86`.
3. `src/game/Game.ts:4597` `speakTrailGuide()` — the single fire path (sets the line, arms dismiss-on-any-input, `syncUi()`).
4. `src/game/Game.ts:6853-6871` — `toggleBuildMenu()` / `closeBuildMenu()` / `collapseBuildMenu()`.
5. `src/game/Game.ts:6410-6431` — the steal site and `onThiefGrabbed()`.
6. `e2e/m2-04-gold-stealing.spec.ts:59` and `:112-125` — the **proven working reference** for driving a real theft in a test.
7. `tasks/lane-c-polish-04-first-run-hints.md` — the superseded original master. **⛔ Read it, never queue it** (it carries a Mistake #8 DO-NOT-QUEUE guard). Its line 4 is the source of this task's intent.

## WHY (quoting the evidence, dated)

polish-04's original brief (`tasks/lane-c-polish-04-first-run-hints.md:4`, owner-blessed) named five first-run hints. RF-02's Trail Guide shipped the mechanism and eight barks, but **two of the five named triggers were never covered**: *"first B open (build menu tour = blurbs already there), first theft alarm (chase or let go)."*

**F-1133-1 (2026-07-27) verified the gap at source and ruled on its nature:** *"✓ VERIFIED the two residue triggers are genuinely absent from the `TrailGuideTrigger` union at `:3-11` (no first-B-open, no first-theft-alarm) — so the residue is real, small, and **not an owner call**."*

✓ **s1145 re-verified all of it at source rather than inheriting it** (the standing method rule — a task authored off prior prose is exactly the Stale Belief it is meant to cure):
- The union at `:3-11` holds **eight** members; neither residue trigger is present. Still true today.
- **Both trigger surfaces exist and are single, clean choke points.** `git grep "buildMenuOpen = true" src/game/Game.ts` returns **exactly one line, `:6858`** — every open path (keyboard `KeyB` via `:2262`/`:2991`, and the UI/touch path via `:5764` `intent.type === 'toggle_build_menu'`) funnels through `toggleBuildMenu()`. `onThiefGrabbed():6426` is the theft alarm, reached from the one `gold_stolen` site at `:6412-6422`.
- **The test surface exists and is proven:** `window.__GR_TEST__.spawnThief(edge)` is declared at `src/vite-env.d.ts:1022`, wired at `Game.ts:1658`, and driven to a real `gold_stolen` event by `e2e/m2-04-gold-stealing.spec.ts`. **You do not need a new src/ test hook — do not add one.**

## SCOPE (numbered, each testable)

1. **RE-MEASURE THE PREMISE BEFORE CHANGING ANYTHING.**
   Run `e2e/trail-guide.spec.ts` on **both** projects, `--workers=1`, and paste the before numbers. Re-run `git grep "buildMenuOpen = true" -- src/` and confirm it is still exactly one line. **If any premise above is false, STOP and report it — that finding outranks the feature.**

2. **Extend `TrailGuideTrigger` and add two barks — nothing else in `trailGuide.ts` changes.**
   Add `'first-build-menu'` and `'first-theft'` to the union, and two entries at the **end** of `TRAIL_GUIDE_BARKS` with ids `trail-guide-first-build-menu` and `trail-guide-first-theft`.
   ⚠️ **The trigger is named `first-build-menu`, NOT `first-b-open`, and that is deliberate:** mobile players open the menu by tapping the Build button, never by pressing `B`. Naming the trigger after a key would be a desktop-only lie about a path both inputs share.
   **Leave the existing eight barks byte-unchanged** (their wording is owner-reviewable copy — see F-903-1).

3. **The copy — use these lines verbatim.**
   - `first-build-menu`: `Every line here names its price and its work. Set what the claim is short of, not what looks grandest.`
   - `first-theft`: `One of them is away with your gold. Give chase and it comes back to the pile, or let them run and keep your place at the claim.`
   These are written to the shipped voice (two sentences: observe the moment, then the actionable read; warm era-1 frontier register; WD grammar), to the original brief's intent (*"build menu tour = blurbs already there"* / *"chase or let go"*), and to canon: brief §9.2 — the claim jumper is an **unarmed thief**, so there is no weapon, wound or blood language, and none may be added.

4. **Wire `first-build-menu` at the open branch only.**
   `Game.ts:6858` (inside `toggleBuildMenu()`, the `this.buildMenuOpen = true` path). It must **not** fire from `closeBuildMenu():6862` or `collapseBuildMenu():6869`.

5. **Wire `first-theft` on a real theft — and NOT behind the `?noping` guard.**
   `onThiefGrabbed():6426-6431` early-returns when `isPingDisabled()` is true (`src/core/DebugParams.ts:102` — the `?noping` debug param, an **audio/ping** preference). **A teaching hint must not be silenced by an audio flag**, so do not put the bark behind that return. Fire it on the confirmed steal (after `result.ok` and `this.stolenTotal += amount`, `:6418-6422`) so it tracks the event and not the sound.
   **Fire on the player's first *loss*, not on a re-steal of an already-loose pickup** — `m2-04:251` proves a loose pickup can be re-stolen **without** another Economy event, so anchoring to the `gold_stolen` event (not to a thief touching gold) is the correct and testable choice.

6. **Extend `e2e/trail-guide.spec.ts` with two new tests; do not rewrite the existing four.**
   Follow the file's own helpers (`seedRunProfile`, `openRun`, `expectBark`, `guideHints`); copy the theft-driving pattern from `m2-04-gold-stealing.spec.ts` rather than inventing one. Each new test proves: the bark appears once, the `story:trail-guide-…` key lands in `hintsSeen`, it does **not** reappear after reload, and a veteran profile (`trailGuide: false`) gets nothing.
   ⚠️ **`:82-86` asserts `guideHints()` EQUALS exactly three keys.** Re-run that test and report its result explicitly. It boots `?nospawn` and never opens Build, so it *should* be unaffected — **but verify it rather than assuming, and if it breaks, report which new trigger leaked into it instead of loosening the equality.**

7. **Report the back-to-back bark behaviour — do NOT redesign it.**
   `speakTrailGuide():4600` assigns a single `this.trailGuideLine`, so a second bark **overwrites** the first. `first-gold`'s line already says *"Open Build…"*, so a player who obeys it immediately can stomp it with `first-build-menu`. **Measure whether that happens and report it with what you saw.** Adding a queue, a delay, or a priority rule is a **design fork and a firewall violation** — the finding is the deliverable.

8. **Prove the cure with a mutation control.** For one new test, re-point its expectation at copy that is never spoken (e.g. change the expected substring to `NOPE-not-a-bark`), confirm it goes **RED**, then restore byte-exact. Paste both outcomes. *(A test that passes while observing nothing is not coverage.)*

## FIREWALL

**TOUCH-ONLY:** `src/story/trailGuide.ts` · `src/game/Game.ts` (**only** the two insertion points in scopes 4 and 5) · `e2e/trail-guide.spec.ts`.
**NO:** the existing eight bark lines (byte-unchanged) · `src/ui/Hud.ts` (the feed surface at `:262-265` already carries barks correctly — nothing to change) · `src/game/ProfileStorage.ts` and the `hintsSeen` schema · `src/core/DebugParams.ts` · `Balance.ts` · any queue/priority/timing redesign of `trailGuideLine` (scope 7) · any new `__GR_TEST__` hook (`spawnThief` already exists) · `e2e/m2-04-gold-stealing.spec.ts` (read it, copy from it, **do not edit it**) · every other e2e spec · `tasks/lane-c-polish-04-first-run-hints.md` (guarded ⛔ DO-NOT-QUEUE).
Canon: brief §9.2 / ADR-001 — frontier-tech only, **no firearms ever**, the claim jumper is an unarmed thief, warm and never gory.

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` clean.
- `npm run build` green.
- `e2e/trail-guide.spec.ts` **before and after**, on `--project=desktop-chrome` **and** `--project=mobile-chrome`, `--workers=1`, with counts and any first-failure lines.
- `e2e/m2-04-gold-stealing.spec.ts` **unmodified-green on both projects** — it exercises the exact steal path scope 5 hooks, so it is the adjacent suite that matters most.
- The scope-6 `:82-86` exact-equality test's result, stated explicitly.
- Scope-8 mutation control shown RED, then restored byte-exact.
- Zero console/page errors asserted in both new tests (the file's existing tests already do this via `collectErrors` — follow the pattern), desktop **and** 390px.
- `git diff --stat` showing **exactly three files** touched.

READY-FOR-GATES + report: before/after suite numbers on both projects; the two barks' final wording (and any canon objection you had to it); the exact insertion points you chose in `Game.ts` with line numbers; **the scope-7 back-to-back finding with what you actually observed**; the `:82-86` result; `m2-04`'s numbers; and the mutation control's red.
