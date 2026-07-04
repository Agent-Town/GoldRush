# Task 011: build-menu blurbs + controls legend (RUN ONLY AFTER tasks/009 M2-05 IS INTEGRATED — shared files)

You are Codex, implementer for Gold Rush, on Robin's Mac. Claude orchestrates and gates. READ FIRST: `AGENTS.md`; brief §5 (voice: warm frontier-ledger copy, places/rituals naming).

Robin (2026-07-04): "I don't quite understand what each of the buildings does, why should I build them? How can I learn more?" and "if there are shortcuts, I want to know them."

## Scope
1. `BuildableDef` gains `blurb: string` (ONE sentence, ≤90 chars, ledger voice) + optional `role: 'defense'|'economy'|'utility'` chip. Copy (tune wording, keep meaning):
   - Sentry Beacon — "Auto-firing lantern rig; steady bolts, damage fades with distance."
   - Palisade — "Cheap timber wall; bandits and thieves must go around. R rotates."
   - Sluice Works — "River-side; washes a steady gold trickle while you fight — pauses if contested."
   - Stockpile Yard — "Raises your banked-gold cap — and gives thieves something to rob. Guard it."
   - Signal Turret — "Long-arm single-target rig; heavy bolts, needs clear line of sight."
2. Build menu: the SELECTED def shows name + cost + blurb (+ role chip) in a parchment strip; readable at 390px (≥11px text, no HUD overlap).
3. Controls legend: pause overlay (P) gains a compact "Controls" block — WASD/drag move · B build menu · 1/2/3 select · R rotate ghost · Enter/Space confirm · Esc cancel · Q switch weapon · P pause. Desktop + touch variants (touch shows button names instead of keys).
4. First-build nudge: the first time a menu opens each run, the blurb strip pulses once (CSS, no timer system).

## Firewall
Touch ONLY `src/game/buildables.ts` (blurb/role fields), `src/ui/BuildButton.ts` (menu strip), the pause-overlay UI file, `src/styles.css`/theme, NEW e2e `e2e/vp-04-build-blurbs.spec.ts` (menu blurb renders per def at desktop+390, legend appears on pause). No Balance/economy/combat/system changes; no STATUS/specs/reviews; no commits. If tasks/009 changed `buildables.ts` shape, ADAPT to its landed form — do not revert anything.

Self-check: tsc/build clean, new spec green, m2-01 menu suite green unmodified. End with `READY-FOR-GATES` + files + results.
