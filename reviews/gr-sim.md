# Review — `lane-gr-sim` (AP-07's prerequisite: the headless contract runner)

- **Slice:** `lane-gr-sim.md` — GR-SIM, a browser-free node CLI that boots a contract by id+seed, speaks THE VIEW / STANDING ORDERS over NDJSON, and exits with an outcome JSON.
- **Branch / tip:** `lane/m3` @ `003ed46c` (`runner(lane-a): lane-gr-sim.md`, auto-committed by the runner 15:16:04; Codex itself reported "No commit was made" — that is the documented runner-auto-commit split, not a lost diff).
- **Base:** `7307d588` (merge-base main↔lane/m3).
- **Drained:** s1260 fire, 2026-07-30.
- **Verdict:** **ACCEPT — merged.** The master's stated gate (scope 4, determinism) reproduces byte-for-byte on merged main, the firewall holds, and every browser-facing edit is provably dead code in a browser.

## What it does

`scripts/gr-sim.mjs` boots `src/sim/HeadlessContractSim.ts` (new, 475 lines) through `vite.ssrLoadModule` — no `WebGLRenderer`, no DOM ownership — and steps the production simulation systems at a fixed 1/30 s timestep. At every wave boundary and surprise it emits one line of `goldrush.view.v1` JSON on stdout; it reads standing-orders JSON arrays on stdin, one per line; on termination it prints `{secured, waves, timeMs, gold, kills, calls, eventLogHash}`. `--policy=idle` runs orderless as a baseline without waiting on stdin. It **fails closed** for any contract other than `e1-dry-gulch` — adding another requires that contract's real objective driver, which is the correct refusal rather than a fabricated one.

This is the §4.6 sim/render separation finally cashing in: the law said the sim is planar and deterministic with rendering strictly separate, and this slice proves it by running the sim blind.

