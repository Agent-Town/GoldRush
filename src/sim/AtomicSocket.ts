import type * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import type { Economy } from '../game/Economy';
import { TileStateStore } from '../game/TileStateStore';
import { listEpochs, loadEpoch, type ContractManifest } from '../meta/ContractFamilies';
import type { EventBus } from '../core/EventBus';
import { DecayScheduler } from '../systems/DecaySystem';
import { E6TileConsumerSystem } from '../systems/E6TileConsumerSystem';
import { ShowroomCaptureObjective, type ShowroomCaptureDiagnostics } from '../systems/ShowroomCaptureObjective';
import { WrangleSystem } from '../systems/WrangleSystem';

/**
 * ER-01 E6 era socket — the headless consumers for the Atomic epoch.
 *
 * `WrangleSystem` is enabled for the WHOLE epoch in the browser
 * (`Game.ts:646`, `contractEpoch?.id === 'epoch-6-atomic'`), which is why one missing
 * consumer blocked all four Atomic contracts at once: every roster carries `feral_toaster`
 * and/or `lawn_shepherd`, the two variants wrangle acts on. `E6TileConsumerSystem` is
 * narrower — Glow Mesa only — and carries the decay-field windows and the night-vein ring.
 *
 * Browser tick order, preserved here:
 *
 *   decay.tick -> updateActors -> e6TileConsumers.update -> waveSystem.update -> wrangle.update
 *
 * and the three behavioural couplings the browser applies through other systems:
 *   - `CombatSystem.onEnemyDamaged`  -> wrangle.onDamage      (Game.ts:534)
 *   - `EnemyPool.update` contact     -> !wrangle.isHarmless   (Game.ts:2606)
 *   - `EnemyPool.update` speed       -> wrangle.movementMultiplier (Game.ts:2614)
 *
 * The capture ceremony (`WrangleSystem.tryCapture`) is driven only by the agent-surface
 * `CAPTURE` verb. The socket remains a thin mirror of the browser keybind/dev bridge:
 * it adds no target, range, or cost rule of its own — reject-don't-stretch.
 */
type Positioned = { position: THREE.Vector3 };

export type AtomicSocketDiagnostics = Readonly<{
  epochId: string;
  wrangle: ReturnType<WrangleSystem['diagnostics']>;
  tiles: E6TileConsumerSystem['diagnostics'] | null;
  exhausted: number;
  captureLever: 'CAPTURE';
  showroomObjective?: ShowroomCaptureDiagnostics;
}>;

export class AtomicSocket {
  private readonly decay: DecayScheduler;
  private readonly wrangle: WrangleSystem;
  private readonly showroomObjective: ShowroomCaptureObjective;
  private readonly tiles: E6TileConsumerSystem | null;
  private exhausted = 0;

  private constructor(
    private readonly epochId: string,
    contract: ContractManifest,
    events: EventBus,
    enemies: EnemyPool,
    economy: Economy,
  ) {
    this.decay = new DecayScheduler(events);
    this.showroomObjective = ShowroomCaptureObjective.create(contract);
    // GR-SIM keeps no profile on disk: tile persistence reads empty and writes nowhere, so a
    // captured machine cannot survive a run here. That is a property of the harness, not a bug —
    // and it is why the pen roster is only ever evidence about the CURRENT run.
    const tileState = new TileStateStore({
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    this.wrangle = new WrangleSystem(
      true,
      contract.id,
      this.decay,
      enemies,
      economy,
      tileState,
      () => {
        this.exhausted += 1;
      },
      // The browser feeds the same objective from this callback before adding its presentation.
      () => this.showroomObjective.recordCapture(),
    );
    this.tiles = contract.id === 'e6-glow-mesa'
      ? new E6TileConsumerSystem(true, contract.id, this.decay, economy, tileState, contract.tileParams)
      : null;
  }

  /** Mirrors the browser's epoch test: null for every contract outside epoch-6-atomic. */
  static create(
    contract: ContractManifest,
    events: EventBus,
    enemies: EnemyPool,
    economy: Economy,
  ): AtomicSocket | null {
    const epoch = listEpochs().find((meta) => loadEpoch(meta.id).contracts.some(({ id }) => id === contract.id));
    return epoch?.id === 'epoch-6-atomic' ? new AtomicSocket(epoch.id, contract, events, enemies, economy) : null;
  }

  /** Game.update: decay.tick, ahead of the actors. */
  tickDecay(): void {
    this.decay.tick();
  }

  /** Game.update: e6TileConsumers.update, immediately after the actors move. */
  updateTileConsumers(delta: number, at: number, actors: readonly Positioned[]): void {
    this.tiles?.update(delta, at, actors);
  }

  /** Game.update: wrangle.update, immediately after the wave system. */
  updateWrangle(delta: number, at: number): void {
    this.wrangle.update(delta, at);
  }

  /** CombatSystem.onEnemyDamaged — resets the wind-down whenever a machine is struck. */
  onEnemyDamaged(enemy: ClaimJumperEnemy, amount: number, died: boolean): void {
    this.wrangle.onDamage(enemy, amount, died);
  }

  /**
   * `!wrangle.isHarmless` — the browser uses this ONE predicate at two call sites:
   * `CombatSystem.canDamageEnemy` (Game.ts:536) and the `EnemyPool.update` contact gate
   * (Game.ts:2606). An exhausted machine neither takes fire nor hurts the hero: it is waiting
   * to be caught, not fought.
   */
  isHostile(enemy: ClaimJumperEnemy): boolean {
    return !this.wrangle.isHarmless(enemy);
  }

  /** EnemyPool.update speed gate — an exhausted machine crawls. */
  movementMultiplier(enemy: ClaimJumperEnemy): number {
    return this.wrangle.movementMultiplier(enemy);
  }

  /**
   * `WaveSystem` alive-cap exemption — see `WrangleSystem.exhaustedCount` for the owner
   * ruling. The browser reads the same method off its own `Game.wrangle`, so the spawn
   * refusal is identical in both engines by construction, not by parallel arithmetic.
   */
  exhaustedCount(): number {
    return this.wrangle.exhaustedCount();
  }

  /** Browser capture keybind/dev bridge — nearest exhausted machine in the authored radius. */
  capture(position: THREE.Vector3): boolean {
    return this.wrangle.tryCapture(position);
  }

  get objectiveAllowsSecure(): boolean {
    return this.showroomObjective.objectiveAllowsSecure;
  }

  get diagnostics(): AtomicSocketDiagnostics {
    const showroomObjective = this.showroomObjective.diagnostics;
    return {
      epochId: this.epochId,
      wrangle: this.wrangle.diagnostics(),
      tiles: this.tiles?.diagnostics ?? null,
      exhausted: this.exhausted,
      captureLever: 'CAPTURE',
      ...(showroomObjective.declared ? { showroomObjective } : {}),
    };
  }
}
