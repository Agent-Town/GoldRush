import * as THREE from 'three';

const WAVE_SPAWN_EDGES = ['north', 'south', 'east', 'west'] as const;
const TERRITORY_RING_SIDES = [-1, 1] as const;

export const Balance = {
  hero: {
    maxHp: 100,
    speed: 6.0,
    accel: 20,
    decel: 28,
    iframes: 0.5,
    radius: 0.5,
  },
  actors: {
    enabled: false,
  },
  persistence: {
    tileStateMaxBytes: 32 * 1024,
    greenWaypointRadius: 3,
  },
  enemy: {
    poolSize: 96,
    hp: 25.2,
    speed: 2.7,
    speedVariance: 0.1,
    contactDamage: 8,
    contactCooldown: 0.8,
    touchRadius: 0.6,
    separationRadius: 1.15,
    separationRadiusSq: 1.15 * 1.15,
    separationStrength: 0.9,
    formationSpreadWidth: 1.2,
    formationSeparationStrength: 1,
    spatialHashCellSize: 2,
    spatialHashWorldMin: -40,
    spatialHashWorldMax: 40,
    debugPackSize: 5,
    debugPackRadius: 3.2,
    groundY: 0.05,
  },
  combatReadability: {
    enemyFlashSeconds: 0,
    enemyFlashIntensity: 0,
    turretPulseSeconds: 0.18,
    turretPulseIntensity: 0.14,
  },
  legibility: {
    feveredColor: '#ffd56a',
    feveredRestStrength: 0.58,
    feveredSurgeStrength: 0.9,
    feveredPulseStrength: 0.08,
    feveredPulseSpeed: 3.2,
    feveredOverlayOpacity: 0.44,
    feveredOverlayScale: 1.055,
    freedRunDelaySeconds: 0.08,
    freedAvoidRadius: 3.2,
    freedAvoidBias: 5,
    freedTint: '#b8b29f',
    freedAccentColor: '#ffe4a0',
    freedFloatColor: '#ffe4a0',
    freedFloatLimit: 4,
  },
  waves: {
    graceSeconds: 5,
    trickleInterval: 2.4,
    trickleDecay: 0.97,
    trickleDecayEvery: 10,
    trickleFloor: 0.8,
    waveInterval: 30,
    pulseBase: 3,
    pulsePerWave: 3,
    kneeWave: 10,
    kneeSharpness: 8,
    budgetCeiling: 38, // task-047 late valve; old 42.
    lullSeconds: 8,
    lullFloor12: 8,
    pulsesPerWave: 2,
    edgesPerPulse: 2,
    spawnEdges: WAVE_SPAWN_EDGES,
    territoryRingBiasWaves: 3,
    territoryRingLaneBias: 0.75,
    hpScalePerWave: 1.115, // task-047 late valve; old 1.12.
    speedScalePerWave: 1.02,
    speedScaleCap: 1.3,
    aliveCap: 60,
    spawnRingRadius: 26,
    pressureBudgetShared: true,
  },
  pathing: {
    riverBlocksEnemies: true,
    deepWaterDisarmsHero: true,
    stuckWatchdogSeconds: 3,
    stuckWatchdogDisplacement: 0.4,
  },
  waterMask: {
    segmentEpsilon: 0.000001,
  },
  convoy: {
    spacing: 3,
    catchupMultiplier: 1.25,
  },
  e4Orbit: {
    radius: 24,
    angularSpeed: Math.PI / 6,
    lapsBeforePeel: 0.5,
    peelSpeed: 8,
    telegraphSeconds: 2,
  },
  e4Road: {
    halfWidth: 1.5,
    friendlySpeedMultiplier: 2.5,
    friendlyFuelMultiplier: 0.4,
    enemyRouteCostMultiplier: 0.25,
  },
  weather: {
    cycleSeconds: 30,
    clearSeconds: 6,
    telegraphSeconds: 4,
    stormSeconds: 12,
    stormMovementMultiplier: 0.7,
    stormVisibilityMultiplier: 0.55,
    hazeColor: '#c99052',
    hazeStrength: 0.2,
  },
  e5: {
    waterTile: {
      id: 'shelf-reefs-dev',
      size: 128,
      regions: [
        { id: 'open-water', minX: -64, maxX: 64, minZ: -64, maxZ: 64, depth: 0, depthClass: 'surface', travel: ['swim', 'boat'] },
        { id: 'lagoon-shallows', minX: -42, maxX: 42, minZ: 18, maxZ: 44, depth: -1, depthClass: 'shallows', travel: ['swim', 'boat'] },
        { id: 'reef-ring', minX: -48, maxX: 48, minZ: -8, maxZ: 8, depth: -2, depthClass: 'reef', travel: ['depth'] },
        { id: 'reef-gap', minX: -5, maxX: 5, minZ: -8, maxZ: 8, depth: -2, depthClass: 'reef', travel: ['boat', 'depth'] },
        { id: 'wreck-shelf', minX: -48, maxX: 48, minZ: -42, maxZ: -14, depth: -4, depthClass: 'wreck', travel: ['boat', 'depth'] },
        { id: 'trench-edge', minX: -64, maxX: 64, minZ: -64, maxZ: -50, depth: -8, depthClass: 'trench', travel: [] },
      ],
    },
    claimBoat: {
      id: 'claim-boat',
      initialAnchorId: 'lagoon',
      anchors: [
        { id: 'lagoon', x: 0, z: 30 },
        { id: 'open-water', x: -24, z: 12 },
      ],
      pads: [
        { id: 'bow', x: 0, z: -3 },
        { id: 'port', x: -3, z: 1 },
        { id: 'starboard', x: 3, z: 1 },
      ],
    },
    weather: {
      cycleSeconds: 24,
      clearSeconds: 5,
      telegraphSeconds: 3,
      stormSeconds: 10,
      stormMovementMultiplier: 0.72,
      stormVisibilityMultiplier: 0.58,
      hazeColor: '#335f64',
      hazeStrength: 0.28,
    },
  },
  decay: {
    clockAuraFactor: 0.9,
  },
  e6Tiles: {
    puddles: {
      unsafeSeconds: 8,
      safeSeconds: 6,
      staggerSeconds: 4,
      stages: 3,
      height: 0.04,
      activeColor: '#83ded7',
      safeColor: '#4f756e',
      activeOpacity: 0.55,
      safeOpacity: 0.16,
      emissiveIntensity: 0.5,
    },
    night: { daySeconds: 8, nightSeconds: 12 },
    veins: {
      harvestRange: 1.5,
      harvestSeconds: 0.75,
      goldPerVein: 4,
      radius: 0.34,
      visualHeight: 0.34,
      dormantColor: '#507975',
      activeColor: '#83ded7',
      dormantEmissiveIntensity: 0.08,
      activeEmissiveIntensity: 0.85,
    },
  },
  e6Roster: {
    mixes: {
      standard: [
        { waveMin: 1, ids: ['feral_toaster'] },
        { waveMin: 2, ids: ['feral_toaster', 'lawn_shepherd'] },
        { waveMin: 4, ids: ['feral_toaster', 'lawn_shepherd', 'glowjack'] },
      ],
      halfLifeHollow: [
        { waveMin: 1, ids: ['feral_toaster'] },
        { waveMin: 2, ids: ['feral_toaster', 'glowjack'] },
        { waveMin: 4, ids: ['feral_toaster', 'glowjack', 'lawn_shepherd'] },
      ],
    },
    variants: {
      feral_toaster: { hpScale: 0.75, speedMult: 1.18, visualScale: 0.45, contactDamageScale: 0.75, tint: '#d98d45' },
      lawn_shepherd: { hpScale: 1.35, speedMult: 0.86, visualScale: 0.65, contactDamageScale: 0.85, tint: '#63b7a5' },
      glowjack: { hpScale: 0.95, speedMult: 1.08, visualScale: 1, contactDamageScale: 0.8, tint: '#8ebf96', thief: true },
    },
    herdDrive: { radius: 8, strength: 0.45 },
  },
  wrangle: {
    windDownSeconds: 8,
    exhaustedSpeedMultiplier: 0.2,
    captureRadius: 2.2,
    penTickSeconds: 15,
    penGoldPerMachine: 1,
  },
  agent: {
    homeX: -1.8,
    homeZ: 10.7,
    groundY: 0.06,
    spriteScale: 2.24,
    hoverFps: 4,
    moveSpeed: 4.8,
    arriveRadius: 0.16,
    idleBobAmplitude: 0.045,
    idleBobHz: 0.42,
    workBobAmplitude: 0.12,
    workSeconds: 0.9,
    surveyFirstSeconds: 7,
    surveyCooldownSeconds: 19,
    xpMoteAgeS: 4,
    priorityChaseMark: 40,
    priorityRepair: 30,
    priorityCollectXp: 20,
    priorityPanAtCombat: 10,
  },
  sparkRig: {
    fireRate: 2.0,
    damage: 12,
    range: 10,
    boltSpeed: 18,
    boltRadius: 0.25,
    boltLife: 1.2,
    volley: 1,
    leading: true,
    maxLeadRad: 3,
    missSwitchCount: 4,
  },
  blast: {
    aimMode: 'cursor',
    damage: 20,
    dmgPerWave: 0.28,
    radius: 2.2,
    cooldown: 2.5,
    airTime: 0.7,
    range: 10,
    pool: 8,
    volley: 1,
  },
  steamworksArsenal: {
    boilerLance: { damage: 5, range: 7, fireRate: 5, boltSpeed: 16, pressureCost: 1 },
    pressureMortar: { damage: 34, radius: 2.7, range: 12, cooldown: 3.2, airTime: 0.85, pressureCost: 8 },
    skyRocket: { damage: 18, radius: 2.25, range: 13, cooldown: 4.5, airTime: 1, volley: 3, pressureCost: 12 },
    autoPan: { panTickMult: -0.25, pressurePerSecond: 2 },
    boilerBatteryBands: { low: 1, working: 1.2, high: 1.45 },
  },
  e5Arsenal: {
    harpoonBallista: { damage: 8, range: 14, cooldown: 1.4, boltSpeed: 22, silhouetteHeight: 1.1 },
    depthChargeMunition: { id: 'depth_charge', capacity: 12, damage: 12, radius: 2.8, airTime: 0.65 },
    depthChargeRack: { range: 12, cooldown: 2.8 },
    depthChargeLobber: { range: 9, cooldown: 2.2 },
    treatmentEventHistory: 64,
  },
  e6Arsenal: {
    sunlineBeam: { damage: 16, range: 13, cooldown: 0.7, boltSpeed: 32, visualSeconds: 0.16 },
    sunlineMount: { damage: 24, range: 18, cooldown: 1.15, boltSpeed: 36, silhouetteHeight: 1.1, mirrorRadius: 0.22 },
    halfLifeCaltrops: {
      pool: 3,
      radius: 2.8,
      slowMultiplier: 0.42,
      durationTicks: 240,
      cooldown: 6,
      triggerRange: 7,
      overlapRadius: 2.2,
      dialHeight: 0.12,
      dialRadius: 0.42,
      spikes: 8,
    },
    tongsThrown: { damage: 48, radius: 3, range: 12, cooldown: 3.4, airTime: 0.72, arcHeight: 1.45, tongsLength: 0.72 },
  },
  e9Arsenal: {
    weather: {
      era: 9,
      contractId: 'e9-dome-basin',
      cycleSeconds: 12,
      clearSeconds: 2,
      telegraphSeconds: 1,
      stormSeconds: 8,
      stormMovementMultiplier: 0.82,
      stormVisibilityMultiplier: 0.72,
      hazeColor: '#b96d4f',
      hazeStrength: 0.16,
      chargePerSecond: 10,
      chargeCapacity: 30,
    },
    stormDraw: { damage: 28, range: 14, cooldown: 0.62, boltSpeed: 34, chargeCost: 2, visualSeconds: 0.16 },
    stormLance: {
      damage: 38,
      range: 19,
      cooldown: 0.95,
      boltSpeed: 38,
      chargeCost: 3,
      silhouetteHeight: 1.1,
      previousTurretSilhouetteHeight: 1.1,
      lensRadius: 0.24,
    },
    stormFence: {
      pool: 3,
      radius: 3.2,
      slowMultiplier: 0.38,
      pushPerSecond: 2.4,
      durationSeconds: 8,
      overlapRadius: 2.4,
      postHeight: 0.9,
    },
    terraformCannon: { damage: 56, radius: 3.4, range: 13, cooldown: 2.6, airTime: 0.9, arcHeight: 1.8, clodRadius: 0.3 },
  },
  e9Canal: {
    stage: {
      holdSeconds: 1.25,
      holdRadius: 2.4,
      contestRadius: 4.5,
      progressDecayPerSecond: 0.8,
      payouts: [12, 18, 24],
      postHeight: 1.2,
      postSpacing: 1.25,
      dryColor: '#76503b',
      activeColor: '#d9a441',
      completeColor: '#5b8a8a',
    },
    quarry: {
      nodeCount: 4,
      harvestRange: 1.35,
      harvestSeconds: 0.65,
      slowSpeed: 0.2,
      progressDecayPerSecond: 1.25,
      payout: 5,
      packWidth: 0.8,
      packHeight: 0.42,
      packDepth: 0.58,
      color: '#b8e3e8',
      emissive: '#44777d',
    },
    dustDevil: {
      weather: {
        era: 9,
        contractId: 'e9-dome-basin',
        cycleSeconds: 18,
        clearSeconds: 3,
        telegraphSeconds: 3,
        stormSeconds: 10,
        stormMovementMultiplier: 0.82,
        stormVisibilityMultiplier: 0.72,
        hazeColor: '#b96d4f',
        hazeStrength: 0.16,
      },
      radius: 4,
      pushPerSecond: 6,
      columnHeight: 4.6,
      columnRadius: 0.9,
      color: '#b46f43',
      telegraphColor: '#e0b35d',
    },
    canal: {
      waterWidth: 1.15,
      waterDepth: 0.035,
      color: '#4f9ca2',
      opacity: 0.78,
    },
  },
  e10Finale: {
    reinkSeconds: 2.4,
    offerDelaySeconds: 0.5,
  },
  e10Static: {
    arrivalZ: 36,
    approachSeconds: 4,
    meaningDrainPerSecond: 0.12,
    restorePerInteraction: 1,
    preserveWindowSeconds: 8,
    recessionHoldSeconds: 3,
    recessionDecayPerSecond: 0.25,
    maxGrayscale: 0.92,
    minMusicGain: 0.12,
    auraRadius: 18,
    auraRingWidth: 0.55,
    auraColor: '#ddd8cc',
    heartRadius: 2.2,
    heartHeight: 4.2,
    heartColor: '#f1eee5',
    siteMarkerHeight: 1.2,
    siteMarkerRadius: 0.42,
    siteHeldColor: '#d6a84c',
    sitePressedColor: '#77736d',
    moteRadius: 0.14,
    moteHeight: 0.8,
  },
  e7Arsenal: {
    playbookSparkRig: { damage: 12, range: 10, fireRate: 2, boltSpeed: 18, volley: 1 },
    beamRelay: { damage: 26, range: 18, fireRate: 0.8, boltSpeed: 22, silhouetteHeight: 1.1, ringInner: 0.24, ringOuter: 0.34 },
    signalJammer: { damage: 8, range: 9, fireRate: 1.25, boltSpeed: 14, deployOffsetX: 1.5, deployOffsetZ: 0.8, bodyRadius: 0.32, bodyHeight: 0.58 },
    reportRocket: { damage: 36, radius: 2.8, range: 14, cooldown: 3.5, airTime: 0.9, volley: 1 },
  },
  e7Playbook: {
    shelfCapacity: 24,
    requiredPermissionLevel: 2,
  },
  e7Signal: {
    linkRange: 28,
    coverageRadius: 30,
    midpointJackCount: 3,
  },
  e7Boss: {
    arriveWave: 12,
    dreadWaves: 1,
    dreadStutterIntervalSeconds: 0.5,
    adaptationSeconds: 4,
    pressureIntervalSeconds: 1.5,
    pressureDamageBase: 2,
    pressureDamagePerTurret: 2,
    pressureDamagePerPatrol: 1,
    replayPatternDamage: 2,
    patternConfidence: 60,
    familiarConfidenceDamage: 4,
    novelConfidenceDamage: 24,
    mirrorOffsetZ: 34,
    mirrorApproachScale: 0.45,
    perimeterStartRadius: 4,
    perimeterEndRadius: 18,
    perimeterLift: 0.06,
    perimeterSpin: 0.18,
    copyWidth: 0.9,
    copyHeight: 1.4,
    copyDepth: 0.9,
    copyColor: '#74d8d0',
    copyEmissive: '#2a8f8a',
    copyOpacity: 0.58,
    jarX: 0,
    jarZ: -4,
    jarHeight: 1.1,
    jarGlassColor: '#f1dca5',
    jarMoteColor: '#83ded7',
    jarMoteBobSpeed: 2.4,
    jarMoteBobHeight: 0.16,
  },
  e8Arsenal: {
    sunlineBeam: { damage: 9, range: 11, fireRate: 3, boltSpeed: 24 },
    kineticLobber: { damage: 28, radius: 2.4, range: 15, cooldown: 3.4, airTime: 1.68 },
    magnetGrapple: { range: 12, cooldown: 2.8, boltSpeed: 24, pullDistance: 2.2, collisionRadius: 1.1, staggerSeconds: 0.35 },
    breachSeal: { maxActive: 4, placeRadius: 6 },
    lensTurret: { damageMult: 1.2, fireRateMult: 1.15, silhouetteHeight: 1.1 },
  },
  e8Physics: {
    floatyThrustResponsePerSecond: 4,
    floatyDriftResponsePerSecond: 1.4,
    freeFallThrustResponsePerSecond: 1.6,
    freeFallDriftResponsePerSecond: 0.08,
    zeroGravityLobArcDistanceMultiplier: 4.8,
    knockbackScalePerLostG: 0.75,
  },
  xp: {
    perKill: 4,
    moteMagnetRadius: 2,
    motePool: 64,
    expiryBanks: true,
    needBase: 12,
    needStep: 8,
  },
  projectile: {
    pool: 128,
    turretLobMinAirTime: 0.1,
  },
  beacon: {
    costBase: 25,
    costGrowth: 1.3,
    maxCount: 6,
    // Wave-18 correction: 10 base + 0.75/wave keeps two beacons relevant at wave 10
    // without changing targeting or hero Spark Rig damage.
    damage: 10,
    damagePerWave: 0.75,
    fireRate: 1.2,
    range: 8,
    boltSpeed: 14,
    volley: 1,
    placeRadius: 6,
    overlapRadius: 1.2,
    gridSnap: 1,
  },
  turret: {
    costBase: 50,
    costGrowth: 1.35,
    maxCount: 4,
    damage: 52,
    fireRate: 1.1,
    range: 16,
    boltSpeed: 16,
    volley: 1,
    placeRadius: 6,
    overlapRadius: 1.2,
    gridSnap: 1,
  },
  lanternPost: {
    cost: 15,
    maxCount: 8,
    lightRadius: 7,
    placeRadius: 6,
    overlapRadius: 0.9,
  },
  decoyShed: {
    cost: 20,
    maxCount: 3,
    lightRadius: 11,
    placeRadius: 6,
    overlapRadius: 1.35,
  },
  palisade: {
    cost: 10,
    maxCount: 48,
    width: 1,
    depth: 3,
    overlapRadius: 1,
    avoidancePad: 0.68,
    slideBias: 0.82,
  },
  sluice: {
    cost: 40,
    maxCount: 3,
    riverPad: 2,
    cycleSeconds: 5,
    goldPerCycle: 3,
    contestedRadius: 6,
  },
  stockpile: {
    cost: 60,
    maxCount: 2,
    capBonus: 150,
  },
  boilerHouse: {
    cost: 70,
    maxCount: 3,
    coalPerSeam: 4,
    coalHarvestRange: 1.35,
    coalHarvestSeconds: 0.8,
    coalSeconds: 12,
    tickSeconds: 1,
    pressurePerTick: 4,
    safeMin: 25,
    safeMax: 80,
    ventLoss: 35,
    ventCooldownSeconds: 3,
  },
  // Placeholder-tunable until the Canyon Works tile owns authored structures.
  e3Power: {
    generationWatts: 5,
    consumerDrawWatts: { lamp: 3, tram: 4, turret: 6 },
    spanCost: 10,
    storage: {
      capacityWh: 0.05,
      chargeWatts: 18,
      dischargeWatts: 12,
      cost: 75,
      maxCount: 4,
      hp: 70,
      overlapRadius: 0.9,
      placeRadius: 3,
    },
  },
  crawler: {
    flickerSeconds: 0.5,
    drainWatts: 18,
    burstIntervalSeconds: 4,
    burstDialSeconds: 1,
    burstDamage: 18,
    burstRadius: 5,
    overchargeSeconds: 10,
    turretFireRateMult: 2,
  },
  landYacht: {
    dreadSeconds: 2,
    lootIntervalSeconds: 2,
    derrickRadius: 28,
    craneReach: 6,
    craneGrabCooldownSeconds: 1.5,
  },
  dredgeQueen: {
    approachSeconds: 3,
    componentHp: { claw: 80, paddle: 110, hold: 140 },
    clawCycleSeconds: 2.5,
    lootUnits: 5,
    lootGoldPerUnit: 8,
    paddlesRequired: 2,
    repositionEveryCycles: 2,
    repositionSpeed: 10,
    swatIntervalSeconds: 2.5,
    swatTelegraphSeconds: 0.8,
    swatRadius: 5,
    swatDamage: 12,
    spillRadius: 8,
    escortAct2Multiplier: 2,
    escortAct2Reinforcements: 3,
    escortExitSpeed: 12,
  },
  homemaker: {
    arrivalSpeed: 18,
    componentHp: { vac: 100, rack: 90, core: 160 },
    unbuildIntervalSeconds: 2.5,
    partsStackCap: 12,
    rackIntervalSeconds: 2.4,
    rackTelegraphSeconds: 0.7,
    rackRadius: 3.5,
    rackDamage: 10,
    rackAct2CadenceMult: 0.55,
    rackAct2DamageMult: 1.5,
    pileSpeed: 8,
    pileSpacing: 3,
  },
  oldDigger: {
    arriveWave: 2,
    hp: 4000,
    hpFloorPct: 0.25,
    conventionalDamageMult: 0.05,
    surveySpeed: 2.4,
    unmakeRadius: 3.2,
    unmakeIntervalSeconds: 1.2,
    boardRadius: 4.5,
    deckClimbSeconds: 6,
    hazardIntervalSeconds: 2.5,
    hazardDamage: 6,
    droneCount: 2,
    droneRespawnSeconds: 8,
    droneHpScale: 0.8,
    readSeconds: 2.5,
    reDigSpeed: 4,
  },
  salvageClaw: {
    arriveWave: 8,
    dreadWaves: 2,
    theftIntervalSeconds: 1.5,
    tagCap: 8,
    grappleHp: 70,
    winchHp: 130,
    feetHp: 180,
    corsairCount: 3,
    orbitHeight: 12,
    winchHeight: 3.5,
    descentSeconds: 2.5,
    debrisIntervalSeconds: 2.5,
    debrisTelegraphSeconds: 1,
    debrisDamage: 6,
    liftSeconds: 4,
    liftCooldownSeconds: 1.5,
    liftHeight: 8,
    dropDamage: 18,
    crewQuitSeconds: 3,
  },
  e4Fuel: {
    capacity: 24,
    nodePositions: [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }],
    harvestRange: 1.35,
    harvestSeconds: 0.5,
    tarPerNode: 3,
    refineSeconds: 0.25,
    fuelPerTar: 4,
    vehicleSpeed: 9,
    burnPerSecond: 3,
    arriveRadius: 0.05,
  },
  assayOffice: {
    cost: 80,
    maxCount: 1,
    interactRadius: 1.8,
  },
  steal: {
    share: 0.25,
    minWave: 3,
    grabAmount: 10,
    grabSeconds: 0.8,
    fleeSpeedMult: 1.35,
    grabRadius: 0.9,
    pickupCap: 24,
    maxConcurrent: 2,
    maxConcurrentPerWaves: 6,
    maxConcurrentCap: 4,
    reclaimStockpileBonus: 0.25,
    pingSeconds: 3,
  },
  repair: {
    pctOfCost: 0.25,
    capPctOfCost: 0.4,
  },
  demolish: {
    refundPctOfCost: 0.5,
    interactRadius: 1.6,
  },
  tiers: {
    palisade: [
      { cost: 0, maxHpMult: 1 },
      { cost: 90, maxHpMult: 1.75 },
      { cost: 250, maxHpMult: 3.1 },
    ],
    sluice: [
      { cost: 0, panRateMult: 1, yieldMult: 1 },
      { cost: 120, panRateMult: 1.35, yieldMult: 1.7 },
      { cost: 240, panRateMult: 2.15, yieldMult: 3.1 }, // task-047; old 320 / 1.9 / 2.7.
    ],
    turret: [
      { cost: 0, damageMult: 1, fireRateMult: 1 },
      { cost: 150, damageMult: 1.4, fireRateMult: 1.18 },
      { cost: 300, damageMult: 1.9, fireRateMult: 1.35 }, // task-047; old 400.
    ],
  },
  wreck: {
    hp: {
      sentry_beacon: 40,
      palisade: 60,
      sluice: 40,
      stockpile: 80,
      boiler_house: 80,
      turret: 50,
      assay_office: 60,
      lantern_post: 35,
      decoy_shed: 120,
      capacitor_bank: 70,
    },
    hpWaveScale: {
      sentry_beacon: {
        perWave: 6,
        startWave: 6,
        capMult: 4,
      },
      palisade: {
        perWave: 8,
        startWave: 6,
        capMult: 5,
      },
      sluice: {
        perWave: 6,
        startWave: 6,
        capMult: 4,
      },
      stockpile: {
        perWave: 8,
        startWave: 6,
        capMult: 4,
      },
      turret: {
        perWave: 8,
        startWave: 6,
        capMult: 3,
      },
    },
    damage: 8,
    gnawMult: 0.25,
    hitCooldown: 0.9,
    reach: 1.1,
    share: 0.25,
    pulseEvery: 2,
    minWave: 4,
    maxPerEdgeWave20: 2,
    repairSeconds: 1.2,
    repairCostFrac: 0.3,
    repairRadius: 1.4,
  },
  economy: {
    logCapacity: 2048,
    bankCap: 200,
  },
  run: {
    secureWave: 20,
  },
  meta: {
    victoryPayout: {
      territory: 1,
      science: 1,
      hero: 1,
      agent: 1,
    },
    territoryTier1: 1,
    territoryRingGapHalfWidth: 1.5,
    territoryRing: WAVE_SPAWN_EDGES.flatMap((edge) => TERRITORY_RING_SIDES.map((side) => ({ edge, side }))),
  },
  upgrades: {
    assayGoldPerWave: 5,
    fieldDressingHealFrac: 0.3,
    doubleTapCoilMaxStacks: 6,
  },
  research: {
    assayGradingStockpileCapBonus: 35,
    assayGradingProspectingOfferWeightBonus: 1.25,
    secondOrderSlots: 2,
  },
  contracts: {
    escortCart: {
      hp: 180,
      speed: 2.4,
      stopHpRatio: 0.5,
      repairSeconds: 2,
      repairRadius: 2.6,
      enemyPreferenceRange: 18,
    },
    dryGulch: {
      seamYieldMult: 1.4,
    },
    nightShift: {
      duskWave: 5,
      darkWave: 10,
      dawnWave: 25,
      duskDarkness: 0.62,
      darkDarkness: 1,
      minLight: 0.045,
      lightFalloff: 1.25,
      renderVisibilityCutoff: 0.35,
      renderVisibleBoost: 12,
      heroLightRadius: 4.8,
      heroRenderIntensity: 8,
      beaconLightMult: 1.5,
      turretLightRadius: 4.2,
      lanternPostLightRadius: 7,
      lanternRenderIntensity: 34,
      enemyLanternRadius: 4.6,
      enemyLanternIntensity: 5.5,
      enemyLanternHandOffset: 0.3,
      enemyLanternSwing: 0.025,
      enemyLanternConeRadius: 0.12,
      enemyLanternConeHeight: 0.42,
      enemyLanternConeOpacity: 0.07,
      agentLightRadius: 6.2,
      agentLightIntensity: 11,
      nightSpeedOutsideLight: 1.18,
      nightSpriteLightBoost: 1.15,
      nightSpriteScale: 1.18,
      nightSpriteTint: '#ffd1a0',
      terrainPoolIntensity: 0.85,
      muzzleFlashSeconds: 0.1,
      muzzleFlashIntensity: 18,
    },
  },
  eraCaps: {
    blastRadiusMult: 1.4,
    seamCapacityBonus: 40,
    stockpileCapBonus: 80,
  },
  offers: {
    investBonus: 0.35,
  },
  goldSeam: {
    activeMin: 2,
    activeMax: 3,
    channelRange: 1.6,
    slowSpeed: 0.35,
    tickSeconds: 1.5,
    tickGold: 5,
    capacity: 30,
    decayMultiplier: 2,
    respawnSeconds: 20,
  },
  camera: {
    fov: 42,
    offset: new THREE.Vector3(0, 26.2, 18.3),
    lag: 0.15,
    lookAhead: 1.35,
    downScreenLookOffset: 3.35,
  },
  render: {
    exposure: 0.75,
    maxDpr: 2,
    night: {
      maxDynamicLights: 8,
      degradedDynamicLights: 4,
      frameBudgetMs: 16.7,
      collapseRatio: 2,
      collapseSeconds: 3,
      windowFrames: 180,
    },
    floatTextPool: 12,
    combatVfxPuffs: 32,
    combatVfxTicks: 48,
    combatVfxRings: 8,
    enemyBarCap: 60,
  },
  world: {
    terrainSegments: 64,
    terrainMobileSegments: 40,
    vistaSegments: 12,
    vistaMobileSegments: 7,
    terrainRelief: 1,
    terrainFeatureRelief: 1,
    terrainFeatureMobileScale: 0.62,
    terrainRoutingLaneCalmRadius: 4.6,
    waterQuality: 1,
    waterMobileQuality: 0.55,
    waterFlowSpeed: 0.075,
    shadowsQuality: 'soft',
    shadowMapSize: 1536,
    fogNear: 42,
    fogFar: 88,
    postEnabled: true,
    postWarmth: 0.045,
    postVignette: 0.18,
    postPaperGrainOpacity: 0.008,
    detailDensity: 1,
    detailMobileDensity: 0.42,
    detailBuildPadClearRadius: 4.8,
    detailRoutingLaneClearRadius: 4.2,
    detailHarvestAnchorClearRadius: 2.4,
    detailBuildingClearRadius: 2.4,
    detailStressEnemyThreshold: 50,
    detailStressWaveThreshold: 12,
    terrainMesh: false,
    terrainSplat: false,
    terrainMeshVertexStep: 1,
  },
  terrain: {
    featureMix: 0.86,
  },
  terrainSim: {
    uphillMin: 0.6,
    downhillMax: 1.1,
    slopeMax: 0.35,
    wadeDepth: 0.35,
    deepDepth: 1,
  },
  gt: {
    highGroundRangeBonus: 1.5,
  },
  sprite: {
    turnRateDegPerS: 540,
    orientationFadeMs: 100,
  },
  anim: {
    frameBlendMs: 80,
    walkFps: 9.5,
    walkFpsPerSpeed: 9.5 / 6,
    strideUnits: 2.05,
    walkMinFps: 9.5 * 0.4,
    bobAmp: 0.035,
    leanDeg: 2.4,
  },
  charm: {
    hitPauseMs: 30,
    hitPauseCooldownMs: 250,
    camImpulse: 0,
    coinTick: 1,
    banterCooldownS: 8,
  },
} as const;

