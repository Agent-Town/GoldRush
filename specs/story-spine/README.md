# The Story Spine — E1's guided tale (characters, visual storytelling, the player's thread)
Status: DRAFT v1, 2026-07-07 ~23:45, attended (owner order before sleep: "tie that together into a story line with character, visual story telling and then guide the user through that in the game"). Slices fire-authorable; SS-04's Baron beats land with/after the Baron task.

## The thesis
Everything the game has is already a story — it just doesn't INTRODUCE itself. The spine turns the existing systems into a told tale: a player who knows nothing gets guided, beat by beat, from a nameless riverbank to facing the Baron and building the Steamworks — by CHARACTERS, not tooltips.

## The cast (all art EXISTS — batch-009 townsfolk + the Prospector + batch-011 Baron)
- **THE ELDER** (schoolhouse) — the mentor voice: science, research picks, the survey chart. Dry, kind, brief.
- **THE TAVERNKEEPER** — the quest-giver voice: the contract board, "word from the trails" (introduces each newly-unlocked contract with one line of flavor).
- **THE ASSAY CLERK** — the economy voice: first sluice, tiers, demolish refunds, crafting orders.
- **THE PROSPECTOR** (the agent) — the companion: its rungs ARE a story arc (stranger → approval-required helper → trusted deputy); its promotions get ceremony lines.
- **THE CLAIM-JUMPER BARON** — the antagonist thread: taunts from wave 5 of any deep run once science ≥ 4 ("A man in an oxblood coat was asking about your claim…"), his contract card appearing LOCKED with visible menace long before he's fightable, the fight, the vow of revenge (E2 hook).
- **THE TOWN ITSELF** — the visual narrator: growth stages, the megaproject site rising, dawn after Night Shift.

## The mechanics (one system, data-driven — no scripting engine)
**Story beats** = data entries: {id, trigger (existing signals ONLY: first-boot / named-town / first wave-5 / first victory / science thresholds / contract unlocks / rung promotions / baron events), speaker, 1–2 ledger-voice lines, optional pointer (soft-glow on one UI element, dismisses on use), once-per-profile}. Rendered as the existing ledger-card style with the speaker's PORTRAIT (crop from townsfolk sprites — visual storytelling on the cheap, real faces owning real moments). NO modal tutorials, NO forced sequences — beats narrate what just happened or gently point at ONE next thing. Skippable always; a "Tales" toggle in settings silences all of it.

## The E1 thread (the guided arc, ~20 beats — full table in SS-03)
Founding (naming → the Elder welcomes you by town name) → first claim (tavernkeeper: "the board's got your first contract") → first blood (wave 5: clerk explains repairs after first building loss) → first victory (Elder: science, the chart glows once) → the deputy (Prospector introduction at first XP-collect; rung explanation at first denial lock) → the board opens wide (each contract unlock = one tavernkeeper flavor line) → the shadow (Baron taunt-thread at science ≥4) → the ceiling (Elder: "the Steamworks awaits a town" — points at the banked counter) → THE BARON (his card unlocks with a bang beat; victory = the town celebrates, one-time square vignette) → E2's door (the megaproject site appears; the Elder's last E1 line: "Now we build.").

## Slices
- **SS-01 the beat system** (engine: data-driven beats + portrait cards + soft-glow pointer + per-profile seen-state; ~8 beats wired as proof). Fire-authorable NOW.
- **SS-02 the full E1 beat table** (all ~20 beats, copy per the cast voices above, legibility law: every beat ≤2 lines). Fire-authorable after SS-01.
- **SS-03 town vignettes** (visual beats: the founding stamp, the Baron-victory square celebration, the megaproject groundbreak — one-time, ≤4s, skippable). After T4/T5 land.
- **SS-04 the Baron thread** (taunt escalation + the vow + the E2 revenge hook). With/after the Baron task.

## Laws
Beats never block input · never repeat · never exceed 2 lines · always attributable (a face, not a system) · triggers only from EXISTING signals (no new tracking) · canon voice per §9 · the Tales toggle kills all of it for veterans.
