# Task lane-landmark-brightness: daylight landmarks stop wearing the night (LANE-B #2, commit prefix "fix:")
You are Codex (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: src/world/Terrain3dClaimPilot.ts ~:312 (THE DIAGNOSIS, attended: the night-pool wrap iterates ALL MeshStandardMaterials in the group — setting transparent=true + depthWrite=false + the darkness shader on EVERY material, LANDMARKS INCLUDED, on EVERY map; owner: "All the landmarks are very dark - is that on purpose?" — NO) · the night-mode-truth merge (what the wrap was FOR: terrain ground light pools on NIGHT maps) · the landmark mount path (which materials belong to landmarks vs ground).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Scope
1. SCOPE THE WRAP: night-pool material surgery applies ONLY on night-mode contracts AND ONLY to the terrain ground materials — landmark/panorama materials never get transparent/depthWrite/darkness mutations; daylight maps get zero wrap.
2. Restore landmark material sanity (whatever the wrap already mutated at runtime is rebuilt per boot — verify a daylight boot renders landmarks at full lit brightness; compare a sampled landmark luminance vs its atlas).
3. NIGHT STILL WORKS: the night-mode-truth spec stays green (pools on the ground, darkness beyond light).
3b. THE PERF CHAIN (owner, mid-run: "the map changed from 3D to normal" — the leak's transparent/no-depth materials cost fill-rate EVERYWHERE → real p95 collapse → the auto-tier watchdog HONESTLY degraded to painted): after scoping the wrap, assert daylight p95 returns under budget on the-claim (the night3d-perf harness) and the auto-tier does NOT fire on a plain daylight boot.
3c. THE TIER RECOVERS + SPEAKS: auto-tier degradation must show its toast on EVERY step incl. the painted fallback (verify the path exists — the owner saw a silent switch), and stickiness is per-SESSION, re-probing upward on next boot (never a permanent demotion — a fixed cause must heal the experience without owner surgery).
4. Spec e2e/landmark-brightness.spec.ts (both projects): daylight boot (the-claim) → a known landmark's dataset/probe luminance above threshold + material not transparent · night boot keeps the pool behavior · zero console.
## Firewall: the wrap's scoping + your spec. NO shader feature changes, NO art edits.
END: READY-FOR-GATES + before/after screenshots (daylight landmark).
