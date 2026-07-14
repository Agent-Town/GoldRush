import * as THREE from 'three';
import type { Hero } from '../entities/Hero';
import { RenderLayers } from '../core/RenderLayers';
import type { TerrainBounds, TerrainSample } from '../world/Terrain';

export type DamSurgePhase = 'idle' | 'telegraph' | 'sweep';

export type DamSurgeLogEntry = {
  type: 'telegraph' | 'sweep' | 'hit' | 'clear';
  at: number;
  actor?: number;
  x?: number;
  z?: number;
};

export type DamSurgeDiagnostics = {
  phase: DamSurgePhase;
  active: boolean;
  telegraphSeconds: number;
  sweepSeconds: number;
  frontX: number;
  damage: number;
  push: number;
  hits: number;
  marksVisible: boolean;
  fieldVisible: boolean;
  log: DamSurgeLogEntry[];
};

type DamSurgeActor = Pick<Hero, 'group' | 'velocity'>;

const TELEGRAPH_SECONDS = 2;
const SWEEP_SECONDS = 2.4;
const DAMAGE = 12;
const PUSH = 5;
const FRONT_HALF_WIDTH = 1.8;
const SOURCE_ID = -3007;

export class DamSurgeEvent {
  readonly group = new THREE.Group();

  private readonly marks = new THREE.Group();
  private readonly field: THREE.Mesh;
  private readonly debris: THREE.Mesh[] = [];
  private readonly log: DamSurgeLogEntry[] = [];
  private readonly hitActors = new Set<number>();
  private phase: DamSurgePhase = 'idle';
  private triggeredAt = 0;
  private frontX: number;
  private lastFrontX: number;

