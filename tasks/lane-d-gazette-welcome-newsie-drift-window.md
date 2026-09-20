CODEX: model=gpt-5.6-sol effort=high
# lane-d-gazette-welcome-newsie-drift-window — F-1211-6 CURED AT THE MECHANISM: a state assertion measured through a 50 ms wall-clock window
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled. **FIRE-AUTHORED s1214 (attended review welcome).**

WHY: **F-1211-6 was raised OPEN and OWED as *"`e2e/gazette-welcome.spec.ts:44` is RED ON MAIN — bisect owed"*, and it carried a contradiction nobody could close: s1211 measured it 8/8 RED across four runs and two harnesses, while the lane-d runner measured the same suite 8/8 GREEN ~90 minutes earlier with nothing merged in between.** s1214 discriminated it. **Both measurements are true, and there is nothing to bisect** — full evidence and raw arms in `logs/session-scratch/s1214-f1211-6/measurements.md`.

MEASURED s1214, ONE VARIABLE, ONE TREE (`main` src/e2e identical to `8b13f34b`), **one external vite on scratch port 5261 reused by all four arms** so the server cannot be the variable:

| arm | workers | projects | loadavg start → end | result |
|---|---:|---|---|---|
| quiet | 1 | desktop | 2.58 | **12/12 PASS** |
| CPU-loaded (11 burners) | 1 | desktop | **8.26 → 20.72** | **12/12 PASS** |
| still-loaded | 1 | mobile | 15.25 → 7.72 | **12/12 PASS** |
| **concurrent** | **4** | desktop + mobile | 3.00 → 15.81 | 🔴 **4 failed / 12 passed** — every execution of `:44`, both projects |

➡️ **`loadavg` is NOT the variable** — arm 2 passed everything at a *higher* peak load (20.72) than the arm that failed everything (15.81). **The number of browsers sharing the box is.** The failure values reproduce s1211's `4.87` exactly in kind: **`4.996038430596785`** and **`2.332059175921571`** at the same line.

THE MECHANISM, from the spec's own text (`e2e/gazette-welcome.spec.ts:81-87`) — **verify it, do not take it from me**: on the last beat the test reads the newsie's position, clicks `town-welcome-next` (**the click that ENDS the welcome**), waits **50 ms of wall clock**, re-reads, and asserts the newsie moved < 1 unit. It is asserting a **state** property — *the newsie does not wander during the welcome* — through a **timing** window, and it samples that window **across the boundary the welcome closes on**. One browser: a handful of frames elapse, the newsie has not resumed its wander, < 1. Four browsers: the same 50 ms covers many more simulated frames, the wander resumes, 2.3–5.0. **Nothing in `src/` is broken** — 36/36 of these executions pass whenever the window is not stretched.

WHY IT MATTERS BEYOND ONE LINE: **`npm test` uses Playwright's default worker count (~half of 16 cores), so the canonical full-suite run reproduces this and every single-spec drain gate (`--workers=1`) cannot.** Same blind-spot class as F-1213-1 and the s1210 release-config lesson: a green gate that structurally cannot see the failure.

READ-FIRST (all of them, before you change a line):
- `logs/session-scratch/s1214-f1211-6/measurements.md` — the four arms, the mechanism, and what it closes.
- `e2e/gazette-welcome.spec.ts` — the whole file, especially `:44` and the beat loop at `:75-88`.
- `src/town/TownWelcome.ts` — the phase machine, and **what it actually does to actor movement while active** (this is the file that says whether the newsie is *meant* to be frozen and when it is released).
- `src/town/townsfolk.ts` — the wander/idle loop the newsie resumes into.
- `specs/greenhorn-gazette/README.md` §THE WELCOME — the owner law the assertion is trying to protect.
- `tasks/BACKLOG.md` F-1211-6 (the original finding) and `reviews/gg-01b-gazette-welcome.md`.

PRE-FLIGHT (LANE-SAFETY, safe-dupe proved BY CONTENT by the authoring fire — **re-verify before you reset, never trust this paragraph**):
`lane/perf` is **1 ahead of main** at `3b340bbd` (GG-01b welcome-release-gate) and that commit's content is **already on main** as `feb0a3d7`. The probe s1214 ran, which you must re-run: `git diff main 3b340bbd -- e2e/release-build.spec.ts e2e/gazette-welcome.spec.ts src/town/TownWelcome.ts` is **EMPTY**. The rejected GG-03 panel swap is pinned separately (`git rev-parse --verify archive/lane-perf-gg03-06eeac68` → `06eeac68`). If either probe disagrees, or any dirty tracked blob is unreachable in git, **STOP and report — do not reset.**

