# Task fix-e2-railcar-arsenal-floor: grant the E2 pressure arsenal on the railcar contracts (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; `specs/epoch-saga/e2-railcar-pressure-socket.md` (the RATIFIED fix spec — this task builds it); `src/game/Game.ts:1353-1358` (the PressureArsenalSystem construction + its `hasBaronMedal()`/research/rocket-cart gates); `src/sim/HeadlessContractSim.ts:70-92` (the three F-E2S-3 exemptions to remove).

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/, scratch) is EXPECTED — list briefly, proceed.
**FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner directive, 2026-08-13)
Owner played the E2 railcar maps and could not beat the railcar; asked to fix it now, "as we are basically ready to release the first epoch." Diagnosed + owner-confirmed (verbatim: *"no, I did not have the weapons then"*): the railcar-killing pressure arsenal (`boilerLance`/`pressureMortar`/`skyRocket`, `PressureArsenalSystem.ts:7`) is unlock-gated behind the E1 Baron medal + captures (`Game.ts:1353-1358`), so a fresh run on `e2-hill-mine`/`e2-trestle`/`e2-incline` has NO weapon that touches the railcar (F-E2S-3 exemption text, `HeadlessContractSim.ts:71-92`). The railcar itself takes ordinary damage (`CombatSystem.ts:727,758`), so this is an availability floor, not a damage-path bug. Design ruling in the spec: a contract that fields the railcar must itself provide the means to beat it.

## Scope (each item independently testable)
1. **Reproduce the gate** — run `node scripts/gr-sim.mjs --contract e2-hill-mine --seed <an e2-hill-mine seed from assets/contracts/bench-seeds.json>` with a competent deterministic player; confirm it CANNOT secure because the pressure arsenal never activates (no railcar damage). Write the observed failure into the report. No code change in this item.
2. **Add the arsenal floor** — make the pressure arsenal (all three weapons) ACTIVE whenever the live contract is `e2-hill-mine`, `e2-trestle`, or `e2-incline`, regardless of Baron-medal / rocket-cart / research state. Minimal mechanism (e.g. a per-contract predicate OR'd into the existing enable/gate at `Game.ts:1353-1358`). DO NOT remove the campaign unlock — the medal/capture path must still grant the arsenal elsewhere; this only adds a floor on these three contracts. If a scope item can't fail a check, it isn't scope.
3. **Prove winnability** — a competent deterministic player secures each of `e2-hill-mine`, `e2-trestle`, `e2-incline` headless via gr-sim; report the wave counts. If grant-alone does NOT secure (railcar too tanky / pressure starvation), tune `src/game/Balance.ts` `steamworksArsenal` (or the railcar component HP) to a sane wave count and report exactly what changed.
4. **Re-admit at the door** — remove the three `CONTRACT_ADMISSION_EXEMPTIONS` entries (`e2-hill-mine`/`e2-trestle`/`e2-incline`) in `HeadlessContractSim.ts`; if `public/skill.md`'s door-contracts block changes, regenerate it so `scripts/skillmd-guard.test.mjs` stays green.

## Firewall
Touch ONLY: `src/game/Game.ts` (arsenal enable/gate), `src/game/Balance.ts` (steamworksArsenal, only if §3 balance is needed), `assets/contracts/epoch-2-steamworks/contracts.json` (only if a per-contract flag is the chosen mechanism), `src/sim/HeadlessContractSim.ts` (exemption removal), `public/skill.md` (door-contracts block only if it changes), and E2 e2e specs ONLY to ADD coverage.
NO changes to: `e1-baron` or its medal-award path; the railcar entity's damage model (`src/entities/Enemy.ts`); any other epoch's contracts or exemptions; sim determinism/semantics beyond arsenal availability; existing e2e assertions (do not weaken them); any file not listed above.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green. `e2-hill-mine`/`e2-trestle`/`e2-incline` each secure headless (report the wave counts). The E2 e2e specs (`e2e/e2-hill-mine.spec.ts` and siblings) + `e2e/ap16-4-contract-admission.spec.ts` green desktop+mobile. `npm run test:node-guards` (incl. skillmd-guard) green. Adjacent `task-025` + `m1-01` + `m2-01` unmodified-green both projects. Zero console/page errors. Screenshots of each map at secure → `artifacts/e2-railcar-arsenal/`. Frame p95 within budget.
End: READY-FOR-GATES + report: the §1 repro (no-arsenal failure), the arsenal-floor mechanism you chose, per-map secure wave counts, whether/what balance tuning was needed, and the exemptions removed + skillmd-guard status.

## No-op guard
If you find the arsenal floor already works or the exemptions are stale (the maps already secure with no code change), WRITE WHY into the report, remove the exemptions, and report — do not exit silently.
