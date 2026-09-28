# Incline — run 4 correction

IMPROVED / HELD; full entry fidelity remains unaccepted. The existing contract describes low twin rail terraces, while the plate shows a single tall funicular climbing cliff faces. That geometry and the entry camera remain authoritative.

| Original defect | Bounded result |
| --- | --- |
| Stepped cliff absent at plain entry | IMPROVED terrace crest pigment follows z13/28/42 and the existing low benches. HELD — raising these to the plate's cliffs would change visual height and gameplay geometry; contract/layout owner via Claude. |
| Cable lift and carts absent at plain entry | IMPROVED upper terminal: two return cables connect the existing sheave to the lower works; eight wheels complete the two existing service bins. Upper body 1636 → 2028 triangles under 3000, original bounds unchanged. These are static service details, not a claim of active funicular motion. HELD — principal machinery and existing escort cart route remain outside the initial phone composition; camera/layout owner. Further terminal silhouette/platform fidelity remains campaign art-owned. |
| Dark mottled field | IMPROVED fixed region RMS 0.03079 → 0.01914 (-37.86%) desktop, 0.02749 → 0.01818 (-33.85%) phone. Median +71.84% / +30.95%. The desktop region includes the worked rail-bed surface; it is not a texture-only frequency claim. |
| Peripheral rail dominates | IMPROVED contrast and ballast separation at the unchanged x±12 routes. HELD peripheral placement and overall low perspective — camera/layout owner; no route or camera moved. |
| Portrait excludes rail and principal machinery | FIXED primary-body framing at its declared inspection station only: cable-house 14 m → 5 m gives phone persistent coverage 38.70% → 0.27%, full bbox x13.7–376.3/y191.3–474.7. All five individual 5 m stations stay below 0.34% phone coverage. HELD plain entry: principal body remains wholly offscreen and rail excluded. UI/camera owner via Claude; a station is not an entry fix. |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [All metrics](visual-metrics.json) · [Fresh independent review](independent-visual-review.md).

At 5 m, cable-house body median rises 0.08587 → 0.13416 (+56.2%) desktop and 0.09129 → 0.13730 (+50.4%) phone. Brake-tower medians rise approximately 53–60%. Whole-body emission is 0.375 on these three and 0.2175 on the other two, below 0.6. Other bodies are not claimed brighter. Painted yards reduce clutter without changing vertices or heights.

Both contracts declare identical measured stations. Original mount/footprint data, all terrain and panorama bytes, atlas pixels, and four sibling GLBs are unchanged. Every original source vertex, polygon and UV is retained, and all five saved Blender bodies re-export byte-identically to their shipped GLBs. Only the terminal receives 392 additional triangles. [Invariants](invariants.json) · [Source proof](source-verification.json) · [Budgets](asset-budgets.json).

Plain images use ordinary HUD, no debug hook, and game time 10 seconds at 1280×800 and 390×844. Diagnostic/mask images are separate. Sub-0.5% body-mask noise is not a meaningful obstruction; offscreen bodies are explicitly reported, not treated as visible with zero coverage. The independent review confirms clearer attachment and rail separation, while holding the hoop/axle silhouette, thin platform, red roof and overall cliff composition. Adjacent rear machinery can remain covered in the full station composition even when the primary body's mask clears the HUD.

Four actual-source/GLB runs per arm/width, one comparable timing mode: p95 median 9.00 → 8.85 ms desktop (-1.67%), 9.15 → 9.15 ms phone (0%). Draws remain 76/58 and entry triangles 106440/104528; the modified far terminal is outside that entry view. All samples retained in [performance report](performance-summary.json).

TypeScript/default/full builds pass; own gameplay and E2 census 10/10; shared brightness/collision 16 pass + 4 skips; loading/repeat 8/8 + 2/2; 34 render guards and three named guards pass. The changed-since selector conflict stays HELD for drain: it expands to the explicitly excluded full node battery. No existing assertion or engine pin changed.

Engine `6df23d2f3b41389eb2fa89d042c96a4f593a21c7482f8c0343026f2c82137d9b` → `adead14c0ca88daba465162c0156d527159596f6b9b4ccb85e1732ba14c182bf`. Store `213e6776f85bc729d39fc09e120b12a781b1d697` on `astra/corrections-2`.
