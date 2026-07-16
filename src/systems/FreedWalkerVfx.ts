import * as THREE from 'three';
import { GeneratedSpriteBatch } from '../assets/generated';
import { rotationDirections } from '../assets/OrientationResolver';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { assetSlots, type AssetSlotId } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { RUN_CAST_SCALE } from '../entities/runCastScale';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import * as Terrain from '../world/Terrain';
import type { CombatVfx } from './CombatVfx';

export type FreedWalkerBehavior = 'run' | 'slump';

export const FREED_WALKER_BEHAVIORS = {
  rail_tough: 'run',
  steam_wrecker: 'slump',
  coal_thief: 'run',
  fevered_saboteur: 'run',
  night_runner: 'run',
  moth_swarm: 'run',
  motor_gang: 'run',
  corsair_skiff: 'slump',
} as const satisfies Record<string, FreedWalkerBehavior>;

export type FreedWalkerDiagnostics = {
  spawned: number;
  active: number;
  capSkips: number;
};

type VisualFamily = 'base' | 'thief' | 'rail_tough' | 'steam_wrecker' | 'coal_thief';
type FamilyPresentation = {
  key: VisualFamily;
  sprites: GeneratedSpriteBatch;
  animator: SpriteAnimator;
};

const MAX_CAPACITY = 10;
const STAND_SECONDS = 0.5;
const MACHINE_LIFETIME = 2.2;
const MOTH_MOTES = 3;
const RUN_DUST_PUFFS = 2;
const SHUTDOWN_SMOKE_PUFFS = 2;
const FAMILY_DEFINITIONS: ReadonlyArray<{ key: VisualFamily; slot: AssetSlotId }> = [
  { key: 'base', slot: assetSlots.charBanditBase },
  { key: 'thief', slot: assetSlots.charBanditThief },
  { key: 'rail_tough', slot: assetSlots.charE2RailTough },
  { key: 'steam_wrecker', slot: assetSlots.charE2SteamWrecker },
  { key: 'coal_thief', slot: assetSlots.charE2CoalThief },
];

export class FreedWalkerVfx {
  readonly group = new THREE.Group();
  readonly diagnostics: FreedWalkerDiagnostics = { spawned: 0, active: 0, capSkips: 0 };

  private readonly cap = freedWalkerCap();
  private readonly active = Array<boolean>(MAX_CAPACITY).fill(false);
  private readonly ages = new Float32Array(MAX_CAPACITY);
  private readonly lifetimes = new Float32Array(MAX_CAPACITY);
  private readonly startX = new Float32Array(MAX_CAPACITY);
  private readonly startZ = new Float32Array(MAX_CAPACITY);
  private readonly directionX = new Float32Array(MAX_CAPACITY);
  private readonly directionZ = new Float32Array(MAX_CAPACITY);
  private readonly edgeDistance = new Float32Array(MAX_CAPACITY);
  private readonly speeds = new Float32Array(MAX_CAPACITY);
  private readonly scales = new Float32Array(MAX_CAPACITY);
  private readonly opacities = new Float32Array(MAX_CAPACITY);
  private readonly rotations = new Float32Array(MAX_CAPACITY);
  private readonly familyIndex = new Int8Array(MAX_CAPACITY).fill(-1);
  private readonly behaviors = Array<FreedWalkerBehavior>(MAX_CAPACITY).fill('run');
  private readonly moths = Array<boolean>(MAX_CAPACITY).fill(false);
  private readonly position = new THREE.Vector3();
  private readonly families: FamilyPresentation[];
  private readonly mothGeometry = new THREE.TetrahedronGeometry(0.14, 0);
  private readonly mothMaterial = new THREE.MeshStandardMaterial({
    color: '#e8d8b0',
    emissive: '#c4883a',
    emissiveIntensity: 0.5,
    roughness: 0.82,
    transparent: true,
  });
  private readonly mothMesh = new THREE.InstancedMesh(this.mothGeometry, this.mothMaterial, MAX_CAPACITY * MOTH_MOTES);
  private readonly mothObject = new THREE.Object3D();
  private readonly runDustGeometry = new THREE.CircleGeometry(0.32, 8);
  private readonly runDustMaterial = new THREE.MeshBasicMaterial({ color: '#d8b06c', transparent: true, opacity: 0.46, depthWrite: false });
  private readonly runDustMesh = new THREE.InstancedMesh(this.runDustGeometry, this.runDustMaterial, MAX_CAPACITY * RUN_DUST_PUFFS);
  private readonly runDustObject = new THREE.Object3D();
  private readonly shutdownSmokeGeometry = new THREE.DodecahedronGeometry(0.16, 0);
  private readonly shutdownSmokeMaterial = new THREE.MeshBasicMaterial({ color: '#493f34', transparent: true, opacity: 0.52, depthWrite: false });
  private readonly shutdownSmokeMesh = new THREE.InstancedMesh(this.shutdownSmokeGeometry, this.shutdownSmokeMaterial, MAX_CAPACITY * SHUTDOWN_SMOKE_PUFFS);
  private readonly shutdownSmokeObject = new THREE.Object3D();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly originalVfxUpdate: CombatVfx['update'];
  private diagnosticsValue: ThreeGameDiagnostics | undefined;

