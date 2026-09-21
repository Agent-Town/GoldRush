# Existing Orbital plain-profile failure

Candidate own batch: **22 pass / two failures**. Exact base rerun: **the same two failures**, desktop and mobile.

`e2e/e8-roster.spec.ts:183` expects `e8Arsenal.available === true` after seeding only the active-epoch key and opening ordinary Mare Claim; observed `false` on both base and candidate. This test does not boot Far Side. Base code `cd99e25b0`, store `0535aa5ffca2f422b0d15b378044d00b9e47771a`, engine `36abad02458965365c31dfe66a98155d66182324ab136feb6709bfa791ff0abc`.

[Exact byte/hash restoration receipt](base-orbital-roster.json) confirms the candidate source and both variant contracts were restored exactly before final performance capture. Profile/era activation owner via Claude; no assertion, profile, sim or activation code changed.
