# lane-c-ed-04-gizmo-guards-vacuous — four editor guards time out BEFORE their assertions, on an idle machine

**FIRE-AUTHORED (attended review welcome)** — s1044, 2026-07-25
**Role:** e2e guard-honesty diagnosis + fix (the F-1026-5 class). **Workdir:** `worktrees/lane-c` (lane branch `lane/e2-arsenal`).

## READ FIRST (paths, not memory)
- `e2e/ed-04-gizmos.spec.ts` — the whole file. The three helpers that decide this task:
  **`openEditor` :251-261**, **`ready` :263-266**, **`commitAndReload` :362-365**.
- `reviews/resource-timing-false-greens.md` — **F-1034-3** is written up there (the finding this task
  acts on) and, more usefully, it is the **model for the shape of proof this board expects**: a
  before/after measurement table plus a can-it-still-fail mutation on every guard you touch.
- `tasks/BACKLOG.md` — **F-1034-3** (line 823, OWNERLESS) and **F-cp00-1** (line 425, the `:17`
  carve-out below).
- `e2e/m1-01-claim-jumpers-death.spec.ts` — the control that makes `:212` a contradiction: it boots
  plain and waits on the same diagnostics global, and it passes 8/8 in every drain battery.

## WHY (evidence, quoted and dated — measured by the s1044 fire, 2026-07-25 ~13:45Z)
`F-1034-3` recorded these as red but attributed them to CPU load: s1034's battery ran *"while
lane-c's Codex run was live on the same machine"*, the documented F-perf05-1 pattern. **That
attribution is now disproved.** I re-ran the file on an **idle** machine — no Codex run, no other
fire, nothing else on the board — and it is still **5/5 RED**:

```
npx playwright test e2e/ed-04-gizmos.spec.ts --project=desktop-chrome --workers=1
  5 failed  (:17, :141, :177, :192, :212)
```

**So these are not load flakes. They are four browser guards that never reach their own assertions**
— the F-1026-5 class (`m2-01:322` was vacuously red for days for exactly this reason), and the
dangerous half of it: **a test that dies in its setup can never fail for the reason it was written.**

Two failures I captured in full, because they are two *different* walls:

| Test | Dies at | Verbatim | What it proves |
|---|---|---|---|
| `:141` zone gestures | `commitAndReload` → `page.waitForEvent('load')` | `Test timeout of 90000ms exceeded. Error: page.waitForEvent: … waiting for event "load"` | the app is **alive** — the failure snapshot shows a running game (*"Run vitals … Time 01:34"*). It is not a crash; a **load event that never comes**. |
| `:212` plain boot | `:216` `page.waitForFunction(frame > 10)` | `Test timeout of 30000ms exceeded.` | a **plain boot** allegedly never reaches 10 frames in 30 s — which `m1-01` contradicts in every drain battery. |

**The leading hypothesis for `:141`/`:177`/`:192`, stated so you can kill it rather than inherit it:**
`commitAndReload` (:362-365) is `await Promise.all([page.waitForEvent('load'), action()])` — it
assumes clicking **undo/redo reloads the whole page**. If the editor's history moved to an in-place
update (no navigation), that `load` event never fires, the helper hangs for the full timeout, and
**every assertion after `:153` has been dead code ever since.** That is a guess with a mechanism, not
a diagnosis. **Your scope 1 is to settle it by observation.**

## SCOPE (numbered, each testable)
1. **Say where each of the four browser guards actually dies, and why — before changing anything.**
   Run them **isolated** (`-g` per test) and as a **full file**, desktop and mobile, and report a
   table: test → the exact helper/line that hangs → the verbatim playwright error → isolated vs
   in-file behaviour. **Run `:212` isolated FIRST and report it separately**: if it passes alone and
   fails only after the other four have each burned a 90 s timeout, then `:212` is **collateral**
   (a wedged server/browser), not its own defect — and that is a finding, not a fix.
2. **Settle the `commitAndReload` hypothesis with evidence.** Does clicking `terrain-brush-undo`
   still navigate? Observe it (`page.on('framenavigated')`, or assert on the load event directly) —
   do not reason from the source alone. Report which it is: **(a)** the product stopped reloading and
   the helper is stale, **(b)** the product still reloads but the helper races it (registered after
   the event fired), or **(c)** neither — the undo click itself never lands.
