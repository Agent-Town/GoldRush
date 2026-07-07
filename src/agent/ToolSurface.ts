import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { BuildableId } from '../game/buildables';
import {
  decideToolPermission,
  readAgentPermissionLevel,
  type AgentPermissionLevel,
  type MetaProgressAgentGate,
} from './PermissionLadder';
import type { AgentAbility } from './AgentConsent';

export type AgentVec2 = { x: number; z: number };
export type AgentBuildingRef = { id: string; index?: number };
export type AgentThiefRef = { id?: number; index?: number };
export type AgentCollectXpOptions = { minAgeS: number };
export type AgentCollectXpResult = {
  xp: number;
  motes: number;
  message: string;
  collector?: 'prospector';
  agentPath?: AgentVec2[];
  sweptIds?: string[];
};
export type AgentCollectGoldResult = {
  gold: number;
  pickups: number;
  message: string;
  collector?: 'prospector';
  agentPath?: AgentVec2[];
  sweptIds?: string[];
};

export type GoldRushToolName =
  | 'et.goldrush.get_state'
  | 'et.goldrush.pan_at'
  | 'et.goldrush.repair'
  | 'et.goldrush.chase_mark'
  | 'et.goldrush.collect_xp'
  | 'et.goldrush.collect_gold'
  | 'et.goldrush.place_building';

export type AgentCapability = {
  id: AgentAbility;
  level: AgentPermissionLevel;
  label: string;
  tools: readonly GoldRushToolName[];
};

export type ToolOutcome =
  | {
      ok: true;
      state?: unknown;
      economyLog: readonly unknown[];
      placed?: boolean;
      result?: unknown;
    }
  | {
      ok: false;
      reason: 'PERMISSION_DENIED' | 'NO_SYSTEM_API' | 'INVALID_ARGS' | 'FAILED';
      message?: string;
      level?: AgentPermissionLevel;
      requiredLevel?: AgentPermissionLevel;
      state?: unknown;
      economyLog: readonly unknown[];
    };

export type ToolReceipt<TName extends GoldRushToolName = GoldRushToolName, TArgs = unknown> = {
  tool: TName;
  args: TArgs;
  outcome: ToolOutcome;
  cost?: number;
};

export type AgentGameAdapter = {
  readonly metaProgress?: MetaProgressAgentGate;
  readonly diagnostics?: () => unknown;
  readonly economyLog?: () => readonly unknown[];
  readonly placeBuilding?: (def: BuildableId, pos: AgentVec2, rot?: number) => unknown;
  readonly panAt?: (node: string) => unknown;
  readonly repair?: (building: AgentBuildingRef) => unknown;
  readonly chaseMark?: (thief: AgentThiefRef) => unknown;
  readonly collectXp?: (options: AgentCollectXpOptions) => unknown;
  readonly collectGold?: () => unknown;
};

export type ToolSurfaceOptions = {
  readonly metaProgress?: MetaProgressAgentGate;
  readonly permissionLevel?: AgentPermissionLevel;
};

export type GoldRushToolSurface = {
  readonly namespace: 'et.goldrush';
  readonly permissionLevel: () => AgentPermissionLevel;
  readonly capabilities: readonly AgentCapability[];
  readonly tools: {
    get_state: () => ToolReceipt<'et.goldrush.get_state', Record<string, never>>;
    pan_at: (node: string) => ToolReceipt<'et.goldrush.pan_at', { node: string }>;
    repair: (building: AgentBuildingRef) => ToolReceipt<'et.goldrush.repair', { building: AgentBuildingRef }>;
    chase_mark: (thief: AgentThiefRef) => ToolReceipt<'et.goldrush.chase_mark', { thief: AgentThiefRef }>;
    collect_xp: () => ToolReceipt<'et.goldrush.collect_xp', AgentCollectXpOptions>;
    collect_gold: () => ToolReceipt<'et.goldrush.collect_gold', Record<string, never>>;
    place_building: (
      def: BuildableId,
      pos: AgentVec2,
      rot?: number,
    ) => ToolReceipt<'et.goldrush.place_building', { def: BuildableId; pos: AgentVec2; rot: number }>;
  };
};

