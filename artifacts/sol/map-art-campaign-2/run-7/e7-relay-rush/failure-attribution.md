# Relay Rush — browser results and base attribution

All selected files ran on both projects, one worker. Completed desktop: **49 passed / 17 failed**. Complete phone: **48 passed / 17 failed / 1 skipped**. Aggregate: **97 passed / 34 failed / 1 skipped**. The first command was stopped after all 66 desktop cases, at the first mobile startup, to avoid its 30-minute process deadline during repeated Lantern fixture waits. That mobile fragment is superseded by the complete 66-case phone command. Individual test timeouts and assertions were unchanged. [Split receipt](project-split.json) · [Counts](browser-summary.json).

Both collision suites, the Signal browser/Node playbook comparison, direct horn probes, census and story cases pass. Fourteen Signal/ceremony/terrain-registry failures match the exact-base reproductions documented for [Dead Band](../e7-dead-band/failure-attribution.md) and [Picnic](../e6-picnic/failure-attribution.md).

The additional failure classes were replayed on code `823b06b1dce4b861be2fccf646245fc4cc864588` and store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`; all **10 selected cases fail with the same fingerprints**.

| Candidate failure class | Base evidence and scope | Owner |
| --- | --- | --- |
| Fourteen Lantern checks stop in `openReel` at `lantern-true-world.spec.ts:22`: `data-boot=independent` is absent | Claim and Signal fixture tapes each reproduce on both projects (four representative cases). The other ten candidate failures share this exact helper/precondition but were not individually replayed on base. | Lantern replay routing/fixture |
| Two Game replay cases, `lantern-true-world.spec.ts:167` | Both projects reproduce: lantern-show never appears, 45 s visibility timeout | Lantern Game-replay fixture |
| Two deck build cases, `rider-parity-grammar.spec.ts:86` | Both projects reproduce: deck-build exists but is hidden, 5 s timeout | Claim-Boat interaction/profile fixture |
| Two reanchor cases, `rider-parity-grammar.spec.ts:116` | Both projects reproduce: deck-anchor-open-water exists but is hidden, 5 s timeout | Claim-Boat interaction/profile fixture |

[Exact-base command, file hashes and restore proof](base-replay-rider-gates.json). The original engine hash matches the preflight, and the candidate restored byte-for-byte. This establishes the shared failure classes on base; it does not claim that every one of the 34 failures was individually replayed. The browser suite is not all green, and these owners are outside this task’s firewall.

The separate **new** gate-caller failure remains [pending its one-line roster fix](../gate-caller-attribution.md).
