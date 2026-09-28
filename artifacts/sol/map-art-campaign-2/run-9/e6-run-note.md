# Run 9 E6 fidelity — execution record

2026-09-23. Lane `sol/map-art-campaign-2`; lane store `astra/fidelity-2`.

Preflight: no ahead lane commits; aligned the clean branch with local main before starting. Primary and lane stores were clean. Lane store was already on `astra/fidelity-2` at `e62dbf97cc8ba3c9d8c98e338b84f37d807a67a3`, equal to store main. Pilot and plate symlinks resolve through the lane store. `npm install --no-audit --no-fund` and `npm run build` exit 0 (log `/tmp/gr-e6-preflight-build.log`). Cleanliness: only permitted `?? logs/guard-stats.jsonl`; nothing discarded. Port 5303 only.

1. **Glow Mesa — SKIPPED**: its latest run-6 review has no remaining art-owned HELD clause, and no independent-review file exists. Remaining mesa/grouping, state-dependent ring, and entry/UI holds belong to contract/layout/camera/Atomic owners. Prior art gains retained; no assets or code changed for this map.
2. **Half-Life Hollow — IMPROVED / HELD, complete**: “Its present stylized clock frame remains less architectural than the plate; this is not full gate-art acceptance.”
3. **The Picnic — FIXED / IMPROVED / HELD, complete**: “The existing large cross-shaped ground shadow and primitive prop forms remain visible in the board; no full art-fidelity claim.”

Remaining E6 list in order: none. No E1 map in this leg; E1 byte deltas do not apply.

Hollow baseline attribution instrumentation: first replay restored production bytes but accidentally retained the newly copied source-input JSON, which is included in the engine inventory. The receipt rejected its base hash. Candidate restored exactly; this attempt is not accepted as exact-base evidence. Added that JSON to the absent-on-base manifest, retained the rejected receipt/raw output, and reran with a matching engine hash required.

Picnic completion: native ground/cloth provenance retained, original body envelopes and simulation contracts preserved, bench omission fixed after independent critique. Builds/guards/probes pass; browser {'passed': 51, 'skipped': 5, 'failed': 4} with all failures replayed on exact base. Entry and grouping timings within 15%. Engine `083530624944acf74fd7beb888149f7dc017721185f8398be1b7eefec2e14ca6`→`e7c87a88d08517d84983d408a876cfa994068807fa51b3c54ee96bbe24710e32`. Store `9e33801ab1a2f2349fce6929f576a81a6611a7e2` pushed and read back. Rejected Picnic attempts are documented separately in [the map evidence](e6-picnic/rejected-attempts.md).

Final handoff: [E6 summary and immutable identities](e6-handoff.md). No remaining map in this leg; later epochs are outside this task.
