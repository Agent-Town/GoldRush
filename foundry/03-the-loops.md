# Chapter 03 — The Loops
### How anything ships: the pipeline, its claims, and its physics

Everything the Foundry produces moves through one loop. Learn its stages and — more importantly — learn which stages are *claims* and which are *facts*, because the single most common way an agent factory deceives its operators is by counting claims as completions.

```
SPEC ──▶ MASTER ──▶ QUEUE ──▶ RUN ──▶ DONE-MOVE ──▶ DRAIN ──▶ LEDGER
(design)  (task     (copy to  (impl.  (a CLAIM,     (gates on  (same-commit
           file)     a slot)   works)  not done)     merged     truth)
                                                     tree)
```

## Stage by stage

**1. Spec.** Design happens in spec directories, attended-authored, with a status line (DRAFT/RATIFIED + date), owner directives verbatim, a laws section, numbered slices each ending in a *playable checkpoint with its gate*, an integration map (what it touches, what it must not), and ratification questions batched at the bottom. A spec is the only legitimate parent of work; a fire that can't find a spec slice for a lane's next work flags PIPELINE-DRY rather than inventing one. Gold Rush's mature specs are risk-first: they name the ways the feature could eat the project and place a slice-sized gate where each risk dies (the Charter Press spec names "schema drift → dies at CP-01's round-trip gate; scope creep → dies against the layer ladder" — the make-or-break question is spent on one cheap slice *first*).

**2. Master.** A unit of work becomes a task master: one file, one slice, with role and workdir, a READ-FIRST list of real paths, a pre-flight for its slot, a WHY that quotes its evidence (owner words, review finding, or spec slice — dated), numbered *testable* scope, a two-sided firewall, and a self-check naming exact suites and artifact paths. Chapter 09 has the template. The master is written so it *cannot fail the known ways* — each required section corresponds to a named incident from Chapter 04.

