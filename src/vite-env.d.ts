/// <reference types="vite/client" />

declare const __APP_BUILD__: string;

type GrBuildableId = any;
type GrStorySignal = import('./story').RuntimeStorySignal;
type GrRunEndedEvent = Extract<import('./core/EventBus').GameEvent, { type: 'run_ended' }>;
type GrRunTelemetryPayload = import('./telemetry/payload').RunTelemetryPayload;

interface ThreeGameDiagnostics {
  frame: number;
  elapsed: number;
  timeAlive: number;
  simulation: {
    tick: number;
    fixed: boolean;
    stepSeconds: number;
    alpha: number;
    stepsLastFrame: number;
    totalSteps: number;
    droppedSeconds: number;
    droppedTicks: number;
  };
  runState: 'boot' | 'playing' | 'levelup' | 'dead';
  paused: boolean;
  state: 'boot' | 'playing' | 'levelup' | 'dead' | 'paused';
  mp: GrMultiplayerState | null;
  difficultyPreset: 'greenhorn' | 'trail' | 'vein-hunter';
  renderLayers: Record<string, number>;
  renderLayerOf: (name: string) => number | null;
  ui?: {
    hp: number;
    maxHp: number;
    gold: number;
    xp: number;
    xpNeed: number;
    level: number;
    wave: number;
    waveState: 'quiet' | 'warning' | 'active' | 'cleared';
    announcement: string | null;
    announcementAt: number;
    announcementDurationSeconds: number;
    announcementEdge: 'north' | 'south' | 'east' | 'west' | null;
    announcementKind: 'wave' | 'baron' | 'baron-defeat';
    announcementTitle: string | null;
    enemiesAlive: number;
    timeAlive: number;
    state: 'boot' | 'playing' | 'levelup' | 'dead';
    paused: boolean;
    buildMode: boolean;
    buildMenuOpen: boolean;
    selectedBuildable: GrBuildableId;
    buildables: Array<{
      id: GrBuildableId;
      displayName: string;
      blurb?: string;
      cost: number;
      count: number;
      maxCount: number;
      canAfford: boolean;
      selected: boolean;
      iconSlot: string;
      portraitSlug?: string;
      tierLine?: string;
    }>;
    stockpileCount: number;
    beaconCount: number;
    beaconMax: number;
    nextBeaconCost: number;
    canAffordBeacon: boolean;
    weapon: 'rig' | 'blast';
    agent: {
      name: string;
      permissionLevel: number;
      permissionLabel: string;
      capabilities: readonly { id: string; level: number; label: string; tools: readonly string[] }[];
      lastActionAt: Partial<Record<string, number>>;
      autonomyTrack: number;
      policySlotBonus: number;
      receiptFeed: readonly string[];
    } | null;
  };
  hp: number;
  maxHp: number;
  heroIframes: boolean;
  enemiesAlive: number;
  enemyPoolSize: number;
  freedWalkers?: import('./systems/FreedWalkerVfx').FreedWalkerDiagnostics;
  boltsAlive: number;
  arsenal: {
    active: 'rig' | 'blast';
    blastsAlive: number;
    detonations: number;
    blastKills: number;
    turretKills: number;
    weaponToggles: number;
    blastTime: number;
    blastDamage: number;
    blastRadius: number;
    disarmed: boolean;
    aimReticleRadius: number;
    aimMode: 'cursor' | 'auto';
    aimTarget: { x: number; z: number };
    lastDetonation: { x: number; y: number; z: number } | null;
  };
  xp: number;
  xpMotesAlive: number;
  xpAudit: {
    deaths: number;
    motesSpawned: number;
    motesCollected: number;
    motesCollectedXp: number;
    overflowBanked: number;
    expiredBanked: number;
    autoBanked: number;
    dropped: number;
    xpAwarded: number;
    xpPerKill: number;
    motePool: number;
    expiryBanks: boolean;
  };
  progression: {
    level: number;
    xpInto: number;
    xpNeed: number;
    pendingLevels: number;
    offer: string[] | null;
    stacks: Record<string, number>;
    stats: {
      fireRateMult: number;
      damageMult: number;
      rangeMult: number;
      boltSpeedMult: number;
      volleyBonus: number;
      maxHpBonus: number;
      moveSpeedMult: number;
      panTickMult: number;
      seamCapacityBonus: number;
      seamRespawnReduction: number;
      stockpileCapBonus: number;
      beaconFireRateMult: number;
      blastDamageMult: number;
      blastRadiusMult: number;
      blastCooldownMult: number;
      agentPolicySlots: number;
    };
    eligibility: string[];
  };
  deepwaterClaim: ReturnType<import('./world/DeepwaterClaimTile').DeepwaterClaimTile['snapshot']> | null;
  dustFlats?: { storm: string; tarSeams: number; orbit: { members: Array<{ id: string; peeled: boolean; state?: string }> }; orbitMembers: Array<{ id: string; peeled: boolean; state?: string }>; roads: { segments: number } };
  kills: number;
  goldPanned: number;
  deathLedger: {
    timeAlive: number;
    kills: number;
    goldPanned: number;
    spent: number;
    beaconsBuilt: number;
    wavesSurvived: number;
    weaponToggles: number;
    blastTime: number;
  };
  wave: number;
  nextWaveInSim: number;
  trickleInterval: number;
  waveSpawnedTotal: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
  pulse: number;
  edge: 'north' | 'south' | 'east' | 'west' | null;
  budget: number;
  lastPulseAt: number;
  spawnDisabled: boolean;
  stressCount: number;
  score: number;
  targetScore: number;
  complete: boolean;
  heroPos: { x: number; y: number; z: number };
  heroRenderPos: { x: number; y: number; z: number };
  speed: number;
  player: {
    position: { x: number; y: number; z: number };
    speed: number;
  };
  actors: Array<{
    slot: number;
    playerId: string;
    name: string;
    town: string | null;
    local: boolean;
    hp: number;
    maxHp: number;
    position: { x: number; y: number; z: number };
    speed: number;
    visible: boolean;
  }>;
  economy: {
    gold: number;
    banked: number;
    bankCap: number;
    resources: Record<string, { amount: number; cap: number }>;
    activeResources: Array<{
      id: string;
      name: string;
      amount: number;
      cap: number;
      iconSlot: string;
      ledgerBlurb: string;
    }>;
    logLength: number;
    state: { gold: number; bankCap: number; resources: Record<string, { amount: number; cap: number }> };
    replay: { gold: number; bankCap: number; resources: Record<string, { amount: number; cap: number }> };
    summary: {
      panned: number;
      sluiced: number;
      granted: number;
      stolen: number;
      reclaimed: number;
      pannedByProspector: number;
      sluicedByProspector: number;
      reclaimedByProspector: number;
      spent: number;
      baseValue: number;
      buildingsBuilt: number;
      beaconsBuilt: number;
      repairSpent: number;
      repairs: number;
    };
  };
  run: {
    secured: boolean;
    rush: boolean;
    lastRunEndedReason: 'death' | 'secured' | 'rush' | null;
    meta: {
      version: 1;
      tracks: {
        territory: number;
        science: number;
        hero: number;
        agent: number;
      };
    } | null;
    victoryPayout: {
      territory: number;
      science: number;
      hero: number;
      agent: number;
    } | null;
    suspend: {
      hasSuspend: boolean;
      restored: boolean;
      restoredWave: number | null;
      lastWriteAt: number | null;
      lastWriteMs: number | null;
      sizeBytes: number;
    };
  };
  contract: {
    activeId: string;
    requestedId: string | null;
    fallbackReason: 'debug-disabled' | 'unknown-contract' | null;
    warningSuppressed: boolean;
    epochId: string;
    epochResources: GrContractEpochBundle['resources'];
    claimOffice: GrContractEpochBundle['claimOffice'];
    name: string;
    tileParams: GrContractManifest['tileParams'];
    boardRow: GrContractManifest['boardRow'];
    briefing: GrContractManifest['briefing'];
    seamYieldMult: number;
    secureWave: number;
    waveCadenceMult: number;
    lightRamp: GrContractManifest['twist']['lightRamp'] | null;
    dayNightCycle: GrContractManifest['twist']['dayNightCycle'] | null;
    baron: GrContractManifest['twist']['baron'] | null;
    medals: import('./game/Medals').MedalState;
  };
  research: {
    taken: string[];
    available: string[];
    steps: number;
    remaining: number;
    threshold: number;
    overflow: number;
    meter: string;
    continued: {
      seamYieldMult: number;
      turretDamageMult: number;
      stockpileCapBonus: number;
    };
    assayOrderSlots: number;
    contractTier: number;
  };
  megaproject: GrMegaprojectDiagnostics;
  escort: GrEscortDiagnostics;
  tram: GrTramDiagnostics | null;
  fairground: GrFerrisWheelDiagnostics | null;
  fuel: import('./systems/FuelSystem').FuelDiagnostics | null;
  vehicle: import('./entities/Vehicle').VehicleDiagnostics | null;
  power: GrPowerGraphDiagnostics;
  canyonWorks: null | { powered: number; required: number; byWave: number; complete: boolean; failed: boolean };
  crawlerBoss: null | {
    active: boolean;
    act: 0 | 1 | 2 | 3;
    flickerEvents: number;
    flickerActive: boolean;
    drainActive: boolean;
    drainWatts: number;
    drainTarget: string | null;
    dialVisible: boolean;
    dialProgress: number;
    bursts: number;
    tracksPinned: boolean;
    overchargeActive: boolean;
    overchargeRemaining: number;
    turretFireRateMult: number;
    wreckRemains: boolean;
  };
  landYachtBoss: null | import('./systems/LandYachtBossSystem').LandYachtBossDiagnostics;
  agent: {
    stub: {
      name: string;
      permissionLevel: number;
      permissionLabel: string;
      capabilities: readonly { id: string; level: number; label: string; tools: readonly string[] }[];
      lastActionAt: Partial<Record<string, number>>;
      receiptCount: number;
      lastReceiptTool: string | null;
      receiptFeed: readonly string[];
    } | null;
    embodiment: {
      visible: boolean;
      moving: boolean;
      drifting: boolean;
      working: boolean;
      receiptCount: number;
      lastReceiptTool: string | null;
      lastLine: string | null;
      position: { x: number; y: number; z: number };
      target: { x: number; z: number };
      terrainY: number;
      clearance: number;
    };
  };
  audio: {
    unlocked: boolean;
    muted: boolean;
    volume: number;
    musicVolume: number;
    requests: number;
    started: number;
    missing: number;
    active: number;
    concurrentVoices: number;
    voiceCap: number;
    dropsPerSecond: number;
    headroomGain: number;
    loops: string[];
    loopSourceCounts: Record<string, number>;
    loopVolumes: Record<string, number>;
    lastRequested: string | null;
    lastStarted: string | null;
    playsPerSecond: Record<string, number>;
    startedBySound: Record<string, number>;
    droppedBySound: Record<string, number>;
    droppedByFamily: Record<string, number>;
    droppedByPriority: Record<string, number>;
  };
  build: {
    mode: boolean;
    ghostValid: boolean;
    ghostLight: number;
    ghostPos: { x: number; z: number };
    ghostRotationSteps: number;
    ghostFootprint: { w: number; d: number };
    selectedBuildable: GrBuildableId;
    beacons: number;
    palisades: number;
    sluices: number;
    stockpiles: number;
    turrets: number;
    lanternPosts: number;
    beaconPositions: Array<{ x: number; z: number }>;
    palisadePositions: Array<{ x: number; z: number }>;
    sluicePositions: Array<{ x: number; z: number }>;
    stockpilePositions: Array<{ x: number; z: number }>;
    turretPositions: Array<{ x: number; z: number }>;
    assayOffices: number;
    assayOfficePositions: Array<{ x: number; z: number }>;
    lanternPostPositions: Array<{ x: number; z: number }>;
    reservedFootprints: Array<{ id: string; x: number; z: number; halfX: number; halfZ: number }>;
    buildables: Array<{ id: GrBuildableId; count: number }>;
    sluicesState: Array<{
      id: string;
      active: boolean;
      position: { x: number; z: number };
      progress: number;
      panRateMult: number;
      yieldPerCycle: number;
      contested: boolean;
      capped: boolean;
    }>;
    stockpilesState: Array<{
      active: boolean;
      position: { x: number; z: number };
      pileStep: number;
    }>;
    pileStep: number;
    nextCost: number;
    killsByOwner: Readonly<Record<string, number>>;
    damageByOwner: Readonly<Record<string, number>>;
    hp: Array<{
      id: GrBuildableId;
      index: number;
      tier: number;
      hp: number;
      maxHp: number;
      wrecked: boolean;
      worn: boolean;
      effectiveDamage?: number;
      effectiveFireRate?: number;
      panRateMult?: number;
      yieldPerCycle?: number;
      repairProgress: number;
      repairCost: number;
      position: { x: number; z: number };
    }>;
    ruins: number;
    hpBars: number;
    hpBarsVisible: boolean;
    hpBarDetails: Array<{
      id: GrBuildableId;
      index: number;
      visible: boolean;
      ratio: number;
      color: 'ink' | 'amber' | 'red';
      rotationSteps: number;
      yaw: number;
    }>;
    repair: {
      active: boolean;
      id: GrBuildableId | null;
      index: number;
      progress: number;
      blocked: boolean;
    };
    shooterRegistrations: number;
    turretPulses: number;
    activeTurretPulses: number;
    tierUpgrades: number;
    repairs: number;
    repairGold: number;
    shells: Record<string, {
      active: number;
      signs: number;
      meshes: string[];
      lit: boolean;
      wheelPhase?: number;
    }>;
  };
  pressure: import('./systems/PressureSystem').PressureDiagnostics;
  pressureArsenal: import('./systems/PressureArsenalSystem').PressureArsenalDiagnostics;
  harvest: {
    activeNodes: Array<{
      id: string;
      active: boolean;
      anchorIndex: number;
      position: { x: number; z: number };
      remaining: number;
      respawnScheduled: boolean;
      respawnIn: number;
    }>;
    channeling: boolean;
    channelNodeId: string | null;
    progress: number;
    lastGoldGain: number;
    lastGoldPosition: { x: number; y: number; z: number } | null;
  };
  steal: {
    thieves: number;
    fleeing: number;
    carriedTotal: number;
    stolenTotal: number;
    reclaimedTotal: number;
    pickups: number;
    pickupTotal: number;
  };
  wreck: {
    wreckers: number;
    swinging: number;
    gnawing: number;
    stuckWatchdogTrips: number;
    ruins: number;
    hitsResolved: number;
    wrecked: number;
    repairs: number;
    repairGold: number;
  };
  charmPause: boolean;
  camImpulseActive: boolean;
  baronSpawnImpulses: number;
  baronCeremony: {
    active: boolean;
    elapsed: number;
    holdSeconds: number;
  };
  baronStandard: {
    visible: boolean;
    x: number;
    z: number;
    dropElapsed: number;
  };
  baronRocket: {
    cartVisible: boolean;
    carried: boolean;
    distanceFromBaron: number;
    telegraphActive: boolean;
    telegraphElapsed: number;
    nextVolleyIn: number;
    volleys: number;
    suppressed: boolean;
    targetKind: 'hero' | 'building' | null;
    lastOwnerId: string;
    lastTarget: { x: number; z: number };
    target: { x: number; z: number };
    manifest: GrContractManifest['twist']['baron'] extends infer Baron
      ? Baron extends { rocketVolley?: infer Volley }
        ? Volley | null
        : null
      : null;
  };
  damSurge: import('./systems/DamSurgeEvent').DamSurgeDiagnostics | null;
  vfx: {
    activeFloatTexts: number;
    floatTextPool: number;
    combat: {
      puffs: { active: number; capacity: number };
      ticks: { active: number; capacity: number };
      rings: { active: number; capacity: number };
    };
  };
  performance: {
    tier: 'full' | 'balanced' | 'lite';
    override: 'auto' | 'full' | 'balanced' | 'lite';
    source: 'auto' | 'override';
    reason: string;
    gpuRenderer: string;
    deviceMemory: number | null;
    userAgent: string;
    config: {
      maxDpr: number;
      shadowsQuality: 'soft' | 'blob';
      shadowMapSize: number;
      fogNear: number;
      fogFar: number;
      postEnabled: boolean;
      postPaperGrainOpacity: number;
      detailDensity: number;
      detailMobileDensity: number;
      terrainSegments: number;
      terrainMobileSegments: number;
      vistaSegments: number;
      vistaMobileSegments: number;
      waterQuality: number;
      waterMobileQuality: number;
      terrainMesh: boolean;
      terrainSplat: boolean;
      terrainMeshVertexStep: number;
      floatTextPool: number;
      combatVfxPuffs: number;
      combatVfxTicks: number;
      combatVfxRings: number;
      enemyBarCap: number;
    };
  };
  readability: {
    enemyHitFlashes: number;
    activeEnemyFlashes: number;
    buildingHpBars: number;
    bossHpBar: {
      visible: boolean;
      ratio: number;
      renderedRatio: number;
      litSegments: number;
      segments: number;
      groupId: string | null;
      aliveComponents: number;
      destroyedComponents: number;
      components: Array<{ id: string; label: string; hp: number; maxHp: number }>;
    };
    turretPulses: number;
    activeTurretPulses: number;
  };
  renderer: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  lighting?: {
    sunPresent: boolean;
    shadowsQuality: 'soft' | 'blob';
    fogNear: number;
    fogFar: number;
    postEnabled: boolean;
    paperGrainOpacity: number;
    shadowMapSize: number;
    shadowMapTargetSize: number;
    blobShadows: number;
    nightPools: number;
    enemyLanterns: number;
    prospectorLights: number;
    muzzleFlashes: number;
    muzzleFlashCount: number;
    billboardLights: number;
    nightShift: {
      enabled: boolean;
      phase: 'full' | 'dusk' | 'dark' | 'dawn';
      darkness: number;
      lampIntensityMult?: number;
    };
    dayNight: import('./systems/DayNightCycle').DayNightSnapshot | null;
    coverage: import('./systems/LightField').LightFieldDiagnostics;
  };
  mothSwarm: {
    enabled: boolean;
    alive: number;
    attached: number;
    sourceId: string | null;
    baseRadius: number;
    effectiveRadius: number;
    attachCounts: Array<{ sourceId: string; count: number; radius: number; targetWeight: number }>;
  };
  enemyDimming: {
    enabled: boolean;
    darkness: number;
    minLight: number;
    falloff: number;
    sources: number;
    dimmed: number;
    minFactor: number;
  };
  assets: Partial<Record<string, 'missing' | 'pending' | 'loaded' | 'error'>>;
  assetSprites: Partial<Record<string, number>>;
  spriteAnimations: Partial<Record<string, {
    clip: string;
    frame: number;
    frameKey: string;
    frameCount: number;
    fps: number;
    loaded: boolean;
    direction?: string;
    mirrored?: boolean;
    fadeActive?: boolean;
    fadeMsRemaining?: number;
    fadeWindow?: number;
    frameBlendActive?: boolean;
    frameBlendMsRemaining?: number;
    frameBlendWindow?: number;
    motionPhase?: number;
    bobOffset?: number;
    leanDeg?: number;
    sourceFrameKey?: string;
    walkFpsPerSpeed?: number;
    strideUnitsPerCycle?: number;
  }>>;
  spriteStats: {
    activeAnimators: number;
    textureSwapsPerFrame: number;
    fadeOverlaysActive: number;
  };
  terrain: {
    playerZone: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
    ground?: {
      enabled: boolean;
      mode: 'fallback' | 'continuous-mesh';
      drawCalls: 1;
      segments: number;
      vertexStep: number;
      vertices: number;
      triangles: number;
      heightSource: 'visual';
      textureSource: 'bank-atlas' | 'bank-atlas-splat';
      textureSeams: 'texture seams remain until TR-02' | 'per-pixel splat gradients';
    };
    sim: {
      flat: boolean;
      tile: string;
      balance: {
        uphillMin: number;
        downhillMax: number;
        slopeMax: number;
        wadeDepth: number;
        deepDepth: number;
      };
      gt: {
        highGroundRangeBonus: number;
      };
      lastLos: {
        flat: boolean;
        clear: boolean;
        samples: number;
        from: { x: number; z: number; h: number };
        to: { x: number; z: number; h: number };
        blockedAt: { x: number; z: number; h: number; lineH: number; step: number } | null;
      };
      probes: Record<string, {
        height: number;
        slope: { dx: number; dz: number };
        traversable: boolean;
      }>;
    };
    water?: {
      material: 'LivingWaterShader';
      riverPresent: boolean;
      fordPresent: boolean;
      riverTime: number;
      fordTime: number;
      quality: number;
      mobile: boolean;
      foam: boolean;
      glints: number;
      fordStones: number;
      gravelBars: number;
      visualHalfWidth: number;
      springPonds: number;
      waterPhaseVariance: number;
      depth: {
        river: number;
        ford: number;
        wade: number;
        deep: number;
      };
    };
    rails: {
      active: boolean;
      paths: number;
      points: number;
      style: string | null;
      renderLayer: number;
      renderSlot: 'groundDecals';
      railInstances: number;
      tieInstances: number;
      drawCalls: number;
      asset: 'procedural-placeholder';
      samples: Array<{ x: number; y: number; z: number; kind: 'point' | 'midpoint' }>;
    };
    vista: {
      present: boolean;
      segments: number;
      radius: number;
      vertices: number;
      seamMaxDelta: number;
      seam: Array<{
        x: number;
        z: number;
        clamped: number;
        unclamped: number;
        delta: number;
      }>;
      river: {
        present: boolean;
        drawCalls: 0 | 1;
        radius: number;
        vertices: number;
        visualHalfWidth: number;
        fadeStart: number;
        westEdgeCenterZ: number;
        eastEdgeCenterZ: number;
        westFarCenterZ: number;
        eastFarCenterZ: number;
        meanderAmplitude: number;
      };
    };
    detailScatter?: {
      instanceClasses: number;
      totalInstances: number;
      seededInstances: number;
      densityTier: 'desktop' | 'mobile-reduced' | 'off';
      seed: number;
      classes: Array<{
        id: 'rocks' | 'stumps' | 'dry_grass' | 'wagon_ruts' | 'claim_posts' | 'cactus' | 'reeds';
        instances: number;
        visibleInstances: number;
        drawCalls: 1;
      }>;
      exclusions: {
        buildPadRadius: number;
        routingLaneRadius: number;
        harvestAnchorRadius: number;
        buildingClearRadius: number;
      };
      probes: Record<'buildPad' | 'ford' | 'routingLane' | 'building', {
        x: number;
        z: number;
        clearRadius: number;
        nearest: number | null;
        clear: boolean;
      }>;
      signature: string;
    };
    height: {
      min: number;
      max: number;
      segments: number;
      waterY: number;
      heroGround: number;
      heroVisualY: number;
      probes: Record<string, number>;
    };
    probes: Record<string, {
      walkable: boolean;
      speedMul: number;
      zone: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
      waterSource?: 'river' | 'spring_pond';
      waterDepth?: number;
      waterClass?: 'wade' | 'deep';
    }>;
  };
  canvas: {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    dpr: number;
  };
  frameMs: {
    last: number;
    avg: number;
    p95: number;
    sampleCount: number;
  };
}

