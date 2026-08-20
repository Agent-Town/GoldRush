# Task f2078-1: make the deepwater agent-facing manifest tell the truth after re-admission (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2078, from F-E5AC-1 in `reviews/e5-admission-completion.md:17` (2026-08-20).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.
READ FIRST: `AGENTS.md`; `reviews/e5-admission-completion.md` (the drain that created this defect — read its Findings section); `src/agent/MechanicsManifest.ts` lines 288–307; `src/sim/HeadlessContractSim.ts` lines 73–110.

SEQUENCING LAW: this task depends on the E5 admission completion merge. Verify it is present before doing anything:
`git log --oneline | grep -q 'E5 admission completion'` — if that returns non-zero, STOP and report "E5 admission completion not landed". Do NOT gate on `git log -N` with a small N; search the whole log.
Also verify the lane actually carries it: `git merge-base --is-ancestor 26a364bfee4907fac6f1a96449e93adabf1dce61 HEAD` must succeed. If it does not, STOP and report "lane stale — refresh required" rather than improvising.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-E5AC-1, `reviews/e5-admission-completion.md:17`, dated 2026-08-20)

The finding, verbatim: *"the `deepwater_boss_socket_absent` rule still ships a blocker/consequence that are now FALSE (boss constructs; the contract secures headless). Agent-facing lie; cosmetic siblings ... One small truth-pass master."*

Merge `26a364bfe` re-admitted `e5-deepwater-claim`. Every fact below was re-verified at source by the authoring fire on main at `e434ff43d` — quote these coordinates back if any of them no longer hold, and STOP rather than improvise:

- `src/agent/MechanicsManifest.ts:293` emits `rule('deepwater_boss_socket_absent', 'DredgeQueenBossSystem', …)` carrying `blocker: 'labelSprite/counterSprite call document.createElement from instance field initializers'` and `consequence: 'the contract has no reachable secure condition headlessly'`.
- **Both strings are now false.** `src/systems/DredgeQueenBossSystem.ts:724` and `:739` open `counterSprite()` / `labelSprite()` with `if (typeof document === 'undefined') return new THREE.Sprite();`, so no `document.createElement` runs headlessly. And the drain's own evidence records the contract securing at wave 12, deterministic ×2 on both seeds (`fnv1a32:fa3f9ff0` / `b6ece25d`) — a reachable secure condition.
- The comment at `src/agent/MechanicsManifest.ts:290–292` is false in the same way: it says the wreck-field consumer *"cannot exist outside a browser — so the row names the gap instead of dressing the data up as coverage."* The gap is closed; the justification no longer justifies.
- `src/sim/HeadlessContractSim.ts:73` `CONTRACT_ADMISSION_EXEMPTIONS` now holds **7** entries and `e5-deepwater-claim` is NOT among them (`e5-stillwater` deliberately retained). The `.filter` at `:106` therefore puts `e5-deepwater-claim` into `SUPPORTED_CONTRACTS`.
- Because of that, `admissionProbe` is a **no-op** for this contract: `src/sim/HeadlessContractSim.ts:353` reads it only inside `if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode && boot.admissionProbe !== true)`.
- `e2e/ap16-8-admission-probe.mjs:3` still hardcodes the **old 8-entry** exemption list, including `'e5-deepwater-claim'`. This is NOT cosmetic: line 28 asserts `assert.equal(row.lawful, false)` for every contract in the list, and an admitted deepwater run under the `scripted` policy can now secure lawfully. Anyone running this probe by hand gets an assertion failure that reads like a deepwater regression when it is really a stale list. The probe is rooted in no battery (`grep` of `package.json`/`scripts/` finds no caller), which is exactly why nothing caught it.

## Scope