export type BlastAimMode = 'cursor' | 'auto';
export type DifficultyPresetId = 'greenhorn' | 'trail' | 'vein-hunter';

export const DIFFICULTY_PRESET_STORAGE_KEY = 'gr.difficultyPreset.v1';

const TRAIL = {
  enemyHp: 25.2,
  xpPerKill: 4,
  offerInvestBonus: 0.35,
  thiefMaxConcurrent: 2,
  thiefMaxConcurrentCap: 4,
  palisadeHp: 60,
  doubleTapCoilMaxStacks: 6,
} as const;

type MutableBalance = {
  enemy: { hp: number };
  xp: { perKill: number };
  offers: { investBonus: number };
  steal: { maxConcurrent: number; maxConcurrentCap: number };
  wreck: { hp: { palisade: number } };
  upgrades: { doubleTapCoilMaxStacks: number };
};

export function normalizeDifficultyPreset(value: unknown): DifficultyPresetId {
  if (value === 'greenhorn') return 'greenhorn';
  if (value === 'vein-hunter' || value === 'vein_hunter' || value === 'hard') return 'vein-hunter';
  return 'trail';
}

export function readDifficultyPreset(search = getSearch(), storage = getStorage()): DifficultyPresetId {
  const params = new URLSearchParams(search);
  const raw = params.get('preset') ?? params.get('difficulty');
  const preset = normalizeDifficultyPreset(raw ?? readStoredDifficultyPreset(storage));
  if (raw) saveDifficultyPreset(preset, storage);
  return preset;
}

