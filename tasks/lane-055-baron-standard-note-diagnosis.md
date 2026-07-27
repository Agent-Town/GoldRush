# Task lane-055-baron-standard-note-diagnosis: name why the Baron's-Standard world-info note is EMPTY in the failing run of `055-baron-kill-stop.spec.ts:121` (lane-a, commit prefix "diag:")

**FIRE-AUTHORED s1121 (attended review welcome). DIAGNOSIS ONLY — the expected final diff is a single new measurements file and NOTHING else.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/calib-suite-workers.md` §"F-1107-2" (the finding that owes this task); `logs/suite-runs/calib-w1.log` lines 54–90 (the raw failure, with its call log — this is your ground truth, not a summary of it); `e2e/055-baron-kill-stop.spec.ts` lines 121–155; `src/ui/WorldInfoNotes.ts` lines 110–120 and 160–205; `src/game/Game.ts` lines 5657–5706 (`syncWorldInfoNotePrompt` + `nearestWorldInfoTarget`), 4319–4330 (the `baronStandard` diagnostics block), 4815–4835 (plant), 5864 + 5960–5970 (`resetRun`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1121 pre-measured this for you and you must still re-verify it yourself: `lane/m3` was 1 ahead at `c6d520d6`, whose two files are blob-identical to main — `reviews/queue-guard-ancestry-union.md` = `f2496894`, `scripts/drain-block-check.mjs` = `e7a56cd4` — a SAFE DUPE, so the reset is loss-free. The worktree was CLEAN, 0 dirt lines. main was `071434d4`.)*

## Why (F-1107-2, drained `9614b7eb` on 2026-07-27; plus source facts re-verified by s1121)

`055-baron-kill-stop.spec.ts:121` is the **single largest flake on the board**, and it is currently distorting factory-wide instrumentation. In the s1107 worker calibration it was **w1's lone red at 21.6 s — w1's largest duration — and green at 11.8 s in the w1 repeat**. Because p95 nearest-rank at n=43 reads the 3rd-largest value, greening that one test alone walked p95 from 17.9 s to 14.7 s, a 17.88% "drift" against a 15% ceiling, which **voided the entire worker calibration**. F-1101-1 (the whole-suite gate is unpinned and poisons itself) stays open until this test is understood. **40 of 43 tests reproduced within ±0.5 s across those two controls — the box was fine. This test is the variable.**

F-1107-2 already closed one wrong avenue and you must not re-open it:

- **CLOSED — the rf-37 class.** The test uses `expect.poll` throughout and never holds-then-releases a key before polling for an arrival, so the `lane-approach-steer-to-arrival` cure does not apply and **it must not be added to rf-37's 9-site list.**
- **CLOSED — "unstable box" / load.** It failed under **w1, the quietest condition in the whole sequence**, and passed at w2, w4 and the w1 repeat. Its reds are load-*in*dependent on the evidence.

F-1107-2 guessed the mechanism was "its fixed 8s/5s poll budgets around the ceremony transition." ⚠️ **s1121 read the raw log and that guess does not survive it.** The actual failure is at **`:150:59`**, and the call log is far more specific than a timeout:

```
Error: expect(locator).toHaveText(expected) failed
Locator:  getByTestId('world-info-note-title')
Expected: "The Baron's Standard"
Received: ""
Timeout:  5000ms
  14 × locator resolved to <strong class="world-info-note__title" data-testid="world-info-note-title"></strong>
     - unexpected value ""
