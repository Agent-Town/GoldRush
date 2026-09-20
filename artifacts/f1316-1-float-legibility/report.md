---
task: F-1316-1
date: 2026-08-01
branch: lane/m3
status: READY-FOR-GATES
---

# F-1316-1 — float-text legibility report

## Pre-flight and baseline

- `node scripts/lane-usable.mjs lane-a` → `USABLE`.
- Pre-change `npm run test:node-guards` → 203 passed. The task carried an s1316 estimate of 204, but this checkout measured 203 before any edit.

## Base-font measurements

Measured in Chromium with `context.font = '700 64px Georgia, serif'` before changing the renderer.

| Text | Measured width | Ratio to 192 px |
| --- | ---: | ---: |
| `+12` | 116.4375 px | 0.6064× |
| `Palisade II - timber holds longer` | 1059.5625 px | 5.5186× |
| `Turret II - brass cadence quickens` | 1117.9375 px | 5.8226× |
| `Sluice II - the works run richer` | 1010.9375 px | 5.2653× |
| `Stockpile Yard II - the yard holds more gold` | 1431.875 px | 7.4577× |

Every sentence exceeds 192 px, so the task premise holds.

## Final rendering

| Text | Canvas | Font | Rendered width |
| --- | ---: | ---: | ---: |
| `+12` | 192 px | 64 px | 116.4375 px |
| `Palisade II - timber holds longer` | 768 px | 45 px | 745.0049 px |
| `Turret II - brass cadence quickens` | 768 px | 42 px | 733.6465 px |
| `Sluice II - the works run richer` | 768 px | 47 px | 742.4072 px |
| `Stockpile Yard II - the yard holds more gold` | 768 px | 33 px | 738.3105 px |

The sprite width now follows the canvas aspect on every call. When a pooled canvas changes width, its uploaded `CanvasTexture` is replaced and disposed rather than resized in place; this avoids three.js immutable-storage failures during short→long and long→short reuse.

## Rendering assertions

Both desktop and 390 px mobile produced the same values:

- Long stockpile float: `738.3105 <= 768 - 20` and `fontPx = 33 >= 32`.
- Short warmup float `+0`: `renderedWidthPx = 89.875`, `canvasWidthPx = 192`, `fontPx = 64`.
- Pool reuse: short slots were uploaded before the long float, then the long slot was reused for short text; it returned to `canvasWidthPx = 192`, with zero `GL_INVALID_VALUE` warnings.

Screenshots:

- `artifacts/f1316-1-float-legibility/desktop-chrome.png`
- `artifacts/f1316-1-float-legibility/mobile-chrome.png`

I can read the complete sentence in both screenshots. It is small but intact on desktop and prominent on mobile; neither is the former mid-word fragment.

## Cap assessment

All four current upgrade sentences hit the 4× cap and therefore shrink: Palisade 45 px, Turret 42 px, Sluice 47 px, and Stockpile Yard 33 px. The 4× cap is adequate for the current copy and keeps the world sign bounded, but Stockpile Yard is only 1 px above the 32 px floor, so it leaves almost no headroom for longer future copy.

## Verification

- `npx tsc --noEmit` → clean.
- `npm run build` → green; existing chunk-size advisory only.
- `npx playwright test e2e/vfx-float-legibility.spec.ts --workers=1` → 2 passed (desktop + mobile); zero console errors, page errors, or WebGL dimension warnings.
- `npx playwright test e2e/vfx-visualy.spec.ts e2e/bt-01-tiers.spec.ts e2e/m2-01-build-menu.spec.ts --workers=1` → 36 passed / 4 failed. The failures are exactly the two named pre-existing cases in both projects: `Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button` and `insufficient gold leaves tier and gold unchanged`.
- Post-change `npm run test:node-guards` → 203 passed; baseline 203, delta 0.
- `codex review --uncommitted` found one P1 immutable-texture-storage defect. It was reproduced, fixed with texture replacement on dimension changes, and covered by the final short→long→short focused test.

No copy changed. `src/game/Game.ts`, `src/systems/BuildSystem.ts`, and existing specs were not edited.
