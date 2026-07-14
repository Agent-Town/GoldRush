import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import type { LightSource } from './LightField';

const VARIANT = 'moth_swarm';
const MAX_MOTES_PER_SWARM = 3;

type MothState = {
  enemy: ClaimJumperEnemy;
  targetId: string | null;
  attached: boolean;
  lastHp: number;
  scatterSeconds: number;
  attachDamageSeconds: number;
};

export type MothTargetingConfig = Readonly<{
  radiusWeight: number;
  attachDamagePerSecond: number;
}>;

export class MothSwarm {
  readonly group = new THREE.Group();
  private readonly states = new Map<number, MothState>();
  private readonly geometry = new THREE.TetrahedronGeometry(0.14, 0);
  private readonly material = new THREE.MeshStandardMaterial({ color: '#e8d8b0', emissive: '#c4883a', emissiveIntensity: 0.5, roughness: 0.82 });
  private readonly mesh: THREE.InstancedMesh;
  private readonly motesPerSwarm = globalThis.matchMedia?.('(pointer: coarse), (max-width: 760px)').matches ? 2 : MAX_MOTES_PER_SWARM;
  private readonly object = new THREE.Object3D();
  private readonly hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  private elapsed = 0;
  private sources: readonly LightSource[] = [];

  constructor(
    private readonly enabled: boolean,
    capacity: number,
    private readonly coverageAt: (x: number, z: number) => number,
    private readonly config: MothTargetingConfig = { radiusWeight: 1, attachDamagePerSecond: 0 },
    private readonly damageSource: (sourceId: string, amount: number) => void = () => {},
  ) {
    this.group.name = 'MothSwarmPool';
    this.group.visible = enabled;
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, capacity * MAX_MOTES_PER_SWARM);
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);
    this.hideUnused();
  }

  spawn(pool: EnemyPool, count: number, x: number, z: number): number {
    if (!this.enabled) return 0;
    let spawned = 0;
    for (let index = 0; index < Math.max(0, Math.floor(count)); index += 1) {
      const angle = index * 2.399963;
      const enemy = pool.spawn(new THREE.Vector3(x + Math.cos(angle) * 1.4, 0, z + Math.sin(angle) * 1.4), {
        variantId: VARIANT,
        variantLabel: 'Fever Moths',
        hpScale: 0.3,
        speedScale: 1.6,
        visualScale: 0.6,
        contactDamageScale: 0,
        buildingDamageScale: 0,
        supportBuildingDamageScale: 0,
        tint: '#e8d8b0',
      });
      if (!enemy) break;
      this.states.set(enemy.id, { enemy, targetId: null, attached: false, lastHp: enemy.currentHp, scatterSeconds: 0, attachDamageSeconds: 0 });
      spawned += 1;
    }
    return spawned;
  }

  update(delta: number, sources: readonly LightSource[], enemies: readonly ClaimJumperEnemy[]): void {
    if (!this.enabled) return;
    this.elapsed += delta;
    this.sources = sources;
    for (const enemy of enemies) {
      if (enemy.isAlive && enemy.variantId === VARIANT && !this.states.has(enemy.id)) {
        this.states.set(enemy.id, { enemy, targetId: null, attached: false, lastHp: enemy.currentHp, scatterSeconds: 0, attachDamageSeconds: 0 });
      }
    }
    const byId = new Map(sources.map((source) => [source.id, source]));
    const targetScore = (source: LightSource) => this.coverageAt(source.x, source.z) * source.radius * this.config.radiusWeight * (source.targetWeight ?? 1);
    const brightest = [...sources].sort((a, b) => targetScore(b) - targetScore(a) || a.id.localeCompare(b.id))[0];

    for (const [id, state] of this.states) {
      const { enemy } = state;
      if (!enemy.isAlive || enemy.variantId !== VARIANT) {
        this.states.delete(id);
        continue;
      }
      if (enemy.currentHp < state.lastHp) {
        const target = state.targetId ? byId.get(state.targetId) : undefined;
        const awayX = enemy.position.x - (target?.x ?? enemy.position.x - 1);
        const awayZ = enemy.position.z - (target?.z ?? enemy.position.z);
        const length = Math.hypot(awayX, awayZ) || 1;
        enemy.scriptMoveTo(enemy.position.x + awayX / length * 5, enemy.position.z + awayZ / length * 5, 7, { ignoreTerrain: true });
        state.attached = false;
        state.targetId = null;
        state.scatterSeconds = 0.8;
        state.attachDamageSeconds = 0;
      }
      state.lastHp = enemy.currentHp;
      if (state.scatterSeconds > 0) {
        state.scatterSeconds = Math.max(0, state.scatterSeconds - delta);
        continue;
      }
      const target = (state.targetId ? byId.get(state.targetId) : undefined) ?? brightest;
      if (!target) continue;
      state.targetId = target.id;
      state.attached = Math.hypot(enemy.position.x - target.x, enemy.position.z - target.z) <= 0.65;
      enemy.scriptMoveTo(target.x, target.z, state.attached ? 0 : 5.2, { ignoreTerrain: true });
      state.attachDamageSeconds = state.attached ? state.attachDamageSeconds + delta : 0;
      while (state.attachDamageSeconds >= 1) {
        this.damageSource(target.id, this.config.attachDamagePerSecond);
        state.attachDamageSeconds -= 1;
      }
    }
    this.syncVisuals();
  }

  dimSources(sources: readonly LightSource[]): LightSource[] {
    return sources.map((source) => {
      let attached = 0;
      for (const state of this.states.values()) if (state.enemy.isAlive && state.attached && state.targetId === source.id) attached += 1;
      return { ...source, radius: source.radius * Math.max(0.35, 1 - attached * 0.3) };
    });
  }

  diagnostics() {
    const alive = [...this.states.values()].filter((state) => state.enemy.isAlive);
    const attached = alive.filter((state) => state.attached);
    const sourceId = attached[0]?.targetId ?? null;
    const source = this.sources.find((candidate) => candidate.id === sourceId);
    const attachCounts = this.sources.map((candidate) => ({
      sourceId: candidate.id,
      count: attached.filter((state) => state.targetId === candidate.id).length,
      radius: candidate.radius,
      targetWeight: candidate.targetWeight ?? 1,
    }));
    return {
      enabled: this.enabled,
      alive: alive.length,
      attached: attached.length,
      sourceId,
      baseRadius: source?.radius ?? 0,
      effectiveRadius: source ? this.dimSources([source])[0]!.radius : 0,
      attachCounts,
    };
  }

  reset(): void {
    this.states.clear();
    this.sources = [];
    this.hideUnused();
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private syncVisuals(): void {
    let instance = 0;
    for (const state of this.states.values()) {
      if (!state.enemy.isAlive) continue;
      for (let mote = 0; mote < this.motesPerSwarm; mote += 1) {
        const phase = this.elapsed * (7 + mote) + state.enemy.id * 1.7 + mote * 2.1;
        this.object.position.set(state.enemy.position.x + Math.cos(phase) * (0.28 + mote * 0.08), state.enemy.position.y + 0.65 + Math.sin(phase * 1.3) * 0.22, state.enemy.position.z + Math.sin(phase) * (0.28 + mote * 0.08));
        this.object.rotation.set(phase, phase * 0.7, phase * 1.1);
        this.object.scale.setScalar(0.8 + mote * 0.18);
        this.object.updateMatrix();
        this.mesh.setMatrixAt(instance++, this.object.matrix);
      }
    }
    for (; instance < this.mesh.count; instance += 1) this.mesh.setMatrixAt(instance, this.hidden);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private hideUnused(): void {
    for (let index = 0; index < this.mesh.count; index += 1) this.mesh.setMatrixAt(index, this.hidden);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export function isMothSwarmEnemy(enemy: Pick<ClaimJumperEnemy, 'variantId'>): boolean {
  return enemy.variantId === VARIANT;
}
