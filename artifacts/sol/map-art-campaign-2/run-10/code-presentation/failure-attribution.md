# Gate attribution — code presentation

2026-09-24. The original assertions remain unchanged. Presentation success does not clear these gates.

The full requested development-browser run was **47 passed / 7 failed**. A final frozen-source rerun of Twin Banks, Trestle, Relay Rush and Dead Band was **24 passed / 6 failed**; the remaining 24 build-menu/bandit tests passed in the full run. All six newly appended presentation cases passed in both runs.

| Persistent case, desktop and phone | Candidate fingerprint | Baseline control |
| --- | --- | --- |
| Twin Banks loads its two banks | `:96` centre expected river, received bank | Same assertion and values on saved preflight source, both projects |
| Twin Banks shared gold builds | `:48`, called at `:110`, stockpile ghostValid remains false | Same assertion and values on saved preflight source, both projects |
| Twin Banks both ford routes | `:228`, called at `:127`, west-ford predicate times out | Same assertion and values on saved preflight source, both projects |

The first mobile seeded-diagnostics case differed only in hero.y (0.07178324562509593 vs 0.3672938919067383). It passes on the final frozen-source rerun. This is recorded as transient, not falsely labelled a reproduced baseline failure.

The named citation guard fails the existing `tasks/e1-spec-truth-1.md:21` reference to Twin Banks line 110, which lacks a recoverable test title. The same citation failure reproduces on untouched main. The task file and guard bytes match preflight HEAD; all three extended e2e files retain the exact original prefix (`e2e-extend-only.json`, `citation-baseline-proof.json`, `citations-main-control.log`). Task and caller guards pass.

The E1 assertion fails because `motor-hauler-DGEx9v27-diet-c2bea0ac.glb` is emitted. The saved-source E1 release build fails the same asset assertion. Candidate owning browser harness: **26 passed / 4 failed**; its two harvest failures both stop at `release-build.spec.ts:330` because harvest.channeling remains false. All **4/4 selected baseline release cases fail at the same assertions**: harvest.channeling at line 330 and the same motor-hauler filename. No persistent candidate-only gate failure was identified. The harness inherits `playwright.release.config.ts` and changes its server port to the authorized 5312; standalone build/assertion receipts remain separate and red, never bypassed into a green release claim.

Baseline development run: **2 passed / 6 failed**, exactly the three persistent Twin Banks cases on both projects; both seeded-diagnostics controls pass. `baseline-server-proof.json` verifies all three new-code markers are absent in served baseline modules. No working-tree source restoration was needed.