  constructor(private readonly vfx: CombatVfx) {
    this.group.name = 'FreedWalkerVfx';
    this.families = FAMILY_DEFINITIONS.map(({ key, slot }) => {
      const sprites = new GeneratedSpriteBatch(slot, MAX_CAPACITY, {
        name: `FreedWalker-${key}`,
        y: 0.72,
        scale: [1.28, 1.55],
        renderOrder: RenderLayers.gameplay,
        lazy: true,
      });
      const animator = new SpriteAnimator(slot, sprites.material);
      for (let index = 0; index < MAX_CAPACITY; index += 1) {
        const sprite = sprites.group.children[index] as THREE.Sprite | undefined;
        if (!sprite) continue;
        const beforeRender = sprite.onBeforeRender.bind(sprite);
        sprite.onBeforeRender = (...args) => {
          beforeRender(...args);
          sprites.material.opacity = this.opacities[index] ?? 1;
          sprites.material.rotation = this.rotations[index] ?? 0;
        };
      }
      this.group.add(sprites.group);
      return { key, sprites, animator };
    });
    this.mothMesh.frustumCulled = false;
    this.mothMesh.renderOrder = RenderLayers.gameplay;
    this.mothMesh.visible = false;
    this.group.add(this.mothMesh);
    this.runDustMesh.frustumCulled = false;
    this.runDustMesh.renderOrder = RenderLayers.gameplay;
    this.runDustMesh.visible = false;
    this.group.add(this.runDustMesh);
    this.shutdownSmokeMesh.frustumCulled = false;
    this.shutdownSmokeMesh.renderOrder = RenderLayers.gameplay;
    this.shutdownSmokeMesh.visible = false;
    this.group.add(this.shutdownSmokeMesh);
    this.vfx.group.add(this.group);
    this.originalVfxUpdate = this.vfx.update.bind(this.vfx);
    this.vfx.update = this.updateWithCombatVfx;
    this.installDiagnosticsSurface();
    this.reset();
  }

  spawn(enemy: ClaimJumperEnemy): boolean {
    if (enemy.eliteKind || enemy.bossGroupId) return false;
    if (this.diagnostics.active >= this.cap) {
      this.diagnostics.capSkips += 1;
      return false;
    }
    const slot = this.active.findIndex((value, index) => index < this.cap && !value);
    if (slot < 0) {
      this.diagnostics.capSkips += 1;
      return false;
    }

    const behavior = behaviorFor(enemy.variantId);
    const family = visualFamilyFor(enemy);
    const direction = nearestEdgeDirection(enemy.position.x, enemy.position.z);
    const speed = Math.max(0.1, enemy.moveSpeed * 1.65);
    this.active[slot] = true;
    this.ages[slot] = 0;
    this.startX[slot] = enemy.position.x;
    this.startZ[slot] = enemy.position.z;
    this.directionX[slot] = direction.x;
    this.directionZ[slot] = direction.z;
    this.edgeDistance[slot] = direction.distance;
    this.speeds[slot] = speed;
    this.scales[slot] = enemy.visualScale * RUN_CAST_SCALE;
    this.opacities[slot] = 1;
    this.rotations[slot] = 0;
    this.behaviors[slot] = behavior;
    this.moths[slot] = enemy.variantId === 'moth_swarm';
    this.familyIndex[slot] = this.moths[slot] ? -1 : this.families.findIndex(({ key }) => key === family);
    this.lifetimes[slot] = behavior === 'slump'
      ? MACHINE_LIFETIME
      : Math.min(4, Math.max(1.6, STAND_SECONDS + direction.distance / speed + 0.3));
    const presentation = this.families[this.familyIndex[slot] ?? -1];
    presentation?.sprites.ensureLoaded();
    this.diagnostics.spawned += 1;
    this.diagnostics.active += 1;
    this.syncSlot(slot);
    return true;
  }

