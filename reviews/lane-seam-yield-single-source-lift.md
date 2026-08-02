# Review — lane-seam-yield-single-source-lift (lane-a)

**Slice:** Dry Gulch seam yield — the contract twist becomes the only source
**Branch:** `lane/m3` · **Tip:** `4911e0c5` (lift) on `9ef521e5` (the original two deletions)
**Base:** `5fb63bdb` · **Drained:** s1380 fire, 2026-08-02
**VERDICT: MERGE** — tsc clean, build green, Dry Gulch 6/6 desktop + 6/6 mobile, adjacent town board 12/12, zero survivors.

## What it does

`Balance.contracts.dryGulch.seamYieldMult` was a second source of truth for the Dry Gulch seam yield:
the browser read it through an id-keyed special case in `Game.ts`, while the headless sim read
`twist.seamYieldMult`. Two sources that agreed only by luck. This slice deletes both the special case
and the duplicate constant, leaving `activeContract.twist.seamYieldMult` as the single source, and
re-points the e2e canary to that same source.

**Behaviour is unchanged, and that is verified rather than asserted:** the `e1-dry-gulch` twist
declares `"seamYieldMult": 1.4` at `assets/contracts/epoch-1-frontier/contracts.json` — the same 1.4
the deleted constant held — and `Math.max(0.1, 1.4)` is a no-op, so both branches of the removed
conditional returned the identical number. Browser (`Game.ts:589` → ContractFamilies) and headless
(`HeadlessContractSim.ts:121` `loadContract`) resolve from the same JSON bundle.

## History — this is the re-authored second attempt, and the first one was right to fail

The predecessor master was **unachievable as written** (F-1380-1): its SCOPE named the dry-gulch e2e
suite as its proof while its TOUCH-ONLY forbade touching it — and that spec was itself the third
reader of the field being deleted, so the deletion failed `tsc` with TS2339 before any suite could
run. Codex stopped, said exactly why, and explicitly declined the tempting wrong fix ("do not hide
the failure with a compatibility field because that would preserve the second source the task is
removing"). This master lifted the firewall by exactly one file and instructed the run to **build on
`9ef521e5` rather than re-derive it**, so the 104,543 tokens the first attempt spent were not
re-spent.

## Merge classification

| Bucket | Count |
|---|---|
| LANE-TOUCHED | **3** (`e2e/e1-dry-gulch.spec.ts`, `src/game/Balance.ts`, `src/game/Game.ts`) |
| MAIN-MOVED / BOTH-MOVED | **0** |

All **3/3** landed paths verified **blob-identical** to `lane/m3`. Gated in the detached scratch
worktree (§3.0b custody), synced to current main — including this fire's own lane-c merge — before
the slice was laid on top; no undecided content entered main's tree.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0, clean** |
| `npm run build` | **rc=0**, built in 1.16s |
| `e2e/e1-dry-gulch.spec.ts` | **6/6 desktop, 6/6 mobile** |
| `e2e/town-t3-board.spec.ts` (adjacent — reads `contract.seamYieldMult` at `:150`) | **12/12**, unmodified-green |
| `git grep contracts.dryGulch` on the merged content | **zero survivors** |
| Headless determinism | `fnv1a32:3d75c580`, unchanged |

### The one red, and why it is not the slice's

The first batched run (24 tests across two specs) showed **1 failure**:
`e1-dry-gulch.spec.ts:79` *"loads Dry Gulch via debug param and suppresses bad contract fallback to
diagnostics"*, **desktop only — the identical test passed on mobile in the same run.** An isolated
red is n=1, so it was re-run in isolation twice: **6 passed (33.1s)** and **6 passed (34.2s)**. The
run report independently records 12/12. Verdict: a contention flake in the batched run, not a slice
red. Recorded here rather than omitted, because a green that replaces a red should say which
instrument it replaced it with.

### The headless control is honest about its own blindness

The run reports `fnv1a32:3d75c580` unchanged — and correctly labels it *"a no-regression control
only, not browser-path proof."* That caveat was written into the master deliberately, because
`HeadlessContractSim` read `twist.seamYieldMult` **before** this change and still does after: it
never executed the deleted line, so its hash could not have moved whatever the slice did. **A control
that cannot fail is not evidence.** The dry-gulch e2e is the only instrument that reads the changed
path, which is precisely why the firewall lift was required rather than optional.

## Findings

None blocking. The slice does exactly what it says, its firewall matches its evidence, and the
single-source claim is grep-proven on the merged content.
