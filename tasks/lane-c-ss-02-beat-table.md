# Task ss-02: the full E1 beat table — the whole tale, told (LANE-C, branch lane/polish, commit prefix "story:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; **specs/story-spine/README.md (the E1 thread section = the content list; the cast voices = the style guide; ALL laws binding)**; the SS-01 engine (shipped — beats are data; this task is ~90% data authoring); the Baron's hand-placed beats (baron-presence — MIGRATE them onto the engine per its note); every trigger signal SS-01 registered. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (the owner's story order, completed)
SS-01 proved the engine with 8 beats. This task writes the WHOLE E1 thread (~20 beats per the spec) so a brand-new player is guided from nameless riverbank to the Baron to the Steamworks door — by characters, never tooltips.

## Scope
1. **The full beat table** per the spec's E1 thread: founding arc (welcome/first-contract/first-blood/first-victory) · the deputy arc (intro/rung-lock/first-promotion ceremony line/first-repair-credited) · the board arc (per-contract unlock flavor from manifest blurbs — incl. the geography blurbs from tile-identity) · the science arc (first pick/mastery moment/ceiling with the banked pointer) · **the Baron thread MIGRATED onto the engine** (taunt-thread beats at science≥4, the arrival, the defeat — replacing baron-presence's hand-placed cards with engine beats, byte-equivalent presentation asserted) · the Steamworks door (mill-funded/each-stage/complete-"awaits the whistle").
2. **Voice discipline**: every line ≤2 lines, effect-first where it points at UI (legibility law), each speaker consistent with the cast section (the Elder never exclaims; the tavernkeeper never explains mechanics; the clerk loves numbers).
3. **Trigger audit**: every beat's trigger = an existing SS-01 signal; anything needing a NEW signal gets flagged (not hacked in) — expected gaps listed in the report.
4. Tales-toggle + once-per-profile + collision laws inherited (engine-level — assert, don't reimplement).

## Firewall
Touch ONLY: beat data file(s), the Baron-beat migration (presentation parity asserted), e2e, artifacts. NO engine changes (flag gaps instead), NO new signals, NO copy on surfaces outside the beat system.

## Self-check
tsc/build; extended `e2e/ss-02-beats.spec.ts`: the full-thread walkthrough on a seeded fresh profile (staged: found→claim→victory→science→unlocks→ceiling) firing each arc's beats once, correct speakers/portraits · Baron parity (old cards gone, engine beats byte-equivalent in placement/style) · Tales-off silence; ss-01 + baron + town + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (one beat per arc) into artifacts/ss-02/. Commit on lane/polish. End: READY-FOR-GATES + the flagged signal gaps + the full beat count.
