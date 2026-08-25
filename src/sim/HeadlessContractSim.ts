import * as THREE from 'three';
import { mechanicsBuildableIds } from '../agent/MechanicsManifest';
import { install, type AgentBuildingRef, type AgentGameAdapter, type GoldRushToolSurface, type ToolReceipt } from '../agent/ToolSurface';
import {
  bindStandingOrderBlast,
  bindStandingOrderFinalVerbs,
  bindStandingUpgradePicker,
  observeStandingOrders,
  snapshotStandingOrders,
  type StandingOrder,
  type StandingOrdersView,
} from '../agent/StandingOrders';
import type { AgentView } from '../agent/View';
import type { SoundSystem } from '../audio/SoundSystem';
import { createRng } from '../core/Rng';
import { EventBus, type GameEvent } from '../core/EventBus';
import type { Intents } from '../core/InputController';
import { BlastChargePool } from '../entities/BlastCharge';
import { FerrisWheel, type FerrisWheelDiagnostics } from '../entities/FerrisWheel';
import { GoldPickupPool } from '../entities/GoldPickup';
import { EnemyPool } from '../entities/pools';
import { Hero } from '../entities/Hero';
import { ProjectilePool } from '../entities/Projectile';
import { ProspectorEmbodiment } from '../agent/Embodiment';
import { RUN_CAST_SCALE } from '../entities/runCastScale';
import { XpMotePool } from '../entities/XpMote';
import { Balance } from '../game/Balance';
import { Economy, summarizeLog, type EconomyEvent } from '../game/Economy';
import { GameState } from '../game/GameState';
import { hasBaronMedal } from '../game/Medals';
import { Progression } from '../game/Progression';
import { TileStateStore } from '../game/TileStateStore';
import { freshResearchState, hasResearchNode, loadResearchState } from '../meta/ResearchTree';
import type { RunTapeRunStart } from '../game/RunTape';
import type { EffectiveStats } from '../game/StatSheet';
import { resolveFiller, upgradeDefById, upgradeEffect } from '../game/Upgrades';
import { isBuildableId } from '../game/buildables';
import { RunManager } from '../game/RunManager';
import { listBoardContracts, listEpochs, loadContract, loadEpoch, type ContractBaronTwist, type ContractManifest, type ContractPowerGrid, type ContractRunBoot } from '../meta/ContractFamilies';
import {
  activeMegaprojectManifest,
  ensureMegaprojectProject,
  fundMegaprojectStage,
  isMegaprojectUnlocked,
  megaprojectComplete,
  megaprojectDiagnostics,
  megaprojectStageCost,
  type MegaprojectManifest,
  type MegaprojectProjectState,
} from '../meta/Megaproject';
import { stableHash, type LockstepAction } from '../mp/LockstepClient';
import { AtomicSocket } from './AtomicSocket';
import { DeepwaterSocket } from './DeepwaterSocket';
import { BuildSystem } from '../systems/BuildSystem';
import { CombatSystem, type ShooterHandle } from '../systems/CombatSystem';
import { CombatVfx } from '../systems/CombatVfx';
import { CrawlerBossSystem } from '../systems/CrawlerBossSystem';
import { CrowdFlockSystem, type CrowdFlockDiagnostics } from '../systems/CrowdFlockSystem';
import { DredgeQueenBossSystem } from '../systems/DredgeQueenBossSystem';
import { DayNightCycle, type DayNightSnapshot } from '../systems/DayNightCycle';
import { HarvestSystem, type HarvestSnapshot, type HarvestTarget } from '../systems/HarvestSystem';
import { InterferenceFrontSystem, type InterferenceFrontDiagnostics } from '../systems/InterferenceFrontSystem';
import { createHomemakerBossSystem, type HomemakerBossSystem } from '../systems/HomemakerBossSystem';
import { LightField, type LightSource } from '../systems/LightField';
import { MothSwarm } from '../systems/MothSwarm';
import { PicnicHoldSystem } from '../systems/PicnicHoldSystem';
import { PowerGraphSystem, powerWireId, type PowerGraphDefinition } from '../systems/PowerGraph';
import { PressureArsenalSystem, type PressureArsenalDiagnostics } from '../systems/PressureArsenalSystem';
import { PressureSystem } from '../systems/PressureSystem';
import { PROBE_RECOVERED_EVENT, ProbeRecovery, type ProbeRecoveryDiagnostics } from '../systems/ProbeRecovery';
import { LowOrbitSystem, type LowOrbitDiagnostics } from '../systems/LowOrbitSystem';
import { HollowCrossingSystem, type HollowCrossingDiagnostics } from '../systems/HollowCrossingSystem';
import { SeedCaravanSystem, type SeedCaravanDiagnostics } from '../systems/SeedCaravanSystem';
import {
  CANAL_ALREADY_DECIDED_REASON,
  CANAL_BACKFILL_ACTION,
  CANAL_NOT_DECLARED_REASON,
  CanalChoiceSystem,
  type CanalChoiceDiagnostics,
} from '../systems/CanalChoiceSystem';
import { ScheduledRelocationSystem, type ScheduledRelocationDiagnostics } from '../systems/ScheduledRelocationSystem';
import { SignalSuppression, type SignalSuppressionDiagnostics } from '../systems/SignalSuppression';
import { BroadcastMirror, type BroadcastMirrorDiagnostics } from '../systems/BroadcastMirror';
import { TargetingSystem, type GoldHolding } from '../systems/TargetingSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { deepwaterStormDrivesWaves } from '../world/DeepwaterClaimTile';
import { depenetrateFromBlockers } from '../world/LandmarkCollision';
import * as Terrain from '../world/Terrain';

const STEP_SECONDS = 1 / 30;
// F-E2S-1: boss fights get six full waves after the later posting boundary.
const BOSS_GRACE_WAVES = 6;
type AdmissionExemption = {
  reason: string;
  citation: `F-${string}` | `reviews/${string}.md`;
};

export const CONTRACT_ADMISSION_EXEMPTIONS = {
  // ═══ E2 IS FINISHED (owner, 2026-08-22, verbatim: "yes, I want to admit it, E2 should be
  // finished as well"). `e2-trestle` and `e2-incline` LEFT THIS TABLE on that ruling, and the epoch
  // is 4/4 through the door. Their rows are gone rather than reworded because, unlike every entry
  // below, the thing this table exists to record — a public-verb secure on both bench seeds — now
  // EXISTS for both: 12 of 12 non-idle battery rows secured, every one identical across two passes.
  //
  // THE FOUR-STEP PROGRAMME, IN ORDER, EACH STEP MEASURED BEFORE THE NEXT WAS TAKEN:
  //   1. the pressure LINE   (owner 2026-08-21, "give both the pressure line") — the arsenal fired
  //      on both maps and neither secured;
  //   2. the COAL            (owner 2026-08-21, "sounds like a good idea") — `twist.coalSeams` put
  //      each map's fuel ~29wu from its own stake, doubling pressure delivered, and neither secured;
  //   3. the RAILCAR CUT     (owner 2026-08-22, F-1608-2's priced value, `hpScale` 30 -> 12.5) — and
  //      MEASURED, this one changed nothing at all on the runs that mattered: the event-log hashes
  //      came back byte-identical (`e6fe4301`, `74a94d27`, `17116d57`, `2207a312`), because the
  //      railcar spawns at wave 12 and those claims died at wave 6 and 10. **A boss-HP dial cannot
  //      reach a claim that never meets the boss** — the single most useful thing this programme
  //      learned, and the reason step 4 exists;
  //   4. the CADENCE         (this slice) — `twist.waveCadenceMult`, laddered per map to the knife
  //      edge and shipped one clear step inside it. Derivation at the constants in `contracts.json`
  //      and the full tables in `artifacts/e2-pressure-line/cadence-ladder-*.json`.
  //
  // WHAT THE LADDERS SAY, AND WHY THE TWO MAPS GOT DIFFERENT NUMBERS (they were judged
  // independently, and the measured minimum for each is its own):
  //   trestle  1.0 ✗ · 0.9 ✗ · 0.8 ✗ · 0.75 3-of-4 · **0.7 ALL FOUR** · 0.65 ✓ · 0.6 ✓  -> ship 0.7
  //   incline  1.0 ✗ · 0.95 2-of-4 · 0.9 2-of-4 · 0.85 2-of-4 · **0.8 ALL FOUR** · 0.75 ✓ · 0.7 ✓
  //            · 0.6 ✓ · 0.5 ✓ · 0.4 ✓                                                  -> ship 0.75
  // Each shipped value is one clear rung inside its own map's first all-secure rung, with securing
  // rungs on BOTH sides of it — never more than the measured minimum, and never sitting on the edge.
  //
  // THE HISTORY THESE ROWS CARRIED, KEPT BECAUSE IT IS THE REASON THE PROGRAMME WORKED. F-E2S-3 read
  // "no weapon reaches the railcar" off an unsecured probe and inferred the board sold no such
  // weapon; it sells three, and they fire headless on the browser's own gates
  // (`PressureArsenalSystem` below). `e2-pressure-arsenal-headless` then narrowed the refusal to one
  // authored fact — neither contract declared `twist.pressureEnabled`, so no boiler was buildable
  // and the arsenal had no fuel — and put the design question on the owner's desk as F-E2PA-6.
  // Every one of those steps was necessary and none was sufficient; the door opened on the fourth.
  //
  // F-1475-1's ORIGINAL reason is dead and its replacement is narrower. "The crowd-flock escort
  // objective has no headless consumer" was true when written and is false now: `CrowdFlockSystem`
  // runs in BOTH engines and the wheel is a damageable target here as it is in the browser. What
  // holds admission is the build law, not the consumer — the door-completion sheet requires "a
  // public-verb secure proof x2 per seed", and no such proof exists yet. Same shape as
  // `e6-showroom`: the reason died, the refusal survived, so the row is REWORDED not removed.
  // `e5-stillwater` LEFT THIS TABLE 2026-08-21 — ADMITTED. It sat here from the milk/twin-sockets
  // probe ("the noise-hunt consumer remains absent") through the A2 build that made that reason
  // false, and out on the measurement that made the map winnable. What admitted it, in order:
  // the A2 noise-hunt consumer in both engines; the owner-ruled `shelf-watch` anchor, which let
  // the trail be AIMED for the first time and moved the ceiling from wave 4 to waves 9 and 11;
  // and the owner-authorised strike-cost dial ("ok, lets do it, we can balance later during
  // testing"), which secures BOTH bench seeds twice at wave 12 with a pad still standing.
  // Evidence and the whole dial: `reviews/a2-stillwater-noise-hunt.md`, `artifacts/e5-stillwater/`.
  // REWORDED 2026-08-20 after the Showroom gained an honest capture objective. The idle
  // false-green is closed: fewer than six run-local captures keeps the secure latch shut at every
  // wave. The refusal survives for the other measured reason — unchanged-difficulty public play
  // still dies before wave 20 even after exceeding the quota by two orders of magnitude.
  'e6-showroom': {
    reason: 'The six-capture objective latch is live in both engines, so idle can no longer secure at any wave. Strong public-verb CAPTURE + fortify play exceeded the quota but died at waves 18/14 on the two bench seeds (306 captures, fnv1a32:e95a0e84 / 194 captures, fnv1a32:6ee8e7e5) against secureWave 20. Difficulty stands per the owner (2026-08-20); re-admit when both seeds secure twice.',
    citation: 'reviews/e6-showroom-cap-fix.md',
  },
  // ADMISSION MOVE — `e7-relay-rush` LEFT THIS TABLE 2026-08-21, ON AN OWNER RULING, AND ITS ROW
  // IS DELETED RATHER THAN REWORDED BECAUSE ITS REASON DIED WHOLE.
  //
  // The row said, measured and correctly: "the claim at (0,12) has NO buildable ground within
  // 24wu ... so no legal placement can defend the hero", and it named its own cure —
  // "re-admit when both bench seeds secure". F-A5-1 put the fork to the owner, who ruled it
  // (2026-08-21, VERBATIM, to the five-map fork table): **"lets follow your recommendation"** —
  // i.e. the agent's own recommendation, a `heroStart` stake inside a relay site.
  //
  // So `tileParams.stakeMarkers` now carries `relay-ridge-command-stake` at (-25,41): the CENTRE
  // of `relay-site-r2`. The centre is not a taste: `Balance.beacon.range` is 8 and a 10x10 box
  // has a 7.1wu half-diagonal, so the centre is the ONLY placement from which the whole box is
  // inside beacon reach, and turret range 16 then covers the box twice over. Nothing else moved —
  // no zone was added, no cap was raised, no balance number was touched.
  //
  // Both bench seeds now SECURE at wave 20, twice each, byte-identical on the repeat
  // (fnv1a32:bc89348d / fnv1a32:b25f69b0), with the deadline MET on its own terms —
  // `litAtDeadline: 3` of a `relayTarget` of 3 — and six fronts crossing per run. Law 2 holds:
  // the idle floor still dies in the low waves having lit nothing. `reviews/e7-relay-rush.md`
  // carries the table; `artifacts/e7-relay-rush/` carries the runs.
  //
  // A10 BUILT THE MECHANIC, DISCHARGED ITS OBJECTIVE, AND THE MAP STILL WON (2026-08-21,
  // door-completion-sheet §A10). Third instance of the A5/A8 shape, and the cleanest measurement
  // of it, because this one carries a CONTROL rather than an argument.
  //
  // THE CONSUMER IS NOT THE GAP AND THE OBJECTIVE IS NOT THE GAP EITHER, and that is not a
  // sentence here, it is a number. `e9-old-canal`'s three verdicts, the permanent flow, the ground
  // veto and the objective latch are live in BOTH engines (`src/systems/CanalChoiceSystem.ts`,
  // proven in the browser by `e2e/e9-old-canal-choices.spec.ts` and headless by
  // `e2e/er01-e9-census.spec.ts`). The ratified objective is discharge-able and WAS discharged in
  // ordinary play on both bench seeds — all three segments decided by wave 8 through the public
  // verbs alone. Then the identical rider was run with `--no-decide`, never taking a verdict at
  // all, and reached THE SAME WAVE: 17 on both seeds. The walk to the far stakes costs nothing,
  // and the ground veto costs nothing, because the plan's pads never needed the closed bands.
  //
  // WHAT REFUSES IS THE SECURE, and the cause is income against a three-door map. The claim stands
  // at (0,12) with waves entering from the NORTH, WEST and EAST (`lanes.spawnEdges` — one more
  // door than the Seed Run's two), against a roster half made of `feral_terraformer` (hpScale 1.7,
  // buildingDamageScale 1.4). The measured ceiling is a full pocket: gold plateaus at 123 for
  // whole waves while turret #4 costs 125, so the top of the build list is unreachable without
  // spending 60 on a stockpile that the same wave then wants back in repairs.
  //
  // Ten distinct policies were measured (`artifacts/e9-old-canal/`, preserved with its battery):
  // guns-first 16, beacons-first 17, timber-first 11, two-stockpiles-early 10, repair gate 35/60/80
  // -> 17/17/16, blast-always 17, prospector-on-the-claim 17, and the no-decide control 17. The
  // whole spread is six waves wide and its ceiling never moves off 17.
  'e9-old-canal': {
    reason: 'Best measured public-verb play terminated unsecured at wave 17 on both bench seeds against secureWave 20 (fnv1a32:780aca7f / fnv1a32:a6119428, each repeated identical). The mechanic is not the obstacle, and that is measured rather than argued: the same rider with the objective NEVER discharged (--no-decide) reaches the same wave 17, so the three verdicts and the ground veto cost zero waves. The map is: a claim at (0,12) with waves entering from THREE edges, an hpScale-1.7 wrecker in half the roster, and an income ceiling that plateaus at 123 gold against a 125-gold fourth turret. The A10 choice consumer, permanent flow and objective latch are live in both engines; re-admit when both bench seeds secure. ACCEPTED-ELITE by owner ruling (2026-08-21, verbatim: to the five-map fork table, \'lets follow your recommendation\' — the recommendation for this map was elite-accept). The exemption is no longer a debt: the map is deliberately harder than the door\'s provers; the mechanic is live for humans and the row rests here as the honest record. Re-admission would need the ground/economy changes the table priced, none owed.',
    citation: 'reviews/e9-old-canal.md',
  },
  // A8 BUILT THE MECHANIC AND THE MAP STILL WON (2026-08-20, door-completion-sheet §A8).
  //
  // THE CONSUMER IS NOT THE GAP, AND SAYING SO IS THE WHOLE POINT OF THIS ROW. `e9-seed-run`'s
  // caravan, its three planting grounds, its permanent green and its objective latch are all live
  // in BOTH engines (`src/systems/SeedCaravanSystem.ts`, proven in the browser by
  // `e2e/e9-seed-run-caravan.spec.ts` and headless by `e2e/er01-e9-census.spec.ts`). The escort
  // itself was never in doubt: the train reached the basin ALIVE on every measured run, at full
  // guard (240) and at the three-quarters left after a vault (180).
  //
  // WHAT REFUSES IS THE SECURE, and the cause is authored geometry rather than the new mechanic.
  // The claim stands at (0,12), ON the north edge of `center-green-waypoint` (x -10..10, z -6..12)
  // — the only buildZone within 30wu of it — so every gun must be built SOUTH of the body it
  // defends and there is no ground at all north of the hero. Waves enter from BOTH the west and
  // east edges (`lanes.spawnEdges`), and half the roster is `feral_terraformer`, hpScale 1.7 with
  // buildingDamageScale 1.4, against turret and beacon caps of 4 and 6.
  //
  // Fifteen measured public-verb plays (`artifacts/e9-seed-run/`, preserved with its battery)
  // topped out at wave 16 of 20 on BOTH bench seeds, twice each, byte-identical on the repeat.
  'e9-seed-run': {
    reason: 'Best measured public-verb play terminated unsecured at wave 16 on both bench seeds against secureWave 20 (fnv1a32:aebdeea4 / fnv1a32:4d221a7b, each repeated identical). The escort is not the obstacle — the caravan reached the basin alive on every run, at full guard and after a planted vault. The map is: the only buildZone within 30wu of the claim is a 20x18 box whose north edge IS the claim, waves enter from two edges, and half the roster is an hpScale-1.7 wrecker against turret/beacon caps of 4 and 6. The A8 caravan and planting consumer are live in both engines; re-admit when both bench seeds secure. ACCEPTED-ELITE by owner ruling (2026-08-21, verbatim: to the five-map fork table, \'lets follow your recommendation\' — the recommendation for this map was elite-accept). The exemption is no longer a debt: the map is deliberately harder than the door\'s provers; the mechanic is live for humans and the row rests here as the honest record. Re-admission would need the ground/economy changes the table priced, none owed.',
    citation: 'reviews/e9-seed-run.md',
  },
} as const satisfies Record<string, AdmissionExemption>;

