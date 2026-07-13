import * as THREE from 'three';
import type { AgentConsentFutureState } from '../agent/AgentConsent';
import type { ProspectorFutureState } from '../agent/Embodiment';
import { getDebugSeed } from '../core/DebugParams';
import { createRng, type RngState } from '../core/Rng';
import type { CompassEdge, EnemySuspendSnapshot } from '../entities/Enemy';
import type { GoldPickupSuspendSnapshot } from '../entities/GoldPickup';
import type { EnemyPoolSuspendSnapshot } from '../entities/pools';
import type { ResearchState } from '../meta/ResearchTree';
import { normalizeResearchState, saveResearchRegistryState } from '../meta/ResearchTree';
import type { MegaprojectProjectState } from '../meta/Megaproject';
import type { HarvestFutureState } from '../systems/HarvestSystem';
import type { CombatSuspendSnapshot } from '../systems/CombatSystem';
import { Balance } from './Balance';
import { buildableDefs, type BuildableId } from './buildables';
import { effectiveStats } from './StatSheet';
import {
  initialEconomyState,
  createEconomyState,
  reduce as reduceEconomy,
  summarizeLog,
  type EconomyEvent,
  type EconomySummary,
} from './Economy';
import type { MetaPayout, MetaProgress } from './MetaProgress';
import { RUN_SUSPEND_KEY } from './ProfileStorage';
import type { RunManagerSuspendState } from './RunManager';
import { isUpgradeId, upgradeDefById } from './Upgrades';

export const RUN_SUSPEND_REJECTION_KEY = `${RUN_SUSPEND_KEY}.rejected`;
export const RUN_SUSPEND_REJECTION_LINE = 'This page of the ledger is water-damaged. The saved claim was set aside.';
let lastRestoreFailure: string | null = null;

export type RunSuspendEnvelope = {
  v: 2;
  migratedFromV1: boolean;
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
    waves: RngState | null;
    upgrades: RngState | null;
    harvest: RngState | null;
  };
  waveSystem: WaveSystemSuspend;
  enemies: EnemyPoolSuspendSnapshot;
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
    iframeRemaining: number;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
  };
  buildings: BuildingSuspend[];
  goldPickups: GoldPickupSuspendSnapshot[];
  combat: CombatSuspendSnapshot;
  harvest: HarvestSuspend | null;
  baron: BaronSuspend;
  megaproject: MegaprojectSuspend | null;
  runManager: RunManagerSuspendState;
  agent: AgentSuspend | null;
  controls: ControlsSuspend | null;
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

type Vec3Suspend = { x: number; y: number; z: number };
type HarvestSuspend = Omit<HarvestFutureState, 'rng'>;

type BaronSuspend = {
  beaten: boolean;
  ceremony: { atSim: number; elapsedSeconds: number } | null;
  standard: { planted: boolean; position: { x: number; z: number }; dropElapsed: number };
  rocket: {
    nextVolleyIn: number;
    telegraphElapsed: number | null;
    volleys: number;
    targetKind: 'hero' | 'building' | null;
    target: Vec3Suspend;
  };
};

type MegaprojectSuspend = {
  id: string;
  project: MegaprojectProjectState;
  targetActive: boolean;
};

type AgentSuspend = {
  consent: AgentConsentFutureState;
  prospector: ProspectorFutureState;
  sweeps: {
    xpIn: number;
    goldIn: number;
    repairIn: number;
    repairTarget: { id: BuildableId; index: number } | null;
    repairDwellElapsed: number | null;
  };
};