## Evidence (ALL re-measured on merged main — the lane's numbers were not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.23 s**, 2,164 modules, asset-diet gate pass |
| **DETERMINISM (the master's scope-4 gate)** | **BYTE-IDENTICAL.** Run A and Run B both 7 lines / 13,678 bytes / `sha256 63f42fac6a07b14666d885627dd37508bd30eab6babb68477e829943314129f5` — **the same hash the lane reported, reproduced on a different tree.** Outcome both runs: `{"secured":false,"waves":4,"timeMs":135667,"gold":4,"kills":37,"calls":5,"eventLogHash":"fnv1a32:3d75c580"}` |
| Headless speed | 4 waves in ~3.1 s wall ≈ **1.29 waves/s** on a loaded box (lane measured 1.57–1.61 quiet). Reported honestly: lower than the lane's, same order, RL-viable. |
| `test:node-guards` | **159/159 across 29 guard files — DERIVED, not inherited:** s1259 measured 158/28, and `gr-sim.test.mjs` adds exactly 1. The lane's own "157" differs from mine by precisely the 2 tests in `findings-state-guard.test.mjs` that main added and the lane lacked — independent arithmetic confirmation that the `package.json` graft is the correct union. |
| `scripts/test-ticker-stats.mjs` | pass (the node-guards tail) |
| `scripts/findings-state-guard.mjs` | **PASS**, `double-state : 0` |
| Core browser trio (`m1-01`, `m2-01`, `m3-01`) | **30/30**, desktop + mobile-390, 59.1 s |
| Release suite (`playwright.release.config.ts`) | **26/26, 1.2 m, DEFAULT workers** — the canonical loaded arm s1258 established, stronger than the lane's `--workers=1`. F-1180-2 did not fire. |
| Boot probe (`profile-first-boot.spec.ts`) | **12/12**, desktop + mobile-390, 12.1 s, zero console/page errors |
| Screenshots | **none owed, and that is not a gap** — the slice renders nothing and provably changes no browser pixel (see below). |

### The 17 "inherited" reds — confirmed pre-existing by TWO independent means

The run reported the exhaustive `m1-*`/`m2-*`/`m3-*` board at 205/222 and argued the 17 failures were inherited. I did not take its word, and I did not re-run 222 tests either:

1. **Import-graph guarantee (decisive).** `grep -rn HeadlessContractSim src e2e scripts` returns exactly 3 hits: its own definition at `src/sim/HeadlessContractSim.ts:76` and two in `scripts/gr-sim.mjs:32-33`. **Zero `src/` and zero `e2e/` importers** — the new 475-line sim is unreachable from browser code, so it cannot red a browser test.
2. **The house's own red ledger already names every family.** `logs/suite-red-inventory.md` mentions `m1-06-level-up-choices` ×29, `m2-07b-building-incentive-tune` ×11, `m2-06-arsenal-blast-charge` ×11, `m2-07-base-self-hold` ×7, `m2-03-wave-scheduler` ×7, `m1-03-wave-pressure` ×7, `m2-05b-overwhelm-valves` ×2, `m2-04-gold-stealing` ×2 — all eight families the run listed.

**A control-flow guarantee beats a reported measurement**, and here we have one on top of a ledger match.

## Merge classification

Base `7307d588`. The lane commit `003ed46c` touches **12 files, +695/−1**. The 3-dot diff `main...lane/m3` is misleading — it also carries `dd08bc1a` (herald engravings), which **s1257 already merged as `8133dd91`**, so 15 extra paths appear that are not this slice's. Classified per-file against the base:

- **11 of 12 — main untouched since base → clean apply:** `artifacts/gr-sim/ap-07/{report.md,bench-001-orders.jsonl,bench-001-transcript.jsonl}` · `scripts/gr-sim.mjs` · `scripts/gr-sim.test.mjs` · `src/sim/HeadlessContractSim.ts` · `src/agent/StandingOrders.ts` · `src/assets/SpriteAnimator.ts` · `src/assets/generated.ts` · `src/entities/BuildingSign.ts` · `src/entities/pools.ts`
- **1 of 12 — `package.json` MAIN-MOVED-TOO → hand-grafted.** Both sides edited the same `test:node-guards` line: main inserted `scripts/findings-state-guard.test.mjs` and chained `&& npm run test:findings-state`; the lane inserted `scripts/gr-sim.test.mjs`. **Resolved as a true union** — both insertions kept, verified programmatically: 29 guard files, still strictly alphabetical, both markers present, plus main's chained script intact.

## Firewall audit — PASS

TOUCH-ONLY allowed "the new runner entry + minimal seams in sim code ONLY where a render import blocks headless boot (each such edit listed in the report; behavior byte-identical in browser)". NO listed "View/Orders schemas, Balance, gameplay logic".

- **Zero `Balance` bytes. Zero `e2e/` bytes. No gameplay logic touched.**
- **`src/agent/StandingOrders.ts` +4 — the one edit that needed a ruling, since the NO list names "Orders schemas".** It adds `snapshotStandingOrders()`, which is a *pure delegating read accessor*: `installedExecutor?.snapshot() ?? {needsRider:false,orders:[],log:[]}`. ✓ Verified `snapshot()` already existed at `:172` and `StandingOrdersView` at `:43` — **no schema byte changed, no existing path altered.** Compliant.
- **The five render seams are all one idiom — `if (typeof document === 'undefined') return …`** — at `SpriteAnimator.ts:774` (`createRuntimeSlot`), `generated.ts:122` (`loadGeneratedTexture`), `BuildingSign.ts:30`, and `pools.ts:1166/1306/1522` (`createRailcarParts`, `publishBossHpBar`, `publishRailcar3d`). **In a browser `document` is always defined, so every one of these branches is unreachable there.** The master's "behavior byte-identical in browser" requirement is therefore satisfied *by inspection*, not merely by suite greens — the strongest form of that proof available.

## Gating — checked against the spec, not assumed

`drain-block-check.mjs` returned **`? UNKNOWN`** (no goal leaf matched), which the law defines as a bookkeeping finding and **explicitly not a clearance** — so gating was settled by reading the spec. `specs/agent-play/README.md:70` rules: *"GATES: package publication to the Environments Hub is OWNER-GATED (AP-05 family — public artifact). **GR-SIM itself is engine work, buildable now.**"* This slice built GR-SIM locally and **published nothing** (no Hub package, no `prime env push`, no upload). ✓ Not owner-gated.

✓ It also satisfies the spec's ASYNC LAW at `:74` — *"GR-SIM's stdio protocol is therefore LINE-DELIMITED JSON (fold into lane-gr-sim if not already merged)"* — which the slice honours in both directions (7-line NDJSON stdout, one-order-per-line stdin). That requirement is discharged here rather than deferred.

## Findings

- 🔺 **F-1260-3 (BOOKKEEPING, non-blocking, fixed in the drain commit) — `lane-gr-sim.md` shipped with NO goal leaf, and the AP numbering in `tasks/goals.json` contradicts the spec.** `drain-block-check` could not classify this done-move at all. Worse, the obvious id was already taken: the tree carries **`ap-07-county-standings`** (`merged`) while the spec numbers county standings **AP-06** (`README.md:45`) and reserves **AP-07** for THE PRIME BRIDGE (`:64`) — and `ap-06-standing-orders` occupies AP-06. So the tree is one off against the spec from AP-06 up, which is exactly why the real AP-07 work had nowhere to register. Registered this slice as a distinct **`ap-07-gr-sim`** to avoid deepening the collision; **renumbering the existing merged leaves is deliberately NOT done here** — retitling shipped leaves is a ledger decision, not a drive-by, and it belongs to an attended pass.
- 🔻 **F-1260-4 (non-blocking, informational) — the run's own report is unusually honest and it is worth preserving why.** Its closing paragraph records that an independent uncommitted-diff review of its *first* draft found "fake cross-contract objective handling, duplicated building simulation, incomplete thief/wrecker contexts, and an unregistered regression test", and that the final version fails closed to Dry Gulch, reuses the production `BuildSystem`, and registers its check in `test:node-guards`. ✓ Spot-verified: the fail-closed behaviour is real (documented at `report.md:13-14`) and `gr-sim.test.mjs` is in `test:node-guards`. **A run that reports its own rejected draft is doing the factory's work for it** — this is the reject-don't-stretch reflex (Mistake #14) applied by the implementer to itself.
- 🔻 **F-1260-5 (non-blocking, for whoever writes the next AP rung) — the 17 known reds are a real ceiling on this slice's "full adjacent board" self-check.** The master asked for the exhaustive m1/m2/m3 board green; it cannot be green today, because 8 spec families in it are already in the red inventory. The run did the right thing (ran it, reported 205/222, fingerprinted). **Future AP masters should name the core trio + release suite as the gate and cite the red inventory for the rest**, rather than asking for a green that the board cannot currently produce — otherwise every AP slice inherits an unmeetable self-check.

## Retention

Instruments committed, nothing deleted: `logs/session-scratch/s1260/determinism.mjs` (the re-derivation harness) and its two run captures `runA.jsonl` / `runB.jsonl`.
