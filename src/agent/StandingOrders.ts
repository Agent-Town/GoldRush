import { Balance } from '../game/Balance';
import { isBuildableId, type BuildableId } from '../game/buildables';
import type { AgentAbility } from './AgentConsent';
import type { AgentPermissionLevel } from './PermissionLadder';
import type { AgentBuildingRef, AgentVec2, GoldRushToolSurface, ToolReceipt } from './ToolSurface';

export type BuildCondition = { goldGte: number } | { waveGte: number };

export type StandingOrder =
  | {
      verb: 'BUILD';
      what: BuildableId;
      where: AgentVec2;
      when: BuildCondition;
      rotationSteps?: 0 | 1 | 2 | 3;
    }
  | { verb: 'REPAIR_UNDER'; pct: number }
  | { verb: 'MOVE_TO'; pos: AgentVec2 }
  | { verb: 'HOLD'; pos: AgentVec2 }
  | { verb: 'BLAST_AT'; pos: AgentVec2 }
  | { verb: 'SET_WEAPON'; weapon: 'rig' | 'blast' }
  | { verb: 'HARVEST'; seam: string }
  | { verb: 'HARVEST'; sluice: number }
  | { verb: 'PICK_UPGRADE'; id: string }
  | { verb: 'SECURE_CHOICE'; choice: 'bank' | 'rush' }
  | { verb: 'CONTEXT_ACTION'; action: 'upgrade' | 'demolish'; target: { id: BuildableId; index: number } }
  | { verb: 'CONTEXT_ACTION'; action: 'fund' }
  // A6: recover the crashed probe standing in a `probeRecoveryZones` crater. Targetless for
  // the same reason `fund` is — the WORLD names the target, so the body's position is the
  // whole argument and there is nothing for a rider to mis-index.
  | { verb: 'CONTEXT_ACTION'; action: 'recover' }
  // A8 (door-completion-sheet §A8): plant the seed vault at the ground the Prospector stands on.
  // A targetless context action like `fund`, for the same reason — the world, not a registry
  // index, decides which stake is in reach, and the view already names the grounds.
  | { verb: 'CONTEXT_ACTION'; action: 'plant' }
  // A10 (door-completion-sheet §A10): decide the canal segment the Prospector stands at.
  // `redig` is the sheet's RE-DIG and `backfill` is its DEMOLISH — renamed on the wire only,
  // because `demolish` above already means "tear down that work" and one word cannot mean two
  // things (Mistake #14). Targetless like `fund`/`recover`/`plant`, for the same reason: the
  // world names the stake, so the body's position is the whole argument.
  | { verb: 'CONTEXT_ACTION'; action: 'redig' }
  | { verb: 'CONTEXT_ACTION'; action: 'backfill' }
  | { verb: 'CAPTURE' }
  | { verb: 'BOAT_BUILD'; padId: string; buildingId: string }
  | { verb: 'REANCHOR'; anchorId: string }
  | { verb: 'FALLBACK_IF'; threat: { enemiesGte: number }; pos: AgentVec2 };

export type StandingOrderStatus = 'pending' | 'active' | 'done' | 'failed';

export type StandingOrderRecord = {
  id: string;
  order: StandingOrder;
  status: StandingOrderStatus;
  reason?: string;
};

export type StandingOrderLogEvent = {
  seq: number;
  at: number;
  type: 'orders_replaced' | 'orders_rejected' | 'order_status' | 'surprise';
  orderId?: string;
  status?: StandingOrderStatus;
  reason?: string;
  surprise?: 'claim_damage' | 'order_failure' | 'hero_down' | 'wave_early';
  orders?: StandingOrderRecord[];
};

export type StandingOrdersView = {
  needsRider: boolean;
  orders: StandingOrderRecord[];
  log: StandingOrderLogEvent[];
};

export type StandingOrdersSubmission =
  | { ok: true; count: number }
  | {
      ok: false;
      reason: 'INVALID_ARGS' | 'PERMISSION_DENIED';
      message: string;
      requiredLevel?: AgentPermissionLevel;
    };

export type StandingOrderTickResult = {
  movement?: AgentVec2;
  receipt?: ToolReceipt;
  receiptPoint?: AgentVec2;
};

