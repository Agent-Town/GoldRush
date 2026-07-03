# Review: m0/03-hero-camera

Date: 2026-07-03 · Implementer: Codex (session 019f264b) · Reviewer: Claude · **Verdict: PASS**

Evidence (rerun): build ✓ · 6 e2e passed (W-moves-hero, river speed ≈0.55 probe, zone probe, nonblank, console-clean) ✓ · zero console errors ✓ · shots `reviews/m0-03-desktop.png`, `-mobile.png` — hero ~55% down-screen, river north, ford visible ✓.

Conformance: scaffold Player/Pickup demo fully deleted (Hero.ts owns movement; relay HUD gone, minimal TIME kept per spec) ✓ · Balance.ts created (speed 6.0, accel 20, decel 28; camera numbers) ✓ · CameraRig lerp/look-ahead ✓ · Intents extended, touch stick kept ✓ · diagnostics extended with heroPos (no renames) ✓.

Notes: (a) spec stated offset (0,22,10) "≈57°" — actual math is 65.6° pitch; the shot reads fine; camera pitch/oblique feel is a m1-07 tuning axis (lil-gui). Spec math corrected in review, not a Codex deviation. (b) River hue still leans green under sun tint — carried minor from m0-02, owned by art batch.
