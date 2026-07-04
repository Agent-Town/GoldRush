# M2-01 — buildable-registry-and-menu (expanded s9, 2026-07-04)

**Goal:** buildables become data; a 2-item build menu replaces the beacon-only build path; mobile build-UX debt from M1 is paid. No new combat behavior.

## Contract

1. **`BuildableDef`** (new `src/game/buildables.ts`): `{ id, displayName, costCurve(built: number): number, footprint: {w,d}, hpMax: number | null (null = indestructible, all null this slice), placement: 'bank' | 'river-adjacent' | 'any', slotFamily: 'building.<id>', maxCount, iconSlot: 'ui.build.icon.<id>' }`. Registry is a plain data module — no behavior switch-cases in `Game.ts`.
2. **Def #1 `sentry_beacon`** — UNCHANGED stats/behavior: cost curve 25/35/45/55/75/95, existing max count, damage/falloff untouched. `BuildSystem` reads the def; `SentryBeaconPool` stays as-is behind it. m1-05 suite must pass unmodified.
3. **Def #2 `palisade`** (canon naming: place-thing, not tool): static blocker wall segment. Flat cost **10** via `Balance.palisade.cost` (knob, tune at 07). Footprint 1×3-ish segment, bank placement only, own instanced pool (InstancedMesh per family, mirrors beacon pattern). **Light timber placeholder** — use the m1-07 tonal-pass wood palette, NOT `palette.wood` dark (carried minor: dark-wood-reads-black).
4. **Blocking:** enemies steer around palisades — local avoidance (AABB repulsion/slide in the movement update), NOT a navmesh. Enemies must still reach the hero around a finite wall line (no permanent stalls: cap avoidance so packs slide along and exit the wall face). Thieves/pathing-v2 is M2-04/05 scope.
5. **Menu:** B (and existing build button on touch) opens a 2-item menu (bottom bar or radial — implementer's call, match HUD parchment style, `ui.build.*` slots for future icons, clean placeholder tiles now). Keyboard: 1/2 select, Esc/B close. Touch: tap tile to select, tap again outside to cancel. Selecting arms the EXISTING ghost→confirm path (Enter / confirm tap; sub-frame tap buffer applies). No touch-drag requirement; hero-position ghost fallback stays.
6. **Mobile:** menu usable at 390×844 — tiles ≥44px tap targets, no HUD overlap, screenshot evidence.
7. **Economy:** generalize spend sink: `{ type: 'gold_spent'; sink: 'build_sentry_beacon' | `build_${string}` }` → emit `build_<defId>`. Existing log replay and summary math must stay compatible (`build_sentry_beacon` literal preserved for def #1 so old logs replay identically). Economy stays the only gold writer.
8. **Harness:** `__GR_TEST__.selectBuildable(id)`, `__GR_TEST__.state` exposes `buildables: {id, count}[]`; keep `placeBeacon` working (alias to def path). `?nowaves` for placement tests.

## Acceptance criteria

1. `npx tsc` + `npm run build` green; zero console/page errors on boot (desktop + 390px).
2. **m1-05 suite green UNMODIFIED** (def #1 proves the refactor is behavior-preserving).
3. New `e2e/m2-01-build-menu.spec.ts`: (a) open menu, keyboard-select palisade, place segment, gold −10 via economy log event `gold_spent` sink `build_palisade`; (b) beacon still placeable through the menu, cost curve intact across 2 placements; (c) blocking: `?nowaves` + `spawnPack` single enemy across a wall line → in-page rAF position tracker asserts no pass-through (enemy x never crosses wall plane within pad) AND enemy reaches hero within 20s sim (no stall) — single-enemy per bolt-diffusion/attribution lesson; (d) menu at 390px: tiles visible, tap-select works, no HUD overlap (bounding-box assert).
4. **FULL regression** (movement semantics changed): all suites, `--workers=1`, batches <35s per bash call, fresh vite per call (s5/s6 environment law).
5. Screenshots: desktop menu open, palisade line placed, 390px menu — to `reviews/shots-m2-01/`.
6. Draw calls ≤200 at stress with ~12 palisades + 6 beacons (instancing proof).

## Firewall (do NOT)

- No building HP/damage/repair (05), no gold theft (04), no new weapons (06), no sluice/stockpile (02).
- No changes to CombatSystem damage path, TargetingSystem queries, wave scheduling, or existing e2e files.
- No renames of existing Economy event types/literals; no STATUS/specs/reviews edits.
- Don't "fix" `?stress` alive-cap bypass or beacon pool pre-allocation (by design).

## Notes for implementer

- `BuildSystem` currently hardcodes beacon (`beaconCost`, `Balance.beacon.maxCount`, ghost). Refactor to def-driven while keeping `SentryBeaconPool`; palisade gets its own pool class in `src/entities/` (mirror `SentryBeacon.ts` structure).
- Enemy movement lives in the enemy update (see `src/entities/Enemy.ts` / wave system integration) — add avoidance as a velocity post-process, cheap (O(enemies × nearby walls) via coarse grid or radius cull).
- UI: extend `src/ui/BuildButton.ts` → menu component; theme.css parchment tokens exist.
