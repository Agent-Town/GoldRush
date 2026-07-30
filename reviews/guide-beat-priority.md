# guide-beat-priority — teaching holds the floor

**Slice:** `tasks/lane-guide-beat-priority.md` (owner-authored, `4ee9c12f` 2026-07-30)
**Branch/tip:** `lane/perf` @ `f2a056c8` (lane-d runner, 2026-07-30T10:29+07)
**Merged as:** `6f343a6e` (graft onto clean main, s1254 fire)
**Base:** `f2a056c8`'s parent `6999e57a` — 176 commits behind main, so the two-dot
`main..lane/perf` diff is 320 files / 53,897 deletions of pure stale-base phantom. Classification
was done on the COMMIT, not the branch.

## VERDICT: MERGE — scope met, one finding about the master's premise (non-blocking, F-1254-2).

## What it does

`src/game/Game.ts` gives first-run Trail Guide beats a dwell floor and a queue. `speakTrailGuide`
no longer overwrites a displayed beat: if `trailGuideLine` is set, the new bark is pushed onto
`pendingTrailGuideLines` and the current beat keeps the slot. A new `showTrailGuide` arms a
`TRAIL_GUIDE_DWELL_MS = 4_000` timer alongside the existing once-only pointer/key dismissal;
`dismissTrailGuide` shifts the queue and shows the next beat, or falls through to `syncUi()`.
The timer is cleared on teardown beside `baronAnnouncementTimer`. Post-teaching barks are
untouched — they keep today's bounded newest-first eight-entry feed.

Player-visible: a new prospector who levels up while the movement lesson is on screen now reads
the movement lesson, then the level-up lesson, instead of losing the first to the second.

## Evidence

| gate | command | result |
|---|---|---|
| types | `npx tsc --noEmit` | rc=0, 3.9 s |
| build | `npm run build` | rc=0, 25.0 s |
| own spec | `playwright test e2e/trail-guide-beat-priority.spec.ts` | **2/2 rc=0**, both projects, spec asserts `{console: [], page: []}` |
| adjacent — guide | `trail-guide.spec.ts --workers=1` | **12/12 rc=0**, 1.8 m |
| adjacent — feed | `m4-06 + m4-10 + polish-03 + sci-03 --workers=1` | **39/39 rc=0**, 4.3 m |
| **control** | same spec vs HEAD's pre-slice `Game.ts` | **2/2 RED at spec:86**, subject restored byte-identical |

Adjacent set derived by grep, not from the runner's list:
`grep -rln "trailGuide\|trail-guide\|Trail Guide\|agent-feed\|receiptFeed" e2e` → the five files above.

Screenshots: `artifacts/trail-guide-beat-priority/{desktop,mobile}-chrome-storm.png` (full-page,
both projects, taken by the spec itself while the guide beat holds the slot under the storm).

### The control arm is the part worth reading

Running the slice's own new spec against `HEAD`'s pre-slice `Game.ts` — spec and artifacts grafted,
subject reverted — reds **2/2 on both projects at `e2e/trail-guide-beat-priority.spec.ts:86`**,
the assertion that the movement beat is still on screen after an XP grant fires the level-up beat.
Received string without the slice: *"The trail has taught you something…"* — i.e. the second guide
beat had already overwritten the first. Harness: `logs/session-scratch/s1254/control-prefix-game.mjs`,
transcript alongside it; `src/game/Game.ts` restored and proved byte-identical by sha256 prefix.

So the slice is load-bearing and the spec is not decorative. **But see F-1254-2 — one of its two
arms is.**

## Findings

### F-1254-2 — the master named a mechanism that was already false, and the spec inherited it (NON-BLOCKING, no corrective owed)

`tasks/lane-guide-beat-priority.md:4` states the defect as: *"hud-agent-feed is a SINGLE-SLOT live
region — under load, combat/sim barks … OVERTAKE first-run Trail Guide beats"*, and scope item 1
asks that non-guide barks queue behind a displayed beat.

**That could not happen at HEAD.** `src/game/Game.ts:5435` builds the feed as
`this.trailGuideLine ? ['Guide: ' + this.trailGuideLine, ...state.receiptFeed] : …`, and
`src/ui/Hud.ts:261` renders `receiptFeed[0]`. While a guide line is set it is *structurally*
slot 0; no volume of ordinary barks can displace it.

**Measured, not reasoned:** in the control arm above, the pre-slice tree walked straight past the
spec's bark-storm assertion (`spec:76`, still showing "Move with the trail" after 12 `panAt` barks)
and failed only at `spec:86`. **The bark-storm arm passes with and without the slice — it is
vacuous**, in exactly the sense s1253 recorded about its own mutation: a green under a control is a
claim about the arm, not about the subject.

The real defect is **guide-over-guide overwrite** plus the absence of any dwell — a beat lived until
the player happened to press something, or until the next beat replaced it. That is what the runner
diagnosed and fixed, and its report describes it correctly ("Guide lessons queue FIFO"). The master's
WHY paragraph and the spec's first arm are the parts that are wrong.

➡️ **Not blocking and no corrective task:** the shipped behaviour is right, the spec's second arm is
a real discriminator, and the vacuous arm is harmless as a regression fence for the prepend at
`Game.ts:5435`. It is recorded so nobody later cites `spec:76` as proof that bark suppression works —
there is no bark suppression, because none was needed.

### F-1254-3 — the 4 s dwell is a design number nobody ratified (OWNER, cheap)

The master said "choose a dwell floor honest for reading, ~4-6s" and the runner chose the floor of
that range. A slow reader on a first run gets 4 s per lesson, and lessons now serialise, so three
queued beats take 12 s to clear. Nothing about that is wrong, but it is a teaching-pace decision
sitting in a `const`. One word from the owner pins it; `TRAIL_GUIDE_DWELL_MS` at `Game.ts:315` is
the only edit.

## Merge classification

Base `6999e57a` is 176 behind main, so no branch-level merge was attempted. `git cherry-pick -n
f2a056c8` auto-merged `src/game/Game.ts` with **no conflict** (main had moved the file, but not in
the four hunks the slice touches). Per-file:

| file | classification |
|---|---|
| `src/game/Game.ts` | LANE-TOUCHED + MAIN-MOVED — auto-merged, verified by reading the staged diff: exactly the 21/-2 of `f2a056c8` |
| `e2e/trail-guide-beat-priority.spec.ts` | LANE-TOUCHED, pure add |
| `artifacts/trail-guide-beat-priority/*.png` (2) | LANE-TOUCHED, pure add (re-generated by this fire's own verification run; committed bytes are from the gated run) |

Nothing else from `lane/perf` was taken. Its other commit `6999e57a`
(`lane-d-standing-orders-wave-early-seam`) is a drained phantom — `reviews/standing-orders-wave-early-seam.md`
is present on main and absent from the stale branch, which is what produces its phantom deletion in
the two-dot diff.

## Process note on this drain (not a finding — a documented class I walked into)

The first adjacent battery was run at **default workers** and returned **15 failed / 36 passed**,
including three `trail-guide.spec.ts` tests that look exactly like a regression from a dwell change.
Re-run at `--workers=1` — the config the drain skill actually prescribes — the same suites returned
**51/51**. This is `logs/suite-red-inventory.md` F-1212-2 verbatim: *"a red in the drain minimum …
produced at default workers is not evidence of anything until re-run at --workers=1."* The lesson
is not new; the failure to apply it cost this fire roughly ten minutes and nearly produced a false
regression report against a correct slice.
