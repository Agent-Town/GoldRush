# homemaker-kept-state-init-order — the kept chair no longer restores before the wave system exists

**Slice:** `homemaker-kept-state-init-order` (lane-a, Claude Opus 5, wave 2) · **base** `1e63b52ee` · **cures** F-ADM-1 / AD2-B1 (`reviews/asset-diet-explicit-manifest.md`)
**Verdict:** READY-FOR-GATES.

## What it does

`Game` builds the Homemaker in a FIELD INITIALIZER (`src/game/Game.ts:1084`), which runs before the
constructor body; `this.waveSystem` is only assigned inside that body (`src/game/Game.ts:1466`).
`HomemakerBossSystem`'s constructor ended with `if (this.enabled) this.restorePersistentKept()`, and
that restore calls `suppressBossSpawn()` — wired to `() => this.waveSystem.suppressBaronForRun()`.
So a reload of any E6 run whose Homemaker had been kept threw
`Cannot read properties of undefined (reading 'suppressBaronForRun')` and took the whole boot with
it: no canvas game, no `__GR_TEST__`, no diagnostics.

The restore is now an explicit post-construction call. `HomemakerBossSystem` arms
`keptRestorePending` in its constructor instead of restoring, exposes `restoreKeptState()`, and
`Game` calls it on the line immediately after `new WaveSystem(...)` returns — the first moment the
only system the callback reaches exists. `update()` carries a one-line backstop for any host that
does not make the call (by the first tick every host has built its wave system), and `reset()` now
re-arms and restores through the same one path. Nothing else changed: the restore's body, the
Homemaker's behaviour, `WaveSystem`, and the other bosses are untouched.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 (also rc 0 on the base, before any edit) |
| `npm run build` | green, `✓ built in 3.91s`, asset-diet table printed as usual |
| `e2e/e6-boss-homemaker.spec.ts` desktop-chrome + mobile-chrome (390px), port 5301, `--workers=1` | **2 passed (13.7s)** |
| `e2e/e6-roster.spec.ts` + `e2e/e6-boss-homemaker.spec.ts`, both projects, `--workers=1` | **8 passed (1.1m)** |
| CONTROL: the same homemaker spec with `src/game/Game.ts` and `src/systems/HomemakerBossSystem.ts` checked out at HEAD | **2 failed** — both projects time out at `e6-boss-homemaker.spec.ts:227` |
| Console/page errors | zero. `e6-boss-homemaker.spec.ts:249` is `expect(errors).toEqual([])` over a listener armed before `goto` and never re-armed, so the passing run asserts zero console **and** pageerror across the whole ride, the post-reload half included |

### The node battery — `npm run test:node-guards` under Node 26.4.0

**697 tests / 691 passed / 4 failed / 2 skipped, 319.4 s.** Every red attributed:

| Red | Cause | This slice? |
|---|---|---|
| `law-pointer-guard.test.mjs:135` "THE REAL TREE: every law-surface pointer in this repo currently holds" | `scripts/fire.md:28` cites `src/game/Game.ts:2532–2544`; the +8 lines this slice adds to `Game.ts` move that block to `:2540–2552` | **YES — predicted, see F-HKS-3. Cure it in the drain commit.** |
| `desk-declaration-guard.test.mjs:163` "the live board is green under this guard (baseline is honest)" | the guard REFUSES from a linked worktree by design (`corpus tree: linked-worktree`, "Re-run from the main worktree, or pass --root <main worktree>"); it reported 0 undeclared and 0 unexamined | no — environmental, already recorded on the `glb-export-contract-and-validator` BACKLOG row |
| `fixture-teardown.test.mjs:24` "all 122 scripts/*.test.mjs fixture owners remove their temp directories" | pure cascade: its message is "scripts/desk-declaration-guard.test.mjs child failed" | no — cascade of the row above |
| `node-guards-contention.test.mjs:116` "contention is advisory, correctly counted, and absent when alone" | `spawnSync ps ENOBUFS` at `:50` on a busy host | no — environmental, already fire-authorable as F-GLB-3 (give that `ps` call a `maxBuffer`) |

