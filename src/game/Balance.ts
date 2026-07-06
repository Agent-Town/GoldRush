import * as THREE from 'three';

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
  enemy: {
    poolSize: 96,
    hp: 25.2,
    speed: 2.7,
    speedVariance: 0.1,
    contactDamage: 8,
    contactCooldown: 0.8,
    touchRadius: 0.6,
    separationRadius: 0.9,
    separationRadiusSq: 0.9 * 0.9,
    separationStrength: 0.9,
    spatialHashCellSize: 2,
    spatialHashWorldMin: -40,
    spatialHashWorldMax: 40,
    debugPackSize: 5,
    debugPackRadius: 3.2,
    groundY: 0.05,
  },
  combatReadability: {
    enemyFlashSeconds: 0.18,
    enemyFlashIntensity: 0.9,
    turretPulseSeconds: 0.18,
    turretPulseIntensity: 0.14,
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
    budgetCeiling: 42,
    lullSeconds: 8,
    lullFloor12: 8,
    pulsesPerWave: 2,
    edgesPerPulse: 2,
    hpScalePerWave: 1.12,
    speedScalePerWave: 1.02,
    speedScaleCap: 1.3,
    aliveCap: 60,
    spawnRingRadius: 26,
    pressureBudgetShared: true,
  },
  pathing: {
    riverBlocksEnemies: true,
    deepWaterDisarmsHero: true,
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
  wreck: {
    hp: {
      sentry_beacon: 40,
      palisade: 60,
      sluice: 40,
      stockpile: 80,
      turret: 50,
      assay_office: 60,
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
    territoryRing: [
      { x: 0, z: 15, rotationSteps: 1 },
      { x: 0, z: 9, rotationSteps: 1 },
      { x: -3, z: 12, rotationSteps: 0 },
      { x: 3, z: 12, rotationSteps: 0 },
    ],
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
  },
  world: {
    terrainSegments: 64,
    terrainMobileSegments: 40,
    vistaSegments: 12,
    vistaMobileSegments: 7,
    terrainRelief: 1,
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
  },
  terrain: {
    featureMix: 0.86,
  },
  sprite: {
    turnRateDegPerS: 540,
    orientationFadeMs: 100,
  },
  anim: {
    frameBlendMs: 80,
    walkFps: 9.5,
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
