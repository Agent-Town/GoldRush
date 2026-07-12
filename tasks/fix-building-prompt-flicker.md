# fix-building-prompt-flicker — the deed card stops strobing, and only shows at build time
ROLE: HUD fix. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner, 2026-07-12, verbatim): "this flickers a lot, with each shot I think? I shoot quite fast with max upgrades. This is annoying. And maybe just activate it if I am in Build mode/with B."
Two orders in one:
A (BUG): the building context prompt (upgrade/tear-down card, src/ui/BuildingContextPrompt.ts) re-renders on rapidly-changing snapshot state (every shot at high fire rate) → visible flicker. Fix: render only when its CONTENT key actually changes (stable memo key = building id + tier + costs + affordability booleans — NOT ambient state); zero rebuilds while the card's text is identical.
B (RULING): the card shows ONLY in build mode (B / build button active) — outside build mode, proximity to a building shows nothing (combat stays clean). The mill-site/fund prompts and town approach prompts are SEPARATE seams — untouched.
## READ-FIRST: src/ui/BuildingContextPrompt.ts + its Game.ts update call sites (the per-frame feed) · BuildSystem.isBuildMode · the collapse-vs-close law (reviews around 067-era: build-mode UX rulings) · adjacent specs touching the prompt (task-046? grep data-testid).
## SCOPE: memoized render + build-mode-only visibility + e2e: (1) fire N shots beside a building in build mode → card DOM mutates 0 times while content unchanged (MutationObserver count), (2) outside build mode the card never appears, (3) upgrade/tear-down flows still work in build mode. Both projects.
## TOUCH-ONLY: BuildingContextPrompt + its Game feed condition, one e2e, artifacts/. NO build/demolish logic, costs, mill-fund prompt, town prompts.
## SELF-CHECK: tsc; build; new spec + build/upgrade adjacents + m1-01/m2-01 green BOTH projects; zero console.
END: READY-FOR-GATES + the mutation-count evidence.
