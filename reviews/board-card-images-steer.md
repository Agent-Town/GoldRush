# Review — board-card-images-steer (rf-37 site 10, the last one)

**Slice:** `lane-board-card-images-steer` · **Branch:** `lane/m3` · **Tip:** `aaecbbbe` · **Base:** `b29d1f70`
**Drained:** s1114, 2026-07-27 · **§3.0 drain-block-check:** ✅ CLEAR (`status="authored"`, no block)

## VERDICT: ✅ MERGE — the bar was "still green", and it is green 3/3 plus mobile, on a quiet box at `--workers=1`.

## What it does

`e2e/board-card-images.spec.ts` walked to the tavern by wall clock: `hold(page,'KeyA',850)` then
`hold(page,'KeyW',850)`. `hold()` pressed a key, waited a fixed `waitForTimeout`, and **released it** —
so by the time the `expect.poll(...).toBe('tavern')` at `:19` started looking, nothing was moving. The poll
could only ever observe a hero who had *already* arrived; under load fewer frames render inside the fixed
wait, less ground is covered, and the poll times out against a hero standing still.

This slice replaces both calls with the closed-loop steer already merged at `e52b4fde`
(`e2e/town-t1-square.spec.ts:47-64`): resolve `tavern` from `plaza.slots` (`approach ?? position`),
then up to 48 × 160 ms nudges, re-reading the player's live position each iteration and breaking the moment
`activePrompt === 'tavern'`. The arrival assertion at `:19` is untouched — it remains the proof.
The now-unused `hold()` helper is deleted; ✓ VERIFIED it was file-local with exactly three references on
main (`:17`, `:18`, `:59`), all three removed by this diff.

**This completes rf-37.** Nine sites shipped `e52b4fde`; this is the tenth and last.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean — and it is a **real** gate here: the change is 100% `e2e/`, and `tsconfig.json` `include` is `["src","e2e","playwright.config.ts"]` |
| `npm run build` | green, 1.51s |
| **Control** — main's spec, `--workers=1`, before applying | **1 passed (6.9s)** — premise confirmed on *this* box, not inherited |
| desktop repeat 1 | 1 passed (6.9s) |
| desktop repeat 2 | 1 passed (6.9s) |
| desktop repeat 3 | 1 passed (13.0s) |
| mobile-chrome | 1 passed (13.1s) |
| console/page errors | zero — the spec's own `expect(errors).toEqual([])` at `:37` held in every run |
| `git diff --stat` | `e2e/board-card-images.spec.ts | 24 ++++++++++++++++--------` — **one file**, 16+/8− |
| box load at gate time | 1.93 / 2.57 / 4.45 — quiet |

Control and treatment share worker count (`--workers=1`) and box conditions, per F-1113-4.
The runner reported 6.2s before / 6.1s after with repeats 6.3/6.3/6.2 and mobile 6.3s; my numbers are
uniformly slower but identically green — a box difference, not a slice difference.

**No coordinate literal, no teleport, no `page.evaluate` writing player position** — ✓ VERIFIED by reading
the full diff. `850`, `8_000`, `48`, `160`, `0.6` all unchanged. The frozen
`contract-chapter-tab-epoch-2-steamworks` literal at `:35` and `seedProfile()` are untouched, as the
firewall required.

## Merge classification

Base `b29d1f70`; main advanced 3 commits since (`67e6e462` BACKLOG, `082c4a9f` + `f3b7323f` STATUS line-1).

| File | Class | Resolution |
|---|---|---|
| `e2e/board-card-images.spec.ts` | **LANE-TOUCHED, main never moved it** | direct — base blob `54b31f18` == main blob `54b31f18`; lane `5a9126c2`. Zero conflict. |
| `STATUS.md`, `tasks/BACKLOG.md` | **MAIN-MOVED only** | not merged; main is newer |

Applied via `git checkout lane/m3 -- e2e/board-card-images.spec.ts`; ✓ VERIFIED byte-identical to the lane
tip after applying (sha256 `36ab7ba32476a220…`). Lane worktree clean, zero runner debris.

## Findings

### F-1114-1 🔵 non-blocking — `town-t1-square.spec.ts:96` carries a STALE COPY assertion; the steer works, the words moved.

While running adjacent suites I hit `town-t1-square.spec.ts:74` red (1 failed / 4 passed alongside
`board-era-chapters`). **It is not mine and not rf-37's** — clean-main control reproduced it **2/2
deterministically** with the identical error, with my change reverted off the tree.

The failure is precise and it exonerates the steering work:

```
expect(locator).toContainText(expected) failed
Locator: getByTestId('town-approach-prompt')
- Expected substring  - 1   ('order status')
+ Received string     + 4
    at approach (e2e/town-t1-square.spec.ts:66:58)
    at e2e/town-t1-square.spec.ts:96:3
```

`:96` is `approach(..., 'assay_office', 'Assay Office', 'order status')`. The `expect.poll` arrival proof at
`:64` **passed**, and the *name* check at `:65` (`'Assay Office'`) **passed**. Only the copy check at `:66`
failed. So the hero steered there correctly and the building identified itself correctly — the prompt's
prose simply no longer contains the phrase.

✓ VERIFIED the phrase is stale, not missing-by-bug: `grep -rn "order status" src e2e` returns **two hits and
both are test files** (`town-t1-square.spec.ts:96`, `town-t6-surfaces.spec.ts:118`). The string exists
nowhere in `src/`.

This is a **named instance** of F-1113-1's family — s1113 measured that clean main scores 14/21 with "five
of its seven reds stale copy assertions rf-37 was never scoped to touch", but counted them in aggregate.
This one now has an address. **Not fire-authorable as written**: fixing it means deciding what the assay
porch's prompt *should* say, which is copy, and the `town-t6-surfaces.spec.ts:118` hit suggests a second
site with the same assumption. Recommend an attended pass that reads the live prompt text once and
re-anchors both assertions together.

**Why it does not block this merge:** disjoint file, reproduced red on clean main with this slice absent,
and the failing assertion is downstream of the arrival proof this slice is about.

## Note for the next author

`plaza.slots` resolves `tavern` cleanly with a finite `approach` — no surprises. The `?? position`
fallback was not exercised. rf-37 is now **complete**; there is no site 11.
