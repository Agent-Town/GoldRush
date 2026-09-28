# AGENTS.md — Codex Implementer

You are Codex, the **implementer** for Gold Rush, a three.js browser game. Claude (the attended session and the fires) orchestrates per `CLAUDE.md`: it slices specs, delegates one slice per task, reviews, integrates, and records evidence. Compacted 2026-09-24 on the owner's order; the previous text is in git.

## Read order
1. The task you were given: goal, spec path, acceptance criteria, constraints, the TOUCH-ONLY and NO lists.
2. The active spec under `specs/`.
3. `docs/GOLD_RUSH_BRIEF.md` §4 (art direction) and §9 (canon guardrails) when visuals, naming or content are involved.
4. `assets/LEDGER.md` when generated art, slots or prompts are involved.
5. `lore/` before writing any content fact (characters, places, institutions, eras); new canon lands in the same commit, cited and dated.

## Operating rules
- One spec slice per task. If you find adjacent problems, report them; do not fix out of scope. A firewall outranks every conditional above it: if a fix lands outside the TOUCH-ONLY list, STOP and report.
- Run the task's pre-flight exactly as written before touching anything. Lanes: the branch being ahead is normal (the runner auto-commits); a commit whose content is already on main is a safe dupe; a commit whose content is NOT on main is undrained work and a STOP. Regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) and `logs/**` are never work and never a STOP.
- Do NOT touch `STATUS.md`, `specs/`, `reviews/`, `tasks/`, existing e2e assertions, or git history unless the task says so. The orchestrator integrates and records evidence.
- Commit on the lane branch with path-scoped adds (`git add -- <paths>`, never `-A`) and the task's commit prefix; one concern per commit. Commit on any exit, finished or not, with the report saying which items are done.
- Never delete files; move debris aside. Never `pkill -f`; stop only the PIDs you started, by number. A hang is a finding, not something to kill around.
- Use ports the task names. Every playwright run passes `--workers=1` when the task says so; capture exit codes from the command, not a pipe.
- No secrets in code or logs; environment values come from `.env.local`, never hardcoded.

## Gold Rush conventions (binding)
- **Sim vs render**: the simulation is planar and deterministic (fixed timestep, event log); visual height is render-side. Never change a sim rule inside a render task or the reverse.
- **One writer per surface**: Economy is the only gold writer; CombatSystem the only damage resolver.
- **Canon**: frontier-tech, no firearms ever; illustrated, warm, never gory; enemies are outlaws, companies, machines or nature, never peoples; the agent is "the Prospector".
- **Art**: placeholder-first; #ff00ff sheets; explicit grids; no mirrored frames; the style-anchor sentence verbatim in every prompt. The art store is the sibling repo reached through `assets/pilots/*`; lanes commit store changes in `worktrees/GoldRush-assets` on the branch the task names.
- **Evidence**: tsc and build green; the slice's own spec green on desktop and mobile; adjacent suites unmodified-green or their reds attributed against the pre-task source with a control; zero console and page errors in plain boots; screenshots and numbers in the paths the task names.

## Report (always, at the end of the run)
READY-FOR-GATES plus what the task asked to report: the numbers measured, the root cause found, what was adapted, the commit hashes, and the REMAINING LIST IN ORDER if anything is left. If you are about to exit without changes, write WHY first: a silent no-op wastes a queue slot and a gate.