3. **Settle the `:212` contradiction.** `m1-01-claim-jumpers-death` boots plain and waits on the same
   `__THREE_GAME_DIAGNOSTICS__.frame` counter and passes. Either `:212` differs in a way you can
   name at `file:line`, or it is collateral per scope 1. **Name the difference or retire the
   hypothesis** — "flaky" is not an answer.
4. **Repair the guards at the helper, not the assertion.** Whatever scope 2 finds, fix the *waiting*
   so the test reaches its assertions: await the condition the product actually satisfies (editor
   state settled / history mark applied) rather than a navigation it may no longer perform. **Every
   assertion in these four tests stays byte-identical** — this task exists because they never ran,
   so weakening them would be repairing a guard by deleting it.
5. **Prove each repaired guard can still fail (mandatory — this is the acceptance evidence, not the
   green run).** For **each** of the four, mutate the thing it watches so it *should* go red, show
   the red with its expected/received, then restore byte-exact and show the restore. A guard that
   has been vacuous for weeks earns no trust from a passing run; the four greens are corroboration,
   the four reds are the proof. (`reviews/resource-timing-false-greens.md` did exactly this for four
   sites — follow that shape.)
6. **`:17` IS NOT YOURS — do not fix it, do not count it against you.** The pure model test
   (*"gizmo model exposes only the ratified capabilities"*) is the documented known-red **F-cp00-1**
   (BACKLOG:425): *"pre-existing on main, attended-owned: ED-04 pure model test RED… one shipped E3
   template fails the unchanged descriptor round-trip = L2 gap #6"*. It takes no page and cannot be
   a timing defect. Report it still red and move on. **If your work happens to explain it, that is a
   bonus finding — report it, do not act on it.**

## FIREWALL
**TOUCH-ONLY:** `e2e/ed-04-gizmos.spec.ts` — its **helpers** (`openEditor`, `ready`,
`commitAndReload`, the drag/tap helpers) and, if scope 2 proves the product is at fault, the
specific editor site you name in your report.
**NO:** the assertions inside the four tests (frozen — see scope 4) · `:17` and anything it touches
(`src/meta/ContractFamilies.ts`, contract descriptors/templates — F-cp00-1 is attended-owned) ·
`src/game/` sim, combat, or Economy · `Balance.ts` · any other spec file · the `m1-01` /
`m2-01` / `m2-05` guards and their expected numbers (all load-bearing and green — `m2-05` was
stabilised only this morning at `d79e8941`).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Pre-proved for you (s1044, ~13:50Z, so you need not spend budget on it):** `git log main..lane/e2-arsenal`
is **exactly one commit** — `7d951b76 runner(lane-c): lane-m2-05-repair-dwell-observable.md` — whose
content s1042 merged to main as **`d79e8941`**. It is therefore a **SAFE DUPE**: confirm it yourself,
then proceed. (The only other difference is `reviews/shots-m2-05/*.png`, where main holds the drain's
own regenerated screenshots — main is ahead there, nothing is lost.)

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. **A diagnose-only return IS an authorized outcome here** if scopes 1-3 produce a named root cause at `file:line` and the fix turns out to belong to a product surface outside this firewall — say so explicitly rather than stretching the firewall to reach it.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/ed-04-gizmos.spec.ts` — the **four browser tests** green on
**desktop + mobile** at `--workers=1`, **both isolated and as a full file** (`:17` excepted per scope
6). Because this defect is order- and timeout-shaped, a single green invocation is not evidence:
run the full file **three separate times per project** and report all numbers.
**Adjacent unmodified-green, both projects, `--workers=1`:** `e2e/m1-01-claim-jumpers-death.spec.ts`
(8/8 — it is also the scope-3 control) and `e2e/m2-05-base-damage-repair.spec.ts` (7/7 — freshly
stabilised at `d79e8941`; if it regresses, that is yours to report immediately).
**Known pre-existing red, NOT yours:** `ed-04:17` (**F-cp00-1**, scope 6).
Zero console/page errors (these tests already assert `consoleErrors`/`pageErrors` `toEqual([])` —
keep those assertions). Screenshot of the editor with a zone gesture applied to
`reviews/shots-ed-04-gizmos/`.

End: **READY-FOR-GATES** + report: the exact hang site per test at `file:line`, which of scope 2's
(a)/(b)/(c) it was, whether `:212` was a real defect or collateral, the four mutation reds with
their expected/received, and whether any product code (not just the spec) turned out to be at fault.
