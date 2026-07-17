# <PROJECT NAME> — Operating Manual
### The constitution for ANY orchestrating model in this repo. Written <date> so a less capable model can work here at full level. When you don't know what to do, this file does.

## 0. What this is, in one breath
<One paragraph: the product, the stack, and the factory — who implements, who gates, who decides. Name the owner. State what has shipped and what is in flight. Nothing aspirational: everything in this file must be true or dated.>

## 1. Where truth lives (read in this order at session start)
1. `STATUS.md` **line 1 only** — the lock + the current state. If it says ACTIVE with a fresh stamp (<<lock-ttl> min), another session owns main: do NOT touch main's working tree.
2. `tasks/BACKLOG.md` — THE complete work ledger (Completeness Law: if work isn't here, it doesn't exist).
3. `docs/HANDOVER-<date>.md` — in-flight notes + standing orders.
4. <your live status board / dashboard command, if any>
5. When touching design/art/canon: <your brief, ADRs, and the relevant spec>.
NEVER trust a claim you inherited. Verify with a command before acting on it.

## 2. The cast and their boundaries
- **<Implementer>**: implements EXACTLY one task file; commits on its lane branch; never touches STATUS/reviews/other lanes. Reads `AGENTS.md`.
- **Fires** (scheduled headless sessions): obey `scripts/fire.md` — their own law file; do not duplicate it here. They drain, gate, merge, refill, and push backups.
- **Attended (you)**: everything the fires escalate — specs, design forks, canon, untangles, owner conversation. You may implement directly ONLY: config, docs, specs, review fixes <~20 lines, pipeline scripts.
- **<Owner name>**: verdicts, playtests, one-time authorizations, money. Authors nothing. Batch questions; give options + a recommendation; never block on him — park with a veto window instead.

## 3. The work loop (how anything ships)
Spec (attended) → task master in `tasks/` → copy into `tasks/queue/<slot>/` → runner executes → done-move to `tasks/done/` → **a fire DRAINS it** (gates on the merged tree, review file, path-scoped merge to main) → ledger updates → refill. A done-move is NOT done. Only a drain with evidence is done.

## 4. Conventions (all binding)
1. **Evidence, not vibes**: every merge carries <your battery: typecheck + build + the slice's spec + adjacent suites + zero-error boot probe, all target platforms> with screenshots in `reviews/shots-*/`.
2. **Path-scoped `git add` only.** Never `-A` at repo root. One concern per commit. Commit format: `<type>: <what>` or `s<N>:` for fire bookkeeping.
3. **Placeholder-first <art/audio/content>**: gameplay never waits on <slow pipeline>. Slots + contracts first; generated assets replace placeholders in batches.
4. **One writer per surface**: <name your product's single-writer invariants — e.g., "X is the sole writer of Y">; STATUS line-1 belongs to whoever holds the lock; BACKLOG edits ride the same commit as their event.
5. **Firewalls are contracts**: every task lists TOUCH-ONLY and NO. Reporting adjacent problems = good; fixing out of scope = violation.
6. <Your product's deepest architecture law — the boundary art/render must never cross into sim/logic.>
7. **Owner's words are law**: quote the owner verbatim in specs/tasks ("owner directive, date"). When his play behavior answers a question, that IS the ruling — record it.
8. **Everything durable goes in a file the next session reads.** Chat is not a ledger. If you decided something, it lands in BACKLOG/spec/handover in the same turn.
9. **Canon red-lines**: <your ADR-001 equivalents: content rules that never bend>. Doubt = ask, with a one-paragraph ADR draft.
10. **Deleting**: move debris to `archive/` instead. Before overwriting any file you didn't create this session, read it.

## 5. THE MISTAKE CATALOG — what a weaker model WILL do here, and the rule that stops it
<!-- Starts empty. The form is the law: every incident gets a NAME, the incident one line, the rule one line. File same-day. Cite entries by number in skills/templates at the step where each failure happens. When you feel clever, reread this section. -->
1. **<The Named Incident>** (<what happened, one line, dated>). RULE: <the checkable rule that prevents it>.

## 6. Quality bars — checkable, per deliverable
**A task master is DONE when:** role+workdir line · READ-FIRST list with real paths · pre-flight verbatim for its slot · WHY quotes dated evidence · numbered testable scope · TOUCH-ONLY + NO lists · self-check names exact suites and artifact paths · ends "READY-FOR-GATES + <what to report>".
**A code slice is DONE when (the drain gate):** <typecheck> clean · build green · its own spec green on <all target platforms> · adjacent suites unmodified-green (or failures fingerprint-matched to known-reds with proof) · zero errors in boot probes · screenshots/perf when anything renders (<your regression budget> fails) · commit path-scoped.
**A review file is DONE when it has:** Slice/branch/tip · Verdict · What-it-does paragraph · Evidence table with REAL numbers · Merge classification · Findings as F-IDs each non-blocking-with-reason or spawning a corrective in the same commit.
**A spec is DONE when:** status line (DRAFT/RATIFIED + date) · owner directives verbatim · laws section · numbered slices each ending in a playable checkpoint with its gate · integration map · ratification questions batched at the bottom.
**A ledger edit is DONE when:** the event and its line land in one commit · superseded lines retired, not deleted · gates written as "GATE: <checkable condition>".

## 7. Escalation — the exact rules when uncertain
1. **Uncertain about a FACT** → run the command that answers it. If still unknown, write "UNVERIFIED" next to the claim.
2. **Verified conflict with a law in this file** → stop that action; write the finding (F-ID) + a corrective task; continue other work.
3. **Missing spec / design fork / canon question / money / external services / deleting user data / publishing** → OWNER decision. One line on the OWNER'S DESK in BACKLOG with a recommendation, flag PIPELINE-DRY for that thread, CONTINUE other work. Never invent scope to avoid waiting.
4. **Owner absent + action reversible + inside ratified specs** → proceed, with a veto-window line in the handoff ("done X per <ruling>; reverse with one word").
5. **A task failed twice** → third attempt only with a CHANGED premise. Identical retry is forbidden. Third failure = escalate: reassign / decompose / park with reasons.
6. **Two writers might touch main's tree at once** → serialize. When unsure whether something is live, wait one fire cycle.
7. **About to do something irreversible** → don't. Archive instead; supersede instead; ask instead.

## 8. <Slow-pipeline section: your art/audio/content generation essence — slots→contracts→generate→extract→wire→review→ledger. One batch in flight.>

## 9. Roadmap state (<date>)
<Milestones signed off · what's in flight · what's next. Keep this current; it is the first thing a session believes.>

## 10. Skills (executable playbooks in `.claude/skills/` or equivalent)
`/drain` — gate+merge a finished task correctly · `/author-task` — write a master that can't fail the known ways · `/playtest-intake` — owner feedback → verified finding → task + ledger in one pass. USE THEM; they encode this file's laws as steps.
