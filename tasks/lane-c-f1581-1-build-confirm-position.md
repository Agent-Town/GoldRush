# Task f1581-1: make a build confirm carry the position it was issued at (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1581, 2026-08-09.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `artifacts/f1580-1-batch-red/FINDINGS.md` (the measurement and the root cause,
with every file:line below already verified against main); the F-1581-1 row at the top of
`tasks/BACKLOG.md`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1581-1, s1581 2026-08-09 — measured, then read in the code)

`e2e/m2-01-build-menu.spec.ts:178` ("palisade footprint rejects overlap while allowing edge-touch
chaining") fails **2/10 on `mobile-chrome`, 0/10 on `desktop-chrome`**, on a clean tree at
`--workers=1` with no batch and no load. Durations are bimodal — passing 2.7–2.8 s, failing
18.7–18.9 s, never between. All three captured failures show the identical page state: **Gold = 30**,
i.e. **two palisades were purchased** where the test pressed the build key for only one.

The root cause was then **read in the code, not inferred** — every step is present on main:

1. `src/core/InputController.ts:102` (`onKeyDown`) adds the code to **both** `keys` and `tapped`.
2. `src/core/InputController.ts:107` (`onKeyUp`) removes it from **`keys` only** — `tapped` retains it.
3. `src/core/InputController.ts:246` clears `tapped` **only at the end of `readIntents()`**, which
   `src/game/Game.ts:2394` calls **once per frame**.
4. So a press whose down and up both land inside one frame gap is retained and delivered on the
   **next** frame. ⚠️ **This retention is DELIBERATE AND CORRECT — it is what stops fast taps being
   dropped. It is NOT the bug and you must NOT remove it.**
5. `src/systems/BuildSystem.ts:993` (`confirm(at, position?)`) called **without** an explicit position
   calls `updateGhostPosition()` and re-computes `this.valid = this.computeValid()` — **the intent
   carries no position and is re-resolved against wherever the ghost is when it executes.**
6. `src/systems/BuildSystem.ts:1585-1590` pins the ghost 2 m north of the hero in the keyboard path,
   so moving the hero moves the ghost.

**The defect in one sentence: a confirm rejected at position A is not discarded but re-evaluated at
position B one frame later, and succeeds there.** In the failing test the press is made at hero
`(0,12)`/ghost `(0,10)` — invalid, overlapping the palisade at `(0,9)` — then the next test step
teleports the hero to `(0,14)` before the next frame, putting the ghost at `(0,12)` where it **is**
valid; the retained press builds there (gold 40→30), and the following `ghostValid` poll at `(0,12)`
is then false forever because it overlaps the structure that press just built.

⚖️ **Scope honesty, so you do not over-sell the fix in your report:** the deferral window is a single
frame (~16 ms). This is a real input-correctness defect, but it is **NOT** demonstrated to be a
gold-loss bug in ordinary play — it needs a *discontinuous* hero move (teleport, knockback, respawn,
scripted snap) inside that one frame. Do not claim player-facing gold loss unless you measure it.

## Scope

1. **Make the confirm intent position-bound.** A build confirm must execute against the ghost state it
   was issued at, not the state it happens to find one frame later. Two admissible cures — pick ONE
   and justify it in your report:
   (a) the intent carries the ghost position (and rotation) captured when the press was recorded, and
   `confirm()` uses that rather than re-resolving; or
   (b) a confirm whose ghost was invalid at issue time is discarded rather than re-resolved.
   ⚠️ **`tapped` retention in `InputController` must remain intact** — do not fix this by dropping
   fast taps, and do not clear `tapped` on keyup. If your chosen cure requires an `InputController`
   change, it must preserve the property that a down+up inside one frame gap still produces exactly
   one intent.
2. **Preserve every existing placement behaviour.** Pointer/click placement
   (`BuildSystem.onCanvasClick`, which already passes an explicit position) and `confirmPlacement`
   (which saves/restores ghost state in a `finally`) must be unchanged in behaviour. Multiplayer and
   replay paths (`intentsFromLockstepInput`, `lockstepInputFromIntents` in `src/game/Game.ts`) must
   still round-trip the confirm intent; if your cure widens the intent shape, update those call sites
   and say so.
3. **Add a regression assertion to the EXISTING spec** `e2e/m2-01-build-menu.spec.ts` (do NOT create a
   new spec file — `playwright.config.ts:46` sets `testDir: './e2e'` with `testMatch: undefined`, so
   any new `e2e/*.spec.ts` is auto-collected into the standing suites and adds permanent cost). The
   assertion must fail on today's main and pass after your fix: press confirm at a position where the
   ghost is invalid, move the hero discontinuously via `__GR_TEST__.teleport` so the ghost becomes
   valid, and assert that **no buildable was placed and no gold was spent** without a fresh press.
4. **Report the mobile-only question as measured or explicitly unmeasured.** F-1581-1 records
   ~20% on mobile and 0/10 on desktop but does NOT explain why. If your cure makes the distinction
   moot, say so; if you measure frame-gap length and it explains the asymmetry, report the numbers.
   Do not assert a cause you did not measure.

## Firewall

Touch ONLY: `src/systems/BuildSystem.ts`, `src/core/InputController.ts`, `src/game/Game.ts` (ONLY the
intent plumbing named in scope 2 — nothing else in this file), `src/vite-env.d.ts` (only if the
diagnostics shape changes), `e2e/m2-01-build-menu.spec.ts`.

🔓 **FIREWALL LIFT:** if scope 2 shows the confirm intent is also consumed somewhere not listed above,
you MAY edit that call site — but only the confirm-intent plumbing, and you must name the file and the
reason in your report.

NO changes to: sim semantics, damage/economy resolution beyond the single build-spend path already
described · `src/systems/BuildPlacement.ts` placement RULES (the geometry is correct; the bug is
*when* the rules are evaluated) · any other `e2e/**` spec's existing assertions · `tasks/**`,
`specs/**`, `reviews/**`, `CLAUDE.md`, `scripts/fire.md` · `package.json` · any lane's work but this one.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0; `npm run build` green.
- **The acceptance measurement, which is the whole point of this task:**
  `npx playwright test e2e/m2-01-build-menu.spec.ts:178 --project=mobile-chrome --workers=1 --repeat-each=20`
  → **20/20 green**, and the same command with `--project=desktop-chrome` → **10/10 green**.
  Report both as counts, not as "passes".
- Your new regression assertion: show it **RED on unfixed code** (stash the fix or run it against
  `main`) and **GREEN after** — a regression test never demonstrated failing is not evidence.
- Full `e2e/m2-01-build-menu.spec.ts` green both projects; adjacent suites unmodified-green both
  projects: `e2e/m1-01-claim-jumpers-death.spec.ts`, `e2e/m4-06-embodiment.spec.ts`,
  `e2e/task-025-bandits-dont-swim.spec.ts`.
- Because this diff touches `src/systems/` and `src/core/`: `npm run test:node-guards` (run it ALONE
  — it is ~181 s and contends with other batteries). Any red is a FINDING, never a re-pin (F-1441-3).
- Zero console/page errors in the specs above, desktop and 390 px.
- All playwright commands pass `--workers=1` (§3.1 — a red seen at default workers is not evidence).

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent
no-op wastes a queue slot and a gate (Mistake #1).

End: **READY-FOR-GATES** + report: which cure (a) or (b) you chose and why · the 20/20 and 10/10 counts
· the regression assertion's red-before/green-after evidence · whether `Game.ts` intent plumbing needed
changing · anything you found about the mobile/desktop asymmetry, marked measured or unmeasured.
