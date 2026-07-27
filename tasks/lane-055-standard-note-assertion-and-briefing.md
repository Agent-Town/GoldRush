# Task lane-055-standard-note-assertion-and-briefing: close the proven unsoundness at 055:150 and remove the briefing confounder (LANE-A, commit prefix "test:")

**FIRE-AUTHORED s1122 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/lane-055-baron-standard-note-diagnosis.md` (the merged diagnosis this task implements — read its `## Recommend only` section AND the `## s1122 drain addendum`, which narrows what you may claim); `e2e/055-baron-kill-stop.spec.ts`; `src/ui/WorldInfoNotes.ts`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (merged diagnosis `987e5f4d`, 2026-07-27, plus source facts re-verified at that drain)

The diagnosis for `055-baron-kill-stop.spec.ts:121` landed on main at `987e5f4d`. Two of its results are now evidence:

1. **The assertion at `:150` is unsound in the GREEN direction — proven at source, independent of any flake theory.** `WorldInfoNotePrompt.update(null)` (`src/ui/WorldInfoNotes.ts:182-188`) sets `root.hidden = true` and **returns without clearing `title.textContent`**, which is written only at `:199`. Playwright's `toHaveText` does not require visibility. So a run in which the note showed earlier and then vanished **passes anyway** — `:150` does not prove the thing its own test name claims ("then the note persists"). Every historical green on that line is unproven.
2. **The `contract-briefing` clause is a real, measured blocker of world-info notes.** `Game.ts:5664` blocks on `[data-testid="contract-briefing"]:not([hidden])` and passes `null` at `:5665`. The briefing runs an 8,000 ms timer (`src/ui/Hud.ts:349`) that **the test itself restarts**: `resetRun()` (`Game.ts:5864`, exposed at `:1751`) calls `showContractBriefing()` at `:6007`, and the spec calls `resetRun()` at `055-baron-kill-stop.spec.ts:60`. In the diagnosis's five instrumented controls the briefing was still blocking for the first **2,115–3,074 ms** of the `:150` poll window in *every* run.

**What is NOT established, and you must not claim it (F-1122-1, in the drain addendum):** that the briefing is the cause of the *historical red*. Anchored at `resetRun`, the controls imply a pre-teleport phase of 4,926–5,885 ms; a whole-window red needs that phase under 3,000 ms — roughly 2–3 s *faster* than every control, in `w1`'s *slowest* run (21.6 s). It is unproven, not disproven. **Therefore this task's acceptance is NOT "the flake is gone".** It is: land the proven correctness fix, and prove *directly* that the briefing confounder can no longer fire.

## Scope

1. **Close the unsound assertion at `e2e/055-baron-kill-stop.spec.ts:150`.** Before (or as part of) the title check, require the note **root** to be visible and to carry the right object class — e.g. assert `page.getByTestId('world-info-note')` `toBeVisible()` and its `data-object-class` to equal `baron_standard`, then keep the existing title assertion. **Visibility is the load-bearing half**: `update(null)` never clears `data-object-class` either (`WorldInfoNotes.ts:196` writes it only on a real note), so the attribute alone is just as stale-prone as the title. Both together, with visibility, close the false-green branch.
2. **Do NOT add a visibility requirement to the body assertion at `:151`.** `WorldInfoNotes.ts:197-203` hides the body in *compact* mode (`visibleFull = seenCount(objectClass) < 2`, persisted via `ProfileStorage`). Requiring the body visible would introduce a **new** flake the moment the profile has seen the standard twice. Leave `:151` as a `toContainText`. If you believe this analysis is wrong, STOP and report rather than changing `:151`.
3. **Remove the briefing confounder in the helper.** In `prepareManualBaronKill` (`:56-58`), after `openGame()`, dismiss the briefing when present (`data-testid="contract-briefing-dismiss"`, `src/ui/Hud.ts:327`) and await the `contract-briefing` root becoming hidden. **Note the ordering trap:** `resetRun()` at `:60` re-shows the briefing and restarts the 8,000 ms timer, so a dismissal placed *only* before `:60` accomplishes nothing. Place it so the briefing is hidden **after** the last `resetRun()`, or dismiss again after it. Do NOT change the production briefing timer, the 8,000 ms value, or the 5,000 ms poll budget at `:150`.
4. **Prove scope 3 directly, not by counting greens.** Add an assertion (or a measured probe recorded in your report) establishing that at the moment the `:150` poll begins, `document.querySelector('[data-testid="contract-briefing"]:not([hidden])')` is `null` — i.e. the clause at `Game.ts:5664` can no longer fire in this test. This direct proof is the deliverable; a green run is not.
5. **Report supporting repeat-run evidence, honestly bounded.** Run the modified `055-baron-kill-stop.spec.ts` **10 times** on desktop Chrome and report the red count. State plainly in your report that the historical red was **1 occurrence in 43**, so a 10-run green is **underpowered to prove closure** and must not be described as closing F-1101-1.
6. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/055-baron-kill-stop.spec.ts`; a new review file `reviews/lane-055-standard-note-assertion-and-briefing.md`.

NO changes to: any `src/` file (all four cited source facts are premises, not targets — if a fix seems to require a `src/` change, STOP and report); `src/ui/Hud.ts`'s 8,000 ms timer; `src/game/Game.ts:5657-5665`; the 5,000 ms poll budget at `:150`; the body assertion at `:151` (scope 2); any *other* e2e spec — in particular `e2e/world-info-notes.spec.ts` and `e2e/polish-03-mobile-hud.spec.ts`, which also exercise `world-info-note` and must remain byte-identical; sim semantics; other tasks' fresh work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/055-baron-kill-stop.spec.ts` green **desktop AND 390 px mobile**.
- Adjacent suites unmodified-green, both projects, named: `e2e/world-info-notes.spec.ts`, `e2e/polish-03-mobile-hud.spec.ts`.
- Zero console/page errors (the spec's own `assertNoErrors` at `:153` already enforces this — keep it).
- Confirm the firewall mechanically: `git diff --name-only main...HEAD` must list **zero `src/` files** and **no e2e file other than `055-baron-kill-stop.spec.ts`**. Paste the output.
- Screenshots: the spec's existing `artifacts/055/` outputs (`desktop-chrome-planted-standard-note.png`, `desktop-chrome-mid-freeze-card.png`) regenerate; note if they change.
- Write `reviews/lane-055-standard-note-assertion-and-briefing.md` with the scope-4 direct proof, the scope-5 red count out of 10, and an explicit statement of what remains unproven.

End: **READY-FOR-GATES** + report (a) the exact assertion text you landed at `:150`, (b) where you placed the dismissal relative to `resetRun()` at `:60` and why, (c) the scope-4 proof that the briefing clause can no longer fire, (d) the 10-run red count with the underpowered caveat stated, (e) anything you found that contradicts this task's premises.
