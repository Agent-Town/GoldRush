# Drain review: `door-tape-grammar-3`, the door refuses what the client refuses for three verbs (Opus 5.5 implementer at max effort; F-DTG2-2)

**Branch** `fix/door-tape-grammar-3` at `0515f4b0d` · **merge** `8eca6385e` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 19:34Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `dtg3`).

**Verdict: LANDED.**

### What it does
The third door-grammar slice (Opus 5.5 implementer at max effort; F-DTG2-2) makes the door refuse exactly what the client's own normalizer refuses for three verbs, by importing that normalizer (`normalizeLockstepAction`) behind a new `clientRefusesAction` gate applied at the door only: a `place_build` or `pick_upgrade` whose id trims to nothing, and a `set_agent_ability` whose trimmed ability is not one of the client's five. Every old door bound stays (ids with edge whitespace, `' auto_pan '`, a `place_build` naming no building are still accepted, each pinned by a row). RED first: three such reels were stored and ranked on the base (`[200, true]` three times) and are refused `400 bad_payload` at the tip; a manufactured already-stored row of each shape, in a primary entry and in a second rider's stream, goes from ranked to retired at read (board 0, `retiredCount` 1, bytes unchanged, `?reel=` still 200, `?verdict=` `ranked: false`) instead of being dropped, which the naive read-side refusal would have done. `src/` byte-identical; the same-game audit unchanged (its verb set is untouched). Where the player sees it: a reel that the Lantern and the assayer cannot load can no longer be ranked.

### Measured
`scripts/test-standings.mjs` 467 to 514 per backend (23 client-grammar rows and 24 retirement rows per backend; every existing row green); all 8 mutations red, the control green; a 79-row door-versus-client probe moves exactly the 7 targeted rows (door-looser 13 to 6, door-tighter 14 unchanged, read verdicts unchanged). tsc and build green; test:accounts, test:mp and test:stats green under the lock; node-guards 1,008 of 1,018 with the worktree reds identical on a clean-base control (two backup-pull rows and the sweep's fill-gaps child needing `.env.local`, contention, a browser-boot timeout under two batteries that cannot reach the change).

### Merge classification
LANE-TOUCHED: `functions/api/standings.ts` (`clientRefusesAction` and its gate inside `validateTape`, the retirement walk), `scripts/test-standings.mjs`, `artifacts/door-tape-grammar-3/**`. Dry merges clean with main, kv2 and the audit slice.

### Findings
- **F-DTG3-1 (`door-tape-grammar-4`, authored in this drain for the same implementer):** the door is still looser than the client for `research_pick` ids and `context_action` target ids (6 probe rows); one line in `CLIENT_JUDGED_ACTIONS` plus rows.
- **F-DTG3-2 (a slice, inferred):** the assay queue still serves pending rows the grammar retired and the instrument ends them `unassayable`.
- **F-DTG3-3 (latent, measured):** a stored row whose embedded recording carries a client-refused action is dropped at read; unreachable today.
- **F-DTG3-4 (information):** the door is tighter than the client in 14 probe rows none of which the recorder can write. **F-DTG3-5:** the comment above `validateTape` is stale (grammar-4 fixes it).

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 140 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the three functions gates | `accounts rc=0 / mp rc=0 / stats rc=0` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1018 ℹ pass 1013 ℹ fail 0 ℹ skipped 5 ℹ tests 82 ℹ pass 82 ℹ fail 0 ℹ skipped 0  19:34Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