type ControlsSuspend = {
  runState: 'playing' | 'levelup' | 'dead';
  paused: boolean;
  playerPauseActive: boolean;
  territoryRingPresent: boolean;
  charm: { active: boolean; remaining: number; cooldown: number };
  blastAim: { ready: boolean; pointer: { x: number; z: number }; target: { x: number; z: number } };
  latches: {
    pause: boolean;
    restart: boolean;
    build: boolean;
    cancel: boolean;
    confirm: boolean;
    upgrade: boolean;
    rotate: boolean;
    weaponToggle: boolean;
    debugSpawn: boolean;
    debugXp: boolean;
  };
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
  sluice: { timer: number; contested: boolean; capped: boolean } | null;
  preplaced?: boolean;
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
  baronSpawned: boolean;
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
    if (!restoreSnapshot(game, snapshot)) return false;
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

export function runSuspendFutureState(snapshot: RunSuspendEnvelope): unknown {
  return {
    v: snapshot.v,
    wave: snapshot.wave,
    timeAlive: snapshot.timeAlive,
    contractId: snapshot.contractId,
    seed: snapshot.seed,
    rng: snapshot.rng,
    waveSystem: snapshot.waveSystem,
    enemies: {
      spawnSerial: snapshot.enemies.spawnSerial,
      active: snapshot.enemies.active.map(({ flashRemaining: _flash, flashCount: _flashes, rotationY: _rotation, spriteClip: _clip, spriteOrientation: _orientation, ...enemy }) => enemy),
    },
    economy: {
      gold: snapshot.economy.gold,
      bankCap: snapshot.economy.bankCap,
      resources: snapshot.economy.resources,
      log: snapshot.economy.log.map(({ id: _id, ...event }) => event),
    },
    hero: snapshot.hero,
    buildings: snapshot.buildings,
    goldPickups: snapshot.goldPickups,
    combat: {
      xp: snapshot.combat.xp,
      audit: snapshot.combat.audit,
      shooters: snapshot.combat.shooters,
      projectiles: snapshot.combat.projectiles.map(
        ({ visualStartY: _startY, visualEndY: _endY, visualDistance: _distance, visualTravel: _travel, ...projectile }) => projectile,
      ),
      blastCharges: snapshot.combat.blastCharges,
      xpMotes: snapshot.combat.xpMotes,
    },
    harvest: snapshot.harvest,
    baron: {
      beaten: snapshot.baron.beaten,
      ceremony: snapshot.baron.ceremony,
      rocket: snapshot.baron.rocket,
    },
    megaproject: snapshot.megaproject,
    runManager: snapshot.runManager,
    agent: snapshot.agent,
    controls: snapshot.controls,
    counters: snapshot.counters,
    meta: snapshot.meta,
    research: snapshot.research,
  };
}

/**
 * Project a suspend envelope onto shared simulation state. Pointer-derived blast
 * aim is presentation/input state and is deliberately ignored while multiplayer
 * uses automatic aim, so it must not manufacture a peer hash disagreement.
 */
export function multiplayerRunSuspendFutureState(snapshot: RunSuspendEnvelope): unknown {
  const future = runSuspendFutureState(snapshot) as Record<string, unknown>;
  if (!snapshot.controls) return future;
  const { blastAim: _localBlastAim, ...sharedControls } = snapshot.controls;
  return { ...future, controls: sharedControls };
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
      at: numberInRange(parsed.at, 0, MAX_TIMESTAMP) ?? Date.now(),
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

export function restoreRunSuspendSnapshot(
  game: unknown,
  snapshot: unknown,
  options: { persistProfile?: boolean } = {},
): boolean {
  const normalized = normalizeRunSuspendDatum(snapshot);
  if (!normalized) return false;
  return restoreSnapshot(game as AnyGame, normalized, options.persistProfile !== false);
}

export function runSuspendLabel(snapshot: RunSuspendEnvelope): string {
  return `Saved claim: wave ${snapshot.wave}. Mid-wave trail after that boundary will be replayed.`;
}

export function runSuspendRestoreFailure(): string | null {
  return lastRestoreFailure;
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
  const harvest = game.harvestSystem?.captureFutureState?.(at) as HarvestFutureState | undefined;
  const runManager = game.runManager?.captureSuspend?.() as RunManagerSuspendState | undefined;
  const buildings = captureBuildings(game.buildSystem);

  return {
    v: 2,
    migratedFromV1: false,
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
      waves: game.waveSystem?.captureRngState?.() ?? null,
      upgrades: progression?.captureRngState?.() ?? null,
      harvest: harvest ? { ...harvest.rng } : null,
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
      iframeRemaining: cleanNumber(hero?.iframeSecondsRemaining),
      position: vector3Snapshot(heroPosition),
      velocity: vector3Snapshot(heroVelocity),
    },
    buildings,
    goldPickups: deepClone(game.goldPickups?.captureSuspend?.() ?? []),
    combat: deepClone(game.combat?.captureSuspend?.() ?? emptyCombat(cleanNumber(progression?.xpTotal))),
    harvest: harvest
      ? {
          nodes: deepClone(harvest.nodes),
          channelNodeId: harvest.channelNodeId,
          progress: harvest.progress,
          panCapBlocked: harvest.panCapBlocked,
          ...(harvest.channels ? { channels: deepClone(harvest.channels) } : {}),
        }
      : null,
    baron: captureBaron(game, at),
    megaproject: captureMegaproject(game),
    runManager: runManager ?? { secured: false, rush: false, meta: deepClone(meta), payout: null },
    agent: captureAgent(game, at, buildings),
    controls: captureControls(game),
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

function emptyCombat(xp: number, buildings: readonly BuildingSuspend[] = []): CombatSuspendSnapshot {
  const shooters = [zeroShooter('hero:0:rig'), zeroShooter('hero:0:blast')];
  for (const building of buildings) {
    if (building.wrecked || (building.id !== 'sentry_beacon' && building.id !== 'turret')) continue;
    shooters.push(zeroShooter(`building:${building.id}:${building.index}`));
  }
  return {
    xp,
    audit: {
      ownerKills: {},
      ownerDamage: {},
      boltHits: 0,
      boltMisses: 0,
      staleTargetSwitches: 0,
      shots: { bolt: 0, lob: 0 },
      lastShotKind: null,
      lastShotOwnerId: null,
      xpDeaths: 0,
      xpMotesSpawned: 0,
      xpMotesCollected: 0,
      xpMotesCollectedValue: 0,
      xpOverflowBanked: 0,
      xpExpiredBanked: 0,
      blastDetonationCount: 0,
      lastBlastDetonation: null,
    },
    shooters,
    projectiles: [],
    blastCharges: [],
    xpMotes: [],
  };
}

function zeroShooter(resumeKey: string): CombatSuspendSnapshot['shooters'][number] {
  return { resumeKey, timer: 0, targetId: -1, missTargetId: -1, misses: 0 };
}

function captureBaron(game: AnyGame, at: number): BaronSuspend {
  const ceremony = game.baronCeremony as { atSim?: unknown; startedTickElapsed?: unknown } | null | undefined;
  const fixedTickElapsed = cleanNumber(game.fixedTickElapsed);
  const standardPosition = game.baronStandardPosition ?? {};
  const rocketTarget = game.baronRocketTarget ?? {};
  const telegraphStartedAt = cleanNumber(game.baronRocketTelegraphStartedAt, -1);
  return {
    beaten: game.baronBeatenThisRun === true,
    ceremony: ceremony
      ? {
          atSim: cleanNumber(ceremony.atSim, at),
          elapsedSeconds: Math.max(0, fixedTickElapsed - cleanNumber(ceremony.startedTickElapsed, fixedTickElapsed)),
        }
      : null,
    standard: {
      planted: game.baronStandardPlanted === true,
      position: { x: cleanNumber(standardPosition.x), z: cleanNumber(standardPosition.z) },
      dropElapsed: Math.max(0, cleanNumber(game.elapsed) - cleanNumber(game.baronStandardDropStartedAt)),
    },
    rocket: {
      nextVolleyIn: Math.max(0, cleanNumber(game.baronRocketNextAt) - at),
      telegraphElapsed: telegraphStartedAt >= 0 ? Math.max(0, at - telegraphStartedAt) : null,
      volleys: cleanNumber(game.baronRocketVolleys),
      targetKind: game.baronRocketTargetKind === 'hero' || game.baronRocketTargetKind === 'building' ? game.baronRocketTargetKind : null,
      target: vector3Snapshot(rocketTarget),
    },
  };
}

function captureMegaproject(game: AnyGame): MegaprojectSuspend | null {
  const id = game.megaprojectManifest?.id;
  const project = game.megaprojectProject;
  if (typeof id !== 'string' || !project) return null;
  return {
    id,
    targetActive: game.megaprojectTarget?.active === true,
    project: {
      stage: cleanNumber(project.stage),
      funded: project.funded === true,
      ticksRemaining: cleanNumber(project.ticksRemaining),
      hp: cleanNumber(project.hp),
      delayTicks: cleanNumber(project.delayTicks),
      defenseWave: cleanNumber(project.defenseWave),
    },
  };
}

function captureAgent(game: AnyGame, at: number, buildings: readonly BuildingSuspend[]): AgentSuspend | null {
  const consent = game.agentConsent?.captureFutureState?.() as AgentConsentFutureState | undefined;
  const prospector = game.prospector?.captureFutureState?.(at) as ProspectorFutureState | undefined;
  if (!consent || !prospector) return null;
  const repairTarget = game.prospectorRepairTarget as { id?: unknown; index?: unknown } | null | undefined;
  const validRepairTarget =
    repairTarget &&
    buildableIds.includes(repairTarget.id as BuildableId) &&
    Number.isInteger(repairTarget.index) &&
    buildings.some((building) => building.id === repairTarget.id && building.index === repairTarget.index);
  return {
    consent: deepClone(consent),
    prospector: deepClone(prospector),
    sweeps: {
      xpIn: Math.max(0, cleanNumber(game.nextProspectorXpSweepAt) - at),
      goldIn: Math.max(0, cleanNumber(game.nextProspectorGoldSweepAt) - at),
      repairIn: Math.max(0, cleanNumber(game.nextProspectorRepairSweepAt) - at),
      repairTarget: validRepairTarget
        ? { id: repairTarget.id as BuildableId, index: repairTarget.index as number }
        : null,
      repairDwellElapsed:
        typeof game.prospectorRepairDwellStartedAt === 'number'
          ? Math.max(0, cleanNumber(game.activeTickElapsed) - game.prospectorRepairDwellStartedAt)
          : null,
    },
  };
}

function captureControls(game: AnyGame): ControlsSuspend {
  const state = game.state?.current;
  return {
    runState: state === 'levelup' || state === 'dead' ? state : 'playing',
    paused: game.state?.isPaused === true,
    playerPauseActive: game.playerPauseActive === true,
    territoryRingPresent: game.territoryRingPresent === true,
    charm: {
      active: game.charmPauseActive === true,
      remaining: cleanNumber(game.charmPauseRemaining),
      cooldown: cleanNumber(game.charmPauseCooldown),
    },
    blastAim: {
      ready: game.pointerAimReady === true,
      pointer: { x: cleanNumber(game.pointerAimPoint?.x), z: cleanNumber(game.pointerAimPoint?.z) },
      target: { x: cleanNumber(game.blastAimPoint?.x), z: cleanNumber(game.blastAimPoint?.z) },
    },
    latches: {
      pause: game.lastPauseIntent === true,
      restart: game.lastRestartIntent === true,
      build: game.lastBuildIntent === true,
      cancel: game.lastCancelIntent === true,
      confirm: game.lastConfirmIntent === true,
      upgrade: game.lastUpgradeIntent === true,
      rotate: game.lastRotateIntent === true,
      weaponToggle: game.lastWeaponToggleIntent === true,
      debugSpawn: game.lastDebugSpawnIntent === true,
      debugXp: game.lastDebugXpIntent === true,
    },
  };
}

function restoreSnapshot(game: AnyGame, snapshot: RunSuspendEnvelope, persistProfile = true): boolean {
  lastRestoreFailure = null;
  if (!canRestoreSnapshot(game, snapshot)) return restoreFailed('context-preflight');
  game.enemies?.recycleAll?.();
  game.goldPickups?.recycleAll?.();
  game.xpMotes?.recycleAll?.();
  game.combat?.reset?.();
  game.harvestSystem?.reset?.();
  game.buildSystem?.reset?.();
  game.progression?.reset?.();
  game.agentConsent?.reset?.();

  if (snapshot.harvest === null) game.harvestSystem?.resetFromSeed?.(snapshot.seed);

  game.researchState = deepClone(snapshot.research);
  game.applyResearchEffects?.();
  game.timeAlive = snapshot.timeAlive;

  if (!restoreProgression(game, snapshot)) return restoreFailed('progression');
  restoreWaveSystem(game.waveSystem, snapshot.waveSystem, snapshot.rng.waves);
  restoreMegaproject(game, snapshot.megaproject);
  game.syncMegaprojectSite?.();

  if (!restoreBuildings(game, snapshot.buildings)) return restoreFailed('buildings');
  restoreEconomy(game, snapshot);
  game.syncMegaprojectSite?.();
  if (game.goldPickups?.restoreSuspend?.(snapshot.goldPickups) === false) return restoreFailed('gold-pickups');
  game.syncStockpileHoldings?.();
  if (!restoreEnemyPool(game, snapshot.enemies)) return restoreFailed('enemies');
  const hero = restoreHero(game, snapshot);
  if (game.combat?.restoreSuspend?.(snapshot.combat) === false) return restoreFailed('combat');
  if (
    snapshot.harvest &&
    game.harvestSystem?.restoreFutureState?.(
      { ...deepClone(snapshot.harvest), rng: deepClone(snapshot.rng.harvest) },
      snapshot.timeAlive,
    ) === false
  ) {
    return restoreFailed('harvest');
  }
  game.harvestSnapshot = game.harvestSystem?.snapshot ?? game.harvestSnapshot;
  game.lastHarvestChanneling = snapshot.harvest?.channels?.some((channel) => channel.channeling)
    ?? (snapshot.harvest?.channelNodeId !== null && snapshot.harvest?.channelNodeId !== undefined);

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
  game.damageFlashRemaining = 0;
  game.state?.restart?.();
  restoreControls(game, snapshot.controls, snapshot.meta);
  if (snapshot.controls?.runState === 'levelup' || (!snapshot.controls && snapshot.hero.offer)) {
    game.progression?.resumeSuspendChoice?.();
  }
  restoreBaron(game, snapshot.baron);
  if (snapshot.baron.ceremony || (snapshot.runManager.secured && !snapshot.runManager.rush)) {
    game.state?.setPaused?.(true);
  }
  game.syncHeroVisualHeight?.();
  game.cameraRig?.snapTo?.(hero?.group?.position);
  game.syncStockpileHoldings?.();
  if (!restoreAgent(game, snapshot, hero)) return restoreFailed('agent');
  game.runManager?.restoreSuspend?.(deepClone(snapshot.runManager), {
    materializeMeta: false,
    persistMeta: persistProfile,
  });
  if (persistProfile) game.researchState = saveResearchRegistryState(game.researchStorage, game.researchState);
  game.runManager?.finalizeSuspendRestore?.();
  game.uiBridge?.announce?.(snapshot.copy, snapshot.timeAlive, null, 4.8);
  if (snapshot.controls?.runState === 'dead') game.restoreDeathOverlayForSuspend?.();
  else game.deathOverlay?.hide?.();
  game.upgradeOverlay?.hide?.();
  game.publishDiagnostics?.();
  return true;
}

function restoreFailed(stage: string): false {
  lastRestoreFailure = stage;
  return false;
}

function canRestoreSnapshot(game: AnyGame, snapshot: RunSuspendEnvelope): boolean {
  if (snapshot.megaproject && snapshot.megaproject.id !== game.megaprojectManifest?.id) return false;
  if (snapshot.harvest) {
    const current = game.harvestSystem?.captureFutureState?.(snapshot.timeAlive) as HarvestFutureState | undefined;
    if (!current) return false;
    const expected = current.nodes.map((node) => node.id).sort();
    const incoming = snapshot.harvest.nodes.map((node) => node.id).sort();
    if (expected.length !== incoming.length || expected.some((id, index) => id !== incoming[index])) return false;
    if (
      !snapshot.rng.harvest ||
      game.harvestSystem?.canRestoreFutureState?.({ ...snapshot.harvest, rng: snapshot.rng.harvest }) === false
    ) {
      return false;
    }
  }
  const currentShooters = (game.combat?.captureSuspend?.() as CombatSuspendSnapshot | undefined)?.shooters ?? [];
  const expectedShooterKeys = currentShooters
    .map((shooter) => shooter.resumeKey)
    .filter((key) => !key.startsWith('building:'));
  for (const building of snapshot.buildings) {
    if (!building.wrecked && (building.id === 'sentry_beacon' || building.id === 'turret')) {
      expectedShooterKeys.push(`building:${building.id}:${building.index}`);
    }
  }
  if (game.combat?.canRestoreSuspend?.(snapshot.combat, expectedShooterKeys) === false) return false;
  return true;
}

function restoreMegaproject(game: AnyGame, snapshot: MegaprojectSuspend | null): void {
  if (!snapshot) return;
  if (!game.megaprojectState?.projects) game.megaprojectState = { version: 1, projects: {} };
  game.megaprojectState.projects[snapshot.id] = deepClone(snapshot.project);
  game.megaprojectProject = game.megaprojectState.projects[snapshot.id];
}

function restoreBaron(game: AnyGame, snapshot: BaronSuspend): void {
  game.baronBeatenThisRun = snapshot.beaten;
  game.baronCeremony = snapshot.ceremony
    ? {
        atSim: snapshot.ceremony.atSim,
        startedTickElapsed: cleanNumber(game.fixedTickElapsed) - snapshot.ceremony.elapsedSeconds,
      }
    : null;
  game.baronStandardPlanted = snapshot.standard.planted;
  game.baronStandardPosition?.set?.(snapshot.standard.position.x, 0, snapshot.standard.position.z);
  game.baronStandardDropStartedAt = cleanNumber(game.elapsed) - snapshot.standard.dropElapsed;
  if (game.baronStandardGroup) game.baronStandardGroup.visible = snapshot.standard.planted;
  game.baronRocketNextAt = game.timeAlive + snapshot.rocket.nextVolleyIn;
  game.baronRocketTelegraphStartedAt =
    snapshot.rocket.telegraphElapsed === null ? -1 : game.timeAlive - snapshot.rocket.telegraphElapsed;
  game.baronRocketVolleys = snapshot.rocket.volleys;
  game.baronRocketSuppressed = false;
  game.baronRocketTargetKind = snapshot.rocket.targetKind;
  game.baronRocketTarget?.set?.(snapshot.rocket.target.x, snapshot.rocket.target.y, snapshot.rocket.target.z);
  game.syncBaronStandardDrop?.();
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
  hero.restoreIframes?.(snapshot.hero.iframeRemaining);
  hero.targetVelocity?.set(0, 0, 0);
  hero.nextPosition?.copy(position);
  return hero;
}

function restoreAgent(game: AnyGame, snapshot: RunSuspendEnvelope, hero: AnyGame | undefined): boolean {
  const agent = snapshot.agent;
  if (!agent) {
    game.agentConsent?.reset?.();
    game.prospector?.reset?.(hero?.group?.position);
    game.nextProspectorXpSweepAt = 0;
    game.nextProspectorGoldSweepAt = 0;
    game.nextProspectorRepairSweepAt = 0;
    game.prospectorRepairTarget = null;
    game.prospectorRepairDwellStartedAt = null;
    return true;
  }
  if (game.agentConsent?.restoreFutureState?.(agent.consent) === false) return false;
  if (game.prospector?.restoreFutureState?.(agent.prospector, snapshot.timeAlive) === false) return false;
  game.nextProspectorXpSweepAt = snapshot.timeAlive + agent.sweeps.xpIn;
  game.nextProspectorGoldSweepAt = snapshot.timeAlive + agent.sweeps.goldIn;
  game.nextProspectorRepairSweepAt = snapshot.timeAlive + agent.sweeps.repairIn;
  game.prospectorRepairTarget = agent.sweeps.repairTarget ? { ...agent.sweeps.repairTarget } : null;
  game.prospectorRepairDwellStartedAt =
    agent.sweeps.repairDwellElapsed === null
      ? null
      : cleanNumber(game.activeTickElapsed) - agent.sweeps.repairDwellElapsed;
  return true;
}

function restoreControls(game: AnyGame, controls: ControlsSuspend | null, meta: MetaProgress): void {
  const restored = controls ?? {
    runState: 'playing',
    paused: false,
    playerPauseActive: false,
    territoryRingPresent: meta.tracks.territory >= Balance.meta.territoryTier1,
    charm: { active: false, remaining: 0, cooldown: 0 },
    blastAim: { ready: false, pointer: { x: 0, z: 0 }, target: { x: 0, z: 2 } },
    latches: {
      pause: false,
      restart: false,
      build: false,
      cancel: false,
      confirm: false,
      upgrade: false,
      rotate: false,
      weaponToggle: false,
      debugSpawn: false,
      debugXp: false,
    },
  } satisfies ControlsSuspend;
  game.playerPauseActive = restored.playerPauseActive;
  game.territoryRingPresent = restored.territoryRingPresent;
  game.charmPauseRemaining = restored.charm.remaining;
  game.charmPauseCooldown = restored.charm.cooldown;
  game.charmPauseActive = restored.charm.active;
  game.lastPauseIntent = restored.latches.pause;
  game.lastRestartIntent = restored.latches.restart;
  game.lastBuildIntent = restored.latches.build;
  game.lastCancelIntent = restored.latches.cancel;
  game.lastConfirmIntent = restored.latches.confirm;
  game.lastUpgradeIntent = restored.latches.upgrade;
  game.lastRotateIntent = restored.latches.rotate;
  game.lastWeaponToggleIntent = restored.latches.weaponToggle;
  game.lastDebugSpawnIntent = restored.latches.debugSpawn;
  game.lastDebugXpIntent = restored.latches.debugXp;
  game.pointerAimReady = restored.blastAim.ready;
  game.pointerAimPoint?.set?.(restored.blastAim.pointer.x, 0.08, restored.blastAim.pointer.z);
  game.blastAimPoint?.set?.(restored.blastAim.target.x, 0.08, restored.blastAim.target.z);
  if (restored.runState === 'dead') game.state?.transition?.('dead');
  if (restored.paused && restored.runState === 'playing') game.state?.setPaused?.(true);
}

function captureEnemyPool(enemyPool: AnyGame | undefined): EnemyPoolSuspendSnapshot {
  return deepClone(enemyPool?.captureSuspend?.() ?? { spawnSerial: 0, active: [] });
}

function restoreEnemyPool(game: AnyGame, snapshot: EnemyPoolSuspendSnapshot): boolean {
  const enemyPool = game.enemies as AnyGame | undefined;
  if (!enemyPool?.restoreSuspend) return snapshot.active.length === 0;
  return enemyPool.restoreSuspend(snapshot, {
    goldHoldingById: (id: string) => game.goldTargeting?.goldHoldingById?.(id) ?? null,
    buildingById: (id: string) => game.goldTargeting?.buildingById?.(id) ?? null,
  });
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
        rotationSteps:
          id === 'palisade'
            ? cleanNumber(buildSystem.palisades?.rotationStepsAt?.(index))
            : id === 'lantern_post'
              ? cleanNumber(buildSystem.lanternPosts?.rotationStepsAt?.(index))
              : 0,
        preplaced: buildSystem.preplaced?.[id]?.[index] === true,
        ...(buildSystem.captureBuildingFutureState?.(id, index) ?? { sluice: null }),
      };
    });
}

