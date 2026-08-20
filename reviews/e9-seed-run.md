# e9-seed-run — A8, "plant the future"

**Slice:** door-completion-sheet §A8 (RATIFIED 2026-08-20) · **Branch:** `worktree-agent-ad297088098a5a90d` · **Base:** `d931958b3`

## Verdict

**MECHANIC SHIPPED. DOOR NOT OPENED — and the second half is the finding, not a failure of the first.**

The caravan, the three planting grounds, the permanent green and the objective latch are all built,
gated in both engines and proven. The contract still does **not** secure, so it lands in
`CONTRACT_ADMISSION_EXEMPTIONS` with a measured reason and a re-admit condition, exactly as
`e2-trestle` and `e6-showroom` do. Bench seeds are minted and kept; the door baseline is untouched.

## What it does

A seed-vault **caravan** leaves the south yard at t=0 and walks the five authored `buildZones` at
their centres — the same five points the mask table already publishes as `caravanRoute` and
`scripts/e3-mask-tables.test.mjs:352` already pins — pausing 40 s at each of the three planting
grounds. At a ground, a player (confirm key) or an agent (`CONTEXT_ACTION action=plant`) standing at
the stake while the train stands at the same ground may **plant a vault**: a permanent
`green-waypoint` no-spawn disc on this map for every future run of this profile, bought with a
quarter of the caravan's guard (60 of 240). The run can secure only if the caravan reaches the north
basin alive — the canyon-connect latch's twin, keyed on `twist.persistentPlanting`.

Nothing here was invented: the route is the authored zones, the grounds are the authored stakes, the
disc is TP-02's existing sim entry, and the only data this slice adds to the contract is
`harvestAnchors`, which the door needs.

## Evidence

Battery: `artifacts/e9-seed-run/run-evidence.mjs`, twelve runs, **every repeat byte-identical**.

| policy | seed | secured | waves | kills | caravan | planted | event-log hash |
|---|---|---|---|---|---|---|---|
| public-verb, no plant | 01 | **false** | 16 | 704 | arrived 240/240 | — | `fnv1a32:aebdeea4` |
| public-verb, no plant | 02 | **false** | 16 | 705 | arrived 240/240 | — | `fnv1a32:4d221a7b` |
| public-verb, plant | 01 | **false** | 16 | 704 | arrived **180/180** | centre | `fnv1a32:77a015de` |
| public-verb, plant | 02 | **false** | 14 | 581 | arrived **180/180** | centre | `fnv1a32:9c5b06ec` |
| idle floor (Law 2) | 01 | false | 2 | 36 | moving 240/240 | — | `fnv1a32:3b7b86be` |
| idle floor (Law 2) | 02 | false | 3 | 40 | paused 240/240 | — | `fnv1a32:9baf2bdb` |

**The escort is not what loses this map.** The train reached the basin alive on every run that got
that far, at full guard and at three-quarters of it, and the plant cost lands exactly as ratified
(240 → 180, both pool and ceiling).

**What loses it is the ground.** The claim stands at (0,12) — *on* the north edge of
`center-green-waypoint` (x −10..10, z −6..12), the only buildZone within 30 wu of it — so every gun
must be built south of the body it defends and there is no ground at all north of the hero. Waves
enter from **both** the west and east edges, and half the roster is `feral_terraformer` (hpScale 1.7,
buildingDamageScale 1.4) against turret/beacon caps of 4 and 6.

Fifteen distinct plays were measured before this was called. The spread is recorded in the prover's
own comments, because each one is a fact a later rider should not have to re-buy: front-loading
timber cost 6 waves (16→10); blast upgrades above the economy cost 5 (16→11); economy above damage
cost 4 (16→12); damage above plating cost 3 (16→13); pulling the turrets in beside the beacons cost
6 (17→11); clustering the six beacons *on* the claim gained 1.

The floors live in the battery rather than in `assets/contracts/null-floors.json`, because
`scripts/null-floor-anchors.mjs` walks `supportedContractIds()` and an exempt contract has no row
there. Law 2 is still asserted, by the battery, on every run.

## Findings

**🔺 F-A8-1 (persistence is browser-proven, headless-isolated — by design, stated not hidden).**
`HeadlessContractSim` hands the caravan a **fresh empty** `TileStateStore`, so no bench run can
inherit a plant and no planted run can leak into the next seed. That is the isolation the floors
need, and it means the *persistence* half of A8 is proven in the browser
(`e2e/e9-seed-run-caravan.spec.ts`: staged mid-run → nothing on disk → committed at run end →
born as `noSpawnZones` at the next birth → refused forever after), not headless. Deliberate.

**🔺 F-A8-2 (the 40-second window is a cadence fact, not a flourish).** The first dwell was 15 s and
a rider standing on the stake with the train beside it still measured `planted=0`: a headless rider
is handed a turn only when something changes, roughly every 30 s here, so a 15 s window fell between
two turns. A window a player can see and an agent cannot reach is not a choice. Recorded in the
constant's own comment.

**🔺 F-A8-3 (truth, non-blocking, unchanged from the E7 precedent).** The contract's
`engineDependencies` still names `persistent-planting-consumer` as `missing` — now false. It is not
edited here: `twist.persistentPlanting` remains in `DECLARED_INERT_PATHS`
(`ContractFamilies.ts:1598`), which is what *obliges* a non-empty declaration at all (`:1713`), and
`ContractFamilies.ts` is outside this slice's firewall. Same call the E7 census made for the Dead
Band (F-E7DB-1) and the E6 census made for glow-mesa.