export function saveDifficultyPreset(preset: DifficultyPresetId, storage = getStorage()): void {
  try {
    storage?.setItem(DIFFICULTY_PRESET_STORAGE_KEY, preset);
  } catch {
    // localStorage is optional in private/headless contexts.
  }
}

export function applyDifficultyPreset(preset: DifficultyPresetId): DifficultyPresetId {
  const balance = Balance as unknown as MutableBalance;
  balance.enemy.hp = TRAIL.enemyHp;
  balance.xp.perKill = TRAIL.xpPerKill;
  balance.offers.investBonus = TRAIL.offerInvestBonus;
  balance.steal.maxConcurrent = TRAIL.thiefMaxConcurrent;
  balance.steal.maxConcurrentCap = TRAIL.thiefMaxConcurrentCap;
  balance.wreck.hp.palisade = TRAIL.palisadeHp;
  balance.upgrades.doubleTapCoilMaxStacks = TRAIL.doubleTapCoilMaxStacks;

  if (preset === 'greenhorn') {
    balance.steal.maxConcurrent = 1;
    balance.steal.maxConcurrentCap = 3;
    balance.wreck.hp.palisade = Math.round(TRAIL.palisadeHp * 1.2);
  } else if (preset === 'vein-hunter') {
    balance.enemy.hp = 28;
    balance.xp.perKill = 3;
    balance.offers.investBonus = 0;
    balance.upgrades.doubleTapCoilMaxStacks = 3;
  }

  return preset;
}

export function applyStoredDifficultyPreset(): DifficultyPresetId {
  return applyDifficultyPreset(readDifficultyPreset());
}

function getSearch(): string {
  try {
    return globalThis.location?.search ?? '';
  } catch {
    return '';
  }
}

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStoredDifficultyPreset(storage: Storage | null): string | null {
  try {
    return storage?.getItem(DIFFICULTY_PRESET_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}
