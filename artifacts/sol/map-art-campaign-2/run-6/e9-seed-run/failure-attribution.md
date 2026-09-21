# Seed Run base failures and final checks

Exact base: code `2ead3e33c89909f799d713b622fe7c0186fee1d4`, store `4613a6ff288eb6e984dbdd44e7e861ee1627da73`, engine `8e71546045562c64ef70c60d2616e0a2cc1cee965709dc89d691ca13d57164dc`.

`e9-roster.spec.ts:184` expects `e9Arsenal.eraActive === true` on ordinary Seed Run; observed false on desktop and mobile in the candidate and exact base. Final candidate rerun has the same two failures. Owner: profile/era activation via Claude.

An earlier candidate also failed `seam-visual-follows-sculpt.spec.ts:203`: changed seam fraction **0.350346** did not exceed the required **0.530969** (ground-control change about **12.0%**). Exact base reproduced that pixel-ratio failure. The **final full caravan/seam batch passes 15 checks with one intentional phone skip**, so the earlier failure is not an outstanding final red or a proven art fix. No threshold or assertion changed. The earlier candidate log was replaced by the final rerun; its observed fingerprint is recorded here, while the separate exact-base log survives. The gate helper now allocates fresh rerun logs/output directories so subsequent attempts preserve earlier raw evidence.

[Base comparison and byte restoration](base-seed-seam-roster.json) preceded the final enclosure/road-strength refinement. Final shared/canal-independent checks and ordinary-roster rerun cover the final bytes. The six passing board/roster checks establish their recorded scope; they do not override the ordinary-profile failure.
