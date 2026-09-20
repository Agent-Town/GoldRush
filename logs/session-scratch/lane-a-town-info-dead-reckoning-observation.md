---
source: codex
project: Gold Rush
date: 2026-07-28
type: reference
---

# Town info-note dead-reckoning observation

The original four timed movement legs were run unchanged with `--workers=1`.
Temporary instrumentation read each target from
`__GR_TOWN_DIAGNOSTICS__.plaza.slots`, then recorded `player`,
`activePrompt`, and `canvas.dataset.town3dPlazaPropsState`.
Assertions were suppressed for one observation-only run so all four original
legs could be measured.

| project | leg | target | published approach | arrival | delta | activePrompt | props |
| --- | ---: | --- | --- | --- | ---: | --- | --- |
| desktop-chrome | 1 | tavern | (-4.9, -4.9) | (-5.41, -3.60) | 1.40 | tavern | loaded |
| desktop-chrome | 2 | claim_office | (4.9, -4.9) | (5.63, -3.61) | 1.48 | claim_office | loaded |
| desktop-chrome | 3 | schoolhouse | (-6.6, 2.4) | (-5.63, -3.59) | 6.07 | tavern | loaded |
| desktop-chrome | 4 | assay_office | (6.6, 2.4) | (5.63, -3.59) | 6.07 | claim_office | loaded |
| mobile-chrome | 1 | tavern | (-4.9, -4.9) | (-5.51, -3.40) | 1.62 | tavern | loaded |
| mobile-chrome | 2 | claim_office | (4.9, -4.9) | (5.60, -3.48) | 1.58 | claim_office | loaded |
| mobile-chrome | 3 | schoolhouse | (-6.6, 2.4) | (-5.60, -3.45) | 5.93 | tavern | loaded |
| mobile-chrome | 4 | assay_office | (6.6, 2.4) | (5.60, -1.58) | 4.10 | null | loaded |

## Claim Office crossing samples

The `KeyD` portion was sampled every 200 ms before the original 350 ms
`KeyS` hold.

- desktop x at z=-3.62:
  `-3.68, -1.98, -0.13, 1.87, 3.37, 4.67, 5.63, 5.63, 5.63, 5.63`
- mobile x at z=-3.48:
  `-4.08, -1.83, -0.38, 0.87, 2.27, 3.77, 5.59, 5.60, 5.60, 5.60`

Both runs stop advancing near x=5.6 while the prop state is `loaded`.

Verdict: **(a) NAVIGATION / FIXTURE FAULT.** The original timed route stalls
against loaded plaza geometry and later legs land far from their published
approaches. When arrival is within the interaction radius, `activePrompt`
does fire; this observation does not indicate a real-player prompt failure at
the published approach.
