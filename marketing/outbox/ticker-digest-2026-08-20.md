# Ticker digest — 2026-08-20 (TK-01, compiled s2111 fire)

Yesterday's first-parent walk held **180 commits**: **30** merges, **28** touching `src/`, `public/`, or `assets/`, **12** factory changes, and **140** bookkeeping changes. Of the 28, their own drains reported **19** as player-visible and dismissed **9**. The path classifier is retained at `artifacts/tk-2026-08-20/classify.mjs`. Publication remains owner-only.

This is the largest day in the run — more merges than the previous five digest days combined.

## The day in micro-headlines

**The county's gold was never gone — the ground had swallowed it.** `e1550664`

**The seed caravan was always the mission — now the county says so.** `bdf8e236`

**Two lit bridges and one dark road across the half-life hollow.** `bb3ef65c`

**The showroom will not be won by standing still.** `64e446f7`

**A race is called on the deepwater claim.** `d13a54e5`

**Three hulls, and losing one is not losing the claim.** `19e77813`

**The dead band swallows every signal.** `20895457`

**The relay runs its front, but the ground will not have you.** `b3ed55bb`

**The caravan plants a green that stays.** `58751d11` `615fe351`

**Your habits have a shadow, and the broadcast mirror answers back.** `72da08d6`

**Momentum is commitment: the low orbit returns you where you aimed.** `2d71949d`

**The far side answers, with the wrong number.** `4193bf3b`

**The fairground crowd flocks — but its door stays held.** `6201f354`

**Worn-out machines stop holding a place in the yard.** `db3d1007`

**The pool learns to recycle its oldest exhausted machine.** `d8e204df`

**The hill mine gives way to a declared progression.** `cbdbf0b5`

**The deepwater claim opens, and the dredge queen answers.** `9dca8508`

**The county closes its first ledger and opens a new season.** `8086ee59`

## Not for the ticker

Two of yesterday's merges were **owner-reported from inside the game**, which is worth naming because it is the shortest path this factory has: `e1550664` (the buried seams — 29 of 33 maps had gold sitting under or above the ground, now 0.0000m residual) and `bdf8e236` (the seed caravan, invisible as a mission until the county said so out loud). Both were played, reported, and cured the same day.

One **owner choice closed itself inside the day**. `db3d1007` shipped with an open question — whether the pool layer should recycle too (F-CAP-2) — and `d8e204df` answered it that evening on the owner's own word, *"adopt"*. The remaining open choice from the day is the one attached to `cbdbf0b5`: whether the trestle and the incline get a pressure line of their own. It is on the desk as F-E2PA-6 and it is still unanswered.

The nine dismissals were their drainers' calls and this digest keeps them: two null-floor regenerations (`c7b280d2`, `d56cf93a`), three manifest or census truth-passes (`9d902829`, `5ca1c00c`, `fd6b6952`), a clause strike (`589dff64`), a test cure (`c06eba69`), an agent-facing skill document (`8b69d821`), and the fairground lane-shift A/B whose lever ships at zero (`953d8f02`).

**A note on this digest's own arithmetic, because it nearly under-reported the biggest day in the run.** The retained classifier is inherited from the previous day's, and the `2026-08-19` one had quietly lost the branch that lists a merge commit's files correctly — under a header comment asserting it was the same shape as its predecessor. `git show --name-only` prints a merge's *combined* diff, which is empty for any path that matches one parent, so a merge that lands player code reads as zero files. The four classifiers from `08-15` through `08-18` all carry the merge-safe branch; `08-19` does not. It caused no harm on the day it landed, because `08-19` had **zero merges** and so could not show a symptom. Yesterday had **thirty**. Inherited unchanged, it would have hidden 7 merges from this digest, **4 of them headlines above** — including the Dead Band, an entire new map, and the season roll. The restored classifier was controlled against the `08-15`-lineage method across all 180 commits and agrees on 180 of 180; the finding is filed as **F-2111-1**.

GZ-01 independently reports **113 reported · 25 dismissed · 0 candidates**.
