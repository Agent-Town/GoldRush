CODEX: model=gpt-5.6-sol effort=xhigh
# Task lane-a-drill-yard-practice-derivation: the Drill Yard's practice mechanics must be DERIVED, not invisible (LANE-A, commit prefix "feat:")

**FIRE-AUTHORED s1385 (attended review welcome — see §"Naming note" at the bottom; the manifest ids are mine, not the owner's).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (slot lane-a, branch `lane/m3`).

READ FIRST (paths, in this order):
- `AGENTS.md`
- `specs/agent-play/README.md:147-162` — **AP-11 THE MECHANICS MANIFEST** and its all-epochs-census amendments. This is the spec slice that authorizes this task. In particular §1 ("DERIVED FROM ITS OWN SIM DATA (never hand-authored)"), §3 ("NO UNDECLARED MECHANICS (assayer law): any interactable/rule present in map data but absent from the manifest FAILS assay"), amendment 1 ("SPECIES A — SRC-ONLY mechanics … staging belongs in data … id-hardcode is a manifest hole") and amendment 2 ("a mechanic enters the manifest only when BOTH declared AND consumed by a booted system").
- `src/agent/MechanicsManifest.ts` — the whole file (148 lines). `deriveMechanicsManifest` reads `contract.tileParams` and `contract.twist` and **never reads `contract.practice`**.
- `assets/contracts/epoch-1-frontier/contracts.json:33-73` — the `e1-drill-yard` contract, including its `practice` block at `:50-61`.
- `src/game/DrillYard.ts:9-16` (`INTERACTION_RADIUS`, `TARGET_POSITIONS`), `:55-56` (`faucetPosition`, `bellPosition`), `:83-91` (target construction and kind assignment).
- `src/meta/ContractFamilies.ts:609-620` (`ContractPracticeMode`), `:1507` (`AUTHORED_CONTRACT_KEYS`), `:1611-1656` (`validateAuthoredContractShape`), `:1658-1668` (`addUnknownFieldReasons`).
- `e2e/drill-yard.spec.ts` — the behavioural gate this slice must not move. Everything cited below lives inside its second test, `e2e/drill-yard.spec.ts:99` ("The Drill Yard is a resettable, ledger-free practice claim"): the `practice` `toMatchObject` at `:131`, `targets[2]` at `:167`, and `targets.length === 5` at `:243`.
- `tasks/f1328-1-drill-yard-census-debt.md` — the **blocked** leaf whose files are firewalled OUT of this task. Read it so you understand what you must NOT touch.

SEQUENCING LAW: after the safe-dupe pre-flight, verify the authored-bundle validator is present in this lane:
`git merge-base --is-ancestor cbf0e143 HEAD` must succeed (that commit is `lane-d: authored-bundle validation across 10 epochs`, on main 2026-08-02). If it does not, STOP and report "cbf0e143 not in lane base" — do NOT improvise the validator.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
(At the time of authoring, `node scripts/lane-usable.mjs lane-a` reported **USABLE, ahead=0, clean, 11 behind main** — the reset above is what makes the lane current.)

## Why (F-1383-2, measured s1383; leaf `f1328-1-drill-yard-census-debt`, `blockClass: "disputed"`; re-verified by reading the code s1385)

The blocked leaf's own `blockedReason` states the defect: *"deriveMechanicsManifest(\"e1-drill-yard\") returns interactables:[] and rules river/water_crossings despite the yard declaring a bell, dummies, practice gold and buildables: the derivation ignores `practice`, which is an AP-11 NO-UNDECLARED-MECHANICS violation AT THE DERIVATION."*

That leaf records **two dispatches already** and *"THIRD ATTEMPT REQUIRES A CHANGED PREMISE per the twice-then-escalate law: either (a) fix the derivation in its own slice first, or (b) split this master…"*. **This task is option (a), and nothing else.** It deliberately does NOT repair the census assertions — those stay with the blocked leaf.

Verified on main at authoring time (`s1385`, read, not grepped):
- `src/agent/MechanicsManifest.ts:28-97` — `deriveMechanicsManifest` destructures only `contract.tileParams` and `contract.twist`. There is no reference to `practice` anywhere in the file.
- For `e1-drill-yard` that yields exactly: `interactables: []` (no `tileParams.prePlacedBuildables`), `rules: ['river','water_crossings']`, `posting.waves: [{event:'secure',wave:0}]`, `spawnEdges: ['east','north','south','west']`, `lossStakes: []`.
- Meanwhile the yard **declares** (`contracts.json:50-61`): `goldGrant: 100`, `bellWaveSize: 8`, `dummyRespawnSeconds: 1.5`, `buildables: [7 ids]`, and six suppression flags all `false`.
- And those declarations are **consumed by booted systems**, so AP-11 amendment 2 (declared-AND-consumed) is satisfied and the mechanics are obliged to enter the manifest: `src/game/Game.ts:1631-1633` constructs `DrillYard` from `this.activeContract.practice`; `:770` disables waves when `practice?.scheduledWaves === false`; `:2080` gates `RunManager` on it; `:5350` gates the buildable allowlist; `src/main.ts:215` gates `markFirstClaimDone()`.
- The **staging** of those mechanics is SRC-ONLY, which is AP-11 amendment 1's named manifest hole: `DrillYard.ts:10-16` hardcodes five `TARGET_POSITIONS`, `:84` assigns kinds by `index % 2 === 0 ? 'straw-man' : 'rolling-log'` (⇒ 3 straw men, 2 rolling logs), and `:55-56` hardcodes `faucetPosition (-8,0,12)` / `bellPosition (8,0,12)`. **No derivation reading only the contract can produce honest counts while those live in src.** That is why scope item 1 comes before scope item 3.
- Gap found while authoring: `practice` is in `AUTHORED_CONTRACT_KEYS` (`ContractFamilies.ts:1507`) but **its inner keys are validated by nothing** — `validateAuthoredContractShape` calls `addUnknownFieldReasons` for `tileParams`, `twist`, `tileParams.lanes`, `twist.enemyRoster[]` and `twist.baron`, and never for `practice`. A typo inside `practice` is silently accepted today. This slice adds fields there, so it closes that hole in the same breath (scope item 5).

## Scope (numbered, each independently testable)

1. **Lift the Drill Yard's staging out of src and into contract data — BEHAVIOUR-IDENTICAL.**
   Extend `ContractPracticeMode` (`src/meta/ContractFamilies.ts:609-620`) with two required arrays and add them to `assets/contracts/epoch-1-frontier/contracts.json`'s `e1-drill-yard.practice`:
   - `stations: { id: string; op: string; x: number; z: number }[]` — exactly two entries, reproducing today's constants **byte-for-byte in value**:
     `{"id":"assay_tent_faucet","op":"top_up","x":-8,"z":12}` and `{"id":"drill_bell","op":"ring","x":8,"z":12}`.
   - `targets: { kind: 'straw-man' | 'rolling-log'; x: number; z: number }[]` — exactly five entries, **in today's order and with today's kinds** (`DrillYard.ts:10-16` + `:84`):
     `straw-man (-9,-9)`, `rolling-log (-4.5,-10)`, `straw-man (0,-9)`, `rolling-log (4.5,-10)`, `straw-man (9,-9)`.
   This item is DONE when the data exists and `npx tsc --noEmit` is clean. It changes no behaviour by itself.

2. **`DrillYard.ts` reads the data; the module constants die.** Delete `TARGET_POSITIONS` (`:10-16`) and the `faucetPosition`/`bellPosition` literals (`:55-56`); source all seven positions and the five kinds from `config` (the `ContractPracticeMode` already passed to the constructor at `Game.ts:1632`). Keep `INTERACTION_RADIUS` in src — it is a tuning constant, not staging. The station the player is `nearby` and the action-button label must be keyed off the station's **id** (`assay_tent_faucet` → "Top up practice gold", `drill_bell` → "Ring one drill wave"), not off a positional guess.
   **This item is DONE when `e2e/drill-yard.spec.ts` passes UNMODIFIED, both projects.** Its second test — `e2e/drill-yard.spec.ts:99` ("The Drill Yard is a resettable, ledger-free practice claim") — already pins every invariant that matters: `:243` asserts `targets.length === 5`, `:167` drives `targets[2]` by index, and `:143-144` teleport to `(-8, 12)` and expect the faucet prompt text. If you have to edit that spec to make it pass, you have changed behaviour — STOP and report instead.

3. **Teach `deriveMechanicsManifest` to read `contract.practice`.** Add a `practice` branch producing, from data only (never from a literal in the derivation):
   - **interactables**, `source: 'practice.stations'` — one entry per distinct station `id`, `count` = how many stations carry that id, `operations` = the sorted distinct `op` values declared for it. For the yard: `assay_tent_faucet` ×1 `['top_up']`, `drill_bell` ×1 `['ring']`.
   - **interactables**, `source: 'practice.targets'` — one entry per distinct `kind`, id = the kind in snake_case (`straw_man`, `rolling_log`), `count` = how many targets carry it (3 and 2), `operations: ['strike']`.
   - **rules** (ids/sources exactly as listed; `data` values read from the contract, not typed in):
     | rule id | source | data |
     |---|---|---|
     | `ledger_free_practice` | `practice` | `{ suppressed: [<the practice keys whose value is literally `false`, sorted>] }` |
     | `practice_gold_grant` | `practice.goldGrant` | `{ amount }` |
     | `drill_wave` | `practice.bellWaveSize` | `{ size }` |
     | `practice_target_respawn` | `practice.dummyRespawnSeconds` | `{ seconds }` |
     | `practice_buildables` | `practice.buildables` | `{ ids: [<sorted>] }` |
   Widen the `interactables[].source` union in the `MechanicsManifest` type to admit the two new sources. Keep the existing `.sort(byId)` ordering discipline for both lists — the manifest is byte-stability-gated downstream, so ordering must be total and deterministic.

4. **`posting.waves` derives EMPTY when `practice.scheduledWaves === false`.** Today the yard's manifest posts `{event:'secure', wave:0}` from `twist.secureWave: 0`, but `Game.ts:770` disables waves outright for practice contracts — so that entry is **declared but not consumed**, which AP-11 amendment 2 forbids from entering the manifest ("a naive JSON-derived manifest would MINT LIES"). Suppress it for practice contracts only. Assert this in the new spec (item 6).

5. **Close the `practice` validation hole.** Add an `AUTHORED_PRACTICE_KEYS` allowlist next to the existing ones (`ContractFamilies.ts:1507-1540`) covering every legal key including the two new ones, and call `addUnknownFieldReasons(practice, AUTHORED_PRACTICE_KEYS, 'practice', reasons)` from `validateAuthoredContractShape` when `practice` is present (guard its shape the way `twist.baron` is guarded at `:1646-1654`).
   **Test-the-test (mandatory):** in the new spec, feed the validator a practice block carrying one bogus key and assert it is rejected with a `field_unknown` reason at path `practice.<bogus>`. A validation item with no planted violation is not tested (`s1299`/`s1300` standard: a passing guard never executes its violation path).

6. **New spec `e2e/drill-yard-manifest.spec.ts`** (this is the slice's own gate — it must exist and be green both projects):
   a. `deriveMechanicsManifest('e1-drill-yard').interactables` equals the four entries of item 3, exactly, in `byId` order.
   b. its `rules` **ids** equal the sorted union of `['river','water_crossings']` and the five new ids; spot-assert `practice_buildables.data.ids` has 7 entries and `drill_wave.data.size === 8`.
   c. its `posting.waves` is `[]` (item 4).
   d. **CONTAINMENT — the load-bearing assertion:** for each of `the-claim`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`, `JSON.stringify(deriveMechanicsManifest(id))` is **byte-identical to the corresponding entry in the existing, UNMODIFIED `e2e/fixtures/e1-mechanics-manifests.json`**. Read that fixture; do not rewrite it. This proves the derivation change is confined to contracts that declare `practice` — and `e1-drill-yard` is the only one in the repo (verify with a grep and report the number).
   e. the item-5 planted-violation test.
   f. determinism: `deriveMechanicsManifest('e1-drill-yard')` stringifies identically across two calls.

7. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY:
- `src/agent/MechanicsManifest.ts`
- `src/game/DrillYard.ts`
- `src/meta/ContractFamilies.ts` (the `ContractPracticeMode` type + the `AUTHORED_PRACTICE_KEYS` allowlist and its call site — nothing else)
- `assets/contracts/epoch-1-frontier/contracts.json` (the `e1-drill-yard.practice` block ONLY)
- `e2e/drill-yard-manifest.spec.ts` (new file)

NO changes to:
- **`e2e/agent-view.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/072-era-activation.spec.ts`, `e2e/board-card-images.spec.ts`, `e2e/map-census.spec.ts`, `src/town/TownScene.ts`.** These are the census sites owned by the **blocked** leaf `f1328-1-drill-yard-census-debt` and the carved-out `f1330-1-count-shaped-censuses`. Touching them is a firewall violation even though it looks helpful. **`e2e/agent-view.spec.ts` is EXPECTED TO STAY RED at `:266`** — see the self-check.
- `e2e/drill-yard.spec.ts` — must pass unmodified (item 2's gate). Editing it invalidates the item.
- Any other contract in `assets/contracts/**`, any other epoch bundle, any `tileParams`/`twist` derivation branch.
- Sim semantics, wave scheduling, economy, or any player-visible behaviour of the Drill Yard. This slice is a **data lift plus a derivation**; if a scope item seems to require a behaviour change, STOP and report.
- `git add -A`. Path-scoped only.

## Self-check (run these exact commands, report the numbers; `--workers=1` is a correctness requirement of the fire shell, not an optimisation)

- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/drill-yard-manifest.spec.ts --workers=1` — the new spec, **green both projects**; report pass counts per project.
- `npx playwright test e2e/drill-yard.spec.ts --workers=1` — **green both projects, spec UNMODIFIED** (item 2's gate). ✓ **Baseline MEASURED by the authoring fire (s1385, on main at `d0826517`, `--workers=1`): `4 passed (32.4s)`** — 2 tests × 2 projects. Anything less than 4/4 is your regression. ⚠️ That run left 8 tracked PNGs under `artifacts/pc-01b-drill-yard-parity/` modified; the fire restored them with `git checkout --`. Expect the same and do the same.
- `npx playwright test e2e/contract-bundle-validation.spec.ts e2e/contract-briefings.spec.ts --workers=1` — adjacent (the validator and the contract data); report counts.
- `npx playwright test e2e/agent-view.spec.ts --workers=1` — ⚠️ **EXPECTED RED, and this is a REPORT item, not a repair item.** It fails at `e2e/agent-view.spec.ts:266` ("all five E1 mechanics manifests match their byte-stable fixture") (that test was RENAMED at commit 8fa0133f and is now titled "all six E1 mechanics manifests match their byte-stable fixture" — the count in the old title was the defect) on the hardcoded five-id list that omits `e1-drill-yard` — a pre-existing red owned by the blocked leaf (F-1383-2). **Report the exact failing line and diff.** If it fails ANYWHERE ELSE, that is your regression: STOP and report. (Note `:268`'s zero-console rider is a known mobile-only order-dependent flake — `logs/suite-red-inventory.md` addendum s1304, F-1304-1.)
- `npx playwright test --config playwright.release.config.ts --workers=1` — ⚠️ `release-build.spec.ts` is claimed by that config via `testMatch` and is EXCLUDED from the default config's collection; running it by path collects **zero tests and still exits 0** — a silently empty gate. Use the config flag. s1384 measured it **26/26 at `--workers=1`** on this same tree (2026-08-02, review `reviews/lane-authored-bundle-validation-s1384-regate.md`); the authoring fire did not re-run it, so treat 26/26 as an inherited baseline, not a fresh one.
- `npm run test:node-guards` — rc=0.
- `grep -rn "TARGET_POSITIONS\|faucetPosition = new THREE\|bellPosition = new THREE" src/` — must return **zero** (item 2 done).
- ⚠️ **Report, do not commit, any tracked PNG under `artifacts/` or `reviews/` that your test runs modify** (F-1328-3: gate runs rewrite shipped evidence in place). Restore them with `git checkout --` before committing.

READY-FOR-GATES + report: (1) the full derived `e1-drill-yard` manifest as JSON; (2) the count of contracts in the repo declaring `practice` (expected 1) and how you counted it; (3) per-project pass/fail counts for every suite above; (4) the exact `agent-view.spec.ts` failure line + diff; (5) the planted-violation reason object from item 5; (6) anything you had to decide that this master did not settle.

## Naming note (attended review welcome)
The manifest ids `assay_tent_faucet`, `drill_bell`, `straw_man`, `rolling_log` and the ops `top_up`, `ring`, `strike` were chosen by the authoring fire to follow the grammar already in the manifest (`lantern_post` / `relight`, `water_crossings`). They are internal ids, never player-facing copy, so they bend no canon — but an attended session may rename them in review, and that rename is cheap while the fixture that would freeze them is still owned by a blocked leaf. **Do not invent additional ids beyond this list; if the data needs one this master did not name, STOP and report.**
