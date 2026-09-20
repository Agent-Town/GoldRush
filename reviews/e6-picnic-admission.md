# Review — e6-picnic ADMITTED: the county's last unopened door

**Slice:** `e6-picnic-admission` · **branch:** `worktree-agent-ad90f0a8eb7716664`
**Base:** `0251deeb1` (main merged into the branch at `3b40d41a5` before any measurement — union discipline)
**Built by:** a headless Opus-5 agent in an isolated worktree, 2026-08-21/22 · Node 26.4.0 · scratch port **5274**

## VERDICT: ADMITTED — idle LOSES on both bench seeds, the public-verb prover SECURES on both, twice each.

**OWNER RULING (2026-08-22), verbatim: "flip the stakes".** All three sandwiches now carry
`heroStart: false`; the hero opens at the engine default (0,12), inside `mesa-meadow` and outside
every hold disc. Five `harvestAnchors` land with it. `e6-picnic` enters `supportedContractIds()`,
the browser serves a direct claim, the null floors gain two lawful rows, and the exemption table
does not move — it never held this contract.

| policy | seed 01 (×2, byte-identical) | seed 02 (×2, byte-identical) |
|---|---|---|
| **idle** (`gr-sim --policy=idle`, `calls: 0`) | **LOST wave 2** · stakes-all-lost · hero hp 100 · `fnv1a32:c26f77d5` | **LOST wave 1** · stakes-all-lost · hero hp 100 · `fnv1a32:a649be29` |
| **public-verb prover** (plain door) | **SECURED wave 20** · 607 kills · 60 calls · `fnv1a32:b55e6ff4` | **SECURED wave 20** · 690 kills · 67 calls · `fnv1a32:44f0f3dc` |

Law 2 holds with room to spare: the idle floor does not merely fail to secure, it **loses the map**,
by the contract's own authored loss condition, with the hero untouched at full health.

## 1. Why this took two rulings, and why the first one was not enough

This slice STOPPED once, on Law 2, and that stop is the reason the ruling exists. It is kept here
because the admission is only trustworthy if the refusal that preceded it is legible.

The first ruling (2026-08-21, verbatim: *"picnic - no, just standing there should not win"*) built the
contest predicate: a stake's 3wu disc is held by a **standing structure** inside it, or by a hero that
has dealt damage within `PICNIC_ACTIVE_DEFENSE_SECONDS`. It was built correctly, it shipped at
`afbda29bc`, and **it did not bite**. Measured on the pre-flip map, `--policy=idle` **SECURED** both
bench seeds at wave 20 (`fnv1a32:b9f476a6` / `fnv1a32:612de94b`, `calls: 0`) — the b4v3 review's own
number, re-measured rather than inherited. The full-run trace showed exactly why:

```
w 1 hp=100 west:t0.0      center:t0.0     east:CLAIMED
w 2 hp=100 west:contested center:CLAIMED  east:CLAIMED
 …  west reads `contested` on all 33 remaining turns; its hold timer never leaves 0
w20 hp=114 west:contested center:CLAIMED  east:CLAIMED
```

**The ruled pressure worked — it took two of three stakes inside two waves and held them for the
whole run.** What it could not take was `sandwich-west`, because all three markers carried
`heroStart: true`, the hero opened standing in that disc, and `HeadlessContractSim.ts:1830` registers
it as a combat shooter whose gate at `:480` — `enabled: () => !this.dead && this.weapon === 'rig'` —
has **no policy term**. An "idle" hero fires all run and refreshes its own active-defense window every
second. All-three-claimed is the only loss, so the loss could never fire.

F-2131-1b had framed the cure as two expensive options: distinguish commanded defense from autonomous
fire, or redefine `--policy=idle` across the whole admission program. **There was a third, and it was
three booleans of contract data** — F-2090-1's original option (a), set aside as superseded when it
was in fact the ruling's missing half. It was put to the owner with the counterfactual already
measured, and the owner ruled it. The predicted numbers paid out to the digit: the floors this slice
regenerated are byte-identical to the counterfactual measured a day earlier, on a tree that has since
absorbed a whole day of main.

## 2. What changed

