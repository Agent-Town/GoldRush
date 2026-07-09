import * as THREE from 'three';
import { getDebugSeed } from '../core/DebugParams';
import { createRng, type Rng } from '../core/Rng';
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
  plannedPulses: unknown[];
  copyCursor: number;
  lastCopy: string;
  currentAtSim: number;
  waveState: 'quiet' | 'warning' | 'active' | 'cleared';
  lastPulseAt: number;
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
    if (!snapshot) return false;
    const game = this.game as AnyGame;
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
    if (isRunSuspendEnvelope(parsed)) return parsed;
  } catch {}

  try {
    storage?.removeItem(RUN_SUSPEND_KEY);
  } catch {}
  return null;
}

export function clearRunSuspend(storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.removeItem(RUN_SUSPEND_KEY);
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
  if (!isRunSuspendEnvelope(snapshot)) return false;
  restoreSnapshot(game as AnyGame, snapshot);
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

function isRunSuspendEnvelope(value: unknown): value is RunSuspendEnvelope {
  if (!isRecord(value)) return false;
  return (
    value.v === 1 &&
    cleanNumber(value.wave, -1) >= 0 &&
    cleanNumber(value.timeAlive, -1) >= 0 &&
    typeof value.contractId === 'string' &&
    isRecord(value.economy) &&
    isRecord(value.hero) &&
    Array.isArray(value.buildings) &&
    isRecord(value.waveSystem) &&
    isRecord(value.enemies) &&
    Array.isArray((value.enemies as AnyRecord).active) &&
    isRecord(value.meta) &&
    isRecord(value.research)
  );
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

function isCompassEdge(value: unknown): value is EnemySuspend['edge'] {
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
