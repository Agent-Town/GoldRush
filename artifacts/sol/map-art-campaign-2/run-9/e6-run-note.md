# Run 9 E6 fidelity — execution record

2026-09-23. Lane `sol/map-art-campaign-2`; lane store `astra/fidelity-2`.

Preflight: no ahead lane commits; aligned the clean branch with local main before starting. Primary and lane stores were clean. Lane store was already on `astra/fidelity-2` at `e62dbf97cc8ba3c9d8c98e338b84f37d807a67a3`, equal to store main. Pilot and plate symlinks resolve through the lane store. `npm install --no-audit --no-fund` and `npm run build` exit 0 (log `/tmp/gr-e6-preflight-build.log`). Cleanliness: only permitted `?? logs/guard-stats.jsonl`; nothing discarded. Port 5303 only.

1. **Glow Mesa — SKIPPED**: its latest run-6 review has no remaining art-owned HELD clause, and no independent-review file exists. Remaining mesa/grouping, state-dependent ring, and entry/UI holds belong to contract/layout/camera/Atomic owners. Prior art gains retained; no assets or code changed for this map.
2. **Half-Life Hollow — IMPROVED / HELD, complete**: “Its present stylized clock frame remains less architectural than the plate; this is not full gate-art acceptance.”
3. **The Picnic — pending**: “The existing large cross-shaped ground shadow and primitive prop forms remain visible in the board; no full art-fidelity claim.”

Remaining list in order: e6-picnic. No E1 map in this leg; E1 byte deltas do not apply.

Baseline attribution instrumentation: first replay restored production bytes but accidentally retained the newly copied source-input JSON, which is included in the engine inventory. The receipt rejected its base hash. Candidate restored exactly; this attempt is not accepted as exact-base evidence. Added that JSON to the absent-on-base manifest, retained the rejected receipt/raw output, and reran with a matching engine hash required.
