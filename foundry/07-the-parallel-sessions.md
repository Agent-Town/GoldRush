# Chapter 07 — The Parallel Sessions
### The specialist protocol: running long-lived expert agents alongside the factory

The task loop of Chapter 03 is built for work that slices small: one master, one run, one drain. But some work refuses to slice — sculpting nineteen terrain maps in a consistent hand, modeling a town whose every building must share a palette, any domain where *accumulated judgment* is the asset. For that, Gold Rush evolved a second production mode: **specialist sessions** — long-lived interactive agents holding standing territory, delivering wave after wave for gates. Two such sessions (3D-C, the town; 3D-D, the maps) produced 49 asset packages and 213 models in eleven days, and the protocol that governed them was grown law-by-law in two queue documents that are themselves the best evidence of how to do this.

This chapter extracts that protocol as a product. Its parts: the territory grant, the queue document, the wave cycle, the merge discipline, the style gates, and the activation ladder.

---

## 1. The territory grant: freedom inside a fence

A specialist is chartered by a **grant** with four elements:

- **Identity:** who you are and what you own, in one line ("You are Session 3D-C: the TOWN GROUND PLATE — the terrain the 3D town stands on").
- **Territory:** an explicit TOUCH-ONLY path list (asset directories, one findings file, one artifacts directory) and a branch namespace (`sol/*`). Everything else in the repo is readable, never writable: "Read their queue files for awareness only. NEVER write outside your territory."
- **Hard laws:** the non-negotiables that protect the product from this session's enthusiasm — budgets (tri counts, material sizes), interface contracts (base-center origins, byte-identical re-export), and the system boundaries that art must never cross (in Gold Rush: "the sim is planar and sacred" — 3D terrain is render-only; gameplay height exists only through gameplay specs).
- **The delivery contract:** commit on your branch, announce READY-FOR-GATES + tip hash; the attended session gates and merges; "never self-merge, never push main."

The design insight is the *shape* of the freedom. Inside the fence, the specialist has more autonomy than any other role in the factory — it chooses its tools, iterates on its own taste, files its own findings, even proposes its own next waves. The fence is what makes that affordable: a specialist cannot break anything it cannot write to, so its long leash costs the factory nothing in risk. Compare the implementer (Chapter 02), whose one-task contract trades autonomy for containment; the specialist trades *scope* for autonomy instead.

Territory transfers are explicit and non-overlapping: when a stalled model assignment moved from one session to the other, the record shows both the transfer and the closure ("TRANSFERRED TO 3D-D... no double-delivery: this doc's grant is CLOSED"). Two sessions delivering the same thing is a merge catastrophe scheduled in advance.

## 2. The queue document: a contract that learns

Each specialist has one file (`docs/SOL-3D-C-QUEUE.md`, `-3D-D-`) that is simultaneously its charter, its inbox, its ledger, and its law book — "Read this first, every session start." Waves are granted there; verdicts land there ("WAVE 2 — ACCEPTED + MERGED... 17,596 tris / 30k · flat-walk 0.037"); and — this is the part to copy — **every incident becomes a dated law amendment in the same document**, so the contract compounds exactly like the constitution does. Reading 3D-C's queue top to bottom is watching a protocol evolve under load: budgets raised with reasons, a returned wave spawning the blind-test law, an owner refinement spawning verdict taxonomies (v2, then v3), each layer citing the words that caused it.

The queue doc also solves the specialist's version of context loss. These sessions are long-lived but not immortal — they end, restart, and re-boot from the document. Everything the factory needs a specialist to *remain*, it writes into the queue doc; everything left in the session's own memory is scheduled to evaporate (Law 1, applied to experts).

One incident defines the boundary of this file-based world: a session once finished a wave and held it as a local commit, unpushed, per an over-cautious reading of its contract — and the factory ground still, because **"ATTENDED CANNOT GATE WHAT ISN'T PUSHED."** The amendment followed within hours: commit and push the branch at every boundary. For remote collaborators of any species, unpushed work is unperformed work.

## 3. The continuous-wave protocol: never idle, never waiting

The specialist's cadence law, written after a session once sat idle at a blocked gate (the owner: "Can they continue working on multiple things in a row?"):

> Work the FORWARD LADDER top-to-bottom without stopping between waves. At each WAVE BOUNDARY: (1) commit + push the finished wave on its OWN fresh branch — never reuse, never main; (2) announce READY-FOR-GATES + tip in ONE message; (3) fetch origin and re-base your next wave's reading on current main; (4) check your next ladder item's GATE — take the FIRST UNBLOCKED item, skip-not-wait on blocked ones; (5) begin immediately. DO NOT wait for the attended merge of your previous wave — merges are async; if a merge files findings, they arrive as a small named follow-up you fold into your next wave boundary. NEVER idle-poll a gate: gates are checked at wave boundaries only, and the ladder always holds an unblocked item.