type GoldRushGui = import('lil-gui').default;
type GrAgentStub = import('./agent/AgentStub').AgentStub;
type GrContractEpochMeta = import('./meta/ContractFamilies').EpochMeta;
type GrContractEpochBundle = import('./meta/ContractFamilies').EpochBundle;
type GrContractTierBudget = import('./meta/ContractFamilies').ContractTierBudget;
type GrEpochTileDescriptor = import('./meta/ContractFamilies').EpochTileDescriptor;
type GrContractWaterDescriptor = import('./meta/ContractFamilies').ContractWaterDescriptor;
type GrContractManifest = import('./meta/ContractFamilies').ContractManifest;
type GrActiveContractDiagnostics = import('./meta/ContractFamilies').ActiveContractDiagnostics;
type GrTerrainSample = import('./world/Terrain').TerrainSample;
type GrMegaprojectDiagnostics = import('./meta/Megaproject').MegaprojectDiagnostics;
type GrEscortDiagnostics = import('./systems/WaveSystem').WaveDiagnostics['escort'];
type GrTramDiagnostics = import('./entities/TramPath').TramDiagnostics;
type GrFerrisWheelDiagnostics = import('./entities/FerrisWheel').FerrisWheelDiagnostics;
type GrPowerGraphDiagnostics = import('./systems/PowerGraph').PowerGraphDiagnostics;
type GrStatSimWindow = import('./crafting/StatSimHarness').StatSimWindow;
type GrMultiplayerBalanceWindow = import('./mp/MultiplayerBalanceHarness').MultiplayerBalanceWindow;
type GrMultiplayerState = import('./mp/LockstepClient').MultiplayerState;
type GrSimulationTickSample = {
  time: number;
  enemies: number;
  bolts: number;
  blasts: number;
  goldPickups: number;
  xpMotes: number;
  wave: number;
  economyLog: number;
};

