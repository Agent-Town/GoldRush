# Task f2081-1: the E6 manifest calls capturable machines "uncapturable" — make it true (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2081, from F-E6HS-2 in `reviews/e6-homemaker-headless-socket.md:8` (2026-08-20).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.
READ FIRST: `AGENTS.md`; `reviews/e6-homemaker-headless-socket.md` (the drain that filed this finding — read its Findings line); `src/agent/MechanicsManifest.ts` lines 308–338 (the whole `atomicEpoch` block, not just the rule); `src/agent/ToolSurface.ts` lines 84–95; `src/agent/StandingOrders.ts` lines 26–30 and 344–357; `src/sim/AtomicSocket.ts` lines 20–42.

SEQUENCING LAW: this task depends on the E6 Homemaker headless-socket merge. Verify it is present before doing anything:
`git log --oneline | grep -q 'E6 Homemaker headless socket'` — if that returns non-zero, STOP and report "E6 Homemaker socket not landed". Do NOT gate on `git log -N` with a small N; search the whole log.
Also verify the lane actually carries it: `git merge-base --is-ancestor e86e9d8e322505f21e7a1b362587e96372c09e71 HEAD` must succeed. If it does not, STOP and report "lane stale — refresh required" rather than improvising.

CONTENT KEY (proved by the authoring fire: `grep -Fc "exhausted machines are undamageable and uncapturable" src/agent/MechanicsManifest.ts` = **1** on main at `b976f8249`, and 1 in the lane after refresh). If that grep returns 0, the file has moved under you — STOP and report "citation key absent — master stale", do NOT hunt for a lookalike line.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-E6HS-2, `reviews/e6-homemaker-headless-socket.md:8`, dated 2026-08-20)

The finding, verbatim: *"F-E6HS-2 `MechanicsManifest.ts:333` \"uncapturable\" is false (12 captured here; 373 by the showroom probe) → truth-pass sweeper"*.

⚠️ **The finding's coordinate `:333` has already drifted — the string now sits at `:336`. Use the CONTENT KEY above, never the number.**

Every fact below was re-verified at source by the authoring fire on main at `b976f8249`. Quote these back if any no longer holds, and STOP rather than improvise:

- `src/agent/MechanicsManifest.ts` emits `rule('wrangle_capture_unreachable', 'AgentGameAdapter', …)` carrying `agentOperations: []` and `consequence: 'exhausted machines are undamageable and uncapturable, and hold spawn slots'`. It is emitted for the WHOLE E6 epoch — the `atomicEpoch(contract)` branch — so all four E6 contracts serve it.
- **"uncapturable" is false, and the evidence is a measured artifact, not an opinion.** `artifacts/ap16-8b-e6-showroom-capture-loop/runs.jsonl:5` records a single `e6-showroom` run (`policy: "hunt"`, seed `e6-showroom-01`, `hash: "fnv1a32:aea49513"`) with **`"captures": 373`** and `"capturePlans": 373`. The E6 Homemaker prover captured 12 more (`reviews/e6-homemaker-headless-socket.md:5`, *"CAPTURE wound-down appliances (12 penned)"*). Machines that are captured 373 times are not uncapturable.
- **The capture is driven by an agent-surface verb, not a dev bridge.** `src/agent/StandingOrders.ts:28` declares `| { verb: 'CAPTURE' }`; `:347–350` executes it (`order.verb === 'CAPTURE' ? this.capture?.() : …`). `src/sim/AtomicSocket.ts:30–31` states it outright: *"The capture ceremony (`WrangleSystem.tryCapture`) is driven only by the agent-surface `CAPTURE` verb"*, and `:41` declares `captureLever: 'CAPTURE'`.
- **The comment above the rule states the same falsehood as its rationale.** The block beginning *"The load-bearing one."* asserts *"An exhausted machine can be neither killed nor captured by an agent, and it still counts against the spawn cap — so the epoch's loop cannot close from the agent surface as it stands."* The capture-loop measurement merged at `9f920a2f6` found the opposite: the loop **CLOSES** under aimed play (97–99% absorption, cap never saturates). `runs.jsonl:5` agrees — `"capSaturatedSeconds": 0`.
- **What is still TRUE and must survive:** `wrangle_exhausted` (`stopsTakingDamage: true`) means *undamageable* is correct, and `aliveCap: Balance.waves.aliveCap` with `"aliveEnd": 23` / `"alivePeak": 40` means *holds spawn slots* is correct. **Only the capture half is false.** Do not "simplify" by deleting the true half.

## Scope

