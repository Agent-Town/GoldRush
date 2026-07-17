# Chapter 02 — The Cast
### The role architecture: who does what, and the boundaries that make it safe

A Foundry is not "an AI that builds a game." It is a *cast* of differently-shaped roles — some human, some attended AI, some scheduled AI, some specialist AI — each with a narrow charter and hard boundaries. The narrowness is the point. Every role below exists because a broader version of it failed, and every boundary is load-bearing.

The five roles, in one line each:

| Role | One line | Cadence |
|---|---|---|
| **Owner** | Verdicts everything, authors nothing | Whenever present |
| **Attended orchestrator** | Designs, decides, untangles — the thinking seat | When the owner is present |
| **Fires** | Scheduled headless sessions that gate, merge, refill, and keep books | Every 5–15 min, 24/7 |
| **Runner + implementer** | Executes exactly one task file, on one branch, inside a firewall | Continuous, per queue |
| **Specialist sessions** | Long-lived experts on granted territory, delivering waves for gates | Per grant |

---

## The Owner

**Charter.** The owner verdicts, playtests, pays, and rules. He authors nothing — not code, not specs, not tasks, not art prompts. His contributions are *decisions* (recorded verbatim per Law 7), *taste* (playtest findings, art verdicts, "these don't look too different?"), *authorization* (money, external services, anything irreversible), and *the north star* (in Gold Rush: his two kids, ages 12 and 14, named in the vision docs as the target players).

**Boundaries, and why.**
- **The owner never blocks the pipeline.** Constitution §2: *"never block on him — park with a veto window instead."* Questions are batched, always with options and a recommendation; work that is reversible and inside ratified specs proceeds in his absence with a one-line veto window in the handoff ("done X per <ruling>; reverse with one word"). The alternative — a factory that idles awaiting human input — throws away the one thing an AI factory has over a human one: it never sleeps.
- **The owner never does chores.** When art generation was manual, it was drifting toward being "an owner chore"; the factory made it law that generation runs through the art slot, machine-side. If the owner is doing repetitive labor, the factory has failed at its one job.
- **Owner attention is the scarcest resource, budgeted like money.** Gold Rush caps owner-facing news at 3 items/week with the rest batched into digests; playtest questions arrive as decision sheets with recommendations ("one nod ratifies"). The design target: every minute of owner time produces a ruling, not a status update.

**What this looks like in practice.** The owner's recorded interventions read like a judge's docket: *"they should orient at their object"* (a rendering ruling), *"the style does not yet reflect the mood... the player is fighting for their life not on a holiday"* (an art-direction law), *"I want to greenlight all of these 27 maps"* (a scope verdict), *"of course upgrading should improve production... otherwise it does not make sense"* (a balance ruling delivered *in play* — and constitution §4.7 makes play behavior itself a ruling). Each became dated law within minutes of being spoken.

## The Attended Orchestrator

**Charter.** The attended session is the factory's thinking seat, live only when the owner is around: it writes specs, makes design forks, untangles what the fires escalate, runs the owner conversation, and gates the highest-stakes merges (specialist waves, conflicted re-lands). It is the only role allowed to change the law itself.

**Boundaries, and why.**
- **It implements almost nothing.** Gold Rush's constitution permits attended implementation only for: config, docs, specs, review fixes under ~20 lines, and pipeline scripts. Everything else goes through a task file and the runner. The reason is subtle: the attended session is the only role whose output *isn't* gated by someone else by default. Keeping its hands off the product keeps the gate system closed — and keeps its context free for the work only it can do.
- **It must leave a complete world behind.** Attended sessions end unpredictably (the human leaves). Everything it decides lands in files in the same turn (Law 1); its handoffs are the factory's most information-dense documents because the next reader may be a much smaller scheduled model at 3 a.m.
- **It writes law for a weaker successor.** The Gold Rush constitution opens with its own purpose statement: written *"so a less capable model can work here at full level."* This is the attended role's deepest duty: convert its own judgment into rules cheap enough for any model to follow. Every clever thing the attended session does that isn't written down is a thing the factory can't do tomorrow.

## The Fires — scheduled headless sessions

**Charter.** A fire is one autonomous increment of the factory loop, launched by a scheduler (launchd/cron) every 5–15 minutes, running a headless model session against a written protocol file (`scripts/fire.md` in Gold Rush; template in Chapter 09). A fire drains finished work through the gates, merges it, refills empty queues from the backlog ladder, authors new task masters when a ladder runs dry (from specs and evidence only — never invented), keeps the ledgers true, pushes backups, and exits. It is the factory's heartbeat and its janitor, and over a fortnight, Gold Rush fires produced 1,506 bookkeeping commits and the majority of its 228 gated merges.

