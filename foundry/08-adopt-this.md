# Chapter 08 — Adopt This
### Standing up a Foundry for a new game: the minimum, the growth path, the honest prerequisites

Everything so far describes a factory at maturity. You should not build that on day one — Gold Rush didn't. It reached the architecture of Chapters 01–07 by growing one mechanism at a time, each added when a specific pain arrived. This chapter is the adoption manual: what you truly need before starting, the smallest factory worth running, the staged growth path with its triggers, and the honest costs.

---

## The prerequisites (read these before spending anything)

**1. An owner who will verdict, promptly and honestly.** The factory's only irreplaceable component is a human who plays the builds, has taste, and answers decision sheets. If the owner won't playtest weekly and answer batched questions within a day or two, threads park forever and the factory produces confident wrongness at scale. Note what the role does *not* require: coding ability, prompt skill, or daily hours. Gold Rush's owner spent his factory time playing the game and saying things like "it does not really look like a real train" — that was enough, because the machinery converts sentences like that into law.

**2. A product that can prove itself to a machine.** The gate system (Chapter 05) requires that "working" be checkable without a human: automated end-to-end tests against a real boot, a type system, a reproducible build. Browser games are close to ideal (Playwright can play them; a URL deploys them). If your product's correctness can only be judged by hand, fix that first — the factory multiplies whatever verification you have, including none. The corollary is architectural: the earlier you establish determinism and single-writer invariants in the product itself (fixed timestep, event logs, one system owning each resource), the more the *game* can be gated like the *factory*. Gold Rush's sim determinism, decided in week one, is what later made replay tests, boss choreography verification, and even the playbook/persistence roadmap possible. Determinism is a gift your day-one self gives every future gate.