  reset(): void {
    for (let slot = 0; slot < MAX_CAPACITY; slot += 1) this.recycle(slot);
    this.diagnostics.spawned = 0;
    this.diagnostics.active = 0;
    this.diagnostics.capSkips = 0;
    this.syncMoths();
    this.syncRunDust();
    this.syncShutdownSmoke();
    this.publishDiagnostics();
  }

  dispose(): void {
    this.vfx.update = this.originalVfxUpdate;
    this.vfx.group.remove(this.group);
    this.uninstallDiagnosticsSurface();
    for (const family of this.families) {
      family.sprites.dispose();
      family.animator.dispose();
    }
    this.mothGeometry.dispose();
    this.mothMaterial.dispose();
    this.runDustGeometry.dispose();
    this.runDustMaterial.dispose();
    this.shutdownSmokeGeometry.dispose();
    this.shutdownSmokeMaterial.dispose();
  }

  private readonly updateWithCombatVfx = (delta: number): void => {
    this.originalVfxUpdate(delta);
    this.update(delta);
  };

  private update(delta: number): void {
    for (let slot = 0; slot < MAX_CAPACITY; slot += 1) {
      if (!this.active[slot]) continue;
      this.ages[slot] += delta;
      if (this.ages[slot] >= this.lifetimes[slot]) this.recycle(slot);
      else this.syncSlot(slot);
    }
    this.updateAnimations(delta);
    this.syncMoths();
    this.syncRunDust();
    this.syncShutdownSmoke();
  }

