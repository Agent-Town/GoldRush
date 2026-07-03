# Review: Robin playtest feedback fixes (F1–F4)

**Verdict: PASS** (with 3 supervisor review-fixes applied in-loop). Codex session `019f26bd-3944-76a3-a8a7-b19089b2d4f4`.

## Scope delivered

- **F1 transient banner** — "Stake your claim." shows on run start, fades after ~4 s (CSS 420 ms opacity transition, `hud--announcement-visible` class). Banner element is now the generic announcement slot: `UiSnapshot.announcement: string|null` + `announcementAt`; Hud fades on change and self-clears. m1-03 wave banners reuse this.
- **F2 gold pickup feedback** — new `src/systems/Vfx.ts`: pooled (12) canvas-texture sprite float-text, generic `floatText(pos, text, colorHex)` API; wired to harvest tick in `Game.ts` ("+5" ochre `#c4883a`, dark outline, floats ~1.2 m up over 0.8 s, ease-out cubic + fade). `vfx.activeFloatTexts` added to diagnostics (extend-only).
- **F3 movement hitch** — diagnosis: Loop.ts was already variable per-rAF with 50 ms clamp (no fixed-step interpolation issue). `resizeRenderer` strengthened with cached client-size/DPR early-return (WeakMap). Camera lag reduced 0.12 → 0.08 (frame-rate-independent `1-exp(-dt/lag)` smoothing). Frame telemetry added: rolling 180-sample `frameMs.last/avg/p95/sampleCount` in diagnostics — next hardware playtest yields real numbers.
- **F4 camera pitch** — `Balance.camera.offset` (0, 22, 10) → (0, 22, 14.3) = true 57.0°. Camera lag/lookAhead/offsetY/offsetZ/downScreenLookOffset all lil-gui-tunable under `?debug` (Camera folder).

## Supervisor review-fixes (applied by Claude, in-loop)

1. **Float text sizing** — Codex's 44 px font on a 256×96 canvas at sprite scale 1.15×0.42 rendered glyphs ~14 px on screen (invisible at gameplay zoom — would have failed F2's purpose). Fixed: 64 px font on 192×96 canvas, sprite scale 1.6×0.8, spawn +1.7 m (clears the hat). Verified readable in close-up screenshot.
2. **Shadow frustum coverage** — sun shadow camera was ±34 around origin; claim is ±40. Corner regions would render with shadow-edge artifacts on real hardware. Widened to ±48 (2048² map → ~4.7 cm/texel, fine for placeholder blobs).
3. (Minor, deferred — see findings.)

## Evidence

- `npx tsc --noEmit` clean; `npm run build` green.
- e2e desktop-chrome: `feedback-fx` **2 passed**, `m1-01` **4 passed**, `m1-04` **4 passed**, `visual` **5 passed** (all re-run after review fixes).
- Canvas inspect: `ok: true, nonblank`, `consoleErrors: []`, `pageErrors: []`.
- Headless frameMs: avg 46.5 ms, p95 50.0 ms (≈21 fps = known SwiftShader ceiling; telemetry is the deliverable, numbers meaningful on hardware).
- Screenshots: `feedback-banner-desktop.png` (banner card + 57° composition, hero ~57% down-screen), `feedback-pitch-clean.png` (banner faded at 5 s — F1 proof), `feedback-floattext-closeup.png` + `feedback-floattext.png` ("+5" readable, pan ring visible; two stacked = timescale=8 artifact only).
- Art direction: banner is a parchment card with brass corner dots, serif type — Frontier Ledger consistent. Float text ochre-on-dark-outline reads on both sand and river. Illustrated, nothing gory. No firearm shapes/names introduced.

## Findings carried (not blockers)

- **Vfx texture churn**: `floatText` recreates a canvas + CanvasTexture per activation. Fine at pan-tick rates; will churn GC/GPU at m1-02 damage-tick rates → **m1-02 task must add texture caching by string** (damage numbers repeat).
- **frameMs per-frame sort**: `recordFrameMs` copies + sorts 180 samples every frame (~1.4 KB/frame garbage in the hot path — ironic for a hitch fix). → fold into m1-02: recompute avg/p95 only when diagnostics snapshot is built, or at 2 Hz.
- **Announcement source is derived, not evented**: UiBridge hardcodes `timeAlive < 4 → 'Stake your claim.'`, `announcementAt` always 0. Hud consumer side is fully generic. → m1-03 must add a push path (`setAnnouncement(text, simTime)`) for wave banners.
- **Intermittent dark rectangle** (headless, `?debug` + teleport runs only): a dark teal ~260×227 px canvas-rendered region at bottom-right appeared in some screenshots (never in default no-debug loads; not reproducible after settling — probe-f before/after clean). Ruled out: DOM (elementsFromPoint + child dump + canvas-hidden test), world-anchored geometry (raycast hits plain ground там), object centers (scene traverse). Suspect shadow/transient upload state; shadow frustum widened anyway. Watch during m1-03's camera-heavy e2e; investigate further only if it recurs on hardware or in default views.

## Ownership invariants checked

- `ui/` stays DOM-only (Hud imports `UiSnapshot` type only) ✓
- Vfx is three.js-side in `systems/` ✓
- Diagnostics extended, nothing renamed ✓
- Economy remains sole gold writer (Vfx triggered off harvest snapshot, reads only) ✓
- No new deps ✓ (lil-gui was already in)
