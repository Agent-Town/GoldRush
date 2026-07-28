# Review — cp04-charter-name-composition

**Slice:** `lane-b-cp04-charter-name-composition` (FIRE-AUTHORED s1180, from F-1179-3)
**Branch/tip:** `lane/m4` @ `c97062be`
**Report merged to main:** `c2d1b690` (the RUN REPORT only — a lawful STOP ships no work, and `mergeHash` is a GUARD INPUT, not an evidence pointer; F-1179-5)
**Drained by:** s1180 fire, 2026-07-28 (the same fire that authored it)
**§3.0 drain-block-check:** ✅ CLEAR as the first command.

## Verdict

**LAWFUL STOP at scope 1(c) — accepted as a full success. The task answered its question and refuted its own author's proposed repair.**

## What it found

The master declared four classifications with **three of them STOPPING**. The runner returned **(c) — the outer gate was never entered** — and printed the operands:

```text
[CP04 observe] {"step":1,"launched":false,"requestedId":"e1-dry-gulch","contractId":"e1-dry-gulch"}
[CP04 observe] {"step":2,"charterLaunch":null}
[CP04 observe] {"step":3,"pressedOk":true,"pressedContractName":"The Dry Gulch — Build Something Big"}
[CP04 observe] {"step":5,"documentContainsBuildSomethingBig":true}
```

Read together these are decisive. The document **is** present, **does** contain the composed name, and **parses cleanly to the full composed name** (step 3 was an independent parse of the captured document). But at the seam itself `readCharterLaunch()` returns **null** and `launched` is **false** — so `parseContractDescriptor` is never called by the live code path at all.

## The mechanism — ✓ VERIFIED AT SOURCE BY THE DRAINING FIRE, not taken from the report

| step | file:line | what it does |
|---|---|---|
| 1 | `src/main.ts:114` | `startGame()` calls `reverifyStagedContractLaunch()` **before** `activeContract()` at `:116` |
| 2 | `src/meta/ContractUnlock.ts:79` | if the staged contract is missing from the board **or** `!contractUnlockStatus(contract).unlocked` → `clearPlayerContractLaunch()` |
| 3 | `src/meta/ContractFamilies.ts:1099-1105` | that function removes **BOTH** `gr.contract.launch.v1` **and** `gr.charter.launch.v1` |
| 4 | `src/meta/ContractFamilies.ts:1177` | the charter seam therefore sees `launched === false` and never applies the composed name |
| 5 | `src/meta/ContractFamilies.ts:1158-1172` | the `?contract=` URL param still selects the requested base contract — **which is why `activeId` was correct all along** |

`e1-dry-gulch` is locked for a virgin test profile, so every non-`the-claim` seeded boot is cleared at boot. `the-claim` is `DEFAULT_CONTRACT_ID` and unlocked, so its two boots keep their charter — **the exact 2-green / 7-red split s1178 computed.**

## Why this is worth three fires

| fire | claim | verdict |
|---|---|---|
| s1178 | the unlock gate (added after the spec shipped) is responsible | ✅ **correct** |
| s1178 | …because the contract falls back to `DEFAULT_CONTRACT_ID` | ❌ refuted by s1179 (`activeId` is the requested contract) |
| s1179 | therefore the unlock gate is *not* implicated; it is a composer-vs-read-back defect | ❌ **half-refuted here** — the gate IS the cause |
| s1180 (this) | the gate clears the staged **charter**, rather than swapping the **contract** | ✅ verified at source |

Both predecessors were partly right and partly wrong, and neither could have got here without the other's measurement. **The gate is guilty; the charge was wrong twice.**

## Findings

- **F-1180-3 — the cure for F-1179-3 is now BLOCKED on the owner fork F-1179-4, and they are the same question.** What a *locked* land should do — hide it, show it locked, or unlock on press — decides this defect's repair, because the boots that lose their charter are exactly the boots whose land is locked. A fire may not pick. ➡️ **F-1179-3 should NOT be re-authored as a code fix until F-1179-4 is answered.**
- **F-1180-4 — my own scope 2 was the wrong repair, and the runner said so in writing.** The master prescribed an additive diagnostics field carrying the swallowed `!pressed.ok` rejection. The report's closing paragraph: *"The proposed additive diagnostics field would not have made the original defect visible: the charter-application branch was never reached, so it had no rejection to carry. Visibility must exist at the earlier launch re-verification/clear boundary before a rejection diagnostic can help."* ✓ Correct, and it survives the source check — `reverifyStagedContractLaunch()` clears silently and returns `void`, so **nothing anywhere records that a charter was discarded.** That is the observability gap, one call earlier than I aimed it.

## Firewall compliance

✓ Clean. `git diff -- e2e/` **empty**, `git diff -- src/` **empty**, `git status --porcelain -- e2e/ src/` **empty**; only the run report remains. The firewalled `:106` press-through stayed red as the master required, and the runner did not touch `ContractUnlock.ts` or `PressPanel.ts` despite the mechanism living there — it stopped and reported instead, which is exactly right, because that file is the owner's fork.

## Baseline recorded

`e2e/cp04-lever.spec.ts` desktop-chrome, `--workers=1`: **8 failed / 4 passed (4.8 m)** — the firewalled `:106` plus all seven non-`the-claim` seeded boots; the two `the-claim` boots, the 45-choice validator test and the inert plain boot all passed. Consistent with the 16/8 both-projects figure.