**🔺 F-A8-4 (owner fork, open).** Re-admitting the Seed Run needs one of: (a) an authored
`twist.secureWave` below 20 for this map, (b) a buildZone north of the claim or a `heroStart` stake
moved inside the box, or (c) accept it as an elite map and leave the exemption standing. All three
are contract data or a ruling, none is engine work. Recommendation: **(c) for now** — the exemption
is honest and the mechanic is already earning its keep in the browser.

**🔺 F-A8-5 (reach, measured — the E7 sibling's finding, one map over).** The Seed Run's board row
is `unlock: "secured:e9-dome-basin"`, and `reverifyStagedContractLaunch` (`ContractUnlock.ts:77`)
clears a staged launch whose contract is locked — so a no-`?debug` launch aimed at it lands back on
The Claim today. **Unlike the Dead Band's F-E7DB-2, this is a progression step and not a dead end:**
Dome Basin is admitted, playable and secured by ordinary play. Asserted in the spec rather than
described. Four attempts to seed the *unlocked* half through storage all measured `unlocked: false`
(bare `gr.scores.v2`; the `profileDataKey` spelling; both together; seeded from inside a live run
rather than the start menu) and none is left behind as a passing-looking workaround.

## Gates (Node 26.4.0)

| gate | result |
|---|---|
| `tsc --noEmit` | clean |
| `npm run build` | rc=0 |
| same-game audit tests | **3/3**, pins moved and attributed above |
| door-ratchet · bench-seeds · skill.md fences · null-floor-anchors · mask-tables | **41/41** |
| `null-floor-anchors --check` | **53 match**, clean; the only line that moved is the git-derived `eraStamp` |
| `e9-seed-run-caravan` + `tp02-green-waypoint`, both projects | **12/12** |
| `er01-e9-census` + `ap16-4-contract-admission`, both projects | **18/18** with the two below |
| adjacent trio (`task-025`, `m1-01`, `m2-01`), both projects | **32/32** |
| battery determinism | 12 runs, every repeat byte-identical |

**Two reds, both attributed rather than absorbed.**

- `e9-canal-stages` failed twice inside a four-spec invocation and passed **3/3 solo** on the same
  tree, on both the desktop and mobile halves that had failed. Load flake, the known class.
- `e9-arsenal:77` ("Cure-Arms free people and power fevered machines down without death events")
  fails solo — and is **PRE-EXISTING, proven by control, not argued**: reverting `src/game/Game.ts`
  to the base commit `d931958b3` (this slice's only shared browser-side file; `TileStateStore`'s
  change is additive and cannot reach the arsenal) reproduced the identical failure. Not in
  `reviews/suite-red-inventory.md`, so it is recorded here as newly-observed rather than known.
  Dome Basin's own sim is untouched by an independent route as well: its null-floor rows are
  byte-identical.
- `worker-type-coverage` ("every `functions/**/*.ts` is type-checked") is **ENVIRONMENTAL, not a
  red at all**: it spawns the hardcoded path `<cwd>/node_modules/typescript/bin/tsc`, and this
  git worktree's `node_modules` carries no `typescript` (the repo root's does, which is why `npx
  tsc` and `npm run build` both resolve fine). It fails identically solo, and **this slice touches
  zero files under `functions/`** — `git diff --name-only d931958b3..HEAD -- functions` is empty.

**The first battery ran CONTENDED** (its own probe reported "2 concurrent batteries" — another
builder's run overlapped), so it was re-run solo after that battery cleared rather than trusted.

## Merge classification

Base `d931958b3`. Every file below is LANE-TOUCHED only; `git log d931958b3..HEAD` over these paths
is this branch alone.

- **New:** `src/systems/SeedCaravanSystem.ts`, `e2e/e9-seed-run-caravan.spec.ts`,
  `artifacts/e9-seed-run/*`, `reviews/e9-seed-run.md`
- **Consumer seams:** `src/game/TileStateStore.ts` (per-ground id suffix only — no new entry kind),
  `src/game/Game.ts` (construct/tick/reset/dispose/mount, the plant in `confirmAction`, the latch in
  `autoSecureWaveForRun` + the baron expression, diagnostics), `src/sim/HeadlessContractSim.ts`
  (same, plus the view row, the `plant` context action and the exemption row),
  `src/agent/StandingOrders.ts` (one union member + one validator branch),
  `src/agent/MechanicsManifest.ts` (one rule, sourced from the consumer), `src/vite-env.d.ts`
- **Data:** `assets/contracts/epoch-9-redfields/contracts.json` +
  `mask-tables/e9-seed-run.json` (`harvestAnchors` only), `assets/contracts/bench-seeds.json` (+2),
  `public/skill.md` (grammar + seeds fences), `e2e/er01-e9-census.spec.ts`
- **Untouched, and proven so:** `e9-dome-basin`, `e9-devils-alley`, `e9-old-canal` data and
  behaviour; `scripts/door-admission-baseline.json`; `assets/contracts/null-floors.json`;
  `e2e/tp02-green-waypoint.spec.ts`.
