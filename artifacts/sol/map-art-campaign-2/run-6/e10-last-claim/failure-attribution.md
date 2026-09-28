# Last Claim — existing-suite attribution

The own batch ran 34 cases: 30 passed and four failed. All four failing assertions reproduce on the exact starting code/store inventory in [base-exact-finale-census.json](base-exact-finale-census.json), with engine hash `c2018fcb58b57688525b2afe23a8fd99dd20e3ce481894e58f9017db628333c7`. Candidate restoration is hash-verified.

- Desktop and phone `e10-static-boss.spec.ts:178`: `getByTestId('bank-secured-claim')` is absent after recession. The expected bank button is not visible within five seconds. This finale/UI handoff is unchanged and belongs to Game/finale/UI owners.
- Desktop and phone `er01-e10-census.spec.ts:138`: Archive World bench seeds are expected `undefined`, but the current fixture contains `["e10-archive-world-01", "e10-archive-world-02"]`. This is a pre-existing census fixture mismatch, owned by its test/contract maintainer.

The first replay restored all consumed source and existing files but left new untracked pack files in the global engine inventory. It reproduced the same assertions, but its engine hash was not the starting hash; [that receipt](base-finale-census.json) is retained and is not the exact-base proof. The helper was extended to temporarily park only the explicit new-asset manifest in raw evidence and restore every byte. The second replay above matches the starting engine exactly.

The ordinary map census exits 0 but its result row says `FAIL: expected painted, got glb`; see [census-row.md](census-row.md). This is a new stale expectation caused by the authorized pack installation, not a base failure. `PAINTED_FALLBACKS` and the gameplay contract's old brightness exemption need the drain's fixture review. Existing e2e assertions were not edited. The direct pack proof verifies five mounted bodies, no skipped assets, no added walk surfaces and clean disposal across six cycles.

The initial new-pack render guard failures identified missing GLB extras, missing terrain export sidecar and the absent source-ledger row. The builder now emits all of them; the final scoped render guard passes 34/34. An initial overly anchored census grep selected zero tests; the corrected map selection runs both projects. All raw attempts are retained.
