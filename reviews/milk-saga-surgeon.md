# THE SAGA SURGEON — E3/E4/E6 contract surgery

**Slice:** `milk/saga-surgeon` (worktree `gr-milk-saga-surgeon`) · **base** `18b2ef276` · **merged main** `bab80361` · **tip** at review time `ab37981e3` + merge + this commit
**Verdict:** ✅ **READY-FOR-GATES** — one cure landed and gated; three findings filed; one owner decision raised.

---

## ⚠️ THE TASK'S PREMISE WAS FALSE, AND THAT IS THE FIRST FINDING

`TASK.md` says: *"the censuses mark one contract BROKEN in each of e3/e4/e6."* **They do not.** Measured before any work:

```
e3-readiness-census.md:9   BROKEN: 0
e4-readiness-census.md:9   BROKEN: 0
e6-readiness-census.md:9   BROKEN: 0
```

Swept across **all nine** censuses, exactly one BROKEN row existed in the fleet — `e5-regatta` ("**BROKEN: 1 of 4**", briefing promises six beacon gates, `tileParams.raceCourse.beacons` holds five) — and epoch-5 is explicitly *another shift's, do not touch*.

So the named work did not exist. Rather than stop (a false first blocker halts the search for the real one) or invent scope, I used E5's defect as a **calibrated instrument** — *a countable claim in briefing prose contradicted by structured data* — and ran it, plus the AP-11 dependency mandate, across all twelve in-scope contracts. That found real, in-scope work the censuses had recorded and deferred.

---

## WHAT THIS SLICE DOES

**One cure, content-only.** All four `epoch-6-atomic` contracts omitted `tileParams.engineDependencies` while each has a named missing consumer. The E6 census recorded the gap and explicitly deferred it — *"The missing declarations are recorded, not repaired in this census."* This slice repairs them:

| Contract | Declared dep | Names |
|---|---|---|
| `e6-glow-mesa` | `glow-mesa-contract-consumers` | decay-field, six-vein night harvest, wrangle, Homemaker boss |
| `e6-showroom` | `atomic-wrangle-consumer` | the shared epoch-wide wrangle loop, alone |
| `e6-half-life-hollow` | `half-life-hollow-contract-consumers` | wrangle + the prose-only bridges/causeway/shelves |
| `e6-picnic` | `picnic-contract-consumers` | wrangle + the three-stake hold objective |

**The declarations are honesty, not admission.** No contract enters `SUPPORTED_CONTRACTS`; every one stays rejected by the support gate; all four census verdicts stay **DATA-GAP**; no seed was added; `bench-seeds.json` is untouched. Zero sim code, zero balance, zero runtime behaviour: `engineDependencies` is read only by `validateEngineDependencies` (`src/meta/ContractFamilies.ts:1694`) — verified by grepping every `src/` reference (4 hits, all in that one file).

The vocabulary was **derived from the census findings**, not invented, and the multi-system plural form (`-contract-consumers`) follows the merged `e8-far-side` / `e8-low-orbit` / `e8-eclipse` precedent; the shared-single form follows `e8-mare-claim` / `atmosphere-wall-consumer`.

---

## EVIDENCE (all on the MERGED tree, `--workers=1`, both Playwright projects)

