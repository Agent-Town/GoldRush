# Chapter 05 — The Gate System
### Evidence law: how the factory knows what it knows

Every chapter so far has leaned on one phrase: "gated on evidence." This chapter is that phrase, unpacked. The gate system is the factory's immune system — the reason a repo written almost entirely by machines, merged mostly by machines at 3 a.m., is *more* trustworthy after two weeks and 2,907 commits than most human repos, not less.

The design problem is stark. In a conventional team, verification rests on a foundation of human honesty plus CI. In an agent factory, the workers are fluent claim-generators (Chapter 01, Law 2), the reviewers are also models, and the volume — a dozen merges a day — exceeds what any human can inspect. The gate system's answer has four pillars: **a fixed battery** (what always runs), **gate authorship** (who may define pass), **adjacency protection** (what else must not break), and **the review file** (what a merge must leave behind).

---

## Pillar 1 — The battery: a fixed, non-negotiable definition of "merged"

A drain runs the same battery every time, on the **merged tree** — main with the candidate applied — never on the branch alone (a branch passing in isolation proves nothing once main has moved):

1. **Static truth:** the type-checker, clean (`tsc --noEmit`).
2. **Build truth:** the production build, green.
3. **The slice's own spec:** the e2e suite written for this exact feature.
4. **Adjacent suites:** everything the change could plausibly disturb (Pillar 3).
5. **The boot probe:** launch the product plainly, zero console/page errors — on desktop **and** a 390px mobile viewport. Both projects, always; single-platform green is a false green.
6. **The player-visibility question** for user-facing work: "where does the PLAYER see this, in a plain boot?" — answered in the review and asserted by a test that runs *without* debug flags (Mistake #10's rule).
7. **Perf, when anything renders:** a frame-time snapshot against baseline — a p95 regression >15% fails the gate, numerically, no judgment call. (A live example from a boss-model review: "desktop ratio 0.7212... WITHIN 15%.")
8. **Visual evidence:** screenshots to a real path (`reviews/shots-<slice>/`) whenever anything renders.

Two properties matter more than the list's contents. **The battery is fixed** — it is not re-negotiated per merge, so no session can talk itself out of a gate under time pressure ("optimize repetition, not rigor" is the recorded law: batching tricks may share a battery's *run*, never thin its *content*). **The battery is cheap enough to always run** — Gold Rush invested early in self-booting test configs on scratch ports so a full gate costs minutes; a gate that costs an hour will be skipped by someone, eventually, and that someone will be a model with a deadline. Your battery's contents will differ (a native app has no 390px viewport); the properties must not.

## Pillar 2 — The Gate-Authorship Law: assertions are authored by the designer, never self-seeded

The subtlest and most transferable law in the whole gate system: **the acceptance criteria for a task are written by whoever authors the task — fixed assertions, stated before the run — never left for the implementer to define.**

Why this exists: an implementer asked to "add tests proving your feature works" writes tests that pass — that is what optimizing the instruction means. The tests will assert what the implementation *does*, not what the design *requires*; they are the exam written by the student. Gold Rush hit this as a quality defect ("the format defect that downgraded the drips," BACKLOG, 2026-07-15) and responded with a standing law: **"GATE-AUTHORSHIP LAW (fixed assertions, no self-seeding)"** stamped into every master since. A mature master reads like this (the crawler-model wiring task, verbatim):

> GATE-AUTHORSHIP LAW — FIXED: crawler spawn mounts the GLB; scripted per-component damage flips each named state ×3; kill → renderer counts baseline; LITE/invalid-bytes → placeholder presentation; canyon + crawler suites unmodified-green; both projects.

Every assertion there was written by the task's author, from the spec, before the implementer ever saw the task. The implementer's job is to make *those* assertions pass — and an implementer who can't is surfacing a real design gap, which is exactly what you want surfaced. The same principle produced the playtest rule that the owner's exact bug scenario becomes an e2e assertion verbatim ("turret behind palisade acquires and kills") — the person who *experienced* the requirement authors the check for it.

The general form for any factory: **separate the three authorships.** The designer authors what "pass" means; the implementer authors the attempt; the gater runs the check. Any two of those collapsing into one mind reintroduces self-grading.

## Pillar 3 — Adjacency protection: the change must prove it broke nothing nearby

New-feature tests catch new-feature bugs. What kills factories is *regression at a distance* — and a factory merging twelve times a day has twelve daily chances to erode something older. Three rules:

**Adjacent suites run unmodified-green.** Every master names the suites near its blast radius (plus a factory-wide minimum set — in Gold Rush, the core-loop and boot suites ride every battery). "Unmodified" is half the law: an implementer may not edit an existing test to make it pass — existing e2e assertions sit in every firewall's NO list. A red adjacent test means the *change* is wrong until proven otherwise.