type InternalGame = AgentGameAdapter & {
  readonly metaProgress?: MetaProgressAgentGate;
  readonly economy?: { readonly log?: readonly unknown[] };
  readonly buildSystem?: {
    selectBuildable?: (id: string, arm?: boolean) => boolean;
    rotateGhost?: () => boolean;
    confirm?: (at: number) => boolean;
    setBuildMode?: (on: boolean) => void;
    ghostRotationSteps?: number;
    pointerReady?: boolean;
    pointerClientX?: number;
    pointerClientY?: number;
  };
  readonly canvas?: HTMLCanvasElement;
  readonly camera?: THREE.Camera;
  readonly timeAlive?: number;
};

const EMPTY_ARGS: Record<string, never> = {};

export function createToolSurface(game: AgentGameAdapter, options: ToolSurfaceOptions = {}): GoldRushToolSurface {
  const permissionLevel = () => options.permissionLevel ?? readAgentPermissionLevel(options.metaProgress ?? readMeta(game));
  const capabilities = implementedCapabilities(game);

  const stateReceipt = (): ToolReceipt<'et.goldrush.get_state', Record<string, never>> =>
    makeReceipt('et.goldrush.get_state', EMPTY_ARGS, {
      ok: true,
      state: readState(game),
      economyLog: readEconomyLog(game),
    });

  return {
    namespace: 'et.goldrush',
    permissionLevel,
    capabilities,
    tools: {
      get_state: stateReceipt,
      pan_at: (node) =>
        runSideEffect(game, permissionLevel(), 'et.goldrush.pan_at', { node }, () => game.panAt?.(node)),
      repair: (building) =>
        runSideEffect(game, permissionLevel(), 'et.goldrush.repair', { building }, () => game.repair?.(building)),
      chase_mark: (thief) =>
        runSideEffect(game, permissionLevel(), 'et.goldrush.chase_mark', { thief }, () => game.chaseMark?.(thief)),
      collect_xp: () => {
        const args = { minAgeS: Balance.agent.xpMoteAgeS };
        return runSideEffect(game, permissionLevel(), 'et.goldrush.collect_xp', args, () => {
          const result = game.collectXp?.(args);
          if (result === undefined || result === false || isInvalid(result)) return result;
          return normalizeCollectXpResult(result);
        });
      },
      collect_gold: () =>
        runSideEffect(game, permissionLevel(), 'et.goldrush.collect_gold', EMPTY_ARGS, () => {
          const result = game.collectGold?.();
          if (result === undefined || result === false || isInvalid(result)) return result;
          return normalizeCollectGoldResult(result);
        }),
      place_building: (def, pos, rot = 0) =>
        runSideEffect(game, permissionLevel(), 'et.goldrush.place_building', { def, pos, rot }, () => {
          if (!validPos(pos)) return invalid('place_building requires finite x/z.');
          return game.placeBuilding?.(def, pos, rot) ?? placeBuildingThroughGame(game, def, pos, rot);
        }),
    },
  };
}

export function install(game: AgentGameAdapter, options: ToolSurfaceOptions = {}): GoldRushToolSurface {
  const surface = createToolSurface(game, options);
  (game as AgentGameAdapter & { agentTools?: GoldRushToolSurface }).agentTools = surface;
  return surface;
}