```

**The element exists and resolves 14 times across the full 5 s, and is empty every time.** That is not a mount race and not a near-miss on a budget — it is a *persistent* empty across the whole window.

**✓ VERIFIED AT SOURCE by s1121, and this is the fact that reframes the task.** `WorldInfoNotes.update(null)` (`WorldInfoNotes.ts:182-188`) sets `this.root.hidden = true` and **returns without ever clearing `this.title.textContent`.** The title is only ever *written* at `:199`, when a real note shows. `this.title` starts life empty (`:160`). Therefore:

1. **`Received: ""` proves the note was NEVER ONCE SHOWN — for any object class — at any point in that entire run.** The question is not "why did the standard's note flicker off"; it is "why did no world-info note ever appear."
2. **Symmetrically, the assertion is UNSOUND IN THE GREEN DIRECTION.** Because stale text survives `update(null)`, and `toHaveText` does not require visibility, a run in which the note showed *earlier and then went away* **passes anyway**. `:150` does not prove what its test name claims ("the note persists"). Treat every historical green on this line as unproven. **Do not fix this — see Firewall — but you must quantify it in scope 4.**

## Scope

**1. MANDATORY MEASUREMENT — this gates everything below.** Reproduce the `:145-151` window and sample every **0.2 s of wall time across the full 5 s** that `:150` polls, plus the 2 s before the teleport. At each sample record:

- the six `blocked` clauses **individually** (`Game.ts:5658-5664`): `state.current` · `state.isPaused` · `buildMenuOpen` · `buildSystem.isBuildMode` · whether `[data-testid="assay-bench"]:not([hidden])` matches · whether `[data-testid="contract-briefing"]:not([hidden])` matches
- `baronStandardPlanted` · `baronStandardPosition (x,z)` · `baronStandardGroup.visible`
- `localActor.group.position (x,z)` and its **distance to `baronStandardPosition`** (the `:5693` radius is **2.5**)
- the **full candidate array** built by `nearestWorldInfoTarget` — every `{objectClass, √distanceSq, priority}` that passed its radius test — and the **winner** returned at `:5705`
- `worldInfoNotePrompt` root `hidden` and `title.textContent`

**The first sample at which the candidate list stops containing `baron_standard`, or `blocked` goes true, names the culprit.**

**2. State which of (A)–(E) below fires**, per run, with the sample index at which it first fires.

**3. Run ≥5 times at `--workers=1`.** This is an intermittent failure with a known green rate above 50% — s1107 saw 1 red in 2 controls, and a single observation cannot distinguish a stable branch from a varying one. **Report per-run, not averaged, and report how many of the 5 reproduced the red.** If you get 5 greens, that is a real and reportable result — say so plainly and report what the instrumentation showed in the greens (especially whether the note was ever shown at all, per the scope-4 question).

**4. Quantify the unsound-green problem.** In the runs that PASS, record whether `world-info-note` root was `hidden === true` at the moment `:150` was satisfied. If it ever passes while hidden, the green is stale-text and you must say so with the sample. This is a distinct deliverable from (A)–(E) and is **not optional.**

**5. Recommend, do NOT implement.** End with the one-paragraph change you would make and the exact file:line it belongs at — separately for (a) the mechanism you found and (b) the unsound assertion at `:150`. **Landing either is a separate, owner-visible task.**

### The five candidates (measure — do not confirm)

- **(A) `blocked` is true for the whole window** (`Game.ts:5658-5664`). The test clicks `stay-for-rush` at `:147` and then teleports and asserts with **no wait for `state.current === 'playing'`** in between. Note the clause list does **not** include `claim-secured`, so the secure overlay itself does not suppress the note — but `state.current !== 'playing'` would. Report which clause, not just that it was blocked.
- **(B) 🔎 NAMED CANDIDATE — the hero DIES during the 5 s rush. EXPLICITLY UNPROVEN; s1121 names it so you MEASURE it.** `stay-for-rush` resumes live combat, and `:149` teleports the hero next to the standard where it stands still and undefended for 5 s. Death ⇒ `state.current === 'dead'` ⇒ `blocked` ⇒ persistent empty for the remainder of the window, which matches the observed 14×-empty exactly. It would also be **RNG-driven, hence load-independent** — matching the closed-load finding. ⚠️ UNPROVEN because s1121 did not measure enemy proximity or hero HP at all. If `state.current` is `'playing'` at every sample, **(B) is dead** — report it either way. Record hero `hp` and `enemiesAlive` in scope 1 so this is decidable.
- **(C) `baronStandardPlanted` is false at `:5693`, so the candidate is never added.** It is set true at `Game.ts:4820` and reset to false at `:5967`, inside **`resetRun()` (`:5864`)** — which also does `primaryActor.resetRun(this.heroStart)`, i.e. it would **teleport the hero away from the standard** and set `baronStandardGroup.visible = false`. ⚠️ s1121 has **partially pre-disproved** this and you should still check it cheaply: `stay-for-rush` routes to `onSecureChoice('rush')`/`stayForRush()` (`RunManager.ts:395-397`) and **does not call `Game.resetRun()`**, so this needs a *second* trigger — death-then-restart is the obvious one, which makes (C) a downstream consequence of (B) rather than an independent cause. Distinguish them by timestamp.
- **(D) The teleport did not put the hero inside the 2.5 radius.** `:149` teleports to `standard.x + 0.6, standard.z` with `?? 0` fallbacks. ⚠️ **s1121 has already DISPROVED the position-mismatch half of this**: diagnostics `baronStandard.x/.z` (`Game.ts:4326-4327`) read **the very same `baronStandardPosition`** that `:5693` uses, so the coordinates cannot disagree. What survives is (i) the `?? 0` fallback silently sending the hero to `(0.6, 0)` if the diagnostics object is undefined, and (ii) the sim moving the hero off the spot afterwards. Report the measured distance; that settles both.
- **(E) A nearer candidate won the sort.** `:5704` sorts **distance-first, priority only as tiebreaker**, so `baron_standard`'s `priority 4` — the highest in the function — does **not** protect it; the wandering `prospector` (radius 1.8) or a building (2.35) centred within 0.6 units would beat it. ⚠️ **Largely pre-disproved for the observed red**: a different winner would write a **non-empty** title at `:199`, and the log shows `""`. It stays on the list because it is a real latent ordering hazard and because scope 4 may surface it in the *green* runs. If you see it, report it as a finding — do not chase it as the cause of this red.

**(F) None of the above is a fully acceptable answer**, provided scope 1's table shows it: `blocked` false, `baron_standard` present in the candidate list and winning, and the title still empty ⇒ the loss is inside `WorldInfoNotes.update`/`noteByClass` and you should say so.

## Firewall

Touch ONLY: a new `reviews/lane-055-baron-standard-note-diagnosis.md` (your measurements + verdict), and optionally raw logs under `artifacts/055-standard-note/`.

NO changes to: **any `src/` file in the final tree** · **any pre-existing `e2e/` file** · `e2e/055-baron-kill-stop.spec.ts:150` or `:151` — **rewriting, re-anchoring, or "fixing" either is forbidden**, that is writing the guard from the answer sheet, and the unsoundness you are asked to quantify in scope 4 is precisely the thing an eager rewrite would erase before anyone measured it · the `teleport` call at `:149` or its `+ 0.6` offset · `test.setTimeout(45_000)` or any poll budget in the file (the budget hypothesis is DEAD — the failure is a persistent empty, not a near-miss) · `WorldInfoNotes.ts` note text or radii · `nearestWorldInfoTarget`'s sort · other tasks' fresh work.

**Temporary instrumentation IS allowed** — a scratch probe spec and/or temporary logging inside `src/` — **but it MUST be reverted before you finish.** The acceptance test is mechanical: **`git diff --name-only main...HEAD` must list ZERO `src/` files and ZERO pre-existing `e2e/` files.** Delete scratch specs; restore touched `src/` files to byte-identity. Paste the command's output verbatim into your report.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean · `npm run build` green (say so plainly if it is vacuous for a docs-only final diff) · `npx playwright test e2e/055-baron-kill-stop.spec.ts --project=desktop-chrome --workers=1 --repeat-each=5` run and reported **per-run with the red count** · the two-dot diff check above pasted verbatim · measurements file written to the exact path in the Firewall.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**"I could not reproduce the red in 5 runs" is a SUCCESS if scope 1 and scope 4 are still answered. A confident guess is a FAILURE.** F-1107-2's own named mechanism (poll budgets) was killed by simply reading the raw log — do not protect (B) any better than that.

End: READY-FOR-GATES + which of (A)–(F) fires, the per-sample table from scope 1, the red count from scope 3, the stale-green answer from scope 4, and the two recommend-only paragraphs from scope 5.
