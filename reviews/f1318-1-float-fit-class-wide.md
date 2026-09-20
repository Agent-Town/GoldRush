# f1318-1 — float-fit class-wide guard + ellipsis fallback

**Slice:** `f1318-1-float-fit-class-wide` · **branch:** `lane/m3` @ `d8ff6bd0` (lane base `da0c32d2`) · **merged to main:** `5d5929e4 (archive: pruned by the A3 rewrite)` · **drained:** s1319, 2026-08-01.

## Verdict

**ACCEPTED AND MERGED — with one finding that the runner measured and read the other way round (F-1319-2, below).**

The slice does what it was sent for. But its central claim — *"the guard REDs, therefore it has teeth"* — is true of the tree the RED was taken on and **false of the tree that shipped**, and I proved that by mutation on the merged tree rather than by argument.

## What it does

`upgradeFloatText` sentences are drawn into a canvas whose font shrinks until the line fits, with a hard floor at `FLOAT_TEXT_MIN_FONT_PX = 32`. Below that floor the old code drew the full string centred, discarding overflow from **both** ends — a mid-sentence fragment.

Two changes:

1. **`src/systems/Vfx.ts`** — when the fit loop bottoms out at the floor and the line still exceeds `budget = canvas.width - FLOAT_TEXT_PADDING_PX`, the text is truncated character-wise and an `…` appended, so overflow degrades *legibly* instead of becoming a different message. `Array.from(text)` is used, so surrogate pairs are not split.
2. **`e2e/vfx-float-legibility.spec.ts`** — the guard is widened from one hard-coded sentence to **every reachable upgrade sentence**, derived from the producer (`Object.keys(Balance.tiers)`) rather than re-typed, with an exhaustive `satisfies Record<keyof typeof Balance.tiers, …>` placement record so a new buildable cannot silently escape it.

No player copy, canvas height, sprite aspect, pool size or width cap changed.

## s1318's pre-declared REJECT bar, item by item

s1318 set three mechanical conditions. Two pass cleanly; the third was internally inconsistent and I am saying so rather than quietly waiving it.

| Bar condition | Verdict | Evidence |
| --- | --- | --- |
| Any *certifying* assertion on `lastFloatText.text` ⇒ REJECT | ✅ **PASS, and more strongly than required** | `.text` is **never read at all** in the new spec — not as an assertion, not even as a `waitForFunction` predicate. Every assertion is on measured raster geometry (`renderedWidthPx`, `canvasWidthPx`, `fontPx`) or on population size. |
| Any hand-typed duplicate of the sentence list ⇒ REJECT | ✅ **PASS** | `UPGRADES` derives from `Object.keys(Balance.tiers)`. The only hand-written table is `PLACEMENTS` (map coordinates, not copy), and it is compiler-checked exhaustive against `Balance.tiers`. |
| "No two manufactured REDs in the report ⇒ REJECT" | ⚠️ **RULED SATISFIED — the summary line contradicted its own instruction** | The master's scope-4 bullets ask for RED → byte-exact revert → GREEN, and then *"do the same for scope 3: … paste the observed `renderedWidthPx`/`fontPx` and a screenshot"*. With the fallback installed the mutation is **green by design** — a second RED is not merely absent, it is **unobtainable** against the code scope 3 asks for. The runner obeyed every bullet. Penalising it for the summary sentence that mis-describes them would be scoring the master's internal contradiction against the runner. |

⚠️ **But the third row is exactly where the real defect was hiding, and the resolution is not "never mind" — see F-1319-2.**

## F-1319-2 — the cure made the guard's primary assertion tautological, and the RED was taken against the pre-cure tree

**✓ VERIFIED BY MUTATION ON THE MERGED TREE, s1319 — not by reading.**

Read the shipped `drawTextTexture`: the shrink loop exits on `measureText(text).width > canvas.width - FLOAT_TEXT_PADDING_PX`, and the new fallback truncates against `budget = canvas.width - FLOAT_TEXT_PADDING_PX`. **Those are the same quantity.** So after the cure:

- exit with `fontPx > MIN` ⟹ the loop's own condition guarantees width ≤ budget;
- exit with `fontPx === MIN` and width > budget ⟹ the fallback truncates until width ≤ budget.

⟹ `renderedWidthPx <= budget` is a **theorem** of the shipped code. And the spec's primary assertion is `renderedWidthPx <= canvasWidthPx - 20`, with `FLOAT_TEXT_PADDING_PX = 20` — **the identical quantity.**

**Measured, on the merged tree:** I lengthened the stockpile sentence by 30 characters (`… and more ore and more besides`), far past the floor — the same class of mutation the runner used to obtain its RED:

