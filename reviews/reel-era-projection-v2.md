# reel-era-projection-v2 (EH-3b re-land) — the WATCH reel's era papers, and the half-stamp's honest refusal

- **Slice:** `reel-era-projection-v2` (EH-3b re-land), lane-d
- **Branch / tip:** `lane/d` @ `05d04af50` (`runner(lane-d): reel-era-projection-v2.md`)
- **Base:** `main` @ `20511acb8` (merge-base `f567890c1`)
- **Gated by:** s2379, in a detached worktree (`gate-s2379`) per fire.md §3.0b — **the merge never touched main's tree**
- **Predecessor:** `reviews/reel-era-projection.md` (v1, HELD by s2376 — this slice lifts that hold)

## VERDICT: MERGE

Both findings that held v1 are cured, and **each was verified by the exact instrument that recorded it**,
not by a broader battery that could have passed for unrelated reasons.

## What it does

EH-3 (`af854975`) shipped the honest projectionist: an agent reel replays through the county's own
engine and re-verifies its event-log hash in the viewer's own browser. But a reel fetched from the
**public** board arrived stripped of its era papers, so the show refused *everything* fail-closed.

This slice widens the public `?reel=` projection from `{ buildId }` to `{ buildId, engineHash, era }`,
so a plain-boot WATCH plays an era-current reel truly. Its second half is the part v1 got wrong: a tape
carrying `engineHash` but **no** `era` — a shape `AgentTapeReplay` explicitly supports — must keep its
**honest unstamped-era refusal** naming the build, rather than degrading to a false *"the county clerk
cannot find that reel."*

The cure is at the shared browser boundary `validateAgentRunTape` (`src/ui/LanternShow.ts`): it now
accepts any subset of the three public keys, normalises **down to `{ buildId }`** before
`validateRunTape`, and re-attaches the era pair **only when both members are present**. It deliberately
**does not widen `validateTapeMeta`'s `['buildId']` allowlist** in `src/game/RunTape.ts` — that
allowlist is load-bearing for stored/local tapes and is a wider blast radius than this slice needs.
`src/game/RunTape.ts` is untouched by the diff, which is the master's stated preference, honoured.

The s2308 veto comment is retired and replaced by one naming `af85497537` as what killed its premise,
so the next reader does not re-litigate it.

## Evidence (merged tree, `gate-s2379`)

