# Review — cp04-launch-clear-observability (CP-04 staged-launch clear instrument)

**Slice:** `tasks/lane-b-cp04-launch-clear-observability.md` (authored s1186, `1a836c08`)
**Branch:** `lane/m4` · **Tip:** `db322ee2` · **Base:** `0b03545a`
**Drained:** s1188 fire, 2026-07-29
**Verdict:** ✅ **ACCEPTED.** Discharges **F-1180-4**. Observe-only; **no cure attempted**, which was
the firewall's whole point.

## What it does

`reverifyStagedContractLaunch()` used to collapse two distinct failure reasons — *the staged contract
does not exist* and *it exists but is locked* — into one unconditional `clearPlayerContractLaunch()`
that recorded neither, and that clear also removes `CHARTER_LAUNCH_KEY`, so **the player's charter
document was collateral damage of an unlock check that has no idea charters exist**. This slice adds a
`stagedLaunchClear` diagnostic (`reason` + `charterDocumentPresent`) reported through
`ThreeGameDiagnostics.contract`, plus an e2e that proves the charter document is **present at the
clear and `null` after it**. It ships an **instrument, not a fix**: F-1180-3 blocks the cure pending
owner fork **F-1179-4**, so the owner now gets to decide that fork on evidence rather than on the
three-fire argument in the ledger.

## Evidence — re-derived on the merged tree by me, not read from the runner's table

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | ✅ CLEAR (`status="queued"`) — run **first**, per §3.0 |
| `npx tsc --noEmit` | clean, exit 0 |
| `npm run build` | green, **1.58 s**; herald spot cuts 281 444 B (unchanged) |
| **`cp04-lever.spec.ts`, both projects, `--workers=1`** | **16 failed / 10 passed (10.2 m)** |
| — pre-existing population | **UNCHANGED at 16 failed / 8 passed** ✅ |
| — additive diagnostics | **+2 passed** |
| `node --test scripts/*.test.mjs` | **61/61, fail 0** incl. `whole-suite-collection`, `goal-tracker` |

### The gate this drain actually turned on

s1186 and s1187 both pre-declared the reject condition: *the pre-existing `cp04-lever` split must
still read **16 failed / 8 passed** — if it **improved**, the runner picked a cure it was barred from
picking, and that is a **REJECT even though it looks like progress**.*

**It did not improve.** All 16 failures are **pre-existing test titles**:

- `:61` *"the Lever is three choices and one press, then launches through the charter seam"* — both projects (2)
- `:162` *"seeded boot …/… starts clean"* — the **seven non-`the-claim`** land/story/visitor combinations, both projects (14)

That is exactly F-1178-1's measured split: the two `the-claim` boots stay green, all seven others stay
red. **Neither new assertion appears in the failed list**, and `'a plain boot remains inert'` passed
*with* its added `stagedLaunchClear === null` check — so the +2 comes entirely from new coverage.

## Firewall verification — read at source, not accepted from the report

**Behavioural equivalence proved by reading the branch, which is the only thing standing between this
instrument and an accidental cure:**

```ts
// before:  if (!contract || !contractUnlockStatus(contract).unlocked) clearPlayerContractLaunch();
// after:   reason = !contract ? 'staged-contract-missing'
//                 : unlocked  ? null
//                 : 'staged-contract-locked';
//          if (!reason) return;  … clearPlayerContractLaunch();
```

`reason` is non-null **exactly** when `!contract || !unlocked` ⇒ the clear fires on precisely the same
condition as before. ✅

- `fallbackReason`'s three-value union **untouched**; `stagedLaunchClear` added as a **sibling** field. ✅
- `e2e/cp04-lever.spec.ts`: **30 insertions, 0 deletions** — no existing assertion weakened, loosened,
  reordered or skipped. ✅
- No unlock state seeded, no charter key preserved, no `startGame()` reordering. ✅
- `stagedCharterLaunchPresent()` is a pure `sessionStorage` read; `recordStagedContractLaunchClear()`
  writes diagnostics state only ⇒ **zero gameplay behaviour change**. ✅

## Merge classification

Base `0b03545a`. Four code files + one run report, all **LANE-TOUCHED only** — `git diff` of each path
between the base and current main is empty, so no file MAIN-MOVED and no 3-way graft was needed.
Grafted with `git checkout lane/m4 -- <5 paths>`; path-scoped add.

## Where does the PLAYER see this?

Nowhere — and deliberately. The field is a `__THREE_GAME_DIAGNOSTICS__` read; no UI, no behaviour
change. The *player-visible* consequence (a charter document silently wiped when a staged contract is
locked) is now **measurable but still unfixed**, pending the owner's F-1179-4 ruling.

## Findings

### F-1188-3 — `stagedLaunchClear` is reset only inside `reverifyStagedContractLaunch()`. 🔻 non-blocking

`stagePlayerContractLaunch()` and `clearCharterLaunch()` both null `activeSelection` but leave the
module-level `stagedLaunchClear` standing; only `reverifyStagedContractLaunch()` resets it (at entry).
A diagnostic read taken after a re-stage but before the next re-verify could therefore report a stale
reason. **Zero exposure today** — every observed path calls re-verify first, the field is observe-only,
and both new assertions pass — so this is a note for whoever lands the actual cure, not a defect to
fix now. Do not "tidy" it while F-1179-4 is open: the cure will rewrite this function anyway.
