CODEX: model=gpt-5.6-sol effort=high
# lane-era-true-lights — F-BW-3: no electricity before its era
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner playtest 2026-08-03, verbatim: "in town there seem to be electric lights during the frontier area - that seems incorrect."): E1 is the flame era — oil lanterns, candle-warm windows. Crisp/white/steady light reads ELECTRIC, which canonically arrives with E3 (voltage). Suspects: the beauty shift's new town light vocabulary (window glow cards, lantern-string beads, dusk PointLights) plus the pre-existing lantern glow spheres — any of them too white, too steady, or too crisp for E1.
READ-FIRST: reviews/beauty-town.md (U7/U8 as merged — what glows now, which colors) · TownScene lantern/glow code (createLanternGlow, the string beads, window cards, the ≤6 PointLight pool) · townEraAccents (the per-era tint table — the RIGHT mechanism) · docs/GOLD_RUSH_BRIEF.md §4.1 palette + era grammar (E2 steam, E3 arc/electric) · the owner's screenshot context (day boot, frontier).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. AUDIT every town light-emitting visual (fixture glows, string beads, window cards, dusk points, era props) → table: element → current color/steadiness → era read (flame/electric) — cite the screenshot-able evidence.
2. ERA LIGHT GRAMMAR, data-driven via townEraAccents (extend the table, no hardcoded era ifs): E1-E2 = flame — warm amber (#ffb45c family), soft falloff, a gentle low-frequency flicker (subtle; a hearth, not a faulty bulb) on glow intensities; E3+ may earn steadier/cooler arc light WHEN their era props say so (only the accent table changes per era).
3. Apply to all audited elements; day-boot E1 shows NO glowing bulbs (unlit lantern paper by day was the shipped intent — verify and enforce); dusk/night E1 reads as flame town.
4. e2e: E1 town boot asserts no cool-white emissives on light fixtures (color-band check via diagnostics or pixel probe) · flicker present at dusk flag · era switch to E3 changes the read (accent table proof).
TOUCH-ONLY: TownScene light visuals + townEraAccents + one e2e spec. NO: LightField sim, run-scene lights, dusk/night flag defaults, layout.
SELF-CHECK: town suites unmodified-green both projects · zero console · before/after at day + ?townDusk, desktop + 390px into artifacts/era-lights/.
READY-FOR-GATES + report: the audit table + screenshots.
