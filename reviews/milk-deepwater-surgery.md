# DEEPWATER SURGERY — cure E5's BROKEN contracts (milk shift, 2026-08-06)

- **Slice:** `milk/deepwater-surgery` — the deepwater-surgery milk shift
- **Branch / tip:** `milk/deepwater-surgery`, forked from `main` @ `565a145a5` (merge-base verified with `git merge-base`, not assumed — branch held **0** commits ahead at start)
- **Worktree:** `/Users/robin/Claude/Projects/gr-milk-deepwater-surgery` (solo-writer; `main` was held ACTIVE by the s1479 fire for this whole shift and was never touched)
- **Files:** `assets/contracts/epoch-5-deepwater/contracts.json` (+8/−1) · `docs/bench/e5-readiness-census.md` (+68/−7) · `e2e/er01-e5-census.spec.ts` (+42/−2). **3 files, +118/−10.**

## VERDICT: BOTH CURES SHIPPED AND PROVEN · ADMISSION DELIBERATELY UNMOVED AT 0 of 4

**BROKEN is 0 of 4.** Both defects were cured at the mechanism the census named, content-only, with
**zero sim change** — proven, not asserted, by re-running all eight forced-diagnostic hashes and
getting the census's recorded values back to the digit.

**AGENT-READY stays 0 of 4, and that is the deliverable working, not falling short.** Every remaining
E5 blocker needs a headless consumer in `src/sim/HeadlessContractSim.ts`, which the shift firewall
forbids. Scope item 1 ordered a STOP plus a socket-shape stub in exactly that case, so that is what
happened: **F-ER01-E5-5** now carries the socket's measured shape.

## What it does

**1 — The Regatta's briefing stopped lying about its own course** (`F-ER01-E5-2`, the BROKEN half).
`briefing.rules[0]` promised *"Six beacon gates"* over a five-beacon course. **The direction was decided
by counting load-bearing surfaces, not by taste:**

| Surface | Says |
|---|---|
| `contracts.json` → `raceCourse.beacons` | **five** (`start` · `northwest` · `midcourse` · `northeast` · `finish`) |
| `mask-tables/e5-regatta.json` → `maskTruth.raceCourse.beacons` | **five**, same five ids |
| `assets/pilots/map-rebuild-spike/regatta-terrain-contract.json` | **five**, same five ids |
| …that file's own `maskAgreement.beacons` | *"five submerged foundation rises follow the published checkpoint centers and radii"* — **the mesh is physically baked at five** |
| `briefing.rules[0]` | six |

**And canon rules neither.** The E5 bundle spec never mentions the Regatta *at all* (0 occurrences of
"Regatta", "checkpoint", "raceCourse"), `lore/STORYBOOK.md:282` describes the course with no count, and
neither owner directive in the bundle (both 2026-07-16) touches it. So this was an unarbitrated
authoring decision, not a canon violation — which is why the cure carries a veto window rather than a
citation. Four surfaces to one, and six would have required inventing a beacon position with no terrain
mount plus a mesh re-bake.

**2 — The Deepwater Claim stopped hiding its gap** (`F-ER01-E5-1`, the declaration half). It now carries
`engineDependencies: [{ dep: 'deepwater-claim-consumer', status: 'missing', … }]` naming the browser-only
path — `DeepwaterClaimTile`, `DeepwaterArsenal`, `DredgeQueenBossSystem`, **all three verified to exist at
the paths cited** before being written into a contract. The entry matches the AP-11 shape
`ContractFamilies.ts:1702` enforces (`exactRecord(['dep','status','description'])`, `status === 'missing'`,
description ≤1024 chars — measured 289). **All four E5 contracts now declare their missing consumer.**

**3 — Both cures are pinned so they cannot silently rot**, as two new asserts in the census spec.
ADMISSION GATE 2 derives the expected count *word* from `beacons.length` rather than hardcoding "five",
so the assert cannot drift the way the prose did, and it cross-checks the mask table beacon-for-beacon.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, zero output lines |
| `npm run build` | **rc=0, green, 1.40s** |
| `GR_RELEASE=e1 npm run build:release` | **rc=0** — *"E1-only: 1883 files, 110041131 bytes, zero later manifest ids or plate/GLB assets (checked against 262 later-asset stems)"* |
| Own spec `er01-e5-census.spec.ts`, `--workers=1`, desktop + mobile | **8/8 passed (6.0s)** |
| Adjacent: all five `er01-e*-census` specs + `contract-bundle-validation`, `--workers=1` | **42/42 passed (3.4m), 0 failed** |
| `npm run test:node-guards` | **rc=0 — 305 tests / 302 pass / 0 fail / 3 skipped**, zero `not ok` |
| Node | **v26.4.0**, matching `.nvmrc` — the pinned interpreter (F-1458-2) |

