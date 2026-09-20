# Drain review — `sol/boss-art-fidelity-review` (boss fidelity, epochs 1–10)

**Slice:** Astra's two-day boss-fidelity pass · **Branch under review:** `sol/boss-art-fidelity-review`, one commit `d9b9f985c` ("feat: improve final boss fidelity across epochs 1–10", 2026-09-09), 691 files.
**Gated on:** `drain/boss-fidelity` @ `a1de7da1c` — the MERGED tree (`403c996cd` + `d9b9f985c`, merge commit `a1de7da1c`). Every number below came from a command run on that tree in the scratch worktree `wt-boss`; nothing is inherited from the branch's own claims.
**Control:** `wt-boss-control` detached at main `4de75d9e7`. Main advanced one commit past my base (`403c996cd` → `4de75d9e7`) while I worked; that commit is `docs/OWNER-DESK-2026-09-06.md` only (+3 lines), so the control is **code-identical** to my merge base. Verified: `git diff --stat 403c996cd..4de75d9e7` = 1 file, 3 insertions, docs.
**Reviewer:** Claude Opus 5, drain reviewer, 2026-09-12. Task master: `tasks/drain-review-boss-fidelity.md`.

---

## VERDICT: **LAND** — all ten bosses, whole, with the three review fixes, the crawler re-record and one same-era pin

Every gate that matters is green or attributed on the merged tree: tsc and both builds, the first-town payload (+5,080 B), stats/accounts/mp, the GLB contract guard, the three presentation probes, and — the ADR-004 gate — **all 17 verified county rows replay to their board hashes on this tree** (16 HOLDS + the one row that is already stale on main; attended re-check of the 16 heat-13 tapes: 16/16 HOLDS, `artifacts/drain-review-boss-fidelity/replay-*-attended.log`). Of the nine e2e reds, six are pre-existing on main (057, e10-static-boss, f-bw-16 on both projects), one was a load flake, one was the crawler's stale renderer pin (re-recorded here with provenance, F-DRB-7) and one is an unmeasurable host-speed coin flip on both trees (F-DRB-10). Of the seven battery reds, three were fixed on the branch by the reviewer, one was pinned at land, one was fixed on main, one was contention (green alone) and the fixture sweep was their knock-on. Eyes-on: eight rebuilt GLBs mount in game, ADR-001 holds (no firearms, no gore, no peoples). Landed by the attended session on 2026-09-12 after the owner asked for a lean review; the reviewer's evidence was reused, not re-run, wherever it already answered the question.

---

## 1. Merge classification

`git merge --no-ff sol/boss-art-fidelity-review` → **clean, zero conflicts**, one auto-merge (`assets/LEDGER.md`). Merge base `d41ab98ce (archive: pruned by the A3 rewrite)`; 39 main commits landed between the base and my tree.

| class | count | files |
|---|---:|---|
| **MAIN-MOVED ∩ LANE-TOUCHED** (the only true conflict surface) | **1** | `assets/LEDGER.md` — union verified by measurement, not by eye: main's added row 75 (`portraits-era-aging-2-batch`) is **PRESENT** in the merged file, and **16 of 16** non-empty lane-added lines are present. Neither side lost a line. |
| **LANE-TOUCHED, main untouched** (modified) | 61 | 10 boss systems + `Game.ts` · `Run3dPilot.ts` · `RunSuspend.ts` · `HeadlessContractSim.ts` · `pools.ts` · `vite.config.ts` · `scripts/asset-diet.manifest.json` · `scripts/glb-contract-guard.baseline.json` · 41 files under `assets/pilots/*` (8 boss GLBs + build sources/READMEs) |
| **NEW** | 629 | `src/utils/buildingShapeSnapshot.ts` · 8 `assets/layer-contracts/*.v1.json` · 8 `assets/raw/*-atlas-fidelity-e*.png` · 3 `scripts/check-*-presentation.mjs` · 11 `reviews/sol-*` · `docs/proposals/BOSS-FIDELITY.md` · 563 `artifacts/boss-fidelity/**` · 31 `artifacts/boss-art-fidelity-2026-09-08/**` · 5 new pilot files |

Merge commit: `a1de7da1c` on `drain/boss-fidelity`. Nothing was pushed; main was not touched.

---

## 2. Gate table — every number measured on the merged tree