| Gate | Result |
|---|---|
| `tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.53s** |
| `contract-bundle-validation` + `er01-e6` + `er01-e3` + `er01-e4` | **26 passed / 2.0m** |
| `er01-e2/e5/e7/e8/e9/e10` (adjacent, unmodified) | **48 passed / 2.5m** — nothing moved |
| `npm run test:node-guards` | **336 tests, 333 pass, 0 fail** (3 skips = documented cross-engine F-1408-2) |
| `npm run test:ledger-guards` | **77 pass, 0 fail** |
| Console/page errors | **zero** — the census spec asserts `consoleErrors` is empty per contract |

**Instrument custody (F-1457 / the "measure another tree" class).** Port **5188 was held by another shift** at gate time (PID 32370) — it had been free during the first run, so re-gating on the merged tree is what caught it. `vite.config.ts:38` hardcodes 5188 under `strictPort`, so `PORT` sets nothing. I moved to a scratch port — and **5241, my first pick, was also already taken** by another shift; the log said `Port 5241 is already in use` while `lsof` showed a listener, which would have read as "my server is up". Gating there would have measured someone else's tree. Final run used **5263**, verified free first, and ownership confirmed by PID (56974, child of my spawn, `ready in 80 ms`), via `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL`. Server stopped and scratch files removed after the run.

---

## MERGE CLASSIFICATION

Base `18b2ef276`; main advanced to `bab80361` (7 commits) during the shift and was **merged in before the final gate**, per §3.0b (gate the merged tree).

- **LANE-TOUCHED (5, all mine):** `assets/contracts/epoch-6-atomic/contracts.json` · `e2e/er01-e6-census.spec.ts` · `docs/bench/e{3,4,6}-readiness-census.md`
- **MAIN-MOVED (10, none mine):** `STATUS.md` · `package.json` · `tasks/BACKLOG.md` · `scripts/stale-ready-for-gates-guard{,.test}.mjs` · `e2e/run3d-rail-elements.spec.ts` · artifacts/logs
- **Conflicts: none** — zero file overlap.

⚠️ **The merge was load-bearing, not hygiene.** Main's `package.json` change added `stale-ready-for-gates-guard.test.mjs` to **both** the node-guard and ledger-guard batteries. Pre-merge I measured 322/63; post-merge 336/77. Gating on my stale base would have silently skipped a guard that now gates this repo.

---

## FINDINGS

### F-MILK-SS-1 — the `engineDependencies` mandate has never fired on a real violation and structurally cannot
**STUB — cure is outside TOUCH-ONLY (`src/meta/ContractFamilies.ts`). Filed, not driven by.** Full detail in `docs/bench/e6-readiness-census.md`.

The mandate (`specs/agent-play/README.md:159`) says *any* tileParams key without a registered consumer must declare. Enforcement (`:1713`) fires only when a `DECLARED_INERT_PATHS` entry is present — and all ~40 of those are **data** keys. A contract whose gap is a missing **system** carries no such key. Fleet-wide, 42 board contracts:

| | before | after |
|---|---|---|
| Declaring | 27 | **31** |
| Not declaring | 15 | **11** |
| — legitimately absent (shipped / AGENT-READY) | 7 | 7 |
| — **genuine violations** | **8** | **4** |

**All 11 non-declarers carry zero inert keys** — i.e. the guard's denominator excludes 100% of real violations. And compliance among declarers is largely accidental: of the six compliant e3/e4 contracts, **five** were guard-forced by inert data; only **`e3-canyon-works`** declares voluntarily with zero inert keys. That one contract is both the proof the guard isn't doing the work and the precedent that made this cure legal.

### F-MILK-SS-2 — four contracts outside scope still owe the same declaration
**STUB — out of TOUCH-ONLY.** `e5-deepwater-claim`, `e7-relay-valley`, `e9-dome-basin`, `e10-ember-shore`. Each census already says so in prose; E9's states the fleet-wide position outright (*"ER-01 records that asymmetry rather than editing contract content"*), so this is a uniform deferral, not one census's oversight. Same four-line content edit as here, plus each epoch's census spec.

### F-MILK-SS-3 — 🔴 **OWNER DECISION** — Dust Flats promises four surveyed fields and authors three
E4's headline moves **BROKEN 0 → 1 of 4 (also DATA-GAP)**, on the E5-Regatta precedent. `e4-dust-flats.briefing.goals[0]` says *"Build from the Motor Camp into four surveyed fields"*; `buildZones` = `motor-camp` + `north-field` + `southwest-field` + `southeast-field` = camp + **three**. The camp is never counted: `e4-gusher-county` is the decisive control — same bundle, same *"Build from the &lt;X&gt; Camp … the &lt;N&gt; &lt;grounds&gt;"* template, "three leases" = exactly 3 non-camp zones. Long Road and Boneyard agree.

**Not cured deliberately.** The two cures are not equivalent: authoring a fourth field is gameplay/balance (firewalled from this shift), while editing the prose to "three" is one reversible word — *and would permanently erase the only record that a fourth field was ever intended*, turning a possible map defect into "working as intended". A cheap cure that destroys evidence is the wrong cure. **Recommendation: if the Dust Flats plays well as three fields, take the prose fix.** Owner picks.

### F-MILK-SS-4 — E3 swept clean on both classes (no finding opened)
Recorded in `docs/bench/e3-readiness-census.md` so it is not re-run. All 16 countable Voltage claims match their data (36 W trunk, 0.05 Wh ×2, 12 W discharge, exactly three `… Trunk Frame` relays, `connect {required:2, byWave:6}`, 24 W wheel, viewRadius 18, `crowdFlocks.count` 3, both pavilions `radiusPerNight` 3, all three map dimensions). E3's dependency state is correct for the right reasons.

⚠️ **Instrument note carried into the census:** the fairground pavilion row first read as a **defect** because my probe guessed the key `nightRadiusBonus` and got `null` for both pavilions. The real key is `radiusPerNight`, and the claim matches exactly. **A `null` from a guessed key is not a negative result** — I read the object before recording the absence, which is the only reason this shift did not file a false finding against clean data.

---

## WHAT THIS SLICE DID NOT DO (firewall honesty)

- **No sim code, no Balance, no epoch-5** — TOUCH-ONLY respected; the five changed files are all inside it.
- **No socket work.** Every E6 finding's socket half is untouched and each row says so; the declarations do not narrow the real blocker (`WrangleSystem` et al. are still browser-only).
- **No admission.** Nothing added to `SUPPORTED_CONTRACTS` or `bench-seeds.json`.
- **No decision on Picnic's three-stake objective** — the census demands the objective be *decided and encoded*; that is design, not data. Picnic's own countable claim already matches its data (3 stakes = `stakeMarkers` 3).
- **No unilateral prose edit on Dust Flats** — see F-MILK-SS-3.
- **The RETENTION LAW was followed**: every superseded census sentence is struck in place with its original text retained verbatim; nothing was deleted.

---

## 🔔 HANDOFF — ONE ACTION THIS SHIFT IS FIREWALLED FROM DOING

**F-MILK-SS-3 needs an owner word, and this shift cannot put it where Robin reads it.**

The owner's desk is the **tail of `STATUS.md` line 1** (`scripts/desk-declaration-guard.mjs:161` — *"The desk list is the tail of STATUS.md LINE 1 — never any other line"*). This shift's laws forbid touching `STATUS.md`. So the declaring BACKLOG row exists — which is all `desk-declaration-guard` requires — **but the desk line itself does not, and without it the finding never reaches the owner.**

That failure mode is already catalogued in this repo as **F-1473-2 / F-1334-2**: *"writing 'owner's desk' into [an unparsed field] is a no-op that reads like an escalation. The audit PASSes, the fire feels it discharged the duty, and the owner is never asked."* This section exists so that does not happen here.

**Next fire or attended session holding the STATUS lock: append this to `STATUS.md` line 1, verbatim.**

```
 · 🔴 **F-MILK-SS-3** — Dust Flats says "four surveyed fields", authors three. Add a 4th field (gameplay) or fix the prose (erases the intent record)? **One word.**
```

Verified absent as of this review: `head -1 STATUS.md | grep -c 'MILK-SS-3'` → **0**.
