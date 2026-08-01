CODEX: model=gpt-5.6-sol effort=high
# lane-survive-copy — the cards stop promising a defense the engine does not hold
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner ruling 2026-08-01: "keep it as it is for now and switch the word to survive, that is ok" — option C of reviews/e1-gameplay-depth.md F-E1-6): E1's only defeat is hero death, but card/briefing copy says "hold/defend/secure the claim". The words change to match the engine. MQ-7 card-truth law.
READ-FIRST: DRAFT-e1-hold-the-claim.md (the fork context — you implement C's COPY half only) · all five E1 contract entries' name/description/briefing/goals copy (assets/contracts/epoch-1-frontier/contracts.json) · the owner's Twin Banks confusion (BACKLOG, 2026-07-2x: "'Secure the south claim, then decide how far north to build.' I just built my base somewhere, not need to secure anything?") — that exact line is in scope · e2e specs asserting card copy (update expectations faithfully, never weaken).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Sweep the five E1 cards' player-facing copy: where the ONLY real condition is surviving N waves, the copy SAYS survive/last/outlast plainly (house voice; "hold"/"defend"/"secure the stake" phrasing goes unless a mechanic backs it). Twin Banks' south-claim line rewritten to what the map actually asks. 2. The pause/win overview wording consistent with the same truth (LOCKED-WIN copy untouched in meaning). 3. E2+ cards OUT OF SCOPE (post-launch pass rides the census ladder). 4. Update copy-asserting specs.
TOUCH-ONLY: E1 contract copy fields · the copy-asserting e2e expectations. NO: mechanics, Balance, lossCondition field (sibling task), E2+ files.
SELF-CHECK: both projects green · release-build suite green (copy shows there) · tsc + build · card screenshots desktop+390px into artifacts/survive-copy/.
READY-FOR-GATES + report: before/after copy table for every changed line.
