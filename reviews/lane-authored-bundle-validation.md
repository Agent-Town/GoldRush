# lane-authored-bundle-validation — s1381 gate

**Slice:** authored-bundle validation across 10 epochs / 42-contract fleet
**Branch:** `lane/perf` · **tip** `0f2544f2` · **base** `5a782e0d` · ahead=1
**Done-move:** `tasks/done/20260802-064330-lane-authored-bundle-validation.md`
**Run log:** `tasks/runs/20260802-064330-lane-d-lane-authored-bundle-validation.md.log` (654,147 tokens)
**Gated in:** detached scratch worktree `/tmp/gate-s1381` (§3.0b custody — nothing undecided entered main's tree)

## VERDICT: HOLD — NOT MERGED

> ⚠️ **SUPERSEDED s1454 (F-1454-2) — STALE VERDICT LINE.** The slice **MERGED at `9a95f99d1b`**
> (*"lane-d: authored-bundle validation across 10 epochs — RE-GATED against the repaired E1 re…"*),
> verified **IN-MAIN by ancestry** (`git merge-base --is-ancestor 9a95f99d1b main` rc=0); leaf
> `e1-authored-bundle-validation` carries `status: merged`, `mergeHash 9a95f99d1b`. The hold below
> was discharged the honest way — **re-gated against the repaired base**, not waived. `scripts/fire.md`
> §3.0 names this same `9a95f99d` as the code commit of the F-1384-1 two-commit sequence.
> ⓘ This leaf is also the subject of **F-1383-1**: it spent days frozen because its `blocked` status
> carried no `blockClass`, so a `gate-side` hold read as an owner fork nobody would ever lift. The
> HOLD text below is KEPT (retention law: supersede, never delete) — it is the record of a real
> regression correctly caught.

The slice regresses the **E1 release build**, reproducibly, at its own base. `npm run build:release`
(`GR_RELEASE=e1`) fails at `scripts/assert-release-build.mjs:48`:

```
Error: [release-build] later era assets emitted: char-bandit-base-sheet-walk8-r2c6-e4-RHTJh-diet-a9d5c9a0.js
```

An **E4 character sprite chunk is emitted into the E1-only release bundle**. That check exists to keep
later-era art out of the shipped E1 build; it is a release gate, not a lint.

## §3.0 block check

`✅ CLEAR — lane-authored-bundle-validation.md [e1-authored-bundle-validation] status="queued"`.
Run before classification and before forming an opinion. The HOLD below is a gate failure, not a policy block.

## Evidence table

| # | Check | Result |
|---|---|---|
| 1 | `drain-block-check` | ✅ CLEAR |
| 2 | `lane-freeze-classify lane/perf` | HOLDS 11 paths · **7 LANE-ONLY · 0 MAIN-ONLY · 4 BOTH-MOVED** |
| 3 | `git merge-tree` (read-only) | 3 contracts.json auto-merged; **1 conflict: `src/meta/ContractFamilies.ts`** |
| 4 | `npx tsc --noEmit` (grafted tree) | ✅ CLEAN |
| 5 | `npm run build` (grafted tree) | ✅ GREEN (925 ms) |
| 6 | slice spec `contract-bundle-validation.spec.ts` | ✅ 2/2 both projects, `--workers=1` |
| 7 | manufactured-defect probe (narrowed allowlist) | ✅ PASSED — narrowing is **enforced**, not cosmetic |
| 8 | **`GR_RELEASE=e1 npm run build:release`** | ❌ **RED** — later-era asset leak |
| 9 | **CONTROL: clean main, identical command** | ✅ **GREEN** → the red is the merge's, not pre-existing |
| 10 | ARM 1: lane-d `ContractFamilies.ts` + **main's** 9 contracts.json | ❌ RED → cause is **not** the contract JSON |
| 11 | ARM 2: lane-d **raw** `ContractFamilies.ts` (no graft edits) + main JSON | ❌ RED → cause is **not** my graft |
| 12 | ARM 3: lane/perf tip `0f2544f2` **at its own base** | ❌ RED, identical error → **not** an interaction with main |

**Attribution: `src/meta/ContractFamilies.ts` as authored by this slice**, isolated by three arms and a
control. The defect is present on the lane's own tree — it does not require main's movement to appear.

## The 4 BOTH-MOVED paths and how the graft resolved them

`lane/perf` forked at `5a782e0d`, which **predates s1380's two merges**. Main then absorbed
`2258daf3` (lane-c dead-fields-sweep), which retired four words from the contract vocabulary:
`sluicesNeedWaterSource` · `slopeMax` · `waterline` · `damChannel`. Lane-d, blind to that, **typed and
allowlisted all four**. Both conflicts in `ContractFamilies.ts` are that same collision:

- `:672` — BASE had `damChannel?:` as one line; **main deleted it**, lane-d replaced it with 26 lines
  (damChannel + 25 genuinely new typed fields). Graft: took the 25, dropped `damChannel`.
- `:1015` — main removed `waterline` from the `contractNumberRange` signed-key regex; lane-d kept it
  and added a new deepwater-depth clause. Graft: took the new clause, dropped `waterline`.

Beyond the two conflicts, lane-d's **new** allowlists re-enumerated the retired vocabulary
(`AUTHORED_TILE_KEYS:'damChannel'`, `AUTHORED_TWIST_KEYS:'sluicesNeedWaterSource'`, and three
`DECLARED_INERT_PATHS` entries). Those merged cleanly — main never had these lists — but shipping a
brand-new allowlist that names a vocabulary main deleted 40 minutes earlier would **re-establish the
second source s1380 removed**. Graft dropped them, on a measurement: **zero contract JSON in
`assets/contracts/` declares any of the four** (`grep -rlE` → no files). The removal was then proven
load-bearing by planting `damChannel` into `e1-dry-gulch` and asserting the validator throws (it does).

The graft is sound and is **not** the cause of the HOLD — ARM 2 shows the red without it.

## Findings

**F-1381-1 (BLOCKING, this slice) — authored-bundle validation leaks an E4 sprite chunk into the E1
release build.** Reproduce: `git checkout --detach 0f2544f2` in a scratch worktree, symlink
`node_modules`, `GR_RELEASE=e1 npm run build:release`. Fails at `assert-release-build.mjs:48`.
Control (clean main) green. Not the contract JSON (ARM 1), not the graft (ARM 2), not a main
interaction (ARM 3).
⚠️ **The mechanism is UNVERIFIED and I will not guess it.** My first hypothesis — that boot-time
validation newly forces eager epoch imports — is **false**: main already imports all ten epoch bundles
statically (`src/meta/ContractFamilies.ts:9`). Something else in this slice pulls the E4 bandit sprite
module into the E1 graph. Diagnosing that is the corrective's first job, not this gate's.

**F-1381-2 (non-blocking, process) — the run report claims a green the tree does not support.**
The report lists *"release suite 26/26"* among its greens. `playwright.release.config.ts` starts its
webServer with `GR_RELEASE=e1 npm run build:release && npx vite preview --port 5190`, and that command
**fails on the lane's own tip**, so the release suite cannot have run to 26/26 on the final tree. Either
it was measured before the last edits or the label is wrong. Reported, not merged.

## Custody note (§3.0b)

Everything above was computed and executed in a **detached scratch worktree**. Main's working tree was
never given content from this slice; the only write into the repo root was the gitignored `dist/` from
the control run. `git status` at close: clean but for regenerated `logs/dashboard.html`.

## Instrument failure worth recording

While setting up ARM 3, my own `git clean -fd` deleted the `node_modules` **symlink**. The next
`build:release` returned **rc=127, `sh: tsc: command not found`** — which my wrapper had classified as a
generic red, and I nearly recorded as *"RED at its own base"*. **A contaminated control is not a
measurement; it is the absence of an instrument.** The arm was re-run with the toolchain restored, and
only then did it produce the real, identical error. The conclusion survived; the first reading of it
did not deserve to.
