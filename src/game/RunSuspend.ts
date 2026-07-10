import * as THREE from 'three';
import { getDebugSeed } from '../core/DebugParams';
import { createRng, type Rng } from '../core/Rng';
import type { CompassEdge } from '../entities/Enemy';
import type { ResearchState } from '../meta/ResearchTree';
import { saveResearchState } from '../meta/ResearchTree';
import { Balance } from './Balance';
import { buildableDefs, type BuildableId } from './buildables';
import {
  initialEconomyState,
  createEconomyState,
  reduce as reduceEconomy,
  summarizeLog,
  type EconomyEvent,
  type EconomySummary,
} from './Economy';
import type { MetaProgress } from './MetaProgress';
import { RUN_SUSPEND_KEY } from './ProfileStorage';

export const RUN_SUSPEND_REJECTION_KEY = `${RUN_SUSPEND_KEY}.rejected`;
export const RUN_SUSPEND_REJECTION_LINE = 'This page of the ledger is water-damaged. The saved claim was set aside.';

export type RunSuspendEnvelope = {
  v: 1;
  wave: number;
  timeAlive: number;
  writtenAt: number;
  lastWriteMs: number;
  sizeBytes: number;
  trigger: 'wave-boundary' | 'pagehide' | 'visibilitychange';
  copy: string;
  contractId: string;
  seed: string | null;
  rng: {
    waves: RngCounter | null;
    upgrades: RngCounter | null;
  };
  waveSystem: WaveSystemSuspend;
  enemies: EnemyPoolSuspend;
  economy: {
    gold: number;
    bankCap: number;
    resources?: Record<string, { amount: number; cap: number }>;
    log: EconomyEvent[];
    summary: EconomySummary;
  };
  hero: {
    level: number;
    xpTotal: number;
    spentXp: number;
    xpInto: number;
    pendingLevels: number;
    offer: string[] | null;
    stacks: Record<string, number>;
    hp: number;
    maxHp: number;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
  };
  buildings: BuildingSuspend[];
  counters: {
    kills: number;
    stolenTotal: number;
    reclaimedTotal: number;
    buildingHitsResolved: number;
    buildingsWrecked: number;
    weapon: 'rig' | 'blast';
    weaponToggleCount: number;
    blastTime: number;
  };
  meta: MetaProgress;
  research: ResearchState;
};

export type RunSuspendDiagnostics = {
  hasSuspend: boolean;
  restored: boolean;
  restoredWave: number | null;
  lastWriteAt: number | null;
  lastWriteMs: number | null;
  sizeBytes: number;
};

export type RunSuspendWrite = {
  wave: number;
  sizeBytes: number;
  ms: number;
  writtenAt: number;
};

export type RunSuspendRejection = {
  message: string;
  reasons: string[];
  droppedEconomyEvents: number;
  at: number;
};

type RunSuspendDecodeResult =
  | { ok: true; value: RunSuspendEnvelope; diagnostics: RunSuspendRejection | null }
  | { ok: false; diagnostics: RunSuspendRejection };

type RngCounter = {
  seed: number;
  calls: number;
};

type BuildingSuspend = {
  id: BuildableId;
  index: number;
  tier: number;
  hp: number;
  maxHp: number;
  baseMaxHp?: number;
  buildCost: number;
  repairCostOverride?: number;
  wrecked: boolean;
  repairProgress: number;
  position: { x: number; z: number };
  rotationSteps: number;
};

type WaveSystemSuspend = {
  wave: number;
  pulse: number;
  edge: string | null;
  budget: number;
  waveSpawnedTotal: number;
  nextTrickleAt: number;
  nextWaveAt: number;
  nextPlanWaveAt: number;
  nextPlanWave: number;
  plannedPulses: PlannedPulseSuspend[];
  copyCursor: number;
  lastCopy: string;
  currentAtSim: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
  lastPulseAt: number;
};

type PlannedPulseSuspend = {
  wave: number;
  pulse: number;
  spawnAt: number;
  edges: CompassEdge[];
  counts: number[];
  budget: number;
  telegraphed: boolean[];
  spawned: boolean;
};

type EnemyPoolSuspend = {
  spawnSerial: number;
  active: EnemySuspend[];
};

type EnemySuspend = {
  index: number;
  hp: number;
  speed: number;
  activationDelay: number;
  contactCooldown: number;
  thief: boolean;
  wrecker: boolean;
  thiefState: string;
  wreckerState: string;
  carriedGold: number;
  grabTimer: number;
  swingTimer: number;
  retargetTimer: number;
  wreckerRetargetTimer: number;
  edge: 'north' | 'south' | 'east' | 'west' | null;
  formationOffset: number;
  flashRemaining: number;
  flashCount: number;
  terrainSlideSide: number;
  scripted: boolean;
  scriptedSpeed: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  leadVelocity: { x: number; y: number; z: number };
  heading: { x: number; y: number; z: number };
  scriptedTarget: { x: number; y: number; z: number };
  rotationY: number;
  spriteClip: string;
  spriteOrientation: string;
};

type AnyRecord = Record<string, unknown>;
type AnyGame = Record<string, any>;

const buildableIds = buildableDefs.map((def) => def.id);

export class RunSuspendController {
  private lastSnapshot: RunSuspendEnvelope | null = null;
  private lastWrite: RunSuspendWrite | null = null;
  private restored = false;
  private restoredWave: number | null = null;
  private removePageHide?: () => void;
  private removeVisibilityChange?: () => void;

  constructor(
    private readonly game: unknown,
    private readonly meta: () => MetaProgress,
    private readonly storage: Storage | undefined = browserStorage(),
  ) {}

  install(): this {
    const restored = this.restoreIfAvailable();
    this.instrumentRngs();
    this.restored = restored;
    this.installPageHooks();
    return this;
  }

  dispose(): void {
    this.removePageHide?.();
    this.removeVisibilityChange?.();
  }

  captureBoundary(nextWave: number, at: number): RunSuspendWrite | null {
    const wave = Math.max(0, Math.floor(nextWave) - 1);
    if (wave <= 0) return null;
    const snapshot = captureSnapshot(this.game, this.meta(), wave, at, 'wave-boundary');
    return this.write(snapshot);
  }

  clear(): void {
    try {
      this.storage?.removeItem(RUN_SUSPEND_KEY);
    } catch {}
    this.lastSnapshot = null;
    this.lastWrite = null;
  }

  diagnostics(): RunSuspendDiagnostics {
    const saved = readRunSuspend(this.storage);
    return {
      hasSuspend: saved !== null,
      restored: this.restored,
      restoredWave: this.restoredWave,
      lastWriteAt: this.lastWrite?.writtenAt ?? saved?.writtenAt ?? null,
      lastWriteMs: this.lastWrite?.ms ?? saved?.lastWriteMs ?? null,
      sizeBytes: this.lastWrite?.sizeBytes ?? saved?.sizeBytes ?? 0,
    };
  }

  private restoreIfAvailable(): boolean {
    const snapshot = readRunSuspend(this.storage);
    const game = this.game as AnyGame;
    if (readRunSuspendRejection(this.storage)) {
      game.uiBridge?.announce?.(RUN_SUSPEND_REJECTION_LINE, cleanNumber(game.timeAlive), null, 5.5);
    }
    if (!snapshot) return false;
    if (snapshot.contractId !== game.activeContract?.id) return false;
    restoreSnapshot(game, snapshot);
    this.lastSnapshot = snapshot;
    this.lastWrite = {
      wave: snapshot.wave,
      sizeBytes: snapshot.sizeBytes,
      ms: snapshot.lastWriteMs,
      writtenAt: snapshot.writtenAt,
    };
    this.restoredWave = snapshot.wave;
    return true;
  }

  private write(snapshot: RunSuspendEnvelope): RunSuspendWrite | null {
    if (!this.storage) return null;
    const started = now();
    const payload = JSON.stringify(snapshot);
    const sizeBytes = byteSize(payload);
    const writtenAt = Date.now();
    snapshot.sizeBytes = sizeBytes;
    snapshot.writtenAt = writtenAt;
    const finalPayload = JSON.stringify(snapshot);
    try {
      this.storage.setItem(RUN_SUSPEND_KEY, finalPayload);
    } catch {
      return null;
    }
    const ms = Number((now() - started).toFixed(3));
    snapshot.lastWriteMs = ms;
    try {
      this.storage.setItem(RUN_SUSPEND_KEY, JSON.stringify(snapshot));
    } catch {
      return null;
    }
    this.lastSnapshot = snapshot;
    this.lastWrite = { wave: snapshot.wave, sizeBytes, ms, writtenAt };
    return this.lastWrite;
  }

