# Task lane-c-t3-refinery-ceremony: T3 THE REFINERY — the missing door to E4 (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/ceremony/ (THE FRAMEWORK just merged — scripts.ts format, CeremonySystem, stages; T4/T5 are your precedents); lore/STORYBOOK.md §THE INTERSTITIALS T3 (RATIFIED: trigger sci-10 + refinery complete; THE HAND: the player opens the crack-tower valve; twin spigots; night build lit like E3 taught; dawn tram to the rim, the flats shimmering; SOUND valve squeal → liquid rhythm → first engine cough, twice, then catching; KEPT IMAGE: the town on the rim, backs to camera); the F-CER-1 finding in the ceremony branch report (reviews/ or the findings file): E3+ megaprojects have NO build path — nothing consumes EpochMegaprojectTarget for E3+, nothing writes projects['refinery']; src/meta/ContractFamilies.ts (:918 activateEpoch — the one seam; the epoch-3 manifest's EpochMegaprojectTarget 'refinery'); how T1's mill build worked (TownScene raiseStampMill — the legacy precedent you generalize, not copy).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/e2-arsenal main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: verify F-CER-1 still true (grep projects\['refinery'\] consumers — none) — fixed already = STOP SHIPPED.

## Why (F-CER-1 — THE E4 UNLOCK): E3→E4 is unreachable in normal play — the refinery megaproject has no build loop and no ceremony. This task opens the saga's next door; the owner's era-gate session waits on exactly this.
## Scope
1. **The megaproject build path, generalized for E3+**: a megaproject site/door on the town or run surface (follow the framework's door-render seam) that consumes the manifest's EpochMegaprojectTarget cost (bankedScience etc.) and marks projects['refinery'] complete — ONE generalized consumer driven by manifest data, not a refinery special-case (E6+ megaprojects ride it later).
2. **T3 THE REFINERY ceremony script** in the framework's format: TRIGGER (ceiling + refinery complete) · THE HAND: the valve — a hold-and-release primitive (open the crack-tower valve; the framework's `hold` with a release beat) · STAGE: placeholder painters per the script (night refinery, twin spigots, dawn rim) · SOUND beats (`t3-valve-squeal`,`t3-first-cough`) · KEPT IMAGE ("the town on the rim, backs to camera") · completion → activateEpoch('epoch-4-motor') through the one seam.
3. **Spec extension** e2e/ceremony-framework.spec.ts additive: T3 arms E4 with the hand, never without (the played-not-watched assertion); the megaproject consumer debits exactly the manifest cost; existing T4/T5 assertions untouched.
## Firewall: the generalized megaproject consumer + the T3 script + stages + additive spec. NO changes to T4/T5, activateEpoch's guard logic, or T1/T2 legacy paths.
## Self-check: tsc+build green · ceremony spec green (its config) both projects · town-era-switch + task-025 unmodified-green · zero console · screenshot reviews/shots-t3/valve-and-rim.png.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the consumer's manifest-driven shape + T3 evidence — the owner's E4 session unblocks on this merge.
