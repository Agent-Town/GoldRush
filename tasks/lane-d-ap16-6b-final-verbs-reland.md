# Task AP-16-6b: re-land the final verbs with one cooldown, one rush, every door (LANE-D, commit prefix `fix:`)

**FIRE-AUTHORED s1694 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

## This is a corrective re-land, not a fresh build

AP-16-6 was implemented and gated but **not merged**. Its exact runner output is preserved at `save/ap16-6-s1694-6f928266`, tip `6f92826659e14261e83963aab30baceef7038b64`. Read its one-commit diff first:

```sh
git diff 6f92826659e14261e83963aab30baceef7038b64^ 6f92826659e14261e83963aab30baceef7038b64
```

Reuse that implementation on fresh main; do not re-derive its grammar, audit rows, public documentation, or hash-canonicalisation. The gate-side review is `reviews/ap16-6-final-verbs.md`. It carries six findings with reproductions. Your job is the smallest root-cause repair that makes the preserved slice honest.

## Pre-flight

The lane was deliberately reset only **after** the old tip was preserved on the salvage ref. A clean `ahead=0` lane is expected. If either command below disagrees, STOP and report:

```sh
git rev-parse save/ap16-6-s1694-6f928266
# must be 6f92826659e14261e83963aab30baceef7038b64
grep -Fc "AP-16-6 (the remaining verbs" specs/agent-play/ap-16-same-game-law.md
# must be 1
```

Then run the normal clean-lane pre-flight, install, and baseline build. **FACTORY-CHURN EXCEPTION (F-1407-1):** `logs/**`, `artifacts/**`, `reviews/shots-*`, and PNG evidence are discardable; tracked source/task/spec/review dirt is a STOP.

## Read first

- `AGENTS.md`
- `specs/agent-play/ap-16-same-game-law.md`, especially rules 2–3 and AP-16-6
- `reviews/ap16-6-final-verbs.md`
- `src/agent/StandingOrders.ts`, `src/agent/ToolSurface.ts`, `src/mp/AgentRiderBody.ts`
- `src/sim/HeadlessContractSim.ts`, `scripts/gr-sim.mjs`
- Browser twins in `src/game/Game.ts`: weapon selection, secure choice, upgrade/demolish, and megaproject funding
- The preserved AP-16-6 diff above

## Scope

1. **Re-land the preserved AP-16-6 surface.** Keep the three ratified verbs and four cited exemptions. Preserve every unchanged seed hash unless a named correction below genuinely changes its event stream; every moved pin needs before/after values and a cause at the pin site.

2. **F-1694-1 — one blast cooldown.** Automatic blast-mode fire and explicit `BLAST_AT` must share one authoritative readiness state. A submission containing `SET_WEAPON blast` and `BLAST_AT` with an enemy in range may launch exactly one charge during the cooldown, and `now.blastReadyInMs` must describe whichever path fired. Reuse CombatSystem/shooter state; do not add a parallel timer abstraction.

3. **F-1694-2 — runtime rush uses the overtime ceiling.** `gr-sim` must derive its ceiling from the sim's live secure choice, not only the startup flag. On one scripted seed, a normal CLI run that answers `SECURE_CHOICE rush` must match the same stream run with `--overtime`: no wave-12 `wave-ceiling`, identical terminal reason and event hash.

4. **F-1694-3 — the secure window is modal.** While `pendingSecure` is true, no build, harvest, blast, upgrade, demolish, fund, or movement action may execute. Accept and execute only a valid `SECURE_CHOICE`; reject a mixed or unrelated submission through the standard order rejection. The decision clock may advance, but sim time, enemies, waves, economy, works, and cooldowns remain frozen. Add one focused regression that proves at least economy, works, and blast count do not move across the window.

5. **F-1694-4 — bind every agent-door executor.** Browser-owned `AgentRiderBody` seats use a separate executor. Wire the final verbs and their live diagnostics through that existing adapter/executor seam, actor-specifically where needed. Do not use the headless singleton as shared mutable state. Prove a browser-owned seat can set its own weapon and perform a legal context action; prove secure choice follows the browser's existing ownership rule. If the existing ownership rule makes a non-host secure choice illegal, return the standard rejection and state that measured rule in the report—do not invent authority.

6. **F-1694-5 — make funding reachable in supported CLI use.** Reuse the already-added `HeadlessContractBoot.scienceSteps` input. Expose the smallest validated CLI input (`--science-steps <non-negative integer>`) and document it in the existing help; no localStorage shim and no new profile subsystem. A real `gr-sim` CLI test must reach and fund an unlocked stage at the browser's cost.

7. **F-1694-6 — report the real browser weapon.** `buildView` must read the local/requested actor's existing diagnostic weapon instead of defaulting every browser view to `rig`. Prove rig → blast → rig through the shared browser view. Do not change browser weapon behavior.

8. **Make the adjacent view contract truthful.** `e2e/agent-view.spec.ts` is already red on main because its byte snapshot predates expanded E1 buildables and `blastReadyInMs`; the preserved slice adds `weapon` and works entries. Re-record the exact current snapshot and keep the byte-equality assertion. No assertion deletion, masking, or partial-object downgrade. Both projects must end green.

9. **Regenerate, never hand-edit, the same-game report.** Preserve the AP-16-6 measured totals and exemption reasons unless a real door-path correction changes them. If totals move, report the precise row cause.

## Firewall

Touch ONLY the preserved AP-16-6 paths plus the proven correction seams:

- `src/agent/StandingOrders.ts`
- `src/agent/ToolSurface.ts`
- `src/agent/View.ts`
- `src/mp/AgentRiderBody.ts`
- `src/sim/HeadlessContractSim.ts`
- `src/game/Game.ts` only for adapter/diagnostic wiring; no gameplay tuning
- `scripts/gr-sim.mjs`
- `scripts/gr-sim.test.mjs`
- `scripts/same-game-audit.mjs`
- `scripts/same-game-audit.test.mjs`
- `docs/bench/same-game-audit.md` as generated output only
- `public/skill.md`
- `e2e/ap16-6-final-verbs.spec.ts`
- `e2e/agent-view.spec.ts`
- one new focused browser-seat spec only if the existing suites cannot express item 5

NO balance tuning, rankings/API changes, contract data changes, new abstractions, or unrelated cleanup.

## Self-check

- `npx tsc --noEmit`; `npm run build`.
- Full `npm run test:node-guards` alone: zero failures.
- AP-16-6, AP-16-3 blast, agent-view, agent-seat/browser-seat, task-025, m1-01, and m2-01 suites, both projects, `--workers=1`.
- Plain boot desktop + 390px: zero console/page errors.
- Reproduce each of F-1694-1 through F-1694-6 red before the repair, then green after it; paste the discriminating values, not only exit codes.
- Explicit-rush and `--overtime` CLI outcome/hash pair in the report.
- `node scripts/same-game-audit.mjs` regenerates `docs/bench/same-game-audit.md` byte-identically on a second run.

End with `READY-FOR-GATES` and a compact per-finding table. If any correction requires a design choice not settled by the existing browser path or the ratified Same-Game law, STOP and name that exact fork rather than stretching the rule.
