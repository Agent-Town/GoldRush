# River — exact-base failure attribution

The two `e10-static-boss` secured-claim failures reproduce unchanged on the exact River base engine `9ab63072bf545c545e192f2a6d4623ccceb60235662638adb6f3c27736648cf5`, code `82782f50617ff7482fa5acedeee048ba6371a31c`, store `8ea5370ba1dfd4bc85276380875fdb87f17f7bf7`.

Both projects time out at `e2e/e10-static-boss.spec.ts:178` waiting for `bank-secured-claim`. Candidate and base have the same missing-element fingerprint. The helper restores the final candidate exactly, engine `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21`. No assertion or gameplay source was changed. [Replay receipt](base-secured.json).

River boot, finale staging and story batch: 18 pass. After the final ripple refinement, dedicated raw boot/finale: four pass. Charter Press, board unlock and River debt census: six pass. The broader map census reports four passes by its `contract unavailable` exemption; that is recorded as no behavioral coverage, not a real map pass. Its initially anchored grep matched no tests and was rerun with the corrected selector. The dedicated boot/actual lever proofs cover both real routes directly.

Final build and scoped guard receipts are green. Initial TypeScript narrowing and test-selector failures remain in raw logs; neither is presented as a product regression. Full node battery and engine pin belong to the drain.