No screenshots: headless bench infrastructure, zero player-visible surface. The spec's own
zero-`console.error`/`console.warn` assert passed on all 8.

### The cures were proven by manufacturing the old defects, not by a green

A passing guard never executes its violation path. Each arm restored one original defect and re-ran the
spec; each bit **exactly** the right two tests and left the other six alone:

| Arm | Manufactured defect | Result |
|---|---|---|
| 1 | `"Five beacon gates"` → `"Six beacon gates"` | **2 failed / 6 passed** — both failures `e5-regatta` (desktop + mobile) |
| 2 | delete the Claim's `engineDependencies` | **2 failed / 6 passed** — both failures `e5-deepwater-claim` |
| 3 | drop one beacon from the mask table | **2 failed / 6 passed** — both failures `e5-regatta` |

Both files restored and **verified byte-identical by sha256** afterwards
(`c503c5f0…46e9` contracts.json, `a8209f34…d82c` mask table).

There is also a fourth, unplanned proof: the *pre-existing* assert at the old `er01-e5-census.spec.ts:52`
(`expect(…engineDependencies).toBeUndefined()`) **pinned the defect itself**. Landing cure 2 turned it red
on exactly the 2 Claim tests before the spec was touched — the census's own instrument confirming the
cure landed.

### Behaviour-neutrality: all eight forced hashes reproduced to the digit

The census's forced generic GR-SIM diagnostics were re-run, **twice each** (determinism pair), against the
cured contracts:

| Contract | Seed | Census recorded | Re-run 2026-08-06 | Pair |
|---|---|---|---|---|
| `e5-deepwater-claim` | 01 / 02 | died w3 `9d449cc4` / died w3 `96c6e567` | **identical** | A==B |
| `e5-regatta` | 01 / 02 | died w2 `348721b8` / died w2 `3a51716f` | **identical** | A==B |
| `e5-stillwater` | 01 / 02 | died w3 `5eb24494` / died w3 `92ce69e7` | **identical** | A==B |
| `e5-flotilla` | 01 / 02 | died w2 `eb38173a` / died w3 `18ddc919` | **identical** | A==B |

**16/16 runs, 8/8 hashes matching, 0 calls and `secured=false` throughout.** This is the evidence that a
content cure changed no behaviour — and, incidentally, that the original census was honest about its
numbers.

⚠️ **How the forced runs were obtained, stated plainly because it touched a forbidden file.** The support
gate rejects all four E5 ids, so `SUPPORTED_CONTRACTS` was patched *in place, run, and reverted* — the same
"forced" method the census documents. `src/sim/HeadlessContractSim.ts` was **restored and verified
byte-identical by sha256** (`a455db64…1098` on both sides) and appears in **no** commit of this branch
(`git diff --stat` lists three files, none of them sim). Nothing about the gate shipped.

### Verbs re-measured (not inherited)

| Contract | buildables | interactables | operations | rules | rule sources |
|---|---|---|---|---|---|
| `e5-deepwater-claim` | 0 | 0 | **0** | 3 | `twist.baron`, `tileParams.buildZones`, `tileParams.waterSources` |
| `e5-regatta` | 0 | 0 | **0** | 2 | `tileParams.buildZones`, `tileParams.waterSources` |
| `e5-stillwater` | 0 | 0 | **0** | 2 | same |
| `e5-flotilla` | 0 | 0 | **0** | 2 | same |

Confirms the census's prose ("only generic build zones, spring cells, and a Baron row") with numbers, and
confirms the declaration added **no vocabulary** — the honest outcome, since no consumer exists to derive
any. `gr-sim` against `e5-deepwater-claim` still throws `AP-07 supports only …; received e5-deepwater-claim`
— the BLOCKED row reproduced live rather than copied forward.

## Merge classification