  constructor(
    private readonly actors: readonly DamSurgeActor[],
    private readonly bounds: TerrainBounds,
    private readonly sampleTerrain: (x: number, z: number) => TerrainSample,
    private readonly damageActor: (actorIndex: number, amount: number, sourceId: number) => void,
  ) {
    this.frontX = bounds.minX;
    this.lastFrontX = bounds.minX;
    this.group.name = 'DamSurgeEvent';

    const markGeometry = new THREE.RingGeometry(0.85, 1.08, 24);
    const markMaterial = new THREE.MeshBasicMaterial({ color: '#c4883a', transparent: true, opacity: 0.8, depthWrite: false });
    for (let x = bounds.minX + 4; x <= bounds.maxX - 4; x += 8) {
      const mark = new THREE.Mesh(markGeometry, markMaterial);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(x, 0.08, 0);
      mark.renderOrder = RenderLayers.groundDecals;
      this.marks.add(mark);
    }

    this.field = new THREE.Mesh(
      new THREE.BoxGeometry(FRONT_HALF_WIDTH * 2, 0.18, 12.5),
      new THREE.MeshStandardMaterial({ color: '#6b9aa0', emissive: '#315f66', emissiveIntensity: 0.45, transparent: true, opacity: 0.46 }),
    );
    this.field.position.y = 0.11;
    this.field.renderOrder = RenderLayers.gameplay;
    for (let band = 0; band < 3; band += 1) {
      const points = Array.from({ length: 13 }, (_, index) => new THREE.Vector3(-1.15 + band * 1.05 + Math.sin(index * 1.7 + band) * 0.16, 0.2, index - 6));
      const crest = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: band === 1 ? '#ffe4a0' : '#e8d5a8', transparent: true, opacity: 0.78 }),
      );
      this.field.add(crest);
    }
    for (let index = 0; index < 6; index += 1) {
      const piece = new THREE.Mesh(
        new THREE.BoxGeometry(0.25 + (index % 3) * 0.12, 0.18, 0.5),
        new THREE.MeshStandardMaterial({ color: index % 2 ? '#8b7d3c' : '#7a4d2b', roughness: 0.9 }),
      );
      piece.position.set((index - 2.5) * 0.34, 0.2, -4.5 + index * 1.8);
      this.field.add(piece);
      this.debris.push(piece);
    }
    this.group.add(this.marks, this.field);
    this.reset();
  }

  trigger(at: number): boolean {
    if (this.phase !== 'idle') return false;
    this.triggeredAt = at;
    this.phase = 'telegraph';
    this.frontX = this.bounds.minX;
    this.lastFrontX = this.bounds.minX;
    this.hitActors.clear();
    this.log.push({ type: 'telegraph', at: round3(at) });
    this.syncVisual(at);
    return true;
  }

  update(at: number): void {
    if (this.phase === 'idle') return;
    const sweepAt = this.triggeredAt + TELEGRAPH_SECONDS;
    const clearAt = sweepAt + SWEEP_SECONDS;
    if (this.phase === 'telegraph' && at >= sweepAt) {
      this.phase = 'sweep';
      this.log.push({ type: 'sweep', at: round3(sweepAt) });
    }
    if (this.phase === 'sweep') this.updateSweep(Math.min(at, clearAt), sweepAt);
    if (at >= clearAt) {
      this.phase = 'idle';
      this.log.push({ type: 'clear', at: round3(clearAt) });
    }
    this.syncVisual(at);
  }

  reset(): void {
    this.phase = 'idle';
    this.triggeredAt = 0;
    this.frontX = this.bounds.minX;
    this.lastFrontX = this.bounds.minX;
    this.hitActors.clear();
    this.log.length = 0;
    this.syncVisual(0);
  }

  diagnostics(): DamSurgeDiagnostics {
    return {
      phase: this.phase,
      active: this.phase !== 'idle',
      telegraphSeconds: TELEGRAPH_SECONDS,
      sweepSeconds: SWEEP_SECONDS,
      frontX: round3(this.frontX),
      damage: DAMAGE,
      push: PUSH,
      hits: this.hitActors.size,
      marksVisible: this.marks.visible,
      fieldVisible: this.field.visible,
      log: this.log.map((entry) => ({ ...entry })),
    };
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.dispose();
    });
    this.group.clear();
  }

  private updateSweep(at: number, sweepAt: number): void {
    const progress = THREE.MathUtils.clamp((at - sweepAt) / SWEEP_SECONDS, 0, 1);
    this.frontX = THREE.MathUtils.lerp(this.bounds.minX, this.bounds.maxX, progress);
    for (let index = 0; index < this.actors.length; index += 1) {
      const actor = this.actors[index];
      if (!actor?.group.visible || this.hitActors.has(index)) continue;
      const position = actor.group.position;
      if (position.x < this.lastFrontX - FRONT_HALF_WIDTH || position.x > this.frontX + FRONT_HALF_WIDTH) continue;
      if (this.sampleTerrain(position.x, position.z).waterSource !== 'river') continue;
      const hitX = position.x;
      const hitZ = position.z;
      this.hitActors.add(index);
      this.damageActor(index, DAMAGE, SOURCE_ID);
      actor.group.position.x = THREE.MathUtils.clamp(hitX + PUSH, this.bounds.minX, this.bounds.maxX);
      actor.velocity.x += PUSH;
      this.log.push({ type: 'hit', at: round3(at), actor: index, x: round3(hitX), z: round3(hitZ) });
    }
    this.lastFrontX = this.frontX;
  }

  private syncVisual(at: number): void {
    this.marks.visible = this.phase === 'telegraph';
    this.field.visible = this.phase === 'sweep';
    if (this.marks.visible) {
      const pulse = 0.82 + Math.sin((at - this.triggeredAt) * 8) * 0.12;
      this.marks.scale.setScalar(pulse);
    }
    if (!this.field.visible) return;
    this.field.position.x = this.frontX;
    for (let index = 0; index < this.debris.length; index += 1) {
      const piece = this.debris[index];
      piece.rotation.y = at * (1.5 + index * 0.2);
      piece.rotation.z = Math.sin(at * 3 + index) * 0.25;
    }
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
