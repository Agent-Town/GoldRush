# Drain review — `sol/sprite-animator-src-slim` landed as the sprite-animation runtime (Opus drainer, 2026-09-15)

**Slice/branch/tip:** `sol/sprite-animator-src-slim` @ `c7f284ad4` — the uncommitted source half of Astra's sprite campaign (2026-09-08..12), re-based by the attended session onto `27227acdc` and committed as found, never gated. 35 files, +1,144/−456.
**Gated on:** `drain/sprite-animator`, the chain in the scratch worktree `wt-animator-land`. Every number below was measured on that chain; nothing is inherited from the branch's claims.
**Control:** `wt-control-main`, a git worktree detached first at `0ad8eff59` (my merge base) and then at `0ab60c10f` (current `origin/main`), each with its own vite on a private optimizer cache and its served source verified before use.
**Master:** `tasks/sprite-animator-runtime-land.md`. **Owner, 2026-09-15, verbatim:** "I care mostly about the quality of the animations and I had the impression that Astra really understood and nailed that. If it needs a bit more download, then ok. It is a once download, then use it local action." · "go, do both".
**Reviewer:** Claude Opus 5, drain reviewer. Main was never written, nothing was pushed, nothing was deployed, `STATUS.md` / `tasks/BACKLOG.md` / `tasks/goals.json` were never touched.

---

## VERDICT: **LAND, WITH ONE PRECONDITION** — the runtime is whole and gated; it needs 53 art files that are in git but not on main

The eleven conflicts are resolved and every resolution is written down below. tsc, both builds, the payload, stats, mp and the sixteen heat-13 tapes are green or attributed; the replay table is **byte-identical to the control on all 38 rows**, which is the proof the master asked for: an animation runtime moves no headless replay.

**The precondition (F-SAR-1).** The branch's runtime reads 53 processed-art files — seven town idle clips and their cells, the newsie's era-1 portrait, and the hero's per-direction `pan` / `attack` pose sheets — that exist **only in commit `92f6cc115`** ("Astra's sprite roster and factory review work as found uncommitted on 2026-09-12", retained, never merged). The attended `town-cast-original-cells-restore` that landed at `0ab60c10f` while I worked restored the nine **walk8** families and **not** these. Without them `npx tsc --noEmit` fails at seven `TS2307` module-not-found lines in `src/town/TownScene.ts` and the hero's work and attack poses have no cells. `assets/processed/**` is outside this drain's firewall, so I did not commit them: every gate below was run with the 53 files materialised into the working tree, untracked, and the exact list is committed at `artifacts/sprite-animator-runtime-land/required-art-half.txt`. **One command lands them:** `git checkout 92f6cc115 -- $(cat artifacts/sprite-animator-runtime-land/required-art-half.txt)`.

---

## 1. Merge classification — every conflict, resolved by reading both sides

`git merge --no-ff sol/sprite-animator-src-slim` on `0ad8eff59` → **11 conflicted files, 31 conflict hunks**, exactly as the master measured. Merge base `27227acdc`. Merge commit `dca019e23`.

Every conflict is Astra against Astra: main carries the boss-fidelity land (2026-09-12) and era 6 (2026-09-14); the branch carries the sprite worktree's edits to the same files. The rule applied throughout: **take the branch's animation, keep main's boss-fidelity and era-6 substance, and where the branch carries an older form of something main already has, keep main's.**

