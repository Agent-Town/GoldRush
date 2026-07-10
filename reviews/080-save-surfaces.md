# Review — 080-save-surfaces (lane/m3 @ 4740246)

**Slice/branch/tip:** 080-save-surfaces · `lane/m3` · `4740246 fix: harden account save surfaces`
**Base:** `1b42167` (2026-07-10 19:28) · **Drain fire:** s290 (2026-07-10T22:22Z)
**Verdict:** ⛔ NOT MERGED — **RE-LAND required** (stale-fork against sibling 076). Salvage pinned at `save/080-save-surfaces` (`4740246`). Corrective queued: `tasks/queue/lane-a/080b-save-surfaces-reland.md`.

## What it does (the salvage)
080 implements the remaining three of MP-004's five save surfaces: (1) page-exit flush via `pagehide`/`visibilitychange` keepalive push; (2) blank-device profile discovery via a new authenticated `/api/save/profiles` route; (3) a KV atomicity redesign replacing the `key:v1..v5` rotation with an immutable-entry store. Self-gated green on its own base: `npm run build` pass, `npm run test:accounts` = 39 checks pass, accounts playwright = 12 pass, `git diff --check` clean.

## Why it does not merge (the fork — verified, not inferred)
`git merge --no-ff lane/m3` onto `main@de348f1` → **4 conflicted files, 7 hunks**, all on the account-save write-path that sibling **076-save-transfer-atomicity** (`85dfade`, SHIPPED) and 069 (`dc743a1`) already moved on main. 080 branched at `1b42167` — BEFORE 076 landed — so it has no knowledge of 076's optimistic-concurrency protocol:

| File | HEAD (main, post-076) | lane/m3 (080) | Why not choose-a-side |
|------|----------------------|---------------|-----------------------|
| `functions/api/_accounts.ts` ~L195 | `stale_save` check (`baseSavedAt` vs `previousSave.savedAt`, `acknowledgeConflict`) THEN `key:v1..v5` rotation | deletes the whole block → immutable-entry store | dropping HEAD loses conflict detection; keeping HEAD loses 080's atomicity — must reconcile |
| `src/game/AccountSync.ts` ~L180 | push sends `baseSavedAt`+`acknowledgeConflict`, catches `stale_save`→`openCloudCompare` | push sends `{ keepalive }`, no conflict params | re-landed push needs BOTH keepalive AND the conflict protocol |
| `src/game/AccountSync.ts` ~L43 | `SaveVersionSummary` types | adds `SaveProfileSummary`/`SaveProfilesResponse`, loosens `SaveVersionsResponse` | additive, but rides the same file |
| `e2e/accounts-sync.spec.ts` ~L111, `playwright.accounts.config.ts` ~L3/L35 | 076's suites + config | 080's new suites + ports | mechanical, but gated by the above |

The `_accounts.ts` conflict is **semantic, not textual**: 076's `stale_save` READ depends on the storage model 080 replaces. Reconciling two atomicity models on save-persistence code by hand = inventing a resolution where a subtle error silently drops a family's saves (CLAUDE.md Mistake #15). Base is only ~3h old (below the 12h auto-re-land bar), but the fork is on the one surface where hand-merge is most dangerous → RE-LAND is the correct call anyway.

## Findings
- **F-080-1 (RE-LAND, corrective queued):** 080's three surfaces re-implement on current main integrated with 076's `stale_save` protocol. Task `080b-save-surfaces-reland.md` carries the exact integration points (push must send keepalive + conflict params; the new store must still fire `stale_save`; a new regression proves it). Salvage: `save/080-save-surfaces@4740246`. On merge of 080b, rename `save/080-save-surfaces` → `archive/080-save-surfaces`.
- **F-080-2 (process, non-blocking):** 080 was authored/dispatched to lane-a while 069/076 were in flight on the same files in another lane — parallel tasks on the same write-path guarantee this fork. Future save-surface slices on `_accounts.ts`/`AccountSync.ts` should serialize behind their siblings, or be authored against the sibling's expected post-merge shape.
