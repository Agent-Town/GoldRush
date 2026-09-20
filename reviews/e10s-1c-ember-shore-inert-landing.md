# Review — e10s-1c: the Ember Shore lands INERT (with its predecessor e10s-1b)

**Slice:** `e10s-1c-ember-shore-inert-landing` + predecessor `e10s-1b-ember-shore-schema-and-data`
**Branch / tip:** `lane/a` @ `d08cfe31b` (two commits: `91dd6dd9d` e10s-1b, `d08cfe31b` e10s-1c)
**Merge-base:** `cbb0a02cb` · **Base main:** `e8edbbaac` · **Merge commit:** `22d0e1cc7`
**Gated in:** detached `gate-s2258` worktree (§3.0b — undecided content never entered main's tree)
**Drained by:** s2258 fire, 2026-08-24
**VERDICT: MERGED — with one defect found and resolved in the merge (F-2258-1, veto window open).**

## What it does

The Ember Shore's twist **schema** and its **data** land together, and the map stays **out of play**.
`e10s-1b` authored the schema (`emberShore` into `AUTHORED_TWIST_KEYS`, `twist.emberShore` into
`DECLARED_INERT_PATHS`, a `tileParams.engineDependencies` entry, the mask geometry, the census
dependency pin, the squall-sign settlement) **plus the admission payload** — four `harvestAnchors`,
two `benchSeeds`, two null-floor rows. s2165 proved that payload IS the admission mechanism: merged
as authored it turned the door guards from 6 pass/0 fail into 3 pass/3 fail.

`e10s-1c` is the attended pick among s2165's three lift options — option (a), the **e6-picnic
precedent**: the data lands with the anchors emptied, and the E10S-4 door slice earns admission
later on prover evidence. The removed payload is parked **verbatim** on the `e10s-4-ember-shore-door`
leaf (`parkedPayload_e10s1c`) so the door slice re-lands it unchanged.

**Where does the PLAYER see this in a plain boot?** *Nowhere — deliberately, and that is the whole
point.* This is the one merge whose success criterion is player-invisibility. It is provable rather
than asserted: contract `tileParams.harvestAnchors` `[]`, published `maskTruth.harvestAnchors` `[]`,
no `benchSeeds`, zero ember-shore null-floor rows, zero `secured:true` anywhere, and both door
guards green. No boot probe was run and none is owed: the merged bundle's only `src/` change is two
allowlist strings in `ContractFamilies.ts`, and admission is what a boot would have shown.

## Evidence

All figures measured on the **merged tree** in `gate-s2258`, playwright at `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 6.0 s |
| `npm run build` | **rc=0**, 31.4 s |
| **`skillmd-guard` + `door-admission-ratchet`** | **6 pass / 0 fail**, 3.0 s — *the lift condition* |
| `e3-mask-tables.test.mjs` | **30 pass / 0 fail** (clean-main control: 30/0) |
| `bench-seeds` + `null-floor-anchors` | **3 pass / 0 fail** |
| `null-floor-anchors.mjs` regen | **rc=0**, wrote **79** floors, 234.9 s |
| `null-floor-anchors.mjs --check` | **rc=0**, 79 match, 285.2 s |
| floors content vs main | **0 keys added, 0 removed, 0 rows differing** — only `eraStamp` moved |
| `er01-e10-census.spec.ts` desktop+mobile | 8 failed, line tally **`{28:24, 59:8}`** |
| ↳ clean-main **control** (my own, not inherited) | 8 failed, **`{28:24, 59:8}`** — *identical* |
| `npm run test:node-guards` (run ALONE) | **540 tests / 533 pass / 2 fail / 5 skipped**, 574.8 s |

**The decisive number.** s2165's control on the *admitting* tree was **3 pass / 3 fail**, against
**6 pass / 0 fail** on clean main. This merged tree reads **6 pass / 0 fail**. The guard suite is not
vacuous: it carries its own positive control (*"the guard BITES a drifted skill.md, manufactured
defect"*), which passed. The lift condition recorded on the `e10s-1b` leaf — *"the corrective's
merge is the lift"* — is **satisfied by measurement**.

**Both remaining node-guard reds are pre-existing**, fingerprint-matched by running the same two
files in a clean-main control worktree, not inherited from any prior report:

| Leg | merged tree | clean-main control | verdict |
|---|---|---|---|
| `blocker-panel-closed-guard` *"reds on the pre-strike ledger…"* | 5 pass / 1 fail | **5 pass / 1 fail** | pre-existing |
| `fixture-teardown` *"all 70 fixture owners remove temp dirs"* | 0 pass / 1 fail | **0 pass / 1 fail** | pre-existing |
| `e3-mask-tables` *"published mask tables track authored data"* | 30 / 0 **after graft** | 30 / 0 | **was mine — see F-2258-1** |

The census `:59` red (`mechanics.buildables` expected undefined) fires for **all four** e10 contracts
including three this slice never touches, on main and on the merged tree alike — it is the existing
Deep Sky buildables debt, fingerprinted **by line** exactly as s2165 instructed. The `:46` ember-shore
red that s2165 recorded (`benchSeeds expected undefined`) is **gone**: that is the corrective working.

## Merge classification

Base `cbb0a02cb`; main moved **999** files under the lane in that window.

| File | Class | Resolution |
|---|---|---|
| `epoch-10-deepsky/contracts.json` | LANE-ONLY | taken as authored (+48/−1) |
| `mask-tables/e10-ember-shore.json` | LANE-ONLY | **grafted to main's inert value** (F-2258-1) → byte-identical to main |
| `e2e/er01-e10-census.spec.ts` | LANE-ONLY | taken as authored (engine-dependency pin) |
| `assets/contracts/null-floors.json` | BOTH-MOVED | **conflict** (eraStamp) → resolved by **regeneration** on the merged tree, `--check` rc=0 |
| `scripts/e3-mask-tables.test.mjs` | BOTH-MOVED | auto-merged; ember-shore anchors hunk **grafted to main's value** (F-2258-1) → byte-identical to main |
| `src/meta/ContractFamilies.ts` | BOTH-MOVED | auto-merged, **both sides kept** — verified `emberShore` sits alongside main's `scheduledRelocation` / `persistentCanalChoices` |
| `tasks/BACKLOG.md` | BOTH-MOVED | auto-merged |
| `tasks/goals.json` | BOTH-MOVED | **conflict** → hand-spliced, never re-serialized |

**The goals.json splice was verified against both parents, not eyeballed.** Resolved tree carries
**940** leaves = main's 940 (lane's 896 are a subset); **0** ids from main missing, **0** from the lane
missing; `parkedPayload_e10s1c` intact. My *first* splice parsed as valid JSON and had silently
**dropped the `e10s-4` leaf's identity fields** by skipping the common region between the two conflict
hunks — caught only by the id-level check, never by `JSON.parse`. *A ledger splice that parses is not
a ledger splice that is correct.*

**The merged tree was proven byte-identical to the gated tree** across all 8 paths before the merge
commit was created, so this evidence describes exactly what landed.

## Findings

### F-2258-1 — the master was not satisfiable as written; three surfaces carry one fact (RESOLVED IN THE MERGE, veto window open)

`e3-mask-tables.test.mjs:248` asserts `published.maskTruth[key]` deep-equals `authored.tileParams[key]`.
The `harvestAnchors` fact therefore lives on **three** surfaces: the authored contract, the published
mask table, and a dedicated pin at `:399`. Main holds all three inert (`[]`, `[]`, `[]`). The
predecessor set all three to the four anchors — self-consistent, and admitting.

The corrective's **scope 1** emptied the contract, while **scope 4** said *"keep untouched from the
predecessor: the mask table"* and the **TOUCH-ONLY firewall omitted the mask table entirely**. Under
that firewall the slice **cannot** be internally consistent, and its self-check never named
`e3-mask-tables.test.mjs`, so the runner never ran the guard its own firewall broke. The runner
obeyed its contract correctly; the master was contradictory.

Measured, not assumed: the merged tree failed `e3-mask-tables` (29/1, `e10-ember-shore.harvestAnchors`
actual = four anchors, expected = `[]`) while clean main passed 30/0.

**Resolution.** Both extra surfaces were grafted to **main's own inert value** — the same three-way
graft decision as any BOTH-MOVED hunk where the lane's value was authored for a state we are
explicitly not landing. Both files are now **byte-identical to main**, which also shows the
predecessor's entire mask-table contribution *was* the admission payload. `e3-mask-tables` returns to
30/0. This is reversible: `git revert 22d0e1cc7`, or re-land the anchors from `parkedPayload_e10s1c`.

**For the E10S-4 door slice:** admission must re-land **three** surfaces, not one — the contract's
`tileParams.harvestAnchors`, the published `maskTruth.harvestAnchors`, and the `:399` pin — plus the
bench seeds and the floor rows. The parked payload holds the anchors and seeds verbatim.

**The reusable half.** A corrective that *empties* authored data must also empty every **published
projection** of it, and must name the guard that couples them in its self-check. A firewall drawn
around the authored file alone will look obeyed and still red — and the runner will not find out,
because the guard is not in the list it was told to run.

### F-2258-2 — non-blocking, no corrective: two node-guard legs are red on clean main

`blocker-panel-closed-guard` (*"reds on the pre-strike ledger…"*) and `fixture-teardown` (*"all 70
fixture owners…"*) both fail on clean main, verified in a control worktree this fire. Untouched by
this slice and not this drain's to cure — recorded so the next drain fingerprints them rather than
re-deriving them, and so neither is mistaken for a regression from this merge.