type RuntimeState = {
  timeAlive: number;
  runState: string;
  hp: number;
  maxHp: number;
  enemiesAlive: number;
  wave: number;
  nextWaveInSim: number;
  gold: number;
  claimHits: number;
  actorMoving: boolean;
  consent: null | {
    rungs: Record<string, { earned: boolean; granted: boolean }>;
    abilities: Record<string, { allowed: boolean }>;
  };
  buildings: Array<AgentBuildingRef & { hp: number; maxHp: number; wrecked: boolean; position: AgentVec2 }>;
  seams: Array<{ id: string; active: boolean; position: AgentVec2 }>;
  sluices: AgentVec2[];
  pendingOffer: string[];
  pendingSecure: boolean;
};

type ValidationResult = { ok: true; orders: StandingOrder[] } | { ok: false; message: string };
type BlastOrderResult = { ok: true } | { ok: false; reason: string };
export type ActionOrderResult = { ok: true } | { ok: false; reason: string };

export type FinalVerbHandlers = {
  setWeapon: (weapon: 'rig' | 'blast') => ActionOrderResult;
  secureChoice: (choice: 'bank' | 'rush') => ActionOrderResult;
  contextAction: (order: Extract<StandingOrder, { verb: 'CONTEXT_ACTION' }>) => ActionOrderResult;
  capture?: () => ActionOrderResult;
  boatBuild?: (padId: string, buildingId: string) => ActionOrderResult;
  reanchor?: (anchorId: string) => ActionOrderResult;
};

let installedExecutor: StandingOrdersExecutor | null = null;

export class StandingOrdersExecutor {
  private records: StandingOrderRecord[] = [];
  private readonly history: StandingOrderLogEvent[] = [];
  private needsRiderValue = false;
  private submission = 0;
  private sequence = 0;
  private previousState: RuntimeState | null = null;
  private expectedWaveAt: number | null = null;
  private readonly failureReasons = new Map<string, string>();
  private blastAt: ((pos: AgentVec2) => BlastOrderResult) | null = null;
  private pickUpgrade: ((id: string) => boolean) | null = null;
  private setWeapon: ((weapon: 'rig' | 'blast') => ActionOrderResult) | null = null;
  private secureChoice: ((choice: 'bank' | 'rush') => ActionOrderResult) | null = null;
  private contextAction: ((order: Extract<StandingOrder, { verb: 'CONTEXT_ACTION' }>) => ActionOrderResult) | null = null;
  private capture: (() => ActionOrderResult) | null = null;
  private boatBuild: ((padId: string, buildingId: string) => ActionOrderResult) | null = null;
  private reanchor: ((anchorId: string) => ActionOrderResult) | null = null;

  constructor(
    private readonly surface: GoldRushToolSurface,
    private readonly readState: () => unknown,
    private readonly readEconomyLog: () => readonly unknown[] = () => [],
  ) {}

  submit(input: unknown, at?: number): StandingOrdersSubmission {
    const state = this.state(at);
    const eventAt = at ?? state.timeAlive;
    const validated = validateStandingOrders(input);
    if (!validated.ok) {
      this.append({ at: eventAt, type: 'orders_rejected', reason: validated.message });
      return { ok: false, reason: 'INVALID_ARGS', message: validated.message };
    }

    const invalidPick = validated.orders.find(
      (order) => order.verb === 'PICK_UPGRADE' && !state.pendingOffer.includes(order.id),
    );
    if (invalidPick?.verb === 'PICK_UPGRADE') {
      const message = `PICK_UPGRADE requires a live offered id; "${invalidPick.id}" is not available.`;
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      return { ok: false, reason: 'INVALID_ARGS', message };
    }
    if (state.pendingSecure && (validated.orders.length !== 1 || validated.orders[0]?.verb !== 'SECURE_CHOICE')) {
      const message = 'Only one SECURE_CHOICE is accepted while the secure window is open.';
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      return { ok: false, reason: 'INVALID_ARGS', message };
    }
    if (validated.orders.some((order) => order.verb === 'SECURE_CHOICE') && !state.pendingSecure) {
      const message = 'SECURE_CHOICE requires a live secure window.';
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      return { ok: false, reason: 'INVALID_ARGS', message };
    }

    const level = this.surface.permissionLevel();
    const blocked = validated.orders
      .map((order) => ({ order, denial: permissionDenial(order, state, level) }))
      .find((entry) => entry.denial);
    if (blocked) {
      this.append({ at: eventAt, type: 'orders_rejected', reason: blocked.denial! });
      return {
        ok: false,
        reason: 'PERMISSION_DENIED',
        message: blocked.denial!,
        requiredLevel: requiredLevel(blocked.order),
      };
    }

    this.submission += 1;
    this.records = validated.orders.map((order, index) => ({
      id: `orders-${this.submission}-${index + 1}`,
      order,
      status: 'pending',
    }));
    this.needsRiderValue = false;
    this.append({ at: eventAt, type: 'orders_replaced', orders: copyRecords(this.records) });
    return { ok: true, count: this.records.length };
  }

