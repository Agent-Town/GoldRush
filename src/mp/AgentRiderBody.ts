import * as THREE from 'three';
import { StandingOrdersExecutor, type FinalVerbHandlers, type StandingOrder, type StandingOrdersView } from '../agent/StandingOrders';
import { createToolSurface, type AgentGameAdapter } from '../agent/ToolSurface';

export type AgentRiderBodySnapshot = StandingOrdersView & {
  playerId: string;
  submissionId: string | null;
};

export type AgentRiderBodyFutureState = {
  playerId: string;
  submissionId: string | null;
  orders: StandingOrder[];
};

/** A headless roster seat's deterministic controller for its ordinary multiplayer Hero. */
export class AgentRiderBody {
  private readonly executor: StandingOrdersExecutor;
  private submissionId: string | null = null;

  constructor(readonly playerId: string, game: AgentGameAdapter, finalVerbs?: FinalVerbHandlers) {
    const surface = createToolSurface(game, { permissionLevel: 3 });
    this.executor = new StandingOrdersExecutor(surface, game.diagnostics ?? (() => ({})), game.economyLog);
    if (finalVerbs) this.executor.bindFinalVerbs(finalVerbs);
  }

  submit(orders: StandingOrder[], submissionId: string, at: number): boolean {
    if (submissionId === this.submissionId) return true;
    const result = this.executor.submit(orders, at);
    if (result.ok) this.submissionId = submissionId;
    return result.ok;
  }

  movement(at: number, actor: { x: number; z: number }): THREE.Vector2 {
    const target = this.executor.tick(at, actor).movement;
    if (!target) return new THREE.Vector2();
    const dx = target.x - actor.x;
    const dz = target.z - actor.z;
    const length = Math.hypot(dx, dz);
    return length > 0 ? new THREE.Vector2(dx / length, dz / length) : new THREE.Vector2();
  }

  snapshot(): AgentRiderBodySnapshot {
    return { playerId: this.playerId, submissionId: this.submissionId, ...this.executor.snapshot() };
  }

  captureFutureState(): AgentRiderBodyFutureState {
    return {
      playerId: this.playerId,
      submissionId: this.submissionId,
      orders: this.executor.snapshot().orders
        .filter((record) => record.status === 'pending' || record.status === 'active')
        .map((record) => record.order),
    };
  }

  restoreFutureState(state: AgentRiderBodyFutureState, at: number): boolean {
    if (state.playerId !== this.playerId || (state.submissionId !== null && typeof state.submissionId !== 'string')) return false;
    this.executor.reset();
    this.submissionId = null;
    if (state.orders.length > 0 && !this.executor.submit(state.orders, at).ok) return false;
    this.submissionId = state.submissionId;
    return true;
  }
}
