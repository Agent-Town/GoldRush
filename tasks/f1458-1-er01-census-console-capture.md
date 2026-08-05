CODEX: model=gpt-5.6-sol effort=medium

# f1458-1-er01-census-console-capture — make the ER-01 census spec green on the PINNED interpreter

**FIRE-AUTHORED s1458 (attended review welcome).**

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). Commit prefix `er01:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT: `git branch --show-current` = `lane/b`. ⚠️ **THIS LANE DELIBERATELY HOLDS UNMERGED WORK — DO NOT RESET IT.** `lane/b` sits ahead of main at `ecee66cd` (the ER-01 census, refused by the s1458 drain for the defect this task cures). **Do NOT run `git checkout -B lane/b origin/main`** — that would destroy the very slice you are fixing (CLAUDE.md Mistake #2). Verify instead: `git log --oneline -1` must print `ecee66cd er01: census Steamworks headless readiness`. If it does not, STOP and report. Any dirty tracked blob → STOP and report.

## WHY (evidence, quoted)
`reviews/er01-e2-census.md` §F-1458-1, measured s1458 on the merged tree in a detached gate worktree:

> `e2e/er01-e2-census.spec.ts:32-33` hooks `console.error`/`console.warn` into a `consoleErrors` array, then asserts `expect(consoleErrors).toEqual([])` at `:44` and `:74`. **Node's default `'warning'` handler prints through `console.error`**, so a process-level warning lands in that array and reds the assertion.

Measured, same tree, `--workers=1`, plain house command: **8 failed / 8**. With `NODE_OPTIONS=--no-warnings`: **8 passed (47.1s)**. So every substantive assertion the slice makes already holds — only the console channel is wrong.

The warning is `ExperimentalWarning: localStorage is not available because --localstorage-file was not provided`, emitted by Node ≥ 26 on first read of `globalThis.localStorage`. `.nvmrc` pins **26.4.0**; the Codex runner executes **23.11.1**, which does not emit it (F-1458-2). **That is why your shell will show this spec GREEN before you change anything — believe the review, not your shell.**

## READ-FIRST
1. `reviews/er01-e2-census.md` §F-1458-1 — the diagnosis, the failed cure, and the measured one.
2. `artifacts/f1458-1/er01-console-capture-cure.patch` — a cure measured **8/8 green under the plain house command on Node 26.4.0**. Lane blob `0867a696` → cured blob `06fd7284`.
3. `e2e/er01-e2-census.spec.ts` — the subject; note it already stubs `location`/`window` and restores them in `finally`.
4. `scripts/gr-sim.test.mjs` — the house `previousStorage` stub pattern. ⚠️ **It does NOT solve this case** — see scope 1.

## SCOPE
1. **Do not re-derive the dead end.** Stubbing `globalThis.localStorage` before the access was measured s1458 and left the spec **still 8/8 red**: the triggering read happens inside the vite-SSR module graph, before the test body runs. Do not spend a cycle there.
2. **Choose between two cures and JUSTIFY the choice in your report** — this is the real work of this task, and it is deliberately not pre-decided:
   - **(a)** Own the warning channel: save `process.listeners('warning')`, `removeAllListeners('warning')`, install a no-op, restore in `finally`. This is the patch in READ-FIRST 2. **Cost: suppresses ALL process warnings**, so a genuine deprecation from app code would no longer red this spec.
   - **(b)** Filter narrowly: keep the console hook, but drop only strings matching Node's localStorage ExperimentalWarning before pushing to `consoleErrors`. **Cost: pins the assertion to one warning's exact text**, which future Node versions may reword.
   Pick one, state the trade you accepted, and say plainly what your choice stops catching.
3. The zero-console assertion must still **fail** on genuine app-side `console.error`/`console.warn`. **Prove it by planting one** — add a temporary `console.error('planted')` inside the test, show the spec goes RED, remove it, show GREEN. A cure that cannot demonstrate its own violation path has certified nothing (the s1299/s1300 standard). Report both outcomes.
4. Leave every other assertion in the spec **byte-identical**. The admissions, determinism pairs, grammar forms, `engineDependencies` check and rejection-throws were all gated green by s1458 and are not in scope.

## TOUCH-ONLY
`e2e/er01-e2-census.spec.ts`.

## NO
`src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` · `docs/bench/e2-readiness-census.md` (the census verdicts are s1458-gated and stand) · the three F-ER01 finding stubs — **do not "fix" the DATA-GAPs**, they are the attended session's to author · `.nvmrc`, `package.json`, `playwright.config.ts` — **the runner/pin split is F-1458-2 and is an OWNER question; do not "solve" it here** · any other spec file.

## SELF-CHECK
`npx tsc --noEmit` clean · `npx playwright test e2e/er01-e2-census.spec.ts --workers=1` **8/8 both projects** · the scope-3 planted-violation demonstration, both directions, quoted in your report · `git diff --stat` shows **exactly one file changed**.

⚠️ Your shell (Node 23.11.1) cannot reproduce the original red. Report your `node --version` so the drain knows what your green covers.

READY-FOR-GATES. Report: which cure you chose and what it stops catching, the planted-violation red AND green, your node version, and the one-file diffstat.
