import { listEpochs, loadContract, loadEpoch, type ContractEscortMode, type ContractManifest } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';
import { FLOCK_SPEED_MULT, LANE_SPACING_RADII } from '../systems/CrowdFlockSystem';
import { beaconCost, buildableBlurb, buildableCostAt, getBuildableDef, resolveBeaconLadder, type BuildableId } from '../game/buildables';
import { PicnicHoldSystem, PICNIC_ACTIVE_DEFENSE_SECONDS, PICNIC_HOLD_RADIUS, PICNIC_HOLD_SECONDS, PICNIC_STAKE_PRESS_WEIGHT } from '../systems/PicnicHoldSystem';
import { DEBRIS_DAMAGE_PER_SECOND, DEBRIS_SPEED_SCALE, DRIFT_CONTROL_SCALE, LowOrbitSystem } from '../systems/LowOrbitSystem';
import { DOME_AIR_DRAIN_SECONDS, DOME_AIR_REFILL_SECONDS, DOME_ZONE_PREFIX, E8AtmosphereSystem, SUIT_HARM_TICK_SECONDS } from '../systems/E8PhysicsSystem';
import { E8SuitAirSystem } from '../systems/E8SuitAirSystem';
import { INTERFERENCE_MUTED_REASON, InterferenceFrontSystem, POWERED_RELAY_KINDS } from '../systems/InterferenceFrontSystem';
import { E10SquallScheduler, SQUALL_PHASE_ORDER } from '../systems/E10SquallScheduler';
import { E10PreserveSystem } from '../systems/E10PreserveSystem';
import { E10ArchiveSystem } from '../systems/E10ArchiveSystem';
import {
  DEVIL_COLUMN_RADIUS,
  DEVIL_SWEEP_SECONDS,
  ScheduledRelocationSystem,
} from '../systems/ScheduledRelocationSystem';
import { SIGNAL_SUPPRESSION_REASON, SignalSuppression } from '../systems/SignalSuppression';
import {
  BROADCAST_MIRROR_HP_PER_REPEAT,
  BROADCAST_MIRROR_MAX_SQUAD,
  BROADCAST_MIRROR_MIN_SQUAD,
  BROADCAST_MIRROR_SQUAD_CAP,
  BROADCAST_MIRROR_VARIANT_ID,
  BroadcastMirror,
} from '../systems/BroadcastMirror';
import { ProbeRecovery } from '../systems/ProbeRecovery';
import { FLOTILLA_HULL_RULES } from '../systems/FlotillaHullSystem';
import { NOISE_HUNT_RULES } from '../systems/NoiseHuntSystem';
import { boatWaterFor, deepwaterStormDrivesWaves } from '../world/DeepwaterClaimTile';
import { ShowroomCaptureObjective } from '../systems/ShowroomCaptureObjective';
import { HOLLOW_EXTRACTION_RADIUS, HOLLOW_GLOW_DAMAGE_PER_SECOND } from '../systems/HollowCrossingSystem';
// From the LEAF module, never `../sim/MotorSocket`: that file's graph reaches `world/Terrain` and
// its `?raw` import, which breaks `playwright --list` for the two specs that import this one.
import { MOTOR_GRADE_REACH, MOTOR_GRADE_VERB, MOTOR_HAUL_VERB, MOTOR_STOP_REACH } from '../sim/MotorContract';

/** The public verb a rider uses to lift the probe, named once so the manifest cannot drift. */
const PROBE_RECOVER_ACTION = 'recover';

/**
 * E5 Regatta — the gate radius a mark that authors none falls back to, which on the Regatta is the
 * SIXTH and last gate: the course as raced is the five authored beacons and then the `heroStart`
 * stake, and a stake marker carries no radius. `RegattaRaceSystem.DEFAULT_GATE_RADIUS` is the
 * engine's own copy of this number; slice 3's firewall forbids editing that file, so the constant
 * lives here — beside the `regatta_race` rule that already published the literal — rather than as a
 * third copy inside `View.ts`. `scripts/regatta-boat-steer.test.mjs` pins the two against each
 * other by source text so they cannot drift; a later slice that may touch the race system should
 * move this constant there and export it from the engine.
 */
export const REGATTA_GATE_RADIUS_FALLBACK = 6;
// hero-move-verb: read from the verb's own module so the published contract cannot drift from the
// executor that enforces it.
import { BOAT_ORDER_REFUSALS, HERO_ARRIVE_RADIUS, HERO_ORDER_REFUSALS } from './StandingOrders';
// E5 Regatta slice 3: the hull's GEOMETRY, read from the entity that owns it so the published
// gangplank and deck cannot drift from the predicates `board`/`stepAshore` actually apply.
import {
  CLAIM_BOAT_DECK_BOUNDS,
  CLAIM_BOAT_GANGPLANK_REACH,
  CLAIM_BOAT_GANGWAY_REACH,
  CLAIM_BOAT_HULL_RADIUS,
  type ClaimBoatPhysics,
} from '../entities/ClaimBoat';
import {
  SEED_CARAVAN_DWELL_SECONDS,
  SEED_CARAVAN_MAX_HP,
  SEED_CARAVAN_PLANT_COST_RATIO,
  SEED_CARAVAN_PLANT_REACH,
  SeedCaravanSystem,
} from '../systems/SeedCaravanSystem';
import {
  CANAL_BACKFILL_ACTION,
  CANAL_DECISION_REACH,
  CANAL_REDIG_ACTION,
  CanalChoiceSystem,
} from '../systems/CanalChoiceSystem';
import { TileStateStore } from '../game/TileStateStore';

type MechanicRecord = Readonly<Record<string, boolean | number | string>>;
type MechanicValue = boolean | number | string | readonly string[] | readonly MechanicRecord[] | MechanicRecord;

export type MechanicsManifest = {
  schema: 'goldrush.mechanics.v1';
  contractId: string;
  buildables?: readonly {
    id: BuildableId;
    operation: 'BUILD';
    meaning: string;
    cost: number;
    costs: readonly number[];
    costRule?: 'ceil-to-5';
    maxCount: number;
    source: 'buildables.registry' | 'practice.buildables' | 'twist.pressureEnabled' | 'twist.powerGrid' | 'twist.mothSeason' | 'twist.lightRamp' | 'twist.dayNightCycle';
  }[];
  interactables: readonly {
    id: string;
    count: number;
    operations: readonly string[];
    source: 'tileParams.prePlacedBuildables' | 'practice.stations' | 'practice.targets';
  }[];
  rules: readonly {
    id: string;
    source: string;
    data: Readonly<Record<string, MechanicValue>>;
  }[];
  modes: readonly ContractEscortMode[];
  posting: {
    waves: readonly { event: string; wave: number; source: string }[];
    spawnEdges: readonly string[];
    lossStakes: readonly { id: string; x: number; z: number; source: 'tileParams.stakeMarkers' }[];
  };
};