  private syncSlot(slot: number): void {
    const age = this.ages[slot] ?? 0;
    const lifetime = this.lifetimes[slot] ?? 1;
    const behavior = this.behaviors[slot] ?? 'run';
    let x = this.startX[slot] ?? 0;
    let z = this.startZ[slot] ?? 0;
    let slump = 0;
    let runStride = 0;
    if (behavior === 'run' && age > STAND_SECONDS) {
      const travel = Math.min((this.edgeDistance[slot] ?? 0) + 1.5, (age - STAND_SECONDS) * (this.speeds[slot] ?? 0));
      x += (this.directionX[slot] ?? 0) * travel;
      z += (this.directionZ[slot] ?? 0) * travel;
      runStride = Math.sin((age - STAND_SECONDS) * 16 + slot * 1.7);
    } else if (behavior === 'slump') {
      const seize = Math.min(1, age / 0.48);
      x += Math.sin(age * 46) * 0.07 * (1 - seize);
      z += Math.cos(age * 39) * 0.05 * (1 - seize);
      slump = THREE.MathUtils.clamp((age - 0.48) / 0.9, 0, 1);
    }
    const fadeStart = lifetime * 0.8;
    const fade = age <= fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / Math.max(0.001, lifetime - fadeStart));
    this.opacities[slot] = fade * (behavior === 'slump' ? 1 - slump * 0.18 : 1);
    this.rotations[slot] = behavior === 'slump' ? slump * 0.92 : runStride * 0.18;
    const runBob = behavior === 'run' ? Math.abs(runStride) * 0.12 : 0;
    this.position.set(x, Terrain.visualY(x, z, runBob - 0.28 * slump), z);
    const family = this.families[this.familyIndex[slot] ?? -1];
    if (!family) return;
    if (behavior === 'slump') family.sprites.material.rotation = this.rotations[slot] ?? 0;
    family.sprites.setTintScalar(slot, behavior === 'slump' ? 1 - slump * 0.42 : 1);
    family.sprites.set(slot, this.position, true);
    const sprite = family.sprites.group.children[slot];
    if (!sprite) return;
    const scale = this.scales[slot] ?? 1;
    const stride = Math.abs(runStride);
    sprite.scale.set(1.55 * scale * (1 + slump * 0.18 + stride * 0.08), 1.55 * scale * (1 - slump * 0.38 - stride * 0.05), 1);
  }

  private updateAnimations(delta: number): void {
    for (let familyIndex = 0; familyIndex < this.families.length; familyIndex += 1) {
      let slot = -1;
      for (let candidate = 0; candidate < MAX_CAPACITY; candidate += 1) {
        if (this.active[candidate] && this.familyIndex[candidate] === familyIndex) {
          slot = candidate;
          break;
        }
      }
      if (slot < 0) continue;
      const direction = directionFor(this.directionX[slot] ?? 0, this.directionZ[slot] ?? 1);
      const speed = this.speeds[slot] ?? 0;
      const scale = this.scales[slot] ?? 1;
      const cadence = speed * 4 / (Balance.anim.strideUnits * Math.max(0.1, scale) * Balance.anim.walkFpsPerSpeed);
      this.families[familyIndex]?.animator.update(
        delta,
        this.behaviors[slot] === 'slump' ? 'idle' : this.ages[slot] < STAND_SECONDS ? 'idle' : 'walk',
        direction,
        false,
        cadence,
        speed,
      );
    }
  }

  private syncMoths(): void {
    let instance = 0;
    let visible = false;
    for (let slot = 0; slot < MAX_CAPACITY; slot += 1) {
      if (!this.active[slot] || !this.moths[slot]) continue;
      visible = true;
      const age = this.ages[slot] ?? 0;
      let x = this.startX[slot] ?? 0;
      let z = this.startZ[slot] ?? 0;
      if (age > STAND_SECONDS) {
        const travel = Math.min((this.edgeDistance[slot] ?? 0) + 1.5, (age - STAND_SECONDS) * (this.speeds[slot] ?? 0));
        x += (this.directionX[slot] ?? 0) * travel;
        z += (this.directionZ[slot] ?? 0) * travel;
      }
      for (let mote = 0; mote < MOTH_MOTES; mote += 1) {
        const phase = age * (7 + mote) + slot * 1.7 + mote * 2.1;
        this.mothObject.position.set(
          x + Math.cos(phase) * (0.28 + mote * 0.08),
          Terrain.visualY(x, z, 0.65 + Math.sin(phase * 1.3) * 0.22),
          z + Math.sin(phase) * (0.28 + mote * 0.08),
        );
        this.mothObject.rotation.set(phase, phase * 0.7, phase * 1.1);
        this.mothObject.scale.setScalar((0.8 + mote * 0.18) * (this.opacities[slot] ?? 1));
        this.mothObject.updateMatrix();
        this.mothMesh.setMatrixAt(instance++, this.mothObject.matrix);
      }
    }
    for (; instance < this.mothMesh.count; instance += 1) this.mothMesh.setMatrixAt(instance, this.hiddenMatrix);
    this.mothMesh.visible = visible;
    this.mothMesh.instanceMatrix.needsUpdate = true;
  }

  private syncRunDust(): void {
    let instance = 0;
    for (let slot = 0; slot < MAX_CAPACITY; slot += 1) {
      const age = this.ages[slot] ?? 0;
      if (!this.active[slot] || this.behaviors[slot] !== 'run' || age <= STAND_SECONDS) continue;
      const travel = Math.min((this.edgeDistance[slot] ?? 0) + 1.5, (age - STAND_SECONDS) * (this.speeds[slot] ?? 0));
      const x = (this.startX[slot] ?? 0) + (this.directionX[slot] ?? 0) * travel;
      const z = (this.startZ[slot] ?? 0) + (this.directionZ[slot] ?? 0) * travel;
      for (let puff = 0; puff < RUN_DUST_PUFFS; puff += 1) {
        const trail = 0.45 + puff * 0.55;
        const pulse = 0.9 + Math.abs(Math.sin(age * 13 + slot * 1.7 + puff * 2.3)) * 0.5;
        this.runDustObject.position.set(
          x - (this.directionX[slot] ?? 0) * trail,
          Terrain.visualY(x, z, 0.035),
          z - (this.directionZ[slot] ?? 0) * trail,
        );
        this.runDustObject.rotation.set(-Math.PI / 2, 0, age * 2 + puff);
        this.runDustObject.scale.setScalar(pulse * (this.opacities[slot] ?? 1));
        this.runDustObject.updateMatrix();
        this.runDustMesh.setMatrixAt(instance++, this.runDustObject.matrix);
      }
    }
    const visible = instance > 0;
    for (; instance < this.runDustMesh.count; instance += 1) this.runDustMesh.setMatrixAt(instance, this.hiddenMatrix);
    this.runDustMesh.visible = visible;
    this.runDustMesh.instanceMatrix.needsUpdate = true;
  }

  private syncShutdownSmoke(): void {
    let instance = 0;
    for (let slot = 0; slot < MAX_CAPACITY; slot += 1) {
      const age = this.ages[slot] ?? 0;
      const slump = THREE.MathUtils.clamp((age - 0.48) / 0.9, 0, 1);
      if (!this.active[slot] || this.behaviors[slot] !== 'slump' || slump <= 0.1) continue;
      for (let puff = 0; puff < SHUTDOWN_SMOKE_PUFFS; puff += 1) {
        const phase = age * (2.4 + puff * 0.4) + slot * 1.3;
        this.shutdownSmokeObject.position.set(
          (this.startX[slot] ?? 0) + Math.sin(phase) * (0.1 + puff * 0.07),
          Terrain.visualY(this.startX[slot] ?? 0, this.startZ[slot] ?? 0, 0.58 + puff * 0.22 + age * 0.06),
          (this.startZ[slot] ?? 0) + Math.cos(phase) * (0.08 + puff * 0.05),
        );
        this.shutdownSmokeObject.rotation.set(phase, phase * 0.7, phase * 1.1);
        this.shutdownSmokeObject.scale.setScalar((0.75 + puff * 0.32) * slump * (this.opacities[slot] ?? 1));
        this.shutdownSmokeObject.updateMatrix();
        this.shutdownSmokeMesh.setMatrixAt(instance++, this.shutdownSmokeObject.matrix);
      }
    }
    const visible = instance > 0;
    for (; instance < this.shutdownSmokeMesh.count; instance += 1) this.shutdownSmokeMesh.setMatrixAt(instance, this.hiddenMatrix);
    this.shutdownSmokeMesh.visible = visible;
    this.shutdownSmokeMesh.instanceMatrix.needsUpdate = true;
  }

  private recycle(slot: number): void {
    if (this.active[slot]) this.diagnostics.active = Math.max(0, this.diagnostics.active - 1);
    this.active[slot] = false;
    this.moths[slot] = false;
    const family = this.families[this.familyIndex[slot] ?? -1];
    family?.sprites.hide(slot);
    family?.sprites.setTintScalar(slot, 1);
    this.familyIndex[slot] = -1;
    this.opacities[slot] = 1;
    this.rotations[slot] = 0;
  }

  private installDiagnosticsSurface(): void {
    if (typeof window === 'undefined') return;
    this.diagnosticsValue = window.__THREE_GAME_DIAGNOSTICS__;
    Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', {
      configurable: true,
      get: () => this.diagnosticsValue,
      set: (value: ThreeGameDiagnostics | undefined) => {
        this.diagnosticsValue = value;
        this.publishDiagnostics();
      },
    });
  }

  private publishDiagnostics(): void {
    if (this.diagnosticsValue) this.diagnosticsValue.freedWalkers = this.diagnostics;
  }

  private uninstallDiagnosticsSurface(): void {
    if (typeof window === 'undefined') return;
    Object.defineProperty(window, '__THREE_GAME_DIAGNOSTICS__', {
      configurable: true,
      writable: true,
      value: this.diagnosticsValue,
    });
  }
}

