# Task sci-copy-clarity: research picks must be understood (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; specs/science-dimension/README.md (Vocabulary: "what changed must fit one sentence" is LAW); src/meta/ResearchTree.ts + the research overlay; docs/GOLD_RUSH_BRIEF.md §5 (voice). Pre-flight (runner-auto-commit aware): ahead lane commits already merged to main = SAFE DUPES → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged ahead content or foreign uncommitted edits. `npm install`; build green.

## Owner finding (2026-07-07, first live research pick)
"I got to select some science that I did not really understand the implications of." A pick the player can't evaluate is a slot machine, not a decision — this violates the spec's own legibility law on day one.

## Scope
1. **Every node description = one plain sentence + the concrete number(s)**: "Seam cards also raise your stockpile cap by +10" not "Assay Grading improves prospecting." Audit ALL epoch-1 nodes (SCI-01 launch trio + SCI-02 families/mastery nodes); rewrite in ledger voice, effect-first.
2. **The Elder's proposal shows consequences**: each of the 2 proposed nodes displays its effect line AND which branch it advances (economy / arsenal / crafting-agent, the plain-words labels from the ratified spec).
3. **Post-pick confirmation**: one toast/ledger line repeating exactly what just changed ("The Elder logs it: seam cards now +10 stockpile cap") — the SAME sentence, so learning compounds.
4. **Generic legibility guard in e2e**: assert every node description in the tree data contains a digit or a named card family — vague copy becomes structurally impossible.

## Firewall
Touch ONLY: node copy/data text fields, overlay rendering of effect lines, the confirmation toast, e2e. NO mechanics changes, NO node effect changes, NO tree structure changes.

## Self-check
tsc/build; sci-01 + sci-02 specs green both projects + the new legibility guard; overlay screenshots (proposal with effect lines, post-pick toast) into artifacts/sci-copy/; zero console errors. Commit on lane/m3. End: READY-FOR-GATES + before/after copy table + results.