Two greens worth naming, because they were RED on this branch's base: `engine-era-guard.test.mjs` and
the bench-seed legs. Main at `1e63b52ee` carries live engine hash
`3c38c993fda488a95045297e012476484cbce9a62567a6ffbf0d9a524b7b4885`, which appears **nowhere** in
`assets/engine-era.json` (grep count 0 at HEAD) — the ENGINE-PIN-OWED item on the
`glb-export-contract-and-validator` BACKLOG row. This slice rotates the hash again and pins the
result, so merging it discharges that debt for the merged tree. The never-live `3c38c993` is not
pinned and does not need to be.

### The reload proof (`reload-proof.json`, reproduce with `reload-probe.mjs`)

The e2e reaches the reload only after playing the whole boss. The probe seeds the same persisted
state directly — one `render` / `homemaker-9000-kept` entry at `{x: 3, z: -8}` written into the live
profile's `gr.profile.v2.<id>.tilestate.e6-glow-mesa` key — then reloads and reports every
`pageerror`/`console.error` plus the Homemaker diagnostics. Same probe, same server, same seeded
state, two trees:

| | booted after reload | errors | homemaker after reload |
|---|---|---|---|
| HEAD `1e63b52ee` (unfixed) | **false** | `pageerror: Cannot read properties of undefined (reading 'suppressBaronForRun')` | — (no diagnostics; boot died) |
| this lane | **true** | none | `persistentKept: true`, `chairPlaced: true`, `act: 3`, `poweredDown: true`, `position: {x: 3, z: -8}` |

Persisted kept state → reload → no page error → still kept, at the position it was kept at.

### The wait at `:227` DOES mask the crash — reported, not altered

`e6-boss-homemaker.spec.ts:227` is `await page.waitForFunction(() => window.__GR_TEST__ && ...)`.
On the unfixed tree the page **has** thrown by then, but `waitForFunction` only ever reports
`Test timeout of 90000ms exceeded` — it neither surfaces the pageerror nor fails fast. The
spec's own `errors` array had already collected the TypeError; the run dies 90 s earlier at the
wait, so `expect(errors).toEqual([])` at `:249` is never reached and the real cause never prints.
The control run's `error-context.md` for both projects shows only the timeout and an empty page
snapshot (`- generic "Playable Three.js game canvas"`). Per the task's firewall the spec was **not**
altered; this is the report of it. The exact error text in the table above came from the standalone
probe, which is the only thing on this tree that prints it.

### Determinism — the sim is byte-identical (`hashes.json`)

| Ride | Before (HEAD `1e63b52ee`) | After (this lane) | Pinned in `assets/contracts/null-floors.json` |
|---|---|---|---|
| `e6-glow-mesa` / `e6-glow-mesa-01`, `--policy=idle` | `fnv1a32:0ae65b8e` | `fnv1a32:0ae65b8e` | `fnv1a32:0ae65b8e` |
| `e6-glow-mesa` / `e6-glow-mesa-02`, `--policy=idle` | `fnv1a32:004ae8d7` | `fnv1a32:004ae8d7` | `fnv1a32:004ae8d7` |
| played tape, live outcome (`play-tape.mjs`, 40 input-log entries) | `fnv1a32:42cc6cdb` | `fnv1a32:42cc6cdb` | — |
| played tape, recorded `eventLogHash` | `fnv1a32:fdce1d04` | `fnv1a32:fdce1d04` | — |
| `scripts/assay-replay.mjs` over that tape | `fnv1a32:fdce1d04` | `fnv1a32:fdce1d04` | — |

Outcomes match too: `-01` `secured false / waves 15 / timeMs 467633 / gold 0 / kills 290`, `-02`
`false / 14 / 436800 / 0 / 287`, tape `false / 15 / 463233 / 0 / 278`. Field-by-field, the two tape
files differ in exactly two places: `id` (a fresh `randomUUID` every run, by design) and
`meta.engineHash` (the src re-hash this slice pins). `runStart`, `inputLog`, `eventLogHash`,
`outcome`, `simVersion`, `difficulty` are identical.

### The engine pin

| | sha256 |
|---|---|
| before, HEAD `1e63b52ee` | `3c38c993fda488a95045297e012476484cbce9a62567a6ffbf0d9a524b7b4885` |
| after, this lane | `6e27423b60157b3661a1d822d90e4ec47eb65952fe6568544dade163a17e223f` |

