# Drain review: `r2026w40` minted a week ahead, and the RT-01 cadence moved to Wednesday (attended, 2026-09-25)

**Branch** `rt/r2026w40` at `57f8f1662` · **merge** `73553e691` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 20:56Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `rt40`).

**Verdict: LANDED.**

### What it does
The weekly rotation for ISO week 40 (`r2026w40`, opens Monday 2026-09-28 00:00 UTC, closes 2026-10-05) is minted on the owner-held salt in the RT-01 form (`node scripts/rotation-mint.mjs --week 2026-W40 --salt-file ~/.goldrush/rotation-salt --append`), six seeds, appended to `assets/rotations/rotation-seeds.json` a week ahead instead of on the Sunday before. Why now: `live-seed-rotation-1` makes every human ride the open week's seed, and a bundle that does not know the coming week falls back to the closed one, whose standings the door refuses (`rotation_closed`) until a deploy lands (F-LSR1-2). Week 39 was minted three days late; this landing and the amended RT-01 cadence (the first fire after Wednesday 00:00 UTC, in `scripts/fire.md`) keep that from recurring. Where the player sees it: on Monday the Ride Together card says "Week 40 claim" and the county board opens the week's partition; nothing changes before then.

### Measured
Registry 3 to 4 rotations, 13 lines added, the week's window and six contract seeds present; the rotation-derivation guard green; the registry stays outside the engine identity corpus, so the engine hash does not move. Deployed with this landing so the bundle carries the week before it opens.

### Merge classification
LANE-TOUCHED: `assets/rotations/rotation-seeds.json` (append only, sorted by opensAt), `scripts/fire.md` (the RT-01 cadence amendment). Nothing else.

### Findings
- **F-RT40-1 (law, done in this landing):** RT-01 minted the coming Monday's rotation on the first fire after Sunday 00:00 UTC, one day ahead, which was fine while only agents rode rotation seeds; with humans on the live seed the mint and its deploy must both land before Monday. Amended to the first fire after Wednesday 00:00 UTC (veto window: one word restores Sunday).

### Battery attribution (drain, 15:00Z)
The `board-tape-gold` browser-door row timed out at 145 s in the chain battery while other batteries ran on the host (1-minute load 11 to 36 during the run); the branch touches the rotation registry, `scripts/fire.md` and the `public/skill.md` block, nothing the door or the browser boot reads. Allowed for this landing only.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 143 ℹ fail 0` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1012 ℹ fail 1 ℹ skipped 5  15:09Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