| Tree | Mutation | Result |
| --- | --- | --- |
| pre-cure (runner's, quoted) | `+ " and more ore"` | **RED 2/2** — `expect(received).toBeLessThanOrEqual(748)`, received `945.734375` |
| **merged tree (mine)** | `+ " and more ore and more besides"` | **GREEN 2/2** |

`src/systems/BuildSystem.ts` sha256 `839e15ced1471912` **identical before and after**; `git diff --stat -- src/systems/BuildSystem.ts` empty.

➡️ **The width assertion can no longer fail for any reachable input.** The guard's surviving teeth are `toHaveLength(8)` (catches a buildable losing its upgrade path) and `fontPx >= 32` (catches the floor moving) — both real, neither the property the slice was named for.

⚠️ **And the ellipsis itself ships unguarded.** Nothing asserts that the truncated line ends in `…`, or that a fitting sentence is left un-truncated. Replace the ellipsis with a hard clip, or drop the `…`, and the suite stays green.

ⓘ **The runner measured this exact fact and read it as success:** its report says *"With the fallback installed, the same temporary mutation stayed GREEN on both projects"*, offered as proof the fallback works. It is that — **and** it is proof the assertion is now toothless. One measurement, two readings; the second is the finding.

💡 *This is the slice's own lesson recurring one level up. s1318 warned that a class-wide guard is "green at birth including if written wrong". The guard was written **right**. What went stale is the **proof**: a RED taken against the predecessor tree does not certify the successor tree. **A guard must RED at its own birth commit, not at its parent.***

**Corrective (fire-authorable, not owner-gated):** assert on `renderedText` — that an over-budget floor-bound line ends in `…`, and that a fitting line is returned unmodified. That requires `drawTextTexture` to surface `renderedText` in its return value (it currently returns only the three numbers), which is a two-line change. Registered on the ladder; no goal leaf yet.

## Evidence (all re-derived on the merged tree, s1319)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.48s`, asset-diet green |
| `e2e/vfx-float-legibility.spec.ts` `--workers=1` | **2 passed** (desktop + mobile), 8.2 s, 0 console/page errors, watchErrors suppressed 0/0 |
| Adjacent (derived by `grep -rln lastFloatText e2e src`) | `vfx-visualy` + `lane-crossing-armed` + `bt-01-tiers`, `--workers=1`: **24 passed / 4 failed**, 5.1 m |
| node-guards (37 files, full list from `package.json`) | **204 passed / 0 failed** — matches the derived baseline; slice touches no guard file, delta **0** |
| Manufactured-overflow probe (mine, merged tree) | **GREEN 2/2** ⇒ F-1319-2 |

**The 4 adjacent failures are pre-existing known reds, fingerprint-matched by title in `logs/suite-red-inventory.md` (both projects):** *"Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button"* and *"insufficient gold leaves tier and gold unchanged"*. ⓘ The inventory lists **more** bt-01 reds than I observed — *"same-frame upgrade and confirm does not demolish the upgraded building"* and *"turret tier raises live damage…"* both **passed** — so the inventory is stale in the safe direction, and my four are a strict subset of it. No new red.

## Merge classification

⚠️ **The two-dot diff was a trap here and a blind `git merge` would have destroyed a day of work.** `main..lane/m3` reports **59 files / 2311 deletions**, because the lane's base `da0c32d2` **predates** main: it renders main's newer commits as deletions. A branch merge would have deleted s1318's four review files, `marketing/outbox/ticker-digest-2026-07-31.md`, `reviews/shots-f1316-1/`, this fire's own freshly-authored `tasks/lane-b-ap07-night-shift-fixtures.md`, and **reverted `src/sim/HeadlessContractSim.ts`**, un-shipping the AP-07 pin lift.

`node scripts/lane-usable.mjs lane-a` gave the correct denominator — **`ahead=1 paths=6`, all six `HELD LANE-ONLY`** — and those six are the whole drain unit. Merged **path-scoped** (`git checkout lane/m3 -- <6 paths>`), producing exactly 6 changed paths and zero collateral.

ⓘ The lane holds f1316-1's *content* through the runner's own commit, not through main's merge commit `efa3b252` — so `git merge-base --is-ancestor efa3b252 lane/m3` is **false** while the file contents agree. That is the false-ahead shape; the per-path classifier saw it correctly and the two-dot diff did not.

| File | Class |
| --- | --- |
| `src/systems/Vfx.ts` | LANE-ONLY (+14/−6, fallback only) |
| `e2e/vfx-float-legibility.spec.ts` | LANE-ONLY (rewritten class-wide) |
| `artifacts/f1318-1-float-fit-class-wide/{desktop,mobile,ellipsis-desktop}-chrome.png`, `report.md` | LANE-ONLY (new evidence) |

## Findings

- **F-1319-2 (this fire, MEASURED)** — the width assertion is tautological against the shipped code and the ellipsis is unguarded. Non-blocking: the shipped *behaviour* is a strict improvement, and two of the guard's assertions retain teeth. Corrective is fire-authorable and on the ladder.
- **F-1318-2** (4× cap headroom) — the runner reported it as asked and did **not** act: **17.80 px** of full-copy width at the worst floor-bound sentence, **2.38 %** of budget, roughly one glyph. Remains on the owner's desk, folded into the F-1316-1 copy item.
- ✅ **F-1318-1 is CLOSED by this merge.**

## Where does the PLAYER see this?

On any upgrade purchase, in a plain boot. Before: a sentence longer than the sign became a mid-word fragment cut at both ends. After: it fits, or — at the floor — it ends in an ellipsis instead of becoming a different sentence. Screenshots: `artifacts/f1318-1-float-fit-class-wide/` (desktop + mobile), plus `ellipsis-desktop-chrome.png` showing the fallback state under a deliberate over-long line.
