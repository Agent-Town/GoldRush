# Review — e6-showroom cap fix (owner-ruled) + the false green that survived it

**Slice/branch/tip:** `worktree-agent-aec0c52b1d3e82294`, base `2a441a877` (= main tip at start). Built by a headless Opus-5 agent (owner directive 2026-08-20: remaining coding on Opus).

**Verdict: READY-FOR-DRAIN — GREEN, but the slice's headline goal was NOT reached and the contract stays EXEMPT.** The owner's ruling is implemented and proved; the outcome it was expected to produce did not follow, and the reason is measured, not guessed.

## The ruling, and what it did

> **owner, 2026-08-20, verbatim:** "cap fix yes, difficulty stands yes leave it."

Ruling 1 is landed: a machine in the `exhausted` wrangle state no longer counts against `Balance.waves.aliveCap`. Ruling 2 is honoured by omission — no works placement, no balance value, and no roster was touched.

One number, read from the state's only owner. `WrangleSystem.exhaustedCount()` counts alive `exhausted` entries; `WaveSystem` takes it as a lazily-read constructor seat (`capExemptCount`, defaulted `() => 0`) and both spawn-refusal sites now measure `Balance.waves.aliveCap` against a new private getter `aliveAgainstCap = max(0, enemies.activeCount - capExemptCount())` instead of against `enemies.activeCount` raw. The browser seats `() => this.wrangle.exhaustedCount()` (`Game.ts`); GR-SIM seats `() => this.atomic?.exhaustedCount() ?? 0` (`HeadlessContractSim.ts`, via `AtomicSocket`). **Both engines read the same method on the same class, so the refusal is one rule, not two implementations.** The cap VALUE is unchanged (60). `EnemyPool.activeCount` is unchanged — exhausted machines are still alive, drawn and collidable everywhere else; they simply stop pressing on the wave clock.

Outside epoch-6-atomic the arithmetic is provably identical: the browser's `WrangleSystem` is constructed `enabled: this.contractEpoch?.id === 'epoch-6-atomic'` (`Game.ts:692`) and GR-SIM's `AtomicSocket.create` returns `null` for every non-E6 contract (`AtomicSocket.ts:91-92`), so `capExemptCount()` returns 0 and `aliveAgainstCap === activeCount`. The floors below are the empirical half of that proof.

## THE HEADLINE RESULT: idle still false-greens, and the mechanism moved rather than died

Expected: with the cap freed, live enemies keep arriving and an idle run dies honestly. **Measured: it does not.** Both bench seeds, `--policy=idle`, ×2 each, all `REPEAT-IDENTICAL`:

| seed | before (main `2a441a877`) | after (this branch) |
|---|---|---|
| `e6-showroom-01` | wave-20-false-green · secured **true** · alive **60**/60 · exhausted 60 · kills 81 · `fnv1a32:76304f06` | wave-20-false-green · secured **true** · alive **96**/96 · exhausted 96 · kills 135 · `fnv1a32:410c940e` |
| `e6-showroom-02` | wave-20-false-green · secured **true** · alive **60**/60 · exhausted 60 · kills 81 · `fnv1a32:d0cf7c3e` | wave-20-false-green · secured **true** · alive **96**/96 · exhausted 96 · kills 99 · `fnv1a32:75c8b75f` |

(Before-rows are `artifacts/ap16-8b-e6-showroom-capture-loop/runs.jsonl`, unmodified — that file is EVIDENCE and was read, never regenerated.)

The cap fix did exactly what it was asked to do, and something else caught the run one step later.

**The alive cap now PASSES and the ENEMY POOL refuses.** With 96 exhausted machines standing, `aliveAgainstCap = max(0, 96 − 96) = 0`, so the check `Balance.waves.aliveCap − 0 <= 0` is false and `WaveSystem` proceeds to spawn — and `EnemyPool.spawn` returns `null` because no slot in `Balance.enemy.poolSize` (**96**) holds a dead enemy (`pools.ts:665-673`). That refusal is not gated by `respectAliveCap` and is not exemptible the same way: a pool slot is an object, not a budget.