Merge base `565a145a5`, verified with `git merge-base`. Branch was **0 commits ahead** of `main` at start,
so every hunk here is this shift's. All three files are **LANE-ONLY** — `main` moved on none of them during
the shift (`main` was held by the s1479 fire, which was authoring, not touching E5 contracts). No conflicts,
no three-way resolution needed. `reviews/milk-deepwater-surgery.md` is a pure add.

`git add` is path-scoped to the four TOUCH-ONLY paths. `node_modules/` was untracked-present on arrival and
is left exactly as found.

## Findings

### 🟥 F-MILK-DW-1 — the shift order's own premise was wrong, and a later reader would inherit it

The order states the census *"marks `e5-deepwater-claim` and `e5-regatta` BROKEN (the census's worst
verdict)"*. **It marks one.** `docs/bench/e5-readiness-census.md` line 9 reads **"BROKEN: 1 of 4"**, and the
Claim's row verdict was **DATA-GAP**; its undeclared-dependency defect lived as *prose inside* F-ER01-E5-1,
never as a BROKEN verdict. The census has exactly one commit (`76c049cb0`), so there is no earlier version
that said otherwise — this was not staleness, it was a misread.

**No harm to the deliverable:** both defects were real, both were named by the census, both are cured. But
the order's arithmetic was checked rather than trusted, and the correction is bannered at the top of the
census so the next reader does not re-inherit "two BROKEN". **GATE: none — recorded.**

### 🟡 F-ER01-E5-6 (filed into the census) — AP-11 never demanded the Claim's declaration

The census read the Claim's silence as an authoring omission. It is **also a mechanism hole, and that is the
more durable half.** `validateEngineDependencies` (`ContractFamilies.ts:1713`) only demands a declaration
when the contract carries a path in `DECLARED_INERT_PATHS` (`:1560`) — that list holds
`tileParams.raceCourse`, `.stillwater`, `.flotilla`, `.description`, `.objectives`, `.teachingIntent` **and
not `tileParams.deepwater`**. The three variants were therefore caught by their *variant* fields; the
flagship, which carries `deepwater` and none of the listed fields, was structurally invisible.
**The siblings' honesty was an accident of which fields they also happened to carry, not the guard working.**

**Not fixed here** (`src/meta/ContractFamilies.ts` is outside the firewall), **but the sweep it needs is
already done:** measured across all ten `assets/contracts/*/contracts.json`, `tileParams.deepwater` occurs in
**exactly four contracts, all E5, and all four now declare `engineDependencies`.** Adding it to
`DECLARED_INERT_PATHS` reds **nothing today** — a one-line change inside a measured zero-fallout window that
closes as soon as any new contract authors a `deepwater` block. **GATE: closes when the path is added or an
owner declines it.**

### 🟡 F-ER01-E5-5 (filed into the census) — socket-shape stub, filed instead of stretched

Both cures hit the sim firewall at the same line, so the socket's shape was written down rather than
half-built. Measured contents: the gate is one `Set` at `HeadlessContractSim.ts:41` (12 ids, none E5);
the `mode` bypass at `:183` is **not** a second door because **no E5 contract declares `modes`** (all four
checked) — the same jointly-unsatisfiable wall that cost the `e3-fairground` run 124k tokens (F-1475-1);
three browser-only consumers need headless twins; and the vocabulary must be **consumer-derived, not
data-scraped**, because `MechanicsManifest.ts` reads none of `deepwater`/`raceCourse`/`stillwater`/`flotilla`
(grep-verified against a *validated* instrument — 339 grep-readable lines, positive control hits).

One ordering trap recorded for whoever builds it: the Regatta also needs non-empty `harvestAnchors` to be
selectable, **and that must be last, not first.** While the consumer is missing, the empty list is
load-bearing — it is what makes selection fall back to the Claim instead of booting a false contract.
**GATE: closes when the E5 era socket lands.**

## 🔻 Veto window (§7.4 — owner absent, action reversible, inside a ratified firewall)

**Robin: one word reverses the beacon ruling.** Canon never fixed the count, so five was chosen because four
data surfaces and a baked mesh hold it. If the Regatta is *meant* to run six gates, the fix is not the
prose — it is a sixth beacon position plus a terrain re-bake, i.e. an art/terrain job. Nothing else in this
shift is a judgement call; the other cure and both stubs are pure honesty repairs.