function restoreBuildings(game: AnyGame, buildings: readonly BuildingSuspend[]): boolean {
  const buildSystem = game.buildSystem as AnyGame | undefined;
  if (!buildSystem?.restoreBuilding) return buildings.length === 0;
  return buildings.every((building) => buildSystem.restoreBuilding(deepClone(building)) === true);
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

function restoreProgression(game: AnyGame, snapshot: RunSuspendEnvelope): boolean {
  const progression = game.progression as AnyGame | undefined;
  if (!progression?.restoreSuspend) return false;
  if (
    progression.restoreSuspend({
      level: snapshot.hero.level,
      xpTotal: snapshot.hero.xpTotal,
      spentXp: snapshot.hero.spentXp,
      pendingLevels: snapshot.hero.pendingLevels,
      offer: snapshot.hero.offer,
      stacks: snapshot.hero.stacks,
    }) === false
  ) {
    return false;
  }
  if (snapshot.rng.upgrades) progression.restoreRngState?.(snapshot.rng.upgrades);
  game.applyStats?.(progression.snapshot.stats, null);
  return true;
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
    baronSpawned: waveSystem?.baronSpawned === true,
  };
}

function restoreWaveSystem(waveSystem: AnyGame | undefined, snapshot: WaveSystemSuspend, rng: RngState | null): void {
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
  waveSystem.baronSpawned = snapshot.baronSpawned;
  if (rng) waveSystem.restoreRngState?.(rng);
}

const MAX_TIME = 1000 * 60 * 60 * 24 * 365 * 10;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
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
  const sourceVersion = value.v === 1 || value.v === 2 ? value.v : null;
  if (sourceVersion === null) reasons.push('version must be 1 or 2');
  const isV2 = sourceVersion === 2;
  const migratedFromV1 = isV2 ? value.migratedFromV1 === true : true;
  if (isV2 && typeof value.migratedFromV1 !== 'boolean') reasons.push('migratedFromV1 must be boolean');

  const wave = requiredInteger(value.wave, 0, MAX_COUNT, 'wave', reasons);
  const timeAlive = requiredNumber(value.timeAlive, 0, MAX_TIME, 'timeAlive', reasons);
  const contractId = requiredString(value.contractId, 'contractId', reasons, 96);
  const economy = decodeEconomy(value.economy, reasons, isV2);
  const hero = decodeHero(value.hero, reasons, isV2);
  const buildings = decodeBuildings(value.buildings, reasons, isV2);
  const counters = decodeCounters(value.counters, reasons);
  const decodedRng = decodeRngState(value.rng, reasons, isV2);
  const legacySeed = typeof value.seed === 'string' ? value.seed.slice(0, 128) : null;
  const rng =
    decodedRng && !isV2
      ? {
          ...decodedRng,
          waves: decodedRng.waves ?? initialRngCounter(`${legacySeed ?? 'gold-rush'}:waves`),
          upgrades: decodedRng.upgrades ?? initialRngCounter(`${legacySeed ?? 'gold-rush'}:upgrades`),
        }
      : decodedRng;
  const waveSystem = decodeWaveSystem(value.waveSystem, reasons, isV2);
  const enemies = decodeEnemyPool(value.enemies, reasons, isV2);
  const meta = decodeMetaProgress(value.meta, reasons);
  const decodedResearch = decodeResearchState(value.research, reasons, isV2);
  const research = decodedResearch;
  const goldPickups = isV2 ? decodeGoldPickups(value.goldPickups, reasons) : [];
  const combat = isV2 ? decodeCombat(value.combat, reasons) : hero && buildings ? emptyCombat(hero.xpTotal, buildings) : null;
  const harvest = isV2 ? decodeHarvest(value.harvest, reasons) : null;
  const baron = isV2 ? decodeBaron(value.baron, reasons) : emptyBaron();
  const megaproject = isV2 ? decodeMegaproject(value.megaproject, reasons) : null;
  const runManager = isV2 ? decodeRunManager(value.runManager, reasons) : meta ? { secured: false, rush: false, meta, payout: null } : null;
  const agent = isV2 ? decodeAgent(value.agent, reasons) : null;
  const controls = isV2 ? decodeControls(value.controls, reasons) : null;
  if (isV2 && rng && (!rng.waves || !rng.upgrades)) reasons.push('v2 wave and upgrade RNG counters are required');
  if (isV2 && !migratedFromV1 && harvest === null) reasons.push('native v2 harvest state is required');
  if (isV2 && !migratedFromV1 && agent === null) reasons.push('native v2 agent state is required');
  if (isV2 && !migratedFromV1 && controls === null) reasons.push('native v2 controls state is required');
  if (isV2 && rng && harvest !== undefined && (rng.harvest === null) !== (harvest === null)) {
    reasons.push('rng.harvest and harvest must both be present or both be null');
  }
  if (isV2 && meta && runManager && JSON.stringify(meta.tracks) !== JSON.stringify(runManager.meta.tracks)) {
    reasons.push('runManager.meta must match meta');
  }
  if (combat && buildings) validateShooterTopology(combat, buildings, reasons);
  if (combat && hero && combat.xp > hero.xpTotal) reasons.push('combat.xp cannot lead hero.xpTotal');
  if (combat && buildings && enemies && goldPickups) {
    validateOwnerReferences(combat, buildings, enemies, goldPickups, megaproject, reasons);
  }
  if (
    agent?.sweeps.repairTarget &&
    buildings &&
    !buildings.some(
      (building) => building.id === agent.sweeps.repairTarget?.id && building.index === agent.sweeps.repairTarget.index,
    )
  ) {
    reasons.push('agent.sweeps.repairTarget must identify a restored building');
  }
  if (controls?.runState === 'levelup' && !hero?.offer) reasons.push('controls.levelup requires hero.offer');
  if (controls?.runState === 'dead' && hero?.hp !== 0) reasons.push('controls.dead requires zero hero HP');
  if (controls && (baron?.ceremony || (runManager?.secured && !runManager.rush)) && !controls.paused) {
    reasons.push('controls.paused must cover ceremony and secured-claim stops');
  }

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
    research === null ||
    goldPickups === null ||
    combat === null ||
    harvest === undefined ||
    baron === null ||
    megaproject === undefined ||
    runManager === null
    || agent === undefined || controls === undefined
  ) {
    return rejected(reasons, economy?.dropped ?? 0);
  }

  const normalized: RunSuspendEnvelope = {
    v: 2,
    migratedFromV1,
    wave,
    timeAlive,
    writtenAt: numberInRange(value.writtenAt, 0, MAX_TIMESTAMP) ?? Date.now(),
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
    goldPickups,
    combat,
    harvest,
    baron,
    megaproject,
    runManager: deepClone(runManager),
    agent: deepClone(agent),
    controls: deepClone(controls),
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

function initialRngCounter(seed: string): RngState {
  return createRng(seed).snapshot();
}

function decodeEconomy(
  value: unknown,
  reasons: string[],
  requireV2: boolean,
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
  const resources = decodeResources(record.resources, reasons, requireV2);
  const log: EconomyEvent[] = [];
  let dropped = 0;
  for (const entry of record.log.slice(0, MAX_ECONOMY_EVENTS)) {
    const event = decodeEconomyEvent(entry);
    if (event) log.push(event);
    else dropped += 1;
  }
  if (gold === null || bankCap === null || !resources) return null;
  const normalizedResources = {
    gold: requireV2 ? resources.gold : { amount: gold, cap: bankCap },
    pressure: resources.pressure ?? deepClone(initialEconomyState.resources.pressure),
  };
  if (requireV2 && (normalizedResources.gold.amount !== gold || normalizedResources.gold.cap !== bankCap)) {
    reasons.push('economy.resources.gold must match economy.gold and economy.bankCap');
    return null;
  }
  return { gold, bankCap, resources: normalizedResources, log, dropped };
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
      if (value.source === 'upgrade_assay' || value.source === 'debug' || value.source === 'escort') return { id, at, type: value.type, source: value.source, amount };
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

function decodeHero(value: unknown, reasons: string[], requireV2: boolean): RunSuspendEnvelope['hero'] | null {
  const record = requiredRecord(value, 'hero', reasons);
  if (!record) return null;
  const level = requiredInteger(record.level, 1, MAX_COUNT, 'hero.level', reasons);
  const xpTotal = requiredNumber(record.xpTotal, 0, MAX_ECONOMY_AMOUNT, 'hero.xpTotal', reasons);
  const spentXp = requiredNumber(record.spentXp, 0, MAX_ECONOMY_AMOUNT, 'hero.spentXp', reasons);
  const xpInto = requiredNumber(record.xpInto, 0, MAX_ECONOMY_AMOUNT, 'hero.xpInto', reasons);
  const pendingLevels = requiredInteger(record.pendingLevels, 0, MAX_COUNT, 'hero.pendingLevels', reasons);
  const hp = requiredNumber(record.hp, 0, MAX_ECONOMY_AMOUNT, 'hero.hp', reasons);
  const maxHp = requiredNumber(record.maxHp, 1, MAX_ECONOMY_AMOUNT, 'hero.maxHp', reasons);
  const iframeRemaining = requireV2
    ? requiredNumber(record.iframeRemaining, 0, MAX_TIME, 'hero.iframeRemaining', reasons)
    : 0;
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
    iframeRemaining === null ||
    !position ||
    !velocity ||
    !stacks ||
    offer === undefined
  ) {
    return null;
  }
  if (spentXp > xpTotal || xpInto !== xpTotal - spentXp) reasons.push('hero XP totals are inconsistent');
  if (hp > maxHp) reasons.push('hero.hp cannot exceed hero.maxHp');
  if (offer && offer.some((id) => !isUpgradeId(id))) reasons.push('hero.offer contains an unknown upgrade');
  if (offer && new Set(offer).size !== offer.length) reasons.push('hero.offer contains duplicates');
  if (offer && pendingLevels === 0) reasons.push('hero.offer requires a pending level');
  for (const id of Object.keys(stacks)) {
    if (!isUpgradeId(id)) {
      reasons.push(`hero.stacks.${id} is unknown`);
      continue;
    }
    const maxStacks = upgradeDefById[id].maxStacks;
    if (Number.isFinite(maxStacks) && stacks[id] > maxStacks) reasons.push(`hero.stacks.${id} exceeds its stack limit`);
  }
  const expectedMaxHp = Balance.hero.maxHp + effectiveStats(stacks).maxHpBonus;
  if (maxHp !== expectedMaxHp) reasons.push('hero.maxHp must match the restored upgrade stacks');
  return { level, xpTotal, spentXp, xpInto, pendingLevels, offer, stacks, hp, maxHp, iframeRemaining, position, velocity };
}

function decodeBuildings(value: unknown, reasons: string[], requireV2: boolean): BuildingSuspend[] | null {
  const before = reasons.length;
  if (!Array.isArray(value)) {
    reasons.push('buildings must be an array');
    return null;
  }
  if (value.length > MAX_BUILDINGS) reasons.push('buildings is too long');
  const output: BuildingSuspend[] = [];
  const slots = new Set<string>();
  for (const [i, entry] of value.slice(0, MAX_BUILDINGS).entries()) {
    const record = requiredRecord(entry, `buildings[${i}]`, reasons);
    if (!record) continue;
    const id = buildableIds.includes(record.id as BuildableId) ? (record.id as BuildableId) : null;
    if (!id) reasons.push(`buildings[${i}].id is unknown`);
    const maxIndex = id
      ? Math.max(0, (buildableDefs.find((def) => def.id === id)?.maxCount ?? 1) * (id === 'lantern_post' ? 2 : 1) - 1)
      : MAX_BUILDINGS;
    const index = requiredInteger(record.index, 0, maxIndex, `buildings[${i}].index`, reasons);
    const tier = requiredInteger(record.tier, 1, 20, `buildings[${i}].tier`, reasons);
    const hp = requiredNumber(record.hp, 0, MAX_ECONOMY_AMOUNT, `buildings[${i}].hp`, reasons);
    const maxHp = requiredNumber(record.maxHp, 1, MAX_ECONOMY_AMOUNT, `buildings[${i}].maxHp`, reasons);
    const buildCost = requiredNumber(record.buildCost, 0, MAX_ECONOMY_AMOUNT, `buildings[${i}].buildCost`, reasons);
    const repairProgress = requiredNumber(record.repairProgress, 0, MAX_TIME, `buildings[${i}].repairProgress`, reasons);
    const position = decodeVector2(record.position, `buildings[${i}].position`, reasons);
    const rotationSteps = requiredInteger(record.rotationSteps, -1000, 1000, `buildings[${i}].rotationSteps`, reasons);
    const sluice = decodeSluiceFutureState(record.sluice, `buildings[${i}].sluice`, reasons, requireV2, id === 'sluice');
    if (!id || index === null || tier === null || hp === null || maxHp === null || buildCost === null || repairProgress === null || !position || rotationSteps === null || sluice === undefined || typeof record.wrecked !== 'boolean') continue;
    if (hp > maxHp) reasons.push(`buildings[${i}].hp cannot exceed maxHp`);
    if ((record.wrecked && hp !== 0) || (!record.wrecked && hp === 0)) {
      reasons.push(`buildings[${i}].wrecked must match zero HP`);
    }
    const slotKey = `${id}:${index}`;
    if (slots.has(slotKey)) {
      reasons.push(`buildings[${i}] duplicates ${slotKey}`);
      continue;
    }
    slots.add(slotKey);
    output.push({
      id,
      index,
      tier,
      hp,
      maxHp,
      baseMaxHp: numberInRange(record.baseMaxHp, 0, MAX_ECONOMY_AMOUNT) ?? undefined,
      buildCost,
      repairCostOverride: numberInRange(record.repairCostOverride, 0, MAX_ECONOMY_AMOUNT) ?? undefined,
      preplaced: record.preplaced === true,
      wrecked: record.wrecked,
      repairProgress,
      position,
      rotationSteps,
      sluice,
    });
  }
  return reasons.length === before ? output : null;
}

function decodeSluiceFutureState(
  value: unknown,
  label: string,
  reasons: string[],
  requireV2: boolean,
  isSluice: boolean,
): BuildingSuspend['sluice'] | undefined {
  if (!requireV2) return isSluice ? { timer: 0, contested: false, capped: false } : null;
  if (!isSluice) {
    if (value !== null) reasons.push(`${label} must be null for non-sluice buildings`);
    return value === null ? null : undefined;
  }
  const record = requiredRecord(value, label, reasons);
  if (!record) return undefined;
  const timer = requiredNumber(record.timer, 0, MAX_TIME, `${label}.timer`, reasons);
  if (typeof record.contested !== 'boolean') reasons.push(`${label}.contested must be boolean`);
  if (typeof record.capped !== 'boolean') reasons.push(`${label}.capped must be boolean`);
  return timer === null || typeof record.contested !== 'boolean' || typeof record.capped !== 'boolean'
    ? undefined
    : { timer, contested: record.contested, capped: record.capped };
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

function decodeRngState(value: unknown, reasons: string[], requireHarvest: boolean): RunSuspendEnvelope['rng'] | null {
  const record = requiredRecord(value, 'rng', reasons);
  if (!record) return null;
  const waves = decodeRngCounter(record.waves, 'rng.waves', reasons);
  const upgrades = decodeRngCounter(record.upgrades, 'rng.upgrades', reasons);
  const harvest = requireHarvest ? decodeRngCounter(record.harvest, 'rng.harvest', reasons) : null;
  if (waves === undefined || upgrades === undefined || harvest === undefined) return null;
  return { waves, upgrades, harvest };
}

function decodeRngCounter(value: unknown, label: string, reasons: string[]): RngState | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, label, reasons);
  if (!record) return undefined;
  const seed = requiredInteger(record.seed, 0, MAX_RNG_SEED, `${label}.seed`, reasons);
  const calls = requiredInteger(record.calls, 0, MAX_COUNT, `${label}.calls`, reasons);
  return seed === null || calls === null ? undefined : { seed, calls };
}

