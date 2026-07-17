# Chapter 06 — The Canon Pipeline
### Keeping design truth and story truth coherent under continuous machine production

Code has a compiler; design and story have nothing — unless you build it. A factory shipping a dozen merges a day will, without a canon system, drift into contradiction within a week: the art forgets the palette, the writing forgets who died in chapter three, the mechanics forget the ruling the owner made in a playtest last Tuesday. This chapter is the machinery Gold Rush built so that a 35,886-word storybook, ten era designs, 213 models, and hundreds of mechanics decisions stayed *one coherent thing* — verified by a full-read audit that found zero hard contradictions.

The machinery has five parts: rulings ledgers, decision records, design-locked bundles, the wiki laws, and the book itself as connective testament.

---

## 1. Rulings ledgers: the owner's words, verbatim, dated, addressable

Chapter 01's Law 7 (owner's words are law) becomes infrastructure here. Every design decision the owner makes — in chat, in a playtest, in a one-word verdict — is captured *verbatim, in quotes, with a date*, in the document that the decision governs. Not paraphrased. Not summarized. Quoted.

Three properties make verbatim capture load-bearing rather than ceremonial:

- **Rulings are addressable.** A spec can say "per the owner ruling of 2026-07-16" and any session can go read exactly what was said. Paraphrase has no address; it has versions.
- **Rulings carry their own nuance forward.** The owner's ruling on era accretion — *"some technologies replace others and thus the replaced technology becomes obsolete... but layered eras look quite unique and interesting"* — contains a tension (replace vs. keep) that a summary would have flattened to one side. Because the words survived, the resolving design (a per-feature verdict system: PERSIST / REPLACE / RELIC) honors both halves.
- **Behavior counts as a ruling.** When the owner's *play* answers a design question — he upgraded a building and expected production to jump — that observation is recorded with the same rigor as a sentence. The factory's playtest-intake skill exists to do this in real time, while he keeps playing: triage every sentence into bug / ruling / known-scope / direction / confirmation, verify before filing, record his words in the spec they change.

Superseding is explicit: when a new ruling replaces an old one, the old line is *marked* SUPERSEDED — never silently edited. History that can be rewritten silently isn't history; it's a cache.

## 2. Decision records: the deep keels

Above the daily rulings sit a small number of Architecture Decision Records — the decisions so structural that everything else assumes them. Gold Rush has four; the first is the archetype: **ADR-001, no firearms ever** — the world's weapons are frontier-tech (rigs, beacons, brass-and-teal agent-tech) across all ten eras. That single recorded decision constrains every art prompt, every enemy design, every item the crafting pipeline may approve, ten eras deep — and because it is *written and numbered*, every one of the 445 task masters can cite it in a firewall line rather than re-explaining it.

ADRs are the right container for exactly the decisions you must never re-litigate: content red-lines (never gory; enemies are outlaws, companies, machines, nature — never peoples), identity anchors (who the player character is; where the agents originate), and system contracts between major components. The bar for adding one is high on purpose; the bar for *doubting* one is a one-paragraph draft ADR and an owner question, never a quiet workaround.

## 3. Design-locked bundles: the future, specced and banked

