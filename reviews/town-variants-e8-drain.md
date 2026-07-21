# Drain review — lane-town-variants-e8 (E8 Orbital town wardrobe)

- **Slice/branch/tip:** `lane-town-variants-e8` · `lane/m3` (lane-a) · tip `2427838c`
- **Drain:** s786 fire, 2026-07-21 · base clean main `12ee946a`
- **Verdict:** ✅ PASS — merge.

## What it does
Completes the E8 (Orbital) town wardrobe to full cast. Eight Town building GLBs each had an E5
variant but no E8 one; this lands the missing `<building>.e8.glb` for tavern (Orbital Canteen),
general-store (Dome Habitat), claim-office (Airlock Gate), assay-office (Regolith Works), chapel
(Launch Pad), schoolhouse (Mission Archive), stamp-mill (Mass Driver Rail), dynamo-hall (Solar Lens
Array). Each keeps its E5 shell + footprint and re-dresses in the silver/teal, brass/glass Orbital
vocabulary. Filename-bound zero-code wiring — at `&era=8` Town requests all eight `.e8.glb`.

## Evidence
| Gate | Result |
|---|---|
| Firewall | CLEAN — 11 files, all `A` (8 `.e8.glb` + runner review + 2 shots); zero src/existing-file edits |
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built in 1.91s`) |
| Runner budgets | 8 GLBs each 1 mesh/1 material/1024² atlas, 3.0k–12.9k tris (Town cap 15k), byte-identical re-export (SHA-256) — per runner report |
| Adjacent: `town-era-switch.spec.ts` | 12/14 pass batch; the 2 `:120` (E1/E2) failures are a **known ordering/contention flake** — `:120` passes clean in isolation (4.9s). My change is E8-additive only and cannot touch E1/E2 mount logic. Fingerprint-matched, non-blocking. |
| In-game (runner shots) | `reviews/shots-town-e8/{desktop,mobile}-chrome-e8-square.png` — QA'd DIRECT: all 8 buildings render the Orbital wardrobe (metallic silver/teal, brass fittings, green glass dome, portholes), Prospector + townsfolk present, **no error-magenta on meshes**, desktop + 390px mobile both clean |

## Canon (§9 / ADR-001)
Orbital re-dress of the existing civil silhouettes — no firearms, no letters/signage text, no gore,
no people-as-enemies. Mass Driver Rail / Solar Lens Array follow the same instrument-not-weapon
reading verified in the E8 reference-art drains (s779/s780). Clean.

## Notes
- **Era-gated → NO gazette** (not visible in a plain era-1 boot; consistent with the s-triage E6/E7
  wardrobe drains and the TK digest's exclusion of era-gated building art).
- Wired (filename-bound, player-visible at era 8) → deploy eligible.
- Findings: none blocking.
