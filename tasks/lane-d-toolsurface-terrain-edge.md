# Task lane-d-toolsurface-terrain-edge: one import line makes the WHOLE Playwright suite uncollectable — restore the F-A8-7 injection law (LANE-D, commit prefix "fix(agent):")

**FIRE-AUTHORED s2381 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high

READ FIRST (in this order, they are the whole argument):
- `AGENTS.md`
- `src/systems/ScheduledRelocationSystem.ts` — the ratified convention, in the corpus, with its finding id. Its header says verbatim: `IT IMPORTS NO RENDER CODE, AND THAT IS A LAW HERE RATHER THAN A PREFERENCE (F-A8-7). A module both engines construct dragged world/Terrain's ?raw JSON import into the collection graph and made the WHOLE Playwright suite uncollectable.` **This has happened before. This task is that same defect, recurred.**
- `src/systems/DevilsAlleyPresentation.ts` (header: `TERRAIN IS INJECTED, NOT IMPORTED (F-A8-7)`) and `src/systems/SeedCaravanPresentation.ts` — two worked examples of the cure shape.
- `src/agent/ToolSurface.ts` — the defect site: `:18` `import * as Terrain from '../world/Terrain';`, used at exactly ONE place, `:164` `buildTargetReachable: (pos) => Terrain.isBuildable(pos.x, pos.z),`.
- `src/world/Terrain.ts` — `:2` is the `?raw` JSON import that cannot load outside Vite; `:238` `isBuildable` is the only member ToolSurface needs, and it depends on `sample()` and `ACTIVE_CONTRACT`, i.e. on that very contract text.
- `scripts/whole-suite-collection.test.mjs` — the guard that already reds on this, rooted in `test:node-guards`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP, whether as uncommitted dirt or as the whole content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
**CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.** ⓘ **This is not politeness: at authoring time lane-d already held untracked `logs/guard-stats.jsonl` and main held modified `logs/task-stats.jsonl` — exactly the churn that has killed masters before (f1406-1, 54,875 tokens for zero edits).**
**CITATION CHECK (run BEFORE any edit, it proves your lane is current):**
`grep -c "IT IMPORTS NO RENDER CODE, AND THAT IS A LAW HERE RATHER THAN A PREFERENCE (F-A8-7)" src/systems/ScheduledRelocationSystem.ts`
must print **1**. If it prints 0 the lane is stale — STOP and report, do not refresh it yourself.

## Why (MEASURED s2381 — every number below was produced this fire, not inherited)
`npx playwright test --list` on main returns **`Total: 0 tests in 0 files`, rc=1**. The whole e2e suite is uncollectable.

1. **Reproduced** on main: `TypeError: Module ".../m1-core.layer-contract.v1.json?raw" needs an import attribute of "type: json"`.
2. **Bisected** the 432-file corpus to a single culprit spec: `e2e/ap16-6-browser-seat.spec.ts` reproduces `0 tests` **alone**.
3. **Static chain:** `e2e/ap16-6-browser-seat.spec.ts` → `src/mp/AgentRiderBody.ts` → `src/agent/ToolSurface.ts` → `src/world/Terrain.ts`.
4. **A/B by commit** (detached worktree): parent `f0bf01138` → **2988 tests in 431 files**; `405efbbf6` (`runner(lane-b): embodied-build-v2.md`, 2026-08-30T17:31:31+07:00) → **0 tests**. That commit added `ToolSurface.ts`'s Terrain import; the other three spec-reachable Terrain edges (`Embodiment.ts`, `WaveSystem.ts`, `FreedWalkerVfx.ts`) date from July and are NOT the cause.
5. **A/B by LINE** on main's tip, in a detached worktree: severing that one import (and stubbing `:164`) → **2996 tests in 431 files**. One line accounts for the entire outage.

⚖️ **Severity, stated honestly and not inflated: this is NOT a false green.** The listing exits **rc=1** and the `whole-suite-collection` guard reds correctly in `test:node-guards`. What it costs is **coverage**: the whole-suite gate is unrunnable, while **targeted spec runs still pass** — so a drain gating only its own spec reads green with the suite dark behind it. Nothing shipped is known-wrong because of this.

🚫 **This needs no owner ruling, and that is the point.** The prior handoff parked it as "fire-authorable once someone rules WHICH fix". The corpus already ruled: **F-A8-7, injection not import**, with two worked examples in `src/systems/`.

