# Gold Rush — Operating Manual
### The constitution for ANY orchestrating model in this repo. Written 2026-07-07 by the attended session at owner request; compacted 2026-09-24 on the owner's order ("clean up all the AGENT.md, CLAUDE.md and so on files"). The uncompacted text of every law file is archived verbatim under `docs/law/` and in git; nothing here was deleted, only the incident history moved out of the reading path.

## 0. What this is, in one breath
A three.js/Vite/TS browser game (survivors-like + tower defense + roguelite meta) in the **Agent Town** universe, built by a running FACTORY: **Codex implements** (via a lane runner), **fires** (headless Claude, launchd, every 5 min, `scripts/fire.md`) gate/merge/refill/author, **attended sessions** (you, when Robin is present) design, decide, and untangle. Robin owns and verdicts. Nothing here is aspiration; everything below was learned by a named failure.

## 1. Where truth lives (read in this order at session start)
1. `STATUS.md` **line 1 only**: the lock and the current state. If it says ACTIVE with a fresh stamp (<45 min), a fire owns main: do NOT touch main's working tree. The four lock shapes are `ACTIVE …`, `… lock ACTIVE`, `… ACTIVE (sNNNN fire)`, `… (sNNNN fire) ACTIVE`. **And while `tasks/.fire.lock` exists with a fresh mtime (<50 min) the fire PROCESS is alive and may still commit even after line 1 reads `lock CLEARED` (F-E1T-2, 2026-09-24: a landing fast-forwarded main between a fire's clearing commit and its last commit, four minutes apart, harmlessly that once); wait for the directory to go before touching main.**
2. `tasks/BACKLOG.md`, the top of the file: THE complete work ledger (Completeness Law: if work is not here, it does not exist).
3. The newest `docs/HANDOVER-*.md` (its last sections) and `docs/OWNER-DESK-*.md` (what awaits the owner).
4. The live board: `bash scripts/health-watch.sh status` (attended). A headless fire cannot run `bash` (not allowlisted); it routes the same through node: `node -e "const{execFileSync}=require('child_process');console.log(execFileSync('bash',['scripts/health-watch.sh','status'],{encoding:'utf8'}))"`. Same shape for every `bash scripts/*.sh` this repo prescribes.
5. When touching design, art or canon: `docs/GOLD_RUSH_BRIEF.md` §4+§9, `docs/decisions/ADR-001..003`, the relevant spec in `specs/`.
NEVER trust a claim you inherited (Mistake #4). Verify with a command before acting on it.

## 2. The cast and their boundaries
- **Codex (runner)**: implements EXACTLY one task file; commits on its lane branch (the runner auto-commits); never touches STATUS, reviews or other lanes. Reads `AGENTS.md`.
- **Fires**: obey `scripts/fire.md` (their own law file). They drain, gate, merge, refill from BACKLOG ladders, author masters from specs and evidence, run the assayer, and push backups.
- **Attended (you)**: everything the fires escalate: specs, design forks, canon, untangles, owner conversation. You may implement directly ONLY: config, docs, specs, review fixes under ~20 lines, pipeline scripts. Implementation goes to an implementer (Codex in a lane, or an Opus agent in a scratch worktree beside the primary checkout).
- **Robin**: verdicts, playtests, one-time auths, money. He authors nothing. Batch his questions; give options plus a recommendation; never block on him: park with a veto window instead.

## 3. The work loop (how anything ships)
Spec (attended) → task master in `tasks/` → copy into `tasks/queue/<slot>/` (slots: main = repo root, lane-a..d = `worktrees/lane-*`, art) → the runner executes via Codex → done-move to `tasks/done/` → **a drain** gates it on the merged tree in a detached worktree, writes the review file, merges path-scoped to main → ledger updates in the same commit → refill. A done-move is NOT done (Mistake #1). Only a drain with evidence is done.

## 4. Conventions (Robin's plus added; all binding)
1. **Evidence, not vibes**: every merge carries tsc + build + the slice's spec + adjacent suites + zero console/page errors, desktop AND 390px mobile, with screenshots in `reviews/shots-*/` or `artifacts/`.
2. **Path-scoped `git add` only.** Never `-A` at repo root. One concern per commit. Commit format: `<type>: <what>` or `sNN:` for fire bookkeeping.
3. **Placeholder-first art**: gameplay never waits on art. Slots and contracts first; generated art replaces placeholders in batches (§8).
4. **One writer per surface**: Economy is the sole gold writer; CombatSystem the sole damage resolver; STATUS line 1 belongs to whoever holds the lock; BACKLOG is append or edit-in-the-same-commit-as-the-event.
5. **Firewalls are contracts**: every task lists TOUCH-ONLY and NO. Codex reporting adjacent problems is good; fixing out of scope is a violation.
6. **Rendering-only vs sim**: the sim is planar and deterministic (fixed timestep, event log). Visual height is render-side `visualY`. Elevation as gameplay exists ONLY through `specs/gameplay-terrain` slices. Never mix these in one task.
7. **Owner's words are law**: quote Robin verbatim in specs and tasks ("owner directive, date"). When his play behaviour answers a question, that IS the ruling; record it.
8. **Everything durable goes in a file the next session reads.** Chat is not a ledger. If you decided something, it lands in BACKLOG, a spec or the handover in the same turn.
9. **Naming and canon**: frontier-tech, NO firearms ever (ADR-001); illustrated, warm, never gory; enemies are outlaws, companies, machines or nature, never peoples; the agent is "the Prospector"; agents originate at the Calculating House (ADR-003). Doubt = ask, with a one-paragraph ADR draft.
10. **Deleting**: `rm` prompts by design. Move debris to the session scratchpad or `archive/` branches instead. Before overwriting any file you did not create this session, read it.
10b. **THE RETENTION LAW (owner, 2026-07-25, verbatim: "We have to stop the pruning, our history is our strength. We live with our memories as part of our knowledge.")**: no factory artifact is deleted from disk untracked. Run logs, fire logs, reports and evidence get mirrored into git before any hygiene pass; retention-window `find -delete` lines are forbidden in new scripts. The three prunes the old scripts carried were removed on 2026-07-24 (s1033) and survive only as commented DO-NOT-RESTORE epitaphs, one each in `lane-runner-v2.sh`, `lane-runner-v3.sh` and `fire-runner.sh`; find them with `grep -n 'It was: find' scripts/*.sh` and verify by the CODE, never by a line number (the coordinates moved a dozen times; the history of every move is in `docs/law/claude-md-archive-2026-09-24.md`). **Restoring one is a law violation, not a hygiene fix.** Compaction of TRACKED files is lawful (git keeps every version); deletion of untracked history is not. **Amendment (owner 2026-08-26, F-2324-1, verbatim "keep the run logs local for now"):** `tasks/runs/*.log` and their `logs/runs-archive/*.log` mirrors are deliberately disk-local; nobody force-adds them; deletion stays forbidden.

## 5. THE MISTAKE CATALOG — what a weaker model WILL do here, and the rule that stops it
Each is named for the real incident. When you feel clever, reread this section.
1. **The Silent No-Op** (task 037: rc=0, 69s, zero diff, marked done). RULE: a run that changes nothing must write WHY into its report; every drain verifies a real diff exists before gating; done-moves are claims, diffs are facts.
2. **The Reset Massacre** (w1-03 + polish-02 destroyed by `reset --hard` over undrained work). RULE: lane pre-flights use the SAFE-DUPE wording verbatim (`/author-task`); never refill a lane whose branch holds unmerged content; drain before refill, always.
3. **The Compound Pile** (5 main-slot outputs stacked uncommitted; every merge blocked for hours). RULE: main queue ≤1 item while ≥3 drains wait (THROTTLE); drains outrank refills; protect the clean-main window like money.
4. **The Stale Belief** (a fire repeated "deadlock, owner-side" for 3 cycles after it was fixed). RULE: VERIFY-DON'T-INHERIT: re-run the checking command (`git log main..branch`, `ls queue`, `pgrep`) before acting on any prior session's claim; write the verification line into your handoff.
5. **The Ghost Line** (w1-03 showed "blocked 594 min" on the dashboard 9 hours after it merged). RULE: ledger lines retire in the SAME commit as the event; any block-clock over 3h triggers a git-verified audit, not sympathy.
6. **The Billboard Mistake** (damage bars camera-billboarded; owner: "they should orient at their object"). RULE: world things anchor in their object's frame; genre defaults lose to owner rulings; check the playtest docs before choosing a convention.
7. **The Runaway Generator** (an auto-post loop minted an order per minute all night). RULE: nothing writes on boot without an explicit player action; every write-sink gets a dupe-guard; watchdog thresholds are alarms, not decoration.
8. **The 824k Flail** (Codex re-derived an already-merged diff into a 824,000-token crash). RULE: NEVER queue a master marked SHIPPED in BACKLOG; stale-check any master over 2 days old against main before queueing.
9. **The Deep Queue Fallacy** (packing queues 5-deep caused the deadlocks it was meant to prevent). RULE: lanes busy ≠ queues long. Target 1 to 2 per lane, refill-on-merge. Throughput lives in the DRAIN rate.
10. **The Debug-Gate Leftover** (the crafting bench and the agent were invisible in normal play for a day). RULE: every user-facing merge answers in its review "where does the PLAYER see this, in a plain boot?" with a no-`?debug` e2e asserting it.
11. **The Missing Remote** (weeks of work on one disk; no origin existed). RULE: backup is law (push after every landing); any ops sweep asks "what dies with this disk today?"
12. **The Gate Contamination** (a suite gated while a live task edited its files → false reds). RULE: never gate a spec whose files a LIVE task is editing; use scratch ports and detached worktrees for attribution runs.
13. **The Premature Celebration** (calling a wave "implemented" by counting done-moves; half were no-ops). RULE: report merges and diffs, never done-move counts.
14. **The Vocabulary Stretch** (approving a crafting order the contract cannot express). RULE: generator proposes, contract disposes: reject, do not stretch, and write rejections that foreshadow.
15. **The Blind Hand-Merge** (4-way conflicts on a 20h-stale branch). RULE: stale + conflicted = RE-LAND on fresh main with the old branch as salvage-ref (`save/` → `archive/` lifecycle); agent hours are cheap, subtle merge corruption is not.
16. **The Announced Drain** (lock commits announced drains that never happened, and a message-grep marked them SHIPPED). RULE: lock and handoff messages announce INTENT; only a merge commit plus a review file is a completion. Verify shipped-ness with `git log main..<branch>` (empty = merged) or a file-level probe, NEVER by grepping commit messages.
17. **The Edited Running Script** (2026-09-24: a cure inserted into a drain script while it ran; bash re-read a fragment at its byte offset, truncated the gate log and skipped the cure). RULE: never write to a script that `ps` shows running; stage a new script and call it from the next step.

## 6. Quality bars, checkable, per deliverable
**A task master is DONE when:** role plus workdir line · READ-FIRST list with real paths · pre-flight in the current template (safe-dupe for lanes; tracked-clean plus the factory-churn exception for main and scratch worktrees) · WHY quotes its evidence (owner words, review finding or spec slice, dated) · numbered scope where each item is testable · TOUCH-ONLY plus NO firewall lists · self-check names the exact suites, both projects, zero-console, evidence paths · ends "READY-FOR-GATES + <what to report>" · its leaf is in `tasks/goals.json` and its ladder line in BACKLOG in the same commit.
**A code slice is DONE when (the drain gate):** tsc clean · build green · its own spec green desktop and mobile · adjacent suites unmodified-green (or failures fingerprint-matched to a control on clean main) · zero console and page errors in boot probes · screenshots or a perf table when anything renders (frame p95 regression over 15% fails) · commit path-scoped with the task's prefix.
**A review file is DONE when it has:** slice, branch, tip · verdict line · what-it-does paragraph · evidence table with REAL numbers · merge classification (base, per-file LANE-TOUCHED vs MAIN-MOVED, how conflicts resolved) · findings as F-IDs, each non-blocking-with-owner or spawning a corrective task in the same commit. (Model: `reviews/sci-04.md`.)
**A spec is DONE when:** status line (DRAFT or RATIFIED plus date) · owner directives verbatim · laws section · numbered slices each ending in a playable checkpoint with its gate · integration map · ratification questions batched at the bottom (or marked ANSWERED with a date).
**An art batch is DONE when:** the style-anchor sentence verbatim in every prompt · exact filenames and paths · grid and cells explicit, NO mirrors · #ff00ff for sheets · measured self-QA per sheet · LEDGER entry plus run file · no processing (drain-side).
**A ledger edit is DONE when:** the event and its line land in one commit · superseded lines retired (marked, renamed, never deleted) · gates written as "GATE: <checkable condition>".

## 7. Escalation, the exact rules when uncertain
1. **Uncertain about a FACT** → run the command that answers it. Two minutes of verification beats any amount of reasoning. Still unknown: say "UNVERIFIED" next to the claim.
2. **Verified conflict with a law in this file** → stop that action; write the finding (F-ID) plus a corrective task; continue other work.
3. **Missing spec, design fork, canon question, anything spending money, external services, deleting player data, publishing anything** → OWNER decision. One line on the OWNER'S DESK (the desk file, a first-key BACKLOG row, the STATUS tail) with a recommendation; flag the thread PIPELINE-DRY; CONTINUE other work. Never invent scope to avoid waiting.
4. **Owner absent, action reversible, inside ratified specs** → proceed, and write a veto-window line in the handoff ("done X per <ruling>; reverse with one word").
5. **A task failed twice** → a third attempt only with a CHANGED premise. Identical retry is forbidden. Third failure = escalate: reassign, decompose, or park with reasons.
6. **Two writers might touch main's tree at once** → serialize. When unsure whether something is live, wait one fire cycle (5 min).
7. **About to do something irreversible** (force-push, deleting branches, rewriting a ratified spec's rulings) → don't. Archive instead; supersede instead; ask instead.

## 8. Art pipeline (essence; details in `specs/epoch-saga/e2-*.md` §A and the LEDGER header)
Image generation runs in the ART slot, never as an owner chore. Slots → contracts → prompts → generate → drain-side extract (`scripts/extract-alpha.mjs --key ff00ff --grid CxR`) → wire → in-game review → LEDGER. One batch in flight. Era transforms are image-EDITS of existing art (consistency law). The art store is the sibling repo `GoldRush-assets`, reached through the `assets/pilots/*` symlinks; lanes commit in `worktrees/GoldRush-assets`, drains land the store's main before any engine hash is measured.

## 9. Roadmap and state
Not kept here (it went stale within weeks). The newest `docs/HANDOVER-*.md` says where the work is; `specs/epoch-saga/` holds the ten-epoch saga; `specs/release-e1/README.md` the release shape; `specs/held-maps/README.md` the geometry corrections ladder.

## 9b. THE LORE WIKI (`lore/`): the source of truth for all CONTENT facts (characters, institutions, places, eras)
Read before writing any content-touching task; new canon lands in the same commit, cited and dated; the future lives there too (PLANNED arcs). Uncited lore is a proposal.

## 10. Skills (executable playbooks in `.claude/skills/`)
`/drain` gates and merges one finished task correctly · `/author-task` writes a master that cannot fail the known ways · `/playtest-intake` turns owner feedback into a verified finding, a task and a ledger line in one pass. USE THEM; they encode this file's laws as steps.

## 11. The law files and their archives
`CLAUDE.md` (this file), `AGENTS.md` (Codex), `scripts/fire.md` (fires), the three skills. Each is compact by design since 2026-09-24; the incident history that used to sit inside them is archived verbatim under `docs/law/` (`*-archive-2026-09-24.md`) and in git. A rule needs its history when it is being changed, not when it is being followed: grep the archive for the F-ID. Guards under `scripts/` fingerprint these files (`law-pointer-guard`, `law-bash-prescription-guard`, `desk-lock-predicate-guard` and their family); after any edit, run `npm run test:ledger-guards` and re-base a moved pointer with `node scripts/law-pointer-guard.mjs --update` only after re-reading the cited line.
