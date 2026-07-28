# Task lane-c-asset-diet-skip-duty-split: give the asset-diet "may these tests run at all" duty its OWN variable, so an external-server run stops un-skipping a production-bundle-only suite (lane-c, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1168, 2026-07-28. Authored from F-1026-1 (`reviews/advance-stream.md:72`, merged), F-1047-1 (`tasks/BACKLOG.md:988`, measured), and a NEW measurement taken by s1168 against the merged red inventory. No new scope invented; this is the third instance of one already-named class.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/asset-diet.spec.ts` lines 1-20 (the file-level skip guard)
- `playwright.config.ts` lines 1-25 (the `webServer` ternary)
- `playwright.preview.config.ts` (whole file — it is short and it is the crux)
- `package.json` line 12 (`test:asset-diet`)
- `scripts/deploy.sh` lines 52-77 (the deploy budget check — **the second consumer, do not miss it**)
- `reviews/advance-stream.md:72-88` (F-1026-1, with its measured baseline table)

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1168 verified at 2026-07-28T13:4xZ: `lane/e2-arsenal` is 1 ahead at `b9035a65` (`runner(lane-c): lane-c-f1148-1-trajectory-spec-rig.md`), and that content **is on main** — the task done-moved as `shipped-745e8fc6-…`, and `artifacts/f1148-1-trajectory-split-v2.md` + `artifacts/f1148-1-trajectory/` are present on main at drain commit `745e8fc6`. Textbook SAFE DUPE → reset and proceed. Re-run the one probe to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated and measured)

`GR_CAPTURE_EXTERNAL_SERVER` carries **two unrelated duties**, and F-1047-1 named this in words on 2026-07-26 without splitting them:
- `playwright.config.ts:20` reads it as *"I brought my own server, don't start `npm run dev`."*
- `e2e/asset-diet.spec.ts:15` reads it as *"these tests may run at all."*

Because one variable answers both questions, **any full-suite run against an external dev server silently un-skips a suite that only means anything against the built bundle.** That is not hypothetical — it happened, and it cost a fire:

- The suite-red-inventory run (merged `7a457025`) was instructed by its own master to run `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5271` against `npm run dev -- --port 5271` (`tasks/done/shipped-7a457025-…-lane-d-suite-red-inventory.md:32-36`). It set the flag ONLY to satisfy the first duty. The second duty fired too.
- Result, measured from the run's own raw JSON by s1168: `[asset-diet] desktop-chrome townResponses: 45604607 bytes` and `[asset-diet] mobile-chrome townResponses: 45605055 bytes` against a `25_000_000` budget — **2 red executions in `logs/suite-red-inventory.md` (rows at `e2e/asset-diet.spec.ts:101`, bucket BOTH)**, which should have been **skipped**.
- Those two rows then misled the very next fire: s1167's handoff named `asset-diet.spec.ts:101` the **best-evidenced non-forking candidate** for the next master, describing it as *"a real 25 MB-budget regression since 07-25 with a dated green to bisect against."* It is not a regression. s1168 refuted that premise two ways: (i) the cited green `0dfa1d3f` landed **2026-07-25T09:44:52+07:00**, **52 minutes BEFORE** the advance-stream prefetch merged at `e109639f` **10:36:06** — so it was never green *with* the prefetch live; and (ii) the green was measured against the **production bundle** while the red is measured against the **dev server**, which serves the undieted originals. Different instruments, not a regression.

F-1026-1 already measured the underlying arithmetic and it still holds: dev-server transfer on baseline main **36,244,224 B** vs merged **36,253,834 B** — the prefetch contributes **~9.6 KB (0.03%)** — while the same suite is **4/4 green against the production bundle**.

**So the cure keeps getting applied to the instance and the class keeps surviving.** F-1026-1 added the skip guard (`e3d81fb6`). F-1047-1 made `test:asset-diet` actually execute (`e718b7cc`) — **by setting `GR_CAPTURE_EXTERNAL_SERVER=1`**, i.e. by leaning harder on the overloaded variable. This task separates the duties so the class dies.

## Scope

