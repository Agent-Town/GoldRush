# Exact-base Red Fields failures

All six failures reproduce on exact base code `3869bbcd5`, store `2a1c3e11ec470fb3761cb9e462d39b025b61f24f`, engine `d7cad8f8bd1ebb800b36fff3531b8726760b5430fcb516cd39d32a71bb420bcf`. Each fingerprint occurs on desktop and mobile.

| Spec | Unchanged assertion and observation | Owner |
| --- | --- | --- |
| `e9-arsenal.spec.ts:92` | Cure-Arms outcomes expect both a freed person and `fevered_machine_powered_down` for `steam_wrecker`; only the freed-person event appears. | E9 combat/arsenal via Claude |
| `e9-roster.spec.ts:184` | Ordinary Seed Run boot expects `e9Arsenal.eraActive === true`; observed false. | Profile/era activation via Claude |
| `tour-era-seed.spec.ts:125` | Nondebug era parameter expects preserved `epoch-2-steamworks`; actual contract is `epoch-1-frontier`, with the expected `the-claim` and `debug-disabled` fallback. | Profile/era activation via Claude |

Candidate batches: own **18 pass / two failures**; story/roster **16 pass / two failures**; selected entry/story **six pass / two failures**. No assertions or gameplay code changed. [Restoration receipt](base-redfields.json) verifies all changed source and tracked art-store bytes returned exactly before final captures and timing. The final low-surface atlas-cell revision does not affect these state-only fingerprints; final canal and shared visual/collision checks cover that revision.