function decodeWaveSystem(value: unknown, reasons: string[], requireV2: boolean): WaveSystemSuspend | null {
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
    record.lastPulseAt === null || record.lastPulseAt === Number.NEGATIVE_INFINITY
      ? Number.NEGATIVE_INFINITY
      : requiredNumber(record.lastPulseAt, -MAX_TIME, MAX_TIME, 'waveSystem.lastPulseAt', reasons);
  const edge = record.edge === null || isCompassEdge(record.edge) ? record.edge : null;
  if (record.edge !== null && !isCompassEdge(record.edge)) reasons.push('waveSystem.edge is invalid');
  const waveState = isWaveState(record.waveState) ? record.waveState : null;
  if (!waveState) reasons.push('waveSystem.waveState is invalid');
  const plannedPulses = decodePlannedPulses(record.plannedPulses, reasons);
  const baronSpawned = requireV2 ? record.baronSpawned : false;
  if (requireV2 && typeof baronSpawned !== 'boolean') reasons.push('waveSystem.baronSpawned must be boolean');
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
    baronSpawned: baronSpawned === true,
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

function decodeEnemyPool(value: unknown, reasons: string[], requireV2: boolean): EnemyPoolSuspendSnapshot | null {
  const before = reasons.length;
  const record = requiredRecord(value, 'enemies', reasons);
  if (!record) return null;
  const spawnSerial = requiredInteger(record.spawnSerial, 0, MAX_COUNT, 'enemies.spawnSerial', reasons);
  if (!Array.isArray(record.active)) {
    reasons.push('enemies.active must be an array');
    return null;
  }
  if (record.active.length > Balance.enemy.poolSize) reasons.push('enemies.active is too long');
  const active: EnemySuspendSnapshot[] = [];
  const slots = new Set<number>();
  for (const [i, entry] of record.active.slice(0, MAX_ENEMIES).entries()) {
    const enemy = decodeEnemy(entry, `enemies.active[${i}]`, reasons, requireV2);
    if (!enemy) continue;
    if (slots.has(enemy.slot)) reasons.push(`enemies.active[${i}].slot is duplicated`);
    slots.add(enemy.slot);
    active.push(enemy);
  }
  return spawnSerial === null || reasons.length !== before ? null : { spawnSerial, active };
}

function decodeEnemy(value: unknown, label: string, reasons: string[], requireV2: boolean): EnemySuspendSnapshot | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const slotValue = requireV2 ? record.slot : record.index;
  const required = {
    slot: requiredInteger(slotValue, 0, Balance.enemy.poolSize - 1, `${label}.${requireV2 ? 'slot' : 'index'}`, reasons),
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
  const gapWaypoint = record.gapWaypoint === undefined
    ? position
    : decodeVector3(record.gapWaypoint, `${label}.gapWaypoint`, reasons);
  const watchdogAnchor = record.watchdogAnchor === undefined
    ? position
    : decodeVector3(record.watchdogAnchor, `${label}.watchdogAnchor`, reasons);
  const edge = record.edge === null || isCompassEdge(record.edge) ? record.edge : null;
  if (record.edge !== null && !isCompassEdge(record.edge)) reasons.push(`${label}.edge is invalid`);
  const maxHp = versionedNumber(record.maxHp, Math.max(cleanNumber(record.hp), Balance.enemy.hp), 0, MAX_ECONOMY_AMOUNT, `${label}.maxHp`, reasons, requireV2);
  const visualScale = versionedNumber(record.visualScale, 1, 0.1, MAX_COUNT, `${label}.visualScale`, reasons, requireV2);
  const contactDamageScale = versionedNumber(record.contactDamageScale, 1, 0, MAX_COUNT, `${label}.contactDamageScale`, reasons, requireV2);
  const buildingDamageScale = versionedNumber(record.buildingDamageScale, 1, 0, MAX_COUNT, `${label}.buildingDamageScale`, reasons, requireV2);
  const supportBuildingDamageScale = versionedNumber(
    record.supportBuildingDamageScale,
    buildingDamageScale ?? 1,
    0,
    MAX_COUNT,
    `${label}.supportBuildingDamageScale`,
    reasons,
    requireV2,
  );
  const heroPursuitRange = versionedNumber(record.heroPursuitRange, 0, 0, MAX_COORD, `${label}.heroPursuitRange`, reasons, requireV2);
  const boltDamageMult = versionedNumber(record.boltDamageMult, 1, 0, MAX_COUNT, `${label}.boltDamageMult`, reasons, requireV2);
  const bossGroupSize = versionedInteger(record.bossGroupSize, 0, 0, MAX_COUNT, `${label}.bossGroupSize`, reasons, requireV2);
  const bossGroupTotalHp = versionedNumber(record.bossGroupTotalHp, 0, 0, MAX_ECONOMY_AMOUNT, `${label}.bossGroupTotalHp`, reasons, requireV2);
  const bossDegradeSpeedMult = versionedNumber(record.bossDegradeSpeedMult, 1, 0, MAX_COUNT, `${label}.bossDegradeSpeedMult`, reasons, requireV2);
  const scriptedRouteIndex = versionedInteger(record.scriptedRouteIndex, 0, 0, MAX_COUNT, `${label}.scriptedRouteIndex`, reasons, requireV2);
  const scriptedRoute = requireV2 ? decodeVector3Array(record.scriptedRoute, `${label}.scriptedRoute`, reasons, 128) : [];
  const eliteKind = record.eliteKind === null || record.eliteKind === 'baron' || record.eliteKind === 'railcar' ? record.eliteKind : null;
  if (requireV2 && record.eliteKind !== null && eliteKind === null) reasons.push(`${label}.eliteKind is invalid`);
  const variantId = versionedNullableString(record.variantId, `${label}.variantId`, reasons, requireV2);
  const variantLabel = versionedNullableString(record.variantLabel, `${label}.variantLabel`, reasons, requireV2);
  const bossGroupId = versionedNullableString(record.bossGroupId, `${label}.bossGroupId`, reasons, requireV2);
  const bossComponentId = versionedNullableString(record.bossComponentId, `${label}.bossComponentId`, reasons, requireV2);
  const bossComponentLabel = versionedNullableString(record.bossComponentLabel, `${label}.bossComponentLabel`, reasons, requireV2);
  const currentHoldingId = versionedNullableString(record.currentHoldingId, `${label}.currentHoldingId`, reasons, requireV2);
  const currentBuildingId = versionedNullableString(record.currentBuildingId, `${label}.currentBuildingId`, reasons, requireV2);
  const gapBlockerId = record.gapBlockerId === undefined
    ? null
    : versionedNullableString(record.gapBlockerId, `${label}.gapBlockerId`, reasons, true);
  const gnawTargetId = record.gnawTargetId === undefined
    ? null
    : versionedNullableString(record.gnawTargetId, `${label}.gnawTargetId`, reasons, true);
  const watchdogElapsed = record.watchdogElapsed === undefined
    ? 0
    : requiredNumber(record.watchdogElapsed, 0, MAX_TIME, `${label}.watchdogElapsed`, reasons);
  const watchdogTrips = record.watchdogTrips === undefined
    ? 0
    : requiredInteger(record.watchdogTrips, 0, MAX_COUNT, `${label}.watchdogTrips`, reasons);
  const gnawing = record.gnawing === undefined ? false : record.gnawing;
  const variantTint = requireV2 ? versionedNullableString(record.variantTint, `${label}.variantTint`, reasons, true) : null;
  if (variantTint && !/^#[0-9a-f]{6}$/i.test(variantTint)) reasons.push(`${label}.variantTint is invalid`);
  const thiefState = isThiefState(record.thiefState) ? record.thiefState : record.thief === true ? 'seekHolding' : 'none';
  const wreckerState = isWreckerState(record.wreckerState) ? record.wreckerState : record.wrecker === true ? 'seekBuilding' : 'none';
  if (requireV2 && !isThiefState(record.thiefState)) reasons.push(`${label}.thiefState is invalid`);
  if (requireV2 && !isWreckerState(record.wreckerState)) reasons.push(`${label}.wreckerState is invalid`);
  const spriteOrientation = isSpriteOrientation(record.spriteOrientation) ? record.spriteOrientation : 's';
  if (requireV2 && !isSpriteOrientation(record.spriteOrientation)) reasons.push(`${label}.spriteOrientation is invalid`);
  if (
    Object.values(required).some((entry) => entry === null) ||
    !position ||
    !velocity ||
    !leadVelocity ||
    !heading ||
    !scriptedTarget ||
    !gapWaypoint ||
    !watchdogAnchor ||
    maxHp === null ||
    visualScale === null ||
    contactDamageScale === null ||
    buildingDamageScale === null ||
    supportBuildingDamageScale === null ||
    heroPursuitRange === null ||
    boltDamageMult === null ||
    bossGroupSize === null ||
    bossGroupTotalHp === null ||
    bossDegradeSpeedMult === null ||
    scriptedRouteIndex === null ||
    !scriptedRoute ||
    variantId === undefined ||
    variantLabel === undefined ||
    bossGroupId === undefined ||
    bossComponentId === undefined ||
    bossComponentLabel === undefined ||
    currentHoldingId === undefined ||
    currentBuildingId === undefined ||
    gapBlockerId === undefined ||
    gnawTargetId === undefined ||
    watchdogElapsed === null ||
    watchdogTrips === null ||
    variantTint === undefined ||
    typeof record.thief !== 'boolean' ||
    typeof record.wrecker !== 'boolean' ||
    typeof record.scripted !== 'boolean' ||
    typeof gnawing !== 'boolean' ||
    (requireV2 && typeof record.banner !== 'boolean') ||
    (requireV2 && typeof record.scriptedIgnoresTerrain !== 'boolean')
  ) {
    return null;
  }
  if ((required.hp ?? 0) <= 0 || (required.hp ?? 0) > maxHp) {
    reasons.push(`${label}.hp must be positive and no greater than maxHp`);
  }
  if (scriptedRoute.length === 0 ? scriptedRouteIndex !== 0 : scriptedRouteIndex >= scriptedRoute.length) {
    reasons.push(`${label}.scriptedRouteIndex is outside scriptedRoute`);
  }
  if (record.thief && record.wrecker) reasons.push(`${label} cannot be both thief and wrecker`);
  if ((record.thief && thiefState === 'none') || (!record.thief && thiefState !== 'none')) {
    reasons.push(`${label}.thiefState does not match thief`);
  }
  if ((record.wrecker && wreckerState === 'none') || (!record.wrecker && wreckerState !== 'none')) {
    reasons.push(`${label}.wreckerState does not match wrecker`);
  }
  if (!record.thief && currentHoldingId !== null) reasons.push(`${label}.currentHoldingId requires thief`);
  if (!record.wrecker && currentBuildingId !== null) reasons.push(`${label}.currentBuildingId requires wrecker`);
  return {
    ...(required as Omit<
      EnemySuspendSnapshot,
      | 'maxHp'
      | 'eliteKind'
      | 'visualScale'
      | 'banner'
      | 'contactDamageScale'
      | 'buildingDamageScale'
      | 'supportBuildingDamageScale'
      | 'heroPursuitRange'
      | 'variantId'
      | 'variantLabel'
      | 'variantTint'
      | 'boltDamageMult'
      | 'bossGroupId'
      | 'bossGroupSize'
      | 'bossGroupTotalHp'
      | 'bossComponentId'
      | 'bossComponentLabel'
      | 'bossDegradeSpeedMult'
      | 'thief'
      | 'wrecker'
      | 'carriedLantern'
      | 'thiefState'
      | 'wreckerState'
      | 'currentHoldingId'
      | 'currentBuildingId'
      | 'gapBlockerId'
      | 'gapWaypoint'
      | 'watchdogElapsed'
      | 'watchdogAnchor'
      | 'watchdogTrips'
      | 'gnawTargetId'
      | 'gnawing'
      | 'edge'
      | 'scripted'
      | 'scriptedIgnoresTerrain'
      | 'scriptedRoute'
      | 'scriptedRouteIndex'
      | 'position'
      | 'velocity'
      | 'leadVelocity'
      | 'heading'
      | 'scriptedTarget'
      | 'spriteClip'
      | 'spriteOrientation'
    >),
    maxHp,
    eliteKind,
    visualScale,
    banner: requireV2 ? record.banner === true : false,
    contactDamageScale,
    buildingDamageScale,
    supportBuildingDamageScale,
    heroPursuitRange,
    variantId,
    variantLabel,
    variantTint,
    boltDamageMult,
    bossGroupId,
    bossGroupSize,
    bossGroupTotalHp,
    bossComponentId,
    bossComponentLabel,
    bossDegradeSpeedMult,
    thief: record.thief,
    wrecker: record.wrecker,
    carriedLantern: record.carriedLantern === true,
    thiefState,
    wreckerState,
    currentHoldingId,
    currentBuildingId,
    gapBlockerId,
    gapWaypoint,
    watchdogElapsed,
    watchdogAnchor,
    watchdogTrips,
    gnawTargetId,
    gnawing,
    edge,
    scripted: record.scripted,
    scriptedIgnoresTerrain: requireV2 && record.scriptedIgnoresTerrain === true,
    scriptedRoute,
    scriptedRouteIndex,
    position,
    velocity,
    leadVelocity,
    heading,
    scriptedTarget,
    spriteClip: stringInRange(record.spriteClip, 0, 64) ?? 'walk',
    spriteOrientation,
  };
}

function decodeGoldPickups(value: unknown, reasons: string[]): GoldPickupSuspendSnapshot[] | null {
  if (!Array.isArray(value)) {
    reasons.push('goldPickups must be an array');
    return null;
  }
  if (value.length > Balance.steal.pickupCap) reasons.push('goldPickups is too long');
  const output: GoldPickupSuspendSnapshot[] = [];
  const slots = new Set<number>();
  for (const [index, entry] of value.slice(0, Balance.steal.pickupCap).entries()) {
    const label = `goldPickups[${index}]`;
    const record = requiredRecord(entry, label, reasons);
    if (!record) continue;
    const slot = requiredInteger(record.slot, 0, Balance.steal.pickupCap - 1, `${label}.slot`, reasons);
    const amount = requiredNumber(record.amount, 0, MAX_ECONOMY_AMOUNT, `${label}.amount`, reasons);
    const age = requiredNumber(record.age, 0, MAX_TIME, `${label}.age`, reasons);
    const blockedCooldown = requiredNumber(record.blockedCooldown, 0, MAX_TIME, `${label}.blockedCooldown`, reasons);
    const position = decodeVector3(record.position, `${label}.position`, reasons);
    if (slot === null || amount === null || age === null || blockedCooldown === null || !position) continue;
    if (slots.has(slot)) reasons.push(`${label}.slot is duplicated`);
    slots.add(slot);
    output.push({ slot, amount, age, blockedCooldown, position });
  }
  return output;
}

function decodeCombat(value: unknown, reasons: string[]): CombatSuspendSnapshot | null {
  const record = requiredRecord(value, 'combat', reasons);
  if (!record) return null;
  const xp = requiredNumber(record.xp, 0, MAX_ECONOMY_AMOUNT, 'combat.xp', reasons);
  const audit = decodeCombatAudit(record.audit, reasons);
  if (!Array.isArray(record.shooters) || !Array.isArray(record.projectiles) || !Array.isArray(record.blastCharges) || !Array.isArray(record.xpMotes)) {
    reasons.push('combat transient fields must be arrays');
    return null;
  }
  const shooters: CombatSuspendSnapshot['shooters'] = [];
  const shooterKeys = new Set<string>();
  for (const [index, entry] of record.shooters.slice(0, 128).entries()) {
    const label = `combat.shooters[${index}]`;
    const saved = requiredRecord(entry, label, reasons);
    if (!saved) continue;
    const resumeKey = requiredString(saved.resumeKey, `${label}.resumeKey`, reasons, 128);
    const timer = requiredNumber(saved.timer, -MAX_TIME, MAX_TIME, `${label}.timer`, reasons);
    const targetId = requiredInteger(saved.targetId, -1, Balance.enemy.poolSize - 1, `${label}.targetId`, reasons);
    const missTargetId = requiredInteger(saved.missTargetId, -1, Balance.enemy.poolSize - 1, `${label}.missTargetId`, reasons);
    const misses = requiredInteger(saved.misses, 0, MAX_COUNT, `${label}.misses`, reasons);
    if (!resumeKey || timer === null || targetId === null || missTargetId === null || misses === null) continue;
    if (shooterKeys.has(resumeKey)) reasons.push(`${label}.resumeKey is duplicated`);
    shooterKeys.add(resumeKey);
    shooters.push({ resumeKey, timer, targetId, missTargetId, misses });
  }
  if (record.shooters.length > 128) reasons.push('combat.shooters is too long');
  const projectiles = decodeProjectiles(record.projectiles, reasons);
  const blastCharges = decodeBlastCharges(record.blastCharges, reasons);
  const xpMotes = decodeXpMotes(record.xpMotes, reasons);
  return xp === null || !audit || !projectiles || !blastCharges || !xpMotes
    ? null
    : { xp, audit, shooters, projectiles, blastCharges, xpMotes };
}

function decodeCombatAudit(value: unknown, reasons: string[]): CombatSuspendSnapshot['audit'] | null {
  const record = requiredRecord(value, 'combat.audit', reasons);
  if (!record) return null;
  const ownerKills = decodeNumberRecord(record.ownerKills, 'combat.audit.ownerKills', reasons);
  const ownerDamage = decodeNonnegativeNumberRecord(record.ownerDamage, 'combat.audit.ownerDamage', reasons);
  const boltHits = requiredInteger(record.boltHits, 0, MAX_COUNT, 'combat.audit.boltHits', reasons);
  const boltMisses = requiredInteger(record.boltMisses, 0, MAX_COUNT, 'combat.audit.boltMisses', reasons);
  const staleTargetSwitches = requiredInteger(
    record.staleTargetSwitches,
    0,
    MAX_COUNT,
    'combat.audit.staleTargetSwitches',
    reasons,
  );
  const shots = requiredRecord(record.shots, 'combat.audit.shots', reasons);
  const boltShots = shots ? requiredInteger(shots.bolt, 0, MAX_COUNT, 'combat.audit.shots.bolt', reasons) : null;
  const lobShots = shots ? requiredInteger(shots.lob, 0, MAX_COUNT, 'combat.audit.shots.lob', reasons) : null;
  const lastShotKind = record.lastShotKind === null || record.lastShotKind === 'bolt' || record.lastShotKind === 'lob'
    ? record.lastShotKind
    : undefined;
  if (lastShotKind === undefined) reasons.push('combat.audit.lastShotKind is invalid');
  const lastShotOwnerId = record.lastShotOwnerId === null
    ? null
    : requiredString(record.lastShotOwnerId, 'combat.audit.lastShotOwnerId', reasons, 128);
  const xpDeaths = requiredInteger(record.xpDeaths, 0, MAX_COUNT, 'combat.audit.xpDeaths', reasons);
  const xpMotesSpawned = requiredInteger(record.xpMotesSpawned, 0, MAX_COUNT, 'combat.audit.xpMotesSpawned', reasons);
  const xpMotesCollected = requiredInteger(record.xpMotesCollected, 0, MAX_COUNT, 'combat.audit.xpMotesCollected', reasons);
  const xpMotesCollectedValue = requiredNumber(
    record.xpMotesCollectedValue,
    0,
    MAX_ECONOMY_AMOUNT,
    'combat.audit.xpMotesCollectedValue',
    reasons,
  );
  const xpOverflowBanked = requiredInteger(record.xpOverflowBanked, 0, MAX_COUNT, 'combat.audit.xpOverflowBanked', reasons);
  const xpExpiredBanked = requiredInteger(record.xpExpiredBanked, 0, MAX_COUNT, 'combat.audit.xpExpiredBanked', reasons);
  const blastDetonationCount = requiredInteger(
    record.blastDetonationCount,
    0,
    MAX_COUNT,
    'combat.audit.blastDetonationCount',
    reasons,
  );
  const lastBlastDetonation = record.lastBlastDetonation === null
    ? null
    : decodeVector3(record.lastBlastDetonation, 'combat.audit.lastBlastDetonation', reasons);
  if (
    !ownerKills ||
    !ownerDamage ||
    boltHits === null ||
    boltMisses === null ||
    staleTargetSwitches === null ||
    boltShots === null ||
    lobShots === null ||
    lastShotKind === undefined ||
    (record.lastShotOwnerId !== null && lastShotOwnerId === null) ||
    xpDeaths === null ||
    xpMotesSpawned === null ||
    xpMotesCollected === null ||
    xpMotesCollectedValue === null ||
    xpOverflowBanked === null ||
    xpExpiredBanked === null ||
    blastDetonationCount === null ||
    (record.lastBlastDetonation !== null && !lastBlastDetonation)
  ) {
    return null;
  }
  return {
    ownerKills,
    ownerDamage,
    boltHits,
    boltMisses,
    staleTargetSwitches,
    shots: { bolt: boltShots, lob: lobShots },
    lastShotKind,
    lastShotOwnerId,
    xpDeaths,
    xpMotesSpawned,
    xpMotesCollected,
    xpMotesCollectedValue,
    xpOverflowBanked,
    xpExpiredBanked,
    blastDetonationCount,
    lastBlastDetonation,
  };
}

function validateShooterTopology(
  combat: CombatSuspendSnapshot,
  buildings: readonly BuildingSuspend[],
  reasons: string[],
): void {
  const saved = new Set(combat.shooters.map((shooter) => shooter.resumeKey));
  const buildingKeys = new Set(
    buildings
      .filter((building) => !building.wrecked && (building.id === 'sentry_beacon' || building.id === 'turret'))
      .map((building) => `building:${building.id}:${building.index}`),
  );
  for (const key of buildingKeys) if (!saved.has(key)) reasons.push(`combat.shooters is missing ${key}`);

  const heroSlots = new Map<number, Set<string>>();
  for (const key of saved) {
    if (key.startsWith('building:')) {
      if (!buildingKeys.has(key)) reasons.push(`combat.shooters contains unexpected ${key}`);
      continue;
    }
    const match = /^hero:(\d+):(rig|blast)$/.exec(key);
    if (!match) {
      reasons.push(`combat.shooters contains unknown ${key}`);
      continue;
    }
    const slot = Number(match[1]);
    const kinds = heroSlots.get(slot) ?? new Set<string>();
    kinds.add(match[2]);
    heroSlots.set(slot, kinds);
  }
  if (!heroSlots.has(0)) reasons.push('combat.shooters must include hero slot 0');
  for (const [slot, kinds] of heroSlots) {
    if (!kinds.has('rig') || !kinds.has('blast')) reasons.push(`combat.shooters hero slot ${slot} is incomplete`);
  }
}

function validateOwnerReferences(
  combat: CombatSuspendSnapshot,
  buildings: readonly BuildingSuspend[],
  enemies: EnemyPoolSuspendSnapshot,
  goldPickups: readonly GoldPickupSuspendSnapshot[],
  megaproject: MegaprojectSuspend | null | undefined,
  reasons: string[],
): void {
  const activeEnemySlots = new Set(enemies.active.map((enemy) => enemy.slot));
  const activeBuildings = new Set(
    buildings.filter((building) => !building.wrecked).map((building) => `${building.id}:${building.index}`),
  );
  const activeHoldings = new Set(goldPickups.map((pickup) => `pickup:${pickup.slot}`));
  for (const building of buildings) {
    if (!building.wrecked && building.id === 'stockpile') activeHoldings.add(`stockpile:${building.index}`);
  }
  if (megaproject?.targetActive) activeBuildings.add(`megaproject:${megaproject.id}`);
  for (const shooter of combat.shooters) {
    if (shooter.targetId >= 0 && !activeEnemySlots.has(shooter.targetId)) {
      reasons.push(`${shooter.resumeKey} targets an inactive enemy`);
    }
  }
  for (const enemy of enemies.active) {
    if (enemy.currentHoldingId && !activeHoldings.has(enemy.currentHoldingId)) {
      reasons.push(`enemy slot ${enemy.slot} references an inactive gold holding`);
    }
    if (enemy.currentBuildingId && !activeBuildings.has(enemy.currentBuildingId)) {
      reasons.push(`enemy slot ${enemy.slot} references an inactive building`);
    }
  }
}

function decodeProjectiles(value: unknown[], reasons: string[]): CombatSuspendSnapshot['projectiles'] | null {
  if (value.length > Balance.projectile.pool) reasons.push('combat.projectiles is too long');
  const output: CombatSuspendSnapshot['projectiles'] = [];
  const slots = new Set<number>();
  for (const [index, entry] of value.slice(0, Balance.projectile.pool).entries()) {
    const label = `combat.projectiles[${index}]`;
    const saved = requiredRecord(entry, label, reasons);
    if (!saved) continue;
    const slot = requiredInteger(saved.slot, 0, Balance.projectile.pool - 1, `${label}.slot`, reasons);
    const position = decodeVector3(saved.position, `${label}.position`, reasons);
    const velocity = decodeVector3(saved.velocity, `${label}.velocity`, reasons);
    const life = requiredNumber(saved.life, 0, MAX_TIME, `${label}.life`, reasons);
    const damage = requiredNumber(saved.damage, 0, MAX_ECONOMY_AMOUNT, `${label}.damage`, reasons);
    const ownerId = requiredString(saved.ownerId, `${label}.ownerId`, reasons, 128);
    const shooterKey = requiredString(saved.shooterKey, `${label}.shooterKey`, reasons, 128);
    const targetId = requiredInteger(saved.targetId, -1, Balance.enemy.poolSize - 1, `${label}.targetId`, reasons);
    const visualStartY = requiredNumber(saved.visualStartY, -MAX_COORD, MAX_COORD, `${label}.visualStartY`, reasons);
    const visualEndY = requiredNumber(saved.visualEndY, -MAX_COORD, MAX_COORD, `${label}.visualEndY`, reasons);
    const visualDistance = requiredNumber(saved.visualDistance, 0, MAX_COORD, `${label}.visualDistance`, reasons);
    const visualTravel = requiredNumber(saved.visualTravel, 0, MAX_COORD, `${label}.visualTravel`, reasons);
    if (
      slot === null ||
      !position ||
      !velocity ||
      life === null ||
      damage === null ||
      !ownerId ||
      !shooterKey ||
      targetId === null ||
      visualStartY === null ||
      visualEndY === null ||
      visualDistance === null ||
      visualTravel === null
    ) {
      continue;
    }
    if (slots.has(slot)) reasons.push(`${label}.slot is duplicated`);
    slots.add(slot);
    output.push({ slot, position, velocity, life, damage, ownerId, shooterKey, targetId, visualStartY, visualEndY, visualDistance, visualTravel });
  }
  return output;
}

function decodeBlastCharges(value: unknown[], reasons: string[]): CombatSuspendSnapshot['blastCharges'] | null {
  if (value.length > Balance.blast.pool) reasons.push('combat.blastCharges is too long');
  const output: CombatSuspendSnapshot['blastCharges'] = [];
  const slots = new Set<number>();
  for (const [index, entry] of value.slice(0, Balance.blast.pool).entries()) {
    const label = `combat.blastCharges[${index}]`;
    const saved = requiredRecord(entry, label, reasons);
    if (!saved) continue;
    const slot = requiredInteger(saved.slot, 0, Balance.blast.pool - 1, `${label}.slot`, reasons);
    const origin = decodeVector3(saved.origin, `${label}.origin`, reasons);
    const target = decodeVector3(saved.target, `${label}.target`, reasons);
    const age = requiredNumber(saved.age, 0, MAX_TIME, `${label}.age`, reasons);
    const duration = requiredNumber(saved.duration, 0, MAX_TIME, `${label}.duration`, reasons);
    const damage = requiredNumber(saved.damage, 0, MAX_ECONOMY_AMOUNT, `${label}.damage`, reasons);
    const radius = requiredNumber(saved.radius, 0, MAX_COORD, `${label}.radius`, reasons);
    const ownerId = requiredString(saved.ownerId, `${label}.ownerId`, reasons, 128);
    const apexY = requiredNumber(saved.apexY, -MAX_COORD, MAX_COORD, `${label}.apexY`, reasons);
    if (slot === null || !origin || !target || age === null || duration === null || damage === null || radius === null || !ownerId || apexY === null) continue;
    if (slots.has(slot)) reasons.push(`${label}.slot is duplicated`);
    slots.add(slot);
    output.push({ slot, origin, target, age, duration, damage, radius, ownerId, apexY });
  }
  return output;
}

function decodeXpMotes(value: unknown[], reasons: string[]): CombatSuspendSnapshot['xpMotes'] | null {
  if (value.length > Balance.xp.motePool) reasons.push('combat.xpMotes is too long');
  const output: CombatSuspendSnapshot['xpMotes'] = [];
  const slots = new Set<number>();
  for (const [index, entry] of value.slice(0, Balance.xp.motePool).entries()) {
    const label = `combat.xpMotes[${index}]`;
    const saved = requiredRecord(entry, label, reasons);
    if (!saved) continue;
    const slot = requiredInteger(saved.slot, 0, Balance.xp.motePool - 1, `${label}.slot`, reasons);
    const position = decodeVector3(saved.position, `${label}.position`, reasons);
    const xp = requiredNumber(saved.value, 0, MAX_ECONOMY_AMOUNT, `${label}.value`, reasons);
    const age = requiredNumber(saved.age, 0, MAX_TIME, `${label}.age`, reasons);
    if (slot === null || !position || xp === null || age === null) continue;
    if (slots.has(slot)) reasons.push(`${label}.slot is duplicated`);
    slots.add(slot);
    output.push({ slot, position, value: xp, age });
  }
  return output;
}

function decodeHarvest(value: unknown, reasons: string[]): HarvestSuspend | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, 'harvest', reasons);
  if (!record) return undefined;
  if (!Array.isArray(record.nodes)) {
    reasons.push('harvest.nodes must be an array');
    return undefined;
  }
  if (record.nodes.length > 64) reasons.push('harvest.nodes is too long');
  const nodes: HarvestSuspend['nodes'] = [];
  const ids = new Set<string>();
  for (const [index, entry] of record.nodes.slice(0, 64).entries()) {
    const label = `harvest.nodes[${index}]`;
    const node = requiredRecord(entry, label, reasons);
    if (!node) continue;
    const id = requiredString(node.id, `${label}.id`, reasons, 96);
    const anchorIndex = requiredInteger(node.anchorIndex, -1, 63, `${label}.anchorIndex`, reasons);
    const position = decodeVector2(node.position, `${label}.position`, reasons);
    const remaining = requiredNumber(node.remaining, 0, MAX_ECONOMY_AMOUNT, `${label}.remaining`, reasons);
    const respawnIn = requiredNumber(node.respawnIn, 0, MAX_TIME, `${label}.respawnIn`, reasons);
    if (typeof node.respawnScheduled !== 'boolean') reasons.push(`${label}.respawnScheduled must be boolean`);
    if (!id || anchorIndex === null || !position || remaining === null || respawnIn === null || typeof node.active !== 'boolean' || typeof node.respawnScheduled !== 'boolean') {
      if (typeof node.active !== 'boolean') reasons.push(`${label}.active must be boolean`);
      continue;
    }
    if (node.active && node.respawnScheduled) reasons.push(`${label} active nodes cannot have a scheduled respawn`);
    if (!node.respawnScheduled && respawnIn !== 0) reasons.push(`${label} unscheduled nodes must have respawnIn 0`);
    if (ids.has(id)) reasons.push(`${label}.id is duplicated`);
    ids.add(id);
    nodes.push({ id, active: node.active, anchorIndex, position, remaining, respawnScheduled: node.respawnScheduled, respawnIn });
  }
  const channelNodeId = record.channelNodeId === null ? null : stringInRange(record.channelNodeId, 1, 96);
  if (record.channelNodeId !== null && channelNodeId === null) reasons.push('harvest.channelNodeId must be a string or null');
  const progress = requiredNumber(record.progress, 0, 1, 'harvest.progress', reasons);
  if (typeof record.panCapBlocked !== 'boolean') reasons.push('harvest.panCapBlocked must be boolean');
  const channelNode = channelNodeId ? nodes.find((node) => node.id === channelNodeId) : null;
  if (channelNodeId && !channelNode?.active) reasons.push('harvest.channelNodeId must identify an active node');
  if (channelNodeId === null && progress !== null && progress !== 0) {
    reasons.push('harvest.progress must be 0 without an active channel node');
  }
  if (progress === null || typeof record.panCapBlocked !== 'boolean' || (record.channelNodeId !== null && channelNodeId === null)) return undefined;
  let channels: HarvestSuspend['channels'];
  if (record.channels !== undefined) {
    if (!Array.isArray(record.channels) || record.channels.length < 2 || record.channels.length > 4) {
      reasons.push('harvest.channels must contain 2 to 4 channels');
    } else {
      const actorIds = new Set<string>();
      const activeNodeIds = new Set<string>();
      channels = [];
      for (const [index, entry] of record.channels.entries()) {
        const label = `harvest.channels[${index}]`;
        const channel = requiredRecord(entry, label, reasons);
        if (!channel) continue;
        const actorId = requiredString(channel.actorId, `${label}.actorId`, reasons, 96);
        const savedNodeId = channel.channelNodeId === null ? null : stringInRange(channel.channelNodeId, 1, 96);
        const savedProgress = requiredNumber(channel.progress, 0, 1, `${label}.progress`, reasons);
        if (channel.channelNodeId !== null && savedNodeId === null) reasons.push(`${label}.channelNodeId must be a string or null`);
        if (typeof channel.panCapBlocked !== 'boolean') reasons.push(`${label}.panCapBlocked must be boolean`);
        if (typeof channel.channeling !== 'boolean') reasons.push(`${label}.channeling must be boolean`);
        if (!actorId || savedProgress === null || typeof channel.panCapBlocked !== 'boolean' || typeof channel.channeling !== 'boolean') continue;
        if (actorIds.has(actorId)) reasons.push(`${label}.actorId is duplicated`);
        const savedNode = savedNodeId ? nodes.find((node) => node.id === savedNodeId) : null;
        if (savedNodeId && !savedNode?.active) reasons.push(`${label}.channelNodeId must identify an active node`);
        if (savedNodeId === null && savedProgress !== 0) reasons.push(`${label}.progress must be 0 without a channel node`);
        if (channel.channeling && (!savedNodeId || activeNodeIds.has(savedNodeId))) reasons.push(`${label} cannot share an active seam`);
        actorIds.add(actorId);
        if (channel.channeling && savedNodeId) activeNodeIds.add(savedNodeId);
        channels.push({ actorId, channelNodeId: savedNodeId, progress: savedProgress, panCapBlocked: channel.panCapBlocked, channeling: channel.channeling });
      }
      const primary = channels.find((channel) => channel.actorId === '0');
      if (!primary || primary.channelNodeId !== channelNodeId || primary.progress !== progress || primary.panCapBlocked !== record.panCapBlocked) {
        reasons.push('harvest.channels actor 0 must match the legacy channel fields');
      }
    }
  }
  return { nodes, channelNodeId, progress, panCapBlocked: record.panCapBlocked, ...(channels ? { channels } : {}) };
}

