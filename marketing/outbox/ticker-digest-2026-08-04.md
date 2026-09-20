# Ticker digest — 2026-08-04 (TK-01, compiled s1457 fire 2026-08-05 ~19:2x local — LATE, and the reason matters)

Micro-headlines from the day's ACTUAL merges, classified by **touched paths on main's first-parent
walk**, never by commit messages (Mistake #16 guard). Classifier committed at
`artifacts/tk-2026-08-04/classify.mjs`, so every count below is re-derivable. Owner approves the whole
digest in one action; publication stays owner-only.

⏰ **THIS DIGEST IS A DAY LATE, AND THE GAP IS THE DAY'S REAL HEADLINE.** TK-01 says the first fire after
06:00 local compiles yesterday's merges. No fire ran. At **07:00 on 08-04 the factory's Claude access was
cut** — every scheduled fire from then until **17:43 on 08-05** died in about two seconds on *"Your
organization has disabled Claude subscription access for Claude Code"*. That is **~34 hours**, roughly
**400 consecutive dead fire starts** in `logs/fire-20260805.log`. The owner's token fix landed `02bea28c`
at 17:33 on 08-05. So this digest covers a day that ended mid-sentence.

**The shape of the day, measured:** **93 commits** on main's first-parent walk, **9** of them merge
commits. **15** touched player-visible paths (`src/`, `public/`, `assets/`). **3** touched the factory's
own tools and nets. **75 were bookkeeping** — the ledger talking to itself.

⚠️ **One honest caveat about that 15.** The classifier counts paths, not intent, so `3b6f620e` — the
s1455 ledger-guard commit — lands in the player bucket because it incidentally touched files under those
roots. Read it as 14 player-facing merges plus one that the rule catches by the letter. Stating this
rather than hand-tuning the classifier: a classifier you quietly adjust until it agrees with you has
stopped being an instrument.

---

## The day in micro-headlines

**The training ground finished being furnished.** The Drill Yard's three stations reached the player at
last, after two fires in which the wiring existed and the art did not. `e212cc5c` · and the same drain
found that **every keyed sprite in the project had been wearing a magenta halo** — cured as a class, not
an instance, at `c29040e7`.

**The Baron's banner pole stopped being a magenta stick.** `eea41d6e` — the halo cure's first customer.

**The bell stopped being a gallows.** An art retake, rejected once on that exact reading and accepted on
the second pass. `f6d8f766` (retake) after `e4359441` (2 of 3 props accepted).

**The Baron sieges instead of stalling.** `e4ea0993` — F-BW-16 from the owner's 08-03 playtest.

**Enemies slide toward their goal, not their sign.** `531bd923` — F-BW-10, same playtest.

**Town sky C is what you boot into now.** Owner ruling, same day. `7c833197`

**The Herald's first issue stopped teaching the same keys twice**, and a suspend-rejection notice that
had been shouting at the player went internal-only. Both owner rulings of 08-04. `ba247f11` · `b561735c`

**Three round-2 beauty drains landed** — pools, atmos, and the conflict repairs that let the rest of the
beauty program re-land rather than be hand-grafted. `7267f78e` · `e17793a6` · `7dcae7cb`

**The factory grew its twelfth ledger guard**, which mechanizes a class a hand sweep had just missed
twice: a review that says HOLD for a slice that has since shipped. `3b6f620e`

---

**NO OWNER CHOICE anywhere in this digest.** Every item above is either an owner ruling already given, or
a finding closed against evidence. The one thing worth the owner's minute is not in the merges at all:
**the 34-hour outage was invisible to everything except the fire log** — no alert, no notice, and the
factory's own status line still read ACTIVE from a fire that had died. That is the gap worth closing.