interface Window {
  __GR_E5_DEEPWATER__?: import('./diagnostics/E5DeepwaterHarness').E5DeepwaterHarness;
  __GR_E4_CONVOY_WEATHER__?: import('./diagnostics/E4ConvoyWeatherHarness').E4ConvoyWeatherHarness;
  __GR_E4_ORBIT_ROAD__?: import('./diagnostics/E4OrbitRoadHarness').E4OrbitRoadHarness;
  __GR_AUDIO_DIAGNOSTICS__?: {
    unlocked: boolean;
    muted: boolean;
    volume: number;
    musicVolume: number;
    loops: string[];
    loopElapsedSeconds: Record<string, number>;
    startedBySound: Record<string, number>;
  };
  __GR_EDITOR__?: {
    descriptorJson: () => string;
    wavesPaused: true;
  };
  __GR_STORY__?: {
    emit: (signal: GrStorySignal) => void;
    registry: string[];
    active: () => string | null;
    pending: () => string[];
    talesEnabled: () => boolean;
  };
  __THREE_GAME_DIAGNOSTICS__?: ThreeGameDiagnostics;
  __GR_STAT_SIM__?: GrStatSimWindow;
  __GR_MP_BALANCE__?: GrMultiplayerBalanceWindow;
  __GR_MP__?: {
    state: () => GrMultiplayerState | null;
    injectDesyncAt: (tick: number) => void;
  };
  __GR_TELEMETRY__?: {
    recordRunEndedForTest: (event: GrRunEndedEvent) => void;
    lastPayload: () => GrRunTelemetryPayload | null;
  };
  __GR_TOWN_DIAGNOSTICS__?: import('./town/TownScene').TownDiagnostics;
  __GR_HERALD_FEED__?: readonly import('./news/herald').HeraldItem[];
  __BENCH_REPORT__?: unknown;
  __GR_GUI__?: GoldRushGui;
  __GR_PROFILE__?: {
    state: () => {
      version: 2;
      activeId: string;
      profiles: Array<{
        id: string;
        name: string;
        createdAt: number;
        updatedAt: number;
        difficultyPreset: 'greenhorn' | 'trail' | 'vein-hunter';
        hintsSeen: string[];
      }>;
    };
    active: () => {
      id: string;
      name: string;
      createdAt: number;
      updatedAt: number;
      difficultyPreset: 'greenhorn' | 'trail' | 'vein-hunter';
      hintsSeen: string[];
    };
    createProfile: (name: string) => string | null;
    switchProfile: (id: string) => boolean;
    start: () => boolean;
    storageKey: (logicalKey: string, profileId?: string) => string;
    markHintSeen: (hintId: string) => boolean;
  };
  /** Present only with ?debug — direct agent receipt hooks for e2e. */
  __GR_AGENT__?: GrAgentStub;
  /** Present only with ?debug — contract-family registry hooks for e2e. */
  __GR_CONTRACT_REGISTRY__?: {
    listEpochs: () => GrContractEpochMeta[];
    loadEpoch: (id: string) => GrContractEpochBundle;
    activeEpoch: () => GrContractEpochBundle;
    activeEpochId: () => string;
    epochIsActive: (id: string) => boolean;
    listContracts: (epochId?: string) => GrContractManifest[];
    listBoardContracts: () => GrContractManifest[];
    loadContract: (id: string, epochId?: string) => GrContractManifest;
    activeContract: () => GrContractManifest;
    activeContractDiagnostics: () => GrActiveContractDiagnostics;
    activeTileDescriptor: () => GrEpochTileDescriptor;
    activeWaterDescriptor: () => GrContractWaterDescriptor | undefined;
    contractTierBudget: (epochId: string, tier: number) => GrContractTierBudget;
    contractBudgetOk: (epochId: string, tier: number, rarity: 'common' | 'uncommon' | 'rare', budget: number) => boolean;
  };
  /** Present only with ?debug — parking-free positioning for interaction e2e. */
  __GR_TEST__?: {
    teleport: (x: number, z: number) => void;
    spawnPack: (
      n: number,
      radius?: number,
      opts?: {
        speedScale?: number;
        speedMult?: number;
        hpScale?: number;
        eliteKind?: 'baron' | 'railcar';
        visualScale?: number;
        banner?: boolean;
        wrecker?: boolean;
        carriedLantern?: boolean;
        contactDamageScale?: number;
        buildingDamageScale?: number;
        supportBuildingDamageScale?: number;
        heroPursuitRange?: number;
        variantId?: string;
        variantLabel?: string;
        tint?: string;
        boltDamageMult?: number;
        bossGroupId?: string;
        bossGroupSize?: number;
        bossGroupTotalHp?: number;
        bossComponentId?: string;
        bossComponentLabel?: string;
        bossDegradeSpeedMult?: number;
      },
    ) => void;
    spawnThief: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    spawnWrecker: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    wreck: (family: GrBuildableId, index: number) => boolean;
    repair: (family: GrBuildableId, index: number) => false | unknown;
    screenPoint: (x: number, z: number, y?: number) => { x: number; y: number; z: number; inView: boolean };
    demolish: (family: GrBuildableId, index: number) => boolean;
    upgradeBuilding: (family: GrBuildableId, index: number) => boolean;
    setManualSim: (enabled: boolean) => boolean;
    resumeManualSimAtMpTick: (tick: number) => number;
    queuePowerGraphCommand: (command: import('./systems/PowerGraph').PowerGraphCommand) => boolean;
    driveVehicle: (x: number, z: number) => boolean;
    advanceSim: (seconds: number, onTick?: (sample: GrSimulationTickSample) => void) => void;
    driveRenderSchedule: (seconds: number, renderFps: number) => {
      renderFrames: number;
      simTicks: number;
      loop: {
        fixed: boolean;
        stepSeconds: number;
        alpha: number;
        stepsLastFrame: number;
        totalSteps: number;
        droppedSeconds: number;
        droppedTicks: number;
      };
    };
    triggerDamSurge: () => boolean;
    damSurge: () => import('./systems/DamSurgeEvent').DamSurgeDiagnostics | null;
    resetRun: () => void;
    endRunForTest: () => void;
    toggleWeapon: () => 'rig' | 'blast';
    setBlastAim: (x: number, z: number) => { x: number; z: number };
    setDifficultyPreset: (preset: string) => 'greenhorn' | 'trail' | 'vein-hunter';
    warmVfx: () => Promise<void>;
    clearScores: () => void;
    setBalance: (path: string, value: number | boolean | string) => boolean;
    grantGold: (n: number) => void;
    grantPressure: (n: number, actor?: 'player' | 'prospector') => void;
    grantXp: (n: number) => void;
    maxUpgrades: () => void;
    setUpgradeStacks: (stacks: Partial<Record<string, number>>) => void;
    rollUpgradeOffer: () => string[];
    setFillersDisabled: (disabled: boolean) => void;
    researchState: () => {
      taken: string[];
      available: string[];
      steps: number;
      remaining: number;
      threshold: number;
      overflow: number;
      meter: string;
      continued: {
        seamYieldMult: number;
        turretDamageMult: number;
        stockpileCapBonus: number;
      };
      assayOrderSlots: number;
      contractTier: number;
      pinnedTarget: string | null;
    };
    takeResearchNode: (id: string) => boolean;
    availableResearchPicks: () => string[];
    economyLog: () => readonly unknown[];
    summarizeLog: (log: readonly unknown[]) => {
      panned: number;
      sluiced: number;
      granted: number;
      stolen: number;
      reclaimed: number;
      pannedByProspector: number;
      sluicedByProspector: number;
      reclaimedByProspector: number;
      spent: number;
      baseValue: number;
      buildingsBuilt: number;
      beaconsBuilt: number;
      repairSpent: number;
      repairs: number;
    };
    setBeaconWave: (wave: number | null) => void;
    setDayNightTime: (seconds: number | null) => import('./systems/DayNightCycle').DayNightSnapshot | null;
    lightCoverage: (x: number, z: number) => number;
    damageFerrisWheel: (amount: number) => boolean;
    spawnMoths: (count: number, x: number, z: number) => number;
    announceForTest: (text: string, kind?: 'wave' | 'baron' | 'baron-defeat') => void;
    setWave: (wave: number) => void;
    startWaveForTest: (wave: number) => void;
    activeContract: () => GrContractManifest;
    megaproject: () => GrMegaprojectDiagnostics;
    fundMegaproject: () => boolean;
    damageMegaproject: (amount: number) => boolean;
    escort: () => GrEscortDiagnostics;
    damageEscort: (amount: number) => boolean;
    terrainSample: (x: number, z: number) => GrTerrainSample;
    terrainVisualY: (x: number, z: number, base?: number, padRadius?: number) => number;
    terrainSim: (x: number, z: number) => {
      height: number;
      slope: { dx: number; dz: number };
      traversable: boolean;
      speedEast: number;
      speedWest: number;
    };
    setTestClip: (slot: string, frames: string[], fps: number) => void;
    setBuildMode: (on: boolean) => void;
    selectBuildable: (id: string) => boolean;
    rotateBuildGhost: () => boolean;
    placeBoatBuilding: (padId: string, buildingId: string) => boolean;
    reanchorClaimBoat: (anchorId: string) => boolean;
    placeFree: (id: GrBuildableId, x: number, z: number, rotationSteps?: number) => boolean;
    confirmBuild: () => boolean;
    testAudio: (name: string) => void;
    enemyPositions: () => Array<{
      id: number;
      x: number;
      y: number;
      z: number;
      hp: number;
      maxHp: number;
      speed: number;
      contactDamage: number;
      buildingDamage: number;
      supportBuildingDamage: number;
      heroPursuitRange: number;
      hitRadius: number;
      eliteKind?: 'baron' | 'railcar';
      variantId?: string;
      variantLabel?: string;
      boltDamageMult: number;
      bossGroupId?: string;
      bossGroupSize: number;
      bossGroupTotalHp: number;
      bossComponentId?: string;
      bossComponentLabel?: string;
      bossDegradeSpeedMult: number;
      presentation: { mesh: boolean; visible: boolean; railY: number; railRotation: number; textureKey: string; damaged: boolean; damageThreshold: number; wreckerMarker: boolean; markerColor: string };
      scale: number;
      hasBanner: boolean;
      spreadOffset: number;
      vx: number;
      vz: number;
      thief?: boolean;
      wrecker?: boolean;
      state?: 'none' | 'seekHolding' | 'grabbing' | 'fleeing';
      wreckState?: 'none' | 'seekBuilding' | 'swinging';
      carried?: number;
      edge?: 'north' | 'south' | 'east' | 'west' | null;
      zone?: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
      light?: number;
      watchPainted?: boolean;
      terrain?: {
        grounded: boolean;
        slope: { dx: number; dz: number };
        traversable: boolean;
        speedMul: number;
      };
    }>;
    spawnEnemyAt: (x: number, z: number) => boolean;
    scriptEnemyAt: (x: number, z: number, targetX: number, targetZ: number, speed: number) => boolean;
    clearEnemies: () => void;
    captureSuspend: () => import('./game/RunSuspend').RunSuspendEnvelope;
    lastMultiplayerHashState: () => { tick: number; state: unknown } | null;
    restoreSuspend: (snapshot: unknown) => boolean;
    spawnGoldPickup: (x: number, z: number, amount: number) => boolean;
    spawnXpMote: (x: number, z: number, value: number) => boolean;
    launchBlastAt: (x: number, z: number, airTime?: number) => boolean;
    goldPickups: () => Array<{ active: boolean; amount: number; position: { x: number; z: number } }>;
    placeBeacon: () => boolean;
    projectileVisuals: () => Array<{
      ownerId: string;
      targetId: number;
      x: number;
      y: number;
      z: number;
      startY: number;
      endY: number;
      progress: number;
    }>;
    state: () => {
      enemiesAlive: number;
      xp: number;
      boltsAlive: number;
      combat: {
        hits: number;
        misses: number;
        staleSwitches: number;
        shots: Record<'bolt' | 'lob', number>;
        lastShotKind: 'bolt' | 'lob' | null;
        lastShotOwnerId: string | null;
      };
      arsenal: {
        active: 'rig' | 'blast';
        blastsAlive: number;
        detonations: number;
        blastKills: number;
        turretKills: number;
        weaponToggles: number;
        blastTime: number;
        blastDamage: number;
        blastRadius: number;
        disarmed: boolean;
        aimReticleRadius: number;
        aimMode: 'cursor' | 'auto';
        aimTarget: { x: number; z: number };
        lastDetonation: { x: number; y: number; z: number } | null;
      };
      buildables: Array<{ id: GrBuildableId; count: number }>;
      economy: {
        banked: number;
        bankCap: number;
      };
      steal: {
        thieves: number;
        fleeing: number;
        carriedTotal: number;
        stolenTotal: number;
        reclaimedTotal: number;
        pickups: number;
        pickupTotal: number;
      };
      wreck: {
        wreckers: number;
        swinging: number;
        gnawing: number;
        stuckWatchdogTrips: number;
        ruins: number;
        hitsResolved: number;
        wrecked: number;
        repairs: number;
        repairGold: number;
      };
      balance: {
        difficultyPreset: 'greenhorn' | 'trail' | 'vein-hunter';
        enemyHp: number;
        xpPerKill: number;
        offerInvestBonus: number;
        doubleTapCoilMaxStacks: number;
        rig: {
          fireRate: number;
        };
      };
    };
  };
}
