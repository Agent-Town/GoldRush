# Task pressure-generalize-engine: data-drive the pressure play so any contract can opt in (LANE-A, commit prefix "feat:")

**FIRE-AUTHORED (s577, attended review welcome).** Authored from the engine-block review + the standing OWNER'S DESK recommendation ("author the task this session, fire-queue it. Veto window: one word."). Reversible; if Robin vetoes, archive it.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.
READ FIRST: AGENTS.md; `reviews/e2-pressure-garden-engine-block.md` (the finding that authorizes this); `tasks/BACKLOG.md` lines ~307–309 (the OWNER'S DESK design + veto window).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-a branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (`reviews/e2-pressure-garden-engine-block.md`, 2026-07-15; OWNER'S DESK, BACKLOG)
The e2-drip-02-pressure-garden runner self-blocked (2× — the second time is engine, not safety): the pressure play is hardcoded to `e2-hill-mine`, so no second contract can opt into it. Verified on current main (`ec7f3dd1`):
- **`src/game/Game.ts:904`** — `PressureSystem` enabled predicate: `() => this.activeContract.id === 'e2-hill-mine' && !this.multiplayerActive(),`
- **`src/game/Game.ts:3825`** — `boiler_house` buildable guard: `if (id === 'boiler_house') return this.activeContract.id === 'e2-hill-mine' && !this.multiplayerActive();`
- **`src/game/Game.ts:3918`** — PRESSURIZE objective publish: `...(resource.id === 'pressure' && this.activeContract.id === 'e2-hill-mine' ? { objective: 'PRESSURIZE ...' } ...`
- **`src/meta/ContractFamilies.ts:495–506`** — the `twist:` type is the home for per-contract opt-in flags (`sluicesNeedWaterSource?`, `mothSeason?`, `powerGrid?`, …); no `pressureEnabled` field exists yet.
- **`assets/contracts/epoch-2-steamworks/contracts.json:132`** — e2-hill-mine's `twist` block (`"secureWave": 12, …`).

Owner design (BACKLOG): "data-driving what's hardcoded … no gameplay rebalancing." This slice ONLY generalizes; it changes NO behavior for e2-hill-mine and adds NO second pressure contract (that lands later, unchanged, as pressure-garden).

## Scope
1. **Schema**: in `src/meta/ContractFamilies.ts`, add `pressureEnabled?: boolean;` to the `twist:` object type (alongside `sluicesNeedWaterSource?` etc., ~line 496). If — and only if — a validator allowlist or ENUM/known-key list gates boolean twist fields (it does NOT appear to: `secureWave`/`sluicesNeedWaterSource` are untracked by the enum allowlist at ~line 1127), add the field there too; otherwise touch nothing else in this file. Report which you found.
2. **Data (no behavior change)**: in `assets/contracts/epoch-2-steamworks/contracts.json`, add `"pressureEnabled": true` to the e2-hill-mine contract's `twist` block (line ~132–133). This makes step 3 byte-behavior-identical for e2-hill-mine.
3. **Guard 1 — `Game.ts:904`**: replace ONLY the `this.activeContract.id === 'e2-hill-mine'` sub-clause with `this.activeContract.twist.pressureEnabled === true`. KEEP `&& !this.multiplayerActive()` exactly.
4. **Guard 2 — `Game.ts:3825`**: same replacement of the id-equality sub-clause; KEEP `&& !this.multiplayerActive()` exactly.
5. **Guard 3 — `Game.ts:3918`**: replace ONLY `this.activeContract.id === 'e2-hill-mine'` with `this.activeContract.twist.pressureEnabled === true`. This guard has NO multiplayer clause — do not add one.
6. **Verify no other `=== 'e2-hill-mine'` pressure guard exists** beyond these three: `grep -n "e2-hill-mine" src/game/Game.ts` must show only these three lines carry a pressure/boiler/PRESSURIZE meaning after your edit. Any additional pressure-related hardcode you find → report it, do NOT expand scope.

## Firewall
Touch ONLY: `src/game/Game.ts` (the three guard sub-clauses at 904/3825/3918), `src/meta/ContractFamilies.ts` (the twist type field, + allowlist only if one exists), `assets/contracts/epoch-2-steamworks/contracts.json` (e2-hill-mine twist flag). NO changes to: any sim/PressureSystem semantics (this is a guard-generalization, not a mechanics change), any OTHER contract's data, the 3D/terrain/MP surfaces, existing e2e assertions, any other task's fresh work. Do NOT author a second pressure contract or a new spec — pressure-garden lands that later, unchanged.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean + `npm run build` green. The existing e2-hill-mine / pressure suites green desktop+mobile (run `npm run test:e2e -- pressure` and any `e2-hill-mine`/boiler/PRESSURIZE spec by name; if none exists, boot-probe `?contract=e2-hill-mine` and assert the boiler_house buildable appears + PRESSURIZE objective publishes — screenshot to `artifacts/pressure-generalize/hill-mine-desktop.png` + `-mobile.png` at 390px). Adjacent contract-selection / ContractFamilies unit suites unmodified-green both projects. Zero console/page errors in a plain boot. Confirm e2-hill-mine behavior is IDENTICAL to pre-change (pressure UI, boiler build, objective) — that is the no-regression proof.
No-op guard: if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
End: READY-FOR-GATES + report (a) which files changed with the exact new guard text, (b) whether a validator allowlist needed the field, (c) the e2-hill-mine no-regression evidence (screenshots/suite names), (d) any additional pressure hardcode found and left for a follow-up.
