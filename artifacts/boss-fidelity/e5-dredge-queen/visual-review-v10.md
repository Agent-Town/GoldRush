# Dredge Queen V10 — closer asset translation, runtime acceptance pending

Target: the references show a substantial rounded paddle steamer with a multilevel domed wheelhouse, heavy salvage crane, paired covered paddle wheels, oxblood banners and an armored loot hold. Damage lowers and opens the grab, breaks wheel sectors, opens the hold and reduces the sail.

Fresh reviewer `/root/e5_v10_asset_review` inspected both references, the original production model, six V10 full renders and ten V10 2x crops without history or code. It judged V10 clearly closer with high confidence: dome/two-level cabin, paired covered wheels, enclosed hold, flags and brass/teal accents recover substantially more identity than the original.

The reviewer found no clear major floating assembly across the turntable; deck, crane pedestal and hull read as connected. Closed/open hold, reduced flag, lowered claw and broken wheel sectors are visibly distinct. Root also inspected V8–V10 intact/damaged/turntable views and agrees that the deeper rounded bow, shaped decks and splayed damaged grab correct real silhouette defects.

Remaining visible limits are retained, not dismissed: compact proportions and crowded deck; small, somewhat vehicle-like paddle faces; broad balcony/plain lower cabin; simplified lattice and flat talons; dark mottling and weak teal accents. The open lid still crowds the reduced flag/cargo in projection. Claw/rail overlap in projection does not prove an actual mesh intersection. These renders are neutral asset previews, not game-camera/material acceptance.

V9 independent source review found fore deck lamps outside the newly shaped bow. V10 places them from local hull beam and sheer. A fresh source review found no confirmed defect in that correction or the main .30/aft .40 flag-fold checks. The source-only review explicitly excludes rendering and runtime approval.

Current rendered GLB SHA `eac7854a97cf17c598b66e04f930c03fd991f54a6ac52fe4d735c7550738fe68`, 44,920 triangles and 6,588,152 bytes. Production-layout package SHA `f66ba8b7e03fd8997d4c94c18abc6630c9848c0a6d857c38c5ef0f6a594d7c42`, 6,588,168 bytes; only the embedded atlas image name differs. Geometry, morph, material and texture binary bytes match. Four original bindings, one embedded 1024 atlas, identity transforms and 8 × 5.043662 tall × 4.410588 beam remain.

Both exports pass structural/finite/normalized-morph checks, visible grab drop and talon splay, independent flag folds, wheel-station separation, saved-Blend byte-identical re-export and eight zero-intersection flag/lid checks. Existing production GLB guard reports zero violations. This supports moving to actual runtime inspection after E4's freeze; it does not close E5 or the E1–E10 goal.

Evidence: `candidate-neutral-10/comparison.png`, all nine renders plus SHA-bound receipt, `candidate-neutral-10/critique-crops/`, immutable `candidate-iterations/10/`, `candidate-source-review-v9/`, `candidate-source-review-v10/`, `candidate-validation/package-equivalence.json` and packaged `renders-fidelity-e5/contract.json`.
