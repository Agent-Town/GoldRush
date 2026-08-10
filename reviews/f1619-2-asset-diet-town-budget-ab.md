# f1619-2 — asset-diet town-budget A/B: settling the unverified mobile growth from f1615-1

**Slice:** `f1619-2-asset-diet-town-budget-ab` · **branch:** `lane/a` · **tip:** `dc6a8e890` · **drained:** s1620, 2026-08-10

**VERDICT: MERGE.** Delivers the per-URL breakdown it was authored for, and the measurement reproduces to within 1.6%. The drain adds one finding that is larger than the slice: **the 25 MB town budget is asserted by two tests whose totals differ by 9.5 MB** (F-1620-7).

## What it does

Adds one test to the existing `e2e/asset-diet.spec.ts` — **"town byte budget reports normal and saveData arms by URL"** — that walks town twice, once plain and once with a `saveData` `addInitScript`, and emits `artifacts/asset-diet/town-budget-<project>.md` with a per-arm total and a **per-URL delta table**.

The design is the cheap one on purpose: because f1617-1 excludes the two bulk halls under `saveData`, **a saveData arm IS a without-the-halls control** — no code revert, no second checkout, nothing left uncommitted. Gate topology deliberately unchanged (the s1301 lesson): the test is *added* to a file already reached by `npm run test:asset-diet`, so no new npm script and no new `claimedByAnotherConfig` entry. **Additions only** — `git diff --numstat` deletions read `0` on the spec.

## Evidence (re-run by the drain on the MERGED tree)

Gated in detached worktree `gate-s1620` (§3.0b); `lane/a` + `main` merged there — **clean merge by 'ort', zero conflicts**.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, clean |
| `test:asset-diet` (preview config, `--workers=1`) | **6/6 passed, 1.6m**, both projects |
| Console/page errors | zero; `watchErrors suppressed 0 known GLTFLoader blob error(s)` in every arm |
| `npm run test:node-guards` | **correctly out** per F-1460-1 — diff is one `e2e/` file + artifacts, zero `src/sim`, `src/systems`, `src/entities` |
| Diff shape | `e2e/asset-diet.spec.ts` **+114 / −0** — additions only, as the master required |

### The measurement reproduces

| Figure | runner | drain | apart |
|---|---:|---:|---:|
| mobile normal | 22,110,931 | 22,469,519 | 1.6% |
| mobile saveData | 19,200,792 | 19,525,661 | 1.7% |
| mobile delta | 2,910,139 | 2,943,858 | 1.2% |

Desktop, drain run: normal **22,293,939** · saveData **18,264,383** · delta **4,029,556**.

### What it settles

The per-URL table is the deliverable, and it does the job it was authored for. On mobile the two bulk halls account for **2,584,796 of the 2,910,139 byte delta — 88.8%**:

| URL | normal | saveData | delta |
|---|---:|---:|---:|
| `dynamo-hall-*.glb` | 1,407,064 | 0 | 1,407,064 |
| `stamp-mill-*.glb` | 1,177,732 | 0 | 1,177,732 |
| 8 × `char-hero-sheet-walkdiag8-*.png` | ~324k total | 0 | ~324k |

The remainder is the hero walk sheets, which `saveData` also drops. ✓ **The runner stated the limit rather than overselling it**, exactly as the master demanded: *"The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one."* That sentence is why this artifact is trustworthy.

## Findings

### F-1620-7 — the 25 MB town budget is asserted by TWO tests in the same file whose totals differ by 9.5 MB. One believes it has 12 MB of headroom; the other has 2.5 MB.

✓ VERIFIED by reading both sites. `e2e/asset-diet.spec.ts:103` asserts `expect(townResponseBytes).toBeLessThan(25_000_000)`, and the new test asserts the same ceiling at `:225`/`:226`. Both name the measured quantity `townResponseBytes`. Their values do not agree:

| Source | mobile town bytes | headroom vs 25 MB |
|---|---:|---:|
| pre-existing test (`:74`, "honest town and claim cues … while GLBs are **throttled**") | **12,932,580** | 12,067,420 |
| new A/B test (`:122`, normal arm) | **22,469,519** | **2,530,481** |

**The project's belief about how much room it has under the ceiling depends on which test you read, and the tighter number is the new one.** ? INFERRED (stated as inference, not measured): the older test throttles GLBs by design, so its total is plausibly a *partial* load captured inside the measurement window rather than a different accounting of the same load — but the drain did not verify that, and the two should not be reconciled by assumption.

⚠️ **Consequence for the question this slice was authored to settle.** f1615-1's disputed figures — desktop `21,389,200 → 16,209,181`, mobile `15,181,572 → 17,074,995` — sit *between* the two instruments' scales. **Nobody should compare a number from one against a number from the other**, and the ~1.9 MB "growth" may itself be partly an instrument mismatch rather than a real regression. This slice does not close f1615-1; it makes clear that closing it requires naming the instrument first.

**GATE: none owed to the owner** — an engineering question. Closes when the two `townResponseBytes` sites either measure the same thing or are renamed so they cannot be confused, and f1615-1's figures are restated against a named instrument. **Recommend doing this before any further asset-diet tuning**, because a 2.5 MB real headroom is a very different planning constraint from 12 MB.

### F-1620-8 (non-blocking) — desktop and mobile disagree on the saveData delta by 37%, and the reason is not in the artifact.

Drain run: desktop delta **4,029,556** vs mobile **2,943,858**. Both arms exclude the same two halls (2,584,796 bytes), so the ~1.1 MB difference comes from the *other* thing `saveData` does — narrowing advance-stream prefetch to `priority === 1` — which evidently removes more on desktop than on mobile. The per-URL tables contain the answer; nobody has read it out. Worth one pass before the delta is quoted anywhere.

## Merge classification

Base: `main` at `754712be2`. Lane 1 ahead, 12 behind at gate time; merged clean, zero conflicts.

| Path | Class | Resolution |
|---|---|---|
| `e2e/asset-diet.spec.ts` | LANE-TOUCHED (+114 / −0) | added verbatim; additions only, deletions verified `0` |
| `artifacts/asset-diet/town-budget-desktop-chrome.md` | LANE-ONLY (new) | added verbatim |
| `artifacts/asset-diet/town-budget-mobile-chrome.md` | LANE-ONLY (new) | added verbatim |
| `artifacts/asset-diet/*-throttled.png` ×4 | LANE-TOUCHED (binary) | evidence regeneration; never byte-identity gated (F-1266-1) |

Firewall honoured: no `src/**`, no `package.json`, no `playwright.config.ts`, no new npm script, no `claimedByAnotherConfig` entry — gate topology unchanged as specified.

## Disposition

**MERGE.** F-1620-7 is the valuable output of this drain and is larger than the slice that produced it: a budget ceiling guarded by two disagreeing instruments is a guard that will eventually be believed at the wrong number. Neither finding blocks. Not player-visible — **no GZ-01 item owed** (test + artifacts only).
