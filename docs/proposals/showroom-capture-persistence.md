# Showroom capture progress survives run restoration

Implementation contract for F-2091-1, under the owner request to fix map playability. The existing additive v2 save policy in `specs/mp-snapshot-completeness/README.md` supplies the compatibility rule. No save key or envelope version changes.

The Showroom objective owns the number of captures in the current run. The appliance pen is a separate persistent reward: it survives multiple runs and cannot reconstruct that number. A restored quota must use the captured run counter, never the current pen total.

Add optional `showroomCaptures` to the v2 envelope. New snapshots include it only when the contract declares a capture quota. The value is a nonnegative safe integer; malformed values reject the envelope before game mutation. Capture, normalization, restore, and the shared future-state projection carry the same number, so multiplayer hashes distinguish different capture progress. A new run still resets the counter.

Older snapshots without the field remain readable and explicitly restore zero captures, matching their previous behavior. Their lost historical captures cannot be reconstructed. No cross-run pen credit is invented. Snapshots carrying the field require an objective owner on restore; restoration into a contract without a capture quota is refused before mutation.

Verify partial progress (five remains incomplete), complete progress (six stays complete), restart, missing legacy field, malformed numbers, both future-state projections, ordinary reload, and the public secure latch. A snapshot regression is distinct from a normal-control full play-through. Existing protected e2e specs and admission/difficulty rulings remain unchanged. Pen roster resync is outside this counter repair and remains a separate persistence concern.
