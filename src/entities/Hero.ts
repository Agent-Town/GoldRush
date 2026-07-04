import * as THREE from 'three';
import { OrientationResolver } from '../assets/OrientationResolver';
import { attachGeneratedSprite, type GeneratedSprite } from '../assets/generated';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import type { Intents } from '../core/InputController';
import type { TerrainBounds, TerrainSample } from '../world/Terrain';

export type TerrainSampler = (x: number, z: number) => TerrainSample;

export class Hero {
  readonly group = new THREE.Group();
  readonly velocity = new THREE.Vector3();
  hp: number = Balance.hero.maxHp;

  private readonly placeholderGroup = new THREE.Group();
  private readonly generatedSprite: GeneratedSprite;
  private readonly spriteAnimator: SpriteAnimator;
  private readonly orientationResolver = new OrientationResolver();
  private maxHpBonus = 0;
  private moveSpeedMult = 1;
  private readonly targetVelocity = new THREE.Vector3();
  private readonly nextPosition = new THREE.Vector3();
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
    this.group.add(this.placeholderGroup);
    this.generatedSprite = attachGeneratedSprite(this.group, assetSlots.charHero, {
      name: 'GeneratedHeroHomesteader',
      position: [0, 0.9, 0],
      scale: [1.85, 1.85],
      renderOrder: 3,
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
  }

  update(dt: number, intents: Intents, terrain: { bounds: TerrainBounds; sample: TerrainSampler }): void {
    this.iframeRemaining = Math.max(0, this.iframeRemaining - dt);

    const currentSample = terrain.sample(this.group.position.x, this.group.position.z);
    this.targetVelocity
      .set(intents.move.x, 0, intents.move.y)
      .multiplyScalar(Balance.hero.speed * this.moveSpeedMult * currentSample.speedMul);

    const rate = this.targetVelocity.lengthSq() > this.velocity.lengthSq() ? Balance.hero.accel : Balance.hero.decel;
    this.velocity.lerp(this.targetVelocity, 1 - Math.exp(-rate * dt));

    this.nextPosition.copy(this.group.position).addScaledVector(this.velocity, dt);
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
    } else {
      if (terrain.sample(this.nextPosition.x, previousZ).walkable) this.group.position.x = this.nextPosition.x;
      else this.velocity.x = 0;
      if (terrain.sample(previousX, this.nextPosition.z).walkable) this.group.position.z = this.nextPosition.z;
      else this.velocity.z = 0;
    }

    if (this.velocity.lengthSq() > 0.0025) {
      this.group.rotation.y = Math.atan2(this.velocity.x, -this.velocity.z);
    }
    const speedSq = this.velocity.lengthSq();
    const moving = speedSq > 0.0025;
    const direction = moving ? this.orientationResolver.resolve(this.velocity.x, this.velocity.z) : this.orientationResolver.idleDirection();
    this.spriteAnimator.update(dt, moving ? 'walk' : 'idle', direction);
  }

  get maxHp(): number {
    return Balance.hero.maxHp + this.maxHpBonus;
  }

  get hasIframes(): boolean {
    return this.iframeRemaining > 0;
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
    this.velocity.set(0, 0, 0);
    this.targetVelocity.set(0, 0, 0);
    this.orientationResolver.reset();
    this.group.position.copy(position);
    this.group.rotation.y = 0;
    this.spriteAnimator.reset('idle');
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
}
