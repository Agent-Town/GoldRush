import { listEpochs, loadContract, loadEpoch, type ContractEscortMode, type ContractManifest } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';
import { FLOCK_SPEED_MULT, LANE_SPACING_RADII } from '../systems/CrowdFlockSystem';
import { buildableBlurb, getBuildableDef, type BuildableId } from '../game/buildables';
import { PicnicHoldSystem, PICNIC_ACTIVE_DEFENSE_SECONDS, PICNIC_HOLD_RADIUS, PICNIC_HOLD_SECONDS, PICNIC_STAKE_PRESS_WEIGHT } from '../systems/PicnicHoldSystem';
import { DEBRIS_DAMAGE_PER_SECOND, DEBRIS_SPEED_SCALE, DRIFT_CONTROL_SCALE, LowOrbitSystem } from '../systems/LowOrbitSystem';
import { INTERFERENCE_MUTED_REASON, InterferenceFrontSystem, POWERED_RELAY_KINDS } from '../systems/InterferenceFrontSystem';
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
import { deepwaterStormDrivesWaves } from '../world/DeepwaterClaimTile';
import { ShowroomCaptureObjective } from '../systems/ShowroomCaptureObjective';
import { HOLLOW_EXTRACTION_RADIUS, HOLLOW_GLOW_DAMAGE_PER_SECOND } from '../systems/HollowCrossingSystem';

/** The public verb a rider uses to lift the probe, named once so the manifest cannot drift. */
const PROBE_RECOVER_ACTION = 'recover';
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
      anchors: deepwater.claimBoat.anchors.map(({ id }) => id).sort(),
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
      rules.push(rule('regatta_race', 'RegattaRaceSystem.advance+movementMultiplierAt', {
        gates: tile.raceCourse.beacons.map(({ id }) => id),
        finish: tile.stakeMarkers?.find(({ heroStart }) => heroStart)?.id ?? '',
        gateRadiusFallback: 6,
        fastWaterZone: tile.raceCourse.fastWaterZone.id,
        fastWaterMultiplier: 1.35,
        deadlineWave: twist.secureWave ?? 0,
        competingRacerLoot: false,
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
    // standing-order CAPTURE verb closes the agent-surface loop (9f920a2f6, 97–99% absorption).
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
  if (PicnicHoldSystem.isEnabled(tile.stakeMarkers ?? [])) {
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
        cost: def.costCurve(0),
        costs: Array.from({ length: Math.min(def.maxCount, 6) }, (_, index) => def.costCurve(index)),
        ...((def.id === 'sentry_beacon' || def.id === 'turret') ? { costRule: 'ceil-to-5' as const } : {}),
        maxCount: def.maxCount,
        source,
      })),
    } : {}),
    interactables: interactables(contract),
    rules: rules.sort(byId),
    modes: (contract.modes ?? []).map((mode) => ({ ...mode })),
    posting: {
      waves: waves.sort((left, right) => left.wave - right.wave || compare(left.event, right.event)),
      spawnEdges: [...tile.lanes.spawnEdges].sort(),
      lossStakes: (tile.stakeMarkers ?? [])
        .filter(({ heroStart }) => heroStart)
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
