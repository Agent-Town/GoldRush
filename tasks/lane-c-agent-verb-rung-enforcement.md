CODEX: model=gpt-5.6-sol effort=xhigh
# Task lane-c-agent-verb-rung-enforcement: land the owner's verb-rung ruling at the gate that ENFORCES it (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.
**FIRE-AUTHORED s1282 (attended review welcome).** One task, firewalled.

READ FIRST: `AGENTS.md` · `src/agent/StandingOrders.ts:345-419` (the two gates — THE SUBJECT) · `src/agent/AgentConsent.ts:11-19` (the ability table, already ruled-correct) · `specs/m4-agent-ux/README.md` (the ratified ladder line, amended s1281) · `scripts/agent-rung-conformance.test.mjs` (the guard you will extend) · `logs/session-scratch/s1282/harvest-rung-probe.mjs` (the measurement below — RE-RUN IT, do not inherit its numbers).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
ⓘ At authoring time (s1282) `lane/e2-arsenal` was 1 ahead of main and **measured a SAFE DUPE**: `node scripts/lane-freeze-classify.mjs lane/e2-arsenal` → 4 DUPLICATE + `package.json` BOTH-MOVED, and `node scripts/lane-absorbed-lines.mjs lane/e2-arsenal package.json` → **ABSORBED (main is a token-level superset)**. Re-run both; if either now says otherwise, STOP.

## Why (owner ruling 2026-07-30, verbatim; plus F-1282-1, measured s1282)

The owner ruled, via the decision panel, in `tasks/BACKLOG.md` at the `OWNER RULINGS 2026-07-30 (blocker sweep, both via decision panel)` row (cite it **by that anchor text** — rows land above it and the line number drifts):

> "AGENT VERB RUNGS — auto_pan/HARVEST = LEVEL 2 ("harvesting is the hero's basic verb"), place_building/BUILD = LEVEL 3 ("building spends gold"); panel rows BLESSED at their tiers."

s1281 (`21985788`) landed the **ability** half: `auto_pan` moved 3 → 2 in `src/agent/AgentConsent.ts:15` and `src/agent/ToolSurface.ts:378`, plus the ratified ladder line. That work is correct and is NOT to be re-done.

🚨 **F-1282-1 — THE RULING STILL HAS NOT REACHED BEHAVIOUR, BECAUSE THE VERB-RUNG TABLE WAS NEVER TOUCHED.** `permissionDenial` (`src/agent/StandingOrders.ts:397`) has **two** gates and the ability check is the **second**:

```
:402   const required = requiredLevel(order);
:403   if (required > level) return `${order.verb} requires permission rung ${required}; ...`;   <-- returns FIRST
:408   const ability = requiredAbility(order);                                                    <-- s1281 measured from here down
:409   if (ability && state.consent?.abilities[ability]?.allowed === false) ...
```

and `requiredLevel` (`:345-348`) still reads `if (order.verb === 'BUILD' || order.verb === 'HARVEST') return 3;`. **BUILD = 3 is exactly what the owner ruled. HARVEST = 3 is the value he overruled.**

🔬 **Measured through the REAL entry point** (`StandingOrdersExecutor.submit()`), all rungs granted, all abilities granted, on main at `21985788`, instrument `logs/session-scratch/s1282/harvest-rung-probe.mjs`:

| order | level 1 | level 2 | level 3 |
|---|---|---|---|
| HARVEST | PERMISSION_DENIED (rung 3) | **PERMISSION_DENIED: "HARVEST requires permission rung 3; current rung is 2."** | ACCEPTED |
| BUILD | PERMISSION_DENIED (rung 3) | PERMISSION_DENIED (rung 3) | ACCEPTED |
| REPAIR_UNDER *(control)* | PERMISSION_DENIED (rung 2) | **ACCEPTED** | ACCEPTED |

The control proves the harness can say yes; the subject is refused by the **rung** message from `:403`, never reaching `:409`. ⚠️ **Therefore F-1281-1's headline — "a level-2 Prospector can now be given a HARVEST standing order and previously could not" — is FALSE as stated.** Its `allowed` flip is real, and unreachable through `submit()`. Do not treat that handoff paragraph as the premise; treat this table as the premise, and re-derive it yourself.

The ratified ladder (amended s1281, `specs/m4-agent-ux/README.md`) independently reads **"L2 tend, repair & work the claim"** / **"L3 build"** — "work the claim" is the pan/harvest verb. Source and spec currently disagree; this task makes the source obey.

## Scope

