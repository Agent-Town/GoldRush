/// <reference types="vite/client" />

type GrBuildableId = GrBuildableId | 'assay_office';

interface ThreeGameDiagnostics {
  frame: number;
  elapsed: number;
  timeAlive: number;
  runState: 'boot' | 'playing' | 'levelup' | 'dead';
  paused: boolean;
  state: 'boot' | 'playing' | 'levelup' | 'dead' | 'paused';
  difficultyPreset: 'greenhorn' | 'trail' | 'vein-hunter';
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
      receiptFeed: readonly string[];
    } | null;
  };
  hp: number;
  maxHp: number;
  heroIframes: boolean;
  enemiesAlive: number;
  enemyPoolSize: number;
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
    lastDetonation: { x: number; z: number } | null;
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
    };
    eligibility: string[];
  };
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
  speed: number;
  player: {
    position: { x: number; y: number; z: number };
    speed: number;
  };
  economy: {
    gold: number;
    banked: number;
    bankCap: number;
    logLength: number;
    state: { gold: number; bankCap: number };
    replay: { gold: number; bankCap: number };
    summary: {
      panned: number;
      granted: number;
      spent: number;
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
  };
  research: {
    taken: string[];
    available: string[];
    steps: number;
    remaining: number;
    threshold: number;
    meter: string;
    assayOrderSlots: number;
  };
  agent: {
    stub: {
      name: string;
      permissionLevel: number;
      permissionLabel: string;
      receiptCount: number;
      lastReceiptTool: string | null;
      receiptFeed: readonly string[];
    } | null;
    embodiment: {
      visible: boolean;
      moving: boolean;
      working: boolean;
      receiptCount: number;
      lastReceiptTool: string | null;
      lastLine: string | null;
      position: { x: number; y: number; z: number };
      target: { x: number; z: number };
    };
  };
  build: {
    mode: boolean;
    ghostValid: boolean;
    ghostPos: { x: number; z: number };
    ghostRotationSteps: number;
    ghostFootprint: { w: number; d: number };
    selectedBuildable: GrBuildableId;
    beacons: number;
    palisades: number;
    sluices: number;
    stockpiles: number;
    turrets: number;
    beaconPositions: Array<{ x: number; z: number }>;
    palisadePositions: Array<{ x: number; z: number }>;
    sluicePositions: Array<{ x: number; z: number }>;
    stockpilePositions: Array<{ x: number; z: number }>;
    turretPositions: Array<{ x: number; z: number }>;
    assayOffices: number;
    assayOfficePositions: Array<{ x: number; z: number }>;
    buildables: Array<{ id: GrBuildableId; count: number }>;
    sluicesState: Array<{
      id: string;
      active: boolean;
      position: { x: number; z: number };
      progress: number;
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
    hp: Array<{
      id: GrBuildableId;
      index: number;
      hp: number;
      maxHp: number;
      wrecked: boolean;
      repairProgress: number;
      position: { x: number; z: number };
    }>;
    ruins: number;
    hpBars: number;
    repair: {
      active: boolean;
      id: GrBuildableId | null;
      index: number;
      progress: number;
      blocked: boolean;
    };
    shooterRegistrations: number;
    repairs: number;
    repairGold: number;
  };
  harvest: {
    activeNodes: Array<{
      id: string;
      active: boolean;
      anchorIndex: number;
      position: { x: number; z: number };
      remaining: number;
      respawnIn: number;
    }>;
    channeling: boolean;
    channelNodeId: string | null;
    progress: number;
    lastGoldGain: number;
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
    ruins: number;
    hitsResolved: number;
    wrecked: number;
    repairs: number;
    repairGold: number;
  };
  charmPause: boolean;
  camImpulseActive: boolean;
  vfx: {
    activeFloatTexts: number;
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
  }>>;
  spriteStats: {
    activeAnimators: number;
    textureSwapsPerFrame: number;
    fadeOverlaysActive: number;
  };
  terrain: {
    playerZone: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
    water?: {
      material: 'LivingWaterShader';
      riverTime: number;
      fordTime: number;
      quality: number;
      mobile: boolean;
      foam: boolean;
      glints: number;
      fordStones: number;
      waterPhaseVariance: number;
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
    };
    detailScatter?: {
      instanceClasses: number;
      totalInstances: number;
      seededInstances: number;
      densityTier: 'desktop' | 'mobile-reduced' | 'off';
      seed: number;
      classes: Array<{ id: 'rocks' | 'stumps' | 'dry_grass' | 'wagon_ruts' | 'claim_posts'; instances: number; visibleInstances: number; drawCalls: 1 }>;
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

interface Window {
  __THREE_GAME_DIAGNOSTICS__?: ThreeGameDiagnostics;
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
  };
  /** Present only with ?debug — parking-free positioning for interaction e2e. */
  __GR_TEST__?: {
    teleport: (x: number, z: number) => void;
    spawnPack: (n: number, radius?: number, opts?: { speedScale?: number; wrecker?: boolean }) => void;
    spawnThief: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    spawnWrecker: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    wreck: (family: GrBuildableId, index: number) => boolean;
    demolish: (family: GrBuildableId, index: number) => boolean;
    resetRun: () => void;
    toggleWeapon: () => 'rig' | 'blast';
    setBlastAim: (x: number, z: number) => { x: number; z: number };
    setDifficultyPreset: (preset: string) => 'greenhorn' | 'trail' | 'vein-hunter';
    warmVfx: () => Promise<void>;
    clearScores: () => void;
    setBalance: (path: string, value: number | boolean | string) => boolean;
    grantGold: (n: number) => void;
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
      meter: string;
      assayOrderSlots: number;
    };
    takeResearchNode: (id: string) => boolean;
    availableResearchPicks: () => string[];
    economyLog: () => readonly unknown[];
    summarizeLog: (log: readonly unknown[]) => {
      panned: number;
      granted: number;
      spent: number;
      beaconsBuilt: number;
      repairSpent: number;
      repairs: number;
    };
    setBeaconWave: (wave: number | null) => void;
    setWave: (wave: number) => void;
    setTestClip: (slot: string, frames: string[], fps: number) => void;
    setBuildMode: (on: boolean) => void;
    selectBuildable: (id: string) => boolean;
    rotateBuildGhost: () => boolean;
    confirmBuild: () => boolean;
    enemyPositions: () => Array<{
      id: number;
      x: number;
      y: number;
      z: number;
      hp: number;
      vx: number;
      vz: number;
      thief?: boolean;
      wrecker?: boolean;
      state?: 'none' | 'seekHolding' | 'grabbing' | 'fleeing';
      wreckState?: 'none' | 'seekBuilding' | 'swinging';
      carried?: number;
      edge?: 'north' | 'south' | 'east' | 'west' | null;
      zone?: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
    }>;
    spawnEnemyAt: (x: number, z: number) => boolean;
    scriptEnemyAt: (x: number, z: number, targetX: number, targetZ: number, speed: number) => boolean;
    clearEnemies: () => void;
    goldPickups: () => Array<{ active: boolean; amount: number; position: { x: number; z: number } }>;
    placeBeacon: () => boolean;
    state: () => {
      enemiesAlive: number;
      xp: number;
      boltsAlive: number;
      combat: {
        hits: number;
        misses: number;
        staleSwitches: number;
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
        lastDetonation: { x: number; z: number } | null;
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
