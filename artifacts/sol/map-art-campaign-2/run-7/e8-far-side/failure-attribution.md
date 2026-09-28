# Far Side — browser and baseline attribution

Full own-file plus collision batch: **61 passed / 10 failed / 1 skipped**, both projects, one worker, 14.7 minutes. Far Side probe recovery, browser/Node map parity, both collision suites and Orbital story checks pass.

Six failures are the three existing terrain-registry assertions on both projects, reproduced on the original revision in [Picnic’s attribution](../e6-picnic/failure-attribution.md). The other four reproduce individually on this task’s exact code/store base, **4 failed / 0 passed**:

| Assertion | Candidate and base fingerprint | Owner |
| --- | --- | --- |
| `e8-roster.spec.ts:183`, both projects | e8Arsenal.available expected true, received false during an ordinary Mare Claim boot | Orbital profile/fixture |
| `er01-e8-census.spec.ts:108`, both projects | atmosphere-wall-consumer expected missing, but the contract already records landed | Mare Claim census fixture |

[Exact-base command, byte hashes and restore proof](base-orbital-gates.json). Base code `823b06b1dce4b861be2fccf646245fc4cc864588`, store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`; base engine matches preflight. No fixture or assertion was changed.

The full 72-case batch and base replay preceded the final unknown-ID compatibility guard. That guard restores the original empty result for inherited Object.prototype names; all **43 registered-map/alias outputs are byte-identical** before and after it. Final builds, direct probes, captures, timing and collision/Far Side recovery/parity checks are recorded separately in [final receipts](final-check-receipts.json). The broad failing files are not represented as rerun after that guard. [Compatibility evidence](../prototype-compatibility-after-fix.json).

The separate **new** gate-caller failure remains [pending its one-line package roster entry](../gate-caller-attribution.md).