function runSideEffect<TName extends Exclude<GoldRushToolName, 'et.goldrush.get_state'>, TArgs>(
  game: AgentGameAdapter,
  level: AgentPermissionLevel,
  tool: TName,
  args: TArgs,
  call: () => unknown,
): ToolReceipt<TName, TArgs> {
  const permission = decideToolPermission(level, true);
  if (!permission.ok) {
    return makeReceipt(tool, args, {
      ok: false,
      reason: permission.reason,
      level: permission.level,
      requiredLevel: permission.requiredLevel,
      economyLog: readEconomyLog(game),
    });
  }

  const before = readEconomyLog(game);
  const result = call();
  if (isInvalid(result)) {
    return makeReceipt(tool, args, {
      ok: false,
      reason: 'INVALID_ARGS',
      message: result.message,
      economyLog: before,
    });
  }
  const after = readEconomyLog(game);
  if (result === undefined) {
    return makeReceipt(tool, args, {
      ok: false,
      reason: 'NO_SYSTEM_API',
      economyLog: after,
    });
  }
  if (result === false) {
    return makeReceipt(tool, args, {
      ok: false,
      reason: 'FAILED',
      economyLog: after,
    });
  }
  return makeReceipt(
    tool,
    args,
    {
      ok: true,
      result,
      placed: tool === 'et.goldrush.place_building' ? true : undefined,
      state: readState(game),
      economyLog: after,
    },
    costFromDelta(before, after),
  );
}

function placeBuildingThroughGame(game: AgentGameAdapter, def: BuildableId, pos: AgentVec2, rot: number): boolean | undefined {
  const internal = game as InternalGame;
  const build = internal.buildSystem;
  if (!build?.selectBuildable || !build.confirm) return undefined;
  if (!build.selectBuildable(def, true)) return false;

  const targetSteps = rotationSteps(rot);
  const currentSteps = Math.max(0, Math.floor(build.ghostRotationSteps ?? 0)) % 4;
  for (let i = 0; i < ((targetSteps - currentSteps + 4) % 4); i += 1) build.rotateGhost?.();

  pointBuildGhostAt(internal, pos);
  return build.confirm(internal.timeAlive ?? 0);
}

function pointBuildGhostAt(game: InternalGame, pos: AgentVec2): void {
  const build = game.buildSystem;
  if (!build) return;
  const canvas = game.canvas;
  const camera = game.camera;
  if (!canvas || !camera) return;

  const rect = canvas.getBoundingClientRect();
  const projected = new THREE.Vector3(pos.x, 0, pos.z).project(camera);
  build.pointerReady = true;
  build.pointerClientX = rect.left + ((projected.x + 1) / 2) * rect.width;
  build.pointerClientY = rect.top + ((1 - projected.y) / 2) * rect.height;
}

function rotationSteps(rot: number): number {
  if (!Number.isFinite(rot)) return 0;
  const raw = Number.isInteger(rot) ? rot : Math.round(rot / (Math.PI / 2));
  return ((raw % 4) + 4) % 4;
}

function validPos(pos: unknown): pos is AgentVec2 {
  return (
    typeof pos === 'object' &&
    pos !== null &&
    Number.isFinite((pos as { x?: unknown }).x) &&
    Number.isFinite((pos as { z?: unknown }).z)
  );
}

function normalizeCollectXpResult(value: unknown): AgentCollectXpResult | { invalid: true; message: string } {
  if (typeof value !== 'object' || value === null) return invalid('collect_xp requires a result object.');
  const raw = value as Partial<AgentCollectXpResult>;
  if (!Number.isFinite(raw.xp) || !Number.isInteger(raw.motes) || (raw.xp ?? 0) < 0 || (raw.motes ?? 0) < 0) {
    return invalid('collect_xp result requires non-negative xp and mote counts.');
  }
  const xp = raw.xp as number;
  const motes = raw.motes as number;
  return {
    ...raw,
    xp,
    motes,
    message: typeof raw.message === 'string' && raw.message.length > 0 ? raw.message : `Gathered ${xp} XP`,
  };
}

