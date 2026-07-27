# Task lane-town-t6-assay-supersession: the last `assay-bench` assertion that RF-03b made unreachable (lane-a, commit prefix "test:")

**FIRE-AUTHORED s1138 (attended review welcome).** From **F-1137-4** (`tasks/BACKLOG.md:1439`, s1137). It invents no scope: the defect is diagnosed at source, the precedent repair is shipped, and this is test-only. **This task must not touch `src/`.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1138 pre-measured the branch and you must still re-verify it: `lane/m3` is **1 ahead** at `6acfd18f`, the 082 runner commit, **drained at `cc663f52`**. I checked both paths that commit touches against main. `e2e/town-t6-surfaces.spec.ts` is **byte-identical** — the spec change is fully on main. The only difference is `reviews/082-town-t6-ledger-nav-align.md`, where **main holds the richer drain review** and the runner's original is preserved beside it as `reviews/082-town-t6-ledger-nav-align-runner-report.md`. Nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `tasks/BACKLOG.md:1439` — **F-1137-4**, the finding this closes. Read it before you read the code.
2. `src/crafting/AssayBench.ts:279-286` — `install()`. **This is the whole mechanism.** It returns `AssayBenchPanel` only when the URL carries `debug`, else `ComplaintDeskPanel`.
3. `e2e/bug-office-desk.spec.ts:54-58` — the `openTown(page, query = '')` helper. **This is the pattern you will copy**; it injects the query with `history.replaceState` *after* the plain start menu has loaded.
4. `e2e/bug-office-desk.spec.ts:101-119` and `:246-258` — the two shipped, green, canonical shapes: plain boot asserts the Complaints Desk, a separate `?debug` test asserts the bench.
5. `e2e/town-t6-surfaces.spec.ts` — the file you are repairing. `openTown()` at `:43`, the two failing tests at `:118` and `:154`.

## WHY (evidence, measured this fire — re-measure it, do not inherit it)

`e2e/town-t6-surfaces.spec.ts` has **4 reds: `:118` and `:154`, on desktop-chrome and mobile-chrome.** s1138 ran the spec on a scratch port and confirmed exactly that list — 6 passed, 4 failed — matching the 082 drain's 6/4.

Both die on the same thing: `await expect(page.getByTestId('assay-bench')).toBeVisible()` at `:125` and `:170`. It can **never** pass there. `openTown()` (`:44`) does `page.goto('/')` with no `?debug`, so `install()` returns a `ComplaintDeskPanel`, and the `assay-bench` testid is set **only** by `AssayBenchPanel` (`src/crafting/AssayBench.ts:63`). The failure snapshot confirms it from the other side: the door *does* open, and what renders is the Complaints Desk ("File complaint", "Redeem stub", "Close The Complaints Desk").

This is **F-902-1** — RF-03b deliberately put the Complaints Desk in normal play and reversed the bench behind `?debug`. Its corrective **F-931-1 shipped**, but only for `task-037` and `town-assay-office-blender`. s1138 re-ran the class grep and widened it: **nine** e2e specs reference `assay-bench`; `run3d-assay-bench`, `world-info-notes`, `task-037`, `sci-03-assay-branch`, `lane-c-activations-assay-office`, `m5-04-offline-queue`, `bt-00-demolish` all boot `?debug` at every call site, and `bug-office-desk` is correct by design. **`town-t6-surfaces.spec.ts` is the only survivor** — verified across the whole class, not the three files the finding happened to name.

### ⚠️ This task DEPARTS from the repair F-1137-4 prescribes, and here is why

F-1137-4 says *"swap `:125-130` and `:170` onto `complaint-desk`/`complaint-close`"* — i.e. realign **both** tests onto the Complaints Desk. **Do not do that to `:118`.** Two measurements say it is wrong:

- **It would delete coverage that exists nowhere else.** `grep -rn "assay-pending-card" e2e/` returns **exactly one hit: `town-t6-surfaces.spec.ts:126`.** Realigning `:118` silently drops the only assertion in the suite that the pending-order card renders. (`assay-queue-pending` is safe — task-037 and m5-04 both cover it.)
- **It would duplicate a test that is already green.** `bug-office-desk.spec.ts:101-119` *already* covers the plain-boot porch completely: the prompt, the button reading `Complaints Desk`, `assay-bench` at count 0, and `complaint-desk` visible after the click. A realigned `:118` would be a second copy of that, bought by deleting the pending-card check.

So: `:118`'s subject is the **crafting order status panel**, which is debug-only. Give it `?debug` — the s931/`task-037` precedent — and its title stays accurate. `:154`'s subject is **plain-boot readability at 390px**, so it keeps its plain boot and asserts what the player actually sees there. Each test keeps the boot its own subject requires.

