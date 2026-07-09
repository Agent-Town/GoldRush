# Task 058: device tiers — the game runs sweetly on the weakest family device (MAIN slot, commit prefix "perf:")

You are Codex on Robin's Mac, repo root. READ FIRST: AGENTS.md; the render pipeline knobs (maxDpr, shadows, scatter density, vfx pool sizes, enemy-bar counts, fog); playwright config (projects — a WEBKIT project = the Safari engine, our closest local iPad proxy); 052's network budgets (hold them). Pre-flight: main-slot tracked-clean (artifacts/logs/docs/tasks exempt). FAMILY QA #3 (owner's son, iPad at school): "very laggy" — runtime perf, not network (client-side game, ~12MB once, ~zero in play).

## Scope
1. **Quality tiers** (data-driven): FULL / BALANCED / LITE — scaling maxDpr, shadow map size/off, scatter+decal density, vfx pool sizes, enemy-bar cap, splat/mesh flags' cost knobs. AUTO-DETECT on boot (GPU renderer string + deviceMemory + iPad/iOS UA heuristics → tier; log the choice to diagnostics) + a Settings override ("Performance: Full/Balanced/Lite") persisted per profile.
2. **The webkit gate**: add a playwright WEBKIT project (desktop-safari class) running the core battery + a perf probe; establish envelopes for it (honest baseline first, then LITE must hold ~40fps-equivalent frame p95 at wave-20 stress).
3. **Deploy-churn kindness**: verify long-term caching headers on hashed assets (only truly changed files re-download per deploy); state the typical re-download size after a small merge.
4. Sim untouched (tiers are RENDER-ONLY — determinism/hashes identical across tiers, asserted).
5. iPad reality-check note for the owner: the exact URL + tier expected for his son's device class.

## THE SETTINGS SURFACE (owner extension, same order): the pause screen gains a SETTINGS button that swaps the whole sidebar to an options panel (in-run AND from the menu): quality tier selector + GRANULAR feature toggles (shadows / scatter density / vfx / enemy bars / splat-mesh flags / audio sliders relocated here) — ALL LIVE-APPLY so the owner workflow works: adjust → unpause → test → re-adjust until it feels right. Persisted per profile. The existing pause audio/tales controls MOVE into this panel (one settings home).

## Firewall
Touch ONLY: render-knob tiering + detection, Settings entry, webkit playwright project + probes, cache-header verification, e2e, artifacts. NO sim, NO gameplay values, NO asset changes.

## Self-check
tsc/build; tier-switch e2e (knobs verified applied; determinism hash identical across tiers); webkit project: core battery green + perf table (FULL vs LITE); chrome suites unmodified green; zero console errors; screenshots (LITE vs FULL same scene) into artifacts/058/. End: READY-FOR-GATES + the webkit perf table + the re-download-per-deploy number.
