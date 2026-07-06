# Owner playtest — Robin, 2026-07-07 morning (~05:30–06:00, mid-session notes + screenshot)

Build: main @ post-s101 era (041 overwatch, SCI-01/02/04, w1-03 light rerun, w1-04 scatter, combat-readability, m4 embodiment+art, BT-01 tier-core all in). Owner playing toward wave 20.

## Confirmed wins (owner verdicts)
- **041 turret-overwatch: CONFIRMED.** "The turrets are much stronger now, shooting over Palisades is no problem." The M2 self-sufficiency thesis finding is resolved in play.
- Atmosphere direction: "the darker map is ok."
- BT-01 upgrade interaction is live and discoverable (owner bought a sluice tier unprompted).

## Findings → tasks (all queued 2026-07-07 morning)
- **F-0707-1 (P1) Black buildings**: "all the buildings are completely black" — screenshot shows palisades/stockpiles/turret bases as unlit silhouettes against the new warm ground. → `lane-c-playtest-correctives-0707` item 1.
- **F-0707-2 Palisade wear decals rotated 90°** on default-orientation walls ("damages are rotated for the normal palisades but correct for the rotated ones"). → correctives item 2.
- **F-0707-3 Hit-flash CUT (owner verdict)**: "The flashes when hitting an opponent are looking not good. I think we can cut that." → correctives item 3 (bars + wear states stay).
- **F-0707-4 Prospector invisible in practice**: "the robot is nowhere to be seen? How can I find it, activate and use it?" — embodiment+sprite merged yet unseen across a session; also needs a first-contact/use-legibility beat. → `lane-b-prospector-presence`.
- **F-BT-01-1 Do-nothing sluice tier**: "I upgraded the Sluice but it produces the same amount of gold — of course upgrading should improve production… towers or walls much stronger… otherwise it does not make sense. Not all buildings have to be upgradeable." → `lane-c-bt-02-production-semantics` (tiers get teeth; do-nothing purchases made impossible generically).
- **Terrain escalation (direction, not bug)**: "still based on the tiles as the baseline… I would like real terrain, ups and downs and nooks and crannies… a big step… will really add a lot… not sure how complicated." → W1-07 scope RAISED (visual maximum under the rendering-only law); gameplay-affecting elevation flagged as a separate epoch-class fork needing its own spec + owner go. Complexity honestly split: visual drama = cheap (existing W1 machinery); simulated elevation = expensive (breaks planar-sim law: routing/collision/determinism).

## Second wave of findings (~05:45, after wave-20 victory + first research picks)
- **CONFIRMED: wave-20 ceremony + research proposal flow works end-to-end** (owner claimed at 20, picked science). 
- **F-0707-5a/b Prospector half-sunk + inert** (screenshot): renders half inside the ground (groundY ignores sprite scale) AND does nothing at permission L0 ("No actions, nothing"). → folded into `lane-b-prospector-presence` items 6–7 (re-queued with corrected pre-flight).
- **F-0707-6 Research copy illegible**: "science that I did not really understand the implications of" — violates the spec's one-sentence legibility law. → `lane-a-sci-copy-clarity` (queued): effect-first copy + numbers + generic e2e legibility guard.
- **Science pacing signal**: "moving towards the steampower area quickly" — threshold 6 may be fast; owner's desk pacing re-check stays open, revisit after epoch-1 fills.
- **F-0707-7 Walk animations "still not 100% smooth"** (hero + bandits, post-walk4). → `042-anim-smoothness` (queued, main): measure foot-slide/direction-snap/phase-reset before fixing.
- **GAMEPLAY-TERRAIN SPEC: owner GO** ("lets write that spec and think it through… many more options for future contracts/scenarios") → `specs/gameplay-terrain/README.md` DRAFTED same hour: First-Claim Law, heightfield-as-data in epoch bundles, GT-01..07 ladder, 3 ratification items open.
- **Process note**: the 05:44 triple no-op was s61's own too-strict pre-flight ("0-ahead or STOP") colliding with the runner's by-design auto-commits — all three masters re-worded (safe-dupe rule) and re-queued 05:5x.
