# Task meta-presence: earned meta must be VISIBLE in the run (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; docs/playtests/2026-07-07-robin-playtest-02.md (F-0707-13 ring surprise + F-0707-14 this task); src/meta/ResearchTree.ts + the offer/upgrade pool gating (SCI-02 familyGate) + RunManager territory reward; the research overlay + pause overlay + Run Ledger surfaces. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Owner findings (2026-07-07 ~12:11, live play — two sightings, one theme)
1. The territory ring appeared and the owner didn't know he'd EARNED it ("AHH I just was not aware of this").
2. Research-boosted offer cards (seam/panning family) read as skippable "nonsense" because nothing shows his science empowered them: "maybe the meta achievements/science should be more present somewhere?"
THE LAW THIS TASK ESTABLISHES: **meta-progression must announce itself inside the run** — every earned advantage says it was earned, and by what.

## Scope
1. **Card provenance badges**: any offer card whose family was unlocked/boosted by a research node shows a small Elder's-mark badge + one provenance line in the card detail ("Assay Grading raised this family — +stockpile cap rides seam cards"). Data comes from the ResearchTree node ↔ familyGate mapping (already exists; this is presentation).
2. **Run-start recap — "the claim remembers"**: at run start, IF any meta perks are active, one ledger-voice banner (≤4s, click-through, max 3 lines): "Your claim remembers: palisade ring (Territory III) · richer seams (Assay Grading) · +1 order slot (Second Order Slot)." Data: territory reward state + taken research nodes with in-run effects.
3. **Pause overlay meta panel**: the pause screen gains a compact section — science steps + banked overflow, active research boons (name + effect line each), territory tier, mastery progress if SCI-02 exposes it. Read-only, ledger-styled, no new interactions.
4. Copy passes the legibility guard (numbers or named families in every line).

## Firewall
Touch ONLY: card rendering (badge + detail line), the run-start banner (new small UI, reuse hint/blurb styling), pause overlay addition, e2e. NO changes to: offer weights/pools/balance, research effects, territory reward logic, ring geometry (task 046 owns that), sim.

## Self-check
tsc/build; e2e: seeded meta with 2 taken nodes + territory ring → run-start recap lists exactly the active perks; boosted family card shows the badge + provenance; pause panel renders the seeded state; fresh profile (zero meta) → NO recap banner, NO badges (nothing false); sci suites + task-027 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (badged card, recap banner, pause panel) desktop+390 into artifacts/meta-presence/. Commit on lane/m3. End: READY-FOR-GATES + results.
