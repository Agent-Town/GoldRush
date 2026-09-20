# f1504-1-drill-yard-stale-absence — the corrective for a red the previous merge shipped on purpose

- **Slice:** `lane-f1504-1-drill-yard-stale-absence.md` (authored + dispatched s1504)
- **Branch / tip:** `lane/a` @ `7cf4c3b4d (archive: pruned by the A3 rewrite)` (runner commit over Codex's `81242c9ec`)
- **Merge base:** `4401efc37` · **Merged to main:** `042fcdd4a26e1a01bd4a5b18933d5b61c9297cb3` (`--no-ff`, three-way)
- **Drained by:** s1505 fire, 2026-08-07 — second drain of the fire
- **§3.0 block-check:** ✅ CLEAR — a real leaf, `status:"queued"`

## VERDICT: **MERGED** — and the assertion was proved load-bearing by manufacturing the defect, not by reading a green.

## What it does

s1504 merged `f1501-1` (`ced0fc61b`), which made the Drill Yard card render its own briefing. That merge
**correctly** reddened `e2e/drill-yard.spec.ts:92`, which asserted the briefing had count **0** — the line
pinned the card to its pre-AP-11 shape. `f1501-1`'s firewall forbade `e2e/**` in its own words (*"a green
bought by editing the assertion is the one outcome this task counts as a failure"*), so the runner reported
the line and stopped. This slice is that owed corrective.

The cure is an **inversion, not a deletion** — four net lines in one spec:

```ts
const DRILL_YARD_RULES = loadEpoch('epoch-1-frontier').contracts.find(({ id }) => id === 'e1-drill-yard')!.briefing.rules;
...
const briefing = page.getByTestId('contract-board-briefing-e1-drill-yard');
await expect(briefing).toHaveCount(1);
for (const rule of DRILL_YARD_RULES) await expect(briefing).toContainText(rule);
```

⭐ The rules are **derived from `loadEpoch`**, not pasted. That matters because the wording is owner-flagged
(F-1432-4 / F-1501-4, *"straw mans"*): a pasted copy would have to be edited again the moment the prose is
fixed, and would silently assert the *old* words. Derived, the test follows the manifest wherever it goes.

## Evidence (all on the MERGED tree, in the detached `gate-s1505` worktree per §3.0b; every playwright command `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.08 s** |
| Own spec `e2e/drill-yard.spec.ts` | **4 passed** (2 tests × 2 projects) |
| **Load-bearing probe, re-run by the drain** | **fails exactly as required — see below** |
| Adjacent, re-derived from the tree — **11 specs** | **106 passed / 0 failed**, 5.7 m |
| `npm run test:node-guards` | **not triggered** — the merge touches **zero `src/` bytes** (F-1460-1 keys on `src/sim`, `src/systems`, `src/entities`) |

**The expected count was DERIVED, not inherited:** `grep -c '^test(' e2e/drill-yard.spec.ts` → **2**, × 2
projects = **4**. Measured 4.

### The load-bearing probe — the whole reason this drain is not just a green

s1504's handoff required it in as many words: *"require the load-bearing probe in its report — a green alone
does not prove the inverted assertion works."* The runner did report one. **It was re-run here rather than
accepted**, per the s1299/s1301 standard that a passing guard never executes its violation path.

1. Recorded `src/town/TownScene.ts` blob **`496a2fec557c13d7e2522bb13a75bdf52b89199b`** — which
   independently confirms the runner's own restoration claim, quoted to the same 8 characters.
2. Emptied line `:2302`, `${renderContractBriefing(contract)}` — f1501-1's line, inside `renderTrainingGround()`.
3. Re-ran the spec: **`expect(locator).toHaveCount(expected) failed · Expected: 1 · Received: 0`** on
   **both** desktop-chrome and mobile-chrome, and **only** the `:68` test — the sibling test stayed green,
   so the assertion is specific as well as load-bearing.
4. Restored with `git checkout -- src/town/TownScene.ts`; blob re-hashed to
   **`496a2fec557c13d7e2522bb13a75bdf52b89199b`** — **byte-identical**, `git status src` clean.

ⓘ Note the second call site: `renderContractBriefing(contract)` appears **twice** (`:2253` the ordinary card
path, `:2302` the training card). The probe deliberately removed **only `:2302`**, which is why the failure
is attributable to the training-ground path rather than to briefings in general.

### The adjacent list was perishable, and re-deriving it quadrupled it

The runner named **4** adjacent specs (agent-view, contract-briefings, drill-yard-manifest,
drill-yard-station-art). `grep -rln 'drill-yard\|training-ground\|contract-board-briefing' e2e` returns
**12**. All 11 non-own specs were run: **106 passed, 0 failed.** This is the same law that caught s1503
(a review's adjacent-suite list is perishable) — the runner's list was not wrong when written, it was
narrower than the tree.

🧪 **A note the next fire can spend:** `e2e/contract-briefings.spec.ts:318` (“every current contract launch shows manifest briefing goals and rules”) was flagged by s1504 as
**noise** — one desktop failure under load, then 20/2 on a byte-identical re-run and 14/14 alone. It is
**green here too**, in a suite of 106. That is a fourth measurement and a third green; treat a single red
on that line as load, not as a defect.

## Merge classification

| Path | Class |
|---|---|
| `e2e/drill-yard.spec.ts` (+4/-1) | LANE-TOUCHED |
| 26 × `artifacts/**` PNG (`drill-yard-affordances`, `drill-yard-props`, `survive-copy`) | LANE-TOUCHED — **factory churn, committed by design** |

**No conflicts, no graft.** Merged `--no-ff` three-way in the gate worktree, then main fast-forwarded to
that exact commit — the tree that was gated is byte-identically the tree that shipped.

⚠️ **One custody note worth recording, because it nearly read as a conflict.** The fast-forward first
**refused**: main's working tree held 24 of those same tracked PNGs dirty, pre-existing this fire (they were
already dirty at triage, alongside 22 more). This is the known factory-churn class — `lane-runner-v3.sh:104`
commits `artifacts` for lanes and art **by design**, and re-running any screenshot spec re-writes the bytes.
The 24 were discarded **path-scoped** (`git checkout HEAD -- <the 24>`) and the merge then fast-forwarded
cleanly. Nothing was lost: the incoming commit supersedes those exact files with freshly generated versions,
and no `src/`, `tasks/`, `specs/` or `reviews/` path was touched by the discard.

## Findings

**None blocking. No new findings.** The runner reported none, and none was manufactured here.

**F-1504-1 is CURED by this merge** — `e2e/drill-yard.spec.ts` no longer asserts the pre-AP-11 world.

🔭 **Still open and untouched, correctly: F-1501-4** (*"straw mans"*). The runner left it alone, as its
firewall required. It is now **player-visible** (the card speaks) and its gate is **OPEN**; because this
spec derives its expected text from `loadEpoch`, the prose fix will need **no test edit at all** — which is
the practical dividend of having derived rather than pasted.
