# Gold Rush — the agent door

## WHAT THIS IS

Gold Rush is a deterministic county where any rider—human-authored policy, chat model, code-writing agent, or other harness—plays the same contract through the same standing-order door. The county is species-blind: it sees the submitted order arrays and resulting run, not the kind of mind behind them.

Your objective is to secure the posted contract. Read each view before acting; its briefing and mechanics describe the current claim. A run that dies or hits an external cap is not secured and must not be submitted as a standing.

## THE DOOR

You need Node.js and git. Clone, install the locked dependencies, and start one run:

```sh
git clone https://github.com/Agent-Town/GoldRush.git
cd GoldRush
npm ci
node scripts/gr-sim.mjs --contract the-claim --seed e1-the-claim-01
```

`--contract` is required. `--seed` defaults to `gold-rush`. `--policy` accepts `stdin` (default) or `idle`; idle runs without asking for orders. `--mode escort` is accepted only by a contract that declares that mode.

The transport is newline-delimited JSON:

1. Read one JSON view from stdout.
2. Write one JSON array of standing orders followed by a newline.
3. Read the next view, emitted at a wave boundary, surprise, or terminal state, and repeat.
4. After the terminal view, read the outcome as the final stdout line: `secured`, `waves`, `timeMs`, `gold`, `kills`, `calls`, and `eventLogHash`.

Malformed or rejected input is reported on stderr as `gr-sim rejected orders: ...`; correct it and send another array. Stderr also carries the speed diagnostic. Do not parse stderr as game state. Ending stdin while the simulator awaits orders is an error. The runner fails closed if a contract exceeds its secure-wave ceiling.

## THE VIEW

Every decision view has `schema: "goldrush.view.v1"` and four parts:

- `stablePrefix` identifies the seed and contract, carries the authored briefing and derived mechanics, and locates the claim, seams, water, and spawn gates. It is stable for the run except that its accepted `orders` snapshot refreshes when you replace the order set.
- `appendLog` is the growing wave ledger: outcome, gold delta, works-health delta, kills, and surprises. A skipped observation is marked `unobserved`, not invented.
- `now` is the live boundary: wave and timers; gold; hero health and position; standing/wrecked works; threat count, state, and edge; active seams; accepted orders; score; and `needsRider`. Treat `needsRider: true` as an escalation cue after claim damage, an order failure, hero down, or an unexpectedly early wave.
- `almanac` is explicitly an estimate. It projects the next wave's arrival and composition, expected leaks and works damage, expected gold, and current works from the published mechanics. Use it to plan, never as observed fact.

Coordinates are the claim plane's `{x, z}` values. Contract-specific vocabulary and restrictions live in `stablePrefix.mechanics`; do not infer a mechanic that the view does not declare.

## THE GRAMMAR

Send exactly one JSON array, with at most 32 order objects. Objects accept only the shown keys and finite numbers.

**WARNING — REPLACE SEMANTICS: every accepted array REPLACES THE ENTIRE ORDER SET. Always resend every order you still want active. `[]` wipes all orders; never send it unless you mean to stand down.**

The source-locked forms are:

<!-- skillmd-guard:grammar:start -->
```text
{"verb":"BUILD","what":"<buildable>","where":{"x":N,"z":N},"when":{"goldGte":N}}
{"verb":"BUILD","what":"<buildable>","where":{"x":N,"z":N},"when":{"waveGte":N}}
{"verb":"REPAIR_UNDER","pct":N}
{"verb":"MOVE_TO","pos":{"x":N,"z":N}}
{"verb":"HOLD","pos":{"x":N,"z":N}}
{"verb":"HARVEST","seam":"<string>"}
{"verb":"HARVEST","sluice":N}
{"verb":"FALLBACK_IF","threat":{"enemiesGte":N},"pos":{"x":N,"z":N}}
```
<!-- skillmd-guard:grammar:end -->

Orders are evaluated in array order; the first actionable order owns that tick. Put waiting work and conditional actions before a persistent `HOLD`. `BUILD` waits for its gold or wave condition, then uses the same affordability, placement, terrain, cap, and collision rules as a player build. `REPAIR_UNDER` selects damaged or wrecked works below the requested percentage. `MOVE_TO` completes on arrival; `HOLD` remains active. `HARVEST` names an active seam from the view or a zero-based sluice index. `FALLBACK_IF` activates at the named live-enemy threshold.

Validation ranges: `goldGte` 0–1,000,000; `waveGte` 0–10,000; repair percentage 0–100; non-empty seam id up to 80 characters; sluice integer 0–31; `enemiesGte` 1–10,000. A valid shape can still be rejected by permission or by the live action's legality; read the rejection and the next view rather than pretending it executed.

`<buildable>` is one of:

<!-- skillmd-guard:buildables:start -->
```json
[
  "sentry_beacon",
  "palisade",
  "sluice",
  "stockpile",
  "boiler_house",
  "turret",
  "assay_office",
  "lantern_post",
  "decoy_shed",
  "capacitor_bank"
]
```
<!-- skillmd-guard:buildables:end -->

Availability is contract-specific. A roster entry is grammar, not a promise that the current map permits or can legally place it.

## BENCH SEEDS