| gate | result | numbers |
|---|---|---|
| `npx tsc --noEmit` | **GREEN** | 0 lines of output |
| `npm run build` | **GREEN** | rc=0, built in 1.88 s; asset-diet 409 manifest GLBs 834,442,472 → 121,977,484 B (85% cut); bosses family **7** GLBs 26,337,172 → 4,989,588 B |
| `GR_RELEASE=e1 npm run build` | **GREEN** | rc=0, built in 1.15 s; 56 manifest GLBs 116,470,344 → 16,101,548 B; bosses family **1** GLB |
| `node scripts/first-town-payload.mjs` | **GREEN** | **33,856,374 B** vs the 35,000,000 B gate (**1,143,626 B / 3.3% headroom**), rc=0. Control on main: **33,851,294 B**. Branch delta **+5,080 B** (+0.015%). |
| `npm run test:node-guards` (full) | **731 pass / 9 fail / 2 skip of 742 — first stage only (F-DRB-8)**, then the reds attributed one by one | 607 s (`gate-node-guards.log`). The nine reds are seven distinct: `engine-era-guard` + `bench-seeds` (the merged tree's hash unpinned — pinned at land), `goal-tracker` (`b89f70c70 (archive: pruned by the A3 rewrite)` 9-char sha: PRE-EXISTING on main, fixed on main in `ad0964552`), `deploy-mirror-allowlist` (FIXED, F-DRB-3), `gate-caller-audit` (FIXED, F-DRB-5), `law-pointer-guard` (FIXED, F-DRB-6), `gr-sim.test.mjs:208` "a reactive client can recover from rejected orders" 20 s timeout (CONTENTION — two sibling batteries ran beside it; **24/24 green alone**, 363 s, `boss-gr-sim.log`), plus the fixture-owner sweep's knock-on. The full battery re-run after the pin is in §8 |
| `npm run test:stats` | **GREEN** | rc=0 — standings assay kv 320 checks, sqlite 320 checks, ledger worker HTTP 26 checks, contract clock census 42/24/18/0 |
| `npm run test:accounts` | **GREEN** | rc=0 — accounts kv 43 checks, accounts sqlite 43 checks |
| `npm run test:mp` | **GREEN** | rc=0 — multiplayer relay 466 checks |
| engine era hash (`scripts/engine-era-guard.test.mjs`) | **4/5 — expected** | 5 tests, 4 pass, 1 fail: the merged tree's hash is unpinned. Control on main: **5/5**. |
| GLB contract guard | **GREEN** | `glb-contract-guard.test.mjs` 20/20 pass; `scripts/glb-contract-guard.mjs` rc=0 — 413 production GLBs, 67 violations, **67 grandfathered, 0 live**; bosses family max texture now **1024²** |
| `scripts/check-baron-presentation.mjs` | **GREEN** | rc=0, both viewports (1280×800, 390×844), `"errors":[]` |
| `scripts/check-railcar-presentation.mjs` | **GREEN** | rc=0, 3 contracts × 2 viewports = 6 cases, `noseDotVelocity: -1` everywhere, `"errors":[]` |
| `scripts/check-crawler-presentation.mjs` | **GREEN** | rc=0, both viewports, `"errors":[]` |
| e2e (31 specs, both projects, 1 worker, port 5320) | **213 passed / 9 failed** of 222; every red attributed (§4) | `e2e-merged.log`; attended single-worker re-runs on a quiet box (fires stopped): `boss-e2e-rerun.log`, `ctrl-057.log`, `ctrl-dq.log`, `boss-dq*.log`, `crawler-rerecord.log` |

### The merged-tree engine hash

```
merged:  86e60c92f65b8b3f7c42dc285c619c1e73b9d931899c72035bf9236f13b13509
main:    09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4   (era-5 pin #85, pinned 2026-09-07)
```

The hash moves because `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36-44`) covers `src` **and** `assets/layer-contracts` — so the eight new layer contracts move the hash even without the source change. A LAND verdict must append an era-5 pin for `86e60c92…` with its cause; this review does not pin it (the master reserves the pin for the landing decision).

---

## 3. THE REPLAY ATTRIBUTION — the ADR-004 gate

