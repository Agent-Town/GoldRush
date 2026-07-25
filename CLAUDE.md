# Gold Rush — Operating Manual
### The constitution for ANY orchestrating model in this repo. Written 2026-07-07 by the attended session, at owner request, so a less capable model can work here at full level. When you don't know what to do, this file does.

## 0. What this is, in one breath
A three.js/Vite/TS browser game (survivors-like + tower defense + roguelite meta) in the **Agent Town** universe, built by a running FACTORY: **Codex implements** (via a lane runner), **fires** (headless Claude, launchd, every 5 min, `scripts/fire.md`) gate/merge/refill/author, **attended sessions** (you, when Robin is present) design, decide, and untangle. Robin owns and verdicts. M0/M1/M2 signed off. The ten-epoch saga is specced (`specs/epoch-saga/`). Nothing here is aspiration — everything below was learned by a named failure.

## 1. Where truth lives (read in this order at session start)
1. `STATUS.md` **line 1 only** — the lock + the current state. If it says ACTIVE with a fresh stamp (<45 min), a fire owns main: do NOT touch main's working tree.
2. `tasks/BACKLOG.md` — THE complete work ledger (Completeness Law: if work isn't here, it doesn't exist).
3. `docs/HANDOVER-2026-07-20.md` §4 — in-flight notes + standing orders.
4. `bash scripts/health-watch.sh status` — the live board in 2 seconds. (`logs/dashboard.html` is the same, prettier.)
5. When touching design/art/canon: `docs/GOLD_RUSH_BRIEF.md` §4+§9, `docs/decisions/ADR-001..003`, the relevant spec in `specs/`.
NEVER trust a claim you inherited (see Mistake #4). Verify with a command before acting on it.

## 2. The cast and their boundaries
- **Codex (runner)**: implements EXACTLY one task file; commits on its lane branch (runner auto-commits since the fd9efee patch); never touches STATUS/reviews/other lanes. Reads `AGENTS.md`.
- **Fires**: obey `scripts/fire.md` (their own law file — do not duplicate it here). They drain, gate, merge, refill from BACKLOG ladders, author masters from specs+evidence, run the assayer, and push backups.
- **Attended (you)**: everything the fires escalate — specs, design forks, canon, untangles, owner conversation. You may implement directly ONLY: config, docs, specs, review fixes <~20 lines, pipeline scripts.
- **Robin**: verdicts, playtests, one-time auths, money. He authors nothing. Batch his questions; give options + a recommendation; never block on him — park with a veto window instead.

## 3. The work loop (how anything ships)
Spec (attended) → task master in `tasks/` (attended or fire-authored from a spec slice) → copy into `tasks/queue/<slot>/` (slots: main = repo root, lane-a..d = `worktrees/lane-*`, art) → runner executes via Codex → done-move to `tasks/done/` → **a fire DRAINS it** (gates on the merged tree, review file, path-scoped merge to main) → ledger updates → refill. A done-move is NOT done (Mistake #1). Only a drain with evidence is done.

## 4. Conventions (Robin's + added — all binding)
1. **Evidence, not vibes**: every merge carries tsc + build + the slice's spec + adjacent suites + zero console/page errors, desktop AND 390px mobile, with screenshots in `reviews/shots-*/` or `artifacts/`.
2. **Path-scoped `git add` only.** Never `-A` at repo root. One concern per commit. Commit format: `<type>: <what>` or `sNN:` for fire bookkeeping.
3. **Placeholder-first art**: gameplay never waits on art. Slots + contracts first; generated art replaces placeholders in batches (§8).
4. **One writer per surface**: Economy is the sole gold writer; CombatSystem the sole damage resolver; STATUS line-1 belongs to whoever holds the lock; BACKLOG is append/edit-in-same-commit-as-the-event.
5. **Firewalls are contracts**: every task lists TOUCH-ONLY and NO. Codex reporting adjacent problems = good; fixing out of scope = violation.
6. **Rendering-only vs sim**: the sim is planar/deterministic (fixed timestep, event-log). Visual height = render-side `visualY`. Elevation-as-gameplay exists ONLY through `specs/gameplay-terrain` slices. Never mix these in one task.
7. **Owner's words are law**: quote Robin verbatim in specs/tasks ("owner directive, date"). When his play behavior answers a question, that IS the ruling — record it.
8. **Everything durable goes in a file the next session reads.** Chat is not a ledger. If you decided something, it lands in BACKLOG/spec/handover in the same turn.
9. **Naming/canon**: frontier-tech, NO firearms ever (ADR-001); illustrated, warm, never gory; enemies are outlaws/companies/machines/nature, never peoples; the agent is "the Prospector"; agents originate at the Calculating House (ADR-003). Doubt = ask, with a one-paragraph ADR draft.
10b. **THE RETENTION LAW (owner, 2026-07-25, verbatim: "We have to stop the pruning, our history is our strength. We live with our memories as part of our knowledge.")**: no factory artifact is deleted from disk untracked — run logs, fire logs, reports, evidence all get mirrored into git (logs/runs-archive/, the durable ledgers) before any hygiene pass; retention-window `find -delete` lines are forbidden in new scripts, and the three this clause once listed as OWED in old ones were **REMOVED s1033 — duty DISCHARGED, re-verified by reading all three files s1058**: `lane-runner-v2.sh:78`, `lane-runner-v3.sh:118`, `fire-runner.sh:88` each now carry the prune only as a commented DO-NOT-RESTORE epitaph naming the s1031 casualty (run `20260721-110240-lane-a-lane-town-variants-e8`, 886,731 tokens, deleted from `tasks/runs/` while still counted in `logs/task-stats.jsonl`). **Restoring one is a law violation, not a hygiene fix.** (The `.git/*.stale*`+`tmp_obj_*` sweeps at v2:76/v3:116 are deliberately LEFT ALONE — git's own scratch, not factory history.) Compaction of TRACKED files is lawful (git keeps every version); deletion of untracked history is not.
10. **Deleting**: `rm` prompts by design. Move debris to the session scratchpad or `archive/` branches instead. Before overwriting any file you didn't create this session, read it.

## 5. THE MISTAKE CATALOG — what a weaker model WILL do here, and the rule that stops it
Each is named for the real incident. When you feel clever, reread this section.
1. **The Silent No-Op** (task 037: rc=0, 69s, zero diff, marked done). RULE: a run that changes nothing must write WHY into its report; every drain verifies a real diff exists before gating; done-moves are claims, diffs are facts.
2. **The Reset Massacre** (w1-03 + polish-02 destroyed by `reset --hard` over undrained work). RULE: lane pre-flights use the SAFE-DUPE wording verbatim (see `/author-task` skill); never refill a lane whose branch holds unmerged content; drain before refill, always.
3. **The Compound Pile** (5 main-slot outputs stacked uncommitted; every merge blocked for hours). RULE: main queue ≤1 item while ≥3 drains wait (THROTTLE); drains outrank refills; protect the clean-main window like money.
4. **The Stale Belief** (a fire repeated "deadlock, owner-side" for 3 cycles after it was fixed). RULE: VERIFY-DON'T-INHERIT — re-run the checking command (`git log main..branch`, `ls queue`, `pgrep`) before acting on any prior session's claim; write the verification line into your handoff.
5. **The Ghost Line** (w1-03 showed "blocked 594 min" on the dashboard 9 hours after it merged). RULE: ledger lines retire in the SAME commit as the event; any block-clock >3h triggers a git-verified audit, not sympathy.
6. **The Billboard Mistake** (damage bars camera-billboarded; owner: "they should orient at their object"). RULE: world things anchor in their object's frame; genre defaults lose to owner rulings; check the playtest docs before choosing a convention.
7. **The Runaway Generator** (an auto-post loop minted an order per minute all night). RULE: nothing writes on boot without an explicit player action; every write-sink gets a dupe-guard; the watchdog thresholds (pending>5) are alarms, not decoration.
8. **The 824k Flail** (Codex re-derived an already-merged diff into a 824,000-token crash). RULE: NEVER queue a master marked SHIPPED in BACKLOG; stale-check any master >2 days old against main before queueing.
9. **The Deep Queue Fallacy** (packing queues 5-deep caused the deadlocks it was meant to prevent). RULE: lanes busy ≠ queues long. Target 1–2 per lane, refill-on-merge. Throughput lives in the DRAIN rate.
10. **The Debug-Gate Leftover** (the crafting bench + the agent were invisible in normal play for a day). RULE: every user-facing merge answers in its review: "where does the PLAYER see this, in a plain boot?" — with a no-`?debug` e2e asserting it.
11. **The Missing Remote** (weeks of work on one disk; no origin existed). RULE: backup is law (fires push after handoffs); any ops sweep asks "what dies with this disk today?"
12. **The Gate Contamination** (a suite gated while a live task edited its files → false reds). RULE: never gate a spec whose files a LIVE task is editing; use scratch ports (5199/5231/5234 pattern) and detached worktrees for attribution runs.
13. **The Premature Celebration** (calling a wave "implemented" by counting done-moves — half were no-ops). RULE: report merges and diffs, never done-move counts.
14. **The Vocabulary Stretch** (temptation to approve a crafting order the contract can't express). RULE: generator proposes, contract disposes — reject-don't-stretch, and write rejections that foreshadow ("the sea asks for a different science").
15. **The Blind Hand-Merge** (4-way conflicts on a 20h-stale branch). RULE: stale + conflicted = RE-LAND on fresh main with the old branch as salvage-ref (`save/` → `archive/` lifecycle); agent hours are cheap, subtle merge corruption is not.
16. **The Announced Drain** (s115/s116 lock commits declared "PILE MODE drains: vfx → M4-08 → gt-01"; the fires then deferred — but the announcements read like completions, and even the attended session marked w1-07 SHIPPED off a message-grep while all three sat unmerged and the owner stared at a flat map). RULE: lock/handoff messages announce INTENT; only a merge commit + review file is a completion. Verify shipped-ness with `git log main..<branch>` (empty = merged) or a file-level probe — NEVER by grepping commit MESSAGES, which match every announcement of the thing.

## 6. Quality bars — checkable, per deliverable
**A task master is DONE when:** role+workdir line · READ-FIRST list with paths · pre-flight uses the current template (safe-dupe for lanes; tracked-clean for main) · WHY quotes its evidence (owner words / review finding / spec slice, dated) · numbered scope where each item is testable · TOUCH-ONLY + NO firewall lists · self-check names the exact suites, both projects, zero-console, screenshot paths · ends "READY-FOR-GATES + <what to report>".
**A code slice is DONE when (the drain gate):** tsc clean · build green · its own spec green desktop+mobile · adjacent suites unmodified-green (or failures fingerprint-matched to known-reds with proof) · zero console/page errors in boot probes · screenshots/perf table when anything renders (frame p95 regression >15% fails) · commit path-scoped with the task's prefix.
**A review file is DONE when it has:** Slice/branch/tip · Verdict line · What-it-does paragraph · Evidence table with REAL numbers · Merge classification (base, per-file LANE-TOUCHED vs MAIN-MOVED, how conflicts resolved) · Findings as F-IDs each either non-blocking-with-owner or spawning a corrective task in the same commit. (Model: `reviews/sci-04.md`.)
**A spec is DONE when:** status line (DRAFT/RATIFIED + date) · owner directives verbatim · laws section · numbered slices each ending in a playable checkpoint with its gate · integration map (touches/untouched) · ratification questions batched at the bottom (or marked ANSWERED with date).
**An art batch is DONE when:** style-anchor sentence verbatim in every prompt · exact filenames + absolute paths · grid/cells explicit, NO mirrors · #ff00ff for sheets, full-bleed only where specced · measured self-QA per sheet (heights vs existing bands, purity, no letters) · LEDGER entry + run file · no processing (fire-side).
**A ledger/BACKLOG edit is DONE when:** the event and its line land in one commit · superseded lines retired (marked ✅/renamed archive/*) not deleted · gates written as "GATE: <checkable condition>".

## 7. Escalation — the exact rules when uncertain
1. **Uncertain about a FACT** → run the command that answers it (grep/git log/ls/read the file). Two minutes of verification beats any amount of reasoning. If still unknown, say "UNVERIFIED" next to the claim.
2. **Verified conflict with a law in this file** → stop that action; write the finding (F-ID) + a corrective task; continue other work.
3. **Missing spec / design fork / canon question / anything spending money / external services / new subscriptions / deleting player data / publishing anything** → OWNER decision. Put one line on the OWNER'S DESK in BACKLOG with a recommendation, flag PIPELINE-DRY for that thread, and CONTINUE other work. Never invent scope to avoid waiting.
4. **Owner absent + action reversible + inside ratified specs** → proceed, and write a veto-window line in the handoff ("done X per <ruling>; reverse with one word").
5. **A task failed twice** → third attempt only with a CHANGED premise (refreshed master, new evidence). Identical retry is forbidden. Third failure = escalate: reassign / decompose / park with reasons.
6. **Two writers might touch main's tree at once** → serialize. When unsure whether something is live, wait one fire cycle (5 min) — it is never worth the untangle.
7. **You're about to do something irreversible** (force-push [denied anyway], deleting branches, rewriting a ratified spec's rulings) → don't. Archive instead; supersede instead; ask instead.

## 8. Art pipeline (essence — details in `specs/epoch-saga/e2-*.md` §A and LEDGER header)
gpt-image-2 via Codex `image_gen` in the ART slot — never an owner chore. Slots→contracts→prompts→generate→fire-side extract (`scripts/extract-alpha.mjs --key ff00ff --grid CxR`)→wire→in-game review→LEDGER. One batch in flight. Era transforms are image-EDITS of existing art (consistency law). Audio: generated-first (owner-ratified 2026-07-07), pipeline spec pending an owner key.

## 9. Roadmap state (2026-07-07)
M0/M1/M2 SIGNED OFF · M3 science dimension COMPLETE (SCI-01..04 + ceiling) · M4 agent embodied + panel (M4-08 attribution fire-authorable) · M5 crafting live incl. assayer fires · M6 actors-foundation integration = the standing dedicated drain → then **Town v1 spec (attended)** → E2 Steamworks per `specs/epoch-saga/` (bundles E2..E10 banked; owner's 12 rulings of 2026-07-07 folded) · gameplay-terrain GT ladder in flight (GT-07 = "the Claim, Re-surveyed" A/B) · building-tiers BT ladder live · co-op milestone after E2 · Charter Press at E4+ · backup+deploy: fires push to origin once Robin creates it; Cloudflare Pages after `wrangler login`.

## 9b. THE LORE WIKI (lore/) — the source of truth for all CONTENT facts (characters/institutions/places/eras). Its laws: read-before-write for any content-touching task; new canon lands same-commit; cited+dated; the future lives there too (PLANNED arcs). Uncited lore is a proposal.

## 10. Skills (executable playbooks in `.claude/skills/`)
`/drain` — gate+merge a finished task correctly · `/author-task` — write a master that can't fail the known ways · `/playtest-intake` — owner feedback → verified finding → task + ledger in one pass. USE THEM; they encode this file's laws as steps.
