# Dust Flats existing-gate attribution

Own batch: 29 pass, 7 fail. Exact-base code and store control: 2 pass, 8 fail (includes the two explicitly requested atlas-census controls). Candidate source restored byte-identically; engine receipts are in [base-own.json](base-own.json). No assertion changed.

- Dust Flats storm test, both projects: `dustFlats` diagnostic is undefined at line 46 on candidate and base.
- Dust Flats plain road-grading test, both: expected 1 segment, received 0 at line 110 on candidate and base.
- Motor reel test, both: `assay replay failed: malformed tape` at roads-and-convoys line 80 on candidate and base.
- Shared atlas census, both: current production files differ from the retained filename census; reproduces on base at line 94 (F-MAC2B-6). This base test reads GLB filenames; our shader chunk does not change them.
- The first mobile SS-05 arrival test timed out waiting for a story beat. Both base runs pass this test, so this is not attributed as a confirmed base defect. The final focused candidate retry passes both projects (2/2); this is recorded as a transient initial failure, not an outstanding candidate defect.

The first three defects belong to the E4 diagnostics/replay owners via Claude, outside this render-only task. The atlas census belongs to the existing lane-d corrective.
