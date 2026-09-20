# Run 4 — capped after three map corrections

READY-FOR-GATES. Executed 2026-09-20; dispatch labels the evidence 2026-09-21 run 4. Code branch `sol/map-art-campaign-2`; art-store branch `astra/corrections-2` pushed. Main, engine-era pin, tasks, STATUS, gameplay, camera, HUD and existing assertions untouched. No fourth map started.

| Map, in order | Code | Store | Verdict |
| --- | --- | --- | --- |
| [Pressure Garden](e2-pressure-garden/review.md) | 14f55b33b | 9fa06cc | IMPROVED / HELD, full entry fidelity unaccepted |
| [Incline](e2-incline/review.md) | 500c950f0 | 213e677 | IMPROVED / HELD, full entry fidelity unaccepted |
| [Canyon Works](e3-canyon-works/review.md) | this commit | 068c0db | IMPROVED / HELD, full entry fidelity unaccepted |

Pressure Garden: worked-ground RMS -46.73%/-43.72%; manifold median +21.64%/+21.36%; whole-body emission 0.45; shorter river flow lines. Declared 5 m phone manifold coverage 44.90%→0.008%. Boiler-bed/terrace composition and rocky river fidelity remain contract/layout/camera/art holds.

Incline: ground/rail-bed RMS -37.86%/-33.85%; cable-house median +56.2%/+50.4%, emission 0.375; two cable returns/eight bin wheels add 392 triangles inside original bounds. Declared 5 m phone coverage 38.70%→0.27%. Cliff/lift/cart entry vista and principal phone rail/machinery remain layout/camera holds; platform/construction stays art-owned.

Canyon Works: exposed-background seam fixed (734/110 bright pixels→0/0) by closing the 1 m apron gap; no added triangles. Ground RMS -41.42%/-32.83%; dynamo median +35.28%/+33.51%, emission 0.45. Declared 3 m coverage 57.27%→0.002%. Gorge vista, truthful player-built pylon hierarchy, straight backdrop and machinery construction remain named holds.

## UI and camera handoff

- Pressure Garden phone entry manifold entirely offscreen. At the nearest measured dry/legal stations, pump 44.78% and east header 31.97% persistent HUD coverage remain. Primary manifold at 5 m is clear within mask noise.
- Incline phone entry principal machinery and rail remain offscreen. Each declared 5 m body station is below 0.34%; adjacent machinery can still overlap cards in the complete composition.
- Canyon Works phone entry dynamo remains 27.305% covered. Its 3 m station and all other declared stations are below 0.26%.
- All ordinary boards retain the normal HUD and dialogue. Only labelled persistent-mask measurements exclude temporary story layers; they do not claim those layers are fixed. Sub-0.5% edge/sway noise is not meaningful obstruction.

## Verification and drain exceptions

All three have TypeScript/default/full builds, zero-error plain boards at both widths, budgeted GLBs, four timing runs per actual-source arm/width, source/contract invariants, and independent visual critiques. p95 desktop/phone changes: Pressure +0.54%/0%, Incline -1.67%/0%, Canyon +0.51%/-1.02%; draw counts unchanged.

Pressure: own 2/2, focused census 4/4, shared 16 pass/four skips, loading8/repeat2, render34/named3. Shoreline undefined dampGroundRadii and atlas filename census reds reproduce on exact base.

Incline: own/E2 census10/10, shared16/four skips, loading8/repeat2, render34/named3. Source proof preserves every original vertex/UV and all five body exports.

Canyon: core/connect/crawler12 pass; visual census2 pass; shared16/four skips; loading8/repeat2; render34/named3. Four additional failures are attributed, not green: escort `cw-02-escort.spec.ts:128` expected HP39/actual40 on both projects; headless `er01-e3-census.spec.ts:61` expected connect deadline6/actual8 on both. Both pairs reproduce on exact base code500c950f0/store213e677; candidate restored exactly. Gameplay/QA owner via Claude.

`run-guards --changed-since` unconditionally dispatches the full node battery expressly reserved for the drain. Its run-4 invocation was stopped; named guards are not a substitute claimed as green. Full battery and engine pin remain drain-owned. Generated test evidence/Blender scratch remains under ignored `_raw/`; screenshot churn restored by named PNG paths, regenerated census table preserved/restored under the task's evidence exception. No video, trace zip or file over 50 MB staged.

## Engine hash pairs

- Pressure Garden: `c8229bd4e2e1bd7d351255ba1460f640c8a67bc9f01c4c335ca17c27517d50a3` → `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b`.
- Incline: `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b` → `adead14c0ca88daba465162c0156d527159596f6b9b4ccb85e1732ba14c182bf`.
- Canyon Works: `adead14c0ca88daba465162c0156d527159596f6b9b4ccb85e1732ba14c182bf` → `8544c803bfa47d4fd29da04b33ac01ed7f37d2fd6af2ba70c5738abc8d32ab35`.

## Last Claim — my verdict

Still UNACCEPTED. Grey fallback terrain and vent glow replace the plate's circular orbital deck, central orrery, ornate rim and three preserve stations; the phone view provides no architectural context. The missing mounted sculpt pack is still the correction, not a wording or brightness tweak. This reaffirms the existing verdict without starting another map.

## Remaining, in order

1. The Dust Flats (`e4-dust-flats`).
2. The Long Road (`e4-long-road`).
3. Gusher County (`e4-gusher-county`).
4. The Boneyard (`e4-boneyard`).
5. The Glow Mesa (`e6-glow-mesa`).
6. Half-Life Hollow (`e6-half-life-hollow`).
7. The Picnic (`e6-picnic`).
8. The Dead Band (`e7-dead-band`).
9. Relay Rush (`e7-relay-rush`).
10. The Far Side (`e8-far-side`).
11. Low Orbit (`e8-low-orbit`).
12. The Dome Basin (`e9-dome-basin`).
13. The Seed Run (`e9-seed-run`).
14. Devil's Alley (`e9-devils-alley`).
15. The Old Canal (`e9-old-canal`).
16. The Last Claim (`e10-last-claim`).

After those, only on the next owner-authorized continuation: Ember Shore, Archive World, then River render-only. River geometry/finale contract disagreement remains owner-held. The orchestrator queues the next correction task; this lane does not edit the queue.
