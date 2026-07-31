# lane-b — F-1297-2: the keep-run-tape button is safe by construction and by nothing else; give it an alarm that fires on a PLAIN boot

**FIRE-AUTHORED (attended review welcome) — s1317, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-b` (branch `lane/m4`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `tasks/BACKLOG.md` — the finding **F-1297-2**, cited **BY CONTENT, NOT BY LINE** (F-1310-1: a line
   coordinate into BACKLOG is structurally unmaintainable). Find it by grepping for the sentence
   *"A PLAYER-FACING BUTTON SHIPPED WITH ONLY A `?debug` ASSERTION"*. Read the whole row. Its own verdict is
   **`GATE: none. Fire-authorable`**.
2. `e2e/tape-01-run-tape.spec.ts` — the only place the button is asserted anywhere in the suite. Read the test
   *"every ended run writes a keepable tape whose replay reproduces its event hash"* and, inside it,
   the line `const query = '?debug&nolevel&nowaves&seed=tape-01-proof';` (measured `:136` s1317 — **find it by
   the string, not the coordinate**). That one `query` feeds **both** `page.goto` calls, and the button
   assertions (`getByTestId('keep-run-tape')`, measured `:157`/`:161`/`:162`) all live downstream of it.
   ➡️ **Every existing assertion of this button runs under `?debug`.**
3. `src/game/Game.ts` — `keepTapeOptions()` (measured `~:5617`; it returns an object whose `onKeepTape`
   (`~:5620`) is **always** a function) and its three spread sites `...this.keepTapeOptions()` (measured
   `~:1477`, `~:1529`, `~:6307`). **Find these by name/spread, not by coordinate.**
4. `src/ui/DeathOverlay.ts` — `onKeepTape?: () => boolean` in the options type (`~:81`) and the render
   condition `this.options.onKeepTape` (`~:212`) that decides whether the button exists at all.
5. `logs/suite-red-inventory.md` — grep for `plain no-debug secure return`. You will find
   `e2e/tl-01-run-telemetry.spec.ts:229` recorded as a **deterministic red, 8/8 (100.0%) on BOTH projects**.
   **This is why you are NOT putting your new test in that file.** (⚠️ The same inventory also carries a row
   calling the same test a 7/12 58.3% flake at a *different* coordinate `:236`. The rows disagree; that is
   F-1307-2/F-1296-1 territory and **explicitly not your job** — do not repair, re-rate, or re-run that file.)

PRE-FLIGHT (LANE-SAFETY invariant): `node scripts/lane-usable.mjs lane-b` must print **USABLE**. If it prints
AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be
reachable in git, else STOP.

## WHY (measured s1317, every hop verified at source, none inherited)

The `keep-run-tape` button is **correct today**, and this task does not change that. It is present on every
death overlay a player can reach, by a control-flow guarantee: all three `deathOverlay.show(...)` call sites
spread `keepTapeOptions()` **unconditionally**, that helper **always** returns an `onKeepTape` function, and
`DeathOverlay` renders the button **iff** `onKeepTape` is defined. There is no debug branch anywhere on that
path. ✓ I re-verified all four of those facts at source before writing this task.

⚠️ **What is missing is the ALARM, not the behaviour.** The only test that asserts this button boots with
`?debug&nolevel&nowaves`. So if someone later puts a debug gate in front of `keepTapeOptions()`, or makes
`onKeepTape` conditional, **the suite stays green and the button silently disappears from normal play.** That
is **CLAUDE.md Mistake #10** verbatim — the crafting bench and the agent sat invisible in a plain boot for a
day, and the rule that came out of it says every user-facing merge must answer *"where does the PLAYER see
this, in a plain boot?"* with a no-`?debug` e2e. This button has never had that answer.

🪤 **THE TRAP THIS TASK EXISTS TO CLOSE, AND IT IS THE HARDER HALF.** You are writing a test for behaviour
that is **already correct**, so your new test will be **GREEN THE MOMENT YOU WRITE IT** — including if you
write it wrong. A guard that has never been observed to fail is not a guard; it is a sentence that happens to
pass. This factory has shipped that mistake before, and the cure is known and mandatory here: **manufacture
the defect and watch your own guard go red** (the s1299/s1300/s1301 standard). Scope 3 is that proof, it is
not optional, and **a report without both the RED and the restored GREEN is an automatic REJECT no matter how
clean the diff is.**

## SCOPE (numbered; each item testable)

**1. MEASURE FIRST — and this scope can CANCEL the task.** Before writing anything, establish *by running it*
whether a death overlay is reachable **without `?debug`**. Report, with the exact query strings you tried:
   - Does the game reach a death overlay on a plain boot (`/` or `/?seed=...` only)? How long does it take?
   - Are `nolevel` / `nowaves` / `seed` themselves gated behind `debug`? **Read the query parsing in
     `src/game/Game.ts` / the boot path and say so at source** — do not infer it from the fact that tape-01
     passes them together.
   - ⛔ **If NO plain-boot path to a death overlay exists at all, STOP and report.** Do not invent one, do not
     add a test hook, do not widen a debug flag. That outcome is a *bigger* finding than the one you were
     sent for (it would mean the entire death/summary path is untestable in normal play), and it belongs in a
     report, not in a workaround.
   - ✅ If a plain boot can reach death but only slowly, a non-`debug` seed/query that shortens the run is
     acceptable **provided none of its parameters require `debug`** — state which you used and why each is
     clean.

**2. Add the plain-boot assertion — in a NEW spec file.** Create `e2e/f1297-2-plain-boot-tape-button.spec.ts`.
   - One test, named so the intent survives a stranger reading it, e.g.
     *"the keep-run-tape button reaches the player on a plain boot with no debug flags"*.
   - It **must** assert the **RENDERED** button: `await expect(page.getByTestId('keep-run-tape')).toBeVisible()`
     on the real death overlay.
   - 🚫 **It must NOT assert diagnostics state.** Reading `window.__THREE_GAME_DIAGNOSTICS__` (or any
     `onKeepTape`-is-defined probe) to satisfy this test is a **REJECT**. The whole point is the thing the
     player sees, not the thing the game intends — this is the same defect class as F-1316-1, where a green
     test asserted `lastFloatText.text` while the player received six glyphs of a 43-character sentence.
   - Assert `consoleErrors === []` in-spec for the run (house standard).
   - ⛔ **Do NOT add it to `e2e/tl-01-run-telemetry.spec.ts`.** Its plain-boot test is a deterministic 100%
     red on both projects; a new alarm buried in a red file is an alarm nobody will hear.

**3. PROVE THE GUARD CAN FAIL — mandatory, and report both outputs verbatim.**
   - Manufacture the exact defect the guard exists to catch: temporarily make the button debug-gated — e.g.
     have `keepTapeOptions()` return `{}` (or drop `onKeepTape`) unless a debug flag is set. **One local edit,
     in `src/game/Game.ts`, deliberately wrong.**
   - Run your new spec. It **must go RED**. Paste the failure line.
   - **Revert the probe and prove the revert is byte-exact**: `git diff -- src/game/Game.ts` must be EMPTY,
     and say so. (Do not leave the probe behind a flag "for future use" — that is new scope.)
   - Re-run the spec. It must go **GREEN**. Paste that too.
   - ⚖️ **If your guard stays GREEN while the button is gated, your guard is wrong — fix the guard, not the
     probe**, and report that you had to.

**4. Report, do not act, on one adjacent observation.** While in `tape-01-run-tape.spec.ts`, note whether its
   `?debug` usage is *load-bearing* (does the tape/replay machinery genuinely need it?) or merely inherited
   boilerplate. **Write the answer in your report. Change nothing there.** If it turns out `?debug` is not
   needed for the tape proof either, that is a follow-up finding for a fire to triage, not a fix for you.

## FIREWALL

**TOUCH-ONLY:**
- `e2e/f1297-2-plain-boot-tape-button.spec.ts` (new — this is the deliverable)
- `src/game/Game.ts` **ONLY** as the temporary scope-3 probe, which **MUST** be reverted byte-exact before you
  commit. The committed diff for this path must be **empty**.

**NO (do not touch, do not "improve", do not green):**
- `e2e/tl-01-run-telemetry.spec.ts` — known deterministic red; not yours, and repairing it is a separate task.
- `e2e/tape-01-run-tape.spec.ts` — the existing test stays exactly as it is. You are **adding** an alarm, not
  relocating one. Editing it to remove `?debug` is out of scope and would put a shipped proof at risk.
- `src/ui/DeathOverlay.ts`, `src/game/RunTape.ts`, `src/mp/LockstepClient.ts`, `src/playbook/PlaybookFormat.ts`
  — the behaviour is already correct; there is nothing to fix.
- `logs/suite-red-inventory.md` — do not re-rate, re-run, or repair the disagreeing tl-01 rows.
- `src/systems/Vfx.ts` and anything float-text — **lane-a is LIVE on F-1316-1 in that file right now.**
- `tasks/**`, `STATUS.md`, `reviews/**` — fire territory.

## SELF-CHECK (name the exact commands and paste real numbers)

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, with the time.
3. Your new spec, **both projects**, `--workers=1` (⚠️ **required, not an optimisation** — at default workers
   the fire shell manufactures drift reds; see `scripts/fire.md` §3.1).
4. Adjacent suites, **derived by your own grep, not from this list**: at minimum everything matching
   `keep-run-tape`, `keepTape`, `DeathOverlay`, and `tape-01`. State the set you derived and how.
5. `npm run test:node-guards` — report the **derived** count. s1316 measured **204**; derive it yourself and
   **say so if it disagrees** rather than reporting mine.
6. Zero console/page errors, desktop **and** 390px mobile.
7. Screenshot of the death overlay on the plain boot, showing the button, to
   `artifacts/f1297-2-plain-boot-tape-button/`.
8. `git status` — no stray files; `git diff -- src/` **empty**.

## REJECT CONDITIONS (pre-declared, so the drain is mechanical)

- ❌ The report shows no manufactured RED for the new guard (scope 3).
- ❌ The new test asserts `__THREE_GAME_DIAGNOSTICS__` / `onKeepTape` instead of the rendered button.
- ❌ The committed diff touches `src/` at all.
- ❌ `?debug` appears anywhere in the new spec's query string.
- ❌ `e2e/tl-01-run-telemetry.spec.ts` or `e2e/tape-01-run-tape.spec.ts` modified.

**READY-FOR-GATES** — report: scope 1's answer with the exact queries tried and the source read for flag
gating · the manufactured RED and the restored GREEN, both verbatim · your derived adjacent set · the derived
node-guards count against 204 · scope 4's read-only answer on tape-01's `?debug`.
