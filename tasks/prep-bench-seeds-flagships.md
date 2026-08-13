# Task prep-bench-seeds-flagships: seed + floor the six idle-safe benchmark contracts, fix the stale census specs (MAIN slot, prefix "chore:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; the measured scoping in `.claude/cache/agents/scout/output-20260813-154934.md` (E4) and the E7/E8/E9 scout result (this session); `scripts/null-floor-anchors.mjs`, `scripts/null-floor-anchors.test.mjs`, `scripts/skillmd-guard.test.mjs`, `scripts/bench-seeds.test.mjs`; `specs/agent-play/ap-15-assay-of-minds.md` (Law 2).

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes — if any exist, STOP and report. Untracked `??` host debris is EXPECTED; list briefly, proceed.
FACTORY-CHURN EXCEPTION — ALWAYS EXPECTED, NEVER a STOP (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner directive 2026-08-13 + measured evidence)
Owner asked to queue benchmark-readiness work across the epochs. Six contracts are door-admitted but unseeded; this task adds ONLY their seed/floor/skill.md infrastructure and repairs the stale census specs — no gameplay, no exemption changes. **Law-2 constraint (AP-15 §Laws.2, enforced by `null-floor-anchors.test.mjs:48` which asserts `secured===false`):** a null floor that idle-secures is FORBIDDEN to land. All six chosen contracts were measured tonight to idle-DIE (secured:false). **DELIBERATELY EXCLUDED: `e4-long-road` and `e4-gusher-county`** — both idle-SECURE at wave 12 taking zero damage (a targeting anomaly, routed to the owner's desk separately); seeding them would red the guard.

## Scope
1. Add six keys to `assets/contracts/bench-seeds.json` (append after the last entry, minimal diff), each `["<id>-01","<id>-02"]`: `e4-dust-flats`, `e4-boneyard`, `e7-relay-valley`, `e8-mare-claim`, `e8-eclipse`, `e9-dome-basin`.
2. Regenerate floors: `node scripts/null-floor-anchors.mjs`, then `node scripts/null-floor-anchors.mjs --check` (must report all match, zero drift). Verify via `git diff assets/contracts/null-floors.json` that ONLY the six new contracts' rows were added and NO existing `eventLogHash` moved (if any moved → STOP, sim drift). **CRITICAL: every new row's `secured` MUST be `false` for both seeds. If ANY shows `secured:true`, STOP and report — do NOT land it (Law 2).**
3. Sync `public/skill.md`'s `<!-- skillmd-guard:seeds:start -->…:end -->` fence to byte-match the updated `bench-seeds.json` (`skillmd-guard.test.mjs:33-35` deepEqual). Do NOT touch the `door-contracts` fence.
4. Repair the three census specs (currently RED on main, pre-existing drift unrelated to admission — verify by running them first):
   - `e2e/er01-e7-census.spec.ts` (RED 4/4): the `expect(mechanics.buildables).toBeUndefined()` assertion (~line 49) now fails for every e7 id because `deriveMechanicsManifest()` returns the buildables registry. Loosen/remove that assertion uniformly with a citation to this task; and for `e7-relay-valley` specifically, restructure so it no longer asserts the constructor throws or that it lacks bench seeds — adopt the per-id branching pattern `e2e/er01-e8-census.spec.ts` already uses.
   - `e2e/er01-e8-census.spec.ts` (RED 2/4 on mare-claim + eclipse): pull those two admitted ids into a branch asserting they construct cleanly (`mechanics.rules` stays `build_zones`-only, bench seeds now defined) instead of `.toThrow(...)`. Do NOT touch the far-side/low-orbit rows (they pass — still correctly rejected).
   - `e2e/er01-e9-census.spec.ts` (RED 1/4 on dome-basin): pull dome-basin out of the final `.toThrow(...)` loop (mirror the existing `if (contract.id === 'e9-dome-basin')` special-case at ~line 133) with the opposite assertion. Do NOT touch the other three rows (they pass).
5. Append ONE finding to `tasks/BACKLOG.md` (mint the next F-ID): record the `e4-long-road`/`e4-gusher-county` idle-secure targeting anomaly (idle hero takes zero damage / never moves / secures wave 12, vs dies wave 2 on `e4-dust-flats` against the same `motor_gang`; blocks their seeding under Law 2; structurally similar to the `e6-showroom` false-green). REPORT-ONLY, do not fix.

## Firewall
Touch ONLY: `assets/contracts/bench-seeds.json`, `assets/contracts/null-floors.json` (machine-regenerated — do NOT hand-edit), `public/skill.md` (the `seeds` fence only), `e2e/er01-e7-census.spec.ts`, `e2e/er01-e8-census.spec.ts`, `e2e/er01-e9-census.spec.ts`, `tasks/BACKLOG.md` (append one finding).
NO changes to: any `src/**`; `src/sim/HeadlessContractSim.ts` `CONTRACT_ADMISSION_EXEMPTIONS` (add/remove nothing); any `assets/contracts/epoch-*/**` map content; `public/skill.md`'s `door-contracts` fence; `e4-long-road`/`e4-gusher-county`/any non-listed contract's seeds; the passing census rows named "do NOT touch" above; the `harvestAnchors`/`engineDependencies` of any blocked contract.

## Self-check (evidence, not vibes)
`node --test scripts/bench-seeds.test.mjs scripts/null-floor-anchors.test.mjs scripts/skillmd-guard.test.mjs` green; full `npm run test:node-guards` green. `npx tsc --noEmit` + `npm run build` green. `npx playwright test e2e/er01-e7-census.spec.ts e2e/er01-e8-census.spec.ts e2e/er01-e9-census.spec.ts --project=desktop-chrome --project=mobile-chrome` all green (were 4/4, 2/4, 1/4 red). Adjacent unmodified-green: `e2e/skillmd-door.spec.ts`, `e2e/ap16-4-contract-admission.spec.ts`, `task-025`, `m1-01`, `m2-01`, both projects. Pin against drift: the six `-01` seeds reproduce their measured hashes UNMOVED — e4-dust-flats-01 `fnv1a32:5d4aeff2`, e4-boneyard-01 `fnv1a32:717f1001` (E4 scout); the E7/E8/E9 `-01` hashes as regenerated (report them). Zero console/page errors.
End: READY-FOR-GATES + report each of the six contracts' BOTH seeds' `secured` outcomes (must all be false), the census specs' before/after pass counts, and the new F-ID.

## No-op guard
If any of the six seeds already exist, WRITE WHY and add only the missing ones. If a floor comes back `secured:true`, STOP and report — that contract is NOT seedable tonight (Law 2), do not force it.
