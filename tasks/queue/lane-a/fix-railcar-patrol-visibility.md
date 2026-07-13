# fix-railcar-patrol-visibility — the train never hides while it lives (lane-a #2; commit prefix "fix:")
ROLE: gameplay. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner playtest, verbatim: "I had to shoot it on the rails - it stopped at the end and went kind of invisible except the healthbar. I shot it from the shore until it died and then the level ended."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## VERIFIED ROOTS: the railcar boss rides the rail route to its END and parks; the off-field fog-gating (fix-e2-railcar-read) hides components beyond the playfield edge — a parked-at-the-end LIVING boss is hidden-but-targetable: the worst read possible.
## SCOPE:
1. PATROL LAW: the railcar NEVER parks outside the visible field while alive — on reaching a route end it reverses and patrols the rail (back-and-forth), staying engageable. (Component group moves as one; existing speed/degrade rules hold.)
2. VISIBILITY LAW: alive + targetable ⇒ visible. The fog-gate only applies during the ENTRY approach (first crossing into the field); after entry it never re-hides a living boss.
3. HEALTHBAR ANCHOR: the bar follows the visible group center (it already does — verify after patrol).
4. e2e: extend the railcar spec — scripted route-end reach → boss reverses (position probe over time), never invisible while alive (render-visibility probe each sample), kill ends the wave as before; zero console errors; both projects. 057 + escort suites UNMODIFIED-green.

## Firewall
Touch ONLY: the railcar route-follow/patrol logic + the fog-gate condition, the spec extension, artifacts/. NO HP/damage numbers, NO spawn composition, NO presentation art (a separate Sol model is coming — keep the presentation seam as-is).

## Self-check
tsc + build green · railcar + 057 + escort suites green both projects · zero console errors · a patrol capture. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the patrol parameters.
