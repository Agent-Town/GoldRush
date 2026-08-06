import type * as THREE from 'three';
import type { EnemyPool } from '../entities/pools';
import type { Economy } from '../game/Economy';
import { TileStateStore } from '../game/TileStateStore';
import type { ContractManifest } from '../meta/ContractFamilies';
import { E9CanalSystem, type E9CanalDiagnostics } from '../systems/E9CanalSystem';

/**
 * ER-01 E9 era socket — the headless consumer for Dome Basin's canal.
 *
 * The browser ticks these consumers in order:
 *
 *   Game.update: oldDiggerBoss.update -> e9ArsenalSystem.update -> e9CanalSystem.update
 *
 * This socket runs only the production `E9CanalSystem` seam. It refuses the preceding
 * `OldDiggerBossSystem` and `E9ArsenalSystem` steps and counts both refusals on every tick,
 * so the census cannot mistake one socketed system for a complete Dome Basin simulation.
 */
export type E9CanalActor = { position: THREE.Vector3; speed: number };

export type E9CanalSocketDiagnostics = E9CanalDiagnostics & Readonly<{
  contractId: string;
  receipts: readonly { id: string; amount: number }[];
  refusedConsumers: readonly string[];
  bossStepsRefused: number;
  arsenalStepsRefused: number;
}>;

const REFUSED_CONSUMERS = ['OldDiggerBossSystem', 'E9ArsenalSystem'] as const;

export class E9CanalSocket {
  private readonly canal: E9CanalSystem;
  private bossStepsRefused = 0;
  private arsenalStepsRefused = 0;

  private constructor(
    private readonly contract: ContractManifest,
    private readonly economy: Economy,
    enemies: EnemyPool,
  ) {
    // GR-SIM owns no profile: every socket starts from an empty tile and writes nowhere.
    const tileState = new TileStateStore({
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    this.canal = new E9CanalSystem(economy, tileState, contract.tileParams, () => enemies.all, () => true);
  }

  /** Refuses all three Red Fields siblings and every contract outside Dome Basin. */
  static create(contract: ContractManifest, enemies: EnemyPool, economy: Economy): E9CanalSocket | null {
    return contract.id === 'e9-dome-basin' ? new E9CanalSocket(contract, economy, enemies) : null;
  }

  /** Reproduces the browser tick order by counting both missing predecessors before the canal. */
  advance(delta: number, at: number, actors: readonly E9CanalActor[]): boolean {
    this.bossStepsRefused += 1;
    this.arsenalStepsRefused += 1;
    return this.canal.update(delta, at, actors);
  }

  get diagnostics(): E9CanalSocketDiagnostics {
    return {
      contractId: this.contract.id,
      ...this.canal.diagnostics,
      receipts: this.economy.log.flatMap((event) =>
        event.type === 'gold_granted' && event.source === 'escort' ? [{ id: event.id, amount: event.amount }] : [],
      ),
      refusedConsumers: REFUSED_CONSUMERS,
      bossStepsRefused: this.bossStepsRefused,
      arsenalStepsRefused: this.arsenalStepsRefused,
    };
  }

  /** Stable event-log slice: render-only canal fields and unrounded world positions stay out. */
  get simulationSnapshot(): unknown {
    const { canal, dustDevil, ...rest } = this.diagnostics;
    return {
      ...rest,
      canal: { wet: canal.wet },
      dustDevil: {
        ...dustDevil,
        position: dustDevil.position
          ? { x: round3(dustDevil.position.x), z: round3(dustDevil.position.z) }
          : null,
      },
    };
  }
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
