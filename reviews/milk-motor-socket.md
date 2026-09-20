> **DRAIN RECEIPT — s1496, merged `346ce0463e315fda20f93f91b23d2f8646a02f06`.** This shift's verdict below is
> preserved verbatim (retention law: supersede, never delete). Gated on the MERGED tree in a detached
> worktree (`gate-s1496`, §3.0b custody). **Battery:** `tsc` rc=0 · `build` rc=0, 1.17s · own spec
> `er01-e4-census` **8/8** · adjacent **68/68** (the eight remaining `er01-e*-census` + `drill-yard-manifest`
> + `contract-bundle-validation`) · `test:node-guards` rc=0, **zero `not ok`** (mandatory — touches
> `src/agent/`). All `--workers=1`; Node **v26.4.0** per `.nvmrc`.
>
> ✅ **THE CONTROL RUN WAS RE-DONE ON CLEAN MAIN, AND IT VINDICATES THIS REVIEW'S CONCLUSION.** The s1495
> drain order named this slice as the one to *"CONTROL-RUN before blaming"*, and the answer is that the
> `agent-view.spec.ts` reds are **main's, not this slice's**: at clean main `4a67acc96`, **4 failed / 4
> passed**; on the merged tree, **the same 4** — `:264` and `:297`, both projects — with **12 passed**.
> Identical fingerprint on both sides, so the merge introduces no red. F-MOTOR-1's root cause is confirmed
> as stated: `e1-drill-yard` became the sixth E1 contract while the spec and `e1-mechanics-manifests.json`
> fixture still expect five.
>
> 🟥 **ONE CORRECTION — F-1496-1: this review under-counts its own red.** It reports *"2 desktop reds"* and
> *"the same two tests failed on the pristine tree"*. Measured at clean main, it is **4 across BOTH
> projects** — `:264` and `:297` fail on desktop-chrome *and* mobile-chrome alike. The review's control arm
> evidently ran one project while its first battery ran both, which is why its own text reads *"4 failures"*
> in one place and *"two tests"* in another. **The substance is right and the finding stands; only the
> count was wrong** — and a next reader fixing the fixture would have gated on 2 greens and left 2 red.
> *This is the same shape as this shift's own F-MOTOR-2 (a miscount inherited from a grep), which makes it
> worth naming rather than quietly fixing: a control arm must match the ORIGINAL run in composition, not
> just in flags.*
>
> ⓘ The review's note that the **F-1460-1 Baron pin red is no longer present** is confirmed independently:
> `test:node-guards` is green here with zero `not ok`. It was cured s1462; no future drain should go looking
> for that expected red.

# milk/motor-socket — THE MOTOR SOCKET

**Slice:** E4's signature mechanic becomes visible to agents
**Branch:** `milk/motor-socket` · **Base:** `f38638438` · **Verdict:** **PARTIAL — shipped the half that was real, refused the half that was not**

## What it does

E4's Motor era had four contracts, all rejected, all declaring a `missing` signature consumer. The shift's premise was that a socket like E2's pressure socket (`6fd24a3b`) would admit them. **Measurement says otherwise, and the honest result is smaller and sharper than the brief assumed.**

