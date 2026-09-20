# era-five-replayed-board — era 5 "the Replayed Board"

**Slice:** `era-five-replayed-board` (lane-d) · **branch tip:** `12f301aba` · **merge:** `9b5603fd2b442c231ea525a3e521b9593b384a68` · **gated by:** s2397, worktree `gate-s2395`

## VERDICT: MERGED — every scope item delivered, every self-check leg green, three findings all non-blocking (one is owner-facing).

## What it does
The owner ruled (2026-08-31, verbatim): *"lets fix this and make a new era - we don't need stuff in the leaderboards that does not get replayed. This message blocks me from viewing the game. It would also be good to see amount of gold and health during the replay."* Three sentences, three mechanisms.

Era **5, "the Replayed Board"** is declared — a BOARD-LAW era, exactly as era 3 was a declaration-law era: simulation behaviour did not change, the rules about which standings *count* did. `assets/engine-era.json` gains era 5 with a fresh single-pin lineage, and era 4 retires into `history`.

The **replayable-board law** is read-side and non-destructive. `isRankedRow` now requires the row's reel to announce the current era and one of that era's recorded pins; rows failing the test are excluded from the ranked board *and* from rank minting, while `retainUnranked` keeps them in storage untouched — the retention law honoured exactly. The board response gains `retiredCount` beside `rejectedCount`, so a board that shrank says so out loud instead of quietly. Submission-side, a reel without current-era papers is refused at the door (`reel_not_current`) rather than stored-then-invisible.

The **era-refusal card** becomes compact and genuinely dismissible — `Back to shelf`, Escape, and click-outside all work, and `closeRunTapeReplay` now disposes the true driver, clears the show, unpauses the sim and restores the time scale before handing control back. The owner can never again be walled out of his own town by an honest refusal.

The **replay HUD** folds live gold and Keeper health into the playback status line beside wave/time, updating each displayed tick.

## Evidence (measured this fire, on the merged tree, in `gate-s2395`)

| Gate | Result | Cost |
|---|---|---|
| `npx tsc --noEmit` | **rc=0**, 0 errors, 0 B stdout | 5.9 s |
| `npm run build` | **rc=0**, asset-diet ceilings respected | 28.6 s |
| `npm run test:node-guards` | **rc=0**, zero `not ok`, `engine-era-guard` blesses the era-5 declaration | **1329.7 s** |
| `npm run test:stats` | **rc=0** — stats 87 · standings **kv 180** · standings **sqlite 180** · ledger worker 19 | 10.2 s |
| `e2e/agent-reels.spec.ts` (desktop + mobile, `--workers=1`) | **14/14 passed** | 93.0 s |
| `e2e/lb-01-county-standings.spec.ts` + `e2e/milk-county-board.spec.ts` (both projects) | **44/44 passed** | 84.6 s |
| Console/page errors | **zero** — each spec asserts `expect(errors).toEqual([])` | — |
| Screenshots | `reviews/shots-era-five/{desktop,mobile}-chrome-{hud,refusal}.png` | desktop + 390 px |

**Mistake #10 discharged:** two of the 14 agent-reels tests are plain-boot, no-`?debug` WATCH paths — the player reaches both the working reel and the honest refusal without a debug flag.

**Both storage arms** were exercised for the retirement filter (kv and sqlite, 180 checks each), which is what scope 7(a) demanded.

## Merge classification
- **Base:** the trial merge `b9067b2f0` = main `16ac96702` × lane/d `12f301aba`, built by s2395 before it died.
- Between `16ac96702` and my merge base, main moved by **STATUS.md only** (`git diff --stat 16ac96702 main` → 1 file, the lock/stamp lines). No lane-touched path moved on main, so the trial resolution and a fresh one are identical by construction — verified, not assumed.
- **One conflict, `tasks/BACKLOG.md`:** main carried s2394's `F-2393-3 CURED` row (landed after lane/d branched); the lane carried its own updated era-5 row. Resolved by taking the **gated trial's** resolution, which is a proper **union** — both rows kept, nothing retired. This is the resolution the entire battery above ran against.
- **Verification that I landed what I gated:** after resolution, `git diff b9067b2f0 -- assets/engine-era.json e2e functions public scripts src tasks/BACKLOG.md` was **EMPTY** — the merged tree is byte-identical to the gated tree across every lane-touched path.
- All other files auto-merged clean. `main..lane/d` is now **0** — fully drained, no residue.