function decodeBaron(value: unknown, reasons: string[]): BaronSuspend | null {
  const record = requiredRecord(value, 'baron', reasons);
  if (!record) return null;
  if (typeof record.beaten !== 'boolean') reasons.push('baron.beaten must be boolean');
  let ceremony: BaronSuspend['ceremony'] = null;
  if (record.ceremony !== null) {
    const saved = requiredRecord(record.ceremony, 'baron.ceremony', reasons);
    const atSim = saved ? requiredNumber(saved.atSim, 0, MAX_TIME, 'baron.ceremony.atSim', reasons) : null;
    const elapsedSeconds = saved ? requiredNumber(saved.elapsedSeconds, 0, MAX_TIME, 'baron.ceremony.elapsedSeconds', reasons) : null;
    if (atSim !== null && elapsedSeconds !== null) ceremony = { atSim, elapsedSeconds };
  }
  const standard = requiredRecord(record.standard, 'baron.standard', reasons);
  const standardPosition = standard ? decodeVector2(standard.position, 'baron.standard.position', reasons) : null;
  const dropElapsed = standard ? requiredNumber(standard.dropElapsed, 0, MAX_TIME, 'baron.standard.dropElapsed', reasons) : null;
  if (standard && typeof standard.planted !== 'boolean') reasons.push('baron.standard.planted must be boolean');
  const rocket = requiredRecord(record.rocket, 'baron.rocket', reasons);
  const nextVolleyIn = rocket ? requiredNumber(rocket.nextVolleyIn, 0, MAX_TIME, 'baron.rocket.nextVolleyIn', reasons) : null;
  const telegraphElapsed = rocket?.telegraphElapsed === null ? null : rocket ? requiredNumber(rocket.telegraphElapsed, 0, MAX_TIME, 'baron.rocket.telegraphElapsed', reasons) : null;
  const volleys = rocket ? requiredInteger(rocket.volleys, 0, MAX_COUNT, 'baron.rocket.volleys', reasons) : null;
  const targetKind = rocket?.targetKind === null || rocket?.targetKind === 'hero' || rocket?.targetKind === 'building' ? rocket.targetKind : null;
  if (rocket && rocket.targetKind !== null && targetKind === null) reasons.push('baron.rocket.targetKind is invalid');
  const target = rocket ? decodeVector3(rocket.target, 'baron.rocket.target', reasons) : null;
  if (
    typeof record.beaten !== 'boolean' ||
    !standard ||
    !standardPosition ||
    dropElapsed === null ||
    typeof standard.planted !== 'boolean' ||
    !rocket ||
    nextVolleyIn === null ||
    volleys === null ||
    !target
  ) {
    return null;
  }
  return {
    beaten: record.beaten,
    ceremony,
    standard: { planted: standard.planted, position: standardPosition, dropElapsed },
    rocket: { nextVolleyIn, telegraphElapsed, volleys, targetKind, target },
  };
}

