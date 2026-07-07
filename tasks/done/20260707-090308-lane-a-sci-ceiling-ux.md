# Task sci-ceiling-ux: the science ceiling must promise, never dead-end (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; specs/science-dimension/README.md (threshold/epoch model); src/meta/ResearchTree.ts; docs/playtests/2026-07-07-robin-playtest-02.md. Pre-flight: safe-dupe rule (ahead-merged commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. SEQUENCING: sci-03 may run before you in this lane — normal, reset off main; if sci-03's 3 nodes landed, count them in the tree-exhaustion logic.

## Owner moment (2026-07-07 ~06:49, screenshot)
"Science: 8 steps — 0 to the Steamworks (locked)" … "I reached the end of a science epoch? but next claim is the same level again." The threshold fired into a void: locked stub, no explanation, and the meter reads like a bug. The epoch TRANSITION is correctly staged behind the town (S5) — but the CEILING experience must carry the story until then.

## Scope
1. **Ceiling copy (canon voice)**: once steps ≥ threshold, the meter and research overlay stop counting down and say what's true and promising: "Epoch science complete — the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.)" Ledger tone per §5; no "(locked)" dead-end phrasing anywhere.
2. **Overflow banking**: steps past the threshold keep accruing in `tracks.science` (they already do — surface it: "banked: +2 toward the Steamworks"). Nothing a player earns is silently wasted; epoch-2 will consume the bank on arrival (data note in the epoch bundle schema).
3. **Never-empty proposals**: when all CURRENT-epoch nodes are taken, the Elder's post-run proposal switches to the repeatable **"Continued Study" family** (data-driven, infinite by construction, deliberately modest — e.g. +1% seam yield / +1% turret damage / +5 stockpile cap per take, alternating branches; numbers in copy per the legibility guard). Research picks NEVER show an empty or absent proposal.
4. e2e: seeded meta at/past threshold → ceiling copy + banked counter render; seeded fully-taken tree → Continued Study proposals appear with numeric copy; sci-01/02 suites stay green.

## Firewall
Touch ONLY: ResearchTree data/logic for ceiling+overflow+repeatables, meter/overlay copy, e2e. NO epoch-2 content, NO threshold value changes (pacing is an owner call in review), NO Balance changes beyond the additive Continued-Study deltas.

## Self-check
tsc/build; new + existing sci suites green both projects; legibility guard passes the Continued Study copy; screenshots (ceiling meter, banked counter, a Continued Study proposal) into artifacts/sci-ceiling/; zero console errors. Commit on lane/m3. End: READY-FOR-GATES + results.