## Scope
1. **THE EDGE TABLE first** (write it into your report, before any edit): for each of the four spec-reachable static edges into `world/Terrain` — `agent/ToolSurface.ts`, `agent/Embodiment.ts`, `systems/WaveSystem.ts`, `systems/FreedWalkerVfx.ts` — record: which specs reach it, whether it is load-fatal today, and whether this task touches it. **Fix from evidence, not assumption**: three of the four are long-standing and are NOT in scope; only prove that, do not "tidy" them.
2. **RESTORE THE F-A8-7 LAW at `src/agent/ToolSurface.ts`**: remove the module-scope `import * as Terrain`, and take `buildTargetReachable` (or an `isBuildable`-shaped predicate) through the **existing** `ToolSurfaceOptions` bag that `createToolSurface(game, options)` already accepts. `src/world/Terrain.ts:238`'s `isBuildable` closes over `sample()` and `ACTIVE_CONTRACT`, so it CANNOT be lifted out of that module without dragging the contract with it — **inject it, do not relocate it.**
3. **BEHAVIOUR MUST BE PRESERVED AT THE COMPOSITION ROOT, AND YOU MUST PROVE IT.** Whatever the browser path is that builds the real surface (start from `src/mp/AgentRiderBody.ts:22` and `src/agent/AgentStub.ts:159`, and follow them to where the live game constructs one) must inject the genuine `Terrain.isBuildable`, so an agent's build-reachability answers are byte-for-byte what they are today. ⚠️ **A default is a behaviour change wearing a convenience costume:** several e2e specs call `createToolSurface(adapter)` with no options at all. State in your report what those callers now receive and why that is correct — if you choose a permissive default, say so in words and show the spec evidence that no assertion moves.
4. **A GUARD WITH TEETH.** `whole-suite-collection.test.mjs` already catches the symptom; that is not enough, because it only reds AFTER someone lands the edge. Add a guard that names the CLASS: no module reachable at module scope from `e2e/**` may statically import a module carrying a Vite-only `?raw` import. Derive the `?raw` carrier set from the tree (`git grep`), never transcribe it — a hardcoded list certifies the members it omits. **Prove every red arm by MANUFACTURING the defect** on a scratch copy (restore this exact import and watch it red); an arm no defect reaches is decoration. Root it in `test:ledger-guards` (cheap) unless it needs the playwright collection, in which case `test:node-guards`.
5. **Report the before/after collection totals** as your headline evidence: `npx playwright test --list` must go from `0 tests in 0 files` to a number in the high 2900s.

## Firewall
Touch ONLY: `src/agent/ToolSurface.ts`, the minimum call sites needed to inject the predicate (`src/mp/AgentRiderBody.ts`, `src/agent/AgentStub.ts`, and the live composition root you identify), the new guard script, and `package.json`'s battery line if you root the guard there.
NO: `src/world/Terrain.ts` (do not touch the `?raw` import — it is correct for the browser bundle and predates this defect by two months), NO changes to `Embodiment.ts` / `WaveSystem.ts` / `FreedWalkerVfx.ts`, NO edits to existing specs except where injection genuinely requires a call-site argument, NO `playwright.config.ts` changes, NO reverting `405efbbf6` (its other twelve files are wanted work — cure the edge, not the commit).

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- **`npx playwright test --list` collects >2900 tests in 431 files** (paste the exact `Total:` line).
- `npm run test:node-guards` — run it ALONE (it is ~530 s and contends; a concurrent battery corrupts both). `whole-suite-collection` must be GREEN.
- Agent-surface specs green both projects, desktop AND 390px mobile: `e2e/ap16-6-browser-seat.spec.ts`, `e2e/m4-01-tool-surface.spec.ts`, `e2e/m4-05-agent-closeout.spec.ts`, `e2e/ap-standing-orders.spec.ts`, `e2e/agent-view.spec.ts`. Pass `--workers=1`.
- Zero console/page errors in a plain boot (no `?debug`).
- New guard green, and its manufactured-defect evidence quoted arm by arm.
- No-op guard: exit-without-changes = WRITE WHY first.

END: **READY-FOR-GATES** + the edge table + the before/after `Total:` lines + what each `createToolSurface` caller now receives for `buildTargetReachable` and the evidence that no assertion moved.
