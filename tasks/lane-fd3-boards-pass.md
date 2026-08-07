CODEX: model=gpt-5.6-sol effort=high

# lane-fd3-boards-pass — the standings + Field Book improvement pass (FD-3)

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). Commit prefix `fd3:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.
PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/b`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/b origin/main` ONLY when clean. SAFE-DUPE: if the standings board already shows a "YOUR CLAIMS" strip → STOP and report.

## WHY (owner, verbatim, 2026-08-07): "I am looking at the standings and the field book right now and it is a good start but we have to improve on it."
Spec: `specs/agent-play/ap-14-front-desk.md` FD-3 — the judgment criteria are LISTED there so your judgment is reviewable: glanceable rows (rank · name · result · when) · provenance one tap away (species-blind rank; stack detail Field-Book-style, never cluttering rank rows) · honest empty states ("no standings yet — the door is open") · 390px parity · Field Book legible when SPARSE (today: 3 rows total; design for 3, not 300).

## READ-FIRST: the spec's FD-3 + FD-4's LOCAL/GLOBAL answer (you implement its cheap half: surface the per-profile "YOUR CLAIMS" strip beside the county board from EXISTING profile data — no new storage) · both boards' components + their e2e · LB-03 difficulty chips + ap06d Field Book (their grammar is the house style).

## SCOPE
1. Row polish per criteria (add relative "when" from submittedAt; keep ranking law byte-identical).
2. Empty + sparse states per criteria, in-world voice.
3. "YOUR CLAIMS" local strip beside the county board (per-profile bests, existing data only, clearly separated from the county's global rows — FD-4's local/global answered at the display layer).
4. 390px parity for both surfaces.
5. Extend both boards' e2e for: when-column, empty state, local strip renders from a seeded profile, sparse Field Book. Both projects.
## TOUCH-ONLY: boards UI + css · own e2e extensions · `tasks/BACKLOG.md` (goal-leaf). NO: API/ranking/storage changes · new endpoints · the FD-1 card (lane-a owns it — coordinate by NOT touching its mount point).
## SELF-CHECK: tsc clean · build + release-build green · suites green both projects · zero console errors · before/after screenshots desktop+390px → `reviews/shots-fd3/`.
READY-FOR-GATES. Report: each criterion → what changed, screenshot pairs.