**Contract data (the ruling):** `assets/contracts/epoch-6-atomic/contracts.json` —
`heroStart: true → false` on all three sandwiches; five `harvestAnchors`; the stale
`engineDependencies` row removed. The published mask table
(`mask-tables/e6-picnic.json`) mirrors all of it, because `e3-mask-tables.test.mjs:248` deep-equals
the two per key.

```json
"harvestAnchors": [
  { "x": -22, "z": 8 },   // mesa-meadow west  — 11.66wu from sandwich-west
  { "x": 0,   "z": 8 },   // mesa-meadow mid   — 18.0wu from sandwich-center
  { "x": 22,  "z": 8 },   // mesa-meadow east  — 11.66wu from sandwich-east
  { "x": -24, "z": -22 }, // base-staging west
  { "x": 24,  "z": -22 }  // base-staging east
]
```

All five sit inside the picnic's two authored `buildZones`, none within 11.6wu of a stake centre (the
disc is 3wu), none inside a glow-mesa landmark blocker (nearest: `six-vein-control-pylon` at (0,-7),
15wu from (0,8)).

**One engine line, and it is a truth fix the flip forced (`src/agent/MechanicsManifest.ts`).**
`posting.lossStakes` filtered on `heroStart`, so flipping the flags would have emptied it — telling
every rider this contract has NO loss stakes while `PicnicHoldSystem` still loses on all three.
`heroStart` was doing two jobs; under `twist.picnicHold` they are now read apart. Contract-scoped on
the same declaration the system is gated on, so no other contract's posting moves —
`picnic-hold-contract-scope.test.mjs` holds that key exclusive to `e6-picnic`, and its manufactured
red still names `e10-last-claim` when the old marker-counting predicate is restored (re-run on this
tree, §5).

**The dropped `engineDependencies` row is not tidying.** It declared
`picnic-contract-consumers: missing` with the description *"neither implements a three-stake hold"* —
false since `afbda29bc`, and on an ADMITTED contract it would make the campaign dossier report a map
the door serves as *"🟠 missing"* (`campaign-map-dossier-table.mjs:63`). The census now derives that
branch from `EXPECTED_DEPENDENCY` rather than naming one contract, so the next admission cannot
forget it.

**Admission surfaces:** `door-admission-baseline.json` (+`e6-picnic`, door 33 → 34) ·
`public/skill.md` door-contracts fence · `assets/contracts/null-floors.json` (regenerated) ·
`e2e/er01-e6-census.spec.ts` (per-id flip, both rulings quoted verbatim with the hashes) ·
`docs/bench/same-game-audit.md` (regenerated) · `scripts/same-game-audit.test.mjs` (re-pinned).

## 3. Evidence (Node 26.4.0, scratch port 5274, `--workers=1` throughout)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.55 s**, asset-diet ceilings respected |
| `er01-e6-census` (per-id truth, both projects) | **8 passed**, 11.2 s |
| E6 family (11 specs) + `ap16-4`, both projects | **53 passed / 3 failed** — all three controlled below |
| `task-025` + `m1-01` + `m2-01`, both projects | **40 passed**, 2.8 m |
| Door probe ×2 viewports (`artifacts/e6-picnic/door-probe.spec.ts`) | **4 passed**, 11.7 s, zero console/page errors |
| `null-floor-anchors.mjs` regen | **75 floors / 32 contracts**, 189.7 s |
| `null-floor-anchors.mjs --check` | **75/75 match, rc=0**, 172.0 s |
| `same-game-audit.mjs --json` | `0 / 456 / 1143 / 3` over **1602 rows**, **5 exemptions**, 10 measurements |
| `npm run test:node-guards` | **499 tests · 497 pass · 0 fail · 2 skipped · 269.1 s, rc=0** — fully green |

**THE LAW-2 SURFACE, stated plainly:** the regenerated `null-floors.json` gains
`e6-picnic-01` (wave 2, `c26f77d5`) and `e6-picnic-02` (wave 1, `a649be29`), **both `secured: false`**,
and the artifact carries **0 rows with `secured: true`** across all 75. The other 73 rows are
byte-unmoved — the whole diff is +19/−1 lines, the two new rows plus the `eraStamp`.