## Findings

### F-2397-1 (non-blocking, corrective owed) — the lineage membership predicate now has THREE implementations and no guard asserts they agree
The master asked for the membership test to be *"reused from era-pin-lineage — ONE implementation, cite where it lives."* The slice instead adds a third copy, `currentLineageRefusal` in `functions/api/standings.ts`, beside the two that already existed: `src/game/Game.ts:7021` (the show) and `scripts/assay-worker.mjs:91` (the assayer).

**This is not the runner's invention** — two of the three predate this slice, and the master's own firewall forbids touching the worker's copy. It is also not trivially curable: the three live in a browser bundle, a node worker and a Cloudflare Pages Function, so a literal shared import is a real (small) piece of design work, not a rename.

All three agree **today** — verified by reading each. The defect is that nothing would tell us when they stop. This is the repo's own *"cured defect survives in the sibling script"* / *"fix the CLASS, not the instance"* pattern, and the correct cure is one extracted predicate plus a guard asserting all call sites use it.

### F-2397-2 (non-blocking, corrective owed) — era-pin-lineage's core multi-pin property is now asserted nowhere
`scripts/assay-worker.test.mjs` **deleted** its `matching-round2-lineage` arm — the one asserting that a tape carrying an *earlier* pin of the *same* era still verifies. That is precisely the property `era-pin-lineage` (s2393, `ab6c0c738`) was built to deliver, one fire ago.

The deletion is **forced, not careless**: era 5 seeds a fresh single-pin array, so the old `pins.find(startsWith('d5b04061'))` lookup has nothing to find and its `assert.ok` would fail. But the right cure was to seed a second pin into a **fixture-local** registry and keep the arm, not to remove coverage of a mechanism that is now load-bearing for every board decision. The mechanism itself is intact and exercised indirectly (`pins.some` runs in all three consumers); what is gone is the guard.

### F-2397-3 (OWNER-FACING — no defect, the law working, but he should hear it from us first)
Era 5 starts a **fresh** lineage, so the replayable-board law retires **both** the era-3 and era-4 crowns. **The county boards now hold no crown at all until someone submits an era-5 run.**

Most pointedly: the owner's heat-7 crown reel (`d5b04061`, era 4) — which s2393 got *admitted* one fire ago, and which he has been chasing across three sessions — is now a **stale deep link** that refuses. There is a test asserting exactly this (`the heat-7 era-4 crown is now a stale deep link and refuses under era 5`).

This follows directly from his own ruling, and the refusal it produces is now dismissible precisely so it cannot trap him. **The runner deserves credit here:** the master predicted the wrong consequence (scope 7(d) said *"the era-3 row retired"*, leaving the era-4 crown standing), and rather than bend the filter to match the master, the runner delivered the truthful outcome and corrected the BACKLOG row to say so. That is the no-op/honesty guard working as designed — *"if the retirement filter would empty a board entirely, that is the LAW working; do not soften the filter."*

**No action is taken on this.** It is on the owner's desk because an empty crown board is the kind of thing he should learn from a note, not from a screenshot.

## Notes
- `data-testid="lantern-true-hud"` was removed and its content folded into the playback status line. Checked before merging: **no spec or source referenced it** outside its own definition, and the move *widens* gold/health from true-reel playback only to every replay — a strict improvement against the owner's third sentence.
- `public/skill.md` carries the new law, and the skill.md guard re-pinned in the same commit.