  private flushLast(trigger: RunSuspendEnvelope['trigger']): void {
    if (!this.lastSnapshot) return;
    this.write({ ...deepClone(this.lastSnapshot), trigger });
  }

  private installPageHooks(): void {
    if (typeof window === 'undefined') return;
    const onPageHide = () => this.flushLast('pagehide');
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') this.flushLast('visibilitychange');
    };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.removePageHide = () => window.removeEventListener('pagehide', onPageHide);
    this.removeVisibilityChange = () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  private instrumentRngs(): void {
    const game = this.game as AnyGame;
    instrumentRng(game.waveSystem?.rng);
    instrumentRng(game.progression?.options?.rng);
  }
}

export function readRunSuspend(storage: Storage | undefined = browserStorage()): RunSuspendEnvelope | null {
  let raw: string | null = null;
  try {
    raw = storage?.getItem(RUN_SUSPEND_KEY) ?? null;
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const decoded = decodeRunSuspendEnvelope(parsed);
    if (decoded.ok) {
      try {
        storage?.setItem(RUN_SUSPEND_KEY, JSON.stringify(decoded.value));
      } catch {}
      if (decoded.diagnostics) writeRunSuspendRejection(storage, decoded.diagnostics);
      else clearRunSuspendRejection(storage);
      return decoded.value;
    }
    writeRunSuspendRejection(storage, decoded.diagnostics);
  } catch {
    writeRunSuspendRejection(storage, rejection(['snapshot is not valid JSON'], 0));
  }

  try {
    storage?.removeItem(RUN_SUSPEND_KEY);
  } catch {}
  return null;
}

export function normalizeRunSuspendDatum(value: unknown): RunSuspendEnvelope | null {
  const decoded = decodeRunSuspendEnvelope(value);
  return decoded.ok ? decoded.value : null;
}

export function readRunSuspendRejection(storage: Storage | undefined = browserStorage()): RunSuspendRejection | null {
  try {
    const raw = storage?.getItem(RUN_SUSPEND_REJECTION_KEY) ?? null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.message !== 'string' || !Array.isArray(parsed.reasons)) return null;
    return {
      message: parsed.message,
      reasons: parsed.reasons.filter((reason): reason is string => typeof reason === 'string').slice(0, 12),
      droppedEconomyEvents: integerInRange(parsed.droppedEconomyEvents, 0, MAX_ECONOMY_EVENTS) ?? 0,
      at: numberInRange(parsed.at, 0, MAX_TIME) ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearRunSuspendRejection(storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.removeItem(RUN_SUSPEND_REJECTION_KEY);
  } catch {}
}

export function clearRunSuspend(storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.removeItem(RUN_SUSPEND_KEY);
    storage?.removeItem(RUN_SUSPEND_REJECTION_KEY);
  } catch {}
}

export function captureRunSuspendSnapshot(
  game: unknown,
  meta: MetaProgress,
  wave: number,
  at: number,
  trigger: RunSuspendEnvelope['trigger'] = 'wave-boundary',
): RunSuspendEnvelope {
  return captureSnapshot(game, meta, wave, at, trigger);
}

export function restoreRunSuspendSnapshot(game: unknown, snapshot: unknown): boolean {
  const normalized = normalizeRunSuspendDatum(snapshot);
  if (!normalized) return false;
  restoreSnapshot(game as AnyGame, normalized);
  return true;
}

export function runSuspendLabel(snapshot: RunSuspendEnvelope): string {
  return `Saved claim: wave ${snapshot.wave}. Mid-wave trail after that boundary will be replayed.`;
}

function captureSnapshot(
  gameUnknown: unknown,
  meta: MetaProgress,
  wave: number,
  at: number,
  trigger: RunSuspendEnvelope['trigger'],
): RunSuspendEnvelope {
  const game = gameUnknown as AnyGame;
  const economyLog = cloneEvents(game.economy?.log ?? []);
  const progression = game.progression as AnyGame;
  const hero = game.actors?.[0] as AnyGame;
  const heroPosition = hero?.group?.position ?? { x: 0, y: 0, z: 0 };
  const heroVelocity = hero?.velocity ?? { x: 0, y: 0, z: 0 };

  return {
    v: 1,
    wave,
    timeAlive: at,
    writtenAt: Date.now(),
    lastWriteMs: 0,
    sizeBytes: 0,
    trigger,
    copy: `The claim resumes at wave ${wave}. The ledger kept your place; trail work after that boundary is replayed.`,
    contractId: String(game.activeContract?.id ?? 'the-claim'),
    seed: getDebugSeed(),
    rng: {
      waves: rngCounter(game.waveSystem?.rng),
      upgrades: rngCounter(progression?.options?.rng),
    },
    waveSystem: captureWaveSystem(game.waveSystem),
    enemies: captureEnemyPool(game.enemies),
    economy: {
      gold: cleanNumber(game.economy?.gold),
      bankCap: cleanNumber(game.economy?.bankCap),
      resources: deepClone(game.economy?.resources ?? {}),
      log: economyLog,
      summary: summarizeLog(economyLog),
    },
    hero: {
      level: cleanNumber(progression?.levelValue, 1),
      xpTotal: cleanNumber(progression?.xpTotal),
      spentXp: cleanNumber(progression?.spentXp),
      xpInto: cleanNumber(progression?.snapshot?.xpInto),
      pendingLevels: cleanNumber(progression?.pendingLevelsValue),
      offer: Array.isArray(progression?.snapshot?.offer) ? [...progression.snapshot.offer] : null,
      stacks: { ...(progression?.snapshot?.stacks ?? {}) },
      hp: cleanNumber(hero?.hp),
      maxHp: cleanNumber(hero?.maxHp),
      position: vector3Snapshot(heroPosition),
      velocity: vector3Snapshot(heroVelocity),
    },
    buildings: captureBuildings(game.buildSystem),
    counters: {
      kills: cleanNumber(game.kills),
      stolenTotal: cleanNumber(game.stolenTotal),
      reclaimedTotal: cleanNumber(game.reclaimedTotal),
      buildingHitsResolved: cleanNumber(game.buildingHitsResolved),
      buildingsWrecked: cleanNumber(game.buildingsWrecked),
      weapon: game.activeWeapon === 'blast' ? 'blast' : 'rig',
      weaponToggleCount: cleanNumber(game.weaponToggleCount),
      blastTime: cleanNumber(game.blastTime),
    },
    meta: deepClone(meta),
    research: deepClone(game.researchState),
  };
}

function restoreSnapshot(game: AnyGame, snapshot: RunSuspendEnvelope): void {
  game.enemies?.recycleAll?.();
  game.goldPickups?.recycleAll?.();
  game.xpMotes?.recycleAll?.();
  game.combat?.reset?.();
  game.harvestSystem?.reset?.();
  game.buildSystem?.reset?.();
  game.progression?.reset?.();
  game.agentConsent?.reset?.();

  game.researchState = deepClone(snapshot.research);
  game.researchState = saveResearchState(game.researchStorage, game.researchState);
  game.applyResearchEffects?.();
  game.syncMegaprojectSite?.();

  restoreWaveSystem(game.waveSystem, snapshot.waveSystem, snapshot.rng.waves);
  restoreProgression(game, snapshot);
  restoreBuildings(game, snapshot.buildings);
  restoreEconomy(game, snapshot);
  restoreEnemyPool(game.enemies, snapshot.enemies);
  const hero = restoreHero(game, snapshot);

  game.timeAlive = snapshot.timeAlive;
  game.kills = snapshot.counters.kills;
  game.stolenTotal = snapshot.counters.stolenTotal;
  game.reclaimedTotal = snapshot.counters.reclaimedTotal;
  game.buildingHitsResolved = snapshot.counters.buildingHitsResolved;
  game.buildingsWrecked = snapshot.counters.buildingsWrecked;
  game.activeWeapon = snapshot.counters.weapon;
  game.weaponToggleCount = snapshot.counters.weaponToggleCount;
  game.blastTime = snapshot.counters.blastTime;
  game.buildMenuOpen = false;
  game.upgradeCandidate = null;
  game.demolishCandidate = null;
  game.demolishSuppressedKey = null;
  game.playerPauseActive = false;
  game.charmPauseRemaining = 0;
  game.charmPauseCooldown = 0;
  game.charmPauseActive = false;
  game.damageFlashRemaining = 0;
  game.state?.restart?.();
  game.syncHeroVisualHeight?.();
  game.cameraRig?.snapTo?.(hero?.group?.position);
  game.syncStockpileHoldings?.();
  game.prospector?.reset?.(hero?.group?.position);
  game.uiBridge?.announce?.(snapshot.copy, snapshot.timeAlive, null, 4.8);
  game.deathOverlay?.hide?.();
  game.upgradeOverlay?.hide?.();
  game.publishDiagnostics?.();
}

