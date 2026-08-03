CODEX: model=gpt-5.6-sol effort=high
# lane-d-f1428-2-make-the-never-electric-guard-able-to-fire — the assertion carrying the owner's "never electric" clause is vacuous where it is asserted (F-1428-2)
FIRE-AUTHORED s1428 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (F-1428-2, measured s1428 while draining `lane-era-true-lights`; every number below came from a probe run on the merged tree, not from reading):

The owner's directive of 2026-08-03 (F-BW-3, verbatim in the era-true-lights master) is: *"E1 town must read FLAME, never electric — audit all glow elements, era light grammar via townEraAccents (flame E1-E2, arc earns E3+), gentle flicker, day = unlit."*

That slice shipped at `5214f340b3f4ea58da8901a552ebc6d679408a50` and **the visual grammar is real** — the drain proved it by manufactured red, giving E1 an electric cool-white lantern glass and watching the day test go red on `fixtureColor`. This task does not touch that work.

**What it does touch is the one assertion a reader maps straight onto the owner's words, which turns out to defend nothing.** `src/town/TownScene.ts` reports a `coolWhiteEmissiveFixtures` count in its `lightGrammar` diagnostics, and `e2e/beauty-town.spec.ts` asserts it is `0` in the day test. That is the *"audit all glow elements / never electric"* clause in executable form.

**IT CANNOT FIRE.** When the drain made the fixture electric cool-white, `fixtureColor` reddened but **`coolWhiteEmissiveFixtures` stayed `0`**. A zero has two very different causes, so both were measured separately:

1. **Is the denominator empty?** No. Reporting `fixtures.length * 1000` returned **2000** — both `TownPropLanternGlow` and `TownLanternStringBeads` exist in the day scene.
2. **Can the detector see them?** No. Reporting `basicMaterialCount * 1000` returned **0** — **zero of those two fixtures are `MeshBasicMaterial` by day.**

The filter opens with an early return on material type, so every fixture is discarded **before its colour is ever examined**. The count is therefore structurally `0` for *any* colour, including an electric one. And it is asserted **only** in the day test — the dusk test and the Voltage test do not reference it — so it defends nothing anywhere.

⚠️ **THIS IS THE `a passing oracle may stub the wrong failure` SHAPE.** The strongest-looking assertion is the one measuring an empty set. Nothing about the shipped visuals is wrong; what is wrong is that a future change could make the town electric again and this guard would stay green.

READ-FIRST (paths — open each one, do not work from this summary):
- `src/town/TownScene.ts` — the diagnostics builder `townLightDiagnostics()`, and specifically the fixture collection and the filter. Cite BY CONTENT per F-1310-1: grep `const coolWhiteEmissiveFixtures = fixtures.filter((fixture) => {` (expect **1**) and grep `if (!material.isMeshBasicMaterial) return false;` (expect **1**). Also read `townEraAccents` and the `TownEraAccent` type.
- `e2e/beauty-town.spec.ts` — all three tests. Note which of them assert `lightGrammar`, and that only the day one names `coolWhiteEmissiveFixtures`.
- `reviews/era-true-lights.md` — the full finding and the probe numbers. Grep `zero are \`MeshBasicMaterial\` by day` (expect **1**), `defends nothing anywhere.` (expect **1**), and `The era grammar is genuinely defended.` (expect **1**).
- `tasks/BACKLOG.md` finding **F-1428-2** — grep `before its colour is ever examined` (expect **1**).
ⓘ This lane was refreshed to main by s1428 immediately before dispatch, and every grep above was verified to return **1 on main and 1 in this lane** before the queue copy. **If any grep returns 0, STOP and report — the lane drifted after dispatch and the premise needs re-checking.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SCOPE (each item separately checkable):

