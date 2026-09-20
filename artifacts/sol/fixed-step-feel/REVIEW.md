# Fixed-step feel A/B review

Verdict: **ACCEPT — materially feel-equivalent.**

The owner-facing capture uses the same seed, targets, viewport, and absolute-time 30-second input choreography on current main (`32c362c`) and the fixed-step implementation tip (`c6fdfce`). Both runs have zero page and console errors.

Blind reviewer evidence:

- 2, 6, 14, 22, 26, and 29 seconds: traversal and camera framing closely align.
- 10 seconds: largest divergence, a transient roughly 25–30 px vertical camera phase offset; traversal remains equivalent and reconverges by 14 seconds.
- 18 seconds: brief roughly 20 px lateral/camera offset plus projectile phase difference; reconverges by 22 seconds.
- 29 seconds: the HUD timer reads `00:34` on main and `00:35` on fixed-step while gameplay framing remains aligned; the final diagnostics differ by only 0.059 simulated seconds, so this is a display-boundary phase rather than a one-second simulation drift.
- Projectile paths remain spatially continuous with no teleport or pop.
- No visible freeze-frame stair-stepping or material acceleration/reversal divergence.
- Final hero separation is 0.1502 world units after 30 seconds; matched-frame normalized MAE is 1.36–4.35%.

Gold Rush has no dash mechanic or dash input. The 23.0–25.5 second hard-reversal sequence is the honest acceleration/response proxy; no dash behavior is claimed.

Artifacts:

- `side-by-side-30s.webm` — labeled A/B video.
- `main-30s.webm` and `fixed-step-30s.webm` — exact 30-second source captures.
- `contact-sheet.png` — eight labeled matched-frame pairs.
- `manifest.json` and `frame-metrics.json` — capture metadata and objective telemetry.