  tick(at: number, actor: AgentVec2): StandingOrderTickResult {
    const state = this.state(at, this.records.some((record) => record.status === 'pending' || record.status === 'active'));
    this.detectSurprises(state, at);

    for (const record of this.records) {
      if (record.status === 'done' || record.status === 'failed') continue;
      if (state.pendingSecure && record.order.verb !== 'SECURE_CHOICE') continue;
      const level = this.surface.permissionLevel();
      const denial = permissionDenial(record.order, state, level);
      if (denial) {
        this.fail(record, `PERMISSION_DENIED: ${denial}`, at);
        return {};
      }

      const result = this.execute(record, state, actor, at);
      if (result) return result;
    }
    return {};
  }

  observe(): void {
    const raw = this.readState();
    if (!isRecord(raw) || raw.runState !== 'dead' || this.previousState?.runState === 'dead') return;
    const state = runtimeState(raw);
    this.detectSurprises(state, state.timeAlive);
  }

  reset(): void {
    this.records = [];
    this.history.length = 0;
    this.needsRiderValue = false;
    this.submission = 0;
    this.sequence = 0;
    this.previousState = null;
    this.expectedWaveAt = null;
    this.failureReasons.clear();
  }

  setBlastAt(handler: (pos: AgentVec2) => BlastOrderResult): void {
    this.blastAt = handler;
  }

  bindUpgradePicker(pick: (id: string) => boolean): void {
    this.pickUpgrade = pick;
  }

  bindFinalVerbs(handlers: FinalVerbHandlers): void {
    this.setWeapon = handlers.setWeapon;
    this.secureChoice = handlers.secureChoice;
    this.contextAction = handlers.contextAction;
    this.capture = handlers.capture ?? null;
    this.boatBuild = handlers.boatBuild ?? null;
    this.reanchor = handlers.reanchor ?? null;
  }

  snapshot(): StandingOrdersView {
    return {
      needsRider: this.needsRiderValue,
      orders: copyRecords(this.records),
      log: this.history.map((event) => ({
        ...event,
        ...(event.orders ? { orders: copyRecords(event.orders) } : {}),
      })),
    };
  }

