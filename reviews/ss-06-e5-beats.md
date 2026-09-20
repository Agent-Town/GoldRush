# Review: ss-06-e5-beats — the Deepwater Claim chapter as data (lane-c, Claude Opus 5 implementer, attended drain 2026-09-05 night)

**Slice/branch/tip:** `ss-06-e5-beats` · `lane/c` · commits `a9d4ae2b4` … `a436a92f4` (five) over `ae5332094` · merge `b9c4146cc` (no-ff; beats.ts and StoryRuntime unioned in era order beside E4 and E6, which landed first).
**Verdict:** MERGED. E5 has its chapter: 14 beats loaded only in `epoch-5-deepwater`, all 17 storybook citations opened and read back, five plates verified on disk, no speaker and no signal invented, both Gazette beats keeping the mystery law.

## Evidence
| Gate | Result |
|---|---|
| `e2e/ss-06-e5-beats.spec.ts` (runner, own port 5303, plain boot) | 8/8 desktop + 390px, zero console/page errors; negative arms: E1 and E2 load no `e5-` beat |
| Adjacent `ss-01`..`ss-04` + `story-loop` | 30/38: six are F-2460-2 (control-proven again), two desktop-only load flakes (`ss-01:169`, `:187`) green in isolation |
| Runner `test:node-guards` (node 26) | 699/706: the era pin (owed), its `bench-seeds` twin and their `fixture-teardown` cascade, `desk-declaration` (refuses from a linked worktree by design), `node-guards-contention` (`ENOBUFS` under load, 1/1 alone) |
| tsc / build / emdash guards | clean / green / 9/9 |
| Attended on the merged tree | see the drain commit message |
Screenshots: `reviews/shots-ss-06-e5-beats/{desktop,mobile}-chrome-{arrival,manifest,rebuild,tide-teller,deepwater-ride}.png` (5.9 MB).

## Findings
- **F-SS06-1 (art, fire-authorable):** the chapter's harbormaster, tide-teller, cannery-hand, shipwright and pearl-diver have no registered speaker or processed portrait; voiced through registered speakers as `ss-04` voiced the twins. A portrait batch + `speakers.ts` rows is the cure (same class as F-SS07-2).
- **F-SS06-2 (design note):** `run-return-town` carries no contract id (`signals.ts:11`), so post-run E5 beats gate on `hasStoryBeatSeen` of an earlier E5 beat, the construction `e3-tavern-twins-defect` uses. A contract-aware return signal would make this cleaner; not added under the honesty guard.
- **F-SS06-3 (merge shape, recorded):** three chapters appended at the same point after `E3_STORY_BEATS`; git aligned their identical structural lines as context and interleaved them, so the drain rebuilt the file as base + E4 + E5 + E6 + one trailing export and unioned the runtime import and switches by hand.
