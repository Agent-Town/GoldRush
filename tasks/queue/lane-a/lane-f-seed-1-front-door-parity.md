CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f-seed-1-front-door-parity — the public agents' door is harsher than the game (F-SEED-1)

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). Commit prefix `fdoor:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/a`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/a origin/main` ONLY when clean.

## WHY (owner program, and the measurements that opened this — 2026-08-06 evening, attended seeding attempt)
The owner ordered the ladder seeded ("Maybe we could seed the ladder ourselves?"). The seeder (`scripts/seed-ladder.mjs`, committed with this master) ran two models through the public gr-sim door on `the-claim` seed `e1-the-claim-01` at nominal trail. MEASURED, all reproducible:
1. **Policy-invariant death**: idle, wiped-orders, and full-orders runs ALL die at wave 2, timeMs **81767** exactly. Orders are not no-ops (idle eventLogHash `fnv1a32:ca65f732` vs orders-run `fnv1a32:7f1d529f`) — the world changes, the outcome does not.
2. **Spawn/almanac mismatch**: the almanac's composition says wave 1 = 6 claim jumpers, wave 2 = 9 (15 total); the outcome reports **36 kills** by wave-2 death. Either spawns far exceed the almanac or `kills` counts something else — each is a defect (the almanac is the agents' planning instrument).
3. **Harvest yields ~nothing**: HARVEST seam orders active across a wave produced gold 5 once and gold 0 twice; BUILD stayed `pending` forever at `goldGte:0` because gold never accumulates. The economy loop is unreachable, so every build strategy is stillborn.
4. **Suspected root (RANK THIS FIRST): hero progression absent headless.** The browser hero levels, takes upgrade fittings, and scales; `HeadlessContractSim`'s view shows no offers and no levels while wave HP scaling continues — a flat-100hp no-upgrade hero mathematically dies exactly where these runs die. The in-browser rehearsals secured the-claim w10 in 4 calls; NO model has EVER secured ANY contract through gr-sim stdin (checked: eval history + standings).
5. Context: E1's five drivers pass their own suites — establish what the DRIVERS exercise that stdin play does not (they may bypass the hero-combat gap entirely, which would make the driver green a false comfort for the public door).

## READ-FIRST
1. `scripts/seed-ladder.mjs` — the reproduction instrument (its probes are one-liners; rerun them).
2. `src/sim/HeadlessContractSim.ts` — hero model, wave wiring, what `kills` counts, where upgrades/levels should enter.
3. The browser's hero progression path (XP, offers, upgrade application) in `src/game/` — the parity TARGET.
4. `e2e/` driver suites for the-claim/dry-gulch — what they actually assert.
5. `docs/bench/e2-readiness-census.md` — its naive-trail rows inherit whatever this finding taints (incline "died wave 2" reads differently if the headless hero can't scale).

## SCOPE
1. ATTRIBUTE first: instrument one browser run and one headless run, same contract/seed, and diff the first 3 waves (spawn counts, hero damage dealt/taken, gold from panning). Name the divergences with numbers.
2. CURE at parity, not at ease: the headless hero gets the browser's progression semantics (XP, auto-taken-or-policy-taken upgrades — deterministic choice rule, e.g. first-offer, documented in the view), panning yields per the browser's rates, `kills` and the almanac tell the truth. NO Balance changes — this is parity, not tuning.
3. Views expose what changed (level, upgrades taken) so agents can plan; grammar untouched unless an upgrade-choice verb is genuinely needed (if so: additive, manifest-derived, documented).
4. PROOF: (a) determinism pair still holds per contract; (b) a scripted competent-orders run (commit it as a fixture) SECURES the-claim at trail through pure stdin; (c) idle still dies (the game must stay losable); (d) driver suites + er01 census specs green UNMODIFIED or their rows honestly re-run and updated.
5. Re-run the ER-01-style naive probe for the E1 five + census-noted E2 rows if outcomes change; update census docs with bannered corrections.

## TOUCH-ONLY
`src/sim/HeadlessContractSim.ts` · `scripts/gr-sim.mjs` (only if the view needs the new fields) · census docs (bannered updates) · own spec `e2e/front-door-parity.spec.ts` · `tasks/BACKLOG.md` (goal-leaf, same commit).

## NO
Balance/difficulty values · browser gameplay · the seeder script (attended-owned) · standings API · manifest generator beyond additive upgrade documentation.

## SELF-CHECK
tsc clean · build green · own spec green both projects (the secures-fixture is the heart) · driver + census suites green or honestly updated · zero console errors.

READY-FOR-GATES. Report: the attribution table (browser vs headless, 3 waves), the parity changes, the securing fixture's orders verbatim, which census rows moved.
