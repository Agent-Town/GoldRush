# Archive World — exact-base failure attribution

Four candidate failures reproduce on the exact base engine `0df7afdfb61520a896c158f0208e401731a733f465ab77a8fc4232bc495c65ba`:

- Archive census, both projects: expected no bench seeds, received two, at `e2e/er01-e10-census.spec.ts:138`. This is the same stale expectation recorded during Last Claim, reverified here against Archive’s own exact base.
- Registry mount assertion, both projects: expected 32,768 triangles, received 51,200, at `e2e/terrain3d-registry.spec.ts:217`, on The Claim before Archive is visited.

The two board/profile tests, both full-registry simulation-parity tests, fourteen story tests and shared brightness/collision checks pass. No existing assertion was edited. Candidate bytes/engine restored exactly. [Receipt](base-census-registry.json).
