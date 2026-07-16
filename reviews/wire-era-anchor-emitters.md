# reviews/wire-era-anchor-emitters.md

- **Slice:** wire-era-anchor-emitters (lane-a; "feat:") — every age breathes its own way
- **Branch/tip:** lane/m3 @ f492397a (runner(lane-a) commit)
- **Base:** 270a96af; **Merge commit:** 561281a3
- **Verdict:** ✅ SHIPPED — player-visible render feature, full gate green.

## What it does
Generalizes the single steam-anchor emitter mount into an anchor-prefix → emitter-kind registry so each era breathes its own way. `TownSteamPool` → `TownAnchorEmitterPool`, driven by `ANCHOR_EMITTERS`: `steam_anchor_` → warm plume (E2, unchanged), `arc_anchor_` → teal flicker (E3, `#83ded7` box shards), `exhaust_anchor_` → light-brown dust puffs (E4, `#c4883a` circles at opacity 0.34 — **E4 "light dust, NEVER black smoke" canon law honored**). Era-gated exactly as before; LITE mounts nothing; shared per-kind pools keyed off the scene; `MAX_ANCHOR_PARTICLES=128` budget. Plaza-props now also mount emitters per model. Dataset publishing generalized to per-kind `town3d{Arc,Exhaust,Steam}Anchors/…Flickers/Puffs/Plumes` counts.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | ✓ built in 825ms |
| `wire-era-anchor-emitters.spec.ts` (new) | pass ×2 projects (arcs+dust mount within shared budget; LITE mounts none) |
| `town-era-switch.spec.ts` (the GATE's pattern suite) | **unmodified-green** ×2 projects (E2 steam unchanged, fallback, LITE, upright) |
| `town-ts-03-prop-ring.spec.ts` (plaza-props emitter path) | green ×2 projects (draw-call budget held) |
| Combined | **18/18 passed (40.8s)**, desktop-chrome + mobile-chrome |
| Perf p95 (runner artifacts) | e3/e4 ratio **1.010 desktop / 1.021 mobile** (budget ≤1.15) |

## Merge classification (base 270a96af)
| File | Class | Resolution |
|------|-------|-----------|
| `src/town/TownTavernPilot.ts` | LANE-TOUCHED | clean (main unchanged since base; s636 prior merges were data-only) |
| `e2e/wire-era-anchor-emitters.spec.ts` | NEW | free |
| `artifacts/wire-era-anchor-emitters/*` (4 png + 2 p95 json) | NEW | free |

No conflicts. Firewall honored: only the anchor-emitter registry + spec + artifacts; no VFX internals, no Sol assets, no other src.

## Findings
- No blocking findings. Arc/dust presentation is placeholder-instanced-mesh (per scope: NO VFX internals); refinement can ride a later polish slice if the owner wants richer arcs.
- Player-visible → GAZETTE item appended; gameplay-affecting → DEPLOY owed (deploy.sh sandbox-gated for fires → attended per OWNER'S DESK).
