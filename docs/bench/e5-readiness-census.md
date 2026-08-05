# E5 READINESS CENSUS — Deepwater before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-5-deepwater`. Training/drill maps are excluded by the ratified ER-01 default. No contract can be admitted without inventing an E5 mechanic: the flagship's live boat, storm, arsenal, and Dredge-Queen consumers do not run headlessly, while the three variants declare their defining consumers missing. Forced generic GR-SIM runs were used only to record the idle Trail baseline below; each hash reproduced on a second run, but none is an acceptance pin because the support gate correctly rejects these contracts.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.**
- **DATA-GAP: 4 of 4** — the E5 signature systems have no complete manifest vocabulary or headless consumer. Regatta, Stillwater, and Flotilla declare their missing consumer; the Deepwater Claim does not yet declare its missing headless dependencies.
- **BROKEN: 1 of 4 (also DATA-GAP)** — Regatta's briefing promises six beacon gates, but `raceCourse.beacons` and the terrain contract contain five. The authored bundles otherwise load without console/page errors. Regatta and Flotilla deliberately remain unavailable (`harvestAnchors: []`), so active contract selection falls back to the Claim rather than booting a false contract.
- All four derived manifests expose zero interactable operations and omit `tileParams.deepwater` plus their variant fields. The seven standing-order grammar forms therefore cannot express the defining mechanics; generic verb acceptance would not be coverage.
- Both diagnostic seeds were forced through the generic path and repeated byte-identically. They remain outside the production bench registry because no E5 contract was admitted. The focused spec passed 8/8 across desktop and mobile projects, including both-seed support rejection and zero captured `console.error`/`console.warn` output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e5-deepwater-claim` | **NO** — support gate rejects it | **BLOCKED** — `DeepwaterClaimTile`, `DeepwaterArsenal`, and `DredgeQueenBossSystem` are browser-only here; headless dependencies are undeclared | **FAIL** — no boat, reanchor, storm, depth, arsenal, or Dredge-Queen operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:9d449cc4`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:96c6e567` | **DATA-GAP** — the era socket and dependency declaration must land before admission |
| `e5-regatta` | **NO** — support gate rejects it | **BLOCKED** — the declared race consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no checkpoint, race, fast-water, or racer-loot operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:348721b8`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:3a51716f` | **DATA-GAP + BROKEN** — the consumer is missing and the briefing says six gates while both data surfaces define five |
| `e5-stillwater` | **NO** — support gate rejects it | **BLOCKED** — `noise-hunt-consumer` is declared missing | **FAIL** — no quiet/noise, permanent-fog, storm-suppression, or leviathan-hunt operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:5eb24494`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:92ce69e7` | **DATA-GAP** — reject-don't-stretch until noise hunting is consumed and derivable |
| `e5-flotilla` | **NO** — support gate rejects it | **BLOCKED** — the declared distributed-base consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no hull ownership, formation, straggler, hull-loss, or rider-assignment operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:eb38173a`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:18ddc919` | **DATA-GAP** — reject-don't-stretch until the distributed-base consumer exists |

## FINDINGS

### F-ER01-E5-1 — The Deepwater Claim has no honest headless socket

The browser boots the flagship through `DeepwaterClaimTile`, disables generic scheduled waves, advances its storm and corsair scheduler, fastens builds to Claim-Boat pads, runs the E5 arsenal, and resolves the Dredge-Queen through its dedicated boss system. `HeadlessContractSim` runs none of those consumers, while the mechanics manifest advertises only generic build zones, spring cells, and a Baron row; the contract also lacks the `engineDependencies` declaration AP-11 requires for this gap. The attended fix master needs a Deepwater consumer socket plus consumer-derived boat/storm/depth/arsenal/boss vocabulary and the missing dependency declaration; ER-01 must not certify the generic WaveSystem diagnostic as the same contract.

### F-ER01-E5-2 — The Regatta facade has no consumer and disagrees on its gate count

Regatta declares `regatta-race-consumer` missing for checkpoint progress and competing-racer loot, and its derived manifest exposes neither those mechanics nor its fast-water course. Its empty harvest-anchor list also makes normal active-contract selection return the Claim fallback, so a forced GR-SIM run combines Regatta diagnostics with the wrong global mechanics manifest. Separately, the player-facing briefing promises six beacon gates while `raceCourse.beacons` and `regatta-terrain-contract.json` define five. The attended fix master must reconcile that count, land the race consumer, derive the course vocabulary from it, and make the contract selectable before headless admission.

### F-ER01-E5-3 — Stillwater's quiet hunt is data without a consumer

Stillwater declares `noise-hunt-consumer` missing for permanent fog, storm suppression, machine-noise emission, and leviathan attraction. The current headless path can generically fight an enemy roster, but the manifest exposes none of the quiet/noise choices that define the contract, so a deterministic death on both seeds is not playability evidence. The attended fix master must provide the consuming system and its agent/headless action surface before ER-01 can admit the map.

### F-ER01-E5-4 — The Flotilla has no distributed-base owner

Flotilla declares `distributed-base-consumer` missing for three-hull ownership, straggler targeting, nonfatal hull loss, formation reshaping, and one-hull-per-rider assignment. Those fields are absent from the derived manifest, and the empty harvest-anchor list makes active selection fall back to the Claim instead of booting Flotilla. The attended fix master must land that consumer, derive its hull/formation vocabulary, and make the contract selectable; a generic two-edge holdout is not an admissible substitute.