const SUPPORTED_CONTRACTS = new Set(listBoardContracts()
  .filter((contract) => contract.tileParams.harvestAnchors?.length !== 0)
  .filter((contract) => !(contract.id in CONTRACT_ADMISSION_EXEMPTIONS))
  .map((contract) => contract.id));

export function supportedContractIds(): string[] {
  return [...SUPPORTED_CONTRACTS].sort();
}
const HEADLESS_META_STORAGE = { getItem: () => null, setItem: () => undefined };
/** Same empty profile AtomicSocket hands its own tile state: GR-SIM persists nothing across runs. */
const NO_PROFILE_STORAGE = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
/**
 * Names the engine inside every seated determinism hash. A browser rider hashes a
 * run-suspend snapshot (Game.multiplayerStateHash); this sim hashes its own planar
 * state. Two DIFFERENT engines will disagree by construction, and when they do the
 * seat must be able to say WHICH — an unlabelled mismatch reads like corruption.
 */
export const SEAT_HASH_ENGINE = 'gr-sim.headless.v1';

export function bossKillSecuresRun(
  baron: ContractBaronTwist | undefined,
  contractId: string,
  event: Extract<GameEvent, { type: 'enemy_killed' }>,
): boolean {
  const expectedKind = baron?.bossKind ?? 'baron';
  // THE HOMEMAKER SECURES ON ITS CORE, NEVER ON ITS RAILCAR PAIR (`src/game/Game.ts:1710`:
  // `!isHomemakerComponent || event.bossComponentId === 'core'`). VAC and RACK arrive as the
  // contract's authored two-member `wave-8:component-boss` group, so the generic branch below
  // would secure the run the moment the SECOND of them died — while the CORE the boss spawns on
  // VAC's death (`HomemakerBossSystem.spawnCore`, its own single-member group) was still standing.
  // That is a false green in the browser's own terms, so the exception is transcribed, not invented.
  if (baron?.variantId === 'homemaker_9000') {
    return event.eliteKind === expectedKind && event.bossComponentId === 'core' && event.bossRemaining === 0;
  }
  const expectedGroupId = baron?.variantId === 'dredge_queen'
    ? `${contractId}:dredge-queen-hold`
    : baron?.components?.length
      ? `${contractId}:wave-${baron.wave}:${(baron.variantId ?? 'baron_railcar') === 'baron_railcar' ? 'railcar' : 'component-boss'}`
      : undefined;
  const groupDown = expectedGroupId === undefined
    ? event.bossGroupId === undefined
    : event.bossGroupId === expectedGroupId && event.bossRemaining === 0;
  return event.eliteKind === expectedKind && groupDown;
}

export type GrSimOutcome = {
  secured: boolean;
  waves: number;
  timeMs: number;
  gold: number;
  kills: number;
  calls: number;
  defaultedPicks: number;
  defaultedSecure: number;
  eventLogHash: string;
  securedWave?: number;
  overtimeWaves?: number;
  homestead?: {
    goldPanned: number;
    goldSpent: number;
    peakWorks: number;
    worksByTier: Record<string, number>;
    worksLost: number;
  };
};

export type GrSimTurn = {
  view: HeadlessAgentView;
  terminal: boolean;
};

export type HeadlessAgentView = AgentView & {
  now: AgentView['now'] & {
    overtime?: true;
    pendingOffer?: Array<{ id: string; name: string; effectText: string }>;
    expiresAtSimMs?: number;
    deepwater?: DeepwaterSocket['diagnostics'] & {
      dredgeQueenBoss?: ReturnType<DredgeQueenBossSystem['diagnostics']>;
    };
    atomic?: AtomicSocket['diagnostics'] & {
      homemakerBoss?: ReturnType<HomemakerBossSystem['diagnostics']>;
      picnicHold?: PicnicHoldSystem['diagnostics'];
    };
    /**
     * A4. Present only where the contract declares `twist.signalSuppression`, so a rider can
     * SEE that the three systems are off rather than infer it from silence. Read the honesty
     * note beside `signalSuppression` in the class below before treating this as a mirror of
     * the browser's behaviour: this engine has none of the three systems to switch off.
     */
    signalSuppression?: SignalSuppressionDiagnostics;
    /**
     * A3. Present only where the contract declares `twist.broadcastMirror`, so a rider can SEE how
     * many of its own habits are coming back, in what shape, and how much heavier each repeat has
     * made them — rather than discovering the shadow by losing a wave to it. Read the honesty note
     * beside `broadcastMirror` in the class below before treating a run of zeroes as a bug: this
     * engine has no playbook verb to record a use FROM.
     */
    broadcastMirror?: BroadcastMirrorDiagnostics;
    /**
     * A6. Present only where the contract declares BOTH a playback trigger and a crater, so a
     * rider can see the objective, aim at the zone, and read the recovered line back. Absent
     * everywhere else — silence means "no probe out there", and it must keep meaning that.
     */
    probeRecovery?: ProbeRecoveryDiagnostics;
    /**
     * E3 Canyon Works. `powered` moves every turn, while `complete` and `failed` latch mid-run
     * and gate the secure. A rider cannot escort the connection it cannot see.
     */
    canyonConnect?: { powered: number; required: number; byWave: number; complete: boolean; failed: boolean };
    /** E3 Fairground: the dynamo the run defends and the escort the run must complete. */
    fairground?: {
      wheel: FerrisWheelDiagnostics;
      flocks: CrowdFlockDiagnostics;
      objective: { allCrossed: boolean; wheelSpinning: boolean; securableAtWave: number | null };
    };
    /**
     * A7. Present only where the contract declares the zero-gravity twist, so a rider can SEE
     * that its lobs return, where the handholds are, and how many debris bands flank them —
     * rather than discovering it by losing a run. The counters below it are the run's own
     * evidence that the mechanic fired.
     */
    lowOrbit?: LowOrbitDiagnostics;
    hollowCrossing?: HollowCrossingDiagnostics;
    /**
     * A8. Present only where the contract declares `twist.persistentPlanting`. This one IS the
     * objective: `seedCaravan.arrived` is what opens the secure, and `hp`/`state`/`dwellRemaining`
     * are how a rider knows whether to escort, to plant, or to give up on the crossing.
     */
    seedCaravan?: SeedCaravanDiagnostics;
    /**
     * A10. Present only where the contract declares `twist.persistentCanalChoices`. This one IS
     * the objective: `canalChoices.allDecided` is what opens the secure, and `choices`/`flow`/
     * `segments` are how a rider knows which stake it still has to walk to, and what the ground
     * it is standing on will be once it has.
     */
    canalChoices?: CanalChoiceDiagnostics;
    /**
     * A5. Present only where the contract declares `twist.interferenceFront` WITH a corridor and
     * relay sites. This one IS the objective: `objectiveMet` is what opens the secure, and
     * `phase`/`centerX`/`secondsToNextFront`/`sites` are how a rider knows whether to build, to
     * wait out the wall, or to accept that the deadline is gone.
     */
    interferenceFront?: InterferenceFrontDiagnostics;
    /**
     * A9. Present only where the contract declares `twist.scheduledRelocation` WITH authored
     * patrol routes. This one is NOT an objective — nothing here opens or shuts the secure — it
     * is a HAZARD SCHEDULE, so what a rider needs from it is different: `nextRouteId` and
     * `progress` say where the wind is going, and `works[].anchored` says, per building, whether
     * the wind can take that one. A rider that reads the anchored column before it spends 50
     * gold never loses a turret to the alley.
     */
    devilsAlley?: ScheduledRelocationDiagnostics;
    hero: AgentView['now']['hero'] & {
      level: number;
      upgradesTaken: Record<string, number>;
      upgradeChoiceRule: 'first-offer';
    };
    threats: AgentView['now']['threats'] & {
      spawnedTotal: number;
      defeatedTotal: number;
      defeatedBasis: 'all enemies, including continuous tricklers';
    };
  };
  almanac: AgentView['almanac'] & {
    nextWave: AgentView['almanac']['nextWave'] & {
      compositionScope: 'wave-horn packs only; continuous tricklers are additional';
      continuousTrickle: {
        currentIntervalSeconds: number;
        includedInComposition: false;
        includedInDefeatedTotal: true;
      };
    };
  };
};

export type HeadlessContractBoot = ContractRunBoot & {
  contractId: string;
  seed: string;
  overtime?: boolean;
  scienceSteps?: number;
  /** Measurement only: bypasses admission without making a playability claim. */
  admissionProbe?: true;
};

export type HeadlessContractOptions = {
  storage?: Storage;
};

const NO_AUDIO = {
  playBuildingDamage: () => undefined,
  playDetonation: () => undefined,
  playHit: () => undefined,
  playKill: () => undefined,
  playShot: () => undefined,
} as unknown as SoundSystem;

const IDLE_INTENTS: Intents = {
  move: new THREE.Vector2(),
  confirm: false,
  upgrade: false,
  rotateBuild: false,
  weaponToggle: false,
  build: false,
  cancel: false,
  buildSlot: null,
  restart: false,
  pause: false,
  mute: false,
  debugSpawn: false,
  debugXp: false,
  debugPlant: false,
};

export class HeadlessContractSim {
  readonly manifest: ContractManifest;
  readonly contractId: string;
  readonly seed: string;

  private readonly events = new EventBus();
  // Overtime is capped at 50 waves, so retaining its full economy log is bounded and keeps lifetime totals exact.
  private readonly economy = new Economy(Number.POSITIVE_INFINITY);
  private readonly enemies = new EnemyPool();
  private readonly hero = new Hero(RUN_CAST_SCALE);
  private readonly prospector = new ProspectorEmbodiment(() => undefined);
  private readonly projectiles = new ProjectilePool();
  private readonly blastCharges = new BlastChargePool();
  private readonly xpMotes = new XpMotePool();
  private readonly combatVfx = new CombatVfx();
  private readonly targeting = new TargetingSystem();
  private weapon: 'rig' | 'blast' = 'rig';
  private readonly heroShooter: ShooterHandle = {
    id: 'hero',
    resumeKey: 'hero:0:rig',
    enabled: () => !this.dead && this.weapon === 'rig',
    getPos: () => this.deepwater ? this.prospector.position : this.hero.group.position,
    range: Balance.sparkRig.range,
    cooldown: 1 / Balance.sparkRig.fireRate,
    damage: Balance.sparkRig.damage,
    projSpeed: Balance.sparkRig.boltSpeed,
    volley: Balance.sparkRig.volley,
  };
  private readonly blastShooter: ShooterHandle = {
    id: 'hero_blast',
    resumeKey: 'hero:0:blast',
    kind: 'lob',
    enabled: () => !this.dead && this.weapon === 'blast',
    getPos: () => this.hero.group.position,
    range: Balance.blast.range,
    cooldown: Balance.blast.cooldown,
    damage: Balance.blast.damage,
    getDamage: () => Balance.blast.damage * this.progression.stats.blastDamageMult
      * (1 + Math.max(0, this.waves.diagnostics.wave) * Balance.blast.dmgPerWave),
    targetPoint: (_origin, target) => target.position,
    projSpeed: 0,
    volley: Balance.blast.volley,
    aoe: { radius: Balance.blast.radius, airTime: Balance.blast.airTime },
  };
  private readonly progressionState = new GameState();
  private readonly harvest: HarvestSystem;
  private readonly combat: CombatSystem;
  private readonly build: BuildSystem;
  private readonly pressure: PressureSystem;
  private readonly pressureArsenal: PressureArsenalSystem | null;
  private readonly powerGraph: PowerGraphSystem | null;
  private readonly dayNightCycle: DayNightCycle | null;
  private readonly lightField: LightField | null;
  private readonly mothSwarm: MothSwarm | null;
  private readonly crawler: CrawlerBossSystem | null;
  private readonly crowdFlocks: CrowdFlockSystem | null;
  private readonly ferrisWheel: FerrisWheel | null;
  private readonly dredgeQueen: DredgeQueenBossSystem | null;
  private readonly goldPickups: GoldPickupPool | null;
  private readonly homemaker: HomemakerBossSystem | null;
  private readonly deepwater: DeepwaterSocket | null;
  private readonly atomic: AtomicSocket | null;
  private readonly picnicHold: PicnicHoldSystem;
  /**
   * A4 — THE SIGNAL-SUPPRESSION CONSUMER, and the honest note about what it can mean HERE.
   *
   * The browser reads this same object at three gate sites (`E7SignalSystem.droneCanOperate`,
   * `E7SignalSystem.update`, and the two playbook entry points in `Game.ts`). This engine
   * reads it at none, because it HAS none: measured 2026-08-20, `HeadlessContractSim`
   * constructs exactly one `Hero` (no slot >0, so no drone body), imports no `E7SignalSystem`
   * (so no relay graph exists to link), and `src/agent/` declares no playbook verb.
   *
   * So suppression is enforced here BY CONSTRUCTION, not by a switch — and that difference is
   * stated rather than hidden. What the consumer buys headless is (a) an identical READ of the
   * contract, so both engines agree about which systems are declared off, (b) a rider-visible
   * row in THE VIEW, and (c) a place for the guard that pins the by-construction claim
   * (`e2e/e7-dead-band-suppression.spec.ts`). If a drone, playbook or relay chain is ever
   * composed into this sim, it gates on THIS object and the note above becomes a real switch.
   */
  private readonly signalSuppression: SignalSuppression;
  /**
   * A3 — THE BROADCAST MIRROR, and the same honest note its A4 neighbour above carries.
   *
   * The SPAWN half is REAL here and identical to the browser's: this engine builds the same
   * `WaveSystem` and hands it the same `fieldMirrors` reader (`:748` below), so a queued mirror
   * fields here exactly as it fields there — same squad sizes, same hp scale, same edges, through
   * the same `spawnAt` and under the same alive cap.
   *
   * The RECORD half cannot fire here, and the reason is a measurement rather than an omission:
   * `src/agent/StandingOrders.ts` declares no playbook verb (re-verified 2026-08-20, the same
   * measurement A4 recorded), so a rider driving this engine through the public grammar has no
   * way to USE a playbook — and "no playbook use -> no mirrors" is the ratified rule, not a gap.
   * A GR-SIM run therefore reads `recordedUses: 0` and fields nothing, truthfully. The day a
   * playbook verb reaches the door, it calls `noteUse` and the canyon answers with no edit here.
   */
  private readonly broadcastMirror: BroadcastMirror;
  /**
   * A6 — THE PROBE. Unlike its A4 neighbour above, this one is a REAL switch in this engine:
   * the Prospector is the body a rider can actually move (`:950`), the crater is ordinary
   * ground, and `CONTEXT_ACTION action:'recover'` reaches it through the public grammar. So
   * the headless door proves the whole objective, not a by-construction shadow of it.
   */
  private readonly probeRecovery: ProbeRecovery;
  /**
   * A7 — THE LOW-ORBIT CONSUMER, and the honest note about which of its three parts can bite
   * HERE. The browser reads this same object on the movement seam and in combat. This engine
   * shares the COMBAT half exactly — `CombatSystem` and `BlastChargePool` are the same two files
   * both engines run (`HeadlessContractSim:18` and `:53`), and `BLAST_AT` is a public standing
   * order, so a rider's missed lob returns here precisely as it returns in the browser.
   *
   * The MOVEMENT half is different, and the difference is stated rather than hidden: this sim
   * drives slot 0 on `IDLE_INTENTS` (F-E2PA-4), so the hero never thrusts and the handhold drift
   * — a THRUST-response penalty — has nothing to act on. It is inert here by construction, not
   * by omission. The debris chip is NOT inert: it is positional, so a hero posted inside a band
   * takes it, and the guard in `e2e/e8-low-orbit-momentum.spec.ts` pins both halves of this
   * paragraph so the claim cannot rot into a lie.
   */
  private readonly lowOrbit: LowOrbitSystem;
  private readonly hollowCrossing: HollowCrossingSystem;