### The prover, and what it actually plays

`artifacts/e6-picnic/prover.mjs` drives `scripts/gr-sim.mjs --contract e6-picnic` over stdin. Public
grammar only: HARVEST · HOLD · BUILD · CAPTURE · SECURE_CHOICE. No `admissionProbe`, no private
handles, no balance edits.

The flip made the map genuinely hostile and the opening had to be rebuilt for it. A turret is 50 gold
and the first sandwich falls long before the Prospector can pan that much — so the rider **fences with
palisades at 10 gold** (`Balance.palisade.cost`), because `PicnicHoldSystem.contested` accepts ANY
standing structure inside the disc and never asks whether it shoots. Then it spends to the turret cap
on whatever sandwiches are still alive, and CAPTUREs the wound-down machines so `aliveCap` does not
fill with things that can be neither fought nor cleared.

**Both seeds lose two sandwiches to the opening rush and hold the third to wave 20.** That is not the
rider failing; it is the contract's own authored secure rule —
*"at-least-one-stake-held-at-default-secure-wave"* (`MechanicsManifest.ts:666`) — doing exactly what
it says. The Picnic is an attrition map: they get some of the sandwiches.

## 4. Audit pins — re-measured on this tree, and attributed

**My base, measured not inherited:** main moved under this slice while it was parked on the owner's
desk (`e5-stillwater` was admitted in the interval, 6 exemptions → 5). Re-read after the merge:
`5 exemptions · 0/446/1112/4 over 1562 rows`, matching `same-game-audit.test.mjs` on disk.

**After:** `5 exemptions · 0/456/1143/3 over 1602 rows` — **+10 agent-lacks, +31 equal, −1 not-offered,
+40 rows**, the `+10/+30/−1/+39` anchor shape nine slices before this recorded, one `equal` row wider.
**The exemption count does NOT move**: the Picnic was never in `CONTRACT_ADMISSION_EXEMPTIONS`, it was
excluded by empty `harvestAnchors` — a different door.

**ATTRIBUTED BY REVERT-AND-REPRODUCE, not by arithmetic**, and the control is unusually clean because
three other edits ride in this slice and none of them is visible to this audit. Emptying
`harvestAnchors` in BOTH the contract and the published mask table — while leaving the `heroStart`
flip, the dropped `engineDependencies` row and the `MechanicsManifest` lossStakes read all in place —
reproduced **`5 exemptions · 0/446/1112/4 over 1562 rows` EXACTLY**, the pre-slice pin. So the whole
movement belongs to the five anchors, and the ruling that made the map winnable moves nothing here
(it is a mechanics/posting surface, which this audit does not compare — the fourth slice running to
find that shape).

## 5. Controls run by this slice, not inherited

| control | result |
|---|---|
| `picnic-hold-contract-scope.test.mjs` as shipped | **PASS** — enabled set exactly `['e6-picnic']` |
| **manufactured red** — old marker-counting predicate restored at the new call site | **FAILS naming the casualty**: `+ 'e10-last-claim'` vs expected `['e6-picnic']`; reverted byte-identical |
| `e10-last-claim` live reachability, before and after the anchors | **5 turns** both times — the picnic's data cannot reach it |
| **anchors alone** (no admission surfaces) | `door-admission-ratchet`, `null-floor-anchors` and `skillmd-guard`'s door-contracts test all go RED, each naming `e6-picnic` — the anchors ARE the door, so they can never land as a quiet data tidy |
| idle floor, pre-flip vs post-flip | `b9f476a6`/`612de94b` SECURED w20 → `c26f77d5`/`a649be29` LOST w2/w1. The flip is the whole delta |

## 6. Battery, and every red controlled

**`npm run test:node-guards`: 499 tests · 497 pass · 0 fail · 2 skipped · 269.1 s, rc=0 — GREEN,
including the contention guard, which caught a quiet window at load 7.5.** Every admission guard
passes on the merged tree: `derived door matches the fixed admission baseline` (4.3 s) ·
`published mask tables exactly track authored contract data` (58.5 ms — the mask/contract deep-equal
that makes the mirrored flip load-bearing) · `null-floor artifact exactly covers every door-servable
bench seed` · `Picnic hold is enabled only for e6-picnic across every epoch contract` (1.8 s) ·
`same-game audit runs over every contract` (11.8 s) · `skill.md door-contracts match
SUPPORTED_CONTRACTS`. Log banked at `artifacts/e6-picnic/gate-node-guards-ruled.log`.

