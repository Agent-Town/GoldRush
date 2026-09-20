# Review: youngsters-rechain-batch — the two youngsters descend from the children the game ships (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-07)

**Slice/branch/tip:** `youngsters-rechain-batch` · `art/youngsters-rechain` · commits `3fd279546`, `caed4a0ff` on base `503d7f283 (archive: pruned by the A3 rewrite)` · merged to main as `9bbece8cf`, made and gated in the slice's own worktree detached at main and landed with `git merge --ff-only`.
**Verdict:** MERGED. Owner A12 option (b) done: Higgsfield batch 4 re-prompted the two E2 youngsters against the shipped E1 portraits by upload id with the sexes as the art has them (A the boy with the shiny rock, B the girl with the slate of sums; the batch-2 pair had been minted with no reference and the sexes swapped, F-AGE2-1), then chained E4 from E2 and A's E8 from E4; five plates processed with the row-60 recipe (proved byte-identical on three shipped plates first) and registered as `youngster-a-e2`, `youngster-b-e2`, `youngster-a-e4`, `youngster-b-e4`, `youngster-a-e8` (93 speakers), each with no beat on row 74's precedent (THE CLERK LINE is A's future consumer). Eyes-on accepted all five against the E1 children at 384 px, the CSS-derived card crop and 120 px (the same flat cap, curls, freckles and smile on the boy; the same hat, braids and neckerchief on the girl); the old withheld raws stay on disk.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Plates | worktree | a-e2 127.2 · b-e2 136.3 · a-e4 128.2 · b-e4 136.7 · a-e8 129.6 (corner means; 10/10 corners above 120, lowest 126.8); centroids 193.8–196.3; 384×384 3-channel, 0 transparent, 0 magenta, alpha drop lossless; +1.46 MB on `dist/`, none in the first load (the payload declaration names only the two E1 youngster plates) |
| Generation | `artifacts/youngsters-rechain/generation.jsonl` | 7 requests for 5 accepted plates (one transient, one rejected by the band gate at 121.6); every row `referenced: true`; about 39 credits |
| Speakers | worktree | 5 new, 93 total; 0 beats re-keyed (no file names the ids) |
| Probe (implementer) | port 5314, both projects | 2/2: plain boot, no `?debug`, the real beat queue drained, all 93 portraits decode |
| **Attended, merged tree `9bbece8cf`** | tsc / build | rc 0 / rc 0 (`dist/` 298 MB) |
| | engine era | merged-tree hash `df7eef83…` pinned (`speakers.ts` alone moves it) |
| | named guards | halo PASS 811/264/1400 · `no-emdash-guard` 1/1 · `no-emdash-scan-space-guard` 8/8 · `citation-title-guard` 18/18 · `worker-type-coverage` 1/1 |
| | e2e, port 5314, both projects, one worker | the probe 2/2 (14.7 s), zero console/page errors |
| | full `test:node-guards` | on main after the fast-forward (the sparse worktree cannot run the corpus rows); result in the deploy row |

Screenshots: `reviews/shots-youngsters-rechain/` (the repair sheet: E1 children, the withheld batch-2 pair, the new plates; the plain-boot cards). Tooling retained: `artifacts/youngsters-rechain/{plate-tool,contact,card,faces}.mjs`.

## Merge classification
Base `503d7f283 (archive: pruned by the A3 rewrite)`; main moved by the A11 budget, the rulings and fire commits; no overlap but `tasks/BACKLOG.md` (merged cleanly). Five plates, the LEDGER row, `speakers.ts`, the halo denominator, the screenshots and tooling: LANE-TOUCHED / NEW. Attended additions: the pin, this review, the ledger rows, the goal flip.

## Findings
- **F-YR-1 (OWNER'S DESK A17):** the youngsters have names in the town, Pip (`townsfolk.ts:156`) and Juniper (`:176`), and the lore uses them; the story cards say "Youngster A" / "Youngster B" as the shipped E1 entries do (the card takes the role where the town uses the name, the clerk's convention). One word puts the names on the cards.
- **F-YR-2 (recorded):** the aging is gentle at E4 (late twenties beside their E2 for a +26-year clause); identity intact; a batch-wide property of the referenced recipe.
- **F-YR-3 (fires' queue):** LEDGER row 75 is a broken table row (an unescaped regex alternation splits it into 10 cells); escape the pipes.
- **F-YR-4:** F-A8-1 reproduced (the E1 queue head `ledger-page:the_claim` outranks the founding welcome on a plain boot); already on the fires' queue.
- **F-YR-5 (recorded, the Elder's precedent):** the town's full-body sprites do not age with the epoch (`townsfolk.ts:165`, `:185` bind one sheet per youngster); from E2 on the portraits are adults while the walking actors are the E1 children. A walk-sheet batch is the cure when the owner wants it.