1. **MAKE THE DETECTOR EXAMINE THE MATERIAL THE FIXTURES ACTUALLY CARRY.** Establish first, by reading the code that builds `TownPropLanternGlow` and `TownLanternStringBeads`, what material type each one carries **by day** and **at dusk**. Then rewrite the filter so it reads the emissive/base colour of whatever those materials actually are, instead of early-returning on a single concrete type.
   ⚠️ **The one thing that must not survive is a type check that silently returns `false` for the fixtures actually present.** If a fixture's material genuinely has no colour to inspect, that is a **STOP-and-report**, not a `return false` — a guard that cannot see its subject must say so rather than report zero.
   ⓘ Keep the "cool white" predicate itself (low saturation + high lightness) unless you can show it is wrong; the defect is *reach*, not threshold.

2. **ASSERT IT WHERE IT CAN FIRE — AT DUSK AS WELL AS BY DAY.** Add `coolWhiteEmissiveFixtures: 0` to the dusk assertion in `e2e/beauty-town.spec.ts`, and keep it in the day one. E1 dusk fixtures are lit **flame** (`#ffb45c`), which is saturated and warm, so `0` is the correct expected value there for the right reason rather than by accident.
   ⓘ **Do NOT add it to the Voltage/E3 test.** Arc light is *deliberately* cool and pale — that era is *supposed* to read electric, and asserting `0` there would encode the opposite of the owner's grammar. If your reading of the E3 accent suggests otherwise, STOP and report rather than choosing.

3. **ACCEPTANCE IS A MANUFACTURED RED, NOT A GREEN (s1299/s1300 standard, and this task exists because a green lied).** The deliverable is not "the tests pass". You must show, in the report:
   a. A **pre-fix** arm: with an electric cool-white fixture colour manufactured into the E1 accent, the *current* counter still reports **0** (reproducing the defect).
   b. A **post-fix** arm: with the same manufactured electric fixture, the repaired counter reports **non-zero** and the day test **FAILS** — at both day and dusk assertion sites where applicable.
   c. The probe **reverted**, and the tree byte-identical afterwards (`git diff` empty on `src/`).
   ⚠️ **A report showing only passing tests is a pre-declared REJECT.** The whole finding is that this guard passes while blind; a green proves nothing about it.

4. **RE-STATE THE DENOMINATOR IN THE REPORT.** Report how many fixtures the detector examined at day and at dusk (the count, not just the verdict). The drain measured **2 by day**; if your repaired detector examines a different number, say so and explain why — a guard whose denominator silently changed is a new finding, not a detail.

TOUCH-ONLY:
- `src/town/TownScene.ts` — the diagnostics filter and, only if scope 1 requires it, the material construction it inspects.
- `e2e/beauty-town.spec.ts` — the dusk assertion (scope 2) only.

NO (firewall — report, do not fix):
- **`playwright.config.ts`** — untouchable (fire.md §3.1; `fire-shell-serialisation.test.mjs` asserts both directions, and adding `fullyParallel` is separately forbidden).
- **The `townEraAccents` colour values, opacities, intensities, flicker depths and the era→family mapping.** The owner ruled on how the town LOOKS and it shipped; this task changes only whether a guard can SEE. Changing a colour to make a test pass inverts the task.
- Any other spec file, `src/town/` beyond the two surfaces above, `scripts/**`, `package.json` (a new npm script would be an un-rooted gate and would red `gate-caller-audit`).
- The `artifacts/era-lights/` evidence from the shipped slice — do not regenerate or delete it.

SELF-CHECK before READY-FOR-GATES (name the real numbers, both projects):
- `npx tsc --noEmit` → rc 0.
- `npm run build` → green.
- `npx playwright test e2e/beauty-town.spec.ts --workers=1` → **6/6**, desktop-chrome AND mobile-chrome, with the dusk test now also asserting the counter.
- `npx playwright test e2e/town-era-switch.spec.ts --workers=1` → **14/14**, both projects (adjacent suite; it shares `TownScene`).
- Console/page errors asserted `[]` in-spec, both tests, both viewports.
- The scope-3 pre-fix and post-fix arms, quoted verbatim, plus the scope-4 denominators.
- `git diff -- playwright.config.ts scripts package.json` → **EMPTY**.

READY-FOR-GATES + report: the two scope-3 arms verbatim (pre-fix still-0, post-fix non-zero-and-red), the day and dusk fixture denominators, what material type the fixtures actually carry at each mood, the four suite numbers, and anything you had to STOP on.
