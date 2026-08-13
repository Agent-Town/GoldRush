# Task F-1742-1: release headless heroes from landmark starts (LANE-D, commit prefix `fix:`)

**FIRE-AUTHORED s1744 (attended review welcome).**
**CODEX: model=gpt-5.6-sol effort=high**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` at F-1742-1; `reviews/f1742-1-headless-landmark-depenetration-diagnosis.md`; `src/sim/HeadlessContractSim.ts` at the `Hero.update` call in `step`; `src/game/Game.ts` at `updateActors`; `src/world/LandmarkCollision.ts` at `depenetrateFromBlockers`; `scripts/gr-sim.test.mjs` at its terminal outcome pins.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

SEQUENCING LAW: `grep -Fc 'F-1742-1 root cause: HeadlessContractSim omits the browser landmark depenetration callback.' reviews/f1742-1-headless-landmark-depenetration-diagnosis.md` must print `1`; `grep -Fc 'this.hero.update(STEP_SECONDS, IDLE_INTENTS, { bounds: Terrain.bounds, sample: Terrain.sample });' src/sim/HeadlessContractSim.ts` must print `1`; `grep -Fc "test('hero and enemies escape a run landmark center within bounded ticks'" e2e/never-trap.spec.ts` must print `1`. Any other result means the evidence, subject, or browser reference moved: STOP and report, do not guess.

## Why

F-1742-1 is root-caused and its lever was run before this task was authored. Long Road starts the hero at `(-180, 0)` inside the `convoy-lead-hauler-start` blocker; Gusher County starts the hero at `(0, -4)` inside `county-camp-rig`. The browser already passes `Hero.update` a `depenetrateFromBlockers` callback over landmark blockers. The headless sim passes only `bounds` and `sample`, leaving the idle hero at the solid's center while enemies stop at its perimeter.

An in-memory browser-parity probe released both heroes and made both seeds die deterministically. Dust Flats 01 and Boneyard 01 stayed byte-identical. The exact table and hashes are in `reviews/f1742-1-headless-landmark-depenetration-diagnosis.md`.

## Scope

1. Give the headless `Hero.update` call the same landmark-depenetration callback the browser already uses: `depenetrateFromBlockers`, `Terrain.landmarkBlockers()`, `Balance.hero.radius + 0.08`, and the callback's `maxDistance`. Reuse the existing helper directly; add no wrapper or new abstraction.
2. Add one focused contract test to `scripts/gr-sim.test.mjs`, titled **`headless landmark starts release before enemies can stall at the perimeter`**. It must run both frozen seeds for both affected contracts and pin at least the terminal wave, kills, and event hash from the review: Long Road 01/02 die at wave 4 with 41/48 kills and hashes `fnv1a32:2b27b21d`/`fnv1a32:37ab9177`; Gusher County 01/02 die at waves 5/2 with 93/29 kills and hashes `fnv1a32:95f5777c`/`fnv1a32:a9b7d153`. It must also prove each hero leaves its declared blocker-centered start before terminal. Determinism is mandatory: each seed runs twice and the terminal outcomes match byte-for-byte.
3. Run the existing generated null-floor check unchanged. All 41 existing floor anchors, including Dust Flats and Boneyard, must remain byte-identical. Any existing-anchor drift is a STOP and a finding; do not re-pin it in this slice.
4. Keep AP-15 banking separate. Do not add Long Road or Gusher County to bench seeds or null-floor anchors here; this corrective only restores honest headless combat contact.
5. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY:

- `src/sim/HeadlessContractSim.ts`
- `scripts/gr-sim.test.mjs`

NO changes to contract JSON, landmark collision data, `Game.ts`, `Hero.ts`, `Enemy.ts`, routing, balance, damage, spawn rules, admission exemptions, bench seeds, null-floor anchors, any e2e assertion, package scripts, dependencies, tasks, specs, docs, reviews, artifacts, or generated screenshots.

## Self-check

Run serially; do not overlap the full node battery with another gate:

- `node --test --test-name-pattern='headless landmark starts release before enemies can stall at the perimeter' scripts/gr-sim.test.mjs`
- `node scripts/null-floor-anchors.mjs --check`
- `node --test scripts/gr-sim.test.mjs`
- `npm run test:node-guards`
- `npx tsc --noEmit`
- `npm run build`
- `npx playwright test e2e/landmark-collision.spec.ts e2e/never-trap.spec.ts e2e/menu-safe-params.spec.ts --workers=1 --grep="authored footprints|enemy blocker routing|hero and enemies escape|town3dPilot=all boots"`
- `git diff --check`
- `git diff --name-only main...HEAD` lists exactly the two firewall paths.

End with `READY-FOR-GATES` and report the four pinned affected outcomes, the 41-anchor unchanged control, the focused/full node counts, the desktop/mobile Playwright counts with zero console/page errors, and the exact two-file diff.
