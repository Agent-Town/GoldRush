# Chapter 01 — The Constitution
### The eight laws everything else stands on

A factory of AI workers has one structural weakness that no amount of model capability fixes: **sessions end, and everything a session knew ends with it.** Context windows compact, headless runs terminate, tomorrow's orchestrator is a fresh instance with no memory of today. The constitution is the set of laws that make the factory *survivable* under that condition — laws about where truth lives, what counts as done, and who may write what.

Each law below follows the same form: the general statement, the incident class it prevents, and the Gold Rush example that forged it. Adopt the statements; keep your own incidents.

---

## Law 1 — Truth lives in files, and chat is not a ledger

**General statement.** Every durable fact — every decision, every state claim, every piece of work — must land in a file that the next session reads, in the same turn the fact is established. Conversation, model memory, and "I'll note that down later" do not exist. A factory's real product is its file system; the code is a side effect of a well-kept ledger.

**Why.** The failure class is *evaporation*: a decision made at 14:00 in an attended chat is gone by the 14:05 headless fire, which then re-litigates it, contradicts it, or — worse — half-remembers it. Any fact that lives only in a conversation is a fact the factory does not have.

**Gold Rush.** The constitution itself (`CLAUDE.md` §4.8) states it as: *"Everything durable goes in a file the next session reads. Chat is not a ledger. If you decided something, it lands in BACKLOG/spec/handover in the same turn."* The factory enforces a read order at every session start — status line, backlog, handover, health board — precisely so that a fresh session boots into the same world the last one left. The corollary law, the **Completeness Law** (owner ask, 2026-07-06): *"every known work item lives HERE — if work is discovered anywhere, it gets a ladder line in the same commit."* An item missing from the ledger is invisible, and invisible = forgotten. The factory learned this when an owner-requested feature ("Demo Day") starved for twenty hours because it existed in intent but not on the ledger.

---

## Law 2 — Evidence, not vibes

**General statement.** No claim of completion, correctness, or state is accepted without a checkable artifact: a passing suite named by name, a screenshot at a real path, a measured number, a commit hash. "It works," "tests pass," "this is done" are vibes. A suite count, a hash, and a screenshot are evidence.

**Why.** Language models are fluent claim-generators, and fluency is not correlated with truth. In a factory where the reviewer is *also* a model, unverified claims compound: session A claims, session B inherits the claim, session C builds on it. The only firewall is to make claims cheap to verify and to refuse the unverified ones categorically.

**Gold Rush.** Every merge to main carries: TypeScript clean, build green, the slice's own spec green, adjacent suites green, zero console/page errors on a plain boot, on desktop *and* a 390px mobile viewport, with screenshots in `reviews/shots-*/`. That battery is not a best practice — it is the *definition of merged*. The whole gate system is Chapter 05; the point here is constitutional: evidence is not a quality bar layered on top of the factory, it is the factory's epistemology.

---

## Law 3 — Path-scoped commits, one concern per commit

**General statement.** Workers commit only the exact paths their task owns — never "add everything" from a shared root. One concern per commit, with a typed message. In a multi-writer repo, a wildcard add is not a convenience; it is a weapon that fires at whoever else has work in flight.

**Why.** The failure class is *cross-contamination*: an agent committing `-A` sweeps up another agent's half-finished work, host-side debris, or an orchestrator's in-progress bookkeeping, and now the history lies about who did what — and reverting one worker's mistake reverts another's success.

**Gold Rush.** `git add -A` at repo root is constitutionally banned (§4.2), a lesson from a retro-gate incident (commit `a674606`) where a blanket add entangled unrelated work. Every task master's firewall lists exactly which paths it may touch; every drain commits path-scoped; fire bookkeeping carries an `sNN:` prefix so factory noise is separable from product signal at a glance. (1,506 of the repo's 2,907 commits are prefixed factory bookkeeping — greppable, ignorable, auditable.)

---

## Law 4 — One writer per surface

**General statement.** Every mutable surface — a file, a subsystem, a ledger, a status line — has exactly one writer at a time, named in law. Two writers on one surface is not a merge problem to be solved later; it is a design failure to be prevented now. When ownership must transfer, it transfers explicitly.

**Why.** Concurrent-writer corruption is the classic distributed-systems failure, and an agent factory is a distributed system whose nodes cannot see each other. Unlike human teams, agents won't notice the other writer's half-typed intent. Locks, territories, and single-writer invariants are the only defenses that don't require awareness.

**Gold Rush.** The law operates at every scale. In the *game*: Economy is the sole gold writer, CombatSystem the sole damage resolver — invariants the test suites assert. In the *factory*: the status file's line 1 belongs to whoever holds the lock; the backlog is append-or-edit-in-the-same-commit-as-the-event; each parallel specialist session owns a branch namespace and an explicit TOUCH-ONLY directory list (Chapter 07). When two writers might touch main's tree at once, the constitution's answer is: *serialize — when unsure whether something is live, wait one fire cycle. It is never worth the untangle.*

---

## Law 5 — Placeholder-first: gameplay never waits on art

**General statement.** Define the *slot and contract* for every asset first — filename, dimensions, mount point, wiring — and ship gameplay against placeholders. Generated or hand-made art then replaces placeholders in batches, through the contract, without touching code. More generally: **decouple every slow, taste-driven pipeline from the fast, testable one by an explicit interface, so neither ever blocks the other.**

