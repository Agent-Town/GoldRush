# Chapter 04 — The Mistake Catalog
### Sixteen named failures, generalized into the failure modes of agent factories

This chapter is the product's moat. Everything else in this book — laws, roles, loops, gates — can be re-derived from first principles by a good engineer with time. This chapter cannot, because it is not derived: it is *paid for*. Sixteen times in fifteen days, the Gold Rush factory failed in a specific, instructive way; sixteen times the incident was named, autopsied, and converted into a rule that has held since. Nobody else has this tuition receipt. If you run an agent factory and skip this chapter, you will pay the same tuition yourself, at current token prices.

Method notes before the catalog. First: **name your incidents.** "The Reset Massacre" survives context compaction, model handoffs, and human memory in a way that "avoid destructive git operations on unmerged branches" never will. A named incident can be *retold*; a bullet point can only be re-read. Second: **the rule must be checkable, not aspirational.** Every entry below ends in a rule a session can mechanically obey ("verify with `git log main..branch`"), not a value it should hold ("be careful with merges"). Third: **when you feel clever, reread the catalog** — the constitution says exactly that, because most of these failures were committed by a competent session confident it was in the normal case.

The sixteen fall into five families. The families are the transferable part; your factory will fill them with its own incidents.

---

## Family I — Epistemic failures: the factory lies to itself

These are the most important and the most specific to AI factories. Human teams have ambient awareness — someone *notices* the ticket that's been "in review" for a week. A relay of stateless model sessions has no ambient anything: every belief is either verified this session or inherited, and inherited beliefs rot.

### #1 The Silent No-Op
*A run exits successfully having done nothing, and is counted as done.*
**Incident:** task 037 — return code 0, 69 seconds, zero diff, marked done.
**Mechanism:** exit codes measure whether the process ended, not whether work occurred. Agents can conclude "nothing to do here" for good or bad reasons and exit clean either way; a pipeline that trusts rc=0 records phantom progress.
**Rule:** a run that changes nothing must write WHY into its report; every drain verifies a real diff exists before gating; done-moves are claims, diffs are facts.

### #4 The Stale Belief
*A claim outlives its truth and keeps steering decisions.*
**Incident:** a fire repeated "deadlock, owner-side" for three cycles after the deadlock was fixed, starving the board.
**Mechanism:** sessions inherit summaries; summaries carry state claims; nobody re-checks claims that arrive with confident wording. The claim was true once — that is precisely what makes it dangerous.
**Rule:** VERIFY-DON'T-INHERIT — re-run the checking command (`git log`, `ls`, `pgrep`) before acting on any prior session's claim, and write your verification line into your own handoff so the next session inherits *a check*, not a rumor.

### #5 The Ghost Line
*The ledger and the world diverge because the event and its record traveled separately.*
**Incident:** a merged task showed "blocked 594 min" on the dashboard nine hours after it merged.
**Mechanism:** any gap between doing a thing and recording it is a window where the ledger lies — and in a factory where sessions *act on the ledger*, a lying ledger recruits future work into the lie.
**Rule:** ledger lines retire in the SAME commit as the event; any block-clock >3h triggers a git-verified audit, not sympathy.

### #13 The Premature Celebration
*Progress is reported by counting claims instead of facts.*
**Incident:** a wave declared "implemented" by counting done-moves — half were no-ops.
**Mechanism:** claims are countable and gratifying; verification is slow. Under schedule or narrative pressure ("what did we ship today?"), every factory drifts toward counting the cheap number.
**Rule:** report merges and diffs, never done-move counts. Choose your factory's One True Progress Metric to be a fact (gated merges), and let no status report cite anything upstream of it.

### #16 The Announced Drain
*Announcements of intent are indistinguishable from reports of completion — even to the sessions that wrote them.*
**Incident:** lock commits declared "PILE MODE drains: vfx → M4-08 → gt-01"; the fires then deferred. The announcements read like completions; even the attended session marked a slice SHIPPED off a commit-message grep — while all three sat unmerged and the owner stared at a flat map.
**Mechanism:** in a file-based factory, messages about work and evidence of work share a medium. Any verification method that matches the *mention* of a thing (grepping commit messages, searching chat logs) will match every announcement, plan, and hope concerning it.
**Rule:** lock/handoff messages announce INTENT; only a merge commit + review file is a completion. Verify shipped-ness with `git log main..<branch>` (empty = merged) or a file-level probe — NEVER by grepping commit messages, "which match every announcement of the thing."