function restoreHero(game: AnyGame, snapshot: RunSuspendEnvelope): AnyGame | undefined {
  const hero = game.actors?.[0] as AnyGame | undefined;
  if (!hero) return undefined;
  const position = new THREE.Vector3(snapshot.hero.position.x, snapshot.hero.position.y, snapshot.hero.position.z);
  hero.resetRun?.(position);
  game.applyStats?.(game.progression?.snapshot?.stats, null);
  hero.hp = Math.min(cleanNumber(hero.maxHp, snapshot.hero.maxHp), Math.max(0, snapshot.hero.hp));
  hero.group?.position?.copy(position);
  hero.velocity?.set(snapshot.hero.velocity.x, snapshot.hero.velocity.y, snapshot.hero.velocity.z);
  hero.targetVelocity?.set(0, 0, 0);
  hero.nextPosition?.copy(position);
  return hero;
}

function captureEnemyPool(enemyPool: AnyGame | undefined): EnemyPoolSuspend {
  const all = Array.isArray(enemyPool?.all) ? enemyPool.all : [];
  return {
    spawnSerial: cleanNumber(enemyPool?.spawnSerial),
    active: all
      .filter((enemy: AnyGame | undefined) => enemy?.isAlive === true)
      .map((enemy: AnyGame, index: number) => ({
        index: cleanNumber(enemy.id, index),
        hp: cleanNumber(enemy.currentHp ?? enemy.hp),
        speed: cleanNumber(enemy.speed),
        activationDelay: cleanNumber(enemy.activationDelay),
        contactCooldown: cleanNumber(enemy.contactCooldown),
        thief: enemy.isThief === true || enemy.thief === true,
        wrecker: enemy.isWrecker === true || enemy.wrecker === true,
        thiefState: typeof enemy.thiefState === 'string' ? enemy.thiefState : 'none',
        wreckerState: typeof enemy.wreckerState === 'string' ? enemy.wreckerState : 'none',
        carriedGold: cleanNumber(enemy.carriedAmount ?? enemy.carriedGold),
        grabTimer: cleanNumber(enemy.grabTimer),
        swingTimer: cleanNumber(enemy.swingTimer),
        retargetTimer: cleanNumber(enemy.retargetTimer),
        wreckerRetargetTimer: cleanNumber(enemy.wreckerRetargetTimer),
        edge: isCompassEdge(enemy.ownEdge ?? enemy.spawnEdge) ? (enemy.ownEdge ?? enemy.spawnEdge) : null,
        formationOffset: cleanNumber(enemy.spreadOffset ?? enemy.formationOffset),
        flashRemaining: cleanNumber(enemy.hitFlashRemaining ?? enemy.flashRemaining),
        flashCount: cleanNumber(enemy.hitFlashCount ?? enemy.flashCount),
        terrainSlideSide: cleanNumber(enemy.terrainSlideSide),
        scripted: enemy.scripted === true,
        scriptedSpeed: cleanNumber(enemy.scriptedSpeed),
        position: vector3Snapshot(enemy.position ?? enemy.group?.position ?? {}),
        velocity: vector3Snapshot(enemy.velocity ?? {}),
        leadVelocity: vector3Snapshot(enemy.leadVelocity ?? {}),
        heading: vector3Snapshot(enemy.heading ?? {}),
        scriptedTarget: vector3Snapshot(enemy.scriptedTarget ?? {}),
        rotationY: cleanNumber(enemy.group?.rotation?.y),
        spriteClip: typeof enemy.animationClip === 'string' ? enemy.animationClip : typeof enemy.spriteClip === 'string' ? enemy.spriteClip : 'walk',
        spriteOrientation:
          typeof enemy.animationOrientation === 'string'
            ? enemy.animationOrientation
            : typeof enemy.spriteOrientation === 'string'
              ? enemy.spriteOrientation
              : 's',
      })),
  };
}

function restoreEnemyPool(enemyPool: AnyGame | undefined, snapshot: EnemyPoolSuspend): void {
  if (!enemyPool) return;
  enemyPool.recycleAll?.();
  for (const saved of snapshot.active) {
    const enemy = enemyPool.spawn?.(new THREE.Vector3(saved.position.x, saved.position.y, saved.position.z), {
      edge: saved.edge ?? undefined,
      thief: saved.thief,
      wrecker: saved.wrecker,
      activationDelay: saved.activationDelay,
    });
    if (!enemy) continue;
    restoreEnemy(enemy as AnyGame, saved);
  }
  enemyPool.spawnSerial = snapshot.spawnSerial;
  enemyPool.syncInstances?.();
  enemyPool.syncHitFlashes?.();
}

function restoreEnemy(enemy: AnyGame, saved: EnemySuspend): void {
  enemy.hp = saved.hp;
  enemy.speed = saved.speed;
  enemy.activationDelay = saved.activationDelay;
  enemy.contactCooldown = saved.contactCooldown;
  enemy.thief = saved.thief;
  enemy.wrecker = saved.wrecker;
  enemy.thiefState = saved.thiefState;
  enemy.wreckerState = saved.wreckerState;
  enemy.carriedGold = saved.carriedGold;
  enemy.grabTimer = saved.grabTimer;
  enemy.swingTimer = saved.swingTimer;
  enemy.retargetTimer = saved.retargetTimer;
  enemy.wreckerRetargetTimer = saved.wreckerRetargetTimer;
  enemy.currentHolding = null;
  enemy.currentBuilding = null;
  enemy.spawnEdge = saved.edge;
  enemy.formationOffset = saved.formationOffset;
  enemy.flashRemaining = saved.flashRemaining;
  enemy.flashCount = saved.flashCount;
  enemy.terrainSlideSide = saved.terrainSlideSide;
  enemy.scripted = saved.scripted;
  enemy.scriptedSpeed = saved.scriptedSpeed;
  enemy.velocity?.set(saved.velocity.x, saved.velocity.y, saved.velocity.z);
  enemy.leadVelocity?.set(saved.leadVelocity.x, saved.leadVelocity.y, saved.leadVelocity.z);
  enemy.heading?.set(saved.heading.x, saved.heading.y, saved.heading.z);
  enemy.scriptedTarget?.set(saved.scriptedTarget.x, saved.scriptedTarget.y, saved.scriptedTarget.z);
  enemy.group?.position?.set(saved.position.x, saved.position.y, saved.position.z);
  if (enemy.group?.rotation) enemy.group.rotation.y = saved.rotationY;
  if (enemy.group) enemy.group.visible = true;
  enemy.spriteClip = saved.spriteClip;
  enemy.spriteOrientation = saved.spriteOrientation;
  enemy.syncVisualY?.();
}

function captureBuildings(buildSystem: AnyGame | undefined): BuildingSuspend[] {
  const diagnostics = buildSystem?.diagnostics;
  if (!diagnostics || !Array.isArray(diagnostics.hp)) return [];
  return diagnostics.hp
    .filter((entry: AnyRecord) => buildableIds.includes(entry.id as BuildableId))
    .map((entry: AnyRecord) => {
      const id = entry.id as BuildableId;
      const index = cleanNumber(entry.index);
      return {
        id,
        index,
        tier: cleanNumber(entry.tier, 1),
        hp: cleanNumber(entry.hp),
        maxHp: cleanNumber(entry.maxHp),
        baseMaxHp: cleanNumber(buildSystem.hpMax?.[id]?.[index], cleanNumber(entry.maxHp)),
        buildCost: cleanNumber(buildSystem.buildCosts?.[id]?.[index]),
        repairCostOverride: cleanNumber(buildSystem.repairCostOverrides?.[id]?.[index]),
        wrecked: entry.wrecked === true,
        repairProgress: cleanNumber(entry.repairProgress),
        position: {
          x: cleanNumber((entry.position as AnyRecord | undefined)?.x),
          z: cleanNumber((entry.position as AnyRecord | undefined)?.z),
        },
        rotationSteps: id === 'palisade' ? cleanNumber(buildSystem.palisades?.rotationStepsAt?.(index)) : 0,
      };
    });
}

