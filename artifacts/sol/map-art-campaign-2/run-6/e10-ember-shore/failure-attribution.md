# Ember Shore — registry failure attribution

The selected existing terrain-registry mount assertion fails on both projects: expected 32,768 terrain triangles, received 51,200, at `e2e/terrain3d-registry.spec.ts:217`. It fails on The Claim, the first registry entry, before reaching Ember Shore. The assertion hardcodes the old count for every map; this pass does not change The Claim.

The exact base replay reproduces both failures with engine `2a898e9e9e87ddd72c9dea598df97363c9e179592ef33e69a54871da21c1efd3`. Candidate bytes and engine were restored exactly. The companion 2D/default-3D simulation fingerprint test passes on both projects for the full registry. No existing assertion was edited. [Exact-base receipt](base-registry.json) · [Candidate receipt](e2e-registry-gates.json).

All other Ember own, story, census and shared brightness/collision tests pass. The full node battery and engine pin remain drain-owned.
