/// <reference types="vite/client" />

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
    selectedBuildable: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
    buildables: Array<{
      id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
      displayName: string;
      cost: number;
      count: number;
      maxCount: number;
      canAfford: boolean;
      selected: boolean;
      iconSlot: string;
    }>;
    stockpileCount: number;
    beaconCount: number;
    beaconMax: number;
    nextBeaconCost: number;
    canAffordBeacon: boolean;
    weapon: 'rig' | 'blast';
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
  };
  build: {
    mode: boolean;
    ghostValid: boolean;
    ghostPos: { x: number; z: number };
    ghostRotationSteps: number;
    ghostFootprint: { w: number; d: number };
    selectedBuildable: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
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
    buildables: Array<{ id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret'; count: number }>;
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
      id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
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
      id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | null;
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
  }>>;
  spriteStats: {
    activeAnimators: number;
    textureSwapsPerFrame: number;
    fadeOverlaysActive: number;
  };
  terrain: {
    playerZone: 'bank' | 'shallows' | 'river' | 'ford' | 'out';
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

interface Window {
  __THREE_GAME_DIAGNOSTICS__?: ThreeGameDiagnostics;
  __GR_GUI__?: GoldRushGui;
  /** Present only with ?debug — parking-free positioning for interaction e2e. */
  __GR_TEST__?: {
    teleport: (x: number, z: number) => void;
    spawnPack: (n: number, radius?: number, opts?: { speedScale?: number; wrecker?: boolean }) => void;
    spawnThief: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    spawnWrecker: (edge?: 'north' | 'south' | 'east' | 'west') => boolean;
    wreck: (family: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret', index: number) => boolean;
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
      buildables: Array<{ id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret'; count: number }>;
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
