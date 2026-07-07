# Task 044: start screen + menu — the game gets a front door (MAIN slot, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; docs/GOLD_RUSH_BRIEF.md §4.1 (Frontier STORYBOOK shell — this is a shell surface, distinct from in-game Ledger art) + §4.2 typography (canonical faces for the WORDMARK — typeset "GOLD RUSH" in code/CSS, never a generated image) + §4.3 layout laws + §5 voice; existing boot flow (src/main.ts, profile selection from demo-profiles-v2, RunManager continue/suspend state). Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed).

## Owner directive (2026-07-07): "make a logo for the game start screen, make a good menu."

## Scope
1. **Title screen** shown on boot (before any run; skipped by `?debug` boots so every e2e/gate flow stays untouched — assert that): menu backdrop art (batch-009 slot `ui-menu-backdrop`, PLACEHOLDER gradient until processed — placeholder-first law), emblem slot (`ui-title-emblem`, placeholder crest shape until art lands) + the **typeset wordmark** "GOLD RUSH" in canonical Storybook type with a small "an Agent Town tale" underline (§9.4 naming).
2. **Menu (left third, per the backdrop composition)**: Continue (visible only when a suspended run exists — RunManager already knows), New Claim, Profile (the demo-profiles-v2 selector relocates here as an entry point; keep its in-run access), Research (opens the existing overlay read-only between runs), and a stub "Settings" (volume placeholder + the future home of first-run help — polish-04's landing spot; stub = visible, minimal, honest "(coming)" state is FORBIDDEN — ship working volume or omit the row).
3. **Keyboard + touch**: arrows/enter + click/tap; 44px targets; Esc from menu = nothing (no run behind it); from IN-RUN, Esc keeps its current behavior (menu is NOT a pause overlay — do not touch the pause path).
4. **Flow correctness**: New Claim → existing run-start flow; Continue → resume path; entering a run disposes the menu cleanly (no leaked listeners — dispose pattern per house style); returning to menu after death/victory goes through the existing Run Ledger → research → THEN menu (the between-runs ritual order stays).
5. e2e `e2e/044-start-screen.spec.ts`: plain boot shows menu (emblem slot present, wordmark text, buttons); `?debug` boot SKIPS menu straight to game (gate-compat assertion); Continue hidden without a suspended run; New Claim starts; profile entry opens the selector; menu disposal leak-check (boot → start → no menu DOM remains).

## Firewall
Touch ONLY: new menu module (src/ui/menu/ or similar), boot wiring in main.ts, asset slot registration (ui contract rows, DORMANT until batch-009 processes), styles, e2e. NO changes to: run/sim logic, Run Ledger/research flow order, pause behavior, profile mechanics (relocate the ENTRY, not the system), existing e2e.

## Self-check
tsc/build; new spec green both projects; full boot-probe battery green (the `?debug` skip keeps them virgin — prove it by running m1-01 + m2-01 + task-025 unmodified); zero console errors; screenshots (menu desktop, menu 390px, placeholder-emblem state) into artifacts/044/. End: READY-FOR-GATES + files + results.
