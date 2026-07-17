# THE FOUNDRY
### A product manual for running an AI game factory — with one real factory as the worked example

## What this is

The Foundry is a transferable operating system for building a game (or any large creative-technical artifact) with a small human team — as small as one person — orchestrating a fleet of AI workers. It is not a framework, a library, or a prompt pack. It is a body of **law**: role boundaries, work loops, evidence gates, failure catalogs, and file conventions that let autonomous and semi-autonomous model sessions produce shippable work around the clock without destroying each other's output, inventing scope, or lying to you about what they did.

Every law in this book was paid for. The worked example throughout is **Gold Rush**, a three.js browser game (survivors-like + tower defense + roguelite meta, ten narrative eras) built in this factory. Nothing here is aspiration or speculation; where a chapter says "never do X," there is a named incident where X happened, with a date and usually a commit hash. That tuition is the product. Anyone can write "use evidence gates." This book can tell you the sixteen specific ways an agent factory fails when you don't, because it failed all sixteen ways once, and then never again.

The commission for this book, in the owner's words (2026-07-17): *"extract our learnings, the factory, all the processes, the law, the setup... that would then be a potential product/engine that can be used for the next game."* This is that extraction. It is written to be adopted: every law is stated game-agnostically first, then grounded in the Gold Rush incident that forged it. Chapter 09 contains actual starter files with the Gold-Rush-specific content stripped out.

## The results, as verified evidence

Everything below was measured from the factory's own git history and ledgers on 2026-07-17, the day this book was written. Where a number comes from a ledger claim rather than a direct git count, it is marked *ledgered* — meaning it was recorded by an attended session at merge time under the factory's evidence laws.

**Timeline: 15 days.** First commit 2026-07-03 (`e4394243`, repo skeleton). This book written 2026-07-17. Every number below happened inside that window.

**Throughput:**
- **2,907 commits** on main, sustained at roughly 200 per day for two weeks (peak day: 289).
- **228 merge commits** — each one a gated drain: type-check, build, its slice's test spec, adjacent suites, zero-console boot probe, desktop and mobile, with a written review file.
- **1,506 commits** are factory bookkeeping by scheduled headless sessions ("fires") — lock takes, handoffs, ledger updates. The factory ran unattended nights and weekends on a 5–15 minute cron cadence.

**The paper trail (the factory's actual product alongside the game):**
- **445 task masters** — one file per unit of delegated work, each with scope, firewall, and self-check.
- **364 review files** — one per gated merge, each with a verdict, an evidence table with real numbers, and a per-file merge classification.
- **249 end-to-end test spec files** guarding the game.
- **37 spec directories**, including 9 era design bundles and 4 architecture decision records.
- **6 recorded owner playtest documents**, each finding traced to a task or ruling.

**The game itself:**
- Ten playable-or-specced narrative eras with **10 epoch contract bundles** shipped as data (`assets/contracts/epoch-1-frontier` through `epoch-10-deepsky`).
- **19 run maps sculpted as 3D terrain** covering all ten eras (*ledgered*, SOL-3D-D queue, 2026-07-17), with a further 27-map campaign greenlit and in production.
- **3 boss systems live in code** (Land-Yacht, Dynamo Crawler, Dredge-Queen) and **7 boss bodies modeled** (*ledgered*, SOL-3D-C queue — "every boss has a body; the Echo and the Quiet need none by design").
- **49 3D asset pilot packages, 213 GLB models**, produced by two parallel specialist sessions in eleven days.
- A **35,886-word illustrated storybook** (`lore/STORYBOOK.md`) — 47,280 words of canon across the lore wiki — kept coherent across ten eras and dozens of mid-flight design twists. A full-read audit on 2026-07-16 found **zero hard contradictions in 691 lines**.

**The human cost side of the ledger, honestly:** one owner who playtests, verdicts, and pays for model subscriptions; one attended orchestrator session when the owner is present; and the infrastructure of a single Mac. The owner authored none of the above. He ruled on all of it. That division — verdicts flowing down, evidence flowing up, and *no human labor in the production loop* — is the entire trick, and it only works because of the laws in the next eight chapters.

## How to read this book

- **Chapter 01 — The Constitution.** The eight load-bearing laws: where truth lives, what counts as done, who may write what.
- **Chapter 02 — The Cast.** The role architecture: owner, attended orchestrator, scheduled fires, runner + implementer, specialist sessions. Every boundary and why it exists.
- **Chapter 03 — The Loops.** How work actually flows: spec → master → queue → run → done-move → drain → ledger, and the throttle physics that keep it from jamming.
- **Chapter 04 — The Mistake Catalog.** The sixteen named failures, generalized into the transferable failure modes of agent factories. If you read one chapter, read this one.
- **Chapter 05 — The Gate System.** Evidence, not vibes: gate batteries, gate authorship, adjacent-suite protection, the review-file form.
- **Chapter 06 — The Canon Pipeline.** How design truth and story truth stay coherent under continuous change: rulings ledgers, owner verbatim, printings and weaves.
- **Chapter 07 — The Parallel Sessions.** The specialist-session protocol: territory grants, continuous waves, fresh references, the merge discipline for many simultaneous writers.
- **Chapter 08 — Adopt This.** Standing up a Foundry for a *new* game: the minimum viable factory, the growth path, and the honest prerequisites.
- **Chapter 09 — Templates.** Real starter files: constitution, fire protocol, task master, specialist queue, review.

One reading note. The factory's documents are written in a distinctive voice — laws in bold, incidents named like folk tales ("the Reset Massacre," "the 824k Flail"), owner quotes carried verbatim with dates. That voice is not decoration. Models forget; files don't; and a law attached to a memorable named incident survives paraphrase, summarization, and context compaction far better than a bullet point does. Write your laws so they can be *retold*. This book keeps that voice on purpose.

## The one-sentence version

**Autonomy is cheap; trust is expensive; so buy trust with evidence, encode evidence requirements as law, write the law in files the next session must read, and let no claim survive that a two-minute command could have checked.**

Everything else is commentary. The commentary follows.
