# lane-f1508-1-e1-contracts-stale-broadcast — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## READ FIRST (paths, not memory)
- `e2e/072-era-activation.spec.ts:23` — the subject: `const E1_CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'];` — a **pasted** list of five.
- `e2e/072-era-activation.spec.ts:226-241` — the failing test, `fresh E1 profile stays unchanged and the pre-flip determinism hash is identical`, whose `expect(...).toEqual(E1_CONTRACTS)` is the red.
- `assets/contracts/epoch-1-frontier/contracts.json` — the manifest. It lists **six** ids, in order: `the-claim`, `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`.
- `e2e/drill-yard.spec.ts:80-100` ("plain boot keeps the Drill Yard visible and launchable on both sides of the welcome", the test opening at `:68`) — the sibling spec. It boots **fresh** (`page.goto('/')`, no `?replay=`) and asserts the Drill Yard card **is visible**, carries `data-training-ground="true"`, and is **NOT** inside the `contract-chapter-epoch-1-frontier` chapter.
- `reviews/f1504-1-drill-yard-stale-absence.md` — the shipped precedent for **exactly this class** of cure, merged `9559633aa136abb8c91b3293d4d1198ffc128172`.
- `logs/suite-red-inventory.md:577` — the inventory's provenance block. **Read the date.**

## WHY (evidence, measured s1508 on `80c79324c`, all `--workers=1` per §3.1)

`npx playwright test e2e/072-era-activation.spec.ts --workers=1 --project=desktop-chrome` → **1 failed / 4 passed**:

```
- Expected  - 0
+ Received  + 1
  Array [
    "the-claim",
+   "e1-drill-yard",
    "e1-dry-gulch", "e1-night-shift", "e1-twin-banks", "e1-baron",
  ]
```

⚠️ **THIS IS NOT A REGRESSION, AND THAT FINDING OVERTURNS HALF OF F-1507-2.** F-1507-2 (s1507) recorded this
line as `CLEAN-IN-INVENTORY and therefore NOT excused`, inferred *"a red today is a bisectable regression"*,
and REC'd a bisect in the f1506-2 shape. The inference does not hold here, because **the exoneration ledger
has a date and the verdict does not carry it**:

| Fact | Value | Measured by |
|---|---|---|
| Inventory snapshot date | **2026-07-29** | `logs/suite-red-inventory.md:577` |
| `e1-drill-yard` added to the manifest | **2026-08-01**, `f0bf5251b` (`runner(lane-b): lane-drill-yard.md`) | `git log -S` on the manifest |
| Last change to `listContracts()` | **2026-07-07**, `d56804ae3` | `git log -S"listContracts" -- src/meta/ContractFamilies.ts` |

⇒ The registry code has not moved in a month; the manifest legitimately grew a sixth contract three days
**after** the inventory ran. So `CLEAN-IN-INVENTORY` is **correct and unhelpful**: it means *green on
2026-07-29*, and the spec went stale on **2026-08-01**. The registry is right. **The pasted list is the
defect** — the "broadcast an expected value your merge changes" class, and `f0bf5251b` did not update it.

✅ **Therefore editing this spec is the CURE, not laundering** — and unlike the f1506-2 case, no bisect is
owed: the first-bad commit is already named above by `git log -S`, and its change was intended and shipped.

## SCOPE (each item testable)

1. **Re-validate the premise before changing anything.** Run the spec at the lane head and confirm
   **1 failed / 4 passed** on `desktop-chrome`, with the received array containing exactly the six ids above.
   If the tally or the array differs, **STOP and report** — the window moved and the rest of this task is void.

2. **Replace the pasted list with a derived one.** `E1_CONTRACTS` must come from the epoch-1 manifest
   (the `loadEpoch('epoch-1-frontier')` route `e2e/drill-yard.spec.ts` already uses — reuse that helper,
   do not invent a second loader). Preserve manifest **order**; the assertion is `toEqual`, which is
   order-sensitive, and the received array shows the registry preserves manifest order.

3. **Prove the assertion is still load-bearing — this is the point of the task, not a formality.**
   Deriving both sides from the same manifest would be worthless if the test's invariant were *"the manifest
   has these ids"*. It is not: the invariant is **"a fresh, pre-flip profile sees the E1 contracts and NOTHING
   FROM A LATER EPOCH"**. Manufacture that defect and show the test still catches it (the s1299/s1300
   standard): temporarily make the pre-flip listing include a later-epoch contract id, run the test, paste the
   **rc, the failing assertion and its expected-vs-received**, then revert byte-identically and show the
   revert (`git diff` empty). A green alone is not evidence here.

4. **Report the adjacent denominator you actually ran.** At minimum `e2e/072-era-activation.spec.ts` (both
   projects) and `e2e/drill-yard.spec.ts` (both projects). Give raw tallies, not adjectives.

## FIREWALL
**TOUCH-ONLY:** `e2e/072-era-activation.spec.ts`.
**NO:**
- ❌ **Never edit `assets/contracts/epoch-1-frontier/contracts.json`.** The manifest is the source of truth and
  is correct. Deleting `e1-drill-yard` to make the old list pass would delete a shipped, player-visible contract.
- ❌ **Never touch `src/`.** `listContracts()` is not the defect — it has not changed since 2026-07-07.
- ❌ **Never touch `logs/suite-red-inventory.md` or `logs/suite-red-inventory-compact.json`.** Refreshing the
  ledger here would write a *stale broadcast* into it as an accepted known-red and destroy the dated evidence
  this task's WHY depends on.
- ❌ Do not "fix" the other red in this family (`e2e/landmark-collision.spec.ts:68` — "enemy blocker routing is deterministic and goes around a county landmark"). It is a **genuine**
  unexplained regression and is a separate slice — see the handoff. Report it if you see it; do not touch it.
- ❌ Do not delete or weaken the `toEqual` into a `toContain`/subset check. That would drop the leakage
  invariant scope 3 exists to protect.

## SELF-CHECK (name the exact commands and paste raw output)
- `npx tsc --noEmit` → clean.
- `npm run build` → green.
- `npx playwright test e2e/072-era-activation.spec.ts --workers=1` → **10 passed** expected
  (5 tests × 2 projects, one of which skips on mobile → report the real tally, do not round it).
- `npx playwright test e2e/drill-yard.spec.ts --workers=1` → unchanged from its pre-edit tally.
- Zero console/page errors in the runs above.
- Scope 3's manufactured-defect output pasted in full, plus proof of the byte-identical revert.

**READY-FOR-GATES** + report: the diff, the four tallies above, the scope-3 probe (rc + assertion +
expected/received + revert proof), and whether the derived list required a new import.
