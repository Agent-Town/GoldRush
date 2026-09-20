# Review — lane-dead-fields-sweep (lane-c)

**Slice:** dead-field sweep across contract vocabulary
**Branch:** `lane/e2-arsenal` · **Tip:** `8292b3fc` "runner(lane-c): lane-dead-fields-sweep.md" (2026-08-02 07:04:08+07)
**Base:** `5fb63bdb (archive: pruned by the A3 rewrite)` (2026-08-01 14:34) · **Drained:** s1380 fire, 2026-08-02
**VERDICT: MERGE** — tsc clean, build green, 30/30 mask tests, and every red reproduced identically on a clean-main control.

## What it does

Removes four contract-vocabulary fields that nothing reads: `twist.sluicesNeedWaterSource`,
`elevation.slopeMax`, `elevation.waterline`, and `tileParams.damChannel`. The removal is made in the
type (`ContractManifest`/`TileElevationDescriptor`), in the rule-deriver (`MechanicsManifest.ts`), in
the byte-stable fixture, and in every shipped contract JSON and mask table that declared them — 20
files, +25/−79. It also adds two validator tests asserting that unknown keys now produce
`field_unknown` at `twist.forgottenRule` and `tileParams.elevation.forgottenContour`, so the
vocabulary is closed rather than merely smaller.

## Merge classification

The two-dot `main..lane/e2-arsenal` diff reports **187 files / 5,621 deletions** and is a
**stale-base phantom**: the lane forked 223 commits back, so nearly everything it calls a "deletion"
is a file main ADDED since. It lists `tasks/lane-seam-yield-single-source-lift.md` as deleted — a
file this same fire created on main minutes earlier and the lane has never seen. **The real content
is the lane's own commit**, and that is what was classified and landed.

| Bucket | Count | Note |
|---|---|---|
| LANE-TOUCHED | **20** | main has not touched any of these since `5fb63bdb (archive: pruned by the A3 rewrite)` |
| MAIN-MOVED / BOTH-MOVED | **0** | no 3-way graft needed |

Because BOTH-MOVED is zero, a path-scoped land is *exactly* equivalent to a merge. Verified rather
than assumed: all **20/20** landed paths are **blob-identical** to `lane/e2-arsenal`'s versions
(`git rev-parse lane/e2-arsenal:<f>` vs `git hash-object <f>`).

## Evidence

Gated in a **detached scratch worktree** (`/tmp/gate-s1380-lanec`) per §3.0b custody — no undecided
content entered main's working tree at any point. The gate tree was reconstructed by file copy and
then **proved 20/20 blob-identical to the lane branch** before a single test ran.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0, clean** |
| `npm run build` | **rc=0**, built in 1.61s, asset-diet ceilings respected |
| `node --test scripts/e3-mask-tables.test.mjs` | **30 pass / 0 fail** (98 ms) |
| Playwright, merged tree, `--workers=1` | 4 specs / **38 tests — 32 passed, 6 failed** (6.8m) |
| Playwright, **CONTROL on clean main**, same command | 2 specs / **20 tests — 14 passed, 6 failed** (4.4m) |
| `e2e/e1-dry-gulch.spec.ts` (contract-data consumer) | **PASSED** both projects on the merged tree |
| `e2e/e3-canyon-works.spec.ts` (mask-table consumer) | **PASSED** both projects on the merged tree |

### The reds are pre-existing, and that is measured, not asserted

The run report described "four unrelated baseline failures". **"Unrelated" is a claim a control run
settles, so one was run** — the identical command against the identical tree with only the 20 slice
paths reverted to main. It produced the **same failure set, test-for-test and project-for-project**:

| Failing test | Merged tree | Control (clean main) | Documented? |
|---|---|---|---|
| `agent-view.spec.ts:261` all five E1 mechanics manifests match their byte-stable fixture | FAIL ×2 | **FAIL ×2** | ✗ **not in the inventory** |
| `ed-03-placement-validator.spec.ts:14` 069 accepts every shipped contract byte-identically | FAIL ×2 | **FAIL ×2** | ✓ `logs/suite-red-inventory.md:125-126` (BOTH) |
| `ed-03-placement-validator.spec.ts` placement controls commit valid descriptors | TIMEOUT ×2 | **TIMEOUT ×2** | ✓ `logs/suite-red-inventory.md:127-128` (BOTH) |

**The merge introduces zero new failures.** (Line numbers move between the two runs — `:99/:181/:273`
control vs `:115/:197/:289` merged — purely because the slice adds 16 lines to that spec. The test
NAMES are identical, which is what a fingerprint match is denominated in.)

### "Grep-proves zero survivors" — verified by reading, not by counting

A naive census of the four removed field names returns **11 files still containing them**, which
reads like a failed sweep. Every one was opened. **All 11 are homonyms of live, unrelated concepts:**

- `Balance.ts:978` / `TileHeight.ts:78,80,83,239` / `vite-env.d.ts:750` — `Balance.terrainSim.slopeMax`,
  a different field in a different namespace (`vite-env.d.ts:750` sits inside the `sim.balance`
  mirror, not the contract elevation descriptor).
- `epoch-5-deepwater/manifest.json:102`, `ResearchChart.ts:172` — the English word "waterline" in
  player-facing prose ("above the waterline").
- `build_e3_contract_terrains.py:1840` — a **render material named** `"waterline"`.
- `build_twin_banks_braid.py:272,488` — comments about where a waterline renders.

**True survivors of the four removed contract fields: zero.** The claim holds; a count alone would
not have shown it, and would have been wrong in the alarming direction.

## Findings

**F-1380-2 (non-blocking, recorded for the next fire).** `agent-view.spec.ts:261` — *"all five E1
mechanics manifests match their byte-stable fixture"* — is red on clean main in both projects and is
**absent from `logs/suite-red-inventory.md`**, so it is an undocumented known-red. That matters more
than usual here: **this slice edits the very fixture that test guards.** The fixture edit (removing
the `sluices_need_water_source` rule block, consistent with removing the rule from
`MechanicsManifest.ts`) is therefore **unverified by its own oracle** — the test that would have
confirmed the fixture and the deriver still agree was already failing before the slice, and is still
failing after it. tsc, build, the 30 mask tests and both contract-consumer specs all pass, so nothing
here blocks the merge; but the byte-stability guarantee this fixture exists to provide is currently
unenforced, and repairing that test is the only way to close the gap. Recommend a corrective rung.

**Non-finding, stated so it is not re-derived:** the sweep does **not** touch `seamYieldMult` in any
form. `"seamYieldMult": 1.4` survives in `epoch-1-frontier/contracts.json`, `twist.seamYieldMult?:
number` survives in `ContractFamilies.ts`, and the `seam_yield_multiplier` rule survives in both
`MechanicsManifest.ts` and the fixture. The concurrent lane-a slice
(`lane-seam-yield-single-source-lift.md`) is unaffected in substance; only its citation coordinate
shifts, since removing `sluicesNeedWaterSource` moves that twist block from lines 124-128 to 123-126.
That master cites the field by name as well as coordinate and instructs verification at source.
