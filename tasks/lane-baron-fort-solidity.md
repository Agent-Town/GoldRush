CODEX: model=gpt-5.6-sol effort=high
# lane-baron-fort-solidity — F-BW-19: the fort's walls learn to say no
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, gate walk 2026-08-03: "I was also able to walk through its fortress walls"): the Baron map's fort landmarks (fortified_far_bank, seized_headframe, siege_line et al.) lack hero collision — the run-map sibling of the town chapel/store walk-through (F-E1W-3's class, MQ-3 law: solid AND never-trap).
READ-FIRST: src/world/LandmarkCollision.ts + the side registry (assets/pilots/map-rebuild-spike/landmark-collision-contract.json — which maps have entries; baron's are the question) · the town collider census pattern (reviews/town-store-collider.md — the census + never-trap + walk-probe method to PORT) · the baron landmark mounts.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. E1-WIDE landmark solidity census (all five maps, every landmark that visually reads solid vs its collision entry — table; the fort is the proven offender, find the rest). 2. Registry entries for every gap (data-side; footprints honest to the visual body; never-trap: a hero inside at fix time resolves OUT). 3. ENEMY interaction sanity: enemies already path around registered solids — confirm new entries don't create stall pockets (coordinate with the stall-census tasks; run their probe if landed). 4. e2e: walk-into-each-face probes for the new entries + never-trap, per the town census pattern.
TOUCH-ONLY: the landmark-collision registry data + one spec + (only if a registry mechanism gap exists) LandmarkCollision.ts minimal. NO: landmark art/mounts, fight logic, town colliders.
SELF-CHECK: baron 22/22 + E1 suites green both projects · stall probes clean · walk-probe screenshots into artifacts/fort-solidity/.
READY-FOR-GATES + report: the census table + probes.
