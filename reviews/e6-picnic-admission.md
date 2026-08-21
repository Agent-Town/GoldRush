# Review — e6-picnic admission: REFUSED, and the refusal is the finding

**Slice:** `e6-picnic-admission` (the b4v3 door work, items 3–4) · **branch:** `worktree-agent-ad90f0a8eb7716664`
**Base:** `705839487` (= `git merge-base HEAD main`; main sat one lock commit ahead at `1b1d2d2c8` throughout)
**Built by:** a headless Opus-5 agent in an isolated worktree, 2026-08-21 · Node 26.4.0 · scratch port **5274**

## VERDICT: STOP — LAW 2. NO ADMISSION, AND NO CONTRACT DATA CHANGES.

The public-verb prover secures **both bench seeds, twice each**. So does the **idle floor**. A contract
that can be won by doing nothing cannot be admitted, and `scripts/null-floor-anchors.test.mjs:43` says
so in as many words: *"idle-secured: law 2 needs a ruling before this row can land"*. The ruling it
wants is **F-2131-1b, already on the owner's desk** — so this slice measures the fork to the bottom,
banks every number, and lands **no admission surface and no contract-data edit at all**.

The tracked tree is byte-identical to `705839487` except for this review, the evidence directory
`artifacts/e6-picnic/`, and one scratch playwright config. The five `harvestAnchors` this task
authorised were authored, measured with, and **reverted** — they are recorded below so the day the
fork is ruled the door work is a copy-paste rather than a re-derivation.

## 1. The mechanic on main: live, correct, and contract-scoped — verified, not inherited

`f2131-1` (`52c48fce7`) is intact on this base and the `e10-last-claim` leak is **closed**, proven two
ways rather than quoted:

| control | result |
|---|---|
| `scripts/picnic-hold-contract-scope.test.mjs` as shipped | **PASS**, 308 ms — enabled set is exactly `['e6-picnic']` |
| **MANUFACTURED RED** — old predicate restored at the new call site (`tileParams.stakeMarkers.filter(heroStart).length >= 2`) | **FAILS and names the casualty**: `+ 'e10-last-claim'` against expected `['e6-picnic']` |
| control reverted | `git status` clean; guard green again |
| `e10-last-claim` live reachability (`same-game-audit.mjs --json`, `admission.measurements`) | **turns 5**, booted/firstView/terminal all true, error null — byte-equal to `docs/bench/same-game-audit.md:41` |
| the same measurement **with my five anchors in the tree** | **turns 5**, unmoved — the picnic's data cannot reach e10 |

