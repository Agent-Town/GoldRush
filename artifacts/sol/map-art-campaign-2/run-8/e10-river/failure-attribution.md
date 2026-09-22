# River — exact-base failure attribution

The five-file own-spec batch reports **22 pass / four fail / two E1-only skips**. Both desktop and phone fail identically on candidate and exact base:

- `e10-static-boss.spec.ts:178`: `getByTestId('bank-secured-claim')` missing after recession, expected visible within 5,000 ms. Finale/UI handoff owner.
- `er01-e10-census.spec.ts:138`: expected Archive seed value `undefined`, received `["e10-archive-world-01", "e10-archive-world-02"]`. Census fixture owner.

Base code `606778d1316e62c98f2511f7d475baa96dba204d`, store `f5f617c48f33ee6f4577c4a60fade8faf7b08e8d`, engine `872cfc6474c7bdcba83290f87685a14c6882749c12b5564bbe1a355a0d45a6ff`. The replay runs only these four existing assertions and reproduces all four fingerprints. New assets were absent and candidate source/store bytes restored exactly; [replay receipt](base-own-reds.json). No test or gameplay source was changed.

All **14 story tests**, **six selected T10/River census cases**, **16 shared brightness/collision tests**, loading **8/8**, repeat **2/2** pass. Four shared brightness checks are opt-in skips. Existing map-census success exempts River rather than rendering it: [explicit limitation](census-limitation.md). The required River boot and finale-staging tests pass in both projects in the own batch.
