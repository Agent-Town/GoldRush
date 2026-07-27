> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1131 2026-07-27).** Done-move `tasks/done/shipped-s899-ceremony-stage-wiring.md`. Content probe on main today: `src/ceremony/stages.ts` and `src/ceremony/CeremonySystem.ts` both exist, with `e2e/ceremony-framework.spec.ts` and `e2e/e2-t2-dynamo-ceremony.spec.ts` exercising them. See F-1131-6.

# Task lane-ceremony-stage-wiring: stages wear their paintings (ANY LANE, commit prefix "feat:")
You are Codex (worktree per queue lane). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: src/ceremony/stages.ts (the primitive compositions — they become the FALLBACK) · the plate-binding precedent (import.meta.glob + filename convention, TownScene ~:83) · assets/raw/ceremony-stage-t*.png (may land AFTER you — placeholder-first: bind by name, fall back to primitives silently).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Scope: 1. Each ceremony stage renders assets/raw/ceremony-stage-t<N>.png as its backdrop when present (glob-bound by name, zero code per future file); primitives remain the no-file fallback AND the interactive layer on top (hands/dials/hotspots unchanged). 3. THE HOUSE DRESS (owner, same screenshot: "the UI here looks different from all the other UI in the game?"): the ceremony overlay's chrome adopts the game's design system — the parchment panel, serif display type, brass-pip corners, and the house button (the town-ui/death-overlay__button family are THE PATTERN; reuse those classes/tokens, never re-invent). The dark-modal look dies. Layout, hotspots, and phase behavior unchanged — this is a costume change, not surgery.
4. Spec additions: the overlay carries the house panel/button classes (DOM assertion) + an after screenshot beside a contract card for the one-hand test.
2. Spec: a ceremony with a stage file shows it (probe dataset/src) + hand interaction still drives phases + zero console; a ceremony without falls back clean; both projects; ceremony-framework suite green.
## Firewall: stage render layer + spec. NO script/phase/arming changes.
END: READY-FOR-GATES + before/after shot of one staged ceremony.