⚠️ **Battery cost drifted upward again:** 499 tests / 269.1 s here against `f2131-1`'s 482 / 449.8 s
and this branch's own 486 / 327.0 s a day earlier. Recorded, not pruned — the sequence is the
provenance. The 2 skips are the documented fire-shell exemptions.

**Three e2e reds, none of them mine:**

1. **`e6-boss-homemaker.spec.ts:126`, both projects** — the *inventoried* known red:
   `logs/suite-red-inventory.md:172-173` lists it as **BOTH** projects, TIMEOUT class (90 000 ms), and
   `reviews/e6-homemaker-headless-socket.md:6` records it as *"inventoried known red, control-proven
   pre-existing on an unguarded tree"*. Fingerprint matched.
2. **`e6-arsenal.spec.ts:29`, one project per run — F-E6PA-6, a NEW load flake, not inventoried.**
   Controlled by five solo reruns (`artifacts/e6-picnic/arsenal-flake-control.txt`): **run1 6 passed ·
   run2 6 passed · run3 desktop-chrome failed · run4 MOBILE-chrome failed · run5 desktop-chrome
   failed.** A deterministic tree red picks the same project every time and fails 5/5; this one moves
   projects and passes outright on 2 of 5. The spec also cannot touch this slice: it opens
   `e2-hill-mine` then `e6-glow-mesa` and contains **zero** references to `picnic`, `stakeMarkers`,
   `heroStart` or `harvestAnchors` (`grep -c` = 0); the assertion that fails is a page-navigation
   wait on `contract.activeId === 'e6-glow-mesa'`. Filed for the inventory rather than excused.
3. **`node-guards-contention.test.mjs`** — the guard reporting a second concurrent battery, which is
   its entire job. Declared under contention below.