`assets/engine-era.json` gains a same-era pin (era 5, `the Replayed Board`) for the new hash with its
cause, and the top-level `engineHash` moves to it. Append-only: the diff is +7/-1 and touches no
earlier pin. `scripts/engine-era-guard.test.mjs` was **1 failed / 4 passed** before the pin (it is
what printed the hash) and **5 passed / 0 failed** after.

## Files touched

| File | Change |
|---|---|
| `src/systems/HomemakerBossSystem.ts` | +26/-2 — `keptRestorePending` field, `restoreKeptState()`, the constructor arms instead of restoring, `update()` backstop, `reset()` routed through the one path |
| `src/game/Game.ts` | +8/-0 — the explicit `this.homemakerBoss.restoreKeptState()` call plus its comment, immediately after `new WaveSystem(...)` |
| `assets/engine-era.json` | +7/-1 — one same-era pin |
| `artifacts/homemaker-kept-state-init-order/**` | new — this report, the two evidence JSONs, the two probe scripts, the two spec screenshots |
| `tasks/BACKLOG.md` | +1 — the slice's row |

## Findings

- **F-HKS-1 (non-blocking, the reason for the `update()` backstop).** `HeadlessContractSim` has the
  same defect shape and it is outside this task's firewall: it builds the Homemaker at
  `src/sim/HeadlessContractSim.ts:1163` and `this.waves` only at `:1232`, so its
  `suppressBossSpawn: () => this.waves.suppressBaronForRun()` (`:1181`) would throw for exactly the
  same reason. It cannot fire **today** because that host is handed
  `new TileStateStore(NO_PROFILE_STORAGE)` (`:1177`; `NO_PROFILE_STORAGE.getItem` returns `null` at
  `:263`), so `readAtBirth()` always returns `null` and the restore returns before reaching the
  callback. The moment GR-SIM is given a real profile store it would crash. Removing the
  constructor restore would also have silently taken the sim's restore away; the `update()`
  backstop (`HomemakerBossSystem.update`, first tick) is what keeps that host correct without
  editing it, and it is a provable no-op there today — the hash table above is the proof.
- **F-HKS-2 (non-blocking, spec quality, reported not fixed per the firewall).** The reload wait at
  `e2e/e6-boss-homemaker.spec.ts:227` converts a boot-killing pageerror into a 90-second timeout
  with no cause in the output. A `page.on('pageerror')` fail-fast, or asserting `errors` before the
  wait, would have named this bug in seconds instead of leaving `:126` red with a timeout message.
  Same shape wherever a spec reloads and waits for a global.
- **F-HKS-3 (OWED AT THE DRAIN — one pointer, outside this task's firewall).** The +8 lines in
  `src/game/Game.ts` push the agent-adapter block down by exactly 8, so `scripts/fire.md:28`'s
  citation `src/game/Game.ts:2532–2544` must be re-based to **`src/game/Game.ts:2540–2552`**.
  Verified by reading both ends rather than by arithmetic: `git show HEAD:src/game/Game.ts | sed -n
  '2532p'` and working-tree `:2540` are the identical `placeBuilding: (id, position, rotation = 0)
  => this.placeAgentBuilding(...)` line, and HEAD `:2544` / working-tree `:2552` are the identical
  `return (game.runManager ? agentAutonomyLevel(...) : 0) + game.agentPolicySlotBonus;` line. The
  substance is INTACT; only the coordinate moved. Consequence, stated in advance: the
  `THE REAL TREE: every law-surface pointer in this repo currently holds` case in
  `scripts/law-pointer-guard.test.mjs:135` reds exactly once on the gate, and `node
  scripts/law-pointer-guard.mjs` exits 1 naming this one drift and nothing else (`pointers 60,
  checked 58, known-rotten 0`; `instruments 77, dead 0`). This is the documented dispatch-site
  lifecycle in `CLAUDE.md` §4.10b: the rotting change predicts the rot and the drain cures it in
  its own landing commit. `scripts/fire.md` is not in this task's TOUCH-ONLY list, so it is
  reported, not edited.