A ten-era saga cannot be designed one sprint ahead of implementation — art consistency, foreshadowing, and economy arcs all need the *whole shape* early. But specs written far ahead go stale (Chapter 04's staleness family). Gold Rush's resolution: **era bundles** — one design document per epoch (`e2-steamworks-bundle.md` … `e10-deepsky-bundle.md`), each carrying the era's mechanics, town transforms, boss choreography, palette anchors, and prop vocabulary — *design-locked* after an owner ratification pass, then banked.

The bundles' operating rules:

- **They win conflicts.** A specialist session's queue doc says it plainly: "the bundle's A2 notes win conflicts." When a session improvises and the bundle disagrees, the bundle is right — improvisations are proposals.
- **They are required content, not inspiration.** The forging incident: a session built era-variant buildings from the bundle's *mood* and produced variants the owner couldn't tell apart. The extracted law: "THE BUNDLE TRANSFORM LIST IS REQUIRED CONTENT, not inspiration" — the bundle *specifies* the covered porch, the hanging oil lamps, the swing doors; build those.
- **They activate on gates, not dates.** Each bundle sleeps until its era's activation condition (a research threshold, a prior era shipping). Banked-but-inert is a first-class state — the epoch *socket* was proven early by shipping a locked, contentless era-2 stub through the registry with zero engine change, so that every later era would be data, not surgery.
- **Style anchors travel verbatim.** Each era's one-sentence style anchor is copied word-for-word into every art prompt and modeling wave of that era. Consistency at machine scale is not a talent; it is a string equality.

## 4. The wiki laws: canon as a governed database

All content facts — characters, institutions, places, eras, timelines — live in a lore wiki (`lore/`) under four laws (constitution §9b):

1. **Read-before-write** for any content-touching task: you may not name a character, a building, or an event without checking what the wiki already says about it.
2. **New canon lands same-commit** with the work that creates it. A scene that introduces a character and a wiki that doesn't know her yet is a contradiction with a fuse lit.
3. **Cited and dated.** Every fact traces to a ruling, a chapter, or a shipped feature. **Uncited lore is a proposal** — the load-bearing sentence of the whole pipeline, because it gives machine sessions a safe way to *generate* freely: generation produces proposals; only citation produces canon; and the promotion step is exactly where the owner or attended session applies judgment.
4. **The future lives there too, marked PLANNED.** Foreshadowing is infrastructure: the wiki holds arcs that haven't shipped so that today's content can point at them deliberately instead of contradicting them accidentally. Even *rejections* build the future — the crafting contract's reject-don't-stretch law (Chapter 04, #14) asks that refusals foreshadow: "the sea asks for a different science" is a no that becomes a promise.

## 5. The book as connective testament: printings and weaves

The deepest artifact in the pipeline is the storybook itself — not marketing copy but the saga's *testament*: the document where ten eras of mechanics, art, and rulings must cohere as one story. Its maintenance model is the chapter's namesake pattern, and it generalizes to any large evolving creative artifact (a design bible, a campaign setting, a product narrative):

**Printings, not edits.** The book versions as printings — coherent editions — rather than a perpetually-mutating draft. Between printings, change requests accumulate; a printing is a deliberate, gated event with a named brief.

**The full-read audit.** Before a printing, a session reads *every word* — the owner's order, verbatim: "Can you take the time and read all the words in the book? … While you do it rethink it — we had many twists since we started it" — and delivers a verdict document (the third-printing brief) with the same evidence discipline as a code review: the verdict up front ("The book holds. Zero hard contradictions in 691 lines"), findings with locations, and — the audit's most valuable output — the *positive* map: a list of places where the existing text already anticipated later rulings, marked "cite, don't rewrite." An audit that only hunts defects will propose rewrites the book doesn't need; symmetry between "what's broken" and "what's already right" is what keeps printings surgical.

**The weave map.** Change lands as a *weave*: a chapter-by-chapter plan of minimal insertions — "plant the question early; land the two structures that have no scenes yet; thread one connective line each through chapters that already carry their halves." The weave form forces the smallest edit that achieves coherence, which protects the accumulated voice of everything already ratified. (It is the re-land discipline of Chapter 04 #15, applied to prose: don't hand-merge new theme into old text at scale; plan precise insertions against the current whole.)

**The decision sheet.** Every open creative call surfaced by the audit is batched into one owner-facing sheet — numbered, one line each, a recommendation marked on every line ("REC: BOARDS, FREED — the first victim must not end the saga in his jailer's company"). Twenty-two decisions, one sitting, every verdict recorded. This is the owner-attention law (Chapter 02) applied to story: taste flows through verdicts on prepared options, never through the owner drafting.

---

## The pipeline's quiet result

Notice what the five parts jointly achieve: **any session, at any hour, can safely generate content** — a task master's flavor text, an era prop, a rejection notice, a gazette headline — because the question "what is true in this world?" always has a findable, dated, cited answer, and the question "may I make this up?" always has the same answer: *you may propose; citation promotes.* Creative coherence stops being a property of one person's memory and becomes a property of the file system.

The audit result is the proof. Ten eras, dozens of mid-flight twists (a flood that resets the world's technology, a mission that fails on purpose, a disease that turns out to be a product), four owner-ruling waves of revision to the accretion laws alone — and the full read found the twists *already reconciled*, because every one of them had entered through a ruling, landed in a ledger, propagated through bundles, and been cited by the sessions that built on it. That is what a canon pipeline is for: not preventing change, but making change *land everywhere it belongs*.
