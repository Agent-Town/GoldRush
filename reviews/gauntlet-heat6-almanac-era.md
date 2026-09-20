# gauntlet-heat6-almanac-era — drain review (s2296)

- **Slice:** `gauntlet-heat6-almanac-era` (HEAT 6, the first commons-armed heat)
- **Branch / tip:** `lane/c` @ `920a590f6 (archive: pruned by the A3 rewrite)` (`runner(lane-c): gauntlet-heat6-almanac-era.md`)
- **Merge-base:** `90bb8376f`
- **Merged to main at:** `ecb70b45718e2084d4aa4322ad2b75cc911813f8 (archive: pruned by the A3 rewrite)`
- **Verdict:** ✅ **MERGE — a lawful STOP with complete evidence.** The runner did not
  deliver the heat, and that is the correct outcome: its master's binding rule is
  `skew -> STOP`, the mandatory early probe came back `unassayable: engine-skew`, and the
  runner stopped before its Baron program rather than minting rows the live assayer cannot
  verify. This is a firewall success (the memory's own rule: a runner that REPORTS a defect
  instead of working around it is the outcome the contract is for), not a Silent No-Op —
  Mistake #1 is answered because the run wrote *why* it changed nothing, with the slip quoted.

## What it does

Banks the complete evidence chain of an aborted heat. The rider built and rode the live
advertised build (`5109241a8`, `version.json` built 2026-08-25T02:40:00Z) from a detached
worktree, secured `the-claim` on `e1-the-claim-01` locally at wave 10 / 45 gold, and
submitted from the canonical origin. The submission was **accepted as rank 5 but not
verified**: the live assayer removed it from ranking with `assay:"unassayable"`,
`ranked:false`, `assayReason:"engine-skew"`. The slice retains the tape, the submission, the
POST response and headers, the verdict slip, and an `almanac-patch.md` that deliberately
proposes **no strategy-standing change** — only a door-history note. That restraint is
correct and worth naming: no dead gameplay hypothesis was created, because the failure was
infrastructure identity, not play.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | ✅ CLEAR — `status="queued"`, no block of any class |
| Merge strategy | `ort`, **zero conflicts** |
| Merge classification | **10 files, ALL LANE-ONLY** · 0 MAIN-MOVED · 0 BOTH-MOVED · 0 DUPLICATE (`lane-freeze-classify`, `paths=10`) |
| `npx tsc --noEmit` | **rc=0** (merged tree, detached `.gate-s2296`) |
| `npm run build` | **green, 1.69 s**; asset-diet respected (herald 1,158,214 B of a 1,500,000 B ceiling) |
| Run-surface delta | **ZERO** — `git diff --name-only main HEAD -- src e2e functions scripts public index.html package.json package-lock.json vite.config.ts playwright.config.ts tsconfig.json` returns empty |
| ↳ control for that empty (F-2215-1) | same command shape, same cwd, `-- artifacts` returns **10 paths** — so the empty result is a measurement, not a narrowed corpus |
| F-1460-1 (`test:node-guards`) | **does not fire** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` |
| Adjacent suites | none — the slice adds no code and no spec; the merged tree's runtime is byte-identical to main's, which the run-surface row proves directly |

Gated in a **detached worktree** per §3.0b — undecided content never entered main's working
tree — and merged onto main as one act (no staged merge left on main, per F-1589-5).

## Findings

### F-2296-1 — the live assayer's engine identity matches no recent main tree, so the county cannot verify ANY submission (BLOCKING for the gauntlet program; filed, not fixed here)

Both HEAT 6 slices stopped at this one gate, so it is one finding, not two. The runners
reported it correctly and neither could act on it — the assayer is deployed infrastructure,
outside every lane's firewall.

**Measured by me, not inherited** (`computeEngineHash` from `scripts/assay-replay-agent.mjs`
run against materialised worktrees, 11 source inputs each):

| Tree | Engine hash |
|---|---|
| `5109241a8` — the **live advertised build** | `d48987df2d50c643e854a2bf8a23b7f34b81c3de1cfd2e54999129b5660f7494` |
| `ecb70b457 (archive: pruned by the A3 rewrite)` — **main HEAD** after this merge | `d48987df…` (identical — no engine input has moved since the deploy) |
| The **tape** the rider submitted | `d48987df…` |
| The **live assayer** (per its own slip) | `0be37691327931e7a3230f10fa5f65105cfc4b69af13845f84e05dfb281f3b0a` |

**So the tape is honest and the assayer is the divergent side.** The rider really did ride
the build the county advertises; its hash reproduces exactly from that commit's tree. The
assayer's hash reproduces from **none** of the recent main trees I tested — `0cceb7d13`
(`587001a9…`), `0b8e8d378` (`d6cebb3a…`), `22d0e1cc7` (`360cdf56…`), `241ba0301`
(`32c798bb…`) — so it is not merely one merge behind; it is on a tree not identified.

**Severity, stated honestly and not inflated.** The direction is **conservative**: the
assayer *refuses* rather than ranking something it cannot reproduce, so nothing false has
entered the standings and no player was credited wrongly. What earns a blocking finding is
that the refusal is **total and silent to the rider until after the ride** — every
submission from the advertised build is unassayable, which stops the gauntlet program, the
Baron admission evidence, and the announcement-week standings the desk is waiting on.

**Not fixed in this drain, deliberately.** The cure is a deployment act on the droplet
(re-deploy or re-point the assay worker at the tree the game advertises), it spends the
owner's infrastructure, and §7.3 routes external-service and deployment decisions to the
owner. Raised to the desk with a recommendation rather than actioned.

**One caution for whoever cures it:** the fix is *not* "re-pin the expected hash." The skew
check is doing its job; re-pinning would make the instrument agree with a tree nobody has
identified, which is the re-pin reflex F-1441-3 forbids. Identify the assayer's tree first.

### Non-blocking

- The `almanac-patch.md` is a **proposal**, not applied canon (§9b: uncited lore is a
  proposal). It correctly asks for a door-history note only. Attended curation owed; no
  standings were touched by this merge.
- `build-submission.mjs` lands under `artifacts/`, not `scripts/`, so it does not enter the
  `lane-usable` run surface and cannot degrade a lane's drift reading (F-1665-1's hazard is
  avoided here by placement, which is correct).
