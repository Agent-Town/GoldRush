# Last Claim — exact starting-tree attribution

The initial own E10 batch reports 28 passes and six failures. An eight-case replay on exact code `debcc5001cc365b64d74f4ce2a1f7dcb0388646b` and store `aee63ba07d388a14ba4c48a0ef3fe9ecee42965a` reproduces four failures with the same fingerprints:

- Both projects, `e10-static-boss.spec.ts:178`: missing `bank-secured-claim` after recession. Finale/UI handoff owner.
- Both projects, `er01-e10-census.spec.ts:138`: Archive seeds are an array rather than the stale expected `undefined`. Contract/census fixture owner.

Base engine exactly `88c4256efeb97d64c205919e785173b9c7375fd4553c92bbe26de6a37d197ea4`; the candidate was restored byte-for-byte. See `base-finale-story.json` and its retained log. No assertion or protected source was edited.

The two initial story failures (desktop missing mote gazette beat and phone boarding beat not reaching the queue) did **not** reproduce on that base replay. They cannot be called fingerprint-matched known reds. The final isolated candidate rerun passes all 14 story cases on both projects (`e2e-story-final-gates.json`, 7.1 minutes). The initial two remain recorded as unmatched failed attempts; the final candidate does not reproduce them. They occurred while initial captures/builds were active, but that observation alone is not a proven cause.

The map census still names Last Claim as a painted fallback, despite the already-landed run-6 GLB. Its result is reported separately, never treated as evidence of a missing pack.

The extra `GR_RELEASE=e1 npm run build:release` guard fails on four emitted `char-jumper-e4-codex-v1` sprite files on both final candidate and **exact starting code/store**, with identical complete filenames. This is inherited release/sprite ownership, not an E10 art regression. The required `GR_RELEASE=e1 npm run build` and 34,274,360 B payload pass; the production later-contract URL exclusion passes 2/2. `base-e1-release.json` proves base engine identity and exact candidate restoration. No release assertion was changed.