Three of the four mechanics have **no production consumer at all** — `convoyRoute`/`restStops`, `wildDerricks`/`outhouseGeyser`, and `salvageHulks`/`sleeper`/`unmarkedWagon` have zero readers in `src/` outside type declarations and two string registries. Socketing them into the headless sim would have meant *writing* the mechanic, which is the vocabulary stretch AP-11 and the mistake catalog (#14) forbid. They stay rejected, and their findings stand unchanged.

The fourth is different, and the census was wrong about it. **`tileParams.orbitSpawn` is consumed in every plain browser boot**: `Game.ts:808` constructs `LandYachtBossSystem` unconditionally, `Game.ts:2549` updates it every sim tick, and `LandYachtBossSystem.ts:256-277` reads `orbitSpawn.center/radius/angularSpeed` to drive the Land Yacht around the ORBIT road. Under AP-11 — declared **and** consumed by a booted system — the ORBIT road was always owed a manifest entry. It now has one: **five consumer-derived rules, zero invented operations.**

The headless socket that would complete the admission is blocked by one property of one file outside this shift's firewall, filed as **F-ER01-E4-5** with the cure proven and the wrong cure refuted.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, `✓ built in 1.17s`, asset-diet green (235 GLBs 84% cut, 54 PNGs 87% cut) |
| `er01-e4-census` + `er01-e2/e3/e5/e6-census` + `drill-yard-manifest`, **both** projects | **42 passed / 0 failed / 3.5m** (`--workers=1`, desktop-chrome + mobile-chrome) |
| `npm run test:node-guards` (mandatory — touches `src/agent/`, F-1460-1) | **rc=0**, `tests 305 · pass 302 · fail 0`. Worth noting: the **F-1460-1 Baron pin red that every earlier era-socket drain reported (`280 pass / 1 fail`) is not present** — the battery has grown to 305 and is fully green. I did not cure it and make no claim to; recorded so the next drain does not go looking for an expected red. |
| `npm run test:ledger-guards` (run **last**, F-1300-4 — it gates my own BACKLOG row) | **rc=0**, all PASS: goal/closure/ruling/law-pointer/gate-caller/block-class guards, citation guard (462 scanned, no new bare `spec:line`), main-lock gate 7/7 fixtures, janitor rejection a/b/c, `nul-audit` CLEAN |
| Manifest determinism | `deriveMechanicsManifest('e4-dust-flats')` byte-identical across two calls |
| Blast radius | `land_yacht` rule count: `e4-long-road` **0**, `e4-gusher-county` **0**, `e4-boneyard` **0**, and **0** for all five E1 fixture contracts |
| Adjacent red, control-proven | `agent-view.spec.ts:264` + `:297` — **PRE-EXISTING**, see below |

**Nothing renders**, so there are no screenshots: this slice changes a derived JSON manifest and a Node-side spec. No browser gameplay behavior moved — `SUPPORTED_CONTRACTS` is untouched, so every contract that booted before boots identically, and no admitted contract changed.

### The control run, because "untouched" is not "independent"

The first battery showed 4 failures in `agent-view.spec.ts`. My change is confined to `deriveMechanicsManifest`, and the failing assertion reads `listContracts()` — but a merge can red a file it never touched, so I measured instead of arguing. I restored `src/agent/MechanicsManifest.ts` to its `HEAD` bytes (`git diff` empty, verified) and re-ran: **the same two tests failed on the pristine tree.**

Root cause, for whoever fixes it: `e1-drill-yard` joined the E1 registry in merged commit `19f212b71`, so `listContracts()` now returns **six** ids while `agent-view.spec.ts:269` still expects five, `e2e/fixtures/e1-mechanics-manifests.json` still holds five entries, and the contract board never renders `contract-board-mechanics-e1-drill-yard`. This is **not** in `logs/suite-red-inventory.md` — the only `agent-view` row there is a **retired**, mobile-only, `:268` GLTFLoader failure, a different fault. Filed as **F-MOTOR-1**; out of firewall, not fixed here.

## The manifest vocabulary

`e4-dust-flats` gains five rules, each number traced to the consumer or to real `twist`/`Balance` keys:

| Rule | Source | Carries |
|---|---|---|
| `land_yacht_orbit` | `LandYachtBossSystem.installOrbitRoute` | centre `0,0`, radius `24`, angularSpeed `0.5235987756`, 25 waypoints, `speed=radius*angularSpeed` |
| `land_yacht_acts` | `.advanceActs` | components `[crane, wheelhouse, wheels]`, the three-act progression |
| `land_yacht_head_loot` | `.updateOrbit` | every `2s`, 4 heads, ring `radius+4`, funds a `motor_gang` escort |
| `land_yacht_crane` | `.updateCrane` | reach `6`, cooldown `1.5s`, targets `turret`, damage `target.maxHp` |
| `land_yacht_dread` | `.onWaveStarted` | wave `12` (= `baron.wave 14` − 2), `2s`, needs a ready watchtower |

**Zero operations minted.** The Land Yacht is a thing an agent survives and positions around, not a lever it pulls, so `buildables` stays empty and no verb was invented — the brief's "zero new ops with complete rules is a valid outcome", taken rather than worked around.

Three deliberate choices worth a reviewer's eye:

1. **Gated on data, not contract id.** The branch fires on `twist.baron?.variantId === 'land_yacht' && tile.orbitSpawn`, mirroring the browser's own gate at `Game.ts:2545`. Both E3 precedents hardcode `contract.id`, which AP-11 amendment 1 calls "a manifest hole"; this one does not.
2. **The four unconsumed `orbitSpawn` fields stay out.** `lapsBeforePeel`, `peelSpeed`, `telegraphSeconds`, and `peelPoints` are declared but read by nothing, so minting them would be exactly the AP-11 species-B lie. The spec now **asserts their absence**, so a later author cannot add them by accident — if someone genuinely wires peel logic, that test fails and the manifest is meant to grow deliberately.
3. **`land_yacht_dread.seconds: 2` comes from `Balance.landYacht.dreadSeconds`, not from `orbitSpawn.telegraphSeconds`,** which coincidentally also equals 2. The `source` field records which.

## Findings

- **F-ER01-E4-5 (new, in the census) — the Motor era's one real consumer cannot boot headless.** `LandYachtBossSystem.ts:56` builds a sprite in a *field initializer* → `TextureLoader` → `document is not defined` under the Node harness every `er01-*-census.spec.ts` uses. The control arm is what makes this a class and not an accident: **`MothSwarm`, `CrawlerBossSystem`, and `PressureSystem` — the three systems E2/E3 socketed — all construct cleanly under the same harness.** The three sockets that worked happened to pick presentation-light systems; this is the first presentation-eager one. Cure proven (a presentation split, the `CrawlerBossSystem` `update()`/`step()` shape extended to the constructor) and the tempting wrong cure refuted (see below). Blocked here only because `src/systems/**` is outside the firewall.
- **F-ER01-E4-6 (new, in the census) — `ContractFamilies.ts:1563` lists `tileParams.orbitSpawn` in `DECLARED_INERT_PATHS`, and it is not inert.** Costs honesty rather than behavior, but that registry is the assayer's evidence base for "no undeclared mechanics" — a path wrongly listed there is a mechanic the assayer will never ask anyone to declare.
- **F-MOTOR-1 (new, above) — `agent-view.spec.ts` 2 desktop reds, pre-existing and unrecorded**, caused by `e1-drill-yard` becoming the sixth E1 contract.
- **F-MOTOR-2 (new) — the brief's own premise miscounted.** `TASK.md` says the census has "5 DATA-GAP rows"; it has **four**. `grep -c DATA-GAP` returns 5 because the executive-summary line `DATA-GAP: 4 of 4` matches too. Recorded because a fire sizing this ladder off the grep would look for a fifth contract that does not exist — the same shape as s1478's "FOUR E2 profiles not five".
- **Record correction (in the census)** — the `F-1470-1` BACKLOG note says `CrawlerBossSystem` calls `document.querySelector` "from its constructor and every `update()`". Measured: the constructor is DOM-free, and the call sits in `syncPresentation`, which `step()` bypasses. Its other stated reasons for being unsocketable may hold; this one does not.

## The refused cure, recorded so nobody re-derives it

A `document` shim installed from inside `src/sim` **works** — construction succeeds and there is zero console output after settling. I did not take it. `src/game/RunManager.ts:94` branches on `typeof document !== 'undefined'` and would then build a `RunSuspendController` that headless runs do not build today — changing behavior for **every** contract, not just this one, and violating the brief's own "byte-identical outside the id-seam class". A narrow need does not justify that blast radius, and it would have bought an admission by quietly changing what the sim is.

## What is NOT done

`e4-dust-flats` is **not admitted**. `SUPPORTED_CONTRACTS`, `bench-seeds.json`, and the census headline (**AGENT-READY 0 of 4**) are unchanged, and no determinism pair was produced — a determinism pair for a system that cannot construct would be theatre. The census row moved `FAIL` → `PARTIAL` on the Verbs column only. Once F-ER01-E4-5 lands, the remaining work is the ordinary template and is small: add the contract to `SUPPORTED_CONTRACTS`, construct gated on `variantId`, update in browser tick order, prove the pair.

**Scratch:** probe scripts were written to `node_modules/` (a symlink into the main repo's shared `node_modules`) and removed at end of shift; no tracked file outside the firewall was touched.
