import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { attachGeneratedSprite, type GeneratedSprite } from '../assets/generated';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import type { Intents } from '../core/InputController';
import type { TerrainBounds, TerrainSample } from '../world/Terrain';
import { hasElevationTile, resolveTerrainMove, terrainSpeedMultiplier } from '../sim/TileHeight';

export type TerrainSampler = (x: number, z: number) => TerrainSample;

export class Hero {
  readonly group = new THREE.Group();
  readonly velocity = new THREE.Vector3();
  readonly renderPosition = new THREE.Vector3();
  hp: number = Balance.hero.maxHp;

  private readonly interpolationGroup = new THREE.Group();
  private readonly visualGroup = new THREE.Group();
  private readonly placeholderGroup = new THREE.Group();
  private readonly generatedSprite: GeneratedSprite;
  private readonly spriteAnimator: SpriteAnimator;
  private readonly orientationResolver = new OrientationResolver();
  private readonly attackOrientationResolver = new OrientationResolver();
  private attackDirection: RotationDirection = 'e';
  private facingAngleDeg = 0;
  private hasFacingAngle = false;
  private maxHpBonus = 0;
  private moveSpeedMult = 1;
  private attackPoseRemaining = 0;
  private readonly targetVelocity = new THREE.Vector3();
  private readonly nextPosition = new THREE.Vector3();
  private readonly previousPosition = new THREE.Vector3();
  private previousRotationY = 0;
  private iframeRemaining = 0;
  private readonly bodyGeometry = new THREE.CapsuleGeometry(0.34, 0.78, 8, 16);
  private readonly coatGeometry = new THREE.BoxGeometry(0.42, 0.34, 0.12);
  private readonly hatGeometry = new THREE.ConeGeometry(0.48, 0.34, 18);
  private readonly brimGeometry = new THREE.CylinderGeometry(0.56, 0.56, 0.055, 24);
  private readonly lampGeometry = new THREE.SphereGeometry(0.105, 12, 8);
  private readonly bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#c4883a',
    roughness: 0.72,
    metalness: 0.03,
  });
  private readonly sleeveMaterial = new THREE.MeshStandardMaterial({
    color: '#e8d5a8',
    roughness: 0.82,
    metalness: 0.02,
  });
  private readonly brassMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    roughness: 0.46,
    metalness: 0.38,
  });
  private readonly lampMaterial = new THREE.MeshStandardMaterial({
    color: '#5b8a8a',
    emissive: '#5b8a8a',
    emissiveIntensity: 1.35,
    roughness: 0.24,
    metalness: 0.05,
  });

  constructor() {
    this.group.name = 'HomesteaderHero';
    this.interpolationGroup.name = 'HomesteaderHeroInterpolation';
    this.visualGroup.name = 'HomesteaderHeroVisuals';
    this.placeholderGroup.name = 'HomesteaderHeroPlaceholder';

    const body = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    body.receiveShadow = true;

    const coat = new THREE.Mesh(this.coatGeometry, this.sleeveMaterial);
    coat.position.set(0, 0.76, -0.28);
    coat.castShadow = true;

    const brim = new THREE.Mesh(this.brimGeometry, this.brassMaterial);
    brim.position.y = 1.32;
    brim.castShadow = true;

    const hat = new THREE.Mesh(this.hatGeometry, this.brassMaterial);
    hat.position.y = 1.55;
    hat.castShadow = true;

    const lamp = new THREE.Mesh(this.lampGeometry, this.lampMaterial);
    lamp.position.set(0, 0.86, -0.39);
    lamp.castShadow = true;

    const glow = new THREE.PointLight('#5b8a8a', 0.55, 2.2);
    glow.position.copy(lamp.position);

    this.placeholderGroup.add(body, coat, brim, hat, lamp, glow);
    this.visualGroup.add(this.placeholderGroup);
    this.interpolationGroup.add(this.visualGroup);
    this.group.add(this.interpolationGroup);
    this.generatedSprite = attachGeneratedSprite(this.visualGroup, assetSlots.charHero, {
      name: 'GeneratedHeroHomesteader',
      position: [0, 0.9, 0],
      scale: [1.85, 1.85],
      renderOrder: RenderLayers.gameplay,
      onLoaded: () => {
        this.placeholderGroup.visible = false;
      },
    });
    this.spriteAnimator = new SpriteAnimator(
      assetSlots.charHero,
      this.generatedSprite.sprite.material as THREE.SpriteMaterial,
      this.generatedSprite.sprite,
    );
    tagPlaceholder(this.group, assetSlots.charHero);
    this.snapRenderState();
  }

  update(dt: number, intents: Intents, terrain: { bounds: TerrainBounds; sample: TerrainSampler }, panning = false): void {
    this.iframeRemaining = Math.max(0, this.iframeRemaining - dt);
    this.attackPoseRemaining = Math.max(0, this.attackPoseRemaining - dt);

    const moveX = finiteOrZero(intents.move.x);
    const moveY = finiteOrZero(intents.move.y);
    const currentSample = terrain.sample(this.group.position.x, this.group.position.z);
    const slopeSpeed = terrainSpeedMultiplier(this.group.position.x, this.group.position.z, moveX, moveY);
    this.targetVelocity
      .set(moveX, 0, moveY)
      .multiplyScalar(Balance.hero.speed * this.moveSpeedMult * currentSample.speedMul * slopeSpeed);

    const rate = this.targetVelocity.lengthSq() > this.velocity.lengthSq() ? Balance.hero.accel : Balance.hero.decel;
    this.velocity.lerp(this.targetVelocity, 1 - Math.exp(-rate * dt));
    if (!Number.isFinite(this.velocity.x) || !Number.isFinite(this.velocity.z)) this.velocity.set(0, 0, 0);

    this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, dt);
    if (!Number.isFinite(this.nextPosition.x) || !Number.isFinite(this.nextPosition.z)) {
      this.nextPosition.copy(this.group.position);
      this.velocity.set(0, 0, 0);
    }
    this.nextPosition.x = THREE.MathUtils.clamp(
      this.nextPosition.x,
      terrain.bounds.minX + Balance.hero.radius,
      terrain.bounds.maxX - Balance.hero.radius,
    );
    this.nextPosition.z = THREE.MathUtils.clamp(
      this.nextPosition.z,
      terrain.bounds.minZ + Balance.hero.radius,
      terrain.bounds.maxZ - Balance.hero.radius,
    );

    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    if (terrain.sample(this.nextPosition.x, this.nextPosition.z).walkable) {
      this.group.position.x = this.nextPosition.x;
      this.group.position.z = this.nextPosition.z;
    } else if (hasElevationTile()) {
      const resolved = resolveTerrainMove(previousX, previousZ, this.nextPosition.x, this.nextPosition.z, (x, z) => terrain.sample(x, z).walkable);
      this.group.position.x = resolved.x;
      this.group.position.z = resolved.z;
      if (dt > 0) {
        this.velocity.x = (resolved.x - previousX) / dt;
        this.velocity.z = (resolved.z - previousZ) / dt;
      }
    } else {
      if (terrain.sample(this.nextPosition.x, previousZ).walkable) this.group.position.x = this.nextPosition.x;
      else this.velocity.x = 0;
      if (terrain.sample(previousX, this.nextPosition.z).walkable) this.group.position.z = this.nextPosition.z;
      else this.velocity.z = 0;
    }
    const actualSpeed = dt > 0 ? Math.hypot(this.group.position.x - previousX, this.group.position.z - previousZ) / dt : 0;

    if (this.velocity.lengthSq() > 0.0025) {
      this.group.rotation.y = Math.atan2(this.velocity.x, -this.velocity.z);
    }
    const speedSq = this.velocity.lengthSq();
    const intentSpeedSq = this.targetVelocity.lengthSq();
    const moving = speedSq > 0.0025 || intentSpeedSq > 0.0025;
    const heading = intentSpeedSq > 0.0025 ? this.targetVelocity : this.velocity;
    const direction = moving ? this.orientationResolver.resolve(...this.smoothedHeadingVector(dt, heading)) : this.orientationResolver.idleDirection();
    const clip = this.attackPoseRemaining > 0 ? 'attack' : panning ? 'pan' : moving ? 'walk' : 'idle';
    this.spriteAnimator.update(dt, clip, this.attackPoseRemaining > 0 ? this.attackDirection : direction, false, actualSpeed);
    this.applyProceduralMotion();
  }

  playAttackPose(target: THREE.Vector3): void {
    this.attackOrientationResolver.reset();
    this.attackDirection = this.attackOrientationResolver.resolve(target.x - this.group.position.x, target.z - this.group.position.z);
    this.attackPoseRemaining = 0.5;
  }

  get maxHp(): number {
    return Balance.hero.maxHp + this.maxHpBonus;
  }

  captureRenderState(): void {
    this.previousPosition.copy(this.group.position);
    this.previousRotationY = this.group.rotation.y;
  }

  applyRenderInterpolation(alpha: number, terrainHeightAt: (x: number, z: number) => number): void {
    const amount = THREE.MathUtils.clamp(alpha, 0, 1);
    this.renderPosition.lerpVectors(this.previousPosition, this.group.position, amount);
    this.renderPosition.y = terrainHeightAt(this.renderPosition.x, this.renderPosition.z);

    const currentRotation = this.group.rotation.y;
    const worldOffsetX = this.renderPosition.x - this.group.position.x;
    const worldOffsetZ = this.renderPosition.z - this.group.position.z;
    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);
    this.interpolationGroup.position.set(
      worldOffsetX * cos - worldOffsetZ * sin,
      this.renderPosition.y - this.group.position.y,
      worldOffsetX * sin + worldOffsetZ * cos,
    );
    const renderRotation = this.previousRotationY + signedAngleDeltaRadians(this.previousRotationY, currentRotation) * amount;
    this.interpolationGroup.rotation.y = signedAngleDeltaRadians(currentRotation, renderRotation);
  }

  snapRenderState(): void {
    this.previousPosition.copy(this.group.position);
    this.previousRotationY = this.group.rotation.y;
    this.renderPosition.copy(this.group.position);
    this.interpolationGroup.position.set(0, 0, 0);
    this.interpolationGroup.rotation.set(0, 0, 0);
  }

  get hasIframes(): boolean {
    return this.iframeRemaining > 0;
  }

  get iframeSecondsRemaining(): number {
    return this.iframeRemaining;
  }

  restoreIframes(seconds: number): void {
    this.iframeRemaining = Math.max(0, seconds);
  }

  takeDamage(amount: number): { applied: boolean; died: boolean } {
    if (this.iframeRemaining > 0 || this.hp <= 0) {
      return { applied: false, died: this.hp <= 0 };
    }

    this.hp = Math.max(0, this.hp - amount);
    this.iframeRemaining = Balance.hero.iframes;
    return { applied: true, died: this.hp <= 0 };
  }

  applyStats(maxHpBonus: number, moveSpeedMult: number): void {
    const previousMax = this.maxHp;
    this.maxHpBonus = maxHpBonus;
    this.moveSpeedMult = moveSpeedMult;
    if (this.maxHp < previousMax) this.hp = Math.min(this.hp, this.maxHp);
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  resetRun(position: THREE.Vector3): void {
    this.maxHpBonus = 0;
    this.moveSpeedMult = 1;
    this.hp = this.maxHp;
    this.iframeRemaining = 0;
    this.attackPoseRemaining = 0;
    this.velocity.set(0, 0, 0);
    this.targetVelocity.set(0, 0, 0);
    this.facingAngleDeg = 0;
    this.hasFacingAngle = false;
    this.orientationResolver.reset();
    this.attackOrientationResolver.reset();
    this.attackDirection = 'e';
    this.group.position.copy(position);
    this.group.rotation.y = 0;
    this.spriteAnimator.reset('idle');
    this.applyProceduralMotion();
    this.snapRenderState();
  }

  setIdentityTint(tint: string | null): void {
    const spriteMaterial = this.generatedSprite.sprite.material as THREE.SpriteMaterial;
    if (!tint) {
      this.bodyMaterial.color.set('#c4883a');
      this.sleeveMaterial.color.set('#e8d5a8');
      this.brassMaterial.color.set('#8b7d3c');
      this.lampMaterial.color.set('#5b8a8a');
      this.lampMaterial.emissive.set('#5b8a8a');
      spriteMaterial.color.set('#ffffff');
      return;
    }

    this.bodyMaterial.color.set(tint);
    this.sleeveMaterial.color.set('#f5e6c8');
    this.brassMaterial.color.set(tint);
    this.lampMaterial.color.set('#83ded7');
    this.lampMaterial.emissive.set('#2f8f85');
    spriteMaterial.color.set(tint);
  }

  dispose(): void {
    this.bodyGeometry.dispose();
    this.coatGeometry.dispose();
    this.hatGeometry.dispose();
    this.brimGeometry.dispose();
    this.lampGeometry.dispose();
    this.bodyMaterial.dispose();
    this.sleeveMaterial.dispose();
    this.brassMaterial.dispose();
    this.lampMaterial.dispose();
    this.spriteAnimator.dispose();
    this.generatedSprite.dispose();
  }

  private smoothedHeadingVector(dt: number, heading: THREE.Vector3): [number, number] {
    const target = normalizeDegrees((Math.atan2(heading.x, heading.z) * 180) / Math.PI);
    if (!this.hasFacingAngle) {
      this.facingAngleDeg = target;
      this.hasFacingAngle = true;
    } else {
      const maxStep = Math.min(Balance.sprite.turnRateDegPerS * dt, 30);
      this.facingAngleDeg = normalizeDegrees(this.facingAngleDeg + THREE.MathUtils.clamp(signedAngleDelta(this.facingAngleDeg, target), -maxStep, maxStep));
    }
    const radians = THREE.MathUtils.degToRad(this.facingAngleDeg);
    return [Math.sin(radians), Math.cos(radians)];
  }

  private applyProceduralMotion(): void {
    const motion = this.spriteAnimator.motion;
    this.visualGroup.position.y = motion.bobOffset;
    this.placeholderGroup.rotation.z = motion.leanRad;
    (this.generatedSprite.sprite.material as THREE.SpriteMaterial).rotation = motion.leanRad;
  }
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function signedAngleDelta(from: number, to: number): number {
  const delta = ((to - from + 540) % 360) - 180;
  return delta === -180 ? 180 : delta;
}

function signedAngleDeltaRadians(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
