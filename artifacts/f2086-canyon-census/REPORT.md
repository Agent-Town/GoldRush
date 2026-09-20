# F-2086-1 — Canyon Works asks for both galleries, but the sanctioned census harness cannot run it

**Fire:** s2086 · **Date:** 2026-08-20  
**Subject:** `e3-canyon-works` connect semantics, pylon economics, and census preflight

## Verdict

The objective requires **two powered gallery consumers** by the end of wave 6. Those consumers are the west and east galleries; the authored graph puts three pylon relays in series between the sub-hall and each gallery, so satisfying both branches requires all **six** pylon beacons. Sol's six-beacon route measured the implemented objective, not a harder substitute.

The inherited **330 g** chain cost is confirmed: beacon cost starts at 25 g, grows by 1.3 per existing beacon, rounds up to the next 5 g, and caps at six. The six prices are `25 + 35 + 45 + 55 + 75 + 95 = 330 g`.

The new census itself is **not run and no new margin is reported**. The required campaign harness cannot select this contract: `scripts/gr-sim-campaign.mjs:67-69` restricts its board to `the-claim` and `e1-*`. Adding E3 selection would require changing an existing script, which the task firewall forbids. Law 2 explicitly says to stop if the harness cannot drive the contract; substituting a custom runner would make the resulting number inadmissible.

## What the objective asks

| Question | Answer | Evidence |
|---|---|---|
| What does `required: 2` count? | Powered graph nodes whose kind is `consumer` and role is `gallery`. | `src/sim/HeadlessContractSim.ts:1413-1421` |
| Which two nodes count? | `gallery-west` and `gallery-east`; other consumers do not count. | `assets/contracts/epoch-3-voltage/contracts.json:249-261` |
| Which pylon pairs feed them? | West base → west switch → west rim → west gallery, and the equivalent east chain. | `assets/contracts/epoch-3-voltage/contracts.json:263-267` |
| What makes a pylon relay live? | A healthy `sentry_beacon` within that authored pylon site's radius; its incoming wire becomes intact at the same time. | `src/sim/HeadlessContractSim.ts:1386-1402` |
| What does `byWave: 6` compare? | The current wave index, not elapsed seconds. Completion latches only while `wave <= 6`; failure latches once `wave > 6`. | `src/sim/HeadlessContractSim.ts:1427-1434` |

The contract declares the six sites at `assets/contracts/epoch-3-voltage/contracts.json:166-172`, the two gallery consumers at lines 249-250, their series wiring at lines 263-267, and the objective itself at line 276. The prose origin only says “power N galleries by wave 6” (`specs/epoch-saga/e3-voltage-bundle.md:75`); the consumer and graph resolve N and the required topology.

## What the chain costs

`src/game/Balance.ts:512-515` defines `costBase: 25`, `costGrowth: 1.3`, and `maxCount: 6`. `src/game/buildables.ts:204-206` applies `ceil((25 × 1.3^index) / 5) × 5`, producing:

| Beacon index | Cost |
|---:|---:|
| 0 | 25 g |
| 1 | 35 g |
| 2 | 45 g |
| 3 | 55 g |
| 4 | 75 g |
| 5 | 95 g |
| **Total** | **330 g** |

Remote placement also requires real travel: `BuildSystem.computeValid` rejects placement outside the buildable's placement radius (`src/systems/BuildSystem.ts:1602-1611`), and the headless simulator supplies the prospector position as that origin (`src/sim/HeadlessContractSim.ts:448-459`).

## Census stop

The intended command was:

```text
node scripts/gr-sim-campaign.mjs --player scripts/f2086-canyon-census-player.mjs --output artifacts/f2086-canyon-census/campaign --checkpoint artifacts/f2086-canyon-census/checkpoint.json
```

It cannot target `e3-canyon-works`: the harness has no contract argument, its argument parser accepts only player/output/checkpoint/resume/test-fixture, and its campaign contract list filters out every E3 contract (`scripts/gr-sim-campaign.mjs:67-69`). Running the command would measure early E1 contracts, not Canyon Works. `census.json` therefore contains an empty `rows` array and a machine-readable blocked reason; there are no hashes or margins to quote.

The fixture-shaped player remains at `scripts/f2086-canyon-census-player.mjs`. It encodes the established six-site, real-walk, 330 g route, but it was not used to manufacture a result through an unsanctioned runner.

## What is not established

- No current two-seed/two-run census result, completion time, deadline-close time, margin, or `eventLogHash` is established.
- The earlier reported `212.77 s` versus `210.03 s` result is neither reproduced nor disputed here.
- This does not prove the objective reachable or unreachable, and it recommends no balance or product change.
- It does not establish a globally fastest routing policy.

The contract was not edited. `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` is silent, so its `connect` block is byte-unchanged.