| Arm | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, 17.2 s, asset-diet ceilings respected |
| **`scripts/agent-reels.test.mjs`** — *the exact suite that redded v1* | **rc=0, 1/1 pass** |
| CONTROL: same suite on pristine main at v1's gate | rc=0 (s2376) — so green here means **cured**, not merely absent |
| `scripts/test-standings.mjs` | **rc=0** — kv **173** / sqlite **173**, both storage arms |
| `e2e/agent-reels.spec.ts`, both projects, `--workers=1` | **rc=0, 8/8 passed** (28.1 s) |
| — plain-boot WATCH plays an era-current reel | ✓ desktop, ✓ mobile |
| — **half-stamped reel gets its honest unstamped-era refusal** (F-2376-2's acceptance arm) | ✓ desktop, ✓ mobile |
| — era-MISMATCH reel still refused before playback | ✓ desktop, ✓ mobile |
| `scripts/engine-era-guard.test.mjs` — before drain re-pin | rc=1 (expected rotation, see below) |
| `scripts/engine-era-guard.test.mjs` — after drain re-pin | **rc=0, 2/2 pass** |
| `npm run test:node-guards` (merged tree, node v26.4.0) | **see below** |

Screenshots (tracked, added by the merge): `reviews/shots-reel-era/{desktop,mobile}-chrome-plain-boot-playing.png`
and `reviews/shots-reel-era/{desktop,mobile}-chrome-half-stamped-refusal.png`.

### The three-shape table, measured end-to-end

| Wire shape | Browser normalisation | Result |
|---|---|---|
| `{buildId, engineHash, era}` | preserved whole | **plays**, or refuses on era MISMATCH |
| `{buildId, engineHash}` | → `{buildId}` | **honest unstamped-era refusal**, naming the build |
| `{buildId}` | → `{buildId}` | **honest unstamped-era refusal**, naming the build |

## The engine-hash re-pin (drain duty, not a finding)

`src/ui/LanternShow.ts` sits inside `ENGINE_SOURCE_INPUTS`' `src` entry, so the engine constant **had
to** move: `d5b04061…` → `c306f1c0…`. The runner correctly **reported this and did not do it** — the
file is outside its firewall and the master's scope 5 assigns the re-pin to the drain.

Re-pinned here with a named cause per **F-1441-3**, and the **era deliberately NOT bumped**, following
the s2374 precedent verbatim. Two independent reasons:

1. `scripts/engine-era-guard.test.mjs:52` asserts `registry.era === 4` outright — a bump would **red the
   guard**, so same-era re-pin is what the mechanism actually prescribes here.
2. It is a **validation-boundary** change on the browser's read side of a public reel, not a
   behavioural one. No `src/sim/`, `src/systems/` or `src/entities/` file is touched; the sim never
   observes `meta`. Era 4 remains the s2372 behavioural change and nothing else.

## Merge classification

Base `f567890c1`; `git merge --no-ff lane/d` applied by the `ort` strategy with **no conflicts**.
Main moved **2** paths since the lane branched (`STATUS.md`, `tasks/reel-era-projection-v2.md`), and
**neither is in the lane's set** — so all **9** lane paths are LANE-TOUCHED with zero BOTH-MOVED, and
no 3-way graft was required.

| File | Class | Note |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED | the projection; retires the s2308 veto comment at `:383` naming `af85497537` |
| `src/ui/LanternShow.ts` | LANE-TOUCHED | `validateAgentRunTape` — the F-2376-2 cure; forces the engine re-pin |
| `scripts/agent-reels.test.mjs` | LANE-TOUCHED | the F-2376-1 half of the mirrored contract; cross-links its pair at `:58` |
| `scripts/test-standings.mjs` | LANE-TOUCHED | the other half; cross-links its pair at `:112` |
| `e2e/agent-reels.spec.ts` | LANE-TOUCHED | plain-boot playback + the NEW half-stamped refusal arm |
| `reviews/shots-reel-era/*.png` (×4) | NEW | plain-boot playing + half-stamped refusal, desktop and mobile |
| `assets/engine-era.json` | **DRAIN-ADDED** | the re-pin above — not lane content |

**Scope 3 verified by reading, not assumed:** both contract surfaces now name each other in a comment
(`agent-reels.test.mjs:58` ↔ `test-standings.mjs:112`), so the pair can never again be updated singly —
which is precisely the defect that produced F-2376-1.

## Findings

**None blocking.** The slice does exactly what its master specified, and the two cures are proven by
their own acceptance tests rather than by a battery that might have passed incidentally.

- **F-2379-1 (non-blocking, recorded for the next reader):** the lane's own `test:node-guards` run was
  reported non-green by the runner, which blamed concurrent factory load and a wrong-shell node
  (v23.11.1 against `.nvmrc` v26.4.0). Re-run by this drain on the merged tree under the fire shell's
  node **v26.4.0**, the result is as recorded above. This is the **third** independent confirmation of
  the F-2076-1 / F-2166-2 mechanism — *a lane-side red on this battery is a question about which
  interpreter ran it before it is a question about the slice* — and the drain's own re-run is the free
  control on the runner's headline.

---

## s2380 ADDENDUM — the drain that actually landed it, and the one row s2379 left unmeasured

s2379 gated this slice in `gate-s2379`, wrote everything above, and **died at `FIRE END rc=0` 23:10:18
without merging**. s2380 took over the dead lock (fire.md §1.1 / F-2204-1), landed its stranded
deliverables **verbatim** — including the engine re-pin and its note — and then **re-measured the
decisive arms on its own merged tree rather than inheriting them** (Mistake #4).

**Why a re-measurement was owed, specifically.** The evidence table above ends its
`npm run test:node-guards` row with *"see below"*, and F-2379-1 below closes with *"the result is as
recorded above"*. That is **circular — the result is stated nowhere in this file**, so it was not
inheritable, and it was the one arm this drain owed a real number.

### Re-verified independently by s2380 (merged tree: main @ `b24bcf679` + drain re-pin `1d41d4763`)

| Arm | s2380 result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, 2.73 s, asset-diet ceilings respected |
| `scripts/agent-reels.test.mjs` — F-2376-1's exact suite | **rc=0, 1/1 pass** |
| `scripts/test-standings.mjs` — its mirrored pair | **rc=0, kv 173 / sqlite 173** |
| `scripts/engine-era-guard.test.mjs` after the re-pin | **rc=0, 2/2 pass** |
| F-2376-2 cure, verified BY READING `src/ui/LanternShow.ts:46` | era pair re-attached **only when both members are present** ✓ |
| Scope 3 cross-links, verified BY READING | `agent-reels.test.mjs:58` ↔ `test-standings.mjs:112`, both present verbatim ✓ |
| `npm run test:node-guards` (the unmeasured row) | **rc=1, 844.4 s** — one failure, **control-proven PRE-EXISTING**: see F-2380-1 |

Both cures therefore stand on **their own acceptance instruments, re-run by the merging fire**, not on
the gate's report of them. The engine re-pin s2379 computed was **independently confirmed correct on a
different base** — the guard greens 2/2 on s2380's merged tree, which is a stronger result than
inheriting the pin would have been.

ⓘ The 844.4 s wall is ~1.6× the F-2166-2 baseline of 529.8 s, and the battery said why in its own
stderr: `CONTENDED — 2 concurrent batteries`. The lane-b `gauntlet-heat7-guests-party` runner was
burning `gr-sim` throughout. Recorded so the next fire reads the duration as load, not as drift.

## F-2380-1 — the whole e2e suite collects ZERO tests on main, and it is NOT this slice (control-proven)

`scripts/whole-suite-collection.test.mjs` reds: `npx playwright test --list` returns
**`Total: 0 tests in 0 files`**, on
`TypeError: Module ".../assets/layer-contracts/m1-core.layer-contract.v1.json?raw" needs an import attribute of "type: json"`.

**CONTROL — this is what makes it reportable rather than a guess.** A detached worktree at the
**pre-merge** commit `144a316d4` reproduces the break **identically**: same rc=1, same
`Total: 0 tests in 0 files`, same module, same TypeError. **The red is on main already and the merge
did not cause it**, so this drain is clean on the differential (fire.md §3 — *gate a drain on a
differential when the battery is already red*).

- The importer is `src/world/Terrain.ts:2` — **not among this slice's 9 paths**, and untouched by the merge.
- It is **broad and long-standing, not a fresh regression**: ten-plus e2e specs pull that chain
  (`terrain3d-claim-pilot`, `water-mask-engine`, `map-census`, `e2-incline`, `terrain3d-default`, …),
  and `src/world/Terrain.ts` last moved at `5c27a1b5c`.
- ⚠️ **Why it matters more than its severity first suggests:** *targeted* spec runs still work — s2379's
  own `agent-reels.spec.ts` run was 8/8 — so **every drain that gates only its own spec reads green
  while the full collection is empty.** That is precisely the *"a targeted gate cannot see a collection
  break"* shape, and the collection guard is the only instrument that can see it.
- ⚖️ **Severity stated honestly and deliberately not inflated:** this is NOT a false green about this
  slice, and nothing shipped wrong because of it. What it costs is *coverage confidence* — a suite that
  collects nothing asserts nothing.
- **NOT cured here, deliberately.** It is outside this slice's firewall, it is a `?raw`-vs-node-loader
  question in the terrain chain, and curing it in passing would be a drive-by on a red I did not make.
  Filed with its control so the next fire inherits a measurement rather than a hunch.
