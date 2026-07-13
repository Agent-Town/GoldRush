# Review — ledger-era-chapters (the Claim Ledger reads like a saga)

**Slice:** ledger-era-chapters (ATTENDED-AUTHORED, owner: "and in the school encyclopedia according to each epoch?")
**Branch/tip:** lane/perf `24b40921` (runner ran on lane-d), base `dd3b888c`
**Merged to main:** s475 fire, path-scoped graft (files disjoint from main's Trestle movement)
**Verdict:** PASS (merged) — with one in-scope test corrective to en-01 (below) and one pre-existing red logged.

## What it does
The Claim Ledger reader is reorganized from a flat category list into **era chapters**. Every registry entry now carries a required `epochId` tag (E1 people/claim/buildings/frontier-enemies → frontier; E2 enemies + `boiler_house` → steamworks; each epoch overview entry → its own era). The reader renders an **era tab row** matching the research-chart grammar ("The Frontier ✓ / The Steamworks — active / A future era remains locked"), opens on the player's active (latest open) era chapter, shows that era's category shelves with existing discovered/undiscovered states, its kit plate strip (non-LITE, lazy via `loadEraBackdrop`), and a locked future-era stub ("The ledger has pages yet unwritten") that never leaks unseen content. Deep links (`openClaimLedger(entryId)` / `requestOpenClaimLedger`) jump to the correct chapter + entry.

## Evidence
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green (827ms) |
| `e2e/ledger-era-chapters.spec.ts` (NEW, 2 tests) | PASS desktop + mobile (E2-active: 2 open chapters + locked stub + tabs + deep link; E1-only: one chapter + locked next era) |
| `e2e/en-01-claim-ledger.spec.ts` | PASS desktop + mobile **after corrective** (see F-1) |
| `e2e/061-first-claim-onboarding.spec.ts` (4 tests) | PASS desktop + mobile (8/8) — reader-adjacent, unmodified-green |
| console/page errors | zero (all specs above collect + assert `[]`) |
| Screenshots | `artifacts/ledger-era-chapters/{desktop,mobile}-chrome-{e1-only,e2-active}.png` |

## Merge classification
Base `dd3b888c` (pre-Trestle). Main moved these paths since base: `STATUS.md`, `artifacts/e2-trestle/*`, `contracts.json`, `e2e/e2-trestle.spec.ts`, `gazette-queue.md`, `reviews/e2-trestle.md`, `src/town/TownScene.ts`, `tasks/*`. Lane touched: `src/encyclopedia/{reader,registry}.ts`, `e2e/ledger-era-chapters.spec.ts`, `artifacts/ledger-era-chapters/*`. **Disjoint** — encyclopedia files verified byte-identical base→main (`git diff dd3b888c main -- src/encyclopedia empty`), so a straight path-scoped `checkout lane/perf -- <files>` is a clean, non-3-way graft. The lane's stale reverts of `tasks/*`/`STATUS.md` were NOT taken.

## Findings
- **F-1 (RESOLVED in-merge, non-blocking): `en-01-claim-ledger.spec.ts:167` regressed under the era-chapter reader.** After the test advances the profile to Steamworks and reloads, the reader now (correctly, per the ratified grammar the new spec encodes) opens on the **Steamworks** chapter; the frontier `the_claim` card is under the "The Frontier ✓" tab and absent from the DOM until that tab is clicked. Fingerprinted as a real, feature-introduced break (fails with graft, passes on clean main, isolated single-spec run). Fix = a mechanical, ratified-UX-consistent corrective: click the Frontier era tab before the persisted-frontier-discovery assertions (idempotent when already on Frontier). Re-ran green both projects. This is a drain corrective to a base spec that assumed the old flat layout — **not** a defect in the feature.
- **F-2 (PRE-EXISTING red, NOT this slice): `tl-03b-ledger-stats-window.spec.ts:108`** ("Assay Office records are hidden until the first completed run, then show mocked tallies") fails on **clean main** (verified by reverting the encyclopedia files and re-running: 108 still fails, 144 passes). Unrelated to ledger-era-chapters. Owed a separate investigation/corrective — logged for the owner-facing ledger, not a blocker here.

## Player-sees-it (Mistake #10)
Plain boot → Claim Ledger (start menu or in-town pause): the reader now presents an era tab row and chapters. A fresh frontier player opens to the Frontier chapter with their discoveries intact; an E2 player opens to the Steamworks chapter and clicks "The Frontier ✓" to revisit early pages. Verified in `ledger-era-chapters.spec.ts` (no `?debug`).