**1. OBSERVE THE DEFECT FIRST — this is a STOP gate, not a formality.**
Start a dev server on scratch port **5272** (NOT 5188 — that is the shared lane port, Mistake #12). Then run, with the dev server as the external server:
```
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5272 \
npx playwright test e2e/asset-diet.spec.ts --workers=1
```
Record the exact outcome line and the `[asset-diet] … townResponses: N bytes` lines.
- **Expected: tests RUN and FAIL** (the byte count will be ~36-46 M against the 25 M budget).
- **If instead it reports everything SKIPPED, the premise of this task is refuted → STOP and report that, changing nothing.** Do not "fix" a defect you could not observe.

**2. Split the two duties.** Introduce a dedicated variable — name it **`GR_ASSET_DIET_BUNDLE`** (house precedent: `GR_ASSET_DIET_REUSE_BUILD` already exists in `playwright.preview.config.ts`).
- `e2e/asset-diet.spec.ts:14-15` — the `console.warn` and the file-level `test.skip` key on **`GR_ASSET_DIET_BUNDLE !== '1'`** and no longer on `GR_CAPTURE_EXTERNAL_SERVER`.
- Update the skip message and the file's top comment so they name the new variable and the command that sets it. The message is what a future fire reads first — make it say which bundle the suite measures and how to run it for real.
- `playwright.config.ts:20` is **NOT** touched: its external-server duty is correct and other rigs depend on it.

**3. Migrate BOTH real consumers — missing either one installs a false green.**
- `package.json:12` (`test:asset-diet`) → set `GR_ASSET_DIET_BUNDLE=1`. Note while you are there: `playwright.preview.config.ts` overrides `webServer` unconditionally, so the preview path never needed `GR_CAPTURE_EXTERNAL_SERVER` for the server duty at all. Drop it **only if** scope 4 proves the command still builds, boots preview, and executes assertions; if dropping it changes behaviour, keep it and say so in the report.
- `scripts/deploy.sh:61` → the deploy budget check invokes the same spec with `GR_CAPTURE_EXTERNAL_SERVER=1 GR_ASSET_DIET_REUSE_BUILD=1`. It must set `GR_ASSET_DIET_BUNDLE=1` too, or **the deploy's asset-budget gate silently becomes "0 tests run" while still printing success** — F-1026-1's own failure mode, one layer up, in front of a player-facing commitment. `deploy.sh`'s never-block law at `:3-4` and its `STRICT=1` semantics are unchanged.

**4. Prove the cure in BOTH directions. A guard that cannot fail is not a guard.**
- **(a) The defect is gone:** re-run scope 1's exact command. Expected now: **4 skipped, 0 failed**. Paste the outcome line.
- **(b) The suite still really runs:** `npm run test:asset-diet`. Expected: it builds, boots preview on 5189, and **executes assertions** — paste the outcome line and the real `[asset-diet] … townResponses: N bytes` per project, plus whether each is under the 25 M budget.
- **(c) It can still FAIL:** temporarily mutate the threshold at `e2e/asset-diet.spec.ts:101` from `25_000_000` to `1_000`, re-run (b), and paste the failure proving the assertion is live. **Then revert the threshold** and paste `git diff -- e2e/asset-diet.spec.ts` showing `25_000_000` restored.
- **(d) The deploy gate still measures:** run `bash scripts/deploy.sh` far enough to capture the `checking first-town asset budget…` section, and paste the `asset budget <project>: N bytes` lines it emits. If deploy cannot complete in this environment (no wrangler/auth), that is fine and expected — paste the budget section and say the deploy self-skipped afterwards.

**5. Report the class, do not fix it beyond scope.** Grep `e2e/` for any OTHER file-level `test.skip` keyed on an environment variable that a full-suite external-server run would flip (`grep -rn "test.skip(process.env" e2e/`). **Report the list and the count in your run report. Do not change any other spec** — if there are more, that is a finding for the drain fire, not scope here.

## Firewall

**TOUCH-ONLY:** `e2e/asset-diet.spec.ts` · `package.json` · `scripts/deploy.sh` · your run report in `tasks/runs/`.

**NO (do not touch, do not "improve"):**
- `playwright.config.ts` and `playwright.scratch.config.ts` — the `GR_CAPTURE_EXTERNAL_SERVER` server duty is correct as written.
- `playwright.preview.config.ts`.
- **The `25_000_000` threshold** — permanently editing it is forbidden. *A budget edited to fit its measurement is not a guard* (F-1047-1). Scope 4(c) mutates it only as a proof and reverts it in the same scope.
- Any `src/**` file. Any other `e2e/**` spec. `logs/suite-red-inventory.md` (a merged artifact; its two stale rows are the drain fire's bookkeeping, not yours).
- The advance stream (`src/assets/AdvanceStream.ts`) and `src/town/TownTavernPilot.ts` — those sit inside an **open owner fork (F-1167-1)** and are NOT yours to touch under any reasoning.

## Self-check before you report READY-FOR-GATES
- `npx tsc --noEmit` clean.
- `npm run build` green.
- Scope 1 recorded a real observed FAILURE, and scope 4(a) recorded the same command now SKIPPING.
- Scope 4(b) recorded real byte numbers per project; scope 4(c) recorded a real induced failure **and** the reverted diff.
- Scope 4(d) recorded the deploy budget section.
- Adjacent suites unmodified-green, **both projects (desktop-chrome + mobile-chrome), zero console/page errors**: `e2e/058-device-tiers.spec.ts` (the only other spec reading a `GR_CAPTURE_*` variable) and one boot probe of your choice. Name the exact suites and paste the counts.
- `git diff --stat` shows **exactly three tracked files** changed.

**READY-FOR-GATES** + report: the scope-1 observed failure with its byte numbers, the scope-4 four-way proof (a/b/c/d), the scope-5 grep list with its count, and an explicit sentence stating whether you dropped `GR_CAPTURE_EXTERNAL_SERVER` from `package.json:12` and what proved that safe.
