# minds-and-rigs — two fan pages: aggregate stats for MINDS (models) and RIGS (harnesses)

**Slice:** `minds-and-rigs` · **branch:** `lane/b` · **tip:** `d55312b06` · **drained:** s1620, 2026-08-10 · **authored:** ATTENDED (Cowork orchestrator, `0aba28806`), from an owner directive

**VERDICT: MERGE.** Delivers the owner's ask in full, honesty-labelled, with the ranking contract proved untouched by 34 adjacent county assertions. One non-blocking layout observation (F-1620-6).

## What it does

Owner directive, 2026-08-10, verbatim: *"Can you build out another statistics page where we track the harnesses and their performance, as well as another one for the models only? I know these stats are still kind of self reported, but people are fanboys of models or harnesses and are interested in details."*

Three things land:

1. **API** — `functions/api/standings.ts` gains a GET `?view=byHarness` builder mirroring `byStack`, grouped on `stack.harness ?? 'undeclared rig'`. Both views gain a per-group `aggregate` — `standings · contracts · crowns · bestWaves · totalTokensIn/Out/Calls · declaredCells/undeclaredCells · latestSubmittedAt`. Sums are taken **only over cells that declare them** — absent costs stay absent rather than becoming `0`, which is the difference between an honest table and an invented one.
2. **Reader** — the Field Book view chips become **Minds · Rigs · By team**. Each of Minds/Rigs renders an aggregate table first, one row per group, expanding to the existing per-contract cells (reused, not forked).
3. **A vocabulary correction, not a rename** — `FIELD_BOOK_VIEW_LABELS.byStack` read **"By rig"** while grouping by *model*. It now reads **"Minds"**. ✓ VERIFIED at `src/encyclopedia/reader.ts:135-139`. **This is a player-visible copy change and is flagged for the gazette filter.**

## Evidence (re-run by the drain on the MERGED tree)

Gated in detached worktree `gate-s1620` (§3.0b), `lane/b` + `main` merged there first — **clean merge by 'ort', zero conflicts** despite lane/b being 28 behind.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, clean |
| `npm run build` | rc 0, ✓ built in 2.38s |
| `test:stats` (F-1229-1, `functions/` touched) | **87 passed** |
| `test:accounts` (F-1229-1) | **43 passed** |
| `test:mp` (F-1229-1) | **462 passed** |
| `e2e/field-book.spec.ts --workers=1` | **8/8 passed, 10.2s**, both projects |
| Adjacent `lb-01-county-standings` + `milk-county-board` | **34/34 passed, 1.5m**, both projects |
| Console/page errors | zero across all instances |
| Screenshots | `reviews/shots-minds-and-rigs/` — Minds + Rigs, desktop + 390px |

The three `functions/` suites matter more than their size suggests: the slice edits the file that mints county rank, and **592 assertions across stats/accounts/multiplayer plus 34 county-board e2e assertions all hold**. That is the "no ranking changes anywhere" firewall proved rather than asserted.

### Mistake #10 — where does the PLAYER see this, in a plain boot?

`e2e/field-book.spec.ts:173` — **"plain boot renders and expands the Minds and Rigs tables"**, no `?debug`. Green in both projects. The screenshots are plain-boot renders of the Claim Ledger → The Field Book path. ✓

### 390px containment, tested not eyeballed

`e2e/field-book.spec.ts:269` and `:280` assert `body.scrollWidth <= body.clientWidth`, and `:268` asserts the same of the front-desk container — so the aggregate tables scroll **inside their own container** (`overflow-x: auto`, `reader.css:312`/`:469`) with **no page-level horizontal scroll**. The mobile screenshot shows the expected in-container clip at the `Crowns` column. ✓

### Aggregate math, proved on a seeded fixture

The runner's expected-vs-served JSON for one group matched exactly on every field — `standings 6 · contracts 3 · crowns 2 · bestWaves 40 · tokensIn 96 · tokensOut 15 · calls 9 · declaredCells 6 · undeclaredCells 0` — and `latestSubmittedAt` was separately validated as the newest stored submission timestamp. Re-run drain-side inside `field-book.spec.ts:89` ("minds and rigs aggregate the same standings without changing county ranking"), green.

## Findings

### F-1620-6 (non-blocking, layout) — on DESKTOP the aggregate table scrolls horizontally while visibly free width sits unused to its right.

`reviews/shots-minds-and-rigs/rigs-desktop-chrome.png` at 1280px: the Rigs aggregate table clips mid-column (`Declared cost` shows `90,000 in · 8,00`, the sub-line `1 declared · 0 undeclar`, and the expanded `The Dry Gulc` cell), while the area beneath the Front Desk sidebar card is empty. The containment is *correct* — it scrolls in-container and never scrolls the page, which is exactly what the master required and what the spec asserts — but the requirement was written for **390px**, and at desktop width the same rule produces a scrollbar where there is room to simply be wider.

**Not a defect against this master's scope**, which specified containment at 390px and got it. Recorded because the owner's stated audience is people *"interested in the details"*, and the details are the columns being clipped. **GATE: none owed to the owner** — a follow-up may let the Field Book content column reclaim the sidebar's width below the Front Desk card, or drop lower-priority columns at narrow widths.

### Observation — the relabel is a genuine correction and should be said out loud

"By rig" grouping by model was actively misleading on a page whose whole purpose is telling models and harnesses apart. Worth a line in the gazette item so returning players understand the tab did not merely get renamed — **it was wrong, and the thing it named now exists separately.**

## Merge classification

Base: `main` at `f2551606f`. Lane 1 ahead, 28 behind at gate time; the merge brought main's 28 forward with **zero conflicts** and no overlap with the slice's six paths.

| Path | Class | Resolution |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED (+64/−11) | added verbatim; ✓ removed lines audited — all 11 sit in the GET view-building path (`groupRows`, `BoardGroup`, the `byStack` response shape, the view guard extended for `byHarness`). **No POST-handler line and no rank-minting line was touched.** |
| `src/encyclopedia/reader.ts` | LANE-TOUCHED (+78/−22) | added verbatim |
| `src/encyclopedia/reader.css` | LANE-TOUCHED (+33/−0) | additive only |
| `e2e/field-book.spec.ts` | LANE-TOUCHED (+135/−98) | added verbatim |
| `reviews/shots-minds-and-rigs/*.png` ×4 | LANE-ONLY (new, binary) | evidence, added verbatim |

Firewall honoured: TOUCH-ONLY was `functions/api/standings.ts`, `reader.ts`, `reader.css`, `e2e/field-book.spec.ts`, and `public/skill.md` *only if* it documents field-book views — `skill.md` was correctly left alone. Nothing outside those paths appears in the diff.

## Disposition

**MERGE.** Player-visible: the Field Book gains two aggregate pages and a corrected tab label. **GZ-01 item owed** — filed this drain.
