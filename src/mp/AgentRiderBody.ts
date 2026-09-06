import * as THREE from 'three';
import { StandingOrdersExecutor, type FinalVerbHandlers, type StandingOrder, type StandingOrdersView } from '../agent/StandingOrders';
import { createToolSurface, type AgentGameAdapter, type AgentVec2, type ToolSurfaceOptions } from '../agent/ToolSurface';

/**
 * hero-move-verb: the room's half of the hero channel. A seat's body IS an ordinary multiplayer
 * Hero, so `MOVE_HERO` and `MOVE_TO` steer the same body here; the two only name different bodies
 * in GR-SIM, where `MOVE_TO` drives the Prospector. `Game.syncMultiplayerActors` constructs an
 * `AgentRiderBody` for a roster entry ONLY where `player.client === 'headless'`, so a body that
 * exists at all is a rider's, never a human pilot's, and `riderPiloted` is true by construction.
 * The walkable probe is injected because terrain is the browser's to answer.
 */
export type AgentRiderBodyHero = { walkable?: (pos: AgentVec2) => boolean };

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
  /** hero-move-verb: the seat body's position, refreshed by `movement()` before each tick. */
  private actorPoint: AgentVec2 = { x: 0, z: 0 };

  constructor(
    readonly playerId: string,
    game: AgentGameAdapter,
    finalVerbs?: FinalVerbHandlers,
    options: ToolSurfaceOptions = {},
    hero: AgentRiderBodyHero = {},
  ) {
    const surface = createToolSurface(game, { ...options, permissionLevel: 3 });
    this.executor = new StandingOrdersExecutor(surface, game.diagnostics ?? (() => ({})), game.economyLog);
    if (finalVerbs) this.executor.bindFinalVerbs(finalVerbs);
    this.executor.bindHeroChannel({
      position: () => this.actorPoint,
      riderPiloted: () => true,
      walkable: hero.walkable ?? (() => true),
    });
  }

  submit(orders: StandingOrder[], submissionId: string, at: number): boolean {
    if (submissionId === this.submissionId) return true;
    const result = this.executor.submit(orders, at);
    if (result.ok) this.submissionId = submissionId;
    return result.ok;
  }

  movement(at: number, actor: { x: number; z: number }): THREE.Vector2 {
    this.actorPoint = actor;
    const result = this.executor.tick(at, actor);
    // hero-move-verb: one body, so one vector. `movement` (MOVE_TO/HOLD/BUILD travel) and
    // `heroMovement` (MOVE_HERO) can never both be set on one tick, because the executor returns on
    // the first order that owns the tick.
    const target = result.movement ?? result.heroMovement;
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
