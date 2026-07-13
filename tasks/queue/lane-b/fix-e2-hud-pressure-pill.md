# fix-e2-hud-pressure-pill — the pressure gauge learns brevity (lane-b; commit prefix "fix:")
ROLE: UI. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — owner first E2 playtest, 2026-07-13 (~07:00-07:10 screenshots), verbatim: "the pressure and the gold are overlapping, maybe less text in there?"

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling of this same playtest wave, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: the pressure pill renders "PRESSURE · PRESSURIZE 0/2 · W8–12  0/100" — so wide it collides with the GOLD pill (owner screenshot). "W8–12" is internal jargon (the pressurize wave window) shown raw to the player.

## READ-FIRST: src/ui/Hud.ts updatePressure + the pressure pill markup/CSS · the pressure system's snapshot fields (what 0/2 and W8-12 mean: pressurize verb uses + window) · the owner screenshot description above.

## SCOPE:
1. Compact the pill: gauge icon + `0/100` bar stays primary; the pressurize-uses count becomes a small `×2` chip; the wave-window jargon LEAVES the pill (move it into the pill's tooltip/title or the first-time reveal card, phrased humanly: "Pressurize windows open waves 8–12").
2. Layout: pressure + gold pills must not overlap at ANY viewport ≥360px wide (flex-wrap or width budget); verify at 390px and desktop.
3. e2e: extend the pressure HUD spec (or add one) asserting the compact pill text, no bounding-box overlap with the gold pill at 390px + desktop, zero console errors.

## Firewall
Touch ONLY: src/ui/Hud.ts pressure/gold pill markup + its CSS + the spec. NO pressure mechanics, NO snapshot shape changes beyond display, NO other HUD panels.

## Self-check
tsc + build green · spec green both projects · zero console/page errors · before/after screenshots at 390px + desktop. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the final pill string.
