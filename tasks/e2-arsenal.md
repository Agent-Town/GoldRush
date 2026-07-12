# e2-arsenal — Boiler Lance, Pressure Mortar, Sky-Rocket Battery, Auto-Pan
ROLE: combat systems. WORKDIR: lane-c (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high

## WHY (BUILD-PLAN §4 E2 ⑤; pressure store SHIPPED cd82c106 — the era weapons can now drink from it)
## READ-FIRST: specs/epoch-saga/e2-steamworks-bundle.md (§B2 SKY-ROCKET = captured Baron science, lob kind, fireworks-never-ordnance; weapons table) · lore/STORYBOOK.md CH E2 arsenal section (the four lines law: FIRE pressure-feed+Boiler Lance · WATCH boiler-fed battery scaling · POWDER Pressure Mortar+Sky-Rocket · Auto-Pan is a TOOL beside the pan, never a pan mod) · src/systems/PressureSystem.ts (the store you consume) · src/game/Upgrades.ts (research-gated upgrade defs; epoch-2 research effectRefs) · CombatSystem lob/beam kinds (NO new damage paths — ADR-001).
## SCOPE
1. BOILER LANCE: steam-jet cone weapon (beam-family), fires while pressure held; research-gated per epoch-2 arsenal branch.
2. PRESSURE MORTAR: lob instrument beside Blast Charge; pressure cost per volley.
3. SKY-ROCKET BATTERY: the captured science — research node grants it ONLY when hasBaronMedal() (the capture IS the fiction); arcing multi-rocket salvo, gold-and-teal bursts, reads as fireworks.
4. AUTO-PAN: tool (uncommon crafted/upgrade), panTick reduction with pressure upkeep — sits BESIDE the pan; the pan itself untouched (the law).
5. Boiler-fed battery: turret fire-rate scales with stored pressure band (bundle: "fire rate scales with pressure!").
6. Determinism in fixed-step; MP posture line; balance rows in Balance.ts (StatSimHarness sanity run for Auto-Pan).
## TOUCH-ONLY: weapon/upgrade defs + systems, Balance rows, PressureSystem read API, one e2e, artifacts/.
## NO: pan modification of any kind, new damage resolution paths, epoch manifests research DATA (nodes exist), art.
## SELF-CHECK: tsc; build; new spec (each weapon fires, pressure drains, sky-rocket gated on medal) green BOTH projects; e2-pressure + hill-mine + m1-01/m2-01 green; zero console; screenshots of each weapon.
END: READY-FOR-GATES + MP posture + StatSimHarness verdict for Auto-Pan.