function emptyBaron(): BaronSuspend {
  return {
    beaten: false,
    ceremony: null,
    standard: { planted: false, position: { x: 0, z: 0 }, dropElapsed: 0 },
    rocket: { nextVolleyIn: 0, telegraphElapsed: null, volleys: 0, targetKind: null, target: { x: 0, y: 0, z: 0 } },
  };
}

function decodeMegaproject(value: unknown, reasons: string[]): MegaprojectSuspend | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, 'megaproject', reasons);
  if (!record) return undefined;
  const id = requiredString(record.id, 'megaproject.id', reasons, 128);
  const project = requiredRecord(record.project, 'megaproject.project', reasons);
  if (!project) return undefined;
  const stage = requiredInteger(project.stage, 0, MAX_COUNT, 'megaproject.project.stage', reasons);
  const ticksRemaining = requiredInteger(project.ticksRemaining, 0, MAX_COUNT, 'megaproject.project.ticksRemaining', reasons);
  const hp = requiredNumber(project.hp, 0, MAX_ECONOMY_AMOUNT, 'megaproject.project.hp', reasons);
  const delayTicks = requiredInteger(project.delayTicks, 0, MAX_COUNT, 'megaproject.project.delayTicks', reasons);
  const defenseWave = requiredInteger(project.defenseWave, 0, MAX_COUNT, 'megaproject.project.defenseWave', reasons);
  if (typeof project.funded !== 'boolean') reasons.push('megaproject.project.funded must be boolean');
  if (typeof record.targetActive !== 'boolean') reasons.push('megaproject.targetActive must be boolean');
  if (record.targetActive === true && (project.funded !== true || hp === 0)) {
    reasons.push('megaproject.targetActive requires a funded project with HP');
  }
  if (!id || stage === null || ticksRemaining === null || hp === null || delayTicks === null || defenseWave === null || typeof project.funded !== 'boolean' || typeof record.targetActive !== 'boolean') {
    return undefined;
  }
  return { id, targetActive: record.targetActive, project: { stage, funded: project.funded, ticksRemaining, hp, delayTicks, defenseWave } };
}

