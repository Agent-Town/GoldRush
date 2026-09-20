---
source: codex
project: Gold Rush
date: 2026-08-03
type: reference
---

# Night visibility — waves 8, 12, and 18

## Verdict

The fear survives. Full dark still has a black horizon, deep occlusion, and strong separation between safe pools and the surrounding field, but the ground plane and combat silhouettes no longer disappear into featureless black.

## Chosen render values

- Full-dark ambient floor: `0.22` hemisphere intensity.
- Dynamic night-light decay: `2.0 → 1.25`, with every light's existing distance unchanged.
- Terrain pool falloff exponent: `3.0 → 1.5`, with the existing radius and `1.25` falloff width unchanged.
- Full-dark palette: background `#080a0f`, fog `#14141a`, fill `#384862`, ground `#17120f`, sprite tint `#44516b`.
- Unchanged: darkness, radii, `minLight`, coverage, speed outside light, visibility cutoff, and pool exposure/tone mapping.

The first A/B arm (`0.14` ambient, `1.5` dynamic decay, `2.0` terrain exponent) raised full-dark lit share by less than one percentage point and was barely visible. The chosen arm is the next-smallest tested lift that materially changes the board.

## Measured full-dark change (wave 12)

| View | Mean luma | Lit share | Sampled ambient | Sampled hero outer band |
|---|---:|---:|---:|---:|
| Desktop | `37.30 → 49.97` | `36.06% → 48.95%` | `0.2939 → 0.3463` | `0.3157 → 0.3749` |
| Mobile | `36.10 → 49.28` | `37.88% → 52.19%` | `0.3159 → 0.3649` | `0.2586 → 0.3057` |

## Boards

- `comparison-board.png`: each row is wave 8, 12, then 18; columns are desktop before, desktop after, mobile before, mobile after.
- `before-board.png` and `after-board.png`: top row desktop wave 8/12/18; bottom row mobile wave 8/12/18.
- `before/` and `after/`: the twelve source screenshots and per-project diagnostic metrics.