  private execute(
    record: StandingOrderRecord,
    state: RuntimeState,
    actor: AgentVec2,
    at: number,
  ): StandingOrderTickResult | null {
    const order = record.order;
    if (order.verb === 'BUILD') {
      if (!conditionMet(order.when, state)) return null;
      this.status(record, 'active', at);
      const receipt = this.surface.tools.place_building(order.what, order.where, order.rotationSteps ?? 0);
      return this.finishAction(record, receipt, order.where, at);
    }

    if (order.verb === 'REPAIR_UNDER') {
      const target = state.buildings.find(
        (building) => building.maxHp > 0 && (building.wrecked || (building.hp / building.maxHp) * 100 < order.pct),
      );
      if (!target) return null;
      this.status(record, 'active', at);
      if (distance(actor, target.position) > Balance.wreck.repairRadius) return { movement: target.position };
      const receipt = this.surface.tools.repair({ id: target.id, index: target.index });
      return this.finishAction(record, receipt, target.position, at);
    }

    if (order.verb === 'MOVE_TO') {
      if (distance(actor, order.pos) <= Balance.agent.arriveRadius) {
        this.status(record, 'done', at);
        return {};
      }
      this.status(record, 'active', at);
      return { movement: order.pos };
    }

    if (order.verb === 'HOLD') {
      this.status(record, 'active', at);
      return { movement: order.pos };
    }

    if (order.verb === 'BLAST_AT') {
      this.status(record, 'active', at);
      const result = this.blastAt?.(order.pos) ?? { ok: false as const, reason: 'BLAST_AT is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'SET_WEAPON') {
      this.status(record, 'active', at);
      const result = this.setWeapon?.(order.weapon) ?? { ok: false as const, reason: 'SET_WEAPON is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'HARVEST') {
      const point =
        'seam' in order
          ? state.seams.find((seam) => seam.id === order.seam && seam.active)?.position
          : state.sluices[order.sluice];
      if (!point) {
        this.fail(record, `INVALID_TARGET: ${'seam' in order ? order.seam : `sluice ${order.sluice}`} is unavailable.`, at);
        return {};
      }
      this.status(record, 'active', at);
      if (distance(actor, point) > Balance.agent.arriveRadius || state.actorMoving) return { movement: point };
      const receipt = this.surface.tools.pan_at('seam' in order ? order.seam : `sluice-${order.sluice + 1}`);
      return this.finishAction(record, receipt, point, at);
    }

    if (order.verb === 'PICK_UPGRADE') {
      this.status(record, 'active', at);
      if (!this.pickUpgrade?.(order.id)) this.fail(record, `INVALID_TARGET: ${order.id} is no longer offered.`, at);
      else this.status(record, 'done', at);
      return {};
    }

    if (order.verb === 'SECURE_CHOICE') {
      this.status(record, 'active', at);
      const result = this.secureChoice?.(order.choice) ?? { ok: false as const, reason: 'SECURE_CHOICE is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'CONTEXT_ACTION') {
      this.status(record, 'active', at);
      const result = this.contextAction?.(order) ?? { ok: false as const, reason: 'CONTEXT_ACTION is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'CAPTURE' || order.verb === 'BOAT_BUILD' || order.verb === 'REANCHOR') {
      this.status(record, 'active', at);
      const result = order.verb === 'CAPTURE'
        ? this.capture?.()
        : order.verb === 'BOAT_BUILD'
          ? this.boatBuild?.(order.padId, order.buildingId)
          : this.reanchor?.(order.anchorId);
      if (result?.ok) this.status(record, 'done', at);
      else this.fail(record, result?.reason ?? `${order.verb} is unavailable.`, at);
      return {};
    }

    if (state.enemiesAlive < order.threat.enemiesGte) return null;
    this.status(record, 'active', at);
    if (distance(actor, order.pos) <= Balance.agent.arriveRadius) {
      this.status(record, 'done', at);
      return {};
    }
    return { movement: order.pos };
  }

  private finishAction(
    record: StandingOrderRecord,
    receipt: ToolReceipt,
    point: AgentVec2,
    at: number,
  ): StandingOrderTickResult {
    if (receipt.outcome.ok) this.status(record, 'done', at);
    else {
      const detail = record.order.verb === 'BUILD' ? receipt.outcome.detail : undefined;
      this.fail(record, `${receipt.outcome.reason}${detail ? ` (${detail})` : ''}: ${record.order.verb} action was rejected.`, at);
    }
    return { receipt, receiptPoint: point };
  }

  private fail(record: StandingOrderRecord, reason: string, at: number): void {
    this.status(record, 'failed', at, reason);
    const order = standingOrderIdentity(record.order);
    if (this.failureReasons.get(order) === reason) return;
    this.failureReasons.set(order, reason);
    this.surprise('order_failure', at, record.id, reason);
  }

  private status(record: StandingOrderRecord, status: StandingOrderStatus, at: number, reason?: string): void {
    if (record.status === status && record.reason === reason) return;
    record.status = status;
    if (status === 'done') this.failureReasons.delete(standingOrderIdentity(record.order));
    if (reason) record.reason = reason;
    this.append({ at, type: 'order_status', orderId: record.id, status, ...(reason ? { reason } : {}) });
  }

  private detectSurprises(state: RuntimeState, at: number): void {
    const previous = this.previousState;
    if (previous) {
      if (state.claimHits > previous.claimHits) this.surprise('claim_damage', at);
      if ((state.hp <= 0 || state.runState === 'dead') && previous.hp > 0 && previous.runState !== 'dead') {
        this.surprise('hero_down', at);
      }
      if (state.wave > previous.wave && this.expectedWaveAt !== null && at + 0.2 < this.expectedWaveAt) {
        this.surprise('wave_early', at, undefined, `Wave ${state.wave} arrived before ${round2(this.expectedWaveAt)}s.`);
      }
    }
    if (!previous || state.wave !== previous.wave) this.expectedWaveAt = at + state.nextWaveInSim;
    this.previousState = state;
  }

  private surprise(
    surprise: StandingOrderLogEvent['surprise'],
    at: number,
    orderId?: string,
    reason?: string,
  ): void {
    this.needsRiderValue = true;
    this.append({
      at,
      type: 'surprise',
      surprise,
      ...(orderId ? { orderId } : {}),
      ...(reason ? { reason } : {}),
    });
  }

  private append(event: Omit<StandingOrderLogEvent, 'seq'>): void {
    this.history.push({ seq: ++this.sequence, ...event });
  }

  private state(at?: number, includeActions = false): RuntimeState {
    return runtimeState(this.readState(), at, includeActions, this.readEconomyLog());
  }
}

export function bindStandingOrders(executor: StandingOrdersExecutor): void {
  installedExecutor = executor;
}

export function bindStandingOrderBlast(handler: (pos: AgentVec2) => BlastOrderResult): void {
  installedExecutor?.setBlastAt(handler);
}

export function bindStandingUpgradePicker(pick: (id: string) => boolean): void {
  installedExecutor?.bindUpgradePicker(pick);
}

export function bindStandingOrderFinalVerbs(handlers: Parameters<StandingOrdersExecutor['bindFinalVerbs']>[0]): void {
  installedExecutor?.bindFinalVerbs(handlers);
}

export function tickStandingOrders(at: number, actor: AgentVec2): StandingOrderTickResult {
  return installedExecutor?.tick(at, actor) ?? {};
}

export function observeStandingOrders(): void {
  installedExecutor?.observe();
}

export function snapshotStandingOrders(): StandingOrdersView {
  return installedExecutor?.snapshot() ?? { needsRider: false, orders: [], log: [] };
}

export function resetStandingOrders(): void {
  installedExecutor?.reset();
}

export function validateStandingOrders(input: unknown): ValidationResult {
  if (!Array.isArray(input)) return { ok: false, message: 'orders must be an array.' };
  if (input.length > 32) return { ok: false, message: 'orders may contain at most 32 entries.' };

  const orders: StandingOrder[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    if (!isRecord(value) || typeof value.verb !== 'string') {
      return { ok: false, message: `orders[${index}] requires a verb.` };
    }
    const parsed = validateOrder(value, index);
    if (typeof parsed === 'string') return { ok: false, message: parsed };
    orders.push(parsed);
  }
  return { ok: true, orders };
}

export function requiredLevel(order: StandingOrder): AgentPermissionLevel {
  if (order.verb === 'BUILD') return 3;
  if (order.verb === 'CONTEXT_ACTION') return 3;
  if (order.verb === 'HARVEST') return 2;
  return 2;
}

function validateOrder(value: Record<string, unknown>, index: number): StandingOrder | string {
  if (value.verb === 'BUILD') {
    const hasRotation = 'rotationSteps' in value;
    if (!exactKeys(value, hasRotation ? ['verb', 'what', 'where', 'when', 'rotationSteps'] : ['verb', 'what', 'where', 'when'])) {
      return schemaError(index, 'BUILD');
    }
    if (!isBuildableId(value.what) || !validPos(value.where)) return schemaError(index, 'BUILD');
    const rotationSteps = value.rotationSteps;
    if (hasRotation && (typeof rotationSteps !== 'number' || !Number.isInteger(rotationSteps) || rotationSteps < 0 || rotationSteps > 3)) {
      return schemaError(index, 'BUILD');
    }
    const when = validCondition(value.when);
    return when
      ? { verb: 'BUILD', what: value.what, where: value.where, when, ...(hasRotation ? { rotationSteps: rotationSteps as 0 | 1 | 2 | 3 } : {}) }
      : schemaError(index, 'BUILD');
  }
  if (value.verb === 'REPAIR_UNDER') {
    if (!exactKeys(value, ['verb', 'pct']) || !finiteInRange(value.pct, 0, 100)) return schemaError(index, 'REPAIR_UNDER');
    return { verb: 'REPAIR_UNDER', pct: value.pct };
  }
  if (value.verb === 'MOVE_TO' || value.verb === 'HOLD') {
    if (!exactKeys(value, ['verb', 'pos']) || !validPos(value.pos)) return schemaError(index, value.verb);
    return { verb: value.verb, pos: value.pos };
  }
  if (value.verb === 'BLAST_AT') {
    if (!exactKeys(value, ['verb', 'pos']) || !validPos(value.pos)) return schemaError(index, 'BLAST_AT');
    return { verb: 'BLAST_AT', pos: value.pos };
  }
  if (value.verb === 'SET_WEAPON') {
    // SET is deliberately idempotent: standing-order replacement may re-apply a whole tape.
    if (!exactKeys(value, ['verb', 'weapon']) || (value.weapon !== 'rig' && value.weapon !== 'blast')) return schemaError(index, 'SET_WEAPON');
    return { verb: 'SET_WEAPON', weapon: value.weapon };
  }
  if (value.verb === 'HARVEST') {
    if (exactKeys(value, ['verb', 'seam']) && typeof value.seam === 'string' && value.seam.length > 0 && value.seam.length <= 80) {
      return { verb: 'HARVEST', seam: value.seam };
    }
    if (exactKeys(value, ['verb', 'sluice']) && Number.isInteger(value.sluice) && finiteInRange(value.sluice, 0, 31)) {
      return { verb: 'HARVEST', sluice: value.sluice };
    }
    return schemaError(index, 'HARVEST');
  }
  if (value.verb === 'PICK_UPGRADE') {
    if (!exactKeys(value, ['verb', 'id']) || typeof value.id !== 'string' || value.id.length === 0 || value.id.length > 80) {
      return schemaError(index, 'PICK_UPGRADE');
    }
    return { verb: 'PICK_UPGRADE', id: value.id };
  }
  if (value.verb === 'SECURE_CHOICE') {
    if (!exactKeys(value, ['verb', 'choice']) || (value.choice !== 'bank' && value.choice !== 'rush')) return schemaError(index, 'SECURE_CHOICE');
    return { verb: 'SECURE_CHOICE', choice: value.choice };
  }
  if (value.verb === 'CONTEXT_ACTION') {
    if (value.action === 'fund' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'fund' };
    if (value.action === 'recover' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'recover' };
    if (value.action === 'plant' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'plant' };
    if (value.action === 'redig' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'redig' };
    if (value.action === 'backfill' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'backfill' };
    if ((value.action !== 'upgrade' && value.action !== 'demolish') || !exactKeys(value, ['verb', 'action', 'target']) || !isRecord(value.target)) {
      return schemaError(index, 'CONTEXT_ACTION');
    }
    if (!exactKeys(value.target, ['id', 'index']) || !isBuildableId(value.target.id)
      || !Number.isInteger(value.target.index) || !finiteInRange(value.target.index, 0, 10_000)) {
      return schemaError(index, 'CONTEXT_ACTION');
    }
    return { verb: 'CONTEXT_ACTION', action: value.action, target: { id: value.target.id, index: value.target.index } };
  }
  if (value.verb === 'CAPTURE') {
    if (!exactKeys(value, ['verb'])) return schemaError(index, 'CAPTURE');
    return { verb: 'CAPTURE' };
  }
  if (value.verb === 'BOAT_BUILD') {
    if (!exactKeys(value, ['verb', 'padId', 'buildingId']) || !validId(value.padId) || !validId(value.buildingId)) {
      return schemaError(index, 'BOAT_BUILD');
    }
    return { verb: 'BOAT_BUILD', padId: value.padId, buildingId: value.buildingId };
  }
  if (value.verb === 'REANCHOR') {
    if (!exactKeys(value, ['verb', 'anchorId']) || !validId(value.anchorId)) return schemaError(index, 'REANCHOR');
    return { verb: 'REANCHOR', anchorId: value.anchorId };
  }
  if (value.verb === 'FALLBACK_IF') {
    if (!exactKeys(value, ['verb', 'threat', 'pos']) || !validPos(value.pos) || !isRecord(value.threat)) {
      return schemaError(index, 'FALLBACK_IF');
    }
    if (!exactKeys(value.threat, ['enemiesGte']) || !finiteInRange(value.threat.enemiesGte, 1, 10_000)) {
      return schemaError(index, 'FALLBACK_IF');
    }
    return { verb: 'FALLBACK_IF', threat: { enemiesGte: value.threat.enemiesGte }, pos: value.pos };
  }
  return `orders[${index}].verb "${value.verb}" is unknown.`;
}

function validCondition(value: unknown): BuildCondition | null {
  if (!isRecord(value)) return null;
  if (exactKeys(value, ['goldGte']) && finiteInRange(value.goldGte, 0, 1_000_000)) return { goldGte: value.goldGte };
  if (exactKeys(value, ['waveGte']) && finiteInRange(value.waveGte, 0, 10_000)) return { waveGte: value.waveGte };
  return null;
}

function conditionMet(condition: BuildCondition, state: RuntimeState): boolean {
  return 'goldGte' in condition ? state.gold >= condition.goldGte : state.wave >= condition.waveGte;
}

function permissionDenial(
  order: StandingOrder,
  state: RuntimeState,
  level: AgentPermissionLevel,
): string | null {
  const required = requiredLevel(order);
  if (required > level) return `${order.verb} requires permission rung ${required}; current rung is ${level}.`;

  const rung = state.consent?.rungs[String(required)];
  if (rung && (!rung.earned || !rung.granted)) return `${order.verb} requires granted permission rung ${required}.`;

  const ability = requiredAbility(order);
  if (ability && state.consent?.abilities[ability]?.allowed === false) {
    return `${order.verb} requires the granted ${ability} ability.`;
  }
  return null;
}

function requiredAbility(order: StandingOrder): AgentAbility | null {
  if (order.verb === 'BUILD') return 'place_building';
  if (order.verb === 'REPAIR_UNDER') return 'auto_repair';
  if (order.verb === 'HARVEST') return 'auto_pan';
  return null;
}

function runtimeState(
  value: unknown,
  at?: number,
  includeActions = false,
  economyLog: readonly unknown[] = [],
): RuntimeState {
  const state = isRecord(value) ? value : {};
  const economy = isRecord(state.economy) ? state.economy : {};
  const wreck = isRecord(state.wreck) ? state.wreck : {};
  const build = isRecord(state.build) ? state.build : {};
  const harvest = isRecord(state.harvest) ? state.harvest : {};
  const agent = isRecord(state.agent) ? state.agent : {};
  const embodiment = isRecord(agent.embodiment) ? agent.embodiment : {};
  const observedAt = finite(state.timeAlive, at ?? 0);
  const wave = predictedWave(state, at, observedAt);
  return {
    timeAlive: at ?? observedAt,
    runState: typeof state.runState === 'string' ? state.runState : '',
    hp: finite(state.hp, 0),
    maxHp: finite(state.maxHp, 0),
    enemiesAlive: finite(state.enemiesAlive, 0),
    wave: wave.value,
    nextWaveInSim: wave.nextIn,
    gold: currentGold(finite(economy.gold, 0), observedAt, economyLog),
    claimHits: finite(wreck.hitsResolved, 0),
    actorMoving: embodiment.moving === true || embodiment.drifting === true,
    consent: consentState(state),
    buildings: includeActions ? buildingStates(build.hp) : [],
    seams: includeActions ? seamStates(harvest.activeNodes) : [],
    sluices: includeActions ? pointArray(build.sluicePositions) : [],
    pendingOffer: isRecord(state.progression) && Array.isArray(state.progression.offer)
      ? state.progression.offer.filter((id): id is string => typeof id === 'string')
      : [],
    pendingSecure: isRecord(state.run) && state.run.pendingSecure === true,
  };
}

function predictedWave(
  state: Record<string, unknown>,
  at: number | undefined,
  observedAt: number,
): { value: number; nextIn: number } {
  const observedWave = finite(state.wave, 0);
  const observedNext = Math.max(0, finite(state.nextWaveInSim, 0));
  if (at === undefined || state.spawnDisabled === true || scheduledWavesDisabled() || at < observedAt + observedNext) {
    return { value: observedWave, nextIn: observedNext };
  }

  const contract = isRecord(state.contract) ? state.contract : {};
  const cadence = Math.max(0.1, finite(contract.waveCadenceMult, 1));
  const interval = Math.max(0.1, Balance.waves.waveInterval / cadence);
  return {
    value: observedWave + 1,
    nextIn: Math.max(0, interval - (at - observedAt - observedNext)),
  };
}

function scheduledWavesDisabled(): boolean {
  return typeof location !== 'undefined' && new URLSearchParams(location.search).has('nowaves');
}

function currentGold(observedGold: number, observedAt: number, log: readonly unknown[]): number {
  let gold = observedGold;
  for (const value of log) {
    if (!isRecord(value) || finite(value.at, Number.NEGATIVE_INFINITY) <= observedAt) continue;
    const amount = Math.max(0, finite(value.amount, 0));
    if (
      value.type === 'gold_panned' ||
      value.type === 'gold_sluiced' ||
      value.type === 'gold_granted' ||
      value.type === 'gold_reclaimed'
    ) {
      gold += amount;
    } else if (value.type === 'gold_stolen' || value.type === 'gold_spent') {
      gold -= amount;
    } else if (value.type === 'run_reset') {
      gold = 0;
    }
  }
  return Math.max(0, gold);
}

function consentState(state: Record<string, unknown>): RuntimeState['consent'] {
  const ui = isRecord(state.ui) ? state.ui : {};
  const agent = isRecord(ui.agent) ? ui.agent : {};
  const consent = isRecord(agent.consent) ? agent.consent : null;
  if (!consent || !isRecord(consent.rungs) || !isRecord(consent.abilities)) return null;

  const rungs: Record<string, { earned: boolean; granted: boolean }> = {};
  const abilities: Record<string, { allowed: boolean }> = {};
  for (const [key, value] of Object.entries(consent.rungs)) {
    if (isRecord(value) && typeof value.earned === 'boolean' && typeof value.granted === 'boolean') {
      rungs[key] = { earned: value.earned, granted: value.granted };
    }
  }
  for (const [key, value] of Object.entries(consent.abilities)) {
    if (isRecord(value) && typeof value.allowed === 'boolean') abilities[key] = { allowed: value.allowed };
  }
  return { rungs, abilities };
}

function buildingStates(value: unknown): RuntimeState['buildings'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !validPos(entry.position)) return [];
    return [{
      id: entry.id,
      ...(Number.isInteger(entry.index) ? { index: entry.index as number } : {}),
      hp: finite(entry.hp, 0),
      maxHp: finite(entry.maxHp, 0),
      wrecked: entry.wrecked === true,
      position: entry.position,
    }];
  });
}

function seamStates(value: unknown): RuntimeState['seams'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !validPos(entry.position)) return [];
    return [{ id: entry.id, active: entry.active === true, position: entry.position }];
  });
}