SCOPE — **the diagnosis is done; the judgement is not. You are allowed to conclude the test is wrong, the product is wrong, or that this is an owner call.**

1. **MEASURE-FIRST STOP GATE — reproduce BOTH arms, and gate on the MECHANISM, not on a red.** On your base, same spec, same server, run the two commands that differ only in concurrency:
   - `npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --workers=1 --repeat-each=3 --reporter=line` → expect **12/12 pass**
   - `npx playwright test e2e/gazette-welcome.spec.ts --workers=4 --repeat-each=2 --reporter=line` → expect **`:44` failing on both projects** with a `Received:` value **> 1**
   Record `uptime` beside each. **If the workers=4 arm passes, write `PREMISE-NOT-REPRODUCED` with both raw counts and your loads and STOP** — do not cure what you cannot see. **A single quiet green is not a STOP; the STOP is the *concurrent* arm coming back clean.** (s1214's shell gate rejects an env-prefixed command line; spawn through `node -e` with `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` if you use an external server, or just let playwright boot its own — but then say which you did.)

2. **ANSWER THE PRODUCT QUESTION FIRST (Mistake #10), from `src/`, not from the test:** while the welcome is active, is the newsie *supposed* to be frozen — and **is it released the moment `town-welcome-next` closes the last beat, or some frames later?** Name the lines. This decides which cure below is honest. If the answer is "the newsie is never frozen at all and the assertion has always been an accident of timing", say so plainly — that is a legitimate finding, not a failure.

3. **THEN choose ONE and justify it from §2:**
   - **(a) ASSERT THE STATE, NOT THE WINDOW** *(expected)* — sample the pair **while the welcome is still active** (before the final `town-welcome-next`, or across a beat that does not end it), so the assertion proves what it is named for and no wall-clock width can change the answer. The test must still fail if the newsie wanders during the welcome — prove that in §4.
   - **(b) PRODUCT FIX** — if §2 shows the newsie is meant to stay put through the dissolve and does not, the minimal cure belongs in `src/town/`.
   - **(c) STOP AND REPORT** — if the honest answer is a design fork ("should the newsie resume instantly when the welcome ends?"), write both options with evidence and stop. An owner ruling is cheaper than a wrong cure.

4. **MUTATION PROOF (load-bearing — a guard only ever seen passing is not a guard).** Whatever you land, show the *new* assertion still catches the thing it is named for: make the newsie wander during the welcome (a temporary local mutation in `src/town/`, reverted before you commit) and show the test goes **RED**; restore, show **GREEN**. A cure that cannot go red has deleted the guard, which is the forbidden outcome here.

5. **RE-RUN AT CONCURRENCY, WHICH IS THE ONLY RUN THAT COUNTS.** `npx playwright test e2e/gazette-welcome.spec.ts --workers=4 --repeat-each=2` → all 16 green, both projects, with `uptime`. Then the same at `--workers=1` (regression check). **Report both counts. A `--workers=1` green alone is not evidence for this task and will be rejected at the gate.**

TOUCH-ONLY: `e2e/gazette-welcome.spec.ts` · `src/town/TownWelcome.ts` and `src/town/townsfolk.ts` **only under 3(b), only the minimal hunk** · new screenshots under `artifacts/gazette-welcome-newsie-drift/`.
NO: **widening the `< 1` bound, `expect.poll`/retries/`test.retry` around it, or deleting the assertion — each of those is a well-formed lie and an automatic REJECT** · `playwright.config.ts` (do NOT pin workers to make a suite behave — F-1204-3 precedent) · `logs/suite-red-inventory.md` (**this red must be CURED or RULED ON, not absorbed**) · `e2e/release-build.spec.ts` · `src/news/**` · Gazette panel content · Balance · contracts · `assets/raw/**` · `src/agent/**` (a sibling lane owns `ToolSurface.ts` this window).

SELF-CHECK: `npx tsc --noEmit` 0 · `npm run build` green · `npm run test:node-guards` **run FIRST and reported** (61/61 expected — this is the instrument that caught F-1213-1) · §5's two counts with load averages · adjacent `town-t1-square` + `town-t5-townsfolk` fingerprinted against `logs/suite-red-inventory.md` rather than waved through · zero console/page errors · screenshots desktop + 390px if anything visual moved.

READY-FOR-GATES + report: §1's two arms with raw counts and loads · §2's product answer **with line numbers** · which of 3(a)/(b)/(c) and why, from evidence · §4's mutation pair (red then green) · §5's concurrent AND serial counts.
