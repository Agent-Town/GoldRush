# Task world-info-notes: everything notable explains itself on approach (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the context-prompt machinery (BuildingContextPrompt / AssayOfficePrompt / town shell prompts — the rendering pattern EXISTS; this task generalizes the DATA layer); the stamp-site signboard task (lane-d, in flight — coordinate: its signboard is the megaproject's info note; do not duplicate, REGISTER it); SS-01 beats (beats are once-ever story; info notes are ALWAYS-on-approach reference — different layers, shared styling family). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after contract-briefings (this lane's queue).

## OWNER RULING (2026-07-08 ~07:05, verbatim — the generalization is his)
"If it is not clear to me what is there (the Steamworks construction site), then it is not clear to any player — can you add a note or some information when the player comes close to the object so it is explained what is going on?"

## The pattern
**An INFO NOTE = data**: {objectClass, title, 1–2 lines of what-this-is, optional action hint}. Rendered as a compact ledger info card via the existing proximity-prompt machinery (below/beside any action prompt, never competing with it), shown on approach, every time (reference, not story — but with a per-profile "seen" softening: full card first 2 approaches, title-only after — curiosity served, veterans unbothered).

## Scope
1. **The registry + renderer** (data-driven; one module; the context-prompt stack handles placement/no-overlap).
2. **Notes for every currently-notable object** (ledger voice, legibility law): gold seam ("A seam. Stand close and the pan works itself.") · sluice/turret/palisade/stockpile/beacon (what it does + its tier meaning, one line) · the assay office ("Write an order; the town's craftsmen answer.") · the claim stake ("The heart of the claim. Lose it and the run is done.") · the spring pond (Gulch) · the ford ("The only crossing bandits know.") · the territory ring gaps ("Your kill-lanes — they funnel here.") · the megaproject site (REGISTER lane-d's signboard as its note; reconcile once both merge) · town shells (upgrade the "opens soon" prompts into the pattern) · the Prospector ("Your deputy. G opens its charter.").
3. **First-approach softening** per above (seen-state per objectClass, per profile).
4. Mobile: readable, never covers the stick zones at 390px.

## Firewall
Touch ONLY: the info-note registry/renderer, note data, the seen-state (per-profile additive), integration with existing prompts (additive placement), e2e, artifacts. NO gameplay changes, NO SS-01 engine changes, NO removing existing action prompts (notes join, never replace).

## Self-check
tsc/build; new `e2e/world-info-notes.spec.ts`: approach each class → correct note (sample 6 classes asserted by content) · action prompts still work beside notes (assay + build flows unmodified green) · softening after 2 approaches · 390px stick-zone clearance; m1-01 + m2-01 + task-025 + town suites unmodified green both projects; zero console errors; screenshots (3 notes incl. the seam and the stake, 390px) into artifacts/world-info-notes/. Commit on lane/polish. End: READY-FOR-GATES + the full note table as shipped + results.
