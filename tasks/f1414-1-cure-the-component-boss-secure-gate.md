# f1414-1 — cure the component-boss secure gate, then finish the baron re-land

**FIRE-AUTHORED s1414 (attended review welcome)**
**Role:** implementer · **Slot:** main (repo root, `/Users/robin/Claude/Projects/Gold Rush`)
**Effort:** xhigh
**Supersedes:** `f1413-1-baron-reland-on-cured-main` (STOPPED at its own scope-3 canary — that STOP was correct)

## READ FIRST (paths, in this order)

1. `reviews/f1413-1.md` — the STOP review. **F-1414-1 is the whole reason this task exists; read it before scope 1.**
2. `src/sim/HeadlessContractSim.ts` — on `save/f1413-1-baron-graft-s1414`, lines 225-227 (the gate) and 392 (the flip).
3. `src/systems/WaveSystem.ts:833-897` — `spawnComponentBossWave`, in particular `:866` and the group id at `:854-855`.
4. `src/entities/pools.ts:732-745` — `degradeBossGroup`; note `remaining` **excludes** the killed enemy.
5. `assets/contracts/epoch-2-steamworks/contracts.json` → `e2-hill-mine` → `twist.baron`.
6. `tasks/f1413-1-baron-reland-on-cured-main.md` — the predecessor. Its scopes 2, 7, 9, 10 carry forward unchanged.

## WHY (evidence, quoted)

The predecessor run stopped itself with, verbatim:

> STOP — not READY-FOR-GATES. F-1400-3 remains live. […] `HeadlessContractSim.ts` withholds auto-secure until
> `baronBeaten`, but defeat handling only recognizes `eliteKind === 'baron'`; Hill Mine's component boss is
> `railcar`. The bound converts the former hang into a red but does not cure it.

s1414 verified that cause at source rather than inheriting it (chain of four links in `reviews/f1413-1.md`,
F-1414-1). It is correct. **`e2-hill-mine` declares `bossKind: "railcar"` and a five-part `components` array;
`WaveSystem.ts:866` spawns every part with `eliteKind: baron.bossKind ?? 'railcar'`, so the string `'baron'`
that `:392` waits for is never emitted, `baronBeaten` never flips, auto-secure is withheld forever, and the
run overruns `secureWave: 12` into the `e45cf7c5` ceiling at wave 15.**

This is the E1 bench's 5th and last driver. Landing it closes the bench at 5/5.

## SCOPE (numbered, each testable)

**1. Re-graft.** Start from `save/f1413-1-baron-graft-s1414` (`41065da7`), which is the predecessor's exact
work, already carrying the `HeadlessContractSim` call-site conversion and the `escortsSpawned` threading.
Apply it to current main **as a patch, never a branch merge**. Do not re-derive it from `lane/e2-arsenal`.

**2. Do NOT raw-checkout `WaveSystem.ts` (carried from the predecessor, unchanged and still binding).** The
lane's only legitimate change to that file is the `escortsSpawned` threading. A raw checkout would silently
discard the `Math.pow` cure from `eaefdb24` and re-open the cross-engine divergence that cost this thread
four fires. **Prove no `Math.pow` reappears**: grep the merged file and report the result.

**3. Cure the gate — and RULE, do not guess.** Make a component boss's full destruction flip `baronBeaten`.

⚠️ **The obvious predicate is wrong. `bossRemaining === 0` alone OVER-FIRES.** `bossGroupId` is written by
five systems — `WaveSystem.ts:880`, `SalvageClawBossSystem.ts:365`, `OldDiggerBossSystem.ts:428`,
`HomemakerBossSystem.ts:388`, `DredgeQueenBossSystem.ts:390` — so keying on group-death alone lets an
unrelated boss group's last kill secure a baron contract.

Recommended shape (derive it, do not paste it):

```ts
const baron = this.manifest.twist.baron;
const expectedKind = baron?.bossKind ?? 'baron';
const groupDown = event.bossGroupId === undefined || event.bossRemaining === 0;
if (event.type === 'enemy_killed' && event.eliteKind === expectedKind && groupDown) this.postBaronDefeat(event.at);
```

**Rulings you must make explicitly and report:**
- **(3a)** Does the single-baron path still work? For a plain baron, `bossKind` is absent → `expectedKind`
  is `'baron'`, `degradeBossGroup` returns `null` → `bossGroupId` undefined → `groupDown` true. **Verify by
  running a non-component baron contract, do not reason it out.**