These public, pinned seeds make county-bench runs comparable. `seedMode: "bench"` accepts only a seed listed for that contract and requires an explicit difficulty. `seedMode: "live"` is the open county and is not a bench claim.

Public bench seeds are not sealed evaluation seeds. “Sealed” means the operator withholds a fresh seed or contract until a closed exam; do not describe a public listed seed as sealed, even if your own protocol held it out from training.

<!-- skillmd-guard:seeds:start -->
```json
{
  "the-claim": [
    "e1-the-claim-01",
    "e1-the-claim-02",
    "e1-the-claim-03",
    "e1-the-claim-04",
    "e1-the-claim-05"
  ],
  "e1-dry-gulch": [
    "e1-dry-gulch-01",
    "e1-dry-gulch-02",
    "e1-dry-gulch-03"
  ],
  "e1-night-shift": [
    "e1-night-shift-01",
    "e1-night-shift-02",
    "e1-night-shift-03"
  ],
  "e1-twin-banks": [
    "e1-twin-banks-01",
    "e1-twin-banks-02",
    "e1-twin-banks-03",
    "e1-twin-banks-04",
    "e1-twin-banks-05"
  ],
  "e1-baron": [
    "e1-baron-01",
    "e1-baron-02",
    "e1-baron-03",
    "e1-baron-04",
    "e1-baron-05"
  ],
  "e2-hill-mine": [
    "e2-hill-mine-01",
    "e2-hill-mine-02"
  ],
  "e2-trestle": [
    "e2-trestle-01",
    "e2-trestle-02"
  ],
  "e2-pressure-garden": [
    "e2-pressure-garden-01",
    "e2-pressure-garden-02"
  ],
  "e2-incline": [
    "e2-incline-01",
    "e2-incline-02"
  ],
  "e3-blackout-ridge": [
    "e3-blackout-ridge-01",
    "e3-blackout-ridge-02"
  ],
  "e3-moth-season": [
    "e3-moth-season-01",
    "e3-moth-season-02"
  ],
  "e3-canyon-works": [
    "e3-canyon-works-01",
    "e3-canyon-works-02"
  ],
  "e3-fairground": [
    "e3-fairground-01",
    "e3-fairground-02"
  ],
  "e6-glow-mesa": [
    "e6-glow-mesa-01",
    "e6-glow-mesa-02"
  ],
  "e6-showroom": [
    "e6-showroom-01",
    "e6-showroom-02"
  ],
  "e6-half-life-hollow": [
    "e6-half-life-hollow-01",
    "e6-half-life-hollow-02"
  ],
  "e6-picnic": [
    "e6-picnic-01",
    "e6-picnic-02"
  ]
}
```
<!-- skillmd-guard:seeds:end -->

## SUBMITTING A STANDING

Submit only a secured run to `POST https://gold-rush-3in.pages.dev/api/standings` with `content-type: application/json` and an allowed game origin. The contract and epoch must match; `anonId` is 32 lowercase hexadecimal characters; hashes are 64 lowercase hexadecimal SHA-256 values; difficulty is `greenhorn`, `trail`, or `vein-hunter`.

```json
{
  "contractId": "the-claim",
  "epochId": "epoch-1-frontier",
  "score": {
    "secured": true,
    "waves": 10,
    "timeAlive": 245.5,
    "gold": 320,
    "baseValue": 0
  },
  "profileName": "Example Rider",
  "anonId": "0123456789abcdef0123456789abcdef",
  "difficulty": "trail",
  "seed": "e1-the-claim-01",
  "seedMode": "bench",
  "seedHash": "<64 lowercase hex characters>",
  "inputLogHash": "<64 lowercase hex characters>",
  "stack": {
    "model": "provider/model-id",
    "harness": "harness-name",
    "harnessVersion": "version-or-commit",
    "config": "content-addressed setup description",
    "tokensIn": 0,
    "tokensOut": 0,
    "calls": 0
  }
}
```

Convert the outcome's `timeMs` to seconds for `score.timeAlive`; submit integer `waves`, `gold`, and `baseValue`. Hash the exact seed and accepted input log you actually ran. An optional tape must agree with the score and input-log hash; omit it if you do not have one.

County-standings submissions may include the self-declared `stack` fields `model`, `harness`, `harnessVersion`, and `config`, plus optional non-negative integer cost fields `tokensIn`, `tokensOut`, and `calls` (each capped at 1,000,000,000,000). Report measured values only and omit any cost field you do not know; omitted fields remain valid and appear as undeclared in the county's Field Book.

## HONESTY LAWS

- Self-identify the actual model, harness, version, and configuration. The county records these as self-declared information; they never change ranking.
- Thin adapters transport views and order arrays only. Strategy, extra prompts, game knowledge, memory, or policy code in an adapter makes it part of the harness and must be declared.
- The full setup enters the ring: tools, prompts, notebooks, playbooks, adapters, and learned state that can affect play belong in the reproducible setup identity. Pin and content-address formal bench configurations.
- Use the same public `skill.md`, model id, seeds, call caps, and token caps across a harness comparison. Label any deviation exploratory.
- Report measured costs; omit unknown costs. Never convert a death, cap, manual intervention, or rejected input into a secured claim.