  /**
   * A7 debris chip, headless. Positional and hero-only, matching `Game.applyLowOrbitDebris`
   * exactly: the sheet declares the hazard for the player and says nothing about enemies, so
   * nothing here touches them.
   */
  private applyLowOrbitDebris(): void {
    if (!this.lowOrbit.isDeclared) return;
    const position = this.hero.group.position;
    const chip = this.lowOrbit.debrisDamage(position.x, position.z, STEP_SECONDS);
    if (chip > 0) this.combat.damageActor(chip, -1, this.hero);
  }
  /**
   * A8 — THE SEED CARAVAN, ticked for real, unlike the E9 census sockets.
   *
   * `E9CanalSocket`/`E9ArsenalSocket` are census probes this engine never ticks; that is fine for
   * a canal, and would be fatal here, because this consumer OWNS THE OBJECTIVE. `arrived` is what
   * lets the run secure at all, both in `autoSecureWaveForRun` below and in the browser's own
   * `Game.autoSecureWaveForRun`. So it is composed like `PressureSystem` — constructed off the
   * manifest, ticked in the browser's own relative order, null everywhere the twist is absent.
   *
   * THE TILE STORE IT IS GIVEN IS THE EMPTY ONE (`NO_PROFILE_STORAGE`), on purpose and by law:
   * GR-SIM keeps no profile, so a null floor can never inherit a plant from an earlier run and a
   * planted run can never leak into the next seed. Every bench run therefore starts from bare
   * ground, which is exactly the isolation the floors need to mean anything.
   */
  private readonly seedCaravan: SeedCaravanSystem | null;
  private readonly canalChoices: CanalChoiceSystem | null;
  /**
   * A5 — THE INTERFERENCE FRONT, and it is a REAL switch in this engine rather than a
   * by-construction shadow like its A4 neighbour above.
   *
   * The wall's mute reaches the shooter seam both engines share: `BuildSystem` registers every
   * turret and beacon with `CombatSystem`, and `isShooterPowered` (the twelfth constructor
   * argument, injected below) is consulted before a shooter is allowed to fire. So a covered
   * turret stops firing HERE for exactly as long as it stops firing in the browser, and starts
   * again when the wall passes. Nothing takes damage: `muted != damaged` is ratified, and no
   * line in this seam touches hp.
   *
   * The verb half is honest about its reach, in A4's manner: this engine has no drone slot
   * (one `Hero`) and `src/agent/` carries no playbook verb, so `refuse('drones'|'playbooks')`
   * has nothing to refuse here and its counters stay zero. The browser calls those two at its
   * own gates. What is IDENTICAL across both engines is the schedule, the mute geometry, the
   * relay lighting and the objective latch — the four things a secure depends on.
   */
  private readonly interferenceFront: InterferenceFrontSystem;
  /**
   * A9 — the scheduled relocation, and it runs IDENTICALLY in both engines because it is
   * sim-affecting: a devil MOVES a building's position, which changes what a turret covers and
   * what an outlaw walks into. A consumer that only the browser ran would put the two engines on
   * different boards from wave one.
   */
  private readonly devilsAlley: ScheduledRelocationSystem;
  private readonly waves: WaveSystem;
  private readonly progression: Progression;
  private readonly runManager: RunManager;
  /**
   * TAPE v2 (`specs/agent-play/tape-contract.md` §3): the progression this run was BORN under,
   * captured at birth from the same state the sim just installed — recorded, never re-derived
   * later. Read-only evidence: nothing in the sim consumes it, so no outcome, hash or floor can
   * move because it exists. A solo door boot (no `options.storage`) is a virgin profile and this
   * reads exactly what `RunTapeRecorder`'s own default writes for one (`RunTape.ts:119`); a
   * declared-progression boot (the campaign harness, which injects `storage`) reads ITS state,
   * so the tape says which game was actually played.
   */
  readonly runStart: RunTapeRunStart;
  private readonly stockpileHoldings: GoldHolding[] = Array.from(
    { length: Balance.stockpile.maxCount },
    (_, index) => ({
      id: `stockpile:${index}`,
      kind: 'stockpile',
      position: new THREE.Vector3(),
      active: false,
      amount: 0,
    }),
  );
  private readonly replayEvents: unknown[] = [];
  private readonly surface: GoldRushToolSurface;
  private harvestSnapshot: HarvestSnapshot;
  private dayNightSnapshot: DayNightSnapshot | null = null;
  private mothLightSources: LightSource[] = [];
  private simTick = 0;
  private timeAlive = 0;
  private kills = 0;
  private calls = 0;
  private secureChoiceCalls = 0;
  private economySequence = 0;
  private secured = false;
  private securedWave: number | null = null;
  private dead = false;
  private lastTurnWave = -1;
  private lastTurnOfferKey = '';
  private lastSurpriseSeq = 0;
  private advanceCpuMs = 0;
  private buildingHits = 0;
  private baronBeaten = false;
  private baronRocketNextAt = 0;
  private baronRocketTelegraphAt = -1;
  private baronRocketVolleys = 0;
  private readonly baronRocketTarget = new THREE.Vector3();
  private canyonConnectCompletedByDeadline = false;
  private canyonConnectFailed = false;
  private upgradeOfferKey = '';
  private upgradeOfferDeadlineSimMs = 0;
  private defaultedPicks = 0;
  private defaultedSecure = 0;
  private secureChoice: 'pending' | 'bank' | 'rush' | null = null;
  private secureChoiceElapsed = 0;
  private lastTurnSecurePending = false;
  private readonly megaprojectManifest: MegaprojectManifest | null;
  private readonly megaprojectProject: MegaprojectProjectState | null;
  private readonly megaprojectUnlocked: boolean;

  constructor(readonly boot: HeadlessContractBoot, options: HeadlessContractOptions = {}) {
    this.contractId = boot.contractId;
    this.seed = boot.seed;
    this.manifest = loadContract(this.contractId);
    // Read once, at the top, because TWO consumers need it now: `Progression` (below, as before) and
    // the Steamworks arsenal, which is built with the systems. Same call, same arguments, moved —
    // when no storage is injected it stays null and every reader keeps its old answer.
    const research = options.storage ? loadResearchState(options.storage, options.storage) : null;
    const epoch = listEpochs().map(({ id }) => loadEpoch(id)).find((entry) => entry.contracts.some(({ id }) => id === this.contractId));
    this.megaprojectManifest = epoch ? activeMegaprojectManifest(epoch, '') : null;
    this.megaprojectUnlocked = isMegaprojectUnlocked(this.megaprojectManifest, boot.scienceSteps ?? 0);
    this.megaprojectProject = this.megaprojectManifest
      ? ensureMegaprojectProject({ version: 1, projects: {} }, this.megaprojectManifest)
      : null;
    const mode = this.manifest.modes?.find(({ id }) => id === boot.mode);
    if (boot.mode && !mode) throw new Error(`${this.contractId} does not declare mode ${boot.mode}.`);
    if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode && boot.admissionProbe !== true) {
      // Keep the pre-AP-16 diagnostic prefix stable; the complete membership remains derived above.
      throw new Error(`AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift, e1-twin-banks, e1-baron and the current derived door (${[...SUPPORTED_CONTRACTS].join(', ')}); received ${this.contractId}.`);
    }
    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
    const start = new THREE.Vector3(stake?.x ?? 0, 0.06, stake?.z ?? 12);
    this.hero.resetRun(start);
    this.prospector.reset(start);

    this.harvest = new HarvestSystem(
      this.economy,
      this.manifest.tileParams.harvestAnchors ?? Terrain.nodeAnchors,
      createRng(`${this.seed}:harvest`),
    );
    this.harvest.applyStats(1, 0, 0, this.manifest.twist.seamYieldMult ?? 1);
    this.harvestSnapshot = this.harvest.snapshot;

    // The Atomic socket is built before combat because the browser routes two of its
    // couplings THROUGH CombatSystem's own hooks (Game.ts:534 and Game.ts:536).
    this.atomic = AtomicSocket.create(this.manifest, this.events, this.enemies, this.economy);
    this.picnicHold = new PicnicHoldSystem(
      PicnicHoldSystem.isEnabled(this.manifest),
      this.manifest.tileParams.stakeMarkers ?? [],
      () => this.postHeroDeath(),
    );
    // Same read the browser performs at `Game.ts` (contract, never epoch), so the two engines
    // cannot disagree about which systems this contract declares off.
    this.signalSuppression = SignalSuppression.create(this.manifest);
    // A3, same rule: one read of the CONTRACT, never the epoch, so the two engines cannot
    // disagree about which contract casts a shadow.
    this.broadcastMirror = BroadcastMirror.create(this.manifest);
    // A6, same rule: one read of the contract, shared by the recover verb and the latch below.
    this.probeRecovery = ProbeRecovery.create(this.manifest);
    // Same read the browser performs at `Game.ts` — the CONTRACT, never the epoch. The policy
    // install waits for `this.combat` below.
    this.lowOrbit = LowOrbitSystem.create(this.manifest);
    this.hollowCrossing = HollowCrossingSystem.create(this.manifest);
    // A8: same read the browser performs at `Game.ts` — the contract's own twist and its own
    // authored zones/stakes. A fresh empty store per sim, so runs never inherit each other's greens.
    this.seedCaravan = SeedCaravanSystem.create(this.manifest, new TileStateStore(NO_PROFILE_STORAGE));
    // A10: same read the browser performs at `Game.ts` — the contract's own twist and its own
    // authored zones/stakes. A fresh empty store per sim, exactly as the caravan above takes one,
    // so no bench run inherits a verdict and Law 2 holds by construction: every measured run
    // starts with three undecided segments and an idle rider decides none of them. Built BEFORE
    // `BuildSystem` below, which injects its ground veto into the placement seam.
    this.canalChoices = CanalChoiceSystem.create(this.manifest, new TileStateStore(NO_PROFILE_STORAGE));
    // A5: same read the browser performs at `Game.ts` — the CONTRACT, never the epoch. Built
    // before `BuildSystem` below, which injects its mute into the shooter seam.
    this.interferenceFront = InterferenceFrontSystem.create(this.manifest);
    // A9: same read the browser performs at `Game.ts` — the CONTRACT's own twist plus its own
    // authored routes, bays and stakes. No voice headless: this engine paints nothing.
    this.devilsAlley = ScheduledRelocationSystem.create(this.manifest);
    this.combat = new CombatSystem(
      this.events,
      [this.hero],
      this.enemies,
      this.projectiles,
      this.blastCharges,
      this.xpMotes,
      this.combatVfx,
      NO_AUDIO,
      () => this.postHeroDeath(),
      undefined,
      undefined,
      undefined,
      undefined,
      (enemy, amount, died, ownerId) => {
        if (ownerId === 'hero' || ownerId === 'hero_blast') this.picnicHold.recordHeroDamage(this.timeAlive);
        this.atomic?.onEnemyDamaged(enemy, amount, died);
      },
      (enemy) => this.atomic?.isHostile(enemy) !== false,
    );
    // A7: the same policy the browser installs at `Game.ts`, from the same declaration, so a
    // missed lob returns identically in both engines. Absent (null) on every other contract.
    if (this.lowOrbit.returnsProjectiles) {
      this.combat.setOrbitalReturn({
        seconds: this.lowOrbit.returnSeconds,
        onScheduled: () => this.lowOrbit.noteReturnScheduled(),
        onDetonated: () => this.lowOrbit.noteReturnDetonated(),
      });
    }
    this.registerHeroShooter();
    const offeredBuildables = mechanicsBuildableIds(this.manifest);
    this.build = new BuildSystem(
      headlessCanvas(),
      new THREE.PerspectiveCamera(),
      this.economy,
      this.combat,
      this.targeting,
      this.prospector.position,
      () => this.waves?.diagnostics.wave ?? 0,
      undefined,
      undefined,
      (id) => offeredBuildables.has(id),
      undefined,
      // A5 — THE MUTE, AT THE ONLY SEAM THAT CAN CARRY IT IN BOTH ENGINES. `isShooterPowered` is
      // the browser's own per-shooter gate (`Game.ts:1401` answers it from the power grid); this
      // sim declares no power grid on any contract, so until now it passed the default `() => true`.
      // Now it answers the front: a turret or beacon standing under the wall is unpowered while
      // the wall is over it, and powered again the moment it passes. Every contract that declares
      // no front gets `muted() === false` and therefore the identical answer it always got.
      (_id, _index, position) => !this.interferenceFront.muted(position.x, position.z),
      // A10 — THE GROUND VETO, the browser's own seam and the same predicate. A canal band that
      // is still a ditch, or is water again, takes no foundation; a backfilled one does. Every
      // contract that declares no canal choices passes `undefined` through to the default.
      (x, z) => this.canalChoices?.worksAllowed(x, z) ?? true,
    );
    for (const fixture of this.manifest.tileParams.prePlacedBuildables ?? []) {
      this.build.placeFree(fixture.id, fixture, fixture.rotationSteps ?? 0, {
        wrecked: fixture.wrecked,
        repairCost: fixture.relightCost,
        preplaced: true,
      });
    }
    for (const holding of this.stockpileHoldings) this.targeting.registerGoldHolding(holding);
    this.pressure = new PressureSystem(
      this.economy,
      this.build.boilerHouses,
      () => this.manifest.twist.pressureEnabled === true,
      (index) => this.build.buildingTarget('boiler_house', index)?.active === true,
      (id) => research !== null && hasResearchNode(research, id),
      () => undefined,
      () => undefined,
      // ONE CONTRACT READ, BOTH ENGINES — `Game.ts` passes the identical expression.
      this.manifest.twist.coalSeams,
    );
    // THE STEAMWORKS ARSENAL, ON THE BROWSER'S OWN GATES — nothing here is a floor, a grant, or a
    // mint. `Game.ts:1372-1381` builds `PressureArsenalSystem` from exactly four predicates, and all
    // four are transcribed below rather than relaxed:
    //   epoch      `activeEpoch.id === 'epoch-2-steamworks'`  -> the construction gate, so no other
    //              epoch's contract gains an object, a tick, or a registered shooter;
    //   multiplayer `!multiplayerActive()`                    -> a seat rides `SeatedLockstepSim.ts:165`,
    //              which passes NO storage, so every weapon below reads its unlock as false anyway;
    //   armed hero  `heroWeaponsEnabledFor(primaryActor)`     -> this sim's own idiom for the same
    //              fact is `!this.dead` (`heroShooter.enabled`, `:267`);
    //   per weapon  `hasResearch(node)` + `hasBaronMedal()`   -> read from the INJECTED profile, the
    //              same storage the campaign harness already writes (`gr-sim-campaign.mjs:103`,
    //              the `new HeadlessContractSim(..., { storage })` site — was `:88` until f2120-1
    //              added the `--contract` pre-flight refusals above it; cite the CODE, not the line).
    // A run that declares nothing therefore sees precisely what a browser player who has unlocked
    // nothing sees: three shooters that never pass `enabled()`. Progression is DECLARED, never minted.
    this.pressureArsenal = epoch?.id === 'epoch-2-steamworks'
      ? new PressureArsenalSystem(
          this.combat,
          this.pressure,
          () => this.hero.group.position,
          (id) => research !== null && hasResearchNode(research, id),
          () => hasBaronMedal(options.storage ?? NO_PROFILE_STORAGE),
          () => !this.dead,
        )
      : null;
    const powerGrid = this.manifest.twist.powerGrid;
    this.powerGraph = powerGrid
      ? new PowerGraphSystem(contractPowerDefinition(this.contractId, powerGrid), powerGrid.maxSpanLength)
      : null;
    // --- E3 FAIRGROUND. The browser builds both of these inside its power-grid branch
    // (`Game.ts:4029-4034`), so they are built here in the same place and on the same gates.
    //   THE WHEEL: the REAL `FerrisWheel`, reused not reshaped — probed before this line was
    //   written and browser-free (Torus/Box/Cylinder/Circle/Octahedron geometries and
    //   MeshStandardMaterials are plain typed-array objects; no `document`, no GL context), the
    //   same finding that let the Homemaker reuse `GoldPickupPool`. It is minted ONLY where a
    //   fairground is declared, so no already-admitted contract gains an object or a tick.
    //   THE FLOCKS: gated on `twist.fairground.crowdFlocks`, the FIELD and not the block —
    //   F-1471-1's lesson, so a fairground without flocks never gets an objective it cannot meet.
    this.ferrisWheel = this.manifest.twist.fairground
      ? new FerrisWheel(this.manifest.twist.fairground.wheel)
      : null;
    this.crowdFlocks = CrowdFlockSystem.create(this.manifest);
    if (this.ferrisWheel) {
      const wheel = this.ferrisWheel;
      this.targeting.registerBuilding(wheel.target);
      // `Game.ts:4577` routes the wheel's damage through the megaproject resolver, because the
      // wheel's target declares `family: 'megaproject'`. Registered ONLY when a wheel exists, so
      // every other contract keeps BuildSystem's untouched `applied: false` fallback.
      this.build.setMegaprojectDamageResolver((target, amount) => target === wheel.target
        ? wheel.damage(amount)
        : { applied: false, family: target.family, index: target.index, hp: target.hp, maxHp: target.maxHp, wrecked: false });
    }
    this.crawler = this.manifest.twist.baron?.variantId === 'dynamo_crawler'
      ? new CrawlerBossSystem(
          () => this.enemies.all,
          () => this.powerGraph?.snapshot().nodes ?? [],
          (command) => this.powerGraph?.queueCommand(command) === true,
          (origin, target, damage, radius) => this.combat.launchLob(origin, target, 0.05, damage, radius, 'baron_rocket:-3'),
        )
      : null;
    this.dredgeQueen = this.manifest.twist.baron?.variantId === 'dredge_queen'
      ? new DredgeQueenBossSystem(
          () => this.enemies.all,
          (position, params) => this.enemies.spawn(position, params),
          (enemy) => this.enemies.recycle(enemy),
          () => this.deepwater?.tile.snapshot().wrecks ?? [],
          () => this.hero.group.position,
          (amount, sourceId) => this.combat.damageActor(amount, sourceId),
          (_position, amount) => this.economy.apply(this.economyEvent({ type: 'gold_reclaimed', amount })).ok,
          true,
          { readAtBirth: () => null, writeAtCeremony: () => undefined },
        )
      : null;
    // E6's Homemaker is the only boss built through a FACTORY (`Game.ts:920`), because its first
    // act is to hand the gold-pickup pool a demolish collector: the machine unbuilds the town, and
    // the refund those parts become has to land somewhere. `GoldPickupPool` was probed before this
    // line was written and is browser-free — `THREE.Group`/`InstancedMesh`/`DodecahedronGeometry`
    // are plain typed-array objects, no `document`, no GL context — so the REAL pool is reused
    // rather than reshaped into a stub (the task's own NO list forbids reshaping its API).
    // It is minted ONLY for this boss, so no already-admitted contract gains a tick or an object.
    const homemakerActive = this.manifest.twist.baron?.variantId === 'homemaker_9000';
    this.goldPickups = homemakerActive ? new GoldPickupPool() : null;
    this.homemaker = this.goldPickups
      ? createHomemakerBossSystem({
          enemies: this.enemies,
          buildSystem: () => this.build,
          targeting: this.targeting,
          combat: this.combat,
          goldPickups: this.goldPickups,
          // The browser's `announce` is a `uiBridge` banner (`Game.ts:926`): presentation only,
          // like the capture float-text AtomicSocket already declines to model.
          announce: () => undefined,
          syncStockpileHoldings: () => this.syncStockpileHoldings(),
          // GR-SIM keeps no profile on disk (AtomicSocket says the same about the appliance pen):
          // the kept chair reads empty at birth and writes nowhere, so the Homemaker is always the
          // unmet machine here, never the one the town already took in.
          tileStateStore: new TileStateStore(NO_PROFILE_STORAGE),
          contractId: this.contractId,
          enabled: homemakerActive,
          now: () => this.timeAlive,
          suppressBossSpawn: () => this.waves.suppressBaronForRun(),
        })
      : null;
    this.dayNightCycle = this.manifest.twist.dayNightCycle
      ? new DayNightCycle(this.manifest.twist.dayNightCycle)
      : null;
    this.dayNightSnapshot = this.dayNightCycle?.sample(0) ?? null;
    const mothSeason = this.manifest.twist.mothSeason;
    this.lightField = mothSeason || this.isNightShiftContract()
      ? new LightField({
          minLight: Balance.contracts.nightShift.minLight,
          falloff: Balance.contracts.nightShift.lightFalloff,
          litThreshold: Balance.contracts.nightShift.renderVisibilityCutoff,
        })
      : null;
    this.mothSwarm = mothSeason && this.lightField
      ? new MothSwarm(
          true,
          this.enemies.capacity,
          (x, z) => this.lightField!.coverageAt(x, z),
          {
            radiusWeight: mothSeason.radiusWeight,
            attachDamagePerSecond: mothSeason.attachDamagePerSecond,
            mothsBaselinePerWave: mothSeason.mothsBaselinePerWave ?? 0,
            mothsPerLightPerWave: mothSeason.mothsPerLightPerWave,
          },
          (sourceId, amount) => {
            if (!sourceId.startsWith('decoy:')) return;
            const target = this.build.buildingTarget('decoy_shed', Number.parseInt(sourceId.slice(6), 10));
            if (target?.active) this.combat.damageBuilding(target, amount, -1);
          },
        )
      : null;
    this.syncLightState();
    this.deepwater = DeepwaterSocket.create(
      this.manifest,
      this.enemies,
      this.combat,
      () => this.manifest.tileParams.raceCourse || this.manifest.tileParams.flotilla ? this.prospector.position : this.hero.group.position,
      (wave, at) => this.events.emit({ type: 'wave_started', at, wave }),
      this.dredgeQueen
        ? (wave) => this.dredgeQueen!.onStormWave(wave, this.manifest.twist.baron!.wave)
          ? this.dredgeQueen!.escortMultiplier
          : false
        : null,
      // A2: the pan MACHINE, not the hand. `panAt` (the public HARVEST verb) restores the
      // channel state it borrowed, so a hand-pan never leaves this true — which is exactly the
      // sheet's "hand-pan = harvest without pump noise" seam.
      { panChanneling: () => this.harvestSnapshot.channeling },
    );

