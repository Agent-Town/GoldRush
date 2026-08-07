CODEX: model=gpt-5.6-sol effort=high

# lane-fd1-front-desk-card — instructions beside the boards + the Herald carries the door (FD-1 + FD-2)

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). Commit prefix `fd1:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.
PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/a`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/a origin/main` ONLY when clean. SAFE-DUPE: `grep -rn "front-desk\|FRONT DESK" src/` shows an implementation → STOP.

## WHY (owner, verbatim, 2026-08-07): "What is missing for me is now instructions for people next to the standings and the field book - and testing these instructions... It has to be linked in the game and this has to be part of the herald/newspaper as well. Important stuff."
Spec: `specs/agent-play/ap-14-front-desk.md` FD-1 + FD-2 — read it first; its two sections are your acceptance.

## READ-FIRST
1. `specs/agent-play/ap-14-front-desk.md` (FD-1/FD-2 exactly).
2. The standings board + Field Book UI components (where the card mounts beside BOTH).
3. `public/skill.md` head (the REPOSITORIES section + the door's own voice — the card points at `/skill.md` on the SAME origin, never a hardcoded host).
4. `src/news/heraldReader.ts` + `news/herald.json` + the living-paper filler-pool mechanics (FD-2's item joins the "around town" pool).
5. `e2e/gazette-living.spec.ts` + the boards' existing specs (extend, don't fork).

## SCOPE
1. THE FRONT DESK card beside the county standings AND the Field Book: two columns — "RIDE IT YOURSELF" (play & secure; your standing posts itself) · "SEND YOUR RIG" (the door document lives at `/skill.md` on this origin; repositories `Agent-Town/GoldRush` + `Agent-Town/goldrush-gauntlet`). In-world voice, compact, 390px-safe.
2. The `/skill.md` link opens/downloads the served file (same-origin path — verify the deploy serves it; it does today).
3. FD-2: a standing "around town" Herald item — THE COUNTY OPENS ITS DOOR (rigs and riders welcome; the door document's address; one heat-1 line: "a nine-cent mind took the first claim"). It rides the static filler pool so every edition carries it.
4. e2e (extend existing board/gazette suites): the card renders beside BOTH surfaces on a plain no-debug boot; the skill.md link resolves 200 same-origin; the Herald item appears in a rendered edition. Both projects.

## TOUCH-ONLY: boards UI components (card mount) · `src/news/` filler pool + `news/herald.json` · own e2e extensions · `tasks/BACKLOG.md` (goal-leaf, same commit).
## NO: ranking/API changes · skill.md content (just link it) · gazette ladder logic · new routes.

## SELF-CHECK: tsc clean · build green · `GR_RELEASE=e1 npm run build:release` green · extended suites green both projects · zero console errors · screenshots (card beside each board, desktop+390px) → `reviews/shots-fd1/`.
READY-FOR-GATES. Report: card copy verbatim, where it mounts, screenshot paths.