export function deriveMechanicsManifest(contractId: string): MechanicsManifest;
export function deriveMechanicsManifest(contract: ContractManifest): MechanicsManifest;
export function deriveMechanicsManifest(source: string | ContractManifest): MechanicsManifest {
  const contract = typeof source === 'string' ? loadContract(source) : source;
  const rules: MechanicsManifest['rules'][number][] = [];
  const tile = contract.tileParams;
  const twist = contract.twist;
  const practice = contract.practice;
  // THE PER-CONTRACT BEACON LADDER travels as a value, never as module state: this function prices
  // any contract handed to it, including one that is not the contract being played.
  const beaconLadder = resolveBeaconLadder(twist.economy?.beaconLadder);

  // hero-move-verb (owner ruling 2026-09-06, verbatim: "yes! please! rider has to be able to move,
  // I did not know that was not possible before"). THE FIRST UNCONDITIONAL ROW IN THIS MANIFEST,
  // and the exception earns itself: every other rule here answers "what does THIS contract
  // declare", while this one answers "what does the hero verb promise", and the promise is a
  // property of the ENGINE, identical on every map. It is published per contract anyway because
  // `stablePrefix.mechanics` is the only machine-readable surface a rider reads before it rides,
  // and a verb whose arrival radius and refusal vocabulary lived only in prose would be a verb a
  // machine has to guess at. It is FIRST in the list so every ordered census pin gains exactly one
  // token at index 0.
  rules.push(rule('hero_orders', 'StandingOrders.MOVE_HERO', {
    verb: 'MOVE_HERO',
    body: 'hero',
    arriveRadius: HERO_ARRIVE_RADIUS,
    refusals: HERO_ORDER_REFUSALS,
    // Who may hold the hero, stated as the engine table rather than as a slogan.
    pilots: {
      headless: 'the rider pilots the run\'s only hero',
      roomSeat: 'a headless roster seat pilots its own hero',
      soloBrowser: 'a human pilots the hero; MOVE_HERO refuses HERO_NOT_YOURS',
    },
  }));
  if (tile.river) rules.push(rule('river', 'tileParams.river'));
  if (tile.ford) {
    rules.push(rule('water_crossings', 'tileParams.ford', {
      count: tile.fords?.length ?? 1,
      ids: tile.fords?.map(({ id }) => id).sort() ?? [],
    }));
  }
  if (tile.waterSources.length > 0) {
    rules.push(rule('spring_cells', 'tileParams.waterSources', {
      count: tile.waterSources.length,
      kinds: [...new Set(tile.waterSources.map(({ kind }) => kind))].sort(),
    }));
  }
  if (tile.buildZones?.length) {
    rules.push(rule('build_zones', 'tileParams.buildZones', {
      count: tile.buildZones.length,
      banks: [...new Set(tile.buildZones.map(({ bank }) => bank))].sort(),
    }));
  }
  if (twist.seamYieldMult !== undefined) {
    rules.push(rule('seam_yield_multiplier', 'twist.seamYieldMult', { multiplier: twist.seamYieldMult }));
  }
  const waveSchedule = twist.dayNightCycle?.waveSchedule;
  if (waveSchedule) {
    rules.push(rule('darkness_cycle', 'Game.nightShiftLightingState', {
      duskWave: waveSchedule.duskWave,
      darkWave: waveSchedule.darkWave,
      nightDepth: twist.dayNightCycle!.nightDepth,
      phases: ['full', 'dusk', 'dark'],
      progression: 'clamp((wave-duskWave)/max(1,darkWave-duskWave),0,1)',
      returnsToFull: false,
    }));
  } else if (twist.lightRamp) {
    rules.push(rule('darkness_cycle', 'twist.lightRamp', {
      duskWave: twist.lightRamp.duskWave,
      darkWave: twist.lightRamp.darkWave,
      dawnWave: twist.lightRamp.dawnWave,
    }));
  }
  if (twist.enemyLanternClasses?.length) {
    rules.push(rule('enemy_lantern_classes', 'twist.enemyLanternClasses', { classes: [...twist.enemyLanternClasses].sort() }));
  }
  if (twist.waveCadenceMult !== undefined) {
    rules.push(rule('wave_cadence_multiplier', 'twist.waveCadenceMult', { multiplier: twist.waveCadenceMult }));
  }
  if (twist.baron) {
    rules.push(rule('baron', 'twist.baron', { escortCount: twist.baron.escortCount, hpScale: twist.baron.hpScale }));
    if (twist.baron.rocketVolley) {
      rules.push(rule('rocket_volley', 'twist.baron.rocketVolley', {
        count: twist.baron.rocketVolley.count,
        cadenceSeconds: twist.baron.rocketVolley.cadenceSeconds,
      }));
    }
  }
  if (twist.pressureEnabled) {
    rules.push(rule('pressure_auto_vent', 'PressureSystem.vent', {
      above: Balance.boilerHouse.safeMax,
      loss: Balance.boilerHouse.ventLoss,
      cooldownSeconds: Balance.boilerHouse.ventCooldownSeconds,
    }));
    rules.push(rule('pressure_bands', 'PressureSystem.band', {
      bands: ['empty:<=0', `low:>0,<${Balance.boilerHouse.safeMin}`, `working:>=${Balance.boilerHouse.safeMin},<=${Balance.boilerHouse.safeMax}`, `high:>${Balance.boilerHouse.safeMax}`],
    }));
    rules.push(rule('pressure_generation', 'PressureSystem.update', {
      buildable: 'boiler_house',
      input: 'coal',
      coalSeconds: Balance.boilerHouse.coalSeconds,
      tickSeconds: Balance.boilerHouse.tickSeconds,
      pressurePerTick: Balance.boilerHouse.pressurePerTick,
    }));
    rules.push(rule('pressure_powers', 'PressureArsenalSystem', {
      spends: ['auto_pan', 'boiler_lance', 'pressure_mortar', 'sky_rocket_battery'],
      bandBoosts: ['boiler_battery'],
    }));
    // F-HEAT14-3, owner-ruled 2026-09-19 ("I agree with all your recommendations on the decisions
    // - good work", option (a)): the four rules above described a mechanic no rider could READ.
    // The heat-14 rider enumerated every `now` key on the Trestle and the Incline and found no
    // pressure value, no band, no coal count — and priced the boiler as strictly dominated because
    // of it. This rule names the gauge that now answers, so a rider reading the rules finds it.
    rules.push(rule('pressure_reading', 'AgentView.now.pressure', {
      field: 'now.pressure',
      publishes: ['stored', 'cap', 'band', 'safeBand', 'coal', 'coalSeconds', 'boilers', 'vents', 'objective', 'seams'],
      // The human's gauge hides the numeric band until `pressure_assay`; the rider's does too.
      safeBandResearch: 'pressure_assay',
      // No vent verb on either side: the valve blows itself above `safeMax`.
      ventVerb: false,
    }));
  }
  const voltageSocket = contract.id === 'e3-blackout-ridge' && twist.powerGrid
    ? { powerGrid: twist.powerGrid }
    : undefined;
  if (voltageSocket) {
    const producers = voltageSocket.powerGrid.nodes
      .filter((node) => node.kind === 'producer')
      .map((node) => `${node.id}:${node.outputWatts}W`)
      .sort();
    const consumers = voltageSocket.powerGrid.nodes
      .filter((node) => node.kind === 'consumer')
      .map((node) => `${node.id}:${node.role}:${node.drawWatts}W:priority${node.priority}`)
      .sort();
    const stores = voltageSocket.powerGrid.nodes
      .filter((node) => node.kind === 'storage')
      .map((node) => `${node.id}:${node.capacityWh}Wh:charge${node.chargeWatts}W:discharge${node.dischargeWatts}W`)
      .sort();
    rules.push(rule('current_allocation', 'PowerGraphSystem.step', {
      producers,
      consumers,
      connectedBy: 'intact-wires-between-online-nodes',
      allocationOrder: 'ascending-priority',
      nodeStates: ['powered', 'browned-out', 'dark'],
    }));
    rules.push(rule('current_construction', 'Game.syncContractPowerGrid', {
      relayBuildable: 'sentry_beacon',
      pylonSites: (tile.pylonSites ?? []).map(({ id }) => id).sort(),
      repairOperation: 'REPAIR_UNDER',
      storageBuildable: 'capacitor_bank',
      capacitorSites: (tile.capacitorSites ?? []).map(({ id }) => id).sort(),
    }));
    rules.push(rule('current_storage', 'PowerGraphSystem.step', { stores }));
  }
  if (twist.powerGrid?.connect) {
    rules.push(rule('connect_objective', 'Game.syncCanyonConnectObjective', {
      consumerRole: 'gallery',
      poweredState: 'powered',
      required: twist.powerGrid.connect.required,
      byWave: twist.powerGrid.connect.byWave,
      completionLatch: 'one-way-at-or-before-deadline',
      failureLatch: 'one-way-after-deadline',
      missedDeadline: 'run-unsecurable',
    }));
  }
  // --- E3 FAIRGROUND. Derived from the CONSUMER, never from the declaration: `CrowdFlockSystem`
  // is built by `create()` on `twist.fairground.crowdFlocks` in both engines, so the vocabulary is
  // gated on exactly that field. A fairground that declared a wheel and no flocks would run the
  // wheel and say nothing here, which is the truth in that case. Every number below is read off
  // the consumer's own constants (`LANE_SPACING_RADII`, `FLOCK_SPEED_MULT`) or the contract.
  const crowdFlocks = twist.fairground?.crowdFlocks;
  if (crowdFlocks) {
    const plaza = [
      { id: twist.fairground!.wheel.nodeId, x: twist.fairground!.wheel.x },
      ...twist.fairground!.pavilions.map(({ id, x }) => ({ id, x })),
    ].sort((left, right) => left.x - right.x || compare(left.id, right.id));
    rules.push(rule('crowd_escort', 'CrowdFlockSystem.update', {
      flocks: crowdFlocks.count,
      escortRadius: crowdFlocks.escortRadius,
      speed: Number((Balance.hero.speed * FLOCK_SPEED_MULT).toFixed(3)),
      speedRule: `hero-walk x ${FLOCK_SPEED_MULT}`,
      launchesOn: 'each dayNightCycle whose dark phase finds the flock home',
      route: 'heroStart stake -> plaza landmark -> back',
      laneSpacing: crowdFlocks.escortRadius * LANE_SPACING_RADII,
      destinations: plaza.map(({ id }) => id),
      frightenedBy: 'any live enemy within escortRadius',
      onFright: 'scatter home, crossing fails, retry next night',
      friendliesNeverFrighten: true,
    }));
    rules.push(rule('crowd_escort_objective', 'Game.autoSecureWaveForRun', {
      requires: 'every flock has completed at least one crossing',
      andRequires: 'the fair wheel is still spinning',
      secureWave: twist.secureWave ?? 0,
      completionLatch: 'per-flock, one-way',
      wheelRule: 'any damage stops the dynamo for the run',
      unmetAtSecureWave: 'run-unsecurable-until-met',
    }));
  }
  const mothSocket = contract.id === 'e3-moth-season' && twist.mothSeason
    ? twist.mothSeason
    : undefined;
  if (mothSocket) {
    rules.push(rule('moth_attachment', 'MothSwarm.update+dimSources', {
      damageTarget: 'decoy_shed',
      damagePerAttachedPerSecond: mothSocket.attachDamagePerSecond,
      radiusLossPerAttached: 0.3,
      minimumRadiusMultiplier: 0.35,
    }));
    rules.push(rule('moth_targeting', 'MothSwarm.update', {
      score: 'coverageAt(source.x,source.z) * source.radius * radiusWeight * (source.targetWeight ?? 1)',
      radiusWeight: mothSocket.radiusWeight,
      defaultTargetWeight: 1,
      decoyTargetWeight: mothSocket.decoyWeight,
      selection: 'highest-score',
      tieBreak: 'ascending-source-id',
    }));
    rules.push(rule('moth_wave', 'Game.spawnMothSeasonWave', {
      lightKinds: ['lantern', 'powered-lamp'],
      mothsBaselinePerWave: mothSocket.mothsBaselinePerWave ?? 0,
      mothsPerLightPerWave: mothSocket.mothsPerLightPerWave,
      minimumDarkness: 0.5,
      count: 'max(mothsBaselinePerWave,floor(lightSources)*mothsPerLightPerWave)',
    }));
  }
  const dayNightSocket = (contract.id === 'e3-blackout-ridge' || contract.id === 'e3-moth-season')
    ? twist.dayNightCycle
    : undefined;
  if (dayNightSocket?.nightLocked) {
    rules.push(rule('locked_night', 'DayNightCycle.sample', {
      periodSeconds: dayNightSocket.periodSeconds,
      duskRampSeconds: dayNightSocket.duskRampSeconds,
      dawnRampSeconds: dayNightSocket.dawnRampSeconds,
      nightDepth: dayNightSocket.nightDepth,
      minimumDarkness: dayNightSocket.nightDepth * 0.75,
      phases: ['dusk', 'dark', 'dawn'],
      fullLight: false,
    }));
  }
  // E4 Motor. The Land Yacht's ORBIT road is the one Motor-era mechanic that already has a
  // live browser consumer: Game.ts constructs LandYachtBossSystem unconditionally and updates
  // it in the sim loop, and that system reads tileParams.orbitSpawn to drive the boss.
  // AP-11 admits a mechanic only when it is BOTH declared and consumed, so this derives the
  // three orbit fields the consumer actually reads and nothing else — the tile's tar seams,
  // road corridors, dry wash, weather, and peel vocabulary stay undeclared because no booted
  // system reads them. Gated on the DATA, never the contract id (AP-11 amendment 1:
  // "staging belongs in data ... id-hardcode is a manifest hole").
  const landYacht = twist.baron?.variantId === 'land_yacht' && tile.orbitSpawn
    ? { baron: twist.baron, orbit: tile.orbitSpawn }
    : undefined;
  if (landYacht) {
    const { baron, orbit } = landYacht;
    rules.push(rule('land_yacht_orbit', 'LandYachtBossSystem.installOrbitRoute', {
      centerX: orbit.center.x,
      centerZ: orbit.center.z,
      radius: orbit.radius,
      angularSpeed: orbit.angularSpeed,
      waypoints: 25,
      speed: 'radius*angularSpeed',
      startAngle: 'atan2(component.z-centerZ,component.x-centerX)',
      installedOn: 'first-tick-with-a-live-land_yacht-component',
      ignoresTerrain: true,
    }));
    rules.push(rule('land_yacht_acts', 'LandYachtBossSystem.advanceActs', {
      components: (baron.components ?? []).map(({ id }) => id).sort(),
      act1: 'orbits the road while the wheels live',
      act2: 'wheels destroyed: beached, remaining components pinned where they stand',
      act3: 'crane and wheelhouse destroyed: salvage ready, wreck remains',
    }));
    rules.push(rule('land_yacht_head_loot', 'LandYachtBossSystem.updateOrbit', {
      intervalSeconds: Balance.landYacht.lootIntervalSeconds,
      heads: 4,
      headRing: 'radius+4',
      escortVariant: 'motor_gang',
      requires: 'a live crane component',
      retrySeconds: 0.25,
    }));
    rules.push(rule('land_yacht_crane', 'LandYachtBossSystem.updateCrane', {
      reach: Balance.landYacht.craneReach,
      cooldownSeconds: Balance.landYacht.craneGrabCooldownSeconds,
      targets: 'turret',
      damage: 'target.maxHp',
      activeIn: 'act2',
    }));
    rules.push(rule('land_yacht_dread', 'LandYachtBossSystem.onWaveStarted', {
      wave: baron.wave - 2,
      seconds: Balance.landYacht.dreadSeconds,
      requires: 'a ready watchtower',
    }));
  }
  // E4 Motor Frontier (`tasks/e4-roads-and-convoys.md`). Gated on the DATA (`twist.motorFrontier`
  // beside `twist.weather`), never the contract id. The consumer is `src/sim/MotorSocket.ts`, which
  // the headless door composes; the browser boot composes no motor consumer today (`Game.ts` mounts
  // `Vehicle`/`FuelSystem` only under `?debug&vehicles` and `DustFlatsTile` has no importer), and the
  // `engines` field says so rather than implying a parity that does not exist yet.
  const motor = twist.motorFrontier;
  const motorWeather = twist.weather;
  if (motor && motorWeather) {
    const corridors = tile.roadCorridors ?? [];
    const end = (id: string | undefined): { x: number; z: number } => corridors.find((corridor) => corridor.id === id)?.end ?? { x: 0, z: 0 };
    const start = (id: string | undefined): { x: number; z: number } => corridors.find((corridor) => corridor.id === id)?.start ?? { x: 0, z: 0 };
    rules.push(rule('motor_roads', 'MotorSocket.gradeAt', {
      corridors: corridors.map(({ id }) => id).sort(),
      count: corridors.length,
      gradeReach: MOTOR_GRADE_REACH,
      halfWidth: Balance.e4Road.halfWidth,
      friendlySpeedMultiplier: Balance.e4Road.friendlySpeedMultiplier,
      friendlyFuelMultiplier: Balance.e4Road.friendlyFuelMultiplier,
      verb: `${MOTOR_GRADE_VERB} with the Prospector within gradeReach of an ungraded corridor start`,
      engines: 'gr-sim',
    }));
    rules.push(rule('motor_fuel', 'FuelSystem.update', {
      nodes: Balance.e4Fuel.nodePositions.map(({ x, z }) => ({ x, z })),
      harvestRange: Balance.e4Fuel.harvestRange,
      harvestSeconds: Balance.e4Fuel.harvestSeconds,
      tarPerNode: Balance.e4Fuel.tarPerNode,
      fuelPerTar: Balance.e4Fuel.fuelPerTar,
      refineSeconds: Balance.e4Fuel.refineSeconds,
      capacity: Balance.e4Fuel.capacity,
      harvestedBy: 'any actor standing within harvestRange for harvestSeconds; the Prospector counts',
      engines: 'gr-sim',
    }));
    rules.push(rule('motor_hauler', 'Vehicle.update', {
      startX: motor.vehicle.start.x,
      startZ: motor.vehicle.start.z,
      speed: Balance.e4Fuel.vehicleSpeed,
      burnPerSecond: Balance.e4Fuel.burnPerSecond,
      arriveRadius: Balance.e4Fuel.arriveRadius,
      stormMovementMultiplier: motorWeather.stormMovementMultiplier,
      verb: `${MOTOR_HAUL_VERB} drives the Hauler to where the Prospector stands; it halts dry when the tank empties and resumes as tar refines`,
      engines: 'gr-sim',
    }));
    // ONE objective rule, whichever of the four this map declares, all under the same id so a rider
    // reads the errand from one place and `kind` tells it which errand this is.
    if (motor.haul) {
      rules.push(rule('motor_haul_objective', 'MotorSocket.objectiveAllowsSecure', {
        kind: 'haul',
        corridorId: motor.haul.corridorId,
        label: motor.haul.label,
        stopX: end(motor.haul.corridorId).x,
        stopZ: end(motor.haul.corridorId).z,
        stopReach: MOTOR_STOP_REACH,
        requires: 'the Hauler at rest within stopReach of the stop; on a boss contract, before the boss falls',
        engines: 'gr-sim',
      }));
    }
    if (motor.convoy) {
      const route = tile.convoyRoute ?? [];
      const far = route[route.length - 1] ?? { x: 0, z: 0 };
      rules.push(rule('motor_haul_objective', 'MotorSocket.objectiveAllowsSecure', {
        kind: 'convoy',
        corridorId: motor.convoy.corridorId,
        label: motor.convoy.label,
        stopX: far.x,
        stopZ: far.z,
        stopReach: MOTOR_STOP_REACH,
        requires: 'the convoy at the far end of tileParams.convoyRoute; it gains exactly the ground the lead Hauler gains toward that stop and never the ground it gives back',
        engines: 'gr-sim',
      }));
    }
    if (motor.deliveries) {
      rules.push(rule('motor_haul_objective', 'MotorSocket.objectiveAllowsSecure', {
        kind: 'deliveries',
        corridorIds: [...motor.deliveries.corridorIds],
        label: motor.deliveries.label,
        stops: motor.deliveries.corridorIds.map((id) => ({ corridorId: id, x: end(id).x, z: end(id).z })),
        stopReach: MOTOR_STOP_REACH,
        closures: motor.deliveries.closures,
        requires: 'the Hauler at rest within stopReach of every lease road end, each while that road is open',
        engines: 'gr-sim',
      }));
      if (motor.deliveries.closures) {
        rules.push(rule('motor_closures', 'MotorSocket.syncClosures', {
          corridorIds: [...motor.deliveries.corridorIds],
          closedWhile: 'weather.phase === storm',
          picks: 'corridorIds[weather.cycle % corridorIds.length]',
          effect: 'no road bonus on the closed lease and no delivery through it; the road is not a wall',
          engines: 'gr-sim',
        }));
      }
    }
    if (motor.tow) {
      const hulk = (tile.salvageHulks ?? []).find(({ id }) => id === motor.tow!.hulkId);
      rules.push(rule('motor_haul_objective', 'MotorSocket.objectiveAllowsSecure', {
        kind: 'tow',
        corridorId: motor.tow.corridorId,
        label: motor.tow.label,
        hulkId: motor.tow.hulkId,
        hulkKind: hulk?.kind ?? 'unknown',
        hulkX: hulk?.x ?? 0,
        hulkZ: hulk?.z ?? 0,
        stopX: start(motor.tow.corridorId).x,
        stopZ: start(motor.tow.corridorId).z,
        stopReach: MOTOR_STOP_REACH,
        requires: 'the Hauler at rest by the hulk to hitch it, then at rest at the gate end of the road to deliver it',
        engines: 'gr-sim',
      }));
    }
    rules.push(rule('motor_weather', 'WeatherSystem.sample', {
      cycleSeconds: motorWeather.cycleSeconds,
      clearSeconds: motorWeather.clearSeconds,
      telegraphSeconds: motorWeather.telegraphSeconds,
      stormSeconds: motorWeather.stormSeconds,
      stormMovementMultiplier: motorWeather.stormMovementMultiplier,
      stormVisibilityMultiplier: motorWeather.stormVisibilityMultiplier,
      slows: ['hauler', 'convoy', 'enemies'],
      visibility: 'rider-visible only; no simulation consumer',
      engines: 'gr-sim',
    }));
    if (motor.convoy) {
      rules.push(rule('motor_convoy', 'ConvoyBehavior.update', {
        members: motor.convoy.members,
        label: motor.convoy.label,
        spacing: Balance.convoy.spacing,
        catchupMultiplier: Balance.convoy.catchupMultiplier,
        route: 'tileParams.convoyRoute',
        advances: 'by the lead Hauler own gain toward the far stop, never by a clock',
        engines: 'gr-sim',
      }));
    }
  }
  // --- E5 Deepwater. Gated exactly as the browser's `createDeepwaterClaimTile` consumer.
  const deepwater = contract.id === 'e5-deepwater-claim' || contract.id === 'e5-regatta'
    || contract.id === 'e5-stillwater' || contract.id === 'e5-flotilla'
    ? tile.deepwater
    : undefined;
  if (deepwater) {
    rules.push(rule('deepwater_water_regions', 'WaterRegionTile.sample', {
      tileId: deepwater.waterTile.id,
      size: deepwater.waterTile.size,
      depthClasses: [...new Set(deepwater.waterTile.regions.map(({ depthClass }) => depthClass))].sort(),
      diveZone: ['reef', 'wreck', 'trench'],
    }));
    rules.push(rule('deepwater_claim_boat', 'ClaimBoat.placeBuilding+reanchor', {
      boatId: deepwater.claimBoat.id,
      pads: deepwater.claimBoat.pads.map(({ id }) => id).sort(),
      anchors: [...deepwater.claimBoat.anchors, ...(tile.flotilla?.hulls ?? [])].map(({ id }) => id).sort(),
      initialAnchor: deepwater.claimBoat.initialAnchorId,
      padsAcceptOneBuildingEach: true,
      buildingsRideTheAnchor: 'world position = anchor + pad offset',
    }));
    rules.push(rule('deepwater_storm_track', 'StormWaveScheduler.advance', {
      regionId: deepwater.stormTrack.regionId,
      westX: deepwater.stormTrack.westX,
      eastX: deepwater.stormTrack.eastX,
      corsairsPerWave: deepwater.corsairWaveSize,
      // A2: a track that crews nobody replaces nothing. The Stillwater authors zero corsairs and
      // keeps the ordinary schedule, so a rider must not read "storm = wave" on that map.
      replacesScheduledWaves: deepwaterStormDrivesWaves(contract),
    }));
    rules.push(rule('deepwater_arsenal', 'DeepwaterArsenal.update', {
      deckBuildables: ['sentry_beacon', 'turret'],
      weapons: ['depthChargeLobber', 'depthChargeRack', 'harpoonBallista'],
      sharedMunition: Balance.e5Arsenal.depthChargeMunition.id,
      munitionCapacity: Balance.e5Arsenal.depthChargeMunition.capacity,
      sealedInDiveZone: true,
    }));
    // NOT sourced to `tileParams.deepwater.wrecks`: raw data is not a mechanic. Vocabulary comes
    // from the consumer that anchors on the wreck field, including its headless boss lifecycle.
    if (twist.baron?.variantId === 'dredge_queen') {
      rules.push(rule('deepwater_boss_socket', 'DredgeQueenBossSystem', {
        wreckSites: deepwater.wrecks.length,
        eras: deepwater.wrecks.map(({ era }) => era).sort(),
        bossWave: twist.baron.wave,
        constructsHeadlessly: true,
        secureConditionReachable: true,
      }));
    }
    if (tile.raceCourse) {
      const finishId = tile.stakeMarkers?.find(({ heroStart }) => heroStart)?.id ?? '';
      // `ContractDeepwaterFields.claimBoat` predates the steerable boat and publishes no `physics`
      // in its type; `RegattaRaceSystem.create` and `DeepwaterClaimTile` read the same authored
      // block through the same narrowing. This is that narrowing, not a second schema.
      const boatPhysics = (deepwater.claimBoat as { physics?: ClaimBoatPhysics } | undefined)?.physics;
      rules.push(rule('regatta_race', 'RegattaRaceSystem.advance+movementMultiplierAt', {
        // THE COURSE AS RACED, not as authored (slice 2). `advance` walks the authored beacons and
        // then takes the `heroStart` stake as the finish line, so the course is SIX gates and a
        // rider counting five would think it had won a mark early.
        gates: [...tile.raceCourse.beacons.map(({ id }) => id), finishId],
        gateCount: tile.raceCourse.beacons.length + 1,
        finish: finishId,
        gateRadiusFallback: REGATTA_GATE_RADIUS_FALLBACK,
        fastWaterZone: tile.raceCourse.fastWaterZone.id,
        // F-RB1-2, CLOSED BY SLICE 2 AND RE-READ HERE. This row published a hard 1.35 for a body on
        // foot while the hull steered on the contract's own number; slice 2 deleted the on-foot
        // number and made the contract's the single source, and `RegattaRaceSystem.create` now
        // REFUSES a course whose racing body authors no physics. The manifest was the last copy of
        // the stale 1.35 and is read from the same authored field as the engine from here on.
        fastWaterMultiplier: boatPhysics?.fastWaterMultiplier ?? 0,
        // Law 3, "the race counts the boat": one racer or none, and the racer is the hull with a
        // body aboard. Published because a rider that does not know this will swim the course.
        racer: 'the Claim-Boat with a body aboard; a swimming hero and a moored hull score nothing',
        // Q2, ratified 2026-09-19: leaving the boat after the start beacon ends the run's race.
        leavingTheBoatForfeits: true,
        forfeitIsTerminalForTheRace: true,
        deadlineWave: twist.secureWave ?? 0,
        competingRacerLoot: false,
        view: 'now.regatta',
      }));
      // E5 REGATTA SLICE 3 — THE HULL AS A BODY, published beside `deepwater_claim_boat` rather
      // than folded into it. That rule is the MOORED boat every Deepwater map has (pads, anchors,
      // deck buildings); this one exists only where a race course declares the hull a racing body,
      // and a rider reading the two together can tell the pads from the helm.
      rules.push(rule('regatta_boat', 'ClaimBoat.board+steer+stepAshore', {
        boatId: deepwater.claimBoat.id,
        // ADR-005's whole claim on this map: no new verb, and the same intent for both species.
        helm: 'MOVE_HERO',
        helmedWhile: 'aboard; a MOVE_HERO to navigable water sails the hull, and the hero rides the deck anchor',
        embark: 'walk the hero onto the deck: boarding is a CROSSING of the rail, so a hero that boots on the deck has not boarded',
        // F-RB2-2 (a), owner 2026-09-22 "gangway-reach only": the reach is measured from the DECK
        // ANCHOR you ride, so it is the same in every direction and you leave her over the SIDE.
        disembark: 'a move intent toward standable ground off the deck and within gangwayReach of the deck anchor, so a bow-ward intent steps nowhere and the hull runs aground on its clamp instead; after the start beacon this forfeits',
        gangwayReach: CLAIM_BOAT_GANGWAY_REACH,
        waterBounds: boatWaterFor(deepwater.waterTile) ?? {},
        standable: 'A step ashore needs STANDABLE ground: walkable terrain off the deck and outside the hull water bounds, within gangwayReach of the deck anchor. The Regatta has walkable shallows beyond parts of this clamp; other points are blocked. Read canStepAshore before ordering: all-water scenery does not make leaving the boat unreachable.',
        shoreView: 'now.regatta.canStepAshore samples off-deck, non-navigable, walkable terrain at 16 headings around the gangway reach circle',
        gangplankReach: CLAIM_BOAT_GANGPLANK_REACH,
        deckHalfWidth: CLAIM_BOAT_DECK_BOUNDS.maxX,
        deckHalfLength: CLAIM_BOAT_DECK_BOUNDS.maxZ,
        hullRadius: CLAIM_BOAT_HULL_RADIUS,
        refusals: BOAT_ORDER_REFUSALS,
        topSpeed: boatPhysics?.topSpeed ?? 0,
        acceleration: boatPhysics?.acceleration ?? 0,
        turnRateRadPerSec: boatPhysics?.turnRateRadPerSec ?? 0,
        drag: boatPhysics?.drag ?? 0,
        fastWaterMultiplier: boatPhysics?.fastWaterMultiplier ?? 0,
        // F-HEAT15-4, owner ruling 2026-09-22 (a): published because a rider that cannot read this
        // has no way to know that sailing the course is worth more than tying on the scored axes.
        boardRanking: 'the county ranks a finished race above any unfinished row on this board',
        view: 'now.regatta.boat',
      }));
    }
    if (tile.flotilla) {
      rules.push(rule('flotilla_hulls', 'FlotillaHullSystem.advance+reanchor+targetPosition', {
        hulls: tile.flotilla.hulls.map(({ id }) => id),
        districts: tile.flotilla.hulls.map(({ district }) => district),
        ...FLOTILLA_HULL_RULES,
        secureWave: twist.secureWave ?? 0,
      }));
    }
    // A2 — SOURCED FROM THE CONSUMER, never re-read from `tileParams.stillwater`: the rule spells
    // out what makes each machine RUN and how the trail is shaken, which is vocabulary the JSON
    // does not contain. Only the source ids and the quiet-zone ids are names the contract owns.
    if (tile.stillwater) {
      rules.push(rule('noise_hunt', 'NoiseHuntSystem.advance+onReanchor', {
        sources: tile.stillwater.noiseSources.map(({ id }) => id),
        heardWhile: [
          'air-pump: the harvest CHANNEL is engaged (the HARVEST verb hand-pans and is silent)',
          'engine: the boat is under way after a REANCHOR',
          'harpoon-reload: the deck ballista fired',
        ],
        loudness: 'the declared radius of a running source; the loudest audible one is trailed',
        machinesRideTheAnchor: 'world position = anchor + authored offset',
        silencedIn: tile.stillwater.quietZones.map(({ id }) => id),
        ...NOISE_HUNT_RULES,
        strikeTarget: 'the deck nearest the trailed machine; the hero is never struck',
        fogIsPresentationOnly: true,
        secureWave: twist.secureWave ?? 0,
      }));
    }
    // The manifest must not imply an agent can work the boat: `AgentGameAdapter` carries
    // BUILD/PAN/REPAIR only. The levers exist on the consumer and not on the agent surface.
    rules.push(rule('deepwater_levers_unreachable', 'AgentGameAdapter', {
      consumerLevers: ['ClaimBoat.placeBuilding', 'ClaimBoat.reanchor'],
      agentOperations: [],
      reason: 'no boat-build or reanchor verb exists on the agent tool surface',
    }));
  }

  // --- A4 signal suppression. SOURCED FROM THE CONSUMER, not re-read from JSON: the manifest
  // asks `SignalSuppression` which systems it switched off, so a manifest row cannot drift
  // from the gate the run actually applies. Absent when the contract declares nothing —
  // silence here means "no suppression", and it must keep meaning that.
  const suppression = SignalSuppression.create(contract);
  if (suppression.diagnostics.declared) {
    rules.push(rule('signal_suppression', 'SignalSuppression.refuse', {
      off: suppression.suppressedSystems,
      // Named so a rider reads the CONSEQUENCE rather than deducing it from three booleans.
      consequence: 'the named systems refuse for the whole run; the claim is won with turrets, combat and harvest alone',
      refusalReason: SIGNAL_SUPPRESSION_REASON,
    }));
  }

  // --- A3 broadcast mirror. SOURCED FROM THE CONSUMER for the same reason the suppression rule
  // above is: `BroadcastMirror.create` is what decides whether a contract casts a shadow at all
  // (it refuses a delay it cannot honour, and refuses a roster with nothing to be a copy OF), so
  // asking it is the only way a manifest row cannot promise a mechanic the run would not run.
  // Absent everywhere the twist is undeclared — silence means no shadow, and it must keep meaning
  // that.
  const mirror = BroadcastMirror.create(contract);
  if (mirror.isDeclared) {
    rules.push(rule('broadcast_mirror', 'BroadcastMirror.fieldMirrors', {
      recordedOn: 'a playbook USE (a replay that starts); recording a tape records nothing',
      delay: mirror.diagnostics.delay ?? '',
      capPerWave: BROADCAST_MIRROR_SQUAD_CAP,
      hpPerRepeat: BROADCAST_MIRROR_HP_PER_REPEAT,
      squadSize: `${BROADCAST_MIRROR_MIN_SQUAD}-${BROADCAST_MIRROR_MAX_SQUAD}`,
      variantId: BROADCAST_MIRROR_VARIANT_ID,
      // The four facets a copy echoes, named so a rider can plan the shape it will face.
      echoes: ['squad size from tape length', 'wrecker if the tape built', 'thief otherwise', 'faster if the tape roved', 'longer hunt if the tape volleyed'],
      // Named so a rider reads the LESSON rather than deducing it from two constants.
      consequence: 'every playbook you play back returns next wave as a corrupted squad; repeating the SAME tape makes its copy 10% heavier each time, so vary your habits',
    }));
  }

  // --- A6 probe recovery. SOURCED FROM THE CONSUMER for the same reason the suppression rule
  // above is: the manifest asks `ProbeRecovery` what it armed, so a rule cannot promise a
  // recoverable probe the run would refuse. Silence means no probe, and it must keep meaning
  // that — a contract declaring the trigger with no crater arms NOTHING and says nothing here.
  const probe = ProbeRecovery.create(contract);
  if (probe.declared) {
    rules.push(rule('probe_recovery', 'ProbeRecovery.recover', {
      operation: `CONTEXT_ACTION:${PROBE_RECOVER_ACTION}`,
      zones: probe.diagnostics.zones,
      trigger: probe.diagnostics.trigger ?? '',
      // The consequence a rider must plan around: this is an OBJECTIVE, not a bonus.
      consequence: 'the run cannot secure until the probe is recovered; stand in the crater and take the context action',
      playsOnce: true,
    }));
  }

  // --- E8 air as the wall. SOURCED FROM THE CONSUMER for the same reason A6 above is: the row
  // states the count and the window `E8AtmosphereSystem` will actually enforce, so a card can
  // never promise a gate the run does not hold or hide one it does. Absent everywhere the consumer
  // is not armed, which today is everywhere but the Mare Claim (`AIR_WALL_CONTRACT_IDS`); the
  // three siblings run their own consumer and their own row is that slice's to write.
  const airWall = E8AtmosphereSystem.create(contract);
  if (airWall.isDeclared) {
    const { suit, regolith } = airWall.diagnostics;
    const windowWaves = regolith.windowWaves ?? null;
    rules.push(rule('air_wall_regolith', 'E8AtmosphereSystem.notePan', {
      suitSeconds: suit.capacity,
      refillPerSecond: suit.refillPerSecond,
      refillsIn: `any ${DOME_ZONE_PREFIX}-* pad that still holds air`,
      grounds: regolith.grounds,
      required: regolith.required,
      // Spread-if-authored rather than a null: a `MechanicValue` has no null, and a rule that
      // printed `windowWaves: 0` would read as a window rather than the absence of one. Silence
      // means every worked ground counts whenever it is worked. The rider's real question is "how
      // long is a window", so the row does the arithmetic the consumer does rather than making a
      // rider guess at the wave cadence.
      ...(windowWaves === null ? {} : {
        windowWaves,
        windowSeconds: windowWaves * (Balance.waves.waveInterval / Math.max(0.1, contract.twist.waveCadenceMult ?? 1)),
      }),
      domeDrainSeconds: DOME_AIR_DRAIN_SECONDS,
      domeRefillSeconds: DOME_AIR_REFILL_SECONDS,
      // The consequence, stated as a consequence: this is an OBJECTIVE, not a hazard. It costs no
      // hit points and pays no gold, which is why a rider that ignores it simply cannot secure.
      consequence: windowWaves === null
        ? `the run cannot secure until ${regolith.required} of the ${regolith.grounds} regolith grounds have been panned with air still in the suit; a breathless pan still pays gold and counts for nothing`
        : `the run cannot secure until ${regolith.required} of the ${regolith.grounds} regolith grounds have been panned with air still in the suit, and only ONE ground counts per ${windowWaves}-wave window, so the run is made in trips across the whole contract; a breathless pan still pays gold and counts for nothing`,
      gatesSecure: true,
      damages: false,
    }));
  }

  // --- E8 air as the wall, ON THE OTHER THREE MAPS (owner ruling 2026-09-06 evening, verbatim:
  // "yes, same air for all space contracts - but I also never played the levels, so I dont know
  // exactly"). Same shape, same sourcing, same reason as the Mare Claim row above — and the same
  // rule, published under the name the map's own geography earns: the Eclipse works GROUNDS and
  // gets `air_wall_regolith` (one rule id for one rule, so a rider who learned it on the Mare
  // Claim reads the same row here); the Far Side and Low Orbit make CROSSINGS and get
  // `air_wall_crossing`. Absent on every contract whose suit-air consumer is not armed, and the
  // two rows are mutually exclusive by construction: `E8SuitAirSystem.create` gives a map
  // crossings or grounds, never a gate on each.
  const suitAir = E8SuitAirSystem.create(contract);
  if (suitAir.isDeclared) {
    const { suit, regolith, crossing } = suitAir.diagnostics;
    const waveSeconds = Balance.waves.waveInterval / Math.max(0.1, contract.twist.waveCadenceMult ?? 1);
    const shelters = suitAir.diagnostics.domes.map(({ id }) => id);
    if (crossing) {
      const windowWaves = crossing.windowWaves;
      rules.push(rule('air_wall_crossing', 'E8SuitAirSystem.noteCrossings', {
        suitSeconds: suit.capacity,
        refillPerSecond: suit.refillPerSecond,
        refillsIn: shelters.join(', '),
        zones: crossing.zones,
        required: crossing.required,
        // Spread-if-authored, exactly as the regolith row does it: a `MechanicValue` has no null,
        // and `windowWaves: 0` would read as a window rather than the absence of one.
        ...(windowWaves === null ? {} : { windowWaves, windowSeconds: windowWaves * waveSeconds }),
        // The consequence, stated as a consequence. This is an OBJECTIVE, not a hazard: it costs
        // no hit points and pays no gold, so a rider that ignores it simply cannot secure.
        consequence: windowWaves === null
          ? `the run cannot secure until the hero has stood in every one of the ${crossing.zones.length} authored crossing zones with air still in her suit; an entry made breathless is counted and credits nothing`
          : `the run cannot secure until the hero has stood in every authored crossing zone on air AND ${crossing.required} crossings have been credited, and only ONE crossing counts per ${windowWaves}-wave window, so the vacuum is crossed across the whole contract; an entry made breathless is counted and credits nothing`,
        gatesSecure: true,
        damages: false,
      }));
    } else {
      const windowWaves = regolith.windowWaves ?? null;
      rules.push(rule('air_wall_regolith', 'E8SuitAirSystem.notePan', {
        suitSeconds: suit.capacity,
        refillPerSecond: suit.refillPerSecond,
        refillsIn: `any ${DOME_ZONE_PREFIX}-* pad that still holds air`,
        grounds: regolith.grounds,
        required: regolith.required,
        ...(windowWaves === null ? {} : { windowWaves, windowSeconds: windowWaves * waveSeconds }),
        domeDrainSeconds: DOME_AIR_DRAIN_SECONDS,
        domeRefillSeconds: DOME_AIR_REFILL_SECONDS,
        consequence: windowWaves === null
          ? `the run cannot secure until ${regolith.required} of the ${regolith.grounds} regolith grounds have been panned with air still in the suit; a breathless pan still pays gold and counts for nothing`
          : `the run cannot secure until ${regolith.required} of the ${regolith.grounds} regolith grounds have been panned with air still in the suit, and only ONE ground counts per ${windowWaves}-wave window, so the run is made in trips across the whole contract; a breathless pan still pays gold and counts for nothing`,
        gatesSecure: true,
        damages: false,
      }));
    }
  }

  // --- E8 THE HUMAN'S SUIT (owner directive 2026-09-07, verbatim: "I want space experiences of
  // humans to need them having air. It has to be logical. If that means we have to change something
  // ok"). One row for all four Orbital maps, sourced from whichever consumer this contract arms,
  // and the ONLY E8 row whose `damages` reads true: the two rows above are OBJECTIVES that refuse a
  // secure, this one is a HAZARD that kills. A rider that reads only the objective rows would plan
  // a ride its hero cannot survive, which is exactly the drift a sourced manifest exists to stop.
  const humanSuit = airWall.isDeclared ? airWall : suitAir.isDeclared ? suitAir : null;
  if (humanSuit) {
    const { suit, domes } = humanSuit.diagnostics;
    rules.push(rule('air_suit_human', 'E8HumanSuit.update', {
      body: suit.body,
      suitSeconds: suit.capacity,
      refillPerSecond: suit.refillPerSecond,
      refillsIn: domes.map(({ id }) => id).join(', '),
      // Spread-if-authored, the shape both rows above use: a `MechanicValue` has no null, and
      // `harmPerSecond: 0` would read as a harm rather than the absence of one.
      ...(suit.harmPerSecond === null ? {} : { harmPerSecond: suit.harmPerSecond, harmTickSeconds: SUIT_HARM_TICK_SECONDS }),
      consequence: suit.harmPerSecond === null
        ? `the hero's suit holds ${suit.capacity}s of air outside pressurised ground and refills only inside it; an empty suit costs no hit points on this contract`
        : `the hero's suit holds ${suit.capacity}s of air outside pressurised ground and refills only inside it at ${suit.refillPerSecond}s per second; once it empties she loses ${suit.harmPerSecond}hp every second until she reaches air or dies`,
      gatesSecure: false,
      damages: suit.harmPerSecond !== null,
    }));
  }

  // --- A7 low orbit. SOURCED FROM THE CONSUMER for the same reason A4 is: the manifest asks
  // `LowOrbitSystem` what it will actually do, so a rider's briefing cannot drift from the rules
  // the run applies. Absent when the contract declares no zero-gravity twist.
  const lowOrbit = LowOrbitSystem.create(contract);
  if (lowOrbit.isDeclared) {
    rules.push(rule('zero_gravity', 'LowOrbitSystem', {
      // The three ratified mechanics, named as CONSEQUENCES a rider can plan against.
      orbitalReturn: lowOrbit.returnsProjectiles,
      returnSeconds: lowOrbit.returnSeconds,
      driftControlScale: DRIFT_CONTROL_SCALE,
      debrisSpeedScale: DEBRIS_SPEED_SCALE,
      debrisDamagePerSecond: DEBRIS_DAMAGE_PER_SECOND,
      consequence: 'a lob that hits nothing re-enters after 12s on its original vector and may strike your own works; off the handhold spine and the scaffold decks thrust responds at half rate and momentum carries; the two debris bands slow the suit and chip it',
      handholds: 'soft — never a wall',
    }));
  }

  // --- A9 scheduled relocation. SOURCED FROM THE CONSUMER for the same reason A7 is: the row
  // names the routes `ScheduledRelocationSystem` will actually sweep and the holds it will
  // actually honour, so a manifest that promises three anchors can never outlive a contract that
  // authors two. Absent unless the contract declares `twist.scheduledRelocation` AND authors the
  // patrol routes a column needs to walk.
  const devilsAlley = ScheduledRelocationSystem.create(contract);
  if (devilsAlley.isDeclared) {
    rules.push(rule('scheduled_relocation', 'ScheduledRelocationSystem.update', {
      routes: devilsAlley.routeIds,
      cadence: 'one sweep per wave, alternating routes in authored order',
      sweepSeconds: DEVIL_SWEEP_SECONDS,
      columnRadius: DEVIL_COLUMN_RADIUS,
      // The anchors, with the hold each exerts — the whole of what a rider must plan against.
      anchors: devilsAlley.anchorHolds.map(({ id, x, z, holdRadius }) => `${id}@(${x},${z})r${holdRadius}`),
      // The consequence, stated as a consequence: this is a HAZARD, not an objective.
      consequence: 'a standing work inside the column and outside every anchor hold is lifted, carried to the sweep end point and set down there ALIVE; it is offline while airborne and loses no hp; works inside an anchor hold are never taken',
      damages: false,
      gatesSecure: false,
    }));
  }

  // --- A8 persistent planting. SOURCED FROM THE CONSUMER for the same reason A4 is: the row
  // names the grounds `SeedCaravanSystem` will actually accept a plant at, so a manifest that
  // says "three stakes" can never outlive a contract that authors two. Absent unless the
  // contract declares `twist.persistentPlanting` AND the consumer agrees it can run.
  const caravan = SeedCaravanSystem.create(contract, new TileStateStore(MANIFEST_TILE_STORAGE));
  if (caravan) {
    const { grounds, route, maxHp } = caravan.diagnostics;
    rules.push(rule('persistent_planting', 'SeedCaravanSystem.tryPlant', {
      grounds: grounds.map(({ id }) => id),
      // Both engines walk the caravan through these points in this order.
      routeLength: route.length,
      caravanMaxHp: maxHp,
      plantCostHp: Math.round(SEED_CARAVAN_MAX_HP * SEED_CARAVAN_PLANT_COST_RATIO),
      plantReach: SEED_CARAVAN_PLANT_REACH,
      dwellSeconds: SEED_CARAVAN_DWELL_SECONDS,
      verb: 'CONTEXT_ACTION action=plant',
      // Named so a rider reads the TRADE, not three numbers.
      consequence: 'each plant leaves a permanent no-spawn green on this map and spends a quarter of the caravan guard; the run secures only if the caravan reaches the basin alive',
    }));
  }

  // --- A10 persistent canal choices. SOURCED FROM THE CONSUMER for the same reason A8 is: the
  // row names the stakes `CanalChoiceSystem` will actually accept a verdict at and the standing
  // verdicts it holds, so a manifest that says "three grounds" can never outlive a contract that
  // authors two. Absent unless the contract declares `twist.persistentCanalChoices` AND the
  // consumer agrees it can run. A fresh empty store, so the row describes the MECHANIC, never
  // one profile's history.
  const canal = CanalChoiceSystem.create(contract, new TileStateStore(MANIFEST_TILE_STORAGE));
  if (canal) {
    const { choices, total } = canal.diagnostics;
    rules.push(rule('persistent_canal_choices', 'CanalChoiceSystem.decide', {
      segments: choices.map(({ id }) => id),
      zones: choices.map(({ zoneId }) => zoneId),
      total,
      decisionReach: CANAL_DECISION_REACH,
      verbs: [
        `CONTEXT_ACTION action=${CANAL_REDIG_ACTION}`,
        `CONTEXT_ACTION action=${CANAL_BACKFILL_ACTION}`,
      ],
      // Named so a rider reads the TRADE and the DEADLINE-less objective, not three ids.
      consequence: 'each canal segment takes one permanent verdict at its stake: redig floods the band for every future run (nothing spawns in it, nothing can be built in it) and backfill opens it as build ground forever; an undecided band takes no works at all, and the run cannot secure until all of them are decided',
      playsOnce: true,
    }));
  }

  // --- A5 interference front. SOURCED FROM THE CONSUMER for the same reason A4 is: the row
  // publishes the schedule, the resolved relay target and the site ids that
  // `InterferenceFrontSystem` will actually score, so a briefing cannot promise a deadline the
  // run does not enforce. Absent unless the contract declares the front WITH a corridor to cross
  // and relay sites to light — the same refusal-to-arm that keeps F-1471-1 from happening again.
  const front = InterferenceFrontSystem.create(contract);
  if (front.isDeclared) {
    const diagnostics = front.diagnostics;
    rules.push(rule('interference_front', 'InterferenceFrontSystem.refuse', {
      cadenceSeconds: diagnostics.cadenceSeconds,
      crossingSeconds: diagnostics.crossingSeconds,
      bandHalfWidth: diagnostics.halfWidth,
      // The resolved placeholder. `twist.interferenceFront.relayTarget` is authored `"N"`; the
      // ratified sheet supplies the number (A5 DEFAULTS, "N = 3 of 4").
      relayTarget: diagnostics.relayTarget,
      deadlineFront: diagnostics.deadlineFront,
      relaySites: diagnostics.sites.map(({ id }) => id),
      litBy: POWERED_RELAY_KINDS,
      mutes: ['works', 'drones', 'playbooks', 'relayChains'],
      refusalReason: INTERFERENCE_MUTED_REASON,
      // Named so a rider reads the DEADLINE and the trade, not five numbers.
      consequence: 'a wall of static crosses west to east every 90s; anything under it is muted (turrets and beacons stop firing, drones and playbooks refuse) but never damaged; the run cannot secure unless 3 of the 4 relay sites carry a standing turret or beacon when the third front arrives',
    }));
  }

  // --- E10S-2 the Static squall. SOURCED FROM THE CONSUMER for the same reason A5 is: the row
  // publishes the cadence `E10SquallScheduler` will actually run, so a briefing cannot promise a
  // squall at 60s that the contract retunes to 90. Absent unless the contract declares
  // `twist.emberShore.squall` with a whole cadence — the same refuse-to-arm the consumer applies.
  //
  // THE ROW SAYS WHAT THE SLICE DOES **AND WHAT IT DOES NOT**, which is the honest shape for a
  // half-landed mechanic: this scheduler changes nothing on the board yet, and a rider that read
  // "mote pressure doubles" as a live rule would plan against weather that is not there. AP-11
  // admits a mechanic only when it is BOTH declared and consumed; the phase IS consumed (published
  // in both engines, painted in one), the pressure is not, and `applies` says so in one word.
  const squall = E10SquallScheduler.create(contract);
  const archive = E10ArchiveSystem.create(contract);
  if (archive) rules.push(rule('archive_restoration', 'E10ArchiveSystem.update', {
    wings: archive.wings.map(wing => ({ ...wing })),
    hold: 'Keep a living, powered sentry beacon within the next light site radius throughout telegraph and squall. An interruption retries next cycle; one wing completes per cycle in order.',
    secure: 'Survive the posted secure wave and complete a light hold this run. A fully restored archive requires a fresh hold at the first wing.',
    persistence: 'Bank a secured run to keep earned wings and unlock their ledger pages. Losing keeps no new restoration.',
    pressure: 'During squalls Static Motes steer toward lit sites; Unraveled Memories pursue the Prospector.',
    view: 'now.archive',
  }));
  if (squall.isDeclared) {
    const cadence = squall.diagnostics;
    rules.push(rule('static_squall', 'E10SquallScheduler.update', {
      phases: SQUALL_PHASE_ORDER,
      calmSeconds: cadence.calmSeconds,
      telegraphSeconds: cadence.telegraphSeconds,
      squallSeconds: cadence.squallSeconds,
      recoverSeconds: cadence.recoverSeconds,
      cycleSeconds: cadence.cycleSeconds,
      // E10S-3 WIRED IT: the number below is now applied to the share of the field that walks at
      // the vent while the squall blows (`E10PreserveSystem.pressureTarget`), so `applies` says
      // `phase-and-pressure` and the consequence no longer promises weather that is not there.
      ...(!archive ? { motePressureMultiplier: cadence.motePressureMultiplier } : {}),
      applies: 'phase-and-pressure',
      view: 'now.squall',
      consequence: archive
        ? 'Keep the next archive light powered through telegraph and squall to restore its wing. Static Motes approach lit sites during squalls.'
        : 'a Static squall crosses the whole shore on a fixed cycle: 60s calm, an 8s telegraph as the edges pale, 25s of squall, an 8s recover. The browser desaturates and ducks the mix while it blows. The squall is the only time the vent loses warmth, and while it blows twice the usual share of the field walks at the vent instead of at you.',
      gatesSecure: false,
      damages: false,
    }));
  }

  // --- E10S-3 the preserve vent. SOURCED FROM THE CONSUMER for the same reason the clock above
  // is: the row publishes the warmth, price, disc and latch `E10PreserveSystem` will actually
  // enforce, so a briefing cannot promise a 15-gold stoke the contract retunes to 40. Absent
  // unless the contract declares `twist.emberShore.preserve` against a stake its tile carries —
  // the same refuse-to-arm the consumer applies, so a half-declared vent publishes no rule at all
  // (F-1471-1: a mechanic on the card that no engine consumes is the casualty this discipline is
  // named for).
  const vent = E10PreserveSystem.create(contract);
  const preserve = vent.diagnostics;
  // The stake id is non-null wherever the consumer armed (arming REQUIRES a marker the tile
  // carries), but the narrowing is written rather than asserted: a rule that published a null
  // stake would send a rider to nowhere.
  if (vent.isDeclared && preserve.stakeId !== null) {
    const stakeId = preserve.stakeId;
    rules.push(rule('preserve_vent', 'E10PreserveSystem.update', {
      stake: stakeId,
      warmth: preserve.maxWarmth,
      squallDecayPerSecond: preserve.decayPerSecond,
      decaysOnlyDuring: 'squall',
      action: preserve.stoke.action,
      order: { verb: 'CONTEXT_ACTION', action: 'stoke' },
      goldCost: preserve.stoke.goldCost,
      warmthRestore: preserve.stoke.warmthRestore,
      stokeRadius: preserve.stoke.radius,
      squallsRequiredForSecure: preserve.squallsRequired,
      // Read off the SCHEDULER that owns the number rather than off the vent, which reports the
      // multiplier it has SEEN and has seen none before the run's first tick. One source, and it
      // is the same one `E10PreserveSystem.update` will be handed every step.
      motePressMultiplierDuringSquall: squall.diagnostics.motePressureMultiplier,
      view: 'now.emberShore.preserve',
      lossRule: 'warmth-zero-ends-the-run',
      secureRule: 'vent-alight-and-one-full-squall-survived',
      // Named so a rider reads the TRADE and the clock, not seven numbers.
      consequence: `the last warm vent holds ${preserve.maxWarmth} warmth and loses ${preserve.decayPerSecond} a second for as long as a Static squall blows, and nothing else on this map takes warmth from it. STOKE inside ${preserve.stoke.radius} of the ${stakeId} spends ${preserve.stoke.goldCost} gold for ${preserve.stoke.warmthRestore} warmth. A vent that reaches zero ends the run there and then; a claim cannot be secured at any wave unless the vent is still alight and has ridden out at least ${preserve.squallsRequired} whole squall.`,
      gatesSecure: true,
      damages: false,
    }));
  }

  // --- E6 Atomic. `WrangleSystem` is enabled for the WHOLE epoch (Game.ts:646), which is why
  // its absence blocked all four contracts at once. Derived from the consumer, not the roster.
  if (atomicEpoch(contract)) {
    rules.push(rule('wrangle_wind_down', 'WrangleSystem.register', {
      machines: ['feral_toaster', 'lawn_shepherd'],
      windDownSeconds: Balance.wrangle.windDownSeconds,
      states: ['winding-down', 'exhausted'],
      resetOn: 'any damage to the machine',
    }));
    rules.push(rule('wrangle_exhausted', 'WrangleSystem.isHarmless+movementMultiplier', {
      speedMultiplier: Balance.wrangle.exhaustedSpeedMultiplier,
      stopsHurtingTheHero: true,
      stopsTakingDamage: true,
    }));
    rules.push(rule('wrangle_pen', 'WrangleSystem.tryCapture', {
      captureRadius: Balance.wrangle.captureRadius,
      tickSeconds: Balance.wrangle.penTickSeconds,
      goldPerMachinePerTick: Balance.wrangle.penGoldPerMachine,
      capturableState: 'exhausted',
    }));
    // The load-bearing one. Exhausted machines stop taking damage (and no longer count against the alive cap since the owner-ruled exemption), while the
    // standing-order CAPTURE verb closes the agent-surface loop (c1e89a590, 97–99% absorption).
    // Stating it is the whole point; a silent omission would read as "nothing more to know here".
    rules.push(rule('wrangle_capture', 'AgentGameAdapter', {
      consumerLever: 'WrangleSystem.tryCapture',
      agentOperations: [],
      aliveCap: Balance.waves.aliveCap,
      consequence: 'exhausted machines are undamageable and exempt from the alive cap; capture is reached through the standing-order CAPTURE verb, not a tool',
    }));
  }
  const showroomObjective = ShowroomCaptureObjective.create(contract).diagnostics;
  if (showroomObjective.quota !== null) {
    rules.push(rule('showroom_capture_quota', 'ShowroomCaptureObjective', {
      captureQuota: showroomObjective.quota,
      consumerLever: 'WrangleSystem.tryCapture',
      objective: 'capture quota must be met before the run can secure',
    }));
  }
  if (tile.hollowCrossing) {
    const crossing = tile.hollowCrossing;
    const shelves = crossing.shelfIds.map((id) => tile.buildZones?.find((zone) => zone.id === id)!);
    const extraction = tile.stakeMarkers?.find(({ id }) => id === crossing.extractionStakeId)!;
    rules.push(rule('hollow_crossing', 'HollowCrossingSystem.update', {
      routes: [crossing.causeway, ...crossing.glowBridges].map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })),
      shelves: shelves.map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })),
      extraction: { id: extraction.id, x: extraction.x, z: extraction.z, radius: HOLLOW_EXTRACTION_RADIUS },
      glowDamagePerSecond: HOLLOW_GLOW_DAMAGE_PER_SECOND,
      sequence: 'enter launch shelf, enter one crossing route, reach extraction stake',
    }));
  }
  const e6Tiles = contract.id === 'e6-glow-mesa' ? Balance.e6Tiles : undefined;
  if (e6Tiles) {
    rules.push(rule('decay_field_windows', 'E6TileConsumerSystem.syncPuddle', {
      stages: e6Tiles.puddles.stages,
      unsafeSeconds: e6Tiles.puddles.unsafeSeconds,
      safeSeconds: e6Tiles.puddles.safeSeconds,
      staggerSeconds: e6Tiles.puddles.staggerSeconds,
    }));
    rules.push(rule('night_vein_ring', 'E6TileConsumerSystem.update', {
      harvestRange: e6Tiles.veins.harvestRange,
      harvestSeconds: e6Tiles.veins.harvestSeconds,
      goldPerVein: e6Tiles.veins.goldPerVein,
      daySeconds: e6Tiles.night.daySeconds,
      nightSeconds: e6Tiles.night.nightSeconds,
      harvestableOnlyAtNight: true,
    }));
  }
  if (PicnicHoldSystem.isEnabled(contract)) {
    rules.push(rule('three_stake_hold', 'PicnicHoldSystem.update', {
      stakes: (tile.stakeMarkers ?? []).map(({ id }) => id).sort(),
      radius: PICNIC_HOLD_RADIUS,
      holdSeconds: PICNIC_HOLD_SECONDS,
      defenders: ['standing_structure', 'active_hero'],
      heroActiveDefenseSeconds: PICNIC_ACTIVE_DEFENSE_SECONDS,
      claimRule: 'enemy-present-and-uncontested',
      resetRule: 'timer-resets-without-uncontested-enemy-presence',
      enemyStakePressWeight: PICNIC_STAKE_PRESS_WEIGHT,
      pressureRule: 'weighted-enemies-target-nearest-undefended-stake',
      lossRule: 'all-stakes-claimed',
      secureRule: 'at-least-one-stake-held-at-default-secure-wave',
    }));
  }
  // THE CONTRACT PURSE (owner 2026-09-06, "a per-contract cap override"). Published because the
  // agent view carries `now.gold` but NO cap — a rider cannot see how much its purse holds from
  // the view at all, so an authored purse that is not on the card is invisible until income is
  // silently refused. Absent the twist the rule is absent, and the default is `Balance`'s.
  if (twist.economy?.bankCap !== undefined) {
    rules.push(rule('contract_bank_cap', 'twist.economy.bankCap', {
      bankCap: twist.economy.bankCap,
      defaultBankCap: Balance.economy.bankCap,
      rule: 'income-above-the-purse-is-refused',
    }));
  }
  // THE PER-CONTRACT BEACON LADDER (owner 2026-09-06, "lets adjust the policy so the hard levels
  // can be won"). `buildables[].costs` already carries the prices a rider is charged; this rule
  // exists so a rider can SEE that this claim's prices are authored rather than the usual curve,
  // and can compare the two totals without re-deriving `Balance.beacon` itself. Absent the twist
  // the rule is absent and `buildables[].costs` is the default curve, unchanged.
  if (beaconLadder) {
    // Published over EVERY rung the claim can raise, not just the rungs the field lists: a ladder
    // shorter than `maxCount` holds its last price, so the charge schedule is the honest ladder.
    const rungs = getBuildableDef('sentry_beacon')?.maxCount ?? beaconLadder.length;
    const ladder = Array.from({ length: rungs }, (_, index) => beaconCost(index, beaconLadder));
    const defaultLadder = Array.from({ length: rungs }, (_, index) => beaconCost(index));
    const sum = (prices: readonly number[]): number => prices.reduce((total, price) => total + price, 0);
    rules.push(rule('contract_beacon_ladder', 'twist.economy.beaconLadder', {
      ladder: ladder.map((cost, index) => ({ rung: index + 1, cost, defaultCost: defaultLadder[index] })),
      total: sum(ladder),
      defaultTotal: sum(defaultLadder),
      rule: 'authored-prices-replace-the-default-curve-on-this-claim; buildables[].costs carries the same prices',
    }));
  }
  // THE CLAIM GRIT (owner 2026-09-06, "lets adjust the policy so the hard levels can be won").
  // Published for the same reason the purse is: the view carries `now.hero.maxHp` but no basis, so
  // a rider cannot tell an authored ceiling from three `tinkers_plating` stacks, and on a map where
  // no building reaches the hero the ceiling IS the whole survival budget. Absent the twist the
  // rule is absent, and the default is `Balance`'s.
  if (twist.hero?.maxHpBonus !== undefined) {
    rules.push(rule('contract_hero_grit', 'twist.hero.maxHpBonus', {
      heroMaxHp: Balance.hero.maxHp + twist.hero.maxHpBonus,
      defaultHeroMaxHp: Balance.hero.maxHp,
      maxHpBonus: twist.hero.maxHpBonus,
      rule: 'the-claim-grit-is-added-to-every-actor-ceiling-and-paid-in-hit-points-at-run-start',
    }));
  }
  if (practice) {
    const suppressed = Object.entries(practice)
      .filter(([, value]) => value === false)
      .map(([key]) => key)
      .sort();
    rules.push(rule('ledger_free_practice', 'practice', { suppressed }));
    rules.push(rule('practice_gold_grant', 'practice.goldGrant', { amount: practice.goldGrant }));
    rules.push(rule('drill_wave', 'practice.bellWaveSize', { size: practice.bellWaveSize }));
    rules.push(rule('practice_target_respawn', 'practice.dummyRespawnSeconds', { seconds: practice.dummyRespawnSeconds }));
    rules.push(rule('practice_buildables', 'practice.buildables', { ids: [...practice.buildables].sort() }));
  }

  const waves: MechanicsManifest['posting']['waves'][number][] = [];
  if (practice?.scheduledWaves !== false) {
    if (twist.secureWave !== undefined) waves.push({ event: 'secure', wave: twist.secureWave, source: 'twist.secureWave' });
    if (twist.baron) waves.push({ event: 'baron', wave: twist.baron.wave, source: 'twist.baron.wave' });
  }

  const boilerHouse = twist.pressureEnabled ? getBuildableDef('boiler_house') : undefined;
  const capacitorBank = voltageSocket ? getBuildableDef('capacitor_bank') : undefined;
  const lanternPost = !twist.powerGrid && (mothSocket || twist.lightRamp || twist.dayNightCycle)
    ? getBuildableDef('lantern_post')
    : undefined;
  const decoyShed = mothSocket ? getBuildableDef('decoy_shed') : undefined;
  const registryBuildables = ['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office']
    .filter((id) => !twist.powerGrid || id !== 'turret')
    .map((id) => ({ def: getBuildableDef(id)!, source: 'buildables.registry' as const, meaning: undefined }));
  const practiceBuildables = (practice?.buildables ?? [])
    .filter((id) => !registryBuildables.some(({ def }) => def.id === id))
    .map((id) => ({ def: getBuildableDef(id)!, source: 'practice.buildables' as const, meaning: undefined }));
  const buildables = [
    ...registryBuildables,
    ...practiceBuildables,
    ...(boilerHouse ? [{ def: boilerHouse, source: 'twist.pressureEnabled' as const }] : []),
    ...(capacitorBank ? [{ def: capacitorBank, source: 'twist.powerGrid' as const }] : []),
    ...(lanternPost ? [{
      def: lanternPost,
      source: mothSocket ? 'twist.mothSeason' as const : twist.lightRamp ? 'twist.lightRamp' as const : 'twist.dayNightCycle' as const,
      meaning: mothSocket
        ? `Light radius ${Balance.contracts.nightShift.lanternPostLightRadius}; moth target score is coverage x radius x ${mothSocket.radiusWeight}.`
        : undefined,
    }] : []),
    ...(decoyShed ? [{
      def: decoyShed,
      source: 'twist.mothSeason' as const,
      meaning: `Light radius ${Balance.decoyShed.lightRadius} with target weight ${mothSocket!.decoyWeight}; takes ${mothSocket!.attachDamagePerSecond} damage per attached swarm each second.`,
    }] : []),
  ];
  return {
    schema: 'goldrush.mechanics.v1',
    contractId: contract.id,
    ...(buildables.length > 0 ? {
      buildables: buildables.map(({ def, source, meaning }) => ({
        id: def.id,
        operation: 'BUILD' as const,
        meaning: meaning ?? buildableBlurb(def) ?? '',
        cost: buildableCostAt(def, 0, beaconLadder),
        costs: Array.from({ length: Math.min(def.maxCount, 6) }, (_, index) => buildableCostAt(def, index, beaconLadder)),
        ...((def.id === 'sentry_beacon' || def.id === 'turret') ? { costRule: 'ceil-to-5' as const } : {}),
        maxCount: def.maxCount,
        source,
      })),
    } : {}),
    interactables: interactables(contract),
    rules: rules.map((row) => {
      const entry = entryPacks[contract.id]?.entryLandmark;
      return entry && row.id === entryRuleIds[contract.id]
        ? { ...row, data: { ...row.data, entryLandmark: `This map leads with the ${entry.mountId} landmark.` } }
        : row;
    }).sort(byId),
    modes: (contract.modes ?? []).map((mode) => ({ ...mode })),
    posting: {
      waves: waves.sort((left, right) => left.wave - right.wave || compare(left.event, right.event)),
      spawnEdges: [...tile.lanes.spawnEdges].sort(),
      // `heroStart` was doing two jobs — WHERE THE HERO STARTS and WHICH STAKES END THE RUN — and
      // the picnic is the contract that needed them apart. Under `twist.picnicHold` the loss is
      // `PicnicHoldSystem`'s own rule, "all-stakes-claimed", which reads EVERY `stakeMarkers` entry
      // and never consults `heroStart` — so the two must be read apart here or this manifest tells
      // a rider the wrong stakes. Contract-scoped on the same declaration the system itself is
      // gated on, so no other contract's posting moves (`picnic-hold-contract-scope.test.mjs`
      // holds the key exclusive to `e6-picnic`).
      lossStakes: (tile.stakeMarkers ?? [])
        .filter(({ heroStart }) => heroStart || PicnicHoldSystem.isEnabled(contract))
        .map(({ id, x, z }) => ({ id, x, z, source: 'tileParams.stakeMarkers' as const }))
        .sort(byId),
    },
  };
}