    this.waves = new WaveSystem(
      this.enemies,
      this.hero.group.position,
      createRng(`${this.seed}:waves`),
      (text, at, wave) => this.replayEvents.push({ type: 'announcement', at, wave: wave ?? null, text }),
      (wave, at) => this.startWave(wave, at),
      // Game.ts:1387 — the Deepwater Claim runs no generic schedule; its storm track is the
      // clock. A2: only where that track actually CREWS a wave. `e5-stillwater` authors a
      // suppressed storm and `corsairWaveSize: 0`, so its clock is the ordinary schedule and
      // its pressure is the roster's own `machine_leviathan` on the two authored spawn edges.
      () => this.deepwater !== null && deepwaterStormDrivesWaves(this.manifest),
      () => this.manifest,
      boot,
      () => this.build.diagnostics.stockpilesState.some((entry) => entry.active),
      () => this.build.hasAnyBuildable,
      () => this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isThief).length,
      () => false,
      this.hero.group.position,
      (position, at, escorts) => this.postBaronSpawn(position, at, escorts),
      // `undefined` keeps the constructor's own defaults for the three escort seams GR-SIM does
      // not drive; restating them here would be a second copy of a default, free to drift.
      undefined,
      undefined,
      undefined,
      // Owner ruling 2026-08-20: exhausted machines stop holding spawn slots. The browser seats
      // the SAME reader off `Game.wrangle`, so the refusal is one rule in two engines.
      () => this.atomic?.exhaustedCount() ?? 0,
      // A3: the browser seats this same reader off its own `BroadcastMirror` (`Game.ts`), so a
      // queued mirror fields identically in both engines. Empty here in practice — see the note
      // beside the field: this engine has no playbook verb to record a use from.
      (wave) => this.broadcastMirror.fieldMirrors(wave),
    );
    this.progressionState.transition('playing');
    this.progression = new Progression({
      state: this.progressionState,
      rng: createRng(`${this.seed}:upgrades`),
      getBeaconCount: () => this.build.beaconCount,
      getWave: () => this.waves.diagnostics.wave,
      getMaxHp: () => this.hero.maxHp,
      onStatsChanged: (stats, pickedId) => this.applyProgressionStats(stats, pickedId),
      onGoldGranted: (amount) => this.economy.apply(this.economyEvent({
        type: 'gold_granted',
        source: 'upgrade_assay',
        amount,
      })),
      onHeal: (amount) => this.hero.heal(amount),
      ...(research ? { hasResearchNode: (id: string) => hasResearchNode(research, id) } : {}),
    });
    this.applyProgressionStats(this.progression.stats, null);

    const adapter: AgentGameAdapter = {
      diagnostics: () => this.diagnostics(),
      economyLog: () => this.economy.log,
      standingOrders: () => snapshotStandingOrders(),
      placeBuilding: (def, pos, rot = 0) => this.build.confirmPlacement(this.timeAlive, {
        id: def,
        position: pos,
        rotationSteps: normalizeRotation(rot),
      }),
      panAt: (node) => this.panAt(node),
      repair: (building) => this.repairBuilding(building),
    };
    this.surface = install(adapter, { permissionLevel: 3 });
    bindStandingOrderBlast((pos) => this.blastAt(pos));
    bindStandingOrderFinalVerbs({
      setWeapon: (weapon) => this.setWeapon(weapon),
      secureChoice: (choice) => this.answerSecureChoice(choice),
      contextAction: (order) => this.contextAction(order),
      capture: () => this.atomic?.capture(this.prospector.position)
        ? { ok: true }
        : { ok: false, reason: 'CAPTURE requires an exhausted machine within capture range.' },
      boatBuild: (padId, buildingId) => this.deepwater?.placeBoatBuilding(padId, buildingId)
        ? { ok: true }
        : { ok: false, reason: 'BOAT_BUILD requires a known unoccupied pad and a building id.' },
      reanchor: (anchorId) => this.deepwater?.reanchor(anchorId, this.timeAlive)
        ? { ok: true }
        : { ok: false, reason: 'REANCHOR requires a known anchor other than the current anchor.' },
    });
    bindStandingUpgradePicker((id) => {
      const applied = this.progression.applyUpgrade(id);
      if (applied) {
        this.upgradeOfferKey = '';
        this.syncUpgradeOfferClock();
      }
      return applied;
    });
    this.bindEventLog();
    this.economy.apply(this.economyEvent({ type: 'run_reset' }));
    const sim = this;
    this.runManager = new RunManager(
      {
        events: this.events,
        economy: this.economy,
        waveSystem: this.waves,
        activeContract: this.manifest,
        secureWaveForRun: () => this.manifest.twist.secureWave ?? Balance.run.secureWave,
        // Transcribed from `Game.autoSecureWaveForRun` (`src/game/Game.ts:5115`), clause for
        // clause. The two fairground clauses are the LOSS rule and the OBJECTIVE rule and they
        // are deliberately separate: a stopped wheel is unrecoverable (the dynamo never restarts
        // mid-run), while an incomplete escort is only unfinished — the flocks keep trying every
        // night, and a run that completes its third crossing at wave 13 still secures at 12.
        autoSecureWaveForRun: () => (this.manifest.twist.baron && !this.baronBeaten)
          || (this.manifest.twist.powerGrid?.connect && !this.canyonConnectCompletedByDeadline)
          || (this.manifest.tileParams.raceCourse && this.deepwater?.diagnostics.race?.finished !== true)
          // A6: the Far Side is not won by outliving it. Surviving to the secure wave with the
          // probe still buried leaves the run unsecurable, exactly as the canyon-connect
          // objective does above. `objectiveAllowsSecure` is true on every contract that
          // declares no probe, so no admitted contract's terminal moves.
          || !this.probeRecovery.objectiveAllowsSecure
          || !this.hollowCrossing.objectiveAllowsSecure
          || (this.manifest.twist.fairground && this.ferrisWheel?.diagnostics.spinning === false)
          || (this.crowdFlocks !== null && !this.crowdFlocks.allCrossed)
          // A8: the caravan-connect latch, keyed on `twist.persistentPlanting` exactly as the
          // canyon latch keys on `powerGrid.connect`. A Seed Run that never lands its train
          // cannot secure at any wave; a train that arrives opens the ordinary secure wave.
          || (this.seedCaravan && !this.seedCaravan.objectiveComplete)
          // A10: the canal-choice latch, keyed on `twist.persistentCanalChoices` exactly as the
          // canyon latch keys on `powerGrid.connect`. An Old Canal run that leaves a segment
          // undecided cannot secure at any wave; deciding all three opens the ordinary secure
          // wave. True on every contract that declares no canal, so no admitted terminal moves.
          || (this.canalChoices !== null && !this.canalChoices.objectiveAllowsSecure)
          // A5: the relay-rush deadline, keyed on the SUB-FIELDS exactly as the canyon latch keys
          // on `powerGrid.connect` (F-1471-1). `InterferenceFrontSystem.create` refuses to arm
          // without both a corridor and relay sites, so `objectiveAllowsSecure` is true on every
          // contract that declares no discharge-able front and no admitted terminal moves.
          || !this.interferenceFront.objectiveAllowsSecure
          || this.atomic?.objectiveAllowsSecure === false
          ? Number.MAX_SAFE_INTEGER
          : this.manifest.twist.secureWave ?? Balance.run.secureWave,
        securePayoutMultForRun: () => this.baronBeaten
          ? { science: Math.max(1, this.manifest.twist.baron?.sciencePayoutMult ?? 1) }
          : undefined,
        get timeAlive() {
          return sim.timeAlive;
        },
      },
      { now: () => Math.round(this.timeAlive * 1000), storage: options.storage ?? HEADLESS_META_STORAGE },
    ).install();
    // Captured HERE, at run birth, from the two sources the run actually booted under: the meta
    // `RunManager` just loaded and the research state read at the top of this constructor. The
    // `??` mirrors `RunTapeRecorder`'s own default for a run that declares none (`RunTape.ts:119`).
    this.runStart = structuredClone({
      meta: this.runManager.metaProgress,
      research: research ?? freshResearchState(this.runManager.metaProgress),
    });
  }

  currentTurn(): GrSimTurn {
    return this.makeTurn();
  }

  /**
   * READ-ONLY evidence channel: the arsenal's own counters, unchanged from the browser's
   * (`PressureArsenalSystem.diagnostics`). Null off `epoch-2-steamworks`, where the browser
   * builds no arsenal either. It reads state and cannot alter a run — the E2 prover uses it to
   * report which weapons actually fired, so a "secured" claim can be checked against real fires
   * rather than believed (Mistake #13).
   */
  get pressureArsenalDiagnostics(): PressureArsenalDiagnostics | null {
    return this.pressureArsenal?.diagnostics ?? null;
  }

  submitOrders(orders: unknown): ToolReceipt<'et.goldrush.orders', { orders: unknown }> {
    this.calls += 1;
    const receipt = this.surface.tools.submit_orders(orders);
    if (receipt.outcome.ok && Array.isArray(orders) && orders.length > 0
      && orders.every((order) => typeof order === 'object' && order !== null && 'verb' in order && order.verb === 'SECURE_CHOICE')) {
      this.secureChoiceCalls += 1;
    }
    this.replayEvents.push({
      type: 'orders',
      at: round(this.timeAlive),
      orders: structuredClone(orders),
      ok: receipt.outcome.ok,
      ...(receipt.outcome.ok ? {} : { reason: receipt.outcome.reason, message: receipt.outcome.message }),
    });
    return receipt;
  }

  standingOrdersSnapshot(): StandingOrdersView {
    return snapshotStandingOrders();
  }

  advanceToTurn(): GrSimTurn {
    const started = performance.now();
    const secureWave = this.manifest.twist.secureWave ?? Balance.run.secureWave;
    const finalWave = this.manifest.twist.baron
      ? Math.max(secureWave, this.manifest.twist.baron.wave) + BOSS_GRACE_WAVES
      : secureWave + 2;
    const maxTicks = Math.ceil((finalWave * Balance.waves.waveInterval) / STEP_SECONDS);
    for (let tick = 0; tick < maxTicks && !this.terminal; tick += 1) {
      this.step();
      const orders = snapshotStandingOrders();
      const surpriseSeq = latestSurpriseSeq(orders);
      const offerKey = this.currentOfferKey();
      if (
        this.terminal
        || this.currentRunWave() !== this.lastTurnWave
        || surpriseSeq > this.lastSurpriseSeq
        || (this.secureChoice === 'pending' && !this.lastTurnSecurePending)
        || (offerKey !== '' && offerKey !== this.lastTurnOfferKey)
      ) {
        this.advanceCpuMs += performance.now() - started;
        return this.makeTurn(orders);
      }
    }
    this.advanceCpuMs += performance.now() - started;
    throw new Error(`Contract did not terminate within ${maxTicks} fixed steps.`);
  }

  outcome(): GrSimOutcome {
    if (!this.terminal) throw new Error('Outcome requested before the contract terminated.');
    const waves = this.currentRunWave();
    const canyonConnect = this.canyonConnectDiagnostics();
    const crawler = this.crawler?.diagnostics();
    const base = {
      secured: this.secured,
      waves,
      timeMs: Math.round(this.timeAlive * 1000),
      gold: round(this.economy.gold),
      kills: this.kills,
      calls: this.calls,
      defaultedPicks: this.defaultedPicks,
      defaultedSecure: this.defaultedSecure,
    };
    const overtime = this.secureChoice === 'rush' && this.securedWave !== null
      ? {
          securedWave: this.securedWave,
          overtimeWaves: waves - this.securedWave,
          homestead: this.homesteadOutcome(),
        }
      : {};
    const eventLogHash = stableHash({
      contractId: this.contractId,
      seed: this.seed,
      events: canonicalReplayEvents(this.replayEvents),
      economy: this.economy.log.map(({ id: _id, ...event }) => event),
      orders: canonicalStandingOrders(snapshotStandingOrders()),
      final: {
        ...(({ defaultedSecure: _defaultedSecure, ...hashed }) => hashed)(base),
        calls: this.calls - this.secureChoiceCalls,
        hero: point(this.hero.group.position),
        hp: round(this.hero.hp),
        enemies: this.enemies.all
          .filter((enemy) => enemy.isAlive)
          .map((enemy) => ({ id: enemy.id, hp: round(enemy.currentHp), position: point(enemy.position) })),
        buildings: this.build.diagnostics.hp,
        ...(this.powerGraph ? { power: this.powerGraph.snapshot() } : {}),
        ...(this.dayNightSnapshot ? { dayNight: this.dayNightSnapshot } : {}),
        ...(canyonConnect ? { canyonConnect } : {}),
        // The escort ring is part of the terminal state, so it belongs in the hash that certifies
        // it: a secure claimed with two crossings would hash differently from one won with three.
        ...(this.ferrisWheel ? { fairground: this.ferrisWheel.diagnostics } : {}),
        ...(this.crowdFlocks ? { crowdFlocks: this.crowdFlocks.simulationSnapshot } : {}),
        ...(crawler ? { crawler: (({ crawler3dState: _, ...simulation }) => simulation)(crawler) } : {}),
        ...(this.deepwater ? { deepwater: this.deepwater.simulationSnapshot } : {}),
        ...(this.atomic ? { atomic: this.atomic.diagnostics } : {}),
        // The chair is part of the terminal state, so it belongs in the hash that certifies it:
        // a secure claimed without `poweredDown`/`chairPlaced` would hash differently from one won.
        ...(this.homemaker ? { homemaker: this.homemaker.diagnostics() } : {}),
        // A7: spread-if-declared, exactly like every optional system above it, so the key is
        // ABSENT for every contract that is not low orbit and their pinned hashes cannot move.
        // Included rather than skipped because the returns and the debris chip are real terminal
        // facts — a claim won while three lobs were still in orbit is not the same run as one
        // won with none, and the hash should be able to say so.
        ...(this.lowOrbit.isDeclared ? { lowOrbit: this.lowOrbit.diagnostics } : {}),
        // A5: spread-if-declared for the same reason — ABSENT on every contract that is not
        // relay rush, so no pinned hash moves. Included because the deadline is the terminal fact
        // that certifies the secure: a run that met it with three relays lit is not the same run
        // as one that met it with four, and one that missed it could not have secured at all.
        ...(this.interferenceFront.isDeclared ? { interferenceFront: this.interferenceFront.diagnostics } : {}),
        ...(this.hollowCrossing.isDeclared ? { hollowCrossing: this.hollowCrossing.diagnostics } : {}),
      },
    });
    return { ...base, eventLogHash, ...overtime };
  }

  // ---------------------------------------------------------------------------
  // TRANSPORT SEAM — the agent seat (src/sim/SeatedLockstepSim.ts).
  // Purely additive: `advanceToTurn()`, `outcome()` and every pinned hash above are
  // untouched, so the gr-sim determinism pins keep meaning what they meant.
  // ---------------------------------------------------------------------------

  /**
   * Advances exactly ONE fixed step — the grain a lockstep tick bundle buys.
   * `advanceToTurn()` runs a whole wave of these on its own authority; a seated sim
   * may only ever run the one tick the room has already agreed on.
   */
  advanceOneTick(): void {
    if (!this.terminal) this.step();
  }

  /** True once the run has ended — secured, or the rider went down. */
  get isTerminal(): boolean {
    return this.terminal;
  }

  /**
   * True when the rider is owed a turn: the same wave-boundary / surprise trigger
   * `advanceToTurn()` fires on, asked WITHOUT advancing the sim. A seated loop cannot
   * use `advanceToTurn()` — it would run ticks the room has not handed it.
   */
  turnDue(): boolean {
    const orders = snapshotStandingOrders();
    return this.terminal
      || this.currentRunWave() !== this.lastTurnWave
      || (this.secureChoice === 'pending' && !this.lastTurnSecurePending)
      || (this.currentOfferKey() !== '' && this.currentOfferKey() !== this.lastTurnOfferKey)
      || latestSurpriseSeq(orders) > this.lastSurpriseSeq;
  }

  /**
   * The per-tick determinism fingerprint exchanged on the lockstep wire: the same
   * planar state `outcome()` folds into its terminal hash, minus the event log (which
   * only exists once, at the end). Two seats running this engine over one shared tick
   * stream MUST agree on this value, tick for tick — that agreement is the whole
   * desync test, and `SEAT_HASH_ENGINE` makes a cross-engine disagreement legible.
   */
  tickHash(tick: number): string {
    return stableHash({
      engine: SEAT_HASH_ENGINE,
      tick,
      contractId: this.contractId,
      seed: this.seed,
      wave: this.currentRunWave(),
      timeMs: Math.round(this.timeAlive * 1000),
      gold: round(this.economy.gold),
      kills: this.kills,
      hero: point(this.hero.group.position),
      hp: round(this.hero.hp),
      enemies: this.enemies.all
        .filter((enemy) => enemy.isAlive)
        .map((enemy) => ({ id: enemy.id, hp: round(enemy.currentHp), position: point(enemy.position) })),
      buildings: this.build.diagnostics.hp,
    });
  }

  /**
   * Applies one lockstep action arriving in a shared tick bundle — the ONLY door
   * through which another rider's act may touch this sim. Mirrors
   * `Game.applyMultiplayerAction` for the subset a headless sim can honour. Returns
   * false for everything else so the seat can REPORT what it could not honour rather
   * than swallow it; a silently-dropped peer action is a desync waiting to happen.
   */
  applyWireAction(action: LockstepAction): boolean {
    if (action.type !== 'place_build') return false;
    return this.build.confirmPlacement(this.timeAlive, action);
  }

  get wavesPerSecond(): number {
    return this.advanceCpuMs > 0 ? this.currentRunWave() / (this.advanceCpuMs / 1000) : 0;
  }

  get escortDiagnostics() {
    return this.waves.escortDiagnostics;
  }

  get bankedSecureWave(): number | null {
    return this.securedWave;
  }

  private get terminal(): boolean {
    return this.dead || this.secureChoice === 'bank';
  }

  private step(): void {
    if (this.secureChoice === 'pending') {
      this.prospector.updateSimulation(0, this.timeAlive, this.hero.group.position);
      if (this.secureChoice !== 'pending') return;
      this.secureChoiceElapsed += STEP_SECONDS;
      if (this.secureChoiceElapsed + Number.EPSILON >= Balance.offers.pickSeconds) {
        this.defaultedSecure += 1;
        this.answerSecureChoice(this.boot.overtime ? 'rush' : 'bank');
      }
      return;
    }
    this.simTick += 1;
    this.timeAlive += STEP_SECONDS;
    // Era sockets keep the browser's own relative order (Game.ts:2527-2541):
    //   decay.tick -> syncDeepwaterClaim -> actors -> e6TileConsumers -> arsenal -> waves -> wrangle.
    // Every call is null-guarded, so no already-admitted contract's tick changes.
    this.atomic?.tickDecay();
    this.deepwater?.advance(this.timeAlive);
    this.applyLowOrbitDebris();
    this.hero.update(STEP_SECONDS, IDLE_INTENTS, {
      bounds: Terrain.bounds,
      sample: Terrain.sample,
      depenetrate: (point, maxDistance) => depenetrateFromBlockers(
        point,
        Terrain.landmarkBlockers(),
        Balance.hero.radius + 0.08,
        maxDistance,
      ),
    });
    this.atomic?.updateTileConsumers(STEP_SECONDS, this.timeAlive, this.harvestTargets());
    this.deepwater?.updateArsenal(this.timeAlive);
    this.combat.setTime(this.timeAlive);
    this.waves.update(this.timeAlive);
    this.atomic?.updateWrangle(STEP_SECONDS, this.timeAlive);
    this.crawler?.step(this.timeAlive);
    this.dredgeQueen?.update(this.timeAlive);
    // Game.ts:2586-2590 orders the bosses crawler -> land-yacht -> dredge-queen -> salvage-claw ->
    // homemaker, all after wrangle and all before `buildSystem.update` — which matters here,
    // because the Homemaker's act-1 beat DEMOLISHES a building through that same BuildSystem.
    this.homemaker?.update(this.timeAlive);
    this.build.update(
      STEP_SECONDS,
      this.timeAlive,
      this.enemies.all,
      () => undefined,
      () => undefined,
      this.prospector.position,
    );
    // BOTH bodies, because the browser passes `visibleActorPositions()` (`Game.ts:1012`) — every actor
    // that can walk to a coal seam. This sim has two: the hero, which never leaves its stake (it takes
    // `IDLE_INTENTS` above), and the Prospector, which is the only thing a rider can actually MOVE and
    // which `harvestTargets():1508` already treats as actor `'0'` for the gold seams. Passing the hero
    // alone left the coal economy physically unreachable headless — no order could put a body on a seam.
    this.pressure.update(
      STEP_SECONDS,
      this.timeAlive,
      [this.hero.group.position, this.prospector.position],
      this.waves.diagnostics.wave,
    );
    this.syncContractPowerGrid();
    // Game.ts:2632-2636 orders these five exactly so: grid sync -> wheel -> wheel power -> graph
    // step -> connect objective. The flocks ride at the wheel's own site and read the day/night
    // sample the engine already holds — last tick's, in BOTH engines, because both refresh that
    // field near the end of their tick (`Game.syncNightShiftLighting`, `step()` below).
    this.ferrisWheel?.update(STEP_SECONDS);
    this.syncFerrisWheelPower();
    this.crowdFlocks?.update(STEP_SECONDS, this.dayNightSnapshot, this.enemies.all);
    this.powerGraph?.step(this.simTick);
    this.syncCanyonConnectObjective();
    // A8: the caravan advances beside the other objective syncs and BEFORE `enemies.update`,
    // which is the browser's own order (`Game.ts` ticks it with the era systems, ahead of the
    // enemy integration step). Reading the pool here means contact damage is resolved against
    // the positions the previous tick left, identically in both engines.
    this.seedCaravan?.update(STEP_SECONDS, this.enemies.all);
    // A5: the wall advances beside the other objective syncs and on the SAME fixed step, so the
    // schedule is a function of sim time alone. It reads the board's standing works from the
    // targeting register (the same list the browser hands it) to decide which relays are lit.
    this.interferenceFront.update(STEP_SECONDS, this.targeting.allBuildings);
    // A9: the column advances on the SAME fixed step and at the SAME point in the order the
    // browser uses — after the standing-works register is current and BEFORE `enemies.update`,
    // so an outlaw walks into the board the wind has already rearranged this tick rather than
    // last tick's. The mover is the one BuildSystem seam; nothing here touches a pool.
    this.devilsAlley.update(
      STEP_SECONDS,
      this.waves.diagnostics.wave,
      this.targeting.allBuildings,
      (family, index, to, lifted) => this.build.relocateBuilding(family, index, to, lifted),
    );
    this.syncStockpileHoldings();
    this.mothSwarm?.update(STEP_SECONDS, this.mothLightSources, this.enemies.all);
    const actorTargets = [this.hero.group.position];
    const picnicStructures = this.targeting.allBuildings.filter(({ active, hp }) => active && hp > 0);
    const picnicHero = { position: this.hero.group.position };
    this.enemies.update(STEP_SECONDS, this.picnicHold.active
      ? (enemy) => {
          const stake = this.picnicHold.pressureTarget(enemy, picnicStructures, picnicHero, this.timeAlive);
          return stake ? new THREE.Vector3(stake.x, Balance.enemy.groundY, stake.z) : actorTargets;
        }
      : this.deepwater?.targetPosition(this.hero.group.position) ?? actorTargets, (enemy) => {
      if (!this.picnicHold.pressureTarget(enemy, picnicStructures, picnicHero, this.timeAlive) && !this.deepwater?.diagnostics.flotilla && this.atomic?.isHostile(enemy) !== false) this.combat.handleEnemyContact(enemy);
      return this.dead;
    }, this.build.palisadeBlockers, {
      nearestGoldHolding: (from) => this.targeting.nearestGoldHolding(from),
      claimGold: (enemy, holding) => this.claimGold(enemy, holding),
      onThiefFled: (enemy) => {
        enemy.releaseCarriedGold();
        this.enemies.recycle(enemy);
      },
    }, {
      nearestBuilding: (from) => this.waves.preferredEscortTarget(from) ?? this.targeting.nearestBuilding(from),
      hitBuilding: (enemy, target, amount) => this.combat.handleBuildingHit(enemy, target, amount),
      palisadeRoute: (from, to, clearance) => this.build.palisadeRoute(from, to, clearance),
    }, (enemy) => this.nightSpeedMultiplier(enemy) * (this.atomic?.movementMultiplier(enemy) ?? 1));
    this.picnicHold.update(
      STEP_SECONDS,
      this.timeAlive,
      this.enemies.all.filter((enemy) => enemy.isAlive),
      picnicStructures,
      picnicHero,
    );
    this.deepwater?.resolveHullContacts(this.timeAlive, () => this.combat.damageActor(Number.MAX_SAFE_INTEGER, -5));
    this.deepwater?.recycleCorsairsAtExit();
    this.harvestSnapshot = this.harvest.update(STEP_SECONDS, this.timeAlive, this.harvestTargets());
    this.updateBaronRocketVolley();
    this.combat.update(STEP_SECONDS, this.timeAlive);
    this.deepwater?.resolveTreatments();
    this.progression.consumeXpTotal(this.combat.xpCount);
    // AP-16-0 audit anchor, retired by AP-16-2: while (this.progression.offer?.[0])
    this.syncUpgradeOfferClock();
    const { moving, drifting } = this.prospector.snapshot;
    this.prospector.updateSimulation(
      STEP_SECONDS * (moving || drifting ? this.deepwater?.movementMultiplier(this.prospector.position) ?? 1 : 1),
      this.timeAlive,
      this.hero.group.position,
    );
    const hollowChip = this.hollowCrossing.update(STEP_SECONDS, this.prospector.position, 'prospector');
    if (hollowChip > 0) this.combat.damageActor(hollowChip, -1, this.hero);
    this.dayNightSnapshot = this.sampleDayNightSnapshot();
    this.syncLightState();
    observeStandingOrders();
  }

  private makeTurn(orders = snapshotStandingOrders()): GrSimTurn {
    this.lastTurnWave = this.currentRunWave();
    this.lastTurnOfferKey = this.currentOfferKey();
    this.lastSurpriseSeq = latestSurpriseSeq(orders);
    this.lastTurnSecurePending = this.secureChoice === 'pending';
    const receipt = this.surface.tools.view();
    if (!receipt.outcome.ok || !receipt.outcome.state) throw new Error('THE VIEW was unavailable.');
    const view = receipt.outcome.state as HeadlessAgentView;
    view.now.wave = this.currentRunWave();
    if (this.deepwater) view.now.deepwater = {
      ...this.deepwater.diagnostics,
      ...(this.dredgeQueen ? { dredgeQueenBoss: this.dredgeQueen.diagnostics() } : {}),
    };
    if (this.atomic) view.now.atomic = {
      ...this.atomic.diagnostics,
      ...(this.homemaker ? { homemakerBoss: this.homemaker.diagnostics() } : {}),
      ...(this.picnicHold.diagnostics.length > 0 ? { picnicHold: this.picnicHold.diagnostics } : {}),
    };
    // A4: only where DECLARED, so no other contract's view grows a field. Deliberately absent
    // from the `final` hash — the flags are a constant of the contract and the counters are
    // constant zero here, so hashing them would add bytes and no discrimination.
    if (this.signalSuppression.diagnostics.declared) view.now.signalSuppression = this.signalSuppression.diagnostics;
    // A3: only where DECLARED, same rule. Unlike the suppression row this one is real per-turn
    // state — `pending` is what is about to arrive — so a rider polls it every turn.
    if (this.broadcastMirror.isDeclared) view.now.broadcastMirror = this.broadcastMirror.diagnostics;
    // A6: only where DECLARED, same rule. This one DOES belong to the run rather than the
    // contract — `recovered` flips mid-run and gates the secure — so unlike the suppression
    // row above it is real per-turn state a rider must be able to poll.
    if (this.probeRecovery.declared) view.now.probeRecovery = this.probeRecovery.diagnostics;
    if (this.canyonConnectDiagnostics()) view.now.canyonConnect = this.canyonConnectDiagnostics()!;
    // A rider cannot escort what it cannot see. THE VIEW carries the wheel, every flock's phase
    // and crossing count, and the objective read straight off the same latch the run secures on —
    // so a "secured" claim can be checked against the escort that earned it (Mistake #13).
    if (this.ferrisWheel && this.crowdFlocks) {
      const secureWave = this.manifest.twist.secureWave ?? Balance.run.secureWave;
      const spinning = this.ferrisWheel.diagnostics.spinning;
      const allCrossed = this.crowdFlocks.allCrossed;
      view.now.fairground = {
        wheel: this.ferrisWheel.diagnostics,
        flocks: this.crowdFlocks.diagnostics,
        objective: { allCrossed, wheelSpinning: spinning, securableAtWave: spinning && allCrossed ? secureWave : null },
      };
    }
    // A7: only where DECLARED, so no other contract's view grows a field.
    if (this.lowOrbit.isDeclared) view.now.lowOrbit = this.lowOrbit.diagnostics;
    if (this.hollowCrossing.isDeclared) view.now.hollowCrossing = this.hollowCrossing.diagnostics;
    // A8: only where DECLARED. Unlike the suppression row this one MOVES every turn, and a rider
    // that cannot read it cannot escort — so it carries the live guard, the dwell clock and the
    // latch, and the grounds/route it needs to walk to a stake.
    if (this.seedCaravan) view.now.seedCaravan = this.seedCaravan.diagnostics;
    // A10: only where DECLARED. Static in the sense that nothing but a decision moves it, and
    // load-bearing for exactly that reason — a rider that cannot read which segments are still
    // undecided cannot discharge the objective, and one that cannot read `choices` cannot know
    // whether the band under its next turret is ground or water.
    if (this.canalChoices) view.now.canalChoices = this.canalChoices.diagnostics;
    // A5: only where DECLARED. Like the caravan's row this one MOVES every turn — the wall's
    // position, the countdown to the next front, and the per-site lit/muted pair a rider needs to
    // decide where to spend the next 25 gold before the deadline closes.
    if (this.interferenceFront.isDeclared) view.now.interferenceFront = this.interferenceFront.diagnostics;
    // A9: only where DECLARED. This one MOVES every turn and — unlike the caravan and the wall —
    // it gates NOTHING, so it is published for planning rather than for scoring: where the next
    // sweep goes, and which of your works the wind is allowed to take.
    if (this.devilsAlley.isDeclared) view.now.devilsAlley = this.devilsAlley.diagnostics;
    const progression = this.progression.snapshot;
    Object.assign(view.now.hero, {
      level: progression.level,
      upgradesTaken: progression.stacks,
      upgradeChoiceRule: 'first-offer' as const,
    });
    const offer = this.progression.offer;
    if (offer) {
      view.now.pendingOffer = offer.map((def) => ({
        id: def.id,
        name: def.name,
        effectText: def.filler
          ? resolveFiller(def, { wave: this.waves.diagnostics.wave, maxHp: this.hero.maxHp }).effectText
          : upgradeEffect(def),
      }));
      view.now.expiresAtSimMs = this.upgradeOfferDeadlineSimMs;
    }
    if (this.secureChoice === 'pending') {
      view.now.pendingSecure = {
        defaultChoice: this.boot.overtime ? 'rush' : 'bank',
        expiresInMs: Math.max(0, Math.round((Balance.offers.pickSeconds - this.secureChoiceElapsed) * 1000)),
      };
    }
    if (this.megaprojectUnlocked && this.megaprojectManifest && this.megaprojectProject) {
      view.now.megaproject = {
        id: this.megaprojectManifest.id,
        stage: this.megaprojectProject.stage,
        funded: this.megaprojectProject.funded,
        cost: megaprojectStageCost(this.megaprojectManifest, this.megaprojectProject),
        site: { ...this.megaprojectManifest.siteFootprint },
      };
    }
    Object.assign(view.now.threats, {
      spawnedTotal: this.waves.diagnostics.waveSpawnedTotal,
      defeatedTotal: this.kills,
      defeatedBasis: 'all enemies, including continuous tricklers' as const,
    });
    if (this.secureChoice === 'rush') view.now.overtime = true;
    Object.assign(view.almanac.nextWave, {
      compositionScope: 'wave-horn packs only; continuous tricklers are additional' as const,
      continuousTrickle: {
        currentIntervalSeconds: round(this.waves.diagnostics.trickleInterval),
        includedInComposition: false as const,
        includedInDefeatedTotal: true as const,
      },
    });
    return { view, terminal: this.terminal };
  }

  private currentOfferKey(): string {
    return this.progression.offer
      ? this.progression.offer.map(({ id }) => id).join('|')
      : '';
  }

  private syncUpgradeOfferClock(): void {
    const offer = this.progression.offer;
    if (!offer) {
      this.upgradeOfferKey = '';
      this.upgradeOfferDeadlineSimMs = 0;
      return;
    }
    const key = this.currentOfferKey();
    if (key !== this.upgradeOfferKey) {
      this.upgradeOfferKey = key;
      this.upgradeOfferDeadlineSimMs = Math.round(this.timeAlive * 1000) + Balance.offers.pickSeconds * 1000;
      return;
    }
    if (Math.round(this.timeAlive * 1000) < this.upgradeOfferDeadlineSimMs) return;
    if (this.progression.applyUpgrade(offer[0].id)) this.defaultedPicks += 1;
    this.upgradeOfferKey = '';
    this.syncUpgradeOfferClock();
  }

  private startWave(wave: number, at: number): boolean | void {
    this.events.emit({ type: 'wave_started', at, wave });
    this.spawnMothSeasonWave(wave);
    const baron = this.manifest.twist.baron;
    if (baron && (wave === baron.wave || baron.tauntWaves.includes(wave))) {
      this.replayEvents.push({
        type: 'baron_announcement',
        at,
        wave,
        kind: wave === baron.wave ? 'arrival' : 'taunt',
        text: baron.taunt,
      });
    }
    if (this.runManager.diagnostics.secured && this.secureChoice !== 'rush') return false;
  }

  private bindEventLog(): void {
    for (const type of [
      'hero_damaged',
      'hero_died',
      'enemy_killed',
      'wave_started',
      'building_damaged',
      'building_wrecked',
      'run_started',
      'run_secured',
      'run_ended',
    ] as const) {
      this.events.on(type, (event) => {
        if (event.type === 'enemy_killed') this.kills += 1;
        if (event.type === 'building_damaged') this.buildingHits += 1;
        if (event.type === 'run_secured') {
          this.secured = true;
          this.securedWave = event.secureWave;
          this.secureChoice = 'pending';
          this.secureChoiceElapsed = 0;
        }
        if (event.type === 'run_ended' && event.reason !== 'secured') this.dead = true;
        if (event.type === 'enemy_killed' && event.variantId === 'dynamo_crawler') {
          const enemy = this.enemies.all.find((entry) => entry.id === event.enemyId);
          this.crawler?.onComponentKilled(event.bossComponentId, enemy?.position ?? this.hero.group.position, event.at);
        }
        if (event.type === 'enemy_killed' && event.variantId === 'dredge_queen') {
          const enemy = this.enemies.all.find((entry) => entry.id === event.enemyId);
          this.dredgeQueen?.onComponentKilled(event.bossComponentId, enemy?.position ?? this.hero.group.position, event.at);
        }
        if (event.type === 'enemy_killed' && event.variantId === 'homemaker_9000') {
          const enemy = this.enemies.all.find((entry) => entry.id === event.enemyId);
          this.homemaker?.onComponentKilled(event.bossComponentId, enemy?.position ?? this.hero.group.position, event.at);
        }
        if (event.type === 'wave_started') {
          const baron = this.manifest.twist.baron;
          this.crawler?.onWaveStarted(event.wave, baron?.variantId === 'dynamo_crawler' ? baron.wave : Number.POSITIVE_INFINITY, event.at);
          // Two arguments, not three: the Homemaker's wave hook takes no `at` (Game.ts:1734).
          this.homemaker?.onWaveStarted(event.wave, baron?.variantId === 'homemaker_9000' ? baron.wave : Number.POSITIVE_INFINITY);
        }
        this.replayEvents.push(canonicalEvent(event));
        if (event.type === 'enemy_killed') {
          const baron = this.manifest.twist.baron;
          if (bossKillSecuresRun(baron, this.contractId, event)) this.postBaronDefeat(event.at);
        }
      });
    }
  }

  private postBaronSpawn(position: THREE.Vector3, at: number, escorts: number): void {
    const baron = this.manifest.twist.baron;
    if (!baron) return;
    this.baronRocketNextAt = at;
    this.replayEvents.push({
      type: 'baron_spawned',
      at,
      position: point(position),
      wave: baron.wave,
      hpScale: baron.hpScale,
      speedScale: baron.speedScale,
      scale: baron.scale,
      pursuitRange: baron.pursuitRange ?? null,
      escorts,
    });
  }

  private postBaronDefeat(at: number): void {
    const baron = this.manifest.twist.baron;
    if (!baron || this.baronBeaten) return;
    this.baronBeaten = true;
    // Keys on `connect`, not on any powerGrid (F-1471-1): only syncCanyonConnectObjective sets the
    // flag below, and it early-returns on `!grid?.connect` — so a powerGrid without a connect
    // objective would pin this false forever and beating the Baron would silently fail to secure.
    // Mirrors src/game/Game.ts byte-for-byte; the browser moved first.
    const objectiveAllowsSecure = (!this.manifest.twist.powerGrid?.connect || this.canyonConnectCompletedByDeadline)
      // A6, same clause as the auto-secure latch: a contract that fields both a Baron and a
      // probe cannot be secured by the kill alone. No contract declares both today; stating it
      // here keeps the two secure paths from disagreeing the way F-1471-1 did.
      && this.probeRecovery.objectiveAllowsSecure
      && this.hollowCrossing.objectiveAllowsSecure
      // A8 rides the same expression: a boss kill cannot secure a crossing the caravan never made.
      && (!this.seedCaravan || this.seedCaravan.objectiveComplete)
      // A10 rides the same expression: a boss kill cannot secure a canal left half-decided.
      && (!this.canalChoices || this.canalChoices.objectiveAllowsSecure)
      // A5 rides it too: a boss kill cannot secure a deadline the relays never met.
      && this.interferenceFront.objectiveAllowsSecure
      && this.atomic?.objectiveAllowsSecure !== false;
    const runWave = this.currentRunWave();
    const defeatRecordedBeforeSecureWave = baron.variantId === 'dredge_queen'
      && runWave < (this.manifest.twist.secureWave ?? Balance.run.secureWave);
    const secured = this.runManager.diagnostics.secured
      || (objectiveAllowsSecure && !defeatRecordedBeforeSecureWave && this.runManager.secureCurrentRun(runWave));
    if (!secured && !defeatRecordedBeforeSecureWave) {
      this.baronBeaten = false;
      return;
    }
    this.replayEvents.push({
      type: 'baron_defeated',
      at,
      wave: runWave,
      defeatBeat: baron.defeatBeat,
      sciencePayoutMult: baron.sciencePayoutMult,
      medal: {
        eligible: baron.awardMedal !== false,
        blurb: baron.medalBlurb,
        awarded: false,
        sideEffects: false,
      },
    });
  }

  private currentRunWave(): number {
    return this.deepwater && deepwaterStormDrivesWaves(this.manifest)
      ? this.deepwater.diagnostics.corsairWaves
      : this.waves.diagnostics.wave;
  }

  private updateBaronRocketVolley(): void {
    const config = this.manifest.twist.baron?.rocketVolley;
    const baron = config
      ? this.enemies.all.find((enemy) => enemy.isAlive && enemy.eliteKind === 'baron')
      : undefined;
    if (!config || !baron || this.baronBeaten) {
      this.baronRocketTelegraphAt = -1;
      return;
    }
    if (this.baronRocketMeleeSuppressed(baron)) {
      this.baronRocketTelegraphAt = -1;
      return;
    }
    if (this.baronRocketTelegraphAt >= 0) {
      if (this.timeAlive - this.baronRocketTelegraphAt < Math.max(0.1, config.telegraphSeconds)) return;
      const count = THREE.MathUtils.clamp(Math.floor(config.count), 1, 6);
      const ownerId = `baron_rocket:${baron.id}`;
      const target = new THREE.Vector3();
      for (let index = 0; index < count; index += 1) {
        const rng = createRng(`${this.seed}:baron-rocket:${this.baronRocketVolleys}:${index}`);
        const angle = (Math.PI * 2 * index) / count + rng.range(-0.24, 0.24);
        const spread = index === 0 ? 0 : Math.max(0, config.spreadRadius) * rng.range(0.55, 1);
        target.set(
          this.baronRocketTarget.x + Math.cos(angle) * spread,
          this.baronRocketTarget.y,
          this.baronRocketTarget.z + Math.sin(angle) * spread,
        );
        this.combat.launchLob(
          baron.position,
          target,
          Math.max(0.1, config.airTime),
          Math.max(0, config.damage),
          Math.max(0.2, config.radius),
          ownerId,
        );
      }
      this.replayEvents.push({
        type: 'baron_rocket_volley',
        at: round(this.timeAlive),
        volley: this.baronRocketVolleys,
        count,
        damage: config.damage,
        radius: config.radius,
        target: point(this.baronRocketTarget),
      });
      this.baronRocketVolleys += 1;
      this.baronRocketTelegraphAt = -1;
      this.baronRocketNextAt = this.timeAlive + Math.max(0.2, config.cadenceSeconds);
      return;
    }
    if (this.timeAlive < this.baronRocketNextAt) return;
    const building = this.targeting.nearestBuilding(baron.position);
    const heroRange = Math.max(16, baron.heroPursuitRange || 45);
    const heroInRange = baron.position.distanceToSquared(this.hero.group.position) <= heroRange * heroRange;
    this.baronRocketTarget.copy(heroInRange || !building ? this.hero.group.position : building.position);
    this.baronRocketTelegraphAt = this.timeAlive;
    this.replayEvents.push({
      type: 'baron_rocket_telegraph',
      at: round(this.timeAlive),
      target: heroInRange || !building ? 'hero' : 'building',
      position: point(this.baronRocketTarget),
    });
  }

  private baronRocketMeleeSuppressed(baron: (typeof this.enemies.all)[number]): boolean {
    const heroReach = baron.hitRadius + Balance.hero.radius + 0.35;
    if (baron.position.distanceToSquared(this.hero.group.position) <= heroReach * heroReach) return true;
    const building = this.targeting.nearestBuilding(baron.position);
    if (!building) return false;
    const dx = Math.max(0, Math.abs(baron.position.x - building.position.x) - building.halfX);
    const dz = Math.max(0, Math.abs(baron.position.z - building.position.z) - building.halfZ);
    const reach = Balance.wreck.reach * Math.max(1, baron.visualScale) + 0.35;
    return dx * dx + dz * dz <= reach * reach;
  }

  private postHeroDeath(): void {
    const summary = summarizeLog(this.economy.log);
    this.events.emit({
      type: 'hero_died',
      at: this.timeAlive,
      timeAlive: this.timeAlive,
      kills: this.kills,
      goldPanned: summary.panned,
      spent: summary.spent,
      beaconsBuilt: summary.beaconsBuilt,
      wavesSurvived: this.waves.diagnostics.wave,
      weaponToggles: 0,
      blastTime: 0,
    });
  }

  private registerHeroShooter(): void {
    this.combat.registerShooter(this.heroShooter);
    this.combat.registerShooter(this.blastShooter);
  }

  private diagnostics(): unknown {
    const wave = this.waves.diagnostics;
    const orders = snapshotStandingOrders();
    const canyonConnect = this.canyonConnectDiagnostics();
    return {
      contract: {
        activeId: this.manifest.id,
        name: this.manifest.name,
        tileParams: this.manifest.tileParams,
        briefing: this.manifest.briefing,
        waveCadenceMult: this.manifest.twist.waveCadenceMult ?? 1,
      },
      wave: wave.wave,
      timeAlive: this.timeAlive,
      nextWaveInSim: wave.nextWaveInSim,
      economy: this.economy.state,
      hp: this.hero.hp,
      maxHp: this.hero.maxHp,
      heroPos: point(this.hero.group.position),
      weapon: this.weapon,
      blastReadyInMs: this.blastReadyInMs(),
      build: {
        hp: this.build.diagnostics.hp,
        sluicePositions: this.build.diagnostics.sluicePositions,
      },
      enemiesAlive: this.enemies.activeCount,
      waveState: wave.waveState,
      edge: wave.edge,
      steal: { thieves: this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isThief).length },
      wreck: {
        wreckers: this.enemies.all.filter((enemy) => enemy.isAlive && enemy.isWrecker).length,
        hitsResolved: this.buildingHits,
      },
      harvest: this.harvestSnapshot,
      pressure: this.pressure.diagnostics,
      power: this.powerGraph?.snapshot() ?? null,
      dayNight: this.dayNightSnapshot,
      ...(canyonConnect ? { canyonConnect } : {}),
      ...(this.ferrisWheel ? { fairground: this.ferrisWheel.diagnostics } : {}),
      ...(this.crowdFlocks ? { crowdFlocks: this.crowdFlocks.diagnostics } : {}),
      crawler: this.crawler?.diagnostics() ?? null,
      deepwater: this.deepwater?.diagnostics ?? null,
      atomic: this.atomic?.diagnostics ?? null,
      picnicHold: this.picnicHold.active ? this.picnicHold.diagnostics : null,
      signalSuppression: this.signalSuppression.diagnostics.declared ? this.signalSuppression.diagnostics : null,
      broadcastMirror: this.broadcastMirror.isDeclared ? this.broadcastMirror.diagnostics : null,
      probeRecovery: this.probeRecovery.declared ? this.probeRecovery.diagnostics : null,
      lowOrbit: this.lowOrbit.isDeclared ? this.lowOrbit.diagnostics : null,
      hollowCrossing: this.hollowCrossing.isDeclared ? this.hollowCrossing.diagnostics : null,
      seedCaravan: this.seedCaravan?.simulationSnapshot ?? null,
      // A10: null off every other contract, exactly like its neighbours, so no admitted
      // contract's determinism hash grows a field. Two runs that decide the same segments in the
      // same order produce the same bytes here; one that decides a segment a turn later does not.
      canalChoices: this.canalChoices?.simulationSnapshot ?? null,
      // A5: null off relay rush, exactly like its neighbours, so no other contract's diagnostics
      // grow a field. The terminal half of the same object also rides the determinism hash
      // (`outcome()` below) — this row is the per-turn read.
      interferenceFront: this.interferenceFront.isDeclared ? this.interferenceFront.diagnostics : null,
      // A9: null off every other contract, same rule. The presentation-stripped half rides the
      // determinism hash so a run that moved a turret cannot hash the same as one that did not.
      devilsAlley: this.devilsAlley.isDeclared ? this.devilsAlley.simulationSnapshot : null,
      megaproject: megaprojectDiagnostics(this.megaprojectManifest, this.megaprojectProject, this.megaprojectUnlocked),
      mothSwarm: this.mothSwarm?.diagnostics() ?? null,
      lightField: this.lightField?.diagnostics() ?? null,
      kills: this.kills,
      runState: this.dead ? 'dead' : this.secured ? 'secured' : 'playing',
      run: {
        secured: this.secured,
        pendingSecure: this.secureChoice === 'pending',
        lastRunEndedReason: this.secureChoice === 'bank' ? 'secured' : null,
      },
      progression: { ...this.progression.snapshot, choiceRule: 'first-offer' },
      agent: {
        needsRider: orders.needsRider,
        orders: orders.orders,
        surprises: orders.log.flatMap((event) => event.type === 'surprise' && event.surprise ? [event.surprise] : []),
        embodiment: this.prospector.snapshot,
      },
    };
  }

  private homesteadOutcome(): NonNullable<GrSimOutcome['homestead']> {
    const summary = summarizeLog(this.economy.log);
    const works = this.build.diagnostics.hp;
    const worksByTier: Record<string, number> = {};
    for (const work of works) worksByTier[work.tier] = (worksByTier[work.tier] ?? 0) + 1;
    return {
      goldPanned: round(summary.panned),
      goldSpent: round(summary.spent),
      peakWorks: works.length,
      worksByTier,
      worksLost: this.replayEvents.filter((event) =>
        typeof event === 'object' && event !== null && 'type' in event && event.type === 'building_wrecked').length,
    };
  }

  private syncContractPowerGrid(): void {
    const sites = this.manifest.tileParams.pylonSites;
    const graph = this.powerGraph;
    if (!sites?.length || !graph) return;
    const buildings = this.build.diagnostics.hp;
    const snapshot = graph.snapshot();
    for (const site of sites) {
      const online = buildings.some((entry) => entry.id === 'sentry_beacon' && entry.hp > 0 && !entry.wrecked
        && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
      const wireId = powerWireId({ a: site.wireFrom, b: site.nodeId });
      const state = online ? 'intact' : 'cut';
      if (snapshot.wires.find((wire) => wire.id === wireId)?.state !== state) {
        graph.queueCommand({ type: 'set-wire-state', wireId, state });
      }
    }
    for (const site of this.manifest.tileParams.capacitorSites ?? []) {
      const online = buildings.some((entry) => entry.id === 'capacitor_bank' && entry.hp > 0 && !entry.wrecked
        && Math.hypot(entry.position.x - site.x, entry.position.z - site.z) <= site.radius);
      if (snapshot.nodes.find((node) => node.id === site.nodeId)?.online !== online) {
        graph.queueCommand({ type: 'set-node-online', nodeId: site.nodeId, online });
      }
    }
  }

  /** `Game.syncFerrisWheelPower` (`src/game/Game.ts:6162`): a stopped dynamo is an offline node. */
  private syncFerrisWheelPower(): void {
    const wheel = this.ferrisWheel;
    const graph = this.powerGraph;
    if (!wheel || !graph) return;
    const node = graph.snapshot().nodes.find((entry) => entry.id === wheel.config.nodeId);
    if (node && node.online !== wheel.diagnostics.spinning) {
      graph.queueCommand({ type: 'set-node-online', nodeId: node.id, online: wheel.diagnostics.spinning });
    }
  }

  /** `Game.fairgroundCoverageSources` (`src/game/Game.ts:5611`), with no debug time override. */
  private fairgroundCoverageSources(): LightSource[] {
    const fairground = this.manifest.twist.fairground;
    const graph = this.powerGraph;
    if (!fairground || !graph) return [];
    const snapshot = graph.snapshot();
    const night = Math.floor(this.timeAlive / Math.max(1, this.manifest.twist.dayNightCycle?.periodSeconds ?? 1));
    const sources: LightSource[] = [];
    const wheelSource = this.ferrisWheel?.coverageSource;
    if (wheelSource) sources.push(wheelSource);
    for (const pavilion of fairground.pavilions) {
      if (snapshot.nodes.find((node) => node.id === pavilion.nodeId)?.state !== 'powered') continue;
      sources.push({
        id: `fairground:${pavilion.id}`,
        kind: 'powered-lamp',
        x: pavilion.x,
        z: pavilion.z,
        radius: pavilion.baseRadius + pavilion.radiusPerNight * night,
      });
    }
    return sources;
  }

  private canyonConnectDiagnostics(): null | { powered: number; required: number; byWave: number; complete: boolean; failed: boolean } {
    const grid = this.manifest.twist.powerGrid;
    if (!grid?.connect || !this.powerGraph) return null;
    const galleries = new Set(grid.nodes.filter((node) => node.kind === 'consumer' && node.role === 'gallery').map((node) => node.id));
    const powered = this.powerGraph.snapshot().nodes.filter((node) => galleries.has(node.id) && node.state === 'powered').length;
    return {
      powered,
      required: grid.connect.required,
      byWave: grid.connect.byWave,
      complete: this.canyonConnectCompletedByDeadline,
      failed: this.canyonConnectFailed,
    };
  }

  private syncCanyonConnectObjective(): void {
    const connect = this.canyonConnectDiagnostics();
    if (!connect) return;
    const wave = this.waves.diagnostics.wave;
    if (!this.canyonConnectCompletedByDeadline && !this.canyonConnectFailed && wave <= connect.byWave && connect.powered >= connect.required) {
      this.canyonConnectCompletedByDeadline = true;
    }
    if (!this.canyonConnectCompletedByDeadline && wave > connect.byWave) this.canyonConnectFailed = true;
  }

  private sampleDayNightSnapshot(): DayNightSnapshot | null {
    const cycle = this.manifest.twist.dayNightCycle;
    const waveSchedule = cycle?.waveSchedule;
    if (!waveSchedule) return this.dayNightCycle?.sample(this.timeAlive) ?? null;
    const wave = this.waves.diagnostics.wave;
    const span = Math.max(1, waveSchedule.darkWave - waveSchedule.duskWave);
    const progress = Math.max(0, Math.min(1, (wave - waveSchedule.duskWave) / span));
    const phase = wave < waveSchedule.duskWave ? 'full' : wave < waveSchedule.darkWave ? 'dusk' : 'dark';
    const darkness = phase === 'full' ? 0 : progress * cycle.nightDepth;
    return { phase, darkness, phaseProgress: progress, cycleProgress: progress, cycle: 0, simTime: this.timeAlive };
  }

  private lightRampDarkness(): number {
    const ramp = this.manifest.twist.lightRamp;
    if (!ramp) return 0;
    const waveInterval = Math.max(0.1, Balance.waves.waveInterval / Math.max(0.1, this.manifest.twist.waveCadenceMult ?? 1));
    const diagnostics = this.waves?.diagnostics;
    if (!diagnostics) return 0;
    const wave = Math.max(0, diagnostics.wave + Math.min(1, Math.max(0, 1 - diagnostics.nextWaveInSim / waveInterval)));
    if (wave >= ramp.dawnWave) return 0;
    const keyframes = ramp.keyframes;
    if (!keyframes?.length) {
      if (wave < ramp.duskWave) return 0;
      if (wave >= ramp.darkWave) return Balance.contracts.nightShift.darkDarkness;
      const progress = Math.min(1, Math.max(0, (wave - ramp.duskWave) / Math.max(1, ramp.darkWave - ramp.duskWave)));
      return Balance.contracts.nightShift.duskDarkness
        + (Balance.contracts.nightShift.darkDarkness - Balance.contracts.nightShift.duskDarkness) * progress;
    }
    const clampedWave = Math.min(keyframes.at(-1)!.wave, Math.max(keyframes[0]!.wave, wave));
    const nextIndex = Math.max(1, keyframes.findIndex((keyframe) => keyframe.wave >= clampedWave));
    const previous = keyframes[nextIndex - 1]!;
    const next = keyframes[nextIndex]!;
    const progress = Math.min(1, Math.max(0, (clampedWave - previous.wave) / Math.max(0.001, next.wave - previous.wave)));
    return previous.darkness + (next.darkness - previous.darkness) * progress;
  }

  private spawnMothSeasonWave(wave: number): void {
    const config = this.manifest.twist.mothSeason;
    if (!config || !this.mothSwarm || wave <= 0 || (this.dayNightSnapshot?.darkness ?? 0) < 0.5) return;
    const count = this.mothSwarm.waveSize(this.mothLightSources.length);
    const stake = this.manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
    this.mothSwarm.spawn(this.enemies, count, stake?.x ?? 0, (stake?.z ?? 12) - 12);
  }

  private syncLightState(): void {
    if (!this.lightField) return;
    const config = this.manifest.twist.mothSeason;
    const buildings = this.build.diagnostics.hp;
    const positions = (id: 'lantern_post' | 'decoy_shed') => buildings
      .filter((entry) => entry.id === id && entry.hp > 0 && !entry.wrecked)
      .map((entry) => ({ index: entry.index, ...entry.position }));
    const lanterns: LightSource[] = positions('lantern_post')
      .filter((position) => this.powerConsumerAt(position.x, position.z, 'lamp'))
      .map((position) => ({
        id: `lantern:${position.index}`,
        kind: 'lantern',
        x: position.x,
        z: position.z,
        radius: Balance.contracts.nightShift.lanternPostLightRadius,
      }));
    const decoys: LightSource[] = positions('decoy_shed').map((position) => ({
      id: `decoy:${position.index}`,
      kind: 'powered-lamp',
      x: position.x,
      z: position.z,
      radius: Balance.decoyShed.lightRadius,
      targetWeight: config?.decoyWeight ?? 1,
    }));
    // The browser derives its moth list by KIND from the full source array (`Game.ts:5735`), and
    // the fairground's wheel/pavilion sources are `powered-lamp` — so they belong in this list to
    // keep the two engines saying the same thing. It is inert today (no fairground declares
    // `mothSeason`, so `mothSwarm` is null and nothing reads it), and correct tomorrow.
    this.mothLightSources = [
      ...lanterns,
      ...decoys,
      ...this.fairgroundCoverageSources(),
    ];
    const darkness = this.dayNightSnapshot?.darkness ?? this.lightRampDarkness();
    const enemyLanterns: LightSource[] = this.enemies.all
      .filter((enemy) => enemy.isAlive && enemy.carriesLantern)
      .map((enemy) => {
        const swing = Math.sin(this.timeAlive * 3.4 + enemy.id * 1.7) * Balance.contracts.nightShift.enemyLanternSwing;
        const offset = Balance.contracts.nightShift.enemyLanternHandOffset + swing;
        return {
          id: `enemy:${enemy.id}`,
          kind: 'enemy-lantern',
          x: enemy.position.x + Math.cos(enemy.group.rotation.y) * offset,
          z: enemy.position.z + Math.sin(enemy.group.rotation.y) * offset,
          radius: Balance.contracts.nightShift.enemyLanternRadius,
          height: Balance.contracts.nightShift.enemyLanternConeHeight,
        };
      });
    const sources: LightSource[] = [{
        id: 'hero:0',
        kind: 'hero',
        x: this.hero.group.position.x,
        z: this.hero.group.position.z,
        radius: Balance.contracts.nightShift.heroLightRadius,
      }, ...this.mothLightSources, ...enemyLanterns];
    if (config && this.mothSwarm) {
      const dimmed = new Map(this.mothSwarm.dimSources(this.mothLightSources).map((source) => [source.id, source]));
      this.lightField.update(darkness, sources.map((source) => dimmed.get(source.id) ?? source));
      return;
    }
    this.lightField.update(darkness, sources);
  }

  private isNightShiftContract(): boolean {
    return Boolean(this.manifest.twist.lightRamp || this.manifest.twist.dayNightCycle);
  }

  private nightSpeedMultiplier(enemy: { variantId?: string | null; isWrecker: boolean; position: { x: number; z: number } }): number {
    const config = this.manifest.twist.mothSeason;
    if (enemy.variantId === 'moth_swarm') return 1;
    if (!config && (!this.isNightShiftContract() || !enemy.isWrecker)) return 1;
    const multiplier = config?.nightSpeedOutsideLight
      ?? Balance.contracts.nightShift.nightSpeedOutsideLight;
    const threshold = config?.litThreshold ?? Balance.contracts.nightShift.renderVisibilityCutoff;
    return (this.lightField?.coverageAt(enemy.position.x, enemy.position.z) ?? 1) < threshold ? multiplier : 1;
  }

  private powerConsumerAt(x: number, z: number, role: 'lamp' | 'turret'): boolean {
    const grid = this.manifest.twist.powerGrid;
    const graph = this.powerGraph;
    if (!grid || !graph) return true;
    const candidates = grid.nodes.filter((node) => node.kind === 'consumer' && node.role === role);
    const target = candidates.reduce<(typeof candidates)[number] | null>((best, node) => {
      if (!best) return node;
      return Math.hypot(node.x - x, node.z - z) < Math.hypot(best.x - x, best.z - z) ? node : best;
    }, null);
    return !target || graph.snapshot().nodes.find((node) => node.id === target.id)?.state === 'powered';
  }

  private repairBuilding(ref: AgentBuildingRef): unknown {
    if (!isBuildableId(ref.id)) return false;
    const index = Number.isInteger(ref.index) ? ref.index! : 0;
    return this.build.repairBuilding(ref.id, index, this.timeAlive, this.prospector.position);
  }

  private panAt(node: string): unknown {
    const seam = this.harvestSnapshot.activeNodes.find((entry) => entry.id === node && entry.active);
    const sluiceIndex = /^sluice-(\d+)$/.exec(node)?.[1];
    const sluice = sluiceIndex ? this.build.diagnostics.sluicePositions[Number(sluiceIndex) - 1] : undefined;
    const position = seam?.position ?? sluice;
    if (!position) return false;
    if (Math.hypot(this.prospector.position.x - position.x, this.prospector.position.z - position.z) > Balance.goldSeam.channelRange) {
      return false;
    }
    if (!seam) return { node, position };

    const before = seam.remaining;
    const previous = this.harvest.captureFutureState(this.timeAlive);
    const panned = this.harvest.update(
      Balance.goldSeam.tickSeconds * Math.max(0.1, this.progression.stats.panTickMult),
      this.timeAlive,
      this.harvestTargets(),
    );
    const pannedTarget = panned.activeNodes.find((entry) => entry.id === node);
    const nodes = previous.nodes.map((entry) => entry.id === node && pannedTarget ? pannedTarget : entry);
    const activeNodes = new Set(nodes.filter((entry) => entry.active).map((entry) => entry.id));
    const channels = previous.channels?.map((channel) =>
      channel.channelNodeId === null || activeNodes.has(channel.channelNodeId)
        ? channel
        : { ...channel, channelNodeId: null, progress: 0, panCapBlocked: false, channeling: false },
    );
    const primary = channels?.find((channel) => channel.actorId === '0');
    const channelNodeId = primary?.channelNodeId
      ?? (previous.channelNodeId !== null && activeNodes.has(previous.channelNodeId) ? previous.channelNodeId : null);
    this.harvest.restoreFutureState({
      ...previous,
      nodes,
      channelNodeId,
      progress: channelNodeId === null ? 0 : (primary?.progress ?? previous.progress),
      panCapBlocked: channelNodeId === null ? false : (primary?.panCapBlocked ?? previous.panCapBlocked),
      channels,
    }, this.timeAlive);
    this.harvestSnapshot = this.harvest.update(0, this.timeAlive, this.harvestTargets());
    return (pannedTarget?.remaining ?? before) < before;
  }

  private harvestTargets(): HarvestTarget[] {
    const prospector = this.prospector.snapshot;
    return [{
      actorId: '0',
      position: this.prospector.position,
      speed: prospector.moving || prospector.drifting ? Balance.agent.moveSpeed : 0,
    }];
  }

  private applyProgressionStats(stats: EffectiveStats, pickedId: string | null): void {
    this.heroShooter.cooldown = 1 / (Balance.sparkRig.fireRate * stats.fireRateMult);
    this.heroShooter.damage = Balance.sparkRig.damage * stats.damageMult;
    this.heroShooter.range = Balance.sparkRig.range * stats.rangeMult;
    this.heroShooter.projSpeed = Balance.sparkRig.boltSpeed * stats.boltSpeedMult;
    this.heroShooter.volley = Balance.sparkRig.volley + stats.volleyBonus;
    this.blastShooter.cooldown = Math.max(0.35, Balance.blast.cooldown * stats.blastCooldownMult);
    if (this.blastShooter.aoe) this.blastShooter.aoe.radius = Balance.blast.radius * stats.blastRadiusMult;
    this.hero.applyStats(Math.max(stats.maxHpBonus, this.hero.maxHp - Balance.hero.maxHp), stats.moveSpeedMult);
    if (pickedId === 'tinkers_plating') this.hero.heal(upgradeDefById.tinkers_plating.deltas.heal ?? 0);
    this.harvest.applyStats(
      stats.panTickMult,
      stats.seamCapacityBonus,
      stats.seamRespawnReduction,
      this.manifest.twist.seamYieldMult ?? 1,
    );
    this.build.applyStats(stats.beaconFireRateMult, 1);
    if (stats.stockpileCapBonus > 0) this.economy.addCapSource('upgrade:stockpile_cap', stats.stockpileCapBonus);
    else this.economy.removeCapSource('upgrade:stockpile_cap');
  }

  private setWeapon(weapon: 'rig' | 'blast'): { ok: true } {
    if (this.weapon !== weapon) {
      this.weapon = weapon;
      this.replayEvents.push({ type: 'set_weapon', at: round(this.timeAlive), weapon });
    }
    return { ok: true };
  }

  private answerSecureChoice(choice: 'bank' | 'rush'): { ok: true } | { ok: false; reason: string } {
    if (this.secureChoice !== 'pending') return { ok: false, reason: 'INVALID_WINDOW: no secure choice is pending.' };
    this.secureChoice = choice;
    if (choice === 'rush') this.runManager.stayForRush();
    return { ok: true };
  }

  private contextAction(order: Extract<StandingOrder, { verb: 'CONTEXT_ACTION' }>): { ok: true } | { ok: false; reason: string } {
    if (order.action === 'fund') return this.fundMegaproject();
    if (order.action === 'recover') return this.recoverProbe();
    if (order.action === 'plant') return this.plantSeedVault();
    if (order.action === 'redig' || order.action === CANAL_BACKFILL_ACTION) return this.decideCanalSegment(order.action);
    const { id, index } = order.target;
    const ok = order.action === 'upgrade'
      ? this.build.upgradeBuilding(id, index, this.timeAlive, this.prospector.position)
      : this.build.demolish(id, index, this.timeAlive, this.prospector.position);
    if (!ok) return { ok: false, reason: `REJECTED: ${order.action} ${id}:${index} is not legal here.` };
    this.syncStockpileHoldings();
    this.replayEvents.push({ type: 'context_action', at: round(this.timeAlive), action: order.action, target: { id, index } });
    return { ok: true };
  }

  /**
   * A6 — THE RECOVERY AND THE PLAYBACK, headless. The Prospector is the body that crosses
   * (the hero never leaves its stake, `:919`), so the reach test reads the Prospector's
   * position exactly as `fundMegaproject` below does.
   *
   * THE PLAYBACK IS THE REPLAY-LOG EVENT. This engine has no jack-board and no float text, so
   * the banked fragment is carried in the event and mirrored on `now.probeRecovery` — a rider
   * READS the wrong-number hello, which is the same payload the browser announces. The event
   * fires exactly once because the consumer's latch is one-way.
   */
  private recoverProbe(): { ok: true } | { ok: false; reason: string } {
    const result = this.probeRecovery.recover(this.prospector.position);
    if (!result.ok) return { ok: false, reason: `REJECTED: ${result.reason}.` };
    this.replayEvents.push({
      type: PROBE_RECOVERED_EVENT,
      at: round(this.timeAlive),
      zone: result.zoneId,
      fragment: result.fragment,
    });
    return { ok: true };
  }

  /**
   * A8's context action, reached by the SAME public verb the browser player uses — the
   * Prospector must be standing at the stake, exactly as the megaproject fund below demands the
   * site. The plant is optional by construction: a rider that never issues this order still
   * secures, and one that plants three times pays three quarters of the guard for three greens
   * that outlive the run.
   */
  private plantSeedVault(): { ok: true } | { ok: false; reason: string } {
    if (!this.seedCaravan) return { ok: false, reason: 'REJECTED: this contract declares no planting grounds.' };
    const planted = this.seedCaravan.tryPlant(this.prospector.position);
    if (!planted.ok) return planted;
    this.replayEvents.push({
      type: 'context_action',
      at: round(this.timeAlive),
      action: 'plant',
      ground: planted.groundId,
      costHp: planted.costHp,
    });
    return { ok: true };
  }

  /**
   * A10's context actions, reached by the SAME public verbs the browser player uses — the
   * Prospector must be standing at the stake, exactly as the plant and the megaproject fund
   * demand their ground. Neither is optional the way a plant is: this contract cannot secure
   * until all three segments carry a verdict, so a rider that never issues these orders loses
   * the map no matter how long it survives.
   */
  private decideCanalSegment(action: 'redig' | 'backfill'): { ok: true } | { ok: false; reason: string } {
    if (!this.canalChoices) return { ok: false, reason: `REJECTED: ${CANAL_NOT_DECLARED_REASON}.` };
    const choice = action === 'redig' ? 'redig' : 'demolish';
    const decided = this.canalChoices.decide(this.prospector.position, choice);
    if (!decided.ok) {
      // ALREADY_DECIDED is the one refusal a rider will meet by simply re-issuing an order that
      // already landed, so it is named rather than lumped with the reach failure.
      const prefix = decided.reason === CANAL_ALREADY_DECIDED_REASON ? 'ALREADY_DECIDED' : 'OUT_OF_REACH';
      return { ok: false, reason: `${prefix}: ${decided.reason}.` };
    }
    this.replayEvents.push({
      type: 'context_action',
      at: round(this.timeAlive),
      action,
      segment: decided.segmentId,
      choice: decided.choice,
    });
    return { ok: true };
  }

  private fundMegaproject(): { ok: true } | { ok: false; reason: string } {
    const manifest = this.megaprojectManifest;
    const project = this.megaprojectProject;
    if (!manifest || !project || !this.megaprojectUnlocked || megaprojectComplete(manifest, project) || project.funded) {
      return { ok: false, reason: 'REJECTED: no megaproject stage can be funded.' };
    }
    const { x, z, w, d } = manifest.siteFootprint;
    const dx = Math.max(Math.abs(this.prospector.position.x - x) - w * 0.5, 0);
    const dz = Math.max(Math.abs(this.prospector.position.z - z) - d * 0.5, 0);
    if (dx * dx + dz * dz > 2.2 * 2.2) return { ok: false, reason: 'OUT_OF_REACH: the Prospector is not at the megaproject site.' };
    const cost = megaprojectStageCost(manifest, project);
    const spent = this.economy.apply(this.economyEvent({
      type: 'gold_spent',
      sink: `megaproject_${manifest.id}`,
      amount: cost,
    }));
    if (!spent.ok) return { ok: false, reason: `INSUFFICIENT_GOLD: funding requires ${cost} gold.` };
    if (!fundMegaprojectStage(manifest, project)) return { ok: false, reason: 'REJECTED: megaproject funding failed.' };
    this.replayEvents.push({ type: 'context_action', at: round(this.timeAlive), action: 'fund', cost });
    return { ok: true };
  }

  private blastAt(pos: { x: number; z: number }): { ok: true } | { ok: false; reason: string } {
    const readyInMs = this.blastReadyInMs();
    if (readyInMs > 0) return { ok: false, reason: `COOLDOWN: Blast Charge ready in ${readyInMs}ms.` };
    const origin = this.hero.group.position;
    if (Math.hypot(pos.x - origin.x, pos.z - origin.z) > Balance.blast.range) {
      return { ok: false, reason: `OUT_OF_RANGE: BLAST_AT must be within ${Balance.blast.range}m of the hero.` };
    }
    const stats = this.progression.stats;
    const waveMult = 1 + Math.max(0, this.waves.diagnostics.wave) * Balance.blast.dmgPerWave;
    const launched = this.combat.launchLob(
      origin,
      new THREE.Vector3(pos.x, Balance.enemy.groundY, pos.z),
      Balance.blast.airTime,
      Balance.blast.damage * stats.blastDamageMult * waveMult,
      Balance.blast.radius * stats.blastRadiusMult,
      'hero_blast',
    );
    if (!launched) return { ok: false, reason: 'BLAST_POOL_FULL: no blast charge slot is available.' };
    const combat = this.combat.captureSuspend();
    const shooter = combat.shooters.find(({ resumeKey }) => resumeKey === this.blastShooter.resumeKey);
    if (!shooter) throw new Error('Blast Charge shooter is not registered.');
    shooter.timer = this.blastShooter.cooldown;
    if (!this.combat.restoreSuspend(combat)) throw new Error('Blast Charge cooldown could not be restored.');
    this.replayEvents.push({ type: 'blast_at', at: round(this.timeAlive), pos: point(pos) });
    return { ok: true };
  }

  private blastReadyInMs(): number {
    const timer = this.combat.captureSuspend().shooters.find(({ resumeKey }) => resumeKey === this.blastShooter.resumeKey)?.timer ?? 0;
    return Math.max(0, Math.round(timer * 1000));
  }

  private syncStockpileHoldings(): void {
    const stockpiles = this.build.diagnostics.stockpilesState;
    for (let index = 0; index < this.stockpileHoldings.length; index += 1) {
      const holding = this.stockpileHoldings[index];
      const stockpile = stockpiles[index];
      if (!holding) continue;
      holding.active = stockpile?.active === true;
      holding.amount = holding.active ? this.economy.gold : 0;
      if (stockpile) holding.position.set(stockpile.position.x, 0, stockpile.position.z);
    }
  }

  private claimGold(_enemy: { releaseCarriedGold(): number }, holding: GoldHolding): number {
    const amount = Math.min(Balance.steal.grabAmount, this.economy.gold);
    if (holding.kind !== 'stockpile' || amount <= 0) return 0;
    const result = this.economy.apply(this.economyEvent({ type: 'gold_stolen', amount }));
    if (!result.ok) return 0;
    this.syncStockpileHoldings();
    return amount;
  }

  private economyEvent<T extends Omit<EconomyEvent, 'id' | 'at'>>(event: T): EconomyEvent {
    return {
      id: `gr-sim-${++this.economySequence}`,
      at: this.timeAlive,
      ...event,
    } as EconomyEvent;
  }
}

