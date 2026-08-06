> **DRAIN RECEIPT — s1496, merged `7bfd62ee0427eaf5a31bb30266a3b538b08be5d0`.** This shift's verdict below is preserved
> verbatim (retention law: supersede, never delete). Gated on the MERGED tree in a detached worktree
> (`gate-s1496`, §3.0b custody — undecided content never entered main's working tree), not on the branch.
> **Battery:** `tsc` rc=0 (zero output) · `build` rc=0, 2.61s · own spec `er01-e5-census` **8/8** ·
> adjacent **74/74** · `test:node-guards` rc=0, **zero `not ok`**. All `--workers=1` (§3.1); Node **v26.4.0**
> matching `.nvmrc`. `src/` **byte-unchanged**, **zero deletions**, five files.
>
> **Three claims were re-derived rather than inherited.** (1) The **adjacent set had GROWN since this review
> was written** — it names "all five `er01-e*-census` specs", but s1480 drained the E7–E10 censuses in the
> meantime, so the drain ran **nine** census specs plus `contract-bundle-validation` (74 tests, both
> projects, 5.4m) rather than the six the review gated on. A review's adjacent list ages; re-enumerate it.
> (2) The **beacon cure was re-counted at both surfaces** on the merged tree: `contracts.json` →
> `raceCourse.beacons` = **5** (`start-beacon`, `northwest-checkpoint`, `midcourse-checkpoint`,
> `northeast-checkpoint`, `finish-beacon`) and `mask-tables/e5-regatta.json` → `maskTruth.raceCourse.beacons`
> = **5, the same five ids**. The prose now matches its data. All four E5 contracts carry exactly one
> `engineDependencies` entry. (3) The review's **contamination-immunity argument was verified independently**,
> not taken on trust: port 5188 was **free** at gate time (`lsof` rc=1), and the spec contains **0**
> `page.goto` and **0** `baseURL` against **2** `createServer` — it is genuinely in-process, so it cannot
> measure a sibling worktree.
>
> **Trial merge re-run at the live tip as the review demanded** (`git merge-tree --write-tree`, rc=0, clean —
> the review's own was evidence about a tip that had already moved). `tasks/BACKLOG.md` auto-merged.
> **Goal leaf `milk-deepwater-surgery` registered retroactively in the drain's bookkeeping commit** — this
> shift was owner-launched outside the task-master pipeline and so never tripped the Goal Registration Law
> (F-1495-2, the structural blind spot).
>
> ⚖️ **The veto window below is LIVE and unexpired:** the five-beacon ruling was an unarbitrated authoring
> call, not a canon citation. One word from Robin reverses it.

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

The spec's own zero-`console.error`/`console.warn` assert passed on all 8.

### "Where does the PLAYER see this, in a plain boot?" (Mistake #10) — answered, and it is why there are no screenshots

The beacon line is player-facing prose, so this question is owed. **Measured answer: nowhere yet, and not
by accident.**

- `assets/contracts/epoch-5-deepwater/manifest.json` carries **`locked: true`, `scienceThreshold: 14`** — the
  whole epoch is gated. (`epoch-1-frontier` is `locked: false`; that is the contrast.)
- The Regatta is unreachable *even inside* E5, and this is **measured, not inferred**: the census spec's
  `EXPECTED_ACTIVE_CONTRACT` asserts that booting `?debug&contract=e5-regatta` resolves `activeContract()` to
  **`the-claim`** — and that assert passes. Its empty `harvestAnchors` makes selection fall back rather than
  boot a false contract.

So a screenshot today could only be manufactured from a state the player cannot reach, which is the
*inverse* of the evidence Mistake #10 asks for. The string is verified where it can be verified — at the data
layer, by ADMISSION GATE 2, against four surfaces. **It becomes player-visible when the E5 socket lands and
the epoch unlocks (F-ER01-E5-5), and the assert will be waiting for it then.**

### Evidence hygiene: these gates measured THIS tree, and that was checked, not assumed

`lsof` at gate time showed **port 5188 held by pid 83909, whose cwd is
`/Users/robin/Claude/Projects/gr-milk-motor-socket`** — a *sibling milk shift*, not this worktree. Under the
default config's `webServer` that is exactly the setup where a browser gate silently measures someone else's
tree and reports a confident green.

**It cannot have contaminated anything here, and the reason is structural rather than lucky:** none of the
census specs use `page`, `goto`, or `baseURL` — each stands up its *own* in-process Vite server with
`root: process.cwd()` and SSR-loads the modules directly. Every one of the 42 assertions ran against this
worktree's files. That is also the reason a browser probe was not improvised on the shared port while a fire
and three sibling shifts were live.

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

Merge base `565a145a5`, verified with `git merge-base`. Branch was **0 commits ahead** at fork, so every hunk
here is this shift's.

⚠️ **`main` MOVED UNDER THIS SHIFT — measure three-dot, or you will read phantom deletions.** The s1480 fire
drained the E7/E8/E9/E10 censuses while this work was in flight (~14 commits; tip went `565a145a5` →
`bf758302e` and was still moving at write time). **`git diff main --stat` therefore reports ~844 deletions —
`e7`/`e8`/`e9`/`e10` census docs, specs, reviews, `goals.json`, `STATUS.md` — none of which this branch
touches.** They are main's *newer* content read backwards through a stale base (Mistake #15 / the
phantom-deletion class). The three-dot truth:

```
git diff main...HEAD --stat            → 5 files, +331/−11
git diff main...HEAD --diff-filter=D   → EMPTY: this branch deletes nothing
```

Per-file classification, measured with `git log <base>..main -- <path>` rather than eyeballed:

| Path | main commits since base | Class |
|---|---|---|
| `assets/contracts/epoch-5-deepwater/contracts.json` | 0 | **LANE-ONLY** |
| `docs/bench/e5-readiness-census.md` | 0 | **LANE-ONLY** |
| `e2e/er01-e5-census.spec.ts` | 0 | **LANE-ONLY** |
| `reviews/milk-deepwater-surgery.md` | 0 | **LANE-ONLY** (pure add) |
| `tasks/BACKLOG.md` | **12** | **BOTH-MOVED** |

`BOTH-MOVED` is a bucket, not a loss verdict. A non-destructive trial merge (`git merge-tree --write-tree`,
which writes nothing and touches neither branch) returned **rc=0, clean**, auto-merging `tasks/BACKLOG.md` —
this shift's leaf sits by the E5 row, the fire's rows sit by E7–E10.

➡️ **For the drain: `main` is LIVE, so re-run that trial merge at your own tip; this one is evidence about a
tip that has already moved.** And a clean merge is not evidence the merged tree works — re-run the battery on
the merged tree, not on this branch.

`git add` was path-scoped to the five TOUCH-ONLY paths on both commits; `src/` is untouched
(`git diff main --stat -- src/` is empty). `node_modules/` was untracked-present on arrival and is left
exactly as found.

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