function restoreBuildings(game: AnyGame, buildings: readonly BuildingSuspend[]): void {
  const buildSystem = game.buildSystem as AnyGame | undefined;
  if (!buildSystem) return;
  buildSystem.reset?.();
  for (const building of buildings) {
    const position = new THREE.Vector3(building.position.x, 0, building.position.z);
    buildSystem.ghostRotationSteps = building.rotationSteps;
    const index = buildSystem.place?.(building.id, position);
    if (typeof index !== 'number' || index < 0) continue;
    buildSystem.finishPlacement?.(building.id, index, building.buildCost);
    buildSystem.tier[building.id][index] = building.tier;
    const maxHpMult = buildingMaxHpMultiplier(building.id, building.tier);
    buildSystem.hpMax[building.id][index] = cleanNumber(building.baseMaxHp, Math.round(building.maxHp / maxHpMult));
    buildSystem.hp[building.id][index] = building.hp;
    buildSystem.buildCosts[building.id][index] = building.buildCost;
    buildSystem.repairCostOverrides[building.id][index] = cleanNumber(building.repairCostOverride);
    buildSystem.repairProgress[building.id][index] = building.repairProgress;
    buildSystem.wrecked[building.id][index] = building.wrecked;
    buildSystem.syncTierVisual?.(building.id, index);
    if (building.wrecked) buildSystem.teardownBuilding?.(building.id, index);
    else buildSystem.syncBuildingTarget?.(building.id, index, true);
    buildSystem.refreshShooterStats?.(building.id, index);
  }
  buildSystem.ghostRotationSteps = 0;
  buildSystem.syncGhostShape?.();
  buildSystem.setBuildMode?.(false);
  buildSystem.visualDirty = true;
}

function restoreEconomy(game: AnyGame, snapshot: RunSuspendEnvelope): void {
  const economy = game.economy as AnyGame | undefined;
  if (!economy) return;
  const replay = snapshot.economy.log.reduce(reduceEconomy, { ...initialEconomyState });
  const bankCap = snapshot.economy.bankCap || replay.bankCap;
  economy.current = {
    ...createEconomyState(snapshot.economy.gold, bankCap, {
      ...resourceSnapshot(replay.resources),
      ...resourceSnapshot(snapshot.economy.resources),
    }),
  };
  if (Array.isArray(economy.events)) {
    economy.events.splice(0, economy.events.length, ...cloneEvents(snapshot.economy.log));
  }
}

function restoreProgression(game: AnyGame, snapshot: RunSuspendEnvelope): void {
  const progression = game.progression as AnyGame | undefined;
  if (!progression) return;
  progression.setStacksForTest?.(snapshot.hero.stacks);
  progression.levelValue = Math.max(1, Math.floor(snapshot.hero.level));
  progression.xpTotal = Math.max(0, snapshot.hero.xpTotal);
  progression.spentXp = Math.max(0, snapshot.hero.spentXp);
  progression.pendingLevelsValue = Math.max(0, Math.floor(snapshot.hero.pendingLevels));
  progression.currentOffer = null;
  restoreRng(progression.options, 'rng', snapshot.rng.upgrades);
  game.applyStats?.(progression.snapshot.stats, null);
}

function captureWaveSystem(waveSystem: AnyGame | undefined): WaveSystemSuspend {
  return {
    wave: cleanNumber(waveSystem?.wave),
    pulse: cleanNumber(waveSystem?.pulse),
    edge: typeof waveSystem?.edge === 'string' ? waveSystem.edge : null,
    budget: cleanNumber(waveSystem?.budget),
    waveSpawnedTotal: cleanNumber(waveSystem?.waveSpawnedTotal),
    nextTrickleAt: cleanNumber(waveSystem?.nextTrickleAt),
    nextWaveAt: cleanNumber(waveSystem?.nextWaveAt),
    nextPlanWaveAt: cleanNumber(waveSystem?.nextPlanWaveAt),
    nextPlanWave: cleanNumber(waveSystem?.nextPlanWave, 1),
    plannedPulses: deepClone(waveSystem?.plannedPulses ?? []),
    copyCursor: cleanNumber(waveSystem?.copyCursor),
    lastCopy: typeof waveSystem?.lastCopy === 'string' ? waveSystem.lastCopy : '',
    currentAtSim: cleanNumber(waveSystem?.currentAtSim),
    waveState: isWaveState(waveSystem?.waveState) ? waveSystem.waveState : 'quiet',
    lastPulseAt: cleanNumber(waveSystem?.lastPulseAt, Number.NEGATIVE_INFINITY),
  };
}

function restoreWaveSystem(waveSystem: AnyGame | undefined, snapshot: WaveSystemSuspend, rng: RngCounter | null): void {
  if (!waveSystem) return;
  waveSystem.nextTrickleAt = snapshot.nextTrickleAt;
  waveSystem.nextWaveAt = snapshot.nextWaveAt;
  waveSystem.nextPlanWaveAt = snapshot.nextPlanWaveAt;
  waveSystem.nextPlanWave = snapshot.nextPlanWave;
  if (Array.isArray(waveSystem.plannedPulses)) {
    waveSystem.plannedPulses.splice(0, waveSystem.plannedPulses.length, ...deepClone(snapshot.plannedPulses));
  } else {
    waveSystem.plannedPulses = deepClone(snapshot.plannedPulses);
  }
  waveSystem.wave = snapshot.wave;
  waveSystem.pulse = snapshot.pulse;
  waveSystem.edge = snapshot.edge;
  waveSystem.budget = snapshot.budget;
  waveSystem.waveSpawnedTotal = snapshot.waveSpawnedTotal;
  waveSystem.copyCursor = snapshot.copyCursor;
  waveSystem.lastCopy = snapshot.lastCopy;
  waveSystem.currentAtSim = snapshot.currentAtSim;
  waveSystem.waveState = snapshot.waveState;
  waveSystem.lastPulseAt = snapshot.lastPulseAt;
  restoreRng(waveSystem, 'rng', rng);
}

function restoreRng(owner: AnyGame | undefined, key: string, counter: RngCounter | null): void {
  if (!owner || !counter) return;
  const rng = createRng(counter.seed);
  for (let i = 0; i < counter.calls; i += 1) rng.next();
  owner[key] = rng;
  instrumentRng(owner[key], counter.calls);
}

function instrumentRng(rng: Rng | undefined, initialCalls = 0): void {
  const target = rng as (Rng & { __grSuspendCounter?: RngCounter }) | undefined;
  if (!target || target.__grSuspendCounter) return;
  const counter: RngCounter = { seed: target.seed, calls: Math.max(0, Math.floor(initialCalls)) };
  const next = target.next.bind(target);
  target.next = () => {
    counter.calls += 1;
    return next();
  };
  target.range = (min, max) => min + (max - min) * target.next();
  target.int = (minInclusive, maxExclusive) => Math.floor(target.range(minInclusive, maxExclusive));
  target.chance = (probability) => target.next() < probability;
  target.__grSuspendCounter = counter;
}

function rngCounter(rng: (Rng & { __grSuspendCounter?: RngCounter }) | undefined): RngCounter | null {
  if (!rng) return null;
  return { seed: rng.__grSuspendCounter?.seed ?? rng.seed, calls: rng.__grSuspendCounter?.calls ?? 0 };
}

const MAX_TIME = 1000 * 60 * 60 * 24 * 365 * 10;
const MAX_COUNT = 1_000_000;
const MAX_COORD = 10_000;
const MAX_ECONOMY_AMOUNT = 1_000_000;
const MAX_ECONOMY_EVENTS = 5_000;
const MAX_BUILDINGS = 512;
const MAX_ENEMIES = 512;
const MAX_RNG_SEED = 0xffffffff;

