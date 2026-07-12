# e2-escort-mode — the ore cart runs the rail; the town defends what moves
ROLE: systems implementer. WORKDIR: lane-d (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high

## WHY (BUILD-PLAN §4 E2 item ③; the rail entity shipped `08b336f`, the Railcar boss already rides it — the PLAYER's escort verb is the missing half)
Bundle §B objectives: "escort (ore cart W→E along the cut, boss-wave: the Railcar enters at G1 riding the rail)". Escort is E2's mode-verb contribution to the whole saga (the Charter Press inherits every verb; convoys at E4 and component contracts at E7 build on this grammar).

## READ-FIRST
- src/world/RailPath.ts (the shipped path-follower socket — REUSE; the Railcar boss consumes it, see reviews/e2-enemies.md for its traversal grammar)
- specs/epoch-saga/e2-steamworks-bundle.md §B (rail cut W↔E at h=0, gates G1/G1', "NO building in the rail cut — the rail must run")
- src/systems/WaveSystem.ts (objective/wave plumbing; the Baron-escort ENEMY grouping at :605 is unrelated naming — don't conflate)
- assets/contracts/epoch-2-steamworks/contracts.json (e2-hill-mine modes — add the escort variant as DATA, engine reads it)

## SCOPE
1. ORE CART entity on the Hill Mine rail: spawns at the west railhead, travels W→E at fixed sim speed, HP + damage states; enemies within range prefer it (SIEGER/tough targeting weight per bundle: "toughs arrive ALONG the rail").
2. ESCORT objective mode: contract variant "see N carts across" — cart destroyed = objective failure state (run continues; objective marked lost), cart arrival = progress + gold payout at the railhead (E2's rail pays the town).
3. Repair interaction: hero (or agent at rung ≥1) can repair a stopped cart in-place (hold-to-repair, the palisade-repair grammar).
4. Board/briefing: the escort variant appears as a second e2-hill-mine board entry or objective line per the contract-catalog conventions (mystery law: tease, don't spoil the boss).
5. Determinism + MP posture line (cart state into snapshot v2 or sp-gate with finding).

## TOUCH-ONLY: new src/entities/OreCart.ts, WaveSystem objective plumbing, RailPath consumption (read-only reuse), e2-hill-mine contracts.json modes block, e2e new spec, artifacts/.
## NO: Railcar boss files, Terrain heights, pressure systems (lane-c's), art, Balance beyond a cart row.
## SELF-CHECK: tsc; build; new e2e (cart traverses; enemies engage it; destruction fails objective without ending run; arrival pays; repair works) green BOTH projects; e2-hill-mine full suite + e2-enemies + m1-01 + m2-01 unmodified-green; zero console; screenshots of the cart under attack + arrival.
END: READY-FOR-GATES + MP posture + one line on how the Railcar boss and the cart share the rail without collision.
