# Echo Canyon — bounded lighting pass, 2026-09-19

Candidate: only Echo Canyon's authored landmark grade 3→4, calibrated by the existing shared function to 0.45→0.60. The 0.6 whole-body ceiling is unchanged. No mount, geometry, sampler, contact, simulation or HUD edits.

| Original defect | Verdict |
| --- | --- |
| Near-black dishes and base lose detail | IMPROVED, not fixed: masked body median 0.06774→0.07391 desktop (+9.12%), 0.06848→0.07420 phone (+8.35%). Body pixels below 0.06 fall 41.02%→37.48% /40.34%→36.78%. The remaining black base/dish material is conspicuous and remains HELD for atlas/material re-authoring. |
| Dense ground competes with geometry | HELD: the high-contrast engraved field and terrain/panorama joins are unchanged. |
| Hard rectangular base/contact | HELD: no contact-shadow or base-geometry candidate was promoted. |
| Portrait camera clips array | The western array's complete bounds fit a declared 9 m south diagnostic station, x=-43,z=17: x97.6..292.4,y69.2..350.8 on 390×844. A 9 m east station clips and is rejected. This accepts frustum coverage only: the actual HUD still covers the upper body, so full framing remains HELD. Eastern array also fits at 9 m south (x=43,z=5), with phone bounds x98.7..291.3,y69.9..349.9; the HUD still obscures it. Both arrays have separate normal-HUD station images. |
| Full-map concept | HELD: sparse simplified silhouettes, black pedestal, material hierarchy and local lighting do not reproduce the plate's inhabited canyon. |

`lighting-metrics.json` uses an opaque-magenta depth-tested body mask. Overlay visibility is disabled only for the diagnostic image pair, preventing transient notices from corrupting the luminance measurement. All normal plain captures and framing stations retain HUD. Performance samples retain normal HUD: four interleaved 180-frame runs per arm, fixed camera/frozen simulation. Desktop p95 medians 10.0→9.7 ms; phone 10.0→9.55 ms. Draws unchanged 64/48. These modest timing differences are not an optimization claim.

Actual GLB geometry equals its declarations: terrain 32,768/60,000, panorama 3,084/4,000, five landmark bodies 552–1,756 each/3,000. No pack changed, so no rebake load/repeat check applies.

The first metrics command used Homebrew Python, which lacks Pillow; the same saved images were successfully analyzed with the available Python environment. No image was re-rendered to conceal that driver failure.

Engine `14d0ca36b8474f5284c71733530de331e7bac33e87569539f07f4175743ab476` → `65225d736a53b97ca7b9793c810f3afee0c0da677aecba18944dfba28fefb484`; pin unchanged. TypeScript/default/full builds PASS. Own mirror/control and standard Claim/Night Shift brightness tests **8/8 PASS**, with four opt-in tests skipped; production reference rig **2/2 PASS**. Plain before/final 1280 and390 have zero console/page errors, correct contract and no test hook. All five final materials render at0.6; the Relay Rush sibling stays0.45. The reference rig probes read landmark/terrain1.591 versus1.098 desktop,1.944 versus0.958 phone: the bright central mast dominates those point probes, which is why the full visible-body mask is the improvement metric. Named narrow guards PASS. Existing12/12 collision proof remains applicable to unchanged geometry/mounts. No full node battery. No concept ACCEPTED claim.