⚠️ **Contention was live throughout and is declared, not excused (Mistake #12).** A sibling agent
worktree (`agent-a9e7d8321e70f7a1f`) ran its own full `run-node-guards` battery and playwright suites
against the same box — attributed by hand at the time with `lsof -d cwd` on pid 32199 — alongside a
live `codex exec` lane-d run and its vite preview on 5191, at load averages between 6.4 and 24.3.
Everything of mine ran on port **5274**: never 5188, never the A3 scratch 5273, never the lane's 5191.

**Environmental class, declared and pre-empted.** An isolated worktree ships no `node_modules`, and
`worker-type-coverage` / `suite-red-inventory` red on an empty one. I symlinked the shared checkout's
`node_modules` (the A3 precedent), ran, and removed it. ⓘ `.gitignore:1` reads `node_modules/` **with
a trailing slash**, which does not match a *symlink* — `git check-ignore` returns 1 and `git status`
lists it as untracked. Path-scoped adds (§4.2) are the only thing keeping it out of a commit.

## 7. Findings

**F-E6PA-1 — DISCHARGED BY THE OWNER'S RULING.** The idle-secure that refused this admission on
2026-08-21 is cured, and the cure was the one this slice measured and recommended. Recorded closed
rather than deleted: the measurement (`b9f476a6`/`612de94b` securing, then `c26f77d5`/`a649be29`
losing) is the before/after that makes the ruling checkable.

**F-2131-1b — STILL OPEN, and this admission does NOT close it.** The desk fork is that
`--policy=idle` gates movement, not fire: `heroShooter.enabled` has no policy term, so a headless
"idle" hero is a stationary turret on **every** contract. The Picnic escaped it by moving the hero off
the stakes, which is a fix to one map, not to the instrument. Any future predicate that reads hero
damage as evidence of intent will hit this again. Left on the desk, unchanged.

**F-E6PA-2 (NON-BLOCKING — INSTRUMENT DEFECT, and a shipped script has it).** A headless probe that
does not put `contract=<id>` on `globalThis.location` measures the requested contract's MANIFEST on
**The Claim's terrain**: `src/world/Terrain.ts:78` binds `ACTIVE_CONTRACT = activeContract()` at module
load, and the tile's size, water, fords, landmark blockers and `nodeAnchors` all derive from it, while
`HeadlessContractSim` takes its manifest from its argument. Set one and not the other and they
disagree silently, with no error. It cost me a wrong number: a first probe reported this contract's
idle floor *dying at wave 5* where the canonical driver secured at wave 20. Attributed by elimination
— removing the `submitOrders` call changed nothing; restoring the URL param *and* the anchors that let
it resolve reproduced `fnv1a32:b9f476a6` exactly. ⚠️ **`e2e/ap16-8-admission-probe.mjs:4` has the same
omission** while its sibling `ap16-8b-capture-loop-probe.mjs:54` sets it correctly — read-verified at
source, not re-measured here. Worth its own slice: it asks which published exemption numbers were
measured on the wrong ground.

**F-E6PA-3 — DISCHARGED IN THIS SLICE.** The picnic's stale `engineDependencies` row is removed and
the census derives its branch from the dependency table, so an admitted contract can no longer ship a
"missing consumer" declaration.

**F-E6PA-6 (NON-BLOCKING, fire-authorable) — `e2e/e6-arsenal.spec.ts:29` is a load-sensitive flake and
is NOT in `logs/suite-red-inventory.md`.** 3/5 solo runs failed, on a different project each time,
with the same wall-clock shape. It belongs in the inventory so the next drain fingerprint-matches it
instead of re-deriving the control. Evidence banked at
`artifacts/e6-picnic/arsenal-flake-control.txt`.

**F-E6PA-7 (NON-BLOCKING — a pointer correction, carried forward).** The dispatch that opened this
work quoted *"main's current live pins: 464/1056/4 over 1524, exemptions 6"*. Measured twice on the
pre-merge base they were **468/1090/4 over 1562, exemptions 6**, and after merging main they are
**446/1112/4 over 1562, exemptions 5**. The quoted figures match no tree on disk; whichever handover
carries them should be corrected before another slice bases arithmetic on them.

## 8. Merge classification

**Base:** `0251deeb1`, merged into the branch at `3b40d41a5` **before any measurement** — so every
number above was taken on the merged tree, never on a stale one, and none of it needs re-deriving at
the drain (Mistake #4 runs both ways: this is the verification line).

**LANE-TOUCHED (13):** `assets/contracts/epoch-6-atomic/contracts.json` ·
`assets/contracts/epoch-6-atomic/mask-tables/e6-picnic.json` · `assets/contracts/null-floors.json` ·
`docs/bench/same-game-audit.md` · `e2e/er01-e6-census.spec.ts` · `public/skill.md` ·
`scripts/door-admission-baseline.json` · `scripts/same-game-audit.test.mjs` ·
`src/agent/MechanicsManifest.ts` · `src/systems/PicnicHoldSystem.ts` (comment only) ·
`reviews/e6-picnic-admission.md` · `playwright.e6picnic.config.ts` (new) · `artifacts/e6-picnic/**` (new)

**MAIN-MOVED since the merge base, re-measured at the END of the slice (`0251deeb1..main` at
`414f9698e`, 9 files):** `STATUS.md` · `tasks/BACKLOG.md` · `tasks/goals.json` ·
`tasks/f2117-1-root-release-base-harness.md` · `logs/dashboard.html` · `scripts/fire.md` ·
`docs/bench/harness-era-implications.md` · `marketing/outbox/gazette-queue.md` ·
`marketing/outbox/ticker-digest-2026-08-21.md`.

**BOTH-MOVED: none.** The two sets are disjoint — confirmed by measurement
(`git diff --name-only 0251deeb1..main` against `0251deeb1..HEAD`), not by the absence of a
complaint. The merge is additive by construction and needs no 3-way graft.

**`tasks/BACKLOG.md`: deliberately untouched.** F-2131-5 recorded that this exact collision stopped
b4v3 attempt 1, and the ledger row is the drain's duty. The row is in §9, ready to paste.

**The COMMITTED tree was re-gated, not just the working tree** (the s195 lesson: a path-scoped add can
strand a hunk and leave a green gate describing a tree that was never committed). After the commits,
`git status --porcelain --untracked-files=no` returns **0 lines**, and the four admission guards plus
the mask-table suite were re-run against it: `derived door matches the fixed admission baseline` ✔ ·
`null-floor artifact exactly covers every door-servable bench seed` ✔ ·
`skill.md door-contracts match SUPPORTED_CONTRACTS` ✔ ·
`Picnic hold is enabled only for e6-picnic` ✔ · `e3-mask-tables` 30/30 ✔.

**Where the player sees this, in a plain boot:** on the board, for the first time. `?contract=e6-picnic`
resolves `activeId: 'e6-picnic'` with `fallbackReason: null` on both viewports with zero console/page
errors — it used to resolve `the-claim` / `'unavailable-contract'`. The default plain boot is
unchanged and still opens The Claim, asserted in the same probe so the admission cannot have quietly
moved the front door.

## 9. Ledger row for the drain to paste

> 🥪 **THE PICNIC IS ADMITTED — THE COUNTY'S LAST UNOPENED DOOR IS OPEN (`reviews/e6-picnic-admission.md`).** **OWNER RULING (2026-08-22, verbatim: "flip the stakes")** executed: all three sandwiches carry `heroStart: false`, the hero opens at the engine default (0,12) outside every hold disc, and five `harvestAnchors` land with it. **Idle LOSES both bench seeds by stakes-all-lost with the hero at FULL HEALTH** — wave 2 `fnv1a32:c26f77d5` / wave 1 `fnv1a32:a649be29`, ×2 each — and the **public-verb prover SECURES both, twice, at wave 20**: `fnv1a32:b55e6ff4` (607 kills) / `fnv1a32:44f0f3dc` (690 kills), fencing each live disc with a 10-gold palisade then spending to the turret cap. 📐 **Two rulings built this and the first one alone was NOT enough, which is the durable lesson:** the 2026-08-21 predicate was correct and shipped, yet idle still SECURED w20 (`b9f476a6`/`612de94b`) because the hero opened standing in a disc and auto-fires with no policy term in its gate — the ruled pressure took two stakes in two waves and could never take the third. The cure was three booleans of contract DATA, F-2090-1's option (a), which had been set aside as superseded when it was the ruling's missing half. 🔢 **Pins re-measured verbatim on the merged tree and ATTRIBUTED BY REVERT-AND-REPRODUCE:** `5 exemptions · 0/456/1143/3 over 1602 rows` (base 446/1112/4 over 1562 — main admitted `e5-stillwater` while this sat on the desk). Emptying the anchors in BOTH the contract and the published mask table, with every other line of the slice in place, reproduced the pre-slice pin EXACTLY — so the +10/+31/−1/+40 belongs to the anchors and the ruling moves nothing in that table. **Exemption count does not move: the Picnic was never in `CONTRACT_ADMISSION_EXEMPTIONS`, it was refused by empty data, a different door.** ✅ Floors regenerated: **75 rows / 32 contracts, e6-picnic present, ALL `secured: false`, 0 `secured: true` anywhere**; `--check` 75/75 rc=0. Door baseline 33→34, skill.md fence, census per-id flip citing both rulings + the hashes. 🧹 Also discharged: the picnic's `engineDependencies` "missing consumer" lie (F-E6PA-3), and `MechanicsManifest.lossStakes` now reads the loss stakes apart from `heroStart` — the flip would otherwise have told riders this map has NO loss stakes. 🔺 **F-2131-1b STAYS ON THE DESK:** the Picnic escaped the armed idle floor by moving its hero, which fixes one map, not the instrument. Filed: **F-E6PA-2** (a probe omitting `contract=<id>` from `globalThis.location` measures on The Claim's terrain — `Terrain.ts:78`; `e2e/ap16-8-admission-probe.mjs:4` has it) · **F-E6PA-6** (`e6-arsenal.spec.ts:29` is a load flake, 3/5 and project-nondeterministic, NOT yet in the red inventory) · **F-E6PA-7** (the dispatch's quoted pins match no tree on disk).