export function mechanicsBuildableIds(source: string | ContractManifest): ReadonlySet<BuildableId> {
  const manifest = deriveMechanicsManifest(typeof source === 'string' ? loadContract(source) : source);
  return new Set((manifest.buildables ?? []).map(({ id }) => id));
}

const IRREGULAR_PLURALS: Readonly<Record<string, string>> = {
  straw_man: 'straw men',
};

export function mechanicsManifestLine(manifest: MechanicsManifest): string {
  const terms = [
    ...manifest.interactables.map(({ id, count }) => count === 1
      ? humanize(id)
      : IRREGULAR_PLURALS[id] ?? `${humanize(id)}s`),
    ...manifest.rules.map(({ id }) => id === 'river' ? 'the river' : humanize(id)),
    ...(manifest.posting.lossStakes.length > 0 ? ['loss stakes'] : []),
  ];
  return `This claim speaks: ${terms.join(', ')}.`;
}

function interactables(contract: ContractManifest): MechanicsManifest['interactables'] {
  const grouped = new Map<string, { count: number; operations: Set<string> }>();
  for (const fixture of contract.tileParams.prePlacedBuildables ?? []) {
    const entry = grouped.get(fixture.id) ?? { count: 0, operations: new Set<string>() };
    entry.count += 1;
    for (const key of Object.keys(fixture)) {
      if (key.endsWith('Cost')) entry.operations.add(toSnakeCase(key.slice(0, -4)));
    }
    if (fixture.wrecked && entry.operations.size === 0) entry.operations.add('repair');
    grouped.set(fixture.id, entry);
  }
  const result: MechanicsManifest['interactables'][number][] = [...grouped]
    .map(([id, { count, operations }]) => ({
      id,
      count,
      operations: [...operations].sort(),
      source: 'tileParams.prePlacedBuildables' as const,
    }));
  if (contract.practice) {
    const stations = new Map<string, { count: number; operations: Set<string> }>();
    for (const station of contract.practice.stations) {
      const entry = stations.get(station.id) ?? { count: 0, operations: new Set<string>() };
      entry.count += 1;
      entry.operations.add(station.op);
      stations.set(station.id, entry);
    }
    result.push(...[...stations].map(([id, { count, operations }]) => ({
      id,
      count,
      operations: [...operations].sort(),
      source: 'practice.stations' as const,
    })));

    const targets = new Map<string, number>();
    for (const target of contract.practice.targets) targets.set(target.kind, (targets.get(target.kind) ?? 0) + 1);
    result.push(...[...targets].map(([kind, count]) => ({
      id: toSnakeCase(kind),
      count,
      operations: ['strike'],
      source: 'practice.targets' as const,
    })));
  }
  return result.sort(byId);
}

