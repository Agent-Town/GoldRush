# lane-herostart-rename — `stakeMarkers.lossCondition` → `heroStart`

**Slice:** `lane-herostart-rename` · **branch:** `lane/perf` · **lane tip:** `92464021` · **merge-base:** `d3349fc0`
**Merged:** `8efae704632c5b7fd581324ebe576aece9ddb2c6` (path-scoped) · **drained by:** s1329, 2026-08-01

## Verdict

**ACCEPTED — merged path-scoped, 43 of the lane's 70 files.** Zero new reds; one new passing test.

## What it does

The owner's 2026-08-01 defeat-fork ruling was option **(C) now** — *"keep it as it is for now and switch
the word to survive"* — and it has two halves. s1328 landed the first (`lane-survive-copy`, `ef1db83c`:
the E1 cards now say *"Survive through wave N"*). This is the second: the contract field
`tileParams.stakeMarkers[].lossCondition` is renamed **`heroStart`** everywhere it appears, because it
triggered no loss anywhere — every consumer used it as a hero-start / ring-centre / prop anchor
(F-1314-1). The data stops lying about itself. Behaviour is byte-identical by design; the only new
runtime behaviour is scope 2's press-era safety catch: `parseContractDescriptor` now **rejects** a
descriptor carrying the retired name, with `stake_marker_hero_start` and a path pointing at the
offending marker, so the old field cannot be silently revived by a hand-edited contract page.

## Merge classification

Lane was **46 commits behind main**, so every file was classified before anything was copied.

| Bucket | Count | Handling |
|---|---|---|
| **TAKEN — LANE-ONLY** (main never moved them since merge-base) | 39 | copied as-is |
| **TAKEN — BOTH-MOVED** | 4 | git 3-way, all auto-merged clean, verified after |
| **DROPPED — recorded evidence** | 27 | restored to main's bytes |
| | **70** | |