1. **Rename the rule so its id stops asserting a falsehood.** Change the rule id `wrangle_capture_unreachable` to `wrangle_capture`. Keep the `rule(...)` shape and its `'AgentGameAdapter'` consumer argument **unchanged**.
2. **Make the consequence prose true.** Replace the `consequence` string so it no longer says machines are uncapturable. It must keep the two facts that ARE true — exhausted machines take no damage, and they hold spawn slots — and state that capture is reached through the standing-order `CAPTURE` verb rather than through a tool. Derive every clause from a line you can point at (`StandingOrders.ts:28`/`:349`, `AtomicSocket.ts:30–31`, `wrangle_exhausted`'s `stopsTakingDamage`). **Do not invent a range, cost, cooldown or target rule** — `AtomicSocket.ts:32` says the socket adds none, and neither may this row.
3. **Fix the comment that justified the lie.** Rewrite the `"The load-bearing one."` comment block so it no longer claims a machine can be neither killed nor captured, and no longer claims the epoch's loop cannot close from the agent surface. Preserve its still-true point: the row is stated explicitly rather than omitted, because a silent omission would read as "nothing more to know here". Cite the closing measurement (`9f920a2f6`, 97–99% absorption) in one clause.
4. **Update the census pins — all FIVE sites, and keep the arrays sorted.** `e2e/er01-e6-census.spec.ts` names `wrangle_capture_unreachable` at `:11`, `:13`, `:14`, `:15` (the per-contract expected rule-id lists, for `e6-glow-mesa`, `e6-showroom`, `e6-half-life-hollow`, `e6-picnic`) and at `:126` (the `captureRule` lookup). Update every one to the new id. **These lists are alphabetically sorted today — `wrangle_capture` sorts before `wrangle_exhausted`, so the position does not change, but verify rather than assume.** The assertions at `:127–:128` (`aliveCap`, `consumerLever`) must keep passing untouched.
5. **REPORT, DO NOT EDIT — the `agentOperations: []` field.** The authoring fire measured a genuine ambiguity and is deliberately NOT ordering a change. The rule's named consumer is `AgentGameAdapter`, which is the type at `src/agent/ToolSurface.ts:84–95` — and that type carries **no** capture member (its ops are `metaProgress`, `diagnostics`, `economyLog`, `standingOrders`, `placeBuilding`, `panAt`, `repair`, `chaseMark`, `collectXp`, `collectGold`). So `agentOperations: []` may be **true for its own consumer** even though capture is plainly reachable — the adapter exposes `standingOrders` at `:88`, and the CAPTURE verb lives on that channel. **Leave the field exactly as it is.** Read both surfaces and write into your report which reading you think `agentOperations` should carry — tool-surface-only, or every agent-reachable channel — and the evidence for it. ⚠️ This is the SAME unresolved question `tasks/f2078-1-deepwater-manifest-truth-pass.md` scope 6 raised for `deepwater_levers_unreachable`; that runner's reading was never recorded in the review, so state yours plainly. It is a measurement, not an edit.

**No new guard is added, deliberately.** A generic "an admitted contract must ship no `_unreachable` rule" guard would red on `deepwater_levers_unreachable`, which scope 5 shows may be correct — and a guard that fires on the correct case gets excused into uselessness within a week (the `cross-engine` label's fate, F-1460-1). Do not add one.

## Firewall

Touch ONLY: `src/agent/MechanicsManifest.ts`, `e2e/er01-e6-census.spec.ts`.

NO changes to: `src/agent/StandingOrders.ts` · `src/agent/ToolSurface.ts` (scope 5 READS both) · `src/sim/AtomicSocket.ts` · `src/systems/WrangleSystem.ts` · `src/sim/HeadlessContractSim.ts` · the `agentOperations` field (scope 5 is report-only) · the `deepwater_*` rules and `e2e/er01-e5-census.spec.ts` · `wrangle_wind_down` / `wrangle_exhausted` / `wrangle_pen` rules · any sim semantics, balance value or event-log shape · `artifacts/**` (the runs.jsonl is EVIDENCE — read it, never regenerate it) · `scripts/**` · `tasks/**` · `package.json` · any other file under `src/`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/er01-e6-census.spec.ts --workers=1` green, desktop AND mobile projects, run SERIALLY (one command per project, never concurrently — §3.1).
- `grep -Fc "uncapturable" src/agent/MechanicsManifest.ts` must return **0** when you are done. Paste the number.
- `grep -Fc "wrangle_capture_unreachable" src/agent/MechanicsManifest.ts e2e/er01-e6-census.spec.ts` must return **0** for both files. Paste both.
- `npm run test:node-guards` green (this task touches `src/agent/`, and `scripts/citation-title-guard.mjs` + `scripts/same-game-report-guard.test.mjs` live in that battery). **Run it ALONE** — it is ~181 s and contends with any concurrent battery. ⚠️ **KNOWN-RED, PRE-DECLARED:** `node-guards-contention` reds whenever another session holds a `run-node-guards` process (F-1606-1 / F-2080-1 — it counts observers as batteries). If that is your ONLY failure, proceed and say so. Treat anything else as yours.
- Zero console/page errors in the playwright runs.

No screenshots required: this task renders nothing. Do not regenerate `artifacts/**`.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + report (a) the new rule id and the exact `consequence` string you wrote, with the source line each clause came from; (b) the four grep counts named in the self-check; (c) your scope-5 reading of what `agentOperations` should mean, with evidence; (d) anything adjacent you noticed and did NOT touch.