1. **Make the boss-socket rule truthful.** In `src/agent/MechanicsManifest.ts`, the rule currently emitted at `:293` must stop asserting an absent socket. Rename the rule id from `deepwater_boss_socket_absent` to `deepwater_boss_socket` and replace the `blocker`/`consequence` keys with keys that describe what the consumer now does. Keep the existing truthful fields (`wreckSites`, `eras`, `bossWave`) and keep the `rule(...)` shape and its `'DredgeQueenBossSystem'` consumer argument unchanged. The replacement facts must be **derived from the consumer, not invented**: state that the boss constructs headlessly and that the contract has a reachable secure condition. Do not add a field you cannot point at a line of `DredgeQueenBossSystem.ts` for.
2. **Fix the comment that justified the lie.** Rewrite `src/agent/MechanicsManifest.ts:290–292` so it no longer claims the consumer cannot exist outside a browser. Preserve its still-true point — vocabulary comes from consumers, never from raw `tileParams` data.
3. **Update the census pin.** `e2e/er01-e5-census.spec.ts:58` lists `'deepwater_boss_socket_absent'` inside `EXPECTED_SOCKET_RULES`. Update it to the new id and **keep the array alphabetically sorted** (it is sorted today). This array is asserted by the test titled `` `${contract.id} census admission is explicit` `` (`e2e/er01-e5-census.spec.ts:66`).
4. **Derive the probe's default list instead of hardcoding it.** In `e2e/ap16-8-admission-probe.mjs`, replace the hardcoded 8-id default at `:3` with the keys of `CONTRACT_ADMISSION_EXEMPTIONS`, read from the module the file already loads (`vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts')` at `:6`). You will need to move the default-resolution below that load; an explicit `process.argv` contract list must still win. Sort the derived ids so the run order stays deterministic. **This is the durable half of the task**: a hardcoded copy of something the source already knows is a defect waiting for the next admission change.
5. **Drop the dead `admissionProbe` flag.** `e2e/ap16-7-epoch-levers.spec.ts:20` passes `admissionProbe: true` for `e5-deepwater-claim`, which is now inert per the `:353` predicate above. Remove that option from that construction only. The test titled `'E5 and E6 epoch levers reach their existing socket laws'` (`e2e/ap16-7-epoch-levers.spec.ts:4`) must still pass unchanged in every other respect.
6. **REPORT, DO NOT EDIT — the sibling rule.** `src/agent/MechanicsManifest.ts:302` emits `deepwater_levers_unreachable` with `agentOperations: []` and `reason: 'no boat-build or reanchor verb exists on the agent tool surface'`. The authoring fire measured a genuine ambiguity and is deliberately NOT ordering a change: `src/agent/StandingOrders.ts:29–30` **does** carry `BOAT_BUILD` and `REANCHOR` verbs (validated at `:561–569`), but the rule's named consumer `AgentGameAdapter` is the type at `src/agent/ToolSurface.ts:84`, and `ToolSurface.ts` carries no such verb — so the rule may still be true *for its own consumer* while its prose reads over-broad. **Do not change this rule.** Instead, read both surfaces and write into your report which reading you think is correct and why. This is a measurement, not an edit; curing an over-broad generalisation by generalising again is the failure being avoided.

**No new guard is added, deliberately.** Scope 4 removes the class structurally for the file that had it, which is stronger than asserting it. A generic "an admitted contract must ship no `_absent`/`_unreachable` rule" guard would red on `deepwater_levers_unreachable`, which scope 6 shows may be correct — and a guard that fires on the correct case gets excused into uselessness within a week (the `cross-engine` label's fate, F-1460-1). Do not add one.

## Firewall

Touch ONLY: `src/agent/MechanicsManifest.ts`, `e2e/er01-e5-census.spec.ts`, `e2e/ap16-8-admission-probe.mjs`, `e2e/ap16-7-epoch-levers.spec.ts`.

NO changes to: `src/sim/HeadlessContractSim.ts` (in particular do NOT edit `CONTRACT_ADMISSION_EXEMPTIONS` — scope 4 READS it) · `src/systems/DredgeQueenBossSystem.ts` · `src/agent/StandingOrders.ts` · `src/agent/ToolSurface.ts` · the `deepwater_levers_unreachable` rule (scope 6 is report-only) · any sim semantics, balance value or event-log shape · any existing e2e assertion beyond the four edits named in scope · `scripts/**` · `tasks/**` · `package.json` · any other file under `src/`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/er01-e5-census.spec.ts --workers=1` green, desktop AND mobile projects, run SERIALLY.
- `npx playwright test e2e/ap16-7-epoch-levers.spec.ts --workers=1` green, both projects.
- `node e2e/ap16-8-admission-probe.mjs` runs to completion with no assertion failure, and its emitted rows cover exactly the 7 current exemption ids. Paste the id list you actually resolved into your report — if it is not 7 ids and does not match `CONTRACT_ADMISSION_EXEMPTIONS`, STOP and report rather than adjusting the assertion.
- `npm run test:node-guards` green (this task touches `src/agent/`, and `scripts/same-game-report-guard.test.mjs` + `scripts/citation-title-guard.mjs` both live in that battery). Run it ALONE — it is ~181 s and contends with any concurrent battery.
- Zero console/page errors in the playwright runs.

No screenshots required: this task renders nothing. Do not regenerate `artifacts/**`.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + report (a) the exact new rule id and the fields you gave it, with the `DredgeQueenBossSystem.ts` line each fact came from; (b) the 7 ids the probe resolved; (c) your scope-6 reading of `deepwater_levers_unreachable`, with the evidence for it; (d) anything adjacent you noticed and did NOT touch.