function normalizeCollectGoldResult(value: unknown): AgentCollectGoldResult | { invalid: true; message: string } {
  if (typeof value !== 'object' || value === null) return invalid('collect_gold requires a result object.');
  const raw = value as Partial<AgentCollectGoldResult>;
  if (!Number.isFinite(raw.gold) || !Number.isInteger(raw.pickups) || (raw.gold ?? 0) < 0 || (raw.pickups ?? 0) < 0) {
    return invalid('collect_gold result requires non-negative gold and pickup counts.');
  }
  const gold = raw.gold as number;
  const pickups = raw.pickups as number;
  return {
    ...raw,
    gold,
    pickups,
    message: typeof raw.message === 'string' && raw.message.length > 0 ? raw.message : `Gathered ${gold} gold`,
  };
}

function implementedCapabilities(game: AgentGameAdapter): readonly AgentCapability[] {
  const capabilities: AgentCapability[] = [];
  const collectTools: GoldRushToolName[] = [];
  if (typeof game.collectXp === 'function') collectTools.push('et.goldrush.collect_xp');
  if (typeof game.collectGold === 'function') collectTools.push('et.goldrush.collect_gold');
  if (collectTools.length > 0) {
    capabilities.push({
      id: 'auto_collect',
      level: 1,
      label:
        collectTools.length > 1
          ? 'Let the Prospector gather loose XP and dropped gold'
          : 'Let the Prospector gather loose XP',
      tools: collectTools,
    });
  }
  if (typeof game.repair === 'function') {
    capabilities.push({
      id: 'auto_repair',
      level: 1,
      label: 'Let the Prospector tend walls',
      tools: ['et.goldrush.repair'],
    });
  }
  if (typeof game.panAt === 'function') {
    capabilities.push({
      id: 'auto_pan',
      level: 3,
      label: 'Let the Prospector work claim pans',
      tools: ['et.goldrush.pan_at'],
    });
  }
  return capabilities;
}

function readMeta(game: AgentGameAdapter): MetaProgressAgentGate | undefined {
  return game.metaProgress ?? (game as InternalGame).metaProgress;
}

function readState(game: AgentGameAdapter): unknown {
  if (game.diagnostics) return clone(game.diagnostics());
  if (typeof window !== 'undefined') return clone(window.__THREE_GAME_DIAGNOSTICS__);
  const internal = game as InternalGame & { readonly buildSystem?: { readonly diagnostics?: unknown }; readonly economy?: { readonly state?: unknown } };
  return clone({
    economy: internal.economy?.state,
    build: internal.buildSystem?.diagnostics,
  });
}

function readEconomyLog(game: AgentGameAdapter): readonly unknown[] {
  if (game.economyLog) return cloneArray(game.economyLog());
  const internalLog = (game as InternalGame).economy?.log;
  if (internalLog) return cloneArray(internalLog);
  if (typeof window !== 'undefined') return cloneArray(window.__GR_TEST__?.economyLog() ?? []);
  return [];
}

function costFromDelta(before: readonly unknown[], after: readonly unknown[]): number | undefined {
  let cost = 0;
  for (const entry of after.slice(before.length)) {
    if (isSpend(entry)) cost += entry.amount;
  }
  return cost > 0 ? cost : undefined;
}

function isSpend(entry: unknown): entry is { type: 'gold_spent'; amount: number } {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    (entry as { type?: unknown }).type === 'gold_spent' &&
    typeof (entry as { amount?: unknown }).amount === 'number'
  );
}

function makeReceipt<TName extends GoldRushToolName, TArgs>(
  tool: TName,
  args: TArgs,
  outcome: ToolOutcome,
  cost?: number,
): ToolReceipt<TName, TArgs> {
  return { tool, args: clone(args), outcome, ...(cost === undefined ? {} : { cost }) };
}

function invalid(message: string): { invalid: true; message: string } {
  return { invalid: true, message };
}

function isInvalid(value: unknown): value is { invalid: true; message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { invalid?: unknown }).invalid === true &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

function cloneArray<T>(value: readonly T[]): T[] {
  return [...clone(value)];
}

function clone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}