**BOTH-MOVED, verified after the auto-merge rather than trusted:**
`assets/contracts/epoch-1-frontier/contracts.json` · `src/game/Game.ts` ·
`src/meta/ContractFamilies.ts` · `specs/e10-static-mechanic-DRAFT.md`.
E1 still carries **6** contracts (drill-yard preserved) and still reads **"Survive through wave N"**
(s1328's copy preserved); `e1-twin-banks`'s two stake markers now carry keys
`["id","x","z","heroStart"]`.

**The 27 dropped files are the point of this drain, not an omission.** The master's SELF-CHECK demanded
*"repo-wide grep proves zero `lossCondition` survivors"*, which F-1327-2 measured as **unsatisfiable**:
31 files were neither live nor covered by its exclusion list. The runner obeyed the literal reading and
rewrote **4 measured-evidence JSONs under `artifacts/`** (`e5-deepwater-claim` tile-state desktop+mobile,
`terrain3d-registry` fingerprints desktop+mobile) and **23 files under `assets/pilots/map-rebuild-spike/`**.
Those artifacts are *measurements of past runs cited by shipped reviews* — rewriting their bytes falsifies
the record (RETENTION LAW), and **no gate in the battery would have caught it**, because the diff is
textually correct and every suite still passes. They were restored to main's bytes before committing.
The lane avoided two other predicted hazards on its own: `STATUS.md` and the `.scratch-*` / `.s*-probe-bak/`
backups are untouched.

**Zero-survivors grep, live paths — the expected end state, not a clean sweep:**
`src/` `e2e/` `assets/contracts/` `specs/` carry **2** `lossCondition` sites, both intentional and both
required: `src/meta/ContractFamilies.ts:930-936` (the validator that rejects the old name) and
`e2e/ed-03-placement-validator.spec.ts:45-50` (its spec). Repo-wide the token survives in 53 files, all
history/evidence/ledger. **Survivors in those paths are correct.**

## Evidence

All playwright runs `--workers=1` (§3.1 — a fire-shell red at default workers is not evidence).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, built in 1.27s |
| node guards (`node --test`, 37 files) | **209 passed / 0 failed**, 41.9s |
| release suite (`playwright.release.config.ts`) | **26/26 passed**, 1.9m |
| boot probes desktop + 390px mobile (`_s106-prospector-boot-probe`, `trail-guide-plain-boot`, `e10-river-boot-guard`) | **6/6 passed**, zero console/page errors |
| slice specs (`e1-twin-banks`, `ed-03-placement-validator`, `world-info-notes`), both projects | 22 passed / **14 failed** — every one pre-existing, see below |
| adjacent `agent-view.spec.ts`, both projects | 6 passed / **2 failed** — pre-existing, see below |

### The reds are attributed by a CONTROL RUN, not by argument

A detached worktree at clean main (`/tmp/gr-ctl-s1329`, main `3f2bb1cc`) ran the same specs with the same
instrument in the same hour.

| Spec | merged tree (desktop) | **control, clean main (desktop)** |
|---|---|---|
| `e1-twin-banks.spec.ts` | `:103`, `:122` red | **`:103`, `:122` red** |
| `ed-03-placement-validator.spec.ts` | `:14`, `:181` red | **`:14`, `:169` red** (same test names; `:181` is `:169` shifted by the lane's new test) |
| `world-info-notes.spec.ts` | `:196`, `:290`, `:319` red | **`:196`, `:290`, `:319` red** |
| `agent-view.spec.ts` | `:261` red | **`:261` red** |

**Identical failure set by test name.** The arithmetic reconciles too: control ran 17 desktop tests
(10 pass / 7 fail); the merged tree ran **18** per project — the extra one is the lane's new
`069 rejects the retired stake marker field by name`, and it **passes**. So this merge's net effect on the
suite is *+1 green, +0 red*.

`world-info-notes` and `agent-view` are **known**: the first is F-1159-2 / F-1164-1 (the mobile
`.prompt-stack` reserve is 42–50 px short of `#touch-controls`; owner-gated fork, on the desk), the second
is **F-1328-1**, s1328's drill-yard census debt whose corrective is blocked pending a changed premise.

## Findings

**F-1329-1 — CORRECTED BY ITS OWN AUTHOR, SAME FIRE: FOUR SHIPPED CONTRACTS ARE REJECTED BY THE APP’S OWN
VALIDATOR. THE MECHANISM IS THE FINDING; THE REDNESS WAS ALREADY TRACKED.**

⚠️ **This was first written with the headline “recorded nowhere”, and that was false.** I had grepped
`tasks/BACKLOG.md` only. `logs/suite-red-inventory.md` — a standing red inventory that **already exists** —
carries all four rows with project, failing `file:line`, first error line, duration, BOTH/MOBILE-ONLY
bucket and flake rate (`ed-03:18` at **4/25, 16.0%**). My recommendation to *build* such an inventory was
redundant; acting on it would have had a fire build a second one. It surfaced only because
`citation-title-guard` printed the file’s name in an unrelated PASS line during the ledger battery.

✓ **What survives is the part the inventory cannot contain — the mechanism.** The inventory records the
symptom (`Error: expect(received).toBe(expected)`), not which contracts fail or why. Probed directly:
**4 of 42 shipped contracts are rejected by `parseContractDescriptor`** — `e5-deepwater-claim`,
`e5-stillwater`, `e5-flotilla` each fail `field_number` on
`tileParams.deepwater.waterTile.regions[1..5].depth` (5 reasons apiece); `e10-river` fails
`spawn_edge_required` on `tileParams.lanes.spawnEdges`. **Shipped code refusing shipped data** — the
contract editor cannot round-trip four maps. It is deterministic (a pure function), which sits oddly
beside a 16% flake rate and is worth reconciling.

✓ **Second true half:** none of the four appear in BACKLOG. Per the inventory header, main carries **303
failures of 2388 tests** — tracked as a measurement, and **zero of them exist as work.** That is the
Completeness Law’s real complaint here.

➡️ **Owner’s desk, not fire-authorable:** whether the four maps are wrong or the validator’s depth range
is wrong is a design question whose answer edits shipped map data.

💡 *“I grepped the ledger and found nothing” is a claim about where you looked, not about the repository.
A finding that recommends building a mechanism should first grep for that mechanism.*

**F-1329-2 — F-1327-1's CORE CLAIM IS CONFIRMED AND NOW LITERAL, BUT ITS "FIREWALLED OUT OF SCOPE" HALF
IS FALSE — THE RUNNER RENAMED `MechanicsManifest.ts` ANYWAY.** F-1327-1 predicted the manifest file was
*"absent from the master entirely"* and *"correctly firewalled out of both"* live slices, and therefore
unowned. Measured against the real diff: `src/agent/MechanicsManifest.ts` **is** in the lane's 70 files.
The master's TOUCH-ONLY says *"the field name **everywhere it appears**"*, and the runner found the file
by grep even though the master's hand-written census omitted it — so the census omission was **not**
consequential for the rename half. ✓ **What F-1327-1 got right is the part that survives, and it is now
worse than when it was written:** `MechanicsManifest.ts:96-99` still publishes a `posting.lossStakes`
array and `:108` still prints the literal term **`'loss stakes'`** to the agent — now derived from
`.filter(({ heroStart }) => heroStart)`. **An array called `lossStakes` computed from a field called
`heroStart`.** `e1-twin-banks` is still the one E1 manifest with a non-empty array. The third slice
F-1327-1 asks for (retire `posting.lossStakes` and the manifest term, or re-derive them from a mechanic
that exists) is **still owed and now cheap** — both live slices have drained, so the reason it could not
be folded in mid-flight is gone. Small, mechanical, fire-authorable next fire.

**F-1329-3 (non-blocking, third sighting) — the gate battery rewrote 18 tracked evidence PNGs.**
Running these suites dirtied `artifacts/e1-twin-banks/`, `artifacts/trail-guide-plain-boot/` (11),
`artifacts/world-info-notes/` (4) and `reviews/shots-prospector-presence/` (2) — shipped measurements that
reviews cite, dirtied by *merely testing*. All 18 restored before the merge commit. This is s1328's
**F-1328-3** reproducing exactly, and it is the same hazard class as the 27 files this drain had to drop
by hand: **a careless `git add` at either moment rewrites the record.** The per-run-output-dir cure is on
the owner's desk and is worth the small slice.

## Merge hygiene

Path-scoped adds only; no `-A`. Merge commit carries `lane/perf` as second parent, so the 27 dropped
files are recorded as a deliberate ruling rather than an unmerged remainder. Goal leaf
`e1-defeat-fork-herostart-rename` registered in the drain commit with the full 40-hex `mergeHash`
(F-1327-4's debt, and `goal-tracker.test.mjs:80` asserts the full sha).