**Boundaries, and why.**
- **A fire obeys a lock.** Line 1 of the status file is a semaphore: an `ACTIVE` stamp under 45 minutes old means another fire owns main — exit silently. A stale lock is dead — archive it honestly and take over. Without this, two fires merging concurrently would recreate the multi-writer corruption Law 4 exists to prevent.
- **A fire has a budget.** Up to 3 drains or ~35 minutes per fire (raised to 5/~50 in "pile mode" when the merge backlog is deep — an explicit owner throughput ruling, 2026-07-06). Budgets prevent the pathological long fire that holds the lock for hours; pile mode prevents budget worship when throughput matters more.
- **A fire triages in strict order, first match wins.** Bookkeeping debts → drains → failed-run recovery → standing corrections → refills → exit clean. The ordering encodes a hard-won priority: *drains outrank refills* (Chapter 03). And its final rule is the most important: **"Nothing to do: exit clean. NEVER invent scope."** An idle fire that manufactures work is more dangerous than an idle fire.
- **A fire may author, but only from evidence.** When a lane's ladder is dry, a fire may write the next task master itself — but ONLY from an existing spec slice plus its evidence chain, marked `FIRE-AUTHORED`, max one per fire. If the next work needs a design fork or bends canon: flag `PIPELINE-DRY` and leave it for the attended session. This one rule is what lets the factory run for days unattended without drifting off-spec.
- **The protocol file is the fire's whole mind.** Fires don't inherit context; they boot from law. Every amendment to fire behavior is an edit to the protocol file, dated, with the incident that earned it inline. Gold Rush's fire.md reads like case law because it is case law — e.g. the ATTENDED-COEXISTENCE amendment, written after a night when fires politely refused to merge finished work because a human-attended session *existed*, starving the board for hours: the corrected rule is precise ("drains are blocked only by WHO OWNS THE DIRT"), dated, and cites its incident.

## The Runner + Implementer

**Charter.** The runner is a dumb, reliable shell loop (a terminal script) that watches queue directories, feeds each queued task file to an implementing model (Codex CLI in Gold Rush), logs the run, and moves the file to `done/` or `failed/`. The implementer executes *exactly one task file*: it reads the task's READ-FIRST list, obeys the firewall, implements the numbered scope, runs the self-check, and replies READY-FOR-GATES.

**Boundaries, and why.**
- **The implementer never integrates.** It doesn't touch the status file, specs, reviews, other lanes, or git history beyond its own lane branch. Its output is a *claim* — a done-move — and claims are gated by someone else (Chapter 03). The separation is the factory's answer to self-review bias: no model gates its own work. (Corollary, from the gate chapter: no model *authors its own acceptance criteria* either — the Gate-Authorship Law.)
- **One task, one slice, report-don't-fix.** The exactly-one-task contract is what makes firewalls enforceable and diffs classifiable. An implementer that "also noticed and fixed" something has produced an ungatable diff.
- **The runner is deliberately not smart.** It retries nothing on its own judgment, interprets nothing, and its exit codes prove nothing (`rc=0 done-move ≠ success — GATE EVERYTHING`). All intelligence lives in the task file (authored under gate-quality law) and the drain (gated under evidence law). Putting judgment in the runner would create a third, unauditable place where decisions happen.
- **Model routing is owner law, not vibes.** Which model tier runs which class of task is a recorded ruling (Gold Rush, 2026-07-11: default implementer at medium effort; cheap tier reserved for art batches and mechanical tasks; high effort for sim-critical; ultra "requested, never ambient"). Cost discipline is a law like any other.

## The Specialist Sessions

**Charter.** A specialist session is a long-lived interactive expert (in Gold Rush: "Sol" sessions doing Blender 3D work) operating under a *territory grant*: a queue document that names its identity, its branch namespace, its TOUCH-ONLY paths, its laws, and its current wave of work. Specialists deliver waves ending in READY-FOR-GATES + a tip hash; the attended session gates and merges. Chapter 07 is their full protocol; here they matter as a cast role.

**Boundaries, and why.**
- **Territory, not tasks.** Unlike the implementer's one-task contract, a specialist holds standing territory ("the town ground plate and everything on it") and works wave after wave inside it. The tradeoff is deliberate: specialists build deep context (style, tooling, judgment) that one-shot tasks can't, and the territory boundary is what keeps that freedom from colliding with the rest of the factory.
- **They never self-merge, never touch main.** Fresh branch per wave, push, announce, keep working. Merges are async and attended-gated.
- **Findings cross boundaries; edits never do.** The specialist who finds a defect in another territory files a finding (F-ID, evidence, file reference) and keeps modeling. The finding may *become* their next grant — the tavern-repair case from Chapter 01 — but only through an explicit grant, never through initiative.

This role is the factory's proof that the model matters less than the law: the same protocol governed sessions from a different model vendor entirely, working in Blender rather than TypeScript, and their 213 GLBs merged through the same gates as everything else.

---

## Why the cast is shaped this way

Three design principles generate the whole architecture.

**1. Separate claiming from gating.** Every producing role (implementer, specialist, fire-as-author) hands its output to a *different* role for verification. The implementer claims; the fire gates. The specialist claims; the attended session gates. The fire authors; the attended session reviews. There is no path to main that passes through only one mind. This costs latency and buys the only thing that matters at scale: main is always believable.

**2. Match autonomy to reversibility.** The owner holds everything irreversible (money, canon, deletion, publication). The attended session holds everything that changes law. Fires hold everything mechanical-but-judgmental (gating, merging) under strict written protocol. Implementers hold only what a firewall can contain. When you're unsure where a new capability belongs, ask: *what's the blast radius when it's wrong?* — and place it with the role whose oversight matches.

**3. Every escalation has exactly one address.** Missing spec, design fork, canon question, money → owner desk (with a recommendation; flag the thread dry, continue other work). Verified law conflict → stop that action, write the finding, continue. Failed twice → third attempt only with a changed premise, else escalate. Uncertain fact → run the command that answers it. Nothing waits on a human unless a human is genuinely the only one who can answer — and even then, the factory parks the thread and keeps moving on everything else.

The cast, in short, is an argument about trust: trust flows from evidence, evidence flows from separation of duties, and separation of duties is only cheap when the roles are written down so precisely that a fresh model at 3 a.m. can play its part perfectly having never seen the play before.