function contractPowerDefinition(contractId: string, grid: ContractPowerGrid): PowerGraphDefinition {
  return {
    id: `${contractId}-grid`,
    nodes: grid.nodes.map((node) => node.kind === 'producer'
      ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: true, outputWatts: node.outputWatts }
      : node.kind === 'relay'
        ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: false }
        : node.kind === 'storage'
          ? { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: false, capacityWh: node.capacityWh, chargeWatts: node.chargeWatts, dischargeWatts: node.dischargeWatts }
          : { id: node.id, labelKey: node.label, kind: node.kind, x: node.x, z: node.z, online: node.role !== 'crawler-drain', drawWatts: node.drawWatts, priority: node.priority }),
    wires: grid.wires.map((wire) => ({ ...wire, state: 'intact' })),
  };
}

function canonicalEvent(event: GameEvent): unknown {
  return structuredClone(event);
}

function canonicalReplayEvents(events: readonly unknown[]): unknown[] {
  if (!events.some((event) => isRecord(event) && event.type === 'orders' && Array.isArray(event.orders)
    && event.orders.some((order) => isRecord(order) && order.verb === 'SECURE_CHOICE'))) return [...events];
  return events.flatMap((event) => {
    if (!isRecord(event) || event.type !== 'orders' || !Array.isArray(event.orders)) return [event];
    const orders = event.orders.filter((order) => !isRecord(order) || order.verb !== 'SECURE_CHOICE');
    return orders.length > 0 ? [{ ...event, orders }] : [];
  });
}