A passing guard never executes its violation path, so the red above is the load-bearing half (the
s1299/s1300 standard, and the same control `reviews/f2131-1.md` ran at the drain — re-run here rather
than inherited, per Mistake #4).

✓ **Read-verified at source, which is why the b4v3 numbers are comparable at all:**
`git diff archive/lane-b-s2131-b4v3-absorbed-2cc5a1d4b main -- src/systems/PicnicHoldSystem.ts` is a
**single functional hunk** — `isEnabled`'s signature and body. For `e6-picnic` both forms return
`true`, and `git log 90ec076a2..main -- src/sim src/game/Game.ts src/systems src/entities` contains
only the picnic commits. So the b4v3 tree and this one are behaviourally identical for this contract,
and indeed b4v3's reported idle hash reproduces to the digit (§3).

## 2. The door work, authored and measured (then reverted)

Five `harvestAnchors`, all inside the picnic's two authored `buildZones`, none within 11.6wu of any
stake centre (the hold disc is 3wu) and none inside a glow-mesa landmark blocker (nearest is
`six-vein-control-pylon` at (0,-7), 15wu from (0,8)):

```json
"harvestAnchors": [
  { "x": -22, "z": 8 },   // mesa-meadow, west  — 11.66wu from sandwich-west
  { "x": 0,   "z": 8 },   // mesa-meadow, mid   — 18.0wu from sandwich-center
  { "x": 22,  "z": 8 },   // mesa-meadow, east  — 11.66wu from sandwich-east
  { "x": -24, "z": -22 }, // base-staging, west
  { "x": 24,  "z": -22 }  // base-staging, east
]
```

With them the contract enters `supportedContractIds()` and `gr-sim` serves
`--contract e6-picnic` through the **ordinary door** — no `admissionProbe` seam anywhere in §3.

⚠️ **They are reverted on this branch, and they must not be re-landed alone.** Anchors are the door
key on both sides: they clear the browser's `harvestAnchors?.length === 0 -> 'unavailable-contract'`
refusal (`ContractFamilies.ts:1336`) *and* the headless `SUPPORTED_CONTRACTS` filter
(`HeadlessContractSim.ts:253`). Landing them without a ruling would put a map on the board that
**standing still wins** — the precise thing the owner ruled against.

**That is measured, not asserted.** With the five anchors in the tree and nothing else changed, three
shipped guards go red and each names the contract:

| guard (anchors present, nothing else changed) | result |
|---|---|
| `scripts/door-admission-ratchet.test.mjs` | **✖** *"Door admission drifted from scripts/door-admission-baseline.json"* — diff line `+ 'e6-picnic'` |
| `scripts/null-floor-anchors.test.mjs` | **✖** *"floors must equal bench seeds intersected with supported contracts"* |
| `scripts/skillmd-guard.test.mjs` (door-contracts) | **✖** — the other three skill.md assertions stay green |

All three are green on the reverted tree (§4). So the anchors cannot be landed as a quiet data tidy:
they are an admission decision wearing five coordinates.

## 3. The measurements — every run repeated, every repeat byte-identical

Public-verb prover (`artifacts/e6-picnic/prover.mjs`; verbs: HARVEST · HOLD · BUILD turret ·
CAPTURE · SECURE_CHOICE; three turrets planted 1.5wu inside the three stake discs; 13 appliances
penned on seed 01), `--contract e6-picnic` passed explicitly on every run:

| run | terminal | waves | kills | calls | eventLogHash |
|---|---|---:|---:|---:|---|
| seed 01 ×2 | **SECURED** | 20 | 613 | 59 | `fnv1a32:2cc17457` |
| seed 02 ×2 | **SECURED** | 20 | 638 | 67 | `fnv1a32:fee59bca` |

Idle floor, run exactly the way `scripts/null-floor-anchors.mjs:40` runs it (`gr-sim --policy=idle`):

| run | terminal | waves | kills | calls | eventLogHash |
|---|---|---:|---:|---:|---|
| seed 01 ×2 | **SECURED — LAW 2 BREACH** | 20 | 268 | 0 | `fnv1a32:b9f476a6` |
| seed 02 ×2 | **SECURED — LAW 2 BREACH** | 20 | 223 | 0 | `fnv1a32:612de94b` |

`b9f476a6` is **the same hash `reviews/b4v3-picnic-active-defense.md` reported**. That inherited claim
is now re-measured on a tree whose only delta is the enable key, and it is CONFIRMED.

### The mechanism, read off THE VIEW rather than argued

`artifacts/e6-picnic/idle-stake-trace-01.txt`, one line per turn:

```
w 1 hp=100 west:t0.0      center:t0.0     east:CLAIMED
w 2 hp=100 west:contested center:CLAIMED  east:CLAIMED
 …  (west reads `contested` on all 33 remaining turns; its hold timer never leaves 0)
w20 hp=114 west:contested center:CLAIMED  east:CLAIMED
```

**The ruled pressure works. It takes two of the three stakes inside two waves and holds them for the
whole run.** What it cannot take is `sandwich-west`, because that is where the hero stands, and
`HeadlessContractSim.ts:1830` registers the hero as a combat shooter whose gate at `:480`
(`enabled: () => !this.dead && this.weapon === 'rig'`) has **no policy term** — so an "idle" hero
fires all run, refreshes its own `PICNIC_ACTIVE_DEFENSE_SECONDS` window every second, and its stake
never falls. All three claimed is the only loss, so the loss can never fire, and the hero then
survives to `secureWave` 20 on **12 defaulted upgrade picks** — its hp dips to 82 by wave 10 and then
*climbs back* to 126 as the free picks land — and secures.

### The counterfactual — the new information, measured rather than reasoned

On the same anchored tree (the door cannot serve the run without the anchors), flip the three
`stakeMarkers[].heroStart` to `false` so the hero starts at the default `(0,12)` — still inside
`mesa-meadow`, ≥14wu from every stake — and change **nothing else**:

| run | terminal | waves | kills | hero hp | eventLogHash |
|---|---|---:|---:|---:|---|
| idle seed 01 ×2 | **LOST — stakes-all-lost** | 2 | 25 | 100 (untouched) | `fnv1a32:c26f77d5` |
| idle seed 02 ×2 | **LOST — stakes-all-lost** | 1 | 15 | 100 | `fnv1a32:a649be29` |

Its trace: `west CLAIMED` w1, `center CLAIMED` w2, `east CLAIMED` w2, hero at full health — the loss
is the **picnic loss firing**, not a death. So the owner's ruling is not merely correct, it is
*already sufficient*; the only thing standing between it and a lawful floor is that all three
`stakeMarkers` carry `heroStart: true`.

## 4. Gates (Node 26.4.0, scratch port 5274, `--workers=1` throughout)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.67 s**, asset-diet ceilings respected |
| er01-e6-census + e6-picnic-hold + the nine E6 siblings + ap16-4, both projects | **54 passed / 2 failed**, 6.2 m — both failures are the *inventoried* known red (below) |
| task-025 + m1-01 + m2-01, both projects | **40 passed**, 3.6 m |
| Door probe ×2 viewports (`artifacts/e6-picnic/door-probe.spec.ts`) | **4 passed**, 13.4 s, zero console/page errors |
| `same-game-audit.mjs --json` on the clean tree | `0 / 468 / 1090 / 4` over **1562 rows**, **6 exemptions**, 10 measurements |
| `node scripts/null-floor-anchors.mjs --check` | **71 rows, every pinned field byte-identical**; the single reported difference is `eraStamp: pinned="cef09f339" derived="705839487"`, 249.5 s |
| `npm run test:node-guards` | **486 tests · 483 pass · 1 fail · 2 skipped · 327.0 s** — the one failure is the contention guard, controlled below |

**The 2 reds are the inventoried known red, fingerprint-matched, not mine.**
`e2e/e6-boss-homemaker.spec.ts:126` — *"unbuilds, tidies, makes one chair, and remains kept without
ever hurting the player"* — is listed in `logs/suite-red-inventory.md:172-173` as **BOTH** projects,
TIMEOUT class (90 000 ms), and `reviews/e6-homemaker-headless-socket.md:6` records it as
*"inventoried known red, control-proven pre-existing on an unguarded tree"*. My tracked tree is
byte-identical to `705839487`, so no tracked line of mine can have caused it.

**The one battery red is the contention guard, and it is provably not mine.**
`scripts/node-guards-contention.test.mjs:116` — *"node-guards board did not stay quiet for 300 ms"*,
stderr `CONTENDED — 2 concurrent batteries`. That guard exists to report a second concurrent battery,
and there was one. **Bracketed `pgrep`, both ends:** at battery start, the sibling agent worktree
`agent-a9e7d8321e70f7a1f` was mid-playwright on the E5 stillwater suite and `lane-runner-v3.sh` was
alive, load average 8.75. At the SOLO re-run I attributed the process by hand — pid 32199,
`lsof -d cwd` → **`.claude/worktrees/agent-a9e7d8321e70f7a1f`**, started 21:05:19, a *second whole
`run-node-guards` battery* belonging to that sibling — plus a live `codex exec` on
`lane-d f2141-1-canyon-census-run-3` and its vite preview on 5191, at load average 24.32. There was no
quiet board to be had, and the guard was right both times. Everything of mine ran on port **5274**, so
it could not collide with 5188, the A3 scratch 5273, or the lane's 5191.

⚠️ **Battery cost drifted upward again, as always:** 486 tests / 327.0 s here against `f2131-1`'s
482 / 449.8 s. Recorded, not pruned — the sequence is the provenance. (The wall-clock is *shorter*
despite more tests only because that run was serialised at load 2.89; this one shared a box at 24.)

**Environmental class, declared and pre-empted.** An isolated worktree ships no `node_modules`, and
`worker-type-coverage` / `suite-red-inventory` red on an empty one. I symlinked the shared checkout's
`node_modules` before the battery (the A3 precedent) and removed it after — **both guards passed**, so
that class never reached the board. ⓘ Worth knowing, and it is a trap rather than a footnote:
`.gitignore:1` reads `node_modules/` **with a trailing slash**, which does not match a *symlink*, so
`git check-ignore` returns 1 and `git status` lists it as untracked. Path-scoped adds (§4.2) are the
only thing that keeps it out of a commit; a root `-A` would have swept it — the Mistake-#3 shape,
another sighting.

## 5. What this slice did NOT do, and why each omission is correct

- **No `harvestAnchors`.** They are the door on both sides (§2). Reverted; `git checkout --` verified.
- **No `er01-e6-census` per-id flip.** `ADMITTED` stays `{e6-glow-mesa, e6-half-life-hollow}`. Flipping
  it would assert an admission the floors refuse.
- **No `skill.md` fence, no `door-admission-baseline.json` row, no floors regen.** All three derive
  from `supportedContractIds()`, which does not move without anchors — and all three go red the
  moment anchors land alone (§2's control table). `null-floor-anchors.mjs --check` was run for the
  record: **every pinned row byte-identical**, and its one reported difference is the `eraStamp`
  field — `git rev-parse --short $(git merge-base HEAD main)` at `null-floor-anchors.mjs:21-22`,
  which differs in *any* worktree or branch. A property of the instrument, not of the tree, and the
  reason the regen was not written: writing it would have re-stamped 71 rows to say nothing.
- **No audit regen, no re-pin.** Re-measured verbatim on this tree and byte-equal to main's committed
  pins: `assert.equal(audit.admission.exemptions.length, 6)` and
  `{ 'agent-exceeds': 0, 'agent-lacks': 468, equal: 1090, 'not-offered': 4 }`
  (`scripts/same-game-audit.test.mjs:342-343`). Nothing to re-pin, so no `ADMISSION MOVE` comment is
  owed; writing one would document a move that did not happen.
- **No `CONTRACT_ADMISSION_EXEMPTIONS` row.** That table is for contracts the door would otherwise
  **serve**. `e6-picnic` is refused by empty `harvestAnchors` — *"a different door"*, in
  `same-game-audit.test.mjs`'s own words at `:76`, `:148` and `:243`. With the anchors reverted, a row
  there would misname which door refuses this map. It is also not a *ceiling* refusal: the prover
  secures. The refusal is Law 2.
- **No `tasks/BACKLOG.md` edit.** F-2131-5 recorded that this collision stopped b4v3 attempt 1 and
  that the ledger row is the drain's duty. The row text is in §7 ready to paste.

## 6. Findings

**F-E6PA-1 (BLOCKING — OWNER FORK; supersedes the framing of F-2131-1b, does not replace the fork).**
`e6-picnic` idle-secures both bench seeds (`b9f476a6` w20 / `612de94b` w20, ×2 each). F-2131-1b framed
the cure as two options, both expensive: *distinguish commanded defense from autonomous fire*, or
*change what `--policy=idle` means across the whole admission program*. **There is a third, and it is
three booleans of contract data**: F-2090-1's original option (a), *move the hero start off a stake*.
It was set aside as superseded by the owner's ruling, and it is not — it is the ruling's missing half.
Measured above: with `heroStart: false` on all three sandwich stakes and nothing else changed, the
idle floor **LOSES at wave 2 and wave 1, by stakes-all-lost, with the hero at full health**.
**RECOMMENDATION for the desk (one word releases it):** land the three booleans plus the five anchors
of §2 as one slice; the prover hashes of §3 and a fresh idle floor become its gate. **COST if ruled:**
the Prospector no longer opens the run standing on a sandwich — a fiction change, which is why this is
the owner's call and not mine (§7.3).

**F-E6PA-2 (NON-BLOCKING — INSTRUMENT DEFECT, and a shipped script has it too).**
**A headless probe that does not put `contract=<id>` on `globalThis.location` measures the requested
contract's MANIFEST on THE CLAIM'S TERRAIN, and says nothing about it.** `src/world/Terrain.ts:78`
binds `const ACTIVE_CONTRACT = activeContract()` **at module load**, off the URL search — and the
tile's size, dimensions, water, fords, landmark blockers and `nodeAnchors` all derive from it
(`:79`, `:83–:86`, `:102`, `:109`, `:142`, `:167`). `HeadlessContractSim` meanwhile takes its manifest
from its `contractId` argument. Set one and not the other and the two disagree, silently, with no
error and no console line.

I hit this head-on and nearly published its number as the idle floor: my first probe reported
`e6-picnic` idle **dying at wave 5** (`fnv1a32:a16ae02b`) where the canonical driver **secures at
wave 20**. Attributed by elimination, each step measured rather than reasoned:

| probe variant | seed 01 result |
|---|---|
| submits `[]` each turn, `?debug` only | wave 5, dead, `a16ae02b` |
| **no `submitOrders` at all** (mirrors gr-sim exactly), `?debug` only | wave 5, dead, `1cb0c606` — **so the orders call was NOT the cause** |
| no orders, `?debug&contract=e6-picnic`, anchors absent | wave 5, dead, `1cb0c606` — the browser door refuses the param, so terrain still falls back |
| no orders, `?debug&contract=e6-picnic`, **anchors present** | **secured w20, 268 kills, 12 defaulted picks, `fnv1a32:b9f476a6`** — byte-identical to `gr-sim --policy=idle` |

The last row is the proof: the divergence was the terrain binding the whole time, and restoring it
reproduces the canonical hash exactly. ⚠️ **`e2e/ap16-8-admission-probe.mjs:4` has the same omission** —
it sets `globalThis.location = new URL('http://gr-sim.local/?debug')` with no `contract`, then probes
every `CONTRACT_ADMISSION_EXEMPTIONS` entry. Its sibling `ap16-8b-capture-loop-probe.mjs:54` sets
`?debug&contract=${CONTRACT}` correctly, which is what makes the omission legible as a defect rather
than a convention. **Read-verified at source; NOT re-measured against that script**, because doing so
means re-running the exemption program and that is a slice of its own — filed, not fixed here.
Whoever takes it should start by asking which published exemption numbers were measured on The
Claim's ground.

**F-E6PA-3 (NON-BLOCKING, fire-authorable — an agent-facing lie, owed regardless of admission).**
`assets/contracts/epoch-6-atomic/contracts.json` still declares
`engineDependencies: [{ dep: 'picnic-contract-consumers', status: 'missing', … }]`, whose description
reads *"neither implements a three-stake hold"*. `PicnicHoldSystem` has implemented it **in both
engines** since `52c48fce7` (`Game.ts:806`, `HeadlessContractSim.ts:718`). The dossier's second axis
(`scripts/campaign-map-dossier-table.mjs:63`) reports this map as *"🟠 missing"* on a consumer that
exists. Left untouched here on purpose: it is outside the anchors-only data firewall, and it is the
F-E5AC-1 shape — one small truth-pass master.

**F-E6PA-4 (NON-BLOCKING — record).** With the anchors in the tree the audit measured
`0 / 478 / 1121 / 3` over **1602 rows**, 6 exemptions: **+10 agent-lacks, +31 equal, −1 not-offered,
+40 rows**. That is the *"+10/+30/−1/+39"* anchor shape eight previous slices recorded, one row wider
(the picnic publishes one extra parity row). Banked so the ruled slice can predict its pins before it
measures them, and be suspicious if they differ.

**F-E6PA-5 (NON-BLOCKING — a pointer correction).** This task was dispatched citing *"main's current
live pins: 464/1056/4 over 1524, exemptions 6"*. Measured on this base, twice, they are
**468/1090/4 over 1562, exemptions 6** — matching both `scripts/same-game-audit.test.mjs:343` and
`docs/bench/same-game-audit.md` on disk. The quoted figures match neither; whichever handoff carries
them should be corrected before another slice bases arithmetic on them.

## 7. Ledger row for the drain to paste (F-2131-5: the row is the drain's duty)

> 🛑 **PICNIC ADMISSION REFUSED ON LAW 2, AND THE CURE IS NOW MEASURED (`reviews/e6-picnic-admission.md`).** The door work was authored and measured, then **reverted**: the public-verb prover SECURES both bench seeds twice (`fnv1a32:2cc17457` w20 / `fnv1a32:fee59bca` w20) — and so does the **idle floor** (`fnv1a32:b9f476a6` w20 / `fnv1a32:612de94b` w20, `calls: 0`), which `null-floor-anchors.test.mjs:43` forbids without an owner ruling. **The ruled predicate is not at fault and is proven working**: the full-run trace shows east CLAIMED at wave 1 and center at wave 2, held for the remaining 18 waves; only `sandwich-west` survives, because the hero stands on it and auto-fires (`HeadlessContractSim.ts:480` — `heroShooter.enabled` has no policy term; b4v3's `:478`/`:1803` coordinates have rotted to `:480`/`:1830` and were re-read, not copied), refreshing its own active-defense window forever. 🔑 **F-E6PA-1 — THE CHEAP CURE F-2131-1b MISSED, MEASURED NOT ARGUED:** with all three `stakeMarkers[].heroStart` flipped to `false` and NOTHING else changed, idle **LOSES at wave 2 / wave 1 by stakes-all-lost with the hero at full health** (`fnv1a32:c26f77d5` / `fnv1a32:a649be29`, ×2 each). F-2090-1's option (a) is not superseded by the owner's ruling — it is the ruling's missing half. 🔺 **OWNER'S DESK:** one word lands the three booleans + the five banked anchors as one slice. **COST:** the Prospector no longer starts standing on a sandwich. ✅ Also verified, not inherited: the `e10-last-claim` leak stays CLOSED — the scope guard passes, its **manufactured red names `e10-last-claim` by hand on this tree**, and e10's live reachability reads **5 turns** with and without the anchors. Audit pins re-measured verbatim and **unmoved**: 6 exemptions · 468/1090/4 over 1562. Gates: tsc clean · build 1.67 s · node-guards **486/483/1/2 skip, 327 s** (sole red = the contention guard, attributed by `lsof` to a SECOND battery in the sibling worktree `agent-a9e7d8321e70f7a1f`, pid 32199, at load 24.3) · E6 family + ap16-4 **54/2** (both reds = the inventoried `e6-boss-homemaker:126` timeout, `logs/suite-red-inventory.md:172-173`) · adjacent **40/40** · door probe **4/4** ×2 viewports · floors `--check` **every pinned row byte-identical**, sole diff the worktree-relative `eraStamp`. ⚠️ **The anchors cannot land quietly and that is measured:** with them in the tree and nothing else changed, `door-admission-ratchet`, `null-floor-anchors` and `skillmd-guard`'s door-contracts test all go RED, each naming `e6-picnic`. Filed: **F-E6PA-2** (a headless probe that omits `contract=<id>` from `globalThis.location` measures the contract's manifest on **The Claim's terrain** — `Terrain.ts:78` binds ACTIVE_CONTRACT at module load; it reported wave 5 where the real floor secures at 20, and **`e2e/ap16-8-admission-probe.mjs:4` has the same omission** while its `8b` sibling does not) · **F-E6PA-3** (the picnic still declares its now-built consumer "missing") · **F-E6PA-4** (anchor audit shape banked: +10/+31/−1/+40) · **F-E6PA-5** (the dispatch's quoted pins 464/1056/4 over 1524 match nothing on disk; measured 468/1090/4 over 1562).

## 8. Merge classification

**Base:** `705839487`. **Tracked files changed: 3, and none of them is code, data, or a gate.**

| File | Class |
|---|---|
| `reviews/e6-picnic-admission.md` (new) | LANE-ONLY — this review |
| `artifacts/e6-picnic/**` (new) | LANE-ONLY — prover, probes, traces, run logs, screenshots |
| `playwright.e6picnic.config.ts` (new) | LANE-ONLY — scratch config, port 5274 |

**MAIN-MOVED since base (17, re-measured at the end of the slice rather than at its start):** main
advanced from the `1b1d2d2c8` lock to `2bd20fb1f` while this ran, draining `f2138-1` and `f2141-1` —
`STATUS.md` · `package.json` · `src/sim/HeadlessContractSim.ts` · `tasks/BACKLOG.md` ·
`tasks/goals.json` · `tasks/f2141-1-…md` · `reviews/f2138-1-…md` · `reviews/f2141-1-…md` ·
`scripts/canyon-connect-view.test.mjs` · `scripts/f2135-canyon-*.mjs` ·
`artifacts/f2135-canyon-census/**`.

**BOTH-MOVED: none.** The two sets are disjoint — confirmed by measurement
(`git diff --name-only 705839487..main` against `705839487..HEAD`), not by the absence of a complaint —
so the merge is additive by construction and needs no 3-way graft.

⚠️ **One note for whoever merges:** main's `src/sim/HeadlessContractSim.ts` moved under me (the
canyon-connect view publish). That file is the picnic engine's home, so although the change is an
epoch-3 concern and cannot touch a picnic run, **every hash in §3 is pinned to base `705839487`**. If
the fork is ruled and the anchors land, re-run the four floors and four prover runs on the merged tree
and pin *those* numbers — do not carry mine forward on the assumption that nothing moved (Mistake #4).

**Where the player sees this, in a plain boot: nowhere, and that is the point.** `e6-picnic` remains
door-1 refused; `artifacts/e6-picnic/door-probe.spec.ts` asserts it on both viewports —
`?contract=e6-picnic` resolves `activeId: 'the-claim'` with `fallbackReason: 'unavailable-contract'`,
zero console/page errors. The probe reads the *resolved id* rather than merely booting, because a bare
`?contract=<id>` falls back silently and a probe that does not check would pass while exercising
nothing (`_s2080-f1742-1-boot-probe.spec.ts:13`).
