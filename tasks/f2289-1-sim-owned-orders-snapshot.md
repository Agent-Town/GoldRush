# Task f2289-1-sim-owned-orders-snapshot: hash a sim-owned standing-orders snapshot, never a late module lookup (lane-a, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `artifacts/f2289-1-20260825/diagnosis.md` (the diagnostic this cures, merged `8f545d60b`); `reviews/f2289-1-recorder-assayer-hash-divergence.md`; `artifacts/f2291-3-lever-proof/lever-probe-module-split.mjs` and its `lever-proof-output.txt` (**the arm is already proven — see Scope 4**).

SEQUENCING LAW: this builds on the f2289-1 diagnostic. Verify it landed before touching anything:
`git log --oneline | grep -q 'f2289-1-recorder-assayer-hash-divergence'` — search the WHOLE log, never `git log -N`. If absent: STOP and report "f2289-1 diagnostic not landed".

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-2289-1, diagnosed lane-a 2026-08-25, drained s2291 at `8f545d60b`)

The recorder and the assayer hash the same run to different values, and the county **refused one honest standing** because of it (measured: 115 retained tapes / 96 agree / 8 diverge / 11 unreplayable; only the raw heat-5b Hill tape both diverges *and* replays its claimed secure outcome exactly).

Root cause, from the merged diagnosis and **re-verified against current main while authoring this task**:

- `src/agent/StandingOrders.ts:124` — `let installedExecutor: StandingOrdersExecutor | null = null;`
- `src/agent/StandingOrders.ts:453-454` — `bindStandingOrders()` is its **only** assignment; nothing ever sets it back to null.
- `src/agent/StandingOrders.ts:477-478` — `snapshotStandingOrders()` returns `installedExecutor?.snapshot() ?? { needsRider: false, orders: [], log: [] }` — a **silent** fallback.
- `scripts/gr-sim.mjs:247` — `writeAgentTape()` performs a **late, independent** `vite.ssrLoadModule('/src/agent/StandingOrders.ts')`, then `scripts/gr-sim.mjs:260` hashes `agentOrdersEventLogHash(snapshotStandingOrders())`.
- `scripts/assay-replay-agent.mjs:127` and `:174` — the same late-lookup-then-hash pair.

The live `HeadlessContractSim` demonstrably **had** a bound executor (all 84 Hill submissions executed and produced the retained outcome), so the late lookup observed a **different SSR module singleton** than the one the sim bound. `fnv1a32:a45ba9ac` — the raw Hill recorder's claim — is exactly the hash of `{orders: []}`.

⚠️ **THE SAFETY CONDITION IS THE LOAD-BEARING PART OF THIS TASK, and it is measured, not assumed.** The lever proof shows a bound executor with **zero submissions** hashes to `fnv1a32:a45ba9ac` — **byte-identical to the fallback**. Therefore:
- Rejecting every empty log would be **WRONG** — an installed executor with genuinely no submissions is a legitimate empty log.
- Making the global `snapshotStandingOrders()` fallback throw would be **WRONG** — it could break benign pre-install view callers.

The cure must remove the *singleton identity ambiguity at the hashing boundary*, not widen those semantics.

## Scope

1. **Expose a sim-owned snapshot.** In `src/sim/HeadlessContractSim.ts`, add a method (suggested `standingOrdersSnapshot()`) that returns the standing-orders view **through the module instance the sim itself closed over at construction/binding time** — not a fresh import. Testable: calling it on a live sim returns the executor's real log while a separately re-instantiated module returns the fallback.

2. **Hash the sim-owned snapshot in the recorder.** In `scripts/gr-sim.mjs::writeAgentTape()`, replace the late `ssrLoadModule('/src/agent/StandingOrders.ts')` + `snapshotStandingOrders()` pair (`:247`, `:260`) with the sim-owned snapshot from Scope 1. The `sim` object is already a parameter of `writeAgentTape()` (`:244`).

3. **Hash the sim-owned snapshot in the assayer.** Same change in `scripts/assay-replay-agent.mjs` (`:127`, `:174`), using that path's own live sim instance.