function canonicalStandingOrders(snapshot: StandingOrdersView): StandingOrdersView {
  const secureIds = new Set<string>();
  for (const record of snapshot.orders) if (record.order.verb === 'SECURE_CHOICE') secureIds.add(record.id);
  for (const event of snapshot.log) {
    for (const record of event.orders ?? []) if (record.order.verb === 'SECURE_CHOICE') secureIds.add(record.id);
  }
  if (secureIds.size === 0) return snapshot;
  const log = snapshot.log.flatMap((event) => {
    if (event.orderId && secureIds.has(event.orderId)) return [];
    if (!event.orders) return [event];
    const orders = event.orders.filter((record) => !secureIds.has(record.id));
    return orders.length > 0 ? [{ ...event, orders }] : [];
  }).map((event, index) => ({ ...event, seq: index + 1 }));
  return { ...snapshot, orders: snapshot.orders.filter((record) => !secureIds.has(record.id)), log };
}

function latestSurpriseSeq(orders: StandingOrdersView): number {
  return orders.log.reduce((seq, event) => event.type === 'surprise' ? Math.max(seq, event.seq) : seq, 0);
}

function normalizeRotation(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const steps = Number.isInteger(value) ? value : Math.round(value / (Math.PI / 2));
  return ((steps % 4) + 4) % 4;
}

function point(value: { x: number; z: number }): { x: number; z: number } {
  return { x: round(value.x), z: round(value.z) };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function headlessCanvas(): HTMLCanvasElement {
  return {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  } as unknown as HTMLCanvasElement;
}