0. **Re-derive the premise before changing anything.** Run `node logs/session-scratch/s1282/harvest-rung-probe.mjs` from the repo root and paste its table into your report. If HARVEST at level 2 is **already** ACCEPTED, the premise has moved — **STOP and report**, change nothing.
1. **`src/agent/StandingOrders.ts:345-348` — `requiredLevel` returns `2` for `HARVEST` and keeps `3` for `BUILD`.** Do not restructure the function beyond what that requires; every other verb keeps its current rung.
2. **`requiredAbility` (`:415-419`) is left EXACTLY as it is.** `HARVEST → 'auto_pan'` is already right, and `BUILD → null` is deliberate: the `place_building` ability does not exist in the `AgentAbility` union yet, and creating it belongs to the adapter task (see NON-GOALS). Adding it here would be inventing scope.
3. **Prove the behaviour changed, at the gate.** Re-run the probe after the edit; HARVEST must be ACCEPTED at level 2, BUILD must stay PERMISSION_DENIED at level 2, REPAIR_UNDER must stay ACCEPTED at level 2. Paste the before/after tables side by side.
4. **Extend the conformance guard so the verb-rung table cannot drift back.** `scripts/agent-rung-conformance.test.mjs` currently pins only the two *ability* tables. Add a test that reads `src/agent/StandingOrders.ts` and asserts the ruled **verb** rungs: HARVEST = 2, BUILD = 3. ⚠️ **The new test MUST be proven able to go red before you trust it** (F-1279-1's lesson: a green you did not try to make red is a rumour). Mutate the source in a temp copy — HARVEST back to 3, and separately BUILD to 2 — show `rc=1` on each arm, then a deletion arm showing a regex miss FAILS rather than passing vacuously; restore and show `rc=0`. Keep the harness at `logs/session-scratch/<your-session>/`. It must run under the existing `npm run test:node-guards` wiring — the file is already in that list; **do not edit `package.json`** unless it genuinely is not, and if you must, add ONLY your entry and re-assert every pre-existing entry by name (s1281 nearly lost six that way).
5. **No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## NON-GOALS (each with its reason — do not re-litigate)

- 🚫 **The AP-06b adapter re-land** (`panAt`/`placeBuilding` on the `Game.ts` agent adapter, salvage ref `save/ap-06b-adapter-wiring` `2f216af0`). Separate deliverable, separate firewall, owner-authorized separately. Landing it here would mix a one-line rung correction with a 46-line cross-system graft.
- 🚫 **Declaring `place_building` in the derived capability list at L3.** It requires extending the `AgentAbility` union (`src/agent/AgentConsent.ts:3`), which is consumed as `Record<AgentAbility, …>` at `:21`/`:26` and therefore fans out to every construction site plus `src/ui/Hud.ts` and `src/ui/ProspectorPanel.ts`. That is the adapter task's scope, and it is inert until `typeof game.placeBuilding === 'function'` (`src/agent/ToolSurface.ts:375`).
- 🚫 **`auto_repair`'s rung.** It is declared L1 while the ladder reads "L2 tend & repair" — that is **F-1279-2, live on the owner's desk, unanswered**. Touching it would pre-empt a ruling. Leave it at 1 and leave the guard's existing `auto_repair: 1` assertion alone.

## Firewall

Touch ONLY: `src/agent/StandingOrders.ts` (the `requiredLevel` verb-rung values ONLY) · `scripts/agent-rung-conformance.test.mjs` (add tests only) · your own scratch harness under `logs/session-scratch/`.
NO changes to: `src/agent/AgentConsent.ts` · `src/agent/ToolSurface.ts` · `src/game/Game.ts` · `src/ui/**` · `specs/**` (the ladder line is already correct) · the sim/Balance · Economy · CombatSystem · **any existing assertion in `e2e/**`** — a red there is **a finding to REPORT, not a test to fix**. ⓘ Expected-green: `e2e/ap-standing-orders.spec.ts:101` (in *"seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"*) asserts `requiredLevel: 3` on a **BUILD** order, which this task deliberately does not move — if that assertion reds, you changed BUILD by mistake.

## Self-check (evidence, not vibes)

`npm run test:node-guards` FIRST (**derive the pass count from your own baseline run before the edit — never inherit a number**; expect exactly your new tests as the delta) · `npx tsc --noEmit` clean · `npm run build` green · the probe's before/after tables (scope 0 + 3) · the four mutation arms (scope 4).
Playwright, **both projects (desktop + 390px mobile)**, the agent battery by name: `e2e/ap-standing-orders.spec.ts` · `e2e/m4-01-tool-surface.spec.ts` · `e2e/m4-05-agent-closeout.spec.ts` · `e2e/m4-06-embodiment.spec.ts` · `e2e/m4-07-prospector-panel.spec.ts` · `e2e/m4-09-agent-rung-clarity.spec.ts` · `e2e/m4-10-agent-actions-integrity.spec.ts` · `e2e/066-walk8-engine.spec.ts`. Zero console/page errors in a plain boot (no `?debug`), desktop and 390px.
⚠️ **Do NOT pass `--workers=1`.** Serialisation is a **fire-shell** correctness law (`scripts/fire.md` §3.1) and `playwright.config.ts:30` applies it automatically by env; forcing it in a lane taxes a shell that is ~3.5× faster in parallel (F-1267-1).
ⓘ **Known red, pre-existing, NOT yours:** `e2e/e2-arsenal.spec.ts` in *"arsenal upgrades apply to turrets"* fails at `placeFree('turret', 0, 10)` → `false`. Proved pre-existing by s1281 on a clean-main control arm (`logs/session-scratch/s1281/control-arm-clean-main.txt`). If you run that spec, report it as the known red; do not chase it and do not edit it.

READY-FOR-GATES + report: the probe's before/after table; the four mutation arms with their exit codes; the node-guards count as *baseline → after* with the delta named; and whether any e2e assertion moved (with the spec + test title, not a bare line number).