**And the root cause under THAT is that wind-down is automatic, not player-driven.** `WrangleSystem.update` registers every machine the moment it spawns (`:68-70`), and `register` schedules an 8-second decay (`Balance.wrangle.windDownSeconds`) whose expiry flips the machine to `exhausted` **with no player action at all** (`:233-243`); only damage resets it (`onDamage`). `e6-showroom`'s roster is exactly `feral_toaster` + `lawn_shepherd` — both `MACHINE_VARIANTS` — and the contract declares no baron, so **every enemy the contract can spawn is wrangle-eligible**. An idle hero damages nothing, so each arrival survives its 8 seconds and becomes a permanent harmless statue. The board converges on 96 statues and the hero cannot die because nothing hostile can be spawned to kill him.

That is why the contract stays exempt, and why no further cure was attempted here: every remaining option is a design change the owner did not rule on, and two of the three would alter the capture economy (statues are the player's gold source via the appliance pen).

## Fork taken: 5b — NOT ADMITTED, exemption reason rewritten

Advertising an unwinnable contract is the named harm (the hill-mine saga), so the row stays and tells the current truth instead of the old one. Both clauses of the previous reason are now false — aimed CAPTURE absorbs 97-99% of exhaustion (AP-16-8b), and the 60-enemy cap no longer holds exhausted machines at all — so the row is **reworded, not removed**, with a comment recording that its reason was disproved rather than forgotten. Exemption count is unchanged at **6**; `supportedContractIds()` is unchanged; no door, census, skill.md fence or baseline moved, because nothing was admitted.

No secure was attempted or claimed. The standing measurement stands: competent aimed play dies at waves 14-19 against `secureWave` 20, and per ruling 2 that is difficulty, not a defect.

## Evidence

All on Node **26.4.0**, after `npm install --no-audit --no-fund`.

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean (rc=0)**, run twice — after the cap fix and again after every edit |
| `npm run build` | **green, 1.60s** |
| `npm run test:node-guards` | **469 tests · 466 pass · 1 fail · 2 skipped** — the one fail proven environmental, below |
| er01-e5 + er01-e6 + ap16-4 census | **desktop 9/9 (9.7s) · mobile 9/9 (16.4s)** |
| e6-wrangle + task-025-bandits-dont-swim + m1-01-claim-jumpers-death + m2-01-build-menu | **mobile 17/17 (1.3m)** · **desktop 15/17 in batch, both reds green solo** — below |
| plain boot, `scripts/probe-plain-boot-console.mjs` | **PROBE CLEAN** — 1280×800 and 390×844, `errors: 0 · warnings: 0 · pageErrors: 0` on both |
| null-floors `--check`, before regen | 5 differences, **all E6** — see blast radius |
| null-floors after regen | **45/45 pairs, 0 `secured:true`** (Law 2 holds) |

**The one node-guards red is the environment, and it was controlled, not excused.** `scripts/node-guards-contention.test.mjs:106` — *"contention is advisory, correctly counted, and absent when alone"* — asserts `doesNotMatch(/CONTENDED/)` and read `CONTENDED — 2 concurrent batteries`, because the battery it runs inside is itself the second battery it detects. Re-run ALONE (`pgrep -f run-node-guards` empty first, verified) it **passes 1/1** in 977ms. This is the pre-declared F-1606-1 / F-2080-1 / F-E6HS-3 self-match class.

**The two desktop reds are load-flake, and were controlled the same way.** `m2-01-build-menu.spec.ts:283` and `task-025-bandits-dont-swim.spec.ts:202` failed inside the 4-spec desktop batch; re-run per-spec at `--workers=1` they pass **7/7 (34.5s)** and **5/5 (19.6s)**. Neither appears in `logs/suite-red-inventory.md`, so they are reported here rather than excused by an inventory row. Both specs are green on mobile in the batch itself.

### BLAST RADIUS — the cap fix touches every contract's spawn path, so it was measured, not argued

`scripts/null-floor-anchors.mjs --check` over all 45 pinned idle floors in 17 contracts (140.0s). **Exactly 5 lines differ, and every one is E6:**

```
eraStamp: pinned="a1e8bc63c" derived="2a441a877"          <- bookkeeping, always moves
e6-glow-mesa/e6-glow-mesa-01 kills: 75  -> 108
e6-glow-mesa/e6-glow-mesa-01 hash: fnv1a32:146a5771 -> fnv1a32:35d13711
e6-glow-mesa/e6-glow-mesa-02 kills: 108 -> 179
e6-glow-mesa/e6-glow-mesa-02 hash: fnv1a32:6b748f11 -> fnv1a32:293bb7cf
```

**43 of 45 floors are byte-identical** — `the-claim` (×5), `e4-dust-flats` (×2), `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`, `e2-pressure-garden`, `e3-blackout-ridge`, `e3-moth-season`, `e3-canyon-works`, `e5-deepwater-claim`, `e4-boneyard`, `e7-relay-valley`, `e8-mare-claim`, `e8-eclipse`, `e9-dome-basin`. Exhausted machines exist only in E6; everywhere else the subtrahend is 0 and the arithmetic is unchanged. The one contract that moved is the one that should: `e6-glow-mesa` is E6, its rosters carry machines, and freeing their slots lets more enemies arrive — `kills` rises and the hash follows. **`secured`, `waves`, `timeMs` and `gold` did NOT move for either glow-mesa seed**: its idle terminal is the same honest unsecured wave-18 ceiling it was before, only deadlier on the way.

### Regenerated artifacts, attributed

- `assets/contracts/null-floors.json` — **5 changed lines total**, listed above. Nothing else moved.
- `docs/bench/same-game-audit.md` — 1043 insertions / 1043 deletions, and **the majority is not mine**. Bucketed by hand, zero lines unexplained:
  - **405 lines cite `functions/api/standings.ts`** — PRE-EXISTING staleness. `standings.ts` last changed at `df6b0a7d1` ("season roll"), *after* the report's last regeneration at `ae1311eac`; the report pinned `:844`, the real anchor (`const simple = new Set(['weapon_toggle', …])`) stands at `:879` in main's own untouched file. My regeneration cures a report that was already stale on main.
  - **637 lines cite `src/sim/HeadlessContractSim.ts`** — mine: the file grew 10 lines, so every citation coordinate into it shifted.
  - **1 line** is the `e6-showroom` exemption reason itself — mine.

## Merge classification

Base `2a441a877`; no drift (branch cut from main tip, worked in isolation).

| file | class | note |
|---|---|---|
| `src/systems/WrangleSystem.ts` | LANE-TOUCHED | +`exhaustedCount()`; nothing existing altered |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED | +18th ctor seat (defaulted), +`aliveAgainstCap`, both cap sites re-pointed |
| `src/sim/AtomicSocket.ts` | LANE-TOUCHED | +`exhaustedCount()` delegate |
| `src/game/Game.ts` | LANE-TOUCHED | +1 seat argument at the `WaveSystem` construction |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | +1 seat argument (3 explicit `undefined`s keep the ctor's own escort defaults rather than restating them), exemption reason reworded |
| `e2e/er01-e6-census.spec.ts` | ⚠ **SHARED — see F-CAP-1** | comment corrected + `exhaustedCount()` pin at `:113-118`; a live task edits `:11/:13/:14/:15/:130` |
| `assets/contracts/null-floors.json` | GENERATED | regenerated, 5 lines |
| `docs/bench/same-game-audit.md` | GENERATED | regenerated, attribution above |

## Findings

- **F-CAP-1 (BLOCKING for whoever drains SECOND — a verified cross-branch contradiction).** `lane/b` @ `555cba556` (task `f2081-1-e6-capture-truth-pass`, completed while this slice was being built) rewrites the same E6 manifest rule and writes, verbatim: `consequence: 'exhausted machines are undamageable and hold spawn slots; …'`, under a comment reading *"Exhausted machines stop taking damage and hold spawn slots"*. **"hold spawn slots" is FALSE the moment this slice lands.** It is not the runner's error: its master explicitly ordered that clause preserved as the "true half" (`tasks/f2081-1-e6-capture-truth-pass.md` scope 2: *"It must keep the two facts that ARE true — exhausted machines take no damage, and they hold spawn slots"*), which was true when the master was authored that morning and was falsified by the owner's ruling the same day. **Whichever of the two lands second must strike that clause in the same commit.** Recommended replacement, derived from this slice: *exhausted machines are undamageable but capturable, and no longer hold spawn slots; capture is reached through the standing-order CAPTURE verb, not a tool.*
- **F-CAP-2 (non-blocking, but it is the reason this slice stopped where it did).** The idle false green now rests on `Balance.enemy.poolSize` (96) rather than `Balance.waves.aliveCap` (60), because exhausted machines release their spawn slot but keep their POOL slot. Curing it needs an **owner ruling**, since all three options are design changes and two touch the capture economy: **(a)** exhausted machines eventually leave the board on a second decay — simplest to reason about, but it deletes gold the player was entitled to; **(b)** `EnemyPool.spawn` may recycle the OLDEST exhausted machine when the pool is full — smallest diff, preserves the ruling's spirit, still deletes a capture but only under genuine pressure; **(c)** accept it and keep the exemption — the current state, and the honest one until ruled. **REC: (b).** Note the framing: this is not a "difficulty" question in the sense ruling 2 closed — it is about whether an idle board can suffocate the wave clock at all.
- **F-CAP-3 (non-blocking, owed measurement).** The cap fix raises the practical enemy ceiling in E6 from 60 to **96** — measured, both idle seeds. The engine supports it (`poolSize` is 96 and several suites already set `aliveCap` to 96), but **no frame-p95 pass on a full 96-enemy E6 board was taken here**, and the drain bar asks for one when anything renders. A perf pass on `?contract=e6-showroom` at a saturated board is owed before this is called finished for the browser.
- **F-CAP-5 (non-blocking, pre-existing, attributed by control).** An in-contract boot (navigate to `?contract=<id>` after profile creation) intermittently logs `THREE.GLTFLoader: Couldn't load texture blob:<uuid>` — a fresh blob UUID each time, landing on desktop or mobile at random, roughly one viewport in two. **Not mine, proven:** it reproduces identically on `?contract=e4-dust-flats`, a non-E6 contract where this diff is a provable no-op (3 runs: 2 dirty viewports, then 1, then 1). The repo's own plain-boot gate is clean, so this is only visible through the extra in-contract probe used here — and that probe's own second `page.goto` is the likeliest revoker of the blob. Filed so the next person who sees it does not re-derive the control.
- **F-CAP-4 (non-blocking, hygiene).** `docs/bench/same-game-audit.md` is extremely brittle to line movement in `src/sim/HeadlessContractSim.ts` — a 10-line insertion churned 637 report lines — and it was found already stale against `functions/api/standings.ts`. Same class as the CLAUDE.md law-pointer rot. Worth a `line()`-by-anchor pass someday; not touched here.

## What was deliberately NOT done

- **The manifest truth-fix was reverted out of this branch after being written.** A live Codex runner (pid 51634) was mid-flight on `f2081-1` in exactly `src/agent/MechanicsManifest.ts` when the collision was found; duplicating it would have been a firewall violation and a guaranteed semantic conflict (that task renames the rule id, this brief said keep it). Reverted to main's version, verified `grep -c uncapturable` = 1. F-CAP-1 carries the consequence forward.
- **The wrangle `position` field was not added.** It would move every E6 terminal hash: `AtomicSocket.diagnostics` — which contains `wrangle.diagnostics()` — is folded into `eventLogHash` at `HeadlessContractSim.ts` (`final.atomic`). VERIFIED by reading the hash composition, not assumed. It remains a clean, small, independently valuable next task; it is the field an agent needs to AIM `CAPTURE`, and blind capture lands 0.6% of its submissions without it.
- **No secure attempt.** Its premise (idle dies) failed, and ruling 2 forbids moving works or balance to manufacture one.
