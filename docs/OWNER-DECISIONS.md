# The Owner's Decision List
STATUS: COMPILED 2026-08-22 at owner request ("make a list of all the decisions I have to take with explanations"). One entry per open decision: what it is, why it matters, the options, and the standing recommendation (rec first). Rulings land here as ANSWERED lines; the desk and this file retire rows together. Items needing no decision (pure work) are NOT listed.

## A. Launch line (the E1 release — in order)
1. **Your E1 walk.** The verification pipeline goes fully green once the agent-tape cure lands; your next full E1 playthrough becomes season 2's first verified rank and the launch's reference run. Decision: when.
2. **vE1.0 tag + the announcement with the bounty.** You ruled the bounty rides the announcement post. Decision: the announcement's timing + final text (draft on request).
3. **Outreach (new, from the harness-era note).** Three teams just cleared ARC-AGI-3 with LLM harnesses — the exact audience our door was built for. Options: name the gauntlet publicly as an ARC-3-successor target in the announcement · contact the teams directly · neither. REC: name it in the announcement; it costs nothing and the AEO surfaces already make the claim quietly.

## B. Benchmark law
4. **F-HARNESS-1 — is importing the open-source sim as a world model lawful for standings?** Tycho-class harnesses can plan against our true simulator instead of inducing a model. REC: lawful **with disclosure** — a `model-aided` field on standings, not a ban (a ban is unenforceable; the philosophy difference is exactly what a species-blind board should show).
5. **F-1653-2 — AP-15's three ratification questions.** The Assay of Minds spec ladder shipped ahead of its ratification; three owner questions sit unanswered in `specs/agent-play/ap-15-assay-of-minds.md` §Ratification. REC: one sitting with the spec open; the ladder already conforms to the drafted answers.
6. **F-1657-3 — what may the Crown reels claim to be?** The reels validate mechanically but may not be the historical runs they present as. Two readings; one word picks. REC: label them "reconstructions" (the humbler reading costs nothing and can be upgraded later).
7. **F-2080-3 — season results routing.** The encyclopedia's season pages need a two-axis mapping (season × epoch) the current API call doesn't send; a design fork, not a bug. REC: chronicle-only for season 1 (the option the fires priced), revisit at season 3.

## C. Game design & balance (most feed off your playtests — rule after feeling them)
8. **Canyon Works' wave-6 deadline (F-E2S-4) — NEWLY DECIDABLE.** A fire's census measured the fastest possible pylon chain reaching 1 of 2 required sites by the deadline: the declared objective appears unmeetable as authored. Options: widen the deadline · lower the requirement · keep as an elite razor. REC: widen by one wave; the evidence is attached to the row.
9. **The balance-later dials you already own** (post-playtest confirmations, no urgency): Stillwater strikeDamage=3 (the whole ladder is documented at the constant) · the Picnic's feel once the flip lands · whatever E2's finish ships. Decision: play, then confirm or retune each with one word.
10. **F-1193-3 — the two E2 enemy sheets with a wrong diagonal row.** Four art premises spent; options: accept coarse diagonals · fund a fifth attempt. REC: accept; the row's own history says the returns aren't there.
11. **F-1656-3 — the jumper's rotation sheet at 65-80% vs the ≥78% law.** Options: re-baseline the law · retake the sheet · declare it legacy. REC: re-baseline (it's the cheapest and eight fires already ran against it).
12. **F-E8LO-3 — the M8-5 world dispatch names a boss on a bossless map.** The lore beat can never fire. Options: re-key it to `secured:e8-low-orbit` (story trigger) · declare the beat dead · author a boss someday. REC: re-key; reversible data.
13. **F-1625-4 — what does the 25MB release budget govern?** Town transfer only, or the whole first load? REC: the row's option A (town transfer), matching what the gate already measures.
14. **F-DOOR-6(c) — publish build zones in the view's map block?** Optional enrichment; nothing blocked. REC: yes whenever a door slice touches that file anyway.

## D. Ops & repo
15. **F-1637-2 — the hardcoded production origin in e2e gates (re-priced URGENT-ADJACENT).** After the server migration, one constant (`GAME_API_ORIGIN`) is load-bearing for agenttown.app/goldrush. Decision: may gates reach the internet, and should the origin be env-resolved? REC: env-resolve with the current value as default; gates stay offline-capable.
16. **F-1501-3 — the 528MB pose library: main or branch?** The at-risk copy is now safe on `save/art-staging-20260822` (pushed). Decision: commit to main (repo grows ~530MB) or keep as a branch. REC: branch; main stays clonable.
17. **F-2054-1 + F-1507-1 + F-1182-2 — your machine, two minutes.** The fire timer menu (pause/slow if you ever want quiet), and the dual codex/Node split on your dotfiles (`npm install -g @openai/codex@latest` under Node 26 + align the nvm default). REC: run the two commands next time you're in a terminal; exact lines on request.
18. **F-1659-1 — install the health watchdog** (one `cp` + `launchctl load`, prepared long ago). REC: yes; it's the factory's smoke alarm.
19. **F-1510-1 — keep the citation go-around?** Mechanically cured; the design question ("is the go-around the right shape?") remains. REC: keep (the standing rec since s1610).

## E. Engine routing (RULED 2026-08-22, recorded)
Owner verbatim: "Can you also switch all the implementation work back to Codex? I have a lot of tokens there again and the Anthropic subscription just reset." — POLICY: all NEW implementation work routes to codex lanes as masters; the three in-flight Opus builds (Picnic flip, E2 finish, verification cure) finish where they are; fires stay on the triage engine.

## F. Cloudflare KV plan (you asked 2026-08-22: “not sure we have to continue to use it? then I will have to pay?”)
20. **Workers Paid, $5/mo — but only in announcement week.** The cap warning was our own idle verification worker reading all 41 boards every 15s (~236k reads/day vs 100k free) — fixed free the same day (3-min cadence now; a one-read poll slice is with codex). So: **no payment needed today, and no 429 risk**. AT LAUNCH the free tier's real cliff is the WRITE cap (1,000/day; every submission + verdict writes) — a few hundred players exceed it, and submissions failing during your announcement is the worst first impression. REC: keep KV (it runs the boards/accounts/slips at the edge; migrating to avoid $5/mo costs far more) and upgrade the account to Workers Paid in the week you announce, not before.