function pointArray(value: unknown): AgentVec2[] {
  return Array.isArray(value) ? value.filter(validPos) : [];
}

function copyRecords(records: StandingOrderRecord[]): StandingOrderRecord[] {
  return records.map((record) => ({
    ...record,
    order: structuredClone(record.order),
  }));
}

export function standingOrderIdentity(order: StandingOrder): string {
  if (order.verb === 'BUILD') {
    const when = 'goldGte' in order.when ? ['goldGte', order.when.goldGte] : ['waveGte', order.when.waveGte];
    return JSON.stringify([order.verb, order.what, order.where.x, order.where.z, ...when,
      ...(order.rotationSteps ? ['rotationSteps', order.rotationSteps] : [])]);
  }
  if (order.verb === 'REPAIR_UNDER') return JSON.stringify([order.verb, order.pct]);
  if (order.verb === 'MOVE_TO' || order.verb === 'HOLD' || order.verb === 'BLAST_AT') {
    return JSON.stringify([order.verb, order.pos.x, order.pos.z]);
  }
  if (order.verb === 'HARVEST') return JSON.stringify([order.verb, 'seam' in order ? order.seam : order.sluice]);
  if (order.verb === 'PICK_UPGRADE') return JSON.stringify([order.verb, order.id]);
  if (order.verb === 'SET_WEAPON') return JSON.stringify([order.verb, order.weapon]);
  if (order.verb === 'SECURE_CHOICE') return JSON.stringify([order.verb, order.choice]);
  if (order.verb === 'CONTEXT_ACTION') return JSON.stringify([order.verb, order.action,
    ...('target' in order ? [order.target.id, order.target.index] : [])]);
  if (order.verb === 'CAPTURE') return JSON.stringify([order.verb]);
  if (order.verb === 'BOAT_BUILD') return JSON.stringify([order.verb, order.padId, order.buildingId]);
  if (order.verb === 'REANCHOR') return JSON.stringify([order.verb, order.anchorId]);
  return JSON.stringify([order.verb, order.threat.enemiesGte, order.pos.x, order.pos.z]);
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 80;
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function validPos(value: unknown): value is AgentVec2 {
  return isRecord(value) && exactKeys(value, ['x', 'z']) && Number.isFinite(value.x) && Number.isFinite(value.z);
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function schemaError(index: number, verb: StandingOrder['verb']): string {
  return `orders[${index}] does not match the ${verb} schema.`;
}

function distance(a: AgentVec2, b: AgentVec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
