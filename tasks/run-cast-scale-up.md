# run-cast-scale-up — the frontier gets readable (lane-c; commit prefix "feat:")
ROLE: gameplay presentation. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner order, verbatim: "I think also the characters in the game are now too small. Can you size them up by 50% (except the boss) but in the levels it is hard to make out the opponents clearly as they are now so small."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules (lanes reset this morning; content-on-main authorization stands). If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: run-scene readability — the owner cannot make out opponents at current sprite scale. RENDERING-ONLY LAW (CLAUDE.md §4.6): this is a VISUAL scale pass; sim collision radii, hitboxes, movement, and damage are UNTOUCHED (the planar sim never changes).

## READ-FIRST: how hero/enemy/prospector render scale is set (visualScale in pools.ts + hero sprite sizing + SpriteAnimator consumers) · the metrology precedent (TOWN_CAST_METROLOGY — town is FINE, owner praised plaza sizes; THIS IS RUN-SCENE ONLY) · health-bar/damage-bar anchors + floating-text offsets (they anchor at sprite-height multiples — must track the new scale) · e2e draw-call/perf budgets (vp-02, e2-enemies:321, m1-01:96 — larger sprites, same counts).

## SCOPE:
1. Run-scene visual scale ×1.5 for: hero, all regular enemies (E1 bandits/jumper/thief, E2 trio), the Prospector, XP/pickup readability anchors that key off sprite height. EXCLUDED (owner: "except the boss"): the Baron and the railcar components — their scales stay exactly as-is (owner separately praised the Baron's size).
2. Anchors follow: health/damage bars, name plates, floating text, muzzle/impact origins re-derive from the scaled height (no floating bars, no feet-clipping — verify vs terrain seam at 3 spots).
3. Silhouette sanity: nothing clips wave-telegraph UI or overlaps the HUD at 390px; shadows scale with sprites.
4. e2e `e2e/run-cast-scale-up.spec.ts`: probe rendered sprite heights = 1.5× the pre-change constants for hero + one enemy of each family (diagnostics or texture-quad measure), baron + railcar UNCHANGED, bars anchored within epsilon above heads, perf budgets green (the three named suites), zero console/page errors, both projects. Screenshot pair: same seed wave before/after for the owner verdict.

## Firewall
Touch ONLY: visual-scale constants/multipliers in the render path (pools/hero/prospector presentation), bar/text anchor derivations, the new spec, artifacts/run-cast-scale-up/. NO Balance combat values, NO collision/sim radii, NO wave data, NO town scene, NO boss scales.

## Self-check
tsc + build green · new spec + vp-02 + e2-enemies + m1-01 budgets green both projects · zero console/page errors · the before/after pair at exact paths. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the exact multiplier table applied (who × what).
