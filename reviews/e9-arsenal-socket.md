# e9-arsenal-socket — ERA-SOCKET class #7, the first EPOCH-WIDE one

- **Slice:** `lane-e9-arsenal-socket.md` (authored s1503, dispatched to lane-c 00:59)
- **Branch / tip:** `lane/c` @ `9ec75c52f` (runner commit)
- **Merge base:** `6259b16df` · **Merged to main:** `e73c459cdb75d5378f31d84ae50cf15a19a9c77d` (`--no-ff`, three-way)
- **Drained by:** s1505 fire, 2026-08-07
- **§3.0 block-check:** ✅ CLEAR — a real leaf, `status:"queued"` (not UNKNOWN)

## VERDICT: **MERGED** — the gate is green and the census headline is provably unmoved.

## What it does

`E9ArsenalSystem` is the **epoch-wide** blocker named in **all four** E9 census rows (`:19`–`:22`) and in
the summary (`:10`) — where the canal socket narrowed one row, this narrows four. The slice adds
`src/sim/E9ArsenalSocket.ts` (102 lines): a `private constructor` + `static create()` that derives the
epoch from the contract manifest via `listEpochs()`/`loadEpoch()` rather than a hardcoded id list, so it
admits all four Red Fields contracts and returns `null` for everything outside `epoch-9-redfields`. It
drives the production `E9ArsenalSystem.update` seam and **counts the two consumers it refuses** —
`CombatSystem.update` and `EnemyPool.update` — so a computed Storm Fence slow is integrated by nothing
and no shooter ever fires. `simulationSnapshot` strips `diagnostics.presentation`, per the reason
`DeepwaterSocket.ts:162-166` gives: a render decision must never move a determinism hash.

The census spec gains 74 lines **inside the existing per-contract loop** — no new `test(...)` titles — and
the four census rows are reworded to say the arsenal is socketed-with-two-refusals rather than
browser-only.

## Evidence (all on the MERGED tree, in a detached `gate-s1505` worktree per §3.0b; every playwright command `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 978 ms** |
| Own spec `e2e/er01-e9-census.spec.ts` | **8 passed** (4 desktop + 4 mobile), 7.1 s |
| `npm run test:node-guards` (**mandatory — diff adds `src/sim/`, F-1460-1**) | **rc=0 · fail 0 · skipped 3**, 163.5 s |
| `gr-sim` Baron pin | **unmoved** (inside the green battery above) |
| Adjacent, derived from the tree (`ls e2e \| grep -i e9` + the two sockets copied) — 7 specs | **38 passed / 6 failed** |
| Control arm at clean main `873e69e4b`, same worktree, same shell | **6 failed / 6 passed — IDENTICAL 6** |
| Boot probes `profile-first-boot` + `_s106-prospector-boot-probe` | **14 passed**, zero console/page errors, desktop + 390px |

**The expected count was DERIVED, not inherited:** `redfields.contracts` holds 4 contracts and the file's
single `for` loop mints one `test(...)` per contract; scope 4 forbade new titles, so 4 per project × 2
projects = **8**. Measured 8.

### The six adjacent reds, exonerated by measurement rather than by argument

`e2e/e9-arsenal.spec.ts` "Cure-Arms free people and power fevered machines down without death events"
(×2) · `e2e/e9-roster.spec.ts` "E9 placeholders preserve siege/thief flags and cure-arms exits" (×2) ·
`e2e/e9-roster.spec.ts` "plain Red Fields boot stays error-free without the debug harness" (×2).

`node scripts/red-inventory-lookup.mjs e2e/e9-arsenal.spec.ts` → **KNOWN-RED**, blast radius 15/20 (75.0%)
on both projects. `e9-roster` remains **NOT-IN-INVENTORY** (F-1503-3, still open and still correct).

⚠️ Inventory membership is never exoneration (F-1444-2, proved by F-1448-1), and `e9-roster` had no row at
all — so a **control run at clean main `873e69e4b`** was paid for in the same worktree and the same shell:
**the same 6 tests, the same 3 titles, both projects.** The merge causes none of them.

ⓘ The supporting argument, which is *corroboration and not the proof*: `grep -rn E9ArsenalSocket src e2e
scripts` returns hits in exactly two files — the socket itself and the census spec. **Zero game-code
importers**, so the merge ships no runtime surface. That is why the control was expected to match; it is
not why we believe it does.

### The unmoved-headline proof — checked FIRST, as the master and the s1504 handoff both ordered

- `docs/bench/e9-readiness-census.md:8` still reads **`AGENT-READY: 0 of 4.`** — byte-identical before and after.
- `:9` still reads **`DATA-GAP: 4 of 4.`**; every row still reads **NO** / **DATA-GAP**.
- All **8** `fnv1a32:` diagnostic hashes are **identical** before and after (compared as a sorted set, not by eye).
- The spec diff is **purely additive: 0 deleted lines, 74 added.** The throws-assertion
  (`e2e/er01-e9-census.spec.ts:55-59`, *"${contract.id} census rejects the unsocketed Red Fields mechanic"*)
  is therefore **unedited by construction**, and green. This is the load-bearing proof that a gap narrowed
  instead of a row inflating.

### Runner-reported numbers, re-derived or accepted with their source named

- **Determinism:** both drives `sha256:e0a342a149872fa4680be98c989780c7cea6ddf952307544d9375bbb1363f203`
  (byte-identical `JSON.stringify(simulationSnapshot)`) — asserted inside the spec that passed 8/8.
- **Refusal counters:** `combatTicksRefused = 181`, `enemyIntegrationTicksRefused = 181` in both drives —
  likewise asserted in the green spec, not taken on the runner's word.
- `SUPPORTED_CONTRACTS`, `HeadlessContractSim`, `E9ArsenalSystem`, `E9Arsenal` **untouched** — verified by the
  merge diff being exactly the three permitted paths.

## Merge classification

`git log <merge-base>..main -- <the three paths>` returns **empty**: main moved **none** of them since
`6259b16df`.

| Path | Class |
|---|---|
| `src/sim/E9ArsenalSocket.ts` (new, 102 lines) | LANE-TOUCHED |
| `e2e/er01-e9-census.spec.ts` (+74/-0) | LANE-TOUCHED |
| `docs/bench/e9-readiness-census.md` (+11/-11 wording) | LANE-TOUCHED |

**No conflicts, no graft, no MAIN-MOVED file.** Merged `--no-ff` three-way in the gate worktree; main was
then fast-forwarded to that exact commit, so **the tree that was gated is byte-identically the tree that
shipped** — no re-merge, no second resolution.

## Findings

**None blocking. No new findings.** The runner reported no in-scope finding and none was manufactured here.

The slice deliberately did **not** wire the socket into `HeadlessContractSim` or add any E9 contract to
`SUPPORTED_CONTRACTS` — the judgement call the master made for it, and the runner obeyed it. Socketing a
system is not admitting a contract.

**The remaining E9 gap, stated plainly:** all four rows still need their **vocabulary derived** (the
manifest exposes only generic `build_zones`); `e9-dome-basin` additionally needs `OldDiggerBossSystem`
socketed; and the three others each keep one honest `missing` signature consumer
(`persistent-planting-consumer`, `scheduled-relocation-consumer`, `persistent-canal-choice-consumer`).
The census's own cure is two acts — *"socket … and derive their vocabulary"* — and this slice did one.