**Known failures are fingerprinted, not waved through.** Real factories accumulate environmental flakes and known-reds. The law: a failure may be excused only by matching a *documented* fingerprint exactly — same file, same assertion, same count — with proof it predates the change (the strongest form, from a live review: the failure "fails identically on clean main, single-worker, edits reverted"). Anything novel fails the drain: revert the merge, write the finding, spawn the corrective task, same session. The fingerprint discipline is what keeps "it's probably flaky" — the most corrosive sentence in continuous integration — out of the factory's vocabulary.

**Invariants get standing assertions.** The product's single-writer laws (Economy is the sole gold writer; CombatSystem the sole damage resolver) and behavioral contracts ("every pickup floats its amount") live as permanently-running assertions, not as documentation. When a later change violates an architectural law, a *test* catches it — nobody has to remember.

## Pillar 4 — The review file: no merge without a document that could convict it

Every drain writes `reviews/<slice>.md` before the merge commit is complete. The form is fixed (template in Chapter 09), and each section exists to make a specific future failure diagnosable:

- **Slice / branch / tip hash** — so any future audit can reconstruct exactly what was merged (Mistake #16's cure: the review file *is* the completion certificate).
- **Verdict** — one line, PASS or FAIL, no hedging.
- **What it does** — one paragraph in plain language, for the next session that has to touch this area.
- **Evidence table with real numbers** — suite names with counts ("38 passed desktop+mobile, 2.5m"), perf ratios, build times. Numbers, not adjectives: a review that says "tests pass" is vibes wearing a suit.
- **Merge classification** — the base hash, and *every file* classified: LANE-TOUCHED only (clean apply) / MAIN-MOVED too (3-way judgment, resolution stated) / NEW. This is the anti-corruption record: if a subtle merge error surfaces weeks later, the classification table shows exactly what judgment was made and on what basis. Classification is also the *pre*-merge discipline — a session that can't classify a diff cleanly is a session that must not merge it (stale + conflicted = re-land, Mistake #15).
- **Findings as F-IDs** — everything noticed but out of scope, each either explicitly non-blocking with a reason, or spawning a corrective task *in the same commit*. Findings are how gates feed the backlog: the gate is not just a filter, it is a sensor.

The review file's deepest function is cultural: it makes gating *costly to fake*. A session could lie in a one-line verdict; fabricating a coherent evidence table, a per-file classification, and named findings is harder than doing the work — which is precisely the property you want in a factory where the reviewer is also a model. Honesty also has a positive form here: a review that *rejects part of its own task's premise* with a reason is a pass, not a failure (a live example: a master demanded `height > width` for upright buildings; the gater rejected the literal assertion as invalid for intentionally-wide facades, cited Mistake #14, and shipped the correct guard instead).

---

## Gates for non-code deliverables

The gate idea generalizes past code, and the factory runs it everywhere:

- **Art batches** gate on *measured* criteria: sheet purity against the keying color, sprite heights against existing bands, explicit grid cells, no accidental text — a checklist with numbers, run before any asset wires in (plus the style gate: the era's style-anchor sentence appears verbatim in every prompt).
- **3D waves** gate on contracts: triangle budgets, one material at a stated resolution, named sub-meshes/anchors, byte-identical re-export from the build script (reproducibility as a gate!), flat-walk tolerances measured in units. And on *purpose*: the ACROSS-THE-PLAZA TEST — an era-variant must be blind-identifiable at gameplay camera distance — exists because a wave once passed every correctness gate and failed the point ("these don't look too different?" — owner, 2026-07-14). When a deliverable's purpose is perceptual, author a perceptual gate.
- **Story/canon** gates on citation: uncited lore is a proposal, not canon; a full-read coherence audit is itself a gated deliverable with a verdict ("zero hard contradictions in 691 lines") — Chapter 06.

The pattern for any new deliverable type: ask "what would a plausible-but-wrong instance of this look like?" and author the check that catches *that*, with a number or a blind test wherever taste is involved.

---

## What the gate system buys

It buys **compounding trust in main.** Because nothing lands ungated, every session — fire, implementer, specialist — treats main as ground truth without verification anxiety. That, in turn, is what makes the whole parallel architecture possible: territory sessions rebase on main freely, fires author tasks from main's state, the owner plays deployed builds knowing they passed the battery. One trustworthy surface, purchased with minutes of automated verification per merge, is the foundation under all fifteen days and all 228 merges.

And it buys the right failure mode. When something *does* go wrong — and Chapter 04 is sixteen proofs that it will — a gated factory fails with a paper trail: the review file, the classification table, the fingerprint database, the F-ID that someone filed and someone else deferred. The postmortem takes minutes. In an ungated factory the same incident is archaeology.