function decodeRunSuspendEnvelope(value: unknown): RunSuspendDecodeResult {
  const reasons: string[] = [];
  if (!isRecord(value)) return rejected(['snapshot is not an object'], 0);
  if (value.v !== 1) reasons.push('version must be 1');

  const wave = requiredInteger(value.wave, 0, MAX_COUNT, 'wave', reasons);
  const timeAlive = requiredNumber(value.timeAlive, 0, MAX_TIME, 'timeAlive', reasons);
  const contractId = requiredString(value.contractId, 'contractId', reasons, 96);
  const economy = decodeEconomy(value.economy, reasons);
  const hero = decodeHero(value.hero, reasons);
  const buildings = decodeBuildings(value.buildings, reasons);
  const counters = decodeCounters(value.counters, reasons);
  const rng = decodeRngState(value.rng, reasons);
  const waveSystem = decodeWaveSystem(value.waveSystem, reasons);
  const enemies = decodeEnemyPool(value.enemies, reasons);
  const meta = decodeMetaProgress(value.meta, reasons);
  const research = decodeResearchState(value.research, reasons);

  if (
    reasons.length ||
    wave === null ||
    timeAlive === null ||
    contractId === null ||
    economy === null ||
    hero === null ||
    buildings === null ||
    counters === null ||
    rng === null ||
    waveSystem === null ||
    enemies === null ||
    meta === null ||
    research === null
  ) {
    return rejected(reasons, economy?.dropped ?? 0);
  }

  const normalized: RunSuspendEnvelope = {
    v: 1,
    wave,
    timeAlive,
    writtenAt: numberInRange(value.writtenAt, 0, MAX_TIME) ?? Date.now(),
    lastWriteMs: numberInRange(value.lastWriteMs, 0, 60_000) ?? 0,
    sizeBytes: integerInRange(value.sizeBytes, 0, 5_000_000) ?? 0,
    trigger: isRunSuspendTrigger(value.trigger) ? value.trigger : 'wave-boundary',
    copy:
      typeof value.copy === 'string' && value.copy.trim()
        ? value.copy.slice(0, 240)
        : `The claim resumes at wave ${wave}. The ledger kept your place; trail work after that boundary is replayed.`,
    contractId,
    seed: typeof value.seed === 'string' ? value.seed.slice(0, 128) : null,
    rng,
    waveSystem,
    enemies,
    economy: {
      gold: economy.gold,
      bankCap: economy.bankCap,
      resources: economy.resources,
      log: economy.log,
      summary: summarizeLog(economy.log),
    },
    hero,
    buildings,
    counters,
    meta: deepClone(meta) as MetaProgress,
    research: deepClone(research) as ResearchState,
  };
  return {
    ok: true,
    value: normalized,
    diagnostics:
      economy.dropped > 0
        ? rejection([`${economy.dropped} malformed economy event${economy.dropped === 1 ? '' : 's'} dropped`], economy.dropped)
        : null,
  };
}

function decodeEconomy(
  value: unknown,
  reasons: string[],
): { gold: number; bankCap: number; resources: Record<string, { amount: number; cap: number }>; log: EconomyEvent[]; dropped: number } | null {
  const record = requiredRecord(value, 'economy', reasons);
  if (!record) return null;
  const gold = requiredNumber(record.gold, 0, MAX_ECONOMY_AMOUNT, 'economy.gold', reasons);
  const bankCap = requiredNumber(record.bankCap, 1, MAX_ECONOMY_AMOUNT, 'economy.bankCap', reasons);
  if (!Array.isArray(record.log)) {
    reasons.push('economy.log must be an array');
    return null;
  }
  if (record.log.length > MAX_ECONOMY_EVENTS) reasons.push('economy.log is too long');
  const resources = decodeResources(record.resources, reasons);
  const log: EconomyEvent[] = [];
  let dropped = 0;
  for (const entry of record.log.slice(0, MAX_ECONOMY_EVENTS)) {
    const event = decodeEconomyEvent(entry);
    if (event) log.push(event);
    else dropped += 1;
  }
  if (gold === null || bankCap === null || !resources) return null;
  return { gold, bankCap, resources, log, dropped };
}

function decodeEconomyEvent(value: unknown): EconomyEvent | null {
  if (!isRecord(value)) return null;
  const id = stringInRange(value.id, 1, 128);
  const at = numberInRange(value.at, 0, MAX_TIME);
  const amount = numberInRange(value.amount, 0, MAX_ECONOMY_AMOUNT);
  if (!id || at === null || typeof value.type !== 'string') return null;
  const actor = value.actor === 'player' || value.actor === 'prospector' ? value.actor : undefined;
  switch (value.type) {
    case 'gold_panned': {
      const nodeId = stringInRange(value.nodeId, 1, 128);
      return amount !== null && nodeId ? (compactEvent({ id, at, type: value.type, nodeId, amount, actor }) as EconomyEvent) : null;
    }
    case 'gold_sluiced': {
      const sluiceId = stringInRange(value.sluiceId, 1, 128);
      return amount !== null && sluiceId ? (compactEvent({ id, at, type: value.type, sluiceId, amount, actor }) as EconomyEvent) : null;
    }
    case 'gold_capped':
      return value.amount === 0 ? { id, at, type: value.type, amount: 0 } : null;
    case 'gold_granted':
      if (amount === null) return null;
      if (value.source === 'upgrade_assay' || value.source === 'debug') return { id, at, type: value.type, source: value.source, amount };
      if (value.source === 'demolish') {
        const buildCost = numberInRange(value.buildCost, 0, MAX_ECONOMY_AMOUNT);
        return compactEvent({ id, at, type: value.type, source: value.source, amount, buildCost: buildCost ?? undefined }) as EconomyEvent;
      }
      return null;
    case 'gold_stolen':
      return amount !== null ? { id, at, type: value.type, amount } : null;
    case 'gold_reclaimed':
      return amount !== null ? (compactEvent({ id, at, type: value.type, amount, actor }) as EconomyEvent) : null;
    case 'gold_spent': {
      const sink = stringInRange(value.sink, 1, 160);
      return amount !== null && sink ? ({ id, at, type: value.type, sink, amount } as EconomyEvent) : null;
    }
    case 'resource_granted':
      return amount !== null && value.resource === 'pressure' && (value.source === 'debug' || value.source === 'exchange')
        ? (compactEvent({ id, at, type: value.type, resource: value.resource, source: value.source, amount, actor }) as EconomyEvent)
        : null;
    case 'resource_spent': {
      const sink = stringInRange(value.sink, 1, 160);
      return amount !== null && value.resource === 'pressure' && sink
        ? (compactEvent({ id, at, type: value.type, resource: value.resource, sink, amount, actor }) as EconomyEvent)
        : null;
    }
    case 'resource_capped':
      return value.resource === 'pressure' && value.amount === 0 ? { id, at, type: value.type, resource: value.resource, amount: 0 } : null;
    case 'run_reset':
      return { id, at, type: value.type };
    default:
      return null;
  }
}

function compactEvent<T extends AnyRecord>(event: T): T {
  for (const key of Object.keys(event)) if (event[key] === undefined) delete event[key];
  return event;
}

function decodeHero(value: unknown, reasons: string[]): RunSuspendEnvelope['hero'] | null {
  const record = requiredRecord(value, 'hero', reasons);
  if (!record) return null;
  const level = requiredInteger(record.level, 1, MAX_COUNT, 'hero.level', reasons);
  const xpTotal = requiredNumber(record.xpTotal, 0, MAX_ECONOMY_AMOUNT, 'hero.xpTotal', reasons);
  const spentXp = requiredNumber(record.spentXp, 0, MAX_ECONOMY_AMOUNT, 'hero.spentXp', reasons);
  const xpInto = requiredNumber(record.xpInto, 0, MAX_ECONOMY_AMOUNT, 'hero.xpInto', reasons);
  const pendingLevels = requiredInteger(record.pendingLevels, 0, MAX_COUNT, 'hero.pendingLevels', reasons);
  const hp = requiredNumber(record.hp, 0, MAX_ECONOMY_AMOUNT, 'hero.hp', reasons);
  const maxHp = requiredNumber(record.maxHp, 1, MAX_ECONOMY_AMOUNT, 'hero.maxHp', reasons);
  const position = decodeVector3(record.position, 'hero.position', reasons);
  const velocity = decodeVector3(record.velocity, 'hero.velocity', reasons);
  const stacks = decodeNumberRecord(record.stacks, 'hero.stacks', reasons);
  const offer = record.offer === null ? null : decodeStringArray(record.offer, 'hero.offer', reasons, 24, 96);
  if (
    level === null ||
    xpTotal === null ||
    spentXp === null ||
    xpInto === null ||
    pendingLevels === null ||
    hp === null ||
    maxHp === null ||
    !position ||
    !velocity ||
    !stacks ||
    offer === undefined
  ) {
    return null;
  }
  return { level, xpTotal, spentXp, xpInto, pendingLevels, offer, stacks, hp, maxHp, position, velocity };
}

