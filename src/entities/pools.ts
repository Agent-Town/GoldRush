import * as THREE from 'three';
import { GeneratedSpriteBatch } from '../assets/generated';
import { SpriteAnimator, type CharacterSpriteClip, type SpriteMotionSnapshot } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder, type AssetSlotId } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import type { PalisadeBlocker } from './Palisade';
import {
  ClaimJumperEnemy,
  createClaimJumperAssets,
  disposeClaimJumperAssets,
  type ClaimJumperAssets,
  type EnemySpawnParams,
  type EnemySuspendRestoreRefs,
  type EnemySuspendSnapshot,
  type ThiefUpdateContext,
  type WreckerUpdateContext,
} from './Enemy';
import type { RotationDirection } from '../assets/OrientationResolver';
import { RUN_CAST_SCALE } from './runCastScale';
import * as Terrain from '../world/Terrain';
import { disposeObject3D } from '../utils/dispose';
import railcarBoilerUrl from '../../assets/processed/boss-railcar-boiler.png?url';
import railcarBoilerDamagedUrl from '../../assets/processed/boss-railcar-boiler-damaged.png?url';
import railcarCabinUrl from '../../assets/processed/boss-railcar-cabin.png?url';
import railcarCabinDamagedUrl from '../../assets/processed/boss-railcar-cabin-damaged.png?url';
import railcarWheelsUrl from '../../assets/processed/boss-railcar-wheels.png?url';
import railcarWheelsDamagedUrl from '../../assets/processed/boss-railcar-wheels-damaged.png?url';
import { isMothSwarmEnemy } from '../systems/MothSwarm';

const ENEMY_SPRITE_Y = 0.72;
const BOSS_HP_MAX_SEGMENTS = 8;
const BARON_HP_SEGMENTS = 8;
const BOSS_HP_WIDTH = 1.9;
const BOSS_HP_FILL_WIDTH = 1.72;
const RAILCAR_DAMAGE_THRESHOLD = 0.5;
const RAILCAR_RAIL_HEAD_Y = 0.125;
const RAILCAR_3D_HEIGHT = 1.202;
const RAILCAR_3D_URL = new URL('../../assets/pilots/railcar-3d/railcar.glb', import.meta.url).href;
const RAILCAR_3D_TRIANGLES = 10_948;
const RAILCAR_3D_COMPONENTS = {
  wheels: { mesh: 'Railcar_Wheels', morph: 'Damage_BentWheels', damageColor: '#d95f32', damageGlow: 2.4 },
  boiler: { mesh: 'Railcar_Boiler', morph: 'Damage_VentingBoiler', damageColor: '#5b8a8a', damageGlow: 0.9 },
  cabin: { mesh: 'Railcar_Cabin', morph: 'Damage_CrackedCabin', damageColor: '#c4883a', damageGlow: 0.9 },
} as const;
type RailcarComponentId = keyof typeof RAILCAR_3D_COMPONENTS;
type Railcar3dState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';
const FEVER_GOLD = new THREE.Color(Balance.legibility.feveredColor);
const IDLE_SPRITE_MOTION: SpriteMotionSnapshot = {
  active: false,
  phase: 0,
  bobOffset: 0,
  leanDeg: 0,
  leanRad: 0,
};

type EnemySpritePresentation = {
  variantId: string;
  sprites: GeneratedSpriteBatch;
  fades: GeneratedSpriteBatch;
  animator: SpriteAnimator;
};

export type FeverAccentDiagnostics = {
  active: boolean;
  kind: 'human' | 'machine' | 'none';
  strength: number;
  surged: boolean;
  channel: 'watch-paint-instanced' | 'none';
};

export function feverAccentState(
  enemy: {
    alive: boolean;
    eliteKind?: 'baron' | 'railcar' | null;
    variantId?: string | null;
    stealState?: string;
    wreckState?: string;
    visible?: boolean;
  },
  pulse = 0,
): FeverAccentDiagnostics {
  if (!enemy.alive || enemy.visible === false || enemy.eliteKind === 'baron' || enemy.eliteKind === 'railcar') {
    return { active: false, kind: 'none', strength: 0, surged: false, channel: 'none' };
  }
  const surged = enemy.stealState === 'grabbing' || enemy.wreckState === 'swinging';
  const base = surged ? Balance.legibility.feveredSurgeStrength : Balance.legibility.feveredRestStrength;
  return {
    active: true,
    kind: enemy.variantId === 'steam_wrecker' ? 'machine' : 'human',
    strength: round3(base + Math.sin(pulse) * Balance.legibility.feveredPulseStrength),
    surged,
    channel: 'watch-paint-instanced',
  };
}

function createEnemySpritePresentation(variantId: string, slotId: AssetSlotId): EnemySpritePresentation {
  const sprites = new GeneratedSpriteBatch(slotId, Balance.enemy.poolSize, {
    name: `${variantId}Sprites`, y: ENEMY_SPRITE_Y, scale: [1.28, 1.55], renderOrder: RenderLayers.gameplay, lazy: true,
  });
  const fades = new GeneratedSpriteBatch(slotId, Balance.enemy.poolSize, {
    name: `${variantId}SpriteFades`, y: ENEMY_SPRITE_Y, scale: [1.28, 1.55], renderOrder: RenderLayers.gameplayFade, lazy: true,
  });
  return { variantId, sprites, fades, animator: new SpriteAnimator(slotId, sprites.material, undefined, fades.material) };
}

