# Review — wire-crawler-3d (3D model for the Rival Dynamo Crawler boss)

- **Slice:** wire-crawler-3d (E3 crawler-boss 3D presentation)
- **Lane branch / tip:** lane/m3 → `26ab162d runner(lane-a): wire-crawler-3d.md`
- **Base:** `f066289b` (lane reset to main by s590)
- **Merged onto main:** this commit. Base `f066289b` → tip; main `6a45d88d`.
- **Verdict:** PASS — merged. Player-visible boss model upgrade → **GZ item appended**.

## What it does
Wires the real Crawler GLB model onto the Rival Dynamo Crawler boss (previously a placeholder). The mounted model flips **three damage morphs** as the player breaks the boss's components — DRAIN-MAST, TRACKS, and CAPACITOR-BANK each show a broken state — and the model is **disposed on kill** (no leaked renderer objects). Graceful degradation is preserved: LITE mode keeps the placeholder and never requests the GLB; invalid GLB bytes fall back to the placeholder presentation.
- `src/systems/CrawlerBossSystem.ts` (+157/−1) — GLB mount, per-component damage-morph flips, dispose-on-kill, LITE/invalid-bytes fallback.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 580ms |
| `e2e/wire-crawler-3d.spec.ts` | **6/6** (desktop + mobile): mounts GLB + flips all three morphs + disposes on kill · LITE keeps placeholder, never requests GLB · invalid GLB bytes keep placeholder |
| Adjacent — `e2e/e3-crawler-boss.spec.ts` | **8/8** (desktop + mobile) — four-act choreography, act gating, restore, failed-CONNECT-not-victory all still green; no regression |
| Renderer budget | `artifacts/wire-crawler-3d/renderer-counts-{desktop,mobile}-chrome.json` + `*-post-kill-baseline.png` confirm dispose-on-kill returns to baseline (no renderer leak) |
| Artifacts | `artifacts/wire-crawler-3d/{desktop,mobile}-chrome-{intact,drain_mast-broken,tracks-broken,capacitor_bank-broken,post-kill-baseline}.png` |

## Merge classification
- **Clean (all files, main == base):** `src/systems/CrawlerBossSystem.ts` (no other drain touched it since base — `git diff f066289b 6a45d88d` empty on that path), plus the new spec + artifacts. Checked out from the lane tip; verified byte-identical to lane (`git diff --cached lane/m3` empty). No 3-way graft needed.

## Findings
- None blocking. Dispose-on-kill + LITE/invalid-bytes fallbacks directly address the renderer-budget / lazy-instantiation discipline (no leaked textures on boss death, placeholder retained where the GLB can't load).
