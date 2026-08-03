CODEX: model=gpt-5.6-sol effort=high
# lane-drill-yard-separation — the yard stops dressing like a claim
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner playtest 2026-08-03, verbatim: "The drill yard has to be separate - this is confusing. I started it by accident - it has to be clearly marked as a training ground."): the yard card sits among real contracts with contract styling — visual parity caused an accidental launch.
READ-FIRST: the tavern board renderer (contract cards + the drill-yard card as merged) · specs/practice-claim/README.md (THE DRILL YARD laws) · the board's chapter/nav structure · the drill-yard contract entry + its in-run surfaces (HUD/pause).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. BOARD SEPARATION: the Drill Yard leaves the contract list — its own visually distinct section BELOW the claims (divider + header "THE TRAINING GROUND"), card in a clearly different dress (distinct border/parchment tone, the drill-bell/straw-man iconography, NO wave posting, NO reward line), body copy leading with "Practice ground — no stakes, no claim." Launch button reads "Enter the yard" (never "Launch").
2. IN-RUN MARKING: while in the yard, the HUD carries a persistent small "DRILL YARD — training" tag and the pause overview states "This is practice. Nothing is at stake. Leave anytime." (house voice).
3. The Gazette's town-services panel line and any welcome-beat reference updated to match the new framing (one sentence each, if they name it).
4. e2e: the yard card renders in its own section with the training dress (not among contracts) · launch flows unchanged mechanically · HUD tag + pause line present in-yard · board screenshots desktop + 390px.
TOUCH-ONLY: board renderer + its css · drill-yard card copy · in-yard HUD/pause surfaces · Gazette/welcome one-liners if they reference it · specs. NO: yard mechanics, contract data beyond copy fields, other cards.
SELF-CHECK: board + drill-yard + release suites green both projects · zero console · before/after board screenshots into artifacts/drill-yard-separation/.
READY-FOR-GATES + report: the new board section screenshot + copy verbatim.
