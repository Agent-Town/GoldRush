import type * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { listEpochs, loadEpoch, type ContractManifest } from '../meta/ContractFamilies';
import type { EventBus } from '../core/EventBus';
import type { CombatSystem } from '../systems/CombatSystem';
import { E9ArsenalSystem, type E9ArsenalDiagnostics } from '../systems/E9ArsenalSystem';

/**
 * ER-01 E9 era socket — the headless consumer for the Red Fields arsenal.
 *
 * The browser ticks these consumers in order:
 *
 *   Game.update: E9ArsenalSystem.update
 *                -> EnemyPool.update(... E9ArsenalSystem.movementMultiplier)
 *                -> CombatSystem.update
 *
 * This socket runs only the production `E9ArsenalSystem.update` seam. It refuses and counts
 * `EnemyPool.update`, so a computed Storm Fence slow is integrated by nothing, and
 * `CombatSystem.update`, so no registered shooter fires and `fires`/`outcomes` stay empty.
 */
export type E9ArsenalSocketDiagnostics = E9ArsenalDiagnostics & Readonly<{
  contractId: string;
  refusedConsumers: readonly string[];
  combatTicksRefused: number;
  enemyIntegrationTicksRefused: number;
}>;

const REFUSED_CONSUMERS = ['CombatSystem.update', 'EnemyPool.update'] as const;

export class E9ArsenalSocket {
  private readonly arsenal: E9ArsenalSystem;
  private combatTicksRefused = 0;
  private enemyIntegrationTicksRefused = 0;

  private constructor(
    private readonly contract: ContractManifest,
    combat: CombatSystem,
    events: EventBus,
    enemies: EnemyPool,
    heroPosition: () => THREE.Vector3,
    turretPosition: (index: number) => THREE.Vector3 | null,
    hasResearch: (id: string) => boolean,
  ) {
    this.arsenal = new E9ArsenalSystem(
      combat,
      events,
      enemies,
      heroPosition,
      turretPosition,
      () => true,
      hasResearch,
    );
  }

  /** Mirrors the browser's epoch test: null for every contract outside epoch-9-redfields. */
  static create(
    contract: ContractManifest,
    combat: CombatSystem,
    events: EventBus,
    enemies: EnemyPool,
    heroPosition: () => THREE.Vector3,
    turretPosition: (index: number) => THREE.Vector3 | null,
    hasResearch: (id: string) => boolean,
  ): E9ArsenalSocket | null {
    const epoch = listEpochs().find((meta) => loadEpoch(meta.id).contracts.some(({ id }) => id === contract.id));
    return epoch?.id === 'epoch-9-redfields'
      ? new E9ArsenalSocket(contract, combat, events, enemies, heroPosition, turretPosition, hasResearch)
      : null;
  }

  /** Runs the arsenal seam and counts the two later browser consumers this socket refuses. */
  advance(delta: number, at: number): void {
    this.arsenal.update(delta, at);
    this.enemyIntegrationTicksRefused += 1;
    this.combatTicksRefused += 1;
  }

  deployFence(position?: THREE.Vector3): boolean {
    return this.arsenal.deployFence(position);
  }

  movementMultiplier(enemy: ClaimJumperEnemy): number {
    return this.arsenal.movementMultiplier(enemy);
  }

  get diagnostics(): E9ArsenalSocketDiagnostics {
    return {
      contractId: this.contract.id,
      ...this.arsenal.diagnostics,
      refusedConsumers: REFUSED_CONSUMERS,
      combatTicksRefused: this.combatTicksRefused,
      enemyIntegrationTicksRefused: this.enemyIntegrationTicksRefused,
    };
  }

  /** Stable simulation slice: presentation decisions can never move a determinism hash. */
  get simulationSnapshot(): unknown {
    const { presentation: _presentation, ...simulation } = this.diagnostics;
    return simulation;
  }
}
