import * as THREE from 'three';
import { Balance } from '../game/Balance';
import {
  ClaimJumperEnemy,
  createClaimJumperAssets,
  disposeClaimJumperAssets,
  type ClaimJumperAssets,
} from './Enemy';

export class EnemyPool {
  readonly group = new THREE.Group();

  private readonly assets: ClaimJumperAssets = createClaimJumperAssets();
  private readonly enemies: ClaimJumperEnemy[] = [];
  private readonly cells: ClaimJumperEnemy[][] = [];
  private readonly touchedCells: number[] = [];
  private readonly gridSize: number;
  private readonly gridMin: number;
  private readonly gridMax: number;
  private readonly cellSize: number;
  private active = 0;

  constructor() {
    this.group.name = 'EnemyPool';
    this.cellSize = Balance.enemy.spatialHashCellSize;
    this.gridMin = Balance.enemy.spatialHashWorldMin;
    this.gridMax = Balance.enemy.spatialHashWorldMax;
    this.gridSize = Math.ceil((this.gridMax - this.gridMin) / this.cellSize);

    for (let i = 0; i < this.gridSize * this.gridSize; i += 1) {
      this.cells.push([]);
    }

    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      const enemy = new ClaimJumperEnemy(i, this.assets);
      this.enemies.push(enemy);
      this.group.add(enemy.group);
    }
  }

  get activeCount(): number {
    return this.active;
  }

  get capacity(): number {
    return this.enemies.length;
  }

  spawn(position: THREE.Vector3, speedScale = 1): ClaimJumperEnemy | null {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) continue;
      enemy.spawn(position, speedScale);
      this.active += 1;
      return enemy;
    }
    return null;
  }

  spawnPack(center: THREE.Vector3, count: number): number {
    let spawned = 0;
    const ringRadius = Balance.enemy.debugPackRadius;
    const startAngle = Math.PI * -0.5;

    for (let i = 0; i < count; i += 1) {
      const angle = startAngle + (i / Math.max(1, count)) * Math.PI * 2;
      const position = new THREE.Vector3(
        center.x + Math.cos(angle) * ringRadius,
        Balance.enemy.groundY,
        center.z + Math.sin(angle) * ringRadius,
      );
      if (this.spawn(position, 1)) spawned += 1;
    }

    return spawned;
  }

  update(delta: number, heroPosition: THREE.Vector3, onContact: (enemy: ClaimJumperEnemy) => void): void {
    this.rebuildSpatialHash();

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      let separationX = 0;
      let separationZ = 0;
      const cellX = this.toGridCoord(enemy.group.position.x);
      const cellZ = this.toGridCoord(enemy.group.position.z);

      for (let dz = -1; dz <= 1; dz += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const cell = this.cellAt(cellX + dx, cellZ + dz);
          if (!cell) continue;

          for (const other of cell) {
            if (other === enemy) continue;
            const awayX = enemy.group.position.x - other.group.position.x;
            const awayZ = enemy.group.position.z - other.group.position.z;
            const distSq = awayX * awayX + awayZ * awayZ;
            if (distSq <= 0.0001 || distSq >= Balance.enemy.separationRadiusSq) continue;

            const distance = Math.sqrt(distSq);
            const strength = 1 - distance / Balance.enemy.separationRadius;
            separationX += (awayX / distance) * strength;
            separationZ += (awayZ / distance) * strength;
          }
        }
      }

      if (enemy.update(delta, heroPosition, separationX, separationZ)) {
        onContact(enemy);
      }
    }
  }

  recycle(enemy: ClaimJumperEnemy): void {
    if (!enemy.isAlive) return;
    enemy.recycle();
    this.active = Math.max(0, this.active - 1);
  }

  recycleAll(): void {
    for (const enemy of this.enemies) {
      enemy.recycle();
    }
    this.active = 0;
    this.clearSpatialHash();
  }

  dispose(): void {
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    disposeClaimJumperAssets(this.assets);
  }

  private rebuildSpatialHash(): void {
    this.clearSpatialHash();

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const cellIndex = this.cellIndex(enemy.group.position.x, enemy.group.position.z);
      if (cellIndex < 0) continue;

      const cell = this.cells[cellIndex];
      if (!cell) continue;
      if (cell.length === 0) this.touchedCells.push(cellIndex);
      cell.push(enemy);
    }
  }

  private clearSpatialHash(): void {
    for (const index of this.touchedCells) {
      const cell = this.cells[index];
      if (cell) cell.length = 0;
    }
    this.touchedCells.length = 0;
  }

  private cellAt(cellX: number, cellZ: number): ClaimJumperEnemy[] | null {
    if (cellX < 0 || cellX >= this.gridSize || cellZ < 0 || cellZ >= this.gridSize) return null;
    return this.cells[cellZ * this.gridSize + cellX] ?? null;
  }

  private cellIndex(x: number, z: number): number {
    const cellX = this.toGridCoord(x);
    const cellZ = this.toGridCoord(z);
    if (cellX < 0 || cellX >= this.gridSize || cellZ < 0 || cellZ >= this.gridSize) return -1;
    return cellZ * this.gridSize + cellX;
  }

  private toGridCoord(value: number): number {
    const clamped = THREE.MathUtils.clamp(value, this.gridMin, this.gridMax - 0.001);
    return Math.floor((clamped - this.gridMin) / this.cellSize);
  }
}