function decodeBuildings(value: unknown, reasons: string[]): BuildingSuspend[] | null {
  const before = reasons.length;
  if (!Array.isArray(value)) {
    reasons.push('buildings must be an array');
    return null;
  }
  if (value.length > MAX_BUILDINGS) reasons.push('buildings is too long');
  const output: BuildingSuspend[] = [];
  for (const [i, entry] of value.slice(0, MAX_BUILDINGS).entries()) {
    const record = requiredRecord(entry, `buildings[${i}]`, reasons);
    if (!record) continue;
    const id = buildableIds.includes(record.id as BuildableId) ? (record.id as BuildableId) : null;
    if (!id) reasons.push(`buildings[${i}].id is unknown`);
    const index = requiredInteger(record.index, 0, MAX_BUILDINGS, `buildings[${i}].index`, reasons);
    const tier = requiredInteger(record.tier, 1, 20, `buildings[${i}].tier`, reasons);
    const hp = requiredNumber(record.hp, 0, MAX_ECONOMY_AMOUNT, `buildings[${i}].hp`, reasons);
    const maxHp = requiredNumber(record.maxHp, 1, MAX_ECONOMY_AMOUNT, `buildings[${i}].maxHp`, reasons);
    const buildCost = requiredNumber(record.buildCost, 0, MAX_ECONOMY_AMOUNT, `buildings[${i}].buildCost`, reasons);
    const repairProgress = requiredNumber(record.repairProgress, 0, MAX_TIME, `buildings[${i}].repairProgress`, reasons);
    const position = decodeVector2(record.position, `buildings[${i}].position`, reasons);
    const rotationSteps = requiredInteger(record.rotationSteps, -1000, 1000, `buildings[${i}].rotationSteps`, reasons);
    if (!id || index === null || tier === null || hp === null || maxHp === null || buildCost === null || repairProgress === null || !position || rotationSteps === null || typeof record.wrecked !== 'boolean') continue;
    output.push({
      id,
      index,
      tier,
      hp,
      maxHp,
      baseMaxHp: numberInRange(record.baseMaxHp, 0, MAX_ECONOMY_AMOUNT) ?? undefined,
      buildCost,
      repairCostOverride: numberInRange(record.repairCostOverride, 0, MAX_ECONOMY_AMOUNT) ?? undefined,
      wrecked: record.wrecked,
      repairProgress,
      position,
      rotationSteps,
    });
  }
  return reasons.length === before ? output : null;
}

function decodeCounters(value: unknown, reasons: string[]): RunSuspendEnvelope['counters'] | null {
  const record = requiredRecord(value, 'counters', reasons);
  if (!record) return null;
  const kills = requiredInteger(record.kills, 0, MAX_COUNT, 'counters.kills', reasons);
  const stolenTotal = requiredNumber(record.stolenTotal, 0, MAX_ECONOMY_AMOUNT, 'counters.stolenTotal', reasons);
  const reclaimedTotal = requiredNumber(record.reclaimedTotal, 0, MAX_ECONOMY_AMOUNT, 'counters.reclaimedTotal', reasons);
  const buildingHitsResolved = requiredInteger(record.buildingHitsResolved, 0, MAX_COUNT, 'counters.buildingHitsResolved', reasons);
  const buildingsWrecked = requiredInteger(record.buildingsWrecked, 0, MAX_COUNT, 'counters.buildingsWrecked', reasons);
  const weaponToggleCount = requiredInteger(record.weaponToggleCount, 0, MAX_COUNT, 'counters.weaponToggleCount', reasons);
  const blastTime = requiredNumber(record.blastTime, 0, MAX_TIME, 'counters.blastTime', reasons);
  const weapon = record.weapon === 'blast' || record.weapon === 'rig' ? record.weapon : null;
  if (!weapon) reasons.push('counters.weapon is invalid');
  if (
    kills === null ||
    stolenTotal === null ||
    reclaimedTotal === null ||
    buildingHitsResolved === null ||
    buildingsWrecked === null ||
    weaponToggleCount === null ||
    blastTime === null ||
    !weapon
  ) {
    return null;
  }
  return { kills, stolenTotal, reclaimedTotal, buildingHitsResolved, buildingsWrecked, weapon, weaponToggleCount, blastTime };
}

function decodeRngState(value: unknown, reasons: string[]): RunSuspendEnvelope['rng'] | null {
  const record = requiredRecord(value, 'rng', reasons);
  if (!record) return null;
  const waves = decodeRngCounter(record.waves, 'rng.waves', reasons);
  const upgrades = decodeRngCounter(record.upgrades, 'rng.upgrades', reasons);
  if (waves === undefined || upgrades === undefined) return null;
  return { waves, upgrades };
}

function decodeRngCounter(value: unknown, label: string, reasons: string[]): RngCounter | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, label, reasons);
  if (!record) return undefined;
  const seed = requiredInteger(record.seed, 0, MAX_RNG_SEED, `${label}.seed`, reasons);
  const calls = requiredInteger(record.calls, 0, MAX_COUNT, `${label}.calls`, reasons);
  return seed === null || calls === null ? undefined : { seed, calls };
}

function decodeWaveSystem(value: unknown, reasons: string[]): WaveSystemSuspend | null {
  const record = requiredRecord(value, 'waveSystem', reasons);
  if (!record) return null;
  const wave = requiredInteger(record.wave, 0, MAX_COUNT, 'waveSystem.wave', reasons);
  const pulse = requiredInteger(record.pulse, 0, MAX_COUNT, 'waveSystem.pulse', reasons);
  const budget = requiredNumber(record.budget, 0, MAX_ECONOMY_AMOUNT, 'waveSystem.budget', reasons);
  const waveSpawnedTotal = requiredInteger(record.waveSpawnedTotal, 0, MAX_COUNT, 'waveSystem.waveSpawnedTotal', reasons);
  const nextTrickleAt = requiredNumber(record.nextTrickleAt, -MAX_TIME, MAX_TIME, 'waveSystem.nextTrickleAt', reasons);
  const nextWaveAt = requiredNumber(record.nextWaveAt, -MAX_TIME, MAX_TIME, 'waveSystem.nextWaveAt', reasons);
  const nextPlanWaveAt = requiredNumber(record.nextPlanWaveAt, -MAX_TIME, MAX_TIME, 'waveSystem.nextPlanWaveAt', reasons);
  const nextPlanWave = requiredInteger(record.nextPlanWave, 1, MAX_COUNT, 'waveSystem.nextPlanWave', reasons);
  const copyCursor = requiredInteger(record.copyCursor, 0, MAX_COUNT, 'waveSystem.copyCursor', reasons);
  const currentAtSim = requiredNumber(record.currentAtSim, 0, MAX_TIME, 'waveSystem.currentAtSim', reasons);
  const lastPulseAt =
    record.lastPulseAt === null ? Number.NEGATIVE_INFINITY : requiredNumber(record.lastPulseAt, -MAX_TIME, MAX_TIME, 'waveSystem.lastPulseAt', reasons);
  const edge = record.edge === null || isCompassEdge(record.edge) ? record.edge : null;
  if (record.edge !== null && !isCompassEdge(record.edge)) reasons.push('waveSystem.edge is invalid');
  const waveState = isWaveState(record.waveState) ? record.waveState : null;
  if (!waveState) reasons.push('waveSystem.waveState is invalid');
  const plannedPulses = decodePlannedPulses(record.plannedPulses, reasons);
  if (
    wave === null ||
    pulse === null ||
    budget === null ||
    waveSpawnedTotal === null ||
    nextTrickleAt === null ||
    nextWaveAt === null ||
    nextPlanWaveAt === null ||
    nextPlanWave === null ||
    copyCursor === null ||
    currentAtSim === null ||
    lastPulseAt === null ||
    !waveState ||
    !plannedPulses
  ) {
    return null;
  }
  return {
    wave,
    pulse,
    edge,
    budget,
    waveSpawnedTotal,
    nextTrickleAt,
    nextWaveAt,
    nextPlanWaveAt,
    nextPlanWave,
    plannedPulses,
    copyCursor,
    lastCopy: typeof record.lastCopy === 'string' ? record.lastCopy.slice(0, 240) : '',
    currentAtSim,
    waveState,
    lastPulseAt,
  };
}

