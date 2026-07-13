# fix-baron-boss-fight — the Baron earns his reputation (lane-c; commit prefix "fix:")
ROLE: gameplay + UI. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13, from owner Baron-contract playtest (three verified findings + one praise).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY — owner playtest 2026-07-13 (e1-baron, defeated wave 20, run to wave 26), verbatim:
- PRAISE (keep it so): "the size is great."
- **F-BAR-1**: "the healthbar does not work - it just died at some point, the bar never reduced."
- **F-BAR-2 (RULING)**: "It shot some shots and it was carrying something behind it (the rocket launcher?). I think it does not have to pull it behind it but the Baron can just carry it himself and use it."
- **F-BAR-3**: "The boss did not really destroy my buildings, it also did not do much damage. I just blaster + rig sparked the normal bandits and he died." (Run ledger: spark 100,314 / blast 74,700 total damage; boss died incidentally while owner focused adds.)

## VERIFIED ARCHITECTURE (read these, then trust your own trace):
- Bar: `src/entities/pools.ts` bossBarState() — group branch (bossGroupId aggregate) vs single-Baron branch (`ratio = baron.currentHp / baron.maxHp`, BARON_HP_SEGMENTS). e1-baron has NO components → single branch. The ratio math looks sound → suspect the RENDER side (UiBridge/DOM bar) or damage-source binding. PIN IT WITH A PROBE FIRST: boot `?debug&contract=e1-baron`, force-spawn the baron (debug seam), apply known damage, assert the RENDERED bar (DOM/diagnostics) tracks currentHp. Fix whatever the probe convicts.
- Cart: `src/game/Game.ts` syncBaronRocketCart() — a procedural cart group TRAILED behind the baron (yaw-offset ~0.9+ units). Per the ruling, the Baron CARRIES the launcher: mount the rocket rack ON him (back-carried; scale/offset from his render position + yaw; keep the teal telegraph pulse behavior and the volley firing arc). Remove the wheeled-trailer read. KEEP INTACT: the rocket-volley mechanic, `rocketCartCaptured` capture flow (Game.ts:4968 + wherever the flag is set on defeat), and the sky_rocket_battery research gate that reads it.
- Threat: WaveSystem.ts:704-725 spawns him wrecker:true with contract-twist scales (contactDamageScale/buildingDamageScale/supportBuildingDamageScale/pursuitRange from the e1-baron manifest). Owner evidence says the effective numbers don't menace. Tune the e1-baron twist (manifest/Balance — NOT global enemy scalars) so the Baron: seeks and meaningfully damages buildings (wrecker fantasy), pressures the hero when near, and has an HP pool that makes the (now-working) bar a readable fight arc rather than an incidental death. Target read: the boss is THE event of his wave — dangerous if ignored, killable with focus. Sim-check with the stat harness/dev seams; document chosen numbers + reasoning in the report.

## SCOPE (each independently checkable):
1. Probe → fix F-BAR-1 (bar visibly tracks baron HP; segments degrade across the fight).
2. Carried launcher per the ruling (F-BAR-2): rack rides the Baron, telegraph pulse + volleys + capture flow intact.
3. Threat tuning per F-BAR-3, e1-baron-scoped, numbers documented.
4. e2e: extend/add `e2e/e1-baron.spec.ts` coverage — bar ratio decreases under scripted damage; carried rack is parented/positioned ON the baron (no trailing offset); a scripted unattended window shows ≥1 building taking baron damage; existing 054/055/057 baron suites UNMODIFIED-green (057 rocket-cart spec: update ONLY if it asserts the trailing position — say so in the report if touched, keep capture assertions).

## Firewall
Touch ONLY: the baron bar path (pools.ts bossBarState/UiBridge bar render), syncBaronRocketCart + the cart group construction in Game.ts, the e1-baron contract twist values (its manifest/Balance entry), e2e baron specs per scope 4, artifacts/fix-baron-boss-fight/. NO other enemies/contracts, NO CombatSystem damage-resolution rules (one writer), NO economy, NO global wave scalars.

## Self-check (evidence, not vibes)
tsc + build green · baron battery (e1-baron + 054 + 055 + 057) green desktop+mobile-390 · adjacent task-025 green · zero console/page errors · before/after screenshots: bar mid-fight at ~2/3 and ~1/3, carried rack close-up, a wrecked palisade segment · report the tuned numbers table.
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + probe verdict on F-BAR-1's root + numbers table.