| file | hunks | resolution |
|---|---:|---|
| `package.json` | 1 | **UNION.** Main's `test:node-guards` is the longer chain (its own `run-node-guards.mjs` re-entry plus 30 guard files the era-6 land rooted); the branch adds one new script, `test:review-fixes`. Kept main's chain verbatim and kept the branch's `test:review-fixes` entry. The branch **also** appended `&& npm run test:review-fixes` to the battery — **held**, see F-SAR-2. |
| `src/assets/generated.ts` | 1 | **SPLIT.** Kept **main's** loader table (build-time `new URL(...)`, with main's own comment saying why a delayed `?url` import loses its default export, and main's `terrainOpenSea` row); the branch's side was the older `import('…?url').then(m => m.default)` form. Took the branch's two genuine additions into main's shape: the `heroGroundContactY` export, and the `charTownNewsie` row rewritten in main's build-time form. The branch's other three edits here (`charTownNewsie` in `nonCriticalGeneratedAssetSlots`, `copyWorldSpriteTint`, `GeneratedSpriteBatch.cloneMaterial` — the F-SPR-05 untinted-base clone) auto-merged and are kept. |
| `src/entities/pools.ts` | 2 | (a) boss-HP materials: both sides make the same `transparent`/`depthWrite:false` fix; **kept main's**, which also states `opacity: 1` explicitly. (b) boss-bar placement: **kept main's** `setScalar(modelBounds \|\| railcarMounted ? 1 : state.scale)` (the model-bounds anchoring is boss-fidelity's) **and took the branch's** Baron-banner block, which only fires when `state.groupId === null`, so the two do not overlap. Additionally **re-expressed main's `baronSpriteBobOffset`** on the new per-body model — see F-SAR-3. |
| `src/game/Game.ts` | 2 | (a) **kept main's** `heroVisualYAt` (era-6 resolves through `claimBoatView` / `flotillaView`) **and took the branch's** `primaryHeroVisualYAt`, which delegates to it, so the Old Digger's rider deck composes with the boat decks instead of replacing them. (b) Echo copy source: **kept main's** `run3dPilot.snapshot(…) ?? buildSystem.snapshotShape(…)`; the branch's `copyBuilding` is its own earlier version of the same feature. |
| `src/game/Run3dPilot.ts` | 2 | **Main's** on both (the `snapshot` member in the type and the lite-tier stub). The branch's `copyBuilding` **implementation** auto-merged as an addition and was **removed**: with main's API kept it is unreachable, untyped dead code. File is now byte-identical to main. |
| `src/systems/BuildSystem.ts` | 1 | **Main's** `snapshotShape`; the branch's `copyBuilding` dropped for the same reason. The branch's **other**, non-conflicting hunk here is kept and is the point of the file: `turretPosition()` now refuses ruined, zero-HP and suspended turrets (F-CR0908-4). |
| `src/systems/DredgeQueenBossSystem.ts` | 3 | **Main's** on all three (`dredgeQueen3dCenter` + `dredgeQueen3dBounds` + `dredgeQueen3dBarPoints` + `dredgeQueen3dShapeHulls`, and its render-interpolated centre computation). The branch's three hunks were a rename of the same logic (`presentationCenter`) to hoist it for the claw code — the claw code itself sits outside the conflicts and **is kept**: the fallback jaws now pivot at their inner ends, gain a pin and a cable, and open on the claw cycle. Two further branch hunks **reverted** — F-SAR-4. |
| `src/systems/EchoBossSystem.ts` | 9 | **Main's, and then the whole file reset to main's** — F-SAR-5. |
| `src/systems/HomemakerBossSystem.ts` | 5 | Imports **unioned** (main's `ConvexHull`, the branch's `RenderLayers`). The four value conflicts (arrival anchor `(8,0,4)` vs `(-12,0,-18)`, the runtime pictogram placement, the pictogram sprite scale) are competing tunings of the same thing: **kept main's**, which the boss-fidelity drain gated and eyes-on'd. The branch's ground-contact work outside the conflicts **is kept**: the `Homemaker9000.ContactShadow` circle at `RenderLayers.groundShadows`, scaled per pose, and the chair backrest moved from `z=+0.95` to `z=−0.95`. The branch's build-time pictogram offset was reverted to main's so the build-time and runtime placements agree. |
| `src/systems/LandYachtBossSystem.ts` | 5 | **Reset to main's** — F-SAR-6. |
| `src/systems/OldDiggerBossSystem.ts` | 4 | **UNION on three.** Kept main's `machineYaw` / `modelSupports` / ground-tilt fields and its yaw convention and 3-mesh GLB contract; took the branch's `wheelPhase` / `wheelSpeed` / `primitiveWheels` and their resets, the primitive wheel spin, the injected `visualY` ground sample (which the auto-merged `surveyMarker` line needs), the rider deck height and the yaw persistence. Fourth conflict **kept main's** (`meshCount !== 3`, ground supports) and two auto-merged branch hunks **reverted** — F-SAR-4. |

**Files the branch touched with no conflict, taken whole:** `src/assets/SpriteAnimator.ts` (+106, the per-body animator), `src/assets/character-runtime-frames.json` (+331), `src/assets/OrientationResolver.ts` (idle now keeps its own heading instead of collapsing to n/s/e/w), `src/assets/slots.ts`, `src/entities/Hero.ts` (the selected frame and its fade anchored at the Hero ground plane), `src/utils/dispose.ts` (skeletons disposed), `src/story/speakers.ts`, `src/town/{TownScene,townLayout,townsfolk}.ts`, `src/systems/{CrawlerBoss,E10StaticBoss,E7Arsenal}System.ts`, `src/game/{SaveSlots,TileStateStore}.ts`, `src/mp/LockstepClient.ts`, `functions/api/standings.ts`, `e2e/{elder-walk8-woman,town-cast-wiring}.spec.ts`.

**Held (reverted to main's), each with its finding:** `functions/api/_accounts.ts`, `server/ledger/storage.mjs`, `wrangler.toml`, `playwright.accounts.config.ts` (F-SAR-2) · `src/game/Balance.ts` (F-SAR-5).

---

## 2. What is not animation — the master's scope 2, file by file

The master asked that a non-animation hunk land only if its purpose is stated in Astra's review documents **and** `test:accounts` / `test:stats` / `test:mp` prove it. The documents exist: `reviews/sol-findings-code-review-20260908.md` names six defects, F-CR0908-1..6, and main already carries their guards (`scripts/review-{account-creation,mixed-hashes,party-retention,save-names,terminal-views,wrecked-turrets}.test.mjs`, landed by the sprites split on 2026-09-14). This branch is their missing source half.

| file | finding | purpose stated? | proof | verdict |
|---|---|---|---|---|
| `src/systems/BuildSystem.ts` `turretPosition` | F-CR0908-4 — destroyed turrets kept firing later-era weapons from an indestructible ruin | yes | `review-wrecked-turrets.test.mjs` on the merged tree; `test:node-guards` battery | **LANDED** |
| `src/systems/E7ArsenalSystem.ts` | the consumer of that fix (beam relay reads `turretPosition(index)`, not a position list) | yes, same finding | same, plus e2e `e7-roster` | **LANDED** |
| `functions/api/standings.ts` | F-CR0908-5 — solo traffic could evict a duo champion; retention partitioned only by rotation | yes | `npm run test:stats` **rc=0** (standings assay kv 320, sqlite 320, ledger worker HTTP 26); `review-party-retention.test.mjs` | **LANDED** |
| `src/game/SaveSlots.ts` | F-CR0908-6 — the prefilled manual-save name contains a comma, which `NAME_RULE` rejects, so Save without editing always failed | yes | `review-save-names.test.mjs` | **LANDED** |
| `src/mp/LockstepClient.ts` | F-CR0908-2 — adding an agent to a room disabled browser-to-browser desync detection (the quorum waited for a hash the headless seat never sends) | yes | `npm run test:mp` **rc=0**, 466 relay checks; `review-mixed-hashes.test.mjs` | **LANDED** |
| `src/game/TileStateStore.ts` | not in the code review — it is the Old Digger's `yaw` on the gentle payload, i.e. part of this branch's animation work (the machine keeps its heading across a restore) | yes, as animation | tsc + `e9-boss-old-digger` e2e | **LANDED** |
| `functions/api/_accounts.ts`, `server/ledger/storage.mjs`, `wrangler.toml`, `playwright.accounts.config.ts` | F-CR0908-1 | yes | **cannot be proven, and would break production** | **HELD — F-SAR-2** |
| `src/game/Balance.ts` | none | **no** | — | **HELD — F-SAR-5** |

---

## 3. THE REPLAY — the ADR-004 gate, and why the prescribed harness could not answer it

The master prescribes `node artifacts/maps-campaign-land-era6/replay-rows.mjs <worktree> animator`. Run on this tree it printed:

```
SUMMARY animator: holds 0, moves 0, no replay 0, unknown 0
```

**That is the harness, not the tree.** `replay-rows.mjs:9-11` reads each contract's first *verified board row* from the live county and `continue`s when there is none. The era-6 bump retired every era-5 reel, so every board is empty today — measured directly: `GET /api/standings?epoch=epoch-1-frontier&contract=the-claim` → `"board": []`, `"retiredCount": 10`. No tree can produce that table until heat 14 re-rides.

The question underneath it is answerable without the county, and I answered it: replay each heat-13 tape from `artifacts/gauntlet-heat13-569a41f9/rides/<contract>/submission.json` on both trees and compare the replayed event-log hash against the tape's own. Harness committed at `artifacts/sprite-animator-runtime-land/replay-tapes.mjs`; logs `replay-tapes-animator.log`, `replay-tapes-control.log`; machine-readable rows `replay-tapes-animator.json`, `replay-tapes-control-main.json`.

| contract | tape hash | this chain | control (`origin/main`) | verdict |
|---|---|---|---|---|
| e1-dry-gulch | fnv1a32:e490fcd5 | fnv1a32:036a109a | fnv1a32:036a109a | MOVES **on both** |
| e1-twin-banks | fnv1a32:… | NO REPLAY | NO REPLAY | same |
| e2-incline | fnv1a32:a489588e | NO REPLAY | NO REPLAY | same |
| e2-pressure-garden | fnv1a32:75473887 | NO REPLAY | NO REPLAY | same |
| e3-blackout-ridge | fnv1a32:ade266f4 | NO REPLAY | NO REPLAY | same |
| e3-canyon-works | fnv1a32:21952647 | NO REPLAY | NO REPLAY | same |
| e3-moth-season | fnv1a32:6f7df0c3 | NO REPLAY | NO REPLAY | same |
| e4-boneyard | fnv1a32:… | NO REPLAY | NO REPLAY | same |
| e4-dust-flats | fnv1a32:803c0a58 | NO REPLAY | NO REPLAY | same |
| e4-gusher-county | fnv1a32:0e24753e | NO REPLAY | NO REPLAY | same |
| e5-stillwater | fnv1a32:ca1df167 | NO REPLAY | NO REPLAY | same |
| e7-dead-band | fnv1a32:b3234ac0 | NO REPLAY | NO REPLAY | same |
| e7-echo-canyon | fnv1a32:d8c34088 | NO REPLAY | NO REPLAY | same |
| e7-relay-rush | fnv1a32:e4238fc2 | NO REPLAY | NO REPLAY | same |
| **e7-relay-valley** | fnv1a32:41eea3b5 | **fnv1a32:41eea3b5** | **fnv1a32:41eea3b5** | **HOLDS** |
| e8-eclipse | fnv1a32:b1e52be6 | NO REPLAY | NO REPLAY | same |
| e8-mare-claim | fnv1a32:5ace32f2 | NO REPLAY | NO REPLAY | same |
| e9-dome-basin | fnv1a32:15d21e4a | NO REPLAY | NO REPLAY | same |
| **the-claim** | fnv1a32:22ca1b99 | **fnv1a32:22ca1b99** | **fnv1a32:22ca1b99** | **HOLDS** |

**38 rows compared machine-to-machine (19 tapes on disk, 19 receipts with no heat-13 submission). ZERO differ.** Two hold on both trees; sixteen refuse to install on both (`declared runStart is not installable by this door`, the ADR-005 grammar retirement); `e1-dry-gulch` moves to the same hash on both — the era-6 campaign's effect, already recorded in `reviews/maps-campaign-land-era6.md` §3 with the identical hash. **No hunk in this chain moves a headless replay.**

---

## 4. The era pin

```
this chain: 19dee7d35039db4895af94b24e642f96e9b353a7a0f334d30da5ad44de4d58da
main   (pin #2, 2026-09-14): f3a347a9ba697c04f7393fd30d03703bc3bb5d806abaab77fda6ee9773adec3e
```

`src/` is in `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36-44`), so the runtime moves the hash. Appended as a **same-era** pin (era 6, "the Re-surveyed Claims") with `aliases: []`, and the file's top-level `engineHash` moved with it — the shape `node-guards-timeout` and the boss-fidelity drain both learned the hard way. Cause names this master and both halves of what moved: presentation, and one sim-visible fix (`turretPosition` now refuses ruins). `node --test scripts/engine-era-guard.test.mjs scripts/bench-seeds.test.mjs` → **9/9, rc=0**.

---

## 5. Gate table — every number measured on this chain

| gate | result | numbers |
|---|---|---|
| `npx tsc --noEmit` | **GREEN** | 0 lines, with the 53 art-half files present (F-SAR-1); **7 × TS2307 without them** |
| `npm run build` | **GREEN** | rc=0 |
| `GR_RELEASE=e1 npm run build` | **GREEN** | rc=0 |
| `node scripts/first-town-payload.mjs` (release build) | **GREEN** | **48,914,924 B** of **52,000,000** (3,085,076 B headroom). Main after its own restore: 48,879,817 B (`reviews/town-cast-original-cells-restore.md`) → **delta +35,107 B**, +0.07 %. The owner's "if it needs a bit more download, then ok" costs 35 kB |
| `npm run test:stats` | **GREEN** | rc=0 — standings assay kv 320 checks, sqlite 320, ledger worker HTTP 26 |
| `npm run test:mp` | **GREEN** | rc=0 — multiplayer relay 466 checks |
| `npm run test:accounts` | **RED, PRE-EXISTING ON MAIN** | `Error: account registry did not start: The entry-point file at "functions/api/_account-registry.ts" was not found.` Measured on the **base** tree before any merge — F-SAR-2 |
| `node --test scripts/engine-era-guard.test.mjs scripts/bench-seeds.test.mjs` | **GREEN** | 9 tests, 9 pass, 284 ms |
| heat-13 replay, 38 rows, this chain vs control | **IDENTICAL** | §3 |
| e2e, 15 specs × 2 projects, one worker, own vite on 5360 with a private optimizer cache | **98 passed / 10 failed** of 108 | §6 — 4 of the 5 distinct reds are pre-existing on main by control; 1 is mine (F-SAR-7). After the final `origin/main` merge the four touched specs were re-run: **20 passed / 6 failed** of 26, the 6 being the same pre-existing plain-boot reds (`e2e-after-merge.log`) |
| full `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, Node 26 | **793 pass / 1 fail / 2 skip of 796**, 388.7 s | §7 — the one fail is `desk-declaration-guard.test.mjs:163` refusing a linked worktree by design |

Node 26.4.0 (`/opt/homebrew/bin` first on PATH) for every command. The dev servers used a **private** vite `cacheDir` (F-DRB-9: `node_modules/.vite` is a symlink into the primary checkout and shared by every vite on this host; without a private cache a symlinked worktree manufactures 504s and boot failures that read exactly like a catastrophic regression).

---

## 6. e2e

15 specs × 2 projects = **108 tests, one worker**, on this chain's own vite (5360, private optimizer cache): **98 passed / 10 failed**, 7.2 min (`artifacts/sprite-animator-runtime-land/e2e-merged-final.log`). The ten are five distinct tests × two projects, and **four of the five are pre-existing on main**, proven by a control run, not by a label.

**The control had to be re-taken twice, and the reason is worth recording.** The first control sweep read 32 failures — nearly all `page.waitForFunction: Test timeout` waiting for `frame > 10`. That server was not the control: `dev-private-cache.mjs` had refused port 5361 (`Error: Port 5361 is already in use`) and an earlier server from THIS worktree still held it, serving a tree whose assets I was deleting and re-creating underneath it. The log is kept as `e2e-control-contaminated.log` — **a control you did not verify is serving the control tree is not a control.** The verified runs below checked the served source directly (`curl .../src/assets/slots.ts | grep -c charTownNewsie` → 0 on the control, 1 on this chain).

| red (both projects) | this chain | control | attribution |
|---|---|---|---|
| `057-baron-rocket-cart.spec.ts:251` kited Baron | FAIL | **FAIL** on `0ad8eff59` | **PRE-EXISTING**, as `reviews/drain-review-boss-fidelity.md` §4 already records |
| `e7-roster.spec.ts:164` plain Signal-era boot | FAIL (`e7Arsenal.enabled` false) | **FAIL**, same assertion | **PRE-EXISTING** |
| `e8-roster.spec.ts:172` plain Orbital-era boot | FAIL | **FAIL**, same assertion | **PRE-EXISTING** |
| `e9-roster.spec.ts:173` plain Red Fields boot | FAIL | **FAIL**, same assertion | **PRE-EXISTING** |
| `wire-crawler-3d.spec.ts:115` renderer counts | FAIL: `coldBaseline.triangles=149626 outside band [147704, 147710]` desktop, `146040 outside [144118, 144124]` mobile | **PASS 2/2** on `0ad8eff59` **and PASS 2/2 on current `origin/main` `0ab60c10f`** | **MINE — F-SAR-7** |

Control transcripts: `e2e-control-v2.log` (five distinct tests × two projects on `0ad8eff59`: 8 failed / 2 passed — the 2 passed are the crawler), `e2e-control-crawler-current.log` (the crawler alone on `0ab60c10f`: **2 passed**, 17.1 s).

**Green, and worth naming:** the three roster specs' other five tests each (the re-pointed ownership assertions pass on both projects), `elder-walk8-woman` (the re-point), `town-cast-wiring`, `m1-01`, `m2-01`, `task-025` (10/10 both projects — the load flake the era-6 drain saw did not recur), `e3-crawler-boss`, `e5-boss-dredge-queen` **including `:237`, the mobile p95 coin flip F-DRB-10 names**, `e6-boss-homemaker`, `e9-boss-old-digger`, `e7-echo-canyon-mirror`. Zero console and page errors everywhere they are asserted — which is the plain-boot question §10 of the constitution asks, and the boss and town specs answer it on both viewports.

---

## 7. The node-guards battery

`GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, Node 26.4.0, on the final chain with `origin/main` merged in, nothing else running:

**796 tests · 793 pass · 1 fail · 2 skipped · 388.7 s · every stage ran (`nul-audit` CLEAN, and `test:review-fixes` — new, rooted by this land — 24/24).**

The single failure is `scripts/desk-declaration-guard.test.mjs:163` "the live board is green under this guard (baseline is honest)", and it is the guard **refusing a linked worktree on purpose**:
```
desk-declaration-guard: REFUSING — this is a linked worktree and its STATUS.md
  line-1 is NOT the one main carries. … A PASS would certify a board this run never read
  (F-2232-1 / F-2241-1 / F-2242-1). Re-run from the main worktree, or pass --root <main worktree>.
```
Attributed, not cured, exactly as the master instructs. The attended session should re-run it from the primary checkout after the fast-forward.

**It took three battery runs to get here, and that is the finding worth keeping.** `fixture-teardown.test.mjs` sweeps 140 guard files and reports **one** child failure per run, so each cure revealed the next:

| run | fail | child | disposition |
|---:|---:|---|---|
| 1 | 3 | `gate-caller-audit` FAIL (`npm:test:review-fixes` no caller) · `law-pointer-guard` FAIL (2 pointers) · the sweep's knock-on | cured: four review guards rooted, two pointers re-based |
| 2 | 1 | `sprite-cell-url-inlining.test.mjs:184` — `20 !== 19`, "update this census when the delayed loader estate changes" (the newsie's loader) | cured: census 19 → 20 with the cause at the site |
| 3 | 1 | `desk-declaration-guard.test.mjs:163` — linked-worktree refusal | by design |

Run 1's log is kept beside the final one (`battery-node26.log`, 408.5 s, 791/3) precisely because it shows what a single run hides. **A battery run on a tree that had a red in it is not a verdict on that tree.**

---

## 8. Findings

### Blocking until one command runs

**F-SAR-1 — the runtime's other half is in git and not on main. 53 files.** `src/town/TownScene.ts` imports seven `char-*-idle.frames.json` manifests; `src/assets/character-runtime-frames.json` names 35 per-direction hero `pan`/`attack` cells (`…-south-clean-v7-r0c0.png` and siblings); `src/story/speakers.ts` and `src/town/townsfolk.ts` name `townsfolk-newsie-e1.png`. **None of the 53 is on `origin/main`.** All 53 are in `92f6cc115` — "Astra's sprite roster and factory review work as found uncommitted on 2026-09-12 … no src changes; committed by the attended session for retention, not yet gated". The two halves of one campaign were committed to two places and only one has landed; `town-cast-original-cells-restore` (`0ab60c10f`) restored the nine **walk8** families, which is a different set.
Measured without them: `npx tsc --noEmit` → **7 × TS2307** in `TownScene.ts`; the hero's work and attack poses resolve to nothing.
**This drain did not commit them** — `assets/processed/**` is on the master's NO list. Every gate in this review was run with them materialised untracked. The list is `artifacts/sprite-animator-runtime-land/required-art-half.txt`; the cure is one line, and it belongs in the same commit as the fast-forward:
```sh
git checkout 92f6cc115 -- $(cat artifacts/sprite-animator-runtime-land/required-art-half.txt)
```
A second, smaller question rides with it: `92f6cc115` also holds the Dredge Queen / Old Digger / salvage-claw **pilot rebuilds**, which F-SAR-4 wants. That is a separate, larger decision (they are GLBs with their own contracts and budget) and is **not** part of this cure.

### Held, with the reason measured

**F-SAR-2 — the account-registry rewrite cannot land, and `npm run test:accounts` is already RED on main.** The branch rewrites `functions/api/_accounts.ts` so that `loadOrCreateAccount` never reads KV: it calls `kv.resolveAccount` (present only on the SQLite adapter the branch adds to `server/ledger/storage.mjs`) or, failing that, a Durable Object through `env.ACCOUNT_REGISTRY` + `ACCOUNT_REGISTRY_SCOPE`, and **throws 503 when neither is available**. `wrangler.toml` gains the binding, pointing at `script_name = "gold-rush-account-registry"` and citing `docs/ops/account-registry.md`.
Three things are true and each alone is disqualifying:
1. **The worker does not exist.** `functions/api/_account-registry.ts` is in neither `origin/main` nor this branch; `scripts/test-accounts.mjs:285` spawns wrangler with exactly that path as `main`. Nor does `docs/ops/account-registry.md`.
2. **`npm run test:accounts` is therefore red on main today** — measured on the **base** tree, before any merge: `Error: account registry did not start: ✘ [ERROR] The entry-point file at "../../../functions/api/_account-registry.ts" was not found` (`artifacts/sprite-animator-runtime-land/test-accounts-on-main.log`). This is a pre-existing red the sprites split introduced on 2026-09-14 by landing the guards without the worker; it is not this chain's, and this chain cannot cure it.
3. **In production it would 503 every sign-in.** Pages binds KV, which has no `resolveAccount`; with no deployed registry worker and no `ACCOUNT_REGISTRY_SCOPE`, `registryRequest` throws on the first login — including for accounts that already exist, because the new path no longer reads `account:<emailHash>` first.
**Held:** `functions/api/_accounts.ts`, `server/ledger/storage.mjs`, `wrangler.toml`, `playwright.accounts.config.ts` (its `node scripts/test-accounts.mjs --serve` route starts the same absent registry; main's `wrangler pages dev` command does not). Also held: the branch's append of `&& npm run test:review-fixes` to `test:node-guards` — the `test:review-fixes` **script** is kept, but chaining it into the battery would make the battery red at `review-account-creation.test.mjs` for exactly this reason.
**Cure, and it is a real one:** land `functions/api/_account-registry.ts` (it must exist somewhere in Astra's trees — the guards were written against it), write `docs/ops/account-registry.md`, deploy and bootstrap the registry with `scripts/bootstrap-account-registry.mjs`, and only then land these four files and chain `test:review-fixes`. **Owner-scoped:** it deploys a new Cloudflare worker and migrates live account identities. F-CR0908-1 is a real P1 and deserves this, but not inside an animation drain.

**F-SAR-4 — two GLB contracts the branch wrote against models that are not on main; both reverted.**
(a) **Dredge Queen claw cycle.** The branch gates the claw mesh on `morphTargetInfluences.length === 2` **and** `morphTargetDictionary.Cycle_OpenGrab === 1`, then drives influence `[1]` from the claw cycle. Measured: **no dredge-queen GLB on main carries `Cycle_OpenGrab`** — all three (`dredge-queen.glb`, `…-detail-sol.glb`, `…-detail-opus5.glb`) expose only `Damage_BrokenPortPaddle`, `Damage_BrokenStarboardPaddle`, `Damage_CrackedLootHold`, `Damage_SlackClaw`. Landed as written, the gate would have dropped the claw from `dredgeQueen3dMeshes` entirely and silently lost its **damage** morph and emissive. Reverted to main's one-influence gate, with the reason written at the site. **The fallback primitive's jaw cycle is kept and works** — it is geometry the branch itself builds.
(b) **Old Digger split bucket wheels.** The branch declares `bucket_wheel_port` / `bucket_wheel_starboard`, validates `meshCount !== 4`, and spins both about z. Main's `old-digger.glb` exposes **three** nodes — `bucket_wheels`, `gantry`, `tape_deck` — and main pins `OLD_DIGGER_3D_TRIANGLES = 16_104` where the branch pins `7_192`: **a different model.** Landed as written, the 3D Old Digger would never mount. Main's contract kept; the GLB spin held because that single `bucket_wheels` node's pivot is unmeasured and a blind rotation would swing the assembly through the ground. **The primitive chassis wheels do turn** — and the branch's orientation fix under them is real and kept: the wheel cylinders' axles now run along Z (`rotation.x = π/2`) instead of along X, which is what lets them spin at all.
**Cure:** land Astra's rebuilt pilots from `92f6cc115` as a separate, budgeted batch, then re-apply these two hunks against the models that arrive with them.

**F-SAR-5 — the Echo jar, and `Balance.copyOpacity`.** The branch rebuilds the jar as a `CylinderGeometry` + `MeshBasicMaterial` with torus rims, and re-tunes the copies (`emissiveIntensity` 0.7 → 0.25, mote radius 0.14 → 0.196, `Balance.e7Boss.copyOpacity` 0.58 → 0.88). Main's jar is the boss-fidelity land's: a `LatheGeometry` glass in `MeshPhysicalMaterial`, brass rims, and a camera-facing additive halo shader. They are two designs, not two halves of one, and the branch's copy lifecycle (`ownsGeometry`) belongs to the `copyBuilding` API that this merge did not keep. **`src/systems/EchoBossSystem.ts` is byte-identical to main; `src/game/Balance.ts` is byte-identical to main.** The master holds `Balance.ts` unless a review names the reason: no Astra review document mentions `copyOpacity`, so it is held on that rule as well as on this one. Nothing here is animation.

**F-SAR-6 — the Land Yacht, reset to main's.** The branch replaces the sprite-plate components with a GLB mount (`body`, `components`, `ensureModel`, `releaseModel`, `fallbackComponent`). Main **already has that GLB mount** — it is F-DRB-3, landed 2026-09-12 with the deploy-mirror line that makes the model reach the droplet — and main also keeps the sprite plates as its loading/lite/failed fallback, where the branch throws them away for primitive boxes. Main's is the strictly larger version. A partial merge here produced a file that referenced both worlds; rather than hand-stitch two designs, `src/systems/LandYachtBossSystem.ts` is byte-identical to main. Nothing in the branch's version is animation.

### Fixed in this drain

**F-SAR-3 — `baronSpriteBobOffset` had no field left to read.** Main's boss-fidelity land added `EnemyPool.baronSpriteBobOffset`, consumed by `Game.ts:6817` (the rocket cart rides the Baron's bob) and by `scripts/check-baron-presentation.mjs:94-95`. It reads `this.baronSpriteAnimator` — **a field F-SPR-05 deletes**, because there is no single shared Baron animator any more. The merge kept main's getter and the branch's deletion, and tsc caught it (`TS2339`). Re-expressed on the new model:
```ts
const baron = this.activeBaron();
return baron ? this.spriteAnimations.get(baron.id)?.animator.motion.bobOffset ?? 0 : 0;
```
Same value, read from the body that owns it. This is the one place where the two Astra trees genuinely contradicted rather than duplicated.

**F-SAR-8 — the first-town payload declaration had to follow the data.** The hero's `pan` and `attack` clips moved from `char-hero-sheet-work8.png` / `char-hero-sheet-attack8.png` to five per-direction sheets. `assets/first-town-payload.json` excludes deferred families **by name**, so the probe refused to produce any number at all: `char.hero.pan is deferred but char-hero-sheet-work8-east-clean-v1.png is not in assets/first-town-payload.json excluded, so a reader cannot tell it was a decision` — five such lines, rc=1. Replaced the two rows with five, each carrying the same hero-slot-clip-split reason. The **budget itself was not touched**; the two old families now appear in the cue-window corpus cross-check as `UNDECLARED (reported, not counted)`, which is the probe's own non-gating channel.

### Reported, not fixed

**F-SAR-7 — the crawler map's cold baseline draws 1,922 more triangles, and this chain is the cause.** `e2e/wire-crawler-3d.spec.ts:115`:
```
renderer count coldBaseline.triangles=149626 outside band [147704, 147710]   (desktop)
renderer count coldBaseline.triangles=146040 outside band [144118, 144124]   (mobile)
```
**+1,922 on both projects, exactly** — the signature of a constant amount of added scene geometry, not a per-viewport effect. Control: **2/2 PASS on `0ad8eff59`** and **2/2 PASS on current `origin/main` `0ab60c10f`** (`e2e-control-crawler-current.log`, 17.1 s), so it is neither pre-existing nor the town-cast restore's.
**I deliberately did not re-record it**, for the reason `e2e/renderer-count-artifact.ts:24-30` states and F-DRB-7 restated: the artifact is a REQUIRED INPUT, a re-record needs a `rerecorded` provenance block with all three triangle phases on both projects and confirming runs, and the spec aborts at the first mismatch — so this drain only ever learned the cold number. `artifacts/wire-crawler-3d/**` is also outside this drain's firewall.
The two new geometries I can name (`Homemaker9000.ContactShadow`, a 28-triangle circle; the town-cast blob shadows' vertex-colour rebuild in `TownScene.ts`) do not account for 1,922 and the second is not in this map, so **the source hunk is not yet identified** — saying otherwise would be a guess. **Cure (fire-authorable, small):** a corrective that measures `coldBaseline` / `mounted` / `loadedBeforeKill` / `disposed` on a quiet board, both projects, with confirming runs, and re-records with provenance naming this land.

**F-SAR-9 — the prescribed replay harness cannot produce a table on today's county, for any tree.** `artifacts/maps-campaign-land-era6/replay-rows.mjs` reads each contract's first *verified* board row and skips a contract with none. The era-6 bump retired every era-5 reel, so every board is `"board": []` today (measured). Run on this chain it printed `holds 0, moves 0, no replay 0, unknown 0`. **A reader who takes that summary at face value would conclude the tapes were checked.** The replacement this drain wrote (`artifacts/sprite-animator-runtime-land/replay-tapes.mjs`) answers the ADR-004 question off disk and works on any tree; the era-6 harness should either be re-pointed to the retired rows (`includeRetired`) or retired in favour of it, after heat 14 re-rides.

---

## 9. What I touched

**Committed on `drain/sprite-animator` only.** Main, the primary checkout, `STATUS.md`, `tasks/BACKLOG.md` and `tasks/goals.json` were never written. Nothing was pushed, nothing deployed. The county was read with GET only.

| file | why |
|---|---|
| the merge commit `dca019e23` | scope 1: `sol/sprite-animator-src-slim` + the eleven resolutions |
| `e2e/e7-roster.spec.ts`, `e8-roster.spec.ts`, `e9-roster.spec.ts` | scope 3: the obsolete shared-animation source assertion replaced by three per-body-ownership assertions, with a dated cause |
| `e2e/elder-walk8-woman.spec.ts` | the standing Elder plays an idle cell now; one assertion re-pointed with its cause (the branch had already re-pointed this spec's foot-contact formula) |
| `assets/engine-era.json` | scope 5: same-era pin #3, `aliases: []`, top-level `engineHash` moved with it |
| `assets/first-town-payload.json` | F-SAR-8: five excluded-family rows replace two the hero's per-direction sheets made stale. The budget is untouched |
| `package.json` | the union of the two `test:node-guards` chains, plus `test:review-fixes` — narrowed to the four guards this land makes green, and rooted in the battery |
| `scripts/fire.md`, `scripts/law-pointer-baseline.json` | two law pointers re-based by reading, then `--update` (diffed: exactly two entries) |
| `reviews/sprite-animator-runtime-land.md` | this file |
| `artifacts/sprite-animator-runtime-land/**` | every transcript behind every number above, plus `replay-tapes.mjs` and `required-art-half.txt` |

**Reverted to main's, deliberately:** `src/systems/EchoBossSystem.ts`, `src/systems/LandYachtBossSystem.ts`, `src/game/Balance.ts`, `functions/api/_accounts.ts`, `server/ledger/storage.mjs`, `wrangler.toml`, `playwright.accounts.config.ts` — each with a finding above. `src/game/Run3dPilot.ts` is byte-identical to main by resolution rather than by revert.

**Tracked evidence the specs rewrote, and restored.** The e2e sweeps rewrote **41 tracked files** under `artifacts/{056,057,e3-crawler-boss,lane-roster-wiring-e{7,8,9}-01,multiplayer-relay,wire-crawler-3d}/` and `reviews/shots-{e5-boss-dredge-queen,homemaker,town-cast,wire-dq-3d}/`. Those are earlier waves' committed evidence, not mine to replace: every one was restored with a path-scoped `git checkout --` before each commit. The list is `artifacts/sprite-animator-runtime-land/rewritten-tracked-evidence.txt`.

**Not committed, and this is the precondition:** the 53 files of F-SAR-1, materialised untracked from `92f6cc115` so the gates could run. They are listed in `artifacts/sprite-animator-runtime-land/required-art-half.txt`. **The fast-forward is not complete without them.**

**Scratch, deliberately uncommitted:** the control worktree `wt-control-main` (detached, never committed to), the thin `ctl-main` archive tree, and the private vite cache directories. Every dev server in this drain used a **private** `cacheDir`, and the one time a server silently failed to take its port the resulting "control" read 32 phantom failures — see §6.
