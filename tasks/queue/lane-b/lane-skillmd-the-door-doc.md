CODEX: model=gpt-5.6-sol effort=high

# lane-skillmd-the-door-doc — skill.md becomes the complete, source-locked door document

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). Commit prefix `door:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/b`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/b origin/main` ONLY when clean. SAFE-DUPE: `wc -c public/skill.md` — if it already exceeds 4000 bytes with a grammar section, STOP and report.

## WHY (owner, verbatim, 2026-08-06)
"we could also test Hermes, OpenClaw, QM, and Prime Agent and so on... But we should make it scientific. So if we need to adjust things (which I hope we don't? Our skill.md should be sufficient?)..." — MEASURED same day: the public skill.md is **435 bytes of submission metadata**. It is not sufficient; the verb grammar exists only in `src/agent/StandingOrders.ts`, and the attended seeding session had to embed it by hand (and got the replace-semantics WRONG on the first pass — the exact rot this task prevents). The owner's assumption becomes the enforced standard: **a code-capable harness given ONLY skill.md + a model key plays with zero adaptation** (AP-10d THE SUFFICIENCY GATE).

## READ-FIRST
1. `specs/agent-play/ap-10d-harness-ablation.md` — THE HARNESS BENCH section; its sufficiency gate is your acceptance.
2. `src/agent/StandingOrders.ts` (the StandingOrder union + BuildCondition) + `src/game/buildables.ts` (BuildableId) — the grammar's source of truth.
3. `scripts/gr-sim.mjs` — the transport truth (args, view-per-line, orders-per-line, outcome-last, wave ceiling, rejection lines on stderr).
4. `scripts/seed-ladder.mjs` — the reference loop incl. the two documented traps (submit REPLACES the whole order set; [] wipes).
5. `src/sim/HeadlessContractSim.ts` view/outcome shapes · `assets/contracts/bench-seeds.json` · `functions/api/standings.ts` POST contract (keys, secured-only, bench-seed law, stack fields).
6. The current 435-byte `public/skill.md` — KEEP its submission-metadata paragraph (it stays true), grow around it.

## SCOPE
1. Rewrite `public/skill.md` as THE DOOR DOCUMENT, agent-first prose, sections: WHAT THIS IS (the county, species-blind) · THE DOOR (clone/run gr-sim, exact command lines, the NDJSON loop) · THE VIEW (schema tour: stablePrefix/appendLog/now/almanac — field meanings, not exhaustive dumps) · THE GRAMMAR (every verb form verbatim-from-source with its JSON shape; buildables list; the REPLACE-SEMANTICS WARNING and the [] trap, prominent) · BENCH SEEDS (per-contract lists + the sealed/bench law) · SUBMITTING A STANDING (POST shape, secured-only, self-declared stack incl. cost fields — fold the existing 435 bytes here) · HONESTY LAWS (self-identification, thin-adapter law, full-setup principle).
2. **THE ROT GUARD (the load-bearing half):** `scripts/skillmd-guard.test.mjs`, wired into `npm run test:node-guards` — parses `StandingOrders.ts` + `buildables.ts` + `bench-seeds.json` and FAILS if skill.md's grammar section, buildables list, or seed lists disagree with source. Prove it by manufacturing a defect (mutate a copy, guard reds, restore) per the s1299/s1455 standard.
3. skill.md ships in the build (verify the deploy path serves the new file at /skill.md and /goldrush/skill.md — it already serves the old one, so this is likely free; confirm, don't assume).
4. One e2e assert (extend an existing suite or a tiny spec): the served skill.md contains the grammar section marker + the replace-semantics warning — so a stale deploy is visible.

## TOUCH-ONLY
`public/skill.md` · `scripts/skillmd-guard.test.mjs` · `package.json` (test:node-guards wiring only) · the one e2e assert · `tasks/BACKLOG.md` (goal-leaf, same commit).

## NO
Grammar/sim/verb changes (document what IS; gaps you find are finding-stubs) · standings API · seed-ladder.mjs · marketing tone (agent-first, terse, complete — a rig reads this, not a landing page).

## SELF-CHECK
tsc clean · build green · `npm run test:node-guards` green INCLUDING the new guard (count reported) · the manufactured-defect proof in your report · e2e assert green both projects · zero console errors.

READY-FOR-GATES. Report: skill.md byte count before/after, the guard's defect-proof transcript, any grammar/doc mismatches found (as stubs).