**Why.** Art (and audio, and copy) has unbounded iteration time and subjective gates. If code waits on it, the factory's throughput is hostage to its slowest, least automatable stream. If art lands *without* a contract, every batch is a code change and every code change risks the game.

**Gold Rush.** Constitution §4.3. Slots + layer contracts shipped first; gpt-image-2 batches replaced placeholders through `assets/layer-contracts/` + a ledger, in batches, one in flight at a time. The 3D program repeated the pattern at higher stakes: boss *systems* shipped with placeholder primitive shapes, and the real models wired in later render-only — the Dredge-Queen review (2026-07-17) states the law in its mature form: *"the model wires into the presentation layer; the sim never notices."*

---

## Law 6 — Firewalls are contracts

**General statement.** Every delegated task carries an explicit two-sided firewall: TOUCH-ONLY (the paths it may change) and NO (the things it must not change, even when they look wrong). A worker who finds adjacent problems *reports* them; a worker who fixes out of scope has violated the contract even if the fix is correct.

**Why.** Agents are helpful, and helpfulness without boundaries is how a one-file task becomes a twelve-file diff nobody can gate. The insidious version isn't malice or error — it's an agent *improving* something outside its lane, invisibly to the gate that was scoped to its lane. Out-of-scope fixes are ungated changes, and ungated changes are how regressions enter a green build.

**Gold Rush.** Constitution §4.5: *"Codex reporting adjacent problems = good; fixing out of scope = violation."* Every one of the 445 task masters carries the two lists. The pattern's payoff shows in the reviews: a specialist session (3D-C, wave 2) found broken geometry on another team's tavern model and *reported it as a finding instead of fixing it* — the finding was logged, a grant was issued, and the fix became that session's own next wave, gated properly. The review notes: "Good catch, correctly reported not fixed."

---

## Law 7 — The owner's words are law

**General statement.** The human owner's decisions are recorded *verbatim, quoted, and dated* in the specs and tasks they justify — never paraphrased into what the model thinks was meant. When the owner's observed behavior answers a design question, that behavior *is* the ruling, and it gets recorded too. Genre conventions, model preferences, and "best practice" all lose to an owner ruling.

**Why.** Two failure classes. First, *drift*: each paraphrase of a decision is a small mutation, and after three sessions of summarization the recorded decision no longer says what the owner said. Verbatim quoting is lossless; anything else decays. Second, *default-substitution*: models fill ambiguity with genre defaults, which silently overrides taste — the one contribution only the owner can make.

**Gold Rush.** Constitution §4.7. Every spec carries "owner directive, date" quotes; the mistake catalog's entry #6 (the Billboard Mistake) is the canonical default-substitution incident: damage bars were camera-billboarded because that's the genre default, and the owner ruled *"they should orient at their object"* — the general law extracted was "world things anchor in their object's frame; genre defaults lose to owner rulings." The canon pipeline (Chapter 06) is this law industrialized: rulings ledgers where every design fact is a dated quotation.

---

## Law 8 — Verify, don't inherit

**General statement.** Never act on a prior session's claim about the world — re-run the command that checks it (a log listing, a diff, a process grep, a file read) before acting, and write the verification line into your own handoff. Claims age; the world moves; and the cheapest thing in an AI factory is a two-minute check, while the most expensive thing is a confident action taken on a stale belief.

**Why.** In a relay of stateless sessions, beliefs propagate like rumors: each session inherits the last one's summary, and a claim that was true at 09:00 ("the lane is blocked, owner-side") gets repeated at 12:00, 15:00, and 18:00 after it stopped being true. Unlike human teams, there is no ambient awareness to catch it — only deliberate re-verification.

**Gold Rush.** Constitution §4 read-order rule: *"NEVER trust a claim you inherited. Verify with a command before acting on it."* The forging incident (Mistake #4, the Stale Belief): a fire repeated "deadlock, owner-side" for three cycles after the deadlock was fixed, starving the board. The mature form appears everywhere: drains verify shipped-ness with `git log main..branch` (empty = merged) rather than grepping commit *messages* — "which match every announcement of the thing" (Mistake #16) — and the specialist protocol extends it to art itself (the Fresh-Reference Law, Chapter 07: re-render your reference boards from freshly pulled files at every wave boundary; *"old boards are history, never guidance"*).

---

## How the laws interlock

These eight are not a list; they are a system.

- Laws 1 and 8 are a pair: files are the only memory (1), and even files' *claims* must be re-checked against the world before acting (8). Together they replace institutional memory.
- Laws 2 and 7 are a pair: evidence upward, authority downward. The factory proves what it did with numbers; the owner decides what it *should* do with words; neither substitutes for the other.
- Laws 3, 4, and 6 are the concurrency system: single writers (4), operating inside contracts (6), committing only what they own (3). This is what lets a dozen sessions share one repo without a coordinator watching in real time.
- Law 5 is the throughput law: it keeps the testable pipeline (code) and the taste pipeline (art, canon) decoupled so each runs at its own speed.

A useful adoption test: when something goes wrong in your factory, the postmortem should end by naming which of the eight was violated. In fifteen days of Gold Rush operation, every incident in the sixteen-entry mistake catalog (Chapter 04) traces to one of these. When you find an incident that doesn't, you've found your ninth law — write it down, date it, and name it after the failure.
