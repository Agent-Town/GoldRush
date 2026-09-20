# Music loop continuity — before/after

- Root cause: music loops shared the 12-voice governor with SFX. A saturated shot burst evicted the low-priority E1 loop; `Game.syncAudioLoops()` then recreated it at time zero.
- Before: the focused browser capture sampled the E1 playhead at 0.416 seconds, fired five shot sounds, then found the loop absent/reset at 0 seconds.
- After: the same capture keeps one E1 source alive; its elapsed playhead advances monotonically and its start counter stays unchanged across all five shots.
- Audible result: shots mix over the continuing band instead of snapping the Pan Theme back to its opening. This is inferred from source/playhead continuity in the headless Web Audio capture; attended speaker listening remains the supervisor's final gate.
