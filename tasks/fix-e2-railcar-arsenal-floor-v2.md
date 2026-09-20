# Task fix-e2-railcar-arsenal-floor-v2: make the E2 railcar beatable WITHOUT cheating (MAIN slot, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; `specs/epoch-saga/e2-railcar-pressure-socket.md` (RATIFIED); `reviews/*f1741*` / the s1741 rejection findings F-1741-1..5; `src/game/Game.ts:1344-1358` (arsenal gate); `src/sim/HeadlessContractSim.ts:71-92` (E2 exemptions); `scripts/door-admission-baseline.json` (the ratchet the exemption-removal must update).

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE factory-churn — STOP and report if so. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, `.png` — never a STOP. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the FIRST candidate was REJECTED — this corrects it, per §7.5 changed-premise)
`fix-e2-railcar-arsenal-floor` built and the maps "secured," but s1741's independent review REJECTED it (F-1741-1..5, held at `e23fc5a00`, must NOT be re-drained) for cheating: it minted pressure ONLY in `HeadlessContractSim` (browser ≠ headless), broadly bypassed research (also unlocking `boiler_battery`), GLOBALLY multiplied the three pressure weapons' damage 6× and set all ranges to 20, and proved winnability with a DEBUG-CHEATED browser fight. This corrective must fix the railcar the HONEST way: same resources both engines, only the three named weapons, and a lawful economy proof BEFORE any balance change.

## Hard constraints (each is a rejection reason turned into a rule)
- **Identical resources both engines**: whatever unlocks the pressure arsenal on these three contracts must apply the SAME in the browser and in `HeadlessContractSim` — no headless-only minting. A human on `?contract=e2-hill-mine` and a headless agent must see the same arsenal availability.
- **Exactly the three named weapons**: grant ONLY `boilerLance`, `pressureMortar`, `skyRocket` on `e2-hill-mine`/`e2-trestle`/`e2-incline`. Do NOT unlock `boiler_battery` or anything else; do NOT broadly bypass research.
- **NO global balance change**: do NOT alter `Balance.steamworksArsenal` damage/range/cost globally. If the maps cannot be secured with unmodified weapon stats, that is a FINDING, not a licence to buff.
- **Lawful proof only**: winnability must be a NON-`?debug`, lawful headless secure (real harvest → boiler → pressure → weapon fire → railcar down). A debug-cheated fight is not proof.

## Scope
1. **Prove the economy** (no code change first): run `node scripts/gr-sim.mjs --contract e2-hill-mine --seed <bench seed> --policy=idle` and with a competent deterministic player; measure whether, WITH the three weapons available and unmodified stats, the pressure economy (harvest/boiler/sustainment) can down the railcar. Report the measured pressure-per-wave vs weapon pressure-cost and the resulting damage-vs-railcar-HP.
2. **Grant the arsenal identically** — enable exactly the three weapons on the three contracts in BOTH engines (find the single shared gate, or apply the same per-contract predicate in `Game.ts` and `HeadlessContractSim` so they agree). Do NOT touch campaign unlocks elsewhere.
3. **Secure lawfully, or report the gap** — if step 1 shows the economy CAN sustain a secure, produce a deterministic lawful secure on each of the three maps (report waves + the byte-identical event-log hash on a re-run). **If the economy CANNOT sustain it with unmodified stats, STOP: write up the measured gap (pressure deficit / HP surplus) as a finding for an owner balance decision — do NOT buff to force a pass.**
4. **Re-admit + update the ratchet** (only if step 3 secured lawfully): remove the three `CONTRACT_ADMISSION_EXEMPTIONS`, update `scripts/door-admission-baseline.json`, `public/skill.md`'s door-contracts fence, and regenerate `assets/contracts/null-floors.json` for the three (confirm each null floor is `secured:false` — Law 2; the arsenal being AVAILABLE must not make an IDLE run win).

## Firewall
Touch ONLY: `src/game/Game.ts` (arsenal gate), `src/sim/HeadlessContractSim.ts` (matching gate + exemption removal in step 4), `scripts/door-admission-baseline.json`, `public/skill.md` (door-contracts fence), `assets/contracts/null-floors.json` (regenerated), `tasks/BACKLOG.md`. NO changes to: `src/game/Balance.ts` (no global balance change — if balance is needed, STOP and report), `e1-baron` or its medal-award path, the railcar entity damage model (`Enemy.ts`), other epochs, existing e2e assertions, sim determinism.

## Self-check
tsc + `npm run build` green. IF step 3 secured: the three E2 e2e specs + `ap16-4-contract-admission` + `er01-e2-census` green desktop+mobile; `npm run test:node-guards` green (incl. door-admission ratchet + skillmd-guard); adjacent `task-025`/`m1-01`/`m2-01` green both projects; each map's lawful (non-debug) secure screenshotted to `artifacts/e2-railcar-v2/`; frame p95 in budget; zero console errors. IF step 3 stopped at the economy gap: report the measured numbers, make NO source changes beyond step 2's identical-grant, and leave the exemptions in place.
End: READY-FOR-GATES + report: economy measurement, the grant mechanism (proving browser==headless), per-map lawful secure waves + hashes OR the measured economy gap, and (if secured) exemptions removed + ratchet updated.

## No-op / honesty guard
Do NOT reproduce the rejected candidate's shortcuts. If tempted to buff damage/range or mint headless-only pressure to force a pass, STOP and report the gap instead — the rejection exists precisely because that path was taken once.
