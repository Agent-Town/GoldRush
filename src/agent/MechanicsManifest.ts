import { listEpochs, loadContract, loadEpoch, type ContractEscortMode, type ContractManifest } from '../meta/ContractFamilies';
import { Balance } from '../game/Balance';
import { buildableBlurb, getBuildableDef } from '../game/buildables';

type MechanicValue = boolean | number | string | readonly string[];

export type MechanicsManifest = {
  schema: 'goldrush.mechanics.v1';
  contractId: string;
  buildables?: readonly {
    id: string;
    operation: 'BUILD';
    meaning: string;
    cost: number;
    maxCount: number;
    source: 'twist.pressureEnabled' | 'twist.powerGrid' | 'twist.mothSeason';
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
      mothsPerLightPerWave: mothSocket.mothsPerLightPerWave,
      minimumMoths: 2,
      minimumDarkness: 0.5,
      count: 'max(2,floor(max(1,lightSources)*mothsPerLightPerWave))',
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
  // --- E5 Deepwater. Gated exactly as the browser gates it: `createDeepwaterClaimTile` returns a
  // consumer only for the flagship, so only the flagship gets the vocabulary. The three variants
  // declare their own consumer `missing` and must stay silent (reject-don't-stretch).
  const deepwater = contract.id === 'e5-deepwater-claim' ? tile.deepwater : undefined;
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
      replacesScheduledWaves: true,
    }));
    rules.push(rule('deepwater_arsenal', 'DeepwaterArsenal.update', {
      deckBuildables: ['sentry_beacon', 'turret'],
      weapons: ['depthChargeLobber', 'depthChargeRack', 'harpoonBallista'],
      sharedMunition: Balance.e5Arsenal.depthChargeMunition.id,
      munitionCapacity: Balance.e5Arsenal.depthChargeMunition.capacity,
      sealedInDiveZone: true,
    }));
    // NOT sourced to `tileParams.deepwater.wrecks`: raw data is not a mechanic. The wreck field
    // is only meaningful through the consumer that anchors on it, and that consumer cannot exist
    // outside a browser — so the row names the gap instead of dressing the data up as coverage.
    rules.push(rule('deepwater_boss_socket_absent', 'DredgeQueenBossSystem', {
      wreckSites: deepwater.wrecks.length,
      eras: deepwater.wrecks.map(({ era }) => era).sort(),
      bossWave: twist.baron?.wave ?? 0,
      blocker: 'labelSprite/counterSprite call document.createElement from instance field initializers',
      consequence: 'the contract has no reachable secure condition headlessly',
    }));
    // The manifest must not imply an agent can work the boat: `AgentGameAdapter` carries
    // BUILD/PAN/REPAIR only. The levers exist on the consumer and not on the agent surface.
    rules.push(rule('deepwater_levers_unreachable', 'AgentGameAdapter', {
      consumerLevers: ['ClaimBoat.placeBuilding', 'ClaimBoat.reanchor'],
      agentOperations: [],
      reason: 'no boat-build or reanchor verb exists on the agent tool surface',
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
    // The load-bearing one. An exhausted machine can be neither killed nor captured by an agent,
    // and it still counts against the spawn cap — so the epoch's loop cannot close from the
    // agent surface as it stands. Stating it is the whole point; a silent omission would read
    // as "nothing more to know here".
    rules.push(rule('wrangle_capture_unreachable', 'AgentGameAdapter', {
      consumerLever: 'WrangleSystem.tryCapture',
      agentOperations: [],
      aliveCap: Balance.waves.aliveCap,
      consequence: 'exhausted machines are undamageable and uncapturable, and hold spawn slots',
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
  const lanternPost = mothSocket ? getBuildableDef('lantern_post') : undefined;
  const decoyShed = mothSocket ? getBuildableDef('decoy_shed') : undefined;
  const buildables = [
    ...(boilerHouse ? [{ def: boilerHouse, source: 'twist.pressureEnabled' as const }] : []),
    ...(capacitorBank ? [{ def: capacitorBank, source: 'twist.powerGrid' as const }] : []),
    ...(lanternPost ? [{
      def: lanternPost,
      source: 'twist.mothSeason' as const,
      meaning: `Light radius ${Balance.contracts.nightShift.lanternPostLightRadius}; moth target score is coverage x radius x ${mothSocket!.radiusWeight}.`,
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