## SCOPE (numbered, each testable)

1. **MEASURE BEFORE YOU REPAIR.** Run `e2e/town-t6-surfaces.spec.ts`, both projects, `--workers=1`, and write the **per-test** before list into your report. No bare counts. **If your measurement disagrees with the WHY above, your measurement wins and you say so.**

2. **Extend `openTown()` to take an optional query, copying `bug-office-desk.spec.ts:54-58`.** Signature `openTown(page: Page, query = '')`; default behaviour must be **byte-identical to today's** so the three currently-green tests that call it are untouched. Use `history.replaceState` as the sibling does — do **not** change the `page.goto('/')`, because `:89` depends on the plain start menu.

3. **`:118` — boot it with `?debug` and change nothing else.** Its assertions (`assay-bench`, `assay-pending-card`, `assay-queue-pending`, `assay-close`) are correct for the crafting panel; they were only ever unreachable. **Keep the test's title** — under `?debug` it is true again. ⛔ **Do not weaken, reorder or drop any of the four assertions**, and in particular do not drop `assay-pending-card:126` — it is this suite's only one.
   - ⚠️ **If `assay-pending-card` does not render because nothing is queued**, that is a *seeding* gap, not a stale assertion. You may seed a pending order **inside this spec file** to satisfy it — and you must **report that you did, and why**. Deleting the assertion instead is a firewall violation.

4. **`:154` — keep the plain boot; realign the assay leg to what the player sees.** Replace the `assay-bench` expectation at `:170` with a `complaint-desk` visibility assertion (testid, per `src/ui/ComplaintDesk.ts:41`). ⛔ **Assert the testid, not prose.** Do not assert any prompt or button *text* here — see the NO list.

5. **PROVE the new `:154` assertion can still FAIL.** A realigned assertion that passes against anything is the *probe that executes nothing* class. Mutate the **subject** — make the desk genuinely not render (or rename its testid in `src` **temporarily, in your working tree only**) — show `:154` goes RED, revert, show it green. **Report both runs. Do not commit the mutation**, and `git status` must be clean of `src/` when you finish.

6. **All 10 green, both projects.** `town-t6-surfaces.spec.ts` must end at **10 passed / 0 failed** across desktop-chrome and mobile-chrome. Report the per-test after list.

## TOUCH-ONLY

- `e2e/town-t6-surfaces.spec.ts`
- your report

## NO — do not touch

- ⛔ **`src/**` — ANY file.** This task is test-only; the product behaviour here is **correct and owner-blessed** (RF-03b). Scope 5's mutation is a working-tree experiment that you revert. If you conclude a product change is needed, that is a **STOP + report**, and it is a genuinely useful result.
- ⛔ **`e2e/town-t1-square.spec.ts` — especially `:96`.** That line expects the phrase `'order status'` in the assay porch prompt; the string exists nowhere in `src/`. It is **F-1114-1**, and `tasks/goals.json` rules it **NOT fire-authorable — "it is a copy decision"**. It is a real red and it is somebody else's call. **Do not fix it, and do not let its wording influence anything you write here.**
- ⛔ **Any assertion on prompt or button TEXT** in this spec — the plain-boot porch says "the clerk takes complaints" and the button reads "Complaints Desk". Those are product copy and sit inside F-1114-1's fence. Assert testids and visibility only.
- `e2e/bug-office-desk.spec.ts` — it is the green reference. **Read it, copy from it, do not edit it.**
- The three already-green tests in this file (`:89`, `:101`, `:134`). Scope 2 must leave them bit-for-bit unaffected; confirm they are still green.
- `Balance.ts`, art, other specs, anything not named in TOUCH-ONLY.

## SELF-CHECK (name the exact evidence)

- `npx tsc --noEmit` clean · `npm run build` green.
- **Per-test before/after lists, desktop-chrome AND mobile-chrome, `--workers=1`. No bare counts** — a green count has hidden a red exit code in this repo before.
- `town-t6-surfaces` **10/10 both projects**, with `:118` and `:154` named individually.
- All four of `:118`'s assertions still present — quote the final test body in your report.
- Scope-5 mutation proof: the RED run and the reverted GREEN run, both named, plus a clean `git status` for `src/`.
- Zero console/page errors (`assertNoErrors` already runs in every test — say so).
- Screenshots land in `artifacts/` as the spec's `shot()` already does.

**READY-FOR-GATES** — report: the scope-1 measurement, whether `:118` needed seeding and why, the scope-5 mutation proof, the per-test lists, and anything you were tempted to touch outside TOUCH-ONLY.
