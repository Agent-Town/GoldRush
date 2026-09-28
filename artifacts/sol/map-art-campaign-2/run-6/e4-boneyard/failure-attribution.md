# Boneyard gate attribution

The selected Motor specs report 24 passes and two failures. The failing test is `e4-roads-and-convoys.spec.ts:69` (both projects): its fixture replay stops at line 80 with `assay replay failed: malformed tape`.

Both failures reproduce on this map's exact code and art-store base, with the same test and error. The candidate was restored byte-for-byte; [the control receipt](base-motor-reels.json) records every source SHA and engine before/restored equality. This is the Motor replay fixture owner's issue via Claude; no assertion was changed.

Shared brightness/collision/fort checks: 16 pass, four opt-in skips. Required loading/repeat probes pass. These checks complement the map-specific plain-entry/station captures and unchanged collision/height contract proof.
