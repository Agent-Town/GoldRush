# Task ss-01: the beat engine — the game learns to tell its tale (LANE-C, branch lane/polish, commit prefix "story:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; **specs/story-spine/README.md (BINDING — the mechanics section IS this task's design: beats, triggers, portrait cards, the soft-glow pointer, the laws)**; the townsfolk portraits (batch-009 processed — crop sources); the run-start recap + hint/blurb UI patterns (reuse their styling); per-profile seen-state pattern (hintsSeen in ProfileRecord — the beat system mirrors it). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner order 2026-07-07 ~23:40: "tie that together into a story line with character, visual story telling and then guide the user through that in the game")
The systems exist; nothing introduces them. The Baron proved it within hours (a boss fight nobody announced). This engine makes every future moment tellable — SS-02 fills the full E1 beat table; the Baron's hand-placed beats migrate onto this later.

## Scope
1. **The beat system** (new src/story/): beats as DATA ({id, trigger, speaker, lines(≤2), pointer?, oncePerProfile}) — triggers subscribe to EXISTING signals ONLY (first-boot, town-named, wave-complete N, first victory, science thresholds, contract unlocks, rung promotions; enumerate the signal registry, additive listeners, zero new tracking).
2. **The portrait card**: ledger-styled beat card with the speaker's portrait crop (data declares the crop rect per speaker from batch-009 sheets; the Elder/tavernkeeper/clerk/Prospector defined), bottom-third placement, never blocks input, auto-dismiss ~6s or click, queue (one at a time, min 3s gap, wave-banner collision law: sequence after, never over).
3. **The soft-glow pointer**: optional per-beat UI target (data-testid selector) gets a warm pulse until first interaction — one at a time, never gates anything.
4. **Per-profile seen-state** (beats fire ONCE; storage mirrors hintsSeen; the Tales toggle in Settings silences the system entirely — respected at the queue level).
5. **Eight proof beats wired** (from the spec's E1 thread): founding-welcome (the Elder, on town-named) · first-contract (tavernkeeper, on board-first-open) · first-loss (clerk, on first building lost) · first-victory (Elder) · deputy-hello (Prospector's own intro, on first XP-collect) · rung-lock-explain (on first denied toggle) · ceiling-reached (Elder, science-complete) · board-unlock-generic (tavernkeeper, any contract unlock — flavor line from the contract's manifest blurb).
6. Legibility law on every line; canon voice per the spec's cast section.

## Firewall
Touch ONLY: new src/story/**, the Settings Tales toggle, beat data file, portrait crop data, e2e, artifacts. NO changes to: the signals it listens to (additive listeners only), sim, the Baron's hand-placed beats (migration is a later task), existing hint system (coexists).

## Self-check
tsc/build; new `e2e/ss-01-beats.spec.ts`: seeded fresh profile → founding + first-contract + deputy beats fire once each with correct portraits · reload → none repeat · Tales-off → zero beats · pointer glows then clears on interaction · wave-banner no-collision (both forced same tick, sequenced); town specs + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (a beat card with portrait, the pointer glow, 390px) into artifacts/ss-01/. Commit on lane/polish. End: READY-FOR-GATES + the signal registry shipped + results.