export type EnemyLightSource = { x: number; z: number; radius: number; kind?: 'light' | 'watch' };
export type EnemyLightDimmingConfig = {
  enabled: boolean;
  darkness: number;
  minLight: number;
  falloff: number;
  sources: readonly EnemyLightSource[];
};
export type EnemyDimmingDiagnostics = {
  enabled: boolean;
  darkness: number;
  minLight: number;
  falloff: number;
  sources: number;
  dimmed: number;
  minFactor: number;
};
export type BossHpBarDiagnostics = {
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
export type EnemyPoolSuspendSnapshot = {
  spawnSerial: number;
  active: EnemySuspendSnapshot[];
};
type BossBarState = {
  x: number;
  y: number;
  z: number;
  scale: number;
  ratio: number;
  segments: number;
  groupId: string | null;
  aliveComponents: number;
  destroyedComponents: number;
  components?: Array<{ id: string; label: string; hp: number; maxHp: number }>;
};

type ActiveAnimation = {
  clip: CharacterSpriteClip;
  orientation: RotationDirection;
  active: boolean;
  speed: number;
  groundSpeed: number;
};

function animationSpeed(enemy: ClaimJumperEnemy): number {
  const groundSpeed = Math.hypot(enemy.velocityX, enemy.velocityZ);
  const visualScale = enemy.visualScale * (enemy.eliteKind ? 1 : RUN_CAST_SCALE);
  return groundSpeed * 4 / (Balance.anim.strideUnits * visualScale * Balance.anim.walkFpsPerSpeed);
}

function regularAnimation(enemy: ClaimJumperEnemy, requestedClip = enemy.animationClip): ActiveAnimation {
  const groundSpeed = Math.hypot(enemy.velocityX, enemy.velocityZ);
  const stoppedGait = groundSpeed <= 0.01 && (requestedClip === 'walk' || requestedClip === 'flee');
  return {
    clip: stoppedGait ? 'idle' : requestedClip,
    orientation: enemy.animationOrientation,
    active: true,
    speed: animationSpeed(enemy),
    groundSpeed,
  };
}

export class EnemyPool {
  readonly group = new THREE.Group();

  private readonly assets: ClaimJumperAssets = createClaimJumperAssets();
  private readonly enemies: ClaimJumperEnemy[] = [];
  private readonly previousActive: boolean[] = [];
  private readonly previousPositions: THREE.Vector3[] = [];
  private readonly currentPositions: THREE.Vector3[] = [];
  private readonly renderPositions: THREE.Vector3[] = [];
  private readonly previousRotations: number[] = [];
  private readonly currentRotations: number[] = [];
  private readonly renderRotations: number[] = [];
  private readonly renderParts: THREE.InstancedMesh[] = [];
  private readonly railcarParts: Array<{ id: string; healthy: THREE.InstancedMesh; damaged: THREE.InstancedMesh }> = [];
  private readonly railcarLocalMatrices: THREE.Matrix4[] = [];
  private railcar3dState: Railcar3dState = 'off';
  private railcar3dLoadSerial = 0;
  private railcar3dModel?: THREE.Object3D;
  private railcar3dGroupId: string | null = null;
  private readonly railcar3dMeshes = new Map<RailcarComponentId, THREE.Mesh>();
  private readonly railcar3dOffsets = new Map<RailcarComponentId, THREE.Vector3>();
  private readonly railcar3dDamaged = new Set<RailcarComponentId>();
  private readonly railcar3dCenter = new THREE.Vector3();
  private readonly watchPaintMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: Balance.legibility.feveredOverlayOpacity,
    depthWrite: false,
    fog: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  private readonly watchPaintMeshes: THREE.InstancedMesh[] = [];
  private readonly sackMesh: THREE.InstancedMesh = new THREE.InstancedMesh(
    this.assets.sackGeometry,
    this.assets.sackMaterial,
    Balance.enemy.poolSize,
  );
  private readonly hitFlashGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly hitFlashMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8e8',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  private readonly hitFlashes = new THREE.InstancedMesh(this.hitFlashGeometry, this.hitFlashMaterial, Balance.enemy.poolSize);
  private readonly bannerPoleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.36, 8);
  private readonly bannerClothGeometry = new THREE.BoxGeometry(0.52, 0.34, 0.035);
  private readonly bannerPoleMaterial = new THREE.MeshStandardMaterial({
    color: '#4b2a17',
    roughness: 0.72,
    metalness: 0.08,
  });
  private readonly bannerClothMaterial = new THREE.MeshStandardMaterial({
    color: '#7f2633',
    roughness: 0.82,
    metalness: 0.03,
  });
  private readonly nightBasicMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  private readonly bannerPoleMesh: THREE.InstancedMesh = new THREE.InstancedMesh(this.bannerPoleGeometry, this.bannerPoleMaterial, Balance.enemy.poolSize);
  private readonly bannerClothMesh: THREE.InstancedMesh = new THREE.InstancedMesh(this.bannerClothGeometry, this.bannerClothMaterial, Balance.enemy.poolSize);
  private readonly bossHpGroup = new THREE.Group();
  private readonly bossHpBackGeometry = new THREE.BoxGeometry(BOSS_HP_WIDTH, 0.16, 0.05);
  private readonly bossHpFillGeometry = new THREE.BoxGeometry(BOSS_HP_FILL_WIDTH, 0.08, 0.06);
  private readonly bossHpSegmentGeometry = new THREE.BoxGeometry(0.018, 0.18, 0.07);
  private readonly bossHpBackMaterial = new THREE.MeshBasicMaterial({ color: '#24150d', transparent: true, opacity: 0.72, depthTest: false });
  private readonly bossHpFillMaterial = new THREE.MeshBasicMaterial({ color: '#7f2633', depthTest: false });
  private readonly bossHpSegmentMaterial = new THREE.MeshBasicMaterial({ color: '#f5e6c8', transparent: true, opacity: 0.85, depthTest: false });
  private readonly bossHpBack = new THREE.Mesh(this.bossHpBackGeometry, this.bossHpBackMaterial);
  private readonly bossHpFill = new THREE.Mesh(this.bossHpFillGeometry, this.bossHpFillMaterial);
  private readonly bossHpSegments = new THREE.Group();
  private readonly generatedSprites = new GeneratedSpriteBatch(assetSlots.charBanditBase, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperSprites',
    y: ENEMY_SPRITE_Y,
    scale: [1.28, 1.55],
    renderOrder: RenderLayers.gameplay,
    onLoaded: () => this.setProceduralVisible(false),
  });
  private readonly generatedSpriteFades = new GeneratedSpriteBatch(assetSlots.charBanditBase, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperSpriteFades',
    y: ENEMY_SPRITE_Y,
    scale: [1.28, 1.55],
    renderOrder: RenderLayers.gameplayFade,
  });
  private readonly spriteAnimator = new SpriteAnimator(
    assetSlots.charBanditBase,
    this.generatedSprites.material,
    undefined,
    this.generatedSpriteFades.material,
  );
  private readonly thiefSprites = new GeneratedSpriteBatch(assetSlots.charBanditThief, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperThiefSprites',
    y: ENEMY_SPRITE_Y,
    scale: [1.28, 1.55],
    renderOrder: RenderLayers.gameplay,
  });
  private readonly thiefSpriteFades = new GeneratedSpriteBatch(assetSlots.charBanditThief, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperThiefSpriteFades',
    y: ENEMY_SPRITE_Y,
    scale: [1.28, 1.55],
    renderOrder: RenderLayers.gameplayFade,
  });
  private readonly thiefSpriteAnimator = new SpriteAnimator(
    assetSlots.charBanditThief,
    this.thiefSprites.material,
    undefined,
    this.thiefSpriteFades.material,
  );
  private readonly e2SpritePresentations = [
    createEnemySpritePresentation('rail_tough', assetSlots.charE2RailTough),
    createEnemySpritePresentation('steam_wrecker', assetSlots.charE2SteamWrecker),
    createEnemySpritePresentation('coal_thief', assetSlots.charE2CoalThief),
  ];
  private readonly baronSprites = new GeneratedSpriteBatch(assetSlots.charBaron, Balance.enemy.poolSize, {
    name: 'GeneratedBaronSprites',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: RenderLayers.gameplay,
    lazy: true,
  });
  private readonly baronSpriteFades = new GeneratedSpriteBatch(assetSlots.charBaron, Balance.enemy.poolSize, {
    name: 'GeneratedBaronSpriteFades',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: RenderLayers.gameplayFade,
    lazy: true,
  });
  private readonly baronBannerSprites = new GeneratedSpriteBatch(assetSlots.propBaronBanner, Balance.enemy.poolSize, {
    name: 'GeneratedBaronBannerSprites',
    y: 1.7,
    scale: [0.9, 0.9],
    renderOrder: RenderLayers.gameplay + 0.01,
    lazy: true,
  });
  private readonly localMatrices: THREE.Matrix4[] = [];
  private readonly cells: ClaimJumperEnemy[][] = [];
  private readonly touchedCells: number[] = [];
  private readonly baseMatrix = new THREE.Matrix4();
  private readonly instanceMatrix = new THREE.Matrix4();
  private readonly watchPaintBaseMatrix = new THREE.Matrix4();
  private readonly watchPaintScaleMatrix = new THREE.Matrix4().makeScale(
    Balance.legibility.feveredOverlayScale,
    Balance.legibility.feveredOverlayScale,
    Balance.legibility.feveredOverlayScale,
  );
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly syncObject = new THREE.Object3D();
  private readonly warmHitFlashPosition = new THREE.Vector3();
  private readonly sackLocalMatrix = new THREE.Matrix4();
  private readonly bannerPoleLocalMatrix = new THREE.Matrix4();
  private readonly bannerClothLocalMatrix = new THREE.Matrix4();
  private readonly normalPonchoColor = new THREE.Color('#a0522d');
  private readonly carryingPonchoColor = new THREE.Color('#5b8a8a');
  private readonly wreckerPonchoColor = new THREE.Color('#8b7d3c');
  private readonly baronPonchoColor = new THREE.Color('#7f2633');
  private readonly shadowColor = new THREE.Color('#2e1b0e');
  private readonly faceColor = new THREE.Color('#d9a268');
  private readonly hatColor = new THREE.Color('#4b2a17');
  private readonly sackColor = new THREE.Color('#8b7d3c');
  private readonly wreckerMarkerColor = new THREE.Color('#a0522d');
  private readonly bannerPoleColor = new THREE.Color('#4b2a17');
  private readonly bannerClothColor = new THREE.Color('#7f2633');
  private readonly dimmedColor = new THREE.Color();
  private readonly feverAccentColor = new THREE.Color();
  private lightDimming: EnemyLightDimmingConfig = {
    enabled: false,
    darkness: 0,
    minLight: 1,
    falloff: 1,
    sources: [],
  };
  private readonly gridSize: number;
  private readonly gridMin: number;
  private readonly gridMax: number;
  private readonly cellSize: number;
  private active = 0;
  private activeHitFlashes = 0;
  private warmHitFlashFrames = 0;
  private spawnSerial = 0;
  private enemyFogEnabled = true;
  private nightBasicActive = false;
  private baronSpriteAnimator: SpriteAnimator | null = null;
  private feverPulse = 0;

  constructor(private readonly camera?: THREE.Camera) {
    this.group.name = 'EnemyPool';
    this.railcar3dState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.publishRailcar3d();
    this.cellSize = Balance.enemy.spatialHashCellSize;
    this.gridMin = Balance.enemy.spatialHashWorldMin;
    this.gridMax = Balance.enemy.spatialHashWorldMax;
    this.gridSize = Math.ceil((this.gridMax - this.gridMin) / this.cellSize);
    this.createRenderParts();
    this.createRailcarParts();
    this.createSackMesh();
    this.createHitFlashMesh();
    this.createBannerMeshes();
    this.createBossHpBar();
    this.group.add(
      this.generatedSprites.group,
      this.generatedSpriteFades.group,
      this.thiefSprites.group,
      this.thiefSpriteFades.group,
      ...this.e2SpritePresentations.flatMap(({ sprites, fades }) => [sprites.group, fades.group]),
      this.baronSprites.group,
      this.baronSpriteFades.group,
      this.baronBannerSprites.group,
      this.bossHpGroup,
    );

    for (let i = 0; i < this.gridSize * this.gridSize; i += 1) {
      this.cells.push([]);
    }

    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      const enemy = new ClaimJumperEnemy(i, this.assets);
      this.enemies.push(enemy);
      this.previousActive.push(false);
      this.previousPositions.push(new THREE.Vector3());
      this.currentPositions.push(new THREE.Vector3());
      this.renderPositions.push(new THREE.Vector3());
      this.previousRotations.push(0);
      this.currentRotations.push(0);
      this.renderRotations.push(0);
    }
    this.syncInstances();
  }

  get activeCount(): number {
    return this.active;
  }

  get capacity(): number {
    return this.enemies.length;
  }

  get all(): readonly ClaimJumperEnemy[] {
    return this.enemies;
  }

  renderPositionOf(enemy: ClaimJumperEnemy): THREE.Vector3 {
    return this.renderPositions[enemy.id] ?? enemy.group.position;
  }

  renderRotationOf(enemy: ClaimJumperEnemy): number {
    return this.renderRotations[enemy.id] ?? enemy.group.rotation.y;
  }

  railcarPresentation(enemy: ClaimJumperEnemy): { mesh: boolean; visible: boolean; railY: number; railRotation: number; textureKey: string; damaged: boolean; damageThreshold: number; wreckerMarker: boolean; markerColor: string; source: 'glb' | 'billboard'; mounted: boolean; morphInfluence: number; bossBarY: number; bossBarScale: number } {
    const damaged = enemy.currentHp / Math.max(1, enemy.maxHp) <= RAILCAR_DAMAGE_THRESHOLD;
    const component = enemy.bossComponentId as RailcarComponentId | null;
    const mounted = this.railcar3dState === 'ready' && this.railcar3dGroupId === enemy.bossGroupId;
    return {
      mesh: enemy.eliteKind === 'railcar',
      visible: this.railcarVisible(enemy),
      railY: Terrain.visualY(enemy.position.x, enemy.position.z, Balance.enemy.groundY),
      railRotation: this.renderRotationOf(enemy),
      textureKey: `boss-railcar-${enemy.bossComponentId ?? 'unknown'}${damaged ? '-damaged' : ''}`,
      damaged,
      damageThreshold: RAILCAR_DAMAGE_THRESHOLD,
      wreckerMarker: enemy.isAlive && enemy.isWrecker,
      markerColor: '#a0522d',
      source: mounted ? 'glb' : 'billboard',
      mounted,
      morphInfluence: component && (damaged || this.railcar3dDamaged.has(component)) ? 1 : 0,
      bossBarY: this.bossHpGroup.position.y,
      bossBarScale: this.bossHpGroup.scale.x,
    };
  }

  get activeFlashCount(): number {
    return this.activeHitFlashes;
  }

  get hitFlashCount(): number {
    let total = 0;
    for (const enemy of this.enemies) total += enemy.hitFlashCount;
    return total;
  }

  get bossHpBarDiagnostics(): BossHpBarDiagnostics {
    const state = this.bossBarState(true);
    return {
      visible: this.bossHpGroup.visible,
      ratio: round3(state?.ratio ?? 0),
      renderedRatio: round3(this.bossHpFill.scale.x),
      litSegments: this.bossHpSegments.children.filter((segment) => segment.visible).length,
      segments: this.bossHpGroup.visible ? state?.segments ?? 0 : 0,
      groupId: state?.groupId ?? null,
      aliveComponents: state?.aliveComponents ?? 0,
      destroyedComponents: state?.destroyedComponents ?? 0,
      components: state?.components ?? [],
    };
  }

  get dimmingDiagnostics(): EnemyDimmingDiagnostics {
    let dimmed = 0;
    let minFactor = 1;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const factor = this.lightFactorFor(enemy);
      if (factor < 0.98) dimmed += 1;
      minFactor = Math.min(minFactor, factor);
    }
    return {
      enabled: this.lightDimming.enabled,
      darkness: round3(this.lightDimming.darkness),
      minLight: round3(this.lightDimming.minLight),
      falloff: round2(this.lightDimming.falloff),
      sources: this.lightDimming.sources.length,
      dimmed,
      minFactor: round3(this.active > 0 ? minFactor : 1),
    };
  }

  prefetchBaronPresentation(): void {
    this.ensureBaronPresentation();
  }

  setLightDimming(config: EnemyLightDimmingConfig): void {
    this.lightDimming = {
      enabled: config.enabled,
      darkness: THREE.MathUtils.clamp(config.darkness, 0, 1),
      minLight: THREE.MathUtils.clamp(config.minLight, 0, 1),
      falloff: Math.max(0.1, config.falloff),
      sources: config.sources.map((source) => ({
        x: source.x,
        z: source.z,
        radius: Math.max(0.1, source.radius),
        kind: source.kind,
      })),
    };
  }

  lightFactorFor(enemy: ClaimJumperEnemy): number {
    const dimming = this.lightDimming;
    if (!dimming.enabled || dimming.darkness <= 0 || !enemy.isAlive) return 1;
    let sourceLight = dimming.sources.length > 0 ? dimming.minLight : 1;
    for (const source of dimming.sources) {
      const dx = enemy.group.position.x - source.x;
      const dz = enemy.group.position.z - source.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= source.radius) {
        sourceLight = 1;
        break;
      }
      const falloffT = THREE.MathUtils.clamp((distance - source.radius) / dimming.falloff, 0, 1);
      const light = dimming.minLight + (1 - dimming.minLight) * (1 - falloffT) ** 3;
      sourceLight = Math.max(sourceLight, light);
    }
    return THREE.MathUtils.clamp(1 - dimming.darkness * (1 - sourceLight), 0, 1);
  }

  watchPaintedFor(enemy: ClaimJumperEnemy): boolean {
    return this.isWatchPainted(enemy);
  }

  feverAccentFor(enemy: ClaimJumperEnemy): FeverAccentDiagnostics {
    return feverAccentState(
      {
        alive: enemy.isAlive,
        eliteKind: enemy.eliteKind,
        variantId: enemy.variantId,
        stealState: enemy.stealState,
        wreckState: enemy.wreckState,
        visible: this.renderLightFactor(this.lightFactorFor(enemy)) > 0,
      },
      this.feverPulse + enemy.id * 0.73,
    );
  }

  warmHitFlashes(position: THREE.Vector3): Promise<void> {
    if (Balance.combatReadability.enemyFlashSeconds <= 0 || Balance.combatReadability.enemyFlashIntensity <= 0) return Promise.resolve();
    this.warmHitFlashPosition.copy(position);
    this.warmHitFlashFrames = 2;
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
  }

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}, preferredSlot?: number): ClaimJumperEnemy | null {
    const enemy =
      preferredSlot === undefined
        ? this.enemies.find((candidate) => !candidate.isAlive)
        : Number.isInteger(preferredSlot) && preferredSlot >= 0 && preferredSlot < this.enemies.length
          ? this.enemies[preferredSlot]
          : undefined;
    if (!enemy || enemy.isAlive) return null;
    enemy.spawn(position, { ...params, formationSeed: this.spawnSerial });
    if (enemy.eliteKind === 'railcar' && enemy.variantId === 'baron_railcar') this.ensureRailcar3d();
    this.previousActive[enemy.id] = false;
    this.spawnSerial += 1;
    this.active += 1;
    this.syncEnemyInstance(enemy);
    this.syncEnemySprite(enemy);
    this.syncBossHpBar();
    return enemy;
  }

  captureSuspend(): EnemyPoolSuspendSnapshot {
    return {
      spawnSerial: this.spawnSerial,
      active: this.enemies.filter((enemy) => enemy.isAlive).map((enemy) => enemy.captureSuspend()),
    };
  }

  restoreSuspend(snapshot: EnemyPoolSuspendSnapshot, refs: EnemySuspendRestoreRefs = {}): boolean {
    const slots = new Set<number>();
    if (!Number.isInteger(snapshot.spawnSerial) || snapshot.spawnSerial < 0) return false;
    for (const saved of snapshot.active) {
      if (!Number.isInteger(saved.slot) || saved.slot < 0 || saved.slot >= this.enemies.length || slots.has(saved.slot)) return false;
      slots.add(saved.slot);
    }

    this.recycleAll();
    const restored: Array<{ enemy: ClaimJumperEnemy; saved: EnemySuspendSnapshot }> = [];
    for (const saved of snapshot.active) {
      const enemy = this.spawn(
        new THREE.Vector3(saved.position.x, saved.position.y, saved.position.z),
        {
          speedScale: Balance.enemy.speed > 0 ? saved.speed / Balance.enemy.speed : 1,
          hpScale: Balance.enemy.hp > 0 ? saved.maxHp / Balance.enemy.hp : 1,
          activationDelay: saved.activationDelay,
          edge: saved.edge ?? undefined,
          thief: saved.thief,
          wrecker: saved.wrecker,
          eliteKind: saved.eliteKind ?? undefined,
          visualScale: saved.visualScale,
          banner: saved.banner,
          contactDamageScale: saved.contactDamageScale,
          buildingDamageScale: saved.buildingDamageScale,
          supportBuildingDamageScale: saved.supportBuildingDamageScale,
          heroPursuitRange: saved.heroPursuitRange,
          variantId: saved.variantId ?? undefined,
          variantLabel: saved.variantLabel ?? undefined,
          tint: saved.variantTint ?? undefined,
          boltDamageMult: saved.boltDamageMult,
          bossGroupId: saved.bossGroupId ?? undefined,
          bossGroupSize: saved.bossGroupSize,
          bossGroupTotalHp: saved.bossGroupTotalHp,
          bossComponentId: saved.bossComponentId ?? undefined,
          bossComponentLabel: saved.bossComponentLabel ?? undefined,
          bossDegradeSpeedMult: saved.bossDegradeSpeedMult,
        },
        saved.slot,
      );
      if (!enemy) {
        this.recycleAll();
        return false;
      }
      restored.push({ enemy, saved });
    }

    for (const { enemy, saved } of restored) {
      enemy.restoreRuntime(saved, refs);
      this.previousActive[enemy.id] = false;
      this.previousPositions[enemy.id]?.copy(enemy.position);
      this.currentPositions[enemy.id]?.copy(enemy.position);
      this.renderPositions[enemy.id]?.copy(enemy.position);
      this.previousRotations[enemy.id] = enemy.group.rotation.y;
      this.currentRotations[enemy.id] = enemy.group.rotation.y;
      this.renderRotations[enemy.id] = enemy.group.rotation.y;
    }
    this.spawnSerial = snapshot.spawnSerial;
    this.clearSpatialHash();
    this.syncInstances();
    this.syncHitFlashes();
    return true;
  }

  degradeBossGroup(killed: ClaimJumperEnemy): { remaining: number; total: number } | null {
    const groupId = killed.bossGroupId;
    if (!groupId) return null;
    let remaining = 0;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive || enemy === killed || enemy.bossGroupId !== groupId) continue;
      remaining += 1;
      enemy.applyBossDegradation(killed.bossDegradeSpeedMult);
    }
    return {
      remaining,
      total: Math.max(killed.bossGroupSize, remaining + 1),
    };
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3 | readonly THREE.Vector3[],
    onContact: (enemy: ClaimJumperEnemy) => boolean,
    blockers: readonly PalisadeBlocker[] = [],
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
    movementSpeedMultiplier: (enemy: ClaimJumperEnemy) => number = () => 1,
  ): void {
    this.feverPulse += delta * Balance.legibility.feveredPulseSpeed;
    this.rebuildSpatialHash();
    const heroPositions = Array.isArray(heroPosition) ? heroPosition : [heroPosition];

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const enemyTarget = nearestPosition(heroPositions, enemy.group.position);

      let separationX = 0;
      let separationZ = 0;
      let formationSeparationX = 0;
      let formationSeparationZ = 0;
      const cellX = this.toGridCoord(enemy.group.position.x);
      const cellZ = this.toGridCoord(enemy.group.position.z);

      for (let dz = -1; dz <= 1; dz += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const cell = this.cellAt(cellX + dx, cellZ + dz);
          if (!cell) continue;

          for (const other of cell) {
            if (other === enemy || !other.isAlive) continue;
            const awayX = enemy.group.position.x - other.group.position.x;
            const awayZ = enemy.group.position.z - other.group.position.z;
            const distSq = awayX * awayX + awayZ * awayZ;
            if (distSq <= 0.0001 || distSq >= Balance.enemy.separationRadiusSq) continue;

            const distance = Math.sqrt(distSq);
            const strength = 1 - distance / Balance.enemy.separationRadius;
            separationX += (awayX / distance) * strength;
            separationZ += (awayZ / distance) * strength;
            const speed = Math.hypot(enemy.velocityX, enemy.velocityZ);
            const otherSpeed = Math.hypot(other.velocityX, other.velocityZ);
            const sameDirection =
              speed > 0.05 &&
              otherSpeed > 0.05 &&
              (enemy.velocityX * other.velocityX + enemy.velocityZ * other.velocityZ) / (speed * otherSpeed) > 0.65;
            if (sameDirection) {
              const offsetDelta = enemy.spreadOffset - other.spreadOffset;
              const side = Math.abs(offsetDelta) > 0.05 ? Math.sign(offsetDelta) : enemy.id < other.id ? -1 : 1;
              if (Math.abs(enemy.velocityZ) >= Math.abs(enemy.velocityX)) {
                formationSeparationX += side * strength;
              } else {
                formationSeparationZ += side * strength;
              }
            }
          }
        }
      }
      const formationSeparationSq = formationSeparationX * formationSeparationX + formationSeparationZ * formationSeparationZ;
      if (formationSeparationSq > 1) {
        const scale = 1 / Math.sqrt(formationSeparationSq);
        formationSeparationX *= scale;
        formationSeparationZ *= scale;
      }

      const contacted = enemy.update(
        delta,
        enemyTarget,
        separationX,
        separationZ,
        formationSeparationX,
        formationSeparationZ,
        blockers,
        thiefContext,
        wreckerContext,
        movementSpeedMultiplier(enemy),
      );
      if (contacted && onContact(enemy)) break;
    }
    this.syncEnemyFog();
    this.syncRenderInstances();
    this.syncHitFlashes();
    const normalAnimation = this.activeAnimation(false);
    const thiefAnimation = this.activeAnimation(true);
    const baronAnimation = this.activeBaronAnimation();
    const updateNormalSprites = () =>
      this.spriteAnimator.update(delta, normalAnimation.clip, normalAnimation.active ? normalAnimation.orientation : 'side', false, normalAnimation.speed, normalAnimation.groundSpeed);
    const updateThiefSprites = () =>
      this.thiefSpriteAnimator.update(delta, thiefAnimation.clip, thiefAnimation.active ? thiefAnimation.orientation : 'side', false, thiefAnimation.speed, thiefAnimation.groundSpeed);
    const updateBaronSprites = () =>
      this.baronSpriteAnimator?.update(delta, baronAnimation.clip, baronAnimation.active ? baronAnimation.orientation : 'side', false, baronAnimation.speed, baronAnimation.groundSpeed);
    if (normalAnimation.active || !thiefAnimation.active) {
      updateThiefSprites();
      updateNormalSprites();
    } else {
      updateNormalSprites();
      updateThiefSprites();
    }
    if (baronAnimation.active || this.baronSpriteAnimator) updateBaronSprites();
    for (const presentation of this.e2SpritePresentations) {
      const animation = this.activeVariantAnimation(presentation.variantId);
      // Mirror the baron lazy-load pattern: leave the E2 sheets/animator untouched until
      // this variant is actually on the field, so non-E2 contracts upload no E2 textures
      // (was a persistent +1 renderer-texture regression in vp-02:382 at wire time).
      if (!animation.active && !presentation.sprites.isLoaded) continue;
      presentation.sprites.ensureLoaded();
      presentation.fades.ensureLoaded();
      presentation.animator.update(delta, animation.clip, animation.active ? animation.orientation : 'side', false, animation.speed, animation.groundSpeed);
    }
  }

  captureRenderState(): void {
    for (const enemy of this.enemies) {
      this.previousActive[enemy.id] = enemy.isAlive;
      this.previousPositions[enemy.id]?.copy(enemy.group.position);
      this.previousRotations[enemy.id] = enemy.group.rotation.y;
    }
  }

  applyRenderInterpolation(alpha: number): void {
    const amount = THREE.MathUtils.clamp(alpha, 0, 1);
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      this.currentPositions[enemy.id]?.copy(enemy.group.position);
      this.currentRotations[enemy.id] = enemy.group.rotation.y;
      const previous = this.previousPositions[enemy.id];
      if (previous && this.previousActive[enemy.id]) {
        enemy.group.position.lerpVectors(previous, enemy.group.position, amount);
        const previousRotation = this.previousRotations[enemy.id] ?? enemy.group.rotation.y;
        enemy.group.rotation.y = previousRotation + signedAngleDeltaRadians(previousRotation, enemy.group.rotation.y) * amount;
      }
      this.renderPositions[enemy.id]?.copy(enemy.group.position);
      this.renderRotations[enemy.id] = enemy.group.rotation.y;
    }

    this.syncRenderInstances();
    this.syncSpriteVisuals();
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const current = this.currentPositions[enemy.id];
      if (current) enemy.group.position.copy(current);
      enemy.group.rotation.y = this.currentRotations[enemy.id] ?? enemy.group.rotation.y;
    }
  }

  recycle(enemy: ClaimJumperEnemy): void {
    if (!enemy.isAlive) return;
    this.markRailcar3dDestroyed(enemy);
    enemy.recycle();
    this.active = Math.max(0, this.active - 1);
    this.syncEnemyInstance(enemy);
    this.syncEnemySprite(enemy);
    this.syncHitFlashes();
    this.syncBossHpBar();
  }

  recycleAll(): void {
    if (this.railcar3dState !== 'off' && this.railcar3dState !== 'lite') this.disposeRailcar3d();
    for (const enemy of this.enemies) {
      enemy.recycle();
      this.previousActive[enemy.id] = false;
    }
    this.active = 0;
    this.spawnSerial = 0;
    this.clearSpatialHash();
    this.syncInstances();
    this.syncHitFlashes();
  }

  dispose(): void {
    this.disposeRailcar3d();
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    this.generatedSprites.dispose();
    this.generatedSpriteFades.dispose();
    this.spriteAnimator.dispose();
    this.thiefSprites.dispose();
    this.thiefSpriteFades.dispose();
    this.thiefSpriteAnimator.dispose();
    for (const { sprites, fades, animator } of this.e2SpritePresentations) {
      sprites.dispose();
      fades.dispose();
      animator.dispose();
    }
    this.baronSprites.dispose();
    this.baronSpriteFades.dispose();
    this.baronSpriteAnimator?.dispose();
    this.baronBannerSprites.dispose();
    this.bossHpBackGeometry.dispose();
    this.bossHpFillGeometry.dispose();
    this.bossHpSegmentGeometry.dispose();
    this.bossHpBackMaterial.dispose();
    this.bossHpFillMaterial.dispose();
    this.bossHpSegmentMaterial.dispose();
    this.hitFlashGeometry.dispose();
    this.hitFlashMaterial.dispose();
    this.watchPaintMaterial.dispose();
    this.bannerPoleGeometry.dispose();
    this.bannerClothGeometry.dispose();
    this.bannerPoleMaterial.dispose();
    this.bannerClothMaterial.dispose();
    for (const part of this.railcarParts) {
      part.healthy.geometry.dispose();
      (part.healthy.material as THREE.Material).dispose();
      (part.damaged.material as THREE.Material).dispose();
    }
    this.nightBasicMaterial.dispose();
    disposeClaimJumperAssets(this.assets);
  }

  private activeAnimation(thieves: boolean): ActiveAnimation {
    if (thieves) {
      for (const enemy of this.enemies) {
        if (enemy.isAlive && enemy.isThief && enemy.animationClip === 'grab') {
          return regularAnimation(enemy, 'grab');
        }
      }
      for (const enemy of this.enemies) {
        if (enemy.isAlive && enemy.isThief && enemy.animationClip === 'flee') {
          return regularAnimation(enemy, 'flee');
        }
      }
    }
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.isThief === thieves && (!this.baronSprites.isLoaded || enemy.eliteKind !== 'baron')) {
        return regularAnimation(enemy);
      }
    }
    return { clip: 'idle', orientation: 's', active: false, speed: 0, groundSpeed: 0 };
  }

  private activeVariantAnimation(variantId: string): ActiveAnimation {
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.variantId === variantId) {
        return regularAnimation(enemy);
      }
    }
    return { clip: 'idle', orientation: 's', active: false, speed: 0, groundSpeed: 0 };
  }

  private activeBaronAnimation(): ActiveAnimation {
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.eliteKind === 'baron') {
        this.ensureBaronPresentation();
        const groundSpeed = Math.hypot(enemy.velocityX, enemy.velocityZ);
        return {
          clip: enemy.animationClip,
          orientation: enemy.animationOrientation,
          active: true,
          speed: groundSpeed,
          groundSpeed,
        };
      }
    }
    return { clip: 'idle', orientation: 's', active: false, speed: 0, groundSpeed: 0 };
  }

  private ensureBaronPresentation(): SpriteAnimator {
    this.baronSprites.ensureLoaded();
    this.baronSpriteFades.ensureLoaded();
    this.baronBannerSprites.ensureLoaded();
    this.baronSpriteAnimator ??= new SpriteAnimator(
      assetSlots.charBaron,
      this.baronSprites.material,
      undefined,
      this.baronSpriteFades.material,
    );
    return this.baronSpriteAnimator;
  }

  private activeBaron(): ClaimJumperEnemy | null {
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.eliteKind === 'baron') return enemy;
    }
    return null;
  }

  private bossBarState(includeComponents = false): BossBarState | null {
    let grouped: ClaimJumperEnemy | null = null;
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.bossGroupId) {
        grouped = enemy;
        break;
      }
    }
    if (grouped?.bossGroupId) {
      let hp = 0;
      let totalHp = grouped.bossGroupTotalHp;
      let x = 0;
      let y = Number.NEGATIVE_INFINITY;
      let z = 0;
      let scale = 1;
      let members = 0;
      let maxHp = 0;
      const components: BossBarState['components'] = includeComponents ? [] : undefined;
      for (const enemy of this.enemies) {
        if (!enemy.isAlive || enemy.bossGroupId !== grouped.bossGroupId) continue;
        members += 1;
        hp += enemy.currentHp;
        maxHp += enemy.maxHp;
        x += enemy.position.x;
        z += enemy.position.z;
        y = Math.max(y, enemy.position.y + 1.5 * enemy.visualScale);
        scale = Math.max(scale, enemy.visualScale * 0.74);
        components?.push({
          id: enemy.bossComponentId ?? enemy.variantId ?? `part-${enemy.id}`,
          label: enemy.bossComponentLabel ?? enemy.variantLabel ?? 'Component',
          hp: round2(enemy.currentHp),
          maxHp: round2(enemy.maxHp),
        });
      }
      if (members === 0) return null;
      if (totalHp <= 0) totalHp = maxHp;
      const segments = Math.max(1, Math.min(BOSS_HP_MAX_SEGMENTS, grouped.bossGroupSize || members));
      return {
        x: x / members,
        y: y + 0.95,
        z: z / members,
        scale: Math.max(1, scale),
        ratio: THREE.MathUtils.clamp(hp / Math.max(1, totalHp), 0, 1),
        segments,
        groupId: grouped.bossGroupId,
        aliveComponents: members,
        destroyedComponents: Math.max(0, segments - members),
        components,
      };
    }

    const baron = this.activeBaron();
    if (!baron) return null;
    return {
      x: baron.position.x,
      y: baron.position.y + 1.75 * baron.visualScale,
      z: baron.position.z,
      scale: Math.max(1, baron.visualScale * 0.88),
      ratio: THREE.MathUtils.clamp(baron.currentHp / Math.max(1, baron.maxHp), 0, 1),
      segments: BARON_HP_SEGMENTS,
      groupId: null,
      aliveComponents: 1,
      destroyedComponents: 0,
      components: includeComponents ? [{ id: 'baron', label: 'Baron', hp: round2(baron.currentHp), maxHp: round2(baron.maxHp) }] : undefined,
    };
  }

  private createRenderParts(): void {
    this.localMatrices.push(
      this.createLocalMatrix(new THREE.Vector3(0, 0.012, 0), new THREE.Euler(-Math.PI / 2, 0, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 0.54, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 0.93, -0.34)),
      this.createLocalMatrix(new THREE.Vector3(0, 1.15, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 1.32, 0)),
    );

    this.renderParts.push(
      new THREE.InstancedMesh(this.assets.shadowGeometry, this.assets.shadowMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.ponchoGeometry, this.assets.ponchoMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.faceGeometry, this.assets.faceMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.brimGeometry, this.assets.hatMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.crownGeometry, this.assets.hatMaterial, Balance.enemy.poolSize),
    );
    this.watchPaintMeshes.push(
      new THREE.InstancedMesh(this.assets.ponchoGeometry, this.watchPaintMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.faceGeometry, this.watchPaintMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.brimGeometry, this.watchPaintMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.crownGeometry, this.watchPaintMaterial, Balance.enemy.poolSize),
    );

    for (const part of this.renderParts) {
      part.count = Balance.enemy.poolSize;
      part.castShadow = false;
      part.receiveShadow = false;
      part.frustumCulled = false;
      tagPlaceholder(part, assetSlots.charClaimJumper);
      this.group.add(part);
    }
    this.renderParts[0].renderOrder = RenderLayers.groundShadows;
    for (const part of this.watchPaintMeshes) {
      part.count = Balance.enemy.poolSize;
      part.castShadow = false;
      part.frustumCulled = false;
      part.renderOrder = RenderLayers.gameplay + 0.01;
      this.group.add(part);
      for (let index = 0; index < Balance.enemy.poolSize; index += 1) part.setMatrixAt(index, this.hiddenMatrix);
      part.instanceMatrix.needsUpdate = true;
    }
  }

  private createRailcarParts(): void {
    const loader = new THREE.TextureLoader();
    const parts = [
      { id: 'wheels', urls: [railcarWheelsUrl, railcarWheelsDamagedUrl], size: [1.55, 0.85] },
      { id: 'boiler', urls: [railcarBoilerUrl, railcarBoilerDamagedUrl], size: [1.9, 1.15] },
      { id: 'cabin', urls: [railcarCabinUrl, railcarCabinDamagedUrl], size: [1.45, 1.15] },
    ] as const;
    for (const part of parts) {
      const geometry = new THREE.PlaneGeometry(...part.size);
      const meshes = part.urls.map((url) => {
        const texture = loader.load(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide }), Balance.enemy.poolSize);
        mesh.count = Balance.enemy.poolSize;
        mesh.frustumCulled = false;
        mesh.renderOrder = RenderLayers.gameplay;
        this.group.add(mesh);
        for (let index = 0; index < Balance.enemy.poolSize; index += 1) mesh.setMatrixAt(index, this.hiddenMatrix);
        mesh.instanceMatrix.needsUpdate = true;
        return mesh;
      });
      this.railcarParts.push({ id: part.id, healthy: meshes[0]!, damaged: meshes[1]! });
      this.railcarLocalMatrices.push(this.createLocalMatrix(new THREE.Vector3(0, part.size[1] * 0.5, 0), new THREE.Euler(0, -Math.PI / 2, 0)));
    }
  }

  private createSackMesh(): void {
    this.sackLocalMatrix.copy(this.createLocalMatrix(new THREE.Vector3(-0.38, 0.66, 0.12), new THREE.Euler(0.2, 0.1, -0.38)));
    this.sackMesh.count = Balance.enemy.poolSize;
    this.sackMesh.frustumCulled = false;
    this.sackMesh.renderOrder = RenderLayers.gameplay;
    tagPlaceholder(this.sackMesh, assetSlots.charClaimJumper);
    this.group.add(this.sackMesh);
    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      this.sackMesh.setMatrixAt(i, this.hiddenMatrix);
    }
    this.sackMesh.instanceMatrix.needsUpdate = true;
  }

  private createHitFlashMesh(): void {
    this.hitFlashes.count = Balance.enemy.poolSize;
    this.hitFlashes.frustumCulled = false;
    this.hitFlashes.renderOrder = RenderLayers.impactVfx;
    this.hitFlashes.visible = false;
    tagPlaceholder(this.hitFlashes, assetSlots.charClaimJumper);
    this.group.add(this.hitFlashes);
    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      this.hitFlashes.setMatrixAt(i, this.hiddenMatrix);
    }
    this.hitFlashes.instanceMatrix.needsUpdate = true;
  }

  private createBannerMeshes(): void {
    this.bannerPoleLocalMatrix.copy(this.createLocalMatrix(new THREE.Vector3(0.45, 1.08, 0.05), new THREE.Euler(0.08, 0, -0.12)));
    this.bannerClothLocalMatrix.copy(this.createLocalMatrix(new THREE.Vector3(0.69, 1.48, 0.05), new THREE.Euler(0, 0.04, -0.12)));
    for (const mesh of [this.bannerPoleMesh, this.bannerClothMesh]) {
      mesh.count = Balance.enemy.poolSize;
      mesh.frustumCulled = false;
      mesh.renderOrder = RenderLayers.gameplay;
      tagPlaceholder(mesh, assetSlots.propBaronBanner);
      this.group.add(mesh);
      for (let i = 0; i < Balance.enemy.poolSize; i += 1) mesh.setMatrixAt(i, this.hiddenMatrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  private createBossHpBar(): void {
    this.bossHpGroup.name = 'BossHpBar';
    this.bossHpGroup.visible = false;
    this.bossHpGroup.frustumCulled = false;
    for (const mesh of [this.bossHpBack, this.bossHpFill]) {
      mesh.frustumCulled = false;
      mesh.renderOrder = RenderLayers.worldUi + 0.02;
    }
    this.bossHpFill.position.z = 0.01;
    this.bossHpGroup.add(this.bossHpBack, this.bossHpFill, this.bossHpSegments);
    for (let i = 1; i < BOSS_HP_MAX_SEGMENTS; i += 1) {
      const segment = new THREE.Mesh(this.bossHpSegmentGeometry, this.bossHpSegmentMaterial);
      segment.position.x = -BOSS_HP_FILL_WIDTH / 2 + (BOSS_HP_FILL_WIDTH * i) / BOSS_HP_MAX_SEGMENTS;
      segment.position.z = 0.02;
      segment.frustumCulled = false;
      segment.renderOrder = RenderLayers.worldUi + 0.03;
      this.bossHpSegments.add(segment);
    }
  }

  private createLocalMatrix(position: THREE.Vector3, rotation = new THREE.Euler()): THREE.Matrix4 {
    this.syncObject.position.copy(position);
    this.syncObject.rotation.copy(rotation);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    return this.syncObject.matrix.clone();
  }

  private syncInstances(): void {
    this.syncEnemyFog();
    this.syncRenderInstances();
    this.syncSpriteVisuals();
  }

  private syncRenderInstances(): void {
    this.updateRailcar3d();
    for (const enemy of this.enemies) {
      this.syncEnemyInstance(enemy);
    }
    this.syncBossHpBar();
  }

  private syncBossHpBar(): void {
    const state = this.bossBarState();
    if (!state) {
      this.bossHpGroup.visible = false;
      return;
    }
    this.bossHpGroup.visible = true;
    const railcarMounted = this.railcar3dState === 'ready' && this.railcar3dGroupId === state.groupId;
    this.bossHpGroup.position.set(
      railcarMounted ? this.railcar3dCenter.x : state.x,
      railcarMounted ? this.railcar3dModel!.position.y + RAILCAR_3D_HEIGHT + 0.35 : state.y,
      railcarMounted ? this.railcar3dCenter.z : state.z,
    );
    if (this.camera) this.bossHpGroup.quaternion.copy(this.camera.quaternion);
    this.bossHpGroup.scale.setScalar(railcarMounted ? 1 : state.scale);
    this.bossHpFill.scale.x = state.ratio;
    this.bossHpFill.position.x = -BOSS_HP_FILL_WIDTH * (1 - state.ratio) * 0.5;
    for (let i = 0; i < this.bossHpSegments.children.length; i += 1) {
      const segment = this.bossHpSegments.children[i] as THREE.Object3D | undefined;
      if (!segment) continue;
      segment.visible = i < state.segments - 1 && state.ratio > (i + 1) / state.segments;
      segment.position.x = -BOSS_HP_FILL_WIDTH / 2 + (BOSS_HP_FILL_WIDTH * (i + 1)) / state.segments;
    }
  }

  private syncEnemyInstance(enemy: ClaimJumperEnemy): void {
    const lightFactor = this.renderLightFactor(this.lightFactorFor(enemy));
    const watchPainted = this.isWatchPainted(enemy);
    const baronMotion = this.baronSpriteAnimator?.motion ?? IDLE_SPRITE_MOTION;
    const motion =
      enemy.eliteKind === 'baron' && this.baronSprites.isLoaded
        ? baronMotion
        : enemy.isThief
          ? this.thiefSpriteAnimator.motion
          : this.spriteAnimator.motion;
    this.syncObject.position.copy(enemy.group.position);
    this.syncObject.position.y += motion.bobOffset;
    this.syncObject.rotation.set(0, enemy.group.rotation.y, 0);
    this.syncObject.rotation.z = motion.leanRad;
    this.syncObject.scale.setScalar(this.renderScale(enemy));
    this.syncObject.updateMatrix();
    this.baseMatrix.copy(enemy.isAlive && enemy.eliteKind !== 'railcar' && !isMothSwarmEnemy(enemy) ? this.syncObject.matrix : this.hiddenMatrix);

    for (let i = 0; i < this.renderParts.length; i += 1) {
      const part = this.renderParts[i];
      const localMatrix = this.localMatrices[i];
      if (!part || !localMatrix) continue;
      this.instanceMatrix.multiplyMatrices(this.baseMatrix, localMatrix);
      part.setMatrixAt(enemy.id, this.instanceMatrix);
      if (i === 1) {
        this.setInstanceColor(
          part,
          enemy.id,
          enemy.eliteKind === 'baron'
            ? this.baronPonchoColor
            : enemy.variantTintColor
              ? enemy.variantTintColor
              : enemy.carriedAmount > 0
              ? this.carryingPonchoColor
              : enemy.isWrecker
                ? this.wreckerPonchoColor
                : this.normalPonchoColor,
          lightFactor,
        );
      } else if (i === 0) {
        this.setInstanceColor(part, enemy.id, this.shadowColor, this.fullDarkRenderCutoffActive() ? Math.min(lightFactor, 1) : lightFactor);
      } else if (i === 2) {
        this.setInstanceColor(part, enemy.id, this.faceColor, lightFactor);
      } else {
        this.setInstanceColor(part, enemy.id, this.hatColor, lightFactor);
      }
      part.instanceMatrix.needsUpdate = true;
    }
    const railcar3dMounted = this.railcar3dState === 'ready' && this.railcar3dGroupId === enemy.bossGroupId;
    const carryMarkerVisible = enemy.isAlive && (enemy.carriedAmount > 0 || enemy.isWrecker)
      && (enemy.eliteKind !== 'railcar' || (this.railcarVisible(enemy) && !railcar3dMounted));
    this.instanceMatrix.multiplyMatrices(carryMarkerVisible ? this.syncObject.matrix : this.hiddenMatrix, this.sackLocalMatrix);
    this.sackMesh.setMatrixAt(enemy.id, this.instanceMatrix);
    this.setInstanceColor(this.sackMesh, enemy.id, enemy.isWrecker ? this.wreckerMarkerColor : this.sackColor, lightFactor);
    this.sackMesh.instanceMatrix.needsUpdate = true;
    this.syncWatchPaint(enemy, watchPainted);
    this.syncBanner(enemy, lightFactor);
    const railcarBase = this.railcarVisible(enemy) && !railcar3dMounted ? this.syncObject.matrix : this.hiddenMatrix;
    for (let index = 0; index < this.railcarParts.length; index += 1) {
      const part = this.railcarParts[index];
      const local = this.railcarLocalMatrices[index];
      if (!part || !local) continue;
      this.instanceMatrix.multiplyMatrices(railcarBase, local);
      const belongs = enemy.bossComponentId === part.id;
      const damaged = enemy.currentHp / Math.max(1, enemy.maxHp) <= RAILCAR_DAMAGE_THRESHOLD;
      part.healthy.setMatrixAt(enemy.id, belongs && !damaged ? this.instanceMatrix : this.hiddenMatrix);
      part.damaged.setMatrixAt(enemy.id, belongs && damaged ? this.instanceMatrix : this.hiddenMatrix);
      part.healthy.instanceMatrix.needsUpdate = true;
      part.damaged.instanceMatrix.needsUpdate = true;
    }
  }

  private ensureRailcar3d(): void {
    if (this.railcar3dState === 'lite' || this.railcar3dState === 'loading' || this.railcar3dState === 'ready') return;
    const serial = ++this.railcar3dLoadSerial;
    this.railcar3dState = 'loading';
    this.publishRailcar3d();
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      if (serial !== this.railcar3dLoadSerial) return;
      new GLTFLoader().load(RAILCAR_3D_URL, ({ scene }) => {
        if (serial !== this.railcar3dLoadSerial) {
          disposeObject3D(scene);
          return;
        }
        const meshes = this.inspectRailcar3d(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.railcar3dState = 'failed';
          this.publishRailcar3d();
          return;
        }
        scene.name = 'ArmoredRailcar3d';
        scene.visible = false;
        this.railcar3dModel = scene;
        this.railcar3dMeshes.clear();
        for (const [id, mesh] of meshes) this.railcar3dMeshes.set(id, mesh);
        this.group.add(scene);
        this.railcar3dState = 'ready';
        this.syncInstances();
      }, undefined, () => {
        if (serial !== this.railcar3dLoadSerial) return;
        this.railcar3dState = 'failed';
        this.publishRailcar3d();
      });
    }, () => {
      if (serial !== this.railcar3dLoadSerial) return;
      this.railcar3dState = 'failed';
      this.publishRailcar3d();
    });
  }

  private inspectRailcar3d(model: THREE.Object3D): Map<RailcarComponentId, THREE.Mesh> | null {
    const meshes = new Map<RailcarComponentId, THREE.Mesh>();
    const materials = new Set<THREE.Material>();
    let meshCount = 0;
    let triangles = 0;
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount += 1;
      triangles += Math.floor((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
      for (const [id, contract] of Object.entries(RAILCAR_3D_COMPONENTS) as Array<[RailcarComponentId, (typeof RAILCAR_3D_COMPONENTS)[RailcarComponentId]]>) {
        if (mesh.name === contract.mesh && mesh.morphTargetDictionary?.[contract.morph] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== RAILCAR_3D_TRIANGLES) return null;
    for (const mesh of meshes.values()) mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateRailcar3d(): void {
    const railcars = this.enemies.filter((enemy) => enemy.isAlive && enemy.eliteKind === 'railcar' && enemy.variantId === 'baron_railcar' && enemy.bossGroupId);
    if (!this.railcar3dModel || this.railcar3dState !== 'ready' || railcars.length === 0) return;
    const groupId = railcars[0]!.bossGroupId!;
    if (this.railcar3dGroupId !== groupId) {
      this.railcar3dGroupId = groupId;
      this.railcar3dOffsets.clear();
      this.railcar3dCenter.set(0, 0, 0);
      for (const enemy of railcars) this.railcar3dCenter.add(enemy.position);
      this.railcar3dCenter.multiplyScalar(1 / railcars.length);
      for (const enemy of railcars) {
        const id = enemy.bossComponentId as RailcarComponentId | null;
        if (id && id in RAILCAR_3D_COMPONENTS) this.railcar3dOffsets.set(id, enemy.position.clone().sub(this.railcar3dCenter));
      }
      for (const id of Object.keys(RAILCAR_3D_COMPONENTS) as RailcarComponentId[]) {
        if (!this.railcar3dOffsets.has(id)) this.railcar3dDamaged.add(id);
      }
    }
    for (const enemy of railcars) {
      const id = enemy.bossComponentId as RailcarComponentId | null;
      if (id && enemy.currentHp / Math.max(1, enemy.maxHp) <= RAILCAR_DAMAGE_THRESHOLD) this.railcar3dDamaged.add(id);
    }
    const anchor = railcars[0]!;
    const anchorId = anchor.bossComponentId as RailcarComponentId | null;
    this.railcar3dCenter.copy(anchor.position);
    const anchorOffset = anchorId ? this.railcar3dOffsets.get(anchorId) : undefined;
    if (anchorOffset) this.railcar3dCenter.sub(anchorOffset);
    this.railcar3dModel.position.set(
      this.railcar3dCenter.x,
      Terrain.visualY(this.railcar3dCenter.x, this.railcar3dCenter.z, 0) + RAILCAR_RAIL_HEAD_Y,
      this.railcar3dCenter.z,
    );
    this.railcar3dModel.rotation.y = Math.PI / 2 - this.renderRotationOf(anchor);
    this.railcar3dModel.visible = railcars.some((enemy) => this.railcarVisible(enemy));
    for (const [id, mesh] of this.railcar3dMeshes) {
      const damaged = this.railcar3dDamaged.has(id);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = damaged ? 1 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.set(damaged ? RAILCAR_3D_COMPONENTS[id].damageColor : '#000000');
      material.emissiveIntensity = damaged ? RAILCAR_3D_COMPONENTS[id].damageGlow : 0;
    }
    this.publishRailcar3d();
  }

  private markRailcar3dDestroyed(enemy: ClaimJumperEnemy): void {
    if (enemy.eliteKind !== 'railcar' || enemy.variantId !== 'baron_railcar' || !enemy.bossGroupId) return;
    const id = enemy.bossComponentId as RailcarComponentId | null;
    if (id) this.railcar3dDamaged.add(id);
    const groupLives = this.enemies.some((candidate) => candidate !== enemy && candidate.isAlive && candidate.bossGroupId === enemy.bossGroupId);
    if (groupLives) this.updateRailcar3d();
    else this.disposeRailcar3d();
  }

  private disposeRailcar3d(): void {
    this.railcar3dLoadSerial += 1;
    if (this.railcar3dModel) {
      this.group.remove(this.railcar3dModel);
      disposeObject3D(this.railcar3dModel);
      this.railcar3dModel = undefined;
    }
    this.railcar3dMeshes.clear();
    this.railcar3dOffsets.clear();
    this.railcar3dDamaged.clear();
    this.railcar3dGroupId = null;
    if (this.railcar3dState !== 'lite') this.railcar3dState = 'disposed';
    this.publishRailcar3d();
  }

  private publishRailcar3d(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.railcar3dState = this.railcar3dState;
    canvas.dataset.railcar3dSource = this.railcar3dState === 'ready' ? 'glb' : 'billboard';
    canvas.dataset.railcar3dMounted = String(this.railcar3dState === 'ready' && this.railcar3dGroupId !== null);
    canvas.dataset.railcar3dDamageStates = JSON.stringify(Object.fromEntries(
      (Object.keys(RAILCAR_3D_COMPONENTS) as RailcarComponentId[]).map((id) => [id, this.railcar3dDamaged.has(id) ? 'broken' : 'intact']),
    ));
  }

  private railcarVisible(enemy: ClaimJumperEnemy): boolean {
    const fogRim = 6;
    if (!enemy.isAlive || enemy.eliteKind !== 'railcar' || enemy.variantId !== 'baron_railcar') return false;
    if (enemy.position.x > Terrain.bounds.minX + fogRim && enemy.position.x < Terrain.bounds.maxX - fogRim
      && enemy.position.z > Terrain.bounds.minZ + fogRim && enemy.position.z < Terrain.bounds.maxZ - fogRim) {
      enemy.markRailcarEnteredField();
    }
    return enemy.railcarEnteredField;
  }

  private syncBanner(enemy: ClaimJumperEnemy, lightFactor: number): void {
    const visible = enemy.isAlive && lightFactor > 0 && enemy.hasBanner && !this.baronBannerSprites.isLoaded;
    this.instanceMatrix.multiplyMatrices(visible ? this.baseMatrix : this.hiddenMatrix, this.bannerPoleLocalMatrix);
    this.bannerPoleMesh.setMatrixAt(enemy.id, this.instanceMatrix);
    this.setInstanceColor(this.bannerPoleMesh, enemy.id, this.bannerPoleColor, lightFactor);
    this.instanceMatrix.multiplyMatrices(visible ? this.baseMatrix : this.hiddenMatrix, this.bannerClothLocalMatrix);
    this.bannerClothMesh.setMatrixAt(enemy.id, this.instanceMatrix);
    this.setInstanceColor(this.bannerClothMesh, enemy.id, this.bannerClothColor, lightFactor);
    this.bannerPoleMesh.instanceMatrix.needsUpdate = true;
    this.bannerClothMesh.instanceMatrix.needsUpdate = true;
  }

  private syncWatchPaint(enemy: ClaimJumperEnemy, visible: boolean): void {
    const fever = this.feverAccentFor(enemy);
    this.watchPaintBaseMatrix.multiplyMatrices(visible || fever.active ? this.baseMatrix : this.hiddenMatrix, this.watchPaintScaleMatrix);
    for (let index = 0; index < this.watchPaintMeshes.length; index += 1) {
      const mesh = this.watchPaintMeshes[index];
      const localMatrix = this.localMatrices[index + 1];
      if (!mesh || !localMatrix) continue;
      const feverPartVisible = fever.kind === 'machine' ? index > 0 : index === 1;
      this.instanceMatrix.multiplyMatrices(visible || (fever.active && feverPartVisible) ? this.watchPaintBaseMatrix : this.hiddenMatrix, localMatrix);
      mesh.setMatrixAt(enemy.id, this.instanceMatrix);
      this.feverAccentColor.copy(FEVER_GOLD).multiplyScalar(visible ? 1 : fever.strength);
      mesh.setColorAt(enemy.id, this.feverAccentColor);
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  private syncSpriteVisuals(): void {
    const normalMotion = this.spriteAnimator.motion;
    const thiefMotion = this.thiefSpriteAnimator.motion;
    const baronMotion = this.baronSpriteAnimator?.motion ?? IDLE_SPRITE_MOTION;
    this.generatedSprites.material.rotation = normalMotion.leanRad;
    this.generatedSpriteFades.material.rotation = normalMotion.leanRad;
    this.thiefSprites.material.rotation = thiefMotion.leanRad;
    this.thiefSpriteFades.material.rotation = thiefMotion.leanRad;
    this.baronSprites.material.rotation = baronMotion.leanRad;
    this.baronSpriteFades.material.rotation = baronMotion.leanRad;
    for (const { sprites, fades, animator } of this.e2SpritePresentations) {
      sprites.material.rotation = animator.motion.leanRad;
      fades.material.rotation = animator.motion.leanRad;
    }
    for (const enemy of this.enemies) this.syncEnemySprite(enemy);
  }

  private syncEnemySprite(enemy: ClaimJumperEnemy): void {
    const lightFactor = this.renderLightFactor(this.lightFactorFor(enemy));
    const litVisible = lightFactor > 0;
    const useProceduralDark = this.fullDarkRenderCutoffActive();
    const baronVisible = !useProceduralDark && enemy.isAlive && litVisible && enemy.eliteKind === 'baron' && this.baronSprites.isLoaded;
    const e2Presentation = this.e2SpritePresentations.find(({ variantId }) => variantId === enemy.variantId);
    const normalVisible = !useProceduralDark && enemy.isAlive && litVisible && enemy.eliteKind !== 'railcar' && !enemy.isThief && !baronVisible && !e2Presentation && !isMothSwarmEnemy(enemy);
    const thiefVisible = !useProceduralDark && enemy.isAlive && litVisible && enemy.isThief && !e2Presentation;
    // ponytail: batch fades draw every live enemy twice; skip them for mid/large packs unless sprites get instanced.
    const showFade = this.active <= 32;
    const normalMotion = this.spriteAnimator.motion;
    const thiefMotion = this.thiefSpriteAnimator.motion;
    const baronMotion = this.baronSpriteAnimator?.motion ?? IDLE_SPRITE_MOTION;
    const baronOverlayActive = this.baronSpriteAnimator?.overlayActive === true;
    this.generatedSprites.setTintScalar(enemy.id, lightFactor);
    this.generatedSpriteFades.setTintScalar(enemy.id, lightFactor);
    this.thiefSprites.setTintScalar(enemy.id, lightFactor);
    this.thiefSpriteFades.setTintScalar(enemy.id, lightFactor);
    this.baronSprites.setTintScalar(enemy.id, lightFactor);
    this.baronSpriteFades.setTintScalar(enemy.id, lightFactor);
    this.baronBannerSprites.setTintScalar(enemy.id, lightFactor);
    for (const presentation of this.e2SpritePresentations) {
      const visible = presentation === e2Presentation && !useProceduralDark && enemy.isAlive && litVisible;
      presentation.sprites.setTintScalar(enemy.id, lightFactor);
      presentation.fades.setTintScalar(enemy.id, lightFactor);
      presentation.sprites.set(enemy.id, enemy.group.position, visible);
      presentation.fades.set(enemy.id, enemy.group.position, visible && showFade && presentation.animator.overlayActive);
      this.applySpriteBob(presentation.sprites.group.children[enemy.id], enemy.position.y, presentation.animator.motion.bobOffset, this.renderScale(enemy));
      this.applySpriteBob(presentation.fades.group.children[enemy.id], enemy.position.y, presentation.animator.motion.bobOffset, this.renderScale(enemy));
    }
    this.generatedSprites.set(enemy.id, enemy.group.position, normalVisible);
    this.generatedSpriteFades.set(enemy.id, enemy.group.position, showFade && normalVisible && this.spriteAnimator.overlayActive);
    this.thiefSprites.set(enemy.id, enemy.group.position, thiefVisible);
    this.thiefSpriteFades.set(enemy.id, enemy.group.position, showFade && thiefVisible && this.thiefSpriteAnimator.overlayActive);
    this.baronSprites.set(enemy.id, enemy.group.position, baronVisible);
    this.baronSpriteFades.set(enemy.id, enemy.group.position, showFade && baronVisible && baronOverlayActive);
    this.baronBannerSprites.set(
      enemy.id,
      enemy.group.position,
      !useProceduralDark && enemy.isAlive && litVisible && enemy.hasBanner && this.baronBannerSprites.isLoaded,
    );
    const renderScale = this.renderScale(enemy);
    this.applySpriteBob(this.generatedSprites.group.children[enemy.id], enemy.position.y, normalMotion.bobOffset, renderScale);
    this.applySpriteBob(this.generatedSpriteFades.group.children[enemy.id], enemy.position.y, normalMotion.bobOffset, renderScale);
    this.applySpriteBob(this.thiefSprites.group.children[enemy.id], enemy.position.y, thiefMotion.bobOffset, renderScale);
    this.applySpriteBob(this.thiefSpriteFades.group.children[enemy.id], enemy.position.y, thiefMotion.bobOffset, renderScale);
    this.applySpriteBob(this.baronSprites.group.children[enemy.id], enemy.position.y, baronMotion.bobOffset, enemy.visualScale);
    this.applySpriteBob(this.baronSpriteFades.group.children[enemy.id], enemy.position.y, baronMotion.bobOffset, enemy.visualScale);
    this.applyBannerSprite(enemy, this.baronBannerSprites.group.children[enemy.id], baronMotion.bobOffset);
  }

  private syncHitFlashes(): void {
    this.activeHitFlashes = 0;
    if (Balance.combatReadability.enemyFlashSeconds <= 0 || Balance.combatReadability.enemyFlashIntensity <= 0) {
      for (const enemy of this.enemies) this.hitFlashes.setMatrixAt(enemy.id, this.hiddenMatrix);
      this.warmHitFlashFrames = 0;
      this.hitFlashes.visible = false;
      this.hitFlashes.instanceMatrix.needsUpdate = true;
      return;
    }
    for (const enemy of this.enemies) {
      const flash = enemy.hitFlashRemaining;
      if (!enemy.isAlive || flash <= 0) {
        this.hitFlashes.setMatrixAt(enemy.id, this.hiddenMatrix);
        continue;
      }

      const t = Math.min(1, flash / Math.max(0.001, Balance.combatReadability.enemyFlashSeconds));
      const scale = (1 + t * Balance.combatReadability.enemyFlashIntensity * 0.18) * this.renderScale(enemy);
      this.syncObject.position.set(enemy.group.position.x, enemy.group.position.y + ENEMY_SPRITE_Y * this.renderScale(enemy), enemy.group.position.z);
      this.syncObject.rotation.set(0, enemy.group.rotation.y, 0);
      this.syncObject.scale.set(1.55 * scale, 1.42 * scale, 0.08);
      this.syncObject.updateMatrix();
      this.hitFlashes.setMatrixAt(enemy.id, this.syncObject.matrix);
      this.activeHitFlashes += 1;
    }
    if (this.activeHitFlashes === 0 && this.warmHitFlashFrames > 0) {
      this.syncObject.position.set(this.warmHitFlashPosition.x, this.warmHitFlashPosition.y + ENEMY_SPRITE_Y, this.warmHitFlashPosition.z);
      this.syncObject.rotation.set(0, 0, 0);
      this.syncObject.scale.set(0.001, 0.001, 0.001);
      this.syncObject.updateMatrix();
      this.hitFlashes.setMatrixAt(0, this.syncObject.matrix);
      this.activeHitFlashes = 1;
    }
    this.warmHitFlashFrames = Math.max(0, this.warmHitFlashFrames - 1);
    this.hitFlashes.visible = this.activeHitFlashes > 0;
    this.hitFlashes.instanceMatrix.needsUpdate = true;
  }

  private applySpriteBob(sprite: THREE.Object3D | undefined, baseY: number, bobOffset: number, visualScale: number): void {
    if (!sprite) return;
    sprite.position.y = baseY + ENEMY_SPRITE_Y * visualScale + bobOffset;
    sprite.scale.set(1.55 * visualScale, 1.55 * visualScale, 1);
  }

  private renderScale(enemy: ClaimJumperEnemy): number {
    return enemy.visualScale * (enemy.eliteKind ? 1 : RUN_CAST_SCALE);
  }

  private applyBannerSprite(enemy: ClaimJumperEnemy, sprite: THREE.Object3D | undefined, bobOffset: number): void {
    if (!sprite) return;
    const scale = enemy.visualScale;
    sprite.position.y = enemy.position.y + 1.85 * scale + bobOffset;
    sprite.scale.set(0.86 * scale, 0.86 * scale, 1);
  }

  private setProceduralVisible(visible: boolean): void {
    for (const part of this.renderParts) part.visible = visible;
  }

  private syncEnemyFog(): void {
    const fullDark = this.fullDarkRenderCutoffActive();
    const enabled = !fullDark;
    const proceduralVisible = fullDark || !this.generatedSprites.isLoaded;
    this.syncNightBasicMaterials(fullDark);
    if (this.enemyFogEnabled === enabled) {
      this.setProceduralVisible(proceduralVisible);
      return;
    }
    this.enemyFogEnabled = enabled;
    for (const material of [
      this.generatedSprites.material,
      this.generatedSpriteFades.material,
      this.thiefSprites.material,
      this.thiefSpriteFades.material,
      this.baronSprites.material,
      this.baronSpriteFades.material,
      this.baronBannerSprites.material,
      ...this.e2SpritePresentations.flatMap(({ sprites, fades }) => [sprites.material, fades.material]),
    ]) {
      setMaterialFog(material, enabled);
    }
    for (const mesh of [...this.renderParts, this.sackMesh, this.bannerPoleMesh, this.bannerClothMesh]) {
      setMaterialFog(mesh.material, enabled);
    }
    this.setProceduralVisible(proceduralVisible);
  }

  private syncNightBasicMaterials(enabled: boolean): void {
    if (this.nightBasicActive === enabled) return;
    this.nightBasicActive = enabled;
    const basic = this.nightBasicMaterial;
    this.renderParts.forEach((part, index) => {
      if (index === 0) return;
      const standard =
        index === 1 ? this.assets.ponchoMaterial : index === 2 ? this.assets.faceMaterial : this.assets.hatMaterial;
      part.material = enabled ? basic : standard;
      part.material.needsUpdate = true;
    });
    this.sackMesh.material = enabled ? basic : this.assets.sackMaterial;
    this.bannerPoleMesh.material = enabled ? basic : this.bannerPoleMaterial;
    this.bannerClothMesh.material = enabled ? basic : this.bannerClothMaterial;
    this.sackMesh.material.needsUpdate = true;
    this.bannerPoleMesh.material.needsUpdate = true;
    this.bannerClothMesh.material.needsUpdate = true;
  }

  private setInstanceColor(mesh: THREE.InstancedMesh, index: number, base: THREE.Color, lightFactor: number): void {
    this.dimmedColor.copy(base).multiplyScalar(lightFactor);
    mesh.setColorAt(index, this.dimmedColor);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  private renderLightFactor(lightFactor: number): number {
    if (!this.lightDimming.enabled) return lightFactor;
    const visibilityBlend = THREE.MathUtils.smoothstep(this.lightDimming.darkness, 0.9, 0.99);
    const boosted = THREE.MathUtils.lerp(lightFactor, lightFactor * Balance.contracts.nightShift.renderVisibleBoost, visibilityBlend);
    if (!this.fullDarkRenderCutoffActive()) return boosted;
    return lightFactor < Balance.contracts.nightShift.renderVisibilityCutoff ? 0 : boosted;
  }

  private isWatchPainted(enemy: ClaimJumperEnemy): boolean {
    if (!this.fullDarkRenderCutoffActive() || !enemy.isAlive) return false;
    return this.lightDimming.sources.some((source) =>
      source.kind === 'watch' && Math.hypot(enemy.group.position.x - source.x, enemy.group.position.z - source.z) <= source.radius,
    );
  }

  private fullDarkRenderCutoffActive(): boolean {
    return this.lightDimming.enabled && this.lightDimming.darkness >= 0.99;
  }

  private rebuildSpatialHash(): void {
    this.clearSpatialHash();

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const cellIndex = this.cellIndex(enemy.group.position.x, enemy.group.position.z);
      if (cellIndex < 0) continue;

      const cell = this.cells[cellIndex];
      if (!cell) continue;
      if (cell.length === 0) this.touchedCells.push(cellIndex);
      cell.push(enemy);
    }
  }

  private clearSpatialHash(): void {
    for (const index of this.touchedCells) {
      const cell = this.cells[index];
      if (cell) cell.length = 0;
    }
    this.touchedCells.length = 0;
  }

  private cellAt(cellX: number, cellZ: number): ClaimJumperEnemy[] | null {
    if (cellX < 0 || cellX >= this.gridSize || cellZ < 0 || cellZ >= this.gridSize) return null;
    return this.cells[cellZ * this.gridSize + cellX] ?? null;
  }

  private cellIndex(x: number, z: number): number {
    const cellX = this.toGridCoord(x);
    const cellZ = this.toGridCoord(z);
    if (cellX < 0 || cellX >= this.gridSize || cellZ < 0 || cellZ >= this.gridSize) return -1;
    return cellZ * this.gridSize + cellX;
  }

  private toGridCoord(value: number): number {
    const clamped = THREE.MathUtils.clamp(value, this.gridMin, this.gridMax - 0.001);
    return Math.floor((clamped - this.gridMin) / this.cellSize);
  }
}

function signedAngleDeltaRadians(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function setMaterialFog(material: THREE.Material | THREE.Material[], enabled: boolean): void {
  if (Array.isArray(material)) {
    for (const item of material) setMaterialFog(item, enabled);
    return;
  }
  const fogMaterial = material as THREE.Material & { fog?: boolean };
  if (fogMaterial.fog === enabled) return;
  fogMaterial.fog = enabled;
  fogMaterial.needsUpdate = true;
}

function nearestPosition(positions: readonly THREE.Vector3[], target: THREE.Vector3): THREE.Vector3 {
  let best = positions[0] ?? target;
  let bestDistanceSq = Number.POSITIVE_INFINITY;
  for (const position of positions) {
    const dx = position.x - target.x;
    const dz = position.z - target.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < bestDistanceSq) {
      best = position;
      bestDistanceSq = distanceSq;
    }
  }
  return best;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
