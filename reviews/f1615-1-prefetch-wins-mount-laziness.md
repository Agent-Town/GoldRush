# f1615-1 — prefetch wins, mount laziness (HELD)

**Slice:** `f1615-1-prefetch-wins-mount-laziness` · **branch:** `lane/a` · **tip:** `914a7e93b`
**Gated by:** s1617 · **Base at gate:** `9dd5ef6af` (main)

## Verdict

**HOLD — NOT MERGED.** The slice does what it was asked to do, and the runner's own report is accurate and
unusually honest. But it puts a **new, reproducible red on an adjacent suite in both projects**, and that red is not
a stale assertion — it is a real data-usage regression for `saveData` users. Per `fire.md` §3, a blocking finding
spawns a corrective instead of a merge. **`lane/a` is left intact and undrained; nothing was reset.**

## What it does

Per the owner's branch-(a) ruling on F-1167-1/F-1615-1, one functional line in `src/town/TownTavernPilot.ts:49`
removes the `stamp-mill` / `dynamo_hall` exclusion from `townPrefetchUrls()`, so the menu-boot prefetch warms them
like every other town model. The other 10 changed source files are `e2e/town-*-blender.spec.ts`, re-scoped from
*request* laziness to *mount / render-source* laziness, with count assertions switched to distinct-URL `Set`
comparisons and 11 test titles renamed to stop claiming "never fetches". ~112 further paths are regenerated
screenshots.

## The blocking finding

### [F-1617-4] BLOCKING — the slice makes `saveData` users download two bulk era-2 GLBs

`e2e/advance-stream.spec.ts:69` asserts, under a stubbed `navigator.connection.saveData = true`:

```js
expect(prefetched.some((url) => /stamp-mill|dynamo-hall/.test(url))).toBe(false);
```

**Measured on the merged tree, `--workers=1`, detached worktree, scratch port 5231:**

| Arm | Result |
|---|---|
| main **without** the slice (`9dd5ef6af` + f1616-1), same fire, same shell | **10/10 passed**, 32.2 s |
| main **with** the slice merged | **8 passed / 2 failed**, 36.4 s |

Both failures are the same test, on **both projects**, failing on that one line: `Expected: false · Received: true`.
This is not bimodal and not a flake — it is deterministic and it reproduces the runner's own independent review.

✓ **Causal chain verified by reading the code, not inferred from the coincidence:**
`src/assets/AdvanceStream.ts:30` sources the town set from `townPrefetchUrls()` — the exact function the slice
edits — and `AdvanceStream.ts:219` narrows prefetch to `priority === 1` targets when `saveDataEnabled()`. Town **is**
a priority-1 target (the same test asserts, still passing, that `town-plate`/`tavern` *are* warmed under saveData).
So the two newly-included GLBs ride straight through the saveData filter. Nothing else in the diff can reach that
assertion.

⚠️ **Why this is a regression and not a stale test.** `saveData` is the user's browser saying *conserve my data* —
typically a metered mobile connection. The test's three sibling assertions all still pass: no bulk contract
terrain/panorama, tier-one town still warmed, under 20 GLBs total. The suite is not obsolete; it is doing exactly
its job and catching a real behaviour change. Treating it as stale and deleting the line would silently spend a
metered user's data to fix a desktop prefetch leak.

🔱 **The resolution is an intersection, not a fork** — and this is why it is fire-authorable rather than owner-gated.
Two ratified constraints both hold: the owner ruled the exclusion must go (so the menu boot stops leaking), and the
saveData contract says bulk assets stay cold when the user asked to conserve. **Keeping the exclusion under saveData
only** satisfies both, changes no design, and needs no new ruling. Corrective authored: `f1617-1-savedata-town-trim`.

## Not verified (stated honestly rather than assumed)

Because the slice is **not merging**, I did not re-derive the rest of the runner's battery; the merge decision did
not turn on it, and re-running it would have spent budget on a tree that is not landing. Carried forward unverified,
for whoever drains this after the corrective:

- Runner reports **240/246** across the ten target specs at `--repeat-each=3`, both projects (mobile **123/123**),
  and classes all six desktop failures as **pre-existing bimodal p95 frame-time checks**. s1616's handoff explicitly
  warned that these sites are bimodal and that the tally must be read rather than trusted — **that reading is still
  owed.** Every mount-laziness, distinct-request and console-error assertion is reported green.
- Runner reports named adjacent suites **22/28**, with three failures — first-ending timeout, growth-beat ordering,
  plaza walking timeout — reported as unrelated and reproduced in isolation. **Unconfirmed drain-side.**
- Runner reports tsc green, build green, asset-diet 4/4, and an asset-size shift worth a look on the next gate:
  desktop 21,389,200 → 16,209,181 bytes, but mobile 15,181,572 → **17,074,995** (mobile grew ~1.9 MB, which is the
  same direction as F-1617-4 and may share its cause).

## Merge classification (recorded for the next drain, not acted on)

`main..lane/a` = 1 commit `914a7e93b`, `paths=123`, all LANE-ONLY per `lane-freeze-classify`. Functional surface is
tiny: `src/town/TownTavernPilot.ts` (**-1 line**) + 10 `e2e/town-*-blender.spec.ts`; the remaining ~112 paths are
regenerated `.png` evidence, which is never byte-identity gated. `lane/a` is `behind=73`, so any two-dot diff against
it will show phantom deletions — classify from the lane commit's own `--stat` and merge three-way. The lane is
`ahead=1` and **holds work main has never seen: do NOT reset or refill lane-a.**

## Runner conduct

Exemplary, and worth recording. It found this conflict itself via an independent review, **declined to fix it**
because the firewall and the owner's ruling both forbade touching `AdvanceStream.ts` or that spec, and reported it as
needing a follow-up ruling rather than quietly re-scoping the assertion — the Mistake #14 discipline working exactly
as intended. It also disclosed which regenerated evidence it discarded (`artifacts/062`, `asset-diet`, `era-lights`,
`town-t4`, `ts-01`, `reviews/shots-town-music`) and which it retained. Cost: 425,147 tokens.