function behaviorFor(variantId: string | null): FreedWalkerBehavior {
  return variantId ? FREED_WALKER_BEHAVIORS[variantId as keyof typeof FREED_WALKER_BEHAVIORS] ?? 'run' : 'run';
}

function visualFamilyFor(enemy: ClaimJumperEnemy): VisualFamily {
  if (enemy.variantId === 'rail_tough' || enemy.variantId === 'steam_wrecker' || enemy.variantId === 'coal_thief') return enemy.variantId;
  return enemy.isThief ? 'thief' : 'base';
}

function nearestEdgeDirection(x: number, z: number): { x: number; z: number; distance: number } {
  const west = Math.max(0, x - Terrain.bounds.minX);
  const east = Math.max(0, Terrain.bounds.maxX - x);
  const south = Math.max(0, z - Terrain.bounds.minZ);
  const north = Math.max(0, Terrain.bounds.maxZ - z);
  const distance = Math.min(west, east, south, north);
  if (distance === west) return { x: -1, z: 0, distance };
  if (distance === east) return { x: 1, z: 0, distance };
  if (distance === south) return { x: 0, z: -1, distance };
  return { x: 0, z: 1, distance };
}

function directionFor(x: number, z: number): (typeof rotationDirections)[number] {
  const degrees = ((Math.atan2(x, z) * 180) / Math.PI + 360) % 360;
  return rotationDirections[Math.round(degrees / 45) & 7] ?? 's';
}

function freedWalkerCap(): number {
  const tierCap = performanceTierDiagnostics().config.freedWalkerCap;
  const params = new URLSearchParams(globalThis.location?.search ?? '');
  if (!params.has('debug')) return tierCap;
  const raw = params.get('fwcap');
  if (raw === null) return tierCap;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.min(MAX_CAPACITY, Math.floor(value)) : tierCap;
}