Every clause kills a specific waste. Fresh-branch-per-wave keeps each wave independently gateable and makes no wave's merge hostage to another's. Skip-not-wait plus a pre-written ladder guarantees the expensive expert never idles (the queue doc's own postmortem: "waiting at a gate with nothing else signed out was the failure — the ladder guarantees an unblocked item at all times"). Async merges decouple the specialist's clock from the gater's clock — findings flow back as named follow-ups, not as blocking reviews. And boundary-only gate checks prevent the poll-spin that burns tokens watching a file that hasn't landed.

Riding on step (3) is the protocol's subtlest law, ratified by the owner as **the Fresh-Reference Law**: at every wave boundary, *re-render your working reference boards from the freshly pulled files, and record the base commit on each board.* "Old artifact boards are HISTORY — evidence of a moment — never guidance." The forging incident: a session worked from a reference image that predated three of its own merged corrections, and began regressing them. This is Chapter 01's verify-don't-inherit turned on the agent's own perception — in any long-running visual or data workflow, cached context is a stale belief with a picture attached.

## 4. The merge discipline: many writers, one main

Parallel sessions plus daily factory lanes means main is a busy intersection. Three rules kept it collision-free for eleven days:

- **Asset territory means near-zero src conflicts by construction.** Specialists deliver assets plus findings; the *wiring* of assets into code is a separate factory-side task ("the wire seam is FACTORY-SIDE — you never need src/ access; keep modeling"). Separating making from mounting means the high-volume creative stream and the high-risk code stream never share files at all.
- **The union rule for known additive collisions.** Where parallel slices *must* touch the same registries (a pilot dispatch table, a consts file), the drain law names those files and prescribes the resolution: "union both sides — keep every const, every union member, every registry entry." And its own limit: anything beyond adjacent additive lines defers to the attended session — "do not improvise."
- **Findings cross borders; edits never do.** Repeated from Chapter 02 because the merge discipline is where it pays: a specialist spotting a defect in another territory files an F-ID and keeps working. The record shows the payoff both ways — the finding that became the finder's own next grant (the tavern), and the mis-filed breach that turned out to be owner-directed and was *reclassified*, in writing, with the standing rule restated ("shared-asset changes ride an explicit owner/attended grant, exactly as this one did").

## 5. Style gates: taste, made checkable

Specialist output is art, and art gates threaten to collapse into "looks good to me." The factory's answer is a small arsenal of perceptual gates with teeth, each born from a named failure:

- **The blind identification test** (the ACROSS-THE-PLAZA TEST): an era-variant building must be identifiable at gameplay camera distance by someone who doesn't know which is which — because a wave once passed every budget and failed the *point* ("If the owner squints, the player sees nothing"). Measured blind-recognition rates entered the verdicts (98% / 88% / 70% — and 70%, "above chance, below house standard," was sent back).
- **The mood A/B** (the Grit Law): every terrain verdict board pairs the new sculpt with the shipped painted tile and asks a fresh, unprimed critique one question first: *"holiday or fight?"* The law carries the owner's verbatim brief ("the player is fighting for their life not on a holiday") plus a named anti-pattern (the holiday read) and a vocabulary list of what hardship looks like — taste, operationalized.
- **The reproducibility gate:** every model re-exports byte-identically from its build script. Art you can't rebuild is art you can't trust in a pipeline.
- **A no-change wave with evidence is a valid wave.** The gates run in both directions: a specialist granted an improvement wave may return the verdict that the current state is already right — with boards to prove it. Style gates exist to *decide*, not to demand churn.

## 6. The activation ladder: pre-written futures, gated on facts

The final piece is how specialists stay fed without anyone feeding them daily. The queue docs carry **forward ladders**: waves pre-written far ahead, each with an explicit activation gate that is a *checkable file condition*, not a calendar date — "activates when its mask-table FILE lands on main"; "gate: the plates land"; "HOLD until the plate ships — model from the plate, not from prose."

This is the masters-and-queues idea (Chapter 03) re-shaped for experts: the attended session batch-authors intent while it has the owner's rulings fresh; the gates encode the dependency graph; and the specialist self-serves at every wave boundary by checking which gate opened. The same structure carries cross-session choreography without any live coordination: the factory authors mask tables → 3D-D sculpts the terrain → 3D-C builds the landmark packs — three production streams, synchronized entirely by files appearing on main. ("Masks-first" is Gold Rush's instance of a general rule: *upstream truth ships as data before downstream craft begins, so craft never has to guess.*)

---

## Why this is a product feature, not a workaround

It would be easy to read specialist sessions as a patch over tooling limits. The record argues otherwise. The protocol delivered the factory's most owner-visible outputs — the town, the maps, the boss bodies — at a pace the slice loop could not have matched, *because* deep context compounds: by wave nine, 3D-C wasn't just executing grants, it was correctly proposing laws (the accretion inheritance check came from the session's own catch), budgeting honestly ("hidden terminal tessellation simplified to fund the visible festoon inside the unchanged budget"), and flagging its own work for verdicts it might fail. The protocol's fences are what made that growth safe to keep.

And one portability note that matters for adoption: these sessions ran on a *different model vendor* than the factory's orchestration, in a different tool (Blender, not TypeScript), and the protocol held unchanged. Territory + queue doc + waves + gates is model-agnostic law. That is the test of every mechanism in this book, and this one passes it most visibly.
