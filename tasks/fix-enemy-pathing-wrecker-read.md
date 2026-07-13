# fix-enemy-pathing-wrecker-read — the crowd finds the gaps; wreckers wear their trade (lane-a; commit prefix "fix:")
ROLE: gameplay AI. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner, verbatim: "They often are behaving rather stupid when they walk - or get stuck... Also not all of them destroy/attack the buildings. It is not very clear to me which ones do that and which don't."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## VERIFIED ROOTS (trust but re-trace):
- src/entities/Enemy.ts resolveBlocker: memoryless per-AABB slide with random side bias (avoidanceSide) → oscillation at palisade corners/junctions = the observed stuck/stupid. No wall-following, no progress watchdog.
- chooseTarget: non-wreckers ALWAYS target the hero; only `wrecker:true` variants (baron/railcar/steam-wrecker/escort rail-tough) ever damage buildings (updateWrecker seek/swing). Non-wreckers shoving a wall LOOK like attackers while being harmless — the rule is invisible.
- Canon anchor: the Claim Office line "palisade ring ready; the gaps are your kill-lanes" — gap-flow IS the designed fantasy.

## SCOPE:
1. **GAP-FLOW (replaces the coin-flip slide)**: when a non-wrecker's path to its target is blocked by palisade segments, it commits to wall-following toward the NEAREST GAP in the blocking run (BuildSystem knows segment positions; a gap = a walkable interval between/beyond segments). Committed = keep the chosen side until the wall run ends or the gap is reached (no per-step re-flip). Separation still applies so the crowd files through gaps rather than stacking.
2. **ENCLOSURE GNAW (no soft-lock, owner-flagged judgment call)**: a progress watchdog (net displacement < 0.4 units over 3 sim-seconds while the target sits beyond a blocker) flips the enemy to gnawing the blocking segment at a FRACTION of wrecker rate (new Balance.wreck.gnawMult ≈ 0.25 — tune, document). The instant a path opens (segment falls or gap appears), gnawing stops and gap-flow resumes. This changes wall economics slightly — call it out in the report for the owner's playtest verdict (veto window).
3. **WRECKER READABILITY**: wreckers get a visible tell — use the existing tint/carry channels (they already have the lantern rule: enemyCarriesLantern): a carried wrecking tool or ember-red tint accent, consistent across E1/E2 wrecker variants; one-line ledger blurb ("Wreckers go for your buildings; the rest take the gaps"). Coordinate with e2-clarity-and-wreckers (queued lane-d — name plates): do NOT duplicate its plates; your tell is the sprite-side marker.
4. **Diagnostics + spec**: expose stuckWatchdogTrips + gnawing counts in enemy diagnostics. e2e `e2e/enemy-gap-flow.spec.ts`: (a) a scripted wall-with-one-gap scenario — 8 spawned non-wreckers all reach the hero side through the gap within N sim-seconds, zero watchdog trips; (b) fully-enclosed ring — enemies gnaw (wall hp drops) and stop gnawing when a segment is demolished; (c) a wrecker in scenario (a) ignores the gap and attacks the nearest building; (d) task-025 + m1-01 + baron battery + escort suite UNMODIFIED-green; zero console/page errors, both projects.

## Firewall
Touch ONLY: src/entities/Enemy.ts steering/blocker/watchdog paths, the minimal BuildSystem read-only gap-query accessor, Balance.wreck.gnawMult (+ pathing constants), the wrecker tell in the enemy presentation channel, the new spec, artifacts/enemy-gap-flow/. NO CombatSystem damage resolution (hitBuilding stays the single writer — gnaw calls the SAME context.hitBuilding at the reduced rate), NO wave composition, NO hero/thief behavior, NO boss logic.

## Self-check
tsc + build green · new spec + the four named suites green both projects · zero console/page errors · a 10s capture or frame series of the gap-flow scenario for the owner.
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + gnawMult chosen + watchdog stats from the spec runs.
