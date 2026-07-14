# railcar-choreography — the train fights back, by the book (lane-c; commit prefix "feat:")
ROLE: boss gameplay. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner: "The train also did not fight back. There should be some mechanics against the hero? Maybe rockets fired that the user can dodge? Or releasing some kind of drone/unit?" — BOTH suggestions are the BANKED DESIGN: lore/STORYBOOK.md E2 "BOSS CHOREOGRAPHY — THE ARMORED RAILCAR" Acts 0-3. Build the book.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the STORYBOOK choreography VERBATIM (Act 0 whistle dread · Act 1 passes: cow-catcher scatter + tough squad dropped at speed + ONE sky-rocket salvo onto MARKED ground per pass · Act 2 wheels broken → stand: boiler vent windows = damage windows · Act 3 the quit: crew walks, the kettle, the Baron line, the cart left behind) · the landed patrol/visibility fix (its reverse-at-ends becomes Act-1 passes — SUPERSEDE its simple patrol with scheduled passes, keep its alive⇒visible law absolutely) · the baron rocket-volley pattern (BARON_ROCKET telegraphs + marked ground — REUSE, don't fork) · 057's capture flow (Act 3's cart handoff already exists — connect, don't duplicate) · Balance house style · the warm law (crew quits unhurt; machines break, people don't).

## SCOPE:
1. ACT 0: the whistle — an off-map audio cue (manifest add, group sfx) two waves before the boss wave; repeats between Act-1 passes as the schedule-keeper.
2. ACT 1 PASSES: the boss makes rail passes (W→E, E→W) instead of loitering: per pass — cow-catcher knockback scatter on contact-line enemies-of-the-hero's-buildings? NO: scatter pushes THE HERO + deals modest contact damage (dodgeable by not standing on the rail); drops a tough squad at speed (spawn seam exists); fires ONE telegraphed sky-rocket salvo onto marked ground (baron pattern: marks appear, ~1.2s, then impact — DODGEABLE, the owner's ask). Between passes: off-map + whistle + NOT targetable (healthbar hides with it — the visibility law covers only targetable states).
3. ACT 2 THE STAND: wheels component destroyed → the current pass ends where momentum stops (on-field, per the patrol law), passes cease; the boiler VENTS on a rhythm — venting = the boiler component's damage window (damage multiplier during vents, resistant otherwise — the pressure grammar; numbers in Balance, documented).
4. ACT 3 THE QUIT: boiler cracked → cabin opens, the crew walk-away beat (warm law: unhurt, hands up, one carries the kettle — the existing beat/bark affordance; the Baron line VERBATIM from the storybook), the sky-rocket cart remains (existing 057 capture flow connects), boss resolves defeated.
5. e2e `e2e/railcar-choreography.spec.ts`: whistle cue fires pre-boss (audio diag), pass count + squad drops + salvo marks land per pass (probes), salvo damage avoidable by leaving marks (scripted dodge), wheels-kill ends passes on-field, vent-window damage multiplier measured, quit beat fires + capture flow intact, boss never invisible while targetable; zero console errors; both projects. 057 + wire-railcar-3d (if landed) + escort suites UNMODIFIED-green.

## Firewall
Touch ONLY: the railcar boss behavior module (pass scheduler/acts), the whistle manifest entry + cue call, salvo reuse of the baron rocket pattern (parameterized, NOT forked), squad-drop spawn calls (composition numbers in the contract twist, documented), Balance railcar block, the beat/bark hookup for Act 3, the new spec, artifacts/. NO CombatSystem resolution rules, NO other bosses, NO wave economy outside the boss window, NO presentation internals (the wire slice owns the model).

## Self-check
tsc + build green · new + 057 + escort suites green both projects · zero console errors · a full-fight capture (Acts 1-3) for the owner. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the acts' numbers table (pass speed/salvo damage/vent multiplier/squad size).