**The family's general law:** *distinguish, structurally, between statements about work and evidence of work — and make every progress-reporting path consume only the latter.* All five incidents are one disease: a claim was cheaper to consume than a check, and something downstream consumed it.

---

## Family II — Destruction failures: the factory eats its own work

Agent factories run destructive operations (resets, checkouts, overwrites) constantly and confidently. The failures here are not malice or even error in the operation — they are correct operations executed against a world that held more than the operator knew.

### #2 The Reset Massacre
*A routine clean-slate operation destroys unmerged work it didn't know existed.*
**Incident:** two finished, undrained slices (w1-03 light-pass, polish-02) destroyed by a lane pre-flight's `reset --hard`; a third survived only as a reflog orphan.
**Mechanism:** "reset to a clean state" is safe exactly when the state contains nothing unique. Queue-then-reset workflows make this false in the gap between a task finishing and its output merging — the most dangerous window in the whole loop.
**Rule:** never refill a lane whose branch holds unmerged content; drain before refill, always. Every destructive pre-flight must *verify emptiness itself* (is this branch's content on main?) and STOP if not — safety lives in the pre-flight's own check, not in the scheduler's beliefs. (Gold Rush encodes the exact wording as the SAFE-DUPE pre-flight, Chapter 09's task template.)

### #11 The Missing Remote
*Weeks of work exist on one disk, and nobody notices because backups are nobody's task.*
**Incident:** the factory ran for weeks with no git remote — no origin existed to push to.
**Mechanism:** autonomous factories generate work faster than humans audit infrastructure; nothing in the daily loop *fails* when backups don't exist, so the gap is silent until the disk isn't.
**Rule:** backup is law, wired into the loop itself (fires push after every handoff), not a chore. Any ops review asks: "what dies with this disk today?"

### #15 The Blind Hand-Merge
*A stale, conflicted branch is merged by hand, and subtle corruption walks in wearing a resolved-conflict costume.*
**Incident:** a four-way conflict on a 20-hour-stale branch, hand-merged.
**Mechanism:** conflict resolution under staleness is a judgment task performed with the least possible context — exactly where a model (or human) silently keeps the wrong side of a hunk. The cost asymmetry is brutal: agent hours to redo work are cheap; corruption that gates green is nearly unfindable.
**Rule:** stale + conflicted = RE-LAND — write a fresh task against current main, keep the old branch as a salvage reference (`save/<name>`, renamed `archive/<name>` once the re-land ships). "Agent hours are cheap; subtle merge corruption is not." The salvage lifecycle also keeps the ledger honest: `save/` counts as waiting work; `archive/` never does.

**The family's general law:** *before any destructive or judgment-heavy git operation, the operation itself must prove the world is what it assumes — and when work can be redone cheaply, redoing beats resolving.*

---

## Family III — Congestion failures: the factory jams its own pipe

Throughput intuitions imported from human teams ("keep everyone busy," "queue up plenty of work") are actively wrong for agent factories, whose bottleneck is almost never production.

### #3 The Compound Pile
*Outputs stack up on a shared resource until everything blocks.*
**Incident:** five main-slot outputs stacked uncommitted on the shared working tree; every merge in the factory blocked for hours.
**Rule:** identify the choke resource (in a git factory: the clean main tree) and ration it — main queue ≤1 while ≥3 drains wait; drains outrank refills; "protect the clean-main window like money."

### #9 The Deep Queue Fallacy
*Deep queues, meant to prevent starvation, cause the deadlocks they were meant to prevent.*
**Incident:** packing queues 5-deep produced stale masters, multi-output lane branches, and merge deadlocks.
**Rule:** lanes busy ≠ queues long. Target 1–2 per lane, refill on merge. Throughput lives in the DRAIN rate — add verification capacity, not inventory. (This is Little's Law wearing work boots: WIP beyond the bottleneck's service rate only adds latency and risk.)

### #12 The Gate Contamination
*Verification runs against a surface something else is concurrently mutating, producing false results that get believed.*
**Incident:** a suite gated while a live task edited its files → false reds, and the failures were attributed to the innocent slice.
**Rule:** never gate a spec whose files a live task is editing; give verification its own isolated resources (scratch ports, detached worktrees) so a gate result is attributable to exactly one diff. A false red is not merely wasted time — it poisons the factory's known-failure fingerprint database (Chapter 05).

**The family's general law:** *model your factory as a queueing system whose bottleneck is verification; spend on the bottleneck, ration the shared resources, and isolate every measurement.*