- **(3b)** Can any of the four non-WaveSystem boss systems emit a kill whose `eliteKind` equals the *active
  contract's* `bossKind` while that contract also declares `twist.baron`? Check each. If yes, tighten the
  predicate to also require the group id to match the one `spawnComponentBossWave` built
  (`${contract.id}:wave-${wave}:${groupKind}`, `WaveSystem.ts:854-855`) and say so.
- **(3c)** `postBaronDefeat` (`:414-422`) already self-guards on `!baron || this.baronBeaten` and *rolls back*
  `baronBeaten` if `secureCurrentRun` fails. Confirm your predicate does not defeat that rollback by firing
  repeatedly on later kills. State what happens on the 2nd, 3rd component kill.

**4. The canary must go GREEN, measured the same way it went red.** Re-run the predecessor's control:
`node scripts/gr-sim.mjs --contract e2-hill-mine --mode escort --policy=idle` (**note `--policy=idle` — the
predecessor's literal command omitted it and stopped at stdin EOF; F-1414-3**).
- **Before** the cure, on the grafted tree: expect **rc 1**, `wave ceiling exceeded […] wave=15 ceiling=14`.
- **After** the cure: expect **rc 0**, secured at wave 12.
- 🔑 **You MUST first reproduce the RED.** A canary that is green on both the broken tree and the fixed one
  certifies its own aim, not your fix. If the red does not reproduce, **STOP and report** — the instrument is
  broken, not the diagnosis.
- Report whether the post-cure hash matches the clean-main control `fnv1a32:5ad506eb`, and **rule on what a
  match or a mismatch means**. Do not assume either is the pass condition.

**5. Derive every pin. Paste none.** No hash or kill count from any handoff, review or master is an input.
- Expect the baron secure bench at kills `869` / `fnv1a32:b9566c6d` and the CLI bench at `61` /
  `fnv1a32:235554f5` — these were **re-derived** by the predecessor, 3/3 on two engines, **so they are
  evidence, not stale pins** (F-1414-2). If yours differ, your cure changed the baron path: **say so loudly
  and explain**, do not re-pin silently.
- Prove 3/3 stability for anything you pin.

**6. Second-engine evidence (carried from predecessor scope 7).** Re-derive on Node **23.11.1** as well as
26.4.0. The gating fire structurally cannot produce this (F-1408-2 skips the cross-engine guard in a fire
shell), so it exists only if this run produces it.

**7. Report, do not fix, the `Balance.sparkRig` in-place mutation** in the grafted test (F-1414-4). Also
report the new test's duration and that it has no explicit timeout.

**8. Do NOT touch `tasks/goals.json`.** Flipping `e1-headless-baron` out of `blocked` is the draining fire's
paired act (fire.md §3.0, F-1384-1: two commits, code then leaf).

## FIREWALL

**TOUCH-ONLY:** `src/sim/HeadlessContractSim.ts` · `src/systems/WaveSystem.ts` · `scripts/gr-sim.test.mjs` ·
`assets/contracts/bench-seeds.json`

**NO:** `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · `playwright.config.ts` · `package.json` ·
any `src/systems/*BossSystem.ts` (read them for ruling 3b, **edit none**) · `src/entities/pools.ts` ·
`src/systems/CombatSystem.ts` · `src/core/EventBus.ts`. If the cure appears to need any NO file, **STOP and
report** — that is a finding, not a licence.

## SELF-CHECK (name real numbers, both engines where asked)

- [ ] `npx tsc --noEmit` rc 0
- [ ] `npm run build` green, with duration
- [ ] `node --test scripts/gr-sim.test.mjs` — full pass/fail counts and duration
- [ ] The escort canary **red reproduced first**, then green after the cure — both rc values and hashes quoted
- [ ] Rulings 3a, 3b, 3c each answered in prose with the evidence that settled them
- [ ] No `Math.pow` in `WaveSystem.ts` (grep output quoted)
- [ ] Every pin derived, 3/3 stable, and cross-checked on Node 23.11.1
- [ ] Adjacent suites: derive them **by grep** for the touched files, do not trust this list

**Ends: READY-FOR-GATES** + report the 3a/3b/3c rulings, the before/after canary pair, and any pin that moved.
