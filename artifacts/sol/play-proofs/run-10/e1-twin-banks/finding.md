# Twin Banks — late excursion stopped, wave 20 still HELD

Changed-premise phone: **HELD**, wave 18 / 557.467 s / 0 HP / 28 gold / 3 repairs / 7 of 7 final pieces standing / `restoration.spent=false`. Existing secure assertion failed, exit 1; zero console and page errors. No bank/Book/reload proof is possible without securing. Desktop NOT RUN under the phone-pass gate. No second changed-premise phone attempt.

The guard demonstrably fired: repair-reserve requests at 38/40 and 31/40 gold and the late 31/150 upgrade request were refused. Since wave 14, the read-only diagnostic has zero north-bank samples and zero channeling samples; maximum distance from home is 8.758 units, versus 23.650 in the unchanged-driver diagnostic. The phone died near home at (3.893,-15.762), with all four turrets standing. This removes the observed late excursion but does not solve survival. Relative diagnostic duration +39.067 s / one wave is an observation, not a causal improvement estimate.

## Adjacent pre-cutoff driver finding (not repaired)

The changed ride has six acknowledged build records but seven final pieces, including a palisade at (0,-16). It first appears at 43.067 s (wave 1), far before the new wave-14 branch can apply. The captured inputs show turret selection at 40.400 s, Digit2 during an upgrade at 41.333 s, then Space at 42.400 s; the existing driver logs `turret did not place at 0.0,-16.0`. This supports a build-selection/upgrade-interruption hypothesis; it does not prove the event-dispatch root cause. General build/input handling is outside this task's restore-ground-only firewall, so it is reported, not changed. Final standing counts use the actual snapshot, not only row.builds.

The two phone openings also differ in placements and upgrades. This is not a deterministic A/B experiment. The unchanged repair helper still requires a 40-gold reserve even when the actual repair costs less; under the new cutoff it can defer affordable repairs. That tradeoff was not separately changed. Keep restore-ground opt-in. Further strategy/driver diagnosis is supported; a balance change is not.