function decodeControls(value: unknown, reasons: string[]): ControlsSuspend | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, 'controls', reasons);
  if (!record) return undefined;
  const runState = record.runState === 'playing' || record.runState === 'levelup' || record.runState === 'dead' ? record.runState : null;
  if (!runState) reasons.push('controls.runState is invalid');
  if (typeof record.paused !== 'boolean') reasons.push('controls.paused must be boolean');
  if (typeof record.playerPauseActive !== 'boolean') reasons.push('controls.playerPauseActive must be boolean');
  if (typeof record.territoryRingPresent !== 'boolean') reasons.push('controls.territoryRingPresent must be boolean');
  const charm = requiredRecord(record.charm, 'controls.charm', reasons);
  const remaining = charm ? requiredNumber(charm.remaining, 0, MAX_TIME, 'controls.charm.remaining', reasons) : null;
  const cooldown = charm ? requiredNumber(charm.cooldown, 0, MAX_TIME, 'controls.charm.cooldown', reasons) : null;
  if (charm && typeof charm.active !== 'boolean') reasons.push('controls.charm.active must be boolean');
  const blastAim = requiredRecord(record.blastAim, 'controls.blastAim', reasons);
  const pointer = blastAim ? decodeVector2(blastAim.pointer, 'controls.blastAim.pointer', reasons) : null;
  const target = blastAim ? decodeVector2(blastAim.target, 'controls.blastAim.target', reasons) : null;
  if (blastAim && typeof blastAim.ready !== 'boolean') reasons.push('controls.blastAim.ready must be boolean');
  const latches = requiredRecord(record.latches, 'controls.latches', reasons);
  const latchNames = ['pause', 'restart', 'build', 'cancel', 'confirm', 'upgrade', 'rotate', 'weaponToggle', 'debugSpawn', 'debugXp'] as const;
  if (latches && latchNames.some((name) => typeof latches[name] !== 'boolean')) reasons.push('controls.latches must contain booleans');
  if (record.paused === true && runState !== 'playing') reasons.push('controls.paused is only valid while playing');
  if (record.playerPauseActive === true && record.paused !== true) reasons.push('controls.playerPauseActive requires pause');
  if (charm?.active === true && (record.paused !== true || (remaining ?? 0) <= 0)) reasons.push('controls active charm pause is inconsistent');
  if (
    !runState ||
    typeof record.paused !== 'boolean' ||
    typeof record.playerPauseActive !== 'boolean' ||
    typeof record.territoryRingPresent !== 'boolean' ||
    !charm ||
    remaining === null ||
    cooldown === null ||
    typeof charm.active !== 'boolean' ||
    !blastAim ||
    !pointer ||
    !target ||
    typeof blastAim.ready !== 'boolean' ||
    !latches ||
    latchNames.some((name) => typeof latches[name] !== 'boolean')
  ) {
    return undefined;
  }
  return {
    runState,
    paused: record.paused,
    playerPauseActive: record.playerPauseActive,
    territoryRingPresent: record.territoryRingPresent,
    charm: { active: charm.active, remaining, cooldown },
    blastAim: { ready: blastAim.ready, pointer, target },
    latches: Object.fromEntries(latchNames.map((name) => [name, latches[name]])) as ControlsSuspend['latches'],
  };
}

