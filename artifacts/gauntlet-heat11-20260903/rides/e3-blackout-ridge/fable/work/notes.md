# e3-blackout-ridge — working notes (gen 11)

## Map facts (from contracts.json + source, ✓ VERIFIED)
- Hero stake `ridge-switch-house` (24,30) NE, heroStart:true. Zones: trunk-yard (SW, x-32..8, z-38..-8), breath-yard (x-8..24, z-6..18), ridge-line (x8..34, z20..40).
- secureWave 12, no connect latch → secure = survive to w12 + SECURE_CHOICE bank (HeadlessContractSim.ts ~1096: only `powerGrid.connect` gates, absent here).
- Night-locked darkness 0.86. Only headless effect: wreckers get 1.18x speed outside light coverage (nightSpeedMultiplier, Balance nightShift.nightSpeedOutsideLight=1.18, cutoff 0.35). Turrets unaffected.
- Power grid: producer 36W SW → 3 relay frames (pre-placed sentry_beacons at (-30,-30),(-18,-18),(-6,-6)) → capacitor-west (6,4) → capacitor-east (16,4) → lamps (12,20) & (24,30).
- CAPACITOR NODES START OFFLINE — no pre-placed capacitor_bank; lamps dark from boot. syncContractPowerGrid: beacon within 2.5 of pylon site = node online; capacitor_bank within 2.5 of cap site = storage online.
- Banking NOT required to secure. Grid = defense texture only.
- Enemies: fevered_saboteur (wrecker, bldgDmg 1.35, gates W(-39,-18)/E(39,-18)), night_runner (hero hunter). Spawn edges W/E/N.
- Seams: (8,30), (18,34), (30,26). Null floor (idle): dies w4 @134.8s, 52 kills, 0g.
- Trail default difficulty. No waveCadenceMult in twist.

## Plan v1
Fort ring on stake (24,30): turrets (21,27),(27,33),(27,27),(21,33); beacons (24,34),(24,26),(20,30),(28,30).
SET_WEAPON blast. Seam chain (18,34)/(30,26) near, (8,30) fallback; HOLD at seam (income law).
Drain-alarm probe near current seam, out-of-zone site. PICK_UPGRADE head. Ignore grid in v1.