---

## Family IV — Product-truth failures: the factory ships something other than what anyone meant

These failures pass every technical gate. They are failures of *meaning* — the code is right and the product is wrong — which makes them invisible to any purely mechanical check.

### #6 The Billboard Mistake
*A genre default silently overrides the owner's taste.*
**Incident:** damage bars camera-billboarded (the genre default); owner: "they should orient at their object."
**Rule:** genre defaults lose to owner rulings; check the recorded playtest docs before choosing any convention; when in doubt, the object's frame (the product's internal logic), not the genre's habit. Generalized: a model's priors are a third writer in your design process — audit them like one.

### #10 The Debug-Gate Leftover
*A feature ships technically complete but invisible to actual players.*
**Incident:** the crafting bench and the agent were invisible in normal play for a day — both worked perfectly behind a `?debug` flag nobody ships with.
**Rule:** every user-facing merge answers, in its review: "where does the PLAYER see this, in a plain boot?" — backed by an e2e test that runs *without* debug flags. Test-as-a-user is a gate, not a nicety.

### #14 The Vocabulary Stretch
*A generative system is asked for something just outside its contract, and the temptation is to stretch the contract rather than refuse.*
**Incident:** a player crafting order the epoch's contract vocabulary couldn't express; the pressure was to approve it anyway.
**Rule:** generator proposes, contract disposes — reject-don't-stretch. And write rejections that foreshadow ("the sea asks for a different science") so refusal reads as world-building, not failure. Generalized: every AI content pipeline needs a validating contract *and* a policy for near-misses, decided before the first near-miss arrives — because stretched contracts don't snap back.

**The family's general law:** *technical gates verify that you built the thing right; only recorded owner taste, player-visibility probes, and hard content contracts verify you built the right thing. Fund both kinds.*

---

## Family V — Runaway autonomy: the factory does too much

The rarest family, and the one outsiders expect to be the whole story. Two incidents in fifteen days — but both expensive, and both structural rather than model-misbehavior.

### #7 The Runaway Generator
*An automated write-loop, triggered by system state instead of intent, mints garbage all night.*
**Incident:** an auto-post loop minted a crafting order per minute, all night.
**Rule:** nothing writes on boot without an explicit player (or owner) action at its root; every write-sink gets a dupe-guard; watchdog thresholds (pending > 5) are alarms someone must answer, not decoration. Generalized: every autonomous writer needs an intent test ("what human action authorized this write?") and an idempotency guard, because scheduled sessions *will* re-trigger whatever can be re-triggered.

### #8 The 824k Flail
*An agent is handed already-done work and, rather than detecting that, re-derives it at enormous cost until it crashes.*
**Incident:** a stale master, re-queued, sent the implementer re-deriving an already-merged diff into an 824,000-token crash.
**Rule:** never queue a master marked SHIPPED; stale-check any master >2 days old against current main before queueing. Generalized: agents do not reliably notice "this is already done" — the *dispatcher* owns freshness. Staleness checks belong at every queue mouth, priced against what one flail costs (in this case, roughly a day of an implementer's budget).

**The family's general law:** *autonomy failures are dispatcher failures. The model that loops or flails is downstream of a queue that fed it a false premise or a trigger that fired without intent. Fix the mouth of the pipe, not the temperament of the worker.*

---

## Running your own catalog

Three practices make a mistake catalog live rather than decorative:

1. **Convert incidents to law in the same day, in the operating file itself.** Gold Rush's catalog lives in the constitution every session must read — §5, titled "what a weaker model WILL do here" — not in a postmortem folder nobody reopens. Several entries carry amendments dated within hours of the incident.
2. **Cite catalog entries at decision points.** The factory's skills and templates reference entries by number at exactly the step where each failure happens ("confirm the run made a REAL diff (Mistake #1)"). A catalog you have to remember is a catalog you'll forget; a catalog embedded in checklists fires automatically. The citations also run *backward*: reviews credit the catalog when it prevents a repeat ("s623's 'likely MAIN-MOVED' worry was STALE (Mistake #4)" — the catalog caught a session about to inherit a false belief).
3. **Treat a new failure as a gift.** The book's closing rule in Chapter 01 applies: an incident that maps to no existing entry is your next entry. Fifteen days produced sixteen. The rate falls fast — most of these are from the first ten days — but it never reaches zero, and a factory whose catalog stopped growing has usually just stopped looking.
