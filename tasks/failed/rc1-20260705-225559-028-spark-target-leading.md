# Task 028: Spark Rig target leading + stale-target switch (MAIN slot)
ROBIN (post-025, ford era): targeting a bandit running PARALLEL to the river (toward a ford) = all bolts miss until manual Q+Q reset. Root causes: bolts aim at current position (crossers outrun them — the old bolt-diffusion lesson, now constant because fords make crossers the norm) + target lock never gives up.
1. TARGET LEADING: bolts aim at predicted intercept (target pos + velocity x flight-time estimate; clamp lead to Balance.spark.maxLeadRad). Knob Balance.spark.leading=true.
2. STALE-TARGET SWITCH: if Balance.spark.missSwitchCount (default 4) consecutive bolts at one target miss, drop lock and retarget nearest hittable. Q+Q manual reset stays.
3. e2e: crosser scenario (enemy scripted perpendicular at ford-speed, hero static) hit rate >= 70% with leading ON vs baseline recorded OFF; stale-switch fires after N misses (in-page bolt-hit tracker); CANARIES: single-enemy attribution suites (m1-02) green unmodified — leading must not break kill-attribution determinism at rest.
Firewall: CombatSystem/TargetingSystem aim path + Balance; no weapon stats changes. READY-FOR-GATES + hit-rate numbers ON/OFF.
