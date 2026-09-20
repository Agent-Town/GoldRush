# Ticker digest — 2026-08-20 (TK-01, compiled s2111 fire)

Yesterday's first-parent walk held **180 commits**: **30** merges, **28** touching `src/`, `public/`, or `assets/`, **12** factory changes, and **140** bookkeeping changes. Of the 28, their own drains reported **19** as player-visible and dismissed **9**. The path classifier is retained at `artifacts/tk-2026-08-20/classify.mjs`. Publication remains owner-only.

This is the largest day in the run — more merges than the previous five digest days combined.

## The day in micro-headlines

**The county's gold was never gone — the ground had swallowed it.** `52a03a8c`

**The seed caravan was always the mission — now the county says so.** `63821e05`

**Two lit bridges and one dark road across the half-life hollow.** `68011ece`

**The showroom will not be won by standing still.** `68784f78`

**A race is called on the deepwater claim.** `00bca998`

**Three hulls, and losing one is not losing the claim.** `00c2d7bf`

**The dead band swallows every signal.** `fb683021`

**The relay runs its front, but the ground will not have you.** `c61ed4dd`

**The caravan plants a green that stays.** `eb2689d1` `b13c0690`

**Your habits have a shadow, and the broadcast mirror answers back.** `1817cb27`

**Momentum is commitment: the low orbit returns you where you aimed.** `179c8dcb`

**The far side answers, with the wrong number.** `bd25af89`

**The fairground crowd flocks — but its door stays held.** `5feed8dd`

**Worn-out machines stop holding a place in the yard.** `f8d02574`

**The pool learns to recycle its oldest exhausted machine.** `ac9dcacf`

**The hill mine gives way to a declared progression.** `19dd85c0`

**The deepwater claim opens, and the dredge queen answers.** `26a364bf`

**The county closes its first ledger and opens a new season.** `23c3ea98`

## Not for the ticker

Two of yesterday's merges were **owner-reported from inside the game**, which is worth naming because it is the shortest path this factory has: `52a03a8c` (the buried seams — 29 of 33 maps had gold sitting under or above the ground, now 0.0000m residual) and `63821e05` (the seed caravan, invisible as a mission until the county said so out loud). Both were played, reported, and cured the same day.

One **owner choice closed itself inside the day**. `f8d02574` shipped with an open question — whether the pool layer should recycle too (F-CAP-2) — and `ac9dcacf` answered it that evening on the owner's own word, *"adopt"*. The remaining open choice from the day is the one attached to `19dd85c0`: whether the trestle and the incline get a pressure line of their own. It is on the desk as F-E2PA-6 and it is still unanswered.

The nine dismissals were their drainers' calls and this digest keeps them: two null-floor regenerations (`d931958b`, `95781c2f`), three manifest or census truth-passes (`39f141ca`, `d0d6daa4`, `e86e9d8e`), a clause strike (`9071811d`), a test cure (`6d367fc8`), an agent-facing skill document (`082340dd`), and the fairground lane-shift A/B whose lever ships at zero (`2f8d4b2b`).

**A note on this digest's own arithmetic, because it nearly under-reported the biggest day in the run.** The retained classifier is inherited from the previous day's, and the `2026-08-19` one had quietly lost the branch that lists a merge commit's files correctly — under a header comment asserting it was the same shape as its predecessor. `git show --name-only` prints a merge's *combined* diff, which is empty for any path that matches one parent, so a merge that lands player code reads as zero files. The four classifiers from `08-15` through `08-18` all carry the merge-safe branch; `08-19` does not. It caused no harm on the day it landed, because `08-19` had **zero merges** and so could not show a symptom. Yesterday had **thirty**. Inherited unchanged, it would have hidden 7 merges from this digest, **4 of them headlines above** — including the Dead Band, an entire new map, and the season roll. The restored classifier was controlled against the `08-15`-lineage method across all 180 commits and agrees on 180 of 180; the finding is filed as **F-2111-1**.

GZ-01 independently reports **113 reported · 25 dismissed · 0 candidates**.
