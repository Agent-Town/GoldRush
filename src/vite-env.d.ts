/// <reference types="vite/client" />

interface ThreeGameDiagnostics {
  frame: number;
  elapsed: number;
  timeAlive: number;
  runState: 'boot' | 'playing' | 'levelup' | 'dead';
  paused: boolean;
  state: 'boot' | 'playing' | 'levelup' | 'dead' | 'paused';
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
    enemiesAlive: number;
    timeAlive: number;
    state: 'boot' | 'playing' | 'levelup' | 'dead';
    paused: boolean;
    buildMode: boolean;
    buildMenuOpen: boolean;
    selectedBuildable: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile';
    buildables: Array<{
      id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile';
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
  };
  hp: number;
  maxHp: number;
  heroIframes: boolean;
  enemiesAlive: number;
  enemyPoolSize: number;
  boltsAlive: number;
  xp: number;
  xpMotesAlive: number;
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
  };
  wave: number;
  nextWaveInSim: number;
  trickleInterval: number;
  waveSpawnedTotal: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
  pulse: number;
  edge: 'north' | 'south' | 'east' | 'west' | null;
  budget: number;
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
    };
  };
  build: {
    mode: boolean;
    ghostValid: boolean;
    ghostPos: { x: number; z: number };
    ghostRotationSteps: number;
    ghostFootprint: { w: number; d: number };
    selectedBuildable: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile';
    beacons: number;
    palisades: number;
    sluices: number;
    stockpiles: number;
    beaconPositions: Array<{ x: number; z: number }>;
    palisadePositions: Array<{ x: number; z: number }>;
    sluicePositions: Array<{ x: number; z: number }>;
    stockpilePositions: Array<{ x: number; z: number }>;
    buildables: Array<{ id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile'; count: number }>;
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
  }>>;
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
    spawnPack: (n: number, radius?: number) => void;
    resetRun: () => void;
    warmVfx: () => Promise<void>;
    clearScores: () => void;
    setBalance: (path: string, value: number) => boolean;
    grantGold: (n: number) => void;
    grantXp: (n: number) => void;
    maxUpgrades: () => void;
    setFillersDisabled: (disabled: boolean) => void;
    economyLog: () => readonly unknown[];
    summarizeLog: (log: readonly unknown[]) => {
      panned: number;
      granted: number;
      spent: number;
      beaconsBuilt: number;
    };
    setBeaconWave: (wave: number | null) => void;
    setTestClip: (slot: string, frames: string[], fps: number) => void;
    setBuildMode: (on: boolean) => void;
    selectBuildable: (id: string) => boolean;
    rotateBuildGhost: () => boolean;
    confirmBuild: () => boolean;
    enemyPositions: () => Array<{ x: number; z: number; hp: number }>;
    spawnEnemyAt: (x: number, z: number) => boolean;
    clearEnemies: () => void;
    placeBeacon: () => boolean;
    state: () => {
      enemiesAlive: number;
      xp: number;
      boltsAlive: number;
      buildables: Array<{ id: 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile'; count: number }>;
      economy: {
        banked: number;
        bankCap: number;
      };
      balance: {
        rig: {
          fireRate: number;
        };
      };
    };
  };
}
