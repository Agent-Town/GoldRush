# town-era-switch — the town announces the age (lane-c; commit prefix "feat:")
ROLE: town presentation. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner ruling verbatim: "I would have expected all the houses using some form of steam and the change to E2 showing in town as well... The player should now that a new time is starting - also visually."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the town pilot dispatch (TownScene/TownTavernPilot — the per-building mount seam this extends) · docs/SOL-3D-C-QUEUE.md §WAVE 7 (the .eN.glb sibling convention + steam_anchor_N named-node contract) · the E2 steam/plume VFX that already ship (boiler smoke, vent plumes — REUSE the emitters) · activeEpochId/epochIsActive (era truth) · the era-backdrop pattern (menus already era-dress; the town itself now does).

## SCOPE:
1. ERA-KEYED MOUNTS: the building pilot loader prefers `<building>.e<N>.glb` for the active era, falling back down the chain (e3→e2→base) — data-driven, zero per-building code; works TODAY with zero variants present (all fall back) and lights up as Sol's variants land.
2. STEAM ANCHOR EMITTERS: when a mounted variant contains `steam_anchor_*` nodes AND the active era is E2+, mount the existing plume/steam emitters at those nodes (gentle, warm, performance-budgeted: one shared particle pool, LITE tier = no plumes).
3. ERA PROP SETS: the props pilot gains the same era-keyed loading (.eN.glb prop variants with base fallback) PLUS a manifest-driven mount for era-only accessories (`assets/pilots/plaza-props-3d/era-props.e<N>.json`: id/glb/transform — mounts when that era is active; absent file = nothing, zero errors). HERITAGE LAW: the pan monument is EXCLUDED from era-keying — it never changes (canon).
4. TOWN-WIDE ERA TOUCHES (the "new time is starting" read beyond buildings): era-keyed plaza accents from EXISTING assets — E2-active towns get soot-warmed lantern glass tint + the era backdrop already landed; hooks left data-keyed for later eras.
5. e2e `e2e/town-era-switch.spec.ts`: E1 profile mounts base GLBs (zero .e2 fetches); E2 profile with a synthetic .e2.glb fixture mounts the variant + emitters at its anchors; fallback chain proven (missing variant → base, no errors); era-props manifest fixture mounts + absent-manifest silence; pan monument identical across era profiles; LITE = no plumes; p95 ≤115%; zero console; both projects. Tavern/store/plate suites UNMODIFIED-green.

## Firewall
Touch ONLY: the pilot loader era-selection + the anchor-emitter mount + the plaza accent hook, the new spec + a tiny test fixture GLB, artifacts/town-era-switch/. NO Sol assets, NO era/epoch logic changes, NO VFX system internals (reuse emitters), NO sim.

## Self-check
tsc + build green · new + tavern + store + plate suites green both projects · zero console errors · screenshots: E1 town vs E2 town (fixture variant steaming).
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the fallback-chain truth table.
