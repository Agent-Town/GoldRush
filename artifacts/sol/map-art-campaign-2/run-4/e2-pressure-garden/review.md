# Pressure Garden — run 4 correction

IMPROVED / HELD; full entry fidelity remains unaccepted. The plate is the target. Its three occupied boiler houses and rising garden beds are not communicated by this plain entry; the correction improves the existing machinery, service earth and water without installing false gameplay buildings.

| Original defect | Bounded result |
| --- | --- |
| Boiler-house hierarchy absent | HELD — the contract starts with empty player-buildable boiler beds. The central manifold is clearer (masked median +21.6% desktop / +21.4% phone at 5 m), but is not renamed or represented as a boiler house. Contract/layout owner via Claude. |
| Terrace hierarchy absent | IMPROVED — service aprons, cultivated rows and terrace crest pigment follow the unchanged published coordinates. HELD — the default view points across the river rather than displaying the rising terraces; full vista belongs to camera/layout owner via Claude. |
| Broad soft river band | IMPROVED — shorter broken flow lines, less pale ford wash and a narrower visual shore fade. HELD — rectangular parallel-bank geometry and remaining baked dark patches do not reproduce the plate's rocky river. River collision and crossing footprint remain contract-owned; further surface/terrain art remains in the campaign. |
| Dark repetitive ground | IMPROVED — fixed ground-region RMS 0.04371 → 0.02328 (-46.73%) desktop and 0.05552 → 0.03125 (-43.72%) phone. Region bounds are recorded; normal HUD remains on the images. |
| Peripheral machinery / portrait framing and HUD | FIXED at the declared manifold inspection station only — 5 m replaces the measured 14 m comparison, full phone bounds x37.9–352.1 / y275.4–433.3, persistent HUD 44.90% → 0.008%. HELD at plain entry — the manifold remains entirely offscreen on phone; phone pump 44.78% and east header 31.97% persistent coverage at their closest measured dry/legal stations. Camera/UI owner via Claude. |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Full visual metrics](visual-metrics.json) · [Independent review](independent-visual-review.md).

Plain captures use 1280×800 and 390×844, DPR 1, game clock 10 seconds, ordinary HUD, no debug parameter and no test hook. The separately labelled frozen diagnostic preserves normal HUD for reference frames. Persistent-coverage masks exclude temporary story/announcement strips only; they never replace the plain board. Sub-0.5% coverage can include edge/sway sampling noise and is not claimed as a meaningful obstruction. Offscreen geometry is reported separately, never as 0% covered and therefore visible.

Whole-body emission is now 0.45 on all five bodies, below the 0.6 cap, instead of the Pressure Garden exemption's 1.3–3.0. Diffuse grading retains iron detail. Some formerly overlit bodies become dimmer; exact masked values are in the metrics. Shader installation is idempotent across shared materials. Existing terrain/landmark/panorama GLBs, Blender sources, atlas pixels, mount coordinates, footprints and all gameplay data are unchanged. Both mirrored contracts carry the same new inspection stations. [Invariants](invariants.json) · [Triangle budgets](asset-budgets.json).

TypeScript/default/full builds pass. Final own spec 2/2, focused census 4/4, shared brightness/collision 16 pass + 4 skips, loading/repeat 8/8 + 2/2, render guards 34/34 and named guards 3/3. Earlier own/epoch/shore batch: 10 pass and two shoreline failures; both failures reproduce on the exact base code and store bytes (`shore-truth.spec.ts:44`, undefined `dampGroundRadii[0]`). The untouched-base atlas census also reproduces its two known filename failures. No assertions were changed. The task's changed-since selector invokes the drain-only full node battery; it was stopped and this conflict is explicitly HELD for the drain, not recorded as green. [Node and selector receipt](node-gates.json) · [Exact-base shoreline attribution](base-shore.json).

Four fresh timing runs per arm/viewport, 180 frames each: one shared timing mode; p95 medians 9.20 → 9.25 ms (+0.54%) desktop, 9.05 → 9.05 ms (0%) phone. Draws stay 90 / 58 and triangles stay 102668 / 97232 in these entry frames. [All samples and mode report](performance-summary.json).

Engine `c8229bd4e2e1bd7d351255ba1460f640c8a67bc9f01c4c335ca17c27517d50a3` → `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b`; pin untouched, owned by drain. Store commit `9fa06cc8e2e0f38ea8502b594f0c5aa6e1679157` is pushed to `astra/corrections-2`.