**3. Model capacity across at least two tiers, budgeted like payroll.** You need an orchestrator-class model (attended sessions, fires, gating) and an implementer-class channel that is cheap enough to run constantly and *walled* — meaning its outages are survivable (Chapter 03's wall machinery). Two practical warnings from the record: subscription limits and credit walls are weekly weather, not rare storms — the factory needs written laws for what suspends and what continues when a provider walls; and model routing (which tier does what) should be a recorded owner ruling, because ambient "use the best model" burns budget invisibly.

**4. A machine that stays on, and a remote that exists.** A Mac mini's worth of always-on compute runs the whole loop: a cron/launchd scheduler for fires, a terminal for the runner, disk for worktrees. And before anything else: create the git remote and wire backup pushes into the loop. Gold Rush ran for weeks with everything on one disk (Mistake #11); you get to skip that one for free.

**5. Tolerance for verification overhead.** Roughly half of Gold Rush's commits are factory bookkeeping, and every merge costs a gate battery plus a review file. That overhead *is the product* — it's what makes the other half of the commits trustworthy — but if you measure your factory by lines of feature code per token, the Foundry will look wasteful right up until the week it doesn't.

---

## Day one: the minimum viable factory

The MVF is one attended session, one implementer channel, and four files. No fires, no lanes, no specialists.

1. **The constitution seed** (template: Chapter 09, `CLAUDE-template.md`). A dozen laws, not eighty: read-order, truth-lives-in-files, evidence-not-vibes, path-scoped commits, the escalation rules, and an *empty* mistake catalog with the header already written. You cannot write Gold Rush's §5 on day one — you haven't paid for it — but you can build the shrine before the relics arrive: the catalog's *form* (named incidents, dated rules) is adoptable immediately, and the discipline of filing every incident there is the single highest-leverage habit in this book.
2. **The implementer contract** (`AGENTS.md` or equivalent): the read order, the one-task rule, report-don't-fix, the quality bar, and your product's red lines (your ADR-001 equivalents — write at least the content red-lines on day one; they are cheap now and expensive to retrofit).
3. **The backlog** — one file, the Completeness Law in its header, and every known work item as a line with a status.
4. **The first spec** — one milestone, risk-first slices, each ending in a playable checkpoint with a named gate.

The MVF loop: the attended session authors a task master (template in Chapter 09), hands it to the implementer, gates the output by hand against the battery, writes the review file, merges path-scoped, flips the backlog line in the same commit. Do that ten times *manually* before automating anything — the manual reps are how you learn what your gates actually need to be, and the review files you write become the exemplars your fires will imitate later. (Gold Rush's fire.md says "see git log for the house voice" — that only works because attended sessions laid down the voice first.)

## The growth path: add each mechanism when its pain arrives

**Stage 2 — the runner and queues.** *Trigger:* the attended session spends more time babysitting implementer runs than designing. Add the dumb runner loop (script, not model), queue directories, done/failed moves, run logs. You now have claims-vs-facts (Chapter 03) as physical reality — and you must add the done-move discipline the same day: a done-move is not done.

**Stage 3 — the fires.** *Trigger:* finished work waits hours for you to gate it, or you want overnight progress. Write the fire protocol file (template in Chapter 09): lock, triage order, drain budget, gate battery, handoff form. Start with a long cadence (30–60 min) and drains-only — no refill authority, no authoring authority — and extend the charter one clause at a time as trust accumulates. The lock and handoff discipline must be in from the first fire: two fires without a semaphore is Mistake territory immediately.

**Stage 4 — lanes.** *Trigger:* serial throughput caps you; independent workstreams (meta systems vs. visual polish vs. perf) contend for one working tree. Add git worktrees with themed ownership, the lane pre-flight (SAFE-DUPE wording, verbatim — Chapter 09), and the three congestion laws *before* the congestion: drains-outrank-refills, the main throttle, 1–2 deep queues. Every lane you add multiplies both throughput and the number of ways Mistakes #2, #3, and #9 can happen; the laws are the price of the lane.

**Stage 5 — fire authoring and refills.** *Trigger:* ladders outpace attended authoring; lanes idle waiting for masters. Grant fires the refill duty, then the authoring duty with its hard limit (only from a spec slice plus evidence; PIPELINE-DRY otherwise). This is the moment the factory becomes self-feeding — and the moment the never-invent-scope law carries the whole weight.

**Stage 6 — specialists.** *Trigger:* a work class needs accumulated judgment (3D, audio, narrative) and slices poorly. Charter one specialist with the Chapter 07 protocol: territory grant, queue doc, wave contract, style gates. Add the continuous-wave and fresh-reference laws when (not if) you catch the session idling at a gate or working from a stale reference.

**Stage 7 — the canon pipeline.** *Trigger:* content volume makes contradiction possible — a second writer touches lore, or generated content references design facts. Rulings ledgers and read-before-write first; bundles when you design ahead of implementation; printings-and-weaves when a long-form artifact accumulates.

At every stage the meta-rule is the same: **the mechanism arrives with its laws or it doesn't arrive.** Most of Chapter 04's tuition was paid at stage boundaries — automation added a day before its discipline.

## The costs, honestly

- **Money.** Two-plus model subscriptions at working tiers, plus generation credits for art if you use them. Assume the implementer channel walls regularly and the orchestrator tier is your real cost center. (This book won't quote prices; they change monthly. The structural fact that survives pricing changes: verification tokens will rival production tokens, and that ratio is correct.)
- **Owner time.** Budget: one real playtest session and one decision-sheet sitting per week, minimum, plus one-word verdicts ad hoc. Under an hour a day ran Gold Rush at full burn.
- **Calendar.** The factory itself takes days, not weeks, to stand up — the MVF is an afternoon. But expect the first week's throughput to go substantially into the factory: templates, gates, the first incidents, the first laws. Gold Rush's day-4-through-7 history is half constitution-writing. That investment is why days 8–15 shipped ten eras of content.
- **Emotional cost, named plainly:** the factory *will* destroy some work, lie to you at least once, and burn a day's tokens on a flail — early, while the catalog is thin. The difference between adopters who end up with a Foundry and those who end up with a cautionary blog post is entirely in whether incident one becomes law one.

## What transfers, what doesn't

**Transfers whole:** the constitution's eight laws; the cast and its trust architecture; the loop with claims-vs-facts; the mistake catalog's five families and the naming discipline; gate authorship and review files; territory grants and wave protocol; rulings-verbatim and the decision-sheet form.

**Transfers as a pattern, refill locally:** the gate battery's contents (your product decides); slot/lane themes; style gates (author perceptual gates for *your* art's failure modes); era bundles (any long product arc: seasons, campaigns, expansions); the specific escalation addresses.

**Does not transfer:** any individual law's Gold Rush constants (45-minute locks, 15% perf budgets, 2-day staleness, three-drain budgets). These are tuned numbers, and the tuning *method* — set a number, watch it fail, amend with a dated reason — is the transferable part.

## When not to build this

Honesty clause. The Foundry is the wrong tool when: the product fits in one person's head and one model's context (just build it); correctness can't be machine-checked and can't be made checkable (the gates have nothing to hold); no one will play the owner role (verdicts are the input the machine cannot synthesize); or you need the *process* to be the product's secret (a factory this documented is legible by design). And it is emphatically the wrong tool if you aren't willing to let it run — a factory whose every action awaits human approval is an expensive way to type slower.

But if you have a product that can prove itself, an owner who will rule, and the stomach for two weeks of tuition — the machine described in this book took fifteen days to build a ten-era game, and it is yours to copy. Start with four files. Chapter 09 has them.
