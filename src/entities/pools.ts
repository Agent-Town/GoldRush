import * as THREE from 'three';
import { GeneratedSpriteBatch } from '../assets/generated';
import { SpriteAnimator, type CharacterSpriteClip } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import type { PalisadeBlocker } from './Palisade';
import {
  ClaimJumperEnemy,
  createClaimJumperAssets,
  disposeClaimJumperAssets,
  type ClaimJumperAssets,
  type EnemySpawnParams,
  type ThiefUpdateContext,
  type WreckerUpdateContext,
} from './Enemy';
import type { RotationDirection } from '../assets/OrientationResolver';

const ENEMY_SPRITE_Y = 0.72;

export class EnemyPool {
  readonly group = new THREE.Group();

  private readonly assets: ClaimJumperAssets = createClaimJumperAssets();
  private readonly enemies: ClaimJumperEnemy[] = [];
  private readonly renderParts: THREE.InstancedMesh[] = [];
  private readonly sackMesh = new THREE.InstancedMesh(
    this.assets.sackGeometry,
    this.assets.sackMaterial,
    Balance.enemy.poolSize,
  );
  private readonly hitFlashGeometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly hitFlashMaterial = new THREE.MeshBasicMaterial({
    color: '#fff8e8',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  private readonly hitFlashes = new THREE.InstancedMesh(this.hitFlashGeometry, this.hitFlashMaterial, Balance.enemy.poolSize);
  private readonly generatedSprites = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperSprites',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: 2,
    onLoaded: () => this.setProceduralVisible(false),
  });
  private readonly generatedSpriteFades = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperSpriteFades',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: 2.01,
  });
  private readonly spriteAnimator = new SpriteAnimator(
    assetSlots.charClaimJumper,
    this.generatedSprites.material,
    undefined,
    this.generatedSpriteFades.material,
  );
  private readonly thiefSprites = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperThiefSprites',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: 2,
  });
  private readonly thiefSpriteFades = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
    name: 'GeneratedClaimJumperThiefSpriteFades',
    y: ENEMY_SPRITE_Y,
    scale: [1.55, 1.55],
    renderOrder: 2.01,
  });
  private readonly thiefSpriteAnimator = new SpriteAnimator(
    assetSlots.charClaimJumper,
    this.thiefSprites.material,
    undefined,
    this.thiefSpriteFades.material,
  );
  private readonly localMatrices: THREE.Matrix4[] = [];
  private readonly cells: ClaimJumperEnemy[][] = [];
  private readonly touchedCells: number[] = [];
  private readonly baseMatrix = new THREE.Matrix4();
  private readonly instanceMatrix = new THREE.Matrix4();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly syncObject = new THREE.Object3D();
  private readonly warmHitFlashPosition = new THREE.Vector3();
  private readonly sackLocalMatrix = new THREE.Matrix4();
  private readonly normalPonchoColor = new THREE.Color('#a0522d');
  private readonly carryingPonchoColor = new THREE.Color('#5b8a8a');
  private readonly wreckerPonchoColor = new THREE.Color('#8b7d3c');
  private readonly gridSize: number;
  private readonly gridMin: number;
  private readonly gridMax: number;
  private readonly cellSize: number;
  private active = 0;
  private activeHitFlashes = 0;
  private warmHitFlashFrames = 0;

  constructor() {
    this.group.name = 'EnemyPool';
    this.cellSize = Balance.enemy.spatialHashCellSize;
    this.gridMin = Balance.enemy.spatialHashWorldMin;
    this.gridMax = Balance.enemy.spatialHashWorldMax;
    this.gridSize = Math.ceil((this.gridMax - this.gridMin) / this.cellSize);
    this.createRenderParts();
    this.createSackMesh();
    this.createHitFlashMesh();
    this.group.add(this.generatedSprites.group, this.generatedSpriteFades.group, this.thiefSprites.group, this.thiefSpriteFades.group);

    for (let i = 0; i < this.gridSize * this.gridSize; i += 1) {
      this.cells.push([]);
    }

    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      const enemy = new ClaimJumperEnemy(i, this.assets);
      this.enemies.push(enemy);
    }
    this.syncInstances();
  }

  get activeCount(): number {
    return this.active;
  }

  get capacity(): number {
    return this.enemies.length;
  }

  get all(): readonly ClaimJumperEnemy[] {
    return this.enemies;
  }

  get activeFlashCount(): number {
    return this.activeHitFlashes;
  }

  get hitFlashCount(): number {
    let total = 0;
    for (const enemy of this.enemies) total += enemy.hitFlashCount;
    return total;
  }

  warmHitFlashes(position: THREE.Vector3): Promise<void> {
    this.warmHitFlashPosition.copy(position);
    this.warmHitFlashFrames = 2;
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
  }

  spawn(position: THREE.Vector3, params: EnemySpawnParams = {}): ClaimJumperEnemy | null {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) continue;
      enemy.spawn(position, params);
      this.active += 1;
      this.syncEnemyInstance(enemy);
      return enemy;
    }
    return null;
  }

  update(
    delta: number,
    heroPosition: THREE.Vector3,
    onContact: (enemy: ClaimJumperEnemy) => void,
    blockers: readonly PalisadeBlocker[] = [],
    thiefContext?: ThiefUpdateContext,
    wreckerContext?: WreckerUpdateContext,
  ): void {
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
            if (other === enemy || !other.isAlive) continue;
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

      if (enemy.update(delta, heroPosition, separationX, separationZ, blockers, thiefContext, wreckerContext)) {
        onContact(enemy);
      }
    }
    this.syncInstances();
    this.syncHitFlashes();
    const normalAnimation = this.activeAnimation(false);
    const thiefAnimation = this.activeAnimation(true);
    const updateNormalSprites = () =>
      this.spriteAnimator.update(delta, normalAnimation.clip, normalAnimation.active ? normalAnimation.orientation : 'side');
    const updateThiefSprites = () =>
      this.thiefSpriteAnimator.update(delta, thiefAnimation.clip, thiefAnimation.active ? thiefAnimation.orientation : 'side');
    if (normalAnimation.active || !thiefAnimation.active) {
      updateThiefSprites();
      updateNormalSprites();
    } else {
      updateNormalSprites();
      updateThiefSprites();
    }
    this.syncSpriteVisuals();
  }

  recycle(enemy: ClaimJumperEnemy): void {
    if (!enemy.isAlive) return;
    enemy.recycle();
    this.active = Math.max(0, this.active - 1);
    this.syncEnemyInstance(enemy);
    this.syncHitFlashes();
  }

  recycleAll(): void {
    for (const enemy of this.enemies) {
      enemy.recycle();
    }
    this.active = 0;
    this.clearSpatialHash();
    this.syncInstances();
    this.syncHitFlashes();
  }

  dispose(): void {
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    this.generatedSprites.dispose();
    this.generatedSpriteFades.dispose();
    this.spriteAnimator.dispose();
    this.thiefSprites.dispose();
    this.thiefSpriteFades.dispose();
    this.thiefSpriteAnimator.dispose();
    this.hitFlashGeometry.dispose();
    this.hitFlashMaterial.dispose();
    disposeClaimJumperAssets(this.assets);
  }

  private activeAnimation(thieves: boolean): { clip: CharacterSpriteClip; orientation: RotationDirection; active: boolean } {
    if (thieves) {
      for (const enemy of this.enemies) {
        if (enemy.isAlive && enemy.isThief && enemy.animationClip === 'grab') {
          return { clip: 'grab', orientation: enemy.animationOrientation, active: true };
        }
      }
      for (const enemy of this.enemies) {
        if (enemy.isAlive && enemy.isThief && enemy.animationClip === 'flee') {
          return { clip: 'flee', orientation: enemy.animationOrientation, active: true };
        }
      }
    }
    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.isThief === thieves) {
        return { clip: enemy.animationClip, orientation: enemy.animationOrientation, active: true };
      }
    }
    return { clip: 'idle', orientation: 's', active: false };
  }

  private createRenderParts(): void {
    this.localMatrices.push(
      this.createLocalMatrix(new THREE.Vector3(0, 0.012, 0), new THREE.Euler(-Math.PI / 2, 0, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 0.54, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 0.93, -0.34)),
      this.createLocalMatrix(new THREE.Vector3(0, 1.15, 0)),
      this.createLocalMatrix(new THREE.Vector3(0, 1.32, 0)),
    );

    this.renderParts.push(
      new THREE.InstancedMesh(this.assets.shadowGeometry, this.assets.shadowMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.ponchoGeometry, this.assets.ponchoMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.faceGeometry, this.assets.faceMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.brimGeometry, this.assets.hatMaterial, Balance.enemy.poolSize),
      new THREE.InstancedMesh(this.assets.crownGeometry, this.assets.hatMaterial, Balance.enemy.poolSize),
    );

    for (const part of this.renderParts) {
      part.count = Balance.enemy.poolSize;
      part.castShadow = false;
      part.receiveShadow = false;
      part.frustumCulled = false;
      tagPlaceholder(part, assetSlots.charClaimJumper);
      this.group.add(part);
    }
    this.renderParts[0].renderOrder = -1;
  }

  private createSackMesh(): void {
    this.sackLocalMatrix.copy(this.createLocalMatrix(new THREE.Vector3(-0.38, 0.66, 0.12), new THREE.Euler(0.2, 0.1, -0.38)));
    this.sackMesh.count = Balance.enemy.poolSize;
    this.sackMesh.frustumCulled = false;
    this.sackMesh.renderOrder = 3;
    tagPlaceholder(this.sackMesh, assetSlots.charClaimJumper);
    this.group.add(this.sackMesh);
    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      this.sackMesh.setMatrixAt(i, this.hiddenMatrix);
    }
    this.sackMesh.instanceMatrix.needsUpdate = true;
  }

  private createHitFlashMesh(): void {
    this.hitFlashes.count = Balance.enemy.poolSize;
    this.hitFlashes.frustumCulled = false;
    this.hitFlashes.renderOrder = 4;
    this.hitFlashes.visible = false;
    tagPlaceholder(this.hitFlashes, assetSlots.charClaimJumper);
    this.group.add(this.hitFlashes);
    for (let i = 0; i < Balance.enemy.poolSize; i += 1) {
      this.hitFlashes.setMatrixAt(i, this.hiddenMatrix);
    }
    this.hitFlashes.instanceMatrix.needsUpdate = true;
  }

  private createLocalMatrix(position: THREE.Vector3, rotation = new THREE.Euler()): THREE.Matrix4 {
    this.syncObject.position.copy(position);
    this.syncObject.rotation.copy(rotation);
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    return this.syncObject.matrix.clone();
  }

  private syncInstances(): void {
    for (const enemy of this.enemies) {
      this.syncEnemyInstance(enemy);
    }
  }

  private syncEnemyInstance(enemy: ClaimJumperEnemy): void {
    const motion = enemy.isThief ? this.thiefSpriteAnimator.motion : this.spriteAnimator.motion;
    this.syncObject.position.copy(enemy.group.position);
    this.syncObject.position.y += motion.bobOffset;
    this.syncObject.rotation.set(0, enemy.group.rotation.y, 0);
    this.syncObject.rotation.z = motion.leanRad;
    this.syncObject.scale.set(1, 1, 1);
    this.syncObject.updateMatrix();
    this.baseMatrix.copy(enemy.isAlive ? this.syncObject.matrix : this.hiddenMatrix);

    for (let i = 0; i < this.renderParts.length; i += 1) {
      const part = this.renderParts[i];
      const localMatrix = this.localMatrices[i];
      if (!part || !localMatrix) continue;
      this.instanceMatrix.multiplyMatrices(this.baseMatrix, localMatrix);
      part.setMatrixAt(enemy.id, this.instanceMatrix);
      if (i === 1) {
        part.setColorAt(
          enemy.id,
          enemy.carriedAmount > 0 ? this.carryingPonchoColor : enemy.isWrecker ? this.wreckerPonchoColor : this.normalPonchoColor,
        );
        if (part.instanceColor) part.instanceColor.needsUpdate = true;
      }
      part.instanceMatrix.needsUpdate = true;
    }
    this.instanceMatrix.multiplyMatrices(enemy.isAlive && enemy.carriedAmount > 0 ? this.syncObject.matrix : this.hiddenMatrix, this.sackLocalMatrix);
    this.sackMesh.setMatrixAt(enemy.id, this.instanceMatrix);
    this.sackMesh.instanceMatrix.needsUpdate = true;
    this.syncEnemySprite(enemy);
  }

  private syncSpriteVisuals(): void {
    const normalMotion = this.spriteAnimator.motion;
    const thiefMotion = this.thiefSpriteAnimator.motion;
    this.generatedSprites.material.rotation = normalMotion.leanRad;
    this.generatedSpriteFades.material.rotation = normalMotion.leanRad;
    this.thiefSprites.material.rotation = thiefMotion.leanRad;
    this.thiefSpriteFades.material.rotation = thiefMotion.leanRad;
    for (const enemy of this.enemies) this.syncEnemySprite(enemy);
  }

  private syncEnemySprite(enemy: ClaimJumperEnemy): void {
    const normalVisible = enemy.isAlive && !enemy.isThief;
    const thiefVisible = enemy.isAlive && enemy.isThief;
    // ponytail: batch fades draw every live enemy twice; skip them for stress-sized packs unless sprites get instanced.
    const showFade = this.active <= 64;
    const normalMotion = this.spriteAnimator.motion;
    const thiefMotion = this.thiefSpriteAnimator.motion;
    this.generatedSprites.set(enemy.id, enemy.group.position, normalVisible);
    this.generatedSpriteFades.set(enemy.id, enemy.group.position, showFade && normalVisible && this.spriteAnimator.overlayActive);
    this.thiefSprites.set(enemy.id, enemy.group.position, thiefVisible);
    this.thiefSpriteFades.set(enemy.id, enemy.group.position, showFade && thiefVisible && this.thiefSpriteAnimator.overlayActive);
    this.applySpriteBob(this.generatedSprites.group.children[enemy.id], normalMotion.bobOffset);
    this.applySpriteBob(this.generatedSpriteFades.group.children[enemy.id], normalMotion.bobOffset);
    this.applySpriteBob(this.thiefSprites.group.children[enemy.id], thiefMotion.bobOffset);
    this.applySpriteBob(this.thiefSpriteFades.group.children[enemy.id], thiefMotion.bobOffset);
  }

  private syncHitFlashes(): void {
    this.activeHitFlashes = 0;
    for (const enemy of this.enemies) {
      const flash = enemy.hitFlashRemaining;
      if (!enemy.isAlive || flash <= 0) {
        this.hitFlashes.setMatrixAt(enemy.id, this.hiddenMatrix);
        continue;
      }

      const t = Math.min(1, flash / Math.max(0.001, Balance.combatReadability.enemyFlashSeconds));
      const scale = 1 + t * Balance.combatReadability.enemyFlashIntensity * 0.18;
      this.syncObject.position.set(enemy.group.position.x, enemy.group.position.y + ENEMY_SPRITE_Y, enemy.group.position.z);
      this.syncObject.rotation.set(0, enemy.group.rotation.y, 0);
      this.syncObject.scale.set(1.55 * scale, 1.42 * scale, 0.08);
      this.syncObject.updateMatrix();
      this.hitFlashes.setMatrixAt(enemy.id, this.syncObject.matrix);
      this.activeHitFlashes += 1;
    }
    if (this.activeHitFlashes === 0 && this.warmHitFlashFrames > 0) {
      this.syncObject.position.set(this.warmHitFlashPosition.x, this.warmHitFlashPosition.y + ENEMY_SPRITE_Y, this.warmHitFlashPosition.z);
      this.syncObject.rotation.set(0, 0, 0);
      this.syncObject.scale.set(0.001, 0.001, 0.001);
      this.syncObject.updateMatrix();
      this.hitFlashes.setMatrixAt(0, this.syncObject.matrix);
      this.activeHitFlashes = 1;
    }
    this.warmHitFlashFrames = Math.max(0, this.warmHitFlashFrames - 1);
    this.hitFlashes.visible = this.activeHitFlashes > 0;
    this.hitFlashes.instanceMatrix.needsUpdate = true;
  }

  private applySpriteBob(sprite: THREE.Object3D | undefined, bobOffset: number): void {
    if (sprite) sprite.position.y = ENEMY_SPRITE_Y + bobOffset;
  }

  private setProceduralVisible(visible: boolean): void {
    for (const part of this.renderParts) part.visible = visible;
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
