# Task stamp-site-read: the construction site reads as a SURVEYED CLAIM, not a brown slab (LANE-D, branch lane/perf, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; the stamp-mill site rendering (045 scaffold visuals + e2-stamp-mill stage visuals — the owner met it as "a dark rectangle and a pale box"); the fund interaction path (where/how the player funds stage 1 — VERIFY it exists and is discoverable; report what you find); prop-town-dressing (notice-post!) + existing plank/stake-grade sprites; RenderLayers. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-05 (this lane's queue).

## Owner finding (2026-07-08 ~06:49, screenshot): "what is this? I just found this in the game?"
The most important building site in Epoch 1 reads as an untextured slab + a grey box. It must read as a SURVEYED FOUNDATION with a name and a next action.

## Scope
1. **The site dressing (pre-funding state)**: corner survey stakes with string-lines between them (thin line geometry, warm cord color), a planked walkway edge on the approach side, packed-earth tint inside the footprint (not a flat dark plate — reuse the plaza/ground material family), and a **SIGNBOARD** (notice-post sprite + a ledger plaque): "STAMP MILL & RAIL SPUR — surveyed for the town. The Claim Office takes pledges." 
2. **The FUND interaction, discoverable**: proximity prompt on the signboard (the building-context-bar pattern): "Fund stage 1 — <cost>g" with the ledger-voice confirm; if a fund UI already exists elsewhere, CONSOLIDATE to this prompt (one door). Post-funding: the existing stage visuals take over (scaffold rises); the signboard plaque updates to the stage progress line.
3. **Stage visual warmth pass**: the stage-1 scaffold gets the warm material family + a couple of crate/barrel props from town-dressing around active construction (data-placed) — busy-looking, not abandoned.
4. **Minimap/HUD nudge**: one-time soft-glow pointer at the site on first appearance (SS-01 pointer machinery — a beat entry: the Elder: "The survey's done. The Steamworks wants a founder's gold." — coordinate with SS-02's table; if SS-02 already added a site beat, reuse/adjust rather than duplicate).
5. Mobile readable at 390px.

## Firewall
Touch ONLY: site/stage presentation, the signboard + fund prompt consolidation, one beat/pointer entry, e2e, artifacts. NO megaproject engine/manifest logic changes (costs/stages/unlock untouched), NO ceremony work, NO rail entity changes.

## Self-check
tsc/build; extended stamp-mill e2e: pre-funding site shows stakes/sign/prompt (asserted) · fund via the prompt works (Economy spend + stage advances) · beat/pointer fires once · plain-boot science-incomplete profile shows NO site (unchanged); e2-stamp-mill + 045 + m1-01 + m2-01 unmodified green both projects; zero console errors; before/after screenshots into artifacts/stamp-site-read/. Commit on lane/perf. End: READY-FOR-GATES + what the fund path was before this task + results.
