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
  kills: number;
  goldPanned: number;
  deathLedger: {
    timeAlive: number;
    kills: number;
    goldPanned: number;
  };
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
    logLength: number;
    state: { gold: number };
    replay: { gold: number };
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
  vfx: {
    activeFloatTexts: number;
  };
  renderer: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
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

interface Window {
  __THREE_GAME_DIAGNOSTICS__?: ThreeGameDiagnostics;
  /** Present only with ?debug — parking-free positioning for interaction e2e. */
  __GR_TEST__?: {
    teleport: (x: number, z: number) => void;
    spawnPack: (n: number, radius?: number) => void;
    resetRun: () => void;
    state: () => {
      enemiesAlive: number;
      xp: number;
      boltsAlive: number;
    };
  };
}