function decodePlannedPulses(value: unknown, reasons: string[]): PlannedPulseSuspend[] | null {
  const before = reasons.length;
  if (!Array.isArray(value)) {
    reasons.push('waveSystem.plannedPulses must be an array');
    return null;
  }
  if (value.length > 128) reasons.push('waveSystem.plannedPulses is too long');
  const pulses: PlannedPulseSuspend[] = [];
  for (const [i, entry] of value.slice(0, 128).entries()) {
    const record = requiredRecord(entry, `waveSystem.plannedPulses[${i}]`, reasons);
    if (!record) continue;
    const wave = requiredInteger(record.wave, 0, MAX_COUNT, `waveSystem.plannedPulses[${i}].wave`, reasons);
    const pulse = requiredInteger(record.pulse, 0, MAX_COUNT, `waveSystem.plannedPulses[${i}].pulse`, reasons);
    const spawnAt = requiredNumber(record.spawnAt, -MAX_TIME, MAX_TIME, `waveSystem.plannedPulses[${i}].spawnAt`, reasons);
    const budget = requiredNumber(record.budget, 0, MAX_ECONOMY_AMOUNT, `waveSystem.plannedPulses[${i}].budget`, reasons);
    const edges = decodeCompassEdgeArray(record.edges, `waveSystem.plannedPulses[${i}].edges`, reasons);
    const counts = decodeNumberArray(record.counts, `waveSystem.plannedPulses[${i}].counts`, reasons);
    const telegraphed = decodeBooleanArray(record.telegraphed, `waveSystem.plannedPulses[${i}].telegraphed`, reasons);
    if (
      wave === null ||
      pulse === null ||
      spawnAt === null ||
      budget === null ||
      !edges ||
      !counts ||
      !telegraphed ||
      typeof record.spawned !== 'boolean' ||
      edges.length !== counts.length ||
      edges.length !== telegraphed.length
    ) {
      if (edges && counts && edges.length !== counts.length) reasons.push(`waveSystem.plannedPulses[${i}].counts must match edges`);
      if (edges && telegraphed && edges.length !== telegraphed.length) reasons.push(`waveSystem.plannedPulses[${i}].telegraphed must match edges`);
      if (typeof record.spawned !== 'boolean') reasons.push(`waveSystem.plannedPulses[${i}].spawned must be boolean`);
      continue;
    }
    pulses.push({ wave, pulse, spawnAt, edges, counts, budget, telegraphed, spawned: record.spawned });
  }
  return reasons.length === before ? pulses : null;
}

function decodeEnemyPool(value: unknown, reasons: string[]): EnemyPoolSuspend | null {
  const before = reasons.length;
  const record = requiredRecord(value, 'enemies', reasons);
  if (!record) return null;
  const spawnSerial = requiredInteger(record.spawnSerial, 0, MAX_COUNT, 'enemies.spawnSerial', reasons);
  if (!Array.isArray(record.active)) {
    reasons.push('enemies.active must be an array');
    return null;
  }
  if (record.active.length > MAX_ENEMIES) reasons.push('enemies.active is too long');
  const active: EnemySuspend[] = [];
  for (const [i, entry] of record.active.slice(0, MAX_ENEMIES).entries()) {
    const enemy = decodeEnemy(entry, `enemies.active[${i}]`, reasons);
    if (enemy) active.push(enemy);
  }
  return spawnSerial === null || reasons.length !== before ? null : { spawnSerial, active };
}

function decodeEnemy(value: unknown, label: string, reasons: string[]): EnemySuspend | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const required = {
    index: requiredInteger(record.index, 0, MAX_ENEMIES, `${label}.index`, reasons),
    hp: requiredNumber(record.hp, 0, MAX_ECONOMY_AMOUNT, `${label}.hp`, reasons),
    speed: requiredNumber(record.speed, 0, MAX_COUNT, `${label}.speed`, reasons),
    activationDelay: requiredNumber(record.activationDelay, 0, MAX_TIME, `${label}.activationDelay`, reasons),
    contactCooldown: requiredNumber(record.contactCooldown, 0, MAX_TIME, `${label}.contactCooldown`, reasons),
    carriedGold: requiredNumber(record.carriedGold, 0, MAX_ECONOMY_AMOUNT, `${label}.carriedGold`, reasons),
    grabTimer: requiredNumber(record.grabTimer, 0, MAX_TIME, `${label}.grabTimer`, reasons),
    swingTimer: requiredNumber(record.swingTimer, 0, MAX_TIME, `${label}.swingTimer`, reasons),
    retargetTimer: requiredNumber(record.retargetTimer, 0, MAX_TIME, `${label}.retargetTimer`, reasons),
    wreckerRetargetTimer: requiredNumber(record.wreckerRetargetTimer, 0, MAX_TIME, `${label}.wreckerRetargetTimer`, reasons),
    formationOffset: requiredNumber(record.formationOffset, -MAX_COORD, MAX_COORD, `${label}.formationOffset`, reasons),
    flashRemaining: requiredNumber(record.flashRemaining, 0, MAX_TIME, `${label}.flashRemaining`, reasons),
    flashCount: requiredInteger(record.flashCount, 0, MAX_COUNT, `${label}.flashCount`, reasons),
    terrainSlideSide: requiredNumber(record.terrainSlideSide, -1, 1, `${label}.terrainSlideSide`, reasons),
    scriptedSpeed: requiredNumber(record.scriptedSpeed, 0, MAX_COUNT, `${label}.scriptedSpeed`, reasons),
    rotationY: requiredNumber(record.rotationY, -MAX_COORD, MAX_COORD, `${label}.rotationY`, reasons),
  };
  const position = decodeVector3(record.position, `${label}.position`, reasons);
  const velocity = decodeVector3(record.velocity, `${label}.velocity`, reasons);
  const leadVelocity = decodeVector3(record.leadVelocity, `${label}.leadVelocity`, reasons);
  const heading = decodeVector3(record.heading, `${label}.heading`, reasons);
  const scriptedTarget = decodeVector3(record.scriptedTarget, `${label}.scriptedTarget`, reasons);
  const edge = record.edge === null || isCompassEdge(record.edge) ? record.edge : null;
  if (record.edge !== null && !isCompassEdge(record.edge)) reasons.push(`${label}.edge is invalid`);
  if (
    Object.values(required).some((entry) => entry === null) ||
    !position ||
    !velocity ||
    !leadVelocity ||
    !heading ||
    !scriptedTarget ||
    typeof record.thief !== 'boolean' ||
    typeof record.wrecker !== 'boolean' ||
    typeof record.scripted !== 'boolean'
  ) {
    return null;
  }
  return {
    ...(required as {
      index: number;
      hp: number;
      speed: number;
      activationDelay: number;
      contactCooldown: number;
      carriedGold: number;
      grabTimer: number;
      swingTimer: number;
      retargetTimer: number;
      wreckerRetargetTimer: number;
      formationOffset: number;
      flashRemaining: number;
      flashCount: number;
      terrainSlideSide: number;
      scriptedSpeed: number;
      rotationY: number;
    }),
    thief: record.thief,
    wrecker: record.wrecker,
    thiefState: stringInRange(record.thiefState, 0, 64) ?? 'none',
    wreckerState: stringInRange(record.wreckerState, 0, 64) ?? 'none',
    edge,
    scripted: record.scripted,
    position,
    velocity,
    leadVelocity,
    heading,
    scriptedTarget,
    spriteClip: stringInRange(record.spriteClip, 0, 64) ?? 'walk',
    spriteOrientation: stringInRange(record.spriteOrientation, 0, 64) ?? 's',
  };
}

function decodeMetaProgress(value: unknown, reasons: string[]): MetaProgress | null {
  const record = requiredRecord(value, 'meta', reasons);
  const tracks = isRecord(record?.tracks) ? record.tracks : null;
  if (!record || !tracks) {
    if (record) reasons.push('meta.tracks must be an object');
    return null;
  }
  const territory = requiredNumber(tracks.territory, 0, MAX_COUNT, 'meta.tracks.territory', reasons);
  const science = requiredNumber(tracks.science, 0, MAX_COUNT, 'meta.tracks.science', reasons);
  const hero = requiredNumber(tracks.hero, 0, MAX_COUNT, 'meta.tracks.hero', reasons);
  const agent = requiredNumber(tracks.agent, 0, MAX_COUNT, 'meta.tracks.agent', reasons);
  if (territory === null || science === null || hero === null || agent === null) return null;
  return { version: 1, tracks: { territory, science, hero, agent } };
}

function decodeResearchState(value: unknown, reasons: string[]): ResearchState | null {
  const record = requiredRecord(value, 'research', reasons);
  if (!record) return null;
  const progress = decodeMetaProgress(record.progress, reasons);
  const taken = decodeStringArray(record.taken, 'research.taken', reasons, 256, 128);
  const proposalSalt = requiredInteger(record.proposalSalt, 0, MAX_COUNT, 'research.proposalSalt', reasons);
  const pinnedTarget = record.pinnedTarget === null ? null : stringInRange(record.pinnedTarget, 1, 128);
  if (record.pinnedTarget !== null && pinnedTarget === null) reasons.push('research.pinnedTarget must be a string or null');
  if (!progress || taken === undefined || taken === null || proposalSalt === null || (record.pinnedTarget !== null && pinnedTarget === null)) return null;
  return { version: 1, progress, taken, proposalSalt, pinnedTarget };
}