function decodeAgent(value: unknown, reasons: string[]): AgentSuspend | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, 'agent', reasons);
  if (!record) return undefined;
  const consentRecord = requiredRecord(record.consent, 'agent.consent', reasons);
  const rungs = consentRecord ? requiredRecord(consentRecord.rungs, 'agent.consent.rungs', reasons) : null;
  const abilities = consentRecord ? requiredRecord(consentRecord.abilities, 'agent.consent.abilities', reasons) : null;
  const rungValues = rungs ? [rungs[0], rungs[1], rungs[2], rungs[3]] : [];
  const abilityValues = abilities ? [abilities.auto_collect, abilities.auto_repair, abilities.auto_pan] : [];
  if (rungValues.length !== 4 || !rungValues.every((entry) => typeof entry === 'boolean')) {
    reasons.push('agent.consent.rungs must contain four booleans');
  }
  if (abilityValues.length !== 3 || !abilityValues.every((entry) => typeof entry === 'boolean')) {
    reasons.push('agent.consent.abilities must contain three booleans');
  }

  const prospectorRecord = requiredRecord(record.prospector, 'agent.prospector', reasons);
  const position = prospectorRecord ? decodeVector2(prospectorRecord.position, 'agent.prospector.position', reasons) : null;
  const target = prospectorRecord ? decodeVector2(prospectorRecord.target, 'agent.prospector.target', reasons) : null;
  const workRemaining = prospectorRecord
    ? requiredNumber(prospectorRecord.workRemaining, 0, MAX_TIME, 'agent.prospector.workRemaining', reasons)
    : null;
  const nextWorkSeconds = prospectorRecord
    ? requiredNumber(prospectorRecord.nextWorkSeconds, 0, MAX_TIME, 'agent.prospector.nextWorkSeconds', reasons)
    : null;
  const nextSurveyIn = prospectorRecord
    ? requiredNumber(prospectorRecord.nextSurveyIn, 0, MAX_TIME, 'agent.prospector.nextSurveyIn', reasons)
    : null;
  const receiptCount = prospectorRecord
    ? requiredInteger(prospectorRecord.receiptCount, 0, MAX_COUNT, 'agent.prospector.receiptCount', reasons)
    : null;
  if (prospectorRecord && typeof prospectorRecord.visible !== 'boolean') reasons.push('agent.prospector.visible must be boolean');
  if (prospectorRecord && typeof prospectorRecord.moving !== 'boolean') reasons.push('agent.prospector.moving must be boolean');
  if (prospectorRecord?.moving === true && (workRemaining ?? 0) > 0) reasons.push('agent.prospector cannot move and work together');

  const sweeps = requiredRecord(record.sweeps, 'agent.sweeps', reasons);
  const xpIn = sweeps ? requiredNumber(sweeps.xpIn, 0, MAX_TIME, 'agent.sweeps.xpIn', reasons) : null;
  const goldIn = sweeps ? requiredNumber(sweeps.goldIn, 0, MAX_TIME, 'agent.sweeps.goldIn', reasons) : null;
  const repairIn = sweeps ? requiredNumber(sweeps.repairIn, 0, MAX_TIME, 'agent.sweeps.repairIn', reasons) : null;
  const repairDwellElapsed =
    sweeps?.repairDwellElapsed === null
      ? null
      : sweeps
        ? requiredNumber(sweeps.repairDwellElapsed, 0, MAX_TIME, 'agent.sweeps.repairDwellElapsed', reasons)
        : undefined;
  let repairTarget: AgentSuspend['sweeps']['repairTarget'] = null;
  if (sweeps?.repairTarget !== null) {
    const targetRecord = sweeps ? requiredRecord(sweeps.repairTarget, 'agent.sweeps.repairTarget', reasons) : null;
    const id = targetRecord && buildableIds.includes(targetRecord.id as BuildableId) ? (targetRecord.id as BuildableId) : null;
    const def = id ? buildableDefs.find((entry) => entry.id === id) : null;
    const index = targetRecord
      ? requiredInteger(targetRecord.index, 0, Math.max(0, (def?.maxCount ?? 1) - 1), 'agent.sweeps.repairTarget.index', reasons)
      : null;
    if (!id) reasons.push('agent.sweeps.repairTarget.id is unknown');
    if (id && index !== null) repairTarget = { id, index };
  }
  if (repairDwellElapsed !== null && repairDwellElapsed !== undefined && !repairTarget) {
    reasons.push('agent.sweeps.repairDwellElapsed requires a repair target');
  }

  if (
    !rungs ||
    !abilities ||
    rungValues.some((entry) => typeof entry !== 'boolean') ||
    abilityValues.some((entry) => typeof entry !== 'boolean') ||
    !prospectorRecord ||
    !position ||
    !target ||
    workRemaining === null ||
    nextWorkSeconds === null ||
    nextSurveyIn === null ||
    receiptCount === null ||
    typeof prospectorRecord.visible !== 'boolean' ||
    typeof prospectorRecord.moving !== 'boolean' ||
    !sweeps ||
    xpIn === null ||
    goldIn === null ||
    repairIn === null ||
    repairDwellElapsed === undefined
  ) {
    return undefined;
  }

  return {
    consent: {
      rungs: { 0: rungs[0] as boolean, 1: rungs[1] as boolean, 2: rungs[2] as boolean, 3: rungs[3] as boolean },
      abilities: {
        auto_collect: abilities.auto_collect as boolean,
        auto_repair: abilities.auto_repair as boolean,
        auto_pan: abilities.auto_pan as boolean,
        light_duty: abilities.light_duty === true,
      },
    },
    prospector: {
      visible: prospectorRecord.visible,
      position,
      target,
      moving: prospectorRecord.moving,
      workRemaining,
      nextWorkSeconds,
      nextSurveyIn,
      receiptCount,
    },
    sweeps: { xpIn, goldIn, repairIn, repairTarget, repairDwellElapsed },
  };
}

function decodeRunManager(value: unknown, reasons: string[]): RunManagerSuspendState | null {
  const record = requiredRecord(value, 'runManager', reasons);
  if (!record) return null;
  if (typeof record.secured !== 'boolean') reasons.push('runManager.secured must be boolean');
  if (typeof record.rush !== 'boolean') reasons.push('runManager.rush must be boolean');
  if (record.rush === true && record.secured !== true) reasons.push('runManager.rush requires secured');
  const meta = decodeMetaProgress(record.meta, reasons);
  const payout = decodeMetaPayout(record.payout, reasons);
  if (record.secured === true && payout === null) reasons.push('runManager.secured requires payout');
  if (record.secured === false && payout !== null) reasons.push('runManager.payout requires secured');
  return typeof record.secured === 'boolean' && typeof record.rush === 'boolean' && meta && payout !== undefined
    ? { secured: record.secured, rush: record.rush, meta, payout }
    : null;
}

function decodeMetaPayout(value: unknown, reasons: string[]): MetaPayout | null | undefined {
  if (value === null) return null;
  const record = requiredRecord(value, 'runManager.payout', reasons);
  if (!record) return undefined;
  const territory = requiredNumber(record.territory, 0, MAX_COUNT, 'runManager.payout.territory', reasons);
  const science = requiredNumber(record.science, 0, MAX_COUNT, 'runManager.payout.science', reasons);
  const hero = requiredNumber(record.hero, 0, MAX_COUNT, 'runManager.payout.hero', reasons);
  const agent = requiredNumber(record.agent, 0, MAX_COUNT, 'runManager.payout.agent', reasons);
  return territory === null || science === null || hero === null || agent === null
    ? undefined
    : { territory, science, hero, agent };
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

function decodeResearchState(value: unknown, reasons: string[], requireCanonical: boolean): ResearchState | null {
  const record = requiredRecord(value, 'research', reasons);
  if (!record) return null;
  const progress = decodeMetaProgress(record.progress, reasons);
  const taken = decodeStringArray(record.taken, 'research.taken', reasons, 256, 128);
  const proposalSalt = requiredInteger(record.proposalSalt, 0, MAX_COUNT, 'research.proposalSalt', reasons);
  const pinnedTarget = record.pinnedTarget === null ? null : stringInRange(record.pinnedTarget, 1, 128);
  if (record.pinnedTarget !== null && pinnedTarget === null) reasons.push('research.pinnedTarget must be a string or null');
  if (!progress || taken === undefined || taken === null || proposalSalt === null || (record.pinnedTarget !== null && pinnedTarget === null)) return null;
  // Post-077 states carry per-epoch identity + unlock flags; decode them IN THE CANONICAL KEY
  // ORDER migrateResearchState emits (version, epochId, metaScienceCursor, progress, taken,
  // proposalSalt, pinnedTarget, unlocks) or the string compare below rejects every capture.
  const epochId = stringInRange(record.epochId, 1, 64);
  if (!epochId && record.epochId !== undefined && record.epochId !== null) reasons.push('research.epochId must be a string');
  const rawCursor = record.metaScienceCursor;
  const metaScienceCursor =
    typeof rawCursor === 'number' && Number.isFinite(rawCursor) && rawCursor >= 0 ? Math.floor(rawCursor) : null;
  if (metaScienceCursor === null && rawCursor !== undefined && rawCursor !== null) {
    reasons.push('research.metaScienceCursor must be a finite non-negative number');
  }
  const unlocks = isRecord(record.unlocks) ? (record.unlocks as ResearchState['unlocks']) : undefined;
  if (record.unlocks !== undefined && unlocks === undefined) reasons.push('research.unlocks must be an object');
  const decoded: ResearchState = {
    version: 1,
    ...(epochId ? { epochId } : {}),
    ...(metaScienceCursor !== null ? { metaScienceCursor } : {}),
    progress,
    taken,
    proposalSalt,
    pinnedTarget,
    ...(unlocks !== undefined ? { unlocks } : {}),
  };
  const normalized = normalizeResearchState(decoded);
  if (requireCanonical && JSON.stringify(decoded) !== JSON.stringify(normalized)) reasons.push('research must already be canonical');
  return normalized;
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

function versionedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  label: string,
  reasons: string[],
  required: boolean,
): number | null {
  return required ? requiredNumber(value, min, max, label, reasons) : numberInRange(value, min, max) ?? fallback;
}

function versionedInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  label: string,
  reasons: string[],
  required: boolean,
): number | null {
  return required ? requiredInteger(value, min, max, label, reasons) : integerInRange(value, min, max) ?? fallback;
}

function versionedNullableString(value: unknown, label: string, reasons: string[], required: boolean): string | null | undefined {
  if (!required) return null;
  if (value === null) return null;
  const text = stringInRange(value, 1, 128);
  if (text) return text;
  reasons.push(`${label} must be a string or null`);
  return undefined;
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

function decodeNonnegativeNumberRecord(value: unknown, label: string, reasons: string[]): Record<string, number> | null {
  const record = requiredRecord(value, label, reasons);
  if (!record) return null;
  const output: Record<string, number> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (key.length > 96) {
      reasons.push(`${label} key is too long`);
      continue;
    }
    const number = requiredNumber(entry, 0, MAX_ECONOMY_AMOUNT, `${label}.${key}`, reasons);
    if (number !== null) output[key] = number;
  }
  return output;
}

function decodeResources(
  value: unknown,
  reasons: string[],
  requireV2: boolean,
): Record<string, { amount: number; cap: number }> | null {
  const before = reasons.length;
  if (!isRecord(value)) {
    if (!requireV2 && value === undefined) return {};
    reasons.push('economy.resources must be an object');
    return null;
  }
  const output: Record<string, { amount: number; cap: number }> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key !== 'gold' && key !== 'pressure') {
      reasons.push(`economy.resources.${key} is unknown`);
      continue;
    }
    const record = requiredRecord(entry, `economy.resources.${key}`, reasons);
    if (!record) continue;
    const amount = requiredNumber(record.amount, 0, MAX_ECONOMY_AMOUNT, `economy.resources.${key}.amount`, reasons);
    const cap = requiredNumber(record.cap, 0, MAX_ECONOMY_AMOUNT, `economy.resources.${key}.cap`, reasons);
    if (amount !== null && cap !== null) {
      if (key !== 'gold' && amount > cap) reasons.push(`economy.resources.${key}.amount cannot exceed cap`);
      output[key] = { amount, cap };
    }
  }
  if (requireV2 && (!output.gold || !output.pressure)) {
    reasons.push('economy.resources must contain gold and pressure');
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

function decodeVector3Array(value: unknown, label: string, reasons: string[], maxLength: number): Vec3Suspend[] | null {
  if (!Array.isArray(value)) {
    reasons.push(`${label} must be an array`);
    return null;
  }
  if (value.length > maxLength) reasons.push(`${label} is too long`);
  const output: Vec3Suspend[] = [];
  for (const [index, entry] of value.slice(0, maxLength).entries()) {
    const point = decodeVector3(entry, `${label}[${index}]`, reasons);
    if (point) output.push(point);
  }
  return output.length === value.slice(0, maxLength).length ? output : null;
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

function isThiefState(value: unknown): value is EnemySuspendSnapshot['thiefState'] {
  return value === 'none' || value === 'seekHolding' || value === 'grabbing' || value === 'fleeing';
}

function isWreckerState(value: unknown): value is EnemySuspendSnapshot['wreckerState'] {
  return value === 'none' || value === 'seekBuilding' || value === 'swinging';
}

function isSpriteOrientation(value: unknown): value is EnemySuspendSnapshot['spriteOrientation'] {
  return value === 's' || value === 'se' || value === 'e' || value === 'ne' || value === 'n' || value === 'nw' || value === 'w' || value === 'sw';
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