4. **Add the regression, and root it.** New `scripts/standing-orders-module-split.test.mjs` that invalidates/re-instantiates the Vite module **between sim boot and tape write** and asserts the writer either retains the live snapshot **or fails closed** — never silently emits the legitimate-looking empty fallback.
   🔑 **THE ARM IS ALREADY PROVEN — DO NOT RE-DERIVE IT.** `artifacts/f2291-3-lever-proof/lever-probe-module-split.mjs` reproduces the split deterministically in seconds and prints `LEVER ARMED: true`. Its recipe: `vite.moduleGraph.getModuleById(<abs path to src/agent/StandingOrders.ts>)` → `vite.moduleGraph.invalidateModule(mod)` → `ssrLoadModule` again yields a **fresh module object** whose `snapshotStandingOrders()` returns `0` entries / `fnv1a32:a45ba9ac`, while the original module still holds the executor. **Copy that mechanism.**
   ⚠️ **The test MUST carry the control arm the proof carries**: a re-load with **no** invalidation must still see the live executor (proof: same module object, same hash). Without it the test can pass because nothing was ever bound — a vacuous green.
   ⚠️ **The test MUST also assert the safety condition**: a bound executor with zero submissions still produces a valid empty log and is NOT treated as a failure.
   🔓 **FIREWALL LIFT — `package.json`:** `test:node-guards` is an **explicit file list, not a glob** (verified while authoring), so a new test file is NOT auto-collected. Add `scripts/standing-orders-module-split.test.mjs` to the `test:node-guards` list. This lift exists because the scope item cannot otherwise be delivered.

5. **Prove the cure on the real casualty.** Re-run `node scripts/assay-replay-agent.mjs artifacts/gauntlet-heat5b-20260825/e2-hill-mine/attempt-10-tape.json` and report recorder-vs-replay hashes. Report the Night Shift control too (`artifacts/gauntlet-heat5b-20260825/e1-night-shift/attempt-1-tape.json`, which already agreed at `fnv1a32:889d9357` and **must still agree** — a cure that moves the control has broken something).

## Firewall

Touch ONLY: `src/sim/HeadlessContractSim.ts`, `scripts/gr-sim.mjs`, `scripts/assay-replay-agent.mjs`, the new `scripts/standing-orders-module-split.test.mjs`, and `package.json` (Scope 4's named lift, for rooting the test **only** — no dependency changes).

NO changes to:
- **`agentOrdersEventLogHash()` semantics** in `src/game/RunTape.ts` — the hash function is correct; its *input* was wrong. Changing it would invalidate every retained tape.
- **The global `snapshotStandingOrders()` fallback** (`src/agent/StandingOrders.ts:477-478`) — see the safety condition above.
- **Any retained tape under `artifacts/**`** — never rewrite recorded evidence.
- **County standings, admissions, or the re-admission of the refused Hill standing** — that is an owner/attended call and explicitly NOT in scope. Cure the mechanism; report what it would now hash.
- Sim semantics, existing e2e assertions, other tasks' fresh work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` and `npm run build` green.
- `node --test scripts/standing-orders-module-split.test.mjs` green, with **all three arms present**: armed (split → fails closed or retains), control (no invalidation → sees the executor), safety (bound + zero submissions → valid empty log).
- `npm run test:node-guards` green, run **ALONE** (it is ~530 s and contends on shared fixtures — never overlap it with another battery). Confirm the new test appears in its output.
- `node scripts/gr-sim.test.mjs`-covered suites and `scripts/assay-replay.test.mjs` unmodified-green.
- Scope 5's two replay results reported as a table: tape · claimed · replayed · outcome match.
- Zero console/page errors in any boot probe you run.
- Artifacts to `artifacts/f2289-1-cure-<date>/`.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: which module instance the sim now closes over, the three test arms' results, the two replay hashes from Scope 5, and whether the refused Hill standing would now hash to `fnv1a32:85cb8a01` (report only — do NOT re-admit it).