function rejected(reasons: string[], droppedEconomyEvents: number): RunSuspendDecodeResult {
  return { ok: false, diagnostics: rejection(reasons, droppedEconomyEvents) };
}

function rejection(reasons: string[], droppedEconomyEvents: number): RunSuspendRejection {
  return {
    message: RUN_SUSPEND_REJECTION_LINE,
    reasons: reasons.length ? reasons.slice(0, 12) : ['snapshot rejected'],
    droppedEconomyEvents,
    at: Date.now(),
  };
}

function writeRunSuspendRejection(storage: Storage | undefined, diagnostics: RunSuspendRejection): void {
  try {
    storage?.setItem(RUN_SUSPEND_REJECTION_KEY, JSON.stringify(diagnostics));
  } catch {}
}

function requiredRecord(value: unknown, label: string, reasons: string[]): AnyRecord | null {
  if (isRecord(value)) return value;
  reasons.push(`${label} must be an object`);
  return null;
}

function requiredString(value: unknown, label: string, reasons: string[], max: number): string | null {
  const text = stringInRange(value, 1, max);
  if (text) return text;
  reasons.push(`${label} must be a string`);
  return null;
}

function requiredNumber(value: unknown, min: number, max: number, label: string, reasons: string[]): number | null {
  const number = numberInRange(value, min, max);
  if (number !== null) return number;
  reasons.push(`${label} must be finite`);
  return null;
}

function requiredInteger(value: unknown, min: number, max: number, label: string, reasons: string[]): number | null {
  const number = integerInRange(value, min, max);
  if (number !== null) return number;
  reasons.push(`${label} must be an integer`);
  return null;
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function integerInRange(value: unknown, min: number, max: number): number | null {
  const number = numberInRange(value, min, max);
  return number !== null && Number.isInteger(number) ? number : null;
}

function stringInRange(value: unknown, min: number, max: number): string | null {
  return typeof value === 'string' && value.length >= min && value.length <= max ? value : null;
}

function decodeStringArray(value: unknown, label: string, reasons: string[], maxLength: number, maxString: number): string[] | null | undefined {
  if (!Array.isArray(value)) {
    reasons.push(`${label} must be an array or null`);
    return undefined;
  }
  if (value.length > maxLength) reasons.push(`${label} is too long`);
  const output: string[] = [];
  for (const entry of value.slice(0, maxLength)) {
    const text = stringInRange(entry, 1, maxString);
    if (!text) {
      reasons.push(`${label} entries must be strings`);
      return undefined;
    }
    output.push(text);
  }
  return output;
}

function decodeNumberRecord(value: unknown, label: string, reasons: string[]): Record<string, number> | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const output: Record<string, number> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (key.length > 96) {
      reasons.push(`${label} key is too long`);
      continue;
    }
    const number = requiredInteger(entry, 0, MAX_COUNT, `${label}.${key}`, reasons);
    if (number !== null) output[key] = number;
  }
  return output;
}

function decodeResources(value: unknown, reasons: string[]): Record<string, { amount: number; cap: number }> | null {
  const before = reasons.length;
  if (!isRecord(value)) {
    reasons.push('economy.resources must be an object');
    return null;
  }
  const output: Record<string, { amount: number; cap: number }> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.length > 96) {
      reasons.push('economy.resources key is too long');
      continue;
    }
    const record = requiredRecord(entry, `economy.resources.${key}`, reasons);
    if (!record) continue;
    const amount = requiredNumber(record.amount, 0, MAX_ECONOMY_AMOUNT, `economy.resources.${key}.amount`, reasons);
    const cap = requiredNumber(record.cap, 0, MAX_ECONOMY_AMOUNT, `economy.resources.${key}.cap`, reasons);
    if (amount !== null && cap !== null) output[key] = { amount, cap };
  }
  return reasons.length === before ? output : null;
}

function decodeNumberArray(value: unknown, label: string, reasons: string[]): number[] | null {
  if (!Array.isArray(value)) {
    reasons.push(`${label} must be an array`);
    return null;
  }
  if (value.length > 32) reasons.push(`${label} is too long`);
  const output: number[] = [];
  for (const [i, entry] of value.slice(0, 32).entries()) {
    const number = requiredInteger(entry, 0, MAX_COUNT, `${label}[${i}]`, reasons);
    if (number !== null) output.push(number);
  }
  return output.length === value.slice(0, 32).length ? output : null;
}

function decodeBooleanArray(value: unknown, label: string, reasons: string[]): boolean[] | null {
  if (!Array.isArray(value)) {
    reasons.push(`${label} must be an array`);
    return null;
  }
  if (value.length > 32) reasons.push(`${label} is too long`);
  const output: boolean[] = [];
  for (const [i, entry] of value.slice(0, 32).entries()) {
    if (typeof entry === 'boolean') output.push(entry);
    else reasons.push(`${label}[${i}] must be boolean`);
  }
  return output.length === value.slice(0, 32).length ? output : null;
}

function decodeCompassEdgeArray(value: unknown, label: string, reasons: string[]): CompassEdge[] | null {
  if (!Array.isArray(value)) {
    reasons.push(`${label} must be an array`);
    return null;
  }
  if (value.length > 32) reasons.push(`${label} is too long`);
  const output: CompassEdge[] = [];
  for (const [i, entry] of value.slice(0, 32).entries()) {
    if (isCompassEdge(entry)) output.push(entry);
    else reasons.push(`${label}[${i}] is invalid`);
  }
  return output.length === value.slice(0, 32).length ? output : null;
}

function decodeVector3(value: unknown, label: string, reasons: string[]): { x: number; y: number; z: number } | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const x = requiredNumber(record.x, -MAX_COORD, MAX_COORD, `${label}.x`, reasons);
  const y = requiredNumber(record.y, -MAX_COORD, MAX_COORD, `${label}.y`, reasons);
  const z = requiredNumber(record.z, -MAX_COORD, MAX_COORD, `${label}.z`, reasons);
  return x === null || y === null || z === null ? null : { x, y, z };
}

function decodeVector2(value: unknown, label: string, reasons: string[]): { x: number; z: number } | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const x = requiredNumber(record.x, -MAX_COORD, MAX_COORD, `${label}.x`, reasons);
  const z = requiredNumber(record.z, -MAX_COORD, MAX_COORD, `${label}.z`, reasons);
  return x === null || z === null ? null : { x, z };
}

function isRunSuspendTrigger(value: unknown): value is RunSuspendEnvelope['trigger'] {
  return value === 'wave-boundary' || value === 'pagehide' || value === 'visibilitychange';
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

function cleanNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function buildingMaxHpMultiplier(id: BuildableId, tier: number): number {
  const tiers = (Balance.tiers as Partial<Record<BuildableId, readonly AnyRecord[]>>)[id];
  const rung = tiers?.[Math.max(1, Math.floor(tier)) - 1] ?? tiers?.[0];
  const multiplier = cleanNumber(rung?.maxHpMult, 1);
  return multiplier > 0 ? multiplier : 1;
}

function vector3Snapshot(value: { x?: unknown; y?: unknown; z?: unknown }): { x: number; y: number; z: number } {
  return {
    x: cleanNumber(value.x),
    y: cleanNumber(value.y),
    z: cleanNumber(value.z),
  };
}

function isWaveState(value: unknown): value is WaveSystemSuspend['waveState'] {
  return value === 'quiet' || value === 'warning' || value === 'active' || value === 'cleared';
}

function isCompassEdge(value: unknown): value is CompassEdge {
  return value === 'north' || value === 'south' || value === 'east' || value === 'west';
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneEvents(events: readonly EconomyEvent[]): EconomyEvent[] {
  return deepClone([...events]);
}

function resourceSnapshot(value: unknown): Record<string, { amount: number; cap: number }> {
  if (!isRecord(value)) return {};
  const output: Record<string, { amount: number; cap: number }> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue;
    output[key] = {
      amount: cleanNumber(entry.amount),
      cap: cleanNumber(entry.cap),
    };
  }
  return output;
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage || undefined;
  } catch {
    return undefined;
  }
}

function now(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}