**3. Queue.** The master is **copied** (never moved) into a slot queue. Slots are parallel work stations: in Gold Rush, `main` (the repo root — serial, for cross-cutting work), `lane-a..d` (git worktrees with themed ownership: meta/progression, agent, world/visual, perf/foundation), and `art` (generation only). The master stays in `tasks/` as the reference copy — queues are consumable, masters are durable. A master older than ~2 days gets a stale-check against current main before queueing; the world moves fast enough at 200 commits/day that a two-day-old premise may be false (and one stale master, re-queued blind, once burned 824,000 tokens re-deriving an already-merged diff — Mistake #8).

**4. Run.** The runner feeds the queue file to the implementing model, logs everything to `tasks/runs/`, and on completion moves the file to `tasks/done/` (or `tasks/failed/`). The implementer commits on its lane branch, path-scoped, and ends with READY-FOR-GATES.

**5. Done-move — a claim, not a completion.** This is the load-bearing distinction of the whole chapter. A file appearing in `done/` means *the run ended*. It does not mean the work exists (the run may have been a silent no-op — rc=0, 69 seconds, zero diff, Mistake #1), does not mean the work is good (nothing has been gated), and does not mean the work is merged (it sits on a lane branch or a dirty tree). Gold Rush learned to treat done-moves the way a bank treats a check: an instrument that *asserts* funds, honored only after clearing. Counting done-moves as progress produced the factory's Mistake #13 (the Premature Celebration: a wave declared "implemented" when half its done-moves were no-ops).

**6. Drain — where claims become facts.** A drain takes one finished output and lands it on main *through the gates*: verify a real diff exists, classify every changed file against main's movement since the branch's base, merge onto clean main, run the full gate battery **on the merged tree** (not the branch — the branch passing means nothing if main moved), write the review file with real numbers, commit path-scoped, and update every ledger the event touches *in the same commit*. Chapter 05 covers gating in depth. Drains are strictly serial within a fire: each fully gated and committed before the next begins. One narrow exception exists (a two-drain batch when the diffs are provably disjoint) and even it re-runs one combined battery — the gate content is never thinned, only repetition is.

**7. Ledger.** The backlog line flips to ✅ SHIPPED with the merge hash, in the drain commit itself. Anything whose GATE condition just opened gets un-gated. Superseded lines are retired-not-deleted. The dashboard regenerates from the ledger. Same-commit ledger discipline is what keeps the board true: a ledger updated "later" is a ledger that lies for the duration (Mistake #5, the Ghost Line — a task showed "blocked 594 min" nine hours after it had merged, because the line and the event traveled in different commits).

## The physics: throttle, refill, and the deep-queue fallacy

The loop has fluid dynamics, and three laws govern them. All three were learned by jamming the pipe.

**Drains outrank refills.** When finished work is waiting to merge and empty queues are waiting to fill, merge first — always. Undrained output is *risk*: it sits on branches (where a careless reset can destroy it), or dirties the main working tree (where it blocks every other merge). Refills, by contrast, can wait forever at zero cost. Gold Rush encodes this as fire triage order, and doubles the drain budget when the pile is deep ("merge throughput outranks fire brevity when the pile is deep" — owner ruling, 2026-07-06).

**The throttle: protect the clean-main window like money.** Tasks running in the main slot hold the shared working tree dirty, and a dirty main blocks *all* merges from every lane. So: main queue ≤1 item whenever ≥3 drains are waiting. The forging incident (Mistake #3, the Compound Pile): five main-slot outputs stacked uncommitted on the shared tree, and every merge in the factory was blocked for hours while they were untangled. Generalized: **identify the resource every parallel stream needs (in a git factory, a clean main tree), and ration whatever occupies it.**

**The deep-queue fallacy.** Packing queues 5-deep feels like throughput and is actually its opposite (Mistake #9). Deep queues mean masters go stale before running (the world moved), lane branches accumulate multiple undrained outputs (raising reset-destruction risk and merge complexity), and the factory's real bottleneck — the *drain rate* — is untouched by queue depth. The law: target 1–2 items per lane, refill on merge. "Lanes busy ≠ queues long. Throughput lives in the DRAIN rate." If you want more throughput, add drain capacity (more fire cycles, batch-safe gates), not more queued work.

## Failure paths, made explicit

The loop's honesty depends on failure being a first-class route, not an embarrassment.

- **Failed runs are read, not retried.** A failure log gets read before any decision; known mechanical failures (the model provider's credit wall has a recognizable signature) are re-queued once; anything else gets a finding. **Two failures on the same task = stop; a third attempt is only legal with a changed premise** — a refreshed master, new evidence, a different approach. "Identical retry is forbidden." Beyond that: escalate — reassign to a different worker class, decompose into smaller slices, or park with reasons. Retrying the identical thing a third time is how factories convert one failure into a token bonfire.
- **No-ops must explain themselves.** Any run that changes nothing must write WHY into its report; every drain verifies a real diff before gating. Silence is the enemy: the factory's founding incident (Mistake #1) was a task marked done with rc=0 and zero diff, discovered only later.
- **Blocked is a flagged state, not a mood.** Every blocked item carries a named blocker and its unblock condition as a checkable GATE line ("GATE: <condition>"). A block-clock over ~3 hours triggers a git-verified audit of whether the blocker still exists — not sympathy (Mistakes #4 and #5 both lived in unexamined "blocked" states).
- **External outages get a machine state, not improvisation.** When the implementing model's provider walls (credits, auth), a flag file (`CODEX-WALL`) suspends refills while drains and bookkeeping continue; each fire probes once, and on recovery runs a mandatory *recovery sweep* — because walls eat work silently (six tasks once vanished into a wall-plus-lane-reset gap before the sweep became law).

## The loop's clock

Two cadences drive everything: the runner's continuous consumption of queues, and the fires' 5–15 minute cycle of drain-refill-bookkeep. The attended session and the owner sit *outside* the clock — they inject specs, verdicts, and untangles, but the loop never waits on them (park-with-veto-window, Chapter 02). This is what "the factory runs while you sleep" actually means mechanically: every role that requires a human is advisory to the loop, and every role inside the loop is scheduled or event-driven.

A closing check for your own adoption: walk your pipeline and label every stage either CLAIM or FACT. If any stage's output is treated as fact but verified by nobody downstream, that stage is where your factory will lie to you first.
