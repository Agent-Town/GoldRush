# Task lane-wreck-visibility: wrecked buildings must READ on sculpted ground (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: src/systems/BuildSystem.ts syncRubble (~:2101 — a 0.14-tall slab at visualYFor+0.08; the suspect: a thin flat slab at CENTER-point height sinks wherever the sculpted surface rises across its footprint — slopes swallow it) · visualYFor + the height source (heightAt) · the repair flow (how the player finds+repairs a wreck) · reviews/playtest evidence: owner, the Baron map, 2026-07-20: "buildings that have to be completely repaired are invisible now… maybe they are sunk in the ground?"

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (MQ-1 family, state-swap limb: built structures ride the terrain; the WRECK state renders as a slope-swallowed pancake — the player can't find what they must repair)
## Scope
1. DIAGNOSE FIRST on the-claim/e1-baron sculpt: confirm the swallow mechanism (center-height slab vs slope; or a height-source miss on the instanced path) — name it with numbers in the report.
2. THE FIX — wrecks become READABLE MOUNDS: sample the MAX terrain height across the footprint (not center), give rubble honest volume (a low mound, not a 0.14 slab — keep the instanced-mesh budget), and add the readability the state deserves: the existing repair-prompt/marker visible above it (reuse the marker grammar; no new UI systems). Balance-tunable lift/volume.
3. Spec e2e/wreck-visibility.spec.ts (both projects): wreck a building on a KNOWN SLOPED point of the sculpt (harness teleport+wreck) → the rubble's rendered top sits ABOVE the local terrain max (probe via the diagnostics/height seam) and a marker is present · repair restores the normal building · flat-map behavior unchanged (2D fallback boot) · zero console.
## Firewall: syncRubble/rubble visuals + the marker reuse + Balance + your spec. NO repair logic changes, NO wreck HP/economy changes.
## Self-check: tsc+build · your spec + the boss/build adjacents green both projects · zero console.
END: READY-FOR-GATES + the diagnosis-with-numbers + before/after screenshots.
