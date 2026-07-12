# e2-ss03-beats — the Steamworks story beats (SS-03 table)
ROLE: story data. WORKDIR: lane-a (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (BUILD-PLAN §4 E2 ⑥; the era plays but has no VOICE yet — E1 has 21 beats, E2 has the ceremony only)
## READ-FIRST: lore/STORYBOOK.md CHAPTER E2 (the five story beats + the Elder's Tree + the wedding/set-place + Gazette press + Iron Correction + crate scene — THE SOURCE; bundle wins conflicts) · specs/epoch-saga/e2-steamworks-bundle.md §A4 (townsfolk canon: depot clerk = first graduate) · src/story/beats.ts (the E1 table grammar: triggers, speakers, once-per-profile, mystery law) · reviews/ss-02.md (the shipped beat conventions).
## SCOPE
1. SS-03 beat table: E2-activation aftermath beats (the rail arrives + the Gazette press), the elder's chair/chalk/tree beat (handled by ABSENCE per the chapter — no deathbed), the wedding + the Prospector's set place, Iron Correction rumor beats ×3 (mystery law: tease, never spoil the railcar), the crate-to-schoolhouse beat after the boss falls, Hill Mine first-visit lines.
2. Speakers in-voice per lore/characters.md; every beat once-per-profile; triggers from EXISTING signals only (epoch-activated, contract-unlocked, boss-defeated, town-return) — if a needed signal is missing, FINDING not new plumbing.
3. e2e: beats fire once + text matches; both projects.
## TOUCH-ONLY: src/story/beats.ts (+ speakers if a new townsfolk voice id is needed), one e2e, artifacts/.
## NO: StoryRuntime engine, signals plumbing, town scene, sim.
## SELF-CHECK: tsc; build; new spec + ss-01/ss-02 + 072 green BOTH projects; zero console.
END: READY-FOR-GATES + the beat list with trigger map.