/** The manifest is a pure read: it never touches a profile, so its consumer gets bare ground. */
const MANIFEST_TILE_STORAGE = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

function rule(id: string, source: string, data: Readonly<Record<string, MechanicValue>> = {}): MechanicsManifest['rules'][number] {
  return { id, source, data };
}

/** Game.ts:646 gates wrangle on the EPOCH, not the contract — so the manifest must too. */
function atomicEpoch(contract: ContractManifest): boolean {
  return listEpochs().some((meta) => meta.id === 'epoch-6-atomic'
    && loadEpoch(meta.id).contracts.some(({ id }) => id === contract.id));
}

function humanize(id: string): string {
  return id.replaceAll('_', ' ');
}

function toSnakeCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replaceAll('-', '_').toLowerCase();
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return compare(left.id, right.id);
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

import glowMesaEntryPack from '../../assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json' with { type: 'json' };
import deadBandEntryPack from '../../assets/pilots/map-rebuild-spike/dead-band-terrain-contract.json' with { type: 'json' };
import farSideEntryPack from '../../assets/pilots/map-rebuild-spike/far-side-terrain-contract.json' with { type: 'json' };
import halfLifeHollowEntryPack from '../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json' with { type: 'json' };
import relayRushEntryPack from '../../assets/pilots/map-rebuild-spike/relay-rush-terrain-contract.json' with { type: 'json' };
const entryPacks: Readonly<Record<string, { contractId: string; entryLandmark?: { mountId: string } }>> = {
  'e6-glow-mesa': glowMesaEntryPack,
  'e7-dead-band': deadBandEntryPack,
  'e8-far-side': farSideEntryPack,
  'e6-half-life-hollow': halfLifeHollowEntryPack,
  'e7-relay-rush': relayRushEntryPack,
};
const entryRuleIds: Readonly<Record<string, string>> = {
  'e6-glow-mesa': 'night_vein_ring',
  'e7-dead-band': 'signal_suppression',
  'e8-far-side': 'probe_recovery',
  'e6-half-life-hollow': 'hollow_crossing',
  'e7-relay-rush': 'interference_front',
};