**Method.** I read the live board GET-only (`https://agenttown.app/api/standings?epoch=<e>&contract=<c>`, 37 door contracts enumerated from `public/skill.md`'s door-contracts block + `assets/contracts/epoch-*/contracts.json`; `e1-drill-yard` is standings-disabled). Exactly **17** rows read `secured: true, assay: verified`. For each I fetched the reel payload (`&reel=<id>`), which carries the tape's `inputLog` and the board's own `eventLogHash`, and replayed that payload with `scripts/assay-replay.mjs` on **both** trees. All 17 are agent tapes, so all 17 route through `assay-replay-agent.mjs` → `HeadlessContractSim` — the exact file this branch changes. Raw: `artifacts/drain-review-boss-fidelity/county/`, `replay-merged/`, and `wt-boss-control/artifacts/drain-replay-control/out/`.

| # | contract | boss on that map | board hash | main hash | merged hash | verdict |
|---:|---|---|---|---|---|---|
| 1 | e1-dry-gulch | — | `fnv1a32:e490fcd5` | `fnv1a32:e490fcd5` | `fnv1a32:e490fcd5` | **HOLDS** |
| 2 | e1-twin-banks | — | `fnv1a32:3104ad94` | `fnv1a32:3104ad94` | `fnv1a32:3104ad94` | **HOLDS** |
| 3 | e2-incline | **Claim-Jumper Baron — armored railcar, 3 components, wave 20** | `fnv1a32:a489588e` | `fnv1a32:a489588e` | `fnv1a32:a489588e` | **HOLDS** |
| 4 | e2-pressure-garden | — | `fnv1a32:2bb1df56` | `fnv1a32:e5b7e24a` | `fnv1a32:e5b7e24a` | **MOVES ON BOTH — PRE-EXISTING** |
| 5 | e3-blackout-ridge | — | `fnv1a32:ade266f4` | `fnv1a32:ade266f4` | `fnv1a32:ade266f4` | **HOLDS** |
| 6 | e3-canyon-works | **Rival Dynamo Crawler — 3 components, wave 14** | `fnv1a32:21952647` | `fnv1a32:21952647` | `fnv1a32:21952647` | **HOLDS** |
| 7 | e3-moth-season | — | `fnv1a32:6f7df0c3` | `fnv1a32:6f7df0c3` | `fnv1a32:6f7df0c3` | **HOLDS** |
| 8 | e4-gusher-county | — | `fnv1a32:0e24753e` | `fnv1a32:0e24753e` | `fnv1a32:0e24753e` | **HOLDS** |
| 9 | e7-dead-band | — | `fnv1a32:b3234ac0` | `fnv1a32:b3234ac0` | `fnv1a32:b3234ac0` | **HOLDS** |
| 10 | e7-echo-canyon | — | `fnv1a32:d8c34088` | `fnv1a32:d8c34088` | `fnv1a32:d8c34088` | **HOLDS** |
| 11 | e7-relay-rush | — | `fnv1a32:e4238fc2` | `fnv1a32:e4238fc2` | `fnv1a32:e4238fc2` | **HOLDS** |
| 12 | e7-relay-valley | — | `fnv1a32:41eea3b5` | `fnv1a32:41eea3b5` | `fnv1a32:41eea3b5` | **HOLDS** |
| 13 | e8-eclipse | — | `fnv1a32:b1e52be6` | `fnv1a32:b1e52be6` | `fnv1a32:b1e52be6` | **HOLDS** |
| 14 | e8-mare-claim | — | `fnv1a32:5ace32f2` | `fnv1a32:5ace32f2` | `fnv1a32:5ace32f2` | **HOLDS** |
| 15 | e9-devils-alley | — | `fnv1a32:687553f2` | `fnv1a32:687553f2` | `fnv1a32:687553f2` | **HOLDS** |
| 16 | e9-dome-basin | — | `fnv1a32:15d21e4a` | `fnv1a32:15d21e4a` | `fnv1a32:15d21e4a` | **HOLDS** |
| 17 | the-claim | — | `fnv1a32:22ca1b99` | `fnv1a32:22ca1b99` | `fnv1a32:22ca1b99` | **HOLDS** |

**HOLDS 16 · MOVES ON THIS BRANCH 0 · moves on both (pre-existing) 1 · NO REPLAY 0.**

**Landing this branch retires nothing.** No row on the county board moves because of it.

Two facts the table is owed:

- **Only two of the 17 are boss maps at all.** A scan of every `twist.baron` in `assets/contracts/epoch-*/contracts.json` finds exactly four contracts with a boss variant (`e3-canyon-works` dynamo_crawler, `e4-dust-flats` land_yacht, `e5-deepwater-claim` dredge_queen, `e6-glow-mesa` homemaker_9000) plus `e2-incline`'s default Baron railcar. Of the 17 standing rows, only **e2-incline** and **e3-canyon-works** carry a boss. Both hold. The other 15 exercise the changed files only through shared construction, and they hold byte-for-byte too.
- **e3-canyon-works genuinely exercises the changed sim path.** Its boss arrives at wave 14 and the reel secured at wave 15 / 454.833 s, so the crawler was on the field. See F-DRB-2 for the residual risk this does *not* clear.

**The one moving row is not this branch's.** `e2-pressure-garden`'s standing row (reel `agent-8f52861e-…`, submitted 2026-09-03, engine pin `a607a81f44e1…` — an *older* pin than heat 13's `09838c35…`) replays to `fnv1a32:e5b7e24a` on **main and merged alike**, with an identical outcome on both (`w12 / 126 g / 360 s`). Its board row records **52 g**. It is already stale on main today; see F-DRB-1.

**Correction to the master's framing:** the master calls these "17 verified heat-13 rows". Fifteen are. Two are not — `e2-pressure-garden` (2026-09-03) and `e9-devils-alley` (2026-09-04) predate heat 13, and `e9-devils-alley` was never ridden in heat 13 at all (`artifacts/gauntlet-heat13-569a41f9/matrix.md` row 34: no tape, 2 s wall). Both were tabled anyway.

---

## 4. e2e — the classified list

The reviewer's sweep (31 specs × 2 projects = 222 tests, one worker, port 5320) read 213 passed / 9 failed. The attended session re-ran every red single-worker on a quiet box, on the merged tree (vite 5330) and the control (vite 5331).

| red | projects | attribution |
|---|---|---|
| `057-baron-rocket-cart.spec.ts:251` kited Baron — `blast-charge-arm` never starts (`:257`) | both | **PRE-EXISTING on main**: the control fails both projects single-worker (`ctrl-057.log`: 2 failed / 10 passed); the sprites drain's control fails it too |
| `e10-static-boss.spec.ts:153` recession hands the secured claim to the T10 finale | both | **PRE-EXISTING**: control batch 1 fails both projects (`wt-boss-control/artifacts/drain-replay-control/e2e-control-batch1.log`) |
| `f-bw-16-baron-siege.spec.ts:131` unblocked Baron fight keeps its deterministic baseline | both | **PRE-EXISTING**: control batch 2 fails both projects (`e2e-control-batch2.log`) |
| `lane-baron-props-detail.spec.ts:7` launcher and keg mount | desktop | **LOAD FLAKE**: green single-worker on the merged tree (`boss-e2e-rerun.log`) |
| `wire-crawler-3d.spec.ts:115` renderer count `mounted.triangles` 157812 → 157592 | desktop (mobile identical) | **REGRESSION-BY-DESIGN, F-DRB-7, RE-RECORDED this drain**: `mounted` and `loadedBeforeKill` −220 on both projects, `disposed` measured UNCHANGED (a first −220 guess was refuted by the run and kept at its measured value), provenance block in both artifacts; confirming runs desktop 3/3, mobile 4/5 (the one red an unrelated geometry poll at `:144`) — `crawler-rerecord.log` |
| `e5-boss-dredge-queen.spec.ts:237` boss-run p95 within 15 % of the non-boss tile | mobile | **UNMEASURABLE ON THIS HOST, NOT A REGRESSION (F-DRB-10)**: frame p95 lands in one of two modes (~9 ms or ~16 ms) on BOTH trees, so the 15 % ratio is a coin flip — merged mobile 6 runs: ratios 1.03, 1.74 ✗, 0.57, 1.80 ✗, 0.65, 0.98; control 4 runs: 1.01, 0.55, 0.63, 1.01 (`attended-boss-dq*.log`, `attended-ctrl-dq*.log`). The other symptom, `THREE.GLTFLoader: Couldn't load texture blob:…` in the console, reproduces on the CONTROL too (`attended-ctrl-dq-m3.log`, 1 of 4; merged 2 of 6) — pre-existing on main |

---

## 5. Eyes-on — the ten bosses

Each line is from an image I opened on this tree. Canon checked against `lore/characters.md` and ADR-001 (frontier-tech, **no firearms ever**; illustrated, never gory; enemies are outlaws/companies/machines).

Eight of the ten GLBs changed on this branch: `baron-props`, `crawler`, `dredge-queen-detail-opus5`, `homemaker-9000`, `land-yacht`, `old-digger`, `railcar`, `salvage-claw-detail-opus5`. All eight mount in game — the captures below are the proof, not the loader constants.

| # | boss | reads as its lore entry? | ground contact | image |
|---:|---|---|---|---|
| E1 | **Claim-Jumper Baron** | **Yes.** The body is still the approved illustrated sprite — top hat, oxblood coat, crossed-pickaxe banner. His props are a three-tube timber **sky-rocket rack**, one rocket and a powder keg: worked timber grain, brass bands, teal rings where the "before" was flat clay-orange. Lore says he returns "with machines" fielding sky-rockets (`lore/characters.md:26`); these are sky-rockets, **not firearms** — ADR-001 holds. No gore. | **Right.** Sprite planted on the ground with its contact shadow; the boss bar sits clear above the banner. | `artifacts/boss-fidelity/e1-baron/after/desktop-telegraph-props.png`, `after-props-neutral.png` vs `before-props-neutral.png` |
| E2 | **Armored Railcar** | **Yes**, with a caveat about *what you can see*. On the rail line at the run camera the locomotive is only ~40 px wide, so the new armored cab, running gear and reservoirs are not legible in normal play; the props crop shows them. The Baron's own machines are canon-bound to be "clean pristine iron, honest mechanical damage" (`lore/characters.md:21`) — no gold seams, no fever. It is. | **Right**, and now *provably*: `check-railcar-presentation.mjs` measures `noseDotVelocity: -1` on all 3 contracts × 2 viewports — the branch replaced the enemy-yaw-derived heading with a velocity-derived rail yaw, so the stock can no longer swing across its own rail. | `artifacts/boss-fidelity/e2-railcar/after/desktop-intact.png`, `after/desktop-intact-props.png` |
| E3 | **Rival Dynamo Crawler** | **Yes — the clearest win of the ten.** Ribbed brass insulator stacks, a teal capacitor bank, a long drain-mast boom, tracks. It reads unmistakably as electrical machinery, which is exactly F-BF-06's ask. Machines are machines; no face, no gore. | **Right.** The chassis sits in its own teal lamp pool with a contact shadow, and the model now tilts to the terrain normal (`groundCrawler3d`, `CrawlerBossSystem.ts:~600`) rather than floating flat. The boss bar is anchored off the model's own projected bounds, not a fixed offset. | `artifacts/boss-fidelity/e3-crawler/final-route-framed/desktop-intact.png` |
| E4 | **Land Yacht** | **Yes — and it exists in play for the first time.** Six spoked wheels, a timber deck, a teal-windowed layered bridge with a domed top, railings, a black stack, an **open articulated grapple** on the bow. F-BF-05 recorded that no source file imported `land-yacht.glb`; `LandYachtBossSystem.ts:15` now does. Wheeled ship, not a wagon. | **Right.** All six wheels meet the ground and the cast shadow agrees with the scene's other shadows. | `artifacts/boss-fidelity/e4-landyacht/runtime-optimized/desktop-orbit-8.png` |
| E5 | **Dredge Queen** | **Yes.** Hull, twin paddle wheels, lattice derrick, red cloth, the grab. Reads as a working river vessel. | **Right** for a vessel — she sits *in* the teal water pool, not on it. ⚠️ The component labels (PORT PADDLE / CLAW / STARBOARD PADDLE) still overlay meaningful parts of the model at the run camera — F-BF-09's presentation complaint is **unfixed**, and this branch did not claim to fix it. | `artifacts/boss-fidelity/e5-dredge-queen/runtime-final-2/desktop-intact.png` |
| E6 | **Homemaker-9000** | **Yes — F-BF-01 delivered.** Rounded cream pressure vessel, flared teal scalloped skirt, deeply inset amber lens, and the big corrugated flexible **vacuum hose** curling to its head, brass drying rack on top. It reads as a cleaning appliance, not a beveled cabinet. No weapon of any kind. | **Right.** The skirt base meets the terrain with a cast shadow. Legible at 390 px too — the model fills the frame without clipping the HUD. | **I had to capture this myself** — see F-DRB-4. `artifacts/drain-review-boss-fidelity/eyes-on-homemaker/{desktop,mobile}-homemaker.png`, act 1, both components live, `errors: []`. |
| E7 | **Echo** | **Yes, and correctly *not* a monster.** Tilted mirrored copies of the town's own buildings standing in the field — which is what the art describes (a mirrored settlement) and what the findings file argued for instead of importing a boss GLB. The branch's `buildingShapeSnapshot.ts` is what makes the copies real geometry rather than translucent boxes. | **Right.** The mirrored buildings are deliberately canted (they are *wrong* copies) but each casts a shadow consistent with the ground it stands on. | `artifacts/boss-fidelity/e7-echo/production-settled/desktop-mirror-arrived.png` |
| E8 | **Salvage King's Claw** | **Yes.** A domed pavilion crowned with spires, standing on articulated anchor-feet with boarding ladders — a salvage fortress, per F-BF-02's ask. Canon-safe: it is the Baron's by-proxy E8 machine (`lore/characters.md:26`), a machine, not a person. | **Right** in the landed state: the feet plant and the long directional shadow matches. (The airborne state is a separate read; `full-desktop-airborne.png` is banked beside it.) | `artifacts/boss-fidelity/e8-salvage-claw/production-settled/full-desktop-landed.png` |
| E9 | **Old Digger** | **Yes — and it keeps its redemption.** A long bucket-wheel excavator with conveyor gantry and twin teal lamp-eyes, industrial mass restored per F-BF-03. The banner reads "It arrives still working. It does not attack. It unmakes." It has **no wreck state** — which the lore requires: the Baron stays on the green world *with the Old Digger* (`lore/characters.md:26`, ruling #20). | **Right.** It sits in a shallow worked depression with a contact shadow — it looks like it is digging, not hovering. | `artifacts/boss-fidelity/e9-old-digger/production-v6/desktop-working.png` |
| E10 | **the Quiet** | **Yes, and correctly *not* a machine.** A desaturated field with a heart-shaped white absence spreading in rings around a warm vent, the Prospector and an agent inside it. The findings file argued that inventing a physical mechanical boss here would contradict the reference; it was not invented. "THREE PRESERVES — keep one lantern lit, one song playing, one portrait untouched." | **N/A by design** — the Quiet is a ground-plane absence, not a body. The one physical object in frame (the warm vent) is planted. | `artifacts/boss-fidelity/e10-quiet/production-v4/desktop-pressure.png` |

**Canon sweep:** zero firearms across all ten (the Baron's rack is sky-rockets; every other boss is unarmed machinery or an effect). Zero gore. Every enemy is an outlaw, a company machine, or a phenomenon — no peoples. ADR-001 and ADR-003 hold.

---

## 6. Findings

### Fixed on this branch by the drain (each under 20 lines, each with the guard that proves it)

**F-DRB-3 — BLOCKER, FIXED. The newly-wired Land Yacht GLB would not have reached the droplet.** `scripts/deploy-mirror-allowlist.test.mjs:97` red on the merged tree, green on main:
```
AssertionError: every derived runtime file ships
  actual: [ 'assets/pilots/land-yacht-3d/land-yacht.glb' ]   expected: []
```
The mirror allowlist in `scripts/deploy.sh:378-386` names **every** boss GLB one by one — railcar, dredge-queen, ark-plaza, old-digger, homemaker, crawler, salvage-claw, baron-props. The land yacht was never on it because, until this branch, **nothing imported it** (that is exactly F-BF-05's "Created but not loaded"). `LandYachtBossSystem.ts:15` now imports it, so it entered the runtime closure the mirror is measured against and fell straight through the closing `--filter=-s *`. Consequence had this landed unfixed: the assay droplet's tree would be missing the E4 boss model — the branch's single biggest player-facing win would work locally and 404 on the box.
**Fix:** one filter line + a three-line reason at `scripts/deploy.sh:379-383`. **Proof:** `node --test scripts/deploy-mirror-allowlist.test.mjs` → **1/1 pass, rc=0** (`artifacts/drain-review-boss-fidelity/fix-mirror-proof.log`).

**F-DRB-5 — FIXED. Three new gate-shaped scripts with no caller and no recorded reason.** `scripts/gate-caller-audit.test.mjs` red: `FAIL — 3 gate(s) with no caller and no recorded reason`, naming `scripts/check-{baron,crawler,railcar}-presentation.mjs`. All three are real, useful probes — I ran all three green on this tree — but each drives a chromium against a **running vite dev server** (their own first lines say "Run against scratch Vite"), and `test:node-guards` spawns no server, so they cannot simply be rooted there. I recorded them in `scripts/gate-caller-baseline.json` as grandfathered orphans on the established `halo-reextraction-check.mjs` precedent, each with the evidence I measured rather than a wave-off, and each carrying the recommendation to fold the three probes into one `e2e/` spec so the existing `webServer` hosts them.
**Fix:** 3 entries in `scripts/gate-caller-baseline.json` (+7/−2 lines). **Proof:** `node --test scripts/gate-caller-audit.test.mjs` → **45/45 pass, rc=0** (`fix-gate-caller-proof.log`).

**F-DRB-6 — FIXED. Law-pointer rot, the CLAUDE.md §4.10b lifecycle, seventh occurrence at this coordinate.** `scripts/law-pointer-guard.test.mjs` red: `POINTER DRIFT scripts/fire.md -> src/game/Game.ts:2641`. The branch adds **+56 lines to `Game.ts`**, 11 of them above this site (the Baron shoulder-launcher fields, `crawlerNightSpeed`, the land-yacht suspend wiring, the Echo shape-snapshot callback). **Substance verified by reading, not by arithmetic:** merged `Game.ts:2652-2653` and control `Game.ts:2641-2642` are **byte-identical** — the `placeBuilding`/`panAt` adapter pair the pointer cites moved and did not change.
**Fix:** re-based `scripts/fire.md`'s citation `:2641-2642 → :2652-2653` with the measured +11 and the control comparison written into the clause, then `node scripts/law-pointer-guard.mjs --update`. The `--update` touched **only** that one pointer (`law-pointer-baseline.json`: `2641 → 2652`, 4 lines) — verified by diff, so no other rot was ratified (the trap MEMORY names). **Proof:** `node --test scripts/law-pointer-guard.test.mjs` → **22/22 pass, rc=0** (`fix-law-pointer-proof.log`).

All three fixes live **outside** `ENGINE_SOURCE_INPUTS`, so the merged-tree engine hash is unchanged by them — re-measured after all three: `86e60c92f65b8b3f7c42dc285c619c1e73b9d931899c72035bf9236f13b13509`.

### Not fixed — reported, with the cure named

**F-DRB-7 — THE ONE THING THAT SHOULD NOT LAND AS IS.** `e2e/wire-crawler-3d.spec.ts:115` red:
```
renderer count mounted.triangles expected exact 157812, got 157592
```
157812 − 157592 = **220**, exactly the crawler GLB's triangle reduction (`CrawlerBossSystem.ts:15`, `CRAWLER_3D_TRIANGLES` 11_980 → 11_760). The branch updated the **loader's** pin and left the **renderer's** pin stale: `artifacts/wire-crawler-3d/renderer-counts-{desktop,mobile}-chrome.json` still pin `mounted.triangles: 157812`, `loadedBeforeKill.triangles: 159688`, `disposed.triangles: 148672`.

**I deliberately did not re-record it**, and the reason is the file's own law. `e2e/renderer-count-artifact.ts:24-30` states the artifact is "a REQUIRED INPUT, not an output… Do NOT 'fix' this by writing a baseline… A new spec adds its expectations by MEASURING them", and the file's `provenance.rerecorded` block demands a date, a task, the commit measured on, a method, and `confirmingRuns`. A correct re-record needs all three triangle phases on **both** projects with confirming runs on a quiet host — and the spec aborts at the first mismatch, so this drain only ever learned the first number. Blessing the one value I saw is precisely the write-only behaviour F-1476-1 was filed against.
**Cure:** a corrective that re-measures the three triangle phases × two projects on a quiet board and re-records with a `rerecorded` provenance block naming this branch as the cause. Under 20 lines of JSON; it is the *measurement* that takes the time, not the edit.

**F-DRB-1 — a standing county row is already stale on main, independently of this branch.** `e2-pressure-garden`'s verified row (reel `agent-8f52861e-…`, submitted 2026-09-03, engine pin `a607a81f44e1…`) replays to `fnv1a32:e5b7e24a` on **both** trees against a board hash of `fnv1a32:2bb1df56`, and its replayed outcome is `w12 / 126 g / 360 s` where the board row records **52 g**. Under ADR-004 that row no longer replays, today, on main. This branch neither causes nor cures it. **Owner/attended call**, not a fire's: retire the row, or re-ride the map under the live engine. Note it is one of the two rows in the standing 17 that are **not** heat-13 rides.

**F-DRB-2 — the sim change is real, and the 17 standing rows cannot detect it.** `HeadlessContractSim.ts:1996-2004` + `:2834-2837` and the symmetric `Game.ts:3093-3102` + `:6496-6498` make every `dynamo_crawler` component share **one** night-speed light sample taken from the body before any component moves, where each component previously sampled the light at its own position. Applied to both engines, which is the right shape (cross-engine parity preserved). Exactly one contract carries that variant — `e3-canyon-works` — and it *does* exercise it (boss at wave 14, the reel secured at wave 15 / 454.833 s). Its hash holds **byte-for-byte on both trees**, so the tape's own light geometry happens not to separate per-component from one-body sampling. **That is an observation about this tape, not a proof the change is inert.** A future reel on that map, with lamps placed so the 8-unit-long crawler straddles the lit edge, would behave differently from an identical pre-branch run. The engine-era pin is the mechanism that records this; it is why the pin's cause must name the sim change, not just the art.

**F-DRB-4 — the pilot boss shipped with no committed visual evidence.** `artifacts/boss-fidelity/e6-homemaker/` carries **171 files and zero images** (33 json, 82 log, 43 mjs, 14 py, 7 md — measured by extension). Its own `runtime-v12-optimized/report.json` references `desktop-default.png`, which is not in the commit; `PUBLISHED-EVIDENCE.md` says bulk screenshots were deliberately left unversioned. The Homemaker is the boss `sol-findings-boss-art-fidelity.md` named as "best first remodeling pilot" (F-BF-01), so it is the one whose before/after a reviewer most needs. **I captured it myself** rather than take the claim on trust (`artifacts/drain-review-boss-fidelity/eyes-on-homemaker/`, recipe from `e2e/e6-boss-homemaker.spec.ts`, boss wave 8, act 1, both components live, `errors: []` on both viewports) — and F-BF-01 is genuinely delivered. Non-blocking; the gap is in the evidence, not the work.

**F-DRB-8 — the node-guards battery cannot report a full result once anything reds, and this drain hit that.** `test:node-guards` is one long `&&` chain: a first-stage failure means the ~25 later steps (`test-ticker-stats`, `test:findings-state`, `test:blocker-panel`, `test:ruling-propagation`, `test:desk-declaration`, the second `node --test` list of 22 files, `nul-audit`) **never execute**. This run stopped after stage 1, so **those steps are UNMEASURED on this tree** — I am not calling them green. This is a property of the battery, not of the branch, but it means "the full battery" cannot be honestly claimed for any tree with a red in it. Worth a corrective: run the stages unconditionally and aggregate, the way `run-node-guards.mjs` already does within stage 1.

**F-DRB-9 — a drain-harness hazard worth writing down: the shared vite optimizer cache.** A scratch worktree whose `node_modules` is a symlink into the primary checkout also shares `node_modules/.vite` — which resolved, measured, to `/Users/robin/Claude/Projects/Gold Rush/node_modules/.vite`, concurrently in use by **eight** vite servers from other trees (ports 5246, 5247, 5248, 5268, 5270, 5319, 5321 and mine). The branch adds a genuinely new dependency (`three/examples/jsm/math/ConvexHull.js`, `CrawlerBossSystem.ts:2`), so my server had to re-optimize, and the other servers kept invalidating the result: **every** boot returned `504 (Outdated Optimize Dep)` on `three_examples_jsm_math_ConvexHull__js.js` and the game never booted — `__GR_TEST__` absent, zero frames, repeatable across reloads. It reads exactly like a catastrophic branch regression and is not one: with a private `cacheDir` the same tree boots in **under 3 s, frame 153, zero console/page errors**. Every e2e and presentation number in this review was taken with an isolated cache (`artifacts/drain-review-boss-fidelity/dev-private-cache.mjs`). **Any future drain in a symlinked worktree must do the same or it will manufacture reds.**

**F-DRB-10 — the E5 mobile perf gate cannot be measured on this host, and the console error it also shows is main's.** `e2e/e5-boss-dredge-queen.spec.ts:237` asserts boss-run frame p95 ≤ 1.15 × the non-boss tile's. On this Mac each p95 sample lands in one of two modes (~9 ms or ~16 ms) regardless of tree: the control's own runs read non-boss 16.6 / boss 9.2 and 16.3 / 10.3, the merged tree's read 9.3 / 16.2 and 9.2 / 16.6 — the same two numbers, swapped. A ratio gate over a bimodal host is a coin flip (the same lesson as the first-town byte probe, 2026-09-06). The merged tree also logged `THREE.GLTFLoader: Couldn't load texture blob:…` in two of six mobile runs — and so did the control in one of four (`attended-ctrl-dq-m3.log`), so it is pre-existing on main, likely a blob-URL lifetime race in the shared-atlas load path, not the rebuilt GLB (whose single image is a plain 1024² RGB PNG, distinct by content hash from the other two Dredge Queen GLBs' images). Not blocking. **Correctives (fire-authorable):** (1) measure the E5 boss-run p95 on a quiet board with ≥ 8 samples per arm and a mode-aware comparison before trusting this gate again — the branch's `ConvexHull` shape-hull work in `DredgeQueenBossSystem.ts` is the one plausible new per-frame cost and deserves a real number; (2) investigate the texture-blob console error on main.

**F-DRB-11 — `test:node-guards` silently skips twenty guard files, and two of them are red on main today.** `package.json`'s `test:node-guards` chain reads `… && npm run test:desk-declaration scripts/e10-squall-scheduler.test.mjs scripts/board-tape-gold.test.mjs … scripts/rider-parity-context-press.test.mjs && node scripts/nul-audit.mjs`: the twenty file names after `test:desk-declaration` are passed to `scripts/desk-declaration-guard.mjs` as arguments it ignores, so they never run in the battery (the `&& node --test` that once preceded them is gone; `git log -S` finds no commit that removed it, so it may never have been there). Found because F-DRB-8's stage-2+ re-run printed the desk-declaration banner with the twenty names in its argv. Run by hand on the control (main `403c996cd`, Node 26, `attended-swallowed-control.log`): the first, concurrent run on the sparse control read 116 pass / 4 fail, but two of those four were artifacts of running two copies at once on fixed ports and of excluded paths in a sparse worktree, so both trees were re-run SERIALLY: the merged tree's twenty files read **121 pass / 2 fail** (`attended-swallowed-boss-serial.log`) and the six suspects on the PRIMARY, non-sparse main checkout read **29 pass / 2 fail** (`attended-swallowed-main-primary.log`) — the SAME two on both trees: `relay-rush-reel.test.mjs:151` ("heat 12 still replays to its declared score through the assayer own seam", `Error: malformed tape`) and `run-tape-envelope-budget.test.mjs:88` ("both blocker fixtures are admitted, and they were always measured on the wrong artifact", `Dome Basin w16 (heat 12): the county door admits it`). Both are heat-12 expectations written before ADR-005 retired the old order grammar on 2026-09-07; the strict door now refuses those reels' retired verbs, so the fixtures read as malformed or refused. PRE-EXISTING on main and hidden exactly as long as the chain has skipped them. `hero-move-verb`, `rider-parity-retirement`, `board-tape-gold` and `e8-air-suit-human` are green on both trees. **Correctives (attended or fire, small):** (1) one-line chain fix in `package.json` — insert `&& node scripts/run-node-guards.mjs` (or `node --test`) before the twenty names; (2) re-point the two heat-12 expectations to the ADR-005 retirement ruling; Not blocking this land: none of the four reds is attributable to the branch (the merged tree's own run of the twenty is in `attended-swallowed-boss.log`).

**Two trivia, recorded and deliberately not fixed:** (a) the `### E9 Old Digger fidelity` LEDGER row is the only one of the eight that cites no SHA-256 for its atlas — but the hash **is** recorded, in `assets/layer-contracts/old-digger.v1.json`'s `rawSha256`, and I verified it matches the committed PNG (`771f97ac9a2439a0…`). Nothing is uncited; only the LEDGER row is less complete than its siblings. (b) The eight new layer contracts are not written to one shape: six carry `$schema`/`batch`/`asset`/`assetSha256`, while `old-digger.v1.json` and `salvage-claw.v1.json` use `raw`/`rawSha256`/`sha256` and omit `$schema`. No guard enforces a shape, so this is a consistency note, not a red.

---

## 8. The full battery after the pin (attended)
Run on the FINAL chain `7c44a0cb0` (= the merge `a1de7da1c` + the three fixes + pin #86 + main `ad0964552` merged in), Node 26 on PATH (`/opt/homebrew/bin`), fires stopped, nothing else running on the host: `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` → **stage 1: 742 tests, 740 pass, 0 fail, 2 skipped, 814 s; stages 2–7 (ticker stats, findings-state, blocker-panel, ruling-propagation, desk-declaration, nul-audit CLEAN) all green; chain rc=0** (`attended-battery-node26-final-chain.log`). The contention guard read "absent when alone".

Two earlier attempts are banked beside it as evidence, not as verdicts: (a) the reviewer's stage-1 run before the fixes (731/9, §2); (b) an attended run on the pre-merge chain that the default PATH node (v23.11.1) made INVALID — node 23 bounds `--test-timeout` at file granularity, so `gr-sim.test.mjs` was cancelled whole at 300 s and `node-guards-timeout.test.mjs` diagnosed exactly that ("this node (v23.11.1) bounds --test-timeout at FILE granularity … NOT a timing flake"); its three other reds were the pin shape (each pin must carry `aliases: []` and the file's top-level `engineHash` must move with it, fixed in the pin commit), the 9-char goals sha (fixed on main, merged in), and their fixture-sweep knock-on (`attended-battery-node23-invalid.log`, `attended-battery-node23-stages2-7.log`). Lesson recorded: the battery is only a verdict on Node 26.

**What the battery does NOT cover (F-DRB-11):** the chain silently skips twenty guard files; they were run by hand, see the finding.

---

## 7. What I touched

**Committed on `drain/boss-fidelity` only.** Main, the primary checkout at `/Users/robin/Claude/Projects/Gold Rush`, the sibling `wt-sprites` worktree and `STATUS.md` were never written. Nothing was pushed. The county was read with GET only — `artifacts/drain-review-boss-fidelity/county/read-board.mjs` and `read-reels.mjs` contain no POST and no write verb of any kind.

| file | why |
|---|---|
| the merge commit `a1de7da1c` | scope 1 |
| `scripts/deploy.sh` (+4) | F-DRB-3 fix |
| `scripts/gate-caller-baseline.json` (+7/−2) | F-DRB-5 fix |
| `scripts/fire.md` (+1/−1), `scripts/law-pointer-baseline.json` (+2/−2) | F-DRB-6 fix |
| `assets/engine-era.json` | the era-5 pin (scope 2): pin #86 `86e60c92…`, appended attended |
| `artifacts/wire-crawler-3d/renderer-counts-{desktop,mobile}-chrome.json` | F-DRB-7 re-record with provenance (attended) |
| `artifacts/boss-fidelity/e3-crawler/final-route-framed/*.png` | the crawler presentation probe's captures (10, 5 MB) |
| `reviews/drain-review-boss-fidelity.md` | this file |
| `artifacts/drain-review-boss-fidelity/**` | every transcript behind every number above |
| `tasks/BACKLOG.md` | scope 7 |

**Tracked evidence the specs rewrote, and restored.** The e2e sweep is a screenshot-writing suite: running it rewrote **116 tracked files** under `artifacts/054/`, `artifacts/055/`, `artifacts/056/`, `artifacts/057/`, `artifacts/baron-presence/`, `artifacts/wire-crawler-3d/`, `artifacts/e1-baron/`, `artifacts/e3-crawler/`, `artifacts/e10-*/`, `reviews/shots-*/` and siblings. These are the *previous* wave's committed evidence, not mine to replace, so every one was restored with a path-scoped `git checkout --` before committing; the full list is `artifacts/drain-review-boss-fidelity/rewritten-tracked-evidence.txt`. The only evidence this drain adds is under `artifacts/drain-review-boss-fidelity/`.

**Scratch, deliberately uncommitted:** `playwright.s5320boss-merged.config.ts` (and its control twin) — matched by `.gitignore:28 playwright.s*.config.ts`, the house convention, verified with `git check-ignore`. The control worktree `wt-boss-control` is detached and was never committed to.
